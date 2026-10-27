'use client';

import { useMemo } from 'react';
import { CalendarClock, Factory } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { cgpiMom, cgpiSentence, lastCgpiPoint, nextCgpiRelease, type JpCgpiPayload } from '@/lib/jp/cgpi';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { useJpCgpi } from '@/lib/jp/use-jp-cgpi';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:50:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpCgpi({ initial }: { initial: JpCgpiPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpCgpi(initial);
    const isClient = useIsClient();
    const yoyRows = useMemo(() => (data?.series.yoy ?? []).map((p) => ({ date: p.date, yoy: p.value })), [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie cen producenta w Japonii" />;
    }

    const yoy = lastCgpiPoint(data.series.yoy);
    const index = lastCgpiPoint(data.series.index);
    const sameIndex = index && yoy && index.date === yoy.date ? index : null;
    const mom = sameIndex ? cgpiMom(data.series.index) : null;
    const prevRate = data.series.yoy.length > 1 ? data.series.yoy[data.series.yoy.length - 2].value : null;
    const next = isClient ? nextCgpiRelease(new Date()) : null;
    const headline = !yoy ? 'Ceny producenta' : yoy.value > 0 ? `Ceny producenta wzrosły o ${formatDecimalPL(yoy.value, 1)}%` : yoy.value < 0 ? `Ceny producenta spadły o ${formatDecimalPL(Math.abs(yoy.value), 1)}%` : 'Ceny producenta bez zmian rok do roku';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Ceny producenta w Japonii"
                period={yoy ? formatDataPeriod(yoy.date) : null}
                badge={yoy?.provisional ? 'wstępne' : null}
                source="Bank of Japan"
                headline={headline}
                description={<>{cgpiSentence(data)} To tempo rok do roku, ceny między firmami.</>}
                value={yoy ? signed(yoy.value) : '—'}
                unit="%"
                valueCaption={yoy?.provisional ? 'rok do roku · wstępne' : 'rok do roku'}
                panelTitle="Indeks"
                rows={[
                    { label: 'Indeks, baza 2020', value: sameIndex ? formatDecimalPL(sameIndex.value, 1) : '—' },
                    { label: 'Wobec poprzedniego miesiąca', value: mom == null ? '—' : `${signed(mom)}%`, divider: true },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi
                    label="Rok do roku"
                    icon={Factory}
                    value={yoy ? signed(yoy.value) : '—'}
                    unit="%"
                    footnote={yoy ? `${formatDataPeriod(yoy.date)}${yoy.provisional ? ' · wstępne' : ''}${prevRate != null ? ` · wcześniej ${signed(prevRate)}%` : ''}` : undefined}
                />
                <CompactKpi
                    label="Indeks"
                    icon={Factory}
                    value={sameIndex ? formatDecimalPL(sameIndex.value, 1) : '—'}
                    unit=""
                    footnote={mom == null ? 'baza 2020' : `baza 2020 · ${signed(mom)}% m/m`}
                />
            </div>
            {yoyRows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Ceny producenta rok do roku" subtitle="procent · krajowy indeks · baza 2020">
                    <InteractiveChart
                        data={yoyRows} xKey="date" height={260} unit="%" showRange initialRange="5L" ranges={['1R', '5L', 'ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        series={[{ key: 'yoy', name: 'Rok do roku', color: '#DC2626', type: 'line', strokeWidth: 2.5 }]}
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
                                    Ceny producenta{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:50 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać ceny producenta">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">Rok do roku</strong> — krajowy indeks cen, po których firmy sprzedają sobie towary. To nie jest inflacja koszyka gospodarstw domowych.</li>
                    <li><strong className="font-semibold text-mk-text">Indeks</strong> — poziom przy bazie 2020 = 100. Obok jest zmiana tego poziomu wobec poprzedniego miesiąca.</li>
                    <li>Ostatni miesiąc bywa wstępny. Bank Japonii później publikuje korektę, a na stronie zostaje ostatnia liczba z Dashboardu.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
