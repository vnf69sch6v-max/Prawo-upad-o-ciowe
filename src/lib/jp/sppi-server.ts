import { peekServerCache, withCache } from '@/lib/server-cache';
import { bojEndMonth, bojStartMonth } from './boj';
import {
    JP_SPPI_SERIES, JP_SPPI_SOURCE, jpSppiIsEmpty, parseSppiSeries, sppiDataUrl,
    type JpSppiId, type JpSppiPayload, type JpSppiPoint,
} from './sppi';

const CACHE = { collection: 'jp_data', doc: 'sppi_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

async function fetchOne(id: JpSppiId, now: Date): Promise<{ name: string; points: JpSppiPoint[] }> {
    const cfg = JP_SPPI_SERIES.find((s) => s.id === id)!;
    const res = await fetch(sppiDataUrl(cfg, bojStartMonth(now, 36), bojEndMonth(now)), {
        cache: 'no-store',
        headers: { 'user-agent': 'Savori', accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`BOJ ${id}: HTTP ${res.status}`);
    return parseSppiSeries(await res.json(), cfg);
}

export async function fetchJpSppi(now = new Date()): Promise<JpSppiPayload> {
    const rows = await Promise.all(JP_SPPI_SERIES.map((s) => fetchOne(s.id, now)));
    const series = {} as Record<JpSppiId, JpSppiPoint[]>;
    const names = {} as Record<JpSppiId, string>;
    JP_SPPI_SERIES.forEach((s, i) => {
        series[s.id] = rows[i].points;
        names[s.id] = rows[i].name;
    });
    return { series, names, source: JP_SPPI_SOURCE, fetchedAt: now.toISOString() };
}

export function getJpSppi({ force = false }: { force?: boolean } = {}): Promise<JpSppiPayload> {
    return withCache(CACHE.collection, CACHE.doc, () => fetchJpSppi(), 'Bank Japonii',
        force ? -1 : USER_TTL_MS, { isEmpty: jpSppiIsEmpty });
}

export async function peekJpSppi(): Promise<JpSppiPayload | null> {
    const p = await peekServerCache<JpSppiPayload>(CACHE.collection, CACHE.doc);
    return p && !jpSppiIsEmpty(p) ? p : null;
}
