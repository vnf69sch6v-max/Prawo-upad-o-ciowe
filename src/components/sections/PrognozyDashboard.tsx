'use client';

import { useMemo } from 'react';
import { Scale, Target, Gauge, Factory, ShoppingCart, Percent } from 'lucide-react';
import {
    useCPIBasket, useCpiFull, useGusGdpAnnual, useGusIndustrialProduction, useGusRetailSales, useNBPInterestRates,
} from '@/lib/hooks';
import { plSeries, lastOf, prevOf, monthTick, fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { taylorRule, DEFAULT_TAYLOR } from '@/lib/calculations/taylor';
import { pmiToGDP, multiModelGDP } from '@/lib/calculations/leading';
import { PMI_DATA_PL, NBP_GDP_PROJECTION } from '@/lib/static-data';
import { PageHeroBand, type HeroKpiItem } from '@/components/ui/PageHeroBand';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DenseTwoCol } from '@/components/ui/DensePageLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { AXIS_INK } from '@/lib/chart-theme';

/** Gęsty dashboard prognoz — hero 3 + siatka KPI + wykresy GUS. Bez Eurostat. */
export function PrognozyDashboard() {
    const basketQ = useCPIBasket();
    const cpiQ = useCpiFull();
    const gdpQ = useGusGdpAnnual();
    const indQ = useGusIndustrialProduction();
    const retQ = useGusRetailSales();
    const ratesQ = useNBPInterestRates();

    const basket = basketQ.basket;
    const zaMaloDanych = basket.coverage < 80;

    const headline = cpiQ.data?.headline ?? [];
    const cpiSeries = useMemo(
        () => headline.filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })),
        [headline],
    );
    const cpiLast = lastOf(cpiSeries);
    const cpiDelta = cpiLast != null && prevOf(cpiSeries) != null ? +(cpiLast - prevOf(cpiSeries)!).toFixed(1) : null;

    const ipSeries = plSeries(indQ.data);
    const retailSeries = plSeries(retQ.data);
    const ip = lastOf(ipSeries);
    const retail = lastOf(retailSeries);
    const pmiLast = PMI_DATA_PL[PMI_DATA_PL.length - 1];
    const pmi = pmiLast?.value ?? null;
    const multi = pmi != null && ip != null && retail != null ? +multiModelGDP(pmi, ip, retail).toFixed(1) : null;

    const gdp = lastOf(plSeries(gdpQ.data));
    const ref = useMemo(
        () => ratesQ.data?.rates?.find((r) => /referen/i.test(r.name) || /referen/i.test(r.nameEn))?.value ?? null,
        [ratesQ.data],
    );
    const t = useMemo(() => (cpiLast != null && gdp != null ? taylorRule(DEFAULT_TAYLOR, cpiLast, gdp) : null), [cpiLast, gdp]);
    const gap = t && ref != null ? +(ref - t.optimalRate).toFixed(2) : null;

    const heroLoading = basketQ.isLoading || cpiQ.isLoading || gdpQ.isLoading || ratesQ.isLoading;

    const heroItems: [HeroKpiItem, HeroKpiItem, HeroKpiItem] = [
        {
            label: 'Nowcast CPI (koszyk)',
            value: zaMaloDanych ? '—' : fmtPL(basket.headlineNowcast),
            unit: zaMaloDanych ? undefined : '%',
            delta: !zaMaloDanych && cpiLast != null && basket.headlineNowcast != null
                ? +(basket.headlineNowcast - cpiLast).toFixed(1)
                : null,
            text: zaMaloDanych
                ? `Pokrycie koszyka ${fmtPL(basket.coverage, 0)}% — za mało danych.`
                : `Rekonstrukcja COICOP · pokrycie ${fmtPL(basket.coverage, 0)}%.`,
            footnote: basket.dataDate ? `GUS · ${basket.dataDate}` : 'GUS · koszyk COICOP',
            loading: heroLoading,
        },
        {
            label: 'Nowcast PKB',
            value: multi != null ? fmtPL(multi, 1) : '—',
            unit: multi != null ? '%' : undefined,
            text: 'Model 3-czynnikowy: PMI + produkcja + sprzedaż detaliczna (GUS).',
            footnote: pmiLast ? `PMI ${pmiLast.date} · GUS` : 'GUS + PMI',
            loading: indQ.isLoading || retQ.isLoading,
        },
        {
            label: 'Reguła Taylora',
            value: t ? fmtPL(t.optimalRate, 2) : '—',
            unit: t ? '%' : undefined,
            delta: gap,
            text: gap != null ? `Luka polityki pieniężnej (NBP − Taylor): ${gap > 0 ? '+' : ''}${formatDecimalPL(gap, 2)} p.p.` : undefined,
            footnote: ref != null ? `NBP obecnie ${fmtPL(ref, 2)}%` : 'NBP + GUS',
            loading: heroLoading,
        },
    ];

    const gridItems: CompactKpiItem[] = [
        {
            key: 'cpi-official',
            label: 'Oficjalny CPI',
            value: fmtPL(basket.official),
            unit: '%',
            icon: Target,
            delta: cpiDelta != null ? { value: cpiDelta, unit: 'pp', invert: true } : undefined,
            footnote: basket.dataDate ? `GUS · ${basket.dataDate}` : 'GUS · krajowy CPI',
            loading: basketQ.isLoading,
            watchId: 'cpi',
        },
        {
            key: 'pmi',
            label: 'PMI przemysłowy',
            value: pmi != null ? formatDecimalPL(pmi, 1) : '—',
            icon: Gauge,
            footnote: pmiLast ? `S&P Global · ${pmiLast.date}` : 'S&P Global',
        },
        {
            key: 'ref-rate',
            label: 'Stopa referencyjna',
            value: fmtPL(ref, 2),
            unit: '%',
            icon: Percent,
            footnote: 'NBP · bieżąca',
            loading: ratesQ.isLoading,
            watchId: 'ref-rate',
        },
        {
            key: 'coverage',
            label: 'Pokrycie koszyka',
            value: fmtPL(basket.coverage, 0),
            unit: '%',
            icon: Scale,
            footnote: 'dywizje COICOP z danymi',
            loading: basketQ.isLoading,
        },
        {
            key: 'industrial',
            label: 'Produkcja przemysłowa',
            value: fmtPL(ip),
            unit: '% r/r',
            icon: Factory,
            footnote: ipSeries.length ? `GUS · ${ipSeries[ipSeries.length - 1].date}` : 'GUS DBW',
            loading: indQ.isLoading,
        },
        {
            key: 'retail',
            label: 'Sprzedaż detaliczna',
            value: fmtPL(retail),
            unit: '% r/r',
            icon: ShoppingCart,
            footnote: retailSeries.length ? `GUS · ${retailSeries[retailSeries.length - 1].date}` : 'GUS BDL',
            loading: retQ.isLoading,
        },
    ];

    const pmiChart = PMI_DATA_PL.map((d) => ({ date: d.date, pmi: d.value }));

    return (
        <div className="space-y-4">
            <PageHeroBand items={heroItems} />
            <CompactKpiGrid items={gridItems} label="Makro — dane wejściowe (GUS)" columns={6} />
            <DenseTwoCol
                left={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="Inflacja CPI (r/r) — GUS"
                        subtitle="krajowy wskaźnik konsumencki"
                        actions={
                            <div className="flex items-center gap-2">
                                <StaleBadge date={cpiSeries.length ? cpiSeries[cpiSeries.length - 1].date : undefined} label="CPI do" />
                                <CsvExport filename="cpi-prognozy" headers={['Miesiąc', 'CPI r/r %']} rows={cpiSeries.map((r) => [r.date, r.value])} />
                            </div>
                        }
                    >
                        {cpiSeries.length < 2 ? (
                            <div className="mk-skeleton h-[260px] w-full" />
                        ) : (
                            <InteractiveChart
                                data={cpiSeries.map((r) => ({ date: r.date, value: r.value }))}
                                xKey="date"
                                height={260}
                                unit="%"
                                showRange
                                initialRange="1R"
                                valueFormatter={(v) => formatDecimalPL(v, 1)}
                                xTickFormatter={monthTick}
                                referenceLines={[{ y: 2.5, label: 'cel NBP', color: AXIS_INK }]}
                                series={[{ key: 'value', name: 'CPI r/r', color: '#D97706', type: 'area' }]}
                            />
                        )}
                    </SectionCard>
                }
                right={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="PMI przemysłowy"
                        subtitle={`model pomostowy → PKB · konsensus NBP 2026: ${fmtPL(NBP_GDP_PROJECTION.year2026, 1)}%`}
                        actions={
                            <div className="flex items-center gap-2">
                                <StaleBadge date={pmiLast?.date} label="PMI" />
                                <CsvExport filename="pmi-prognozy" headers={['Miesiąc', 'PMI']} rows={pmiChart.map((r) => [r.date, r.pmi])} />
                            </div>
                        }
                    >
                        <InteractiveChart
                            data={pmiChart}
                            xKey="date"
                            height={260}
                            showRange
                            initialRange="1R"
                            valueFormatter={(v) => formatDecimalPL(v, 0)}
                            xTickFormatter={monthTick}
                            referenceLines={[{ y: 50, label: 'neutralny', color: AXIS_INK }]}
                            series={[{ key: 'pmi', name: 'PMI', color: '#7C3AED', type: 'area' }]}
                        />
                        {pmi != null && (
                            <p className="mt-2 text-xs text-mk-muted">
                                PMI {formatDecimalPL(pmi, 1)} → szac. PKB {fmtPL(pmiToGDP(pmi), 1)}% (bridge)
                            </p>
                        )}
                    </SectionCard>
                }
            />
        </div>
    );
}
