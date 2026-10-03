// Server-side Firestore cache helper for API routes
// Uses Firebase Admin SDK (works in Next.js API routes)
import { getAdminDb } from '@/lib/firebase/admin';

const CACHE_TTL: Record<string, number> = {
    'exchange_rates': 6 * 3600 * 1000,   // 6h
    'market_data': 2 * 3600 * 1000,      // 2h
    'macro_data': 24 * 3600 * 1000,      // 24h
    'interest_rates': 24 * 3600 * 1000,  // 24h
    'wibor': 6 * 3600 * 1000,            // 6h
    'gold': 6 * 3600 * 1000,             // 6h
    'eurostat': 12 * 3600 * 1000,        // 12h
    'smup': 24 * 3600 * 1000,            // 24h — public services data
    'sdp': 24 * 3600 * 1000,             // 24h — GUS SDP warehouse
    'dbw': 24 * 3600 * 1000,             // 24h — GUS thematic DBs (prices, koniunktura)
    'news': 15 * 60 * 1000,              // 15 min — RSS newsy starzeją się szybko
    // Archiwum dzienne / digest — NIE mogą wygasać jak feed. Czytniki i tak podają maxAgeMs,
    // ale domyślny TTL kolekcji musi być długi na wypadek pominięcia argumentu.
    'news_archive': 365 * 24 * 3600 * 1000,
    'digest': 365 * 24 * 3600 * 1000,
};

/**
 * Get cached data from Firestore (server-side).
 * Returns null if cache miss or expired.
 */
export async function getServerCache<T>(
    collection: string,
    docId: string,
    maxAgeMs?: number
): Promise<T | null> {
    const db = getAdminDb();
    if (!db) return null; // No Firestore available

    try {
        const ref = db.collection(collection).doc(docId);
        const snap = await ref.get();
        if (!snap.exists) return null;

        const data = snap.data()!;
        const updatedAt = data.updatedAt?.toMillis?.() ?? data.updatedAt ?? 0;
        const age = Date.now() - updatedAt;
        const ttl = maxAgeMs ?? CACHE_TTL[collection] ?? 6 * 3600 * 1000;

        if (age > ttl) return null;

        return data.payload as T;
    } catch (err) {
        console.error(`[Cache READ] ${collection}/${docId}:`, err);
        return null;
    }
}

/**
 * Write data to Firestore cache (server-side).
 */
export async function setServerCache<T>(
    collection: string,
    docId: string,
    payload: T,
    source: string
): Promise<void> {
    const db = getAdminDb();
    if (!db) return;

    try {
        const ref = db.collection(collection).doc(docId);
        await ref.set({
            payload,
            updatedAt: Date.now(),
            source,
            cachedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error(`[Cache WRITE] ${collection}/${docId}:`, err);
    }
}

/** Ostatni zapisany wpis bez względu na wiek — rezerwa, gdy źródło akurat nie odpowiada. */
async function getStaleServerCache<T>(collection: string, docId: string): Promise<T | null> {
    const db = getAdminDb();
    if (!db) return null;
    try {
        const snap = await db.collection(collection).doc(docId).get();
        return snap.exists ? ((snap.data()!.payload as T) ?? null) : null;
    } catch {
        return null;
    }
}

/**
 * „Pusta" odpowiedź źródła: brak danych albo obiekt, którego wszystkie tablice najwyższego poziomu są
 * puste (np. `{ series: [], source }` z `/api/dbw-series`, gdy DBW odpowiedział 429 na każdy miesiąc).
 */
export function looksEmpty(payload: unknown): boolean {
    if (payload == null) return true;
    if (Array.isArray(payload)) return payload.length === 0;
    if (typeof payload !== 'object') return false;
    const arrays = Object.values(payload as Record<string, unknown>).filter(Array.isArray) as unknown[][];
    return arrays.length > 0 && arrays.every((a) => a.length === 0);
}

/**
 * Cache-through helper: read from cache, if miss → fetch → cache → return.
 *
 * Odporność na awarie źródła (to one, nie cron, decydują, czy dane „same się aktualizują"):
 * - fetcher rzucił wyjątek → oddajemy ostatni zapisany wpis (nawet przeterminowany), zamiast 500;
 * - fetcher zwrócił pustkę (`isEmpty`, domyślnie `looksEmpty`) → NIE nadpisujemy dobrego wpisu;
 *   oddajemy poprzedni, a jeśli go nie ma — świeżą (pustą) odpowiedź.
 * Wymuszone odświeżenie (`maxAgeMs < 0`, cron `?refresh=1`) korzysta z tych samych reguł, więc
 * chwilowy limit GUS nie wyczyści danych na dobę.
 */
export async function withCache<T>(
    collection: string,
    docId: string,
    fetcher: () => Promise<T>,
    source: string,
    maxAgeMs?: number,
    opts: { isEmpty?: (payload: T) => boolean } = {},
): Promise<T> {
    // Try cache
    const cached = await getServerCache<T>(collection, docId, maxAgeMs);
    if (cached !== null) return cached;

    // Fetch fresh data
    let fresh: T;
    try {
        fresh = await fetcher();
    } catch (err) {
        const stale = await getStaleServerCache<T>(collection, docId);
        if (stale !== null) {
            console.warn(`[Cache STALE] ${collection}/${docId}: źródło zawiodło, oddaję ostatni wpis —`, String(err).slice(0, 200));
            return stale;
        }
        throw err;
    }

    const isEmpty = opts.isEmpty ?? looksEmpty;
    if (isEmpty(fresh)) {
        const stale = await getStaleServerCache<T>(collection, docId);
        if (stale !== null && !isEmpty(stale)) {
            console.warn(`[Cache KEEP] ${collection}/${docId}: pusta odpowiedź źródła, zostawiam poprzedni wpis`);
            return stale;
        }
    }

    // Write to cache (fire-and-forget)
    setServerCache(collection, docId, fresh, source).catch(() => { });

    return fresh;
}
