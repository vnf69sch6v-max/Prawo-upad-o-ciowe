'use client';

import { useState, useMemo, useCallback } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { Factory, HardHat, ShoppingCart, Truck, Radio, Info, Grid3x3, Landmark, Wallet, Percent, Users } from 'lucide-react';
import { useKoniunktura, useGovDebt, useGovDeficit, useBondYield10Y, useConsumerConfidence } from '@/lib/hooks';
import { plSeries } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { Heatmap } from '@/components/ui/Heatmap';
import { Sparkline } from '@/components/ui/Sparkline';
import { Drawer } from '@/components/ui/Drawer';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { InsightBar } from '@/components/ui/InsightBar';
import { analyzeSeries } from '@/lib/observations';
import { AktywnoscSection } from '@/components/sections/macro-sections';
import { RzadyGospodarka } from '@/components/sections/RzadyGospodarka';
import { KorelacjeMakro } from '@/components/sections/KorelacjeMakro';

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
    const ccQ = useConsumerConfidence();
    const cc = useMemo(() => plSeries(ccQ.data), [ccQ.data]);           // koniunktura konsumencka (saldo, miesięcznie)
    const ccLast = cc.length ? cc[cc.length - 1] : null;
    const ccPrev = cc.length > 1 ? cc[cc.length - 2] : null;
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

    return (
        <div className="space-y-6">
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

            {insights.length > 0 && <InsightBar items={insights} />}

            {/* Mapa ciepła nastrojów (sektor × miesiąc) — klik wiersza → drawer */}
            <SectionCard title="Mapa ciepła nastrojów" subtitle="saldo koniunktury · sektor × miesiąc · zielony = optymizm, czerwony = pesymizm · kliknij wiersz"
                actions={<Grid3x3 size={15} className="text-mk-faint" />}>
                {heatCols.length < 2 ? <div className="mk-skeleton h-[200px] w-full" /> : (
                    <Heatmap rows={heatRows} cols={heatCols} valueAt={heatValue} scheme="sentiment" cellHeight={28}
                        colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 0)} onRowClick={openSector} />
                )}
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Koniunktura — trend" subtitle="wskaźnik ogólnego klimatu (saldo)"
                    actions={<div className="flex items-center gap-2"><StaleBadge date={dataDate} label="GUS do" warnAfterMonths={3} /><CsvExport filename="koniunktura" headers={['Miesiąc', ...sectors.map((s) => s.name)]} rows={trend.map((t) => [t.date as string, ...sectors.map((s) => t[s.key] as number)])} /></div>}>
                    {q.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : (
                        <InteractiveChart data={trend} xKey="date" height={300} unit=" pkt" legend showRange initialRange="ALL"
                            valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 0, label: '0 = neutralnie', color: '#CBD2DD' }]}
                            series={sectors.map((s) => ({ key: s.key, name: s.name, color: SECTOR_META[s.key]?.color ?? '#64748B', type: 'line' as const }))} />
                    )}
                </SectionCard>

                <SectionCard title="Sektory" subtitle="kliknij sektor, aby zobaczyć trend i opis">
                    {q.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : (
                        <DataTable columns={cols} rows={rows} initialSort="latest" initialDir="desc" rowKey={(r) => r.key} onRowClick={(r) => openSector(r.key)} />
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Koniunktura konsumencka" subtitle="Eurostat · nastroje gospodarstw domowych (saldo) · miesięcznie · dopełnia klimat firm"
                actions={<div className="flex items-center gap-2"><StaleBadge date={ccLast?.date ?? null} label="do" warnAfterMonths={3} /><CsvExport filename="koniunktura-konsumencka" headers={['Miesiąc', 'Saldo']} rows={cc.map((p) => [p.date, p.value])} /></div>}>
                <div className="mb-3 flex flex-wrap items-center gap-4">
                    <div><span className="text-3xl font-extrabold tnum" style={{ color: (ccLast?.value ?? 0) >= 0 ? '#16A34A' : '#DC2626' }}>{ccLast ? `${ccLast.value > 0 ? '+' : ''}${formatDecimalPL(ccLast.value, 1)}` : '—'}</span> <span className="text-sm text-mk-muted">saldo · {ccLast?.date ?? ''}</span></div>
                    {ccLast && ccPrev && <span className="text-xs text-mk-faint">m/m {ccLast.value - ccPrev.value >= 0 ? '+' : ''}{formatDecimalPL(ccLast.value - ccPrev.value, 1)} pkt</span>}
                </div>
                {cc.length < 2 ? <div className="mk-skeleton h-[240px] w-full" /> : (
                    <InteractiveChart data={cc} xKey="date" height={240} unit=" pkt" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']}
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        referenceLines={[{ y: 0, label: '0 = neutralnie', color: '#CBD2DD' }]}
                        series={[{ key: 'value', name: 'Koniunktura konsumencka', color: '#0891B2', type: 'area', strokeWidth: 2.5 }]} />
                )}
                <p className="mt-2 flex items-center gap-1 text-[11px] text-mk-faint"><Users size={11} /> Ujemne saldo = przewaga pesymizmu (typowe). Wskaźnik wyprzedzający konsumpcję prywatną — dopełnia klimat firm (wyżej).</p>
            </SectionCard>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
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
    const debtQ = useGovDebt();
    const defQ = useGovDeficit();
    const yieldQ = useBondYield10Y();
    const [fpView, setFpView] = useState<'wskazniki' | 'rzady'>('wskazniki');

    const debt = useMemo(() => plSeries(debtQ.data), [debtQ.data]);       // rocznie, % PKB
    const deficit = useMemo(() => plSeries(defQ.data), [defQ.data]);      // rocznie, % PKB (ujemne = deficyt)
    const yield10 = useMemo(() => plSeries(yieldQ.data), [yieldQ.data]);  // miesięcznie, %
    const last = <T,>(a: T[]) => (a.length ? a[a.length - 1] : null);
    const prevOf = <T,>(a: T[]) => (a.length > 1 ? a[a.length - 2] : null);
    const dL = last(debt), dP = prevOf(debt), fL = last(deficit), fP = prevOf(deficit), yL = last(yield10), yP = prevOf(yield10);

    const insights = useMemo(() => [
        ...analyzeSeries('Dług publiczny', debt.map((p) => p.value), { unit: '% PKB', decimals: 1, goodDown: true, period: 'year', target: { value: 60, label: 'próg UE 60%' } }).slice(0, 2),
        ...analyzeSeries('Wynik sektora GG', deficit.map((p) => p.value), { unit: '% PKB', decimals: 1, period: 'year' }).slice(0, 1),
        ...analyzeSeries('Rentowność 10Y', yield10.map((p) => p.value), { unit: '%', decimals: 2, goodDown: true, period: 'month' }).slice(0, 1),
    ], [debt, deficit, yield10]);

    const toggle = <div className="flex justify-end"><Segmented value={fpView} onChange={setFpView} options={[{ value: 'wskazniki', label: 'Wskaźniki' }, { value: 'rzady', label: 'Rządy a gospodarka' }]} aria-label="Widok finansów publicznych" /></div>;
    if (fpView === 'rzady') return <div className="space-y-6">{toggle}<RzadyGospodarka /></div>;
    if (debtQ.isLoading || defQ.isLoading || yieldQ.isLoading) return <div className="space-y-6">{toggle}<div className="grid gap-4 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="mk-card h-28" />)}</div></div>;

    return (
        <div className="space-y-6">
            {toggle}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Dług publiczny" value={dL ? formatDecimalPL(dL.value, 1) : '—'} unit="% PKB" accent="rose" icon={Landmark}
                    delta={dL && dP ? { value: +(dL.value - dP.value).toFixed(1), unit: 'pp', invert: true } : undefined} footnote={dL ? `Eurostat · ${dL.date} · próg UE 60%` : 'Eurostat'} />
                <KpiCard label="Wynik sektora fin. publ." value={fL ? `${fL.value > 0 ? '+' : ''}${formatDecimalPL(fL.value, 1)}` : '—'} unit="% PKB" accent={fL && fL.value < -3 ? 'rose' : 'amber'} icon={Wallet}
                    delta={fL && fP ? { value: +(fL.value - fP.value).toFixed(1), unit: 'pp' } : undefined} footnote={fL ? `${fL.value < 0 ? 'deficyt' : 'nadwyżka'} · ${fL.date} · próg −3%` : 'Eurostat'} />
                <KpiCard label="Rentowność 10Y" value={yL ? formatDecimalPL(yL.value, 2) : '—'} unit="%" accent="violet" icon={Percent}
                    delta={yL && yP ? { value: +(yL.value - yP.value).toFixed(2), unit: 'pp', invert: true } : undefined} footnote={yL ? `Eurostat · ${yL.date} · koszt długu` : 'Eurostat'} />
            </div>

            {insights.length > 0 && <InsightBar items={insights} />}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Dług publiczny (% PKB)" subtitle="Eurostat · sektor general government · rocznie"
                    actions={<div className="flex items-center gap-2"><StaleBadge date={dL?.date ?? null} label="do" warnAfterMonths={18} /><CsvExport filename="dlug-publiczny" headers={['Rok', '% PKB']} rows={debt.map((p) => [p.date, p.value])} /></div>}>
                    <InteractiveChart data={debt} xKey="date" height={280} unit="% PKB" valueFormatter={(v) => formatDecimalPL(v, 1)}
                        referenceLines={[{ y: 60, label: 'próg UE 60%', color: '#DC2626' }]}
                        series={[{ key: 'value', name: 'Dług', color: '#E11D48', type: 'area', strokeWidth: 2.5 }]} />
                </SectionCard>
                <SectionCard title="Wynik sektora finansów publ. (% PKB)" subtitle="Eurostat · ujemne = deficyt · rocznie"
                    actions={<CsvExport filename="wynik-gg" headers={['Rok', '% PKB']} rows={deficit.map((p) => [p.date, p.value])} />}>
                    <InteractiveChart data={deficit} xKey="date" height={280} unit="% PKB" valueFormatter={(v) => formatDecimalPL(v, 1)}
                        referenceLines={[{ y: -3, label: 'próg UE −3%', color: '#DC2626' }, { y: 0, color: '#CBD2DD' }]}
                        series={[{ key: 'value', name: 'Wynik GG', color: '#D97706', type: 'area', strokeWidth: 2 }]} />
                </SectionCard>
            </div>

            <SectionCard title="Rentowność obligacji 10-letnich (%)" subtitle="Eurostat · kryterium z Maastricht · miesięcznie · rynkowy koszt obsługi długu"
                actions={<div className="flex items-center gap-2"><StaleBadge date={yL?.date ?? null} label="do" warnAfterMonths={3} /><CsvExport filename="rentownosc-10y" headers={['Miesiąc', '%']} rows={yield10.map((p) => [p.date, p.value])} /></div>}>
                <InteractiveChart data={yield10} xKey="date" height={280} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']}
                    valueFormatter={(v) => formatDecimalPL(v, 2)} xTickFormatter={monthTick}
                    series={[{ key: 'value', name: 'Rentowność 10Y', color: '#7C3AED', type: 'area', strokeWidth: 2.5 }]} />
            </SectionCard>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Finanse publiczne (Eurostat / procedura nadmiernego deficytu): </span>
                dług i wynik sektora general government względem PKB; progi z Maastricht: 60% (dług) i −3% (deficyt). Rentowność 10Y to rynkowy koszt finansowania długu.
            </div>
        </div>
    );
}

export default function GospodarkaPage() {
    const [tab, setTab] = useState<Tab>('aktywnosc');
    useInitialTab(TABS.map((t) => t.value), setTab);
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Gospodarka</h1>
                    <p className="mt-1 text-sm text-mk-muted">PKB, produkcja, sprzedaż i koniunktura gospodarcza</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja gospodarki" />
            </div>

            <div key={tab} className="mk-fade-in">
                {tab === 'aktywnosc' && <AktywnoscSection />}
                {tab === 'koniunktura' && <KoniunkturaSection />}
                {tab === 'finanse' && <FinansePubliczne />}
                {tab === 'korelacje' && <KorelacjeMakro />}
            </div>
        </div>
    );
}
