/**
 * User Behavior Agent
 *
 * Centralny agent analizujący zachowania użytkowników.
 * Wykrywa wzorce, anomalie i generuje rekomendacje.
 */

import type {
    StudentProfile,
    LearningEvent,
    QuestionResponseEvent,
    SessionEvent,
    ExtractedFeatures,
    ErrorType
} from '@/lib/profiling/types';
import { processEvent, aggregateFeatures } from '@/lib/profiling/event-processor';
import { updateProfile } from '@/lib/profiling/profile-updater';
import { getOrCreateProfile, saveProfile } from '@/lib/profiling/student-profile';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface BehaviorInsight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'action';
    category: InsightCategory;
    title: string;
    description: string;
    priority: number; // 1-10
    timestamp: Date;
    metrics?: Record<string, number>;
    actionable?: ActionRecommendation;
}

export type InsightCategory =
    | 'engagement'
    | 'performance'
    | 'learning_pattern'
    | 'risk'
    | 'achievement'
    | 'anomaly'
    | 'recommendation';

export interface ActionRecommendation {
    action: string;
    reason: string;
    expectedImpact: number; // 0-1
    urgency: 'immediate' | 'soon' | 'later';
}

export interface BehaviorAnalysis {
    userId: string;
    analyzedAt: Date;
    sessionAnalysis: SessionAnalysis;
    engagementAnalysis: EngagementAnalysis;
    performanceAnalysis: PerformanceAnalysis;
    anomalies: AnomalyDetection[];
    insights: BehaviorInsight[];
    predictions: BehaviorPredictions;
    recommendations: Recommendation[];
}

export interface SessionAnalysis {
    totalSessions: number;
    averageSessionLength: number; // minutes
    averageQuestionsPerSession: number;
    sessionFrequency: number; // sessions per week
    optimalSessionTime: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionTrend: 'increasing' | 'stable' | 'decreasing';
    lastSessionDate: Date | null;
    daysSinceLastSession: number;
}

export interface EngagementAnalysis {
    engagementScore: number; // 0-100
    engagementTrend: 'improving' | 'stable' | 'declining';
    churnRisk: number; // 0-1
    churnRiskFactors: string[];
    streakHealth: 'strong' | 'at_risk' | 'broken';
    motivationFactors: {
        factor: string;
        strength: number;
    }[];
}

export interface PerformanceAnalysis {
    overallAccuracy: number;
    accuracyTrend: 'improving' | 'stable' | 'declining';
    weakestTopics: {
        topic: string;
        mastery: number;
        errorCount: number;
    }[];
    strongestTopics: {
        topic: string;
        mastery: number;
    }[];
    commonErrorPatterns: {
        pattern: string;
        frequency: number;
    }[];
    speedAccuracyBalance: 'fast_accurate' | 'fast_inaccurate' | 'slow_accurate' | 'slow_inaccurate' | 'balanced';
}

export interface AnomalyDetection {
    type: 'performance_drop' | 'engagement_drop' | 'behavior_change' | 'unusual_timing' | 'error_spike';
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: Date;
    metric: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
}

export interface BehaviorPredictions {
    examPassProbability: number;
    expectedExamScore: { value: number; confidence: number; range: { min: number; max: number } };
    nextSessionPrediction: {
        likelyTime: 'morning' | 'afternoon' | 'evening' | 'night';
        likelyDuration: number;
        confidence: number;
    };
    churnProbability: {
        '7_days': number;
        '14_days': number;
        '30_days': number;
    };
    timeToMastery: {
        topic: string;
        estimatedDays: number;
        currentMastery: number;
        targetMastery: number;
    }[];
}

export interface Recommendation {
    id: string;
    type: 'study_focus' | 'timing' | 'motivation' | 'break' | 'review' | 'challenge';
    title: string;
    description: string;
    priority: number;
    expectedImpact: number;
    relatedTopics?: string[];
}

// ═══════════════════════════════════════════════════════
// THRESHOLDS & CONFIGURATION
// ═══════════════════════════════════════════════════════

const CONFIG = {
    // Engagement thresholds
    CHURN_RISK_THRESHOLD: 0.7,
    ENGAGEMENT_WARNING_THRESHOLD: 40,
    DAYS_INACTIVE_WARNING: 3,
    DAYS_INACTIVE_CRITICAL: 7,

    // Performance thresholds
    ACCURACY_DROP_THRESHOLD: 0.15,
    WEAK_TOPIC_THRESHOLD: 50,
    STRONG_TOPIC_THRESHOLD: 80,

    // Anomaly detection
    ANOMALY_STD_THRESHOLD: 2.0,
    MIN_DATA_POINTS_FOR_ANOMALY: 5,

    // Session analysis
    OPTIMAL_SESSION_LENGTH: 25, // minutes
    MAX_SESSION_LENGTH: 60,
    MIN_QUESTIONS_PER_SESSION: 10,

    // Scoring weights
    WEIGHTS: {
        recentActivity: 0.3,
        consistency: 0.25,
        performance: 0.25,
        progressRate: 0.2
    }
};

// ═══════════════════════════════════════════════════════
// MAIN AGENT CLASS
// ═══════════════════════════════════════════════════════

export class UserBehaviorAgent {
    private userId: string;
    private profile: StudentProfile | null = null;
    private recentEvents: LearningEvent[] = [];
    private analysisCache: BehaviorAnalysis | null = null;
    private cacheExpiry: Date | null = null;

    constructor(userId: string) {
        this.userId = userId;
    }

    /**
     * Initialize the agent with user data
     */
    async initialize(): Promise<void> {
        this.profile = await getOrCreateProfile(this.userId);
        await this.loadRecentEvents();
    }

    /**
     * Load recent events from Supabase
     */
    private async loadRecentEvents(): Promise<void> {
        if (!isSupabaseAvailable()) return;

        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabase
                .from('learning_events')
                .select('*')
                .eq('user_id', this.userId)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false })
                .limit(1000);

            if (!error && data) {
                this.recentEvents = data.map(row => ({
                    ...row.data,
                    timestamp: new Date(row.created_at)
                }));
            }
        } catch (error) {
            console.error('Failed to load recent events:', error);
        }
    }

    /**
     * Process a new event and update analysis
     */
    async processNewEvent(event: LearningEvent): Promise<BehaviorInsight[]> {
        // Add to recent events
        this.recentEvents.unshift(event);
        if (this.recentEvents.length > 1000) {
            this.recentEvents.pop();
        }

        // Invalidate cache
        this.analysisCache = null;

        // Process and update profile
        const features = processEvent(event, this.userId);
        if (features && this.profile) {
            this.profile = updateProfile(this.profile, features);
            await saveProfile(this.profile);
        }

        // Generate real-time insights
        return this.generateRealTimeInsights(event);
    }

    /**
     * Get full behavior analysis
     */
    async analyze(): Promise<BehaviorAnalysis> {
        // Check cache
        if (this.analysisCache && this.cacheExpiry && this.cacheExpiry > new Date()) {
            return this.analysisCache;
        }

        if (!this.profile) {
            await this.initialize();
        }

        const analysis: BehaviorAnalysis = {
            userId: this.userId,
            analyzedAt: new Date(),
            sessionAnalysis: this.analyzeSessionPatterns(),
            engagementAnalysis: this.analyzeEngagement(),
            performanceAnalysis: this.analyzePerformance(),
            anomalies: this.detectAnomalies(),
            insights: [],
            predictions: this.generatePredictions(),
            recommendations: []
        };

        // Generate insights based on analysis
        analysis.insights = this.generateInsights(analysis);

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        // Cache for 5 minutes
        this.analysisCache = analysis;
        this.cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);

        return analysis;
    }

    // ═══════════════════════════════════════════════════════
    // SESSION PATTERN ANALYSIS
    // ═══════════════════════════════════════════════════════

    private analyzeSessionPatterns(): SessionAnalysis {
        const sessionEvents = this.recentEvents.filter(
            e => e.type === 'session_start' || e.type === 'session_end'
        ) as SessionEvent[];

        // Group events by session
        const sessions: Map<string, { start?: Date; end?: Date; questions?: number }> = new Map();

        for (const event of sessionEvents) {
            const existing = sessions.get(event.sessionId) || {};
            if (event.type === 'session_start') {
                existing.start = event.timestamp;
            } else if (event.type === 'session_end') {
                existing.end = event.timestamp;
                existing.questions = event.questionsAnswered;
            }
            sessions.set(event.sessionId, existing);
        }

        const completeSessions = Array.from(sessions.values())
            .filter(s => s.start && s.end);

        const sessionLengths = completeSessions.map(s =>
            (s.end!.getTime() - s.start!.getTime()) / 60000
        );

        const questionsPerSession = completeSessions
            .filter(s => s.questions)
            .map(s => s.questions!);

        // Determine optimal time
        const sessionHours = sessionEvents
            .filter(e => e.type === 'session_start')
            .map(e => e.timestamp.getHours());
        const optimalTime = this.determineOptimalTime(sessionHours);

        // Calculate session frequency (sessions per week)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSessions = sessionEvents.filter(
            e => e.type === 'session_start' && e.timestamp > weekAgo
        ).length;

        // Find last session
        const lastSession = sessionEvents
            .filter(e => e.type === 'session_start')
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        const daysSinceLastSession = lastSession
            ? Math.floor((Date.now() - lastSession.timestamp.getTime()) / (24 * 60 * 60 * 1000))
            : 999;

        // Determine trend
        const oldSessions = completeSessions.filter(s => {
            const age = Date.now() - s.start!.getTime();
            return age > 7 * 24 * 60 * 60 * 1000 && age < 14 * 24 * 60 * 60 * 1000;
        }).length;
        const newSessions = completeSessions.filter(s => {
            const age = Date.now() - s.start!.getTime();
            return age <= 7 * 24 * 60 * 60 * 1000;
        }).length;

        let sessionTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
        if (newSessions > oldSessions * 1.2) sessionTrend = 'increasing';
        if (newSessions < oldSessions * 0.8) sessionTrend = 'decreasing';

        return {
            totalSessions: sessions.size,
            averageSessionLength: sessionLengths.length > 0
                ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
                : 0,
            averageQuestionsPerSession: questionsPerSession.length > 0
                ? questionsPerSession.reduce((a, b) => a + b, 0) / questionsPerSession.length
                : 0,
            sessionFrequency: recentSessions,
            optimalSessionTime: optimalTime,
            sessionTrend,
            lastSessionDate: lastSession?.timestamp || null,
            daysSinceLastSession
        };
    }

    private determineOptimalTime(hours: number[]): 'morning' | 'afternoon' | 'evening' | 'night' {
        if (hours.length === 0) return 'morning';

        const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        for (const hour of hours) {
            if (hour >= 5 && hour < 12) buckets.morning++;
            else if (hour >= 12 && hour < 17) buckets.afternoon++;
            else if (hour >= 17 && hour < 21) buckets.evening++;
            else buckets.night++;
        }

        return Object.entries(buckets)
            .sort((a, b) => b[1] - a[1])[0][0] as 'morning' | 'afternoon' | 'evening' | 'night';
    }

    // ═══════════════════════════════════════════════════════
    // ENGAGEMENT ANALYSIS
    // ═══════════════════════════════════════════════════════

    private analyzeEngagement(): EngagementAnalysis {
        const profile = this.profile;
        if (!profile) {
            return this.getDefaultEngagementAnalysis();
        }

        const engagement = profile.engagement;
        const sessionAnalysis = this.analyzeSessionPatterns();

        // Calculate engagement score based on multiple factors
        let engagementScore = 0;
        const churnRiskFactors: string[] = [];

        // Factor 1: Recent activity (30%)
        const activityScore = Math.max(0, 100 - sessionAnalysis.daysSinceLastSession * 15);
        engagementScore += activityScore * CONFIG.WEIGHTS.recentActivity;

        if (sessionAnalysis.daysSinceLastSession > CONFIG.DAYS_INACTIVE_WARNING) {
            churnRiskFactors.push('brak aktywności przez ' + sessionAnalysis.daysSinceLastSession + ' dni');
        }

        // Factor 2: Consistency (25%)
        const consistencyScore = Math.min(100, sessionAnalysis.sessionFrequency * 20);
        engagementScore += consistencyScore * CONFIG.WEIGHTS.consistency;

        if (sessionAnalysis.sessionTrend === 'decreasing') {
            churnRiskFactors.push('spadająca częstotliwość sesji');
        }

        // Factor 3: Performance satisfaction (25%)
        const performanceScore = this.calculatePerformanceSatisfaction();
        engagementScore += performanceScore * CONFIG.WEIGHTS.performance;

        if (performanceScore < 40) {
            churnRiskFactors.push('niski poziom satysfakcji z wyników');
        }

        // Factor 4: Progress rate (20%)
        const progressScore = this.calculateProgressRate();
        engagementScore += progressScore * CONFIG.WEIGHTS.progressRate;

        if (progressScore < 30) {
            churnRiskFactors.push('wolne tempo postępu');
        }

        // Calculate churn risk
        let churnRisk = 1 - (engagementScore / 100);

        // Adjust for streak
        if (engagement.currentStreak > 7) {
            churnRisk *= 0.7;
        } else if (engagement.currentStreak === 0) {
            churnRisk = Math.min(1, churnRisk * 1.3);
        }

        // Determine streak health
        let streakHealth: 'strong' | 'at_risk' | 'broken' = 'strong';
        if (engagement.currentStreak === 0) {
            streakHealth = 'broken';
        } else if (sessionAnalysis.daysSinceLastSession >= 1) {
            streakHealth = 'at_risk';
        }

        // Identify motivation factors
        const motivationFactors = Object.entries(engagement.motivators)
            .map(([factor, strength]) => ({ factor, strength }))
            .sort((a, b) => b.strength - a.strength);

        // Determine trend
        let engagementTrend: 'improving' | 'stable' | 'declining' = 'stable';
        if (sessionAnalysis.sessionTrend === 'increasing' && performanceScore > 60) {
            engagementTrend = 'improving';
        } else if (sessionAnalysis.sessionTrend === 'decreasing' || churnRiskFactors.length > 2) {
            engagementTrend = 'declining';
        }

        return {
            engagementScore: Math.round(engagementScore),
            engagementTrend,
            churnRisk: Math.round(churnRisk * 100) / 100,
            churnRiskFactors,
            streakHealth,
            motivationFactors
        };
    }

    private getDefaultEngagementAnalysis(): EngagementAnalysis {
        return {
            engagementScore: 50,
            engagementTrend: 'stable',
            churnRisk: 0.5,
            churnRiskFactors: ['brak wystarczających danych'],
            streakHealth: 'broken',
            motivationFactors: []
        };
    }

    private calculatePerformanceSatisfaction(): number {
        if (!this.profile) return 50;

        const topics = Object.values(this.profile.knowledgeMap);
        if (topics.length === 0) return 50;

        const avgMastery = topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length;
        const improvingTopics = topics.filter(t => t.trend === 'improving').length;
        const improvingRatio = improvingTopics / topics.length;

        return Math.min(100, avgMastery * 0.7 + improvingRatio * 100 * 0.3);
    }

    private calculateProgressRate(): number {
        if (!this.profile) return 50;

        const topics = Object.values(this.profile.knowledgeMap);
        if (topics.length === 0) return 50;

        // Calculate average progress in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        let totalProgress = 0;
        let topicsWithHistory = 0;

        for (const topic of topics) {
            const recentHistory = topic.recentHistory.filter(h => new Date(h.date) > weekAgo);
            if (recentHistory.length >= 2) {
                const first = recentHistory[recentHistory.length - 1].mastery;
                const last = recentHistory[0].mastery;
                totalProgress += (last - first);
                topicsWithHistory++;
            }
        }

        if (topicsWithHistory === 0) return 50;

        const avgProgress = totalProgress / topicsWithHistory;
        return Math.max(0, Math.min(100, 50 + avgProgress * 5));
    }

    // ═══════════════════════════════════════════════════════
    // PERFORMANCE ANALYSIS
    // ═══════════════════════════════════════════════════════

    private analyzePerformance(): PerformanceAnalysis {
        const questionEvents = this.recentEvents.filter(
            e => e.type === 'question_response'
        ) as QuestionResponseEvent[];

        if (questionEvents.length === 0) {
            return this.getDefaultPerformanceAnalysis();
        }

        // Calculate overall accuracy
        const correctCount = questionEvents.filter(e => e.isCorrect).length;
        const overallAccuracy = correctCount / questionEvents.length;

        // Calculate accuracy trend
        const midpoint = Math.floor(questionEvents.length / 2);
        const recentAccuracy = questionEvents.slice(0, midpoint).filter(e => e.isCorrect).length / midpoint;
        const olderAccuracy = questionEvents.slice(midpoint).filter(e => e.isCorrect).length / (questionEvents.length - midpoint);

        let accuracyTrend: 'improving' | 'stable' | 'declining' = 'stable';
        if (recentAccuracy > olderAccuracy + 0.1) accuracyTrend = 'improving';
        if (recentAccuracy < olderAccuracy - 0.1) accuracyTrend = 'declining';

        // Analyze topics
        const topicStats = this.aggregateTopicStats(questionEvents);

        const weakestTopics = Object.entries(topicStats)
            .filter(([_, stats]) => stats.accuracy < 0.6)
            .map(([topic, stats]) => ({
                topic,
                mastery: this.profile?.knowledgeMap[topic]?.mastery || stats.accuracy * 100,
                errorCount: stats.total - stats.correct
            }))
            .sort((a, b) => a.mastery - b.mastery)
            .slice(0, 5);

        const strongestTopics = Object.entries(topicStats)
            .filter(([_, stats]) => stats.accuracy >= 0.8 && stats.total >= 3)
            .map(([topic, stats]) => ({
                topic,
                mastery: this.profile?.knowledgeMap[topic]?.mastery || stats.accuracy * 100
            }))
            .sort((a, b) => b.mastery - a.mastery)
            .slice(0, 5);

        // Analyze error patterns
        const errorEvents = questionEvents.filter(e => !e.isCorrect);
        const commonErrorPatterns = this.analyzeErrorPatterns(errorEvents);

        // Analyze speed vs accuracy
        const speedAccuracyBalance = this.analyzeSpeedAccuracy(questionEvents);

        return {
            overallAccuracy,
            accuracyTrend,
            weakestTopics,
            strongestTopics,
            commonErrorPatterns,
            speedAccuracyBalance
        };
    }

    private getDefaultPerformanceAnalysis(): PerformanceAnalysis {
        return {
            overallAccuracy: 0,
            accuracyTrend: 'stable',
            weakestTopics: [],
            strongestTopics: [],
            commonErrorPatterns: [],
            speedAccuracyBalance: 'balanced'
        };
    }

    private aggregateTopicStats(events: QuestionResponseEvent[]): Record<string, { total: number; correct: number; accuracy: number }> {
        const stats: Record<string, { total: number; correct: number }> = {};

        for (const event of events) {
            if (!stats[event.topic]) {
                stats[event.topic] = { total: 0, correct: 0 };
            }
            stats[event.topic].total++;
            if (event.isCorrect) stats[event.topic].correct++;
        }

        const result: Record<string, { total: number; correct: number; accuracy: number }> = {};
        for (const [topic, data] of Object.entries(stats)) {
            result[topic] = {
                ...data,
                accuracy: data.total > 0 ? data.correct / data.total : 0
            };
        }

        return result;
    }

    private analyzeErrorPatterns(errorEvents: QuestionResponseEvent[]): { pattern: string; frequency: number }[] {
        const patterns: Record<string, number> = {};

        for (const event of errorEvents) {
            // Quick errors on easy questions
            if (event.timeToAnswer < 10000 && event.questionDifficulty < 5) {
                patterns['Pośpiech na łatwych pytaniach'] = (patterns['Pośpiech na łatwych pytaniach'] || 0) + 1;
            }

            // Changed answer from correct to incorrect
            if (event.changedAnswer && event.originalAnswer === event.correctAnswer) {
                patterns['Zmiana z poprawnej odpowiedzi'] = (patterns['Zmiana z poprawnej odpowiedzi'] || 0) + 1;
            }

            // Long time but still wrong
            if (event.timeToAnswer > 60000) {
                patterns['Długi czas bez sukcesu'] = (patterns['Długi czas bez sukcesu'] || 0) + 1;
            }

            // Multiple hesitations
            if (event.hesitationEvents > 2) {
                patterns['Wielokrotne wahania'] = (patterns['Wielokrotne wahania'] || 0) + 1;
            }
        }

        return Object.entries(patterns)
            .map(([pattern, frequency]) => ({ pattern, frequency }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);
    }

    private analyzeSpeedAccuracy(events: QuestionResponseEvent[]): 'fast_accurate' | 'fast_inaccurate' | 'slow_accurate' | 'slow_inaccurate' | 'balanced' {
        if (events.length === 0) return 'balanced';

        const avgTime = events.reduce((sum, e) => sum + e.timeToAnswer, 0) / events.length;
        const accuracy = events.filter(e => e.isCorrect).length / events.length;

        const isFast = avgTime < 20000;
        const isAccurate = accuracy > 0.7;

        if (isFast && isAccurate) return 'fast_accurate';
        if (isFast && !isAccurate) return 'fast_inaccurate';
        if (!isFast && isAccurate) return 'slow_accurate';
        if (!isFast && !isAccurate) return 'slow_inaccurate';

        return 'balanced';
    }

    // ═══════════════════════════════════════════════════════
    // ANOMALY DETECTION
    // ═══════════════════════════════════════════════════════

    private detectAnomalies(): AnomalyDetection[] {
        const anomalies: AnomalyDetection[] = [];

        // Need sufficient data for anomaly detection
        if (this.recentEvents.length < CONFIG.MIN_DATA_POINTS_FOR_ANOMALY) {
            return anomalies;
        }

        // Check for performance drop
        const performanceAnomaly = this.detectPerformanceDrop();
        if (performanceAnomaly) anomalies.push(performanceAnomaly);

        // Check for engagement drop
        const engagementAnomaly = this.detectEngagementDrop();
        if (engagementAnomaly) anomalies.push(engagementAnomaly);

        // Check for unusual timing
        const timingAnomaly = this.detectUnusualTiming();
        if (timingAnomaly) anomalies.push(timingAnomaly);

        // Check for error spike
        const errorAnomaly = this.detectErrorSpike();
        if (errorAnomaly) anomalies.push(errorAnomaly);

        return anomalies;
    }

    private detectPerformanceDrop(): AnomalyDetection | null {
        const questionEvents = this.recentEvents.filter(
            e => e.type === 'question_response'
        ) as QuestionResponseEvent[];

        if (questionEvents.length < 20) return null;

        const recentEvents = questionEvents.slice(0, 10);
        const olderEvents = questionEvents.slice(10, 20);

        const recentAccuracy = recentEvents.filter(e => e.isCorrect).length / 10;
        const olderAccuracy = olderEvents.filter(e => e.isCorrect).length / 10;

        const drop = olderAccuracy - recentAccuracy;

        if (drop > CONFIG.ACCURACY_DROP_THRESHOLD) {
            return {
                type: 'performance_drop',
                severity: drop > 0.25 ? 'high' : drop > 0.2 ? 'medium' : 'low',
                description: `Spadek dokładności o ${Math.round(drop * 100)}% w ostatnich odpowiedziach`,
                detectedAt: new Date(),
                metric: 'accuracy',
                expectedValue: olderAccuracy,
                actualValue: recentAccuracy,
                deviation: drop
            };
        }

        return null;
    }

    private detectEngagementDrop(): AnomalyDetection | null {
        const sessionAnalysis = this.analyzeSessionPatterns();

        if (sessionAnalysis.daysSinceLastSession >= CONFIG.DAYS_INACTIVE_CRITICAL) {
            return {
                type: 'engagement_drop',
                severity: 'high',
                description: `Brak aktywności od ${sessionAnalysis.daysSinceLastSession} dni`,
                detectedAt: new Date(),
                metric: 'days_since_last_session',
                expectedValue: 1,
                actualValue: sessionAnalysis.daysSinceLastSession,
                deviation: sessionAnalysis.daysSinceLastSession - 1
            };
        }

        if (sessionAnalysis.sessionTrend === 'decreasing' && sessionAnalysis.sessionFrequency < 2) {
            return {
                type: 'engagement_drop',
                severity: 'medium',
                description: 'Znaczący spadek częstotliwości sesji nauki',
                detectedAt: new Date(),
                metric: 'session_frequency',
                expectedValue: 4,
                actualValue: sessionAnalysis.sessionFrequency,
                deviation: 4 - sessionAnalysis.sessionFrequency
            };
        }

        return null;
    }

    private detectUnusualTiming(): AnomalyDetection | null {
        const questionEvents = this.recentEvents.filter(
            e => e.type === 'question_response'
        ) as QuestionResponseEvent[];

        if (questionEvents.length < 10) return null;

        const times = questionEvents.slice(0, 10).map(e => e.timeToAnswer);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

        // Check for unusual slow responses
        const verySlowCount = times.filter(t => t > avgTime * 3).length;

        if (verySlowCount >= 3) {
            return {
                type: 'unusual_timing',
                severity: 'low',
                description: 'Wykryto nietypowo długie czasy odpowiedzi - możliwe rozproszenie',
                detectedAt: new Date(),
                metric: 'response_time',
                expectedValue: avgTime,
                actualValue: avgTime * 3,
                deviation: 2
            };
        }

        return null;
    }

    private detectErrorSpike(): AnomalyDetection | null {
        const questionEvents = this.recentEvents.filter(
            e => e.type === 'question_response'
        ) as QuestionResponseEvent[];

        if (questionEvents.length < 15) return null;

        const recent = questionEvents.slice(0, 5);
        const older = questionEvents.slice(5, 15);

        const recentErrors = recent.filter(e => !e.isCorrect).length;
        const olderErrorRate = older.filter(e => !e.isCorrect).length / 10;

        // If error rate doubled
        if (recentErrors >= 4 && recentErrors / 5 > olderErrorRate * 2) {
            return {
                type: 'error_spike',
                severity: 'medium',
                description: 'Nagły wzrost liczby błędów w ostatnich odpowiedziach',
                detectedAt: new Date(),
                metric: 'error_rate',
                expectedValue: olderErrorRate,
                actualValue: recentErrors / 5,
                deviation: (recentErrors / 5) - olderErrorRate
            };
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════
    // PREDICTIONS
    // ═══════════════════════════════════════════════════════

    private generatePredictions(): BehaviorPredictions {
        const profile = this.profile;
        const sessionAnalysis = this.analyzeSessionPatterns();
        const engagementAnalysis = this.analyzeEngagement();

        // Exam predictions from profile
        const examPrediction = profile?.predictions || {
            predictedExamScore: { value: 50, confidence: 0, range: { min: 30, max: 70 } },
            passProbability: 0.5
        };

        // Next session prediction
        const nextSessionPrediction = {
            likelyTime: sessionAnalysis.optimalSessionTime,
            likelyDuration: Math.min(CONFIG.MAX_SESSION_LENGTH, sessionAnalysis.averageSessionLength || CONFIG.OPTIMAL_SESSION_LENGTH),
            confidence: sessionAnalysis.totalSessions > 5 ? 0.7 : 0.3
        };

        // Churn probability
        const baseChurn = engagementAnalysis.churnRisk;
        const churnProbability = {
            '7_days': Math.min(1, baseChurn * 0.5),
            '14_days': Math.min(1, baseChurn * 0.75),
            '30_days': Math.min(1, baseChurn)
        };

        // Time to mastery for weak topics
        const timeToMastery = this.calculateTimeToMastery();

        return {
            examPassProbability: examPrediction.passProbability,
            expectedExamScore: examPrediction.predictedExamScore,
            nextSessionPrediction,
            churnProbability,
            timeToMastery
        };
    }

    private calculateTimeToMastery(): { topic: string; estimatedDays: number; currentMastery: number; targetMastery: number }[] {
        if (!this.profile) return [];

        const weakTopics = Object.entries(this.profile.knowledgeMap)
            .filter(([_, data]) => data.mastery < CONFIG.STRONG_TOPIC_THRESHOLD)
            .slice(0, 5);

        return weakTopics.map(([topic, data]) => {
            const gap = CONFIG.STRONG_TOPIC_THRESHOLD - data.mastery;
            const progressPerDay = this.estimateProgressPerDay(data);
            const estimatedDays = progressPerDay > 0 ? Math.ceil(gap / progressPerDay) : 30;

            return {
                topic,
                estimatedDays: Math.min(60, estimatedDays),
                currentMastery: data.mastery,
                targetMastery: CONFIG.STRONG_TOPIC_THRESHOLD
            };
        });
    }

    private estimateProgressPerDay(topicData: { recentHistory: Array<{ date: Date; mastery: number }> }): number {
        const history = topicData.recentHistory;
        if (history.length < 2) return 2; // Default assumption

        const sortedHistory = [...history].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const first = sortedHistory[0];
        const last = sortedHistory[sortedHistory.length - 1];

        const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (24 * 60 * 60 * 1000);
        const masteryDiff = last.mastery - first.mastery;

        if (daysDiff <= 0) return 2;

        return Math.max(0.5, masteryDiff / daysDiff);
    }

    // ═══════════════════════════════════════════════════════
    // INSIGHT GENERATION
    // ═══════════════════════════════════════════════════════

    private generateInsights(analysis: BehaviorAnalysis): BehaviorInsight[] {
        const insights: BehaviorInsight[] = [];

        // Engagement insights
        if (analysis.engagementAnalysis.churnRisk > CONFIG.CHURN_RISK_THRESHOLD) {
            insights.push({
                id: crypto.randomUUID(),
                type: 'warning',
                category: 'risk',
                title: 'Wysokie ryzyko rezygnacji',
                description: `Wykryto czynniki ryzyka: ${analysis.engagementAnalysis.churnRiskFactors.join(', ')}`,
                priority: 9,
                timestamp: new Date(),
                metrics: { churnRisk: analysis.engagementAnalysis.churnRisk },
                actionable: {
                    action: 'Zachęć użytkownika do powrotu',
                    reason: 'Długa przerwa zwiększa prawdopodobieństwo porzucenia nauki',
                    expectedImpact: 0.3,
                    urgency: 'immediate'
                }
            });
        }

        // Streak insights
        if (analysis.engagementAnalysis.streakHealth === 'at_risk') {
            insights.push({
                id: crypto.randomUUID(),
                type: 'warning',
                category: 'engagement',
                title: 'Seria zagrożona!',
                description: 'Aby utrzymać serię, musisz dziś odpowiedzieć na przynajmniej jedno pytanie',
                priority: 8,
                timestamp: new Date(),
                actionable: {
                    action: 'Rozpocznij szybką sesję',
                    reason: 'Utrzymanie serii buduje nawyk nauki',
                    expectedImpact: 0.5,
                    urgency: 'immediate'
                }
            });
        }

        // Performance insights
        if (analysis.performanceAnalysis.accuracyTrend === 'improving') {
            insights.push({
                id: crypto.randomUUID(),
                type: 'success',
                category: 'performance',
                title: 'Świetny postęp!',
                description: `Twoja dokładność rośnie. Obecna: ${Math.round(analysis.performanceAnalysis.overallAccuracy * 100)}%`,
                priority: 5,
                timestamp: new Date()
            });
        }

        // Weak topics insights
        if (analysis.performanceAnalysis.weakestTopics.length > 0) {
            const weakest = analysis.performanceAnalysis.weakestTopics[0];
            insights.push({
                id: crypto.randomUUID(),
                type: 'info',
                category: 'learning_pattern',
                title: 'Obszar do poprawy',
                description: `Temat "${weakest.topic}" wymaga więcej uwagi (${Math.round(weakest.mastery)}% opanowania)`,
                priority: 6,
                timestamp: new Date(),
                actionable: {
                    action: `Skup się na temacie: ${weakest.topic}`,
                    reason: 'Poprawa najsłabszych obszarów ma największy wpływ na wynik egzaminu',
                    expectedImpact: 0.4,
                    urgency: 'soon'
                }
            });
        }

        // Anomaly insights
        for (const anomaly of analysis.anomalies) {
            insights.push({
                id: crypto.randomUUID(),
                type: 'warning',
                category: 'anomaly',
                title: this.getAnomalyTitle(anomaly.type),
                description: anomaly.description,
                priority: anomaly.severity === 'high' ? 8 : anomaly.severity === 'medium' ? 6 : 4,
                timestamp: anomaly.detectedAt,
                metrics: {
                    expected: anomaly.expectedValue,
                    actual: anomaly.actualValue,
                    deviation: anomaly.deviation
                }
            });
        }

        // Error pattern insights
        for (const pattern of analysis.performanceAnalysis.commonErrorPatterns.slice(0, 2)) {
            if (pattern.frequency >= 3) {
                insights.push({
                    id: crypto.randomUUID(),
                    type: 'info',
                    category: 'learning_pattern',
                    title: 'Wzorzec błędów',
                    description: `Często występuje: "${pattern.pattern}" (${pattern.frequency} razy)`,
                    priority: 5,
                    timestamp: new Date()
                });
            }
        }

        // Sort by priority
        return insights.sort((a, b) => b.priority - a.priority);
    }

    private getAnomalyTitle(type: AnomalyDetection['type']): string {
        const titles: Record<AnomalyDetection['type'], string> = {
            performance_drop: 'Spadek wydajności',
            engagement_drop: 'Spadek zaangażowania',
            behavior_change: 'Zmiana zachowania',
            unusual_timing: 'Nietypowe czasy odpowiedzi',
            error_spike: 'Nagły wzrost błędów'
        };
        return titles[type] || 'Wykryto anomalię';
    }

    private generateRealTimeInsights(event: LearningEvent): BehaviorInsight[] {
        const insights: BehaviorInsight[] = [];

        if (event.type === 'question_response') {
            const qEvent = event as QuestionResponseEvent;

            // Achievement: Streak milestone
            if (qEvent.questionsInSession === 10 || qEvent.questionsInSession === 25 || qEvent.questionsInSession === 50) {
                insights.push({
                    id: crypto.randomUUID(),
                    type: 'success',
                    category: 'achievement',
                    title: `${qEvent.questionsInSession} pytań w sesji!`,
                    description: 'Świetna praca - kontynuuj!',
                    priority: 4,
                    timestamp: new Date()
                });
            }

            // Warning: Multiple wrong answers in a row
            const recentQuestions = this.recentEvents
                .filter(e => e.type === 'question_response')
                .slice(0, 5) as QuestionResponseEvent[];

            const wrongInRow = recentQuestions.filter(e => !e.isCorrect).length;
            if (wrongInRow >= 4) {
                insights.push({
                    id: crypto.randomUUID(),
                    type: 'action',
                    category: 'recommendation',
                    title: 'Czas na przerwę?',
                    description: 'Kilka błędów z rzędu - może warto zrobić krótką przerwę lub zmienić temat',
                    priority: 7,
                    timestamp: new Date(),
                    actionable: {
                        action: 'Zrób 5-minutową przerwę',
                        reason: 'Przerwy pomagają w konsolidacji wiedzy',
                        expectedImpact: 0.3,
                        urgency: 'immediate'
                    }
                });
            }
        }

        return insights;
    }

    // ═══════════════════════════════════════════════════════
    // RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════

    private generateRecommendations(analysis: BehaviorAnalysis): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Study focus recommendation
        if (analysis.performanceAnalysis.weakestTopics.length > 0) {
            const topics = analysis.performanceAnalysis.weakestTopics.slice(0, 3);
            recommendations.push({
                id: crypto.randomUUID(),
                type: 'study_focus',
                title: 'Skup się na słabych obszarach',
                description: `Rekomendowane tematy do nauki: ${topics.map(t => t.topic).join(', ')}`,
                priority: 8,
                expectedImpact: 0.4,
                relatedTopics: topics.map(t => t.topic)
            });
        }

        // Timing recommendation
        if (analysis.sessionAnalysis.optimalSessionTime) {
            recommendations.push({
                id: crypto.randomUUID(),
                type: 'timing',
                title: 'Optymalny czas nauki',
                description: `Twoje najlepsze wyniki osiągasz ${this.translateTimeOfDay(analysis.sessionAnalysis.optimalSessionTime)}. Zaplanuj sesje na tę porę.`,
                priority: 5,
                expectedImpact: 0.2
            });
        }

        // Break recommendation
        if (analysis.performanceAnalysis.speedAccuracyBalance === 'fast_inaccurate') {
            recommendations.push({
                id: crypto.randomUUID(),
                type: 'break',
                title: 'Zwolnij tempo',
                description: 'Twoje szybkie odpowiedzi często są błędne. Poświęć więcej czasu na przemyślenie pytania.',
                priority: 7,
                expectedImpact: 0.3
            });
        }

        // Review recommendation
        const decliningTopics = Object.entries(this.profile?.knowledgeMap || {})
            .filter(([_, data]) => data.trend === 'declining')
            .map(([topic]) => topic);

        if (decliningTopics.length > 0) {
            recommendations.push({
                id: crypto.randomUUID(),
                type: 'review',
                title: 'Powtórz materiał',
                description: `Te tematy wymagają powtórzenia: ${decliningTopics.slice(0, 3).join(', ')}`,
                priority: 7,
                expectedImpact: 0.35,
                relatedTopics: decliningTopics
            });
        }

        // Challenge recommendation
        if (analysis.performanceAnalysis.strongestTopics.length >= 3 && analysis.performanceAnalysis.overallAccuracy > 0.8) {
            recommendations.push({
                id: crypto.randomUUID(),
                type: 'challenge',
                title: 'Czas na wyzwanie!',
                description: 'Osiągasz świetne wyniki. Spróbuj trudniejszych pytań lub nowych tematów.',
                priority: 4,
                expectedImpact: 0.2
            });
        }

        // Motivation recommendation
        if (analysis.engagementAnalysis.engagementScore < CONFIG.ENGAGEMENT_WARNING_THRESHOLD) {
            const topMotivator = analysis.engagementAnalysis.motivationFactors[0];
            if (topMotivator) {
                recommendations.push({
                    id: crypto.randomUUID(),
                    type: 'motivation',
                    title: 'Zmotywuj się!',
                    description: this.getMotivationMessage(topMotivator.factor),
                    priority: 6,
                    expectedImpact: 0.25
                });
            }
        }

        return recommendations.sort((a, b) => b.priority - a.priority);
    }

    private translateTimeOfDay(time: 'morning' | 'afternoon' | 'evening' | 'night'): string {
        const translations: Record<string, string> = {
            morning: 'rano (5:00-12:00)',
            afternoon: 'po południu (12:00-17:00)',
            evening: 'wieczorem (17:00-21:00)',
            night: 'w nocy (21:00-5:00)'
        };
        return translations[time] || time;
    }

    private getMotivationMessage(factor: string): string {
        const messages: Record<string, string> = {
            streaks: 'Buduj swoją serię - każdy dzień nauki to krok do sukcesu!',
            achievements: 'Masz już wiele osiągnięć - zdobądź kolejne!',
            progress: 'Zobacz jak daleko zaszedłeś - nie zatrzymuj się teraz!',
            competition: 'Rywalizuj z innymi - pokaż na co Cię stać!',
            mastery: 'Dąż do perfekcji - każde pytanie Cię do niej przybliża!'
        };
        return messages[factor] || 'Kontynuuj naukę - jesteś na dobrej drodze!';
    }

    // ═══════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════

    /**
     * Get quick insights without full analysis
     */
    async getQuickInsights(): Promise<BehaviorInsight[]> {
        if (!this.profile) {
            await this.initialize();
        }

        const insights: BehaviorInsight[] = [];
        const sessionAnalysis = this.analyzeSessionPatterns();
        const engagementAnalysis = this.analyzeEngagement();

        // High priority insights only
        if (engagementAnalysis.streakHealth === 'at_risk') {
            insights.push({
                id: crypto.randomUUID(),
                type: 'warning',
                category: 'engagement',
                title: 'Seria zagrożona!',
                description: 'Odpowiedz na pytanie, aby utrzymać serię',
                priority: 9,
                timestamp: new Date()
            });
        }

        if (sessionAnalysis.daysSinceLastSession >= CONFIG.DAYS_INACTIVE_WARNING) {
            insights.push({
                id: crypto.randomUUID(),
                type: 'warning',
                category: 'engagement',
                title: 'Tęsknimy za Tobą!',
                description: `Minęło ${sessionAnalysis.daysSinceLastSession} dni od ostatniej nauki`,
                priority: 8,
                timestamp: new Date()
            });
        }

        return insights;
    }

    /**
     * Check if intervention is needed
     */
    async shouldIntervene(): Promise<{ shouldIntervene: boolean; reason?: string; type?: string }> {
        if (!this.profile) {
            await this.initialize();
        }

        const engagementAnalysis = this.analyzeEngagement();
        const sessionAnalysis = this.analyzeSessionPatterns();

        if (engagementAnalysis.churnRisk > CONFIG.CHURN_RISK_THRESHOLD) {
            return {
                shouldIntervene: true,
                reason: 'Wysokie ryzyko churnu',
                type: 'retention'
            };
        }

        if (sessionAnalysis.daysSinceLastSession >= CONFIG.DAYS_INACTIVE_CRITICAL) {
            return {
                shouldIntervene: true,
                reason: `${sessionAnalysis.daysSinceLastSession} dni nieaktywności`,
                type: 'reactivation'
            };
        }

        if (engagementAnalysis.streakHealth === 'at_risk') {
            return {
                shouldIntervene: true,
                reason: 'Seria zagrożona',
                type: 'streak_reminder'
            };
        }

        return { shouldIntervene: false };
    }

    /**
     * Get personalized notification content
     */
    async getNotificationContent(): Promise<{ title: string; body: string; type: string } | null> {
        const intervention = await this.shouldIntervene();

        if (!intervention.shouldIntervene) {
            return null;
        }

        const engagementAnalysis = this.analyzeEngagement();
        const topMotivator = engagementAnalysis.motivationFactors[0]?.factor || 'progress';

        const notifications: Record<string, { title: string; body: string }> = {
            retention: {
                title: 'Wróć do nauki!',
                body: this.getMotivationMessage(topMotivator)
            },
            reactivation: {
                title: 'Tęsknimy za Tobą!',
                body: 'Twój egzamin się zbliża. Każda minuta nauki przybliża Cię do sukcesu.'
            },
            streak_reminder: {
                title: '🔥 Seria zagrożona!',
                body: 'Odpowiedz na jedno pytanie, aby utrzymać swoją serię nauki.'
            }
        };

        const content = notifications[intervention.type || 'retention'];
        return { ...content, type: intervention.type || 'retention' };
    }
}

// ═══════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════

export async function createBehaviorAgent(userId: string): Promise<UserBehaviorAgent> {
    const agent = new UserBehaviorAgent(userId);
    await agent.initialize();
    return agent;
}

// ═══════════════════════════════════════════════════════
// SINGLETON MANAGER
// ═══════════════════════════════════════════════════════

const agentCache: Map<string, { agent: UserBehaviorAgent; expiry: Date }> = new Map();

export async function getBehaviorAgent(userId: string): Promise<UserBehaviorAgent> {
    const cached = agentCache.get(userId);

    if (cached && cached.expiry > new Date()) {
        return cached.agent;
    }

    const agent = await createBehaviorAgent(userId);

    // Cache for 10 minutes
    agentCache.set(userId, {
        agent,
        expiry: new Date(Date.now() + 10 * 60 * 1000)
    });

    return agent;
}
