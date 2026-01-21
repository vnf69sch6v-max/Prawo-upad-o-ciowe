'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import {
    isSupabaseAvailable,
    getDueCards,
    getDueCardCount,
    getOrCreateSRSCard,
    updateSRSCard,
    getSRSStats,
    initializeSRSCards,
} from '@/lib/supabase';
import type { SRSCard } from '@/lib/srs';

export interface UseSRSReturn {
    // State
    dueCards: SRSCard[];
    dueCount: number;
    stats: {
        totalCards: number;
        dueToday: number;
        learnedCards: number;
        averageEaseFactor: number;
    };
    loading: boolean;

    // Actions
    loadDueCards: (limit?: number) => Promise<void>;
    reviewCard: (questionId: string, quality: number) => Promise<SRSCard | null>;
    initializeCards: (questions: Array<{ questionId: string; domain: string }>) => Promise<number>;
    refreshStats: () => Promise<void>;
}

export function useSRS(): UseSRSReturn {
    const { user } = useAuth();
    const [dueCards, setDueCards] = useState<SRSCard[]>([]);
    const [dueCount, setDueCount] = useState(0);
    const [stats, setStats] = useState({
        totalCards: 0,
        dueToday: 0,
        learnedCards: 0,
        averageEaseFactor: 2.5,
    });
    const [loading, setLoading] = useState(true);

    // Load due count on mount
    const refreshStats = useCallback(async () => {
        if (!user || !isSupabaseAvailable()) {
            setLoading(false);
            return;
        }

        try {
            const [count, statsData] = await Promise.all([
                getDueCardCount(user.uid),
                getSRSStats(user.uid),
            ]);
            setDueCount(count);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading SRS stats:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    // Load due cards
    const loadDueCards = useCallback(async (limit: number = 20) => {
        if (!user || !isSupabaseAvailable()) return;

        setLoading(true);
        try {
            const cards = await getDueCards(user.uid, limit);
            setDueCards(cards);
            setDueCount(cards.length);
        } catch (error) {
            console.error('Error loading due cards:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Review a card
    const reviewCard = useCallback(async (
        questionId: string,
        quality: number
    ): Promise<SRSCard | null> => {
        if (!user || !isSupabaseAvailable()) return null;

        const updated = await updateSRSCard(user.uid, questionId, quality);

        if (updated) {
            // Remove from due cards list
            setDueCards(prev => prev.filter(c => c.questionId !== questionId));
            setDueCount(prev => Math.max(0, prev - 1));
        }

        return updated;
    }, [user]);

    // Initialize cards for SRS
    const initializeCards = useCallback(async (
        questions: Array<{ questionId: string; domain: string }>
    ): Promise<number> => {
        if (!user || !isSupabaseAvailable()) return 0;

        const count = await initializeSRSCards(user.uid, questions);

        // Refresh stats after initialization
        await refreshStats();

        return count;
    }, [user, refreshStats]);

    return {
        dueCards,
        dueCount,
        stats,
        loading,
        loadDueCards,
        reviewCard,
        initializeCards,
        refreshStats,
    };
}
