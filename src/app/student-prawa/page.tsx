'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { useAuth } from '@/hooks/use-auth';
import { STUDENT_PRAWA_TOPICS, getCategoryById } from '@/lib/data/exam-categories';
import { BookOpen, Play, Search, FileText, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function StudentPrawaPage() {
    const { profile } = useAuth();
    const stats = profile?.stats;
    const category = getCategoryById('student-prawa');

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-[#1a365d] to-[#2563eb]">
                            <span className="text-4xl">🎓</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">{category?.name}</h1>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            {category?.description}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/flashcards?category=student-prawa"
                            className="lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                                <BookOpen size={24} className="text-[#1a365d]" />
                            </div>
                            <span className="font-medium text-sm">Fiszki</span>
                        </Link>
                        <Link
                            href="/exam?category=student-prawa"
                            className="lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                                <FileText size={24} className="text-[#1a365d]" />
                            </div>
                            <span className="font-medium text-sm">Egzaminy</span>
                        </Link>
                        <Link
                            href="/search?category=student-prawa"
                            className="lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                                <Search size={24} className="text-[#1a365d]" />
                            </div>
                            <span className="font-medium text-sm">Szukaj</span>
                        </Link>
                        <Link
                            href="/study?category=student-prawa"
                            className="lex-card hover:border-[#1a365d]/50 transition-all hover:scale-[1.02] flex flex-col items-center gap-2 py-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                                <Play size={24} className="text-[#1a365d]" />
                            </div>
                            <span className="font-medium text-sm">Nauka</span>
                        </Link>
                    </div>

                    {/* Topic Cards */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Dziedziny prawa</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {STUDENT_PRAWA_TOPICS.map((topic) => (
                                <Link
                                    key={topic.id}
                                    href={topic.available ? `/flashcards?topic=${topic.id}` : '#'}
                                    className={cn(
                                        "lex-card transition-all group text-left",
                                        topic.available
                                            ? "hover:scale-[1.02] hover:border-[#1a365d]/50 cursor-pointer"
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
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold truncate text-gray-800">{topic.name}</h3>
                                                {!topic.available && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-full flex items-center gap-1">
                                                        <Lock size={10} />
                                                        Wkrótce
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {topic.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                                    {topic.questionCount > 0 ? `${topic.questionCount} pytań` : 'Brak pytań'}
                                                </span>
                                            </div>
                                        </div>
                                        {topic.available && (
                                            <ChevronRight
                                                size={20}
                                                className="text-gray-400 group-hover:text-[#1a365d] group-hover:translate-x-1 transition-all"
                                            />
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="lex-card bg-gradient-to-r from-[#1a365d]/10 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#1a365d]/20 flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <p className="font-semibold">Łącznie w tej ścieżce</p>
                                <p className="text-sm text-gray-500">
                                    {STUDENT_PRAWA_TOPICS.reduce((sum, t) => sum + t.questionCount, 0)} pytań •
                                    {STUDENT_PRAWA_TOPICS.filter(t => t.available).length} dostępnych dziedzin
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav currentView="student-prawa" onNavigate={() => { }} />
        </div>
    );
}
