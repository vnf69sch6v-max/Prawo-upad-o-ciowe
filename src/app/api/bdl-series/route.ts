// Generic BDL series stitcher — monthly/quarterly BDL data lives as consecutive
// variable ids (one per month/quarter). Fetch a run of ids at unit-level=0 and assemble.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const BDL = 'https://bdl.stat.gov.pl/api/v1/data/by-variable';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchVar(id: number, year: number, apiKey?: string): Promise<number | null> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(`${BDL}/${id}?unit-level=0&format=json&year=${year}`, { headers, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(12000); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        const values = json?.results?.[0]?.values as { year: string; val: number | null }[] | undefined;
        const hit = values?.find((v) => String(v.year) === String(year));
        return hit?.val ?? null;
    }
    return null;
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const start = parseInt(sp.get('start') || '');
    const count = parseInt(sp.get('count') || '12');
    const year = parseInt(sp.get('year') || '2025');
    const freq = sp.get('freq') === 'q' ? 'q' : 'm';
    if (!start) return NextResponse.json({ error: 'Wymagane: start (id zmiennej)' }, { status: 400 });

    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;
    const cacheKey = `bdl_series_${start}_${count}_${year}_${freq}`;

    try {
        const result = await withCache(
            'macro_data',
            cacheKey,
            async () => {
                const series: { date: string; value: number }[] = [];
                for (let i = 0; i < count; i++) {
                    const val = await fetchVar(start + i, year, apiKey);
                    await sleep(120);
                    if (val == null) continue;
                    const date = freq === 'q' ? `${year}-Q${i + 1}` : `${year}-${String(i + 1).padStart(2, '0')}`;
                    series.push({ date, value: val });
                }
                return { series, source: 'GUS BDL' };
            },
            'GUS BDL',
            24 * 3600 * 1000,
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('BDL series error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
