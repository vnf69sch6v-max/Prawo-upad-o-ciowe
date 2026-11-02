// „Twoja inflacja” — czysta logika kalkulatora (bez Reacta, bez `window`; testy: tests/twoja-inflacja.test.ts).
// Spec: docs/specs/2026-11-02-twoja-inflacja.md.
//
// wᵢ = waga GUS 2026 (%), uᵢ = udział użytkownika po normalizacji (Σu = 100), yᵢ = r/r działu (%),
// CPI = oficjalne r/r ogółem za TEN SAM miesiąc.
//   reszta metody   r = CPI − Σ wᵢ·yᵢ/100      (wrzesień 2026: 4,1 − 4,122 = −0,022 p.p.)
//   Twoja inflacja    = Σ uᵢ·yᵢ/100 + r        (przy wagach GUS = dokładnie CPI)
//   wkład działu   cᵢ = uᵢ·yᵢ/100              (Σ cᵢ + r = wynik)
// Σ w·y to przybliżenie indeksu GUS (łańcuchowy Laspeyres, wagi 2026 wobec grudnia 2025): w 2026 |r| ≤ 0,05 p.p.

import { CPI_WEIGHTS_2026 } from '@/lib/cpi-weights';

export const BASKET_PARAM = 'w';
/** Udziały w adresie: setne części procenta wartości suwaka (25,91% → 2591), 13 liczb całkowitych 0–10000. */
const SCALE = 100;
const MAX_TOKEN = 10000;
/** Powyżej tej |reszty| karta wyniku mówi, że przybliżenie jest w tym miesiącu mniej dokładne. */
export const RESIDUAL_WARN_PP = 0.15;

export const DIVISION_CODES: readonly string[] = CPI_WEIGHTS_2026.map((d) => d.code);

/** Wagi GUS w kolejności `DIVISION_CODES` (%). */
export const gusShares = (): number[] => CPI_WEIGHTS_2026.map((d) => d.weight);

// ── Miesiąc danych ────────────────────────────────────────────────────────────────────────────────

/** Najnowszy miesiąc z kompletem: r/r wszystkich 13 działów i oficjalne CPI za ten sam `YYYY-MM`. */
export interface MonthSnapshot { date: string; cpi: number; yoy: Record<string, number> }

interface CpiFullLike {
    headline?: { date?: string; yoy?: number | null }[];
    divisions?: { code?: string; history?: { date?: string; yoy?: number | null }[] }[];
}

const MONTH = /^\d{4}-\d{2}$/;

/**
 * Działy (przekrój DBW 1698) i nagłówek (1722) to osobne przekroje — nie mieszamy miesięcy. Bierzemy najnowszy
 * miesiąc, który ma oba; brak takiego = null (strona pokazuje „—”, nie liczbę z innego miesiąca).
 */
export function latestCompleteMonth(payload: CpiFullLike | null | undefined): MonthSnapshot | null {
    if (!payload) return null;
    const cpiBy = new Map<string, number>();
    for (const h of payload.headline ?? []) {
        if (h?.date && MONTH.test(h.date) && typeof h.yoy === 'number' && Number.isFinite(h.yoy)) cpiBy.set(h.date, h.yoy);
    }
    const byMonth = new Map<string, Record<string, number>>();
    for (const d of payload.divisions ?? []) {
        if (!d?.code || !DIVISION_CODES.includes(d.code)) continue;
        for (const h of d.history ?? []) {
            if (!h?.date || !MONTH.test(h.date) || typeof h.yoy !== 'number' || !Number.isFinite(h.yoy)) continue;
            (byMonth.get(h.date) ?? byMonth.set(h.date, {}).get(h.date)!)[d.code] = h.yoy;
        }
    }
    const months = [...byMonth.keys()].sort().reverse();
    for (const m of months) {
        const yoy = byMonth.get(m)!;
        const cpi = cpiBy.get(m);
        if (cpi != null && DIVISION_CODES.every((c) => yoy[c] != null)) return { date: m, cpi, yoy };
    }
    return null;
}

/** Najnowszy miesiąc, w którym jest r/r wszystkich 13 działów (kontrola świeżości `cpi-divisions`). */
export function latestDivisionsMonth(payload: unknown): string | null {
    const divs = (payload as CpiFullLike | null)?.divisions;
    if (!Array.isArray(divs)) return null;
    const counts = new Map<string, Set<string>>();
    for (const d of divs) {
        if (!d?.code || !DIVISION_CODES.includes(d.code)) continue;
        for (const h of d.history ?? []) {
            if (h?.date && MONTH.test(h.date) && typeof h.yoy === 'number') (counts.get(h.date) ?? counts.set(h.date, new Set()).get(h.date)!).add(d.code);
        }
    }
    return [...counts.entries()].filter(([, s]) => s.size === DIVISION_CODES.length).map(([m]) => m).sort().pop() ?? null;
}

// ── Wynik ─────────────────────────────────────────────────────────────────────────────────────────

export interface Contribution {
    code: string;
    /** Udział po normalizacji (%). */
    share: number;
    yoy: number;
    /** Wkład do Twojej inflacji (p.p.). */
    pp: number;
    /** Ile ten dział dokłada do różnicy względem CPI: (u − w)·y/100 (p.p.). */
    vsCpi: number;
}

export interface PersonalInflation {
    rate: number;
    cpi: number;
    /** Σ wᵢ·yᵢ/100 — ten sam wzór na wagach GUS. */
    gusSum: number;
    /** Reszta metody r = CPI − gusSum. */
    residual: number;
    /** Twoja inflacja − CPI = Σ (u − w)·y/100. */
    diff: number;
    /** Wkłady malejąco. */
    contributions: Contribution[];
    /** Dział z największym |(u − w)·y| — wyjaśnia różnicę w zdaniu-wniosku. */
    driver: Contribution;
}

/** Null przy koszyku bez żadnego udziału (suma 0) albo bez danych. */
export function computePersonalInflation(shares: readonly number[], snap: MonthSnapshot | null): PersonalInflation | null {
    if (!snap) return null;
    const clean = DIVISION_CODES.map((_, i) => Math.max(0, Number.isFinite(shares[i]) ? shares[i] : 0));
    const total = clean.reduce((a, b) => a + b, 0);
    if (total <= 0) return null;
    const gus = gusShares();
    const gusSum = DIVISION_CODES.reduce((a, c, i) => a + (gus[i] * snap.yoy[c]) / 100, 0);
    const residual = snap.cpi - gusSum;
    const contributions: Contribution[] = DIVISION_CODES.map((code, i) => {
        const share = (clean[i] / total) * 100;
        const yoy = snap.yoy[code];
        return { code, share, yoy, pp: (share * yoy) / 100, vsCpi: ((share - gus[i]) * yoy) / 100 };
    });
    const sum = contributions.reduce((a, c) => a + c.pp, 0);
    const driver = contributions.reduce((best, c) => (Math.abs(c.vsCpi) > Math.abs(best.vsCpi) ? c : best));
    return {
        rate: sum + residual,
        cpi: snap.cpi,
        gusSum,
        residual,
        diff: sum - gusSum,
        contributions: [...contributions].sort((a, b) => b.pp - a.pp),
        driver,
    };
}

// ── Stan w adresie (?w=) ──────────────────────────────────────────────────────────────────────────

export type BasketFromUrl =
    | { status: 'none' }
    | { status: 'ok'; shares: number[] }
    | { status: 'invalid' };

/**
 * Całość albo nic: dokładnie 13 tokenów `^\d{1,5}$` ≤ 10000, suma > 0, `w` raz. Wszystko inne = wagi GUS
 * z informacją „Link był niepełny” — bez wyjątku i bez częściowego koszyka.
 */
export function parseBasket(search: string | URLSearchParams): BasketFromUrl {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;
    const all = params.getAll(BASKET_PARAM);
    if (all.length === 0) return { status: 'none' };
    if (all.length > 1) return { status: 'invalid' };
    const raw = all[0];
    if (raw.length > 13 * 6) return { status: 'invalid' };
    const parts = raw.split(',');
    if (parts.length !== DIVISION_CODES.length) return { status: 'invalid' };
    const shares: number[] = [];
    for (const p of parts) {
        if (!/^\d{1,5}$/.test(p)) return { status: 'invalid' };
        const n = Number(p);
        if (n > MAX_TOKEN) return { status: 'invalid' };
        shares.push(n / SCALE);
    }
    if (shares.every((v) => v === 0)) return { status: 'invalid' };
    return { status: 'ok', shares };
}

/** Udziały (surowe wartości suwaków) → wartość `w`; null = wagi GUS (czysty adres). */
export function encodeBasket(shares: readonly number[]): string | null {
    if (isGusBasket(shares)) return null;
    return DIVISION_CODES.map((_, i) => Math.min(MAX_TOKEN, Math.round(Math.max(0, shares[i] ?? 0) * SCALE))).join(',');
}

/** Czy udziały to (z dokładnością zapisu w adresie) wagi GUS. */
export function isGusBasket(shares: readonly number[]): boolean {
    const g = gusShares();
    return shares.length === g.length && shares.every((v, i) => Math.round(v * SCALE) === Math.round(g[i] * SCALE));
}

/** Pole liczbowe: „12,5” / „12.5” → 12,5; poza 0–100 przycięte; śmieci → null. Do 2 miejsc po przecinku. */
export function parseShareInput(raw: string): number | null {
    const t = raw.trim().replace(',', '.');
    if (!/^\d{1,3}(\.\d{0,2})?$/.test(t)) return null;
    const n = Number(t);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
}
