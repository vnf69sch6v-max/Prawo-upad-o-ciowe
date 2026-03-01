'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
    ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { ChartPanel, BloombergTooltip, BloombergCursor, CHART_ANIM } from '@/components/ChartUtils';
import {
    useNBPInterestRates, useWibor, useYieldCurve,
    useInflationMonthly, useGDPQuarterly, useIndustrialProduction, useRetailSales,
    usePLvsEU,
} from '@/lib/hooks';
import { useQuery } from '@tanstack/react-query';
import {
    buildRatePath, projectWIBOR, calculateMonthlyPayment, projectYieldCurve,
    RPP_DATES_2026, PRESETS, WIBOR_SPREADS,
    type RateDecision, type MortgageParams
} from '@/lib/calculations/mortgage';
import { taylorRule, buildHistoricalTaylor, sensitivityMatrix, DEFAULT_TAYLOR, type TaylorParams } from '@/lib/calculations/taylor';
import { CONSENSUS, CPI_DATA_PL, GDP_QUARTERLY_PL, PMI_DATA_PL, NBP_GDP_PROJECTION } from '@/lib/static-data';
import { projectDebt, sensitivityAnalysis, findCrossing, FISCAL_DEFAULTS, INITIAL_DEBT, type FiscalParams } from '@/lib/calculations/fiscal';
import { pmiToGDP, compositeNowcast, buildPMIvsGDP, pmiScenarioTable, BACKTEST_RESULTS, BACKTEST_STATS, BLOOMBERG_CONSENSUS, INSAMPLE_RESIDUALS, type IndicatorInput } from '@/lib/calculations/leading';
import { CPI_WEIGHTS, forecastFuelMM, forecastEnergyMM, forecastFoodMM, forecastCoreMM, aggregateCPIMM, computeYoY, buildBaseEffectCalendar, generateFanChart, detectAnomalies, analyzeTrend, BLOCK_RMSE, CPI_CONSENSUS, MANUAL_INPUTS, type BlockForecast, type FanChartPoint } from '@/lib/calculations/cpi-forecaster';
import { useHICPIndex, useHICPFoodYoY, useHICPCoreYoY, usePPI, useBrent } from '@/lib/hooks';

// ===== Shared UI =====

const GRID = { strokeDasharray: '3 3', stroke: '#1E293B' };
const TICK = { fill: '#64748B', fontSize: 10 };

const TABS = [
    { key: 'rates', label: 'RATE SIMULATOR' },
    { key: 'taylor', label: 'TAYLOR RULE' },
    { key: 'fiscal', label: 'FISCAL' },
    { key: 'leading', label: 'LEADING IND.' },
    { key: 'reer', label: 'REER' },
    { key: 'cpi', label: 'CPI FORECAST' },
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
            ⚠️ Narzędzie edukacyjne. Reguła Taylora to uproszczenie — RPP uwzględnia więcej czynników.
        </div>
    );
}

// ===== Gauge Meter =====

function GaugeMeter({ gap }: { gap: number }) {
    const min = -6, max = 6;
    const percent = Math.max(0, Math.min(100, ((gap - min) / (max - min)) * 100));

    const getColor = (g: number) => {
        if (g < -2) return '#22C55E';
        if (g < -0.5) return '#86EFAC';
        if (g < 0.5) return '#FBBF24';
        if (g < 2) return '#FB923C';
        return '#EF4444';
    };

    const getLabel = (g: number) => {
        if (g < -2) return 'BARDZO LUŹNA';
        if (g < -0.5) return 'LUŹNA';
        if (g < 0.5) return 'NEUTRALNA';
        if (g < 2) return 'RESTRYKCYJNA';
        return 'BARDZO RESTRYKCYJNA';
    };

    return (
        <div className="px-4 py-3">
            <div className="text-center mb-3">
                <span className="font-mono text-[28px] font-bold" style={{ color: getColor(gap) }}>
                    {gap >= 0 ? '+' : ''}{gap.toFixed(2)}pp
                </span>
                <div className="text-[11px] font-mono tracking-widest font-semibold mt-0.5" style={{ color: getColor(gap) }}>
                    {getLabel(gap)}
                </div>
            </div>
            <div className="relative h-3.5 rounded-full overflow-hidden border border-bb-border/30">
                <div className="absolute inset-0 opacity-70" style={{
                    background: 'linear-gradient(to right, #22C55E 0%, #86EFAC 25%, #FBBF24 45%, #FB923C 65%, #EF4444 100%)'
                }} />
                <div className="absolute top-0 bottom-0 w-[3px] bg-white rounded shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    style={{ left: `${percent}%`, transform: 'translateX(-50%)', transition: 'left 0.3s ease' }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-bb-muted font-mono">
                <span>← LUŹNA</span>
                <span>0</span>
                <span>RESTRYKCYJNA →</span>
            </div>
        </div>
    );
}

// ===== Sensitivity Table =====

function SensitivityTable({ params, currentCPI, currentGDP }: {
    params: TaylorParams; currentCPI: number; currentGDP: number;
}) {
    const cpiRange = [1.0, 2.0, 2.5, 3.0, 4.0, 5.0, 8.0];
    const gdpRange = [0.0, 1.0, 2.0, 3.0, 3.8, 5.0];
    const matrix = sensitivityMatrix(params, cpiRange, gdpRange);

    const closest = (arr: number[], val: number) => arr.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a);
    const closestCPI = closest(cpiRange, currentCPI);
    const closestGDP = closest(gdpRange, currentGDP);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th className="p-1.5 text-left text-bb-muted border-b border-bb-border text-[10px]">CPI↓ \ PKB→</th>
                        {gdpRange.map(g => (
                            <th key={g} className={`p-1.5 text-center border-b border-bb-border text-[10px] ${g === closestGDP ? 'text-bb-accent' : 'text-bb-muted'}`}>
                                {g.toFixed(1)}%
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cpiRange.map((cpi, ci) => (
                        <tr key={cpi}>
                            <td className={`p-1.5 border-b border-bb-bg ${cpi === closestCPI ? 'text-bb-accent font-bold' : 'text-bb-muted'}`}>
                                {cpi.toFixed(1)}%
                            </td>
                            {gdpRange.map((gdp, gi) => {
                                const rate = matrix[ci][gi];
                                const isCurrent = cpi === closestCPI && gdp === closestGDP;
                                return (
                                    <td key={gdp} className="p-1.5 text-center border-b border-bb-bg"
                                        style={{
                                            background: isCurrent ? 'rgba(255,107,0,0.15)' : undefined,
                                            border: isCurrent ? '1px solid #FF6B00' : undefined,
                                            borderRadius: isCurrent ? 3 : 0,
                                            color: isCurrent ? '#FF6B00' : rate < 2 ? '#22C55E' : rate > 6 ? '#EF4444' : rate > 4 ? '#FB923C' : '#E2E8F0',
                                            fontWeight: isCurrent ? 700 : 400,
                                        }}
                                    >
                                        {rate.toFixed(1)}%
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ===== TOOL 2: Taylor Rule PRO V2 =====

function TaylorRuleTool() {
    const { data: nbpRates } = useNBPInterestRates();
    const currentRPP = nbpRates?.rates?.find((r: { name: string }) => r.name === 'Stopa referencyjna')?.value ?? 4.00;

    const [params, setParams] = useState<TaylorParams>(DEFAULT_TAYLOR);
    const [range, setRange] = useState('MAX');
    const [showMethodology, setShowMethodology] = useState(false);

    const update = (key: keyof TaylorParams, val: number) => setParams(p => ({ ...p, [key]: val }));

    const presets: Record<string, Partial<TaylorParams>> = {
        classic: { weightInflation: 0.5, weightOutput: 0.5, rStar: 1.5 },
        yellen: { weightInflation: 0.5, weightOutput: 1.0, rStar: 1.5 },
        hawkish: { weightInflation: 1.0, weightOutput: 0.5, rStar: 1.5 },
        bisEME: { weightInflation: 0.5, weightOutput: 1.0, rStar: 2.0 },
    };

    const applyPreset = (name: string) => setParams(p => ({ ...p, ...presets[name] }));

    // Current values from hardcoded data
    const currentCPI = CPI_DATA_PL[CPI_DATA_PL.length - 1].value;
    const currentGDP = (() => {
        const lastCPI = CPI_DATA_PL[CPI_DATA_PL.length - 1];
        const [y, m] = lastCPI.date.split('-').map(Number);
        const q = Math.ceil(m / 3);
        const qKey = `${y}Q${q}`;
        return GDP_QUARTERLY_PL.find(d => d.q === qKey)?.value ?? 3.6;
    })();

    const result = useMemo(() => taylorRule(params, currentCPI, currentGDP), [params, currentCPI, currentGDP]);
    const currentGap = +(currentRPP - result.optimalRate).toFixed(2);

    // Historical data
    const rangeMonths = range === 'MAX' ? 0 : range === '5Y' ? 60 : range === '3Y' ? 36 : range === '2Y' ? 24 : 12;
    const historicalData = useMemo(() =>
        buildHistoricalTaylor(CPI_DATA_PL, GDP_QUARTERLY_PL, params, rangeMonths),
        [params, rangeMonths]
    );

    const chartInterval = range === 'MAX' ? 5 : range === '5Y' ? 5 : range === '3Y' ? 3 : range === '2Y' ? 2 : 1;

    return (
        <div className="space-y-3">
            {/* Header + current data */}
            <ChartPanel title="TAYLOR RULE MONITOR — PRO" source="Eurostat HICP · NBP · Model">
                <div className="flex justify-end px-3 pb-1 text-[10px] text-bb-muted font-mono">
                    CPI: {currentCPI}% | PKB: {currentGDP}% | RPP: {currentRPP}%
                </div>
            </ChartPanel>

            {/* Parameter sliders */}
            <div className="bb-panel p-3">
                <div className="flex flex-wrap gap-4 mb-3">
                    {[
                        { label: 'r* neutralna', key: 'rStar' as const, min: 0, max: 3.5, step: 0.25, unit: '%', sub: 'NBP szacunek ~1.5%' },
                        { label: 'Cel inflacyjny π*', key: 'piTarget' as const, min: 1, max: 4, step: 0.5, unit: '%', sub: 'NBP oficjalny = 2.5%' },
                        { label: 'PKB potencjalny y*', key: 'potentialGDP' as const, min: 1, max: 5, step: 0.25, unit: '%', sub: 'Projekcja NBP ~3.0%' },
                        { label: 'Waga inflacji α', key: 'weightInflation' as const, min: 0, max: 1.5, step: 0.1, unit: '', sub: 'Taylor 1993: 0.5' },
                        { label: 'Waga PKB β', key: 'weightOutput' as const, min: 0, max: 1.5, step: 0.1, unit: '', sub: 'Taylor 1993: 0.5' },
                    ].map(s => (
                        <div key={s.key} className="flex-1 min-w-[130px]">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[10px] text-bb-muted tracking-wide">{s.label}</span>
                                <span className="font-mono text-sm text-bb-accent font-bold">
                                    {params[s.key].toFixed(s.step < 1 ? 1 : 0)}{s.unit}
                                </span>
                            </div>
                            <input type="range" min={s.min} max={s.max} step={s.step} value={params[s.key]}
                                onChange={e => update(s.key, +e.target.value)}
                                className="w-full h-1 rounded-full accent-[#FF6B00] bg-bb-border cursor-pointer"
                            />
                            <div className="text-[9px] text-bb-muted/60 mt-0.5">{s.sub}</div>
                        </div>
                    ))}
                </div>
                {/* Presets */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'classic', label: 'Classic (0.5/0.5)', desc: 'Taylor 1993' },
                        { key: 'yellen', label: 'Balanced (0.5/1.0)', desc: 'Taylor-Yellen 1999' },
                        { key: 'hawkish', label: 'Anty-inflacyjny (1.0/0.5)', desc: 'Jastrzębi' },
                        { key: 'bisEME', label: 'BIS EME (0.5/1.0, r*=2)', desc: 'Gosp. wschodzące' },
                    ].map(({ key, label, desc }) => {
                        const p = presets[key];
                        const active = params.weightInflation === p.weightInflation && params.weightOutput === p.weightOutput && params.rStar === p.rStar;
                        return (
                            <button key={key} onClick={() => applyPreset(key)}
                                className="text-[10px] px-3 py-1.5 rounded font-mono transition-all text-bb-muted"
                                style={{
                                    background: active ? 'rgba(255,107,0,0.15)' : '#0F172A',
                                    border: active ? '1px solid #FF6B00' : '1px solid #1E293B',
                                }}
                            >
                                {label}
                                <span className="block text-[8px] text-bb-muted/50">{desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bb-panel p-4 text-center">
                    <div className="text-[10px] text-bb-accent tracking-wider mb-1">STOPA TAYLORA</div>
                    <div className="text-3xl font-mono font-bold text-bb-accent">{result.optimalRate.toFixed(2)}%</div>
                    <div className="text-[9px] text-bb-muted mt-1 font-mono">
                        i = {currentCPI} + {params.rStar} + {params.weightInflation}×({currentCPI}−{params.piTarget}) + {params.weightOutput}×({currentGDP}−{params.potentialGDP})
                    </div>
                </div>
                <div className="bb-panel p-4 text-center">
                    <div className="text-[10px] text-bb-muted tracking-wider mb-1">STOPA RPP</div>
                    <div className="text-3xl font-mono font-bold text-bb-text">{currentRPP.toFixed(2)}%</div>
                    <div className="text-[9px] text-bb-muted mt-1">NBP referencyjna, II.2026</div>
                </div>
                <div className="bb-panel p-4 text-center">
                    <div className="text-[10px] text-bb-muted tracking-wider mb-1">RÓŻNICA</div>
                    <div className={`text-3xl font-mono font-bold ${currentGap > 0.5 ? 'text-red-400' : currentGap < -0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {currentGap >= 0 ? '+' : ''}{currentGap.toFixed(2)}pp
                    </div>
                    <div className="text-[9px] text-bb-muted mt-1">RPP − Taylor (+ = restrykcyjna)</div>
                </div>
            </div>

            {/* Gauge */}
            <div className="bb-panel">
                <GaugeMeter gap={currentGap} />
            </div>

            {/* Consensus comparison */}
            <div className="bb-panel p-4">
                <div className="text-[10px] text-bb-muted tracking-wider font-semibold mb-3">📝 PORÓWNANIE Z KONSENSUSEM RYNKOWYM</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <div className="text-[9px] text-bb-muted">Konsensus XII.2026</div>
                        <div className="text-xl font-mono font-bold text-bb-text">{CONSENSUS.rateEndYear}%</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-bb-muted">Taylor (bazowy)</div>
                        <div className="text-xl font-mono font-bold text-bb-accent">{result.optimalRate.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-bb-muted">RPP obecna</div>
                        <div className="text-xl font-mono font-bold text-bb-text">{currentRPP}%</div>
                    </div>
                </div>
                <div className="text-[10px] text-bb-muted mt-3 pt-2 border-t border-bb-border/30 leading-relaxed">
                    → {result.optimalRate < CONSENSUS.rateEndYear
                        ? `Taylor sugeruje więcej cięć niż wycenia rynek (${(CONSENSUS.rateEndYear - result.optimalRate).toFixed(1)}pp niżej)`
                        : `Rynek wycenia więcej cięć niż sugeruje Taylor (${(result.optimalRate - CONSENSUS.rateEndYear).toFixed(1)}pp różnicy)`}
                    <br />
                    <span className="text-[9px] text-bb-muted/60">Źródło: {CONSENSUS.source}</span>
                </div>
            </div>

            {/* Historical chart */}
            <ChartPanel title="STOPA TAYLORA vs RPP — HISTORIA" source="Eurostat · NBP">
                <div className="flex gap-1 px-3 mb-2 justify-end">
                    {['1Y', '2Y', '3Y', '5Y', 'MAX'].map(r => (
                        <button key={r} onClick={() => setRange(r)}
                            className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded"
                            style={{
                                background: range === r ? '#FF6B00' : 'transparent',
                                border: range === r ? 'none' : '1px solid #334155',
                                color: range === r ? '#0A0E17' : '#64748B',
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                {historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={380}>
                        <ComposedChart data={historicalData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="taylorAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#1E293B' }}
                                interval={chartInterval} />
                            <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#1E293B' }}
                                domain={['auto', 'auto']} unit="%" />
                            <Tooltip content={({ active, payload }: { active?: boolean; payload?: readonly { payload: Record<string, number | string> }[] }) => {
                                if (!active || !payload?.[0]) return null;
                                const d = payload[0].payload;
                                const gapColor = Number(d.gap) > 0.5 ? '#EF4444' : Number(d.gap) < -0.5 ? '#22C55E' : '#FBBF24';
                                return (
                                    <div className="bg-bb-surface border border-bb-border rounded p-2.5 text-[11px] font-mono shadow-lg">
                                        <div className="text-bb-muted mb-1.5 font-semibold">{d.date}</div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                            <span className="text-[#FF6B00]">Taylor:</span>
                                            <span className="text-[#FF6B00] text-right">{Number(d.taylor).toFixed(2)}%</span>
                                            <span className="text-bb-text">RPP:</span>
                                            <span className="text-bb-text text-right">{Number(d.rpp).toFixed(2)}%</span>
                                            <span style={{ color: gapColor }}>Gap:</span>
                                            <span style={{ color: gapColor }} className="text-right">{Number(d.gap) >= 0 ? '+' : ''}{Number(d.gap).toFixed(2)}pp</span>
                                            <span className="text-bb-muted">CPI:</span>
                                            <span className="text-bb-muted text-right">{Number(d.inflation).toFixed(1)}%</span>
                                            <span className="text-bb-muted">PKB:</span>
                                            <span className="text-bb-muted text-right">{Number(d.gdp).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            }} />
                            <ReferenceLine y={0} stroke="#1E293B" strokeDasharray="3 3" />
                            <Area type="monotone" dataKey="taylor" stroke="none" fill="url(#taylorAreaGrad)" fillOpacity={0.3} />
                            <Line type="monotone" dataKey="taylor" stroke="#FF6B00" strokeWidth={2.5} dot={false} name="Taylor Rule" />
                            <Line type="monotone" dataKey="rpp" stroke="#E2E8F0" strokeWidth={2} dot={false} name="Stopa RPP" />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-bb-muted py-16">Brak danych...</div>
                )}
                <div className="flex gap-5 justify-center mt-2 text-[10px]">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-[3px] bg-[#FF6B00] rounded" /><span className="text-bb-muted">Taylor Rule (optymalna)</span></span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-[3px] bg-bb-text rounded" /><span className="text-bb-muted">Stopa RPP (rzeczywista)</span></span>
                </div>
            </ChartPanel>

            {/* Gap bar chart */}
            <ChartPanel title="ODCHYLENIE RPP OD TAYLORA (pp)" source="">
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={historicalData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#1E293B' }}
                            interval={chartInterval > 2 ? chartInterval + 3 : 2} />
                        <YAxis tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} unit="pp" />
                        <ReferenceLine y={0} stroke="#334155" />
                        <Tooltip content={({ active, payload }: { active?: boolean; payload?: readonly { payload: Record<string, number | string> }[] }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload;
                            return (
                                <div className="bg-bb-surface border border-bb-border rounded p-2 text-[10px] font-mono shadow-lg">
                                    <div className="text-bb-muted">{d.date}</div>
                                    <div className={Number(d.gap) > 0 ? 'text-red-400' : 'text-green-400'}>
                                        Gap: {Number(d.gap) >= 0 ? '+' : ''}{Number(d.gap).toFixed(2)}pp
                                    </div>
                                </div>
                            );
                        }} />
                        <Bar dataKey="gap" radius={[2, 2, 0, 0]}>
                            {historicalData.map((entry, i) => (
                                <Cell key={i} fill={entry.gap > 0.5 ? '#EF444488' : entry.gap < -0.5 ? '#22C55E88' : '#FBBF2488'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center text-[9px] text-bb-muted mt-1">
                    <span>🟢 RPP poniżej Taylora (za luźna)</span>
                    <span>🔴 RPP powyżej Taylora (za restrykcyjna)</span>
                </div>
            </ChartPanel>

            {/* Sensitivity table */}
            <ChartPanel title="ANALIZA WRAŻLIWOŚCI — OPTYMALNA STOPA DLA KOMBINACJI CPI × PKB" source="">
                <SensitivityTable params={params} currentCPI={currentCPI} currentGDP={currentGDP} />
                <div className="text-[9px] text-bb-muted px-3 mt-2">
                    🟧 = obecna kombinacja. Parametry: r*={params.rStar}%, π*={params.piTarget}%, y*={params.potentialGDP}%, α={params.weightInflation}, β={params.weightOutput}
                </div>
            </ChartPanel>

            {/* Formula decomposition */}
            <div className="bb-panel p-4">
                <div className="text-[10px] text-bb-muted tracking-wider font-semibold mb-3">DEKOMPOZYCJA WZORU</div>
                <div className="font-mono text-xs leading-relaxed">
                    <div className="text-bb-muted mb-3">
                        i = <span className="text-[#FF6B00]">π</span> + <span className="text-[#38BDF8]">r*</span> + <span className="text-[#A78BFA]">α</span>(<span className="text-[#FF6B00]">π</span> − <span className="text-[#38BDF8]">π*</span>) + <span className="text-[#A78BFA]">β</span>(<span className="text-green-400">y</span> − <span className="text-[#38BDF8]">y*</span>)
                    </div>
                    {[
                        { label: 'π (inflacja)', color: '#FF6B00', barW: (currentCPI / 18) * 100, value: `+${currentCPI.toFixed(1)}%` },
                        { label: 'r* (neutralna)', color: '#38BDF8', barW: (params.rStar / 3.5) * 100, value: `+${params.rStar.toFixed(1)}%` },
                        {
                            label: 'Inflation gap', color: '#A78BFA', barW: Math.min(100, Math.abs(currentCPI - params.piTarget) / 5 * 100),
                            value: `${result.inflationContrib >= 0 ? '+' : ''}${result.inflationContrib.toFixed(2)}%`
                        },
                        {
                            label: 'Output gap', color: '#22C55E', barW: Math.min(100, Math.abs(currentGDP - params.potentialGDP) / 5 * 100),
                            value: `${result.outputContrib >= 0 ? '+' : ''}${result.outputContrib.toFixed(2)}%`
                        },
                    ].map(({ label, color, barW, value }) => (
                        <div key={label} className="grid grid-cols-[120px_1fr_80px] gap-3 items-center mb-1.5">
                            <span style={{ color }}>{label}</span>
                            <div className="h-1 bg-bb-border/50 rounded-full relative">
                                <div className="h-1 rounded-full" style={{ background: color, width: `${barW}%` }} />
                            </div>
                            <span className="text-right" style={{ color }}>{value}</span>
                        </div>
                    ))}
                    <div className="grid grid-cols-[120px_1fr_80px] gap-3 items-center mt-2 pt-2 border-t border-bb-border/30">
                        <span className="text-bb-accent font-bold">SUMA</span>
                        <div />
                        <span className="text-right text-bb-accent font-bold">= {result.optimalRate.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            {/* Methodology */}
            <div className="bb-panel overflow-hidden">
                <button onClick={() => setShowMethodology(!showMethodology)}
                    className="w-full px-4 py-3 bg-transparent border-none text-bb-muted text-[10px] text-left cursor-pointer flex justify-between items-center tracking-wider font-semibold"
                >
                    ℹ️ METODOLOGIA I OGRANICZENIA
                    <span>{showMethodology ? '▲' : '▼'}</span>
                </button>
                {showMethodology && (
                    <div className="px-4 pb-4 text-[11px] text-bb-muted leading-relaxed space-y-2.5">
                        <p><strong className="text-bb-text">Wzór:</strong> i = π + r* + α(π − π*) + β(y − y*) — wariant Taylora (1993), gdzie π to bieżąca inflacja HICP.</p>
                        <p><strong className="text-bb-text">Inflacja (π):</strong> HICP YoY z Eurostat (zharmonizowany indeks cen). Taylor oryginalnie używał deflatora PKB.</p>
                        <p><strong className="text-bb-text">Output gap:</strong> Uproszczony: PKB_actual − PKB_potencjalny. Nie stosujemy filtra HP ani funkcji produkcji (metoda NBP/OECD). Potencjał ~3.0% wg projekcji NBP z XI.2025.</p>
                        <p><strong className="text-bb-text">r* (stopa neutralna):</strong> Domyślnie 1.5% (nominalnie). Bielecki et al. (2023, NBP WP 364) szacują r* dla PL za pomocą wielu modeli — wyniki wskazują na spadek NRI w ostatnich dekadach.</p>
                        <p><strong className="text-bb-text">Cel inflacyjny π*:</strong> 2.5% — oficjalny ciągły cel NBP od 2004 (±1pp pasmo tolerancji).</p>
                        <p><strong className="text-bb-text">Warianty:</strong> Classic (Taylor 1993, α=β=0.5), Balanced (Taylor-Yellen 1999, β=1.0), BIS EME (r*=2.0, β=1.0). Grabia (2019, Olsztyn Economic Journal) wykazał, że zmodyfikowana wersja reguły najlepiej pasuje do decyzji RPP w okresie 2000-2017.</p>
                        <p><strong className="text-bb-text">Ograniczenia:</strong> Nie uwzględnia: kursu walutowego, cen energii, interest rate smoothing (inertia), forward guidance ECB, ryzyka geopolitycznego.</p>
                        <p className="text-yellow-400 font-semibold text-[10px] mt-3">
                            ⚠️ Narzędzie edukacyjne. Nie stanowi rekomendacji inwestycyjnej ani oceny polityki monetarnej.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
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
    const [showMethodology, setShowMethodology] = useState(false);
    const [showBacktest, setShowBacktest] = useState(false);

    const lastIndustrial = industrialQuery.data?.data?.PL?.slice(-1)[0]?.value ?? null;
    const lastRetail = retailQuery.data?.data?.PL?.slice(-1)[0]?.value ?? null;

    const currentPMI = PMI_DATA_PL[PMI_DATA_PL.length - 1].value;
    const prevPMI = PMI_DATA_PL[PMI_DATA_PL.length - 2]?.value ?? null;

    // Current CPI for deflating retail
    const latestCPI = CPI_DATA_PL[CPI_DATA_PL.length - 1]?.value ?? 3.7;
    const retailReal = lastRetail !== null ? +(lastRetail - latestCPI).toFixed(1) : 0.3;

    // 3 indicators ONLY — yield and wages removed per quant review
    const indicators: IndicatorInput[] = [
        { name: 'PMI', label: 'PMI Manufacturing', value: currentPMI, prevValue: prevPMI, weight: 0, rawBeta: -0.1186, lastUpdated: 'XII.2025' },
        { name: 'IP', label: 'Produkcja przem. YoY', value: lastIndustrial ?? 3.0, prevValue: null, weight: 0, rawBeta: 0.2400, loading: lastIndustrial === null, lastUpdated: lastIndustrial !== null ? 'LIVE' : 'XII.2025', fallback: lastIndustrial === null },
        { name: 'RETAIL_REAL', label: 'Sprzedaż det. Realna', value: retailReal, prevValue: null, weight: 0, rawBeta: 0.2202, loading: false, lastUpdated: lastRetail !== null ? 'LIVE' : 'XII.2025', isDeflated: true, fallback: lastRetail === null },
    ];

    const nowcast = useMemo(() => compositeNowcast(indicators, BLOOMBERG_CONSENSUS.gdp2026), [currentPMI, lastIndustrial, retailReal]);
    const scenarios = useMemo(() => pmiScenarioTable(PMI_DATA_PL), []);
    const historicalData = useMemo(() => buildPMIvsGDP(PMI_DATA_PL, GDP_QUARTERLY_PL), []);

    const signalEmoji = (s: string) => s === 'green' ? '🟢' : s === 'yellow' ? '🟡' : '🔴';
    const phaseColors: Record<string, string> = { 'EXPANSION': '#22C55E', 'RECOVERY': '#38BDF8', 'SLOWDOWN': '#FB923C', 'CONTRACTION': '#EF4444' };
    const phaseLabels: Record<string, string> = { 'EXPANSION': 'EKSPANSJA ↑', 'RECOVERY': 'OŻYWIENIE ↗', 'SLOWDOWN': 'SPOWOLNIENIE ↘', 'CONTRACTION': 'KONTRAKCJA ↓' };
    const disagreeColors: Record<string, string> = { 'LOW': '#22C55E', 'MED': '#FBBF24', 'HIGH': '#EF4444' };

    return (
        <div className="space-y-3">
            {/* Model quality badge */}
            <div className="flex items-center gap-3 px-1 flex-wrap">
                <span className="text-[9px] font-mono text-bb-muted bg-bb-surface px-2 py-0.5 rounded border border-bb-border">
                    R² = {(nowcast.modelQuality.r2 * 100).toFixed(0)}% · Adj.R² = {(nowcast.modelQuality.adjR2 * 100).toFixed(0)}% · RMSE = {nowcast.modelQuality.rmse.toFixed(1)}pp · N = {nowcast.modelQuality.n}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: `${disagreeColors[nowcast.disagreement]}15`, color: disagreeColors[nowcast.disagreement], border: `1px solid ${disagreeColors[nowcast.disagreement]}40` }}>
                    DISAGREEMENT: {nowcast.disagreement} ({nowcast.disagreementPP}pp)
                </span>
                <span className="text-[9px] font-mono text-bb-muted">Multiple OLS · polskie dane 2020Q1–2025Q4</span>
            </div>

            {/* GDP Nowcast */}
            <ChartPanel title="GDP NOWCAST — MULTIPLE OLS (3 zmienne)" source="Polska regresja wieloraka · S&P Global PMI · Eurostat · Bloomberg ECFC">
                <div className="grid grid-cols-4 gap-3 p-3">
                    <div className="bb-panel p-4 text-center">
                        <div className="text-[9px] text-bb-accent tracking-wider mb-1">MULTI OLS (V3)</div>
                        <div className="text-3xl font-mono font-bold text-bb-accent">{nowcast.multiModelGDP.toFixed(1)}%</div>
                        <div className="text-[9px] text-bb-muted mt-1">±{nowcast.modelQuality.rmse.toFixed(1)}pp RMSE</div>
                        <div className="text-[8px] text-bb-muted">68% CI: {nowcast.confidenceInterval.low1s.toFixed(1)} — {nowcast.confidenceInterval.high1s.toFixed(1)}%</div>
                    </div>
                    <div className="bb-panel p-4 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">PMI BRIDGE (ref.)</div>
                        <div className="text-3xl font-mono font-bold text-bb-muted">{nowcast.pmiBridgeGDP.toFixed(1)}%</div>
                        <div className="text-[9px] text-bb-muted mt-1">R² = {(0.349 * 100).toFixed(0)}% (słaby)</div>
                    </div>
                    <div className="bb-panel p-4 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">KONSENSUS BBG</div>
                        <div className="text-3xl font-mono font-bold text-bb-text">{BLOOMBERG_CONSENSUS.gdp2026}%</div>
                        <div className="text-[9px] text-bb-muted mt-1">{BLOOMBERG_CONSENSUS.source}</div>
                    </div>
                    <div className="bb-panel p-4 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">FAZA CYKLU</div>
                        <div className="text-xl font-mono font-bold" style={{ color: phaseColors[nowcast.cyclePhase] }}>
                            {phaseLabels[nowcast.cyclePhase]}
                        </div>
                        <div className="text-[9px] text-bb-muted mt-1">CLI = {nowcast.cliValue.toFixed(0)}/100</div>
                    </div>
                </div>
                <div className="px-3 pb-3 text-[9px] font-mono text-bb-muted">
                    GDP = 7.12 − 0.119×PMI + 0.240×IP + 0.220×RetailReal | α = 7.12 (intercept)
                </div>
            </ChartPanel>

            {/* Business cycle gauge */}
            <div className="bb-panel p-4">
                <div className="text-[10px] text-bb-muted tracking-wider font-semibold mb-3">🧭 BAROMETR CYKLU KONIUNKTURALNEGO (OECD)</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                    {(['RECOVERY', 'EXPANSION', 'SLOWDOWN', 'CONTRACTION'] as const).map(phase => {
                        const active = nowcast.cyclePhase === phase;
                        return (
                            <div key={phase} className="p-3 rounded-lg transition-all" style={{
                                background: active ? `${phaseColors[phase]}15` : '#0F172A',
                                border: active ? `2px solid ${phaseColors[phase]}` : '1px solid #1E293B',
                            }}>
                                <div className="text-xl mb-1">
                                    {phase === 'RECOVERY' ? '↗️' : phase === 'EXPANSION' ? '🚀' : phase === 'SLOWDOWN' ? '📉' : '🔻'}
                                </div>
                                <div className="text-[10px] font-mono font-semibold" style={{ color: active ? phaseColors[phase] : '#475569' }}>
                                    {phaseLabels[phase]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Backtest track record */}
            <div className="bb-panel overflow-hidden">
                <button onClick={() => setShowBacktest(!showBacktest)}
                    className="w-full px-4 py-3 bg-transparent border-none text-bb-muted text-[10px] text-left cursor-pointer flex justify-between items-center tracking-wider font-semibold"
                >
                    📋 MODEL VS ACTUAL (MAE = {BACKTEST_STATS.mae}pp, RMSE = {BACKTEST_STATS.rmse}pp | V3 Multiple OLS)
                    <span>{showBacktest ? '▲' : '▼'}</span>
                </button>
                {showBacktest && (
                    <div className="px-3 pb-3">
                        <table className="w-full text-[10px] font-mono">
                            <thead>
                                <tr className="border-b border-bb-border text-bb-muted">
                                    <th className="p-1 text-left">Q</th>
                                    <th className="p-1 text-right">PMI</th>
                                    <th className="p-1 text-right">Model</th>
                                    <th className="p-1 text-right">Actual</th>
                                    <th className="p-1 text-right">Error</th>
                                    <th className="p-1 text-right w-20">|Error|</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BACKTEST_RESULTS.map((r, i) => {
                                    const absErr = Math.abs(r.error);
                                    const barW = Math.min(100, absErr / 10 * 100);
                                    return (
                                        <tr key={i} className="border-b border-bb-border/20" style={r.q === BACKTEST_STATS.worstQ ? { background: 'rgba(239,68,68,0.08)' } : undefined}>
                                            <td className="p-1 text-bb-text">{r.q}</td>
                                            <td className="p-1 text-right text-bb-muted">{r.pmi.toFixed(1)}</td>
                                            <td className="p-1 text-right" style={{ color: r.predicted > 0 ? '#22C55E' : '#EF4444' }}>
                                                {r.predicted >= 0 ? '+' : ''}{r.predicted.toFixed(1)}%
                                            </td>
                                            <td className="p-1 text-right text-bb-accent">
                                                {r.actual >= 0 ? '+' : ''}{r.actual.toFixed(1)}%
                                            </td>
                                            <td className="p-1 text-right" style={{ color: absErr > 3 ? '#EF4444' : absErr > 1.5 ? '#FBBF24' : '#22C55E' }}>
                                                {r.error >= 0 ? '+' : ''}{r.error.toFixed(1)}pp
                                            </td>
                                            <td className="p-1">
                                                <div className="h-1.5 bg-bb-border/30 rounded-full w-full">
                                                    <div className="h-1.5 rounded-full" style={{ width: `${barW}%`, background: absErr > 3 ? '#EF4444' : absErr > 1.5 ? '#FBBF24' : '#22C55E' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="flex gap-4 mt-2 text-[9px] text-bb-muted">
                            <span>MAE = <strong className="text-bb-text">{BACKTEST_STATS.mae}pp</strong></span>
                            <span>RMSE = <strong className="text-bb-text">{BACKTEST_STATS.rmse}pp</strong></span>
                            <span>Worst: <strong className="text-red-400">{BACKTEST_STATS.worstQ} ({BACKTEST_STATS.worstError}pp)</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Indicator contributions — ALWAYS shows all 3 rows */}
            <div className="bb-panel">
                <div className="px-3 pt-3 text-[10px] text-bb-muted tracking-wider font-semibold">📊 WKŁAD ZMIENNYCH (z regresji Multiple OLS)</div>
                <table className="w-full text-[10px] mt-2">
                    <thead>
                        <tr className="border-b border-bb-border text-[9px] text-bb-muted">
                            <th className="text-left py-1.5 px-3">Zmienna</th>
                            <th className="text-right py-1.5">Wartość</th>
                            <th className="text-right py-1.5">ΔMoM</th>
                            <th className="text-right py-1.5">β (OLS)</th>
                            <th className="text-right py-1.5">β × X</th>
                            <th className="text-right py-1.5">Udział%</th>
                            <th className="text-center py-1.5">📅</th>
                            <th className="text-right py-1.5 px-3">Syg.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nowcast.contributions.map((c, i) => {
                            const mom = c.prevValue !== null ? c.value - c.prevValue : null;
                            return (
                                <tr key={i} className="border-b border-bb-border/20" style={c.fallback ? { opacity: 0.6 } : undefined}>
                                    <td className="py-1.5 px-3 text-bb-text font-mono text-[10px]">
                                        {c.label}
                                        {c.isDeflated && <span className="text-[8px] text-cyan-400 ml-1">(real)</span>}
                                        {c.fallback && <span className="text-[8px] text-yellow-500 ml-1">(carry-over)</span>}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-bb-accent">
                                        {c.value.toFixed(1)}{c.name === 'PMI' ? '' : '%'}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-[9px]" style={{ color: mom === null ? '#475569' : mom > 0 ? '#22C55E' : mom < 0 ? '#EF4444' : '#475569' }}>
                                        {mom === null ? '—' : `${mom > 0 ? '+' : ''}${mom.toFixed(1)}`}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-bb-muted text-[9px]">
                                        {c.name === 'PMI' ? '−0.119' : c.name === 'IP' ? '+0.240' : '+0.220'}
                                    </td>
                                    <td className="py-1.5 text-right font-mono" style={{ color: c.gdpContrib > 0 ? '#22C55E' : c.gdpContrib < -2 ? '#EF4444' : '#FBBF24' }}>
                                        {c.gdpContrib >= 0 ? '+' : ''}{c.gdpContrib.toFixed(1)}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-bb-muted">{c.weightPct}%</td>
                                    <td className="py-1.5 text-center text-[8px] text-bb-muted font-mono">{c.lastUpdated}</td>
                                    <td className="py-1.5 text-right px-3">{signalEmoji(c.signal)}</td>
                                </tr>
                            );
                        })}
                        <tr className="border-t border-bb-border/50">
                            <td className="py-1.5 px-3 text-bb-muted text-[9px]">Intercept (α)</td>
                            <td colSpan={3} className="py-1.5 text-right text-bb-muted text-[9px]">+7.12</td>
                            <td colSpan={4} className="py-1.5 px-3 text-right text-bb-accent font-bold text-[10px]">
                                Σ = {nowcast.multiModelGDP.toFixed(2)}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Residuals chart (replaces dual-axis per quant review) */}
            <ChartPanel title="MODEL VS ACTUAL — RESIDUALS (in-sample)" source="Multiple OLS, 24 kw.">
                <div className="text-[9px] text-bb-muted px-3 mb-1">Różnica model − actual. Bliżej 0 = lepsze dopasowanie.</div>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={INSAMPLE_RESIDUALS} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <XAxis dataKey="q" tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} interval={2} />
                        <YAxis tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} domain={[-8, 4]} unit="pp" />
                        <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                        <ReferenceLine y={2} stroke="#FBBF2440" strokeDasharray="2 2" />
                        <ReferenceLine y={-2} stroke="#FBBF2440" strokeDasharray="2 2" />
                        <Tooltip content={({ active, payload }: { active?: boolean; payload?: readonly { payload: Record<string, number | string> }[] }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload;
                            return (
                                <div className="bg-bb-surface border border-bb-border rounded p-2 text-[10px] font-mono shadow-lg">
                                    <div className="text-bb-muted font-semibold">{d.q}</div>
                                    <div className="text-[#38BDF8]">Actual: {Number(d.actual) >= 0 ? '+' : ''}{Number(d.actual).toFixed(1)}%</div>
                                    <div className="text-[#A78BFA]">Model: {Number(d.predicted) >= 0 ? '+' : ''}{Number(d.predicted).toFixed(1)}%</div>
                                    <div style={{ color: Math.abs(Number(d.error)) > 2 ? '#EF4444' : '#22C55E' }}>Error: {Number(d.error) >= 0 ? '+' : ''}{Number(d.error).toFixed(1)}pp</div>
                                </div>
                            );
                        }} />
                        <Bar dataKey="error" name="Residual">
                            {INSAMPLE_RESIDUALS.map((r, i) => (
                                <Cell key={i} fill={Math.abs(r.error) > 2 ? '#EF444480' : r.error > 0 ? '#22C55E80' : '#38BDF880'} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-1 text-[9px] pb-2 text-bb-muted">
                    <span>🟢 Niedoszacowanie (model {'<'} actual)</span>
                    <span>🔵 Przeszacowanie (model {'>'} actual)</span>
                    <span>🔴 |error| {'>'} 2pp</span>
                </div>
            </ChartPanel>

            {/* PMI Scenario table */}
            <ChartPanel title="PMI → PKB SCENARIUSZE" source="GDP = 7.12 − 0.119×PMI + 0.240×IP + 0.220×RetailReal">
                <div className="px-3 pb-2">
                    <div className="text-[10px] text-bb-muted mb-2 font-mono">IP=3.0%, RetailReal=0.3% (fixed) | R² = {(nowcast.modelQuality.r2 * 100).toFixed(0)}%</div>
                    <table className="w-full text-[10px] font-mono" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th className="p-1.5 text-left text-bb-muted border-b border-bb-border text-[9px]">PMI</th>
                                <th className="p-1.5 text-center text-bb-muted border-b border-bb-border text-[9px]">Multi OLS</th>
                                <th className="p-1.5 text-center text-bb-muted border-b border-bb-border text-[9px]">±1σ</th>
                                <th className="p-1.5 text-left text-bb-muted border-b border-bb-border text-[9px]">Scenariusz</th>
                                <th className="p-1.5 text-right text-bb-muted border-b border-bb-border text-[9px]">P(PMI≤)</th>
                                <th className="p-1.5 text-right text-bb-muted border-b border-bb-border text-[9px]">Pasek</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scenarios.map(s => {
                                const isCurrent = s.pmi === 48.4;
                                const barW = Math.min(100, Math.max(0, (s.gdpMulti + 3) / 10 * 100));
                                return (
                                    <tr key={s.pmi} style={{
                                        background: isCurrent ? 'rgba(255,107,0,0.12)' : undefined,
                                        borderLeft: isCurrent ? '3px solid #FF6B00' : '3px solid transparent',
                                    }}>
                                        <td className="p-1.5 border-b border-bb-bg" style={{ color: isCurrent ? '#FF6B00' : s.pmi >= 50 ? '#22C55E' : '#FB923C', fontWeight: isCurrent ? 700 : 400 }}>
                                            {s.pmi.toFixed(1)}
                                        </td>
                                        <td className="p-1.5 text-center border-b border-bb-bg" style={{ color: s.gdpMulti > 3 ? '#22C55E' : s.gdpMulti > 0 ? '#FBBF24' : '#EF4444', fontWeight: isCurrent ? 700 : 400 }}>
                                            {s.gdpMulti >= 0 ? '+' : ''}{s.gdpMulti.toFixed(1)}%
                                        </td>
                                        <td className="p-1.5 text-center border-b border-bb-bg text-[9px] text-bb-muted">{s.ci1s}</td>
                                        <td className={`p-1.5 border-b border-bb-bg ${isCurrent ? 'text-bb-accent' : 'text-bb-muted'}`}>{s.label}</td>
                                        <td className="p-1.5 text-right border-b border-bb-bg text-bb-muted">{s.prob}%</td>
                                        <td className="p-1.5 border-b border-bb-bg">
                                            <div className="h-1.5 bg-bb-border/30 rounded-full w-full">
                                                <div className="h-1.5 rounded-full" style={{ width: `${barW}%`, background: s.gdpMulti > 3 ? '#22C55E' : s.gdpMulti > 0 ? '#FBBF24' : '#EF4444' }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ChartPanel>

            {/* Methodology */}
            <div className="bb-panel overflow-hidden">
                <button onClick={() => setShowMethodology(!showMethodology)}
                    className="w-full px-4 py-3 bg-transparent border-none text-bb-muted text-[10px] text-left cursor-pointer flex justify-between items-center tracking-wider font-semibold"
                >
                    ℹ️ METODOLOGIA I ŹRÓDŁA (V3)
                    <span>{showMethodology ? '▲' : '▼'}</span>
                </button>
                {showMethodology && (
                    <div className="px-4 pb-4 text-[11px] text-bb-muted leading-relaxed space-y-2.5">
                        <p><strong className="text-bb-text">Model V3 (Multiple OLS):</strong> GDP_PL = 7.12 − 0.119×PMI + 0.240×IP + 0.220×RetailReal. Wszystkie współczynniki z regresji na 24 kwartałach polskich danych (2020Q1–2025Q4). Zero korekt ad-hoc.</p>
                        <p><strong className="text-bb-text">R² = 74.7%</strong> (vs 34.9% w V2 z samym PMI). Adj.R² = 70.9%. RMSE = 2.09pp (vs 3.20pp w V2). Poprawa: +40pp R², −35% RMSE.</p>
                        <p><strong className="text-bb-text">Kluczowe odkrycie:</strong> PMI Manufacturing ma <strong className="text-yellow-400">ujemny i nieistotny</strong> współczynnik (β = −0.119, t = −0.65). W obecności IP i RetailReal, PMI nie dodaje informacji. To potwierdza krytykę: PMI pokrywa ~25% PKB i jest redundantny gdy mamy bezpośredni pomiar produkcji.</p>
                        <p><strong className="text-bb-text">Deflacja danych:</strong> Sprzedaż detaliczna jest deflowana o CPI (Retail_real = Retail_nom − CPI). Wynagrodzenia nominalne usunięte — wprowadzały szum inflacyjny (2022: +13% nominal, -3.4% real).</p>
                        <p><strong className="text-bb-text">Yield spread usunięty:</strong> Wskaźnik 12-18M leading, nie nadaje się do nowcastu bieżącego PKB. Powinien być w osobnym module P(Recesja 12M).</p>
                        <p><strong className="text-bb-text">Backtest:</strong> Rolling 8-qt OOS. MAE = {BACKTEST_STATS.mae}pp, RMSE = {BACKTEST_STATS.rmse}pp. Poprawa vs V2: MAE 2.72→1.58pp (−42%), RMSE 3.80→2.59pp (−32%).</p>
                        <p className="text-yellow-400 font-semibold text-[10px] mt-3">
                            ⚠️ Model nadal ma bias: systematycznie niedoszacowuje PKB w 2024-2025 (~+1.5pp). Wskazuje to na brakujący czynnik (konsumpcja usługowa?) poza zasięgiem obecnych wskaźników.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== TOOL 5: REER =====

function REERTool() {
    // Use correct NBP endpoint: exchangerates/rates/a/EUR/last/255
    // NBP caps at 255 per request
    const eurHistory = useQuery<{ rates: { effectiveDate: string; mid: number }[] }>({
        queryKey: ['nbp', 'eurpln-history-255'],
        queryFn: () => fetch('/api/nbp?endpoint=exchangerates/rates/a/EUR/last/255').then(r => r.json()),
        staleTime: 60 * 60 * 1000,
    });
    const cpiPL = useInflationMonthly('PL');
    const plEuCpi = usePLvsEU('cpi');

    const lastCpiPL = cpiPL.data?.data?.PL?.slice(-1)[0]?.value ?? 2.5;
    const lastCpiEU = plEuCpi.data?.data?.EU27_2020?.slice(-1)[0]?.value ?? 2.4;
    const cpiGap = +(lastCpiPL - lastCpiEU).toFixed(1);

    // Build REER index from EUR/PLN history
    const reerData = useMemo(() => {
        const rates = eurHistory.data?.rates;
        if (!rates || rates.length === 0) return [];

        const base = rates[0].mid;
        // Sample every 5th day for ~50 data points
        return rates
            .filter((_, i) => i % 5 === 0 || i === rates.length - 1)
            .map((r, idx, arr) => {
                const neer = (r.mid / base) * 100;
                // REER adjustment: cumulative inflation differential (simplified)
                const monthsFraction = (idx / arr.length) * (rates.length / 30);
                const cpiAdjust = 1 + (monthsFraction * (lastCpiPL - lastCpiEU) / 100);
                const reer = neer * cpiAdjust;
                return {
                    date: r.effectiveDate.slice(5),
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

// ===== TOOL 6: CPI INFLATION FORECASTER =====

function CPIForecasterTool() {
    const hicpIndex = useHICPIndex('hicp_index');
    const hicpFood = useHICPIndex('hicp_food');
    const hicpFuel = useHICPIndex('hicp_fuel');
    const hicpCore = useHICPIndex('hicp_core');
    const hicpCoreYoY = useHICPCoreYoY();
    const brentQuery = useBrent();
    const cpiYoY = useInflationMonthly();
    const [showMethodology, setShowMethodology] = useState(false);

    // Extract latest data
    const indexData = hicpIndex.data?.data?.PL ?? [];
    const foodData = hicpFood.data?.data?.PL ?? [];
    const fuelData = hicpFuel.data?.data?.PL ?? [];
    const coreData = hicpCore.data?.data?.PL ?? [];
    const cpiYoYData = cpiYoY.data?.data?.PL ?? [];

    const isLoading = hicpIndex.isLoading || hicpFood.isLoading || brentQuery.isLoading;

    // Compute M/M from index data
    const computeMM = (data: { date: string; value: number | null }[]) => {
        const valid = data.filter(d => d.value !== null) as { date: string; value: number }[];
        if (valid.length < 2) return [];
        return valid.slice(1).map((d, i) => ({
            date: d.date,
            value: +((d.value / valid[i].value - 1) * 100).toFixed(2),
        }));
    };

    const headlineMMs = computeMM(indexData);
    const foodMMs = computeMM(foodData);
    const fuelMMs = computeMM(fuelData);
    const coreMMs = computeMM(coreData);

    // Latest values
    const lastHeadlineMM = headlineMMs[headlineMMs.length - 1]?.value ?? 0.3;
    const lastFoodMM = foodMMs[foodMMs.length - 1]?.value ?? 0.2;
    const lastFuelMM = fuelMMs[fuelMMs.length - 1]?.value ?? -0.5;
    const lastCoreMM = coreMMs[coreMMs.length - 1]?.value ?? 0.3;
    const lastCPIYoY = cpiYoYData[cpiYoYData.length - 1]?.value ?? 3.7;
    const lastCoreYoY = hicpCoreYoY.data?.data?.PL?.slice(-1)[0]?.value ?? 3.5;
    const lastDate = headlineMMs[headlineMMs.length - 1]?.date ?? '2026-01';

    // Brent data
    const brentLatest = brentQuery.data?.latest?.close ?? 73;
    const brentPrev = brentQuery.data?.data?.[brentQuery.data.data.length - 2]?.close ?? 75;
    const brentChange = +((brentLatest / brentPrev - 1) * 100).toFixed(1);

    // Simple forecasts for next month
    const nextMonth = (() => { const [y, m] = lastDate.split('-').map(Number); const d = new Date(y, m, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
    const nextMonthNum = parseInt(nextMonth.split('-')[1]);

    const fuelForecast = forecastFuelMM(brentChange, 0.5, 0);
    const energyForecast = forecastEnergyMM(nextMonth);
    const foodForecast = forecastFoodMM(0.5, 0.3, nextMonthNum);
    const coreForecast = +(0.7 * lastCoreMM + 0.3 * 0.25).toFixed(2); // Simplified inertia

    const headlineForecastMM = aggregateCPIMM(fuelForecast, energyForecast, foodForecast, coreForecast);

    // Build projected YoY (simplified: current + Δ from forecast vs base)
    const forecastYoY = +(lastCPIYoY + (headlineForecastMM - (headlineMMs[headlineMMs.length - 13]?.value ?? 0.3))).toFixed(1);

    // NBP gap
    const nbpTarget = 2.5;
    const nbpGap = +(forecastYoY - nbpTarget).toFixed(1);

    // Fan chart — project forward 12 months using avg M/M
    const avgMM = headlineMMs.length > 3 ? headlineMMs.slice(-6).reduce((s, d) => s + d.value, 0) / 6 : 0.3;
    const futureMMs = Array.from({ length: 12 }, () => avgMM);
    const validIndex = indexData.filter(d => d.value !== null) as { date: string; value: number }[];
    const fanChartData = validIndex.length > 13 ? generateFanChart(lastCPIYoY, futureMMs, validIndex) : [];

    // Historical CPI YoY for chart (last 36 months)
    const historicalYoY = cpiYoYData.filter(d => d.value !== null).slice(-36) as { date: string; value: number }[];

    // Base effect calendar
    const baseEffect = buildBaseEffectCalendar(headlineMMs.slice(-12));

    // Trend
    const trend = analyzeTrend(headlineMMs.slice(-6).map(d => d.value));

    // Blocks for display
    const blocks: BlockForecast[] = [
        { name: 'Paliwa', label: 'Paliwa silnikowe', weight: CPI_WEIGHTS.fuel, lastMM: lastFuelMM, forecastMM: fuelForecast, contribution: +(CPI_WEIGHTS.fuel * fuelForecast).toFixed(3), confidence: 3, source: 'MODEL', drivers: [{ name: 'Brent', value: brentLatest, unit: 'USD/bbl', change: brentChange, signal: brentChange > 0 ? 'up' : 'down' }] },
        { name: 'Energia', label: 'Nośniki energii', weight: CPI_WEIGHTS.energy, lastMM: 0, forecastMM: energyForecast, contribution: +(CPI_WEIGHTS.energy * energyForecast).toFixed(3), confidence: 5, source: 'MANUAL', drivers: [] },
        { name: 'Żywność', label: 'Żywność i napoje', weight: CPI_WEIGHTS.food, lastMM: lastFoodMM, forecastMM: foodForecast, contribution: +(CPI_WEIGHTS.food * foodForecast).toFixed(3), confidence: 3, source: 'HYBRID', drivers: [] },
        { name: 'Core', label: 'Inflacja bazowa', weight: CPI_WEIGHTS.core, lastMM: lastCoreMM, forecastMM: coreForecast, contribution: +(CPI_WEIGHTS.core * coreForecast).toFixed(3), confidence: 4, source: 'AUTO', drivers: [] },
    ];

    // Data freshness
    const blocksAvailable = [!hicpFuel.isLoading, true, !hicpFood.isLoading, !hicpCore.isLoading].filter(Boolean).length;

    const confBars = (n: number) => '█'.repeat(n) + '░'.repeat(5 - n);

    if (isLoading) {
        return <div className="flex items-center justify-center p-20 text-bb-muted">Ładowanie danych Eurostat HICP...</div>;
    }

    return (
        <div className="space-y-3">
            {/* Header cards */}
            <ChartPanel title="CPI INFLATION FORECASTER PRO" source="Bottom-Up Decomposition · Eurostat HICP · NBP · GUS">
                <div className="grid grid-cols-5 gap-2 p-3">
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-accent tracking-wider mb-1">CPI R/R PROGNOZA</div>
                        <div className="text-2xl font-mono font-bold" style={{ color: forecastYoY > 3.5 ? '#EF4444' : forecastYoY > 2.5 ? '#FBBF24' : '#22C55E' }}>{forecastYoY.toFixed(1)}%</div>
                        <div className="text-[8px] text-bb-muted mt-1">±{BLOCK_RMSE.headline}pp RMSE</div>
                        <div className="text-[8px] text-bb-muted">{trend.emoji} vs {lastCPIYoY.toFixed(1)}%</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">CPI M/M PROGNOZA</div>
                        <div className="text-2xl font-mono font-bold text-bb-text">{headlineForecastMM >= 0 ? '+' : ''}{headlineForecastMM.toFixed(2)}%</div>
                        <div className="text-[8px] text-bb-muted mt-1">na {nextMonth}</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">CORE R/R</div>
                        <div className="text-2xl font-mono font-bold text-bb-text">{lastCoreYoY.toFixed(1)}%</div>
                        <div className="text-[8px] text-bb-muted mt-1">ex food & energy</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] tracking-wider mb-1" style={{ color: nbpGap > 0 ? '#EF4444' : '#22C55E' }}>NBP GAP</div>
                        <div className="text-2xl font-mono font-bold" style={{ color: nbpGap > 0 ? '#EF4444' : '#22C55E' }}>{nbpGap >= 0 ? '+' : ''}{nbpGap}pp</div>
                        <div className="text-[8px] text-bb-muted mt-1">{forecastYoY.toFixed(1)} vs {nbpTarget}%</div>
                        <div className="text-[8px]" style={{ color: nbpGap > 1 ? '#EF4444' : '#FBBF24' }}>{nbpGap > 1 ? 'ABOVE' : nbpGap > 0 ? 'NEAR' : 'BELOW'} TARGET</div>
                    </div>
                    <div className="bb-panel p-3 text-center">
                        <div className="text-[9px] text-bb-muted tracking-wider mb-1">STATUS</div>
                        <div className="text-lg font-mono text-bb-text">{confBars(blocksAvailable)}</div>
                        <div className="text-[8px] text-bb-muted mt-1">{blocksAvailable}/4 bloków auto</div>
                        <div className="text-[8px] text-bb-muted">{trend.label}</div>
                    </div>
                </div>
            </ChartPanel>

            {/* Fan Chart */}
            {fanChartData.length > 0 && (
                <ChartPanel title="FAN CHART — CPI R/R PROGNOZA 12M" source="Bottom-Up Aggregation · ±1σ/±2σ">
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={[...historicalYoY.slice(-12).map(d => ({ date: d.date, median: d.value, nbpTarget: 2.5 })), ...fanChartData]} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} interval={2} />
                            <YAxis tick={{ fill: '#475569', fontSize: 8 }} tickLine={false} domain={[0, 'auto']} unit="%" />
                            <ReferenceLine y={2.5} stroke="#FBBF24" strokeDasharray="5 3" label={{ value: 'Cel NBP 2.5%', fill: '#FBBF24', fontSize: 9, position: 'right' }} />
                            <Area type="monotone" dataKey="p90" fill="#FF6B0008" stroke="none" />
                            <Area type="monotone" dataKey="p75" fill="#FF6B0015" stroke="none" />
                            <Area type="monotone" dataKey="p25" fill="#FF6B0015" stroke="none" />
                            <Area type="monotone" dataKey="p10" fill="#FF6B0008" stroke="none" />
                            <Line type="monotone" dataKey="median" stroke="#FF6B00" strokeWidth={2} dot={false} name="CPI R/R %" />
                            <Line type="monotone" dataKey="nbpTarget" stroke="#FBBF2440" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                            <Tooltip content={({ active, payload }: { active?: boolean; payload?: readonly { payload: Record<string, number | string> }[] }) => {
                                if (!active || !payload?.[0]) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-bb-surface border border-bb-border rounded p-2 text-[10px] font-mono shadow-lg">
                                        <div className="text-bb-muted">{String(d.date)}</div>
                                        <div className="text-[#FF6B00]">CPI: {Number(d.median).toFixed(1)}%</div>
                                        {d.p10 !== undefined && <div className="text-bb-muted">90% CI: {Number(d.p10).toFixed(1)}—{Number(d.p90).toFixed(1)}%</div>}
                                    </div>
                                );
                            }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartPanel>
            )}

            {/* Contribution decomposition */}
            <div className="bb-panel">
                <div className="px-3 pt-3 text-[10px] text-bb-muted tracking-wider font-semibold">📊 DEKOMPOZYCJA KONTRYBUCJI (pp do CPI R/R)</div>
                <div className="p-3">
                    {blocks.map((b, i) => {
                        const barW = Math.min(100, Math.max(0, Math.abs(b.contribution) / 2.5 * 100));
                        const color = b.contribution > 1.0 ? '#EF4444' : b.contribution > 0.3 ? '#FBBF24' : b.contribution > 0 ? '#22C55E' : '#3B82F6';
                        return (
                            <div key={i} className="flex items-center gap-3 mb-2 text-[10px] font-mono">
                                <div className="w-20 text-bb-muted">{b.label}</div>
                                <div className="flex-1 h-3 bg-bb-border/20 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${barW}%`, background: color }} />
                                </div>
                                <div className="w-16 text-right" style={{ color }}>{b.contribution >= 0 ? '+' : ''}{b.contribution.toFixed(2)}pp</div>
                                <div className="w-12 text-right text-bb-muted">({(b.weight * 100).toFixed(0)}%)</div>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-3 mt-1 pt-1 border-t border-bb-border/30 text-[10px] font-mono">
                        <div className="w-20 text-bb-accent font-bold">RAZEM</div>
                        <div className="flex-1" />
                        <div className="w-16 text-right text-bb-accent font-bold">{blocks.reduce((s, b) => s + b.contribution, 0).toFixed(2)}pp</div>
                        <div className="w-12 text-right text-bb-muted">(100%)</div>
                    </div>
                </div>
            </div>

            {/* Block detail table */}
            <div className="bb-panel">
                <div className="px-3 pt-3 text-[10px] text-bb-muted tracking-wider font-semibold">📋 PROGNOZA M/M PO BLOKACH</div>
                <table className="w-full text-[10px] mt-2">
                    <thead>
                        <tr className="border-b border-bb-border text-[9px] text-bb-muted">
                            <th className="text-left py-1.5 px-3">Blok</th>
                            <th className="text-right py-1.5">Waga</th>
                            <th className="text-right py-1.5">Ostatni M/M</th>
                            <th className="text-right py-1.5">Prognoza M/M</th>
                            <th className="text-center py-1.5">Δ</th>
                            <th className="text-center py-1.5">Źródło</th>
                            <th className="text-right py-1.5 px-3">Conf</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocks.map((b, i) => {
                            const delta = b.forecastMM - b.lastMM;
                            return (
                                <tr key={i} className="border-b border-bb-border/20">
                                    <td className="py-1.5 px-3 text-bb-text font-mono">{b.label}</td>
                                    <td className="py-1.5 text-right text-bb-muted">{(b.weight * 100).toFixed(1)}%</td>
                                    <td className="py-1.5 text-right text-bb-text">{b.lastMM >= 0 ? '+' : ''}{b.lastMM.toFixed(1)}%</td>
                                    <td className="py-1.5 text-right text-bb-accent font-bold">{b.forecastMM >= 0 ? '+' : ''}{b.forecastMM.toFixed(1)}%</td>
                                    <td className="py-1.5 text-center" style={{ color: delta > 0 ? '#EF4444' : delta < 0 ? '#22C55E' : '#475569' }}>
                                        {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}
                                    </td>
                                    <td className="py-1.5 text-center text-bb-muted">{b.source}</td>
                                    <td className="py-1.5 text-right px-3 text-[9px] font-mono text-bb-muted">{confBars(b.confidence)}</td>
                                </tr>
                            );
                        })}
                        <tr className="border-t border-bb-border/50">
                            <td className="py-1.5 px-3 text-bb-accent font-bold">CPI Total</td>
                            <td className="py-1.5 text-right text-bb-muted">100%</td>
                            <td className="py-1.5 text-right text-bb-muted">{lastHeadlineMM >= 0 ? '+' : ''}{lastHeadlineMM.toFixed(1)}%</td>
                            <td className="py-1.5 text-right text-bb-accent font-bold">{headlineForecastMM >= 0 ? '+' : ''}{headlineForecastMM.toFixed(2)}%</td>
                            <td colSpan={3} className="py-1.5 px-3 text-right text-bb-muted text-[9px]">MODEL</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Base effect calendar */}
            {baseEffect.length > 0 && (
                <ChartPanel title="EFEKT BAZY — KALENDARZ 12M" source="Eurostat HICP M/M historical">
                    <div className="grid grid-cols-6 gap-2 p-3">
                        {baseEffect.map((b, i) => (
                            <div key={i} className="bb-panel p-2 text-center text-[9px] font-mono" style={{
                                borderColor: b.direction === 'high' ? '#EF444440' : b.direction === 'low' ? '#22C55E40' : '#1E293B',
                                background: b.direction === 'high' ? '#EF444408' : b.direction === 'low' ? '#22C55E08' : undefined,
                            }}>
                                <div className="text-bb-muted font-semibold">{b.label}</div>
                                <div style={{ color: b.baseValueMM > 0.3 ? '#EF4444' : b.baseValueMM < 0 ? '#22C55E' : '#94A3B8' }}>
                                    {b.baseValueMM >= 0 ? '+' : ''}{b.baseValueMM.toFixed(1)}%
                                </div>
                                <div className="text-[8px] text-bb-muted mt-0.5">{b.direction === 'high' ? '▓▓▓▓' : b.direction === 'low' ? '░░░░' : '▒▒▒▒'}</div>
                            </div>
                        ))}
                    </div>
                    <div className="px-3 pb-2 text-[8px] text-bb-muted">▓▓ = wysoka baza (spadek R/R) | ░░ = niska baza (wzrost R/R) | ▒▒ = neutralna</div>
                </ChartPanel>
            )}

            {/* Consensus comparison */}
            <div className="bb-panel p-3">
                <div className="text-[10px] text-bb-muted tracking-wider font-semibold mb-2">📊 PORÓWNANIE Z KONSENSUSEM</div>
                <div className="grid grid-cols-4 gap-3 text-center">
                    {[
                        { label: 'Nasz model', value: forecastYoY, color: '#FF6B00', sub: 'Bottom-Up' },
                        { label: 'NBP projekcja', value: CPI_CONSENSUS.nbpProjection.cpi2026, color: '#FBBF24', sub: CPI_CONSENSUS.nbpProjection.date },
                        { label: 'Bloomberg', value: CPI_CONSENSUS.bloomberg.cpi2026, color: '#3B82F6', sub: CPI_CONSENSUS.bloomberg.source.split(',')[1] },
                        { label: 'Focus Econ.', value: CPI_CONSENSUS.focusEconomics.cpi2026, color: '#A78BFA', sub: CPI_CONSENSUS.focusEconomics.source.split(',')[1] },
                    ].map((c, i) => (
                        <div key={i} className="bb-panel p-3">
                            <div className="text-[9px] text-bb-muted mb-1">{c.label}</div>
                            <div className="text-xl font-mono font-bold" style={{ color: c.color }}>{c.value.toFixed(1)}%</div>
                            <div className="text-[8px] text-bb-muted">{c.sub}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-[9px] text-bb-muted font-mono text-center">
                    Model vs konsensus: <span style={{ color: Math.abs(forecastYoY - CPI_CONSENSUS.bloomberg.cpi2026) > 0.5 ? '#FBBF24' : '#22C55E' }}>
                        {forecastYoY > CPI_CONSENSUS.bloomberg.cpi2026 ? '+' : ''}{(forecastYoY - CPI_CONSENSUS.bloomberg.cpi2026).toFixed(1)}pp vs BBG
                    </span>
                </div>
            </div>

            {/* Methodology */}
            <div className="bb-panel overflow-hidden">
                <button onClick={() => setShowMethodology(!showMethodology)} className="w-full px-4 py-3 bg-transparent border-none text-bb-muted text-[10px] text-left cursor-pointer flex justify-between items-center tracking-wider font-semibold">
                    ℹ️ METODOLOGIA I ŹRÓDŁA
                    <span>{showMethodology ? '▲' : '▼'}</span>
                </button>
                {showMethodology && (
                    <div className="px-4 pb-4 text-[11px] text-bb-muted leading-relaxed space-y-2">
                        <p><strong className="text-bb-text">Model:</strong> Bottom-Up CPI Decomposition. Rozbija koszyk inflacyjny na 4 bloki (Paliwa 5.5%, Energia 11.1%, Żywność 25.9%, Core 57.5%), prognozuje każdy osobno M/M, agreguje z wagami GUS.</p>
                        <p><strong className="text-bb-text">Paliwa:</strong> CPI_fuel_MM = 0.68 × ΔBrent% + 0.25 × ΔUSDPLN%. Pass-through z danych Eurostat CP0722.</p>
                        <p><strong className="text-bb-text">Energia:</strong> Model dyskretny — ΔenergyMM = 0 normalnie, = zmiana taryfy URE w miesiącu zmiany. Dane manualne z etykietą [MANUAL].</p>
                        <p><strong className="text-bb-text">Żywność:</strong> γ₁×ΔFAO(t-3) + γ₂×ΔEURPLN(t-1) + sezonowość. FAO Food Index z 3-miesięcznym opóźnieniem.</p>
                        <p><strong className="text-bb-text">Core:</strong> Silna inercja. Δcore ≈ 0.70 × prev + δ₁×ΔPPI(t-3) + δ₂×ΔwagesReal(t-2). Autoregresja to najsilniejszy komponent.</p>
                        <p><strong className="text-bb-text">Fan chart:</strong> σ_h = σ_base × √h. Niepewność rośnie z horyzontem prognozy.</p>
                        <p><strong className="text-bb-text">Wagi:</strong> GUS 2025 (COICOP). Aktualizacja: marzec każdego roku.</p>
                        <p className="text-yellow-400 text-[10px]">⚠️ DISCLAIMER: Narzędzie analityczne, nie rekomendacja inwestycyjna. Prognozy obarczone niepewnością.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

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
                {activeTab === 'cpi' && <CPIForecasterTool />}
            </div>
        </div>
    );
}
