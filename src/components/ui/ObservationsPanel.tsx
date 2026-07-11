'use client';

import type { Observation, Tone } from '@/lib/observations';

const DOT: Record<Tone, string> = {
    up: '#16A34A',
    down: '#DC2626',
    neutral: '#2563EB',
    warn: '#D97706',
};

export function ObservationsPanel({ items, title = 'Kluczowe obserwacje' }: { items: Observation[]; title?: string }) {
    return (
        <div className="mk-card mk-card-pad h-full">
            <h3 className="mk-section-title mb-4">{title}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-mk-faint">Brak sygnałów do wyświetlenia.</p>
            ) : (
                <ul className="space-y-3.5">
                    {items.map((o, i) => (
                        <li key={i} className="flex gap-3 text-sm text-mk-text-soft">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: DOT[o.tone ?? 'neutral'] }} />
                            <span className="leading-snug">{o.text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
