// NBP API Proxy — tables, single-currency history, gold. Weekend/holiday fallback + Firestore cache.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { nbpCacheTtlMs } from '@/lib/market-hours';

const NBP_BASE = 'https://api.nbp.pl/api';

async function fetchNBP(endpoint: string, fallback?: string): Promise<unknown> {
    const res = await fetch(`${NBP_BASE}/${endpoint}/?format=json`, { next: { revalidate: 300 } });
    if (res.ok) return res.json();

    if (res.status === 404 && fallback) {
        const fb = await fetch(`${NBP_BASE}/${fallback}/?format=json`, { next: { revalidate: 300 } });
        if (fb.ok) return fb.json();
    }
    throw new Error(`NBP API error: ${res.status}`);
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const table = sp.get('table');
    const code = sp.get('code');
    const last = sp.get('last');
    const gold = sp.get('gold');
    const force = sp.get('refresh') === '1'; // cron warm → wymuś refetch (pomiń cache)

    let endpoint: string;
    let fallback: string | undefined;
    let cacheKey: string;
    let mode: 'gold' | 'history' | 'table' | 'raw';

    if (gold === 'true') {
        const n = last || '30';
        endpoint = `cenyzlota/last/${n}`;
        cacheKey = `gold_${n}`;
        mode = 'gold';
    } else if (code) {
        // Single-currency history: /exchangerates/rates/{table}/{code}/last/{n}
        const t = (table || 'a').toLowerCase();
        const n = last || '30';
        endpoint = `exchangerates/rates/${t}/${code.toLowerCase()}/last/${n}`;
        cacheKey = `hist_${t}_${code.toLowerCase()}_${n}`;
        mode = 'history';
    } else if (table) {
        endpoint = `exchangerates/tables/${table}/today`;
        fallback = `exchangerates/tables/${table}/last/1`;
        cacheKey = `table_${table}`;
        mode = 'table';
    } else {
        // Backward-compatible endpoint/fallback form
        endpoint = sp.get('endpoint') || 'exchangerates/tables/a/today';
        fallback = sp.get('fallback') || 'exchangerates/tables/a/last/1';
        cacheKey = endpoint.replace(/\//g, '_');
        mode = 'raw';
    }

    try {
        const data = await withCache(
            'exchange_rates',
            cacheKey,
            async () => {
                const raw = await fetchNBP(endpoint, fallback);
                // Normalise currency history to a flat [{ no, effectiveDate, mid }] array
                if (mode === 'history') {
                    const rates = (raw as { rates?: unknown[] })?.rates;
                    return Array.isArray(rates) ? rates : [];
                }
                return raw; // table → [{ rates, ... }]; gold → [{ data, cena }]; raw → as-is
            },
            'NBP API',
            force ? -1 : nbpCacheTtlMs()
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('NBP API error:', error);
        return NextResponse.json({ error: 'Failed to fetch NBP data' }, { status: 500 });
    }
}
