// Dziennik webhooka Stripe w Firestore (`health/stripe_webhook`).
// Ostatnie zdarzenie, ostatnie udane księgowanie i liczniki od zera.
// Bez e-maila i bez treści żądania — tylko rodzaj, czas, identyfikator sesji i typ zdarzenia.
// Zapis nigdy nie rzuca: błąd dziennika nie może zmienić kodu odpowiedzi webhooka.
// Cały dokument jest szyfrowany (transakcja odczyt–zmiana–zapis, jak `recordCronRun`).
import { getAdminDb } from '@/lib/firebase/admin';
import { docLegacy, fromStored, toStored } from '@/lib/data-seal';
import type { PaymentEvent, PaymentEventKind, PaymentHealth } from '@/lib/freshness';

export type { PaymentEvent, PaymentEventKind, PaymentHealth } from '@/lib/freshness';

const DOC = { collection: 'health', id: 'stripe_webhook' } as const;
const PATH = `${DOC.collection}/${DOC.id}`;

const KIND_SET: Record<PaymentEventKind, true> = {
    ok: true,
    already: true,
    pending: true,
    'bad-signature': true,
    'not-configured': true,
    livemode: true,
    ignored: true,
    'user-missing': true,
    failed: true,
};

function emptyCounts(): Record<PaymentEventKind, number> {
    return {
        ok: 0,
        already: 0,
        pending: 0,
        'bad-signature': 0,
        'not-configured': 0,
        livemode: 0,
        ignored: 0,
        'user-missing': 0,
        failed: 0,
    };
}

function asKind(value: unknown): PaymentEventKind | null {
    return typeof value === 'string' && Object.hasOwn(KIND_SET, value) ? (value as PaymentEventKind) : null;
}

function asEvent(value: unknown): PaymentEvent | null {
    if (!value || typeof value !== 'object') return null;
    const row = value as Partial<PaymentEvent>;
    const kind = asKind(row.kind);
    if (!kind || typeof row.at !== 'string' || !row.at) return null;
    const out: PaymentEvent = { at: row.at, kind };
    if (typeof row.sessionId === 'string' && row.sessionId.length <= 255) out.sessionId = row.sessionId;
    if (typeof row.eventType === 'string' && row.eventType.length <= 80) out.eventType = row.eventType;
    return out;
}

function asLastOk(value: unknown): PaymentHealth['lastOk'] {
    if (!value || typeof value !== 'object') return null;
    const row = value as { at?: unknown; sessionId?: unknown };
    if (typeof row.at !== 'string' || !row.at) return null;
    if (typeof row.sessionId === 'string' && row.sessionId.length <= 255) return { at: row.at, sessionId: row.sessionId };
    return { at: row.at };
}

function healthOf(data: Record<string, unknown> | undefined): PaymentHealth {
    const value = fromStored<Partial<PaymentHealth>>(PATH, data, docLegacy.read)?.value;
    const counts = emptyCounts();
    const raw = value?.counts;
    if (raw && typeof raw === 'object') {
        for (const kind of Object.keys(counts) as PaymentEventKind[]) {
            const n = raw[kind];
            if (typeof n === 'number' && Number.isFinite(n) && n >= 0) counts[kind] = Math.floor(n);
        }
    }
    return { last: asEvent(value?.last), lastOk: asLastOk(value?.lastOk), counts };
}

function compact(event: { at: string; kind: PaymentEventKind; sessionId?: string; eventType?: string }): PaymentEvent {
    const last: PaymentEvent = { at: event.at, kind: event.kind };
    if (event.sessionId) last.sessionId = event.sessionId;
    if (event.eventType) last.eventType = event.eventType;
    return last;
}

/**
 * Dopisuje wynik webhooka. Bez Firestore (tryb demo) nic nie robi.
 * Błąd odczytu albo zapisu jest logowany i połykany — wołający i tak zwraca już wybrany status.
 */
export async function recordPaymentEvent(event: {
    at: string;
    kind: PaymentEventKind;
    sessionId?: string;
    eventType?: string;
}): Promise<void> {
    if (!event.at || !asKind(event.kind)) return;
    const db = getAdminDb();
    if (!db) return;
    try {
        const ref = db.collection(DOC.collection).doc(DOC.id);
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            const cur = healthOf(snap.exists ? snap.data() : undefined);
            const counts = { ...cur.counts, [event.kind]: cur.counts[event.kind] + 1 };
            const last = compact(event);
            const lastOk = event.kind === 'ok'
                ? (event.sessionId ? { at: event.at, sessionId: event.sessionId } : { at: event.at })
                : cur.lastOk;
            tx.set(ref, toStored(PATH, { last, lastOk, counts }, Date.now(), docLegacy.write));
        });
    } catch (err) {
        console.error('[stripe/health]', String(err).slice(0, 200));
    }
}

/** `null` = brak Firestore albo błąd odczytu. Pusty dziennik to obiekt z `last: null`, nie `null`. */
export async function readPaymentHealth(): Promise<PaymentHealth | null> {
    const db = getAdminDb();
    if (!db) return null;
    try {
        const snap = await db.collection(DOC.collection).doc(DOC.id).get();
        if (!snap.exists) return { last: null, lastOk: null, counts: emptyCounts() };
        return healthOf(snap.data());
    } catch (err) {
        console.error('[stripe/health] read:', String(err).slice(0, 200));
        return null;
    }
}
