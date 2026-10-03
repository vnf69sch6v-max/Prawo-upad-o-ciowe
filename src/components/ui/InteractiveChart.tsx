'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
    ComposedChart, Line, Bar, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import { ResponsiveContainer, mobileChartHeight, usePlotWidth } from '@/components/ui/ChartContainer';
import { AXIS_INK, AXIS_LINE, CHART_SM, CURSOR, GRID, TICK_FONT, xTickStep } from '@/lib/chart-theme';
import { RANGE_MONTHS, formatPeriodLabel, sliceByMonths, usefulRanges, type RangeKey } from '@/lib/chart-range';
import { useCanHover } from '@/lib/use-can-hover';
import { useScrollFade } from '@/lib/use-scroll-fade';

export interface ChartSeries {
    key: string;
    name: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
    yAxis?: 'left' | 'right';
    dashed?: boolean;
    strokeWidth?: number;
}

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
    /** Custom set of range buttons (default 3M/6M/1R/ALL); use ['1R','3L','5L','ALL'] for long series.
     *  Zakres liczony po datach osi X; przyciski, które niczego nie przycinają, są ukrywane. */
    ranges?: RangeKey[];
    legend?: boolean;
    /** Right controls slot (e.g. M/M vs R/R toggle) rendered next to range */
    controls?: ReactNode;
}

interface TooltipEntry { name?: string; value?: number; color?: string }

function LightTooltip({ active, payload, label, valueFormatter, unit, maxWidth }: {
    active?: boolean; payload?: TooltipEntry[]; label?: string;
    valueFormatter?: (v: number) => string; unit?: string;
    /** Szerokość karty minus margines — dymek nigdy nie wychodzi poza wykres (telefon, długie nazwy serii). */
    maxWidth?: number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13, minWidth: 130, maxWidth }}>
            {/* „30.09.2026" / „sierpień 2026" / „II kwartał 2026" zamiast surowego klucza osi. */}
            <div style={{ color: '#64748B', fontSize: 11, marginBottom: 5, fontWeight: 600 }}>{formatPeriodLabel(label)}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    {/* Klucz serii jako krótka kreska (jak linia na wykresie), nie pełny kwadrat. */}
                    <span style={{ width: 12, height: 2, borderRadius: 1, background: p.color, flexShrink: 0 }} />
                    <span style={{ color: '#64748B', minWidth: 0, overflowWrap: 'anywhere' }}>{p.name}</span>
                    <span style={{ color: '#0F172A', fontWeight: 600, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
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

// Rozmiar przycisków zakresu mieszka w CSS (`.mk-seg-sm`): 28 px dla myszy, 44 px dla dotyku
// (`@media (pointer: coarse)`). Styl inline wygrywał z każdą regułą i blokował cel dotykowy.
const RANGE_BTN: CSSProperties = { touchAction: 'manipulation' };

/** Szerokość plotu, poniżej której wykres jest „telefonowy” (portret: 320–430 px okna → 256–366 px plotu). */
const PHONE_PLOT = 480;

/** Szacowana szerokość etykiety 11 px (Inter): wąskie znaki — spacja, kropka — liczą się mniej. */
function labelPx(text: string): number {
    let w = 0;
    for (const ch of text) w += ch === ' ' ? 3.2 : ch === '.' || ch === ',' ? 3 : 6.4;
    return w;
}

interface PhoneTicks { ticks: unknown[]; start: unknown; end: unknown }

/**
 * Etykiety osi X na telefonie: ≤ 5, w RÓWNYM kroku liczonym wstecz od ostatniego punktu (najnowszy
 * okres zawsze podpisany, odstępy równe także w czasie), krok dobrany do szerokości etykiet.
 * Skrajne są dosunięte do brzegów (`start`/`end`), więc między sąsiadami musi zmieścić się 1,5
 * etykiety + odstęp — inaczej „II kw. 24II kw. 26” sklejały się przy prawym brzegu.
 */
function phoneTicks(rows: Record<string, unknown>[], xKey: string, width: number, fmt?: (v: string) => string): PhoneTicks {
    const n = rows.length;
    if (n === 0) return { ticks: [], start: undefined, end: undefined };
    const label = (r: Record<string, unknown>) => (fmt ? fmt(String(r[xKey])) : String(r[xKey] ?? ''));
    let maxL = 0;
    for (const r of rows) maxL = Math.max(maxL, labelPx(label(r)));
    const plotW = Math.max(64, width - 40);
    const perIdx = n > 1 ? plotW / (n - 1) : plotW;
    const step = Math.max(1, Math.ceil((1.5 * maxL + 10) / perIdx), Math.ceil((n - 1) / 4));
    const idx: number[] = [];
    for (let i = n - 1; i >= 0; i -= step) idx.unshift(i);
    const first = idx[0];
    return {
        ticks: idx.map((i) => rows[i][xKey]),
        // Pierwsza etykieta tuż przy lewym brzegu — kotwica `start`, żeby jej nie ucięło.
        start: first * perIdx < maxL / 2 + 2 ? rows[first][xKey] : undefined,
        end: rows[n - 1][xKey],
    };
}

const plNum = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 });

/**
 * Oś Y na telefonie: „158 tys.” zamiast „158 473”, „20” zamiast „20,0” — oś ma być wąska, a dokładna
 * wartość i tak jest w dymku. Na desktopie bez zmian (formatter strony).
 */
function compactAxis(valueFormatter?: (v: number) => string) {
    return (v: number) => {
        const a = Math.abs(v);
        if (a >= 1e6) return `${plNum.format(v / 1e6)} mln`;
        if (a >= 1e4) return `${plNum.format(v / 1e3)} tys.`;
        const s = valueFormatter ? valueFormatter(v) : plNum.format(v);
        return s.replace(/,0+(?=\D*$)/, '');
    };
}

interface EdgeTickProps {
    x?: number | string; y?: number | string;
    payload?: { value?: unknown };
    first: unknown; last: unknown;
    format?: (v: string) => string;
}

/**
 * Etykieta osi X kotwiczona do krawędzi: pierwsza od lewej (`start`), ostatnia do prawej (`end`).
 * Wyśrodkowana ostatnia etykieta przy prawym brzegu plotu była ucinana do „08.2”.
 */
function EdgeTick({ x, y, payload, first, last, format }: EdgeTickProps) {
    const v = payload?.value;
    const anchor = v === first ? 'start' : v === last ? 'end' : 'middle';
    const text = format ? format(String(v)) : String(v ?? '');
    return (
        <text x={Number(x)} y={Number(y)} dy="0.71em" textAnchor={anchor} fill={AXIS_INK} fontSize={TICK_FONT}>
            {text}
        </text>
    );
}

export function InteractiveChart({
    data, xKey, series, height = 300, unit = '', valueFormatter, xTickFormatter,
    referenceLines, showRange = false, initialRange = 'ALL', ranges, legend = false, controls,
}: InteractiveChartProps) {
    const [range, setRange] = useState<RangeKey>(initialRange);
    const rangeButtons = ranges ?? DEFAULT_RANGES;
    const { ref: rootRef, width: boxW } = usePlotWidth();
    const [forceHide, setForceHide] = useState(false);
    const canHover = useCanHover();
    const rangeRef = useRef<HTMLDivElement>(null);

    // Tylko zakresy, które realnie coś przycinają — przy 60 sesjach „1R" i „ALL" to ten sam widok.
    const shownRanges = useMemo(() => usefulRanges(data, xKey, rangeButtons), [data, xKey, rangeButtons]);
    const activeRange: RangeKey = shownRanges.includes(range) ? range : 'ALL';
    const rangeControl = showRange && shownRanges.length > 1;
    const rangeFade = useScrollFade(rangeRef, rangeControl);

    const view = useMemo(() => {
        if (!showRange || activeRange === 'ALL') return data;
        const months = RANGE_MONTHS[activeRange];
        return months ? sliceByMonths(data, xKey, months) : data;
    }, [data, xKey, activeRange, showRange]);

    // Bez tej osłony wykres po awarii źródła rysował kompletną ramę z osiami i legendą, tylko bez
    // linii — a to czyta się jako „zjawiska nie ma", nie jako „danych nie dostaliśmy". Przy zasadzie
    // „tylko prawdziwe dane" brak danych trzeba powiedzieć wprost.
    const hasData = view.some((row) => series.some((s) => row[s.key] != null));

    const hasRight = series.some((s) => s.yAxis === 'right');
    const hasBar = series.some((s) => s.type === 'bar');
    // Bars need a 0 baseline; line/area charts look better tightly fitted to the data.
    const yDomain: [number | string, number | string] = hasBar ? [0, 'auto'] : ['auto', 'auto'];

    const isNarrow = boxW === 0 || boxW < CHART_SM;
    const plotH = mobileChartHeight(boxW || 375, height);
    const tickInterval = xTickStep(boxW || 309, view.length);
    const legendBelow = Boolean(legend && isNarrow);
    // Telefon (plot < 480 px — także gdy jeszcze nie zmierzony): ≤ 5 etykiet osi X, skrajne dosunięte
    // do krawędzi, wąska oś Y. Desktop — także w wąskiej kolumnie — bez zmian (interwał z pomiaru).
    const isPhone = boxW === 0 || boxW < PHONE_PLOT;
    const narrowTicks = useMemo(
        () => (isPhone ? phoneTicks(view, xKey, boxW || 326, xTickFormatter) : undefined),
        [isPhone, view, xKey, boxW, xTickFormatter],
    );
    const yTick = isPhone ? compactAxis(valueFormatter) : valueFormatter;
    const yRightTick = isPhone ? compactAxis() : undefined;

    // Tooltip: mysz → najechanie (celownik + wartości bez klikania); dotyk → stuknięcie, które ZOSTAJE.
    // W trybie dotykowym `active={false}` od startu BLOKUJE tap (Recharts nie otworzy tooltipa) —
    // gasimy dopiero po tapie poza wykresem; kolejny tap w plot zdejmuje blokadę.
    useEffect(() => {
        const hide = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setForceHide(true);
        };
        document.addEventListener('pointerdown', hide);
        return () => document.removeEventListener('pointerdown', hide);
    }, [rootRef]);

    return (
        <div ref={rootRef}>
            {(rangeControl || controls) && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 max-w-full">{controls}</div>
                    {rangeControl && (
                        <div ref={rangeRef} className="mk-seg mk-fade-x ml-auto" data-fade={rangeFade} role="tablist" aria-label="Zakres">
                            {shownRanges.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeRange === r}
                                    onClick={() => setRange(r)}
                                    className={`mk-seg-btn mk-seg-sm ${activeRange === r ? 'mk-seg-btn-active' : ''}`}
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
                    margin={isPhone
                        ? { top: 6, right: 6, left: 0, bottom: legendBelow ? 2 : 0 }
                        : { top: 6, right: hasRight ? 6 : 12, left: -6, bottom: legendBelow ? 2 : 0 }}
                    onClick={() => setForceHide(false)}
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
                    {narrowTicks ? (
                        <XAxis
                            dataKey={xKey}
                            ticks={narrowTicks.ticks as (string | number)[]}
                            interval={0}
                            tick={<EdgeTick first={narrowTicks.start} last={narrowTicks.end} format={xTickFormatter} />}
                            axisLine={{ stroke: AXIS_LINE }}
                            tickLine={false}
                        />
                    ) : (
                        <XAxis
                            dataKey={xKey}
                            // Ta sama kotwica krawędziowa co na telefonie: ostatnia data przy prawym
                            // brzegu („02.10") nie jest już ucinana do „02.1".
                            tick={<EdgeTick first={view[0]?.[xKey]} last={view[view.length - 1]?.[xKey]} format={xTickFormatter} />}
                            // Zostaje dla pomiaru odstępów (minTickGap liczy szerokość sformatowanej etykiety).
                            tickFormatter={xTickFormatter}
                            axisLine={{ stroke: AXIS_LINE }}
                            tickLine={false}
                            interval={tickInterval}
                            minTickGap={36}
                            angle={0}
                        />
                    )}
                    {/* Telefon: szerokość osi z etykiet (`auto`), format kompaktowy — więcej miejsca na dane. */}
                    <YAxis yAxisId="left" domain={yDomain} tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} axisLine={false} tickLine={false} width={isPhone ? 'auto' : 44} tickFormatter={yTick} />
                    {hasRight && <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} axisLine={false} tickLine={false} width={isPhone ? 'auto' : 44} tickFormatter={yRightTick} />}
                    <Tooltip
                        trigger={canHover ? 'hover' : 'click'}
                        active={!canHover && forceHide ? false : undefined}
                        content={<LightTooltip valueFormatter={valueFormatter} unit={unit} maxWidth={boxW ? Math.max(160, boxW - 16) : undefined} />}
                        cursor={{ stroke: CURSOR, strokeWidth: 1 }}
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
