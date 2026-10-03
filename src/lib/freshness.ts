// Kontrola świeżości danych — CZYSTE reguły (bez I/O). Dla każdego zbioru: jaki okres POWINIEN już być
// opublikowany wg harmonogramu źródła, jak daleko za nim jest to, co serwuje nasze API, i jaki z tego status.
//
// Po co: produkcja potrafiła tygodniami serwować stare dane przy „zielonych" cronach (Data Cache Next.js
// wpychał stare odpowiedzi do Firestore), a sprzedaż detaliczna stała na lipcu, bo BDL dostaje miesiąc
// kilka tygodni po komunikacie GUS. Ta kontrola łapie takie rzeczy sama — `/api/health/freshness`,
// `/api/cron/freshness` i strona `/status` korzystają z tych samych reguł.
//
// Wszystkie funkcje przyjmują `now` → testowalne (tests/freshness.test.ts). Strefa: Europe/Warsaw.
import {
    cpiPreliminaryDate,
    industrialDate,
    nextBusinessDay,
    retailDate,
    unemploymentDate,
} from '@/lib/calendar-schedules';
import { generateMacroCalendar } from '@/lib/calendar';
import { formatDataPeriod } from '@/lib/formatters';
import { dbwSeriesPath, GUS_INDUSTRY_SERIES, GUS_RETAIL_SERIES, type DbwSeriesConfig } from '@/lib/gus-dbw-series';
import { warsawMinutes } from '@/lib/market-hours';
import { warsawDateKey } from '@/lib/news/warsaw-date';

// ─── Typy ───────────────────────────────────────────────

/** ok = najnowszy okres zgodny z harmonogramem; lag = jeden okres za nim (dopuszczalne opóźnienie
 *  źródła, ostrzeżenie); stale = ≥2 okresy za nim albo przekroczony maks. wiek; error = brak odpowiedzi/danych. */
export type FreshnessStatus = 'ok' | 'lag' | 'stale' | 'error';
export type Frequency = 'daily' | 'monthly' | 'quarterly';
export type SourceKind = 'gus-dbw' | 'gus-bdl' | 'eurostat' | 'nbp' | 'yahoo';

export interface DatasetSpec {
    id: string;
    label: string;
    /** Źródło po polsku, jak w UI („GUS DBW", „Eurostat"). */
    source: string;
    kind: SourceKind;
    /** Grupa na stronie /status. */
    group: 'gus' | 'eurostat' | 'markets';
    frequency: Frequency;
    /** Ścieżka API dokładnie taka, jaką woła strona (ten sam klucz cache) — BEZ `refresh=1`. */
    endpoint: (now: Date) => string;
    /** Najnowszy okres z odpowiedzi endpointu: YYYY-MM-DD / YYYY-MM / YYYY-Qn. */
    extract: (json: unknown) => string | null;
    /** Okres, który wg harmonogramu powinien już być dostępny. */
    expected: (now: Date) => string;
    /** Ile okresów za oczekiwanym to jeszcze `ok`, a ile `lag`; dalej `stale`. */
    tolerance: { ok: number; lag: number };
    /** Bezpiecznik: wiek (dni od końca najnowszego okresu) powyżej progu = `stale`, nawet gdy harmonogram milczy. */
    maxAgeDays: number;
    /** Wyjaśnienie statusu `lag` dla użytkownika. */
    lagNote: string;
    /** Czy cron może wymusić `?refresh=1`. NIGDY dla GUS DBW/BDL — wspólny limit ~100 żądań/15 min, mają własne crony. */
    selfHeal: boolean;
}

export interface FreshnessItem {
    id: string;
    label: string;
    source: string;
    latest: string | null;
    expected: string;
    status: FreshnessStatus;
    /** Dni od końca najnowszego okresu do dziś (Warszawa); null przy błędzie. */
    ageDays: number | null;
    note: string;
    endpoint: string;
    durationMs?: number;
}

export interface FreshnessReport {
    checkedAt: string;
    overall: FreshnessStatus;
    items: FreshnessItem[];
}

// ─── Czas warszawski ────────────────────────────────────

/** GUS publikuje komunikaty o 10:00. */
export const GUS_RELEASE_MINUTES = 10 * 60;
/** NBP publikuje tabelę A i cenę złota ok. 12:15 (to samo okno co `isNbpPublishWindow`). */
export const NBP_RELEASE_MINUTES = 12 * 60 + 15;
/** Sesja GPW rusza o 9:00 — od tej chwili spodziewamy się dzisiejszej świecy. */
export const GPW_OPEN_MINUTES = 9 * 60;

interface WarsawClock { date: string; year: number; month: number; day: number; minutes: number }

export function warsawClock(now: Date): WarsawClock {
    const date = warsawDateKey(now);
    const [year, month, day] = date.split('-').map(Number);
    return { date, year, month, day, minutes: warsawMinutes(now) };
}

// ─── Dni robocze (święta PL z calendar-schedules) ───────

function addDays(iso: string, n: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Dzień roboczy = nie weekend i nie święto państwowe PL (`nextBusinessDay` z harmonogramów GUS). */
export function isBusinessDay(iso: string): boolean {
    return nextBusinessDay(iso) === iso;
}

/** Ostatni dzień roboczy PRZED podaną datą. */
export function previousBusinessDay(iso: string): string {
    let d = addDays(iso, -1);
    for (let i = 0; i < 31 && !isBusinessDay(d); i++) d = addDays(d, -1);
    return d;
}

/** Liczba dni roboczych w przedziale (from, to]; ujemna, gdy `to` < `from`. */
export function businessDaysBetween(from: string, to: string): number {
    if (from === to) return 0;
    const sign = from < to ? 1 : -1;
    const [a, b] = sign === 1 ? [from, to] : [to, from];
    let n = 0;
    let d = a;
    for (let i = 0; i < 800 && d < b; i++) {
        d = addDays(d, 1);
        if (isBusinessDay(d)) n++;
    }
    return sign * n;
}

function daysBetween(from: string, to: string): number {
    const [y1, m1, d1] = from.split('-').map(Number);
    const [y2, m2, d2] = to.split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

// ─── Okresy ─────────────────────────────────────────────

const PERIOD_RE: Record<Frequency, RegExp> = {
    daily: /^(\d{4})-(\d{2})-(\d{2})$/,
    monthly: /^(\d{4})-(\d{2})$/,
    quarterly: /^(\d{4})-Q([1-4])$/,
};

function ym(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}

/** Miesiąc przesunięty o `delta` (z obsługą przełomu roku). */
export function shiftMonth(year: number, month: number, delta: number): string {
    const idx = year * 12 + (month - 1) + delta;
    return ym(Math.floor(idx / 12), (idx % 12) + 1);
}

function periodIndex(period: string, frequency: 'monthly' | 'quarterly'): number | null {
    const m = period.match(PERIOD_RE[frequency]);
    if (!m) return null;
    return frequency === 'monthly' ? +m[1] * 12 + (+m[2] - 1) : +m[1] * 4 + (+m[2] - 1);
}

/** Ostatni dzień okresu (YYYY-MM-DD). */
export function periodEnd(period: string): string | null {
    if (PERIOD_RE.daily.test(period)) return period;
    const m = period.match(PERIOD_RE.monthly);
    const q = period.match(PERIOD_RE.quarterly);
    const year = m ? +m[1] : q ? +q[1] : NaN;
    const month = m ? +m[2] : q ? +q[2] * 3 : NaN;
    if (!Number.isFinite(year)) return null;
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${ym(year, month)}-${String(last).padStart(2, '0')}`;
}

/** O ile okresów `latest` jest za `expected` (0, gdy równo lub przed). null = nieprawidłowy format. */
export function periodsBehind(latest: string, expected: string, frequency: Frequency): number | null {
    if (frequency === 'daily') {
        if (!PERIOD_RE.daily.test(latest) || !PERIOD_RE.daily.test(expected)) return null;
        return Math.max(0, businessDaysBetween(latest, expected));
    }
    const a = periodIndex(latest, frequency);
    const b = periodIndex(expected, frequency);
    if (a == null || b == null) return null;
    return Math.max(0, b - a);
}

const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'] as const;

/** „lipiec 2026", „II kwartał 2026", „2 października 2026". */
export function formatPeriodPl(period: string | null): string {
    if (!period) return '—';
    const d = period.match(PERIOD_RE.daily);
    if (d) return `${+d[3]} ${MONTHS_GEN[+d[2] - 1]} ${d[1]}`;
    return formatDataPeriod(period);
}

// ─── Oczekiwany okres wg harmonogramu ───────────────────

/** Miesięczne dane GUS: publikacja w miesiącu M (o 10:00) dotyczy M-1; przed nią najnowszy jest M-2. */
export function expectedMonthlyBySchedule(
    now: Date,
    publishDate: (year: number, publishMonth: number) => string,
    releaseMinutes = GUS_RELEASE_MINUTES,
): string {
    const c = warsawClock(now);
    const pub = publishDate(c.year, c.month);
    const published = c.date > pub || (c.date === pub && c.minutes >= releaseMinutes);
    return shiftMonth(c.year, c.month, published ? -1 : -2);
}

/** Miesięczne dane bez kalendarza dziennego (Eurostat): od `day`. dnia M oczekujemy M-1, wcześniej M-2. */
export function expectedMonthlyByDay(now: Date, day: number): string {
    const c = warsawClock(now);
    return shiftMonth(c.year, c.month, c.day >= day ? -1 : -2);
}

/** PKB kwartalny: ostatni kwartał, którego szybki szacunek GUS już się ukazał (GDP_FLASH_PUBLISH + heurystyka). */
export function expectedGdpQuarter(now: Date): string {
    const c = warsawClock(now);
    const flashes = [...generateMacroCalendar(c.year - 1), ...generateMacroCalendar(c.year)]
        .filter((e) => e.type === 'gdp' && e.dataPeriod)
        .filter((e) => e.date < c.date || (e.date === c.date && c.minutes >= GUS_RELEASE_MINUTES))
        .sort((a, b) => a.date.localeCompare(b.date));
    const last = flashes[flashes.length - 1];
    if (last?.dataPeriod) return last.dataPeriod;
    // Bezpiecznik (nie powinien zadziałać — kalendarz zawsze ma 4 szacunki rocznie): kwartał sprzed dwóch.
    const q = Math.floor((c.month - 1) / 3) + 1;
    const idx = c.year * 4 + (q - 1) - 2;
    return `${Math.floor(idx / 4)}-Q${(idx % 4) + 1}`;
}

/** Notowanie dzienne: dziś, jeśli dzień roboczy i minęła godzina publikacji; inaczej poprzedni dzień roboczy. */
export function expectedBusinessDay(now: Date, fromMinutes: number): string {
    const c = warsawClock(now);
    if (isBusinessDay(c.date) && c.minutes >= fromMinutes) return c.date;
    return previousBusinessDay(c.date);
}

// ─── Ekstrakcja najnowszego okresu z odpowiedzi API ─────

type Json = Record<string, unknown>;

function asObj(v: unknown): Json | null {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null;
}

/** Największy okres pasujący do formatu (porządek leksykograficzny = chronologiczny w obrębie formatu). */
export function maxPeriod(values: unknown[], frequency: Frequency): string | null {
    let best: string | null = null;
    for (const v of values) {
        if (typeof v !== 'string' || !PERIOD_RE[frequency].test(v)) continue;
        if (best == null || v > best) best = v;
    }
    return best;
}

/** `/api/dbw-series` → { series: [{ date, '<poz>': number }] } — tylko wiersze z wartością dla poz. */
export function extractDbwSeries(json: unknown, poz: number): string | null {
    const rows = asObj(json)?.series;
    if (!Array.isArray(rows)) return null;
    const key = String(poz);
    return maxPeriod(rows.filter((r) => typeof asObj(r)?.[key] === 'number').map((r) => asObj(r)?.date), 'monthly');
}

/** `/api/gus-monthly` → { retail: [...], wages: [{ date }] }. */
export function extractGusMonthly(json: unknown, field: 'retail' | 'wages'): string | null {
    const rows = asObj(json)?.[field];
    if (!Array.isArray(rows)) return null;
    return maxPeriod(rows.map((r) => asObj(r)?.date), 'monthly');
}

/** `/api/gus-cpi-full` → headline: kwartały COICOP 1999 (≤2025) + miesiące 2026 → najnowszy MIESIĄC z r/r. */
export function extractCpiFull(json: unknown): string | null {
    const rows = asObj(json)?.headline;
    if (!Array.isArray(rows)) return null;
    return maxPeriod(rows.filter((r) => typeof asObj(r)?.yoy === 'number').map((r) => asObj(r)?.date), 'monthly');
}

/** `/api/bdl-series` → { series: [{ date: 'YYYY-MM', value }] }. */
export function extractBdlSeries(json: unknown): string | null {
    const rows = asObj(json)?.series;
    if (!Array.isArray(rows)) return null;
    return maxPeriod(rows.filter((r) => typeof asObj(r)?.value === 'number').map((r) => asObj(r)?.date), 'monthly');
}

/** `/api/eurostat?indicator=…&geo=PL` → { data: { PL: [{ date, value }] } }. */
export function extractEurostat(json: unknown, frequency: Frequency, geo = 'PL'): string | null {
    const rows = asObj(asObj(json)?.data)?.[geo];
    if (!Array.isArray(rows)) return null;
    return maxPeriod(rows.filter((r) => typeof asObj(r)?.value === 'number').map((r) => asObj(r)?.date), frequency);
}

/** `/api/nbp?table=a` → [{ effectiveDate, rates }]. */
export function extractNbpTable(json: unknown): string | null {
    if (!Array.isArray(json)) return null;
    return maxPeriod(json.map((t) => asObj(t)?.effectiveDate), 'daily');
}

/** `/api/nbp?gold=true` → [{ data, cena }]. */
export function extractNbpGold(json: unknown): string | null {
    if (!Array.isArray(json)) return null;
    return maxPeriod(json.map((g) => asObj(g)?.data), 'daily');
}

/** `/api/stooq` → { latest: { date }, data: [{ date }] }. */
export function extractStooq(json: unknown): string | null {
    const o = asObj(json);
    if (!o) return null;
    const dates: unknown[] = Array.isArray(o.data) ? o.data.map((b) => asObj(b)?.date) : [];
    dates.push(asObj(o.latest)?.date);
    return maxPeriod(dates, 'daily');
}

// ─── Katalog zbiorów ────────────────────────────────────

const LAG_NOTES: Record<SourceKind, string> = {
    'gus-dbw': 'Komunikat GUS już jest, ale baza DBW albo nocne odświeżenie cache jeszcze go nie objęły.',
    'gus-bdl': 'BDL publikuje z opóźnieniem względem komunikatu GUS — ostatni miesiąc trafi do bazy później.',
    eurostat: 'Eurostat publikuje dane krajowe z opóźnieniem względem GUS i własnego kalendarza.',
    nbp: 'Tabela z poprzedniego dnia roboczego — cache odświeża się po publikacji NBP (ok. 12:15).',
    yahoo: 'Brak notowania z ostatnich sesji — możliwe święto giełdowe albo opóźnienie Yahoo.',
};

const MONTHLY = { ok: 0, lag: 1 } as const;

function dbwSpec(
    id: string, label: string, config: DbwSeriesConfig,
    publishDate: (year: number, publishMonth: number) => string,
): DatasetSpec {
    return {
        id, label, source: 'GUS DBW', kind: 'gus-dbw', group: 'gus', frequency: 'monthly',
        // Jedno miejsce budowy URL-a (`dbwSeriesPath`) = ten sam klucz cache co hook strony.
        endpoint: () => dbwSeriesPath(config),
        extract: (json) => extractDbwSeries(json, config.poz[0]),
        expected: (now) => expectedMonthlyBySchedule(now, publishDate),
        tolerance: MONTHLY, maxAgeDays: 100, lagNote: LAG_NOTES['gus-dbw'], selfHeal: false,
    };
}

function eurostatSpec(
    id: string, label: string, indicator: string, frequency: 'monthly' | 'quarterly',
    expected: (now: Date) => string, source = 'Eurostat',
): DatasetSpec {
    return {
        id, label, source, kind: 'eurostat', group: 'eurostat', frequency,
        endpoint: () => `/api/eurostat?indicator=${indicator}&geo=PL`,
        extract: (json) => extractEurostat(json, frequency),
        expected,
        tolerance: { ok: 0, lag: 1 },
        maxAgeDays: frequency === 'monthly' ? 100 : 240,
        lagNote: LAG_NOTES.eurostat, selfHeal: true,
    };
}

function yahooSpec(id: string, label: string, symbol: string, limit: number): DatasetSpec {
    return {
        id, label, source: 'Yahoo Finance', kind: 'yahoo', group: 'markets', frequency: 'daily',
        endpoint: () => `/api/stooq?symbol=${symbol}&limit=${limit}`,
        extract: extractStooq,
        expected: (now) => expectedBusinessDay(now, GPW_OPEN_MINUTES),
        // Ostatnia sesja ≤3 dni robocze: 0–1 = ok (przed otwarciem / brak jeszcze świecy), 2–3 = lag.
        tolerance: { ok: 1, lag: 3 }, maxAgeDays: 8, lagNote: LAG_NOTES.yahoo, selfHeal: true,
    };
}

function nbpSpec(id: string, label: string, endpoint: string, extract: (json: unknown) => string | null): DatasetSpec {
    return {
        id, label, source: 'NBP', kind: 'nbp', group: 'markets', frequency: 'daily',
        endpoint: () => endpoint, extract,
        expected: (now) => expectedBusinessDay(now, NBP_RELEASE_MINUTES),
        tolerance: { ok: 0, lag: 1 }, maxAgeDays: 7, lagNote: LAG_NOTES.nbp, selfHeal: true,
    };
}

/**
 * Zbiory sprawdzane przez /api/health/freshness — endpointy i parametry DOKŁADNIE jak w hookach stron
 * (Przegląd, Rynki, Gospodarka), żeby trafić w ten sam wpis cache, który czyta użytkownik.
 */
export const FRESHNESS_DATASETS: DatasetSpec[] = [
    {
        id: 'cpi', label: 'Inflacja CPI', source: 'GUS DBW', kind: 'gus-dbw', group: 'gus', frequency: 'monthly',
        // useCpiFull() na Przeglądzie: /api/gus-cpi-full?year=<bieżący rok>
        endpoint: (now) => `/api/gus-cpi-full?year=${warsawClock(now).year}`,
        extract: extractCpiFull,
        // Pełne dane CPI (nie szybki szacunek) — dopiero one trafiają do DBW.
        expected: (now) => expectedMonthlyBySchedule(now, cpiPreliminaryDate),
        tolerance: MONTHLY, maxAgeDays: 100, lagNote: LAG_NOTES['gus-dbw'], selfHeal: false,
    },
    dbwSpec('retail', 'Sprzedaż detaliczna', GUS_RETAIL_SERIES, retailDate),
    dbwSpec('industry', 'Produkcja przemysłowa', GUS_INDUSTRY_SERIES, industrialDate),
    {
        id: 'wages', label: 'Wynagrodzenia (sektor przedsiębiorstw)', source: 'GUS BDL', kind: 'gus-bdl', group: 'gus',
        frequency: 'monthly',
        endpoint: () => '/api/gus-monthly',
        extract: (json) => extractGusMonthly(json, 'wages'),
        // GUS podaje płace w sektorze przedsiębiorstw razem z danymi o produkcji (~20. dnia M+1).
        expected: (now) => expectedMonthlyBySchedule(now, industrialDate),
        tolerance: MONTHLY, maxAgeDays: 100, lagNote: LAG_NOTES['gus-bdl'], selfHeal: false,
    },
    {
        id: 'unemployment', label: 'Stopa bezrobocia rejestrowanego', source: 'GUS BDL', kind: 'gus-bdl', group: 'gus',
        frequency: 'monthly',
        // useGusRegisteredUnemployment() → useBdlSeries(461680, 12) z domyślnymi year/freq/step.
        endpoint: (now) => `/api/bdl-series?start=461680&count=12&year=${warsawClock(now).year}&freq=m&step=1`,
        extract: extractBdlSeries,
        expected: (now) => expectedMonthlyBySchedule(now, unemploymentDate),
        tolerance: MONTHLY, maxAgeDays: 100, lagNote: LAG_NOTES['gus-bdl'], selfHeal: false,
    },
    // HICP: Eurostat podaje M-1 ok. 17–18. dnia M → od 19. oczekujemy M-1.
    eurostatSpec('hicp', 'Inflacja HICP', 'cpi', 'monthly', (now) => expectedMonthlyByDay(now, 19)),
    eurostatSpec('gdp', 'PKB r/r (kwartalnie)', 'gdp_yoy', 'quarterly', expectedGdpQuarter),
    // Rentowność 10Y (średnia miesięczna MCBY): M-1 pojawia się ok. 10.–11. dnia M → od 15. oczekujemy M-1.
    eurostatSpec('bond10y', 'Rentowność obligacji 10-letnich', 'bond_yield_10y', 'monthly', (now) => expectedMonthlyByDay(now, 15), 'Eurostat (śr. miesięczna)'),
    nbpSpec('nbp-a', 'Kursy walut NBP (tabela A)', '/api/nbp?table=a', extractNbpTable),
    nbpSpec('nbp-gold', 'Cena złota NBP', '/api/nbp?gold=true&last=30', extractNbpGold),
    yahooSpec('wig20', 'WIG20', 'wig20', 30),
    yahooSpec('mwig40', 'mWIG40', 'mwig40', 30),
    yahooSpec('brent', 'Ropa Brent', 'cb.c', 30),
];

export function datasetById(id: string): DatasetSpec | undefined {
    return FRESHNESS_DATASETS.find((d) => d.id === id);
}

// ─── Ocena ──────────────────────────────────────────────

function plPeriods(n: number, frequency: Frequency): string {
    if (frequency === 'daily') return `${n} ${pluralPl(n, 'dzień roboczy', 'dni robocze', 'dni roboczych')}`;
    if (frequency === 'quarterly') return `${n} ${pluralPl(n, 'kwartał', 'kwartały', 'kwartałów')}`;
    return `${n} ${pluralPl(n, 'miesiąc', 'miesiące', 'miesięcy')}`;
}

/** Polska liczba mnoga: 1 zbiór, 2–4 zbiory, 5+ zbiorów (12–14 → zbiorów). */
export function pluralPl(n: number, one: string, few: string, many: string): string {
    if (n === 1) return one;
    const d = n % 10;
    const t = n % 100;
    return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many;
}

/** Status zbioru dla podanego najnowszego okresu. Bez I/O — `durationMs` dopisuje wywołujący. */
export function evaluateDataset(spec: DatasetSpec, latest: string | null, now: Date): Omit<FreshnessItem, 'endpoint'> {
    const expected = spec.expected(now);
    const base = { id: spec.id, label: spec.label, source: spec.source, expected };
    if (!latest) {
        return { ...base, latest: null, status: 'error', ageDays: null, note: 'Odpowiedź bez danych — brak najnowszego okresu.' };
    }
    const behind = periodsBehind(latest, expected, spec.frequency);
    const end = periodEnd(latest);
    if (behind == null || end == null) {
        return { ...base, latest, status: 'error', ageDays: null, note: `Nieoczekiwany format okresu: „${latest}".` };
    }
    const ageDays = Math.max(0, daysBetween(end, warsawClock(now).date));

    let status: FreshnessStatus = behind <= spec.tolerance.ok ? 'ok' : behind <= spec.tolerance.lag ? 'lag' : 'stale';
    let note = '';
    if (status === 'lag') note = spec.lagNote;
    if (status === 'stale') {
        note = `Dane starsze o ${plPeriods(behind, spec.frequency)} niż wynika z harmonogramu publikacji.`;
    }
    if (ageDays > spec.maxAgeDays && status !== 'stale') {
        status = 'stale';
        note = `Przekroczony maksymalny wiek danych (${ageDays} dni, limit ${spec.maxAgeDays}).`;
    }
    return { ...base, latest, status, ageDays, note };
}

export function errorItem(spec: DatasetSpec, now: Date, endpoint: string, message: string, durationMs?: number): FreshnessItem {
    return {
        id: spec.id, label: spec.label, source: spec.source, latest: null, expected: spec.expected(now),
        status: 'error', ageDays: null, note: message, endpoint, durationMs,
    };
}

const SEVERITY: Record<FreshnessStatus, number> = { ok: 0, lag: 1, stale: 2, error: 3 };

/** Najgorszy status w raporcie (ok < lag < stale < error). */
export function overallStatus(items: Pick<FreshnessItem, 'status'>[]): FreshnessStatus {
    return items.reduce<FreshnessStatus>((worst, i) => (SEVERITY[i.status] > SEVERITY[worst] ? i.status : worst), 'ok');
}

/** HTTP dla /api/health/freshness: 200 gdy brak `stale`/`error` (`lag` to tylko ostrzeżenie), inaczej 503. */
export function httpStatusFor(items: Pick<FreshnessItem, 'status'>[]): 200 | 503 {
    return items.some((i) => i.status === 'stale' || i.status === 'error') ? 503 : 200;
}

export function isProblem(status: FreshnessStatus): boolean {
    return status === 'stale' || status === 'error';
}

/** Dokleja `refresh=1` (wymuszenie pobrania u źródła) — tylko dla zbiorów z `selfHeal`. */
export function withRefreshParam(endpoint: string): string {
    return `${endpoint}${endpoint.includes('?') ? '&' : '?'}refresh=1`;
}

export const STATUS_LABELS: Record<FreshnessStatus, string> = {
    ok: 'Aktualne',
    lag: 'Opóźnione',
    stale: 'Nieaktualne',
    error: 'Błąd źródła',
};
