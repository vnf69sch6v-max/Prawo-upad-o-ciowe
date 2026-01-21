/**
 * Knowledge Graph Types
 * Represents relationships between legal concepts, articles, and cases
 */

// ═══════════════════════════════════════════════════════
// NODE TYPES
// ═══════════════════════════════════════════════════════

export type NodeType = 'article' | 'concept' | 'case' | 'institution';

export interface KnowledgeNode {
    id: string;
    type: NodeType;
    name: string;
    source: string;           // 'KC' | 'KSH' | 'PU' | 'KK' etc.
    content?: string;         // Full text of article
    topics: string[];         // Tags for categorization
    examWeight: number;       // 1-10 importance for exam
    lastAmended?: Date;       // When was this last changed
    questionIds?: string[];   // Related question IDs
}

// ═══════════════════════════════════════════════════════
// EDGE TYPES
// ═══════════════════════════════════════════════════════

export type EdgeType =
    | 'requires'       // Node A is prerequisite for Node B
    | 'defines'        // Node A defines concept used in Node B
    | 'similar_to'     // Nodes cover similar concepts
    | 'contrasts_with' // Nodes are often confused
    | 'references'     // Node A directly references Node B
    | 'example_of';    // Node A is example/application of Node B

export interface KnowledgeEdge {
    id: string;
    from: string;      // Source node ID
    to: string;        // Target node ID
    type: EdgeType;
    strength: number;  // 0-1, how strong is the connection
    description?: string;
}

// ═══════════════════════════════════════════════════════
// GRAPH STRUCTURE
// ═══════════════════════════════════════════════════════

export interface KnowledgeGraph {
    nodes: Record<string, KnowledgeNode>;
    edges: KnowledgeEdge[];
    metadata: {
        lastUpdated: Date;
        version: string;
        totalNodes: number;
        totalEdges: number;
    };
}

// ═══════════════════════════════════════════════════════
// USER MASTERY STATE
// ═══════════════════════════════════════════════════════

export interface UserMastery {
    nodeId: string;
    masteryLevel: number;     // 0-100%
    lastPracticed: Date | null;
    practiceCount: number;
    correctCount: number;
    incorrectCount: number;
}

// ═══════════════════════════════════════════════════════
// RECOMMENDATION TYPES
// ═══════════════════════════════════════════════════════

export interface TopicRecommendation {
    node: KnowledgeNode;
    score: number;
    reason: string;
    prerequisitesMet: boolean;
    urgency: 'high' | 'medium' | 'low';
}

export interface MasteryPropagation {
    nodeId: string;
    previousMastery: number;
    newMastery: number;
    reason: string;
}
