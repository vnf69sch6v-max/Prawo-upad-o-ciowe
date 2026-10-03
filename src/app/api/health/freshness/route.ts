// Kontrola świeżości danych: dla każdego zbioru najnowszy okres w NASZYM API vs okres, który wg
// harmonogramu publikacji powinien już być (reguły: src/lib/freshness.ts). Odpytuje te same endpointy
// co strony (bez `refresh=1`), więc widzi dokładnie to, co użytkownik — łącznie z cache w Firestore.
//
// HTTP 200 = brak `stale`/`error` (`lag` to tylko ostrzeżenie), 503 = coś jest nieaktualne albo padło
// — nadaje się wprost do zewnętrznego monitoringu (UptimeRobot itp.). Wynik w CDN na 5 min.
import { NextRequest, NextResponse } from 'next/server';
import { httpStatusFor } from '@/lib/freshness';
import { runFreshnessCheck } from '@/lib/freshness-check';
import { readCronRuns } from '@/lib/cron-log';
import { evaluateCronRuns } from '@/lib/cron-runs';
import { internalOrigin } from '@/lib/internal-fetch';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    const origin = internalOrigin(request);
    const [report, runs] = await Promise.all([runFreshnessCheck(origin), readCronRuns()]);
    // Przebiegi cronów są informacją (dowód automatu), nie zmieniają kodu HTTP — ten zależy od danych.
    const crons = runs ? { available: true, items: evaluateCronRuns(runs, new Date()) } : { available: false, items: [] };
    return NextResponse.json({ ...report, crons }, {
        status: httpStatusFor(report.items),
        headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
}
