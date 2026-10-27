import { NextRequest, NextResponse } from 'next/server';
import { getJpJobs } from '@/lib/jp/jobs-server';

// Trzy serie × 10 s + dwa odstępy 0,3 s = 30,6 s.
export const maxDuration = 45;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpJobs({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/jobs]', err);
        return NextResponse.json({ error: 'Oferty pracy w Japonii chwilowo niedostępne' }, { status: 502 });
    }
}
