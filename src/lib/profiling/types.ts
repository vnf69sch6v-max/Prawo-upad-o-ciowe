/**
 * Student Profiling System - Types
 * Based on comprehensive profiling document
 */

// ═══════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════

export interface QuestionResponseEvent {
    type: 'question_response';
    questionId: string;
    topic: string;
    subtopic?: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    questionDifficulty: number;
    examWeight?: number;
    // Timing
    timeToFirstClick: number;   // ms
    timeToAnswer: number;       // ms
    timeReadingExplanation?: number;
    // Behavior
    changedAnswer: boolean;
    originalAnswer?: string;
    hesitationEvents: number;   // times changed answer
    eliminatedOptions?: string[];
    usedHint: boolean;
    expandedExplanation: boolean;
    // Context
    timestamp: Date;
    sessionId: string;
    questionsInSession: number;
}

export interface SessionEvent {
    type: 'session_start' | 'session_end' | 'session_pause';
    sessionId: string;
    timestamp: Date;
    duration?: number;          // ms
    questionsAnswered?: number;
    correctAnswers?: number;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export interface FeedbackEvent {
    type: 'feedback';
    questionId: string;
    wasHelpful?: boolean;
    wasTooHard?: boolean;
    wasTooEasy?: boolean;
    comment?: string;
    timestamp: Date;
}

export type LearningEvent = QuestionResponseEvent | SessionEvent | FeedbackEvent;

// ═══════════════════════════════════════════════════════
// EXTRACTED FEATURES
// ═══════════════════════════════════════════════════════

export interface ConfidenceIndicators {
    quickAndCorrect: boolean;
    slowAndCorrect: boolean;
    hesitation: boolean;
    firstInstinctCorrect: boolean;
    studiedExplanation: boolean;
}

export interface TopicKnowledgeFeatures {
    topic: string;
    subtopic?: string;
    wasCorrect: boolean;
    difficulty: number;
    weightedScore: number;
    isFirstExposure: boolean;
}

export type ErrorType = 'careless' | 'conceptual' | 'knowledge_gap' | 'confusion' | 'partial';

export interface ErrorFeatures {
    errorType: ErrorType;
    confusedWith: string;
    correctWas: string;
    isRepeatError: boolean;
    errorCategory: string;
}

export interface LearningStyleIndicators {
    usesElimination: boolean;
    readsFullQuestion: boolean;
    skipsExplanations: boolean;
    usesHints: boolean;
    prefersDepth: boolean;
}

export interface ExtractedFeatures {
    userId: string;
    timestamp: Date;
    confidenceIndicators?: ConfidenceIndicators;
    topicKnowledge?: TopicKnowledgeFeatures;
    errorFeatures?: ErrorFeatures;
    learningStyleIndicators?: LearningStyleIndicators;
    normalizedTime?: number;
}

// ═══════════════════════════════════════════════════════
// STUDENT PROFILE
// ═══════════════════════════════════════════════════════

export interface TopicMastery {
    mastery: number;              // 0-100
    confidence: number;           // 0-1
    trend: 'improving' | 'stable' | 'declining';
    lastAssessed: Date | null;
    totalAttempts: number;
    correctAttempts: number;
    errorDistribution: Record<ErrorType, number>;
    weakSubtopics: string[];
    strongSubtopics: string[];
    recentHistory: Array<{
        date: Date;
        correct: boolean;
        difficulty: number;
        mastery: number;
    }>;
}

export interface CognitiveStyle {
    analyticalVsIntuitive: number;  // -1 to 1
    sequentialVsGlobal: number;
    activeVsReflective: number;
    visualVsVerbal: number;
}

export interface SolvingStrategies {
    usesElimination: number;        // 0-1
    readsCarefully: number;
    rushes: number;
    usesHints: number;
    reviewsAfter: number;
}

export interface OptimalConditions {
    bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    optimalSessionLength: number;   // minutes
    optimalQuestionCount: number;
    needsBreaksEvery: number;       // questions
}

export interface LearningStyle {
    preferredFormat: {
        reading: number;
        video: number;
        practice: number;
        discussion: number;
    };
    cognitiveStyle: CognitiveStyle;
    solvingStrategies: SolvingStrategies;
    optimalConditions: OptimalConditions;
}

export interface ConfusionPair {
    concept1: string;
    concept2: string;
    frequency: number;
    lastOccurrence: Date;
}

export interface ErrorPatterns {
    dominantErrorType: ErrorType;
    errorTypeDistribution: Record<ErrorType, number>;
    confusionPairs: ConfusionPair[];
    weakPrerequisites: Array<{
        topic: string;
        missingPrereq: string;
        impact: number;
    }>;
    temporalPatterns: {
        errorsIncreaseLateSession: boolean;
        errorsIncreaseEvening: boolean;
        errorsAfterBreak: boolean;
    };
}

export interface Engagement {
    motivationLevel: number;        // 0-100
    motivationTrend: 'up' | 'stable' | 'down';
    churnRisk: number;              // 0-1
    motivators: {
        streaks: number;
        achievements: number;
        progress: number;
        competition: number;
        mastery: number;
    };
    currentStreak: number;
    longestStreak: number;
}

export interface LearningGoal {
    examType: string;
    examDate?: Date;
    targetScore: number;
    dailyTimeAvailable: number;     // minutes
    priorityAreas: string[];
}

export interface Predictions {
    predictedExamScore: {
        value: number;
        confidence: number;
        range: { min: number; max: number };
    };
    passProbability: number;
    recommendedFocus: Array<{
        topic: string;
        reason: string;
        expectedImpact: number;
        priority: number;
    }>;
    optimalStrategy: {
        focusOnWeakAreas: number;
        maintainStrong: number;
        newTopics: number;
    };
}

export interface StudentProfile {
    meta: {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        confidenceScore: number;
    };
    knowledgeMap: Record<string, TopicMastery>;
    learningStyle: LearningStyle;
    errorPatterns: ErrorPatterns;
    engagement: Engagement;
    goals?: LearningGoal;
    predictions: Predictions;
}

// ═══════════════════════════════════════════════════════
// SESSION CONTEXT
// ═══════════════════════════════════════════════════════

export interface SessionContext {
    sessionId: string;
    startTime: Date;
    questionsInSession: number;
    correctInSession: number;
    askedInSession: string[];
    currentDifficulty: number;
    lastResults: Array<{
        correct: boolean;
        normalizedTime: number;
    }>;
}
