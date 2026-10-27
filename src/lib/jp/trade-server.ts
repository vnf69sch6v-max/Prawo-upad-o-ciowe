import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_TRADE_SERIES, JP_TRADE_SOURCE, jpTradeIsEmpty, type JpTradeId, type JpTradePayload } from './trade';

const CACHE = { collection: 'jp_data', doc: 'trade_v4' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpTrade(): Promise<JpTradePayload> {
    const series = {} as Record<JpTradeId, DashboardPoint[]>;
    const names = {} as Record<JpTradeId, string>;
    for (const [i, cfg] of JP_TRADE_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_TRADE_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpTrade({ force = false }: { force?: boolean } = {}): Promise<JpTradePayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpTrade, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpTradeIsEmpty });
}

export async function peekJpTrade(): Promise<JpTradePayload | null> {
    const p = await peekServerCache<JpTradePayload>(CACHE.collection, CACHE.doc);
    return p && !jpTradeIsEmpty(p) ? p : null;
}
