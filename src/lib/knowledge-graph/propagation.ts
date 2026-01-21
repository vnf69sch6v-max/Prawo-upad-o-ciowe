/**
 * Knowledge Graph Propagation & Recommendation Algorithms
 */

import type {
    KnowledgeNode,
    KnowledgeEdge,
    UserMastery,
    TopicRecommendation,
    MasteryPropagation
} from './types';
import { LEGAL_KNOWLEDGE_GRAPH, getPrerequisites, getContrastingConcepts } from './graph-data';

// ═══════════════════════════════════════════════════════
// MASTERY PROPAGATION
// ═══════════════════════════════════════════════════════

/**
 * When user masters a topic, propagate influence to related topics
 * This helps reduce redundant practice for connected concepts
 */
export function propagateMastery(
    masteredNodeId: string,
    masteryLevel: number,
    userProgress: Record<string, UserMastery>
): MasteryPropagation[] {
    const graph = LEGAL_KNOWLEDGE_GRAPH;
    const node = graph.nodes[masteredNodeId];
    if (!node) return [];

    const relatedEdges = graph.edges.filter(
        e => e.from === masteredNodeId || e.to === masteredNodeId
    );

    const updates: MasteryPropagation[] = [];

    for (const edge of relatedEdges) {
        const relatedNodeId = edge.from === masteredNodeId ? edge.to : edge.from;
        const relatedNode = graph.nodes[relatedNodeId];
        if (!relatedNode) continue;

        // Calculate mastery boost based on edge type
        let masteryBoost = 0;

        switch (edge.type) {
            case 'requires':
                // If you mastered a prerequisite, dependent topics become easier
                if (edge.from === masteredNodeId) {
                    masteryBoost = masteryLevel * edge.strength * 0.3;
                }
                break;

            case 'defines':
                // Mastering a definition helps with articles using the concept
                masteryBoost = masteryLevel * edge.strength * 0.4;
                break;

            case 'similar_to':
                // Similar topics - knowledge transfer
                masteryBoost = masteryLevel * edge.strength * 0.25;
                break;

            case 'contrasts_with':
                // Knowing one helps distinguish the other
                masteryBoost = masteryLevel * edge.strength * 0.2;
                break;

            case 'references':
                // Weak connection
                masteryBoost = masteryLevel * edge.strength * 0.15;
                break;

            case 'example_of':
                // Examples help understand general rules
                masteryBoost = masteryLevel * edge.strength * 0.35;
                break;
        }

        if (masteryBoost > 0) {
            const currentMastery = userProgress[relatedNodeId]?.masteryLevel || 0;
            const newMastery = Math.min(100, currentMastery + masteryBoost);

            if (newMastery > currentMastery) {
                updates.push({
                    nodeId: relatedNodeId,
                    previousMastery: currentMastery,
                    newMastery: Math.round(newMastery * 100) / 100,
                    reason: `Powiązanie z "${node.name}" (${edge.type})`
                });
            }
        }
    }

    return updates;
}

// ═══════════════════════════════════════════════════════
// TOPIC RECOMMENDATIONS
// ═══════════════════════════════════════════════════════

/**
 * Recommend next topics to study based on:
 * - Current mastery levels
 * - Prerequisites
 * - Exam weights
 * - Time since last practice
 */
export function recommendNextTopics(
    userProgress: Record<string, UserMastery>,
    options: {
        examDate?: Date;
        focusArea?: string;  // 'KC' | 'KSH' | 'PU'
        limit?: number;
    } = {}
): TopicRecommendation[] {
    const { examDate, focusArea, limit = 5 } = options;
    const graph = LEGAL_KNOWLEDGE_GRAPH;

    const daysToExam = examDate
        ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 365;

    const candidates = Object.values(graph.nodes)
        .filter(node => {
            // Filter by focus area if specified
            if (focusArea && node.source !== focusArea) return false;
            return true;
        })
        .map(node => {
            const progress = userProgress[node.id] || {
                nodeId: node.id,
                masteryLevel: 0,
                lastPracticed: null,
                practiceCount: 0,
                correctCount: 0,
                incorrectCount: 0
            };

            // ═══════════════════════════════════════════════════════
            // SCORING: Higher score = higher priority
            // ═══════════════════════════════════════════════════════

            let score = 0;

            // 1. Low mastery = high priority (0-200 points)
            score += (100 - progress.masteryLevel) * 2;

            // 2. Exam weight (0-100 points)
            score += (node.examWeight || 5) * 10;

            // 3. Time since last practice (0-100 points)
            if (progress.lastPracticed) {
                const daysSince = (Date.now() - new Date(progress.lastPracticed).getTime())
                    / (1000 * 60 * 60 * 24);
                score += Math.min(100, daysSince * 3);
            } else {
                score += 150; // Never practiced - high priority
            }

            // 4. Check prerequisites
            const prerequisites = getPrerequisites(node.id);
            const prereqMet = prerequisites.every(prereq => {
                const prereqProgress = userProgress[prereq.id];
                return prereqProgress && prereqProgress.masteryLevel >= 50;
            });

            if (!prereqMet && prerequisites.length > 0) {
                score -= 50; // Lower priority if missing prerequisites
            }

            // 5. Exam proximity bonus for important topics
            if (daysToExam < 30 && node.examWeight >= 8) {
                score += node.examWeight * 5;
            }
            if (daysToExam < 7 && node.examWeight >= 9) {
                score += 100; // Last week - focus on most important
            }

            // 6. Contrasting concepts - if you know one, boost the other
            const contrasts = getContrastingConcepts(node.id);
            for (const contrast of contrasts) {
                const contrastProgress = userProgress[contrast.id];
                if (contrastProgress && contrastProgress.masteryLevel > 70) {
                    score += 20; // You know the contrast, good time to learn this
                }
            }

            return { node, progress, score, prereqMet };
        })
        .sort((a, b) => b.score - a.score);

    // Generate recommendations
    return candidates.slice(0, limit).map(c => ({
        node: c.node,
        score: c.score,
        reason: generateRecommendationReason(c, daysToExam),
        prerequisitesMet: c.prereqMet,
        urgency: c.node.examWeight >= 9 ? 'high'
            : c.node.examWeight >= 6 ? 'medium'
                : 'low'
    }));
}

/**
 * Generate human-readable recommendation reason
 */
function generateRecommendationReason(
    candidate: { node: KnowledgeNode; score: number; prereqMet: boolean; progress: UserMastery },
    daysToExam: number
): string {
    const reasons: string[] = [];

    if (candidate.node.examWeight >= 9) {
        reasons.push('🎯 Bardzo ważne na egzaminie');
    } else if (candidate.node.examWeight >= 7) {
        reasons.push('📌 Często na egzaminie');
    }

    if (!candidate.prereqMet) {
        reasons.push('⚠️ Najpierw opanuj podstawy');
    }

    if (candidate.progress.masteryLevel < 30) {
        reasons.push('📚 Nowy temat do nauki');
    } else if (candidate.progress.masteryLevel < 60) {
        reasons.push('🔄 Wymaga powtórki');
    }

    if (daysToExam < 14 && candidate.node.examWeight >= 8) {
        reasons.push('⏰ Pilne przed egzaminem');
    }

    if (!candidate.progress.lastPracticed) {
        reasons.push('✨ Nigdy nie ćwiczone');
    }

    return reasons.slice(0, 2).join(' | ') || '📖 Warto powtórzyć';
}

// ═══════════════════════════════════════════════════════
// PREREQUISITE ANALYSIS
// ═══════════════════════════════════════════════════════

/**
 * Check which prerequisites are missing for a topic
 */
export function getMissingPrerequisites(
    nodeId: string,
    userProgress: Record<string, UserMastery>,
    minMastery: number = 50
): KnowledgeNode[] {
    const prerequisites = getPrerequisites(nodeId);

    return prerequisites.filter(prereq => {
        const progress = userProgress[prereq.id];
        return !progress || progress.masteryLevel < minMastery;
    });
}

/**
 * Build a study path from prerequisites to target
 */
export function buildStudyPath(
    targetNodeId: string,
    userProgress: Record<string, UserMastery>
): KnowledgeNode[] {
    const graph = LEGAL_KNOWLEDGE_GRAPH;
    const target = graph.nodes[targetNodeId];
    if (!target) return [];

    const path: KnowledgeNode[] = [];
    const visited = new Set<string>();

    function addWithPrereqs(nodeId: string) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const prerequisites = getPrerequisites(nodeId);

        // Add unmastered prerequisites first
        for (const prereq of prerequisites) {
            const progress = userProgress[prereq.id];
            if (!progress || progress.masteryLevel < 50) {
                addWithPrereqs(prereq.id);
            }
        }

        // Then add this node if not mastered
        const progress = userProgress[nodeId];
        if (!progress || progress.masteryLevel < 80) {
            const node = graph.nodes[nodeId];
            if (node) path.push(node);
        }
    }

    addWithPrereqs(targetNodeId);
    return path;
}

// ═══════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════

/**
 * Calculate overall mastery for a legal area
 */
export function calculateAreaMastery(
    source: string,
    userProgress: Record<string, UserMastery>
): { mastery: number; total: number; mastered: number } {
    const graph = LEGAL_KNOWLEDGE_GRAPH;
    const nodes = Object.values(graph.nodes).filter(n => n.source === source);

    if (nodes.length === 0) return { mastery: 0, total: 0, mastered: 0 };

    let totalMastery = 0;
    let masteredCount = 0;

    for (const node of nodes) {
        const progress = userProgress[node.id];
        const mastery = progress?.masteryLevel || 0;
        totalMastery += mastery;
        if (mastery >= 80) masteredCount++;
    }

    return {
        mastery: Math.round(totalMastery / nodes.length),
        total: nodes.length,
        mastered: masteredCount
    };
}
