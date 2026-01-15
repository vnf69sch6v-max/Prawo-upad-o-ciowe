'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import {
    Send, Sparkles, BookOpen, HelpCircle, Scale, Copy, Check,
    RotateCcw, User, Bot, Plus, Loader2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        legalReferences?: string[];
        suggestedFlashcards?: { question: string; answer: string }[];
        relatedQuestions?: string[];
    };
}

interface EnhancedAIChatProps {
    onSendMessage?: (message: string, mode: string) => Promise<Message>;
    onAddFlashcard?: (question: string, answer: string) => void;
    currentDomain?: string;
}

// ============================================
// AI MODES
// ============================================

const AI_MODES = [
    {
        id: 'general',
        name: 'Asystent',
        icon: Sparkles,
        color: '#8b5cf6',
        description: 'Ogólna pomoc w nauce prawa'
    },
    {
        id: 'explain',
        name: 'Wyjaśnij',
        icon: BookOpen,
        color: '#3b82f6',
        description: 'Szczegółowe wyjaśnienia przepisów'
    },
    {
        id: 'quiz',
        name: 'Quiz',
        icon: HelpCircle,
        color: '#10b981',
        description: 'Generowanie pytań testowych'
    },
    {
        id: 'caseStudy',
        name: 'Kazusy',
        icon: Scale,
        color: '#f59e0b',
        description: 'Analiza stanów faktycznych'
    },
];

// ============================================
// SUGGESTED PROMPTS
// ============================================

const SUGGESTED_PROMPTS = [
    'Wyjaśnij art. 415 k.c.',
    'Co to jest obrona konieczna?',
    'Stwórz 5 fiszek o przedawnieniu',
    'Quiz z prawa cywilnego',
    'Różnice między spółką z o.o. a S.A.',
    'Jakie są przesłanki ubezwłasnowolnienia?',
];

// ============================================
// MESSAGE COMPONENT
// ============================================

function ChatMessage({
    message,
    onAddFlashcard,
    onCopy
}: {
    message: Message;
    onAddFlashcard?: (q: string, a: string) => void;
    onCopy: (text: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        onCopy(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Parse legal references
    const parseContent = (content: string) => {
        // Highlight legal references like "Art. 415 k.c." or "art. 25 k.k."
        const pattern = /(art\.\s*\d+[a-z]?(?:\s*§\s*\d+)?(?:\s*(?:pkt|ust)\.\s*\d+)?\s*(?:k\.c\.|k\.k\.|k\.p\.c\.|k\.s\.h\.|k\.p\.))/gi;
        const parts = content.split(pattern);

        return parts.map((part, i) => {
            if (pattern.test(part)) {
                return (
                    <span
                        key={i}
                        className="px-1.5 py-0.5 bg-[#1a365d]/20 text-[#1a365d] rounded cursor-pointer hover:bg-[#1a365d]/30 transition-colors"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className={cn(
            'flex gap-3 group',
            isUser && 'flex-row-reverse'
        )}>
            {/* Avatar */}
            <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                isUser ? 'bg-[#1a365d]' : 'bg-[var(--bg-hover)]'
            )}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message content */}
            <div className={cn(
                'max-w-[80%] rounded-2xl p-4',
                isUser
                    ? 'bg-[#1a365d] rounded-tr-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-tl-sm'
            )}>
                <p className="whitespace-pre-wrap leading-relaxed">
                    {isUser ? message.content : parseContent(message.content)}
                </p>

                {/* Legal references */}
                {message.metadata?.legalReferences && message.metadata.legalReferences.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-muted)] mb-2">Podstawy prawne:</p>
                        <div className="flex flex-wrap gap-1">
                            {message.metadata.legalReferences.map((ref, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-[#1a365d]/10 text-[#1a365d] rounded text-xs"
                                >
                                    {ref}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested flashcards */}
                {message.metadata?.suggestedFlashcards && message.metadata.suggestedFlashcards.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-muted)] mb-2">Sugerowane fiszki:</p>
                        <div className="space-y-2">
                            {message.metadata.suggestedFlashcards.map((card, i) => (
                                <div key={i} className="p-2 bg-[var(--bg-hover)] rounded-lg flex items-start gap-2">
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium">{card.question}</p>
                                        <p className="text-[var(--text-muted)] text-xs mt-1">{card.answer}</p>
                                    </div>
                                    {onAddFlashcard && (
                                        <button
                                            onClick={() => onAddFlashcard(card.question, card.answer)}
                                            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-green-400"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp and actions */}
                <div className={cn(
                    'flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
                    isUser && 'flex-row-reverse'
                )}>
                    <span className="text-xs text-[var(--text-muted)]">
                        {message.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TYPING INDICATOR
// ============================================

function TypingIndicator() {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
                <Bot size={16} />
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedAIChat({
    onSendMessage,
    onAddFlashcard,
    currentDomain,
}: EnhancedAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Cześć! Jestem Twoim asystentem prawnym. Mogę pomóc Ci zrozumieć przepisy, stworzyć fiszki, wygenerować pytania quizowe lub przeanalizować kazusy. W czym mogę pomóc?',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMode, setSelectedMode] = useState('general');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulate AI response (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getSimulatedResponse(input, selectedMode),
                timestamp: new Date(),
                metadata: {
                    legalReferences: ['Art. 415 k.c.', 'Art. 361 k.c.'],
                    suggestedFlashcards: selectedMode === 'explain' ? [
                        { question: 'Co to jest odpowiedzialność deliktowa?', answer: 'Odpowiedzialność za szkodę wyrządzoną czynem niedozwolonym.' }
                    ] : undefined,
                },
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleClearChat = () => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Chat wyczyszczony. W czym mogę pomóc?',
            timestamp: new Date(),
        }]);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Mode selector */}
            <div className="flex gap-2 p-4 border-b border-[var(--border-color)] overflow-x-auto">
                {AI_MODES.map(mode => {
                    const ModeIcon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                                selectedMode === mode.id
                                    ? 'text-white'
                                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white'
                            )}
                            style={{
                                background: selectedMode === mode.id ? mode.color : undefined,
                            }}
                        >
                            <ModeIcon size={16} />
                            {mode.name}
                        </button>
                    );
                })}

                <button
                    onClick={handleClearChat}
                    className="ml-auto p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        onAddFlashcard={onAddFlashcard}
                        onCopy={handleCopy}
                    />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Sugerowane pytania:</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestedPrompt(prompt)}
                                className="px-3 py-1.5 bg-[var(--bg-hover)] rounded-full text-sm hover:bg-[var(--bg-elevated)] transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Zadaj pytanie..."
                            rows={1}
                            className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl resize-none focus:border-[#1a365d] focus:outline-none"
                            style={{ maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                    <kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">Enter</kbd> wyślij ·
                    <kbd className="px-1 py-0.5 bg-[var(--bg-hover)] rounded ml-1">Shift+Enter</kbd> nowa linia
                </p>
            </div>
        </div>
    );
}

// ============================================
// SIMULATED RESPONSE (Replace with actual API)
// ============================================

function getSimulatedResponse(input: string, mode: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('415') || lowerInput.includes('odpowiedzialność')) {
        return `**Art. 415 k.c.** - Odpowiedzialność deliktowa

Zgodnie z art. 415 Kodeksu cywilnego: *"Kto z winy swej wyrządził drugiemu szkodę, obowiązany jest do jej naprawienia."*

**Przesłanki odpowiedzialności deliktowej:**
1. **Czyn** - działanie lub zaniechanie sprawcy
2. **Szkoda** - uszczerbek w dobrach poszkodowanego
3. **Związek przyczynowy** - między czynem a szkodą (art. 361 k.c.)
4. **Wina** - umyślna lub nieumyślna (niedbalstwo)
5. **Bezprawność** - sprzeczność z prawem lub zasadami współżycia społecznego

**Przykład:** Kierowca, który jedzie zbyt szybko (czyn), powoduje wypadek i uszkadza samochód innej osoby (szkoda). Musi naprawić szkodę, bo jego nadmierna prędkość (wina) bezpośrednio doprowadziła do zdarzenia (związek przyczynowy), a przekroczenie prędkości jest sprzeczne z przepisami (bezprawność).`;
    }

    if (lowerInput.includes('obrona konieczna') || lowerInput.includes('kontratyp')) {
        return `**Obrona konieczna (art. 25 k.k.)**

Obrona konieczna to kontratyp wyłączający bezprawność czynu zabronionego.

**Przesłanki:**
1. **Bezpośredni zamach** - zamach musi być aktualny, trwający
2. **Bezprawny zamach** - sprzeczny z prawem
3. **Na jakiekolwiek dobro chronione prawem** - nie tylko własne
4. **Odpieranie zamachu** - działanie obronne

**Granice:**
- Obrona musi być proporcjonalna do zamachu
- Przekroczenie granic może być karane łagodniej

**Eksces intensywny** - użycie nieproporcjonalnych środków
**Eksces ekstensywny** - działanie przed lub po zamachu`;
    }

    return `Dziękuję za pytanie. Pozwól, że odpowiem szczegółowo na Twoje zapytanie dotyczące: "${input}"

W polskim prawie to zagadnienie jest regulowane przez odpowiednie przepisy. Kluczowe aspekty to:

1. **Podstawy prawne** - regulacje ustawowe i orzecznictwo
2. **Doktryna** - stanowiska przedstawicieli nauki prawa
3. **Praktyka** - jak przepisy są stosowane

Czy chciałbyś, żebym rozwinął któryś z tych aspektów lub stworzył fiszki do nauki?`;
}
