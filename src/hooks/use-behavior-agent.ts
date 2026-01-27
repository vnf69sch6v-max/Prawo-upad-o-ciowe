'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type {
    BehaviorAnalysis,
    BehaviorInsight,
    Recommendation,
    BehaviorPredictions
} from '@/lib/agents';
import type { LearningEvent } from '@/lib/profiling/types';

interface UseBehaviorAgentOptions {
    autoFetch?: boolean;
    fetchInterval?: number; // ms, 0 = no auto refresh
}

interface UseBehaviorAgentReturn {
    // Data
    analysis: BehaviorAnalysis | null;
    insights: BehaviorInsight[];
    recommendations: Recommendation[];
    predictions: BehaviorPredictions | null;

    // States
    loading: boolean;
    error: string | null;

    // Actions
    fetchAnalysis: () => Promise<void>;
    fetchQuickInsights: () => Promise<BehaviorInsight[]>;
    processEvent: (event: LearningEvent) => Promise<BehaviorInsight[]>;
    checkIntervention: () => Promise<{
        shouldIntervene: boolean;
        reason?: string;
        notification?: { title: string; body: string; type: string } | null;
    }>;

    // Helpers
    getHighPriorityInsights: (minPriority?: number) => BehaviorInsight[];
    getTopRecommendations: (count?: number) => Recommendation[];
}

export function useBehaviorAgent(options: UseBehaviorAgentOptions = {}): UseBehaviorAgentReturn {
    const { autoFetch = true, fetchInterval = 0 } = options;
    const { user, getIdToken } = useAuth();

    const [analysis, setAnalysis] = useState<BehaviorAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch full analysis
    const fetchAnalysis = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const token = await getIdToken();
            const response = await fetch('/api/behavior?type=full', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch behavior analysis');
            }

            const data = await response.json();
            setAnalysis(data.data);
        } catch (err) {
            console.error('Error fetching behavior analysis:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [user, getIdToken]);

    // Fetch quick insights
    const fetchQuickInsights = useCallback(async (): Promise<BehaviorInsight[]> => {
        if (!user) return [];

        try {
            const token = await getIdToken();
            const response = await fetch('/api/behavior?type=quick', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quick insights');
            }

            const data = await response.json();
            return data.data?.insights || [];
        } catch (err) {
            console.error('Error fetching quick insights:', err);
            return [];
        }
    }, [user, getIdToken]);

    // Process a new event
    const processEvent = useCallback(async (event: LearningEvent): Promise<BehaviorInsight[]> => {
        if (!user) return [];

        try {
            const token = await getIdToken();
            const response = await fetch('/api/behavior', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event })
            });

            if (!response.ok) {
                throw new Error('Failed to process event');
            }

            const data = await response.json();
            return data.data?.insights || [];
        } catch (err) {
            console.error('Error processing event:', err);
            return [];
        }
    }, [user, getIdToken]);

    // Check if intervention is needed
    const checkIntervention = useCallback(async () => {
        if (!user) {
            return { shouldIntervene: false };
        }

        try {
            const token = await getIdToken();
            const response = await fetch('/api/behavior?type=intervention', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check intervention');
            }

            const data = await response.json();
            return data.data || { shouldIntervene: false };
        } catch (err) {
            console.error('Error checking intervention:', err);
            return { shouldIntervene: false };
        }
    }, [user, getIdToken]);

    // Helper: Get high priority insights
    const getHighPriorityInsights = useCallback((minPriority = 7): BehaviorInsight[] => {
        if (!analysis) return [];
        return analysis.insights.filter(i => i.priority >= minPriority);
    }, [analysis]);

    // Helper: Get top recommendations
    const getTopRecommendations = useCallback((count = 3): Recommendation[] => {
        if (!analysis) return [];
        return analysis.recommendations.slice(0, count);
    }, [analysis]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch && user) {
            fetchAnalysis();
        }
    }, [autoFetch, user, fetchAnalysis]);

    // Set up interval refresh
    useEffect(() => {
        if (fetchInterval > 0 && user) {
            intervalRef.current = setInterval(fetchAnalysis, fetchInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchInterval, user, fetchAnalysis]);

    return {
        // Data
        analysis,
        insights: analysis?.insights || [],
        recommendations: analysis?.recommendations || [],
        predictions: analysis?.predictions || null,

        // States
        loading,
        error,

        // Actions
        fetchAnalysis,
        fetchQuickInsights,
        processEvent,
        checkIntervention,

        // Helpers
        getHighPriorityInsights,
        getTopRecommendations
    };
}

// Simplified hook for just insights
export function useBehaviorInsights(minPriority = 3) {
    const { user, getIdToken } = useAuth();
    const [insights, setInsights] = useState<BehaviorInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = await getIdToken();
                const response = await fetch(`/api/behavior/insights?minPriority=${minPriority}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setInsights(data.data?.insights || []);
                }
            } catch (err) {
                console.error('Error fetching insights:', err);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [user, getIdToken, minPriority]);

    return { insights, loading };
}
