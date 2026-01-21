/**
 * Difficulty Controller
 * Adjusts question difficulty based on student performance
 */

import type { StudentProfile, SessionContext } from './types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface DifficultyAdjustment {
    targetDifficulty: number;
    reason: string;
    adjustment: number;
}

interface SessionResult {
    correct: boolean;
    normalizedTime: number; // time / expected time
    difficulty: number;
}

// ═══════════════════════════════════════════════════════
// DIFFICULTY CONTROLLER
// ═══════════════════════════════════════════════════════

export class DifficultyController {
    private profile: StudentProfile;
    private sessionHistory: SessionResult[] = [];
    private currentDifficulty: number;

    constructor(profile: StudentProfile, startDifficulty: number = 5) {
        this.profile = profile;
        this.currentDifficulty = startDifficulty;
    }

    /**
     * Get optimal difficulty for a topic
     * Based on Zone of Proximal Development
     */
    getOptimalDifficulty(topic: string): number {
        const topicMastery = this.profile.knowledgeMap[topic]?.mastery || 50;

        // Map mastery (0-100) to base difficulty (1-10)
        const baseDifficulty = topicMastery / 10;

        // Add challenge (slightly above current level)
        const challenge = Math.min(2, (100 - topicMastery) / 30);

        return Math.min(10, Math.max(1, baseDifficulty + challenge));
    }

    /**
     * Adjust difficulty based on last result
     */
    adjustDifficulty(result: SessionResult): DifficultyAdjustment {
        this.sessionHistory.push(result);

        // Analyze last 5 answers
        const recent = this.sessionHistory.slice(-5);
        const recentCorrect = recent.filter(r => r.correct).length;
        const recentAvgTime = recent.reduce((sum, r) => sum + r.normalizedTime, 0) / recent.length;

        let adjustment = 0;
        let reason = '';

        // High success rate + fast = increase difficulty
        if (recent.length >= 3 && recentCorrect / recent.length > 0.8 && recentAvgTime < 0.8) {
            adjustment = 1;
            reason = 'Wysoka skuteczność i szybkie odpowiedzi';
        }
        // Low success rate = decrease difficulty
        else if (recent.length >= 3 && recentCorrect / recent.length < 0.4) {
            adjustment = -1;
            reason = 'Niska skuteczność';
        }
        // Slow answers (even if correct) = decrease slightly
        else if (recent.length >= 3 && recentAvgTime > 2.0) {
            adjustment = -0.5;
            reason = 'Odpowiedzi trwają zbyt długo';
        }

        // Modify based on learning style
        const analyticalStyle = this.profile.learningStyle.cognitiveStyle.analyticalVsIntuitive;
        if (analyticalStyle > 0.5) {
            // Analytical students like challenges
            adjustment *= 1.2;
        }

        // Late session fatigue compensation
        if (this.sessionHistory.length > 25) {
            adjustment -= 0.3;
            reason += ' | Kompensacja zmęczenia';
        }

        // Apply adjustment
        this.currentDifficulty = Math.max(1, Math.min(10, this.currentDifficulty + adjustment));

        return {
            targetDifficulty: Math.round(this.currentDifficulty * 10) / 10,
            reason: reason || 'Brak zmian',
            adjustment
        };
    }

    /**
     * Get current difficulty
     */
    getCurrentDifficulty(): number {
        return this.currentDifficulty;
    }

    /**
     * Get session statistics
     */
    getSessionStats(): {
        questionsAnswered: number;
        correctCount: number;
        avgNormalizedTime: number;
        currentDifficulty: number;
    } {
        return {
            questionsAnswered: this.sessionHistory.length,
            correctCount: this.sessionHistory.filter(r => r.correct).length,
            avgNormalizedTime: this.sessionHistory.length > 0
                ? this.sessionHistory.reduce((sum, r) => sum + r.normalizedTime, 0) / this.sessionHistory.length
                : 0,
            currentDifficulty: this.currentDifficulty
        };
    }

    /**
     * Reset for new session
     */
    resetSession(): void {
        this.sessionHistory = [];
        // Keep current difficulty - it carries over
    }
}
