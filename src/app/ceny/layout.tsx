import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Ceny',
    'Inflacja CPI, PPI, ceny mieszkań, robót budowlanych i skupu rolnego — odczyty GUS aktualizowane na bieżąco.',
);

export default function CenyLayout({ children }: { children: ReactNode }) {
    return children;
}
