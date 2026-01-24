// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE FLASHCARD SYSTEM - REACT HOOKS
// Full implementation with Supabase backend and SM-2 algorithm
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FlashcardDeck {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string
    color: string
    legal_area: string | null
    total_cards: number
    is_premium: boolean
    userProgress?: {
        mastered: number
        learning: number
        due: number
        new: number
    }
}

export interface Flashcard {
    id: string
    deck_id: string
    question: string
    answer_short: string
    answer_full: string | null
    legal_basis: string | null
    base_difficulty: number
    tags: string[]
}

export interface FlashcardWithProgress extends Flashcard {
    deck_name?: string
    status: 'new' | 'learning' | 'review' | 'mastered'
    ease_factor: number
    interval_days: number
    last_rating: string | null
    total_reviews: number
    accuracy: number | null
    priority_type: 'overdue' | 'weak_point' | 'new'
    priority_score: number
}

export interface FlashcardSession {
    id: string
    deck_id: string | null
    session_type: 'normal' | 'smart_review' | 'speed_run' | 'quiz' | 'weak_points' | 'new_only'
    started_at: string
    cards_reviewed: number
    cards_again: number
    cards_hard: number
    cards_good: number
    cards_easy: number
    xp_earned: number
}

export interface UserFlashcardStats {
    streak: {
        current: number
        longest: number
        freezes: number
    }
    xp: {
        total: number
        level: number
    }
    today: {
        done: number
        goal: number
        due: number
    }
    cards: {
        mastered: number
        learning: number
        total_reviews: number
    }
}

export interface Achievement {
    id: string
    code: string
    name: string
    description: string
    icon: string
    category: string
    xp_reward: number
    rarity: string
    earned_at?: string
}

export type Rating = 'again' | 'hard' | 'good' | 'easy'

// ═══════════════════════════════════════════════════════════════
// HOOK: useFlashcardDecks - Lista talii
// ═══════════════════════════════════════════════════════════════

export function useFlashcardDecks() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['flashcard-decks', user?.uid],
        queryFn: async () => {
            // Pobierz talie
            const { data: decks, error: decksError } = await supabase
                .from('flashcard_decks')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')

            if (decksError) throw decksError
            if (!decks) return []

            if (!user) return decks as FlashcardDeck[]

            // Pobierz progress użytkownika dla każdej talii
            const { data: progress } = await supabase
                .from('user_flashcard_progress')
                .select('flashcard_id, status, next_review_at')
                .eq('user_id', user.uid)

            // Pobierz flashcard -> deck mapping
            const { data: flashcards } = await supabase
                .from('flashcards')
                .select('id, deck_id')

            const flashcardToDeck = new Map(flashcards?.map(f => [f.id, f.deck_id]))
            const progressByDeck = new Map<string, {
                mastered: number
                learning: number
                due: number
                new: number
            }>()

            // Inicjalizuj countery
            decks.forEach(deck => {
                progressByDeck.set(deck.id, { mastered: 0, learning: 0, due: 0, new: deck.total_cards })
            })

            // Zlicz progress
            progress?.forEach(p => {
                const deckId = flashcardToDeck.get(p.flashcard_id)
                if (!deckId) return

                const stats = progressByDeck.get(deckId)
                if (!stats) return

                stats.new = Math.max(0, stats.new - 1)

                if (p.status === 'mastered') {
                    stats.mastered++
                } else if (p.status === 'learning' || p.status === 'review') {
                    stats.learning++
                }

                if (p.next_review_at && new Date(p.next_review_at) <= new Date()) {
                    stats.due++
                }
            })

            return decks.map(deck => ({
                ...deck,
                userProgress: progressByDeck.get(deck.id) || { mastered: 0, learning: 0, due: 0, new: deck.total_cards }
            })) as FlashcardDeck[]
        },
        enabled: true
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useSmartReview - Pobierz fiszki do sesji
// ═══════════════════════════════════════════════════════════════

export function useSmartReview(deckId?: string, limit: number = 25) {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['smart-review', user?.uid, deckId, limit],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .rpc('get_smart_review_cards', {
                    p_user_id: user.uid,
                    p_deck_id: deckId || null,
                    p_limit: limit,
                    p_new_limit: 10
                })

            if (error) throw error

            // Shuffle cards within same priority
            const shuffled = [...(data || [])].sort((a, b) => {
                if (a.priority_type !== b.priority_type) {
                    const order = { overdue: 1, weak_point: 2, new: 3 }
                    return (order[a.priority_type as keyof typeof order] || 3) -
                        (order[b.priority_type as keyof typeof order] || 3)
                }
                return Math.random() - 0.5
            })

            return shuffled as FlashcardWithProgress[]
        },
        enabled: !!user
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useFlashcardSession - Zarządzanie sesją nauki
// ═══════════════════════════════════════════════════════════════

export function useFlashcardSession() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const [session, setSession] = useState<FlashcardSession | null>(null)
    const [cards, setCards] = useState<FlashcardWithProgress[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [sessionResults, setSessionResults] = useState<{
        rating: Rating
        xp: number
        card: FlashcardWithProgress
    }[]>([])

    const flipTimeRef = useRef<number>(0)
    const cardStartTimeRef = useRef<number>(0)

    // Rozpocznij sesję
    const startSession = useMutation({
        mutationFn: async ({
            deckId,
            sessionType = 'normal',
            cardsToReview
        }: {
            deckId?: string
            sessionType?: FlashcardSession['session_type']
            cardsToReview: FlashcardWithProgress[]
        }) => {
            if (!user) throw new Error('Not authenticated')

            // Utwórz sesję w bazie
            const { data: newSession, error } = await supabase
                .from('flashcard_sessions')
                .insert({
                    user_id: user.uid,
                    deck_id: deckId || null,
                    session_type: sessionType,
                    planned_count: cardsToReview.length
                })
                .select()
                .single()

            if (error) throw error

            // Aktualizuj streak
            await supabase.rpc('update_user_streak', { p_user_id: user.uid })

            return { session: newSession, cards: cardsToReview }
        },
        onSuccess: ({ session: newSession, cards: newCards }) => {
            setSession(newSession)
            setCards(newCards)
            setCurrentIndex(0)
            setIsFlipped(false)
            setSessionResults([])
            cardStartTimeRef.current = Date.now()
        }
    })

    // Odpowiedz na fiszkę
    const submitAnswer = useMutation({
        mutationFn: async (rating: Rating) => {
            if (!user || !session || !cards[currentIndex]) {
                throw new Error('Invalid state')
            }

            const currentCard = cards[currentIndex]
            const responseTimeMs = Date.now() - flipTimeRef.current
            const timeToFlipMs = flipTimeRef.current - cardStartTimeRef.current

            // Wyślij do bazy
            const { data, error } = await supabase.rpc('record_flashcard_review', {
                p_user_id: user.uid,
                p_session_id: session.id,
                p_flashcard_id: currentCard.id,
                p_rating: rating,
                p_response_time_ms: responseTimeMs,
                p_time_to_flip_ms: timeToFlipMs,
                p_asked_ai: false
            })

            if (error) throw error

            return {
                ...data,
                card: currentCard,
                rating
            }
        },
        onSuccess: (result) => {
            // Zapisz wynik
            setSessionResults(prev => [...prev, {
                rating: result.rating,
                xp: result.xp_earned || 10,
                card: result.card
            }])

            // Aktualizuj lokalny stan sesji
            setSession(prev => {
                if (!prev) return null
                const ratingKey = `cards_${result.rating}` as keyof FlashcardSession
                return {
                    ...prev,
                    cards_reviewed: prev.cards_reviewed + 1,
                    [ratingKey]: ((prev[ratingKey] as number) || 0) + 1,
                    xp_earned: prev.xp_earned + (result.xp_earned || 10)
                }
            })

            // Przejdź do następnej karty
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1)
                setIsFlipped(false)
                cardStartTimeRef.current = Date.now()
            }

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] })
        }
    })

    // Zakończ sesję
    const endSession = useMutation({
        mutationFn: async () => {
            if (!user || !session) throw new Error('No active session')

            const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)

            const { error } = await supabase
                .from('flashcard_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    duration_seconds: duration,
                    status: 'completed'
                })
                .eq('id', session.id)

            if (error) throw error

            // Sprawdź achievements
            const { data: achievements } = await supabase.rpc('check_achievements', {
                p_user_id: user.uid
            })

            return {
                session: { ...session, duration_seconds: duration },
                results: sessionResults,
                newAchievements: achievements?.awarded || []
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] })
            queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
        }
    })

    // Flip card
    const flipCard = useCallback(() => {
        if (!isFlipped) {
            flipTimeRef.current = Date.now()
            setIsFlipped(true)
        }
    }, [isFlipped])

    // Reset session
    const resetSession = useCallback(() => {
        setSession(null)
        setCards([])
        setCurrentIndex(0)
        setIsFlipped(false)
        setSessionResults([])
    }, [])

    // Current card
    const currentCard = cards[currentIndex] || null

    // Progress
    const progress = {
        current: currentIndex + 1,
        total: cards.length,
        percentage: cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0,
        results: sessionResults
    }

    return {
        // State
        session,
        currentCard,
        isFlipped,
        progress,
        isLastCard: currentIndex >= cards.length - 1,
        isSessionComplete: currentIndex >= cards.length - 1 && sessionResults.length === cards.length,

        // Actions
        startSession: startSession.mutate,
        submitAnswer: submitAnswer.mutate,
        endSession: endSession.mutateAsync,
        flipCard,
        resetSession,

        // Status
        isStarting: startSession.isPending,
        isSubmitting: submitAnswer.isPending,
        isEnding: endSession.isPending
    }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useUserFlashcardStats - Statystyki użytkownika
// ═══════════════════════════════════════════════════════════════

export function useUserFlashcardStats() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['user-flashcard-stats', user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase.rpc('get_user_dashboard', {
                p_user_id: user.uid
            })

            if (error) throw error

            return data as UserFlashcardStats
        },
        enabled: !!user,
        staleTime: 1000 * 30 // 30 sekund
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useUserAchievements - Odznaki użytkownika
// ═══════════════════════════════════════════════════════════════

export function useUserAchievements() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['user-achievements', user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            // Wszystkie dostępne odznaki
            const { data: allAchievements, error: achievementsError } = await supabase
                .from('achievements')
                .select('*')
                .eq('is_active', true)

            if (achievementsError) throw achievementsError

            // Odznaki użytkownika
            const { data: userAchievements, error: userError } = await supabase
                .from('user_achievements')
                .select('achievement_id, earned_at, seen')
                .eq('user_id', user.uid)

            if (userError) throw userError

            const earnedMap = new Map(
                userAchievements?.map(ua => [ua.achievement_id, { earned_at: ua.earned_at, seen: ua.seen }])
            )

            return {
                earned: allAchievements?.filter(a => earnedMap.has(a.id)).map(a => ({
                    ...a,
                    earned_at: earnedMap.get(a.id)?.earned_at,
                    seen: earnedMap.get(a.id)?.seen
                })) || [],
                locked: allAchievements?.filter(a => !earnedMap.has(a.id)) || [],
                unseen: userAchievements?.filter(ua => !ua.seen).length || 0
            }
        },
        enabled: !!user
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useWeakPoints - Słabe punkty użytkownika
// ═══════════════════════════════════════════════════════════════

export function useWeakPoints() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['weak-points', user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            const { data: progress, error } = await supabase
                .from('user_flashcard_progress')
                .select(`
          flashcard_id,
          total_reviews,
          correct_reviews,
          last_rating,
          flashcards:flashcard_id (
            id,
            question,
            answer_short,
            legal_basis,
            deck_id,
            flashcard_decks:deck_id (name, icon)
          )
        `)
                .eq('user_id', user.uid)
                .gte('total_reviews', 3)
                .order('correct_reviews', { ascending: true })
                .limit(20)

            if (error) throw error

            const weakCards = progress
                ?.map(p => ({
                    id: (p.flashcards as any)?.id,
                    question: (p.flashcards as any)?.question,
                    answer_short: (p.flashcards as any)?.answer_short,
                    legal_basis: (p.flashcards as any)?.legal_basis,
                    deckName: (p.flashcards as any)?.flashcard_decks?.name,
                    deckIcon: (p.flashcards as any)?.flashcard_decks?.icon,
                    accuracy: p.total_reviews > 0
                        ? Math.round((p.correct_reviews / p.total_reviews) * 100)
                        : 0,
                    reviews: p.total_reviews,
                    lastRating: p.last_rating
                }))
                .filter(c => c.accuracy < 60)

            return {
                weakCards: weakCards || [],
                hasWeakPoints: (weakCards?.length || 0) > 0
            }
        },
        enabled: !!user
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useDeckProgress - Progress dla konkretnej talii
// ═══════════════════════════════════════════════════════════════

export function useDeckProgress(deckId: string) {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['deck-progress', deckId, user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            // Pobierz wszystkie fiszki z talii
            const { data: flashcards, error: flashcardsError } = await supabase
                .from('flashcards')
                .select('id')
                .eq('deck_id', deckId)
                .eq('is_active', true)

            if (flashcardsError) throw flashcardsError

            const flashcardIds = flashcards?.map(f => f.id) || []

            if (flashcardIds.length === 0) {
                return { total: 0, new: 0, learning: 0, review: 0, mastered: 0, dueToday: 0 }
            }

            // Pobierz progress użytkownika
            const { data: progress, error: progressError } = await supabase
                .from('user_flashcard_progress')
                .select('*')
                .eq('user_id', user.uid)
                .in('flashcard_id', flashcardIds)

            if (progressError) throw progressError

            const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]))

            // Zlicz stany
            const stats = {
                total: flashcardIds.length,
                new: 0,
                learning: 0,
                review: 0,
                mastered: 0,
                dueToday: 0
            }

            flashcardIds.forEach(id => {
                const p = progressMap.get(id)
                if (!p) {
                    stats.new++
                } else {
                    switch (p.status) {
                        case 'learning': stats.learning++; break
                        case 'review': stats.review++; break
                        case 'mastered': stats.mastered++; break
                        default: stats.new++
                    }
                    if (p.next_review_at && new Date(p.next_review_at) <= new Date()) {
                        stats.dueToday++
                    }
                }
            })

            return stats
        },
        enabled: !!user && !!deckId
    })
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useStreak - Zarządzanie serią
// ═══════════════════════════════════════════════════════════════

export function useStreak() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { data: streakData } = useQuery({
        queryKey: ['user-streak', user?.uid],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('user_flashcard_stats')
                .select('current_streak_days, longest_streak_days, last_study_date, streak_freezes_available')
                .eq('user_id', user.uid)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            return data || {
                current_streak_days: 0,
                longest_streak_days: 0,
                last_study_date: null,
                streak_freezes_available: 1
            }
        },
        enabled: !!user
    })

    const useFreeze = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated')

            if (!streakData || streakData.streak_freezes_available <= 0) {
                throw new Error('No freeze available')
            }

            const { error } = await supabase
                .from('user_flashcard_stats')
                .update({
                    streak_freezes_available: streakData.streak_freezes_available - 1,
                    last_study_date: new Date().toISOString().split('T')[0]
                })
                .eq('user_id', user.uid)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-streak'] })
            queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] })
        }
    })

    // Sprawdź czy seria jest zagrożona
    const today = new Date().toISOString().split('T')[0]
    const lastActivity = streakData?.last_study_date
    const isStreakAtRisk = lastActivity && lastActivity < today && (streakData?.current_streak_days || 0) > 0

    return {
        current: streakData?.current_streak_days || 0,
        longest: streakData?.longest_streak_days || 0,
        freezeAvailable: streakData?.streak_freezes_available || 0,
        isStreakAtRisk,
        lastActivityDate: lastActivity,
        useFreeze: useFreeze.mutate,
        isUsingFreeze: useFreeze.isPending
    }
}

// ═══════════════════════════════════════════════════════════════
// HELPER: XP do następnego poziomu
// ═══════════════════════════════════════════════════════════════

export function calculateLevelProgress(totalXp: number) {
    const levels = [
        { level: 1, min: 0, max: 499 },
        { level: 2, min: 500, max: 1499 },
        { level: 3, min: 1500, max: 3499 },
        { level: 4, min: 3500, max: 6999 },
        { level: 5, min: 7000, max: 11999 },
        { level: 6, min: 12000, max: 19999 },
        { level: 7, min: 20000, max: 34999 },
        { level: 8, min: 35000, max: 59999 },
        { level: 9, min: 60000, max: 99999 },
        { level: 10, min: 100000, max: Infinity }
    ]

    const currentLevel = levels.find(l => totalXp >= l.min && totalXp <= l.max) || levels[0]
    const xpInLevel = totalXp - currentLevel.min
    const xpForLevel = currentLevel.max === Infinity ? 100000 : currentLevel.max - currentLevel.min + 1
    const progress = Math.min(100, Math.round((xpInLevel / xpForLevel) * 100))

    return {
        level: currentLevel.level,
        xpInLevel,
        xpForLevel,
        progress,
        xpToNext: currentLevel.max === Infinity ? 0 : currentLevel.max - totalXp + 1
    }
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Interwał w czytelnej formie
// ═══════════════════════════════════════════════════════════════

export function formatInterval(days: number): string {
    if (days === 0) return '< 1 min'
    if (days === 1) return '1 dzień'
    if (days < 7) return `${days} dni`
    if (days < 30) return `${Math.round(days / 7)} tyg.`
    if (days < 365) return `${Math.round(days / 30)} mies.`
    return `${Math.round(days / 365)} lat`
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Rating do interwału (podgląd)
// ═══════════════════════════════════════════════════════════════

export function previewInterval(
    currentInterval: number,
    currentEase: number,
    rating: Rating
): number {
    switch (rating) {
        case 'again': return 0
        case 'hard': return Math.max(1, Math.floor(currentInterval * 0.5))
        case 'good':
            if (currentInterval === 0) return 1
            if (currentInterval <= 1) return 6
            return Math.round(currentInterval * currentEase)
        case 'easy':
            if (currentInterval === 0) return 4
            return Math.round(currentInterval * currentEase * 1.3)
    }
}
