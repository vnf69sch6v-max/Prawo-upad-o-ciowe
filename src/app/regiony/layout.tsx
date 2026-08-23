import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Regiony',
    'PKB na mieszkańca i ludność województw — zróżnicowanie regionalne według GUS BDL.',
);

export default function RegionyLayout({ children }: { children: ReactNode }) {
    return children;
}
