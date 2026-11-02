// Polska na tle UE — HICP r/r (PL, strefa euro, DE, CZ, HU). Stały klucz cache: jedyny parametr to `refresh=1`.
import { NextRequest, NextResponse } from 'next/server';
import { getEuHicp } from '@/lib/eu/hicp-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getEuHicp({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[eu-hicp]', err);
        return NextResponse.json({ error: 'Dane Eurostatu chwilowo niedostępne' }, { status: 502 });
    }
}
