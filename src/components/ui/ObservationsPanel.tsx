'use client';

import type { Observation } from '@/lib/observations';

export function ObservationsPanel({
    items,
    title = 'Kluczowe obserwacje',
    variant = 'default',
}: {
    items: Observation[];
    title?: string;
    variant?: 'default' | 'overview';
}) {
    const heading = variant === 'overview' ? 'Kluczowe obserwacje' : title;

    return (
        <div className="mk-card mk-card-editorial mk-card-pad h-full">
            {variant === 'overview' ? (
                <h3 className="mk-section-label mb-4">{heading}</h3>
            ) : (
                <h3 className="mk-section-title mb-4">{heading}</h3>
            )}
            {items.length === 0 ? (
                <p className="text-sm text-mk-faint">Brak sygnałów do wyświetlenia.</p>
            ) : (
                <ul className="divide-y divide-mk-border">
                    {items.map((o, i) => (
                        <li key={i} className="flex gap-4 py-3.5 text-sm text-mk-text-soft first:pt-0 last:pb-0">
                            {variant === 'overview' ? (
                                <span className="mk-obs-num shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            ) : (
                                <ObservationDot tone={o.tone ?? 'neutral'} />
                            )}
                            <span className="leading-snug">{o.text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ObservationDot({ tone }: { tone: string }) {
    const colors: Record<string, string> = {
        up: '#16A34A',
        down: '#DC2626',
        neutral: '#2563EB',
        warn: '#D97706',
    };
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: colors[tone] ?? colors.neutral }} />;
}
