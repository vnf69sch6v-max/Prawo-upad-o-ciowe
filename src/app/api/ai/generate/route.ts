// API Route: Generate flashcards with AI

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { hasPermission, checkUsageLimit } from '@/lib/auth/rbac';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `Jesteś ekspertem w tworzeniu fiszek edukacyjnych z zakresu prawa polskiego.

Na podstawie podanego tekstu lub tematu stwórz fiszki edukacyjne.

Każda fiszka powinna:
- Mieć pytanie sprawdzające kluczową wiedzę
- Mieć zwięzłą, precyzyjną odpowiedź
- Zawierać odniesienie do artykułu/przepisu (jeśli dotyczy)
- Mieć wyjaśnienie kontekstu

Odpowiedz TYLKO w formacie JSON (bez markdown):
[
  {
    "question": "Pytanie",
    "answer": "Odpowiedź",
    "legalReference": "Art. X ustawy...",
    "explanation": "Wyjaśnienie kontekstu",
    "difficulty": "easy|medium|hard|expert"
  }
]`;

export async function POST(request: NextRequest) {
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
        const userData = userDoc.data()!;
        const tier = userData.tier || 'free';

        // Check permission
        if (!hasPermission(tier, 'aiAssistant')) {
            return NextResponse.json(
                { error: 'AI features not available on your plan' },
                { status: 403 }
            );
        }

        // Check usage limit
        const today = new Date().toISOString().split('T')[0];
        const usageRef = adminDb.collection('users').doc(userId).collection('usage').doc(today);
        const usageDoc = await usageRef.get();
        const currentUsage = usageDoc.exists ? usageDoc.data()!.aiQueries || 0 : 0;

        const limitCheck = checkUsageLimit(tier, 'aiAssistant', currentUsage);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                { error: 'Daily AI limit reached', remaining: 0 },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { text, topic, domain, count = 5 } = body;

        if (!text && !topic) {
            return NextResponse.json(
                { error: 'Either text or topic is required' },
                { status: 400 }
            );
        }

        const userMessage = text
            ? `Stwórz ${count} fiszek z następującego tekstu:\n\n${text}`
            : `Stwórz ${count} fiszek na temat: ${topic}${domain ? ` (domena: ${domain})` : ''}`;

        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            // Return mock data for demo
            return NextResponse.json({
                success: true,
                data: {
                    flashcards: [
                        {
                            question: `Przykładowe pytanie dotyczące: ${topic || 'prawa'}`,
                            answer: 'Przykładowa odpowiedź dla trybu demo',
                            legalReference: 'Art. 1 k.c.',
                            explanation: 'To jest tryb demonstracyjny. Skonfiguruj ANTHROPIC_API_KEY aby generować prawdziwe fiszki.',
                            difficulty: 'medium',
                        },
                    ],
                    demo: true,
                },
            });
        }

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
        });

        // Extract response
        const content = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');

        // Parse JSON
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'Failed to generate flashcards' },
                { status: 500 }
            );
        }

        const flashcards = JSON.parse(jsonMatch[0]);

        // Update usage
        await usageRef.set(
            { aiQueries: currentUsage + 1, lastQuery: new Date() },
            { merge: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                flashcards,
                count: flashcards.length,
                usage: {
                    used: currentUsage + 1,
                    remaining: limitCheck.remaining - 1,
                },
            },
        });

    } catch (error) {
        console.error('Error in POST /api/ai/generate:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
