// API Route: Stripe Webhook Handler

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle events
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    // Determine tier based on price
    const tier = priceId.includes('enterprise') ? 'enterprise' : 'pro';
    const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

    await adminDb.collection('users').doc(userId).update({
        tier,
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(periodEnd * 1000),
        updatedAt: new Date(),
    });

    // Create subscription record
    await adminDb.collection('subscriptions').doc(userId).set({
        userId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        status: 'active',
        tier,
        currentPeriodEnd: new Date(periodEnd * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const priceId = subscription.items.data[0].price.id;
    const tier = priceId.includes('enterprise') ? 'enterprise' : 'pro';
    const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

    const statusMap: Record<string, string> = {
        active: 'active',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'unpaid',
        trialing: 'trialing',
    };

    await adminDb.collection('users').doc(userId).update({
        tier: subscription.status === 'active' ? tier : 'free',
        subscriptionStatus: statusMap[subscription.status] || 'active',
        subscriptionEndDate: new Date(periodEnd * 1000),
        updatedAt: new Date(),
    });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await adminDb.collection('users').doc(userId).update({
        tier: 'free',
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
    });
}
