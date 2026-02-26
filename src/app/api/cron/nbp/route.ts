// Cron job: Fetch & cache NBP data (rates + gold)
// Schedule: Mon-Fri 13:00 CET (NBP publishes ~12:15)
import { NextResponse } from 'next/server';

const NBP_BASE = 'https://api.nbp.pl/api';

async function fetchWithFallback(primary: string, fallback: string) {
    const res = await fetch(`${NBP_BASE}/${primary}/?format=json`);
    if (res.ok) return res.json();
    if (res.status === 404) {
        const fb = await fetch(`${NBP_BASE}/${fallback}/?format=json`);
        if (fb.ok) return fb.json();
    }
    throw new Error(`NBP fetch failed: ${res.status}`);
}

export async function GET() {
    const results: Record<string, string> = {};

    try {
        // Table A rates
        const tableA = await fetchWithFallback(
            'exchangerates/tables/a/today',
            'exchangerates/tables/a/last/1'
        );
        results.tableA = 'ok';

        // Table C rates (buy/sell)
        try {
            const tableC = await fetchWithFallback(
                'exchangerates/tables/c/today',
                'exchangerates/tables/c/last/1'
            );
            results.tableC = 'ok';
        } catch { results.tableC = 'skipped'; }

        // Gold
        try {
            const gold = await fetchWithFallback(
                'cenyzlota/today',
                'cenyzlota/last/1'
            );
            results.gold = 'ok';
        } catch { results.gold = 'skipped'; }

        // Rate histories for main currencies
        const currencies = ['EUR', 'USD', 'CHF', 'GBP', 'JPY', 'CZK', 'SEK', 'NOK'];
        for (const code of currencies) {
            try {
                await fetch(`${NBP_BASE}/exchangerates/rates/a/${code}/last/30/?format=json`);
                results[`history_${code}`] = 'ok';
            } catch { results[`history_${code}`] = 'skipped'; }
        }

        return NextResponse.json({
            status: 'success',
            timestamp: new Date().toISOString(),
            results,
        });
    } catch (error) {
        console.error('NBP cron error:', error);
        return NextResponse.json({
            status: 'error',
            error: String(error),
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
