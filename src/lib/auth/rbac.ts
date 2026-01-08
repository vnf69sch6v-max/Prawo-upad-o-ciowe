// RBAC - Role-Based Access Control

export type UserTier = 'free' | 'pro' | 'enterprise';

export interface Permission {
    feature: string;
    allowed: boolean;
    limit?: number;
}

export const TIER_PERMISSIONS: Record<UserTier, Record<string, Permission>> = {
    free: {
        flashcards: { feature: 'flashcards', allowed: true, limit: 50 },
        exams: { feature: 'exams', allowed: true, limit: 1 },
        aiAssistant: { feature: 'aiAssistant', allowed: true, limit: 5 },
        analytics: { feature: 'analytics', allowed: true },
        export: { feature: 'export', allowed: false },
        radarChart: { feature: 'radarChart', allowed: false },
        predictions: { feature: 'predictions', allowed: false },
        customDecks: { feature: 'customDecks', allowed: true, limit: 3 },
    },
    pro: {
        flashcards: { feature: 'flashcards', allowed: true, limit: -1 },
        exams: { feature: 'exams', allowed: true, limit: -1 },
        aiAssistant: { feature: 'aiAssistant', allowed: true, limit: 50 },
        analytics: { feature: 'analytics', allowed: true },
        export: { feature: 'export', allowed: true },
        radarChart: { feature: 'radarChart', allowed: true },
        predictions: { feature: 'predictions', allowed: false },
        customDecks: { feature: 'customDecks', allowed: true, limit: -1 },
    },
    enterprise: {
        flashcards: { feature: 'flashcards', allowed: true, limit: -1 },
        exams: { feature: 'exams', allowed: true, limit: -1 },
        aiAssistant: { feature: 'aiAssistant', allowed: true, limit: -1 },
        analytics: { feature: 'analytics', allowed: true },
        export: { feature: 'export', allowed: true },
        radarChart: { feature: 'radarChart', allowed: true },
        predictions: { feature: 'predictions', allowed: true },
        customDecks: { feature: 'customDecks', allowed: true, limit: -1 },
        api: { feature: 'api', allowed: true },
    },
};

export function hasPermission(tier: UserTier, feature: string): boolean {
    return TIER_PERMISSIONS[tier]?.[feature]?.allowed ?? false;
}

export function getLimit(tier: UserTier, feature: string): number {
    return TIER_PERMISSIONS[tier]?.[feature]?.limit ?? 0;
}

export function checkUsageLimit(
    tier: UserTier,
    feature: string,
    currentUsage: number
): { allowed: boolean; remaining: number } {
    const limit = getLimit(tier, feature);

    if (limit === -1) {
        return { allowed: true, remaining: Infinity };
    }

    return {
        allowed: currentUsage < limit,
        remaining: Math.max(0, limit - currentUsage),
    };
}
