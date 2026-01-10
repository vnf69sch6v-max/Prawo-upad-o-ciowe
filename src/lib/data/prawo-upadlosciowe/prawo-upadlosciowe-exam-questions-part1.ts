// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - PRAWO UPADŁOŚCIOWE
// CZĘŚĆ 1 - 80 pytań: Podstawy, przesłanki, organy, skutki
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// Ustawa z dnia 28 lutego 2003 r. - Prawo upadłościowe
// Dz.U.2025.614 t.j.
// ============================================================

import { ExamQuestion } from '../ksh/ksh-exam-questions';

export const PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1: ExamQuestion[] = [

  // ============================================================
  // PRZEPISY OGÓLNE - ZAKRES REGULACJI I CELE
  // ============================================================

  {
    id: 'pu-001',
    article: 'Art. 1 § 1',
    articleTitle: 'Zakres regulacji',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł I - Przepisy ogólne',
    question: 'Prawo upadłościowe reguluje zasady wspólnego dochodzenia roszczeń wierzycieli od:',
    options: {
      a: 'Wszystkich dłużników',
      b: 'Niewypłacalnych dłużników będących przedsiębiorcami oraz osób fizycznych nieprowadzących działalności gospodarczej',
      c: 'Tylko przedsiębiorców',
      d: 'Tylko osób fizycznych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 1 § 1 ustawy Prawo upadłościowe reguluje zasady wspólnego dochodzenia roszczeń wierzycieli od niewypłacalnych dłużników będących przedsiębiorcami oraz zasady dochodzenia roszczeń od niewypłacalnych dłużników będących osobami fizycznymi nieprowadzącymi działalności gospodarczej.',
    difficulty: 'easy',
    tags: ['przepisy ogólne', 'zakres regulacji']
  },

  {
    id: 'pu-002',
    article: 'Art. 2 § 1',
    articleTitle: 'Cele postępowania',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł I - Przepisy ogólne',
    question: 'Postępowanie upadłościowe należy prowadzić tak, aby:',
    options: {
      a: 'Wierzyciele zostali zaspokojeni równomiernie',
      b: 'Roszczenia wierzycieli mogły zostać zaspokojone w jak najwyższym stopniu, a jeśli racjonalne względy na to pozwolą - dotychczasowe przedsiębiorstwo dłużnika zostało zachowane',
      c: 'Przedsiębiorstwo dłużnika zostało zlikwidowane jak najszybciej',
      d: 'Upadły został pozbawiony całego majątku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 2 § 1 postępowanie należy prowadzić tak, aby roszczenia wierzycieli mogły zostać zaspokojone w jak najwyższym stopniu, a jeśli racjonalne względy na to pozwolą - dotychczasowe przedsiębiorstwo dłużnika zostało zachowane.',
    difficulty: 'easy',
    tags: ['cele postępowania', 'zasady']
  },

  {
    id: 'pu-003',
    article: 'Art. 2 § 2',
    articleTitle: 'Cele postępowania wobec osób fizycznych',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł I - Przepisy ogólne',
    question: 'Postępowanie upadłościowe wobec osób fizycznych należy prowadzić również tak, aby:',
    options: {
      a: 'Umożliwić szybką likwidację majątku',
      b: 'Umożliwić umorzenie zobowiązań upadłego niewykonanych w postępowaniu upadłościowym',
      c: 'Zabezpieczyć interesy wierzycieli kosztem dłużnika',
      d: 'Pozbawić dłużnika zdolności do czynności prawnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 2 § 2 postępowanie wobec osób fizycznych należy prowadzić również tak, aby umożliwić umorzenie zobowiązań upadłego niewykonanych w postępowaniu upadłościowym.',
    difficulty: 'medium',
    tags: ['cele postępowania', 'osoba fizyczna', 'oddłużenie']
  },

  {
    id: 'pu-004',
    article: 'Art. 3',
    articleTitle: 'Wszczęcie postępowania na wniosek',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł I - Przepisy ogólne',
    question: 'Postępowanie upadłościowe może być wszczęte:',
    options: {
      a: 'Z urzędu przez sąd',
      b: 'Tylko na wniosek dłużnika',
      c: 'Tylko na wniosek złożony przez podmioty określone w ustawie',
      d: 'Na wniosek prokuratora'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 3 postępowanie może być wszczęte tylko na wniosek złożony przez podmioty określone w ustawie.',
    difficulty: 'easy',
    tags: ['wszczęcie postępowania', 'wniosek']
  },

  {
    id: 'pu-005',
    article: 'Art. 4a',
    articleTitle: 'Krajowy Rejestr Zadłużonych',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł I - Przepisy ogólne',
    question: 'Ilekroć w ustawie Prawo upadłościowe jest mowa o "Rejestrze", należy przez to rozumieć:',
    options: {
      a: 'Krajowy Rejestr Sądowy',
      b: 'Krajowy Rejestr Zadłużonych',
      c: 'Centralną Ewidencję i Informację o Działalności Gospodarczej',
      d: 'Rejestr Dłużników Niewypłacalnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4a ilekroć w ustawie jest mowa o "Rejestrze", należy przez to rozumieć Krajowy Rejestr Zadłużonych.',
    difficulty: 'easy',
    tags: ['KRZ', 'rejestr', 'definicja']
  },

  // ============================================================
  // ZAKRES PODMIOTOWY
  // ============================================================

  {
    id: 'pu-006',
    article: 'Art. 5 § 1',
    articleTitle: 'Zakres podmiotowy - przedsiębiorcy',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Przepisy Prawa upadłościowego stosuje się do przedsiębiorców w rozumieniu:',
    options: {
      a: 'Ustawy o swobodzie działalności gospodarczej',
      b: 'Kodeksu cywilnego',
      c: 'Kodeksu spółek handlowych',
      d: 'Prawa przedsiębiorców'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 5 § 1 przepisy ustawy stosuje się do przedsiębiorców w rozumieniu ustawy z dnia 23 kwietnia 1964 r. - Kodeks cywilny.',
    difficulty: 'medium',
    tags: ['zakres podmiotowy', 'przedsiębiorca']
  },

  {
    id: 'pu-007',
    article: 'Art. 5 § 2',
    articleTitle: 'Zakres podmiotowy - spółki kapitałowe nieprowadzące działalności',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Przepisy Prawa upadłościowego stosuje się także do spółek z ograniczoną odpowiedzialnością, prostych spółek akcyjnych i spółek akcyjnych:',
    options: {
      a: 'Tylko prowadzących działalność gospodarczą',
      b: 'Nieprowadzących działalności gospodarczej',
      c: 'Tylko notowanych na giełdzie',
      d: 'Tylko jednoosobowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 5 § 2 pkt 1 przepisy ustawy stosuje się także do spółek z ograniczoną odpowiedzialnością, prostych spółek akcyjnych i spółek akcyjnych nieprowadzących działalności gospodarczej.',
    difficulty: 'hard',
    tags: ['zakres podmiotowy', 'spółki kapitałowe']
  },

  {
    id: 'pu-008',
    article: 'Art. 6',
    articleTitle: 'Wyłączenia podmiotowe',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Nie można ogłosić upadłości:',
    options: {
      a: 'Spółek kapitałowych',
      b: 'Skarbu Państwa',
      c: 'Osób fizycznych prowadzących działalność gospodarczą',
      d: 'Spółek osobowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 6 pkt 1 nie można ogłosić upadłości Skarbu Państwa. Wyłączenia dotyczą także m.in. jednostek samorządu terytorialnego, publicznych samodzielnych zakładów opieki zdrowotnej, uczelni, funduszy inwestycyjnych.',
    difficulty: 'easy',
    tags: ['wyłączenia podmiotowe', 'Skarb Państwa']
  },

  {
    id: 'pu-009',
    article: 'Art. 6',
    articleTitle: 'Wyłączenia podmiotowe - JST',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Nie można ogłosić upadłości:',
    options: {
      a: 'Spółki akcyjnej',
      b: 'Jednostek samorządu terytorialnego',
      c: 'Fundacji',
      d: 'Stowarzyszenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 6 pkt 2 nie można ogłosić upadłości jednostek samorządu terytorialnego.',
    difficulty: 'easy',
    tags: ['wyłączenia podmiotowe', 'JST']
  },

  {
    id: 'pu-010',
    article: 'Art. 6 pkt 5',
    articleTitle: 'Wyłączenia podmiotowe - rolnicy',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Nie można ogłosić upadłości osób fizycznych prowadzących gospodarstwo rolne:',
    options: {
      a: 'W żadnym przypadku',
      b: 'Które nie prowadzą innej działalności gospodarczej lub zawodowej',
      c: 'Które prowadzą gospodarstwo o powierzchni powyżej 50 ha',
      d: 'Które są ubezpieczone w KRUS'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 6 pkt 5 nie można ogłosić upadłości osób fizycznych prowadzących gospodarstwo rolne, które nie prowadzą innej działalności gospodarczej lub zawodowej.',
    difficulty: 'medium',
    tags: ['wyłączenia podmiotowe', 'rolnik']
  },

  {
    id: 'pu-011',
    article: 'Art. 7',
    articleTitle: 'Upadłość po śmierci przedsiębiorcy',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'W razie śmierci przedsiębiorcy można ogłosić jego upadłość, jeżeli wniosek o ogłoszenie upadłości został złożony w terminie:',
    options: {
      a: '6 miesięcy od dnia jego śmierci',
      b: 'Roku od dnia jego śmierci',
      c: '2 lat od dnia jego śmierci',
      d: '30 dni od dnia jego śmierci'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 7 w razie śmierci przedsiębiorcy można ogłosić jego upadłość, jeżeli wniosek o ogłoszenie upadłości został złożony w terminie roku od dnia jego śmierci.',
    difficulty: 'hard',
    tags: ['śmierć przedsiębiorcy', 'termin', 'liczby']
  },

  {
    id: 'pu-012',
    article: 'Art. 8 § 1',
    articleTitle: 'Upadłość po zaprzestaniu działalności',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Wierzyciel może złożyć wniosek o ogłoszenie upadłości osoby fizycznej, która była przedsiębiorcą, po zaprzestaniu prowadzenia przez nią działalności gospodarczej, jeżeli od dnia wykreślenia z rejestru nie upłynął:',
    options: {
      a: '6 miesięcy',
      b: 'Rok',
      c: '2 lata',
      d: '3 lata'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 8 § 1 wierzyciel może złożyć wniosek o ogłoszenie upadłości osoby fizycznej, która była przedsiębiorcą, także po zaprzestaniu prowadzenia przez nią działalności gospodarczej, jeżeli od dnia wykreślenia z właściwego rejestru nie upłynął rok.',
    difficulty: 'hard',
    tags: ['były przedsiębiorca', 'termin', 'liczby']
  },

  // ============================================================
  // PODSTAWY OGŁOSZENIA UPADŁOŚCI - NIEWYPŁACALNOŚĆ
  // ============================================================

  {
    id: 'pu-013',
    article: 'Art. 10',
    articleTitle: 'Upadłość niewypłacalnego dłużnika',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Upadłość ogłasza się w stosunku do dłużnika, który:',
    options: {
      a: 'Ma długi',
      b: 'Stał się niewypłacalny',
      c: 'Nie wykonuje zobowiązań',
      d: 'Ma ujemne kapitały własne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 10 upadłość ogłasza się w stosunku do dłużnika, który stał się niewypłacalny.',
    difficulty: 'easy',
    tags: ['niewypłacalność', 'podstawa upadłości']
  },

  {
    id: 'pu-014',
    article: 'Art. 11 § 1',
    articleTitle: 'Pojęcie niewypłacalności - przesłanka płynnościowa',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Dłużnik jest niewypłacalny, jeżeli:',
    options: {
      a: 'Ma ujemny kapitał własny',
      b: 'Utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych',
      c: 'Nie posiada majątku',
      d: 'Jest zadłużony powyżej 100.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 11 § 1 dłużnik jest niewypłacalny, jeżeli utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych.',
    difficulty: 'easy',
    tags: ['niewypłacalność', 'definicja', 'przesłanka płynnościowa']
  },

  {
    id: 'pu-015',
    article: 'Art. 11 § 1a',
    articleTitle: 'Domniemanie niewypłacalności',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Domniemywa się, że dłużnik utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych, jeżeli opóźnienie w wykonaniu zobowiązań pieniężnych przekracza:',
    options: {
      a: 'Jeden miesiąc',
      b: 'Dwa miesiące',
      c: 'Trzy miesiące',
      d: 'Sześć miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 11 § 1a domniemywa się, że dłużnik utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych, jeżeli opóźnienie w wykonaniu zobowiązań pieniężnych przekracza trzy miesiące.',
    difficulty: 'medium',
    tags: ['niewypłacalność', 'domniemanie', '3 miesiące', 'liczby']
  },

  {
    id: 'pu-016',
    article: 'Art. 11 § 2',
    articleTitle: 'Przesłanka bilansowa niewypłacalności',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Dłużnik będący osobą prawną albo jednostką organizacyjną jest niewypłacalny także wtedy, gdy jego zobowiązania pieniężne przekraczają wartość jego majątku, a stan ten utrzymuje się przez okres przekraczający:',
    options: {
      a: '12 miesięcy',
      b: '18 miesięcy',
      c: '24 miesiące',
      d: '36 miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 11 § 2 dłużnik będący osobą prawną albo jednostką organizacyjną jest niewypłacalny także wtedy, gdy jego zobowiązania pieniężne przekraczają wartość jego majątku, a stan ten utrzymuje się przez okres przekraczający dwadzieścia cztery miesiące.',
    difficulty: 'hard',
    tags: ['niewypłacalność', 'przesłanka bilansowa', '24 miesiące', 'liczby']
  },

  {
    id: 'pu-017',
    article: 'Art. 11 § 5',
    articleTitle: 'Domniemanie nadmiernego zadłużenia',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Domniemywa się, że zobowiązania pieniężne dłużnika przekraczają wartość jego majątku, jeżeli zgodnie z bilansem jego zobowiązania (z wyłączeniem rezerw oraz zobowiązań wobec jednostek powiązanych) przekraczają wartość jego aktywów, a stan ten utrzymuje się przez okres przekraczający:',
    options: {
      a: '12 miesięcy',
      b: '18 miesięcy',
      c: '24 miesiące',
      d: '36 miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 11 § 5 domniemywa się, że zobowiązania pieniężne dłużnika przekraczają wartość jego majątku, jeżeli zgodnie z bilansem jego zobowiązania przekraczają wartość jego aktywów, a stan ten utrzymuje się przez okres przekraczający dwadzieścia cztery miesiące.',
    difficulty: 'hard',
    tags: ['niewypłacalność', 'domniemanie', 'bilans', '24 miesiące']
  },

  {
    id: 'pu-018',
    article: 'Art. 11 § 7',
    articleTitle: 'Wyłączenie przesłanki bilansowej dla spółek osobowych',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Przesłanka bilansowa niewypłacalności (nadmierne zadłużenie) NIE ma zastosowania do:',
    options: {
      a: 'Spółek z ograniczoną odpowiedzialnością',
      b: 'Spółek akcyjnych',
      c: 'Spółek osobowych, w których co najmniej jednym wspólnikiem odpowiadającym za zobowiązania spółki bez ograniczenia całym swoim majątkiem jest osoba fizyczna',
      d: 'Prostych spółek akcyjnych'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 11 § 7 przepisy o przesłance bilansowej nie mają zastosowania do spółek osobowych, w których co najmniej jednym wspólnikiem odpowiadającym za zobowiązania spółki bez ograniczenia całym swoim majątkiem jest osoba fizyczna.',
    difficulty: 'hard',
    tags: ['niewypłacalność', 'spółki osobowe', 'wyłączenie']
  },

  {
    id: 'pu-019',
    article: 'Art. 12a',
    articleTitle: 'Oddalenie wniosku przy wierzytelności spornej',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Sąd oddali wniosek o ogłoszenie upadłości złożony przez wierzyciela, jeżeli:',
    options: {
      a: 'Dłużnik ma majątek wystarczający na pokrycie kosztów',
      b: 'Dłużnik wykaże, że wierzytelność ma w całości charakter sporny, a spór zaistniał między stronami przed złożeniem wniosku o ogłoszenie upadłości',
      c: 'Dłużnik prowadzi działalność gospodarczą',
      d: 'Wierzyciel nie uiści zaliczki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 12a sąd oddali wniosek o ogłoszenie upadłości złożony przez wierzyciela, jeżeli dłużnik wykaże, że wierzytelność ma w całości charakter sporny, a spór zaistniał między stronami przed złożeniem wniosku o ogłoszenie upadłości.',
    difficulty: 'medium',
    tags: ['oddalenie wniosku', 'wierzytelność sporna']
  },

  {
    id: 'pu-020',
    article: 'Art. 13 § 1',
    articleTitle: 'Obligatoryjne oddalenie wniosku - brak majątku',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział III - Podstawy ogłoszenia upadłości',
    question: 'Sąd oddali wniosek o ogłoszenie upadłości, jeżeli:',
    options: {
      a: 'Dłużnik jest wypłacalny',
      b: 'Majątek niewypłacalnego dłużnika nie wystarcza na zaspokojenie kosztów postępowania lub wystarcza jedynie na zaspokojenie tych kosztów',
      c: 'Dłużnik prowadzi działalność gospodarczą',
      d: 'Wniosek złożył wierzyciel'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 13 § 1 sąd oddali wniosek o ogłoszenie upadłości, jeżeli majątek niewypłacalnego dłużnika nie wystarcza na zaspokojenie kosztów postępowania lub wystarcza jedynie na zaspokojenie tych kosztów (tzw. ubóstwo masy).',
    difficulty: 'medium',
    tags: ['oddalenie wniosku', 'ubóstwo masy', 'koszty']
  },

  // ============================================================
  // POSTĘPOWANIE W PRZEDMIOCIE OGŁOSZENIA UPADŁOŚCI
  // ============================================================

  {
    id: 'pu-021',
    article: 'Art. 18',
    articleTitle: 'Skład sądu upadłościowego',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Sprawy o ogłoszenie upadłości rozpoznaje sąd upadłościowy w składzie:',
    options: {
      a: 'Jednego sędziego',
      b: 'Trzech sędziów zawodowych',
      c: 'Jednego sędziego i dwóch ławników',
      d: 'Trzech sędziów, w tym jeden ławnik'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 18 sprawy o ogłoszenie upadłości rozpoznaje sąd upadłościowy w składzie trzech sędziów zawodowych. Sądem upadłościowym jest sąd rejonowy - sąd gospodarczy.',
    difficulty: 'medium',
    tags: ['sąd upadłościowy', 'skład sądu']
  },

  {
    id: 'pu-022',
    article: 'Art. 19 § 1',
    articleTitle: 'Właściwość sądu upadłościowego',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Sprawy o ogłoszenie upadłości rozpoznaje sąd właściwy dla:',
    options: {
      a: 'Siedziby dłużnika',
      b: 'Miejsca zamieszkania dłużnika',
      c: 'Głównego ośrodka podstawowej działalności dłużnika',
      d: 'Miejsca położenia głównego składnika majątku dłużnika'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 19 § 1 sprawy o ogłoszenie upadłości rozpoznaje sąd właściwy dla głównego ośrodka podstawowej działalności dłużnika (COMI - Center of Main Interests).',
    difficulty: 'medium',
    tags: ['właściwość sądu', 'COMI']
  },

  {
    id: 'pu-023',
    article: 'Art. 20 § 1',
    articleTitle: 'Podmioty uprawnione do złożenia wniosku',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Wniosek o ogłoszenie upadłości może zgłosić:',
    options: {
      a: 'Tylko dłużnik',
      b: 'Dłużnik lub każdy z jego wierzycieli osobistych',
      c: 'Tylko wierzyciel',
      d: 'Prokurator'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 20 § 1 wniosek o ogłoszenie upadłości może zgłosić dłużnik lub każdy z jego wierzycieli osobistych.',
    difficulty: 'easy',
    tags: ['wniosek', 'legitymacja']
  },

  {
    id: 'pu-024',
    article: 'Art. 21 § 1',
    articleTitle: 'Obowiązek dłużnika do złożenia wniosku',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Dłużnik jest obowiązany zgłosić w sądzie wniosek o ogłoszenie upadłości nie później niż w terminie:',
    options: {
      a: '14 dni od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości',
      b: '30 dni od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości',
      c: '60 dni od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości',
      d: '3 miesięcy od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21 § 1 dłużnik jest obowiązany, nie później niż w terminie trzydziestu dni od dnia, w którym wystąpiła podstawa do ogłoszenia upadłości, zgłosić w sądzie wniosek o ogłoszenie upadłości.',
    difficulty: 'medium',
    tags: ['obowiązek złożenia wniosku', '30 dni', 'liczby']
  },

  {
    id: 'pu-025',
    article: 'Art. 21 § 2',
    articleTitle: 'Obowiązek członków zarządu',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Jeżeli dłużnikiem jest osoba prawna albo inna jednostka organizacyjna nieposiadająca osobowości prawnej, obowiązek zgłoszenia wniosku o ogłoszenie upadłości spoczywa na:',
    options: {
      a: 'Wspólnikach',
      b: 'Radzie nadzorczej',
      c: 'Każdym, kto na podstawie ustawy, umowy spółki lub statutu ma prawo do prowadzenia spraw dłużnika i do jego reprezentowania',
      d: 'Głównym księgowym'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 21 § 2 jeżeli dłużnikiem jest osoba prawna albo inna jednostka organizacyjna, obowiązek spoczywa na każdym, kto na podstawie ustawy, umowy spółki lub statutu ma prawo do prowadzenia spraw dłużnika i do jego reprezentowania, samodzielnie lub łącznie z innymi osobami.',
    difficulty: 'medium',
    tags: ['obowiązek złożenia wniosku', 'zarząd']
  },

  {
    id: 'pu-026',
    article: 'Art. 21 § 3',
    articleTitle: 'Odpowiedzialność za niezłożenie wniosku',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Osoby zobowiązane do złożenia wniosku o ogłoszenie upadłości ponoszą odpowiedzialność:',
    options: {
      a: 'Tylko karną',
      b: 'Za szkodę wyrządzoną wskutek niezłożenia wniosku w terminie, chyba że nie ponoszą winy',
      c: 'Solidarną ze spółką',
      d: 'Tylko wobec wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21 § 3 osoby te ponoszą odpowiedzialność za szkodę wyrządzoną wskutek niezłożenia wniosku w terminie, chyba że nie ponoszą winy. Mogą uwolnić się od odpowiedzialności m.in. jeżeli wykażą, że w terminie otwarto postępowanie restrukturyzacyjne.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'niezłożenie wniosku', 'szkoda']
  },

  {
    id: 'pu-027',
    article: 'Art. 22a',
    articleTitle: 'Zaliczka na wydatki',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Wnioskodawca uiszcza zaliczkę na wydatki w toku postępowania w przedmiocie ogłoszenia upadłości w wysokości:',
    options: {
      a: '1.000 zł',
      b: 'Jednokrotności przeciętnego miesięcznego wynagrodzenia w sektorze przedsiębiorstw',
      c: '5.000 zł',
      d: '10.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 22a wnioskodawca uiszcza zaliczkę na wydatki w wysokości jednokrotności przeciętnego miesięcznego wynagrodzenia w sektorze przedsiębiorstw bez wypłat nagród z zysku w trzecim kwartale roku poprzedniego, ogłoszonego przez Prezesa GUS.',
    difficulty: 'hard',
    tags: ['zaliczka', 'koszty']
  },

  {
    id: 'pu-028',
    article: 'Art. 27 § 3',
    articleTitle: 'Termin wydania postanowienia',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Tytuł II - Postępowanie w przedmiocie ogłoszenia upadłości',
    question: 'Postanowienie w sprawie ogłoszenia upadłości sąd wydaje w terminie:',
    options: {
      a: 'Miesiąca od dnia złożenia wniosku',
      b: 'Dwóch miesięcy od dnia złożenia wniosku',
      c: 'Trzech miesięcy od dnia złożenia wniosku',
      d: 'Sześciu miesięcy od dnia złożenia wniosku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 27 § 3 postanowienie w sprawie ogłoszenia upadłości sąd wydaje w terminie dwóch miesięcy od dnia złożenia wniosku.',
    difficulty: 'medium',
    tags: ['termin', 'postanowienie', '2 miesiące', 'liczby']
  },

  // ============================================================
  // POSTĘPOWANIE ZABEZPIECZAJĄCE
  // ============================================================

  {
    id: 'pu-029',
    article: 'Art. 36',
    articleTitle: 'Zabezpieczenie majątku dłużnika',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział IV - Postępowanie zabezpieczające',
    question: 'Po złożeniu wniosku o ogłoszenie upadłości sąd może dokonać zabezpieczenia majątku dłużnika:',
    options: {
      a: 'Tylko na wniosek',
      b: 'Na wniosek albo z urzędu',
      c: 'Tylko z urzędu',
      d: 'Po uzyskaniu zgody dłużnika'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 36 po złożeniu wniosku o ogłoszenie upadłości sąd na wniosek albo z urzędu może dokonać zabezpieczenia majątku dłużnika.',
    difficulty: 'easy',
    tags: ['zabezpieczenie', 'majątek']
  },

  {
    id: 'pu-030',
    article: 'Art. 38 § 1',
    articleTitle: 'Tymczasowy nadzorca sądowy',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział IV - Postępowanie zabezpieczające',
    question: 'Sąd może zabezpieczyć majątek dłużnika przez ustanowienie:',
    options: {
      a: 'Syndyka',
      b: 'Tymczasowego nadzorcy sądowego',
      c: 'Kuratora',
      d: 'Likwidatora'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 38 § 1 sąd może zabezpieczyć majątek dłużnika przez ustanowienie tymczasowego nadzorcy sądowego.',
    difficulty: 'easy',
    tags: ['zabezpieczenie', 'tymczasowy nadzorca sądowy']
  },

  {
    id: 'pu-031',
    article: 'Art. 38a',
    articleTitle: 'Uprawnienia dłużnika po ustanowieniu TNS',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział IV - Postępowanie zabezpieczające',
    question: 'Dłużnik po ustanowieniu tymczasowego nadzorcy sądowego jest uprawniony do dokonywania:',
    options: {
      a: 'Wszystkich czynności',
      b: 'Czynności zwykłego zarządu; na dokonanie czynności przekraczających zakres zwykłego zarządu wymagana jest zgoda tymczasowego nadzorcy sądowego',
      c: 'Tylko czynności za zgodą sądu',
      d: 'Żadnych czynności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 38a dłużnik po ustanowieniu tymczasowego nadzorcy sądowego jest uprawniony do dokonywania czynności zwykłego zarządu. Na dokonanie czynności przekraczających zakres zwykłego zarządu jest wymagana zgoda tymczasowego nadzorcy sądowego pod rygorem nieważności.',
    difficulty: 'medium',
    tags: ['tymczasowy nadzorca sądowy', 'zarząd']
  },

  {
    id: 'pu-032',
    article: 'Art. 40 § 1',
    articleTitle: 'Zarząd przymusowy',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział IV - Postępowanie zabezpieczające',
    question: 'Sąd może ustanowić zarząd przymusowy nad majątkiem dłużnika, jeżeli:',
    options: {
      a: 'Dłużnik o to wnosi',
      b: 'Zachodzi obawa, że dłużnik będzie ukrywał swój majątek lub w inny sposób działał na szkodę wierzycieli, a także gdy dłużnik nie wykonuje poleceń tymczasowego nadzorcy sądowego',
      c: 'Majątek dłużnika przekracza 10 mln zł',
      d: 'Jest wielu wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 40 § 1 sąd może stosować inne sposoby zabezpieczenia, w tym zabezpieczenie przez ustanowienie zarządu przymusowego nad majątkiem dłużnika, jeżeli zachodzi obawa, że dłużnik będzie ukrywał swój majątek lub w inny sposób działał na szkodę wierzycieli, a także gdy dłużnik nie wykonuje poleceń tymczasowego nadzorcy sądowego.',
    difficulty: 'hard',
    tags: ['zarząd przymusowy', 'zabezpieczenie']
  },

  {
    id: 'pu-033',
    article: 'Art. 43',
    articleTitle: 'Upadek zabezpieczenia',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział IV - Postępowanie zabezpieczające',
    question: 'Zabezpieczenia zastosowane przez sąd upadają z dniem:',
    options: {
      a: 'Upływu miesiąca od ich ustanowienia',
      b: 'Ogłoszenia upadłości albo uprawomocnienia się postanowienia o odrzuceniu lub oddaleniu wniosku o ogłoszenie upadłości albo umorzeniu postępowania',
      c: 'Złożenia zażalenia przez dłużnika',
      d: 'Wpłaty przez dłużnika kaucji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 43 zabezpieczenia zastosowane przez sąd upadają z dniem ogłoszenia upadłości albo uprawomocnienia się postanowienia o odrzuceniu lub oddaleniu wniosku o ogłoszenie upadłości albo umorzeniu postępowania w przedmiocie rozpoznania tego wniosku.',
    difficulty: 'medium',
    tags: ['zabezpieczenie', 'upadek']
  },

  // ============================================================
  // ORZECZENIE O OGŁOSZENIU UPADŁOŚCI
  // ============================================================

  {
    id: 'pu-034',
    article: 'Art. 51 § 1',
    articleTitle: 'Postanowienie o ogłoszeniu upadłości',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VI - Orzeczenie o ogłoszeniu upadłości',
    question: 'W postanowieniu o ogłoszeniu upadłości sąd wzywa wierzycieli upadłego do zgłoszenia wierzytelności syndykowi w terminie:',
    options: {
      a: '14 dni od dnia obwieszczenia',
      b: '30 dni od dnia obwieszczenia postanowienia o ogłoszeniu upadłości w Rejestrze',
      c: '60 dni od dnia obwieszczenia',
      d: '3 miesięcy od dnia obwieszczenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 51 § 1 pkt 4 sąd wzywa wierzycieli upadłego do zgłoszenia wierzytelności syndykowi za pośrednictwem systemu teleinformatycznego, w terminie trzydziestu dni od dnia obwieszczenia postanowienia o ogłoszeniu upadłości w Rejestrze.',
    difficulty: 'medium',
    tags: ['postanowienie', 'zgłoszenie wierzytelności', '30 dni', 'liczby']
  },

  {
    id: 'pu-035',
    article: 'Art. 51 § 2',
    articleTitle: 'Skuteczność i wykonalność postanowienia',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VI - Orzeczenie o ogłoszeniu upadłości',
    question: 'Postanowienie o ogłoszeniu upadłości jest skuteczne i wykonalne:',
    options: {
      a: 'Z dniem jego uprawomocnienia',
      b: 'Z dniem jego wydania',
      c: 'Z dniem obwieszczenia',
      d: 'Po upływie 7 dni od wydania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 51 § 2 postanowienie o ogłoszeniu upadłości jest skuteczne i wykonalne z dniem jego wydania, chyba że przepis szczególny stanowi inaczej.',
    difficulty: 'medium',
    tags: ['postanowienie', 'skuteczność', 'wykonalność']
  },

  {
    id: 'pu-036',
    article: 'Art. 52',
    articleTitle: 'Data upadłości',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VI - Orzeczenie o ogłoszeniu upadłości',
    question: 'Datą upadłości jest:',
    options: {
      a: 'Data złożenia wniosku o ogłoszenie upadłości',
      b: 'Data wydania postanowienia o ogłoszeniu upadłości',
      c: 'Data uprawomocnienia się postanowienia',
      d: 'Data obwieszczenia postanowienia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 52 data wydania postanowienia o ogłoszeniu upadłości jest datą upadłości.',
    difficulty: 'easy',
    tags: ['data upadłości', 'postanowienie']
  },

  // ============================================================
  // PRZYGOTOWANA LIKWIDACJA (PRE-PACK)
  // ============================================================

  {
    id: 'pu-037',
    article: 'Art. 56a § 1',
    articleTitle: 'Wniosek o zatwierdzenie warunków sprzedaży (pre-pack)',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VII - Przygotowana likwidacja',
    question: 'W postępowaniu o ogłoszenie upadłości uczestnik postępowania może złożyć wniosek o zatwierdzenie warunków sprzedaży:',
    options: {
      a: 'Tylko udziałów dłużnika',
      b: 'Przedsiębiorstwa dłużnika lub jego zorganizowanej części lub składników majątkowych stanowiących znaczną część przedsiębiorstwa',
      c: 'Tylko nieruchomości',
      d: 'Tylko ruchomości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 56a § 1 w postępowaniu o ogłoszenie upadłości uczestnik postępowania może złożyć wniosek o zatwierdzenie warunków sprzedaży przedsiębiorstwa dłużnika lub jego zorganizowanej części lub składników majątkowych stanowiących znaczną część przedsiębiorstwa na rzecz nabywcy.',
    difficulty: 'medium',
    tags: ['pre-pack', 'przygotowana likwidacja']
  },

  {
    id: 'pu-038',
    article: 'Art. 56a § 2a',
    articleTitle: 'Wadium w pre-packu',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VII - Przygotowana likwidacja',
    question: 'Do wniosku o zatwierdzenie warunków sprzedaży (pre-pack) wnioskodawca załącza dowód wniesienia przez nabywcę wadium w wysokości:',
    options: {
      a: 'Jednej piątej oferowanej ceny',
      b: 'Jednej dziesiątej oferowanej ceny',
      c: 'Jednej dwudziestej oferowanej ceny',
      d: '10.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 56a § 2a do wniosku o zatwierdzenie warunków sprzedaży wnioskodawca załącza dowód wniesienia przez nabywcę wadium w wysokości jednej dziesiątej oferowanej ceny.',
    difficulty: 'hard',
    tags: ['pre-pack', 'wadium', '1/10', 'liczby']
  },

  {
    id: 'pu-039',
    article: 'Art. 56e § 1',
    articleTitle: 'Termin zawarcia umowy w pre-packu',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział VII - Przygotowana likwidacja',
    question: 'Syndyk zawiera umowę sprzedaży w ramach przygotowanej likwidacji nie później niż w terminie:',
    options: {
      a: '14 dni od dnia stwierdzenia prawomocności postanowienia',
      b: '30 dni od dnia stwierdzenia prawomocności postanowienia o zatwierdzeniu warunków sprzedaży',
      c: '60 dni od dnia stwierdzenia prawomocności postanowienia',
      d: '3 miesięcy od dnia stwierdzenia prawomocności postanowienia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 56e § 1 syndyk zawiera umowę sprzedaży na warunkach określonych w postanowieniu sądu o zatwierdzeniu warunków sprzedaży nie później niż w terminie trzydziestu dni od dnia stwierdzenia prawomocności tego postanowienia.',
    difficulty: 'hard',
    tags: ['pre-pack', 'termin', '30 dni', 'liczby']
  },

  // ============================================================
  // SKUTKI OGŁOSZENIA UPADŁOŚCI CO DO OSOBY UPADŁEGO
  // ============================================================

  {
    id: 'pu-040',
    article: 'Art. 57 § 1',
    articleTitle: 'Obowiązki upadłego',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział I - Skutki co do osoby upadłego',
    question: 'Upadły jest obowiązany:',
    options: {
      a: 'Kontynuować działalność gospodarczą',
      b: 'Wskazać i wydać syndykowi cały swój majątek, a także wydać dokumenty dotyczące jego działalności, majątku oraz rozliczeń',
      c: 'Spłacić wierzycieli',
      d: 'Złożyć wniosek o restrukturyzację'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 57 § 1 upadły jest obowiązany wskazać i wydać syndykowi cały swój majątek, a także wydać dokumenty dotyczące jego działalności, majątku oraz rozliczeń, w szczególności księgi rachunkowe, inne ewidencje prowadzone dla celów podatkowych i korespondencję.',
    difficulty: 'easy',
    tags: ['obowiązki upadłego', 'wydanie majątku']
  },

  {
    id: 'pu-041',
    article: 'Art. 57 § 3',
    articleTitle: 'Zakaz opuszczania terytorium RP',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział I - Skutki co do osoby upadłego',
    question: 'Sędzia-komisarz może postanowić, aby upadły będący osobą fizyczną:',
    options: {
      a: 'Został umieszczony w areszcie',
      b: 'Nie opuszczał terytorium Rzeczypospolitej Polskiej bez jego zezwolenia',
      c: 'Nie mógł zawierać umów',
      d: 'Został pozbawiony zdolności do czynności prawnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 57 § 3 sędzia-komisarz może postanowić, aby upadły będący osobą fizyczną nie opuszczał terytorium Rzeczypospolitej Polskiej bez jego zezwolenia.',
    difficulty: 'medium',
    tags: ['zakaz opuszczania kraju', 'upadły']
  },

  {
    id: 'pu-042',
    article: 'Art. 60¹',
    articleTitle: 'Firma upadłego przedsiębiorcy',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział I - Skutki co do osoby upadłego',
    question: 'Po ogłoszeniu upadłości przedsiębiorca występuje w obrocie pod dotychczasową firmą z dodaniem oznaczenia:',
    options: {
      a: '"w likwidacji"',
      b: '"w upadłości"',
      c: '"w restrukturyzacji"',
      d: '"niewypłacalny"'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 60¹ po ogłoszeniu upadłości przedsiębiorca występuje w obrocie pod dotychczasową firmą z dodaniem oznaczenia "w upadłości".',
    difficulty: 'easy',
    tags: ['firma', 'oznaczenie', 'w upadłości']
  },

  // ============================================================
  // SKUTKI OGŁOSZENIA UPADŁOŚCI CO DO MAJĄTKU - MASA UPADŁOŚCI
  // ============================================================

  {
    id: 'pu-043',
    article: 'Art. 61',
    articleTitle: 'Masa upadłości',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'Z dniem ogłoszenia upadłości majątek upadłego staje się:',
    options: {
      a: 'Własnością wierzycieli',
      b: 'Masą upadłości, która służy zaspokojeniu wierzycieli upadłego',
      c: 'Własnością Skarbu Państwa',
      d: 'Przedmiotem egzekucji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 61 z dniem ogłoszenia upadłości majątek upadłego staje się masą upadłości, która służy zaspokojeniu wierzycieli upadłego.',
    difficulty: 'easy',
    tags: ['masa upadłości', 'definicja']
  },

  {
    id: 'pu-044',
    article: 'Art. 62',
    articleTitle: 'Skład masy upadłości',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'W skład masy upadłości wchodzi:',
    options: {
      a: 'Tylko majątek z dnia ogłoszenia upadłości',
      b: 'Majątek należący do upadłego w dniu ogłoszenia upadłości oraz nabyty przez upadłego w toku postępowania upadłościowego',
      c: 'Tylko majątek nabyty po ogłoszeniu upadłości',
      d: 'Tylko nieruchomości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 62 w skład masy upadłości wchodzi majątek należący do upadłego w dniu ogłoszenia upadłości oraz nabyty przez upadłego w toku postępowania upadłościowego, z wyjątkami określonymi w art. 63-67a.',
    difficulty: 'medium',
    tags: ['masa upadłości', 'skład']
  },

  {
    id: 'pu-045',
    article: 'Art. 63 § 1a',
    articleTitle: 'Wyłączenie z masy - dochód osoby fizycznej',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'W przypadku ogłoszenia upadłości osoby fizycznej, na której utrzymaniu nie pozostają inne osoby, do masy upadłości NIE wchodzi część dochodu upadłego odpowiadająca kwocie stanowiącej:',
    options: {
      a: '100% kryterium dochodowego z ustawy o pomocy społecznej',
      b: '150% kryterium dochodowego z ustawy o pomocy społecznej',
      c: '200% kryterium dochodowego z ustawy o pomocy społecznej',
      d: 'Minimalnego wynagrodzenia za pracę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 63 § 1a w przypadku ogłoszenia upadłości osoby fizycznej, na której utrzymaniu nie pozostają inne osoby, do masy upadłości nie wchodzi część dochodu upadłego odpowiadająca kwocie stanowiącej 150% kwoty określonej w art. 8 ust. 1 pkt 1 ustawy o pomocy społecznej.',
    difficulty: 'hard',
    tags: ['wyłączenie z masy', 'dochód', '150%', 'liczby']
  },

  {
    id: 'pu-046',
    article: 'Art. 69 § 3',
    articleTitle: 'Domniemanie przynależności do masy',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'Domniemywa się, że rzeczy znajdujące się w posiadaniu upadłego w dniu ogłoszenia upadłości:',
    options: {
      a: 'Należą do wierzycieli',
      b: 'Należą do majątku upadłego',
      c: 'Są przedmiotem zastawu',
      d: 'Są własnością Skarbu Państwa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 69 § 3 domniemywa się, że rzeczy znajdujące się w posiadaniu upadłego w dniu ogłoszenia upadłości należą do majątku upadłego.',
    difficulty: 'medium',
    tags: ['domniemanie', 'masa upadłości']
  },

  {
    id: 'pu-047',
    article: 'Art. 75 § 1',
    articleTitle: 'Utrata prawa zarządu',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'Z dniem ogłoszenia upadłości upadły traci:',
    options: {
      a: 'Zdolność do czynności prawnych',
      b: 'Prawo zarządu oraz możliwość korzystania z mienia wchodzącego do masy upadłości i rozporządzania nim',
      c: 'Osobowość prawną',
      d: 'Zdolność sądową'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 75 § 1 z dniem ogłoszenia upadłości upadły traci prawo zarządu oraz możliwość korzystania z mienia wchodzącego do masy upadłości i rozporządzania nim.',
    difficulty: 'medium',
    tags: ['utrata zarządu', 'masa upadłości']
  },

  {
    id: 'pu-048',
    article: 'Art. 77 § 1',
    articleTitle: 'Nieważność czynności upadłego',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'Czynności prawne upadłego dotyczące mienia wchodzącego do masy upadłości są:',
    options: {
      a: 'Ważne',
      b: 'Nieważne',
      c: 'Bezskuteczne zawieszone',
      d: 'Skuteczne wobec syndyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 77 § 1 czynności prawne upadłego dotyczące mienia wchodzącego do masy upadłości są nieważne.',
    difficulty: 'easy',
    tags: ['nieważność', 'czynności upadłego']
  },

  {
    id: 'pu-049',
    article: 'Art. 81 § 1',
    articleTitle: 'Zakaz obciążania masy',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział II - Skutki co do majątku upadłego',
    question: 'Po ogłoszeniu upadłości NIE można obciążyć składników masy upadłości hipoteką, zastawem, zastawem rejestrowym lub hipoteką morską w celu zabezpieczenia wierzytelności powstałej:',
    options: {
      a: 'Po ogłoszeniu upadłości',
      b: 'Przed ogłoszeniem upadłości',
      c: 'W toku postępowania upadłościowego',
      d: 'W związku z postępowaniem upadłościowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 81 § 1 po ogłoszeniu upadłości nie można obciążyć składników masy upadłości hipoteką, zastawem, zastawem rejestrowym, zastawem skarbowym lub hipoteką morską w celu zabezpieczenia wierzytelności powstałej przed ogłoszeniem upadłości.',
    difficulty: 'hard',
    tags: ['zakaz obciążania', 'hipoteka', 'zastaw']
  },

  // ============================================================
  // SKUTKI CO DO ZOBOWIĄZAŃ UPADŁEGO
  // ============================================================

  {
    id: 'pu-050',
    article: 'Art. 83',
    articleTitle: 'Nieważność klauzul ipso facto',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Postanowienia umowy zastrzegające na wypadek ogłoszenia upadłości zmianę lub rozwiązanie stosunku prawnego, którego stroną jest upadły, są:',
    options: {
      a: 'Ważne',
      b: 'Nieważne',
      c: 'Bezskuteczne',
      d: 'Skuteczne pod warunkiem zgody syndyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 83 postanowienia umowy zastrzegające na wypadek złożenia wniosku o ogłoszenie upadłości lub ogłoszenia upadłości zmianę lub rozwiązanie stosunku prawnego, którego stroną jest upadły, są nieważne (zakaz klauzul ipso facto).',
    difficulty: 'hard',
    tags: ['klauzule ipso facto', 'nieważność']
  },

  {
    id: 'pu-051',
    article: 'Art. 91 § 1',
    articleTitle: 'Wymagalność zobowiązań',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Zobowiązania pieniężne upadłego, których termin płatności świadczenia jeszcze nie nastąpił:',
    options: {
      a: 'Pozostają niewymagalne',
      b: 'Stają się wymagalne z dniem ogłoszenia upadłości',
      c: 'Wygasają',
      d: 'Podlegają umorzeniu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 91 § 1 zobowiązania pieniężne upadłego, których termin płatności świadczenia jeszcze nie nastąpił, stają się wymagalne z dniem ogłoszenia upadłości (natychmiastowa wymagalność).',
    difficulty: 'medium',
    tags: ['wymagalność', 'zobowiązania']
  },

  {
    id: 'pu-052',
    article: 'Art. 93 § 1',
    articleTitle: 'Potrącenie wierzytelności',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Potrącenie wierzytelności upadłego z wierzytelnością wierzyciela jest dopuszczalne, jeżeli:',
    options: {
      a: 'Obie wierzytelności powstały po ogłoszeniu upadłości',
      b: 'Obie wierzytelności istniały w dniu ogłoszenia upadłości, chociażby termin wymagalności jednej z nich jeszcze nie nastąpił',
      c: 'Tylko wierzytelność upadłego istniała w dniu ogłoszenia upadłości',
      d: 'Syndyk wyrazi zgodę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 93 § 1 potrącenie wierzytelności upadłego z wierzytelnością wierzyciela jest dopuszczalne, jeżeli obie wierzytelności istniały w dniu ogłoszenia upadłości, chociażby termin wymagalności jednej z nich jeszcze nie nastąpił.',
    difficulty: 'hard',
    tags: ['potrącenie', 'wierzytelności']
  },

  {
    id: 'pu-053',
    article: 'Art. 96',
    articleTitle: 'Oświadczenie o potrąceniu',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Wierzyciel, który chce skorzystać z prawa potrącenia, składa o tym oświadczenie:',
    options: {
      a: 'W dowolnym terminie',
      b: 'Nie później niż przy zgłoszeniu wierzytelności',
      c: 'W ciągu 30 dni od ogłoszenia upadłości',
      d: 'Po zakończeniu postępowania upadłościowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 96 wierzyciel, który chce skorzystać z prawa potrącenia, składa o tym oświadczenie nie później niż przy zgłoszeniu wierzytelności.',
    difficulty: 'hard',
    tags: ['potrącenie', 'termin', 'zgłoszenie wierzytelności']
  },

  {
    id: 'pu-054',
    article: 'Art. 98 § 1',
    articleTitle: 'Umowy wzajemne - odstąpienie syndyka',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Jeżeli w dniu ogłoszenia upadłości zobowiązania z umowy wzajemnej nie zostały wykonane w całości lub części, syndyk może:',
    options: {
      a: 'Tylko wykonać umowę',
      b: 'Za zgodą sędziego-komisarza wykonać zobowiązanie upadłego i zażądać od drugiej strony spełnienia świadczenia wzajemnego lub od umowy odstąpić',
      c: 'Tylko odstąpić od umowy',
      d: 'Żądać zmiany umowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 98 § 1 jeżeli w dniu ogłoszenia upadłości zobowiązania z umowy wzajemnej nie zostały wykonane w całości lub części, syndyk może, za zgodą sędziego-komisarza, wykonać zobowiązanie upadłego i zażądać od drugiej strony spełnienia świadczenia wzajemnego lub od umowy odstąpić ze skutkiem na dzień ogłoszenia upadłości.',
    difficulty: 'hard',
    tags: ['umowy wzajemne', 'odstąpienie', 'syndyk']
  },

  {
    id: 'pu-055',
    article: 'Art. 98 § 2',
    articleTitle: 'Żądanie drugiej strony umowy',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Na żądanie drugiej strony umowy wzajemnej złożone w formie pisemnej z datą pewną, syndyk w terminie trzech miesięcy oświadczy na piśmie, czy od umowy odstępuje, czy też żąda jej wykonania. Niezłożenie w tym terminie oświadczenia uważa się za:',
    options: {
      a: 'Żądanie wykonania umowy',
      b: 'Odstąpienie od umowy',
      c: 'Zawieszenie umowy',
      d: 'Nieważność umowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 98 § 2 na żądanie drugiej strony złożone w formie pisemnej z datą pewną, syndyk w terminie trzech miesięcy oświadczy na piśmie, czy od umowy odstępuje, czy też żąda jej wykonania. Niezłożenie w tym terminie oświadczenia przez syndyka uważa się za odstąpienie od umowy.',
    difficulty: 'hard',
    tags: ['umowy wzajemne', 'termin', '3 miesiące', 'liczby']
  },

  {
    id: 'pu-056',
    article: 'Art. 102 § 1',
    articleTitle: 'Wygaśnięcie umowy zlecenia',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Zawarte przez upadłego umowy zlecenia lub komisu, w których upadły był dającym zlecenie lub komitentem:',
    options: {
      a: 'Trwają nadal',
      b: 'Wygasają z dniem ogłoszenia upadłości',
      c: 'Wymagają zatwierdzenia syndyka',
      d: 'Podlegają zmianie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 102 § 1 zawarte przez upadłego umowy zlecenia lub komisu, w których upadły był dającym zlecenie lub komitentem, a także umowy o zarządzanie papierami wartościowymi upadłego wygasają z dniem ogłoszenia upadłości.',
    difficulty: 'medium',
    tags: ['zlecenie', 'wygaśnięcie', 'skutki upadłości']
  },

  {
    id: 'pu-057',
    article: 'Art. 111 § 1',
    articleTitle: 'Wygaśnięcie umowy kredytu',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 2 - Skutki co do zobowiązań upadłego',
    question: 'Z dniem ogłoszenia upadłości umowa kredytu wygasa, jeżeli przed tym terminem kredytodawca:',
    options: {
      a: 'Przekazał środki pieniężne do dyspozycji upadłego',
      b: 'Nie przekazał środków pieniężnych do dyspozycji upadłego',
      c: 'Wypowiedział umowę',
      d: 'Wniósł o ogłoszenie upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 111 § 1 z dniem ogłoszenia upadłości umowa kredytu wygasa, jeżeli przed tym terminem kredytodawca nie przekazał środków pieniężnych do dyspozycji upadłego.',
    difficulty: 'hard',
    tags: ['kredyt', 'wygaśnięcie', 'skutki upadłości']
  },

  // ============================================================
  // STOSUNKI MAJĄTKOWE MAŁŻEŃSKIE
  // ============================================================

  {
    id: 'pu-058',
    article: 'Art. 124 § 1',
    articleTitle: 'Powstanie rozdzielności majątkowej',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 4 - Wpływ na stosunki majątkowe małżeńskie',
    question: 'Z dniem ogłoszenia upadłości jednego z małżonków:',
    options: {
      a: 'Wspólność majątkowa trwa nadal',
      b: 'Powstaje między małżonkami rozdzielność majątkowa',
      c: 'Majątek wspólny jest wyłączony z masy upadłości',
      d: 'Małżonek upadłego przejmuje zarząd majątkiem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 124 § 1 z dniem ogłoszenia upadłości jednego z małżonków powstaje między małżonkami rozdzielność majątkowa. Jeżeli małżonkowie pozostawali w ustroju wspólności majątkowej, majątek wspólny małżonków wchodzi do masy upadłości, a jego podział jest niedopuszczalny.',
    difficulty: 'medium',
    tags: ['rozdzielność majątkowa', 'małżonkowie']
  },

  {
    id: 'pu-059',
    article: 'Art. 125 § 1',
    articleTitle: 'Bezskuteczność ustanowienia rozdzielności',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 4 - Wpływ na stosunki majątkowe małżeńskie',
    question: 'Ustanowienie rozdzielności majątkowej na podstawie orzeczenia sądu w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości jest:',
    options: {
      a: 'Skuteczne',
      b: 'Bezskuteczne w stosunku do masy upadłości, chyba że pozew został złożony co najmniej dwa lata przed dniem złożenia wniosku o ogłoszenie upadłości',
      c: 'Nieważne',
      d: 'Wzruszalne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 125 § 1 ustanowienie rozdzielności majątkowej na podstawie orzeczenia sądu w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości jest bezskuteczne w stosunku do masy upadłości, chyba że pozew o ustanowienie rozdzielności majątkowej został złożony co najmniej na dwa lata przed dniem złożenia wniosku o ogłoszenie upadłości.',
    difficulty: 'hard',
    tags: ['rozdzielność majątkowa', 'bezskuteczność', 'rok', '2 lata', 'liczby']
  },

  {
    id: 'pu-060',
    article: 'Art. 126 § 1',
    articleTitle: 'Skuteczność umowy majątkowej małżeńskiej',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 4 - Wpływ na stosunki majątkowe małżeńskie',
    question: 'Ustanowienie rozdzielności majątkowej umową majątkową jest skuteczne w stosunku do masy upadłości tylko wtedy, gdy umowa zawarta została:',
    options: {
      a: 'Co najmniej rok przed dniem złożenia wniosku o ogłoszenie upadłości',
      b: 'Co najmniej dwa lata przed dniem złożenia wniosku o ogłoszenie upadłości',
      c: 'Co najmniej trzy lata przed dniem złożenia wniosku o ogłoszenie upadłości',
      d: 'Co najmniej sześć miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 126 § 1 ustanowienie rozdzielności majątkowej umową majątkową jest skuteczne w stosunku do masy upadłości tylko wtedy, gdy umowa zawarta została co najmniej dwa lata przed dniem złożenia wniosku o ogłoszenie upadłości.',
    difficulty: 'hard',
    tags: ['rozdzielność majątkowa', 'umowa', '2 lata', 'liczby']
  },

  // ============================================================
  // BEZSKUTECZNOŚĆ I ZASKARŻANIE CZYNNOŚCI
  // ============================================================

  {
    id: 'pu-061',
    article: 'Art. 127 § 1',
    articleTitle: 'Bezskuteczność czynności nieodpłatnych',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział III - Bezskuteczność i zaskarżanie czynności upadłego',
    question: 'Bezskuteczne w stosunku do masy upadłości są czynności prawne dokonane przez upadłego w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości, którymi rozporządził on swoim majątkiem:',
    options: {
      a: 'Odpłatnie po cenie rynkowej',
      b: 'Nieodpłatnie albo odpłatnie, ale wartość świadczenia upadłego przewyższa w rażącym stopniu wartość świadczenia otrzymanego',
      c: 'Na rzecz wierzycieli',
      d: 'Na rzecz Skarbu Państwa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 127 § 1 bezskuteczne w stosunku do masy upadłości są czynności prawne dokonane przez upadłego w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości, którymi rozporządził on swoim majątkiem, jeżeli dokonane zostały nieodpłatnie albo odpłatnie, ale wartość świadczenia upadłego przewyższa w rażącym stopniu wartość świadczenia otrzymanego przez upadłego.',
    difficulty: 'hard',
    tags: ['bezskuteczność', 'czynności nieodpłatne', 'rok']
  },

  {
    id: 'pu-062',
    article: 'Art. 127 § 3',
    articleTitle: 'Bezskuteczność zapłaty długu niewymagalnego',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział III - Bezskuteczność i zaskarżanie czynności upadłego',
    question: 'Bezskuteczne są zabezpieczenie i zapłata długu niewymagalnego dokonane przez upadłego w ciągu:',
    options: {
      a: 'Trzech miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości',
      b: 'Sześciu miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości',
      c: 'Roku przed dniem złożenia wniosku o ogłoszenie upadłości',
      d: 'Dwóch lat przed dniem złożenia wniosku o ogłoszenie upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 127 § 3 bezskuteczne są również zabezpieczenie i zapłata długu niewymagalnego dokonane przez upadłego w ciągu sześciu miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości.',
    difficulty: 'hard',
    tags: ['bezskuteczność', 'dług niewymagalny', '6 miesięcy', 'liczby']
  },

  {
    id: 'pu-063',
    article: 'Art. 128 § 1',
    articleTitle: 'Bezskuteczność czynności z osobami bliskimi',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział III - Bezskuteczność i zaskarżanie czynności upadłego',
    question: 'Sędzia-komisarz może uznać za bezskuteczną w stosunku do masy upadłości odpłatną czynność prawną dokonaną przez upadłego w terminie sześciu miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości z:',
    options: {
      a: 'Dowolnym kontrahentem',
      b: 'Małżonkiem, krewnymi lub powinowatymi w linii prostej, krewnymi lub powinowatymi w linii bocznej do drugiego stopnia włącznie, osobą pozostającą z upadłym w faktycznym związku',
      c: 'Tylko z małżonkiem',
      d: 'Tylko ze wspólnikami'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 128 § 1 sędzia-komisarz z urzędu albo na wniosek syndyka uzna za bezskuteczną w stosunku do masy upadłości odpłatną czynność prawną dokonaną przez upadłego w terminie sześciu miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości z małżonkiem, krewnym lub powinowatym w linii prostej, krewnym lub powinowatym w linii bocznej do drugiego stopnia włącznie, z osobą pozostającą z upadłym w faktycznym związku, prowadzącą z nim wspólnie gospodarstwo domowe albo z przysposobionym lub przysposabiającym.',
    difficulty: 'hard',
    tags: ['bezskuteczność', 'osoby bliskie', '6 miesięcy', 'liczby']
  },

  {
    id: 'pu-064',
    article: 'Art. 132 § 3',
    articleTitle: 'Termin na zaskarżenie czynności',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Dział III - Bezskuteczność i zaskarżanie czynności upadłego',
    question: 'Nie można żądać uznania czynności za bezskuteczną po upływie:',
    options: {
      a: 'Roku od dnia ogłoszenia upadłości',
      b: 'Dwóch lat od dnia ogłoszenia upadłości',
      c: 'Trzech lat od dnia ogłoszenia upadłości',
      d: 'Pięciu lat od dnia ogłoszenia upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 132 § 3 nie można żądać uznania czynności za bezskuteczną po upływie dwóch lat od dnia ogłoszenia upadłości, chyba że na podstawie przepisów Kodeksu cywilnego uprawnienie to wygasło wcześniej.',
    difficulty: 'hard',
    tags: ['bezskuteczność', 'termin', '2 lata', 'liczby']
  },

  // ============================================================
  // KATEGORIE NALEŻNOŚCI
  // ============================================================

  {
    id: 'pu-065',
    article: 'Art. 342 § 1',
    articleTitle: 'Kategorie należności',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Wierzytelności i należności podlegające zaspokojeniu z funduszów masy upadłości dzieli się na:',
    options: {
      a: 'Trzy kategorie',
      b: 'Cztery kategorie',
      c: 'Pięć kategorii',
      d: 'Sześć kategorii'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 342 § 1 wierzytelności i należności podlegające zaspokojeniu z funduszów masy upadłości dzieli się na cztery kategorie.',
    difficulty: 'medium',
    tags: ['kategorie należności', 'podział funduszów']
  },

  {
    id: 'pu-066',
    article: 'Art. 342 § 1 pkt 1',
    articleTitle: 'Kategoria pierwsza',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Do kategorii pierwszej należności zalicza się:',
    options: {
      a: 'Wierzytelności zabezpieczone hipoteką',
      b: 'Należności ze stosunku pracy, należności rolników za produkty rolne, alimenty, renty z tytułu odszkodowania za wywołanie choroby, niezdolności do pracy, kalectwa lub śmierci oraz z tytułu zamiany uprawnień objętych treścią prawa dożywocia na dożywotnią rentę',
      c: 'Wierzytelności z tytułu kredytów bankowych',
      d: 'Podatki i inne daniny publiczne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 342 § 1 pkt 1 kategoria pierwsza obejmuje należności ze stosunku pracy, należności rolników za produkty z własnego gospodarstwa rolnego, alimenty, renty z tytułu odszkodowania za wywołanie choroby, niezdolności do pracy, kalectwa lub śmierci oraz z tytułu zamiany uprawnień objętych treścią prawa dożywocia na dożywotnią rentę.',
    difficulty: 'hard',
    tags: ['kategoria pierwsza', 'należności pracownicze', 'alimenty']
  },

  {
    id: 'pu-067',
    article: 'Art. 342 § 1 pkt 2',
    articleTitle: 'Kategoria druga',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Do kategorii drugiej należności zalicza się:',
    options: {
      a: 'Należności ze stosunku pracy',
      b: 'Inne należności, jeżeli nie podlegają zaspokojeniu w innych kategoriach, w szczególności podatki i inne daniny publiczne, składki na ubezpieczenie społeczne',
      c: 'Odsetki od wierzytelności',
      d: 'Wierzytelności wspólników z tytułu pożyczek'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 342 § 1 pkt 2 kategoria druga obejmuje inne należności, jeżeli nie podlegają zaspokojeniu w innych kategoriach, w szczególności podatki i inne daniny publiczne oraz pozostałe należności z tytułu składek na ubezpieczenie społeczne.',
    difficulty: 'hard',
    tags: ['kategoria druga', 'podatki', 'składki ZUS']
  },

  {
    id: 'pu-068',
    article: 'Art. 342 § 1 pkt 3',
    articleTitle: 'Kategoria trzecia',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Do kategorii trzeciej należności zalicza się:',
    options: {
      a: 'Należności ze stosunku pracy',
      b: 'Odsetki od należności ujętych w wyższych kategoriach, jeżeli nie podlegają zaspokojeniu w innych kategoriach, oraz sądowe i administracyjne kary grzywny, należności z tytułu darowizn i zapisów',
      c: 'Wierzytelności zabezpieczone hipoteką',
      d: 'Podatki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 342 § 1 pkt 3 kategoria trzecia obejmuje odsetki od należności ujętych w wyższych kategoriach w kolejności, w jakiej podlega zaspokojeniu kapitał, a także sądowe i administracyjne kary grzywny oraz należności z tytułu darowizn i zapisów.',
    difficulty: 'hard',
    tags: ['kategoria trzecia', 'odsetki', 'grzywny']
  },

  {
    id: 'pu-069',
    article: 'Art. 342 § 1 pkt 4',
    articleTitle: 'Kategoria czwarta',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Do kategorii czwartej należności zalicza się:',
    options: {
      a: 'Należności ze stosunku pracy',
      b: 'Należności wspólników albo akcjonariuszy z tytułu pożyczki lub innej czynności prawnej o podobnych skutkach',
      c: 'Wierzytelności zabezpieczone hipoteką',
      d: 'Podatki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 342 § 1 pkt 4 kategoria czwarta obejmuje należności wspólników albo akcjonariuszy z tytułu pożyczki lub innej czynności prawnej o podobnych skutkach, w szczególności dostawy towaru z odroczonym terminem płatności, dokonanej na rzecz upadłego będącego spółką kapitałową w okresie pięciu lat przed ogłoszeniem upadłości, wraz z odsetkami.',
    difficulty: 'hard',
    tags: ['kategoria czwarta', 'pożyczki wspólników']
  },

  {
    id: 'pu-070',
    article: 'Art. 344',
    articleTitle: 'Kolejność zaspokajania kategorii',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Kolejność zaspokajania kategorii należności w postępowaniu upadłościowym jest następująca:',
    options: {
      a: 'Wszystkie kategorie zaspokajane są równomiernie (pro rata)',
      b: 'Wierzytelności kolejnej kategorii zaspokaja się dopiero po zaspokojeniu w całości wierzytelności poprzedzającej kategorii',
      c: 'Decyduje kolejność zgłoszenia wierzytelności',
      d: 'Decyduje wysokość wierzytelności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 344 wierzytelności kolejnej kategorii zaspokaja się dopiero po zaspokojeniu w całości wierzytelności poprzedzającej kategorii, a jeżeli suma przeznaczona do podziału nie wystarcza na zaspokojenie w całości wierzytelności danej kategorii, należności tej kategorii zaspokaja się proporcjonalnie do wysokości każdej z nich.',
    difficulty: 'medium',
    tags: ['kolejność zaspokajania', 'kategorie']
  },

  // ============================================================
  // ZAKAZ PROWADZENIA DZIAŁALNOŚCI GOSPODARCZEJ
  // ============================================================

  {
    id: 'pu-071',
    article: 'Art. 373 § 1',
    articleTitle: 'Przesłanki zakazu prowadzenia działalności',
    section: 'Część trzecia',
    subsection: 'Tytuł IV - Zakaz prowadzenia działalności gospodarczej',
    question: 'Sąd może orzec pozbawienie na okres od jednego do dziesięciu lat prawa prowadzenia działalności gospodarczej na własny rachunek lub w ramach spółki cywilnej wobec osoby, która ze swojej winy:',
    options: {
      a: 'Ogłosiła upadłość',
      b: 'Będąc do tego zobowiązana z mocy ustawy, nie złożyła w ustawowym terminie wniosku o ogłoszenie upadłości',
      c: 'Prowadziła działalność gospodarczą',
      d: 'Miała długi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 373 § 1 sąd może orzec pozbawienie na okres od jednego do dziesięciu lat prawa prowadzenia działalności gospodarczej wobec osoby, która ze swojej winy, będąc do tego zobowiązana z mocy ustawy, nie złożyła w ustawowym terminie wniosku o ogłoszenie upadłości.',
    difficulty: 'hard',
    tags: ['zakaz działalności', '1-10 lat', 'liczby']
  },

  {
    id: 'pu-072',
    article: 'Art. 373 § 1',
    articleTitle: 'Zakres zakazu prowadzenia działalności',
    section: 'Część trzecia',
    subsection: 'Tytuł IV - Zakaz prowadzenia działalności gospodarczej',
    question: 'Zakaz prowadzenia działalności gospodarczej obejmuje pozbawienie prawa:',
    options: {
      a: 'Tylko prowadzenia działalności na własny rachunek',
      b: 'Prowadzenia działalności gospodarczej na własny rachunek lub w ramach spółki cywilnej oraz pełnienia funkcji członka rady nadzorczej, członka komisji rewizyjnej, reprezentanta lub pełnomocnika osoby fizycznej prowadzącej działalność gospodarczą, spółki handlowej, przedsiębiorstwa państwowego, spółdzielni, fundacji lub stowarzyszenia',
      c: 'Tylko pełnienia funkcji w organach spółek',
      d: 'Tylko zatrudnienia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 373 § 1 zakaz obejmuje pozbawienie prawa prowadzenia działalności gospodarczej na własny rachunek lub w ramach spółki cywilnej oraz pełnienia funkcji członka rady nadzorczej, członka komisji rewizyjnej, reprezentanta lub pełnomocnika osoby fizycznej prowadzącej działalność gospodarczą, spółki handlowej, przedsiębiorstwa państwowego, spółdzielni, fundacji lub stowarzyszenia.',
    difficulty: 'hard',
    tags: ['zakaz działalności', 'zakres']
  },

  {
    id: 'pu-073',
    article: 'Art. 377',
    articleTitle: 'Termin na złożenie wniosku o zakaz',
    section: 'Część trzecia',
    subsection: 'Tytuł IV - Zakaz prowadzenia działalności gospodarczej',
    question: 'Nie orzeka się zakazu prowadzenia działalności gospodarczej, jeżeli od dnia umorzenia lub zakończenia postępowania upadłościowego albo oddalenia wniosku o ogłoszenie upadłości upłynęły:',
    options: {
      a: 'Rok',
      b: 'Dwa lata',
      c: 'Trzy lata',
      d: 'Pięć lat'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 377 nie orzeka się zakazu prowadzenia działalności gospodarczej, jeżeli postępowanie w tej sprawie nie zostało wszczęte w terminie roku od dnia umorzenia lub zakończenia postępowania upadłościowego albo oddalenia wniosku o ogłoszenie upadłości lub jeżeli od dnia umorzenia lub zakończenia postępowania upadłościowego albo oddalenia wniosku o ogłoszenie upadłości upłynęły trzy lata.',
    difficulty: 'hard',
    tags: ['zakaz działalności', 'termin', '3 lata', 'liczby']
  },

  // ============================================================
  // RELACJA Z POSTĘPOWANIEM RESTRUKTURYZACYJNYM
  // ============================================================

  {
    id: 'pu-074',
    article: 'Art. 9a § 1',
    articleTitle: 'Niedopuszczalność ogłoszenia upadłości w toku restrukturyzacji',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'Nie można ogłosić upadłości w okresie od dnia otwarcia przyspieszonego postępowania układowego, postępowania układowego i postępowania sanacyjnego do dnia:',
    options: {
      a: 'Rozpoczęcia wykonania układu',
      b: 'Zakończenia albo prawomocnego umorzenia tego postępowania',
      c: 'Uprawomocnienia się postanowienia o otwarciu postępowania',
      d: 'Zatwierdzenia układu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 9a § 1 nie można ogłosić upadłości w okresie od dnia otwarcia przyspieszonego postępowania układowego, postępowania układowego i postępowania sanacyjnego do dnia zakończenia albo prawomocnego umorzenia tego postępowania.',
    difficulty: 'hard',
    tags: ['restrukturyzacja', 'zbieg postępowań']
  },

  {
    id: 'pu-075',
    article: 'Art. 9b § 1',
    articleTitle: 'Pierwszeństwo wniosku restrukturyzacyjnego',
    section: 'Część pierwsza - Przepisy ogólne',
    subsection: 'Dział II - Podmiotowy zakres stosowania ustawy',
    question: 'W przypadku złożenia wniosku o ogłoszenie upadłości i wniosku restrukturyzacyjnego, w pierwszej kolejności rozpoznaje się:',
    options: {
      a: 'Wniosek o ogłoszenie upadłości',
      b: 'Wniosek restrukturyzacyjny',
      c: 'Wniosek złożony wcześniej',
      d: 'Oba wnioski równocześnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 9b § 1 w przypadku złożenia wniosku o ogłoszenie upadłości i wniosku restrukturyzacyjnego, w pierwszej kolejności rozpoznaje się wniosek restrukturyzacyjny.',
    difficulty: 'medium',
    tags: ['restrukturyzacja', 'pierwszeństwo', 'zbieg wniosków']
  },

  // ============================================================
  // UZUPEŁNIAJĄCE - SPADKI I INNE
  // ============================================================

  {
    id: 'pu-076',
    article: 'Art. 119 § 1',
    articleTitle: 'Spadek nabyty przez upadłego',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 3 - Skutki co do spadków',
    question: 'Jeżeli do spadku otwartego po dniu ogłoszenia upadłości powołany zostaje upadły:',
    options: {
      a: 'Upadły może odrzucić spadek',
      b: 'Spadek wchodzi do masy upadłości, syndyk nie składa oświadczenia o przyjęciu spadku, a spadek uważa się za przyjęty z dobrodziejstwem inwentarza',
      c: 'Spadek nie wchodzi do masy upadłości',
      d: 'Syndyk musi przyjąć spadek wprost'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 119 § 1 jeżeli do spadku otwartego po dniu ogłoszenia upadłości powołany zostaje upadły, spadek wchodzi do masy upadłości. Syndyk nie składa oświadczenia o przyjęciu spadku, a spadek uważa się za przyjęty z dobrodziejstwem inwentarza.',
    difficulty: 'hard',
    tags: ['spadek', 'masa upadłości', 'dobrodziejstwo inwentarza']
  },

  {
    id: 'pu-077',
    article: 'Art. 123',
    articleTitle: 'Bezskuteczność odrzucenia spadku',
    section: 'Część pierwsza - Skutki ogłoszenia upadłości',
    subsection: 'Rozdział 3 - Skutki co do spadków',
    question: 'Oświadczenie upadłego o odrzuceniu spadku lub zapisu windykacyjnego złożone po ogłoszeniu upadłości jest:',
    options: {
      a: 'Ważne',
      b: 'Bezskuteczne w stosunku do masy upadłości',
      c: 'Nieważne',
      d: 'Skuteczne pod warunkiem zgody syndyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 123 oświadczenie upadłego o odrzuceniu spadku lub zapisu windykacyjnego jest bezskuteczne w stosunku do masy upadłości, jeżeli zostało złożone po ogłoszeniu upadłości.',
    difficulty: 'hard',
    tags: ['spadek', 'odrzucenie', 'bezskuteczność']
  },

  {
    id: 'pu-078',
    article: 'Art. 345 § 1',
    articleTitle: 'Wierzytelności zabezpieczone rzeczowo',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Likwidacja masy upadłości',
    question: 'Wierzytelności zabezpieczone hipoteką, zastawem, zastawem rejestrowym, zastawem skarbowym lub hipoteką morską, a także prawa oraz roszczenia ciążące na nieruchomości, użytkowaniu wieczystym, spółdzielczym własnościowym prawie do lokalu lub statku morskim wpisanym do rejestru okrętowego, podlegają zaspokojeniu:',
    options: {
      a: 'W pierwszej kategorii',
      b: 'Z sumy uzyskanej ze sprzedaży obciążonego przedmiotu, pomniejszonej o koszty likwidacji oraz inne koszty postępowania upadłościowego w wysokości nieprzekraczającej dziesiątej części sumy uzyskanej z likwidacji',
      c: 'Na końcu postępowania',
      d: 'W drugiej kategorii'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 345 § 1 wierzytelności zabezpieczone rzeczowo podlegają zaspokojeniu z sumy uzyskanej ze sprzedaży obciążonego przedmiotu, pomniejszonej o koszty likwidacji tego przedmiotu oraz inne koszty postępowania upadłościowego w wysokości nieprzekraczającej dziesiątej części sumy uzyskanej z likwidacji, nie więcej jednak niż o taką część kosztów postępowania upadłościowego, która wynika ze stosunku wartości obciążonego przedmiotu do wartości całej masy upadłości.',
    difficulty: 'hard',
    tags: ['zabezpieczenie rzeczowe', 'hipoteka', 'zastaw']
  },

  {
    id: 'pu-079',
    article: 'Art. 369',
    articleTitle: 'Umorzenie zobowiązań upadłego',
    section: 'Część trzecia',
    subsection: 'Tytuł III - Zakończenie i umorzenie postępowania',
    question: 'Sąd może umorzyć całość lub część zobowiązań upadłego, które nie zostały zaspokojone w postępowaniu upadłościowym:',
    options: {
      a: 'Zawsze automatycznie',
      b: 'Jeżeli upadły jest osobą fizyczną i wykona plan spłaty wierzycieli lub jeżeli osobista sytuacja upadłego wskazuje, że nie byłby on zdolny do dokonania jakichkolwiek spłat',
      c: 'Tylko na wniosek wierzycieli',
      d: 'Nigdy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 369 i nast. sąd może umorzyć całość lub część zobowiązań upadłego, które nie zostały zaspokojone w postępowaniu upadłościowym - w przypadku osób fizycznych poprzez ustalenie i wykonanie planu spłaty wierzycieli lub poprzez umorzenie zobowiązań bez ustalenia planu spłaty, jeżeli sytuacja upadłego wskazuje na brak zdolności do spłat.',
    difficulty: 'hard',
    tags: ['umorzenie zobowiązań', 'osoba fizyczna', 'plan spłaty']
  },

  {
    id: 'pu-080',
    article: 'Porównanie',
    articleTitle: 'Kluczowe liczby i terminy',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie terminów i liczb z Prawa upadłościowego jest PRAWIDŁOWE?',
    options: {
      a: 'Termin na złożenie wniosku przez dłużnika: 14 dni, domniemanie niewypłacalności: 2 miesiące opóźnienia',
      b: 'Termin na złożenie wniosku przez dłużnika: 30 dni, domniemanie niewypłacalności: 3 miesiące opóźnienia, przesłanka bilansowa: 24 miesiące nadmiernego zadłużenia',
      c: 'Termin na złożenie wniosku przez dłużnika: 60 dni, domniemanie niewypłacalności: 6 miesięcy opóźnienia',
      d: 'Termin na złożenie wniosku przez dłużnika: 30 dni, domniemanie niewypłacalności: 1 miesiąc opóźnienia'
    },
    correct: 'b',
    explanation: 'Prawidłowe zestawienie: termin na złożenie wniosku przez dłużnika to 30 dni (art. 21 § 1), domniemanie utraty zdolności płatniczej powstaje po 3 miesiącach opóźnienia (art. 11 § 1a), przesłanka bilansowa wymaga utrzymywania się nadmiernego zadłużenia przez 24 miesiące (art. 11 § 2).',
    difficulty: 'hard',
    tags: ['podsumowanie', 'liczby', 'terminy']
  }

];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PRAWO_UPADLOSCIOWE_PART1_STATS = {
  totalQuestions: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.length,
  byDifficulty: {
    easy: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.difficulty === 'easy').length,
    medium: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.difficulty === 'medium').length,
    hard: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    przepisyOgolne: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.section.includes('Przepisy ogólne')).length,
    skutkiUpadlosci: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.section.includes('Skutki')).length,
    kategorie: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.tags.includes('kategori')).length,
    bezskutecznosc: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART1.filter(q => q.tags.includes('bezskuteczność')).length,
  },
  keyNumbers: {
    terminZlozenia: '30 dni',
    domniemanieNiewypłacalności: '3 miesiące',
    przesłankaBilansowa: '24 miesiące',
    terminWydaniaPostanowienia: '2 miesiące',
    terminZgloszeniaWierzytelnosci: '30 dni',
    wadiumPrePack: '1/10 ceny',
    terminUmowyPrePack: '30 dni',
    terminOdstapieniaOdUmowy: '3 miesiące',
    bezskutecznoscCzynnosciNieodplatnych: '1 rok',
    bezskutecznoscDługNiewymagalny: '6 miesięcy',
    bezskutecznoscOsobyBliskie: '6 miesięcy',
    terminZaskarzenia: '2 lata',
    zakazDzialalnosci: '1-10 lat',
    terminNaZakazDzialalnosci: '3 lata',
    upadloscPoSmierci: '1 rok',
    upadloscPoZakonczeniuDzialalnosci: '1 rok',
    skutecznoscRozdzielnosciUmownej: '2 lata',
  }
};

console.log('Prawo upadłościowe Part 1 loaded:', PRAWO_UPADLOSCIOWE_PART1_STATS);
