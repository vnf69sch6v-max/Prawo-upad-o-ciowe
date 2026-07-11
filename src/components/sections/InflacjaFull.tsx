'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Flame, ShoppingCart, Percent, Activity } from 'lucide-react';
import { useCpiFull, useHICPCoreYoY, type CpiDivision } from '@/lib/hooks';
import { plSeries, lastOf, fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';

const PALETTE = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#E11D48', '#0891B2', '#CA8A04', '#DB2777', '#059669', '#4F46E5', '#EA580C', '#0D9488', '#64748B'];
const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

export function InflacjaFull() {
    const { data, isLoading } = useCpiFull();
    const coreQ = useHICPCoreYoY();

    const headline = useMemo(() => data?.headline ?? [], [data]);
    const divisions = useMemo(() => data?.divisions ?? [], [data]);
    const dataDate = data?.dataDate ?? null;
    const spliceDate = data?.spliceDate ?? null;
    const latest = headline.length ? headline[headline.length - 1] : null;
    const prev = headline.length > 1 ? headline[headline.length - 2] : null;
    const core = lastOf(plSeries(coreQ.data));
    const divByCode = (c: string) => divisions.find((d) => d.code === c);

    const contrib = useMemo(
        () => divisions.map((d, i) => ({ ...d, color: colorFor(i) })).filter((d) => d.contribution != null).sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0)),
        [divisions],
    );
    const maxAbs = Math.max(...contrib.map((d) => Math.abs(d.contribution ?? 0)), 0.01);

    const [freq, setFreq] = useState<'yoy' | 'mom'>('yoy');
    const [selCode, setSelCode] = useState<string | null>(null);
    const sel: (CpiDivision & { color?: string }) | undefined = (selCode ? contrib.find((d) => d.code === selCode) : undefined) ?? contrib[0];
    const selColor = sel ? contrib.find((d) => d.code === sel.code)?.color ?? '#2563EB' : '#2563EB';

    const chartData = useMemo(() => headline.map((h) => ({ date: h.date, value: freq === 'yoy' ? h.yoy : h.mom })), [headline, freq]);
    const selHistory = useMemo(() => (sel?.history ?? []).map((h) => ({ date: h.date, value: h.yoy })), [sel]);
    const subs = useMemo(() => (sel?.subcategories ?? []).filter((s) => s.yoy != null).sort((a, b) => (b.yoy ?? -99) - (a.yoy ?? -99)), [sel]);
    const maxSubAbs = useMemo(() => Math.max(...subs.map((s) => Math.abs(s.yoy ?? 0)), 0.1), [subs]);
    const pieData = useMemo(() => divisions.map((d, i) => ({ name: d.name, value: d.weight, color: colorFor(i), yoy: d.yoy })), [divisions]);

    const cols: Column<CpiDivision>[] = [
        { key: 'name', header: 'Dział', sortable: true, sortValue: (d) => d.code, render: (d) => <span><span className="text-mk-faint">{d.code}</span> {d.name}</span> },
        { key: 'weight', header: 'Waga', align: 'right', sortable: true, sortValue: (d) => d.weight, render: (d) => `${formatDecimalPL(d.weight, 1)}%` },
        { key: 'yoy', header: 'r/r', align: 'right', sortable: true, sortValue: (d) => d.yoy ?? -99, render: (d) => <span style={{ color: (d.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>{d.yoy != null ? `${d.yoy > 0 ? '+' : ''}${formatDecimalPL(d.yoy, 1)}%` : '—'}</span> },
        { key: 'mom', header: 'm/m', align: 'right', sortable: true, sortValue: (d) => d.mom ?? -99, render: (d) => d.mom != null ? `${d.mom > 0 ? '+' : ''}${formatDecimalPL(d.mom, 1)}%` : '—' },
        { key: 'contribution', header: 'Wkład', align: 'right', sortable: true, sortValue: (d) => d.contribution ?? -99, render: (d) => <span className="font-semibold">{d.contribution != null ? `${d.contribution > 0 ? '+' : ''}${formatDecimalPL(d.contribution, 2)}` : '—'}</span> },
    ];

    if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="mk-card h-28" />)}</div><div className="mk-skeleton h-[340px] w-full" /></div>;

    return (
        <div className="space-y-6">
            {/* ── KPI ── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <KpiCard label="CPI (r/r)" value={fmtPL(latest?.yoy)} unit="%" accent="amber" icon={TrendingUp}
                    delta={latest?.yoy != null && prev?.yoy != null ? { value: +(latest.yoy - prev.yoy).toFixed(1), unit: 'pp', invert: true } : undefined}
                    footnote={dataDate ? `GUS · ${dataDate}` : 'GUS'} />
                <KpiCard label="CPI (m/m)" value={fmtPL(latest?.mom)} unit="%" accent="blue" icon={Activity} footnote="miesiąc do miesiąca" />
                <KpiCard label="Inflacja bazowa" value={fmtPL(core)} unit="%" accent="violet" icon={Percent} footnote="HICP core (Eurostat)" loading={coreQ.isLoading} />
                <KpiCard label="Żywność (r/r)" value={fmtPL(divByCode('01')?.yoy)} unit="%" accent="green" icon={ShoppingCart} footnote="GUS" />
                <KpiCard label="Mieszkanie/energia" value={fmtPL(divByCode('04')?.yoy)} unit="%" accent="rose" icon={Flame} footnote="GUS" />
            </div>

            {/* ── Hero: trend r/r ↔ m/m ── */}
            <SectionCard title="Inflacja CPI — trend (10 lat)" subtitle={`${freq === 'yoy' ? 'rok do roku' : 'miesiąc do miesiąca'} (%) · krajowy CPI (GUS)${spliceDate ? ` od ${spliceDate.slice(0, 4)}` : ''}, wcześniej HICP (Eurostat)`}
                actions={<div className="flex flex-wrap items-center gap-2">
                    <Segmented value={freq} onChange={setFreq} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />
                    <StaleBadge date={dataDate} label="GUS do" warnAfterMonths={4} />
                    <CsvExport filename="cpi-10lat" headers={['Miesiąc', 'r/r', 'm/m']} rows={headline.map((h) => [h.date, h.yoy, h.mom])} />
                </div>}>
                <InteractiveChart data={chartData} xKey="date" height={320} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']}
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    referenceLines={freq === 'yoy' ? [{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }] : [{ y: 0, color: '#CBD2DD' }]}
                    series={[{ key: 'value', name: freq === 'yoy' ? 'CPI r/r' : 'CPI m/m', color: '#D97706', type: 'area', strokeWidth: 2.5 }]} />
            </SectionCard>

            {/* ── Kontrybucje (klikalne) + drill-down ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Kontrybucje do inflacji" subtitle="waga × dynamika = wkład (pp) · kliknij dział">
                    <div className="space-y-1.5">
                        {contrib.map((d) => {
                            const c = d.contribution ?? 0;
                            const w = (Math.abs(c) / maxAbs) * 100;
                            const active = sel?.code === d.code;
                            return (
                                <button key={d.code} onClick={() => setSelCode(d.code)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${active ? 'bg-mk-surface-alt ring-1 ring-mk-primary' : 'hover:bg-mk-surface-alt'}`}>
                                    <span className="w-40 shrink-0 truncate text-sm text-mk-text">{d.name}</span>
                                    <span className="w-12 shrink-0 text-right text-xs tnum text-mk-muted">{d.yoy != null ? `${formatDecimalPL(d.yoy, 1)}%` : '—'}</span>
                                    <span className="h-3 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-3 rounded-full" style={{ width: `${w}%`, background: d.color }} /></span>
                                    <span className="w-14 shrink-0 text-right text-sm font-semibold tnum" style={{ color: c >= 0 ? '#0F172A' : '#16A34A' }}>{c > 0 ? '+' : ''}{formatDecimalPL(c, 2)}</span>
                                </button>
                            );
                        })}
                    </div>
                </SectionCard>

                <SectionCard title={sel ? `${sel.code} · ${sel.name}` : 'Szczegóły działu'} subtitle="kliknij dział po lewej">
                    {sel && (
                        <>
                            <div className="mb-4 grid grid-cols-4 gap-2">
                                {[
                                    { l: 'r/r', v: sel.yoy != null ? `${formatDecimalPL(sel.yoy, 1)}%` : '—' },
                                    { l: 'm/m', v: sel.mom != null ? `${formatDecimalPL(sel.mom, 1)}%` : '—' },
                                    { l: 'waga', v: `${formatDecimalPL(sel.weight, 1)}%` },
                                    { l: 'wkład', v: sel.contribution != null ? `${sel.contribution > 0 ? '+' : ''}${formatDecimalPL(sel.contribution, 2)}` : '—' },
                                ].map((x) => (
                                    <div key={x.l} className="rounded-xl border border-mk-border p-2 text-center">
                                        <div className="text-[11px] text-mk-muted">{x.l}</div>
                                        <div className="mt-0.5 text-base font-bold tnum text-mk-text">{x.v}</div>
                                    </div>
                                ))}
                            </div>
                            {selHistory.length > 1 ? (
                                <InteractiveChart data={selHistory} xKey="date" height={200} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                                    series={[{ key: 'value', name: `${sel.name} r/r`, color: selColor, type: 'area', strokeWidth: 2.5 }]} />
                            ) : <p className="py-8 text-center text-sm text-mk-faint">Krótka historia (dane od 2026).</p>}

                            {subs.length > 0 && (
                                <div className="mt-4 border-t border-mk-border pt-3">
                                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Szczegóły działu · {subs.length} kategorii (r/r)</div>
                                    <div className="max-h-[240px] space-y-1 overflow-auto pr-1">
                                        {subs.map((s) => {
                                            const y = s.yoy ?? 0;
                                            const w = (Math.abs(y) / maxSubAbs) * 100;
                                            return (
                                                <div key={s.code} className="flex items-center gap-2 text-xs">
                                                    <span className="w-36 shrink-0 truncate text-mk-text-soft" title={s.name}>{s.name}</span>
                                                    <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${w}%`, marginLeft: y < 0 ? 'auto' : undefined, background: y >= 0 ? selColor : '#16A34A' }} /></span>
                                                    <span className="w-12 shrink-0 text-right font-semibold tnum" style={{ color: y >= 0 ? '#DC2626' : '#16A34A' }}>{y > 0 ? '+' : ''}{formatDecimalPL(y, 1)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </SectionCard>
            </div>

            {/* ── Koszyk (donut) + tabela działów ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Koszyk inflacyjny 2026" subtitle="struktura wag koszyka (COICOP 2018, przybliżone)">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={1} stroke="#fff" strokeWidth={2}>
                                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const p = payload[0].payload as { name: string; value: number; yoy: number | null };
                                    return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13 }}>
                                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.name}</div>
                                        <div style={{ color: '#64748B' }}>waga {formatDecimalPL(p.value, 1)}% · r/r {p.yoy != null ? `${formatDecimalPL(p.yoy, 1)}%` : '—'}</div>
                                    </div>;
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid w-full grid-cols-1 gap-1 sm:max-w-[42%]">
                            {[...pieData].sort((a, b) => b.value - a.value).slice(0, 6).map((e) => (
                                <div key={e.name} className="flex items-center gap-2 text-xs">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                                    <span className="flex-1 truncate text-mk-text-soft">{e.name}</span>
                                    <span className="tnum font-semibold text-mk-text">{formatDecimalPL(e.value, 1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Wszystkie działy COICOP 2018" subtitle={`${divisions.length} działów · kliknij nagłówek, aby sortować`}
                    actions={<CsvExport filename="cpi-dzialy" headers={['Kod', 'Dział', 'Waga', 'r/r', 'm/m', 'Wkład']} rows={divisions.map((d) => [d.code, d.name, d.weight, d.yoy, d.mom, d.contribution])} />}>
                    <div className="max-h-[320px] overflow-auto">
                        <DataTable columns={cols} rows={divisions} initialSort="contribution" initialDir="desc" rowKey={(d) => d.code} />
                    </div>
                </SectionCard>
            </div>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Źródło: </span>GUS (DBW) — krajowy CPI (COICOP 2018 od 2026, COICOP 1999 do 2025); trend 10-letni uzupełniony szkieletem HICP (Eurostat) sprzed okresu danych krajowych.
                Działy i podkategorie (klasy COICOP 4-cyfrowe, np. Żywność → pieczywo/mięso/nabiał) — dynamiki oficjalne z GUS; wagi koszyka przybliżone. Inflacja bazowa: HICP core (Eurostat).
            </div>
        </div>
    );
}
