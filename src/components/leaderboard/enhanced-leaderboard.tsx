'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Flame, Crown, Star, Zap } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface LeaderboardEntry {
    rank: number;
    rankChange: number;
    userId: string;
    displayName: string;
    avatar: string;
    knowledgeEquity: number;
    streak: number;
    level: number;
    badges: string[];
    isCurrentUser: boolean;
}

interface EnhancedLeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserRank?: number;
    timeRange: 'today' | 'week' | 'month' | 'all';
    onTimeRangeChange: (range: 'today' | 'week' | 'month' | 'all') => void;
    domain?: string;
}

// ============================================
// CONSTANTS
// ============================================

const TIME_RANGES = [
    { value: 'today', label: 'Dziś' },
    { value: 'week', label: 'Tydzień' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'all', label: 'Wszystko' },
] as const;

// ============================================
// PODIUM COMPONENT (Top 3)
// ============================================

function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
    if (top3.length < 3) return null;

    const getPodiumStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return {
                    height: 'h-28',
                    bg: 'bg-gradient-to-b from-yellow-500/30 to-yellow-600/10',
                    border: 'border-yellow-500/50',
                    icon: <Crown className="text-yellow-400" size={28} />,
                    glow: 'shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]',
                };
            case 2:
                return {
                    height: 'h-20',
                    bg: 'bg-gradient-to-b from-gray-400/30 to-gray-500/10',
                    border: 'border-gray-400/50',
                    icon: <Medal className="text-gray-300" size={24} />,
                    glow: '',
                };
            case 3:
                return {
                    height: 'h-16',
                    bg: 'bg-gradient-to-b from-amber-700/30 to-amber-800/10',
                    border: 'border-amber-600/50',
                    icon: <Medal className="text-amber-600" size={24} />,
                    glow: '',
                };
            default:
                return { height: 'h-12', bg: '', border: '', icon: null, glow: '' };
        }
    };

    // Reorder for visual display: 2nd, 1st, 3rd
    const ordered = [top3[1], top3[0], top3[2]];

    return (
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
            {ordered.map((entry, i) => {
                const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const style = getPodiumStyle(actualRank);

                return (
                    <div
                        key={entry.userId}
                        className={cn(
                            'flex flex-col items-center transition-all',
                            actualRank === 1 && 'scale-110'
                        )}
                    >
                        {/* Avatar with rank indicator */}
                        <div className="relative mb-2">
                            <div className={cn(
                                'w-16 h-16 rounded-full bg-gradient-to-br from-#1a365d to-pink-600 flex items-center justify-center text-2xl font-bold border-2',
                                style.border,
                                style.glow
                            )}>
                                {entry.avatar || entry.displayName[0]}
                            </div>
                            <div className={cn(
                                'absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                actualRank === 1 && 'bg-yellow-500 text-black',
                                actualRank === 2 && 'bg-gray-400 text-black',
                                actualRank === 3 && 'bg-amber-600 text-white'
                            )}>
                                {actualRank}
                            </div>
                        </div>

                        {/* Name */}
                        <p className={cn(
                            'font-semibold text-sm mb-1 truncate max-w-[100px]',
                            entry.isCurrentUser && 'text-[#1a365d]'
                        )}>
                            {entry.displayName}
                            {entry.isCurrentUser && ' (Ty)'}
                        </p>

                        {/* Stats */}
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                            €{(entry.knowledgeEquity / 1000).toFixed(1)}k
                        </p>

                        {/* Podium block */}
                        <div className={cn(
                            'w-24 rounded-t-xl flex flex-col items-center justify-center border-t border-x',
                            style.height,
                            style.bg,
                            style.border
                        )}>
                            {style.icon}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ============================================
// LEADERBOARD ROW
// ============================================

function LeaderboardRow({ entry, showRankChange = true }: { entry: LeaderboardEntry; showRankChange?: boolean }) {
    const getRankChangeIcon = () => {
        if (entry.rankChange > 0) {
            return <TrendingUp size={14} className="text-green-400" />;
        } else if (entry.rankChange < 0) {
            return <TrendingDown size={14} className="text-red-400" />;
        }
        return <Minus size={14} className="text-gray-400" />;
    };

    return (
        <div className={cn(
            'flex items-center gap-4 p-4 rounded-xl border transition-all',
            entry.isCurrentUser
                ? 'bg-[#1a365d]/10 border-[#1a365d]/30'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[#1a365d]/30'
        )}>
            {/* Rank */}
            <div className="w-12 flex items-center justify-center">
                <span className={cn(
                    'font-bold text-lg',
                    entry.rank <= 10 && 'text-[#1a365d]'
                )}>
                    #{entry.rank}
                </span>
            </div>

            {/* Rank change */}
            {showRankChange && (
                <div className="w-10 flex items-center gap-1">
                    {getRankChangeIcon()}
                    {entry.rankChange !== 0 && (
                        <span className={cn(
                            'text-xs',
                            entry.rankChange > 0 && 'text-green-400',
                            entry.rankChange < 0 && 'text-red-400'
                        )}>
                            {Math.abs(entry.rankChange)}
                        </span>
                    )}
                </div>
            )}

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-#1a365d to-pink-600 flex items-center justify-center font-bold">
                {entry.avatar || entry.displayName[0]}
            </div>

            {/* Name and badges */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'font-medium truncate',
                        entry.isCurrentUser && 'text-[#1a365d]'
                    )}>
                        {entry.displayName}
                        {entry.isCurrentUser && ' (Ty)'}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-[#1a365d]/20 text-[#1a365d] rounded-full">
                        Lv.{entry.level}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    {entry.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className="text-sm">{badge}</span>
                    ))}
                </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 text-orange-400">
                <Flame size={16} />
                <span className="text-sm font-medium">{entry.streak}</span>
            </div>

            {/* Knowledge Equity */}
            <div className="text-right">
                <p className="font-bold text-emerald-400">
                    €{entry.knowledgeEquity.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Knowledge Equity</p>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedLeaderboard({
    entries,
    currentUserRank,
    timeRange,
    onTimeRangeChange,
}: EnhancedLeaderboardProps) {
    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    // Find current user in entries
    const currentUser = entries.find(e => e.isCurrentUser);
    const showFloatingCard = currentUser && currentUser.rank > 10;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Trophy size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Ranking</h2>
                        <p className="text-[var(--text-muted)]">{entries.length} uczestników</p>
                    </div>
                </div>

                {/* Time range selector */}
                <div className="flex gap-1 p-1 bg-[var(--bg-hover)] rounded-xl">
                    {TIME_RANGES.map(range => (
                        <button
                            key={range.value}
                            onClick={() => onTimeRangeChange(range.value)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                timeRange === range.value
                                    ? 'bg-[#1a365d] text-white'
                                    : 'text-[var(--text-muted)] hover:text-white'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Podium */}
            {top3.length >= 3 && <Podium top3={top3} />}

            {/* Rest of leaderboard */}
            <div className="space-y-2">
                {rest.map(entry => (
                    <LeaderboardRow key={entry.userId} entry={entry} />
                ))}
            </div>

            {/* Floating current user card */}
            {showFloatingCard && currentUser && (
                <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 bg-[var(--bg-elevated)] border border-[#1a365d]/30 rounded-xl p-4 shadow-lg animate-fade-in">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Twoja pozycja</p>
                    <LeaderboardRow entry={currentUser} showRankChange={false} />
                </div>
            )}
        </div>
    );
}

// ============================================
// SAMPLE DATA
// ============================================

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, rankChange: 0, userId: '1', displayName: 'Anna Kowalska', avatar: '👩‍⚖️', knowledgeEquity: 45230, streak: 45, level: 12, badges: ['🏆', '🔥', '⚡'], isCurrentUser: false },
    { rank: 2, rankChange: 2, userId: '2', displayName: 'Piotr Nowak', avatar: '👨‍💼', knowledgeEquity: 42150, streak: 38, level: 11, badges: ['🥈', '📚'], isCurrentUser: false },
    { rank: 3, rankChange: -1, userId: '3', displayName: 'Maria Wiśniewska', avatar: '👩‍🎓', knowledgeEquity: 38900, streak: 32, level: 10, badges: ['🥉', '💎'], isCurrentUser: false },
    { rank: 4, rankChange: 1, userId: '4', displayName: 'Jan Kamiński', avatar: '👨‍⚖️', knowledgeEquity: 35600, streak: 28, level: 9, badges: ['🎯', '⭐'], isCurrentUser: false },
    { rank: 5, rankChange: -1, userId: '5', displayName: 'Katarzyna Lewandowska', avatar: '👩‍💻', knowledgeEquity: 32400, streak: 25, level: 8, badges: ['📖'], isCurrentUser: false },
    { rank: 6, rankChange: 0, userId: '6', displayName: 'Tomasz Zieliński', avatar: '👨‍🎓', knowledgeEquity: 28900, streak: 22, level: 7, badges: ['🌟'], isCurrentUser: false },
    { rank: 7, rankChange: 3, userId: '7', displayName: 'Agnieszka Szymańska', avatar: '👩‍⚖️', knowledgeEquity: 25600, streak: 18, level: 6, badges: ['🚀'], isCurrentUser: false },
    { rank: 8, rankChange: -2, userId: '8', displayName: 'Michał Woźniak', avatar: '👨‍💼', knowledgeEquity: 22300, streak: 15, level: 5, badges: ['📚'], isCurrentUser: false },
    { rank: 9, rankChange: 0, userId: '9', displayName: 'Ewa Dąbrowska', avatar: '👩‍🎓', knowledgeEquity: 19800, streak: 12, level: 4, badges: ['⚡'], isCurrentUser: false },
    { rank: 10, rankChange: 1, userId: '10', displayName: 'Paweł Kozłowski', avatar: '👨‍⚖️', knowledgeEquity: 17500, streak: 10, level: 3, badges: ['🎯'], isCurrentUser: false },
    { rank: 32, rankChange: 5, userId: 'current', displayName: 'Mikołaj', avatar: '🧑‍💻', knowledgeEquity: 12000, streak: 12, level: 2, badges: ['🔥'], isCurrentUser: true },
];
