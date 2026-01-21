/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm by Piotr Wozniak
 * 
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect response, but upon seeing correct answer, remembered
 * 2 - Incorrect response, but correct answer seemed easy to recall
 * 3 - Correct response with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response
 */

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
}

export interface SRSUpdate {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReview: Date;
}

/**
 * Calculate the next review date and updated SRS parameters
 * using the SM-2 algorithm
 */
export function calculateNextReview(
    quality: number, // 0-5
    currentCard: Pick<SRSCard, 'easeFactor' | 'intervalDays' | 'repetitions'>
): SRSUpdate {
    // Clamp quality to 0-5
    const q = Math.max(0, Math.min(5, Math.round(quality)));

    let { easeFactor, intervalDays, repetitions } = currentCard;

    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEaseFactor = Math.max(
        1.3, // Minimum ease factor
        easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    let newInterval: number;
    let newRepetitions: number;

    if (q < 3) {
        // Failed - reset repetitions, show again soon
        newRepetitions = 0;
        newInterval = 1; // Review again tomorrow (or same day in some implementations)
    } else {
        // Successful review
        newRepetitions = repetitions + 1;

        if (newRepetitions === 1) {
            newInterval = 1; // First successful: 1 day
        } else if (newRepetitions === 2) {
            newInterval = 6; // Second successful: 6 days
        } else {
            // Subsequent: multiply by ease factor
            newInterval = Math.round(intervalDays * newEaseFactor);
        }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    nextReview.setHours(0, 0, 0, 0); // Start of day

    return {
        easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimals
        intervalDays: newInterval,
        repetitions: newRepetitions,
        nextReview
    };
}

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
