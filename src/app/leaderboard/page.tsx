'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Crown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Prawnik_Elite', equity: 45320, streak: 156, accuracy: 96, change: 0, avatar: '👑' },
    { rank: 2, name: 'LegalMaster', equity: 42100, streak: 98, accuracy: 94, change: 1, avatar: '⚖️' },
    { rank: 3, name: 'AdwokatPro', equity: 38900, streak: 67, accuracy: 92, change: -1, avatar: '📚' },
    { rank: 4, name: 'RadcaPrawny2025', equity: 35600, streak: 45, accuracy: 91, change: 2, avatar: '🎓' },
    { rank: 5, name: 'JurystaKarol', equity: 32400, streak: 89, accuracy: 89, change: 0, avatar: '💼' },
    { rank: 6, name: 'PrawoMistrzM', equity: 28900, streak: 34, accuracy: 88, change: 3, avatar: '🦅' },
    { rank: 7, name: 'AplikantAnna', equity: 25600, streak: 56, accuracy: 87, change: -2, avatar: '⭐' },
    { rank: 8, name: 'SędowoGodny', equity: 22300, streak: 23, accuracy: 85, change: 1, avatar: '🔨' },
    { rank: 9, name: 'ParagrafPiotr', equity: 19800, streak: 78, accuracy: 84, change: -1, avatar: '📖' },
    { rank: 10, name: 'NotuszekM', equity: 17500, streak: 12, accuracy: 82, change: 0, avatar: '✍️' },
    // ... more entries
    { rank: 31, name: 'LegalLearner', equity: 12200, streak: 15, accuracy: 80, change: 2, avatar: '🌟' },
    { rank: 32, name: 'Ty', equity: 12000, streak: 12, accuracy: 78, change: 3, isCurrentUser: true, avatar: '👤' },
    { rank: 33, name: 'PrawoStart', equity: 11800, streak: 8, accuracy: 76, change: -1, avatar: '🚀' },
];

export default function LeaderboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

    const currentUser = MOCK_LEADERBOARD.find(u => u.isCurrentUser);

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="leaderboard"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
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
                                                ? 'bg-purple-600 text-white'
                                                : 'text-[var(--text-muted)] hover:text-white'
                                        )}
                                    >
                                        {r === 'today' ? 'Dziś' : r === 'week' ? 'Tydzień' : r === 'month' ? 'Miesiąc' : 'Ogółem'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top 3 Podium */}
                        <div className="flex items-end justify-center gap-4 py-8">
                            {/* 2nd Place */}
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-3xl">
                                    {MOCK_LEADERBOARD[1].avatar}
                                </div>
                                <Medal className="mx-auto text-gray-400 mb-1" size={24} />
                                <p className="font-semibold">{MOCK_LEADERBOARD[1].name}</p>
                                <p className="text-sm text-[var(--text-muted)]">€{MOCK_LEADERBOARD[1].equity.toLocaleString()}</p>
                                <div className="h-24 w-20 bg-gray-500/20 rounded-t-lg mt-2" />
                            </div>

                            {/* 1st Place */}
                            <div className="text-center">
                                <div className="relative">
                                    <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl animate-glow">
                                        {MOCK_LEADERBOARD[0].avatar}
                                    </div>
                                    <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400" size={32} />
                                </div>
                                <Medal className="mx-auto text-yellow-400 mb-1" size={28} />
                                <p className="font-bold text-lg">{MOCK_LEADERBOARD[0].name}</p>
                                <p className="text-sm text-yellow-400">€{MOCK_LEADERBOARD[0].equity.toLocaleString()}</p>
                                <div className="h-32 w-24 bg-yellow-500/20 rounded-t-lg mt-2" />
                            </div>

                            {/* 3rd Place */}
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl">
                                    {MOCK_LEADERBOARD[2].avatar}
                                </div>
                                <Medal className="mx-auto text-orange-400 mb-1" size={24} />
                                <p className="font-semibold">{MOCK_LEADERBOARD[2].name}</p>
                                <p className="text-sm text-[var(--text-muted)]">€{MOCK_LEADERBOARD[2].equity.toLocaleString()}</p>
                                <div className="h-16 w-20 bg-orange-500/20 rounded-t-lg mt-2" />
                            </div>
                        </div>

                        {/* Current User Card */}
                        {currentUser && (
                            <div className="lex-card bg-gradient-to-r from-purple-900/30 to-[var(--bg-card)] border-purple-500/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-purple-400">#{currentUser.rank}</span>
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl">
                                        {currentUser.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">Twoja pozycja</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            €{currentUser.equity.toLocaleString()} • {currentUser.streak} dni streak
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-400">
                                        <TrendingUp size={16} />
                                        <span className="text-sm font-medium">+{currentUser.change}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Leaderboard */}
                        <div className="lex-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)]">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">Użytkownik</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)]">Equity</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] hidden sm:table-cell">Streak</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] hidden md:table-cell">Skuteczność</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)]">Zmiana</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_LEADERBOARD.slice(3).map(user => (
                                        <tr
                                            key={user.rank}
                                            className={cn(
                                                'border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors',
                                                user.isCurrentUser && 'bg-purple-500/10'
                                            )}
                                        >
                                            <td className="px-4 py-3 font-medium">{user.rank}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{user.avatar}</span>
                                                    <span className={cn(
                                                        'font-medium',
                                                        user.isCurrentUser && 'text-purple-400'
                                                    )}>
                                                        {user.name}
                                                        {user.isCurrentUser && ' (Ty)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                €{user.equity.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right hidden sm:table-cell">
                                                <span className="flex items-center justify-end gap-1 text-orange-400">
                                                    <Flame size={14} />
                                                    {user.streak}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                {user.accuracy}%
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={cn(
                                                    'flex items-center justify-end gap-1',
                                                    user.change > 0 && 'text-green-400',
                                                    user.change < 0 && 'text-red-400',
                                                    user.change === 0 && 'text-[var(--text-muted)]'
                                                )}>
                                                    {user.change > 0 && <TrendingUp size={14} />}
                                                    {user.change < 0 && <TrendingDown size={14} />}
                                                    {user.change === 0 && <Minus size={14} />}
                                                    {user.change !== 0 && Math.abs(user.change)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="leaderboard" onNavigate={() => { }} />
        </div>
    );
}
