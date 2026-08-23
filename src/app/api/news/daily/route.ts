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
        return NextResponse.json({ date, empty: true, digest: null }, { status: 404 });
    }

    return NextResponse.json({ date, digest });
}
