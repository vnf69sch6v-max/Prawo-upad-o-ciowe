'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import {
    BarChart3, TrendingUp, TrendingDown, Target, Clock,
    BookOpen, Brain, Calendar, Download, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Mock analytics data
const WEEKLY_DATA = [
    { day: 'Pon', cards: 45, accuracy: 82, time: 35 },
    { day: 'Wt', cards: 62, accuracy: 88, time: 48 },
    { day: 'Śr', cards: 38, accuracy: 75, time: 28 },
    { day: 'Czw', cards: 71, accuracy: 91, time: 55 },
    { day: 'Pt', cards: 55, accuracy: 85, time: 42 },
    { day: 'Sob', cards: 28, accuracy: 78, time: 22 },
    { day: 'Nie', cards: 15, accuracy: 80, time: 12 },
];

const DOMAIN_STATS = [
    { name: 'Prawo Cywilne', mastery: 78, cards: 245, reviews: 1823 },
    { name: 'Prawo Karne', mastery: 92, cards: 189, reviews: 1456 },
    { name: 'Prawo Handlowe', mastery: 65, cards: 156, reviews: 987 },
    { name: 'Procedura Cywilna', mastery: 81, cards: 178, reviews: 1234 },
    { name: 'Procedura Karna', mastery: 73, cards: 134, reviews: 876 },
    { name: 'Prawo Administracyjne', mastery: 68, cards: 112, reviews: 654 },
    { name: 'Prawo Konstytucyjne', mastery: 85, cards: 98, reviews: 543 },
    { name: 'Prawo Pracy', mastery: 71, cards: 87, reviews: 432 },
];

const MILESTONES = [
    { date: '2025-12-01', type: 'streak', value: 10, label: '10 dni streak' },
    { date: '2025-12-15', type: 'equity', value: 5000, label: '€5,000 Equity' },
    { date: '2025-12-28', type: 'cards', value: 500, label: '500 fiszek' },
    { date: '2026-01-05', type: 'exam', value: 90, label: '90% na egzaminie' },
];

export default function AnalyticsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    const maxCards = Math.max(...WEEKLY_DATA.map(d => d.cards));

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="analytics"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="analytics"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <BarChart3 className="text-purple-400" />
                                    Analityka
                                </h1>
                                <p className="text-[var(--text-muted)]">Szczegółowe statystyki Twojej nauki</p>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                                    className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="7d">Ostatnie 7 dni</option>
                                    <option value="30d">Ostatnie 30 dni</option>
                                    <option value="90d">Ostatnie 90 dni</option>
                                    <option value="all">Wszystko</option>
                                </select>
                                <button className="btn btn-secondary">
                                    <Download size={18} />
                                    Eksport
                                </button>
                            </div>
                        </div>

                        {/* KPI Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <BookOpen size={20} className="text-purple-400" />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Fiszek powtórzonych</span>
                                </div>
                                <p className="text-3xl font-bold">2,847</p>
                                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={14} />
                                    +12% vs poprzedni okres
                                </p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Target size={20} className="text-green-400" />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Średnia skuteczność</span>
                                </div>
                                <p className="text-3xl font-bold">84%</p>
                                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={14} />
                                    +3% vs poprzedni okres
                                </p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Clock size={20} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Czas nauki</span>
                                </div>
                                <p className="text-3xl font-bold">18.5h</p>
                                <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                                    <TrendingDown size={14} />
                                    -5% vs poprzedni okres
                                </p>
                            </div>

                            <div className="lex-card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <Brain size={20} className="text-orange-400" />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">Retention Rate</span>
                                </div>
                                <p className="text-3xl font-bold">87%</p>
                                <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={14} />
                                    +2% vs poprzedni okres
                                </p>
                            </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="lex-card">
                            <h3 className="text-lg font-semibold mb-6">Aktywność tygodniowa</h3>
                            <div className="flex items-end gap-3 h-48">
                                {WEEKLY_DATA.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center gap-1">
                                            <span className="text-xs text-[var(--text-muted)]">{day.cards}</span>
                                            <div
                                                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-500 hover:to-purple-300"
                                                style={{ height: `${(day.cards / maxCards) * 150}px` }}
                                            />
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)]">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 pt-4 border-t border-[var(--border-color)] text-sm">
                                <div>
                                    <span className="text-[var(--text-muted)]">Suma: </span>
                                    <span className="font-semibold">{WEEKLY_DATA.reduce((a, b) => a + b.cards, 0)} fiszek</span>
                                </div>
                                <div>
                                    <span className="text-[var(--text-muted)]">Średnia: </span>
                                    <span className="font-semibold">{Math.round(WEEKLY_DATA.reduce((a, b) => a + b.cards, 0) / 7)}/dzień</span>
                                </div>
                                <div>
                                    <span className="text-[var(--text-muted)]">Czas: </span>
                                    <span className="font-semibold">{WEEKLY_DATA.reduce((a, b) => a + b.time, 0)} min</span>
                                </div>
                            </div>
                        </div>

                        {/* Domain Breakdown */}
                        <div className="lex-card">
                            <h3 className="text-lg font-semibold mb-6">Postęp według dziedzin</h3>
                            <div className="space-y-4">
                                {DOMAIN_STATS.map((domain, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{domain.name}</span>
                                            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                                <span>{domain.cards} fiszek</span>
                                                <span className={cn(
                                                    'font-semibold',
                                                    domain.mastery >= 85 && 'text-green-400',
                                                    domain.mastery >= 70 && domain.mastery < 85 && 'text-yellow-400',
                                                    domain.mastery < 70 && 'text-red-400'
                                                )}>
                                                    {domain.mastery}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    domain.mastery >= 85 && 'bg-gradient-to-r from-green-600 to-green-400',
                                                    domain.mastery >= 70 && domain.mastery < 85 && 'bg-gradient-to-r from-yellow-600 to-yellow-400',
                                                    domain.mastery < 70 && 'bg-gradient-to-r from-red-600 to-red-400'
                                                )}
                                                style={{ width: `${domain.mastery}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Milestones */}
                        <div className="lex-card">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Calendar className="text-purple-400" />
                                Osiągnięte kamienie milowe
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {MILESTONES.map((milestone, i) => (
                                    <div key={i} className="p-4 bg-[var(--bg-hover)] rounded-xl text-center">
                                        <div className="text-2xl mb-2">
                                            {milestone.type === 'streak' && '🔥'}
                                            {milestone.type === 'equity' && '💰'}
                                            {milestone.type === 'cards' && '📚'}
                                            {milestone.type === 'exam' && '🎯'}
                                        </div>
                                        <p className="font-semibold">{milestone.label}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{milestone.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="analytics" onNavigate={() => { }} />
        </div>
    );
}
