// Krajowy indeks cen przedsiębiorstw (国内企業物価指数), baza 2020. Statistics Dashboard, bez klucza.
// Liczba z komunikatu Banku Japonii, 13.10.2026, 8:50: wrzesień, wstępne, +6,8% r/r.
// Indeks 135,7, wobec sierpnia 136,1, czyli −0,3% m/m. Sierpień po korekcie: +7,6% r/r.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpCgpiId = 'yoy' | 'index';

const BASE = ['国内企業物価指数（総平均）', '2020年基準'];

export interface JpCgpiSeriesConfig {
    id: JpCgpiId;
    query: DashboardQuery;
}

export const JP_CGPI_SERIES: JpCgpiSeriesConfig[] = [
    {
        id: 'yoy',
        query: {
            indicator: '0703040400000030010', rank: 2, region: '00000', from: '201801',
            mustInclude: ['（前年同月比）', ...BASE],
            mustExclude: ['輸出', '輸入', '2015年基準', '2010年基準'],
            unitIncludes: ['%'],
        },
    },
    {
        id: 'index',
        query: {
            indicator: '0703040400000090010', rank: 2, region: '00000', from: '201801',
            mustInclude: BASE,
            mustExclude: ['前年', '前月', '輸出', '輸入', '2015年基準', '2010年基準'],
        },
    },
];

export const JP_CGPI_SOURCE = 'Bank of Japan · Corporate Goods Price Index';

export interface JpCgpiPayload {
    series: Record<JpCgpiId, DashboardPoint[]>;
    names: Record<JpCgpiId, string>;
    source: string;
    fetchedAt: string;
}

export function jpCgpiIsEmpty(p: JpCgpiPayload | null | undefined): boolean {
    return !p?.series?.yoy?.length || !p.series.index?.length;
}

export function lastCgpiPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function consecutive(prev: string, next: string): boolean {
    const [y, m] = prev.split('-').map(Number);
    const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    return next === expected;
}

/** Zmiana indeksu wobec poprzedniego miesiąca, do 0,1, jak w komunikacie. */
export function cgpiMom(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const prev = points[points.length - 2];
    const last = points[points.length - 1];
    if (!consecutive(prev.date, last.date) || !prev.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** Komunikat Banku Japonii o 8:50 JST. Po listopadzie 2026 świeżość schodzi na heurystykę. */
export const JP_CGPI_RELEASES: Record<string, string> = {
    '2026-01': '2026-02-12', '2026-02': '2026-03-11', '2026-03': '2026-04-10', '2026-04': '2026-05-15',
    '2026-05': '2026-06-10', '2026-06': '2026-07-10', '2026-07': '2026-08-13', '2026-08': '2026-09-11',
    '2026-09': '2026-10-13', '2026-10': '2026-11-12',
};

function cgpiEntries(): Array<[string, string]> {
    return Object.entries(JP_CGPI_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function cgpiInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T08:50:00+09:00`);
}

export function nextCgpiRelease(now: Date): { period: string; date: string } | null {
    const hit = cgpiEntries().find(([, date]) => cgpiInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpCgpi(now: Date): string {
    const entries = cgpiEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - cgpiInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (cgpiInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 13 ? -1 : -2);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function cgpiSentence(p: JpCgpiPayload): string | null {
    const yoy = lastCgpiPoint(p.series.yoy);
    const index = lastCgpiPoint(p.series.index);
    if (!yoy) return null;
    const period = formatDataPeriod(yoy.date);
    const rate = yoy.value === 0
        ? 'ceny producenta nie zmieniły się wobec roku wcześniej'
        : `ceny producenta ${yoy.value > 0 ? 'wzrosły' : 'spadły'} o ${formatDecimalPL(Math.abs(yoy.value), 1)}% wobec roku wcześniej`;
    const level = index && index.date === yoy.date ? ` Indeks wynosi ${formatDecimalPL(index.value, 1)} (baza 2020).` : '';
    const mom = index && index.date === yoy.date ? cgpiMom(p.series.index) : null;
    const month = mom == null ? '' : mom < 0
        ? ` Wobec poprzedniego miesiąca indeks spadł o ${formatDecimalPL(Math.abs(mom), 1)}%.`
        : mom > 0 ? ` Wobec poprzedniego miesiąca indeks wzrósł o ${formatDecimalPL(mom, 1)}%.` : ' Wobec poprzedniego miesiąca indeks się nie zmienił.';
    const tag = yoy.provisional ? ' Odczyt jest wstępny.' : '';
    return `Dane za ${period}: ${rate}.${level}${month}${tag}`;
}
