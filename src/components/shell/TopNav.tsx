'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { scrollChildInline } from '@/lib/tab-scroll';
import { LayoutDashboard, Tag, Factory, Users, TrendingUp, Map, Newspaper, FileBarChart2, type LucideIcon } from 'lucide-react';

/** `hint` — jedno zdanie o zawartości sekcji; pokazywane pod nazwą w arkuszu „Więcej” na telefonie. */
export interface NavItem { label: string; href: string; icon: LucideIcon; hint?: string }

export const NAV_ITEMS: NavItem[] = [
    { label: 'Przegląd', href: '/', icon: LayoutDashboard, hint: 'Najważniejsze wskaźniki dnia' },
    { label: 'Ceny', href: '/ceny', icon: Tag, hint: 'Inflacja CPI, PPI, nieruchomości' },
    { label: 'Gospodarka', href: '/gospodarka', icon: Factory, hint: 'PKB, koniunktura, finanse publiczne' },
    { label: 'Rynek pracy', href: '/praca', icon: Users, hint: 'Bezrobocie, płace, wakaty' },
    { label: 'Rynki', href: '/rynki', icon: TrendingUp, hint: 'WIG20, waluty, stopy, surowce' },
    { label: 'Newsy', href: '/newsy', icon: Newspaper, hint: 'Wiadomości gospodarcze' },
    { label: 'Regiony', href: '/regiony', icon: Map, hint: 'Województwa: PKB, ludność' },
    { label: 'Parser', href: '/parser', icon: FileBarChart2, hint: 'Liczby ze sprawozdań spółek' },
];

/** Podstrony spoza ścieżki sekcji, które do niej należą (karta spółki WIG20 → Rynki). */
const SECTION_ALIASES: Record<string, string[]> = { '/rynki': ['/spolki'] };

export function isActive(pathname: string, href: string): boolean {
    const match = (h: string) => (h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(`${h}/`));
    return match(href) || (SECTION_ALIASES[href] ?? []).some(match);
}

/** Rząd zakładek nagłówka: inline od `xl`, osobny rząd w przedziale `lg`–`xl`. Poniżej `lg` nawigację
 *  przejmuje dolny pasek (MobileTabBar). */
export function TopNav({ className = '' }: { className?: string }) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const nav = navRef.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
        if (nav && active) scrollChildInline(nav, active);
    }, [pathname]);

    return (
        <nav ref={navRef} aria-label="Sekcje serwisu" className={`flex items-center gap-1 ${className}`}>
            {NAV_ITEMS.map((it) => {
                const Icon = it.icon;
                const active = isActive(pathname, it.href);
                return (
                    <Link key={it.href} href={it.href} className={`mk-tab ${active ? 'mk-tab-active' : ''}`} aria-current={active ? 'page' : undefined}>
                        <Icon size={16} strokeWidth={2} aria-hidden />
                        <span>{it.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
