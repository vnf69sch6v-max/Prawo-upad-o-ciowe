'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Flag } from 'lucide-react';

interface ExamQuestion {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    domain: string;
    difficulty: string;
}

interface ExamSimulatorProps {
    sessionId: string;
    examTitle: string;
    questions: ExamQuestion[];
    timeLimit: number; // in seconds, 0 = no limit
    onSubmit: (answers: Record<string, string>, timeSpent: number) => void;
    onCancel: () => void;
}

export function ExamSimulator({
    sessionId,
    examTitle,
    questions,
    timeLimit,
    onSubmit,
    onCancel,
}: ExamSimulatorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [showConfirm, setShowConfirm] = useState(false);
    const [startTime] = useState(Date.now());

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    // Timer
    useEffect(() => {
        if (timeLimit <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLimit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionId,
        }));
    };

    const toggleFlag = () => {
        setFlagged(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentQuestion.id)) {
                newSet.delete(currentQuestion.id);
            } else {
                newSet.add(currentQuestion.id);
            }
            return newSet;
        });
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentIndex(index);
        }
    };

    const handleSubmit = () => {
        // Calculate time spent in seconds
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onSubmit(answers, timeSpent);
    };

    return (
        <div className="h-screen flex flex-col bg-[#F8F9FA]">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">{examTitle}</h1>
                    <p className="text-sm text-gray-500">
                        Pytanie {currentIndex + 1} z {questions.length}
                    </p>
                </div>

                {timeLimit > 0 && (
                    <div className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg',
                        timeRemaining < 60 ? 'bg-red-500/20 text-red-500' : 'bg-gray-100 text-gray-700'
                    )}>
                        <Clock size={18} />
                        <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                    </div>
                )}

                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                >
                    Anuluj
                </button>
            </header>

            {/* Progress */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-gradient-to-r from-[#1a365d] to-[#2c5282] transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Question Navigation Sidebar */}
                <aside className="hidden lg:block w-64 border-r border-gray-200 p-4 overflow-y-auto bg-white">
                    <h3 className="text-sm font-semibold mb-3 text-gray-500">Nawigacja</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => goToQuestion(i)}
                                className={cn(
                                    'w-10 h-10 rounded-lg text-sm font-medium transition-all relative',
                                    i === currentIndex && 'ring-2 ring-[#1a365d]',
                                    answers[q.id]
                                        ? 'bg-green-500/20 text-green-600'
                                        : 'bg-gray-100 text-gray-500'
                                )}
                            >
                                {i + 1}
                                {flagged.has(q.id) && (
                                    <Flag size={10} className="absolute -top-1 -right-1 text-orange-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500/20" />
                            <span className="text-gray-500">Odpowiedziano ({answeredCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-100" />
                            <span className="text-gray-500">Bez odpowiedzi ({questions.length - answeredCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Flag size={12} className="text-orange-400" />
                            <span className="text-gray-500">Oznaczone ({flagged.size})</span>
                        </div>
                    </div>
                </aside>

                {/* Question */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {/* Question Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className={cn(
                                'px-2 py-1 rounded text-xs font-medium',
                                currentQuestion.difficulty === 'easy' && 'bg-green-500/20 text-green-600',
                                currentQuestion.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-600',
                                currentQuestion.difficulty === 'hard' && 'bg-orange-500/20 text-orange-600',
                                currentQuestion.difficulty === 'expert' && 'bg-red-500/20 text-red-600'
                            )}>
                                {currentQuestion.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                                {currentQuestion.domain.replace('_', ' ')}
                            </span>
                            <button
                                onClick={toggleFlag}
                                className={cn(
                                    'ml-auto p-2 rounded-lg',
                                    flagged.has(currentQuestion.id)
                                        ? 'bg-orange-500/20 text-orange-500'
                                        : 'bg-gray-100 text-gray-500 hover:text-orange-500'
                                )}
                            >
                                <Flag size={16} />
                            </button>
                        </div>

                        {/* Question Text */}
                        <div className="lex-card mb-6">
                            <p className="text-lg text-gray-900">{currentQuestion.text}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options
                                .filter(option => option.text && option.text.trim() !== '')
                                .map((option, i) => {
                                    const isSelected = answers[currentQuestion.id] === option.id;
                                    const letter = String.fromCharCode(65 + i);
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(option.id)}
                                            className={cn(
                                                'w-full p-4 rounded-xl text-left transition-all flex items-start gap-4',
                                                isSelected
                                                    ? 'bg-[#1a365d]/20 border-2 border-[#1a365d]'
                                                    : 'bg-white border border-gray-200 hover:border-[#1a365d]/50'
                                            )}
                                        >
                                            <span className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold',
                                                isSelected
                                                    ? 'bg-[#1a365d] text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            )}>
                                                {letter}
                                            </span>
                                            <span className="flex-1 text-gray-900">{option.text}</span>
                                            {isSelected && <CheckCircle size={20} className="text-[#1a365d] shrink-0" />}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
                <button
                    onClick={() => goToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
                >
                    <ChevronLeft size={18} />
                    Poprzednie
                </button>

                <div className="text-sm text-gray-500">
                    {answeredCount} / {questions.length} odpowiedzi
                </div>

                {currentIndex < questions.length - 1 ? (
                    <button
                        onClick={() => goToQuestion(currentIndex + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282]"
                    >
                        Następne
                        <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
                    >
                        <CheckCircle size={18} />
                        Zakończ egzamin
                    </button>
                )}
            </footer>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="lex-card max-w-md w-full animate-fade-in">
                        <AlertCircle size={40} className="mx-auto mb-4 text-yellow-500" />
                        <h3 className="text-xl font-bold text-center mb-2 text-gray-900">Zakończyć egzamin?</h3>
                        <p className="text-center text-gray-500 mb-6">
                            Odpowiedziałeś na {answeredCount} z {questions.length} pytań.
                            {questions.length - answeredCount > 0 && (
                                <span className="text-yellow-600">
                                    {' '}Pozostało {questions.length - answeredCount} bez odpowiedzi.
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                            >
                                Wróć
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500"
                            >
                                Zakończ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
