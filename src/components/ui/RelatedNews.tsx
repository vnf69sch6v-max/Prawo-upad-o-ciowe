'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { matchNews, type NewsTopic } from '@/lib/news/match';
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
                                {(it.corroboration ?? 1) >= 2 && (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[11px] font-medium text-mk-positive"
                                        title={it.alsoIn?.length ? `Ten sam temat opisują też: ${it.alsoIn.join(', ')}` : undefined}
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

const AllNewsLink = () => (
    <Link href="/newsy" className="flex items-center gap-1 text-sm font-medium text-mk-primary hover:underline">
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

/** Najważniejsze newsy bez filtrowania tematycznego — pas na Przeglądzie. */
export function LatestNews({ limit = 5, className = '' }: { limit?: number; className?: string }) {
    const { data, isLoading } = useNews();
    // Na Przeglądzie pokazujemy najważniejsze, nie po prostu najświeższe — inaczej pas zapełniłby
    // się przypadkowym newsem sprzed minuty zamiast tematem, który opisuje pół rynku.
    const items = useMemo(
        () => [...(data?.items ?? [])].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, limit),
        [data, limit],
    );

    if (isLoading) {
        return (
            <SectionCard title="Najważniejsze newsy" className={className}>
                <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="mk-skeleton h-3.5 w-4/5 rounded" />
                            <div className="mk-skeleton h-2.5 w-20 rounded" />
                        </div>
                    ))}
                </div>
            </SectionCard>
        );
    }
    if (items.length === 0) return null;

    return (
        <SectionCard title="Najważniejsze newsy" className={className} actions={<AllNewsLink />}>
            <NewsList items={items} />
        </SectionCard>
    );
}
