import { NextRequest, NextResponse } from 'next/server';
import { getJpCgpi } from '@/lib/jp/cgpi-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpCgpi({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/cgpi]', err);
        return NextResponse.json({ error: 'Ceny producenta w Japonii chwilowo niedostępne' }, { status: 502 });
    }
}
