'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useDailyDigest, useNews, type NewsItem } from '@/lib/hooks';
import { matchNews, type MatchTier, type NewsTopic } from '@/lib/news/match';
import type { MacroChange } from '@/lib/news/daily';
import { prevCalendarDate, warsawDateKey } from '@/lib/news/warsaw-date';
import { formatRelativeTime, formatTime } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
import { QueryState } from '@/components/ui/QueryState';

/** Nagłówki sekcji per temat — zgodnie z mockupami redakcyjnymi. */
export const CATEGORY_LABELS: Record<NewsTopic, string> = {
    ceny: 'CENY I INFLACJA',
    gospodarka: 'GOSPODARKA',
    praca: 'PRACA',
    rynki: 'RYNKI',
};

const CATEGORY_SUBTITLES: Record<NewsTopic, string> = {
    ceny: 'Wiadomości dotyczące wskaźników z tej sekcji',
    gospodarka: 'Wiadomości dotyczące aktywności gospodarczej i finansów publicznych',
    praca: 'Wiadomości dotyczące rynku pracy i płac',
    rynki: 'Wiadomości dotyczące rynków finansowych i walut',
};

const MONTHS_UPPER = [
    'STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA',
    'LIPCA', 'SIERPNIA', 'WRZEŚNIA', 'PAŹDZIERNIKA', 'LISTOPADA', 'GRUDNIA',
] as const;

/** Mapowanie odczytów makro z digestu na tematy sekcji. */
const MACRO_TOPIC: Record<string, NewsTopic> = {
    'cpi-yoy': 'ceny',
    'ppi-yoy': 'ceny',
    'nbp-eur': 'rynki',
    'nbp-usd': 'rynki',
    wig20: 'rynki',
    mwig40: 'rynki',
    swig80: 'rynki',
    'yield-10y': 'gospodarka',
};

type TimelineEntry =
    | { kind: 'news'; id: string; sortAt: number; dateKey: string; item: NewsItem }
    | { kind: 'data'; id: string; sortAt: number; dateKey: string; row: MacroChange };

function macroTopic(row: MacroChange): NewsTopic | null {
    return MACRO_TOPIC[row.id] ?? null;
}

function formatDayMonthUpper(dateKey: string): string {
    const day = parseInt(dateKey.slice(8, 10), 10);
    const month = MONTHS_UPPER[parseInt(dateKey.slice(5, 7), 10) - 1] ?? '';
    return `${day} ${month}`;
}

function formatTimelineGroupLabel(dateKey: string, todayKey: string): string {
    const dayMonth = formatDayMonthUpper(dateKey);
    if (dateKey === todayKey) return `DZIŚ • ${dayMonth}`;
    if (dateKey === prevCalendarDate(todayKey)) return `WCZORAJ • ${dayMonth}`;
    return dayMonth;
}

function warsawDateKeyFromIso(iso: string): string {
    return warsawDateKey(iso);
}

function buildTimelineEntries(
    news: NewsItem[],
    macroToday: MacroChange[],
    macroYesterday: MacroChange[],
    topic: NewsTopic,
    todayKey: string,
    yesterdayKey: string,
): TimelineEntry[] {
    const out: TimelineEntry[] = [];

    for (const item of news) {
        const dateKey = warsawDateKeyFromIso(item.publishedAt);
        if (dateKey !== todayKey && dateKey !== yesterdayKey) continue;
        out.push({
            kind: 'news',
            id: `news-${item.link}`,
            sortAt: new Date(item.publishedAt).getTime(),
            dateKey,
            item,
        });
    }

    for (const row of [...macroToday, ...macroYesterday]) {
        if (macroTopic(row) !== topic) continue;
        if (row.readingDate !== todayKey && row.readingDate !== yesterdayKey) continue;
        // Brak dokładnej godziny publikacji GUS — sort na koniec dnia, żeby nie fałszować HH:MM.
        const sortAt = Date.parse(`${row.readingDate}T23:59:00+02:00`);
        out.push({
            kind: 'data',
            id: `macro-${row.id}-${row.readingDate}`,
            sortAt: Number.isNaN(sortAt) ? 0 : sortAt,
            dateKey: row.readingDate,
            row,
        });
    }

    return out.sort((a, b) => b.sortAt - a.sortAt);
}

function groupTimelineEntries(entries: TimelineEntry[], todayKey: string) {
    const byDate = new Map<string, TimelineEntry[]>();
    for (const e of entries) {
        const g = byDate.get(e.dateKey);
        if (g) g.push(e);
        else byDate.set(e.dateKey, [e]);
    }
    const order = [todayKey, prevCalendarDate(todayKey)].filter((d) => byDate.has(d));
    return order.map((dateKey) => ({
        dateKey,
        label: formatTimelineGroupLabel(dateKey, todayKey),
        entries: byDate.get(dateKey) ?? [],
    }));
}

const AllNewsLink = () => (
    <Link
        href="/newsy"
        className="-mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-brand transition-colors hover:bg-mk-brand-soft hover:underline"
    >
        Wszystkie <ArrowRight size={14} />
    </Link>
);

function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}

function NewsyList({ items }: { items: NewsItem[] }) {
    const mounted = useMounted();

    return (
        <ul className="divide-y divide-mk-border">
            {items.map((it) => (
                <li key={it.link}>
                    <a
                        href={it.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                                {it.title}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-mk-muted">
                                <span>{it.source}</span>
                                <span className="text-mk-faint">·</span>
                                <time dateTime={it.publishedAt}>
                                    {mounted ? formatRelativeTime(it.publishedAt) : formatTime(it.publishedAt)}
                                </time>
                            </div>
                        </div>
                        <ExternalLink
                            size={15}
                            className="mt-0.5 shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand"
                            aria-hidden
                        />
                    </a>
                </li>
            ))}
        </ul>
    );
}

function TimelineEntryRow({ entry, mounted }: { entry: TimelineEntry; mounted: boolean }) {
    if (entry.kind === 'news') {
        const it = entry.item;
        return (
            <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block min-w-0"
            >
                <div className="text-sm font-bold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                    {it.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-mk-muted">
                    <time dateTime={it.publishedAt} className="tabular-nums">
                        {mounted ? formatTime(it.publishedAt) : '—'}
                    </time>
                    <span className="text-mk-faint">•</span>
                    <span>{it.source}</span>
                </div>
            </a>
        );
    }

    const { row } = entry;
    const context = row.delta ?? row.value;
    const title = row.value ? `GUS: ${row.label} — ${row.value}` : `GUS: ${row.label}`;
    const inner = (
        <>
            <div className="text-sm font-bold leading-snug text-mk-brand">{title}</div>
            <div className="mt-1 text-xs text-mk-muted">
                dane • {context}
            </div>
        </>
    );

    if (row.href) {
        return (
            <Link href={row.href} className="group block min-w-0 transition-opacity hover:opacity-90">
                {inner}
            </Link>
        );
    }
    return <div className="min-w-0">{inner}</div>;
}

/**
 * NEWSY — prosta lista wiadomości z sekcji (mockup: biała karta, nagłówek uppercase, linki zewn.).
 */
export function CategoryNews({
    topic,
    limit = 5,
    className = '',
    excludeDateKeys,
    matchTier = 'all',
    excludeOpinion = false,
}: {
    topic: NewsTopic;
    limit?: number;
    className?: string;
    /** Daty YYYY-MM-DD (Warsaw) — pozycje z tych dni są pomijane (np. gdy są już w Kalendarium). */
    excludeDateKeys?: string[];
    matchTier?: MatchTier;
    excludeOpinion?: boolean;
}) {
    const { data, isLoading, isError, refetch } = useNews();
    const items = useMemo(() => {
        const matched = matchNews(data?.items ?? [], topic, limit + (excludeDateKeys?.length ? 10 : 0), {
            matchTier,
            excludeOpinion,
        });
        if (!excludeDateKeys?.length) return matched.slice(0, limit);
        const skip = new Set(excludeDateKeys);
        return matched
            .filter((it) => !skip.has(warsawDateKeyFromIso(it.publishedAt)))
            .slice(0, limit);
    }, [data, topic, limit, excludeDateKeys, matchTier, excludeOpinion]);

    if (!isLoading && !isError && items.length === 0) return null;

    return (
        <SectionCard
            title={`NEWSY — ${CATEGORY_LABELS[topic]}`}
            subtitle={CATEGORY_SUBTITLES[topic]}
            className={className}
            editorial
            titleVariant="label"
            actions={<AllNewsLink />}
        >
            <QueryState
                isLoading={isLoading}
                isError={isError}
                isEmpty={items.length === 0}
                onRetry={() => { void refetch(); }}
                height={160}
                emptyTitle="Brak newsów w tym temacie"
            >
                <NewsyList items={items} />
            </QueryState>
        </SectionCard>
    );
}

/**
 * KALENDARIUM — oś czasu newsów i publikacji danych GUS w obrębie tematu (dziś + wczoraj).
 */
export function Kalendarium({
    topic,
    newsLimit = 12,
    className = '',
    matchTier = 'all',
    excludeOpinion = false,
}: {
    topic: NewsTopic;
    newsLimit?: number;
    className?: string;
    matchTier?: MatchTier;
    excludeOpinion?: boolean;
}) {
    const mounted = useMounted();
    const todayKey = useMemo(() => warsawDateKey(), []);
    const yesterdayKey = useMemo(() => prevCalendarDate(todayKey), [todayKey]);

    const { data: newsData, isLoading, isError, refetch } = useNews();
    const { data: digestToday } = useDailyDigest();
    const { data: digestYesterday } = useDailyDigest(yesterdayKey);

    const news = useMemo(
        () => matchNews(newsData?.items ?? [], topic, newsLimit, { matchTier, excludeOpinion }),
        [newsData, topic, newsLimit, matchTier, excludeOpinion],
    );

    const entries = useMemo(
        () => buildTimelineEntries(
            news,
            digestToday?.dane ?? [],
            digestYesterday?.dane ?? [],
            topic,
            todayKey,
            yesterdayKey,
        ),
        [news, digestToday, digestYesterday, topic, todayKey, yesterdayKey],
    );

    const groups = useMemo(() => groupTimelineEntries(entries, todayKey), [entries, todayKey]);

    if (!isLoading && !isError && entries.length === 0) return null;

    return (
        <SectionCard
            title={`KALENDARIUM — ${CATEGORY_LABELS[topic]}`}
            className={className}
            editorial
            titleVariant="label"
            actions={<AllNewsLink />}
        >
            <QueryState
                isLoading={isLoading}
                isError={isError}
                isEmpty={entries.length === 0}
                onRetry={() => { void refetch(); }}
                height={140}
                emptyTitle="Brak wpisów w kalendarium"
            >
            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.dateKey}>
                        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-mk-muted">
                            {group.label}
                        </h4>
                        <ul className="relative ml-1 border-l border-mk-border">
                            {group.entries.map((entry, idx) => (
                                <li
                                    key={entry.id}
                                    className={`relative pl-5 ${idx < group.entries.length - 1 ? 'pb-5' : 'pb-0'}`}
                                >
                                    <span
                                        className={`absolute left-0 top-1.5 h-2 w-2 -translate-x-[calc(0.25rem+1px)] rounded-full ${
                                            entry.kind === 'data' ? 'bg-mk-brand' : 'bg-[#CBD2DD]'
                                        }`}
                                        aria-hidden
                                    />
                                    <TimelineEntryRow entry={entry} mounted={mounted} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            </QueryState>
        </SectionCard>
    );
}

/**
 * Pas newsów na stronach kategorii — Kalendarium (oś czasu) + lista NEWSY poniżej.
 * Kalendarium pokazuje tylko dziś/wczoraj; NEWSY uzupełnia starsze dopasowane wiadomości.
 *
 * `variant="rail"` — jedna karta (Kalendarium albo NEWSY). Używać w DenseTwoCol / wąskiej
 * kolumnie: stack Kalendarium+NEWSY rozciąga wiersz siatki i zostawia pustą „połowę” obok wykresu.
 */
export function CategoryNewsPanel({
    topic,
    limit = 5,
    className = '',
    matchTier = 'all',
    excludeOpinion = false,
    variant = 'stack',
}: {
    topic: NewsTopic;
    limit?: number;
    className?: string;
    matchTier?: MatchTier;
    excludeOpinion?: boolean;
    variant?: 'stack' | 'rail';
}) {
    const todayKey = useMemo(() => warsawDateKey(), []);
    const yesterdayKey = useMemo(() => prevCalendarDate(todayKey), [todayKey]);
    const recentKeys = useMemo(() => [todayKey, yesterdayKey], [todayKey, yesterdayKey]);

    const { data: newsData } = useNews();
    const { data: digestToday } = useDailyDigest();
    const { data: digestYesterday } = useDailyDigest(yesterdayKey);

    const showKalendarium = useMemo(() => {
        const news = matchNews(newsData?.items ?? [], topic, 20, { matchTier, excludeOpinion });
        return buildTimelineEntries(
            news,
            digestToday?.dane ?? [],
            digestYesterday?.dane ?? [],
            topic,
            todayKey,
            yesterdayKey,
        ).length > 0;
    }, [newsData, digestToday, digestYesterday, topic, todayKey, yesterdayKey, matchTier, excludeOpinion]);

    if (!showKalendarium) {
        return (
            <CategoryNews
                topic={topic}
                limit={limit}
                className={className}
                matchTier={matchTier}
                excludeOpinion={excludeOpinion}
            />
        );
    }

    if (variant === 'rail') {
        return (
            <Kalendarium
                topic={topic}
                newsLimit={limit + 7}
                className={className}
                matchTier={matchTier}
                excludeOpinion={excludeOpinion}
            />
        );
    }

    const newsOnly = (
        <CategoryNews
            topic={topic}
            limit={limit}
            excludeDateKeys={recentKeys}
            matchTier={matchTier}
            excludeOpinion={excludeOpinion}
        />
    );

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            <Kalendarium
                topic={topic}
                newsLimit={limit + 7}
                matchTier={matchTier}
                excludeOpinion={excludeOpinion}
            />
            {newsOnly}
        </div>
    );
}
