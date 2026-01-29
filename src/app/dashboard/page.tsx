'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, MobileNav } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { getLeaderboard, LeaderboardEntry } from '@/lib/services/user-service';
import { Loader2, BookOpen, Target, Brain, ChevronRight, Flame, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { DEFAULT_USER_STATS } from '@/lib/types/user';
import Link from 'next/link';

export default function DashboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, profile, loading, profileLoading } = useAuth();
    const router = useRouter();

    // Redirect to landing if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Use profile stats or defaults
    const stats = profile?.stats || DEFAULT_USER_STATS;
    const displayName = profile?.displayName || user?.displayName || 'Student';

    // Calculate exam readiness based on real stats
    const examReadiness = Math.min(100, Math.round(
        (stats.knowledgeEquity / 5000) * 30 +
        (stats.currentStreak * 2) +
        ((stats.correctAnswers / Math.max(1, stats.totalQuestions)) * 40) +
        (stats.examsCompleted * 3)
    ));

    // Calculate accuracy from real data
    const accuracy = stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;

    // Get current date in Polish
    const today = new Date();
    const dateStr = today.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Loading state
    if (loading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500">Ładowanie...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* Existing Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: stats.currentStreak, knowledgeEquity: stats.knowledgeEquity }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar - Apple Style */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                                Dashboard
                            </h1>
                            <p className="text-sm text-gray-500">Witaj z powrotem! Kontynuuj naukę 🎓</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {stats.currentStreak > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium">
                                    <Flame size={16} />
                                    <span>{stats.currentStreak} dni</span>
                                </div>
                            )}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Dashboard Content */}
                <main className="flex-1 overflow-auto p-6 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Greeting */}
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-1">
                                Cześć, {displayName}! 👋
                            </h2>
                            <p className="text-gray-500 capitalize">
                                {stats.currentStreak > 0
                                    ? `Świetnie! Masz ${stats.currentStreak}-dniową passę. Kontynuuj naukę!`
                                    : dateStr
                                }
                            </p>
                        </div>

                        {/* KPI Cards - Real Data */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <span className="text-xl">💰</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.knowledgeEquity.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Punkty wiedzy</p>
                                {stats.knowledgeEquity > 0 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                        <TrendingUp size={12} />
                                        <span>+12%</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <span className="text-xl">📋</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.examsCompleted}</p>
                                <p className="text-sm text-gray-500">Ukończone Egzaminy</p>
                                {stats.examsPassed > 0 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                        <CheckCircle2 size={12} />
                                        <span>{stats.examsPassed} zdanych</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                        <span className="text-xl">🎯</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
                                <p className="text-sm text-gray-500">Dokładność</p>
                                {accuracy >= 80 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                        <TrendingUp size={12} />
                                        <span>Cel osiągnięty</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <span className="text-xl">🔥</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} dni</p>
                                <p className="text-sm text-gray-500">Seria nauki</p>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Left Column - Progress */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Twój postęp</h3>

                                    {/* Progress Ring */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative w-36 h-36">
                                            <svg className="w-36 h-36 transform -rotate-90">
                                                <circle
                                                    cx="72"
                                                    cy="72"
                                                    r="64"
                                                    stroke="#E5E7EB"
                                                    strokeWidth="10"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="72"
                                                    cy="72"
                                                    r="64"
                                                    stroke="url(#progressGradient)"
                                                    strokeWidth="10"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={2 * Math.PI * 64}
                                                    strokeDashoffset={2 * Math.PI * 64 * (1 - examReadiness / 100)}
                                                    className="transition-all duration-1000"
                                                />
                                                <defs>
                                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#3B82F6" />
                                                        <stop offset="100%" stopColor="#60A5FA" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-gray-900">{examReadiness}%</span>
                                                <span className="text-xs text-gray-400">gotowość</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bars */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Pytania dzisiaj</span>
                                                <span className="font-medium text-gray-900">{stats.totalQuestions} / 20</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (stats.totalQuestions / 20) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Cel dokładności 80%</span>
                                                <span className="font-medium" style={{ color: accuracy >= 80 ? '#059669' : '#374151' }}>
                                                    {accuracy}% {accuracy >= 80 && '✓'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(100, (accuracy / 80) * 100)}%`,
                                                        background: accuracy >= 80 ? '#059669' : '#f59e0b'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Quick Actions */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Szybkie akcje</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Link
                                            href="/flashcards"
                                            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-200"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <BookOpen size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Fiszki</p>
                                                <p className="text-sm text-gray-500">Ucz się z fiszek</p>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/exam"
                                            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group border border-transparent hover:border-purple-200"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Target size={24} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Egzaminy</p>
                                                <p className="text-sm text-gray-500">Test wiedzy</p>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/ai"
                                            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group border border-transparent hover:border-green-200"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                <Brain size={24} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">AI Asystent</p>
                                                <p className="text-sm text-gray-500">Zapytaj o prawo</p>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/leaderboard"
                                            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors group border border-transparent hover:border-amber-200"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <BarChart3 size={24} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Ranking</p>
                                                <p className="text-sm text-gray-500">Zobacz pozycję</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Best Score Banner */}
                                {stats.bestExamScore > 0 && (
                                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">🏆</div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Najlepszy wynik egzaminu</p>
                                                <p className="text-2xl font-bold text-amber-600">{stats.bestExamScore}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main CTA */}
                        <div className="mt-8 text-center">
                            <Link
                                href="/immersive-study"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-full shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                            >
                                <span>Rozpocznij naukę</span>
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNav currentView="dashboard" onNavigate={() => { }} />
        </div>
    );
}
