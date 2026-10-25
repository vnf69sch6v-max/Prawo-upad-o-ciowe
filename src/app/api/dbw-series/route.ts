// DBW time-series stitcher — one call per period (DBW limitation), assembled server-side.
// Tylko serie z listy dozwolonych (`DBW_SERIES`): dowolna seria i rok były nowym kluczem cache bez górnej granicy,
// a `sub100=0` / inne `poz1` przy parametrach Przeglądu nadpisywały jego klucz (cache nie zawiera tych pól).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { gusFetchInit } from '@/lib/upstream-fetch';
import { badParam, forcedRefresh, parseDbwSeries, parseGusYear } from '@/lib/gus-params';
import { DBW_POLSKA, DBW_SERIES, dbwSeriesCacheKey } from '@/lib/gus-dbw-series';

// 8–24 wywołania po kolei; przy kilku 429 (3,5 s każde) 30 s nie wystarcza.
export const maxDuration = 60;

const DBW = 'https://api-dbw.stat.gov.pl/api/1.1.0/variable/variable-data-section';

interface DbwRow { 'id-pozycja-1': number; 'id-pozycja-2': number; 'id-sposob-prezentacji-miara': number; wartosc: number }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPeriod(varId: string, przekroj: string, rok: number, okres: number, force: boolean): Promise<DbwRow[] | null> {
    const url = `${DBW}?id-zmienna=${varId}&id-przekroj=${przekroj}&id-rok=${rok}&id-okres=${okres}&ile-na-stronie=9000&numer-strony=0&lang=pl`;
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(url, { headers: { Accept: 'application/json' }, ...gusFetchInit(force) });
        if (res.status === 429) { await sleep(3500); continue; }
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data as DbwRow[]) ?? null;
    }
    return null;
}

export async function GET(request: NextRequest) {
    const sp = new URL(request.url).searchParams;
    const y = parseGusYear(sp);
    if (!y.ok) return badParam(y);
    const s = parseDbwSeries(sp);
    if (!s.ok) return badParam(s);
    const year = y.value.year;
    const force = forcedRefresh(sp, y.value, request); // tylko cron (Bearer CRON_SECRET) i tylko rok bieżący
    const { var: v, przekroj: p2, poz: pozNums, freq = 'm', prez = 5 } = DBW_SERIES[s.value];
    const varId = String(v);
    const przekroj = String(p2);
    const poz1 = DBW_POLSKA;
    const sub100 = true;
    const cacheKey = dbwSeriesCacheKey(s.value, year);

    try {
        const result = await withCache(
            'dbw',
            cacheKey,
            async () => {
                const count = freq === 'q' ? 4 : 12;
                const years = [year - 1, year];
                const series: Record<string, number | string>[] = [];
                for (const y of years) {
                    for (let i = 1; i <= count; i++) {
                        const okres = freq === 'q' ? 269 + i : 246 + i; // Q1=270, M01=247
                        const rows = await fetchPeriod(varId, przekroj, y, okres, force);
                        await sleep(120);
                        if (!rows) continue;
                        const date = freq === 'q' ? `${y}-Q${i}` : `${y}-${String(i).padStart(2, '0')}`;
                        const point: Record<string, number | string> = { date };
                        let any = false;
                        for (const p of pozNums) {
                            const r = rows.find((x) => x['id-pozycja-1'] === poz1 && x['id-pozycja-2'] === p && x['id-sposob-prezentacji-miara'] === prez);
                            // wartosc===0 = placeholder „brak publikacji" dla tego okresu (indeks bazowy=100 nigdy nie jest 0);
                            // sub100 dałoby fałszywe −100% i zjazd wykresu do dna → pomiń (luka w serii zamiast artefaktu).
                            if (r && r.wartosc != null && r.wartosc !== 0) { point[String(p)] = sub100 ? +(r.wartosc - 100).toFixed(1) : +r.wartosc.toFixed(1); any = true; }
                        }
                        if (any) series.push(point);
                    }
                }
                return { series, source: 'GUS (DBW)' };
            },
            'DBW API',
            force ? -1 : 48 * 3600 * 1000, // user czyta 48h cache; cron ?refresh=1 odświeża codziennie
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('DBW series error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
