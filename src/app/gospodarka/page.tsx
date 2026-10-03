'use client';

import { useState, useMemo, useCallback } from 'react';
import { useInitialTab, useTabScrollReset } from '@/lib/use-initial-tab';
import { Factory, HardHat, ShoppingCart, Truck, Radio, Info, Grid3x3, ChevronRight } from 'lucide-react';
import { useKoniunktura } from '@/lib/hooks';
import { formatDecimalPL, formatDataPeriod } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { Heatmap } from '@/components/ui/Heatmap';
import { Sparkline } from '@/components/ui/Sparkline';
import { Drawer } from '@/components/ui/Drawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { GospodarkaAktywnosc } from '@/components/sections/GospodarkaAktywnosc';
import { RzadyGospodarka } from '@/components/sections/RzadyGospodarka';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { MobileTabs } from '@/components/sections/mobile-layout';

type Tab = 'aktywnosc' | 'koniunktura' | 'finanse';
const TABS: { value: Tab; label: string }[] = [
    { value: 'aktywnosc', label: 'PKB i aktywność' },
    { value: 'koniunktura', label: 'Koniunktura' },
    { value: 'finanse', label: 'Finanse publiczne' },
];
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;

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

    const [selKey, setSelKey] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const openSector = (key: string) => { setSelKey(key); setOpen(true); };
    const sel = selKey ? rows.find((r) => r.key === selKey) ?? null : null;
    const selColor = sel ? SECTOR_META[sel.key]?.color ?? '#2563EB' : '#2563EB';
    const selChart = useMemo(() => (sel ? trend.map((t) => ({ date: t.date as string, value: typeof t[sel.key] === 'number' ? (t[sel.key] as number) : null })) : []), [sel, trend]);

    // Wniosek na górę ekranu — wyłącznie z realnych sald GUS (bez sztucznej „średniej" sektorów).
    const ranked = rows.filter((r) => r.latest != null).sort((a, b) => (b.latest as number) - (a.latest as number));
    const positive = ranked.filter((r) => (r.latest as number) > 0).length;
    const best = ranked[0] ?? null;
    const worst = ranked.length > 1 ? ranked[ranked.length - 1] : null;

    const cols: Column<SectorRow>[] = [
        { key: 'name', header: 'Sektor', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium text-mk-text">{r.name}</span> },
        { key: 'latest', header: 'Saldo', align: 'right', sortable: true, sortValue: (r) => r.latest ?? -999, render: (r) => <span style={{ color: (r.latest ?? 0) >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{r.latest != null ? `${r.latest > 0 ? '+' : ''}${formatDecimalPL(r.latest, 1)}` : '—'}</span> },
        { key: 'delta', header: 'Δ m/m', align: 'right', sortable: true, sortValue: (r) => r.delta ?? -999, render: (r) => r.delta != null ? <span style={{ color: r.delta >= 0 ? '#16A34A' : '#DC2626' }}>{r.delta > 0 ? '+' : ''}{formatDecimalPL(r.delta, 1)}</span> : '—' },
        { key: 'trend', header: 'Trend 18M', align: 'center', render: (r) => <Sparkline data={r.history} color={SECTOR_META[r.key]?.color} /> },
    ];

    return (
        // Kolumna flex zamiast space-y: na telefonie kolejność wniosek → KPI → trend + sektory → mapa ciepła;
        // od `lg` mapa ciepła wraca nad wykres (jak wcześniej).
        <div className="flex flex-col gap-6">
            <section className="rounded-[14px] border border-mk-border bg-mk-surface p-5 sm:p-6" aria-label="Koniunktura — wniosek">
                {q.isLoading ? (
                    <div className="space-y-3" role="status" aria-busy="true" aria-label="Ładowanie koniunktury">
                        <div className="mk-skeleton h-3 w-40 rounded" />
                        <div className="mk-skeleton h-10 w-56 rounded" />
                        <div className="mk-skeleton h-4 w-full max-w-xl rounded" />
                    </div>
                ) : ranked.length === 0 ? (
                    <p className="text-sm text-mk-muted">Brak bieżącego odczytu koniunktury GUS.</p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-mk-muted">
                            {dataDate && (
                                <span className="inline-flex items-center rounded-full bg-mk-surface-alt px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mk-text-soft tnum">
                                    {formatDataPeriod(dataDate)}
                                </span>
                            )}
                            <span>GUS · koniunktura · saldo ocen</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="mk-kpi-value text-mk-text">{positive}<span className="text-mk-muted"> z {ranked.length}</span></span>
                            <span className="text-base font-semibold text-mk-muted">sektorów na plusie</span>
                        </div>
                        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-mk-text-soft">
                            {best && <>Najlepsze nastroje: {best.name.toLowerCase()} ({signed(best.latest as number)} pkt).</>}
                            {worst && <> Najsłabsze: {worst.name.toLowerCase()} ({signed(worst.latest as number)} pkt).</>}
                        </p>
                    </>
                )}
            </section>

            {/* Telefon: pięć sektorów jako lista wierszy 56 px (saldo po prawej, stuknięcie → arkusz z trendem).
                Kafle KPI i tabela „Sektory" powtarzały te same pięć liczb trzy razy na jednym ekranie. */}
            <section className="lg:hidden" aria-label="Nastroje sektorów">
                <h2 className="mk-section-label mb-2">Nastroje sektorów · saldo (pkt)</h2>
                <div className="mk-card mk-card-editorial px-3 py-1">
                    <QueryState
                        isLoading={q.isLoading}
                        isError={q.isError}
                        isEmpty={rows.length === 0}
                        onRetry={() => { void q.refetch(); }}
                        height={280}
                        emptyTitle="Brak danych sektorów"
                    >
                        <ul className="divide-y divide-mk-border">
                            {ranked.concat(rows.filter((r) => r.latest == null)).map((r) => (
                                <li key={r.key}>
                                    <button type="button" onClick={() => openSector(r.key)}
                                        className="-mx-1 flex min-h-14 w-[calc(100%+0.5rem)] items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors duration-100 [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt">
                                        <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: SECTOR_META[r.key]?.color ?? '#64748B' }} aria-hidden />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-mk-text">{r.name}</span>
                                            <span className="block text-xs text-mk-muted tnum">
                                                {r.delta != null ? <>m/m <span style={{ color: r.delta >= 0 ? '#16A34A' : '#DC2626' }}>{signed(r.delta)} pkt</span></> : 'm/m —'}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-right text-lg font-bold tnum" style={{ color: (r.latest ?? 0) >= 0 ? '#16A34A' : '#DC2626' }}>
                                            {r.latest != null ? signed(r.latest) : '—'}<span className="ml-0.5 text-xs font-semibold text-mk-muted">pkt</span>
                                        </span>
                                        <ChevronRight size={16} className="shrink-0 text-mk-faint" aria-hidden />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </QueryState>
                </div>
            </section>

            <section className="hidden lg:block">
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
                            footnote={latest?.date ? formatDataPeriod(latest.date) : ''} loading={q.isLoading}
                            error={q.isError} onRetry={() => { void q.refetch(); }} />
                    );
                })}
                </div>
            </section>

            {/* Mapa ciepła nastrojów (sektor × miesiąc) — klik wiersza → drawer */}
            <SectionCard editorial titleVariant="label" className="max-lg:order-1" title="Mapa ciepła nastrojów" subtitle="saldo (pkt) · sektor × miesiąc · zielony = optymizm, czerwony = pesymizm"
                actions={<Grid3x3 size={15} className="text-mk-faint" />}>
                <QueryState
                    isLoading={q.isLoading}
                    isError={q.isError}
                    isEmpty={heatCols.length < 2}
                    onRetry={() => { void q.refetch(); }}
                    height={200}
                    emptyTitle="Brak danych koniunktury"
                >
                    <Heatmap rows={heatRows} cols={heatCols} valueAt={heatValue} scheme="sentiment" cellHeight={28}
                        colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 0)} onRowClick={openSector} />
                </QueryState>
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="Koniunktura — trend" subtitle="wskaźnik ogólnego klimatu (saldo)"
                    actions={<StaleBadge date={dataDate} label="GUS do" warnAfterMonths={3} />}>
                    <QueryState
                        isLoading={q.isLoading}
                        isError={q.isError}
                        isEmpty={trend.length === 0}
                        onRetry={() => { void q.refetch(); }}
                        height={300}
                        emptyTitle="Brak danych koniunktury"
                    >
                        <InteractiveChart data={trend} xKey="date" height={300} unit=" pkt" legend showRange initialRange="ALL"
                            valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 0, label: '0 = neutralnie', color: '#CBD2DD' }]}
                            series={sectors.map((s) => ({ key: s.key, name: s.name, color: SECTOR_META[s.key]?.color ?? '#64748B', type: 'line' as const }))} />
                    </QueryState>
                </SectionCard>

                <SectionCard editorial titleVariant="label" className="hidden lg:block" title="Sektory" subtitle="kliknij sektor, aby zobaczyć trend i opis">
                    <QueryState
                        isLoading={q.isLoading}
                        isError={q.isError}
                        isEmpty={rows.length === 0}
                        onRetry={() => { void q.refetch(); }}
                        height={300}
                        emptyTitle="Brak danych sektorów"
                    >
                        <DataTable columns={cols} rows={rows} initialSort="latest" initialDir="desc" rowKey={(r) => r.key} onRowClick={(r) => openSector(r.key)} />
                    </QueryState>
                </SectionCard>
            </div>

            <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft max-lg:order-2">
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
                                    <div className="mt-0.5 text-lg font-bold tnum text-mk-text">{x.v}<span className="ml-0.5 text-xs font-semibold text-mk-muted">pkt</span></div>
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
    useTabScrollReset(tab);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader
                title="Gospodarka"
                actions={<div className="hidden lg:block"><Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja gospodarki" /></div>}
            />
            <MobileTabs value={tab} onChange={setTab} options={TABS} ariaLabel="Sekcja gospodarki" className="-mt-2" />

            <div key={tab} className="mk-tab-panel mk-fade-in">
                {tab === 'aktywnosc' && <GospodarkaAktywnosc />}
                {tab === 'koniunktura' && <KoniunkturaSection />}
                {tab === 'finanse' && <FinansePubliczne />}
            </div>
        </div>
    );
}
