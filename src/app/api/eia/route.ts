// EIA API v2 proxy — Brent crude oil prices (backup for Stooq)
// https://api.eia.gov/v2/petroleum/pri/spt/data/
// Free API, key optional but recommended (https://www.eia.gov/opendata/register.php)

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const EIA_BASE = 'https://api.eia.gov/v2';

interface EIAResponse {
    response: {
        data: Array<{
            period: string;
            value: number;
            'series-description': string;
        }>;
    };
}

interface BrentResult {
    data: Array<{ date: string; close: number }>;
    latest: { date: string; close: number } | null;
    avg30d: number | null;
    avgPrev30d: number | null;
    changeMM: number | null;
    source: string;
}

async function fetchEIABrent(apiKey: string | undefined, limit: number): Promise<BrentResult> {
    // EIA series: PET.RBRTE.D = Brent crude daily spot price (USD/bbl)
    const keyParam = apiKey ? `&api_key=${apiKey}` : '';
    const url = `${EIA_BASE}/petroleum/pri/spt/data/?frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=${limit}${keyParam}`;

    const res = await fetch(url, {
        next: { revalidate: 7200 }, // Cache 2h
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
        throw new Error(`EIA API ${res.status}: ${res.statusText}`);
    }

    const json: EIAResponse = await res.json();
    const rawData = json.response?.data ?? [];

    // Sort chronologically (API returns desc)
    const data = rawData
        .filter(d => d.value != null && !isNaN(d.value))
        .map(d => ({ date: d.period, close: d.value }))
        .reverse();

    if (data.length === 0) {
        return { data: [], latest: null, avg30d: null, avgPrev30d: null, changeMM: null, source: 'EIA' };
    }

    // Compute 30-day and previous 30-day averages for M/M
    const last30 = data.slice(-30);
    const prev30 = data.slice(-60, -30);

    const avg = (arr: { close: number }[]) =>
        arr.length > 0 ? +(arr.reduce((s, d) => s + d.close, 0) / arr.length).toFixed(2) : null;

    const avg30d = avg(last30);
    const avgPrev30d = avg(prev30);
    const changeMM = avg30d && avgPrev30d ? +((avg30d / avgPrev30d - 1) * 100).toFixed(1) : null;

    return {
        data,
        latest: data[data.length - 1] || null,
        avg30d,
        avgPrev30d,
        changeMM,
        source: 'EIA PET.RBRTE.D',
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '90');
    const apiKey = process.env.EIA_API_KEY;

    try {
        const data = await withCache<BrentResult>(
            'market_data',
            `eia_brent_${limit}`,
            () => fetchEIABrent(apiKey, limit),
            'EIA API v2',
            2 * 3600 * 1000 // 2h cache
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('EIA API error:', error);
        return NextResponse.json({ error: 'Failed to fetch EIA Brent data', detail: String(error) }, { status: 500 });
    }
}
