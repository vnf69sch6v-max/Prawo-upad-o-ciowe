'use client';

import { X, Crown, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    {
        id: 'pro',
        name: 'PRO',
        price: '49',
        period: '/miesiąc',
        description: 'Dla ambitnych studentów',
        features: [
            'Nielimitowane fiszki',
            'Wszystkie egzaminy',
            '50 zapytań AI dziennie',
            'Analiza słabych punktów',
            'Eksport do PDF',
            'Priorytetowe wsparcie',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '299',
        period: '/miesiąc',
        description: 'Dla kancelarii i grup',
        features: [
            'Wszystko z PRO',
            'Nielimitowane AI',
            'Dostęp API',
            'Prognozy AI',
            'Własne branding',
            'Dedykowany opiekun',
            'Szkolenia grupowe',
        ],
        popular: false,
    },
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center py-8 px-4 bg-gradient-to-b from-purple-900/30 to-transparent">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mb-4">
                        <Crown size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Odblokuj pełny potencjał</h2>
                    <p className="text-[var(--text-muted)]">
                        Wybierz plan i przyspiesz przygotowania do egzaminu
                    </p>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-2 gap-6 p-6">
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative p-6 rounded-xl border transition-all',
                                plan.popular
                                    ? 'bg-gradient-to-br from-purple-900/30 to-[var(--bg-elevated)] border-#1a365d'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-#1a365d/50'
                            )}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-#1a365d to-pink-600 text-white text-xs font-bold rounded-full">
                                    NAJPOPULARNIEJSZY
                                </span>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-sm text-[var(--text-muted)]">{plan.description}</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price} PLN</span>
                                    <span className="text-[var(--text-muted)]">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check size={16} className="text-green-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={cn(
                                    'w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                                    plan.popular
                                        ? 'bg-gradient-to-r from-#1a365d to-pink-600 text-white hover:from-#1a365d hover:to-#b8860b'
                                        : 'bg-[var(--bg-hover)] hover:bg-#1a365d/20 border border-[var(--border-color)]'
                                )}
                            >
                                <Zap size={18} />
                                Wybierz {plan.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center py-4 border-t border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-muted)]">
                        ✓ 7-dniowa gwarancja zwrotu • ✓ Anuluj w dowolnym momencie • ✓ Bezpieczna płatność
                    </p>
                </div>
            </div>
        </div>
    );
}
