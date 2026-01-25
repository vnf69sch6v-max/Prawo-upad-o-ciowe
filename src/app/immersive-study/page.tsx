'use client';

import { useState, useMemo, useCallback } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { ImmersiveFlashcard } from '@/components/study/immersive-flashcard';
import { Play, BookOpen, Loader2, Brain, Target, Clock, Sparkles, TrendingUp, ArrowLeft, X } from 'lucide-react';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useSRS } from '@/hooks/use-srs';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso';
import { cn } from '@/lib/utils/cn';

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

interface StudyMode {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    domain: LegalDomain;
    getCards: () => Flashcard[];
}

const STUDY_MODES: StudyMode[] = [
    {
        id: 'mixed',
        name: 'Mix wszystkiego',
        description: 'Losowe pytania z całej bazy',
        icon: '🎲',
        color: 'var(--accent-premium)',
        domain: 'prawo_cywilne',
        getCards: () => {
            const all = [
                ...ALL_KSH_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'prawo_handlowe')),
                ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)),
                ...ALL_KC_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'prawo_cywilne')),
                ...ALL_ASO_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'aso' as LegalDomain)),
            ].sort(() => Math.random() - 0.5);
            return all;
        }
    },
    {
        id: 'ksh',
        name: 'Prawo Handlowe (KSH)',
        description: `${ALL_KSH_QUESTIONS.length} pytań`,
        icon: '⚖️',
        color: 'var(--neon-handlowe)',
        domain: 'prawo_handlowe',
        getCards: () => ALL_KSH_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_handlowe'))
    },
    {
        id: 'pu',
        name: 'Prawo Upadłościowe',
        description: `${ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length} pytań`,
        icon: '📉',
        color: 'var(--neon-upadlosciowe)',
        domain: 'prawo_upadlosciowe' as LegalDomain,
        getCards: () => ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain))
    },
    {
        id: 'kc',
        name: 'Kodeks Cywilny',
        description: `${ALL_KC_QUESTIONS.length} pytań`,
        icon: '📜',
        color: 'var(--neon-cywilne)',
        domain: 'prawo_cywilne',
        getCards: () => ALL_KC_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_cywilne'))
    },
    {
        id: 'aso',
        name: 'Egzamin ASO',
        description: `${ALL_ASO_QUESTIONS.length} pytań`,
        icon: '📊',
        color: 'var(--neon-aso)',
        domain: 'aso' as LegalDomain,
        getCards: () => ALL_ASO_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'aso' as LegalDomain))
    },
];

interface SessionResult {
    cardId: string;
    knew: boolean;
}

export default function ImmersiveStudyPage() {
    const [view, setView] = useState<'select' | 'study' | 'summary'>('select');
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);

    const { profile } = useAuth();
    const stats = profile?.stats;

    const currentCard = cards[currentIndex];
    const currentMode = STUDY_MODES.find(m => m.id === selectedMode);

    const handleSelectMode = useCallback((modeId: string) => {
        const mode = STUDY_MODES.find(m => m.id === modeId);
        if (mode) {
            const newCards = mode.getCards();
            setCards(newCards);
            setSelectedMode(modeId);
            setCurrentIndex(0);
            setSessionResults([]);
            setSessionStartTime(Date.now());
            setShowAnswer(false);
            setView('study');
        }
    }, []);

    const handleKnow = useCallback(() => {
        setSessionResults(prev => [...prev, { cardId: currentCard.id, knew: true }]);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            setView('summary');
        }
    }, [currentCard, currentIndex, cards.length]);

    const handleDontKnow = useCallback(() => {
        setSessionResults(prev => [...prev, { cardId: currentCard.id, knew: false }]);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            setView('summary');
        }
    }, [currentCard, currentIndex, cards.length]);

    const handleRestart = useCallback(() => {
        setCurrentIndex(0);
        setSessionResults([]);
        setSessionStartTime(Date.now());
        setShowAnswer(false);
        setView('study');
    }, []);

    const handleExit = useCallback(() => {
        setView('select');
        setSelectedMode(null);
        setCards([]);
        setSessionResults([]);
    }, []);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const knew = sessionResults.filter(r => r.knew).length;
        const didntKnow = sessionResults.filter(r => !r.knew).length;
        const total = sessionResults.length;
        const accuracy = total > 0 ? Math.round((knew / total) * 100) : 0;
        const duration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
        const xpEarned = knew * 15 + didntKnow * 5;

        return { knew, didntKnow, total, accuracy, duration, xpEarned };
    }, [sessionResults, sessionStartTime]);

    // Mode selection view
    if (view === 'select') {
        return (
            <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <Sidebar
                    currentView="study"
                    onNavigate={() => { }}
                    isCollapsed={false}
                    onToggle={() => { }}
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
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 glass-card">
                                    <span className="text-4xl">🧠</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Tryb Immersyjny</h1>
                                <p className="text-[var(--text-muted)]">
                                    Ucz się przez gesty • Swipe prawo = Wiem • Swipe lewo = Nie wiem
                                </p>
                            </div>

                            {/* Mode cards */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {STUDY_MODES.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => handleSelectMode(mode.id)}
                                        className="glass-card text-left hover:scale-[1.02] transition-all group"
                                        style={{
                                            borderColor: `color-mix(in srgb, ${mode.color} 30%, transparent)`,
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                                style={{ background: `color-mix(in srgb, ${mode.color} 20%, transparent)` }}
                                            >
                                                {mode.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold mb-1 group-hover:text-[var(--text-primary)] transition-colors">
                                                    {mode.name}
                                                </h3>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    {mode.description}
                                                </p>
                                            </div>
                                            <Play
                                                size={24}
                                                className="text-[var(--text-muted)] group-hover:text-[var(--accent-success)] transition-colors"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Instructions */}
                            <div className="glass-card border-l-4" style={{ borderLeftColor: 'var(--neon-cywilne)' }}>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Sparkles size={18} className="text-[var(--neon-cywilne)]" />
                                    Jak to działa?
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">👉</span>
                                        <span><strong>Swipe prawo</strong> — Znam odpowiedź</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">👈</span>
                                        <span><strong>Swipe lewo</strong> — Nie znam</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">👆</span>
                                        <span><strong>Przytrzymaj</strong> — Pokaż odpowiedź</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">👆👆</span>
                                        <span><strong>Double tap</strong> — Ulubione</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <MobileNav currentView="study" onNavigate={() => { }} />
            </div>
        );
    }

    // Study view (immersive mode)
    if (view === 'study' && currentCard) {
        return (
            <div
                className="min-h-screen flex flex-col"
                style={{ background: 'var(--bg-void)' }}
            >
                {/* Minimal header */}
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-full glass-card hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-sm text-[var(--text-muted)]">
                        {currentMode?.name}
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-4">
                    <div className="flex gap-1 h-1.5">
                        {cards.map((_, i) => {
                            const result = sessionResults[i];
                            let bgColor = 'bg-[var(--border-color)]';
                            if (result) {
                                bgColor = result.knew
                                    ? 'bg-[var(--accent-success)]'
                                    : 'bg-[var(--accent-danger)]';
                            } else if (i === currentIndex) {
                                bgColor = 'bg-[var(--neon-cywilne)]';
                            }
                            return (
                                <div
                                    key={i}
                                    className={cn("flex-1 rounded-full transition-all", bgColor)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Main card area */}
                <div className="flex-1 flex items-center justify-center px-4 pb-8">
                    <ImmersiveFlashcard
                        card={currentCard}
                        cardIndex={currentIndex}
                        totalCards={cards.length}
                        onKnow={handleKnow}
                        onDontKnow={handleDontKnow}
                        showAnswer={showAnswer}
                        onToggleAnswer={() => setShowAnswer(!showAnswer)}
                    />
                </div>
            </div>
        );
    }

    // Summary view
    if (view === 'summary') {
        const { knew, didntKnow, total, accuracy, duration, xpEarned } = summaryStats;
        const message = accuracy >= 80 ? '🎉 ŚWIETNA ROBOTA!' :
            accuracy >= 60 ? '👍 Dobra sesja!' :
                '💪 Nie poddawaj się!';

        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{ background: 'var(--bg-primary)' }}
            >
                <div className="max-w-md w-full space-y-6 animate-fade-in">
                    {/* Celebration */}
                    <div className="text-center py-6">
                        <p className="text-4xl mb-4">{message}</p>
                        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[var(--accent-success)]">
                            <span>⭐</span>
                            <span>+{xpEarned} XP</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="glass-card space-y-4">
                        <h3 className="font-semibold text-lg">📊 Podsumowanie</h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{total}</p>
                                <p className="text-sm text-[var(--text-muted)]">Karty</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--accent-success)]">{accuracy}%</p>
                                <p className="text-sm text-[var(--text-muted)]">Dokładność</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{duration}m</p>
                                <p className="text-sm text-[var(--text-muted)]">Czas</p>
                            </div>
                        </div>

                        {/* Result bars */}
                        <div className="space-y-2 pt-4">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">✅</span>
                                <span className="text-sm w-16">Wiedziałem</span>
                                <div className="flex-1 h-4 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-success)] rounded-full transition-all"
                                        style={{ width: `${total > 0 ? (knew / total) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm w-12 text-right">{knew}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">❌</span>
                                <span className="text-sm w-16">Nie wiedziałem</span>
                                <div className="flex-1 h-4 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-danger)] rounded-full transition-all"
                                        style={{ width: `${total > 0 ? (didntKnow / total) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm w-12 text-right">{didntKnow}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleExit}
                            className="flex-1 btn btn-secondary"
                        >
                            Zakończ
                        </button>
                        <button
                            onClick={handleRestart}
                            className="flex-1 btn btn-success"
                        >
                            Jeszcze raz →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
