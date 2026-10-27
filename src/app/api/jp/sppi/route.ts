import { NextRequest, NextResponse } from 'next/server';
import { getJpSppi } from '@/lib/jp/sppi-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpSppi({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/sppi]', err);
        return NextResponse.json({ error: 'Ceny usług dla firm w Japonii chwilowo niedostępne' }, { status: 502 });
    }
}
