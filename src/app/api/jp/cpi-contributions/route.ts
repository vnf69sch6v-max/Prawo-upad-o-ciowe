// Oficjalne wkłady CPI Japonii (e-Stat, tabela 5). Strona czyta tylko cache.
import { NextRequest, NextResponse } from 'next/server';
import { getJpContributions } from '@/lib/jp/contributions-server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const force = request.nextUrl.searchParams.get('refresh') === '1';
    try {
        const data = await getJpContributions({ force });
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch (err) {
        console.error('[jp/cpi-contributions]', err);
        return NextResponse.json({ error: 'Tabela wkładów CPI chwilowo niedostępna' }, { status: 502 });
    }
}
