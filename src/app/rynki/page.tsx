'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { InsightBar } from '@/components/ui/InsightBar';
import type { Observation } from '@/lib/observations';
import { BarChart3, TrendingUp, TrendingDown, Search, ExternalLink, Newspaper, ArrowUpRight } from 'lucide-react';
import {
    useStooq, useWig20, useNews,
    type Wig20Quote, type NewsItem,
} from '@/lib/hooks';
import { WIG20, type Wig20Company } from '@/lib/wig20';
import { matchCompanyNews } from '@/lib/news/match';
import { formatDecimalPL, formatNumber, formatDate, formatRelativeTime, formatTime, percentChange } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { RynkiDashboard } from '@/components/sections/RynkiDashboard';
import { DensePageLayout } from '@/components/ui/DensePageLayout';
import { PageHeader } from '@/components/ui/PageHeader';

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

    const newsByTicker = useMemo(() => {
        const items = news.data?.items ?? [];
        const m = new Map<string, NewsItem[]>();
        for (const c of WIG20) m.set(c.ticker, matchCompanyNews(items, c.aliases, 2));
        return m;
    }, [news.data]);

    const sectors = useMemo(() => Array.from(new Set(WIG20.map((c) => c.sector))).sort((a, b) => a.localeCompare(b, 'pl')), []);

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
    const wigDate = barsOf(wigIndex).at(-1)?.date ?? null;

    const heroHeadline = wigLast == null ? 'WIG20'
        : wigDelta != null && wigDelta > 0 ? 'WIG20 rośnie'
        : wigDelta != null && wigDelta < 0 ? 'WIG20 spada'
        : 'WIG20';

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
            <EditorialHero
                ariaLabel="WIG20 — najważniejszy odczyt"
                period={wigDate ? formatDate(wigDate) : null}
                source="GPW · Stooq/Yahoo"
                headline={heroHeadline}
                description={
                    <>
                        Indeks 20 największych spółek Giełdy Papierów Wartościowych.
                        {summary.n ? ` Na ostatniej sesji na plusie ${summary.up} z ${summary.n} spółek.` : ''}
                    </>
                }
                value={wigLast != null ? formatNumber(Math.round(wigLast)) : '—'}
                unit="pkt"
                delta={wigDelta}
                deltaUnit="%"
                valueCaption="Indeks blue chip · GPW"
                panelTitle="Szerokość rynku"
                rows={[
                    { label: 'Spółki na plusie', value: summary.n ? `${summary.up} z ${summary.n}` : '—' },
                    { label: 'Spółki na minusie', value: summary.n ? `${summary.down} z ${summary.n}` : '—' },
                    { label: 'Średnia zmiana', value: summary.avg != null ? fmtPct(summary.avg) : '—', divider: true },
                ]}
            />

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

export default function RynkiPage() {
    return (
        <DensePageLayout>
            <PageHeader title="Rynki" />

            <RynkiDashboard />

            <SpolkiSection />
        </DensePageLayout>
    );
}
