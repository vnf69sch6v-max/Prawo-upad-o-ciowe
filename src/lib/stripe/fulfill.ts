// Zaksięgowanie opłaconej sesji: jedna transakcja na `payments/{cs}` i `savori_access/{uid}`,
// potem claims ze świeżego odczytu Auth (nie ze snapshotu sprzed transakcji).
// Powtórka tej samej sesji nie przedłuża dostępu drugi raz. Treść idzie przez `toStored` (ścieżka = AAD).
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { PlanId } from '@/lib/access';
import { ADMIN_UNTIL } from '@/lib/auth/grant';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { docLegacy, fromStored, toStored } from '@/lib/data-seal';
import { addCalendarMonths, planById, extendAccess, type PaidSession } from '@/lib/stripe/billing';

export class PaymentError extends Error {
    constructor(readonly code: 'not-configured' | 'user-missing' | 'unreadable' | 'conflict') {
        super(code);
        this.name = 'PaymentError';
    }
}

/** Koniec dostępu przypięty do konta. Przedrostek jak `savori_users` — w projekcie Firebase są też cudze kolekcje. */
export const ACCESS_COLLECTION = 'savori_access';

export interface AccessGrant {
    accessUntil: number;
    plan: PlanId;
    updatedAt: number;
}

export interface PaymentRecord {
    uid: string;
    plan: PlanId;
    amount: number;
    currency: 'pln';
    accessUntil: number;
    email: string | null;
    livemode: boolean;
    at: string;
}

function claimUntil(claims: Record<string, unknown> | undefined): number {
    const value = claims?.accessUntil;
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function asRecord(value: unknown): PaymentRecord | null {
    if (!value || typeof value !== 'object') return null;
    const row = value as Partial<PaymentRecord>;
    const plan = planById(row.plan);
    if (!plan || typeof row.uid !== 'string' || typeof row.accessUntil !== 'number' || !Number.isFinite(row.accessUntil)) return null;
    return {
        uid: row.uid,
        plan: plan.id,
        amount: typeof row.amount === 'number' ? row.amount : 0,
        currency: 'pln',
        accessUntil: row.accessUntil,
        email: typeof row.email === 'string' ? row.email : null,
        livemode: row.livemode === true,
        at: typeof row.at === 'string' ? row.at : '',
    };
}

function asAccess(value: unknown): { accessUntil: number; plan: PlanId } | null {
    if (!value || typeof value !== 'object') return null;
    const row = value as { accessUntil?: unknown; plan?: unknown };
    const plan = planById(row.plan);
    if (!plan || typeof row.accessUntil !== 'number' || !Number.isFinite(row.accessUntil)) return null;
    return { accessUntil: row.accessUntil, plan: plan.id };
}

/**
 * Claims = wartość z `savori_access` (albo z właśnie zaksięgowanej płatności, gdy dokumentu jeszcze nie ma),
 * nigdy krócej niż to, co już jest w Auth. Dostęp administratora zostaje. `getUser` tuż przed zapisem —
 * nie używamy użytkownika przeczytanego przed transakcją. Drugi przebieg łapie równoległe księgowanie,
 * które zdążyło podnieść dokument między odczytem a `setCustomUserClaims`.
 */
async function syncClaims(auth: Auth, db: Firestore, uid: string, plan: PlanId, accessUntil: number): Promise<void> {
    const path = `${ACCESS_COLLECTION}/${uid}`;
    for (let pass = 0; pass < 2; pass++) {
        const snap = await db.collection(ACCESS_COLLECTION).doc(uid).get();
        let storedUntil = accessUntil;
        let storedPlan = plan;
        if (snap.exists) {
            const row = asAccess(fromStored<unknown>(path, snap.data(), docLegacy.read)?.value);
            if (row) {
                storedUntil = row.accessUntil;
                storedPlan = row.plan;
            }
        }
        let user;
        try {
            user = await auth.getUser(uid);
        } catch (err) {
            if ((err as { code?: string }).code === 'auth/user-not-found') throw new PaymentError('user-missing');
            throw err;
        }
        const claims = { ...(user.customClaims ?? {}) };
        const current = claimUntil(claims);
        if (current >= ADMIN_UNTIL || storedUntil >= ADMIN_UNTIL) return;
        if (current > storedUntil) return;
        if (current === storedUntil && claims.plan === storedPlan) return;
        await auth.setCustomUserClaims(uid, { ...claims, plan: storedPlan, accessUntil: storedUntil });
    }
}

/**
 * Zapis płatności i przedłużenie `accessUntil`. `already` = ta sesja była już zaksięgowana
 * (koniec dostępu bierzemy z dokumentu płatności, nie liczymy miesięcy od nowa).
 * Baza przedłużenia: `savori_access.accessUntil`, a gdy dokumentu nie ma — claims (seed tylko wtedy).
 */
export async function fulfillPaidSession(paid: PaidSession, nowMs = Date.now()): Promise<{ accessUntil: number; already: boolean; plan: PlanId }> {
    const db = getAdminDb();
    const auth = getAdminAuth();
    if (!db || !auth) throw new PaymentError('not-configured');

    const plan = planById(paid.plan);
    if (!plan) throw new PaymentError('unreadable');

    let seedUser;
    try {
        seedUser = await auth.getUser(paid.uid);
    } catch (err) {
        if ((err as { code?: string }).code === 'auth/user-not-found') throw new PaymentError('user-missing');
        throw err;
    }
    // Seed tylko gdy w transakcji nie ma jeszcze `savori_access`. Ponowienie transakcji widzi dokument
    // i nie używa tego snapshotu — inaczej dwie równoległe sesje liczyłyby od tej samej bazy.
    const seedUntil = claimUntil(seedUser.customClaims);

    const payPath = `payments/${paid.id}`;
    const payRef = db.collection('payments').doc(paid.id);
    const accPath = `${ACCESS_COLLECTION}/${paid.uid}`;
    const accRef = db.collection(ACCESS_COLLECTION).doc(paid.uid);
    const nowS = Math.floor(nowMs / 1000);

    let accessUntil = 0;
    let storedPlan: PlanId = plan.id;
    let already = false;

    await db.runTransaction(async (tx) => {
        const paySnap = await tx.get(payRef);
        if (paySnap.exists) {
            const opened = fromStored<unknown>(payPath, paySnap.data(), docLegacy.read);
            const row = asRecord(opened?.value);
            if (!row) throw new PaymentError('unreadable');
            if (row.uid !== paid.uid) throw new PaymentError('conflict');
            accessUntil = row.accessUntil;
            storedPlan = row.plan;
            already = true;
            return;
        }

        const accSnap = await tx.get(accRef);
        let base = seedUntil;
        if (accSnap.exists) {
            const opened = fromStored<unknown>(accPath, accSnap.data(), docLegacy.read);
            const row = asAccess(opened?.value);
            if (!row) throw new PaymentError('unreadable');
            base = row.accessUntil;
        }
        // U administratora claims zostają (rok 2100). W dokumentach zapisujemy zwykły koniec okresu,
        // żeby powtórka nie przywróciła dostępu administratora po zdjęciu adresu z listy.
        const computed = base >= ADMIN_UNTIL ? addCalendarMonths(nowS, plan.months) : extendAccess(base, nowS, plan.months);
        accessUntil = computed;
        storedPlan = plan.id;
        already = false;

        const record: PaymentRecord = {
            uid: paid.uid,
            plan: plan.id,
            amount: paid.amount,
            currency: 'pln',
            accessUntil: computed,
            email: paid.email,
            livemode: paid.livemode,
            at: new Date(nowMs).toISOString(),
        };
        const grant: AccessGrant = { accessUntil: computed, plan: plan.id, updatedAt: nowMs };
        tx.set(payRef, toStored(payPath, record, nowMs, docLegacy.write));
        tx.set(accRef, toStored(accPath, grant, nowMs, docLegacy.write));
    });

    await syncClaims(auth, db, paid.uid, storedPlan, accessUntil);
    return { accessUntil, already, plan: storedPlan };
}
