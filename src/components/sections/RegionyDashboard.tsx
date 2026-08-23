'use client';

import { useMemo, useState } from 'react';
import { MapPin, Users, Award, Scale, TrendingDown } from 'lucide-react';
import { useRegionalGus } from '@/lib/hooks';
import { formatNumber } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout, DenseThreeCol } from '@/components/ui/DensePageLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { Choropleth, type ChoroItem } from '@/components/ui/Choropleth';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { QueryState } from '@/components/ui/QueryState';

type MapView = 'pkb' | 'ludnosc';

const pln = (v: number) => `${formatNumber(v, 0)} zł`;
const mln = (v: number) => `${(v / 1e6).toFixed(2)} mln`;
const mln1 = (v: number) => `${(v / 1e6).toFixed(1)}`;
const woj = (name: string) => name.replace(/^województwo /i, '');

/** Gęsty dashboard regionów — PKB i ludność GUS BDL, mapa + tabela. */
export function RegionyDashboard() {
    const { data, isLoading, isError, refetch } = useRegionalGus();
    const [view, setView] = useState<MapView>('pkb');
    const [sel, setSel] = useState<string | null>(null);

    const regions = useMemo(() => data?.regions ?? [], [data?.regions]);
    const nat = data?.national;
    const byGdp = useMemo(() => [...regions].sort((a, b) => (b.gdpPerCapita ?? 0) - (a.gdpPerCapita ?? 0)), [regions]);
    const byPop = useMemo(() => [...regions].sort((a, b) => (b.population ?? 0) - (a.population ?? 0)), [regions]);
    const topGdp = byGdp[0] ?? null;
    const botGdp = byGdp.length ? byGdp[byGdp.length - 1] : null;
    const topPop = byPop[0] ?? null;
    const botPop = byPop.length ? byPop[byPop.length - 1] : null;
    const gdpRatio = topGdp?.gdpPerCapita && botGdp?.gdpPerCapita ? (topGdp.gdpPerCapita / botGdp.gdpPerCapita).toFixed(1) : null;
    const popRatio = topPop?.population && botPop?.population ? (topPop.population / botPop.population).toFixed(1) : null;

    const selected = regions.find((r) => r.slug === sel) ?? null;
    const isPkb = view === 'pkb';

    const mapItems: ChoroItem[] = isPkb
        ? regions.map((r) => ({ slug: r.slug, name: r.name, value: r.gdpPerCapita }))
        : regions.map((r) => ({ slug: r.slug, name: r.name, value: r.population }));

    const compactKpis = useMemo((): CompactKpiItem[] => [
        {
            key: 'top-gdp',
            label: 'Najbogatsze woj.',
            value: topGdp?.gdpPerCapita != null ? formatNumber(topGdp.gdpPerCapita, 0) : '—',
            unit: 'zł',
            icon: Award,
            footnote: topGdp ? woj(topGdp.name) : 'PKB/mieszk.',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
        {
            key: 'bot-gdp',
            label: 'Najbiedniejsze',
            value: botGdp?.gdpPerCapita != null ? formatNumber(botGdp.gdpPerCapita, 0) : '—',
            unit: 'zł',
            icon: TrendingDown,
            footnote: botGdp ? woj(botGdp.name) : 'PKB/mieszk.',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
        {
            key: 'top-pop',
            label: 'Najludniejsze',
            value: topPop?.population != null ? mln(topPop.population) : '—',
            icon: Users,
            footnote: topPop ? woj(topPop.name) : '',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
        {
            key: 'bot-pop',
            label: 'Najmniej ludne',
            value: botPop?.population != null ? mln(botPop.population) : '—',
            icon: Users,
            footnote: botPop ? woj(botPop.name) : '',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
        {
            key: 'pop-ratio',
            label: 'Rozpiętość ludności',
            value: popRatio ?? '—',
            unit: '×',
            icon: Scale,
            footnote: 'max / min województw',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
        {
            key: 'count',
            label: 'Województw',
            value: regions.length ? String(regions.length) : '—',
            icon: MapPin,
            footnote: '',
            loading: isLoading,
            error: isError,
            onRetry: () => { void refetch(); },
        },
    ], [topGdp, botGdp, topPop, botPop, popRatio, regions.length, isLoading, isError, refetch]);

    type Row = (typeof regions)[number];
    const cols: Column<Row>[] = isPkb
        ? [
            { key: 'name', header: 'Woj.', sortable: true, sortValue: (r) => r.name, render: (r) => woj(r.name) },
            { key: 'gdp', header: 'PKB/mieszk.', align: 'right', sortable: true, sortValue: (r) => r.gdpPerCapita ?? 0, render: (r) => r.gdpPerCapita != null ? formatNumber(r.gdpPerCapita, 0) : '—' },
            { key: 'pop', header: 'Ludność', align: 'right', sortable: true, sortValue: (r) => r.population ?? 0, render: (r) => r.population != null ? mln1(r.population) : '—' },
        ]
        : [
            { key: 'name', header: 'Woj.', sortable: true, sortValue: (r) => r.name, render: (r) => woj(r.name) },
            { key: 'pop', header: 'Ludność', align: 'right', sortable: true, sortValue: (r) => r.population ?? 0, render: (r) => r.population != null ? mln(r.population) : '—' },
            { key: 'gdp', header: 'PKB/mieszk.', align: 'right', sortable: true, sortValue: (r) => r.gdpPerCapita ?? 0, render: (r) => r.gdpPerCapita != null ? formatNumber(r.gdpPerCapita, 0) : '—' },
        ];

    return (
        <DensePageLayout>
            <EditorialHero
                ariaLabel="Regiony — najważniejszy wskaźnik"
                period={data?.gdpYear != null ? String(data.gdpYear) : null}
                source="GUS BDL · regiony"
                headline={nat?.gdpPerCapita != null ? 'PKB na mieszkańca — Polska' : 'Regiony'}
                description="Produkt krajowy brutto na mieszkańca (ceny bieżące) oraz zróżnicowanie regionalne wg województw."
                value={nat?.gdpPerCapita != null ? formatNumber(nat.gdpPerCapita, 0) : '—'}
                unit="zł"
                valueCaption={data ? `GUS BDL · PKB ${data.gdpYear} · ludność ${data.popYear}` : undefined}
                panelTitle="Skrajne województwa"
                rows={[
                    { label: topGdp ? `Najwyższe · ${woj(topGdp.name)}` : 'Najwyższe', value: topGdp?.gdpPerCapita != null ? pln(topGdp.gdpPerCapita) : '—' },
                    { label: botGdp ? `Najniższe · ${woj(botGdp.name)}` : 'Najniższe', value: botGdp?.gdpPerCapita != null ? pln(botGdp.gdpPerCapita) : '—' },
                    { label: 'Rozpiętość (max/min)', value: gdpRatio ? `${gdpRatio}×` : '—', divider: true },
                    { label: 'Ludność Polski', value: nat?.population != null ? mln(nat.population) : '—' },
                ]}
            />

            <CompactKpiGrid items={compactKpis} label="Wskaźniki uzupełniające" />

            <DenseThreeCol
                left={<RelatedNews topic="gospodarka" limit={3} title="Powiązane newsy" />}
                center={
                    <SectionCard
                        editorial
                        titleVariant="label"
                        title={isPkb ? 'PKB na mieszkańca — mapa' : 'Ludność — mapa województw'}
                        subtitle={isPkb ? `GUS BDL · zł/mieszkańca · ${data?.gdpYear ?? ''}` : `GUS BDL · mln · ${data?.popYear ?? ''}`}
                        actions={
                            <Segmented
                                value={view}
                                onChange={setView}
                                options={[
                                    { value: 'pkb', label: 'PKB' },
                                    { value: 'ludnosc', label: 'Ludność' },
                                ]}
                                aria-label="Widok mapy"
                            />
                        }
                    >
                        <QueryState
                            isLoading={isLoading}
                            isError={isError}
                            isEmpty={regions.length === 0}
                            onRetry={() => { void refetch(); }}
                            height={200}
                            emptyTitle="Brak danych regionalnych"
                        >
                            <div className="max-h-[220px] [&_svg]:max-h-[210px]">
                                <Choropleth
                                    items={mapItems}
                                    scheme={isPkb ? 'blue' : 'violet'}
                                    format={isPkb ? pln : (v) => `${formatNumber(v, 0)} os.`}
                                    labelFormat={isPkb ? (v) => `${Math.round(v / 1000)}k` : mln1}
                                    selected={sel}
                                    onSelect={setSel}
                                />
                            </div>
                        </QueryState>
                    </SectionCard>
                }
                right={
                    <>
                        <SectionCard editorial titleVariant="label" title={selected ? woj(selected.name) : 'Województwo'} padded>
                            {selected ? (
                                <dl className="space-y-2.5 text-sm">
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">PKB / mieszk.</dt>
                                        <dd className="font-semibold tnum">{selected.gdpPerCapita != null ? pln(selected.gdpPerCapita) : '—'}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">PKB łącznie</dt>
                                        <dd className="font-semibold tnum">{selected.gdpTotal != null ? `${formatNumber(selected.gdpTotal, 0)} mln zł` : '—'}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-mk-muted">Ludność</dt>
                                        <dd className="font-semibold tnum">{selected.population != null ? mln(selected.population) : '—'}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-mk-faint">Kliknij województwo na mapie.</p>
                            )}
                        </SectionCard>

                        <SectionCard
                            editorial
                            titleVariant="label"
                            title="Tabela województw"
                            subtitle={isPkb ? 'PKB na mieszkańca (zł)' : 'Liczba ludności'}
                            padded
                        >
                            <QueryState
                                isLoading={isLoading}
                                isError={isError}
                                isEmpty={regions.length === 0}
                                onRetry={() => { void refetch(); }}
                                height={160}
                                emptyTitle="Brak danych województw"
                            >
                                <DataTable
                                    columns={cols}
                                    rows={isPkb ? byGdp : byPop}
                                    initialSort={isPkb ? 'gdp' : 'pop'}
                                    initialDir="desc"
                                    maxHeight={180}
                                    rowKey={(r) => r.slug}
                                    onRowClick={(r) => setSel(r.slug)}
                                />
                            </QueryState>
                        </SectionCard>
                    </>
                }
            />

            <PublicationDatesPanel count={4} variant="overview" />

            <p className="text-center text-[11px] text-mk-faint">
                Źródło: GUS BDL · PKB {data?.gdpYear ?? '—'} · ludność {data?.popYear ?? '—'}
            </p>
        </DensePageLayout>
    );
}
