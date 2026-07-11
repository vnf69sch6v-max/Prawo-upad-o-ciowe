// Stooq CSV → JSON proxy + Firestore cache
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

interface StooqResult {
    symbol: string;
    data: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
    latest: { date: string; open: number; high: number; low: number; close: number; volume: number } | null;
}

async function fetchStooq(symbol: string, interval: string, limit: number): Promise<StooqResult> {
    const res = await fetch(
        `https://stooq.pl/q/d/l/?s=${symbol}&i=${interval}`,
        {
            next: { revalidate: 3600 },
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoDashboard/1.0)' },
        }
    );

    if (!res.ok) throw new Error(`Stooq error: ${res.status}`);

    const csv = await res.text();

    // Stooq now serves a JS/anti-bot challenge (HTML) to server-side fetches.
    // Detect it and fail cleanly instead of parsing HTML into garbage rows.
    const head = csv.trimStart().slice(0, 200).toLowerCase();
    if (head.startsWith('<') || head.includes('<html') || head.includes('<script') || head.includes('<!doctype')) {
        throw new Error('Stooq zwrócił stronę-wyzwanie (blokada anty-bot)');
    }

    const lines = csv.trim().split('\n');
    if (lines.length < 2 || lines[1]?.trim() === 'Brak danych') {
        throw new Error('Empty data from Stooq');
    }

    const data = lines.slice(1).map(line => {
        const v = line.split(',');
        return {
            date: v[0], open: parseFloat(v[1]) || 0, high: parseFloat(v[2]) || 0,
            low: parseFloat(v[3]) || 0, close: parseFloat(v[4]) || 0, volume: parseFloat(v[5]) || 0,
        };
    }).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.close > 0);

    const limited = data.slice(-limit);
    return { symbol, data: limited, latest: limited[limited.length - 1] || null };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'wig20';
    const interval = searchParams.get('interval') || 'd';
    const limit = parseInt(searchParams.get('limit') || '90');

    try {
        const data = await withCache<StooqResult>(
            'market_data',
            `stooq_${symbol}_${limit}`,
            () => fetchStooq(symbol, interval, limit),
            'Stooq CSV',
            2 * 3600 * 1000
        );
        return NextResponse.json(data);
    } catch (error) {
        console.error('Stooq fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch Stooq data' }, { status: 500 });
    }
}
