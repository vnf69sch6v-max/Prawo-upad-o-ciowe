import { peekServerCache, withCache } from '@/lib/server-cache';
import { JGB_HISTORY_URL, JGB_MONTH_URL, buildJgbPayload, jgbIsEmpty, type JgbPayload } from './jgb';

const CACHE = { collection: 'jp_data', doc: 'jgb_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

async function text(url: string, encoding: 'utf-8' | 'cp932'): Promise<string> {
    const res = await fetch(url, { cache: 'no-store', headers: { 'user-agent': 'Savori' } });
    if (!res.ok) throw new Error(`JGB HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return new TextDecoder(encoding === 'cp932' ? 'shift_jis' : encoding).decode(buf);
}

export async function fetchJgb(now = new Date()): Promise<JgbPayload> {
    const [history, month] = await Promise.all([
        text(JGB_HISTORY_URL, 'utf-8'),
        text(JGB_MONTH_URL, 'cp932'),
    ]);
    return buildJgbPayload(history, month, now);
}

export function getJgb({ force = false }: { force?: boolean } = {}): Promise<JgbPayload> {
    return withCache(CACHE.collection, CACHE.doc, () => fetchJgb(), 'MOF JGB',
        force ? -1 : USER_TTL_MS, { isEmpty: jgbIsEmpty });
}

export async function peekJgb(): Promise<JgbPayload | null> {
    const p = await peekServerCache<JgbPayload>(CACHE.collection, CACHE.doc);
    return p && !jgbIsEmpty(p) ? p : null;
}
