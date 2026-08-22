'use client';

import { useMemo } from 'react';
import { getUpcomingEvents, EVENT_COLORS } from '@/lib/calendar';
import { formatDate } from '@/lib/formatters';

export function PublicationDatesPanel({
    count = 5,
    title = 'Daty publikacji',
    variant = 'default',
}: {
    count?: number;
    title?: string;
    variant?: 'default' | 'overview';
}) {
    const events = useMemo(() => getUpcomingEvents(count), [count]);
    const heading = variant === 'overview' ? 'Daty publikacji' : title;

    return (
        <div className="mk-card mk-card-pad h-full">
            {variant === 'overview' ? (
                <h3 className="mk-section-label mb-4">{heading}</h3>
            ) : (
                <h3 className="mk-section-title mb-4">{heading}</h3>
            )}
            <ul className="space-y-3.5">
                {events.map((e, i) => (
                    <li key={i} className="flex items-start gap-3">
                        {variant === 'overview' ? (
                            <span className="mt-0.5 shrink-0 text-xs font-semibold tabular-nums text-mk-faint">
                                {formatDate(e.date)}
                            </span>
                        ) : (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="text-sm leading-snug text-mk-text-soft">{e.name}</div>
                            {variant !== 'overview' && (
                                <div className="mt-0.5 text-xs text-mk-faint tnum">{formatDate(e.date)}</div>
                            )}
                        </div>
                        {e.importance === 'high' && (
                            <span
                                className={
                                    variant === 'overview'
                                        ? 'mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mk-brand'
                                        : 'mt-0.5 rounded-full bg-mk-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-primary'
                                }
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
