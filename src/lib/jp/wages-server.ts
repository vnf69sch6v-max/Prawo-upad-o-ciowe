import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_WAGE_SERIES, JP_WAGE_SOURCE, jpWagesIsEmpty, type JpWageId, type JpWagesPayload } from './wages';

const CACHE = { collection: 'jp_data', doc: 'wages_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpWages(): Promise<JpWagesPayload> {
    const series = {} as Record<JpWageId, DashboardPoint[]>;
    const names = {} as Record<JpWageId, string>;
    for (const [i, cfg] of JP_WAGE_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_WAGE_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpWages({ force = false }: { force?: boolean } = {}): Promise<JpWagesPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpWages, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpWagesIsEmpty });
}

export async function peekJpWages(): Promise<JpWagesPayload | null> {
    const p = await peekServerCache<JpWagesPayload>(CACHE.collection, CACHE.doc);
    return p && !jpWagesIsEmpty(p) ? p : null;
}
