// Japonia — kalendarz publikacji CPI (Statistics Bureau of Japan, „Schedule of Release”,
// https://www.stat.go.jp/english/data/cpi/1582.htm, stan na 24.10.2026). Komunikaty o 8:30 JST.
//
// Lekcja z PL: wiek odczytu liczymy od publikacji, z którą liczba TRAFIA NA STRONĘ. Dla serii krajowych
// to komunikat krajowy; dla Tokio odczyt wstępny (koniec miesiąca), a dane końcowe Tokio przychodzą
// razem z krajowymi. Kalendarz trzeba dopisywać — gdy się kończy, kontrola świeżości przechodzi na
// heurystykę i mówi o tym w opisie (patrz `expectedJpCpi`).

import type { DashboardPoint } from './stat-dashboard';
import type { JpCpiId } from './cpi';

/** Klucz: miesiąc danych (YYYY-MM) → dzień publikacji (YYYY-MM-DD, JST). */
export const JP_CPI_NATIONAL_RELEASES: Record<string, string> = {
    '2025-12': '2026-01-23', '2026-01': '2026-02-20', '2026-02': '2026-03-24', '2026-03': '2026-04-24',
    '2026-04': '2026-05-22', '2026-05': '2026-06-19', '2026-06': '2026-07-24', '2026-07': '2026-08-21',
    '2026-08': '2026-09-18', '2026-09': '2026-10-23', '2026-10': '2026-11-20', '2026-11': '2026-12-18',
    '2026-12': '2027-01-22', '2027-01': '2027-02-19', '2027-02': '2027-03-19',
};

/** Tokio (23 dzielnice), odczyt WSTĘPNY za bieżący miesiąc. */
export const JP_CPI_TOKYO_RELEASES: Record<string, string> = {
    '2026-01': '2026-01-30', '2026-02': '2026-02-27', '2026-03': '2026-03-31', '2026-04': '2026-05-01',
    '2026-05': '2026-05-29', '2026-06': '2026-06-26', '2026-07': '2026-07-31', '2026-08': '2026-08-28',
    '2026-09': '2026-10-02', '2026-10': '2026-10-30', '2026-11': '2026-11-27', '2026-12': '2026-12-25',
    '2027-01': '2027-01-29', '2027-02': '2027-02-26', '2027-03': '2027-03-26',
};

export type JpRelease = 'national' | 'tokyo';

const RELEASES: Record<JpRelease, Record<string, string>> = {
    national: JP_CPI_NATIONAL_RELEASES,
    tokyo: JP_CPI_TOKYO_RELEASES,
};

/** Godzina komunikatu w Japonii (JST = UTC+9, bez zmiany czasu). */
export const JP_RELEASE_HOUR_JST = '08:30';

/** Moment publikacji: 8:30 JST danego dnia. */
export function releaseInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T${JP_RELEASE_HOUR_JST}:00+09:00`);
}

/** Dzisiejsza data w Japonii (YYYY-MM-DD). */
export function jstDateKey(now: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function sortedEntries(kind: JpRelease): Array<[period: string, date: string]> {
    return Object.entries(RELEASES[kind]).sort((a, b) => a[1].localeCompare(b[1]));
}

/** Najnowszy miesiąc, którego komunikat już się ukazał (wg kalendarza) — null przed pierwszym wpisem. */
export function latestReleasedPeriod(kind: JpRelease, now: Date): string | null {
    let hit: string | null = null;
    for (const [period, date] of sortedEntries(kind)) if (releaseInstant(date) <= now.getTime()) hit = period;
    return hit;
}

/** Najbliższa publikacja po `now` (null, gdy kalendarz się skończył). */
export function nextRelease(kind: JpRelease, now: Date): { period: string; date: string } | null {
    const hit = sortedEntries(kind).find(([, date]) => releaseInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

/** Dzień, w którym ten punkt trafił na stronę: wstępne Tokio — komunikat Tokio, reszta — komunikat krajowy. */
export function publishedOn(id: JpCpiId, point: DashboardPoint | null): string | null {
    if (!point) return null;
    if (id === 'tokyo' && point.provisional) return JP_CPI_TOKYO_RELEASES[point.date] ?? null;
    return JP_CPI_NATIONAL_RELEASES[point.date] ?? null;
}

function shiftMonth(period: string, delta: number): string {
    const [y, m] = period.split('-').map(Number);
    const idx = y * 12 + (m - 1) + delta;
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

/**
 * Miesiąc, którego krajowy CPI powinien już być dostępny. Z kalendarza, a gdy ten się skończył
 * (ostatnia publikacja sprzed >35 dni) — heurystyka: od 25. dnia M oczekujemy M-1, wcześniej M-2.
 */
export function expectedJpCpi(now: Date): { period: string; fromCalendar: boolean } {
    const entries = sortedEntries('national');
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - releaseInstant(lastDate) <= 35 * 86_400_000;
    const released = latestReleasedPeriod('national', now);
    if (fromCalendar && released) return { period: released, fromCalendar };
    const today = jstDateKey(now);
    const [y, m, d] = today.split('-').map(Number);
    const month = `${y}-${String(m).padStart(2, '0')}`;
    return { period: shiftMonth(month, d >= 25 ? -1 : -2), fromCalendar: false };
}
