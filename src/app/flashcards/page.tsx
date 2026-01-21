'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Play, BookOpen, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';

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

const DECKS = [
    { id: 'ksh', name: 'Prawo Handlowe (KSH)', icon: '⚖️', count: ALL_KSH_QUESTIONS.length, color: '#1a365d' },
    { id: 'pu', name: 'Prawo Upadłościowe', icon: '📉', count: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length, color: '#ea580c' },
    { id: 'kc', name: 'Kodeks Cywilny', icon: '📜', count: ALL_KC_QUESTIONS.length, color: '#2563eb' },
];

export default function FlashcardsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'select' | 'study'>('select');
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    // Get cards for selected deck
    const cards = useMemo(() => {
        if (!selectedDeck) return [];

        if (selectedDeck === 'ksh') {
            return ALL_KSH_QUESTIONS.slice(0, 20).map(q =>
                convertQuestionToFlashcard(q, 'prawo_handlowe')
            );
        } else if (selectedDeck === 'pu') {
            return ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 20).map(q =>
                convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)
            );
        } else if (selectedDeck === 'kc') {
            return ALL_KC_QUESTIONS.slice(0, 20).map(q =>
                convertQuestionToFlashcard(q, 'prawo_cywilne' as LegalDomain)
            );
        }
        return [];
    }, [selectedDeck]);

    const handleSelectDeck = (deckId: string) => {
        setSelectedDeck(deckId);
        setView('study');
    };

    const handleComplete = () => {
        setView('select');
        setSelectedDeck(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    // Study mode - full screen
    if (view === 'study' && selectedDeck) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => { setView('select'); setSelectedDeck(null); }}
                        className="mb-6 text-sm text-[var(--text-muted)] hover:text-[#1a365d] transition-colors"
                    >
                        ← Powrót do talii
                    </button>
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
                currentView="flashcards"
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
                    currentView="flashcards"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Simple Header */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-2">Fiszki</h1>
                            <p className="text-[var(--text-muted)]">
                                Wybierz talię i rozpocznij naukę
                            </p>
                        </div>

                        {/* Deck Selection */}
                        <div className="space-y-4">
                            {DECKS.map(deck => (
                                <button
                                    key={deck.id}
                                    onClick={() => handleSelectDeck(deck.id)}
                                    className="w-full lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.01] group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                            style={{ background: `${deck.color}15` }}
                                        >
                                            {deck.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{deck.name}</h3>
                                            <p className="text-[var(--text-muted)]">
                                                {deck.count} fiszek dostępnych
                                            </p>
                                        </div>
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                            style={{ background: deck.color }}
                                        >
                                            <Play size={24} className="text-white" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Stats Summary */}
                        {stats && stats.totalQuestions > 0 && (
                            <div className="lex-card bg-gradient-to-r from-[#1a365d]/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#1a365d]/20 flex items-center justify-center">
                                        <BookOpen size={24} style={{ color: '#1a365d' }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Twój postęp</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Przećwiczone: {stats.totalQuestions} pytań •
                                            Dokładność: {Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="flashcards" onNavigate={() => { }} />
        </div>
    );
}
