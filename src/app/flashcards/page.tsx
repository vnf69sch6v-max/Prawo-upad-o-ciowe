'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { Plus, BookOpen, Filter, Search, Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard, LegalDomain } from '@/types';

// Mock flashcards for demo
const MOCK_FLASHCARDS: Flashcard[] = [
    {
        id: '1',
        question: 'Co to jest zdolność prawna?',
        answer: 'Zdolność prawna to zdolność do bycia podmiotem praw i obowiązków cywilnoprawnych.',
        legalReference: 'Art. 8 k.c.',
        explanation: 'Każdy człowiek od chwili urodzenia ma zdolność prawną.',
        domain: 'prawo_cywilne',
        tags: ['podstawy', 'podmiotowość'],
        difficulty: 'easy',
        srs: { easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: new Date(), lastReview: null },
        stats: { timesReviewed: 0, timesCorrect: 0, timesIncorrect: 0, averageResponseTime: 0 },
        source: 'global',
        sourceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: '2',
        question: 'Czym różni się zdolność prawna od zdolności do czynności prawnych?',
        answer: 'Zdolność prawna to możliwość bycia podmiotem praw, zdolność do czynności prawnych to możliwość samodzielnego ich nabywania.',
        legalReference: 'Art. 8, 10-14 k.c.',
        explanation: 'Zdolność prawną ma każdy od urodzenia, zdolność do czynności prawnych nabywa się z wiekiem.',
        domain: 'prawo_cywilne',
        tags: ['podstawy', 'podmiotowość'],
        difficulty: 'medium',
        srs: { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: new Date(), lastReview: null },
        stats: { timesReviewed: 0, timesCorrect: 0, timesIncorrect: 0, averageResponseTime: 0 },
        source: 'global',
        sourceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: '3',
        question: 'Kiedy następuje nabycie pełnej zdolności do czynności prawnych?',
        answer: 'Z chwilą uzyskania pełnoletności (18 lat) lub przez zawarcie małżeństwa przez osobę niepełnoletnią.',
        legalReference: 'Art. 11 k.c.',
        explanation: 'Kobieta, która ukończyła 16 lat, może za zgodą sądu zawrzeć małżeństwo i tym samym uzyskać pełną zdolność.',
        domain: 'prawo_cywilne',
        tags: ['podstawy', 'wiek'],
        difficulty: 'medium',
        srs: { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: new Date(), lastReview: null },
        stats: { timesReviewed: 0, timesCorrect: 0, timesIncorrect: 0, averageResponseTime: 0 },
        source: 'global',
        sourceId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

const DOMAINS: { id: LegalDomain; name: string }[] = [
    { id: 'prawo_cywilne', name: 'Prawo Cywilne' },
    { id: 'prawo_karne', name: 'Prawo Karne' },
    { id: 'prawo_handlowe', name: 'Prawo Handlowe' },
    { id: 'procedura_cywilna', name: 'Procedura Cywilna' },
    { id: 'procedura_karna', name: 'Procedura Karna' },
];

export default function FlashcardsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'list' | 'study'>('list');
    const [selectedDomain, setSelectedDomain] = useState<LegalDomain | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCards = MOCK_FLASHCARDS.filter(card => {
        if (selectedDomain !== 'all' && card.domain !== selectedDomain) return false;
        if (searchQuery && !card.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const dueCards = filteredCards.filter(c => new Date(c.srs.nextReview) <= new Date());

    const handleReview = (cardId: string, quality: number, responseTime: number) => {
        console.log('Review:', { cardId, quality, responseTime });
        // API call would go here
    };

    const handleComplete = () => {
        setView('list');
    };

    if (view === 'study') {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => setView('list')}
                        className="mb-6 text-sm text-[var(--text-muted)] hover:text-white"
                    >
                        ← Powrót do listy
                    </button>
                    <FlashcardStudy
                        cards={dueCards.length > 0 ? dueCards : filteredCards.slice(0, 10)}
                        onReview={handleReview}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="flashcards"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="flashcards"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Fiszki</h1>
                                <p className="text-[var(--text-muted)]">
                                    {dueCards.length} kart do powtórki • {filteredCards.length} łącznie
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {dueCards.length > 0 && (
                                    <button
                                        onClick={() => setView('study')}
                                        className="btn btn-primary"
                                    >
                                        <Zap size={18} />
                                        Rozpocznij naukę ({dueCards.length})
                                    </button>
                                )}
                                <button className="btn btn-secondary">
                                    <Plus size={18} />
                                    Nowa fiszka
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <BookOpen size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{filteredCards.length}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Wszystkie fiszki</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Clock size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{dueCards.length}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Do powtórki</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Target size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">87%</p>
                                    <p className="text-xs text-[var(--text-muted)]">Średnia skuteczność</p>
                                </div>
                            </div>
                            <div className="lex-card flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Zap size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">892</p>
                                    <p className="text-xs text-[var(--text-muted)]">Powtórzonych dziś</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Szukaj fiszek..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedDomain('all')}
                                    className={cn(
                                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                                        selectedDomain === 'all'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white'
                                    )}
                                >
                                    Wszystkie
                                </button>
                                {DOMAINS.slice(0, 3).map(domain => (
                                    <button
                                        key={domain.id}
                                        onClick={() => setSelectedDomain(domain.id)}
                                        className={cn(
                                            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all hidden sm:block',
                                            selectedDomain === domain.id
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white'
                                        )}
                                    >
                                        {domain.name}
                                    </button>
                                ))}
                                <button className="p-2.5 bg-[var(--bg-card)] rounded-xl">
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Cards List */}
                        <div className="space-y-3">
                            {filteredCards.map(card => (
                                <div key={card.id} className="lex-card hover:border-purple-500/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium mb-1">{card.question}</p>
                                            <p className="text-sm text-[var(--text-muted)] line-clamp-1">{card.answer}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn(
                                                'px-2 py-1 rounded text-xs font-medium',
                                                card.difficulty === 'easy' && 'bg-green-500/20 text-green-400',
                                                card.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                                                card.difficulty === 'hard' && 'bg-orange-500/20 text-orange-400',
                                                card.difficulty === 'expert' && 'bg-red-500/20 text-red-400'
                                            )}>
                                                {card.difficulty}
                                            </span>
                                            {new Date(card.srs.nextReview) <= new Date() && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">
                                                    Do powtórki
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                                        <span>{card.domain.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{card.legalReference}</span>
                                        <span>•</span>
                                        <span>{card.stats.timesReviewed}x powtórzone</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="flashcards" onNavigate={() => { }} />
        </div>
    );
}
