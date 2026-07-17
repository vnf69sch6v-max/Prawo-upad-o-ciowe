'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Factory, ShoppingCart, HardHat, Users, Wallet, Percent, Landmark } from 'lucide-react';
import {
    useInflationMonthly, useHICPFoodYoY, useHICPCoreYoY,
    useGDPQuarterly, useGDPQoQ, useIndustrialProduction, useRetailSales, useConstruction,
    useGDPConsumption, useGDPInvestment, useGDPExports, useGDPImports,
    useGusRegional, useGusMonthly, useNBPInterestRates, useWibor, useYieldCurve, useCpiFull,
} from '@/lib/hooks';
import { plSeries, lastOf, deltaOf, monthTick, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { Drawer } from '@/components/ui/Drawer';
import PolandMap from '@/components/PolandMap';
import { AXIS_INK } from '@/lib/chart-theme';

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
                        referenceLines={[{ y: 2.5, label: 'Cel NBP', color: AXIS_INK }]}
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
    const gdpQoQ = useGDPQoQ();
    const indQ = useIndustrialProduction();
    const retQ = useRetailSales();
    const conQ = useConstruction();
    const consQ = useGDPConsumption();
    const invQ = useGDPInvestment();
    const expQ = useGDPExports();
    const impQ = useGDPImports();

    const gdpS = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const gdpM = useMemo(() => plSeries(gdpQoQ.data), [gdpQoQ.data]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);
    const con = useMemo(() => plSeries(conQ.data), [conQ.data]);
    const cons = useMemo(() => plSeries(consQ.data), [consQ.data]);
    const inv = useMemo(() => plSeries(invQ.data), [invQ.data]);
    const exp = useMemo(() => plSeries(expQ.data), [expQ.data]);
    const imp = useMemo(() => plSeries(impQ.data), [impQ.data]);

    // PKB: r/r (słupki) + kw/kw (linia)
    const gdpChart = useMemo(() => {
        const mm = byDate(gdpM);
        return gdpS.map((p) => ({ date: p.date, yoy: +p.value.toFixed(1), qoq: mm.has(p.date) ? +mm.get(p.date)!.toFixed(1) : null }));
    }, [gdpS, gdpM]);

    // Produkcja / sprzedaż / budownictwo (miesięcznie)
    const activity = useMemo(() => {
        const rm = byDate(ret), cm = byDate(con);
        return ind.map((p) => ({ date: p.date, ind: p.value, ret: rm.get(p.date) ?? null, con: cm.get(p.date) ?? null }));
    }, [ind, ret, con]);

    // Składowe PKB (r/r)
    const comp = useMemo(() => {
        const cm = byDate(cons), im = byDate(inv), em = byDate(exp), mm = byDate(imp);
        const dates = Array.from(new Set([...cons, ...inv, ...exp, ...imp].map((p) => p.date))).sort();
        return dates.map((d) => ({ date: d, cons: cm.get(d) ?? null, inv: im.get(d) ?? null, exp: em.get(d) ?? null, imp: mm.get(d) ?? null }));
    }, [cons, inv, exp, imp]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi label="PKB (r/r)" series={gdpS} accent="green" icon={TrendingUp} footnote="Eurostat · kwartalnie" />
                <Kpi label="Produkcja przemysłowa (r/r)" series={ind} accent="violet" icon={Factory} />
                <Kpi label="Sprzedaż detaliczna (r/r)" series={ret} accent="amber" icon={ShoppingCart} />
                <Kpi label="Budownictwo (r/r)" series={con} accent="cyan" icon={HardHat} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="PKB — dynamika r/r i kw/kw" subtitle="Eurostat · kwartalnie (%)"
                    actions={<CsvExport filename="pkb" headers={['Kwartał', 'r/r', 'kw/kw']} rows={gdpChart.map((p) => [p.date, p.yoy, p.qoq])} />}>
                    {gdpChart.length === 0 ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={gdpChart} xKey="date" height={260} unit="%" legend
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                            series={[
                                { key: 'yoy', name: 'PKB r/r', color: '#16A34A', type: 'bar' },
                                { key: 'qoq', name: 'PKB kw/kw', color: '#2563EB', type: 'line', strokeWidth: 2.5 },
                            ]} />
                    )}
                </SectionCard>
                <SectionCard title="Produkcja, sprzedaż, budownictwo" subtitle="Eurostat · miesięcznie (r/r)"
                    actions={<CsvExport filename="aktywnosc" headers={['Data', 'Produkcja', 'Sprzedaż', 'Budownictwo']} rows={activity.map((r) => [r.date, r.ind, r.ret, r.con])} />}>
                    {activity.length === 0 ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={activity} xKey="date" height={260} unit="%" legend showRange initialRange="1R"
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                            series={[
                                { key: 'ind', name: 'Produkcja', color: '#7C3AED', type: 'line' },
                                { key: 'ret', name: 'Sprzedaż', color: '#D97706', type: 'line' },
                                { key: 'con', name: 'Budownictwo', color: '#0891B2', type: 'line' },
                            ]} />
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Składowe PKB — wydatkowe (r/r)" subtitle="Eurostat · kwartalnie · ceny stałe · co napędza wzrost"
                actions={<CsvExport filename="pkb-skladowe" headers={['Kwartał', 'Spożycie', 'Inwestycje', 'Eksport', 'Import']} rows={comp.map((r) => [r.date, r.cons, r.inv, r.exp, r.imp])} />}>
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Kpi label="Spożycie" series={cons} accent="green" icon={ShoppingCart} />
                    <Kpi label="Inwestycje" series={inv} accent="violet" icon={HardHat} />
                    <Kpi label="Eksport" series={exp} accent="blue" icon={TrendingUp} />
                    <Kpi label="Import" series={imp} accent="amber" icon={Factory} />
                </div>
                {comp.length === 0 ? <div className="mk-skeleton h-[280px] w-full" /> : (
                    <InteractiveChart data={comp} xKey="date" height={280} unit="%" legend
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                        series={[
                            { key: 'cons', name: 'Spożycie', color: '#16A34A', type: 'line' },
                            { key: 'inv', name: 'Inwestycje', color: '#7C3AED', type: 'line' },
                            { key: 'exp', name: 'Eksport', color: '#2563EB', type: 'line' },
                            { key: 'imp', name: 'Import', color: '#D97706', type: 'line', dashed: true },
                        ]} />
                )}
            </SectionCard>
        </div>
    );
}

// ═══ RYNEK PRACY ═══
export function RynekPracySection() {
    const regQ = useGusRegional();
    const monthlyQ = useGusMonthly();
    const cpiQ = useCpiFull();
    const [selected, setSelected] = useState<string | null>(null);
    const [regionDrawer, setRegionDrawer] = useState(false);
    const openRegion = (slug: string | null) => { setSelected(slug); if (slug) setRegionDrawer(true); };

    const regions = regQ.data?.regions ?? [];
    const national = regQ.data?.national ?? { avgUnemployment: null, avgWages: null };
    const wages = monthlyQ.data?.wages ?? [];
    const lastWage = wages.length ? wages[wages.length - 1] : null;

    // Płace realne = wzrost płac nominalnych (r/r) − inflacja CPI (r/r) = zmiana siły nabywczej
    const cpiByDate = useMemo(() => new Map((cpiQ.data?.headline ?? []).map((h) => [h.date, h.yoy])), [cpiQ.data]);
    const realWages = useMemo(() => wages.map((w) => {
        const cpi = cpiByDate.get(w.date) ?? null;
        return { date: w.date, nominal: w.value, cpi, real: cpi != null ? +(w.value - cpi).toFixed(1) : null };
    }), [wages, cpiByDate]);
    const lastReal = useMemo(() => [...realWages].reverse().find((r) => r.real != null) ?? null, [realWages]);

    const selectedRegion = regions.find((r) => r.slug === selected) ?? null;

    // 10-letnie serie wybranego województwa
    const regUnemp = useMemo(() => {
        const tl = regQ.data?.timeline ?? [];
        return selected
            ? tl.map((t) => ({ date: t.month, value: t.rates?.[selected] })).filter((p): p is { date: string; value: number } => p.value != null)
            : [];
    }, [regQ.data, selected]);
    const regWages = useMemo(() => (selectedRegion?.wagesSeries ?? []).map((w) => ({ date: String(w.year), value: w.value })), [selectedRegion]);

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
                <SectionCard className="lg:col-span-2" title="Bezrobocie rejestrowane — mapa województw" subtitle="GUS · kliknij region, aby zobaczyć 10-letnią historię"
                    actions={<CsvExport filename="bezrobocie-regiony" headers={['Województwo', 'Bezrobocie %', 'Płace PLN']} rows={regions.map((r) => [r.name, r.unemployment, r.wages])} />}>
                    {regQ.isLoading ? <div className="mk-skeleton h-[360px] w-full" /> : (
                        <PolandMap regions={regions} national={national} selectedRegion={selected} onRegionSelect={openRegion} />
                    )}
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard title={selectedRegion ? selectedRegion.name : 'Wybierz województwo'} padded>
                        {selectedRegion ? (
                            <>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between"><dt className="text-mk-muted">Bezrobocie</dt><dd className="font-semibold tnum">{selectedRegion.unemployment != null ? `${formatDecimalPL(selectedRegion.unemployment, 1)}%` : '—'}</dd></div>
                                    <div className="flex justify-between"><dt className="text-mk-muted">Płace</dt><dd className="font-semibold tnum">{selectedRegion.wages != null ? `${formatNumber(selectedRegion.wages, 0)} zł` : '—'}</dd></div>
                                    <div className="flex justify-between"><dt className="text-mk-muted">Płace r/r</dt><dd className="font-semibold tnum">{selectedRegion.wagesYoY != null ? `${formatDecimalPL(selectedRegion.wagesYoY, 1)}%` : '—'}</dd></div>
                                </dl>
                                <button onClick={() => setRegionDrawer(true)} className="mt-4 w-full rounded-lg border border-mk-border px-3 py-2 text-sm font-medium text-mk-text transition-colors hover:bg-mk-surface-alt">Historia 10 lat →</button>
                            </>
                        ) : <p className="text-sm text-mk-faint">Kliknij region na mapie, aby zobaczyć szczegóły i 10-letnią historię.</p>}
                    </SectionCard>
                    <SectionCard title="Ranking" padded>
                        <div className="max-h-[240px] overflow-auto">
                            <DataTable columns={cols} rows={regions} initialSort="unemp" initialDir="desc" rowKey={(r) => r.slug} />
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Płace realne — siła nabywcza (płace nominalne − CPI) */}
            <SectionCard title="Płace realne — siła nabywcza" subtitle="wzrost płac nominalnych minus inflacja CPI (r/r, %) · dodatnie = rosnąca siła nabywcza"
                actions={<div className="flex items-center gap-2"><StaleBadge date={lastReal?.date ?? null} label="do" warnAfterMonths={4} /><CsvExport filename="place-realne" headers={['Miesiąc', 'Nominalne', 'CPI', 'Realne']} rows={realWages.map((r) => [r.date, r.nominal, r.cpi, r.real])} /></div>}>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard label="Płace nominalne (r/r)" value={fmtPL(lastReal?.nominal)} unit="%" accent="green" icon={Wallet} footnote={lastReal ? `GUS · ${lastReal.date}` : 'GUS'} loading={monthlyQ.isLoading} />
                    <KpiCard label="Inflacja CPI (r/r)" value={fmtPL(lastReal?.cpi)} unit="%" accent="amber" icon={TrendingUp} footnote="GUS · krajowy CPI" loading={cpiQ.isLoading} />
                    <KpiCard label="Płace realne (r/r)" value={fmtPL(lastReal?.real)} unit="%" accent={(lastReal?.real ?? 0) >= 0 ? 'blue' : 'rose'} icon={Percent} footnote="zmiana siły nabywczej" loading={monthlyQ.isLoading || cpiQ.isLoading} />
                </div>
                {realWages.length < 2 ? <div className="mk-skeleton h-[300px] w-full" /> : (
                    <InteractiveChart data={realWages} xKey="date" height={300} unit="%" legend showRange initialRange="3L" ranges={['1R', '3L', '5L', 'ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                        series={[
                            { key: 'nominal', name: 'Płace nominalne', color: '#16A34A', type: 'line', strokeWidth: 2 },
                            { key: 'cpi', name: 'Inflacja CPI', color: '#D97706', type: 'line', strokeWidth: 2, dashed: true },
                            { key: 'real', name: 'Płace realne', color: '#2563EB', type: 'area', strokeWidth: 2.5 },
                        ]} />
                )}
            </SectionCard>

            {/* Drawer województwa — 10-letnia historia */}
            <Drawer open={regionDrawer && !!selectedRegion} onClose={() => setRegionDrawer(false)} accent="#0891B2"
                title={selectedRegion?.name ?? ''} subtitle="rynek pracy województwa — 10 lat">
                {selectedRegion && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { l: 'Bezrobocie', v: selectedRegion.unemployment != null ? `${formatDecimalPL(selectedRegion.unemployment, 1)}%` : '—' },
                                { l: 'Płace', v: selectedRegion.wages != null ? `${formatNumber(selectedRegion.wages, 0)} zł` : '—' },
                                { l: 'Płace r/r', v: selectedRegion.wagesYoY != null ? `${formatDecimalPL(selectedRegion.wagesYoY, 1)}%` : '—' },
                            ].map((x) => (
                                <div key={x.l} className="rounded-xl border border-mk-border p-2 text-center">
                                    <div className="text-[11px] text-mk-muted">{x.l}</div>
                                    <div className="mt-0.5 text-sm font-bold tnum text-mk-text">{x.v}</div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Stopa bezrobocia — 10 lat (miesięcznie)</div>
                            {regUnemp.length > 1 ? (
                                <InteractiveChart data={regUnemp} xKey="date" height={220} unit="%" showRange initialRange="ALL" ranges={['1R', '3L', '5L', 'ALL']}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                                    series={[{ key: 'value', name: 'Bezrobocie', color: '#0891B2', type: 'area', strokeWidth: 2.5 }]} />
                            ) : <div className="mk-skeleton h-[220px] w-full" />}
                        </div>
                        <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Przeciętne wynagrodzenie — rocznie (PLN)</div>
                            {regWages.length > 1 ? (
                                <InteractiveChart data={regWages} xKey="date" height={200} unit=" zł"
                                    valueFormatter={(v) => formatNumber(v, 0)}
                                    series={[{ key: 'value', name: 'Płace', color: '#16A34A', type: 'area', strokeWidth: 2.5 }]} />
                            ) : <p className="py-6 text-center text-sm text-mk-faint">Brak serii płac dla województwa.</p>}
                        </div>
                        <p className="text-[11px] text-mk-faint">Źródło: GUS BDL — bezrobocie rejestrowane (miesięcznie) i przeciętne wynagrodzenie brutto (rocznie) dla województwa.</p>
                    </div>
                )}
            </Drawer>
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
