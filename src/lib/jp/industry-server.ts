import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_INDUSTRY_SERIES, JP_INDUSTRY_SOURCE, jpIndustryIsEmpty, type JpIndustryId, type JpIndustryPayload } from './industry';

const CACHE = { collection: 'jp_data', doc: 'industry_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpIndustry(): Promise<JpIndustryPayload> {
    const series = {} as Record<JpIndustryId, DashboardPoint[]>;
    const names = {} as Record<JpIndustryId, string>;
    for (const [i, cfg] of JP_INDUSTRY_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_INDUSTRY_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpIndustry({ force = false }: { force?: boolean } = {}): Promise<JpIndustryPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpIndustry, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpIndustryIsEmpty });
}

export async function peekJpIndustry(): Promise<JpIndustryPayload | null> {
    const p = await peekServerCache<JpIndustryPayload>(CACHE.collection, CACHE.doc);
    return p && !jpIndustryIsEmpty(p) ? p : null;
}
