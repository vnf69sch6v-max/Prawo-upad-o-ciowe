// Produkcja przemysłowa Japonii (鉱工業生産指数, baza 2020). Statistics Dashboard, bez klucza.
// Liczba z komunikatu końcowego METI to zmiana indeksu wyrównanego sezonowo wobec poprzedniego miesiąca.
// Sierpień 2026 (確報 15.10, 13:30 JST): indeks 101,9, −2,4% m/m. Wstępne było 102,6 i −1,7%.
// Rok do roku liczymy z indeksu surowego: sierpień 90,8 wobec 88,4 rok wcześniej = +2,7%, jak w komunikacie.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpIndustryId = 'sa' | 'nsa';

const CODE = '0502070301000090010';
const NAME = ['鉱工業生産指数', '2020年基準'];

export interface JpIndustrySeriesConfig {
    id: JpIndustryId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_INDUSTRY_SERIES: JpIndustrySeriesConfig[] = [
    {
        id: 'sa', label: 'Indeks wyrównany sezonowo', short: 'Wyrównany sezonowo', color: '#DC2626',
        hint: 'Baza 2020 = 100. Komunikat podaje zmianę tego indeksu wobec poprzedniego miesiąca.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '202001', seasonal: true,
            mustInclude: NAME, mustExclude: ['2015年基準', '2010年基準'],
        },
    },
    {
        id: 'nsa', label: 'Indeks bez korekty', short: 'Bez korekty', color: '#64748B', dashed: true,
        hint: 'Ten sam indeks bez wyrównania sezonowego. Rok do roku liczymy z niego — tak jest w komunikacie.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '202001',
            mustInclude: NAME, mustExclude: ['2015年基準', '2010年基準'],
        },
    },
];

export const JP_INDUSTRY_SOURCE = 'Ministry of Economy, Trade and Industry · Indices of Industrial Production';

export interface JpIndustryPayload {
    series: Record<JpIndustryId, DashboardPoint[]>;
    names: Record<JpIndustryId, string>;
    source: string;
    fetchedAt: string;
}

export function jpIndustryIsEmpty(p: JpIndustryPayload | null | undefined): boolean {
    return !p?.series?.sa?.length || !p.series.nsa?.length;
}

export function lastIndustryPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** Zmiana indeksu wobec poprzedniego miesiąca, w procentach, do 0,1 — jak w komunikacie. */
export function industryMom(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2].value;
    const b = points[points.length - 1].value;
    if (!a) return null;
    return Math.round(((b - a) / Math.abs(a)) * 1000) / 10;
}

function shiftYear(period: string, delta: number): string | null {
    const m = period.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    return `${Number(m[1]) + delta}-${m[2]}`;
}

/** Rok do roku indeksu surowego, do 0,1. */
export function industryYoy(points: DashboardPoint[] | undefined): number | null {
    if (!points?.length) return null;
    const last = points[points.length - 1];
    const prevDate = shiftYear(last.date, -1);
    const prev = points.find((p) => p.date === prevDate);
    if (!prev?.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** Komunikat końcowy (確報) o 13:30 JST. e-Stat, statystyka 00550300. Wstępny (8:50, koniec następnego miesiąca) Dashboard zastępuje. */
export const JP_IIP_FINAL_RELEASES: Record<string, string> = {
    '2025-11': '2026-01-19', '2025-12': '2026-02-16',
    '2026-01': '2026-03-19', '2026-02': '2026-04-14', '2026-03': '2026-05-19', '2026-04': '2026-06-12',
    '2026-05': '2026-07-14', '2026-06': '2026-08-17', '2026-07': '2026-09-14', '2026-08': '2026-10-15',
    '2026-09': '2026-11-16', '2026-10': '2026-12-14', '2026-11': '2027-01-18', '2026-12': '2027-02-15',
    '2027-01': '2027-03-19',
};

const FINAL_HOUR = '13:30';

export function iipFinalInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T${FINAL_HOUR}:00+09:00`);
}

function iipEntries(): Array<[string, string]> {
    return Object.entries(JP_IIP_FINAL_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function nextIipRelease(now: Date): { period: string; date: string } | null {
    const hit = iipEntries().find(([, date]) => iipFinalInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

/** Miesiąc, którego komunikat końcowy już się ukazał. Po końcu kalendarza: od 16. dnia M oczekujemy M-2, wcześniej M-3. */
export function expectedJpIndustry(now: Date): string {
    const entries = iipEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - iipFinalInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (iipFinalInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 16 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function industrySentence(p: JpIndustryPayload): string | null {
    const sa = lastIndustryPoint(p.series.sa);
    const mom = industryMom(p.series.sa);
    const yoy = industryYoy(p.series.nsa);
    if (!sa || mom == null) return null;
    const period = formatDataPeriod(sa.date);
    const verb = mom < 0 ? 'spadła' : mom > 0 ? 'wzrosła' : 'nie zmieniła się';
    const move = mom === 0 ? '' : ` o ${formatDecimalPL(Math.abs(mom), 1)}%`;
    const yoyTxt = yoy == null ? '' : ` Bez korekty sezonowej rok do roku: ${yoy > 0 ? '+' : ''}${formatDecimalPL(yoy, 1)}%.`;
    return `Dane za ${period}: produkcja przemysłowa, wyrównana sezonowo, ${verb}${move} wobec poprzedniego miesiąca. Indeks wynosi ${formatDecimalPL(sa.value, 1)} (baza 2020).${yoyTxt}`;
}
