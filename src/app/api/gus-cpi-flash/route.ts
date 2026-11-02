// Szybki szacunek CPI GUS (komunikat z ostatniego dnia roboczego miesiąca). Spec: docs/specs/2026-11-02-cpi-szybki-szacunek.md.
// Bez parametrów poza `refresh=1` (cron dbw-1, samonaprawa świeżości) — nieznany parametr = 400, nic nie trafia do cache.
import { NextRequest, NextResponse } from 'next/server';
import { getCpiFlash } from '@/lib/cpi-flash-server';
import { badParam } from '@/lib/gus-params';

export const maxDuration = 15;

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams;
    for (const [k, v] of sp) {
        if (k !== 'refresh' || v !== '1') return badParam({ error: `nieznany parametr ${k}`, param: k });
    }
    const force = sp.get('refresh') === '1';
    try {
        const data = await getCpiFlash(force);
        return NextResponse.json(data, {
            headers: { 'Cache-Control': force ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=300' },
        });
    } catch (err) {
        console.error('[gus-cpi-flash]', err);
        return NextResponse.json({ error: 'Szybki szacunek CPI chwilowo niedostępny' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
}
