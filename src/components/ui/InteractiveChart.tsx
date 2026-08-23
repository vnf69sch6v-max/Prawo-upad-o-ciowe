'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
    ComposedChart, Line, Bar, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import { ResponsiveContainer, usePlotWidth } from '@/components/ui/ChartContainer';
import { AXIS_INK, AXIS_LINE, CHART_SM, CURSOR, GRID, TICK_FONT, mobilePlotHeight, xTickStep } from '@/lib/chart-theme';

export interface ChartSeries {
    key: string;
    name: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
    yAxis?: 'left' | 'right';
    dashed?: boolean;
    strokeWidth?: number;
}

type RangeKey = '3M' | '6M' | '1R' | '3L' | '5L' | 'ALL';
const RANGE_MONTHS: Record<RangeKey, number | null> = { '3M': 3, '6M': 6, '1R': 12, '3L': 36, '5L': 60, ALL: null };

interface InteractiveChartProps {
    data: Record<string, unknown>[];
    xKey: string;
    series: ChartSeries[];
    height?: number;
    unit?: string;
    valueFormatter?: (v: number) => string;
    xTickFormatter?: (v: string) => string;
    referenceLines?: { y: number; label?: string; color?: string; axis?: 'left' | 'right' }[];
    /** Show the built-in range picker */
    showRange?: boolean;
    initialRange?: RangeKey;
    /** Custom set of range buttons (default 3M/6M/1R/ALL); use ['1R','3L','5L','ALL'] for long series */
    ranges?: RangeKey[];
    legend?: boolean;
    /** Right controls slot (e.g. M/M vs R/R toggle) rendered next to range */
    controls?: ReactNode;
}

interface TooltipEntry { name?: string; value?: number; color?: string }

function LightTooltip({ active, payload, label, valueFormatter, unit }: {
    active?: boolean; payload?: TooltipEntry[]; label?: string;
    valueFormatter?: (v: number) => string; unit?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13, minWidth: 130 }}>
            <div style={{ color: '#64748B', fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <span style={{ color: '#64748B' }}>{p.name}</span>
                    <span style={{ color: '#0F172A', fontWeight: 600, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
                        {p.value == null ? '—' : (valueFormatter ? valueFormatter(p.value) : p.value)}{unit ?? ''}
                    </span>
                </div>
            ))}
        </div>
    );
}

function BelowLegend({ series }: { series: ChartSeries[] }) {
    return (
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            {series.map((s) => (
                <li key={s.key} className="inline-flex items-center gap-1.5 text-xs text-mk-muted">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={s.dashed
                            ? { boxShadow: `inset 0 0 0 1.5px ${s.color}`, background: 'transparent' }
                            : { background: s.color }}
                    />
                    {s.name}
                </li>
            ))}
        </ul>
    );
}

const DEFAULT_RANGES: RangeKey[] = ['3M', '6M', '1R', 'ALL'];

const RANGE_BTN: CSSProperties = {
    minWidth: 28,
    minHeight: 28,
    padding: '4px 10px',
    fontSize: 12,
    lineHeight: 1.2,
    touchAction: 'manipulation',
};

export function InteractiveChart({
    data, xKey, series, height = 300, unit = '', valueFormatter, xTickFormatter,
    referenceLines, showRange = false, initialRange = 'ALL', ranges, legend = false, controls,
}: InteractiveChartProps) {
    const [range, setRange] = useState<RangeKey>(initialRange);
    const rangeButtons = ranges ?? DEFAULT_RANGES;
    const { ref: rootRef, width: boxW } = usePlotWidth();
    const [tipOn, setTipOn] = useState(false);

    const view = useMemo(() => {
        if (!showRange || range === 'ALL') return data;
        const n = RANGE_MONTHS[range];
        return n ? data.slice(-n) : data;
    }, [data, range, showRange]);

    // Bez tej osłony wykres po awarii źródła rysował kompletną ramę z osiami i legendą, tylko bez
    // linii — a to czyta się jako „zjawiska nie ma", nie jako „danych nie dostaliśmy". Przy zasadzie
    // „tylko prawdziwe dane" brak danych trzeba powiedzieć wprost.
    const hasData = view.some((row) => series.some((s) => row[s.key] != null));

    const hasRight = series.some((s) => s.yAxis === 'right');
    const hasBar = series.some((s) => s.type === 'bar');
    // Bars need a 0 baseline; line/area charts look better tightly fitted to the data.
    const yDomain: [number | string, number | string] = hasBar ? [0, 'auto'] : ['auto', 'auto'];

    const isNarrow = boxW === 0 || boxW < CHART_SM;
    const plotH = mobilePlotHeight(boxW || 375, height);
    const tickInterval = xTickStep(boxW || 309, view.length);
    const legendBelow = Boolean(legend && isNarrow);

    // Tooltip: na telefonie nie ma hover. `trigger="click"` pokazuje i ZOSTAJE;
    // tap poza wykresem zdejmuje (active=false). Kolejny tap w plot — nowy punkt.
    useEffect(() => {
        const hide = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setTipOn(false);
        };
        document.addEventListener('pointerdown', hide);
        return () => document.removeEventListener('pointerdown', hide);
    }, [rootRef]);

    return (
        <div ref={rootRef}>
            {(showRange || controls) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>{controls}</div>
                    {showRange && (
                        <div className="mk-seg" role="tablist" aria-label="Zakres">
                            {rangeButtons.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    role="tab"
                                    aria-selected={range === r}
                                    onClick={() => setRange(r)}
                                    className={`mk-seg-btn ${range === r ? 'mk-seg-btn-active' : ''}`}
                                    style={RANGE_BTN}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {!hasData ? (
                <div
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-mk-surface-alt text-center"
                    style={{ height: plotH }}
                >
                    <span className="text-sm font-medium text-mk-text">Brak danych do wyświetlenia</span>
                    <span className="max-w-[38ch] text-xs text-mk-muted">
                        Źródło nie zwróciło wartości dla tego zakresu. To nie znaczy, że wskaźnik wynosi zero.
                    </span>
                </div>
            ) : (
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart
                    data={view}
                    margin={{ top: 6, right: hasRight ? 6 : 12, left: -6, bottom: legendBelow ? 2 : 0 }}
                    onClick={(state) => {
                        if (state && state.activeTooltipIndex != null) setTipOn(true);
                    }}
                >
                    <defs>
                        {series.filter((s) => s.type === 'area').map((s) => (
                            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: AXIS_INK, fontSize: TICK_FONT }}
                        tickFormatter={xTickFormatter}
                        axisLine={{ stroke: AXIS_LINE }}
                        tickLine={false}
                        interval={tickInterval}
                        minTickGap={36}
                        angle={0}
                    />
                    <YAxis yAxisId="left" domain={yDomain} tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} axisLine={false} tickLine={false} width={44} tickFormatter={valueFormatter} />
                    {hasRight && <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} axisLine={false} tickLine={false} width={44} />}
                    <Tooltip
                        trigger="click"
                        active={tipOn ? undefined : false}
                        content={<LightTooltip valueFormatter={valueFormatter} unit={unit} />}
                        cursor={{ stroke: CURSOR, strokeWidth: 1, strokeDasharray: '3 3' }}
                        isAnimationActive={false}
                    />
                    {legend && !legendBelow && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />}

                    {referenceLines?.map((r, i) => (
                        <ReferenceLine key={i} yAxisId={r.axis ?? 'left'} y={r.y} stroke={r.color ?? AXIS_INK} strokeDasharray="4 4"
                            label={r.label ? { value: r.label, position: 'insideTopRight', fill: r.color ?? AXIS_INK, fontSize: TICK_FONT } : undefined} />
                    ))}

                    {series.map((s) => {
                        const axisId = s.yAxis ?? 'left';
                        if (s.type === 'bar') {
                            return <Bar key={s.key} yAxisId={axisId} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={44} />;
                        }
                        if (s.type === 'area') {
                            return <Area key={s.key} yAxisId={axisId} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={s.strokeWidth ?? 2.5} fill={`url(#grad-${s.key})`} dot={false} activeDot={{ r: 4 }} />;
                        }
                        return <Line key={s.key} yAxisId={axisId} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={s.strokeWidth ?? 2.5} strokeDasharray={s.dashed ? '5 4' : undefined} dot={false} activeDot={{ r: 4 }} connectNulls />;
                    })}
                </ComposedChart>
            </ResponsiveContainer>
            )}
            {hasData && legendBelow && <BelowLegend series={series} />}
        </div>
    );
}
