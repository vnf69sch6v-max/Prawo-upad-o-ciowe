'use client';

import type { ReactNode } from 'react';

/** Ciasny układ strony tematycznej — mniejsze odstępy pionowe, mniej scrollowania. */
export function DensePageLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`mk-dense-page mk-fade-in ${className}`.trim()}>{children}</div>;
}

/** Układ dwukolumnowy — newsy + wykres (Rynki i sekcje tematyczne). */
export function DenseTwoCol({
    left,
    right,
    className = '',
}: {
    left: ReactNode;
    right: ReactNode;
    className?: string;
}) {
    return (
        <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${className}`}>
            <div className="min-w-0">{left}</div>
            <div className="min-w-0">{right}</div>
        </div>
    );
}

/** Trzy kolumny: newsy | wykresy | panel boczny (mockup Gospodarka / Praca). */
export function DenseThreeCol({
    left,
    center,
    right,
    className = '',
}: {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
    className?: string;
}) {
    return (
        <div className={`grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start ${className}`}>
            <div className="min-w-0 lg:col-span-3">{left}</div>
            <div className="min-w-0 space-y-4 lg:col-span-5">{center}</div>
            <div className="min-w-0 space-y-4 lg:col-span-4">{right}</div>
        </div>
    );
}
