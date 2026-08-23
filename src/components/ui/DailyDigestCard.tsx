'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, Layers } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import { corroborationLabel } from '@/lib/news/daily';
import { formatDate } from '@/lib/formatters';
import type { NewsTopic } from '@/lib/news/match';
import { SectionCard } from '@/components/ui/SectionCard';
import { SummaryBody } from '@/components/ui/DigestSummaryCard';
import { CategoryTag } from '@/components/ui/RelatedNews';

const TOPIC_LABELS: Record<NewsTopic, string> = {
    ceny: 'Ceny',
    gospodarka: 'Gospodarka',
    praca: 'Praca',
    rynki: 'Rynki',
};

function TopicTags({ topics }: { topics: NewsTopic[] }) {
    if (topics.length === 0) return null;
    return (
        <>
            {topics.map((t) => (
                <span key={t} className="mk-tag-brand">{TOPIC_LABELS[t]}</span>
            ))}
        </>
    );
}

function CorroborationTag({ n }: { n: number }) {
    const label = corroborationLabel(n);
    if (!label) return null;
    return (
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-mk-positive/10 px-1.5 py-0.5 text-[11px] font-medium text-mk-positive">
            <Layers size={10} /> {label}
        </span>
    );
}

/** Karta na Przeglądzie — skrót digestu. Pusty dzień → null (jak RelatedNews). */
export function DailyDigestCard({
    preview = 3,
    className = '',
}: {
    preview?: number;
    className?: string;
}) {
    const { data: digest, isLoading, isError } = useDailyDigest();

    if (isLoading) {
        return (
            <SectionCard editorial titleVariant="label" title="Podsumowanie dnia" className={className}>
                <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="mk-skeleton mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="mk-skeleton h-4 w-full rounded" />
                                <div className="mk-skeleton h-3 w-2/3 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        );
    }

    if (isError || !digest || digest.punkty.length === 0) return null;

    const shown = digest.punkty.slice(0, preview);
    const title = `Podsumowanie dnia · ${formatDate(digest.date)}`;

    return (
        <SectionCard
            editorial
            titleVariant="label"
            title={title}
            className={className}
            actions={
                <Link
                    href={`/podsumowanie?date=${digest.date}`}
                    className="-mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-brand transition-colors hover:bg-mk-brand-soft hover:underline"
                >
                    Całe podsumowanie <ArrowRight size={14} />
                </Link>
            }
        >
            {/* Akapit nad punktami — najpierw „o czym pisano", potem konkretne tematy.
                Karta ma już własny tytuł, więc wstawiamy samą treść bez nagłówka. */}
            {digest.podsumowanie && (
                <div className="mb-4 border-b border-mk-border pb-4">
                    <SummaryBody summary={digest.podsumowanie} compact />
                </div>
            )}

            <ul className="list-none space-y-4">
                {shown.map((p) => (
                    <li key={p.link} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mk-brand" aria-hidden />
                        <div className="min-w-0 flex-1">
                            <a
                                href={p.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                <div className="text-sm font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                                    {p.title}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-mk-muted">
                                    <TopicTags topics={p.topics} />
                                    <CategoryTag section={p.section} />
                                    <span>{p.source}</span>
                                    <CorroborationTag n={p.corroboration} />
                                    <ExternalLink size={12} className="ml-auto shrink-0 text-mk-faint group-hover:text-mk-brand" aria-hidden />
                                </div>
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
}
