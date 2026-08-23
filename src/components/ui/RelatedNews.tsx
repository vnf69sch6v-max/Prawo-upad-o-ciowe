'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Layers, Copy, Megaphone } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { matchNews, collapseClusters, matchesTopic, type NewsTopic } from '@/lib/news/match';
import { formatRelativeTime, formatTime } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';

const TOPIC_LINKS: { topic: NewsTopic; label: string; href: string }[] = [
    { topic: 'ceny', label: 'Inflacja CPI', href: '/ceny?tab=inflacja' },
    { topic: 'gospodarka', label: 'PKB / aktywność', href: '/gospodarka?tab=aktywnosc' },
    { topic: 'praca', label: 'Rynek pracy', href: '/praca' },
    { topic: 'rynki', label: 'Rynki finansowe', href: '/rynki' },
];

function newsTopics(item: Pick<NewsItem, 'title' | 'description'>) {
    return TOPIC_LINKS.filter((t) => matchesTopic(item, t.topic));
}

const SECTION_LABELS: Record<string, string> = {
    ogolne: 'MAKRO',
    gielda: 'GIEŁDA',
    waluty: 'WALUTY',
    przemysl: 'PRZEMYSŁ',
    oficjalne: 'OFICJALNE',
};

function sectionLabel(section: string): string {
    const key = section.trim().toLowerCase();
    if (SECTION_LABELS[key]) return SECTION_LABELS[key];
    const trimmed = section.trim();
    return trimmed ? trimmed.toUpperCase() : 'MAKRO';
}

export function CategoryTag({ section, filled = false }: { section: string; filled?: boolean }) {
    const label = sectionLabel(section);
    if (filled) return <span className="mk-tag-brand-fill">{label}</span>;
    return <span className="mk-tag-brand">{label}</span>;
}

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
const AllNewsLink = ({ brand = false }: { brand?: boolean }) => (
    <Link
        href="/newsy"
        className={`-mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium transition-colors hover:underline ${brand ? 'text-mk-brand hover:bg-mk-brand-soft' : 'text-mk-primary hover:bg-mk-primary/5'}`}
    >
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
            editorial
            titleVariant="label"
            actions={<AllNewsLink brand />}
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

function RelatedIndicators({ item }: { item: NewsItem }) {
    const topics = useMemo(() => newsTopics(item), [item]);
    if (topics.length === 0) return null;
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-mk-muted">Powiązane wskaźniki</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {topics.map((t) => (
                    <Link
                        key={t.topic}
                        href={t.href}
                        className="rounded-full border border-mk-border bg-mk-surface px-3 py-1 text-xs font-semibold text-mk-text-soft transition-colors hover:border-mk-brand/40 hover:bg-mk-brand-soft hover:text-mk-brand"
                    >
                        {t.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

/**
 * Układ Przeglądu z sidebar „Dlaczego to ważne" + tagi kategorii.
 */
function OverviewNewsLayout({ items }: { items: NewsItem[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const [lead, ...rest] = items;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
                <a
                    href={lead.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-brand/40"
                >
                    <div className="flex flex-wrap gap-2">
                        <CategoryTag section={lead.section} filled />
                        {(lead.corroboration ?? 1) >= 2 && (
                            <span className="mk-tag-brand-fill opacity-90">POTWIERDZONE · {lead.corroboration}</span>
                        )}
                    </div>
                    <h4 className="mt-3 text-xl font-bold leading-tight tracking-tight text-mk-text transition-colors group-hover:text-mk-brand sm:text-2xl">
                        {lead.title}
                    </h4>
                    {lead.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mk-muted">{lead.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-semibold text-mk-brand">
                            {mounted ? formatRelativeTime(lead.publishedAt) : formatTime(lead.publishedAt)}
                        </span>
                        <span className="text-mk-faint">·</span>
                        <span className="text-mk-muted">{lead.source}</span>
                        <ExternalLink size={14} className="ml-auto shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
                    </div>
                </a>

                {rest.length > 0 && (
                    <ul className="mt-6 divide-y divide-mk-border border-t border-mk-border pt-2">
                        {rest.map((it) => (
                            <li key={it.link}>
                                <a
                                    href={it.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-3 py-3.5 first:pt-4"
                                >
                                    <time
                                        dateTime={it.publishedAt}
                                        className="mt-0.5 shrink-0 text-xs font-semibold tabular-nums text-mk-brand"
                                    >
                                        {mounted ? formatRelativeTime(it.publishedAt) : formatTime(it.publishedAt)}
                                    </time>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                                            {it.title}
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                            <CategoryTag section={it.section} />
                                            <span className="text-xs text-mk-faint">{it.source}</span>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" aria-hidden />
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <aside className="lg:col-span-4">
                <div className="rounded-xl border border-mk-border bg-mk-surface-alt p-5 lg:sticky lg:top-24">
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-mk-brand">Dlaczego to ważne</h4>
                    <p className="mt-3 text-sm leading-relaxed text-mk-text-soft">
                        {lead.description
                            ? lead.description
                            : `Temat o wysokiej ważności w rankingu Savori — obserwuj powiązane wskaźniki makro.`}
                    </p>
                    <div className="mt-5 border-t border-mk-border pt-5">
                        <RelatedIndicators item={lead} />
                    </div>
                </div>
            </aside>
        </div>
    );
}

/**
 * Układ pasa „Najważniejsze newsy" (domyślny): LEAD + kompaktowy indeks pozostałych.
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
export function LatestNews({
    limit = 5,
    className = '',
    variant = 'default',
}: {
    limit?: number;
    className?: string;
    variant?: 'default' | 'overview';
}) {
    const { data, isLoading } = useNews();
    const items = useMemo(
        () => collapseClusters([...(data?.items ?? [])])
            .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
            .slice(0, limit),
        [data, limit],
    );

    if (isLoading) {
        if (variant === 'overview') {
            return (
                <section className={className}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="mk-section-label">Najważniejsze newsy</h2>
                    </div>
                    <div className="mk-card mk-card-editorial mk-card-pad">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <div className="space-y-3 lg:col-span-8">
                                <div className="mk-skeleton h-5 w-24 rounded" />
                                <div className="mk-skeleton h-6 w-4/5 rounded" />
                                <div className="mk-skeleton h-3.5 w-full rounded" />
                            </div>
                            <div className="mk-skeleton h-32 rounded-xl lg:col-span-4" />
                        </div>
                    </div>
                </section>
            );
        }
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

    if (variant === 'overview') {
        return (
            <section className={className}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="mk-section-label">Najważniejsze newsy</h2>
                    <AllNewsLink brand />
                </div>
                <div className="mk-card mk-card-editorial mk-card-pad">
                    <OverviewNewsLayout items={items} />
                </div>
            </section>
        );
    }

    return (
        <SectionCard title="Najważniejsze newsy" className={className} actions={<AllNewsLink />}>
            <LatestNewsLayout items={items} />
        </SectionCard>
    );
}
