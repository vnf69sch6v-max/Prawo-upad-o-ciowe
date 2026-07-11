// Generic BDL series stitcher — monthly/quarterly BDL data lives as consecutive
// variable ids (one per month/quarter). Each variable holds several years, so we
// fetch the previous + current year at once and assemble a rolling series to the latest.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const BDL = 'https://bdl.stat.gov.pl/api/v1/data/by-variable';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchVarYears(id: number, years: number[], apiKey?: string): Promise<Record<string, number | null>> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;
    const yq = years.map((y) => `year=${y}`).join('&');
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(`${BDL}/${id}?unit-level=0&format=json&${yq}`, { headers, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(12000); continue; }
        if (!res.ok) return {};
        const json = await res.json();
        const values = (json?.results?.[0]?.values as { year: string; val: number | null }[] | undefined) ?? [];
        return Object.fromEntries(values.map((v) => [String(v.year), v.val]));
    }
    return {};
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const start = parseInt(sp.get('start') || '');
    const count = parseInt(sp.get('count') || '12');
    const year = parseInt(sp.get('year') || String(new Date().getFullYear()));
    const freq = sp.get('freq') === 'q' ? 'q' : 'm';
    if (!start) return NextResponse.json({ error: 'Wymagane: start (id zmiennej)' }, { status: 400 });

    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;
    const years = [year - 1, year];
    const cacheKey = `bdl_series_${start}_${count}_${year}_${freq}_v2`;

    try {
        const result = await withCache(
            'macro_data',
            cacheKey,
            async () => {
                const perVar: Record<string, number | null>[] = [];
                for (let i = 0; i < count; i++) {
                    perVar[i] = await fetchVarYears(start + i, years, apiKey);
                    await sleep(120);
                }
                const series: { date: string; value: number }[] = [];
                for (const y of years) {
                    for (let i = 0; i < count; i++) {
                        const v = perVar[i]?.[String(y)];
                        if (v == null) continue;
                        const date = freq === 'q' ? `${y}-Q${i + 1}` : `${y}-${String(i + 1).padStart(2, '0')}`;
                        series.push({ date, value: +v });
                    }
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
