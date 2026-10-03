'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, TrendingDown, Search, ExternalLink, Newspaper, ArrowUpRight, ChevronDown, X } from 'lucide-react';
import {
    useStooq, useWig20, useNews, useNBPTable,
    type Wig20Quote, type NewsItem, type NBPTable, type NBPRate,
} from '@/lib/hooks';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { WIG20, type Wig20Company } from '@/lib/wig20';
import { matchCompanyNews } from '@/lib/news/match';
import { formatDecimalPL, formatNumber, formatDate, formatRelativeTime, formatTime, percentChange } from '@/lib/formatters';
import { scrollChildInline } from '@/lib/tab-scroll';
import { useScrollFade } from '@/lib/use-scroll-fade';
import { KpiCard } from '@/components/ui/KpiCard';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { RynkiDashboard } from '@/components/sections/RynkiDashboard';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { WatchStar } from '@/components/ui/WatchStar';

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
/** Kurs z separatorem tysięcy — „24 740,00", nie „24740,00". */
function fmtPrice(v: number | null | undefined): string {
    return v != null ? formatNumber(v, 2) : '—';
}

/** Zmiana dzienna jako wypełniona pigułka (wzorzec aplikacji giełdowych): biały tekst na zieleni/czerwieni. */
function ChangePill({ value }: { value: number | null | undefined }) {
    const bg = value == null || value === 0 ? '#64748B' : value > 0 ? CHANGE_UP : CHANGE_DOWN;
    return (
        <span
            className="inline-flex min-w-[4.75rem] shrink-0 items-center justify-center rounded-lg px-2 py-1.5 text-sm font-bold leading-none text-white tnum"
            style={{ background: bg }}
        >
            {fmtPct(value)}
        </span>
    );
}

type QuoteRow = { company: Wig20Company; quote: Wig20Quote | null };

/**
 * Telefon: lista notowań jak w aplikacji giełdowej — nazwa i ticker po lewej, kurs i pigułka zmiany
 * po prawej, cały wiersz (≥60 px) jest linkiem do karty spółki. Od `sm` zostają karty z opisem i newsami.
 */
function QuoteList({ rows }: { rows: QuoteRow[] }) {
    return (
        <div className="mk-card mk-card-editorial overflow-hidden">
            <div className="flex items-center gap-3 border-b border-mk-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">
                <span className="flex-1">Spółka</span>
                <span>Kurs (zł)</span>
                <span className="w-[4.75rem] text-center">Zmiana</span>
            </div>
            <ul className="divide-y divide-mk-border" aria-label="Notowania spółek WIG20">
                {rows.map(({ company, quote }) => (
                    <li key={company.ticker}>
                        <Link
                            href={`/spolki/${company.ticker}`}
                            className="flex min-h-[60px] items-center gap-3 px-4 py-2.5 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt focus:outline-none focus-visible:bg-mk-surface-alt"
                        >
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-semibold leading-snug text-mk-text" title={company.name}>{company.name}</span>
                                <span className="mt-0.5 block truncate text-xs text-mk-muted" title={company.sector}>
                                    <span className="font-semibold text-mk-text-soft">{company.ticker}</span> · {company.sector}
                                </span>
                            </span>
                            <span className="shrink-0 text-right text-[15px] font-semibold text-mk-text tnum">{fmtPrice(quote?.price)}</span>
                            <ChangePill value={quote?.changePct} />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function QuoteListSkeleton() {
    return (
        <div className="mk-card mk-card-editorial divide-y divide-mk-border overflow-hidden" role="status" aria-busy="true" aria-label="Ładowanie spółek">
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex min-h-[60px] items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 space-y-1.5">
                        <div className="mk-skeleton h-4 w-28 rounded" />
                        <div className="mk-skeleton h-3 w-36 rounded" />
                    </div>
                    <div className="mk-skeleton h-4 w-14 rounded" />
                    <div className="mk-skeleton h-7 w-[4.75rem] rounded-lg" />
                </div>
            ))}
        </div>
    );
}

/** Telefon: szerokość rynku w jednym pasku zamiast drugiego hero i czterech kafli. */
function BreadthCard({ up, down, n, avg, date }: { up: number; down: number; n: number; avg: number | null; date: string | null }) {
    if (!n) return null;
    return (
        <div className="mk-card mk-card-editorial p-4">
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="mk-section-label">Szerokość rynku</h3>
                {date && <span className="text-xs text-mk-muted tnum">sesja {formatDate(date)}</span>}
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-mk-surface-alt" aria-hidden>
                <span style={{ width: `${(up / n) * 100}%`, background: CHANGE_UP }} />
                <span className="ml-auto" style={{ width: `${(down / n) * 100}%`, background: CHANGE_DOWN }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2 text-sm tnum">
                <span className="font-semibold" style={{ color: CHANGE_UP }}>▲ {up} rośnie</span>
                <span className="text-mk-muted">śr. <strong className="text-mk-text">{fmtPct(avg)}</strong></span>
                <span className="font-semibold" style={{ color: CHANGE_DOWN }}>{down} spada ▼</span>
            </div>
            <p className="mt-1 text-xs text-mk-muted">z {n} spółek WIG20 z notowaniem</p>
        </div>
    );
}

/**
 * Rząd chipów filtra: na telefonie jeden przewijany wiersz (wychodzi pod krawędź ekranu — ucięty
 * ostatni chip mówi „przewiń"), od `sm` zawija się. Aktywny chip zostaje w kadrze.
 */
function ChipRow({ label, children, activeKey }: { label: string; children: ReactNode; activeKey: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const fade = useScrollFade(ref);
    useEffect(() => {
        const box = ref.current;
        const active = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
        if (box && active) scrollChildInline(box, active);
    }, [activeKey]);
    return (
        <div
            ref={ref}
            role="group"
            aria-label={label}
            data-fade={fade}
            className="mk-fade-x -mx-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">{children}</div>
        </div>
    );
}

const chipClass = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors [-webkit-tap-highlight-color:transparent] lg:min-h-8 lg:px-3 lg:text-xs ${
        active
            ? 'border-mk-primary bg-mk-primary text-white'
            : 'border-mk-border bg-mk-surface text-mk-muted hover:border-mk-primary/40 hover:text-mk-text active:bg-mk-surface-alt'
    }`;

function CompanyNewsList({ items }: { items: NewsItem[] }) {
    if (items.length === 0) {
        return <p className="text-xs text-mk-faint">Brak świeżych newsów o spółce w bieżącej paczce.</p>;
    }
    return (
        <ul className="space-y-2">
            {items.map((n) => (
                <li key={n.link}>
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="group block min-h-6">
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
            <div className="absolute right-2 top-2 z-10">
                <WatchStar kind="spolka" id={company.ticker} label={company.name} variant="inline" />
            </div>
            <div className="flex items-start gap-2 pr-8">
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-md bg-mk-surface-alt px-1.5 py-0.5 text-xs font-bold text-mk-text">{company.ticker}</span>
                <div className="min-w-0">
                    <Link href={`/spolki/${company.ticker}`} className="flex min-h-11 items-center truncate text-base lg:block lg:min-h-6 font-bold leading-tight text-mk-text transition-colors hover:text-mk-primary">
                        {company.name}
                    </Link>
                    <span className="mt-0.5 inline-block rounded-full bg-mk-surface-alt px-2 py-0.5 text-[11px] font-medium text-mk-muted">{company.sector}</span>
                </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold tnum text-mk-text">
                    {fmtPrice(quote?.price)}
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

            <Link href={`/spolki/${company.ticker}`} className="mt-3 inline-flex min-h-11 items-center lg:min-h-6 gap-1 text-sm font-medium text-mk-primary transition-colors hover:underline">
                Szczegóły i wykres <ArrowUpRight size={14} aria-hidden />
            </Link>
        </div>
    );
}

/** Na telefonie najpierw waluty, o które ludzie pytają najczęściej; reszta po „Pokaż wszystkie". */
const FX_FIRST = ['EUR', 'USD', 'CHF', 'GBP', 'JPY', 'CZK'];
const FX_COLLAPSED = FX_FIRST.length;

function NbpFxTable() {
    const fxQ = useNBPTable('a');
    const [showAll, setShowAll] = useState(false);
    const table = useMemo(() => {
        const raw = fxQ.data as NBPTable | NBPTable[] | undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [fxQ.data]);
    const rates: NBPRate[] = useMemo(() => table?.rates ?? [], [table]);
    const mobileRates = useMemo(() => {
        const rank = (code: string) => {
            const i = FX_FIRST.indexOf(code);
            return i === -1 ? FX_FIRST.length : i;
        };
        return [...rates].sort((a, b) => rank(a.code) - rank(b.code) || a.code.localeCompare(b.code));
    }, [rates]);
    const shownMobile = showAll ? mobileRates : mobileRates.slice(0, FX_COLLAPSED);

    const cols: Column<NBPRate>[] = [
        { key: 'currency', header: 'Waluta', sortable: true, sortValue: (r) => r.currency, render: (r) => <span className="capitalize">{r.currency}</span> },
        { key: 'code', header: 'Kod', sortable: true, sortValue: (r) => r.code, render: (r) => <span className="font-semibold text-mk-text">{r.code}</span> },
        { key: 'mid', header: 'Kurs (PLN)', align: 'right', sortable: true, sortValue: (r) => r.mid ?? 0, render: (r) => r.mid != null ? formatDecimalPL(r.mid, 4) : '—' },
    ];

    return (
        <SectionCard
            editorial
            titleVariant="label"
            title="Tabela kursów NBP (tab. A)"
            subtitle={table?.effectiveDate ? `kurs średni · stan na ${formatDate(table.effectiveDate)}` : 'NBP'}
        >
            {fxQ.isLoading ? (
                <div className="mk-skeleton h-[200px] w-full" />
            ) : fxQ.isError ? (
                <QueryState isError onRetry={() => { void fxQ.refetch(); }} height={160} />
            ) : (
                <>
                    {/* Telefon: lista (kod + nazwa po lewej, kurs po prawej) zamiast tabeli z kursem za krawędzią. */}
                    <div className="sm:hidden">
                        <div className="flex items-center justify-between border-b border-mk-border pb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">
                            <span>Waluta</span>
                            <span>Kurs (zł)</span>
                        </div>
                        <ul className="divide-y divide-mk-border">
                            {shownMobile.map((r) => (
                                <li key={r.code} className="flex min-h-12 items-center gap-3 py-2">
                                    <span className="w-11 shrink-0 text-[15px] font-bold text-mk-text">{r.code}</span>
                                    <span className="min-w-0 flex-1 truncate text-sm capitalize text-mk-muted" title={r.currency}>{r.currency}</span>
                                    <span className="shrink-0 text-[15px] font-semibold text-mk-text tnum">{r.mid != null ? formatDecimalPL(r.mid, 4) : '—'}</span>
                                </li>
                            ))}
                        </ul>
                        {mobileRates.length > FX_COLLAPSED && (
                            <button
                                type="button"
                                onClick={() => setShowAll((v) => !v)}
                                aria-expanded={showAll}
                                className="mk-btn mt-3 min-h-11 w-full active:bg-mk-surface-alt"
                            >
                                {showAll ? 'Pokaż mniej' : `Pokaż wszystkie waluty (${mobileRates.length})`}
                                <ChevronDown size={16} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden />
                            </button>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <DataTable columns={cols} rows={rates} initialSort="code" initialDir="asc" rowKey={(r) => r.code} maxHeight={360} />
                    </div>
                </>
            )}
        </SectionCard>
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

    const hasQuery = query.trim().length > 0;

    return (
        <section className="space-y-4 sm:space-y-6" aria-labelledby="spolki-wig20">
            <h2 id="spolki-wig20" className="mk-section-label">Spółki WIG20</h2>

            {/* Telefon: WIG20 jest już w pasie na górze strony — tu tylko szerokość rynku. */}
            <div className="sm:hidden">
                {spolki.isLoading
                    ? <div className="mk-skeleton h-[118px] w-full rounded-2xl" />
                    : <BreadthCard up={summary.up} down={summary.down} n={summary.n} avg={summary.avg} date={wigDate} />}
            </div>

            <div className="hidden sm:block">
            <EditorialHero
                ariaLabel="WIG20 — najważniejszy odczyt"
                period={wigDate ? formatDate(wigDate) : null}
                source="GPW · Yahoo Finance"
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
            </div>

            <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
                <KpiCard label="WIG20" value={wigLast != null ? formatNumber(Math.round(wigLast)) : '—'} unit="pkt" icon={BarChart3}
                    delta={wigDelta != null ? { value: wigDelta, unit: 'pct' } : undefined}                     footnote="indeks 20 największych spółek" loading={wigIndex.isLoading} watchId="wig20"
                    error={wigIndex.isError} onRetry={() => { void wigIndex.refetch(); }} />
                <KpiCard label="Spółki na plusie" value={summary.n ? String(summary.up) : '—'} unit={summary.n ? `z ${summary.n}` : ''} icon={TrendingUp}
                    footnote="rosną na ostatniej sesji" loading={spolki.isLoading}
                    error={spolki.isError} onRetry={() => { void spolki.refetch(); }} />
                <KpiCard label="Spółki na minusie" value={summary.n ? String(summary.down) : '—'} unit={summary.n ? `z ${summary.n}` : ''} icon={TrendingDown}
                    footnote="spadają na ostatniej sesji" loading={spolki.isLoading}
                    error={spolki.isError} onRetry={() => { void spolki.refetch(); }} />
                <KpiCard label="Średnia zmiana" value={summary.avg != null ? fmtPct(summary.avg) : '—'} icon={TrendingUp}
                    footnote="średnia z notowań WIG20" loading={spolki.isLoading}
                    error={spolki.isError} onRetry={() => { void spolki.refetch(); }} />
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mk-faint" aria-hidden />
                        <input
                            type="search"
                            inputMode="search"
                            enterKeyHint="search"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Szukaj: nazwa, ticker, branża"
                            aria-label="Szukaj spółki"
                            className="h-11 w-full rounded-xl border border-mk-border bg-mk-surface pl-9 pr-11 text-base text-mk-text outline-none transition-colors placeholder:text-mk-faint focus:border-mk-primary/60 sm:h-10 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
                        />
                        {hasQuery && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                aria-label="Wyczyść wyszukiwanie"
                                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl text-mk-faint transition-colors hover:text-mk-text active:bg-mk-surface-alt sm:h-10 sm:w-10"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {/* Telefon: przełącznik na pełną szerokość (44 px na dotyku daje sam `.mk-seg`). */}
                    <div className="max-sm:[&_.mk-seg]:w-full! max-sm:[&_.mk-seg-btn]:flex-1">
                        <Segmented value={sort} onChange={setSort} aria-label="Sortowanie"
                            options={[{ value: 'zmiana', label: 'Zmiana %' }, { value: 'nazwa', label: 'A–Z' }, { value: 'kurs', label: 'Kurs' }]} />
                    </div>
                </div>
                <ChipRow label="Branża" activeKey={sector}>
                    <button type="button" aria-pressed={sector === 'all'} className={chipClass(sector === 'all')} onClick={() => setSector('all')}>Wszystkie</button>
                    {sectors.map((s) => (
                        <button key={s} type="button" aria-pressed={sector === s} className={chipClass(sector === s)} onClick={() => setSector(s)}>{s}</button>
                    ))}
                </ChipRow>
            </div>

            {spolki.isLoading ? (
                <>
                    <div className="sm:hidden"><QuoteListSkeleton /></div>
                    <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3" role="status" aria-busy="true" aria-label="Ładowanie spółek">
                        {Array.from({ length: 6 }, (_, i) => <div key={i} className="mk-skeleton h-64 w-full rounded-2xl" />)}
                    </div>
                </>
            ) : spolki.isError ? (
                <SectionCard editorial titleVariant="label">
                    <QueryState isError onRetry={() => { void spolki.refetch(); }} height={160} />
                </SectionCard>
            ) : cards.length === 0 ? (
                <SectionCard editorial titleVariant="label">
                    <div className="py-8 text-center">
                        <p className="text-sm text-mk-muted">Brak spółek dla wybranego filtra.</p>
                        <button type="button" onClick={() => { setQuery(''); setSector('all'); }} className="mk-btn mt-3 min-h-11">
                            Pokaż wszystkie spółki
                        </button>
                    </div>
                </SectionCard>
            ) : (
                <>
                    <div className="sm:hidden">
                        <QuoteList rows={cards} />
                    </div>
                    <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((c) => <CompanyCard key={c.company.ticker} company={c.company} quote={c.quote} news={c.news} />)}
                    </div>
                </>
            )}

            <p className="text-xs text-mk-faint">
                Kursy i zmiana dzienna: Yahoo Finance (GPW){spolki.data ? ` · ${spolki.data.ok}/${spolki.data.count} spółek z notowaniem` : ''}. Newsy: agregator RSS
                dopasowany po nazwie spółki. Opisy branż mają charakter informacyjny — to nie rekomendacja inwestycyjna.
            </p>
        </section>
    );
}

export default function RynkiPage() {
    // Kolejność na telefonie (< lg): indeksy i KPI → wykres WIG20 → notowania spółek → kursy NBP → newsy.
    // Desktop bez zmian: dashboard (z newsami obok wykresu) → tabela NBP → spółki.
    return (
        <div className="mk-fade-in flex flex-col gap-4 md:gap-5">
            <PageHeader title="Rynki" />

            <RynkiDashboard />

            <div className="min-w-0 max-lg:order-2">
                <NbpFxTable />
            </div>

            <div className="min-w-0 max-lg:order-1">
                <SpolkiSection />
            </div>

            <div className="min-w-0 max-lg:order-3 lg:hidden">
                <RelatedNews topic="rynki" limit={5} title="Newsy rynkowe" />
            </div>
        </div>
    );
}
