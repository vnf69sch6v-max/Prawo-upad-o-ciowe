// src/lib/plans.ts
// Kompletny system cennikowy z definicjami planów i limitów

export type PlanType = 'free' | 'premium' | 'pro';

export interface PlanFeatures {
    // Limity ilościowe
    questionsPerDay: number;          // Pytania dziennie (Infinity = bez limitu)
    aiExplanationsPerDay: number;     // AI wyjaśnienia dziennie
    aiTutorMessagesPerDay: number;    // Wiadomości do AI tutora

    // Dostęp do funkcji (boolean)
    accessAllCategories: boolean;     // Wszystkie działy prawa
    accessExamMode: boolean;          // Tryb egzaminacyjny
    accessAdvancedStats: boolean;     // Zaawansowane statystyki
    accessLearningProfile: boolean;   // Profil nauki
    accessSpacedRepetition: boolean;  // Spaced Repetition (podstawowy/zaawansowany)
    accessCaseStudies: boolean;       // Kazusy
    accessAITutor: boolean;           // AI Tutor chat
    accessCustomExams: boolean;       // Własne egzaminy
    accessStudyPlan: boolean;         // Personalizowany plan nauki
    accessOfflineMode: boolean;       // Tryb offline
    accessPrioritySupport: boolean;   // Priorytetowe wsparcie

    // Inne
    adsEnabled: boolean;              // Czy pokazywać reklamy
    downloadQuestions: boolean;       // Pobieranie pytań do PDF
    exportStats: boolean;             // Eksport statystyk
}

export interface Plan {
    id: PlanType;
    name: string;
    description: string;
    priceMonthly: number;            // w groszach (3900 = 39 zł)
    priceYearly: number;             // w groszach
    stripePriceIdMonthly: string;
    stripePriceIdYearly: string;
    features: PlanFeatures;
    featuresDisplay: string[];       // Lista do wyświetlenia w UI
    highlighted?: boolean;           // Czy wyróżniony (najpopularniejszy)
    badge?: string;                  // Badge np. "Najpopularniejszy"
}

// ═══════════════════════════════════════════════════════════════
// DEFINICJA PLANÓW
// ═══════════════════════════════════════════════════════════════

export const PLANS: Record<PlanType, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Zacznij za darmo',
        priceMonthly: 0,
        priceYearly: 0,
        stripePriceIdMonthly: '',
        stripePriceIdYearly: '',
        features: {
            // Limity
            questionsPerDay: 50,
            aiExplanationsPerDay: 5,
            aiTutorMessagesPerDay: 0,

            // Dostęp
            accessAllCategories: false,      // Tylko 3 darmowe kategorie
            accessExamMode: false,
            accessAdvancedStats: false,
            accessLearningProfile: false,
            accessSpacedRepetition: true,    // Podstawowy SR
            accessCaseStudies: false,
            accessAITutor: false,
            accessCustomExams: false,
            accessStudyPlan: false,
            accessOfflineMode: false,
            accessPrioritySupport: false,

            // Inne
            adsEnabled: true,
            downloadQuestions: false,
            exportStats: false,
        },
        featuresDisplay: [
            '50 pytań dziennie',
            '3 działy prawa (KC, KK, Konstytucja)',
            'Podstawowe statystyki',
            'Spaced Repetition (basic)',
            '5 AI wyjaśnień dziennie',
        ],
    },

    premium: {
        id: 'premium',
        name: 'Premium',
        description: 'Dla poważnie przygotowujących się',
        priceMonthly: 3900,           // 39 zł
        priceYearly: 31200,           // 312 zł (26 zł/mies)
        stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
        stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
        highlighted: true,
        badge: 'Najpopularniejszy',
        features: {
            // Limity
            questionsPerDay: Infinity,
            aiExplanationsPerDay: 50,
            aiTutorMessagesPerDay: 0,

            // Dostęp
            accessAllCategories: true,
            accessExamMode: true,
            accessAdvancedStats: true,
            accessLearningProfile: true,
            accessSpacedRepetition: true,    // Zaawansowany SR
            accessCaseStudies: true,
            accessAITutor: false,            // Tylko w Pro
            accessCustomExams: false,
            accessStudyPlan: false,
            accessOfflineMode: true,
            accessPrioritySupport: false,

            // Inne
            adsEnabled: false,
            downloadQuestions: true,
            exportStats: true,
        },
        featuresDisplay: [
            'Nieograniczone pytania',
            'Wszystkie działy prawa',
            'Tryb egzaminacyjny',
            'Pełne statystyki i analityka',
            'Profil nauki + analiza błędów',
            'Zaawansowany Spaced Repetition',
            'Kazusy prawnicze',
            '50 AI wyjaśnień dziennie',
            'Tryb offline',
            'Brak reklam',
        ],
    },

    pro: {
        id: 'pro',
        name: 'Pro',
        description: 'Maksymalne wsparcie AI w nauce',
        priceMonthly: 7900,           // 79 zł
        priceYearly: 63200,           // 632 zł (52.67 zł/mies)
        stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
        badge: 'Pełny pakiet',
        features: {
            // Limity
            questionsPerDay: Infinity,
            aiExplanationsPerDay: Infinity,
            aiTutorMessagesPerDay: Infinity,

            // Dostęp
            accessAllCategories: true,
            accessExamMode: true,
            accessAdvancedStats: true,
            accessLearningProfile: true,
            accessSpacedRepetition: true,
            accessCaseStudies: true,
            accessAITutor: true,             // ✅ AI Tutor
            accessCustomExams: true,         // ✅ Własne egzaminy
            accessStudyPlan: true,           // ✅ Plan nauki
            accessOfflineMode: true,
            accessPrioritySupport: true,     // ✅ Priorytet

            // Inne
            adsEnabled: false,
            downloadQuestions: true,
            exportStats: true,
        },
        featuresDisplay: [
            'Wszystko z Premium +',
            'AI Tutor (chat bez limitów)',
            'Nieograniczone AI wyjaśnienia',
            'Generowanie własnych egzaminów',
            'Personalizowany plan nauki',
            'Symulacje egzaminów z analizą',
            'Priorytetowe wsparcie',
        ],
    },
};

// ═══════════════════════════════════════════════════════════════
// POMOCNICZE FUNKCJE
// ═══════════════════════════════════════════════════════════════

// Pobierz plan po typie
export function getPlan(planType: PlanType): Plan {
    return PLANS[planType];
}

// Pobierz features dla planu
export function getPlanFeatures(planType: PlanType): PlanFeatures {
    return PLANS[planType].features;
}

// Sprawdź czy plan ma dostęp do funkcji
export function hasFeature(
    planType: PlanType,
    feature: keyof PlanFeatures
): boolean {
    const features = getPlanFeatures(planType);
    const value = features[feature];

    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
}

// Pobierz limit dla funkcji
export function getFeatureLimit(
    planType: PlanType,
    feature: keyof PlanFeatures
): number {
    const features = getPlanFeatures(planType);
    const value = features[feature];

    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? Infinity : 0;
    return 0;
}

// Formatuj cenę
export function formatPrice(priceInGrosze: number): string {
    if (priceInGrosze === 0) return 'Za darmo';
    return `${(priceInGrosze / 100).toFixed(0)} zł`;
}

// Oblicz oszczędność roczną
export function calculateYearlySavings(plan: Plan): number {
    if (plan.priceMonthly === 0) return 0;
    const monthlyTotal = plan.priceMonthly * 12;
    return monthlyTotal - plan.priceYearly;
}

// Lista planów do wyświetlenia
export function getPlansForDisplay(): Plan[] {
    return [PLANS.free, PLANS.premium, PLANS.pro];
}

// Darmowe kategorie (dla free users)
export const FREE_CATEGORY_SLUGS = [
    'kc-czesc-ogolna',      // KC część ogólna
    'kk-czesc-ogolna',      // KK część ogólna  
    'konstytucja',          // Konstytucja
];

// Oblicz procentową oszczędność
export function calculateSavingsPercent(plan: Plan): number {
    if (plan.priceMonthly === 0) return 0;
    const monthlyTotal = plan.priceMonthly * 12;
    const savings = monthlyTotal - plan.priceYearly;
    return Math.round((savings / monthlyTotal) * 100);
}
