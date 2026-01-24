'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Search, BookOpen, Loader2, ChevronRight, Play, Target } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';
import { ALL_ASO_QUESTIONS } from '@/lib/data/aso';
import Link from 'next/link';

// Question type
interface SearchQuestion {
    id: string;
    question: string;
    article?: string;
    articleTitle?: string;
    section?: string;
    options: { a: string; b: string; c: string; d: string };
    correct: 'a' | 'b' | 'c' | 'd';
    explanation: string;
    domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso';
}

// Combine all questions with domain labels
const ALL_QUESTIONS: SearchQuestion[] = [
    ...ALL_KSH_QUESTIONS.map(q => ({ ...q, domain: 'ksh' as const })),
    ...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.map(q => ({ ...q, domain: 'prawo_upadlosciowe' as const })),
    ...ALL_KC_QUESTIONS.map(q => ({ ...q, domain: 'prawo_cywilne' as const })),
    ...ALL_ASO_QUESTIONS.map(q => ({ ...q, domain: 'aso' as const })),
];

// Stats per domain
const DOMAIN_STATS = {
    ksh: ALL_KSH_QUESTIONS.length,
    prawo_upadlosciowe: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length,
    prawo_cywilne: ALL_KC_QUESTIONS.length,
    aso: ALL_ASO_QUESTIONS.length,
    total: ALL_QUESTIONS.length,
};

export default function SearchPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState<SearchQuestion | null>(null);
    const [domainFilter, setDomainFilter] = useState<'all' | 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso'>('all');
    const [showAnswer, setShowAnswer] = useState(false);

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    // Search results
    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        let filtered = ALL_QUESTIONS;

        // Apply domain filter
        if (domainFilter !== 'all') {
            filtered = filtered.filter(q => q.domain === domainFilter);
        }

        // Apply search query
        if (query) {
            filtered = filtered.filter(q =>
                q.question.toLowerCase().includes(query) ||
                q.article?.toLowerCase().includes(query) ||
                q.articleTitle?.toLowerCase().includes(query) ||
                q.section?.toLowerCase().includes(query) ||
                q.explanation.toLowerCase().includes(query) ||
                Object.values(q.options).some(opt => opt.toLowerCase().includes(query))
            );
        }

        // Limit results for performance
        return filtered.slice(0, 50);
    }, [searchQuery, domainFilter]);

    const getDomainLabel = (domain: string) => {
        switch (domain) {
            case 'ksh': return 'KSH';
            case 'prawo_upadlosciowe': return 'Prawo Upadł.';
            case 'prawo_cywilne': return 'Kodeks Cywilny';
            case 'aso': return 'ASO';
            default: return domain;
        }
    };

    const getDomainColor = (domain: string) => {
        switch (domain) {
            case 'ksh': return { bg: 'bg-[#1a365d]/10', text: 'text-[#1a365d]' };
            case 'prawo_upadlosciowe': return { bg: 'bg-orange-500/10', text: 'text-orange-500' };
            case 'prawo_cywilne': return { bg: 'bg-blue-500/10', text: 'text-blue-500' };
            case 'aso': return { bg: 'bg-teal-500/10', text: 'text-teal-500' };
            default: return { bg: 'bg-gray-500/10', text: 'text-gray-500' };
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="search"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="search"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#3b82f6' }}>
                                <Search size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Wyszukiwarka pytań</h1>
                            <p className="text-[var(--text-muted)]">
                                Przeszukaj wszystkie {DOMAIN_STATS.total.toLocaleString()} pytań z bazy
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { key: 'ksh', label: 'KSH', count: DOMAIN_STATS.ksh },
                                { key: 'prawo_upadlosciowe', label: 'Prawo Upadł.', count: DOMAIN_STATS.prawo_upadlosciowe },
                                { key: 'prawo_cywilne', label: 'Kodeks Cywilny', count: DOMAIN_STATS.prawo_cywilne },
                                { key: 'aso', label: 'ASO', count: DOMAIN_STATS.aso },
                            ].map(d => (
                                <button
                                    key={d.key}
                                    onClick={() => setDomainFilter(d.key as typeof domainFilter)}
                                    className={cn(
                                        "p-4 rounded-xl text-center transition-all",
                                        domainFilter === d.key
                                            ? "bg-[#3b82f6] text-white"
                                            : "bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
                                    )}
                                >
                                    <p className="text-2xl font-bold">{d.count}</p>
                                    <p className="text-sm opacity-80">{d.label}</p>
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Szukaj pytania, artykułu, hasła... (np. 'odpowiedzialność', '299', 'NewConnect')"
                                className="w-full pl-12 pr-4 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl focus:border-[#3b82f6] focus:outline-none text-lg"
                                autoFocus
                            />
                        </div>

                        {/* Domain Filter Pills */}
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'ksh', 'prawo_upadlosciowe', 'prawo_cywilne', 'aso'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDomainFilter(d)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                        domainFilter === d
                                            ? 'bg-[#3b82f6] text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#3b82f6]'
                                    )}
                                >
                                    {d === 'all' ? 'Wszystkie' : getDomainLabel(d)}
                                </button>
                            ))}
                        </div>

                        {/* Selected Question Detail */}
                        {selectedQuestion ? (
                            <div className="space-y-4">
                                <button
                                    onClick={() => { setSelectedQuestion(null); setShowAnswer(false); }}
                                    className="text-sm text-[var(--text-muted)] hover:text-[#3b82f6]"
                                >
                                    ← Powrót do wyników
                                </button>

                                <div className="lex-card">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block",
                                                getDomainColor(selectedQuestion.domain).bg,
                                                getDomainColor(selectedQuestion.domain).text
                                            )}>
                                                {getDomainLabel(selectedQuestion.domain)}
                                            </span>
                                            {selectedQuestion.article && (
                                                <p className="text-sm text-[var(--text-muted)] mb-2">
                                                    {selectedQuestion.article} - {selectedQuestion.articleTitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-lg font-medium mb-6">{selectedQuestion.question}</p>

                                    <div className="space-y-3">
                                        {(['a', 'b', 'c', 'd'] as const).map(key => {
                                            const isCorrect = key === selectedQuestion.correct;
                                            return (
                                                <div
                                                    key={key}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all",
                                                        showAnswer && isCorrect
                                                            ? "bg-green-500/20 border-green-500"
                                                            : "bg-[var(--bg-hover)] border-transparent"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                            showAnswer && isCorrect
                                                                ? "bg-green-500 text-white"
                                                                : "bg-[var(--bg-card)]"
                                                        )}>
                                                            {key.toUpperCase()}
                                                        </span>
                                                        <span className="flex-1">{selectedQuestion.options[key]}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Show Answer Button */}
                                    {!showAnswer ? (
                                        <button
                                            onClick={() => setShowAnswer(true)}
                                            className="mt-6 w-full py-3 rounded-xl bg-[#3b82f6] text-white font-medium"
                                        >
                                            Pokaż odpowiedź
                                        </button>
                                    ) : (
                                        <div className="mt-6 p-4 bg-[var(--bg-hover)] rounded-xl">
                                            <p className="text-sm font-medium mb-1">Wyjaśnienie:</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{selectedQuestion.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Results List */
                            <div className="space-y-3">
                                <p className="text-sm text-[var(--text-muted)]">
                                    {searchQuery
                                        ? `${searchResults.length}${searchResults.length === 50 ? '+' : ''} wyników dla "${searchQuery}"`
                                        : `Wyświetlam ${searchResults.length} z ${domainFilter === 'all' ? DOMAIN_STATS.total : DOMAIN_STATS[domainFilter]} pytań`
                                    }
                                </p>

                                {searchResults.length === 0 ? (
                                    <div className="lex-card py-12 text-center">
                                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl bg-[var(--bg-hover)]">
                                            🔍
                                        </div>
                                        <p className="font-medium">Brak wyników</p>
                                        <p className="text-sm text-[var(--text-muted)]">Spróbuj innego hasła</p>
                                    </div>
                                ) : (
                                    searchResults.map(q => {
                                        const colors = getDomainColor(q.domain);
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setSelectedQuestion(q)}
                                                className="w-full lex-card text-left hover:border-[#3b82f6]/50 transition-all group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        colors.bg
                                                    )}>
                                                        <BookOpen size={18} className={colors.text} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium line-clamp-2 mb-1">{q.question}</p>
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                            <span className={cn("px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                                                                {getDomainLabel(q.domain)}
                                                            </span>
                                                            {q.article && (
                                                                <span>{q.article}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[#3b82f6] shrink-0" />
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        {!selectedQuestion && searchResults.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/exam"
                                    className="lex-card hover:border-[#3b82f6]/50 transition-all flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
                                        <Play size={18} className="text-[#3b82f6]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Rozwiąż egzamin</p>
                                        <p className="text-xs text-[var(--text-muted)]">Przetestuj wiedzę</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/weak-points"
                                    className="lex-card hover:border-[#ef4444]/50 transition-all flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                                        <Target size={18} className="text-[#ef4444]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Słabe punkty</p>
                                        <p className="text-xs text-[var(--text-muted)]">Powtórz trudne</p>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="search" onNavigate={() => { }} />
        </div>
    );
}
