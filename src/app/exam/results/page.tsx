'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ClipboardList, Clock, CheckCircle, XCircle, BarChart3, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Mock exam results
const EXAM_RESULTS = [
    {
        id: '1',
        name: 'Prawo Cywilne - Część Ogólna',
        date: '2026-01-05',
        score: 92,
        passed: true,
        totalQuestions: 50,
        correctAnswers: 46,
        timeSpent: 58,
        domains: [
            { name: 'Podmioty prawa', score: 95 },
            { name: 'Czynności prawne', score: 88 },
            { name: 'Przedawnienie', score: 92 },
        ],
    },
    {
        id: '2',
        name: 'Prawo Karne - Materialne',
        date: '2026-01-02',
        score: 78,
        passed: true,
        totalQuestions: 40,
        correctAnswers: 31,
        timeSpent: 45,
        domains: [
            { name: 'Zasady odpowiedzialności', score: 82 },
            { name: 'Kontratypy', score: 70 },
            { name: 'Kary i środki karne', score: 80 },
        ],
    },
    {
        id: '3',
        name: 'Procedura Cywilna',
        date: '2025-12-28',
        score: 65,
        passed: false,
        totalQuestions: 60,
        correctAnswers: 39,
        timeSpent: 72,
        domains: [
            { name: 'Właściwość sądu', score: 70 },
            { name: 'Postępowanie', score: 55 },
            { name: 'Środki odwoławcze', score: 68 },
        ],
    },
    {
        id: '4',
        name: 'Prawo Handlowe - Spółki',
        date: '2025-12-20',
        score: 88,
        passed: true,
        totalQuestions: 45,
        correctAnswers: 40,
        timeSpent: 52,
        domains: [
            { name: 'Spółki osobowe', score: 92 },
            { name: 'Spółka z o.o.', score: 85 },
            { name: 'Spółka akcyjna', score: 88 },
        ],
    },
];

export default function ExamResultsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedResult, setSelectedResult] = useState<typeof EXAM_RESULTS[0] | null>(null);
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

    const filteredResults = EXAM_RESULTS.filter(r => {
        if (filter === 'passed') return r.passed;
        if (filter === 'failed') return !r.passed;
        return true;
    });

    const stats = {
        total: EXAM_RESULTS.length,
        passed: EXAM_RESULTS.filter(r => r.passed).length,
        avgScore: Math.round(EXAM_RESULTS.reduce((a, b) => a + b.score, 0) / EXAM_RESULTS.length),
        totalTime: EXAM_RESULTS.reduce((a, b) => a + b.timeSpent, 0),
    };

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="exam-results"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="exam-results"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <ClipboardList className="text-#1a365d" />
                                Historia Egzaminów
                            </h1>
                            <p className="text-[var(--text-muted)]">Twoje poprzednie wyniki</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card text-center">
                                <p className="text-3xl font-bold">{stats.total}</p>
                                <p className="text-sm text-[var(--text-muted)]">Egzaminów</p>
                            </div>
                            <div className="lex-card text-center">
                                <p className="text-3xl font-bold text-green-400">{stats.passed}</p>
                                <p className="text-sm text-[var(--text-muted)]">Zaliczonych</p>
                            </div>
                            <div className="lex-card text-center">
                                <p className="text-3xl font-bold">{stats.avgScore}%</p>
                                <p className="text-sm text-[var(--text-muted)]">Średni wynik</p>
                            </div>
                            <div className="lex-card text-center">
                                <p className="text-3xl font-bold">{Math.round(stats.totalTime / 60)}h</p>
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
                                            ? 'bg-#1a365d text-white'
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
                            {filteredResults.map(result => (
                                <div
                                    key={result.id}
                                    onClick={() => setSelectedResult(result)}
                                    className={cn(
                                        'lex-card cursor-pointer transition-all',
                                        selectedResult?.id === result.id && 'border-#1a365d'
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold">{result.name}</h3>
                                            <p className="text-sm text-[var(--text-muted)]">{result.date}</p>
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
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {result.timeSpent} min
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detail Panel */}
                        {selectedResult && (
                            <div className="lex-card animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Szczegóły: {selectedResult.name}</h3>
                                    <button
                                        onClick={() => setSelectedResult(null)}
                                        className="text-[var(--text-muted)] hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6">
                                    {selectedResult.domains.map((domain, i) => (
                                        <div key={i} className="p-4 bg-[var(--bg-hover)] rounded-xl">
                                            <p className="font-medium mb-2">{domain.name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            domain.score >= 80 && 'bg-green-500',
                                                            domain.score >= 60 && domain.score < 80 && 'bg-yellow-500',
                                                            domain.score < 60 && 'bg-red-500'
                                                        )}
                                                        style={{ width: `${domain.score}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold">{domain.score}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="exam" onNavigate={() => { }} />
        </div>
    );
}
