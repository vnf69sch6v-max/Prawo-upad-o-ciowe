'use client';

import { useState } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { MapPin, TrendingUp, Users, Scale, Award, Briefcase, Banknote, TrendingDown } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import { SmupExplorer } from '@/components/sections/smup-explorer';
import { useRegionalEU, useGusRegional } from '@/lib/hooks';
import { Choropleth, type ChoroItem } from '@/components/ui/Choropleth';
import { Heatmap } from '@/components/ui/Heatmap';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { formatNumber, formatDecimalPL } from '@/lib/formatters';

type Tab = 'pkb' | 'demografia' | 'praca' | 'samorzad';
const TABS: { value: Tab; label: string }[] = [
    { value: 'pkb', label: 'PKB regionalne' },
    { value: 'demografia', label: 'Demografia' },
    { value: 'praca', label: 'Rynek pracy' },
    { value: 'samorzad', label: 'Samorząd (SMUP)' },
];

const eur = (v: number) => `${formatNumber(v, 0)} EUR`;
const kEur = (v: number) => `${Math.round(v / 1000)}k`;
const mln = (v: number) => `${(v / 1e6).toFixed(2)} mln`;
const mln1 = (v: number) => `${(v / 1e6).toFixed(1)}`;

const BLUE = ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];
const VIOLET = ['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9'];
const AMBER = ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E'];
const GREEN = ['#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534'];
// timeline używa slugu bez łącznika dla warmińsko-mazurskiego → zmapuj na geo-slug Choropletha
const geoSlug = (s: string) => (s === 'warminskomazurskie' ? 'warminsko-mazurskie' : s);
const monthPL = (m: string) => { const [y, mm] = m.split('-'); return mm ? `${mm}.${y.slice(2)}` : m; };

// Ranking — poziome paski kolorowane wg pozycji w zakresie (generyczny: PKB, ludność, bezrobocie, płace)
function Ranking<T extends { slug: string; name: string }>({ rows, valueOf, format, colors, asc = false }: {
    rows: T[]; valueOf: (r: T) => number | null; format: (v: number) => string; colors: string[]; asc?: boolean;
}) {
    const vals = rows.map(valueOf).filter((v): v is number => v != null);
    const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
    const colorAt = (v: number) => colors[Math.min(colors.length - 1, Math.floor(((v - min) / (max - min || 1)) * colors.length))];
    const sorted = [...rows].filter((r) => valueOf(r) != null).sort((a, b) => asc ? (valueOf(a) ?? 0) - (valueOf(b) ?? 0) : (valueOf(b) ?? 0) - (valueOf(a) ?? 0));
    return (
        <div className="space-y-1.5">
            {sorted.map((r, i) => {
                const v = valueOf(r) as number;
                return (
                    <div key={r.slug} className="flex items-center gap-3 text-sm">
                        <span className="w-5 shrink-0 text-right text-xs text-mk-faint">{i + 1}</span>
                        <span className="w-40 shrink-0 truncate text-mk-text">{r.name}</span>
                        <span className="h-3 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-3 rounded-full" style={{ width: `${(v / max) * 100}%`, background: colorAt(v) }} /></span>
                        <span className="w-24 shrink-0 text-right font-semibold tnum text-mk-text">{format(v)}</span>
                    </div>
                );
            })}
        </div>
    );
}

function PkbRegionalne() {
    const { data, isLoading } = useRegionalEU();
    const [sel, setSel] = useState<string | null>(null);
    const regions = data?.regions ?? [];
    const nat = data?.national;
    const top = regions[0] ?? null;
    const bottom = regions.length ? regions[regions.length - 1] : null;
    const ratio = top?.gdpPerCapita && bottom?.gdpPerCapita ? (top.gdpPerCapita / bottom.gdpPerCapita).toFixed(1) : null;
    const items: ChoroItem[] = regions.map((r) => ({ slug: r.slug, name: r.name, value: r.gdpPerCapita }));

    if (isLoading) return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="mk-skeleton h-[420px]" /><div className="mk-skeleton h-[420px]" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="PKB / mieszkańca (kraj)" value={nat?.gdpPerCapita != null ? formatNumber(nat.gdpPerCapita, 0) : '—'} unit=" EUR" accent="blue" icon={MapPin} footnote={data ? `Eurostat · ${data.gdpYear}` : 'Eurostat'} />
                <KpiCard label="Najbogatsze woj." value={top?.gdpPerCapita != null ? formatNumber(top.gdpPerCapita, 0) : '—'} unit=" EUR" accent="green" icon={Award} footnote={top?.name} />
                <KpiCard label="Najbiedniejsze woj." value={bottom?.gdpPerCapita != null ? formatNumber(bottom.gdpPerCapita, 0) : '—'} unit=" EUR" accent="amber" icon={TrendingUp} footnote={bottom?.name} />
                <KpiCard label="Rozpiętość (max/min)" value={ratio ?? '—'} unit="×" accent="violet" icon={Scale} footnote="najbogatsze / najbiedniejsze" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="PKB na mieszkańca — mapa" subtitle="Eurostat · ceny bieżące · EUR/mieszkańca · najedź lub kliknij">
                    <Choropleth items={items} scheme="blue" format={eur} labelFormat={kEur} selected={sel} onSelect={setSel} />
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Ranking województw" subtitle="PKB na mieszkańca (EUR)"
                    actions={<CsvExport filename="pkb-regionalne" headers={['Województwo', 'PKB/mieszk EUR', 'PKB mln EUR', 'Ludność']} rows={regions.map((r) => [r.name, r.gdpPerCapita, r.gdpTotal, r.population])} />}>
                    <Ranking rows={regions} valueOf={(r) => r.gdpPerCapita} format={eur} colors={BLUE} />
                </SectionCard>
            </div>
        </div>
    );
}

function Demografia() {
    const { data, isLoading } = useRegionalEU();
    const [sel, setSel] = useState<string | null>(null);
    const regions = [...(data?.regions ?? [])].sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
    const nat = data?.national;
    const top = regions[0] ?? null;
    const items: ChoroItem[] = regions.map((r) => ({ slug: r.slug, name: r.name, value: r.population }));

    if (isLoading) return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="mk-skeleton h-[420px]" /><div className="mk-skeleton h-[420px]" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <KpiCard label="Ludność Polski" value={nat?.population != null ? mln(nat.population) : '—'} accent="violet" icon={Users} footnote={data ? `Eurostat · ${data.popYear}` : 'Eurostat'} />
                <KpiCard label="Najludniejsze woj." value={top?.population != null ? mln(top.population) : '—'} accent="blue" icon={Award} footnote={top?.name} />
                <KpiCard label="Województw" value={String(regions.length)} accent="slate" icon={MapPin} footnote="NUTS-2 (Mazowieckie łączone)" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="Ludność — mapa województw" subtitle="Eurostat · liczba ludności (mln) · najedź lub kliknij">
                    <Choropleth items={items} scheme="violet" format={(v) => `${formatNumber(v, 0)} os.`} labelFormat={mln1} selected={sel} onSelect={setSel} />
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Ranking województw" subtitle="Liczba ludności"
                    actions={<CsvExport filename="demografia" headers={['Województwo', 'Ludność']} rows={regions.map((r) => [r.name, r.population])} />}>
                    <Ranking rows={regions} valueOf={(r) => r.population} format={mln} colors={VIOLET} />
                </SectionCard>
            </div>
        </div>
    );
}

function RynekPracyRegionalny() {
    const { data, isLoading } = useGusRegional();
    const [view, setView] = useState<'bezrobocie' | 'place'>('bezrobocie');
    const [sel, setSel] = useState<string | null>(null);

    const timeline = data?.timeline ?? [];
    const regions = data?.regions ?? [];
    const nat = data?.national;
    const latest = timeline.length ? timeline[timeline.length - 1] : null;
    const nameBySlug = new Map(regions.map((r) => [r.slug, r.name]));
    // nazwa: po SUROWYM slugu timeline/regions (ten sam), geoSlug tylko dla mapy Choropletha
    const nameOf = (slug: string) => nameBySlug.get(slug) ?? slug;

    // Bezrobocie: najnowszy miesiąc timeline (świeże, rejestrowane)
    const unempItems: ChoroItem[] = latest ? Object.entries(latest.rates).map(([slug, v]) => ({ slug: geoSlug(slug), name: nameOf(slug), value: v })) : [];
    const withVal = unempItems.filter((i) => i.value != null);
    const hi = withVal.length ? withVal.reduce((a, b) => (b.value! > a.value! ? b : a)) : null;
    const lo = withVal.length ? withVal.reduce((a, b) => (b.value! < a.value! ? b : a)) : null;

    // Płace: roczne (sektor przedsiębiorstw) — jawnie z rokiem
    const wageItems: ChoroItem[] = regions.map((r) => ({ slug: r.slug, name: r.name, value: r.wages }));
    const wageRows = regions.map((r) => ({ slug: r.slug, name: r.name, value: r.wages }));
    const wageYear = String(regions[0]?.wagesSeries?.slice(-1)[0]?.year ?? '');
    const wageSorted = [...regions].filter((r) => r.wages != null).sort((a, b) => (b.wages ?? 0) - (a.wages ?? 0));
    const wageTop = wageSorted[0] ?? null, wageBot = wageSorted[wageSorted.length - 1] ?? null;

    // Heatmapa: województwo × miesiąc (bezrobocie w czasie)
    const heatSlugs = latest ? Object.keys(latest.rates).sort((a, b) => (latest.rates[b] ?? 0) - (latest.rates[a] ?? 0)) : [];
    const heatRows = heatSlugs.map((s) => ({ key: s, label: nameOf(s) }));
    const heatCols = timeline.map((t) => t.month);
    const byMonth = new Map(timeline.map((t) => [t.month, t.rates]));
    const rateAt = (slug: string, month: string) => byMonth.get(month)?.[slug] ?? null;

    if (isLoading) return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="mk-skeleton h-[420px]" /><div className="mk-skeleton h-[420px]" /></div>;

    const isU = view === 'bezrobocie';
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Segmented value={view} onChange={setView} options={[{ value: 'bezrobocie', label: 'Bezrobocie' }, { value: 'place', label: 'Płace' }]} aria-label="Widok rynku pracy" />
                <StaleBadge date={isU ? (latest?.month ?? null) : (wageYear || null)} label="GUS do" warnAfterMonths={isU ? 4 : 18} />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {isU ? (<>
                    <KpiCard label="Bezrobocie rej. — kraj" value={nat?.avgUnemployment != null ? formatDecimalPL(nat.avgUnemployment, 1) : '—'} unit="%" accent="amber" icon={Briefcase} footnote={latest ? `śr. województw · ${latest.month}` : 'GUS BDL'} />
                    <KpiCard label="Najwyższe bezrobocie" value={hi?.value != null ? formatDecimalPL(hi.value, 1) : '—'} unit="%" accent="rose" icon={TrendingUp} footnote={hi?.name} />
                    <KpiCard label="Najniższe bezrobocie" value={lo?.value != null ? formatDecimalPL(lo.value, 1) : '—'} unit="%" accent="green" icon={TrendingDown} footnote={lo?.name} />
                    <KpiCard label="Rozpiętość" value={hi?.value != null && lo?.value != null ? formatDecimalPL(hi.value - lo.value, 1) : '—'} unit="pp" accent="violet" icon={Scale} footnote="max − min województw" />
                </>) : (<>
                    <KpiCard label="Wynagrodzenie — kraj" value={nat?.avgWages != null ? formatNumber(nat.avgWages, 0) : '—'} unit=" zł" accent="green" icon={Banknote} footnote={`sektor przedsięb. · ${wageYear}`} />
                    <KpiCard label="Najwyższe" value={wageTop?.wages != null ? formatNumber(wageTop.wages, 0) : '—'} unit=" zł" accent="blue" icon={Award} footnote={wageTop?.name} />
                    <KpiCard label="Najniższe" value={wageBot?.wages != null ? formatNumber(wageBot.wages, 0) : '—'} unit=" zł" accent="amber" icon={TrendingDown} footnote={wageBot?.name} />
                    <KpiCard label="Rozpiętość (max/min)" value={wageTop?.wages && wageBot?.wages ? `${(wageTop.wages / wageBot.wages).toFixed(2)}` : '—'} unit="×" accent="violet" icon={Scale} footnote="najwyższe / najniższe" />
                </>)}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title={isU ? 'Stopa bezrobocia — mapa' : 'Przeciętne wynagrodzenie — mapa'}
                    subtitle={isU ? `GUS BDL · rejestrowane · ${latest?.month ?? ''} · najedź lub kliknij` : `GUS BDL · sektor przedsiębiorstw · ${wageYear} · najedź lub kliknij`}>
                    <Choropleth items={isU ? unempItems : wageItems} scheme={isU ? 'amber' : 'teal'}
                        format={isU ? (v) => `${formatDecimalPL(v, 1)}%` : (v) => `${formatNumber(v, 0)} zł`}
                        labelFormat={isU ? (v) => formatDecimalPL(v, 1) : (v) => `${Math.round(v / 1000)}k`} selected={sel} onSelect={setSel} />
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Ranking województw" subtitle={isU ? 'Stopa bezrobocia rejestrowanego (%, mniej = lepiej)' : `Przeciętne wynagrodzenie (zł, ${wageYear})`}
                    actions={<CsvExport filename={isU ? 'bezrobocie-woj' : 'place-woj'} headers={isU ? ['Województwo', 'Bezrobocie %'] : ['Województwo', 'Wynagrodzenie zł']} rows={(isU ? withVal.map((i) => [i.name, i.value]) : regions.map((r) => [r.name, r.wages]))} />}>
                    {isU
                        ? <Ranking rows={withVal.map((i) => ({ slug: i.slug, name: i.name, value: i.value! }))} valueOf={(r) => r.value} format={(v) => `${formatDecimalPL(v, 1)}%`} colors={AMBER} asc />
                        : <Ranking rows={wageRows} valueOf={(r) => r.value} format={(v) => `${formatNumber(v, 0)} zł`} colors={GREEN} />}
                </SectionCard>
            </div>

            {isU && heatCols.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Bezrobocie wg województw w czasie" subtitle="mapa ciepła województwo × miesiąc · stopa rejestrowana (%) · kliknij wiersz">
                    <Heatmap rows={heatRows} cols={heatCols} valueAt={rateAt} unit="%" colTickFormatter={monthPL} valueFormatter={(v) => formatDecimalPL(v, 1)} cellHeight={18} onRowClick={(s) => setSel(geoSlug(s))} />
                    <p className="mt-2 text-[11px] text-mk-faint">Ciemniejszy = wyższe bezrobocie. Widać stały gradient: najniżej Wielkopolskie/Śląskie/Mazowieckie, najwyżej Warmińsko-Mazurskie, Podkarpackie, Świętokrzyskie.</p>
                </SectionCard>
            )}

            <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Bezrobocie rejestrowane (GUS BDL)</span> — udział zarejestrowanych bezrobotnych; wyższe niż stopa BAEL (LFS, ~3% w /praca), bo liczy inaczej. Płace: sektor przedsiębiorstw, dane roczne.
            </div>
        </div>
    );
}

export default function RegionyPage() {
    const [tab, setTab] = useState<Tab>('pkb');
    useInitialTab(TABS.map((t) => t.value), setTab);
    return (
        <div className="mk-fade-in space-y-8">
            <PageHeader
                eyebrow={<PageEyebrow section="Regiony" />}
                title="Regiony"
                subtitle="PKB regionalne, demografia i usługi publiczne wg województw"
                actions={<Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja regionów" />}
            />

            <div key={tab} className="mk-fade-in">
                {tab === 'pkb' && <PkbRegionalne />}
                {tab === 'demografia' && <Demografia />}
                {tab === 'praca' && <RynekPracyRegionalny />}
                {tab === 'samorzad' && <SmupExplorer />}
            </div>
        </div>
    );
}
