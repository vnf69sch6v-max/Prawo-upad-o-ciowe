'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ResponsiveContainer, XAxis, YAxis, Tooltip,
    CartesianGrid, LineChart, Line, ReferenceLine, Legend,
    ComposedChart, Bar
} from 'recharts';
import { useIndustrialProduction, useConstruction, useGDPQuarterly, useTradeData } from '@/lib/hooks';
import {
    buildNowcastResult, GDP_WEIGHTS, GDP_CONSENSUS,
    type NowcastResult, type TimeSeriesPoint, type NowcastComponent
} from '@/lib/calculations/gdp-nowcast';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#111827', border: '1px solid #1E293B',
        borderRadius: '8px', color: '#E2E8F0', fontSize: '12px',
    },
};

function extractTimeSeries(eurostatData: unknown): TimeSeriesPoint[] {
    const d = eurostatData as { data?: Record<string, Array<{ date: string; value: number | null }>> };
    const plData = d?.data?.PL ?? [];
    return plData
        .filter((p) => p.value !== null)
        .map((p) => ({ date: p.date, value: p.value as number }));
}

/** Compute trade balance YoY% from exports and imports levels */
function computeTradeBalance(exports: TimeSeriesPoint[], imports: TimeSeriesPoint[]): TimeSeriesPoint[] {
    // Net exports for each month (mln EUR)
    const netByDate: Record<string, number> = {};
    for (const e of exports) {
        const imp = imports.find(i => i.date === e.date);
        if (imp) netByDate[e.date] = e.value - imp.value;
    }

    // YoY change in trade balance (as % of avg export)
    const sorted = Object.entries(netByDate).sort(([a], [b]) => a.localeCompare(b));
    const result: TimeSeriesPoint[] = [];
    for (const [date, net] of sorted) {
        const [y, m] = date.split('-');
        const prevDate = `${parseInt(y) - 1}-${m}`;
        const prevNet = netByDate[prevDate];
        if (prevNet !== undefined) {
            // Express change as percentage proxy
            // Improvement in trade balance → positive contribution to GDP
            const avgExport = exports.find(e => e.date === date)?.value ?? 1;
            const change = ((net - prevNet) / Math.abs(avgExport)) * 100;
            result.push({ date, value: +change.toFixed(1) });
        }
    }
    return result;
}

function ConfidenceBars({ level }: { level: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-2 h-3 rounded-sm ${i <= level ? 'bg-bb-accent' : 'bg-bb-border'}`} />
            ))}
        </div>
    );
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
    if (trend === 'up') return <span className="text-green-400">▲</span>;
    if (trend === 'down') return <span className="text-red-400">▼</span>;
    return <span className="text-bb-muted">●</span>;
}

// ═══════════════════════════════════════════════════════════════
// GUS HOOKS
// ═══════════════════════════════════════════════════════════════

interface GUSMonthlyData {
    retail: Array<{ date: string; value: number; raw: number }>;
    wages: Array<{ date: string; value: number; raw: number }>;
    source: string;
}

function useGUSMonthly(): { retail: TimeSeriesPoint[]; wages: TimeSeriesPoint[]; isLoading: boolean } {
    const [retail, setRetail] = useState<TimeSeriesPoint[]>([]);
    const [wages, setWages] = useState<TimeSeriesPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/gus-monthly?years=4');
                if (res.ok) {
                    const json: GUSMonthlyData = await res.json();
                    setRetail(json.retail.map(r => ({ date: r.date, value: r.value })));
                    setWages(json.wages.map(w => ({ date: w.date, value: w.value })));
                }
            } catch (e) {
                console.error('GUS monthly error:', e);
            }
            setIsLoading(false);
        }
        load();
    }, []);

    return { retail, wages, isLoading };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT CARD
// ═══════════════════════════════════════════════════════════════

const COMP_COLORS: Record<string, string> = {
    industrial: '#3B82F6',
    retail: '#22C55E',
    construction: '#FBBF24',
    wages: '#A78BFA',
    trade: '#F97316',
};

function ComponentCard({ comp }: { comp: NowcastComponent }) {
    const color = COMP_COLORS[comp.name] ?? '#94A3B8';

    return (
        <div className="data-card">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-bb-muted font-semibold uppercase tracking-wider">{comp.label}</span>
                <TrendArrow trend={comp.trend} />
            </div>
            <div className="text-2xl font-mono font-bold" style={{ color }}>
                {comp.value !== null ? `${comp.value >= 0 ? '+' : ''}${comp.value.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="mt-2 flex justify-between text-[10px]">
                <span className="text-bb-muted">Waga: {(comp.weight * 100).toFixed(0)}%</span>
                <span className="text-bb-accent">
                    {comp.contribution >= 0 ? '+' : ''}{comp.contribution.toFixed(2)}pp
                </span>
            </div>
            <div className="text-[9px] text-bb-muted mt-1">
                {comp.monthsAvailable}/3 mies. · {comp.source}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE — GUS retail+wages + Eurostat industrial/construction/trade
// ═══════════════════════════════════════════════════════════════

export default function NowcastPage() {
    // GUS BDL — retail + wages
    const gus = useGUSMonthly();

    // Eurostat — industrial, construction, exports, imports, official GDP
    const industrialQ = useIndustrialProduction('PL');
    const constructionQ = useConstruction('PL');
    const exportsQ = useTradeData('exports');
    const importsQ = useTradeData('imports');
    const gdpOfficialQ = useGDPQuarterly('PL');

    const isLoading = gus.isLoading || industrialQ.isLoading || constructionQ.isLoading || exportsQ.isLoading;

    // Build nowcast result
    const result: NowcastResult | null = useMemo(() => {
        if (isLoading) return null;

        const industrial = extractTimeSeries(industrialQ.data);
        const retail = gus.retail;
        const construction = extractTimeSeries(constructionQ.data);
        const wages = gus.wages;
        const exportsTS = extractTimeSeries(exportsQ.data);
        const importsTS = extractTimeSeries(importsQ.data);
        const trade = computeTradeBalance(exportsTS, importsTS);
        const gdpOfficial = extractTimeSeries(gdpOfficialQ.data);

        if (industrial.length === 0 && retail.length === 0 && wages.length === 0) return null;

        return buildNowcastResult(industrial, retail, construction, wages, trade, gdpOfficial);
    }, [isLoading, industrialQ.data, gus.retail, gus.wages, constructionQ.data, exportsQ.data, importsQ.data, gdpOfficialQ.data]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bb-accent" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-bb-muted text-sm">Brak danych miesięcznych do nowcastu</div>
            </div>
        );
    }

    const { current, previous, backtest, mae, consensus } = result;

    // Chart data
    const chartData = [
        ...backtest.map(b => ({
            quarter: b.quarter,
            official: b.official,
            nowcast: b.nowcast !== 0 ? b.nowcast : null,
        })),
        { quarter: current.quarter, official: null as number | null, nowcast: current.nowcast },
    ];

    // Monthly sparkline — merge all sources
    const allDates = new Set<string>();
    const industrialTS = extractTimeSeries(industrialQ.data);
    const constructionTS = extractTimeSeries(constructionQ.data);
    const exportsTS = extractTimeSeries(exportsQ.data);
    const importsTS = extractTimeSeries(importsQ.data);
    const tradeTS = computeTradeBalance(exportsTS, importsTS);

    industrialTS.forEach(d => allDates.add(d.date));
    gus.retail.forEach(d => allDates.add(d.date));
    gus.wages.forEach(d => allDates.add(d.date));

    const sortedDates = [...allDates].sort().slice(-18);
    const monthlyChart = sortedDates.map(date => ({
        date: date.slice(2),
        industrial: industrialTS.find(d => d.date === date)?.value ?? null,
        retail: gus.retail.find(d => d.date === date)?.value ?? null,
        wages: gus.wages.find(d => d.date === date)?.value ?? null,
        trade: tradeTS.find(d => d.date === date)?.value ?? null,
    }));

    return (
        <div className="min-h-screen">
            {/* Header bar */}
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">GDP NOWCAST</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">
                    5-FACTOR MODEL · GUS BDL + EUROSTAT
                </span>
            </div>

            <div className="p-2 space-y-2">
                {/* ─── HEADER CARDS ─── */}
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    <div className="data-card col-span-2 xl:col-span-1">
                        <div className="text-xs text-bb-accent font-semibold uppercase tracking-wider mb-1">
                            {current.quarter} NOWCAST
                        </div>
                        <div className="text-3xl font-mono font-bold text-green-400">
                            {current.nowcast > 0 ? '+' : ''}{current.nowcast.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-bb-muted mt-1">
                            PKB YoY szacunek · {result.modelStatus}
                        </div>
                    </div>

                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">VS KONSENSUS</div>
                        <div className="text-2xl font-mono font-bold text-bb-text">
                            {consensus.value.toFixed(1)}%
                        </div>
                        <div className={`text-xs mt-1 ${current.nowcast > consensus.value ? 'text-green-400' : 'text-red-400'}`}>
                            {current.nowcast > consensus.value ? '▲' : '▼'} {(current.nowcast - consensus.value) >= 0 ? '+' : ''}{(current.nowcast - consensus.value).toFixed(1)}pp
                        </div>
                        <div className="text-[9px] text-bb-muted">{consensus.source} {consensus.date}</div>
                    </div>

                    {previous && (
                        <div className="data-card">
                            <div className="text-xs text-bb-muted mb-1">{previous.quarter}</div>
                            <div className="text-2xl font-mono font-bold text-bb-text">
                                {previous.nowcast > 0 ? '+' : ''}{previous.nowcast.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-bb-muted mt-1">Poprzedni kwartał</div>
                        </div>
                    )}

                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">CONFIDENCE</div>
                        <ConfidenceBars level={current.confidence} />
                        <div className="text-[10px] text-bb-muted mt-2">
                            Coverage: {Math.round(current.coverage * 3)}/3 mies.
                        </div>
                    </div>

                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">MAE (BACKTEST)</div>
                        <div className="text-2xl font-mono font-bold text-bb-yellow">
                            {mae !== null ? `${mae.toFixed(1)}pp` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-bb-muted mt-1">Średni błąd absolutny</div>
                    </div>
                </div>

                {/* ─── 5 COMPONENT CARDS ─── */}
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    {current.components.map(comp => (
                        <ComponentCard key={comp.name} comp={comp} />
                    ))}
                </div>

                {/* ─── CHARTS ROW ─── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            📊 Nowcast vs oficjalny PKB (kwartalne)
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="quarter" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`]} />
                                <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
                                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                                <Bar dataKey="official" fill="#22C55E" name="Oficjalny PKB" radius={[4, 4, 0, 0]} opacity={0.8} />
                                <Line type="monotone" dataKey="nowcast" stroke="#FF6B00" strokeWidth={3} name="Nowcast" dot={{ fill: '#FF6B00', r: 5 }} connectNulls />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <div className="text-[10px] text-bb-muted mt-1 flex justify-between px-2">
                            <span>🟢 Oficjalny GUS · 🟠 Nasz model (5 wskaźników)</span>
                            <span>{mae !== null ? `MAE = ${mae.toFixed(1)}pp` : ''}</span>
                        </div>
                    </div>

                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            📈 Wskaźniki miesięczne (YoY%) — ostatnie 18M
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyChart} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`]} />
                                <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
                                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="industrial" stroke="#3B82F6" strokeWidth={2} name="Przemysł" dot={false} connectNulls />
                                <Line type="monotone" dataKey="retail" stroke="#22C55E" strokeWidth={2} name="Retail (GUS)" dot={false} connectNulls />
                                <Line type="monotone" dataKey="wages" stroke="#A78BFA" strokeWidth={2} name="Płace (GUS)" dot={false} connectNulls />
                                <Line type="monotone" dataKey="trade" stroke="#F97316" strokeWidth={1.5} name="Eksport netto" dot={false} connectNulls strokeDasharray="5 3" />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="text-[10px] text-bb-muted mt-1 px-2">
                            Źródło: GUS BDL (retail, płace) · Eurostat (industrial, construction, trade)
                        </div>
                    </div>
                </div>

                {/* ─── BACKTEST TABLE ─── */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        🔬 Backtest — nowcast vs oficjalny PKB
                    </h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-bb-border">
                                <th className="text-left py-2 px-3 text-xs text-bb-muted">Kwartał</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Nowcast</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Oficjalny</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Błąd</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backtest.map((row, i) => (
                                <tr key={i} className="border-b border-bb-border/30">
                                    <td className="py-2 px-3 font-mono text-bb-text">{row.quarter}</td>
                                    <td className="py-2 px-3 text-right font-mono text-bb-accent">
                                        {row.nowcast !== 0 ? `${row.nowcast > 0 ? '+' : ''}${row.nowcast.toFixed(1)}%` : '—'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-green-400">
                                        {row.official !== null ? `${row.official > 0 ? '+' : ''}${row.official.toFixed(1)}%` : '—'}
                                    </td>
                                    <td className={`py-2 px-3 text-right font-mono ${row.error !== null ? (Math.abs(row.error) <= 1 ? 'text-green-400' : Math.abs(row.error) <= 2 ? 'text-yellow-400' : 'text-red-400') : 'text-bb-muted'}`}>
                                        {row.error !== null ? `${row.error > 0 ? '+' : ''}${row.error.toFixed(1)}pp` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-bb-border">
                                <td className="py-2 px-3 font-semibold text-bb-accent">MAE</td>
                                <td></td><td></td>
                                <td className="py-2 px-3 text-right font-mono font-semibold text-bb-yellow">
                                    {mae !== null ? `${mae.toFixed(1)}pp` : '—'}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* ─── METHODOLOGY ─── */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        📋 Metodologia — 5-Factor GDP Nowcast
                    </h3>
                    <div className="text-xs text-bb-muted space-y-2">
                        <p>
                            <strong className="text-bb-text">Model:</strong> Ważona średnia 5 miesięcznych wskaźników (strona podażowa + popytowa PKB).
                        </p>
                        <p><strong className="text-bb-text">Wagi (rachunki narodowe GUS 2024):</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><span style={{color:'#3B82F6'}}>■</span> Produkcja przemysłowa — {(GDP_WEIGHTS.industrial * 100).toFixed(0)}% (Eurostat sts_inpr_m)</li>
                            <li><span style={{color:'#22C55E'}}>■</span> Sprzedaż detaliczna — {(GDP_WEIGHTS.retail * 100).toFixed(0)}% (GUS BDL P3860)</li>
                            <li><span style={{color:'#FBBF24'}}>■</span> Budownictwo — {(GDP_WEIGHTS.construction * 100).toFixed(0)}% (Eurostat sts_copr_m)</li>
                            <li><span style={{color:'#A78BFA'}}>■</span> Płace nominalne — {(GDP_WEIGHTS.wages * 100).toFixed(0)}% (GUS BDL P2687, YoY)</li>
                            <li><span style={{color:'#F97316'}}>■</span> Eksport netto — {(GDP_WEIGHTS.trade * 100).toFixed(0)}% (Eurostat BOP, △saldo)</li>
                            <li>Korekta stała: +{GDP_WEIGHTS.constant}pp (rolnictwo, administracja)</li>
                        </ul>
                        <p>
                            <strong className="text-bb-text">Formuła:</strong> GDP_nowcast = Σ(wᵢ × indicator_YoY_i) + α
                        </p>
                        <p>
                            <strong className="text-bb-text">Ograniczenia:</strong> Retail ≠ pełne usługi. Wagi stałe.
                            Brak korekty sezonowej dla GUS (Eurostat: calendar adjusted).
                        </p>
                        <p>
                            <strong className="text-bb-text">Konsensus:</strong> Bloomberg {GDP_CONSENSUS['2026']?.value}% ({GDP_CONSENSUS['2026']?.date}).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
