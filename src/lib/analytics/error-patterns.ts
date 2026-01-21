/**
 * Error Pattern Analysis
 * Identifies systematic errors and confusion patterns in user's test history
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface TestQuestion {
    questionId: string;
    topic: string;
    questionType: 'memory' | 'interpretation' | 'case' | 'comparison';
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
    timeToAnswer: number; // ms
}

export interface TestResult {
    testId: string;
    timestamp: Date;
    domain: string;
    questions: TestQuestion[];
    score: number;
    totalQuestions: number;
}

export interface ErrorStats {
    totalErrors: number;
    totalAttempts: number;
    errorRate: number; // 0-100%
    lastError: Date | null;
    specificErrors: Array<{
        questionId: string;
        userAnswer: string;
        correctAnswer: string;
        timestamp: Date;
    }>;
}

export interface ConfusionPair {
    correctConcept: string;
    confusedWith: string;
    frequency: number;
    examples: string[]; // Question IDs
    suggestion: string;
}

export interface PrerequisiteGap {
    topic: string;
    missingPrerequisite: string;
    recommendation: string;
}

export interface TimePattern {
    timeSlot: 'morning' | 'afternoon' | 'evening';
    totalQuestions: number;
    errors: number;
    errorRate: number;
}

export interface ErrorPatterns {
    byTopic: Record<string, ErrorStats>;
    byQuestionType: Record<string, ErrorStats>;
    byTimeOfDay: Record<string, TimePattern>;
    commonConfusions: ConfusionPair[];
    weakPrerequisites: PrerequisiteGap[];
    overallStats: {
        totalTests: number;
        totalQuestions: number;
        totalErrors: number;
        overallErrorRate: number;
        mostProblematicTopic: string | null;
        bestTopic: string | null;
    };
}

// ═══════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Analyze test history to identify error patterns
 */
export function analyzeErrorPatterns(testHistory: TestResult[]): ErrorPatterns {
    const patterns: ErrorPatterns = {
        byTopic: {},
        byQuestionType: {},
        byTimeOfDay: {},
        commonConfusions: [],
        weakPrerequisites: [],
        overallStats: {
            totalTests: testHistory.length,
            totalQuestions: 0,
            totalErrors: 0,
            overallErrorRate: 0,
            mostProblematicTopic: null,
            bestTopic: null
        }
    };

    if (testHistory.length === 0) return patterns;

    // ═══════════════════════════════════════════════════════
    // ANALYSIS 1: Errors by Topic
    // ═══════════════════════════════════════════════════════
    for (const test of testHistory) {
        for (const question of test.questions) {
            patterns.overallStats.totalQuestions++;

            // Initialize topic if not exists
            if (!patterns.byTopic[question.topic]) {
                patterns.byTopic[question.topic] = {
                    totalErrors: 0,
                    totalAttempts: 0,
                    errorRate: 0,
                    lastError: null,
                    specificErrors: []
                };
            }

            // Initialize question type if not exists
            if (!patterns.byQuestionType[question.questionType]) {
                patterns.byQuestionType[question.questionType] = {
                    totalErrors: 0,
                    totalAttempts: 0,
                    errorRate: 0,
                    lastError: null,
                    specificErrors: []
                };
            }

            patterns.byTopic[question.topic].totalAttempts++;
            patterns.byQuestionType[question.questionType].totalAttempts++;

            if (!question.correct) {
                patterns.overallStats.totalErrors++;
                patterns.byTopic[question.topic].totalErrors++;
                patterns.byTopic[question.topic].lastError = test.timestamp;
                patterns.byTopic[question.topic].specificErrors.push({
                    questionId: question.questionId,
                    userAnswer: question.userAnswer,
                    correctAnswer: question.correctAnswer,
                    timestamp: test.timestamp
                });

                patterns.byQuestionType[question.questionType].totalErrors++;
                patterns.byQuestionType[question.questionType].lastError = test.timestamp;
            }
        }
    }

    // Calculate error rates
    for (const topic in patterns.byTopic) {
        const data = patterns.byTopic[topic];
        data.errorRate = Math.round((data.totalErrors / data.totalAttempts) * 100);
    }
    for (const type in patterns.byQuestionType) {
        const data = patterns.byQuestionType[type];
        data.errorRate = Math.round((data.totalErrors / data.totalAttempts) * 100);
    }

    patterns.overallStats.overallErrorRate = Math.round(
        (patterns.overallStats.totalErrors / patterns.overallStats.totalQuestions) * 100
    );

    // Find best and worst topics
    const topicEntries = Object.entries(patterns.byTopic);
    if (topicEntries.length > 0) {
        const sorted = topicEntries.sort((a, b) => b[1].errorRate - a[1].errorRate);
        patterns.overallStats.mostProblematicTopic = sorted[0][0];
        patterns.overallStats.bestTopic = sorted[sorted.length - 1][0];
    }

    // ═══════════════════════════════════════════════════════
    // ANALYSIS 2: Confusion Pairs
    // ═══════════════════════════════════════════════════════
    const confusionMatrix: Record<string, { count: number; examples: string[] }> = {};

    for (const test of testHistory) {
        for (const q of test.questions.filter(q => !q.correct)) {
            // Create a pair key: "correct|user_answer"
            const pair = `${q.correctAnswer}|${q.userAnswer}`;

            if (!confusionMatrix[pair]) {
                confusionMatrix[pair] = { count: 0, examples: [] };
            }
            confusionMatrix[pair].count++;
            if (confusionMatrix[pair].examples.length < 5) {
                confusionMatrix[pair].examples.push(q.questionId);
            }
        }
    }

    // Find frequent confusions (3+ occurrences)
    patterns.commonConfusions = Object.entries(confusionMatrix)
        .filter(([_, data]) => data.count >= 3)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([pair, data]) => {
            const [correct, wrong] = pair.split('|');
            return {
                correctConcept: correct,
                confusedWith: wrong,
                frequency: data.count,
                examples: data.examples,
                suggestion: generateConfusionSuggestion(correct, wrong)
            };
        });

    // ═══════════════════════════════════════════════════════
    // ANALYSIS 3: Time Patterns
    // ═══════════════════════════════════════════════════════
    const timeSlots: Record<string, TimePattern> = {
        morning: { timeSlot: 'morning', totalQuestions: 0, errors: 0, errorRate: 0 },
        afternoon: { timeSlot: 'afternoon', totalQuestions: 0, errors: 0, errorRate: 0 },
        evening: { timeSlot: 'evening', totalQuestions: 0, errors: 0, errorRate: 0 }
    };

    for (const test of testHistory) {
        const hour = new Date(test.timestamp).getHours();
        const slot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

        timeSlots[slot].totalQuestions += test.questions.length;
        timeSlots[slot].errors += test.questions.filter(q => !q.correct).length;
    }

    for (const slot in timeSlots) {
        if (timeSlots[slot].totalQuestions > 0) {
            timeSlots[slot].errorRate = Math.round(
                (timeSlots[slot].errors / timeSlots[slot].totalQuestions) * 100
            );
        }
    }

    patterns.byTimeOfDay = timeSlots;

    return patterns;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Generate suggestion for confusion pair
 */
function generateConfusionSuggestion(correct: string, wrong: string): string {
    return `Ćwicz rozróżnianie: "${correct}" vs "${wrong}". Stwórz tabelę porównawczą z kluczowymi różnicami.`;
}

/**
 * Get topics that need urgent attention
 */
export function getUrgentTopics(
    patterns: ErrorPatterns,
    threshold: number = 40
): string[] {
    return Object.entries(patterns.byTopic)
        .filter(([_, stats]) => stats.errorRate > threshold && stats.totalAttempts >= 3)
        .sort((a, b) => b[1].errorRate - a[1].errorRate)
        .map(([topic]) => topic);
}

/**
 * Get best time to study based on patterns
 */
export function getBestStudyTime(patterns: ErrorPatterns): 'morning' | 'afternoon' | 'evening' {
    const times = Object.values(patterns.byTimeOfDay)
        .filter(t => t.totalQuestions >= 10); // Need enough data

    if (times.length === 0) return 'morning'; // Default

    times.sort((a, b) => a.errorRate - b.errorRate);
    return times[0].timeSlot;
}

/**
 * Calculate improvement trend
 */
export function calculateImprovementTrend(
    testHistory: TestResult[],
    topic?: string
): { trend: 'improving' | 'stable' | 'declining'; percentage: number } {
    if (testHistory.length < 3) {
        return { trend: 'stable', percentage: 0 };
    }

    // Get last 10 tests
    const recentTests = testHistory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

    // Split into two halves
    const mid = Math.floor(recentTests.length / 2);
    const recentHalf = recentTests.slice(0, mid);
    const olderHalf = recentTests.slice(mid);

    const calculateAvgScore = (tests: TestResult[]) => {
        if (topic) {
            // Filter to specific topic
            let correct = 0;
            let total = 0;
            for (const test of tests) {
                for (const q of test.questions) {
                    if (q.topic === topic) {
                        total++;
                        if (q.correct) correct++;
                    }
                }
            }
            return total > 0 ? (correct / total) * 100 : 0;
        }

        return tests.reduce((sum, t) => sum + (t.score / t.totalQuestions) * 100, 0) / tests.length;
    };

    const recentAvg = calculateAvgScore(recentHalf);
    const olderAvg = calculateAvgScore(olderHalf);
    const diff = recentAvg - olderAvg;

    if (diff > 5) {
        return { trend: 'improving', percentage: Math.round(diff) };
    } else if (diff < -5) {
        return { trend: 'declining', percentage: Math.round(Math.abs(diff)) };
    } else {
        return { trend: 'stable', percentage: 0 };
    }
}

/**
 * Generate study recommendations based on patterns
 */
export function generateStudyRecommendations(patterns: ErrorPatterns): string[] {
    const recommendations: string[] = [];

    // 1. Problematic topics
    const urgentTopics = getUrgentTopics(patterns, 50);
    if (urgentTopics.length > 0) {
        recommendations.push(
            `🔴 Pilne: Skup się na tematach "${urgentTopics.slice(0, 3).join('", "')}"`
        );
    }

    // 2. Confusion pairs
    if (patterns.commonConfusions.length > 0) {
        const top = patterns.commonConfusions[0];
        recommendations.push(
            `🔄 Często mylisz "${top.correctConcept}" z "${top.confusedWith}" - przećwicz różnice`
        );
    }

    // 3. Question type weakness
    const weakType = Object.entries(patterns.byQuestionType)
        .filter(([_, s]) => s.totalAttempts >= 5)
        .sort((a, b) => b[1].errorRate - a[1].errorRate)[0];

    if (weakType && weakType[1].errorRate > 40) {
        const typeNames: Record<string, string> = {
            memory: 'pamięciowe',
            interpretation: 'interpretacyjne',
            case: 'kazusy',
            comparison: 'porównawcze'
        };
        recommendations.push(
            `📝 Słabość w pytaniach ${typeNames[weakType[0]] || weakType[0]} (${weakType[1].errorRate}% błędów)`
        );
    }

    // 4. Time optimization
    const bestTime = getBestStudyTime(patterns);
    const worstTime = Object.values(patterns.byTimeOfDay)
        .filter(t => t.totalQuestions >= 10)
        .sort((a, b) => b.errorRate - a.errorRate)[0];

    if (worstTime && worstTime.errorRate - patterns.byTimeOfDay[bestTime].errorRate > 15) {
        const timeNames = { morning: 'rano', afternoon: 'po południu', evening: 'wieczorem' };
        recommendations.push(
            `⏰ Uczysz się lepiej ${timeNames[bestTime]} (${patterns.byTimeOfDay[bestTime].errorRate}% błędów vs ${worstTime.errorRate}%)`
        );
    }

    return recommendations;
}
