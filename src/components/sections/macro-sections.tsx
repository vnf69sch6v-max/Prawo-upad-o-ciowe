'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Factory, ShoppingCart, HardHat, Users, Wallet, Percent, Landmark } from 'lucide-react';
import {
    useInflationMonthly, useHICPFoodYoY, useHICPCoreYoY,
    useGDPQuarterly, useIndustrialProduction, useRetailSales, useConstruction,
    useGusRegional, useGusMonthly, useNBPInterestRates, useWibor, useYieldCurve,
} from '@/lib/hooks';
import { plSeries, lastOf, deltaOf, monthTick, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StaleBadge } from '@/components/ui/StaleBadge';
import PolandMap from '@/components/PolandMap';

const byDate = (pts: Point[]) => new Map(pts.map((p) => [p.date, p.value]));

function Kpi({ label, series, unit = '%', accent, icon, invert, footnote }: {
    label: string; series: Point[]; unit?: string; accent: AccentKey; icon: typeof TrendingUp; invert?: boolean; footnote?: string;
}) {
    const last = lastOf(series);
    const d = deltaOf(series);
    return (
        <KpiCard label={label} value={fmtPL(last)} unit={unit} accent={accent} icon={icon}
            delta={d != null ? { value: d, unit: 'pp', invert } : undefined}
            footnote={footnote ?? (series.length ? series[series.length - 1].date : '—')} loading={series.length === 0} />
    );
}

// ═══ INFLACJA ═══
export function InflacjaSection() {
    const cpiQ = useInflationMonthly();
    const foodQ = useHICPFoodYoY();
    const coreQ = useHICPCoreYoY();
    const cpi = useMemo(() => plSeries(cpiQ.data), [cpiQ.data]);
    const food = useMemo(() => plSeries(foodQ.data), [foodQ.data]);
    const core = useMemo(() => plSeries(coreQ.data), [coreQ.data]);

    const chart = useMemo(() => {
        const fm = byDate(food), cm = byDate(core);
        return cpi.map((p) => ({ date: p.date, cpi: p.value, food: fm.get(p.date) ?? null, core: cm.get(p.date) ?? null }));
    }, [cpi, food, core]);
    const dataDate = cpi.length ? cpi[cpi.length - 1].date : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Kpi label="CPI ogółem (r/r)" series={cpi} accent="amber" icon={TrendingUp} invert footnote="Eurostat HICP" />
                <Kpi label="CPI żywność (r/r)" series={food} accent="green" icon={ShoppingCart} invert />
                <Kpi label="CPI bazowa (r/r)" series={core} accent="violet" icon={Percent} invert />
            </div>

            <SectionCard
                title="Inflacja CPI — ogółem, żywność, bazowa"
                subtitle="Źródło: Eurostat HICP (r/r, %)"
                actions={<div className="flex items-center gap-2"><StaleBadge date={dataDate} label="HICP do" /><CsvExport filename="inflacja-cpi" headers={['Data', 'CPI', 'Żywność', 'Bazowa']} rows={chart.map((r) => [r.date, r.cpi, r.food, r.core])} /></div>}
            >
                {chart.length === 0 ? <div className="mk-skeleton h-[320px] w-full" /> : (
                    <InteractiveChart
                        data={chart} xKey="date" height={320} unit="%" legend showRange initialRange="1R"
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        referenceLines={[{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }]}
                        series={[
                            { key: 'cpi', name: 'CPI ogółem', color: '#2563EB', type: 'line', strokeWidth: 3 },
                            { key: 'food', name: 'Żywność', color: '#16A34A', type: 'line' },
                            { key: 'core', name: 'Bazowa', color: '#7C3AED', type: 'line', dashed: true },
                        ]}
                    />
                )}
                <p className="mt-3 text-xs text-mk-faint">
                    Uwaga: Eurostat HICP dla Polski bywa opóźniony. Terminowy krajowy CPI z GUS (SDP) zostanie dołączony w kolejnym etapie.
                </p>
            </SectionCard>
        </div>
    );
}

// ═══ AKTYWNOŚĆ ═══
export function AktywnoscSection() {
    const gdpQ = useGDPQuarterly();
    const indQ = useIndustrialProduction();
    const retQ = useRetailSales();
    const conQ = useConstruction();
    const gdpS = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);
    const con = useMemo(() => plSeries(conQ.data), [conQ.data]);

    const activity = useMemo(() => {
        const rm = byDate(ret);
        return ind.map((p) => ({ date: p.date, ind: p.value, ret: rm.get(p.date) ?? null }));
    }, [ind, ret]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi label="PKB (r/r)" series={gdpS} accent="green" icon={TrendingUp} />
                <Kpi label="Produkcja przemysłowa (r/r)" series={ind} accent="violet" icon={Factory} />
                <Kpi label="Sprzedaż detaliczna (r/r)" series={ret} accent="amber" icon={ShoppingCart} />
                <Kpi label="Budownictwo (r/r)" series={con} accent="cyan" icon={HardHat} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="PKB — dynamika r/r" subtitle="Eurostat · kwartalnie"
                    actions={<CsvExport filename="pkb" headers={['Kwartał', 'PKB r/r']} rows={gdpS.map((p) => [p.date, p.value])} />}>
                    {gdpS.length === 0 ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={gdpS.map((p) => ({ date: p.date, value: +p.value.toFixed(1) }))} xKey="date"
                            series={[{ key: 'value', name: 'PKB r/r', color: '#16A34A', type: 'bar' }]} height={260} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 1)} referenceLines={[{ y: 0, color: '#CBD2DD' }]} />
                    )}
                </SectionCard>
                <SectionCard title="Produkcja vs sprzedaż detaliczna" subtitle="Eurostat · miesięcznie (r/r)"
                    actions={<CsvExport filename="produkcja-sprzedaz" headers={['Data', 'Produkcja', 'Sprzedaż']} rows={activity.map((r) => [r.date, r.ind, r.ret])} />}>
                    {activity.length === 0 ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={activity} xKey="date" height={260} unit="%" legend showRange initialRange="1R"
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                            series={[
                                { key: 'ind', name: 'Produkcja', color: '#7C3AED', type: 'line' },
                                { key: 'ret', name: 'Sprzedaż', color: '#D97706', type: 'line' },
                            ]} />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

// ═══ RYNEK PRACY ═══
export function RynekPracySection() {
    const regQ = useGusRegional();
    const monthlyQ = useGusMonthly();
    const [selected, setSelected] = useState<string | null>(null);

    const regions = regQ.data?.regions ?? [];
    const national = regQ.data?.national ?? { avgUnemployment: null, avgWages: null };
    const wages = monthlyQ.data?.wages ?? [];
    const lastWage = wages.length ? wages[wages.length - 1] : null;

    const selectedRegion = regions.find((r) => r.slug === selected) ?? null;

    const cols: Column<typeof regions[number]>[] = [
        { key: 'name', header: 'Województwo', sortable: true, sortValue: (r) => r.name, render: (r) => r.name },
        { key: 'unemp', header: 'Bezrobocie', align: 'right', sortable: true, sortValue: (r) => r.unemployment ?? 0, render: (r) => r.unemployment != null ? `${formatDecimalPL(r.unemployment, 1)}%` : '—' },
        { key: 'wages', header: 'Płace (PLN)', align: 'right', sortable: true, sortValue: (r) => r.wages ?? 0, render: (r) => r.wages != null ? formatNumber(r.wages, 0) : '—' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Bezrobocie rejestrowane" value={fmtPL(national.avgUnemployment)} unit="%" accent="blue" icon={Users}
                    footnote="GUS · średnia woj." loading={regQ.isLoading} />
                <KpiCard label="Przeciętne wynagrodzenie" value={lastWage ? formatNumber(lastWage.raw, 0) : '—'} unit="zł" accent="green" icon={Wallet}
                    delta={lastWage ? { value: lastWage.value, unit: 'pct' } : undefined} footnote={lastWage ? `GUS · ${lastWage.date}` : 'GUS'} loading={monthlyQ.isLoading} />
                <KpiCard label="Płaca vs bezrobocie" value={regions.length ? String(regions.length) : '—'} unit="woj." accent="slate" icon={Landmark}
                    footnote="klik w mapę = szczegóły" loading={regQ.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SectionCard className="lg:col-span-2" title="Bezrobocie rejestrowane — mapa województw" subtitle="GUS · kliknij region"
                    actions={<CsvExport filename="bezrobocie-regiony" headers={['Województwo', 'Bezrobocie %', 'Płace PLN']} rows={regions.map((r) => [r.name, r.unemployment, r.wages])} />}>
                    {regQ.isLoading ? <div className="mk-skeleton h-[360px] w-full" /> : (
                        <PolandMap regions={regions} national={national} selectedRegion={selected} onRegionSelect={setSelected} />
                    )}
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard title={selectedRegion ? selectedRegion.name : 'Wybierz województwo'} padded>
                        {selectedRegion ? (
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between"><dt className="text-mk-muted">Bezrobocie</dt><dd className="font-semibold tnum">{selectedRegion.unemployment != null ? `${formatDecimalPL(selectedRegion.unemployment, 1)}%` : '—'}</dd></div>
                                <div className="flex justify-between"><dt className="text-mk-muted">Płace</dt><dd className="font-semibold tnum">{selectedRegion.wages != null ? `${formatNumber(selectedRegion.wages, 0)} zł` : '—'}</dd></div>
                                <div className="flex justify-between"><dt className="text-mk-muted">Płace r/r</dt><dd className="font-semibold tnum">{selectedRegion.wagesYoY != null ? `${formatDecimalPL(selectedRegion.wagesYoY, 1)}%` : '—'}</dd></div>
                            </dl>
                        ) : <p className="text-sm text-mk-faint">Kliknij region na mapie, aby zobaczyć szczegóły.</p>}
                    </SectionCard>
                    <SectionCard title="Ranking" padded>
                        <div className="max-h-[240px] overflow-auto">
                            <DataTable columns={cols} rows={regions} initialSort="unemp" initialDir="desc" rowKey={(r) => r.slug} />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}

// ═══ STOPY ═══
export function StopySection() {
    const ratesQ = useNBPInterestRates();
    const wiborQ = useWibor();
    const yc = useYieldCurve();

    const findRate = (re: RegExp) => ratesQ.data?.rates?.find((r) => re.test(r.name) || re.test(r.nameEn))?.value ?? null;
    const ref = findRate(/referen/i), lom = findRate(/lombard/i), dep = findRate(/depozyt/i);
    const wibor = wiborQ.data?.rates ?? [];
    const curve = yc.curve.filter((c) => c.yield != null);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Stopa referencyjna NBP" value={fmtPL(ref, 2)} unit="%" accent="violet" icon={Percent} footnote="NBP · RPP" loading={ratesQ.isLoading} />
                <KpiCard label="Stopa lombardowa" value={fmtPL(lom, 2)} unit="%" accent="rose" icon={Percent} footnote="NBP" loading={ratesQ.isLoading} />
                <KpiCard label="Stopa depozytowa" value={fmtPL(dep, 2)} unit="%" accent="cyan" icon={Percent} footnote="NBP" loading={ratesQ.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="WIBOR — terminy" subtitle="Szacowane z ref. NBP + spread"
                    actions={<CsvExport filename="wibor" headers={['Termin', 'WIBOR', 'WIBID']} rows={wibor.map((w) => [w.tenor, w.wibor, w.wibid])} />}>
                    {wibor.length === 0 ? <div className="mk-skeleton h-[220px] w-full" /> : (
                        <InteractiveChart data={wibor.map((w) => ({ tenor: w.tenor, wibor: w.wibor }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'wibor', name: 'WIBOR', color: '#2563EB', type: 'bar' }]} />
                    )}
                </SectionCard>
                <SectionCard title="Krzywa rentowności obligacji" subtitle="Stooq · 2Y / 5Y / 10Y">
                    {curve.length === 0 ? (
                        <div className="flex h-[220px] flex-col items-center justify-center text-center text-sm text-mk-faint">
                            <p>Brak danych — źródło Stooq jest chwilowo niedostępne.</p>
                            <p className="mt-1 text-xs">Alternatywne źródło obligacji planowane w module Rynki.</p>
                        </div>
                    ) : (
                        <InteractiveChart data={curve.map((c) => ({ tenor: c.tenor, yield: c.yield }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'yield', name: 'Rentowność', color: '#0891B2', type: 'line', strokeWidth: 3 }]} />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
