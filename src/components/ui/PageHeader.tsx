import type { ReactNode } from 'react';

/** Breadcrumb „Polska • {sekcja}" — uppercase przez `.mk-page-eyebrow`. */
export function PageEyebrow({ section }: { section: string }) {
    return (
        <>
            Polska <span className="mx-1.5 text-mk-border-strong">•</span> {section}
        </>
    );
}

interface PageHeaderProps {
    /** Breadcrumb / eyebrow nad tytułem, np. „Polska • Dane makro". */
    eyebrow?: ReactNode;
    title: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
    compact?: boolean;
}

/** Wspólny nagłówek strony w stylu mockupu — breadcrumb, tytuł, podtytuł, akcje po prawej. */
export function PageHeader({ eyebrow, title, subtitle, actions, compact }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
                {eyebrow && <p className="mk-page-eyebrow">{eyebrow}</p>}
                <h1 className={`font-extrabold tracking-tight text-mk-text ${compact ? 'mt-0.5 text-2xl sm:text-3xl' : 'mt-1 text-3xl sm:text-4xl'}`}>{title}</h1>
                {subtitle && <p className={`text-sm text-mk-muted ${compact ? 'mt-1' : 'mt-1.5'}`}>{subtitle}</p>}
            </div>
            {actions && <div className="min-w-0 max-w-full basis-full sm:basis-auto">{actions}</div>}
        </header>
    );
}
