import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Mój panel',
    'Edytowalny pulpit makro — układaj kafle z danych GUS, NBP i GPW.',
);

export default function PanelLayout({ children }: { children: ReactNode }) {
    return children;
}
