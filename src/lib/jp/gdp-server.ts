import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_GDP_SERIES, JP_GDP_SOURCE, jpGdpIsEmpty, type JpGdpId, type JpGdpPayload } from './gdp';

const CACHE = { collection: 'jp_data', doc: 'gdp_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpGdp(): Promise<JpGdpPayload> {
    const series = {} as Record<JpGdpId, DashboardPoint[]>;
    const names = {} as Record<JpGdpId, string>;
    for (const [i, cfg] of JP_GDP_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_GDP_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpGdp({ force = false }: { force?: boolean } = {}): Promise<JpGdpPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpGdp, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpGdpIsEmpty });
}

export async function peekJpGdp(): Promise<JpGdpPayload | null> {
    const p = await peekServerCache<JpGdpPayload>(CACHE.collection, CACHE.doc);
    return p && !jpGdpIsEmpty(p) ? p : null;
}
