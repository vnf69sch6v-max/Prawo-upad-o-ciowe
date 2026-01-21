// Legal areas
export const LEGAL_AREAS = {
    civil: { name: 'Prawo cywilne', color: 'blue', icon: '📜' },
    criminal: { name: 'Prawo karne', color: 'red', icon: '⚖️' },
    administrative: { name: 'Prawo administracyjne', color: 'orange', icon: '🏛️' },
    constitutional: { name: 'Prawo konstytucyjne', color: 'purple', icon: '📋' },
    commercial: { name: 'Prawo handlowe', color: 'green', icon: '💼' },
    labor: { name: 'Prawo pracy', color: 'yellow', icon: '👷' },
    tax: { name: 'Prawo podatkowe', color: 'emerald', icon: '💰' },
    procedure_civil: { name: 'Postępowanie cywilne', color: 'cyan', icon: '📄' },
    procedure_criminal: { name: 'Postępowanie karne', color: 'rose', icon: '🔍' },
    procedure_admin: { name: 'Postępowanie administracyjne', color: 'amber', icon: '📝' },
} as const;

export type LegalAreaKey = keyof typeof LEGAL_AREAS;

// Question types
export const QUESTION_TYPES = {
    single_choice: 'Jednokrotny wybór',
    multiple_choice: 'Wielokrotny wybór',
    true_false: 'Prawda/Fałsz',
    fill_blank: 'Uzupełnij lukę',
    case_study: 'Kazus'
} as const;

// Exam types
export const EXAM_TYPES = {
    application_entry: 'Egzamin wstępny na aplikację',
    radca_exam: 'Egzamin radcowski',
    adwokat_exam: 'Egzamin adwokacki',
    notary_exam: 'Egzamin notarialny',
    university: 'Egzaminy uczelniane',
    other: 'Inne'
} as const;

// Subscription plans
export const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        questionsPerDay: 50,
        features: [
            '50 pytań dziennie',
            'Podstawowe statystyki',
            '1 dział prawa',
            'Spaced Repetition'
        ]
    },
    premium: {
        name: 'Premium',
        priceMonthly: 39,
        priceYearly: 390,
        features: [
            'Nieograniczone pytania',
            'Wszystkie działy prawa',
            'Pełne statystyki',
            'AI wyjaśnienia błędów',
            'Tryb egzaminacyjny',
            'Brak reklam'
        ]
    },
    pro: {
        name: 'Pro',
        priceMonthly: 79,
        priceYearly: 790,
        features: [
            'Wszystko z Premium',
            'AI Tutor (chat)',
            'Generowanie kazusów',
            'Symulacje egzaminów',
            'Personalizowany plan nauki',
            'Gwarancja zdania'
        ]
    }
} as const;

// Error types
export const ERROR_TYPES = {
    careless: { name: 'Nieuważność', color: 'yellow', tip: 'Czytaj pytania uważniej' },
    conceptual: { name: 'Błąd konceptualny', color: 'red', tip: 'Powtórz podstawy tematu' },
    knowledge_gap: { name: 'Luka w wiedzy', color: 'orange', tip: 'Ten temat wymaga nauki' },
    confusion: { name: 'Pomylenie pojęć', color: 'purple', tip: 'Porównaj oba pojęcia' },
    partial: { name: 'Częściowa wiedza', color: 'blue', tip: 'Uzupełnij szczegóły' },
    time_pressure: { name: 'Presja czasu', color: 'cyan', tip: 'Ćwicz na czas' }
} as const;

// Mastery levels
export const MASTERY_LEVELS = {
    0: { name: 'Nieznany', color: 'gray' },
    25: { name: 'Początkujący', color: 'red' },
    50: { name: 'Podstawowy', color: 'orange' },
    75: { name: 'Dobry', color: 'yellow' },
    90: { name: 'Bardzo dobry', color: 'lime' },
    100: { name: 'Mistrz', color: 'green' }
} as const;

export const getMasteryLevel = (mastery: number) => {
    if (mastery >= 90) return MASTERY_LEVELS[100];
    if (mastery >= 75) return MASTERY_LEVELS[90];
    if (mastery >= 50) return MASTERY_LEVELS[75];
    if (mastery >= 25) return MASTERY_LEVELS[50];
    if (mastery > 0) return MASTERY_LEVELS[25];
    return MASTERY_LEVELS[0];
};

// Achievement icons
export const ACHIEVEMENT_ICONS = {
    '🎯': 'Pierwszy krok',
    '📚': 'Student',
    '🎓': 'Ekspert',
    '🏆': 'Mistrz',
    '🔥': 'Seria',
    '⭐': 'Perfekcjonista',
    '📜': 'Specjalista'
} as const;

// Default session settings
export const DEFAULT_SESSION_SETTINGS = {
    questionsPerSession: 20,
    sessionDurationMinutes: 30,
    difficultyPreference: 5,
    showExplanationsImmediately: true
} as const;

// Spaced repetition constants
export const SR_CONSTANTS = {
    INITIAL_EASE_FACTOR: 2.5,
    MIN_EASE_FACTOR: 1.3,
    EASE_BONUS: 0.15,
    EASE_PENALTY: 0.2,
    MAX_INTERVAL_DAYS: 365,
    GRADUATING_INTERVAL: 1,
    EASY_INTERVAL: 4,
    LAPSES_INTERVAL: 1
} as const;
