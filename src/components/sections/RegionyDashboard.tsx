'use client';

import { useMemo, useState } from 'react';
import { MapPin, Users, Award, Scale, TrendingDown } from 'lucide-react';
import { useRegionalGus } from '@/lib/hooks';
import { formatNumber } from '@/lib/formatters';
import { type Observation } from '@/lib/observations';
import { Segmented } from '@/components/ui/Segmented';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { DensePageLayout } from '@/components/ui/DensePageLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { ObservationsPanel } from '@/components/ui/ObservationsPanel';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { Choropleth, type ChoroItem } from '@/components/ui/Choropleth';
import { RankingBars } from '@/components/ui/RankingBars';

type MapView = 'pkb' | 'ludnosc';

const pln = (v: number) => `${formatNumber(v, 0)} zł`;
const mln = (v: number) => `${(v / 1e6).toFixed(2)} mln`;
const mln1 = (v: number) => `${(v / 1e6).toFixed(1)}`;
const woj = (name: string) => name.replace(/^województwo /i, '');

/** Gęsty dashboard regionów — PKB i ludność GUS BDL, mapa + tabela. */
export function RegionyDashboard() {
    const { data, isLoading } = useRegionalGus();
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
        },
        {
            key: 'bot-gdp',
            label: 'Najbiedniejsze',
            value: botGdp?.gdpPerCapita != null ? formatNumber(botGdp.gdpPerCapita, 0) : '—',
            unit: 'zł',
            icon: TrendingDown,
            footnote: botGdp ? woj(botGdp.name) : 'PKB/mieszk.',
            loading: isLoading,
        },
        {
            key: 'top-pop',
            label: 'Najludniejsze',
            value: topPop?.population != null ? mln(topPop.population) : '—',
            icon: Users,
            footnote: topPop ? woj(topPop.name) : '',
            loading: isLoading,
        },
        {
            key: 'bot-pop',
            label: 'Najmniej ludne',
            value: botPop?.population != null ? mln(botPop.population) : '—',
            icon: Users,
            footnote: botPop ? woj(botPop.name) : '',
            loading: isLoading,
        },
        {
            key: 'pop-ratio',
            label: 'Rozpiętość ludności',
            value: popRatio ?? '—',
            unit: '×',
            icon: Scale,
            footnote: 'max / min województw',
            loading: isLoading,
        },
        {
            key: 'count',
            label: 'Województw',
            value: regions.length ? String(regions.length) : '—',
            icon: MapPin,
            footnote: '',
            loading: isLoading,
        },
    ], [topGdp, botGdp, topPop, botPop, popRatio, regions.length, isLoading]);

    const observations: Observation[] = [];
    if (topGdp?.gdpPerCapita && botGdp?.gdpPerCapita) {
        observations.push({
            text: `Rozpiętość PKB/mieszk.: ${pln(topGdp.gdpPerCapita)} (${woj(topGdp.name)}) vs ${pln(botGdp.gdpPerCapita)} (${woj(botGdp.name)}) — ${gdpRatio}×`,
            tone: 'neutral',
        });
    }
    if (topPop?.population) {
        observations.push({
            text: `Najludniejsze: ${woj(topPop.name)} (${mln(topPop.population)}), ${popRatio}× więcej niż ${botPop ? woj(botPop.name) : 'najmniejsze'}`,
            tone: 'neutral',
        });
    }
    if (nat?.gdpPerCapita) {
        observations.push({ text: `PKB na mieszkańca w kraju: ${pln(nat.gdpPerCapita)} (GUS BDL · ${data?.gdpYear ?? ''})`, tone: 'neutral' });
    }
    if (nat?.population) {
        observations.push({ text: `Ludność Polski: ${mln(nat.population)} (GUS BDL · ${data?.popYear ?? ''})`, tone: 'neutral' });
    }

    const RANK_BLUE = ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];
    const RANK_VIOLET = ['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9'];

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

            {/* Poniżej lg: ranking przed mapą (16 woj. ≈ 40px — etykiety nieczytelne). Desktop: news | mapa | ranking. */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
                <div className="order-1 min-w-0 lg:order-1 lg:col-span-3">
                    <RelatedNews topic="gospodarka" limit={3} title="Powiązane newsy" />
                </div>
                <div className="order-3 min-w-0 space-y-4 lg:order-2 lg:col-span-5" data-region-map>
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
                        {isLoading ? (
                            <div className="mk-skeleton h-[200px] w-full" />
                        ) : (
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
                        )}
                    </SectionCard>
                </div>
                <div className="order-2 min-w-0 space-y-4 lg:order-3 lg:col-span-4">
                    {selected ? (
                        <SectionCard editorial titleVariant="label" title={woj(selected.name)} padded>
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
                        </SectionCard>
                    ) : (
                        <SectionCard editorial titleVariant="label" title="Województwo" padded className="hidden lg:block">
                            <p className="text-sm text-mk-faint">Kliknij województwo na mapie.</p>
                        </SectionCard>
                    )}

                    <SectionCard
                        editorial
                        titleVariant="label"
                        title="Ranking województw"
                        subtitle={isPkb ? 'PKB na mieszkańca (zł)' : 'Liczba ludności'}
                        padded
                        className="min-w-0"
                    >
                        <div data-region-ranking>
                            {isLoading ? (
                                <div className="mk-skeleton h-[160px] w-full" />
                            ) : (
                                <RankingBars
                                    rows={isPkb ? byGdp : byPop}
                                    valueOf={(r) => (isPkb ? r.gdpPerCapita : r.population)}
                                    format={isPkb ? (v) => formatNumber(v, 0) : mln}
                                    colors={isPkb ? RANK_BLUE : RANK_VIOLET}
                                    selected={sel}
                                    onSelect={setSel}
                                />
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ObservationsPanel items={observations.slice(0, 4)} variant="overview" />
                <PublicationDatesPanel count={4} variant="overview" />
            </div>

            <p className="text-center text-[11px] text-mk-faint">
                Źródło: GUS BDL · PKB {data?.gdpYear ?? '—'} · ludność {data?.popYear ?? '—'}
            </p>
        </DensePageLayout>
    );
}
