// „Twoja inflacja” — czysta logika kalkulatora (bez Reacta, bez `window`; testy: tests/twoja-inflacja.test.ts).
// Spec: docs/specs/2026-11-02-twoja-inflacja.md.
//
// Wzór: Twoja inflacja r/r = Σ sᵢ·rᵢ / Σ sᵢ — średnia dynamik r/r działów COICOP 2018 (GUS DBW, przekrój 1698)
// ważona udziałami wydatków użytkownika sᵢ (liczone tylko po działach z odczytem). Wkład działu w p.p. = sᵢ/Σs · rᵢ.
// To przybliżenie indeksu GUS (łańcuchowy Laspeyres z wagami roku bieżącego wobec grudnia roku poprzedniego) —
// ten sam wzór z wagami GUS nie daje dokładnie oficjalnego CPI; różnicę pokazujemy na stronie (`methodGap`).

import { CPI_WEIGHTS_2026 } from '@/lib/cpi-weights';

export const BASKET_PARAM = 'w';
/** Udziały w URL: dziesiąte części procenta (25,9% → 259), 13 liczb całkowitych po przecinku. */
const SCALE = 10;
const MAX_SHARE_TENTHS = 1000; // 100%

export interface DivisionReading { code: string; yoy: number | null }
export interface Contribution { code: string; share: number; yoy: number | null; pp: number | null }
export interface PersonalInflation {
    /** Twoja inflacja r/r (%), null bez żadnego odczytu albo przy zerowym koszyku. */
    rate: number | null;
    /** Wkłady działów (p.p.), w kolejności kodów. `share` = udział znormalizowany do 100 (%). */
    contributions: Contribution[];
    /** Suma udziałów działów bez odczytu (%, po normalizacji) — 0 gdy wszystkie działy mają dane. */
    missingShare: number;
}

export const DIVISION_CODES = CPI_WEIGHTS_2026.map((d) => d.code);

/** Wagi GUS jako tablica w kolejności `DIVISION_CODES` (%). */
export const gusShares = (): number[] => CPI_WEIGHTS_2026.map((d) => d.weight);

export function computePersonalInflation(shares: readonly number[], readings: readonly DivisionReading[]): PersonalInflation {
    const yoyOf = new Map(readings.map((r) => [r.code, r.yoy]));
    const total = shares.reduce((a, b) => a + Math.max(0, b), 0);
    let covered = 0;
    let weighted = 0;
    DIVISION_CODES.forEach((code, i) => {
        const s = Math.max(0, shares[i] ?? 0);
        const y = yoyOf.get(code);
        if (y == null || !Number.isFinite(y)) return;
        covered += s;
        weighted += s * y;
    });
    const contributions: Contribution[] = DIVISION_CODES.map((code, i) => {
        const s = Math.max(0, shares[i] ?? 0);
        const y = yoyOf.get(code);
        const yoy = y == null || !Number.isFinite(y) ? null : y;
        return {
            code,
            share: total > 0 ? (s / total) * 100 : 0,
            yoy,
            pp: yoy != null && covered > 0 ? (s / covered) * yoy : null,
        };
    });
    return {
        rate: covered > 0 ? weighted / covered : null,
        contributions,
        missingShare: total > 0 ? ((total - covered) / total) * 100 : 0,
    };
}

/** Różnica metody: ten sam wzór na wagach GUS minus oficjalne CPI (p.p.). */
export function methodGap(readings: readonly DivisionReading[], officialYoY: number | null): number | null {
    const gus = computePersonalInflation(gusShares(), readings).rate;
    return gus == null || officialYoY == null ? null : gus - officialYoY;
}

/** Udziały → wartość parametru `w` (dziesiąte części procenta). */
export function encodeBasket(shares: readonly number[]): string {
    return DIVISION_CODES.map((_, i) => Math.round(Math.max(0, shares[i] ?? 0) * SCALE)).join(',');
}

/**
 * Parametr `w` → udziały (%). Null (= wagi GUS) dla braku parametru i każdego śmiecia: zła liczba pozycji,
 * coś innego niż liczba całkowita 0–1000, suma 0. Nie zgadujemy „co autor miał na myśli”.
 */
export function parseBasket(raw: string | null | undefined): number[] | null {
    if (raw == null || raw.length > 200) return null;
    const parts = raw.split(',');
    if (parts.length !== DIVISION_CODES.length) return null;
    const out: number[] = [];
    for (const p of parts) {
        if (!/^\d{1,4}$/.test(p)) return null;
        const n = Number(p);
        if (n > MAX_SHARE_TENTHS) return null;
        out.push(n / SCALE);
    }
    if (out.every((v) => v === 0)) return null;
    return out;
}

/** Czy udziały to (z dokładnością do zapisu w URL) koszyk GUS. */
export function isGusBasket(shares: readonly number[]): boolean {
    const g = gusShares();
    return shares.length === g.length && shares.every((v, i) => Math.round(v * SCALE) === Math.round(g[i] * SCALE));
}

/** Udziały przeskalowane tak, by sumowały się do 100 (zaokrąglone do 0,1, reszta trafia do największego). */
export function normalizeTo100(shares: readonly number[]): number[] {
    const clean = shares.map((v) => Math.max(0, v));
    const total = clean.reduce((a, b) => a + b, 0);
    if (total <= 0) return gusShares();
    const tenths = clean.map((v) => Math.round((v / total) * 100 * SCALE));
    const diff = 100 * SCALE - tenths.reduce((a, b) => a + b, 0);
    const iMax = tenths.indexOf(Math.max(...tenths));
    tenths[iMax] += diff;
    return tenths.map((t) => t / SCALE);
}
