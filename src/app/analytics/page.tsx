'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { BarChart3, TrendingUp, Target, Clock, BookOpen, Loader2, Play, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { profile, loading: authLoading } = useAuth();

    const stats = profile?.stats;
    const hasData = stats && stats.totalQuestions > 0;

    // Calculate real accuracy
    const accuracy = useMemo(() => {
        if (!stats || stats.totalQuestions === 0) return 0;
        return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
    }, [stats]);

    // Calculate study time in hours
    const studyTimeHours = useMemo(() => {
        if (!stats?.totalStudyTime) return 0;
        return (stats.totalStudyTime / 60).toFixed(1);
    }, [stats]);

    // Exam pass rate
    const passRate = useMemo(() => {
        if (!stats || stats.examsCompleted === 0) return 0;
        return Math.round((stats.examsPassed / stats.examsCompleted) * 100);
    }, [stats]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="analytics"
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
                        rank: 0
                    }}
                    currentView="analytics"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#1a365d' }}>
                                <BarChart3 size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Statystyki</h1>
                            <p className="text-[var(--text-muted)]">
                                {hasData ? 'Twoje postępy w nauce' : 'Zacznij naukę, żeby zobaczyć statystyki'}
                            </p>
                        </div>

                        {!hasData ? (
                            /* Empty State */
                            <div className="lex-card py-16 text-center">
                                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl" style={{ background: '#1a365d15' }}>
                                    📊
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Brak danych</h2>
                                <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                                    Ukończ swój pierwszy egzamin lub sesję nauki, aby zobaczyć szczegółowe statystyki postępu.
                                </p>
                                <Link
                                    href="/exam"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                                    style={{ background: '#1a365d' }}
                                >
                                    <Play size={20} />
                                    Rozpocznij egzamin
                                </Link>
                            </div>
                        ) : (
                            /* Stats Content */
                            <>
                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lex-card text-center py-6">
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#1a365d15' }}>
                                            <BookOpen size={24} style={{ color: '#1a365d' }} />
                                        </div>
                                        <p className="text-3xl font-bold">{stats?.totalQuestions?.toLocaleString() || 0}</p>
                                        <p className="text-sm text-[var(--text-muted)]">pytań</p>
                                    </div>

                                    <div className="lex-card text-center py-6">
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#05966915' }}>
                                            <Target size={24} style={{ color: '#059669' }} />
                                        </div>
                                        <p className="text-3xl font-bold">{accuracy}%</p>
                                        <p className="text-sm text-[var(--text-muted)]">dokładność</p>
                                    </div>

                                    <div className="lex-card text-center py-6">
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#2563eb15' }}>
                                            <Clock size={24} style={{ color: '#2563eb' }} />
                                        </div>
                                        <p className="text-3xl font-bold">{studyTimeHours}h</p>
                                        <p className="text-sm text-[var(--text-muted)]">czas nauki</p>
                                    </div>

                                    <div className="lex-card text-center py-6">
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#ea580c15' }}>
                                            <Trophy size={24} style={{ color: '#ea580c' }} />
                                        </div>
                                        <p className="text-3xl font-bold">{passRate}%</p>
                                        <p className="text-sm text-[var(--text-muted)]">zdawalność</p>
                                    </div>
                                </div>

                                {/* Streak & Knowledge */}
                                <div className="grid lg:grid-cols-2 gap-4">
                                    <div className="lex-card">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#ea580c15' }}>
                                                🔥
                                            </div>
                                            <div>
                                                <p className="text-4xl font-bold">{stats?.currentStreak || 0}</p>
                                                <p className="text-[var(--text-muted)]">dni serii</p>
                                            </div>
                                            {stats?.longestStreak && stats.longestStreak > 0 && (
                                                <div className="ml-auto text-right">
                                                    <p className="text-sm text-[var(--text-muted)]">rekord</p>
                                                    <p className="font-bold">{stats.longestStreak} dni</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lex-card">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#05966915' }}>
                                                💎
                                            </div>
                                            <div>
                                                <p className="text-4xl font-bold" style={{ color: '#059669' }}>
                                                    {stats?.knowledgeEquity?.toLocaleString() || 0}
                                                </p>
                                                <p className="text-[var(--text-muted)]">punktów wiedzy</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Exams Summary */}
                                {stats?.examsCompleted && stats.examsCompleted > 0 && (
                                    <div className="lex-card">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <TrendingUp size={20} style={{ color: '#1a365d' }} />
                                            Egzaminy
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold">{stats.examsCompleted}</p>
                                                <p className="text-sm text-[var(--text-muted)]">ukończonych</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-green-500">{stats.examsPassed}</p>
                                                <p className="text-sm text-[var(--text-muted)]">zdanych</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{stats.bestExamScore || 0}%</p>
                                                <p className="text-sm text-[var(--text-muted)]">najlepszy wynik</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="analytics" onNavigate={() => { }} />
        </div>
    );
}
