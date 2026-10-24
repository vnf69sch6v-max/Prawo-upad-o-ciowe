// Japonia — rozbicie inflacji na RÓŻNICE oficjalnych miar CPI (specyfikacja PM:
// docs/specs/2026-10-24-jp-inflacja-rozbicie.md). Bez I/O, liczone w dziesiątych — bez błędów
// zmiennoprzecinkowych.
//
//   bez żywności i energii (R) ─+ żywność poza świeżą → bez świeżej żywności i energii (CC)
//                              ─+ energia            → bez świeżej żywności, „bazowa” (C)
//                              ─+ świeża żywność     → CPI ogółem (T)
//
// To NIE są wkłady (寄与度) z komunikatu: różnica mówi, o ile zmienia się stopa po dołączeniu grupy,
// czyli czy grupa drożeje szybciej, czy wolniej niż reszta koszyka. Słowa „wkład” na tych liczbach
// nie używamy. Stopy publikowane z dokładnością 0,1 → różnica ma błąd do ±0,1 p.p.
import { formatDataPeriod } from '@/lib/formatters';
import type { JpCpiPayload } from './cpi';

export type StepId = 'food' | 'energy' | 'fresh';

export interface BreakdownRow {
    /** YYYY-MM */
    date: string;
    /** Bez żywności i energii (%). */
    R: number;
    /** Bez świeżej żywności i energii (%). */
    CC: number;
    /** Bez świeżej żywności — „bazowa” (%). */
    C: number;
    /** CPI ogółem (%). */
    T: number;
    /** Różnice miar (p.p.): żywność poza świeżą = CC − R, energia = C − CC, świeża żywność = T − C. */
    food: number;
    energy: number;
    fresh: number;
}

export const STEP_LABEL: Record<StepId, string> = {
    food: 'Żywność poza świeżą',
    energy: 'Energia',
    fresh: 'Świeża żywność',
};

/** Kolejność schodów (narzucona przez miary Statistics Bureau) i przy remisie w zdaniu-wniosku. */
export const STEP_ORDER: StepId[] = ['food', 'energy', 'fresh'];

/** Od ilu p.p. grupa „napędza” inflację (różnica zaokrąglonych stóp ma błąd do ±0,1 p.p.). */
export const DRIVER_MIN_TENTHS = 3;
/** Do ilu p.p. tempo grupy jest „zbliżone do reszty koszyka”. */
export const NEUTRAL_MAX_TENTHS = 1;

const tenths = (v: number) => Math.round(v * 10);

/** Wiersze tylko dla miesięcy, w których są wszystkie cztery miary (nigdy liczb z różnych miesięcy). */
export function breakdownRows(series: Partial<JpCpiPayload['series']> | undefined): BreakdownRow[] {
    const by = (points: { date: string; value: number }[] | undefined) => new Map((points ?? []).map((p) => [p.date, tenths(p.value)]));
    const T = by(series?.headline), C = by(series?.core), CC = by(series?.coreCore), R = by(series?.exFoodEnergy);
    const rows: BreakdownRow[] = [];
    for (const [date, r] of R) {
        const t = T.get(date), c = C.get(date), cc = CC.get(date);
        if (t == null || c == null || cc == null) continue;
        rows.push({ date, R: r / 10, CC: cc / 10, C: c / 10, T: t / 10, food: (cc - r) / 10, energy: (c - cc) / 10, fresh: (t - c) / 10 });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/** Najnowszy miesiąc wspólny czterem miarom (do kontroli świeżości) — null, gdy brak. */
export function latestCommonPeriod(series: Partial<JpCpiPayload['series']> | undefined): string | null {
    const rows = breakdownRows(series);
    return rows.length ? rows[rows.length - 1].date : null;
}

function prevMonth(period: string): string {
    const [y, m] = period.split('-').map(Number);
    return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

/** Najnowszy wiersz + R z miesiąca M−1 (jeśli jest), dla zdania-wniosku i schodów. */
export function latestBreakdown(series: Partial<JpCpiPayload['series']> | undefined): { row: BreakdownRow; prevR: number | null } | null {
    const rows = breakdownRows(series);
    if (!rows.length) return null;
    const row = rows[rows.length - 1];
    const prev = series?.exFoodEnergy?.find((p) => p.date === prevMonth(row.date));
    return { row, prevR: prev ? tenths(prev.value) / 10 : null };
}

const num = (v: number) => (Math.abs(v)).toFixed(1).replace('.', ',');

/** „+0,2 p.p.”, „−0,3 p.p.”, „±0,0 p.p.” */
export function formatStep(d: number): string {
    const t = tenths(d);
    return `${t > 0 ? '+' : t < 0 ? '−' : '±'}${num(t / 10)} p.p.`;
}

/** „2,2%”, „−0,4%” */
export function formatLevel(v: number): string {
    return `${tenths(v) < 0 ? '−' : ''}${num(v)}%`;
}

/** Opis znaku różnicy — tylko tyle, na ile pozwala matematyka różnic stóp. */
export function stepQualifier(d: number): string {
    const t = tenths(d);
    if (Math.abs(t) <= NEUTRAL_MAX_TENTHS) return 'tempo zbliżone do reszty koszyka';
    return t > 0 ? 'drożeje szybciej niż reszta koszyka' : 'drożeje wolniej niż reszta koszyka albo tanieje';
}

/** Zdanie-wniosek wg reguł ze specyfikacji (pkt 3, „Zdanie-wniosek: reguły”). */
export function breakdownSentence(row: BreakdownRow, prevR: number | null): string {
    const drivers = STEP_ORDER
        .map((id) => ({ id, t: tenths(row[id]) }))
        .filter((s) => Math.abs(s.t) >= DRIVER_MIN_TENTHS)
        .sort((a, b) => Math.abs(b.t) - Math.abs(a.t) || STEP_ORDER.indexOf(a.id) - STEP_ORDER.indexOf(b.id))
        .slice(0, 2);

    const r = tenths(row.R);
    const rPhrase = r > 0 ? `ceny bez żywności i energii rosną ${num(row.R)}% r/r`
        : r < 0 ? `ceny bez żywności i energii spadają o ${num(row.R)}% r/r`
            : 'ceny bez żywności i energii stoją w miejscu (0,0% r/r)';
    const rFull = prevR != null ? `${rPhrase} (miesiąc wcześniej ${formatLevel(prevR)})` : rPhrase;

    if (!drivers.length) return `Inflację niesie koszyk bez żywności i energii: ${rFull}.`;
    const [a, b] = drivers;
    const first = `${STEP_LABEL[a.id]} ${a.t > 0 ? 'podnosi' : 'obniża'} inflację o ${num(a.t / 10)} p.p.`;
    if (!b) return `${first}; ${rFull}.`;
    const second = `${STEP_LABEL[b.id].toLowerCase()} ${b.t > 0 ? 'podnosi' : 'obniża'} ją o ${num(b.t / 10)} p.p.`;
    return `${first}, ${second}; ${rFull}.`;
}

/** „dane za wrzesień 2026” dla miesiąca rozbicia. */
export function breakdownPeriodLabel(row: BreakdownRow): string {
    return `dane za ${formatDataPeriod(row.date)}`;
}
