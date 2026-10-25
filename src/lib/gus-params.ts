// Walidacja parametrów tras GUS DBW, zanim cokolwiek trafi do cache albo do GUS (specyfikacja
// docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md, B1–B6). Wspólny limit DBW to ~100 żądań / 15 min,
// a każdy nowy rok, seria albo `years` to nowy klucz cache i kilkadziesiąt wywołań — `?year=1` dawało 8152.
// Dlatego trasy przyjmują tylko to, co wysyła nasz kod (`src/lib/gus-api-paths.ts`); reszta dostaje 400.
import { NextResponse } from 'next/server';
import { DBW_POLSKA, DBW_SERIES, type DbwSeriesId } from '@/lib/gus-dbw-series';

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string; param: string };

const bad = (error: string, param: string): { ok: false; error: string; param: string } => ({ ok: false, error, param });

/** Odpowiedź na błędny parametr: 400, bez cache, `{ error, param }` (kształt zgodny z kontrolą świeżości). */
export function badParam(p: { error: string; param: string }) {
    return NextResponse.json({ error: p.error, param: p.param }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
}

const WARSAW = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: 'numeric', day: 'numeric' });

/** Data kalendarzowa w Warszawie. */
export function warsawDate(now: Date): { year: number; month: number; day: number } {
    const parts = Object.fromEntries(WARSAW.formatToParts(now).map((p) => [p.type, p.value]));
    return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

export interface GusYear {
    year: number;
    /** Rok bieżący w Warszawie — tylko dla niego działa `refresh=1`. */
    current: boolean;
}

/** Lata, które przyjmuje trasa: bieżący i poprzedni, a 31 grudnia także następny (urządzenia na wschód od PL). */
export function allowedYears(now: Date): number[] {
    const { year, month, day } = warsawDate(now);
    return month === 12 && day === 31 ? [year - 1, year, year + 1] : [year - 1, year];
}

/** Reguła B1: brak albo pusty = rok Warszawy; dokładnie 4 cyfry z `allowedYears`; reszta i powtórzenia = 400. */
export function parseGusYear(sp: URLSearchParams, now: Date = new Date(), name = 'year'): Parsed<GusYear> {
    const values = sp.getAll(name);
    if (values.length > 1) return bad(`Parametr ${name} podany więcej niż raz.`, name);
    const current = warsawDate(now).year;
    const raw = values[0] ?? '';
    if (raw === '') return { ok: true, value: { year: current, current: true } };
    const allowed = allowedYears(now);
    if (!/^\d{4}$/.test(raw) || !allowed.includes(Number(raw))) {
        return bad(`Nieprawidłowy rok: dozwolone ${allowed.join(', ')}.`, name);
    }
    const year = Number(raw);
    return { ok: true, value: { year, current: year === current } };
}

/** `refresh=1` wymusza pobranie u źródła tylko dla klucza bieżącego roku (połowa budżetu wymuszonych wywołań). */
export const forcedRefresh = (sp: URLSearchParams, y: GusYear) => sp.get('refresh') === '1' && y.current;

const SINGLE_DBW = ['var', 'przekroj', 'freq', 'prez', 'poz1', 'sub100'] as const;
const NUM = /^\d+$/;

/** Reguła B3: po uzupełnieniu domyślnych cała krotka musi być jedną z serii `DBW_SERIES`. */
export function parseDbwSeries(sp: URLSearchParams): Parsed<DbwSeriesId> {
    for (const k of SINGLE_DBW) if (sp.getAll(k).length > 1) return bad(`Parametr ${k} podany więcej niż raz.`, k);
    const v = sp.get('var');
    const przekroj = sp.get('przekroj');
    const poz = sp.getAll('poz');
    if (!v || !przekroj || poz.length === 0) return bad('Wymagane: var, przekroj, poz.', 'series');
    const freq = sp.get('freq') ?? 'm';
    const prez = sp.get('prez') ?? '5';
    const poz1 = sp.get('poz1') ?? String(DBW_POLSKA);
    const sub100 = sp.get('sub100') ?? '1';
    for (const [k, val] of [['var', v], ['przekroj', przekroj], ['prez', prez], ['poz1', poz1], ...poz.map((p) => ['poz', p])]) {
        if (!NUM.test(val)) return bad(`Nieprawidłowy parametr ${k}.`, k);
    }
    if (freq !== 'm' && freq !== 'q') return bad('Nieprawidłowy parametr freq: dozwolone m, q.', 'freq');
    if (Number(poz1) !== DBW_POLSKA) return bad('Dostępna jest tylko Polska (poz1=33617).', 'poz1');
    if (sub100 !== '1') return bad('Dozwolone tylko sub100=1.', 'sub100');
    const id = (Object.keys(DBW_SERIES) as DbwSeriesId[]).find((key) => {
        const s = DBW_SERIES[key];
        return s.var === Number(v) && s.przekroj === Number(przekroj) && (s.freq ?? 'm') === freq
            && (s.prez ?? 5) === Number(prez)
            && s.poz.length === poz.length && s.poz.every((p, i) => p === Number(poz[i]));
    });
    return id ? { ok: true, value: id } : bad('Nieznana seria DBW.', 'series');
}

/** Reguła B4: `years` brak albo dokładnie 4 (klucz `gus_monthly_v3_4`). */
export function parseGusMonthlyYears(sp: URLSearchParams): Parsed<number> {
    const values = sp.getAll('years');
    if (values.length === 0) return { ok: true, value: 4 };
    if (values.length === 1 && values[0] === '4') return { ok: true, value: 4 };
    return bad('Nieprawidłowy parametr years: dozwolone 4.', 'years');
}

/** Okresy DBW: miesiące 247–258, kwartały 270–273. */
const DBW_OKRES = /^(24[7-9]|25[0-8]|27[0-3])$/;

/** `/api/dbw` (zablokowane proxy, B5): tylko var/przekrój serii z listy, rok wg B1, jeden znany okres. */
export function parseDbwProxy(sp: URLSearchParams, now: Date = new Date()): Parsed<{ var: number; przekroj: number; year: GusYear; okres: number | null }> {
    for (const k of ['var', 'przekroj', 'okres', 'page-size']) if (sp.getAll(k).length > 1) return bad(`Parametr ${k} podany więcej niż raz.`, k);
    const v = Number(sp.get('var'));
    const przekroj = Number(sp.get('przekroj'));
    if (!NUM.test(sp.get('var') ?? '') || !NUM.test(sp.get('przekroj') ?? '')
        || !Object.values(DBW_SERIES).some((s) => s.var === v && s.przekroj === przekroj)) {
        return bad('Nieznana seria DBW.', 'series');
    }
    const y = parseGusYear(sp, now, 'rok');
    if (!y.ok) return y;
    const okres = sp.get('okres');
    if (okres != null && !DBW_OKRES.test(okres)) return bad('Nieprawidłowy okres DBW.', 'okres');
    return { ok: true, value: { var: v, przekroj, year: y.value, okres: okres == null ? null : Number(okres) } };
}

/**
 * Walidator dla ścieżki (`/api/...?...`) — do testu „nasze ścieżki nigdy nie dostają 400”. `null` = trasa bez
 * walidacji z tej specyfikacji.
 */
export function validateGusPath(path: string, now: Date = new Date()): Parsed<unknown> | null {
    const u = new URL(path, 'https://savori.space');
    const sp = u.searchParams;
    switch (u.pathname) {
        case '/api/gus-cpi-full':
        case '/api/gus-ppi-full':
        case '/api/gus-koniunktura':
        case '/api/gus-cpi':
            return parseGusYear(sp, now);
        case '/api/dbw-series': {
            const y = parseGusYear(sp, now);
            return y.ok ? parseDbwSeries(sp) : y;
        }
        case '/api/gus-monthly':
            return parseGusMonthlyYears(sp);
        case '/api/dbw':
            return parseDbwProxy(sp, now);
        default:
            return null;
    }
}
