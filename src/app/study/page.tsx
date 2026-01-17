'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Play, BookOpen, Loader2, Brain, Target } from 'lucide-react';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';

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
                ...ALL_KSH_QUESTIONS.slice(0, 10),
                ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 10)
            ].sort(() => Math.random() - 0.5);
            return all.map((q, i) => convertQuestionToFlashcard(q, i < 10 ? 'prawo_handlowe' : 'prawo_upadlosciowe' as LegalDomain));
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
];

export default function StudyPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'select' | 'study'>('select');
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);

    const { profile, loading: authLoading } = useAuth();
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
                                {ALL_KSH_QUESTIONS.length + ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length} pytań w bazie
                            </p>
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
