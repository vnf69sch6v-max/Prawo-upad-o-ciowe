// API Route: Exams list and details

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { hasPermission } from '@/lib/auth/rbac';

// GET /api/exams - List available exams
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user tier
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const tier = userData?.tier || 'free';

        // Get exams
        const examsSnapshot = await adminDb
            .collection('exams')
            .orderBy('createdAt', 'desc')
            .get();

        const exams = examsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as { id: string; requiredTier?: string }))
            .filter(exam => {
                // Filter based on tier access
                if (exam.requiredTier === 'free') return true;
                if (exam.requiredTier === 'pro') return hasPermission(tier, 'exams');
                if (exam.requiredTier === 'enterprise') return tier === 'enterprise';
                return true;
            });

        return NextResponse.json({
            success: true,
            data: exams,
            count: exams.length,
        });

    } catch (error) {
        console.error('Error in GET /api/exams:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/exams - Create custom exam (PRO+)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Check if PRO
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (!hasPermission(userData?.tier || 'free', 'customDecks')) {
            return NextResponse.json({ error: 'PRO subscription required' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, config, filters } = body;

        if (!title || !config) {
            return NextResponse.json(
                { error: 'Missing required fields: title, config' },
                { status: 400 }
            );
        }

        const exam = {
            title,
            description: description || '',
            type: 'custom',
            config: {
                questionCount: config.questionCount || 10,
                timeLimit: config.timeLimit || 0,
                passingScore: config.passingScore || 60,
                shuffleQuestions: config.shuffleQuestions ?? true,
                shuffleAnswers: config.shuffleAnswers ?? true,
                showResults: config.showResults || 'after_completion',
                allowReview: config.allowReview ?? true,
            },
            filters: {
                domains: filters?.domains || [],
                difficulty: filters?.difficulty || [],
                tags: filters?.tags || [],
            },
            isPremium: false,
            requiredTier: 'free',
            stats: {
                timesCompleted: 0,
                averageScore: 0,
                passRate: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: userId,
        };

        const docRef = await adminDb.collection('exams').add(exam);

        return NextResponse.json({
            success: true,
            data: { id: docRef.id, ...exam },
        }, { status: 201 });

    } catch (error) {
        console.error('Error in POST /api/exams:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
