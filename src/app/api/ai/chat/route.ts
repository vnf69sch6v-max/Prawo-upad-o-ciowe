// API Route: AI Chat with Claude

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { checkUsageLimit } from '@/lib/auth/rbac';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPTS = {
    general: `Jesteś LexCapital AI - ekspertem prawa polskiego, specjalizującym się w pomocy studentom prawa i aplikantom. 

Twoje główne zadania:
- Wyjaśnianie przepisów prawnych w przystępny sposób
- Pomaganie w przygotowaniu do egzaminów prawniczych
- Analiza kazusów i stanów faktycznych
- Tworzenie materiałów do nauki

Zasady:
- Zawsze podawaj podstawę prawną (artykuł, ustawa)
- Używaj języka polskiego
- Bądź precyzyjny i zwięzły
- Jeśli nie jesteś pewien, powiedz to wprost
- Odnoś się do aktualnego stanu prawnego`,

    explain: `Jesteś ekspertem prawa polskiego wyjaśniającym przepisy.

Struktura odpowiedzi:
1. Pełne brzmienie przepisu
2. Wyjaśnienie w prostych słowach
3. Przykład praktyczny
4. Powiązane przepisy
5. Najczęstsze błędy w interpretacji`,

    case_analysis: `Jesteś doświadczonym prawnikiem analizującym kazus prawny.

Struktura analizy:
1. Identyfikacja problemów prawnych
2. Właściwe przepisy
3. Argumenty za i przeciw
4. Proponowane rozwiązanie`,
};

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
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;
        const tier = userData.tier || 'free';

        // Check daily usage limit
        const today = new Date().toISOString().split('T')[0];
        const usageRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('usage')
            .doc(today);

        const usageDoc = await usageRef.get();
        const currentUsage = usageDoc.exists ? usageDoc.data()!.aiQueries || 0 : 0;

        const limitCheck = checkUsageLimit(tier, 'aiAssistant', currentUsage);

        if (!limitCheck.allowed) {
            return NextResponse.json(
                {
                    error: 'Daily AI query limit reached',
                    limit: currentUsage,
                    remaining: 0,
                    resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
                },
                { status: 429 }
            );
        }

        // Parse request
        const body = await request.json();
        const { message, context = 'general' } = body;

        if (!message || message.length > 4000) {
            return NextResponse.json(
                { error: 'Message is required and must be under 4000 characters' },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 503 }
            );
        }

        // Call Claude API
        const systemPrompt = SYSTEM_PROMPTS[context as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general;

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
        });

        // Extract response
        const assistantMessage = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n');

        // Update usage
        await usageRef.set(
            {
                aiQueries: currentUsage + 1,
                lastQuery: new Date(),
            },
            { merge: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                message: assistantMessage,
                usage: {
                    used: currentUsage + 1,
                    remaining: limitCheck.remaining - 1,
                },
            },
        });

    } catch (error) {
        console.error('Error in POST /api/ai/chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
