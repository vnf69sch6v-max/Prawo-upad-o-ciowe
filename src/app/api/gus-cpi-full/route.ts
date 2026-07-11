// Full CPI detail from DBW — headline y/y + m/m trend (2025 COICOP 1999 + 2026 COICOP 2018)
// and all 13 COICOP 2018 divisions with y/y, m/m, weight (approx), contribution and 2026 history.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';
const POLSKA = 33617;
const GRUPA_OGOLEM = 6902025;

interface DbwRow { 'id-pozycja-1': number; 'id-pozycja-2': number; 'id-pozycja-3': number; 'id-sposob-prezentacji-miara': number; wartosc: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// COICOP 2018 divisions (przekrój 1698) + approx 2026 basket weights (sum ≈ 100).
const DIVISIONS = [
    { poz: 14150568, code: '01', name: 'Żywność i napoje bezalk.', weight: 25.9 },
    { poz: 14150567, code: '02', name: 'Alkohol i tytoń', weight: 6.1 },
    { poz: 14150566, code: '03', name: 'Odzież i obuwie', weight: 4.2 },
    { poz: 14150565, code: '04', name: 'Mieszkanie, woda, energia', weight: 19.5 },
    { poz: 14150564, code: '05', name: 'Wyposażenie mieszkania', weight: 5.1 },
    { poz: 14150563, code: '06', name: 'Zdrowie', weight: 6.3 },
    { poz: 14150562, code: '07', name: 'Transport', weight: 9.8 },
    { poz: 14150561, code: '08', name: 'Informacja i komunikacja', weight: 5.5 },
    { poz: 14150560, code: '09', name: 'Rekreacja, sport i kultura', weight: 5.9 },
    { poz: 14150559, code: '10', name: 'Edukacja', weight: 1.0 },
    { poz: 14150558, code: '11', name: 'Restauracje i hotele', weight: 6.4 },
    { poz: 14150557, code: '12', name: 'Ubezpieczenia i usługi fin.', weight: 1.3 },
    { poz: 14150556, code: '13', name: 'Higiena i pozostałe', weight: 3.0 },
];

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

// Extract value for a position at presentation `prez` (5=y/y, 2=m/m). Index → % change (val-100).
function pick(rows: DbwRow[], poz: number, prez: number): number | null {
    const m = rows.filter((r) => r['id-pozycja-1'] === POLSKA && r['id-pozycja-2'] === poz && r['id-sposob-prezentacji-miara'] === prez);
    if (!m.length) return null;
    const row = m.find((r) => r['id-pozycja-3'] === GRUPA_OGOLEM) ?? m[0];
    return row.wartosc != null ? +(row.wartosc - 100).toFixed(1) : null;
}

export async function GET(request: NextRequest) {
    const year = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));

    try {
        const result = await withCache(
            'dbw',
            `gus_cpi_full_${year}_v1`,
            async () => {
                const headline: { date: string; yoy: number | null; mom: number | null }[] = [];
                const divHistory: Record<string, { date: string; yoy: number | null }[]> = {};
                DIVISIONS.forEach((d) => (divHistory[d.code] = []));
                let latestRows: DbwRow[] | null = null;
                let latestDate = '';

                // 2025 — headline only (przekrój 739, COICOP 1999, Ogółem 6656078)
                for (let m = 1; m <= 12; m++) {
                    const rows = await fetchMonth(year - 1, 246 + m, 739);
                    await sleep(110);
                    if (!rows) continue;
                    const yoy = pick(rows, 6656078, 5);
                    if (yoy == null) continue;
                    headline.push({ date: `${year - 1}-${String(m).padStart(2, '0')}`, yoy, mom: pick(rows, 6656078, 2) });
                }

                // 2026 — headline (przekrój 1722, OGÓŁEM 14916914) + divisions (przekrój 1698)
                for (let m = 1; m <= 12; m++) {
                    const hRows = await fetchMonth(year, 246 + m, 1722);
                    await sleep(110);
                    const yoy = hRows ? pick(hRows, 14916914, 5) : null;
                    if (yoy == null) continue;
                    const date = `${year}-${String(m).padStart(2, '0')}`;
                    headline.push({ date, yoy, mom: hRows ? pick(hRows, 14916914, 2) : null });

                    const dRows = await fetchMonth(year, 246 + m, 1698);
                    await sleep(110);
                    if (dRows) {
                        latestRows = dRows; latestDate = date;
                        for (const d of DIVISIONS) divHistory[d.code].push({ date, yoy: pick(dRows, d.poz, 5) });
                    }
                }

                const divisions = DIVISIONS.map((d) => {
                    const yoy = latestRows ? pick(latestRows, d.poz, 5) : null;
                    const mom = latestRows ? pick(latestRows, d.poz, 2) : null;
                    return {
                        code: d.code, name: d.name, weight: d.weight, yoy, mom,
                        contribution: yoy != null ? +((d.weight / 100) * yoy).toFixed(2) : null,
                        history: divHistory[d.code],
                    };
                });

                return { headline, divisions, dataDate: latestDate || (headline.length ? headline[headline.length - 1].date : ''), weightsApprox: true };
            },
            'GUS DBW CPI full',
            24 * 3600 * 1000,
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('GUS CPI full error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
