'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Flashcard } from '@/types';

interface AIExplanationModalProps {
    card: Flashcard;
    isOpen: boolean;
    onClose: () => void;
}

export function AIExplanationModal({ card, isOpen, onClose }: AIExplanationModalProps) {
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [chatMode, setChatMode] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);

    const generateExplanation = async () => {
        if (explanation || loading) return;

        setLoading(true);

        // Simulate AI response (in production, call actual API)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate contextual explanation based on the flashcard
        const mockExplanation = generateMockExplanation(card);
        setExplanation(mockExplanation);
        setLoading(false);
    };

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setLoading(true);

        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1000));

        const aiResponse = `Świetne pytanie dotyczące "${userMessage.slice(0, 30)}..."!\n\nW kontekście ${card.legalReference || 'tego zagadnienia'}, warto zaznaczyć, że jest to częsty temat na egzaminach. Zalecam dokładne przestudiowanie przepisu i powiązanych artykułów.`;

        setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        setLoading(false);
    };

    // Load explanation on open
    if (isOpen && !explanation && !loading) {
        generateExplanation();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-[var(--bg-card)] rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#3b82f6] flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Tutor</h3>
                            <p className="text-xs text-[var(--text-muted)]">Rozszerzone wyjaśnienie</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {/* Question Context */}
                    <div className="mb-4 p-3 rounded-xl bg-[var(--bg-hover)]">
                        <p className="text-sm text-[var(--text-muted)] mb-1">Pytanie:</p>
                        <p className="text-sm font-medium">{card.question}</p>
                    </div>

                    {/* Loading */}
                    {loading && !chatMode && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={32} className="animate-spin text-[#1a365d]" />
                            <span className="ml-3 text-[var(--text-muted)]">Generuję wyjaśnienie...</span>
                        </div>
                    )}

                    {/* Explanation Content */}
                    {explanation && !chatMode && (
                        <div className="space-y-4">
                            {/* Key Difference */}
                            <div>
                                <p className="text-sm font-semibold text-[#1a365d] mb-2 flex items-center gap-2">
                                    📌 Kluczowa różnica:
                                </p>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    {explanation.split('\n\n')[0]}
                                </p>
                            </div>

                            {/* Example */}
                            <div>
                                <p className="text-sm font-semibold text-[#1a365d] mb-2 flex items-center gap-2">
                                    💼 Przykład z praktyki:
                                </p>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    {explanation.split('\n\n')[1] || 'Dwóch prawników zakłada wspólną kancelarię jako spółkę cywilną. To nie jest odrębny podmiot - to oni są stronami wszelkich umów z klientami.'}
                                </p>
                            </div>

                            {/* Exam Trap */}
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                <p className="text-sm font-semibold text-orange-500 mb-2 flex items-center gap-2">
                                    ⚠️ Pułapka egzaminacyjna:
                                </p>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    {explanation.split('\n\n')[2] || 'Często pytają: "Która spółka nie jest wpisywana do KRS?" - pamiętaj o subtelnych różnicach między typami spółek.'}
                                </p>
                            </div>

                            {/* Related */}
                            {card.legalReference && (
                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                    <BookOpen size={14} />
                                    <span>Powiązane: {card.legalReference}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Mode */}
                    {chatMode && (
                        <div className="space-y-4">
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex",
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[80%] p-3 rounded-2xl text-sm",
                                        msg.role === 'user'
                                            ? 'bg-[#1a365d] text-white rounded-br-sm'
                                            : 'bg-[var(--bg-hover)] rounded-bl-sm'
                                    )}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Myślę...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-[var(--border-color)]">
                    {!chatMode ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setChatMode(true)}
                                className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} />
                                <span>Zadaj pytanie AI</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="py-3 px-6 rounded-xl bg-[#1a365d] text-white hover:bg-[#2c5282] transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                                placeholder="Zadaj pytanie..."
                                className="flex-1 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-[#1a365d] focus:outline-none transition-colors"
                                disabled={loading}
                            />
                            <button
                                onClick={handleChatSend}
                                disabled={!chatInput.trim() || loading}
                                className="px-4 py-3 rounded-xl bg-[#1a365d] text-white disabled:opacity-50"
                            >
                                Wyślij
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Generate contextual mock explanation based on card content
function generateMockExplanation(card: Flashcard): string {
    const answer = card.answer;
    const reference = card.legalReference || 'przepisów prawnych';

    return `${answer} to kluczowe pojęcie w kontekście ${reference}. Warto dokładnie przeanalizować różnice między podobnymi instytucjami prawnymi, ponieważ na egzaminie często pojawiają się pytania sprawdzające właśnie te subtelne różnice.

Rozważmy przykład praktyczny: wyobraźmy sobie sytuację, w której przedsiębiorcy muszą podjąć decyzję dotyczącą formy prawnej swojej działalności. Wybór odpowiedniej struktury ma daleko idące konsekwencje prawne i podatkowe.

Na egzaminie często pojawia się pytanie o wyjątki lub przypadki graniczne. Pamiętaj, że ustawa przewiduje szczególne przypadki, które mogą modyfikować ogólne zasady przedstawione w ${reference}.`;
}
