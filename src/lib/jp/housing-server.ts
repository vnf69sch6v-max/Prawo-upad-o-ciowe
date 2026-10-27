import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_HOUSING_SERIES, JP_HOUSING_SOURCE, jpHousingIsEmpty, type JpHousingId, type JpHousingPayload } from './housing';

const CACHE = { collection: 'jp_data', doc: 'housing_v3' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpHousing(): Promise<JpHousingPayload> {
    const series = {} as Record<JpHousingId, DashboardPoint[]>;
    const names = {} as Record<JpHousingId, string>;
    for (const [i, cfg] of JP_HOUSING_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_HOUSING_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpHousing({ force = false }: { force?: boolean } = {}): Promise<JpHousingPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpHousing, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpHousingIsEmpty });
}

export async function peekJpHousing(): Promise<JpHousingPayload | null> {
    const p = await peekServerCache<JpHousingPayload>(CACHE.collection, CACHE.doc);
    return p && !jpHousingIsEmpty(p) ? p : null;
}
