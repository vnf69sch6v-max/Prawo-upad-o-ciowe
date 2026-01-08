'use client';

import { useState } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { AIChat } from '@/components/ai';
import { Sparkles, Wand2, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const AI_TOOLS = [
    {
        id: 'chat',
        name: 'Asystent AI',
        description: 'Zadawaj pytania prawne i otrzymuj wyjaśnienia',
        icon: MessageSquare,
        color: 'purple',
    },
    {
        id: 'generator',
        name: 'Generator Fiszek',
        description: 'Twórz fiszki z tekstu lub tematu automatycznie',
        icon: Wand2,
        color: 'blue',
    },
    {
        id: 'analyzer',
        name: 'Analiza Kazusu',
        description: 'Analizuj stany faktyczne i znajdź rozwiązania',
        icon: FileText,
        color: 'green',
    },
];

export default function AIPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState<string>('chat');
    const [generatorText, setGeneratorText] = useState('');
    const [generatorLoading, setGeneratorLoading] = useState(false);
    const [generatedCards, setGeneratedCards] = useState<Array<{
        question: string;
        answer: string;
        legalReference: string;
    }>>([]);

    const handleGenerate = async () => {
        if (!generatorText.trim()) return;

        setGeneratorLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setGeneratedCards([
            {
                question: 'Przykładowe pytanie wygenerowane przez AI',
                answer: 'Odpowiedź wygenerowana automatycznie',
                legalReference: 'Art. 1 k.c.',
            },
            {
                question: 'Drugie pytanie z tekstu',
                answer: 'Druga odpowiedź',
                legalReference: 'Art. 2 k.c.',
            },
        ]);
        setGeneratorLoading(false);
    };

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="ai"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{ streak: 12, knowledgeEquity: 12000 }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{ streak: 12, knowledgeEquity: 12000, rank: 32 }}
                    currentView="ai"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">LexCapital AI</h1>
                                <p className="text-[var(--text-muted)]">Inteligentne narzędzia do nauki prawa</p>
                            </div>
                        </div>

                        {/* Tool Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {AI_TOOLS.map(tool => {
                                const Icon = tool.icon;
                                const isActive = activeTool === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => setActiveTool(tool.id)}
                                        className={cn(
                                            'p-4 rounded-xl text-left transition-all border',
                                            isActive
                                                ? 'bg-purple-600/20 border-purple-500'
                                                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-purple-500/50'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                                            tool.color === 'purple' && 'bg-purple-500/20',
                                            tool.color === 'blue' && 'bg-blue-500/20',
                                            tool.color === 'green' && 'bg-green-500/20'
                                        )}>
                                            <Icon size={20} className={cn(
                                                tool.color === 'purple' && 'text-purple-400',
                                                tool.color === 'blue' && 'text-blue-400',
                                                tool.color === 'green' && 'text-green-400'
                                            )} />
                                        </div>
                                        <h3 className="font-semibold mb-1">{tool.name}</h3>
                                        <p className="text-xs text-[var(--text-muted)]">{tool.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Tool Content */}
                        {activeTool === 'chat' && <AIChat />}

                        {activeTool === 'generator' && (
                            <div className="lex-card space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Wand2 size={20} className="text-blue-400" />
                                    Generator Fiszek AI
                                </h3>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Wklej tekst prawny lub podaj temat, a AI wygeneruje fiszki do nauki.
                                </p>

                                <textarea
                                    value={generatorText}
                                    onChange={(e) => setGeneratorText(e.target.value)}
                                    placeholder="Wklej tekst z ustawy, podręcznika lub podaj temat np. 'terminy przedawnienia w prawie cywilnym'..."
                                    className="w-full h-40 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                />

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {generatorText.length}/4000 znaków
                                    </p>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!generatorText.trim() || generatorLoading}
                                        className="btn btn-primary disabled:opacity-50"
                                    >
                                        {generatorLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Generowanie...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={18} />
                                                Generuj fiszki
                                            </>
                                        )}
                                    </button>
                                </div>

                                {generatedCards.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                                        <h4 className="font-medium">Wygenerowane fiszki ({generatedCards.length})</h4>
                                        {generatedCards.map((card, i) => (
                                            <div key={i} className="p-4 bg-[var(--bg-hover)] rounded-xl">
                                                <p className="font-medium mb-2">{card.question}</p>
                                                <p className="text-sm text-[var(--text-muted)]">{card.answer}</p>
                                                <p className="text-xs text-purple-400 mt-2">{card.legalReference}</p>
                                            </div>
                                        ))}
                                        <button className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 font-medium">
                                            Dodaj wszystkie do moich fiszek
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTool === 'analyzer' && (
                            <div className="lex-card space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText size={20} className="text-green-400" />
                                    Analiza Kazusu
                                </h3>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Opisz stan faktyczny, a AI pomoże zidentyfikować problemy prawne i zaproponuje rozwiązania.
                                </p>

                                <textarea
                                    placeholder="Opisz stan faktyczny kazusu..."
                                    className="w-full h-40 px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                />

                                <button className="btn btn-primary">
                                    <FileText size={18} />
                                    Analizuj kazus
                                </button>
                            </div>
                        )}

                        {/* Usage Stats */}
                        <div className="lex-card">
                            <h3 className="font-semibold mb-4">Wykorzystanie AI dzisiaj</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-muted)]">Zapytania</span>
                                        <span>3 / 5</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                        <div className="h-full w-3/5 bg-purple-500 rounded-full" />
                                    </div>
                                </div>
                                <button className="btn btn-secondary text-sm">
                                    Zwiększ limit →
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileNav currentView="ai" onNavigate={() => { }} />
        </div>
    );
}
