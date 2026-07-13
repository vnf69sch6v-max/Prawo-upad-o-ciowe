'use client';

import Link from 'next/link';
import { Search, Bell, BarChart3 } from 'lucide-react';
import { TopNav } from './TopNav';
import { UserMenu } from './UserMenu';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-mk-border bg-mk-surface">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6">
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mk-primary text-white shadow-sm">
                        <BarChart3 size={20} strokeWidth={2.4} />
                    </span>
                    <span className="hidden text-[17px] font-bold tracking-tight text-mk-text sm:block">
                        Makro Data <span className="text-mk-primary">Platform</span>
                    </span>
                </Link>

                <TopNav className="ml-3 hidden xl:flex" />

                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        onClick={() => window.dispatchEvent(new Event('mk:palette'))}
                        className="group hidden h-[38px] items-center gap-2 rounded-lg border border-mk-border bg-mk-surface-alt px-3 text-mk-faint transition-colors hover:border-mk-primary/40 hover:text-mk-muted md:flex"
                        style={{ width: 220 }}
                        aria-label="Szukaj (⌘K)"
                    >
                        <Search size={16} className="shrink-0" />
                        <span className="flex-1 text-left text-sm">Szukaj wskaźnika…</span>
                        <kbd className="shrink-0 rounded border border-mk-border bg-mk-surface px-1.5 py-0.5 text-[11px] font-medium tracking-wide">⌘K</kbd>
                    </button>
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text" aria-label="Powiadomienia">
                        <Bell size={18} />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mk-negative ring-2 ring-white" />
                    </button>
                    <UserMenu />
                </div>
            </div>

            {/* Mobile / tablet nav row */}
            <div className="xl:hidden">
                <TopNav className="max-w-full overflow-x-auto px-3 pb-2" />
            </div>
        </header>
    );
}
