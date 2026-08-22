'use client';

import { KpiCard, type KpiCardProps } from './KpiCard';

/** Dense KPI tile for Przegląd grids — same API as KpiCard, tighter padding and typography. */
export function CompactKpi(props: KpiCardProps) {
    return <KpiCard {...props} compact />;
}

export type { KpiCardProps };
