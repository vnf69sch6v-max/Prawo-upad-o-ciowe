'use client';

import { useMemo } from 'react';
import { CalendarClock, Scale } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import {
    JP_TRADE_SERIES, formatMldYen, lastTradePoint, nextTradeRelease, okuToMld, primaryIncomeYoyOku, tradeSentence, type JpTradePayload,
} from '@/lib/jp/trade';
import { useJpTrade } from '@/lib/jp/use-jp-trade';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:50:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });

export function JpTrade({ initial }: { initial: JpTradePayload | null }) {
    const { data, isLoading, isError, refetch } = useJpTrade(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; current?: number; primary?: number; trade?: number }>();
        for (const id of ['current', 'primary', 'trade'] as const) {
            for (const p of data?.series[id] ?? []) {
                const row = byDate.get(p.date) ?? { date: p.date };
                row[id] = okuToMld(p.value);
                byDate.set(p.date, row);
            }
        }
        return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie bilansu płatniczego Japonii" />;
    }

    const current = lastTradePoint(data.series.current);
    const primary = lastTradePoint(data.series.primary);
    const trade = lastTradePoint(data.series.trade);
    const primarySame = primary && current && primary.date === current.date ? primary : null;
    const same = trade && current && trade.date === current.date ? trade : null;
    const primaryYoy = primarySame ? primaryIncomeYoyOku(data.series.primary, primarySame.date) : null;
    const next = isClient ? nextTradeRelease(new Date()) : null;
    const headline = !current
        ? 'Obroty bieżące'
        : current.value > 0 ? 'Nadwyżka obrotów bieżących' : current.value < 0 ? 'Deficyt obrotów bieżących' : 'Obroty bieżące bez salda';
    const prelim = current?.provisional ? 'wstępne' : undefined;

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Bilans płatniczy Japonii"
                period={current ? formatDataPeriod(current.date) : null}
                badge={prelim}
                source="Ministry of Finance"
                headline={headline}
                description={<>{tradeSentence(data)} Saldo z bilansu płatniczego, w miliardach jenów.</>}
                value={current ? formatMldYen(current.value) : '—'}
                unit="mld"
                valueCaption={prelim ? 'jenów · wstępne' : 'jenów'}
                panelTitle="Handel towarami"
                rows={[
                    {
                        label: primarySame?.provisional ? 'Dochód pierwotny · wstępne' : 'Dochód pierwotny',
                        value: primarySame ? `${formatMldYen(primarySame.value)} mld` : '—',
                    },
                    {
                        label: same?.provisional ? 'Handel · wstępne' : 'Handel towarami',
                        value: same ? `${formatMldYen(same.value)} mld` : '—',
                        divider: true,
                    },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi
                    label="Obroty bieżące"
                    icon={Scale}
                    value={current ? formatMldYen(current.value) : '—'}
                    unit="mld jenów"
                    footnote={current ? `${formatDataPeriod(current.date)}${current.provisional ? ' · wstępne' : ''}` : undefined}
                />
                <CompactKpi
                    label="Dochód pierwotny"
                    icon={Scale}
                    value={primarySame ? formatMldYen(primarySame.value) : '—'}
                    unit="mld jenów"
                    footnote={primarySame ? `${formatDataPeriod(primarySame.date)}${primarySame.provisional ? ' · wstępne' : ''}${primaryYoy != null ? ` · ${primaryYoy > 0 ? '+' : '−'}${formatMldYen(Math.abs(primaryYoy))} mld r/r` : ''}` : undefined}
                />
                <div className="col-span-2">
                    <CompactKpi
                        label="Handel towarami"
                        icon={Scale}
                        value={same ? formatMldYen(same.value) : '—'}
                        unit="mld jenów"
                        footnote={same ? `${formatDataPeriod(same.date)}${same.provisional ? ' · wstępne' : ''}` : undefined}
                    />
                </div>
            </div>
            {rows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Bilans płatniczy" subtitle="mld jenów · bez korekty sezonowej">
                    <InteractiveChart
                        data={rows} xKey="date" height={260} unit="mld jenów" showRange initialRange="1R" ranges={['1R', '5L', 'ALL']} legend
                        valueFormatter={(v) => formatDecimalPL(v, 1)} yTickFormatter={(v) => formatNumber(v, 0)} xTickFormatter={monthTick}
                        series={JP_TRADE_SERIES.map((s) => ({
                            key: s.id, name: s.short, color: s.color, type: 'line' as const,
                            strokeWidth: s.id === 'current' ? 2.5 : 1.5, dashed: s.dashed,
                        }))}
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
                                    Bilans płatniczy{next && <> · {formatDataPeriod(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:50 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać bilans">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    {JP_TRADE_SERIES.map((s) => (
                        <li key={s.id}><strong className="font-semibold text-mk-text">{s.short}</strong> — {s.hint}</li>
                    ))}
                    <li>Jednostka źródła to 億円, czyli 100 mln jenów. Dziesięć takich jednostek to 1 mld jenów na stronie.</li>
                    <li>Ostatni miesiąc bywa oznaczony jako wstępny. Ministerstwo później publikuje korektę, a miesiące kończące kwartał dostają drugi komunikat.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
