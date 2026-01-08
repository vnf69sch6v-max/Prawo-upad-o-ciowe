// API Route: Stripe Customer Portal

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// Lazy Stripe initialization
let _stripe: Stripe | null = null;
function getStripe(): Stripe | null {
    if (_stripe) return _stripe;
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('Stripe: Missing STRIPE_SECRET_KEY');
        return null;
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return _stripe;
}

// POST /api/payments/portal - Create portal session
export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user's Stripe customer ID
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 400 }
            );
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: userData.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        });

        return NextResponse.json({
            success: true,
            url: portalSession.url,
        });

    } catch (error) {
        console.error('Error in POST /api/payments/portal:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
