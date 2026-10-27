'use client';

import { useMemo } from 'react';
import { Banknote, Gauge, Landmark } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDecimalPL } from '@/lib/formatters';
import {
    BOJ_CREDIT_EN, BOJ_CREDIT_PL, BOJ_SERIES, lastBojPoint, levelSince, marketsSentence, pointChange,
    type BojPayload,
} from '@/lib/jp/boj';
import { useJpMarkets } from '@/lib/jp/use-jp-markets';

const dayLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const tick = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}.${m}`; };

export function JpMarkets({ initial }: { initial: BojPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpMarkets(initial);
    const fxRows = useMemo(() => (data?.series.usdjpy ?? []).map((p) => ({ date: p.date, usdjpy: p.value })), [data]);
    const rateRows = useMemo(() => {
        const byDate = new Map<string, { date: string; policy?: number; call?: number }>();
        for (const id of ['policy', 'call'] as const) {
            for (const p of data?.series[id] ?? []) {
                const row = byDate.get(p.date) ?? { date: p.date };
                row[id] = p.value;
                byDate.set(p.date, row);
            }
        }
        return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={280} />;
        return (
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie rynków Japonii">
                <div className="mk-skeleton h-40 w-full" />
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="mk-card h-20" />)}</div>
            </div>
        );
    }

    const fx = lastBojPoint(data.series.usdjpy);
    const policy = lastBojPoint(data.series.policy);
    const call = lastBojPoint(data.series.call);
    const since = levelSince(data.series.policy);
    const sentence = marketsSentence(data);

    const kpis: CompactKpiItem[] = [
        {
            key: 'usdjpy', label: 'USD/JPY', value: fx ? formatDecimalPL(fx.value, 2) : '—', unit: 'JPY', icon: Banknote,
            footnote: fx ? `17:00 Tokio · ${dayLabel(fx.date)}` : undefined,
        },
        {
            key: 'policy', label: 'Stopa BOJ', value: policy ? formatDecimalPL(policy.value, 2) : '—', unit: '%', icon: Landmark,
            footnote: since ? `ten poziom od ${dayLabel(since)}` : undefined,
        },
        {
            key: 'call', label: 'Call overnight', value: call ? formatDecimalPL(call.value, 3) : '—', unit: '%', icon: Gauge,
            footnote: call ? `średnia dzienna · ${dayLabel(call.date)}` : undefined,
        },
    ];

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Rynki Japonii — kurs jena i stopa BOJ"
                period={fx ? dayLabel(fx.date) : null}
                source="Bank Japonii"
                headline={fx ? `Dolar kosztuje ${formatDecimalPL(fx.value, 2)} jena` : 'Rynki Japonii'}
                description={<>{sentence}</>}
                value={fx ? formatDecimalPL(fx.value, 2) : '—'}
                unit="JPY"
                delta={pointChange(data.series.usdjpy)}
                deltaUnit="jena"
                panelTitle="Stopa i rynek pieniężny"
                rows={[
                    { label: 'Stopa BOJ (basic loan rate)', value: policy ? `${formatDecimalPL(policy.value, 2)}%` : '—' },
                    { label: 'Call overnight', value: call ? `${formatDecimalPL(call.value, 3)}%` : '—' },
                    { label: 'Kurs z godziny', value: '17:00 JST', divider: true },
                ]}
            />

            <CompactKpiGrid items={kpis} label="Jen i stopy" columns={6} dense />

            <SectionCard editorial titleVariant="label" title="Dolar do jena" subtitle="kurs spot o 17:00 czasu tokijskiego · jenów za dolara">
                <InteractiveChart
                    data={fxRows} xKey="date" height={300} unit=" JPY" showRange initialRange="6M" ranges={['1M', '3M', '6M', '1R']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 2)} xTickFormatter={tick}
                    series={[{ key: 'usdjpy', name: 'USD/JPY', color: '#2563EB', type: 'line', strokeWidth: 2 }]}
                />
            </SectionCard>

            <SectionCard editorial titleVariant="label" title="Stopy" subtitle="procent w skali roku · stopa BOJ zmienia się skokowo, call jest dzienny">
                <InteractiveChart
                    data={rateRows} xKey="date" height={280} unit="%" showRange initialRange="1R" ranges={['6M', '1R', '3L']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 3)} xTickFormatter={tick}
                    series={[
                        { key: 'policy', name: 'Stopa BOJ', color: '#DC2626', type: 'line', strokeWidth: 2.5 },
                        { key: 'call', name: 'Call O/N', color: '#7C3AED', type: 'line', strokeWidth: 1.5 },
                    ]}
                />
            </SectionCard>

            <SectionCard titleVariant="label" title="Jak czytać">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {BOJ_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.label}</strong> — {s.hint}</li>
                    ))}
                </ul>
            </SectionCard>

            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{BOJ_CREDIT_PL}</p>
                <p lang="en">{BOJ_CREDIT_EN}</p>
            </footer>
        </div>
    );
}
