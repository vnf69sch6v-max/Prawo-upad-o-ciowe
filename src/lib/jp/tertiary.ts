// Aktywność usług Japonii (第３次産業活動指数, baza 2020). Statistics Dashboard, bez klucza.
// Liczba z komunikatu METI to zmiana indeksu wyrównanego sezonowo wobec poprzedniego miesiąca.
// Sierpień 2026 (速報 19.10, 13:30 JST): indeks 106,8, −0,1% m/m, wstępny. Rok do roku z indeksu surowego: 103,7 wobec 102,0 = +1,7%.
// Baza 2020 to średnia z lat 2019 i 2020 równa 100. Nazwa getData jest ta sama dla obu klas sezonowych.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpTertiaryId = 'sa' | 'nsa';

const CODE = '0603100300000090010';
const NAME = ['第３次産業活動指数', '2020年基準'];

export interface JpTertiarySeriesConfig {
    id: JpTertiaryId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_TERTIARY_SERIES: JpTertiarySeriesConfig[] = [
    {
        id: 'sa', label: 'Indeks wyrównany sezonowo', short: 'Wyrównany sezonowo', color: '#0369A1',
        hint: 'Baza 2020 = 100, a ta baza to średnia z 2019 i 2020. Komunikat podaje zmianę tego indeksu wobec poprzedniego miesiąca.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '201801', seasonal: true,
            mustInclude: NAME, mustExclude: ['2015年基準', '2010年基準', '広義対個人', '広義対事業所'],
        },
    },
    {
        id: 'nsa', label: 'Indeks bez korekty', short: 'Bez korekty', color: '#64748B', dashed: true,
        hint: 'Ten sam indeks bez wyrównania sezonowego. Rok do roku liczymy z niego — tak jest w komunikacie.',
        query: {
            indicator: CODE, rank: 2, region: '00000', from: '201801',
            mustInclude: NAME, mustExclude: ['2015年基準', '2010年基準', '広義対個人', '広義対事業所'],
        },
    },
];

export const JP_TERTIARY_SOURCE = 'Ministry of Economy, Trade and Industry · Indices of Tertiary Industry Activity';

export interface JpTertiaryPayload {
    series: Record<JpTertiaryId, DashboardPoint[]>;
    names: Record<JpTertiaryId, string>;
    source: string;
    fetchedAt: string;
}

export function jpTertiaryIsEmpty(p: JpTertiaryPayload | null | undefined): boolean {
    return !p?.series?.sa?.length || !p.series.nsa?.length;
}

export function lastTertiaryPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** Zmiana indeksu wobec poprzedniego miesiąca, w procentach, do 0,1 — jak w komunikacie. */
export function tertiaryMom(points: DashboardPoint[] | undefined): number | null {
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
export function tertiaryYoy(points: DashboardPoint[] | undefined): number | null {
    if (!points?.length) return null;
    const last = points[points.length - 1];
    const prevDate = shiftYear(last.date, -1);
    const prev = points.find((p) => p.date === prevDate);
    if (!prev?.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** Komunikat o 13:30 JST. e-Stat, statystyka 00550360, oraz harmonogram METI. */
export const JP_TERTIARY_RELEASES: Record<string, string> = {
    '2026-01': '2026-03-17', '2026-02': '2026-04-20', '2026-03': '2026-05-19', '2026-04': '2026-06-15',
    '2026-05': '2026-07-15', '2026-06': '2026-08-17', '2026-07': '2026-09-15', '2026-08': '2026-10-19',
    '2026-09': '2026-11-17', '2026-10': '2026-12-16', '2026-11': '2027-01-18', '2026-12': '2027-02-17',
    '2027-01': '2027-03-17',
};

const RELEASE_HOUR = '13:30';

export function tertiaryReleaseInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T${RELEASE_HOUR}:00+09:00`);
}

function tertiaryEntries(): Array<[string, string]> {
    return Object.entries(JP_TERTIARY_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function nextTertiaryRelease(now: Date): { period: string; date: string } | null {
    const hit = tertiaryEntries().find(([, date]) => tertiaryReleaseInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

/** Miesiąc, którego komunikat już się ukazał. Po końcu kalendarza: od 18. dnia M oczekujemy M-2, wcześniej M-3. */
export function expectedJpTertiary(now: Date): string {
    const entries = tertiaryEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - tertiaryReleaseInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (tertiaryReleaseInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 18 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function tertiarySentence(p: JpTertiaryPayload): string | null {
    const sa = lastTertiaryPoint(p.series.sa);
    const mom = tertiaryMom(p.series.sa);
    const yoy = tertiaryYoy(p.series.nsa);
    if (!sa || mom == null) return null;
    const period = formatDataPeriod(sa.date);
    const prelim = sa.provisional ? ', wstępne' : '';
    const verb = mom < 0 ? 'spadła' : mom > 0 ? 'wzrosła' : 'nie zmieniła się';
    const move = mom === 0 ? '' : ` o ${formatDecimalPL(Math.abs(mom), 1)}%`;
    const yoyTxt = yoy == null ? '' : ` Bez korekty sezonowej rok do roku: ${yoy > 0 ? '+' : ''}${formatDecimalPL(yoy, 1)}%.`;
    return `Dane za ${period}${prelim}: aktywność usług, wyrównana sezonowo, ${verb}${move} wobec poprzedniego miesiąca. Indeks wynosi ${formatDecimalPL(sa.value, 1)} (baza 2020).${yoyTxt}`;
}
