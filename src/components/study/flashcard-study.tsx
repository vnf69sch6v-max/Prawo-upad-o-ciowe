'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { RotateCcw, ChevronLeft, ChevronRight, Lightbulb, Link2 } from 'lucide-react';
import type { Flashcard } from '@/types';
import { AIExplanationModal } from './ai-explanation-modal';

interface FlashcardStudyProps {
    cards: Flashcard[];
    onReview: (cardId: string, quality: number, responseTime: number) => void;
    onComplete: () => void;
}

type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface SessionResult {
    cardId: string;
    rating: ReviewRating;
}

// Rating buttons configuration
const RATING_CONFIG = {
    again: {
        emoji: '😵',
        label: 'Nie wiem',
        interval: '< 1 min',
        color: 'red',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        hoverBg: 'hover:bg-red-500/20',
        textColor: 'text-red-400',
        quality: 1
    },
    hard: {
        emoji: '😰',
        label: 'Trudne',
        interval: '< 10 min',
        color: 'orange',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        hoverBg: 'hover:bg-orange-500/20',
        textColor: 'text-orange-400',
        quality: 2
    },
    good: {
        emoji: '😊',
        label: 'Dobrze',
        interval: '1 dzień',
        color: 'blue',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        hoverBg: 'hover:bg-blue-500/20',
        textColor: 'text-blue-400',
        quality: 4
    },
    easy: {
        emoji: '🚀',
        label: 'Łatwe',
        interval: '4 dni',
        color: 'green',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        hoverBg: 'hover:bg-green-500/20',
        textColor: 'text-green-400',
        quality: 5
    },
};

// Get domain label and color
function getDomainInfo(domain: string): { label: string; color: string } {
    const domains: Record<string, { label: string; color: string }> = {
        'prawo_handlowe': { label: 'Prawo handlowe', color: '#1a365d' },
        'prawo_upadlosciowe': { label: 'Prawo upadłościowe', color: '#ea580c' },
        'prawo_cywilne': { label: 'Kodeks cywilny', color: '#2563eb' },
        'aso': { label: 'ASO', color: '#0d9488' },
    };
    return domains[domain] || { label: domain, color: '#6b7280' };
}

// Get difficulty info
function getDifficultyInfo(difficulty: string): { label: string; color: string; bgColor: string } {
    const levels: Record<string, { label: string; color: string; bgColor: string }> = {
        'easy': { label: 'Łatwe', color: 'text-green-400', bgColor: 'bg-green-500/20' },
        'medium': { label: 'Średnie', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
        'hard': { label: 'Trudne', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
        'expert': { label: 'Ekspert', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    };
    return levels[difficulty] || levels['medium'];
}

export function FlashcardStudy({ cards, onReview, onComplete }: FlashcardStudyProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex) / cards.length) * 100;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isFlipped) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsFlipped(true);
                }
            } else {
                if (e.key === '1') handleReview('again');
                if (e.key === '2') handleReview('hard');
                if (e.key === '3') handleReview('good');
                if (e.key === '4') handleReview('easy');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, currentIndex]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleReview = (rating: ReviewRating) => {
        const responseTime = (Date.now() - startTime) / 1000;
        const config = RATING_CONFIG[rating];
        onReview(currentCard.id, config.quality, responseTime);

        // Store result for summary
        setSessionResults(prev => [...prev, { cardId: currentCard.id, rating }]);

        // Move to next card or show summary
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setStartTime(Date.now());
        } else {
            setShowSummary(true);
        }
    };

    // Session Summary Screen
    if (showSummary) {
        const counts = {
            again: sessionResults.filter(r => r.rating === 'again').length,
            hard: sessionResults.filter(r => r.rating === 'hard').length,
            good: sessionResults.filter(r => r.rating === 'good').length,
            easy: sessionResults.filter(r => r.rating === 'easy').length,
        };
        const xpEarned = counts.again * 5 + counts.hard * 20 + counts.good * 15 + counts.easy * 10;
        const accuracyPercent = Math.round(((counts.good + counts.easy) / cards.length) * 100);
        const message = accuracyPercent >= 80 ? '🎉 ŚWIETNA ROBOTA!' :
            accuracyPercent >= 60 ? '👍 Dobra sesja!' :
                '💪 Nie poddawaj się!';

        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Celebration Header */}
                <div className="text-center py-8">
                    <p className="text-4xl mb-4">{message}</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[#1a365d]">
                        <span>⭐</span>
                        <span>+{xpEarned} XP</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="lex-card space-y-4">
                    <h3 className="font-semibold text-lg">📊 Podsumowanie sesji</h3>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{cards.length}</p>
                            <p className="text-sm text-[var(--text-muted)]">Fiszki</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{accuracyPercent}%</p>
                            <p className="text-sm text-[var(--text-muted)]">Dokładność</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{Math.round((Date.now() - startTime) / 60000) || 1}m</p>
                            <p className="text-sm text-[var(--text-muted)]">Czas</p>
                        </div>
                    </div>

                    {/* Response Distribution */}
                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-medium text-[var(--text-muted)]">Twoje odpowiedzi</p>

                        {(['easy', 'good', 'hard', 'again'] as ReviewRating[]).map(rating => {
                            const config = RATING_CONFIG[rating];
                            const count = counts[rating];
                            const percent = Math.round((count / cards.length) * 100);
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-lg w-8">{config.emoji}</span>
                                    <span className="text-sm w-20">{config.label}</span>
                                    <div className="flex-1 h-4 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all", config.bgColor.replace('/10', '/40'))}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="text-sm w-12 text-right">{count} ({percent}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onComplete}
                        className="flex-1 py-3 px-6 rounded-xl font-medium transition-all"
                        style={{ background: 'var(--bg-hover)' }}
                    >
                        Zakończ
                    </button>
                    <button
                        onClick={() => {
                            setCurrentIndex(0);
                            setSessionResults([]);
                            setShowSummary(false);
                            setIsFlipped(false);
                            setStartTime(Date.now());
                        }}
                        className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all"
                        style={{ background: '#1a365d' }}
                    >
                        Jeszcze raz →
                    </button>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🎉</span>
                <h2 className="text-2xl font-bold mb-2">Brawo!</h2>
                <p className="text-[var(--text-muted)]">Ukończyłeś wszystkie fiszki</p>
            </div>
        );
    }

    const domainInfo = getDomainInfo(currentCard.domain);
    const difficultyInfo = getDifficultyInfo(currentCard.difficulty);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">
                    {currentIndex + 1} / {cards.length}
                </span>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
                    ⋯
                </button>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex gap-1 h-2">
                {cards.map((_, i) => {
                    const result = sessionResults[i];
                    let bgColor = 'bg-[var(--bg-hover)]';
                    if (result) {
                        bgColor = result.rating === 'again' ? 'bg-red-500' :
                            result.rating === 'hard' ? 'bg-orange-500' :
                                result.rating === 'good' ? 'bg-blue-500' :
                                    'bg-green-500';
                    } else if (i === currentIndex) {
                        bgColor = 'bg-[var(--border-color)]';
                    }
                    return (
                        <div
                            key={i}
                            className={cn("flex-1 rounded-full transition-all", bgColor)}
                        />
                    );
                })}
            </div>

            {/* Flashcard */}
            <div className="perspective-1000 min-h-[350px]">
                <div
                    onClick={handleFlip}
                    className={cn(
                        'relative w-full min-h-[350px] cursor-pointer transition-transform duration-500',
                    )}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front (Question) */}
                    <div
                        className={cn(
                            'absolute inset-0 lex-card flex flex-col p-6',
                            'bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-elevated)]'
                        )}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                            <span
                                className="px-2 py-1 rounded-full"
                                style={{ background: `${domainInfo.color}20`, color: domainInfo.color }}
                            >
                                🏷️ {domainInfo.label}
                            </span>
                            <span className={cn("px-2 py-1 rounded-full", difficultyInfo.bgColor, difficultyInfo.color)}>
                                📊 {difficultyInfo.label}
                            </span>
                            {currentCard.legalReference && (
                                <span className="px-2 py-1 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)]">
                                    📖 {currentCard.legalReference}
                                </span>
                            )}
                        </div>

                        {/* Question */}
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-xl font-medium text-center leading-relaxed">
                                {currentCard.question}
                            </p>
                        </div>

                        {/* Hint */}
                        <div className="text-center mt-4">
                            <p className="text-sm text-[var(--text-muted)] animate-pulse">
                                Dotknij aby odkryć ↓
                            </p>
                        </div>
                    </div>

                    {/* Back (Answer) */}
                    <div
                        className={cn(
                            'absolute inset-0 lex-card flex flex-col p-6 overflow-y-auto',
                            'bg-gradient-to-br from-[#1a365d]/5 via-[var(--bg-card)] to-[var(--bg-card)]'
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        {/* Main Answer */}
                        <div className="mb-4">
                            <p className="text-2xl font-semibold text-[#1a365d]">
                                {currentCard.answer}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[var(--border-color)] my-4" />

                        {/* Explanation / Key Points */}
                        {currentCard.explanation && (
                            <div className="space-y-3 flex-1">
                                <p className="font-medium flex items-center gap-2">
                                    📌 <span>ZAPAMIĘTAJ:</span>
                                </p>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    {currentCard.explanation}
                                </p>
                            </div>
                        )}

                        {/* Legal Reference */}
                        {currentCard.legalReference && (
                            <p className="text-sm text-[#1a365d] mt-4">
                                📖 {currentCard.legalReference}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAIModal(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#1a365d] bg-[#1a365d]/10 hover:bg-[#1a365d]/20 transition-colors"
                            >
                                <Lightbulb size={16} />
                                Wyjaśnij więcej
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
                                <Link2 size={16} />
                                Powiązane
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => {
                        if (currentIndex > 0) {
                            setCurrentIndex(currentIndex - 1);
                            setIsFlipped(false);
                        }
                    }}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed"
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
                    onClick={() => {
                        if (currentIndex < cards.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setIsFlipped(false);
                        }
                    }}
                    disabled={currentIndex >= cards.length - 1}
                    className="p-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Review Buttons (only show when flipped) */}
            {isFlipped && (
                <div className="space-y-4 animate-fade-in">
                    <p className="text-center text-sm text-[var(--text-muted)]">
                        Jak dobrze znałeś odpowiedź?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {(['again', 'hard', 'good', 'easy'] as ReviewRating[]).map(rating => {
                            const config = RATING_CONFIG[rating];
                            return (
                                <button
                                    key={rating}
                                    onClick={() => handleReview(rating)}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all text-center",
                                        config.bgColor,
                                        config.borderColor,
                                        config.hoverBg,
                                        "hover:scale-[1.02] active:scale-[0.98]"
                                    )}
                                >
                                    <span className="text-2xl block mb-1">{config.emoji}</span>
                                    <span className={cn("text-xs font-medium block", config.textColor)}>
                                        {config.label}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                                        {config.interval}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-center text-xs text-[var(--text-muted)]">
                        Skróty: 1, 2, 3, 4 na klawiaturze
                    </p>
                </div>
            )}

            {/* AI Explanation Modal */}
            {currentCard && (
                <AIExplanationModal
                    card={currentCard}
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                />
            )}
        </div>
    );
}
