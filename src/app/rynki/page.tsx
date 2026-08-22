'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useInitialTab } from '@/lib/use-initial-tab';
import { InsightBar } from '@/components/ui/InsightBar';
import type { Observation } from '@/lib/observations';
import { Euro, DollarSign, Coins, PoundSterling, Fuel, Flame, Gem, Factory, BarChart3, TrendingUp, TrendingDown, Search, ExternalLink, Newspaper, ArrowUpRight } from 'lucide-react';
import {
    useNBPTable, useNBPCurrencyHistory, useGold, useStooq, useWig20, useNews,
    type NBPTable, type NBPRate, type Wig20Quote, type NewsItem,
} from '@/lib/hooks';
import { WIG20, type Wig20Company } from '@/lib/wig20';
import { matchCompanyNews } from '@/lib/news/match';
import { lastOf, prevOf, monthTick, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, formatRelativeTime, formatTime, percentChange } from '@/lib/formatters';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { RynkiStopySection } from '@/components/sections/RynkiStopySection';
import { RynkiDashboard } from '@/components/sections/RynkiDashboard';
import { DensePageLayout } from '@/components/ui/DensePageLayout';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

type Section = 'spolki' | 'kursy' | 'stopy' | 'gpw';
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

// ═══ SPÓŁKI WIG20 ═══
// Widok dla inwestora detalicznego: wszystkie spółki WIG20 w jednym miejscu — żywy kurs, zmiana
// dzienna, krótki opis działalności oraz dopasowane newsy (aliasy z lib/wig20.ts). U góry „nastroje
// rynku" liczone z realnych notowań. Filtr po branży, szukajka i sortowanie. Klik → strona spółki.
type SortKey = 'zmiana' | 'nazwa' | 'kurs';

const CHANGE_UP = '#15803D';
const CHANGE_DOWN = '#B91C1C';

function changeColor(v: number | null | undefined): string {
    if (v == null) return '#64748B';
    return v >= 0 ? CHANGE_UP : CHANGE_DOWN;
}
function fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return `${v > 0 ? '+' : ''}${formatDecimalPL(v, 2)}%`;
}

function CompanyNewsList({ items }: { items: NewsItem[] }) {
    if (items.length === 0) {
        return <p className="text-xs text-mk-faint">Brak świeżych newsów o spółce w bieżącej paczce.</p>;
    }
    return (
        <ul className="space-y-2">
            {items.map((n) => (
                <li key={n.link}>
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="group block">
                        <span className="line-clamp-2 text-xs font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-primary">{n.title}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mk-muted">
                            <span>{n.source}</span>
                            <span className="text-mk-faint">·</span>
                            <time dateTime={n.publishedAt}>{formatRelativeTime(n.publishedAt) || formatTime(n.publishedAt)}</time>
                            <ExternalLink size={11} className="shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

function CompanyCard({ company, quote, news }: { company: Wig20Company; quote: Wig20Quote | null; news: NewsItem[] }) {
    const change = quote?.changePct ?? null;
    return (
        <div className="mk-card mk-card-editorial mk-card-pad relative flex flex-col">
            <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-md bg-mk-surface-alt px-1.5 py-0.5 text-xs font-bold text-mk-text">{company.ticker}</span>
                <div className="min-w-0">
                    <Link href={`/spolki/${company.ticker}`} className="block truncate text-base font-bold leading-tight text-mk-text transition-colors hover:text-mk-primary">
                        {company.name}
                    </Link>
                    <span className="mt-0.5 inline-block rounded-full bg-mk-surface-alt px-2 py-0.5 text-[11px] font-medium text-mk-muted">{company.sector}</span>
                </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold tnum text-mk-text">
                    {quote?.price != null ? formatDecimalPL(quote.price, 2) : '—'}
                    <span className="ml-1 text-sm font-semibold text-mk-muted">zł</span>
                </span>
                <span className="text-sm font-bold tnum" style={{ color: changeColor(change) }}>{fmtPct(change)}</span>
            </div>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mk-text-soft">{company.description}</p>

            <div className="mt-3 flex-1 border-t border-mk-border pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-mk-muted">
                    <Newspaper size={13} aria-hidden />
                    <span>Newsy o spółce</span>
                    {news.length > 0 && <span className="rounded-full bg-mk-primary/10 px-1.5 text-[11px] font-bold text-mk-primary">{news.length}</span>}
                </div>
                <CompanyNewsList items={news} />
            </div>

            <Link href={`/spolki/${company.ticker}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-mk-primary transition-colors hover:underline">
                Szczegóły i wykres <ArrowUpRight size={14} aria-hidden />
            </Link>
        </div>
    );
}

function SpolkiSection() {
    const spolki = useWig20();
    const wigIndex = useStooq('wig20', 30);
    const news = useNews();

    const [query, setQuery] = useState('');
    const [sector, setSector] = useState<string>('all');
    const [sort, setSort] = useState<SortKey>('zmiana');

    const quoteByTicker = useMemo(() => {
        const m = new Map<string, Wig20Quote>();
        (spolki.data?.items ?? []).forEach((q) => m.set(q.ticker, q));
        return m;
    }, [spolki.data]);

    // Dopasowanie newsów po aliasach spółki (lib/news/match.ts) — tytuł liczy się zawsze, opis tylko
    // dla jednoznacznych nazw. Liczone raz z jednej paczki /api/news dla wszystkich spółek.
    const newsByTicker = useMemo(() => {
        const items = news.data?.items ?? [];
        const m = new Map<string, NewsItem[]>();
        for (const c of WIG20) m.set(c.ticker, matchCompanyNews(items, c.aliases, 2));
        return m;
    }, [news.data]);

    const sectors = useMemo(() => Array.from(new Set(WIG20.map((c) => c.sector))).sort((a, b) => a.localeCompare(b, 'pl')), []);

    // Nastroje rynku — WYŁĄCZNIE z żywych notowań (bez zmyślonych liczb): szerokość rynku i liderzy.
    const summary = useMemo(() => {
        const valid = (spolki.data?.items ?? []).filter((q): q is Wig20Quote & { changePct: number } => q.changePct != null);
        const up = valid.filter((q) => q.changePct > 0).length;
        const down = valid.filter((q) => q.changePct < 0).length;
        const sorted = [...valid].sort((a, b) => b.changePct - a.changePct);
        const avg = valid.length ? valid.reduce((s, q) => s + q.changePct, 0) / valid.length : null;
        return { up, down, n: valid.length, top: sorted[0] ?? null, bottom: sorted[sorted.length - 1] ?? null, avg };
    }, [spolki.data]);

    const wigLast = lastCloseOf(wigIndex);
    const wigDelta = pctDelta(barsOf(wigIndex));

    const moodInsights = useMemo<Observation[]>(() => {
        const out: Observation[] = [];
        if (summary.top && summary.top.changePct > 0) {
            const c = WIG20.find((x) => x.ticker === summary.top!.ticker);
            out.push({ kind: 'trend', tone: 'up', text: `Najmocniej rośnie ${c?.name ?? summary.top.ticker} (${summary.top.ticker}): ${fmtPct(summary.top.changePct)} dziś` });
        }
        if (summary.bottom && summary.bottom.changePct < 0) {
            const c = WIG20.find((x) => x.ticker === summary.bottom!.ticker);
            out.push({ kind: 'trend', tone: 'down', text: `Najmocniej spada ${c?.name ?? summary.bottom.ticker} (${summary.bottom.ticker}): ${fmtPct(summary.bottom.changePct)} dziś` });
        }
        return out;
    }, [summary]);

    const cards = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = WIG20.map((c) => ({ company: c, quote: quoteByTicker.get(c.ticker) ?? null, news: newsByTicker.get(c.ticker) ?? [] }));
        if (sector !== 'all') list = list.filter((x) => x.company.sector === sector);
        if (q) list = list.filter((x) => x.company.name.toLowerCase().includes(q) || x.company.ticker.toLowerCase().includes(q) || x.company.sector.toLowerCase().includes(q));
        list = [...list].sort((a, b) => {
            if (sort === 'nazwa') return a.company.name.localeCompare(b.company.name, 'pl');
            if (sort === 'kurs') return (b.quote?.price ?? -1) - (a.quote?.price ?? -1);
            return (b.quote?.changePct ?? -999) - (a.quote?.changePct ?? -999);
        });
        return list;
    }, [query, sector, sort, quoteByTicker, newsByTicker]);

    const pill = (active: boolean) =>
        `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? 'border-mk-primary bg-mk-primary text-white' : 'border-mk-border bg-mk-surface text-mk-muted hover:border-mk-primary/40 hover:text-mk-text'}`;

    return (
        <div className="space-y-6">
            {/* Nastroje rynku — szerokość + poziom indeksu z żywych danych */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="WIG20" value={wigLast != null ? formatNumber(Math.round(wigLast)) : '—'} unit="pkt" icon={BarChart3}
                    delta={wigDelta != null ? { value: wigDelta, unit: 'pct' } : undefined} footnote="indeks 20 największych spółek" loading={wigIndex.isLoading} watchId="wig20" />
                <KpiCard label="Spółki na plusie" value={summary.n ? String(summary.up) : '—'} unit={summary.n ? `z ${summary.n}` : ''} icon={TrendingUp}
                    footnote="rosną na ostatniej sesji" loading={spolki.isLoading} />
                <KpiCard label="Spółki na minusie" value={summary.n ? String(summary.down) : '—'} unit={summary.n ? `z ${summary.n}` : ''} icon={TrendingDown}
                    footnote="spadają na ostatniej sesji" loading={spolki.isLoading} />
                <KpiCard label="Średnia zmiana" value={summary.avg != null ? fmtPct(summary.avg) : '—'} icon={TrendingUp}
                    footnote="średnia z notowań WIG20" loading={spolki.isLoading} />
            </div>

            {moodInsights.length > 0 && <InsightBar items={moodInsights} />}

            {/* Pasek narzędzi — szukajka, sortowanie, filtr branż */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mk-faint" aria-hidden />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Szukaj spółki (nazwa, ticker, branża)…"
                            aria-label="Szukaj spółki"
                            className="h-10 w-full rounded-xl border border-mk-border bg-mk-surface pl-9 pr-3 text-sm text-mk-text outline-none transition-colors placeholder:text-mk-faint focus:border-mk-primary/60"
                        />
                    </div>
                    <Segmented value={sort} onChange={setSort} aria-label="Sortowanie"
                        options={[{ value: 'zmiana', label: 'Zmiana %' }, { value: 'nazwa', label: 'A–Z' }, { value: 'kurs', label: 'Kurs' }]} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className={pill(sector === 'all')} onClick={() => setSector('all')}>Wszystkie</button>
                    {sectors.map((s) => (
                        <button key={s} type="button" className={pill(sector === s)} onClick={() => setSector(s)}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Karty spółek */}
            {spolki.isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => <div key={i} className="mk-skeleton h-64 w-full rounded-2xl" />)}
                </div>
            ) : cards.length === 0 ? (
                <SectionCard editorial titleVariant="label"><p className="py-8 text-center text-sm text-mk-muted">Brak spółek dla wybranego filtra.</p></SectionCard>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => <CompanyCard key={c.company.ticker} company={c.company} quote={c.quote} news={c.news} />)}
                </div>
            )}

            <p className="text-xs text-mk-faint">
                Kursy i zmiana dzienna: Yahoo Finance (GPW){spolki.data ? ` · ${spolki.data.ok}/${spolki.data.count} spółek z notowaniem` : ''}. Newsy: agregator RSS
                dopasowany po nazwie spółki. Opisy branż mają charakter informacyjny — to nie rekomendacja inwestycyjna.
            </p>
        </div>
    );
}

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

            <div className="mk-card mk-card-editorial mk-card-pad text-sm text-mk-text-soft">
                Szukasz pojedynczych spółek? Wszystkie 20 firm z WIG20 — z kursem, opisem i dopasowanymi
                newsami — znajdziesz w zakładce <Link href="/rynki?tab=spolki" className="font-medium text-mk-primary hover:underline">Spółki</Link>.
            </div>

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
    { value: 'spolki', label: 'Spółki' },
    { value: 'gpw', label: 'Indeksy GPW' },
    { value: 'kursy', label: 'Kursy walut' },
    { value: 'stopy', label: 'Stopy i WIBOR' },
];

export default function RynkiPage() {
    const [section, setSection] = useState<Section>('spolki');
    useInitialTab(SECTIONS.map((s) => s.value), setSection);
    return (
        <DensePageLayout>
            <PageHeader
                eyebrow={<PageEyebrow section="Rynki" />}
                title="Rynki"
                subtitle="Spółki WIG20, indeksy GPW, kursy walut i stopy procentowe"
                actions={<Segmented value={section} onChange={setSection} options={SECTIONS} aria-label="Sekcja" />}
            />

            <RynkiDashboard />

            <div key={section} className="mk-fade-in">
                {section === 'spolki' && <SpolkiSection />}
                {section === 'gpw' && <GpwSection />}
                {section === 'kursy' && <KursySection />}
                {section === 'stopy' && <RynkiStopySection />}
            </div>
        </DensePageLayout>
    );
}
