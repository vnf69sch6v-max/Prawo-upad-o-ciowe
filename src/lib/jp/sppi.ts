// Ceny usług dla firm (企業向けサービス価格指数), baza 2020. API Banku Japonii, bez klucza.
// Komunikat 27.10.2026, 8:50: wrzesień, wstępne, +3,7% r/r. Indeks 115,5, wobec sierpnia +0,3%.
// Sierpień po korekcie: +3,5% r/r, indeks 115,2. Najnowszy miesiąc w tym szeregu jest wstępny.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey } from './calendar';

export type JpSppiId = 'yoy' | 'index' | 'exYoy';

export interface JpSppiSeriesConfig {
    id: JpSppiId;
    db: string;
    code: string;
    mustInclude: string[];
    mustExclude: string[];
}

export const JP_SPPI_SERIES: JpSppiSeriesConfig[] = [
    {
        id: 'yoy', db: 'PR02', code: 'PRCS20_5200000000%',
        mustInclude: ['All items', 'Year-on-year', '%'],
        mustExclude: ['excluding International', 'labor'],
    },
    {
        id: 'index', db: 'PR02', code: 'PRCS20_5200000000',
        mustInclude: ['All items', 'CY2020 average=100'],
        mustExclude: ['Year-on-year', 'excluding', 'labor'],
    },
    {
        id: 'exYoy', db: 'PR02', code: 'PRCS20_52B0000000%',
        mustInclude: ['excluding International transportation', 'Year-on-year', '%'],
        mustExclude: ['labor'],
    },
];

export const JP_SPPI_SOURCE = 'Bank of Japan · Services Producer Price Index';

export interface JpSppiPoint {
    /** YYYY-MM */
    date: string;
    value: number;
}

export interface JpSppiPayload {
    series: Record<JpSppiId, JpSppiPoint[]>;
    names: Record<JpSppiId, string>;
    source: string;
    fetchedAt: string;
}

export function jpSppiIsEmpty(p: JpSppiPayload | null | undefined): boolean {
    return !p?.series?.yoy?.length || !p.series.index?.length || !p.series.exYoy?.length;
}

export function sppiDataUrl(cfg: JpSppiSeriesConfig, startMonth: string, endMonth: string): string {
    const q = new URLSearchParams({
        format: 'json', lang: 'en', db: cfg.db, startDate: startMonth, endDate: endMonth, code: cfg.code,
    });
    return `https://www.stat-search.boj.or.jp/api/v1/getDataCode?${q.toString()}`;
}

function monthOf(n: number): string | null {
    const m = String(n).match(/^(\d{4})(\d{2})$/);
    if (!m || +m[2] < 1 || +m[2] > 12) return null;
    return `${m[1]}-${m[2]}`;
}

/** Jedna miesięczna seria. Daty w API to YYYYMM, nie YYYYMMDD. Zła nazwa rzuca. */
export function parseSppiSeries(json: unknown, cfg: JpSppiSeriesConfig): { name: string; points: JpSppiPoint[] } {
    const root = json && typeof json === 'object' ? json as { STATUS?: unknown; RESULTSET?: unknown } : null;
    if (!root || root.STATUS !== 200) throw new Error(`BOJ ${cfg.id}: zła odpowiedź`);
    const row = Array.isArray(root.RESULTSET) ? root.RESULTSET[0] : null;
    if (!row || typeof row !== 'object') throw new Error(`BOJ ${cfg.id}: pusta seria`);
    const rec = row as { SERIES_CODE?: unknown; NAME_OF_TIME_SERIES?: unknown; UNIT?: unknown; VALUES?: unknown };
    if (rec.SERIES_CODE !== cfg.code) throw new Error(`BOJ ${cfg.id}: inny kod`);
    const name = typeof rec.NAME_OF_TIME_SERIES === 'string' ? rec.NAME_OF_TIME_SERIES : '';
    const unit = typeof rec.UNIT === 'string' ? rec.UNIT : '';
    const label = `${name} ${unit}`;
    for (const frag of cfg.mustInclude) {
        if (!label.includes(frag)) throw new Error(`BOJ ${cfg.id}: nazwa nie zawiera „${frag}”`);
    }
    for (const frag of cfg.mustExclude) {
        if (label.includes(frag)) throw new Error(`BOJ ${cfg.id}: nazwa nie może zawierać „${frag}”`);
    }
    const values = rec.VALUES && typeof rec.VALUES === 'object' ? rec.VALUES as { SURVEY_DATES?: unknown; VALUES?: unknown } : null;
    const dates = Array.isArray(values?.SURVEY_DATES) ? values.SURVEY_DATES : [];
    const nums = Array.isArray(values?.VALUES) ? values.VALUES : [];
    const points: JpSppiPoint[] = [];
    for (let i = 0; i < dates.length; i++) {
        const date = typeof dates[i] === 'number' ? monthOf(dates[i]) : null;
        const value = nums[i];
        if (!date || typeof value !== 'number' || !Number.isFinite(value)) continue;
        points.push({ date, value });
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (!points.length) throw new Error(`BOJ ${cfg.id}: brak liczb`);
    return { name, points };
}

export function lastSppiPoint(points: JpSppiPoint[] | undefined): JpSppiPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function consecutive(prev: string, next: string): boolean {
    const [y, m] = prev.split('-').map(Number);
    const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    return next === expected;
}

/** Zmiana indeksu wobec poprzedniego miesiąca, do 0,1. */
export function sppiMom(points: JpSppiPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const prev = points[points.length - 2];
    const last = points[points.length - 1];
    if (!consecutive(prev.date, last.date) || !prev.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/**
 * Komunikat o 8:50 JST, zwykle pod koniec następnego miesiąca.
 * Październik 2026 nie ma jeszcze daty w kalendarzu Banku — dopisać, gdy ją ogłosi.
 */
export const JP_SPPI_RELEASES: Record<string, string> = {
    '2026-01': '2026-02-25', '2026-02': '2026-03-26', '2026-03': '2026-04-24', '2026-04': '2026-05-27',
    '2026-05': '2026-06-24', '2026-06': '2026-07-27', '2026-07': '2026-08-26', '2026-08': '2026-09-28',
    '2026-09': '2026-10-27',
};

function sppiEntries(): Array<[string, string]> {
    return Object.entries(JP_SPPI_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function sppiInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T08:50:00+09:00`);
}

export function nextSppiRelease(now: Date): { period: string; date: string } | null {
    const hit = sppiEntries().find(([, date]) => sppiInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpSppi(now: Date): string {
    const entries = sppiEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - sppiInstant(lastDate) <= 40 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (sppiInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 26 ? -1 : -2);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function sppiSentence(p: JpSppiPayload): string | null {
    const yoy = lastSppiPoint(p.series.yoy);
    const index = lastSppiPoint(p.series.index);
    if (!yoy) return null;
    const period = formatDataPeriod(yoy.date);
    const rate = yoy.value === 0
        ? 'ceny usług dla firm nie zmieniły się wobec roku wcześniej'
        : `ceny usług dla firm ${yoy.value > 0 ? 'wzrosły' : 'spadły'} o ${formatDecimalPL(Math.abs(yoy.value), 1)}% wobec roku wcześniej`;
    const level = index && index.date === yoy.date ? ` Indeks wynosi ${formatDecimalPL(index.value, 1)} (baza 2020).` : '';
    const mom = index && index.date === yoy.date ? sppiMom(p.series.index) : null;
    const month = mom == null ? '' : mom > 0
        ? ` Wobec poprzedniego miesiąca indeks wzrósł o ${formatDecimalPL(mom, 1)}%.`
        : mom < 0 ? ` Wobec poprzedniego miesiąca indeks spadł o ${formatDecimalPL(Math.abs(mom), 1)}%.` : ' Wobec poprzedniego miesiąca indeks się nie zmienił.';
    return `Dane za ${period}: ${rate}.${level}${month}${exTransportClause(p, yoy.date)} Odczyt jest wstępny.`;
}

function signedPct(v: number): string {
    return `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}%`;
}

/** Rok do roku bez transportu międzynarodowego, gdy dotyczy tego samego miesiąca co nagłówek. */
function exTransportClause(p: JpSppiPayload, yoyDate: string): string {
    const points = p.series.exYoy;
    if (!points?.length) return '';
    const last = points[points.length - 1];
    if (last.date !== yoyDate) return '';
    const prev = points.length > 1 ? points[points.length - 2] : null;
    const rate = signedPct(last.value);
    if (prev && consecutive(prev.date, last.date) && prev.value === last.value) {
        return ` Bez transportu międzynarodowego: ${rate}, tyle samo co miesiąc wcześniej.`;
    }
    if (prev && consecutive(prev.date, last.date)) {
        return ` Bez transportu międzynarodowego: ${rate} (miesiąc wcześniej ${signedPct(prev.value)}).`;
    }
    return ` Bez transportu międzynarodowego: ${rate}.`;
}
