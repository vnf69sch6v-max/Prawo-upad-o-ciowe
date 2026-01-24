// ============================================================
// ASO EXAM QUESTIONS - UNIFIED INDEX
// Certyfikat Doradcy w Alternatywnym Systemie Obrotu
// 250 questions covering ASO regulations
// ============================================================

// Import all questions
import { ASO_EXAM_QUESTIONS, type ExamQuestion, DATABASE_STATS } from './aso-exam-questions';

// Re-export the type
export type { ExamQuestion };

// Export all questions
export const ALL_ASO_QUESTIONS: ExamQuestion[] = ASO_EXAM_QUESTIONS;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard'
): ExamQuestion[] {
    return ALL_ASO_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

/**
 * Get questions filtered by section
 */
export function getQuestionsBySection(sectionName: string): ExamQuestion[] {
    return ALL_ASO_QUESTIONS.filter((q) =>
        q.section.toLowerCase().includes(sectionName.toLowerCase())
    );
}

/**
 * Get questions filtered by article/source
 */
export function getQuestionsByArticle(articleRef: string): ExamQuestion[] {
    return ALL_ASO_QUESTIONS.filter((q) =>
        q.article.includes(articleRef)
    );
}

/**
 * Get questions filtered by tags
 */
export function getQuestionsByTags(tags: string[]): ExamQuestion[] {
    return ALL_ASO_QUESTIONS.filter((q) =>
        tags.some((tag) => q.tags.includes(tag))
    );
}

/**
 * Get random questions for an exam
 */
export function getRandomQuestions(
    count: number,
    options?: {
        difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
        sections?: string[];
    }
): ExamQuestion[] {
    let pool = [...ALL_ASO_QUESTIONS];

    // Filter by difficulty if specified
    if (options?.difficulty && options.difficulty !== 'mixed') {
        pool = pool.filter((q) => q.difficulty === options.difficulty);
    }

    // Filter by sections if specified
    if (options?.sections && options.sections.length > 0) {
        pool = pool.filter((q) =>
            options.sections!.some((s) =>
                q.section.toLowerCase().includes(s.toLowerCase())
            )
        );
    }

    // Shuffle using Fisher-Yates algorithm
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Generate a balanced exam with mixed difficulty
 */
export function generateBalancedExam(
    totalQuestions: number = 30,
    easyPercent: number = 30,
    mediumPercent: number = 50,
    hardPercent: number = 20
): ExamQuestion[] {
    const easyCount = Math.round((totalQuestions * easyPercent) / 100);
    const mediumCount = Math.round((totalQuestions * mediumPercent) / 100);
    const hardCount = totalQuestions - easyCount - mediumCount;

    const easy = getRandomQuestions(easyCount, { difficulty: 'easy' });
    const medium = getRandomQuestions(mediumCount, { difficulty: 'medium' });
    const hard = getRandomQuestions(hardCount, { difficulty: 'hard' });

    // Combine and shuffle final order
    const exam = [...easy, ...medium, ...hard];
    for (let i = exam.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [exam[i], exam[j]] = [exam[j], exam[i]];
    }

    return exam;
}

// ============================================================
// SECTIONS INFO
// ============================================================

export const ASO_SECTIONS = [
    { id: 'regulamin-aso', name: 'Regulamin ASO', description: 'Przepisy ogólne i organizacyjne' },
    { id: 'zalacznik-1', name: 'Załącznik Nr 1 - Dokument informacyjny', description: 'Wymogi dokumentacyjne' },
    { id: 'zalacznik-3', name: 'Załącznik Nr 3 - Obowiązki informacyjne', description: 'Raportowanie bieżące i okresowe' },
    { id: 'zalacznik-5', name: 'Załącznik Nr 5 - Autoryzowany Doradca', description: 'Obowiązki i uprawnienia AD' },
    { id: 'ustawy', name: 'Ustawy', description: 'Ustawa o obrocie, o ofercie, o obligacjach' },
    { id: 'mar', name: 'Rozporządzenie MAR', description: 'Informacje poufne i insider trading' },
    { id: 'catalyst', name: 'Catalyst', description: 'Rynek obligacji' },
    { id: 'wskazniki', name: 'Wskaźniki finansowe', description: 'Analiza finansowa i wycena' },
] as const;

// ============================================================
// STATISTICS
// ============================================================

export function getQuestionStats() {
    const byDifficulty = {
        easy: ALL_ASO_QUESTIONS.filter((q) => q.difficulty === 'easy').length,
        medium: ALL_ASO_QUESTIONS.filter((q) => q.difficulty === 'medium').length,
        hard: ALL_ASO_QUESTIONS.filter((q) => q.difficulty === 'hard').length,
    };

    const sections = new Map<string, number>();
    ALL_ASO_QUESTIONS.forEach((q) => {
        sections.set(q.section, (sections.get(q.section) || 0) + 1);
    });

    return {
        total: ALL_ASO_QUESTIONS.length,
        byDifficulty,
        bySection: Object.fromEntries(sections),
    };
}

// Re-export database stats
export { DATABASE_STATS };
