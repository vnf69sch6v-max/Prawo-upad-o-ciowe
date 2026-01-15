'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIChatProps {
    onSendMessage?: (message: string) => Promise<string>;
}

const QUICK_PROMPTS = [
    { label: 'Wyjaśnij przepis', prompt: 'Wyjaśnij mi art. 471 k.c.' },
    { label: 'Analiza kazusu', prompt: 'Przeanalizuj następujący kazus: ' },
    { label: 'Porównaj instytucje', prompt: 'Porównaj ' },
    { label: 'Pytanie egzaminacyjne', prompt: 'Stwórz pytanie egzaminacyjne z: ' },
];

export function AIChat({ onSendMessage }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Call API or use mock
            let response: string;

            if (onSendMessage) {
                response = await onSendMessage(input.trim());
            } else {
                // Mock response for demo
                await new Promise(resolve => setTimeout(resolve, 1500));
                response = `Dziękuję za pytanie dotyczące "${input.trim().slice(0, 50)}..."\n\nJako LexCapital AI, mogę pomóc Ci zrozumieć przepisy prawne. Aktualnie działam w trybie demonstracyjnym. Po skonfigurowaniu klucza API Anthropic, będę w stanie udzielić pełnych odpowiedzi.\n\n📚 *Wskazówka*: Zapytaj o konkretny artykuł lub instytucję prawną dla najlepszych rezultatów.`;
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie później.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <div className="flex flex-col h-[600px] lex-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
                <div className="w-10 h-10 bg-gradient-to-br from-#1a365d to-pink-600 rounded-xl flex items-center justify-center">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-semibold">LexCapital AI</h3>
                    <p className="text-xs text-[var(--text-muted)]">Ekspert prawa polskiego</p>
                </div>
                <div className="ml-auto">
                    <span className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8 space-y-4">
                        <Sparkles size={40} className="mx-auto text-[#1a365d]" />
                        <div>
                            <h4 className="font-medium mb-2">Witaj w LexCapital AI!</h4>
                            <p className="text-sm text-[var(--text-muted)]">
                                Zapytaj mnie o przepisy, instytucje prawne czy przygotowanie do egzaminu.
                            </p>
                        </div>
                        {/* Quick prompts */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {QUICK_PROMPTS.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => handleQuickPrompt(item.prompt)}
                                    className="px-3 py-1.5 text-xs bg-[var(--bg-hover)] hover:bg-[#1a365d]/20 border border-[var(--border-color)] hover:border-[#1a365d]/50 rounded-full transition-all"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex gap-3',
                            msg.role === 'user' && 'flex-row-reverse'
                        )}
                    >
                        <div
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                                msg.role === 'user'
                                    ? 'bg-[#1a365d]'
                                    : 'bg-gradient-to-br from-#1a365d to-pink-600'
                            )}
                        >
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div
                            className={cn(
                                'max-w-[80%] p-3 rounded-2xl text-sm',
                                msg.role === 'user'
                                    ? 'bg-[#1a365d] text-white rounded-br-sm'
                                    : 'bg-[var(--bg-hover)] rounded-bl-sm'
                            )}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-#1a365d to-pink-600 flex items-center justify-center">
                            <Bot size={14} />
                        </div>
                        <div className="p-3 rounded-2xl rounded-bl-sm bg-[var(--bg-hover)] text-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[var(--text-muted)]">Myślę...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Zadaj pytanie prawne..."
                        className="flex-1 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none transition-colors"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={cn(
                            'px-4 py-3 rounded-xl transition-all',
                            'bg-gradient-to-r from-#1a365d to-#2c5282',
                            'hover:from-#1a365d hover:to-#1a365d',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                    LexCapital AI może popełniać błędy. Weryfikuj odpowiedzi z oficjalnymi źródłami.
                </p>
            </div>
        </div>
    );
}
