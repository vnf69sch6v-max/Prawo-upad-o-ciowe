'use client';

import { useMemo } from 'react';
import { CalendarClock, Home } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import {
    housingAnnMom, housingSentence, housingYoy, lastHousingPoint, nextHousingRelease, type JpHousingPayload,
} from '@/lib/jp/housing';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { useJpHousing } from '@/lib/jp/use-jp-housing';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T14:00:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpHousing({ initial }: { initial: JpHousingPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpHousing(initial);
    const isClient = useIsClient();
    const yoyRows = useMemo(() => {
        const points = data?.series.count ?? [];
        return points.flatMap((p) => {
            const yoy = housingYoy(points, p.date);
            return yoy == null ? [] : [{ date: p.date, yoy }];
        });
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie nowych mieszkań w Japonii" />;
    }

    const count = lastHousingPoint(data.series.count);
    const annual = lastHousingPoint(data.series.annual);
    const sameAnnual = annual && count && annual.date === count.date ? annual : null;
    const yoy = housingYoy(data.series.count);
    const mom = sameAnnual ? housingAnnMom(data.series.annual) : null;
    const parts = (['owner', 'rent', 'sale'] as const).map((id) => {
        const point = lastHousingPoint(data.series[id]);
        const same = point && count && point.date === count.date ? point : null;
        return { id, point: same, yoy: same ? housingYoy(data.series[id], same.date) : null };
    });
    const partLabel = { owner: 'Własne', rent: 'Na wynajem', sale: 'Na sprzedaż' };
    const next = isClient ? nextHousingRelease(new Date()) : null;
    const headline = yoy == null
        ? 'Nowe mieszkania'
        : yoy > 0 ? `Budów mieszkań rozpoczęto o ${formatDecimalPL(yoy, 1)}% więcej` : yoy < 0 ? `Budów mieszkań rozpoczęto o ${formatDecimalPL(Math.abs(yoy), 1)}% mniej` : 'Budów mieszkań tyle samo co rok wcześniej';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Nowe mieszkania w Japonii"
                period={count ? formatDataPeriod(count.date) : null}
                source="Ministry of Land, Infrastructure, Transport and Tourism"
                headline={headline}
                description={<>{housingSentence(data)}</>}
                value={yoy == null ? '—' : signed(yoy)}
                unit="%"
                valueCaption="rok do roku"
                panelTitle="Skala roku"
                rows={[
                    { label: 'Mieszkania w tym miesiącu', value: count ? formatNumber(count.value, 0) : '—' },
                    { label: 'Tempo roczne, sezonowo', value: sameAnnual ? formatNumber(sameAnnual.value, 0) : '—', divider: true },
                    { label: 'Tempo wobec poprzedniego miesiąca', value: mom == null ? '—' : `${signed(mom)}%` },
                ]}
            />
            <div className="grid grid-cols-2 gap-2 [&>*:last-child:nth-child(odd)]:col-span-2">
                <CompactKpi label="Rok do roku" icon={Home} value={yoy == null ? '—' : signed(yoy)} unit="%" footnote={count ? formatDataPeriod(count.date) : undefined} />
                <CompactKpi label="Skala roku" icon={Home} value={sameAnnual ? formatNumber(sameAnnual.value, 0) : '—'} unit="mieszkań" footnote={mom == null ? 'sezonowo' : `sezonowo · ${signed(mom)}% m/m`} />
                {parts.map((part) => (
                    <CompactKpi
                        key={part.id}
                        label={partLabel[part.id]}
                        icon={Home}
                        value={part.point ? formatNumber(part.point.value, 0) : '—'}
                        unit="mieszkań"
                        footnote={part.yoy == null ? undefined : `${signed(part.yoy)}% r/r`}
                    />
                ))}
            </div>
            {yoyRows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Nowe mieszkania rok do roku" subtitle="procent · liczba rozpoczętych budów">
                    <InteractiveChart
                        data={yoyRows} xKey="date" height={260} unit="%" showRange initialRange="1R" ranges={['1R', '5L', 'ALL']}
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
                                    Nowe mieszkania{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 14:00 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać nowe mieszkania">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">Rok do roku</strong> — liczba mieszkań, których budowę rozpoczęto w tym miesiącu, wobec tego samego miesiąca rok wcześniej. Taką stopę podaje ministerstwo w pierwszym zdaniu komunikatu.</li>
                    <li><strong className="font-semibold text-mk-text">Skala roku</strong> — to samo tempo po zdjęciu sezonu i przeliczeniu na rok. Porównanie z poprzednim miesiącem ma sens dopiero na tej liczbie.</li>
                    <li><strong className="font-semibold text-mk-text">Trzy grupy</strong> — dom na własne potrzeby, mieszkanie na wynajem i lokal na sprzedaż. Reszta łącznej liczby to mieszkania służbowe.</li>
                    <li>Mieszkanie w tym zestawieniu to lokal z własnym wejściem, nie cała kamienica.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
