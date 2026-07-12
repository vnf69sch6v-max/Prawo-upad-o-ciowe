'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Percent, Users, BarChart3, Factory, Euro } from 'lucide-react';
import {
    useCpiFull, useUnemploymentMonthly, useGDPQuarterly,
    useNBPInterestRates, useNBPTable, useNBPCurrencyHistory,
    useIndustrialProduction, useRetailSales,
    type EurostatResult, type NBPTable,
} from '@/lib/hooks';
import { formatDecimalPL, formatDate, percentChange } from '@/lib/formatters';
import { trendObservation, type Observation } from '@/lib/observations';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { ObservationsPanel } from '@/components/ui/ObservationsPanel';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';

// ── data helpers ────────────────────────────────────────────
type Point = { date: string; value: number };

function plSeries(res?: EurostatResult): Point[] {
    const arr = res?.data?.PL ?? [];
    return arr.filter((d) => d.value != null).map((d) => ({ date: d.date, value: d.value as number }));
}
const lastOf = (s: Point[]) => (s.length ? s[s.length - 1].value : null);
const prevOf = (s: Point[]) => (s.length > 1 ? s[s.length - 2].value : null);
const fmt1 = (n: number | null | undefined) => (n == null ? '—' : formatDecimalPL(n, 1));
const monthTick = (d: string) => {
    const [y, m] = d.split('-');
    return m ? `${m}.${y.slice(2)}` : d;
};

type Metric = 'cpi' | 'unemployment' | 'industrial';
const METRIC_META: Record<Metric, { label: string; color: string; type: 'area' | 'line' | 'bar'; source: string }> = {
    cpi: { label: 'Inflacja CPI (r/r)', color: '#2563EB', type: 'area', source: 'GUS (krajowy CPI)' },
    unemployment: { label: 'Stopa bezrobocia', color: '#0891B2', type: 'line', source: 'Eurostat LFS' },
    industrial: { label: 'Produkcja przemysłowa (r/r)', color: '#7C3AED', type: 'line', source: 'Eurostat' },
};

export default function OverviewPage() {
    // ── live data ──
    const cpiQ = useCpiFull();
    const unempQ = useUnemploymentMonthly();
    const gdpQ = useGDPQuarterly();
    const ratesQ = useNBPInterestRates();
    const fxQ = useNBPTable('a');
    const eurHistQ = useNBPCurrencyHistory('eur', 5);
    const indQ = useIndustrialProduction();
    const retailQ = useRetailSales();

    const cpi = useMemo(() => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })), [cpiQ.data]);
    const unemp = useMemo(() => plSeries(unempQ.data), [unempQ.data]);
    const gdp = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const industrial = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const retail = useMemo(() => plSeries(retailQ.data), [retailQ.data]);

    // reference rate
    const refRate = useMemo(() => {
        const r = ratesQ.data?.rates?.find((x) => /referen/i.test(x.name) || /referen/i.test(x.nameEn));
        return r ?? null;
    }, [ratesQ.data]);

    // EUR/PLN — /api/nbp returns an array [{ rates, effectiveDate }]
    const fxTable = useMemo(() => {
        const raw = fxQ.data as NBPTable | NBPTable[] | undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [fxQ.data]);
    const eurMid = useMemo(() => fxTable?.rates?.find((r) => r.code === 'EUR')?.mid ?? null, [fxTable]);
    const eurDelta = useMemo(() => {
        const raw = eurHistQ.data as { rates?: { mid?: number }[] } | { mid?: number }[] | undefined;
        const arr = Array.isArray(raw) ? raw : raw?.rates;
        if (!arr || arr.length < 2) return null;
        const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
        return a && b ? percentChange(a, b) : null;
    }, [eurHistQ.data]);

    // ── KPI model ──
    const kpis = [
        {
            label: 'Inflacja CPI (r/r)', value: fmt1(lastOf(cpi)), unit: '%', accent: 'amber' as AccentKey, icon: TrendingUp,
            delta: lastOf(cpi) != null && prevOf(cpi) != null ? { value: +(lastOf(cpi)! - prevOf(cpi)!).toFixed(1), unit: 'pp' as const, invert: true } : undefined,
            footnote: 'Cel NBP: 2,5%', loading: cpiQ.isLoading, csv: ['Inflacja CPI r/r', fmt1(lastOf(cpi)) + '%'],
        },
        {
            label: 'PKB (r/r)', value: fmt1(lastOf(gdp)), unit: '%', accent: 'green' as AccentKey, icon: BarChart3,
            delta: lastOf(gdp) != null && prevOf(gdp) != null ? { value: +(lastOf(gdp)! - prevOf(gdp)!).toFixed(1), unit: 'pp' as const } : undefined,
            footnote: gdp.length ? gdp[gdp.length - 1].date : '—', loading: gdpQ.isLoading, csv: ['PKB r/r', fmt1(lastOf(gdp)) + '%'],
        },
        {
            label: 'Stopa bezrobocia', value: fmt1(lastOf(unemp)), unit: '%', accent: 'blue' as AccentKey, icon: Users,
            delta: lastOf(unemp) != null && prevOf(unemp) != null ? { value: +(lastOf(unemp)! - prevOf(unemp)!).toFixed(1), unit: 'pp' as const, invert: true } : undefined,
            footnote: 'Eurostat (LFS)', loading: unempQ.isLoading, csv: ['Stopa bezrobocia', fmt1(lastOf(unemp)) + '%'],
        },
        {
            label: 'Stopa referencyjna NBP', value: refRate ? formatDecimalPL(refRate.value, 2) : '—', unit: '%', accent: 'violet' as AccentKey, icon: Percent,
            footnote: refRate ? `od ${formatDate(refRate.validFrom)}` : '—', loading: ratesQ.isLoading, csv: ['Stopa referencyjna NBP', (refRate ? formatDecimalPL(refRate.value, 2) : '—') + '%'],
        },
        {
            label: 'Produkcja przemysłowa (r/r)', value: fmt1(lastOf(industrial)), unit: '%', accent: 'rose' as AccentKey, icon: Factory,
            delta: lastOf(industrial) != null && prevOf(industrial) != null ? { value: +(lastOf(industrial)! - prevOf(industrial)!).toFixed(1), unit: 'pp' as const } : undefined,
            footnote: industrial.length ? industrial[industrial.length - 1].date : 'Eurostat', loading: indQ.isLoading, csv: ['Produkcja przemysłowa r/r', fmt1(lastOf(industrial)) + '%'],
        },
        {
            label: 'EUR / PLN', value: eurMid != null ? formatDecimalPL(eurMid, 3) : '—', unit: 'zł', accent: 'cyan' as AccentKey, icon: Euro,
            delta: eurDelta != null ? { value: +eurDelta.toFixed(2), unit: 'pct' as const, invert: true } : undefined,
            footnote: fxTable?.effectiveDate ? `NBP ${formatDate(fxTable.effectiveDate)}` : 'NBP tab. A', loading: fxQ.isLoading, csv: ['EUR/PLN', eurMid != null ? formatDecimalPL(eurMid, 3) : '—'],
        },
    ];

    // ── switchable hero chart ──
    const [metric, setMetric] = useState<Metric>('cpi');
    const metricSeries = metric === 'cpi' ? cpi : metric === 'unemployment' ? unemp : industrial;
    const meta = METRIC_META[metric];
    const chartData = useMemo(() => metricSeries.map((d) => ({ date: d.date, value: d.value })), [metricSeries]);

    // ── observations ──
    const observations = useMemo<Observation[]>(() => {
        const out: Observation[] = [];
        const cpiObs = trendObservation('Inflacja CPI', cpi.map((d) => d.value), true);
        if (cpiObs) out.push(cpiObs);
        const unObs = trendObservation('Bezrobocie', unemp.map((d) => d.value), true);
        if (unObs) out.push(unObs);
        const indObs = trendObservation('Produkcja przemysłowa', industrial.map((d) => d.value), false);
        if (indObs) out.push(indObs);
        const lc = lastOf(cpi);
        if (lc != null) out.push({ text: `Inflacja CPI ${fmt1(lc)}% wobec celu NBP 2,5% (${lc > 2.5 ? 'powyżej' : 'poniżej'} celu)`, tone: lc > 3.5 ? 'warn' : 'neutral' });
        if (refRate) out.push({ text: `Stopa referencyjna NBP na poziomie ${formatDecimalPL(refRate.value, 2)}%`, tone: 'neutral' });
        return out.slice(0, 6);
    }, [cpi, unemp, industrial, refRate]);

    // Freshest available monthly date across sources (CPI/HICP lags; others reach the current month)
    const dataDate = [unemp, industrial, retail, cpi]
        .map((s) => (s.length ? s[s.length - 1].date : ''))
        .filter(Boolean)
        .sort()
        .pop() ?? '';

    return (
        <div className="mk-fade-in space-y-6">
            {/* Page header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Przegląd</h1>
                    <p className="mt-1 text-sm text-mk-muted">
                        Kluczowe wskaźniki makroekonomiczne dla Polski{dataDate ? ` · dane na: ${dataDate}` : ''}
                    </p>
                </div>
                <CsvExport
                    filename="przeglad-makro"
                    headers={['Wskaźnik', 'Wartość']}
                    rows={kpis.map((k) => k.csv)}
                />
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {kpis.map((k) => (
                    <KpiCard key={k.label} label={k.label} value={k.value} unit={k.unit} accent={k.accent} icon={k.icon} delta={k.delta} footnote={k.footnote} loading={k.loading} />
                ))}
            </div>

            {/* Hero chart + side panels */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SectionCard
                    className="lg:col-span-2"
                    title={meta.label + ' — trend'}
                    subtitle={`Źródło: ${meta.source}`}
                    actions={
                        <Segmented<Metric>
                            aria-label="Wskaźnik"
                            value={metric}
                            onChange={setMetric}
                            options={[
                                { value: 'cpi', label: 'Inflacja' },
                                { value: 'unemployment', label: 'Bezrobocie' },
                                { value: 'industrial', label: 'Produkcja' },
                            ]}
                        />
                    }
                >
                    {metricSeries.length === 0 ? (
                        <div className="mk-skeleton h-[300px] w-full" />
                    ) : (
                        <InteractiveChart
                            data={chartData}
                            xKey="date"
                            series={[{ key: 'value', name: meta.label, color: meta.color, type: meta.type }]}
                            height={300}
                            unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 1)}
                            xTickFormatter={monthTick}
                            showRange
                            initialRange="1R"
                            referenceLines={metric === 'cpi' ? [{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }] : undefined}
                        />
                    )}
                </SectionCard>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <ObservationsPanel items={observations} />
                    <PublicationDatesPanel count={5} />
                </div>
            </div>

            {/* Secondary charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Produkcja przemysłowa (r/r)" subtitle="Eurostat · ostatnie miesiące" padded>
                    {industrial.length === 0 ? <div className="mk-skeleton h-[220px] w-full" /> : (
                        <InteractiveChart
                            data={industrial.slice(-8).map((d) => ({ date: d.date, value: +d.value.toFixed(1) }))}
                            xKey="date" series={[{ key: 'value', name: 'Produkcja r/r', color: '#16A34A', type: 'bar' }]}
                            height={220} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                        />
                    )}
                </SectionCard>
                <SectionCard title="Sprzedaż detaliczna (r/r)" subtitle="Eurostat · ostatnie miesiące" padded>
                    {retail.length === 0 ? <div className="mk-skeleton h-[220px] w-full" /> : (
                        <InteractiveChart
                            data={retail.slice(-8).map((d) => ({ date: d.date, value: +d.value.toFixed(1) }))}
                            xKey="date" series={[{ key: 'value', name: 'Sprzedaż r/r', color: '#D97706', type: 'area' }]}
                            height={220} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
