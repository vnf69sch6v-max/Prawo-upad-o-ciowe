// Dobór sygnałów do hero na Przeglądzie. Zamiast stałej pary „CPI + sprzedaż" hero pokazuje to,
// co w danej chwili jest NAJWIĘKSZĄ WIADOMOŚCIĄ: świeżo opublikowany odczyt (wg kalendarza GUS)
// z nietypowo dużą zmianą wygrywa z odczytem sprzed miesiąca, a wyjątkowy ruch rynku (WIG20,
// EUR/PLN) wchodzi tylko wtedy, gdy jest statystycznie duży. Czysta logika — `today` z zewnątrz,
// więc testowalna i bezpieczna dla prerenderu (patrz `useIsClient`).

import { generateMacroCalendar, type MacroEvent } from '@/lib/calendar';

export type Point = { date: string; value: number };
export type SignalKind = 'cpi' | 'retail' | 'industrial' | 'employment' | 'market';

export interface HeroCandidate {
    id: string;
    kind: SignalKind;
    label: string;
    series: Point[];
    /** Jednostka wartości na kaflu. */
    unit: '%' | 'pkt' | 'zł' | 'jena' | 'mld';
    decimals: number;
    /** `pp` — zmiana wskaźnika r/r w punktach proc.; `pct` — zmiana poziomu (rynki) w %. */
    deltaMode: 'pp' | 'pct';
    /** Wzrost wartości to zła wiadomość (inflacja, bezrobocie, słabszy złoty). */
    invert?: boolean;
    /** Waga redakcyjna (domyślnie 1) — CPI jest ważniejsze od bezrobocia rejestrowanego. */
    weight?: number;
    href: string;
    /**
     * Cel inflacyjny do „przebicia”. Bez pola i przy `kind: 'cpi'` liczymy cel NBP 2,5%.
     * Japonia podaje 2 (cel BOJ).
     */
    target?: number;
    /**
     * Dzień, w którym okres trafia na stronę. Bez pola: kalendarz GUS, a dla rynku data sesji.
     * Japonia podaje własne kalendarze (CPI, Labour Force Survey).
     */
    releaseOf?: (period: string) => string | null;
    /** Najbliższa publikacja po dniu `today` (YYYY-MM-DD). Bez pola: kalendarz GUS. */
    nextReleaseOf?: (today: string) => string | null;
}

export interface RankedSignal {
    candidate: HeroCandidate;
    score: number;
    last: number;
    prev: number | null;
    /** Zmiana względem poprzedniego okresu (pp albo %). */
    delta: number | null;
    /** |zmiana| w odchyleniach standardowych historii zmian (0–4). */
    z: number;
    /** Ile poprzednich zmian z rzędu było mniejszych co do modułu (≥6 = „największa od…"). */
    biggestSince: number;
    period: string;
    /** Dzień, w którym ten okres trafił na stronę (kalendarz GUS / data sesji). */
    publishedOn: string | null;
    ageDays: number | null;
    /** Opublikowane w ostatnich 7 dniach. */
    fresh: boolean;
    /** Najbliższa zapowiedziana publikacja tego wskaźnika (dzień). */
    next: { date: string } | null;
    /** Inflacja przekroczyła cel NBP (w górę lub w dół) w ostatnim odczycie. */
    crossedTarget: boolean;
}

export const NBP_TARGET = 2.5;
const FRESH_DAYS = 7;
/** Rynek trafia do hero tylko przy ruchu ≥2σ i świeżej sesji. */
const MARKET_MIN_Z = 2;
const MARKET_MAX_AGE = 3;

const CALENDAR_TYPE: Partial<Record<SignalKind, MacroEvent['type']>> = {
    cpi: 'cpi', retail: 'retail', industrial: 'industrial', employment: 'employment',
};

const calendarCache = new Map<number, MacroEvent[]>();
function eventsAround(year: number): MacroEvent[] {
    let ev = calendarCache.get(year);
    if (!ev) {
        ev = [...generateMacroCalendar(year - 1), ...generateMacroCalendar(year), ...generateMacroCalendar(year + 1)]
            .sort((a, b) => a.date.localeCompare(b.date));
        calendarCache.set(year, ev);
    }
    return ev;
}

export function daysBetween(fromIso: string, toIso: string): number {
    const [y1, m1, d1] = fromIso.slice(0, 10).split('-').map(Number);
    const [y2, m2, d2] = toIso.slice(0, 10).split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/**
 * Publikacje, z którymi liczba trafia NA STRONĘ. CPI na Przeglądzie pochodzi z DBW, a tam trafiają
 * dopiero pełne dane z połowy M+1 — szybki szacunek z końca M nie zmienia wyświetlanej liczby.
 * Liczenie wieku od flasha robiło z odczytu opublikowanego dziś odczyt „sprzed 15 dni": CPI nigdy
 * nie dostawał plakietki „Nowy odczyt", a stopka zapowiadała flash, po którym na stronie nic się nie zmienia.
 */
function releases(type: MacroEvent['type'], year: number): MacroEvent[] {
    return eventsAround(year).filter((e) => e.type === type && !e.flash);
}

/** Dzień, w którym dane za `period` pojawiają się na stronie (kalendarz GUS). */
export function publicationDate(kind: SignalKind, period: string): string | null {
    const type = CALENDAR_TYPE[kind];
    if (!type || !/^\d{4}-\d{2}$/.test(period)) return null;
    const hit = releases(type, Number(period.slice(0, 4))).find((e) => e.dataPeriod === period);
    return hit?.date ?? null;
}

/** Najbliższa publikacja, która zmieni liczbę na stronie, ściśle po `today`. */
export function nextPublication(kind: SignalKind, today: string): MacroEvent | null {
    const type = CALENDAR_TYPE[kind];
    if (!type) return null;
    return releases(type, Number(today.slice(0, 4))).find((e) => e.date > today) ?? null;
}

function nextOn(c: HeroCandidate, today: string): { date: string } | null {
    if (c.nextReleaseOf) {
        const date = c.nextReleaseOf(today);
        return date ? { date } : null;
    }
    const hit = nextPublication(c.kind, today);
    return hit ? { date: hit.date } : null;
}

function changes(series: Point[], mode: 'pp' | 'pct'): number[] {
    const out: number[] = [];
    for (let i = 1; i < series.length; i++) {
        const a = series[i - 1].value, b = series[i].value;
        out.push(mode === 'pp' ? b - a : a === 0 ? 0 : ((b - a) / Math.abs(a)) * 100);
    }
    return out;
}

function zScore(all: number[], mode: 'pp' | 'pct'): { z: number; biggestSince: number } {
    if (!all.length) return { z: 0, biggestSince: 0 };
    const lastAbs = Math.abs(all[all.length - 1]);
    const hist = all.slice(0, -1).slice(-24);
    let biggestSince = 0;
    for (let i = hist.length - 1; i >= 0 && Math.abs(hist[i]) < lastAbs; i--) biggestSince++;
    // Za krótka historia → umiarkowane z, żeby pojedynczy odczyt nie udawał sensacji.
    if (hist.length < 4) return { z: Math.min(lastAbs > 0 ? 1 : 0, 4), biggestSince };
    const mean = hist.reduce((s, v) => s + v, 0) / hist.length;
    const sd = Math.sqrt(hist.reduce((s, v) => s + (v - mean) ** 2, 0) / hist.length);
    const floor = mode === 'pp' ? 0.1 : 0.2;
    return { z: Math.min(lastAbs / Math.max(sd, floor), 4), biggestSince };
}

export function evaluateSignal(c: HeroCandidate, today: string | null): RankedSignal | null {
    const s = c.series.filter((p) => Number.isFinite(p.value));
    if (!s.length) return null;
    const lastP = s[s.length - 1];
    const prev = s.length > 1 ? s[s.length - 2].value : null;
    const ch = changes(s, c.deltaMode);
    const delta = ch.length ? +ch[ch.length - 1].toFixed(c.deltaMode === 'pp' ? 1 : 2) : null;
    const { z, biggestSince } = zScore(ch, c.deltaMode);

    const periodKey = c.kind === 'market' ? lastP.date.slice(0, 10) : lastP.date;
    const publishedOn = c.releaseOf
        ? c.releaseOf(periodKey)
        : c.kind === 'market' ? periodKey : publicationDate(c.kind, lastP.date);
    const ageDays = today && publishedOn ? Math.max(0, daysBetween(publishedOn, today)) : null;
    const fresh = ageDays != null && ageDays <= FRESH_DAYS;
    const target = c.target ?? (c.kind === 'cpi' ? NBP_TARGET : null);
    const crossedTarget = target != null && prev != null
        && (prev <= target) !== (lastP.value <= target);

    // Świeżość: dziś = 1, 3 dni ≈ 0,55, tydzień ≈ 0,25, 2 tygodnie ≈ 0,06. Odczyt sprzed >2 tygodni
    // bez niespodzianki nie wygrywa z ważniejszym wskaźnikiem (waga) — wtedy hero wraca do CPI.
    // Bez daty (prerender) — wszystkim po równo.
    const recency = ageDays == null ? 0.1 : Math.exp(-ageDays / 5);
    let surprise = 0.5 + z;
    if (crossedTarget) surprise += 1.5;
    let score = (c.weight ?? 1) * surprise * (0.4 + recency);

    if (c.kind === 'market') {
        const eligible = z >= MARKET_MIN_Z && ageDays != null && ageDays <= MARKET_MAX_AGE;
        if (!eligible) score = -Infinity;
    }

    return {
        candidate: c, score, last: lastP.value, prev, delta, z, biggestSince,
        period: lastP.date, publishedOn, ageDays, fresh,
        next: today ? nextOn(c, today) : null,
        crossedTarget,
    };
}

/** Kandydaci posortowani od największej „wiadomości"; rynki odpadają, jeśli ruch był zwyczajny. */
export function rankHeroSignals(candidates: HeroCandidate[], today: string | null): RankedSignal[] {
    return candidates
        .map((c, i) => ({ r: evaluateSignal(c, today), i }))
        .filter((x): x is { r: RankedSignal; i: number } => x.r != null && x.r.score > -Infinity)
        // Remis → kolejność wejściowa (CPI pierwsze), żeby układ był stabilny.
        .sort((a, b) => b.r.score - a.r.score || a.i - b.i)
        .map((x) => x.r);
}
