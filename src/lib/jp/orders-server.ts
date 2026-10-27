import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_ORDERS_SERIES, JP_ORDERS_SOURCE, jpOrdersIsEmpty, type JpOrdersId, type JpOrdersPayload } from './orders';

const CACHE = { collection: 'jp_data', doc: 'orders_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpOrders(): Promise<JpOrdersPayload> {
    const series = {} as Record<JpOrdersId, DashboardPoint[]>;
    const names = {} as Record<JpOrdersId, string>;
    for (const [i, cfg] of JP_ORDERS_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_ORDERS_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpOrders({ force = false }: { force?: boolean } = {}): Promise<JpOrdersPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpOrders, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpOrdersIsEmpty });
}

export async function peekJpOrders(): Promise<JpOrdersPayload | null> {
    const p = await peekServerCache<JpOrdersPayload>(CACHE.collection, CACHE.doc);
    return p && !jpOrdersIsEmpty(p) ? p : null;
}
