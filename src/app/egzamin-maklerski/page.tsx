'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { useAuth } from '@/hooks/use-auth';
import { EGZAMIN_MAKLERSKI_TOPICS, getCategoryById } from '@/lib/data/exam-categories';
import { BookOpen, Play, Search, FileText, ChevronRight, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function EgzaminMaklerskiPage() {
    const { profile } = useAuth();
    const stats = profile?.stats;
    const category = getCategoryById('egzamin-maklerski');

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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-[#059669] to-[#10b981]">
                            <span className="text-4xl">📈</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">{category?.name}</h1>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            {category?.description}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium">
                            <Clock size={16} />
                            Materiały w przygotowaniu
                        </div>
                    </div>

                    {/* Topic Cards - 8 groups A-H */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Grupy tematyczne</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {EGZAMIN_MAKLERSKI_TOPICS.map((topic) => {
                                const CardContent = (
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                                            style={{ background: `${topic.color}15` }}
                                        >
                                            <span className="text-2xl">{topic.icon}</span>
                                            {topic.code && (
                                                <span
                                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ background: topic.color }}
                                                >
                                                    {topic.code}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-sm text-gray-800">{topic.name}</h3>
                                                {topic.available ? (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-[#059669]/20 text-[#059669] rounded-full flex items-center gap-1">
                                                        <Play size={10} />
                                                        {topic.questionCount} pytań
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-600 rounded-full flex items-center gap-1">
                                                        <Clock size={10} />
                                                        Wkrótce
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {topic.description}
                                            </p>
                                            {/* Subtopics preview */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {topic.subtopics.slice(0, 2).map((sub, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 text-[10px] bg-gray-100 rounded-full truncate max-w-[150px]"
                                                    >
                                                        {sub.split('(')[0].trim()}
                                                    </span>
                                                ))}
                                                {topic.subtopics.length > 2 && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-gray-100 rounded-full">
                                                        +{topic.subtopics.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {topic.available && (
                                            <ChevronRight size={20} className="text-gray-500 group-hover:text-[#059669] transition-colors flex-shrink-0" />
                                        )}
                                    </div>
                                );

                                // Available topics are clickable - link to exam
                                if (topic.available) {
                                    return (
                                        <Link
                                            key={topic.id}
                                            href={`/exam?topic=${topic.id}&domain=egzamin-maklerski`}
                                            className={cn(
                                                "lex-card transition-all group text-left block",
                                                "hover:scale-[1.02] hover:border-[#059669]/50"
                                            )}
                                        >
                                            {CardContent}
                                        </Link>
                                    );
                                }

                                // Unavailable topics are not clickable
                                return (
                                    <div
                                        key={topic.id}
                                        className="lex-card transition-all group text-left opacity-70"
                                    >
                                        {CardContent}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="lex-card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">💡</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">O egzaminie maklerskim</h4>
                                <p className="text-sm text-gray-500">
                                    Egzamin na maklera papierów wartościowych składa się z 100 pytań testowych
                                    obejmujących 8 grup tematycznych (A-H). Czas na rozwiązanie: 150 minut.
                                    Wymagane minimum: 60% poprawnych odpowiedzi.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="lex-card bg-gradient-to-r from-[#059669]/10 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#059669]/20 flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <p className="font-semibold">Struktura egzaminu</p>
                                <p className="text-sm text-gray-500">
                                    8 grup tematycznych • 100 pytań na egzaminie • 150 min czasu
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav currentView="egzamin-maklerski" onNavigate={() => { }} />
        </div>
    );
}
