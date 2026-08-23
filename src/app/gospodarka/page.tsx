'use client';

import { useState, useMemo, useCallback } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { Factory, HardHat, ShoppingCart, Truck, Radio, Info, Grid3x3 } from 'lucide-react';
import { useKoniunktura } from '@/lib/hooks';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { Heatmap } from '@/components/ui/Heatmap';
import { Sparkline } from '@/components/ui/Sparkline';
import { Drawer } from '@/components/ui/Drawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { InsightBar } from '@/components/ui/InsightBar';
import { analyzeSeries } from '@/lib/observations';
import { GospodarkaAktywnosc } from '@/components/sections/GospodarkaAktywnosc';
import { RzadyGospodarka } from '@/components/sections/RzadyGospodarka';
import { KorelacjeMakro } from '@/components/sections/KorelacjeMakro';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

type Tab = 'aktywnosc' | 'koniunktura' | 'finanse' | 'korelacje';
const TABS: { value: Tab; label: string }[] = [
    { value: 'aktywnosc', label: 'PKB i aktywność' },
    { value: 'koniunktura', label: 'Koniunktura' },
    { value: 'finanse', label: 'Finanse publiczne' },
    { value: 'korelacje', label: 'Zależności' },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const SECTOR_META: Record<string, { color: string; accent: AccentKey; icon: typeof Factory }> = {
    przetworstwo: { color: '#2563EB', accent: 'blue', icon: Factory },
    budownictwo: { color: '#D97706', accent: 'amber', icon: HardHat },
    handel: { color: '#16A34A', accent: 'green', icon: ShoppingCart },
    transport: { color: '#0891B2', accent: 'cyan', icon: Truck },
    ikt: { color: '#7C3AED', accent: 'violet', icon: Radio },
};

const SECTOR_INFO: Record<string, string> = {
    przetworstwo: 'Przemysł przetwórczy — nastroje zależą od zamówień krajowych i eksportowych, kosztów energii i surowców. Barometr kondycji fabryk i eksportu.',
    budownictwo: 'Budownictwo — silnie cykliczne, wrażliwe na stopy procentowe (kredyty i inwestycje), wydatki publiczne i ceny materiałów.',
    handel: 'Handel detaliczny — odzwierciedla popyt konsumencki, siłę nabywczą płac realnych i nastroje gospodarstw domowych.',
    transport: 'Transport i magazyny — powiązany z wolumenem handlu i eksportu, cenami paliw oraz aktywnością przemysłu (logistyka).',
    ikt: 'Informacja i komunikacja — usługi cyfrowe; zwykle najbardziej optymistyczny i najmniej cykliczny sektor, napędzany transformacją cyfrową.',
};

interface SectorRow { key: string; name: string; latest: number | null; delta: number | null; history: (number | null)[] }

function KoniunkturaSection() {
    const q = useKoniunktura();
    const trend = useMemo(() => q.data?.trend ?? [], [q.data]);
    const sectors = useMemo(() => q.data?.sectors ?? [], [q.data]);
    const latest = q.data?.latest ?? null;
    const prev = trend.length > 1 ? trend[trend.length - 2] : null;
    const dataDate = latest?.date ?? null;

    const heatRows = useMemo(() => sectors.map((s) => ({ key: s.key, label: s.name })), [sectors]);
    const heatCols = useMemo(() => trend.map((t) => t.date as string), [trend]);
    const heatValue = useCallback((key: string, date: string) => {
        const v = trend.find((t) => t.date === date)?.[key];
        return typeof v === 'number' ? v : null;
    }, [trend]);

    const rows: SectorRow[] = useMemo(() => sectors.map((s) => {
        const cur = latest?.sectors.find((x) => x.name === s.name)?.value ?? null;
        const pv = prev?.[s.key];
        return {
            key: s.key, name: s.name, latest: cur,
            delta: typeof pv === 'number' && cur != null ? +(cur - pv).toFixed(1) : null,
            history: trend.map((t) => (typeof t[s.key] === 'number' ? (t[s.key] as number) : null)),
        };
    }), [sectors, latest, prev, trend]);

    // Auto-analiza: najmocniejszy sygnał z każdego sektora → ≤4 najistotniejsze.
    const insights = useMemo(() => {
        const all = sectors.flatMap((s) => analyzeSeries(s.name, trend.map((t) => (typeof t[s.key] === 'number' ? (t[s.key] as number) : null)), { unit: 'pkt', decimals: 0 }).slice(0, 1));
        return all.slice(0, 4);
    }, [sectors, trend]);

    const [selKey, setSelKey] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const openSector = (key: string) => { setSelKey(key); setOpen(true); };
    const sel = selKey ? rows.find((r) => r.key === selKey) ?? null : null;
    const selColor = sel ? SECTOR_META[sel.key]?.color ?? '#2563EB' : '#2563EB';
    const selChart = useMemo(() => (sel ? trend.map((t) => ({ date: t.date as string, value: typeof t[sel.key] === 'number' ? (t[sel.key] as number) : null })) : []), [sel, trend]);

    const cols: Column<SectorRow>[] = [
        { key: 'name', header: 'Sektor', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium text-mk-text">{r.name}</span> },
        { key: 'latest', header: 'Saldo', align: 'right', sortable: true, sortValue: (r) => r.latest ?? -999, render: (r) => <span style={{ color: (r.latest ?? 0) >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{r.latest != null ? `${r.latest > 0 ? '+' : ''}${formatDecimalPL(r.latest, 1)}` : '—'}</span> },
        { key: 'delta', header: 'Δ m/m', align: 'right', sortable: true, sortValue: (r) => r.delta ?? -999, render: (r) => r.delta != null ? <span style={{ color: r.delta >= 0 ? '#16A34A' : '#DC2626' }}>{r.delta > 0 ? '+' : ''}{formatDecimalPL(r.delta, 1)}</span> : '—' },
        { key: 'trend', header: 'Trend 18M', align: 'center', render: (r) => <Sparkline data={r.history} color={SECTOR_META[r.key]?.color} /> },
    ];

    const processed = rows.find((r) => r.key === 'przetworstwo') ?? rows[0] ?? null;
    const heroVal = processed?.latest ?? null;
    const heroDelta = processed?.delta ?? null;
    const heroPeriod = dataDate ? formatDataPeriod(dataDate) : null;
    const heroHeadline = heroVal == null ? 'Koniunktura'
        : heroVal > 0 ? 'Przewaga optymizmu'
        : heroVal < 0 ? 'Przewaga pesymizmu'
        : 'Koniunktura neutralna';

    return (
        <div className="space-y-6">
            <EditorialHero
                ariaLabel="Koniunktura — najważniejszy odczyt"
                period={heroPeriod}
                source="GUS · badanie koniunktury"
                headline={heroHeadline}
                description={
                    <>
                        Saldo nastrojów w przetwórstwie wynosi {heroVal != null ? `${heroVal > 0 ? '+' : ''}${formatDecimalPL(heroVal, 1)}` : '—'} pkt (GUS).
                        Dodatnie saldo oznacza przewagę optymizmu przedsiębiorców.
                    </>
                }
                value={heroVal != null ? `${heroVal > 0 ? '+' : ''}${formatDecimalPL(heroVal, 1)}` : '—'}
                unit="pkt"
                delta={heroDelta}
                valueCaption="Przetwórstwo · saldo ocen"
                panelTitle="Sektory"
                rows={rows.map((r, i) => ({
                    label: r.name,
                    value: r.latest != null ? `${r.latest > 0 ? '+' : ''}${formatDecimalPL(r.latest, 1)} pkt` : '—',
                    divider: i === 1,
                }))}
            />

            <section>
                <h2 className="mk-section-label mb-3">Nastroje sektorów</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {sectors.map((s) => {
                    const v = latest?.sectors.find((x) => x.name === s.name)?.value ?? null;
                    const pv = prev?.[s.key];
                    const d = typeof pv === 'number' && v != null ? +(v - pv).toFixed(1) : null;
                    const meta = SECTOR_META[s.key] ?? { color: '#64748B', accent: 'slate' as AccentKey, icon: Factory };
                    return (
                        <KpiCard key={s.key} label={s.name} value={v != null ? `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}` : '—'} unit="pkt"
                            accent={v != null && v >= 0 ? 'green' : 'rose'} icon={meta.icon}
                            delta={d != null ? { value: d, unit: 'none' } : undefined}
                            footnote={latest ? `GUS · ${latest.date}` : 'GUS'} loading={q.isLoading} />
                    );
                })}
                </div>
            </section>

            {insights.length > 0 && <InsightBar items={insights} />}

            {/* Mapa ciepła nastrojów (sektor × miesiąc) — klik wiersza → drawer */}
            <SectionCard editorial titleVariant="label" title="Mapa ciepła nastrojów" subtitle="saldo koniunktury · sektor × miesiąc · zielony = optymizm, czerwony = pesymizm · kliknij wiersz"
                actions={<Grid3x3 size={15} className="text-mk-faint" />}>
                {heatCols.length < 2 ? <div className="mk-skeleton h-[200px] w-full" /> : (
                    <Heatmap rows={heatRows} cols={heatCols} valueAt={heatValue} scheme="sentiment" cellHeight={28}
                        colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 0)} onRowClick={openSector} />
                )}
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="Koniunktura — trend" subtitle="wskaźnik ogólnego klimatu (saldo)"
                    actions={<StaleBadge date={dataDate} label="GUS do" warnAfterMonths={3} />}>
                    {q.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : (
                        <InteractiveChart data={trend} xKey="date" height={300} unit=" pkt" legend showRange initialRange="ALL"
                            valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 0, label: '0 = neutralnie', color: '#CBD2DD' }]}
                            series={sectors.map((s) => ({ key: s.key, name: s.name, color: SECTOR_META[s.key]?.color ?? '#64748B', type: 'line' as const }))} />
                    )}
                </SectionCard>

                <SectionCard editorial titleVariant="label" title="Sektory" subtitle="kliknij sektor, aby zobaczyć trend i opis">
                    {q.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : (
                        <DataTable columns={cols} rows={rows} initialSort="latest" initialDir="desc" rowKey={(r) => r.key} onRowClick={(r) => openSector(r.key)} />
                    )}
                </SectionCard>
            </div>

            <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Wskaźnik ogólnego klimatu koniunktury (GUS): </span>
                saldo ocen przedsiębiorców (dodatnie = przewaga optymizmu). Darmowy, terminowy wskaźnik wyprzedzający — odpowiednik PMI, ale z podziałem na sektory.
            </div>

            {/* Drawer sektora */}
            <Drawer open={open && !!sel} onClose={() => setOpen(false)} accent={selColor}
                title={sel?.name ?? ''} subtitle="wskaźnik koniunktury GUS · saldo ocen przedsiębiorców">
                {sel && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { l: 'saldo (ostatnie)', v: sel.latest != null ? `${sel.latest > 0 ? '+' : ''}${formatDecimalPL(sel.latest, 1)}` : '—' },
                                { l: 'zmiana m/m', v: sel.delta != null ? `${sel.delta > 0 ? '+' : ''}${formatDecimalPL(sel.delta, 1)}` : '—' },
                            ].map((x) => (
                                <div key={x.l} className="rounded-xl border border-mk-border p-2.5 text-center">
                                    <div className="text-[11px] text-mk-muted">{x.l}</div>
                                    <div className="mt-0.5 text-lg font-bold tnum text-mk-text">{x.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl bg-mk-surface-alt p-3.5 text-sm leading-relaxed text-mk-text-soft">
                            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-mk-text"><Info size={15} style={{ color: selColor }} /> Co napędza ten sektor</div>
                            {SECTOR_INFO[sel.key] ?? 'Wskaźnik nastrojów przedsiębiorców w tym sektorze.'}
                        </div>
                        <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Trend nastrojów (18 miesięcy)</div>
                            <InteractiveChart data={selChart} xKey="date" height={200} unit=" pkt" showRange initialRange="ALL" ranges={['1R', 'ALL']}
                                valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                series={[{ key: 'value', name: sel.name, color: selColor, type: 'area', strokeWidth: 2.5 }]} />
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}

function FinansePubliczne() {
    return <RzadyGospodarka />;
}

export default function GospodarkaPage() {
    const [tab, setTab] = useState<Tab>('aktywnosc');
    useInitialTab(TABS.map((t) => t.value), setTab);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader
                eyebrow={<PageEyebrow section="Gospodarka" />}
                title="Gospodarka"
                subtitle="PKB, produkcja, sprzedaż i koniunktura gospodarcza"
                actions={<Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja gospodarki" />}
            />

            <div key={tab} className="mk-fade-in">
                {tab === 'aktywnosc' && <GospodarkaAktywnosc />}
                {tab === 'koniunktura' && <KoniunkturaSection />}
                {tab === 'finanse' && <FinansePubliczne />}
                {tab === 'korelacje' && <KorelacjeMakro />}
            </div>
        </div>
    );
}
