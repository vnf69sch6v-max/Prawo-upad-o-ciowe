'use client';

import { Star } from 'lucide-react';
import { useWatchlist, type WatchKind } from '@/lib/watchlist';

interface WatchStarProps {
    kind: WatchKind;
    /** Stabilny identyfikator — dla spółek ticker, dla wskaźników slug z `lib/watch-ids.ts`. */
    id: string;
    /** Nazwa czytana przez screen readery: „CPI — obserwuj". */
    label: string;
    /** `floating` = przyklejona do prawego górnego rogu kafla; `inline` = w wierszu tabeli. */
    variant?: 'floating' | 'inline';
    size?: number;
}

/**
 * Gwiazdka „obserwuj" — jedyne miejsce, w którym renderujemy przełącznik watchlisty.
 *
 * Wydzielona z `KpiCard`, bo tam `useWatchlist()` wisiał w KAŻDYM kaflu, także w tych bez gwiazdki.
 * Teraz do store'a podpina się wyłącznie komponent, który naprawdę pokazuje stan obserwowania.
 *
 * `stopPropagation` + `preventDefault` są obowiązkowe: gwiazdka siedzi na klikalnych powierzchniach
 * (wiersz tabeli spółek prowadzi do `/spolki/[ticker]`, kafel KPI bywa linkiem), a kliknięcie
 * gwiazdki ma dodać do obserwowanych, NIE nawigować.
 */
export function WatchStar({ kind, id, label, variant = 'floating', size = 14 }: WatchStarProps) {
    // Przy hydracji store zwraca snapshot serwerowy (pusty), więc gwiazdka jest wtedy niezaznaczona
    // i dopiero kolejny render pokazuje prawdę z localStorage. Patrz komentarz w `lib/watchlist.ts`.
    const { has, toggle } = useWatchlist();
    const on = has(kind, id);

    const base = 'flex items-center justify-center rounded-lg text-mk-faint transition-colors hover:bg-mk-surface-alt hover:text-mk-text focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/50';
    // 28px = minimum celu dotykowego z WCAG 2.2 (24px) z zapasem.
    const box = variant === 'floating' ? 'absolute right-2 top-2 z-10 h-7 w-7' : 'h-7 w-7';

    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(kind, id); }}
            aria-pressed={on}
            aria-label={on ? `${label} — przestań obserwować` : `${label} — obserwuj`}
            title={on ? 'Przestań obserwować' : 'Obserwuj'}
            className={`${base} ${box}`}
        >
            <Star size={size} className={on ? 'fill-mk-primary text-mk-primary' : ''} />
        </button>
    );
}
