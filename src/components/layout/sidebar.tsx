'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight, Crown, Sparkles, LayoutDashboard, Trophy, BookOpen, Brain, Target, BarChart3, Clock, LineChart, Zap, Users, MessageSquare, FileText } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: 'pro' | 'new';
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Przegląd',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/' },
            { id: 'leaderboard', label: 'Ranking', icon: <Trophy size={18} />, href: '/leaderboard' },
        ],
    },
    {
        title: 'Nauka',
        items: [
            { id: 'flashcards', label: 'Fiszki', icon: <BookOpen size={18} />, href: '/flashcards' },
            { id: 'study', label: 'Nauka', icon: <Brain size={18} />, href: '/study' },
            { id: 'weakareas', label: 'Słabe punkty', icon: <Target size={18} />, href: '/analytics', badge: 'pro' },
            { id: 'customdecks', label: 'Własne talie', icon: <Sparkles size={18} />, href: '/flashcards' },
        ],
    },
    {
        title: 'Egzaminy',
        items: [
            { id: 'exam', label: 'Symulacje', icon: <FileText size={18} />, href: '/exam' },
            { id: 'results', label: 'Wyniki', icon: <BarChart3 size={18} />, href: '/exam/results' },
        ],
    },
    {
        title: 'Analityka',
        items: [
            { id: 'performance', label: 'Wydajność', icon: <LineChart size={18} />, href: '/analytics', badge: 'pro' },
            { id: 'timetracker', label: 'Czas nauki', icon: <Clock size={18} />, href: '/analytics' },
            { id: 'predictions', label: 'Prognozy AI', icon: <Zap size={18} />, href: '/analytics', badge: 'pro' },
        ],
    },
    {
        title: 'AI Tools',
        items: [
            { id: 'ai', label: 'Asystent AI', icon: <Brain size={18} />, href: '/ai' },
            { id: 'analyzer', label: 'Analiza kazusu', icon: <Sparkles size={18} />, href: '/ai', badge: 'pro' },
            { id: 'generator', label: 'Generator fiszek', icon: <Zap size={18} />, href: '/ai', badge: 'new' },
        ],
    },
    {
        title: 'Społeczność',
        items: [
            { id: 'groups', label: 'Grupy nauki', icon: <Users size={18} />, href: '/leaderboard', badge: 'new' },
            { id: 'forum', label: 'Forum', icon: <MessageSquare size={18} />, href: '/leaderboard' },
        ],
    },
];

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

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
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
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                        L
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in">
                            <h1 className="font-bold text-lg">LexCapital</h1>
                            <span className="badge badge-pro text-[10px]">PRO</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.title} className="mb-4">
                        {!isCollapsed && (
                            <h3 className="px-4 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                {section.title}
                            </h3>
                        )}
                        <div className="space-y-1 px-2">
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                            active
                                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white',
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
                ))}
            </nav>

            {/* User Profile */}
            {!isCollapsed && userStats && (
                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
                            👤
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Student Prawa</p>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <span className="text-orange-400">🔥 {userStats.streak}</span>
                                <span>•</span>
                                <span className="text-green-400">
                                    €{userStats.knowledgeEquity.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
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
