'use client';

import { Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWatchlist } from '@/lib/watchlist';
import { CompactKpi } from '@/components/ui/CompactKpi';
import type { AccentKey } from '@/components/ui/KpiCard';

export interface WatchableKpi {
    watchId: string;
    label: string;
    href?: string;
    value: string;
    unit?: string;
    accent?: AccentKey;
    icon?: LucideIcon;
    delta?: { value: number; unit?: 'pp' | 'pct' | 'none'; note?: string; invert?: boolean };
    footnote?: string;
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
}

/**
 * Pas „Obserwowane" — kafle z watchlisty użytkownika, bez dublowania zapytań
 * (renderuje z tablic macro/markets już wczytanych na Przeglądzie).
 */
export function WatchlistStrip({ items, compact = false }: { items: WatchableKpi[]; compact?: boolean }) {
    const watch = useWatchlist();
    if (!watch.ready) return null;
    const watched = items.filter((k) => watch.has('wskaznik', k.watchId));
    if (watched.length === 0) return null;
    return (
        <section aria-label="Obserwowane wskaźniki">
            <h2 className={`mk-section-label flex items-center gap-2 ${compact ? 'mb-1.5' : 'mb-3'}`}>
                <Star size={13} className="fill-mk-brand text-mk-brand" aria-hidden />
                Obserwowane
            </h2>
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ${compact ? 'gap-2' : 'gap-4'}`}>
                {watched.map((k) => <CompactKpi key={k.watchId} {...k} watchId={k.watchId} />)}
            </div>
        </section>
    );
}
