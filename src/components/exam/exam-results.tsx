'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, XCircle, Clock, Target, TrendingUp, RotateCcw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useStudentProfile } from '@/hooks/use-student-profile';

interface QuestionResult {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    article?: string;
    domain?: string;
}

interface ExamResultsProps {
    examTitle: string;
    score: number;
    passed: boolean;
    passingThreshold: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    questionResults?: QuestionResult[];
    results?: Record<string, {
        correct: boolean;
        correctAnswer: string;
        explanation: string;
    }>;
    onRetry?: () => void;
    onBack: () => void;
}

export function ExamResults({
    examTitle,
    score,
    passed,
    passingThreshold,
    correctAnswers,
    totalQuestions,
    timeSpent,
    questionResults,
    onRetry,
    onBack,
}: ExamResultsProps) {
    const [showReview, setShowReview] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const { recordAnswer } = useStudentProfile();
    const hasRecorded = useRef(false);

    // Record all answers to student profile when results are shown
    useEffect(() => {
        if (!questionResults || hasRecorded.current) return;
        hasRecorded.current = true;

        const avgTimePerQuestion = Math.round((timeSpent * 1000) / questionResults.length);

        questionResults.forEach((q) => {
            recordAnswer({
                questionId: q.id,
                topic: q.domain || examTitle,
                selectedAnswer: q.userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect: q.isCorrect,
                difficulty: 5, // Default medium difficulty
                timeToAnswer: avgTimePerQuestion,
            });
        });
    }, [questionResults, examTitle, timeSpent, recordAnswer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const toggleQuestion = (id: string) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        if (questionResults) {
            setExpandedQuestions(new Set(questionResults.map(q => q.id)));
        }
    };

    const collapseAll = () => {
        setExpandedQuestions(new Set());
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
            {/* Result Header */}
            <div className={cn(
                'lex-card text-center py-8',
                passed
                    ? 'bg-gradient-to-br from-green-900/30 to-[var(--bg-card)]'
                    : 'bg-gradient-to-br from-red-900/30 to-[var(--bg-card)]'
            )}>
                <div className={cn(
                    'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
                    passed ? 'bg-green-500/20' : 'bg-red-500/20'
                )}>
                    {passed ? (
                        <CheckCircle size={40} className="text-green-400" />
                    ) : (
                        <XCircle size={40} className="text-red-400" />
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-2">
                    {passed ? '🎉 Gratulacje!' : '😔 Spróbuj ponownie'}
                </h1>
                <p className={cn(
                    'text-lg',
                    passed ? 'text-green-400' : 'text-red-400'
                )}>
                    {passed ? 'Zdałeś egzamin!' : 'Nie udało się zdać'}
                </p>

                <div className="mt-6">
                    <div className="text-6xl font-bold mb-2">{score}%</div>
                    <p className="text-[var(--text-muted)]">
                        Wymagane: {passingThreshold}%
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="lex-card text-center">
                    <Target size={24} className="mx-auto mb-2 text-[#1a365d]" />
                    <p className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</p>
                    <p className="text-xs text-[var(--text-muted)]">Poprawne odpowiedzi</p>
                </div>
                <div className="lex-card text-center">
                    <Clock size={24} className="mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
                    <p className="text-xs text-[var(--text-muted)]">Czas</p>
                </div>
                <div className="lex-card text-center">
                    <TrendingUp size={24} className="mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold">
                        {Math.round((correctAnswers / totalQuestions) * 100)}%
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Skuteczność</p>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="lex-card">
                <h3 className="text-lg font-semibold mb-4">Podsumowanie</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Poprawne</span>
                        <span className="text-green-400 font-medium">{correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Niepoprawne</span>
                        <span className="text-red-400 font-medium">{totalQuestions - correctAnswers}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden mt-4">
                        <div
                            className={cn(
                                'h-full rounded-full',
                                passed ? 'bg-green-500' : 'bg-red-500'
                            )}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Toggle Review Button */}
            {questionResults && questionResults.length > 0 && (
                <button
                    onClick={() => setShowReview(!showReview)}
                    className="w-full lex-card flex items-center justify-center gap-2 py-4 hover:border-[#1a365d]/50 transition-all"
                >
                    <BookOpen size={20} className="text-[#1a365d]" />
                    <span className="font-medium">
                        {showReview ? 'Ukryj przegląd odpowiedzi' : 'Zobacz przegląd odpowiedzi'}
                    </span>
                    {showReview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            )}

            {/* Question Review */}
            {showReview && questionResults && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Przegląd odpowiedzi</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={expandAll}
                                className="text-sm text-[#1a365d] hover:text-purple-300"
                            >
                                Rozwiń wszystkie
                            </button>
                            <span className="text-[var(--text-muted)]">|</span>
                            <button
                                onClick={collapseAll}
                                className="text-sm text-[#1a365d] hover:text-purple-300"
                            >
                                Zwiń wszystkie
                            </button>
                        </div>
                    </div>

                    {questionResults.map((q, index) => {
                        const isExpanded = expandedQuestions.has(q.id);
                        return (
                            <div
                                key={q.id}
                                className={cn(
                                    'lex-card overflow-hidden transition-all',
                                    q.isCorrect
                                        ? 'border-green-500/30'
                                        : 'border-red-500/30'
                                )}
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => toggleQuestion(q.id)}
                                    className="w-full flex items-start gap-4 text-left"
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                                        q.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                                    )}>
                                        {q.isCorrect ? (
                                            <CheckCircle size={18} className="text-green-400" />
                                        ) : (
                                            <XCircle size={18} className="text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-[var(--text-muted)]">
                                                Pytanie {index + 1}
                                            </span>
                                            {q.article && (
                                                <span className="text-xs px-2 py-0.5 bg-[#1a365d]/20 text-[#1a365d] rounded">
                                                    {q.article}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium line-clamp-2">{q.question}</p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp size={20} className="text-[var(--text-muted)] shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-[var(--text-muted)] shrink-0" />
                                    )}
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
                                        {/* Answer Options */}
                                        <div className="space-y-2">
                                            {q.options.map(opt => {
                                                const isUserAnswer = opt.id === q.userAnswer;
                                                const isCorrectAnswer = opt.id === q.correctAnswer;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        className={cn(
                                                            'p-3 rounded-lg border text-sm',
                                                            isCorrectAnswer
                                                                ? 'bg-green-500/10 border-green-500/50 text-green-300'
                                                                : isUserAnswer && !isCorrectAnswer
                                                                    ? 'bg-red-500/10 border-red-500/50 text-red-300'
                                                                    : 'bg-[var(--bg-hover)] border-transparent text-[var(--text-secondary)]'
                                                        )}
                                                    >
                                                        <span className="font-medium mr-2">
                                                            {opt.id.toUpperCase()}.
                                                        </span>
                                                        {opt.text}
                                                        {isCorrectAnswer && (
                                                            <span className="ml-2 text-green-400">✓ Poprawna</span>
                                                        )}
                                                        {isUserAnswer && !isCorrectAnswer && (
                                                            <span className="ml-2 text-red-400">✗ Twoja odpowiedź</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Explanation */}
                                        {q.explanation && (
                                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                    📖 Wyjaśnienie:
                                                </h4>
                                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 bg-[var(--bg-hover)] rounded-xl hover:bg-[var(--bg-elevated)] font-medium"
                >
                    ← Wróć do egzaminów
                </button>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex-1 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#1a365d] font-medium flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Spróbuj ponownie
                    </button>
                )}
            </div>
        </div>
    );
}
