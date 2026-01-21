/**
 * Profile Updater
 * Updates student profile using Bayesian Knowledge Tracing (BKT)
 */

import type {
    StudentProfile,
    TopicMastery,
    ExtractedFeatures,
    ErrorType,
    LearningStyle,
    ErrorPatterns,
    Predictions
} from './types';
import { createDefaultTopicMastery, calculateProfileConfidence } from './student-profile';

// ═══════════════════════════════════════════════════════
// BKT PARAMETERS
// ═══════════════════════════════════════════════════════

const BKT_PARAMS = {
    pL0: 0.5,    // Prior probability of knowing (default 50%)
    pT: 0.3,     // Probability of learning (transition)
    pG: 0.25,    // Probability of guessing correctly
    pS: 0.1      // Probability of slipping (error despite knowing)
};

// ═══════════════════════════════════════════════════════
// MAIN UPDATE FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Update profile with new features
 */
export function updateProfile(
    currentProfile: StudentProfile,
    features: ExtractedFeatures
): StudentProfile {
    const updatedProfile = { ...currentProfile };

    // 1. Update knowledge map with BKT
    updatedProfile.knowledgeMap = updateKnowledgeMap(
        currentProfile.knowledgeMap,
        features
    );

    // 2. Update learning style
    updatedProfile.learningStyle = updateLearningStyle(
        currentProfile.learningStyle,
        features
    );

    // 3. Update error patterns
    if (features.errorFeatures) {
        updatedProfile.errorPatterns = updateErrorPatterns(
            currentProfile.errorPatterns,
            features
        );
    }

    // 4. Recalculate predictions
    updatedProfile.predictions = recalculatePredictions(updatedProfile);

    // 5. Update meta
    updatedProfile.meta.updatedAt = new Date();
    updatedProfile.meta.version++;
    updatedProfile.meta.confidenceScore = calculateProfileConfidence(updatedProfile);

    return updatedProfile;
}

// ═══════════════════════════════════════════════════════
// BAYESIAN KNOWLEDGE TRACING
// ═══════════════════════════════════════════════════════

function updateKnowledgeMap(
    currentMap: Record<string, TopicMastery>,
    features: ExtractedFeatures
): Record<string, TopicMastery> {
    const topic = features.topicKnowledge?.topic;
    if (!topic) return currentMap;

    const newMap = { ...currentMap };
    const currentTopicData = newMap[topic] || createDefaultTopicMastery(topic);
    const isCorrect = features.topicKnowledge!.wasCorrect;

    // ═══════════════════════════════════════════════════════
    // BAYESIAN KNOWLEDGE TRACING
    // P(L_n) = probability that student has mastered the topic
    // ═══════════════════════════════════════════════════════

    const pL0 = currentTopicData.mastery / 100;
    const { pT, pG, pS } = BKT_PARAMS;

    // Calculate posterior probability
    let pLn: number;

    if (isCorrect) {
        // P(L|correct) = P(L) * (1-pS) / P(correct)
        const pCorrect = pL0 * (1 - pS) + (1 - pL0) * pG;
        pLn = (pL0 * (1 - pS)) / pCorrect;
    } else {
        // P(L|incorrect) = P(L) * pS / P(incorrect)
        const pIncorrect = pL0 * pS + (1 - pL0) * (1 - pG);
        pLn = (pL0 * pS) / pIncorrect;
    }

    // Account for learning after seeing the explanation
    const pLnAfterLearning = pLn + (1 - pLn) * pT;

    // ═══════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════

    // Difficulty modifier
    const difficulty = features.topicKnowledge?.difficulty || 5;
    const difficultyModifier = difficulty / 5; // 0-2

    // Confidence modifier (based on timing)
    let confidenceModifier = 1.0;
    if (features.confidenceIndicators?.quickAndCorrect) {
        confidenceModifier = 1.2;
    } else if (features.confidenceIndicators?.slowAndCorrect) {
        confidenceModifier = 0.9;
    }

    // Final mastery calculation
    let newMastery = pLnAfterLearning * 100 * difficultyModifier * confidenceModifier;
    newMastery = Math.max(0, Math.min(100, newMastery));

    // ═══════════════════════════════════════════════════════
    // UPDATE HISTORY
    // ═══════════════════════════════════════════════════════

    const history = [...currentTopicData.recentHistory];
    history.push({
        date: features.timestamp,
        correct: isCorrect,
        difficulty: difficulty,
        mastery: newMastery
    });

    // Keep last 10
    while (history.length > 10) {
        history.shift();
    }

    // Calculate trend
    const trend = calculateTrend(history);

    // ═══════════════════════════════════════════════════════
    // UPDATE ERROR DISTRIBUTION
    // ═══════════════════════════════════════════════════════

    const errorDist = { ...currentTopicData.errorDistribution };
    if (features.errorFeatures) {
        const errorType = features.errorFeatures.errorType;
        errorDist[errorType] = (errorDist[errorType] || 0) + 1;
    }

    // ═══════════════════════════════════════════════════════
    // UPDATE SUBTOPICS
    // ═══════════════════════════════════════════════════════

    let weakSubtopics = [...currentTopicData.weakSubtopics];
    let strongSubtopics = [...currentTopicData.strongSubtopics];
    const subtopic = features.topicKnowledge?.subtopic;

    if (subtopic) {
        if (!isCorrect) {
            if (!weakSubtopics.includes(subtopic)) {
                weakSubtopics.push(subtopic);
            }
            strongSubtopics = strongSubtopics.filter(s => s !== subtopic);
        } else {
            // After 3 correct answers, move to strong
            const subtopicCorrectCount = history.filter(h => h.correct).length;
            if (subtopicCorrectCount >= 3) {
                weakSubtopics = weakSubtopics.filter(s => s !== subtopic);
                if (!strongSubtopics.includes(subtopic)) {
                    strongSubtopics.push(subtopic);
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // RETURN UPDATED MAP
    // ═══════════════════════════════════════════════════════

    newMap[topic] = {
        ...currentTopicData,
        mastery: Math.round(newMastery * 100) / 100,
        confidence: calculateMasteryConfidence(history),
        trend,
        lastAssessed: features.timestamp,
        totalAttempts: currentTopicData.totalAttempts + 1,
        correctAttempts: currentTopicData.correctAttempts + (isCorrect ? 1 : 0),
        errorDistribution: errorDist,
        weakSubtopics,
        strongSubtopics,
        recentHistory: history
    };

    return newMap;
}

// ═══════════════════════════════════════════════════════
// TREND CALCULATION
// ═══════════════════════════════════════════════════════

function calculateTrend(
    history: Array<{ mastery: number }>
): 'improving' | 'stable' | 'declining' {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-3);
    const older = history.slice(0, -3);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, h) => sum + h.mastery, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.mastery, 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
}

// ═══════════════════════════════════════════════════════
// CONFIDENCE CALCULATION
// ═══════════════════════════════════════════════════════

function calculateMasteryConfidence(
    history: Array<{ date: Date; correct: boolean }>
): number {
    if (history.length === 0) return 0;

    // More attempts = more confident
    const attemptsFactor = Math.min(1, history.length / 10);

    // Consistent results = more confident
    const scores: number[] = history.map(h => h.correct ? 1 : 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scores.length;
    const consistencyFactor = 1 - Math.min(1, variance * 2);

    // Fresh data = more confident
    const lastDate = history[history.length - 1]?.date;
    const daysSince = lastDate
        ? (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
        : 30;
    const freshnessFactor = Math.max(0, 1 - daysSince / 30);

    return attemptsFactor * 0.4 + consistencyFactor * 0.4 + freshnessFactor * 0.2;
}

// ═══════════════════════════════════════════════════════
// LEARNING STYLE UPDATE
// ═══════════════════════════════════════════════════════

function updateLearningStyle(
    currentStyle: LearningStyle,
    features: ExtractedFeatures
): LearningStyle {
    if (!features.learningStyleIndicators) return currentStyle;

    const newStyle = { ...currentStyle };
    const indicators = features.learningStyleIndicators;
    const alpha = 0.1; // Exponential moving average coefficient

    // Update solving strategies
    newStyle.solvingStrategies = {
        usesElimination: ema(newStyle.solvingStrategies.usesElimination, indicators.usesElimination ? 1 : 0, alpha),
        readsCarefully: ema(newStyle.solvingStrategies.readsCarefully, indicators.readsFullQuestion ? 1 : 0, alpha),
        rushes: ema(newStyle.solvingStrategies.rushes, !indicators.readsFullQuestion ? 1 : 0, alpha),
        usesHints: ema(newStyle.solvingStrategies.usesHints, indicators.usesHints ? 1 : 0, alpha),
        reviewsAfter: ema(newStyle.solvingStrategies.reviewsAfter, indicators.prefersDepth ? 1 : 0, alpha)
    };

    // Update cognitive style
    // Analytical vs Intuitive
    const analyticalSignal =
        (indicators.readsFullQuestion ? 0.3 : -0.1) +
        (indicators.usesElimination ? 0.2 : 0) +
        (features.confidenceIndicators?.quickAndCorrect ? -0.2 : 0.1);

    newStyle.cognitiveStyle = {
        ...newStyle.cognitiveStyle,
        analyticalVsIntuitive: ema(newStyle.cognitiveStyle.analyticalVsIntuitive, analyticalSignal, 0.05)
    };

    return newStyle;
}

// ═══════════════════════════════════════════════════════
// ERROR PATTERNS UPDATE
// ═══════════════════════════════════════════════════════

function updateErrorPatterns(
    currentPatterns: ErrorPatterns,
    features: ExtractedFeatures
): ErrorPatterns {
    if (!features.errorFeatures) return currentPatterns;

    const newPatterns = { ...currentPatterns };
    const error = features.errorFeatures;

    // Update error type distribution
    const dist = { ...newPatterns.errorTypeDistribution };
    dist[error.errorType] = (dist[error.errorType] || 0) + 1;
    newPatterns.errorTypeDistribution = dist;

    // Find dominant error type
    let maxType: ErrorType = 'conceptual';
    let maxCount = 0;
    for (const [type, count] of Object.entries(dist)) {
        if (count > maxCount) {
            maxCount = count;
            maxType = type as ErrorType;
        }
    }
    newPatterns.dominantErrorType = maxType;

    // Update confusion pairs
    if (error.confusedWith && error.correctWas) {
        const pairs = [...newPatterns.confusionPairs];
        const existing = pairs.find(p =>
            (p.concept1 === error.correctWas && p.concept2 === error.confusedWith) ||
            (p.concept2 === error.correctWas && p.concept1 === error.confusedWith)
        );

        if (existing) {
            existing.frequency++;
            existing.lastOccurrence = features.timestamp;
        } else {
            pairs.push({
                concept1: error.correctWas,
                concept2: error.confusedWith,
                frequency: 1,
                lastOccurrence: features.timestamp
            });
        }

        // Sort by frequency, keep top 20
        pairs.sort((a, b) => b.frequency - a.frequency);
        newPatterns.confusionPairs = pairs.slice(0, 20);
    }

    return newPatterns;
}

// ═══════════════════════════════════════════════════════
// PREDICTIONS RECALCULATION
// ═══════════════════════════════════════════════════════

function recalculatePredictions(profile: StudentProfile): Predictions {
    const predictions = { ...profile.predictions };
    const topics = Object.values(profile.knowledgeMap);

    if (topics.length === 0) return predictions;

    // Calculate average mastery
    const masteries = topics.map(t => t.mastery);
    const avgMastery = masteries.reduce((a, b) => a + b, 0) / masteries.length;
    const stdDev = Math.sqrt(
        masteries.reduce((sum, val) => sum + Math.pow(val - avgMastery, 2), 0) / masteries.length
    );

    // Predicted exam score
    predictions.predictedExamScore = {
        value: avgMastery,
        confidence: profile.meta.confidenceScore,
        range: {
            min: Math.max(0, avgMastery - stdDev * 1.5),
            max: Math.min(100, avgMastery + stdDev * 1.5)
        }
    };

    // Pass probability (assuming 60% threshold)
    const passThreshold = 60;
    const z = (passThreshold - avgMastery) / Math.max(1, stdDev);
    const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * Math.pow(z, 3))));
    predictions.passProbability = 1 - cdf;

    // Recommended focus areas
    predictions.recommendedFocus = topics
        .filter(t => t.mastery < 80)
        .map(t => {
            const topicName = Object.entries(profile.knowledgeMap)
                .find(([_, v]) => v === t)?.[0] || 'Unknown';
            const masteryGap = 80 - t.mastery;
            const trendPenalty = t.trend === 'declining' ? 1.5 : 1;
            const priority = masteryGap * trendPenalty;

            return {
                topic: topicName,
                reason: generateFocusReason(t),
                expectedImpact: Math.min(10, masteryGap / 10),
                priority
            };
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5);

    // Optimal strategy based on weak topics ratio
    const weakRatio = topics.filter(t => t.mastery < 50).length / topics.length;
    predictions.optimalStrategy = {
        focusOnWeakAreas: Math.min(0.7, weakRatio + 0.3),
        maintainStrong: Math.max(0.1, 0.3 - weakRatio * 0.2),
        newTopics: Math.max(0.1, 0.3 - weakRatio * 0.3)
    };

    return predictions;
}

function generateFocusReason(topic: TopicMastery): string {
    const reasons: string[] = [];

    if (topic.mastery < 40) reasons.push('niski poziom opanowania');
    if (topic.trend === 'declining') reasons.push('spadek wyników');
    if (topic.weakSubtopics.length > 2) reasons.push('wiele słabych obszarów');

    return reasons.join(', ') || 'warto powtórzyć';
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function ema(oldValue: number, newValue: number, alpha: number): number {
    return oldValue * (1 - alpha) + newValue * alpha;
}
