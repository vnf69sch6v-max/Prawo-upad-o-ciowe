'use client';

import type { ReactNode } from 'react';

interface SectionCardProps {
    title?: ReactNode;
    subtitle?: ReactNode;
    /** Right-aligned header controls (toggles, export, etc.) */
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    padded?: boolean;
}

/** White titled card wrapper — the base surface for the light dashboard. */
export function SectionCard({ title, subtitle, actions, children, className = '', padded = true }: SectionCardProps) {
    return (
        <section className={`mk-card ${padded ? 'mk-card-pad' : ''} ${className}`}>
            {(title || actions) && (
                <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        {title && <h3 className="mk-section-title">{title}</h3>}
                        {subtitle && <p className="mt-0.5 text-sm text-mk-muted">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            {children}
        </section>
    );
}
