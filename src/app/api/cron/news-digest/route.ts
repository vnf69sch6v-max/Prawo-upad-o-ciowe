/**
 * Cron: budowa Daily Digest raz dziennie (~18:05 Europe/Warsaw).
 *
 * Vercel Hobby: 1 cron/dzień — OK. Harmonogram UTC: 16:05 ≈ 18:05 CEST (latem),
 * zimą (CET) ≈ 17:05 Warsaw.
 *
 * Kolejność OBOWIĄZKOWA:
 * 1) refresh RSS + merge archiwum dnia
 * 2) warm NBP + Stooq (cache only for DBW/CPI — bez ?refresh DBW)
 * 3) makro Etap 2 + build digest
 *
 * Cron `news-archive` (20:00 UTC) to tylko backup — digest NIE może na niego czekać.
 * Stooq EOD bywa po zamknięciu GPW; warm tuż przed makrem łata wyścig z cronem 15:20/17:30.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildAndSaveDigest } from '@/lib/news/build-digest';
import { fetchMacroChangesWithDiagnostics } from '@/lib/news/daily-macro';
import { refreshAndMergeTodayArchive } from '@/lib/news/feed';
import { warsawDateKey } from '@/lib/news/warsaw-date';

export const maxDuration = 60;

const MACRO_WARM = [
    '/api/nbp?table=a&refresh=1',
    '/api/nbp?code=EUR&last=30&refresh=1',
    '/api/nbp?code=USD&last=30&refresh=1',
    '/api/stooq?symbol=wig20&limit=60&refresh=1',
    '/api/stooq?symbol=mwig40&limit=60&refresh=1',
    '/api/stooq?symbol=swig80&limit=60&refresh=1',
    '/api/stooq?symbol=10ypl.b&limit=30&refresh=1',
];

async function warmMacroSources(origin: string): Promise<Record<string, number | string>> {
    const entries = await Promise.all(
        MACRO_WARM.map(async (ep) => {
            try {
                const res = await fetch(origin + ep, { cache: 'no-store' });
                return [ep, res.status] as const;
            } catch (e) {
                return [ep, `error: ${String(e).slice(0, 80)}`] as const;
            }
        }),
    );
    return Object.fromEntries(entries);
}

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization');
    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const date = warsawDateKey();
    const origin = new URL(request.url).origin;
    try {
        const { feed, archiveCount, sameDayCount, archiveItems } = await refreshAndMergeTodayArchive();
        const macroWarm = await warmMacroSources(origin);
        const { changes: macro, diagnostics } = await fetchMacroChangesWithDiagnostics(date);
        const digest = await buildAndSaveDigest(date, macro, archiveItems);
        return NextResponse.json({
            ok: true,
            date,
            points: digest.punkty.length,
            macro: digest.dane.length,
            macroEmptyReason: diagnostics.emptyReason,
            macroSkipped: diagnostics.skipped,
            macroWarm,
            tomorrowEvents: digest.jutro.events.length,
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
