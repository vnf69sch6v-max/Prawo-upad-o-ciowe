// Szybki szacunek CPI: pobranie komunikatu GUS (strona działu → komunikat → tablica XLSX) + cache Firestore.
// Parser i reguły: src/lib/cpi-flash.ts. To nie DBW — nie zjada wspólnego limitu ~100 żądań / 15 min,
// ale i tak najwyżej 3 żądania na pobranie i najwyżej jedno pobranie na 10 min (`withCache`).
import { withCache, peekServerCache } from '@/lib/server-cache';
import { workbookToGrid } from '@/lib/jp/contributions-xlsx';
import {
    GUS_PRICES_INDEX_URL, cpiFlashBehind, findXlsxHref, parseCpiFlashGrid, parseCpiFlashHtml, pickLatestFlashLink,
    type CpiFlash,
} from '@/lib/cpi-flash';

const COLLECTION = 'macro_data' as const;
const DOC_ID = 'gus_cpi_flash_v1';
const TTL_MS = 6 * 3600_000;
const RECHECK_MS = 10 * 60_000;
const UA = 'Mozilla/5.0 (compatible; Savori/1.0; +https://savori.space)';

/** Jeden termin na całe pobranie (3 żądania) — trasa ma `maxDuration = 15`. */
const FETCH_BUDGET_MS = 12_000;

async function get(url: string, kind: 'text' | 'buffer', signal: AbortSignal): Promise<string | Buffer> {
    // `no-store`: Data Cache Next.js (stale-while-revalidate) wepchnąłby stary komunikat do Firestore (AGENTS.md).
    const res = await fetch(url, { cache: 'no-store', headers: { 'User-Agent': UA }, signal });
    if (!res.ok) throw new Error(`[cpi-flash] HTTP ${res.status} ${url}`);
    return kind === 'text' ? res.text() : Buffer.from(await res.arrayBuffer());
}

export async function fetchCpiFlash(now: Date = new Date()): Promise<CpiFlash> {
    const signal = AbortSignal.timeout(FETCH_BUDGET_MS);
    const index = (await get(GUS_PRICES_INDEX_URL, 'text', signal)) as string;
    const link = pickLatestFlashLink(index);
    if (!link) throw new Error('[cpi-flash] brak linku do szybkiego szacunku na stronie działu');
    const html = (await get(link.url, 'text', signal)) as string;
    const base = parseCpiFlashHtml(html, { url: link.url, now });
    let groups: CpiFlash['groups'] = [];
    const xlsx = findXlsxHref(html);
    if (xlsx) {
        try {
            groups = parseCpiFlashGrid(await workbookToGrid((await get(xlsx, 'buffer', signal)) as Buffer), base);
        } catch (err) {
            console.warn('[cpi-flash] tablica XLSX pominięta:', String(err).slice(0, 200));
        }
    }
    return { ...base, groups };
}

export async function getCpiFlash(force = false): Promise<CpiFlash> {
    const data = await withCache(COLLECTION, DOC_ID, () => fetchCpiFlash(), 'GUS szybki szacunek CPI', force ? -1 : TTL_MS);
    if (!force && cpiFlashBehind(data?.period)) {
        return withCache(COLLECTION, DOC_ID, () => fetchCpiFlash(), 'GUS szybki szacunek CPI', RECHECK_MS);
    }
    return data;
}

/** Tylko odczyt cache (digest, render) — bez sięgania do GUS. */
export function peekCpiFlash(): Promise<CpiFlash | null> {
    return peekServerCache<CpiFlash>(COLLECTION, DOC_ID);
}
