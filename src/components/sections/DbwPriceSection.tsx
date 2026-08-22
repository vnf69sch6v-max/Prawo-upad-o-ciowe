'use client';

import type { LucideIcon } from 'lucide-react';
import { useDbwSeries, type DbwSeriesConfig } from '@/lib/hooks';
import { fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
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
export function DbwPriceSection({ title, subtitle, config, series, unit = '%', refline, csvName, note, invertKpi = true }: {
    title: string; subtitle: string; config: DbwSeriesConfig; series: PriceSeries[]; unit?: string; refline?: number; csvName: string; note?: string; invertKpi?: boolean;
}) {
    const q = useDbwSeries(config);
    const data = q.data?.series ?? [];

    return (
        <div className="space-y-6">
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
