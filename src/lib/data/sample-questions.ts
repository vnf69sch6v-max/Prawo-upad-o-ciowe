// Sample Exam Questions for LexCapital Pro

export interface ExamQuestion {
    id: string;
    text: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    domain: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    explanation: string;
    legalReference: string;
}

export const SAMPLE_EXAM_QUESTIONS: ExamQuestion[] = [
    // ===== PRAWO CYWILNE =====
    {
        id: 'q1',
        text: 'Zdolność prawna to:',
        options: [
            { id: 'a', text: 'Zdolność do nabywania praw i zaciągania zobowiązań we własnym imieniu' },
            { id: 'b', text: 'Zdolność do bycia podmiotem praw i obowiązków' },
            { id: 'c', text: 'Zdolność do samodzielnego dokonywania czynności prawnych' },
            { id: 'd', text: 'Zdolność do ponoszenia odpowiedzialności karnej' },
        ],
        correctOptionId: 'b',
        domain: 'prawo_cywilne',
        difficulty: 'easy',
        explanation: 'Zdolność prawna to zdolność do bycia podmiotem praw i obowiązków. Zdolność do czynności prawnych to zdolność do nabywania praw własnym działaniem.',
        legalReference: 'Art. 8 k.c.',
    },
    {
        id: 'q2',
        text: 'Pełną zdolność do czynności prawnych nabywa się:',
        options: [
            { id: 'a', text: 'Z chwilą ukończenia 16 lat' },
            { id: 'b', text: 'Z chwilą uzyskania pełnoletności' },
            { id: 'c', text: 'Z chwilą urodzenia' },
            { id: 'd', text: 'Z chwilą ukończenia 21 lat' },
        ],
        correctOptionId: 'b',
        domain: 'prawo_cywilne',
        difficulty: 'easy',
        explanation: 'Pełną zdolność do czynności prawnych nabywa osoba pełnoletnia (18 lat) oraz małoletni przez zawarcie małżeństwa.',
        legalReference: 'Art. 11 k.c.',
    },
    {
        id: 'q3',
        text: 'Termin przedawnienia roszczenia o naprawienie szkody wyrządzonej czynem niedozwolonym wynosi:',
        options: [
            { id: 'a', text: '3 lata od dnia, w którym poszkodowany dowiedział się o szkodzie i osobie obowiązanej do jej naprawienia' },
            { id: 'b', text: '6 lat od dnia powstania szkody' },
            { id: 'c', text: '10 lat od dnia zdarzenia wywołującego szkodę' },
            { id: 'd', text: '1 rok od dnia powstania szkody' },
        ],
        correctOptionId: 'a',
        domain: 'prawo_cywilne',
        difficulty: 'hard',
        explanation: 'Termin przedawnienia roszczenia deliktowego to 3 lata a tempore scientiae, jednak nie później niż 10 lat od zdarzenia.',
        legalReference: 'Art. 442¹ § 1 k.c.',
    },
    {
        id: 'q4',
        text: 'Oświadczenie woli złożone pod wpływem błędu co do treści czynności prawnej:',
        options: [
            { id: 'a', text: 'Jest nieważne z mocy prawa' },
            { id: 'b', text: 'Może być uchylone, jeżeli błąd był istotny' },
            { id: 'c', text: 'Jest zawsze ważne' },
            { id: 'd', text: 'Wymaga potwierdzenia przez sąd' },
        ],
        correctOptionId: 'b',
        domain: 'prawo_cywilne',
        difficulty: 'medium',
        explanation: 'Błąd musi dotyczyć treści czynności prawnej i być istotny. Uchylenie następuje przez oświadczenie wobec drugiej strony.',
        legalReference: 'Art. 84 k.c.',
    },

    // ===== PRAWO KARNE =====
    {
        id: 'q5',
        text: 'Obrona konieczna może być podjęta:',
        options: [
            { id: 'a', text: 'Tylko w obronie życia i zdrowia' },
            { id: 'b', text: 'W obronie jakiegokolwiek dobra chronionego prawem' },
            { id: 'c', text: 'Tylko w obronie własnych dóbr' },
            { id: 'd', text: 'Tylko po uprzednim wezwaniu pomocy' },
        ],
        correctOptionId: 'b',
        domain: 'prawo_karne',
        difficulty: 'medium',
        explanation: 'Obrona konieczna może być podjęta w obronie jakiegokolwiek dobra chronionego prawem, zarówno własnego jak i cudzego.',
        legalReference: 'Art. 25 k.k.',
    },
    {
        id: 'q6',
        text: 'Który z poniższych nie jest kontratypem:',
        options: [
            { id: 'a', text: 'Obrona konieczna' },
            { id: 'b', text: 'Stan wyższej konieczności' },
            { id: 'c', text: 'Zgoda pokrzywdzonego' },
            { id: 'd', text: 'Niepoczytalność' },
        ],
        correctOptionId: 'd',
        domain: 'prawo_karne',
        difficulty: 'hard',
        explanation: 'Niepoczytalność wyłącza winę (jest okolicznością wyłączającą winę), nie bezprawność. Kontratypy wyłączają bezprawność czynu.',
        legalReference: 'Art. 31 k.k.',
    },

    // ===== PRAWO HANDLOWE =====
    {
        id: 'q7',
        text: 'Minimalny kapitał zakładowy spółki z ograniczoną odpowiedzialnością wynosi:',
        options: [
            { id: 'a', text: '1.000 zł' },
            { id: 'b', text: '5.000 zł' },
            { id: 'c', text: '50.000 zł' },
            { id: 'd', text: '100.000 zł' },
        ],
        correctOptionId: 'b',
        domain: 'prawo_handlowe',
        difficulty: 'easy',
        explanation: 'Kapitał zakładowy sp. z o.o. musi wynosić co najmniej 5.000 zł, a wartość nominalna udziału co najmniej 50 zł.',
        legalReference: 'Art. 154 § 1-2 k.s.h.',
    },
    {
        id: 'q8',
        text: 'Spółka jawna:',
        options: [
            { id: 'a', text: 'Posiada osobowość prawną' },
            { id: 'b', text: 'Jest spółką kapitałową' },
            { id: 'c', text: 'Jest ułomną osobą prawną' },
            { id: 'd', text: 'Nie może nabywać praw' },
        ],
        correctOptionId: 'c',
        domain: 'prawo_handlowe',
        difficulty: 'medium',
        explanation: 'Spółka jawna jest spółką osobową, ma zdolność prawną (ułomna osoba prawna), ale nie ma osobowości prawnej.',
        legalReference: 'Art. 8 § 1 k.s.h.',
    },

    // ===== PROCEDURA CYWILNA =====
    {
        id: 'q9',
        text: 'Termin na wniesienie apelacji od wyroku sądu I instancji wynosi:',
        options: [
            { id: 'a', text: '7 dni od ogłoszenia wyroku' },
            { id: 'b', text: '14 dni od doręczenia wyroku z uzasadnieniem' },
            { id: 'c', text: '21 dni od ogłoszenia wyroku' },
            { id: 'd', text: '30 dni od doręczenia wyroku' },
        ],
        correctOptionId: 'b',
        domain: 'procedura_cywilna',
        difficulty: 'medium',
        explanation: 'Apelację wnosi się w terminie dwutygodniowym od doręczenia wyroku z uzasadnieniem.',
        legalReference: 'Art. 369 § 1 k.p.c.',
    },
    {
        id: 'q10',
        text: 'Właściwość miejscowa ogólna sądu w sprawach przeciwko osobie fizycznej określana jest według:',
        options: [
            { id: 'a', text: 'Miejsca zamieszkania powoda' },
            { id: 'b', text: 'Miejsca zamieszkania pozwanego' },
            { id: 'c', text: 'Miejsca położenia nieruchomości' },
            { id: 'd', text: 'Siedziby sądu apelacyjnego' },
        ],
        correctOptionId: 'b',
        domain: 'procedura_cywilna',
        difficulty: 'easy',
        explanation: 'Powództwo wytacza się przed sąd I instancji, w którego okręgu pozwany ma miejsce zamieszkania (actor sequitur forum rei).',
        legalReference: 'Art. 27 § 1 k.p.c.',
    },
];

export function getQuestionsByDomain(domain: string): ExamQuestion[] {
    return SAMPLE_EXAM_QUESTIONS.filter(q => q.domain === domain);
}

export function getQuestionsByDifficulty(difficulty: string): ExamQuestion[] {
    return SAMPLE_EXAM_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function shuffleQuestions(questions: ExamQuestion[]): ExamQuestion[] {
    return [...questions].sort(() => Math.random() - 0.5);
}
