// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE FLASHCARD STUDY SESSION
// Complete study experience with SM-2 algorithm
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    useFlashcardSession,
    useSmartReview,
    useUserFlashcardStats,
    useStreak,
    formatInterval,
    previewInterval,
    type Rating,
    type FlashcardWithProgress
} from '@/hooks/use-adaptive-flashcards'
import confetti from 'canvas-confetti'
import {
    ChevronLeft,
    Flame,
    Zap,
    Brain,
    Clock,
    Sparkles,
    CheckCircle
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// cn helper (jeśli nie istnieje)
// ═══════════════════════════════════════════════════════════════

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

// ═══════════════════════════════════════════════════════════════
// MAIN: AdaptiveFlashcardSession
// ═══════════════════════════════════════════════════════════════

interface AdaptiveFlashcardSessionProps {
    deckId?: string
    sessionType?: 'normal' | 'smart_review' | 'weak_points' | 'new_only'
    onClose: () => void
}

export function AdaptiveFlashcardSession({
    deckId,
    sessionType = 'smart_review',
    onClose
}: AdaptiveFlashcardSessionProps) {
    const [phase, setPhase] = useState<'loading' | 'study' | 'summary'>('loading')
    const [summaryData, setSummaryData] = useState<{
        session: any
        results: any[]
        newAchievements: any[]
    } | null>(null)

    // Hooks
    const { data: cards, isLoading: isLoadingCards } = useSmartReview(deckId, 25)
    const {
        session,
        currentCard,
        isFlipped,
        progress,
        isLastCard,
        startSession,
        submitAnswer,
        endSession,
        flipCard,
        resetSession,
        isStarting,
        isSubmitting
    } = useFlashcardSession()

    // Start session when cards loaded
    useEffect(() => {
        if (cards && cards.length > 0 && !session && !isStarting) {
            startSession({
                deckId,
                sessionType,
                cardsToReview: cards
            })
            setPhase('study')
        }
    }, [cards, session, isStarting, deckId, sessionType, startSession])

    // Handle session end
    const handleEndSession = async () => {
        try {
            const result = await endSession()
            setSummaryData(result)
            setPhase('summary')

            // Confetti dla dobrego wyniku
            if (result.session.cards_reviewed > 0) {
                const accuracy = (result.session.cards_good + result.session.cards_easy) / result.session.cards_reviewed
                if (accuracy >= 0.8) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })
                }
            }
        } catch (error) {
            console.error('Failed to end session:', error)
        }
    }

    // Handle answer
    const handleAnswer = (rating: Rating) => {
        submitAnswer(rating)

        // Auto-end jeśli ostatnia karta
        if (isLastCard) {
            setTimeout(() => handleEndSession(), 500)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== 'study') return

            if (!isFlipped && e.key === ' ') {
                e.preventDefault()
                flipCard()
            } else if (isFlipped) {
                switch (e.key) {
                    case '1': handleAnswer('again'); break
                    case '2': handleAnswer('hard'); break
                    case '3': handleAnswer('good'); break
                    case '4': handleAnswer('easy'); break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [phase, isFlipped, flipCard])

    // Loading state
    if (phase === 'loading' || isLoadingCards || !cards) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Przygotowuję fiszki...</p>
                </div>
            </div>
        )
    }

    // No cards
    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Wszystko przerobione!</h2>
                    <p className="text-gray-600 mb-6">
                        Nie masz żadnych fiszek do powtórki. Wróć później lub dodaj nowe fiszki.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Wróć
                    </button>
                </div>
            </div>
        )
    }

    // Summary phase
    if (phase === 'summary' && summaryData) {
        return (
            <SessionSummary
                data={summaryData}
                onClose={() => {
                    resetSession()
                    onClose()
                }}
                onContinue={() => {
                    resetSession()
                    setPhase('loading')
                    setSummaryData(null)
                }}
            />
        )
    }

    // Study phase
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Zakończ</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {progress.current} / {progress.total}
                        </span>
                        {session && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <Zap className="w-4 h-4" />
                                +{session.xp_earned} XP
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <SegmentedProgressBar results={progress.results} total={progress.total} />

            {/* Card area */}
            <main className="flex-1 flex items-center justify-center p-4">
                {currentCard && (
                    <FlashcardCard
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={flipCard}
                        onAnswer={handleAnswer}
                        isSubmitting={isSubmitting}
                    />
                )}
            </main>

            {/* Keyboard hints */}
            <footer className="bg-white border-t px-4 py-2">
                <div className="max-w-2xl mx-auto text-center text-sm text-gray-400">
                    {isFlipped
                        ? 'Klawisze: 1 (Nie wiem) • 2 (Trudne) • 3 (Dobrze) • 4 (Łatwe)'
                        : 'Naciśnij spację aby odkryć odpowiedź'
                    }
                </div>
            </footer>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Segmented Progress Bar
// ═══════════════════════════════════════════════════════════════

interface SegmentedProgressBarProps {
    results: { rating: Rating }[]
    total: number
}

function SegmentedProgressBar({ results, total }: SegmentedProgressBarProps) {
    const ratingColors: Record<Rating, string> = {
        again: 'bg-red-500',
        hard: 'bg-orange-500',
        good: 'bg-green-500',
        easy: 'bg-emerald-400'
    }

    return (
        <div className="h-1.5 bg-gray-200 flex">
            {Array.from({ length: total }).map((_, i) => {
                const result = results[i]
                return (
                    <div
                        key={i}
                        className={cn(
                            'flex-1 transition-colors duration-300',
                            result ? ratingColors[result.rating] : 'bg-gray-200'
                        )}
                    />
                )
            })}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Flashcard Card Component
// ═══════════════════════════════════════════════════════════════

interface FlashcardCardProps {
    card: FlashcardWithProgress
    isFlipped: boolean
    onFlip: () => void
    onAnswer: (rating: Rating) => void
    isSubmitting: boolean
}

function FlashcardCard({ card, isFlipped, onFlip, onAnswer, isSubmitting }: FlashcardCardProps) {
    const currentInterval = card.interval_days || 0
    const currentEase = card.ease_factor || 2.5

    const getDifficultyLabel = (difficulty: number) => {
        if (difficulty <= 3) return { label: '🟢 Łatwe', color: 'bg-green-100 text-green-700' }
        if (difficulty <= 6) return { label: '🟡 Średnie', color: 'bg-yellow-100 text-yellow-700' }
        return { label: '🔴 Trudne', color: 'bg-red-100 text-red-700' }
    }

    const difficulty = getDifficultyLabel(card.base_difficulty || 5)

    return (
        <div className="w-full max-w-xl">
            {/* Card */}
            <motion.div
                className="relative"
                style={{ perspective: 1000 }}
            >
                <motion.div
                    className={cn(
                        'bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer',
                        'min-h-[400px] flex flex-col'
                    )}
                    onClick={() => !isFlipped && onFlip()}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front (Question) */}
                    <div
                        className={cn(
                            'absolute inset-0 p-6 flex flex-col',
                            isFlipped && 'invisible'
                        )}
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {card.legal_basis && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    📖 {card.legal_basis}
                                </span>
                            )}
                            <span className={cn('px-2 py-1 text-xs font-medium rounded-full', difficulty.color)}>
                                {difficulty.label}
                            </span>
                            {card.priority_type && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    {card.priority_type === 'overdue' ? '⏰ Do powtórki' :
                                        card.priority_type === 'weak_point' ? '🎯 Słaby punkt' : '🆕 Nowa'}
                                </span>
                            )}
                        </div>

                        {/* Question */}
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-xl text-center font-medium text-gray-900 leading-relaxed">
                                {card.question}
                            </p>
                        </div>

                        {/* Hint to flip */}
                        <div className="text-center text-gray-400 text-sm mt-4">
                            Dotknij aby odkryć odpowiedź
                        </div>
                    </div>

                    {/* Back (Answer) */}
                    <div
                        className={cn(
                            'absolute inset-0 p-6 flex flex-col',
                            !isFlipped && 'invisible'
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        {/* Short answer */}
                        <div className="text-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-600">
                                {card.answer_short}
                            </h3>
                            {card.legal_basis && (
                                <p className="text-sm text-gray-500 mt-1">{card.legal_basis}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t my-4" />

                        {/* Full explanation */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                {card.answer_full || card.answer_short}
                            </div>
                        </div>

                        {/* Action buttons hint */}
                        <div className="text-center text-gray-400 text-xs mt-4">
                            Jak dobrze znałeś odpowiedź?
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Answer buttons */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-6"
                    >
                        <div className="grid grid-cols-4 gap-3">
                            <AnswerButton
                                emoji="😵"
                                label="Nie wiem"
                                interval={formatInterval(previewInterval(currentInterval, currentEase, 'again'))}
                                color="red"
                                onClick={() => onAnswer('again')}
                                disabled={isSubmitting}
                            />
                            <AnswerButton
                                emoji="😰"
                                label="Trudne"
                                interval={formatInterval(previewInterval(currentInterval, currentEase, 'hard'))}
                                color="orange"
                                onClick={() => onAnswer('hard')}
                                disabled={isSubmitting}
                            />
                            <AnswerButton
                                emoji="😊"
                                label="Dobrze"
                                interval={formatInterval(previewInterval(currentInterval, currentEase, 'good'))}
                                color="green"
                                onClick={() => onAnswer('good')}
                                disabled={isSubmitting}
                            />
                            <AnswerButton
                                emoji="🚀"
                                label="Łatwe"
                                interval={formatInterval(previewInterval(currentInterval, currentEase, 'easy'))}
                                color="emerald"
                                onClick={() => onAnswer('easy')}
                                disabled={isSubmitting}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Answer Button
// ═══════════════════════════════════════════════════════════════

interface AnswerButtonProps {
    emoji: string
    label: string
    interval: string
    color: string
    onClick: () => void
    disabled: boolean
}

function AnswerButton({ emoji, label, interval, color, onClick, disabled }: AnswerButtonProps) {
    const colorClasses: Record<string, string> = {
        red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
        orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
        green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
        emerald: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-95',
                colorClasses[color]
            )}
        >
            <span className="text-2xl mb-1">{emoji}</span>
            <span className="font-medium text-sm">{label}</span>
            <span className="text-xs opacity-75 mt-1">{interval}</span>
        </button>
    )
}

// ═══════════════════════════════════════════════════════════════
// Session Summary
// ═══════════════════════════════════════════════════════════════

interface SessionSummaryProps {
    data: {
        session: any
        results: any[]
        newAchievements: any[]
    }
    onClose: () => void
    onContinue: () => void
}

function SessionSummary({ data, onClose, onContinue }: SessionSummaryProps) {
    const { session, newAchievements } = data
    const { data: stats } = useUserFlashcardStats()

    const accuracy = session.cards_reviewed > 0
        ? Math.round(((session.cards_good + session.cards_easy) / session.cards_reviewed) * 100)
        : 0

    const getMessage = () => {
        if (accuracy >= 90) return { text: '🎉 ŚWIETNA ROBOTA!', color: 'text-green-600' }
        if (accuracy >= 70) return { text: '👍 Dobra sesja!', color: 'text-blue-600' }
        if (accuracy >= 50) return { text: '💪 Tak trzymaj!', color: 'text-yellow-600' }
        return { text: '📚 Każdy błąd to lekcja', color: 'text-gray-600' }
    }

    const message = getMessage()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className={cn('text-2xl font-bold mb-2', message.color)}>
                        {message.text}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-amber-600">
                        <Zap className="w-6 h-6" />
                        <span className="text-2xl font-bold">+{session.xp_earned} XP</span>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900">{session.cards_reviewed}</p>
                        <p className="text-sm text-gray-500">Fiszki</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900">{accuracy}%</p>
                        <p className="text-sm text-gray-500">Poprawność</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900">
                            {session.duration_seconds ? Math.ceil(session.duration_seconds / 60) : 0} min
                        </p>
                        <p className="text-sm text-gray-500">Czas</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-orange-500">
                            🔥 {stats?.streak?.current || 0}
                        </p>
                        <p className="text-sm text-gray-500">Seria dni</p>
                    </div>
                </div>

                {/* Rating breakdown */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Twoje odpowiedzi</h3>
                    <div className="space-y-2">
                        <RatingBar label="Łatwe" count={session.cards_easy} total={session.cards_reviewed} color="bg-emerald-500" emoji="🚀" />
                        <RatingBar label="Dobrze" count={session.cards_good} total={session.cards_reviewed} color="bg-green-500" emoji="😊" />
                        <RatingBar label="Trudne" count={session.cards_hard} total={session.cards_reviewed} color="bg-orange-500" emoji="😰" />
                        <RatingBar label="Nie wiem" count={session.cards_again} total={session.cards_reviewed} color="bg-red-500" emoji="😵" />
                    </div>
                </div>

                {/* New achievements */}
                {newAchievements && newAchievements.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">🏆 Nowe odznaki!</h3>
                        <div className="space-y-2">
                            {newAchievements.map((achievement: any) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200"
                                >
                                    <span className="text-2xl">{achievement.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-amber-900">{achievement.name}</p>
                                        <p className="text-sm text-amber-700">+{achievement.xp} XP</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        Zakończ
                    </button>
                    <button
                        onClick={onContinue}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Jeszcze 10 fiszek →
                    </button>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Rating Bar
// ═══════════════════════════════════════════════════════════════

function RatingBar({
    label,
    count,
    total,
    color,
    emoji
}: {
    label: string
    count: number
    total: number
    color: string
    emoji: string
}) {
    const percentage = total > 0 ? (count / total) * 100 : 0

    return (
        <div className="flex items-center gap-3">
            <span className="w-6 text-center">{emoji}</span>
            <span className="w-20 text-sm text-gray-600">{label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className={cn('h-full rounded-full', color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />
            </div>
            <span className="w-16 text-sm text-gray-600 text-right">
                {count} ({Math.round(percentage)}%)
            </span>
        </div>
    )
}

export default AdaptiveFlashcardSession
