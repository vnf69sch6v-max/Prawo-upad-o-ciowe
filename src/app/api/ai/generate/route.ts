// API Route: Generate flashcards with Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai/gemini-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, topic, count = 5 } = body;

        if (!text && !topic) {
            return NextResponse.json(
                { error: 'Either text or topic is required' },
                { status: 400 }
            );
        }

        // Generate flashcards using Firebase AI
        const flashcards = await generateFlashcards(
            text || '',
            Math.min(count, 10), // Max 10 flashcards
            topic
        );

        return NextResponse.json({
            success: true,
            data: {
                flashcards,
                count: flashcards.length,
                model: 'gemini-2.0-flash',
            },
        });

    } catch (error) {
        console.error('Error in POST /api/ai/generate:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate flashcards',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
