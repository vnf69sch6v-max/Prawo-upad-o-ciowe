'use client';

import { CompactKpi } from '@/components/ui/CompactKpi';
import type { KpiCardProps } from '@/components/ui/KpiCard';

export interface CompactKpiItem extends KpiCardProps {
    key: string;
}

/** Kompaktowa siatka KPI — 6 kolumn na desktopie, trend arrows via DeltaChip. */
export function CompactKpiGrid({
    items,
    label,
    columns = 6,
    dense = false,
}: {
    items: CompactKpiItem[];
    label?: string;
    columns?: 4 | 5 | 6;
    /** gap-2 zamiast gap-3 — Przegląd above-the-fold */
    dense?: boolean;
}) {
    // Telefon = zawsze 2 kolumny. Nieparzysty ostatni kafel zajmuje cały rząd, zamiast zostawiać
    // dziurę obok siebie (5 wskaźników makro na Przeglądzie) — reset tam, gdzie kolumn jest więcej.
    const colClass = columns === 4
        ? 'md:grid-cols-2 lg:grid-cols-4 lg:[&>*:last-child:nth-child(odd)]:col-span-1'
        : columns === 5
            ? 'md:grid-cols-3 lg:grid-cols-5 md:[&>*:last-child:nth-child(odd)]:col-span-1'
            : 'md:grid-cols-3 lg:grid-cols-6 md:[&>*:last-child:nth-child(odd)]:col-span-1';

    return (
        <section>
            {label && <h2 className={`mk-section-label ${dense ? 'mb-1.5' : 'mb-2'}`}>{label}</h2>}
            <div className={`grid grid-cols-2 [&>*:last-child:nth-child(odd)]:col-span-2 ${dense ? 'gap-2' : 'gap-3'} ${colClass}`}>
                {items.map(({ key, ...props }) => (
                    <CompactKpi key={key} {...props} />
                ))}
            </div>
        </section>
    );
}
