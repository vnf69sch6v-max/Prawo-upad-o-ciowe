// Rynki: proxy do notowań + cache. Stooq od pewnego czasu serwuje anty-botowe wyzwanie JS
// do zapytań serwerowych, więc dla kluczowych symboli (indeksy, surowce) używamy Yahoo Finance,
// który działa serwerowo i zwraca czysty JSON. Kształt odpowiedzi identyczny — UI bez zmian.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

interface Bar { date: string; open: number; high: number; low: number; close: number; volume: number }
interface StooqResult { symbol: string; data: Bar[]; latest: Bar | null }

// Mapa symbol-appki → symbol Yahoo. Yahoo używamy jako podstawowego dla tych, bo Stooq blokuje serwer.
const YAHOO_MAP: Record<string, string> = {
    wig: 'WIG.WA', mwig40: 'MWIG40.WA', swig80: 'SWIG80.WA',
    'cb.c': 'BZ=F', 'cl.c': 'CL=F', // Brent / WTI (dodatkowy fallback obok EIA)
    'gc.c': 'GC=F', 'hg.c': 'HG=F', 'ng.c': 'NG=F', // złoto / miedź / gaz ziemny
};

// Symbole, dla których Yahoo NIE ma historii samego indeksu (np. WIG20.WA = tylko bieżąca wartość),
// ale ETF replikujący ma pełną serię dzienną. Bierzemy serię z ETF-a i skalujemy ją tak, by ostatni
// punkt równał się żywemu poziomowi indeksu — dostajemy poprawny poziom + realny trend/deltę.
const YAHOO_PROXY: Record<string, { level: string; series: string }> = {
    wig20: { level: 'WIG20.WA', series: 'ETFBW20TR.WA' }, // Beta ETF WIG20TR
};

async function fetchYahoo(ySymbol: string, appSymbol: string, limit: number): Promise<StooqResult> {
    // dobierz zakres tak, by pokryć `limit` sesji dziennych
    const range = limit <= 5 ? '5d' : limit <= 30 ? '3mo' : limit <= 90 ? '6mo' : '1y';
    const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?range=${range}&interval=1d`,
        { next: { revalidate: 3600 }, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`Yahoo error: ${res.status}`);
    const json = await res.json();
    const r = json?.chart?.result?.[0];
    const ts: number[] = r?.timestamp ?? [];
    const q = r?.indicators?.quote?.[0] ?? {};
    if (!ts.length || !q.close) throw new Error('Yahoo: brak danych');
    const data: Bar[] = ts.map((t: number, i: number) => ({
        date: new Date(t * 1000).toISOString().slice(0, 10),
        open: q.open?.[i] ?? 0, high: q.high?.[i] ?? 0, low: q.low?.[i] ?? 0,
        close: q.close?.[i] ?? 0, volume: q.volume?.[i] ?? 0,
    })).filter((d: Bar) => d.close > 0);
    const limited = data.slice(-limit);
    return { symbol: appSymbol, data: limited, latest: limited[limited.length - 1] || null };
}

async function fetchStooq(symbol: string, interval: string, limit: number): Promise<StooqResult> {
    const res = await fetch(`https://stooq.pl/q/d/l/?s=${symbol}&i=${interval}`, {
        next: { revalidate: 3600 }, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoDashboard/1.0)' },
    });
    if (!res.ok) throw new Error(`Stooq error: ${res.status}`);
    const csv = await res.text();
    const head = csv.trimStart().slice(0, 200).toLowerCase();
    if (head.startsWith('<') || head.includes('<html') || head.includes('<script') || head.includes('<!doctype')) {
        throw new Error('Stooq zwrócił stronę-wyzwanie (blokada anty-bot)');
    }
    const lines = csv.trim().split('\n');
    if (lines.length < 2 || lines[1]?.trim() === 'Brak danych') throw new Error('Empty data from Stooq');
    const data = lines.slice(1).map(line => {
        const v = line.split(',');
        return { date: v[0], open: parseFloat(v[1]) || 0, high: parseFloat(v[2]) || 0, low: parseFloat(v[3]) || 0, close: parseFloat(v[4]) || 0, volume: parseFloat(v[5]) || 0 };
    }).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.close > 0);
    const limited = data.slice(-limit);
    return { symbol, data: limited, latest: limited[limited.length - 1] || null };
}

/** Seria z ETF-a (historia) przeskalowana do żywego poziomu indeksu (ostatni punkt = poziom indeksu). */
async function fetchYahooProxy(appSymbol: string, cfg: { level: string; series: string }, limit: number): Promise<StooqResult> {
    const series = await fetchYahoo(cfg.series, appSymbol, limit);
    let scale = 1;
    try {
        const lvl = await fetchYahoo(cfg.level, appSymbol, 1);
        const live = lvl.latest?.close, last = series.latest?.close;
        if (live && last) scale = live / last;
    } catch { /* brak żywego poziomu → seria ETF bez skalowania */ }
    const data = series.data.map((b) => ({ ...b, open: b.open * scale, high: b.high * scale, low: b.low * scale, close: b.close * scale }));
    return { symbol: appSymbol, data, latest: data[data.length - 1] || null };
}

/** Yahoo-first dla zmapowanych symboli (Stooq blokuje serwer), z fallbackiem na Stooq. */
async function fetchQuote(symbol: string, interval: string, limit: number): Promise<StooqResult> {
    const key = symbol.toLowerCase();
    const proxy = YAHOO_PROXY[key];
    if (proxy) {
        try { return await fetchYahooProxy(symbol, proxy, limit); } catch { /* spróbuj Stooq poniżej */ }
    }
    const y = YAHOO_MAP[key];
    if (y) {
        try { return await fetchYahoo(y, symbol, limit); } catch { /* spróbuj Stooq poniżej */ }
    }
    return fetchStooq(symbol, interval, limit);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'wig20';
    const interval = searchParams.get('interval') || 'd';
    const limit = parseInt(searchParams.get('limit') || '90');

    try {
        const data = await withCache<StooqResult>(
            'market_data', `stooq_${symbol}_${limit}`,
            () => fetchQuote(symbol, interval, limit),
            'Rynki (Yahoo/Stooq)', 2 * 3600 * 1000,
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('Rynki fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
