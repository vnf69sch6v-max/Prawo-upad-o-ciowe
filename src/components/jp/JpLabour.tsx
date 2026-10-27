'use client';

import { useMemo } from 'react';
import { CalendarClock, Users } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { releaseInstant } from '@/lib/jp/calendar';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import {
    JP_LABOUR_SERIES, labourChangePp, labourSentence, lastLabourPoint, nextLfsRelease, type JpLabourPayload,
} from '@/lib/jp/labour';
import { useJpLabour } from '@/lib/jp/use-jp-labour';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(releaseInstant(iso)).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });

export function JpLabour({ initial }: { initial: JpLabourPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpLabour(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; sa?: number; nsa?: number }>();
        for (const id of ['sa', 'nsa'] as const) {
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
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie bezrobocia w Japonii">
                <div className="mk-skeleton h-40 w-full" />
                <div className="grid grid-cols-2 gap-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="mk-card h-20" />)}</div>
            </div>
        );
    }

    const sa = lastLabourPoint(data.series.sa);
    const nsa = lastLabourPoint(data.series.nsa);
    const next = isClient ? nextLfsRelease(new Date()) : null;
    const kpis: CompactKpiItem[] = [
        {
            key: 'sa', label: 'Wyrównana sezonowo', value: sa ? formatDecimalPL(sa.value, 1) : '—', unit: '%', icon: Users,
            delta: labourChangePp(data.series.sa) != null ? { value: labourChangePp(data.series.sa)!, unit: 'pp', invert: true } : undefined,
            footnote: sa ? `dane za ${formatDataPeriod(sa.date)} · komunikat` : undefined,
        },
        {
            key: 'nsa', label: 'Bez korekty', value: nsa ? formatDecimalPL(nsa.value, 1) : '—', unit: '%', icon: Users,
            footnote: nsa ? `dane za ${formatDataPeriod(nsa.date)}` : undefined,
        },
    ];

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Bezrobocie w Japonii"
                period={sa ? formatDataPeriod(sa.date) : null}
                source="Statistics Bureau of Japan"
                headline={sa ? `Bezrobocie ${formatDecimalPL(sa.value, 1)}%` : 'Bezrobocie w Japonii'}
                description={<>{labourSentence(data)} Liczba z komunikatu jest wyrównana sezonowo.</>}
                value={sa ? formatDecimalPL(sa.value, 1) : '—'}
                unit="%"
                valueCaption="wyrównana sezonowo"
                delta={labourChangePp(data.series.sa)}
                deltaUnit="p.p."
                panelTitle="Dwie miary"
                rows={[
                    { label: 'Wyrównana sezonowo', value: sa ? `${formatDecimalPL(sa.value, 1)}%` : '—' },
                    { label: 'Bez korekty sezonowej', value: nsa ? `${formatDecimalPL(nsa.value, 1)}%` : '—', divider: true },
                ]}
            />
            <CompactKpiGrid items={kpis} label="Stopa bezrobocia" columns={4} dense />
            <SectionCard editorial titleVariant="label" title="Stopa bezrobocia" subtitle="procent siły roboczej · Labour Force Survey">
                <InteractiveChart
                    data={rows} xKey="date" height={300} unit="%" showRange initialRange="5L" ranges={['1R', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    series={JP_LABOUR_SERIES.map((s) => ({
                        key: s.id, name: s.short, color: s.color, type: 'line' as const,
                        strokeWidth: s.id === 'sa' ? 2.5 : 1.5, dashed: s.dashed,
                    }))}
                />
            </SectionCard>
            <SectionCard titleVariant="label" title="Kolejna publikacja">
                <ul className="space-y-2.5 text-sm">
                    {!isClient && <li className="mk-skeleton h-10 w-full" aria-hidden />}
                    {isClient && (
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                                <CalendarClock size={17} aria-hidden />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-semibold text-mk-text">
                                    Labour Force Survey{next && <> · za {formatDataPeriod(next.period).split(' ')[0]}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:30 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_LABOUR_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
