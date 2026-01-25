// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE AI SERVICE (Gemini)
// Free tier AI using Google AI Studio
// Get your key: https://aistudio.google.com/apikey
// ═══════════════════════════════════════════════════════════════════════════

import { GoogleGenAI } from '@google/genai';

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ GOOGLE_AI_API_KEY not set. Get your free key at: https://aistudio.google.com/apikey');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

export const SYSTEM_PROMPTS = {
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

    flashcard_explain: `Jesteś ekspertem prawa polskiego. 
Wyjaśnij podane pytanie egzaminacyjne i odpowiedź w przystępny sposób.
Podaj:
1. Dlaczego ta odpowiedź jest prawidłowa
2. Kontekst prawny (artykuł, ustawa)
3. Praktyczny przykład
4. Najczęstsze błędy

Odpowiadaj po polsku, zwięźle ale kompletnie.`,

    generate_flashcards: `Jesteś ekspertem w tworzeniu fiszek edukacyjnych z zakresu prawa polskiego.

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
]`,
};

// ═══════════════════════════════════════════════════════════════
// CHAT FUNCTION
// ═══════════════════════════════════════════════════════════════

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function chat(
    message: string,
    context: keyof typeof SYSTEM_PROMPTS = 'general',
    history: ChatMessage[] = []
): Promise<string> {
    if (!ai) {
        throw new Error('Google AI not initialized. Set GOOGLE_AI_API_KEY in .env.local');
    }

    try {
        const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;

        // Build conversation
        const conversation = [
            { role: 'user' as const, parts: [{ text: `System: ${systemPrompt}` }] },
            { role: 'model' as const, parts: [{ text: 'Rozumiem. Jestem gotowy do pomocy w nauce prawa polskiego.' }] },
            ...history,
            { role: 'user' as const, parts: [{ text: message }] },
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: conversation,
        });

        return response.text || 'Brak odpowiedzi';
    } catch (error) {
        console.error('Google AI chat error:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPLAIN FLASHCARD
// ═══════════════════════════════════════════════════════════════

export async function explainFlashcard(
    question: string,
    correctAnswer: string,
    legalBasis?: string
): Promise<string> {
    const prompt = `
Pytanie: ${question}
Prawidłowa odpowiedź: ${correctAnswer}
${legalBasis ? `Podstawa prawna: ${legalBasis}` : ''}

Wyjaśnij to pytanie egzaminacyjne.`;

    return chat(prompt, 'flashcard_explain');
}

// ═══════════════════════════════════════════════════════════════
// GENERATE FLASHCARDS
// ═══════════════════════════════════════════════════════════════

export interface GeneratedFlashcard {
    question: string;
    answer: string;
    legalReference?: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export async function generateFlashcards(
    input: string,
    count: number = 5,
    topic?: string
): Promise<GeneratedFlashcard[]> {
    const prompt = topic
        ? `Stwórz ${count} fiszek na temat: ${topic}`
        : `Stwórz ${count} fiszek z następującego tekstu:\n\n${input}`;

    const response = await chat(prompt, 'generate_flashcards');

    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Failed to parse flashcard JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
}

// ═══════════════════════════════════════════════════════════════
// ANALYZE CASE (KAZUS)
// ═══════════════════════════════════════════════════════════════

export async function analyzeCase(caseDescription: string): Promise<string> {
    return chat(caseDescription, 'case_analysis');
}

// ═══════════════════════════════════════════════════════════════
// CHECK IF AI IS AVAILABLE
// ═══════════════════════════════════════════════════════════════

export function isAIAvailable(): boolean {
    return ai !== null;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export { ai };
export default {
    chat,
    explainFlashcard,
    generateFlashcards,
    analyzeCase,
    isAIAvailable,
    SYSTEM_PROMPTS,
};
