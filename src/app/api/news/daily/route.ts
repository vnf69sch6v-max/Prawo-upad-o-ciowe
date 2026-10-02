// GET /api/news/daily?date=YYYY-MM-DD — odczyt gotowego digestu (zbudowanego przez cron).
import { NextRequest, NextResponse } from 'next/server';
import { readDailyDigest } from '@/lib/news/digest-store';
import { warsawDateKey } from '@/lib/news/warsaw-date';

export const revalidate = 0;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const raw = sp.get('date');
    const date = raw && DATE_RE.test(raw) ? raw : warsawDateKey();

    const digest = await readDailyDigest(date);
    if (!digest || digest.punkty.length === 0) {
        // 200, nie 404: „digestu na dziś jeszcze nie ma" to stan oczekiwany do ~18:00 (cron 16:05 UTC),
        // a 404 lądowało jako czerwony błąd w konsoli KAŻDEJ strony z pasem newsów. Klient czyta `empty`.
        return NextResponse.json({ date, empty: true, digest: null });
    }

    return NextResponse.json({ date, digest });
}
