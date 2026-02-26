// Firestore cache helper — read/write cached API data
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const CACHE_DURATIONS: Record<string, number> = {
    'exchange_rates': 6 * 60 * 60 * 1000,   // 6 hours
    'market_data': 2 * 60 * 60 * 1000,      // 2 hours
    'macro_data': 24 * 60 * 60 * 1000,      // 24 hours
    'gold': 6 * 60 * 60 * 1000,             // 6 hours
};

interface CachedData<T> {
    data: T;
    updatedAt: Timestamp;
    source: string;
}

/**
 * Read cached data from Firestore
 * Returns null if no cache or cache expired
 */
export async function getCachedData<T>(
    collection: string,
    docId: string,
    maxAgeMs?: number
): Promise<T | null> {
    try {
        const ref = doc(db, collection, docId);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) return null;

        const cached = snapshot.data() as CachedData<T>;
        const age = Date.now() - cached.updatedAt.toMillis();
        const maxAge = maxAgeMs || CACHE_DURATIONS[collection] || 6 * 60 * 60 * 1000;

        if (age > maxAge) return null; // Cache expired

        return cached.data;
    } catch (error) {
        console.error(`Cache read error [${collection}/${docId}]:`, error);
        return null;
    }
}

/**
 * Write data to Firestore cache
 */
export async function setCachedData<T>(
    collection: string,
    docId: string,
    data: T,
    source: string
): Promise<void> {
    try {
        const ref = doc(db, collection, docId);
        await setDoc(ref, {
            data,
            updatedAt: Timestamp.now(),
            source,
        });
    } catch (error) {
        console.error(`Cache write error [${collection}/${docId}]:`, error);
    }
}
