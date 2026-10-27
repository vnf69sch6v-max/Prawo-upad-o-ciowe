// Bezrobocie w Japonii (完全失業率), Labour Force Survey. Statistics Dashboard, bez klucza.
// Liczba z komunikatu, którą podają agencje, to szereg wyrównany sezonowo. Surowy jest obok, podpisany.
// Nazwa serii w getData jest ta sama dla obu; sezonowość sprawdza parseDashboardData po klasie isSeasonal.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey, releaseInstant } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpLabourId = 'sa' | 'nsa';

const CODE = '0301010000020020010';

export interface JpLabourSeriesConfig {
    id: JpLabourId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_LABOUR_SERIES: JpLabourSeriesConfig[] = [
    {
        id: 'sa', label: 'Stopa bezrobocia', short: 'Wyrównana sezonowo', color: '#DC2626',
        hint: '完全失業率, mężczyźni i kobiety razem, szereg wyrównany sezonowo — ta liczba jest w komunikacie.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '200001', seasonal: true,
            mustInclude: ['完全失業率（男女計）'],
        },
    },
    {
        id: 'nsa', label: 'Bez korekty sezonowej', short: 'Bez korekty', color: '#64748B', dashed: true,
        hint: 'Ta sama stopa bez wyrównania sezonowego. Wiosną i jesienią schodzi niżej niż liczba z komunikatu.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '200001',
            mustInclude: ['完全失業率（男女計）'],
            mustExclude: ['季節調整値'],
        },
    },
];

export const JP_LABOUR_SOURCE = 'Statistics Bureau of Japan · Labour Force Survey';

export interface JpLabourPayload {
    series: Record<JpLabourId, DashboardPoint[]>;
    names: Record<JpLabourId, string>;
    source: string;
    fetchedAt: string;
}

export function jpLabourIsEmpty(p: JpLabourPayload | null | undefined): boolean {
    return !p?.series?.sa?.length || !p.series.nsa?.length;
}

export function lastLabourPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

export function labourChangePp(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2];
    const b = points[points.length - 1];
    return Math.round((b.value - a.value) * 10) / 10;
}

/**
 * Podstawowe zestawienie (基本集計), 8:30 JST.
 * https://www.stat.go.jp/english/data/roudou/1543.html — strona z 30.01.2026.
 * Wrzesień 2026 potwierdzony też w kalendarzu e-Stat (2026-10-30 08:30).
 * Dopisać przed majem 2027: po ostatnim wpisie świeżość schodzi na heurystykę.
 */
export const JP_LFS_RELEASES: Record<string, string> = {
    '2025-12': '2026-01-30', '2026-01': '2026-03-03', '2026-02': '2026-03-31', '2026-03': '2026-04-28',
    '2026-04': '2026-05-29', '2026-05': '2026-06-30', '2026-06': '2026-07-31', '2026-07': '2026-08-28',
    '2026-08': '2026-10-02', '2026-09': '2026-10-30', '2026-10': '2026-12-01', '2026-11': '2026-12-25',
    '2026-12': '2027-01-29', '2027-01': '2027-03-02', '2027-02': '2027-03-30',
};

function lfsEntries(): Array<[period: string, date: string]> {
    return Object.entries(JP_LFS_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

/** Najbliższy komunikat po `now` (null, gdy kalendarz się skończył). */
export function nextLfsRelease(now: Date): { period: string; date: string } | null {
    const hit = lfsEntries().find(([, date]) => releaseInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

/**
 * Miesiąc, którego stopa powinna już być na stronie. Z kalendarza, a gdy ten się skończył
 * (ostatnia publikacja sprzed >35 dni) — heurystyka: do 28. dnia miesiąca M oczekujemy M-2, od 28. — M-1.
 */
export function expectedJpUnemployment(now: Date): string {
    const entries = lfsEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - releaseInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (releaseInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 28 ? -1 : -2);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function labourSentence(p: JpLabourPayload): string | null {
    const sa = lastLabourPoint(p.series.sa);
    const nsa = lastLabourPoint(p.series.nsa);
    if (!sa) return null;
    const period = formatDataPeriod(sa.date);
    const raw = nsa && nsa.date === sa.date ? ` Bez korekty sezonowej: ${formatDecimalPL(nsa.value, 1)}%.` : '';
    return `Dane za ${period}: stopa bezrobocia wyrównana sezonowo wynosi ${formatDecimalPL(sa.value, 1)}%.${raw}`;
}
