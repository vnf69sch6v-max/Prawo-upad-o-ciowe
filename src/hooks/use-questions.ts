'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { shuffleArray } from '@/lib/utils/helpers';

export interface Question {
    id: string;
    category_id: string | null;
    question_text: string;
    question_type: 'single_choice' | 'multiple_choice' | 'true_false';
    answers: Array<{ id: string; text: string; is_correct: boolean }>;
    correct_answer_ids: string[];
    explanation: string | null;
    explanation_detailed: string | null;
    legal_basis: string | null;
    legal_area: string;
    difficulty: number;
    is_premium: boolean;
}

interface UseQuestionsOptions {
    categoryId?: string;
    legalArea?: string;
    difficulty?: number;
    limit?: number;
    shuffle?: boolean;
}

export function useQuestions(options: UseQuestionsOptions = {}) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = useCallback(async (overrideOptions?: UseQuestionsOptions) => {
        const opts = { ...options, ...overrideOptions };

        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('questions')
                .select('*')
                .eq('is_active', true);

            if (opts.categoryId) {
                query = query.eq('category_id', opts.categoryId);
            }

            if (opts.legalArea) {
                query = query.eq('legal_area', opts.legalArea);
            }

            if (opts.difficulty) {
                query = query.gte('difficulty', opts.difficulty - 1)
                    .lte('difficulty', opts.difficulty + 1);
            }

            if (opts.limit) {
                query = query.limit(opts.limit);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            let questionsData = data || [];

            if (opts.shuffle) {
                questionsData = shuffleArray(questionsData);
            }

            setQuestions(questionsData);
            return questionsData;
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError('Nie udało się pobrać pytań');
            return [];
        } finally {
            setLoading(false);
        }
    }, [options]);

    // Get random questions for review
    const getRandomQuestions = async (count: number): Promise<Question[]> => {
        const { data, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('is_active', true)
            .limit(count * 2); // Fetch more and shuffle

        if (fetchError || !data) return [];

        return shuffleArray(data).slice(0, count);
    };

    // Get questions by IDs
    const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
        const { data, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .in('id', ids);

        if (fetchError || !data) return [];
        return data;
    };

    return {
        questions,
        loading,
        error,
        fetchQuestions,
        getRandomQuestions,
        getQuestionsByIds
    };
}
