// Japonia — inflacja CPI (Statistics Dashboard, baza 2025). Konfiguracja serii: src/lib/jp/cpi.ts.
import { NextRequest, NextResponse } from 'next/server';
import { getJpCpi } from '@/lib/jp/cpi-server';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // Cron / kontrola świeżości: `refresh=1` — do źródła najwyżej raz na 10 min (FORCED_REFRESH_MIN_AGE_MS).
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpCpi({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/cpi]', err);
        return NextResponse.json({ error: 'Statistics Dashboard chwilowo niedostępny' }, { status: 502 });
    }
}
