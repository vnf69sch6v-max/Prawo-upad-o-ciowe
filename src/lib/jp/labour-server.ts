import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_LABOUR_SERIES, JP_LABOUR_SOURCE, jpLabourIsEmpty, type JpLabourId, type JpLabourPayload } from './labour';

const CACHE = { collection: 'jp_data', doc: 'labour_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpLabour(): Promise<JpLabourPayload> {
    const series = {} as Record<JpLabourId, DashboardPoint[]>;
    const names = {} as Record<JpLabourId, string>;
    for (const [i, cfg] of JP_LABOUR_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_LABOUR_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpLabour({ force = false }: { force?: boolean } = {}): Promise<JpLabourPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpLabour, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpLabourIsEmpty });
}

export async function peekJpLabour(): Promise<JpLabourPayload | null> {
    const p = await peekServerCache<JpLabourPayload>(CACHE.collection, CACHE.doc);
    return p && !jpLabourIsEmpty(p) ? p : null;
}
