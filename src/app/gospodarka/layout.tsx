import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Gospodarka',
    'PKB, produkcja, sprzedaż detaliczna, koniunktura i finanse publiczne — dane GUS o polskiej gospodarce.',
);

export default function GospodarkaLayout({ children }: { children: ReactNode }) {
    return children;
}
