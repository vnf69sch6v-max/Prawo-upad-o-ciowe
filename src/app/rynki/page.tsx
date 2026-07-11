'use client';

import { useMemo, useState } from 'react';
import { Euro, DollarSign, Coins, TrendingUp, Ship, Landmark, PoundSterling } from 'lucide-react';
import {
    useNBPTable, useNBPCurrencyHistory, useGold,
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

type Section = 'kursy' | 'gpw' | 'handel';
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

// ═══ GPW (Stooq blocked) ═══
function GpwSection() {
    return (
        <SectionCard title="GPW — indeksy i akcje" subtitle="WIG20 · WIG · mWIG40 · sWIG80">
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mk-warn-soft text-mk-warn"><TrendingUp size={26} /></span>
                <h3 className="mk-section-title">Dane GPW chwilowo niedostępne</h3>
                <p className="mt-2 max-w-md text-sm text-mk-muted">
                    Dotychczasowe źródło (Stooq) zaczęło serwować stronę-wyzwanie JS i blokuje pobieranie po stronie serwera.
                    Trwa dobór alternatywnego źródła notowań GPW (indeksy, akcje, obligacje).
                </p>
                <p className="mt-2 text-xs text-mk-faint">Kursy walut i złota (NBP) oraz handel zagraniczny (Eurostat) działają w pozostałych zakładkach.</p>
            </div>
        </SectionCard>
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
    { value: 'gpw', label: 'GPW' },
    { value: 'handel', label: 'Handel zagraniczny' },
];

export default function RynkiPage() {
    const [section, setSection] = useState<Section>('kursy');
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
            {section === 'gpw' && <GpwSection />}
            {section === 'handel' && <HandelSection />}
        </div>
    );
}
