'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Play, Flame, Zap, BookOpen, Target, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso';

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

// Deck configuration with progress tracking
const DECKS = [
    {
        id: 'ksh',
        name: 'Prawo Handlowe (KSH)',
        icon: '⚖️',
        total: ALL_KSH_QUESTIONS.length,
        color: '#1a365d',
        mastered: 234, // TODO: fetch from user data
        toReview: 47,
        newToday: 15
    },
    {
        id: 'pu',
        name: 'Prawo Upadłościowe',
        icon: '📉',
        total: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length,
        color: '#ea580c',
        mastered: 45,
        toReview: 23,
        newToday: 10
    },
    {
        id: 'kc',
        name: 'Kodeks Cywilny',
        icon: '📜',
        total: ALL_KC_QUESTIONS.length,
        color: '#2563eb',
        mastered: 89,
        toReview: 18,
        newToday: 12
    },
    {
        id: 'aso',
        name: 'Certyfikat ASO',
        icon: '📊',
        total: ALL_ASO_QUESTIONS.length,
        color: '#0d9488',
        mastered: 156,
        toReview: 34,
        newToday: 20
    },
];

// Progress Ring Component
function ProgressRing({
    progress,
    size = 60,
    strokeWidth = 6,
    color
}: {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--bg-hover)"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
            />
        </svg>
    );
}

// Streak Day Component
function StreakDay({ day, completed, isToday }: { day: string; completed: boolean; isToday: boolean }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">{day}</span>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                completed && "bg-green-500",
                !completed && isToday && "bg-[var(--bg-hover)] border-2 border-dashed border-[var(--border-color)]",
                !completed && !isToday && "bg-[var(--bg-hover)]"
            )}>
                {completed && <span className="text-white text-sm">✓</span>}
            </div>
        </div>
    );
}

export default function FlashcardsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'dashboard' | 'study'>('dashboard');
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<'deck' | 'smart'>('deck');

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;
    const userName = profile?.displayName?.split(' ')[0] || 'Student';

    // Current streak data (TODO: fetch from user data)
    const streakDays = 5;
    const dailyGoal = 20;
    const dailyProgress = 12;
    const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    const completedDays = [true, true, true, true, true, false, false]; // Example
    const todayIndex = 4; // Friday

    // Get cards for selected deck or smart review
    const cards = useMemo(() => {
        if (studyMode === 'smart') {
            // Smart Review: mix from all decks, prioritize due cards
            const allCards = [
                ...ALL_KSH_QUESTIONS.slice(0, 8).map(q => convertQuestionToFlashcard(q, 'prawo_handlowe')),
                ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)),
                ...ALL_KC_QUESTIONS.slice(0, 7).map(q => convertQuestionToFlashcard(q, 'prawo_cywilne' as LegalDomain)),
                ...ALL_ASO_QUESTIONS.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'aso' as LegalDomain)),
            ];
            return allCards.sort(() => Math.random() - 0.5);
        }

        if (!selectedDeck) return [];

        if (selectedDeck === 'ksh') {
            return ALL_KSH_QUESTIONS.slice(0, 25).map(q =>
                convertQuestionToFlashcard(q, 'prawo_handlowe')
            );
        } else if (selectedDeck === 'pu') {
            return ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 25).map(q =>
                convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)
            );
        } else if (selectedDeck === 'kc') {
            return ALL_KC_QUESTIONS.slice(0, 25).map(q =>
                convertQuestionToFlashcard(q, 'prawo_cywilne' as LegalDomain)
            );
        } else if (selectedDeck === 'aso') {
            return ALL_ASO_QUESTIONS.slice(0, 25).map(q =>
                convertQuestionToFlashcard(q, 'aso' as LegalDomain)
            );
        }
        return [];
    }, [selectedDeck, studyMode]);

    const handleSelectDeck = (deckId: string) => {
        setSelectedDeck(deckId);
        setStudyMode('deck');
        setView('study');
    };

    const handleSmartReview = () => {
        setStudyMode('smart');
        setView('study');
    };

    const handleComplete = () => {
        setView('dashboard');
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
    if (view === 'study') {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => { setView('dashboard'); setSelectedDeck(null); }}
                        className="mb-6 text-sm text-[var(--text-muted)] hover:text-[#1a365d] transition-colors flex items-center gap-1"
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
                    streak: stats?.currentStreak || streakDays,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || streakDays,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="flashcards"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Greeting */}
                        <div className="mb-2">
                            <h1 className="text-2xl font-bold">
                                Dzień dobry, {userName} 👋
                            </h1>
                        </div>

                        {/* Streak Card */}
                        <div className="lex-card bg-gradient-to-r from-orange-500/10 to-yellow-500/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <Flame size={24} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{streakDays} DNI</p>
                                        <p className="text-sm text-[var(--text-muted)]">Dzienna seria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Progress */}
                            <div className="flex justify-between mb-4">
                                {weekDays.map((day, i) => (
                                    <StreakDay
                                        key={day}
                                        day={day}
                                        completed={completedDays[i]}
                                        isToday={i === todayIndex}
                                    />
                                ))}
                            </div>

                            {/* Daily Goal Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Dzisiejszy cel</span>
                                    <span className="font-medium">{dailyProgress}/{dailyGoal} fiszek</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                                    />
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Jeszcze {dailyGoal - dailyProgress} fiszek do utrzymania serii!
                                </p>
                            </div>
                        </div>

                        {/* Smart Review CTA */}
                        <button
                            onClick={handleSmartReview}
                            className="w-full p-6 rounded-2xl transition-all hover:scale-[1.01] group"
                            style={{
                                background: 'linear-gradient(135deg, #1a365d20 0%, #3b82f615 100%)',
                                border: '1px solid #1a365d40'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#1a365d' }}>
                                        <Zap size={28} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-bold">Smart Review</p>
                                        <p className="text-[var(--text-muted)]">
                                            AI wybrał 25 fiszek dopasowanych do Ciebie
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="text-[#1a365d] group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="mt-4 flex gap-4 text-sm text-[var(--text-muted)]">
                                <span>• 12 do powtórki</span>
                                <span>• 8 ze słabych punktów</span>
                                <span>• 5 nowych</span>
                            </div>
                        </button>

                        {/* Section Title */}
                        <div className="flex items-center gap-2 pt-2">
                            <BookOpen size={20} className="text-[var(--text-muted)]" />
                            <h2 className="text-lg font-semibold">Twoje talie</h2>
                        </div>

                        {/* Deck Cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {DECKS.map(deck => {
                                const progressPercent = Math.round((deck.mastered / deck.total) * 100);
                                return (
                                    <button
                                        key={deck.id}
                                        onClick={() => handleSelectDeck(deck.id)}
                                        className="lex-card hover:border-[#1a365d]/30 transition-all hover:scale-[1.01] group text-left"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Progress Ring */}
                                            <div className="relative">
                                                <ProgressRing
                                                    progress={progressPercent}
                                                    size={70}
                                                    color={deck.color}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-2xl">{deck.icon}</span>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-bold mb-1">{deck.name}</h3>
                                                <p className="text-sm text-[var(--text-muted)] mb-2">
                                                    {deck.mastered}/{deck.total} opanowanych
                                                </p>
                                                <div className="flex gap-3 text-xs">
                                                    {deck.toReview > 0 && (
                                                        <span className="flex items-center gap-1 text-orange-500">
                                                            <Target size={12} />
                                                            {deck.toReview} do powtórki
                                                        </span>
                                                    )}
                                                    {deck.newToday > 0 && (
                                                        <span className="flex items-center gap-1 text-blue-500">
                                                            ✨ {deck.newToday} nowych
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ background: deck.color }}
                                            >
                                                <Play size={20} className="text-white" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Stats Tip */}
                        {stats && stats.totalQuestions > 0 && (
                            <div className="lex-card bg-gradient-to-r from-[#1a365d]/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                                        <Target size={20} style={{ color: '#1a365d' }} />
                                    </div>
                                    <div>
                                        <p className="font-medium">Twój postęp</p>
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

            <MobileNav currentView="flashcards" onNavigate={() => { }} />
        </div>
    );
}
