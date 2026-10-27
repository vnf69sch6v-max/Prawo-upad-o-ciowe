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
    JP_JOBS_SERIES, jobsDelta, jobsSentence, lastJobsPoint, nextJobsRelease, type JpJobsPayload,
} from '@/lib/jp/jobs';
import { useJpJobs } from '@/lib/jp/use-jp-jobs';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:30:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 2)}`;

export function JpJobs({ initial }: { initial: JpJobsPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpJobs(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; sa?: number; fresh?: number }>();
        for (const id of ['sa', 'fresh'] as const) {
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
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie ofert pracy w Japonii" />;
    }

    const sa = lastJobsPoint(data.series.sa);
    const nsa = lastJobsPoint(data.series.nsa);
    const fresh = lastJobsPoint(data.series.fresh);
    const sameNsa = nsa && sa && nsa.date === sa.date ? nsa : null;
    const sameFresh = fresh && sa && fresh.date === sa.date ? fresh : null;
    const delta = jobsDelta(data.series.sa);
    const freshDelta = jobsDelta(data.series.fresh);
    const next = isClient ? nextJobsRelease(new Date()) : null;
    const headline = !sa
        ? 'Oferty pracy'
        : delta == null
            ? `Na osobę przypada ${formatDecimalPL(sa.value, 2)} oferty`
            : delta === 0
                ? 'Liczba ofert na osobę bez zmian'
                : delta > 0
                    ? `Ofert na osobę jest więcej o ${formatDecimalPL(delta, 2)}`
                    : `Ofert na osobę jest mniej o ${formatDecimalPL(Math.abs(delta), 2)}`;

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Oferty pracy w Japonii"
                period={sa ? formatDataPeriod(sa.date) : null}
                source="Ministry of Health, Labour and Welfare"
                headline={headline}
                description={<>{jobsSentence(data)} To oferty w urzędach pracy, nie ankieta bezrobocia.</>}
                value={sa ? formatDecimalPL(sa.value, 2) : '—'}
                unit=""
                valueCaption="oferty na osobę"
                panelTitle="Obok"
                rows={[
                    { label: 'Bez korekty sezonowej', value: sameNsa ? formatDecimalPL(sameNsa.value, 2) : '—' },
                    { label: 'Nowe oferty', value: sameFresh ? formatDecimalPL(sameFresh.value, 2) : '—', divider: true },
                    { label: 'Nowe wobec poprzedniego miesiąca', value: freshDelta == null ? '—' : signed(freshDelta) },
                ]}
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
                <CompactKpi label="Oferty na osobę" icon={Briefcase} value={sa ? formatDecimalPL(sa.value, 2) : '—'} footnote={delta == null ? 'po sezonie' : delta === 0 ? 'po sezonie · bez zmian m/m' : `po sezonie · ${signed(delta)} m/m`} />
                <CompactKpi label="Bez korekty" icon={Briefcase} value={sameNsa ? formatDecimalPL(sameNsa.value, 2) : '—'} footnote="ten miesiąc, z sezonem" />
                <CompactKpi label="Nowe oferty" icon={Briefcase} value={sameFresh ? formatDecimalPL(sameFresh.value, 2) : '—'} footnote={freshDelta == null ? 'po sezonie' : `po sezonie · ${signed(freshDelta)} m/m`} />
            </div>
            {rows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Oferty na osobę" subtitle="urzędy pracy · po sezonie">
                    <InteractiveChart
                        data={rows} xKey="date" height={260} showRange initialRange="1R" ranges={['1R', '5L', 'ALL']} legend
                        valueFormatter={(v) => formatDecimalPL(v, 2)} xTickFormatter={monthTick}
                        series={[
                            { key: 'sa', name: 'Oferty na osobę', color: '#0F766E', type: 'line' as const, strokeWidth: 2.5 },
                            { key: 'fresh', name: 'Nowe oferty', color: '#B45309', type: 'line' as const, strokeWidth: 1.5 },
                        ]}
                    />
                </SectionCard>
            )}
            <SectionCard titleVariant="label" title="Kolejny komunikat">
                <ul className="space-y-2.5 text-sm">
                    {!isClient && <li className="mk-skeleton h-10 w-full" aria-hidden />}
                    {isClient && (
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                                <CalendarClock size={17} aria-hidden />
                            </span>
                            <span>
                                <span className="block font-semibold text-mk-text">
                                    Oferty pracy{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:30 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać oferty">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_JOBS_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                    <li>Powyżej 1 ofert jest więcej niż osób szukających. Liczba obejmuje pracę na część etatu i zgłoszenia złożone online. To nie jest stopa bezrobocia z ankiety gospodarstw.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
