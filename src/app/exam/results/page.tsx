'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ClipboardList, Clock, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { useUserData } from '@/hooks/use-user-data';
import { getUserExamResults } from '@/lib/services/user-service';
import { isSupabaseAvailable } from '@/lib/supabase';
import Link from 'next/link';

interface ExamResult {
    examId: string;
    examTitle: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent?: number;
}

export default function ExamResultsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);

    const { user, profile, loading: authLoading } = useAuth();
    const { getTestHistory } = useUserData();
    const stats = profile?.stats;

    // Load exam results - try Supabase first, fallback to Firebase
    const loadResults = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let loadedResults: ExamResult[] = [];

            // Try Supabase first
            if (isSupabaseAvailable()) {
                const supabaseHistory = await getTestHistory(20);
                loadedResults = supabaseHistory.map(h => ({
                    examId: h.examId,
                    examTitle: h.examTitle,
                    score: h.score,
                    passed: h.passed,
                    totalQuestions: h.totalQuestions,
                    correctAnswers: h.correctAnswers,
                    timeSpent: h.timeSpent,
                }));
            }

            // If no Supabase results, try Firebase
            if (loadedResults.length === 0) {
                const firebaseHistory = await getUserExamResults(user.uid, 20);
                loadedResults = firebaseHistory.map(h => ({
                    examId: h.examId,
                    examTitle: h.examTitle,
                    score: h.score,
                    passed: h.passed,
                    totalQuestions: h.totalQuestions,
                    correctAnswers: h.correctAnswers,
                    timeSpent: h.timeSpent,
                }));
            }

            setResults(loadedResults);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    }, [user, getTestHistory]);

    useEffect(() => {
        loadResults();
    }, [loadResults]);

    const filteredResults = results.filter(r => {
        if (filter === 'passed') return r.passed;
        if (filter === 'failed') return !r.passed;
        return true;
    });

    const computedStats = {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        avgScore: results.length > 0
            ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
            : 0,
        totalTime: results.reduce((a, b) => a + (b.timeSpent || 0), 0),
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="exam-results"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: stats?.currentStreak || 0, knowledgeEquity: stats?.knowledgeEquity || 0 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="exam-results"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <ClipboardList className="text-[#1a365d]" />
                                Historia Egzaminów
                            </h1>
                            <p className="text-[var(--text-muted)]">Twoje poprzednie wyniki</p>
                        </div>

                        {results.length === 0 ? (
                            /* Empty State */
                            <div className="lex-card py-16 text-center">
                                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl" style={{ background: '#1a365d15' }}>
                                    📋
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Brak wyników</h2>
                                <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                                    Nie masz jeszcze żadnych wyników egzaminów. Rozwiąż swój pierwszy egzamin!
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
                            <>
                                {/* Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lex-card text-center">
                                        <p className="text-3xl font-bold">{computedStats.total}</p>
                                        <p className="text-sm text-[var(--text-muted)]">Egzaminów</p>
                                    </div>
                                    <div className="lex-card text-center">
                                        <p className="text-3xl font-bold text-green-400">{computedStats.passed}</p>
                                        <p className="text-sm text-[var(--text-muted)]">Zaliczonych</p>
                                    </div>
                                    <div className="lex-card text-center">
                                        <p className="text-3xl font-bold">{computedStats.avgScore}%</p>
                                        <p className="text-sm text-[var(--text-muted)]">Średni wynik</p>
                                    </div>
                                    <div className="lex-card text-center">
                                        <p className="text-3xl font-bold">{Math.round(computedStats.totalTime / 60)}h</p>
                                        <p className="text-sm text-[var(--text-muted)]">Łączny czas</p>
                                    </div>
                                </div>

                                {/* Filter */}
                                <div className="flex gap-2">
                                    {(['all', 'passed', 'failed'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={cn(
                                                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                                filter === f
                                                    ? 'bg-[#1a365d] text-white'
                                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white'
                                            )}
                                        >
                                            {f === 'all' && 'Wszystkie'}
                                            {f === 'passed' && 'Zaliczone'}
                                            {f === 'failed' && 'Niezaliczone'}
                                        </button>
                                    ))}
                                </div>

                                {/* Results List */}
                                <div className="grid lg:grid-cols-2 gap-4">
                                    {filteredResults.map((result, idx) => (
                                        <div
                                            key={`${result.examId}-${idx}`}
                                            onClick={() => setSelectedResult(result)}
                                            className={cn(
                                                'lex-card cursor-pointer transition-all',
                                                selectedResult?.examId === result.examId && 'border-[#1a365d]'
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold">{result.examTitle}</h3>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        {result.totalQuestions} pytań
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                                    result.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                                                )}>
                                                    {result.passed ? (
                                                        <CheckCircle size={20} className="text-green-400" />
                                                    ) : (
                                                        <XCircle size={20} className="text-red-400" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={cn(
                                                    'text-3xl font-bold',
                                                    result.score >= 80 && 'text-green-400',
                                                    result.score >= 60 && result.score < 80 && 'text-yellow-400',
                                                    result.score < 60 && 'text-red-400'
                                                )}>
                                                    {result.score}%
                                                </div>
                                                <div className="flex-1 h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            result.score >= 80 && 'bg-gradient-to-r from-green-600 to-green-400',
                                                            result.score >= 60 && result.score < 80 && 'bg-gradient-to-r from-yellow-600 to-yellow-400',
                                                            result.score < 60 && 'bg-gradient-to-r from-red-600 to-red-400'
                                                        )}
                                                        style={{ width: `${result.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-sm text-[var(--text-muted)]">
                                                <span>{result.correctAnswers}/{result.totalQuestions} poprawnych</span>
                                                {result.timeSpent && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {Math.round(result.timeSpent / 60)} min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="exam" onNavigate={() => { }} />
        </div>
    );
}
