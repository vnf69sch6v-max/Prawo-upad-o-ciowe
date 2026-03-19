'use client';

import { useEffect, useState, useMemo } from 'react';
import { formatRate, formatPercent, getChangeColor, getChangeArrow, percentChange } from '@/lib/formatters';
import { SparklineChart } from '@/components/SparklineChart';
import { Loader2 } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, LineChart, Line, BarChart, Bar
} from 'recharts';
import { useYieldCurve } from '@/lib/hooks';

interface WiborApiRate {
    tenor: string;
    wibor: number;
    wibid: number;
    spread: number;
    date: string;
    source: string;
}

// Fallback — used when Stooq is loading
const FALLBACK_YIELDS = [
    { maturity: '2Y', yield: 3.561 },
    { maturity: '5Y', yield: 4.303 },
    { maturity: '10Y', yield: 4.960 },
];

// RPP rate history timeline (real dates from NBP)
// The component auto-appends the latest rate from /api/nbp-rates if it differs
const RPP_HISTORY_BASE = [
    { date: '09.2023', rate: 6.00, decision: 'Obniżka o 0.75 pp' },
    { date: '10.2023', rate: 5.75, decision: 'Obniżka o 0.25 pp' },
    { date: '11.2023', rate: 5.75, decision: 'Bez zmian' },
    { date: '01.2024', rate: 5.75, decision: 'Bez zmian' },
    { date: '06.2024', rate: 5.75, decision: 'Bez zmian' },
    { date: '12.2024', rate: 5.75, decision: 'Bez zmian' },
    { date: '05.2025', rate: 5.25, decision: 'Obniżka o 0.50 pp' },
    { date: '09.2025', rate: 4.50, decision: 'Obniżka o 0.75 pp' },
    { date: '12.2025', rate: 4.00, decision: 'Obniżka o 0.50 pp' },
    { date: '02.2026', rate: 4.00, decision: 'Bez zmian' },
    { date: '03.2026', rate: 3.75, decision: 'Obniżka o 0.25 pp' },
];

interface NBPRateData {
    name: string;
    value: number;
    validFrom: string;
}

const RATE_COLORS: Record<string, string> = {
    'Stopa referencyjna': '#FF6B00',
    'Stopa lombardowa': '#EF4444',
    'Stopa depozytowa': '#22C55E',
    'Stopa redyskontowa weksli': '#3B82F6',
    'Stopa dyskontowa weksli': '#A855F7',
};

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#111827', border: '1px solid #1E293B',
        borderRadius: '8px', color: '#E2E8F0', fontSize: '12px',
    },
};

export default function RatesPage() {
    const [nbpRates, setNbpRates] = useState<NBPRateData[]>([]);
    const [wiborRates, setWiborRates] = useState<WiborApiRate[]>([]);
    const [ratesDate, setRatesDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // Fetch NBP interest rates (from XML)
            try {
                const ratesRes = await fetch('/api/nbp-rates');
                if (ratesRes.ok) {
                    const ratesJson = await ratesRes.json();
                    if (ratesJson.rates?.length) {
                        const basicNames = ['Stopa referencyjna', 'Stopa lombardowa', 'Stopa depozytowa', 'Stopa redyskontowa weksli', 'Stopa dyskontowa weksli'];
                        const basic = ratesJson.rates.filter((r: NBPRateData) => basicNames.includes(r.name));
                        setNbpRates(basic.length > 0 ? basic : ratesJson.rates);
                        setRatesDate(ratesJson.rates[0]?.validFrom || '');
                    }
                }
            } catch { /* skip */ }

            // Fetch WIBOR rates (from GPW Benchmark / estimated)
            try {
                const wiborRes = await fetch('/api/wibor');
                if (wiborRes.ok) {
                    const wiborJson = await wiborRes.json();
                    if (wiborJson.rates?.length) {
                        setWiborRates(wiborJson.rates);
                    }
                }
            } catch { /* skip */ }

            setLoading(false);
        }
        fetchData();
    }, []);

    // WIBOR tenors for display
    const wiborTenorColors: Record<string, string> = {
        'ON': '#94A3B8', '1M': '#22C55E', '3M': '#3B82F6', '6M': '#A855F7', '1Y': '#FBBF24',
    };

    // Yield curve from live Stooq data
    const yieldCurveHook = useYieldCurve();
    const yieldCurve = useMemo(() => {
        if (yieldCurveHook.isLoading) return FALLBACK_YIELDS;
        return yieldCurveHook.curve
            .filter(p => p.yield !== null)
            .map(p => ({ maturity: p.tenor, yield: p.yield as number }));
    }, [yieldCurveHook.curve, yieldCurveHook.isLoading]);
    const yieldIsLive = !yieldCurveHook.isLoading && yieldCurveHook.curve.some(p => p.yield !== null);

    // Build RPP history: base + auto-append latest from API if rate changed
    const RPP_HISTORY = useMemo(() => {
        const base = [...RPP_HISTORY_BASE];
        const refRate = nbpRates.find(r => r.name === 'Stopa referencyjna');
        if (refRate && base.length > 0) {
            const lastEntry = base[base.length - 1];
            if (Math.abs(refRate.value - lastEntry.rate) > 0.001) {
                // New rate detected — auto-append
                const validDate = refRate.validFrom; // YYYY-MM-DD
                const [y, m] = validDate.split('-');
                const dateLabel = `${m}.${y}`;
                const diff = +(refRate.value - lastEntry.rate).toFixed(2);
                const decision = diff < 0
                    ? `Obniżka o ${Math.abs(diff).toFixed(2)} pp`
                    : diff > 0
                        ? `Podwyżka o ${diff.toFixed(2)} pp`
                        : 'Bez zmian';
                base.push({ date: dateLabel, rate: refRate.value, decision });
            }
        }
        return base;
    }, [nbpRates]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bb-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">INTEREST RATES</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">
                    SRC: NBP · STOOQ
                    {ratesDate && <> · OD: {ratesDate}</>}
                </span>
            </div>

            <div className="p-2 space-y-2">
                {/* RPP Rates — live from /api/nbp-rates */}
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    {nbpRates.map((rate: NBPRateData, i: number) => (
                        <div key={i} className="data-card">
                            <div className="text-xs text-bb-muted mb-1">{rate.name}</div>
                            <div className="text-2xl font-mono font-bold" style={{ color: RATE_COLORS[rate.name] || '#FF6B00' }}>
                                {rate.value.toFixed(2)}%
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* WIBOR All Tenors — Bar Chart */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            WIBOR / WIBID — aktualne stawki
                        </h3>
                        {wiborRates.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={wiborRates.map(r => ({
                                    tenor: r.tenor,
                                    WIBOR: r.wibor,
                                    WIBID: r.wibid,
                                }))} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="tenor" tick={{ fill: '#64748B', fontSize: 12 }} stroke="#1E293B" />
                                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" width={45} />
                                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(2)}%`]} />
                                    <Bar dataKey="WIBID" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="WIBOR" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-bb-muted py-8 text-center">Ładowanie danych WIBOR...</div>
                        )}
                    </div>

                    {/* Yield Curve */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            Krzywa dochodowości — obligacje PL
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={yieldCurve} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="maturity" tick={{ fill: '#64748B', fontSize: 12 }} stroke="#1E293B" />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit="%" width={40} />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(3)}%`, 'Yield']} />
                                <Line type="monotone" dataKey="yield" stroke="#FBBF24" strokeWidth={3} dot={{ fill: '#FBBF24', r: 6, strokeWidth: 2, stroke: '#111827' }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-between text-[10px] text-bb-muted mt-2 px-2">
                            <span>{yieldIsLive ? '● Stooq (live)' : '○ Fallback'}</span>
                            <span>{yieldCurveHook.y10.data?.latest?.date || ''}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* WIBOR All Tenors Table */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            WIBOR — wszystkie tenory
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-bb-border">
                                    <th className="text-left py-2 px-3 text-xs text-bb-muted">Tenor</th>
                                    <th className="text-right py-2 px-3 text-xs text-bb-muted">WIBID</th>
                                    <th className="text-right py-2 px-3 text-xs text-bb-muted">WIBOR</th>
                                    <th className="text-right py-2 px-3 text-xs text-bb-muted">Spread</th>
                                    <th className="text-right py-2 px-3 text-xs text-bb-muted">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wiborRates.map((rate: WiborApiRate, i: number) => (
                                    <tr key={i} className="border-b border-bb-border/30">
                                        <td className="py-2 px-3 font-medium" style={{ color: wiborTenorColors[rate.tenor] || '#E2E8F0' }}>
                                            WIBOR {rate.tenor}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-bb-muted">
                                            {rate.wibid.toFixed(2)}%
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-semibold text-bb-text">
                                            {rate.wibor.toFixed(2)}%
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-bb-accent">
                                            {rate.spread.toFixed(2)} pp
                                        </td>
                                        <td className="py-2 px-3 text-right text-xs text-bb-muted">
                                            {rate.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {wiborRates.length > 0 && (
                            <div className="text-[10px] text-bb-muted mt-2">
                                Źródło: {wiborRates[0].source}
                            </div>
                        )}
                    </div>

                    {/* Bond Yields Table */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            Rentowności obligacji skarbowych PL
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-bb-border">
                                    <th className="text-left py-2 px-3 text-xs text-bb-muted">Zapadalność</th>
                                    <th className="text-right py-2 px-3 text-xs text-bb-muted">Yield</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yieldCurve.map((bond, i) => (
                                    <tr key={i} className="border-b border-bb-border/30">
                                        <td className="py-2 px-3 font-medium text-bb-text">{bond.maturity}</td>
                                        <td className="py-2 px-3 text-right font-mono font-semibold text-bb-yellow">
                                            {bond.yield.toFixed(3)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-[10px] text-bb-muted mt-2">
                            {yieldIsLive ? '● Stooq (live)' : '○ Fallback (Investing.com)'}
                        </div>
                    </div>
                </div>

                {/* RPP Decision Timeline */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        Historia decyzji RPP
                    </h3>
                    <div className="overflow-auto">
                        <div className="flex gap-6 min-w-max">
                            {RPP_HISTORY.map((item, i) => (
                                <div key={i} className="text-center relative">
                                    <div className="w-3 h-3 rounded-full bg-bb-accent mx-auto mb-2" />
                                    {i < RPP_HISTORY.length - 1 && (
                                        <div className="absolute top-1.5 left-1/2 w-24 h-px bg-bb-border" />
                                    )}
                                    <div className="text-xs font-mono text-bb-accent font-semibold">{item.rate.toFixed(2)}%</div>
                                    <div className="text-[10px] text-bb-muted mt-0.5">{item.date}</div>
                                    <div className="text-[10px] text-bb-text mt-0.5 max-w-[80px]">{item.decision}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
