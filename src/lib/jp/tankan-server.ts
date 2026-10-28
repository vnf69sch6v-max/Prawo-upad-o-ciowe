import { peekServerCache, withCache } from '@/lib/server-cache';
import {
    JP_TANKAN_SERIES, JP_TANKAN_SOURCE, jpTankanIsEmpty, parseTankanSeries, tankanDataUrl, tankanQuarterCode,
    type JpTankanId, type JpTankanPayload, type JpTankanPoint,
} from './tankan';

const CACHE = { collection: 'jp_data', doc: 'tankan_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;
const START = '201801';

async function fetchOne(id: JpTankanId, now: Date): Promise<{ name: string; points: JpTankanPoint[] }> {
    const cfg = JP_TANKAN_SERIES.find((s) => s.id === id)!;
    const res = await fetch(tankanDataUrl(cfg, START, tankanQuarterCode(now)), {
        cache: 'no-store',
        headers: { 'user-agent': 'Savori', accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`BOJ ${id}: HTTP ${res.status}`);
    return parseTankanSeries(await res.json(), cfg);
}

export async function fetchJpTankan(now = new Date()): Promise<JpTankanPayload> {
    const rows = await Promise.all(JP_TANKAN_SERIES.map((s) => fetchOne(s.id, now)));
    const series = {} as Record<JpTankanId, JpTankanPoint[]>;
    const names = {} as Record<JpTankanId, string>;
    JP_TANKAN_SERIES.forEach((s, i) => {
        series[s.id] = rows[i].points;
        names[s.id] = rows[i].name;
    });
    return { series, names, source: JP_TANKAN_SOURCE, fetchedAt: now.toISOString() };
}

export function getJpTankan({ force = false }: { force?: boolean } = {}): Promise<JpTankanPayload> {
    return withCache(CACHE.collection, CACHE.doc, () => fetchJpTankan(), 'Bank Japonii',
        force ? -1 : USER_TTL_MS, { isEmpty: jpTankanIsEmpty });
}

export async function peekJpTankan(): Promise<JpTankanPayload | null> {
    const p = await peekServerCache<JpTankanPayload>(CACHE.collection, CACHE.doc);
    return p && !jpTankanIsEmpty(p) ? p : null;
}
