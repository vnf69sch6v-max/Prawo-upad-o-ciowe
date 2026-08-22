'use client';

import { useMemo } from 'react';
import { getUpcomingEvents, EVENT_COLORS } from '@/lib/calendar';
import { formatDate } from '@/lib/formatters';

export function PublicationDatesPanel({
    count = 5,
    title = 'Daty publikacji',
    variant = 'default',
    compact = false,
}: {
    count?: number;
    title?: string;
    variant?: 'default' | 'overview';
    compact?: boolean;
}) {
    const events = useMemo(() => getUpcomingEvents(count), [count]);
    const heading = variant === 'overview' ? 'Daty publikacji' : title;
    const padClass = compact ? 'mk-card-pad-compact' : 'mk-card-pad';

    return (
        <div className={`mk-card mk-card-editorial ${padClass} h-full`}>
            {variant === 'overview' ? (
                <h3 className={`mk-section-label ${compact ? 'mb-2' : 'mb-4'}`}>{heading}</h3>
            ) : (
                <h3 className={`mk-section-title ${compact ? 'mb-2' : 'mb-4'}`}>{heading}</h3>
            )}
            <ul className="divide-y divide-mk-border">
                {events.map((e, i) => (
                    <li key={i} className={`flex items-start gap-2.5 first:pt-0 last:pb-0 ${compact ? 'py-2' : 'py-3.5'}`}>
                        {variant === 'overview' ? (
                            <span className="mt-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-mk-faint">{formatDate(e.date)}</span>
                        ) : (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                        )}
                        <div className="min-w-0 flex-1">
                            <div className={`leading-snug text-mk-text-soft ${compact ? 'text-[13px]' : 'text-sm'}`}>{e.name}</div>
                            {variant !== 'overview' && <div className="mt-0.5 text-xs text-mk-faint tnum">{formatDate(e.date)}</div>}
                        </div>
                        {e.importance === 'high' && (
                            <span
                                className={variant === 'overview' ? 'mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-mk-brand' : 'mt-0.5 rounded-full bg-mk-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-primary'}
                                style={variant === 'overview' ? { border: '1px solid var(--color-mk-brand)' } : undefined}
                            >
                                kluczowe
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
