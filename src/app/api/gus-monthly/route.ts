// GUS BDL — przeciętne wynagrodzenie w sektorze przedsiębiorstw (P2687, zł → r/r).
// Sprzedaż detaliczna (dawniej P3860) przeszła na GUS DBW — patrz src/lib/gus-dbw-series.ts.

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { gusFetchInit } from '@/lib/upstream-fetch';
import { dbwFetchMany, monthOkres, type DbwPeriod } from '@/lib/dbw-fetch';

const GUS_BASE = 'https://bdl.stat.gov.pl/api/v1';

// P2687: Monthly enterprise wages (PLN), ogółem
// IDs sequential: 154487 (Jan) through 154498 (Dec)
const WAGE_IDS: Record<string, number> = {
    '01': 154487, '02': 154488, '03': 154489, '04': 154490,
    '05': 154491, '06': 154492, '07': 154493, '08': 154494,
    '09': 154495, '10': 154496, '11': 154497, '12': 154498,
};

interface MonthlyDataPoint {
    date: string;
    value: number;     // YoY % change
    raw: number;       // raw GUS value
}

interface GUSMonthlyResult {
    wages: MonthlyDataPoint[];
    source: string;
    timestamp: string;
}

async function fetchBDL(endpoint: string, apiKey: string | undefined, force: boolean): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['X-ClientId'] = apiKey;

    const res = await fetch(`${GUS_BASE}/${endpoint}`, { headers, ...gusFetchInit(force) });

    if (res.status === 429) {
        await new Promise(r => setTimeout(r, 10000));
        const retry = await fetch(`${GUS_BASE}/${endpoint}`, { headers });
        if (!retry.ok) throw new Error(`GUS rate limited: ${retry.status}`);
        return retry.json();
    }
    if (!res.ok) throw new Error(`GUS API ${res.status}`);
    return res.json();
}

// Fetch wages (absolute PLN) then compute YoY % growth
async function fetchWagesMonthly(apiKey: string | undefined, years: number, force: boolean): Promise<MonthlyDataPoint[]> {
    const currentYear = new Date().getFullYear();
    // Need extra year for YoY calculation
    const yearParams = Array.from({ length: years + 1 }, (_, i) => `year=${currentYear - years + i}`).join('&');

    // Collect raw wage data: { "YYYY-MM": PLN }
    const rawMap: Record<string, number> = {};

    // Po kolei, z odstępem: BDL bez klucza wpuszcza ~5 żądań/s — 12 równoległych dawało 429 i dziury.
    for (const [month, varId] of Object.entries(WAGE_IDS)) {
        try {
            const data = await fetchBDL(
                `data/by-variable/${varId}?unit-level=0&format=json&${yearParams}`, apiKey, force,
            ) as { results?: Array<{ values: Array<{ year: number; val: number | null }> }> };
            for (const v of (data?.results?.[0]?.values ?? [])) {
                if (v.val !== null) {
                    rawMap[`${v.year}-${month}`] = v.val;
                }
            }
        } catch (err) { console.error(`GUS wages ${month}:`, err); }
        await new Promise((r) => setTimeout(r, 220));
    }

    // Compute YoY % growth
    const results: MonthlyDataPoint[] = [];
    const sortedDates = Object.keys(rawMap).sort();
    for (const date of sortedDates) {
        const [y, m] = date.split('-');
        const prevYearDate = `${parseInt(y) - 1}-${m}`;
        if (rawMap[prevYearDate]) {
            const yoy = ((rawMap[date] / rawMap[prevYearDate]) - 1) * 100;
            results.push({
                date,
                value: +yoy.toFixed(1),
                raw: rawMap[date],
            });
        }
    }
    return results;
}

// GUS publikuje płace ~20. dnia M+1 i od razu są w DBW (zm. 376, przekrój 16), a BDL (P2687) dostaje
// miesiąc kilka tygodni później — strona stała na lipcu, gdy GUS podał już sierpień. BDL daje
// historię, DBW nadpisuje/dokłada ostatnie 3 miesiące (3 zapytania ze wspólnego limitu DBW).
const DBW_WAGES_VAR = 376;
const DBW_WAGES_PRZEKROJ = 16;
const DBW_PREZ_VALUE = 243;        // wartość, zł
const DBW_PREZ_YOY_NOMINAL = 184;  // analogiczny okres roku poprzedniego=100; ujęcie nominalne

async function fetchWagesDbwRecent(force: boolean, months = 3): Promise<MonthlyDataPoint[]> {
    const now = new Date();
    const periods: DbwPeriod[] = [];
    for (let k = months; k >= 1; k--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k, 1));
        const rok = d.getUTCFullYear(), m = d.getUTCMonth() + 1;
        periods.push({ rok, okres: monthOkres(m), przekroj: DBW_WAGES_PRZEKROJ, key: `${rok}-${String(m).padStart(2, '0')}` });
    }
    const rowsByKey = await dbwFetchMany(DBW_WAGES_VAR, periods, 1, force);
    const out: MonthlyDataPoint[] = [];
    for (const p of periods) {
        const rows = (rowsByKey.get(p.key) ?? []).filter((r) => r['id-pozycja-1'] === 33617);
        const val = (prez: number) => rows.find((r) => r['id-sposob-prezentacji-miara'] === prez)?.wartosc;
        const raw = val(DBW_PREZ_VALUE), yoy = val(DBW_PREZ_YOY_NOMINAL);
        // wartosc 0 = placeholder „brak publikacji" w DBW
        if (raw && yoy) out.push({ date: p.key, value: +(yoy - 100).toFixed(1), raw });
    }
    return out;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '4');
    const apiKey = process.env.GUS_BDL_KEY || process.env.GUS_API_KEY;
    const force = searchParams.get('refresh') === '1'; // cron warm → pobierz u źródła, pomiń oba cache

    try {
        const data = await withCache<GUSMonthlyResult>(
            'macro_data',
            `gus_monthly_v3_${years}`,
            async () => {
                const [bdl, dbw] = await Promise.all([
                    fetchWagesMonthly(apiKey, years, force),
                    fetchWagesDbwRecent(force).catch(() => [] as MonthlyDataPoint[]),
                ]);
                const byDate = new Map(bdl.map((w) => [w.date, w]));
                for (const w of dbw) byDate.set(w.date, w);
                const wages = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
                return {
                    wages,
                    source: dbw.length ? 'GUS BDL P2687 + DBW (ostatnie miesiące)' : 'GUS BDL P2687',
                    timestamp: new Date().toISOString(),
                };
            },
            'GUS BDL Monthly v2',
            force ? -1 : 24 * 3600 * 1000
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('GUS Monthly error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
