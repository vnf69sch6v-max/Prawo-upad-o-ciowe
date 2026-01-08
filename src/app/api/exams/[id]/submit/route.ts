// API Route: Submit exam answers

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/exams/[id]/submit - Submit exam answers
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: examId } = await params;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();
        const { sessionId, answers } = body;

        if (!sessionId || !answers) {
            return NextResponse.json(
                { error: 'Missing required fields: sessionId, answers' },
                { status: 400 }
            );
        }

        // Get session
        const sessionRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('examSessions')
            .doc(sessionId);

        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessionDoc.data()!;
        if (session.status !== 'in_progress') {
            return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
        }

        // Get correct answers
        const questionIds = session.questions.map((q: { id: string }) => q.id);
        const correctAnswers: Record<string, string> = {};
        const explanations: Record<string, string> = {};

        for (const qId of questionIds) {
            const qDoc = await adminDb.collection('examQuestions').doc(qId).get();
            if (qDoc.exists) {
                const qData = qDoc.data()!;
                const correctOption = qData.options.find((o: { isCorrect: boolean }) => o.isCorrect);
                correctAnswers[qId] = correctOption?.id || '';
                explanations[qId] = qData.explanation || '';
            }
        }

        // Calculate score
        let correctCount = 0;
        const results: Record<string, { correct: boolean; correctAnswer: string; explanation: string }> = {};

        for (const [questionId, userAnswer] of Object.entries(answers)) {
            const isCorrect = userAnswer === correctAnswers[questionId];
            if (isCorrect) correctCount++;
            results[questionId] = {
                correct: isCorrect,
                correctAnswer: correctAnswers[questionId],
                explanation: explanations[questionId],
            };
        }

        const totalQuestions = questionIds.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passingScore = session.config.passingScore || 60;
        const passed = score >= passingScore;

        // Calculate time spent
        const startedAt = session.startedAt.toDate ? session.startedAt.toDate() : new Date(session.startedAt);
        const timeSpent = Math.round((Date.now() - startedAt.getTime()) / 1000);

        // Update session
        await sessionRef.update({
            answers,
            results,
            score,
            passed,
            correctCount,
            timeSpent,
            status: 'completed',
            completedAt: new Date(),
        });

        // Save to exam results
        const examResult = {
            examId,
            examTitle: session.examTitle,
            examType: session.examType,
            score,
            passed,
            passingThreshold: passingScore,
            totalQuestions,
            correctAnswers: correctCount,
            timeSpent,
            timeLimit: session.timeLimit,
            completedAt: new Date(),
        };

        await adminDb
            .collection('users')
            .doc(userId)
            .collection('examResults')
            .add(examResult);

        // Update user stats
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data()!;

        await adminDb.collection('users').doc(userId).update({
            'stats.totalQuestionsAnswered': userData.stats.totalQuestionsAnswered + totalQuestions,
            updatedAt: new Date(),
        });

        // Update exam stats
        const examDoc = await adminDb.collection('exams').doc(examId).get();
        if (examDoc.exists) {
            const examData = examDoc.data()!;
            const newTimesCompleted = (examData.stats?.timesCompleted || 0) + 1;
            const newAverageScore =
                ((examData.stats?.averageScore || 0) * (newTimesCompleted - 1) + score) / newTimesCompleted;
            const newPassRate = passed
                ? ((examData.stats?.passRate || 0) * (newTimesCompleted - 1) + 100) / newTimesCompleted
                : ((examData.stats?.passRate || 0) * (newTimesCompleted - 1)) / newTimesCompleted;

            await adminDb.collection('exams').doc(examId).update({
                'stats.timesCompleted': newTimesCompleted,
                'stats.averageScore': Math.round(newAverageScore),
                'stats.passRate': Math.round(newPassRate),
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                score,
                passed,
                passingThreshold: passingScore,
                correctAnswers: correctCount,
                totalQuestions,
                timeSpent,
                results: session.config.showResults === 'immediate' ? results : undefined,
            },
        });

    } catch (error) {
        console.error('Error in POST /api/exams/[id]/submit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
