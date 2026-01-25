// Exam Categories Configuration
// Hierarchical structure for 3 main certification paths

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ExamCategory = 'student-prawa' | 'egzamin-maklerski' | 'egzamin-aso';

export interface CategoryTopic {
    id: string;
    code?: string; // A, B, C... for broker exam
    name: string;
    shortName: string;
    description: string;
    icon: string;
    color: string;
    subtopics: string[];
    questionCount: number; // 0 for placeholder
    available: boolean;
}

export interface ExamCategoryConfig {
    id: ExamCategory;
    name: string;
    shortName: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    topics: CategoryTopic[];
}

// ============================================
// STUDENT PRAWA - Law Student Track
// ============================================

export const STUDENT_PRAWA_TOPICS: CategoryTopic[] = [
    {
        id: 'prawo_cywilne',
        name: 'Prawo Cywilne (KC)',
        shortName: 'Prawo Cywilne',
        description: 'Kodeks Cywilny - zobowiązania, umowy, odpowiedzialność',
        icon: '📜',
        color: '#2563eb',
        subtopics: ['Część ogólna', 'Zobowiązania', 'Umowy', 'Spadki', 'Własność'],
        questionCount: 774,
        available: true,
    },
    {
        id: 'ksh',
        name: 'Prawo Handlowe (KSH)',
        shortName: 'KSH',
        description: 'Kodeks Spółek Handlowych - spółki osobowe i kapitałowe',
        icon: '⚖️',
        color: '#1a365d',
        subtopics: ['Spółki osobowe', 'Sp. z o.o.', 'S.A.', 'PSA', 'Przekształcenia'],
        questionCount: 879,
        available: true,
    },
    {
        id: 'prawo_upadlosciowe',
        name: 'Prawo Upadłościowe',
        shortName: 'Upadłościowe',
        description: 'Prawo upadłościowe i restrukturyzacyjne',
        icon: '📉',
        color: '#ea580c',
        subtopics: ['Przesłanki upadłości', 'Postępowanie', 'Masy upadłości', 'Plan spłaty'],
        questionCount: 962,
        available: true,
    },
    {
        id: 'prawo_karne',
        name: 'Prawo Karne',
        shortName: 'Karne',
        description: 'Kodeks Karny - przestępstwa i kary',
        icon: '⚔️',
        color: '#dc2626',
        subtopics: ['Część ogólna', 'Przestępstwa', 'Kary i środki karne'],
        questionCount: 0,
        available: false,
    },
];

// ============================================
// EGZAMIN NA MAKLERA - Broker Exam Track (A-H)
// ============================================

export const EGZAMIN_MAKLERSKI_TOPICS: CategoryTopic[] = [
    {
        id: 'makler_a',
        code: 'A',
        name: 'Rachunek / matematyka / statystyka',
        shortName: 'Matematyka',
        description: 'PV/FV, stopy, kapitalizacja, renty, kredyty, statystyka portfelowa',
        icon: '🔢',
        color: '#7c3aed',
        subtopics: [
            'Matematyka finansowa: czas i pieniądz (PV/FV, stopy nominalne/efektywne, kapitalizacja, dyskonto)',
            'Renty, kredyty i harmonogramy (annuitet, rata kapitałowa, amortyzacja)',
            'Podstawy statystyki i ryzyka (średnia, odchylenie, wariancja, kowariancja, korelacja)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_b',
        code: 'B',
        name: 'Instrumenty i wycena "cash market"',
        shortName: 'Instrumenty',
        description: 'Obligacje, YTM, duration, akcje, PDA, ETF, fundusze',
        icon: '📊',
        color: '#2563eb',
        subtopics: [
            'Instrumenty dłużne: podstawy i rodzaje (kupon/zero/zmienny, emisja, cechy, ryzyka)',
            'Instrumenty dłużne: wycena i YTM (cena obligacji, YTM, krzywa dochodowości)',
            'Instrumenty dłużne: duration/convexity i strategie (Macaulay/modified, immunizacja)',
            'Instrumenty udziałowe i prawa (akcje, PDA, PP, kwity depozytowe, split/scalenie)',
            'Fundusze/ETF i produkty zbiorowego inwestowania',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_c',
        code: 'C',
        name: 'Analiza finansowa i corporate finance',
        shortName: 'Corporate Finance',
        description: 'Sprawozdania, wskaźniki, NPV/IRR, WACC, wycena DCF',
        icon: '📈',
        color: '#059669',
        subtopics: [
            'Rachunek wyników/bilans/CF w praktyce analityka',
            'Analiza wskaźnikowa (płynność, rentowność, zadłużenie, cykl konwersji)',
            'Corporate finance: projekty i koszt kapitału (NPV/IRR/PI, WACC, MCC/IOS, dźwignie)',
            'Wycena akcji i przedsiębiorstw (DCF, mnożniki P/E, DDM, EVA/ROIC)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_d',
        code: 'D',
        name: 'Portfel / strategie inwestycyjne',
        shortName: 'Portfel',
        description: 'CAPM, beta, SML/CML, Sharpe, dywersyfikacja',
        icon: '🎯',
        color: '#0891b2',
        subtopics: [
            'Analiza portfelowa: podstawy i CAPM (beta, ryzyko systematyczne, SML/CML, alpha)',
            'Miary efektywności i atestacja wyników (Sharpe/Treynor/Jensen, tracking error, attribution)',
            'Zarządzanie ryzykiem i konstrukcja portfela (dywersyfikacja, rebalancing, pasywne vs aktywne)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_e',
        code: 'E',
        name: 'Pochodne',
        shortName: 'Pochodne',
        description: 'Futures, forwards, opcje, BSM, strategie opcyjne',
        icon: '🔄',
        color: '#db2777',
        subtopics: [
            'Pochodne: forwards/futures – mechanika i wycena (baza, rozliczenia, mark-to-market, cash-and-carry)',
            'Opcje: podstawy i greki (payoff, moneyness, IV, delta/gamma/vega/theta)',
            'Opcje: wycena i strategie (BSM/CRR, spready, straddle/strangle, butterfly/condor, syntetyki)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_f',
        code: 'F',
        name: 'Rynek i obrót (GPW/SZOG/TNG)',
        shortName: 'Rynek GPW',
        description: 'Zlecenia, fixing, widełki, KDPW, regulamin GPW',
        icon: '🏛️',
        color: '#ca8a04',
        subtopics: [
            'Mikrostruktura rynku i zlecenia (typy zleceń, warunki wykonania, priorytety, arkusz)',
            'Fixing, kursy odniesienia, widełki i równoważenia (algorytm fixingu, statyczne/dynamiczne)',
            'Regulamin GPW + instrumenty/segmenty rynku (rynki regulowany/ASO, dopuszczenia)',
            'Post-trade: KDPW/KDPW_CCP, rozrachunek i zabezpieczenia (cykl rozliczeniowy, depozyty)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_g',
        code: 'G',
        name: 'Prawo i etyka',
        shortName: 'Prawo/Etyka',
        description: 'KC/KSH, MAR, MiFID, etyka maklera',
        icon: '⚖️',
        color: '#1a365d',
        subtopics: [
            'Prawo cywilne + spółki (KC/KSH) - zdolność do czynności, pełnomocnictwa, organy spółek',
            'Prawo rynku kapitałowego (obrót, emitenci, MAR) - nadużycia, informacja poufna',
            'Regulacje firm inwestycyjnych / MiFID (konflikt interesów, grupy docelowe, odpowiedniość)',
            'Prawo funduszy i ASI (definicje, struktury, obowiązki)',
            'Etyka i standardy zawodowe (zasady etyki maklera/doradcy, zachowania zakazane)',
        ],
        questionCount: 0,
        available: false,
    },
    {
        id: 'makler_h',
        code: 'H',
        name: 'Rachunkowość',
        shortName: 'Rachunkowość',
        description: 'Zasady wyceny, kapitały, emisje, akcje własne',
        icon: '📋',
        color: '#6366f1',
        subtopics: [
            'Rachunkowość: zasady, wycena i zdarzenia szczególne (wycena aktywów/pasywów, różnice kursowe, podatek odroczony)',
            'Rachunkowość: kapitały, emisje, akcje własne (koszty emisji, umorzenie, prezentacja kapitałów)',
        ],
        questionCount: 0,
        available: false,
    },
];

// ============================================
// EGZAMIN NA ASO - ASO Certification Track
// ============================================

export const EGZAMIN_ASO_TOPICS: CategoryTopic[] = [
    {
        id: 'aso_regulamin',
        name: 'Regulamin ASO',
        shortName: 'Regulamin',
        description: 'Regulamin Alternatywnego Systemu Obrotu',
        icon: '📜',
        color: '#0d9488',
        subtopics: ['Przepisy ogólne', 'Obrót instrumentami', 'Obowiązki emitentów'],
        questionCount: 200,
        available: true,
    },
    {
        id: 'aso_newconnect',
        name: 'NewConnect',
        shortName: 'NewConnect',
        description: 'Rynek NewConnect dla spółek wzrostowych',
        icon: '🚀',
        color: '#10b981',
        subtopics: ['Wprowadzenie do obrotu', 'Autoryzowani Doradcy', 'Obowiązki'],
        questionCount: 300,
        available: true,
    },
    {
        id: 'aso_catalyst',
        name: 'Catalyst',
        shortName: 'Catalyst',
        description: 'Rynek obligacji Catalyst',
        icon: '💎',
        color: '#0ea5e9',
        subtopics: ['Obligacje korporacyjne', 'Obligacje komunalne', 'Listowanie'],
        questionCount: 250,
        available: true,
    },
    {
        id: 'aso_obowiazki',
        name: 'Obowiązki informacyjne',
        shortName: 'Obowiązki',
        description: 'Obowiązki informacyjne emitentów ASO',
        icon: '📢',
        color: '#f59e0b',
        subtopics: ['Raporty bieżące', 'Raporty okresowe', 'Informacje poufne'],
        questionCount: 259,
        available: true,
    },
];

// ============================================
// MAIN CATEGORY CONFIGURATIONS
// ============================================

export const EXAM_CATEGORIES: ExamCategoryConfig[] = [
    {
        id: 'student-prawa',
        name: 'Student prawa',
        shortName: 'Student',
        description: 'Nauka prawa dla studentów - KC, KSH, PU, prawo karne',
        icon: '🎓',
        color: '#1a365d',
        gradient: 'from-[#1a365d] to-[#2563eb]',
        topics: STUDENT_PRAWA_TOPICS,
    },
    {
        id: 'egzamin-maklerski',
        name: 'Egzamin na maklera',
        shortName: 'Makler',
        description: 'Przygotowanie do egzaminu na maklera papierów wartościowych',
        icon: '📈',
        color: '#059669',
        gradient: 'from-[#059669] to-[#10b981]',
        topics: EGZAMIN_MAKLERSKI_TOPICS,
    },
    {
        id: 'egzamin-aso',
        name: 'Egzamin na ASO',
        shortName: 'ASO',
        description: 'Certyfikat Doradcy Autoryzowanego w ASO',
        icon: '📊',
        color: '#0d9488',
        gradient: 'from-[#0d9488] to-[#14b8a6]',
        topics: EGZAMIN_ASO_TOPICS,
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCategoryById(id: ExamCategory): ExamCategoryConfig | undefined {
    return EXAM_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryTopics(categoryId: ExamCategory): CategoryTopic[] {
    const category = getCategoryById(categoryId);
    return category?.topics || [];
}

export function getAvailableTopics(categoryId: ExamCategory): CategoryTopic[] {
    return getCategoryTopics(categoryId).filter(topic => topic.available);
}

export function getTotalQuestions(categoryId: ExamCategory): number {
    return getCategoryTopics(categoryId).reduce((sum, topic) => sum + topic.questionCount, 0);
}

export function getTopicById(topicId: string): CategoryTopic | undefined {
    for (const category of EXAM_CATEGORIES) {
        const topic = category.topics.find(t => t.id === topicId);
        if (topic) return topic;
    }
    return undefined;
}

export function getCategoryByTopicId(topicId: string): ExamCategoryConfig | undefined {
    for (const category of EXAM_CATEGORIES) {
        if (category.topics.some(t => t.id === topicId)) {
            return category;
        }
    }
    return undefined;
}

// Map old domain IDs to new category topics
export const DOMAIN_TO_TOPIC_MAP: Record<string, string> = {
    'ksh': 'ksh',
    'prawo_handlowe': 'ksh',
    'prawo_upadlosciowe': 'prawo_upadlosciowe',
    'prawo_cywilne': 'prawo_cywilne',
    'kodeks_cywilny': 'prawo_cywilne',
    'aso': 'aso_regulamin', // Default to regulamin, individual questions may be tagged differently
};

export function mapDomainToTopic(domainId: string): string {
    return DOMAIN_TO_TOPIC_MAP[domainId] || domainId;
}
