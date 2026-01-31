'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { useAuth } from '@/hooks/use-auth';
import { EGZAMIN_ASO_TOPICS, getCategoryById } from '@/lib/data/exam-categories';
import { BookOpen, Play, Search, FileText, ChevronRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function EgzaminASOPage() {
    const { profile } = useAuth();
    const stats = profile?.stats;
    const category = getCategoryById('egzamin-aso');

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
            <LiquidGlassSidebar
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <main className="overflow-auto p-6 pb-20 lg:pb-6">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-[#0d9488] to-[#14b8a6]">
                            <span className="text-4xl">📊</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
                        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
                            {category?.description}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/flashcards?topic=aso"
                            className="lex-card hover:border-[#0d9488]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 flex items-center justify-center">
                                <BookOpen size={24} className="text-[#0d9488]" />
                            </div>
                            <span className="font-medium text-sm">Fiszki</span>
                        </Link>
                        <Link
                            href="/exam?domain=aso"
                            className="lex-card hover:border-[#0d9488]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 flex items-center justify-center">
                                <FileText size={24} className="text-[#0d9488]" />
                            </div>
                            <span className="font-medium text-sm">Egzaminy</span>
                        </Link>
                        <Link
                            href="/search?domain=aso"
                            className="lex-card hover:border-[#0d9488]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 flex items-center justify-center">
                                <Search size={24} className="text-[#0d9488]" />
                            </div>
                            <span className="font-medium text-sm">Szukaj</span>
                        </Link>
                        <Link
                            href="/weak-points?domain=aso"
                            className="lex-card hover:border-[#0d9488]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 flex items-center justify-center">
                                <Target size={24} className="text-[#0d9488]" />
                            </div>
                            <span className="font-medium text-sm">Słabe punkty</span>
                        </Link>
                    </div>

                    {/* Topic Cards */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Obszary tematyczne</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {EGZAMIN_ASO_TOPICS.map((topic) => (
                                <Link
                                    key={topic.id}
                                    href={topic.available ? `/flashcards?topic=${topic.id}` : '#'}
                                    className={cn(
                                        "lex-card transition-all group text-left",
                                        topic.available
                                            ? "hover:scale-[1.02] hover:border-[#0d9488]/50 cursor-pointer"
                                            : "opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                            style={{ background: `${topic.color}15` }}
                                        >
                                            {topic.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold mb-1">{topic.name}</h3>
                                            <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                                                {topic.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                                                <span className="px-2 py-0.5 bg-[var(--bg-hover)] rounded-full">
                                                    {topic.questionCount} pytań
                                                </span>
                                            </div>
                                        </div>
                                        {topic.available && (
                                            <ChevronRight
                                                size={20}
                                                className="text-[var(--text-muted)] group-hover:text-[#0d9488] group-hover:translate-x-1 transition-all"
                                            />
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="lex-card border-l-4 border-l-[#0d9488] bg-gradient-to-r from-[#0d9488]/5 to-transparent">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">💡</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">O certyfikacie Doradcy ASO</h4>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Certyfikat Doradcy Autoryzowanego w Alternatywnym Systemie Obrotu (ASO)
                                    uprawnia do świadczenia usług doradztwa dla emitentów na rynkach
                                    NewConnect i Catalyst prowadzonych przez GPW.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="lex-card bg-gradient-to-r from-[#0d9488]/10 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0d9488]/20 flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <p className="font-semibold">Łącznie w tej ścieżce</p>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {EGZAMIN_ASO_TOPICS.reduce((sum, t) => sum + t.questionCount, 0)} pytań •
                                    {EGZAMIN_ASO_TOPICS.filter(t => t.available).length} dostępnych obszarów
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav currentView="egzamin-aso" onNavigate={() => { }} />
        </div>
    );
}
