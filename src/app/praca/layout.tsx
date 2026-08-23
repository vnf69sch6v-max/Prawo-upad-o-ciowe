import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Rynek pracy',
    'Bezrobocie rejestrowane, płace i zatrudnienie w Polsce — wyłącznie źródła GUS, mapa województw.',
);

export default function PracaLayout({ children }: { children: ReactNode }) {
    return children;
}
