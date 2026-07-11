'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
    ResponsiveContainer, ComposedChart, Line, Bar, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';

export interface ChartSeries {
    key: string;
    name: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
    yAxis?: 'left' | 'right';
    dashed?: boolean;
    strokeWidth?: number;
}

type RangeKey = '3M' | '6M' | '1R' | 'ALL';

interface InteractiveChartProps {
    data: Record<string, unknown>[];
    xKey: string;
    series: ChartSeries[];
    height?: number;
    unit?: string;
    valueFormatter?: (v: number) => string;
    xTickFormatter?: (v: string) => string;
    referenceLines?: { y: number; label?: string; color?: string; axis?: 'left' | 'right' }[];
    /** Show the built-in 3M/6M/1R/ALL range picker */
    showRange?: boolean;
    initialRange?: RangeKey;
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

const RANGES: RangeKey[] = ['3M', '6M', '1R', 'ALL'];

export function InteractiveChart({
    data, xKey, series, height = 300, unit = '', valueFormatter, xTickFormatter,
    referenceLines, showRange = false, initialRange = 'ALL', legend = false, controls,
}: InteractiveChartProps) {
    const [range, setRange] = useState<RangeKey>(initialRange);

    const view = useMemo(() => {
        if (!showRange || range === 'ALL') return data;
        const n = range === '3M' ? 3 : range === '6M' ? 6 : 12;
        return data.slice(-n);
    }, [data, range, showRange]);

    const hasRight = series.some((s) => s.yAxis === 'right');
    const hasBar = series.some((s) => s.type === 'bar');
    // Bars need a 0 baseline; line/area charts look better tightly fitted to the data.
    const yDomain: [number | string, number | string] = hasBar ? [0, 'auto'] : ['auto', 'auto'];

    return (
        <div>
            {(showRange || controls) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>{controls}</div>
                    {showRange && (
                        <div className="mk-seg" role="tablist" aria-label="Zakres">
                            {RANGES.map((r) => (
                                <button key={r} type="button" onClick={() => setRange(r)} className={`mk-seg-btn ${range === r ? 'mk-seg-btn-active' : ''}`} style={{ padding: '3px 9px', fontSize: 12 }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={view} margin={{ top: 6, right: hasRight ? 6 : 12, left: -6, bottom: 0 }}>
                    <defs>
                        {series.filter((s) => s.type === 'area').map((s) => (
                            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid stroke="#EDF0F5" vertical={false} />
                    <XAxis dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={xTickFormatter} axisLine={{ stroke: '#E7EAF0' }} tickLine={false} minTickGap={24} />
                    <YAxis yAxisId="left" domain={yDomain} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={44} tickFormatter={valueFormatter} />
                    {hasRight && <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />}
                    <Tooltip content={<LightTooltip valueFormatter={valueFormatter} unit={unit} />} cursor={{ stroke: '#CBD2DD', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />}

                    {referenceLines?.map((r, i) => (
                        <ReferenceLine key={i} yAxisId={r.axis ?? 'left'} y={r.y} stroke={r.color ?? '#94A3B8'} strokeDasharray="4 4"
                            label={r.label ? { value: r.label, position: 'insideTopRight', fill: r.color ?? '#94A3B8', fontSize: 11 } : undefined} />
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
        </div>
    );
}
