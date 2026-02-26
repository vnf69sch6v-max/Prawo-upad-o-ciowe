// Cron job: Fetch & cache Stooq data (indices, stocks, rates)
// Schedule: Mon-Fri 17:30 CET (after GPW closes)
import { NextResponse } from 'next/server';

const STOOQ_BASE = 'https://stooq.pl/q/d/l';

const SYMBOLS = {
    indices: ['wig20', 'wig', 'mwig40', 'swig80'],
    stocks: ['pko', 'pzu', 'kgh', 'pkn', 'peo', 'cdr', 'ale', 'dnp', 'lpp', 'mbk', 'alr', 'jsw', 'pge', 'opl', 'cps', 'kru', 'kty', 'spl'],
    rates: ['ploprate3m.b', 'ploprate6m.b'],
    bonds: ['2ypl.b', '5ypl.b', '10ypl.b'],
    currencies: ['usdpln', 'eurpln', 'gbppln', 'chfpln'],
};

async function fetchStooq(symbol: string): Promise<string | null> {
    try {
        const res = await fetch(`${STOOQ_BASE}/?s=${symbol}&i=d`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoDashboard/1.0)' },
        });
        if (res.ok) return res.text();
    } catch { /* skip */ }
    return null;
}

export async function GET() {
    const results: Record<string, string> = {};
    const allSymbols = [
        ...SYMBOLS.indices,
        ...SYMBOLS.stocks,
        ...SYMBOLS.rates,
        ...SYMBOLS.bonds,
        ...SYMBOLS.currencies,
    ];

    // Fetch with delay between requests to avoid rate limiting
    for (const symbol of allSymbols) {
        const csv = await fetchStooq(symbol);
        results[symbol] = csv ? 'ok' : 'failed';
        // Small delay to avoid throttling
        await new Promise(r => setTimeout(r, 200));
    }

    return NextResponse.json({
        status: 'success',
        timestamp: new Date().toISOString(),
        fetched: Object.values(results).filter(v => v === 'ok').length,
        total: allSymbols.length,
        results,
    });
}
