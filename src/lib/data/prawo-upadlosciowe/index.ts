// ============================================================
// PRAWO UPADŁOŚCIOWE - UNIFIED INDEX
// Ustawa z dnia 28 lutego 2003 r. - Prawo upadłościowe
// ============================================================

import { PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1 } from './prawo-upadlosciowe-exam-questions-part1';
import { ExamQuestion } from '../ksh/ksh-exam-questions';

// Re-export the type
export type { ExamQuestion };

// Combine all questions into one array
export const ALL_PRAWO_UPADLOSCIOWE_QUESTIONS: ExamQuestion[] = [
    ...PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1,
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard'
): ExamQuestion[] {
    return ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

/**
 * Get questions filtered by section
 */
export function getQuestionsBySection(sectionName: string): ExamQuestion[] {
    return ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.filter((q) =>
        q.section.toLowerCase().includes(sectionName.toLowerCase())
    );
}

/**
 * Get random questions
 */
export function getRandomQuestions(count: number): ExamQuestion[] {
    const shuffled = [...ALL_PRAWO_UPADLOSCIOWE_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get question statistics
 */
export function getQuestionStats() {
    const total = ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.length;
    const byDifficulty = {
        easy: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.filter(q => q.difficulty === 'easy').length,
        medium: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.filter(q => q.difficulty === 'medium').length,
        hard: ALL_PRAWO_UPADLOSCIOWE_QUESTIONS.filter(q => q.difficulty === 'hard').length,
    };

    return { total, byDifficulty };
}
