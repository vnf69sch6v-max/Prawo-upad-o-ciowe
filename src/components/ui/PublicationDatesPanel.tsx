'use client';

import { useMemo } from 'react';
import { getUpcomingEvents, EVENT_COLORS } from '@/lib/calendar';
import { formatDate } from '@/lib/formatters';

export function PublicationDatesPanel({ count = 5, title = 'Daty publikacji' }: { count?: number; title?: string }) {
    const events = useMemo(() => getUpcomingEvents(count), [count]);

    return (
        <div className="mk-card mk-card-pad h-full">
            <h3 className="mk-section-title mb-4">{title}</h3>
            <ul className="space-y-3">
                {events.map((e, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                        <div className="min-w-0 flex-1">
                            <div className="text-sm leading-snug text-mk-text-soft">{e.name}</div>
                            <div className="mt-0.5 text-xs text-mk-faint tnum">{formatDate(e.date)}</div>
                        </div>
                        {e.importance === 'high' && (
                            <span className="mt-0.5 rounded-full bg-mk-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-primary">kluczowe</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
