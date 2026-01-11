'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { RotateCcw, ChevronLeft, ChevronRight, Clock, Target, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { Flashcard } from '@/types';

interface FlashcardStudyProps {
    cards: Flashcard[];
    onReview: (cardId: string, quality: number, responseTime: number) => void;
    onComplete: () => void;
}

export function FlashcardStudy({ cards, onReview, onComplete }: FlashcardStudyProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleReview = (quality: number) => {
        const responseTime = (Date.now() - startTime) / 1000;
        onReview(currentCard.id, quality, responseTime);

        // Update session stats
        setSessionStats(prev => ({
            correct: quality >= 3 ? prev.correct + 1 : prev.correct,
            incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
        }));

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setStartTime(Date.now());
        } else {
            onComplete();
        }
    };

    const navigateCard = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (direction === 'next' && currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
        setIsFlipped(false);
        setStartTime(Date.now());
    };

    if (!currentCard) {
        return (
            <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🎉</span>
                <h2 className="text-2xl font-bold mb-2">Brawo!</h2>
                <p className="text-[var(--text-muted)]">Ukończyłeś wszystkie fiszki</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-[var(--text-muted)]">
                    <span>Postęp sesji</span>
                    <span>{currentIndex + 1} / {cards.length}</span>
                </div>
                <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-#1a365d to-#1a365d transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
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
            </div>

            {/* Flashcard */}
            <div className="perspective-1000">
                <div
                    onClick={handleFlip}
                    className={cn(
                        'relative w-full min-h-[300px] cursor-pointer transition-transform duration-500 transform-style-preserve-3d',
                        isFlipped && 'rotate-y-180'
                    )}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front (Question) */}
                    <div
                        className={cn(
                            'absolute inset-0 lex-card flex flex-col justify-center items-center text-center backface-hidden p-8',
                            'bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)]'
                        )}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <span className={cn(
                                'px-2 py-1 rounded-full',
                                currentCard.difficulty === 'easy' && 'bg-green-500/20 text-green-400',
                                currentCard.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                currentCard.difficulty === 'hard' && 'bg-orange-500/20 text-orange-400',
                                currentCard.difficulty === 'expert' && 'bg-red-500/20 text-red-400'
                            )}>
                                {currentCard.difficulty}
                            </span>
                            <span>{currentCard.domain.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xl font-medium">{currentCard.question}</p>
                        <p className="mt-6 text-sm text-[var(--text-muted)]">Kliknij, aby zobaczyć odpowiedź</p>
                    </div>

                    {/* Back (Answer) */}
                    <div
                        className={cn(
                            'absolute inset-0 lex-card flex flex-col justify-center items-center text-center p-8',
                            'bg-gradient-to-br from-purple-900/30 to-[var(--bg-card)]'
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <p className="text-xl font-medium text-green-400 mb-4">{currentCard.answer}</p>
                        {currentCard.legalReference && (
                            <p className="text-sm text-#1a365d mb-2">{currentCard.legalReference}</p>
                        )}
                        {currentCard.explanation && (
                            <p className="text-sm text-[var(--text-muted)] mt-4">{currentCard.explanation}</p>
                        )}
                    </div>
                </div>
            </div>

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
                    onClick={() => navigateCard('next')}
                    disabled={currentIndex >= cards.length - 1}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Review Buttons (only show when flipped) */}
            {isFlipped && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-center text-sm text-[var(--text-muted)]">Jak dobrze znałeś odpowiedź?</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => handleReview(1)}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all text-center"
                        >
                            <XCircle size={20} className="mx-auto mb-1 text-red-400" />
                            <span className="text-xs text-red-400">Nie wiem</span>
                        </button>
                        <button
                            onClick={() => handleReview(3)}
                            className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all text-center"
                        >
                            <Clock size={20} className="mx-auto mb-1 text-yellow-400" />
                            <span className="text-xs text-yellow-400">Trudne</span>
                        </button>
                        <button
                            onClick={() => handleReview(4)}
                            className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all text-center"
                        >
                            <Target size={20} className="mx-auto mb-1 text-blue-400" />
                            <span className="text-xs text-blue-400">Dobrze</span>
                        </button>
                        <button
                            onClick={() => handleReview(5)}
                            className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all text-center"
                        >
                            <Zap size={20} className="mx-auto mb-1 text-green-400" />
                            <span className="text-xs text-green-400">Łatwe</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
