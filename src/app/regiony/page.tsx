'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, Users, Scale, Award } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import { SmupExplorer } from '@/components/sections/smup-explorer';
import { useRegionalEU, type RegionalEURow } from '@/lib/hooks';
import { Choropleth, type ChoroItem } from '@/components/ui/Choropleth';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { formatNumber } from '@/lib/formatters';

type Tab = 'pkb' | 'demografia' | 'samorzad';
const TABS: { value: Tab; label: string }[] = [
    { value: 'pkb', label: 'PKB regionalne' },
    { value: 'demografia', label: 'Demografia' },
    { value: 'samorzad', label: 'Samorząd (SMUP)' },
];

const eur = (v: number) => `${formatNumber(v, 0)} EUR`;
const kEur = (v: number) => `${Math.round(v / 1000)}k`;
const mln = (v: number) => `${(v / 1e6).toFixed(2)} mln`;
const mln1 = (v: number) => `${(v / 1e6).toFixed(1)}`;

const BLUE = ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];
const VIOLET = ['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9'];

// Ranking — poziome paski kolorowane wg pozycji w zakresie
function Ranking({ rows, valueOf, format, colors }: {
    rows: RegionalEURow[]; valueOf: (r: RegionalEURow) => number | null; format: (v: number) => string; colors: string[];
}) {
    const vals = rows.map(valueOf).filter((v): v is number => v != null);
    const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
    const colorAt = (v: number) => colors[Math.min(colors.length - 1, Math.floor(((v - min) / (max - min || 1)) * colors.length))];
    const sorted = [...rows].filter((r) => valueOf(r) != null).sort((a, b) => (valueOf(b) ?? 0) - (valueOf(a) ?? 0));
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
                <SectionCard title="PKB na mieszkańca — mapa" subtitle="Eurostat · ceny bieżące · EUR/mieszkańca · najedź lub kliknij">
                    <Choropleth items={items} scheme="blue" format={eur} labelFormat={kEur} selected={sel} onSelect={setSel} />
                </SectionCard>
                <SectionCard title="Ranking województw" subtitle="PKB na mieszkańca (EUR)"
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
                <SectionCard title="Ludność — mapa województw" subtitle="Eurostat · liczba ludności (mln) · najedź lub kliknij">
                    <Choropleth items={items} scheme="violet" format={(v) => `${formatNumber(v, 0)} os.`} labelFormat={mln1} selected={sel} onSelect={setSel} />
                </SectionCard>
                <SectionCard title="Ranking województw" subtitle="Liczba ludności"
                    actions={<CsvExport filename="demografia" headers={['Województwo', 'Ludność']} rows={regions.map((r) => [r.name, r.population])} />}>
                    <Ranking rows={regions} valueOf={(r) => r.population} format={mln} colors={VIOLET} />
                </SectionCard>
            </div>
        </div>
    );
}

export default function RegionyPage() {
    const [tab, setTab] = useState<Tab>('pkb');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Regiony</h1>
                    <p className="mt-1 text-sm text-mk-muted">PKB regionalne, demografia i usługi publiczne wg województw</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja regionów" />
            </div>

            {tab === 'pkb' && <PkbRegionalne />}
            {tab === 'demografia' && <Demografia />}
            {tab === 'samorzad' && <SmupExplorer />}
        </div>
    );
}
