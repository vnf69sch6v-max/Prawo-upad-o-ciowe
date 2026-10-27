// Bank Japonii po stronie serwera. Trzy bazy (IR01, FM01, FM08) nie mieszają się w jednym żądaniu.
import { peekServerCache, withCache } from '@/lib/server-cache';
import {
    BOJ_SERIES, BOJ_SOURCE, bojDataUrl, bojEndMonth, bojIsEmpty, bojStartMonth, parseBojSeries,
    type BojId, type BojPayload, type BojPoint,
} from './boj';

const CACHE = { collection: 'jp_data', doc: 'markets_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

async function fetchOne(id: BojId, now: Date): Promise<{ name: string; points: BojPoint[] }> {
    const cfg = BOJ_SERIES.find((s) => s.id === id)!;
    const url = bojDataUrl(cfg, bojStartMonth(now, cfg.months), bojEndMonth(now));
    const res = await fetch(url, { cache: 'no-store', headers: { 'user-agent': 'Savori', accept: 'application/json' } });
    if (!res.ok) throw new Error(`BOJ ${id}: HTTP ${res.status}`);
    return parseBojSeries(await res.json(), cfg);
}

export async function fetchBojMarkets(now = new Date()): Promise<BojPayload> {
    const rows = await Promise.all(BOJ_SERIES.map((s) => fetchOne(s.id, now)));
    const series = {} as Record<BojId, BojPoint[]>;
    const names = {} as Record<BojId, string>;
    BOJ_SERIES.forEach((s, i) => {
        series[s.id] = rows[i].points;
        names[s.id] = rows[i].name;
    });
    return { series, names, source: BOJ_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getBojMarkets({ force = false }: { force?: boolean } = {}): Promise<BojPayload> {
    return withCache(CACHE.collection, CACHE.doc, () => fetchBojMarkets(), 'Bank Japonii',
        force ? -1 : USER_TTL_MS, { isEmpty: bojIsEmpty });
}

export async function peekBojMarkets(): Promise<BojPayload | null> {
    const p = await peekServerCache<BojPayload>(CACHE.collection, CACHE.doc);
    return p && !bojIsEmpty(p) ? p : null;
}
