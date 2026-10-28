import { NextRequest, NextResponse } from 'next/server';
import { getJpTankan } from '@/lib/jp/tankan-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpTankan({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/tankan]', err);
        return NextResponse.json({ error: 'Nastroje firm w Japonii chwilowo niedostępne' }, { status: 502 });
    }
}
