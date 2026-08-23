// Budowa feedu RSS (współdzielona przez `/api/news` i cron digest).
import { NEWS_SOURCES } from '@/lib/news/sources';
import { parseRss, urlKey, titleKey } from '@/lib/news/parse';
import { clusterNews } from '@/lib/news/cluster';
import { scoreItem } from '@/lib/news/score';
import { appendFeedToTodayArchive } from '@/lib/news/archive';
import type { NewsItem, NewsSourceStatus } from '@/lib/news/types';

const FETCH_TIMEOUT_MS = 8000;
const MAX_ITEMS = 150;
const UA = 'Mozilla/5.0 (compatible; MakroDataPlatform/1.0; +https://github.com/) AppleWebKit/537.36';

export interface NewsFeedResult {
    timestamp: string;
    sourcesOk: number;
    sourcesTotal: number;
    count: number;
    countBeforeLimit: number;
    sources: NewsSourceStatus[];
    items: NewsItem[];
}

async function fetchSource(src: (typeof NEWS_SOURCES)[number]): Promise<{ items: NewsItem[]; status: NewsSourceStatus }> {
    const base: NewsSourceStatus = { id: src.id, name: src.name, ok: false, count: 0 };
    try {
        const res = await fetch(src.url, {
            headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8' },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            cache: 'no-store',
        });
        if (!res.ok) {
            return { items: [], status: { ...base, error: `HTTP ${res.status}` } };
        }

        const xml = await res.text();
        const parsed = parseRss(xml, { warsawWallClock: src.warsawWallClock });
        if (parsed.length === 0) {
            return { items: [], status: { ...base, error: 'brak pozycji w odpowiedzi' } };
        }

        const items = parsed.slice(0, src.limit).map((p) => ({
            ...p,
            sourceId: src.id,
            source: src.name,
            section: src.section,
        }));
        return { items, status: { ...base, ok: true, count: items.length } };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { items: [], status: { ...base, error: msg.slice(0, 80) } };
    }
}

/**
 * Dokłada do pozycji ranking: klaster tematyczny (po właścicielach) + ważność + flagi jakości.
 * Liczone raz na odświeżenie cache — deterministyczne i tanie (O(n²) na 150 pozycjach).
 */
function rank(items: NewsItem[]): NewsItem[] {
    const ownerOf = new Map(NEWS_SOURCES.map((s) => [s.id, s.owner]));
    const withOwner = items.map((it) => ({ ...it, owner: ownerOf.get(it.sourceId) ?? 'bonnier' }));

    const clusters = clusterNews(withOwner);
    const now = Date.now();

    const scored = items.map((it) => ({ it, raw: 0, cluster: null as (typeof clusters)[number] | null }));
    for (const [ci, c] of clusters.entries()) {
        for (const i of c.members) {
            const res = scoreItem({
                item: items[i],
                clusterWeight: c.weight,
                isFirst: i === c.firstIndex,
                owner: ownerOf.get(items[i].sourceId),
                now,
            });
            scored[i].raw = res.raw;
            scored[i].cluster = c;
            items[i].clusterId = ci;
            items[i].isAd = res.ad;
            items[i].clickbait = res.clickbait;
            items[i].isOpinion = res.opinion;
        }
    }

    const max = Math.max(...scored.map((s) => s.raw), 1e-9);
    for (let i = 0; i < items.length; i++) {
        const c = scored[i].cluster;
        items[i].importance = Math.round((scored[i].raw / max) * 100);
        items[i].corroboration = c ? c.independentReports : 1;
        items[i].wire = c ? c.wire : false;
        items[i].alsoIn = c
            ? [...new Set(c.members.filter((m) => m !== i).map((m) => items[m].source))].slice(0, 4)
            : [];
    }

    return items;
}

/** Pobiera feedy RSS → scala → dedup → ranking. Bez zapisu do archiwum / cache. */
export async function buildNewsFeed(): Promise<NewsFeedResult> {
    const settled = await Promise.all(NEWS_SOURCES.map(fetchSource));

    const sources = settled.map((s) => s.status);
    const seenUrl = new Set<string>();
    const seenTitle = new Set<string>();
    const merged: NewsItem[] = [];

    const futureLimit = Date.now() + 2 * 3600 * 1000;

    for (const { items } of settled) {
        for (const item of items) {
            if (new Date(item.publishedAt).getTime() > futureLimit) continue;
            const uk = urlKey(item.link);
            const tk = titleKey(item.title);
            if (seenUrl.has(uk) || seenTitle.has(tk)) continue;
            seenUrl.add(uk);
            seenTitle.add(tk);
            merged.push(item);
        }
    }

    merged.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const items = merged.slice(0, MAX_ITEMS);

    return {
        timestamp: new Date().toISOString(),
        sourcesOk: sources.filter((s) => s.ok).length,
        sourcesTotal: sources.length,
        count: items.length,
        countBeforeLimit: merged.length,
        sources,
        items: rank(items),
    };
}

/**
 * Odświeża RSS i **czekając** scala do archiwum dnia (Warsaw).
 * Krytyczne na Vercel: fire-and-forget po `return` jest zamrażane — merge musi być awaited.
 */
export async function refreshAndMergeTodayArchive(): Promise<{
    feed: NewsFeedResult;
    archiveCount: number;
}> {
    const feed = await buildNewsFeed();
    if (!feed.items.length) {
        return { feed, archiveCount: 0 };
    }
    const archive = await appendFeedToTodayArchive(feed.items);
    return { feed, archiveCount: archive.items.length };
}
