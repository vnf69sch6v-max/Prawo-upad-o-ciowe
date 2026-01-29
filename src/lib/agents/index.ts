/**
 * Agents Module
 * Export all AI agents for the application
 */

// ═══════════════════════════════════════════════════════
// BEHAVIOR AGENT (Claude's implementation)
// ═══════════════════════════════════════════════════════

export {
    UserBehaviorAgent,
    createBehaviorAgent,
    getBehaviorAgent,
    type BehaviorInsight,
    type InsightCategory,
    type ActionRecommendation,
    type BehaviorAnalysis,
    type SessionAnalysis,
    type EngagementAnalysis,
    type PerformanceAnalysis,
    type AnomalyDetection,
    type BehaviorPredictions,
    type Recommendation
} from './user-behavior-agent';

export {
    startBehaviorSession,
    endBehaviorSession,
    pauseBehaviorSession,
    getOrCreateSession,
    trackQuestionStart,
    trackAnswerSelection,
    trackQuestionResponse,
    trackExplanationTime,
    createBehaviorAPIClient,
    behaviorAPI,
    getCurrentSessionStats
} from './behavior-integration';

// ═══════════════════════════════════════════════════════
// SESSION COACH AGENT (Gemini's implementation)
// ═══════════════════════════════════════════════════════

export {
    SessionCoachAgent,
    getSessionCoach,
    resetSessionCoach,
    type CoachingState,
    type Intervention,
    type PomodoroState,
    type SessionPhase,
    type CoachConfig,
} from './session-coach-agent';

export {
    detectFatigue,
    calculateRollingAccuracy,
    calculateAverageResponseTime,
    countConsecutiveErrors,
    type FatigueAnalysis,
    type FatigueIndicator,
    type PerformanceSnapshot,
} from './fatigue-detector';

export {
    suggestModeSwitch,
    getModeIntensity,
    MODE_INFO,
    type StudyMode,
    type ModeSwitchRecommendation,
    type PerformanceContext,
} from './mode-suggester';
