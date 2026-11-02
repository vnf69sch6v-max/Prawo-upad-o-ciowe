import { peekServerCache, withCache } from '@/lib/server-cache';
import { EU_HICP_DATASET, EU_HICP_GEOS, euHicpIsEmpty, parseEuHicp, shiftPeriod, type EuHicpPayload } from './hicp';

const CACHE = { collection: 'eurostat', doc: 'eu_hicp_v1' } as const;
const USER_TTL_MS = 12 * 3_600_000;
const BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

function warsawMonth(now: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit' }).formatToParts(now);
    return `${parts.find((p) => p.type === 'year')!.value}-${parts.find((p) => p.type === 'month')!.value}`;
}

export function euHicpUrl(now: Date): string {
    const q = new URLSearchParams({ format: 'JSON', lang: 'en', coicop18: 'TOTAL', unit: 'RCH_A' });
    for (const g of EU_HICP_GEOS) q.append('geo', g);
    q.set('sinceTimePeriod', shiftPeriod(warsawMonth(now), -26));
    return `${BASE}/${EU_HICP_DATASET}?${q}`;
}

export async function fetchEuHicp(now = new Date()): Promise<EuHicpPayload> {
    // `no-store`: cache'em jest Firestore (`withCache`); Data Cache Next.js podsunąłby cronowi starą odpowiedź.
    const res = await fetch(euHicpUrl(now), { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Eurostat HICP: HTTP ${res.status}`);
    const raw = await res.json();
    if (raw?.error) throw new Error(`Eurostat HICP: ${JSON.stringify(raw.error).slice(0, 200)}`);
    return parseEuHicp(raw, now.toISOString());
}

export function getEuHicp({ force = false }: { force?: boolean } = {}): Promise<EuHicpPayload> {
    return withCache(CACHE.collection, CACHE.doc, () => fetchEuHicp(), 'Eurostat',
        force ? -1 : USER_TTL_MS, { isEmpty: euHicpIsEmpty });
}

export async function peekEuHicp(): Promise<EuHicpPayload | null> {
    const p = await peekServerCache<EuHicpPayload>(CACHE.collection, CACHE.doc);
    return p && !euHicpIsEmpty(p) ? p : null;
}
