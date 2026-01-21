'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase/client';
import { PLANS } from '@/lib/constants';

export type PlanType = 'free' | 'premium' | 'pro';

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at: string | null;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: PlanType;
    description: string | null;
    price_monthly: number;
    price_quarterly: number | null;
    price_yearly: number | null;
    questions_per_day: number | null;
    ai_explanations_per_day: number | null;
    features: string[];
    is_active: boolean;
}

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscription() {
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user's subscription
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('*, subscription_plans(*)')
                    .eq('user_id', user.uid)
                    .eq('status', 'active')
                    .single();

                if (subData) {
                    setSubscription(subData);
                    setPlan(subData.subscription_plans);
                } else {
                    // Default to free plan
                    const { data: freePlan } = await supabase
                        .from('subscription_plans')
                        .select('*')
                        .eq('slug', 'free')
                        .single();

                    if (freePlan) setPlan(freePlan);
                }
            } catch (err) {
                console.error('Error fetching subscription:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchSubscription();
    }, [user?.uid]);

    // Get current plan type
    const currentPlan: PlanType = (plan?.slug as PlanType) || 'free';

    // Check if user has premium features
    const isPremium = currentPlan === 'premium' || currentPlan === 'pro';
    const isPro = currentPlan === 'pro';

    // Get plan limits
    const questionsPerDay = plan?.questions_per_day ?? 50;
    const aiExplanationsPerDay = plan?.ai_explanations_per_day ?? 5;

    // Check if subscription is active
    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

    // Get days until subscription ends
    const getDaysRemaining = (): number | null => {
        if (!subscription?.current_period_end) return null;
        const end = new Date(subscription.current_period_end);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    // Get plan features
    const getPlanFeatures = (planType: PlanType = currentPlan): readonly string[] => {
        return PLANS[planType]?.features || [];
    };

    return {
        subscription,
        plan,
        loading,
        currentPlan,
        isPremium,
        isPro,
        isActive,
        questionsPerDay,
        aiExplanationsPerDay,
        getDaysRemaining,
        getPlanFeatures
    };
}
