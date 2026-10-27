import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries } from './stat-dashboard';
import { JP_RETAIL_QUERY, JP_RETAIL_SOURCE, jpRetailIsEmpty, type JpRetailPayload } from './retail';

const CACHE = { collection: 'jp_data', doc: 'retail_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpRetail(): Promise<JpRetailPayload> {
    const row = await fetchDashboardSeries(JP_RETAIL_QUERY);
    return { points: row.points, name: row.name, source: JP_RETAIL_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpRetail({ force = false }: { force?: boolean } = {}): Promise<JpRetailPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpRetail, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpRetailIsEmpty });
}

export async function peekJpRetail(): Promise<JpRetailPayload | null> {
    const p = await peekServerCache<JpRetailPayload>(CACHE.collection, CACHE.doc);
    return p && !jpRetailIsEmpty(p) ? p : null;
}
