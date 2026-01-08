'use client';

import { cn } from '@/lib/utils/cn';
import { CheckCircle, XCircle, Clock, Target, TrendingUp, RotateCcw } from 'lucide-react';

interface ExamResultsProps {
    examTitle: string;
    score: number;
    passed: boolean;
    passingThreshold: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
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
    results,
    onRetry,
    onBack,
}: ExamResultsProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
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
                    <Target size={24} className="mx-auto mb-2 text-purple-400" />
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
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 font-medium flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Spróbuj ponownie
                    </button>
                )}
            </div>
        </div>
    );
}
