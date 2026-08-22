'use client';

import { useMemo } from 'react';
import { DollarSign, Percent, LineChart, Landmark, Gem, BarChart3, Fuel } from 'lucide-react';
import {
    useNBPTable, useEURPLN, useUSDPLN, useGold, useStooq, useNBPInterestRates, useWibor, useBondYield10YPl,
    type NBPTable,
} from '@/lib/hooks';
import { lastOf, prevOf, monthTick } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import { PageHeroBand, type HeroKpiItem } from '@/components/ui/PageHeroBand';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DenseTwoCol } from '@/components/ui/DensePageLayout';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { CsvExport } from '@/components/ui/CsvExport';

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

/** Gęsty dashboard rynkowy — hero 3 + siatka KPI + newsy i wykres. Źródła: NBP + Stooq. */
export function RynkiDashboard() {
    const fxQ = useNBPTable('a');
    const eurHQ = useEURPLN();
    const usdHQ = useUSDPLN();
    const ratesQ = useNBPInterestRates();
    const wiborQ = useWibor();
    const yieldQ = useBondYield10YPl(30);
    const goldQ = useGold(30);
    const wig20Q = useStooq('wig20', 60);
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

    const wigBars = useMemo(() => barsOf(wig20Q), [wig20Q.data]);
    const wigLast = lastCloseOf(wig20Q);
    const wigDelta = pctDelta(wigBars);

    const yield10 = useMemo(() => (yieldQ.data?.data ?? []).map((d) => ({ date: d.date, value: d.close })), [yieldQ.data]);
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
            text: 'Indeks blue chip GPW · notowania Yahoo/Stooq.',
            footnote: 'GPW · Stooq/Yahoo',
            loading: heroLoading,
        },
        {
            label: 'EUR / PLN',
            value: mid('EUR') != null ? formatDecimalPL(mid('EUR')!, 3) : '—',
            unit: 'zł',
            delta: fxDelta(eurHQ.data),
            deltaUnit: 'pct',
            text: fxTable?.effectiveDate ? `Kurs średni NBP · ${formatDate(fxTable.effectiveDate)}` : 'Kurs średni NBP (tabela A).',
            footnote: fxTable?.effectiveDate ? `NBP · ${formatDate(fxTable.effectiveDate)}` : 'NBP tab. A',
            loading: heroLoading,
        },
        {
            label: 'Stopa referencyjna',
            value: refRate ? formatDecimalPL(refRate.value, 2) : '—',
            unit: '%',
            text: refRate ? `Obowiązuje od ${formatDate(refRate.validFrom)}.` : 'Kluczowa stopa polityki pieniężnej NBP.',
            footnote: refRate ? `NBP · od ${formatDate(refRate.validFrom)}` : 'NBP',
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
            footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP',
            loading: fxQ.isLoading,
            href: '/rynki?tab=kursy',
            watchId: 'usd-pln',
        },
        {
            key: 'wibor',
            label: 'WIBOR 3M',
            value: wibor3M != null ? formatDecimalPL(wibor3M, 2) : '—',
            unit: '%',
            icon: Percent,
            footnote: wiborQ.data?.rates?.[0]?.date ? `NBP · ${wiborQ.data.rates[0].date}` : 'NBP',
            loading: wiborQ.isLoading,
            href: '/rynki?tab=stopy',
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
            footnote: yield10.length ? `Rynek · ${yield10[yield10.length - 1].date}` : 'Stooq 10Y PL',
            loading: yieldQ.isLoading,
        },
        {
            key: 'gold',
            label: 'Złoto (NBP)',
            value: goldLast != null ? formatDecimalPL(goldLast, 2) : '—',
            unit: 'zł/g',
            icon: Gem,
            delta: goldDelta != null ? { value: goldDelta, unit: 'pct' } : undefined,
            footnote: 'NBP · cena złota',
            loading: goldQ.isLoading,
            href: '/rynki?tab=kursy',
            watchId: 'gold',
        },
        {
            key: 'mwig40',
            label: 'mWIG40',
            value: lastCloseOf(mwigQ) != null ? formatNumber(Math.round(lastCloseOf(mwigQ)!)) : '—',
            unit: 'pkt',
            icon: BarChart3,
            delta: pctDelta(barsOf(mwigQ)) != null ? { value: pctDelta(barsOf(mwigQ))!, unit: 'pct' } : undefined,
            footnote: 'GPW · notowania',
            loading: mwigQ.isLoading,
            href: '/rynki?tab=gpw',
        },
        {
            key: 'brent',
            label: 'Ropa Brent',
            value: lastCloseOf(brentQ) != null ? formatDecimalPL(lastCloseOf(brentQ)!, 1) : '—',
            unit: 'USD/bbl',
            icon: Fuel,
            delta: pctDelta(barsOf(brentQ)) != null ? { value: pctDelta(barsOf(brentQ))!, unit: 'pct' } : undefined,
            footnote: 'Yahoo Finance',
            loading: brentQ.isLoading,
        },
    ];

    return (
        <div className="space-y-4">
            <PageHeroBand items={heroItems} />
            <CompactKpiGrid items={gridItems} label="Rynek — więcej wskaźników" columns={6} />
            <DenseTwoCol
                left={<RelatedNews topic="rynki" limit={5} title="Newsy rynkowe" />}
                right={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="WIG20 — 60 sesji"
                        subtitle="poziom indeksu · Yahoo/Stooq"
                        actions={<CsvExport filename="wig20-dashboard" headers={['Data', 'Zamknięcie']} rows={wig20Chart.map((r) => [r.date, r.value])} />}
                    >
                        {wig20Chart.length < 2 ? (
                            <div className="mk-skeleton h-[280px] w-full" />
                        ) : (
                            <InteractiveChart
                                data={wig20Chart}
                                xKey="date"
                                height={280}
                                showRange
                                initialRange="ALL"
                                valueFormatter={(v) => formatNumber(Math.round(v))}
                                xTickFormatter={monthTick}
                                series={[{ key: 'value', name: 'WIG20', color: '#2563EB', type: 'area', strokeWidth: 2.5 }]}
                            />
                        )}
                    </SectionCard>
                }
            />
        </div>
    );
}
