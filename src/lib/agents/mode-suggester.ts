/**
 * Mode Suggester
 * Suggests optimal study mode switches based on performance and fatigue
 */

import type { FatigueAnalysis } from './fatigue-detector';
import type { StudentProfile } from '../profiling/types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type StudyMode = 'quiz' | 'flashcards' | 'speed_run' | 'exam_simulation' | 'reading';

export interface ModeSwitchRecommendation {
    fromMode: StudyMode;
    toMode: StudyMode;
    reason: string;
    confidence: number;         // 0-1
    expectedBenefit: string;
    icon: string;
}

export interface PerformanceContext {
    currentMode: StudyMode;
    recentAccuracy: number;     // 0-100
    questionsInMode: number;
    correctStreak: number;
    errorStreak: number;
    sessionDurationMinutes: number;
}

// ═══════════════════════════════════════════════════════
// MODE SWITCHING LOGIC
// ═══════════════════════════════════════════════════════

export function suggestModeSwitch(
    context: PerformanceContext,
    fatigueAnalysis: FatigueAnalysis,
    profile?: StudentProfile
): ModeSwitchRecommendation | null {
    const { currentMode, recentAccuracy, questionsInMode, correctStreak, errorStreak } = context;

    // Rule 1: Severe fatigue in any mode → take a break
    if (fatigueAnalysis.fatigueLevel === 'severe') {
        return null; // Break recommended, not mode switch
    }

    // Rule 2: Quiz/Exam with many errors → switch to flashcards
    if ((currentMode === 'quiz' || currentMode === 'exam_simulation') &&
        recentAccuracy < 50 &&
        questionsInMode >= 10) {
        return {
            fromMode: currentMode,
            toMode: 'flashcards',
            reason: 'Niska dokładność w quizie',
            confidence: 0.85,
            expectedBenefit: 'Fiszki pomogą utrwalić podstawy przed kolejnym podejściem do quizu',
            icon: '📚',
        };
    }

    // Rule 3: Moderate fatigue + quiz → lighter mode
    if (fatigueAnalysis.fatigueLevel === 'moderate' &&
        (currentMode === 'quiz' || currentMode === 'exam_simulation')) {
        return {
            fromMode: currentMode,
            toMode: 'flashcards',
            reason: 'Wykryto zmęczenie',
            confidence: 0.75,
            expectedBenefit: 'Lżejsza forma nauki pomoże odpocząć, nie tracąc postępów',
            icon: '🔄',
        };
    }

    // Rule 4: High accuracy in flashcards → ready for quiz
    if (currentMode === 'flashcards' &&
        recentAccuracy >= 85 &&
        questionsInMode >= 20 &&
        fatigueAnalysis.fatigueLevel === 'none') {
        return {
            fromMode: currentMode,
            toMode: 'quiz',
            reason: 'Świetna dokładność na fiszkach!',
            confidence: 0.80,
            expectedBenefit: 'Jesteś gotowy na quiz - sprawdź swoją wiedzę!',
            icon: '🚀',
        };
    }

    // Rule 5: Long streak of correct answers → increase difficulty
    if (correctStreak >= 10 &&
        currentMode === 'flashcards' &&
        fatigueAnalysis.fatigueLevel === 'none') {
        return {
            fromMode: currentMode,
            toMode: 'speed_run',
            reason: '10 poprawnych odpowiedzi pod rząd!',
            confidence: 0.70,
            expectedBenefit: 'Speed Run doda wyzwania - sprawdź jak szybko możesz odpowiadać!',
            icon: '⚡',
        };
    }

    // Rule 6: Many errors in speed run → slow down
    if (currentMode === 'speed_run' &&
        (errorStreak >= 3 || recentAccuracy < 60)) {
        return {
            fromMode: currentMode,
            toMode: 'flashcards',
            reason: 'Speed Run może być za szybki',
            confidence: 0.80,
            expectedBenefit: 'Zwolnij tempo i utrwal wiedzę na fiszkach',
            icon: '🐢',
        };
    }

    // Rule 7: Very long session in one mode → suggest variety
    if (context.sessionDurationMinutes >= 30 && questionsInMode >= 40) {
        const alternativeMode = getAlternativeMode(currentMode);
        return {
            fromMode: currentMode,
            toMode: alternativeMode,
            reason: 'Długa sesja w jednym trybie',
            confidence: 0.60,
            expectedBenefit: 'Zmiana trybu odświeży perspektywę i pomoże w nauce',
            icon: '🔀',
        };
    }

    // No recommendation
    return null;
}

function getAlternativeMode(currentMode: StudyMode): StudyMode {
    const alternatives: Record<StudyMode, StudyMode> = {
        'quiz': 'flashcards',
        'flashcards': 'quiz',
        'speed_run': 'flashcards',
        'exam_simulation': 'flashcards',
        'reading': 'flashcards',
    };
    return alternatives[currentMode] || 'flashcards';
}

// ═══════════════════════════════════════════════════════
// MODE DESCRIPTIONS
// ═══════════════════════════════════════════════════════

export const MODE_INFO: Record<StudyMode, { name: string; description: string; intensity: number }> = {
    'flashcards': {
        name: 'Fiszki',
        description: 'Klasyczne powtórki - idealne do utrwalania wiedzy',
        intensity: 2,
    },
    'quiz': {
        name: 'Quiz',
        description: 'Testuj swoją wiedzę z pytaniami wielokrotnego wyboru',
        intensity: 5,
    },
    'speed_run': {
        name: 'Speed Run',
        description: 'Szybkie odpowiedzi na czas - dla zaawansowanych',
        intensity: 8,
    },
    'exam_simulation': {
        name: 'Symulacja Egzaminu',
        description: 'Pełna symulacja warunków egzaminacyjnych',
        intensity: 10,
    },
    'reading': {
        name: 'Czytanie',
        description: 'Przegląd materiału i artykułów',
        intensity: 1,
    },
};

export function getModeIntensity(mode: StudyMode): number {
    return MODE_INFO[mode]?.intensity || 5;
}
