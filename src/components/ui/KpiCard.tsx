'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star, type LucideIcon } from 'lucide-react';
import { useWatchlist } from '@/lib/watchlist';
import { DeltaChip } from './DeltaChip';
import { AnimatedNumber } from './AnimatedNumber';

/**
 * @deprecated Kolor akcentu nie jest już rysowany — patrz komentarz przy `KpiCard`.
 * Typ i prop zostają, żeby 73 wywołania w 15 plikach kompilowały się bez zmian; wartość jest
 * ignorowana. Do usunięcia osobnym codemodem, gdy nie będzie już nic innego do zrobienia.
 */
export type AccentKey = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'slate';

export interface KpiCardProps {
    label: string;
    /** Pre-formatted value string, e.g. "4,2" */
    value: string;
    unit?: string;
    delta?: { value: number; unit?: 'pp' | 'pct' | 'none'; note?: string; invert?: boolean };
    /** @deprecated ignorowany — kolor kafla nie jest już dekoracją. */
    accent?: AccentKey;
    icon?: LucideIcon;
    /** Small line under the value, e.g. "maj 2026" — pominięte gdy puste */
    footnote?: string;
    loading?: boolean;
    /** Awaria źródła — nie mylić z pustą serią. Pokazuje komunikat i opcjonalne ponowienie. */
    error?: boolean;
    onRetry?: () => void;
    /** Gdy podany, cały kafel jest linkiem do właściwej zakładki (deep-link, np. `/gospodarka?tab=aktywnosc`). */
    href?: string;
    /** Gdy podany, kafel dostaje gwiazdkę „obserwuj" (watchlista w localStorage). */
    watchId?: string;
    /** Gęstszy wariant — mniejszy padding (siatka 6 KPI). */
    compact?: boolean;
}

/**
 * Kafel KPI — liczba JEST treścią, więc kolor nie ma tu nic do roboty.
 *
 * ─── Dlaczego zniknął kolorowy pasek i kółko pod ikoną ───
 * Kafel miał 7 wariantów akcentu (blue/green/amber/violet/rose/cyan/slate) rysujących 4px pasek
 * przez całą szerokość karty i pastelowe kółko 38px. Pomiar pokazał, że ten kolor NIC nie kodował:
 *   • ten sam wskaźnik miał różne kolory na różnych stronach („Bezrobocie rej. — kraj" bursztynowe,
 *     „Bezrobocie rejestrowane" niebieskie) → nie niósł tożsamości;
 *   • bursztyn dzieliły CPI, Import, Ropa Brent i „najbiedniejsze woj." → nie niósł znaczenia;
 *   • zielony i czerwony są u nas kolorami STATUSU (DeltaChip, StaleBadge), więc zielony pasek nad
 *     kaflem z czerwonym chipem spadku dawał sprzeczny sygnał.
 * To trzy antywzorce z kanonu dataviz naraz: „status color used for a non-status series",
 * „categorical hues when the story is one number" i „thick saturated blocks".
 *
 * Kolor wraca wyłącznie tam, gdzie coś znaczy: kierunek zmiany (DeltaChip) i ostrzeżenia
 * (StaleBadge). Hierarchię niesie typografia i rytm, nie pigment.
 *
 * ⚠ NIE dodawać paddingu na `.mk-kpi` — to kontener zapytań, a `cqi` liczy się od content-boxa,
 * więc padding skurczyłby liczbę. Padding mieszka na `.mk-kpi-body`.
 */
export function KpiCard({ label, value, unit, delta, icon: Icon, footnote, loading, error, onRetry, href, watchId, compact }: KpiCardProps) {
    const footnoteText = footnote?.trim() || undefined;
    const watch = useWatchlist();
    const wrap = (node: ReactNode, extra = '') => (
        <div className={`mk-kpi${compact ? ' mk-kpi-compact' : ''} ${extra}`.trim()}>{node}</div>
    );
    if (loading) {
        // Skeleton ma tę samą strukturę co kafel z danymi — inaczej rząd skacze, gdy każde
        // z kilku zapytań kończy się w innym momencie.
        return wrap(
            <div className="mk-card overflow-hidden">
                <div className="mk-kpi-body">
                    <div className="mk-kpi-label"><span className="mk-skeleton h-3 w-24 rounded" /></div>
                    <div className="mk-kpi-figure"><span className="mk-skeleton h-8 w-28 rounded" /></div>
                    <div className="mk-kpi-foot"><span className="mk-skeleton h-2.5 w-20 rounded" /></div>
                </div>
            </div>,
        );
    }
    if (error) {
        return wrap(
            <div className="mk-card overflow-hidden">
                <div className="mk-kpi-body">
                    <div className="mk-kpi-label">
                        {Icon && <Icon className="mk-kpi-icon" size={14} strokeWidth={1.75} aria-hidden />}
                        <span>{label}</span>
                    </div>
                    <div className="mk-kpi-figure">
                        <span className="mk-kpi-value">—</span>
                    </div>
                    <div className="mk-kpi-foot">
                        {onRetry ? (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="text-left text-[11px] font-medium text-mk-primary hover:underline"
                            >
                                Błąd źródła · ponów
                            </button>
                        ) : (
                            <span>Błąd źródła</span>
                        )}
                    </div>
                </div>
            </div>,
        );
    }

    const body = (
        <div className="mk-kpi-body">
            <div className="mk-kpi-label">
                {Icon && <Icon className="mk-kpi-icon" size={14} strokeWidth={1.75} aria-hidden />}
                <span>{label}</span>
                {/* Strzałka „wejdź głębiej" — tylko dla kafli z linkiem; pojawia się przy najechaniu. */}
                {href && !watchId && <ArrowUpRight size={14} className="ml-auto shrink-0 text-mk-faint opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
            </div>
            {/* `min-w-0` na wartości pozwala jej się skurczyć zamiast wypychać jednostkę poza kartę. */}
            <div className="mk-kpi-figure">
                <span className="mk-kpi-value min-w-0"><AnimatedNumber value={value} /></span>
                {unit && <span className="mk-kpi-unit shrink-0">{unit}</span>}
            </div>
            {delta && <div className="mk-kpi-delta"><DeltaChip value={delta.value} unit={delta.unit} note={delta.note} invert={delta.invert} /></div>}
            {footnoteText && <div className="mk-kpi-foot">{footnoteText}</div>}
        </div>
    );

    const star = watchId ? (
        <button
            type="button"
            onClick={() => watch.toggle('wskaznik', watchId)}
            aria-pressed={watch.ready && watch.has('wskaznik', watchId)}
            aria-label={watch.has('wskaznik', watchId) ? `${label} — przestań obserwować` : `${label} — obserwuj`}
            title={watch.has('wskaznik', watchId) ? 'Przestań obserwować' : 'Obserwuj'}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-mk-faint transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
        >
            {/* `watch.ready` chroni przed hydration mismatch — na serwerze nie znamy localStorage. */}
            <Star size={14} className={watch.ready && watch.has('wskaznik', watchId) ? 'fill-mk-primary text-mk-primary' : ''} />
        </button>
    ) : null;

    if (href) {
        const link = (
            <Link
                href={href}
                className="mk-card mk-card-interactive group block h-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/50"
                aria-label={`${label} — przejdź do szczegółów`}
            >
                {body}
            </Link>
        );
        // Gwiazdka MUSI być rodzeństwem linku, nie dzieckiem — <button> w <a> to nieprawidłowy HTML.
        return star ? wrap(<>{link}{star}</>, 'relative') : wrap(link);
    }

    return wrap(
        <>
            <div className="mk-card mk-card-interactive relative overflow-hidden">
                {body}
                {star}
            </div>
        </>,
        'relative',
    );
}
