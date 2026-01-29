'use client';

/**
 * useSessionCoach Hook
 * React hook for integrating Session Coach Agent into study components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getSessionCoach,
    type CoachingState,
    type Intervention,
    type SessionPhase,
    type StudyMode,
    type PomodoroState,
} from '@/lib/agents';
import type { QuestionResponseEvent } from '@/lib/profiling/types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface UseSessionCoachReturn {
    // Session info
    isActive: boolean;
    sessionPhase: SessionPhase;
    sessionDuration: string;
    currentMode: StudyMode;

    // Performance
    questionsAnswered: number;
    sessionAccuracy: number;
    currentStreak: number;

    // Fatigue
    fatigueLevel: 'none' | 'mild' | 'moderate' | 'severe';
    fatigueScore: number;

    // Interventions
    activeIntervention: Intervention | null;
    dismissIntervention: () => void;
    acceptIntervention: () => void;

    // Pomodoro
    pomodoro: PomodoroState;
    pomodoroFormatted: string;
    pomodoroProgress: number;
    startPomodoro: () => void;
    pausePomodoro: () => void;
    skipBreak: () => void;

    // Session control
    startSession: (mode?: StudyMode) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    endSession: () => void;
    setMode: (mode: StudyMode) => void;

    // Event reporting
    reportQuestionAnswered: (event: Partial<QuestionResponseEvent>) => void;

    // UI helpers
    phaseEmoji: string;
    phaseLabel: string;
}

// ═══════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════

export function useSessionCoach(): UseSessionCoachReturn {
    const coach = useRef(getSessionCoach());
    const [state, setState] = useState<CoachingState | null>(null);
    const [activeIntervention, setActiveIntervention] = useState<Intervention | null>(null);
    const [isActive, setIsActive] = useState(false);
    const updateInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    // Sync state from agent
    const syncState = useCallback(() => {
        if (coach.current) {
            setState(coach.current.getState());
        }
    }, []);

    // Setup intervention callback
    useEffect(() => {
        coach.current.setOnIntervention((intervention) => {
            setActiveIntervention(intervention);
        });

        return () => {
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
            }
        };
    }, []);

    // Update state periodically when active
    useEffect(() => {
        if (isActive) {
            updateInterval.current = setInterval(syncState, 1000);
        } else {
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
            }
        }

        return () => {
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
            }
        };
    }, [isActive, syncState]);

    // Session control
    const startSession = useCallback((mode: StudyMode = 'flashcards') => {
        coach.current.startSession(mode);
        setIsActive(true);
        syncState();
    }, [syncState]);

    const pauseSession = useCallback(() => {
        coach.current.pauseSession();
        syncState();
    }, [syncState]);

    const resumeSession = useCallback(() => {
        coach.current.resumeSession();
        syncState();
    }, [syncState]);

    const endSession = useCallback(() => {
        coach.current.endSession();
        setIsActive(false);
        setState(null);
    }, []);

    const setMode = useCallback((mode: StudyMode) => {
        coach.current.setMode(mode);
        syncState();
    }, [syncState]);

    // Event reporting
    const reportQuestionAnswered = useCallback((event: Partial<QuestionResponseEvent>) => {
        const interventions = coach.current.onQuestionAnswered(event);
        syncState();

        // Show first intervention if any
        if (interventions.length > 0 && !activeIntervention) {
            setActiveIntervention(interventions[0]);
        }
    }, [syncState, activeIntervention]);

    // Intervention handling
    const dismissIntervention = useCallback(() => {
        if (activeIntervention) {
            coach.current.dismissIntervention(activeIntervention.id);
            setActiveIntervention(null);
        }
    }, [activeIntervention]);

    const acceptIntervention = useCallback(() => {
        if (activeIntervention) {
            coach.current.acceptIntervention(activeIntervention.id);
            setActiveIntervention(null);
        }
    }, [activeIntervention]);

    // Pomodoro control
    const startPomodoro = useCallback(() => {
        coach.current.startPomodoro();
        syncState();
    }, [syncState]);

    const pausePomodoro = useCallback(() => {
        coach.current.stopPomodoro();
        syncState();
    }, [syncState]);

    const skipBreak = useCallback(() => {
        coach.current.skipBreak();
        syncState();
    }, [syncState]);

    // Calculate streak
    const currentStreak = state?.resultsHistory
        ? countStreak(state.resultsHistory)
        : 0;

    // Phase helpers
    const phaseEmoji = state ? coach.current.getPhaseEmoji() : '🌅';
    const phaseLabels: Record<SessionPhase, string> = {
        warmup: 'Rozgrzewka',
        peak: 'Szczyt',
        fatigue: 'Zmęczenie',
        recovery: 'Regeneracja',
    };

    return {
        // Session info
        isActive,
        sessionPhase: state?.currentPhase || 'warmup',
        sessionDuration: coach.current.getSessionDurationFormatted(),
        currentMode: state?.currentMode || 'flashcards',

        // Performance
        questionsAnswered: state?.questionsAnswered || 0,
        sessionAccuracy: state?.currentAccuracy || 0,
        currentStreak,

        // Fatigue
        fatigueLevel: state?.fatigueAnalysis?.fatigueLevel || 'none',
        fatigueScore: state?.fatigueAnalysis?.fatigueScore || 0,

        // Interventions
        activeIntervention,
        dismissIntervention,
        acceptIntervention,

        // Pomodoro
        pomodoro: state?.pomodoro || {
            isActive: false,
            isBreak: false,
            remainingSeconds: 0,
            totalSeconds: 0,
            sessionsCompleted: 0,
        },
        pomodoroFormatted: coach.current.getPomodoroFormatted(),
        pomodoroProgress: coach.current.getPomodoroProgress(),
        startPomodoro,
        pausePomodoro,
        skipBreak,

        // Session control
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        setMode,

        // Event reporting
        reportQuestionAnswered,

        // UI helpers
        phaseEmoji,
        phaseLabel: phaseLabels[state?.currentPhase || 'warmup'],
    };
}

// Helper function
function countStreak(results: boolean[]): number {
    let count = 0;
    for (let i = results.length - 1; i >= 0; i--) {
        if (results[i]) {
            count++;
        } else {
            break;
        }
    }
    return count;
}
