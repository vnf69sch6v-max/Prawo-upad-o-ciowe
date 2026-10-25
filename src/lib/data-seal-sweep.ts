// Migracja do szyfrowania: dokumenty zapisane jawnie przed ustawieniem DATA_ENCRYPTION_KEY dostają `sealed`,
// a po rotacji klucza (DATA_ENCRYPTION_KEY_PREVIOUS) wpisy starym kluczem są przepisywane nowym.
// Cache z krótkim TTL i tak nadpisuje się sam w ciągu doby, ale archiwum newsów (dzień = dokument) nigdy —
// bez tego zostałoby jawne na zawsze. Uruchamia ją cron `freshness` najwyżej co 6 h; wynik w `health/seal_state`
// (też zaszyfrowany) pokazuje /api/health/freshness → `encryption.lastSweep`. Gdy dwa kolejne przebiegi mają
// `legacy: 0`, `truncated: false` i `failed: 0`, można włączyć DATA_ENCRYPTION_STRICT=1 (jawne wpisy odrzucane).
//
// Dotyka WYŁĄCZNIE dokumentów tej aplikacji: kolekcji z `CACHE_COLLECTIONS` w kształcie cache (`payload`), znanych
// dokumentów `health/*` i kont użytkowników (`savori_users/*` — nazwa z przedrostkiem, więc cała kolekcja jest nasza).
// Projekt Firebase może mieć dane innej aplikacji — tych nie czytamy ani nie zmieniamy.
import { FieldPath, type DocumentReference, type Firestore, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { docLegacy, fromStored, open, seal, sealConfig, sealedWithActiveKey, storedUpdatedAt, toStored } from '@/lib/data-seal';
import { CACHE_COLLECTIONS, SEALED_CACHE_EXTRA } from '@/lib/server-cache';
import { USER_COLLECTION } from '@/lib/user-data';

export const SEAL_STATE = { collection: 'health', id: 'seal_state' } as const;
/** Dokumenty `health/*`, które zapisuje aplikacja (cron-log, cron/freshness, ta migracja). */
export const HEALTH_DOCS = ['cron_runs', 'freshness_latest', 'freshness_history', SEAL_STATE.id] as const;
const STATE_PATH = `${SEAL_STATE.collection}/${SEAL_STATE.id}`;
const SWEEP_EVERY_MS = 6 * 3600_000;
/** Dokument do ~1 MiB — strona po 50 to w najgorszym razie ~50 MB pamięci funkcji. */
const PAGE = 50;

export interface SweepResult {
    /** Start przebiegu (też blokada „co 6 h”). */
    at: string;
    /** Przejrzane dokumenty aplikacji. */
    scanned: number;
    /** Jawne dokumenty znalezione w tym przebiegu (przed konwersją). */
    legacy: number;
    /** Zaszyfrowane w tym przebiegu. */
    sealed: number;
    /** Zaszyfrowane poprzednim kluczem i przepisane aktywnym (rotacja). */
    rotated: number;
    failed: number;
    /** Przerwane przez limit czasu albo zapisów — reszta w kolejnym przebiegu. */
    truncated: boolean;
}

type Shape = 'cache' | 'doc';

/** Treść jawnego dokumentu: `payload` w cache, cały dokument bez `updatedAt` w `health/*`. */
function legacyValue(shape: Shape, data: Record<string, unknown>): unknown {
    return shape === 'cache' ? data.payload : docLegacy.read(data);
}

/** Czy jest co robić: jawny dokument w naszym kształcie albo szyfrogram poprzednim kluczem. */
function needsWork(shape: Shape, data: Record<string, unknown>, cfg: ReturnType<typeof sealConfig>): 'seal' | 'rotate' | null {
    if (data.sealed === undefined) return shape === 'cache' && !('payload' in data) ? null : 'seal';
    return !sealedWithActiveKey(data.sealed, cfg) && cfg.previous ? 'rotate' : null;
}

const readState = (data: Record<string, unknown> | undefined) =>
    fromStored<SweepResult>(STATE_PATH, data, (d) => docLegacy.read(d) as unknown as SweepResult)?.value ?? null;

export async function sweepLegacyDocs(
    db: Firestore,
    { maxWrites = 300, deadline = Date.now() + 45_000 }: { maxWrites?: number; deadline?: number } = {},
): Promise<SweepResult> {
    const cfg = sealConfig();
    const res: SweepResult = { at: new Date().toISOString(), scanned: 0, legacy: 0, sealed: 0, rotated: 0, failed: 0, truncated: false };
    if (cfg.mode !== 'on') return res;
    const outOfBudget = () => res.sealed + res.rotated >= maxWrites || Date.now() > deadline;

    const handle = async (shape: Shape, ref: DocumentReference, data: Record<string, unknown>) => {
        res.scanned++;
        const work = needsWork(shape, data, cfg);
        if (!work) return;
        if (work === 'seal') res.legacy++;
        try {
            // Transakcja: zapis równoległy (cron, użytkownik) wygrywa — nie nadpisujemy świeższej treści starą.
            await db.runTransaction(async (tx) => {
                const fresh = await tx.get(ref);
                const cur = fresh.data();
                if (!fresh.exists || !cur || !needsWork(shape, cur, cfg)) return;
                const updatedAt = storedUpdatedAt(cur);
                const value = cur.sealed === undefined ? legacyValue(shape, cur) : open(ref.path, updatedAt, cur.sealed, cfg);
                const extra = shape === 'cache' ? SEALED_CACHE_EXTRA : {};
                tx.set(ref, { ...extra, sealed: seal(ref.path, updatedAt, value, cfg), updatedAt });
            });
            if (work === 'rotate') res.rotated++;
            else res.sealed++;
        } catch (err) {
            res.failed++;
            console.error(`[data-seal] migracja ${ref.path}:`, String(err).slice(0, 200));
        }
    };

    for (const id of HEALTH_DOCS) {
        if (outOfBudget()) return { ...res, truncated: true };
        const ref = db.collection('health').doc(id);
        const snap = await ref.get();
        if (snap.exists) await handle('doc', ref, snap.data() ?? {});
    }
    const collections: Array<[string, Shape]> = [...CACHE_COLLECTIONS.map((n): [string, Shape] => [n, 'cache']), [USER_COLLECTION, 'doc']];
    for (const [name, shape] of collections) {
        let last: QueryDocumentSnapshot | null = null;
        for (;;) {
            if (outOfBudget()) return { ...res, truncated: true };
            let q = db.collection(name).orderBy(FieldPath.documentId()).limit(PAGE);
            if (last) q = q.startAfter(last);
            const page = await q.get();
            for (const doc of page.docs) {
                if (outOfBudget()) return { ...res, truncated: true };
                await handle(shape, doc.ref, doc.data());
            }
            if (page.docs.length < PAGE) break;
            last = page.docs[page.docs.length - 1];
        }
    }
    return res;
}

export async function readSealState(db: Firestore | null): Promise<SweepResult | null> {
    if (!db) return null;
    try {
        const snap = await db.collection(SEAL_STATE.collection).doc(SEAL_STATE.id).get();
        return snap.exists ? readState(snap.data()) : null;
    } catch {
        return null;
    }
}

/**
 * Dla crona `freshness`: migracja najwyżej co 6 h. Cron jest publiczny bez CRON_SECRET, więc blokada zapisuje się
 * w transakcji PRZED skanem — równoległe wywołania nie robią N pełnych przeglądów bazy.
 */
export async function maybeSweep(db: Firestore | null, deadline: number): Promise<SweepResult | null> {
    if (!db || sealConfig().mode !== 'on') return null;
    const ref = db.collection(SEAL_STATE.collection).doc(SEAL_STATE.id);
    const start: SweepResult = { at: new Date().toISOString(), scanned: 0, legacy: 0, sealed: 0, rotated: 0, failed: 0, truncated: true };
    const acquired = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const last = snap.exists ? readState(snap.data()) : null;
        if (last && Date.now() - Date.parse(last.at) < SWEEP_EVERY_MS) return false;
        tx.set(ref, toStored(STATE_PATH, start, Date.now(), docLegacy.write));
        return true;
    });
    if (!acquired) return null;
    const res = { ...(await sweepLegacyDocs(db, { deadline })), at: start.at };
    try {
        await ref.set(toStored(STATE_PATH, res, Date.now(), docLegacy.write));
    } catch (err) {
        console.error('[data-seal] seal_state:', err);
    }
    return res;
}
