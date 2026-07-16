// Agregator newsów: pobiera równolegle zweryfikowane feedy RSS → parsuje → scala → odduplikowuje
// → sortuje malejąco po dacie. Lista źródeł (wraz z listą ODRZUCONYCH i powodem) → src/lib/news/sources.ts.
// RSS ma limity niezależne od GUS DBW, więc odświeżanie jest tu bezpieczne.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { NEWS_SOURCES } from '@/lib/news/sources';
import { parseRss, urlKey, titleKey } from '@/lib/news/parse';

export const revalidate = 0;

const TTL_MS = 15 * 60 * 1000; // 15 min — newsy starzeją się szybko
const FETCH_TIMEOUT_MS = 8000;
// Część serwisów odrzuca żądania bez nagłówka UA (albo serwuje HTML zamiast XML).
const UA = 'Mozilla/5.0 (compatible; MakroDataPlatform/1.0; +https://github.com/) AppleWebKit/537.36';

export interface NewsItem {
    title: string;
    link: string;
    publishedAt: string;
    description: string;
    sourceId: string;
    source: string;
    section: string;
}

interface SourceStatus {
    id: string;
    name: string;
    ok: boolean;
    count: number;
    error?: string;
}

async function fetchSource(src: (typeof NEWS_SOURCES)[number]): Promise<{ items: NewsItem[]; status: SourceStatus }> {
    const base: SourceStatus = { id: src.id, name: src.name, ok: false, count: 0 };
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
            // Feed odpowiedział, ale bez pozycji (np. serwis podmienił XML na stronę HTML).
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

async function buildFeed() {
    const settled = await Promise.all(NEWS_SOURCES.map(fetchSource));

    const sources = settled.map((s) => s.status);
    const seenUrl = new Set<string>();
    const seenTitle = new Set<string>();
    const merged: NewsItem[] = [];

    // Odrzucamy pozycje z datą wyraźnie w przyszłości — chroni sortowanie przed błędną
    // strefą u wydawcy; 2h tolerancji na rozjazd zegarów.
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

    return {
        timestamp: new Date().toISOString(),
        sourcesOk: sources.filter((s) => s.ok).length,
        sourcesTotal: sources.length,
        count: merged.length,
        sources,
        items: merged.slice(0, 150),
    };
}

export async function GET(request: NextRequest) {
    try {
        const refresh = new URL(request.url).searchParams.get('refresh') === '1';
        const result = await withCache(
            'news',
            'rss_pl',
            buildFeed,
            'RSS: Bankier, Money.pl, Business Insider PL, Interia, Puls Biznesu, wnp.pl',
            refresh ? 0 : TTL_MS,
        );
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
