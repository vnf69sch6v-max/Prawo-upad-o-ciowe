import type { ReactNode } from 'react';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta(
    'Newsy',
    'Agregator wiadomości makro, giełdowych i walutowych z polskich źródeł RSS.',
);

export default function NewsyLayout({ children }: { children: ReactNode }) {
    return children;
}
