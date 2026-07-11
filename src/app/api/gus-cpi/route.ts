// GUS national CPI (official) from DBW — monthly y/y, stitched to the latest published month.
// GUS switched classification in 2026: COICOP 1999 (przekrój 739) for ≤2025,
// COICOP 2018 special aggregates (przekrój 1722) from 2026. Headline "0-OGÓŁEM".
// Household-group dimension: prefer "Ogółem" (poz-3 6902025), else first match. presentation 5 = y/y.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';
const POLSKA = 33617;
const GRUPA_OGOLEM = 6902025;

interface DbwRow { 'id-pozycja-1': number; 'id-pozycja-2': number; 'id-pozycja-3': number; 'id-sposob-prezentacji-miara': number; wartosc: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cpiClass(y: number) {
    if (y >= 2026) return {
        przekroj: 1722, ogolem: 14916914,
        cats: [
            { poz: 14916613, name: 'Żywność i napoje bezalk.' },
            { poz: 14917745, name: 'Towary nieżywnościowe' },
            { poz: 14916840, name: 'Usługi' },
            { poz: 14916626, name: 'Alkohol i tytoń' },
        ],
    };
    return {
        przekroj: 739, ogolem: 6656078,
        cats: [
            { poz: 6656079, name: 'Żywność i napoje bezalk.' },
            { poz: 6656172, name: 'Towary nieżywnościowe' },
            { poz: 6656174, name: 'Usługi' },
            { poz: 6656117, name: 'Alkohol i tytoń' },
        ],
    };
}

async function fetchMonth(rok: number, okres: number, przekroj: number): Promise<DbwRow[] | null> {
    const url = `${DBW}?id-zmienna=305&id-przekroj=${przekroj}&id-rok=${rok}&id-okres=${okres}&ile-na-stronie=9000&numer-strony=0&lang=pl`;
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
        if (res.status === 429) { await sleep(3500); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data as DbwRow[]) ?? null;
    }
    return null;
}

function yoy(rows: DbwRow[], poz: number): number | null {
    const matches = rows.filter((r) => r['id-pozycja-1'] === POLSKA && r['id-pozycja-2'] === poz && r['id-sposob-prezentacji-miara'] === 5);
    if (!matches.length) return null;
    const row = matches.find((r) => r['id-pozycja-3'] === GRUPA_OGOLEM) ?? matches[0];
    return row.wartosc != null ? +(row.wartosc - 100).toFixed(1) : null;
}

export async function GET(request: NextRequest) {
    const year = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
    const years = [year - 1, year];

    try {
        const result = await withCache(
            'dbw',
            `gus_cpi_national_${year}_v3`,
            async () => {
                const trend: { date: string; value: number }[] = [];
                let latest: { date: string; ogolem: number; categories: { name: string; yoy: number | null }[] } | null = null;

                for (const y of years) {
                    const cfg = cpiClass(y);
                    for (let m = 1; m <= 12; m++) {
                        const rows = await fetchMonth(y, 246 + m, cfg.przekroj);
                        await sleep(120);
                        if (!rows) continue;
                        const ogolem = yoy(rows, cfg.ogolem);
                        if (ogolem == null) continue;
                        const date = `${y}-${String(m).padStart(2, '0')}`;
                        trend.push({ date, value: ogolem });
                        latest = { date, ogolem, categories: cfg.cats.map((c) => ({ name: c.name, yoy: yoy(rows, c.poz) })) };
                    }
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
