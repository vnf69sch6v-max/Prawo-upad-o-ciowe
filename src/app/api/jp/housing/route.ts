import { NextRequest, NextResponse } from 'next/server';
import { getJpHousing } from '@/lib/jp/housing-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpHousing({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/housing]', err);
        return NextResponse.json({ error: 'Nowe mieszkania w Japonii chwilowo niedostępne' }, { status: 502 });
    }
}
