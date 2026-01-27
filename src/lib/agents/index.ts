/**
 * Agents Module
 * Export all AI agents for the application
 */

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
