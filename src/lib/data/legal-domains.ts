// Legal Domains Configuration
// Hierarchical structure for organizing legal content

export type LegalDomainCategory =
    | 'prawo_handlowe'
    | 'prawo_cywilne'
    | 'prawo_karne'
    | 'procedura_cywilna'
    | 'procedura_karna'
    | 'prawo_konstytucyjne'
    | 'prawo_administracyjne'
    | 'prawo_pracy';

export type CommercialLawSubdomain =
    | 'ksh_ogolne'
    | 'ksh_spolka_jawna'
    | 'ksh_spolka_partnerska'
    | 'ksh_spolka_komandytowa'
    | 'ksh_spolka_komandytowo_akcyjna'
    | 'ksh_spolka_zoo'
    | 'ksh_spolka_akcyjna'
    | 'ksh_psa'
    | 'prawo_upadlosciowe'
    | 'prawo_restrukturyzacyjne'
    | 'ustawa_krs';

export type CivilLawSubdomain =
    | 'kc_czesc_ogolna'
    | 'kc_zobowiazania'
    | 'kc_prawo_rzeczowe'
    | 'kc_spadki'
    | 'kc_wlasnosc';

export type CriminalLawSubdomain =
    | 'kk_czesc_ogolna'
    | 'kk_czesc_szczegolna'
    | 'kk_kary';

export type LegalSubdomain =
    | CommercialLawSubdomain
    | CivilLawSubdomain
    | CriminalLawSubdomain
    | 'all';

// Domain configuration
export interface DomainConfig {
    id: LegalDomainCategory;
    name: string;
    icon: string;
    color: string;
    subdomains: SubdomainConfig[];
}

export interface SubdomainConfig {
    id: LegalSubdomain;
    name: string;
    shortName: string;
    description?: string;
    questionCount?: number;
    group?: 'ogolne' | 'osobowe' | 'kapitalowe' | 'inne';
}

// Full domain hierarchy
export const LEGAL_DOMAINS: DomainConfig[] = [
    {
        id: 'prawo_handlowe',
        name: 'Prawo Handlowe',
        icon: '⚖️',
        color: 'purple',
        subdomains: [
            // Przepisy ogólne
            { id: 'ksh_ogolne', name: 'KSH - Przepisy ogólne', shortName: 'KSH Ogólne', group: 'ogolne' },
            // Spółki osobowe
            { id: 'ksh_spolka_jawna', name: 'KSH - Spółka jawna', shortName: 'Sp. jawna', group: 'osobowe' },
            { id: 'ksh_spolka_partnerska', name: 'KSH - Spółka partnerska', shortName: 'Sp. partnerska', group: 'osobowe' },
            { id: 'ksh_spolka_komandytowa', name: 'KSH - Spółka komandytowa', shortName: 'Sp. komandytowa', group: 'osobowe' },
            { id: 'ksh_spolka_komandytowo_akcyjna', name: 'KSH - Spółka komandytowo-akcyjna', shortName: 'S.K.A.', group: 'osobowe' },
            // Spółki kapitałowe
            { id: 'ksh_spolka_zoo', name: 'KSH - Spółka z o.o.', shortName: 'Sp. z o.o.', group: 'kapitalowe' },
            { id: 'ksh_spolka_akcyjna', name: 'KSH - Spółka akcyjna', shortName: 'S.A.', group: 'kapitalowe' },
            { id: 'ksh_psa', name: 'KSH - Prosta spółka akcyjna', shortName: 'P.S.A.', group: 'kapitalowe' },
            // Inne ustawy
            { id: 'prawo_upadlosciowe', name: 'Prawo upadłościowe', shortName: 'Upadłościowe', group: 'inne' },
            { id: 'prawo_restrukturyzacyjne', name: 'Prawo restrukturyzacyjne', shortName: 'Restrukturyzacja', group: 'inne' },
            { id: 'ustawa_krs', name: 'Ustawa o KRS', shortName: 'KRS', group: 'inne' },
        ]
    },
    {
        id: 'prawo_cywilne',
        name: 'Prawo Cywilne',
        icon: '📕',
        color: 'blue',
        subdomains: [
            { id: 'kc_czesc_ogolna', name: 'Kodeks cywilny - Część ogólna', shortName: 'KC Ogólna' },
            { id: 'kc_zobowiazania', name: 'Kodeks cywilny - Zobowiązania', shortName: 'Zobowiązania' },
            { id: 'kc_prawo_rzeczowe', name: 'Kodeks cywilny - Prawo rzeczowe', shortName: 'Prawo rzeczowe' },
            { id: 'kc_spadki', name: 'Kodeks cywilny - Spadki', shortName: 'Spadki' },
            { id: 'kc_wlasnosc', name: 'Kodeks cywilny - Własność', shortName: 'Własność' },
        ]
    },
    {
        id: 'prawo_karne',
        name: 'Prawo Karne',
        icon: '⚔️',
        color: 'red',
        subdomains: [
            { id: 'kk_czesc_ogolna', name: 'Kodeks karny - Część ogólna', shortName: 'KK Ogólna' },
            { id: 'kk_czesc_szczegolna', name: 'Kodeks karny - Część szczególna', shortName: 'KK Szczególna' },
            { id: 'kk_kary', name: 'Kodeks karny - Kary i środki karne', shortName: 'Kary' },
        ]
    },
    {
        id: 'procedura_cywilna',
        name: 'Postępowanie Cywilne',
        icon: '📋',
        color: 'cyan',
        subdomains: []
    },
    {
        id: 'procedura_karna',
        name: 'Postępowanie Karne',
        icon: '🔍',
        color: 'orange',
        subdomains: []
    },
    {
        id: 'prawo_konstytucyjne',
        name: 'Prawo Konstytucyjne',
        icon: '🏛️',
        color: 'yellow',
        subdomains: []
    },
    {
        id: 'prawo_administracyjne',
        name: 'Prawo Administracyjne',
        icon: '🏢',
        color: 'green',
        subdomains: []
    },
    {
        id: 'prawo_pracy',
        name: 'Prawo Pracy',
        icon: '👷',
        color: 'pink',
        subdomains: []
    },
];

// Helper functions
export function getDomainById(id: LegalDomainCategory): DomainConfig | undefined {
    return LEGAL_DOMAINS.find(d => d.id === id);
}

export function getSubdomainById(id: LegalSubdomain): SubdomainConfig | undefined {
    for (const domain of LEGAL_DOMAINS) {
        const subdomain = domain.subdomains.find(s => s.id === id);
        if (subdomain) return subdomain;
    }
    return undefined;
}

export function getSubdomainName(id: LegalSubdomain | string): string {
    const subdomain = getSubdomainById(id as LegalSubdomain);
    return subdomain?.name || id;
}

export function getDomainsWithExams(): DomainConfig[] {
    // For now, only commercial law has exams
    return LEGAL_DOMAINS.filter(d => d.id === 'prawo_handlowe');
}

// Map KSH sections to subdomains
export const KSH_SECTION_TO_SUBDOMAIN: Record<string, CommercialLawSubdomain> = {
    'Przepisy ogólne': 'ksh_ogolne',
    'Spółka jawna': 'ksh_spolka_jawna',
    'Spółka partnerska': 'ksh_spolka_partnerska',
    'Spółka komandytowa': 'ksh_spolka_komandytowa',
    'Spółka komandytowo-akcyjna': 'ksh_spolka_komandytowo_akcyjna',
    'Spółka z o.o.': 'ksh_spolka_zoo',
    'Sp. z o.o.': 'ksh_spolka_zoo',
    'Spółka akcyjna': 'ksh_spolka_akcyjna',
    'akcyjna': 'ksh_spolka_akcyjna',
    'S.A.': 'ksh_spolka_akcyjna',
    'Prosta spółka akcyjna': 'ksh_psa',
    'P.S.A.': 'ksh_psa',
};

export function mapSectionToSubdomain(section: string): CommercialLawSubdomain | null {
    // Direct match
    if (KSH_SECTION_TO_SUBDOMAIN[section]) {
        return KSH_SECTION_TO_SUBDOMAIN[section];
    }

    // Partial match
    const lowerSection = section.toLowerCase();
    if (lowerSection.includes('sp. z o.o') || lowerSection.includes('spółka z o.o')) {
        return 'ksh_spolka_zoo';
    }
    if (lowerSection.includes('akcyjna') && !lowerSection.includes('komandytowo')) {
        return 'ksh_spolka_akcyjna';
    }
    if (lowerSection.includes('jawna')) {
        return 'ksh_spolka_jawna';
    }
    if (lowerSection.includes('komandytowa') && !lowerSection.includes('akcyjna')) {
        return 'ksh_spolka_komandytowa';
    }
    if (lowerSection.includes('komandytowo-akcyjna') || lowerSection.includes('komandytowo akcyjna')) {
        return 'ksh_spolka_komandytowo_akcyjna';
    }
    if (lowerSection.includes('partnerska')) {
        return 'ksh_spolka_partnerska';
    }
    if (lowerSection.includes('prosta')) {
        return 'ksh_psa';
    }

    return null;
}
