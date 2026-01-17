'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { LeaderboardEntry } from '@/lib/services/user-service';

interface HeaderProps {
    userStats: {
        streak: number;
        knowledgeEquity: number;
        rank?: number;
    };
    currentView: string;
    onNavigate?: (view: string) => void;
    nearbyUsers?: LeaderboardEntry[];
}


export function Header({ userStats, currentView, onNavigate, nearbyUsers = [] }: HeaderProps) {
    const [showRankPopover, setShowRankPopover] = useState(false);
    const hasRankData = userStats.rank && userStats.rank > 0;

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

                    {/* Rank with Popover */}
                    {hasRankData && (
                        <div className="relative">
                            <button
                                onClick={() => setShowRankPopover(!showRankPopover)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all"
                            >
                                <Trophy size={14} className="text-yellow-400" />
                                <span className="text-sm font-bold text-yellow-400">#{userStats.rank}</span>
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
                                            {nearbyUsers.length > 0 ? nearbyUsers.map((user) => {
                                                const isCurrentUser = user.rank === userStats.rank;
                                                return (
                                                    <div
                                                        key={user.uid}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 border-b border-[var(--border-color)] last:border-b-0',
                                                            isCurrentUser && 'bg-[#1a365d]/10'
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
                                                                isCurrentUser && 'text-[#1a365d]'
                                                            )}>
                                                                {user.displayName}
                                                                {isCurrentUser && ' (Ty)'}
                                                            </p>
                                                            <p className="text-xs text-[var(--text-muted)]">
                                                                {user.knowledgeEquity.toLocaleString()} pkt
                                                            </p>
                                                        </div>
                                                        <span className={cn(
                                                            'text-xs font-medium',
                                                            (user.rankChange || 0) > 0 && 'text-green-400',
                                                            (user.rankChange || 0) < 0 && 'text-red-400',
                                                            (user.rankChange || 0) === 0 && 'text-[var(--text-muted)]'
                                                        )}>
                                                            {(user.rankChange || 0) > 0 ? `↑${user.rankChange}` : (user.rankChange || 0) < 0 ? `↓${Math.abs(user.rankChange || 0)}` : '–'}
                                                        </span>
                                                    </div>
                                                )
                                            }) : (
                                                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                                                    Brak danych rankingowych
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

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
