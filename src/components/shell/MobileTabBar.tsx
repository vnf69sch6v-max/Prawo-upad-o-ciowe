'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { isActive } from './TopNav';
import { TAB_ITEMS, isMoreActive } from './mobile-nav';
import { MoreSheet } from './MoreSheet';

const ITEM =
    'group flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-mk-muted transition-colors duration-100 active:text-mk-text aria-[current=page]:text-mk-brand data-[on=true]:text-mk-brand focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-mk-primary';
const PILL =
    'flex h-7 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-150 group-active:scale-90 group-active:bg-mk-surface-alt group-aria-[current=page]:bg-mk-brand-soft group-data-[on=true]:bg-mk-brand-soft motion-reduce:transition-none motion-reduce:group-active:scale-100';
const LABEL =
    'max-w-full truncate px-0.5 text-[11px] font-medium leading-[14px] group-aria-[current=page]:font-semibold group-data-[on=true]:font-semibold min-[360px]:text-xs';

/**
 * Dolny pasek zakładek poniżej `lg` — główna nawigacja w strefie kciuka, zawsze widoczny
 * (nie chowa się przy scrollu, w przeciwieństwie do nagłówka). Wysokość `--mk-tabbar-h` + safe area;
 * stopka rezerwuje to miejsce przez `--mk-bottom-chrome`, więc nic nie ląduje pod paskiem.
 */
export function MobileTabBar() {
    const pathname = usePathname();
    // Arkusz jest otwarty tylko na ścieżce, na której go otwarto — nawigacja (też „wstecz”) zamyka go sama.
    const [sheetOn, setSheetOn] = useState<string | null>(null);
    const sheetOpen = sheetOn === pathname;
    const moreRef = useRef<HTMLButtonElement>(null);
    const moreOn = sheetOpen || isMoreActive(pathname);

    useEffect(() => {
        // Obrót / poszerzenie okna do `lg` chowa pasek — arkusz nie może zostać osierocony.
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => { if (mq.matches) setSheetOn(null); };
        // Paleta otwarta skądkolwiek (⌘K, nagłówek) przykrywa arkusz — zamknij go.
        const onPalette = () => setSheetOn(null);
        mq.addEventListener('change', onChange);
        window.addEventListener('mk:palette', onPalette);
        return () => {
            mq.removeEventListener('change', onChange);
            window.removeEventListener('mk:palette', onPalette);
        };
    }, []);

    // Tapnięcie aktywnej zakładki na jej stronie głównej = przewiń na górę (jak w aplikacjach iOS/Android).
    const onTabClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
        setSheetOn(null);
        if (window.location.pathname !== href || window.location.search) return;
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };

    return (
        <>
            <nav
                aria-label="Nawigacja główna"
                className="mk-tabbar fixed inset-x-0 bottom-0 z-40 select-none border-t border-mk-border bg-mk-surface/95 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur-xl backdrop-saturate-150 [-webkit-tap-highlight-color:transparent] touch-manipulation lg:hidden print:hidden"
            >
                {/* Komórki `flex-auto`: podstawa = szerokość treści, nadwyżka dzielona po równo. Przy 320 px
                    „Gospodarka” dostaje kilka px więcej niż „Ceny”, zamiast ucięcia etykiety (siatka 5×64 px ucinała). */}
                <ul className="mx-auto flex h-[var(--mk-tabbar-h)] max-w-lg">
                    {TAB_ITEMS.map((it) => {
                        const Icon = it.icon;
                        const active = isActive(pathname, it.href);
                        return (
                            <li key={it.href} className="min-w-0 flex-auto">
                                <Link
                                    href={it.href}
                                    onClick={(e) => onTabClick(e, it.href)}
                                    aria-current={active ? 'page' : undefined}
                                    className={ITEM}
                                >
                                    <span className={PILL}>
                                        <Icon size={22} strokeWidth={active ? 2.3 : 1.9} aria-hidden />
                                    </span>
                                    <span className={LABEL}>{it.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                    <li className="min-w-0 flex-auto">
                        <button
                            ref={moreRef}
                            type="button"
                            onClick={() => setSheetOn((on) => (on === pathname ? null : pathname))}
                            aria-expanded={sheetOpen}
                            aria-controls="mk-more-sheet"
                            data-on={moreOn}
                            className={`${ITEM} w-full`}
                        >
                            <span className={PILL}>
                                <Menu size={22} strokeWidth={moreOn ? 2.3 : 1.9} aria-hidden />
                            </span>
                            <span className={LABEL}>Więcej</span>
                        </button>
                    </li>
                </ul>
            </nav>
            <MoreSheet open={sheetOpen} onClose={() => setSheetOn(null)} returnFocusRef={moreRef} />
        </>
    );
}
