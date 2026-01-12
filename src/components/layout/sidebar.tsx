'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight, ChevronDown, Crown, Sparkles, LayoutDashboard, Trophy, BookOpen, Brain, Target, BarChart3, Clock, LineChart, Zap, Users, MessageSquare, FileText } from 'lucide-react';

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
        title: 'Nauka',
        id: 'nauka',
        items: [
            { id: 'flashcards', label: 'Fiszki', icon: <BookOpen size={18} />, href: '/flashcards' },
            { id: 'study', label: 'Nauka', icon: <Brain size={18} />, href: '/study' },
        ],
    },
    {
        title: 'Egzaminy',
        id: 'egzaminy',
        items: [
            { id: 'exam', label: 'Symulacje', icon: <FileText size={18} />, href: '/exam' },
            { id: 'results', label: 'Wyniki', icon: <BarChart3 size={18} />, href: '/exam/results' },
        ],
    },
    {
        title: 'Analityka',
        id: 'analityka',
        items: [
            { id: 'analytics', label: 'Statystyki', icon: <LineChart size={18} />, href: '/analytics', badge: 'pro' },
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
const DEFAULT_EXPANDED = ['przeglad', 'nauka', 'egzaminy'];

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
                'hidden lg:flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="p-4 border-b border-[var(--border-color)]">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1a365d] rounded-xl flex items-center justify-center font-bold text-lg shrink-0 text-white">
                        S
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in">
                            <h1 className="font-serif font-bold text-lg">Savori Legal</h1>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                {NAV_SECTIONS.map((section) => {
                    const isExpanded = expandedSections.includes(section.id);
                    return (
                        <div key={section.id} className="mb-2">
                            {!isCollapsed ? (
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-4 mb-1 flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hover:text-[#1a365d] transition-colors"
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
                            ) : null}
                            <div
                                className={cn(
                                    'space-y-1 px-2 overflow-hidden transition-all duration-200',
                                    !isCollapsed && !isExpanded && 'max-h-0 opacity-0',
                                    (!isCollapsed && isExpanded) || isCollapsed ? 'max-h-96 opacity-100' : ''
                                )}
                            >
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                                active
                                                    ? 'bg-[#1a365d]/10 text-[#1a365d] border border-[#1a365d]/30'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[#1a365d]',
                                                isCollapsed && 'justify-center px-2'
                                            )}
                                            title={isCollapsed ? item.label : undefined}
                                        >
                                            {item.icon}
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                    {item.badge === 'pro' && (
                                                        <span className="badge badge-pro text-[9px] py-0.5">
                                                            <Crown size={10} />
                                                        </span>
                                                    )}
                                                    {item.badge === 'new' && (
                                                        <span className="badge badge-new text-[9px] py-0.5">NEW</span>
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

            {!isCollapsed && userStats && (
                <div className="p-4 border-t border-[var(--border-color)]">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-xl hover:bg-[#1a365d]/10 hover:border-[#1a365d]/50 border border-transparent transition-all"
                    >
                        <div className="w-10 h-10 bg-[#1a365d] rounded-full flex items-center justify-center text-lg font-bold text-white">
                            👤
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Mój Profil</p>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <span className="text-[#b8860b]">🔥 {userStats.streak}</span>
                                <span>•</span>
                                <span className="text-[#059669]">
                                    €{userStats.knowledgeEquity.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="p-3 border-t border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
