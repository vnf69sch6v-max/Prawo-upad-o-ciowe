'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Play, BookOpen, Loader2, Brain, Target, Clock, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useSRS } from '@/hooks/use-srs';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { LEGAL_KNOWLEDGE_GRAPH, recommendNextTopics, calculateAreaMastery } from '@/lib/knowledge-graph';

// Convert exam question to flashcard format
function convertQuestionToFlashcard(q: ExamQuestion, domain: LegalDomain): Flashcard {
    const correctAnswerKey = q.correct;
    const correctAnswerText = q.options[correctAnswerKey];

    return {
        id: q.id,
        question: q.question,
        answer: correctAnswerText,
        legalReference: q.article || '',
        explanation: q.explanation || '',
        domain,
        tags: q.tags || [],
        difficulty: q.difficulty || 'medium',
        srs: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date(), lastReview: null },
        stats: { timesReviewed: 0, timesCorrect: 0, timesIncorrect: 0, averageResponseTime: 0 },
        source: 'global',
        sourceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    };
}

const STUDY_MODES = [
    {
        id: 'mixed',
        name: 'Mix wszystkiego',
        description: 'Losowe pytania z całej bazy',
        icon: '🎲',
        color: '#8b5cf6',
        getCards: () => {
            const all = [
                ...ALL_KSH_QUESTIONS.slice(0, 7),
                ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 7),
                ...ALL_KC_QUESTIONS.slice(0, 6)
            ].sort(() => Math.random() - 0.5);
            return all.map((q, i) => convertQuestionToFlashcard(q, i < 7 ? 'prawo_handlowe' : i < 14 ? 'prawo_upadlosciowe' : 'prawo_cywilne' as LegalDomain));
        }
    },
    {
        id: 'ksh',
        name: 'Prawo Handlowe (KSH)',
        description: `${ALL_KSH_QUESTIONS.length} pytań`,
        icon: '⚖️',
        color: '#1a365d',
        getCards: () => ALL_KSH_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_handlowe'))
    },
    {
        id: 'pu',
        name: 'Prawo Upadłościowe',
        description: `${ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length} pytań`,
        icon: '📉',
        color: '#ea580c',
        getCards: () => ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain))
    },
    {
        id: 'kc',
        name: 'Kodeks Cywilny',
        description: `${ALL_KC_QUESTIONS.length} pytań`,
        icon: '📜',
        color: '#2563eb',
        getCards: () => ALL_KC_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_cywilne' as LegalDomain))
    },
];

export default function StudyPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'select' | 'study'>('select');
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);

    const { profile, loading: authLoading } = useAuth();
    const { dueCount, stats: srsStats, loading: srsLoading } = useSRS();
    const stats = profile?.stats;

    const handleSelectMode = (modeId: string) => {
        const mode = STUDY_MODES.find(m => m.id === modeId);
        if (mode) {
            setCards(mode.getCards());
            setSelectedMode(modeId);
            setView('study');
        }
    };

    const handleComplete = () => {
        setView('select');
        setSelectedMode(null);
        setCards([]);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    // Study mode - full screen
    if (view === 'study' && selectedMode) {
        const mode = STUDY_MODES.find(m => m.id === selectedMode);
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => { setView('select'); setSelectedMode(null); }}
                        className="mb-6 text-sm text-[var(--text-muted)] hover:text-[#1a365d] transition-colors"
                    >
                        ← Powrót
                    </button>
                    <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">{mode?.icon}</span>
                        <h2 className="text-xl font-bold">{mode?.name}</h2>
                    </div>
                    <FlashcardStudy
                        cards={cards}
                        onReview={(cardId, quality, responseTime) => {
                            console.log('Review:', cardId, quality, responseTime);
                        }}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="study"
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
                    currentView="study"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#1a365d' }}>
                                <Brain size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Nauka</h1>
                            <p className="text-[var(--text-muted)]">
                                {ALL_KSH_QUESTIONS.length + ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length + ALL_KC_QUESTIONS.length} pytań w bazie
                            </p>
                        </div>

                        {/* SRS Section - "Dziś do powtórki" */}
                        {dueCount > 0 && (
                            <div className="lex-card border-2 border-[#8b5cf6]/50 bg-gradient-to-r from-[#8b5cf6]/10 to-[#6366f1]/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
                                            <Clock size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                Dziś do powtórki
                                                <span className="px-2.5 py-1 bg-[#8b5cf6] text-white text-sm rounded-full font-bold animate-pulse">
                                                    {dueCount}
                                                </span>
                                            </h3>
                                            <p className="text-[var(--text-muted)]">
                                                Karty czekające na powtórkę (SM-2)
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelectMode('mixed')}
                                        className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-xl font-bold text-white hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <Sparkles size={20} />
                                        Rozpocznij
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Knowledge Graph Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* KC Mastery */}
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <span className="text-xl">📜</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Kodeks Cywilny</h4>
                                        <p className="text-xs text-[var(--text-muted)]">{LEGAL_KNOWLEDGE_GRAPH.metadata.totalNodes} tematów</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} />
                                    </div>
                                    <span className="text-sm font-medium">35%</span>
                                </div>
                            </div>

                            {/* KSH Mastery */}
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a365d]/20 flex items-center justify-center">
                                        <span className="text-xl">⚖️</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Prawo Handlowe</h4>
                                        <p className="text-xs text-[var(--text-muted)]">KSH, KRS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#1a365d] rounded-full" style={{ width: '45%' }} />
                                    </div>
                                    <span className="text-sm font-medium">45%</span>
                                </div>
                            </div>

                            {/* PU Mastery */}
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-xl">📉</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Prawo Upadłościowe</h4>
                                        <p className="text-xs text-[var(--text-muted)]">PU, PRestr</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '25%' }} />
                                    </div>
                                    <span className="text-sm font-medium">25%</span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Recommendations */}
                        <div className="lex-card border-l-4 border-l-amber-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">💡 Rekomendacja AI</h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Na podstawie twojego postępu, skup się na <strong>odpowiedzialności deliktowej (art. 415 KC)</strong> -
                                        to temat ważny na egzaminie i powiązany z wieloma innymi zagadnieniami.
                                    </p>
                                    <button className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                        Rozpocznij naukę →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="space-y-4">
                            {STUDY_MODES.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => handleSelectMode(mode.id)}
                                    className="w-full lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.01] group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                            style={{ background: `${mode.color}15` }}
                                        >
                                            {mode.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{mode.name}</h3>
                                            <p className="text-[var(--text-muted)]">
                                                {mode.description}
                                            </p>
                                        </div>
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                            style={{ background: mode.color }}
                                        >
                                            <Play size={24} className="text-white" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Progress Summary */}
                        {stats && stats.totalQuestions > 0 && (
                            <div className="lex-card bg-gradient-to-r from-green-500/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Target size={24} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Twój postęp</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {stats.totalQuestions} pytań przećwiczonych •
                                            {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}% dokładności
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="study" onNavigate={() => { }} />
        </div>
    );
}
