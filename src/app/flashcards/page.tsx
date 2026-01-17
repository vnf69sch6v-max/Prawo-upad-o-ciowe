'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Plus, BookOpen, Filter, Search, Clock, Target, Zap, Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';

// Convert exam questions to flashcard format
function convertQuestionToFlashcard(q: ExamQuestion, domain: LegalDomain): Flashcard {
    // Get correct answer text from options
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

const DOMAINS: { id: LegalDomain | 'prawo_upadlosciowe'; name: string }[] = [
    { id: 'prawo_handlowe', name: 'Prawo Handlowe (KSH)' },
    { id: 'prawo_upadlosciowe', name: 'Prawo Upadłościowe' },
];

export default function FlashcardsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'list' | 'study'>('list');
    const [selectedDomain, setSelectedDomain] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    // Calculate accuracy from real stats
    const accuracy = useMemo(() => {
        if (!stats || stats.totalQuestions === 0) return 0;
        return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
    }, [stats]);

    // Convert exam questions to flashcards
    const allFlashcards = useMemo(() => {
        const kshCards = ALL_KSH_QUESTIONS.slice(0, 50).map(q =>
            convertQuestionToFlashcard(q, 'prawo_handlowe')
        );
        const upCards = ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 50).map(q =>
            convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)
        );
        return [...kshCards, ...upCards];
    }, []);

    const filteredCards = useMemo(() => {
        return allFlashcards.filter(card => {
            if (selectedDomain !== 'all' && card.domain !== selectedDomain) return false;
            if (searchQuery && !card.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [allFlashcards, selectedDomain, searchQuery]);

    const dueCards = useMemo(() => {
        return filteredCards.filter(c => new Date(c.srs.nextReview) <= new Date());
    }, [filteredCards]);

    const handleReview = (cardId: string, quality: number, responseTime: number) => {
        console.log('Review:', { cardId, quality, responseTime });
        // TODO: Save to Firestore
    };

    const handleComplete = () => {
        setView('list');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    if (view === 'study') {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => setView('list')}
                        className="mb-6 text-sm text-[var(--text-muted)] hover:text-[#1a365d] transition-colors"
                    >
                        ← Powrót do listy
                    </button>
                    <FlashcardStudy
                        cards={dueCards.length > 0 ? dueCards : filteredCards.slice(0, 10)}
                        onReview={handleReview}
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
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Fiszki</h1>
                                <p className="text-[var(--text-muted)]">
                                    {dueCards.length} kart do powtórki • {filteredCards.length} łącznie
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {filteredCards.length > 0 && (
                                    <button
                                        onClick={() => setView('study')}
                                        className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                                        style={{ background: '#1a365d' }}
                                    >
                                        <Zap size={18} />
                                        Rozpocznij naukę
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats - Real data from user profile */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26, 54, 93, 0.1)' }}>
                                    <BookOpen size={20} style={{ color: '#1a365d' }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{filteredCards.length}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Dostępne fiszki</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                                    <Clock size={20} style={{ color: '#ea580c' }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{dueCards.length}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Do powtórki</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                                    <Target size={20} style={{ color: '#059669' }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{accuracy}%</p>
                                    <p className="text-xs text-[var(--text-muted)]">Twoja dokładność</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                                    <Zap size={20} style={{ color: '#2563eb' }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Przećwiczonych</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Szukaj fiszek..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedDomain('all')}
                                    className={cn(
                                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                                        selectedDomain === 'all'
                                            ? 'bg-[#1a365d] text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#1a365d]'
                                    )}
                                >
                                    Wszystkie
                                </button>
                                {DOMAINS.map(domain => (
                                    <button
                                        key={domain.id}
                                        onClick={() => setSelectedDomain(domain.id)}
                                        className={cn(
                                            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all hidden sm:block',
                                            selectedDomain === domain.id
                                                ? 'bg-[#1a365d] text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#1a365d]'
                                        )}
                                    >
                                        {domain.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cards List */}
                        {filteredCards.length === 0 ? (
                            <div className="lex-card py-12 text-center">
                                <Inbox size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                                <p className="text-[var(--text-muted)]">Brak fiszek w wybranej kategorii</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredCards.slice(0, 20).map(card => (
                                    <div key={card.id} className="lex-card hover:border-[#1a365d]/50 transition-all group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium mb-2">{card.question}</p>
                                                <details className="cursor-pointer">
                                                    <summary className="text-sm text-[#1a365d] hover:text-[#1a365d]/80 transition-colors font-medium">
                                                        Pokaż odpowiedź →
                                                    </summary>
                                                    <p className="text-sm text-[var(--text-muted)] mt-2 pl-4 border-l-2 border-[#1a365d]/30">
                                                        {card.answer}
                                                    </p>
                                                </details>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={cn(
                                                    'px-2 py-1 rounded text-xs font-medium',
                                                    card.difficulty === 'easy' && 'bg-green-500/20 text-green-600',
                                                    card.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600',
                                                    card.difficulty === 'hard' && 'bg-orange-500/20 text-orange-600',
                                                    card.difficulty === 'expert' && 'bg-red-500/20 text-red-600'
                                                )}>
                                                    {card.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        {card.legalReference && (
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                                                <span>{card.domain === 'prawo_handlowe' ? 'KSH' : 'Prawo upadłościowe'}</span>
                                                <span>•</span>
                                                <span>{card.legalReference}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="flashcards" onNavigate={() => { }} />
        </div>
    );
}
