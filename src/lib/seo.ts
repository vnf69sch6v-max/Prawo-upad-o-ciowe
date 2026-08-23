import type { Metadata } from 'next';

/** Tytuł, description i Open Graph dla zakładek (layout.tsx — strony są client components). */
export function pageMeta(title: string, description: string): Metadata {
    const fullTitle = `${title} — Savori`;
    return {
        title: fullTitle,
        description,
        openGraph: {
            title: fullTitle,
            description,
            locale: 'pl_PL',
            type: 'website',
        },
    };
}
