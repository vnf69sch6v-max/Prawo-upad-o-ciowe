'use client';

import { useMemo } from 'react';
import { formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    ComposedChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { ChartPanel, RangeButtons, BloombergTooltip, BloombergCursor, useRangeFilter, CHART_ANIM } from '@/components/ChartUtils';
import { useTradeData, useCurrentAccount, EurostatTimeSeries } from '@/lib/hooks';

// ===== Static data (no API available) =====

const TOP_PARTNERS = [
    { country: 'Niemcy', exportShare: 27.1, importShare: 20.8, flag: '🇩🇪' },
    { country: 'Czechy', exportShare: 5.8, importShare: 3.6, flag: '🇨🇿' },
    { country: 'Francja', exportShare: 5.7, importShare: 3.8, flag: '🇫🇷' },
    { country: 'Wielka Brytania', exportShare: 5.4, importShare: 2.1, flag: '🇬🇧' },
    { country: 'Włochy', exportShare: 4.3, importShare: 4.5, flag: '🇮🇹' },
    { country: 'Niderlandy', exportShare: 4.2, importShare: 3.4, flag: '🇳🇱' },
    { country: 'Chiny', exportShare: 1.4, importShare: 12.3, flag: '🇨🇳' },
    { country: 'USA', exportShare: 3.1, importShare: 3.2, flag: '🇺🇸' },
];

const FX_RESERVES = { value: 215, unit: 'mld EUR', date: 'XII.2025', source: 'NBP' };

// ===== Helpers =====

const GRID = { strokeDasharray: '3 3', stroke: '#1E293B' };
const TICK = { fill: '#64748B', fontSize: 10 };

function formatDate(d: string): string {
    const parts = d.split('-');
    return `${parts[1]}.${parts[0].slice(2)}`;
}

function formatMln(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)} mld`;
    return `${v.toFixed(0)} mln`;
}

function DataBadge({ isLive, updated }: { isLive: boolean; updated?: string }) {
    return (
        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-sm font-mono ${isLive ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
            }`}>
            {isLive ? '● LIVE' : '○ STATIC'}
            {updated && ` · ${updated.split('T')[0]}`}
        </span>
    );
}

function SkeletonChart({ height = 250 }: { height?: number }) {
    return <div className="animate-pulse" style={{ height }}><div className="bg-bb-border/20 rounded h-full" /></div>;
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="text-center py-8 text-bb-muted text-sm">
            <div className="text-yellow-500 mb-1">⚠️</div>
            {message}
        </div>
    );
}

// ===== Trade Balance Section =====

function TradeBalanceSection() {
    const exportsQuery = useTradeData('exports');
    const importsQuery = useTradeData('imports');

    const isLoading = exportsQuery.isLoading || importsQuery.isLoading;
    const isLive = !isLoading && (exportsQuery.data?.data?.PL?.length ?? 0) > 0;

    const chartData = useMemo(() => {
        const exp = exportsQuery.data?.data?.PL || [];
        const imp = importsQuery.data?.data?.PL || [];
        if (exp.length === 0) return [];

        // Merge by date
        const impMap = new Map(imp.map(d => [d.date, d.value]));
        return exp
            .filter(d => d.value !== null)
            .map(d => {
                const expVal = d.value as number;
                const impVal = (impMap.get(d.date) as number) || 0;
                return {
                    date: formatDate(d.date),
                    rawDate: d.date,
                    export: expVal,
                    import: impVal,
                    balance: expVal - impVal,
                };
            });
    }, [exportsQuery.data, importsQuery.data]);

    const filter = useRangeFilter(chartData);

    // Totals from last 12 months
    const last12 = chartData.slice(-12);
    const totalExp = last12.reduce((s, d) => s + d.export, 0);
    const totalImp = last12.reduce((s, d) => s + d.import, 0);
    const totalBal = totalExp - totalImp;

    return (
        <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                <div className="bb-panel" style={{ padding: '8px 10px' }}>
                    <div className="text-[9px] text-bb-muted uppercase mb-0.5">Eksport (12m)</div>
                    {isLoading ? <div className="animate-pulse bg-bb-border/30 h-5 w-20 rounded" /> : (
                        <div className="text-base font-mono font-bold text-green-400">{formatMln(totalExp)} EUR</div>
                    )}
                </div>
                <div className="bb-panel" style={{ padding: '8px 10px' }}>
                    <div className="text-[9px] text-bb-muted uppercase mb-0.5">Import (12m)</div>
                    {isLoading ? <div className="animate-pulse bg-bb-border/30 h-5 w-20 rounded" /> : (
                        <div className="text-base font-mono font-bold text-red-400">{formatMln(totalImp)} EUR</div>
                    )}
                </div>
                <div className="bb-panel" style={{ padding: '8px 10px' }}>
                    <div className="text-[9px] text-bb-muted uppercase mb-0.5">Saldo (12m)</div>
                    {isLoading ? <div className="animate-pulse bg-bb-border/30 h-5 w-20 rounded" /> : (
                        <div className={`text-base font-mono font-bold ${totalBal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalBal >= 0 ? '+' : ''}{formatMln(totalBal)} EUR
                        </div>
                    )}
                </div>
                <div className="bb-panel" style={{ padding: '8px 10px' }}>
                    <div className="text-[9px] text-bb-muted uppercase mb-0.5">Rezerwy walutowe</div>
                    <div className="text-base font-mono font-bold text-bb-accent">{FX_RESERVES.value} {FX_RESERVES.unit}</div>
                    <span className="text-[9px] text-bb-muted">NBP · {FX_RESERVES.date}</span>
                </div>
            </div>

            {/* Trade balance chart */}
            <ChartPanel
                title="BILANS HANDLOWY — EKSPORT VS IMPORT (MLN EUR)"
                source="Eurostat BoP"
                date={exportsQuery.data?.updated?.split('T')[0]}
                rangeButtons={<RangeButtons active={filter.range} onChange={filter.setRange} />}
            >
                {isLoading ? <SkeletonChart height={300} /> : (
                    chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={filter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" tickFormatter={v => formatMln(v)} />
                                <Tooltip content={<BloombergTooltip formatter={(v) => `${formatMln(v)} EUR`} />} cursor={<BloombergCursor height={300} />} />
                                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                                <Bar dataKey="export" name="Eksport" fill="#22C55E" radius={[2, 2, 0, 0]} opacity={0.8} isAnimationActive animationDuration={CHART_ANIM.duration} />
                                <Bar dataKey="import" name="Import" fill="#EF4444" radius={[2, 2, 0, 0]} opacity={0.7} isAnimationActive animationDuration={CHART_ANIM.duration} />
                                <Line type="monotone" dataKey="balance" name="Saldo" stroke="#FBBF24" strokeWidth={2} dot={false} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : <ErrorState message="Dane handlu zagranicznego niedostępne z Eurostat" />
                )}
            </ChartPanel>
        </>
    );
}

// ===== Current Account Section =====

function CurrentAccountSection() {
    const caQuery = useCurrentAccount();
    const isLoading = caQuery.isLoading;
    const isLive = !isLoading && (caQuery.data?.data?.PL?.length ?? 0) > 0;

    const chartData = useMemo(() => {
        const raw = caQuery.data?.data?.PL || [];
        return raw
            .filter(d => d.value !== null)
            .map(d => ({
                date: formatDate(d.date),
                rawDate: d.date,
                value: d.value as number,
            }));
    }, [caQuery.data]);

    const filter = useRangeFilter(chartData);
    const lastValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

    return (
        <ChartPanel
            title="RACHUNEK BIEŻĄCY (MLN EUR, MIESIĘCZNIE)"
            source="Eurostat BoP"
            date={caQuery.data?.updated?.split('T')[0]}
            rangeButtons={<RangeButtons active={filter.range} onChange={filter.setRange} />}
        >
            {isLoading ? <SkeletonChart /> : (
                chartData.length > 0 ? (
                    <>
                        <div className="flex items-center gap-3 mb-2 px-1">
                            <span className={`text-lg font-mono font-bold ${lastValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {lastValue >= 0 ? '+' : ''}{formatMln(lastValue)} EUR
                            </span>
                            <DataBadge isLive={isLive} updated={caQuery.data?.updated} />
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={filter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" tickFormatter={v => formatMln(v)} />
                                <Tooltip content={<BloombergTooltip formatter={(v) => `${formatMln(v)} EUR`} />} cursor={<BloombergCursor height={250} />} />
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#caGrad)" isAnimationActive animationDuration={CHART_ANIM.duration} name="CA Balance" />
                                {/* Zero reference line */}
                                <Line type="monotone" dataKey={() => 0} stroke="#64748B" strokeDasharray="3 3" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </>
                ) : <ErrorState message="Dane rachunku bieżącego niedostępne z Eurostat" />
            )}
        </ChartPanel>
    );
}

// ===== Top Partners Section (static) =====

function TopPartnersSection() {
    return (
        <ChartPanel title="TOP PARTNERZY HANDLOWI (% UDZIAŁU, 2024)" source="GUS/Eurostat" date="2024">
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={TOP_PARTNERS} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid {...GRID} />
                    <XAxis type="number" tick={TICK} stroke="#1E293B" unit="%" />
                    <YAxis type="category" dataKey="country" tick={{ fill: '#E2E8F0', fontSize: 11 }} stroke="#1E293B" width={75}
                        tickFormatter={(v, i) => `${TOP_PARTNERS[i]?.flag || ''} ${v}`}
                    />
                    <Tooltip content={<BloombergTooltip formatter={(v, name) => `${v.toFixed(1)}% (${name === 'exportShare' ? 'eksport' : 'import'})`} />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                    <Bar dataKey="exportShare" name="Eksport %" fill="#22C55E" radius={[0, 2, 2, 0]} barSize={12} isAnimationActive animationDuration={CHART_ANIM.duration} />
                    <Bar dataKey="importShare" name="Import %" fill="#EF4444" radius={[0, 2, 2, 0]} barSize={12} opacity={0.7} isAnimationActive animationDuration={CHART_ANIM.duration} />
                </BarChart>
            </ResponsiveContainer>
            <div className="text-[9px] text-yellow-500/70 px-1 mt-1">○ STATIC · dane roczne 2024</div>
        </ChartPanel>
    );
}

// ===== Main Page =====

export default function TradePage() {
    const exportsQuery = useTradeData('exports');
    const isLive = !exportsQuery.isLoading && (exportsQuery.data?.data?.PL?.length ?? 0) > 0;

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">TRADE & BOP</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">SRC: EUROSTAT BoP · GUS · NBP</span>
                <span className="text-bb-border">│</span>
                <DataBadge isLive={isLive} updated={exportsQuery.data?.updated} />
            </div>

            <div className="p-2 space-y-2">
                <TradeBalanceSection />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    <CurrentAccountSection />
                    <TopPartnersSection />
                </div>
            </div>
        </div>
    );
}
