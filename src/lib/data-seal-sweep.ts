// Migracja do szyfrowania: dokumenty zapisane jawnie przed ustawieniem DATA_ENCRYPTION_KEY dostają `sealed`,
// a po rotacji klucza (DATA_ENCRYPTION_KEY_PREVIOUS) wpisy starym kluczem są przepisywane nowym.
// Cache z krótkim TTL i tak nadpisuje się sam w ciągu doby, ale archiwum newsów (dzień = dokument) nigdy —
// bez tego zostałoby jawne na zawsze. Uruchamia ją cron `freshness` najwyżej co 6 h; wynik w `health/seal_state`
// (też zaszyfrowany) pokazuje /api/health/freshness → `encryption.lastSweep`. Gdy `legacy` = 0 przez kolejne
// przebiegi, można włączyć DATA_ENCRYPTION_STRICT=1 (jawne wpisy będą wtedy odrzucane).
import type { Firestore } from 'firebase-admin/firestore';
import { docLegacy, fromStored, open, seal, sealConfig, sealedWithActiveKey, storedUpdatedAt, toStored } from '@/lib/data-seal';

export const SEAL_STATE = { collection: 'health', id: 'seal_state' } as const;
const STATE_PATH = `${SEAL_STATE.collection}/${SEAL_STATE.id}`;
const SWEEP_EVERY_MS = 6 * 3600_000;

export interface SweepResult {
    at: string;
    /** Przejrzane dokumenty (wszystkie kolekcje najwyższego poziomu). */
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

/** Treść jawnego dokumentu: `payload` w cache, cały dokument bez `updatedAt` w `health/*`. */
function legacyValue(data: Record<string, unknown>): unknown {
    return 'payload' in data ? data.payload : docLegacy.read(data);
}

export async function sweepLegacyDocs(
    db: Firestore,
    { maxWrites = 300, budgetMs = 45_000 }: { maxWrites?: number; budgetMs?: number } = {},
): Promise<SweepResult> {
    const cfg = sealConfig();
    const res: SweepResult = { at: new Date().toISOString(), scanned: 0, legacy: 0, sealed: 0, rotated: 0, failed: 0, truncated: false };
    if (cfg.mode !== 'on') return res;
    const deadline = Date.now() + budgetMs;

    for (const col of await db.listCollections()) {
        const snap = await col.get();
        for (const doc of snap.docs) {
            res.scanned++;
            const sealedNow = doc.data().sealed;
            if (sealedNow !== undefined && (sealedWithActiveKey(sealedNow, cfg) || !cfg.previous)) continue;
            const rotate = sealedNow !== undefined;
            if (!rotate) res.legacy++;
            if (res.sealed + res.rotated >= maxWrites || Date.now() > deadline) {
                res.truncated = true;
                continue;
            }
            try {
                // Transakcja: zapis równoległy (cron, użytkownik) wygrywa — nie nadpisujemy świeższej treści starą.
                await db.runTransaction(async (tx) => {
                    const fresh = await tx.get(doc.ref);
                    const data = fresh.data();
                    if (!fresh.exists || !data) return;
                    const updatedAt = storedUpdatedAt(data);
                    const path = doc.ref.path;
                    if (data.sealed === undefined) {
                        tx.set(doc.ref, { sealed: seal(path, updatedAt, legacyValue(data), cfg), updatedAt });
                    } else if (!sealedWithActiveKey(data.sealed, cfg)) {
                        tx.set(doc.ref, { sealed: seal(path, updatedAt, open(path, updatedAt, data.sealed, cfg), cfg), updatedAt });
                    }
                });
                if (rotate) res.rotated++;
                else res.sealed++;
            } catch (err) {
                res.failed++;
                console.error(`[data-seal] migracja ${doc.ref.path}:`, String(err).slice(0, 200));
            }
        }
    }
    return res;
}

export async function readSealState(db: Firestore | null): Promise<SweepResult | null> {
    if (!db) return null;
    try {
        const snap = await db.collection(SEAL_STATE.collection).doc(SEAL_STATE.id).get();
        return snap.exists ? (fromStored<SweepResult>(STATE_PATH, snap.data(), (d) => docLegacy.read(d) as unknown as SweepResult)?.value ?? null) : null;
    } catch {
        return null;
    }
}

/** Dla crona `freshness`: migracja najwyżej co 6 h (cron jest publiczny bez CRON_SECRET — każde wywołanie czyta bazę). */
export async function maybeSweep(db: Firestore | null): Promise<SweepResult | null> {
    if (!db || sealConfig().mode !== 'on') return null;
    const last = await readSealState(db);
    if (last && Date.now() - Date.parse(last.at) < SWEEP_EVERY_MS) return null;
    const res = await sweepLegacyDocs(db);
    try {
        await db.collection(SEAL_STATE.collection).doc(SEAL_STATE.id).set(toStored(STATE_PATH, res, Date.now(), docLegacy.write));
    } catch (err) {
        console.error('[data-seal] seal_state:', err);
    }
    return res;
}
