'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'DASH', key: 'F1' },
    { href: '/fx', label: 'FX', key: 'F2' },
    { href: '/market', label: 'GPW', key: 'F3' },
    { href: '/macro', label: 'MAKRO', key: 'F4' },
    { href: '/rates', label: 'STOPY', key: 'F5' },
    { href: '/trade', label: 'TRADE', key: 'F6' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar — Bloomberg keycap style */}
            <aside className="hidden md:flex fixed left-0 top-7 h-[calc(100vh-28px)] w-14 bg-bb-bg border-r border-bb-border z-50 flex-col">
                <nav className="flex-1 py-2 space-y-0.5 px-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-0.5 py-1.5 rounded-sm transition-colors group"
                                title={`${item.key} — ${item.label}`}
                            >
                                <span className={`bb-keycap ${isActive ? 'bb-keycap-active' : 'group-hover:text-bb-text'}`}>
                                    {item.key}
                                </span>
                                <span className={`text-[8px] font-bold tracking-wider ${isActive ? 'text-bb-accent' : 'text-bb-muted group-hover:text-bb-text'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-2 py-2 border-t border-bb-border flex justify-center">
                    <span className="live-dot" />
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bb-bg border-t border-bb-border z-50 safe-area-bottom">
                <div className="flex items-center h-12">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${isActive ? 'bg-bb-accent/10' : ''
                                    }`}
                            >
                                <span className={`bb-keycap text-[9px] ${isActive ? 'bb-keycap-active' : ''}`}>
                                    {item.key}
                                </span>
                                <span className={`text-[7px] font-bold tracking-wider ${isActive ? 'text-bb-accent' : 'text-bb-muted'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
