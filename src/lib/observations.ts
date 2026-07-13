// Derived "key observations" from live series — small, reusable signal helpers.

export type Tone = 'up' | 'down' | 'neutral' | 'warn';
export type InsightKind = 'trend' | 'record' | 'target' | 'accel' | 'level';

export interface Observation {
    text: string;
    tone?: Tone;
    kind?: InsightKind;   // pozwala dobrać ikonę w InsightBar
}

/** Count trailing consecutive moves in a given direction. */
export function consecutiveRun(values: number[], dir: 'down' | 'up'): number {
    let run = 0;
    for (let i = values.length - 1; i > 0; i--) {
        const diff = values[i] - values[i - 1];
        if (dir === 'down' && diff < 0) run++;
        else if (dir === 'up' && diff > 0) run++;
        else break;
    }
    return run;
}

const PL_MONTHS = ['mies.', '2 mies.', '3 mies.', '4 mies.', '5 mies.', '6 mies.', '7 mies.', '8 mies.', '9 mies.', '10 mies.', '11 mies.', '12 mies.'];

export type Period = 'month' | 'day' | 'quarter' | 'year';

/** Human phrase for an N-period run, e.g. "od 3 mies." / "od 5 dni" / "od 2 kw." / "od 2 lat". */
export function runPhrase(n: number, period: Period = 'month'): string {
    if (n <= 0) return '';
    if (period === 'day') return `od ${n} ${n === 1 ? 'dnia' : 'dni'}`;
    if (period === 'quarter') return `od ${n} kw.`;
    if (period === 'year') return `od ${n} ${n === 1 ? 'roku' : 'lat'}`;
    return `od ${PL_MONTHS[Math.min(n, 12) - 1]}`;
}

/**
 * Build a trend observation from a numeric series.
 * `goodDown` marks indicators where falling is positive (inflation, unemployment).
 */
export function trendObservation(label: string, values: number[], goodDown = false): Observation | null {
    if (values.length < 3) return null;
    const down = consecutiveRun(values, 'down');
    const up = consecutiveRun(values, 'up');
    if (down >= 2) {
        return { text: `${label}: trend spadkowy ${runPhrase(down)}`, tone: goodDown ? 'up' : 'down' };
    }
    if (up >= 2) {
        return { text: `${label}: trend wzrostowy ${runPhrase(up)}`, tone: goodDown ? 'down' : 'up' };
    }
    return null;
}

const fmt = (x: number, d = 1, unit = '') => `${x > 0 && unit === 'pp' ? '+' : ''}${x.toFixed(d).replace('.', ',')}${unit ? ` ${unit}` : ''}`;

export interface AnalyzeOpts {
    goodDown?: boolean;                        // spadek = dobrze (inflacja, bezrobocie)
    unit?: string;                             // '%', 'pkt'…
    decimals?: number;
    target?: { value: number; label: string }; // np. cel NBP 2,5%
    minRun?: number;                           // ile kolejnych ruchów = trend (domyślnie 2)
    period?: Period;                           // jednostka okresu do frazy „od N …" (miesiąc/dzień/kwartał)
}

/**
 * Augmented-analytics: automatycznie wyławia sygnały z serii — przekroczenie progu,
 * rekord (szczyt/dołek + jak dawno), trend i przyspieszenie. Zwraca ≤4 obserwacje
 * uporządkowane wg istotności. Wartości powinny być w kolejności chronologicznej.
 */
export function analyzeSeries(label: string, raw: (number | null | undefined)[], opts: AnalyzeOpts = {}): Observation[] {
    const v = raw.filter((x): x is number => x != null && Number.isFinite(x));
    if (v.length < 3) return [];
    const { goodDown = false, unit = '', decimals = 1, target, minRun = 2, period = 'month' } = opts;
    const f = (x: number) => fmt(x, decimals, unit);
    const last = v[v.length - 1], prev = v[v.length - 2];
    const out: Observation[] = [];

    // 1) Relacja do celu (np. cel inflacyjny) — zawsze informuje: przebicie / powyżej / poniżej / blisko.
    // Frazowanie bez czasownika, by działało niezależnie od rodzaju etykiety. target.label = nazwa (np. „NBP").
    if (target) {
        const above = last >= target.value, wasAbove = prev >= target.value;
        const gap = last - target.value;
        const near = Math.abs(gap) <= Math.max(0.2, target.value * 0.1);
        const name = target.label;
        if (above !== wasAbove) {
            out.push({ kind: 'target', tone: 'warn', text: above ? `${label} — przebicie celu ${name} (${f(target.value)})` : `${label} — spadek poniżej celu ${name} (${f(target.value)})` });
        } else if (near) {
            out.push({ kind: 'target', tone: 'up', text: `${label} blisko celu ${name}: ${f(last)}` });
        } else {
            out.push({ kind: 'target', tone: above ? 'warn' : goodDown ? 'up' : 'neutral', text: `${label} ${above ? 'powyżej' : 'poniżej'} celu ${name}: ${f(last)} (${fmt(gap, decimals, 'pp')} od celu)` });
        }
    }

    // 2) Rekord: ile okresów wstecz był wyższy/niższy odczyt
    let sinceHigher = 0; for (let i = v.length - 2; i >= 0; i--) { if (v[i] > last) break; sinceHigher++; }
    let sinceLower = 0; for (let i = v.length - 2; i >= 0; i--) { if (v[i] < last) break; sinceLower++; }
    if (sinceHigher >= 5) out.push({ kind: 'record', tone: goodDown ? 'warn' : 'up', text: `${label}: najwyżej ${runPhrase(sinceHigher, period)} (${f(last)})` });
    else if (sinceLower >= 5) out.push({ kind: 'record', tone: goodDown ? 'up' : 'down', text: `${label}: najniżej ${runPhrase(sinceLower, period)} (${f(last)})` });

    // 3) Trend (kolejne ruchy w jedną stronę)
    const down = consecutiveRun(v, 'down'), up = consecutiveRun(v, 'up');
    if (down >= minRun) out.push({ kind: 'trend', tone: goodDown ? 'up' : 'down', text: `${label}: spada ${runPhrase(down, period)} (teraz ${f(last)})` });
    else if (up >= minRun) out.push({ kind: 'trend', tone: goodDown ? 'down' : 'up', text: `${label}: rośnie ${runPhrase(up, period)} (teraz ${f(last)})` });

    // 4) Przyspieszenie/wyhamowanie ostatniej zmiany vs poprzedniej
    if (v.length >= 4 && out.length < 3) {
        const d1 = last - prev, d0 = prev - v[v.length - 3];
        if (Math.abs(d1) > 0.1 && Math.sign(d1) === Math.sign(d0) && Math.abs(d1) > Math.abs(d0) * 1.5) {
            const risingMove = d1 > 0;
            out.push({ kind: 'accel', tone: (risingMove ? !goodDown : goodDown) ? 'up' : 'down', text: `${label}: ${risingMove ? 'przyspiesza wzrost' : 'przyspiesza spadek'} (${fmt(d1, decimals, 'pp')})` });
        }
    }

    return out.slice(0, 4);
}
