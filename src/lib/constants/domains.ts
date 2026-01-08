// Legal Domain Constants

export const LEGAL_DOMAINS = {
    prawo_cywilne: {
        id: 'prawo_cywilne',
        name: 'Prawo Cywilne',
        icon: '⚖️',
        color: '#3b82f6', // blue
    },
    prawo_karne: {
        id: 'prawo_karne',
        name: 'Prawo Karne',
        icon: '⚔️',
        color: '#ef4444', // red
    },
    prawo_handlowe: {
        id: 'prawo_handlowe',
        name: 'Prawo Handlowe',
        icon: '🏢',
        color: '#22c55e', // green
    },
    procedura_cywilna: {
        id: 'procedura_cywilna',
        name: 'Procedura Cywilna',
        icon: '📋',
        color: '#8b5cf6', // purple
    },
    procedura_karna: {
        id: 'procedura_karna',
        name: 'Procedura Karna',
        icon: '🔍',
        color: '#f59e0b', // amber
    },
    prawo_konstytucyjne: {
        id: 'prawo_konstytucyjne',
        name: 'Prawo Konstytucyjne',
        icon: '🏛️',
        color: '#06b6d4', // cyan
    },
    prawo_administracyjne: {
        id: 'prawo_administracyjne',
        name: 'Prawo Administracyjne',
        icon: '🏛️',
        color: '#84cc16', // lime
    },
    prawo_pracy: {
        id: 'prawo_pracy',
        name: 'Prawo Pracy',
        icon: '👷',
        color: '#ec4899', // pink
    },
    prawo_upadlosciowe: {
        id: 'prawo_upadlosciowe',
        name: 'Prawo Upadłościowe',
        icon: '📉',
        color: '#f97316', // orange
    },
} as const;

export type LegalDomainId = keyof typeof LEGAL_DOMAINS;

export function getDomainInfo(domainId: LegalDomainId) {
    return LEGAL_DOMAINS[domainId];
}

export function getAllDomains() {
    return Object.values(LEGAL_DOMAINS);
}
