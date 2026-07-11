// Generic DBW time-series stitcher — one call per period (DBW limitation), assembled server-side.
// Reusable for PPI, construction, agri, real-estate prices (any DBW variable/position).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';

interface DbwRow { 'id-pozycja-1': number; 'id-pozycja-2': number; 'id-sposob-prezentacji-miara': number; wartosc: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPeriod(varId: string, przekroj: string, rok: number, okres: number): Promise<DbwRow[] | null> {
    const url = `${DBW}?id-zmienna=${varId}&id-przekroj=${przekroj}&id-rok=${rok}&id-okres=${okres}&ile-na-stronie=9000&numer-strony=0&lang=pl`;
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(3500); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data as DbwRow[]) ?? null;
    }
    return null;
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const varId = sp.get('var');
    const przekroj = sp.get('przekroj');
    const poz = sp.getAll('poz'); // one or more id-pozycja-2
    if (!varId || !przekroj || poz.length === 0) {
        return NextResponse.json({ error: 'Wymagane: var, przekroj, poz' }, { status: 400 });
    }
    const year = parseInt(sp.get('year') || '2025');
    const prez = parseInt(sp.get('prez') || '5');
    const poz1 = parseInt(sp.get('poz1') || '33617'); // POLSKA
    const freq = sp.get('freq') === 'q' ? 'q' : 'm';
    const sub100 = sp.get('sub100') !== '0';
    const pozNums = poz.map(Number);

    const cacheKey = `dbwser_${varId}_${przekroj}_${poz.join('-')}_${year}_${freq}_${prez}`.slice(0, 120);

    try {
        const result = await withCache(
            'dbw',
            cacheKey,
            async () => {
                const count = freq === 'q' ? 4 : 12;
                const series: Record<string, number | string>[] = [];
                for (let i = 1; i <= count; i++) {
                    const okres = freq === 'q' ? 269 + i : 246 + i; // Q1=270, M01=247
                    const rows = await fetchPeriod(varId, przekroj, year, okres);
                    await sleep(150);
                    if (!rows) continue;
                    const date = freq === 'q' ? `${year}-Q${i}` : `${year}-${String(i).padStart(2, '0')}`;
                    const point: Record<string, number | string> = { date };
                    let any = false;
                    for (const p of pozNums) {
                        const r = rows.find((x) => x['id-pozycja-1'] === poz1 && x['id-pozycja-2'] === p && x['id-sposob-prezentacji-miara'] === prez);
                        if (r && r.wartosc != null) { point[String(p)] = sub100 ? +(r.wartosc - 100).toFixed(1) : +r.wartosc.toFixed(1); any = true; }
                    }
                    if (any) series.push(point);
                }
                return { series, source: 'GUS (DBW)' };
            },
            'DBW API',
            24 * 3600 * 1000,
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('DBW series error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
