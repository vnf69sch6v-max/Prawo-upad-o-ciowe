'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CalendarDays, ExternalLink, Layers } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import { corroborationLabel } from '@/lib/news/daily';
import { formatDate } from '@/lib/formatters';
import { EVENT_COLORS } from '@/lib/calendar';
import type { NewsTopic } from '@/lib/news/match';
import { warsawDateKey } from '@/lib/news/warsaw-date';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { CategoryTag } from '@/components/ui/RelatedNews';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const TOPIC_LABELS: Record<NewsTopic, string> = {
    ceny: 'Ceny',
    gospodarka: 'Gospodarka',
    praca: 'Praca',
    rynki: 'Rynki',
};

function TopicTags({ topics, filled = false }: { topics: NewsTopic[]; filled?: boolean }) {
    if (topics.length === 0) return null;
    return (
        <>
            {topics.map((t) => (
                filled
                    ? <span key={t} className="mk-tag-brand-fill">{TOPIC_LABELS[t]}</span>
                    : <span key={t} className="mk-tag-brand">{TOPIC_LABELS[t]}</span>
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

function DailyDigestFull({ date }: { date?: string }) {
    const { data: digest, isLoading, isError } = useDailyDigest(date);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="mk-skeleton h-8 w-64 rounded" />
                <div className="mk-card mk-card-editorial mk-card-pad space-y-4">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="mk-skeleton h-16 w-full rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (!digest || digest.punkty.length === 0) {
        return (
            <div className="mk-card mk-card-editorial mk-card-pad text-center text-sm text-mk-muted">
                {isError
                    ? 'Nie udało się wczytać podsumowania.'
                    : 'Brak podsumowania na ten dzień — digest buduje się wieczorem po zebraniu archiwum newsów.'}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mk-section-label mb-4">Najważniejsze tematy dnia</h2>
                <div className="mk-card mk-card-editorial mk-card-pad">
                    <ul className="list-none divide-y divide-mk-border">
                        {digest.punkty.map((p) => (
                            <li key={p.link} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mk-brand" aria-hidden />
                                <div className="min-w-0 flex-1">
                                    <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block"
                                    >
                                        <h3 className="text-base font-bold leading-snug text-mk-text transition-colors group-hover:text-mk-brand sm:text-lg">
                                            {p.title}
                                        </h3>
                                        {p.description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mk-muted">{p.description}</p>
                                        )}
                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                            <TopicTags topics={p.topics} filled />
                                            <CategoryTag section={p.section} filled />
                                            <span className="text-mk-muted">{p.source}</span>
                                            <CorroborationTag n={p.corroboration} />
                                            <ExternalLink size={14} className="ml-auto shrink-0 text-mk-faint group-hover:text-mk-brand" aria-hidden />
                                        </div>
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {digest.dane.length > 0 && (
                <section>
                    <h2 className="mk-section-label mb-4">Co się zmieniło w liczbach</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {digest.dane.map((row) => (
                            <div key={row.id} className="mk-card mk-card-editorial mk-card-pad">
                                <p className="text-xs font-semibold uppercase tracking-wide text-mk-muted">{row.label}</p>
                                <p className="mt-2 text-2xl font-bold tabular-nums text-mk-text">
                                    {row.value}
                                    {row.unit && <span className="ml-1 text-base font-medium text-mk-muted">{row.unit}</span>}
                                </p>
                                {row.delta && (
                                    <p className="mt-1 text-sm font-medium text-mk-brand">{row.delta}</p>
                                )}
                                {row.href && (
                                    <Link href={row.href} className="mt-2 inline-block text-xs font-medium text-mk-brand hover:underline">
                                        Zobacz wskaźnik →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {digest.jutro.events.length > 0 && (
                <section>
                    <h2 className="mk-section-label mb-4 flex items-center gap-2">
                        <CalendarDays size={16} className="text-mk-brand" />
                        Jutro w kalendarzu
                    </h2>
                    <div className="mk-card mk-card-editorial mk-card-pad">
                        <p className="mb-4 text-sm text-mk-muted">
                            {formatDate(digest.jutro.date)} — nadchodzące publikacje makro
                        </p>
                        <ul className="space-y-3">
                            {digest.jutro.events.map((ev) => (
                                <li key={`${ev.type}-${ev.name}`} className="flex items-start gap-3">
                                    <span
                                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: EVENT_COLORS[ev.type] }}
                                        aria-hidden
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-mk-text">{ev.name}</p>
                                        {ev.importance === 'high' && (
                                            <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wide text-mk-brand">
                                                Wysoka ważność
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Link href="/publikacje" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-mk-brand hover:underline">
                            Pełny kalendarz <ArrowRight size={14} />
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}

function PodsumowanieContent() {
    const sp = useSearchParams();
    const raw = sp.get('date');
    const date = useMemo(() => (raw && DATE_RE.test(raw) ? raw : undefined), [raw]);
    const label = date ? formatDate(date) : formatDate(warsawDateKey());

    return (
        <div className="mk-fade-in">
            <PageHeader
                compact
                eyebrow={<PageEyebrow section="Newsy" />}
                title={`Podsumowanie dnia · ${label}`}
                subtitle="Redakcyjny wybór najważniejszych tematów makro"
            />
            <DailyDigestFull date={date} />
        </div>
    );
}

export default function PodsumowaniePage() {
    return (
        <Suspense fallback={<div className="mk-skeleton h-48 w-full rounded-2xl" />}>
            <PodsumowanieContent />
        </Suspense>
    );
}
