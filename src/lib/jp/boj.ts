// Bank Japonii — stopa oficjalna, call overnight i USD/JPY. Jedna konfiguracja dla trasy, strony i świeżości.
// API bez klucza: https://www.stat-search.boj.or.jp/api/v1/getDataCode (od 18.02.2026).
// Daty dzienne w parametrze to YYYYMM (cały miesiąc), nie YYYYMMDD — inaczej API zwraca 400.
import { formatDecimalPL } from '@/lib/formatters';

export type BojId = 'policy' | 'call' | 'usdjpy';

export interface BojSeriesConfig {
    id: BojId;
    db: string;
    code: string;
    label: string;
    short: string;
    hint: string;
    /** Jednostka na kafelku. */
    unit: string;
    /** Fragmenty nazwy serii z API (lang=en). Zła seria = błąd. */
    mustInclude: string[];
    /** Ile miesięcy historii ciągnąć (dziennie). */
    months: number;
    color: string;
}

export const BOJ_SERIES: BojSeriesConfig[] = [
    {
        id: 'policy', db: 'IR01', code: 'MADR1Z@D',
        label: 'Stopa BOJ', short: 'Stopa BOJ', unit: '%', color: '#DC2626', months: 36,
        hint: 'Basic loan rate — oficjalna stopa dyskontowa Banku Japonii, procent w skali roku.',
        mustInclude: ['Basic Loan Rate', 'Percent per annum'],
    },
    {
        id: 'call', db: 'FM01', code: 'STRDCLUCON',
        label: 'Call overnight', short: 'Call O/N', unit: '%', color: '#7C3AED', months: 18,
        hint: 'Niezabezpieczona stopa overnight, średnia dzienna. Tę stopę BOJ prowadzi do celu.',
        mustInclude: ['Uncollateralized Overnight', 'percent per annum'],
    },
    {
        id: 'usdjpy', db: 'FM08', code: 'FXERD04',
        label: 'USD/JPY', short: 'USD/JPY', unit: 'JPY', color: '#2563EB', months: 18,
        hint: 'Kurs spot dolara do jena o 17:00 czasu tokijskiego, rynek międzybankowy w Tokio.',
        mustInclude: ['US.Dollar/Yen', '17:00', 'Yen per U.S. Dollar'],
    },
];

export const BOJ_SOURCE = 'Bank Japonii · BOJ Time-Series Data Search';
export const BOJ_CREDIT_PL =
    'Serwis korzysta z BOJ Time-Series Data Search. Bank Japonii nie gwarantuje treści i nie jest związany z Savori.';
export const BOJ_CREDIT_EN =
    'This service uses the BOJ Time-Series Data Search. The Bank of Japan does not guarantee the contents and is not affiliated with Savori.';

export interface BojPoint {
    /** YYYY-MM-DD */
    date: string;
    value: number;
}

export interface BojPayload {
    series: Record<BojId, BojPoint[]>;
    /** Nazwy serii potwierdzone u źródła. */
    names: Record<BojId, string>;
    source: string;
    fetchedAt: string;
}

export function bojIsEmpty(p: BojPayload | null | undefined): boolean {
    return !p?.series || BOJ_SERIES.some((s) => !p.series[s.id]?.length);
}

export function lastBojPoint(points: BojPoint[] | undefined): BojPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** O ile zmieniła się wartość wobec poprzedniego punktu (niekoniecznie poprzedniego dnia kalendarzowego). */
export function pointChange(points: BojPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2].value;
    const b = points[points.length - 1].value;
    return Math.round((b - a) * 1000) / 1000;
}

/** Data, od której obowiązuje bieżący poziom (ostatnia zmiana wartości). */
export function levelSince(points: BojPoint[] | undefined): string | null {
    if (!points?.length) return null;
    const current = points[points.length - 1].value;
    let since = points[points.length - 1].date;
    for (let i = points.length - 2; i >= 0; i--) {
        if (points[i].value !== current) break;
        since = points[i].date;
    }
    return since;
}

/** Oczekiwany dzień kursu 17:00 JST: dziś po 18:00 czasu tokijskiego, inaczej poprzedni dzień powszedni. */
export function expectedUsdJpyDate(now: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    let iso = `${pick('year')}-${pick('month')}-${pick('day')}`;
    if (Number(pick('hour')) < 18) iso = addDays(iso, -1);
    while (isWeekend(iso)) iso = addDays(iso, -1);
    return iso;
}

function addDays(iso: string, days: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    return dt.toISOString().slice(0, 10);
}

function isWeekend(iso: string): boolean {
    const [y, m, d] = iso.split('-').map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return day === 0 || day === 6;
}

function tokyoYearMonth(now: Date): { year: number; month: number } {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit' }).formatToParts(now);
    const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return { year: pick('year'), month: pick('month') };
}

/** YYYYMM sprzed `months` miesięcy, w kalendarzu tokijskim. */
export function bojStartMonth(now: Date, months: number): string {
    const { year, month } = tokyoYearMonth(now);
    const dt = new Date(Date.UTC(year, month - 1 - months, 1));
    return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function bojEndMonth(now: Date): string {
    const { year, month } = tokyoYearMonth(now);
    return `${year}${String(month).padStart(2, '0')}`;
}

export function bojDataUrl(cfg: BojSeriesConfig, startMonth: string, endMonth: string): string {
    const q = new URLSearchParams({
        format: 'json', lang: 'en', db: cfg.db, startDate: startMonth, endDate: endMonth, code: cfg.code,
    });
    // `@` w kodzie stopy zostaje dosłownie, jak w przykładzie z podręcznika API.
    return `https://www.stat-search.boj.or.jp/api/v1/getDataCode?${q.toString().replace('%40', '@')}`;
}

function ymd(n: number): string | null {
    const s = String(n);
    const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!m) return null;
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Jedna seria z odpowiedzi getDataCode. Puste i nieliczby wypadają. Zła nazwa rzuca. */
export function parseBojSeries(json: unknown, cfg: BojSeriesConfig): { name: string; points: BojPoint[] } {
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
    const values = rec.VALUES && typeof rec.VALUES === 'object' ? rec.VALUES as { SURVEY_DATES?: unknown; VALUES?: unknown } : null;
    const dates = Array.isArray(values?.SURVEY_DATES) ? values.SURVEY_DATES : [];
    const nums = Array.isArray(values?.VALUES) ? values.VALUES : [];
    const points: BojPoint[] = [];
    for (let i = 0; i < dates.length; i++) {
        const date = typeof dates[i] === 'number' ? ymd(dates[i]) : null;
        const value = nums[i];
        if (!date || typeof value !== 'number' || !Number.isFinite(value)) continue;
        points.push({ date, value });
    }
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (!points.length) throw new Error(`BOJ ${cfg.id}: brak liczb`);
    return { name, points };
}

export function marketsSentence(p: BojPayload): string | null {
    const fx = lastBojPoint(p.series.usdjpy);
    const policy = lastBojPoint(p.series.policy);
    const call = lastBojPoint(p.series.call);
    if (!fx || !policy || !call) return null;
    const ch = pointChange(p.series.usdjpy);
    const move = ch == null ? '' : ch === 0 ? ' bez zmiany wobec poprzedniego notowania' : ` (${ch > 0 ? '+' : '−'}${formatDecimalPL(Math.abs(ch), 2)} jena wobec poprzedniego notowania)`;
    return `Dolar kosztuje ${formatDecimalPL(fx.value, 2)} jena${move}. Stopa BOJ wynosi ${formatDecimalPL(policy.value, 2)}%, a niezabezpieczony call overnight ${formatDecimalPL(call.value, 3)}%.`;
}
