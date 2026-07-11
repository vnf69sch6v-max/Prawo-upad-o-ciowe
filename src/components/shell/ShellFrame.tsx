'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

/** Routes that render without the app chrome (header/nav/footer). */
const BARE_ROUTES = ['/login'];

export function ShellFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

    if (bare) return <>{children}</>;

    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
            <AppFooter />
        </div>
    );
}
