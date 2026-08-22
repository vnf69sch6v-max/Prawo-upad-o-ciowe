'use client';

import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { WatchKind } from '@/lib/watchlist';
import { WatchStar } from './WatchStar';
import { DeltaChip } from './DeltaChip';
import { AnimatedNumber } from './AnimatedNumber';

/**
 * @deprecated Kolor akcentu nie jest już rysowany — patrz komentarz przy `KpiCard`.
 * Typ i prop zostają, żeby 73 wywołania w 15 plikach kompilowały się bez zmian; wartość jest
 * ignorowana. Do usunięcia osobnym codemodem, gdy nie będzie już nic innego do zrobienia.
 */
export type AccentKey = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'slate';

interface KpiCardProps {
    label: string;
    /** Pre-formatted value string, e.g. "4,2" */
    value: string;
    unit?: string;
    delta?: { value: number; unit?: 'pp' | 'pct' | 'none'; note?: string; invert?: boolean };
    /** @deprecated ignorowany — kolor kafla nie jest już dekoracją. */
    accent?: AccentKey;
    icon?: LucideIcon;
    /** Small line under the value, e.g. "Cel NBP: 2,5%" or "maj 2026" */
    footnote?: string;
    loading?: boolean;
    /** Gdy podany, cały kafel jest linkiem do właściwej zakładki (deep-link, np. `/gospodarka?tab=aktywnosc`). */
    href?: string;
    /**
     * Gdy podany, kafel dostaje gwiazdkę „obserwuj" (watchlista w localStorage).
     * `kind` jest częścią klucza, bo spółka i wskaźnik mogą mieć ten sam identyfikator
     * (np. „WIG20" jako indeks-wskaźnik i jako pozycja rynkowa).
     */
    watch?: { kind: WatchKind; id: string };
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
export function KpiCard({ label, value, unit, delta, icon: Icon, footnote, loading, href, watch }: KpiCardProps) {
    if (loading) {
        // Skeleton ma tę samą strukturę co kafel z danymi — inaczej rząd skacze, gdy każde
        // z kilku zapytań kończy się w innym momencie.
        return (
            <div className="mk-kpi mk-card overflow-hidden">
                <div className="mk-kpi-body">
                    <div className="mk-kpi-label"><span className="mk-skeleton h-3 w-24 rounded" /></div>
                    <div className="mk-kpi-figure"><span className="mk-skeleton h-8 w-28 rounded" /></div>
                    <div className="mk-kpi-foot"><span className="mk-skeleton h-2.5 w-20 rounded" /></div>
                </div>
            </div>
        );
    }

    const body = (
        <div className="mk-kpi-body">
            {/* `pr-8` robi miejsce na gwiazdkę — inaczej dłuższa etykieta wchodzi pod nią.
                `.mk-kpi-label` nie ustawia paddingu skrótem, więc utility Tailwinda działa. */}
            <div className={`mk-kpi-label${watch ? ' pr-8' : ''}`}>
                {Icon && <Icon className="mk-kpi-icon" size={14} strokeWidth={1.75} aria-hidden />}
                <span>{label}</span>
                {/* Strzałka „wejdź głębiej" — tylko dla kafli z linkiem; pojawia się przy najechaniu. */}
                {href && !watch && <ArrowUpRight size={14} className="ml-auto shrink-0 text-mk-faint opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
            </div>
            {/* `min-w-0` na wartości pozwala jej się skurczyć zamiast wypychać jednostkę poza kartę. */}
            <div className="mk-kpi-figure">
                <span className="mk-kpi-value min-w-0"><AnimatedNumber value={value} /></span>
                {unit && <span className="mk-kpi-unit shrink-0">{unit}</span>}
            </div>
            {delta && <div className="mk-kpi-delta"><DeltaChip value={delta.value} unit={delta.unit} note={delta.note} invert={delta.invert} /></div>}
            {footnote && <div className="mk-kpi-foot">{footnote}</div>}
        </div>
    );

    const star = watch ? <WatchStar kind={watch.kind} id={watch.id} label={label} /> : null;

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
        return star ? (
            <div className="mk-kpi relative">{link}{star}</div>
        ) : (
            <div className="mk-kpi">{link}</div>
        );
    }

    return (
        <div className="mk-kpi mk-card mk-card-interactive relative overflow-hidden">
            {body}
            {star}
        </div>
    );
}
