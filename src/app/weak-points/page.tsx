'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Target, Play, Loader2, Trash2, Clock, TrendingUp, ChevronRight, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { useUserData } from '@/hooks/use-user-data';
import { ALL_KSH_QUESTIONS } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso';
import { ALL_MATEMATYKA_FINANSOWA_QUESTIONS } from '@/lib/data/matematyka-finansowa';
import Link from 'next/link';

// Question type from data
interface QuestionData {
    id: string;
    question: string;
    options: { a: string; b: string; c: string; d: string };
    correct: 'a' | 'b' | 'c' | 'd';
    explanation: string;
    domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso' | 'makler_a';
}

// Get all questions combined
const ALL_QUESTIONS: QuestionData[] = [
    ...ALL_KSH_QUESTIONS.map(q => ({ ...q, domain: 'ksh' as const })),
    ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.map(q => ({ ...q, domain: 'prawo_upadlosciowe' as const })),
    ...ALL_KC_QUESTIONS.map(q => ({ ...q, domain: 'prawo_cywilne' as const })),
    ...ALL_ASO_QUESTIONS.map(q => ({ ...q, domain: 'aso' as const })),
    ...ALL_MATEMATYKA_FINANSOWA_QUESTIONS.map(q => ({ ...q, domain: 'makler_a' as const }))
];

// Simple Review Component
function QuickReview({
    questions,
    onComplete,
    onAnswerResult
}: {
    questions: QuestionData[];
    onComplete: () => void;
    onAnswerResult: (questionId: string, isCorrect: boolean) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentQuestion = questions[currentIndex];
    const optionKeys = ['a', 'b', 'c', 'd'] as const;

    const handleAnswer = (answer: string) => {
        if (showResult) return;
        setSelectedAnswer(answer);
    };

    const handleCheck = () => {
        if (!selectedAnswer) return;
        setShowResult(true);
        const isCorrect = selectedAnswer === currentQuestion.correct;
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
        // Report result to parent
        onAnswerResult(currentQuestion.id, isCorrect);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            onComplete();
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                    Pytanie {currentIndex + 1} z {questions.length}
                </span>
                <span className="text-sm font-medium">
                    {score.correct}/{score.total} poprawnych
                </span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full">
                <div
                    className="h-full bg-[#ef4444] rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question */}
            <div className="lex-card">
                <p className="text-lg font-medium mb-6">{currentQuestion.question}</p>

                <div className="space-y-3">
                    {optionKeys.map(key => {
                        const isSelected = selectedAnswer === key;
                        const isCorrect = key === currentQuestion.correct;

                        let bgClass = 'bg-gray-100 hover:bg-gray-200';
                        if (showResult) {
                            if (isCorrect) bgClass = 'bg-green-500/20 border-green-500';
                            else if (isSelected && !isCorrect) bgClass = 'bg-red-500/20 border-red-500';
                        } else if (isSelected) {
                            bgClass = 'bg-[#ef4444]/20 border-[#ef4444]';
                        }

                        return (
                            <button
                                key={key}
                                onClick={() => handleAnswer(key)}
                                disabled={showResult}
                                className={cn(
                                    'w-full p-4 rounded-xl text-left transition-all border-2',
                                    bgClass,
                                    !showResult && !isSelected && 'border-transparent'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                                        showResult && isCorrect && 'bg-green-500 text-white',
                                        showResult && isSelected && !isCorrect && 'bg-red-500 text-white',
                                        !showResult && isSelected && 'bg-[#ef4444] text-white',
                                        !showResult && !isSelected && 'bg-white'
                                    )}>
                                        {key.toUpperCase()}
                                    </span>
                                    <span className="flex-1">{currentQuestion.options[key]}</span>
                                    {showResult && isCorrect && <CheckCircle className="text-green-500" size={20} />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showResult && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                        <p className="text-sm font-medium mb-1">Wyjaśnienie:</p>
                        <p className="text-sm text-gray-600">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                {!showResult ? (
                    <button
                        onClick={handleCheck}
                        disabled={!selectedAnswer}
                        className={cn(
                            'flex-1 py-4 rounded-xl font-medium transition-all',
                            selectedAnswer
                                ? 'bg-[#ef4444] text-white'
                                : 'bg-white text-gray-400 cursor-not-allowed'
                        )}
                    >
                        Sprawdź
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex-1 py-4 rounded-xl font-medium bg-[#ef4444] text-white flex items-center justify-center gap-2"
                    >
                        {currentIndex < questions.length - 1 ? 'Następne' : 'Zakończ'}
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function WeakPointsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'list' | 'practice'>('list');
    const [filter, setFilter] = useState<'all' | 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso' | 'makler_a'>('all');

    const { profile, loading: authLoading } = useAuth();
    const {
        wrongAnswers,
        loading: dataLoading,
        removeWrongAnswer,
        clearAllWrongAnswers,
        markAnswerCorrect,
        saveWrongAnswer
    } = useUserData();
    const stats = profile?.stats;

    // Filter wrong answers
    const filteredWrongAnswers = useMemo(() => {
        if (filter === 'all') return wrongAnswers;
        return wrongAnswers.filter(wa => wa.domain === filter);
    }, [wrongAnswers, filter]);

    // Get question details for each wrong answer
    const weakPoints = useMemo(() => {
        return filteredWrongAnswers
            .map(wa => {
                const question = ALL_QUESTIONS.find(q => q.id === wa.questionId);
                if (!question) return null;
                return { ...wa, question };
            })
            .filter(Boolean)
            .sort((a, b) => b!.wrongCount - a!.wrongCount);
    }, [filteredWrongAnswers]);

    // Get questions for practice mode
    const practiceQuestions = useMemo(() => {
        return weakPoints
            .slice(0, 10)
            .map(wp => wp!.question)
            .filter(Boolean) as QuestionData[];
    }, [weakPoints]);

    const handleClearAll = async () => {
        if (confirm('Czy na pewno chcesz wyczyścić wszystkie słabe punkty?')) {
            await clearAllWrongAnswers();
        }
    };

    const handleRemoveOne = async (questionId: string) => {
        await removeWrongAnswer(questionId);
    };

    const handleAnswerResult = async (questionId: string, isCorrect: boolean) => {
        if (isCorrect) {
            await markAnswerCorrect(questionId);
        } else {
            // Find domain of question
            const q = ALL_QUESTIONS.find(q => q.id === questionId);
            if (q) {
                await saveWrongAnswer(questionId, q.domain);
            }
        }
    };

    const handlePracticeComplete = () => {
        setView('list');
    };

    if (authLoading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    // Practice mode
    if (view === 'practice' && practiceQuestions.length > 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA]">
                <div className="max-w-2xl mx-auto p-6">
                    <button
                        onClick={() => setView('list')}
                        className="mb-6 text-sm text-gray-500 hover:text-[#ef4444] transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft size={16} />
                        Powrót do listy
                    </button>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#ef4444' }}>
                            <Target size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Sesja powtórkowa</h2>
                            <p className="text-sm text-gray-500">{practiceQuestions.length} pytań do powtórki</p>
                        </div>
                    </div>
                    <QuickReview
                        questions={practiceQuestions}
                        onComplete={handlePracticeComplete}
                        onAnswerResult={handleAnswerResult}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <Sidebar
                currentView="weak-points"
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
                    currentView="weak-points"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#ef4444' }}>
                                <Target size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-900">Słabe punkty</h1>
                            <p className="text-gray-500">
                                {weakPoints.length > 0
                                    ? `${weakPoints.length} pytań wymaga powtórki`
                                    : 'Brak pytań do powtórki'
                                }
                            </p>
                        </div>

                        {weakPoints.length === 0 ? (
                            /* Empty State */
                            <div className="lex-card py-16 text-center">
                                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl" style={{ background: '#ef444415' }}>
                                    🎯
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Świetna robota!</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    Nie masz żadnych słabych punktów. Rozwiązuj egzaminy, a pytania na które odpowiesz źle pojawią się tutaj.
                                </p>
                                <Link
                                    href="/exam"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
                                    style={{ background: '#1a365d' }}
                                >
                                    <Play size={20} />
                                    Rozwiąż egzamin
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Filters */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {(['all', 'ksh', 'prawo_upadlosciowe', 'prawo_cywilne', 'aso', 'makler_a'] as const).map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                className={cn(
                                                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                                    filter === f
                                                        ? 'bg-[#ef4444] text-white'
                                                        : 'bg-white text-gray-500 hover:text-[#ef4444]'
                                                )}
                                            >
                                                {f === 'all' ? 'Wszystkie' : f === 'ksh' ? 'KSH' : f === 'prawo_upadlosciowe' ? 'Prawo Upadł.' : f === 'prawo_cywilne' ? 'KC' : f === 'aso' ? 'ASO' : 'Matematyka'}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleClearAll}
                                        className="text-sm text-gray-500 hover:text-[#ef4444] flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Wyczyść wszystkie
                                    </button>
                                </div>

                                {/* Start Practice CTA */}
                                <button
                                    onClick={() => setView('practice')}
                                    className="w-full p-6 rounded-2xl transition-all group hover:scale-[1.01]"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef444420 0%, #f9731615 100%)',
                                        border: '1px solid #ef444440'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#ef4444' }}>
                                                <Play size={28} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xl font-bold">Rozpocznij powtórkę</p>
                                                <p className="text-gray-500">{Math.min(10, weakPoints.length)} pytań • ~{Math.min(10, weakPoints.length) * 2} min</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={24} className="text-[#ef4444]" />
                                    </div>
                                </button>

                                {/* Weak Points List */}
                                <div className="space-y-3">
                                    {weakPoints.slice(0, 20).map((wp) => (
                                        <div
                                            key={wp!.questionId}
                                            className="lex-card group hover:border-[#ef4444]/30 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
                                                        wp!.wrongCount >= 3 ? "bg-[#ef4444]/20 text-[#ef4444]" :
                                                            wp!.wrongCount >= 2 ? "bg-orange-500/20 text-orange-500" :
                                                                "bg-yellow-500/20 text-yellow-500"
                                                    )}
                                                >
                                                    ×{wp!.wrongCount}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium mb-2 line-clamp-2">{wp!.question.question}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(wp!.lastWrongAt).toLocaleDateString('pl-PL')}
                                                        </span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full",
                                                            wp!.domain === 'ksh' && "bg-[#1a365d]/10 text-[#1a365d]",
                                                            wp!.domain === 'prawo_upadlosciowe' && "bg-orange-500/10 text-orange-500",
                                                            wp!.domain === 'prawo_cywilne' && "bg-blue-500/10 text-blue-500",
                                                            wp!.domain === 'aso' && "bg-teal-500/10 text-teal-500",
                                                            wp!.domain === 'makler_a' && "bg-purple-500/10 text-purple-500"
                                                        )}>
                                                            {wp!.domain === 'ksh' ? 'KSH' : wp!.domain === 'prawo_upadlosciowe' ? 'Prawo Upadł.' : wp!.domain === 'prawo_cywilne' ? 'KC' : wp!.domain === 'aso' ? 'ASO' : 'Matematyka'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveOne(wp!.questionId)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#ef4444]/10 rounded-lg transition-all"
                                                    title="Usuń z listy"
                                                >
                                                    <Trash2 size={16} className="text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tip */}
                                <div className="lex-card bg-gradient-to-r from-[#ef4444]/10 to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
                                            <TrendingUp size={20} className="text-[#ef4444]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Wskazówka</p>
                                            <p className="text-sm text-gray-500">
                                                Powtarzaj słabe punkty regularnie. System automatycznie dodaje tu pytania, na które odpowiadasz błędnie podczas egzaminów.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="weak-points" onNavigate={() => { }} />
        </div>
    );
}
