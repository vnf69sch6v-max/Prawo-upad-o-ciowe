'use client';

import { useMemo } from 'react';
import { Banknote } from 'lucide-react';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import {
    JP_WAGE_SERIES, lastWagePoint, wageChangePp, wagesSentence, type JpWagesPayload,
} from '@/lib/jp/wages';
import { useJpWages } from '@/lib/jp/use-jp-wages';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };

export function JpWages({ initial }: { initial: JpWagesPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpWages(initial);
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; nominal?: number; real?: number }>();
        for (const id of ['nominal', 'real'] as const) {
            for (const p of data?.series[id] ?? []) {
                const row = byDate.get(p.date) ?? { date: p.date };
                row[id] = p.value;
                byDate.set(p.date, row);
            }
        }
        return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return (
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie płac w Japonii">
                <div className="mk-skeleton h-28 w-full" />
                <div className="grid grid-cols-2 gap-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="mk-card h-20" />)}</div>
            </div>
        );
    }

    const nominal = lastWagePoint(data.series.nominal);
    const real = lastWagePoint(data.series.real);
    const sameMonth = nominal && real && nominal.date === real.date;

    return (
        <div className="space-y-4">
            <SectionCard editorial titleVariant="label" title="Płace" subtitle="Monthly Labour Survey · rok do roku">
                <p className="mb-3 text-sm leading-relaxed text-mk-text-soft">{wagesSentence(data)} Liczba nominalna jest z komunikatu końcowego, po korekcie wstępnego odczytu.</p>
                <div className="grid grid-cols-2 gap-2">
                    <CompactKpi
                        label="Nominalne" icon={Banknote}
                        value={nominal ? formatDecimalPL(nominal.value, 1) : '—'} unit="%"
                        delta={wageChangePp(data.series.nominal) != null ? { value: wageChangePp(data.series.nominal)!, unit: 'pp' } : undefined}
                        footnote={nominal ? `zakłady od 5 osób · ${formatDataPeriod(nominal.date)}` : undefined}
                    />
                    <CompactKpi
                        label="Realne" icon={Banknote}
                        value={real ? formatDecimalPL(real.value, 1) : '—'} unit="%"
                        delta={wageChangePp(data.series.real) != null ? { value: wageChangePp(data.series.real)!, unit: 'pp' } : undefined}
                        footnote={real ? `CPI bez czynszu właściciela · ${formatDataPeriod(real.date)}` : undefined}
                    />
                </div>
                {!sameMonth && real && nominal && (
                    <p className="mt-2 text-xs text-mk-muted">Nominalne i realne są za różne miesiące — nie odejmuj ich od siebie.</p>
                )}
            </SectionCard>
            <SectionCard editorial titleVariant="label" title="Płace rok do roku" subtitle="procent · Monthly Labour Survey">
                <InteractiveChart
                    data={rows} xKey="date" height={280} unit="%" showRange initialRange="5L" ranges={['1R', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    series={JP_WAGE_SERIES.map((s) => ({
                        key: s.id, name: s.short, color: s.color, type: 'line' as const,
                        strokeWidth: s.id === 'nominal' ? 2.5 : 1.5, dashed: s.dashed,
                    }))}
                />
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać płace">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_WAGE_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
}
