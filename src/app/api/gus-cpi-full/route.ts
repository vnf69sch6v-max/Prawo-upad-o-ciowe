// Pełny obraz inflacji CPI:
//  • headline r/r + m/m: krajowy CPI (GUS DBW) dla świeżych ~2 lat, poprzedzony 10-letnim
//    szkieletem HICP (Eurostat) — DBW zwraca 1 okres/zapytanie i limituje ~100 req/15min,
//    więc 10 lat monthly z DBW jest nierealne; HICP daje pełną historię jednym zapytaniem.
//  • 13 działów COICOP 2018 (od 2026) z wagą, wkładem i historią,
//  • dla każdego działu — klasy 4-cyfrowe COICOP (podkategorie, np. Żywność → pieczywo/mięso),
//    wyciągane z TEGO SAMEGO pobrania 1698 (zero dodatkowych zapytań DBW).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { dbwFetchMany, pick, monthlyPeriods, monthOkres, type DbwPeriod, type DbwRow } from '@/lib/dbw-fetch';
import { COICOP_CLASSES } from '@/lib/coicop-subcategories';
import { fetchEurostat } from '../eurostat/route';

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

const HEADLINE_POZ = (przekroj: number) => (przekroj === 1722 ? 14916914 : 6656078);
const mm = (m: number) => String(m).padStart(2, '0');
const r1 = (v: number | null | undefined) => (v == null ? null : +v.toFixed(1));

interface HeadPoint { date: string; yoy: number | null; mom: number | null }

export async function GET(request: NextRequest) {
    const now = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
    const startYear = now - 1;      // krajowe DBW: świeże ~2 lata (koszt zapytań)
    const backboneStart = now - 9;  // szkielet HICP: ~10 lat

    try {
        const result = await withCache(
            'dbw',
            `gus_cpi_full_${now}_v3`,
            async () => {
                // ── Krajowy headline (DBW): COICOP 1999 (739) ≤2025, COICOP 2018 agregaty (1722) ≥2026 ──
                const hPeriods = monthlyPeriods(startYear, now, (y) => (y >= 2026 ? 1722 : 739));
                const hRows = await dbwFetchMany(305, hPeriods, 2);
                const national: HeadPoint[] = hPeriods
                    .map((p) => {
                        const rows = hRows.get(p.key);
                        if (!rows) return null;
                        const poz = HEADLINE_POZ(p.przekroj);
                        const yoy = pick(rows, poz, 5);
                        if (yoy == null) return null;
                        return { date: p.key, yoy, mom: pick(rows, poz, 2) };
                    })
                    .filter((x): x is NonNullable<typeof x> => x !== null);

                // ── Szkielet 10-letni: HICP y/y + m/m (Eurostat) ──
                const hicpYoY = new Map<string, number>();
                const hicpMoM = new Map<string, number>();
                try {
                    const since = `${backboneStart}-01`;
                    const [yoyR, momR] = await Promise.all([
                        fetchEurostat('prc_hicp_manr', { coicop: 'CP00' }, ['PL'], since),
                        fetchEurostat('prc_hicp_mmor', { coicop: 'CP00' }, ['PL'], since),
                    ]);
                    for (const s of yoyR.data['PL'] ?? []) if (s.value != null) hicpYoY.set(s.date, s.value);
                    for (const s of momR.data['PL'] ?? []) if (s.value != null) hicpMoM.set(s.date, s.value);
                } catch (e) {
                    console.error('HICP backbone fetch failed (fallback: tylko krajowe):', e);
                }

                // ── Sklejenie: krajowy CPI tam gdzie jest, wcześniej HICP ──
                const natlMap = new Map(national.map((h) => [h.date, h]));
                const lastNatl = national.length ? national[national.length - 1].date : '';
                const lastHicp = [...hicpYoY.keys()].sort().pop() ?? '';
                const endDate = lastNatl > lastHicp ? lastNatl : lastHicp;
                const spliceDate = national.length ? national[0].date : null; // od kiedy dane krajowe
                const headline: HeadPoint[] = [];
                for (let y = backboneStart; y <= now; y++) {
                    for (let m = 1; m <= 12; m++) {
                        const date = `${y}-${mm(m)}`;
                        if (endDate && date > endDate) break;
                        const n = natlMap.get(date);
                        if (n && n.yoy != null) { headline.push(n); continue; }
                        const hy = hicpYoY.get(date);
                        if (hy != null) headline.push({ date, yoy: r1(hy), mom: hicpMoM.has(date) ? r1(hicpMoM.get(date)!) : null });
                    }
                }

                // ── Działy COICOP 2018 (przekrój 1698 — od 2026) + podkategorie (klasy 4-cyfr) ──
                const dStart = Math.max(2026, startYear);
                const dPeriods: DbwPeriod[] = [];
                for (let y = dStart; y <= now; y++) for (let m = 1; m <= 12; m++) dPeriods.push({ rok: y, okres: monthOkres(m), przekroj: 1698, key: `${y}-${mm(m)}` });
                const dRows = await dbwFetchMany(305, dPeriods, 2);

                const divHistory: Record<string, { date: string; yoy: number | null }[]> = {};
                DIVISIONS.forEach((d) => (divHistory[d.code] = []));
                let latestRows: DbwRow[] | null = null;
                let latestDate = '';
                for (const p of dPeriods) {
                    const rows = dRows.get(p.key);
                    if (!rows) continue;
                    const hasAny = DIVISIONS.some((d) => pick(rows, d.poz, 5) != null);
                    if (!hasAny) continue;
                    latestRows = rows; latestDate = p.key;
                    for (const d of DIVISIONS) divHistory[d.code].push({ date: p.key, yoy: pick(rows, d.poz, 5) });
                }

                // podkategorie (klasy) z najświeższego miesiąca — grupowane po dziale nadrzędnym
                const subsByDiv: Record<string, { code: string; name: string; yoy: number | null; mom: number | null }[]> = {};
                if (latestRows) {
                    for (const cls of COICOP_CLASSES) {
                        const yoy = pick(latestRows, cls.poz, 5);
                        if (yoy == null) continue;
                        (subsByDiv[cls.div] ??= []).push({ code: cls.code, name: cls.name, yoy, mom: pick(latestRows, cls.poz, 2) });
                    }
                }

                const divisions = DIVISIONS.map((d) => {
                    const yoy = latestRows ? pick(latestRows, d.poz, 5) : null;
                    const mom = latestRows ? pick(latestRows, d.poz, 2) : null;
                    return {
                        code: d.code, name: d.name, weight: d.weight, yoy, mom,
                        contribution: yoy != null ? +((d.weight / 100) * yoy).toFixed(2) : null,
                        history: divHistory[d.code],
                        subcategories: (subsByDiv[d.code] ?? []).sort((a, b) => (b.yoy ?? -99) - (a.yoy ?? -99)),
                    };
                });

                const dataDate = latestDate || lastNatl || (headline.length ? headline[headline.length - 1].date : '');
                return { headline, divisions, dataDate, weightsApprox: true, spliceDate, backboneSource: 'HICP (Eurostat)' };
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
