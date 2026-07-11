// Derived "key observations" from live series — small, reusable signal helpers.

export type Tone = 'up' | 'down' | 'neutral' | 'warn';

export interface Observation {
    text: string;
    tone?: Tone;
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

/** Human phrase for an N-month run, e.g. "od 3 mies.". */
export function runPhrase(n: number): string {
    if (n <= 0) return '';
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
