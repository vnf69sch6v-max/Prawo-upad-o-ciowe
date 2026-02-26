'use client';

import { formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, ReferenceLine, ComposedChart, Line, Legend
} from 'recharts';

// ===== REAL DATA from GUS (stat.gov.pl) =====
// Last updated: February 2026

const GDP_DATA = [
    { quarter: 'Q1 23', yoy: -0.3 }, { quarter: 'Q2 23', yoy: -0.6 },
    { quarter: 'Q3 23', yoy: 0.5 }, { quarter: 'Q4 23', yoy: 1.0 },
    { quarter: 'Q1 24', yoy: 1.9 }, { quarter: 'Q2 24', yoy: 3.2 },
    { quarter: 'Q3 24', yoy: 2.7 }, { quarter: 'Q4 24', yoy: 3.5 },
    { quarter: 'Q1 25', yoy: 3.4 }, { quarter: 'Q2 25', yoy: 3.8 },
    { quarter: 'Q3 25', yoy: 3.6 },
];

const CPI_DATA = [
    { month: '01.25', cpi: 4.7 }, { month: '02.25', cpi: 4.7 },
    { month: '03.25', cpi: 4.9 }, { month: '04.25', cpi: 4.2 },
    { month: '05.25', cpi: 3.6 }, { month: '06.25', cpi: 3.7 },
    { month: '07.25', cpi: 4.7 }, { month: '08.25', cpi: 4.3 },
    { month: '09.25', cpi: 4.9 }, { month: '10.25', cpi: 5.0 },
    { month: '11.25', cpi: 4.7 }, { month: '12.25', cpi: 4.8 },
    { month: '01.26', cpi: 4.9 },
];

const UNEMPLOYMENT_DATA = [
    { month: '01.25', rate: 5.5 }, { month: '02.25', rate: 5.4 },
    { month: '03.25', rate: 5.2 }, { month: '04.25', rate: 5.0 },
    { month: '05.25', rate: 4.9 }, { month: '06.25', rate: 4.9 },
    { month: '07.25', rate: 4.9 }, { month: '08.25', rate: 4.9 },
    { month: '09.25', rate: 5.0 }, { month: '10.25', rate: 5.0 },
    { month: '11.25', rate: 5.1 }, { month: '12.25', rate: 5.1 },
    { month: '01.26', rate: 5.4 },
];

const WAGES_DATA = [
    { month: '01.25', yoy: 9.2 }, { month: '02.25', yoy: 8.7 },
    { month: '03.25', yoy: 8.5 }, { month: '04.25', yoy: 8.1 },
    { month: '05.25', yoy: 7.8 }, { month: '06.25', yoy: 10.5 },
    { month: '07.25', yoy: 10.6 }, { month: '08.25', yoy: 11.1 },
    { month: '09.25', yoy: 10.3 }, { month: '10.25', yoy: 10.2 },
    { month: '11.25', yoy: 9.8 }, { month: '12.25', yoy: 9.5 },
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
    { month: '11.25', yoy: 4.7 }, { month: '12.25', yoy: 3.5 },
];

const PMI_DATA = [
    { month: '01.25', pmi: 48.8 }, { month: '02.25', pmi: 49.2 },
    { month: '03.25', pmi: 50.4 }, { month: '04.25', pmi: 49.1 },
    { month: '05.25', pmi: 48.5 }, { month: '06.25', pmi: 47.3 },
    { month: '07.25', pmi: 47.0 }, { month: '08.25', pmi: 47.8 },
    { month: '09.25', pmi: 48.6 }, { month: '10.25', pmi: 49.2 },
    { month: '11.25', pmi: 48.4 }, { month: '12.25', pmi: 49.1 },
    { month: '01.26', pmi: 49.5 },
];

// Eurostat comparison PL vs EU
const EU_COMPARISON = [
    { indicator: 'PKB YoY', pl: 3.6, eu: 0.9, unit: '%' },
    { indicator: 'CPI YoY', pl: 4.9, eu: 2.4, unit: '%' },
    { indicator: 'Bezrobocie', pl: 5.4, eu: 5.9, unit: '%' },
    { indicator: 'Dług/PKB', pl: 49.8, eu: 81.7, unit: '%' },
    { indicator: 'Deficyt/PKB', pl: -5.1, eu: -3.0, unit: '%' },
    { indicator: 'Stopa ref.', pl: 5.75, eu: 2.65, unit: '%' },
];

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#111827', border: '1px solid #1E293B',
        borderRadius: '8px', color: '#E2E8F0', fontSize: '12px',
    },
};

function MacroCard({ title, children, source, date }: {
    title: string; children: React.ReactNode; source?: string; date?: string;
}) {
    return (
        <div className="data-card">
            <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">{title}</h3>
            {children}
            {(source || date) && (
                <div className="flex justify-between mt-3 pt-2 border-t border-bb-border/50">
                    {source && <span className="text-[10px] text-bb-muted uppercase">{source}</span>}
                    {date && <span className="text-[10px] text-bb-muted">{date}</span>}
                </div>
            )}
        </div>
    );
}

export default function MacroPage() {
    return (
        <div className="min-h-screen">
            <div className="px-6 py-4 border-b border-bb-border">
                <h1 className="text-lg font-semibold text-bb-text">Dane makroekonomiczne</h1>
                <p className="text-xs text-bb-muted">PKB, inflacja, bezrobocie, wynagrodzenia, PMI, sprzedaż · Źródło: GUS, S&P Global, Eurostat</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
                    {[
                        { label: 'PKB YoY', value: '+3.6%', change: 0.4, color: '#22C55E' },
                        { label: 'Inflacja CPI', value: '4.9%', change: 0.9, color: '#FBBF24' },
                        { label: 'Bezrobocie', value: '5.4%', change: 0.3, color: '#3B82F6' },
                        { label: 'Wynagrodzenia', value: '+9.5%', change: -0.3, color: '#FF6B00' },
                        { label: 'PMI', value: '49.5', change: 0.4, color: '#A855F7' },
                        { label: 'Sprzedaż det.', value: '+3.5%', change: -1.2, color: '#06B6D4' },
                    ].map((item, i) => (
                        <div key={i} className="data-card">
                            <div className="text-[10px] text-bb-muted mb-1">{item.label}</div>
                            <div className="text-lg font-mono font-bold" style={{ color: item.color }}>
                                {item.value}
                            </div>
                            <span className={`text-xs font-mono ${getChangeColor(item.change)}`}>
                                {getChangeArrow(item.change)} {formatPercent(item.change)} pp
                            </span>
                        </div>
                    ))}
                </div>

                {/* GDP Chart */}
                <MacroCard title="PKB — zmiana roczna (YoY)" source="GUS" date="Q3 2025">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={GDP_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="quarter" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                            <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'PKB YoY']} />
                            <ReferenceLine y={0} stroke="#64748B" />
                            <Bar dataKey="yoy" fill="#22C55E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </MacroCard>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* CPI Chart with target band */}
                    <MacroCard title="Inflacja CPI (YoY) z celem NBP" source="GUS" date="01.2026">
                        <ResponsiveContainer width="100%" height={250}>
                            <ComposedChart data={CPI_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" domain={[0, 'auto']} />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'CPI YoY']} />
                                <ReferenceLine y={2.5} stroke="#FBBF24" strokeDasharray="5 5" label={{ value: 'Cel 2.5%', fill: '#FBBF24', fontSize: 10, position: 'right' }} />
                                <ReferenceLine y={1.5} stroke="#64748B" strokeDasharray="3 3" />
                                <ReferenceLine y={3.5} stroke="#64748B" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="cpi" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </MacroCard>

                    {/* Unemployment */}
                    <MacroCard title="Stopa bezrobocia (%)" source="GUS" date="01.2026">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={UNEMPLOYMENT_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="unempGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" domain={[4, 6]} />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Bezrobocie']} />
                                <Area type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} fill="url(#unempGrad)" dot={{ fill: '#3B82F6', r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </MacroCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Wages */}
                    <MacroCard title="Wynagrodzenia — zmiana roczna (YoY)" source="GUS" date="12.2025">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={WAGES_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Wynagrodzenia YoY']} />
                                <Bar dataKey="yoy" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </MacroCard>

                    {/* Industrial Production */}
                    <MacroCard title="Produkcja przemysłowa (YoY)" source="GUS" date="12.2025">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={INDUSTRIAL_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Produkcja YoY']} />
                                <ReferenceLine y={0} stroke="#64748B" strokeWidth={1} />
                                <Bar dataKey="yoy" fill="#A855F7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </MacroCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Retail Sales */}
                    <MacroCard title="Sprzedaż detaliczna (YoY)" source="GUS" date="12.2025">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={RETAIL_SALES} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Sprzedaż YoY']} />
                                <Area type="monotone" dataKey="yoy" stroke="#06B6D4" strokeWidth={2} fill="url(#retailGrad)" dot={{ fill: '#06B6D4', r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </MacroCard>

                    {/* PMI Manufacturing */}
                    <MacroCard title="PMI Przemysłowy (S&P Global)" source="S&P Global" date="01.2026">
                        <ResponsiveContainer width="100%" height={250}>
                            <ComposedChart data={PMI_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" domain={[44, 54]} />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [Number(v).toFixed(1), 'PMI']} />
                                <ReferenceLine y={50} stroke="#FBBF24" strokeDasharray="5 5" label={{ value: 'Ekspansja/Kontrakcja', fill: '#FBBF24', fontSize: 9, position: 'right' }} />
                                <Line type="monotone" dataKey="pmi" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </MacroCard>
                </div>

                {/* Eurostat PL vs EU Comparison */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        Polska vs Unia Europejska — porównanie (Eurostat)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={EU_COMPARISON} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                            <YAxis type="category" dataKey="indicator" tick={{ fill: '#E2E8F0', fontSize: 11 }} stroke="#1E293B" width={90} />
                            <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown, name?: string) => [`${Number(v).toFixed(1)}%`, name === 'pl' ? '🇵🇱 Polska' : '🇪🇺 UE']} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                            <Bar dataKey="pl" name="🇵🇱 Polska" fill="#FF6B00" radius={[0, 4, 4, 0]} barSize={14} />
                            <Bar dataKey="eu" name="🇪🇺 UE" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-3 pt-2 border-t border-bb-border/50">
                        <span className="text-[10px] text-bb-muted uppercase">Eurostat</span>
                        <span className="text-[10px] text-bb-muted">Ostatnie dostępne dane</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
