'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Heart, Bookmark, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Flashcard } from '@/types';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useHaptics, useDomainHaptics } from '@/hooks/use-haptics';

interface ImmersiveFlashcardProps {
    card: Flashcard;
    cardIndex: number;
    totalCards: number;
    onKnow: () => void;      // Swipe right
    onDontKnow: () => void;  // Swipe left
    onFavorite?: () => void; // Double tap
    showAnswer?: boolean;
    onToggleAnswer?: () => void;
}

// Get neon glow class based on domain
function getDomainGlowClass(domain: string): string {
    const domainGlows: Record<string, string> = {
        'prawo_karne': 'neon-glow-karne',
        'prawo_cywilne': 'neon-glow-cywilne',
        'kodeks_cywilny': 'neon-glow-cywilne',
        'prawo_handlowe': 'neon-glow-handlowe',
        'ksh': 'neon-glow-handlowe',
        'prawo_upadlosciowe': 'neon-glow-upadlosciowe',
        'aso': 'neon-glow-aso',
        'makler': 'neon-glow-makler',
        'egzamin-maklerski': 'neon-glow-makler',
    };
    return domainGlows[domain] || 'neon-glow-cywilne';
}

// Get neon color based on domain
function getDomainColor(domain: string): string {
    const colors: Record<string, string> = {
        'prawo_karne': 'var(--neon-karne)',
        'prawo_cywilne': 'var(--neon-cywilne)',
        'kodeks_cywilny': 'var(--neon-cywilne)',
        'prawo_handlowe': 'var(--neon-handlowe)',
        'ksh': 'var(--neon-handlowe)',
        'prawo_upadlosciowe': 'var(--neon-upadlosciowe)',
        'aso': 'var(--neon-aso)',
        'makler': 'var(--neon-makler)',
    };
    return colors[domain] || 'var(--neon-cywilne)';
}

// Get domain label
function getDomainLabel(domain: string): string {
    const labels: Record<string, string> = {
        'prawo_karne': 'Prawo karne',
        'prawo_cywilne': 'Prawo cywilne',
        'kodeks_cywilny': 'Prawo cywilne',
        'prawo_handlowe': 'Prawo handlowe',
        'ksh': 'KSH',
        'prawo_upadlosciowe': 'Prawo upadłościowe',
        'aso': 'ASO',
        'makler': 'Egzamin maklerski',
    };
    return labels[domain] || domain;
}

// Legal term patterns to highlight
const LEGAL_TERM_PATTERNS = [
    /wina umyślna/gi,
    /wina nieumyślna/gi,
    /termin zawity/gi,
    /termin przedawnienia/gi,
    /bezskuteczność/gi,
    /nieważność/gi,
    /odpowiedzialność solidarna/gi,
    /odpowiedzialność subsydiarna/gi,
    /roszczenie/gi,
    /zobowiązanie/gi,
    /spółka z o\.o\./gi,
    /spółka akcyjna/gi,
    /upadłość/gi,
    /syndyk/gi,
    /wierzyciel/gi,
    /dłużnik/gi,
    /powód/gi,
    /pozwany/gi,
    /in solidum/gi,
    /pro rata/gi,
];

// Highlight legal terms in text
function highlightLegalTerms(text: string, domain: string): React.ReactNode {
    let result: React.ReactNode[] = [text];

    LEGAL_TERM_PATTERNS.forEach((pattern, patternIndex) => {
        result = result.flatMap((segment, segmentIndex): React.ReactNode[] => {
            if (typeof segment !== 'string') return [segment];

            const matches = segment.split(pattern);
            const matchedTerms = segment.match(pattern) || [];

            if (matches.length === 1) return [segment];

            return matches.flatMap((part, i) => {
                if (i === matches.length - 1) return part || [];
                const term = matchedTerms[i];
                return [
                    part,
                    <span
                        key={`${patternIndex}-${segmentIndex}-${i}`}
                        className="kinetic-keyword font-semibold"
                        style={{ color: getDomainColor(domain) }}
                    >
                        {term}
                    </span>,
                ];
            }).filter(Boolean);
        });
    });

    return result;
}

export function ImmersiveFlashcard({
    card,
    cardIndex,
    totalCards,
    onKnow,
    onDontKnow,
    onFavorite,
    showAnswer = false,
    onToggleAnswer,
}: ImmersiveFlashcardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [showGestureHint, setShowGestureHint] = useState(true);
    const [swipeFlash, setSwipeFlash] = useState<'success' | 'error' | null>(null);

    const { trigger } = useHaptics();
    const { triggerForDomain } = useDomainHaptics();

    // Hide gesture hint after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowGestureHint(false), 3000);
        return () => clearTimeout(timer);
    }, [card.id]);

    // Handle favorite
    const handleFavorite = useCallback(() => {
        setIsFavorited(!isFavorited);
        trigger('selection');
        onFavorite?.();
    }, [isFavorited, onFavorite, trigger]);

    // Handle swipe completion with visual feedback
    const handleSwipeRight = useCallback(() => {
        setSwipeFlash('success');
        setTimeout(() => {
            setSwipeFlash(null);
            onKnow();
        }, 300);
    }, [onKnow]);

    const handleSwipeLeft = useCallback(() => {
        setSwipeFlash('error');
        setTimeout(() => {
            setSwipeFlash(null);
            onDontKnow();
        }, 300);
    }, [onDontKnow]);

    // Handle long press to show answer
    const handleLongPress = useCallback(() => {
        onToggleAnswer?.();
    }, [onToggleAnswer]);

    const handleLongPressEnd = useCallback(() => {
        // Optionally hide answer when long press ends
        // onToggleAnswer?.();
    }, []);

    // Initialize swipe gesture
    const {
        handlers,
        swipeProgress,
        swipeDirection,
        isLongPressing,
        transform,
    } = useSwipeGesture({
        threshold: 100,
        resistanceOnLeft: true,
        resistanceFactor: 0.6,
        enableHaptics: true,
        onSwipeRight: handleSwipeRight,
        onSwipeLeft: handleSwipeLeft,
        onLongPress: handleLongPress,
        onLongPressEnd: handleLongPressEnd,
        onDoubleTap: handleFavorite,
    });

    // Trigger domain haptic on card mount
    useEffect(() => {
        triggerForDomain(card.domain);
    }, [card.id, card.domain, triggerForDomain]);

    const domainColor = getDomainColor(card.domain);
    const glowClass = getDomainGlowClass(card.domain);

    // Calculate dynamic border/glow based on swipe progress
    const dynamicGlow = useMemo(() => {
        if (swipeProgress < 0.3) return {};

        const color = swipeDirection === 'right'
            ? `rgba(34, 197, 94, ${swipeProgress * 0.8})`
            : `rgba(239, 68, 68, ${swipeProgress * 0.8})`;

        return {
            boxShadow: `0 0 ${30 + swipeProgress * 40}px ${color}`,
        };
    }, [swipeProgress, swipeDirection]);

    return (
        <div className="relative w-full max-w-xl mx-auto select-none">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm text-[var(--text-muted)]">
                    {cardIndex + 1} / {totalCards}
                </span>
                <button
                    onClick={handleFavorite}
                    className={cn(
                        "p-2 rounded-full transition-all",
                        isFavorited
                            ? "text-red-500 bg-red-500/20 animate-heart-pop"
                            : "text-[var(--text-muted)] hover:text-red-400"
                    )}
                >
                    <Heart
                        size={20}
                        fill={isFavorited ? "currentColor" : "none"}
                    />
                </button>
            </div>

            {/* Main card */}
            <div
                {...handlers}
                className={cn(
                    "immersive-card relative cursor-grab active:cursor-grabbing",
                    glowClass,
                    swipeFlash === 'success' && 'swipe-glow-success',
                    swipeFlash === 'error' && 'swipe-glow-error',
                )}
                style={{
                    transform: transform || undefined,
                    transition: transform ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ...dynamicGlow,
                }}
            >
                {/* Domain badge */}
                <div
                    className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-xs font-medium glass-card"
                    style={{
                        borderColor: `${domainColor}40`,
                        color: domainColor,
                    }}
                >
                    {getDomainLabel(card.domain)}
                </div>

                {/* Question / Answer */}
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                    {!showAnswer && !isLongPressing ? (
                        <p className="immersive-question animate-fade-in">
                            {highlightLegalTerms(card.question, card.domain)}
                        </p>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <p
                                className="immersive-answer"
                                style={{ color: domainColor }}
                            >
                                {card.answer}
                            </p>
                            {card.explanation && (
                                <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                                    {card.explanation}
                                </p>
                            )}
                            {card.legalReference && (
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: domainColor }}
                                >
                                    📖 {card.legalReference}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Gesture hints */}
                {showGestureHint && !showAnswer && (
                    <div className="gesture-hint gesture-hint-fadeout">
                        <span className="flex items-center gap-1 text-red-400">
                            <ArrowLeft size={16} />
                            Nie wiem
                        </span>
                        <span className="text-[var(--text-subtle)]">|</span>
                        <span className="flex items-center gap-1 text-green-400">
                            Wiem
                            <ArrowRight size={16} />
                        </span>
                    </div>
                )}

                {/* Long press hint */}
                {!showAnswer && !showGestureHint && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <span className="text-xs text-[var(--text-subtle)] animate-pulse">
                            Przytrzymaj aby zobaczyć odpowiedź
                        </span>
                    </div>
                )}

                {/* Swipe progress indicators */}
                {swipeProgress > 0.2 && (
                    <>
                        {swipeDirection === 'left' && (
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl transition-opacity"
                                style={{ opacity: swipeProgress }}
                            >
                                ❌
                            </div>
                        )}
                        {swipeDirection === 'right' && (
                            <div
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl transition-opacity"
                                style={{ opacity: swipeProgress }}
                            >
                                ✅
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick action buttons (fallback for non-touch) */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={onDontKnow}
                    className="btn btn-secondary flex-1 max-w-[140px] gap-2"
                >
                    <span className="text-red-400">←</span>
                    Nie wiem
                </button>
                <button
                    onClick={() => onToggleAnswer?.()}
                    className="btn btn-secondary px-6"
                >
                    {showAnswer ? 'Pytanie' : 'Odpowiedź'}
                </button>
                <button
                    onClick={onKnow}
                    className="btn btn-secondary flex-1 max-w-[140px] gap-2"
                >
                    Wiem
                    <span className="text-green-400">→</span>
                </button>
            </div>
        </div>
    );
}

export default ImmersiveFlashcard;
