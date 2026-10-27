import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_CGPI_SERIES, JP_CGPI_SOURCE, jpCgpiIsEmpty, type JpCgpiId, type JpCgpiPayload } from './cgpi';

const CACHE = { collection: 'jp_data', doc: 'cgpi_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpCgpi(): Promise<JpCgpiPayload> {
    const series = {} as Record<JpCgpiId, DashboardPoint[]>;
    const names = {} as Record<JpCgpiId, string>;
    for (const [i, cfg] of JP_CGPI_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_CGPI_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpCgpi({ force = false }: { force?: boolean } = {}): Promise<JpCgpiPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpCgpi, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpCgpiIsEmpty });
}

export async function peekJpCgpi(): Promise<JpCgpiPayload | null> {
    const p = await peekServerCache<JpCgpiPayload>(CACHE.collection, CACHE.doc);
    return p && !jpCgpiIsEmpty(p) ? p : null;
}
