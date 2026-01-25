'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ConceptNode {
    id: string;
    name: string;
    domain: string;
    status: 'mastered' | 'decaying' | 'unknown';
    lastReview?: Date;
    decayDays?: number;
}

interface RetinaHeatmapProps {
    nodes?: ConceptNode[];
    gridSize?: number; // e.g., 12 for 12x12
    className?: string;
}

// Generate mock data for the grid
function generateMockNodes(count: number): ConceptNode[] {
    const domains = ['KSH', 'KC', 'PU', 'ASO'];
    const statuses: ('mastered' | 'decaying' | 'unknown')[] = ['mastered', 'decaying', 'unknown'];

    return Array.from({ length: count }, (_, i) => {
        // Weighted distribution: 30% mastered, 35% decaying, 35% unknown
        const rand = Math.random();
        const status = rand < 0.30 ? 'mastered' : rand < 0.65 ? 'decaying' : 'unknown';

        return {
            id: `concept-${i}`,
            name: `Art. ${i + 1} ${domains[i % 4]}`,
            domain: domains[i % 4],
            status,
            lastReview: status !== 'unknown' ? new Date(Date.now() - Math.random() * 7 * 86400000) : undefined,
            decayDays: status === 'decaying' ? Math.floor(Math.random() * 7) + 1 : undefined,
        };
    });
}

export function RetinaHeatmap({
    nodes,
    gridSize = 12,
    className
}: RetinaHeatmapProps) {
    const [hoveredNode, setHoveredNode] = useState<ConceptNode | null>(null);

    const gridNodes = useMemo(() => {
        if (nodes) return nodes;
        return generateMockNodes(gridSize * gridSize);
    }, [nodes, gridSize]);

    const stats = useMemo(() => {
        const mastered = gridNodes.filter(n => n.status === 'mastered').length;
        const decaying = gridNodes.filter(n => n.status === 'decaying').length;
        const unknown = gridNodes.filter(n => n.status === 'unknown').length;
        return { mastered, decaying, unknown, total: gridNodes.length };
    }, [gridNodes]);

    return (
        <div className={cn("relative", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        Knowledge Retina
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                        {stats.mastered}/{stats.total} secured •
                        <span className="text-[var(--alarm-critical)]"> {stats.decaying} decaying</span>
                    </p>
                </div>
                {stats.decaying > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-[var(--alarm-critical)]/20 text-[var(--alarm-critical)] text-xs font-medium animate-pulse">
                        ⚠ Memory leak detected
                    </div>
                )}
            </div>

            {/* The Grid - 12x12 micro squares */}
            <div
                className="grid gap-1 p-4 rounded-2xl border border-[var(--border-color)]"
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    backgroundColor: '#050505',
                }}
            >
                {gridNodes.map((node, index) => {
                    // Inline styles for guaranteed visibility
                    const nodeStyle: React.CSSProperties = {
                        aspectRatio: '1',
                        minWidth: '16px',
                        minHeight: '16px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        animationDelay: node.status === 'decaying' ? `${(index % 5) * 0.5}s` : undefined,
                    };

                    if (node.status === 'mastered') {
                        nodeStyle.background = '#00E676';
                        nodeStyle.boxShadow = '0 0 8px rgba(0, 230, 118, 0.6)';
                    } else if (node.status === 'decaying') {
                        nodeStyle.background = 'rgba(255, 255, 255, 0.2)';
                        nodeStyle.animation = 'node-decay 3s ease-in-out infinite';
                    } else {
                        nodeStyle.background = 'rgba(0, 0, 0, 0.8)';
                        nodeStyle.border = '1px solid rgba(255, 255, 255, 0.08)';
                    }

                    return (
                        <div
                            key={node.id}
                            className="hover:scale-150 hover:z-10"
                            style={nodeStyle}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                        />
                    );
                })}
            </div>

            {/* Hover Tooltip */}
            {hoveredNode && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 min-w-[200px]">
                    <div className="font-medium text-sm">{hoveredNode.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                        Domain: {hoveredNode.domain}
                    </div>
                    {hoveredNode.status === 'decaying' && (
                        <div className="text-xs text-[var(--alarm-critical)] mt-1">
                            ⚠ Decaying for {hoveredNode.decayDays} days
                        </div>
                    )}
                    {hoveredNode.status === 'unknown' && (
                        <div className="text-xs text-[var(--text-subtle)] mt-1">
                            ● Never studied
                        </div>
                    )}
                    {hoveredNode.status === 'mastered' && (
                        <div className="text-xs text-[var(--accent-success)] mt-1">
                            ✓ Knowledge secured
                        </div>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--accent-success)] shadow-[0_0_6px_rgba(0,230,118,0.5)]" />
                    <span>Secured</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white/20 animate-pulse" />
                    <span>Decaying</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-black border border-white/10" />
                    <span>Unknown</span>
                </div>
            </div>
        </div>
    );
}
