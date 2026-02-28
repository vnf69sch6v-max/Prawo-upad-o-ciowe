'use client';

import { useEffect, useState } from 'react';
import { formatRate, formatDate, percentChange, getChangeColor, getChangeArrow, formatPercent } from '@/lib/formatters';
import { SparklineChart } from '@/components/SparklineChart';
import { Loader2, Search, ArrowUpDown } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface NBPRate {
    currency: string;
    code: string;
    mid: number;
}

interface NBPRateC {
    currency: string;
    code: string;
    bid: number;
    ask: number;
}

interface RateHistory {
    effectiveDate: string;
    mid: number;
}

export default function FXPage() {
    const [rates, setRates] = useState<NBPRate[]>([]);
    const [ratesC, setRatesC] = useState<NBPRateC[]>([]);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [effectiveDateC, setEffectiveDateC] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('EUR');
    const [history, setHistory] = useState<RateHistory[]>([]);
    const [calcAmount, setCalcAmount] = useState(1000);
    const [calcCode, setCalcCode] = useState('EUR');
    const [sortKey, setSortKey] = useState<'code' | 'mid' | 'currency'>('code');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'A' | 'C'>('A');

    // Fetch Table A rates
    useEffect(() => {
        async function fetchRates() {
            try {
                const res = await fetch('/api/nbp?endpoint=exchangerates/tables/a/today&fallback=exchangerates/tables/a/last/1');
                if (res.ok) {
                    const data = await res.json();
                    const table = Array.isArray(data) ? data[0] : data;
                    setRates(table.rates || []);
                    setEffectiveDate(table.effectiveDate || '');
                }
            } catch (e) { console.error(e); }

            // Fetch Table C
            try {
                const resC = await fetch('/api/nbp?endpoint=exchangerates/tables/c/today&fallback=exchangerates/tables/c/last/1');
                if (resC.ok) {
                    const dataC = await resC.json();
                    const tableC = Array.isArray(dataC) ? dataC[0] : dataC;
                    setRatesC(tableC.rates || []);
                    setEffectiveDateC(tableC.effectiveDate || '');
                }
            } catch (e) { console.error(e); }

            setLoading(false);
        }
        fetchRates();
    }, []);

    // Fetch history for selected currency
    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`/api/nbp?endpoint=exchangerates/rates/a/${selectedCurrency}/last/90&fallback=exchangerates/rates/a/${selectedCurrency}/last/30`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.rates || []);
                }
            } catch (e) { console.error(e); }
        }
        fetchHistory();
    }, [selectedCurrency]);

    // Filter & sort Table A
    const filtered = rates
        .filter(r =>
            r.code.toLowerCase().includes(search.toLowerCase()) ||
            r.currency.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const va = a[sortKey];
            const vb = b[sortKey];
            const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
            return sortDir === 'asc' ? cmp : -cmp;
        });

    // Filter Table C
    const filteredC = ratesC
        .filter(r =>
            r.code.toLowerCase().includes(search.toLowerCase()) ||
            r.currency.toLowerCase().includes(search.toLowerCase())
        );

    const selectedRate = rates.find(r => r.code === calcCode);
    const selectedRateC = ratesC.find(r => r.code === calcCode);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bb-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">FX RATES</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">
                    TAB {activeTab} — {activeTab === 'A' ? 'AVG' : 'BID/ASK'}
                    {' · '}
                    {(activeTab === 'A' ? effectiveDate : effectiveDateC) ? formatDate(activeTab === 'A' ? effectiveDate : effectiveDateC) : '—'}
                </span>
            </div>

            <div className="p-2 space-y-2">
                {/* Chart for selected currency */}
                <div className="data-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-bb-text">{selectedCurrency}/PLN — Ostatnie 90 dni</h2>
                            <p className="text-xs text-bb-muted">Kliknij walutę w tabeli aby zmienić wykres</p>
                        </div>
                        <div className="flex gap-2">
                            {['EUR', 'USD', 'CHF', 'GBP'].map(code => (
                                <button
                                    key={code}
                                    onClick={() => setSelectedCurrency(code)}
                                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${selectedCurrency === code
                                        ? 'bg-bb-accent text-white'
                                        : 'bg-bb-border text-bb-muted hover:text-bb-text'
                                        }`}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>
                    {history.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis
                                    dataKey="effectiveDate"
                                    tick={{ fill: '#64748B', fontSize: 10 }}
                                    tickFormatter={(d) => new Date(d).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                                    interval="preserveStartEnd"
                                    stroke="#1E293B"
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#64748B', fontSize: 10 }}
                                    tickFormatter={(v) => v.toFixed(3)}
                                    stroke="#1E293B"
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#111827',
                                        border: '1px solid #1E293B',
                                        borderRadius: '8px',
                                        color: '#E2E8F0',
                                        fontSize: '12px',
                                    }}
                                    labelFormatter={(d) => formatDate(d)}
                                    formatter={(value: unknown) => [formatRate(Number(value), 4), 'Kurs']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="mid"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fill="url(#chartGrad)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Tab Switch: Table A vs Table C */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('A')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'A'
                            ? 'bg-bb-accent text-white'
                            : 'bg-bb-surface text-bb-muted border border-bb-border hover:text-bb-text'
                            }`}
                    >
                        Tabela A — kursy średnie
                    </button>
                    <button
                        onClick={() => setActiveTab('C')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'C'
                            ? 'bg-bb-accent text-white'
                            : 'bg-bb-surface text-bb-muted border border-bb-border hover:text-bb-text'
                            }`}
                    >
                        Tabela C — kupno/sprzedaż
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Currency Table */}
                    <div className="xl:col-span-2 data-card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bb-muted" />
                                <input
                                    type="text"
                                    placeholder="Szukaj waluty..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-bb-bg border border-bb-border rounded-lg text-sm text-bb-text placeholder-bb-muted focus:outline-none focus:border-bb-accent"
                                />
                            </div>
                            <span className="text-xs text-bb-muted">
                                {activeTab === 'A' ? filtered.length : filteredC.length} walut
                            </span>
                        </div>

                        <div className="overflow-auto max-h-[500px]">
                            {activeTab === 'A' ? (
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-bb-surface">
                                        <tr className="border-b border-bb-border">
                                            {[
                                                { key: 'code', label: 'Kod' },
                                                { key: 'currency', label: 'Waluta' },
                                                { key: 'mid', label: 'Kurs średni' },
                                            ].map(col => (
                                                <th
                                                    key={col.key}
                                                    onClick={() => {
                                                        if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                                        else { setSortKey(col.key as typeof sortKey); setSortDir('asc'); }
                                                    }}
                                                    className="text-left py-2 px-3 text-xs text-bb-muted font-medium cursor-pointer hover:text-bb-text"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {col.label}
                                                        <ArrowUpDown size={12} />
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="text-right py-2 px-3 text-xs text-bb-muted font-medium">Wykres 30d</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(rate => (
                                            <tr
                                                key={rate.code}
                                                onClick={() => setSelectedCurrency(rate.code)}
                                                className={`border-b border-bb-border/30 cursor-pointer hover:bg-bb-border/30 transition-colors ${selectedCurrency === rate.code ? 'bg-bb-accent/5' : ''
                                                    }`}
                                            >
                                                <td className="py-2 px-3 font-mono text-bb-accent font-semibold">{rate.code}</td>
                                                <td className="py-2 px-3 text-bb-text">{rate.currency}</td>
                                                <td className="py-2 px-3 font-mono font-semibold text-bb-text">{formatRate(rate.mid, 4)}</td>
                                                <td className="py-2 px-3 w-24">
                                                    <SparklineChart data={[rate.mid * 0.99, rate.mid * 1.001, rate.mid * 0.998, rate.mid]} height={24} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-bb-surface">
                                        <tr className="border-b border-bb-border">
                                            <th className="text-left py-2 px-3 text-xs text-bb-muted font-medium">Kod</th>
                                            <th className="text-left py-2 px-3 text-xs text-bb-muted font-medium">Waluta</th>
                                            <th className="text-right py-2 px-3 text-xs text-bb-green font-medium">Kupno (bid)</th>
                                            <th className="text-right py-2 px-3 text-xs text-bb-red font-medium">Sprzedaż (ask)</th>
                                            <th className="text-right py-2 px-3 text-xs text-bb-muted font-medium">Spread</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredC.map(rate => {
                                            const spread = ((rate.ask - rate.bid) / rate.ask * 100);
                                            return (
                                                <tr
                                                    key={rate.code}
                                                    onClick={() => setSelectedCurrency(rate.code)}
                                                    className={`border-b border-bb-border/30 cursor-pointer hover:bg-bb-border/30 transition-colors ${selectedCurrency === rate.code ? 'bg-bb-accent/5' : ''
                                                        }`}
                                                >
                                                    <td className="py-2 px-3 font-mono text-bb-accent font-semibold">{rate.code}</td>
                                                    <td className="py-2 px-3 text-bb-text">{rate.currency}</td>
                                                    <td className="py-2 px-3 text-right font-mono font-semibold text-bb-green">{formatRate(rate.bid, 4)}</td>
                                                    <td className="py-2 px-3 text-right font-mono font-semibold text-bb-red">{formatRate(rate.ask, 4)}</td>
                                                    <td className="py-2 px-3 text-right font-mono text-bb-muted">{spread.toFixed(2)}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Calculator */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-4">
                            Kalkulator walutowy
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-bb-muted mb-1">Kwota PLN</label>
                                <input
                                    type="number"
                                    value={calcAmount}
                                    onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-bb-bg border border-bb-border rounded-lg font-mono text-bb-text focus:outline-none focus:border-bb-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-bb-muted mb-1">Waluta</label>
                                <select
                                    value={calcCode}
                                    onChange={(e) => setCalcCode(e.target.value)}
                                    className="w-full px-4 py-3 bg-bb-bg border border-bb-border rounded-lg text-bb-text focus:outline-none focus:border-bb-accent"
                                >
                                    {rates.map(r => (
                                        <option key={r.code} value={r.code}>{r.code} — {r.currency}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedRate && (
                                <div className="space-y-3">
                                    <div className="p-4 bg-bb-bg rounded-lg border border-bb-border">
                                        <div className="text-xs text-bb-muted mb-1">Kurs średni (Tabela A)</div>
                                        <div className="text-2xl font-mono font-bold text-bb-accent">
                                            {formatRate(calcAmount / selectedRate.mid, 2)} {calcCode}
                                        </div>
                                        <div className="text-xs text-bb-muted mt-1">
                                            1 {calcCode} = {formatRate(selectedRate.mid, 4)} PLN
                                        </div>
                                    </div>

                                    {selectedRateC && (
                                        <div className="p-4 bg-bb-bg rounded-lg border border-bb-border">
                                            <div className="text-xs text-bb-muted mb-2">Tabela C — kupno/sprzedaż</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-[10px] text-bb-green uppercase">Kupujesz {calcCode} (po ask)</div>
                                                    <div className="text-lg font-mono font-bold text-bb-green">
                                                        {formatRate(calcAmount / selectedRateC.ask, 2)}
                                                    </div>
                                                    <div className="text-[10px] text-bb-muted">kurs: {formatRate(selectedRateC.ask, 4)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-bb-red uppercase">Sprzedajesz {calcCode} (po bid)</div>
                                                    <div className="text-lg font-mono font-bold text-bb-red">
                                                        {formatRate(calcAmount / selectedRateC.bid, 2)}
                                                    </div>
                                                    <div className="text-[10px] text-bb-muted">kurs: {formatRate(selectedRateC.bid, 4)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
