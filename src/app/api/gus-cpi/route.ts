// GUS national CPI (official) from DBW — monthly y/y, stitched across a year.
// DBW returns one period per call, so we fetch each month and assemble a series.
// var 305 / przekrój 739 (6 aggregates), presentation 5 = "analog. m-c poprz. roku = 100".
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';

// przekrój 739 category positions (dim 565)
const CATS = [
    { poz: 6656078, name: 'Ogółem', key: 'ogolem' },
    { poz: 6656079, name: 'Żywność i napoje bezalk.', key: 'zywnosc' },
    { poz: 6656117, name: 'Alkohol i tytoń', key: 'alkohol' },
    { poz: 6656172, name: 'Towary nieżywnościowe', key: 'towary' },
    { poz: 6656174, name: 'Usługi', key: 'uslugi' },
];

interface DbwRow { 'id-pozycja-2': number; 'id-sposob-prezentacji-miara': number; wartosc: number }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchMonth(rok: number, okres: number): Promise<DbwRow[] | null> {
    const url = `${DBW}?id-zmienna=305&id-przekroj=739&id-rok=${rok}&id-okres=${okres}&ile-na-stronie=5000&numer-strony=0&lang=pl`;
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
    const year = parseInt(new URL(request.url).searchParams.get('year') || '2025');

    try {
        const result = await withCache(
            'dbw',
            `gus_cpi_national_${year}`,
            async () => {
                const trend: { date: string; value: number }[] = [];
                let latest: { date: string; ogolem: number; categories: { name: string; yoy: number | null }[] } | null = null;

                for (let m = 1; m <= 12; m++) {
                    const rows = await fetchMonth(year, 246 + m); // M01 = 247
                    await sleep(150);
                    if (!rows) continue;
                    const yoy = (poz: number) => {
                        const r = rows.find((x) => x['id-pozycja-2'] === poz && x['id-sposob-prezentacji-miara'] === 5);
                        return r && r.wartosc != null ? +(r.wartosc - 100).toFixed(1) : null;
                    };
                    const ogolem = yoy(6656078);
                    if (ogolem == null) continue;
                    const date = `${year}-${String(m).padStart(2, '0')}`;
                    trend.push({ date, value: ogolem });
                    latest = {
                        date, ogolem,
                        categories: CATS.filter((c) => c.key !== 'ogolem').map((c) => ({ name: c.name, yoy: yoy(c.poz) })),
                    };
                }
                return { trend, latest, source: 'GUS (DBW) — krajowy CPI' };
            },
            'GUS DBW CPI',
            24 * 3600 * 1000,
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('GUS CPI (DBW) error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
