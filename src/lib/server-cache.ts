// Server-side Firestore cache helper for API routes
// Uses Firebase Admin SDK (works in Next.js API routes)
// Treść wpisów jest szyfrowana przed zapisem (`src/lib/data-seal.ts`), gdy serwer ma DATA_ENCRYPTION_KEY.
import { getAdminDb } from '@/lib/firebase/admin';
import { cacheLegacy, fromStored, toStored } from '@/lib/data-seal';

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
        const entry = await readServerCacheEntry<T>(collection, docId, true);
        if (!entry) return null;

        const age = Date.now() - entry.updatedAt;
        const ttl = maxAgeMs ?? CACHE_TTL[collection] ?? 6 * 3600 * 1000;

        if (age > ttl) return null;

        return entry.payload;
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
        await ref.set(toStored(`${collection}/${docId}`, payload, Date.now(), (p, updatedAt) => ({
            payload: p,
            updatedAt,
            source,
            cachedAt: new Date(updatedAt).toISOString(),
        })));
    } catch (err) {
        console.error(`[Cache WRITE] ${collection}/${docId}:`, err);
    }
}

/**
 * Ostatni zapisany wpis bez względu na wiek — rezerwa, gdy źródło akurat nie odpowiada, oraz odczyt
 * dla stron renderowanych na serwerze (ISR), które NIE mogą same wołać źródła: w renderze strony
 * `fetch` trafiałby do Data Cache Next.js (stale-while-revalidate) — patrz AGENTS.md.
 */
export async function peekServerCache<T>(collection: string, docId: string): Promise<T | null> {
    return getStaleServerCache<T>(collection, docId);
}

async function getStaleServerCache<T>(collection: string, docId: string): Promise<T | null> {
    return (await readServerCacheEntry<T>(collection, docId))?.payload ?? null;
}

/**
 * Wpis z datą zapisu, bez względu na wiek. `null`: brak wpisu, brak Firestore albo treść, której nie da się
 * odszyfrować (zły klucz / podmiana) — wtedy cache zachowuje się jak przy braku wpisu i pobiera dane od nowa.
 */
export async function readServerCacheEntry<T>(
    collection: string,
    docId: string,
    rethrow = false,
): Promise<{ payload: T; updatedAt: number } | null> {
    const db = getAdminDb();
    if (!db) return null;
    try {
        const snap = await db.collection(collection).doc(docId).get();
        if (!snap.exists) return null;
        const entry = fromStored<T>(`${collection}/${docId}`, snap.data(), (d) => cacheLegacy.read(d) as T | undefined);
        return entry && entry.value != null ? { payload: entry.value, updatedAt: entry.updatedAt } : null;
    } catch (err) {
        if (rethrow) throw err;
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

/** Wymuszone odświeżenie (`?refresh=1`, `maxAgeMs < 0`) idzie do źródła najwyżej raz na 10 min na klucz cache. */
export const FORCED_REFRESH_MIN_AGE_MS = 10 * 60_000;

/**
 * Cache-through helper: read from cache, if miss → fetch → cache → return.
 *
 * Odporność na awarie źródła (to one, nie cron, decydują, czy dane „same się aktualizują"):
 * - fetcher rzucił wyjątek → oddajemy ostatni zapisany wpis (nawet przeterminowany), zamiast 500;
 * - fetcher zwrócił pustkę (`isEmpty`, domyślnie `looksEmpty`) → NIE nadpisujemy dobrego wpisu;
 *   oddajemy poprzedni, a jeśli go nie ma — świeżą (pustą) odpowiedź.
 * Wymuszone odświeżenie (`maxAgeMs < 0`, cron `?refresh=1`) korzysta z tych samych reguł, więc
 * chwilowy limit GUS nie wyczyści danych na dobę.
 *
 * Limit wymuszonego odświeżenia: `?refresh=1` jest publiczne (bez sekretu), więc `maxAgeMs < 0` trafia do
 * źródła tylko, gdy wpis jest starszy niż `FORCED_REFRESH_MIN_AGE_MS` — młodszy oddajemy z cache.
 * Inaczej każdy mógł w pętli wyczerpać wspólny limit GUS DBW (~100 żądań / 15 min) i crony dostawały 429.
 * Crony wołają ten sam klucz co najwyżej co ~2 h, więc ich to nie dotyka; samonaprawa świeżości
 * (`selfHeal`) przy wpisie młodszym niż 10 min dostaje cache — to dane, które źródło dało przed chwilą.
 */
export async function withCache<T>(
    collection: string,
    docId: string,
    fetcher: () => Promise<T>,
    source: string,
    maxAgeMs?: number,
    opts: { isEmpty?: (payload: T) => boolean } = {},
): Promise<T> {
    // Try cache (wymuszone odświeżenie: wpis młodszy niż FORCED_REFRESH_MIN_AGE_MS nadal wygrywa)
    const forced = maxAgeMs !== undefined && maxAgeMs < 0;
    const cached = await getServerCache<T>(collection, docId, forced ? FORCED_REFRESH_MIN_AGE_MS : maxAgeMs);
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
