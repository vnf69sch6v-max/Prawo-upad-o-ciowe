/**
 * Pacing Controller
 * Plans and adjusts session tempo based on student profile
 */

import type { StudentProfile } from './types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface SessionPlan {
    duration: number;           // minutes
    questionCount: number;
    difficultyProgression: DifficultyPhase[];
    breaks: BreakPoint[];
    tips: string[];
}

export interface DifficultyPhase {
    phase: 'warmup' | 'core' | 'cooldown';
    targetDifficulty: number;
    questionCount: number;
}

export interface BreakPoint {
    afterQuestion: number;
    duration: number;           // minutes
    suggestion: string;
}

// ═══════════════════════════════════════════════════════
// PACING CONTROLLER
// ═══════════════════════════════════════════════════════

export class PacingController {
    private profile: StudentProfile;

    constructor(profile: StudentProfile) {
        this.profile = profile;
    }

    /**
     * Create a session plan
     */
    createSessionPlan(
        availableTime: number,
        goal: 'review' | 'learn' | 'exam_prep' = 'review'
    ): SessionPlan {
        const style = this.profile.learningStyle;

        // Cap at optimal length (+20%)
        const optimalLength = style.optimalConditions.optimalSessionLength;
        const actualLength = Math.min(availableTime, optimalLength * 1.2);

        // Average time per question (adjusted by goal)
        const avgTimePerQuestion = goal === 'exam_prep' ? 1.5 : 2; // minutes

        const plannedQuestions = Math.min(
            style.optimalConditions.optimalQuestionCount,
            Math.floor(actualLength / avgTimePerQuestion)
        );

        // Plan difficulty progression
        const difficultyProgression = this.planDifficultyProgression(plannedQuestions, goal);

        // Plan breaks
        const breaks = this.planBreaks(plannedQuestions);

        // Generate tips
        const tips = this.generateSessionTips();

        return {
            duration: actualLength,
            questionCount: plannedQuestions,
            difficultyProgression,
            breaks,
            tips
        };
    }

    /**
     * Plan difficulty progression through session
     */
    private planDifficultyProgression(
        questionCount: number,
        goal: string
    ): DifficultyPhase[] {
        const phases: DifficultyPhase[] = [];
        const avgMastery = this.calculateAverageMastery();
        const baseDifficulty = avgMastery / 10 + 1;

        // Warmup: first 20% - easier
        const warmupCount = Math.ceil(questionCount * 0.2);
        phases.push({
            phase: 'warmup',
            targetDifficulty: Math.max(2, baseDifficulty - 2),
            questionCount: warmupCount
        });

        // Core: middle 60% - appropriate difficulty
        const coreCount = Math.ceil(questionCount * 0.6);
        phases.push({
            phase: 'core',
            targetDifficulty: goal === 'exam_prep' ? baseDifficulty + 1 : baseDifficulty,
            questionCount: coreCount
        });

        // Cooldown: last 20% - easier (end on success)
        const cooldownCount = questionCount - warmupCount - coreCount;
        phases.push({
            phase: 'cooldown',
            targetDifficulty: Math.max(2, baseDifficulty - 1),
            questionCount: cooldownCount
        });

        return phases;
    }

    /**
     * Plan breaks in session
     */
    private planBreaks(questionCount: number): BreakPoint[] {
        const breakInterval = this.profile.learningStyle.optimalConditions.needsBreaksEvery;
        const breaks: BreakPoint[] = [];

        for (let i = breakInterval; i < questionCount; i += breakInterval) {
            const baseDuration = 2; // minutes
            const fatigueFactor = Math.min(2, i / 20);

            breaks.push({
                afterQuestion: i,
                duration: baseDuration + fatigueFactor,
                suggestion: this.getBreakSuggestion(i)
            });
        }

        return breaks;
    }

    /**
     * Get break suggestion based on progress
     */
    private getBreakSuggestion(questionNumber: number): string {
        const suggestions = [
            '☕ Czas na krótką przerwę! Napij się wody.',
            '🚶 Wstań i się rozciągnij.',
            '👀 Oderwij wzrok od ekranu na chwilę.',
            '🧘 Weź kilka głębokich oddechów.',
            '💪 Świetna robota! Odpoczynek pomoże w nauce.'
        ];

        return suggestions[questionNumber % suggestions.length];
    }

    /**
     * Generate personalized session tips
     */
    private generateSessionTips(): string[] {
        const tips: string[] = [];
        const style = this.profile.learningStyle;
        const patterns = this.profile.errorPatterns;

        // Tip based on dominant error type
        if (patterns.dominantErrorType === 'careless') {
            tips.push('💡 Czytaj pytania uważnie - masz tendencję do błędów nieuważności');
        }

        // Tip based on style
        if (style.solvingStrategies.rushes > 0.6) {
            tips.push('⏱️ Zwolnij tempo - pośpiech prowadzi do błędów');
        }

        if (style.solvingStrategies.usesHints > 0.5) {
            tips.push('🎯 Spróbuj odpowiedzieć bez podpowiedzi - budujesz pewność');
        }

        // Tip based on engagement
        if (this.profile.engagement.currentStreak >= 7) {
            tips.push(`🔥 Świetna seria ${this.profile.engagement.currentStreak} dni! Utrzymaj ją!`);
        }

        // Tip based on predictions
        if (this.profile.predictions.passProbability > 0.7) {
            tips.push('📈 Jesteś na dobrej drodze do zdania egzaminu!');
        } else if (this.profile.predictions.passProbability < 0.5) {
            tips.push('📚 Skup się na słabych obszarach - to pomoże poprawić wynik');
        }

        return tips.slice(0, 3); // Max 3 tips
    }

    /**
     * Calculate average mastery
     */
    private calculateAverageMastery(): number {
        const masteries = Object.values(this.profile.knowledgeMap)
            .map(t => t.mastery)
            .filter(m => m !== undefined);

        if (masteries.length === 0) return 50;
        return masteries.reduce((a, b) => a + b, 0) / masteries.length;
    }

    /**
     * Get recommended session time based on current state
     */
    getRecommendedSessionTime(): number {
        const optimal = this.profile.learningStyle.optimalConditions.optimalSessionLength;
        const currentHour = new Date().getHours();
        const bestTime = this.profile.learningStyle.optimalConditions.bestTimeOfDay;

        // Reduce if not optimal time
        const timeSlots = {
            morning: [6, 12],
            afternoon: [12, 18],
            evening: [18, 23],
            night: [23, 6]
        };

        const [start, end] = timeSlots[bestTime] || [0, 24];
        const isOptimalTime = currentHour >= start && currentHour < end;

        return isOptimalTime ? optimal : Math.ceil(optimal * 0.7);
    }
}
