'use client';

import { useState, useMemo } from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';
import { Search, BookOpen, Loader2, ChevronRight, Link as LinkIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { ALL_KSH_QUESTIONS } from '@/lib/data/ksh';
import { ALL_PRAWO_UPADLOSCIOWE_QUESTIONS } from '@/lib/data/prawo-upadlosciowe';
import { ALL_KC_QUESTIONS } from '@/lib/data/kodeks-cywilny';

// Article data structure
interface Article {
    id: string;
    number: string;
    title: string;
    content: string;
    domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso';
    relatedArticles: string[];
    questionCount: number;
}

// Extract articles from questions (simplified - in real app would have full statute text)
const ARTICLES: Article[] = [
    // KSH key articles
    { id: 'ksh-1', number: 'Art. 1', title: 'Zakres ustawy', content: 'Ustawa reguluje tworzenie, organizację, funkcjonowanie, rozwiązywanie, łączenie, podział i przekształcanie spółek handlowych.', domain: 'ksh', relatedArticles: ['Art. 2', 'Art. 3'], questionCount: 5 },
    { id: 'ksh-22', number: 'Art. 22', title: 'Spółka jawna - definicja', content: 'Spółką jawną jest spółka osobowa, która prowadzi przedsiębiorstwo pod własną firmą, a nie jest inną spółką handlową.', domain: 'ksh', relatedArticles: ['Art. 23', 'Art. 31'], questionCount: 12 },
    { id: 'ksh-102', number: 'Art. 102', title: 'Spółka komandytowa - definicja', content: 'Spółką komandytową jest spółka osobowa mająca na celu prowadzenie przedsiębiorstwa pod własną firmą, w której wobec wierzycieli za zobowiązania spółki co najmniej jeden wspólnik odpowiada bez ograniczenia (komplementariusz), a odpowiedzialność co najmniej jednego wspólnika (komandytariusza) jest ograniczona.', domain: 'ksh', relatedArticles: ['Art. 103', 'Art. 111'], questionCount: 18 },
    { id: 'ksh-151', number: 'Art. 151', title: 'Spółka z o.o. - definicja', content: 'Spółka z ograniczoną odpowiedzialnością może być utworzona przez jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej.', domain: 'ksh', relatedArticles: ['Art. 152', 'Art. 154'], questionCount: 25 },
    { id: 'ksh-154', number: 'Art. 154', title: 'Kapitał zakładowy sp. z o.o.', content: 'Kapitał zakładowy spółki powinien wynosić co najmniej 5 000 złotych. Wartość nominalna udziału nie może być niższa niż 50 złotych.', domain: 'ksh', relatedArticles: ['Art. 151', 'Art. 158'], questionCount: 15 },
    { id: 'ksh-201', number: 'Art. 201', title: 'Zarząd sp. z o.o.', content: 'Zarząd prowadzi sprawy spółki i reprezentuje spółkę. Zarząd składa się z jednego albo większej liczby członków.', domain: 'ksh', relatedArticles: ['Art. 202', 'Art. 204'], questionCount: 20 },
    { id: 'ksh-299', number: 'Art. 299', title: 'Odpowiedzialność zarządu', content: '§ 1. Jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania.\n\n§ 2. Członek zarządu może się uwolnić od odpowiedzialności, o której mowa w § 1, jeżeli wykaże, że we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub w tym samym czasie wydano postanowienie o otwarciu postępowania restrukturyzacyjnego albo o zatwierdzeniu układu w postępowaniu w przedmiocie zatwierdzenia układu, albo że niezgłoszenie wniosku o ogłoszenie upadłości nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku o ogłoszenie upadłości oraz niewydania postanowienia o otwarciu postępowania restrukturyzacyjnego albo niezatwierdzenia układu w postępowaniu w przedmiocie zatwierdzenia układu wierzyciel nie poniósł szkody.', domain: 'ksh', relatedArticles: ['Art. 298', 'Art. 300', 'Art. 21 PU'], questionCount: 35 },
    { id: 'ksh-301', number: 'Art. 301', title: 'Spółka akcyjna - definicja', content: 'Spółka akcyjna może być zawiązana przez jedną albo więcej osób. Spółka akcyjna nie może być zawiązana wyłącznie przez jednoosobową spółkę z ograniczoną odpowiedzialnością.', domain: 'ksh', relatedArticles: ['Art. 302', 'Art. 308'], questionCount: 15 },
    { id: 'ksh-308', number: 'Art. 308', title: 'Kapitał zakładowy S.A.', content: 'Kapitał zakładowy spółki powinien wynosić co najmniej 100 000 złotych.', domain: 'ksh', relatedArticles: ['Art. 301', 'Art. 309'], questionCount: 10 },
    // Prawo upadłościowe key articles
    { id: 'pu-10', number: 'Art. 10', title: 'Przesłanki upadłości', content: 'Upadłość ogłasza się w stosunku do dłużnika, który stał się niewypłacalny.', domain: 'prawo_upadlosciowe', relatedArticles: ['Art. 11', 'Art. 12'], questionCount: 20 },
    { id: 'pu-11', number: 'Art. 11', title: 'Niewypłacalność', content: 'Dłużnik jest niewypłacalny, jeżeli utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych. Domniemywa się, że dłużnik utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych, jeżeli opóźnienie w wykonaniu zobowiązań pieniężnych przekracza trzy miesiące.', domain: 'prawo_upadlosciowe', relatedArticles: ['Art. 10', 'Art. 12', 'Art. 21'], questionCount: 25 },
    { id: 'pu-21', number: 'Art. 21', title: 'Obowiązek złożenia wniosku', content: 'Dłużnik jest obowiązany, nie później niż w terminie trzydziestu dni od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości, zgłosić w sądzie wniosek o ogłoszenie upadłości.', domain: 'prawo_upadlosciowe', relatedArticles: ['Art. 10', 'Art. 11', 'Art. 299 KSH'], questionCount: 30 },
    { id: 'pu-127', number: 'Art. 127', title: 'Bezskuteczność czynności', content: 'Bezskuteczne w stosunku do masy upadłości są czynności prawne dokonane przez upadłego w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości, którymi rozporządził on swoim majątkiem, jeżeli dokonane zostały nieodpłatnie albo odpłatnie, ale wartość świadczenia upadłego przewyższa w rażącym stopniu wartość świadczenia otrzymanego przez upadłego lub zastrzeżonego dla upadłego lub dla osoby trzeciej.', domain: 'prawo_upadlosciowe', relatedArticles: ['Art. 128', 'Art. 130'], questionCount: 15 },
    // Kodeks Cywilny key articles
    { id: 'kc-1', number: 'Art. 1', title: 'Moc wsteczna', content: 'Ustawa nie ma mocy wstecznej, chyba że to wynika z jej brzmienia lub celu.', domain: 'prawo_cywilne', relatedArticles: ['Art. 2', 'Art. 3'], questionCount: 5 },
    { id: 'kc-5', number: 'Art. 5', title: 'Nadużycie prawa', content: 'Nie można czynić ze swego prawa użytku, który by był sprzeczny ze społeczno-gospodarczym przeznaczeniem tego prawa lub z zasadami współżycia społecznego.', domain: 'prawo_cywilne', relatedArticles: ['Art. 6', 'Art. 7'], questionCount: 15 },
    { id: 'kc-23', number: 'Art. 23', title: 'Dobra osobiste', content: 'Dobra osobiste człowieka, jak w szczególności zdrowie, wolność, cześć, swoboda sumienia, nazwisko lub pseudonim, wizerunek, tajemnica korespondencji, pozostają pod ochroną prawa cywilnego.', domain: 'prawo_cywilne', relatedArticles: ['Art. 24'], questionCount: 20 },
    { id: 'kc-415', number: 'Art. 415', title: 'Odpowiedzialność deliktowa', content: 'Kto z winy swej wyrządził drugiemu szkodę, obowiązany jest do jej naprawienia.', domain: 'prawo_cywilne', relatedArticles: ['Art. 416', 'Art. 417'], questionCount: 30 },
    { id: 'kc-471', number: 'Art. 471', title: 'Odpowiedzialność kontraktowa', content: 'Dłużnik obowiązany jest do naprawienia szkody wynikłej z niewykonania lub nienależytego wykonania zobowiązania, chyba że niewykonanie lub nienależyte wykonanie jest następstwem okoliczności, za które dłużnik odpowiedzialności nie ponosi.', domain: 'prawo_cywilne', relatedArticles: ['Art. 472', 'Art. 473'], questionCount: 25 },
];

export default function SearchPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [domainFilter, setDomainFilter] = useState<'all' | 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso'>('all');

    const { profile, loading: authLoading } = useAuth();
    const stats = profile?.stats;

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) {
            // Show popular articles when no search
            return ARTICLES.sort((a, b) => b.questionCount - a.questionCount).slice(0, 8);
        }

        const query = searchQuery.toLowerCase();
        return ARTICLES.filter(article => {
            if (domainFilter !== 'all' && article.domain !== domainFilter) return false;
            return (
                article.number.toLowerCase().includes(query) ||
                article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query)
            );
        });
    }, [searchQuery, domainFilter]);

    // Related questions count
    const getRelatedQuestions = (article: Article) => {
        const allQuestions = article.domain === 'ksh'
            ? ALL_KSH_QUESTIONS
            : article.domain === 'prawo_cywilne'
                ? ALL_KC_QUESTIONS
                : ALL_PRAWO_UPADLOSCIOWE_QUESTIONS;

        return allQuestions.filter(q =>
            q.article?.includes(article.number.replace('Art. ', '')) ||
            q.question.includes(article.number)
        ).length;
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#1a365d' }} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar
                currentView="search"
                onNavigate={() => { }}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userStats={{
                    streak: stats?.currentStreak || 0,
                    knowledgeEquity: stats?.knowledgeEquity || 0
                }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    userStats={{
                        streak: stats?.currentStreak || 0,
                        knowledgeEquity: stats?.knowledgeEquity || 0,
                        rank: 0
                    }}
                    currentView="search"
                />

                <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#3b82f6' }}>
                                <Search size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Wyszukiwarka artykułów</h1>
                            <p className="text-[var(--text-muted)]">
                                Szybki dostęp do przepisów KSH, Prawa Upadłościowego i Kodeksu Cywilnego
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Szukaj artykułu... (np. '299', 'odpowiedzialność zarządu')"
                                className="w-full pl-12 pr-4 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl focus:border-[#3b82f6] focus:outline-none text-lg"
                                autoFocus
                            />
                        </div>

                        {/* Domain Filter */}
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'ksh', 'prawo_upadlosciowe', 'prawo_cywilne'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDomainFilter(d)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                        domainFilter === d
                                            ? 'bg-[#3b82f6] text-white'
                                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[#3b82f6]'
                                    )}
                                >
                                    {d === 'all' ? 'Wszystkie' : d === 'ksh' ? 'KSH' : d === 'prawo_cywilne' ? 'Kodeks Cywilny' : 'Prawo Upadłościowe'}
                                </button>
                            ))}
                        </div>

                        {/* Search Results */}
                        {selectedArticle ? (
                            /* Article Detail View */
                            <div className="space-y-4">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-sm text-[var(--text-muted)] hover:text-[#3b82f6]"
                                >
                                    ← Powrót do wyników
                                </button>

                                <div className="lex-card">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block",
                                                selectedArticle.domain === 'ksh'
                                                    ? "bg-[#1a365d]/10 text-[#1a365d]"
                                                    : "bg-orange-500/10 text-orange-500"
                                            )}>
                                                {selectedArticle.domain === 'ksh' ? 'KSH' : 'Prawo Upadłościowe'}
                                            </span>
                                            <h2 className="text-2xl font-bold">{selectedArticle.number}</h2>
                                            <p className="text-lg text-[var(--text-muted)]">{selectedArticle.title}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none">
                                        <div className="p-4 bg-[var(--bg-hover)] rounded-xl whitespace-pre-wrap">
                                            {selectedArticle.content}
                                        </div>
                                    </div>

                                    {/* Related Articles */}
                                    {selectedArticle.relatedArticles.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <LinkIcon size={16} />
                                                Powiązane artykuły
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedArticle.relatedArticles.map(ra => (
                                                    <button
                                                        key={ra}
                                                        onClick={() => {
                                                            const found = ARTICLES.find(a => a.number === ra || a.number.includes(ra));
                                                            if (found) setSelectedArticle(found);
                                                        }}
                                                        className="px-3 py-2 bg-[var(--bg-hover)] rounded-lg text-sm hover:bg-[#3b82f6]/20 hover:text-[#3b82f6] transition-all"
                                                    >
                                                        {ra}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Questions count */}
                                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                            <FileText size={16} />
                                            <span>{getRelatedQuestions(selectedArticle)} pytań w bazie dotyczy tego artykułu</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Results List */
                            <div className="space-y-3">
                                <p className="text-sm text-[var(--text-muted)]">
                                    {searchQuery ? `${searchResults.length} wyników` : 'Popularne artykuły'}
                                </p>
                                {searchResults.map(article => (
                                    <button
                                        key={article.id}
                                        onClick={() => setSelectedArticle(article)}
                                        className="w-full lex-card text-left hover:border-[#3b82f6]/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                article.domain === 'ksh' ? "bg-[#1a365d]/10" : "bg-orange-500/10"
                                            )}>
                                                <BookOpen size={20} className={
                                                    article.domain === 'ksh' ? "text-[#1a365d]" : "text-orange-500"
                                                } />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold">{article.number}</p>
                                                <p className="text-sm text-[var(--text-muted)] truncate">{article.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">
                                                    {article.questionCount} pytań
                                                </span>
                                                <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[#3b82f6]" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <MobileNav currentView="search" onNavigate={() => { }} />
        </div>
    );
}
