// ═══════════════════════════════════════════════════════════════════════════
// FLASHCARD SYNC SERVICE
// Imports existing local questions to Supabase on first run
// ═══════════════════════════════════════════════════════════════════════════

import { supabase } from '@/lib/supabase'
import { ALL_KSH_QUESTIONS, type ExamQuestion } from '@/lib/data/ksh'
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe'
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny'
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso'

// ═══════════════════════════════════════════════════════════════
// DECK DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface DeckDefinition {
    slug: string
    name: string
    description: string
    icon: string
    color: string
    legal_area: string
    questions: ExamQuestion[]
}

export const DECK_DEFINITIONS: DeckDefinition[] = [
    {
        slug: 'prawo-handlowe-ksh',
        name: 'Prawo Handlowe (KSH)',
        description: 'Kodeks spółek handlowych - wszystkie typy spółek, odpowiedzialność, organy',
        icon: '🏛️',
        color: '#3B82F6',
        legal_area: 'commercial',
        questions: ALL_KSH_QUESTIONS
    },
    {
        slug: 'prawo-upadlosciowe',
        name: 'Prawo Upadłościowe',
        description: 'Prawo upadłościowe i restrukturyzacyjne - postępowania, syndyk, wierzyciele',
        icon: '⚖️',
        color: '#EF4444',
        legal_area: 'insolvency',
        questions: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS
    },
    {
        slug: 'kodeks-cywilny',
        name: 'Kodeks Cywilny',
        description: 'KC - część ogólna, zobowiązania, prawo rzeczowe',
        icon: '📜',
        color: '#10B981',
        legal_area: 'civil',
        questions: ALL_KC_QUESTIONS
    },
    {
        slug: 'aso',
        name: 'ASO - Aplikacja Sędziowska',
        description: 'Pytania egzaminacyjne na aplikację sędziowską i prokuratorską',
        icon: '⚔️',
        color: '#8B5CF6',
        legal_area: 'judicial',
        questions: ALL_ASO_QUESTIONS
    }
]

// ═══════════════════════════════════════════════════════════════
// SYNC FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if sync is needed (card count < expected)
 */
export async function checkSyncNeeded(): Promise<boolean> {
    const { count: cardCount, error } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error checking sync status:', error)
        return false
    }

    // Calculate expected total from deck definitions
    const expectedTotal = DECK_DEFINITIONS.reduce((sum, d) => sum + d.questions.length, 0)

    // Sync if we have fewer cards than expected
    const needsSync = (cardCount || 0) < expectedTotal

    if (needsSync) {
        console.log(`🔄 Sync needed: ${cardCount || 0} cards in DB, ${expectedTotal} expected`)
    }

    return needsSync
}

/**
 * Convert ExamQuestion to flashcard format
 */
function convertToFlashcard(question: ExamQuestion, deckId: string) {
    const correctAnswer = question.options[question.correct]
    const allOptions = Object.entries(question.options)
        .map(([key, value]) => `${key.toUpperCase()}) ${value}`)
        .join('\n')

    const answerFull = `📌 PRAWIDŁOWA ODPOWIEDŹ: ${question.correct.toUpperCase()}) ${correctAnswer}

📖 WYJAŚNIENIE:
${question.explanation}

📚 PODSTAWA PRAWNA: ${question.article}

🔢 WSZYSTKIE OPCJE:
${allOptions}`

    // Map difficulty to number
    const difficultyMap: Record<string, number> = {
        'easy': 3,
        'medium': 5,
        'hard': 7
    }

    return {
        deck_id: deckId,
        question: question.question,
        answer_short: correctAnswer,
        answer_full: answerFull,
        legal_basis: question.article,
        base_difficulty: difficultyMap[question.difficulty] || 5,
        tags: question.tags || []
    }
}

/**
 * Sync a single deck and its flashcards
 */
async function syncDeck(deck: DeckDefinition): Promise<{ success: boolean; cardCount: number }> {
    console.log(`📚 Syncing deck: ${deck.name} (${deck.questions.length} questions)`)

    // Check if deck exists
    const { data: existingDeck } = await supabase
        .from('flashcard_decks')
        .select('id')
        .eq('slug', deck.slug)
        .single()

    let deckId: string

    if (existingDeck) {
        deckId = existingDeck.id
        console.log(`  → Deck exists: ${deckId}`)
    } else {
        // Create deck
        const { data: newDeck, error: deckError } = await supabase
            .from('flashcard_decks')
            .insert({
                name: deck.name,
                slug: deck.slug,
                description: deck.description,
                icon: deck.icon,
                color: deck.color,
                legal_area: deck.legal_area,
                is_active: true,
                is_premium: false,
                total_cards: 0
            })
            .select('id')
            .single()

        if (deckError || !newDeck) {
            console.error(`  ❌ Failed to create deck:`, deckError)
            return { success: false, cardCount: 0 }
        }

        deckId = newDeck.id
        console.log(`  ✅ Created deck: ${deckId}`)
    }

    // Convert questions to flashcards
    const flashcards = deck.questions.map(q => convertToFlashcard(q, deckId))

    // Insert in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < flashcards.length; i += batchSize) {
        const batch = flashcards.slice(i, i + batchSize)

        const { data, error: insertError } = await supabase
            .from('flashcards')
            .insert(batch)
            .select('id')

        if (insertError) {
            // 23505 = unique violation, means card already exists - that's OK
            if (insertError.code !== '23505') {
                console.error(`  ⚠️ Batch ${Math.floor(i / batchSize) + 1} insert error:`, insertError.message)
            }
        } else {
            insertedCount += data?.length || batch.length
        }
    }

    console.log(`  ✅ Inserted ${insertedCount}/${flashcards.length} flashcards`)

    // Update deck total_cards count
    const { error: updateError } = await supabase
        .from('flashcard_decks')
        .update({ total_cards: flashcards.length })
        .eq('id', deckId)

    if (updateError) {
        console.error(`  ⚠️ Failed to update deck total_cards:`, updateError)
    }

    return { success: true, cardCount: insertedCount }
}

/**
 * Main sync function - imports all local questions to Supabase
 */
export async function syncAllFlashcards(): Promise<{
    success: boolean
    totalDecks: number
    totalCards: number
    errors: string[]
}> {
    console.log('🚀 Starting flashcard sync...')

    const errors: string[] = []
    let totalCards = 0
    let successfulDecks = 0

    for (const deck of DECK_DEFINITIONS) {
        try {
            const result = await syncDeck(deck)
            if (result.success) {
                successfulDecks++
                totalCards += result.cardCount
            } else {
                errors.push(`Failed to sync deck: ${deck.name}`)
            }
        } catch (error) {
            console.error(`Error syncing ${deck.name}:`, error)
            errors.push(`Error syncing ${deck.name}: ${error}`)
        }
    }

    console.log(`\n✅ Sync complete: ${successfulDecks}/${DECK_DEFINITIONS.length} decks, ${totalCards} cards`)

    return {
        success: errors.length === 0,
        totalDecks: successfulDecks,
        totalCards,
        errors
    }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
    synced: boolean
    deckCount: number
    cardCount: number
}> {
    const { count: deckCount } = await supabase
        .from('flashcard_decks')
        .select('*', { count: 'exact', head: true })

    const { count: cardCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })

    return {
        synced: (deckCount || 0) > 0,
        deckCount: deckCount || 0,
        cardCount: cardCount || 0
    }
}
