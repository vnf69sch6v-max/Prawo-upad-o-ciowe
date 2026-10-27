import { NextRequest, NextResponse } from 'next/server';
import { getJpIndustry } from '@/lib/jp/industry-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpIndustry({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/industry]', err);
        return NextResponse.json({ error: 'Indeks produkcji przemysłowej chwilowo niedostępny' }, { status: 502 });
    }
}
