'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { StudentProfile } from '@/lib/profiling/types';
import {
    createDefaultProfile,
    loadProfile,
    saveProfile,
    getProfileStats
} from '@/lib/profiling/student-profile';
import { updateProfile } from '@/lib/profiling/profile-updater';
import { processEvent } from '@/lib/profiling/event-processor';
import type { LearningEvent } from '@/lib/profiling/types';

export function useStudentProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load profile on mount
    useEffect(() => {
        async function load() {
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let loadedProfile = await loadProfile(user.uid);

                if (!loadedProfile) {
                    // Create new profile for new user
                    loadedProfile = createDefaultProfile(user.uid);
                    await saveProfile(loadedProfile);
                }

                setProfile(loadedProfile);
            } catch (err) {
                console.error('Failed to load profile:', err);
                setError('Nie udało się załadować profilu');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user?.uid]);

    // Process learning event and update profile
    const recordEvent = useCallback(async (event: LearningEvent) => {
        if (!profile || !user?.uid) return;

        try {
            // Process the event
            const features = processEvent(event, user.uid);

            if (features) {
                // Update profile with BKT
                const updatedProfile = updateProfile(profile, features);
                setProfile(updatedProfile);

                // Save to database (debounced in production)
                await saveProfile(updatedProfile);
            }
        } catch (err) {
            console.error('Failed to record event:', err);
        }
    }, [profile, user?.uid]);

    // Record question answer
    const recordAnswer = useCallback(async (params: {
        questionId: string;
        topic: string;
        subtopic?: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        difficulty: number;
        timeToAnswer: number;
        timeToFirstClick?: number;
        changedAnswer?: boolean;
    }) => {
        const event: LearningEvent = {
            type: 'question_response',
            questionId: params.questionId,
            topic: params.topic,
            subtopic: params.subtopic,
            selectedAnswer: params.selectedAnswer,
            correctAnswer: params.correctAnswer,
            isCorrect: params.isCorrect,
            questionDifficulty: params.difficulty,
            timeToAnswer: params.timeToAnswer,
            timeToFirstClick: params.timeToFirstClick || params.timeToAnswer,
            changedAnswer: params.changedAnswer || false,
            hesitationEvents: 0,
            usedHint: false,
            expandedExplanation: false,
            timestamp: new Date(),
            sessionId: 'session_' + Date.now(),
            questionsInSession: 1
        };

        await recordEvent(event);
    }, [recordEvent]);

    // Get profile statistics
    const stats = profile ? getProfileStats(profile) : null;

    // Force refresh
    const refresh = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        const loadedProfile = await loadProfile(user.uid);
        if (loadedProfile) {
            setProfile(loadedProfile);
        }
        setLoading(false);
    }, [user?.uid]);

    return {
        profile,
        loading,
        error,
        stats,
        recordAnswer,
        recordEvent,
        refresh
    };
}
