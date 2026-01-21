/**
 * Smart AI Explanation Cache
 * Cache-first strategy for AI-generated explanations
 */

import { supabase, isSupabaseAvailable } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type ExplanationType = 'basic' | 'detailed' | 'comparison';

export interface CachedExplanation {
    cacheKey: string;
    questionId: string;
    explanationType: ExplanationType;
    content: string;
    modelUsed: string;
    tokensUsed: number;
    createdAt: Date;
}

export interface ExplanationResult {
    source: 'local' | 'database' | 'generated';
    content: string;
    cached: boolean;
}

// ═══════════════════════════════════════════════════════
// LOCAL MEMORY CACHE
// ═══════════════════════════════════════════════════════

const localCache = new Map<string, string>();

// ═══════════════════════════════════════════════════════
// CACHE KEY GENERATION
// ═══════════════════════════════════════════════════════

/**
 * Generate a unique cache key for an explanation
 */
export function generateCacheKey(
    questionId: string,
    explanationType: ExplanationType = 'basic'
): string {
    return `expl_${questionId}_${explanationType}`;
}

// ═══════════════════════════════════════════════════════
// GET EXPLANATION (CACHE-FIRST STRATEGY)
// ═══════════════════════════════════════════════════════

/**
 * Get explanation with cache-first strategy:
 * 1. Check local memory cache
 * 2. Check database cache
 * 3. Generate new (if API available)
 */
export async function getExplanation(
    questionId: string,
    questionData: {
        question: string;
        correctAnswer: string;
        options: Record<string, string>;
        article?: string;
        domain: string;
    },
    explanationType: ExplanationType = 'basic'
): Promise<ExplanationResult> {
    const cacheKey = generateCacheKey(questionId, explanationType);

    // 1. Check local cache (fastest)
    if (localCache.has(cacheKey)) {
        return {
            source: 'local',
            content: localCache.get(cacheKey)!,
            cached: true
        };
    }

    // 2. Check database cache
    if (isSupabaseAvailable()) {
        const { data: cached } = await supabase
            .from('explanation_cache')
            .select('content')
            .eq('cache_key', cacheKey)
            .single();

        if (cached) {
            // Store in local cache for faster access
            localCache.set(cacheKey, cached.content);
            return {
                source: 'database',
                content: cached.content,
                cached: true
            };
        }
    }

    // 3. Generate fallback explanation (no AI, just structured)
    const fallback = generateFallbackExplanation(questionData, explanationType);

    return {
        source: 'generated',
        content: fallback,
        cached: false
    };
}

// ═══════════════════════════════════════════════════════
// SAVE TO CACHE
// ═══════════════════════════════════════════════════════

/**
 * Save explanation to cache (both local and database)
 */
export async function saveToCache(
    questionId: string,
    content: string,
    explanationType: ExplanationType = 'basic',
    modelUsed: string = 'fallback',
    tokensUsed: number = 0
): Promise<void> {
    const cacheKey = generateCacheKey(questionId, explanationType);

    // Save to local cache
    localCache.set(cacheKey, content);

    // Save to database
    if (isSupabaseAvailable()) {
        await supabase
            .from('explanation_cache')
            .upsert({
                cache_key: cacheKey,
                question_id: questionId,
                explanation_type: explanationType,
                content,
                model_used: modelUsed,
                tokens_used: tokensUsed,
                created_at: new Date().toISOString()
            });
    }
}

// ═══════════════════════════════════════════════════════
// FALLBACK EXPLANATION GENERATOR
// ═══════════════════════════════════════════════════════

/**
 * Generate a structured explanation without AI
 * Used when AI is not available or as fallback
 */
function generateFallbackExplanation(
    questionData: {
        question: string;
        correctAnswer: string;
        options: Record<string, string>;
        article?: string;
        domain: string;
    },
    type: ExplanationType
): string {
    const { question, correctAnswer, options, article, domain } = questionData;

    const domainNames: Record<string, string> = {
        'ksh': 'Kodeks spółek handlowych',
        'prawo_upadlosciowe': 'Prawo upadłościowe',
        'prawo_cywilne': 'Kodeks cywilny',
        'kc': 'Kodeks cywilny'
    };

    const correctText = options[correctAnswer] || correctAnswer;
    const domainName = domainNames[domain] || domain;

    if (type === 'basic') {
        return `**Poprawna odpowiedź: ${correctAnswer}**\n\n${correctText}\n\n${article ? `📚 Podstawa prawna: ${article} (${domainName})` : ''}`;
    }

    if (type === 'detailed') {
        let explanation = `# Wyjaśnienie\n\n`;
        explanation += `**Pytanie:** ${question}\n\n`;
        explanation += `**Poprawna odpowiedź:** ${correctAnswer}) ${correctText}\n\n`;

        if (article) {
            explanation += `## Podstawa prawna\n${article} - ${domainName}\n\n`;
        }

        explanation += `## Dlaczego pozostałe odpowiedzi są błędne?\n\n`;
        for (const [key, value] of Object.entries(options)) {
            if (key !== correctAnswer && value) {
                explanation += `- **${key})** ${value} - ❌\n`;
            }
        }

        return explanation;
    }

    return `Poprawna odpowiedź: ${correctAnswer}`;
}

// ═══════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════

/**
 * Check which questions have cached explanations
 */
export async function checkCacheStatus(
    questionIds: string[],
    explanationType: ExplanationType = 'basic'
): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};

    // Initialize all as false
    for (const id of questionIds) {
        result[id] = false;
    }

    if (!isSupabaseAvailable() || questionIds.length === 0) {
        return result;
    }

    const cacheKeys = questionIds.map(id => generateCacheKey(id, explanationType));

    const { data: cached } = await supabase
        .from('explanation_cache')
        .select('cache_key')
        .in('cache_key', cacheKeys);

    if (cached) {
        for (const item of cached) {
            // Extract question ID from cache key
            const parts = item.cache_key.split('_');
            const questionId = parts[1];
            result[questionId] = true;
        }
    }

    return result;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
    totalCached: number;
    byType: Record<string, number>;
    oldestEntry: Date | null;
    newestEntry: Date | null;
}> {
    if (!isSupabaseAvailable()) {
        return {
            totalCached: 0,
            byType: {},
            oldestEntry: null,
            newestEntry: null
        };
    }

    const { data, count } = await supabase
        .from('explanation_cache')
        .select('explanation_type, created_at', { count: 'exact' })
        .order('created_at', { ascending: true });

    if (!data || data.length === 0) {
        return {
            totalCached: 0,
            byType: {},
            oldestEntry: null,
            newestEntry: null
        };
    }

    const byType: Record<string, number> = {};
    for (const item of data) {
        const type = item.explanation_type || 'basic';
        byType[type] = (byType[type] || 0) + 1;
    }

    return {
        totalCached: count || data.length,
        byType,
        oldestEntry: new Date(data[0].created_at),
        newestEntry: new Date(data[data.length - 1].created_at)
    };
}

// ═══════════════════════════════════════════════════════
// CLEAR CACHE
// ═══════════════════════════════════════════════════════

/**
 * Clear local memory cache
 */
export function clearLocalCache(): void {
    localCache.clear();
}

/**
 * Get local cache size
 */
export function getLocalCacheSize(): number {
    return localCache.size;
}
