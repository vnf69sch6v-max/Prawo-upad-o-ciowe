'use client';

import { useMemo, useState } from 'react';
import { Briefcase, Wallet, DoorOpen, TrendingUp, Scale, Percent, Users } from 'lucide-react';
import {
    useGusRegisteredUnemployment,
    useGusMonthly,
    useGusRegional,
    useBdlSeries,
} from '@/lib/hooks';
import { lastOf, deltaOf, monthTick, fmtPL } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDataPeriod, formatDataPeriodLabel } from '@/lib/formatters';
import { trendObservation, analyzeSeries, type Observation } from '@/lib/observations';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout, DenseThreeCol } from '@/components/ui/DensePageLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { ObservationsPanel } from '@/components/ui/ObservationsPanel';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { StaleBadge } from '@/components/ui/StaleBadge';
import PolandMap from '@/components/PolandMap';

const woj = (name: string) => name.replace(/^województwo /i, '');

/** Gęsty dashboard rynku pracy — bezrobocie GUS, płace GUS, zatrudnienie BDL. */
export function PracaDashboard() {
    const unempQ = useGusRegisteredUnemployment(24);
    const monthlyQ = useGusMonthly();
    const zatrQ = useBdlSeries(154348, 12);
    const wakQ = useBdlSeries(1653025, 1);
    const regQ = useGusRegional();
    const [selected, setSelected] = useState<string | null>(null);

    const unemp = useMemo(
        () => (unempQ.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })),
        [unempQ.data],
    );
    const wages = useMemo(() => monthlyQ.data?.wages ?? [], [monthlyQ.data?.wages]);
    const lastWage = wages.length ? wages[wages.length - 1] : null;
    const zatr = zatrQ.data?.series ?? [];
    const zLast = zatr.length ? zatr[zatr.length - 1] : null;
    const wLast = (wakQ.data?.series ?? []).at(-1) ?? null;

    const regions = regQ.data?.regions ?? [];
    const national = regQ.data?.national ?? { avgUnemployment: null, avgWages: null };
    const selectedRegion = regions.find((r) => r.slug === selected) ?? null;

    const withUnemp = regions.filter((r) => r.unemployment != null);
    const hi = withUnemp.length ? withUnemp.reduce((a, b) => ((b.unemployment ?? 0) > (a.unemployment ?? 0) ? b : a)) : null;
    const lo = withUnemp.length ? withUnemp.reduce((a, b) => ((b.unemployment ?? 0) < (a.unemployment ?? 0) ? b : a)) : null;
    const spread = hi?.unemployment != null && lo?.unemployment != null ? hi.unemployment - lo.unemployment : null;

    const zatrDeltaMln = zatr.length > 1
        ? +((zatr[zatr.length - 1].value - zatr[zatr.length - 2].value) / 1e6).toFixed(2)
        : null;

    const dataDate = unemp.length ? unemp[unemp.length - 1].date : '';

    // ── Hero „redakcyjny" — WYŁĄCZNIE realne dane GUS (bezrobocie rejestrowane) ──
    const heroU = lastOf(unemp);
    const heroUDelta = deltaOf(unemp);
    const heroPeriod = dataDate ? formatDataPeriod(dataDate) : null;
    const heroHeadline = heroU == null ? 'Rynek pracy'
        : heroUDelta != null && heroUDelta > 0.05 ? 'Bezrobocie rośnie'
        : heroUDelta != null && heroUDelta < -0.05 ? 'Bezrobocie spada'
        : 'Bezrobocie rejestrowane';

    const hiUnemp = hi?.unemployment ?? null;
    const hiName = hi?.name ?? '';
    const loName = lo?.name ?? '';

    const compactKpis: CompactKpiItem[] = [
        {
            key: 'wak',
            label: 'Wakaty',
            value: wLast ? formatDecimalPL(wLast.value, 1) : '—',
            unit: 'tys.',
            icon: DoorOpen,
            footnote: 'kw.',
            loading: wakQ.isLoading,
        },
        {
            key: 'unemp-d',
            label: 'Bezrob. Δ m/m',
            value: deltaOf(unemp) != null ? `${deltaOf(unemp)! > 0 ? '+' : ''}${formatDecimalPL(deltaOf(unemp)!, 1)}` : '—',
            unit: 'pp',
            icon: Percent,
            delta: deltaOf(unemp) != null ? { value: deltaOf(unemp)!, unit: 'pp', invert: true } : undefined,
            footnote: 'rejestrowane · kraj',
            loading: unempQ.isLoading,
        },
        {
            key: 'wage-yoy',
            label: 'Płace r/r',
            value: lastWage ? formatDecimalPL(lastWage.value, 1) : '—',
            unit: '%',
            icon: Wallet,
            delta: lastWage ? { value: lastWage.value, unit: 'pct' } : undefined,
            footnote: lastWage?.date ?? '',
            loading: monthlyQ.isLoading,
        },
        {
            key: 'zatr-d',
            label: 'Zatrudn. Δ m/m',
            value: zatrDeltaMln != null ? `${zatrDeltaMln > 0 ? '+' : ''}${formatDecimalPL(zatrDeltaMln, 2)}` : '—',
            unit: 'mln',
            icon: Briefcase,
            footnote: 'sektor przedsiębiorstw',
            loading: zatrQ.isLoading,
        },
        {
            key: 'hi-u',
            label: 'Max bezrobocie',
            value: hiUnemp != null ? formatDecimalPL(hiUnemp, 1) : '—',
            unit: '%',
            icon: TrendingUp,
            footnote: hiName ? woj(hiName) : 'woj.',
            loading: regQ.isLoading,
        },
        {
            key: 'spread',
            label: 'Rozpiętość woj.',
            value: spread != null ? formatDecimalPL(spread, 1) : '—',
            unit: 'pp',
            icon: Scale,
            footnote: loName && hiName ? `${woj(loName).slice(0, 10)} – ${woj(hiName).slice(0, 10)}` : 'max − min',
            loading: regQ.isLoading,
        },
    ];

    const observations = useMemo<Observation[]>(() => {
        const out: Observation[] = [];
        const push = (o: Observation | null) => { if (o) out.push(o); };
        push(trendObservation('Bezrobocie rejestrowane', unemp.map((d) => d.value), true));
        push(trendObservation('Płace nominalne', wages.map((w) => w.value), false));
        out.push(...analyzeSeries('Bezrobocie', unemp.map((d) => d.value), { goodDown: true, unit: '%', decimals: 1 }).slice(0, 2));
        const u = lastOf(unemp);
        if (u != null) out.push({ text: `Stopa bezrobocia rejestrowanego: ${fmtPL(u)}% (GUS BDL)`, tone: u > 6 ? 'warn' : 'neutral' });
        return out.slice(0, 4);
    }, [unemp, wages]);

    const cols: Column<(typeof regions)[number]>[] = [
        { key: 'name', header: 'Woj.', sortable: true, sortValue: (r) => r.name, render: (r) => woj(r.name) },
        { key: 'unemp', header: 'Bezrob.', align: 'right', sortable: true, sortValue: (r) => r.unemployment ?? 0, render: (r) => r.unemployment != null ? `${formatDecimalPL(r.unemployment, 1)}%` : '—' },
        { key: 'wages', header: 'Płace', align: 'right', sortable: true, sortValue: (r) => r.wages ?? 0, render: (r) => r.wages != null ? formatNumber(r.wages, 0) : '—' },
    ];

    return (
        <DensePageLayout>
            <EditorialHero
                ariaLabel="Rynek pracy — najważniejszy odczyt"
                period={heroPeriod}
                source="GUS · rynek pracy"
                headline={heroHeadline}
                description={
                    <>
                        Stopa bezrobocia rejestrowanego w urzędach pracy wynosi {heroU != null ? fmtPL(heroU) : '—'}% (GUS BDL).
                        {lastWage != null && ` Przeciętne wynagrodzenie brutto rośnie o ${formatDecimalPL(lastWage.value, 1)}% r/r.`}
                    </>
                }
                value={heroU != null ? fmtPL(heroU) : '—'}
                unit="%"
                delta={heroUDelta}
                panelTitle="Rynek pracy — skrót"
                rows={[
                    { label: 'Przeciętne wynagrodzenie', value: lastWage ? `${formatNumber(lastWage.raw, 0)} zł` : '—' },
                    { label: 'Płace r/r', value: lastWage ? `${lastWage.value > 0 ? '+' : ''}${formatDecimalPL(lastWage.value, 1)}%` : '—' },
                    { label: 'Przeciętne zatrudnienie', value: zLast ? `${formatDecimalPL(zLast.value / 1e6, 2)} mln` : '—' },
                    { label: 'Wakaty', value: wLast ? `${formatDecimalPL(wLast.value, 1)} tys.` : '—', divider: true },
                ]}
            />

            <CompactKpiGrid items={compactKpis} label="Wskaźniki uzupełniające" />

            <DenseThreeCol
                left={<RelatedNews topic="praca" limit={3} title="Powiązane newsy" matchTier="strong" excludeOpinion />}
                center={
                    <>
                        <SectionCard
                            editorial
                            titleVariant="label"
                            title="Bezrobocie rejestrowane — mapa"
                            subtitle="GUS BDL · kliknij województwo"
                            actions={
                                <StaleBadge date={dataDate || null} label="GUS do" warnAfterMonths={4} />
                            }
                        >
                            {regQ.isLoading ? (
                                <div className="mk-skeleton h-[200px] w-full" />
                            ) : (
                                <div className="max-h-[220px] overflow-hidden [&_svg]:max-h-[210px]">
                                    <PolandMap regions={regions} national={national} selectedRegion={selected} onRegionSelect={setSelected} />
                                </div>
                            )}
                        </SectionCard>

                        {unemp.length > 1 && (
                            <SectionCard editorial titleVariant="label" title="Trend bezrobocia — kraj" subtitle="GUS BDL · stopa rejestrowana (%)">
                                <InteractiveChart
                                    data={unemp}
                                    xKey="date"
                                    height={180}
                                    unit="%"
                                    showRange
                                    initialRange="3L"
                                    ranges={['1R', '3L', 'ALL']}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)}
                                    xTickFormatter={monthTick}
                                    series={[{ key: 'value', name: 'Bezrobocie', color: '#2563EB', type: 'area', strokeWidth: 2 }]}
                                />
                            </SectionCard>
                        )}
                    </>
                }
                right={
                    <>
                        <SectionCard editorial titleVariant="label" title={selectedRegion ? woj(selectedRegion.name) : 'Województwo'} padded>
                            {selectedRegion ? (
                                <dl className="space-y-2.5 text-sm">
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Bezrobocie</dt>
                                        <dd className="font-semibold tnum">{selectedRegion.unemployment != null ? `${formatDecimalPL(selectedRegion.unemployment, 1)}%` : '—'}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Płace brutto</dt>
                                        <dd className="font-semibold tnum">{selectedRegion.wages != null ? `${formatNumber(selectedRegion.wages, 0)} zł` : '—'}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Płace r/r</dt>
                                        <dd className="font-semibold tnum">{selectedRegion.wagesYoY != null ? `${formatDecimalPL(selectedRegion.wagesYoY, 1)}%` : '—'}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-mk-faint">Kliknij region na mapie, aby zobaczyć szczegóły.</p>
                            )}
                        </SectionCard>

                        <SectionCard editorial titleVariant="label" title="Ranking województw" subtitle="bezrobocie · płace" padded>
                            {regQ.isLoading ? (
                                <div className="mk-skeleton h-[160px] w-full" />
                            ) : (
                                <DataTable
                                    columns={cols}
                                    rows={regions}
                                    initialSort="unemp"
                                    initialDir="desc"
                                    maxHeight={180}
                                    rowKey={(r) => r.slug}
                                    onRowClick={(r) => setSelected(r.slug)}
                                />
                            )}
                        </SectionCard>

                        <SectionCard editorial titleVariant="label" title="Średnie krajowe" padded>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between gap-2">
                                    <dt className="flex items-center gap-1.5 text-mk-muted"><Users size={13} /> Bezrobocie śr.</dt>
                                    <dd className="font-semibold tnum">{national.avgUnemployment != null ? `${formatDecimalPL(national.avgUnemployment, 1)}%` : '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <dt className="flex items-center gap-1.5 text-mk-muted"><Wallet size={13} /> Płace śr.</dt>
                                    <dd className="font-semibold tnum">{national.avgWages != null ? `${formatNumber(national.avgWages, 0)} zł` : '—'}</dd>
                                </div>
                            </dl>
                        </SectionCard>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ObservationsPanel items={observations} variant="overview" />
                <PublicationDatesPanel count={4} variant="overview" />
            </div>

            {dataDate && (
                <p className="text-center text-[11px] text-mk-faint">
                    Okres referencyjny: {formatDataPeriodLabel(dataDate)} · wyłącznie źródła GUS
                </p>
            )}
        </DensePageLayout>
    );
}
