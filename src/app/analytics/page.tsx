'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import {
    BarChart3, TrendingUp, Target, Clock,
    BookOpen, Brain, Loader2, Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { profile, loading: authLoading } = useAuth();

    const stats = profile?.stats;

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
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <BarChart3 style={{ color: '#1a365d' }} />
                                Analityka
                            </h1>
                            <p className="text-[var(--text-muted)]">Szczegółowe statystyki Twojej nauki</p>
                        </div>

                        {/* KPI Summary - Real data */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26, 54, 93, 0.1)' }}>
                                        <BookOpen size={20} style={{ color: '#1a365d' }} />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Pytań rozwiązanych</span>
                                </div>
                                <p className="text-3xl font-bold">{stats?.totalQuestions?.toLocaleString() || 0}</p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                                        <Target size={20} style={{ color: '#059669' }} />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Dokładność</span>
                                </div>
                                <p className="text-3xl font-bold">{accuracy}%</p>
                                <p className="text-sm mt-1" style={{ color: '#059669' }}>
                                    {stats?.correctAnswers || 0} poprawnych
                                </p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                                        <Clock size={20} style={{ color: '#2563eb' }} />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Czas nauki</span>
                                </div>
                                <p className="text-3xl font-bold">{studyTimeHours}h</p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                                        <Brain size={20} style={{ color: '#ea580c' }} />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Zdawalność egzaminów</span>
                                </div>
                                <p className="text-3xl font-bold">{passRate}%</p>
                                <p className="text-sm mt-1 text-[var(--text-muted)]">
                                    {stats?.examsPassed || 0}/{stats?.examsCompleted || 0} zdanych
                                </p>
                            </div>
                        </div>

                        {/* Streak & Exam Stats - Compact Row */}
                        <div className="lex-card">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Streak */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                                        🔥
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                                        <p className="text-sm text-[var(--text-muted)]">dni z rzędu</p>
                                    </div>
                                </div>

                                {/* Longest Streak */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(184, 134, 11, 0.1)' }}>
                                        ⭐
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.longestStreak || 0}</p>
                                        <p className="text-sm text-[var(--text-muted)]">najdłuższa seria</p>
                                    </div>
                                </div>

                                {/* Exams Passed */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                                        ✅
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.examsPassed || 0}/{stats?.examsCompleted || 0}</p>
                                        <p className="text-sm text-[var(--text-muted)]">zdanych egzaminów</p>
                                    </div>
                                </div>

                                {/* Best Score */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                                        🏆
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.bestExamScore || 0}%</p>
                                        <p className="text-sm text-[var(--text-muted)]">najlepszy wynik</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Punkty wiedzy Progress */}
                        <div className="lex-card">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <TrendingUp style={{ color: '#1a365d' }} />
                                Punkty wiedzy
                            </h3>
                            <div className="text-center py-8">
                                <p className="text-5xl font-bold mb-2" style={{ color: '#059669' }}>
                                    {stats?.knowledgeEquity?.toLocaleString() || 0} pkt
                                </p>
                                <p className="text-[var(--text-muted)]">
                                    Wartość Twojej wiedzy prawniczej
                                </p>
                                <div className="mt-6 max-w-md mx-auto">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-muted)]">Postęp do 50,000 pkt</span>
                                        <span className="font-medium">{Math.min(100, Math.round((stats?.knowledgeEquity || 0) / 500))}%</span>
                                    </div>
                                    <div className="h-3 rounded-full" style={{ background: 'var(--bg-hover)' }}>
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(100, Math.round((stats?.knowledgeEquity || 0) / 500))}%`,
                                                background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="analytics" onNavigate={() => { }} />
        </div>
    );
}
