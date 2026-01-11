'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { FlashcardStudy } from '@/components/study';
import { SAMPLE_FLASHCARDS } from '@/lib/data';
import { BookOpen, Flame, Target, Clock, Plus, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { LegalDomain } from '@/types';

const DOMAINS: { id: LegalDomain | 'all'; name: string }[] = [
    { id: 'all', name: 'Wszystkie' },
    { id: 'prawo_cywilne', name: 'Prawo Cywilne' },
    { id: 'prawo_karne', name: 'Prawo Karne' },
    { id: 'prawo_handlowe', name: 'Prawo Handlowe' },
    { id: 'procedura_cywilna', name: 'Procedura Cywilna' },
];

export default function StudyPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'decks' | 'study'>('decks');
    const [selectedDomain, setSelectedDomain] = useState<LegalDomain | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter flashcards
    const flashcards = SAMPLE_FLASHCARDS.filter(card => {
        if (selectedDomain !== 'all' && card.domain !== selectedDomain) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return card.question.toLowerCase().includes(query) ||
                card.answer.toLowerCase().includes(query);
        }
        return true;
    });

    // Calculate stats per domain
    const domainStats = DOMAINS.slice(1).map(domain => {
        const cards = SAMPLE_FLASHCARDS.filter(c => c.domain === domain.id);
        return {
            ...domain,
            total: cards.length,
            due: Math.floor(cards.length * 0.3), // Mock: 30% due
            mastery: Math.floor(Math.random() * 30) + 60, // Mock: 60-90%
        };
    });

    const handleStudyComplete = () => {
        setView('decks');
    };

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="study"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="study"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    {view === 'decks' ? (
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        <BookOpen className="text-#1a365d" />
                                        Nauka Fiszek
                                    </h1>
                                    <p className="text-[var(--text-muted)]">
                                        {flashcards.length} fiszek do powtórek
                                    </p>
                                </div>
                                <button className="btn btn-primary">
                                    <Plus size={18} />
                                    Dodaj fiszkę
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                        <Flame size={24} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">12</p>
                                        <p className="text-xs text-[var(--text-muted)]">Dni streak</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <BookOpen size={24} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">45</p>
                                        <p className="text-xs text-[var(--text-muted)]">Do powtórki</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <Target size={24} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">87%</p>
                                        <p className="text-xs text-[var(--text-muted)]">Skuteczność</p>
                                    </div>
                                </div>
                                <div className="lex-card flex items-center gap-4">
                                    <div className="w-12 h-12 bg-#1a365d/20 rounded-xl flex items-center justify-center">
                                        <Clock size={24} className="text-#1a365d" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">~15min</p>
                                        <p className="text-xs text-[var(--text-muted)]">Estymowany czas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Start Study CTA */}
                            <button
                                onClick={() => setView('study')}
                                className="w-full p-6 bg-gradient-to-r from-#1a365d/20 to-pink-600/20 border border-#1a365d/30 rounded-2xl hover:border-#1a365d/50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-#1a365d to-pink-600 rounded-xl flex items-center justify-center">
                                            <BookOpen size={28} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xl font-bold">Rozpocznij sesję nauki</p>
                                            <p className="text-[var(--text-muted)]">45 fiszek do powtórek z algorytmem SRS</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-#1a365d rounded-xl flex items-center justify-center group-hover:bg-#1a365d transition-colors">
                                        →
                                    </div>
                                </div>
                            </button>

                            {/* Search & Filter */}
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Szukaj fiszek..."
                                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl focus:border-#1a365d focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {DOMAINS.map(domain => (
                                        <button
                                            key={domain.id}
                                            onClick={() => setSelectedDomain(domain.id)}
                                            className={cn(
                                                'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                                                selectedDomain === domain.id
                                                    ? 'bg-#1a365d text-white'
                                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white'
                                            )}
                                        >
                                            {domain.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Domain Cards */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {domainStats.map(domain => (
                                    <div key={domain.id} className="lex-card hover:border-#1a365d/30 cursor-pointer">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">{domain.name}</h3>
                                            <span className={cn(
                                                'px-2 py-1 rounded-full text-xs font-semibold',
                                                domain.mastery >= 80 && 'bg-green-500/20 text-green-400',
                                                domain.mastery >= 60 && domain.mastery < 80 && 'bg-yellow-500/20 text-yellow-400',
                                                domain.mastery < 60 && 'bg-red-500/20 text-red-400'
                                            )}>
                                                {domain.mastery}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden mb-4">
                                            <div
                                                className="h-full bg-gradient-to-r from-#1a365d to-#1a365d"
                                                style={{ width: `${domain.mastery}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm text-[var(--text-muted)]">
                                            <span>{domain.total} fiszek</span>
                                            <span className="text-#1a365d">{domain.due} do powtórki</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <FlashcardStudy
                            cards={flashcards.map((card, i) => ({
                                ...card,
                                id: `card-${i}`,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }))}
                            onReview={(cardId, quality, responseTime) => {
                                console.log('Review:', cardId, quality, responseTime);
                            }}
                            onComplete={handleStudyComplete}
                        />
                    )}
                </main>
            </div>

            <MobileNav currentView="study" onNavigate={() => { }} />
        </div>
    );
}
