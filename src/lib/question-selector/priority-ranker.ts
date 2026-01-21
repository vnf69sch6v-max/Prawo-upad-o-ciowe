/**
 * Priority Question Ranker
 * Intelligently selects questions based on multiple factors:
 * - SM-2+ scheduling
 * - Knowledge Graph prerequisites
 * - Error patterns
 * - Exam importance
 */

import type { SRSCard, LegalArea, QuestionType } from '@/lib/srs';
import type { UserMastery } from '@/lib/knowledge-graph';
import type { ErrorPatterns } from '@/lib/analytics';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface QuestionData {
    id: string;
    question: string;
    topic: string;
    domain: string;
    questionType: QuestionType;
    legalArea: LegalArea;
    examWeight: number;
    difficulty: 'easy' | 'medium' | 'hard';
    relatedArticles: string[];
}

export interface RankedQuestion {
    question: QuestionData;
    score: number;
    reasons: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedTime: number; // seconds
}

export interface SelectionParams {
    count: number;
    examDate?: Date;
    focusArea?: string;         // 'KC' | 'KSH' | 'PU'
    focusTopic?: string;        // Specific topic
    excludeIds?: string[];      // Already seen questions
    includeTypes?: QuestionType[];
    minDifficulty?: 'easy' | 'medium' | 'hard';
    maxDifficulty?: 'easy' | 'medium' | 'hard';
    mode?: 'balanced' | 'weak_points' | 'exam_prep' | 'new_material';
}

// ═══════════════════════════════════════════════════════
// SCORING WEIGHTS
// ═══════════════════════════════════════════════════════

const SCORING_WEIGHTS = {
    // Base factors
    SRS_DUE: 100,           // Question is due for review
    NEVER_SEEN: 80,         // Never practiced
    LOW_MASTERY: 60,        // Topic mastery < 50%

    // Exam factors
    EXAM_WEIGHT: 15,        // Per point of exam weight (1-10)
    EXAM_SOON: 50,          // Exam < 14 days
    EXAM_CRITICAL: 100,     // Exam < 7 days + high weight

    // Error factors
    RECENT_ERROR: 40,       // Made mistake on this recently
    CONFUSION_PAIR: 30,     // Part of a confusion pair
    WEAK_PREREQ: -30,       // Missing prerequisites (penalty)

    // Variety factors
    TYPE_BALANCE: 10,       // Helps maintain question type balance
    TOPIC_VARIETY: 20,      // Haven't seen this topic recently

    // Difficulty
    DIFFICULTY_MATCH: 15,   // Matches user's current level
};

// ═══════════════════════════════════════════════════════
// MAIN SELECTION FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * Select questions using priority-based algorithm
 */
export function selectQuestions(
    allQuestions: QuestionData[],
    params: SelectionParams,
    context: {
        srsCards: Record<string, SRSCard>;
        userMastery: Record<string, UserMastery>;
        errorPatterns: ErrorPatterns;
        recentQuestionIds?: string[];
    }
): RankedQuestion[] {
    const {
        count,
        examDate,
        focusArea,
        focusTopic,
        excludeIds = [],
        includeTypes,
        minDifficulty,
        maxDifficulty,
        mode = 'balanced'
    } = params;

    const { srsCards, userMastery, errorPatterns, recentQuestionIds = [] } = context;

    const now = new Date();
    const daysToExam = examDate
        ? Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

    // Filter questions
    let candidates = allQuestions.filter(q => {
        if (excludeIds.includes(q.id)) return false;
        if (focusArea && q.domain !== focusArea) return false;
        if (focusTopic && q.topic !== focusTopic) return false;
        if (includeTypes && !includeTypes.includes(q.questionType)) return false;

        // Difficulty filter
        const diffMap = { easy: 1, medium: 2, hard: 3 };
        if (minDifficulty && diffMap[q.difficulty] < diffMap[minDifficulty]) return false;
        if (maxDifficulty && diffMap[q.difficulty] > diffMap[maxDifficulty]) return false;

        return true;
    });

    // Score each question
    const scored = candidates.map(question => {
        const score = calculateQuestionScore(question, {
            srsCards,
            userMastery,
            errorPatterns,
            recentQuestionIds,
            daysToExam,
            mode
        });

        return {
            question,
            ...score
        };
    });

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);

    // Select top N with type balancing
    const selected: RankedQuestion[] = [];
    const typeCount: Record<string, number> = {};

    for (const item of scored) {
        if (selected.length >= count) break;

        // Type balancing: don't have too many of one type
        const type = item.question.questionType;
        typeCount[type] = (typeCount[type] || 0) + 1;

        const maxPerType = Math.ceil(count / 3);
        if (typeCount[type] > maxPerType && selected.length < count * 0.8) {
            // Skip this type if we have too many, unless we're running out of questions
            continue;
        }

        selected.push(item);
    }

    // If we didn't get enough, add more without balancing
    if (selected.length < count) {
        for (const item of scored) {
            if (selected.length >= count) break;
            if (!selected.includes(item)) {
                selected.push(item);
            }
        }
    }

    return selected;
}

// ═══════════════════════════════════════════════════════
// SCORING FUNCTION
// ═══════════════════════════════════════════════════════

function calculateQuestionScore(
    question: QuestionData,
    context: {
        srsCards: Record<string, SRSCard>;
        userMastery: Record<string, UserMastery>;
        errorPatterns: ErrorPatterns;
        recentQuestionIds: string[];
        daysToExam: number;
        mode: string;
    }
): { score: number; reasons: string[]; priority: 'critical' | 'high' | 'medium' | 'low'; estimatedTime: number } {
    const { srsCards, userMastery, errorPatterns, recentQuestionIds, daysToExam, mode } = context;

    let score = 0;
    const reasons: string[] = [];

    // ─────────────────────────────────────────────────────
    // 1. SRS Status
    // ─────────────────────────────────────────────────────
    const srsCard = srsCards[question.id];

    if (!srsCard) {
        // Never seen
        score += SCORING_WEIGHTS.NEVER_SEEN;
        reasons.push('Nowe pytanie');
    } else {
        const isDue = new Date(srsCard.nextReview) <= new Date();
        if (isDue) {
            score += SCORING_WEIGHTS.SRS_DUE;
            reasons.push('Do powtórki');
        }
    }

    // ─────────────────────────────────────────────────────
    // 2. Topic Mastery
    // ─────────────────────────────────────────────────────
    const topicMastery = userMastery[question.topic];

    if (!topicMastery || topicMastery.masteryLevel < 50) {
        score += SCORING_WEIGHTS.LOW_MASTERY;
        reasons.push('Słaby temat');
    }

    // ─────────────────────────────────────────────────────
    // 3. Exam Weight
    // ─────────────────────────────────────────────────────
    score += question.examWeight * SCORING_WEIGHTS.EXAM_WEIGHT;

    if (question.examWeight >= 8) {
        reasons.push('Ważne na egzaminie');
    }

    // ─────────────────────────────────────────────────────
    // 4. Exam Proximity
    // ─────────────────────────────────────────────────────
    if (daysToExam < 7 && question.examWeight >= 9) {
        score += SCORING_WEIGHTS.EXAM_CRITICAL;
        reasons.push('Pilne przed egzaminem');
    } else if (daysToExam < 14 && question.examWeight >= 7) {
        score += SCORING_WEIGHTS.EXAM_SOON;
    }

    // ─────────────────────────────────────────────────────
    // 5. Error Patterns
    // ─────────────────────────────────────────────────────
    const topicErrors = errorPatterns.byTopic[question.topic];

    if (topicErrors && topicErrors.errorRate > 40) {
        score += SCORING_WEIGHTS.RECENT_ERROR;
        reasons.push(`${topicErrors.errorRate}% błędów w tym temacie`);
    }

    // Check confusion pairs
    const isConfusionPair = errorPatterns.commonConfusions.some(
        cp => cp.examples.includes(question.id)
    );
    if (isConfusionPair) {
        score += SCORING_WEIGHTS.CONFUSION_PAIR;
        reasons.push('Często mylone');
    }

    // ─────────────────────────────────────────────────────
    // 6. Variety
    // ─────────────────────────────────────────────────────
    if (!recentQuestionIds.includes(question.id)) {
        score += SCORING_WEIGHTS.TOPIC_VARIETY;
    }

    // ─────────────────────────────────────────────────────
    // 7. Mode-specific adjustments
    // ─────────────────────────────────────────────────────
    switch (mode) {
        case 'weak_points':
            if (topicErrors && topicErrors.errorRate > 30) {
                score *= 1.5;
            }
            break;
        case 'exam_prep':
            score = score * (1 + question.examWeight / 20);
            break;
        case 'new_material':
            if (!srsCard) {
                score *= 2;
            }
            break;
    }

    // ─────────────────────────────────────────────────────
    // Determine Priority
    // ─────────────────────────────────────────────────────
    let priority: 'critical' | 'high' | 'medium' | 'low';

    if (score > 300) priority = 'critical';
    else if (score > 200) priority = 'high';
    else if (score > 100) priority = 'medium';
    else priority = 'low';

    // ─────────────────────────────────────────────────────
    // Estimate Time
    // ─────────────────────────────────────────────────────
    const timeEstimates: Record<QuestionType, number> = {
        memory: 15,
        interpretation: 30,
        case: 60,
        comparison: 45
    };
    const estimatedTime = timeEstimates[question.questionType] || 20;

    return { score, reasons, priority, estimatedTime };
}

// ═══════════════════════════════════════════════════════
// SESSION BUILDER
// ═══════════════════════════════════════════════════════

/**
 * Build an optimized study session
 */
export function buildStudySession(
    allQuestions: QuestionData[],
    params: {
        targetDuration: number;  // minutes
        examDate?: Date;
        focusArea?: string;
        mode?: 'balanced' | 'weak_points' | 'exam_prep' | 'new_material';
    },
    context: {
        srsCards: Record<string, SRSCard>;
        userMastery: Record<string, UserMastery>;
        errorPatterns: ErrorPatterns;
    }
): {
    questions: RankedQuestion[];
    estimatedDuration: number;
    breakdown: Record<string, number>;
} {
    const { targetDuration, examDate, focusArea, mode = 'balanced' } = params;

    // Estimate questions based on time
    const avgTimePerQuestion = 30; // seconds
    const estimatedCount = Math.floor((targetDuration * 60) / avgTimePerQuestion);

    const selected = selectQuestions(
        allQuestions,
        {
            count: estimatedCount,
            examDate,
            focusArea,
            mode
        },
        {
            ...context,
            recentQuestionIds: []
        }
    );

    // Calculate actual duration
    const estimatedDuration = Math.ceil(
        selected.reduce((sum, q) => sum + q.estimatedTime, 0) / 60
    );

    // Type breakdown
    const breakdown: Record<string, number> = {};
    for (const q of selected) {
        const type = q.question.questionType;
        breakdown[type] = (breakdown[type] || 0) + 1;
    }

    return {
        questions: selected,
        estimatedDuration,
        breakdown
    };
}
