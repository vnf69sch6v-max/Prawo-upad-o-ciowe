'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, ExternalLink, Layers } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import { corroborationLabel } from '@/lib/news/daily';
import { formatDate } from '@/lib/formatters';
import { EVENT_COLORS } from '@/lib/calendar';
import { SectionCard } from '@/components/ui/SectionCard';
import { CategoryTag } from '@/components/ui/RelatedNews';

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
    const { data: digest, isLoading } = useDailyDigest();

    if (isLoading) {
        return (
            <SectionCard editorial titleVariant="label" title="Podsumowanie dnia" className={className}>
                <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="mk-skeleton h-5 w-5 rounded" />
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

    if (!digest || digest.punkty.length === 0) return null;

    const shown = digest.punkty.slice(0, preview);
    const href = `/podsumowanie?date=${digest.date}`;

    return (
        <SectionCard
            editorial
            titleVariant="label"
            title="Podsumowanie dnia"
            subtitle={`Redakcyjny wybór · ${formatDate(digest.date)}`}
            className={className}
            actions={
                <Link
                    href={href}
                    className="-mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-brand transition-colors hover:bg-mk-brand-soft hover:underline"
                >
                    Pełne podsumowanie <ArrowRight size={14} />
                </Link>
            }
        >
            <ol className="space-y-4">
                {shown.map((p, idx) => (
                    <li key={p.link} className="flex gap-3">
                        <span className="mt-0.5 shrink-0 text-sm font-bold tabular-nums text-mk-brand">{idx + 1}</span>
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
                                    <CategoryTag section={p.section} />
                                    <span>{p.source}</span>
                                    <CorroborationTag n={p.corroboration} />
                                    <ExternalLink size={12} className="ml-auto shrink-0 text-mk-faint group-hover:text-mk-brand" aria-hidden />
                                </div>
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
        </SectionCard>
    );
}

/** Pełna strona /podsumowanie — punkty, liczby, jutro. */
export function DailyDigestFull({ date }: { date?: string }) {
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
                    <ol className="divide-y divide-mk-border">
                        {digest.punkty.map((p, idx) => (
                            <li key={p.link} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                                <span className="mt-1 shrink-0 text-lg font-bold tabular-nums text-mk-brand">{idx + 1}</span>
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
                                            <CategoryTag section={p.section} filled />
                                            <span className="text-mk-muted">{p.source}</span>
                                            <CorroborationTag n={p.corroboration} />
                                            <ExternalLink size={14} className="ml-auto shrink-0 text-mk-faint group-hover:text-mk-brand" aria-hidden />
                                        </div>
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ol>
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
