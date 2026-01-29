// ═══════════════════════════════════════════════════════════════════════════
// SEARCH PAGE - Apple Design Language
// Clean, Minimal, Professional
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    useSearchFlashcards,
    useFlashcardActions,
    type SearchResult,
    type DeckStats,
    type ProgressFilter,
    type SortOption
} from '@/hooks/use-search-flashcards'
import { cn } from '@/lib/utils/cn'
import {
    Search,
    X,
    Star,
    Plus,
    ChevronDown,
    ChevronUp,
    Loader2,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// MAIN SEARCH PAGE - Apple Style
// ═══════════════════════════════════════════════════════════════

export function SearchPageContent() {
    const {
        query,
        setQuery,
        selectedDecks,
        progressFilter,
        setProgressFilter,
        sortBy,
        setSortBy,
        showAnswers,
        setShowAnswers,
        deckStats,
        results,
        hasMore,
        toggleDeck,
        clearSearch,
        loadMore,
        isLoadingDecks,
        isSearching,
        totalResults,
        hasActiveFilters
    } = useSearchFlashcards()

    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const totalCards = deckStats.reduce((sum, d) => sum + d.total_cards, 0)

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* ═══════════════════════════════════════════════════════════
                SEARCH HEADER - Large, Clean, Centered
            ═══════════════════════════════════════════════════════════ */}
            <div className="pt-16 pb-8 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-semibold text-gray-900 tracking-tight mb-2"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
                    >
                        Wyszukaj pytanie
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg mb-8"
                    >
                        {totalCards.toLocaleString()} pytań w Twojej bazie
                    </motion.p>

                    {/* Search Input - Apple Style Light */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Szukaj..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-12 bg-white text-gray-900 placeholder-gray-400 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                CATEGORIES - Horizontal Pills
            ═══════════════════════════════════════════════════════════ */}
            <div className="px-6 pb-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-2"
                    >
                        {isLoadingDecks ? (
                            <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse" />
                        ) : (
                            deckStats.map((deck, i) => (
                                <motion.button
                                    key={deck.deck_id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.03 }}
                                    onClick={() => toggleDeck(deck.deck_id)}
                                    className={cn(
                                        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm',
                                        selectedDecks.includes(deck.deck_id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                                    )}
                                >
                                    {deck.deck_name}
                                </motion.button>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                FILTERS - Minimal Segmented Control
            ═══════════════════════════════════════════════════════════ */}
            <div className="px-6 pb-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center"
                    >
                        <div className="inline-flex bg-gray-100 rounded-lg p-1">
                            {[
                                { value: 'all', label: 'Wszystkie' },
                                { value: 'new', label: 'Nowe' },
                                { value: 'learning', label: 'W nauce' },
                                { value: 'mastered', label: 'Opanowane' },
                                { value: 'due', label: 'Do powtórki' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setProgressFilter(option.value as ProgressFilter)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                                        progressFilter === option.value
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RESULTS
            ═══════════════════════════════════════════════════════════ */}
            <div className="px-6 pb-16">
                <div className="max-w-3xl mx-auto">
                    {/* Results count */}
                    {query && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-500 mb-6 text-center"
                        >
                            {totalResults} wyników
                        </motion.p>
                    )}

                    {/* Results List */}
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {isSearching && results.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                                </motion.div>
                            ) : results.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {query ? 'Brak wyników' : 'Wpisz frazę aby wyszukać'}
                                    </p>
                                </motion.div>
                            ) : (
                                results.map((result, index) => (
                                    <motion.div
                                        key={result.flashcard_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        layout
                                    >
                                        <AppleCard
                                            result={result}
                                            showAnswer={showAnswers}
                                            isExpanded={expandedCard === result.flashcard_id}
                                            onToggle={() => setExpandedCard(
                                                expandedCard === result.flashcard_id ? null : result.flashcard_id
                                            )}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={isSearching}
                                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm transition-all disabled:opacity-50"
                            >
                                {isSearching ? 'Ładowanie...' : 'Pokaż więcej'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


// ═══════════════════════════════════════════════════════════════
// Apple-Style Card
// ═══════════════════════════════════════════════════════════════

function AppleCard({
    result,
    showAnswer,
    isExpanded,
    onToggle
}: {
    result: SearchResult
    showAnswer: boolean
    isExpanded: boolean
    onToggle: () => void
}) {
    const { toggleFavorite, addToStudyQueue } = useFlashcardActions()

    return (
        <motion.div
            layout
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        >
            <div className="p-5">
                {/* Category Tag */}
                <div className="flex items-center gap-2 mb-3">
                    <span
                        className="text-xs font-medium px-2 py-1 rounded-md"
                        style={{
                            backgroundColor: `${result.deck_color}15`,
                            color: result.deck_color
                        }}
                    >
                        {result.deck_name}
                    </span>
                    {result.legal_basis && (
                        <span className="text-xs text-gray-400">
                            {result.legal_basis}
                        </span>
                    )}
                </div>

                {/* Question */}
                <h3
                    className="text-gray-900 text-base leading-relaxed cursor-pointer"
                    onClick={onToggle}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                >
                    {result.question}
                </h3>

                {/* Answer */}
                <AnimatePresence>
                    {(showAnswer || isExpanded) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-green-600 text-sm font-medium">
                                    {result.answer_short}
                                </p>
                                {isExpanded && result.answer_full && (
                                    <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                                        {result.answer_full}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions - Minimal */}
                <div className="flex items-center gap-3 mt-4">
                    <button
                        onClick={() => addToStudyQueue([result.flashcard_id])}
                        className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                        + Do nauki
                    </button>
                    <button
                        onClick={onToggle}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                    >
                        {isExpanded ? (
                            <><ChevronUp className="w-3 h-3" /> Zwiń</>
                        ) : (
                            <><ChevronDown className="w-3 h-3" /> Rozwiń</>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export { AppleCard as SearchResultCard }
