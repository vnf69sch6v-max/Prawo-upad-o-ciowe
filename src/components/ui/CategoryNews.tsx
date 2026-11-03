'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNews, type NewsItem } from '@/lib/hooks';
import { matchNewsLabelled, type MatchTier, type NewsTopic } from '@/lib/news/match';
import { formatRelativeTime, formatTime } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';
import { Corroboration, ExternalMark, NewsTag } from '@/components/ui/NewsRow';
import { useIsClient } from '@/lib/use-is-client';

/** Nagłówki kart per temat. */
export const CATEGORY_LABELS: Record<NewsTopic, string> = {
    ceny: 'ceny i inflacja',
    gospodarka: 'gospodarka',
    praca: 'rynek pracy',
    rynki: 'rynki',
};

const CATEGORY_SUBTITLES: Record<NewsTopic, string> = {
    ceny: 'Inflacja, paliwa, energia i ceny w sklepach',
    gospodarka: 'PKB, aktywność i finanse publiczne',
    praca: 'Płace, bezrobocie i zatrudnienie',
    rynki: 'GPW, złoty, stopy procentowe i NBP',
};

/** Na telefonie (<lg) karta stoi pod wykresem — najwyżej tyle wierszy, reszta pod „Więcej”. */
const MOBILE_ROWS = 3;

// Dotyk: 44 px wysokości; ujemny margines pionowy, żeby większy cel nie rozpychał nagłówka karty.
const AllNewsLink = () => (
    <Link
        href="/newsy"
        className="mk-press -mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-brand transition-colors hover:bg-mk-brand-soft hover:underline active:bg-mk-brand-soft touch:-my-2.5 touch:min-h-11"
    >
        Wszystkie <ArrowRight size={14} />
    </Link>
);

/**
 * Wiersz jak na Przeglądzie (`DailyDigestCard`) i `/newsy` (#79, `NewsRow.tsx`): cały wiersz linkiem ≥44 px,
 * ikona przy tytule, neutralny tag podtematu (dlaczego news tu stoi), źródło, czas względny po hydratacji.
 */
function NewsRowLink({ item, label, mounted }: { item: NewsItem; label: string; mounted: boolean }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mk-press-row group flex min-h-11 flex-col justify-center rounded-lg px-2 py-2.5"
        >
            <span className="text-sm font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                {item.title}
                <ExternalMark />
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mk-muted">
                <NewsTag label={label} />
                <span>{item.source}</span>
                <span className="text-mk-faint" aria-hidden>·</span>
                {/* „2 godz. temu” zależy od „teraz” — przed hydratacją sama godzina (AGENTS.md, #418). */}
                <time dateTime={item.publishedAt}>
                    {mounted ? formatRelativeTime(item.publishedAt) : formatTime(item.publishedAt)}
                </time>
                <Corroboration n={item.corroboration ?? 1} wire={item.wire} alsoIn={item.alsoIn} compact />
            </span>
        </a>
    );
}

/**
 * Pas newsów przy wskaźniku (ROADMAP N4, spec `docs/specs/2026-11-03-newsy-przy-wskaznikach.md`).
 * Reguły dopasowania: `lib/news/match.ts` — precyzja > zasięg.
 *
 * Brak trafień, ładowanie albo błąd feedu → komponent nie renderuje niczego. Przy nastawieniu na precyzję
 * zero trafień to normalny dzień (np. bez danych o PKB), a pusta ramka „brak newsów” obok wykresu tylko
 * zajmowałaby miejsce. Pełna lista jest zawsze pod „Wszystkie” → /newsy.
 */
export function CategoryNewsPanel({
    topic,
    limit = 5,
    className = '',
    matchTier = 'all',
    excludeOpinion = false,
}: {
    topic: NewsTopic;
    limit?: number;
    className?: string;
    matchTier?: MatchTier;
    excludeOpinion?: boolean;
}) {
    const mounted = useIsClient();
    const [expanded, setExpanded] = useState(false);
    const { data } = useNews();
    const matches = useMemo(
        () => matchNewsLabelled(data?.items ?? [], topic, limit, { matchTier, excludeOpinion }),
        [data, topic, limit, matchTier, excludeOpinion],
    );

    if (matches.length === 0) return null;
    const hiddenOnMobile = expanded ? 0 : Math.max(0, matches.length - MOBILE_ROWS);

    return (
        <SectionCard
            title={`Newsy — ${CATEGORY_LABELS[topic]}`}
            subtitle={CATEGORY_SUBTITLES[topic]}
            className={className}
            editorial
            titleVariant="label"
            actions={<AllNewsLink />}
        >
            <ul className="-mx-2 list-none divide-y divide-mk-border">
                {matches.map(({ item, label }, i) => (
                    <li key={item.link} className={!expanded && i >= MOBILE_ROWS ? 'hidden lg:block' : undefined}>
                        <NewsRowLink item={item} label={label} mounted={mounted} />
                    </li>
                ))}
            </ul>
            {hiddenOnMobile > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="mk-press mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-mk-border text-sm font-medium text-mk-text-soft transition-colors hover:bg-mk-surface-alt lg:hidden"
                >
                    Więcej ({hiddenOnMobile}) <ChevronDown size={14} aria-hidden />
                </button>
            )}
        </SectionCard>
    );
}
