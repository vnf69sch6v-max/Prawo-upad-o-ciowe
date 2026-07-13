'use client';

import { useMemo, useState } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { Euro, DollarSign, Coins, TrendingUp, Ship, Landmark, PoundSterling, Fuel, Flame, Gem, Factory, BarChart3 } from 'lucide-react';
import {
    useNBPTable, useNBPCurrencyHistory, useGold, useStooq,
    useTradeData, useCurrentAccount,
    type NBPTable, type NBPRate,
} from '@/lib/hooks';
import { plSeries, lastOf, prevOf, deltaOf, monthTick, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StopySection } from '@/components/sections/macro-sections';

type Section = 'kursy' | 'stopy' | 'gpw' | 'handel';
type Hist = { mid?: number; effectiveDate?: string }[];

const histPoints = (h?: Hist): Point[] =>
    (h ?? []).filter((r) => r.mid != null && r.effectiveDate).map((r) => ({ date: r.effectiveDate as string, value: r.mid as number }));
const histDelta = (h?: Hist): number | null => {
    const p = histPoints(h);
    const a = lastOf(p), b = prevOf(p);
    return a != null && b != null ? +percentChange(a, b).toFixed(2) : null;
};

// ═══ KURSY ═══
function KursySection() {
    const tableQ = useNBPTable('a');
    const eurH = useNBPCurrencyHistory('eur', 90);
    const usdH = useNBPCurrencyHistory('usd', 90);
    const chfH = useNBPCurrencyHistory('chf', 90);
    const gbpH = useNBPCurrencyHistory('gbp', 90);
    const goldQ = useGold(90);

    const table = useMemo(() => {
        const raw = tableQ.data as NBPTable | NBPTable[] | undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [tableQ.data]);
    const rates: NBPRate[] = table?.rates ?? [];
    const mid = (code: string) => rates.find((r) => r.code === code)?.mid ?? null;

    const chart = useMemo(() => {
        const maps = {
            EUR: new Map(histPoints(eurH.data as Hist).map((p) => [p.date, p.value])),
            USD: new Map(histPoints(usdH.data as Hist).map((p) => [p.date, p.value])),
            CHF: new Map(histPoints(chfH.data as Hist).map((p) => [p.date, p.value])),
            GBP: new Map(histPoints(gbpH.data as Hist).map((p) => [p.date, p.value])),
        };
        const dates = Array.from(new Set([...maps.EUR.keys(), ...maps.USD.keys()])).sort();
        return dates.map((d) => ({ date: d, EUR: maps.EUR.get(d) ?? null, USD: maps.USD.get(d) ?? null, CHF: maps.CHF.get(d) ?? null, GBP: maps.GBP.get(d) ?? null }));
    }, [eurH.data, usdH.data, chfH.data, gbpH.data]);

    const gold = useMemo(() => (goldQ.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [goldQ.data]);
    const goldLast = gold.length ? gold[gold.length - 1].value : null;
    const goldDelta = gold.length > 1 ? +percentChange(gold[gold.length - 1].value, gold[gold.length - 2].value).toFixed(2) : null;

    const kpis: { label: string; code: string; hist: Hist | undefined; accent: AccentKey; icon: typeof Euro }[] = [
        { label: 'EUR / PLN', code: 'EUR', hist: eurH.data as Hist, accent: 'blue', icon: Euro },
        { label: 'USD / PLN', code: 'USD', hist: usdH.data as Hist, accent: 'green', icon: DollarSign },
        { label: 'CHF / PLN', code: 'CHF', hist: chfH.data as Hist, accent: 'rose', icon: Coins },
        { label: 'GBP / PLN', code: 'GBP', hist: gbpH.data as Hist, accent: 'violet', icon: PoundSterling },
    ];

    const cols: Column<NBPRate>[] = [
        { key: 'currency', header: 'Waluta', sortable: true, sortValue: (r) => r.currency, render: (r) => <span className="capitalize">{r.currency}</span> },
        { key: 'code', header: 'Kod', render: (r) => <span className="font-semibold">{r.code}</span> },
        { key: 'mid', header: 'Kurs (PLN)', align: 'right', sortable: true, sortValue: (r) => r.mid ?? 0, render: (r) => r.mid != null ? formatDecimalPL(r.mid, 4) : '—' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((k) => (
                    <KpiCard key={k.code} label={k.label} value={mid(k.code) != null ? formatDecimalPL(mid(k.code)!, 3) : '—'} unit="zł" accent={k.accent} icon={k.icon}
                        delta={histDelta(k.hist) != null ? { value: histDelta(k.hist)!, unit: 'pct', invert: true } : undefined}
                        footnote={table?.effectiveDate ? `NBP ${formatDate(table.effectiveDate)}` : 'NBP tab. A'} loading={tableQ.isLoading} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SectionCard className="lg:col-span-2" title="Kursy walut — historia 90 dni" subtitle="NBP · EUR / USD / CHF / GBP"
                    actions={<CsvExport filename="kursy-walut" headers={['Data', 'EUR', 'USD', 'CHF', 'GBP']} rows={chart.map((r) => [r.date, r.EUR, r.USD, r.CHF, r.GBP])} />}>
                    {chart.length === 0 ? <div className="mk-skeleton h-[320px] w-full" /> : (
                        <InteractiveChart data={chart} xKey="date" height={320} unit=" zł" legend showRange initialRange="3M"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} xTickFormatter={monthTick}
                            series={[
                                { key: 'EUR', name: 'EUR', color: '#2563EB', type: 'line' },
                                { key: 'USD', name: 'USD', color: '#16A34A', type: 'line' },
                                { key: 'CHF', name: 'CHF', color: '#E11D48', type: 'line' },
                                { key: 'GBP', name: 'GBP', color: '#7C3AED', type: 'line' },
                            ]} />
                    )}
                </SectionCard>
                <SectionCard title="Złoto (NBP)" subtitle="cena 1 g w PLN">
                    <div className="mb-3">
                        <div className="mk-kpi-value" style={{ fontSize: '2rem' }}>{goldLast != null ? formatDecimalPL(goldLast, 2) : '—'}<span className="ml-1 text-lg text-mk-muted">zł/g</span></div>
                        {goldDelta != null && <div className="mt-1 text-sm text-mk-muted">dzień: {goldDelta > 0 ? '+' : ''}{formatDecimalPL(goldDelta, 2)}%</div>}
                    </div>
                    {gold.length === 0 ? <div className="mk-skeleton h-[200px] w-full" /> : (
                        <InteractiveChart data={gold.map((g) => ({ date: g.date, value: g.value }))} xKey="date" height={200} unit=" zł"
                            valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick} series={[{ key: 'value', name: 'Złoto', color: '#D97706', type: 'area' }]} />
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Tabela kursów NBP (tab. A)" subtitle={table?.effectiveDate ? `stan na ${formatDate(table.effectiveDate)}` : 'NBP'}
                actions={<CsvExport filename="tabela-kursow" headers={['Waluta', 'Kod', 'Kurs PLN']} rows={rates.map((r) => [r.currency, r.code, r.mid])} />}>
                <div className="max-h-[360px] overflow-auto">
                    <DataTable columns={cols} rows={rates} initialSort="code" initialDir="asc" rowKey={(r) => r.code} />
                </div>
            </SectionCard>
        </div>
    );
}

// ═══ GPW + Surowce (Yahoo Finance) ═══
type QBar = { date: string; close: number };
const barsOf = (q: { data?: { data: QBar[] } }): QBar[] => q.data?.data ?? [];
const lastCloseOf = (q: { data?: { latest: QBar | null } }): number | null => q.data?.latest?.close ?? null;
const pctDelta = (bars: QBar[]): number | null => (bars.length > 1 ? +percentChange(bars[bars.length - 1].close, bars[bars.length - 2].close).toFixed(2) : null);

function GpwSection() {
    // Indeksy GPW — WIG20 ma historię (seria z ETF WIG20TR skalowana do indeksu); reszta = wartość bieżąca (Yahoo)
    const wig20 = useStooq('wig20', 60);
    const wig = useStooq('wig', 2);
    const mwig = useStooq('mwig40', 2);
    const swig = useStooq('swig80', 2);
    // Surowce — pełna historia (Yahoo Finance)
    const brent = useStooq('cb.c', 90);
    const wti = useStooq('cl.c', 90);
    const gold = useStooq('gc.c', 90);
    const copper = useStooq('hg.c', 90);
    const gas = useStooq('ng.c', 90);

    const wig20Chart = useMemo(() => barsOf(wig20).map((b) => ({ date: b.date, value: b.close })), [wig20.data]);

    const indices = [
        { label: 'WIG20', q: wig20, accent: 'blue' as AccentKey },
        { label: 'WIG', q: wig, accent: 'slate' as AccentKey },
        { label: 'mWIG40', q: mwig, accent: 'violet' as AccentKey },
        { label: 'sWIG80', q: swig, accent: 'cyan' as AccentKey },
    ];
    const commods = [
        { key: 'brent', label: 'Ropa Brent', q: brent, unit: 'USD/bbl', icon: Fuel, accent: 'amber' as AccentKey, dec: 1 },
        { key: 'wti', label: 'Ropa WTI', q: wti, unit: 'USD/bbl', icon: Fuel, accent: 'amber' as AccentKey, dec: 1 },
        { key: 'gold', label: 'Złoto', q: gold, unit: 'USD/oz', icon: Gem, accent: 'amber' as AccentKey, dec: 0 },
        { key: 'copper', label: 'Miedź', q: copper, unit: 'USD/lb', icon: Factory, accent: 'rose' as AccentKey, dec: 2 },
        { key: 'gas', label: 'Gaz ziemny', q: gas, unit: 'USD/MMBtu', icon: Flame, accent: 'cyan' as AccentKey, dec: 2 },
    ];

    // Wykres znormalizowany (rebazowany do 100) — różne skale surowców na jednej osi
    const commodChart = useMemo(() => {
        const src = [{ key: 'brent', q: brent }, { key: 'wti', q: wti }, { key: 'gold', q: gold }, { key: 'copper', q: copper }, { key: 'gas', q: gas }];
        const maps = src.map((s) => {
            const bars = barsOf(s.q);
            const base = bars.length ? bars[0].close : null;
            return { key: s.key, m: new Map(bars.map((b) => [b.date, base ? +((b.close / base) * 100).toFixed(1) : null])) };
        });
        const dates = Array.from(new Set(maps.flatMap((x) => [...x.m.keys()]))).sort();
        return dates.map((date) => {
            const row: Record<string, string | number | null> = { date };
            maps.forEach((x) => { row[x.key] = x.m.get(date) ?? null; });
            return row;
        });
    }, [brent.data, wti.data, gold.data, copper.data, gas.data]);

    return (
        <div className="space-y-6">
            {/* Indeksy GPW */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {indices.map((ix) => {
                    const bars = barsOf(ix.q);
                    const last = lastCloseOf(ix.q);
                    return (
                        <KpiCard key={ix.label} label={ix.label} value={last != null ? formatNumber(Math.round(last)) : '—'} unit="pkt" accent={ix.accent} icon={BarChart3}
                            delta={pctDelta(bars) != null ? { value: pctDelta(bars)!, unit: 'pct' } : undefined}
                            footnote={bars.length > 2 ? 'GPW · notowania' : 'GPW · poziom bieżący'} loading={ix.q.isLoading} />
                    );
                })}
            </div>

            <SectionCard title="WIG20 — 60 sesji" subtitle="poziom indeksu · seria z ETF WIG20TR skalowana do poziomu indeksu (Yahoo)"
                actions={<CsvExport filename="wig20" headers={['Data', 'Zamknięcie']} rows={wig20Chart.map((r) => [r.date, r.value])} />}>
                {wig20Chart.length < 2 ? <div className="mk-skeleton h-[280px] w-full" /> : (
                    <InteractiveChart data={wig20Chart} xKey="date" height={280} showRange initialRange="ALL"
                        valueFormatter={(v) => formatNumber(Math.round(v))} xTickFormatter={monthTick}
                        series={[{ key: 'value', name: 'WIG20', color: '#2563EB', type: 'area', strokeWidth: 2.5 }]} />
                )}
            </SectionCard>

            {/* Surowce */}
            <div>
                <h3 className="mk-section-title mb-3">Surowce <span className="text-sm font-normal text-mk-muted">— notowania światowe, także czynniki inflacji (Yahoo Finance)</span></h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {commods.map((c) => {
                        const bars = barsOf(c.q);
                        const last = lastCloseOf(c.q);
                        return (
                            <KpiCard key={c.key} label={c.label} value={last != null ? formatDecimalPL(last, c.dec) : '—'} accent={c.accent} icon={c.icon}
                                delta={pctDelta(bars) != null ? { value: pctDelta(bars)!, unit: 'pct' } : undefined}
                                footnote={c.unit} loading={c.q.isLoading} />
                        );
                    })}
                </div>
            </div>

            <SectionCard title="Surowce — dynamika (rebazowane do 100)" subtitle="porównanie zmian %: ropa Brent/WTI, złoto, miedź, gaz ziemny"
                actions={<CsvExport filename="surowce" headers={['Data', 'Brent', 'WTI', 'Złoto', 'Miedź', 'Gaz']} rows={commodChart.map((r) => [r.date, r.brent, r.wti, r.gold, r.copper, r.gas])} />}>
                {commodChart.length < 2 ? <div className="mk-skeleton h-[320px] w-full" /> : (
                    <InteractiveChart data={commodChart} xKey="date" height={320} legend showRange initialRange="3M"
                        valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick} referenceLines={[{ y: 100, color: '#CBD2DD' }]}
                        series={[
                            { key: 'brent', name: 'Brent', color: '#D97706', type: 'line' },
                            { key: 'wti', name: 'WTI', color: '#B45309', type: 'line' },
                            { key: 'gold', name: 'Złoto', color: '#CA8A04', type: 'line' },
                            { key: 'copper', name: 'Miedź', color: '#EA580C', type: 'line' },
                            { key: 'gas', name: 'Gaz', color: '#0891B2', type: 'line' },
                        ]} />
                )}
            </SectionCard>
        </div>
    );
}

// ═══ HANDEL ═══
function HandelSection() {
    const expQ = useTradeData('exports');
    const impQ = useTradeData('imports');
    const caQ = useCurrentAccount();
    const exp = useMemo(() => plSeries(expQ.data), [expQ.data]);
    const imp = useMemo(() => plSeries(impQ.data), [impQ.data]);
    const ca = useMemo(() => plSeries(caQ.data), [caQ.data]);

    const trade = useMemo(() => {
        const im = new Map(imp.map((p) => [p.date, p.value]));
        return exp.map((p) => {
            const i = im.get(p.date) ?? null;
            return { date: p.date, eksport: p.value, import: i, saldo: i != null ? +(p.value - i).toFixed(0) : null };
        });
    }, [exp, imp]);

    const lastExp = lastOf(exp), lastImp = lastOf(imp);
    const saldo = lastExp != null && lastImp != null ? lastExp - lastImp : null;
    const bn = (v: number | null) => (v == null ? '—' : formatNumber(v / 1000, 1)); // mln → mld EUR

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="Eksport towarów" value={bn(lastExp)} unit="mld €" accent="green" icon={Ship} footnote={exp.length ? exp[exp.length - 1].date : 'Eurostat'} loading={expQ.isLoading} />
                <KpiCard label="Import towarów" value={bn(lastImp)} unit="mld €" accent="amber" icon={Ship} footnote={imp.length ? imp[imp.length - 1].date : 'Eurostat'} loading={impQ.isLoading} />
                <KpiCard label="Saldo handlowe" value={bn(saldo)} unit="mld €" accent={saldo != null && saldo >= 0 ? 'blue' : 'rose'} icon={TrendingUp} footnote="eksport − import" loading={expQ.isLoading || impQ.isLoading} />
                <KpiCard label="Rachunek bieżący" value={bn(lastOf(ca))} unit="mld €" accent="violet" icon={Landmark} footnote={ca.length ? ca[ca.length - 1].date : 'Eurostat'} loading={caQ.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Eksport vs import" subtitle="Eurostat BoP · mln EUR"
                    actions={<CsvExport filename="handel" headers={['Data', 'Eksport', 'Import', 'Saldo']} rows={trade.map((r) => [r.date, r.eksport, r.import, r.saldo])} />}>
                    {trade.length === 0 ? <div className="mk-skeleton h-[280px] w-full" /> : (
                        <InteractiveChart data={trade} xKey="date" height={280} unit=" mln €" legend showRange initialRange="1R"
                            valueFormatter={(v) => formatNumber(v, 0)} xTickFormatter={monthTick}
                            series={[
                                { key: 'eksport', name: 'Eksport', color: '#16A34A', type: 'line' },
                                { key: 'import', name: 'Import', color: '#D97706', type: 'line' },
                            ]} />
                    )}
                </SectionCard>
                <SectionCard title="Saldo handlowe" subtitle="eksport − import · mln EUR">
                    {trade.length === 0 ? <div className="mk-skeleton h-[280px] w-full" /> : (
                        <InteractiveChart data={trade.filter((r) => r.saldo != null)} xKey="date" height={280} unit=" mln €" showRange initialRange="1R"
                            valueFormatter={(v) => formatNumber(v, 0)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                            series={[{ key: 'saldo', name: 'Saldo', color: '#2563EB', type: 'area' }]} />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

const SECTIONS: { value: Section; label: string }[] = [
    { value: 'kursy', label: 'Kursy walut' },
    { value: 'stopy', label: 'Stopy i WIBOR' },
    { value: 'gpw', label: 'GPW' },
    { value: 'handel', label: 'Handel zagraniczny' },
];

export default function RynkiPage() {
    const [section, setSection] = useState<Section>('kursy');
    useInitialTab(SECTIONS.map((s) => s.value), setSection);
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Rynki</h1>
                    <p className="mt-1 text-sm text-mk-muted">Kursy walut, złoto, GPW i handel zagraniczny</p>
                </div>
                <Segmented value={section} onChange={setSection} options={SECTIONS} aria-label="Sekcja" />
            </div>

            {section === 'kursy' && <KursySection />}
            {section === 'stopy' && <StopySection />}
            {section === 'gpw' && <GpwSection />}
            {section === 'handel' && <HandelSection />}
        </div>
    );
}
