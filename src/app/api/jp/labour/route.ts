import { NextRequest, NextResponse } from 'next/server';
import { getJpLabour } from '@/lib/jp/labour-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpLabour({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/labour]', err);
        return NextResponse.json({ error: 'Labour Force Survey chwilowo niedostępne' }, { status: 502 });
    }
}
