// SuperMemo 2 SRS Algorithm

export interface SRSInput {
    quality: number;      // 0-5 (0=complete blackout, 5=perfect)
    easeFactor: number;   // Current ease factor (1.3-2.5)
    interval: number;     // Current interval in days
    repetitions: number;  // Current number of successful reps
}

export interface SRSOutput {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
}

export function calculateSRS(input: SRSInput): SRSOutput {
    const { quality, easeFactor: currentEF, interval: currentInterval, repetitions: currentReps } = input;

    let easeFactor = currentEF;
    let interval: number;
    let repetitions: number;

    // Quality < 3 means incorrect answer
    if (quality < 3) {
        // Reset progress
        repetitions = 0;
        interval = 1;
    } else {
        // Correct answer
        repetitions = currentReps + 1;

        if (repetitions === 1) {
            interval = 1;
        } else if (repetitions === 2) {
            interval = 6;
        } else {
            interval = Math.round(currentInterval * easeFactor);
        }
    }

    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ensure ease factor stays above 1.3
    if (easeFactor < 1.3) {
        easeFactor = 1.3;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return { easeFactor, interval, repetitions, nextReview };
}

// Calculate Knowledge Equity change based on answer quality
export function calculateEquityChange(
    quality: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    streak: number
): number {
    const basePoints: Record<string, number> = {
        easy: 5,
        medium: 10,
        hard: 15,
        expert: 25,
    };

    const qualityMultiplier: Record<number, number> = {
        0: -0.5,   // Complete blackout
        1: -0.25,  // Incorrect
        2: 0,      // Incorrect but close
        3: 0.5,    // Correct with difficulty
        4: 0.75,   // Correct with hesitation
        5: 1,      // Perfect recall
    };

    const base = basePoints[difficulty] || 10;
    const multiplier = qualityMultiplier[quality] || 0;
    const streakBonus = Math.min(streak * 0.05, 0.5); // Max 50% bonus

    return Math.round(base * multiplier * (1 + streakBonus));
}

// Get cards due for review
export function getCardsDueForReview<T extends { srs: { nextReview: Date } }>(
    cards: T[],
    limit?: number
): T[] {
    const now = new Date();

    const dueCards = cards
        .filter(card => new Date(card.srs.nextReview) <= now)
        .sort((a, b) =>
            new Date(a.srs.nextReview).getTime() - new Date(b.srs.nextReview).getTime()
        );

    return limit ? dueCards.slice(0, limit) : dueCards;
}
