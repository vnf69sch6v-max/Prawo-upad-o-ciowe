'use client';

import { useState, useEffect, useMemo } from 'react';
import PolandMap, { type RegionData } from '@/components/PolandMap';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA HOOK
// ═══════════════════════════════════════════════════════════════

interface TimelineEntry {
    month: string; // "YYYY-MM"
    rates: Record<string, number>; // slug → rate
}

interface RegionalResponse {
    regions: RegionData[];
    timeline: TimelineEntry[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    source: string;
    timestamp: string;
}

function useRegionalData() {
    const [data, setData] = useState<RegionalResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/gus-regional');
                if (res.ok) setData(await res.json());
            } catch (e) {
                console.error('Regional data error:', e);
            }
            setIsLoading(false);
        }
        load();
    }, []);

    return { data, isLoading };
}

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function getColorClass(rate: number | null): string {
    if (rate === null) return 'text-bb-muted';
    if (rate < 4) return 'text-emerald-400';
    if (rate < 5) return 'text-green-400';
    if (rate < 6) return 'text-lime-400';
    if (rate < 7) return 'text-yellow-400';
    if (rate < 8) return 'text-orange-400';
    return 'text-red-400';
}

function PressureIndicator({ regions }: { regions: RegionData[] }) {
    // CPI pressure insight: regions with low unemployment + high wage growth = inflationary
    const hotRegions = regions.filter(r =>
        r.unemployment !== null && r.unemployment < 5 &&
        r.wagesYoY !== null && r.wagesYoY > 10
    );
    const coldRegions = regions.filter(r =>
        r.unemployment !== null && r.unemployment > 8
    );

    const pressure = hotRegions.length >= 5 ? 'WYSOKA'
        : hotRegions.length >= 2 ? 'UMIARKOWANA'
        : 'NISKA';
    const pressureColor = pressure === 'WYSOKA' ? 'text-red-400'
        : pressure === 'UMIARKOWANA' ? 'text-yellow-400'
        : 'text-green-400';

    return (
        <div className="data-card">
            <div className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-2">
                🌡️ Presja inflacyjna rynku pracy
            </div>
            <div className={`text-2xl font-mono font-bold ${pressureColor}`}>
                {pressure}
            </div>
            <div className="text-[10px] text-bb-muted mt-2 space-y-1">
                <p>
                    <span className="text-red-400">{hotRegions.length}</span> regionów z bezrobociem {'<'}5% i płacami {'>'}{'>'}10% YoY
                    {hotRegions.length > 0 && (
                        <span className="text-bb-text"> ({hotRegions.map(r => r.name.split(' ')[0]).join(', ')})</span>
                    )}
                </p>
                <p>
                    <span className="text-green-400">{coldRegions.length}</span> regionów z bezrobociem {'>'}8%
                    {coldRegions.length > 0 && (
                        <span className="text-bb-text"> ({coldRegions.map(r => r.name.split(' ')[0]).join(', ')})</span>
                    )}
                </p>
            </div>
            <div className="text-[9px] text-bb-muted mt-2 border-t border-bb-border pt-1">
                Niskie bezrobocie + szybki wzrost płac = presja popytowa → sygnał pro-inflacyjny dla CPI
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

const MONTH_LABELS: Record<string, string> = {
    '01': 'sty', '02': 'lut', '03': 'mar', '04': 'kwi',
    '05': 'maj', '06': 'cze', '07': 'lip', '08': 'sie',
    '09': 'wrz', '10': 'paź', '11': 'lis', '12': 'gru',
};

function formatPeriod(month: string): string {
    const [y, m] = month.split('-');
    return `${MONTH_LABELS[m] || m} ${y}`;
}

export default function LaborPage() {
    const { data, isLoading } = useRegionalData();
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('latest');

    const overrideRates = useMemo(() => {
        if (selectedPeriod === 'latest' || !data?.timeline) return undefined;
        const entry = data.timeline.find(t => t.month === selectedPeriod);
        return entry?.rates;
    }, [selectedPeriod, data]);

    const currentPeriodLabel = selectedPeriod === 'latest'
        ? 'Najnowsze'
        : formatPeriod(selectedPeriod);

    const selectedData = useMemo(() => {
        if (!selectedRegion || !data) return null;
        return data.regions.find(r => r.slug === selectedRegion) ?? null;
    }, [selectedRegion, data]);

    const sortedByUnemployment = useMemo(() => {
        if (!data) return [];
        return [...data.regions].sort((a, b) => (a.unemployment ?? 99) - (b.unemployment ?? 99));
    }, [data]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bb-accent" />
            </div>
        );
    }

    if (!data || data.regions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-bb-muted text-sm">Brak danych regionalnych</div>
            </div>
        );
    }

    const { national } = data;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="px-3 py-1.5 border-b border-bb-border flex items-center gap-3">
                <span className="bb-label">LABOR MARKET</span>
                <span className="text-bb-border">│</span>
                <span className="text-[10px] text-bb-muted">
                    MAPA RYNKU PRACY · 16 WOJEWÓDZTW · GUS BDL
                </span>
                <span className="text-bb-border">│</span>
                {/* ──── PERIOD SWITCHER ──── */}
                <select
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                    className="bg-transparent border border-bb-border rounded px-2 py-0.5 text-xs text-bb-text font-mono focus:outline-none focus:border-bb-accent cursor-pointer"
                >
                    <option value="latest" className="bg-gray-900">Najnowsze</option>
                    {data?.timeline && [...data.timeline].reverse().map(t => (
                        <option key={t.month} value={t.month} className="bg-gray-900">
                            {formatPeriod(t.month)}
                        </option>
                    ))}
                </select>
                <span className="text-[10px] text-bb-accent font-mono">{currentPeriodLabel}</span>
            </div>

            <div className="p-2 space-y-2">
                {/* ─── NATIONAL SUMMARY ─── */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">ŚR. BEZROBOCIE (KRAJ)</div>
                        <div className={`text-2xl font-mono font-bold ${getColorClass(national.avgUnemployment)}`}>
                            {national.avgUnemployment !== null ? `${national.avgUnemployment}%` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-bb-muted mt-1">Rejestrowane, średnia 16 woj.</div>
                    </div>
                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">ŚR. WYNAGRODZENIE</div>
                        <div className="text-2xl font-mono font-bold text-bb-text">
                            {national.avgWages !== null ? `${national.avgWages.toLocaleString()} PLN` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-bb-muted mt-1">Brutto rocznie, średnia</div>
                    </div>
                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">NAJNIŻSZE BEZROBOCIE</div>
                        {sortedByUnemployment[0] && (
                            <>
                                <div className="text-2xl font-mono font-bold text-emerald-400">
                                    {sortedByUnemployment[0].unemployment}%
                                </div>
                                <div className="text-[10px] text-bb-muted mt-1">{sortedByUnemployment[0].name}</div>
                            </>
                        )}
                    </div>
                    <div className="data-card">
                        <div className="text-xs text-bb-muted mb-1">NAJWYŻSZE BEZROBOCIE</div>
                        {sortedByUnemployment[sortedByUnemployment.length - 1] && (() => {
                            const worst = sortedByUnemployment[sortedByUnemployment.length - 1];
                            return (
                                <>
                                    <div className="text-2xl font-mono font-bold text-red-400">
                                        {worst.unemployment !== null ? `${worst.unemployment}%` : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-bb-muted mt-1">{worst.name}</div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* ─── MAP + DETAIL PANEL ─── */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                    {/* Map (3/5 width) */}
                    <div className="data-card xl:col-span-3">
                        <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-2">
                            🗺️ Mapa bezrobocia rejestrowanego
                        </h3>
                        <PolandMap
                            regions={data.regions}
                            national={national}
                            selectedRegion={selectedRegion}
                            onRegionSelect={setSelectedRegion}
                            overrideRates={overrideRates}
                        />
                        {/* Legend */}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-bb-muted justify-center flex-wrap">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#059669'}} /> {'<'}4%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#10B981'}} /> 4-5%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#84CC16'}} /> 5-6%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#EAB308'}} /> 6-7%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#F97316'}} /> 7-8%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{background:'#EF4444'}} /> 8%+</span>
                        </div>
                    </div>

                    {/* Detail panel (2/5 width) */}
                    <div className="xl:col-span-2 space-y-4">
                        {selectedData ? (
                            <div className="data-card">
                                <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                                    📊 {selectedData.name}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] text-bb-muted">Bezrobocie rejestrowane</div>
                                        <div className={`text-3xl font-mono font-bold ${getColorClass(selectedData.unemployment)}`}>
                                            {selectedData.unemployment !== null ? `${selectedData.unemployment}%` : 'N/A'}
                                        </div>
                                        {selectedData.unemploymentPrev !== null && selectedData.unemployment !== null && (
                                            <div className="text-xs text-bb-muted mt-0.5">
                                                Rok wcześniej: {selectedData.unemploymentPrev}%
                                                <span className={`ml-1 ${selectedData.unemployment > selectedData.unemploymentPrev ? 'text-red-400' : 'text-green-400'}`}>
                                                    ({(selectedData.unemployment - selectedData.unemploymentPrev) > 0 ? '+' : ''}
                                                    {(selectedData.unemployment - selectedData.unemploymentPrev).toFixed(1)}pp)
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-[9px] text-bb-muted">{selectedData.unemploymentMonth}</div>
                                    </div>
                                    <div className="border-t border-bb-border pt-2">
                                        <div className="text-[10px] text-bb-muted">Przeciętne wynagrodzenie brutto</div>
                                        <div className="text-2xl font-mono font-bold text-bb-text">
                                            {selectedData.wages !== null ? `${Math.round(selectedData.wages).toLocaleString()} PLN` : 'N/A'}
                                        </div>
                                        {selectedData.wagesYoY !== null && (
                                            <div className="text-xs mt-0.5">
                                                <span className={selectedData.wagesYoY >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {selectedData.wagesYoY >= 0 ? '+' : ''}{selectedData.wagesYoY}% YoY
                                                </span>
                                            </div>
                                        )}
                                        {national.avgWages && selectedData.wages && (
                                            <div className="text-[10px] text-bb-muted mt-0.5">
                                                vs krajowa ({national.avgWages.toLocaleString()} PLN):
                                                <span className={`ml-1 font-mono ${selectedData.wages > national.avgWages ? 'text-green-400' : 'text-red-400'}`}>
                                                    {((selectedData.wages / national.avgWages - 1) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="data-card flex items-center justify-center h-32">
                                <div className="text-bb-muted text-xs text-center">
                                    Kliknij województwo na mapie<br />aby zobaczyć szczegóły
                                </div>
                            </div>
                        )}

                        <PressureIndicator regions={data.regions} />
                    </div>
                </div>

                {/* ─── RANKING TABLE ─── */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        📋 Ranking województw — bezrobocie rejestrowane
                    </h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-bb-border">
                                <th className="text-left py-2 px-3 text-xs text-bb-muted w-8">#</th>
                                <th className="text-left py-2 px-3 text-xs text-bb-muted">Województwo</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Bezrobocie</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">YoY</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Wynagrodzenie</th>
                                <th className="text-right py-2 px-3 text-xs text-bb-muted">Płace YoY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedByUnemployment.map((r, i) => {
                                const unempChange = r.unemployment !== null && r.unemploymentPrev !== null
                                    ? +(r.unemployment - r.unemploymentPrev).toFixed(1) : null;
                                return (
                                    <tr
                                        key={r.slug}
                                        className={`border-b border-bb-border/30 cursor-pointer hover:bg-white/5 transition-colors ${selectedRegion === r.slug ? 'bg-bb-accent/10' : ''}`}
                                        onClick={() => setSelectedRegion(selectedRegion === r.slug ? null : r.slug)}
                                    >
                                        <td className="py-1.5 px-3 text-bb-muted font-mono text-xs">{i + 1}</td>
                                        <td className="py-1.5 px-3 text-bb-text text-xs">{r.name}</td>
                                        <td className={`py-1.5 px-3 text-right font-mono font-bold ${getColorClass(r.unemployment)}`}>
                                            {r.unemployment !== null ? `${r.unemployment}%` : 'N/A'}
                                        </td>
                                        <td className={`py-1.5 px-3 text-right font-mono text-xs ${unempChange !== null ? (unempChange > 0 ? 'text-red-400' : 'text-green-400') : 'text-bb-muted'}`}>
                                            {unempChange !== null ? `${unempChange > 0 ? '+' : ''}${unempChange}pp` : '—'}
                                        </td>
                                        <td className="py-1.5 px-3 text-right font-mono text-bb-text text-xs">
                                            {r.wages !== null ? `${Math.round(r.wages).toLocaleString()}` : '—'}
                                        </td>
                                        <td className={`py-1.5 px-3 text-right font-mono text-xs ${r.wagesYoY !== null ? (r.wagesYoY >= 0 ? 'text-green-400' : 'text-red-400') : 'text-bb-muted'}`}>
                                            {r.wagesYoY !== null ? `${r.wagesYoY >= 0 ? '+' : ''}${r.wagesYoY}%` : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="text-[10px] text-bb-muted mt-2">
                        Źródło: GUS BDL P3559 (bezrobocie rejestrowane) + P2497 (wynagrodzenia)
                    </div>
                </div>
            </div>
        </div>
    );
}
