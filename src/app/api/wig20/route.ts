// Notowania spółek WIG20 — jedno zbiorcze żądanie zamiast 21 osobnych z przeglądarki.
// Źródło: Yahoo Finance (`<TICKER>.WA`). Skład i weryfikacja tickerów: lib/wig20.ts.
//
// Dlaczego Yahoo, a nie Stooq: stooq.pl na żądanie SERWERA zwraca HTML, zero wierszy danych
// (sprawdzone 2026-07-17 — patrz komentarz w api/stooq/route.ts). Yahoo ma dla pojedynczych
// spółek GPW pełną historię dzienną (125 punktów w teście), inaczej niż dla samych indeksów.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { WIG20 } from '@/lib/wig20';

export const revalidate = 0;

const TTL_MS = 2 * 3600 * 1000; // 2h — jak inne dane rynkowe
const FETCH_TIMEOUT_MS = 8000;

export interface Wig20Quote {
    ticker: string;
    name: string;
    /** Ostatnie zamknięcie (PLN). null = źródło nie odpowiedziało. */
    price: number | null;
    /** Zmiana % vs poprzednia sesja. null gdy brak dwóch punktów. */
    changePct: number | null;
    /** Data ostatniego odczytu (ISO). */
    date: string | null;
}

async function fetchOne(c: (typeof WIG20)[number]): Promise<Wig20Quote> {
    const base: Wig20Quote = { ticker: c.ticker, name: c.name, price: null, changePct: null, date: null };
    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${c.ticker}.WA?range=1mo&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' },
        );
        if (!res.ok) return base;

        const j = await res.json();
        const r = j?.chart?.result?.[0];
        const closes: (number | null)[] = r?.indicators?.quote?.[0]?.close ?? [];
        const stamps: number[] = r?.timestamp ?? [];
        const pts = closes
            .map((v, i) => ({ v, t: stamps[i] }))
            .filter((p): p is { v: number; t: number } => p.v != null && p.t != null);
        if (pts.length === 0) return base;

        const last = pts[pts.length - 1];
        const prev = pts.length > 1 ? pts[pts.length - 2] : null;
        return {
            ...base,
            price: +last.v.toFixed(2),
            changePct: prev ? +(((last.v / prev.v) - 1) * 100).toFixed(2) : null,
            date: new Date(last.t * 1000).toISOString().slice(0, 10),
        };
    } catch {
        return base;
    }
}

export async function GET(request: NextRequest) {
    const force = new URL(request.url).searchParams.get('refresh') === '1'; // cron warm → wymuś refetch
    try {
        const result = await withCache(
            'market_data',
            'wig20_spolki',
            async () => {
                const items = await Promise.all(WIG20.map(fetchOne));
                return {
                    timestamp: new Date().toISOString(),
                    count: items.length,
                    ok: items.filter((i) => i.price != null).length,
                    items,
                };
            },
            'Yahoo Finance (GPW)',
            force ? -1 : TTL_MS,
        );
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
