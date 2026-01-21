import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
    if (!stripeInstance) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error('Missing STRIPE_SECRET_KEY environment variable');
        }
        stripeInstance = new Stripe(secretKey);
    }
    return stripeInstance;
}

// Export as getter to ensure lazy initialization
export const stripe = new Proxy({} as Stripe, {
    get(_, prop) {
        const instance = getStripeInstance();
        const value = instance[prop as keyof Stripe];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});

// Price IDs - te trzeba utworzyć w Stripe Dashboard
export const STRIPE_PRICES = {
    premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
} as const;
