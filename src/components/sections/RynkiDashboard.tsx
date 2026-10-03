'use client';

import { useMemo } from 'react';
import { DollarSign, Percent, Landmark, Gem, BarChart3, Fuel } from 'lucide-react';
import {
    useNBPTable, useEURPLN, useUSDPLN, useGold, useStooq, useNBPInterestRates, useWibor, useBondYield10Y,
    type NBPTable,
} from '@/lib/hooks';
import { lastOf, prevOf, dayTick, plSeries, nbpHistorySeries, closeSeries } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, formatDataPeriod, percentChange } from '@/lib/formatters';
import { PageHeroBand, type HeroKpiItem } from '@/components/ui/PageHeroBand';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';

function fxDelta(data: unknown): number | null {
    const raw = data as { rates?: { mid?: number }[] } | { mid?: number }[] | undefined;
    const arr = Array.isArray(raw) ? raw : raw?.rates;
    if (!arr || arr.length < 2) return null;
    const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
    return a && b ? +percentChange(a, b).toFixed(2) : null;
}

type QBar = { date: string; close: number };
const barsOf = (q: { data?: { data: QBar[] } }): QBar[] => q.data?.data ?? [];
const lastCloseOf = (q: { data?: { latest: QBar | null } }): number | null => q.data?.latest?.close ?? null;
const pctDelta = (bars: QBar[]): number | null =>
    bars.length > 1 ? +percentChange(bars[bars.length - 1].close, bars[bars.length - 2].close).toFixed(2) : null;
/** Trend kafla: ~6 tygodni sesji / 12 miesięcy (KpiSparkline). */
const SPARK_DAYS = 30;
const SPARK_MONTHS = 12;

/** Gęsty dashboard rynkowy — hero 3 + siatka KPI + newsy i wykres. Źródła: NBP + Yahoo Finance (przez /api/stooq). */
export function RynkiDashboard() {
    const fxQ = useNBPTable('a');
    const eurHQ = useEURPLN();
    const usdHQ = useUSDPLN();
    const ratesQ = useNBPInterestRates();
    const wiborQ = useWibor();
    // Rentowność 10Y: średnia miesięczna Eurostatu — dzienne źródło (Stooq 10ypl.b) blokuje serwer.
    const yieldQ = useBondYield10Y();
    const goldQ = useGold(30);
    // Rok sesji (Yahoo `range=1y`), żeby przełączniki 1M/3M/6M/ALL na wykresie faktycznie coś zmieniały.
    // Wcześniej 60 sesji: „6M", „1R" i „ALL" pokazywały ten sam obraz.
    const wig20Q = useStooq('wig20', 250);
    const mwigQ = useStooq('mwig40', 30);
    const brentQ = useStooq('cb.c', 30);

    const fxTable = useMemo(() => {
        const raw = fxQ.data as NBPTable | NBPTable[] | undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [fxQ.data]);
    const mid = (code: string) => fxTable?.rates?.find((r) => r.code === code)?.mid ?? null;

    const refRate = useMemo(
        () => ratesQ.data?.rates?.find((x) => /referen/i.test(x.name) || /referen/i.test(x.nameEn)) ?? null,
        [ratesQ.data],
    );
    const wibor3M = useMemo(() => wiborQ.data?.rates?.find((r) => r.tenor === '3M')?.wibor ?? null, [wiborQ.data]);
    // /api/wibor NIE ma źródła fixingu (GPW Benchmark blokuje serwer): po zmianie stopy NBP liczy
    // „stopa referencyjna + stały spread" i stempluje to dzisiejszą datą. Kafel nie może udawać fixingu.
    const wiborRow = wiborQ.data?.rates?.[0];
    const wiborEstimated = wiborRow?.source?.startsWith('estimated') ?? false;

    const wigBars = useMemo<QBar[]>(() => wig20Q.data?.data ?? [], [wig20Q.data]);
    const wigLast = lastCloseOf(wig20Q);
    const wigDelta = pctDelta(wigBars);

    const yield10 = useMemo(() => plSeries(yieldQ.data), [yieldQ.data]);
    const gold = useMemo(() => (goldQ.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [goldQ.data]);
    const goldLast = lastOf(gold);
    const goldDelta = gold.length > 1 ? +percentChange(gold[gold.length - 1].value, gold[gold.length - 2].value).toFixed(2) : null;

    const wig20Chart = useMemo(() => wigBars.map((b) => ({ date: b.date, value: b.close })), [wigBars]);

    const heroLoading = wig20Q.isLoading || fxQ.isLoading || ratesQ.isLoading;
    const heroItems: [HeroKpiItem, HeroKpiItem, HeroKpiItem] = [
        {
            label: 'WIG20',
            value: wigLast != null ? formatNumber(wigLast, 0) : '—',
            unit: 'pkt',
            delta: wigDelta,
            deltaUnit: 'pct',
            text: 'Indeks blue chip GPW · notowania Yahoo Finance.',
            loading: heroLoading,
        },
        {
            label: 'EUR / PLN',
            value: mid('EUR') != null ? formatDecimalPL(mid('EUR')!, 3) : '—',
            unit: 'zł',
            delta: fxDelta(eurHQ.data),
            deltaUnit: 'pct',
            text: fxTable?.effectiveDate ? `Kurs średni NBP · ${formatDate(fxTable.effectiveDate)}` : 'Kurs średni NBP (tabela A).',
            footnote: fxTable?.effectiveDate ? formatDate(fxTable.effectiveDate) : undefined,
            loading: heroLoading,
        },
        {
            label: 'Stopa referencyjna',
            value: refRate ? formatDecimalPL(refRate.value, 2) : '—',
            unit: '%',
            text: refRate ? `Obowiązuje od ${formatDate(refRate.validFrom)}.` : 'Kluczowa stopa polityki pieniężnej NBP.',
            footnote: refRate ? formatDate(refRate.validFrom) : undefined,
            loading: heroLoading,
        },
    ];

    const gridItems: CompactKpiItem[] = [
        {
            key: 'usd',
            label: 'USD / PLN',
            value: mid('USD') != null ? formatDecimalPL(mid('USD')!, 3) : '—',
            unit: 'zł',
            icon: DollarSign,
            delta: fxDelta(usdHQ.data) != null ? { value: fxDelta(usdHQ.data)!, unit: 'pct', invert: true } : undefined,
            footnote: fxTable?.effectiveDate ? formatDate(fxTable.effectiveDate) : undefined,
            spark: nbpHistorySeries(usdHQ.data).slice(-SPARK_DAYS),
            sparkFormat: (v) => `${formatDecimalPL(v, 3)} zł`,
            loading: fxQ.isLoading,
            error: fxQ.isError,
            onRetry: () => { void fxQ.refetch(); },
            watchId: 'usd-pln',
        },
        {
            key: 'wibor',
            label: wiborEstimated ? 'WIBOR 3M (szac.)' : 'WIBOR 3M',
            value: wibor3M != null ? formatDecimalPL(wibor3M, 2) : '—',
            unit: '%',
            icon: Percent,
            footnote: wiborRow
                ? (wiborEstimated ? 'szacunek: stopa ref. NBP + spread' : `fixing GPW · ${formatDate(wiborRow.date)}`)
                : undefined,
            loading: wiborQ.isLoading,
            error: wiborQ.isError,
            onRetry: () => { void wiborQ.refetch(); },
        },
        {
            key: 'yield10',
            label: 'Rentowność 10Y',
            value: lastOf(yield10) != null ? formatDecimalPL(lastOf(yield10)!, 2) : '—',
            unit: '%',
            icon: Landmark,
            delta: lastOf(yield10) != null && prevOf(yield10) != null
                ? { value: +(lastOf(yield10)! - prevOf(yield10)!).toFixed(2), unit: 'pp', invert: true }
                : undefined,
            footnote: yield10.length ? `śr. mies. · ${formatDataPeriod(yield10[yield10.length - 1].date)}` : 'średnia miesięczna',
            spark: yield10.slice(-SPARK_MONTHS),
            sparkFormat: (v) => `${formatDecimalPL(v, 2)}%`,
            loading: yieldQ.isLoading,
            error: yieldQ.isError,
            onRetry: () => { void yieldQ.refetch(); },
        },
        {
            key: 'gold',
            label: 'Złoto (NBP)',
            value: goldLast != null ? formatDecimalPL(goldLast, 2) : '—',
            unit: 'zł/g',
            icon: Gem,
            delta: goldDelta != null ? { value: goldDelta, unit: 'pct' } : undefined,
            footnote: gold.length ? formatDate(gold[gold.length - 1].date) : undefined,
            spark: gold.slice(-SPARK_DAYS),
            sparkFormat: (v) => `${formatDecimalPL(v, 2)} zł/g`,
            loading: goldQ.isLoading,
            error: goldQ.isError,
            onRetry: () => { void goldQ.refetch(); },
            watchId: 'gold',
        },
        {
            key: 'mwig40',
            label: 'mWIG40',
            value: lastCloseOf(mwigQ) != null ? formatNumber(Math.round(lastCloseOf(mwigQ)!)) : '—',
            unit: 'pkt',
            icon: BarChart3,
            delta: pctDelta(barsOf(mwigQ)) != null ? { value: pctDelta(barsOf(mwigQ))!, unit: 'pct' } : undefined,
            footnote: barsOf(mwigQ).at(-1)?.date ? formatDate(barsOf(mwigQ).at(-1)!.date) : undefined,
            spark: closeSeries(barsOf(mwigQ)).slice(-SPARK_DAYS),
            sparkFormat: (v) => `${formatNumber(Math.round(v))} pkt`,
            loading: mwigQ.isLoading,
            error: mwigQ.isError,
            onRetry: () => { void mwigQ.refetch(); },
        },
        {
            key: 'brent',
            label: 'Ropa Brent',
            value: lastCloseOf(brentQ) != null ? formatDecimalPL(lastCloseOf(brentQ)!, 1) : '—',
            unit: 'USD/bbl',
            icon: Fuel,
            delta: pctDelta(barsOf(brentQ)) != null ? { value: pctDelta(barsOf(brentQ))!, unit: 'pct' } : undefined,
            footnote: barsOf(brentQ).at(-1)?.date ? formatDate(barsOf(brentQ).at(-1)!.date) : undefined,
            spark: closeSeries(barsOf(brentQ)).slice(-SPARK_DAYS),
            sparkFormat: (v) => `${formatDecimalPL(v, 1)} USD`,
            loading: brentQ.isLoading,
            error: brentQ.isError,
            onRetry: () => { void brentQ.refetch(); },
        },
    ];

    return (
        <div className="space-y-4">
            <PageHeroBand items={heroItems} />
            <CompactKpiGrid items={gridItems} label="Rynek — więcej wskaźników" columns={6} />
            {/* Desktop: newsy | wykres. Poniżej `lg` sam wykres — newsy strona stawia na końcu
                (hierarchia na telefonie: liczby → wykres → notowania → newsy). */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <div className="hidden min-w-0 lg:block">
                    <RelatedNews topic="rynki" limit={5} title="Newsy rynkowe" />
                </div>
                <div className="min-w-0">
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="WIG20 — notowania dzienne"
                        subtitle={wigBars.length ? `poziom indeksu · ostatnia sesja ${formatDate(wigBars[wigBars.length - 1].date)} · Yahoo Finance` : 'poziom indeksu · Yahoo Finance'}
                    >
                        <QueryState
                            isLoading={wig20Q.isLoading}
                            isError={wig20Q.isError}
                            isEmpty={wig20Chart.length < 2}
                            onRetry={() => { void wig20Q.refetch(); }}
                            height={280}
                            emptyTitle="Brak danych WIG20"
                        >
                            <InteractiveChart
                                data={wig20Chart}
                                xKey="date"
                                height={280}
                                showRange
                                initialRange="3M"
                                ranges={['1M', '3M', '6M', 'ALL']}
                                unit=" pkt"
                                valueFormatter={(v) => formatNumber(Math.round(v))}
                                xTickFormatter={dayTick}
                                series={[{ key: 'value', name: 'WIG20', color: '#2563EB', type: 'area', strokeWidth: 2.5 }]}
                            />
                        </QueryState>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
