'use client';

import type { LucideIcon } from 'lucide-react';
import { useDbwSeries, type DbwSeriesConfig } from '@/lib/hooks';
import { fmtPL } from '@/lib/series';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';

export interface PriceSeries { poz: number; name: string; color: string; accent: AccentKey; icon?: LucideIcon }

const tick = (d: string) => {
    const [y, rest] = d.split('-');
    if (!rest) return d;
    return rest.startsWith('Q') ? `${rest}'${y.slice(2)}` : `${rest}.${y.slice(2)}`;
};

/** Reusable price/index section backed by the generic DBW series route. */
export function DbwPriceSection({ title, subtitle, config, series, unit = '%', refline, csvName, note, invertKpi = true, heroTitle, heroText, heroPoz }: {
    title: string; subtitle: string; config: DbwSeriesConfig; series: PriceSeries[]; unit?: string; refline?: number; csvName: string; note?: string; invertKpi?: boolean;
    heroTitle?: string; heroText?: string; heroPoz?: number;
}) {
    const q = useDbwSeries(config);
    const data = q.data?.series ?? [];

    // Ostatni dostępny odczyt danej serii (serie mogą kończyć się w różnych okresach) — realne dane GUS.
    const latestOf = (poz: number) => {
        const key = String(poz);
        const pts = data.filter((r) => typeof r[key] === 'number');
        const last = pts.length ? pts[pts.length - 1] : null;
        const prevPt = pts.length > 1 ? pts[pts.length - 2] : null;
        const v = last ? (last[key] as number) : null;
        const pv = prevPt ? (prevPt[key] as number) : null;
        const d = v != null && pv != null ? +(v - pv).toFixed(1) : null;
        return { v, d, date: last ? (last.date as string) : null };
    };
    const primary = series.find((s) => s.poz === heroPoz) ?? series[0];
    const heroPrimary = primary ? latestOf(primary.poz) : { v: null, d: null, date: null };
    const heroPeriod = heroPrimary.date ? formatDataPeriod(heroPrimary.date) : null;

    return (
        <div className="space-y-6">
            {primary && (
                <section className="overflow-hidden rounded-[14px] bg-mk-brand p-6 text-white" aria-label={`${heroTitle ?? title} — najważniejszy odczyt`}>
                    <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                {heroPeriod && <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mk-brand-strong tnum">{heroPeriod}</span>}
                                <span className="text-xs font-semibold text-white/70">GUS · dane</span>
                            </div>
                            <h2 className="mt-3.5 max-w-[26ch] text-[26px] font-extrabold leading-tight tracking-tight">{heroTitle ?? title}</h2>
                            {(heroText ?? note) && <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-white/90">{heroText ?? note}</p>}
                            <div className="mt-5 flex items-baseline gap-4">
                                <span className="text-[56px] font-extrabold leading-none tracking-tight tnum">{heroPrimary.v != null ? `${heroPrimary.v > 0 ? '+' : ''}${formatDecimalPL(heroPrimary.v, 1)}` : '—'}<span className="ml-1 text-2xl font-semibold text-white/70">{unit}</span></span>
                                {heroPrimary.d != null && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-bold text-mk-brand-strong tnum">
                                        {heroPrimary.d > 0 ? '↑ +' : heroPrimary.d < 0 ? '↓ ' : '→ '}{formatDecimalPL(heroPrimary.d, 1)} p.p.
                                    </span>
                                )}
                            </div>
                            {primary && <div className="mt-2 text-xs font-semibold text-white/70">{primary.name}</div>}
                        </div>
                        <div className="md:border-l md:border-white/25 md:pl-6">
                            <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">Ostatnie odczyty</div>
                            <div className="mt-4 space-y-2 text-[13px] tnum">
                                {series.map((s) => {
                                    const l = latestOf(s.poz);
                                    return (
                                        <div key={s.poz} className="flex justify-between gap-2">
                                            <span className="truncate text-white/80">{s.name}</span>
                                            <strong>{l.v != null ? `${l.v > 0 ? '+' : ''}${formatDecimalPL(l.v, 1)}${unit}` : '—'}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section>
                <h2 className="mk-section-label mb-3">Ostatnie odczyty</h2>
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${series.length >= 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
                {series.map((s) => {
                    // Ostatnia DOSTĘPNA wartość tej serii (serie mogą kończyć się w różnych okresach —
                    // np. GUS publikuje „bydło" później niż pszenicę → nie pokazuj „—", tylko ostatni odczyt z jego datą).
                    const key = String(s.poz);
                    const pts = data.filter((r) => typeof r[key] === 'number');
                    const last = pts.length ? pts[pts.length - 1] : null;
                    const prevPt = pts.length > 1 ? pts[pts.length - 2] : null;
                    const v = last ? (last[key] as number) : null;
                    const pv = prevPt ? (prevPt[key] as number) : undefined;
                    const d = v != null && typeof pv === 'number' ? +(v - pv).toFixed(1) : null;
                    return (
                        <KpiCard key={s.poz} label={s.name} value={fmtPL(v)} unit={unit} accent={s.accent} icon={s.icon}
                            delta={d != null ? { value: d, unit: 'pp', invert: invertKpi } : undefined}
                            footnote={last ? `GUS · ${last.date}` : 'GUS'} loading={q.isLoading} />
                    );
                })}
                </div>
            </section>
            <SectionCard editorial titleVariant="label" title={title} subtitle={subtitle}
                actions={<CsvExport filename={csvName} headers={['Okres', ...series.map((s) => s.name)]} rows={data.map((r) => [r.date as string, ...series.map((s) => r[String(s.poz)] as number)])} />}>
                {q.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : data.length === 0 ? (
                    <p className="py-10 text-center text-sm text-mk-faint">Brak danych dla wybranego okresu.</p>
                ) : (
                    <InteractiveChart data={data} xKey="date" height={300} unit={` ${unit}`} legend={series.length > 1}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={tick}
                        referenceLines={refline != null ? [{ y: refline, color: '#CBD2DD' }] : undefined}
                        series={series.map((s) => ({ key: String(s.poz), name: s.name, color: s.color, type: series.length > 1 ? ('line' as const) : ('area' as const) }))} />
                )}
            </SectionCard>
            {note && <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft">{note}</div>}
        </div>
    );
}
