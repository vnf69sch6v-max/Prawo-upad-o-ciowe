'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import {
    RotateCcw, ChevronLeft, ChevronRight, Keyboard, Volume2,
    Bookmark, Flag, Undo2, X, Trophy, Flame, Target, Clock,
    CheckCircle, XCircle, Zap
} from 'lucide-react';
import type { Flashcard } from '@/types';
import { Confetti } from '@/components/ui/confetti';

// ============================================
// TYPES
// ============================================

interface Enhanced3DFlashcardStudyProps {
    cards: Flashcard[];
    onReview: (cardId: string, quality: number, responseTime: number) => void;
    onComplete: (stats: SessionStats) => void;
    onExit: () => void;
}

interface SessionStats {
    cardsReviewed: number;
    correct: number;
    incorrect: number;
    averageTime: number;
    xpEarned: number;
    equityGained: number;
    streakMaintained: boolean;
}

interface ReviewButton {
    label: string;
    shortcut: string;
    interval: string;
    color: string;
    bgColor: string;
    quality: number;
    icon: React.ReactNode;
}

// ============================================
// REVIEW BUTTONS CONFIG
// ============================================

const REVIEW_BUTTONS: ReviewButton[] = [
    {
        label: 'Nie wiem',
        shortcut: '1',
        interval: '< 1d',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
        quality: 1,
        icon: <XCircle size={20} />
    },
    {
        label: 'Trudne',
        shortcut: '2',
        interval: '~3d',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20',
        quality: 2,
        icon: <Clock size={20} />
    },
    {
        label: 'Dobrze',
        shortcut: '3',
        interval: '~7d',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
        quality: 4,
        icon: <Target size={20} />
    },
    {
        label: 'Łatwe',
        shortcut: '4',
        interval: '~14d',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
        quality: 5,
        icon: <Zap size={20} />
    },
];

// ============================================
// 3D FLASHCARD COMPONENT
// ============================================

function Flashcard3D({
    card,
    isFlipped,
    onFlip
}: {
    card: Flashcard;
    isFlipped: boolean;
    onFlip: () => void;
}) {
    return (
        <div
            className="relative w-full h-[320px] cursor-pointer perspective-1000"
            onClick={onFlip}
            style={{ perspective: '1000px' }}
        >
            <div
                className={cn(
                    'relative w-full h-full transition-transform duration-600 transform-style-preserve-3d'
                )}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
            >
                {/* Front (Question) */}
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col"
                    style={{
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Header badges */}
                    <div className="flex items-center justify-between mb-6">
                        <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold',
                            card.difficulty === 'easy' && 'bg-green-500/20 text-green-400',
                            card.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                            card.difficulty === 'hard' && 'bg-orange-500/20 text-orange-400',
                            card.difficulty === 'expert' && 'bg-red-500/20 text-red-400'
                        )}>
                            {card.difficulty}
                        </span>
                        <span className="text-sm text-[var(--text-muted)]">
                            {card.domain.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl md:text-2xl font-medium text-center leading-relaxed">
                            {card.question}
                        </p>
                    </div>

                    {/* Footer hint */}
                    <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                        Kliknij lub naciśnij <kbd className="px-2 py-0.5 bg-[var(--bg-hover)] rounded">SPACE</kbd> aby zobaczyć odpowiedź
                    </p>
                </div>

                {/* Back (Answer) */}
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, var(--bg-card) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.2)',
                    }}
                >
                    {/* Legal reference */}
                    {card.legalReference && (
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                                {card.legalReference}
                            </span>
                        </div>
                    )}

                    {/* Answer */}
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl font-medium text-center leading-relaxed text-green-400">
                            {card.answer}
                        </p>
                    </div>

                    {/* Explanation */}
                    {card.explanation && (
                        <div className="mt-4 p-4 bg-[var(--bg-hover)] rounded-xl">
                            <p className="text-sm text-[var(--text-muted)]">
                                {card.explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// SESSION COMPLETE SCREEN
// ============================================

function SessionComplete({
    stats,
    onReviewMistakes,
    onContinue,
    onExit
}: {
    stats: SessionStats;
    onReviewMistakes: () => void;
    onContinue: () => void;
    onExit: () => void;
}) {
    const accuracy = stats.cardsReviewed > 0
        ? Math.round((stats.correct / stats.cardsReviewed) * 100)
        : 0;
    const isGoodPerformance = accuracy >= 80;

    return (
        <div className="text-center py-8 animate-fade-in">
            <Confetti active={isGoodPerformance} duration={3000} />

            {/* Celebration icon */}
            <div className="text-6xl mb-6">
                {isGoodPerformance ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
            </div>

            <h2 className="text-3xl font-bold mb-2">
                {isGoodPerformance ? 'Świetna robota!' : accuracy >= 60 ? 'Dobra praca!' : 'Ćwicz dalej!'}
            </h2>
            <p className="text-[var(--text-muted)] mb-8">
                Ukończyłeś sesję nauki
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="lex-card text-center">
                    <p className="text-3xl font-bold">{stats.cardsReviewed}</p>
                    <p className="text-xs text-[var(--text-muted)]">Karty powtórzone</p>
                </div>
                <div className="lex-card text-center">
                    <p className={cn('text-3xl font-bold', accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400')}>
                        {accuracy}%
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Skuteczność</p>
                </div>
                <div className="lex-card text-center">
                    <p className="text-3xl font-bold text-purple-400">+{stats.xpEarned}</p>
                    <p className="text-xs text-[var(--text-muted)]">XP zdobyte</p>
                </div>
                <div className="lex-card text-center">
                    <p className="text-3xl font-bold text-emerald-400">+€{stats.equityGained}</p>
                    <p className="text-xs text-[var(--text-muted)]">Knowledge Equity</p>
                </div>
            </div>

            {/* Correct/Incorrect breakdown */}
            <div className="flex justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-semibold">{stats.correct} poprawnych</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                    <XCircle size={20} />
                    <span className="font-semibold">{stats.incorrect} błędnych</span>
                </div>
            </div>

            {/* Streak badge */}
            {stats.streakMaintained && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full mb-8">
                    <Flame size={20} />
                    <span className="font-semibold">Streak utrzymany! 🔥</span>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                {stats.incorrect > 0 && (
                    <button onClick={onReviewMistakes} className="btn btn-secondary">
                        Powtórz błędy ({stats.incorrect})
                    </button>
                )}
                <button onClick={onContinue} className="btn btn-primary">
                    Kontynuuj naukę
                </button>
                <button onClick={onExit} className="btn btn-ghost">
                    Wróć do Dashboard
                </button>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function Enhanced3DFlashcardStudy({
    cards,
    onReview,
    onComplete,
    onExit,
}: Enhanced3DFlashcardStudyProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
    const [history, setHistory] = useState<{ cardId: string; quality: number }[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [showKeyboardHints, setShowKeyboardHints] = useState(true);

    const currentCard = cards[currentIndex];
    const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isComplete) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    setIsFlipped(!isFlipped);
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    if (isFlipped) {
                        const button = REVIEW_BUTTONS[parseInt(e.key) - 1];
                        if (button) handleReview(button.quality);
                    }
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) navigateCard('prev');
                    break;
                case 'ArrowRight':
                    if (currentIndex < cards.length - 1) navigateCard('next');
                    break;
                case 'Escape':
                    onExit();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, currentIndex, isComplete, cards.length]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleReview = useCallback((quality: number) => {
        const responseTime = (Date.now() - startTime) / 1000;
        onReview(currentCard.id, quality, responseTime);

        // Update stats
        const isCorrect = quality >= 3;
        setSessionStats(prev => ({
            correct: isCorrect ? prev.correct + 1 : prev.correct,
            incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
        }));

        // Add to history
        setHistory(prev => [...prev, { cardId: currentCard.id, quality }]);

        // Move to next card or complete
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setStartTime(Date.now());
        } else {
            // Session complete
            const stats: SessionStats = {
                cardsReviewed: cards.length,
                correct: sessionStats.correct + (quality >= 3 ? 1 : 0),
                incorrect: sessionStats.incorrect + (quality < 3 ? 1 : 0),
                averageTime: responseTime,
                xpEarned: (sessionStats.correct + (quality >= 3 ? 1 : 0)) * 10,
                equityGained: Math.round((sessionStats.correct + (quality >= 3 ? 1 : 0)) * 15),
                streakMaintained: true,
            };
            setIsComplete(true);
            onComplete(stats);
        }
    }, [currentCard, currentIndex, cards.length, onReview, sessionStats, startTime, onComplete]);

    const navigateCard = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (direction === 'next' && currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
        setIsFlipped(false);
        setStartTime(Date.now());
    };

    const handleUndo = () => {
        if (history.length > 0 && currentIndex > 0) {
            const lastAction = history[history.length - 1];
            const wasCorrect = lastAction.quality >= 3;

            setSessionStats(prev => ({
                correct: wasCorrect ? prev.correct - 1 : prev.correct,
                incorrect: !wasCorrect ? prev.incorrect - 1 : prev.incorrect,
            }));

            setHistory(prev => prev.slice(0, -1));
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    if (cards.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-6xl mb-4 block">✨</span>
                <h2 className="text-2xl font-bold mb-2">Brak kart do powtórki!</h2>
                <p className="text-[var(--text-muted)]">Wróć później lub dodaj nowe fiszki.</p>
            </div>
        );
    }

    if (isComplete) {
        return (
            <SessionComplete
                stats={{
                    cardsReviewed: cards.length,
                    correct: sessionStats.correct,
                    incorrect: sessionStats.incorrect,
                    averageTime: 0,
                    xpEarned: sessionStats.correct * 10,
                    equityGained: Math.round(sessionStats.correct * 15),
                    streakMaintained: true,
                }}
                onReviewMistakes={() => { }}
                onContinue={() => {
                    setIsComplete(false);
                    setCurrentIndex(0);
                    setSessionStats({ correct: 0, incorrect: 0 });
                }}
                onExit={onExit}
            />
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header with progress */}
            <div className="flex items-center justify-between">
                <button onClick={onExit} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                    <X size={20} />
                </button>

                <div className="flex-1 mx-4">
                    <div className="flex justify-between text-sm text-[var(--text-muted)] mb-1">
                        <span>Postęp sesji</span>
                        <span>{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowKeyboardHints(!showKeyboardHints)}
                    className={cn(
                        'p-2 rounded-lg transition-colors',
                        showKeyboardHints ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-[var(--bg-hover)]'
                    )}
                >
                    <Keyboard size={20} />
                </button>
            </div>

            {/* Session Stats */}
            <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} />
                    <span>{sessionStats.correct} poprawnych</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                    <XCircle size={16} />
                    <span>{sessionStats.incorrect} błędnych</span>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                    <Flame size={16} />
                    <span>{sessionStats.correct} streak</span>
                </div>
            </div>

            {/* 3D Flashcard */}
            <Flashcard3D
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
            />

            {/* Navigation */}
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => navigateCard('prev')}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={handleFlip}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] flex items-center gap-2"
                >
                    <RotateCcw size={16} />
                    Odwróć
                </button>
                <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Undo2 size={20} />
                </button>
                <button
                    onClick={() => navigateCard('next')}
                    disabled={currentIndex >= cards.length - 1}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Review Buttons (show when flipped) */}
            {isFlipped && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-center text-sm text-[var(--text-muted)]">Jak dobrze znałeś odpowiedź?</p>
                    <div className="grid grid-cols-4 gap-2">
                        {REVIEW_BUTTONS.map((button) => (
                            <button
                                key={button.quality}
                                onClick={() => handleReview(button.quality)}
                                className={cn(
                                    'p-3 rounded-xl border transition-all text-center',
                                    button.bgColor
                                )}
                            >
                                <div className={cn('mx-auto mb-1', button.color)}>
                                    {button.icon}
                                </div>
                                <span className={cn('text-sm font-medium', button.color)}>{button.label}</span>
                                {showKeyboardHints && (
                                    <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
                                        <span>{button.interval}</span>
                                        <kbd className="px-1 py-0.5 bg-[var(--bg-primary)] rounded">{button.shortcut}</kbd>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Keyboard hints */}
            {showKeyboardHints && (
                <div className="text-center text-xs text-[var(--text-muted)] space-x-4">
                    <span><kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">SPACE</kbd> Odwróć</span>
                    <span><kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">1-4</kbd> Oceń</span>
                    <span><kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">←→</kbd> Nawiguj</span>
                    <span><kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">ESC</kbd> Wyjdź</span>
                </div>
            )}
        </div>
    );
}
