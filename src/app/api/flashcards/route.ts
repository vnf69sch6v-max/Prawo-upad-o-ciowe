// API Route: Flashcards CRUD

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// GET /api/flashcards - Get user's flashcards
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
        const domain = searchParams.get('domain');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query
        let query = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .orderBy('createdAt', 'desc');

        if (domain) {
            query = query.where('domain', '==', domain);
        }

        const snapshot = await query.limit(limit).get();

        const flashcards = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({
            success: true,
            data: flashcards,
            count: flashcards.length,
        });

    } catch (error) {
        console.error('Error in GET /api/flashcards:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/flashcards - Create new flashcard
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

        // Validate required fields
        const { question, answer, domain, difficulty } = body;
        if (!question || !answer || !domain || !difficulty) {
            return NextResponse.json(
                { error: 'Missing required fields: question, answer, domain, difficulty' },
                { status: 400 }
            );
        }

        // Create flashcard with default SRS values
        const now = new Date();
        const flashcard = {
            question,
            answer,
            legalReference: body.legalReference || '',
            explanation: body.explanation || null,
            domain,
            tags: body.tags || [],
            difficulty,
            srs: {
                easeFactor: 2.5,
                interval: 0,
                repetitions: 0,
                nextReview: now,
                lastReview: null,
            },
            stats: {
                timesReviewed: 0,
                timesCorrect: 0,
                timesIncorrect: 0,
                averageResponseTime: 0,
            },
            source: 'user',
            sourceId: null,
            createdAt: now,
            updatedAt: now,
            isArchived: false,
        };

        const docRef = await adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .add(flashcard);

        return NextResponse.json({
            success: true,
            data: {
                id: docRef.id,
                ...flashcard,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Error in POST /api/flashcards:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
