// API Route: Single Flashcard operations

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/flashcards/[id] - Get single flashcard
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const docRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .doc(id);

        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { id: doc.id, ...doc.data() },
        });

    } catch (error) {
        console.error('Error in GET /api/flashcards/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/flashcards/[id] - Update flashcard
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();

        // Allowed fields
        const allowedFields = [
            'question',
            'answer',
            'legalReference',
            'explanation',
            'domain',
            'tags',
            'difficulty',
            'isArchived',
        ];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        updates.updatedAt = new Date();

        const docRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .doc(id);

        const doc = await docRef.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
        }

        await docRef.update(updates);

        return NextResponse.json({
            success: true,
            message: 'Flashcard updated',
        });

    } catch (error) {
        console.error('Error in PATCH /api/flashcards/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/flashcards/[id] - Delete flashcard
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const docRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .doc(id);

        const doc = await docRef.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Flashcard deleted',
        });

    } catch (error) {
        console.error('Error in DELETE /api/flashcards/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
