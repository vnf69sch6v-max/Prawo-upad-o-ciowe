'use client';

import type { LucideIcon } from 'lucide-react';
import { useDbwSeries, type DbwSeriesConfig } from '@/lib/hooks';
import { fmtPL } from '@/lib/series';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { QueryState } from '@/components/ui/QueryState';

export interface PriceSeries { poz: number; name: string; color: string; accent: AccentKey; icon?: LucideIcon }

const tick = (d: string) => {
    const [y, rest] = d.split('-');
    if (!rest) return d;
    return rest.startsWith('Q') ? `${rest}'${y.slice(2)}` : `${rest}.${y.slice(2)}`;
};

/** Reusable price/index section backed by the generic DBW series route. */
export function DbwPriceSection({ title, subtitle, config, series, unit = '%', refline, note, invertKpi = true, heroTitle, heroText, heroPoz }: {
    title: string; subtitle: string; config: DbwSeriesConfig; series: PriceSeries[]; unit?: string; refline?: number; note?: string; invertKpi?: boolean;
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
                <EditorialHero
                    ariaLabel={`${heroTitle ?? title} — najważniejszy odczyt`}
                    period={heroPeriod}
                    source="GUS · dane"
                    headline={heroTitle ?? title}
                    description={heroText ?? note}
                    value={heroPrimary.v != null ? `${heroPrimary.v > 0 ? '+' : ''}${formatDecimalPL(heroPrimary.v, 1)}` : '—'}
                    unit={unit}
                    delta={heroPrimary.d}
                    valueCaption={primary.name}
                    panelTitle="Ostatnie odczyty"
                    rows={series.map((s) => {
                        const l = latestOf(s.poz);
                        return { label: s.name, value: l.v != null ? `${l.v > 0 ? '+' : ''}${formatDecimalPL(l.v, 1)}${unit}` : '—' };
                    })}
                />
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
                            footnote={last ? String(last.date) : ''} loading={q.isLoading}
                            error={q.isError} onRetry={() => { void q.refetch(); }} />
                    );
                })}
                </div>
            </section>
            <SectionCard editorial titleVariant="label" title={title} subtitle={subtitle}>
                <QueryState
                    isLoading={q.isLoading}
                    isError={q.isError}
                    isEmpty={data.length === 0}
                    onRetry={() => { void q.refetch(); }}
                    height={300}
                    emptyTitle="Brak danych dla wybranego okresu."
                >
                    <InteractiveChart data={data} xKey="date" height={300} unit={` ${unit}`} legend={series.length > 1}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={tick}
                        referenceLines={refline != null ? [{ y: refline, color: '#CBD2DD' }] : undefined}
                        series={series.map((s) => ({ key: String(s.poz), name: s.name, color: s.color, type: series.length > 1 ? ('line' as const) : ('area' as const) }))} />
                </QueryState>
            </SectionCard>
            {note && <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft">{note}</div>}
        </div>
    );
}
