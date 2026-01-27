/**
 * Behavior Agent Integration
 *
 * Integrates the User Behavior Agent with the event collection system.
 * Automatically processes events and provides real-time insights.
 */

import type { LearningEvent, QuestionResponseEvent } from '@/lib/profiling/types';
import {
    collectEvent,
    createQuestionResponseEvent,
    createSessionEvent,
    getTimingData,
    startQuestionTiming,
    recordAnswerSelection,
    generateSessionId
} from '@/lib/profiling/event-collector';

// ═══════════════════════════════════════════════════════
// SESSION STATE
// ═══════════════════════════════════════════════════════

interface BehaviorSessionState {
    sessionId: string;
    questionsAnswered: number;
    correctAnswers: number;
    startTime: Date;
    lastEventTime: Date;
}

let currentSession: BehaviorSessionState | null = null;

// ═══════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════

/**
 * Start a new learning session
 */
export function startBehaviorSession(): string {
    const sessionId = generateSessionId();

    currentSession = {
        sessionId,
        questionsAnswered: 0,
        correctAnswers: 0,
        startTime: new Date(),
        lastEventTime: new Date()
    };

    // Collect session start event
    const sessionEvent = createSessionEvent({
        type: 'session_start',
        sessionId,
        deviceType: getDeviceType()
    });

    collectEvent(sessionEvent);

    return sessionId;
}

/**
 * End the current learning session
 */
export function endBehaviorSession(): void {
    if (!currentSession) return;

    const duration = Date.now() - currentSession.startTime.getTime();

    const sessionEvent = createSessionEvent({
        type: 'session_end',
        sessionId: currentSession.sessionId,
        duration,
        questionsAnswered: currentSession.questionsAnswered,
        correctAnswers: currentSession.correctAnswers
    });

    collectEvent(sessionEvent);
    currentSession = null;
}

/**
 * Pause the current session
 */
export function pauseBehaviorSession(): void {
    if (!currentSession) return;

    const duration = Date.now() - currentSession.startTime.getTime();

    const sessionEvent = createSessionEvent({
        type: 'session_pause',
        sessionId: currentSession.sessionId,
        duration,
        questionsAnswered: currentSession.questionsAnswered,
        correctAnswers: currentSession.correctAnswers
    });

    collectEvent(sessionEvent);
}

/**
 * Get current session or create new one
 */
export function getOrCreateSession(): string {
    if (!currentSession) {
        return startBehaviorSession();
    }

    // Check if session is stale (>30 minutes since last event)
    const timeSinceLastEvent = Date.now() - currentSession.lastEventTime.getTime();
    if (timeSinceLastEvent > 30 * 60 * 1000) {
        endBehaviorSession();
        return startBehaviorSession();
    }

    return currentSession.sessionId;
}

// ═══════════════════════════════════════════════════════
// QUESTION TRACKING
// ═══════════════════════════════════════════════════════

/**
 * Track when a question is displayed
 */
export function trackQuestionStart(): void {
    startQuestionTiming();
}

/**
 * Track when user selects an answer
 */
export function trackAnswerSelection(answer: string): void {
    recordAnswerSelection(answer);
}

/**
 * Track question response with full context
 */
export function trackQuestionResponse(params: {
    questionId: string;
    topic: string;
    subtopic?: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    questionDifficulty: number;
    examWeight?: number;
    usedHint?: boolean;
    expandedExplanation?: boolean;
    eliminatedOptions?: string[];
}): QuestionResponseEvent {
    const sessionId = getOrCreateSession();
    const timingData = getTimingData();

    // Update session state
    if (currentSession) {
        currentSession.questionsAnswered++;
        if (params.isCorrect) {
            currentSession.correctAnswers++;
        }
        currentSession.lastEventTime = new Date();
    }

    // Create event
    const event = createQuestionResponseEvent({
        ...params,
        ...timingData,
        sessionId,
        questionsInSession: currentSession?.questionsAnswered || 1
    });

    // Collect event
    collectEvent(event);

    // Start timing for next question
    startQuestionTiming();

    return event;
}

/**
 * Track explanation reading time
 */
export function trackExplanationTime(startTime: number): number {
    return Date.now() - startTime;
}

// ═══════════════════════════════════════════════════════
// BEHAVIOR API CLIENT
// ═══════════════════════════════════════════════════════

interface BehaviorAPIClient {
    processEvent: (event: LearningEvent, token: string) => Promise<BehaviorInsight[]>;
    getAnalysis: (token: string) => Promise<BehaviorAnalysis | null>;
    getQuickInsights: (token: string) => Promise<BehaviorInsight[]>;
    checkIntervention: (token: string) => Promise<InterventionResult>;
}

interface BehaviorInsight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'action';
    category: string;
    title: string;
    description: string;
    priority: number;
    timestamp: Date;
}

interface BehaviorAnalysis {
    userId: string;
    analyzedAt: Date;
    insights: BehaviorInsight[];
    recommendations: unknown[];
    predictions: unknown;
}

interface InterventionResult {
    shouldIntervene: boolean;
    reason?: string;
    type?: string;
    notification?: {
        title: string;
        body: string;
        type: string;
    } | null;
}

/**
 * Create a behavior API client
 */
export function createBehaviorAPIClient(): BehaviorAPIClient {
    const baseUrl = '/api/behavior';

    return {
        async processEvent(event: LearningEvent, token: string): Promise<BehaviorInsight[]> {
            try {
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ event })
                });

                if (!response.ok) return [];

                const data = await response.json();
                return data.data?.insights || [];
            } catch (error) {
                console.error('Error processing event:', error);
                return [];
            }
        },

        async getAnalysis(token: string): Promise<BehaviorAnalysis | null> {
            try {
                const response = await fetch(`${baseUrl}?type=full`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) return null;

                const data = await response.json();
                return data.data || null;
            } catch (error) {
                console.error('Error getting analysis:', error);
                return null;
            }
        },

        async getQuickInsights(token: string): Promise<BehaviorInsight[]> {
            try {
                const response = await fetch(`${baseUrl}?type=quick`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) return [];

                const data = await response.json();
                return data.data?.insights || [];
            } catch (error) {
                console.error('Error getting quick insights:', error);
                return [];
            }
        },

        async checkIntervention(token: string): Promise<InterventionResult> {
            try {
                const response = await fetch(`${baseUrl}?type=intervention`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) return { shouldIntervene: false };

                const data = await response.json();
                return data.data || { shouldIntervene: false };
            } catch (error) {
                console.error('Error checking intervention:', error);
                return { shouldIntervene: false };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

// ═══════════════════════════════════════════════════════
// AUTO INTEGRATION
// ═══════════════════════════════════════════════════════

/**
 * Singleton instance of the behavior API client
 */
export const behaviorAPI = createBehaviorAPIClient();

/**
 * Get current session stats
 */
export function getCurrentSessionStats(): {
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    duration: number;
} | null {
    if (!currentSession) return null;

    return {
        questionsAnswered: currentSession.questionsAnswered,
        correctAnswers: currentSession.correctAnswers,
        accuracy: currentSession.questionsAnswered > 0
            ? currentSession.correctAnswers / currentSession.questionsAnswered
            : 0,
        duration: Date.now() - currentSession.startTime.getTime()
    };
}
