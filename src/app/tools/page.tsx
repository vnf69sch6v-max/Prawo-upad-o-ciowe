'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
    ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { ChartPanel, BloombergTooltip, BloombergCursor, CHART_ANIM } from '@/components/ChartUtils';
import {
    useNBPInterestRates, useWibor, useYieldCurve,
    useInflationMonthly, useGDPQuarterly, useIndustrialProduction, useRetailSales,
    useNBPCurrencyHistory, usePLvsEU,
} from '@/lib/hooks';
import {
    buildRatePath, projectWIBOR, calculateMonthlyPayment, projectYieldCurve,
    RPP_DATES_2026, PRESETS, WIBOR_SPREADS,
    type RateDecision, type MortgageParams
} from '@/lib/calculations/mortgage';
import { taylorRule, DEFAULT_TAYLOR, type TaylorParams } from '@/lib/calculations/taylor';
import { projectDebt, sensitivityAnalysis, findCrossing, FISCAL_DEFAULTS, INITIAL_DEBT, type FiscalParams } from '@/lib/calculations/fiscal';

// ===== Shared UI =====

const GRID = { strokeDasharray: '3 3', stroke: '#1E293B' };
const TICK = { fill: '#64748B', fontSize: 10 };

const TABS = [
    { key: 'rates', label: 'RATE SIMULATOR' },
    { key: 'taylor', label: 'TAYLOR RULE' },
    { key: 'fiscal', label: 'FISCAL' },
    { key: 'leading', label: 'LEADING IND.' },
    { key: 'reer', label: 'REER' },
];

function Slider({ label, value, min, max, step, onChange, unit = '%', liveLabel }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; unit?: string; liveLabel?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-bb-muted w-32 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(+e.target.value)}
                className="flex-1 h-1 rounded-full accent-[#FF6B00] bg-bb-border cursor-pointer"
            />
            <span className="text-xs font-mono text-bb-accent w-20 text-right">
                {liveLabel ?? `${value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}${unit}`}
            </span>
        </div>
    );
}

function Disclaimer() {
    return (
        <div className="text-[9px] text-bb-muted px-2 py-1 border-t border-bb-border/30 mt-2">
            ⚠️ Narzędzie edukacyjne. Nie stanowi rekomendacji inwestycyjnej.
        </div>
    );
}

// ===== TOOL 1: Rate Path Simulator =====

function RateSimulator() {
    const { data: nbpRates } = useNBPInterestRates();
    const { data: wiborData } = useWibor();
    const yieldCurve = useYieldCurve();

    const currentRate = useMemo(() => {
        const ref = nbpRates?.rates?.find((r: { name: string }) => r.name === 'Stopa referencyjna');
        return ref?.value ?? 4.00;
    }, [nbpRates]);

    const [decisions, setDecisions] = useState<{ date: string; change: number }[]>(
        RPP_DATES_2026.map(date => ({ date, change: 0 }))
    );
    const [mortgage, setMortgage] = useState<MortgageParams>({
        principal: 400000, years: 25, margin: 2.0, wiborTenor: '3M',
    });

    const ratePath = useMemo(() => buildRatePath(currentRate, decisions), [currentRate, decisions]);
    const wiborPath = useMemo(() => projectWIBOR(ratePath, mortgage.wiborTenor), [ratePath, mortgage.wiborTenor]);

    const currentWibor = wiborData?.rates?.find((r: { tenor: string }) => r.tenor === mortgage.wiborTenor)?.wibor ?? 3.85;
    const currentPayment = calculateMonthlyPayment(mortgage, currentWibor);

    const projectedYields = useMemo(() => projectYieldCurve(
        ratePath, {
        y2: yieldCurve.curve[0]?.yield,
        y5: yieldCurve.curve[1]?.yield,
        y10: yieldCurve.curve[2]?.yield,
    }, currentRate
    ), [ratePath, yieldCurve.curve, currentRate]);

    const setPreset = useCallback((preset: 'dovish' | 'hawkish' | 'market') => {
        setDecisions(PRESETS[preset]);
    }, []);

    const setChange = useCallback((idx: number, change: number) => {
        setDecisions(prev => prev.map((d, i) => i === idx ? { ...d, change } : d));
    }, []);

    // Payment projection
    const paymentData = useMemo(() => {
        const items = [{ date: 'Dziś', wibor: currentWibor, rate: currentWibor + mortgage.margin, payment: currentPayment }];
        wiborPath.forEach(wp => {
            const totalRate = wp.wibor + mortgage.margin;
            items.push({
                date: wp.date.slice(5).replace('-', '.'),
                wibor: wp.wibor,
                rate: totalRate,
                payment: calculateMonthlyPayment(mortgage, wp.wibor),
            });
        });
        return items;
    }, [wiborPath, mortgage, currentWibor, currentPayment]);

    const yieldData = useMemo(() => [
        { tenor: '2Y', current: yieldCurve.curve[0]?.yield ?? 3.56, projected: projectedYields.y2 },
        { tenor: '5Y', current: yieldCurve.curve[1]?.yield ?? 4.30, projected: projectedYields.y5 },
        { tenor: '10Y', current: yieldCurve.curve[2]?.yield ?? 4.96, projected: projectedYields.y10 },
    ], [yieldCurve.curve, projectedYields]);

    return (
        <div className="space-y-2">
            {/* Rate Path Builder */}
            <ChartPanel title="ŚCIEŻKA STÓP RPP — SYMULATOR" source="Model">
                <div className="flex gap-2 px-2 mb-2">
                    {['dovish', 'hawkish', 'market'].map(p => (
                        <button key={p} onClick={() => setPreset(p as 'dovish' | 'hawkish' | 'market')}
                            className="text-[9px] px-2 py-1 rounded-sm bg-bb-border/30 hover:bg-bb-accent/20 text-bb-muted hover:text-bb-accent transition font-mono uppercase">
                            {p === 'dovish' ? '🕊 Gołębi' : p === 'hawkish' ? '🦅 Jastrzębi' : '📊 Rynkowy'}
                        </button>
                    ))}
                    <button onClick={() => setDecisions(RPP_DATES_2026.map(d => ({ date: d, change: 0 })))}
                        className="text-[9px] px-2 py-1 rounded-sm bg-bb-border/30 hover:bg-red-900/30 text-bb-muted hover:text-red-400 transition font-mono">
                        ✕ Reset
                    </button>
                </div>
                <div className="overflow-auto max-h-[280px]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-bb-surface">
                            <tr className="border-b border-bb-border text-[10px] text-bb-muted">
                                <th className="text-left py-1.5 px-2">Posiedzenie</th>
                                <th className="text-center py-1.5">Decyzja</th>
                                <th className="text-right py-1.5 px-2">Stopa po</th>
                            </tr>
                        </thead>
                        <tbody>
                            {decisions.map((d, i) => {
                                const rateAfter = ratePath[i]?.rate ?? currentRate;
                                return (
                                    <tr key={d.date} className="border-b border-bb-border/20">
                                        <td className="py-1 px-2 font-mono text-bb-text text-xs">{d.date.slice(5).replace('-', '.')}.{d.date.slice(2, 4)}</td>
                                        <td className="py-1 text-center">
                                            <div className="flex justify-center gap-1">
                                                {[-50, -25, 0, 25, 50].map(bp => (
                                                    <button key={bp} onClick={() => setChange(i, bp)}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono transition ${d.change === bp
                                                                ? bp < 0 ? 'bg-green-900/50 text-green-400' : bp > 0 ? 'bg-red-900/50 text-red-400' : 'bg-bb-accent/20 text-bb-accent'
                                                                : 'bg-bb-border/20 text-bb-muted hover:bg-bb-border/40'
                                                            }`}>
                                                        {bp > 0 ? `+${bp}` : bp === 0 ? '=' : bp}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className={`py-1 px-2 text-right font-mono font-bold text-xs ${rateAfter < currentRate ? 'text-green-400' : rateAfter > currentRate ? 'text-red-400' : 'text-bb-text'
                                            }`}>
                                            {rateAfter.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ChartPanel>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {/* Mortgage Calculator */}
                <ChartPanel title="WPŁYW NA RATĘ KREDYTU" source="Model">
                    <div className="space-y-2 px-2 mb-3">
                        <Slider label="Kwota kredytu" value={mortgage.principal} min={100000} max={2000000} step={50000}
                            onChange={v => setMortgage(p => ({ ...p, principal: v }))}
                            liveLabel={`${(mortgage.principal / 1000).toFixed(0)}k PLN`} />
                        <Slider label="Okres" value={mortgage.years} min={10} max={35} step={1}
                            onChange={v => setMortgage(p => ({ ...p, years: v }))} unit=" lat" />
                        <Slider label="Marża banku" value={mortgage.margin} min={1.0} max={4.0} step={0.1}
                            onChange={v => setMortgage(p => ({ ...p, margin: v }))} />
                        <div className="flex gap-2">
                            {(['3M', '6M'] as const).map(t => (
                                <button key={t} onClick={() => setMortgage(p => ({ ...p, wiborTenor: t }))}
                                    className={`text-[10px] px-3 py-1 rounded-sm font-mono ${mortgage.wiborTenor === t ? 'bg-bb-accent/20 text-bb-accent' : 'bg-bb-border/20 text-bb-muted'
                                        }`}>WIBOR {t}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={paymentData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                            <YAxis tick={TICK} stroke="#1E293B" tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                            <Tooltip content={<BloombergTooltip formatter={v => `${v.toFixed(0)} PLN`} />} cursor={<BloombergCursor height={200} />} />
                            <Area type="monotone" dataKey="payment" stroke="#22C55E" fill="url(#payGrad)" strokeWidth={2} isAnimationActive animationDuration={CHART_ANIM.duration} name="Rata" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between px-2 mt-1 text-xs font-mono">
                        <span className="text-bb-muted">Dziś: <span className="text-bb-text">{currentPayment.toFixed(0)} PLN</span></span>
                        {paymentData.length > 1 && (
                            <span className="text-green-400">
                                Za 12m: {paymentData[paymentData.length - 1].payment.toFixed(0)} PLN
                                ({paymentData[paymentData.length - 1].payment - currentPayment > 0 ? '+' : ''}{(paymentData[paymentData.length - 1].payment - currentPayment).toFixed(0)})
                            </span>
                        )}
                    </div>
                </ChartPanel>

                {/* Yield Curve Projection */}
                <ChartPanel title="YIELD CURVE — OBECNA VS PROJEKCJA" source="Model + Stooq">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={yieldData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="tenor" tick={{ fill: '#E2E8F0', fontSize: 12 }} stroke="#1E293B" />
                            <YAxis domain={['auto', 'auto']} tick={TICK} stroke="#1E293B" unit="%" />
                            <Tooltip content={<BloombergTooltip unit="%" />} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                            <Line type="monotone" dataKey="current" stroke="#E2E8F0" strokeWidth={2} dot={{ fill: '#E2E8F0', r: 5 }} name="Obecna" />
                            <Line type="monotone" dataKey="projected" stroke="#FF6B00" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#FF6B00', r: 5 }} name="Projekcja" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
            <Disclaimer />
        </div>
    );
}

// ===== TOOL 2: Taylor Rule =====

function TaylorRuleTool() {
    const cpiQuery = useInflationMonthly();
    const gdpQuery = useGDPQuarterly();
    const { data: nbpRates } = useNBPInterestRates();

    const currentRate = nbpRates?.rates?.find((r: { name: string }) => r.name === 'Stopa referencyjna')?.value ?? 4.00;
    const lastCPI = cpiQuery.data?.data?.PL?.slice(-1)[0]?.value ?? 2.5;
    const lastGDP = gdpQuery.data?.data?.PL?.slice(-1)[0]?.value ?? 3.6;

    const [params, setParams] = useState<TaylorParams>(DEFAULT_TAYLOR);

    const result = useMemo(() => taylorRule(params, lastCPI, lastGDP), [params, lastCPI, lastGDP]);
    const diff = +(currentRate - result.optimalRate).toFixed(2);
    const stance = diff > 0.25 ? 'RESTRYKCYJNA' : diff < -0.25 ? 'LUŹNA' : 'NEUTRALNA';
    const stanceColor = diff > 0.25 ? 'text-red-400' : diff < -0.25 ? 'text-green-400' : 'text-yellow-400';

    return (
        <div className="space-y-2">
            <ChartPanel title="TAYLOR RULE MONITOR" source="Model + Eurostat">
                <div className="grid grid-cols-3 gap-3 p-3">
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">Stopa Taylor</div>
                        <div className="text-2xl font-mono font-bold text-bb-accent">{result.optimalRate.toFixed(2)}%</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">Stopa RPP</div>
                        <div className="text-2xl font-mono font-bold text-bb-text">{currentRate.toFixed(2)}%</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">RPP vs Taylor</div>
                        <div className={`text-2xl font-mono font-bold ${stanceColor}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}pp
                        </div>
                        <div className={`text-[10px] font-mono ${stanceColor}`}>→ {stance}</div>
                    </div>
                </div>

                <div className="px-3 space-y-2">
                    <div className="text-xs text-bb-muted font-semibold mb-1">Parametry modelu:</div>
                    <Slider label="r* (neutralna)" value={params.neutralRate} min={0} max={4} step={0.1}
                        onChange={v => setParams(p => ({ ...p, neutralRate: v }))} />
                    <Slider label="Cel inflacyjny" value={params.inflationTarget} min={1} max={5} step={0.1}
                        onChange={v => setParams(p => ({ ...p, inflationTarget: v }))} />
                    <Slider label="PKB potencjalny" value={params.potentialGDP} min={1} max={5} step={0.1}
                        onChange={v => setParams(p => ({ ...p, potentialGDP: v }))} />
                </div>

                <div className="px-3 py-2 mt-2 border-t border-bb-border/30 grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-bb-muted">Inflacja (HICP): </span>
                        <span className="text-bb-accent font-mono">{lastCPI.toFixed(1)}%</span>
                        <span className="text-bb-muted"> → gap: </span>
                        <span className="font-mono">{result.inflationGap > 0 ? '+' : ''}{result.inflationGap.toFixed(1)}pp → wkład: {result.inflationContrib > 0 ? '+' : ''}{result.inflationContrib.toFixed(2)}%</span>
                    </div>
                    <div>
                        <span className="text-bb-muted">PKB YoY: </span>
                        <span className="text-bb-accent font-mono">{lastGDP.toFixed(1)}%</span>
                        <span className="text-bb-muted"> → gap: </span>
                        <span className="font-mono">{result.outputGap > 0 ? '+' : ''}{result.outputGap.toFixed(1)}pp → wkład: {result.outputContrib > 0 ? '+' : ''}{result.outputContrib.toFixed(2)}%</span>
                    </div>
                </div>

                <div className="px-3 py-2 mt-1 text-[10px] text-bb-muted border-t border-bb-border/30">
                    <details>
                        <summary className="cursor-pointer hover:text-bb-text">ℹ️ Metodologia</summary>
                        <div className="mt-1 space-y-1">
                            <div>r_taylor = r* + 0.5×(π - π*) + 0.5×(y - y*)</div>
                            <div>r* = stopa neutralna, π = inflacja HICP, π* = cel NBP, y = PKB YoY, y* = PKB potencjalny</div>
                        </div>
                    </details>
                </div>
            </ChartPanel>
            <Disclaimer />
        </div>
    );
}

// ===== TOOL 3: Fiscal Calculator =====

function FiscalTool() {
    const gdpQuery = useGDPQuarterly();
    const lastGDP = gdpQuery.data?.data?.PL?.slice(-1)[0]?.value ?? 3.6;

    const [params, setParams] = useState<FiscalParams>({ ...FISCAL_DEFAULTS, gdpGrowthReal: lastGDP });

    const sensitivity = useMemo(() => sensitivityAnalysis(params), [params]);
    const crossing60 = findCrossing(sensitivity.base, 60);

    // Merge scenarios for chart
    const chartData = useMemo(() => {
        return sensitivity.base.map((b, i) => ({
            year: b.year,
            base: b.debtToGdp,
            recession: sensitivity.recession[i]?.debtToGdp,
            consolidation: sensitivity.consolidation[i]?.debtToGdp,
        }));
    }, [sensitivity]);

    return (
        <div className="space-y-2">
            <ChartPanel title="KALKULATOR FISKALNY — TRAJEKTORIA DŁUGU" source="Model + Eurostat">
                <div className="px-3 space-y-2 mb-3">
                    <Slider label="PKB realny" value={params.gdpGrowthReal} min={-2} max={6} step={0.1}
                        onChange={v => setParams(p => ({ ...p, gdpGrowthReal: v }))} />
                    <Slider label="Inflacja (deflator)" value={params.inflation} min={0} max={8} step={0.1}
                        onChange={v => setParams(p => ({ ...p, inflation: v }))} />
                    <Slider label="Deficyt/PKB" value={params.deficitToGdp} min={-10} max={0} step={0.5}
                        onChange={v => setParams(p => ({ ...p, deficitToGdp: v }))} />
                    <Slider label="Śr. oprocentowanie" value={params.avgInterestRate} min={1} max={8} step={0.1}
                        onChange={v => setParams(p => ({ ...p, avgInterestRate: v }))} />
                    <Slider label="Horyzont (lata)" value={params.years} min={3} max={15} step={1}
                        onChange={v => setParams(p => ({ ...p, years: v }))} unit=" lat" />
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                        <CartesianGrid {...GRID} />
                        <XAxis dataKey="year" tick={TICK} stroke="#1E293B" />
                        <YAxis tick={TICK} stroke="#1E293B" unit="%" domain={[40, 'auto']} />
                        <Tooltip content={<BloombergTooltip unit="% PKB" />} />
                        <Legend wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                        <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'Maastricht 60%', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                        <ReferenceLine y={55} stroke="#F97316" strokeDasharray="3 3" label={{ value: 'Próg 55%', fill: '#F97316', fontSize: 9, position: 'right' }} />
                        <Line type="monotone" dataKey="base" stroke="#E2E8F0" strokeWidth={2} dot={false} name="Bazowy" isAnimationActive animationDuration={CHART_ANIM.duration} />
                        <Line type="monotone" dataKey="recession" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Recesja" isAnimationActive animationDuration={CHART_ANIM.duration} />
                        <Line type="monotone" dataKey="consolidation" stroke="#22C55E" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Konsolidacja" isAnimationActive animationDuration={CHART_ANIM.duration} />
                    </LineChart>
                </ResponsiveContainer>

                <div className="px-3 py-2 text-xs">
                    <div className="flex gap-4">
                        <span className="text-bb-muted">Dziś: <span className="text-bb-text font-mono">{INITIAL_DEBT}%</span></span>
                        <span className="text-bb-muted">Za {params.years}l (baz.): <span className="text-bb-text font-mono">{sensitivity.base[sensitivity.base.length - 1]?.debtToGdp}%</span></span>
                        {crossing60 && <span className="text-red-400">⚠️ &gt;60% w {crossing60}</span>}
                    </div>
                </div>
            </ChartPanel>
            <Disclaimer />
        </div>
    );
}

// ===== TOOL 4: Leading Indicators =====

function LeadingIndicatorsTool() {
    const industrialQuery = useIndustrialProduction();
    const retailQuery = useRetailSales();
    const yieldCurve = useYieldCurve();

    const y10 = yieldCurve.curve[2]?.yield ?? 4.96;
    const y2 = yieldCurve.curve[0]?.yield ?? 3.56;
    const spread = +(y10 - y2).toFixed(2);

    // Get last values
    const lastIndustrial = industrialQuery.data?.data?.PL?.slice(-1)[0]?.value ?? 0;
    const lastRetail = retailQuery.data?.data?.PL?.slice(-1)[0]?.value ?? 0;

    // Simple CLI calculation
    const indicators = [
        { name: 'PMI Manufacturing', value: 48.6, weight: 0.30, benchmark: 50, signal: 48.6 >= 50 ? '🟢' : 48.6 >= 47 ? '🟡' : '🔴' },
        { name: 'Produkcja przem.', value: lastIndustrial, weight: 0.25, benchmark: 0, signal: lastIndustrial > 2 ? '🟢' : lastIndustrial > 0 ? '🟡' : '🔴' },
        { name: 'Sprzedaż det.', value: lastRetail, weight: 0.20, benchmark: 0, signal: lastRetail > 2 ? '🟢' : lastRetail > 0 ? '🟡' : '🔴' },
        { name: 'Yield spread 10Y-2Y', value: spread, weight: 0.10, benchmark: 0, signal: spread > 0 ? '🟢' : '🔴' },
    ];

    // Weighted signal
    const greenCount = indicators.filter(i => i.signal === '🟢').length;
    const overallSignal = greenCount >= 3 ? '🟢 EXPANSION' : greenCount >= 2 ? '🟡 NEUTRAL' : '🔴 CONTRACTION';
    const cli = indicators.reduce((s, ind) => {
        const normalized = ind.name.includes('PMI') ? (ind.value - 50) / 5 : ind.value / 5;
        return s + normalized * ind.weight;
    }, 0);

    return (
        <div className="space-y-2">
            <ChartPanel title="LEADING INDICATORS — BAROMETR KONIUNKTURY" source="Eurostat · Stooq · S&P">
                <div className="grid grid-cols-3 gap-3 p-3">
                    <div className="bb-panel p-3 text-center col-span-1">
                        <div className="text-[9px] text-bb-muted uppercase">Barometr</div>
                        <div className="text-lg font-mono font-bold">{overallSignal}</div>
                        <div className="text-xs text-bb-muted font-mono">CLI = {cli.toFixed(2)}</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">Yield 10Y-2Y</div>
                        <div className={`text-lg font-mono font-bold ${spread > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {spread > 0 ? '+' : ''}{spread.toFixed(2)}pp
                        </div>
                        <div className="text-[9px] text-bb-muted">{spread > 0 ? 'Normalna krzywa' : '⚠️ Inwersja!'}</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">PMI</div>
                        <div className={`text-lg font-mono font-bold ${48.6 >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                            48.6
                        </div>
                        <div className="text-[9px] text-bb-muted">{48.6 >= 50 ? 'Ekspansja' : 'Kontrakcja'}</div>
                    </div>
                </div>

                <table className="w-full text-xs mt-2">
                    <thead>
                        <tr className="border-b border-bb-border text-[10px] text-bb-muted">
                            <th className="text-left py-1.5 px-3">Wskaźnik</th>
                            <th className="text-right py-1.5">Ostatnia</th>
                            <th className="text-right py-1.5">Waga</th>
                            <th className="text-right py-1.5 px-3">Sygnał</th>
                        </tr>
                    </thead>
                    <tbody>
                        {indicators.map((ind, i) => (
                            <tr key={i} className="border-b border-bb-border/20">
                                <td className="py-1.5 px-3 text-bb-text">{ind.name}</td>
                                <td className="py-1.5 text-right font-mono text-bb-accent">{ind.value.toFixed(1)}{ind.name.includes('spread') ? 'pp' : ind.name.includes('PMI') ? '' : '%'}</td>
                                <td className="py-1.5 text-right font-mono text-bb-muted">{(ind.weight * 100).toFixed(0)}%</td>
                                <td className="py-1.5 text-right px-3">{ind.signal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ChartPanel>
            <Disclaimer />
        </div>
    );
}

// ===== TOOL 5: REER =====

function REERTool() {
    const eurHistory = useNBPCurrencyHistory('EUR', 365);
    const cpiPL = useInflationMonthly('PL');
    const plEuCpi = usePLvsEU('cpi');

    const lastCpiPL = cpiPL.data?.data?.PL?.slice(-1)[0]?.value ?? 2.5;
    const lastCpiEU = plEuCpi.data?.data?.EU27_2020?.slice(-1)[0]?.value ?? 2.4;
    const cpiGap = +(lastCpiPL - lastCpiEU).toFixed(1);

    // Build REER index from EUR/PLN history
    const reerData = useMemo(() => {
        const rates = eurHistory.data as { effectiveDate?: string; mid?: number }[] | undefined;
        if (!rates || !Array.isArray(rates) || rates.length === 0) return [];

        const base = rates[0]?.mid ?? 4.30;
        // Simple: sample every 7th day, compute NEER + REER approximate
        return rates
            .filter((_: unknown, i: number) => i % 7 === 0)
            .map((r: { effectiveDate?: string; mid?: number }) => {
                const neer = ((r.mid ?? base) / base) * 100;
                // REER adjustment: cumulative inflation differential (simplified linear)
                const dayIdx = rates.indexOf(r);
                const monthsFraction = dayIdx / 30;
                const cpiAdjust = 1 + (monthsFraction * (lastCpiPL - lastCpiEU) / 100);
                const reer = neer * cpiAdjust;
                return {
                    date: r.effectiveDate?.slice(5) || '',
                    neer: +neer.toFixed(1),
                    reer: +reer.toFixed(1),
                };
            });
    }, [eurHistory.data, lastCpiPL, lastCpiEU]);

    const lastReer = reerData.length > 0 ? reerData[reerData.length - 1].reer : 100;
    const reerChange = +(lastReer - 100).toFixed(1);

    return (
        <div className="space-y-2">
            <ChartPanel title="REAL EFFECTIVE EXCHANGE RATE (REER)" source="NBP + Eurostat">
                <div className="grid grid-cols-3 gap-3 p-3">
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">REER Index</div>
                        <div className={`text-2xl font-mono font-bold ${reerChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {lastReer.toFixed(1)}
                        </div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">Interpretacja</div>
                        <div className="text-xs text-bb-text mt-1">
                            PLN realnie <span className={reerChange > 0 ? 'text-red-400' : 'text-green-400'}>{reerChange > 0 ? 'MOCNIEJSZY' : 'SŁABSZY'}</span> o {Math.abs(reerChange).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted uppercase">CPI gap PL-EU</div>
                        <div className={`text-lg font-mono font-bold ${cpiGap > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {cpiGap > 0 ? '+' : ''}{cpiGap}pp
                        </div>
                    </div>
                </div>

                {reerData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={reerData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="date" tick={TICK} stroke="#1E293B" />
                            <YAxis domain={['auto', 'auto']} tick={TICK} stroke="#1E293B" />
                            <Tooltip content={<BloombergTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                            <ReferenceLine y={100} stroke="#64748B" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="neer" stroke="#E2E8F0" strokeWidth={1.5} dot={false} name="NEER (nominalny)" />
                            <Line type="monotone" dataKey="reer" stroke="#FF6B00" strokeWidth={2} dot={false} name="REER (realny)" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-bb-muted py-12 text-sm">Ładowanie danych EUR/PLN...</div>
                )}

                <div className="px-3 py-2 text-xs text-bb-muted border-t border-bb-border/30 mt-2">
                    CPI PL (HICP): {lastCpiPL}% | CPI EU: {lastCpiEU}% | Δ: {cpiGap > 0 ? '+' : ''}{cpiGap}pp
                    {reerChange > 0 ? ' → Eksport drożeje, konkurencyjność spada' : ' → Eksport tanieje, konkurencyjność rośnie'}
                </div>
            </ChartPanel>
            <Disclaimer />
        </div>
    );
}

// ===== MAIN PAGE =====

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState('rates');

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">ANALYTICAL TOOLS</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">MODELE · KALKULATORY · SYMULATORY</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-bb-border overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-[10px] font-mono tracking-wider transition whitespace-nowrap ${activeTab === tab.key
                                ? 'text-bb-accent border-b-2 border-bb-accent bg-bb-accent/5'
                                : 'text-bb-muted hover:text-bb-text hover:bg-bb-border/10'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-2">
                {activeTab === 'rates' && <RateSimulator />}
                {activeTab === 'taylor' && <TaylorRuleTool />}
                {activeTab === 'fiscal' && <FiscalTool />}
                {activeTab === 'leading' && <LeadingIndicatorsTool />}
                {activeTab === 'reer' && <REERTool />}
            </div>
        </div>
    );
}
