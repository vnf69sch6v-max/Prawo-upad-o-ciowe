/**
 * Fatigue Detector
 * Detects cognitive fatigue based on performance patterns
 */

import type { StudentProfile } from '../profiling/types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface FatigueIndicator {
    type: 'accuracy_drop' | 'speed_decrease' | 'hesitation_increase' | 'error_clustering' | 'session_length';
    severity: number;           // 0-1
    description: string;
    value: number;
    threshold: number;
}

export interface FatigueAnalysis {
    fatigueScore: number;       // 0-100
    fatigueLevel: 'none' | 'mild' | 'moderate' | 'severe';
    indicators: FatigueIndicator[];
    recommendation: string;
    shouldTakeBreak: boolean;
    suggestedBreakDuration: number;  // minutes
}

export interface PerformanceSnapshot {
    recentAccuracy: number;         // last 10 questions
    baselineAccuracy: number;       // session average
    recentResponseTime: number;     // average ms last 5
    baselineResponseTime: number;   // session average
    consecutiveErrors: number;
    hesitationCount: number;        // answer changes
    sessionDurationMinutes: number;
    questionsAnswered: number;
}

// ═══════════════════════════════════════════════════════
// THRESHOLDS
// ═══════════════════════════════════════════════════════

const THRESHOLDS = {
    accuracyDropPercent: 20,        // 20% drop triggers detection
    responseTimeIncreasePercent: 50, // 50% slower triggers detection
    consecutiveErrorsMax: 3,
    hesitationCountMax: 5,          // per 10 questions
    sessionLengthMinutes: 25,       // pomodoro standard
    questionsBeforeFatigue: 15,

    // Fatigue level thresholds
    mildFatigueScore: 30,
    moderateFatigueScore: 55,
    severeFatigueScore: 75,
};

// Weights for each indicator
const WEIGHTS = {
    accuracy_drop: 0.35,
    speed_decrease: 0.25,
    error_clustering: 0.20,
    hesitation_increase: 0.10,
    session_length: 0.10,
};

// ═══════════════════════════════════════════════════════
// DETECTION LOGIC
// ═══════════════════════════════════════════════════════

export function detectFatigue(
    snapshot: PerformanceSnapshot,
    profile?: StudentProfile
): FatigueAnalysis {
    const indicators: FatigueIndicator[] = [];

    // 1. Accuracy Drop Detection
    const accuracyDrop = snapshot.baselineAccuracy > 0
        ? ((snapshot.baselineAccuracy - snapshot.recentAccuracy) / snapshot.baselineAccuracy) * 100
        : 0;

    if (accuracyDrop > 0) {
        indicators.push({
            type: 'accuracy_drop',
            severity: Math.min(1, accuracyDrop / (THRESHOLDS.accuracyDropPercent * 2)),
            description: `Dokładność spadła o ${Math.round(accuracyDrop)}%`,
            value: accuracyDrop,
            threshold: THRESHOLDS.accuracyDropPercent,
        });
    }

    // 2. Response Time Increase
    const timeIncrease = snapshot.baselineResponseTime > 0
        ? ((snapshot.recentResponseTime - snapshot.baselineResponseTime) / snapshot.baselineResponseTime) * 100
        : 0;

    if (timeIncrease > 0) {
        indicators.push({
            type: 'speed_decrease',
            severity: Math.min(1, timeIncrease / (THRESHOLDS.responseTimeIncreasePercent * 2)),
            description: `Czas odpowiedzi wzrósł o ${Math.round(timeIncrease)}%`,
            value: timeIncrease,
            threshold: THRESHOLDS.responseTimeIncreasePercent,
        });
    }

    // 3. Error Clustering
    if (snapshot.consecutiveErrors >= 2) {
        indicators.push({
            type: 'error_clustering',
            severity: Math.min(1, snapshot.consecutiveErrors / THRESHOLDS.consecutiveErrorsMax),
            description: `${snapshot.consecutiveErrors} błędy pod rząd`,
            value: snapshot.consecutiveErrors,
            threshold: THRESHOLDS.consecutiveErrorsMax,
        });
    }

    // 4. Hesitation Increase
    if (snapshot.hesitationCount > 2) {
        indicators.push({
            type: 'hesitation_increase',
            severity: Math.min(1, snapshot.hesitationCount / THRESHOLDS.hesitationCountMax),
            description: `${snapshot.hesitationCount} zmian odpowiedzi`,
            value: snapshot.hesitationCount,
            threshold: THRESHOLDS.hesitationCountMax,
        });
    }

    // 5. Session Length
    if (snapshot.sessionDurationMinutes > THRESHOLDS.sessionLengthMinutes * 0.8) {
        indicators.push({
            type: 'session_length',
            severity: Math.min(1, snapshot.sessionDurationMinutes / (THRESHOLDS.sessionLengthMinutes * 1.5)),
            description: `Sesja trwa już ${Math.round(snapshot.sessionDurationMinutes)} min`,
            value: snapshot.sessionDurationMinutes,
            threshold: THRESHOLDS.sessionLengthMinutes,
        });
    }

    // Calculate weighted fatigue score
    let fatigueScore = 0;
    for (const indicator of indicators) {
        const weight = WEIGHTS[indicator.type] || 0.1;
        fatigueScore += indicator.severity * weight * 100;
    }

    // Apply profile-based adjustments
    if (profile?.errorPatterns.temporalPatterns.errorsIncreaseLateSession) {
        // User historically gets more errors late in session - increase sensitivity
        fatigueScore *= 1.2;
    }

    fatigueScore = Math.min(100, fatigueScore);

    // Determine fatigue level
    let fatigueLevel: FatigueAnalysis['fatigueLevel'] = 'none';
    if (fatigueScore >= THRESHOLDS.severeFatigueScore) {
        fatigueLevel = 'severe';
    } else if (fatigueScore >= THRESHOLDS.moderateFatigueScore) {
        fatigueLevel = 'moderate';
    } else if (fatigueScore >= THRESHOLDS.mildFatigueScore) {
        fatigueLevel = 'mild';
    }

    // Generate recommendation
    const recommendation = getRecommendation(fatigueLevel, indicators);

    // Determine break suggestion
    const shouldTakeBreak = fatigueLevel === 'severe' || fatigueLevel === 'moderate';
    const suggestedBreakDuration = fatigueLevel === 'severe' ? 10 : fatigueLevel === 'moderate' ? 5 : 0;

    return {
        fatigueScore,
        fatigueLevel,
        indicators,
        recommendation,
        shouldTakeBreak,
        suggestedBreakDuration,
    };
}

function getRecommendation(
    level: FatigueAnalysis['fatigueLevel'],
    indicators: FatigueIndicator[]
): string {
    switch (level) {
        case 'severe':
            return '😴 Czas na przerwę! Twój mózg potrzebuje odpoczynku.';
        case 'moderate':
            if (indicators.some(i => i.type === 'accuracy_drop' && i.severity > 0.5)) {
                return '📉 Twoja dokładność spada. Rozważ przerwę lub zmianę trybu nauki.';
            }
            return '⚠️ Zauważam oznaki zmęczenia. Krótka przerwa może pomóc.';
        case 'mild':
            return '💡 Lekkie zmęczenie - jeszcze kilka pytań i zrób przerwę.';
        default:
            return '✨ Świetnie Ci idzie! Kontynuuj w tym tempie.';
    }
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

export function calculateRollingAccuracy(
    results: boolean[],
    windowSize: number = 10
): number {
    if (results.length === 0) return 0;

    const window = results.slice(-windowSize);
    const correct = window.filter(r => r).length;
    return (correct / window.length) * 100;
}

export function calculateAverageResponseTime(
    times: number[],
    windowSize: number = 5
): number {
    if (times.length === 0) return 0;

    const window = times.slice(-windowSize);
    return window.reduce((a, b) => a + b, 0) / window.length;
}

export function countConsecutiveErrors(results: boolean[]): number {
    let count = 0;
    for (let i = results.length - 1; i >= 0; i--) {
        if (!results[i]) {
            count++;
        } else {
            break;
        }
    }
    return count;
}
