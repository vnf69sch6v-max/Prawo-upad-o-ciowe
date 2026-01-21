/**
 * SM-2+ Algorithm for Spaced Repetition
 * Dostosowany do nauki prawa
 */

// Parametry domyślne
const DEFAULT_PARAMS = {
    initialEaseFactor: 2.5,
    minEaseFactor: 1.3,
    maxEaseFactor: 3.0,
    maxInterval: 365, // dni
};

// Modyfikatory dla dziedzin prawa
const LEGAL_AREA_MODIFIERS: Record<string, number> = {
    civil: 0.9,           // Cywilne - złożone
    criminal: 1.0,        // Karne - standardowe
    administrative: 0.85, // Administracyjne - dużo szczegółów
    constitutional: 1.1,  // Konstytucyjne - stabilniejsze
    commercial: 0.8,      // Handlowe - skomplikowane
    labor: 0.95,          // Pracy - średnie
    tax: 0.75,            // Podatkowe - bardzo szczegółowe
    procedure_civil: 0.85,
    procedure_criminal: 0.9,
    procedure_admin: 0.85,
};

// Modyfikatory dla typów pytań
const QUESTION_TYPE_MODIFIERS: Record<string, number> = {
    single_choice: 1.0,
    multiple_choice: 0.85,
    true_false: 1.1,
    fill_blank: 0.8,
    case_study: 0.7,
};

interface QualityParams {
    isCorrect: boolean;
    timeSpent: number;
    expectedTime: number;
    usedHint?: boolean;
    changedAnswer?: boolean;
}

/**
 * Oblicz jakość odpowiedzi (0-5)
 */
export function calculateQuality({
    isCorrect,
    timeSpent,
    expectedTime,
    usedHint = false,
    changedAnswer = false
}: QualityParams): number {
    if (!isCorrect) {
        // Błędna odpowiedź: 0-2
        if (timeSpent < expectedTime * 0.5) return 0;  // Szybka błędna = zgadywanie
        if (timeSpent > expectedTime * 2) return 1;   // Długo myślał = prawie wiedział
        return 1;
    }

    // Poprawna odpowiedź: 3-5
    let quality = 4; // Bazowa jakość

    // Modyfikatory czasowe
    const timeRatio = timeSpent / expectedTime;
    if (timeRatio < 0.5) quality = 5;       // Bardzo szybko
    else if (timeRatio > 2.0) quality = 3;  // Bardzo wolno

    // Kary
    if (usedHint) quality = Math.max(3, quality - 1);
    if (changedAnswer) quality = Math.max(3, quality - 0.5);

    return Math.round(quality);
}

interface SM2PlusParams {
    quality: number;
    repetitions?: number;
    easeFactor?: number;
    interval?: number;
    legalArea?: string | null;
    questionType?: string;
    difficulty?: number;
    examWeight?: number;
}

interface SM2PlusResult {
    repetitions: number;
    easeFactor: number;
    interval: number;
    nextReviewDate: string;
    quality: number;
}

/**
 * Główna funkcja SM-2+
 */
export function calculateSM2Plus({
    quality,
    repetitions = 0,
    easeFactor = DEFAULT_PARAMS.initialEaseFactor,
    interval = 1,
    legalArea = null,
    questionType = 'single_choice',
    difficulty = 5,
    examWeight = 5,
}: SM2PlusParams): SM2PlusResult {
    // === OBLICZ NOWY EASE FACTOR ===
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEF = Math.max(DEFAULT_PARAMS.minEaseFactor, Math.min(DEFAULT_PARAMS.maxEaseFactor, newEF));

    // === OBLICZ NOWY INTERWAŁ ===
    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
        // Błędna odpowiedź - częściowy reset
        newRepetitions = Math.max(0, repetitions - 2);
        newInterval = 1;
        newEF = Math.max(DEFAULT_PARAMS.minEaseFactor, easeFactor - 0.2);
    } else {
        // Poprawna odpowiedź
        newRepetitions = repetitions + 1;

        if (repetitions === 0) {
            newInterval = 1;
        } else if (repetitions === 1) {
            newInterval = 3;
        } else if (repetitions === 2) {
            newInterval = 7;
        } else {
            newInterval = Math.round(interval * newEF);
        }
    }

    // === ZASTOSUJ MODYFIKATORY ===

    // Modyfikator dziedziny prawa
    if (legalArea && LEGAL_AREA_MODIFIERS[legalArea]) {
        newInterval = Math.round(newInterval * LEGAL_AREA_MODIFIERS[legalArea]);
    }

    // Modyfikator typu pytania
    if (QUESTION_TYPE_MODIFIERS[questionType]) {
        newInterval = Math.round(newInterval * QUESTION_TYPE_MODIFIERS[questionType]);
    }

    // Modyfikator trudności (trudniejsze = krótsze interwały)
    const difficultyMod = 1 - ((difficulty - 5) / 10) * 0.3; // 0.85 - 1.15
    newInterval = Math.round(newInterval * difficultyMod);

    // Modyfikator wagi egzaminacyjnej (ważniejsze = częstsze powtórki)
    const examMod = 1 - ((examWeight - 5) / 10) * 0.2; // 0.9 - 1.1
    newInterval = Math.round(newInterval * examMod);

    // === LIMITY ===
    newInterval = Math.max(1, Math.min(DEFAULT_PARAMS.maxInterval, newInterval));

    // === OBLICZ DATĘ NASTĘPNEJ POWTÓRKI ===
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        repetitions: newRepetitions,
        easeFactor: Math.round(newEF * 100) / 100,
        interval: newInterval,
        nextReviewDate: nextReviewDate.toISOString(),
        quality
    };
}

/**
 * Sprawdź czy pytanie wymaga powtórki
 */
export function isDueForReview(nextReviewAt: string | null): boolean {
    if (!nextReviewAt) return true;
    return new Date(nextReviewAt) <= new Date();
}

/**
 * Oblicz priorytet powtórki (wyższy = pilniejsze)
 */
export function calculateReviewPriority(nextReviewAt: string | null, examWeight = 5): number {
    if (!nextReviewAt) return 100; // Nigdy nie powtarzane

    const now = new Date();
    const reviewDate = new Date(nextReviewAt);
    const daysOverdue = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
        // Przeterminowane
        return 80 + Math.min(20, daysOverdue * 2) + examWeight;
    } else if (daysOverdue >= -1) {
        // Dziś lub jutro
        return 50 + examWeight;
    } else {
        // W przyszłości
        return Math.max(0, 30 + daysOverdue + examWeight);
    }
}

/**
 * Pobierz modyfikator dla dziedziny prawa
 */
export function getLegalAreaModifier(legalArea: string): number {
    return LEGAL_AREA_MODIFIERS[legalArea] || 1.0;
}

/**
 * Pobierz modyfikator dla typu pytania
 */
export function getQuestionTypeModifier(questionType: string): number {
    return QUESTION_TYPE_MODIFIERS[questionType] || 1.0;
}
