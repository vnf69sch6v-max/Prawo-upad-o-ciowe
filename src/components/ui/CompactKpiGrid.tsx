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
    columns?: 5 | 6;
    /** gap-2 zamiast gap-3 — Przegląd above-the-fold */
    dense?: boolean;
}) {
    const colClass = columns === 5
        ? 'md:grid-cols-3 lg:grid-cols-5'
        : 'md:grid-cols-3 lg:grid-cols-6';

    return (
        <section>
            {label && <h2 className={`mk-section-label ${dense ? 'mb-1.5' : 'mb-2'}`}>{label}</h2>}
            <div className={`grid grid-cols-2 ${dense ? 'gap-2' : 'gap-3'} ${colClass}`}>
                {items.map(({ key, ...props }) => (
                    <CompactKpi key={key} {...props} />
                ))}
            </div>
        </section>
    );
}
