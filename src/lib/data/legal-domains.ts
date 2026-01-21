// Legal Domains Configuration
// Hierarchical structure for organizing legal content

export type LegalDomainCategory =
    | 'ksh'
    | 'prawo_upadlosciowe'
    | 'prawo_cywilne'
    | 'prawo_karne'
    | 'procedura_cywilna'
    | 'procedura_karna'
    | 'prawo_konstytucyjne'
    | 'prawo_administracyjne'
    | 'prawo_pracy';

export type KSHSubdomain =
    | 'ksh_ogolne'
    | 'ksh_spolka_jawna'
    | 'ksh_spolka_partnerska'
    | 'ksh_spolka_komandytowa'
    | 'ksh_spolka_komandytowo_akcyjna'
    | 'ksh_spolka_zoo'
    | 'ksh_spolka_akcyjna'
    | 'ksh_psa'
    | 'ksh_przeksztalcenia';

export type PrawoUpadloscioweSubdomain =
    | 'pu_przepisy_ogolne'
    | 'pu_postepowanie'
    | 'pu_skutki'
    | 'pu_masa_upadlosci'
    | 'pu_upadlosc_konsumencka';

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
    | KSHSubdomain
    | PrawoUpadloscioweSubdomain
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
    hasQuestions?: boolean;
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
        id: 'ksh',
        name: 'Kodeks Spółek Handlowych',
        icon: '⚖️',
        color: 'purple',
        hasQuestions: true,
        subdomains: [
            // Przepisy ogólne
            { id: 'ksh_ogolne', name: 'Przepisy ogólne', shortName: 'Ogólne', group: 'ogolne' },
            // Spółki osobowe
            { id: 'ksh_spolka_jawna', name: 'Spółka jawna', shortName: 'Sp. jawna', group: 'osobowe' },
            { id: 'ksh_spolka_partnerska', name: 'Spółka partnerska', shortName: 'Sp. partnerska', group: 'osobowe' },
            { id: 'ksh_spolka_komandytowa', name: 'Spółka komandytowa', shortName: 'Sp. komandytowa', group: 'osobowe' },
            { id: 'ksh_spolka_komandytowo_akcyjna', name: 'Spółka komandytowo-akcyjna', shortName: 'S.K.A.', group: 'osobowe' },
            // Spółki kapitałowe
            { id: 'ksh_spolka_zoo', name: 'Spółka z o.o.', shortName: 'Sp. z o.o.', group: 'kapitalowe' },
            { id: 'ksh_spolka_akcyjna', name: 'Spółka akcyjna', shortName: 'S.A.', group: 'kapitalowe' },
            { id: 'ksh_psa', name: 'Prosta spółka akcyjna', shortName: 'P.S.A.', group: 'kapitalowe' },
            // Przekształcenia
            { id: 'ksh_przeksztalcenia', name: 'Przekształcenia spółek', shortName: 'Przekształcenia', group: 'inne' },
        ]
    },
    {
        id: 'prawo_upadlosciowe',
        name: 'Prawo Upadłościowe',
        icon: '📉',
        color: 'orange',
        hasQuestions: true,
        subdomains: [
            { id: 'pu_przepisy_ogolne', name: 'Przepisy ogólne', shortName: 'Ogólne' },
            { id: 'pu_postepowanie', name: 'Postępowanie upadłościowe', shortName: 'Postępowanie' },
            { id: 'pu_skutki', name: 'Skutki ogłoszenia upadłości', shortName: 'Skutki' },
            { id: 'pu_masa_upadlosci', name: 'Masa upadłości', shortName: 'Masa' },
            { id: 'pu_upadlosc_konsumencka', name: 'Upadłość konsumencka', shortName: 'Konsumencka' },
        ]
    },
    {
        id: 'prawo_cywilne',
        name: 'Kodeks Cywilny',
        icon: '📜',
        color: 'blue',
        hasQuestions: true,
        subdomains: [
            { id: 'kc_czesc_ogolna', name: 'Część ogólna', shortName: 'Ogólna' },
            { id: 'kc_prawo_rzeczowe', name: 'Prawo rzeczowe', shortName: 'Rzeczowe' },
            { id: 'kc_zobowiazania', name: 'Zobowiązania', shortName: 'Zobowiązania' },
            { id: 'kc_spadki', name: 'Spadki', shortName: 'Spadki' },
            { id: 'kc_wlasnosc', name: 'Własność i inne prawa', shortName: 'Własność' },
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
    return LEGAL_DOMAINS.filter(d => d.hasQuestions === true);
}

// Map KSH sections to subdomains
export const KSH_SECTION_TO_SUBDOMAIN: Record<string, KSHSubdomain> = {
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

export function mapSectionToSubdomain(section: string): KSHSubdomain | null {
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

