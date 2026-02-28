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
import { CONSENSUS, CPI_DATA_PL, GDP_QUARTERLY_PL } from '@/lib/static-data';
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
    const yieldCurve = useYieldCurve();

    const y10 = yieldCurve.curve[2]?.yield ?? 4.96;
    const y2 = yieldCurve.curve[0]?.yield ?? 3.56;
    const spread = +(y10 - y2).toFixed(2);

    const isLoading = industrialQuery.isLoading || retailQuery.isLoading;

    // Get last values — use null to indicate loading
    const lastIndustrial = industrialQuery.data?.data?.PL?.slice(-1)[0]?.value ?? null;
    const lastRetail = retailQuery.data?.data?.PL?.slice(-1)[0]?.value ?? null;

    // Simple CLI calculation
    const indicators = [
        { name: 'PMI Manufacturing', value: 48.6, weight: 0.30, loading: false, signal: 48.6 >= 50 ? '🟢' : 48.6 >= 47 ? '🟡' : '🔴' },
        { name: 'Produkcja przem.', value: lastIndustrial ?? 0, weight: 0.25, loading: lastIndustrial === null, signal: lastIndustrial === null ? '⏳' : lastIndustrial > 2 ? '🟢' : lastIndustrial > 0 ? '🟡' : '🔴' },
        { name: 'Sprzedaż det.', value: lastRetail ?? 0, weight: 0.20, loading: lastRetail === null, signal: lastRetail === null ? '⏳' : lastRetail > 2 ? '🟢' : lastRetail > 0 ? '🟡' : '🔴' },
        { name: 'Yield spread 10Y-2Y', value: spread, weight: 0.10, loading: false, signal: spread > 0 ? '🟢' : '🔴' },
    ];

    // Weighted signal
    const readyIndicators = indicators.filter(i => !i.loading);
    const greenCount = readyIndicators.filter(i => i.signal === '🟢').length;
    const overallSignal = isLoading ? '⏳ ŁADOWANIE...' : greenCount >= 3 ? '🟢 EXPANSION' : greenCount >= 2 ? '🟡 NEUTRAL' : '🔴 CONTRACTION';
    const cli = readyIndicators.reduce((s, ind) => {
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
