import { NextRequest, NextResponse } from 'next/server';
import { getJpTrade } from '@/lib/jp/trade-server';

// Trzy serie × 10 s + dwa odstępy 0,3 s. Limit 30 s uciąłby ostatnią serię przy wolnym Dashboardzie.
export const maxDuration = 45;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpTrade({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/trade]', err);
        return NextResponse.json({ error: 'Bilans płatniczy Japonii chwilowo niedostępny' }, { status: 502 });
    }
}
