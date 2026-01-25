// ═══════════════════════════════════════════════════════════════════════════
// FlashcardSyncInitializer - Auto-syncs questions on app load
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useEffect, useRef } from 'react'
import { useSyncFlashcards } from '@/hooks/use-sync-flashcards'

/**
 * This component runs once on app load and syncs local questions to Supabase
 * if the database is empty. It's silent - no UI, just background sync.
 */
export function FlashcardSyncInitializer() {
    const { syncState, needsSync, triggerSync, isSyncing, currentStatus } = useSyncFlashcards(true)
    const hasLogged = useRef(false)

    useEffect(() => {
        if (!hasLogged.current && currentStatus) {
            hasLogged.current = true
            console.log('📚 Flashcard Sync Status:', {
                synced: currentStatus.synced,
                decks: currentStatus.deckCount,
                cards: currentStatus.cardCount
            })
        }
    }, [currentStatus])

    useEffect(() => {
        if (syncState.status === 'complete') {
            console.log(`✅ Flashcard sync complete: ${syncState.totalCards} cards in ${syncState.totalDecks} decks`)
        } else if (syncState.status === 'error') {
            console.error('❌ Flashcard sync failed:', syncState.message)
        } else if (syncState.status === 'syncing') {
            console.log('🔄 Syncing flashcards...')
        }
    }, [syncState])

    // No UI - just runs in background
    return null
}

export default FlashcardSyncInitializer
