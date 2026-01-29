'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import {
    PerformanceChart,
    BehaviorInsights,
    BehaviorRecommendations,
    BehaviorPredictionsWidget,
    AgentDebugPanel
} from '@/components/dashboard';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard, LeaderboardEntry } from '@/lib/services/user-service';
import {
    BookOpen, Brain, Target, Sparkles, Loader2, Trophy,
    TrendingUp, Flame, Award, ArrowRight, Zap
} from 'lucide-react';
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
    const performanceHistory = stats.knowledgeEquity > 0
        ? Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
            }),
            value: Math.round((stats.knowledgeEquity / 14) * (i + 1)),
        }))
        : [];

    // Loading state
    if (loading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[var(--accent-gold)] mx-auto mb-4" />
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

                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-7xl mx-auto space-y-8 animate-subtle">
                        {/* Page Header */}
                        <div className="page-header">
                            <h1 className="page-title">
                                Cześć, {displayName}!
                            </h1>
                            <p className="page-subtitle">
                                {stats.currentStreak > 0
                                    ? `Masz ${stats.currentStreak}-dniową passę nauki. Tak trzymaj!`
                                    : 'Rozpocznij naukę, aby zbudować swoją passę!'
                                }
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <section>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Knowledge Points */}
                                <Card variant="clean" padding="md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-amber-400" />
                                        </div>
                                        {stats.knowledgeEquity > 0 && (
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                                                +12%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight mb-1">
                                        {stats.knowledgeEquity.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">Punkty wiedzy</p>
                                </Card>

                                {/* Exams Completed */}
                                <Card variant="clean" padding="md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Target className="w-5 h-5 text-blue-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight mb-1">
                                        {stats.examsCompleted}
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">Ukończone egzaminy</p>
                                </Card>

                                {/* Accuracy */}
                                <Card variant="clean" padding="md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        {accuracy >= 70 && (
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                                                Dobra!
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight mb-1">
                                        {accuracy}%
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">Dokładność</p>
                                </Card>

                                {/* Streak */}
                                <Card variant="clean" padding="md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <Flame className="w-5 h-5 text-orange-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold tracking-tight mb-1">
                                        {stats.currentStreak} dni
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">Seria nauki</p>
                                </Card>
                            </div>
                        </section>

                        {/* Main Content Grid */}
                        <section className="grid lg:grid-cols-2 gap-6">
                            {/* Performance Chart / Empty State */}
                            {stats.knowledgeEquity > 0 ? (
                                <PerformanceChart data={performanceHistory} target={15000} />
                            ) : (
                                <Card variant="highlight" padding="lg">
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-gold)]/10 flex items-center justify-center mb-4">
                                            <Zap className="w-8 h-8 text-[var(--accent-gold)]" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Zacznij swoją przygodę!</h3>
                                        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-xs">
                                            Odpowiadaj na pytania egzaminacyjne i śledź swoje postępy w nauce prawa.
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            rightIcon={<ArrowRight className="w-4 h-4" />}
                                            onClick={() => router.push('/exam')}
                                        >
                                            Rozpocznij egzamin
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card variant="default" padding="md">
                                <div className="section-header">
                                    <Zap className="w-5 h-5 text-[var(--accent-gold)]" />
                                    <h3 className="section-title">Szybkie akcje</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/flashcards"
                                        className="group p-4 bg-[var(--bg-hover)] hover:bg-[var(--accent-gold)]/5 border border-[var(--border-color)] hover:border-[var(--accent-gold)]/30 rounded-xl transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <BookOpen className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="font-medium block mb-0.5">Fiszki</span>
                                        <p className="text-xs text-[var(--text-muted)]">Ucz się z fiszek</p>
                                    </Link>
                                    <Link
                                        href="/exam"
                                        className="group p-4 bg-[var(--bg-hover)] hover:bg-[var(--accent-gold)]/5 border border-[var(--border-color)] hover:border-[var(--accent-gold)]/30 rounded-xl transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Target className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="font-medium block mb-0.5">Egzaminy</span>
                                        <p className="text-xs text-[var(--text-muted)]">Test wiedzy</p>
                                    </Link>
                                    <Link
                                        href="/ai"
                                        className="group p-4 bg-[var(--bg-hover)] hover:bg-[var(--accent-gold)]/5 border border-[var(--border-color)] hover:border-[var(--accent-gold)]/30 rounded-xl transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Brain className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <span className="font-medium block mb-0.5">AI Asystent</span>
                                        <p className="text-xs text-[var(--text-muted)]">Zapytaj o prawo</p>
                                    </Link>
                                    <Link
                                        href="/leaderboard"
                                        className="group p-4 bg-[var(--bg-hover)] hover:bg-[var(--accent-gold)]/5 border border-[var(--border-color)] hover:border-[var(--accent-gold)]/30 rounded-xl transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                            <Trophy className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <span className="font-medium block mb-0.5">Ranking</span>
                                        <p className="text-xs text-[var(--text-muted)]">Zobacz pozycję</p>
                                    </Link>
                                </div>
                            </Card>
                        </section>

                        {/* Progress Section */}
                        <section>
                            <Card variant="default" padding="md">
                                <div className="section-header">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <h3 className="section-title">Twoje postępy</h3>
                                </div>
                                <div className="space-y-5">
                                    {/* Questions Goal */}
                                    <div className="progress-container" style={{ marginBottom: 0 }}>
                                        <div className="progress-header">
                                            <span className="progress-label">Pytania dzisiaj</span>
                                            <span className="progress-value">{stats.totalQuestions} / 20</span>
                                        </div>
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill progress-fill-primary"
                                                style={{ width: `${Math.min(100, (stats.totalQuestions / 20) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Accuracy Goal */}
                                    <div className="progress-container" style={{ marginBottom: 0 }}>
                                        <div className="progress-header">
                                            <span className="progress-label">Cel dokładności 80%</span>
                                            <span className={`progress-value ${accuracy >= 80 ? 'text-emerald-400' : ''}`}>
                                                {accuracy}% {accuracy >= 80 && '✓'}
                                            </span>
                                        </div>
                                        <div className="progress-track">
                                            <div
                                                className={`progress-fill ${accuracy >= 80 ? 'progress-fill-success' : 'bg-amber-500'}`}
                                                style={{ width: `${Math.min(100, (accuracy / 80) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Points Goal */}
                                    <div className="progress-container" style={{ marginBottom: 0 }}>
                                        <div className="progress-header">
                                            <span className="progress-label">Cel: 10,000 punktów</span>
                                            <span className="progress-value">{stats.knowledgeEquity.toLocaleString()} pkt</span>
                                        </div>
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill progress-fill-success"
                                                style={{ width: `${Math.min(100, (stats.knowledgeEquity / 10000) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* AI Behavior Analysis */}
                        <section>
                            <div className="grid lg:grid-cols-3 gap-6">
                                <BehaviorInsights maxItems={4} />
                                <BehaviorRecommendations maxItems={3} />
                                <BehaviorPredictionsWidget showTimeToMastery={true} />
                            </div>
                        </section>

                        {/* Best Exam Score */}
                        {stats.bestExamScore > 0 && (
                            <section>
                                <Card
                                    variant="highlight"
                                    padding="md"
                                    className="bg-gradient-to-r from-amber-500/5 to-orange-500/5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                            <Trophy className="w-7 h-7 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--text-muted)] mb-1">Najlepszy wynik egzaminu</p>
                                            <p className="text-3xl font-bold text-amber-400">{stats.bestExamScore}%</p>
                                        </div>
                                    </div>
                                </Card>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="dashboard" onNavigate={() => { }} />

            {/* Agent Debug Panel - visible in dev mode */}
            <AgentDebugPanel position="bottom-right" />
        </div>
    );
}
