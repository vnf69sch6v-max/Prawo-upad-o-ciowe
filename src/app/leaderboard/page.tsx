'use client';

import { useState, useEffect } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Crown, Flame, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/services/user-service';

export default function LeaderboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const { user, profile } = useAuth();
    const stats = profile?.stats;

    // Fetch leaderboard data
    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const data = await getLeaderboard(50);
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [timeRange]);

    // Find current user's position
    const currentUserRank = user
        ? leaderboard.findIndex(entry => entry.uid === user.uid) + 1
        : null;
    const currentUserEntry = user
        ? leaderboard.find(entry => entry.uid === user.uid)
        : null;

    // Get avatars for display (first letter or emoji)
    const getAvatar = (name: string, index: number) => {
        const emojis = ['👑', '⚖️', '📚', '🎓', '💼', '🦅', '⭐', '🔨', '📖', '✍️', '🌟', '🚀', '💡', '🔥'];
        if (index < 3) return emojis[index];
        return name?.charAt(0).toUpperCase() || '?';
    };

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="leaderboard"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: currentUserRank || 0
                    }}
                    currentView="leaderboard"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Trophy className="text-yellow-400" />
                                    Ranking
                                </h1>
                                <p className="text-[var(--text-muted)]">Rywalizuj z innymi studentami prawa</p>
                            </div>
                            <div className="flex gap-1 bg-[var(--bg-card)] rounded-xl p-1">
                                {(['today', 'week', 'month', 'all'] as const).map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r)}
                                        className={cn(
                                            'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                                            timeRange === r
                                                ? 'bg-[#1a365d] text-white'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                        )}
                                    >
                                        {r === 'today' ? 'Dziś' : r === 'week' ? 'Tydzień' : r === 'month' ? 'Miesiąc' : 'Ogółem'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={32} className="animate-spin text-[#1a365d]" />
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && leaderboard.length === 0 && (
                            <div className="lex-card py-8">
                                {/* Ghost Podium */}
                                <div className="flex items-end justify-center gap-4 mb-8 opacity-40">
                                    {/* 2nd Place Ghost */}
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">?</span>
                                        </div>
                                        <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-gray-400" />
                                        <p className="font-medium text-sm">2. miejsce</p>
                                        <div className="h-16 w-16 bg-gray-500/30 rounded-t-lg mt-2" />
                                    </div>

                                    {/* 1st Place Ghost */}
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-yellow-400/50 to-yellow-600/50 rounded-full flex items-center justify-center">
                                            <span className="text-3xl">👑</span>
                                        </div>
                                        <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-yellow-400/50" />
                                        <p className="font-medium">1. miejsce</p>
                                        <div className="h-24 w-20 bg-yellow-500/20 rounded-t-lg mt-2" />
                                    </div>

                                    {/* 3rd Place Ghost */}
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-amber-600/50 to-amber-800/50 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">?</span>
                                        </div>
                                        <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-amber-600/50" />
                                        <p className="font-medium text-sm">3. miejsce</p>
                                        <div className="h-12 w-16 bg-amber-600/20 rounded-t-lg mt-2" />
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-2">Zajmij swoje miejsce na podium! 🏆</h3>
                                    <p className="text-[var(--text-muted)] mb-6">
                                        Rozwiązuj egzaminy i zdobywaj punkty wiedzy
                                    </p>
                                    <a
                                        href="/exam"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#1a365d]/90 transition-colors font-medium"
                                    >
                                        Rozpocznij egzamin →
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Top 3 Podium */}
                        {!loading && leaderboard.length >= 3 && (
                            <div className="flex items-end justify-center gap-4 py-8">
                                {/* 2nd Place */}
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-3xl">
                                        {getAvatar(leaderboard[1].displayName, 1)}
                                    </div>
                                    <Medal className="mx-auto text-gray-400 mb-1" size={24} />
                                    <p className="font-semibold truncate max-w-[120px]">{leaderboard[1].displayName}</p>
                                    <p className="text-sm text-[var(--text-muted)]">{leaderboard[1].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-24 w-20 bg-gray-500/20 rounded-t-lg mt-2" />
                                </div>

                                {/* 1st Place */}
                                <div className="text-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl animate-glow">
                                            {getAvatar(leaderboard[0].displayName, 0)}
                                        </div>
                                        <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400" size={32} />
                                    </div>
                                    <Medal className="mx-auto text-yellow-400 mb-1" size={28} />
                                    <p className="font-bold text-lg truncate max-w-[140px]">{leaderboard[0].displayName}</p>
                                    <p className="text-sm text-yellow-400">{leaderboard[0].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-32 w-24 bg-yellow-500/20 rounded-t-lg mt-2" />
                                </div>

                                {/* 3rd Place */}
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl">
                                        {getAvatar(leaderboard[2].displayName, 2)}
                                    </div>
                                    <Medal className="mx-auto text-orange-400 mb-1" size={24} />
                                    <p className="font-semibold truncate max-w-[120px]">{leaderboard[2].displayName}</p>
                                    <p className="text-sm text-[var(--text-muted)]">{leaderboard[2].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-16 w-20 bg-orange-500/20 rounded-t-lg mt-2" />
                                </div>
                            </div>
                        )}

                        {/* Current User Card */}
                        {!loading && currentUserEntry && currentUserRank && (
                            <div className="lex-card bg-gradient-to-r from-purple-900/30 to-[var(--bg-card)] border-[#1a365d]/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-[#1a365d]">#{currentUserRank}</span>
                                    <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center text-xl font-bold text-white">
                                        {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">Twoja pozycja</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {currentUserEntry.knowledgeEquity.toLocaleString()} pkt • {currentUserEntry.currentStreak} dni streak
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                                        <Minus size={16} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Leaderboard Table */}
                        {!loading && leaderboard.length > 3 && (
                            <div className="lex-card overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--border-color)]">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Użytkownik</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)]">Equity</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] hidden sm:table-cell">Streak</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)]">Zmiana</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.slice(3).map((entry, index) => {
                                            const isCurrentUser = user && entry.uid === user.uid;
                                            const rank = index + 4;
                                            return (
                                                <tr
                                                    key={entry.uid}
                                                    className={cn(
                                                        'border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors',
                                                        isCurrentUser && 'bg-[#1a365d]/10'
                                                    )}
                                                >
                                                    <td className="px-4 py-3 font-medium">{rank}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-8 h-8 bg-[var(--bg-hover)] rounded-full flex items-center justify-center text-sm font-medium">
                                                                {entry.displayName?.charAt(0).toUpperCase() || '?'}
                                                            </span>
                                                            <span className={cn(
                                                                'font-medium truncate max-w-[150px]',
                                                                isCurrentUser && 'text-[#1a365d]'
                                                            )}>
                                                                {entry.displayName}
                                                                {isCurrentUser && ' (Ty)'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {entry.knowledgeEquity.toLocaleString()} pkt
                                                    </td>
                                                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                                                        <span className="flex items-center justify-end gap-1 text-orange-400">
                                                            <Flame size={14} />
                                                            {entry.currentStreak}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={cn(
                                                            'flex items-center justify-end gap-1',
                                                            entry.rankChange > 0 && 'text-green-400',
                                                            entry.rankChange < 0 && 'text-red-400',
                                                            entry.rankChange === 0 && 'text-[var(--text-muted)]'
                                                        )}>
                                                            {entry.rankChange > 0 && <TrendingUp size={14} />}
                                                            {entry.rankChange < 0 && <TrendingDown size={14} />}
                                                            {entry.rankChange === 0 && <Minus size={14} />}
                                                            {entry.rankChange !== 0 && Math.abs(entry.rankChange)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="leaderboard" onNavigate={() => { }} />
        </div>
    );
}
