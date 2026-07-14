// Pełny obraz inflacji CPI — w 100% GUS (DBW), bez HICP:
//  • headline r/r: COICOP 1999 kwartalnie (przekrój 736, 2016–2025) + COICOP 2018 miesięcznie
//    (przekrój 1722, 2026). DBW zwraca 1 okres/zapytanie i limituje ~100/15min, więc 10 lat
//    monthly jest nierealne — kwartalnie (40 zapytań) mieści się w limicie i daje pełny trend.
//  • 13 działów COICOP 2018 z wagą/wkładem oraz historią (kwartalnie 1999 + miesięcznie 2026),
//  • podkategorie (klasy 4-cyfrowe COICOP 2018) — historia miesięczna od 2026 (stara klasyfikacja
//    COICOP 1999 nie mapuje się na klasy 2018).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { dbwFetchMany, pick, monthlyPeriods, quarterlyPeriods, monthOkres, type DbwPeriod, type DbwRow } from '@/lib/dbw-fetch';
import { COICOP_CLASSES } from '@/lib/coicop-subcategories';

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

// COICOP 1999 (przekrój 736): pozycje działów → kod COICOP 2018 (13 dzieli „inne" z 12).
const DIV_1999: Record<string, number> = {
    '01': 6656079, '02': 6656117, '03': 6656123, '04': 6656133, '05': 6656143, '06': 6656146,
    '07': 6656151, '08': 6656159, '09': 6656162, '10': 6656167, '11': 6656168, '12': 6656169, '13': 6656169,
};
const OGOLEM_1999 = 6656078;   // Ogółem CPI w COICOP 1999 (736)
const HEADLINE_2026 = 14916914; // Ogółem CPI w COICOP 2018 agregaty (1722)
const mm = (m: number) => String(m).padStart(2, '0');

interface HeadPoint { date: string; yoy: number | null; mom: number | null }
interface HistPoint { date: string; yoy: number | null; qoq?: number | null; mom?: number | null }

export async function GET(request: NextRequest) {
    const now = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
    const force = new URL(request.url).searchParams.get('refresh') === '1'; // cron warm → wymuś refetch (pomiń cache)

    try {
        const result = await withCache(
            'dbw',
            `gus_cpi_full_${now}_v5`,
            async () => {
                // ── Pobrania GUS DBW ──
                const qPeriods = quarterlyPeriods(now - 10, 2025, () => 736);         // COICOP 1999 kwartalnie 2016–2025
                const hPeriods = monthlyPeriods(2026, now, () => 1722);               // COICOP 2018 headline miesięcznie 2026
                const dPeriods: DbwPeriod[] = [];                                     // COICOP 2018 działy/klasy miesięcznie 2026
                for (let m = 1; m <= 12; m++) dPeriods.push({ rok: 2026, okres: monthOkres(m), przekroj: 1698, key: `2026-${mm(m)}` });

                const [qRows, hRows, dRows] = await Promise.all([
                    dbwFetchMany(305, qPeriods, 3),
                    dbwFetchMany(305, hPeriods, 2),
                    dbwFetchMany(305, dPeriods, 2),
                ]);

                // ── Headline: kwartalnie (Ogółem 1999) + miesięcznie 2026 (Ogółem 2018) ──
                const headline: HeadPoint[] = [];
                for (const q of qPeriods) {
                    const rows = qRows.get(q.key); if (!rows) continue;
                    const yoy = pick(rows, OGOLEM_1999, 5);
                    if (yoy != null) headline.push({ date: q.key, yoy, mom: null });
                }
                for (const p of hPeriods) {
                    const rows = hRows.get(p.key); if (!rows) continue;
                    const yoy = pick(rows, HEADLINE_2026, 5);
                    if (yoy != null) headline.push({ date: p.key, yoy, mom: pick(rows, HEADLINE_2026, 2) });
                }
                const spliceDate = headline.find((h) => /^\d{4}-\d{2}$/.test(h.date))?.date ?? '2026-01';

                // ── Działy 2026 (miesięcznie, przekrój 1698) ──
                const monthsWithData: { key: string; rows: DbwRow[] }[] = [];
                for (const p of dPeriods) {
                    const rows = dRows.get(p.key); if (!rows) continue;
                    if (!DIVISIONS.some((d) => pick(rows, d.poz, 5) != null)) continue;
                    monthsWithData.push({ key: p.key, rows });
                }
                const latestRows: DbwRow[] | null = monthsWithData.length ? monthsWithData[monthsWithData.length - 1].rows : null;
                const latestDate = monthsWithData.length ? monthsWithData[monthsWithData.length - 1].key : '';
                const last3 = monthsWithData.slice(-3);
                const qoqOf = (poz: number): number | null => {
                    if (last3.length < 3) return null;
                    const moms = last3.map((m) => pick(m.rows, poz, 2));
                    if (moms.some((v) => v == null)) return null;
                    return +(((1 + moms[0]! / 100) * (1 + moms[1]! / 100) * (1 + moms[2]! / 100) - 1) * 100).toFixed(1);
                };

                // ── Historia działu: kwartalnie COICOP 1999 (yoy + qoq) + miesięcznie 2026 (yoy + mom) ──
                const divHist: Record<string, HistPoint[]> = {};
                DIVISIONS.forEach((d) => (divHist[d.code] = []));
                for (const q of qPeriods) {
                    const rows = qRows.get(q.key); if (!rows) continue;
                    for (const d of DIVISIONS) {
                        const p9 = DIV_1999[d.code];
                        const yoy = pick(rows, p9, 5);
                        if (yoy != null) divHist[d.code].push({ date: q.key, yoy, qoq: pick(rows, p9, 2) });
                    }
                }
                for (const m of monthsWithData) {
                    for (const d of DIVISIONS) {
                        const yoy = pick(m.rows, d.poz, 5);
                        if (yoy != null) divHist[d.code].push({ date: m.key, yoy, mom: pick(m.rows, d.poz, 2) });
                    }
                }

                // ── Historia podkategorii (klas): miesięcznie 2026 (yoy + mom) ──
                const subHist: Record<string, HistPoint[]> = {};
                for (const cls of COICOP_CLASSES) subHist[cls.code] = [];
                for (const m of monthsWithData) {
                    for (const cls of COICOP_CLASSES) {
                        const yoy = pick(m.rows, cls.poz, 5);
                        if (yoy != null) subHist[cls.code].push({ date: m.key, yoy, mom: pick(m.rows, cls.poz, 2) });
                    }
                }

                const subsByDiv: Record<string, { code: string; name: string; yoy: number | null; mom: number | null; qoq: number | null; history: HistPoint[] }[]> = {};
                if (latestRows) {
                    for (const cls of COICOP_CLASSES) {
                        const yoy = pick(latestRows, cls.poz, 5);
                        if (yoy == null) continue;
                        (subsByDiv[cls.div] ??= []).push({ code: cls.code, name: cls.name, yoy, mom: pick(latestRows, cls.poz, 2), qoq: qoqOf(cls.poz), history: subHist[cls.code] });
                    }
                }

                const divisions = DIVISIONS.map((d) => {
                    const yoy = latestRows ? pick(latestRows, d.poz, 5) : null;
                    const mom = latestRows ? pick(latestRows, d.poz, 2) : null;
                    return {
                        code: d.code, name: d.name, weight: d.weight, yoy, mom, qoq: qoqOf(d.poz),
                        contribution: yoy != null ? +((d.weight / 100) * yoy).toFixed(2) : null,
                        history: divHist[d.code],
                        subcategories: (subsByDiv[d.code] ?? []).sort((a, b) => (b.yoy ?? -99) - (a.yoy ?? -99)),
                    };
                });

                const dataDate = latestDate || (headline.length ? headline[headline.length - 1].date : '');
                return { headline, divisions, dataDate, weightsApprox: true, spliceDate, source: 'GUS DBW — COICOP 1999 (kwartalnie ≤2025) + COICOP 2018 (miesięcznie 2026)' };
            },
            'GUS DBW CPI full',
            force ? -1 : 48 * 3600 * 1000, // user czyta 48h cache; cron ?refresh=1 odświeża codziennie
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('GUS CPI full error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
