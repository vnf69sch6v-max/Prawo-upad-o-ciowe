// Agregator newsów: pobiera równolegle zweryfikowane feedy RSS → parsuje → scala → odduplikowuje
// → sortuje malejąco po dacie. Lista źródeł (wraz z listą ODRZUCONYCH i powodem) → src/lib/news/sources.ts.
// RSS ma limity niezależne od GUS DBW, więc odświeżanie jest tu bezpieczne.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { appendFeedToTodayArchive } from '@/lib/news/archive';
import { buildNewsFeed } from '@/lib/news/feed';

export const revalidate = 0;

const TTL_MS = 15 * 60 * 1000; // 15 min — newsy starzeją się szybko

export async function GET(request: NextRequest) {
    try {
        const refresh = new URL(request.url).searchParams.get('refresh') === '1';
        const result = await withCache(
            'news',
            'rss_pl',
            buildNewsFeed,
            'RSS: Bankier, Money.pl, BI PL, Interia, PB, wnp.pl, ISBnews, GUS, 300Gospodarka',
            refresh ? 0 : TTL_MS,
        );

        // Hobby: Vercel pozwala tylko 1 cron/dzień — archiwum dzienne budujemy przy każdym
        // `?refresh=1` (cron/refresh, ręczny warm, cron archive/digest). BEZ await merge ginąłby
        // na serverless (fire-and-forget zamrażane po odpowiedzi HTTP) → digest dostawał points:0.
        if (refresh && result?.items?.length) {
            try {
                await appendFeedToTodayArchive(result.items);
            } catch (err) {
                console.error('[news-archive] merge-on-refresh:', err);
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
