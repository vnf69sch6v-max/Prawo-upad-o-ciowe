/**
 * Cron: budowa Daily Digest raz dziennie (~18:05 Europe/Warsaw).
 *
 * Vercel Hobby: 1 cron/dzień — OK. Harmonogram UTC: 16:05 ≈ 18:05 CEST (latem),
 * zimą (CET) ≈ 17:05 Warsaw. Makro (Etap 2) dokładane później w tym samym cronie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildAndSaveDigest } from '@/lib/news/build-digest';
import { fetchMacroChangesForDate } from '@/lib/news/daily-macro';
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
        const macro = await fetchMacroChangesForDate(date);
        const digest = await buildAndSaveDigest(date, macro);
        return NextResponse.json({
            ok: true,
            date,
            points: digest.punkty.length,
            macro: digest.dane.length,
            tomorrowEvents: digest.jutro.events.length,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[news-digest cron]', err);
        return NextResponse.json({ error: String(err), date }, { status: 500 });
    }
}
