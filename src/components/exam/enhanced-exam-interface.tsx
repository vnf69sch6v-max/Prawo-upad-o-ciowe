'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import {
    Clock, Flag, ChevronLeft, ChevronRight, CheckCircle, XCircle,
    AlertTriangle, Pause, Play, Grid, List, Send, RotateCcw
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ExamQuestion {
    id: string;
    text: string;
    type: 'single' | 'multiple' | 'truefalse';
    options: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
    explanation: string;
    legalBasis: string;
    domain: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    points: number;
}

interface EnhancedExamInterfaceProps {
    questions: ExamQuestion[];
    timeLimit: number; // minutes, 0 for unlimited
    config: {
        showExplanations: 'immediately' | 'after-submit' | 'never';
        allowSkip: boolean;
        allowBack: boolean;
    };
    onSubmit: (answers: Record<string, string | string[]>, timeSpent: number) => void;
    onExit: () => void;
}

interface ExamState {
    currentIndex: number;
    answers: Record<string, string | string[]>;
    flagged: Set<string>;
    timeRemaining: number;
    startedAt: Date;
    isPaused: boolean;
}

// ============================================
// TIME FORMATTER
// ============================================

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// QUESTION NAVIGATION GRID
// ============================================

function QuestionGrid({
    questions,
    currentIndex,
    answers,
    flagged,
    onSelect
}: {
    questions: ExamQuestion[];
    currentIndex: number;
    answers: Record<string, string | string[]>;
    flagged: Set<string>;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)]">
            <p className="text-sm font-medium mb-3">Nawigacja pytań</p>
            <div className="grid grid-cols-10 gap-1">
                {questions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flagged.has(q.id);
                    const isCurrent = i === currentIndex;

                    return (
                        <button
                            key={q.id}
                            onClick={() => onSelect(i)}
                            className={cn(
                                'w-8 h-8 rounded-lg text-xs font-medium transition-all relative',
                                isCurrent && 'ring-2 ring-[#1a365d]',
                                isAnswered && !isCurrent && 'bg-green-500/20 text-green-400',
                                !isAnswered && !isCurrent && 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
                                isFlagged && 'ring-2 ring-yellow-500'
                            )}
                        >
                            {i + 1}
                            {isFlagged && (
                                <Flag size={8} className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500/20" />
                    <span>Odpowiedziane</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[var(--bg-hover)]" />
                    <span>Bez odpowiedzi</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded ring-2 ring-yellow-500" />
                    <span>Oznaczone</span>
                </div>
            </div>
        </div>
    );
}

// ============================================
// CONFIRM SUBMIT MODAL
// ============================================

function ConfirmSubmitModal({
    unansweredCount,
    flaggedCount,
    onConfirm,
    onCancel,
}: {
    unansweredCount: number;
    flaggedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-w-md w-full animate-fade-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Zakończyć egzamin?</h3>
                    <p className="text-[var(--text-muted)]">
                        Czy na pewno chcesz zakończyć egzamin?
                    </p>
                </div>

                {(unansweredCount > 0 || flaggedCount > 0) && (
                    <div className="space-y-2 mb-6">
                        {unansweredCount > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <XCircle size={18} className="text-red-400" />
                                <span className="text-red-400">
                                    {unansweredCount} pytań bez odpowiedzi
                                </span>
                            </div>
                        )}
                        {flaggedCount > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <Flag size={18} className="text-yellow-400" />
                                <span className="text-yellow-400">
                                    {flaggedCount} pytań oznaczonych do przeglądu
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 btn btn-secondary">
                        Kontynuuj egzamin
                    </button>
                    <button onClick={onConfirm} className="flex-1 btn btn-primary">
                        Zakończ
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedExamInterface({
    questions,
    timeLimit,
    config,
    onSubmit,
    onExit,
}: EnhancedExamInterfaceProps) {
    const [state, setState] = useState<ExamState>({
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        timeRemaining: timeLimit * 60,
        startedAt: new Date(),
        isPaused: false,
    });

    const [showGrid, setShowGrid] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [timeWarning, setTimeWarning] = useState<'10min' | '5min' | '1min' | null>(null);

    const currentQuestion = questions[state.currentIndex];
    const isAnswered = state.answers[currentQuestion?.id] !== undefined;

    // Timer
    useEffect(() => {
        if (timeLimit === 0 || state.isPaused) return;

        const interval = setInterval(() => {
            setState(prev => {
                const newTime = prev.timeRemaining - 1;

                // Time warnings
                if (newTime === 600 && !timeWarning) setTimeWarning('10min');
                if (newTime === 300) setTimeWarning('5min');
                if (newTime === 60) setTimeWarning('1min');

                // Auto-submit at 0
                if (newTime <= 0) {
                    handleSubmit();
                    return prev;
                }

                return { ...prev, timeRemaining: newTime };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLimit, state.isPaused, timeWarning]);

    // Dismiss time warning after 5 seconds
    useEffect(() => {
        if (timeWarning) {
            const timer = setTimeout(() => setTimeWarning(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [timeWarning]);

    const handleAnswer = (optionId: string) => {
        if (currentQuestion.type === 'multiple') {
            const current = (state.answers[currentQuestion.id] as string[]) || [];
            const updated = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];

            setState(prev => ({
                ...prev,
                answers: { ...prev.answers, [currentQuestion.id]: updated },
            }));
        } else {
            setState(prev => ({
                ...prev,
                answers: { ...prev.answers, [currentQuestion.id]: optionId },
            }));
        }
    };

    const handleFlag = () => {
        setState(prev => {
            const newFlagged = new Set(prev.flagged);
            if (newFlagged.has(currentQuestion.id)) {
                newFlagged.delete(currentQuestion.id);
            } else {
                newFlagged.add(currentQuestion.id);
            }
            return { ...prev, flagged: newFlagged };
        });
    };

    const handleClearAnswer = () => {
        setState(prev => {
            const newAnswers = { ...prev.answers };
            delete newAnswers[currentQuestion.id];
            return { ...prev, answers: newAnswers };
        });
    };

    const navigateQuestion = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && state.currentIndex > 0) {
            setState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
        } else if (direction === 'next' && state.currentIndex < questions.length - 1) {
            setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
        }
    };

    const handleSubmit = useCallback(() => {
        const timeSpent = Math.floor((Date.now() - state.startedAt.getTime()) / 1000);
        onSubmit(state.answers, timeSpent);
    }, [state.answers, state.startedAt, onSubmit]);

    const unansweredCount = questions.filter(q => state.answers[q.id] === undefined).length;
    const flaggedCount = state.flagged.size;

    const getTimerColor = () => {
        if (state.timeRemaining <= 60) return 'text-red-400 animate-pulse';
        if (state.timeRemaining <= 300) return 'text-red-400';
        if (state.timeRemaining <= 600) return 'text-yellow-400';
        return 'text-white';
    };

    const isSelected = (optionId: string) => {
        const answer = state.answers[currentQuestion.id];
        if (Array.isArray(answer)) {
            return answer.includes(optionId);
        }
        return answer === optionId;
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Timer */}
                        <div className={cn('flex items-center gap-2 font-mono text-lg', getTimerColor())}>
                            <Clock size={20} />
                            <span>{formatTime(state.timeRemaining)}</span>
                            {state.isPaused && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                    PAUSED
                                </span>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-muted)]">
                                Pytanie {state.currentIndex + 1} z {questions.length}
                            </span>
                            <div className="w-32 h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-#1a365d to-#1a365d"
                                    style={{ width: `${((state.currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                className={cn(
                                    'p-2 rounded-lg transition-colors',
                                    showGrid ? 'bg-[#1a365d]/20 text-[#1a365d]' : 'hover:bg-[var(--bg-hover)]'
                                )}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                className="btn btn-primary"
                            >
                                <Send size={16} />
                                Zakończ
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Time Warning Banner */}
            {timeWarning && (
                <div className={cn(
                    'fixed top-16 left-0 right-0 z-50 py-3 text-center font-semibold animate-fade-in',
                    timeWarning === '1min' && 'bg-red-500',
                    timeWarning === '5min' && 'bg-orange-500',
                    timeWarning === '10min' && 'bg-yellow-500 text-black'
                )}>
                    {timeWarning === '10min' && '⏰ Pozostało 10 minut!'}
                    {timeWarning === '5min' && '⚠️ Pozostało tylko 5 minut!'}
                    {timeWarning === '1min' && '🚨 Ostatnia minuta!'}
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Question Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Question Card */}
                        <div className="lex-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        'px-2 py-1 rounded-full text-xs font-semibold',
                                        currentQuestion.difficulty === 'easy' && 'bg-green-500/20 text-green-400',
                                        currentQuestion.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                        currentQuestion.difficulty === 'hard' && 'bg-orange-500/20 text-orange-400',
                                        currentQuestion.difficulty === 'expert' && 'bg-red-500/20 text-red-400'
                                    )}>
                                        {currentQuestion.difficulty}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)]">
                                        {currentQuestion.domain}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleFlag}
                                        className={cn(
                                            'p-2 rounded-lg transition-colors',
                                            state.flagged.has(currentQuestion.id)
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'hover:bg-[var(--bg-hover)] text-[var(--text-muted)]'
                                        )}
                                    >
                                        <Flag size={18} className={state.flagged.has(currentQuestion.id) ? 'fill-yellow-400' : ''} />
                                    </button>
                                    <button
                                        onClick={handleClearAnswer}
                                        disabled={!isAnswered}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] disabled:opacity-50"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>
                            </div>

                            <h2 className="text-lg font-medium mb-6 leading-relaxed">
                                {state.currentIndex + 1}. {currentQuestion.text}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options
                                    .filter(option => option.text && option.text.trim() !== '')
                                    .map((option, i) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(option.id)}
                                            className={cn(
                                                'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                                                isSelected(option.id)
                                                    ? 'border-[#1a365d] bg-[#1a365d]/10'
                                                    : 'border-[var(--border-color)] hover:border-[#1a365d]/30 hover:bg-[var(--bg-hover)]'
                                            )}
                                        >
                                            <span className={cn(
                                                'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors',
                                                isSelected(option.id)
                                                    ? 'bg-[#1a365d] text-white'
                                                    : 'bg-[var(--bg-hover)]'
                                            )}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="flex-1">{option.text}</span>
                                            {currentQuestion.type === 'multiple' && (
                                                <div className={cn(
                                                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                                                    isSelected(option.id)
                                                        ? 'border-[#1a365d] bg-[#1a365d]'
                                                        : 'border-[var(--border-color)]'
                                                )}>
                                                    {isSelected(option.id) && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                            </div>

                            {currentQuestion.type === 'multiple' && (
                                <p className="text-sm text-[var(--text-muted)] mt-4">
                                    * Możesz wybrać więcej niż jedną odpowiedź
                                </p>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateQuestion('prev')}
                                disabled={state.currentIndex === 0 || !config.allowBack}
                                className="btn btn-secondary disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                                Poprzednie
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--text-muted)]">
                                    {Object.keys(state.answers).length}/{questions.length} odpowiedzi
                                </span>
                            </div>

                            <button
                                onClick={() => navigateQuestion('next')}
                                disabled={state.currentIndex >= questions.length - 1}
                                className="btn btn-primary disabled:opacity-50"
                            >
                                Następne
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - Question Grid */}
                    <div className="lg:block">
                        {showGrid && (
                            <QuestionGrid
                                questions={questions}
                                currentIndex={state.currentIndex}
                                answers={state.answers}
                                flagged={state.flagged}
                                onSelect={(i) => setState(prev => ({ ...prev, currentIndex: i }))}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <ConfirmSubmitModal
                    unansweredCount={unansweredCount}
                    flaggedCount={flaggedCount}
                    onConfirm={handleSubmit}
                    onCancel={() => setShowConfirmSubmit(false)}
                />
            )}
        </div>
    );
}
