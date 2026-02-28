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

/**
 * Cache-through helper: read from cache, if miss → fetch → cache → return.
 */
export async function withCache<T>(
    collection: string,
    docId: string,
    fetcher: () => Promise<T>,
    source: string,
    maxAgeMs?: number
): Promise<T> {
    // Try cache
    const cached = await getServerCache<T>(collection, docId, maxAgeMs);
    if (cached !== null) return cached;

    // Fetch fresh data
    const fresh = await fetcher();

    // Write to cache (fire-and-forget)
    setServerCache(collection, docId, fresh, source).catch(() => { });

    return fresh;
}
