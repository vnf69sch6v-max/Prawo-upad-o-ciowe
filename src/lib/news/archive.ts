// Archiwum dziennych newsów (Europe/Warsaw) — fundament Daily Digest.
//
// Pułapka TTL: `getServerCache('news', …)` wygasa po 15 min. Archiwum NIE może wygasać —
// czytamy z jawnym maxAgeMs (~1 rok) i zapisujemy przez setServerCache do kolekcji
// `news_archive` (osobna od `news`).
//
// Hobby (Vercel): cron co 2h jest niedozwolony (max 1×/dzień). Archiwum buduje się:
//  1. w cronie news-digest (refresh+merge PRZED buildem — 16:05 UTC),
//  2. przy każdym `/api/news?refresh=1` (merge awaited — bez fire-and-forget),
//  3. cron news-archive 20:00 UTC = backup.
// Na Pro można dodać `0 */2 * * *` — patrz komentarz w vercel.json.

import { getServerCache, setServerCache } from '@/lib/server-cache';
import { NEWS_SOURCES, type NewsOwner } from '@/lib/news/sources';
import { warsawDateKey } from '@/lib/news/warsaw-date';
import type { NewsItem } from '@/lib/news/types';

/** ~1 rok — archiwum dzienne musi przeżyć TTL feedu (15 min). */
export const ARCHIVE_MAX_AGE_MS = 365 * 24 * 3600 * 1000;

export const NEWS_ARCHIVE_COLLECTION = 'news_archive';

/** Surowa pozycja w archiwum — BEZ importance/corroboration/clusterId (przeliczane w Etap 1). */
export interface NewsArchiveItem {
    title: string;
    link: string;
    publishedAt: string;
    description: string;
    sourceId: string;
    source: string;
    section: string;
    owner?: NewsOwner;
}

export interface NewsArchiveDoc {
    date: string;
    items: NewsArchiveItem[];
}

const OWNER_OF = new Map(NEWS_SOURCES.map((s) => [s.id, s.owner]));

export function toArchiveItem(it: Pick<NewsItem, 'title' | 'link' | 'publishedAt' | 'description' | 'sourceId' | 'source' | 'section'> & { owner?: NewsOwner }): NewsArchiveItem {
    const owner = it.owner ?? OWNER_OF.get(it.sourceId);
    return {
        title: it.title,
        link: it.link,
        publishedAt: it.publishedAt,
        description: it.description ?? '',
        sourceId: it.sourceId,
        source: it.source,
        section: it.section,
        ...(owner ? { owner } : {}),
    };
}

/** Dedup po `link` — nowsze / dłuższy opis wygrywa przy kolizji. */
export function dedupByLink(items: NewsArchiveItem[]): NewsArchiveItem[] {
    const byLink = new Map<string, NewsArchiveItem>();
    for (const it of items) {
        const key = it.link.trim();
        if (!key) continue;
        const cur = byLink.get(key);
        if (!cur) {
            byLink.set(key, it);
            continue;
        }
        // Preferuj nowszy publishedAt; przy remisie dłuższy opis.
        if (it.publishedAt > cur.publishedAt
            || (it.publishedAt === cur.publishedAt && it.description.length > cur.description.length)) {
            byLink.set(key, it);
        }
    }
    return [...byLink.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function readNewsArchive(date: string): Promise<NewsArchiveDoc | null> {
    const cached = await getServerCache<NewsArchiveDoc>(
        NEWS_ARCHIVE_COLLECTION,
        date,
        ARCHIVE_MAX_AGE_MS,
    );
    if (!cached) return null;
    return { date: cached.date ?? date, items: cached.items ?? [] };
}

/**
 * Scala surowe pozycje do archiwum dnia `date` (klucz Warsaw).
 * Domyślnie filtruje pozycje, których publishedAt (Warsaw) ≠ date — RSS trzyma wczorajsze
 * headline'y, a digest dnia D ma brać tylko newsy z dnia D.
 */
export async function mergeNewsArchive(
    incoming: NewsArchiveItem[],
    date: string = warsawDateKey(),
    opts: { onlySameDay?: boolean } = {},
): Promise<NewsArchiveDoc> {
    const onlySameDay = opts.onlySameDay !== false;
    const filtered = onlySameDay
        ? incoming.filter((it) => warsawDateKey(it.publishedAt) === date)
        : incoming;

    const existing = await readNewsArchive(date);
    const merged = dedupByLink([...(existing?.items ?? []), ...filtered.map(toArchiveItem)]);
    const doc: NewsArchiveDoc = { date, items: merged };

    await setServerCache(NEWS_ARCHIVE_COLLECTION, date, doc, 'news-archive');
    return doc;
}

/** Append z wyniku `/api/news` (po refresh) — wywołanie fire-and-forget OK. */
export async function appendFeedToTodayArchive(items: NewsItem[]): Promise<NewsArchiveDoc> {
    const date = warsawDateKey();
    return mergeNewsArchive(items.map(toArchiveItem), date);
}
