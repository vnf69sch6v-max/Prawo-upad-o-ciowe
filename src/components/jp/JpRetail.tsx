'use client';

import { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { lastRetailPoint, retailSentence, retailYoy, retailYoySeries, type JpRetailPayload } from '@/lib/jp/retail';
import { useJpRetail } from '@/lib/jp/use-jp-retail';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

export function JpRetail({ initial }: { initial: JpRetailPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpRetail(initial);
    const yoyRows = useMemo(() => retailYoySeries(data?.points), [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return (
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie sprzedaży detalicznej w Japonii">
                <div className="mk-skeleton h-36 w-full" />
            </div>
        );
    }

    const last = lastRetailPoint(data.points);
    const yoy = retailYoy(data.points);
    const headline = yoy == null
        ? 'Sprzedaż detaliczna'
        : yoy > 0 ? `Sprzedaż wzrosła o ${formatDecimalPL(yoy, 1)}%` : yoy < 0 ? `Sprzedaż spadła o ${formatDecimalPL(Math.abs(yoy), 1)}%` : 'Sprzedaż bez zmian rok do roku';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Sprzedaż detaliczna w Japonii"
                period={last ? formatDataPeriod(last.date) : null}
                source="Ministry of Economy, Trade and Industry"
                headline={headline}
                description={<>{retailSentence(data.points)} Liczba jest z komunikatu końcowego, w cenach bieżących.</>}
                value={yoy == null ? '—' : signed(yoy)}
                unit="%"
                valueCaption="rok do roku"
                panelTitle="Poziom"
                rows={[
                    { label: 'Sprzedaż', value: last ? `${formatNumber(last.value, 0)} mld jenów` : '—' },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi label="Rok do roku" icon={ShoppingCart} value={yoy == null ? '—' : signed(yoy)} unit="%" footnote="z opublikowanych poziomów" />
                <CompactKpi label="Sprzedaż" icon={ShoppingCart} value={last ? formatNumber(last.value, 0) : '—'} unit="mld jenów" footnote={last ? formatDataPeriod(last.date) : undefined} />
            </div>
            {yoyRows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Sprzedaż rok do roku" subtitle="procent · poziomy po styczniu 2025">
                    <InteractiveChart
                        data={yoyRows} xKey="date" height={260} unit="%" showRange initialRange="ALL" ranges={['ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        series={[{ key: 'yoy', name: 'Rok do roku', color: '#DC2626', type: 'line', strokeWidth: 2.5 }]}
                    />
                </SectionCard>
            )}
            <SectionCard titleVariant="label" title="Jak czytać sprzedaż">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">Poziom</strong> — sprzedaż detalu w całym kraju, ceny bieżące. Jednostka źródła to 10億円, czyli 1 mld jenów.</li>
                    <li><strong className="font-semibold text-mk-text">Rok do roku</strong> — liczone z tych poziomów. Ministerstwo liczy stopę z dokładniejszych kwot, więc bywa o 0,1 p.p. inna.</li>
                    <li>Od stycznia 2025 poziomy są po spisie gospodarczym. Wcześniejszego roku nie przeliczamy, więc stopy wobec 2024 nie pokazujemy.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
            </footer>
        </div>
    );
}
