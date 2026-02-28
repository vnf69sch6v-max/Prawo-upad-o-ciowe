'use client';

import { useMemo } from 'react';
import { formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, ComposedChart, Line, Legend
} from 'recharts';
import { ChartPanel, RangeButtons, BloombergTooltip, BloombergCursor, useRangeFilter, useActiveBar, CHART_ANIM } from '@/components/ChartUtils';
import {
    useInflationMonthly, useUnemploymentMonthly, useGDPQuarterly,
    useIndustrialProduction, useRetailSales, usePLvsEU,
    EurostatTimeSeries,
} from '@/lib/hooks';

// ===== FALLBACK DATA (used when Eurostat is loading/errored) =====
// Last verified: 2026-02-28 from GUS

const FALLBACK_CPI = [
    { date: '2024-01', value: 5.3 }, { date: '2024-02', value: 4.9 },
    { date: '2024-03', value: 4.9 }, { date: '2024-04', value: 4.3 },
    { date: '2024-05', value: 4.0 }, { date: '2024-06', value: 4.1 },
    { date: '2024-07', value: 3.1 }, { date: '2024-08', value: 2.9 },
    { date: '2024-09', value: 2.9 }, { date: '2024-10', value: 2.8 },
    { date: '2024-11', value: 2.5 }, { date: '2024-12', value: 2.4 },
    { date: '2025-01', value: 2.2 },
];

const FALLBACK_UNEMP = [
    { date: '2024-01', value: 3.1 }, { date: '2024-02', value: 3.1 },
    { date: '2024-03', value: 3.0 }, { date: '2024-04', value: 3.0 },
    { date: '2024-05', value: 2.9 }, { date: '2024-06', value: 2.9 },
    { date: '2024-07', value: 3.0 }, { date: '2024-08', value: 3.0 },
    { date: '2024-09', value: 3.1 }, { date: '2024-10', value: 3.2 },
    { date: '2024-11', value: 3.2 }, { date: '2024-12', value: 3.2 },
];

const FALLBACK_GDP = [
    { date: '2023-Q1', value: -0.3 }, { date: '2023-Q2', value: -0.6 },
    { date: '2023-Q3', value: 0.5 }, { date: '2023-Q4', value: 1.0 },
    { date: '2024-Q1', value: 2.0 }, { date: '2024-Q2', value: 3.2 },
    { date: '2024-Q3', value: 2.7 }, { date: '2024-Q4', value: 3.2 },
];

// ===== Helpers =====

const GRID = { strokeDasharray: '3 3', stroke: '#1E293B' };
const TICK = { fill: '#64748B', fontSize: 10 };

function formatDate(d: string): string {
    // "2024-01" → "01.24", "2024-Q1" → "Q1 24"
    if (d.includes('Q')) {
        const [y, q] = d.split('-');
        return `${q} ${y.slice(2)}`;
    }
    const parts = d.split('-');
    return `${parts[1]}.${parts[0].slice(2)}`;
}

function useEurostatSeries(
    data: EurostatTimeSeries[] | undefined,
    fallback: EurostatTimeSeries[],
    isLoading: boolean
) {
    return useMemo(() => {
        const raw = (!isLoading && data && data.length > 0) ? data : fallback;
        return raw
            .filter(d => d.value !== null)
            .map(d => ({ date: formatDate(d.date), value: d.value as number, rawDate: d.date }));
    }, [data, fallback, isLoading]);
}

function getLastValue(series: { value: number }[]): number {
    return series.length > 0 ? series[series.length - 1].value : 0;
}

function getChange(series: { value: number }[]): number {
    if (series.length < 2) return 0;
    return +(series[series.length - 1].value - series[series.length - 2].value).toFixed(1);
}

// Loading skeleton
function SkeletonChart({ height = 250 }: { height?: number }) {
    return (
        <div className="animate-pulse" style={{ height }}>
            <div className="bg-bb-border/20 rounded h-full" />
        </div>
    );
}

function DataBadge({ isLive, updated }: { isLive: boolean; updated?: string }) {
    return (
        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-sm font-mono ${isLive ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
            }`}>
            {isLive ? '● LIVE' : '○ CACHE'}
            {updated && ` · ${updated.split('T')[0]}`}
        </span>
    );
}

export default function MacroPage() {
    // Eurostat hooks
    const cpiQuery = useInflationMonthly();
    const unempQuery = useUnemploymentMonthly();
    const gdpQuery = useGDPQuarterly();
    const industrialQuery = useIndustrialProduction();
    const retailQuery = useRetailSales();
    const plEuCpi = usePLvsEU('cpi');
    const plEuUnemp = usePLvsEU('unemployment');

    // Map Eurostat data to chart-ready format
    const cpiData = useEurostatSeries(cpiQuery.data?.data?.PL, FALLBACK_CPI, cpiQuery.isLoading);
    const unempData = useEurostatSeries(unempQuery.data?.data?.PL, FALLBACK_UNEMP, unempQuery.isLoading);
    const gdpData = useEurostatSeries(gdpQuery.data?.data?.PL, FALLBACK_GDP, gdpQuery.isLoading);
    const industrialData = useEurostatSeries(industrialQuery.data?.data?.PL, [], industrialQuery.isLoading);
    const retailData = useEurostatSeries(retailQuery.data?.data?.PL, [], retailQuery.isLoading);

    // Range filters
    const cpiFilter = useRangeFilter(cpiData);
    const unempFilter = useRangeFilter(unempData);
    const industrialFilter = useRangeFilter(industrialData);
    const retailFilter = useRangeFilter(retailData);
    const gdpBar = useActiveBar();

    // PL vs EU comparison table
    const euComparison = useMemo(() => {
        const plCpi = plEuCpi.data?.data?.PL;
        const euCpi = plEuCpi.data?.data?.EU27_2020;
        const plUnemp = plEuUnemp.data?.data?.PL;
        const euUnemp = plEuUnemp.data?.data?.EU27_2020;

        const lastVal = (arr: EurostatTimeSeries[] | undefined) =>
            arr && arr.length > 0 ? arr[arr.length - 1].value ?? 0 : 0;

        return [
            { indicator: 'CPI YoY', pl: lastVal(plCpi), eu: lastVal(euCpi), unit: '%' },
            { indicator: 'Bezrobocie', pl: lastVal(plUnemp), eu: lastVal(euUnemp), unit: '%' },
            { indicator: 'PKB YoY', pl: getLastValue(gdpData), eu: 0.9, unit: '%' },
            { indicator: 'Dług/PKB', pl: 49.8, eu: 81.7, unit: '%' },
            { indicator: 'Deficyt/PKB', pl: -5.1, eu: -3.0, unit: '%' },
            { indicator: 'Stopa ref.', pl: 4.00, eu: 2.65, unit: '%' },
        ];
    }, [plEuCpi.data, plEuUnemp.data, gdpData]);

    const anyLoading = cpiQuery.isLoading || unempQuery.isLoading || gdpQuery.isLoading;
    const isLive = !cpiQuery.isLoading && !!cpiQuery.data?.data?.PL?.length;

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">MACRO DATA</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">SRC: EUROSTAT · GUS · S&P GLOBAL</span>
                <span className="text-bb-border">│</span>
                <DataBadge isLive={isLive} updated={cpiQuery.data?.updated} />
            </div>

            <div className="p-2 space-y-2">
                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-6 gap-2">
                    {[
                        { label: 'CPI YoY', value: getLastValue(cpiData), change: getChange(cpiData), color: '#FBBF24', suffix: '%' },
                        { label: 'Bezrobocie', value: getLastValue(unempData), change: getChange(unempData), color: '#3B82F6', suffix: '%' },
                        { label: 'PKB YoY', value: getLastValue(gdpData), change: getChange(gdpData), color: '#22C55E', suffix: '%', prefix: '+' },
                        { label: 'Prod. przem.', value: industrialData.length > 0 ? getLastValue(industrialData) : 0, change: industrialData.length > 1 ? getChange(industrialData) : 0, color: '#A855F7', suffix: '%' },
                        { label: 'Sprzedaż det.', value: retailData.length > 0 ? getLastValue(retailData) : 0, change: retailData.length > 1 ? getChange(retailData) : 0, color: '#06B6D4', suffix: '%' },
                        { label: 'Stopa ref.', value: 4.00, change: 0, color: '#FF6B00', suffix: '%' },
                    ].map((item, i) => (
                        <div key={i} className="bb-panel" style={{ padding: '8px 10px' }}>
                            <div className="text-[9px] text-bb-muted uppercase mb-0.5">{item.label}</div>
                            {anyLoading ? (
                                <div className="animate-pulse bg-bb-border/30 h-5 w-16 rounded" />
                            ) : (
                                <>
                                    <div className="text-base font-mono font-bold" style={{ color: item.color }}>
                                        {item.prefix && item.value > 0 ? item.prefix : ''}{item.value.toFixed(1)}{item.suffix}
                                    </div>
                                    <span className={`text-[10px] font-mono ${getChangeColor(item.change)}`}>
                                        {getChangeArrow(item.change)} {formatPercent(Math.abs(item.change))} pp
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* GDP — Click to highlight */}
                <ChartPanel title="PKB — ZMIANA ROCZNA (YOY)" source="Eurostat" date={gdpQuery.data?.updated?.split('T')[0]}>
                    {gdpQuery.isLoading ? <SkeletonChart /> : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={gdpData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                onClick={(e) => {
                                    if (e?.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                                        gdpBar.setActiveIndex(gdpBar.activeIndex === e.activeTooltipIndex ? null : e.activeTooltipIndex);
                                    }
                                }}
                            >
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <ReferenceLine y={0} stroke="#64748B" />
                                <Bar dataKey="value" fill="#22C55E" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* CPI with range */}
                    <ChartPanel
                        title="INFLACJA HICP (YOY) Z CELEM NBP"
                        source="Eurostat HICP"
                        date={cpiQuery.data?.updated?.split('T')[0]}
                        rangeButtons={<RangeButtons active={cpiFilter.range} onChange={cpiFilter.setRange} />}
                    >
                        {cpiQuery.isLoading ? <SkeletonChart /> : (
                            <ResponsiveContainer width="100%" height={250}>
                                <ComposedChart data={cpiFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid {...GRID} />
                                    <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                    <YAxis tick={TICK} stroke="#1E293B" unit="%" domain={[0, 'auto']} />
                                    <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                    <ReferenceLine y={2.5} stroke="#FBBF24" strokeDasharray="5 5" label={{ value: 'Cel 2.5%', fill: '#FBBF24', fontSize: 10, position: 'right' }} />
                                    <ReferenceLine y={1.5} stroke="#64748B" strokeDasharray="3 3" />
                                    <ReferenceLine y={3.5} stroke="#64748B" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} name="CPI" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPanel>

                    {/* Unemployment with range */}
                    <ChartPanel
                        title="STOPA BEZROBOCIA (%, EUROSTAT SA)"
                        source="Eurostat"
                        date={unempQuery.data?.updated?.split('T')[0]}
                        rangeButtons={<RangeButtons active={unempFilter.range} onChange={unempFilter.setRange} />}
                    >
                        {unempQuery.isLoading ? <SkeletonChart /> : (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={unempFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="unempGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid {...GRID} />
                                    <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                    <YAxis tick={TICK} stroke="#1E293B" unit="%" domain={['auto', 'auto']} />
                                    <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                    <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#unempGrad)" dot={{ fill: '#3B82F6', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} name="Bezrobocie" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </ChartPanel>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* Industrial Production with range */}
                    <ChartPanel
                        title="PRODUKCJA PRZEMYSŁOWA (YOY)"
                        source="Eurostat"
                        date={industrialQuery.data?.updated?.split('T')[0]}
                        rangeButtons={<RangeButtons active={industrialFilter.range} onChange={industrialFilter.setRange} />}
                    >
                        {industrialQuery.isLoading ? <SkeletonChart /> : (
                            industrialData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={industrialFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid {...GRID} />
                                        <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                        <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                        <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                        <ReferenceLine y={0} stroke="#64748B" strokeWidth={1} />
                                        <Bar dataKey="value" fill="#A855F7" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={CHART_ANIM.duration} name="Produkcja" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <div className="text-center text-bb-muted py-12 text-sm">Brak danych z Eurostat</div>
                        )}
                    </ChartPanel>

                    {/* Retail Sales with range */}
                    <ChartPanel
                        title="SPRZEDAŻ DETALICZNA (YOY)"
                        source="Eurostat"
                        date={retailQuery.data?.updated?.split('T')[0]}
                        rangeButtons={<RangeButtons active={retailFilter.range} onChange={retailFilter.setRange} />}
                    >
                        {retailQuery.isLoading ? <SkeletonChart /> : (
                            retailData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={retailFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid {...GRID} />
                                        <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                        <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                        <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                        <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} fill="url(#retailGrad)" dot={{ fill: '#06B6D4', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} name="Sprzedaż" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <div className="text-center text-bb-muted py-12 text-sm">Brak danych z Eurostat</div>
                        )}
                    </ChartPanel>
                </div>

                {/* PL vs EU Comparison */}
                <ChartPanel title="POLSKA VS UNIA EUROPEJSKA" source="Eurostat" date={plEuCpi.data?.updated?.split('T')[0]}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={euComparison} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                            <CartesianGrid {...GRID} />
                            <XAxis type="number" tick={TICK} stroke="#1E293B" />
                            <YAxis type="category" dataKey="indicator" tick={{ fill: '#E2E8F0', fontSize: 11 }} stroke="#1E293B" width={90} />
                            <Tooltip content={<BloombergTooltip formatter={(v, name) => `${v.toFixed(1)}% (${name === 'pl' ? '🇵🇱' : '🇪🇺'})`} />} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                            <Bar dataKey="pl" name="🇵🇱 Polska" fill="#FF6B00" radius={[0, 2, 2, 0]} barSize={14} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            <Bar dataKey="eu" name="🇪🇺 UE" fill="#3B82F6" radius={[0, 2, 2, 0]} barSize={14} isAnimationActive animationDuration={CHART_ANIM.duration} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
        </div>
    );
}
