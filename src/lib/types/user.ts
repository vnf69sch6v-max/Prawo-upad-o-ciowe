// User Profile Types for LexCapital Pro

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;

    // Subscription
    subscription: {
        plan: 'free' | 'pro' | 'premium';
        status: 'active' | 'cancelled' | 'expired';
        expiresAt?: Date;
    };

    // Stats
    stats: UserStats;

    // Preferences
    preferences: UserPreferences;
}

export interface UserStats {
    // Knowledge
    knowledgeEquity: number;      // Main metric - total "knowledge value"
    totalQuestions: number;       // Total questions answered
    correctAnswers: number;       // Correct answers count

    // Streaks
    currentStreak: number;        // Days in a row
    longestStreak: number;        // Best streak ever
    lastStudyDate?: Date;         // For streak calculation

    // Time
    totalStudyTime: number;       // Total minutes studied

    // Exams
    examsCompleted: number;
    examsPassed: number;
    bestExamScore: number;

    // Domains mastery (percentage 0-100)
    domainMastery: {
        [domain: string]: number;
    };
}

export interface UserPreferences {
    theme: 'dark' | 'light' | 'system';
    language: 'pl' | 'en';
    dailyGoal: number;            // Minutes per day
    notifications: boolean;
    soundEffects: boolean;
}

export interface StudySession {
    id: string;
    uid: string;
    startedAt: Date;
    endedAt?: Date;
    type: 'flashcard' | 'exam' | 'practice';

    // Results
    questionsAnswered: number;
    correctAnswers: number;

    // For flashcards
    cardsReviewed?: number;

    // For exams
    examId?: string;
    examTitle?: string;
    score?: number;
    passed?: boolean;
}

export interface ExamResult {
    id: string;
    uid: string;
    examId: string;
    examTitle: string;
    completedAt: Date;

    // Scores
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;          // Seconds

    // Detailed results
    questionResults?: QuestionResult[];
}

export interface QuestionResult {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    article?: string;
    timeSpent?: number;
}

export interface ActivityItem {
    id: string;
    uid: string;
    type: 'exam_completed' | 'streak_milestone' | 'achievement' | 'study_session' | 'flashcard_mastered';
    title: string;
    description: string;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL?: string;
    knowledgeEquity: number;
    rank: number;
    rankChange: number;         // +/- from last week
    currentStreak: number;
}

// Default values for new users
export const DEFAULT_USER_STATS: UserStats = {
    knowledgeEquity: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0,
    examsCompleted: 0,
    examsPassed: 0,
    bestExamScore: 0,
    domainMastery: {},
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    theme: 'dark',
    language: 'pl',
    dailyGoal: 30,
    notifications: true,
    soundEffects: false,
};
