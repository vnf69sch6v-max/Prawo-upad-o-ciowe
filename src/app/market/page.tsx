'use client';

import { useEffect, useState } from 'react';
import { formatRate, formatPercent, getChangeColor, getChangeArrow, percentChange } from '@/lib/formatters';
import { SparklineChart } from '@/components/SparklineChart';
import { CandlestickChart } from '@/components/CandlestickChart';
import { Loader2, ArrowUpDown, TrendingUp, TrendingDown, BarChart2, CandlestickChart as CandlestickIcon } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface StockData {
    date: string;
    close: number;
    volume: number;
    open: number;
    high: number;
    low: number;
}

interface StooqResult {
    symbol: string;
    data: StockData[];
    latest: StockData | null;
}

const WIG20_TICKERS = ['pko', 'pzu', 'kgh', 'pkn', 'peo', 'cdr', 'ale', 'dnp', 'lpp', 'mbk', 'alr', 'jsw', 'pge', 'opl', 'cps', 'kru', 'kty', 'spl'];
const INDEX_NAMES: Record<string, string> = {
    wig20: 'WIG20', wig: 'WIG', mwig40: 'mWIG40', swig80: 'sWIG80',
};

const STOCK_SECTORS: Record<string, string> = {
    PKO: 'Banki', PZU: 'Ubezp.', KGH: 'Górnictwo', PKN: 'Paliwa',
    PEO: 'Banki', CDR: 'Gaming', ALE: 'Handel', DNP: 'Chemia',
    LPP: 'Odzież', MBK: 'Banki', ALR: 'Banki', JSW: 'Górnictwo',
    PGE: 'Energia', OPL: 'Telekom', CPS: 'Gaming', KRU: 'Spożywcze',
    KTY: 'Chemia', SPL: 'Banki',
};

export default function MarketPage() {
    const [selectedIndex, setSelectedIndex] = useState('wig20');
    const [indexData, setIndexData] = useState<Record<string, StooqResult>>({});
    const [stocksData, setStocksData] = useState<Record<string, StooqResult>>({});
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'symbol' | 'change' | 'close' | 'volume'>('change');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [chartMode, setChartMode] = useState<'area' | 'candle'>('area');

    useEffect(() => {
        async function fetchData() {
            // Fetch indices
            const indices: Record<string, StooqResult> = {};
            await Promise.all(
                ['wig20', 'wig', 'mwig40', 'swig80'].map(async (sym) => {
                    try {
                        const res = await fetch(`/api/stooq?symbol=${sym}&limit=60`);
                        if (res.ok) indices[sym] = await res.json();
                    } catch { /* skip */ }
                })
            );
            setIndexData(indices);

            // Fetch WIG20 stocks
            const stocks: Record<string, StooqResult> = {};
            await Promise.all(
                WIG20_TICKERS.map(async (ticker) => {
                    try {
                        const res = await fetch(`/api/stooq?symbol=${ticker}&limit=30`);
                        if (res.ok) stocks[ticker] = await res.json();
                    } catch { /* skip */ }
                })
            );
            setStocksData(stocks);
            setLoading(false);
        }
        fetchData();
    }, []);

    // Sort stocks
    const sortedStocks = WIG20_TICKERS
        .map(ticker => {
            const s = stocksData[ticker];
            if (!s?.latest || !s.data?.length) return null;
            const prev = s.data.length > 1 ? s.data[s.data.length - 2].close : s.latest.close;
            return {
                symbol: ticker.toUpperCase(),
                close: s.latest.close,
                change: percentChange(s.latest.close, prev),
                volume: s.latest.volume,
                sparkline: s.data.map(d => d.close),
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            const va = a![sortKey];
            const vb = b![sortKey];
            const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number);
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const gainers = [...sortedStocks].filter(s => s && s.change > 0).sort((a, b) => b!.change - a!.change).slice(0, 5);
    const losers = [...sortedStocks].filter(s => s && s.change < 0).sort((a, b) => a!.change - b!.change).slice(0, 5);
    const idxData = indexData[selectedIndex];

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
                <span className="bb-label">GPW MARKET</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">SRC: STOOQ</span>
            </div>

            <div className="p-2 space-y-2">
                {/* Index Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                    {Object.entries(INDEX_NAMES).map(([sym, name]) => {
                        const d = indexData[sym];
                        const latest = d?.latest;
                        const data = d?.data || [];
                        const prev = data.length > 1 ? data[0].close : latest?.close || 0;
                        const change = latest ? percentChange(latest.close, prev) : 0;

                        return (
                            <button
                                key={sym}
                                onClick={() => setSelectedIndex(sym)}
                                className={`data-card text-left ${selectedIndex === sym ? 'border-bb-accent' : ''}`}
                            >
                                <div className="text-xs text-bb-muted mb-1">{name}</div>
                                <div className="text-xl font-mono font-bold text-bb-text">
                                    {latest ? formatRate(latest.close, 2) : '—'}
                                </div>
                                <span className={`text-xs font-mono ${getChangeColor(change)}`}>
                                    {getChangeArrow(change)} {formatPercent(change)}
                                </span>
                                <SparklineChart data={data.map(d => d.close)} height={30} />
                            </button>
                        );
                    })}
                </div>

                {/* Selected Index Chart */}
                {idxData && idxData.data.length > 0 && (
                    <div className="data-card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-bb-text">
                                {INDEX_NAMES[selectedIndex]} — Ostatnie 60 sesji
                            </h2>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setChartMode('area')}
                                    className={`p-1.5 rounded text-xs ${chartMode === 'area' ? 'bg-bb-accent/20 text-bb-accent' : 'text-bb-muted hover:text-bb-text'}`}
                                    title="Wykres liniowy"
                                >
                                    <BarChart2 size={16} />
                                </button>
                                <button
                                    onClick={() => setChartMode('candle')}
                                    className={`p-1.5 rounded text-xs ${chartMode === 'candle' ? 'bg-bb-accent/20 text-bb-accent' : 'text-bb-muted hover:text-bb-text'}`}
                                    title="Wykres świecowy"
                                >
                                    <CandlestickIcon size={16} />
                                </button>
                            </div>
                        </div>

                        {chartMode === 'area' ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={idxData.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" interval="preserveStartEnd" />
                                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" width={60} />
                                    <Tooltip
                                        contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '8px', color: '#E2E8F0', fontSize: '12px' }}
                                        formatter={(v: unknown) => [formatRate(Number(v), 2), 'Wartość']}
                                    />
                                    <Area type="monotone" dataKey="close" stroke="#FF6B00" strokeWidth={2} fill="url(#idxGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="-mx-4 -mb-4">
                                <CandlestickChart
                                    data={idxData.data}
                                    height={320}
                                    showVolume={true}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Stocks Table */}
                    <div className="xl:col-span-2 data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            Spółki WIG20
                        </h3>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-bb-border">
                                        {[
                                            { key: 'symbol', label: 'Spółka' },
                                            { key: 'close', label: 'Kurs' },
                                            { key: 'change', label: 'Zmiana %' },
                                            { key: 'volume', label: 'Wolumen' },
                                        ].map(col => (
                                            <th
                                                key={col.key}
                                                onClick={() => {
                                                    if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                                    else { setSortKey(col.key as typeof sortKey); setSortDir('desc'); }
                                                }}
                                                className="text-left py-2 px-3 text-xs text-bb-muted font-medium cursor-pointer hover:text-bb-text"
                                            >
                                                <span className="flex items-center gap-1">{col.label}<ArrowUpDown size={12} /></span>
                                            </th>
                                        ))}
                                        <th className="text-right py-2 px-3 text-xs text-bb-muted">30d</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStocks.map(stock => stock && (
                                        <tr key={stock.symbol} className="border-b border-bb-border/30 hover:bg-bb-border/30">
                                            <td className="py-2 px-3 font-mono font-semibold text-bb-accent">{stock.symbol}</td>
                                            <td className="py-2 px-3 font-mono text-bb-text">{formatRate(stock.close, 2)}</td>
                                            <td className={`py-2 px-3 font-mono font-medium ${getChangeColor(stock.change)}`}>
                                                {getChangeArrow(stock.change)} {formatPercent(stock.change)}
                                            </td>
                                            <td className="py-2 px-3 font-mono text-bb-muted">
                                                {stock.volume > 0 ? (stock.volume / 1000).toFixed(0) + 'k' : '—'}
                                            </td>
                                            <td className="py-2 px-3 w-20">
                                                <SparklineChart data={stock.sparkline} height={22} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Gainers & Losers */}
                    <div className="space-y-4">
                        <div className="data-card">
                            <h3 className="text-xs font-semibold text-bb-green uppercase tracking-wider mb-3 flex items-center gap-1">
                                <TrendingUp size={14} /> Top Gainers
                            </h3>
                            {gainers.map(s => s && (
                                <div key={s.symbol} className="flex justify-between py-1.5 border-b border-bb-border/30 last:border-0">
                                    <span className="font-mono text-sm text-bb-text">{s.symbol}</span>
                                    <span className="font-mono text-sm text-bb-green">{formatPercent(s.change)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="data-card">
                            <h3 className="text-xs font-semibold text-bb-red uppercase tracking-wider mb-3 flex items-center gap-1">
                                <TrendingDown size={14} /> Top Losers
                            </h3>
                            {losers.map(s => s && (
                                <div key={s.symbol} className="flex justify-between py-1.5 border-b border-bb-border/30 last:border-0">
                                    <span className="font-mono text-sm text-bb-text">{s.symbol}</span>
                                    <span className="font-mono text-sm text-bb-red">{formatPercent(s.change)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sector Heatmap */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        Heatmapa sektorowa WIG20
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-9 gap-1">
                        {sortedStocks.map(stock => {
                            if (!stock) return null;
                            const sector = STOCK_SECTORS[stock.symbol] || 'Inne';
                            const intensity = Math.min(Math.abs(stock.change) * 20, 100);
                            const bgColor = stock.change >= 0
                                ? `rgba(34, 197, 94, ${0.15 + intensity / 200})`
                                : `rgba(239, 68, 68, ${0.15 + intensity / 200})`;
                            const textColor = stock.change >= 0 ? '#22C55E' : '#EF4444';

                            return (
                                <div
                                    key={stock.symbol}
                                    className="rounded-lg p-2 text-center transition-all hover:scale-105 cursor-default"
                                    style={{ backgroundColor: bgColor, border: `1px solid ${textColor}30` }}
                                    title={`${stock.symbol} (${sector}): ${formatPercent(stock.change)}`}
                                >
                                    <div className="text-xs font-mono font-bold text-bb-text">{stock.symbol}</div>
                                    <div className="text-[10px] font-mono font-semibold" style={{ color: textColor }}>
                                        {formatPercent(stock.change)}
                                    </div>
                                    <div className="text-[8px] text-bb-muted mt-0.5">{sector}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-bb-border/50">
                        <span className="flex items-center gap-1 text-[10px] text-bb-muted">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
                            Spadek
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-bb-muted">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }} />
                            Neutralnie
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-bb-muted">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
                            Wzrost
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
