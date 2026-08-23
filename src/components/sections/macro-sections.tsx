'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Factory, ShoppingCart, HardHat, Users, Wallet, Percent, Landmark } from 'lucide-react';
import {
    useGusGdpAnnual, useGusIndustrialProduction, useGusRetailSales, useGusConstructionOutput,
    useGusCpiHeadline, useGusRegional, useGusMonthly, useNBPInterestRates, useWibor, useYieldCurve, useCpiFull,
} from '@/lib/hooks';
import { plSeries, lastOf, deltaOf, monthTick, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { Drawer } from '@/components/ui/Drawer';
import PolandMap from '@/components/PolandMap';
import { AXIS_INK } from '@/lib/chart-theme';
import { QueryState, QueryEmpty } from '@/components/ui/QueryState';

const byDate = (pts: Point[]) => new Map(pts.map((p) => [p.date, p.value]));

function Kpi({ label, series, unit = '%', accent, icon, invert, footnote, loading, error, onRetry }: {
    label: string; series: Point[]; unit?: string; accent: AccentKey; icon: typeof TrendingUp; invert?: boolean; footnote?: string;
    loading?: boolean; error?: boolean; onRetry?: () => void;
}) {
    const last = lastOf(series);
    const d = deltaOf(series);
    return (
        <KpiCard label={label} value={fmtPL(last)} unit={unit} accent={accent} icon={icon}
            delta={d != null ? { value: d, unit: 'pp', invert } : undefined}
            footnote={footnote ?? (series.length ? series[series.length - 1].date : '—')}
            loading={loading} error={error} onRetry={onRetry} />
    );
}

// ═══ INFLACJA (legacy export — używa krajowego CPI GUS) ═══
export function InflacjaSection() {
    const cpiQ = useGusCpiHeadline();
    const cpi = useMemo(() => plSeries(cpiQ.data), [cpiQ.data]);
    const dataDate = cpi.length ? cpi[cpi.length - 1].date : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <Kpi label="CPI ogółem (r/r)" series={cpi} accent="amber" icon={TrendingUp} invert footnote="GUS · krajowy CPI"
                    loading={cpiQ.isLoading} error={cpiQ.isError} onRetry={() => { void cpiQ.refetch(); }} />
            </div>

            <SectionCard editorial titleVariant="label"
                title="Inflacja CPI — trend"
                subtitle="Źródło: GUS DBW (krajowy CPI, r/r %)"
                actions={<StaleBadge date={dataDate} label="CPI do" />}
            >
                <QueryState
                    isLoading={cpiQ.isLoading}
                    isError={cpiQ.isError}
                    isEmpty={cpi.length === 0}
                    onRetry={() => { void cpiQ.refetch(); }}
                    height={320}
                    emptyTitle="Brak danych CPI"
                >
                    <InteractiveChart
                        data={cpi.map((p) => ({ date: p.date, value: p.value }))} xKey="date" height={320} unit="%" showRange initialRange="1R"
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        referenceLines={[{ y: 2.5, label: 'Cel NBP', color: AXIS_INK }]}
                        series={[{ key: 'value', name: 'CPI ogółem', color: '#2563EB', type: 'line', strokeWidth: 3 }]}
                    />
                </QueryState>
            </SectionCard>
        </div>
    );
}

// ═══ AKTYWNOŚĆ ═══
export function AktywnoscSection() {
    const gdpQ = useGusGdpAnnual();
    const indQ = useGusIndustrialProduction();
    const retQ = useGusRetailSales();
    const conQ = useGusConstructionOutput();

    const gdpS = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);
    const con = useMemo(() => plSeries(conQ.data), [conQ.data]);

    // Produkcja / sprzedaż / budownictwo (miesięcznie, GUS)
    const activity = useMemo(() => {
        const rm = byDate(ret), cm = byDate(con);
        return ind.map((p) => ({ date: p.date, ind: p.value, ret: rm.get(p.date) ?? null, con: cm.get(p.date) ?? null }));
    }, [ind, ret, con]);

    return (
        <div className="space-y-6">
            <section>
                <h2 className="mk-section-label mb-3">Aktywność gospodarcza</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi label="PKB (r/r)" series={gdpS} accent="green" icon={TrendingUp} footnote="GUS · rocznie"
                    loading={gdpQ.isLoading} error={gdpQ.isError} onRetry={() => { void gdpQ.refetch(); }} />
                <Kpi label="Produkcja przemysłowa (r/r)" series={ind} accent="violet" icon={Factory} footnote="GUS DBW"
                    loading={indQ.isLoading} error={indQ.isError} onRetry={() => { void indQ.refetch(); }} />
                <Kpi label="Sprzedaż detaliczna (r/r)" series={ret} accent="amber" icon={ShoppingCart} footnote="GUS BDL P3860"
                    loading={retQ.isLoading} error={retQ.isError} onRetry={() => { void retQ.refetch(); }} />
                <Kpi label="Budownictwo (r/r)" series={con} accent="cyan" icon={HardHat} footnote="GUS DBW"
                    loading={conQ.isLoading} error={conQ.isError} onRetry={() => { void conQ.refetch(); }} />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="PKB — dynamika roczna (r/r)" subtitle="GUS BDL · rocznie (%)">
                    <QueryState
                        isLoading={gdpQ.isLoading}
                        isError={gdpQ.isError}
                        isEmpty={gdpS.length === 0}
                        onRetry={() => { void gdpQ.refetch(); }}
                        height={260}
                        emptyTitle="Brak danych PKB"
                    >
                        <InteractiveChart data={gdpS} xKey="date" height={260} unit="%" showRange initialRange="ALL"
                            valueFormatter={(v) => formatDecimalPL(v, 1)} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                            series={[{ key: 'value', name: 'PKB r/r', color: '#16A34A', type: 'area', strokeWidth: 2.5 }]} />
                    </QueryState>
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Produkcja, sprzedaż, budownictwo" subtitle="GUS · miesięcznie (r/r)">
                    <QueryState
                        isLoading={indQ.isLoading || retQ.isLoading || conQ.isLoading}
                        isError={indQ.isError || retQ.isError || conQ.isError}
                        isEmpty={activity.length === 0}
                        onRetry={() => { void indQ.refetch(); void retQ.refetch(); void conQ.refetch(); }}
                        height={260}
                        emptyTitle="Brak danych aktywności"
                    >
                        <InteractiveChart data={activity} xKey="date" height={260} unit="%" legend showRange initialRange="1R"
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                            series={[
                                { key: 'ind', name: 'Produkcja', color: '#7C3AED', type: 'line' },
                                { key: 'ret', name: 'Sprzedaż', color: '#D97706', type: 'line' },
                                { key: 'con', name: 'Budownictwo', color: '#0891B2', type: 'line' },
                            ]} />
                    </QueryState>
                </SectionCard>
            </div>
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
                <SectionCard editorial titleVariant="label" className="lg:col-span-2" title="Bezrobocie rejestrowane — mapa województw" subtitle="GUS · kliknij region, aby zobaczyć 10-letnią historię">
                    <QueryState
                        isLoading={regQ.isLoading}
                        isError={regQ.isError}
                        isEmpty={regions.length === 0}
                        onRetry={() => { void regQ.refetch(); }}
                        height={360}
                        emptyTitle="Brak danych regionalnych"
                    >
                        <PolandMap regions={regions} national={national} selectedRegion={selected} onRegionSelect={openRegion} />
                    </QueryState>
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard editorial titleVariant="label" title={selectedRegion ? selectedRegion.name : 'Wybierz województwo'} padded>
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
                    <SectionCard editorial titleVariant="label" title="Ranking" padded>
                        <div className="max-h-[240px] overflow-auto">
                            <DataTable columns={cols} rows={regions} initialSort="unemp" initialDir="desc" rowKey={(r) => r.slug} />
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Płace realne — siła nabywcza (płace nominalne − CPI) */}
            <SectionCard editorial titleVariant="label" title="Płace realne — siła nabywcza" subtitle="wzrost płac nominalnych minus inflacja CPI (r/r, %) · dodatnie = rosnąca siła nabywcza"
                actions={<StaleBadge date={lastReal?.date ?? null} label="do" warnAfterMonths={4} />}>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard label="Płace nominalne (r/r)" value={fmtPL(lastReal?.nominal)} unit="%" accent="green" icon={Wallet} footnote={lastReal ? `GUS · ${lastReal.date}` : 'GUS'} loading={monthlyQ.isLoading} />
                    <KpiCard label="Inflacja CPI (r/r)" value={fmtPL(lastReal?.cpi)} unit="%" accent="amber" icon={TrendingUp} footnote="GUS · krajowy CPI" loading={cpiQ.isLoading} />
                    <KpiCard label="Płace realne (r/r)" value={fmtPL(lastReal?.real)} unit="%" accent={(lastReal?.real ?? 0) >= 0 ? 'blue' : 'rose'} icon={Percent} footnote="zmiana siły nabywczej" loading={monthlyQ.isLoading || cpiQ.isLoading} />
                </div>
                <QueryState
                    isLoading={monthlyQ.isLoading || cpiQ.isLoading}
                    isError={monthlyQ.isError || cpiQ.isError}
                    isEmpty={realWages.length < 2}
                    onRetry={() => { void monthlyQ.refetch(); void cpiQ.refetch(); }}
                    height={300}
                    emptyTitle="Brak danych płac realnych"
                >
                    <InteractiveChart data={realWages} xKey="date" height={300} unit="%" legend showRange initialRange="3L" ranges={['1R', '3L', '5L', 'ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                        series={[
                            { key: 'nominal', name: 'Płace nominalne', color: '#16A34A', type: 'line', strokeWidth: 2 },
                            { key: 'cpi', name: 'Inflacja CPI', color: '#D97706', type: 'line', strokeWidth: 2, dashed: true },
                            { key: 'real', name: 'Płace realne', color: '#2563EB', type: 'area', strokeWidth: 2.5 },
                        ]} />
                </QueryState>
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
                            ) : <QueryEmpty title="Brak serii bezrobocia dla województwa." height={220} />}
                        </div>
                        <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Przeciętne wynagrodzenie — rocznie (PLN)</div>
                            {regWages.length > 1 ? (
                                <InteractiveChart data={regWages} xKey="date" height={200} unit=" zł"
                                    valueFormatter={(v) => formatNumber(v, 0)}
                                    series={[{ key: 'value', name: 'Płace', color: '#16A34A', type: 'area', strokeWidth: 2.5 }]} />
                            ) : <QueryEmpty title="Brak serii płac dla województwa." height={120} />}
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
                <SectionCard editorial titleVariant="label" title="WIBOR — terminy" subtitle="Szacowane z ref. NBP + spread">
                    <QueryState
                        isLoading={wiborQ.isLoading}
                        isError={wiborQ.isError}
                        isEmpty={wibor.length === 0}
                        onRetry={() => { void wiborQ.refetch(); }}
                        height={220}
                        emptyTitle="Brak danych WIBOR"
                    >
                        <InteractiveChart data={wibor.map((w) => ({ tenor: w.tenor, wibor: w.wibor }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'wibor', name: 'WIBOR', color: '#2563EB', type: 'bar' }]} />
                    </QueryState>
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Krzywa rentowności obligacji" subtitle="Stooq · 2Y / 5Y / 10Y">
                    <QueryState
                        isLoading={yc.y2.isLoading || yc.y5.isLoading || yc.y10.isLoading}
                        isError={yc.y2.isError || yc.y5.isError || yc.y10.isError}
                        isEmpty={curve.length === 0}
                        onRetry={() => { void yc.y2.refetch(); void yc.y5.refetch(); void yc.y10.refetch(); }}
                        height={220}
                        emptyTitle="Brak danych rentowności"
                        emptyDetail="Źródło obligacji nie zwróciło serii. To nie znaczy, że rentowność wynosi zero."
                    >
                        <InteractiveChart data={curve.map((c) => ({ tenor: c.tenor, yield: c.yield }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'yield', name: 'Rentowność', color: '#0891B2', type: 'line', strokeWidth: 3 }]} />
                    </QueryState>
                </SectionCard>
            </div>
        </div>
    );
}
