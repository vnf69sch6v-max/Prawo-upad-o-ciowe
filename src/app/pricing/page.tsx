'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getStripe } from '@/lib/stripe/client';
import { PLANS, calculateSavingsPercent } from '@/lib/plans';
import {
    Check,
    Zap,
    Crown,
    Rocket,
    Loader2,
    ArrowLeft
} from 'lucide-react';

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { currentPlan, isPremium } = useSubscription();
    const [loading, setLoading] = useState<string | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    async function handleSubscribe(planId: 'premium' | 'pro') {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        setLoading(planId);

        try {
            const priceKey = billingPeriod === 'yearly'
                ? `${planId}_yearly`
                : `${planId}_monthly`;

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: priceKey,
                    userId: user.uid,
                    userEmail: user.email,
                    billingPeriod,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setLoading(null);
        }
    }

    const plans = [
        {
            id: 'free' as const,
            name: 'Free',
            icon: <Zap size={24} />,
            price: 0,
            priceYearly: 0,
            description: PLANS.free.description,
            features: PLANS.free.featuresDisplay,
            gradient: 'from-gray-400 to-gray-600',
            popular: false,
        },
        {
            id: 'premium' as const,
            name: 'Premium',
            icon: <Crown size={24} />,
            price: PLANS.premium.priceMonthly,
            priceYearly: PLANS.premium.priceYearly,
            description: PLANS.premium.description,
            features: PLANS.premium.featuresDisplay,
            gradient: 'from-[#1a365d] to-[#2563eb]',
            popular: true,
            badge: PLANS.premium.badge,
        },
        {
            id: 'pro' as const,
            name: 'Pro',
            icon: <Rocket size={24} />,
            price: PLANS.pro.priceMonthly,
            priceYearly: PLANS.pro.priceYearly,
            description: PLANS.pro.description,
            features: PLANS.pro.featuresDisplay,
            gradient: 'from-purple-600 to-pink-600',
            popular: false,
            badge: PLANS.pro.badge,
        },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    Wróć
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Wybierz swój plan</h1>
                    <p className="text-lg text-[var(--text-muted)] mb-8">
                        Odblokuj pełny potencjał nauki prawa
                    </p>

                    {/* Billing toggle */}
                    <div className="inline-flex items-center gap-4 p-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-lg transition-all ${billingPeriod === 'monthly'
                                ? 'bg-[#1a365d] text-white'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Miesięcznie
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${billingPeriod === 'yearly'
                                ? 'bg-[#1a365d] text-white'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Rocznie
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                -17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;
                        const price = billingPeriod === 'yearly'
                            ? Math.round(plan.priceYearly / 12)
                            : plan.price;

                        return (
                            <div
                                key={plan.id}
                                className={`relative lex-card overflow-hidden ${plan.popular ? 'ring-2 ring-[#1a365d] scale-105' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#1a365d] to-[#2563eb] text-white text-xs px-4 py-1 rounded-bl-xl">
                                        Najpopularniejszy
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="text-center mb-6">
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} text-white mb-4`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="text-sm text-[var(--text-muted)]">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="text-center mb-6">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold">{price}</span>
                                        <span className="text-[var(--text-muted)]">zł</span>
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">
                                        / miesiąc
                                        {billingPeriod === 'yearly' && plan.priceYearly > 0 && (
                                            <span className="block text-xs mt-1">
                                                ({plan.priceYearly} zł/rok)
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                {plan.id === 'free' ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-medium"
                                    >
                                        {isCurrentPlan ? 'Twój obecny plan' : 'Darmowy'}
                                    </button>
                                ) : isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-medium"
                                    >
                                        ✓ Aktywny
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={loading !== null}
                                        className={`w-full py-3 rounded-xl text-white font-medium transition-all bg-gradient-to-r ${plan.gradient} hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                                    >
                                        {loading === plan.id ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            'Wybierz plan'
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FAQ / Trust elements */}
                <div className="text-center mt-16 text-[var(--text-muted)]">
                    <p className="mb-2">🔒 Bezpieczne płatności przez Stripe</p>
                    <p className="text-sm">Możesz anulować w dowolnym momencie</p>
                </div>
            </div>
        </div>
    );
}
