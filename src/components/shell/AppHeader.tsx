'use client';

import Link from 'next/link';
import { Search, CalendarClock, BarChart3 } from 'lucide-react';
import { rememberOpener } from '@/lib/use-focus-trap';
import { useHideOnScroll } from '@/lib/use-hide-on-scroll';
import { TopNav } from './TopNav';
import { UserMenu } from './UserMenu';

const ICON_BTN =
    'flex h-11 w-11 items-center justify-center rounded-xl text-mk-muted transition-colors duration-100 hover:bg-mk-surface-alt hover:text-mk-text active:bg-mk-border lg:h-9 lg:w-9 lg:rounded-lg';

export function AppHeader() {
    // Poniżej `lg` nagłówek to jeden rząd (logo, szukaj, kalendarz, konto) — sekcje są w dolnym pasku
    // (MobileTabBar). Chowa się przy przewijaniu w dół i wraca przy ruchu w górę; fokus klawiatury
    // w środku zawsze go pokazuje. Od `lg` zostaje stały — tam przyklejone panele (`lg:top-20`) liczą
    // na jego obecność. W przedziale `lg`–`xl` sekcje są drugim rzędem, od `xl` w jednym rzędzie.
    // `env(safe-area-inset-*)`: w zainstalowanej aplikacji / poziomo na iPhonie treść nie wchodzi
    // pod notch (viewport-fit=cover w layout.tsx).
    const hidden = useHideOnScroll();
    const openPalette = (el: HTMLElement) => {
        rememberOpener(el);
        window.dispatchEvent(new Event('mk:palette'));
    };
    return (
        <header
            className={`mk-shell-header sticky top-0 z-40 border-b border-mk-border bg-mk-surface pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] [-webkit-tap-highlight-color:transparent] transition-transform duration-200 ease-out focus-within:translate-y-0 motion-reduce:transition-none print:static ${hidden ? 'max-lg:-translate-y-full' : ''}`}
        >
            <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-4 md:px-6 lg:h-16 lg:gap-3">
                <Link href="/" aria-label="Savori — strona główna" className="-ml-1 flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-1 active:opacity-70">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mk-brand text-white shadow-sm">
                        <BarChart3 size={20} strokeWidth={2.4} aria-hidden />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight text-mk-text lg:text-[19px]">Savori</span>
                </Link>

                <TopNav className="ml-3 hidden xl:flex" />

                <div className="ml-auto flex items-center gap-0.5 lg:gap-1.5">
                    <button
                        type="button"
                        onClick={(e) => openPalette(e.currentTarget)}
                        className="group hidden h-[38px] w-[220px] items-center gap-2 rounded-lg border border-mk-border bg-mk-surface-alt px-3 text-mk-faint transition-colors hover:border-mk-primary/40 hover:text-mk-muted md:flex"
                        aria-label="Szukaj (⌘K)"
                    >
                        <Search size={16} className="shrink-0" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-left text-sm">Szukaj wskaźnika…</span>
                        <kbd className="shrink-0 rounded border border-mk-border bg-mk-surface px-1.5 py-0.5 text-[11px] font-medium tracking-wide">⌘K</kbd>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => openPalette(e.currentTarget)}
                        className={`${ICON_BTN} md:hidden`}
                        aria-label="Szukaj"
                    >
                        <Search size={20} aria-hidden />
                    </button>
                    {/* Był tu dzwonek „powiadomień" z zahardkodowaną czerwoną kropką „masz nieprzeczytane" —
                        bez onClick, bez stanu, bez sposobu zgaszenia. Element obiecywał funkcję, której nie ma;
                        na platformie, której obietnicą jest wiarygodność danych, to najgorszy możliwy detal.
                        Zastąpiony realnym skrótem do kalendarza publikacji (dane, które faktycznie mamy). */}
                    <Link
                        href="/publikacje"
                        className={ICON_BTN}
                        aria-label="Kalendarz publikacji danych"
                        title="Kalendarz publikacji danych"
                    >
                        <CalendarClock size={20} className="lg:size-[18px]" aria-hidden />
                    </Link>
                    <UserMenu />
                </div>
            </div>

            {/* lg–xl: sekcje w drugim rzędzie (od xl są inline, poniżej lg — w dolnym pasku). */}
            <div className="hidden lg:block xl:hidden">
                <TopNav className="mk-navrow max-w-full px-3 pb-2" />
            </div>
        </header>
    );
}
