/**
 * Student Profile Management
 * Creates, loads, and saves student profiles
 */

import type {
    StudentProfile,
    TopicMastery,
    LearningStyle,
    ErrorPatterns,
    Engagement,
    Predictions,
    ErrorType
} from './types';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════
// DEFAULT PROFILE FACTORY
// ═══════════════════════════════════════════════════════

/**
 * Create a new default student profile
 */
export function createDefaultProfile(userId: string): StudentProfile {
    const now = new Date();

    return {
        meta: {
            id: crypto.randomUUID(),
            userId,
            createdAt: now,
            updatedAt: now,
            version: 1,
            confidenceScore: 0
        },
        knowledgeMap: {},
        learningStyle: createDefaultLearningStyle(),
        errorPatterns: createDefaultErrorPatterns(),
        engagement: createDefaultEngagement(),
        predictions: createDefaultPredictions()
    };
}

function createDefaultLearningStyle(): LearningStyle {
    return {
        preferredFormat: {
            reading: 0.5,
            video: 0.5,
            practice: 0.5,
            discussion: 0.5
        },
        cognitiveStyle: {
            analyticalVsIntuitive: 0,
            sequentialVsGlobal: 0,
            activeVsReflective: 0,
            visualVsVerbal: 0
        },
        solvingStrategies: {
            usesElimination: 0.5,
            readsCarefully: 0.5,
            rushes: 0.5,
            usesHints: 0.5,
            reviewsAfter: 0.5
        },
        optimalConditions: {
            bestTimeOfDay: 'morning',
            optimalSessionLength: 30,
            optimalQuestionCount: 20,
            needsBreaksEvery: 15
        }
    };
}

function createDefaultErrorPatterns(): ErrorPatterns {
    return {
        dominantErrorType: 'conceptual',
        errorTypeDistribution: {
            careless: 0,
            conceptual: 0,
            knowledge_gap: 0,
            confusion: 0,
            partial: 0
        },
        confusionPairs: [],
        weakPrerequisites: [],
        temporalPatterns: {
            errorsIncreaseLateSession: false,
            errorsIncreaseEvening: false,
            errorsAfterBreak: false
        }
    };
}

function createDefaultEngagement(): Engagement {
    return {
        motivationLevel: 50,
        motivationTrend: 'stable',
        churnRisk: 0.3,
        motivators: {
            streaks: 0.5,
            achievements: 0.5,
            progress: 0.5,
            competition: 0.5,
            mastery: 0.5
        },
        currentStreak: 0,
        longestStreak: 0
    };
}

function createDefaultPredictions(): Predictions {
    return {
        predictedExamScore: {
            value: 50,
            confidence: 0,
            range: { min: 30, max: 70 }
        },
        passProbability: 0.5,
        recommendedFocus: [],
        optimalStrategy: {
            focusOnWeakAreas: 0.5,
            maintainStrong: 0.3,
            newTopics: 0.2
        }
    };
}

// ═══════════════════════════════════════════════════════
// DEFAULT TOPIC MASTERY
// ═══════════════════════════════════════════════════════

export function createDefaultTopicMastery(topic: string): TopicMastery {
    return {
        mastery: 50, // Neutral start
        confidence: 0,
        trend: 'stable',
        lastAssessed: null,
        totalAttempts: 0,
        correctAttempts: 0,
        errorDistribution: {
            careless: 0,
            conceptual: 0,
            knowledge_gap: 0,
            confusion: 0,
            partial: 0
        },
        weakSubtopics: [],
        strongSubtopics: [],
        recentHistory: []
    };
}

// ═══════════════════════════════════════════════════════
// PROFILE PERSISTENCE
// ═══════════════════════════════════════════════════════

/**
 * Load profile from Supabase
 */
export async function loadProfile(userId: string): Promise<StudentProfile | null> {
    if (!isSupabaseAvailable()) return null;

    try {
        const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        // Parse JSON fields and reconstruct profile
        return {
            meta: {
                id: data.id,
                userId: data.user_id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                version: data.meta?.version || 1,
                confidenceScore: data.meta?.confidenceScore || 0
            },
            knowledgeMap: data.knowledge_map || {},
            learningStyle: data.learning_style || createDefaultLearningStyle(),
            errorPatterns: data.error_patterns || createDefaultErrorPatterns(),
            engagement: data.engagement || createDefaultEngagement(),
            predictions: data.predictions || createDefaultPredictions()
        };
    } catch (error) {
        console.error('Failed to load profile:', error);
        return null;
    }
}

/**
 * Save profile to Supabase
 */
export async function saveProfile(profile: StudentProfile): Promise<boolean> {
    if (!isSupabaseAvailable()) return false;

    try {
        // Update timestamp
        profile.meta.updatedAt = new Date();

        const { error } = await supabase
            .from('student_profiles')
            .upsert({
                id: profile.meta.id,
                user_id: profile.meta.userId,
                knowledge_map: profile.knowledgeMap,
                learning_style: profile.learningStyle,
                error_patterns: profile.errorPatterns,
                engagement: profile.engagement,
                predictions: profile.predictions,
                meta: {
                    version: profile.meta.version,
                    confidenceScore: profile.meta.confidenceScore
                },
                created_at: profile.meta.createdAt.toISOString(),
                updated_at: profile.meta.updatedAt.toISOString()
            });

        return !error;
    } catch (error) {
        console.error('Failed to save profile:', error);
        return false;
    }
}

/**
 * Get or create profile for user
 */
export async function getOrCreateProfile(userId: string): Promise<StudentProfile> {
    const existing = await loadProfile(userId);
    if (existing) return existing;

    const newProfile = createDefaultProfile(userId);
    await saveProfile(newProfile);
    return newProfile;
}

// ═══════════════════════════════════════════════════════
// PROFILE STATISTICS
// ═══════════════════════════════════════════════════════

/**
 * Calculate profile confidence based on data points
 */
export function calculateProfileConfidence(profile: StudentProfile): number {
    let score = 0;

    // More topics = more confidence
    const topicCount = Object.keys(profile.knowledgeMap).length;
    score += Math.min(0.3, topicCount * 0.03);

    // More attempts = more confidence
    const totalAttempts = Object.values(profile.knowledgeMap)
        .reduce((sum, t) => sum + t.totalAttempts, 0);
    score += Math.min(0.4, totalAttempts * 0.004);

    // More recent activity = more confidence
    const lastAssessed = Object.values(profile.knowledgeMap)
        .map(t => t.lastAssessed)
        .filter(Boolean)
        .sort()
        .pop();

    if (lastAssessed) {
        const daysSince = (Date.now() - new Date(lastAssessed).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 0.3 - daysSince * 0.02);
    }

    return Math.min(1, score);
}

/**
 * Get summary statistics for profile
 */
export function getProfileStats(profile: StudentProfile): {
    totalTopics: number;
    averageMastery: number;
    weakTopicsCount: number;
    strongTopicsCount: number;
    totalAttempts: number;
    overallCorrectRate: number;
} {
    const topics = Object.values(profile.knowledgeMap);

    if (topics.length === 0) {
        return {
            totalTopics: 0,
            averageMastery: 0,
            weakTopicsCount: 0,
            strongTopicsCount: 0,
            totalAttempts: 0,
            overallCorrectRate: 0
        };
    }

    const totalAttempts = topics.reduce((sum, t) => sum + t.totalAttempts, 0);
    const totalCorrect = topics.reduce((sum, t) => sum + t.correctAttempts, 0);

    return {
        totalTopics: topics.length,
        averageMastery: topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length,
        weakTopicsCount: topics.filter(t => t.mastery < 50).length,
        strongTopicsCount: topics.filter(t => t.mastery >= 80).length,
        totalAttempts,
        overallCorrectRate: totalAttempts > 0 ? totalCorrect / totalAttempts : 0
    };
}
