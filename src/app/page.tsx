'use client';

import { useMemo } from 'react';
import { TrendingUp, Percent, Users, BarChart3, Factory, Euro, DollarSign, ShoppingCart, LineChart, Landmark, Gem } from 'lucide-react';
import {
    useCpiFull, useUnemploymentMonthly, useGDPQuarterly,
    useNBPInterestRates, useNBPTable, useEURPLN, useUSDPLN,
    useIndustrialProduction, useRetailSales, useBondYield10Y, useGold, useStooq,
    type EurostatResult, type NBPTable,
} from '@/lib/hooks';
import { formatDecimalPL, formatNumber, formatDate, percentChange, formatDataPeriodLabel } from '@/lib/formatters';
import { trendObservation, type Observation } from '@/lib/observations';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { ObservationsPanel } from '@/components/ui/ObservationsPanel';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { LatestNews } from '@/components/ui/RelatedNews';
import { OverviewHero } from '@/components/ui/OverviewHero';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { WatchlistStrip, type WatchableKpi } from '@/components/ui/WatchlistStrip';

// ── data helpers ────────────────────────────────────────────
type Point = { date: string; value: number };
function plSeries(res?: EurostatResult): Point[] {
    const arr = res?.data?.PL ?? [];
    return arr.filter((d) => d.value != null).map((d) => ({ date: d.date, value: d.value as number }));
}
const lastOf = (s: Point[]) => (s.length ? s[s.length - 1].value : null);
const prevOf = (s: Point[]) => (s.length > 1 ? s[s.length - 2].value : null);
const fmt1 = (n: number | null | undefined) => (n == null ? '—' : formatDecimalPL(n, 1));
const ppDelta = (s: Point[]) => (lastOf(s) != null && prevOf(s) != null ? +(lastOf(s)! - prevOf(s)!).toFixed(1) : null);

function fxDelta(data: unknown): number | null {
    const raw = data as { rates?: { mid?: number }[] } | { mid?: number }[] | undefined;
    const arr = Array.isArray(raw) ? raw : raw?.rates;
    if (!arr || arr.length < 2) return null;
    const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
    return a && b ? +percentChange(a, b).toFixed(2) : null;
}


export default function OverviewPage() {
    // ── makro ──
    const cpiQ = useCpiFull();
    const unempQ = useUnemploymentMonthly();
    const gdpQ = useGDPQuarterly();
    const ratesQ = useNBPInterestRates();
    const indQ = useIndustrialProduction();
    const retailQ = useRetailSales();
    // ── rynki ──
    const fxQ = useNBPTable('a');
    const eurHQ = useEURPLN();
    const usdHQ = useUSDPLN();
    const yieldQ = useBondYield10Y();
    const goldQ = useGold(30);
    const wig20Q = useStooq('wig20', 30);

    const cpi = useMemo(() => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })), [cpiQ.data]);
    const unemp = useMemo(() => plSeries(unempQ.data), [unempQ.data]);
    const gdp = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const industrial = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const retail = useMemo(() => plSeries(retailQ.data), [retailQ.data]);
    const yield10 = useMemo(() => plSeries(yieldQ.data), [yieldQ.data]);
    const gold = useMemo(() => (goldQ.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [goldQ.data]);

    const refRate = useMemo(() => ratesQ.data?.rates?.find((x) => /referen/i.test(x.name) || /referen/i.test(x.nameEn)) ?? null, [ratesQ.data]);
    const fxTable = useMemo(() => { const raw = fxQ.data as NBPTable | NBPTable[] | undefined; return Array.isArray(raw) ? raw[0] : raw; }, [fxQ.data]);
    const mid = (code: string) => fxTable?.rates?.find((r) => r.code === code)?.mid ?? null;
    const wigLast = wig20Q.data?.latest?.close ?? null;
    const wigBars = useMemo(() => wig20Q.data?.data ?? [], [wig20Q.data]);
    const wigDelta = wigBars.length > 1 ? +percentChange(wigBars[wigBars.length - 1].close, wigBars[wigBars.length - 2].close).toFixed(2) : null;
    const goldLast = lastOf(gold), goldDelta = gold.length > 1 ? +percentChange(gold[gold.length - 1].value, gold[gold.length - 2].value).toFixed(2) : null;

    // ── KPI makro ──
    const macro = [
        { watchId: 'cpi', label: 'Inflacja CPI (r/r)', href: '/ceny?tab=inflacja', value: fmt1(lastOf(cpi)), unit: '%', accent: 'amber' as AccentKey, icon: TrendingUp, delta: ppDelta(cpi) != null ? { value: ppDelta(cpi)!, unit: 'pp' as const, invert: true } : undefined, footnote: 'GUS · cel NBP 2,5%', loading: cpiQ.isLoading },
        { watchId: 'gdp', label: 'PKB (r/r)', href: '/gospodarka?tab=aktywnosc', value: fmt1(lastOf(gdp)), unit: '%', accent: 'green' as AccentKey, icon: BarChart3, delta: ppDelta(gdp) != null ? { value: ppDelta(gdp)!, unit: 'pp' as const } : undefined, footnote: gdp.length ? `Eurostat · ${gdp[gdp.length - 1].date}` : 'Eurostat', loading: gdpQ.isLoading },
        { watchId: 'unemployment', label: 'Stopa bezrobocia', href: '/praca?tab=bezrobocie', value: fmt1(lastOf(unemp)), unit: '%', accent: 'blue' as AccentKey, icon: Users, delta: ppDelta(unemp) != null ? { value: ppDelta(unemp)!, unit: 'pp' as const, invert: true } : undefined, footnote: 'Eurostat LFS', loading: unempQ.isLoading },
        { watchId: 'ref-rate', label: 'Stopa referencyjna NBP', href: '/rynki?tab=stopy', value: refRate ? formatDecimalPL(refRate.value, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Percent, footnote: refRate ? `NBP · od ${formatDate(refRate.validFrom)}` : 'NBP', loading: ratesQ.isLoading },
        { watchId: 'industrial', label: 'Produkcja przemysłowa (r/r)', href: '/gospodarka?tab=aktywnosc', value: fmt1(lastOf(industrial)), unit: '%', accent: 'rose' as AccentKey, icon: Factory, delta: ppDelta(industrial) != null ? { value: ppDelta(industrial)!, unit: 'pp' as const } : undefined, footnote: industrial.length ? `Eurostat · ${industrial[industrial.length - 1].date}` : 'Eurostat', loading: indQ.isLoading },
        { watchId: 'retail', label: 'Sprzedaż detaliczna (r/r)', href: '/gospodarka?tab=aktywnosc', value: fmt1(lastOf(retail)), unit: '%', accent: 'cyan' as AccentKey, icon: ShoppingCart, delta: ppDelta(retail) != null ? { value: ppDelta(retail)!, unit: 'pp' as const } : undefined, footnote: retail.length ? `Eurostat · ${retail[retail.length - 1].date}` : 'Eurostat', loading: retailQ.isLoading },
    ];

    // ── KPI rynki ──
    const markets = [
        { watchId: 'wig20', label: 'WIG20', href: '/rynki?tab=gpw', value: wigLast != null ? formatNumber(wigLast, 0) : '—', unit: 'pkt', accent: 'blue' as AccentKey, icon: LineChart, delta: wigDelta != null ? { value: wigDelta, unit: 'pct' as const } : undefined, footnote: 'GPW · Stooq/Yahoo', loading: wig20Q.isLoading },
        { watchId: 'eur-pln', label: 'EUR / PLN', href: '/rynki?tab=kursy', value: mid('EUR') != null ? formatDecimalPL(mid('EUR')!, 3) : '—', unit: 'zł', accent: 'cyan' as AccentKey, icon: Euro, delta: fxDelta(eurHQ.data) != null ? { value: fxDelta(eurHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { watchId: 'usd-pln', label: 'USD / PLN', href: '/rynki?tab=kursy', value: mid('USD') != null ? formatDecimalPL(mid('USD')!, 3) : '—', unit: 'zł', accent: 'green' as AccentKey, icon: DollarSign, delta: fxDelta(usdHQ.data) != null ? { value: fxDelta(usdHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { watchId: 'yield-10y', label: 'Rentowność 10Y', href: '/gospodarka?tab=finanse', value: lastOf(yield10) != null ? formatDecimalPL(lastOf(yield10)!, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Landmark, delta: lastOf(yield10) != null && prevOf(yield10) != null ? { value: +(lastOf(yield10)! - prevOf(yield10)!).toFixed(2), unit: 'pp' as const, invert: true } : undefined, footnote: yield10.length ? `Eurostat · ${yield10[yield10.length - 1].date}` : 'Eurostat', loading: yieldQ.isLoading },
        { watchId: 'gold', label: 'Złoto (NBP)', href: '/rynki?tab=kursy', value: goldLast != null ? formatDecimalPL(goldLast, 2) : '—', unit: 'zł/g', accent: 'amber' as AccentKey, icon: Gem, delta: goldDelta != null ? { value: goldDelta, unit: 'pct' as const } : undefined, footnote: 'NBP · cena złota', loading: goldQ.isLoading },
    ];

    const watchlistItems: WatchableKpi[] = useMemo(() => [...macro, ...markets], [macro, markets]);

    // ── obserwacje ──
    const observations = useMemo<Observation[]>(() => {
        const out: Observation[] = [];
        const push = (o: Observation | null) => { if (o) out.push(o); };
        push(trendObservation('Inflacja CPI', cpi.map((d) => d.value), true));
        push(trendObservation('Bezrobocie', unemp.map((d) => d.value), true));
        push(trendObservation('Produkcja przemysłowa', industrial.map((d) => d.value), false));
        const lc = lastOf(cpi);
        if (lc != null) out.push({ text: `Inflacja CPI ${fmt1(lc)}% wobec celu NBP 2,5% (${lc > 2.5 ? 'powyżej' : 'poniżej'} celu)`, tone: lc > 3.5 ? 'warn' : 'neutral' });
        if (refRate) out.push({ text: `Stopa referencyjna NBP na poziomie ${formatDecimalPL(refRate.value, 2)}%`, tone: 'neutral' });
        return out.slice(0, 6);
    }, [cpi, unemp, industrial, refRate]);

    const dataDate = [unemp, industrial, retail, cpi].map((s) => (s.length ? s[s.length - 1].date : '')).filter(Boolean).sort().pop() ?? '';
    const csvRows = [...macro, ...markets].map((k) => [k.label, `${k.value}${k.unit ? ' ' + k.unit : ''}`]);

    return (
        <div className="mk-fade-in space-y-8">
            <PageHeader
                eyebrow={<PageEyebrow section="Dane makro" />}
                title="Przegląd"
                subtitle={
                    <>
                        Kluczowe wskaźniki makroekonomiczne dla Polski
                        {dataDate ? ` · ${formatDataPeriodLabel(dataDate)}` : ''}
                    </>
                }
                actions={<CsvExport filename="przeglad-makro" headers={['Wskaźnik', 'Wartość']} rows={csvRows} />}
            />

            {/* Czerwony pas hero — sygnały z danych */}
            <OverviewHero
                cpi={cpi}
                retail={retail}
                industrial={industrial}
                cpiLoading={cpiQ.isLoading}
                retailLoading={retailQ.isLoading && indQ.isLoading}
            />

            {/* Obserwowane (watchlista) — tylko gdy użytkownik ma zapisane wskaźniki */}
            <WatchlistStrip items={watchlistItems} />

            {/* Wskaźniki makro */}
            <section>
                <h2 className="mk-section-label mb-3">Wskaźniki makro</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {macro.map((k) => <KpiCard key={k.watchId} {...k} watchId={k.watchId} />)}
                </div>
            </section>

            {/* Rynki finansowe */}
            <section>
                <h2 className="mk-section-label mb-3">Rynki finansowe</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {markets.map((k) => <KpiCard key={k.watchId} {...k} watchId={k.watchId} />)}
                </div>
            </section>

            {/* Najważniejsze newsy — układ z sidebar */}
            <LatestNews limit={6} variant="overview" />

            {/* Obserwacje + kalendarz publikacji */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ObservationsPanel items={observations.slice(0, 4)} variant="overview" />
                <PublicationDatesPanel count={6} variant="overview" />
            </div>
        </div>
    );
}
