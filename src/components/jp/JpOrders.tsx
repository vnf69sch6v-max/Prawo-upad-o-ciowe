'use client';

import { useMemo } from 'react';
import { CalendarClock, Cog } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import {
    formatOrdersMld, lastOrdersPoint, nextOrdersRelease, ordersMom, ordersSentence, type JpOrdersPayload,
} from '@/lib/jp/orders';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { useJpOrders } from '@/lib/jp/use-jp-orders';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:50:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpOrders({ initial }: { initial: JpOrdersPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpOrders(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; mom?: number }>();
        const points = data?.series.sa ?? [];
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const last = points[i];
            if (!prev.value) continue;
            const [y, m] = prev.date.split('-').map(Number);
            const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
            if (last.date !== expected) continue;
            const mom = Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
            byDate.set(last.date, { date: last.date, mom });
        }
        return [...byDate.values()];
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie zamówień maszyn w Japonii" />;
    }

    const sa = lastOrdersPoint(data.series.sa);
    const yoy = lastOrdersPoint(data.series.yoy);
    const sameYoy = yoy && sa && yoy.date === sa.date ? yoy : null;
    const mom = ordersMom(data.series.sa);
    const next = isClient ? nextOrdersRelease(new Date()) : null;
    const headline = mom == null
        ? 'Zamówienia maszyn'
        : mom > 0 ? `Zamówienia maszyn wzrosły o ${formatDecimalPL(mom, 1)}%` : mom < 0 ? `Zamówienia maszyn spadły o ${formatDecimalPL(Math.abs(mom), 1)}%` : 'Zamówienia maszyn bez zmian';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Zamówienia maszyn w Japonii"
                period={sa ? formatDataPeriod(sa.date) : null}
                source="Cabinet Office"
                headline={headline}
                description={<>{ordersSentence(data)}</>}
                value={mom == null ? '—' : signed(mom)}
                unit="%"
                valueCaption="wobec poprzedniego miesiąca"
                panelTitle="Obok"
                rows={[
                    { label: 'Rok do roku, bez korekty', value: sameYoy ? `${signed(sameYoy.value)}%` : '—' },
                    { label: 'Poziom', value: sa ? `${formatOrdersMld(sa.value)} mld jenów` : '—', divider: true },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi label="Wobec poprzedniego miesiąca" icon={Cog} value={mom == null ? '—' : signed(mom)} unit="%" footnote={sa ? `${formatDataPeriod(sa.date)} · sezonowo` : 'sezonowo'} />
                <CompactKpi label="Rok do roku" icon={Cog} value={sameYoy ? signed(sameYoy.value) : '—'} unit="%" footnote="bez korekty sezonowej" />
            </div>
            {rows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Zamówienia wobec poprzedniego miesiąca" subtitle="procent · sezonowo · bez statków i energetyki">
                    <InteractiveChart
                        data={rows} xKey="date" height={260} unit="%" showRange initialRange="1R" ranges={['1R', '5L', 'ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        series={[{ key: 'mom', name: 'Wobec poprzedniego miesiąca', color: '#DC2626', type: 'line', strokeWidth: 2.5 }]}
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
                                    Zamówienia maszyn{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:50 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać zamówienia">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">Wobec poprzedniego miesiąca</strong> — popyt prywatny na maszyny, bez statków i energetyki, wyrównany sezonowo. To liczba z czołówki komunikatu Gabinetu i wskaźnik wyprzedzający inwestycji.</li>
                    <li><strong className="font-semibold text-mk-text">Rok do roku</strong> — ten sam popyt bez korekty sezonowej. Gabinet podaje obie stopy obok siebie.</li>
                    <li>Gabinet w komunikacie dopisuje też słowną ocenę koniunktury. Na stronie zostaje liczba.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
