'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, BookOpen, FileText, Bot, Trophy } from 'lucide-react';

interface MobileNavProps {
    currentView?: string;
    onNavigate?: (view: string) => void;
}

const TABS = [
    { id: 'dashboard', href: '/dashboard', label: 'Start', icon: LayoutDashboard },
    { id: 'flashcards', href: '/flashcards', label: 'Fiszki', icon: BookOpen },
    { id: 'exam', href: '/exam', label: 'Egzamin', icon: FileText },
    { id: 'ai', href: '/ai', label: 'AI', icon: Bot },
    { id: 'leaderboard', href: '/leaderboard', label: 'Ranking', icon: Trophy },
];

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
    const pathname = usePathname();

    // Determine active tab from pathname
    const activeTab = TABS.find(tab => pathname?.startsWith(tab.href))?.id || currentView || 'dashboard';

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/98 backdrop-blur-xl border-t border-[var(--border-color)] lg:hidden z-50 safe-area-bottom">
            <div className="flex items-center justify-around h-[72px] px-1">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            onClick={() => onNavigate?.(tab.id)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1.5 py-2 px-4 rounded-xl transition-all min-w-[64px] active:scale-95',
                                isActive
                                    ? 'text-[#1a365d] bg-[#1a365d]/10'
                                    : 'text-[var(--text-muted)]'
                            )}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    'transition-all',
                                    isActive && 'text-[#1a365d]'
                                )}
                            />
                            <span className={cn(
                                "text-[11px] font-medium transition-colors",
                                isActive ? 'text-[#1a365d]' : 'text-[var(--text-muted)]'
                            )}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
