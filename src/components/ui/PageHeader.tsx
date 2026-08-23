import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    actions?: ReactNode;
    compact?: boolean;
}

/** Wspólny nagłówek strony — tytuł i opcjonalne akcje po prawej. */
export function PageHeader({ title, actions, compact }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
                <h1 className={`font-extrabold tracking-tight text-mk-text ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>{title}</h1>
            </div>
            {actions && <div className="min-w-0 max-w-full basis-full sm:basis-auto">{actions}</div>}
        </header>
    );
}
