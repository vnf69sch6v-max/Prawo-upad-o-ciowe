'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// EXTRA DATA HOOK
// ═══════════════════════════════════════════════════════════════

interface BaelEntry { name: string; rate: number | null; year: number | null; prev: number | null; }
interface QuarterlyPoint { quarter: string; value: number | null; }
interface VacancyHistory { year: number; value: number; }
interface JobFlowEntry { year: number; created: number | null; destroyed: number | null; net: number | null; }
interface EmpPKD { code: string; name: string; count: number | null; year: number | null; prev: number | null; yoy: number | null; }
interface RegionWages { slug: string; name: string; wages: QuarterlyPoint[]; }
export interface SectorWage { code: string; name: string; wage: number | null; wagePrev: number | null; yoy: number | null; }

export interface LaborExtraData {
    baelEducation: BaelEntry[];
    baelAge: BaelEntry[];
    baelQuarterly: {
        activityRate: QuarterlyPoint[];
        unemploymentRate: QuarterlyPoint[];
    };
    vacancies: { count: number | null; rate: number | null; year: number | null; history: VacancyHistory[]; };
    jobsFlow: { history: JobFlowEntry[]; };
    employmentByPKD: EmpPKD[];
    quarterlyWages: RegionWages[];
    source: string;
    timestamp: string;
}

export function useExtraLaborData() {
    const [data, setData] = useState<LaborExtraData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/gus-labor-extra');
                if (res.ok) setData(await res.json());
            } catch (e) {
                console.error('Labor extra data error:', e);
            }
            setIsLoading(false);
        }
        load();
    }, []);

    return { data, isLoading };
}

// ═══════════════════════════════════════════════════════════════
// COLOR HELPERS
// ═══════════════════════════════════════════════════════════════

function barColor(rate: number | null, max: number): string {
    if (rate === null) return '#666';
    const pct = rate / max;
    if (pct > 0.7) return '#EF4444';
    if (pct > 0.5) return '#F97316';
    if (pct > 0.3) return '#EAB308';
    return '#10B981';
}

// ═══════════════════════════════════════════════════════════════
// TAB: STRUKTURA
// ═══════════════════════════════════════════════════════════════

export function StrukturaTab({ data }: { data: LaborExtraData }) {
    const maxEduRate = Math.max(...data.baelEducation.map(e => e.rate || 0), 1);
    const maxAgeRate = Math.max(...data.baelAge.filter(a => a.name !== 'Ogółem').map(a => a.rate || 0), 1);
    const latestActivity = data.baelQuarterly.activityRate.slice(-1)[0];
    const prevActivity = data.baelQuarterly.activityRate.slice(-5, -4)[0];
    const latestUnemp = data.baelQuarterly.unemploymentRate.slice(-1)[0];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* BAEL Education */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        🎓 Bezrobocie wg wykształcenia (BAEL)
                    </h3>
                    <div className="space-y-2">
                        {data.baelEducation.map(e => {
                            const pct = ((e.rate || 0) / maxEduRate) * 100;
                            const change = e.rate !== null && e.prev !== null ? +(e.rate - e.prev).toFixed(1) : null;
                            return (
                                <div key={e.name} className="space-y-0.5">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-bb-muted">{e.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-bb-text">
                                                {e.rate !== null ? `${e.rate}%` : '—'}
                                            </span>
                                            {change !== null && (
                                                <span className={`font-mono ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {change > 0 ? '+' : ''}{change}pp
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full rounded-sm transition-all duration-700"
                                            style={{ width: `${pct}%`, background: barColor(e.rate, maxEduRate) }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">
                        Dane: {data.baelEducation[0]?.year || '—'} · Źródło: GUS BDL P3435
                    </div>
                </div>

                {/* BAEL Age */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        👥 Bezrobocie wg wieku (BAEL)
                    </h3>
                    <div className="space-y-2">
                        {data.baelAge.filter(a => a.name !== 'Ogółem').map(a => {
                            const pct = ((a.rate || 0) / maxAgeRate) * 100;
                            const change = a.rate !== null && a.prev !== null ? +(a.rate - a.prev).toFixed(1) : null;
                            return (
                                <div key={a.name} className="space-y-0.5">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-bb-muted">{a.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-bb-text">
                                                {a.rate !== null ? `${a.rate}%` : '—'}
                                            </span>
                                            {change !== null && (
                                                <span className={`font-mono ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {change > 0 ? '+' : ''}{change}pp
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full rounded-sm transition-all duration-700"
                                            style={{ width: `${pct}%`, background: barColor(a.rate, maxAgeRate) }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {/* Show overall */}
                        {data.baelAge.find(a => a.name === 'Ogółem') && (
                            <div className="border-t border-bb-border pt-2 mt-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-bb-muted font-semibold">Ogółem</span>
                                    <span className="font-mono text-bb-text font-bold">
                                        {data.baelAge.find(a => a.name === 'Ogółem')?.rate}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">
                        Dane: {data.baelAge[0]?.year || '—'} · Źródło: GUS BDL P3754
                    </div>
                </div>

                {/* Activity Rate */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        📈 Aktywność zawodowa (BAEL kwartalnie)
                    </h3>
                    <div className="space-y-4">
                        {/* Big numbers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[10px] text-bb-muted">Aktywność zawodowa</div>
                                <div className="text-2xl font-mono font-bold text-blue-400">
                                    {latestActivity?.value ?? '—'}%
                                </div>
                                {prevActivity && latestActivity && (
                                    <div className={`text-[10px] font-mono ${(latestActivity.value || 0) >= (prevActivity.value || 0) ? 'text-green-400' : 'text-red-400'}`}>
                                        {((latestActivity.value || 0) - (prevActivity.value || 0)).toFixed(1)}pp YoY
                                    </div>
                                )}
                                <div className="text-[9px] text-bb-muted">{latestActivity?.quarter}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-bb-muted">Stopa bezrobocia BAEL</div>
                                <div className="text-2xl font-mono font-bold text-red-400">
                                    {latestUnemp?.value ?? '—'}%
                                </div>
                                <div className="text-[9px] text-bb-muted">{latestUnemp?.quarter}</div>
                            </div>
                        </div>
                        {/* Mini trend */}
                        <div>
                            <div className="text-[10px] text-bb-muted mb-1">Trend aktywności (kwartalna)</div>
                            <div className="flex items-end gap-[2px] h-12">
                                {data.baelQuarterly.activityRate.slice(-12).map((p, i) => {
                                    const min = Math.min(...data.baelQuarterly.activityRate.slice(-12).map(x => x.value || 50));
                                    const max = Math.max(...data.baelQuarterly.activityRate.slice(-12).map(x => x.value || 60));
                                    const range = max - min || 1;
                                    const h = ((p.value || min) - min) / range * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end" title={`${p.quarter}: ${p.value}%`}>
                                            <div
                                                className="rounded-t-sm bg-blue-500/60 hover:bg-blue-400 transition-colors"
                                                style={{ height: `${Math.max(h, 5)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">Źródło: GUS BDL P2567</div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: DYNAMIKA
// ═══════════════════════════════════════════════════════════════

export function DynamikaTab({ data }: { data: LaborExtraData }) {
    const maxVac = Math.max(...data.vacancies.history.map(v => v.value), 1);
    const maxFlow = Math.max(
        ...data.jobsFlow.history.map(j => Math.max(j.created || 0, j.destroyed || 0)),
        1
    );
    const BAR_H = 80; // px

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Vacancies */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        🏢 Wolne miejsca pracy
                    </h3>
                    <div className="flex items-baseline gap-4 mb-4">
                        <div>
                            <div className="text-3xl font-mono font-bold text-bb-text">
                                {data.vacancies.count !== null ? `${data.vacancies.count} tys.` : 'N/A'}
                            </div>
                            <div className="text-[10px] text-bb-muted">Rok: {data.vacancies.year}</div>
                        </div>
                        {data.vacancies.rate !== null && (
                            <div>
                                <div className="text-lg font-mono font-bold text-blue-400">
                                    {data.vacancies.rate}%
                                </div>
                                <div className="text-[10px] text-bb-muted">wskaźnik</div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-end gap-1" style={{ height: BAR_H + 20 }}>
                        {data.vacancies.history.map((v, i) => {
                            const h = (v.value / maxVac) * BAR_H;
                            const isLatest = i === data.vacancies.history.length - 1;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${v.year}: ${v.value} tys.`}>
                                    <div className="text-[8px] text-bb-muted mb-0.5 font-mono">{Math.round(v.value)}</div>
                                    <div
                                        className={`w-full rounded-t-sm transition-all ${isLatest ? 'bg-blue-400' : 'bg-blue-500/50'}`}
                                        style={{ height: `${Math.max(h, 4)}px` }}
                                    />
                                    <div className="text-[8px] text-bb-muted mt-0.5">{v.year}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">Źródło: GUS BDL P4294</div>
                </div>

                {/* Job Creation/Destruction */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        ⚡ Kreacja vs likwidacja miejsc pracy
                    </h3>
                    <div className="flex items-center gap-4 mb-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Nowo utworzone</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> Zlikwidowane</span>
                    </div>
                    <div className="space-y-3">
                        {data.jobsFlow.history.map(j => {
                            const createdW = ((j.created || 0) / maxFlow) * 100;
                            const destroyedW = ((j.destroyed || 0) / maxFlow) * 100;
                            return (
                                <div key={j.year} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-bb-muted font-mono">{j.year}</span>
                                        <span className={`font-mono ${(j.net || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            netto: {j.net !== null ? `${j.net > 0 ? '+' : ''}${j.net} tys.` : '—'}
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                            <div className="w-[14px] text-[8px] text-emerald-400">+</div>
                                            <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden relative">
                                                <div className="h-full bg-emerald-500/70 rounded-sm" style={{ width: `${createdW}%` }} />
                                                <span className="absolute inset-0 flex items-center px-2 text-[8px] font-mono text-white/80">
                                                    {j.created !== null ? `${j.created} tys.` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-[14px] text-[8px] text-red-400">−</div>
                                            <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden relative">
                                                <div className="h-full bg-red-500/70 rounded-sm" style={{ width: `${destroyedW}%` }} />
                                                <span className="absolute inset-0 flex items-center px-2 text-[8px] font-mono text-white/80">
                                                    {j.destroyed !== null ? `${j.destroyed} tys.` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">Źródło: GUS BDL P3441 (roczne, tys. miejsc)</div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: BRANŻE
// ═══════════════════════════════════════════════════════════════

export function BranzeTab({ data, sectorWages }: { data: LaborExtraData; sectorWages: SectorWage[] }) {
    const sectors = data.employmentByPKD.filter(s => s.code !== 'Ogółem' && s.count !== null);
    const totalCount = data.employmentByPKD.find(s => s.code === 'Ogółem')?.count || 1;
    const maxCount = Math.max(...sectors.map(s => s.count || 0), 1);

    // Wages
    const wSectors = (sectorWages || []).filter(s => s.code !== 'Ogółem' && s.wage !== null);
    const overallWage = (sectorWages || []).find(s => s.code === 'Ogółem')?.wage || 1;
    const maxWage = Math.max(...wSectors.map(s => s.wage || 0), 1);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Employment by PKD */}
            <div className="data-card">
                <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                    👷 Zatrudnienie wg sekcji PKD
                </h3>
                <div className="space-y-1.5">
                    {sectors.sort((a, b) => (b.count || 0) - (a.count || 0)).map(s => {
                        const pct = ((s.count || 0) / maxCount) * 100;
                        const share = ((s.count || 0) / totalCount * 100).toFixed(1);
                        return (
                            <div key={s.code} className="flex items-center gap-2">
                                <div className="w-[130px] text-[10px] text-bb-muted truncate shrink-0" title={s.name}>
                                    <span className="text-bb-text font-mono">{s.code}</span> {s.name}
                                </div>
                                <div className="flex-1 h-4 bg-white/5 rounded-sm relative overflow-hidden">
                                    <div
                                        className="h-full rounded-sm bg-teal-500/70"
                                        style={{ width: `${pct}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-white/80">
                                        {(s.count || 0).toLocaleString()} ({share}%)
                                    </span>
                                </div>
                                <div className={`w-[45px] text-right text-[10px] font-mono ${(s.yoy || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {s.yoy !== null ? `${s.yoy > 0 ? '+' : ''}${s.yoy}%` : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-[9px] text-bb-muted mt-2">
                    Ogółem: {totalCount.toLocaleString()} etatów · Rok: {sectors[0]?.year} · Źródło: GUS BDL P2836
                </div>
            </div>

            {/* Wages by PKD (existing, moved here) */}
            <div className="data-card">
                <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                    💰 Wynagrodzenia brutto wg sekcji PKD
                </h3>
                <div className="space-y-1.5">
                    {wSectors.sort((a, b) => (b.wage || 0) - (a.wage || 0)).map(s => {
                        const pct = ((s.wage || 0) / maxWage) * 100;
                        const vsAvg = overallWage ? +((s.wage! / overallWage - 1) * 100).toFixed(0) : 0;
                        return (
                            <div key={s.code} className="flex items-center gap-2">
                                <div className="w-[130px] text-[10px] text-bb-muted truncate shrink-0" title={s.name}>
                                    <span className="text-bb-text font-mono">{s.code}</span> {s.name}
                                </div>
                                <div className="flex-1 h-4 bg-white/5 rounded-sm relative overflow-hidden">
                                    <div
                                        className="h-full rounded-sm transition-all"
                                        style={{
                                            width: `${pct}%`,
                                            background: vsAvg >= 20 ? '#3B82F6' : vsAvg >= 0 ? '#10B981' : vsAvg >= -15 ? '#EAB308' : '#EF4444',
                                        }}
                                    />
                                    <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-white/80">
                                        {Math.round(s.wage!).toLocaleString()} PLN
                                    </span>
                                </div>
                                <div className={`w-[45px] text-right text-[10px] font-mono ${(s.yoy || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {s.yoy !== null ? `${s.yoy > 0 ? '+' : ''}${s.yoy}%` : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[9px] text-bb-muted mt-2">
                    <span>Źródło: GUS BDL P2797</span>
                    <span className="font-mono">Śr. krajowa: {Math.round(overallWage).toLocaleString()} PLN</span>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: WYNAGRODZENIA
// ═══════════════════════════════════════════════════════════════

export function WynagrodzeniaTab({ data }: { data: LaborExtraData }) {
    // Get all unique quarters and last 5
    const allQuarters = new Set<string>();
    data.quarterlyWages.forEach(r => r.wages.forEach(w => allQuarters.add(w.quarter)));
    const quarters = [...allQuarters].sort().slice(-5);

    // Build wage rows
    const rows = data.quarterlyWages.map(r => {
        const wageMap: Record<string, number | null> = {};
        for (const q of quarters) {
            wageMap[q] = r.wages.find(w => w.quarter === q)?.value ?? null;
        }
        const latestWage = wageMap[quarters[quarters.length - 1]] || null;
        // YoY: compare last Q with same Q one year ago
        const lastQ = quarters[quarters.length - 1];
        const [y, q] = lastQ.split(' ');
        const prevYearQ = `${parseInt(y) - 1} ${q}`;
        const prevWage = r.wages.find(w => w.quarter === prevYearQ)?.value ?? null;
        const yoy = latestWage && prevWage ? +((latestWage / prevWage - 1) * 100).toFixed(1) : null;
        return { slug: r.slug, name: r.name, wages: wageMap, latestWage, yoy };
    }).sort((a, b) => (b.latestWage || 0) - (a.latestWage || 0));

    // National average
    const natAvg = rows.length > 0
        ? Math.round(rows.reduce((s, r) => s + (r.latestWage || 0), 0) / rows.filter(r => r.latestWage).length)
        : null;
    const maxWage = Math.max(...rows.map(r => r.latestWage || 0), 1);

    const [highlightRow, setHighlightRow] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="data-card">
                    <div className="text-[10px] text-bb-muted">ŚR. KRAJOWA</div>
                    <div className="text-xl font-mono font-bold text-bb-text">
                        {natAvg ? `${natAvg.toLocaleString()} PLN` : 'N/A'}
                    </div>
                </div>
                {rows[0] && (
                    <div className="data-card">
                        <div className="text-[10px] text-bb-muted">NAJWYŻSZE</div>
                        <div className="text-xl font-mono font-bold text-green-400">
                            {rows[0].latestWage?.toLocaleString()} PLN
                        </div>
                        <div className="text-[9px] text-bb-muted">{rows[0].name}</div>
                    </div>
                )}
                {rows[rows.length - 1] && (
                    <div className="data-card">
                        <div className="text-[10px] text-bb-muted">NAJNIŻSZE</div>
                        <div className="text-xl font-mono font-bold text-red-400">
                            {rows[rows.length - 1].latestWage?.toLocaleString()} PLN
                        </div>
                        <div className="text-[9px] text-bb-muted">{rows[rows.length - 1].name}</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Table */}
                <div className="data-card xl:col-span-3">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        📊 Wynagrodzenia kwartalne wg województw
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-bb-border">
                                    <th className="text-left py-1.5 px-2 text-bb-muted">Województwo</th>
                                    {quarters.map(q => (
                                        <th key={q} className="text-right py-1.5 px-2 text-bb-muted font-mono">{q}</th>
                                    ))}
                                    <th className="text-right py-1.5 px-2 text-bb-muted">YoY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr
                                        key={r.slug}
                                        className={`border-b border-bb-border/30 cursor-pointer hover:bg-white/5 ${highlightRow === r.slug ? 'bg-bb-accent/10' : ''}`}
                                        onClick={() => setHighlightRow(highlightRow === r.slug ? null : r.slug)}
                                    >
                                        <td className="py-1 px-2 text-bb-text">{r.name}</td>
                                        {quarters.map(q => (
                                            <td key={q} className="py-1 px-2 text-right font-mono text-bb-text">
                                                {r.wages[q] !== null ? r.wages[q]!.toLocaleString() : '—'}
                                            </td>
                                        ))}
                                        <td className={`py-1 px-2 text-right font-mono ${r.yoy !== null ? (r.yoy >= 0 ? 'text-green-400' : 'text-red-400') : 'text-bb-muted'}`}>
                                            {r.yoy !== null ? `${r.yoy > 0 ? '+' : ''}${r.yoy}%` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-[9px] text-bb-muted mt-2">Źródło: GUS BDL P2504 (brutto, ogółem)</div>
                </div>

                {/* Disparity mini chart */}
                <div className="data-card">
                    <h3 className="text-xs font-semibold text-bb-accent uppercase tracking-wider mb-3">
                        📉 Zróżnicowanie regionalne
                    </h3>
                    <div className="space-y-1">
                        {rows.map(r => {
                            const pct = ((r.latestWage || 0) / maxWage) * 100;
                            return (
                                <div key={r.slug} className="flex items-center gap-1">
                                    <div className="w-[80px] text-[8px] text-bb-muted truncate">{r.name.split('-')[0]}</div>
                                    <div className="flex-1 h-2.5 bg-white/5 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full rounded-sm"
                                            style={{
                                                width: `${pct}%`,
                                                background: (r.latestWage || 0) >= (natAvg || 0) ? '#10B981' : '#F97316',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-[8px] text-bb-muted mt-2 flex items-center gap-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm"/> ≥ średnia</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-sm"/> {'<'} średnia</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
