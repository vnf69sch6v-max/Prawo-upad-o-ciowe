// API Route: AI Chat with Firebase Gemini
// Free tier AI using Firebase AI

import { NextRequest, NextResponse } from 'next/server';
import { chat, SYSTEM_PROMPTS } from '@/lib/firebase/ai-service';

export async function POST(request: NextRequest) {
    try {
        // Parse request
        const body = await request.json();
        const { message, context = 'general', history = [] } = body;

        if (!message || message.length > 4000) {
            return NextResponse.json(
                { error: 'Message is required and must be under 4000 characters' },
                { status: 400 }
            );
        }

        // Validate context
        const validContexts = Object.keys(SYSTEM_PROMPTS);
        const selectedContext = validContexts.includes(context) ? context : 'general';

        // Convert history format if needed
        const formattedHistory = history.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // Call Firebase AI (Gemini)
        const response = await chat(message, selectedContext as keyof typeof SYSTEM_PROMPTS, formattedHistory);

        return NextResponse.json({
            success: true,
            data: {
                message: response,
                model: 'gemini-2.0-flash',
                context: selectedContext,
            },
        });

    } catch (error) {
        console.error('Error in POST /api/ai/chat:', error);
        return NextResponse.json(
            {
                error: 'AI service error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
