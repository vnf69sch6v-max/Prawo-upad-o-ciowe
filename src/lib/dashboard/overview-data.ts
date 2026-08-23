'use client';

/**
 * Dane Przeglądu — ten sam zestaw KPI, którego używa dzisiejsza strona główna.
 */

import { useMemo } from 'react';
import { TrendingUp, Percent, Users, Factory, Euro, DollarSign, ShoppingCart, LineChart, Landmark, Gem } from 'lucide-react';
import {
    useCpiFull, useGusRegisteredUnemployment, useGusRetailSales, useGusIndustrialProduction,
    useNBPInterestRates, useNBPTable, useEURPLN, useUSDPLN,
    useBondYield10YPl, useGold, useStooq,
    type NBPTable,
} from '@/lib/hooks';
import { plSeries, lastOf, prevOf } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import type { AccentKey } from '@/components/ui/KpiCard';
import type { WatchableKpi } from '@/components/ui/WatchlistStrip';

type Point = { date: string; value: number };
const fmt1 = (n: number | null | undefined) => (n == null ? '—' : formatDecimalPL(n, 1));
const ppDelta = (s: Point[]) => (lastOf(s) != null && prevOf(s) != null ? +(lastOf(s)! - prevOf(s)!).toFixed(1) : null);

function fxDelta(data: unknown): number | null {
    const raw = data as { rates?: { mid?: number }[] } | { mid?: number }[] | undefined;
    const arr = Array.isArray(raw) ? raw : raw?.rates;
    if (!arr || arr.length < 2) return null;
    const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
    return a && b ? +percentChange(a, b).toFixed(2) : null;
}

export function useOverviewData() {
    const cpiQ = useCpiFull();
    const unempQ = useGusRegisteredUnemployment(24);
    const retailQ = useGusRetailSales();
    const indQ = useGusIndustrialProduction();
    const ratesQ = useNBPInterestRates();
    const fxQ = useNBPTable('a');
    const eurHQ = useEURPLN();
    const usdHQ = useUSDPLN();
    const yieldQ = useBondYield10YPl(30);
    const goldQ = useGold(30);
    const wig20Q = useStooq('wig20', 30);

    const cpi = useMemo(() => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })), [cpiQ.data]);
    const unemp = useMemo(() => (unempQ.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })), [unempQ.data]);
    const retail = useMemo(() => plSeries(retailQ.data), [retailQ.data]);
    const industrial = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const yield10 = useMemo(() => (yieldQ.data?.data ?? []).map((d) => ({ date: d.date, value: d.close })), [yieldQ.data]);
    const gold = useMemo(() => (goldQ.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [goldQ.data]);

    const refRate = useMemo(() => ratesQ.data?.rates?.find((x) => /referen/i.test(x.name) || /referen/i.test(x.nameEn)) ?? null, [ratesQ.data]);
    const fxTable = useMemo(() => { const raw = fxQ.data as NBPTable | NBPTable[] | undefined; return Array.isArray(raw) ? raw[0] : raw; }, [fxQ.data]);
    const mid = (code: string) => fxTable?.rates?.find((r) => r.code === code)?.mid ?? null;
    const wigLast = wig20Q.data?.latest?.close ?? null;
    const wigBars = useMemo(() => wig20Q.data?.data ?? [], [wig20Q.data]);
    const wigDelta = wigBars.length > 1 ? +percentChange(wigBars[wigBars.length - 1].close, wigBars[wigBars.length - 2].close).toFixed(2) : null;
    const goldLast = lastOf(gold);
    const goldDelta = gold.length > 1 ? +percentChange(gold[gold.length - 1].value, gold[gold.length - 2].value).toFixed(2) : null;

    const macro: WatchableKpi[] = useMemo(() => [
        { watchId: 'cpi', label: 'Inflacja CPI (r/r)', href: '/ceny?tab=inflacja', value: fmt1(lastOf(cpi)), unit: '%', accent: 'amber' as AccentKey, icon: TrendingUp, delta: ppDelta(cpi) != null ? { value: ppDelta(cpi)!, unit: 'pp' as const, invert: true } : undefined, footnote: cpi.length ? `GUS · ${cpi[cpi.length - 1].date}` : 'GUS · cel NBP 2,5%', loading: cpiQ.isLoading },
        { watchId: 'unemployment', label: 'Stopa bezrobocia', href: '/praca?tab=bezrobocie', value: fmt1(lastOf(unemp)), unit: '%', accent: 'blue' as AccentKey, icon: Users, delta: ppDelta(unemp) != null ? { value: ppDelta(unemp)!, unit: 'pp' as const, invert: true } : undefined, footnote: unemp.length ? `GUS · rejestrowane · ${unemp[unemp.length - 1].date}` : 'GUS · rejestrowane', loading: unempQ.isLoading },
        { watchId: 'ref-rate', label: 'Stopa referencyjna NBP', href: '/rynki?tab=stopy', value: refRate ? formatDecimalPL(refRate.value, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Percent, footnote: refRate ? `NBP · od ${formatDate(refRate.validFrom)}` : 'NBP', loading: ratesQ.isLoading },
        { watchId: 'industrial', label: 'Produkcja przemysłowa (r/r)', href: '/gospodarka?tab=aktywnosc', value: fmt1(lastOf(industrial)), unit: '%', accent: 'rose' as AccentKey, icon: Factory, delta: ppDelta(industrial) != null ? { value: ppDelta(industrial)!, unit: 'pp' as const } : undefined, footnote: industrial.length ? `GUS · ${industrial[industrial.length - 1].date}` : 'GUS DBW', loading: indQ.isLoading },
        { watchId: 'retail', label: 'Sprzedaż detaliczna (r/r)', href: '/gospodarka?tab=aktywnosc', value: fmt1(lastOf(retail)), unit: '%', accent: 'cyan' as AccentKey, icon: ShoppingCart, delta: ppDelta(retail) != null ? { value: ppDelta(retail)!, unit: 'pp' as const } : undefined, footnote: retail.length ? `GUS · ${retail[retail.length - 1].date}` : 'GUS BDL', loading: retailQ.isLoading },
    ], [cpi, unemp, industrial, retail, refRate, cpiQ.isLoading, unempQ.isLoading, ratesQ.isLoading, indQ.isLoading, retailQ.isLoading]);

    const markets: WatchableKpi[] = useMemo(() => [
        { watchId: 'wig20', label: 'WIG20', href: '/rynki?tab=gpw', value: wigLast != null ? formatNumber(wigLast, 0) : '—', unit: 'pkt', accent: 'blue' as AccentKey, icon: LineChart, delta: wigDelta != null ? { value: wigDelta, unit: 'pct' as const } : undefined, footnote: 'GPW · Stooq/Yahoo', loading: wig20Q.isLoading },
        { watchId: 'eur-pln', label: 'EUR / PLN', href: '/rynki?tab=kursy', value: mid('EUR') != null ? formatDecimalPL(mid('EUR')!, 3) : '—', unit: 'zł', accent: 'cyan' as AccentKey, icon: Euro, delta: fxDelta(eurHQ.data) != null ? { value: fxDelta(eurHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { watchId: 'usd-pln', label: 'USD / PLN', href: '/rynki?tab=kursy', value: mid('USD') != null ? formatDecimalPL(mid('USD')!, 3) : '—', unit: 'zł', accent: 'green' as AccentKey, icon: DollarSign, delta: fxDelta(usdHQ.data) != null ? { value: fxDelta(usdHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { watchId: 'yield-10y', label: 'Rentowność 10Y', href: '/gospodarka?tab=finanse', value: lastOf(yield10) != null ? formatDecimalPL(lastOf(yield10)!, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Landmark, delta: lastOf(yield10) != null && prevOf(yield10) != null ? { value: +(lastOf(yield10)! - prevOf(yield10)!).toFixed(2), unit: 'pp' as const, invert: true } : undefined, footnote: yield10.length ? `Rynek · ${yield10[yield10.length - 1].date}` : 'Stooq 10Y PL', loading: yieldQ.isLoading },
        { watchId: 'gold', label: 'Złoto (NBP)', href: '/rynki?tab=kursy', value: goldLast != null ? formatDecimalPL(goldLast, 2) : '—', unit: 'zł/g', accent: 'amber' as AccentKey, icon: Gem, delta: goldDelta != null ? { value: goldDelta, unit: 'pct' as const } : undefined, footnote: 'NBP · cena złota', loading: goldQ.isLoading },
    ], [wigLast, wigDelta, wig20Q.isLoading, fxTable, eurHQ.data, usdHQ.data, fxQ.isLoading, yield10, yieldQ.isLoading, goldLast, goldDelta, goldQ.isLoading]);

    const watchlistItems = useMemo(() => [...macro, ...markets], [macro, markets]);
    const dataDate = [unemp, industrial, retail, cpi].map((s) => (s.length ? s[s.length - 1].date : '')).filter(Boolean).sort().pop() ?? '';
    const csvRows = useMemo(() => [...macro, ...markets].map((k) => [k.label, `${k.value}${k.unit ? ' ' + k.unit : ''}`]), [macro, markets]);

    return { cpi, retail, cpiLoading: cpiQ.isLoading, retailLoading: retailQ.isLoading, macro, markets, watchlistItems, dataDate, csvRows };
}

export type OverviewData = ReturnType<typeof useOverviewData>;
