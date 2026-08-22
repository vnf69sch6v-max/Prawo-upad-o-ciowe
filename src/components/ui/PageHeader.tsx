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
}

/** Wspólny nagłówek strony w stylu mockupu — breadcrumb, tytuł, podtytuł, akcje po prawej. */
export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
                {eyebrow && <p className="mk-page-eyebrow">{eyebrow}</p>}
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-mk-text sm:text-4xl">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm text-mk-muted">{subtitle}</p>}
            </div>
            {actions}
        </header>
    );
}
