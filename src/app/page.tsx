'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Percent, Users, BarChart3, Factory, Euro, DollarSign, ShoppingCart, LineChart, Landmark, Gem } from 'lucide-react';
import {
    useCpiFull, useUnemploymentMonthly, useGDPQuarterly,
    useNBPInterestRates, useNBPTable, useEURPLN, useUSDPLN,
    useIndustrialProduction, useRetailSales, usePPI, useBondYield10Y, useGold, useStooq,
    type EurostatResult, type NBPTable,
} from '@/lib/hooks';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import { trendObservation, type Observation } from '@/lib/observations';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { ObservationsPanel } from '@/components/ui/ObservationsPanel';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { LatestNews } from '@/components/ui/RelatedNews';

// ── data helpers ────────────────────────────────────────────
type Point = { date: string; value: number };
function plSeries(res?: EurostatResult): Point[] {
    const arr = res?.data?.PL ?? [];
    return arr.filter((d) => d.value != null).map((d) => ({ date: d.date, value: d.value as number }));
}
const lastOf = (s: Point[]) => (s.length ? s[s.length - 1].value : null);
const prevOf = (s: Point[]) => (s.length > 1 ? s[s.length - 2].value : null);
const fmt1 = (n: number | null | undefined) => (n == null ? '—' : formatDecimalPL(n, 1));
const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const ppDelta = (s: Point[]) => (lastOf(s) != null && prevOf(s) != null ? +(lastOf(s)! - prevOf(s)!).toFixed(1) : null);

// NBP currency 90d history → % zmiana vs poprzedni odczyt (kształt: tablica lub {rates:[]})
function fxDelta(data: unknown): number | null {
    const raw = data as { rates?: { mid?: number }[] } | { mid?: number }[] | undefined;
    const arr = Array.isArray(raw) ? raw : raw?.rates;
    if (!arr || arr.length < 2) return null;
    const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
    return a && b ? +percentChange(a, b).toFixed(2) : null;
}

type Metric = 'cpi' | 'ppi' | 'unemployment' | 'industrial' | 'retail' | 'gdp';

export default function OverviewPage() {
    // ── makro ──
    const cpiQ = useCpiFull();
    const ppiQ = usePPI();
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
    const ppi = useMemo(() => plSeries(ppiQ.data), [ppiQ.data]);
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
        { label: 'Inflacja CPI (r/r)', value: fmt1(lastOf(cpi)), unit: '%', accent: 'amber' as AccentKey, icon: TrendingUp, delta: ppDelta(cpi) != null ? { value: ppDelta(cpi)!, unit: 'pp' as const, invert: true } : undefined, footnote: 'GUS · cel NBP 2,5%', loading: cpiQ.isLoading },
        { label: 'PKB (r/r)', value: fmt1(lastOf(gdp)), unit: '%', accent: 'green' as AccentKey, icon: BarChart3, delta: ppDelta(gdp) != null ? { value: ppDelta(gdp)!, unit: 'pp' as const } : undefined, footnote: gdp.length ? `Eurostat · ${gdp[gdp.length - 1].date}` : 'Eurostat', loading: gdpQ.isLoading },
        { label: 'Stopa bezrobocia', value: fmt1(lastOf(unemp)), unit: '%', accent: 'blue' as AccentKey, icon: Users, delta: ppDelta(unemp) != null ? { value: ppDelta(unemp)!, unit: 'pp' as const, invert: true } : undefined, footnote: 'Eurostat LFS', loading: unempQ.isLoading },
        { label: 'Stopa referencyjna NBP', value: refRate ? formatDecimalPL(refRate.value, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Percent, footnote: refRate ? `NBP · od ${formatDate(refRate.validFrom)}` : 'NBP', loading: ratesQ.isLoading },
        { label: 'Produkcja przemysłowa (r/r)', value: fmt1(lastOf(industrial)), unit: '%', accent: 'rose' as AccentKey, icon: Factory, delta: ppDelta(industrial) != null ? { value: ppDelta(industrial)!, unit: 'pp' as const } : undefined, footnote: industrial.length ? `Eurostat · ${industrial[industrial.length - 1].date}` : 'Eurostat', loading: indQ.isLoading },
        { label: 'Sprzedaż detaliczna (r/r)', value: fmt1(lastOf(retail)), unit: '%', accent: 'cyan' as AccentKey, icon: ShoppingCart, delta: ppDelta(retail) != null ? { value: ppDelta(retail)!, unit: 'pp' as const } : undefined, footnote: retail.length ? `Eurostat · ${retail[retail.length - 1].date}` : 'Eurostat', loading: retailQ.isLoading },
    ];

    // ── KPI rynki ──
    const markets = [
        { label: 'WIG20', value: wigLast != null ? formatNumber(wigLast, 0) : '—', unit: 'pkt', accent: 'blue' as AccentKey, icon: LineChart, delta: wigDelta != null ? { value: wigDelta, unit: 'pct' as const } : undefined, footnote: 'GPW · Stooq/Yahoo', loading: wig20Q.isLoading },
        { label: 'EUR / PLN', value: mid('EUR') != null ? formatDecimalPL(mid('EUR')!, 3) : '—', unit: 'zł', accent: 'cyan' as AccentKey, icon: Euro, delta: fxDelta(eurHQ.data) != null ? { value: fxDelta(eurHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { label: 'USD / PLN', value: mid('USD') != null ? formatDecimalPL(mid('USD')!, 3) : '—', unit: 'zł', accent: 'green' as AccentKey, icon: DollarSign, delta: fxDelta(usdHQ.data) != null ? { value: fxDelta(usdHQ.data)!, unit: 'pct' as const, invert: true } : undefined, footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP', loading: fxQ.isLoading },
        { label: 'Rentowność 10Y', value: lastOf(yield10) != null ? formatDecimalPL(lastOf(yield10)!, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Landmark, delta: lastOf(yield10) != null && prevOf(yield10) != null ? { value: +(lastOf(yield10)! - prevOf(yield10)!).toFixed(2), unit: 'pp' as const, invert: true } : undefined, footnote: yield10.length ? `Eurostat · ${yield10[yield10.length - 1].date}` : 'Eurostat', loading: yieldQ.isLoading },
        { label: 'Złoto (NBP)', value: goldLast != null ? formatDecimalPL(goldLast, 2) : '—', unit: 'zł/g', accent: 'amber' as AccentKey, icon: Gem, delta: goldDelta != null ? { value: goldDelta, unit: 'pct' as const } : undefined, footnote: 'NBP · cena złota', loading: goldQ.isLoading },
    ];

    // ── hero (przełączalny) ──
    const [metric, setMetric] = useState<Metric>('cpi');
    const META: Record<Metric, { label: string; color: string; type: 'area' | 'line' | 'bar'; source: string; series: Point[] }> = {
        cpi: { label: 'Inflacja CPI (r/r)', color: '#2563EB', type: 'area', source: 'GUS (krajowy CPI)', series: cpi },
        ppi: { label: 'Ceny producenta PPI (r/r)', color: '#E11D48', type: 'line', source: 'Eurostat', series: ppi },
        unemployment: { label: 'Stopa bezrobocia', color: '#0891B2', type: 'line', source: 'Eurostat LFS', series: unemp },
        industrial: { label: 'Produkcja przemysłowa (r/r)', color: '#7C3AED', type: 'line', source: 'Eurostat', series: industrial },
        retail: { label: 'Sprzedaż detaliczna (r/r)', color: '#D97706', type: 'area', source: 'Eurostat', series: retail },
        gdp: { label: 'PKB (r/r)', color: '#16A34A', type: 'bar', source: 'Eurostat', series: gdp },
    };
    const meta = META[metric];
    const chartData = useMemo(() => meta.series.map((d) => ({ date: d.date, value: d.value })), [meta.series]);

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
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Przegląd</h1>
                    <p className="mt-1 text-sm text-mk-muted">Kluczowe wskaźniki makroekonomiczne dla Polski{dataDate ? ` · najświeższe dane: ${dataDate}` : ''}</p>
                </div>
                <CsvExport filename="przeglad-makro" headers={['Wskaźnik', 'Wartość']} rows={csvRows} />
            </div>

            {/* Makro */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {macro.map((k) => <KpiCard key={k.label} {...k} />)}
            </div>

            {/* Rynki finansowe */}
            <div>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">Rynki finansowe</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {markets.map((k) => <KpiCard key={k.label} {...k} />)}
                </div>
            </div>

            {/* Hero + panele */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SectionCard className="lg:col-span-2" title={meta.label + ' — trend'} subtitle={`Źródło: ${meta.source}`}
                    actions={<Segmented<Metric> aria-label="Wskaźnik" value={metric} onChange={setMetric} options={[
                        { value: 'cpi', label: 'Inflacja' }, { value: 'ppi', label: 'PPI' }, { value: 'gdp', label: 'PKB' },
                        { value: 'unemployment', label: 'Bezrobocie' }, { value: 'industrial', label: 'Produkcja' }, { value: 'retail', label: 'Sprzedaż' },
                    ]} />}>
                    {meta.series.length === 0 ? <div className="mk-skeleton h-[300px] w-full" /> : (
                        <InteractiveChart data={chartData} xKey="date" series={[{ key: 'value', name: meta.label, color: meta.color, type: meta.type }]}
                            height={300} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} showRange initialRange="1R"
                            referenceLines={metric === 'cpi' ? [{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }] : metric === 'gdp' || metric === 'ppi' ? [{ y: 0, color: '#CBD2DD' }] : undefined} />
                    )}
                </SectionCard>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <ObservationsPanel items={observations} />
                    <PublicationDatesPanel count={5} />
                </div>
            </div>

            <LatestNews limit={6} />
        </div>
    );
}
