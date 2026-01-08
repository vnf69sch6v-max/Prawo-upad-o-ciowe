// API Route: Cards Due for Review

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get query params
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const domain = searchParams.get('domain');

        const now = new Date();

        // Query cards due for review
        let query = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .where('srs.nextReview', '<=', now)
            .where('isArchived', '==', false)
            .orderBy('srs.nextReview', 'asc');

        if (domain) {
            query = query.where('domain', '==', domain);
        }

        const snapshot = await query.limit(limit).get();

        const dueCards = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Get total count of due cards
        const totalDueSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .where('srs.nextReview', '<=', now)
            .where('isArchived', '==', false)
            .count()
            .get();

        return NextResponse.json({
            success: true,
            data: dueCards,
            count: dueCards.length,
            totalDue: totalDueSnapshot.data().count,
        });

    } catch (error) {
        console.error('Error in GET /api/flashcards/due:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
