// API Route: Stripe Customer Portal

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as const,
});

// POST /api/payments/portal - Create portal session
export async function POST(request: NextRequest) {
    try {
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
