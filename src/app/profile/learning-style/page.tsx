'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import {
    Brain,
    Target,
    TrendingUp,
    AlertTriangle,
    Loader2,
    BookOpen,
    Clock,
    Zap,
    BarChart3,
    Lightbulb,
    RefreshCw
} from 'lucide-react';
import { useStudentProfile } from '@/hooks/use-student-profile';

// Default profile for new users (fallback)
const DEFAULT_PROFILE = {
    predictions: {
        predictedExamScore: { value: 50, confidence: 0, range: { min: 30, max: 70 } },
        passProbability: 0.5,
        recommendedFocus: [] as Array<{ topic: string; reason: string; priority: number }>
    },
    knowledgeMap: {} as Record<string, { mastery: number; trend: string; totalAttempts: number }>,
    errorPatterns: {
        dominantErrorType: 'conceptual',
        errorTypeDistribution: {
            careless: 0,
            conceptual: 0,
            knowledge_gap: 0,
            confusion: 0,
            partial: 0
        },
        confusionPairs: [] as Array<{ concept1: string; concept2: string; frequency: number }>
    },
    learningStyle: {
        cognitiveStyle: {
            analyticalVsIntuitive: 0,
            sequentialVsGlobal: 0,
            activeVsReflective: 0
        },
        optimalConditions: {
            bestTimeOfDay: 'morning' as const,
            optimalSessionLength: 25,
            optimalQuestionCount: 15
        },
        solvingStrategies: {
            usesElimination: 0.5,
            readsCarefully: 0.5,
            rushes: 0.5,
            usesHints: 0.5
        }
    },
    engagement: {
        currentStreak: 0,
        longestStreak: 0,
        motivationLevel: 50
    }
};

export default function LearningStylePage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { profile, loading, error, stats, refresh } = useStudentProfile();

    // Use real profile or fallback to default
    const studentProfile = profile ? {
        predictions: profile.predictions || DEFAULT_PROFILE.predictions,
        knowledgeMap: profile.knowledgeMap || DEFAULT_PROFILE.knowledgeMap,
        errorPatterns: profile.errorPatterns || DEFAULT_PROFILE.errorPatterns,
        learningStyle: profile.learningStyle || DEFAULT_PROFILE.learningStyle,
        engagement: profile.engagement || DEFAULT_PROFILE.engagement
    } : DEFAULT_PROFILE;

    const hasData = stats && stats.totalAttempts > 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className="flex-1 flex flex-col min-h-screen">
                <Header
                    userStats={{ streak: studentProfile.engagement.currentStreak, knowledgeEquity: 0 }}
                    currentView="learning-style"
                />
                <MobileNav />

                <main className="flex-1 p-6 pb-24 md:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
                                <Brain size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Twój Profil Nauki</h1>
                                <p className="text-[var(--text-muted)]">
                                    Analiza oparta na Bayesian Knowledge Tracing
                                </p>
                            </div>
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Predicted Score */}
                            <div className="lex-card bg-gradient-to-br from-[#1a365d]/10 to-[#2563eb]/10 border-[#1a365d]/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[var(--text-muted)]">Przewidywany wynik</span>
                                    <Target size={20} className="text-[#1a365d]" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-[#1a365d]">
                                        {studentProfile.predictions.predictedExamScore.value.toFixed(0)}%
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] mb-1">
                                        ({studentProfile.predictions.predictedExamScore.range.min}-{studentProfile.predictions.predictedExamScore.range.max}%)
                                    </span>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-[var(--text-muted)]">Pewność: </span>
                                    <span className="font-medium">{(studentProfile.predictions.predictedExamScore.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            {/* Pass Probability */}
                            <div className="lex-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[var(--text-muted)]">Szansa zdania</span>
                                    <TrendingUp size={20} className="text-green-600" />
                                </div>
                                <div className="text-4xl font-bold text-green-600">
                                    {(studentProfile.predictions.passProbability * 100).toFixed(0)}%
                                </div>
                                <div className="mt-2 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                        style={{ width: `${studentProfile.predictions.passProbability * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Streak */}
                            <div className="lex-card bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[var(--text-muted)]">Seria dni</span>
                                    <Zap size={20} className="text-orange-500" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-orange-500">
                                        {studentProfile.engagement.currentStreak}
                                    </span>
                                    <span className="text-lg mb-1">🔥</span>
                                </div>
                                <div className="mt-2 text-sm text-[var(--text-muted)]">
                                    Najdłuższa: {studentProfile.engagement.longestStreak} dni
                                </div>
                            </div>
                        </div>

                        {/* Knowledge Map */}
                        <div className="lex-card">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen size={20} className="text-[#1a365d]" />
                                <h2 className="text-lg font-bold">Mapa Wiedzy</h2>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(studentProfile.knowledgeMap).map(([topic, data]) => (
                                    <div key={topic} className="flex items-center gap-4">
                                        <div className="w-40 flex-shrink-0">
                                            <span className="text-sm font-medium truncate block">{topic}</span>
                                        </div>
                                        <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${data.mastery >= 70 ? 'bg-green-500' :
                                                    data.mastery >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${data.mastery}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-right text-sm font-medium">
                                            {data.mastery}%
                                        </span>
                                        <span className="w-8">
                                            {data.trend === 'improving' && '📈'}
                                            {data.trend === 'declining' && '📉'}
                                            {data.trend === 'stable' && '➡️'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Error Patterns */}
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle size={20} className="text-amber-500" />
                                    <h2 className="text-lg font-bold">Wzorce Błędów</h2>
                                </div>

                                <div className="mb-4">
                                    <span className="text-sm text-[var(--text-muted)]">Dominujący typ:</span>
                                    <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                        {studentProfile.errorPatterns.dominantErrorType === 'confusion' && 'Pomylenie pojęć'}
                                        {studentProfile.errorPatterns.dominantErrorType === 'careless' && 'Nieuważność'}
                                        {studentProfile.errorPatterns.dominantErrorType === 'knowledge_gap' && 'Brak wiedzy'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(studentProfile.errorPatterns.errorTypeDistribution).map(([type, count]) => {
                                        const total = Object.values(studentProfile.errorPatterns.errorTypeDistribution).reduce((a, b) => a + b, 0);
                                        const percent = (count / total) * 100;
                                        const labels: Record<string, string> = {
                                            careless: 'Nieuważność',
                                            conceptual: 'Konceptualny',
                                            knowledge_gap: 'Brak wiedzy',
                                            confusion: 'Pomylenie',
                                            partial: 'Częściowa wiedza'
                                        };
                                        return (
                                            <div key={type} className="flex items-center gap-2">
                                                <span className="w-28 text-xs">{labels[type]}</span>
                                                <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-xs text-right">{percent.toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                    <h4 className="text-sm font-medium mb-2">Najczęstsze pomyłki:</h4>
                                    {studentProfile.errorPatterns.confusionPairs.slice(0, 3).map((pair, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                                            <span className="font-mono">{pair.concept1}</span>
                                            <span>↔</span>
                                            <span className="font-mono">{pair.concept2}</span>
                                            <span className="text-amber-600">({pair.frequency}x)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Learning Style */}
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-4">
                                    <Brain size={20} className="text-[#8b5cf6]" />
                                    <h2 className="text-lg font-bold">Twój Styl Nauki</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Cognitive Style */}
                                    <div>
                                        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                                            <span>Intuicyjny</span>
                                            <span>Analityczny</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full relative">
                                            <div
                                                className="absolute w-3 h-3 bg-[#8b5cf6] rounded-full top-1/2 -translate-y-1/2"
                                                style={{ left: `${(studentProfile.learningStyle.cognitiveStyle.analyticalVsIntuitive + 1) * 50}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                                            <span>Szczegółowy</span>
                                            <span>Całościowy</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full relative">
                                            <div
                                                className="absolute w-3 h-3 bg-[#8b5cf6] rounded-full top-1/2 -translate-y-1/2"
                                                style={{ left: `${(studentProfile.learningStyle.cognitiveStyle.sequentialVsGlobal + 1) * 50}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Optimal Conditions */}
                                    <div className="pt-4 border-t border-[var(--border-color)]">
                                        <h4 className="text-sm font-medium mb-3">Optymalne warunki:</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-[var(--text-muted)]" />
                                                <span>
                                                    {studentProfile.learningStyle.optimalConditions.bestTimeOfDay === 'morning' && 'Rano'}
                                                    {studentProfile.learningStyle.optimalConditions.bestTimeOfDay === 'afternoon' && 'Popołudnie'}
                                                    {studentProfile.learningStyle.optimalConditions.bestTimeOfDay === 'evening' && 'Wieczór'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BarChart3 size={16} className="text-[var(--text-muted)]" />
                                                <span>{studentProfile.learningStyle.optimalConditions.optimalSessionLength} min</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategies */}
                                    <div className="pt-4 border-t border-[var(--border-color)]">
                                        <h4 className="text-sm font-medium mb-2">Twoje strategie:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {studentProfile.learningStyle.solvingStrategies.usesElimination > 0.5 && (
                                                <span className="px-2 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-full text-xs">Eliminacja</span>
                                            )}
                                            {studentProfile.learningStyle.solvingStrategies.readsCarefully > 0.5 && (
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs">Uważne czytanie</span>
                                            )}
                                            {studentProfile.learningStyle.solvingStrategies.rushes > 0.5 && (
                                                <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs">Pośpiech</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="lex-card border-l-4 border-l-[#8b5cf6]">
                            <div className="flex items-center gap-3 mb-4">
                                <Lightbulb size={20} className="text-[#8b5cf6]" />
                                <h2 className="text-lg font-bold">Rekomendacje</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {studentProfile.predictions.recommendedFocus.map((focus, i) => (
                                    <div key={i} className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-[var(--text-muted)]">#{i + 1} Priorytet</span>
                                            <span className={`text-xs font-bold ${focus.priority >= 8 ? 'text-red-500' :
                                                focus.priority >= 5 ? 'text-amber-500' : 'text-green-500'
                                                }`}>
                                                {focus.priority}/10
                                            </span>
                                        </div>
                                        <h4 className="font-medium mb-1">{focus.topic}</h4>
                                        <p className="text-xs text-[var(--text-muted)]">{focus.reason}</p>
                                        <button className="mt-3 text-xs font-medium text-[#8b5cf6] hover:underline">
                                            Rozpocznij naukę →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
