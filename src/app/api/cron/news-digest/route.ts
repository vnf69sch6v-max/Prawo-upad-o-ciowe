/**
 * Cron: budowa Daily Digest raz dziennie (~18:05 Europe/Warsaw).
 *
 * Vercel Hobby: 1 cron/dzień — OK. Harmonogram UTC: 16:05 ≈ 18:05 CEST (latem),
 * zimą (CET) ≈ 17:05 Warsaw.
 *
 * Kolejność OBOWIĄZKOWA: najpierw refresh RSS + merge do archiwum dnia, potem build.
 * Cron `news-archive` (20:00 UTC) to tylko backup — digest NIE może na niego czekać.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildAndSaveDigest } from '@/lib/news/build-digest';
import { fetchMacroChangesForDate } from '@/lib/news/daily-macro';
import { refreshAndMergeTodayArchive } from '@/lib/news/feed';
import { warsawDateKey } from '@/lib/news/warsaw-date';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const date = warsawDateKey();
    try {
        const { feed, archiveCount, sameDayCount, archiveItems } = await refreshAndMergeTodayArchive();
        const macro = await fetchMacroChangesForDate(date);
        const digest = await buildAndSaveDigest(date, macro, archiveItems);
        return NextResponse.json({
            ok: true,
            date,
            points: digest.punkty.length,
            macro: digest.dane.length,
            tomorrowEvents: digest.jutro.events.length,
            // Telemetria akapitu — widoczna bez wchodzenia do Firestore. Regularne
            // `summaryRejected` to sygnał, że model nie nadaje się do tego zadania
            // i trzeba zostać przy szablonie, a nie rozluźniać walidator.
            summaryOrigin: digest.podsumowanie?.origin ?? 'brak',
            summaryRejected: digest.podsumowanie?.rejectedReason ?? null,
            summaryTokens: digest.podsumowanie?.tokens ?? null,
            feedCount: feed.count,
            sameDayCount,
            archiveCount,
            sourcesOk: feed.sourcesOk,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[news-digest cron]', err);
        return NextResponse.json({ error: String(err), date }, { status: 500 });
    }
}
