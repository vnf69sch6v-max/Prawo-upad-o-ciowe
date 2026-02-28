'use client';

import { formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, ComposedChart, Line, Legend
} from 'recharts';
import { ChartPanel, RangeButtons, BloombergTooltip, BloombergCursor, useRangeFilter, useActiveBar, CHART_ANIM } from '@/components/ChartUtils';

// ===== REAL DATA from GUS (stat.gov.pl) =====
// Last updated: 2026-02-28 — verified against GUS, S&P Global, Eurostat

const GDP_DATA = [
    { quarter: 'Q1 23', yoy: -0.3 }, { quarter: 'Q2 23', yoy: -0.6 },
    { quarter: 'Q3 23', yoy: 0.5 }, { quarter: 'Q4 23', yoy: 1.0 },
    { quarter: 'Q1 24', yoy: 2.0 }, { quarter: 'Q2 24', yoy: 3.2 },
    { quarter: 'Q3 24', yoy: 2.7 }, { quarter: 'Q4 24', yoy: 3.2 },
    { quarter: 'Q1 25', yoy: 3.2 }, { quarter: 'Q2 25', yoy: 3.4 },
    { quarter: 'Q3 25', yoy: 3.8 }, { quarter: 'Q4 25', yoy: 4.0 },
];

const CPI_DATA = [
    { month: '01.25', cpi: 5.3 }, { month: '02.25', cpi: 4.9 },
    { month: '03.25', cpi: 4.9 }, { month: '04.25', cpi: 4.3 },
    { month: '05.25', cpi: 4.0 }, { month: '06.25', cpi: 4.1 },
    { month: '07.25', cpi: 3.1 }, { month: '08.25', cpi: 2.9 },
    { month: '09.25', cpi: 2.9 }, { month: '10.25', cpi: 2.8 },
    { month: '11.25', cpi: 2.5 }, { month: '12.25', cpi: 2.4 },
    { month: '01.26', cpi: 2.2 },
];

const UNEMPLOYMENT_DATA = [
    { month: '01.25', rate: 5.5 }, { month: '02.25', rate: 5.4 },
    { month: '03.25', rate: 5.2 }, { month: '04.25', rate: 5.2 },
    { month: '05.25', rate: 5.0 }, { month: '06.25', rate: 5.0 },
    { month: '07.25', rate: 5.4 }, { month: '08.25', rate: 5.4 },
    { month: '09.25', rate: 5.5 }, { month: '10.25', rate: 5.6 },
    { month: '11.25', rate: 5.6 }, { month: '12.25', rate: 5.7 },
    { month: '01.26', rate: 6.0 },
];

const WAGES_DATA = [
    { month: '01.25', yoy: 9.2 }, { month: '02.25', yoy: 8.7 },
    { month: '03.25', yoy: 8.5 }, { month: '04.25', yoy: 8.1 },
    { month: '05.25', yoy: 7.8 }, { month: '06.25', yoy: 10.5 },
    { month: '07.25', yoy: 10.6 }, { month: '08.25', yoy: 11.1 },
    { month: '09.25', yoy: 10.3 }, { month: '10.25', yoy: 10.2 },
    { month: '11.25', yoy: 9.8 }, { month: '12.25', yoy: 8.6 },
];

const INDUSTRIAL_DATA = [
    { month: '01.25', yoy: 1.4 }, { month: '02.25', yoy: 3.2 },
    { month: '03.25', yoy: 0.1 }, { month: '04.25', yoy: 7.7 },
    { month: '05.25', yoy: -1.7 }, { month: '06.25', yoy: -2.6 },
    { month: '07.25', yoy: 4.7 }, { month: '08.25', yoy: -1.5 },
    { month: '09.25', yoy: -0.3 }, { month: '10.25', yoy: 4.7 },
    { month: '11.25', yoy: 1.8 }, { month: '12.25', yoy: -0.7 },
];

const RETAIL_SALES = [
    { month: '01.25', yoy: 3.8 }, { month: '02.25', yoy: 4.1 },
    { month: '03.25', yoy: 5.2 }, { month: '04.25', yoy: 4.6 },
    { month: '05.25', yoy: 4.8 }, { month: '06.25', yoy: 5.1 },
    { month: '07.25', yoy: 3.9 }, { month: '08.25', yoy: 4.3 },
    { month: '09.25', yoy: 4.5 }, { month: '10.25', yoy: 5.0 },
    { month: '11.25', yoy: 4.7 }, { month: '12.25', yoy: 5.3 },
];

const PMI_DATA = [
    { month: '01.25', pmi: 48.8 }, { month: '02.25', pmi: 50.6 },
    { month: '03.25', pmi: 50.7 }, { month: '04.25', pmi: 50.2 },
    { month: '05.25', pmi: 47.1 }, { month: '06.25', pmi: 44.8 },
    { month: '07.25', pmi: 45.9 }, { month: '08.25', pmi: 46.6 },
    { month: '09.25', pmi: 48.0 }, { month: '10.25', pmi: 48.8 },
    { month: '11.25', pmi: 49.1 }, { month: '12.25', pmi: 48.5 },
    { month: '01.26', pmi: 48.8 },
];

const EU_COMPARISON = [
    { indicator: 'PKB YoY', pl: 3.6, eu: 0.9, unit: '%' },
    { indicator: 'CPI YoY', pl: 2.2, eu: 2.4, unit: '%' },
    { indicator: 'Bezrobocie', pl: 6.0, eu: 5.9, unit: '%' },
    { indicator: 'Dług/PKB', pl: 49.8, eu: 81.7, unit: '%' },
    { indicator: 'Deficyt/PKB', pl: -5.1, eu: -3.0, unit: '%' },
    { indicator: 'Stopa ref.', pl: 4.00, eu: 2.65, unit: '%' },
];

const GRID = { strokeDasharray: '3 3', stroke: '#1E293B' };
const TICK = { fill: '#64748B', fontSize: 10 };

export default function MacroPage() {
    const cpiFilter = useRangeFilter(CPI_DATA);
    const unempFilter = useRangeFilter(UNEMPLOYMENT_DATA);
    const wagesFilter = useRangeFilter(WAGES_DATA);
    const industrialFilter = useRangeFilter(INDUSTRIAL_DATA);
    const retailFilter = useRangeFilter(RETAIL_SALES);
    const pmiFilter = useRangeFilter(PMI_DATA);
    const gdpBar = useActiveBar();

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">MACRO DATA</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">SRC: GUS · S&P GLOBAL · EUROSTAT · 2026-02-28</span>
            </div>

            <div className="p-2 space-y-2">
                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-6 gap-2">
                    {[
                        { label: 'PKB YoY', value: '+4.0%', change: 0.2, color: '#22C55E' },
                        { label: 'Inflacja CPI', value: '2.2%', change: -0.2, color: '#FBBF24' },
                        { label: 'Bezrobocie', value: '6.0%', change: 0.3, color: '#3B82F6' },
                        { label: 'Wynagrodzenia', value: '+8.6%', change: -0.9, color: '#FF6B00' },
                        { label: 'PMI', value: '48.8', change: 0.3, color: '#A855F7' },
                        { label: 'Sprzedaż det.', value: '+5.3%', change: 0.6, color: '#06B6D4' },
                    ].map((item, i) => (
                        <div key={i} className="bb-panel" style={{ padding: '8px 10px' }}>
                            <div className="text-[9px] text-bb-muted uppercase mb-0.5">{item.label}</div>
                            <div className="text-base font-mono font-bold" style={{ color: item.color }}>
                                {item.value}
                            </div>
                            <span className={`text-[10px] font-mono ${getChangeColor(item.change)}`}>
                                {getChangeArrow(item.change)} {formatPercent(item.change)} pp
                            </span>
                        </div>
                    ))}
                </div>

                {/* GDP — Click to highlight */}
                <ChartPanel title="PKB — ZMIANA ROCZNA (YOY)" source="GUS" date="Q4 2025">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={GDP_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            onClick={(e) => {
                                if (e?.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                                    gdpBar.setActiveIndex(gdpBar.activeIndex === e.activeTooltipIndex ? null : e.activeTooltipIndex);
                                }
                            }}
                        >
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="quarter" tick={TICK} stroke="#1E293B" />
                            <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                            <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                            <ReferenceLine y={0} stroke="#64748B" />
                            <Bar
                                dataKey="yoy"
                                fill="#22C55E"
                                radius={[2, 2, 0, 0]}
                                isAnimationActive
                                animationDuration={CHART_ANIM.duration}
                            >
                                {GDP_DATA.map((_, i) => {
                                    const isActive = gdpBar.activeIndex === i;
                                    const isDimmed = gdpBar.activeIndex !== null && !isActive;
                                    return (
                                        <rect key={i} opacity={isDimmed ? 0.3 : 1} stroke={isActive ? '#FF6B00' : 'none'} strokeWidth={isActive ? 1.5 : 0} />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* CPI with range */}
                    <ChartPanel
                        title="INFLACJA CPI (YOY) Z CELEM NBP"
                        source="GUS"
                        date="01.2026"
                        rangeButtons={<RangeButtons active={cpiFilter.range} onChange={cpiFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <ComposedChart data={cpiFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" domain={[0, 'auto']} />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <ReferenceLine y={2.5} stroke="#FBBF24" strokeDasharray="5 5" label={{ value: 'Cel 2.5%', fill: '#FBBF24', fontSize: 10, position: 'right' }} />
                                <ReferenceLine y={1.5} stroke="#64748B" strokeDasharray="3 3" />
                                <ReferenceLine y={3.5} stroke="#64748B" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="cpi" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    {/* Unemployment with range */}
                    <ChartPanel
                        title="STOPA BEZROBOCIA (%)"
                        source="GUS"
                        date="01.2026"
                        rangeButtons={<RangeButtons active={unempFilter.range} onChange={unempFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={unempFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="unempGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" domain={[4, 7]} />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <Area type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} fill="url(#unempGrad)" dot={{ fill: '#3B82F6', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* Wages with range */}
                    <ChartPanel
                        title="WYNAGRODZENIA — YOY"
                        source="GUS"
                        date="12.2025"
                        rangeButtons={<RangeButtons active={wagesFilter.range} onChange={wagesFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={wagesFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <Bar dataKey="yoy" fill="#FF6B00" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    {/* Industrial Production with range */}
                    <ChartPanel
                        title="PRODUKCJA PRZEMYSŁOWA (YOY)"
                        source="GUS"
                        date="12.2025"
                        rangeButtons={<RangeButtons active={industrialFilter.range} onChange={industrialFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={industrialFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <ReferenceLine y={0} stroke="#64748B" strokeWidth={1} />
                                <Bar dataKey="yoy" fill="#A855F7" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* Retail Sales with range */}
                    <ChartPanel
                        title="SPRZEDAŻ DETALICZNA (YOY)"
                        source="GUS"
                        date="12.2025"
                        rangeButtons={<RangeButtons active={retailFilter.range} onChange={retailFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={retailFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" unit="%" />
                                <Tooltip content={<BloombergTooltip unit="%" />} cursor={<BloombergCursor height={250} />} />
                                <Area type="monotone" dataKey="yoy" stroke="#06B6D4" strokeWidth={2} fill="url(#retailGrad)" dot={{ fill: '#06B6D4', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    {/* PMI with range */}
                    <ChartPanel
                        title="PMI PRZEMYSŁOWY (S&P GLOBAL)"
                        source="S&P Global"
                        date="01.2026"
                        rangeButtons={<RangeButtons active={pmiFilter.range} onChange={pmiFilter.setRange} />}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <ComposedChart data={pmiFilter.filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid {...GRID} />
                                <XAxis dataKey="month" tick={TICK} stroke="#1E293B" />
                                <YAxis tick={TICK} stroke="#1E293B" domain={[42, 54]} />
                                <Tooltip content={<BloombergTooltip />} cursor={<BloombergCursor height={250} />} />
                                <ReferenceLine y={50} stroke="#FBBF24" strokeDasharray="5 5" label={{ value: '50', fill: '#FBBF24', fontSize: 9, position: 'right' }} />
                                <Line type="monotone" dataKey="pmi" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7', r: 3 }} isAnimationActive animationDuration={CHART_ANIM.duration} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                {/* Eurostat PL vs EU */}
                <ChartPanel title="POLSKA VS UNIA EUROPEJSKA (EUROSTAT)" source="Eurostat" date="Ostatnie dostępne dane">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={EU_COMPARISON} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
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
