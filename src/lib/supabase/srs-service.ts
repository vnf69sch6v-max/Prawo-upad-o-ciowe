/**
 * SRS (Spaced Repetition System) Service for Supabase
 * Manages flashcard SRS state in database
 */

import { supabase, isSupabaseAvailable } from './client';
import { calculateNextReview, getDefaultSRSState, type SRSCard } from '@/lib/srs';

export interface SRSCardDB {
    id: string;
    user_id: string;
    question_id: string;
    domain: string;
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    next_review: string;
    last_review: string | null;
    total_reviews: number;
    correct_reviews: number;
    created_at: string;
    updated_at: string;
}

/**
 * Convert DB row to SRSCard interface
 */
function dbToSRSCard(row: SRSCardDB): SRSCard {
    return {
        questionId: row.question_id,
        domain: row.domain,
        easeFactor: row.ease_factor,
        intervalDays: row.interval_days,
        repetitions: row.repetitions,
        nextReview: new Date(row.next_review),
        lastReview: row.last_review ? new Date(row.last_review) : null,
        totalReviews: row.total_reviews,
        correctReviews: row.correct_reviews,
    };
}

/**
 * Get cards due for review today
 */
export async function getDueCards(
    userId: string,
    limit: number = 20
): Promise<SRSCard[]> {
    if (!isSupabaseAvailable()) return [];

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('flashcard_srs')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review', now)
        .order('next_review', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching due cards:', error);
        return [];
    }

    return (data || []).map(dbToSRSCard);
}

/**
 * Get count of cards due for review
 */
export async function getDueCardCount(userId: string): Promise<number> {
    if (!isSupabaseAvailable()) return 0;

    const now = new Date().toISOString();

    const { count, error } = await supabase
        .from('flashcard_srs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('next_review', now);

    if (error) {
        console.error('Error counting due cards:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Get or create SRS card for a question
 */
export async function getOrCreateSRSCard(
    userId: string,
    questionId: string,
    domain: string
): Promise<SRSCard | null> {
    if (!isSupabaseAvailable()) return null;

    // Try to get existing
    const { data: existing } = await supabase
        .from('flashcard_srs')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

    if (existing) {
        return dbToSRSCard(existing);
    }

    // Create new
    const defaults = getDefaultSRSState();
    const now = new Date();

    const { data: created, error } = await supabase
        .from('flashcard_srs')
        .insert({
            user_id: userId,
            question_id: questionId,
            domain,
            ease_factor: defaults.easeFactor,
            interval_days: defaults.intervalDays,
            repetitions: defaults.repetitions,
            next_review: now.toISOString(),
            last_review: null,
            total_reviews: 0,
            correct_reviews: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating SRS card:', error);
        return null;
    }

    return created ? dbToSRSCard(created) : null;
}

/**
 * Update SRS card after review
 */
export async function updateSRSCard(
    userId: string,
    questionId: string,
    quality: number // 0-5
): Promise<SRSCard | null> {
    if (!isSupabaseAvailable()) return null;

    // Get current state
    const { data: current } = await supabase
        .from('flashcard_srs')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

    if (!current) {
        console.error('SRS card not found for update');
        return null;
    }

    // Calculate new values using SM-2
    const update = calculateNextReview(quality, {
        easeFactor: current.ease_factor,
        intervalDays: current.interval_days,
        repetitions: current.repetitions,
    });

    const isCorrect = quality >= 3;
    const now = new Date();

    // Update in database
    const { data: updated, error } = await supabase
        .from('flashcard_srs')
        .update({
            ease_factor: update.easeFactor,
            interval_days: update.intervalDays,
            repetitions: update.repetitions,
            next_review: update.nextReview.toISOString(),
            last_review: now.toISOString(),
            total_reviews: current.total_reviews + 1,
            correct_reviews: current.correct_reviews + (isCorrect ? 1 : 0),
            updated_at: now.toISOString(),
        })
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .select()
        .single();

    if (error) {
        console.error('Error updating SRS card:', error);
        return null;
    }

    return updated ? dbToSRSCard(updated) : null;
}

/**
 * Get SRS statistics for a user
 */
export async function getSRSStats(userId: string): Promise<{
    totalCards: number;
    dueToday: number;
    learnedCards: number; // Cards with at least 1 successful review
    averageEaseFactor: number;
}> {
    if (!isSupabaseAvailable()) {
        return { totalCards: 0, dueToday: 0, learnedCards: 0, averageEaseFactor: 2.5 };
    }

    const now = new Date().toISOString();

    // Get all user cards
    const { data: cards } = await supabase
        .from('flashcard_srs')
        .select('*')
        .eq('user_id', userId);

    if (!cards || cards.length === 0) {
        return { totalCards: 0, dueToday: 0, learnedCards: 0, averageEaseFactor: 2.5 };
    }

    const totalCards = cards.length;
    const dueToday = cards.filter(c => new Date(c.next_review) <= new Date()).length;
    const learnedCards = cards.filter(c => c.repetitions > 0).length;
    const avgEase = cards.reduce((sum, c) => sum + c.ease_factor, 0) / cards.length;

    return {
        totalCards,
        dueToday,
        learnedCards,
        averageEaseFactor: Math.round(avgEase * 100) / 100,
    };
}

/**
 * Initialize multiple cards for SRS (batch operation)
 */
export async function initializeSRSCards(
    userId: string,
    questions: Array<{ questionId: string; domain: string }>
): Promise<number> {
    if (!isSupabaseAvailable() || questions.length === 0) return 0;

    const defaults = getDefaultSRSState();
    const now = new Date();

    // Filter out existing cards
    const { data: existing } = await supabase
        .from('flashcard_srs')
        .select('question_id')
        .eq('user_id', userId)
        .in('question_id', questions.map(q => q.questionId));

    const existingIds = new Set((existing || []).map(e => e.question_id));
    const newQuestions = questions.filter(q => !existingIds.has(q.questionId));

    if (newQuestions.length === 0) return 0;

    const rows = newQuestions.map(q => ({
        user_id: userId,
        question_id: q.questionId,
        domain: q.domain,
        ease_factor: defaults.easeFactor,
        interval_days: defaults.intervalDays,
        repetitions: defaults.repetitions,
        next_review: now.toISOString(),
        last_review: null,
        total_reviews: 0,
        correct_reviews: 0,
    }));

    const { error } = await supabase
        .from('flashcard_srs')
        .insert(rows);

    if (error) {
        console.error('Error initializing SRS cards:', error);
        return 0;
    }

    return newQuestions.length;
}
