'use client';

/**
 * Session Coach Panel
 * Floating UI panel showing session coaching information
 */

import { useState, useEffect } from 'react';
import {
    Brain,
    ChevronDown,
    ChevronUp,
    Play,
    Pause,
    SkipForward,
    Clock,
    Target,
    Zap,
    Coffee
} from 'lucide-react';
import { useSessionCoach } from '@/hooks/use-session-coach';
import type { StudyMode } from '@/lib/agents';
import { cn } from '@/lib/utils/cn';

interface SessionCoachPanelProps {
    defaultOpen?: boolean;
    position?: 'bottom-right' | 'bottom-left';
    /** Force show the panel even if session not active - will auto-start session */
    forceShow?: boolean;
    /** Mode to auto-start session with */
    mode?: StudyMode;
}

export function SessionCoachPanel({
    defaultOpen = true,
    position = 'bottom-right',
    forceShow = true,
    mode = 'flashcards'
}: SessionCoachPanelProps) {
    const [isExpanded, setIsExpanded] = useState(defaultOpen);
    const coach = useSessionCoach();

    // Auto-start session when panel is mounted with forceShow
    useEffect(() => {
        if (forceShow && !coach.isActive) {
            coach.startSession(mode);
        }
    }, [forceShow, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // Don't show if no active session and not forcing
    if (!coach.isActive && !forceShow) {
        return null;
    }

    const phaseColors: Record<string, string> = {
        warmup: 'bg-amber-500',
        peak: 'bg-green-500',
        fatigue: 'bg-orange-500',
        recovery: 'bg-blue-500',
    };

    const fatigueColors: Record<string, string> = {
        none: 'text-green-600',
        mild: 'text-yellow-600',
        moderate: 'text-orange-600',
        severe: 'text-red-600',
    };

    return (
        <div
            className={cn(
                'fixed z-50 transition-all duration-300',
                position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4'
            )}
        >
            {/* Collapsed view - just icon */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                        'w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
                        'bg-white border-2 border-gray-200 hover:border-blue-400',
                        'transition-all hover:scale-105'
                    )}
                >
                    <div className="relative">
                        <Brain className="w-6 h-6 text-blue-600" />
                        <span
                            className={cn(
                                'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                                phaseColors[coach.sessionPhase]
                            )}
                        />
                    </div>
                </button>
            )}

            {/* Expanded panel */}
            {isExpanded && (
                <div className="w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                <span className="font-semibold">Trener Sesji</span>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-mono">{coach.sessionDuration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">{Math.round(coach.sessionAccuracy)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>{coach.questionsAnswered}</span>
                            </div>
                        </div>
                    </div>

                    {/* Phase indicator */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Faza sesji</span>
                            <span className={cn('text-xs font-medium', fatigueColors[coach.fatigueLevel])}>
                                {coach.fatigueLevel !== 'none' && `Zmęczenie: ${coach.fatigueLevel}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{coach.phaseEmoji}</span>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{coach.phaseLabel}</div>
                                <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            phaseColors[coach.sessionPhase]
                                        )}
                                        style={{
                                            width: `${Math.min(100, (coach.questionsAnswered / 20) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streak indicator */}
                    {coach.currentStreak >= 3 && (
                        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                            <div className="flex items-center gap-2 text-amber-700">
                                <span className="text-lg">🔥</span>
                                <span className="text-sm font-medium">
                                    {coach.currentStreak} poprawnych pod rząd!
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Pomodoro section */}
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Coffee className="w-3 h-3" />
                                Pomodoro
                            </span>
                            {coach.pomodoro.sessionsCompleted > 0 && (
                                <span className="text-xs text-gray-400">
                                    Ukończone: {coach.pomodoro.sessionsCompleted}
                                </span>
                            )}
                        </div>

                        {coach.pomodoro.isActive ? (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        'text-2xl font-mono font-bold',
                                        coach.pomodoro.isBreak ? 'text-blue-600' : 'text-gray-900'
                                    )}>
                                        {coach.pomodoroFormatted}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                        {coach.pomodoro.isBreak ? '☕ Przerwa' : '📚 Nauka'}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            coach.pomodoro.isBreak ? 'bg-blue-500' : 'bg-green-500'
                                        )}
                                        style={{ width: `${coach.pomodoroProgress * 100}%` }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={coach.pausePomodoro}
                                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <Pause className="w-4 h-4" />
                                        Pauza
                                    </button>
                                    {coach.pomodoro.isBreak && (
                                        <button
                                            onClick={coach.skipBreak}
                                            className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                        >
                                            <SkipForward className="w-4 h-4" />
                                            Pomiń
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={coach.startPomodoro}
                                className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Rozpocznij Pomodoro
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
