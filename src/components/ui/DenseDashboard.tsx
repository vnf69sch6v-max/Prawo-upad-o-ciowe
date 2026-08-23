'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { formatDecimalPL, formatPP } from '@/lib/formatters';
import type { LucideIcon } from 'lucide-react';
import type { AccentKey } from '@/components/ui/KpiCard';
import { CompactKpi } from '@/components/ui/CompactKpi';

/** Pojedynczy sygnał w pasie hero (3 kolumny). */
export interface DenseHeroSlot {
    label: string;
    value: string;
    delta?: number | null;
    deltaUnit?: 'pp' | 'pct';
    text?: string;
    footnote?: string;
    href?: string;
    loading?: boolean;
}

export function DenseHero({ slots, ariaLabel }: { slots: DenseHeroSlot[]; ariaLabel: string }) {
    const cols = slots.slice(0, 3);
    const spans = ['lg:col-span-4', 'lg:col-span-4', 'lg:col-span-4'];

    return (
        <section className="mk-hero-band overflow-hidden" aria-label={ariaLabel}>
            <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                {cols.map((slot, i) => (
                    <div key={slot.label} className={`p-3 sm:p-4 ${spans[i] ?? 'lg:col-span-4'}`}>
                        {slot.loading ? (
                            <div className="space-y-2.5">
                                <div className="h-3.5 w-36 rounded bg-white/20" />
                                <div className="h-10 w-28 rounded bg-white/20" />
                                <div className="h-3 w-full max-w-xs rounded bg-white/15" />
                            </div>
                        ) : (
                            <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">{slot.label}</p>
                                <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
                                    {slot.href ? (
                                        <Link href={slot.href} className="tnum text-3xl font-extrabold tracking-tight transition-opacity hover:opacity-90 sm:text-4xl">
                                            {slot.value}
                                        </Link>
                                    ) : (
                                        <span className="tnum text-3xl font-extrabold tracking-tight sm:text-4xl">{slot.value}</span>
                                    )}
                                    {slot.delta != null && (
                                        <span className="mk-hero-chip">
                                            {slot.deltaUnit === 'pct'
                                                ? `${slot.delta >= 0 ? '+' : ''}${formatDecimalPL(slot.delta, 2)}%`
                                                : formatPP(slot.delta)}
                                        </span>
                                    )}
                                </div>
                                {slot.text && <p className="mk-hero-muted mt-2 max-w-sm text-sm leading-relaxed">{slot.text}</p>}
                                {slot.footnote && (
                                    <p className="mk-hero-muted mt-3 text-[11px] font-semibold uppercase tracking-wide">{slot.footnote}</p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export interface DenseKpiItem {
    key: string;
    label: string;
    value: string;
    unit?: string;
    accent?: AccentKey;
    icon?: LucideIcon;
    delta?: { value: number; unit?: 'pp' | 'pct' | 'none'; invert?: boolean };
    footnote?: string;
    loading?: boolean;
    href?: string;
    watchId?: string;
}

/** Kompaktowa siatka KPI — mniejszy padding, więcej kolumn. */
export function DenseKpiGrid({
    items,
    label,
    columns = 6,
}: {
    items: DenseKpiItem[];
    label?: string;
    columns?: 5 | 6;
}) {
    const colClass = columns === 5
        ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';

    return (
        <section>
            {label && <h2 className="mk-section-label mb-2.5">{label}</h2>}
            <div className={`grid grid-cols-2 gap-3 ${colClass}`}>
                {items.map(({ key, ...k }) => (
                    <CompactKpi key={key} {...k} />
                ))}
            </div>
        </section>
    );
}

/** Układ dwukolumnowy pod hero + siatkę (newsy + wykres itp.). */
export function DenseTwoCol({
    left,
    right,
    className = '',
}: {
    left: ReactNode;
    right: ReactNode;
    className?: string;
}) {
    return (
        <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${className}`}>
            <div className="min-w-0">{left}</div>
            <div className="min-w-0">{right}</div>
        </div>
    );
}
