'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInitialTab } from '@/lib/use-initial-tab';
import { InsightBar } from '@/components/ui/InsightBar';
import type { Observation } from '@/lib/observations';
import { Euro, DollarSign, Coins, PoundSterling, Fuel, Flame, Gem, Factory, BarChart3 } from 'lucide-react';
import {
    useNBPTable, useNBPCurrencyHistory, useGold, useStooq, useWig20,
    type NBPTable, type NBPRate, type Wig20Quote,
} from '@/lib/hooks';
import { lastOf, prevOf, monthTick, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { RynkiStopySection } from '@/components/sections/RynkiStopySection';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

type Section = 'kursy' | 'stopy' | 'gpw';
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

    const kpis: { label: string; code: string; hist: Hist | undefined; accent: AccentKey; icon: typeof Euro; watchId?: string }[] = [
        { label: 'EUR / PLN', code: 'EUR', hist: eurH.data as Hist, accent: 'blue', icon: Euro, watchId: 'eur-pln' },
        { label: 'USD / PLN', code: 'USD', hist: usdH.data as Hist, accent: 'green', icon: DollarSign, watchId: 'usd-pln' },
        { label: 'CHF / PLN', code: 'CHF', hist: chfH.data as Hist, accent: 'rose', icon: Coins },
        { label: 'GBP / PLN', code: 'GBP', hist: gbpH.data as Hist, accent: 'violet', icon: PoundSterling },
    ];

    // Auto-analiza kursów (dane dzienne 90 dni) — zmiana tygodniowa + pozycja w zakresie 90 dni.
    const fxInsights = useMemo(() => {
        const sig = (label: string, h?: Hist): Observation[] => {
            const vals = histPoints(h).map((p) => p.value);
            if (vals.length < 6) return [];
            const last = vals[vals.length - 1];
            const wkAgo = vals[vals.length - 6];
            const chg = wkAgo ? (last / wkAgo - 1) * 100 : 0;
            const hi = Math.max(...vals), lo = Math.min(...vals), range = hi - lo;
            const out: Observation[] = [];
            if (Math.abs(chg) >= 0.4) out.push({ kind: 'trend', tone: chg > 0 ? 'up' : 'down', text: `${label}: ${chg > 0 ? '+' : ''}${formatDecimalPL(chg, 1)}% w tygodniu (${formatDecimalPL(last, 3)} zł)` });
            if (range > 0) {
                const pos = (last - lo) / range;
                if (pos >= 0.85) out.push({ kind: 'record', tone: 'up', text: `${label}: blisko 90-dniowego maksimum (${formatDecimalPL(last, 3)} zł)` });
                else if (pos <= 0.15) out.push({ kind: 'record', tone: 'down', text: `${label}: blisko 90-dniowego minimum (${formatDecimalPL(last, 3)} zł)` });
            }
            return out;
        };
        return [...sig('EUR/PLN', eurH.data as Hist), ...sig('USD/PLN', usdH.data as Hist)].slice(0, 4);
    }, [eurH.data, usdH.data]);

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
                        footnote={table?.effectiveDate ? `NBP ${formatDate(table.effectiveDate)}` : 'NBP tab. A'} loading={tableQ.isLoading} watchId={k.watchId} />
                ))}
            </div>

            {fxInsights.length > 0 && <InsightBar items={fxInsights} />}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SectionCard editorial titleVariant="label" className="lg:col-span-2" title="Kursy walut — historia 90 dni" subtitle="NBP · EUR / USD / CHF / GBP"
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
                <SectionCard editorial titleVariant="label" title="Złoto (NBP)" subtitle="cena 1 g w PLN">
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

            <SectionCard editorial titleVariant="label" title="Tabela kursów NBP (tab. A)" subtitle={table?.effectiveDate ? `stan na ${formatDate(table.effectiveDate)}` : 'NBP'}
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
    // Indeksy GPW. WIG20/mWIG40/sWIG80 mają historię — seria z ETF-a replikującego (WIG20TR/
    // mWIG40TR/sWIG80TR) skalowana do poziomu indeksu. WIG (szeroki) zostaje z 1 punktem: Yahoo nie
    // ma dla niego serii, a ETF na szeroki WIG nie istnieje — patrz komentarz w api/stooq/route.ts.
    const wig20 = useStooq('wig20', 60);
    const wig = useStooq('wig', 2);
    const mwig = useStooq('mwig40', 60);
    const swig = useStooq('swig80', 60);
    // Surowce — pełna historia (Yahoo Finance)
    const brent = useStooq('cb.c', 90);
    const wti = useStooq('cl.c', 90);
    const gold = useStooq('gc.c', 90);
    const copper = useStooq('hg.c', 90);
    const gas = useStooq('ng.c', 90);

    const wig20Chart = useMemo(() => barsOf(wig20).map((b) => ({ date: b.date, value: b.close })), [wig20.data]);

    // Spółki WIG20 — jedno zbiorcze żądanie (/api/wig20), tickery zweryfikowane u źródła (lib/wig20.ts).
    const router = useRouter();
    const spolki = useWig20();
    const spolkiCols: Column<Wig20Quote>[] = [
        { key: 'ticker', header: 'Ticker', sortable: true, sortValue: (r) => r.ticker, render: (r) => <span className="font-semibold text-mk-text">{r.ticker}</span> },
        { key: 'name', header: 'Spółka', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="text-mk-text">{r.name}</span> },
        { key: 'price', header: 'Kurs (zł)', align: 'right', sortable: true, sortValue: (r) => r.price ?? -1, render: (r) => r.price != null ? formatDecimalPL(r.price, 2) : '—' },
        {
            key: 'changePct', header: 'Zmiana', align: 'right', sortable: true, sortValue: (r) => r.changePct ?? -999,
            render: (r) => r.changePct == null ? '—' : (
                <span style={{ color: r.changePct >= 0 ? '#15803D' : '#B91C1C', fontWeight: 600 }}>
                    {r.changePct > 0 ? '+' : ''}{formatDecimalPL(r.changePct, 2)}%
                </span>
            ),
        },
    ];

    // Porównanie indeksów — REBAZOWANE DO 100. WIG20 ≈ 3,8 tys., mWIG40 ≈ 9,9 tys., sWIG80 ≈ 30 tys.,
    // więc na wspólnej osi w wartościach bezwzględnych WIG20 byłby płaską linią przy zerze. Rebazowanie
    // do 100 na starcie okna to jedyny poprawny sposób porównania ich dynamiki na JEDNEJ osi
    // (druga oś Y byłaby antywzorcem — dwie skale sugerują korelację, której nie ma).
    const indexChart = useMemo(() => {
        const src = [{ key: 'wig20', q: wig20 }, { key: 'mwig40', q: mwig }, { key: 'swig80', q: swig }];
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
    }, [wig20.data, mwig.data, swig.data]);

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
                            footnote={bars.length > 2 ? 'GPW · notowania' : 'GPW · poziom bieżący'} loading={ix.q.isLoading}
                            watchId={ix.label === 'WIG20' ? 'wig20' : undefined} />
                    );
                })}
            </div>

            <SectionCard editorial titleVariant="label" title="WIG20 — 60 sesji" subtitle="poziom indeksu · seria z ETF WIG20TR skalowana do poziomu indeksu (Yahoo)"
                actions={<CsvExport filename="wig20" headers={['Data', 'Zamknięcie']} rows={wig20Chart.map((r) => [r.date, r.value])} />}>
                {wig20Chart.length < 2 ? <div className="mk-skeleton h-[280px] w-full" /> : (
                    <InteractiveChart data={wig20Chart} xKey="date" height={280} showRange initialRange="ALL"
                        valueFormatter={(v) => formatNumber(Math.round(v))} xTickFormatter={monthTick}
                        series={[{ key: 'value', name: 'WIG20', color: '#2563EB', type: 'area', strokeWidth: 2.5 }]} />
                )}
            </SectionCard>

            <SectionCard editorial titleVariant="label" title="Indeksy GPW — dynamika (rebazowane do 100)"
                subtitle="porównanie zmian %: WIG20, mWIG40, sWIG80 · serie z ETF-ów replikujących (Yahoo)"
                actions={<CsvExport filename="indeksy-gpw" headers={['Data', 'WIG20', 'mWIG40', 'sWIG80']} rows={indexChart.map((r) => [r.date, r.wig20, r.mwig40, r.swig80])} />}>
                {indexChart.length < 2 ? <div className="mk-skeleton h-[320px] w-full" /> : (
                    <InteractiveChart data={indexChart} xKey="date" height={320} legend showRange initialRange="3M"
                        valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick} referenceLines={[{ y: 100, color: '#CBD2DD' }]}
                        series={[
                            { key: 'wig20', name: 'WIG20', color: '#2563EB', type: 'line' },
                            { key: 'mwig40', name: 'mWIG40', color: '#7C3AED', type: 'line' },
                            { key: 'swig80', name: 'sWIG80', color: '#0891B2', type: 'line' },
                        ]} />
                )}
            </SectionCard>

            <SectionCard editorial titleVariant="label" title="Spółki WIG20" subtitle={`kurs i zmiana dzienna · Yahoo Finance (GPW)${spolki.data ? ` · ${spolki.data.ok}/${spolki.data.count} spółek` : ''}`}
                actions={<CsvExport filename="spolki-wig20" headers={['Ticker', 'Spółka', 'Kurs', 'Zmiana %']} rows={(spolki.data?.items ?? []).map((s) => [s.ticker, s.name, s.price, s.changePct])} />}>
                {spolki.isLoading ? <div className="mk-skeleton h-[420px] w-full" /> : (
                    <DataTable columns={spolkiCols} rows={spolki.data?.items ?? []} initialSort="changePct" rowKey={(r) => r.ticker} maxHeight={420} onRowClick={(r) => router.push(`/spolki/${r.ticker}`)} />
                )}
            </SectionCard>

            {/* Surowce */}
            <div>
                <h3 className="mk-section-label mb-3">Surowce</h3>
                <p className="-mt-2 mb-3 text-sm text-mk-muted">Notowania światowe, także czynniki inflacji (Yahoo Finance)</p>
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

            <SectionCard editorial titleVariant="label" title="Surowce — dynamika (rebazowane do 100)" subtitle="porównanie zmian %: ropa Brent/WTI, złoto, miedź, gaz ziemny"
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

const SECTIONS: { value: Section; label: string }[] = [
    { value: 'kursy', label: 'Kursy walut' },
    { value: 'stopy', label: 'Stopy i WIBOR' },
    { value: 'gpw', label: 'GPW' },
];

export default function RynkiPage() {
    const [section, setSection] = useState<Section>('kursy');
    useInitialTab(SECTIONS.map((s) => s.value), setSection);
    return (
        <div className="mk-fade-in space-y-8">
            <PageHeader
                eyebrow={<PageEyebrow section="Rynki" />}
                title="Rynki"
                subtitle="Kursy walut, złoto, GPW i stopy procentowe"
                actions={<Segmented value={section} onChange={setSection} options={SECTIONS} aria-label="Sekcja" />}
            />

            {/* Newsy powiązane — nad danymi, nie na dole strony (zlecenie właściciela). */}
            <RelatedNews topic="rynki" />

            <div key={section} className="mk-fade-in">
                {section === 'kursy' && <KursySection />}
                {section === 'stopy' && <RynkiStopySection />}
                {section === 'gpw' && <GpwSection />}
            </div>
        </div>
    );
}
