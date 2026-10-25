// Zaksięgowanie opłaconej sesji: jeden zapis na identyfikator sesji (transakcja), potem claims.
// Powtórka webhooka albo powrót użytkownika nie przedłuża dostępu drugi raz. Treść idzie przez `toStored`.
import type { Auth } from 'firebase-admin/auth';
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

async function syncClaims(auth: Auth, uid: string, plan: PlanId, accessUntil: number): Promise<void> {
    const user = await auth.getUser(uid);
    const claims = { ...(user.customClaims ?? {}) };
    const current = claimUntil(claims);
    // Płatność nie nadaje ani nie odbiera dostępu administratora i nie skraca dłuższego planu.
    if (current >= ADMIN_UNTIL || accessUntil >= ADMIN_UNTIL) return;
    if (current > accessUntil) return;
    if (current === accessUntil && claims.plan === plan) return;
    await auth.setCustomUserClaims(uid, { ...claims, plan, accessUntil });
}

/**
 * Zapis płatności i przedłużenie `accessUntil`. `already` = ta sesja była już zaksięgowana
 * (koniec dostępu bierzemy z dokumentu, nie liczymy miesięcy od nowa).
 */
export async function fulfillPaidSession(paid: PaidSession, nowMs = Date.now()): Promise<{ accessUntil: number; already: boolean; plan: PlanId }> {
    const db = getAdminDb();
    const auth = getAdminAuth();
    if (!db || !auth) throw new PaymentError('not-configured');

    const plan = planById(paid.plan);
    if (!plan) throw new PaymentError('unreadable');

    let user;
    try {
        user = await auth.getUser(paid.uid);
    } catch (err) {
        if ((err as { code?: string }).code === 'auth/user-not-found') throw new PaymentError('user-missing');
        throw err;
    }

    const path = `payments/${paid.id}`;
    const ref = db.collection('payments').doc(paid.id);
    const nowS = Math.floor(nowMs / 1000);
    const current = claimUntil(user.customClaims);
    // U administratora claims zostają (rok 2100). W dokumencie zapisujemy zwykły koniec okresu,
    // żeby powtórka webhooka nie przywróciła dostępu administratora po zdjęciu adresu z listy.
    const computed = current >= ADMIN_UNTIL ? addCalendarMonths(nowS, plan.months) : extendAccess(current, nowS, plan.months);

    let accessUntil = computed;
    let storedPlan: PlanId = plan.id;
    let already = false;

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) {
            const opened = fromStored<unknown>(path, snap.data(), docLegacy.read);
            const row = asRecord(opened?.value);
            if (!row) throw new PaymentError('unreadable');
            if (row.uid !== paid.uid) throw new PaymentError('conflict');
            accessUntil = row.accessUntil;
            storedPlan = row.plan;
            already = true;
            return;
        }
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
        tx.set(ref, toStored(path, record, nowMs, docLegacy.write));
    });

    await syncClaims(auth, paid.uid, storedPlan, accessUntil);
    return { accessUntil, already, plan: storedPlan };
}
