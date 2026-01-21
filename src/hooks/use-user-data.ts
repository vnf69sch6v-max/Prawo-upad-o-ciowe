'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import {
    isSupabaseAvailable,
    ensureUserProfile,
    getUserStatistics,
    getWrongAnswers,
    getLearningProgress,
    saveTestResult as saveTestResultService,
    saveWrongAnswer as saveWrongAnswerService,
    markAnswerCorrect as markAnswerCorrectService,
    removeWrongAnswer as removeWrongAnswerService,
    clearWrongAnswers as clearWrongAnswersService,
    updateLearningProgress as updateLearningProgressService,
    getTestHistory as getTestHistoryService,
    type WrongAnswer,
    type LearningProgress,
    type UserStatistics,
    type SaveTestResultInput,
} from '@/lib/supabase';

export interface UseUserDataReturn {
    // State
    stats: UserStatistics | null;
    wrongAnswers: WrongAnswer[];
    learningProgress: LearningProgress[];
    loading: boolean;

    // Actions
    saveTestResult: (input: Omit<SaveTestResultInput, 'userId'>) => Promise<string | null>;
    saveWrongAnswer: (questionId: string, domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne') => Promise<void>;
    markAnswerCorrect: (questionId: string) => Promise<void>;
    removeWrongAnswer: (questionId: string) => Promise<void>;
    clearAllWrongAnswers: () => Promise<void>;
    updateProgress: (topic: string, scorePercent: number, wrong: string[], correct: string[]) => Promise<void>;
    getTestHistory: (limit?: number) => Promise<SaveTestResultInput[]>;
    refreshData: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<UserStatistics | null>(null);
    const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
    const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all user data
    const fetchUserData = useCallback(async () => {
        if (!user || !isSupabaseAvailable()) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Ensure profile exists in Supabase
            await ensureUserProfile(
                user.uid,
                user.email || '',
                profile?.displayName || user.displayName || 'User'
            );

            // Fetch all data in parallel
            const [statsData, wrongData, progressData] = await Promise.all([
                getUserStatistics(user.uid),
                getWrongAnswers(user.uid),
                getLearningProgress(user.uid),
            ]);

            setStats(statsData);
            setWrongAnswers(wrongData);
            setLearningProgress(progressData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, profile?.displayName]);

    // Initial fetch
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Save test result
    const saveTestResult = useCallback(async (
        input: Omit<SaveTestResultInput, 'userId'>
    ): Promise<string | null> => {
        if (!user) return null;

        const result = await saveTestResultService({
            ...input,
            userId: user.uid,
        });

        // Refresh stats after saving
        const newStats = await getUserStatistics(user.uid);
        if (newStats) setStats(newStats);

        return result;
    }, [user]);

    // Save wrong answer
    const saveWrongAnswer = useCallback(async (
        questionId: string,
        domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne'
    ): Promise<void> => {
        if (!user) return;

        await saveWrongAnswerService(user.uid, questionId, domain);

        // Refresh wrong answers
        const newWrongAnswers = await getWrongAnswers(user.uid);
        setWrongAnswers(newWrongAnswers);
    }, [user]);

    // Mark answer as correct (for weak points review)
    const markAnswerCorrect = useCallback(async (questionId: string): Promise<void> => {
        if (!user) return;

        await markAnswerCorrectService(user.uid, questionId);

        // Refresh wrong answers
        const newWrongAnswers = await getWrongAnswers(user.uid);
        setWrongAnswers(newWrongAnswers);
    }, [user]);

    // Remove single wrong answer
    const removeWrongAnswer = useCallback(async (questionId: string): Promise<void> => {
        if (!user) return;

        await removeWrongAnswerService(user.uid, questionId);
        setWrongAnswers(prev => prev.filter(wa => wa.questionId !== questionId));
    }, [user]);

    // Clear all wrong answers
    const clearAllWrongAnswers = useCallback(async (): Promise<void> => {
        if (!user) return;

        await clearWrongAnswersService(user.uid);
        setWrongAnswers([]);
    }, [user]);

    // Update learning progress
    const updateProgress = useCallback(async (
        topic: string,
        scorePercent: number,
        subtopicsWrong: string[],
        subtopicsCorrect: string[]
    ): Promise<void> => {
        if (!user) return;

        await updateLearningProgressService(
            user.uid,
            topic,
            scorePercent,
            subtopicsWrong,
            subtopicsCorrect
        );

        // Refresh progress
        const newProgress = await getLearningProgress(user.uid);
        setLearningProgress(newProgress);
    }, [user]);

    // Get test history
    const getTestHistory = useCallback(async (limit: number = 10): Promise<SaveTestResultInput[]> => {
        if (!user) return [];
        return getTestHistoryService(user.uid, limit);
    }, [user]);

    // Refresh all data
    const refreshData = useCallback(async (): Promise<void> => {
        await fetchUserData();
    }, [fetchUserData]);

    return {
        stats,
        wrongAnswers,
        learningProgress,
        loading,
        saveTestResult,
        saveWrongAnswer,
        markAnswerCorrect,
        removeWrongAnswer,
        clearAllWrongAnswers,
        updateProgress,
        getTestHistory,
        refreshData,
    };
}
