// GUS business tendency (koniunktura) from DBW — the free PMI-style leading indicator.
// var 184 / przekrój 803, measure 117 = climate balance. POLSKA = poz-1 33617.
// Stitched across the last ~2 years to the latest published month.
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';
const POLSKA = 33617;

const SECTORS = [
    { poz: 6971743, name: 'Przetwórstwo przemysłowe', key: 'przetworstwo' },
    { poz: 6971707, name: 'Budownictwo', key: 'budownictwo' },
    { poz: 6661753, name: 'Handel detaliczny', key: 'handel' },
    { poz: 6971739, name: 'Transport i magazyny', key: 'transport' },
    { poz: 6971735, name: 'Informacja i komunikacja', key: 'ikt' },
];

interface DbwRow { 'id-pozycja-1': number; 'id-pozycja-2': number; 'id-sposob-prezentacji-miara': number; wartosc: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchMonth(rok: number, okres: number): Promise<DbwRow[] | null> {
    const url = `${DBW}?id-zmienna=184&id-przekroj=803&id-rok=${rok}&id-okres=${okres}&ile-na-stronie=9000&numer-strony=0&lang=pl`;
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
    const year = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
    const force = new URL(request.url).searchParams.get('refresh') === '1'; // cron warm → wymuś refetch (pomiń cache)
    const years = [year - 1, year];

    try {
        const result = await withCache(
            'dbw',
            `gus_koniunktura_${year}_v2`,
            async () => {
                const trend: Record<string, number | string>[] = [];
                let latest: { date: string; sectors: { name: string; value: number | null }[] } | null = null;

                for (const y of years) {
                    for (let m = 1; m <= 12; m++) {
                        const rows = await fetchMonth(y, 246 + m);
                        await sleep(120);
                        if (!rows) continue;
                        const val = (poz: number) => {
                            const r = rows.find((x) => x['id-pozycja-1'] === POLSKA && x['id-pozycja-2'] === poz && x['id-sposob-prezentacji-miara'] === 117);
                            return r && r.wartosc != null ? +r.wartosc.toFixed(1) : null;
                        };
                        const date = `${y}-${String(m).padStart(2, '0')}`;
                        const point: Record<string, number | string> = { date };
                        let any = false;
                        for (const s of SECTORS) { const v = val(s.poz); if (v != null) { point[s.key] = v; any = true; } }
                        if (!any) continue;
                        trend.push(point);
                        latest = { date, sectors: SECTORS.map((s) => ({ name: s.name, value: val(s.poz) })) };
                    }
                }
                return { trend, latest, sectors: SECTORS.map((s) => ({ key: s.key, name: s.name })), source: 'GUS (DBW) — badanie koniunktury' };
            },
            'DBW API',
            force ? -1 : 48 * 3600 * 1000, // user czyta 48h cache; cron ?refresh=1 odświeża codziennie
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('GUS koniunktura (DBW) error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
