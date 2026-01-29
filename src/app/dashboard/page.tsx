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
    BookOpen, Brain, Target, Loader2, Trophy,
    TrendingUp, Flame, Award, ArrowRight, Zap,
    GraduationCap, Sparkles, BarChart3, CheckCircle2
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
    const firstName = displayName.split(' ')[0];

    // Calculate accuracy percentage
    const accuracy = stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;

    // Generate performance history
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
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Welcome Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Cześć, {firstName}!
                                <span className="ml-2 inline-block animate-pulse">👋</span>
                            </h1>
                            <p className="text-[var(--text-muted)] text-base">
                                {stats.currentStreak > 0
                                    ? `Świetnie! Masz ${stats.currentStreak}-dniową passę. Kontynuuj naukę!`
                                    : 'Rozpocznij naukę i zbuduj swoją passę!'
                                }
                            </p>
                        </div>

                        {/* Stats Cards - Redesigned */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Knowledge Points */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20 rounded-2xl p-5 transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                        <GraduationCap className="w-6 h-6 text-white" />
                                    </div>
                                    {stats.knowledgeEquity > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                                            <TrendingUp className="w-3 h-3" />
                                            +12%
                                        </span>
                                    )}
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-white mb-1">
                                    {stats.knowledgeEquity.toLocaleString()}
                                </p>
                                <p className="text-sm text-violet-300/70 font-medium">Punkty wiedzy</p>
                            </div>

                            {/* Exams Completed */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 rounded-2xl p-5 transition-all hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    {stats.examsCompleted > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400">
                                            <CheckCircle2 className="w-3 h-3" />
                                            +{stats.examsCompleted}
                                        </span>
                                    )}
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-white mb-1">
                                    {stats.examsCompleted}
                                </p>
                                <p className="text-sm text-cyan-300/70 font-medium">Ukończone Egzaminy</p>
                            </div>

                            {/* Accuracy */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 rounded-2xl p-5 transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    {accuracy >= 70 ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                                            Dobra!
                                        </span>
                                    ) : accuracy > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
                                            ~ {accuracy}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-white mb-1">
                                    {accuracy}%
                                </p>
                                <p className="text-sm text-emerald-300/70 font-medium">Dokładność</p>
                            </div>

                            {/* Streak */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-600/5 border border-orange-500/20 rounded-2xl p-5 transition-all hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <Flame className="w-6 h-6 text-white" />
                                    </div>
                                    {stats.currentStreak > 0 && (
                                        <span className="text-2xl">🔥</span>
                                    )}
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-white mb-1">
                                    {stats.currentStreak} {stats.currentStreak === 1 ? 'dzień' : 'dni'}
                                </p>
                                <p className="text-sm text-orange-300/70 font-medium">Seria nauki</p>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-5 gap-6">
                            {/* Performance Chart - Takes 3 cols */}
                            <div className="lg:col-span-3">
                                {stats.knowledgeEquity > 0 ? (
                                    <PerformanceChart data={performanceHistory} target={15000} />
                                ) : (
                                    <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                                            <Sparkles className="w-10 h-10 text-[#1a1a1a]" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">Zacznij swoją przygodę!</h3>
                                        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm">
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
                                )}
                            </div>

                            {/* Quick Actions - Takes 2 cols */}
                            <div className="lg:col-span-2">
                                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 h-full">
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Szybkie akcje</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Flashcards */}
                                        <Link
                                            href="/flashcards"
                                            className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-500/5 to-blue-600/10 hover:from-blue-500/10 hover:to-blue-600/15 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold block text-blue-100 mb-0.5">Fiszki</span>
                                            <p className="text-xs text-blue-300/60">Ucz się z fiszek</p>
                                        </Link>

                                        {/* Exams */}
                                        <Link
                                            href="/exam"
                                            className="group relative overflow-hidden p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 hover:from-emerald-500/10 hover:to-emerald-600/15 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold block text-emerald-100 mb-0.5">Egzaminy</span>
                                            <p className="text-xs text-emerald-300/60">Test wiedzy</p>
                                        </Link>

                                        {/* AI Assistant */}
                                        <Link
                                            href="/ai"
                                            className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-500/5 to-purple-600/10 hover:from-purple-500/10 hover:to-purple-600/15 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                                <Brain className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold block text-purple-100 mb-0.5">AI Asystent</span>
                                            <p className="text-xs text-purple-300/60">Zapytaj o prawo</p>
                                        </Link>

                                        {/* Leaderboard */}
                                        <Link
                                            href="/leaderboard"
                                            className="group relative overflow-hidden p-4 bg-gradient-to-br from-amber-500/5 to-orange-600/10 hover:from-amber-500/10 hover:to-orange-600/15 border border-amber-500/20 hover:border-amber-500/40 rounded-xl transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold block text-amber-100 mb-0.5">Ranking</span>
                                            <p className="text-xs text-amber-300/60">Zobacz pozycję</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section - Full Width */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h3 className="font-semibold text-lg">Twoje postępy</h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Questions Goal */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[var(--text-muted)]">Pytania dzisiaj</span>
                                        <span className="text-sm font-semibold">{Math.min(stats.totalQuestions, 50)} / 20</span>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                                            style={{ width: `${Math.min(100, (stats.totalQuestions / 20) * 100)}%` }}
                                        />
                                    </div>
                                    {stats.totalQuestions >= 20 && (
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Cel osiągnięty!
                                        </p>
                                    )}
                                </div>

                                {/* Accuracy Goal */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[var(--text-muted)]">Cel dokładności 80%</span>
                                        <span className={`text-sm font-semibold ${accuracy >= 80 ? 'text-emerald-400' : ''}`}>
                                            {accuracy}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${accuracy >= 80
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                                            style={{ width: `${Math.min(100, (accuracy / 80) * 100)}%` }}
                                        />
                                    </div>
                                    {accuracy >= 80 && (
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Cel osiągnięty!
                                        </p>
                                    )}
                                </div>

                                {/* Points Goal */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-[var(--text-muted)]">Cel: 10,000 punktów</span>
                                        <span className="text-sm font-semibold">{stats.knowledgeEquity.toLocaleString()} pkt</span>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                                            style={{ width: `${Math.min(100, (stats.knowledgeEquity / 10000) * 100)}%` }}
                                        />
                                    </div>
                                    {stats.knowledgeEquity >= 10000 && (
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Cel osiągnięty!
                                        </p>
                                    )}
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
                            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-300/70 mb-1">Najlepszy wynik egzaminu</p>
                                        <p className="text-4xl font-bold text-amber-400">{stats.bestExamScore}%</p>
                                    </div>
                                </div>
                            </div>
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
