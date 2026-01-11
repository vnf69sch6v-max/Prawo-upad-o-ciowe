'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    Home, BookOpen, FileText, Sparkles, Trophy,
    Settings, Plus, Menu, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    href: string;
    badge?: string | number;
}

interface EnhancedMobileNavProps {
    onQuickAdd?: () => void;
}

// ============================================
// NAVIGATION ITEMS
// ============================================

const NAV_ITEMS: NavItem[] = [
    {
        id: 'home',
        label: 'Home',
        icon: <Home size={22} />,
        href: '/'
    },
    {
        id: 'study',
        label: 'Nauka',
        icon: <BookOpen size={22} />,
        href: '/study',
        badge: 45 // Due cards
    },
    {
        id: 'add',
        label: 'Dodaj',
        icon: <Plus size={24} />,
        href: '#quick-add'
    },
    {
        id: 'exam',
        label: 'Egzaminy',
        icon: <FileText size={22} />,
        href: '/exam'
    },
    {
        id: 'ai',
        label: 'AI',
        icon: <Sparkles size={22} />,
        href: '/ai'
    },
];

// ============================================
// QUICK ADD MENU
// ============================================

function QuickAddMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const quickActions = [
        { icon: <BookOpen size={20} />, label: 'Nowa fiszka', href: '/flashcards/new', color: 'purple' },
        { icon: <FileText size={20} />, label: 'Quick Quiz', href: '/exam/quick', color: 'blue' },
        { icon: <Sparkles size={20} />, label: 'Generuj z AI', href: '/ai', color: 'pink' },
        { icon: <Trophy size={20} />, label: 'Ranking', href: '/leaderboard', color: 'yellow' },
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-2 shadow-2xl">
                    <div className="grid grid-cols-4 gap-2">
                        {quickActions.map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                onClick={onClose}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                                    'hover:bg-[var(--bg-hover)]'
                                )}
                            >
                                <div className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                    action.color === 'purple' && 'bg-#1a365d/20 text-#1a365d',
                                    action.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                                    action.color === 'pink' && 'bg-#b8860b/20 text-#b8860b',
                                    action.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400'
                                )}>
                                    {action.icon}
                                </div>
                                <span className="text-xs font-medium">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedMobileNav({ onQuickAdd }: EnhancedMobileNavProps) {
    const pathname = usePathname();
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [hideOnScroll, setHideOnScroll] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setHideOnScroll(true);
            } else {
                setHideOnScroll(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
        if (item.id === 'add') {
            e.preventDefault();
            setShowQuickAdd(!showQuickAdd);
        }
    };

    return (
        <>
            <QuickAddMenu isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />

            <nav className={cn(
                'fixed bottom-0 left-0 right-0 z-30 lg:hidden transition-transform duration-300',
                hideOnScroll && 'translate-y-full'
            )}>
                {/* Glass effect background */}
                <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-lg border-t border-[var(--border-color)]" />

                {/* Safe area padding for notched devices */}
                <div className="relative px-2 pb-safe">
                    <div className="flex items-center justify-around py-2">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            const isAddButton = item.id === 'add';

                            if (isAddButton) {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={(e) => handleNavClick(item, e as React.MouseEvent)}
                                        className={cn(
                                            'relative -mt-6 w-14 h-14 rounded-full flex items-center justify-center transition-all',
                                            showQuickAdd
                                                ? 'bg-red-500 rotate-45'
                                                : 'bg-gradient-to-br from-#1a365d to-pink-600 shadow-lg shadow-#1a365d/30'
                                        )}
                                    >
                                        <Plus size={24} className="text-white" />
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(item, e as React.MouseEvent)}
                                    className={cn(
                                        'relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all',
                                        active
                                            ? 'text-#1a365d'
                                            : 'text-[var(--text-muted)] hover:text-white'
                                    )}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-#1a365d rounded-full" />
                                    )}

                                    {/* Icon with badge */}
                                    <div className="relative">
                                        {item.icon}
                                        {item.badge && (
                                            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={cn(
                                        'text-[10px] font-medium',
                                        active ? 'text-#1a365d' : ''
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}
