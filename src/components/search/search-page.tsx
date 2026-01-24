// ═══════════════════════════════════════════════════════════════════════════
// SEARCH COMPONENTS - Premium Search UI
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
    StarOff,
    Plus,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    Loader2,
    Filter,
    BookOpen,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// MAIN SEARCH PAGE
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
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Search className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Wyszukiwarka</h1>
                            <p className="text-gray-400">
                                {totalCards.toLocaleString()} pytań w bazie wiedzy
                            </p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Szukaj po pytaniu, artykule (np. art. 299) lub tagu..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-12 h-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Quick tip */}
                    {!query && (
                        <p className="text-sm text-gray-500 mt-3">
                            💡 Możesz szukać po artykule (np. "art 299") lub po opisie (np. "odpowiedzialność zarządu")
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Deck Cards with Progress */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {isLoadingDecks ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        deckStats.map((deck) => (
                            <DeckCard
                                key={deck.deck_id}
                                deck={deck}
                                isSelected={selectedDecks.includes(deck.deck_id)}
                                onClick={() => toggleDeck(deck.deck_id)}
                            />
                        ))
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Progress Filter */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1">
                        {[
                            { value: 'all', label: 'Wszystkie', icon: null },
                            { value: 'new', label: 'Nowe', icon: '🆕' },
                            { value: 'learning', label: 'W nauce', icon: '📖' },
                            { value: 'mastered', label: 'Opanowane', icon: '✅' },
                            { value: 'due', label: 'Do powtórki', icon: '🔴' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setProgressFilter(option.value as ProgressFilter)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                    progressFilter === option.value
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {option.icon && <span className="mr-1">{option.icon}</span>}
                                <span className="hidden sm:inline">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* Toggle answers visibility */}
                    <button
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        {showAnswers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="hidden sm:inline">{showAnswers ? 'Ukryj' : 'Pokaż'} odpowiedzi</span>
                    </button>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="relevance">Trafność</option>
                        <option value="newest">Najnowsze</option>
                        <option value="difficulty">Trudność</option>
                        <option value="due">Do powtórki</option>
                    </select>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearSearch}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                            Wyczyść
                        </button>
                    )}
                </div>

                {/* Results count */}
                {query && (
                    <p className="text-sm text-gray-500 mb-4">
                        {totalResults} wyników dla "{query}"
                        {selectedDecks.length > 0 && ` w ${selectedDecks.length} kategoriach`}
                    </p>
                )}

                {/* Results */}
                <div className="space-y-3">
                    {isSearching && results.length === 0 ? (
                        <div className="text-center py-16">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Szukam...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400">
                                {query ? 'Brak wyników dla tego wyszukiwania' : 'Wpisz frazę aby wyszukać'}
                            </p>
                            {query && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Spróbuj innych słów kluczowych lub zmień filtry
                                </p>
                            )}
                        </div>
                    ) : (
                        results.map((result) => (
                            <SearchResultCard
                                key={result.flashcard_id}
                                result={result}
                                showAnswer={showAnswers}
                                isExpanded={expandedCard === result.flashcard_id}
                                onToggleExpand={() => setExpandedCard(
                                    expandedCard === result.flashcard_id ? null : result.flashcard_id
                                )}
                            />
                        ))
                    )}
                </div>

                {/* Load more */}
                {hasMore && (
                    <div className="text-center mt-8">
                        <button
                            onClick={loadMore}
                            disabled={isSearching}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                        >
                            {isSearching ? (
                                <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Ładowanie...</>
                            ) : (
                                'Załaduj więcej'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// DeckCard - kategoria z postępem
// ═══════════════════════════════════════════════════════════════

function DeckCard({
    deck,
    isSelected,
    onClick
}: {
    deck: DeckStats
    isSelected: boolean
    onClick: () => void
}) {
    const progress = deck.total_cards > 0
        ? Math.round((deck.cards_mastered / deck.total_cards) * 100)
        : 0

    return (
        <button
            onClick={onClick}
            className={cn(
                'p-4 rounded-2xl text-left transition-all border-2',
                isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            )}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{deck.deck_icon}</span>
                <span className="font-medium text-white truncate text-sm">{deck.deck_name}</span>
            </div>

            <div className="text-2xl font-bold text-white mb-2">
                {deck.total_cards}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                    {deck.cards_mastered}/{deck.total_cards}
                </span>
                {deck.cards_due > 0 && (
                    <span className="text-red-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {deck.cards_due}
                    </span>
                )}
            </div>
        </button>
    )
}

// ═══════════════════════════════════════════════════════════════
// SearchResultCard - wynik wyszukiwania
// ═══════════════════════════════════════════════════════════════

function SearchResultCard({
    result,
    showAnswer,
    isExpanded,
    onToggleExpand
}: {
    result: SearchResult
    showAnswer: boolean
    isExpanded: boolean
    onToggleExpand: () => void
}) {
    const { toggleFavorite, addToStudyQueue, isAddingToQueue } = useFlashcardActions()

    const statusConfig: Record<string, { icon: string; label: string; color: string }> = {
        new: { icon: '🆕', label: 'Nowa', color: 'bg-blue-500/20 text-blue-400' },
        learning: { icon: '📖', label: 'W nauce', color: 'bg-yellow-500/20 text-yellow-400' },
        review: { icon: '🔄', label: 'Powtórka', color: 'bg-orange-500/20 text-orange-400' },
        mastered: { icon: '✅', label: 'Opanowana', color: 'bg-green-500/20 text-green-400' },
    }

    const status = statusConfig[result.user_status] || statusConfig.new

    return (
        <motion.div
            layout
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-colors"
        >
            <div className="p-5">
                {/* Header: Deck + Status */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                            backgroundColor: `${result.deck_color}20`,
                            color: result.deck_color
                        }}
                    >
                        {result.deck_icon} {result.deck_name}
                    </span>
                    {result.legal_basis && (
                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-gray-300">
                            📖 {result.legal_basis}
                        </span>
                    )}
                    <div className="flex-1" />
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium', status.color)}>
                        {status.icon} {status.label}
                    </span>
                </div>

                {/* Question */}
                <h3
                    className="font-medium text-white mb-3 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={onToggleExpand}
                >
                    {result.question}
                </h3>

                {/* Answer Preview */}
                <AnimatePresence>
                    {(showAnswer || isExpanded) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="border-t border-white/10 pt-4 mt-2">
                                <p className="text-blue-400 font-medium mb-2">
                                    ✓ {result.answer_short}
                                </p>
                                {isExpanded && result.answer_full && (
                                    <div className="text-gray-400 text-sm whitespace-pre-wrap mt-3 p-4 bg-white/5 rounded-xl">
                                        {result.answer_full}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User Progress Info */}
                {result.total_reviews > 0 && (
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                        {result.user_accuracy !== null && (
                            <span className="flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {result.user_accuracy}% poprawnych
                            </span>
                        )}
                        {result.last_review_at && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatRelativeTime(result.last_review_at)}
                            </span>
                        )}
                        {result.current_streak > 0 && (
                            <span className="flex items-center gap-1">
                                🔥 Seria: {result.current_streak}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                        onClick={() => addToStudyQueue([result.flashcard_id])}
                        disabled={isAddingToQueue || result.is_due}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            result.is_due
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        {result.is_due ? 'W kolejce' : 'Dodaj do nauki'}
                    </button>

                    <button
                        onClick={() => toggleFavorite(result.flashcard_id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-all"
                    >
                        {result.is_favorite ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                            <StarOff className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {isExpanded ? (
                            <><ChevronDown className="w-4 h-4" /> Zwiń</>
                        ) : (
                            <><ChevronRight className="w-4 h-4" /> Rozwiń</>
                        )}
                    </button>

                    <div className="flex-1" />

                    {result.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            {result.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-500"
                                >
                                    {tag}
                                </span>
                            ))}
                            {result.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                    +{result.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Helper
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'dziś'
    if (diffDays === 1) return 'wczoraj'
    if (diffDays < 7) return `${diffDays} dni temu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`
    return `${Math.floor(diffDays / 30)} mies. temu`
}

export { DeckCard, SearchResultCard }
