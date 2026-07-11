'use client';

import { formatDecimalPL } from '@/lib/formatters';

type Unit = 'pp' | 'pct' | 'none';

interface DeltaChipProps {
    /** The signed change value */
    value: number;
    /** Unit shown after the number: p.p. / % / nothing */
    unit?: Unit;
    decimals?: number;
    /** Trailing context, e.g. "vs IV 2026" */
    note?: string;
    /**
     * When true, a DECREASE is treated as good (green) — for inflation,
     * unemployment, debt etc. When false, an INCREASE is good (green).
     */
    invert?: boolean;
}

/**
 * Colored delta pill. Arrow follows the real direction; colour follows
 * "good vs bad" (with `invert` for indicators where lower is better).
 */
export function DeltaChip({ value, unit = 'pp', decimals = 1, note, invert = false }: DeltaChipProps) {
    const dir = value > 0 ? 1 : value < 0 ? -1 : 0;
    const good = invert ? -dir : dir;
    const cls = good > 0 ? 'mk-chip mk-chip-up' : good < 0 ? 'mk-chip mk-chip-down' : 'mk-chip mk-chip-flat';
    const arrow = dir > 0 ? '↑' : dir < 0 ? '↓' : '→';
    const unitStr = unit === 'pp' ? ' p.p.' : unit === 'pct' ? '%' : '';
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';

    return (
        <span className={cls}>
            <span aria-hidden>{arrow}</span>
            <span>{sign}{formatDecimalPL(Math.abs(value), decimals)}{unitStr}</span>
            {note && <span className="font-normal opacity-70">{note}</span>}
        </span>
    );
}
