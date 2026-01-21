import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { priceId, userId, userEmail, billingPeriod = 'monthly' } = body;

        if (!userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing userId or userEmail' },
                { status: 400 }
            );
        }

        // Determine price ID
        let stripePriceId = priceId;
        if (!stripePriceId) {
            // Default to premium monthly
            stripePriceId = billingPeriod === 'yearly'
                ? STRIPE_PRICES.premium_yearly
                : STRIPE_PRICES.premium_monthly;
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                userId,
                plan: priceId?.includes('pro') ? 'pro' : 'premium',
            },
            subscription_data: {
                metadata: {
                    userId,
                },
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
