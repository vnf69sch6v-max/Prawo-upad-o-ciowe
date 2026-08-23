import { getServerCache, setServerCache } from '@/lib/server-cache';
import { ARCHIVE_MAX_AGE_MS } from '@/lib/news/archive';
import type { DailyDigest } from '@/lib/news/daily';

export const DIGEST_COLLECTION = 'digest';

export async function readDailyDigest(date: string): Promise<DailyDigest | null> {
    return getServerCache<DailyDigest>(DIGEST_COLLECTION, date, ARCHIVE_MAX_AGE_MS);
}

export async function saveDailyDigest(digest: DailyDigest): Promise<void> {
    await setServerCache(DIGEST_COLLECTION, digest.date, digest, 'news-digest');
}
