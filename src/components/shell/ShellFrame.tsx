'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { CommandPalette } from './CommandPalette';
import { MobileTabBar } from './MobileTabBar';

/** Routes that render without the app chrome (header/nav/footer). */
const BARE_ROUTES = ['/login'];

export function ShellFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

    if (bare) return <>{children}</>;

    // Boczne odstępy treści = max(zwykły padding, safe area) — przy viewport-fit=cover iPhone poziomo
    // nie chowa treści pod notchem. Dolny odstęp nad paskiem zakładek daje stopka (--mk-bottom-chrome).
    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-[max(1rem,env(safe-area-inset-left))] py-6 md:px-[max(1.5rem,env(safe-area-inset-left))] md:py-8">{children}</main>
            <AppFooter />
            <MobileTabBar />
            <CommandPalette />
        </div>
    );
}
