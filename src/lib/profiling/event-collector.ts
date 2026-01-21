/**
 * Event Collector
 * Collects and buffers learning events from user interactions
 */

import type { LearningEvent, QuestionResponseEvent, SessionEvent, FeedbackEvent } from './types';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════
// EVENT BUFFER
// ═══════════════════════════════════════════════════════

const eventBuffer: LearningEvent[] = [];
const BUFFER_FLUSH_SIZE = 10;
const BUFFER_FLUSH_INTERVAL = 30000; // 30 seconds

let flushTimer: NodeJS.Timeout | null = null;

// ═══════════════════════════════════════════════════════
// EVENT CREATION HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Create a question response event
 */
export function createQuestionResponseEvent(params: {
    questionId: string;
    topic: string;
    subtopic?: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    questionDifficulty: number;
    examWeight?: number;
    timeToFirstClick: number;
    timeToAnswer: number;
    timeReadingExplanation?: number;
    changedAnswer: boolean;
    originalAnswer?: string;
    hesitationEvents?: number;
    eliminatedOptions?: string[];
    usedHint?: boolean;
    expandedExplanation?: boolean;
    sessionId: string;
    questionsInSession: number;
}): QuestionResponseEvent {
    return {
        type: 'question_response',
        questionId: params.questionId,
        topic: params.topic,
        subtopic: params.subtopic,
        selectedAnswer: params.selectedAnswer,
        correctAnswer: params.correctAnswer,
        isCorrect: params.isCorrect,
        questionDifficulty: params.questionDifficulty,
        examWeight: params.examWeight,
        timeToFirstClick: params.timeToFirstClick,
        timeToAnswer: params.timeToAnswer,
        timeReadingExplanation: params.timeReadingExplanation,
        changedAnswer: params.changedAnswer,
        originalAnswer: params.originalAnswer,
        hesitationEvents: params.hesitationEvents || 0,
        eliminatedOptions: params.eliminatedOptions || [],
        usedHint: params.usedHint || false,
        expandedExplanation: params.expandedExplanation || false,
        timestamp: new Date(),
        sessionId: params.sessionId,
        questionsInSession: params.questionsInSession
    };
}

/**
 * Create a session event
 */
export function createSessionEvent(params: {
    type: 'session_start' | 'session_end' | 'session_pause';
    sessionId: string;
    duration?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
}): SessionEvent {
    return {
        type: params.type,
        sessionId: params.sessionId,
        timestamp: new Date(),
        duration: params.duration,
        questionsAnswered: params.questionsAnswered,
        correctAnswers: params.correctAnswers,
        deviceType: params.deviceType || getDeviceType()
    };
}

/**
 * Create a feedback event
 */
export function createFeedbackEvent(params: {
    questionId: string;
    wasHelpful?: boolean;
    wasTooHard?: boolean;
    wasTooEasy?: boolean;
    comment?: string;
}): FeedbackEvent {
    return {
        type: 'feedback',
        questionId: params.questionId,
        wasHelpful: params.wasHelpful,
        wasTooHard: params.wasTooHard,
        wasTooEasy: params.wasTooEasy,
        comment: params.comment,
        timestamp: new Date()
    };
}

// ═══════════════════════════════════════════════════════
// EVENT COLLECTION
// ═══════════════════════════════════════════════════════

/**
 * Collect an event (adds to buffer)
 */
export function collectEvent(event: LearningEvent): void {
    eventBuffer.push(event);

    // Schedule flush if not already scheduled
    if (!flushTimer) {
        flushTimer = setTimeout(() => {
            flushEvents();
        }, BUFFER_FLUSH_INTERVAL);
    }

    // Flush immediately if buffer is full
    if (eventBuffer.length >= BUFFER_FLUSH_SIZE) {
        flushEvents();
    }
}

/**
 * Flush events to storage
 */
export async function flushEvents(): Promise<void> {
    if (eventBuffer.length === 0) return;

    // Clear timer
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }

    // Take all events from buffer
    const eventsToFlush = [...eventBuffer];
    eventBuffer.length = 0;

    // Save to Supabase
    if (isSupabaseAvailable()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const records = eventsToFlush.map(event => ({
                user_id: user.id,
                event_type: event.type,
                question_id: 'questionId' in event ? event.questionId : null,
                data: event,
                created_at: event.timestamp.toISOString()
            }));

            await supabase.from('learning_events').insert(records);
        } catch (error) {
            console.error('Failed to flush events:', error);
            // Put events back in buffer
            eventBuffer.unshift(...eventsToFlush);
        }
    }
}

// ═══════════════════════════════════════════════════════
// TIMING TRACKER
// ═══════════════════════════════════════════════════════

interface TimingState {
    questionStartTime: number | null;
    firstInteractionTime: number | null;
    answerChanges: number;
    originalAnswer: string | null;
    currentAnswer: string | null;
}

const timingState: TimingState = {
    questionStartTime: null,
    firstInteractionTime: null,
    answerChanges: 0,
    originalAnswer: null,
    currentAnswer: null
};

/**
 * Start timing for a new question
 */
export function startQuestionTiming(): void {
    timingState.questionStartTime = Date.now();
    timingState.firstInteractionTime = null;
    timingState.answerChanges = 0;
    timingState.originalAnswer = null;
    timingState.currentAnswer = null;
}

/**
 * Record first interaction
 */
export function recordFirstInteraction(): void {
    if (timingState.firstInteractionTime === null) {
        timingState.firstInteractionTime = Date.now();
    }
}

/**
 * Record answer selection/change
 */
export function recordAnswerSelection(answer: string): void {
    recordFirstInteraction();

    if (timingState.originalAnswer === null) {
        timingState.originalAnswer = answer;
    } else if (timingState.currentAnswer !== answer) {
        timingState.answerChanges++;
    }

    timingState.currentAnswer = answer;
}

/**
 * Get timing data for current question
 */
export function getTimingData(): {
    timeToFirstClick: number;
    timeToAnswer: number;
    changedAnswer: boolean;
    originalAnswer: string | null;
    hesitationEvents: number;
} {
    const now = Date.now();

    return {
        timeToFirstClick: timingState.firstInteractionTime
            ? timingState.firstInteractionTime - (timingState.questionStartTime || now)
            : now - (timingState.questionStartTime || now),
        timeToAnswer: now - (timingState.questionStartTime || now),
        changedAnswer: timingState.answerChanges > 0,
        originalAnswer: timingState.originalAnswer,
        hesitationEvents: timingState.answerChanges
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

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get events in buffer (for testing/debugging)
 */
export function getBufferedEvents(): LearningEvent[] {
    return [...eventBuffer];
}
