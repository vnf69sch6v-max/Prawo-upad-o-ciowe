// GET /api/news/brief?kind=daily|weekly — odczyt gotowego briefu (generuje go wyłącznie cron `brief`).
import { NextRequest, NextResponse } from 'next/server';
import { readBrief } from '@/lib/news/brief-server';

export const revalidate = 0;

export async function GET(request: NextRequest) {
    const kind = new URL(request.url).searchParams.get('kind') === 'weekly' ? 'weekly' : 'daily';
    const brief = await readBrief(kind);
    // 200 z `brief: null` — brak klucza lub briefu to stan oczekiwany, nie błąd (karta się chowa).
    return NextResponse.json({ kind, brief }, { headers: { 'Cache-Control': 'private, max-age=300' } });
}
