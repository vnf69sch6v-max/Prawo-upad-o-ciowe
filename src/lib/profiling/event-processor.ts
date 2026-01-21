/**
 * Event Processor
 * Processes raw events and extracts high-level features
 */

import type {
    LearningEvent,
    QuestionResponseEvent,
    ExtractedFeatures,
    ConfidenceIndicators,
    TopicKnowledgeFeatures,
    ErrorFeatures,
    ErrorType,
    LearningStyleIndicators
} from './types';

// ═══════════════════════════════════════════════════════
// EXPECTED TIMES BY DIFFICULTY (ms)
// ═══════════════════════════════════════════════════════

const EXPECTED_TIMES: Record<number, number> = {
    1: 10000,   // Easy: 10s
    2: 15000,
    3: 20000,
    4: 25000,
    5: 30000,   // Medium: 30s
    6: 35000,
    7: 45000,
    8: 60000,
    9: 75000,
    10: 90000   // Hard: 90s
};

function getExpectedTime(difficulty: number): number {
    return EXPECTED_TIMES[Math.round(difficulty)] || 30000;
}

// ═══════════════════════════════════════════════════════
// MAIN PROCESSING FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Process a learning event and extract features
 */
export function processEvent(
    event: LearningEvent,
    userId: string
): ExtractedFeatures | null {
    if (event.type !== 'question_response') {
        return null; // Only process question responses for now
    }

    const qEvent = event as QuestionResponseEvent;

    // 1. Normalize timing
    const expectedTime = getExpectedTime(qEvent.questionDifficulty);
    const normalizedTime = qEvent.timeToAnswer / expectedTime;

    // 2. Extract confidence indicators
    const confidenceIndicators = extractConfidenceIndicators(qEvent, normalizedTime);

    // 3. Extract topic knowledge features
    const topicKnowledge = extractTopicKnowledge(qEvent);

    // 4. Extract error features (if incorrect)
    const errorFeatures = !qEvent.isCorrect
        ? extractErrorFeatures(qEvent, normalizedTime)
        : undefined;

    // 5. Extract learning style indicators
    const learningStyleIndicators = extractLearningStyleIndicators(qEvent);

    return {
        userId,
        timestamp: qEvent.timestamp,
        confidenceIndicators,
        topicKnowledge,
        errorFeatures,
        learningStyleIndicators,
        normalizedTime
    };
}

// ═══════════════════════════════════════════════════════
// CONFIDENCE INDICATORS
// ═══════════════════════════════════════════════════════

function extractConfidenceIndicators(
    event: QuestionResponseEvent,
    normalizedTime: number
): ConfidenceIndicators {
    return {
        // Fast answer + correct = high confidence
        quickAndCorrect: normalizedTime < 0.5 && event.isCorrect,
        // Slow answer + correct = uncertain knowledge
        slowAndCorrect: normalizedTime > 1.5 && event.isCorrect,
        // Changed answer = hesitation
        hesitation: event.changedAnswer,
        // First instinct was correct
        firstInstinctCorrect: event.originalAnswer === event.correctAnswer,
        // Studied explanation after answering (>10s)
        studiedExplanation: (event.timeReadingExplanation || 0) > 10000
    };
}

// ═══════════════════════════════════════════════════════
// TOPIC KNOWLEDGE FEATURES
// ═══════════════════════════════════════════════════════

function extractTopicKnowledge(event: QuestionResponseEvent): TopicKnowledgeFeatures {
    return {
        topic: event.topic,
        subtopic: event.subtopic,
        wasCorrect: event.isCorrect,
        difficulty: event.questionDifficulty,
        // Weighted score - harder questions worth more
        weightedScore: event.isCorrect ? event.questionDifficulty : 0,
        // First time seeing this topic (would need context)
        isFirstExposure: false // Would need user history to determine
    };
}

// ═══════════════════════════════════════════════════════
// ERROR CLASSIFICATION
// ═══════════════════════════════════════════════════════

function extractErrorFeatures(
    event: QuestionResponseEvent,
    normalizedTime: number
): ErrorFeatures {
    const errorType = classifyError(event, normalizedTime);
    const errorCategory = categorizeError(event);

    return {
        errorType,
        confusedWith: event.selectedAnswer,
        correctWas: event.correctAnswer,
        isRepeatError: false, // Would need history
        errorCategory
    };
}

/**
 * Classify error type based on behavior
 */
function classifyError(
    event: QuestionResponseEvent,
    normalizedTime: number
): ErrorType {
    // Fast answer on easy question = careless mistake
    if (normalizedTime < 0.3 && event.questionDifficulty < 4) {
        return 'careless';
    }

    // Long time + changed answer = confusion between concepts
    if (normalizedTime > 2 && event.changedAnswer) {
        return 'confusion';
    }

    // Very fast on hard question = knowledge gap
    if (normalizedTime < 0.5 && event.questionDifficulty > 7) {
        return 'knowledge_gap';
    }

    // Long time without confidence = partial knowledge
    if (normalizedTime > 1.5 && event.hesitationEvents > 1) {
        return 'partial';
    }

    // Default to conceptual error
    return 'conceptual';
}

/**
 * Categorize error for legal domain
 */
function categorizeError(event: QuestionResponseEvent): string {
    const topic = event.topic.toLowerCase();
    const subtopic = (event.subtopic || '').toLowerCase();

    // Legal-specific error categories
    if (topic.includes('termin') || subtopic.includes('dni') || subtopic.includes('miesięc')) {
        return 'date_mistake';
    }
    if (topic.includes('postępowanie') || topic.includes('procedura')) {
        return 'procedure_error';
    }
    if (topic.includes('artykuł') || topic.includes('art.')) {
        return 'article_confusion';
    }
    if (topic.includes('wyjątek') || topic.includes('poza')) {
        return 'exception_missed';
    }

    return 'interpretation_error';
}

// ═══════════════════════════════════════════════════════
// LEARNING STYLE INDICATORS
// ═══════════════════════════════════════════════════════

function extractLearningStyleIndicators(
    event: QuestionResponseEvent
): LearningStyleIndicators {
    return {
        // Uses elimination strategy
        usesElimination: (event.eliminatedOptions?.length || 0) > 0,
        // Reads full question (>3s before first interaction)
        readsFullQuestion: event.timeToFirstClick > 3000,
        // Skips explanations (<2s on explanation)
        skipsExplanations: (event.timeReadingExplanation || 0) < 2000,
        // Uses hints when available
        usesHints: event.usedHint,
        // Prefers depth (expanded explanation)
        prefersDepth: event.expandedExplanation
    };
}

// ═══════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════

/**
 * Process multiple events into aggregated statistics
 */
export function aggregateFeatures(
    features: ExtractedFeatures[]
): {
    topicStats: Record<string, {
        attempts: number;
        correct: number;
        avgNormalizedTime: number;
        errors: ErrorType[];
    }>;
    styleIndicators: {
        eliminationRate: number;
        carefulReadingRate: number;
        explanationStudyRate: number;
        hintUsageRate: number;
    };
    confidenceStats: {
        quickCorrectRate: number;
        slowCorrectRate: number;
        hesitationRate: number;
        firstInstinctCorrectRate: number;
    };
} {
    const topicStats: Record<string, {
        attempts: number;
        correct: number;
        totalNormalizedTime: number;
        errors: ErrorType[];
    }> = {};

    let eliminationCount = 0;
    let carefulCount = 0;
    let explanationCount = 0;
    let hintCount = 0;
    let quickCorrectCount = 0;
    let slowCorrectCount = 0;
    let hesitationCount = 0;
    let firstInstinctCorrect = 0;

    for (const f of features) {
        // Topic stats
        if (f.topicKnowledge) {
            const topic = f.topicKnowledge.topic;
            if (!topicStats[topic]) {
                topicStats[topic] = { attempts: 0, correct: 0, totalNormalizedTime: 0, errors: [] };
            }
            topicStats[topic].attempts++;
            if (f.topicKnowledge.wasCorrect) topicStats[topic].correct++;
            topicStats[topic].totalNormalizedTime += f.normalizedTime || 1;
            if (f.errorFeatures) {
                topicStats[topic].errors.push(f.errorFeatures.errorType);
            }
        }

        // Style indicators
        if (f.learningStyleIndicators) {
            if (f.learningStyleIndicators.usesElimination) eliminationCount++;
            if (f.learningStyleIndicators.readsFullQuestion) carefulCount++;
            if (!f.learningStyleIndicators.skipsExplanations) explanationCount++;
            if (f.learningStyleIndicators.usesHints) hintCount++;
        }

        // Confidence stats
        if (f.confidenceIndicators) {
            if (f.confidenceIndicators.quickAndCorrect) quickCorrectCount++;
            if (f.confidenceIndicators.slowAndCorrect) slowCorrectCount++;
            if (f.confidenceIndicators.hesitation) hesitationCount++;
            if (f.confidenceIndicators.firstInstinctCorrect) firstInstinctCorrect++;
        }
    }

    const total = features.length || 1;

    // Transform topic stats
    const finalTopicStats: Record<string, {
        attempts: number;
        correct: number;
        avgNormalizedTime: number;
        errors: ErrorType[];
    }> = {};

    for (const [topic, stats] of Object.entries(topicStats)) {
        finalTopicStats[topic] = {
            ...stats,
            avgNormalizedTime: stats.totalNormalizedTime / stats.attempts
        };
    }

    return {
        topicStats: finalTopicStats,
        styleIndicators: {
            eliminationRate: eliminationCount / total,
            carefulReadingRate: carefulCount / total,
            explanationStudyRate: explanationCount / total,
            hintUsageRate: hintCount / total
        },
        confidenceStats: {
            quickCorrectRate: quickCorrectCount / total,
            slowCorrectRate: slowCorrectCount / total,
            hesitationRate: hesitationCount / total,
            firstInstinctCorrectRate: firstInstinctCorrect / total
        }
    };
}
