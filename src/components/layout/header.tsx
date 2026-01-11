'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
    userStats: {
        streak: number;
        knowledgeEquity: number;
        rank?: number;
    };
    currentView: string;
    onNavigate?: (view: string) => void;
}

const NEARBY_USERS = [
    { rank: 29, name: 'Prawnik_2025', equity: 12500, change: 2 },
    { rank: 30, name: 'LegalEagle', equity: 12300, change: -1 },
    { rank: 31, name: 'AdamK', equity: 12100, change: 0 },
    { rank: 32, name: 'Ty', equity: 12000, change: 3, isCurrentUser: true },
    { rank: 33, name: 'MartaP', equity: 11800, change: -2 },
    { rank: 34, name: 'Prawo_Master', equity: 11600, change: 1 },
    { rank: 35, name: 'JanKowalski', equity: 11400, change: -1 },
];

export function Header({ userStats, currentView, onNavigate }: HeaderProps) {
    const [showRankPopover, setShowRankPopover] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Page Title */}
                <div>
                    <h1 className="text-xl font-bold capitalize">
                        {currentView === 'dashboard' ? 'Dashboard' : currentView.replace(/([A-Z])/g, ' $1')}
                    </h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        Witaj z powrotem! Kontynuuj naukę 🎯
                    </p>
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex items-center gap-4">
                    {/* Online Users */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Users size={14} className="text-green-400" />
                        <span className="text-sm font-medium text-green-400">347</span>
                        <span className="text-xs text-green-400/70">online</span>
                    </div>

                    {/* Rank with Popover */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRankPopover(!showRankPopover)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all"
                        >
                            <Trophy size={14} className="text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-400">#{userStats.rank || 32}</span>
                            <ChevronDown size={12} className={cn(
                                'text-yellow-400/70 transition-transform',
                                showRankPopover && 'rotate-180'
                            )} />
                        </button>

                        {/* Rank Popover */}
                        {showRankPopover && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowRankPopover(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-20 animate-fade-in overflow-hidden">
                                    <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                                        <span className="text-sm font-semibold">Twoja pozycja</span>
                                        <button
                                            onClick={() => onNavigate?.('leaderboard')}
                                            className="text-xs text-[#1a365d] hover:underline"
                                        >
                                            Zobacz pełny ranking →
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {NEARBY_USERS.map((user) => (
                                            <div
                                                key={user.rank}
                                                className={cn(
                                                    'flex items-center gap-3 px-3 py-2 border-b border-[var(--border-color)] last:border-b-0',
                                                    user.isCurrentUser && 'bg-[#1a365d]/10'
                                                )}
                                            >
                                                <span className={cn(
                                                    'w-6 text-center text-sm font-bold',
                                                    user.rank <= 3 && 'text-yellow-400'
                                                )}>
                                                    {user.rank}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        'text-sm font-medium truncate',
                                                        user.isCurrentUser && 'text-[#1a365d]'
                                                    )}>
                                                        {user.name}
                                                        {user.isCurrentUser && ' (Ty)'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        €{user.equity.toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    'text-xs font-medium',
                                                    user.change > 0 && 'text-green-400',
                                                    user.change < 0 && 'text-red-400',
                                                    user.change === 0 && 'text-[var(--text-muted)]'
                                                )}>
                                                    {user.change > 0 ? `↑${user.change}` : user.change < 0 ? `↓${Math.abs(user.change)}` : '–'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#b8860b]/10 border border-[#b8860b]/20 rounded-lg">
                        <span className="text-[#b8860b]">🔥</span>
                        <span className="text-sm font-bold text-[#b8860b]">{userStats.streak}</span>
                        <span className="text-xs text-[#b8860b]/70">dni</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-all">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
}
