/**
 * Static Knowledge Graph Data
 * Contains relationships between legal articles and concepts
 */

import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from './types';

// ═══════════════════════════════════════════════════════
// NODES: Key Legal Concepts & Articles
// ═══════════════════════════════════════════════════════

const nodes: Record<string, KnowledgeNode> = {
    // ─────────────────────────────────────────────────────
    // KODEKS CYWILNY - Część ogólna
    // ─────────────────────────────────────────────────────
    'kc_art_1': {
        id: 'kc_art_1',
        type: 'article',
        name: 'Art. 1 KC - Moc wsteczna',
        source: 'KC',
        topics: ['zasady prawa', 'intertemporalne'],
        examWeight: 3,
        content: 'Ustawa nie ma mocy wstecznej, chyba że to wynika z jej brzmienia lub celu.'
    },
    'kc_art_5': {
        id: 'kc_art_5',
        type: 'article',
        name: 'Art. 5 KC - Nadużycie prawa',
        source: 'KC',
        topics: ['zasady prawa', 'klauzule generalne', 'nadużycie prawa'],
        examWeight: 9,
        content: 'Nie można czynić ze swego prawa użytku, który by był sprzeczny ze społeczno-gospodarczym przeznaczeniem tego prawa lub z zasadami współżycia społecznego.'
    },
    'kc_art_23': {
        id: 'kc_art_23',
        type: 'article',
        name: 'Art. 23 KC - Dobra osobiste',
        source: 'KC',
        topics: ['dobra osobiste', 'ochrona dóbr'],
        examWeight: 8,
        content: 'Dobra osobiste człowieka, jak w szczególności zdrowie, wolność, cześć, swoboda sumienia, nazwisko lub pseudonim, wizerunek, tajemnica korespondencji, nietykalność mieszkania, twórczość naukowa, artystyczna, wynalazcza i racjonalizatorska, pozostają pod ochroną prawa cywilnego niezależnie od ochrony przewidzianej w innych przepisach.'
    },
    'kc_art_24': {
        id: 'kc_art_24',
        type: 'article',
        name: 'Art. 24 KC - Ochrona dóbr osobistych',
        source: 'KC',
        topics: ['dobra osobiste', 'roszczenia'],
        examWeight: 8,
    },

    // ─────────────────────────────────────────────────────
    // KODEKS CYWILNY - Zobowiązania
    // ─────────────────────────────────────────────────────
    'kc_art_354': {
        id: 'kc_art_354',
        type: 'article',
        name: 'Art. 354 KC - Sposób wykonania zobowiązania',
        source: 'KC',
        topics: ['zobowiązania', 'wykonanie zobowiązania'],
        examWeight: 7,
    },
    'kc_art_361': {
        id: 'kc_art_361',
        type: 'article',
        name: 'Art. 361 KC - Związek przyczynowy, zakres odszkodowania',
        source: 'KC',
        topics: ['odszkodowanie', 'związek przyczynowy', 'adekwatność'],
        examWeight: 10,
        content: '§1. Zobowiązany do odszkodowania ponosi odpowiedzialność tylko za normalne następstwa działania lub zaniechania, z którego szkoda wynikła.'
    },
    'kc_art_415': {
        id: 'kc_art_415',
        type: 'article',
        name: 'Art. 415 KC - Odpowiedzialność deliktowa',
        source: 'KC',
        topics: ['czyny niedozwolone', 'delikt', 'odpowiedzialność'],
        examWeight: 10,
        content: 'Kto z winy swej wyrządził drugiemu szkodę, obowiązany jest do jej naprawienia.'
    },
    'kc_art_471': {
        id: 'kc_art_471',
        type: 'article',
        name: 'Art. 471 KC - Odpowiedzialność kontraktowa',
        source: 'KC',
        topics: ['kontrakty', 'niewykonanie zobowiązania', 'odpowiedzialność'],
        examWeight: 10,
        content: 'Dłużnik obowiązany jest do naprawienia szkody wynikłej z niewykonania lub nienależytego wykonania zobowiązania, chyba że niewykonanie lub nienależyte wykonanie jest następstwem okoliczności, za które dłużnik odpowiedzialności nie ponosi.'
    },

    // ─────────────────────────────────────────────────────
    // KODEKS CYWILNY - Pojęcia
    // ─────────────────────────────────────────────────────
    'concept_wina': {
        id: 'concept_wina',
        type: 'concept',
        name: 'Wina',
        source: 'KC',
        topics: ['odpowiedzialność', 'delikt', 'kontrakty'],
        examWeight: 9,
    },
    'concept_szkoda': {
        id: 'concept_szkoda',
        type: 'concept',
        name: 'Szkoda',
        source: 'KC',
        topics: ['odszkodowanie', 'delikt', 'kontrakty'],
        examWeight: 9,
    },
    'concept_zwiazek_przyczynowy': {
        id: 'concept_zwiazek_przyczynowy',
        type: 'concept',
        name: 'Związek przyczynowy',
        source: 'KC',
        topics: ['odszkodowanie', 'adekwatność'],
        examWeight: 9,
    },

    // ─────────────────────────────────────────────────────
    // KODEKS SPÓŁEK HANDLOWYCH
    // ─────────────────────────────────────────────────────
    'ksh_art_151': {
        id: 'ksh_art_151',
        type: 'article',
        name: 'Art. 151 KSH - Spółka z o.o. definicja',
        source: 'KSH',
        topics: ['spółka z o.o.', 'osobowość prawna'],
        examWeight: 8,
    },
    'ksh_art_154': {
        id: 'ksh_art_154',
        type: 'article',
        name: 'Art. 154 KSH - Kapitał zakładowy sp. z o.o.',
        source: 'KSH',
        topics: ['spółka z o.o.', 'kapitał zakładowy'],
        examWeight: 9,
        content: 'Kapitał zakładowy spółki powinien wynosić co najmniej 5000 złotych. Wartość nominalna udziału nie może być niższa niż 50 złotych.'
    },
    'ksh_art_201': {
        id: 'ksh_art_201',
        type: 'article',
        name: 'Art. 201 KSH - Zarząd sp. z o.o.',
        source: 'KSH',
        topics: ['spółka z o.o.', 'zarząd', 'reprezentacja'],
        examWeight: 8,
    },
    'ksh_art_299': {
        id: 'ksh_art_299',
        type: 'article',
        name: 'Art. 299 KSH - Odpowiedzialność członków zarządu',
        source: 'KSH',
        topics: ['spółka z o.o.', 'zarząd', 'odpowiedzialność', 'upadłość'],
        examWeight: 10,
        content: '§1. Jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania.'
    },
    'ksh_art_301': {
        id: 'ksh_art_301',
        type: 'article',
        name: 'Art. 301 KSH - Spółka akcyjna definicja',
        source: 'KSH',
        topics: ['spółka akcyjna', 'osobowość prawna'],
        examWeight: 7,
    },

    // ─────────────────────────────────────────────────────
    // PRAWO UPADŁOŚCIOWE
    // ─────────────────────────────────────────────────────
    'pu_art_10': {
        id: 'pu_art_10',
        type: 'article',
        name: 'Art. 10 PU - Przesłanki upadłości',
        source: 'PU',
        topics: ['upadłość', 'niewypłacalność'],
        examWeight: 10,
        content: 'Upadłość ogłasza się w stosunku do dłużnika, który stał się niewypłacalny.'
    },
    'pu_art_11': {
        id: 'pu_art_11',
        type: 'article',
        name: 'Art. 11 PU - Definicja niewypłacalności',
        source: 'PU',
        topics: ['upadłość', 'niewypłacalność', '3 miesiące'],
        examWeight: 10,
        content: 'Dłużnik jest niewypłacalny, jeżeli utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych.'
    },
    'pu_art_21': {
        id: 'pu_art_21',
        type: 'article',
        name: 'Art. 21 PU - Obowiązek złożenia wniosku (30 dni)',
        source: 'PU',
        topics: ['upadłość', 'wniosek', '30 dni'],
        examWeight: 10,
    },
};

// ═══════════════════════════════════════════════════════
// EDGES: Relationships between nodes
// ═══════════════════════════════════════════════════════

const edges: KnowledgeEdge[] = [
    // KC - Odpowiedzialność deliktowa i kontraktowa
    {
        id: 'e1',
        from: 'kc_art_415',
        to: 'kc_art_361',
        type: 'requires',
        strength: 0.95,
        description: 'Odpowiedzialność deliktowa wymaga znajomości związku przyczynowego'
    },
    {
        id: 'e2',
        from: 'kc_art_415',
        to: 'concept_wina',
        type: 'defines',
        strength: 1.0,
        description: 'Art. 415 KC definiuje odpowiedzialność na zasadzie winy'
    },
    {
        id: 'e3',
        from: 'kc_art_415',
        to: 'concept_szkoda',
        type: 'requires',
        strength: 0.9,
        description: 'Musi wystąpić szkoda'
    },
    {
        id: 'e4',
        from: 'kc_art_471',
        to: 'kc_art_415',
        type: 'contrasts_with',
        strength: 0.85,
        description: 'Odpowiedzialność kontraktowa vs deliktowa - często mylone'
    },
    {
        id: 'e5',
        from: 'kc_art_471',
        to: 'kc_art_354',
        type: 'requires',
        strength: 0.8,
        description: 'Niewykonanie zakłada znajomość sposobu wykonania'
    },
    {
        id: 'e6',
        from: 'kc_art_361',
        to: 'concept_zwiazek_przyczynowy',
        type: 'defines',
        strength: 1.0,
        description: 'Art. 361 definiuje związek przyczynowy'
    },

    // KC - Dobra osobiste
    {
        id: 'e7',
        from: 'kc_art_24',
        to: 'kc_art_23',
        type: 'requires',
        strength: 1.0,
        description: 'Ochrona wymaga znajomości katalogu dóbr'
    },
    {
        id: 'e8',
        from: 'kc_art_24',
        to: 'kc_art_415',
        type: 'references',
        strength: 0.7,
        description: 'Odszkodowanie za naruszenie dóbr → art. 415'
    },

    // KSH - Spółka z o.o.
    {
        id: 'e10',
        from: 'ksh_art_154',
        to: 'ksh_art_151',
        type: 'requires',
        strength: 0.9,
        description: 'Kapitał zakładowy wymaga znajomości definicji sp. z o.o.'
    },
    {
        id: 'e11',
        from: 'ksh_art_201',
        to: 'ksh_art_151',
        type: 'requires',
        strength: 0.85,
        description: 'Zarząd sp. z o.o. - trzeba znać definicję spółki'
    },
    {
        id: 'e12',
        from: 'ksh_art_299',
        to: 'ksh_art_201',
        type: 'requires',
        strength: 0.95,
        description: 'Odpowiedzialność zarządu wymaga znajomości organów'
    },
    {
        id: 'e13',
        from: 'ksh_art_299',
        to: 'pu_art_21',
        type: 'references',
        strength: 0.9,
        description: 'Art. 299 odwołuje się do obowiązku złożenia wniosku o upadłość'
    },

    // PU - Upadłość
    {
        id: 'e20',
        from: 'pu_art_11',
        to: 'pu_art_10',
        type: 'defines',
        strength: 1.0,
        description: 'Art. 11 definiuje niewypłacalność z art. 10'
    },
    {
        id: 'e21',
        from: 'pu_art_21',
        to: 'pu_art_11',
        type: 'requires',
        strength: 0.95,
        description: 'Obowiązek złożenia wniosku wymaga znajomości niewypłacalności'
    },
    {
        id: 'e22',
        from: 'pu_art_21',
        to: 'ksh_art_299',
        type: 'references',
        strength: 0.85,
        description: 'Niezłożenie wniosku → odpowiedzialność art. 299'
    },
];

// ═══════════════════════════════════════════════════════
// EXPORT GRAPH
// ═══════════════════════════════════════════════════════

export const LEGAL_KNOWLEDGE_GRAPH: KnowledgeGraph = {
    nodes,
    edges,
    metadata: {
        lastUpdated: new Date('2026-01-21'),
        version: '1.0.0',
        totalNodes: Object.keys(nodes).length,
        totalEdges: edges.length
    }
};

// Helper to get node by ID
export function getNode(nodeId: string): KnowledgeNode | undefined {
    return LEGAL_KNOWLEDGE_GRAPH.nodes[nodeId];
}

// Get all edges from/to a node
export function getNodeEdges(nodeId: string): KnowledgeEdge[] {
    return LEGAL_KNOWLEDGE_GRAPH.edges.filter(
        e => e.from === nodeId || e.to === nodeId
    );
}

// Get prerequisites for a node
export function getPrerequisites(nodeId: string): KnowledgeNode[] {
    return LEGAL_KNOWLEDGE_GRAPH.edges
        .filter(e => e.to === nodeId && e.type === 'requires')
        .map(e => LEGAL_KNOWLEDGE_GRAPH.nodes[e.from])
        .filter(Boolean) as KnowledgeNode[];
}

// Get contrasting concepts (often confused)
export function getContrastingConcepts(nodeId: string): KnowledgeNode[] {
    return LEGAL_KNOWLEDGE_GRAPH.edges
        .filter(e =>
            (e.from === nodeId || e.to === nodeId) &&
            e.type === 'contrasts_with'
        )
        .map(e => LEGAL_KNOWLEDGE_GRAPH.nodes[e.from === nodeId ? e.to : e.from])
        .filter(Boolean) as KnowledgeNode[];
}
