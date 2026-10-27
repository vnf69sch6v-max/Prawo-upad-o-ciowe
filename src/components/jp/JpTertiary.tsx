'use client';

import { useMemo } from 'react';
import { Briefcase, CalendarClock } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import {
    JP_TERTIARY_SERIES, lastTertiaryPoint, nextTertiaryRelease, tertiaryMom, tertiarySentence, tertiaryYoy,
    type JpTertiaryPayload,
} from '@/lib/jp/tertiary';
import { useJpTertiary } from '@/lib/jp/use-jp-tertiary';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T13:30:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpTertiary({ initial }: { initial: JpTertiaryPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpTertiary(initial);
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
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie aktywności usług w Japonii">
                <div className="mk-skeleton h-40 w-full" />
                <div className="grid grid-cols-2 gap-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="mk-card h-20" />)}</div>
            </div>
        );
    }

    const sa = lastTertiaryPoint(data.series.sa);
    const mom = tertiaryMom(data.series.sa);
    const yoy = tertiaryYoy(data.series.nsa);
    const next = isClient ? nextTertiaryRelease(new Date()) : null;
    const prelim = sa?.provisional ? 'wstępne' : null;
    const headline = mom == null
        ? 'Aktywność usług'
        : mom < 0 ? `Aktywność usług spadła o ${formatDecimalPL(Math.abs(mom), 1)}%`
            : mom > 0 ? `Aktywność usług wzrosła o ${formatDecimalPL(mom, 1)}%`
                : 'Aktywność usług bez zmian';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Aktywność usług w Japonii"
                period={sa ? formatDataPeriod(sa.date) : null}
                badge={prelim}
                source="Ministry of Economy, Trade and Industry"
                headline={headline}
                description={<>{tertiarySentence(data)}</>}
                value={mom == null ? '—' : signed(mom)}
                unit="%"
                valueCaption={prelim ? 'wobec poprzedniego miesiąca · wstępne' : 'wobec poprzedniego miesiąca'}
                panelTitle="Indeks"
                rows={[
                    { label: 'Wyrównany sezonowo', value: sa ? formatDecimalPL(sa.value, 1) : '—' },
                    { label: 'Rok do roku, bez korekty', value: yoy == null ? '—' : `${signed(yoy)}%`, divider: true },
                ]}
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
                <CompactKpi label="Wobec poprzedniego miesiąca" icon={Briefcase} value={mom == null ? '—' : signed(mom)} unit="%" footnote={prelim ? 'wyrównana sezonowo · wstępne' : 'wyrównana sezonowo'} />
                <CompactKpi label="Indeks" icon={Briefcase} value={sa ? formatDecimalPL(sa.value, 1) : '—'} footnote={prelim ? 'baza 2020 = 100 · wstępne' : 'baza 2020 = 100'} />
                <CompactKpi label="Rok do roku" icon={Briefcase} value={yoy == null ? '—' : signed(yoy)} unit="%" footnote="indeks bez korekty sezonowej" />
            </div>
            <SectionCard editorial titleVariant="label" title="Indeks aktywności usług" subtitle="baza 2020 = 100 · METI">
                <InteractiveChart
                    data={rows} xKey="date" height={300} showRange initialRange="5L" ranges={['1R', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    series={JP_TERTIARY_SERIES.map((s) => ({
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
                                    Komunikat{next && <> · za {formatDataPeriod(next.period).split(' ')[0]}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 13:30 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_TERTIARY_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                    <li>Ostatni miesiąc bywa wstępny. W następnym komunikacie ministerstwo może go skorygować, a na stronie zostaje ostatnia liczba z Dashboardu.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
