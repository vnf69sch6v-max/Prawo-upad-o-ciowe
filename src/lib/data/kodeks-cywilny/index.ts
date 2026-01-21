// ============================================================
// KODEKS CYWILNY - UNIFIED INDEX
// ============================================================

import type { ExamQuestion } from '../ksh';

import { KC_EXAM_QUESTIONS_PART1 } from './kc-questions-part1';
import { KC_EXAM_QUESTIONS_PART2 } from './kc-questions-part2';
import { KC_EXAM_QUESTIONS_PART3 } from './kc-questions-part3';
import { KC_EXAM_QUESTIONS_PART4 } from './kc-questions-part4';
import { KC_EXAM_QUESTIONS_PART5 } from './kc-questions-part5';
import { KC_EXAM_QUESTIONS_PART6 } from './kc-questions-part6';
import { KC_EXAM_QUESTIONS_PART7 } from './kc-questions-part7';
import { KC_EXAM_QUESTIONS_PART8 } from './kc-questions-part8';

export const ALL_KC_QUESTIONS: ExamQuestion[] = [
    ...KC_EXAM_QUESTIONS_PART1,
    ...KC_EXAM_QUESTIONS_PART2,
    ...KC_EXAM_QUESTIONS_PART3,
    ...KC_EXAM_QUESTIONS_PART4,
    ...KC_EXAM_QUESTIONS_PART5,
    ...KC_EXAM_QUESTIONS_PART6,
    ...KC_EXAM_QUESTIONS_PART7,
    ...KC_EXAM_QUESTIONS_PART8,
];

export function getKCRandomQuestions(count: number): ExamQuestion[] {
    const shuffled = [...ALL_KC_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getKCQuestionStats() {
    const total = ALL_KC_QUESTIONS.length;
    const byDifficulty = {
        easy: ALL_KC_QUESTIONS.filter(q => q.difficulty === 'easy').length,
        medium: ALL_KC_QUESTIONS.filter(q => q.difficulty === 'medium').length,
        hard: ALL_KC_QUESTIONS.filter(q => q.difficulty === 'hard').length,
    };
    return { total, byDifficulty };
}

export type { ExamQuestion };
