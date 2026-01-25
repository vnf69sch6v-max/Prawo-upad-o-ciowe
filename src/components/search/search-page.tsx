// ═══════════════════════════════════════════════════════════════════════════
// SEARCH COMPONENTS - Light Theme (matching app design)
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
    CheckCircle,
    Clock
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// MAIN SEARCH PAGE CONTENT
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
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-gold)] flex items-center justify-center shadow-sm">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Wyszukiwarka</h1>
                            <p className="text-[var(--text-muted)]">
                                {totalCards.toLocaleString()} pytań w bazie wiedzy
                            </p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Szukaj po pytaniu, artykule (np. art. 299) lub tagu..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-12 h-14 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/30 focus:border-[var(--accent-gold)] transition-all text-lg"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Quick tip */}
                    {!query && (
                        <p className="text-sm text-[var(--text-muted)] mt-3">
                            💡 Możesz szukać po artykule (np. "art 299") lub po opisie (np. "odpowiedzialność zarządu")
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6">
                {/* Deck Cards with Progress */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                    {isLoadingDecks ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-28 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl animate-pulse" />
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
                    <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-1">
                        {[
                            { value: 'all', label: 'Wszystkie' },
                            { value: 'new', label: '🆕 Nowe' },
                            { value: 'learning', label: '📖 W nauce' },
                            { value: 'mastered', label: '✅ Opanowane' },
                            { value: 'due', label: '🔴 Do powtórki' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setProgressFilter(option.value as ProgressFilter)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                    progressFilter === option.value
                                        ? 'bg-[var(--accent-gold)] text-white shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-hover)]'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* Toggle answers visibility */}
                    <button
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
                    >
                        {showAnswers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="hidden sm:inline">{showAnswers ? 'Ukryj' : 'Pokaż'} odpowiedzi</span>
                    </button>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/30"
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
                            className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
                        >
                            Wyczyść
                        </button>
                    )}
                </div>

                {/* Results count */}
                {query && (
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                        {totalResults} wyników dla "{query}"
                        {selectedDecks.length > 0 && ` w ${selectedDecks.length} kategoriach`}
                    </p>
                )}

                {/* Results */}
                <div className="space-y-3">
                    {isSearching && results.length === 0 ? (
                        <div className="text-center py-16">
                            <Loader2 className="w-8 h-8 text-[var(--accent-gold)] animate-spin mx-auto mb-4" />
                            <p className="text-[var(--text-muted)]">Szukam...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-secondary)]">
                                {query ? 'Brak wyników dla tego wyszukiwania' : 'Wpisz frazę aby wyszukać'}
                            </p>
                            {query && (
                                <p className="text-sm text-[var(--text-muted)] mt-2">
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
                            className="px-6 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-medium transition-all disabled:opacity-50"
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
                'p-3 rounded-xl text-left transition-all border-2',
                isSelected
                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/5'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--bg-hover)]'
            )}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{deck.deck_icon}</span>
                <span className="font-medium text-[var(--text-primary)] truncate text-xs">{deck.deck_name}</span>
            </div>

            <div className="text-xl font-bold text-[var(--accent-gold)] mb-2">
                {deck.total_cards}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full bg-[var(--accent-gold)] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">
                    {deck.cards_mastered}/{deck.total_cards}
                </span>
                {deck.cards_due > 0 && (
                    <span className="text-red-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
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

    const statusConfig: Record<string, { icon: string; label: string; bgColor: string; textColor: string }> = {
        new: { icon: '🆕', label: 'Nowa', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
        learning: { icon: '📖', label: 'W nauce', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
        review: { icon: '🔄', label: 'Powtórka', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
        mastered: { icon: '✅', label: 'Opanowana', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    }

    const status = statusConfig[result.user_status] || statusConfig.new

    return (
        <motion.div
            layout
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="p-5">
                {/* Header: Deck + Status */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                            backgroundColor: `${result.deck_color}15`,
                            color: result.deck_color
                        }}
                    >
                        {result.deck_icon} {result.deck_name}
                    </span>
                    {result.legal_basis && (
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                            📖 {result.legal_basis}
                        </span>
                    )}
                    <div className="flex-1" />
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium', status.bgColor, status.textColor)}>
                        {status.icon} {status.label}
                    </span>
                </div>

                {/* Question */}
                <h3
                    className="font-medium text-[var(--text-primary)] mb-3 cursor-pointer hover:text-[var(--accent-gold)] transition-colors"
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
                            <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                                <p className="text-[var(--accent-gold)] font-medium mb-2">
                                    ✓ {result.answer_short}
                                </p>
                                {isExpanded && result.answer_full && (
                                    <div className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        {result.answer_full}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User Progress Info */}
                {result.total_reviews > 0 && (
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--text-muted)]">
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
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                    <button
                        onClick={() => addToStudyQueue([result.flashcard_id])}
                        disabled={isAddingToQueue || result.is_due}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            result.is_due
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        {result.is_due ? 'W kolejce' : 'Dodaj do nauki'}
                    </button>

                    <button
                        onClick={() => toggleFavorite(result.flashcard_id)}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-50 transition-all"
                    >
                        {result.is_favorite ? (
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        ) : (
                            <StarOff className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-hover)] transition-all"
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
                                    className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-500"
                                >
                                    {tag}
                                </span>
                            ))}
                            {result.tags.length > 3 && (
                                <span className="text-xs text-[var(--text-muted)]">
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
