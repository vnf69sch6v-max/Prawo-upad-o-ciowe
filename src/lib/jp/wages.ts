// Płace w Japonii (現金給与総額), Monthly Labour Survey, Statistics Dashboard, bez klucza.
// Liczba z komunikatu końcowego (確報): zakłady od 5 pracowników, rok do roku.
// Sierpień 2026: nominalne 3,9% (wstępne było 3,8%), realne 1,6% wobec CPI bez czynszu właściciela.
// Dashboard nie rozdziela realnych wobec CPI ogółem (w komunikacie 2,0%) — tego szeregu nie pokazujemy.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey, releaseInstant } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpWageId = 'nominal' | 'real';

export interface JpWageSeriesConfig {
    id: JpWageId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_WAGE_SERIES: JpWageSeriesConfig[] = [
    {
        id: 'nominal', label: 'Płace nominalne', short: 'Nominalne', color: '#DC2626',
        hint: '現金給与総額, zakłady od 5 pracowników, rok do roku. Na stronie jest liczba z komunikatu końcowego, po korekcie wstępnego odczytu.',
        query: {
            indicator: '0302020000000030000', rank: 2, region: '00000', from: '201301',
            mustInclude: ['（前年同月比）現金給与総額'],
            mustExclude: ['実質'],
        },
    },
    {
        id: 'real', label: 'Płace realne', short: 'Realne', color: '#0F766E', dashed: true,
        hint: 'Ta sama płaca wobec CPI bez przypisanego czynszu właściciela — tak liczy ją komunikat. Wobec CPI ogółem ministerstwo podaje inną liczbę.',
        query: {
            indicator: '0302030201010030010', rank: 2, region: '00000', from: '201301',
            mustInclude: ['（前年同月比）実質賃金指数（現金給与総額）'],
        },
    },
];

export const JP_WAGE_SOURCE = 'Ministry of Health, Labour and Welfare · Monthly Labour Survey';

export interface JpWagesPayload {
    series: Record<JpWageId, DashboardPoint[]>;
    names: Record<JpWageId, string>;
    source: string;
    fetchedAt: string;
}

export function jpWagesIsEmpty(p: JpWagesPayload | null | undefined): boolean {
    return !p?.series?.nominal?.length || !p.series.real?.length;
}

export function lastWagePoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

export function wageChangePp(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2].value;
    const b = points[points.length - 1].value;
    return Math.round((b - a) * 10) / 10;
}

/**
 * Komunikat końcowy (確報) Monthly Labour Survey, 8:30 JST.
 * Kalendarz e-Stat, statystyka 00450071. Wstępny odczyt Dashboard pomija — na stronie jest liczba po korekcie.
 * Dopisać przed kwietniem 2027.
 */
export const JP_WAGE_FINAL_RELEASES: Record<string, string> = {
    '2025-11': '2026-01-23', '2025-12': '2026-02-25',
    '2026-01': '2026-04-08', '2026-02': '2026-04-23', '2026-03': '2026-05-22', '2026-04': '2026-06-24',
    '2026-05': '2026-07-24', '2026-06': '2026-08-24', '2026-07': '2026-09-28', '2026-08': '2026-10-23',
    '2026-09': '2026-11-25', '2026-10': '2026-12-23', '2026-11': '2027-01-22', '2026-12': '2027-02-26',
};

function wageEntries(): Array<[string, string]> {
    return Object.entries(JP_WAGE_FINAL_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function nextWageRelease(now: Date): { period: string; date: string } | null {
    const hit = wageEntries().find(([, date]) => releaseInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

/** Miesiąc, którego komunikat końcowy już się ukazał. Po końcu kalendarza: od 26. dnia M oczekujemy M-2, wcześniej M-3. */
export function expectedJpWages(now: Date): string {
    const entries = wageEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - releaseInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (releaseInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 26 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function wagesSentence(p: JpWagesPayload): string | null {
    const nominal = lastWagePoint(p.series.nominal);
    const real = lastWagePoint(p.series.real);
    if (!nominal) return null;
    const period = formatDataPeriod(nominal.date);
    const realTxt = real && real.date === nominal.date ? `, realne ${formatDecimalPL(real.value, 1)}% r/r` : '';
    return `Dane za ${period}: płace nominalne wynoszą ${formatDecimalPL(nominal.value, 1)}% r/r${realTxt}.`;
}
