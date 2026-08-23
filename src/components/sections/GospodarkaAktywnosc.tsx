'use client';

import { useMemo } from 'react';
import { TrendingUp, Factory, ShoppingCart, HardHat, Percent, Users } from 'lucide-react';
import {
    useGusGdpAnnual,
    useGusIndustrialProduction,
    useGusRetailSales,
    useGusConstructionOutput,
    useCpiFull,
    useGusUnemploymentNational,
    useKoniunktura,
} from '@/lib/hooks';
import { plSeries, lastOf, deltaOf, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatDataPeriod, formatDataPeriodLabel } from '@/lib/formatters';
import { analyzeSeries, trendObservation, type Observation } from '@/lib/observations';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout, DenseThreeCol } from '@/components/ui/DensePageLayout';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';

const monthTick = (d: string) => {
    const [y, m] = d.split('-');
    return m ? `${m}.${y.slice(2)}` : d;
};

const SECTOR_COLORS: Record<string, string> = {
    przetworstwo: '#2563EB',
    budownictwo: '#D97706',
    handel: '#16A34A',
    transport: '#0891B2',
    ikt: '#7C3AED',
};

function ppDeltaAnnual(series: Point[]) {
    const last = lastOf(series);
    const prev = series.length > 1 ? series[series.length - 2].value : null;
    return last != null && prev != null ? +(last - prev).toFixed(1) : null;
}

function ObservationsRow({ items }: { items: Observation[] }) {
    const slice = items.slice(0, 3);
    if (!slice.length) return null;
    return (
        <section>
            <h2 className="mk-section-label mb-2">Kluczowe obserwacje</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {slice.map((o, i) => (
                    <div key={i} className="mk-card mk-card-editorial mk-card-pad-compact flex gap-3">
                        <span className="mk-obs-num shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-[13px] leading-snug text-mk-text-soft">{o.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/** Gęsty dashboard PKB i aktywności — domyślna zakładka /gospodarka (tylko GUS). */
export function GospodarkaAktywnosc() {
    const gdpQ = useGusGdpAnnual();
    const indQ = useGusIndustrialProduction();
    const retQ = useGusRetailSales();
    const conQ = useGusConstructionOutput();
    const cpiQ = useCpiFull();
    const unempQ = useGusUnemploymentNational();
    const konQ = useKoniunktura();

    const gdp = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const gdp10 = useMemo(() => gdp.slice(-10), [gdp]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);
    const con = useMemo(() => plSeries(conQ.data), [conQ.data]);
    const cpi = useMemo(
        () => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })),
        [cpiQ.data],
    );
    const unemp = useMemo(() => plSeries(unempQ.data), [unempQ.data]);

    const konSectors = konQ.data?.sectors ?? [];
    const konLatest = konQ.data?.latest ?? null;
    const sectorBars = useMemo(() => {
        if (!konLatest) return [];
        return konSectors
            .map((s) => {
                const v = konLatest.sectors.find((x) => x.name === s.name)?.value ?? null;
                return { key: s.key, name: s.name, value: v, color: SECTOR_COLORS[s.key] ?? '#64748B' };
            })
            .filter((s) => s.value != null) as { key: string; name: string; value: number; color: string }[];
    }, [konSectors, konLatest]);
    const maxBar = Math.max(...sectorBars.map((s) => Math.abs(s.value)), 1);

    const activity = useMemo(() => {
        const rm = new Map(ret.map((p) => [p.date, p.value]));
        const cm = new Map(con.map((p) => [p.date, p.value]));
        return ind.map((p) => ({ date: p.date, ind: p.value, ret: rm.get(p.date) ?? null, con: cm.get(p.date) ?? null }));
    }, [ind, ret, con]);

    const dataDate = [ind, ret, cpi, unemp].map((s) => (s.length ? s[s.length - 1].date : '')).filter(Boolean).sort().pop() ?? '';
    const gdpLast = gdp.length ? gdp[gdp.length - 1] : null;

    // ── Hero „redakcyjny" — WYŁĄCZNIE realne dane GUS. Metryka wiodąca: PKB r/r, a gdy brak → produkcja przemysłowa r/r. ──
    const heroHasGdp = gdpLast != null;
    const heroPrimaryVal = heroHasGdp ? gdpLast!.value : lastOf(ind);
    const heroPrimaryDelta = heroHasGdp ? ppDeltaAnnual(gdp) : deltaOf(ind);
    const heroPeriod = heroHasGdp
        ? (gdpLast ? String(gdpLast.date) : null)
        : (ind.length ? formatDataPeriod(ind[ind.length - 1].date) : null);
    const heroHeadline = heroPrimaryVal == null ? 'Aktywność gospodarcza'
        : heroPrimaryVal > 0 ? (heroHasGdp ? 'Gospodarka rośnie' : 'Produkcja rośnie')
        : heroPrimaryVal < 0 ? (heroHasGdp ? 'Gospodarka się kurczy' : 'Produkcja spada')
        : (heroHasGdp ? 'Dynamika PKB' : 'Produkcja przemysłowa');

    const compactKpis = useMemo((): CompactKpiItem[] => {
        const items: CompactKpiItem[] = [
            {
                key: 'gdp',
                label: 'PKB (r/r)',
                value: fmtPL(lastOf(gdp)),
                unit: '%',
                icon: TrendingUp,
                delta: ppDeltaAnnual(gdp) != null ? { value: ppDeltaAnnual(gdp)!, unit: 'pp' } : undefined,
                footnote: gdpLast?.date ?? '',
                loading: gdpQ.isLoading,
            },
            {
                key: 'ind',
                label: 'Produkcja',
                value: fmtPL(lastOf(ind)),
                unit: '%',
                icon: Factory,
                delta: deltaOf(ind) != null ? { value: deltaOf(ind)!, unit: 'pp' } : undefined,
                footnote: ind.length ? ind[ind.length - 1].date : '',
                loading: indQ.isLoading,
            },
            {
                key: 'ret',
                label: 'Sprzedaż detal.',
                value: fmtPL(lastOf(ret)),
                unit: '%',
                icon: ShoppingCart,
                delta: deltaOf(ret) != null ? { value: deltaOf(ret)!, unit: 'pp' } : undefined,
                footnote: ret.length ? ret[ret.length - 1].date : '',
                loading: retQ.isLoading,
            },
            {
                key: 'cpi',
                label: 'CPI (r/r)',
                value: fmtPL(lastOf(cpi)),
                unit: '%',
                icon: Percent,
                delta: deltaOf(cpi) != null ? { value: deltaOf(cpi)!, unit: 'pp', invert: true } : undefined,
                footnote: cpi.length ? cpi[cpi.length - 1].date : '',
                loading: cpiQ.isLoading,
            },
            {
                key: 'unemp',
                label: 'Bezrobocie',
                value: fmtPL(lastOf(unemp)),
                unit: '%',
                icon: Users,
                delta: deltaOf(unemp) != null ? { value: deltaOf(unemp)!, unit: 'pp', invert: true } : undefined,
                footnote: unemp.length ? unemp[unemp.length - 1].date : '',
                loading: unempQ.isLoading,
            },
            {
                key: 'con',
                label: 'Budownictwo',
                value: fmtPL(lastOf(con)),
                unit: '%',
                icon: HardHat,
                delta: deltaOf(con) != null ? { value: deltaOf(con)!, unit: 'pp' } : undefined,
                footnote: con.length ? con[con.length - 1].date : '',
                loading: conQ.isLoading,
            },
        ];
        return items;
    }, [gdp, ind, ret, cpi, unemp, con, gdpQ.isLoading, indQ.isLoading, retQ.isLoading, cpiQ.isLoading, unempQ.isLoading, conQ.isLoading, gdpLast]);

    const observations = useMemo<Observation[]>(() => {
        const out: Observation[] = [];
        const push = (o: Observation | null) => { if (o) out.push(o); };
        push(trendObservation('PKB', gdp.map((d) => d.value), false));
        push(trendObservation('Produkcja przemysłowa', ind.map((d) => d.value), false));
        push(trendObservation('Sprzedaż detaliczna', ret.map((d) => d.value), false));
        out.push(...analyzeSeries('CPI', cpi.map((d) => d.value), { goodDown: true, unit: '%', target: { value: 2.5, label: 'NBP' } }).slice(0, 1));
        out.push(...analyzeSeries('Bezrobocie', unemp.map((d) => d.value), { goodDown: true, unit: '%' }).slice(0, 1));
        const g = lastOf(gdp);
        if (g != null) out.push({ text: `Dynamika PKB ${fmtPL(g)}% rocznie (GUS BDL)`, tone: g < 0 ? 'down' : 'up' });
        return out.slice(0, 6);
    }, [gdp, ind, ret, cpi, unemp]);

    return (
        <DensePageLayout>
            <EditorialHero
                ariaLabel="Gospodarka — najważniejszy odczyt"
                period={heroPeriod}
                source="GUS · aktywność gospodarcza"
                headline={heroHeadline}
                description={
                    <>
                        Dynamika {heroHasGdp ? 'PKB' : 'produkcji przemysłowej'} wynosi {heroPrimaryVal != null ? fmtPL(heroPrimaryVal) : '—'}% {heroHasGdp ? 'rocznie' : 'r/r'} wg GUS.
                        {heroHasGdp && lastOf(ind) != null && ` Produkcja przemysłowa: ${fmtPL(lastOf(ind))}% r/r.`}
                    </>
                }
                value={heroPrimaryVal != null ? fmtPL(heroPrimaryVal) : '—'}
                unit="%"
                delta={heroPrimaryDelta}
                valueCaption={heroHasGdp ? 'PKB · dynamika roczna (r/r)' : 'Produkcja przemysłowa · r/r'}
                panelTitle="Aktywność — skrót"
                rows={[
                    { label: 'PKB r/r', value: lastOf(gdp) != null ? `${lastOf(gdp)! > 0 ? '+' : ''}${fmtPL(lastOf(gdp))}%` : '—' },
                    { label: 'Produkcja przemysłowa', value: lastOf(ind) != null ? `${lastOf(ind)! > 0 ? '+' : ''}${fmtPL(lastOf(ind))}%` : '—' },
                    { label: 'Sprzedaż detaliczna', value: lastOf(ret) != null ? `${lastOf(ret)! > 0 ? '+' : ''}${fmtPL(lastOf(ret))}%` : '—' },
                    { label: 'Budownictwo', value: lastOf(con) != null ? `${lastOf(con)! > 0 ? '+' : ''}${fmtPL(lastOf(con))}%` : '—', divider: true },
                ]}
            />

            <CompactKpiGrid items={compactKpis} label="Wskaźniki aktywności" />

            <DenseThreeCol
                left={<RelatedNews topic="gospodarka" limit={3} title="Powiązane newsy" />}
                center={
                    <>
                        <SectionCard
                            editorial
                            titleVariant="label"
                            title="PKB — dynamika roczna"
                            subtitle="GUS BDL · ostatnie 10 lat (r/r %)"
                            actions={
                                <div className="flex items-center gap-2">
                                    <StaleBadge date={gdpLast?.date ?? null} label="GUS do" warnAfterMonths={18} />
                                    <CsvExport filename="pkb-10lat" headers={['Rok', 'r/r %']} rows={gdp10.map((p) => [p.date, p.value])} />
                                </div>
                            }
                        >
                            {gdpQ.isLoading ? (
                                <div className="mk-skeleton h-[200px] w-full" />
                            ) : gdp10.length === 0 ? (
                                <p className="py-8 text-center text-sm text-mk-faint">Brak danych PKB w GUS BDL.</p>
                            ) : (
                                <InteractiveChart
                                    data={gdp10}
                                    xKey="date"
                                    height={200}
                                    unit="%"
                                    showRange={false}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)}
                                    referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                    series={[{ key: 'value', name: 'PKB r/r', color: '#16A34A', type: 'area', strokeWidth: 2.5 }]}
                                />
                            )}
                        </SectionCard>

                        {activity.length > 1 && (
                            <SectionCard
                                editorial
                                titleVariant="label"
                                title="Aktywność — produkcja, sprzedaż, budownictwo"
                                subtitle="GUS · miesięcznie (r/r %)"
                                actions={
                                    <CsvExport
                                        filename="aktywnosc-mies"
                                        headers={['Miesiąc', 'Produkcja', 'Sprzedaż', 'Budownictwo']}
                                        rows={activity.map((r) => [r.date, r.ind, r.ret, r.con])}
                                    />
                                }
                            >
                                <InteractiveChart
                                    data={activity}
                                    xKey="date"
                                    height={200}
                                    unit="%"
                                    legend
                                    showRange
                                    initialRange="1R"
                                    valueFormatter={(v) => formatDecimalPL(v, 1)}
                                    xTickFormatter={monthTick}
                                    series={[
                                        { key: 'ind', name: 'Produkcja', color: '#2563EB', type: 'line' },
                                        { key: 'ret', name: 'Sprzedaż', color: '#D97706', type: 'line' },
                                        { key: 'con', name: 'Budownictwo', color: '#0891B2', type: 'line' },
                                    ]}
                                />
                            </SectionCard>
                        )}
                    </>
                }
                right={
                    sectorBars.length > 0 ? (
                        <SectionCard
                            editorial
                            titleVariant="label"
                            title="Klimat sektorów"
                            subtitle="GUS koniunktura · saldo ocen przedsiębiorców"
                            actions={<StaleBadge date={konLatest?.date ?? null} label="GUS do" warnAfterMonths={3} />}
                        >
                            <div className="space-y-2.5">
                                {sectorBars.map((s) => (
                                    <div key={s.key} className="flex items-center gap-2 text-xs">
                                        <span className="w-[7.5rem] shrink-0 truncate text-mk-text-soft" title={s.name}>
                                            {s.name.replace(' przemysłowe', '').replace(' detaliczny', '')}
                                        </span>
                                        <span className="h-2.5 min-w-0 flex-1 rounded-full bg-mk-surface-alt">
                                            <span
                                                className="block h-2.5 rounded-full"
                                                style={{
                                                    width: `${(Math.abs(s.value) / maxBar) * 100}%`,
                                                    marginLeft: s.value < 0 ? 'auto' : undefined,
                                                    background: s.color,
                                                }}
                                            />
                                        </span>
                                        <span
                                            className="w-12 shrink-0 text-right font-semibold tnum"
                                            style={{ color: s.value >= 0 ? '#16A34A' : '#DC2626' }}
                                        >
                                            {s.value > 0 ? '+' : ''}{formatDecimalPL(s.value, 1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[11px] text-mk-faint">
                                Dekompozycja PKB i eksport nie są publikowane przez GUS w tej aplikacji — wykres pominięty. Saldo sektorów = wskaźnik koniunktury GUS (pkt).
                            </p>
                        </SectionCard>
                    ) : konQ.isLoading ? (
                        <div className="mk-skeleton h-[220px] w-full rounded-xl" />
                    ) : null
                }
            />

            <ObservationsRow items={observations} />

            {dataDate && (
                <p className="text-center text-[11px] text-mk-faint">
                    Okres referencyjny danych: {formatDataPeriodLabel(dataDate)} · wyłącznie źródła GUS
                </p>
            )}
        </DensePageLayout>
    );
}
