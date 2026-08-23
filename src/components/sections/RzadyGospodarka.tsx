'use client';

// Nakładka okresów rządzenia na roczne serie makro GUS (PKB, inflacja CPI).
import { useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, Tooltip } from 'recharts';
import { ResponsiveContainer } from '@/components/ui/ChartContainer';
import { useGusGdpAnnual, useGusCpiAnnual } from '@/lib/hooks';
import { plSeries } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { PL_GOVERNMENTS, govForYear } from '@/lib/pl-governments';
import { AXIS_INK } from '@/lib/chart-theme';

type Metric = 'gdp' | 'cpi';
const METRICS: { value: Metric; label: string; color: string }[] = [
    { value: 'gdp', label: 'Wzrost PKB', color: '#16A34A' },
    { value: 'cpi', label: 'Inflacja CPI', color: '#D97706' },
];
const yr = (to: number) => (to >= 9999 ? '…' : String(to));

export function RzadyGospodarka() {
    const gdpQ = useGusGdpAnnual();
    const cpiQ = useGusCpiAnnual();
    const [metric, setMetric] = useState<Metric>('gdp');

    const merged = useMemo(() => {
        const toMap = (d: Parameters<typeof plSeries>[0]) => new Map(plSeries(d).map((p) => [parseInt(p.date), p.value]));
        const gdp = toMap(gdpQ.data), cpi = toMap(cpiQ.data);
        const years = [...new Set([...gdp.keys(), ...cpi.keys()])].filter((y) => y >= 1997).sort((a, b) => a - b);
        return years.map((y) => ({ year: y, gdp: gdp.get(y) ?? null, cpi: cpi.get(y) ?? null }));
    }, [gdpQ.data, cpiQ.data]);

    const minY = merged.length ? merged[0].year : 1997;
    const maxY = merged.length ? merged[merged.length - 1].year : 2025;

    const govStats = useMemo(() => PL_GOVERNMENTS.filter((g) => g.from <= maxY).map((g) => {
        const to = Math.min(g.to, maxY);
        const rows = merged.filter((r) => r.year >= g.from && r.year <= to);
        const avg = (k: 'gdp' | 'cpi') => { const v = rows.map((r) => r[k]).filter((x): x is number => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
        return { ...g, toClamped: to, avgGdp: avg('gdp'), avgCpi: avg('cpi') };
    }), [merged, maxY]);

    const cur = METRICS.find((m) => m.value === metric)!;
    const gdpPts = merged.filter((r) => r.gdp != null);
    const lastGdp = gdpPts.length ? gdpPts[gdpPts.length - 1] : null;
    const prevGdp = gdpPts.length > 1 ? gdpPts[gdpPts.length - 2] : null;
    const gdpDelta = lastGdp?.gdp != null && prevGdp?.gdp != null ? +(lastGdp.gdp - prevGdp.gdp).toFixed(1) : null;
    const lastCpi = [...merged].reverse().find((r) => r.cpi != null) ?? null;
    const heroHeadline = lastGdp?.gdp == null ? 'Rządy a gospodarka'
        : lastGdp.gdp > 0 ? 'Gospodarka rośnie'
        : lastGdp.gdp < 0 ? 'Gospodarka się kurczy'
        : 'Dynamika PKB';

    return (
        <div className="space-y-6">
            <EditorialHero
                ariaLabel="Finanse publiczne — PKB i inflacja"
                period={lastGdp ? String(lastGdp.year) : null}
                source="GUS BDL · rocznie"
                headline={heroHeadline}
                description="Roczne PKB i CPI na tle ekip rządzących — wyłącznie dane GUS BDL. Brakujące odczyty pokazujemy jako —."
                value={lastGdp?.gdp != null ? formatDecimalPL(lastGdp.gdp, 1) : '—'}
                unit="%"
                delta={gdpDelta}
                valueCaption="PKB · dynamika roczna (r/r)"
                panelTitle="Ostatnie odczyty"
                rows={[
                    { label: 'PKB r/r', value: lastGdp?.gdp != null ? `${lastGdp.gdp > 0 ? '+' : ''}${formatDecimalPL(lastGdp.gdp, 1)}%` : '—' },
                    { label: 'Inflacja CPI', value: lastCpi?.cpi != null ? `${formatDecimalPL(lastCpi.cpi, 1)}%` : '—' },
                    { label: 'Rząd', value: lastGdp ? (govForYear(lastGdp.year)?.label ?? '—') : '—', divider: true },
                ]}
            />
            <SectionCard editorial titleVariant="label" title="Rządy a gospodarka" subtitle="roczne wskaźniki GUS — tło pokazuje ekipę rządzącą w danym okresie"
                actions={<Segmented value={metric} onChange={setMetric} options={METRICS.map((m) => ({ value: m.value, label: m.label }))} />}>
                <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart data={merged} margin={{ top: 8, right: 14, left: -6, bottom: 4 }}>
                        <CartesianGrid stroke="#EDF0F5" vertical={false} />
                        {PL_GOVERNMENTS.filter((g) => g.from <= maxY).map((g, i) => (
                            <ReferenceArea key={i} x1={Math.max(g.from, minY) - 0.5} x2={Math.min(g.to, maxY) + 0.5} fill={g.color} fillOpacity={0.1} stroke="none" ifOverflow="hidden" />
                        ))}
                        <ReferenceLine y={0} stroke="#CBD5E1" />
                        <XAxis dataKey="year" type="number" domain={[minY - 0.5, maxY + 0.5]} tick={{ fill: AXIS_INK, fontSize: 11 }} axisLine={{ stroke: '#E7EAF0' }} tickLine={false} tickCount={8} allowDecimals={false} />
                        <YAxis tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => formatDecimalPL(v, 0)} unit="%" />
                        <Tooltip content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const g = govForYear(Number(label));
                            const v = payload[0]?.value as number | undefined;
                            return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13 }}>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>{label}</div>
                                <div style={{ color: cur.color, fontWeight: 600 }}>{cur.label}: {v != null ? `${formatDecimalPL(v, 1)}%` : '—'}</div>
                                {g && <div style={{ color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />{g.label} · {g.pm}</div>}
                            </div>;
                        }} />
                        <Line dataKey={metric} name={cur.label} stroke={cur.color} strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
                    </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {PL_GOVERNMENTS.filter((g) => g.from <= maxY).map((g, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-mk-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: g.color }} /> {g.label} <span className="text-mk-faint">{g.from}–{yr(g.to)}</span></span>
                    ))}
                </div>
            </SectionCard>

            <SectionCard editorial titleVariant="label" title="Bilans gospodarczy rządów" subtitle="średnie roczne w okresie rządzenia · GUS BDL">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-sm">
                        <thead>
                            <tr className="border-b border-mk-border text-left text-[11px] uppercase tracking-wide text-mk-faint">
                                <th className="py-2 pr-3">Rząd</th><th className="pr-3">Lata</th>
                                <th className="pr-3 text-right">śr. PKB r/r</th><th className="text-right">śr. inflacja CPI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {govStats.map((g, i) => (
                                <tr key={i} className="border-b border-mk-border/60">
                                    <td className="py-2.5 pr-3"><span className="flex items-center gap-2"><span className="h-8 w-1 shrink-0 rounded-full" style={{ background: g.color }} /><span className="min-w-0"><span className="block truncate font-semibold text-mk-text">{g.label}</span><span className="block truncate text-[11px] text-mk-faint">{g.pm} · {g.orient}</span></span></span></td>
                                    <td className="whitespace-nowrap pr-3 text-mk-muted tnum">{g.from}–{yr(g.toClamped)}</td>
                                    <td className="pr-3 text-right font-semibold tnum" style={{ color: '#16A34A' }}>{g.avgGdp != null ? `${g.avgGdp > 0 ? '+' : ''}${formatDecimalPL(g.avgGdp, 1)}%` : '—'}</td>
                                    <td className="text-right tnum" style={{ color: '#D97706' }}>{g.avgCpi != null ? `${formatDecimalPL(g.avgCpi, 1)}%` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-[11px] text-mk-faint">Dane: GUS BDL — dynamika PKB ogółem (var 458272) i CPI ogółem (var 217230), rok poprzedni = 100. Dług publiczny i wynik sektora finansów publicznych nie są publikowane przez GUS w BDL/DBW w tej aplikacji — sekcje Eurostat zostały usunięte. <span className="font-medium text-mk-muted">Zestawienie opisowe</span> — na wyniki wpływa też koniunktura światowa i cykl, nie tylko polityka rządu.</p>
            </SectionCard>
        </div>
    );
}
