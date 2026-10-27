import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_TERTIARY_SERIES, JP_TERTIARY_SOURCE, jpTertiaryIsEmpty, type JpTertiaryId, type JpTertiaryPayload } from './tertiary';

const CACHE = { collection: 'jp_data', doc: 'tertiary_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpTertiary(): Promise<JpTertiaryPayload> {
    const series = {} as Record<JpTertiaryId, DashboardPoint[]>;
    const names = {} as Record<JpTertiaryId, string>;
    for (const [i, cfg] of JP_TERTIARY_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_TERTIARY_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpTertiary({ force = false }: { force?: boolean } = {}): Promise<JpTertiaryPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpTertiary, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpTertiaryIsEmpty });
}

export async function peekJpTertiary(): Promise<JpTertiaryPayload | null> {
    const p = await peekServerCache<JpTertiaryPayload>(CACHE.collection, CACHE.doc);
    return p && !jpTertiaryIsEmpty(p) ? p : null;
}
