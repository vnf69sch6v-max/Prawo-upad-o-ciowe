// API Route: Create Stripe Checkout Session

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();
        const { priceId, billing = 'monthly' } = body;

        if (!priceId) {
            return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
        }

        // Get or create Stripe customer
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data()!;

        let customerId = userData.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userData.email,
                name: userData.displayName,
                metadata: { userId },
            });
            customerId = customer.id;

            await adminDb.collection('users').doc(userId).update({
                stripeCustomerId: customerId,
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
            metadata: { userId, billing },
            subscription_data: {
                metadata: { userId },
            },
        });

        return NextResponse.json({
            success: true,
            data: { url: session.url },
        });

    } catch (error) {
        console.error('Error in POST /api/payments/checkout:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
