'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import {
    StatCard,
    PerformanceChart,
    BehaviorInsights,
    BehaviorRecommendations,
    BehaviorPredictionsWidget,
    AgentDebugPanel
} from '@/components/dashboard';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard, LeaderboardEntry } from '@/lib/services/user-service';
import { BookOpen, Brain, Target, Sparkles, Loader2 } from 'lucide-react';
import { DEFAULT_USER_STATS } from '@/lib/types/user';


export default function DashboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, profile, loading, profileLoading } = useAuth();
    const router = useRouter();

    // Leaderboard data for header
    const [userRank, setUserRank] = useState<number | undefined>();
    const [nearbyUsers, setNearbyUsers] = useState<LeaderboardEntry[]>([]);

    // Redirect to landing if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Fetch leaderboard data
    const fetchLeaderboard = useCallback(async () => {
        if (!user) return;

        try {
            const leaderboard = await getLeaderboard(50);
            // Find user's rank
            const userIndex = leaderboard.findIndex(entry => entry.uid === user.uid);
            if (userIndex !== -1) {
                setUserRank(userIndex + 1);
                // Get nearby users (2 above and 2 below)
                const start = Math.max(0, userIndex - 2);
                const end = Math.min(leaderboard.length, userIndex + 3);
                setNearbyUsers(leaderboard.slice(start, end));
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user && !loading) {
            fetchLeaderboard();
        }
    }, [user, loading, fetchLeaderboard]);

    // Use profile stats or defaults
    const stats = profile?.stats || DEFAULT_USER_STATS;
    const displayName = profile?.displayName || user?.displayName || 'Student';

    // Calculate accuracy percentage
    const accuracy = stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;

    // Generate performance history - show only current value without random fluctuations
    // In the future, this should come from actual test history in Supabase
    const performanceHistory = stats.knowledgeEquity > 0
        ? Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
            }),
            // Show gradual growth to current value (deterministic)
            value: Math.round((stats.knowledgeEquity / 14) * (i + 1)),
        }))
        : [];

    // Loading state
    if (loading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#1a365d] mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Ładowanie...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) return null;

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: stats.currentStreak, knowledgeEquity: stats.knowledgeEquity }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats.currentStreak,
                        knowledgeEquity: stats.knowledgeEquity,
                        rank: userRank,
                    }}
                    currentView="dashboard"
                    nearbyUsers={nearbyUsers}
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-6 animate-fade-in">
                            {/* Welcome Message */}
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold">
                                    Cześć, {displayName}! 👋
                                </h1>
                                <p className="text-[var(--text-muted)]">
                                    {stats.currentStreak > 0
                                        ? `Świetnie! Masz ${stats.currentStreak}-dniową passę. Kontynuuj naukę!`
                                        : 'Rozpocznij naukę, aby zbudować swoją passę!'
                                    }
                                </p>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    label="Punkty wiedzy"
                                    value={stats.knowledgeEquity}
                                    suffix=" pkt"
                                    change={stats.knowledgeEquity > 0 ? 12 : 0}
                                    trend={stats.knowledgeEquity > 0 ? "up" : "neutral"}
                                    icon="💰"
                                />
                                <StatCard
                                    label="Ukończone Egzaminy"
                                    value={stats.examsCompleted}
                                    change={stats.examsCompleted > 0 ? stats.examsPassed : 0}
                                    trend={stats.examsCompleted > 0 ? "up" : "neutral"}
                                    icon="📋"
                                />
                                <StatCard
                                    label="Dokładność"
                                    value={accuracy}
                                    suffix="%"
                                    change={accuracy > 0 ? (accuracy > 70 ? 5 : 0) : undefined}
                                    trend={accuracy > 70 ? "up" : "neutral"}
                                    icon="🎯"
                                />
                                <StatCard
                                    label="Seria nauki"
                                    value={`${stats.currentStreak} dni`}
                                    icon="🔥"
                                    trend="neutral"
                                />
                            </div>

                            {/* Charts & Quick Actions */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Performance Chart */}
                                {stats.knowledgeEquity > 0 ? (
                                    <PerformanceChart data={performanceHistory} target={15000} />
                                ) : (
                                    <div className="lex-card flex flex-col items-center justify-center py-12">
                                        <div className="text-6xl mb-4">🚀</div>
                                        <h3 className="text-lg font-semibold mb-2">Zacznij swoją przygodę!</h3>
                                        <p className="text-[var(--text-muted)] text-center text-sm mb-4">
                                            Odpowiadaj na pytania i śledź swoje postępy
                                        </p>
                                        <a
                                            href="/exam"
                                            className="px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#1a365d]/90 transition-colors font-medium"
                                        >
                                            Rozpocznij egzamin →
                                        </a>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="lex-card">
                                    <h3 className="text-lg font-semibold mb-4">⚡ Szybkie akcje</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href="/flashcards"
                                            className="p-4 bg-[var(--bg-hover)] hover:bg-[#1a365d]/10 border border-[var(--border-color)] hover:border-[#1a365d]/50 rounded-xl transition-all text-left"
                                        >
                                            <BookOpen size={24} className="text-[#1a365d] mb-2" />
                                            <span className="font-medium block">Fiszki</span>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">Ucz się z fiszek</p>
                                        </Link>
                                        <Link
                                            href="/exam"
                                            className="p-4 bg-[var(--bg-hover)] hover:bg-[#1a365d]/10 border border-[var(--border-color)] hover:border-[#1a365d]/50 rounded-xl transition-all text-left"
                                        >
                                            <Target size={24} className="text-[#1a365d] mb-2" />
                                            <span className="font-medium block">Egzaminy</span>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">Test wiedzy</p>
                                        </Link>
                                        <Link
                                            href="/ai"
                                            className="p-4 bg-[var(--bg-hover)] hover:bg-[#1a365d]/10 border border-[var(--border-color)] hover:border-[#1a365d]/50 rounded-xl transition-all text-left"
                                        >
                                            <Brain size={24} className="text-[#1a365d] mb-2" />
                                            <span className="font-medium block">AI Asystent</span>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">Zapytaj o prawo</p>
                                        </Link>
                                        <Link
                                            href="/leaderboard"
                                            className="p-4 bg-[var(--bg-hover)] hover:bg-[#1a365d]/10 border border-[var(--border-color)] hover:border-[#1a365d]/50 rounded-xl transition-all text-left"
                                        >
                                            <Sparkles size={24} className="text-[#b8860b] mb-2" />
                                            <span className="font-medium block">Ranking</span>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">Zobacz pozycję</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Towards Goals */}
                            <div className="lex-card">
                                <h3 className="text-lg font-semibold mb-4">📈 Twoje postępy</h3>
                                <div className="space-y-4">
                                    {/* Questions Goal */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[var(--text-muted)]">Pytania dzisiaj</span>
                                            <span className="font-medium">{stats.totalQuestions} / 20</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#1a365d] rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (stats.totalQuestions / 20) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Accuracy Goal */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[var(--text-muted)]">Cel dokładności 80%</span>
                                            <span className="font-medium" style={{ color: accuracy >= 80 ? '#059669' : 'inherit' }}>
                                                {accuracy}% {accuracy >= 80 && '✓'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, (accuracy / 80) * 100)}%`,
                                                    background: accuracy >= 80 ? '#059669' : '#f59e0b'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Points Goal */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[var(--text-muted)]">Punkty wiedzy</span>
                                            <span className="font-medium">{stats.knowledgeEquity.toLocaleString()} / 10,000 pkt</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#059669] to-[#10b981] rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (stats.knowledgeEquity / 10000) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Behavior Analysis */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                <BehaviorInsights maxItems={4} />
                                <BehaviorRecommendations maxItems={3} />
                                <BehaviorPredictionsWidget showTimeToMastery={true} />
                            </div>

                            {/* Best Exam Score */}
                            {stats.bestExamScore > 0 && (
                                <div className="lex-card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">🏆</div>
                                        <div>
                                            <h3 className="font-semibold">Najlepszy wynik egzaminu</h3>
                                            <p className="text-2xl font-bold text-yellow-400">{stats.bestExamScore}%</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="dashboard" onNavigate={() => { }} />

            {/* Agent Debug Panel - visible in dev mode */}
            <AgentDebugPanel position="bottom-right" />
        </div>
    );
}
