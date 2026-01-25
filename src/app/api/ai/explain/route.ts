// API Route: Explain flashcard with Firebase AI (Gemini)

import { NextRequest, NextResponse } from 'next/server';
import { explainFlashcard } from '@/lib/firebase/ai-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, answer, legalBasis } = body;

        if (!question || !answer) {
            return NextResponse.json(
                { error: 'Question and answer are required' },
                { status: 400 }
            );
        }

        // Get explanation from Firebase AI
        const explanation = await explainFlashcard(question, answer, legalBasis);

        return NextResponse.json({
            success: true,
            data: {
                explanation,
                model: 'gemini-2.0-flash',
            },
        });

    } catch (error) {
        console.error('Error in POST /api/ai/explain:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate explanation',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
