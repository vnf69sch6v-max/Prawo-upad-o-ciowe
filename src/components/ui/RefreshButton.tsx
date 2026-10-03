'use client';

import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
    onClick: () => void;
    loading?: boolean;
    label?: string;
}

/** Ręczne odświeżenie danych u źródła (`?refresh=1` po stronie API). */
export function RefreshButton({ onClick, loading = false, label = 'Aktualizuj' }: RefreshButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            aria-busy={loading}
            className="mk-press inline-flex items-center gap-1.5 rounded-lg border border-mk-border px-2.5 py-1.5 text-xs font-medium text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text active:bg-mk-surface-alt disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:min-h-11 pointer-coarse:px-3.5 pointer-coarse:text-sm"
        >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden />
            {label}
        </button>
    );
}
