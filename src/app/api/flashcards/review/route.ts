// API Route: Flashcard Review with SRS

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { calculateSRS, calculateEquityChange } from '@/lib/srs/algorithm';

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
        const { flashcardId, quality, responseTime } = body;

        // Validate
        if (!flashcardId || quality === undefined || !responseTime) {
            return NextResponse.json(
                { error: 'Missing required fields: flashcardId, quality, responseTime' },
                { status: 400 }
            );
        }

        if (quality < 0 || quality > 5) {
            return NextResponse.json(
                { error: 'Quality must be between 0 and 5' },
                { status: 400 }
            );
        }

        // Get flashcard
        const flashcardRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('flashcards')
            .doc(flashcardId);

        const flashcardDoc = await flashcardRef.get();

        if (!flashcardDoc.exists) {
            return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
        }

        const flashcard = flashcardDoc.data()!;

        // Calculate new SRS values
        const newSRS = calculateSRS({
            quality,
            easeFactor: flashcard.srs.easeFactor,
            interval: flashcard.srs.interval,
            repetitions: flashcard.srs.repetitions,
        });

        // Get user for streak
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data()!;

        // Calculate equity change
        const equityChange = calculateEquityChange(
            quality,
            flashcard.difficulty,
            userData.stats.streak
        );

        // Update flashcard SRS and stats
        const isCorrect = quality >= 3;
        await flashcardRef.update({
            'srs.easeFactor': newSRS.easeFactor,
            'srs.interval': newSRS.interval,
            'srs.repetitions': newSRS.repetitions,
            'srs.nextReview': newSRS.nextReview,
            'srs.lastReview': new Date(),
            'stats.timesReviewed': flashcard.stats.timesReviewed + 1,
            'stats.timesCorrect': isCorrect
                ? flashcard.stats.timesCorrect + 1
                : flashcard.stats.timesCorrect,
            'stats.timesIncorrect': !isCorrect
                ? (flashcard.stats.timesIncorrect || 0) + 1
                : (flashcard.stats.timesIncorrect || 0),
            'stats.averageResponseTime':
                (flashcard.stats.averageResponseTime * flashcard.stats.timesReviewed + responseTime) /
                (flashcard.stats.timesReviewed + 1),
            updatedAt: new Date(),
        });

        // Update user stats
        const newEquity = userData.stats.knowledgeEquity + equityChange;

        // Check if we need to update streak
        const today = new Date().toDateString();
        const lastStudy = userData.stats.lastStudyDate
            ? new Date(userData.stats.lastStudyDate.toDate?.() || userData.stats.lastStudyDate).toDateString()
            : null;

        const isNewDay = lastStudy !== today;
        const wasYesterday = lastStudy === new Date(Date.now() - 86400000).toDateString();

        let newStreak = userData.stats.streak;
        if (isNewDay) {
            if (wasYesterday || !lastStudy) {
                newStreak = userData.stats.streak + 1;
            } else {
                newStreak = 1; // Reset streak if gap
            }
        }

        await adminDb.collection('users').doc(userId).update({
            'stats.knowledgeEquity': newEquity,
            'stats.totalFlashcardsReviewed': userData.stats.totalFlashcardsReviewed + 1,
            'stats.streak': newStreak,
            'stats.longestStreak': Math.max(userData.stats.longestStreak, newStreak),
            'stats.lastStudyDate': new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                srs: newSRS,
                equityChange,
                newEquity,
                newStreak,
                isCorrect,
            },
        });

    } catch (error) {
        console.error('Error in POST /api/flashcards/review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
