// Types for LexCapital Pro

import { Timestamp } from 'firebase/firestore';

// ============ ENUMS ============

export type UserTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'trialing'
    | 'unpaid';

export type LegalDomain =
    | 'prawo_cywilne'
    | 'prawo_karne'
    | 'prawo_handlowe'
    | 'procedura_cywilna'
    | 'procedura_karna'
    | 'prawo_konstytucyjne'
    | 'prawo_administracyjne'
    | 'prawo_pracy'
    | 'prawo_upadlosciowe';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SessionType = 'flashcards' | 'exam' | 'quick_quiz' | 'ai_practice';

// ============ USER ============

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL: string | null;

    tier: UserTier;
    stripeCustomerId: string | null;
    subscriptionStatus: SubscriptionStatus | null;
    subscriptionEndDate: Date | null;

    stats: UserStats;
    domainProgress: Record<LegalDomain, DomainProgress>;

    examDate: Date | null;
    dailyGoal: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening';

    privacy: {
        showOnLeaderboard: boolean;
        publicProfile: boolean;
    };

    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    onboardingCompleted: boolean;
}

export interface UserStats {
    knowledgeEquity: number;
    retentionIndex: number;
    accuracy: number;
    streak: number;
    longestStreak: number;
    totalStudyTime: number;
    totalQuestionsAnswered: number;
    totalFlashcardsReviewed: number;
    lastStudyDate: Date | null;
}

export interface DomainProgress {
    score: number;
    totalCards: number;
    masteredCards: number;
    lastStudied: Date;
}

// ============ FLASHCARDS ============

export interface Flashcard {
    id: string;
    userId?: string;

    question: string;
    answer: string;
    legalReference: string;
    explanation: string | null;

    domain: LegalDomain;
    tags: string[];
    difficulty: Difficulty;

    srs: SRSData;
    stats: FlashcardStats;

    source: 'user' | 'global' | 'ai_generated' | 'marketplace';
    sourceId: string | null;

    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
}

export interface SRSData {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
    lastReview: Date | null;
}

export interface FlashcardStats {
    timesReviewed: number;
    timesCorrect: number;
    timesIncorrect: number;
    averageResponseTime: number;
}

// ============ EXAMS ============

export interface ExamQuestion {
    id: string;
    text: string;
    options: ExamOption[];
    explanation: string;
    legalBasis: string[];
    domain: LegalDomain;
    difficulty: Difficulty;
}

export interface ExamOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface ExamResult {
    id: string;
    userId: string;
    examId: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    completedAt: Date;
}

// ============ SESSIONS ============

export interface StudySession {
    id: string;
    userId: string;
    type: SessionType;
    startedAt: Date;
    endedAt: Date | null;
    duration: number;
    results: SessionResults;
    equityChange: number;
}

export interface SessionResults {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    averageResponseTime: number;
}

// ============ LEADERBOARD ============

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    photoURL: string | null;
    knowledgeEquity: number;
    streak: number;
    accuracy: number;
    rankChange: number;
}

// ============ ACHIEVEMENTS ============

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    unlockedAt?: Date;
    progress?: number;
}

// ============ ACTIVITY ============

export interface Activity {
    id: string;
    type: 'achievement' | 'milestone' | 'domain' | 'rank';
    icon: string;
    title: string;
    description: string;
    time: string;
    color: string;
}
