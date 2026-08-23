'use client';

import Link from 'next/link';
import { Search, CalendarClock, BarChart3 } from 'lucide-react';
import { rememberOpener } from '@/lib/use-focus-trap';
import { TopNav } from './TopNav';
import { UserMenu } from './UserMenu';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-mk-border bg-mk-surface">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6">
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mk-brand text-white shadow-sm">
                        <BarChart3 size={20} strokeWidth={2.4} />
                    </span>
                    <span className="hidden text-[19px] font-extrabold tracking-tight text-mk-text sm:block">
                        Savori
                    </span>
                </Link>

                <TopNav className="ml-3 hidden xl:flex" />

                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={(e) => { rememberOpener(e.currentTarget); window.dispatchEvent(new Event('mk:palette')); }}
                        className="group hidden h-[38px] items-center gap-2 rounded-lg border border-mk-border bg-mk-surface-alt px-3 text-mk-faint transition-colors hover:border-mk-primary/40 hover:text-mk-muted md:flex"
                        style={{ width: 220 }}
                        aria-label="Szukaj (⌘K)"
                    >
                        <Search size={16} className="shrink-0" />
                        <span className="flex-1 text-left text-sm">Szukaj wskaźnika…</span>
                        <kbd className="shrink-0 rounded border border-mk-border bg-mk-surface px-1.5 py-0.5 text-[11px] font-medium tracking-wide">⌘K</kbd>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { rememberOpener(e.currentTarget); window.dispatchEvent(new Event('mk:palette')); }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text md:hidden"
                        aria-label="Szukaj (paleta poleceń)"
                    >
                        <Search size={18} />
                    </button>
                    {/* Był tu dzwonek „powiadomień" z zahardkodowaną czerwoną kropką „masz nieprzeczytane" —
                        bez onClick, bez stanu, bez sposobu zgaszenia. Element obiecywał funkcję, której nie ma;
                        na platformie, której obietnicą jest wiarygodność danych, to najgorszy możliwy detal.
                        Zastąpiony realnym skrótem do kalendarza publikacji (dane, które faktycznie mamy). */}
                    <Link
                        href="/publikacje"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                        aria-label="Kalendarz publikacji danych"
                        title="Kalendarz publikacji danych"
                    >
                        <CalendarClock size={18} />
                    </Link>
                    <UserMenu />
                </div>
            </div>

            {/* Mobile / tablet nav row */}
            <div className="xl:hidden">
                <TopNav className="mk-navrow max-w-full px-3 pb-2" />
            </div>
        </header>
    );
}
