import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Przegląd — Savori',
    description: 'Kluczowe wskaźniki makroekonomiczne dla Polski.',
};

export default function PanelLayout({ children }: { children: ReactNode }) {
    return children;
}
