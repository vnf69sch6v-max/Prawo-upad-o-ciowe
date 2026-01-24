// ═══════════════════════════════════════════════════════════════════════════
// useSearchFlashcards - Advanced search with full-text, filters, progress
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SearchResult {
    flashcard_id: string
    question: string
    answer_short: string
    answer_full: string | null
    legal_basis: string | null
    deck_id: string
    deck_name: string
    deck_icon: string
    deck_color: string
    tags: string[]
    base_difficulty: number
    // User progress
    user_status: 'new' | 'learning' | 'review' | 'mastered'
    user_accuracy: number | null
    last_review_at: string | null
    last_rating: string | null
    next_review_at: string | null
    is_due: boolean
    total_reviews: number
    current_streak: number
    is_favorite: boolean
    // Search
    relevance_score: number
}

export interface DeckStats {
    deck_id: string
    deck_name: string
    deck_icon: string
    deck_color: string
    total_cards: number
    cards_seen: number
    cards_mastered: number
    cards_learning: number
    cards_new: number
    cards_due: number
    accuracy_percent: number | null
    last_studied_at: string | null
}

export interface SearchSuggestion {
    suggestion_type: 'question' | 'legal_basis' | 'tag'
    suggestion_text: string
    deck_name: string | null
    match_count: number
}

export type ProgressFilter = 'all' | 'new' | 'learning' | 'mastered' | 'due' | 'favorite'
export type SortOption = 'relevance' | 'newest' | 'difficulty' | 'due'

// ═══════════════════════════════════════════════════════════════
// HELPER: useDebounce
// ═══════════════════════════════════════════════════════════════

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useSearchFlashcards
// ═══════════════════════════════════════════════════════════════

export function useSearchFlashcards() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // State
    const [query, setQuery] = useState('')
    const [selectedDecks, setSelectedDecks] = useState<string[]>([])
    const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all')
    const [sortBy, setSortBy] = useState<SortOption>('relevance')
    const [page, setPage] = useState(0)
    const [showAnswers, setShowAnswers] = useState(true)

    const debouncedQuery = useDebounce(query, 300)
    const LIMIT = 20

    // Reset page when filters change
    useEffect(() => {
        setPage(0)
    }, [debouncedQuery, selectedDecks, progressFilter, sortBy])

    // Fetch deck stats
    const { data: deckStats, isLoading: isLoadingDecks } = useQuery({
        queryKey: ['deck-search-stats', user?.uid],
        queryFn: async () => {
            if (!user) return []

            const { data, error } = await supabase.rpc('get_deck_search_stats', {
                p_user_id: user.uid
            })

            if (error) throw error
            return data as DeckStats[]
        },
        enabled: !!user,
        staleTime: 1000 * 60 // 1 minute
    })

    // Fetch search results
    const {
        data: searchResults,
        isLoading: isSearching,
        isFetching
    } = useQuery({
        queryKey: ['search-flashcards', user?.uid, debouncedQuery, selectedDecks, progressFilter, sortBy, page],
        queryFn: async () => {
            if (!user) return { results: [], total: 0, hasMore: false }

            const { data, error } = await supabase.rpc('search_flashcards', {
                p_user_id: user.uid,
                p_query: debouncedQuery || '',
                p_deck_ids: selectedDecks.length > 0 ? selectedDecks : null,
                p_limit: LIMIT,
                p_offset: page * LIMIT,
                p_show_only: progressFilter,
                p_sort_by: sortBy
            })

            if (error) throw error

            return {
                results: data as SearchResult[],
                total: data?.length || 0,
                hasMore: data?.length === LIMIT
            }
        },
        enabled: !!user,
        placeholderData: (previousData) => previousData
    })

    // Fetch suggestions (autocomplete)
    const { data: suggestions } = useQuery({
        queryKey: ['search-suggestions', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return []

            const { data, error } = await supabase.rpc('get_search_suggestions', {
                p_query: debouncedQuery,
                p_limit: 10
            })

            if (error) throw error
            return data as SearchSuggestion[]
        },
        enabled: !!debouncedQuery && debouncedQuery.length >= 2
    })

    // Toggle deck selection
    const toggleDeck = useCallback((deckId: string) => {
        setSelectedDecks(prev =>
            prev.includes(deckId)
                ? prev.filter(id => id !== deckId)
                : [...prev, deckId]
        )
    }, [])

    // Select all / none
    const selectAllDecks = useCallback(() => {
        if (deckStats) {
            setSelectedDecks(deckStats.map(d => d.deck_id))
        }
    }, [deckStats])

    const clearDeckSelection = useCallback(() => {
        setSelectedDecks([])
    }, [])

    // Load more
    const loadMore = useCallback(() => {
        if (searchResults?.hasMore) {
            setPage(prev => prev + 1)
        }
    }, [searchResults?.hasMore])

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('')
        setSelectedDecks([])
        setProgressFilter('all')
        setSortBy('relevance')
        setPage(0)
    }, [])

    return {
        // State
        query,
        setQuery,
        selectedDecks,
        progressFilter,
        setProgressFilter,
        sortBy,
        setSortBy,
        showAnswers,
        setShowAnswers,

        // Data
        deckStats: deckStats || [],
        results: searchResults?.results || [],
        suggestions: suggestions || [],
        hasMore: searchResults?.hasMore || false,

        // Actions
        toggleDeck,
        selectAllDecks,
        clearDeckSelection,
        loadMore,
        clearSearch,

        // Status
        isLoadingDecks,
        isSearching: isSearching || isFetching,

        // Computed
        totalResults: searchResults?.results?.length || 0,
        hasActiveFilters: selectedDecks.length > 0 || progressFilter !== 'all' || !!query
    }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useFlashcardActions (dodaj do nauki, ulubione, etc.)
// ═══════════════════════════════════════════════════════════════

export function useFlashcardActions() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // Toggle favorite
    const toggleFavorite = useMutation({
        mutationFn: async (flashcardId: string) => {
            if (!user) throw new Error('Not authenticated')

            // Get current state
            const { data: current } = await supabase
                .from('user_flashcard_progress')
                .select('is_favorite')
                .eq('user_id', user.uid)
                .eq('flashcard_id', flashcardId)
                .single()

            const newValue = !current?.is_favorite

            // Upsert
            const { error } = await supabase
                .from('user_flashcard_progress')
                .upsert({
                    user_id: user.uid,
                    flashcard_id: flashcardId,
                    is_favorite: newValue,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,flashcard_id'
                })

            if (error) throw error
            return { flashcardId, isFavorite: newValue }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search-flashcards'] })
        }
    })

    // Add to today's study session
    const addToStudyQueue = useMutation({
        mutationFn: async (flashcardIds: string[]) => {
            if (!user) throw new Error('Not authenticated')

            // Upsert progress records to make them "due now"
            const records = flashcardIds.map(id => ({
                user_id: user.uid,
                flashcard_id: id,
                next_review_at: new Date().toISOString(), // Due now
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('user_flashcard_progress')
                .upsert(records, {
                    onConflict: 'user_id,flashcard_id',
                    ignoreDuplicates: false
                })

            if (error) throw error
            return { added: flashcardIds.length }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search-flashcards'] })
            queryClient.invalidateQueries({ queryKey: ['smart-review'] })
        }
    })

    // Add user note to flashcard
    const addNote = useMutation({
        mutationFn: async ({ flashcardId, note }: { flashcardId: string; note: string }) => {
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('user_flashcard_progress')
                .upsert({
                    user_id: user.uid,
                    flashcard_id: flashcardId,
                    user_notes: note,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,flashcard_id'
                })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search-flashcards'] })
        }
    })

    return {
        toggleFavorite: toggleFavorite.mutate,
        addToStudyQueue: addToStudyQueue.mutate,
        addNote: addNote.mutate,
        isTogglingFavorite: toggleFavorite.isPending,
        isAddingToQueue: addToStudyQueue.isPending
    }
}

export default useSearchFlashcards
