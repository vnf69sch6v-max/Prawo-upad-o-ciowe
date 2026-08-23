import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Rynki',
    'WIG20 i spółki GPW, kursy NBP, stopy procentowe i WIBOR — notowania i dane rynkowe na bieżąco.',
);

export default function RynkiLayout({ children }: { children: ReactNode }) {
    return children;
}
