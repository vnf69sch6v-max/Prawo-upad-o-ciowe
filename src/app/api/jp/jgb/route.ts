import { NextRequest, NextResponse } from 'next/server';
import { getJgb } from '@/lib/jp/jgb-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJgb({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/jgb]', err);
        return NextResponse.json({ error: 'Rentowność JGB chwilowo niedostępna' }, { status: 502 });
    }
}
