// Sprzedaż detaliczna Japonii (小売業販売額, nominalna). Statistics Dashboard, bez klucza.
// Poziom z komunikatu końcowego: sierpień 2026 = 13 072 × 10億円 = 13 072 mld jenów (korekta 15.10, 13:30).
// Wstępne z 30.09 było 13 052 mld i +2,7% r/r. Rok do roku liczymy z opublikowanych poziomów.
// Od stycznia 2025 poziomy są po spisie gospodarczym; stopa wobec 2024 wymaga współczynnika łączenia,
// którego tu nie ma — więc rok do roku pokazujemy dopiero, gdy oba miesiące są od stycznia 2025.
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export const JP_RETAIL_QUERY: DashboardQuery = {
    indicator: '0601010201010010000', rank: 2, region: '00000', from: '201801',
    mustInclude: ['小売業販売額（名目）'],
    unitIncludes: ['10億円'],
};

export const JP_RETAIL_SOURCE = 'Ministry of Economy, Trade and Industry · Current Survey of Commerce';

/** Oba miesiące stopy muszą być po korekcie spisu (styczeń 2025). */
const LINKED_FROM = '2025-01';

export interface JpRetailPayload {
    points: DashboardPoint[];
    name: string;
    source: string;
    fetchedAt: string;
}

export function jpRetailIsEmpty(p: JpRetailPayload | null | undefined): boolean {
    return !p?.points?.length;
}

export function lastRetailPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function shiftYear(period: string, delta: number): string | null {
    const m = period.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    return `${Number(m[1]) + delta}-${m[2]}`;
}

/** Rok do roku z poziomów, do 0,1. Null, gdy rok wcześniej jest przed styczniem 2025 albo go nie ma. */
export function retailYoy(points: DashboardPoint[] | undefined, period?: string): number | null {
    if (!points?.length) return null;
    const last = period ? points.find((p) => p.date === period) : points[points.length - 1];
    if (!last) return null;
    const prevDate = shiftYear(last.date, -1);
    if (!prevDate || prevDate < LINKED_FROM) return null;
    const prev = points.find((p) => p.date === prevDate);
    if (!prev?.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

export function retailYoySeries(points: DashboardPoint[] | undefined): Array<{ date: string; yoy: number }> {
    if (!points?.length) return [];
    return points.flatMap((p) => {
        const yoy = retailYoy(points, p.date);
        return yoy == null ? [] : [{ date: p.date, yoy }];
    });
}

/**
 * Komunikat końcowy sprzedaży (確報) o 13:30 JST. e-Stat, statystyka 00550030.
 * Inny dzień niż produkcja przemysłowa. Wstępny (8:50) Dashboard zastępuje.
 */
export const JP_RETAIL_FINAL_RELEASES: Record<string, string> = {
    '2025-11': '2026-01-16', '2025-12': '2026-02-16',
    '2026-01': '2026-03-17', '2026-02': '2026-04-15', '2026-03': '2026-05-18', '2026-04': '2026-06-15',
    '2026-05': '2026-07-15', '2026-06': '2026-08-17', '2026-07': '2026-09-15', '2026-08': '2026-10-15',
    '2026-09': '2026-11-16', '2026-10': '2026-12-15', '2026-11': '2027-01-18', '2026-12': '2027-02-15',
    '2027-01': '2027-03-16', '2027-02': '2027-04-15',
};

function retailEntries(): Array<[string, string]> {
    return Object.entries(JP_RETAIL_FINAL_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function retailFinalInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T13:30:00+09:00`);
}

export function nextRetailRelease(now: Date): { period: string; date: string } | null {
    const hit = retailEntries().find(([, date]) => retailFinalInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpRetail(now: Date): string {
    const entries = retailEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - retailFinalInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (retailFinalInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 16 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function retailSentence(points: DashboardPoint[] | undefined): string | null {
    const last = lastRetailPoint(points);
    if (!last) return null;
    const yoy = retailYoy(points);
    const level = `${formatNumber(last.value, 0)} mld jenów`;
    const period = formatDataPeriod(last.date);
    if (yoy == null) return `Dane za ${period}: sprzedaż detaliczna wyniosła ${level}.`;
    const dir = yoy > 0 ? 'więcej' : yoy < 0 ? 'mniej' : 'tyle samo';
    const move = yoy === 0 ? '' : ` o ${formatDecimalPL(Math.abs(yoy), 1)}%`;
    return `Dane za ${period}: sprzedaż detaliczna wyniosła ${level}, ${dir}${move} niż rok wcześniej.`;
}
