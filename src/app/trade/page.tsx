'use client';

import { useEffect, useState } from 'react';
import { formatNumber, formatPercent, getChangeColor, getChangeArrow } from '@/lib/formatters';
import { Loader2, Ship, ArrowRightLeft, Globe, Landmark } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

// Trade balance data (GUS/NBP — monthly, in mln PLN)
// Source: GUS, Obroty handlu zagranicznego
const TRADE_BALANCE = [
    { month: '01.24', export: 112400, import: 108200 },
    { month: '02.24', export: 118600, import: 113100 },
    { month: '03.24', export: 124300, import: 119800 },
    { month: '04.24', export: 121700, import: 117400 },
    { month: '05.24', export: 126800, import: 121200 },
    { month: '06.24', export: 119500, import: 115600 },
    { month: '07.24', export: 122400, import: 118900 },
    { month: '08.24', export: 117800, import: 114300 },
    { month: '09.24', export: 125600, import: 120100 },
    { month: '10.24', export: 128400, import: 123500 },
    { month: '11.24', export: 123900, import: 119700 },
    { month: '12.24', export: 115200, import: 112800 },
].map(d => ({ ...d, balance: d.export - d.import }));

// Top trading partners (% share in total trade, 2024)
const TOP_PARTNERS = [
    { country: 'Niemcy', exportShare: 27.1, importShare: 20.8, flag: '🇩🇪' },
    { country: 'Czechy', exportShare: 5.8, importShare: 3.6, flag: '🇨🇿' },
    { country: 'Francja', exportShare: 5.7, importShare: 3.8, flag: '🇫🇷' },
    { country: 'Wielka Brytania', exportShare: 5.4, importShare: 2.1, flag: '🇬🇧' },
    { country: 'Włochy', exportShare: 4.3, importShare: 4.5, flag: '🇮🇹' },
    { country: 'Niderlandy', exportShare: 4.2, importShare: 3.4, flag: '🇳🇱' },
    { country: 'Chiny', exportShare: 1.4, importShare: 12.3, flag: '🇨🇳' },
    { country: 'USA', exportShare: 3.1, importShare: 3.2, flag: '🇺🇸' },
    { country: 'Rosja', exportShare: 0.5, importShare: 2.1, flag: '🇷🇺' },
    { country: 'Korea Płd.', exportShare: 0.8, importShare: 3.5, flag: '🇰🇷' },
];

// Current account components (quarterly, mld EUR)
const CURRENT_ACCOUNT = [
    { quarter: 'Q1 2024', goods: 2.1, services: 5.2, income: -6.8, transfers: 1.2 },
    { quarter: 'Q2 2024', goods: 1.8, services: 5.5, income: -7.2, transfers: 1.0 },
    { quarter: 'Q3 2024', goods: 2.4, services: 5.8, income: -6.5, transfers: 0.9 },
    { quarter: 'Q4 2024', goods: 1.5, services: 5.1, income: -7.0, transfers: 1.1 },
    { quarter: 'Q1 2025', goods: 2.2, services: 5.6, income: -6.9, transfers: 1.0 },
].map(d => ({ ...d, total: d.goods + d.services + d.income + d.transfers }));

// NBP FX reserves (mld USD)
const FX_RESERVES = [
    { month: '03.24', value: 188.2 },
    { month: '04.24', value: 190.1 },
    { month: '05.24', value: 192.4 },
    { month: '06.24', value: 197.8 },
    { month: '07.24', value: 199.1 },
    { month: '08.24', value: 201.3 },
    { month: '09.24', value: 204.6 },
    { month: '10.24', value: 207.2 },
    { month: '11.24', value: 209.8 },
    { month: '12.24', value: 213.1 },
    { month: '01.25', value: 215.4 },
    { month: '02.25', value: 217.6 },
];

const PIE_COLORS = ['#FF6B00', '#3B82F6', '#22C55E', '#FBBF24', '#A855F7', '#EF4444', '#06B6D4', '#F97316', '#64748B', '#EC4899'];

const TOOLTIP_STYLE = {
    contentStyle: {
        background: '#0D1117', border: '1px solid #2D333B',
        borderRadius: '2px', color: '#E6EDF3', fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
    },
};

export default function TradePage() {
    const totalExport2024 = TRADE_BALANCE.reduce((s, d) => s + d.export, 0);
    const totalImport2024 = TRADE_BALANCE.reduce((s, d) => s + d.import, 0);
    const totalBalance = totalExport2024 - totalImport2024;
    const lastReserves = FX_RESERVES[FX_RESERVES.length - 1];
    const lastCA = CURRENT_ACCOUNT[CURRENT_ACCOUNT.length - 1];

    return (
        <div className="min-h-screen">
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">TRADE & BOP</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">SRC: GUS · NBP</span>
            </div>

            <div className="p-2 space-y-2">
                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                    <div className="data-card">
                        <div className="flex items-center gap-2 mb-1">
                            <Ship size={14} className="text-bb-muted" />
                            <span className="text-xs text-bb-muted">Eksport 2024</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-bb-green">
                            {formatNumber(totalExport2024 / 1000, 1)} mld
                        </div>
                    </div>
                    <div className="data-card">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowRightLeft size={14} className="text-bb-muted" />
                            <span className="text-xs text-bb-muted">Import 2024</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-bb-red">
                            {formatNumber(totalImport2024 / 1000, 1)} mld
                        </div>
                    </div>
                    <div className="data-card">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe size={14} className="text-bb-muted" />
                            <span className="text-xs text-bb-muted">Saldo handlowe</span>
                        </div>
                        <div className={`text-xl font-mono font-bold ${totalBalance >= 0 ? 'text-bb-green' : 'text-bb-red'}`}>
                            {totalBalance >= 0 ? '+' : ''}{formatNumber(totalBalance / 1000, 1)} mld
                        </div>
                    </div>
                    <div className="data-card">
                        <div className="flex items-center gap-2 mb-1">
                            <Landmark size={14} className="text-bb-muted" />
                            <span className="text-xs text-bb-muted">Rezerwy walutowe</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-bb-accent">
                            {lastReserves.value} mld USD
                        </div>
                    </div>
                </div>

                {/* Trade Balance Chart */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        Bilans handlowy — eksport vs import (mln PLN, 2024)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={TRADE_BALANCE} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${formatNumber(Number(v))} mln PLN`, '']} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                            <Bar dataKey="export" name="Eksport" fill="#22C55E" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="import" name="Import" fill="#EF4444" radius={[2, 2, 0, 0]} opacity={0.7} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* Top Partners */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            Top partnerzy handlowi (% udziału, 2024)
                        </h3>
                        <div className="overflow-auto max-h-[400px]">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-bb-surface">
                                    <tr className="border-b border-bb-border">
                                        <th className="text-left py-2 px-2 text-xs text-bb-muted">Kraj</th>
                                        <th className="text-right py-2 px-2 text-xs text-bb-muted">Eksport %</th>
                                        <th className="text-right py-2 px-2 text-xs text-bb-muted">Import %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TOP_PARTNERS.map((p, i) => (
                                        <tr key={i} className="border-b border-bb-border/30">
                                            <td className="py-2 px-2 text-bb-text">
                                                <span className="mr-2">{p.flag}</span>{p.country}
                                            </td>
                                            <td className="py-2 px-2 text-right font-mono text-bb-green">{p.exportShare}%</td>
                                            <td className="py-2 px-2 text-right font-mono text-bb-red">{p.importShare}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FX Reserves */}
                    <div className="data-card">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                            Rezerwy walutowe NBP (mld USD)
                        </h3>
                        <div className="flex items-end gap-3 mb-3">
                            <span className="text-xl font-mono font-bold text-bb-accent">{lastReserves.value} mld</span>
                            <span className="text-xs font-mono text-bb-green">
                                {getChangeArrow(1)} {formatPercent(((lastReserves.value - FX_RESERVES[0].value) / FX_RESERVES[0].value) * 100)}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={FX_RESERVES} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 9 }} stroke="#1E293B" />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 9 }} stroke="#1E293B" width={40} />
                                <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)} mld USD`, 'Rezerwy']} />
                                <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={{ fill: '#FF6B00', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Current Account */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        Rachunek bieżący — komponenty (mld EUR, kwartalnie)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={CURRENT_ACCOUNT} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="quarter" tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" />
                            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} stroke="#1E293B" unit=" mld" />
                            <Tooltip {...TOOLTIP_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)} mld EUR`, '']} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                            <Bar dataKey="goods" name="Towary" fill="#22C55E" stackId="a" />
                            <Bar dataKey="services" name="Usługi" fill="#3B82F6" stackId="a" />
                            <Bar dataKey="income" name="Dochody" fill="#EF4444" stackId="a" />
                            <Bar dataKey="transfers" name="Transfery" fill="#FBBF24" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 pt-2 border-t border-bb-border/50 flex items-center gap-4">
                        <span className="text-xs text-bb-muted">Saldo RB ({lastCA.quarter}):</span>
                        <span className={`text-sm font-mono font-bold ${lastCA.total >= 0 ? 'text-bb-green' : 'text-bb-red'}`}>
                            {lastCA.total >= 0 ? '+' : ''}{lastCA.total.toFixed(1)} mld EUR
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
