'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatPP } from '@/lib/formatters';
import { DeltaChip } from '@/components/ui/DeltaChip';

export interface HeroMetricCardProps {
    /** Uppercase label above the value. */
    headline: string;
    /** Pre-formatted metric, e.g. "4,2%". Omit when using `children`. */
    value?: string;
    /** Month-over-month / period delta in pp — rendered as hero chip. */
    delta?: number | null;
    /** Invert delta coloring (inflation, unemployment). */
    invertDelta?: boolean;
    /** Supporting sentence under the figure. */
    text?: string;
    /** Source line at the bottom. */
    footnote?: string;
    loading?: boolean;
    /** Primary = larger figure (CPI); secondary = retail-sized. */
    emphasis?: 'primary' | 'secondary';
    /** `band` = cell in red hero strip; `card` = white editorial card with brand icon. */
    variant?: 'band' | 'card';
    icon?: LucideIcon;
    className?: string;
    /** Custom content (e.g. news link) instead of metric layout. */
    children?: ReactNode;
}

/**
 * Cell inside the red hero band on Przegląd — shared by OverviewHero and any future hero strips.
 */
export function HeroMetricCard({
    headline,
    value,
    delta,
    invertDelta,
    text,
    footnote,
    loading,
    emphasis = 'secondary',
    variant = 'band',
    icon: Icon,
    className = '',
    children,
}: HeroMetricCardProps) {
    const valueClass =
        emphasis === 'primary'
            ? 'tnum text-3xl font-extrabold tracking-tight sm:text-4xl'
            : 'tnum text-2xl font-extrabold tracking-tight sm:text-3xl';

    const cardValueClass = 'tnum text-3xl font-extrabold tracking-tight text-mk-text sm:text-4xl';

    if (variant === 'card') {
        return (
            <div className={`mk-card mk-card-editorial mk-card-pad-compact h-full ${className}`.trim()}>
                {loading ? (
                    <div className="space-y-2.5">
                        <div className="mk-skeleton h-9 w-9 rounded-lg" />
                        <div className="mk-skeleton h-3 w-32 rounded" />
                        <div className="mk-skeleton h-10 w-24 rounded" />
                        <div className="mk-skeleton h-2.5 w-20 rounded" />
                    </div>
                ) : (
                    <>
                        {Icon && (
                            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-mk-brand/10 text-mk-brand" aria-hidden>
                                <Icon size={18} strokeWidth={1.75} />
                            </span>
                        )}
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-mk-muted">{headline}</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            {value != null && <span className={cardValueClass}>{value}</span>}
                            {delta != null && <DeltaChip value={delta} unit="pp" invert={invertDelta} />}
                        </div>
                        {text && <p className="mt-2 text-xs leading-relaxed text-mk-text-soft">{text}</p>}
                        {footnote && <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-wide text-mk-faint">{footnote}</p>}
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={`mk-hero-metric p-3 sm:p-4 ${className}`.trim()}>
            {loading ? (
                <div className="space-y-2">
                    <div className="h-3 w-40 rounded bg-white/20" />
                    <div className={`rounded bg-white/20 ${emphasis === 'primary' ? 'h-10 w-28' : 'h-8 w-24'}`} />
                    {text !== undefined && <div className="h-3 w-full rounded bg-white/15" />}
                </div>
            ) : children ? (
                <>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">{headline}</p>
                    <div className="mt-1.5">{children}</div>
                </>
            ) : (
                <>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">{headline}</p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                        {value != null && <span className={valueClass}>{value}</span>}
                        {delta != null && <span className="mk-hero-chip">{formatPP(delta)}</span>}
                    </div>
                    {text && <p className="mk-hero-muted mt-2 max-w-md text-xs leading-relaxed sm:text-sm">{text}</p>}
                    {footnote && (
                        <p className="mk-hero-muted mt-2.5 text-[10px] font-semibold uppercase tracking-wide">{footnote}</p>
                    )}
                </>
            )}
        </div>
    );
}

/** Rząd trzech dużych kart hero (mockup Gospodarka). */
export function HeroMetricRow({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <section className={className} aria-label="Kluczowe wskaźniki">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
        </section>
    );
}
