'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

interface KnowledgeBlock {
    id: string;
    name: string;
    shortName: string;
    domain: string;
    totalQuestions: number;
    masteredQuestions: number;
    lastReview: Date | null;
    trend: 'improving' | 'stable' | 'declining';
}

interface KnowledgeHeatmapProps {
    blocks?: KnowledgeBlock[];
    className?: string;
}

// Default knowledge blocks for Polish legal domains
const DEFAULT_BLOCKS: KnowledgeBlock[] = [
    // Prawo Handlowe (KSH)
    { id: 'ksh-1', name: 'Przepisy ogólne', shortName: 'Ogólne', domain: 'KSH', totalQuestions: 50, masteredQuestions: 35, lastReview: new Date(), trend: 'improving' },
    { id: 'ksh-2', name: 'Spółka jawna', shortName: 'Jawna', domain: 'KSH', totalQuestions: 80, masteredQuestions: 45, lastReview: new Date(Date.now() - 86400000 * 3), trend: 'stable' },
    { id: 'ksh-3', name: 'Spółka partnerska', shortName: 'Partner.', domain: 'KSH', totalQuestions: 40, masteredQuestions: 12, lastReview: new Date(Date.now() - 86400000 * 7), trend: 'declining' },
    { id: 'ksh-4', name: 'Spółka komandytowa', shortName: 'Komand.', domain: 'KSH', totalQuestions: 60, masteredQuestions: 8, lastReview: null, trend: 'declining' },
    { id: 'ksh-5', name: 'Spółka z o.o.', shortName: 'Sp. z o.o.', domain: 'KSH', totalQuestions: 150, masteredQuestions: 95, lastReview: new Date(), trend: 'improving' },
    { id: 'ksh-6', name: 'Spółka akcyjna', shortName: 'S.A.', domain: 'KSH', totalQuestions: 180, masteredQuestions: 60, lastReview: new Date(Date.now() - 86400000 * 2), trend: 'stable' },
    { id: 'ksh-7', name: 'Prosta spółka akcyjna', shortName: 'P.S.A.', domain: 'KSH', totalQuestions: 70, masteredQuestions: 5, lastReview: null, trend: 'declining' },
    { id: 'ksh-8', name: 'Łączenie spółek', shortName: 'Łączenie', domain: 'KSH', totalQuestions: 45, masteredQuestions: 20, lastReview: new Date(Date.now() - 86400000 * 5), trend: 'stable' },
    // Prawo Cywilne (KC)
    { id: 'kc-1', name: 'Część ogólna', shortName: 'Ogólna', domain: 'KC', totalQuestions: 120, masteredQuestions: 80, lastReview: new Date(), trend: 'improving' },
    { id: 'kc-2', name: 'Prawo rzeczowe', shortName: 'Rzeczowe', domain: 'KC', totalQuestions: 100, masteredQuestions: 40, lastReview: new Date(Date.now() - 86400000 * 4), trend: 'stable' },
    { id: 'kc-3', name: 'Zobowiązania', shortName: 'Zobow.', domain: 'KC', totalQuestions: 200, masteredQuestions: 85, lastReview: new Date(Date.now() - 86400000 * 1), trend: 'improving' },
    { id: 'kc-4', name: 'Spadki', shortName: 'Spadki', domain: 'KC', totalQuestions: 80, masteredQuestions: 15, lastReview: null, trend: 'declining' },
    // Prawo Upadłościowe
    { id: 'pu-1', name: 'Przesłanki', shortName: 'Przesł.', domain: 'PU', totalQuestions: 30, masteredQuestions: 22, lastReview: new Date(), trend: 'improving' },
    { id: 'pu-2', name: 'Postępowanie', shortName: 'Postęp.', domain: 'PU', totalQuestions: 50, masteredQuestions: 10, lastReview: new Date(Date.now() - 86400000 * 6), trend: 'declining' },
    // ASO
    { id: 'aso-1', name: 'Rynek kapitałowy', shortName: 'Rynek', domain: 'ASO', totalQuestions: 100, masteredQuestions: 55, lastReview: new Date(Date.now() - 86400000 * 2), trend: 'stable' },
    { id: 'aso-2', name: 'Instrumenty finansowe', shortName: 'Instrum.', domain: 'ASO', totalQuestions: 80, masteredQuestions: 30, lastReview: new Date(Date.now() - 86400000 * 3), trend: 'declining' },
];

function getBlockStatus(block: KnowledgeBlock): 'mastered' | 'learning' | 'critical' | 'new' {
    const ratio = block.masteredQuestions / block.totalQuestions;
    if (ratio >= 0.7) return 'mastered';
    if (ratio >= 0.3) return 'learning';
    if (ratio > 0) return 'critical';
    return 'new';
}

function getStatusColor(status: 'mastered' | 'learning' | 'critical' | 'new'): string {
    switch (status) {
        case 'mastered': return 'var(--accent-success)';
        case 'learning': return 'var(--accent-warning)';
        case 'critical': return 'var(--accent-danger)';
        case 'new': return 'var(--text-subtle)';
    }
}

function formatLastReview(date: Date | null): string {
    if (!date) return 'Nigdy';
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return 'Dziś';
    if (days === 1) return 'Wczoraj';
    if (days < 7) return `${days} dni temu`;
    return `${Math.floor(days / 7)} tyg. temu`;
}

export function KnowledgeHeatmap({ blocks = DEFAULT_BLOCKS, className }: KnowledgeHeatmapProps) {
    // Group blocks by domain
    const groupedBlocks = useMemo(() => {
        const groups: Record<string, KnowledgeBlock[]> = {};
        blocks.forEach(block => {
            if (!groups[block.domain]) groups[block.domain] = [];
            groups[block.domain].push(block);
        });
        return groups;
    }, [blocks]);

    // Calculate overall stats
    const stats = useMemo(() => {
        const total = blocks.reduce((sum, b) => sum + b.totalQuestions, 0);
        const mastered = blocks.reduce((sum, b) => sum + b.masteredQuestions, 0);
        const criticalCount = blocks.filter(b => getBlockStatus(b) === 'critical').length;
        return { total, mastered, ratio: total > 0 ? Math.round((mastered / total) * 100) : 0, criticalCount };
    }, [blocks]);

    return (
        <div className={cn("glass-card", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        Mapa Wiedzy
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        {stats.mastered}/{stats.total} pytań opanowanych
                    </p>
                </div>
                {stats.criticalCount > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-[var(--accent-danger)]/20 text-[var(--accent-danger)] text-sm font-medium animate-pulse">
                        ⚠️ {stats.criticalCount} krytycznych braków
                    </div>
                )}
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-4">
                {Object.entries(groupedBlocks).map(([domain, domainBlocks]) => (
                    <div key={domain}>
                        <div className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                            {domain}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {domainBlocks.map(block => {
                                const status = getBlockStatus(block);
                                const color = getStatusColor(status);
                                const ratio = Math.round((block.masteredQuestions / block.totalQuestions) * 100);

                                return (
                                    <Link
                                        key={block.id}
                                        href={`/search?domain=${domain}&topic=${block.id}`}
                                        className="group relative"
                                    >
                                        <div
                                            className={cn(
                                                "w-16 h-16 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                                                "border border-[var(--border-color)] hover:scale-110 hover:z-10",
                                                status === 'mastered' && "neon-glow-success",
                                                status === 'critical' && "animate-pulse"
                                            )}
                                            style={{
                                                background: `color-mix(in srgb, ${color} 20%, transparent)`,
                                                borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                                                boxShadow: status === 'mastered' ? `0 0 15px color-mix(in srgb, ${color} 30%, transparent)` : undefined
                                            }}
                                        >
                                            <span className="text-[10px] font-medium truncate w-14 px-1" style={{ color }}>
                                                {block.shortName}
                                            </span>
                                            <span className="text-lg font-bold" style={{ color }}>
                                                {ratio}%
                                            </span>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                                            <div className="font-medium text-sm">{block.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">
                                                {block.masteredQuestions}/{block.totalQuestions} opanowane
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)]">
                                                Ostatnio: {formatLastReview(block.lastReview)}
                                            </div>
                                            {block.trend === 'declining' && (
                                                <div className="text-xs text-[var(--accent-danger)] mt-1">
                                                    📉 Zapominasz to!
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--border-color)]">
                {[
                    { status: 'mastered', label: 'Opanowane', emoji: '🟢' },
                    { status: 'learning', label: 'W nauce', emoji: '🟡' },
                    { status: 'critical', label: 'Krytyczne', emoji: '🔴' },
                    { status: 'new', label: 'Nowe', emoji: '⚪' },
                ].map(item => (
                    <div key={item.status} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
