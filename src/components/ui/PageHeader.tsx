import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    actions?: ReactNode;
    compact?: boolean;
}

/**
 * Wspólny nagłówek strony — tytuł i opcjonalne akcje po prawej.
 * Telefon: tytuł 26 px (compact 24 px) — 30 px zajmowało pół szerokości przy dłuższych nazwach;
 * akcje schodzą do własnego rzędu (`basis-full`), więc nigdy nie ściskają tytułu.
 */
export function PageHeader({ title, actions, compact }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
            <div className="min-w-0">
                <h1 className={`break-words font-extrabold leading-tight tracking-tight text-mk-text ${compact ? 'text-2xl sm:text-3xl' : 'text-[26px] sm:text-4xl'}`}>{title}</h1>
            </div>
            {actions && <div className="min-w-0 max-w-full basis-full sm:basis-auto">{actions}</div>}
        </header>
    );
}
