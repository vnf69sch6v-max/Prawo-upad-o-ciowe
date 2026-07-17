'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Layers, Copy, Megaphone } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { matchNews, collapseClusters, type NewsTopic } from '@/lib/news/match';
import { formatRelativeTime, formatTime } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';

function NewsList({ items }: { items: NewsItem[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <ul className="divide-y divide-mk-border">
            {items.map((it) => (
                <li key={it.link}>
                    <a
                        href={it.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-primary">
                                {it.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mk-muted">
                                <span>{it.source}</span>
                                <span className="text-mk-faint">·</span>
                                {/* Czas względny dopiero po zamontowaniu — inaczej hydration mismatch. */}
                                <time dateTime={it.publishedAt}>
                                    {mounted ? formatRelativeTime(it.publishedAt) : formatTime(it.publishedAt)}
                                </time>
                                {/* Przedruk tej samej depeszy NIE jest potwierdzeniem — patrz cluster.ts. */}
                                {it.wire && (it.corroboration ?? 1) < 2 ? (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted"
                                        title={it.alsoIn?.length ? `Ta sama depesza: ${it.alsoIn.join(', ')}` : undefined}
                                    >
                                        <Copy size={10} /> depesza
                                    </span>
                                ) : (it.corroboration ?? 1) >= 2 && (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[11px] font-medium text-mk-positive"
                                        title={it.alsoIn?.length ? `Niezależne relacje: ${it.alsoIn.join(', ')}` : undefined}
                                    >
                                        <Layers size={10} />
                                        {it.corroboration}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ExternalLink size={14} className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                    </a>
                </li>
            ))}
        </ul>
    );
}

// `py-1` daje 26px wysokości — poniżej ~24px cel dotykowy jest zbyt mały (WCAG 2.2 Target Size).
const AllNewsLink = () => (
    <Link href="/newsy" className="-mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-primary transition-colors hover:bg-mk-primary/5 hover:underline">
        Wszystkie <ArrowRight size={14} />
    </Link>
);

/**
 * Pas „Newsy powiązane" — newsy dopasowane do tematu sekcji (nasz wyróżnik: news stoi przy
 * wskaźniku, którego dotyczy). Reguły dopasowania: `lib/news/match.ts` (precyzja > zasięg).
 *
 * Gdy nic nie pasuje albo dane jeszcze lecą — komponent NIE renderuje niczego. Pusta ramka
 * z napisem „brak" byłaby gorsza niż jej brak, a przy nastawieniu na precyzję zero trafień
 * to normalny stan (np. w dzień bez danych o PKB), nie błąd.
 */
export function RelatedNews({
    topic,
    title = 'Newsy powiązane',
    limit = 4,
    className = '',
}: {
    topic: NewsTopic;
    title?: string;
    limit?: number;
    className?: string;
}) {
    const { data } = useNews();
    const items = useMemo(() => matchNews(data?.items ?? [], topic, limit), [data, topic, limit]);

    if (items.length === 0) return null;

    return (
        <SectionCard
            title={title}
            subtitle="Wiadomości dotyczące wskaźników z tej sekcji"
            className={className}
            actions={<AllNewsLink />}
        >
            <NewsList items={items} />
        </SectionCard>
    );
}

/**
 * Znacznik korroboracji — jedno miejsce prawdy dla pasa na Przeglądzie.
 * Ta sama logika i słownictwo co na /newsy: przedruk depeszy dostaje neutralne „ta sama depesza",
 * a nie zielone potwierdzenie (patrz cluster.ts). `compact` = wersja skrócona do wierszy indeksu.
 */
function Corroboration({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
    const n = item.corroboration ?? 1;
    if (item.wire && n < 2) {
        return (
            <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted"
                title={item.alsoIn?.length ? `Ta sama depesza: ${item.alsoIn.join(', ')}` : undefined}
            >
                <Copy size={10} /> {compact ? 'depesza' : 'ta sama depesza'}
            </span>
        );
    }
    if (n < 2) return null;
    return (
        <span
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[11px] font-medium text-mk-positive"
            title={item.alsoIn?.length ? `Niezależne relacje: ${item.alsoIn.join(', ')}` : undefined}
        >
            <Layers size={10} /> {compact ? n : n === 2 ? '2 niezależne relacje' : `${n} niezależne relacje`}
        </span>
    );
}

/** Oznaczenia jakości — materiał promocyjny / opinia. Neutralne, na tle surface-alt (nie status). */
function Flags({ item }: { item: NewsItem }) {
    return (
        <>
            {item.isAd && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted">
                    <Megaphone size={10} /> materiał promocyjny
                </span>
            )}
            {item.isOpinion && (
                <span className="rounded-full bg-mk-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-mk-muted">opinia</span>
            )}
        </>
    );
}

/**
 * Układ pasa „Najważniejsze newsy" na Przeglądzie: LEAD (news #1 wg ważności — duży tytuł, opis,
 * pełny badge) + kompaktowy indeks pozostałych, oddzielony hairline'em.
 *
 * Ważność niesie KOLEJNOŚĆ (lista malejąca wg importance) i ROZMIAR leada — NIE kolorowy pasek.
 * Świadomie: pasek ważności z /newsy wniósłby tu dekoracyjny kolor (który kafle KPI zdjęły), a na
 * topowych 6 newsach i tak zlewa się w jeden poziom → szum, nie ranking. Osobny render, nie NewsList
 * (ten zostaje dla wąskich pasów tematycznych „Newsy powiązane").
 */
function LatestNewsLayout({ items }: { items: NewsItem[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const [lead, ...rest] = items; // items.length ≥ 1 — guard w LatestNews

    return (
        <div>
            {/* LEAD — h4, bo tytuł karty to h3 (mk-section-title); unikamy rodzeństwa h3. */}
            <a
                href={lead.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group -m-1 block rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/40"
            >
                <h4 className="text-lg font-bold leading-tight tracking-tight text-mk-text transition-colors group-hover:text-mk-primary sm:text-xl">
                    {lead.title}
                </h4>
                {lead.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mk-muted">{lead.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-semibold text-mk-text">{lead.source}</span>
                    <span className="text-mk-faint">·</span>
                    <time dateTime={lead.publishedAt} className="text-mk-muted">
                        {mounted ? formatRelativeTime(lead.publishedAt) : formatTime(lead.publishedAt)}
                    </time>
                    <Corroboration item={lead} />
                    <Flags item={lead} />
                    <ExternalLink size={14} className="ml-auto shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                </div>
            </a>

            {/* Kompaktowy indeks — spokojne wiersze oddzielone hairline'em. */}
            {rest.length > 0 && (
                <ul className="mt-4 divide-y divide-mk-border border-t border-mk-border pt-1">
                    {rest.map((it) => (
                        <li key={it.link}>
                            <a
                                href={it.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-3 py-2.5 first:pt-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-primary">
                                        {it.title}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mk-muted">
                                        <span>{it.source}</span>
                                        <span className="text-mk-faint">·</span>
                                        <time dateTime={it.publishedAt}>
                                            {mounted ? formatRelativeTime(it.publishedAt) : formatTime(it.publishedAt)}
                                        </time>
                                        <Corroboration item={it} compact />
                                    </div>
                                </div>
                                <ExternalLink size={14} className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-primary" aria-hidden />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** Najważniejsze newsy bez filtrowania tematycznego — pas na Przeglądzie. */
export function LatestNews({ limit = 5, className = '' }: { limit?: number; className?: string }) {
    const { data, isLoading } = useNews();
    // Na Przeglądzie pokazujemy najważniejsze, nie po prostu najświeższe — inaczej pas zapełniłby
    // się przypadkowym newsem sprzed minuty zamiast tematem, który opisuje pół rynku.
    // `collapseClusters` pilnuje, by jedna historia z 3 redakcji nie zjadła 3 z 6 miejsc.
    const items = useMemo(
        () => collapseClusters([...(data?.items ?? [])])
            .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
            .slice(0, limit),
        [data, limit],
    );

    if (isLoading) {
        // Skeleton w kształcie lead + wiersze, żeby układ nie skakał po dojściu danych.
        return (
            <SectionCard title="Najważniejsze newsy" className={className}>
                <div>
                    <div className="space-y-2">
                        <div className="mk-skeleton h-5 w-4/5 rounded" />
                        <div className="mk-skeleton h-3.5 w-full rounded" />
                        <div className="mk-skeleton h-3 w-32 rounded" />
                    </div>
                    <div className="mt-4 space-y-3 border-t border-mk-border pt-3">
                        {Array.from({ length: 4 }, (_, i) => <div key={i} className="mk-skeleton h-3.5 w-3/4 rounded" />)}
                    </div>
                </div>
            </SectionCard>
        );
    }
    if (items.length === 0) return null;

    return (
        <SectionCard title="Najważniejsze newsy" className={className} actions={<AllNewsLink />}>
            <LatestNewsLayout items={items} />
        </SectionCard>
    );
}
