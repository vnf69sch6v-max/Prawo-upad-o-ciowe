'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { useWig20, useStooq, useNews } from '@/lib/hooks';
import { WIG20 } from '@/lib/wig20';
import { matchCompanyNews } from '@/lib/news/match';
import { useWatchlist } from '@/lib/watchlist';
import { formatDate, formatDecimalPL, formatNumber, formatRelativeTime, formatTime, percentChange } from '@/lib/formatters';
import { dayTick } from '@/lib/series';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';

const CHANGE_UP = '#15803D';
const CHANGE_DOWN = '#B91C1C';

type Point = { date: string; value: number };

function fmtSignedPct(v: number | null): string {
    if (v == null) return '—';
    return `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}`;
}

/**
 * Zmiana od pierwszej sesji nie starszej niż `months` miesięcy przed ostatnią.
 * `null`, gdy historia jest za krótka (pierwszy punkt młodszy od celu o >10 dni) — nie udajemy roku z pół roku.
 */
function changeSince(chart: Point[], months: number): { pct: number; from: string } | null {
    if (chart.length < 2) return null;
    const last = chart[chart.length - 1];
    const target = new Date(`${last.date}T12:00:00Z`);
    target.setUTCMonth(target.getUTCMonth() - months);
    const targetMs = target.getTime();
    const start = chart.find((p) => new Date(`${p.date}T12:00:00Z`).getTime() >= targetMs);
    if (!start || start === last) return null;
    if (new Date(`${start.date}T12:00:00Z`).getTime() - targetMs > 10 * 86_400_000) return null;
    return { pct: percentChange(last.value, start.value), from: start.date };
}

/**
 * Oś Y ma stałą szerokość, więc „165,00" traci pierwszą cyfrę. Dokładność rośnie, gdy kurs maleje:
 * ≥1000 zł bez groszy, ≥100 zł z jednym miejscem, niżej z dwoma (tak też w dymku).
 */
function priceTick(v: number): string {
    const a = Math.abs(v);
    return a >= 1000 ? formatNumber(Math.round(v)) : formatDecimalPL(v, a >= 100 ? 1 : 2);
}

/** Obserwowanie jako pełny przycisk ≥44 px z podpisem — gwiazdka 28 px była za mała pod kciuk. */
function WatchButton({ ticker, name }: { ticker: string; name: string }) {
    const { has, toggle, ready } = useWatchlist();
    const on = ready && has('spolka', ticker);
    return (
        <button
            type="button"
            onClick={() => toggle('spolka', ticker)}
            aria-pressed={on}
            aria-label={on ? `${name} — przestań obserwować` : `${name} — obserwuj`}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold transition-colors [-webkit-tap-highlight-color:transparent] lg:min-h-9 ${
                on
                    ? 'border-mk-primary/30 bg-mk-primary-soft text-mk-primary active:bg-mk-primary/15'
                    : 'border-mk-border-strong bg-mk-surface text-mk-text-soft hover:bg-mk-surface-alt active:bg-mk-surface-alt'
            }`}
        >
            <Star size={16} className={on ? 'fill-mk-primary text-mk-primary' : ''} aria-hidden />
            {on ? 'Obserwujesz' : 'Obserwuj'}
        </button>
    );
}

/** Pozycja ostatniego kursu w przedziale 52 tygodni — pasek jak w kartach spółek aplikacji giełdowych. */
function RangeBar({ min, max, last }: { min: number; max: number; last: number | null }) {
    const pos = last != null && max > min ? Math.min(100, Math.max(0, ((last - min) / (max - min)) * 100)) : null;
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3 text-xs text-mk-muted">
                <span>min. 52 tyg.</span>
                <span>maks. 52 tyg.</span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-mk-surface-alt" aria-hidden>
                {pos != null && (
                    <span
                        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-mk-surface bg-mk-text shadow"
                        style={{ left: `${pos}%` }}
                    />
                )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 text-sm font-semibold text-mk-text tnum">
                <span>{formatNumber(min, 2)} zł</span>
                <span>{formatNumber(max, 2)} zł</span>
            </div>
        </div>
    );
}

export default function SpolkaPage() {
    const params = useParams<{ ticker: string }>();
    const ticker = (params?.ticker ?? '').toUpperCase();
    const company = WIG20.find((c) => c.ticker === ticker) ?? null;

    const quotes = useWig20();
    // Pojedyncze spółki GPW mają na Yahoo pełną historię dzienną (inaczej niż same indeksy) —
    // route obsługuje sufiks `.WA` i idzie prosto do Yahoo.
    // Rok sesji (Yahoo `range=1y`): zakres 52 tygodni + przełączniki 1M/3M/6M/ALL, które coś zmieniają.
    const hist = useStooq(company ? `${ticker}.WA` : '', 250);
    const news = useNews();

    const quote = quotes.data?.items.find((q) => q.ticker === ticker) ?? null;
    const chart = useMemo<Point[]>(
        () => (hist.data?.data ?? []).map((b) => ({ date: b.date, value: b.close })),
        [hist.data],
    );
    // Zakres 52 tygodni (min–max zamknięć z ostatniego roku) — standard kart spółek.
    const range52w = useMemo(() => {
        if (chart.length < 2) return null;
        const vals = chart.map((c) => c.value);
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [chart]);
    const ch1m = useMemo(() => changeSince(chart, 1), [chart]);
    const ch1y = useMemo(() => changeSince(chart, 12), [chart]);
    const lastClose = chart.length ? chart[chart.length - 1] : null;
    const fromHigh = range52w && lastClose ? percentChange(lastClose.value, range52w.max) : null;
    const companyNews = useMemo(
        () => (company ? matchCompanyNews(news.data?.items ?? [], company.aliases, 8) : []),
        [news.data, company],
    );

    const backLink = (label: string) => (
        <Link
            href="/rynki"
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-mk-primary transition-colors [-webkit-tap-highlight-color:transparent] hover:underline active:bg-mk-surface-alt lg:min-h-8"
        >
            <ArrowLeft size={16} aria-hidden /> {label}
        </Link>
    );

    if (!company) {
        return (
            <div className="mk-fade-in space-y-4">
                {backLink('Wróć do spółek')}
                <SectionCard title="Nie znamy tej spółki">
                    <p className="text-sm text-mk-muted">
                        Ticker „{ticker}” nie należy do składu WIG20, który obsługujemy. Lista spółek jest
                        w zakładce Rynki → Spółki.
                    </p>
                </SectionCard>
            </div>
        );
    }

    const price = quote?.price ?? null;
    const change = quote?.changePct ?? null;
    const pillBg = change == null || change === 0 ? '#64748B' : change > 0 ? CHANGE_UP : CHANGE_DOWN;

    return (
        <div className="mk-fade-in space-y-4 sm:space-y-6">
            <div>
                {backLink('Spółki WIG20')}
                <div className="mt-1 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-extrabold tracking-tight text-mk-text sm:text-3xl">{company.name}</h1>
                        <p className="mt-1 text-sm text-mk-muted">
                            <span className="font-semibold text-mk-text-soft">{ticker}</span> · GPW · {company.sector}
                        </p>
                    </div>
                    <WatchButton ticker={ticker} name={company.name} />
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mk-text-soft">{company.description}</p>
            </div>

            {/* Jedna liczba na górze: kurs + zmiana dzienna, pod nią pozycja w przedziale 52 tygodni. */}
            <section className="mk-card mk-card-editorial p-4 sm:p-5" aria-label="Kurs spółki">
                <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-10">
                    <div>
                        <p className="mk-section-label">
                            Kurs{quote?.date ? ` · sesja ${formatDate(quote.date)}` : ''}
                        </p>
                        {quotes.isLoading ? (
                            <div className="mt-2 space-y-2">
                                <div className="mk-skeleton h-10 w-40 rounded" />
                                <div className="mk-skeleton h-6 w-24 rounded" />
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                                <span className="text-4xl font-extrabold tracking-tight text-mk-text tnum">
                                    {price != null ? formatNumber(price, 2) : '—'}
                                    <span className="ml-1 text-xl font-semibold text-mk-muted">zł</span>
                                </span>
                                <span
                                    className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-bold leading-none text-white tnum"
                                    style={{ background: pillBg }}
                                >
                                    {change == null ? '—' : `${change > 0 ? '+' : ''}${formatDecimalPL(change, 2)}%`}
                                </span>
                                <span className="text-xs text-mk-muted">zmiana dzienna</span>
                            </div>
                        )}
                        <p className="mt-2 text-xs text-mk-faint">Yahoo Finance (GPW)</p>
                    </div>
                    {hist.isLoading ? (
                        <div className="mk-skeleton h-[70px] w-full rounded" />
                    ) : range52w ? (
                        <RangeBar min={range52w.min} max={range52w.max} last={price ?? lastClose?.value ?? null} />
                    ) : null}
                </div>
            </section>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <KpiCard label="Zmiana 1 mies." value={fmtSignedPct(ch1m?.pct ?? null)} unit={ch1m ? '%' : undefined}
                    footnote={ch1m ? `od ${formatDate(ch1m.from)}` : 'za krótka historia'} loading={hist.isLoading} />
                <KpiCard label="Zmiana 1 rok" value={fmtSignedPct(ch1y?.pct ?? null)} unit={ch1y ? '%' : undefined}
                    footnote={ch1y ? `od ${formatDate(ch1y.from)}` : `${chart.length} sesji w historii`} loading={hist.isLoading} />
                <KpiCard label="Od maks. 52 tyg." value={fmtSignedPct(fromHigh)} unit={fromHigh != null ? '%' : undefined}
                    footnote={lastClose ? `zamknięcie ${formatDate(lastClose.date)}` : undefined} loading={hist.isLoading} />
                <KpiCard label="Wiadomości" value={String(companyNews.length)} unit={companyNews.length === 1 ? 'news' : 'newsy'}
                    footnote="z agregatora RSS" loading={news.isLoading} />
            </div>

            <SectionCard title="Kurs dzienny" subtitle={`zamknięcia sesji · ${chart.length ? `${formatDate(chart[0].date)} – ${formatDate(chart[chart.length - 1].date)}` : 'Yahoo Finance (GPW)'}`}>
                <QueryState
                    isLoading={hist.isLoading}
                    isError={hist.isError}
                    isEmpty={chart.length < 2}
                    onRetry={() => { void hist.refetch(); }}
                    height={300}
                    emptyTitle="Brak historii notowań dla tego tickera."
                >
                    <InteractiveChart data={chart} xKey="date" height={300} unit=" zł" showRange initialRange="6M"
                        ranges={['1M', '3M', '6M', 'ALL']}
                        valueFormatter={priceTick} xTickFormatter={dayTick}
                        series={[{ key: 'value', name: company.name, color: '#2563EB', type: 'area', strokeWidth: 2.5 }]} />
                </QueryState>
            </SectionCard>

            <SectionCard title="Wiadomości o spółce" subtitle="dopasowane po nazwie spółki — tytuł liczy się zawsze, opis tylko dla jednoznacznych nazw">
                <QueryState
                    isLoading={news.isLoading}
                    isError={news.isError}
                    isEmpty={companyNews.length === 0}
                    onRetry={() => { void news.refetch(); }}
                    height={140}
                    emptyTitle="Brak newsów o tej spółce w bieżącej paczce."
                    emptyDetail="To normalne — agregator trzyma ~150 najnowszych pozycji, a nie każda spółka pojawia się codziennie."
                >
                    <ul className="-mx-2 divide-y divide-mk-border">
                        {companyNews.map((n) => (
                            <li key={n.link}>
                                <a
                                    href={n.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex min-h-14 items-start gap-3 rounded-lg px-2 py-3 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[15px] font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-primary sm:text-sm">{n.title}</div>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs text-mk-muted">
                                            <span className="min-w-0 truncate">{n.source}</span>
                                            <span className="text-mk-faint" aria-hidden>·</span>
                                            <time dateTime={n.publishedAt} className="shrink-0">{formatRelativeTime(n.publishedAt) || formatTime(n.publishedAt)}</time>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="mt-1 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                                </a>
                            </li>
                        ))}
                    </ul>
                </QueryState>
            </SectionCard>
        </div>
    );
}
