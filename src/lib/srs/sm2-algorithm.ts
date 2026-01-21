/**
 * SM-2+ Enhanced Spaced Repetition Algorithm for Legal Education
 * Extended version of SuperMemo 2 with legal-specific modifiers
 * 
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect response, but upon seeing correct answer, remembered
 * 2 - Incorrect response, but correct answer seemed easy to recall
 * 3 - Correct response with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type QuestionType = 'memory' | 'interpretation' | 'case' | 'comparison';
export type LegalArea = 'civil' | 'criminal' | 'commercial' | 'administrative' | 'labor' | 'tax' | 'constitutional';

export interface SRSCard {
    questionId: string;
    domain: string;
    easeFactor: number;      // 1.3 - 2.5+
    intervalDays: number;    // Days until next review
    repetitions: number;     // Successful repetitions in a row
    nextReview: Date;
    lastReview: Date | null;
    totalReviews: number;
    correctReviews: number;
    // Enhanced fields
    questionType?: QuestionType;
    legalArea?: LegalArea;
    examWeight?: number;     // 1-10
    lastAnswerTimeMs?: number;
}

export interface SRSUpdate {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReview: Date;
    priority?: 'high' | 'medium' | 'low';
}

export interface LegalSM2Params {
    quality: number;         // 0-5
    repetitions: number;
    easeFactor: number;
    intervalDays: number;
    // Legal modifiers
    questionType?: QuestionType;
    legalArea?: LegalArea;
    examWeight?: number;     // 1-10
    isAmended?: boolean;     // Recently amended law
    timeToAnswer?: number;   // Actual time in ms
    expectedTime?: number;   // Expected time in ms
}

// ═══════════════════════════════════════════════════════
// MODIFIERS
// ═══════════════════════════════════════════════════════

/**
 * Question type affects learning difficulty
 * Lower multiplier = shorter intervals (harder)
 */
const TYPE_MULTIPLIERS: Record<QuestionType, number> = {
    'memory': 1.0,        // Standard memorization
    'interpretation': 0.8, // Harder - requires understanding
    'case': 0.7,          // Hardest - case analysis
    'comparison': 0.85    // Medium - comparing concepts
};

/**
 * Legal area affects complexity
 * Based on exam pass rates
 */
const AREA_MULTIPLIERS: Record<LegalArea, number> = {
    'civil': 0.9,          // Complex, many provisions
    'criminal': 1.0,       // Standard difficulty
    'commercial': 0.8,     // Very complex (KSH)
    'administrative': 0.85,// Many details
    'constitutional': 1.1, // More stable, easier
    'labor': 0.95,         // Medium
    'tax': 0.75            // Very detailed, hardest
};

// ═══════════════════════════════════════════════════════
// BASIC SM-2 (unchanged, for compatibility)
// ═══════════════════════════════════════════════════════

/**
 * Basic SM-2 algorithm (original implementation)
 */
export function calculateNextReview(
    quality: number,
    currentCard: Pick<SRSCard, 'easeFactor' | 'intervalDays' | 'repetitions'>
): SRSUpdate {
    const q = Math.max(0, Math.min(5, Math.round(quality)));
    let { easeFactor, intervalDays, repetitions } = currentCard;

    const newEaseFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    let newInterval: number;
    let newRepetitions: number;

    if (q < 3) {
        newRepetitions = 0;
        newInterval = 1;
    } else {
        newRepetitions = repetitions + 1;
        if (newRepetitions === 1) newInterval = 1;
        else if (newRepetitions === 2) newInterval = 6;
        else newInterval = Math.round(intervalDays * newEaseFactor);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    nextReview.setHours(0, 0, 0, 0);

    return {
        easeFactor: Math.round(newEaseFactor * 100) / 100,
        intervalDays: newInterval,
        repetitions: newRepetitions,
        nextReview
    };
}

// ═══════════════════════════════════════════════════════
// SM-2+ ENHANCED (Legal-optimized)
// ═══════════════════════════════════════════════════════

/**
 * Enhanced SM-2+ algorithm with legal-specific modifiers
 * Optimized for legal exam preparation
 */
export function calculateLegalSM2Plus(params: LegalSM2Params): SRSUpdate {
    const {
        quality,
        repetitions,
        easeFactor,
        intervalDays,
        questionType = 'memory',
        legalArea = 'civil',
        examWeight = 5,
        isAmended = false,
        timeToAnswer,
        expectedTime
    } = params;

    const q = Math.max(0, Math.min(5, Math.round(quality)));

    // ═══════════════════════════════════════════════════════
    // MODIFIER 1: Question Type
    // ═══════════════════════════════════════════════════════
    const typeMultiplier = TYPE_MULTIPLIERS[questionType] || 1.0;

    // ═══════════════════════════════════════════════════════
    // MODIFIER 2: Legal Area
    // ═══════════════════════════════════════════════════════
    const areaMultiplier = AREA_MULTIPLIERS[legalArea] || 1.0;

    // ═══════════════════════════════════════════════════════
    // MODIFIER 3: Amendment (new laws need more practice)
    // ═══════════════════════════════════════════════════════
    const amendmentMultiplier = isAmended ? 0.7 : 1.0;

    // ═══════════════════════════════════════════════════════
    // MODIFIER 4: Exam Weight (important = more practice)
    // ═══════════════════════════════════════════════════════
    // examWeight 1-10, converts to 1.0-0.7 multiplier
    const examMultiplier = 1 - ((examWeight - 1) / 9) * 0.3;

    // ═══════════════════════════════════════════════════════
    // MODIFIER 5: Response Time (uncertainty detection)
    // ═══════════════════════════════════════════════════════
    let timeMultiplier = 1.0;
    if (timeToAnswer && expectedTime) {
        if (timeToAnswer > expectedTime * 2) {
            // Took too long = uncertain knowledge
            timeMultiplier = 0.8;
        } else if (timeToAnswer < expectedTime * 0.5) {
            // Very fast = confident knowledge
            timeMultiplier = 1.2;
        }
    }

    // ═══════════════════════════════════════════════════════
    // CALCULATE NEW INTERVAL
    // ═══════════════════════════════════════════════════════

    if (q < 3) {
        // INCORRECT ANSWER
        // Don't fully reset - preserve some progress
        const retentionFactor = Math.min(0.3, repetitions * 0.05);
        const newReps = Math.max(0, repetitions - 2);
        const newInterval = Math.max(1, Math.round(intervalDays * retentionFactor));

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1); // Tomorrow
        nextReview.setHours(0, 0, 0, 0);

        return {
            easeFactor: Math.max(1.3, easeFactor - 0.2),
            intervalDays: newInterval,
            repetitions: newReps,
            nextReview,
            priority: 'high'
        };
    }

    // CORRECT ANSWER
    let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    newEF = Math.max(1.3, Math.min(2.5, newEF));

    // Base intervals (slightly faster progression than SM-2)
    let baseInterval: number;
    if (repetitions === 0) baseInterval = 1;
    else if (repetitions === 1) baseInterval = 3;  // Faster second review
    else if (repetitions === 2) baseInterval = 7;
    else baseInterval = Math.round(intervalDays * newEF);

    // Apply all modifiers
    const finalInterval = Math.round(
        baseInterval *
        typeMultiplier *
        areaMultiplier *
        amendmentMultiplier *
        examMultiplier *
        timeMultiplier
    );

    // Cap at 180 days (you'll review before exam anyway)
    const cappedInterval = Math.min(180, Math.max(1, finalInterval));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + cappedInterval);
    nextReview.setHours(0, 0, 0, 0);

    // Determine priority based on exam weight
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (examWeight >= 8) priority = 'high';
    else if (examWeight <= 3) priority = 'low';

    return {
        easeFactor: Math.round(newEF * 100) / 100,
        intervalDays: cappedInterval,
        repetitions: repetitions + 1,
        nextReview,
        priority
    };
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Get default SRS state for a new card
 */
export function getDefaultSRSState(): Pick<SRSCard, 'easeFactor' | 'intervalDays' | 'repetitions'> {
    return {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0
    };
}

/**
 * Quality rating descriptions for UI
 */
export const QUALITY_RATINGS = [
    { quality: 1, label: 'Ponownie', description: 'Nie pamiętam', color: '#ef4444', icon: '❌' },
    { quality: 3, label: 'Trudne', description: 'Z trudem', color: '#f97316', icon: '😓' },
    { quality: 4, label: 'Dobrze', description: 'Przypomniałem sobie', color: '#22c55e', icon: '👍' },
    { quality: 5, label: 'Łatwe', description: 'Bez problemu', color: '#3b82f6', icon: '⚡' },
] as const;

/**
 * Calculate estimated review time based on quality
 */
export function getEstimatedNextReview(
    quality: number,
    currentCard: Pick<SRSCard, 'easeFactor' | 'intervalDays' | 'repetitions'>
): string {
    const update = calculateNextReview(quality, currentCard);
    const days = update.intervalDays;

    if (days === 1) return 'Jutro';
    if (days < 7) return `Za ${days} dni`;
    if (days < 30) return `Za ${Math.round(days / 7)} tyg.`;
    if (days < 365) return `Za ${Math.round(days / 30)} mies.`;
    return `Za ${Math.round(days / 365)} lat`;
}

/**
 * Get estimated time for a question type
 */
export function getExpectedAnswerTime(questionType: QuestionType): number {
    const times: Record<QuestionType, number> = {
        'memory': 15000,       // 15 seconds
        'interpretation': 30000, // 30 seconds
        'case': 60000,         // 60 seconds
        'comparison': 45000    // 45 seconds
    };
    return times[questionType] || 20000;
}

/**
 * Map domain to legal area
 */
export function domainToLegalArea(domain: string): LegalArea {
    const mapping: Record<string, LegalArea> = {
        'ksh': 'commercial',
        'prawo_handlowe': 'commercial',
        'prawo_upadlosciowe': 'commercial',
        'prawo_cywilne': 'civil',
        'kc': 'civil',
        'kk': 'criminal',
        'prawo_karne': 'criminal',
        'prawo_administracyjne': 'administrative',
        'prawo_pracy': 'labor',
        'prawo_podatkowe': 'tax',
        'konstytucja': 'constitutional'
    };
    return mapping[domain] || 'civil';
}
