'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { scrollChildInline } from '@/lib/tab-scroll';
import { LayoutDashboard, Tag, Factory, Users, TrendingUp, Map, Newspaper, FileBarChart2, type LucideIcon } from 'lucide-react';

export interface NavItem { label: string; href: string; icon: LucideIcon }

export const NAV_ITEMS: NavItem[] = [
    { label: 'Przegląd', href: '/', icon: LayoutDashboard },
    { label: 'Ceny', href: '/ceny', icon: Tag },
    { label: 'Gospodarka', href: '/gospodarka', icon: Factory },
    { label: 'Rynek pracy', href: '/praca', icon: Users },
    { label: 'Rynki', href: '/rynki', icon: TrendingUp },
    { label: 'Newsy', href: '/newsy', icon: Newspaper },
    { label: 'Regiony', href: '/regiony', icon: Map },
    { label: 'Parser', href: '/parser', icon: FileBarChart2 },
];

export function isActive(pathname: string, href: string): boolean {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav({ className = '' }: { className?: string }) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const nav = navRef.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
        if (nav && active) scrollChildInline(nav, active);
    }, [pathname]);

    return (
        <nav ref={navRef} className={`flex items-center gap-1 ${className}`}>
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
