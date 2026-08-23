import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Mój panel — Savori',
    description: 'Personalizowany dashboard makro — układaj kafle z danych GUS, NBP i GPW.',
};

export default function PanelLayout({ children }: { children: ReactNode }) {
    return children;
}
