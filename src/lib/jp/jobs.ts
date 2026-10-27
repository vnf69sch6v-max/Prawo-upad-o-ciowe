// Liczba ofert na osobę szukającą pracy (有効求人倍率). Statistics Dashboard, bez klucza.
// Komunikat Ministerstwa Zdrowia z 2.10.2026, 8:30 JST: sierpień, 1,18 oferty, tyle samo co w lipcu.
// Nowe oferty (新規求人倍率), też po sezonie: 2,06, o 0,04 mniej niż miesiąc wcześniej.
// Nazwa getData jest ta sama dla szeregu surowego i sezonowego — rozróżnia je klasa isSeasonal.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey, releaseInstant } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpJobsId = 'sa' | 'nsa' | 'fresh';

const ACTIVE = '0301020001000010010';
const FRESH = '0301020002000010010';
const BANNED = ['前年', '社会・人口', '正社員', 'パート'];

export interface JpJobsSeriesConfig {
    id: JpJobsId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_JOBS_SERIES: JpJobsSeriesConfig[] = [
    {
        id: 'sa', label: 'Oferty na osobę, po sezonie', short: 'Po sezonie', color: '#0F766E',
        hint: 'Liczba ofert w urzędach pracy na jedną osobę tam zarejestrowaną. Ministerstwo porównuje ją z poprzednim miesiącem.',
        query: {
            indicator: ACTIVE, rank: 2, region: '00000', from: '201801', seasonal: true,
            mustInclude: ['有効求人倍率'], mustExclude: ['新規', ...BANNED], unitIncludes: ['倍'],
        },
    },
    {
        id: 'nsa', label: 'Oferty na osobę, bez korekty', short: 'Bez korekty', color: '#64748B', dashed: true,
        hint: 'Ten sam wskaźnik bez wyrównania sezonowego. To liczba z danego miesiąca, z sezonowym rytmem rekrutacji.',
        query: {
            indicator: ACTIVE, rank: 2, region: '00000', from: '201801',
            mustInclude: ['有効求人倍率'], mustExclude: ['新規', ...BANNED], unitIncludes: ['倍'],
        },
    },
    {
        id: 'fresh', label: 'Nowe oferty na osobę', short: 'Nowe oferty', color: '#B45309',
        hint: 'Oferty zgłoszone w tym miesiącu, nie cały zaległy zasób. Też po wyrównaniu sezonowym.',
        query: {
            indicator: FRESH, rank: 2, region: '00000', from: '201801', seasonal: true,
            mustInclude: ['新規求人倍率'], mustExclude: ['有効', ...BANNED], unitIncludes: ['倍'],
        },
    },
];

export const JP_JOBS_SOURCE = 'Ministry of Health, Labour and Welfare · Employment Referrals';

export interface JpJobsPayload {
    series: Record<JpJobsId, DashboardPoint[]>;
    names: Record<JpJobsId, string>;
    source: string;
    fetchedAt: string;
}

export function jpJobsIsEmpty(p: JpJobsPayload | null | undefined): boolean {
    return !p?.series?.sa?.length || !p.series.nsa?.length || !p.series.fresh?.length;
}

export function lastJobsPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function consecutive(prev: string, next: string): boolean {
    const [y, m] = prev.split('-').map(Number);
    const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    return next === expected;
}

/** Różnica wobec poprzedniego miesiąca, do 0,01 oferty. */
export function jobsDelta(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2];
    const b = points[points.length - 1];
    if (!consecutive(a.date, b.date)) return null;
    return Math.round((b.value - a.value) * 100) / 100;
}

/** Daty miesięczne z kalendarza e-Stat, statystyka 00450222, 8:30 JST. Zgadzają się z porankami Labour Force Survey. */
export const JP_JOBS_RELEASES: Record<string, string> = {
    '2025-12': '2026-01-30', '2026-01': '2026-03-03', '2026-02': '2026-03-31', '2026-03': '2026-04-28',
    '2026-04': '2026-05-29', '2026-05': '2026-06-30', '2026-06': '2026-07-31', '2026-07': '2026-08-28',
    '2026-08': '2026-10-02', '2026-09': '2026-10-30', '2026-10': '2026-12-01', '2026-11': '2026-12-25',
    '2026-12': '2027-01-29', '2027-01': '2027-03-02', '2027-02': '2027-03-30',
};

function jobsEntries(): Array<[string, string]> {
    return Object.entries(JP_JOBS_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function nextJobsRelease(now: Date): { period: string; date: string } | null {
    const hit = jobsEntries().find(([, date]) => releaseInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpJobs(now: Date): string {
    const entries = jobsEntries();
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

function moveClause(delta: number | null): string {
    if (delta == null) return '';
    if (delta === 0) return ', tyle samo co miesiąc wcześniej';
    const word = delta > 0 ? 'więcej' : 'mniej';
    return `, o ${formatDecimalPL(Math.abs(delta), 2)} ${word} niż miesiąc wcześniej`;
}

export function jobsSentence(p: JpJobsPayload): string | null {
    const sa = lastJobsPoint(p.series.sa);
    if (!sa) return null;
    const nsa = lastJobsPoint(p.series.nsa);
    const fresh = lastJobsPoint(p.series.fresh);
    const nsaBit = nsa && nsa.date === sa.date ? ` Bez korekty sezonowej: ${formatDecimalPL(nsa.value, 2)}.` : '';
    const freshBit = fresh && fresh.date === sa.date
        ? ` Nowe oferty: ${formatDecimalPL(fresh.value, 2)} na osobę${moveClause(jobsDelta(p.series.fresh))}.`
        : '';
    return `Dane za ${formatDataPeriod(sa.date)}: na osobę szukającą pracy w urzędzie pracy przypada ${formatDecimalPL(sa.value, 2)} oferty${moveClause(jobsDelta(p.series.sa))}.${nsaBit}${freshBit}`;
}
