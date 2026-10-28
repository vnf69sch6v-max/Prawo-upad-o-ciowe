// Tankan: nastroje firm (業況判断 DI, duże przedsiębiorstwa). API Banku Japonii, bez klucza.
// Badanie z września 2026, komunikat 1.10 o 8:50: przemysł 24 (+2 wobec czerwca), spoza przemysłu 35 (−2).
// Na stronie jest wynik bieżący. Prognoza na kolejne badanie do wskaźnika nie wchodzi.
import { formatDecimalPL, formatNumber } from '@/lib/formatters';
import { jstDateKey } from './calendar';

export type JpTankanId = 'mfg' | 'non';

export interface JpTankanSeriesConfig {
    id: JpTankanId;
    db: string;
    code: string;
    mustInclude: string[];
    mustExclude: string[];
}

export const JP_TANKAN_SERIES: JpTankanSeriesConfig[] = [
    {
        id: 'mfg', db: 'CO', code: 'TK99F1000601GCQ01000',
        mustInclude: ['Business Conditions', 'Large Enterprises', 'Manufacturing', 'Actual result'],
        mustExclude: ['Nonmanufacturing', 'Forecast', 'Small', 'Medium'],
    },
    {
        id: 'non', db: 'CO', code: 'TK99F2000601GCQ01000',
        mustInclude: ['Business Conditions', 'Large Enterprises', 'Nonmanufacturing', 'Actual result'],
        mustExclude: ['Forecast', 'Small', 'Medium'],
    },
];

export const JP_TANKAN_SOURCE = 'Bank of Japan · Tankan';

export interface JpTankanPoint {
    /** `YYYY-Q[1-4]`, kwartał badania: Q1 marzec, Q2 czerwiec, Q3 wrzesień, Q4 grudzień. */
    date: string;
    value: number;
}

export interface JpTankanPayload {
    series: Record<JpTankanId, JpTankanPoint[]>;
    names: Record<JpTankanId, string>;
    source: string;
    fetchedAt: string;
}

const SURVEY_MONTH = ['marzec', 'czerwiec', 'wrzesień', 'grudzień'] as const;
const SURVEY_FROM = ['marca', 'czerwca', 'września', 'grudnia'] as const;

export function tankanDataUrl(cfg: JpTankanSeriesConfig, startQuarter: string, endQuarter: string): string {
    const q = new URLSearchParams({
        format: 'json', lang: 'en', db: cfg.db, startDate: startQuarter, endDate: endQuarter, code: cfg.code,
    });
    return `https://www.stat-search.boj.or.jp/api/v1/getDataCode?${q.toString()}`;
}

/** Bieżący kwartał kalendarzowy w Tokio, jako `YYYYQQ` (202603 = III kwartał 2026). */
export function tankanQuarterCode(now: Date): string {
    const [y, m] = jstDateKey(now).split('-').map(Number);
    return `${y}${String(Math.ceil(m / 3)).padStart(2, '0')}`;
}

function quarterOf(n: number): string | null {
    const m = String(n).match(/^(\d{4})(0[1-4])$/);
    if (!m) return null;
    return `${m[1]}-Q${Number(m[2])}`;
}

/** Jedna kwartalna seria. Daty w API to `YYYYQQ`. Pusty punkt przyszłego badania jest pomijany. */
export function parseTankanSeries(json: unknown, cfg: JpTankanSeriesConfig): { name: string; points: JpTankanPoint[] } {
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
    const points: JpTankanPoint[] = [];
    for (let i = 0; i < dates.length; i++) {
        const date = typeof dates[i] === 'number' ? quarterOf(dates[i]) : null;
        const value = nums[i];
        if (!date || typeof value !== 'number' || !Number.isFinite(value)) continue;
        points.push({ date, value });
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (!points.length) throw new Error(`BOJ ${cfg.id}: brak liczb`);
    return { name, points };
}

export function jpTankanIsEmpty(p: JpTankanPayload | null | undefined): boolean {
    return !p?.series?.mfg?.length || !p.series.non?.length;
}

export function lastTankanPoint(points: JpTankanPoint[] | undefined): JpTankanPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function previousQuarter(date: string): string | null {
    const m = date.match(/^(\d{4})-Q([1-4])$/);
    if (!m) return null;
    const q = Number(m[2]);
    return q === 1 ? `${Number(m[1]) - 1}-Q4` : `${m[1]}-Q${q - 1}`;
}

/** Różnica wobec poprzedniego badania, w punktach. */
export function tankanDelta(points: JpTankanPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    if (previousQuarter(last.date) !== prev.date) return null;
    return last.value - prev.value;
}

function surveyQuarter(date: string): { year: string; quarter: number } | null {
    const m = date.match(/^(\d{4})-Q([1-4])$/);
    return m ? { year: m[1], quarter: Number(m[2]) } : null;
}

export function tankanSurveyLabel(date: string): string {
    const q = surveyQuarter(date);
    return q ? `${SURVEY_MONTH[q.quarter - 1]} ${q.year}` : date;
}

function tankanSurveyFrom(date: string): string {
    const q = surveyQuarter(date);
    return q ? `${SURVEY_FROM[q.quarter - 1]} ${q.year}` : date;
}

/** Komunikat o 8:50 JST. Daty z listy komunikatów Banku i z jego harmonogramu na 2026/27. */
export const JP_TANKAN_RELEASES: Record<string, string> = {
    '2026-Q1': '2026-04-01',
    '2026-Q2': '2026-07-01',
    '2026-Q3': '2026-10-01',
    '2026-Q4': '2026-12-14',
    '2027-Q1': '2027-04-01',
};

const RELEASE_HOUR = '08:50';

export function tankanInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T${RELEASE_HOUR}:00+09:00`);
}

function tankanEntries(): Array<[string, string]> {
    return Object.entries(JP_TANKAN_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function nextTankanRelease(now: Date): { period: string; date: string } | null {
    const hit = tankanEntries().find(([, date]) => tankanInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpTankan(now: Date): string {
    const entries = tankanEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - tankanInstant(lastDate) <= 40 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (tankanInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    // Badania wychodzą 1.04, 1.07, 1.10 i 14.12. Godzinę 8:50 trzyma kalendarz powyżej.
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    if (m === 12 && d >= 14) return `${y}-Q4`;
    if (m >= 10) return `${y}-Q3`;
    if (m >= 7) return `${y}-Q2`;
    if (m >= 4) return `${y}-Q1`;
    return `${y - 1}-Q4`;
}

function pointsWord(n: number): string {
    const abs = Math.abs(Math.trunc(n));
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (abs === 1) return 'punkt';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'punkty';
    return 'punktów';
}

function level(v: number): string {
    return Number.isInteger(v) ? formatNumber(v, 0) : formatDecimalPL(v, 1);
}

function moveClause(delta: number | null): string {
    if (delta == null) return '';
    if (delta === 0) return ', tyle samo co w poprzednim badaniu';
    const dir = delta > 0 ? 'wyżej' : 'niżej';
    return `, o ${level(Math.abs(delta))} ${pointsWord(delta)} ${dir} niż w poprzednim badaniu`;
}

export function tankanSentence(p: JpTankanPayload): string | null {
    const mfg = lastTankanPoint(p.series.mfg);
    if (!mfg) return null;
    const non = lastTankanPoint(p.series.non);
    const nonBit = non && non.date === mfg.date
        ? ` Duże firmy spoza przemysłu: ${level(non.value)}${moveClause(tankanDelta(p.series.non))}.`
        : '';
    return `Badanie z ${tankanSurveyFrom(mfg.date)}: nastroje dużych firm przemysłowych wynoszą ${level(mfg.value)}${moveClause(tankanDelta(p.series.mfg))}.${nonBit}`;
}
