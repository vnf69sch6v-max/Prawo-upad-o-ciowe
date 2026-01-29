'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    ChevronLeft, ChevronRight, ChevronDown, Crown, Sparkles,
    LayoutDashboard, Trophy, BookOpen, Brain, Target, BarChart3,
    LineChart, Zap, FileText, Search, Calendar, Scale, Settings
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: 'pro' | 'new';
}

interface NavSection {
    title: string;
    id: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Przegląd',
        id: 'przeglad',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
            { id: 'leaderboard', label: 'Ranking', icon: <Trophy size={18} />, href: '/leaderboard' },
        ],
    },
    {
        title: 'Ścieżki nauki',
        id: 'sciezki',
        items: [
            { id: 'student-prawa', label: 'Student prawa', icon: <BookOpen size={18} />, href: '/student-prawa' },
            { id: 'egzamin-maklerski', label: 'Egzamin na maklera', icon: <LineChart size={18} />, href: '/egzamin-maklerski', badge: 'new' },
            { id: 'egzamin-aso', label: 'Egzamin na ASO', icon: <BarChart3 size={18} />, href: '/egzamin-aso' },
        ],
    },
    {
        title: 'Narzędzia',
        id: 'narzedzia',
        items: [
            { id: 'immersive-study', label: 'Tryb Immersyjny', icon: <Sparkles size={18} />, href: '/immersive-study', badge: 'new' },
            { id: 'flashcards', label: 'Fiszki', icon: <Zap size={18} />, href: '/flashcards' },
            { id: 'exam', label: 'Symulacje', icon: <FileText size={18} />, href: '/exam' },
            { id: 'search', label: 'Wyszukiwarka', icon: <Search size={18} />, href: '/search', badge: 'new' },
            { id: 'weak-points', label: 'Słabe punkty', icon: <Target size={18} />, href: '/weak-points' },
        ],
    },
    {
        title: 'Praktyka',
        id: 'praktyka',
        items: [
            { id: 'cases', label: 'Kazusy', icon: <Scale size={18} />, href: '/cases', badge: 'new' },
            { id: 'deadlines', label: 'Terminy', icon: <Calendar size={18} />, href: '/deadlines', badge: 'new' },
        ],
    },
    {
        title: 'AI Tools',
        id: 'ai-tools',
        items: [
            { id: 'ai', label: 'Asystent AI', icon: <Brain size={18} />, href: '/ai' },
        ],
    },
];

// Default expanded sections
const DEFAULT_EXPANDED = ['przeglad', 'sciezki', 'narzedzia'];

interface SidebarProps {
    currentView?: string;
    onNavigate?: (view: string) => void;
    isCollapsed: boolean;
    onToggle: () => void;
    userStats?: {
        streak: number;
        knowledgeEquity: number;
    };
}

export function Sidebar({
    isCollapsed,
    onToggle,
    userStats,
}: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>(DEFAULT_EXPANDED);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-expanded');
        if (saved) {
            setExpandedSections(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newState = prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId];
            localStorage.setItem('sidebar-expanded', JSON.stringify(newState));
            return newState;
        });
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-300 ease-in-out',
                isCollapsed ? 'w-[72px]' : 'w-[260px]'
            )}
        >
            {/* Logo */}
            <div className="p-4 border-b border-[var(--border-color)]">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-gold)] to-amber-500 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 text-[#1a1a1a] shadow-lg shadow-amber-500/20">
                        S
                    </div>
                    {!isCollapsed && (
                        <div className="animate-subtle">
                            <h1 className="font-serif font-bold text-lg tracking-tight">Savori Legal</h1>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-5 px-3">
                {NAV_SECTIONS.map((section, sectionIndex) => {
                    const isExpanded = expandedSections.includes(section.id);
                    return (
                        <div key={section.id} className={cn(sectionIndex > 0 && 'mt-5')}>
                            {!isCollapsed ? (
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-2 mb-2 flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--accent-gold)] transition-colors"
                                >
                                    {section.title}
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            'transition-transform duration-200',
                                            isExpanded ? 'rotate-0' : '-rotate-90'
                                        )}
                                    />
                                </button>
                            ) : (
                                <div className="mb-2 mx-auto w-6 h-px bg-[var(--border-color)]" />
                            )}
                            <div
                                className={cn(
                                    'space-y-1 overflow-hidden transition-all duration-200',
                                    !isCollapsed && !isExpanded && 'max-h-0 opacity-0',
                                    (!isCollapsed && isExpanded) || isCollapsed ? 'max-h-[500px] opacity-100' : ''
                                )}
                            >
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                                active
                                                    ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] shadow-sm'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                                                isCollapsed && 'justify-center px-2'
                                            )}
                                            title={isCollapsed ? item.label : undefined}
                                        >
                                            <span className={cn(
                                                'flex items-center justify-center w-6 h-6 transition-colors',
                                                active && 'text-[var(--accent-gold)]'
                                            )}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                    {item.badge === 'pro' && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-purple-500/15 text-purple-400 rounded-full">
                                                            <Crown size={10} />
                                                        </span>
                                                    )}
                                                    {item.badge === 'new' && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 rounded-full">
                                                            NEW
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* User Stats Section */}
            {!isCollapsed && userStats && (
                <div className="p-4 border-t border-[var(--border-color)]">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-xl hover:bg-[var(--bg-hover)] border border-[var(--border-color)] hover:border-[var(--accent-gold)]/30 transition-all"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-gold)] to-amber-500 rounded-xl flex items-center justify-center text-sm font-bold text-[#1a1a1a]">
                            <Settings size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Ustawienia</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                                <span className="flex items-center gap-1">
                                    <span className="text-orange-400">🔥</span>
                                    <span className="font-medium">{userStats.streak}</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                                <span className="flex items-center gap-1">
                                    <span className="text-emerald-400 font-medium">
                                        {userStats.knowledgeEquity.toLocaleString()} pkt
                                    </span>
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Collapsed Stats */}
            {isCollapsed && userStats && (
                <div className="p-3 border-t border-[var(--border-color)]">
                    <Link
                        href="/settings"
                        className="flex items-center justify-center w-full p-2 bg-[var(--bg-card)] rounded-xl hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-all"
                        title="Ustawienia"
                    >
                        <Settings size={18} className="text-[var(--text-muted)]" />
                    </Link>
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="p-4 border-t border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
