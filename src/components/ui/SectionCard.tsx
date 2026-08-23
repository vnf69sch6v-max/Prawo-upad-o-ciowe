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
    /** `label` = uppercase mk-section-label (styl Przeglądu); domyślnie mk-section-title */
    titleVariant?: 'title' | 'label';
    /** Cienka ramka bez cienia — wariant editorial */
    editorial?: boolean;
}

/** White titled card wrapper — the base surface for the light dashboard. */
export function SectionCard({
    title,
    subtitle,
    actions,
    children,
    className = '',
    padded = true,
    titleVariant = 'title',
    editorial = false,
}: SectionCardProps) {
    return (
        <section className={`mk-card min-w-0 ${editorial ? 'mk-card-editorial' : ''} ${padded ? 'mk-card-pad' : ''} ${className}`}>
            {(title || actions) && (
                <header className="mk-section-head">
                    <div className="mk-section-head-text">
                        {title && (
                            titleVariant === 'label'
                                ? <h3 className="mk-section-label">{title}</h3>
                                : <h3 className="mk-section-title">{title}</h3>
                        )}
                        {subtitle && <p className="mk-section-head-sub">{subtitle}</p>}
                    </div>
                    {actions && <div className="mk-section-head-actions min-w-0 max-w-full">{actions}</div>}
                </header>
            )}
            {children}
        </section>
    );
}
