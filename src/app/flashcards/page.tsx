'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header, MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { FlashcardStudy, SpeedRunMode, SpeedRunResults } from '@/components/study';
import { SessionCoachPanel } from '@/components/study/session-coach-panel';
import { useSessionCoach } from '@/hooks/use-session-coach';
import type { SpeedRunResults as SpeedRunResultsType } from '@/components/study/speed-run-mode';
import { Play, Flame, Zap, BookOpen, Target, ChevronRight, Loader2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard, LegalDomain } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso';
import { MAKLER_SEKCJA_A } from '@/lib/data/makler';

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
        newToday: 15,
        category: 'student-prawa'
    },
    {
        id: 'pu',
        name: 'Prawo Upadłościowe',
        icon: '📉',
        total: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length,
        color: '#ea580c',
        mastered: 45,
        toReview: 23,
        newToday: 10,
        category: 'student-prawa'
    },
    {
        id: 'kc',
        name: 'Kodeks Cywilny',
        icon: '📜',
        total: ALL_KC_QUESTIONS.length,
        color: '#2563eb',
        mastered: 89,
        toReview: 18,
        newToday: 12,
        category: 'student-prawa'
    },
    {
        id: 'aso',
        name: 'Certyfikat ASO',
        icon: '📊',
        total: ALL_ASO_QUESTIONS.length,
        color: '#0d9488',
        mastered: 156,
        toReview: 34,
        newToday: 20,
        category: 'egzamin-aso'
    },
    {
        id: 'makler_a',
        name: 'Makler: Matematyka',
        icon: '🔢',
        total: MAKLER_SEKCJA_A.length,
        color: '#7c3aed',
        mastered: 0,
        toReview: 0,
        newToday: MAKLER_SEKCJA_A.length,
        category: 'egzamin-maklerski'
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
                stroke="#E5E7EB"
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
            <span className="text-xs text-gray-500">{day}</span>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                completed && "bg-green-500",
                !completed && isToday && "bg-gray-100 border-2 border-dashed border-gray-300",
                !completed && !isToday && "bg-gray-100"
            )}>
                {completed && <span className="text-white text-sm">✓</span>}
            </div>
        </div>
    );
}

export default function FlashcardsPage() {
    // Sidebar is now auto-managed by LiquidGlassSidebar
    const [view, setView] = useState<'dashboard' | 'study' | 'speedrun' | 'speedrun-results'>('dashboard');
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<'deck' | 'smart'>('deck');
    const [speedRunResults, setSpeedRunResults] = useState<SpeedRunResultsType | null>(null);

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;
    const userName = profile?.displayName?.split(' ')[0] || 'Student';

    // Session Coach integration
    const coach = useSessionCoach();

    // Start session when entering study mode
    useEffect(() => {
        if (view === 'study' && !coach.isActive) {
            coach.startSession('flashcards');
        } else if (view === 'speedrun' && !coach.isActive) {
            coach.startSession('speed_run');
        } else if (view === 'dashboard' && coach.isActive) {
            coach.endSession();
        }
    }, [view, coach.isActive]);

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
                ...MAKLER_SEKCJA_A.slice(0, 5).map(q => convertQuestionToFlashcard(q, 'aso' as LegalDomain)), // Using 'aso' as domain type for makler
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
        } else if (selectedDeck === 'makler_a') {
            return MAKLER_SEKCJA_A.slice(0, 25).map(q =>
                convertQuestionToFlashcard(q, 'aso' as LegalDomain) // Using 'aso' as domain type for makler
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (view === 'study') {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => { setView('dashboard'); setSelectedDeck(null); }}
                        className="mb-6 text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                        ← Powrót do talii
                    </button>
                    <FlashcardStudy
                        cards={cards}
                        onReview={(cardId, quality, responseTime) => {
                            // Report to Session Coach
                            coach.reportQuestionAnswered({
                                questionId: cardId,
                                isCorrect: quality >= 3,
                                timeToAnswer: responseTime,
                            });
                            console.log('Review:', cardId, quality, responseTime);
                        }}
                        onComplete={handleComplete}
                    />
                </div>
                {/* Session Coach Panel */}
                <SessionCoachPanel />
            </div>
        );
    }

    // Speed Run mode
    if (view === 'speedrun') {
        const speedRunCards = [
            ...ALL_KSH_QUESTIONS.slice(0, 30).map(q => convertQuestionToFlashcard(q, 'prawo_handlowe')),
            ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.slice(0, 20).map(q => convertQuestionToFlashcard(q, 'prawo_upadlosciowe' as LegalDomain)),
            ...ALL_KC_QUESTIONS.slice(0, 25).map(q => convertQuestionToFlashcard(q, 'prawo_cywilne' as LegalDomain)),
            ...ALL_ASO_QUESTIONS.slice(0, 25).map(q => convertQuestionToFlashcard(q, 'aso' as LegalDomain)),
        ].sort(() => Math.random() - 0.5);

        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <SpeedRunMode
                        cards={speedRunCards}
                        duration={300}
                        onComplete={(results) => {
                            setSpeedRunResults(results);
                            setView('speedrun-results');
                        }}
                        onExit={() => setView('dashboard')}
                    />
                </div>
            </div>
        );
    }

    // Speed Run Results
    if (view === 'speedrun-results' && speedRunResults) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <SpeedRunResults
                        results={speedRunResults}
                        onPlayAgain={() => {
                            setSpeedRunResults(null);
                            setView('speedrun');
                        }}
                        onExit={() => {
                            setSpeedRunResults(null);
                            setView('dashboard');
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #E8E4F0 0%, #F0E6E8 25%, #E8EEF5 50%, #F5EDE8 75%, #E8E4F0 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite'
        }}>
            <LiquidGlassSidebar
                userStats={{
                    streak: stats?.currentStreak || streakDays,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex flex-col min-h-screen">
                {/* Apple-style Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Zap size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Fiszki</h1>
                                <p className="text-sm text-gray-500">Ucz się z systemem powtórek</p>
                            </div>
                        </div>
                        {streakDays > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium">
                                <Flame size={16} />
                                <span>{streakDays} dni</span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 pb-24 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Greeting */}
                        <div className="mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Dzień dobry, {userName} 👋
                            </h1>
                        </div>

                        {/* Streak Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <Flame size={24} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{streakDays} DNI</p>
                                        <p className="text-sm text-gray-500">Dzienna seria</p>
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
                                    <span className="text-gray-500">Dzisiejszy cel</span>
                                    <span className="font-medium text-gray-900">{dailyProgress}/{dailyGoal} fiszek</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Jeszcze {dailyGoal - dailyProgress} fiszek do utrzymania serii!
                                </p>
                            </div>
                        </div>

                        {/* Smart Review CTA */}
                        <button
                            onClick={handleSmartReview}
                            className="w-full p-6 rounded-2xl transition-all hover:scale-[1.01] hover:-translate-y-0.5 group bg-blue-500/10 backdrop-blur-sm border border-blue-200/50 hover:border-blue-300 hover:bg-blue-500/15 shadow-[0_8px_32px_rgba(59,130,246,0.1)]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-600">
                                        <Zap size={28} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-bold text-gray-900">Smart Review</p>
                                        <p className="text-gray-500">
                                            AI wybrał 25 fiszek dopasowanych do Ciebie
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="mt-4 flex gap-4 text-sm text-gray-500">
                                <span>• 12 do powtórki</span>
                                <span>• 8 ze słabych punktów</span>
                                <span>• 5 nowych</span>
                            </div>
                        </button>

                        {/* Study Modes Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Speed Run CTA */}
                            <button
                                onClick={() => setView('speedrun')}
                                className="p-4 rounded-2xl transition-all hover:scale-[1.02] hover:-translate-y-0.5 group text-left bg-orange-500/10 backdrop-blur-sm border border-orange-200/50 hover:border-orange-300 hover:bg-orange-500/15 shadow-[0_8px_32px_rgba(249,115,22,0.1)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
                                        <Timer size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-orange-600">Speed Run</p>
                                        <p className="text-sm text-gray-500">
                                            5 minut na czas!
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Weak Points CTA */}
                            <button
                                className="p-4 rounded-2xl transition-all hover:scale-[1.02] hover:-translate-y-0.5 group text-left bg-red-500/10 backdrop-blur-sm border border-red-200/50 hover:border-red-300 hover:bg-red-500/15 shadow-[0_8px_32px_rgba(239,68,68,0.1)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600">
                                        <Target size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-600">Słabe punkty</p>
                                        <p className="text-sm text-gray-500">
                                            Fiszki z błędami
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Section Title */}
                        <div className="flex items-center gap-2 pt-2">
                            <BookOpen size={20} className="text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Twoje talie</h2>
                        </div>

                        {/* Deck Cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {DECKS.map(deck => {
                                const progressPercent = Math.round((deck.mastered / deck.total) * 100);
                                return (
                                    <button
                                        key={deck.id}
                                        onClick={() => handleSelectDeck(deck.id)}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all hover:scale-[1.01] group text-left"
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
                                                <h3 className="font-bold text-gray-900 mb-1">{deck.name}</h3>
                                                <p className="text-sm text-gray-500 mb-2">
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
                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Target size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Twój postęp</p>
                                        <p className="text-sm text-gray-500">
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
