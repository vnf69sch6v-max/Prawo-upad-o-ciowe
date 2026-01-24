// ═══════════════════════════════════════════════════════════════════════════
// useSyncFlashcards HOOK
// Auto-sync local questions to Supabase on first run
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    checkSyncNeeded,
    syncAllFlashcards,
    getSyncStatus,
    DECK_DEFINITIONS
} from '@/lib/supabase/flashcard-sync-service'

export interface SyncState {
    status: 'idle' | 'checking' | 'syncing' | 'complete' | 'error'
    progress: number
    message: string
    totalDecks: number
    totalCards: number
}

/**
 * Hook to automatically sync local questions to Supabase
 * 
 * Usage:
 * ```tsx
 * const { syncState, triggerSync, isReady } = useSyncFlashcards()
 * 
 * if (!isReady) {
 *   return <SyncingScreen progress={syncState.progress} />
 * }
 * ```
 */
export function useSyncFlashcards(autoSync: boolean = true) {
    const queryClient = useQueryClient()
    const [syncState, setSyncState] = useState<SyncState>({
        status: 'idle',
        progress: 0,
        message: '',
        totalDecks: 0,
        totalCards: 0
    })

    // Check if sync is needed
    const { data: needsSync, isLoading: isChecking } = useQuery({
        queryKey: ['flashcard-sync-check'],
        queryFn: checkSyncNeeded,
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: autoSync
    })

    // Get current sync status
    const { data: currentStatus } = useQuery({
        queryKey: ['flashcard-sync-status'],
        queryFn: getSyncStatus,
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    // Sync mutation
    const syncMutation = useMutation({
        mutationFn: async () => {
            setSyncState(prev => ({
                ...prev,
                status: 'syncing',
                message: 'Importuję pytania do bazy danych...',
                progress: 10
            }))

            const result = await syncAllFlashcards()

            return result
        },
        onSuccess: (result) => {
            setSyncState({
                status: 'complete',
                progress: 100,
                message: `Zaimportowano ${result.totalCards} fiszek w ${result.totalDecks} taliach`,
                totalDecks: result.totalDecks,
                totalCards: result.totalCards
            })

            // Invalidate all flashcard queries
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({ queryKey: ['flashcard-sync-status'] })
            queryClient.invalidateQueries({ queryKey: ['flashcard-sync-check'] })
        },
        onError: (error) => {
            console.error('Sync failed:', error)
            setSyncState(prev => ({
                ...prev,
                status: 'error',
                message: `Błąd synchronizacji: ${error}`
            }))
        }
    })

    // Auto-sync on mount if needed
    useEffect(() => {
        if (autoSync && needsSync && !syncMutation.isPending && syncState.status === 'idle') {
            setSyncState(prev => ({ ...prev, status: 'checking', message: 'Sprawdzam bazę danych...' }))
            syncMutation.mutate()
        }
    }, [needsSync, autoSync, syncMutation.isPending, syncState.status])

    // Manual trigger
    const triggerSync = useCallback(() => {
        if (!syncMutation.isPending) {
            syncMutation.mutate()
        }
    }, [syncMutation])

    // Calculate expected totals
    const expectedTotals = {
        decks: DECK_DEFINITIONS.length,
        cards: DECK_DEFINITIONS.reduce((sum, d) => sum + d.questions.length, 0)
    }

    return {
        // State
        syncState,
        isReady: !isChecking && !needsSync && syncState.status !== 'syncing',
        isSyncing: syncMutation.isPending || syncState.status === 'syncing',

        // Current DB status
        currentStatus,
        expectedTotals,

        // Actions
        triggerSync,

        // For manual checks
        needsSync
    }
}

export default useSyncFlashcards
