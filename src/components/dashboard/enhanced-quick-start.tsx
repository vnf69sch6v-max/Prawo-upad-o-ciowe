'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import {
    BookOpen, Brain, ClipboardCheck, Sparkles,
    Play, ArrowRight, AlertTriangle, Clock, Target
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface QuickStartProps {
    dueFlashcards: number;
    weakestDomain: string;
    weakestDomainScore: number;
    dailyGoalProgress: number;
    dailyGoalTarget: number;
    suggestedActivity: 'flashcards' | 'quiz' | 'exam' | 'review';
    estimatedTime: number;
    streakAtRisk: boolean;
    currentStreak: number;
    onStartActivity: (activity: string) => void;
}

// ============================================
// ACTIVITY CONFIG
// ============================================

const ACTIVITIES = {
    flashcards: {
        icon: BookOpen,
        title: 'Powtórz fiszki',
        description: 'Masz fiszki do powtórzenia',
        color: '#8b5cf6',
        gradient: 'from-#1a365d to-purple-800',
    },
    quiz: {
        icon: Brain,
        title: 'Quick Quiz',
        description: 'Przetestuj swoją wiedzę',
        color: '#3b82f6',
        gradient: 'from-blue-600 to-blue-800',
    },
    exam: {
        icon: ClipboardCheck,
        title: 'Egzamin próbny',
        description: 'Symulacja prawdziwego egzaminu',
        color: '#10b981',
        gradient: 'from-emerald-600 to-emerald-800',
    },
    review: {
        icon: Sparkles,
        title: 'Powtórka słabych dziedzin',
        description: 'Skoncentruj się na słabych punktach',
        color: '#f59e0b',
        gradient: 'from-amber-600 to-amber-800',
    },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedQuickStart({
    dueFlashcards,
    weakestDomain,
    weakestDomainScore,
    dailyGoalProgress,
    dailyGoalTarget,
    suggestedActivity,
    estimatedTime,
    streakAtRisk,
    currentStreak,
    onStartActivity,
}: QuickStartProps) {
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);

    const activity = ACTIVITIES[suggestedActivity];
    const ActivityIcon = activity.icon;
    const remainingCards = dailyGoalTarget - dailyGoalProgress;
    const goalPercent = Math.min((dailyGoalProgress / dailyGoalTarget) * 100, 100);
    const isGoalComplete = goalPercent >= 100;

    return (
        <div className="space-y-4">
            {/* Streak Warning */}
            {streakAtRisk && (
                <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl animate-pulse">
                    <AlertTriangle className="text-orange-400" size={24} />
                    <div>
                        <p className="font-semibold text-orange-400">
                            🔥 Twój {currentStreak}-dniowy streak jest zagrożony!
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                            Ukończ co najmniej jedną sesję, aby utrzymać serię.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Cards Grid */}
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Primary Action Card (2/3 width) */}
                <div
                    className={cn(
                        'lg:col-span-2 relative rounded-2xl p-6 cursor-pointer transition-all overflow-hidden',
                        `bg-gradient-to-br ${activity.gradient}`
                    )}
                    style={{
                        boxShadow: isPrimaryHovered
                            ? `0 0 40px -10px ${activity.color}`
                            : '0 10px 30px -10px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={() => setIsPrimaryHovered(true)}
                    onMouseLeave={() => setIsPrimaryHovered(false)}
                    onClick={() => onStartActivity(suggestedActivity)}
                >
                    {/* Pulsing glow animation */}
                    <div
                        className="absolute inset-0 animate-pulse opacity-20"
                        style={{
                            background: `radial-gradient(circle at 30% 50%, ${activity.color}, transparent 70%)`,
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                                    <ActivityIcon size={28} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{activity.title}</p>
                                    <p className="text-white/70">{activity.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                                <Clock size={14} className="text-white/70" />
                                <span className="text-sm text-white/70">~{estimatedTime} min</span>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 mb-6">
                            {suggestedActivity === 'flashcards' && (
                                <div className="text-white">
                                    <span className="text-3xl font-bold">{dueFlashcards}</span>
                                    <span className="text-white/70 ml-2">fiszek do powtórki</span>
                                </div>
                            )}
                            {suggestedActivity === 'review' && (
                                <div className="text-white">
                                    <span className="font-semibold">{weakestDomain}</span>
                                    <span className="text-white/70 ml-2">({weakestDomainScore}%)</span>
                                </div>
                            )}
                        </div>

                        {/* Start button */}
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition-colors">
                            <Play size={18} />
                            Rozpocznij
                            <ArrowRight size={18} className={cn('transition-transform', isPrimaryHovered && 'translate-x-1')} />
                        </button>
                    </div>
                </div>

                {/* Secondary Cards (1/3 width) */}
                <div className="flex flex-col gap-4">
                    {/* Mock Exam Card */}
                    <div
                        className="flex-1 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/30 cursor-pointer transition-all group"
                        onClick={() => onStartActivity('exam')}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <ClipboardCheck size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold">Egzamin próbny</p>
                                <p className="text-xs text-[var(--text-muted)]">30 pytań · 45 min</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--text-muted)]">Ostatni wynik: 82%</span>
                            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>

                    {/* AI Assistant Card */}
                    <div
                        className="flex-1 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-500/30 cursor-pointer transition-all group"
                        onClick={() => onStartActivity('ai')}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Sparkles size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold">Asystent AI</p>
                                <p className="text-xs text-[var(--text-muted)]">Zadaj pytanie</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-#1a365d to-pink-600 rounded text-xs">PRO</span>
                            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target size={18} className={isGoalComplete ? 'text-green-400' : 'text-[#1a365d]'} />
                        <span className="font-medium">Dzienny cel</span>
                    </div>
                    <span className="text-sm">
                        <span className={isGoalComplete ? 'text-green-400' : 'text-[#1a365d]'}>
                            {dailyGoalProgress}
                        </span>
                        <span className="text-[var(--text-muted)]"> / {dailyGoalTarget} fiszek</span>
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden mb-2">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isGoalComplete
                                ? 'bg-gradient-to-r from-green-600 to-green-400'
                                : 'bg-gradient-to-r from-#1a365d to-#1a365d'
                        )}
                        style={{ width: `${goalPercent}%` }}
                    />
                </div>

                {/* Message */}
                <p className="text-sm text-[var(--text-muted)]">
                    {isGoalComplete ? (
                        <span className="text-green-400">🎉 Gratulacje! Osiągnąłeś dzienny cel!</span>
                    ) : (
                        <>Ukończ jeszcze <strong className="text-white">{remainingCards} fiszek</strong> aby osiągnąć dzienny cel</>
                    )}
                </p>
            </div>
        </div>
    );
}
