'use client';

import { useMemo } from 'react';
import { TrendingUp, Factory, ShoppingCart, HardHat, Percent, Users } from 'lucide-react';
import {
    useGDPQuarterly,
    useGusIndustrialProduction,
    useGusRetailSales,
    useGusConstructionOutput,
    useCpiFull,
    useGusRegisteredUnemployment,
    useKoniunktura,
} from '@/lib/hooks';
import { plSeries, lastOf, deltaOf, fmtPL, quarterTick, type Point } from '@/lib/series';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout, DenseThreeCol } from '@/components/ui/DensePageLayout';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { QueryState } from '@/components/ui/QueryState';

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

/** Gęsty dashboard PKB i aktywności — domyślna zakładka /gospodarka. */
export function GospodarkaAktywnosc() {
    // PKB: REALNA dynamika r/r, kwartalnie (Eurostat namq_10_gdp, CLV_PCH_SM — dane przekazywane przez GUS).
    // NIE `useGusGdpAnnual`: BDL var 458272 to PKB w CENACH BIEŻĄCYCH (podgrupa „PKB (ceny bieżące)"),
    // więc hero pisał „dynamika PKB 7,0%" za 2024, gdy realny wzrost wyniósł ~3%.
    const gdpQ = useGDPQuarterly();
    const indQ = useGusIndustrialProduction();
    const retQ = useGusRetailSales();
    const conQ = useGusConstructionOutput();
    const cpiQ = useCpiFull();
    // Oficjalna krajowa stopa bezrobocia rejestrowanego (BDL P3559) — ta sama co na Przeglądzie.
    // NIE średnia z 16 województw: nieważona średnia stóp regionalnych ≠ stopa krajowa (6,6% vs 5,8%).
    const unempQ = useGusRegisteredUnemployment(24);
    const konQ = useKoniunktura();

    const gdp = useMemo(() => plSeries(gdpQ.data), [gdpQ.data]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);
    const con = useMemo(() => plSeries(conQ.data), [conQ.data]);
    const cpi = useMemo(
        () => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })),
        [cpiQ.data],
    );
    const unemp = useMemo(
        () => (unempQ.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })),
        [unempQ.data],
    );

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

    const gdpLast = gdp.length ? gdp[gdp.length - 1] : null;

    // ── Hero „redakcyjny". Metryka wiodąca: realny PKB r/r (kwartał), a gdy brak → produkcja przemysłowa r/r. ──
    const heroHasGdp = gdpLast != null;
    const heroPrimaryVal = heroHasGdp ? gdpLast!.value : lastOf(ind);
    const heroPrimaryDelta = heroHasGdp ? ppDeltaAnnual(gdp) : deltaOf(ind);
    const heroPeriod = heroHasGdp
        ? (gdpLast ? formatDataPeriod(gdpLast.date) : null)
        : (ind.length ? formatDataPeriod(ind[ind.length - 1].date) : null);
    const heroHeadline = heroPrimaryVal == null ? 'Aktywność gospodarcza'
        : heroPrimaryVal > 0 ? (heroHasGdp ? 'Gospodarka rośnie' : 'Produkcja rośnie')
        : heroPrimaryVal < 0 ? (heroHasGdp ? 'Gospodarka się kurczy' : 'Produkcja spada')
        : (heroHasGdp ? 'Dynamika PKB' : 'Produkcja przemysłowa');

    const compactKpis = useMemo((): CompactKpiItem[] => {
        const items: CompactKpiItem[] = [
            {
                key: 'gdp',
                label: 'PKB realny (r/r)',
                value: fmtPL(lastOf(gdp)),
                unit: '%',
                icon: TrendingUp,
                delta: ppDeltaAnnual(gdp) != null ? { value: ppDeltaAnnual(gdp)!, unit: 'pp' } : undefined,
                footnote: gdpLast ? formatDataPeriod(gdpLast.date) : '',
                loading: gdpQ.isLoading,
                error: gdpQ.isError,
                onRetry: () => { void gdpQ.refetch(); },
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
                error: indQ.isError,
                onRetry: () => { void indQ.refetch(); },
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
                error: retQ.isError,
                onRetry: () => { void retQ.refetch(); },
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
                error: cpiQ.isError,
                onRetry: () => { void cpiQ.refetch(); },
            },
            {
                key: 'unemp',
                label: 'Bezrobocie rej.',
                value: fmtPL(lastOf(unemp)),
                unit: '%',
                icon: Users,
                delta: deltaOf(unemp) != null ? { value: deltaOf(unemp)!, unit: 'pp', invert: true } : undefined,
                footnote: unemp.length ? unemp[unemp.length - 1].date : '',
                loading: unempQ.isLoading,
                error: unempQ.isError,
                onRetry: () => { void unempQ.refetch(); },
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
                error: conQ.isError,
                onRetry: () => { void conQ.refetch(); },
            },
        ];
        return items;
    }, [gdp, ind, ret, cpi, unemp, con, gdpQ, indQ, retQ, cpiQ, unempQ, conQ, gdpLast]);

    return (
        <DensePageLayout>
            <EditorialHero
                ariaLabel="Gospodarka — najważniejszy odczyt"
                period={heroPeriod}
                source={heroHasGdp ? 'GUS / Eurostat · PKB w cenach stałych' : 'GUS · aktywność gospodarcza'}
                headline={heroHeadline}
                description={
                    <>
                        Dynamika {heroHasGdp ? 'realnego PKB' : 'produkcji przemysłowej'} wynosi {heroPrimaryVal != null ? fmtPL(heroPrimaryVal) : '—'}% r/r{heroHasGdp && heroPeriod ? ` (${heroPeriod}, ceny stałe)` : ''}.
                        {heroHasGdp && lastOf(ind) != null && ` Produkcja przemysłowa: ${fmtPL(lastOf(ind))}% r/r.`}
                    </>
                }
                value={heroPrimaryVal != null ? fmtPL(heroPrimaryVal) : '—'}
                unit="%"
                delta={heroPrimaryDelta}
                valueCaption={heroHasGdp ? 'PKB realny · r/r · kwartalnie' : 'Produkcja przemysłowa · r/r'}
                panelTitle="Aktywność — skrót"
                rows={[
                    { label: 'PKB realny r/r', value: lastOf(gdp) != null ? `${lastOf(gdp)! > 0 ? '+' : ''}${fmtPL(lastOf(gdp))}%` : '—' },
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
                            title="PKB — dynamika realna"
                            subtitle="r/r % · kwartalnie · ceny stałe · Eurostat (dane GUS)"
                            actions={
                                // Kwartał → wydanie flash ~45 dni po końcu kwartału; 8 mies. = spóźniony o jeden odczyt.
                                <StaleBadge date={gdpLast?.date ?? null} label="dane do" warnAfterMonths={8} />
                            }
                        >
                            <QueryState
                                isLoading={gdpQ.isLoading}
                                isError={gdpQ.isError}
                                isEmpty={gdp.length === 0}
                                onRetry={() => { void gdpQ.refetch(); }}
                                height={200}
                                emptyTitle="Brak danych PKB."
                            >
                                <InteractiveChart
                                    data={gdp}
                                    xKey="date"
                                    xTickFormatter={quarterTick}
                                    height={200}
                                    unit="%"
                                    showRange={false}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)}
                                    referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                    series={[{ key: 'value', name: 'PKB r/r', color: '#16A34A', type: 'area', strokeWidth: 2.5 }]}
                                />
                            </QueryState>
                        </SectionCard>

                        {activity.length > 1 && (
                            <SectionCard
                                editorial
                                titleVariant="label"
                                title="Aktywność — produkcja, sprzedaż, budownictwo"
                                subtitle="GUS · miesięcznie (r/r %)"
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
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="Klimat sektorów"
                        subtitle="GUS koniunktura · saldo ocen przedsiębiorców"
                        actions={<StaleBadge date={konLatest?.date ?? null} label="GUS do" warnAfterMonths={3} />}
                    >
                        <QueryState
                            isLoading={konQ.isLoading}
                            isError={konQ.isError}
                            isEmpty={sectorBars.length === 0}
                            onRetry={() => { void konQ.refetch(); }}
                            height={220}
                            emptyTitle="Brak danych koniunktury"
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
                        </QueryState>
                    </SectionCard>
                }
            />

        </DensePageLayout>
    );
}
