/**
 * Session Coach Agent
 * Real-time coaching during study sessions
 * 
 * Features:
 * - Cognitive fatigue detection
 * - Mode switching recommendations
 * - Pomodoro timer integration
 * - Personalized encouragements
 */

import {
    detectFatigue,
    calculateRollingAccuracy,
    calculateAverageResponseTime,
    countConsecutiveErrors,
    type FatigueAnalysis,
    type PerformanceSnapshot
} from './fatigue-detector';
import {
    suggestModeSwitch,
    type StudyMode,
    type ModeSwitchRecommendation,
    type PerformanceContext
} from './mode-suggester';
import type { StudentProfile, QuestionResponseEvent } from '../profiling/types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type SessionPhase = 'warmup' | 'peak' | 'fatigue' | 'recovery';

export interface Intervention {
    id: string;
    type: 'break' | 'mode_switch' | 'encouragement' | 'warning';
    title: string;
    message: string;
    icon: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
    action?: {
        label: string;
        value: string;
    };
    wasAccepted?: boolean;
}

export interface PomodoroState {
    isActive: boolean;
    isBreak: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    sessionsCompleted: number;
}

export interface CoachingState {
    // Session info
    sessionId: string;
    sessionStart: Date;
    currentMode: StudyMode;
    currentPhase: SessionPhase;

    // Performance tracking
    questionsAnswered: number;
    correctAnswers: number;
    resultsHistory: boolean[];       // true = correct
    responseTimeHistory: number[];   // ms
    hesitationCount: number;

    // Analysis
    currentAccuracy: number;
    fatigueAnalysis: FatigueAnalysis | null;

    // Interventions
    interventionHistory: Intervention[];
    lastInterventionAt: Date | null;

    // Pomodoro
    pomodoro: PomodoroState;
}

export interface CoachConfig {
    pomodoroWorkMinutes: number;     // default: 25
    pomodoroBreakMinutes: number;    // default: 5
    maxInterventionsPerSession: number;  // default: 3
    interventionCooldownMinutes: number; // default: 5
}

const DEFAULT_CONFIG: CoachConfig = {
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5,
    maxInterventionsPerSession: 3,
    interventionCooldownMinutes: 5,
};

// ═══════════════════════════════════════════════════════
// SESSION COACH AGENT CLASS
// ═══════════════════════════════════════════════════════

export class SessionCoachAgent {
    private state: CoachingState;
    private config: CoachConfig;
    private profile: StudentProfile | null = null;
    private onInterventionCallback?: (intervention: Intervention) => void;
    private pomodoroInterval?: ReturnType<typeof setInterval>;

    constructor(config: Partial<CoachConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.state = this.createInitialState();
    }

    // ═══════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════

    private createInitialState(): CoachingState {
        return {
            sessionId: this.generateSessionId(),
            sessionStart: new Date(),
            currentMode: 'flashcards',
            currentPhase: 'warmup',
            questionsAnswered: 0,
            correctAnswers: 0,
            resultsHistory: [],
            responseTimeHistory: [],
            hesitationCount: 0,
            currentAccuracy: 0,
            fatigueAnalysis: null,
            interventionHistory: [],
            lastInterventionAt: null,
            pomodoro: {
                isActive: false,
                isBreak: false,
                remainingSeconds: this.config.pomodoroWorkMinutes * 60,
                totalSeconds: this.config.pomodoroWorkMinutes * 60,
                sessionsCompleted: 0,
            },
        };
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setProfile(profile: StudentProfile): void {
        this.profile = profile;
    }

    setOnIntervention(callback: (intervention: Intervention) => void): void {
        this.onInterventionCallback = callback;
    }

    // ═══════════════════════════════════════════════════════
    // SESSION LIFECYCLE
    // ═══════════════════════════════════════════════════════

    startSession(mode: StudyMode = 'flashcards'): void {
        this.state = this.createInitialState();
        this.state.currentMode = mode;
        console.log(`[SessionCoach] ▶️ Sesja rozpoczęta: ${mode}`);
    }

    pauseSession(): void {
        this.stopPomodoro();
        console.log('[SessionCoach] ⏸️ Sesja wstrzymana');
    }

    resumeSession(): void {
        if (this.state.pomodoro.isActive) {
            this.resumePomodoro();
        }
        console.log('[SessionCoach] ▶️ Sesja wznowiona');
    }

    endSession(): void {
        this.stopPomodoro();
        console.log(`[SessionCoach] ⏹️ Sesja zakończona. Pytania: ${this.state.questionsAnswered}, Dokładność: ${Math.round(this.state.currentAccuracy)}%`);
    }

    setMode(mode: StudyMode): void {
        this.state.currentMode = mode;
    }

    // ═══════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════

    onQuestionAnswered(event: Partial<QuestionResponseEvent>): Intervention[] {
        const interventions: Intervention[] = [];

        // Update state
        this.state.questionsAnswered++;
        if (event.isCorrect) {
            this.state.correctAnswers++;
        }
        this.state.resultsHistory.push(event.isCorrect || false);

        if (event.timeToAnswer) {
            this.state.responseTimeHistory.push(event.timeToAnswer);
        }

        if (event.changedAnswer) {
            this.state.hesitationCount++;
        }

        // Calculate current accuracy
        this.state.currentAccuracy = this.state.questionsAnswered > 0
            ? (this.state.correctAnswers / this.state.questionsAnswered) * 100
            : 0;

        // Update phase
        this.updatePhase();

        // Run analysis every 5 questions (after warmup)
        if (this.state.questionsAnswered >= 5 && this.state.questionsAnswered % 5 === 0) {
            const newInterventions = this.analyzeAndRecommend();
            interventions.push(...newInterventions);
        }

        // Check for encouragement opportunities
        const encouragement = this.checkForEncouragement();
        if (encouragement) {
            interventions.push(encouragement);
        }

        return interventions;
    }

    // ═══════════════════════════════════════════════════════
    // ANALYSIS
    // ═══════════════════════════════════════════════════════

    private analyzeAndRecommend(): Intervention[] {
        const interventions: Intervention[] = [];

        // Check intervention cooldown
        if (!this.canSendIntervention()) {
            return interventions;
        }

        // Build performance snapshot
        const snapshot = this.buildPerformanceSnapshot();

        // Run fatigue detection
        this.state.fatigueAnalysis = detectFatigue(snapshot, this.profile || undefined);

        // Check for break recommendation
        if (this.state.fatigueAnalysis.shouldTakeBreak) {
            const breakIntervention = this.createBreakIntervention(this.state.fatigueAnalysis);
            interventions.push(breakIntervention);
            this.emitIntervention(breakIntervention);
            return interventions;
        }

        // Check for mode switch recommendation
        const performanceContext = this.buildPerformanceContext();
        const modeSuggestion = suggestModeSwitch(
            performanceContext,
            this.state.fatigueAnalysis,
            this.profile || undefined
        );

        if (modeSuggestion) {
            const modeIntervention = this.createModeSwitchIntervention(modeSuggestion);
            interventions.push(modeIntervention);
            this.emitIntervention(modeIntervention);
        }

        return interventions;
    }

    private buildPerformanceSnapshot(): PerformanceSnapshot {
        const sessionDurationMs = Date.now() - this.state.sessionStart.getTime();

        return {
            recentAccuracy: calculateRollingAccuracy(this.state.resultsHistory, 10),
            baselineAccuracy: this.state.currentAccuracy,
            recentResponseTime: calculateAverageResponseTime(this.state.responseTimeHistory, 5),
            baselineResponseTime: calculateAverageResponseTime(this.state.responseTimeHistory),
            consecutiveErrors: countConsecutiveErrors(this.state.resultsHistory),
            hesitationCount: this.state.hesitationCount,
            sessionDurationMinutes: sessionDurationMs / 1000 / 60,
            questionsAnswered: this.state.questionsAnswered,
        };
    }

    private buildPerformanceContext(): PerformanceContext {
        return {
            currentMode: this.state.currentMode,
            recentAccuracy: calculateRollingAccuracy(this.state.resultsHistory, 10),
            questionsInMode: this.state.questionsAnswered,
            correctStreak: this.countCorrectStreak(),
            errorStreak: countConsecutiveErrors(this.state.resultsHistory),
            sessionDurationMinutes: (Date.now() - this.state.sessionStart.getTime()) / 1000 / 60,
        };
    }

    private countCorrectStreak(): number {
        let count = 0;
        for (let i = this.state.resultsHistory.length - 1; i >= 0; i--) {
            if (this.state.resultsHistory[i]) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    // ═══════════════════════════════════════════════════════
    // PHASE MANAGEMENT
    // ═══════════════════════════════════════════════════════

    private updatePhase(): void {
        const questions = this.state.questionsAnswered;
        const fatigue = this.state.fatigueAnalysis?.fatigueLevel || 'none';

        if (questions < 5) {
            this.state.currentPhase = 'warmup';
        } else if (fatigue === 'severe' || fatigue === 'moderate') {
            this.state.currentPhase = 'fatigue';
        } else if (this.state.pomodoro.isBreak) {
            this.state.currentPhase = 'recovery';
        } else {
            this.state.currentPhase = 'peak';
        }
    }

    getPhaseEmoji(): string {
        const emojis: Record<SessionPhase, string> = {
            warmup: '🌅',
            peak: '🚀',
            fatigue: '😴',
            recovery: '🔄',
        };
        return emojis[this.state.currentPhase];
    }

    // ═══════════════════════════════════════════════════════
    // INTERVENTIONS
    // ═══════════════════════════════════════════════════════

    private canSendIntervention(): boolean {
        // Check max interventions
        if (this.state.interventionHistory.length >= this.config.maxInterventionsPerSession) {
            return false;
        }

        // Check cooldown
        if (this.state.lastInterventionAt) {
            const cooldownMs = this.config.interventionCooldownMinutes * 60 * 1000;
            if (Date.now() - this.state.lastInterventionAt.getTime() < cooldownMs) {
                return false;
            }
        }

        return true;
    }

    private createBreakIntervention(fatigue: FatigueAnalysis): Intervention {
        const intervention: Intervention = {
            id: `int_${Date.now()}`,
            type: 'break',
            title: '😴 Czas na przerwę!',
            message: fatigue.recommendation,
            icon: '☕',
            timestamp: new Date(),
            priority: fatigue.fatigueLevel === 'severe' ? 'high' : 'medium',
            action: {
                label: `Przerwa ${fatigue.suggestedBreakDuration} min`,
                value: `break_${fatigue.suggestedBreakDuration}`,
            },
        };

        this.state.interventionHistory.push(intervention);
        this.state.lastInterventionAt = new Date();

        return intervention;
    }

    private createModeSwitchIntervention(suggestion: ModeSwitchRecommendation): Intervention {
        const intervention: Intervention = {
            id: `int_${Date.now()}`,
            type: 'mode_switch',
            title: `${suggestion.icon} ${suggestion.reason}`,
            message: suggestion.expectedBenefit,
            icon: suggestion.icon,
            timestamp: new Date(),
            priority: suggestion.confidence > 0.8 ? 'medium' : 'low',
            action: {
                label: `Przejdź na ${suggestion.toMode}`,
                value: `switch_${suggestion.toMode}`,
            },
        };

        this.state.interventionHistory.push(intervention);
        this.state.lastInterventionAt = new Date();

        return intervention;
    }

    private checkForEncouragement(): Intervention | null {
        const streak = this.countCorrectStreak();

        // Encourage on milestones
        if (streak === 5 || streak === 10 || streak === 15) {
            return {
                id: `enc_${Date.now()}`,
                type: 'encouragement',
                title: '🔥 Świetna passa!',
                message: `${streak} poprawnych odpowiedzi pod rząd! Tak trzymaj!`,
                icon: '🌟',
                timestamp: new Date(),
                priority: 'low',
            };
        }

        // Encourage on accuracy milestones
        if (this.state.questionsAnswered === 20 && this.state.currentAccuracy >= 80) {
            return {
                id: `enc_${Date.now()}`,
                type: 'encouragement',
                title: '📈 Doskonały wynik!',
                message: `${Math.round(this.state.currentAccuracy)}% dokładności po 20 pytaniach!`,
                icon: '🏆',
                timestamp: new Date(),
                priority: 'low',
            };
        }

        return null;
    }

    private emitIntervention(intervention: Intervention): void {
        if (this.onInterventionCallback) {
            this.onInterventionCallback(intervention);
        }
    }

    acceptIntervention(interventionId: string): void {
        const intervention = this.state.interventionHistory.find(i => i.id === interventionId);
        if (intervention) {
            intervention.wasAccepted = true;
        }
    }

    dismissIntervention(interventionId: string): void {
        const intervention = this.state.interventionHistory.find(i => i.id === interventionId);
        if (intervention) {
            intervention.wasAccepted = false;
        }
    }

    // ═══════════════════════════════════════════════════════
    // POMODORO TIMER
    // ═══════════════════════════════════════════════════════

    startPomodoro(): void {
        this.state.pomodoro.isActive = true;
        this.state.pomodoro.isBreak = false;
        this.state.pomodoro.remainingSeconds = this.config.pomodoroWorkMinutes * 60;
        this.state.pomodoro.totalSeconds = this.config.pomodoroWorkMinutes * 60;

        this.pomodoroInterval = setInterval(() => {
            this.tickPomodoro();
        }, 1000);

        console.log(`[SessionCoach] 🍅 Pomodoro rozpoczęte: ${this.config.pomodoroWorkMinutes} min`);
    }

    private tickPomodoro(): void {
        if (!this.state.pomodoro.isActive) return;

        this.state.pomodoro.remainingSeconds--;

        if (this.state.pomodoro.remainingSeconds <= 0) {
            if (this.state.pomodoro.isBreak) {
                // Break finished, start new work session
                this.state.pomodoro.isBreak = false;
                this.state.pomodoro.remainingSeconds = this.config.pomodoroWorkMinutes * 60;
                this.state.pomodoro.totalSeconds = this.config.pomodoroWorkMinutes * 60;
                this.state.pomodoro.sessionsCompleted++;
                this.updatePhase();
                console.log('[SessionCoach] 🍅 Przerwa zakończona, wracamy do nauki!');
            } else {
                // Work session finished, start break
                this.state.pomodoro.isBreak = true;
                this.state.pomodoro.remainingSeconds = this.config.pomodoroBreakMinutes * 60;
                this.state.pomodoro.totalSeconds = this.config.pomodoroBreakMinutes * 60;
                this.updatePhase();
                console.log('[SessionCoach] 🍅 Czas na przerwę!');

                // Emit break intervention
                const breakIntervention: Intervention = {
                    id: `pom_${Date.now()}`,
                    type: 'break',
                    title: '🍅 Pomodoro zakończone!',
                    message: `Świetna robota! Czas na ${this.config.pomodoroBreakMinutes} minut przerwy.`,
                    icon: '☕',
                    timestamp: new Date(),
                    priority: 'medium',
                };
                this.emitIntervention(breakIntervention);
            }
        }
    }

    stopPomodoro(): void {
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
            this.pomodoroInterval = undefined;
        }
        this.state.pomodoro.isActive = false;
    }

    private resumePomodoro(): void {
        if (this.state.pomodoro.remainingSeconds > 0) {
            this.pomodoroInterval = setInterval(() => {
                this.tickPomodoro();
            }, 1000);
        }
    }

    skipBreak(): void {
        if (this.state.pomodoro.isBreak) {
            this.state.pomodoro.isBreak = false;
            this.state.pomodoro.remainingSeconds = this.config.pomodoroWorkMinutes * 60;
            this.state.pomodoro.totalSeconds = this.config.pomodoroWorkMinutes * 60;
            this.updatePhase();
        }
    }

    // ═══════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════

    getState(): CoachingState {
        return { ...this.state };
    }

    getSessionDuration(): number {
        return Math.floor((Date.now() - this.state.sessionStart.getTime()) / 1000);
    }

    getSessionDurationFormatted(): string {
        const seconds = this.getSessionDuration();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getPomodoroFormatted(): string {
        const secs = this.state.pomodoro.remainingSeconds;
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    }

    getPomodoroProgress(): number {
        if (this.state.pomodoro.totalSeconds === 0) return 0;
        return 1 - (this.state.pomodoro.remainingSeconds / this.state.pomodoro.totalSeconds);
    }
}

// ═══════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════

let coachInstance: SessionCoachAgent | null = null;

export function getSessionCoach(config?: Partial<CoachConfig>): SessionCoachAgent {
    if (!coachInstance) {
        coachInstance = new SessionCoachAgent(config);
    }
    return coachInstance;
}

export function resetSessionCoach(): void {
    if (coachInstance) {
        coachInstance.endSession();
    }
    coachInstance = null;
}
