// NBP API Proxy — handles weekend/holiday fallback + Firestore cache
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const NBP_BASE = 'https://api.nbp.pl/api';

async function fetchNBP(endpoint: string, fallback: string) {
    const res = await fetch(`${NBP_BASE}/${endpoint}/?format=json`, {
        next: { revalidate: 300 },
    });
    if (res.ok) return res.json();

    if (res.status === 404 && fallback) {
        const fallbackRes = await fetch(`${NBP_BASE}/${fallback}/?format=json`, {
            next: { revalidate: 300 },
        });
        if (fallbackRes.ok) return fallbackRes.json();
    }

    throw new Error(`NBP API error: ${res.status}`);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'exchangerates/tables/a/today';
    const fallback = searchParams.get('fallback') || 'exchangerates/tables/a/last/1';
    const cacheKey = endpoint.replace(/\//g, '_');

    try {
        const data = await withCache(
            'exchange_rates',
            cacheKey,
            () => fetchNBP(endpoint, fallback),
            'NBP API',
            6 * 3600 * 1000
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('NBP API error:', error);
        return NextResponse.json({ error: 'Failed to fetch NBP data' }, { status: 500 });
    }
}
