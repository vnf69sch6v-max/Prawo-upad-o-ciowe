// Stopa BOJ, call overnight i USD/JPY. Strona czyta tylko cache.
import { NextRequest, NextResponse } from 'next/server';
import { getBojMarkets } from '@/lib/jp/boj-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getBojMarkets({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/markets]', err);
        return NextResponse.json({ error: 'Bank Japonii chwilowo niedostępny' }, { status: 502 });
    }
}
