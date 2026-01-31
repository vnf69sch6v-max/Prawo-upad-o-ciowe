'use client';

import { useState, useMemo } from 'react';
import { MobileNav } from '@/components/layout';
import { LiquidGlassSidebar } from '@/components/liquid-glass';
import { Scale, Loader2, ChevronRight, ChevronDown, BookOpen, Clock, Lightbulb, CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

// Case study structure
interface CaseStudy {
    id: string;
    title: string;
    domain: 'ksh' | 'prawo_upadlosciowe';
    companyType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
    facts: string;
    questions: string[];
    hints: string[];
    solution: {
        questionIndex: number;
        answer: string;
        legalBasis: string[];
    }[];
    relatedArticles: string[];
}

// Sample case studies
const CASE_STUDIES: CaseStudy[] = [
    {
        id: '1',
        title: 'Wystąpienie wspólnika ze spółki jawnej',
        domain: 'ksh',
        companyType: 'Spółka jawna',
        difficulty: 'medium',
        estimatedTime: 10,
        facts: `Jan Kowalski, Piotr Nowak i Anna Wiśniewska prowadzą spółkę jawną "KNW Doradztwo" od 2020 roku. Umowa spółki została zawarta na czas nieokreślony i nie zawiera szczególnych postanowień dotyczących wystąpienia wspólnika.

Anna otrzymała atrakcyjną ofertę pracy za granicą i chce wystąpić ze spółki. Jan i Piotr nie chcą likwidować spółki ani odkupić udziału Anny - wolą kontynuować działalność w dwójkę.`,
        questions: [
            'Czy Anna może jednostronnie wystąpić ze spółki jawnej?',
            'Jakie są konsekwencje finansowe dla Anny po wystąpieniu?',
            'Co stanie się ze spółką po wystąpieniu Anny?'
        ],
        hints: [
            'Sprawdź przepisy dotyczące wypowiedzenia umowy spółki jawnej (Art. 61 KSH)',
            'Rozliczenie z występującym wspólnikiem reguluje Art. 65 KSH',
            'Skutki wystąpienia wspólnika dla bytu spółki określa Art. 64 KSH'
        ],
        solution: [
            {
                questionIndex: 0,
                answer: `TAK - Anna może jednostronnie wypowiedzieć umowę spółki.

Zgodnie z Art. 61 § 1 KSH: "Jeżeli spółkę zawarto na czas nieoznaczony, wspólnik może wypowiedzieć umowę spółki na sześć miesięcy przed końcem roku obrotowego."

Warunki wypowiedzenia:
• Forma pisemna wypowiedzenia
• Zachowanie 6-miesięcznego terminu wypowiedzenia
• Wypowiedzenie skuteczne na koniec roku obrotowego
• NIE wymaga zgody pozostałych wspólników`,
                legalBasis: ['Art. 61 § 1 KSH', 'Art. 61 § 3 KSH']
            },
            {
                questionIndex: 1,
                answer: `Anna ma prawo do rozliczenia swojego udziału kapitałowego.

Zgodnie z Art. 65 KSH, Anna otrzyma:
• Wartość udziału kapitałowego obliczoną na podstawie bilansu
• Udział w zyskach za okres do dnia wystąpienia
• Zwrot rzeczy wniesionych tylko do używania

Wycena następuje na podstawie bilansu sporządzonego na dzień wystąpienia (Art. 65 § 2 KSH). Jeśli udział kapitałowy ma wartość ujemną, Anna musi wyrównać brakującą wartość.`,
                legalBasis: ['Art. 65 § 1 KSH', 'Art. 65 § 2 KSH', 'Art. 65 § 3 KSH']
            },
            {
                questionIndex: 2,
                answer: `Spółka może kontynuować działalność.

Zgodnie z Art. 64 KSH, wystąpienie wspólnika NIE powoduje automatycznego rozwiązania spółki. Jan i Piotr mogą kontynuować prowadzenie spółki jawnej, ponieważ:
• Pozostaje co najmniej dwóch wspólników
• Nie ma przeszkód prawnych do dalszego funkcjonowania
• Umowa spółki może przewidywać kontynuację

Konieczne będzie jedynie dostosowanie umowy spółki do nowego składu osobowego.`,
                legalBasis: ['Art. 64 KSH', 'Art. 58 pkt 4 KSH']
            }
        ],
        relatedArticles: ['Art. 61', 'Art. 64', 'Art. 65', 'Art. 58']
    },
    {
        id: '2',
        title: 'Odpowiedzialność członka zarządu sp. z o.o.',
        domain: 'ksh',
        companyType: 'Spółka z o.o.',
        difficulty: 'hard',
        estimatedTime: 15,
        facts: `XYZ Sp. z o.o. od 2023 roku nie reguluje swoich zobowiązań. Wierzyciel ABC S.A. uzyskał tytuł wykonawczy i wszczął egzekucję, która okazała się bezskuteczna - spółka nie posiada majątku.

Marek Nowicki jest jedynym członkiem zarządu spółki od jej założenia w 2020 roku. Spółka stała się niewypłacalna w marcu 2023 roku. Marek nie złożył wniosku o upadłość, licząc na poprawę sytuacji finansowej.`,
        questions: [
            'Czy wierzyciel ABC S.A. może pozwać Marka Nowickiego osobiście?',
            'Jakie przesłanki musi wykazać wierzyciel?',
            'Jak Marek może się bronić przed odpowiedzialnością?'
        ],
        hints: [
            'Kluczowy jest Art. 299 KSH dotyczący odpowiedzialności członków zarządu',
            'Wierzyciel musi udowodnić bezskuteczność egzekucji',
            'Przesłanki egzoneracyjne znajdują się w Art. 299 § 2 KSH'
        ],
        solution: [
            {
                questionIndex: 0,
                answer: `TAK - wierzyciel może pozwać Marka Nowickiego osobiście na podstawie Art. 299 § 1 KSH.

"Jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania."

Jest to odpowiedzialność:
• Subsydiarna (po bezskutecznej egzekucji)
• Osobista (całym majątkiem)
• Solidarna (z innymi członkami zarządu)
• Deliktowa (za czyn niedozwolony)`,
                legalBasis: ['Art. 299 § 1 KSH']
            },
            {
                questionIndex: 1,
                answer: `Wierzyciel musi wykazać:

1. Posiadanie wierzytelności wobec spółki
   - Tytuł wykonawczy (wyrok, nakaz zapłaty)
   
2. Bezskuteczność egzekucji
   - Postanowienie komornika o umorzeniu egzekucji
   - Wykazanie braku majątku spółki
   
3. Status pozwanego jako członka zarządu
   - W czasie istnienia zobowiązania lub w okresie właściwym do złożenia wniosku o upadłość

Ciężar dowodu tych przesłanek spoczywa na wierzycielu (powodzie).`,
                legalBasis: ['Art. 299 § 1 KSH', 'Wyrok SN III CZP 72/08']
            },
            {
                questionIndex: 2,
                answer: `Marek może powołać się na przesłanki egzoneracyjne z Art. 299 § 2 KSH:

1. Zgłoszenie wniosku o upadłość we właściwym czasie
   ❌ NIE DOTYCZY - Marek nie złożył wniosku
   
2. Brak winy w niezgłoszeniu
   ❌ TRUDNE DO WYKAZANIA - jako jedyny członek zarządu odpowiada za monitorowanie sytuacji
   
3. Wierzyciel nie poniósł szkody
   ⚠️ MOŻLIWE - jeśli wykaże, że nawet przy terminowym wniosku o upadłość wierzyciel i tak nie uzyskałby zaspokojenia

W tej sytuacji szanse Marka na uniknięcie odpowiedzialności są NISKIE.`,
                legalBasis: ['Art. 299 § 2 KSH', 'Art. 21 Prawa Upadłościowego']
            }
        ],
        relatedArticles: ['Art. 299', 'Art. 21 PU', 'Art. 10 PU', 'Art. 11 PU']
    },
    {
        id: '3',
        title: 'Przesłanki ogłoszenia upadłości',
        domain: 'prawo_upadlosciowe',
        companyType: 'Upadłość',
        difficulty: 'easy',
        estimatedTime: 8,
        facts: `Spółka ALPHA Sp. z o.o. prowadzi działalność produkcyjną. Od stycznia 2026 roku spółka ma problemy z płynnością finansową. Na dzień 1 marca 2026 roku spółka zalega z płatnościami:
        
• Wobec ZUS - od 4 miesięcy
• Wobec dostawców - od 3 miesięcy  
• Wobec pracowników - od 2 miesięcy

Zarząd zastanawia się, czy spółka jest niewypłacalna i czy musi złożyć wniosek o upadłość.`,
        questions: [
            'Czy spółka ALPHA jest niewypłacalna?',
            'W jakim terminie zarząd musi złożyć wniosek o upadłość?'
        ],
        hints: [
            'Definicja niewypłacalności znajduje się w Art. 11 Prawa Upadłościowego',
            'Termin na złożenie wniosku określa Art. 21 Prawa Upadłościowego'
        ],
        solution: [
            {
                questionIndex: 0,
                answer: `TAK - spółka ALPHA jest niewypłacalna.

Zgodnie z Art. 11 ust. 1 Prawa Upadłościowego:
"Dłużnik jest niewypłacalny, jeżeli utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych."

Art. 11 ust. 1a wprowadza domniemanie:
"Domniemywa się, że dłużnik utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych, jeżeli opóźnienie w wykonaniu zobowiązań pieniężnych przekracza TRZY MIESIĄCE."

Spółka ALPHA:
• Zalega wobec ZUS od 4 miesięcy ✓
• Zalega wobec dostawców od 3 miesięcy ✓

Przesłanka 3-miesięcznego opóźnienia jest spełniona.`,
                legalBasis: ['Art. 11 ust. 1 PU', 'Art. 11 ust. 1a PU']
            },
            {
                questionIndex: 1,
                answer: `Zarząd musi złożyć wniosek w terminie 30 DNI.

Art. 21 ust. 1 Prawa Upadłościowego:
"Dłużnik jest obowiązany, nie później niż w terminie TRZYDZIESTU DNI od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości, zgłosić w sądzie wniosek o ogłoszenie upadłości."

Podstawa do ogłoszenia upadłości (niewypłacalność) wystąpiła najpóźniej 1 marca 2026 r. (gdy upłynęły 3 miesiące zalegania wobec ZUS).

Termin na złożenie wniosku upływa: 31 MARCA 2026 r.

⚠️ UWAGA: Niezłożenie wniosku w terminie może skutkować osobistą odpowiedzialnością członków zarządu (Art. 299 KSH, Art. 21 ust. 3 PU).`,
                legalBasis: ['Art. 21 ust. 1 PU', 'Art. 21 ust. 3 PU', 'Art. 299 KSH']
            }
        ],
        relatedArticles: ['Art. 10 PU', 'Art. 11 PU', 'Art. 21 PU']
    },
];

export default function CasesPage() {
    const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
    const [showHints, setShowHints] = useState<boolean[]>([]);
    const [showSolutions, setShowSolutions] = useState<boolean[]>([]);
    const [domainFilter, setDomainFilter] = useState<'all' | 'ksh' | 'prawo_upadlosciowe'>('all');

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    const filteredCases = useMemo(() => {
        if (domainFilter === 'all') return CASE_STUDIES;
        return CASE_STUDIES.filter(c => c.domain === domainFilter);
    }, [domainFilter]);

    const handleSelectCase = (caseStudy: CaseStudy) => {
        setSelectedCase(caseStudy);
        setShowHints(new Array(caseStudy.questions.length).fill(false));
        setShowSolutions(new Array(caseStudy.questions.length).fill(false));
    };

    const toggleHint = (index: number) => {
        setShowHints(prev => {
            const newState = [...prev];
            newState[index] = !newState[index];
            return newState;
        });
    };

    const toggleSolution = (index: number) => {
        setShowSolutions(prev => {
            const newState = [...prev];
            newState[index] = !newState[index];
            return newState;
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5E6F0 0%, #E8E0F0 25%, #E0EEF5 50%, #F0E8E5 75%, #F5E6F0 100%)' }}>
            <LiquidGlassSidebar
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <main className="overflow-auto p-6 pb-20 lg:pb-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {!selectedCase ? (
                        /* Cases List */
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#f59e0b' }}>
                                    <Scale size={32} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Kazusy prawne</h1>
                                <p className="text-[var(--text-muted)]">
                                    Praktyczne stany faktyczne z rozwiązaniami
                                </p>
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                {(['all', 'ksh', 'prawo_upadlosciowe'] as const).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDomainFilter(d)}
                                        className={cn(
                                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                            domainFilter === d
                                                ? 'bg-[#f59e0b] text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#f59e0b]'
                                        )}
                                    >
                                        {d === 'all' ? 'Wszystkie' : d === 'ksh' ? 'KSH' : 'Prawo Upadłościowe'}
                                    </button>
                                ))}
                            </div>

                            {/* Cases Grid */}
                            <div className="space-y-4">
                                {filteredCases.map(caseStudy => (
                                    <button
                                        key={caseStudy.id}
                                        onClick={() => handleSelectCase(caseStudy)}
                                        className="w-full lex-card text-left hover:border-[#f59e0b]/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl",
                                                caseStudy.domain === 'ksh' ? "bg-[#1a365d]/10" : "bg-orange-500/10"
                                            )}>
                                                ⚖️
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                                        caseStudy.difficulty === 'easy' && "bg-green-500/20 text-green-500",
                                                        caseStudy.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                                        caseStudy.difficulty === 'hard' && "bg-red-500/20 text-red-500"
                                                    )}>
                                                        {caseStudy.difficulty === 'easy' ? 'Łatwy' :
                                                            caseStudy.difficulty === 'medium' ? 'Średni' : 'Trudny'}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-muted)]">{caseStudy.companyType}</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1">{caseStudy.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        ~{caseStudy.estimatedTime} min
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText size={14} />
                                                        {caseStudy.questions.length} pytań
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={24} className="text-[var(--text-muted)] group-hover:text-[#f59e0b] shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Case Detail */
                        <>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="text-sm text-[var(--text-muted)] hover:text-[#f59e0b]"
                            >
                                ← Powrót do listy kazusów
                            </button>

                            {/* Case Header */}
                            <div className="lex-card">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium",
                                        selectedCase.domain === 'ksh'
                                            ? "bg-[#1a365d]/10 text-[#1a365d]"
                                            : "bg-orange-500/10 text-orange-500"
                                    )}>
                                        {selectedCase.domain === 'ksh' ? 'KSH' : 'Prawo Upadłościowe'}
                                    </span>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium",
                                        selectedCase.difficulty === 'easy' && "bg-green-500/20 text-green-500",
                                        selectedCase.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                        selectedCase.difficulty === 'hard' && "bg-red-500/20 text-red-500"
                                    )}>
                                        {selectedCase.difficulty === 'easy' ? '🟢 Łatwy' :
                                            selectedCase.difficulty === 'medium' ? '🟡 Średni' : '🔴 Trudny'}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] ml-auto flex items-center gap-1">
                                        <Clock size={14} />
                                        ~{selectedCase.estimatedTime} min
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold mb-4">{selectedCase.title}</h1>

                                <div className="p-4 bg-[var(--bg-hover)] rounded-xl">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <BookOpen size={16} />
                                        Stan faktyczny
                                    </h3>
                                    <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                                        {selectedCase.facts}
                                    </p>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                {selectedCase.questions.map((question, idx) => (
                                    <div key={idx} className="lex-card">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] font-bold text-sm">
                                                {idx + 1}
                                            </span>
                                            {question}
                                        </h3>

                                        {/* Hint */}
                                        <button
                                            onClick={() => toggleHint(idx)}
                                            className="w-full mb-3 p-3 bg-[var(--bg-hover)] rounded-xl text-left flex items-center justify-between hover:bg-[#f59e0b]/10 transition-all"
                                        >
                                            <span className="flex items-center gap-2 text-sm">
                                                <Lightbulb size={16} className="text-[#f59e0b]" />
                                                Wskazówka
                                            </span>
                                            <ChevronDown size={16} className={cn(
                                                "transition-transform",
                                                showHints[idx] && "rotate-180"
                                            )} />
                                        </button>
                                        {showHints[idx] && (
                                            <div className="mb-4 p-3 bg-[#f59e0b]/10 rounded-xl text-sm border border-[#f59e0b]/20">
                                                {selectedCase.hints[idx]}
                                            </div>
                                        )}

                                        {/* Solution */}
                                        <button
                                            onClick={() => toggleSolution(idx)}
                                            className="w-full p-3 bg-green-500/10 rounded-xl text-left flex items-center justify-between hover:bg-green-500/20 transition-all"
                                        >
                                            <span className="flex items-center gap-2 text-sm font-medium text-green-500">
                                                <CheckCircle size={16} />
                                                Pokaż rozwiązanie
                                            </span>
                                            <ChevronDown size={16} className={cn(
                                                "text-green-500 transition-transform",
                                                showSolutions[idx] && "rotate-180"
                                            )} />
                                        </button>
                                        {showSolutions[idx] && (
                                            <div className="mt-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                                <div className="whitespace-pre-wrap text-sm mb-4">
                                                    {selectedCase.solution[idx].answer}
                                                </div>
                                                <div className="pt-3 border-t border-green-500/20">
                                                    <p className="text-xs text-[var(--text-muted)] mb-2">Podstawa prawna:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedCase.solution[idx].legalBasis.map(basis => (
                                                            <span key={basis} className="px-2 py-1 bg-[var(--bg-card)] rounded text-xs font-medium">
                                                                {basis}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Related Articles */}
                            <div className="lex-card">
                                <h3 className="font-semibold mb-3">Powiązane artykuły</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCase.relatedArticles.map(article => (
                                        <Link
                                            key={article}
                                            href={`/search?q=${encodeURIComponent(article)}`}
                                            className="px-3 py-2 bg-[var(--bg-hover)] rounded-lg text-sm hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] transition-all"
                                        >
                                            {article}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <MobileNav currentView="cases" onNavigate={() => { }} />
        </div>
    );
}
