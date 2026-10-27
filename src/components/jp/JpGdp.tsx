'use client';

import { useMemo } from 'react';
import { CalendarClock, Landmark } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { JP_GDP_SERIES, gdpSentence, lastGdpPoint, nextGdpRelease, type JpGdpPayload } from '@/lib/jp/gdp';
import { useJpGdp } from '@/lib/jp/use-jp-gdp';

const tick = (d: string) => { const m = d.match(/^(\d{4})-Q([1-4])$/); return m ? `${['I', 'II', 'III', 'IV'][+m[2] - 1]}.${m[1].slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:50:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpGdp({ initial }: { initial: JpGdpPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpGdp(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; real?: number; nominal?: number }>();
        for (const id of ['real', 'nominal'] as const) {
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
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie PKB Japonii" />;
    }

    const real = lastGdpPoint(data.series.real);
    const nominal = lastGdpPoint(data.series.nominal);
    const next = isClient ? nextGdpRelease(new Date()) : null;
    const headline = !real ? 'PKB Japonii' : real.value < 0 ? `PKB spadł o ${formatDecimalPL(Math.abs(real.value), 1)}%` : real.value > 0 ? `PKB wzrósł o ${formatDecimalPL(real.value, 1)}%` : 'PKB bez zmian';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="PKB Japonii"
                period={real ? formatDataPeriod(real.date) : null}
                source="Cabinet Office"
                headline={headline}
                description={<>{gdpSentence(data)} To zmiana wobec poprzedniego kwartału, nie tempo w skali roku.</>}
                value={real ? signed(real.value) : '—'}
                unit="%"
                valueCaption="wobec poprzedniego kwartału"
                panelTitle="Dwie ceny"
                rows={[
                    { label: 'Realny', value: real ? `${signed(real.value)}%` : '—' },
                    { label: 'Nominalny', value: nominal ? `${signed(nominal.value)}%` : '—', divider: true },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi label="Realny" icon={Landmark} value={real ? signed(real.value) : '—'} unit="%" footnote="ceny stałe · komunikat" />
                <CompactKpi label="Nominalny" icon={Landmark} value={nominal ? signed(nominal.value) : '—'} unit="%" footnote="ceny bieżące" />
            </div>
            <SectionCard editorial titleVariant="label" title="PKB wobec poprzedniego kwartału" subtitle="procent · wyrównany sezonowo · baza 2020">
                <InteractiveChart
                    data={rows} xKey="date" height={260} unit="%" showRange initialRange="5L" ranges={['1R', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={tick}
                    series={JP_GDP_SERIES.map((s) => ({
                        key: s.id, name: s.short, color: s.color, type: 'line' as const,
                        strokeWidth: s.id === 'real' ? 2.5 : 1.5, dashed: s.dashed,
                    }))}
                />
            </SectionCard>
            <SectionCard titleVariant="label" title="Kolejny drugi komunikat">
                <ul className="space-y-2.5 text-sm">
                    {!isClient && <li className="mk-skeleton h-10 w-full" aria-hidden />}
                    {isClient && (
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                                <CalendarClock size={17} aria-hidden />
                            </span>
                            <span>
                                <span className="block font-semibold text-mk-text">
                                    PKB{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:50 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać PKB">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_GDP_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                    <li>Pierwszy komunikat wychodzi wcześniej i bywa poprawiany w drugim. Na stronie jest ostatni odczyt, który ma Dashboard.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
