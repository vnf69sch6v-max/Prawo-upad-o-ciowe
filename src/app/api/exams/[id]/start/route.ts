// API Route: Start exam session

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/exams/[id]/start - Start exam session
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

        // Get exam
        const examDoc = await adminDb.collection('exams').doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        const exam = examDoc.data()!;

        // Get questions for this exam
        const questionsSnapshot = await adminDb
            .collection('examQuestions')
            .limit(exam.config?.questionCount || 10)
            .get();

        let questions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text,
            options: doc.data().options,
            domain: doc.data().domain,
            difficulty: doc.data().difficulty,
        }));

        // Shuffle if configured
        if (exam.config.shuffleQuestions) {
            questions = questions.sort(() => Math.random() - 0.5);
        }

        // Create session
        const session = {
            examId,
            userId,
            examTitle: exam.title,
            examType: exam.type,
            questions,
            answers: {},
            startedAt: new Date(),
            timeLimit: exam.config.timeLimit,
            config: exam.config,
            status: 'in_progress',
        };

        const sessionRef = await adminDb
            .collection('users')
            .doc(userId)
            .collection('examSessions')
            .add(session);

        return NextResponse.json({
            success: true,
            data: {
                sessionId: sessionRef.id,
                examTitle: exam.title,
                questions: questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    options: q.options.map((opt: { id: string; text: string }) => ({
                        id: opt.id,
                        text: opt.text,
                    })), // Don't reveal correct answers
                    domain: q.domain,
                    difficulty: q.difficulty,
                })),
                timeLimit: exam.config.timeLimit,
                questionCount: questions.length,
            },
        });

    } catch (error) {
        console.error('Error in POST /api/exams/[id]/start:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
