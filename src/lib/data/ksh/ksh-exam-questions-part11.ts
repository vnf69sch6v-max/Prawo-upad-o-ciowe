// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 11 - 80 pytań: PSA i PRZEKSZTAŁCENIA
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART11: ExamQuestion[] = [

  // ============================================================
  // PROSTA SPÓŁKA AKCYJNA (PSA) - PODSTAWY
  // ============================================================

  {
    id: 'ksh-821',
    article: 'Art. 300¹ § 1',
    articleTitle: 'Definicja PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Prosta spółka akcyjna może być utworzona przez:',
    options: {
      a: 'Co najmniej dwóch założycieli',
      b: 'Jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej',
      c: 'Tylko osoby prawne',
      d: 'Co najmniej trzech założycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹ § 1 k.s.h. prosta spółka akcyjna może być utworzona przez jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej.',
    difficulty: 'easy',
    tags: ['PSA', 'utworzenie', 'założyciele']
  },

  {
    id: 'ksh-822',
    article: 'Art. 300¹ § 2',
    articleTitle: 'Zakaz tworzenia przez jednoosobową sp. z o.o.',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Prosta spółka akcyjna NIE może być zawiązana wyłącznie przez:',
    options: {
      a: 'Osoby fizyczne',
      b: 'Jednoosobową spółkę z ograniczoną odpowiedzialnością',
      c: 'Spółkę akcyjną',
      d: 'Fundację'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹ § 2 k.s.h. prosta spółka akcyjna nie może być zawiązana wyłącznie przez jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['PSA', 'zakaz', 'jednoosobowa sp. z o.o.']
  },

  {
    id: 'ksh-823',
    article: 'Art. 300³ § 1',
    articleTitle: 'Kapitał akcyjny PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalna wysokość kapitału akcyjnego prostej spółki akcyjnej wynosi:',
    options: {
      a: '5.000 zł',
      b: '1.000 zł',
      c: '1 zł',
      d: '100 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300³ § 1 k.s.h. kapitał akcyjny powinien wynosić co najmniej 1 złoty.',
    difficulty: 'easy',
    tags: ['PSA', 'kapitał akcyjny', 'minimum', 'liczby']
  },

  {
    id: 'ksh-824',
    article: 'Art. 300³ § 2',
    articleTitle: 'Kapitał akcyjny a wartość nominalna',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje prostej spółki akcyjnej:',
    options: {
      a: 'Mają wartość nominalną',
      b: 'Nie mają wartości nominalnej i nie stanowią części kapitału akcyjnego',
      c: 'Mają wartość nominalną co najmniej 1 grosz',
      d: 'Mają wartość nominalną co najmniej 1 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300³ § 2 k.s.h. akcje nie mają wartości nominalnej, nie stanowią części kapitału akcyjnego i są niepodzielne.',
    difficulty: 'medium',
    tags: ['PSA', 'akcje', 'brak wartości nominalnej']
  },

  {
    id: 'ksh-825',
    article: 'Art. 300⁴',
    articleTitle: 'Odpowiedzialność za zobowiązania PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcjonariusze prostej spółki akcyjnej za zobowiązania spółki:',
    options: {
      a: 'Odpowiadają całym swoim majątkiem',
      b: 'Nie odpowiadają',
      c: 'Odpowiadają do wysokości wniesionych wkładów',
      d: 'Odpowiadają solidarnie z zarządem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁴ k.s.h. akcjonariusze nie odpowiadają za zobowiązania spółki.',
    difficulty: 'easy',
    tags: ['PSA', 'odpowiedzialność', 'akcjonariusze']
  },

  {
    id: 'ksh-826',
    article: 'Art. 300⁵ § 1',
    articleTitle: 'Forma umowy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa prostej spółki akcyjnej powinna być zawarta:',
    options: {
      a: 'W formie pisemnej',
      b: 'W formie aktu notarialnego',
      c: 'W formie pisemnej z podpisami notarialnie poświadczonymi',
      d: 'W formie dokumentowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵ § 1 k.s.h. umowa prostej spółki akcyjnej powinna być zawarta w formie aktu notarialnego.',
    difficulty: 'easy',
    tags: ['PSA', 'forma umowy', 'akt notarialny']
  },

  {
    id: 'ksh-827',
    article: 'Art. 300⁹ § 1',
    articleTitle: 'Wkłady do PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wkładem do prostej spółki akcyjnej może być:',
    options: {
      a: 'Tylko wkład pieniężny',
      b: 'Wszelki wkład mający wartość majątkową, w tym świadczenie pracy lub usług',
      c: 'Tylko wkład niepieniężny',
      d: 'Tylko nieruchomości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁹ § 1 k.s.h. wkładem niepieniężnym na pokrycie akcji może być wszelki wkład mający wartość majątkową, w szczególności świadczenie pracy lub usług.',
    difficulty: 'hard',
    tags: ['PSA', 'wkłady', 'praca', 'usługi']
  },

  {
    id: 'ksh-828',
    article: 'Art. 300⁹ § 2',
    articleTitle: 'Wkłady z pracy a kapitał akcyjny',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wkłady niepieniężne w postaci pracy lub usług do PSA:',
    options: {
      a: 'Są zaliczane na kapitał akcyjny',
      b: 'Nie są zaliczane na kapitał akcyjny',
      c: 'Są zaliczane na kapitał zapasowy',
      d: 'Są zaliczane na kapitał rezerwowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁹ § 2 k.s.h. wkłady niepieniężne niemające zdolności bilansowej (np. praca, usługi) nie są zaliczane na kapitał akcyjny.',
    difficulty: 'hard',
    tags: ['PSA', 'wkłady z pracy', 'kapitał akcyjny']
  },

  {
    id: 'ksh-829',
    article: 'Art. 300¹⁰ § 1',
    articleTitle: 'Termin wniesienia wkładów do PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wkłady do prostej spółki akcyjnej powinny zostać wniesione w całości w ciągu:',
    options: {
      a: 'Roku od dnia wpisu spółki do rejestru',
      b: 'Trzech lat od dnia wpisu spółki do rejestru',
      c: 'Sześciu miesięcy od dnia wpisu spółki do rejestru',
      d: 'Przed wpisem do rejestru'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹⁰ § 1 k.s.h. wkłady powinny zostać wniesione do spółki w całości w ciągu trzech lat od dnia wpisu spółki do rejestru.',
    difficulty: 'hard',
    tags: ['PSA', 'termin wniesienia wkładów', 'liczby']
  },

  {
    id: 'ksh-830',
    article: 'Art. 300¹² § 1',
    articleTitle: 'Warunki powstania PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania prostej spółki akcyjnej wymaga się:',
    options: {
      a: 'Tylko zawarcia umowy spółki',
      b: 'Zawarcia umowy spółki, ustanowienia organów spółki wymaganych przez ustawę lub umowę spółki, wniesienia przez akcjonariuszy wkładów na pokrycie kapitału akcyjnego co najmniej w kwocie 1 zł, wpisu do rejestru',
      c: 'Tylko wpisu do rejestru',
      d: 'Wniesienia wszystkich wkładów przed wpisem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹² § 1 k.s.h. do powstania prostej spółki akcyjnej wymaga się: zawarcia umowy spółki, ustanowienia organów spółki wymaganych przez ustawę lub umowę spółki, wniesienia przez akcjonariuszy wkładów na pokrycie kapitału akcyjnego co najmniej w kwocie określonej w art. 300³ § 1, wpisu do rejestru.',
    difficulty: 'medium',
    tags: ['PSA', 'warunki powstania']
  },

  // ============================================================
  // PSA - ORGANY
  // ============================================================

  {
    id: 'ksh-831',
    article: 'Art. 300⁵² § 1',
    articleTitle: 'Organy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'W prostej spółce akcyjnej ustanawia się:',
    options: {
      a: 'Tylko zarząd',
      b: 'Zarząd albo radę dyrektorów',
      c: 'Zarząd i radę nadzorczą',
      d: 'Tylko radę dyrektorów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵² § 1 k.s.h. w spółce ustanawia się zarząd albo radę dyrektorów.',
    difficulty: 'medium',
    tags: ['PSA', 'organy', 'zarząd', 'rada dyrektorów']
  },

  {
    id: 'ksh-832',
    article: 'Art. 300⁵³',
    articleTitle: 'Rada dyrektorów - charakter',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada dyrektorów w prostej spółce akcyjnej:',
    options: {
      a: 'Tylko prowadzi sprawy spółki',
      b: 'Prowadzi sprawy spółki, reprezentuje spółkę oraz sprawuje nadzór nad prowadzeniem spraw spółki',
      c: 'Tylko reprezentuje spółkę',
      d: 'Tylko sprawuje nadzór'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵³ k.s.h. rada dyrektorów prowadzi sprawy spółki, reprezentuje spółkę oraz sprawuje nadzór nad prowadzeniem spraw spółki.',
    difficulty: 'medium',
    tags: ['PSA', 'rada dyrektorów', 'kompetencje']
  },

  {
    id: 'ksh-833',
    article: 'Art. 300⁵⁴ § 1',
    articleTitle: 'Skład rady dyrektorów',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada dyrektorów prostej spółki akcyjnej składa się z:',
    options: {
      a: 'Co najmniej trzech dyrektorów',
      b: 'Jednego albo większej liczby dyrektorów',
      c: 'Co najmniej pięciu dyrektorów',
      d: 'Dokładnie trzech dyrektorów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵⁴ § 1 k.s.h. rada dyrektorów składa się z jednego albo większej liczby dyrektorów.',
    difficulty: 'easy',
    tags: ['PSA', 'rada dyrektorów', 'skład']
  },

  {
    id: 'ksh-834',
    article: 'Art. 300⁵⁵',
    articleTitle: 'Dyrektorzy wykonawczy i niewykonawczy',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'W radzie dyrektorów prostej spółki akcyjnej można wyodrębnić:',
    options: {
      a: 'Dyrektorów wewnętrznych i zewnętrznych',
      b: 'Dyrektorów wykonawczych i niewykonawczych',
      c: 'Dyrektorów zarządzających i nadzorujących',
      d: 'Dyrektorów operacyjnych i strategicznych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵⁵ k.s.h. umowa spółki, regulamin rady dyrektorów lub uchwała rady dyrektorów mogą delegować niektóre lub wszystkie czynności prowadzenia przedsiębiorstwa spółki na jednego dyrektora albo niektórych dyrektorów (dyrektorzy wykonawczy). Dyrektorzy niewykonawczy sprawują stały nadzór nad prowadzeniem spraw spółki.',
    difficulty: 'hard',
    tags: ['PSA', 'dyrektorzy wykonawczy', 'dyrektorzy niewykonawczy']
  },

  {
    id: 'ksh-835',
    article: 'Art. 300⁵⁶ § 1',
    articleTitle: 'Powoływanie dyrektorów',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Dyrektorów prostej spółki akcyjnej powołuje i odwołuje:',
    options: {
      a: 'Zarząd',
      b: 'Walne zgromadzenie, chyba że umowa spółki stanowi inaczej',
      c: 'Rada nadzorcza',
      d: 'Założyciele'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵⁶ § 1 k.s.h. dyrektorów powołuje i odwołuje oraz zawiesza w czynnościach z ważnych powodów walne zgromadzenie, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['PSA', 'powoływanie dyrektorów', 'walne zgromadzenie']
  },

  {
    id: 'ksh-836',
    article: 'Art. 300⁵² § 2',
    articleTitle: 'Rada nadzorcza w PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza w prostej spółce akcyjnej:',
    options: {
      a: 'Jest obligatoryjna',
      b: 'Może być ustanowiona tylko jeśli w spółce ustanowiono zarząd',
      c: 'Jest zakazana',
      d: 'Może być ustanowiona tylko za zgodą sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵² § 2 k.s.h. w przypadku ustanowienia zarządu można ustanowić również radę nadzorczą. W przypadku ustanowienia rady dyrektorów nie można ustanowić rady nadzorczej.',
    difficulty: 'hard',
    tags: ['PSA', 'rada nadzorcza', 'fakultatywna']
  },

  {
    id: 'ksh-837',
    article: 'Art. 300⁷⁵ § 1',
    articleTitle: 'Walne zgromadzenie PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały walnego zgromadzenia prostej spółki akcyjnej, poza przypadkami określonymi w ustawie, wymagane są w sprawach:',
    options: {
      a: 'Każdej czynności zarządu',
      b: 'Rozpatrzenia i zatwierdzenia sprawozdania zarządu/rady dyrektorów z działalności spółki oraz sprawozdania finansowego, podziału zysku lub pokrycia straty, udzielenia absolutorium',
      c: 'Tylko zmiany umowy spółki',
      d: 'Tylko rozwiązania spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁷⁵ § 1 k.s.h. uchwały walnego zgromadzenia, poza innymi sprawami wymienionymi w ustawie lub umowie spółki, wymaga: rozpatrzenie i zatwierdzenie sprawozdania zarządu albo rady dyrektorów z działalności spółki oraz sprawozdania finansowego za ubiegły rok obrotowy, podjęcie uchwały o podziale zysku albo o pokryciu straty, udzielenie członkom organów spółki absolutorium z wykonania przez nich obowiązków.',
    difficulty: 'medium',
    tags: ['PSA', 'walne zgromadzenie', 'kompetencje']
  },

  // ============================================================
  // PSA - AKCJE I DYWIDENDA
  // ============================================================

  {
    id: 'ksh-838',
    article: 'Art. 300²⁹ § 1',
    articleTitle: 'Rodzaje akcji w PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje prostej spółki akcyjnej są:',
    options: {
      a: 'Zawsze na okaziciela',
      b: 'Zawsze imienne',
      c: 'Imienne lub na okaziciela',
      d: 'Zawsze zdematerializowane'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300²⁹ § 1 k.s.h. akcje są obejmowane w zamian za wkłady pieniężne lub niepieniężne. Akcje prostej spółki akcyjnej są zawsze akcjami imiennymi.',
    difficulty: 'medium',
    tags: ['PSA', 'akcje imienne']
  },

  {
    id: 'ksh-839',
    article: 'Art. 300³⁰',
    articleTitle: 'Rejestr akcjonariuszy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje prostej spółki akcyjnej podlegają zarejestrowaniu w:',
    options: {
      a: 'Księdze akcyjnej',
      b: 'Rejestrze akcjonariuszy prowadzonym w postaci elektronicznej przez podmiot uprawniony do prowadzenia rachunków papierów wartościowych',
      c: 'Krajowym Rejestrze Sądowym',
      d: 'Centralnej Ewidencji i Informacji o Działalności Gospodarczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300³⁰ § 1 k.s.h. rejestr akcjonariuszy prowadzi podmiot, który na podstawie ustawy o obrocie instrumentami finansowymi jest uprawniony do prowadzenia rachunków papierów wartościowych.',
    difficulty: 'hard',
    tags: ['PSA', 'rejestr akcjonariuszy', 'elektroniczny']
  },

  {
    id: 'ksh-840',
    article: 'Art. 300³² § 1',
    articleTitle: 'Uprzywilejowanie akcji PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje prostej spółki akcyjnej mogą być uprzywilejowane co do:',
    options: {
      a: 'Tylko dywidendy',
      b: 'Głosu, dywidendy lub podziału majątku w przypadku likwidacji spółki',
      c: 'Tylko głosu',
      d: 'Tylko podziału majątku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300³² § 1 k.s.h. akcje mogą być uprzywilejowane w szczególności co do głosu, co do dywidendy lub co do podziału majątku w przypadku likwidacji spółki.',
    difficulty: 'easy',
    tags: ['PSA', 'uprzywilejowanie akcji']
  },

  {
    id: 'ksh-841',
    article: 'Art. 300³² § 2',
    articleTitle: 'Limit głosów na akcję PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Na jedną akcję uprzywilejowaną co do głosu w prostej spółce akcyjnej może przypadać:',
    options: {
      a: 'Nie więcej niż dwa głosy',
      b: 'Nie więcej niż trzy głosy',
      c: 'Dowolna liczba głosów określona w umowie spółki',
      d: 'Nie więcej niż pięć głosów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300³² § 2 k.s.h. umowa spółki określa liczbę głosów przypadających na akcje uprzywilejowane co do głosu - nie ma ustawowego limitu jak w sp. z o.o. czy S.A.',
    difficulty: 'hard',
    tags: ['PSA', 'uprzywilejowanie głosowe', 'brak limitu']
  },

  {
    id: 'ksh-842',
    article: 'Art. 300¹⁵ § 1',
    articleTitle: 'Wypłata dywidendy z PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Kapitał akcyjny',
    question: 'Kwota przeznaczona do podziału między akcjonariuszy prostej spółki akcyjnej nie może przekraczać sumy:',
    options: {
      a: 'Zysku za ostatni rok obrotowy',
      b: 'Zysku za ostatni rok obrotowy, powiększonej o zyski z lat ubiegłych oraz o kwoty przeniesione z utworzonych z zysku kapitałów rezerwowych, pomniejszonej o straty z lat ubiegłych i kwoty, które mają być przekazane na kapitały rezerwowe',
      c: 'Kapitału akcyjnego',
      d: 'Kapitału zapasowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹⁵ § 1 k.s.h. kwota przeznaczona do podziału między akcjonariuszy nie może przekraczać sumy zysku za ostatni rok obrotowy, powiększonej o niepodzielone zyski z lat ubiegłych oraz o kwoty przeniesione z utworzonych z zysku kapitałów rezerwowych, które mogą być przeznaczone na wypłatę dywidendy, pomniejszonej o niepokryte straty, akcje własne oraz o kwoty, które zgodnie z ustawą lub umową spółki powinny być przeznaczone z zysku za ostatni rok obrotowy na kapitały rezerwowe, które nie mogą być przeznaczone na wypłatę dywidendy.',
    difficulty: 'hard',
    tags: ['PSA', 'dywidenda', 'wypłata']
  },

  {
    id: 'ksh-843',
    article: 'Art. 300¹⁵ § 3',
    articleTitle: 'Test wypłacalności PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Kapitał akcyjny',
    question: 'Dywidenda w prostej spółce akcyjnej nie może być wypłacana, jeżeli:',
    options: {
      a: 'Spółka ma straty',
      b: 'Wypłata doprowadziłaby do utraty przez spółkę, w normalnych okolicznościach, zdolności do wykonywania wymagalnych zobowiązań pieniężnych w terminie sześciu miesięcy od dnia dokonania wypłaty',
      c: 'Minęło mniej niż rok od rejestracji',
      d: 'Kapitał akcyjny jest niższy niż 10.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹⁵ § 3 k.s.h. wypłata na rzecz akcjonariuszy nie może doprowadzić do utraty przez spółkę, w normalnych okolicznościach, zdolności do wykonywania wymagalnych zobowiązań pieniężnych w terminie sześciu miesięcy od dnia dokonania wypłaty (test wypłacalności).',
    difficulty: 'hard',
    tags: ['PSA', 'test wypłacalności', 'dywidenda']
  },

  // ============================================================
  // PSA - ROZWIĄZANIE I LIKWIDACJA
  // ============================================================

  {
    id: 'ksh-844',
    article: 'Art. 300⁹⁸',
    articleTitle: 'Przyczyny rozwiązania PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Rozwiązanie prostej spółki akcyjnej powodują:',
    options: {
      a: 'Tylko uchwała walnego zgromadzenia',
      b: 'Przyczyny przewidziane w umowie spółki, uchwała walnego zgromadzenia o rozwiązaniu spółki lub przeniesieniu siedziby za granicę, wyrok sądu, ogłoszenie upadłości, inne przyczyny przewidziane prawem',
      c: 'Tylko ogłoszenie upadłości',
      d: 'Tylko wyrok sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁹⁸ k.s.h. rozwiązanie spółki powodują: przyczyny przewidziane w umowie spółki, uchwała walnego zgromadzenia o rozwiązaniu spółki albo o przeniesieniu siedziby spółki za granicę, wyrok sądu, ogłoszenie upadłości spółki, inne przyczyny przewidziane prawem.',
    difficulty: 'medium',
    tags: ['PSA', 'rozwiązanie', 'przyczyny']
  },

  {
    id: 'ksh-845',
    article: 'Art. 300⁹⁹',
    articleTitle: 'Uproszczone rozwiązanie PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Umowa prostej spółki akcyjnej może przewidywać, że w miejsce likwidacji następuje:',
    options: {
      a: 'Upadłość',
      b: 'Przejęcie całego majątku spółki przez oznaczonego akcjonariusza (akcjonariusza przejmującego) z obowiązkiem zaspokojenia wierzycieli i pozostałych akcjonariuszy',
      c: 'Przekształcenie w sp. z o.o.',
      d: 'Rozwiązanie bez zaspokojenia wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁹⁹ § 1 k.s.h. umowa spółki może przewidywać, że w miejsce likwidacji nastąpi przejęcie całego majątku spółki przez oznaczonego akcjonariusza (akcjonariusza przejmującego) z obowiązkiem zaspokojenia wierzycieli i pozostałych akcjonariuszy.',
    difficulty: 'hard',
    tags: ['PSA', 'uproszczone rozwiązanie', 'akcjonariusz przejmujący']
  },

  // ============================================================
  // PORÓWNANIE PSA Z INNYMI SPÓŁKAMI
  // ============================================================

  {
    id: 'ksh-846',
    article: 'Porównanie',
    articleTitle: 'Minimalne kapitały',
    section: 'Porównanie spółek',
    subsection: 'Kapitał',
    question: 'Minimalne kapitały (PSA vs sp. z o.o. vs S.A.):',
    options: {
      a: 'PSA: 1 zł, sp. z o.o.: 5.000 zł, S.A.: 100.000 zł',
      b: 'PSA: 100 zł, sp. z o.o.: 5.000 zł, S.A.: 100.000 zł',
      c: 'PSA: 1.000 zł, sp. z o.o.: 10.000 zł, S.A.: 100.000 zł',
      d: 'PSA: 0 zł, sp. z o.o.: 5.000 zł, S.A.: 100.000 zł'
    },
    correct: 'a',
    explanation: 'Minimalne kapitały: PSA - 1 zł (art. 300³ § 1), sp. z o.o. - 5.000 zł (art. 154 § 1), S.A. - 100.000 zł (art. 308 § 1).',
    difficulty: 'easy',
    tags: ['porównanie', 'kapitał minimalny', 'PSA', 'sp. z o.o.', 'S.A.']
  },

  {
    id: 'ksh-847',
    article: 'Porównanie',
    articleTitle: 'Wartość nominalna',
    section: 'Porównanie spółek',
    subsection: 'Wartość nominalna',
    question: 'Wartość nominalna udziałów/akcji (sp. z o.o. vs S.A. vs PSA):',
    options: {
      a: 'Sp. z o.o.: 50 zł, S.A.: 1 grosz, PSA: 1 grosz',
      b: 'Sp. z o.o.: 50 zł, S.A.: 1 grosz, PSA: brak wartości nominalnej',
      c: 'Wszystkie: brak wartości nominalnej',
      d: 'Sp. z o.o.: 50 zł, S.A.: 50 zł, PSA: 1 zł'
    },
    correct: 'b',
    explanation: 'Minimalna wartość nominalna udziału w sp. z o.o. to 50 zł, akcji w S.A. to 1 grosz. Akcje PSA nie mają wartości nominalnej (art. 300³ § 2).',
    difficulty: 'medium',
    tags: ['porównanie', 'wartość nominalna', 'PSA']
  },

  {
    id: 'ksh-848',
    article: 'Porównanie',
    articleTitle: 'Wkłady - praca i usługi',
    section: 'Porównanie spółek',
    subsection: 'Wkłady',
    question: 'Możliwość wniesienia wkładu w postaci pracy lub usług:',
    options: {
      a: 'Dopuszczalne we wszystkich spółkach kapitałowych',
      b: 'Dopuszczalne tylko w PSA',
      c: 'Dopuszczalne w sp. z o.o. i PSA',
      d: 'Niedopuszczalne w żadnej spółce kapitałowej'
    },
    correct: 'b',
    explanation: 'Tylko w PSA można wnieść wkład w postaci pracy lub usług (art. 300⁹ § 1). W sp. z o.o. i S.A. prawo pracy lub usług nie może być wkładem.',
    difficulty: 'medium',
    tags: ['porównanie', 'wkłady', 'praca', 'usługi', 'PSA']
  },

  {
    id: 'ksh-849',
    article: 'Porównanie',
    articleTitle: 'Organy alternatywne',
    section: 'Porównanie spółek',
    subsection: 'Organy',
    question: 'Możliwość ustanowienia rady dyrektorów zamiast zarządu:',
    options: {
      a: 'Możliwa we wszystkich spółkach kapitałowych',
      b: 'Możliwa tylko w PSA',
      c: 'Możliwa w S.A. i PSA',
      d: 'Niemożliwa w żadnej spółce'
    },
    correct: 'b',
    explanation: 'Tylko w PSA można ustanowić radę dyrektorów jako alternatywę dla zarządu (art. 300⁵² § 1). W sp. z o.o. i S.A. obowiązkowy jest zarząd.',
    difficulty: 'medium',
    tags: ['porównanie', 'rada dyrektorów', 'PSA']
  },

  // ============================================================
  // PRZEKSZTAŁCENIA SPÓŁEK - PRZEPISY OGÓLNE
  // ============================================================

  {
    id: 'ksh-850',
    article: 'Art. 551 § 1',
    articleTitle: 'Dopuszczalne przekształcenia',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka jawna, spółka partnerska, spółka komandytowa, spółka komandytowo-akcyjna, spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna oraz spółka akcyjna (spółka przekształcana) może być przekształcona w:',
    options: {
      a: 'Tylko w spółkę kapitałową',
      b: 'Inną spółkę handlową (spółkę przekształconą)',
      c: 'Tylko w spółkę osobową',
      d: 'Tylko w S.A.'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 551 § 1 k.s.h. spółka jawna, spółka partnerska, spółka komandytowa, spółka komandytowo-akcyjna, spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna oraz spółka akcyjna (spółka przekształcana) może być przekształcona w inną spółkę handlową (spółkę przekształconą).',
    difficulty: 'easy',
    tags: ['przekształcenie', 'dopuszczalne', 'spółka handlowa']
  },

  {
    id: 'ksh-851',
    article: 'Art. 552',
    articleTitle: 'Zasada kontynuacji',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka przekształcona pozostaje podmiotem w szczególności:',
    options: {
      a: 'Nowych praw i obowiązków',
      b: 'Zezwoleń, koncesji oraz ulg, które zostały przyznane spółce przed jej przekształceniem, chyba że ustawa lub decyzja o udzieleniu zezwolenia, koncesji albo ulgi stanowi inaczej',
      c: 'Tylko praw majątkowych',
      d: 'Tylko zobowiązań'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 553 § 2 k.s.h. spółka przekształcona pozostaje podmiotem w szczególności zezwoleń, koncesji oraz ulg, które zostały przyznane spółce przed jej przekształceniem, chyba że ustawa lub decyzja o udzieleniu zezwolenia, koncesji albo ulgi stanowi inaczej.',
    difficulty: 'medium',
    tags: ['przekształcenie', 'kontynuacja', 'zezwolenia']
  },

  {
    id: 'ksh-852',
    article: 'Art. 553 § 1',
    articleTitle: 'Prawa i obowiązki wspólników',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Wspólnikom spółki przekształcanej przysługują udziały lub akcje w spółce przekształconej:',
    options: {
      a: 'Tylko jeśli wyrażą zgodę',
      b: 'Z mocy prawa',
      c: 'Po uzyskaniu zgody sądu',
      d: 'Po wniesieniu dodatkowych wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 553 § 1 k.s.h. spółce przekształconej przysługują wszystkie prawa i obowiązki spółki przekształcanej. Wspólnikom spółki przekształcanej przysługują udziały lub akcje w spółce przekształconej z mocy prawa.',
    difficulty: 'medium',
    tags: ['przekształcenie', 'prawa wspólników', 'z mocy prawa']
  },

  {
    id: 'ksh-853',
    article: 'Art. 556',
    articleTitle: 'Plan przekształcenia',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Plan przekształcenia przygotowuje:',
    options: {
      a: 'Sąd rejestrowy',
      b: 'Zarząd spółki przekształcanej (w spółce kapitałowej) lub wszyscy wspólnicy prowadzący sprawy spółki (w spółce osobowej)',
      c: 'Biegły rewident',
      d: 'Walne zgromadzenie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 556 k.s.h. plan przekształcenia przygotowuje zarząd spółki przekształcanej, a w przypadku przekształcenia spółki osobowej - wszyscy wspólnicy prowadzący sprawy spółki.',
    difficulty: 'medium',
    tags: ['przekształcenie', 'plan przekształcenia', 'zarząd']
  },

  {
    id: 'ksh-854',
    article: 'Art. 559 § 1',
    articleTitle: 'Badanie planu przekształcenia',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Plan przekształcenia w spółkę akcyjną powinien być zbadany przez:',
    options: {
      a: 'Zarząd',
      b: 'Biegłego rewidenta w zakresie poprawności i rzetelności',
      c: 'Sąd rejestrowy',
      d: 'Radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 559 § 1 k.s.h. plan przekształcenia w spółkę akcyjną należy poddać badaniu przez biegłego rewidenta w zakresie poprawności i rzetelności.',
    difficulty: 'hard',
    tags: ['przekształcenie', 'biegły rewident', 'S.A.']
  },

  {
    id: 'ksh-855',
    article: 'Art. 562 § 1',
    articleTitle: 'Uchwała o przekształceniu',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Uchwała o przekształceniu spółki wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Aktu notarialnego',
      c: 'Pisemnej z podpisami notarialnie poświadczonymi',
      d: 'Dokumentowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 562 § 1 k.s.h. przekształcenie spółki wymaga uchwały powziętej, w przypadku przekształcenia spółki osobowej, przez wspólników, a w przypadku przekształcenia spółki kapitałowej, przez zgromadzenie wspólników lub walne zgromadzenie. Uchwała powinna być umieszczona w protokole sporządzonym przez notariusza.',
    difficulty: 'medium',
    tags: ['przekształcenie', 'uchwała', 'akt notarialny']
  },

  {
    id: 'ksh-856',
    article: 'Art. 563 § 1',
    articleTitle: 'Wpis przekształcenia',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka przekształcana staje się spółką przekształconą z chwilą:',
    options: {
      a: 'Podjęcia uchwały o przekształceniu',
      b: 'Wpisu spółki przekształconej do rejestru (dzień przekształcenia)',
      c: 'Sporządzenia planu przekształcenia',
      d: 'Wydania opinii przez biegłego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 552 k.s.h. spółka przekształcana staje się spółką przekształconą z chwilą wpisu spółki przekształconej do rejestru (dzień przekształcenia).',
    difficulty: 'easy',
    tags: ['przekształcenie', 'wpis do rejestru', 'dzień przekształcenia']
  },

  // ============================================================
  // ŁĄCZENIE SPÓŁEK
  // ============================================================

  {
    id: 'ksh-857',
    article: 'Art. 491 § 1',
    articleTitle: 'Sposoby łączenia',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółki handlowe mogą się łączyć przez:',
    options: {
      a: 'Tylko przejęcie',
      b: 'Przeniesienie całego majątku spółki (przejmowanej) na inną spółkę (przejmującą) za udziały lub akcje (łączenie przez przejęcie) LUB zawiązanie spółki kapitałowej, na którą przechodzi majątek wszystkich łączących się spółek (łączenie przez zawiązanie nowej spółki)',
      c: 'Tylko zawiązanie nowej spółki',
      d: 'Tylko podział'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 492 § 1 k.s.h. połączenie może być dokonane: przez przeniesienie całego majątku spółki (przejmowanej) na inną spółkę (przejmującą) za udziały lub akcje, które spółka przejmująca przyznaje wspólnikom spółki przejmowanej (łączenie się przez przejęcie), albo przez zawiązanie spółki kapitałowej, na którą przechodzi majątek wszystkich łączących się spółek za udziały lub akcje nowej spółki (łączenie się przez zawiązanie nowej spółki).',
    difficulty: 'medium',
    tags: ['łączenie', 'przejęcie', 'zawiązanie nowej spółki']
  },

  {
    id: 'ksh-858',
    article: 'Art. 493 § 1',
    articleTitle: 'Sukcesja uniwersalna',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka przejmująca albo spółka nowo zawiązana wstępuje z dniem połączenia we wszystkie prawa i obowiązki spółki przejmowanej albo spółek łączących się przez zawiązanie nowej spółki. Jest to:',
    options: {
      a: 'Sukcesja singularna',
      b: 'Sukcesja uniwersalna',
      c: 'Cesja',
      d: 'Subrogacja'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 494 § 1 k.s.h. spółka przejmująca albo spółka nowo zawiązana wstępuje z dniem połączenia we wszystkie prawa i obowiązki spółki przejmowanej albo spółek łączących się przez zawiązanie nowej spółki. Jest to sukcesja uniwersalna.',
    difficulty: 'easy',
    tags: ['łączenie', 'sukcesja uniwersalna']
  },

  {
    id: 'ksh-859',
    article: 'Art. 498 § 1',
    articleTitle: 'Plan połączenia',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Plan połączenia powinien zawierać co najmniej:',
    options: {
      a: 'Tylko typ, firmę i siedzibę każdej z łączących się spółek',
      b: 'Typ, firmę i siedzibę spółek, stosunek wymiany udziałów lub akcji, zasady dotyczące przyznania udziałów lub akcji w spółce przejmującej, dzień, od którego udziały lub akcje uprawniają do udziału w zysku',
      c: 'Tylko stosunek wymiany',
      d: 'Tylko dzień połączenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 499 § 1 k.s.h. plan połączenia powinien zawierać co najmniej: typ, firmę i siedzibę każdej z łączących się spółek, sposób łączenia, stosunek wymiany udziałów lub akcji spółki przejmowanej na udziały lub akcje spółki przejmującej, zasady dotyczące przyznania udziałów lub akcji w spółce przejmującej, dzień, od którego udziały lub akcje uprawniają do udziału w zysku spółki przejmującej.',
    difficulty: 'hard',
    tags: ['łączenie', 'plan połączenia', 'elementy']
  },

  {
    id: 'ksh-860',
    article: 'Art. 502',
    articleTitle: 'Badanie planu połączenia',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Plan połączenia powinien być zbadany przez biegłego:',
    options: {
      a: 'Zawsze',
      b: 'W zakresie poprawności i rzetelności',
      c: 'Tylko przy łączeniu z S.A.',
      d: 'Tylko na wniosek wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 502 § 1 k.s.h. plan połączenia powinien być zbadany przez biegłego w zakresie poprawności i rzetelności. Biegły jest wyznaczany przez sąd rejestrowy.',
    difficulty: 'medium',
    tags: ['łączenie', 'biegły', 'badanie planu']
  },

  {
    id: 'ksh-861',
    article: 'Art. 506 § 1',
    articleTitle: 'Uchwała o połączeniu',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Łączenie się spółek wymaga uchwały:',
    options: {
      a: 'Tylko zarządów',
      b: 'Zgromadzenia wspólników lub walnego zgromadzenia każdej z łączących się spółek',
      c: 'Tylko rad nadzorczych',
      d: 'Tylko większościowych wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 506 § 1 k.s.h. łączenie się spółek wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia każdej z łączących się spółek, powziętej większością trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['łączenie', 'uchwała', 'większość 3/4']
  },

  {
    id: 'ksh-862',
    article: 'Art. 515 § 1',
    articleTitle: 'Uproszczone połączenie',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział II - Łączenie z udziałem spółek kapitałowych',
    question: 'Połączenie może być przeprowadzone bez podwyższenia kapitału zakładowego, jeżeli spółka przejmująca ma udziały albo akcje spółki przejmowanej:',
    options: {
      a: 'W jakiejkolwiek ilości',
      b: 'Wszystkie albo reprezentujące co najmniej 90% kapitału zakładowego',
      c: 'Reprezentujące co najmniej 50% kapitału zakładowego',
      d: 'Żadne udziały ani akcje'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 515 § 1 k.s.h. połączenie może być przeprowadzone bez podwyższenia kapitału zakładowego, jeżeli spółka przejmująca ma wszystkie udziały albo akcje spółki przejmowanej albo udziały lub akcje reprezentujące co najmniej 90% kapitału zakładowego spółki przejmowanej.',
    difficulty: 'hard',
    tags: ['łączenie', 'uproszczone', '90%']
  },

  // ============================================================
  // PODZIAŁ SPÓŁEK
  // ============================================================

  {
    id: 'ksh-863',
    article: 'Art. 528 § 1',
    articleTitle: 'Spółki podlegające podziałowi',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Podziałowi może podlegać:',
    options: {
      a: 'Każda spółka handlowa',
      b: 'Spółka kapitałowa',
      c: 'Tylko S.A.',
      d: 'Tylko sp. z o.o.'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 528 § 1 k.s.h. spółka kapitałowa może być podzielona na dwie albo więcej spółek.',
    difficulty: 'easy',
    tags: ['podział', 'spółka kapitałowa']
  },

  {
    id: 'ksh-864',
    article: 'Art. 529 § 1',
    articleTitle: 'Sposoby podziału',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Podział spółki kapitałowej może być dokonany przez:',
    options: {
      a: 'Tylko przez wydzielenie',
      b: 'Przeniesienie całego majątku na istniejące lub nowo zawiązane spółki (podział przez przejęcie lub zawiązanie), LUB przeniesienie części majątku na istniejącą lub nowo zawiązaną spółkę (podział przez wydzielenie)',
      c: 'Tylko przez przejęcie',
      d: 'Tylko przez zawiązanie nowych spółek'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 529 § 1 k.s.h. podział może być dokonany: przez przeniesienie całego majątku spółki dzielonej na istniejące spółki lub nowo zawiązane spółki (podział przez przejęcie lub podział przez zawiązanie nowych spółek), albo przez przeniesienie części majątku spółki dzielonej na istniejącą spółkę lub nowo zawiązaną spółkę (podział przez wydzielenie).',
    difficulty: 'medium',
    tags: ['podział', 'sposoby', 'wydzielenie']
  },

  {
    id: 'ksh-865',
    article: 'Art. 531 § 1',
    articleTitle: 'Sukcesja przy podziale',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółki przejmujące lub spółki nowo zawiązane powstałe w wyniku podziału wstępują z dniem wydzielenia lub podziału:',
    options: {
      a: 'We wszystkie prawa spółki dzielonej',
      b: 'W prawa i obowiązki spółki dzielonej, określone w planie podziału',
      c: 'Tylko w prawa majątkowe',
      d: 'Tylko w zobowiązania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 531 § 1 k.s.h. spółki przejmujące lub spółki nowo zawiązane powstałe w wyniku podziału wstępują z dniem podziału albo z dniem wydzielenia w prawa i obowiązki spółki dzielonej, określone w planie podziału.',
    difficulty: 'medium',
    tags: ['podział', 'sukcesja', 'plan podziału']
  },

  {
    id: 'ksh-866',
    article: 'Art. 534 § 1',
    articleTitle: 'Plan podziału',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Plan podziału powinien zawierać co najmniej:',
    options: {
      a: 'Tylko typ, firmę i siedzibę spółki dzielonej',
      b: 'Typ, firmę i siedzibę spółek, stosunek wymiany udziałów lub akcji, zasady przyznania udziałów lub akcji, dokładny opis i podział składników majątku oraz zezwoleń i koncesji',
      c: 'Tylko stosunek wymiany',
      d: 'Tylko opis majątku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 534 § 1 k.s.h. plan podziału powinien zawierać co najmniej: typ, firmę i siedzibę każdej ze spółek uczestniczących w podziale, stosunek wymiany udziałów lub akcji spółki dzielonej na udziały lub akcje spółek przejmujących, zasady dotyczące przyznania udziałów lub akcji, dokładny opis i podział składników majątku (aktywów i pasywów) oraz zezwoleń, koncesji lub ulg przypadających spółkom przejmującym.',
    difficulty: 'hard',
    tags: ['podział', 'plan podziału', 'elementy']
  },

  {
    id: 'ksh-867',
    article: 'Art. 541',
    articleTitle: 'Uchwała o podziale',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Podział spółki wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia spółki dzielonej oraz każdej spółki przejmującej, podjętej większością:',
    options: {
      a: 'Bezwzględną',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 541 § 1 k.s.h. podział spółki wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia spółki dzielonej oraz każdej spółki przejmującej, powziętej większością trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['podział', 'uchwała', 'większość 3/4']
  },

  // ============================================================
  // PRAWO HOLDINGOWE
  // ============================================================

  {
    id: 'ksh-868',
    article: 'Art. 4 § 1 pkt 4',
    articleTitle: 'Definicja grupy spółek',
    section: 'Część ogólna',
    subsection: 'Przepisy ogólne',
    question: 'Grupa spółek to:',
    options: {
      a: 'Każdy zbiór spółek',
      b: 'Spółka dominująca i spółka albo spółki od niej zależne, będące spółkami kapitałowymi, kierujące się wspólną strategią w celu realizacji wspólnego interesu, uzasadniającą sprawowanie przez spółkę dominującą jednolitego kierownictwa nad spółką zależną albo spółkami zależnymi',
      c: 'Tylko spółki z jednym wspólnikiem',
      d: 'Spółki publiczne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 5¹ k.s.h. grupa spółek oznacza spółkę dominującą i spółkę albo spółki od niej zależne, będące spółkami kapitałowymi, kierujące się zgodnie z uchwałą o uczestnictwie w grupie spółek wspólną strategią w celu realizacji wspólnego interesu (interes grupy spółek), uzasadniającą sprawowanie przez spółkę dominującą jednolitego kierownictwa nad spółką zależną albo spółkami zależnymi.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'holding', 'definicja']
  },

  {
    id: 'ksh-869',
    article: 'Art. 21¹ § 1',
    articleTitle: 'Wiążące polecenie',
    section: 'Część ogólna',
    subsection: 'Grupa spółek',
    question: 'Spółka dominująca może wydać spółce zależnej uczestniczącej w grupie spółek wiążące polecenie dotyczące prowadzenia spraw spółki, jeżeli:',
    options: {
      a: 'Jest właścicielem 100% udziałów',
      b: 'Jest to uzasadnione interesem grupy spółek',
      c: 'Zarząd spółki zależnej wyrazi zgodę',
      d: 'Rada nadzorcza spółki zależnej wyrazi zgodę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21¹ § 1 k.s.h. spółka dominująca może wydać spółce zależnej uczestniczącej w grupie spółek wiążące polecenie dotyczące prowadzenia spraw spółki, jeżeli jest to uzasadnione interesem grupy spółek.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'wiążące polecenie', 'interes grupy']
  },

  {
    id: 'ksh-870',
    article: 'Art. 21² § 1',
    articleTitle: 'Wykonanie wiążącego polecenia',
    section: 'Część ogólna',
    subsection: 'Grupa spółek',
    question: 'Wykonanie wiążącego polecenia przez spółkę zależną wymaga uprzedniej uchwały:',
    options: {
      a: 'Zgromadzenia wspólników/walnego zgromadzenia',
      b: 'Zarządu spółki zależnej',
      c: 'Rady nadzorczej spółki zależnej',
      d: 'Zarządu spółki dominującej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21² § 1 k.s.h. wykonanie wiążącego polecenia przez spółkę zależną uczestniczącą w grupie spółek wymaga uprzedniej uchwały zarządu spółki zależnej.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'wiążące polecenie', 'uchwała zarządu']
  },

  {
    id: 'ksh-871',
    article: 'Art. 21² § 2',
    articleTitle: 'Odmowa wykonania polecenia',
    section: 'Część ogólna',
    subsection: 'Grupa spółek',
    question: 'Spółka zależna może odmówić wykonania wiążącego polecenia, jeżeli:',
    options: {
      a: 'Zarząd tak postanowi',
      b: 'Wykonanie polecenia doprowadziłoby do niewypłacalności albo do zagrożenia niewypłacalnością spółki zależnej',
      c: 'Wspólnicy mniejszościowi się sprzeciwią',
      d: 'Rada nadzorcza nie wyrazi zgody'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21² § 2 k.s.h. spółka zależna uczestnicząca w grupie spółek odmawia wykonania wiążącego polecenia, jeżeli jego wykonanie doprowadziłoby do niewypłacalności albo do zagrożenia niewypłacalnością tej spółki.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'odmowa polecenia', 'niewypłacalność']
  },

  // ============================================================
  // PYTANIA UZUPEŁNIAJĄCE - SZCZEGÓŁY
  // ============================================================

  {
    id: 'ksh-872',
    article: 'Art. 300⁷',
    articleTitle: 'Elementy umowy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa prostej spółki akcyjnej powinna określać:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę i siedzibę, przedmiot działalności, liczbę i serie akcji objętych przez poszczególnych akcjonariuszy, cenę emisyjną akcji, przedmiot wkładów niepieniężnych, organy spółki, czas trwania (jeśli oznaczony)',
      c: 'Tylko przedmiot działalności',
      d: 'Tylko liczbę akcji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁷ k.s.h. umowa prostej spółki akcyjnej powinna określać: firmę i siedzibę spółki, przedmiot działalności spółki, liczbę, serie i numery akcji, związane z nimi uprzywilejowanie, akcjonariuszy obejmujących poszczególne akcje oraz cenę emisyjną akcji, jeżeli akcjonariusze wnoszą wkłady niepieniężne - przedmiot tych wkładów, serie i numery akcji obejmowanych za wkłady niepieniężne oraz akcjonariuszy, którzy obejmują te akcje, jeżeli akcjonariusze wnoszą wkłady niepieniężne mające zdolność aportową - także przedmiot tych wkładów, organy spółki, liczbę członków zarządu i rady nadzorczej (jeśli jest ustanowiona), albo co najmniej minimalną i maksymalną liczbę członków tych organów, czas trwania spółki (jeżeli jest oznaczony).',
    difficulty: 'hard',
    tags: ['PSA', 'umowa', 'elementy']
  },

  {
    id: 'ksh-873',
    article: 'Art. 300⁸² § 1',
    articleTitle: 'Większość do zmiany umowy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział IV - Zmiana umowy spółki',
    question: 'Zmiana umowy prostej spółki akcyjnej wymaga uchwały walnego zgromadzenia podjętej większością:',
    options: {
      a: 'Bezwzględną',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300⁸² § 1 k.s.h. zmiana umowy spółki wymaga uchwały walnego zgromadzenia podjętej większością trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['PSA', 'zmiana umowy', 'większość 3/4']
  },

  {
    id: 'ksh-874',
    article: 'Art. 300⁸⁵',
    articleTitle: 'Emisja akcji PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział IV - Zmiana umowy spółki',
    question: 'Emisja nowych akcji prostej spółki akcyjnej wymaga:',
    options: {
      a: 'Zgody sądu',
      b: 'Zmiany umowy spółki, chyba że umowa upoważnia zarząd lub radę dyrektorów do emisji akcji',
      c: 'Tylko uchwały zarządu',
      d: 'Zgody wszystkich akcjonariuszy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁸⁵ § 1 k.s.h. emisja nowych akcji wymaga zmiany umowy spółki. Umowa spółki może upoważniać zarząd albo radę dyrektorów, na okres nie dłuższy niż pięć lat, do emisji nowych akcji.',
    difficulty: 'medium',
    tags: ['PSA', 'emisja akcji', 'zmiana umowy']
  },

  {
    id: 'ksh-875',
    article: 'Art. 568',
    articleTitle: 'Przekształcenie sp. z o.o. w S.A.',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział III - Przekształcenie spółki kapitałowej',
    question: 'Przekształcenie sp. z o.o. w S.A. wymaga, aby kapitał zakładowy spółki przekształcanej był:',
    options: {
      a: 'Nie niższy niż 100.000 zł',
      b: 'W pełni pokryty',
      c: 'Nie niższy niż 50.000 zł',
      d: 'Nie ma wymagań co do kapitału'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 568 k.s.h. do przekształcenia spółki stosuje się odpowiednio przepisy dotyczące powstania spółki przekształconej, jednak kapitał zakładowy spółki przekształcanej musi być w całości pokryty.',
    difficulty: 'hard',
    tags: ['przekształcenie', 'sp. z o.o.', 'S.A.', 'kapitał']
  },

  {
    id: 'ksh-876',
    article: 'Art. 577 § 1',
    articleTitle: 'Przekształcenie spółki osobowej',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział IV - Przekształcenie spółki osobowej',
    question: 'Do przekształcenia spółki osobowej w spółkę kapitałową wymagana jest zgoda:',
    options: {
      a: 'Większości wspólników',
      b: 'Wszystkich wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Tylko komplementariuszy',
      d: 'Sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 571 § 1 k.s.h. do przekształcenia spółki osobowej w spółkę kapitałową wymagana jest zgoda wszystkich wspólników. Jednak umowa spółki może przewidywać, że wystarczy większość wspólników.',
    difficulty: 'hard',
    tags: ['przekształcenie', 'spółka osobowa', 'zgoda wspólników']
  },

  {
    id: 'ksh-877',
    article: 'Art. 580',
    articleTitle: 'Odpowiedzialność po przekształceniu',
    section: 'Tytuł IV - Przekształcenie spółek',
    subsection: 'Dział IV - Przekształcenie spółki osobowej',
    question: 'Wspólnicy spółki przekształcanej odpowiadają za zobowiązania spółki powstałe przed dniem przekształcenia:',
    options: {
      a: 'Nie odpowiadają',
      b: 'Na dotychczasowych zasadach, solidarnie ze spółką przekształconą, przez okres trzech lat, licząc od dnia przekształcenia',
      c: 'Tylko przez rok',
      d: 'Tylko do wysokości wniesionych wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 574 k.s.h. wspólnicy spółki przekształcanej odpowiadają za zobowiązania spółki powstałe przed dniem przekształcenia na dotychczasowych zasadach solidarnie ze spółką przekształconą przez okres trzech lat, licząc od dnia przekształcenia.',
    difficulty: 'hard',
    tags: ['przekształcenie', 'odpowiedzialność', '3 lata']
  },

  {
    id: 'ksh-878',
    article: 'Art. 300⁴¹',
    articleTitle: 'Zbycie akcji PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Zbycie lub obciążenie akcji prostej spółki akcyjnej wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Dokumentowej pod rygorem nieważności',
      c: 'Aktu notarialnego',
      d: 'Pisemnej z datą pewną'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁴¹ k.s.h. zbycie lub obciążenie akcji powinno być dokonane w formie dokumentowej pod rygorem nieważności.',
    difficulty: 'medium',
    tags: ['PSA', 'zbycie akcji', 'forma dokumentowa']
  },

  {
    id: 'ksh-879',
    article: 'Art. 300⁴⁴',
    articleTitle: 'Prawo pierwszeństwa akcjonariuszy PSA',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'W prostej spółce akcyjnej umowa spółki może przewidywać, że pozostałym akcjonariuszom przysługuje:',
    options: {
      a: 'Prawo odkupu',
      b: 'Prawo pierwszeństwa nabycia akcji przeznaczonych do zbycia przez innego akcjonariusza',
      c: 'Prawo weta',
      d: 'Prawo wyłączenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁴⁴ § 1 k.s.h. umowa spółki może przewidywać, że pozostałym akcjonariuszom przysługuje prawo pierwszeństwa nabycia akcji przeznaczonych do zbycia przez innego akcjonariusza (prawo pierwszeństwa).',
    difficulty: 'medium',
    tags: ['PSA', 'prawo pierwszeństwa', 'zbycie akcji']
  },

  {
    id: 'ksh-880',
    article: 'Art. 300²²',
    articleTitle: 'Termin zgłoszenia PSA do rejestru',
    section: 'Tytuł IV¹ - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Prosta spółka akcyjna powinna być zgłoszona do rejestru w terminie:',
    options: {
      a: '3 miesięcy od dnia zawarcia umowy spółki',
      b: '6 miesięcy od dnia zawarcia umowy spółki',
      c: '1 roku od dnia zawarcia umowy spółki',
      d: 'Bez określonego terminu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300²² § 1 k.s.h. zarząd albo rada dyrektorów zgłasza zawiązanie spółki do sądu rejestrowego właściwego ze względu na siedzibę spółki w celu wpisania spółki do rejestru. Wniosek o wpis spółki do rejestru powinien być złożony w terminie sześciu miesięcy od dnia zawarcia umowy spółki.',
    difficulty: 'medium',
    tags: ['PSA', 'termin rejestracji', '6 miesięcy']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART11_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART11.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART11.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART11.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART11.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    psa: KSH_EXAM_QUESTIONS_PART11.filter(q => q.section.includes('Prosta spółka akcyjna')).length,
    przeksztalcenia: KSH_EXAM_QUESTIONS_PART11.filter(q => q.section.includes('Przekształcenie')).length,
    laczenie: KSH_EXAM_QUESTIONS_PART11.filter(q => q.section.includes('Łączenie')).length,
    podzial: KSH_EXAM_QUESTIONS_PART11.filter(q => q.section.includes('Podział')).length,
    holding: KSH_EXAM_QUESTIONS_PART11.filter(q => q.tags.includes('grupa spółek')).length,
    porownania: KSH_EXAM_QUESTIONS_PART11.filter(q => q.section.includes('Porównanie')).length,
  }
};

console.log('KSH Part 11 loaded:', PART11_STATS);
