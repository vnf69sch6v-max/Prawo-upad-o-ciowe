'use client';

import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, BookOpen, FileText, Bot, Trophy } from 'lucide-react';

interface MobileNavProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flashcards', label: 'Fiszki', icon: BookOpen },
    { id: 'exam', label: 'Egzamin', icon: FileText },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
];

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--border-color)] lg:hidden z-50 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {TABS.map((tab) => {
                    const isActive = currentView === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onNavigate(tab.id)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] relative',
                                isActive
                                    ? 'text-purple-400'
                                    : 'text-[var(--text-muted)] hover:text-white'
                            )}
                        >
                            <Icon size={20} className={cn(isActive && 'scale-110', 'transition-transform')} />
                            <span className="text-[10px] font-medium">{tab.label}</span>
                            {isActive && (
                                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-t" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
