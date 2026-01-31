'use client';

import { useState, useEffect } from 'react';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Crown, Flame, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/services/user-service';

export default function LeaderboardPage() {
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

    // Get avatars for display
    const getAvatar = (name: string, index: number) => {
        const emojis = ['👑', '⚖️', '📚'];
        if (index < 3) return emojis[index];
        return name?.charAt(0).toUpperCase() || '?';
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
            <LiquidGlassSidebar
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />
            {/* Apple-style Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Ranking</h1>
                            <p className="text-sm text-gray-500">Rywalizuj z innymi studentami</p>
                        </div>
                    </div>
                    {/* Time Range Tabs */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {(['today', 'week', 'month', 'all'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                                    timeRange === r
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                )}
                            >
                                {r === 'today' ? 'Dziś' : r === 'week' ? 'Tydzień' : r === 'month' ? 'Miesiąc' : 'Ogółem'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-6 pb-24 lg:pb-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && leaderboard.length === 0 && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Zajmij swoje miejsce!</h3>
                            <p className="text-gray-500 mb-6">Rozwiązuj egzaminy i zdobywaj punkty</p>
                            <a
                                href="/exam"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                            >
                                Rozpocznij egzamin →
                            </a>
                        </div>
                    )}

                    {/* Top 3 Podium */}
                    {!loading && leaderboard.length >= 3 && (
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-end justify-center gap-4 py-4">
                                {/* 2nd Place */}
                                <div className="text-center">
                                    <div className="w-18 h-18 mx-auto mb-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-2xl" style={{ width: '72px', height: '72px' }}>
                                        {getAvatar(leaderboard[1].displayName, 1)}
                                    </div>
                                    <Medal className="mx-auto text-gray-400 mb-1" size={20} />
                                    <p className="font-semibold text-gray-900 truncate max-w-[100px]">{leaderboard[1].displayName}</p>
                                    <p className="text-sm text-gray-500">{leaderboard[1].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-20 w-16 bg-gray-100 rounded-t-lg mt-2 mx-auto" />
                                </div>

                                {/* 1st Place */}
                                <div className="text-center">
                                    <div className="relative">
                                        <div className="w-22 h-22 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-3xl shadow-lg" style={{ width: '88px', height: '88px' }}>
                                            {getAvatar(leaderboard[0].displayName, 0)}
                                        </div>
                                        <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-500" size={28} />
                                    </div>
                                    <Medal className="mx-auto text-yellow-500 mb-1" size={24} />
                                    <p className="font-bold text-gray-900 truncate max-w-[120px]">{leaderboard[0].displayName}</p>
                                    <p className="text-sm text-amber-600 font-medium">{leaderboard[0].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-28 w-20 bg-amber-50 border border-amber-200 rounded-t-lg mt-2 mx-auto" />
                                </div>

                                {/* 3rd Place */}
                                <div className="text-center">
                                    <div className="w-18 h-18 mx-auto mb-2 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-2xl" style={{ width: '72px', height: '72px' }}>
                                        {getAvatar(leaderboard[2].displayName, 2)}
                                    </div>
                                    <Medal className="mx-auto text-orange-400 mb-1" size={20} />
                                    <p className="font-semibold text-gray-900 truncate max-w-[100px]">{leaderboard[2].displayName}</p>
                                    <p className="text-sm text-gray-500">{leaderboard[2].knowledgeEquity.toLocaleString()} pkt</p>
                                    <div className="h-14 w-16 bg-orange-50 border border-orange-200 rounded-t-lg mt-2 mx-auto" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current User Card */}
                    {!loading && currentUserEntry && currentUserRank && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-blue-600">#{currentUserRank}</span>
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                                    {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Twoja pozycja</p>
                                    <p className="text-sm text-gray-600">
                                        {currentUserEntry.knowledgeEquity.toLocaleString()} pkt • {currentUserEntry.currentStreak} dni streak
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Leaderboard Table */}
                    {!loading && leaderboard.length > 3 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Użytkownik</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Punkty</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Streak</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Zmiana</th>
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
                                                    'border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors',
                                                    isCurrentUser && 'bg-blue-50'
                                                )}
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-900">{rank}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                                            {entry.displayName?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                        <span className={cn(
                                                            'font-medium truncate max-w-[150px]',
                                                            isCurrentUser ? 'text-blue-600' : 'text-gray-900'
                                                        )}>
                                                            {entry.displayName}
                                                            {isCurrentUser && ' (Ty)'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                    {entry.knowledgeEquity.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right hidden sm:table-cell">
                                                    <span className="flex items-center justify-end gap-1 text-orange-500">
                                                        <Flame size={14} />
                                                        {entry.currentStreak}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={cn(
                                                        'flex items-center justify-end gap-1',
                                                        entry.rankChange > 0 && 'text-green-500',
                                                        entry.rankChange < 0 && 'text-red-500',
                                                        entry.rankChange === 0 && 'text-gray-400'
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

            <MobileNav currentView="leaderboard" onNavigate={() => { }} />
        </div>
    );
}
