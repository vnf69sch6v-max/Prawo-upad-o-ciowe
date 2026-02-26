'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, BarChart3, Percent, Ship } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/fx', label: 'Kursy', icon: ArrowLeftRight },
    { href: '/market', label: 'GPW', icon: TrendingUp },
    { href: '/macro', label: 'Makro', icon: BarChart3 },
    { href: '/rates', label: 'Stopy', icon: Percent },
    { href: '/trade', label: 'Handel', icon: Ship },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-16 lg:w-52 bg-bb-surface border-r border-bb-border z-50 flex-col">
                {/* Logo */}
                <div className="h-12 flex items-center px-3 lg:px-4 border-b border-bb-border">
                    <div className="w-8 h-8 rounded bg-bb-accent flex items-center justify-center">
                        <span className="text-white font-bold text-sm font-mono">PL</span>
                    </div>
                    <span className="hidden lg:block ml-3 font-semibold text-sm text-bb-text truncate">
                        Poland Eco
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                    ? 'bg-bb-accent/10 text-bb-accent border border-bb-accent/20'
                                    : 'text-bb-muted hover:text-bb-text hover:bg-bb-border/50'
                                    }`}
                            >
                                <item.icon size={18} className="shrink-0" />
                                <span className="hidden lg:block truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-3 border-t border-bb-border">
                    <div className="flex items-center gap-2">
                        <span className="live-dot" />
                        <span className="hidden lg:block text-xs text-bb-muted">Live</span>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bb-surface border-t border-bb-border z-50 safe-area-bottom">
                <div className="flex justify-around items-center h-14 px-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[48px] transition-colors ${isActive
                                    ? 'text-bb-accent'
                                    : 'text-bb-muted'
                                    }`}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className="text-[9px] leading-tight font-medium truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
