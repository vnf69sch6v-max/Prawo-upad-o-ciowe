'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CalendarDays, ExternalLink, Layers } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import { corroborationLabel, type DailyDigest } from '@/lib/news/daily';
import { formatDate } from '@/lib/formatters';
import { EVENT_COLORS } from '@/lib/calendar';
import type { NewsTopic } from '@/lib/news/match';
import { warsawDateKey, prevCalendarDate } from '@/lib/news/warsaw-date';
import { PageHeader } from '@/components/ui/PageHeader';
import { CategoryTag } from '@/components/ui/RelatedNews';
import { SummaryCard } from '@/components/ui/DigestSummaryCard';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Wartości w `dane` przychodzą jako gotowe napisy z kropką dziesiętną („4105", „+0.16%").
 * Wyświetlamy je po polsku: przecinek i spacja tysięcy („10 414", „+0,16%"). Inne napisy bez zmian.
 */
function plNumber(raw: string): string {
    const m = raw.trim().match(/^([+\-−]?)(\d+)(?:[.,](\d+))?(\s*(?:%|pp|p\.p\.|pkt|zł)?)$/);
    if (!m) return raw;
    const [, sign, int, frac = '', rest] = m;
    const body = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: frac.length, maximumFractionDigits: frac.length })
        .format(Number(frac ? `${int}.${frac}` : int));
    return `${sign}${body}${rest}`;
}

function deltaArrow(raw: string): string {
    const t = raw.trim();
    if (/^[\-−]/.test(t)) return '▼';
    if (/^\+/.test(t) && /[1-9]/.test(t)) return '▲';
    return '';
}

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

function DailyDigestFull({ digest, isLoading, isError, staleDate }: { digest: DailyDigest | null | undefined; isLoading: boolean; isError: boolean; staleDate?: string }) {
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
                    : 'Brak podsumowania na ten dzień — digest buduje się wieczorem (ok. 18:00) po zebraniu archiwum newsów.'}
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {digest.podsumowanie && <SummaryCard summary={digest.podsumowanie} staleDate={staleDate} />}

            <section>
                <h2 className="mk-section-label mb-3 sm:mb-4">Najważniejsze tematy dnia</h2>
                <div className="mk-card mk-card-editorial mk-card-pad">
                    <ul className="list-none divide-y divide-mk-border">
                        {digest.punkty.map((p) => (
                            <li key={p.link} className="py-4 first:pt-0 last:pb-0 sm:py-5">
                                <a
                                    href={p.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group -mx-2 flex gap-3 rounded-lg px-2 py-1 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt sm:gap-4"
                                >
                                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mk-brand" aria-hidden />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[17px] font-bold leading-snug text-mk-text transition-colors group-hover:text-mk-brand sm:text-lg">
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
                                        </div>
                                    </div>
                                    <ExternalLink size={15} className="mt-1 shrink-0 text-mk-faint group-hover:text-mk-brand" aria-hidden />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {digest.dane.length > 0 && (
                <section>
                    <h2 className="mk-section-label mb-3 sm:mb-4">Co się zmieniło w liczbach</h2>
                    {/* Telefon: 2 kolumny; data odczytu przy każdej liczbie; cały kafel prowadzi do wskaźnika. */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        {digest.dane.map((row) => {
                            const arrow = row.delta ? deltaArrow(row.delta) : '';
                            const body = (
                                <>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-mk-muted">{row.label}</p>
                                    <p className="mt-2 flex flex-wrap items-baseline gap-x-1 text-2xl font-bold tabular-nums text-mk-text">
                                        <span className="break-all">{plNumber(row.value)}</span>
                                        {row.unit && <span className="text-sm font-medium text-mk-muted sm:text-base">{row.unit}</span>}
                                    </p>
                                    {row.delta && (
                                        <p className="mt-1 text-sm font-semibold tabular-nums text-mk-text-soft">
                                            {arrow && <span className="mr-1 text-[11px]" aria-hidden>{arrow}</span>}
                                            {plNumber(row.delta)}
                                            <span className="font-normal text-mk-muted"> vs poprz.</span>
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-mk-muted">
                                        odczyt <time dateTime={row.readingDate} className="tabular-nums">{formatDate(row.readingDate)}</time>
                                    </p>
                                    {row.href && (
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-mk-brand group-hover:underline">
                                            Zobacz wskaźnik <ArrowRight size={13} aria-hidden />
                                        </span>
                                    )}
                                </>
                            );
                            return row.href ? (
                                <Link
                                    key={row.id}
                                    href={row.href}
                                    className="mk-card mk-card-editorial mk-card-interactive group block p-3.5 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt sm:p-5"
                                >
                                    {body}
                                </Link>
                            ) : (
                                <div key={row.id} className="mk-card mk-card-editorial p-3.5 sm:p-5">{body}</div>
                            );
                        })}
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
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-medium leading-snug text-mk-text sm:text-sm">{ev.name}</p>
                                        {ev.importance === 'high' && (
                                            <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wide text-mk-brand">
                                                Wysoka ważność
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Link href="/publikacje" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-mk-brand hover:underline">
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
    const todayKey = useMemo(() => warsawDateKey(), []);
    const yesterdayKey = useMemo(() => prevCalendarDate(todayKey), [todayKey]);

    // Bez `?date=`: dziś, a gdy dzisiejszego jeszcze nie ma (digest powstaje ~18:00) — wczorajszy,
    // JAWNIE podpisany datą. Wcześniej strona była pusta przez ~19 godzin na dobę.
    const primary = useDailyDigest(date);
    const hasPrimary = !!primary.data && primary.data.punkty.length > 0;
    const useFallback = !date && !primary.isLoading && !hasPrimary;
    const fallback = useDailyDigest(yesterdayKey, useFallback);
    const showingFallback = useFallback && !!fallback.data && fallback.data.punkty.length > 0;

    const digest = showingFallback ? fallback.data : primary.data;
    // `data === undefined` = jeszcze nie pobrano (queryFn zwraca `null`, nigdy `undefined`) — bez mignięcia „brak".
    const isLoading = primary.isLoading || (useFallback && fallback.data === undefined);
    const shownDate = date ?? (showingFallback ? yesterdayKey : todayKey);

    return (
        <div className="mk-fade-in">
            <PageHeader compact title={`Podsumowanie dnia · ${formatDate(shownDate)}`} />
            {showingFallback && (
                <p className="mb-4 text-sm text-mk-muted">
                    Dzisiejsze podsumowanie powstaje wieczorem (ok. 18:00) — poniżej wczorajsze, z {formatDate(yesterdayKey)}.
                </p>
            )}
            <DailyDigestFull
                digest={digest}
                isLoading={isLoading}
                isError={primary.isError}
                // „O czym dziś pisano" tylko dla dzisiejszego digestu — wczorajszy/archiwalny podpisujemy datą.
                staleDate={shownDate !== todayKey ? shownDate : undefined}
            />
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
