'use client';

import { cn } from '@/lib/utils/cn';
import { LEGAL_DOMAINS } from '@/lib/constants/domains';
import type { LegalDomain } from '@/types';

interface DomainMasteryProps {
    scores: Record<LegalDomain, number>;
    showRadar?: boolean;
}

export function DomainMastery({ scores, showRadar = false }: DomainMasteryProps) {
    const domains = Object.entries(LEGAL_DOMAINS) as [LegalDomain, typeof LEGAL_DOMAINS[LegalDomain]][];

    return (
        <div className="lex-card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Opanowanie dziedzin</h3>
                <span className="text-sm text-[var(--text-muted)]">
                    Średnia: {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)}%
                </span>
            </div>

            <div className="space-y-4">
                {domains.map(([key, domain]) => {
                    const score = scores[key] || 0;
                    const color = score >= 85 ? 'green' : score >= 70 ? 'yellow' : 'red';

                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{domain.icon}</span>
                                    <span className="text-sm font-medium">{domain.name}</span>
                                </div>
                                <span className={cn(
                                    'text-sm font-semibold',
                                    color === 'green' && 'text-green-400',
                                    color === 'yellow' && 'text-yellow-400',
                                    color === 'red' && 'text-red-400'
                                )}>
                                    {score}%
                                </span>
                            </div>
                            <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        color === 'green' && 'bg-gradient-to-r from-green-600 to-green-400',
                                        color === 'yellow' && 'bg-gradient-to-r from-yellow-600 to-yellow-400',
                                        color === 'red' && 'bg-gradient-to-r from-red-600 to-red-400'
                                    )}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Radar Chart Placeholder (PRO) */}
            {showRadar && (
                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-center h-48 bg-[var(--bg-hover)] rounded-xl">
                        <div className="text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-sm text-[var(--text-muted)]">Radar Chart</p>
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">PRO</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
