'use client';

import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

export function ChartSkeleton({ height = 280 }: { height?: number }) {
    return (
        <div
            className="mk-skeleton w-full rounded-xl"
            style={{ height }}
            role="status"
            aria-busy="true"
            aria-label="Ładowanie danych"
        />
    );
}

export function QueryError({
    title = 'Nie udało się pobrać danych',
    detail = 'Źródło nie odpowiedziało. To nie znaczy, że wskaźnik wynosi zero.',
    onRetry,
    height,
}: {
    title?: string;
    detail?: string;
    onRetry?: () => void;
    height?: number;
}) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-mk-surface-alt px-4 py-8 text-center"
            style={height ? { minHeight: height } : undefined}
            role="alert"
        >
            <p className="text-sm font-medium text-mk-text">{title}</p>
            <p className="max-w-[42ch] text-xs text-mk-muted">{detail}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-1 inline-flex min-h-6 items-center gap-1.5 rounded-lg border border-mk-border bg-mk-surface px-2.5 py-1.5 text-xs font-medium text-mk-text transition-colors hover:bg-mk-surface-alt"
                >
                    <RefreshCw size={13} aria-hidden />
                    Spróbuj ponownie
                </button>
            )}
        </div>
    );
}

export function QueryEmpty({
    title = 'Brak danych',
    detail,
    height,
}: {
    title?: string;
    detail?: string;
    height?: number;
}) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-mk-surface-alt px-4 py-8 text-center"
            style={height ? { minHeight: height } : undefined}
        >
            <p className="text-sm font-medium text-mk-text">{title}</p>
            {detail && <p className="max-w-[42ch] text-xs text-mk-muted">{detail}</p>}
        </div>
    );
}

/**
 * Trzy stany zapytania — loading / error / empty — zamiast kłamliwego
 * `length === 0 ? "Brak danych"` (które pokazuje pustkę także w trakcie ładowania i po awarii).
 */
export function QueryState({
    isLoading,
    isError,
    isEmpty,
    onRetry,
    skeleton,
    emptyTitle = 'Brak danych',
    emptyDetail,
    errorTitle,
    errorDetail,
    height,
    children,
}: {
    isLoading?: boolean;
    isError?: boolean;
    isEmpty?: boolean;
    onRetry?: () => void;
    skeleton?: ReactNode;
    emptyTitle?: string;
    emptyDetail?: string;
    errorTitle?: string;
    errorDetail?: string;
    height?: number;
    children?: ReactNode;
}) {
    if (isLoading) {
        return <>{skeleton ?? <ChartSkeleton height={height ?? 280} />}</>;
    }
    if (isError) {
        return <QueryError title={errorTitle} detail={errorDetail} onRetry={onRetry} height={height} />;
    }
    if (isEmpty) {
        return <QueryEmpty title={emptyTitle} detail={emptyDetail} height={height} />;
    }
    return <>{children}</>;
}
