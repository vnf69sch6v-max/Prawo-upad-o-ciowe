'use client';

import { useMemo, useState, type PointerEvent } from 'react';
import { useCanHover } from '@/lib/use-can-hover';
import { formatPeriodLabel, periodKind } from '@/lib/chart-range';

export interface SparkPoint {
    date: string;
    value: number;
}

const VB_W = 100;
const VB_H = 28;
const PAD_Y = 3;

/**
 * Trend w kaflu KPI (kontrakt „stat tile": wartość · delta · trend).
 *
 * Linia w kolorze wyciszonym, bieżący okres jako kropka w akcencie — kolor nie koduje tu
 * kierunku (to robi DeltaChip obok), więc nie ma zielono-czerwonej podwójnej semantyki.
 * SVG rozciąga się na szerokość wolnego miejsca (`preserveAspectRatio="none"` + linia
 * `non-scaling-stroke`), kropka i dymek są w HTML, żeby nie zamieniały się w elipsy.
 *
 * Mysz: najechanie pokazuje wartość i okres najbliższego punktu. Dotyk: bez dymka — stuknięcie
 * w kafel prowadzi do pełnego wykresu, a liczba i delta są w tekście (dymek nic nie zasłania).
 */
export function KpiSparkline({ points: input, format }: { points: SparkPoint[]; format?: (v: number) => string }) {
    const canHover = useCanHover();
    const [hover, setHover] = useState<number | null>(null);

    // Punkty stoją w równych odstępach, więc seria musi mieć jedną ziarnistość. CPI GUS jest
    // kwartalne do IV kw. 2025 i miesięczne od 01.2026 — bez tego kwartał zajmowałby tyle miejsca
    // co miesiąc. Bierzemy końcowy odcinek o ziarnistości ostatniego punktu.
    const points = useMemo(() => {
        const kind = periodKind(input[input.length - 1]?.date);
        let start = input.length - 1;
        while (start > 0 && periodKind(input[start - 1].date) === kind) start--;
        return input.slice(Math.max(0, start));
    }, [input]);

    const geo = useMemo(() => {
        const vals = points.map((p) => p.value);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const span = max - min || 1;
        const last = points.length - 1;
        const xs = points.map((_, i) => (last === 0 ? 50 : (i / last) * VB_W));
        const ys = points.map((p) => PAD_Y + (1 - (p.value - min) / span) * (VB_H - 2 * PAD_Y));
        const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${ys[i].toFixed(2)}`).join(' ');
        return { xs, ys, d };
    }, [points]);

    if (points.length < 2) return null;

    const lastIdx = points.length - 1;
    const idx = hover ?? lastIdx;
    const x = geo.xs[idx];
    const yPct = (geo.ys[idx] / VB_H) * 100;
    // Dymek przy krawędzi wyrównany do niej, żeby nie wyjechał poza kafel (karta ma overflow-hidden).
    const tipShift = x < 25 ? '0%' : x > 75 ? '-100%' : '-50%';

    const onMove = (e: PointerEvent<HTMLSpanElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const t = Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1)));
        setHover(Math.round(t * lastIdx));
    };

    return (
        <span
            className="mk-spark"
            aria-hidden
            onPointerMove={canHover ? onMove : undefined}
            onPointerLeave={canHover ? () => setHover(null) : undefined}
        >
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" focusable="false">
                {hover != null && (
                    <line x1={x} x2={x} y1={0} y2={VB_H} className="mk-spark-cursor" vectorEffect="non-scaling-stroke" />
                )}
                <path d={geo.d} className="mk-spark-line" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="mk-spark-dot" style={{ left: `${x}%`, top: `${yPct}%` }} />
            {hover != null && (
                <span className="mk-spark-tip" style={{ left: `${x}%`, transform: `translateX(${tipShift})` }}>
                    <strong>{format ? format(points[idx].value) : points[idx].value}</strong>
                    <span>{formatPeriodLabel(points[idx].date)}</span>
                </span>
            )}
        </span>
    );
}
