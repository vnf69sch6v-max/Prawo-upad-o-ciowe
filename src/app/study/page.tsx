'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { BookOpen, Flame, Target, Clock, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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

const DOMAINS: { id: string; name: string; questionsCount: number }[] = [
    { id: 'prawo_handlowe', name: 'Prawo Handlowe (KSH)', questionsCount: ALL_KSH_QUESTIONS.length },
    { id: 'prawo_upadlosciowe', name: 'Prawo Upadłościowe', questionsCount: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length },
];

export default function StudyPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'decks' | 'study'>('decks');
    const [selectedDomain, setSelectedDomain] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    // Calculate real accuracy from profile
    const accuracy = useMemo(() => {
        if (!stats || stats.totalQuestions === 0) return 0;
        return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
    }, [stats]);

    // Convert exam questions to flashcards
    const allFlashcards = useMemo(() => {
        const kshCards = ALL_KSH_QUESTIONS.map(q =>
            convertQuestionToFlashcard(q, 'prawo_handlowe')
        );
        const upCards = ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.map(q =>
            convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)
        );
        return [...kshCards, ...upCards];
    }, []);

    // Filter flashcards
    const flashcards = useMemo(() => {
        return allFlashcards.filter(card => {
            if (selectedDomain !== 'all' && card.domain !== selectedDomain) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return card.question.toLowerCase().includes(query) ||
                    card.answer.toLowerCase().includes(query);
            }
            return true;
        });
    }, [allFlashcards, selectedDomain, searchQuery]);

    const handleStudyComplete = () => {
        setView('decks');
    };

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
                    {view === 'decks' ? (
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Header */}
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <BookOpen style={{ color: '#1a365d' }} />
                                    Nauka
                                </h1>
                                <p className="text-[var(--text-muted)]">
                                    {allFlashcards.length} pytań dostępnych do nauki
                                </p>
                            </div>

                            {/* Quick Stats - Real data */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                                        <Flame size={24} style={{ color: '#ea580c' }} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                                        <p className="text-xs text-[var(--text-muted)]">Dni serii</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                                        <BookOpen size={24} style={{ color: '#2563eb' }} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{flashcards.length}</p>
                                        <p className="text-xs text-[var(--text-muted)]">Dostępne pytania</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                                        <Target size={24} style={{ color: '#059669' }} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{accuracy}%</p>
                                        <p className="text-xs text-[var(--text-muted)]">Twoja dokładność</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26, 54, 93, 0.1)' }}>
                                        <Clock size={24} style={{ color: '#1a365d' }} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
                                        <p className="text-xs text-[var(--text-muted)]">Przećwiczonych</p>
                                    </div>
                                </div>
                            </div>

                            {/* Start Study CTA */}
                            <button
                                onClick={() => setView('study')}
                                className="w-full p-6 rounded-2xl transition-all group hover-lift"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)',
                                    border: '1px solid rgba(26, 54, 93, 0.2)'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)' }}>
                                            <BookOpen size={28} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xl font-bold">Rozpocznij sesję nauki</p>
                                            <p className="text-[var(--text-muted)]">{flashcards.length} pytań z algorytmem SRS</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: '#1a365d' }}>
                                        →
                                    </div>
                                </div>
                            </button>

                            {/* Search & Filter */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 relative min-w-[200px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Szukaj pytań..."
                                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDomain('all')}
                                        className={cn(
                                            'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
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
                                                'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap hidden sm:block',
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

                            {/* Domain Cards */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {DOMAINS.map(domain => (
                                    <button
                                        key={domain.id}
                                        onClick={() => {
                                            setSelectedDomain(domain.id);
                                            setView('study');
                                        }}
                                        className="lex-card text-left hover:border-[#1a365d]/30 transition-all hover-lift"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">{domain.name}</h3>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' }}>
                                                {domain.questionsCount} pytań
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Kliknij aby rozpocząć naukę z tej dziedziny
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={() => setView('decks')}
                                className="mb-6 text-sm text-[var(--text-muted)] hover:text-[#1a365d] transition-colors"
                            >
                                ← Powrót do listy
                            </button>
                            <FlashcardStudy
                                cards={flashcards.slice(0, 20)}
                                onReview={(cardId, quality, responseTime) => {
                                    console.log('Review:', cardId, quality, responseTime);
                                    // TODO: Save to Firestore
                                }}
                                onComplete={handleStudyComplete}
                            />
                        </div>
                    )}
                </main>
            </div>

            <MobileNav currentView="study" onNavigate={() => { }} />
        </div>
    );
}
