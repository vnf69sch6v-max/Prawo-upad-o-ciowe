'use client';

/**
 * Liquid Glass Sidebar
 * Auto-collapsing sidebar with smooth hover-to-expand behavior
 * Style: Clean white glass matching the reference design
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    ChevronDown,
    LayoutDashboard, Trophy, BookOpen, Brain, Target, BarChart3,
    LineChart, Zap, FileText, Search, Calendar, Scale, Settings, Sparkles
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: 'new';
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

interface LiquidGlassSidebarProps {
    userStats?: {
        streak: number;
        knowledgeEquity: number;
    };
}

export function LiquidGlassSidebar({ userStats }: LiquidGlassSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['przeglad', 'sciezki', 'narzedzia', 'praktyka', 'ai-tools']);

    // Handle mouse near left edge to expand sidebar
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientX <= 15) {
                setIsExpanded(true);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsExpanded(false);
    }, []);

    const handleNavClick = (href: string) => {
        router.push(href);
        // Small delay before collapsing for visual feedback
        setTimeout(() => setIsExpanded(false), 150);
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Invisible hover trigger zone on left edge */}
            <div
                className="fixed left-0 top-0 bottom-0 w-4 z-40"
                onMouseEnter={() => setIsExpanded(true)}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col overflow-hidden',
                    'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'
                )}
                style={{
                    width: isExpanded ? '260px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
                    borderRight: '1px solid #E5E7EB',
                    boxShadow: isExpanded ? '4px 0 24px rgba(0, 0, 0, 0.06)' : 'none'
                }}
                onMouseLeave={handleMouseLeave}
            >
                {/* Logo Header */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            S
                        </div>
                        <span className="font-semibold text-lg text-[#3B82F6] whitespace-nowrap">
                            Savori Legal
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3">
                    {NAV_SECTIONS.map((section, sectionIndex) => {
                        const isSectionExpanded = expandedSections.includes(section.id);
                        return (
                            <div key={section.id} className={cn(sectionIndex > 0 && 'mt-4')}>
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full px-2 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                                >
                                    <span className="whitespace-nowrap">{section.title}</span>
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            'transition-transform duration-200 shrink-0',
                                            isSectionExpanded ? 'rotate-0' : '-rotate-90'
                                        )}
                                    />
                                </button>

                                {/* Section Items */}
                                <div
                                    className={cn(
                                        'space-y-0.5 overflow-hidden transition-all duration-200',
                                        !isSectionExpanded && 'max-h-0 opacity-0',
                                        isSectionExpanded && 'max-h-[500px] opacity-100'
                                    )}
                                >
                                    {section.items.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavClick(item.href)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                                                    active
                                                        ? 'bg-[#E0F2FE] text-[#0284C7]'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                )}
                                            >
                                                <span className={cn(
                                                    'flex items-center justify-center w-5 h-5 shrink-0',
                                                    active ? 'text-[#0284C7]' : 'text-gray-400'
                                                )}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                                                {item.badge === 'new' && (
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#22D3EE] text-white shrink-0">
                                                        NEW
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* User/Settings Footer */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => handleNavClick('/settings')}
                        className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                            N
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">Nawigacja</p>
                            {userStats && (
                                <p className="text-xs text-gray-400">
                                    🔥 {userStats.streak} • {userStats.knowledgeEquity} pkt
                                </p>
                            )}
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
}
