// ============================================================
// KSH EXAM QUESTIONS - UNIFIED INDEX
// Kodeks Spółek Handlowych - Complete Question Bank
// ~500+ questions covering all KSH articles
// ============================================================

// Import all question parts
import { KSH_EXAM_QUESTIONS as PART1, type ExamQuestion } from './ksh-exam-questions';
import { KSH_EXAM_QUESTIONS_PART2 } from './ksh-exam-questions-part2';
import { KSH_EXAM_QUESTIONS_PART3 } from './ksh-exam-questions-part3';
import { KSH_EXAM_QUESTIONS_PART4 } from './ksh-exam-questions-part4';
import { KSH_EXAM_QUESTIONS_PART5 } from './ksh-exam-questions-part5';
import { KSH_EXAM_QUESTIONS_PART6 } from './ksh-exam-questions-part6';

// Re-export the type
export type { ExamQuestion };

// Combine all questions into one array
export const ALL_KSH_QUESTIONS: ExamQuestion[] = [
    ...PART1,
    ...KSH_EXAM_QUESTIONS_PART2,
    ...KSH_EXAM_QUESTIONS_PART3,
    ...KSH_EXAM_QUESTIONS_PART4,
    ...KSH_EXAM_QUESTIONS_PART5,
    ...KSH_EXAM_QUESTIONS_PART6,
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
    return ALL_KSH_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

/**
 * Get questions filtered by section (e.g., "Tytuł II - Spółka jawna")
 */
export function getQuestionsBySection(sectionName: string): ExamQuestion[] {
    return ALL_KSH_QUESTIONS.filter((q) =>
        q.section.toLowerCase().includes(sectionName.toLowerCase())
    );
}

/**
 * Get questions filtered by article (e.g., "Art. 151")
 */
export function getQuestionsByArticle(articleNumber: string): ExamQuestion[] {
    return ALL_KSH_QUESTIONS.filter((q) =>
        q.article.includes(articleNumber)
    );
}

/**
 * Get questions filtered by tags
 */
export function getQuestionsByTags(tags: string[]): ExamQuestion[] {
    return ALL_KSH_QUESTIONS.filter((q) =>
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
    let pool = [...ALL_KSH_QUESTIONS];

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

export const KSH_SECTIONS = [
    { id: 'tytul-i', name: 'Tytuł I - Przepisy ogólne', articles: 'Art. 1-21' },
    { id: 'tytul-ii', name: 'Tytuł II - Spółka jawna', articles: 'Art. 22-85' },
    { id: 'tytul-iii', name: 'Tytuł III - Spółka partnerska', articles: 'Art. 86-101' },
    { id: 'tytul-iv', name: 'Tytuł IV - Spółka komandytowa', articles: 'Art. 102-124' },
    { id: 'tytul-v', name: 'Tytuł V - Spółka komandytowo-akcyjna', articles: 'Art. 125-150' },
    { id: 'tytul-iii-dzial-i', name: 'Tytuł III Dział I - Spółka z o.o.', articles: 'Art. 151-300' },
    { id: 'tytul-iii-dzial-ia', name: 'Tytuł III Dział Ia - PSA', articles: 'Art. 3001-300134' },
    { id: 'tytul-iii-dzial-ii', name: 'Tytuł III Dział II - Spółka akcyjna', articles: 'Art. 301-490' },
    { id: 'tytul-iv-holding', name: 'Tytuł IV - Łączenie, podział, przekształcanie', articles: 'Art. 491-584' },
] as const;

// ============================================================
// STATISTICS
// ============================================================

export function getQuestionStats() {
    const byDifficulty = {
        easy: ALL_KSH_QUESTIONS.filter((q) => q.difficulty === 'easy').length,
        medium: ALL_KSH_QUESTIONS.filter((q) => q.difficulty === 'medium').length,
        hard: ALL_KSH_QUESTIONS.filter((q) => q.difficulty === 'hard').length,
    };

    const sections = new Map<string, number>();
    ALL_KSH_QUESTIONS.forEach((q) => {
        sections.set(q.section, (sections.get(q.section) || 0) + 1);
    });

    return {
        total: ALL_KSH_QUESTIONS.length,
        byDifficulty,
        bySection: Object.fromEntries(sections),
    };
}
