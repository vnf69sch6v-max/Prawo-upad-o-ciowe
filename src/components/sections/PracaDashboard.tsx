'use client';

import { useMemo, useState } from 'react';
import { Briefcase, Wallet, DoorOpen, Users, Activity } from 'lucide-react';
import {
    useGusRegisteredUnemployment,
    useGusMonthly,
    useGusRegional,
    useBdlSeries,
    useCpiFull,
    useGusMedianWages,
    useBaelUnemploymentRate,
} from '@/lib/hooks';
import { lastOf, deltaOf, monthTick } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDataPeriod } from '@/lib/formatters';
import { consecutiveRun, runPhrase } from '@/lib/observations';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout, DenseTwoCol } from '@/components/ui/DensePageLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { DeltaChip } from '@/components/ui/DeltaChip';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { StaleBadge } from '@/components/ui/StaleBadge';
import PolandMap from '@/components/PolandMap';

const woj = (name: string) => name.replace(/^województwo /i, '');

/**
 * Rynek pracy — remodel 2026-08:
 * góra = „ile mam" (płace realne), środek = „gdzie" (mapa), dół = „co dalej".
 * Bez czerwonego hero; bez duplikacji liczb.
 */
export function PracaDashboard() {
    const unempQ = useGusRegisteredUnemployment(24);
    const monthlyQ = useGusMonthly();
    const cpiQ = useCpiFull(); // cache React Query — bez refresh=1 (limit DBW)
    const zatrQ = useBdlSeries(154348, 12);
    const wakQ = useBdlSeries(1653025, 1);
    const baelQ = useBaelUnemploymentRate();
    const medianQ = useGusMedianWages(12);
    const regQ = useGusRegional();
    const [selected, setSelected] = useState<string | null>(null);

    const unemp = useMemo(
        () => (unempQ.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })),
        [unempQ.data],
    );
    const wages = useMemo(() => monthlyQ.data?.wages ?? [], [monthlyQ.data?.wages]);
    const lastWage = wages.length ? wages[wages.length - 1] : null;

    // Płace realne = nominalne r/r − CPI r/r (jak macro-sections)
    const cpiByDate = useMemo(
        () => new Map((cpiQ.data?.headline ?? []).map((h) => [h.date, h.yoy])),
        [cpiQ.data],
    );
    const realWages = useMemo(
        () => wages.map((w) => {
            const cpi = cpiByDate.get(w.date) ?? null;
            return { date: w.date, nominal: w.value, cpi, real: cpi != null ? +(w.value - cpi).toFixed(1) : null };
        }),
        [wages, cpiByDate],
    );
    const lastReal = useMemo(() => {
        const hit = [...realWages].reverse().find((r) => r.real != null);
        return hit && hit.real != null
            ? { date: hit.date, nominal: hit.nominal, cpi: hit.cpi as number, real: hit.real }
            : null;
    }, [realWages]);
    const realSeries = useMemo(
        () => realWages.filter((r): r is typeof r & { real: number } => r.real != null).map((r) => r.real),
        [realWages],
    );
    const realRunUp = consecutiveRun(realSeries, 'up');
    const realRunDown = consecutiveRun(realSeries, 'down');
    const prevReal = useMemo(() => {
        const withReal = realWages.filter((r) => r.real != null);
        return withReal.length > 1 ? withReal[withReal.length - 2] : null;
    }, [realWages]);
    const realDelta = lastReal?.real != null && prevReal?.real != null
        ? +(lastReal.real - (prevReal.real as number)).toFixed(1)
        : null;

    const zatr = zatrQ.data?.series ?? [];
    const zLast = zatr.length ? zatr[zatr.length - 1] : null;
    const zPrev = zatr.length > 1 ? zatr[zatr.length - 2] : null;
    // tys. etatów — nie mln (0,00 mln to nie liczba)
    const zatrDeltaTys = zLast && zPrev ? +((zLast.value - zPrev.value) / 1e3).toFixed(1) : null;
    const wLast = (wakQ.data?.series ?? []).at(-1) ?? null;

    // BAEL: count w bdl-series = okresy; series.at(-1) = bieżący kw. (NIE series[0] — patrz ROADMAP)
    const baelLast = baelQ.data?.series?.at(-1) ?? null;
    const medianLast = medianQ.data?.series?.at(-1) ?? null;

    const regions = regQ.data?.regions ?? [];
    const national = regQ.data?.national ?? { avgUnemployment: null, avgWages: null };
    const selectedRegion = regions.find((r) => r.slug === selected) ?? null;

    const heroU = lastOf(unemp);
    const leadLoading = monthlyQ.isLoading || cpiQ.isLoading;

    const leadHeadline = lastReal == null ? 'Siła nabywcza płac'
        : lastReal.real > 0.2 ? 'Siła nabywcza rośnie'
            : lastReal.real < -0.2 ? 'Siła nabywcza spada'
                : 'Siła nabywcza płac';

    const leadSentence = lastReal == null
        ? 'Płace realne = wzrost wynagrodzeń nominalnych minus inflacja CPI — odpowiedź na „czy stać mnie na więcej niż rok temu".'
        : `Płace rosną ${formatDecimalPL(lastReal.nominal, 1)}%, ceny ${formatDecimalPL(lastReal.cpi ?? 0, 1)}% — siła nabywcza ${
            lastReal.real > 0.2
                ? (realRunUp >= 2 ? `rośnie ${runPhrase(realRunUp)}` : 'rośnie')
                : lastReal.real < -0.2
                    ? (realRunDown >= 2 ? `spada ${runPhrase(realRunDown)}` : 'spada')
                    : 'stoi w miejscu'
        }.`;

    // 4 kafle — bez max/rozpiętości (są w rankingu), bez Δ m/m (duplikat), bez wakatów (dół)
    const compactKpis: CompactKpiItem[] = [
        {
            key: 'unemp',
            label: 'Bezrobocie rej.',
            value: heroU != null ? formatDecimalPL(heroU, 1) : '—',
            unit: '%',
            icon: Users,
            delta: deltaOf(unemp) != null ? { value: deltaOf(unemp)!, unit: 'pp', invert: true } : undefined,
            footnote: unemp.length ? formatDataPeriod(unemp[unemp.length - 1].date) : 'GUS BDL',
            loading: unempQ.isLoading,
        },
        {
            key: 'bael',
            label: 'BAEL',
            value: baelLast != null ? formatDecimalPL(baelLast.value, 1) : '—',
            unit: '%',
            icon: Activity,
            footnote: baelLast ? `BAEL · ${formatDataPeriod(baelLast.date)}` : 'BAEL · GUS',
            loading: baelQ.isLoading,
        },
        {
            key: 'wage',
            label: 'Śr. płaca',
            value: lastWage ? formatNumber(lastWage.raw, 0) : '—',
            unit: 'zł',
            icon: Wallet,
            footnote: lastWage ? `przedsiębiorstwa · ${formatDataPeriod(lastWage.date)}` : 'GUS',
            loading: monthlyQ.isLoading,
        },
        {
            key: 'median',
            label: 'Mediana',
            value: medianLast != null ? formatNumber(medianLast.value, 0) : '—',
            unit: 'zł',
            icon: Wallet,
            footnote: medianLast
                ? `rozkład GN · ${formatDataPeriod(medianLast.date)}`
                : 'P4610 · GUS BDL',
            loading: medianQ.isLoading,
        },
    ];

    const cols: Column<(typeof regions)[number]>[] = [
        { key: 'name', header: 'Woj.', sortable: true, sortValue: (r) => r.name, render: (r) => woj(r.name) },
        { key: 'unemp', header: 'Bezrob.', align: 'right', sortable: true, sortValue: (r) => r.unemployment ?? 0, render: (r) => r.unemployment != null ? `${formatDecimalPL(r.unemployment, 1)}%` : '—' },
        { key: 'wages', header: 'Płace', align: 'right', sortable: true, sortValue: (r) => r.wages ?? 0, render: (r) => r.wages != null ? formatNumber(r.wages, 0) : '—' },
    ];

    const mapDate = regions.find((r) => r.unemploymentMonth)?.unemploymentMonth ?? (unemp.length ? unemp[unemp.length - 1].date : null);

    return (
        <DensePageLayout>
            {/* Lead: płace realne — mk-surface, kolor tylko na DeltaChip */}
            <section
                className="rounded-[14px] border border-mk-border bg-mk-surface p-5 sm:p-6"
                aria-label="Płace realne — siła nabywcza"
            >
                {leadLoading ? (
                    <div className="space-y-3">
                        <div className="mk-skeleton h-3 w-40 rounded" />
                        <div className="mk-skeleton h-8 w-64 rounded" />
                        <div className="mk-skeleton h-14 w-40 rounded" />
                        <div className="mk-skeleton h-4 w-full max-w-xl rounded" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-mk-muted">
                            {lastReal?.date && (
                                <span className="inline-flex items-center rounded-full bg-mk-surface-alt px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mk-text-soft tnum">
                                    {formatDataPeriod(lastReal.date)}
                                </span>
                            )}
                            <span>GUS · płace nominalne − CPI</span>
                            <StaleBadge date={lastReal?.date ?? null} label="do" warnAfterMonths={4} />
                        </div>
                        <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-mk-text-soft">
                            {leadSentence}
                        </p>
                        <div className="mt-4 flex flex-wrap items-baseline gap-3">
                            <span className="mk-kpi-value text-mk-text">
                                {lastReal?.real != null ? formatDecimalPL(lastReal.real, 1) : '—'}
                            </span>
                            <span className="text-lg font-semibold text-mk-muted">% r/r</span>
                            {realDelta != null && <DeltaChip value={realDelta} unit="pp" note="m/m" />}
                        </div>
                        <p className="mt-1.5 text-xs text-mk-muted">{leadHeadline}</p>
                    </>
                )}
            </section>

            <CompactKpiGrid items={compactKpis} columns={4} label="Wskaźniki" />

            <DenseTwoCol
                left={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="Płace nominalne · CPI · realne"
                        subtitle="r/r % · dodatnie realne = rosnąca siła nabywcza"
                        actions={<StaleBadge date={lastReal?.date ?? null} label="do" warnAfterMonths={4} />}
                    >
                        {realWages.length < 2 ? (
                            <div className="mk-skeleton h-[260px] w-full" />
                        ) : (
                            <InteractiveChart
                                data={realWages}
                                xKey="date"
                                height={260}
                                unit="%"
                                legend
                                showRange
                                initialRange="3L"
                                ranges={['1R', '3L', '5L', 'ALL']}
                                valueFormatter={(v) => formatDecimalPL(v, 1)}
                                xTickFormatter={monthTick}
                                referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                series={[
                                    { key: 'nominal', name: 'Płace nominalne', color: '#16A34A', type: 'line', strokeWidth: 2 },
                                    { key: 'cpi', name: 'Inflacja CPI', color: '#D97706', type: 'line', strokeWidth: 2, dashed: true },
                                    { key: 'real', name: 'Płace realne', color: '#2563EB', type: 'area', strokeWidth: 2.5 },
                                ]}
                            />
                        )}
                    </SectionCard>
                }
                right={
                    <RelatedNews
                        topic="praca"
                        limit={5}
                        title="Powiązane newsy"
                        matchTier="strong"
                        excludeOpinion
                    />
                }
            />

            <DenseTwoCol
                left={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="Bezrobocie rejestrowane — mapa"
                        subtitle="GUS BDL · kliknij województwo"
                        actions={<StaleBadge date={mapDate} label="GUS do" warnAfterMonths={4} />}
                    >
                        {regQ.isLoading ? (
                            <div className="mk-skeleton h-[240px] w-full" />
                        ) : (
                            <div className="max-h-[280px] overflow-hidden [&_svg]:max-h-[270px]">
                                <PolandMap
                                    regions={regions}
                                    national={national}
                                    selectedRegion={selected}
                                    onRegionSelect={setSelected}
                                />
                            </div>
                        )}
                    </SectionCard>
                }
                right={
                    <>
                        <SectionCard
                            editorial
                            titleVariant="label"
                            title={selectedRegion ? woj(selectedRegion.name) : 'Województwo'}
                            padded
                        >
                            {selectedRegion ? (
                                <dl className="space-y-2.5 text-sm">
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Bezrobocie</dt>
                                        <dd className="font-semibold tnum">
                                            {selectedRegion.unemployment != null
                                                ? `${formatDecimalPL(selectedRegion.unemployment, 1)}%`
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Płace brutto</dt>
                                        <dd className="font-semibold tnum">
                                            {selectedRegion.wages != null
                                                ? `${formatNumber(selectedRegion.wages, 0)} zł`
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Płace r/r</dt>
                                        <dd className="font-semibold tnum">
                                            {selectedRegion.wagesYoY != null
                                                ? `${formatDecimalPL(selectedRegion.wagesYoY, 1)}%`
                                                : '—'}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-mk-faint">
                                    Kliknij region na mapie, aby zobaczyć szczegóły.
                                </p>
                            )}
                        </SectionCard>

                        <SectionCard
                            editorial
                            titleVariant="label"
                            title="Ranking województw"
                            subtitle="bezrobocie · płace"
                            padded
                        >
                            {regQ.isLoading ? (
                                <div className="mk-skeleton h-[180px] w-full" />
                            ) : (
                                <DataTable
                                    columns={cols}
                                    rows={regions}
                                    initialSort="unemp"
                                    initialDir="desc"
                                    maxHeight={200}
                                    rowKey={(r) => r.slug}
                                    onRowClick={(r) => setSelected(r.slug)}
                                />
                            )}
                        </SectionCard>
                    </>
                }
            />

            <DenseTwoCol
                left={
                    <SectionCard editorial titleVariant="label" title="Zatrudnienie i wakaty" padded>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-2">
                                <dt className="flex items-center gap-1.5 text-mk-muted">
                                    <Briefcase size={13} /> Zatrudnienie
                                </dt>
                                <dd className="text-right font-semibold tnum">
                                    {zLast ? `${formatDecimalPL(zLast.value / 1e3, 1)} tys. etatów` : '—'}
                                    {zatrDeltaTys != null && (
                                        <span className="mt-0.5 block text-xs font-medium text-mk-muted">
                                            {zatrDeltaTys > 0 ? '+' : ''}{formatDecimalPL(zatrDeltaTys, 1)} tys. m/m
                                        </span>
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2 border-t border-mk-border pt-3">
                                <dt className="flex items-center gap-1.5 text-mk-muted">
                                    <DoorOpen size={13} /> Wakaty
                                </dt>
                                <dd className="font-semibold tnum">
                                    {wLast ? `${formatDecimalPL(wLast.value, 1)} tys.` : '—'}
                                </dd>
                            </div>
                            {(zLast || wLast) && (
                                <p className="text-[11px] text-mk-faint">
                                    Sektor przedsiębiorstw
                                    {zLast ? ` · ${formatDataPeriod(zLast.date)}` : ''}
                                    {wLast ? ` · wakaty ${formatDataPeriod(wLast.date)}` : ''}
                                </p>
                            )}
                        </dl>
                    </SectionCard>
                }
                right={<PublicationDatesPanel count={4} variant="overview" />}
            />
        </DensePageLayout>
    );
}
