// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 9 - 80 pytań: SP. Z O.O. i S.A. - Pułapki egzaminacyjne
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART9: ExamQuestion[] = [

  // ============================================================
  // PUŁAPKI EGZAMINACYJNE - PODOBNE PRZEPISY, RÓŻNE LICZBY
  // ============================================================

  {
    id: 'ksh-701',
    article: 'Art. 236 vs Art. 400',
    articleTitle: 'Pułapka: Żądanie zwołania zgromadzenia',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne progi',
    question: 'Wspólnicy/akcjonariusze mogą żądać zwołania nadzwyczajnego zgromadzenia reprezentując co najmniej:',
    options: {
      a: 'W obu spółkach: 1/10 kapitału',
      b: 'W obu spółkach: 1/20 kapitału',
      c: 'Sp. z o.o.: 1/10 kapitału, S.A.: 1/20 kapitału',
      d: 'Sp. z o.o.: 1/20 kapitału, S.A.: 1/10 kapitału'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. próg to 1/10 kapitału (art. 236 § 1), a w S.A. tylko 1/20 kapitału (art. 400 § 1). W S.A. akcjonariusze mają łatwiejszy dostęp do zwołania zgromadzenia.',
    difficulty: 'hard',
    tags: ['pułapka', 'żądanie zwołania', 'różne progi', 'porównanie']
  },

  {
    id: 'ksh-702',
    article: 'Art. 238 vs Art. 402',
    articleTitle: 'Pułapka: Termin zawiadomienia',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne terminy',
    question: 'Minimalny termin zawiadomienia o zgromadzeniu:',
    options: {
      a: 'W obu spółkach: 2 tygodnie',
      b: 'W obu spółkach: 3 tygodnie',
      c: 'Sp. z o.o.: 2 tygodnie, S.A.: 3 tygodnie',
      d: 'Sp. z o.o.: 3 tygodnie, S.A.: 2 tygodnie'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. zawiadomienie wysyła się min. 2 tygodnie przed (art. 238 § 1), w S.A. min. 3 tygodnie przed (art. 402 § 1).',
    difficulty: 'hard',
    tags: ['pułapka', 'termin zawiadomienia', 'różne terminy', 'porównanie']
  },

  {
    id: 'ksh-703',
    article: 'Art. 174 vs Art. 352',
    articleTitle: 'Pułapka: Uprzywilejowanie głosowe',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne limity',
    question: 'Maksymalne uprzywilejowanie co do głosu:',
    options: {
      a: 'W obu spółkach: max 2 głosy',
      b: 'W obu spółkach: max 3 głosy',
      c: 'Sp. z o.o.: max 3 głosy, S.A.: max 2 głosy',
      d: 'Sp. z o.o.: max 2 głosy, S.A.: max 3 głosy'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. max 3 głosy na udział (art. 174 § 3), w S.A. max 2 głosy na akcję (art. 352). Sp. z o.o. pozwala na większe uprzywilejowanie!',
    difficulty: 'hard',
    tags: ['pułapka', 'uprzywilejowanie', 'głosy', 'porównanie']
  },

  {
    id: 'ksh-704',
    article: 'Art. 246 vs Art. 415',
    articleTitle: 'Pułapka: Zmiana umowy/statutu',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne większości',
    question: 'Większość wymagana do zmiany umowy sp. z o.o. vs zmiany statutu S.A.:',
    options: {
      a: 'W obu spółkach: 2/3 głosów',
      b: 'W obu spółkach: 3/4 głosów',
      c: 'Sp. z o.o.: 2/3 głosów, S.A.: 3/4 głosów',
      d: 'Sp. z o.o.: 3/4 głosów, S.A.: 2/3 głosów'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! Zmiana umowy sp. z o.o. wymaga 2/3 głosów (art. 246 § 1), zmiana statutu S.A. wymaga 3/4 głosów (art. 415 § 1). W S.A. trudniej zmienić dokument założycielski!',
    difficulty: 'hard',
    tags: ['pułapka', 'zmiana umowy', 'zmiana statutu', 'większość']
  },

  {
    id: 'ksh-705',
    article: 'Art. 233 vs Art. 397',
    articleTitle: 'Pułapka: Próg straty',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne progi',
    question: 'Próg straty wymagający zwołania zgromadzenia w celu podjęcia uchwały o dalszym istnieniu spółki:',
    options: {
      a: 'W obu spółkach: 1/2 kapitału',
      b: 'W obu spółkach: 1/3 kapitału',
      c: 'Sp. z o.o.: 1/2 kapitału, S.A.: 1/3 kapitału',
      d: 'Sp. z o.o.: 1/3 kapitału, S.A.: 1/2 kapitału'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. próg to 1/2 kapitału (art. 233 § 1), w S.A. tylko 1/3 kapitału (art. 397). W S.A. reakcja wymagana przy mniejszej stracie!',
    difficulty: 'hard',
    tags: ['pułapka', 'strata', 'różne progi', 'porównanie']
  },

  {
    id: 'ksh-706',
    article: 'Art. 279 vs Art. 465',
    articleTitle: 'Pułapka: Wezwanie wierzycieli w likwidacji',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne terminy',
    question: 'Termin dla wierzycieli na zgłoszenie wierzytelności w likwidacji:',
    options: {
      a: 'W obu spółkach: 3 miesiące',
      b: 'W obu spółkach: 6 miesięcy',
      c: 'Sp. z o.o.: 3 miesiące, S.A.: 6 miesięcy',
      d: 'Sp. z o.o.: 6 miesięcy, S.A.: 3 miesiące'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. termin to 3 miesiące (art. 279), w S.A. aż 6 miesięcy (art. 465 § 1). Likwidacja S.A. trwa dłużej!',
    difficulty: 'hard',
    tags: ['pułapka', 'likwidacja', 'wierzyciele', 'terminy']
  },

  {
    id: 'ksh-707',
    article: 'Art. 286 vs Art. 474',
    articleTitle: 'Pułapka: Podział majątku w likwidacji',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne terminy',
    question: 'Podział majątku w likwidacji nie może nastąpić przed upływem:',
    options: {
      a: 'W obu spółkach: 6 miesięcy',
      b: 'W obu spółkach: 1 roku',
      c: 'Sp. z o.o.: 6 miesięcy, S.A.: 1 roku',
      d: 'Sp. z o.o.: 1 roku, S.A.: 6 miesięcy'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. podział po 6 miesiącach (art. 286 § 1), w S.A. dopiero po roku (art. 474 § 1). Likwidacja S.A. jest bardziej rozciągnięta w czasie!',
    difficulty: 'hard',
    tags: ['pułapka', 'likwidacja', 'podział majątku', 'terminy']
  },

  {
    id: 'ksh-708',
    article: 'Art. 201 vs Art. 368',
    articleTitle: 'Pułapka: Kto powołuje zarząd',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne organy',
    question: 'Kto domyślnie powołuje członków zarządu:',
    options: {
      a: 'W obu spółkach: zgromadzenie wspólników/walne zgromadzenie',
      b: 'W obu spółkach: rada nadzorcza',
      c: 'Sp. z o.o.: wspólnicy, S.A.: rada nadzorcza',
      d: 'Sp. z o.o.: rada nadzorcza, S.A.: walne zgromadzenie'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! W sp. z o.o. zarząd powołują wspólnicy (art. 201 § 4), w S.A. rada nadzorcza (art. 368 § 4). Inne organy, chyba że umowa/statut stanowi inaczej!',
    difficulty: 'hard',
    tags: ['pułapka', 'powoływanie zarządu', 'różne organy']
  },

  // ============================================================
  // PUŁAPKI - PODOBNE BRZMIENIE, RÓŻNY SKUTEK
  // ============================================================

  {
    id: 'ksh-709',
    article: 'Art. 17 § 1 vs § 2',
    articleTitle: 'Pułapka: Brak uchwały - ustawa vs umowa',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne skutki',
    question: 'Czynność prawna dokonana bez wymaganej uchwały:',
    options: {
      a: 'Zawsze nieważna',
      b: 'Zawsze ważna',
      c: 'Bez uchwały wymaganej przez USTAWĘ - nieważna, bez uchwały wymaganej przez UMOWĘ - ważna (ale zarząd odpowiada)',
      d: 'Bez uchwały wymaganej przez USTAWĘ - ważna, bez uchwały wymaganej przez UMOWĘ - nieważna'
    },
    correct: 'c',
    explanation: 'PUŁAPKA! Art. 17 § 1 - brak uchwały wymaganej przez USTAWĘ = NIEWAŻNOŚĆ. Art. 17 § 2 - brak uchwały wymaganej przez UMOWĘ = czynność WAŻNA, ale zarząd może odpowiadać wobec spółki.',
    difficulty: 'hard',
    tags: ['pułapka', 'nieważność', 'ważność', 'uchwała']
  },

  {
    id: 'ksh-710',
    article: 'Art. 249 vs Art. 252',
    articleTitle: 'Pułapka: Uchylenie vs nieważność uchwały',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne podstawy',
    question: 'Podstawa zaskarżenia uchwały wspólników sp. z o.o.:',
    options: {
      a: 'Sprzeczność z umową = nieważność, sprzeczność z ustawą = uchylenie',
      b: 'Sprzeczność z umową lub dobrymi obyczajami = uchylenie, sprzeczność z ustawą = nieważność',
      c: 'Każda sprzeczność = nieważność',
      d: 'Każda sprzeczność = uchylenie'
    },
    correct: 'b',
    explanation: 'PUŁAPKA! Sprzeczność z UMOWĄ SPÓŁKI lub dobrymi obyczajami → powództwo o UCHYLENIE (art. 249). Sprzeczność z USTAWĄ → powództwo o NIEWAŻNOŚĆ (art. 252).',
    difficulty: 'hard',
    tags: ['pułapka', 'uchylenie', 'nieważność', 'podstawa']
  },

  {
    id: 'ksh-711',
    article: 'Art. 251 vs Art. 252',
    articleTitle: 'Pułapka: Terminy zaskarżenia - sp. z o.o.',
    section: 'Pułapki egzaminacyjne',
    subsection: 'Różne terminy',
    question: 'Terminy zaskarżenia uchwały w sp. z o.o.:',
    options: {
      a: 'Uchylenie: miesiąc/6 mies., Nieważność: 6 mies./3 lata',
      b: 'Oba: miesiąc/6 mies.',
      c: 'Oba: 6 mies./3 lata',
      d: 'Uchylenie: 6 mies./3 lata, Nieważność: miesiąc/6 mies.'
    },
    correct: 'a',
    explanation: 'PUŁAPKA! Powództwo o UCHYLENIE: miesiąc od wiadomości, max 6 mies. od powzięcia (art. 251). Powództwo o NIEWAŻNOŚĆ: 6 mies. od wiadomości, max 3 LATA od powzięcia (art. 252 § 3).',
    difficulty: 'hard',
    tags: ['pułapka', 'terminy', 'uchylenie', 'nieważność']
  },

  // ============================================================
  // KAZUSY ZŁOŻONE - ANALIZA
  // ============================================================

  {
    id: 'ksh-712',
    article: 'Art. 229 + Art. 17',
    articleTitle: 'Kazus złożony: Nabycie nieruchomości',
    section: 'Kazusy złożone',
    subsection: 'Sp. z o.o.',
    question: 'Sp. z o.o. (kapitał 200.000 zł, zarejestrowana 18 mies. temu) kupiła nieruchomość za 60.000 zł bez uchwały wspólników. Umowa jest:',
    options: {
      a: 'Nieważna, bo wymagana była uchwała (art. 229)',
      b: 'Ważna, bo 60.000 zł < 1/4 × 200.000 zł = 50.000 zł... NIE! 60.000 zł > 50.000 zł, ALE 50.000 zł to minimum ustawowe, więc uchwała była wymagana = NIEWAŻNA',
      c: 'Ważna, bo minęły 2 lata od rejestracji',
      d: 'Ważna, bo cena < 50.000 zł'
    },
    correct: 'a',
    explanation: 'Art. 229: nabycie nieruchomości przed upływem 2 lat od rejestracji za cenę > 1/4 kapitału (tu: 50.000 zł), nie niższą niż 50.000 zł, wymaga uchwały. 60.000 zł > 50.000 zł i > 1/4 × 200.000 zł. Minęło tylko 18 mies. Uchwała wymagana przez USTAWĘ → brak = NIEWAŻNOŚĆ (art. 17 § 1).',
    difficulty: 'hard',
    tags: ['kazus', 'art. 229', 'nieważność', 'nieruchomość']
  },

  {
    id: 'ksh-713',
    article: 'Art. 230 + Art. 17',
    articleTitle: 'Kazus złożony: Zobowiązanie ponad 2x kapitał',
    section: 'Kazusy złożone',
    subsection: 'Sp. z o.o.',
    question: 'Umowa sp. z o.o. (kapitał 100.000 zł) wymaga uchwały wspólników dla zobowiązań > 150.000 zł. Zarząd zaciągnął kredyt 250.000 zł bez uchwały. Umowa kredytu jest:',
    options: {
      a: 'Nieważna',
      b: 'Ważna, bo umowa spółki (nie ustawa) wymagała uchwały przy 150.000 zł, ale ustawa wymaga przy 200.000 zł (2x kapitał), więc dla 250.000 zł uchwała była wymagana przez USTAWĘ = NIEWAŻNA',
      c: 'Ważna, zarząd odpowiada wobec spółki',
      d: 'Bezskuteczna zawieszona'
    },
    correct: 'b',
    explanation: 'Art. 230: zobowiązanie > 2x kapitał (200.000 zł) wymaga uchwały z USTAWY. 250.000 zł > 200.000 zł, więc uchwała wymagana przez USTAWĘ. Brak uchwały wymaganej przez ustawę = NIEWAŻNOŚĆ (art. 17 § 1).',
    difficulty: 'hard',
    tags: ['kazus', 'art. 230', 'nieważność', 'zobowiązanie']
  },

  {
    id: 'ksh-714',
    article: 'Art. 299',
    articleTitle: 'Kazus złożony: Odpowiedzialność byłego członka zarządu',
    section: 'Kazusy złożone',
    subsection: 'Sp. z o.o.',
    question: 'Jan był członkiem zarządu sp. z o.o. od 2020 do 2022. Zobowiązanie spółki powstało w 2021. Egzekucja okazała się bezskuteczna w 2024. Czy Jan odpowiada z art. 299?',
    options: {
      a: 'Nie, bo nie jest już członkiem zarządu',
      b: 'Tak, bo zobowiązanie powstało gdy był członkiem zarządu i nie wykazał przesłanek egzoneracyjnych',
      c: 'Nie, bo minęły 2 lata od odejścia',
      d: 'Tak, ale tylko do wysokości swojego wynagrodzenia'
    },
    correct: 'b',
    explanation: 'Art. 299 dotyczy członków zarządu z okresu, gdy istniały przesłanki do złożenia wniosku o upadłość. Jan był członkiem zarządu gdy powstało zobowiązanie (2021). Odpowiada, chyba że wykaże przesłanki egzoneracyjne z art. 299 § 2.',
    difficulty: 'hard',
    tags: ['kazus', 'art. 299', 'były członek zarządu']
  },

  {
    id: 'ksh-715',
    article: 'Art. 210 § 1',
    articleTitle: 'Kazus złożony: Spór spółki z członkiem zarządu',
    section: 'Kazusy złożone',
    subsection: 'Sp. z o.o.',
    question: 'Sp. z o.o. chce pozwać członka zarządu o odszkodowanie. Kto reprezentuje spółkę w tym sporze?',
    options: {
      a: 'Pozostali członkowie zarządu',
      b: 'Rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Prokurent',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Art. 210 § 1: W sporze z członkiem zarządu spółkę reprezentuje rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników. Pozostali członkowie zarządu NIE mogą reprezentować spółki w sporze z kolegą z zarządu!',
    difficulty: 'medium',
    tags: ['kazus', 'reprezentacja', 'spór z zarządem']
  },

  {
    id: 'ksh-716',
    article: 'Art. 244 + Art. 250',
    articleTitle: 'Kazus złożony: Wspólnik-prezes głosuje nad absolutorium',
    section: 'Kazusy złożone',
    subsection: 'Sp. z o.o.',
    question: 'W sp. z o.o. jedyny wspólnik jest jednocześnie jedynym członkiem zarządu. Czy może głosować nad udzieleniem sobie absolutorium?',
    options: {
      a: 'Tak, jako jedyny wspólnik',
      b: 'Nie, jest wyłączony od głosowania',
      c: 'Tak, ale musi mieć pełnomocnika',
      d: 'Nie, absolutorium udziela sąd'
    },
    correct: 'b',
    explanation: 'Art. 244: Wspólnik jest WYŁĄCZONY od głosowania przy uchwałach dotyczących jego odpowiedzialności, w tym udzielenia absolutorium. Nawet jedyny wspólnik nie może głosować nad własnym absolutorium!',
    difficulty: 'hard',
    tags: ['kazus', 'wyłączenie', 'absolutorium', 'jednoosobowa spółka']
  },

  // ============================================================
  // S.A. - SZCZEGÓŁOWE PRZEPISY O ORGANACH
  // ============================================================

  {
    id: 'ksh-717',
    article: 'Art. 369 § 4',
    articleTitle: 'Ponowne powołanie członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Ponowne powołanie tej samej osoby na członka zarządu S.A. może nastąpić:',
    options: {
      a: 'W każdym czasie',
      b: 'Nie wcześniej niż na rok przed upływem bieżącej kadencji członka zarządu',
      c: 'Dopiero po upływie kadencji',
      d: 'Tylko za zgodą rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 369 § 4 k.s.h. powołanie tej samej osoby na członka zarządu może nastąpić nie wcześniej niż na rok przed upływem bieżącej kadencji członka zarządu.',
    difficulty: 'hard',
    tags: ['ponowne powołanie', 'kadencja', 'zarząd', 'S.A.']
  },

  {
    id: 'ksh-718',
    article: 'Art. 383 § 1',
    articleTitle: 'Delegowanie członka RN do zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może delegować swoich członków do czasowego wykonywania czynności członków zarządu na okres nie dłuższy niż:',
    options: {
      a: 'Miesiąc',
      b: 'Trzy miesiące',
      c: 'Sześć miesięcy',
      d: 'Rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 383 § 1 k.s.h. rada nadzorcza może delegować swoich członków do czasowego wykonywania czynności członków zarządu, którzy nie mogą sprawować swoich czynności, na okres nie dłuższy niż trzy miesiące.',
    difficulty: 'hard',
    tags: ['delegowanie', 'rada nadzorcza', 'zarząd', 'termin']
  },

  {
    id: 'ksh-719',
    article: 'Art. 384 § 1',
    articleTitle: 'Zgoda RN na czynności zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Statut S.A. może przewidywać, że zarząd jest obowiązany uzyskać zgodę rady nadzorczej przed dokonaniem określonych czynności. Jeżeli rada nadzorcza nie wyrazi zgody na określoną czynność:',
    options: {
      a: 'Czynność jest nieważna',
      b: 'Zarząd może się zwrócić do walnego zgromadzenia o podjęcie uchwały udzielającej zgody na dokonanie tej czynności',
      c: 'Zarząd musi zrezygnować z czynności',
      d: 'Zarząd może działać samodzielnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 384 § 2 k.s.h. jeżeli rada nadzorcza nie wyrazi zgody na określoną czynność, zarząd może zwrócić się do walnego zgromadzenia o podjęcie uchwały udzielającej zgody na dokonanie tej czynności.',
    difficulty: 'hard',
    tags: ['zgoda RN', 'walne zgromadzenie', 'zarząd', 'S.A.']
  },

  {
    id: 'ksh-720',
    article: 'Art. 388 § 1',
    articleTitle: 'Zwoływanie RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Posiedzenia rady nadzorczej S.A. zwołuje:',
    options: {
      a: 'Zarząd',
      b: 'Przewodniczący rady nadzorczej',
      c: 'Walne zgromadzenie',
      d: 'Każdy członek rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 389 § 1 k.s.h. przewodniczący rady nadzorczej lub jego zastępca zwołuje posiedzenia rady nadzorczej.',
    difficulty: 'medium',
    tags: ['zwoływanie', 'rada nadzorcza', 'przewodniczący', 'S.A.']
  },

  {
    id: 'ksh-721',
    article: 'Art. 389 § 2',
    articleTitle: 'Żądanie zwołania RN',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Przewodniczący RN S.A. jest obowiązany zwołać posiedzenie na pisemny wniosek:',
    options: {
      a: 'Tylko zarządu',
      b: 'Zarządu lub członka rady nadzorczej',
      c: 'Tylko akcjonariuszy',
      d: 'Tylko walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 389 § 2 k.s.h. przewodniczący rady nadzorczej jest obowiązany zwołać posiedzenie rady nadzorczej na pisemny wniosek zarządu lub członka rady nadzorczej, w terminie dwóch tygodni od dnia otrzymania wniosku.',
    difficulty: 'medium',
    tags: ['żądanie zwołania', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-722',
    article: 'Art. 382 § 3',
    articleTitle: 'Szczególne obowiązki RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Do szczególnych obowiązków rady nadzorczej S.A. należy:',
    options: {
      a: 'Prowadzenie spraw spółki',
      b: 'Ocena sprawozdań i wniosków zarządu co do podziału zysku, składanie walnemu zgromadzeniu sprawozdania z wyników tej oceny',
      c: 'Reprezentowanie spółki',
      d: 'Zawieranie umów handlowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 382 § 3 k.s.h. do szczególnych obowiązków rady nadzorczej należy ocena sprawozdań zarządu z działalności spółki oraz sprawozdania finansowego za ubiegły rok obrotowy, w zakresie ich zgodności z księgami i dokumentami, jak i ze stanem faktycznym, oraz wniosków zarządu dotyczących podziału zysku albo pokrycia straty, a także składanie walnemu zgromadzeniu corocznego pisemnego sprawozdania z wyników tej oceny.',
    difficulty: 'medium',
    tags: ['obowiązki', 'rada nadzorcza', 'sprawozdania', 'S.A.']
  },

  // ============================================================
  // WALNE ZGROMADZENIE S.A. - SZCZEGÓŁY
  // ============================================================

  {
    id: 'ksh-723',
    article: 'Art. 399 § 2',
    articleTitle: 'Zwołanie WZ przez RN',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może zwołać zwyczajne walne zgromadzenie:',
    options: {
      a: 'W każdym czasie',
      b: 'Jeżeli zarząd nie zwoła go w terminie określonym w ustawie lub statucie',
      c: 'Tylko za zgodą akcjonariuszy',
      d: 'Nigdy, to wyłączna kompetencja zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 399 § 2 k.s.h. rada nadzorcza może zwołać zwyczajne walne zgromadzenie, jeżeli zarząd nie zwoła go w terminie określonym w ustawie lub statucie, oraz nadzwyczajne walne zgromadzenie, jeżeli zwołanie go uzna za wskazane.',
    difficulty: 'medium',
    tags: ['zwołanie WZ', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-724',
    article: 'Art. 401 § 1',
    articleTitle: 'Umieszczenie spraw w porządku obrad',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusze S.A. reprezentujący co najmniej 1/20 kapitału zakładowego mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno być zgłoszone zarządowi:',
    options: {
      a: 'Na 7 dni przed terminem zgromadzenia',
      b: 'Nie później niż na dwadzieścia jeden dni przed wyznaczonym terminem zgromadzenia',
      c: 'Na 14 dni przed terminem zgromadzenia',
      d: 'Na miesiąc przed terminem zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 401 § 1 k.s.h. akcjonariusze reprezentujący co najmniej 1/20 kapitału zakładowego mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno być zgłoszone zarządowi nie później niż na dwadzieścia jeden dni przed wyznaczonym terminem zgromadzenia.',
    difficulty: 'hard',
    tags: ['porządek obrad', 'akcjonariusze', '21 dni', 'S.A.']
  },

  {
    id: 'ksh-725',
    article: 'Art. 405 § 1',
    articleTitle: 'Uchwały poza porządkiem obrad S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwały można powziąć pomimo braku formalnego zwołania walnego zgromadzenia S.A., jeżeli:',
    options: {
      a: 'Obecni są akcjonariusze reprezentujący 50% kapitału',
      b: 'Cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu dotyczącego odbycia walnego zgromadzenia lub wniesienia poszczególnych spraw do porządku obrad',
      c: 'Zarząd wyrazi zgodę',
      d: 'Rada nadzorcza zatwierdzi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 405 § 1 k.s.h. uchwały można powziąć pomimo braku formalnego zwołania walnego zgromadzenia, jeżeli cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu dotyczącego odbycia walnego zgromadzenia lub wniesienia poszczególnych spraw do porządku obrad.',
    difficulty: 'medium',
    tags: ['WZ bez zwołania', 'cały kapitał', 'sprzeciw', 'S.A.']
  },

  {
    id: 'ksh-726',
    article: 'Art. 412 § 1',
    articleTitle: 'Pełnomocnik na WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz S.A. może uczestniczyć w walnym zgromadzeniu oraz wykonywać prawo głosu przez pełnomocnika. Pełnomocnikiem NIE może być:',
    options: {
      a: 'Adwokat',
      b: 'Członek zarządu i pracownik spółki',
      c: 'Inny akcjonariusz',
      d: 'Radca prawny'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 412 § 1 k.s.h. akcjonariusz może uczestniczyć w walnym zgromadzeniu oraz wykonywać prawo głosu osobiście lub przez pełnomocnika. Pełnomocnikiem nie może być członek zarządu ani pracownik spółki.',
    difficulty: 'medium',
    tags: ['pełnomocnik', 'WZ', 'zakaz', 'S.A.']
  },

  {
    id: 'ksh-727',
    article: 'Art. 412 § 2',
    articleTitle: 'Forma pełnomocnictwa na WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Pełnomocnictwo do uczestnictwa w walnym zgromadzeniu S.A. i wykonywania prawa głosu wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej lub elektronicznej',
      c: 'Aktu notarialnego',
      d: 'Pisemnej z podpisami notarialnie poświadczonymi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 412 § 2 k.s.h. pełnomocnictwo do uczestniczenia w walnym zgromadzeniu spółki i wykonywania prawa głosu wymaga udzielenia na piśmie lub w postaci elektronicznej pod rygorem nieważności.',
    difficulty: 'medium',
    tags: ['pełnomocnictwo', 'forma', 'WZ', 'S.A.']
  },

  {
    id: 'ksh-728',
    article: 'Art. 420 § 1',
    articleTitle: 'Tajne głosowanie na WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Głosowanie na walnym zgromadzeniu S.A. jest TAJNE:',
    options: {
      a: 'Zawsze',
      b: 'Przy wyborach oraz nad wnioskami o odwołanie członków organów spółki, o pociągnięcie ich do odpowiedzialności, jak również w sprawach osobowych',
      c: 'Nigdy',
      d: 'Tylko nad zmianą statutu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 420 § 1 k.s.h. głosowanie jest tajne przy wyborach oraz nad wnioskami o odwołanie członków organów spółki lub likwidatorów, o pociągnięcie ich do odpowiedzialności, jak również w sprawach osobowych. Poza tym tajne głosowanie zarządza się na żądanie choćby jednego z akcjonariuszy obecnych lub reprezentowanych na walnym zgromadzeniu.',
    difficulty: 'medium',
    tags: ['głosowanie tajne', 'WZ', 'wybory', 'S.A.']
  },

  // ============================================================
  // PRZEPISY OGÓLNE O SPÓŁKACH KAPITAŁOWYCH
  // ============================================================

  {
    id: 'ksh-729',
    article: 'Art. 14 § 1',
    articleTitle: 'Przedmiot wkładu',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Przedmiotem wkładu niepieniężnego do spółki kapitałowej NIE może być:',
    options: {
      a: 'Nieruchomość',
      b: 'Prawo niezbywalne lub świadczenie pracy bądź usług',
      c: 'Maszyny i urządzenia',
      d: 'Wierzytelność'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 14 § 1 k.s.h. przedmiotem wkładu do spółki kapitałowej nie może być prawo niezbywalne lub świadczenie pracy bądź usług.',
    difficulty: 'easy',
    tags: ['wkład niepieniężny', 'zakaz', 'spółki kapitałowe']
  },

  {
    id: 'ksh-730',
    article: 'Art. 15 § 1',
    articleTitle: 'Zawarcie przez spółkę umowy kredytu',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zawarcie przez spółkę kapitałową umowy kredytu, pożyczki, poręczenia lub innej podobnej umowy z członkiem zarządu, rady nadzorczej, komisji rewizyjnej, prokurentem, likwidatorem albo na rzecz którejkolwiek z tych osób wymaga:',
    options: {
      a: 'Zgody zarządu',
      b: 'Zgody zgromadzenia wspólników albo walnego zgromadzenia, chyba że ustawa stanowi inaczej',
      c: 'Formy aktu notarialnego',
      d: 'Zgody sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 15 § 1 k.s.h. zawarcie przez spółkę kapitałową umowy kredytu, pożyczki, poręczenia lub innej podobnej umowy z członkiem zarządu, rady nadzorczej, komisji rewizyjnej, prokurentem, likwidatorem albo na rzecz którejkolwiek z tych osób, wymaga zgody zgromadzenia wspólników albo walnego zgromadzenia, chyba że ustawa stanowi inaczej.',
    difficulty: 'hard',
    tags: ['umowa z organami', 'zgoda zgromadzenia', 'spółki kapitałowe']
  },

  {
    id: 'ksh-731',
    article: 'Art. 20',
    articleTitle: 'Równe traktowanie wspólników/akcjonariuszy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wspólnicy albo akcjonariusze spółki kapitałowej powinni być traktowani:',
    options: {
      a: 'Proporcjonalnie do wkładów',
      b: 'Jednakowo w takich samych okolicznościach',
      c: 'Według uznania zarządu',
      d: 'Według stażu w spółce'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 20 k.s.h. wspólnicy albo akcjonariusze spółki kapitałowej powinni być traktowani jednakowo w takich samych okolicznościach.',
    difficulty: 'easy',
    tags: ['równe traktowanie', 'wspólnicy', 'akcjonariusze']
  },

  // ============================================================
  // SYSTEM S24 - SP. Z O.O.
  // ============================================================

  {
    id: 'ksh-732',
    article: 'Art. 157¹ § 1',
    articleTitle: 'Zawarcie umowy przez internet (S24)',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa sp. z o.o. może być również zawarta przy wykorzystaniu wzorca umowy udostępnianego w systemie teleinformatycznym (S24). W tym przypadku umowa jest zawierana:',
    options: {
      a: 'W formie aktu notarialnego',
      b: 'Poprzez wypełnienie formularza umowy i opatrzenie umowy kwalifikowanym podpisem elektronicznym, podpisem zaufanym albo podpisem osobistym',
      c: 'W formie pisemnej',
      d: 'Ustnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157¹ § 1 k.s.h. umowa spółki z o.o. może być zawarta również przy wykorzystaniu wzorca umowy. Zawarcie umowy wymaga wypełnienia formularza umowy udostępnionego w systemie teleinformatycznym i opatrzenia umowy kwalifikowanym podpisem elektronicznym, podpisem zaufanym albo podpisem osobistym.',
    difficulty: 'medium',
    tags: ['S24', 'wzorzec umowy', 'podpis elektroniczny']
  },

  {
    id: 'ksh-733',
    article: 'Art. 157¹ § 2',
    articleTitle: 'Wkłady w spółce S24',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W sp. z o.o. utworzonej przy wykorzystaniu wzorca umowy (S24), na pokrycie kapitału zakładowego wnosi się:',
    options: {
      a: 'Wkłady pieniężne i niepieniężne',
      b: 'Wyłącznie wkłady pieniężne',
      c: 'Wyłącznie wkłady niepieniężne',
      d: 'Wkłady w postaci pracy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157¹ § 2 k.s.h. w przypadku spółki założonej przy wykorzystaniu wzorca umowy (S24), na pokrycie kapitału zakładowego wnosi się wyłącznie wkłady pieniężne.',
    difficulty: 'medium',
    tags: ['S24', 'wkłady pieniężne', 'sp. z o.o.']
  },

  {
    id: 'ksh-734',
    article: 'Art. 158 § 1¹',
    articleTitle: 'Termin wniesienia wkładów S24',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W sp. z o.o. utworzonej przy wykorzystaniu wzorca umowy (S24), wkłady pieniężne na pokrycie kapitału zakładowego powinny być wniesione:',
    options: {
      a: 'Przed podpisaniem umowy',
      b: 'Nie później niż w terminie siedmiu dni od dnia wpisu spółki do rejestru',
      c: 'Przed wpisem do rejestru',
      d: 'W terminie 6 miesięcy od dnia wpisu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 158 § 1¹ k.s.h. w przypadku spółki, której umowa została zawarta przy wykorzystaniu wzorca umowy, wkłady pieniężne na pokrycie kapitału zakładowego powinny zostać wniesione przez wspólników w terminie siedmiu dni od dnia jej wpisu do rejestru.',
    difficulty: 'hard',
    tags: ['S24', 'termin wniesienia wkładów', 'sp. z o.o.', 'liczby']
  },

  // ============================================================
  // DODATKOWE PRZEPISY - SP. Z O.O.
  // ============================================================

  {
    id: 'ksh-735',
    article: 'Art. 159',
    articleTitle: 'Szczególne korzyści dla wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wspólnikowi sp. z o.o. mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone oprócz wniesienia wkładów na pokrycie udziałów inne obowiązki wobec spółki:',
    options: {
      a: 'Wystarczy uchwała wspólników',
      b: 'Należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki',
      c: 'Wystarczy zgoda zarządu',
      d: 'Wystarczy wpis do KRS'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 159 k.s.h. jeżeli wspólnikowi mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone oprócz wniesienia wkładów inne obowiązki wobec spółki, należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki.',
    difficulty: 'medium',
    tags: ['szczególne korzyści', 'umowa spółki', 'bezskuteczność']
  },

  {
    id: 'ksh-736',
    article: 'Art. 162',
    articleTitle: 'Nazwa spółki w organizacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Firma sp. z o.o. w organizacji powinna zawierać dodatkowe oznaczenie:',
    options: {
      a: '"W organizacji"',
      b: '"W likwidacji"',
      c: '"Tymczasowa"',
      d: 'Nie wymaga dodatkowego oznaczenia'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 11 § 3 k.s.h. firma spółki kapitałowej w organizacji powinna zawierać dodatkowe oznaczenie "w organizacji".',
    difficulty: 'easy',
    tags: ['spółka w organizacji', 'firma', 'sp. z o.o.']
  },

  {
    id: 'ksh-737',
    article: 'Art. 163 pkt 3',
    articleTitle: 'Warunki powstania sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania sp. z o.o. wymaga się m.in.:',
    options: {
      a: 'Powołania tylko zarządu',
      b: 'Powołania zarządu, a jeżeli wymaga tego ustawa lub umowa - również rady nadzorczej lub komisji rewizyjnej',
      c: 'Powołania tylko rady nadzorczej',
      d: 'Powołania zgromadzenia wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 163 pkt 3 k.s.h. do powstania sp. z o.o. wymaga się ustanowienia zarządu oraz rady nadzorczej lub komisji rewizyjnej, jeżeli wymaga tego ustawa lub umowa spółki.',
    difficulty: 'medium',
    tags: ['powstanie spółki', 'organy', 'sp. z o.o.']
  },

  {
    id: 'ksh-738',
    article: 'Art. 166',
    articleTitle: 'Zgłoszenie do rejestru - elementy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zgłoszenie sp. z o.o. do sądu rejestrowego powinno zawierać m.in.:',
    options: {
      a: 'Tylko firmę spółki',
      b: 'Firmę, siedzibę i adres spółki, przedmiot działalności, wysokość kapitału zakładowego, dane członków zarządu, sposób reprezentacji',
      c: 'Tylko dane wspólników',
      d: 'Tylko wysokość kapitału'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 166 k.s.h. zgłoszenie sp. z o.o. do sądu rejestrowego powinno zawierać m.in.: firmę, siedzibę i adres spółki, przedmiot działalności, wysokość kapitału zakładowego, czy wspólnik może mieć jeden czy więcej udziałów, nazwiska, imiona i adresy członków zarządu oraz sposób reprezentowania spółki.',
    difficulty: 'medium',
    tags: ['zgłoszenie', 'rejestr', 'elementy', 'sp. z o.o.']
  },

  {
    id: 'ksh-739',
    article: 'Art. 167 § 1',
    articleTitle: 'Załączniki do zgłoszenia',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do zgłoszenia sp. z o.o. należy dołączyć m.in.:',
    options: {
      a: 'Tylko umowę spółki',
      b: 'Umowę spółki, oświadczenie wszystkich członków zarządu, że wkłady na pokrycie kapitału zakładowego zostały wniesione, listę wspólników',
      c: 'Tylko listę wspólników',
      d: 'Tylko oświadczenie o wniesieniu wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 167 § 1 k.s.h. do zgłoszenia należy dołączyć m.in.: umowę spółki, oświadczenie wszystkich członków zarządu, że wkłady na pokrycie kapitału zakładowego zostały przez wszystkich wspólników w całości wniesione, dowód ustanowienia organów spółki, listę wspólników podpisaną przez wszystkich członków zarządu.',
    difficulty: 'medium',
    tags: ['załączniki', 'zgłoszenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-740',
    article: 'Art. 169',
    articleTitle: 'Skutek niezgłoszenia w terminie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli sp. z o.o. nie została zgłoszona do rejestru w terminie 6 miesięcy od dnia zawarcia umowy spółki:',
    options: {
      a: 'Umowa spółki ulega rozwiązaniu',
      b: 'Spółka działa dalej jako spółka w organizacji',
      c: 'Sąd wpisuje spółkę z urzędu',
      d: 'Spółka przekształca się w spółkę jawną'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 169 k.s.h. jeżeli zawiązanie spółki nie zostało zgłoszone do sądu rejestrowego w terminie sześciu miesięcy od dnia zawarcia umowy spółki albo jeżeli postanowienie sądu odmawiające zarejestrowania stało się prawomocne, umowa spółki ulega rozwiązaniu.',
    difficulty: 'medium',
    tags: ['niezgłoszenie', 'rozwiązanie', 'sp. z o.o.']
  },

  // ============================================================
  // PYTANIA PRZEKROJOWE - MIESZANE
  // ============================================================

  {
    id: 'ksh-741',
    article: 'Art. 202 § 1',
    articleTitle: 'Mandat członka zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli umowa sp. z o.o. nie stanowi inaczej, mandat członka zarządu wygasa:',
    options: {
      a: 'Po upływie roku',
      b: 'Z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji członka zarządu',
      c: 'Po upływie kadencji',
      d: 'Z końcem roku kalendarzowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 1 k.s.h. jeżeli umowa spółki nie stanowi inaczej, mandat członka zarządu wygasa z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji członka zarządu.',
    difficulty: 'hard',
    tags: ['mandat', 'zarząd', 'wygaśnięcie', 'sp. z o.o.']
  },

  {
    id: 'ksh-742',
    article: 'Art. 202 § 2',
    articleTitle: 'Mandat przy kadencji dłuższej niż rok',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku powołania członka zarządu sp. z o.o. na okres dłuższy niż rok, mandat wygasa:',
    options: {
      a: 'Po upływie kadencji',
      b: 'Z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za ostatni pełny rok obrotowy pełnienia funkcji',
      c: 'Z końcem roku kalendarzowego',
      d: 'W dniu powołania następcy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 2 k.s.h. w przypadku powołania członka zarządu na okres dłuższy niż rok, mandat członka zarządu wygasa z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za ostatni pełny rok obrotowy pełnienia funkcji członka zarządu, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['mandat', 'kadencja', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-743',
    article: 'Art. 208 § 2',
    articleTitle: 'Sprzeciw członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Każdy członek zarządu sp. z o.o. może prowadzić bez uprzedniej uchwały zarządu sprawy nieprzekraczające zakresu zwykłych czynności spółki. Jeżeli jednak przed załatwieniem sprawy choćby jeden z pozostałych członków zarządu sprzeciwi się jej przeprowadzeniu:',
    options: {
      a: 'Sprawa musi być odłożona na następny rok',
      b: 'Wymagana jest uchwała zarządu',
      c: 'Decyduje prezes zarządu',
      d: 'Decyduje zgromadzenie wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 208 § 2 i 3 k.s.h. jeżeli przed załatwieniem sprawy choćby jeden z pozostałych członków zarządu sprzeciwi się jej przeprowadzeniu, wymagana jest uprzednia uchwała zarządu.',
    difficulty: 'medium',
    tags: ['sprzeciw', 'zarząd', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-744',
    article: 'Art. 209',
    articleTitle: 'Sprzeczność interesów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku sprzeczności interesów spółki z interesami członka zarządu sp. z o.o., jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób z którymi jest powiązany osobiście, członek zarządu powinien:',
    options: {
      a: 'Kontynuować działanie',
      b: 'Wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole',
      c: 'Zrezygnować z funkcji',
      d: 'Poinformować sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 209 k.s.h. w przypadku sprzeczności interesów spółki z interesami członka zarządu, jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób, z którymi jest powiązany osobiście, członek zarządu powinien wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole.',
    difficulty: 'medium',
    tags: ['sprzeczność interesów', 'zarząd', 'wstrzymanie się']
  },

  {
    id: 'ksh-745',
    article: 'Art. 212 § 1',
    articleTitle: 'Prawo kontroli wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo kontroli w sp. z o.o. służy:',
    options: {
      a: 'Tylko radzie nadzorczej',
      b: 'Każdemu wspólnikowi, który może przeglądać księgi i dokumenty spółki, sporządzać bilans, żądać wyjaśnień od zarządu',
      c: 'Tylko wspólnikom mającym więcej niż 10% udziałów',
      d: 'Tylko biegłemu rewidentowi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 212 § 1 k.s.h. prawo kontroli służy każdemu wspólnikowi. W tym celu wspólnik lub wspólnik z upoważnioną przez siebie osobą może przeglądać księgi i dokumenty spółki, sporządzać bilans dla swego użytku lub żądać wyjaśnień od zarządu.',
    difficulty: 'easy',
    tags: ['prawo kontroli', 'wspólnik', 'sp. z o.o.']
  },

  {
    id: 'ksh-746',
    article: 'Art. 212 § 2',
    articleTitle: 'Odmowa prawa kontroli',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zarząd sp. z o.o. może odmówić wspólnikowi wyjaśnień oraz udostępnienia do wglądu ksiąg i dokumentów spółki, jeżeli:',
    options: {
      a: 'Wspólnik ma mniej niż 10% udziałów',
      b: 'Istnieje uzasadniona obawa, że wspólnik wykorzysta je w celach sprzecznych z interesem spółki i przez to wyrządzi spółce znaczną szkodę',
      c: 'Zarząd tak postanowi',
      d: 'Wspólnik nie zapłacił dywidendy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 212 § 2 k.s.h. zarząd może odmówić wspólnikowi wyjaśnień oraz udostępnienia do wglądu ksiąg i dokumentów spółki, jeżeli istnieje uzasadniona obawa, że wspólnik wykorzysta je w celach sprzecznych z interesem spółki i przez to wyrządzi spółce znaczną szkodę.',
    difficulty: 'medium',
    tags: ['odmowa kontroli', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-747',
    article: 'Art. 223',
    articleTitle: 'Odwołanie członka RN przez wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli umowa sp. z o.o. przyznaje wspólnikowi uprawnienie do powołania lub odwołania członków rady nadzorczej:',
    options: {
      a: 'Uprawnienie to jest niezbywalne',
      b: 'Odwołanie wymaga uchwały zgromadzenia wspólników',
      c: 'Uprawnienie to wykonuje się przez oświadczenie złożone spółce',
      d: 'Odwołanie wymaga zgody sądu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 216 § 2 k.s.h. jeżeli umowa spółki przyznaje wspólnikowi uprawnienie osobiste do powołania lub odwołania członków organów nadzoru, uprawnienie to wykonuje się przez oświadczenie złożone spółce.',
    difficulty: 'hard',
    tags: ['uprawnienie osobiste', 'RN', 'sp. z o.o.']
  },

  {
    id: 'ksh-748',
    article: 'Art. 227 § 1',
    articleTitle: 'Sposoby podejmowania uchwał w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały wspólników sp. z o.o. są podejmowane:',
    options: {
      a: 'Tylko na zgromadzeniu wspólników',
      b: 'Na zgromadzeniu wspólników lub poza zgromadzeniem - pisemnie, jeżeli wszyscy wspólnicy wyrażą na piśmie zgodę na postanowienie lub na głosowanie pisemne',
      c: 'Tylko pisemnie',
      d: 'Tylko ustnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 227 § 2 k.s.h. uchwały wspólników mogą być powzięte na zgromadzeniu wspólników lub poza zgromadzeniem. Bez odbycia zgromadzenia wspólników mogą być powzięte uchwały, jeżeli wszyscy wspólnicy wyrażą na piśmie zgodę na postanowienie, które ma być powzięte, albo na głosowanie pisemne.',
    difficulty: 'medium',
    tags: ['uchwały', 'zgromadzenie', 'głosowanie pisemne', 'sp. z o.o.']
  },

  {
    id: 'ksh-749',
    article: 'Art. 241',
    articleTitle: 'Protokół zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników sp. z o.o. powinny być wpisane do księgi protokołów i:',
    options: {
      a: 'Podpisane tylko przez przewodniczącego',
      b: 'Podpisane przez obecnych lub co najmniej przez przewodniczącego i osobę sporządzającą protokół',
      c: 'Podpisane przez wszystkich wspólników',
      d: 'Nie wymagają podpisów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 248 § 1 k.s.h. uchwały zgromadzenia wspólników powinny być wpisane do księgi protokołów i podpisane przez obecnych lub co najmniej przez przewodniczącego i osobę sporządzającą protokół.',
    difficulty: 'medium',
    tags: ['protokół', 'zgromadzenie', 'podpisy', 'sp. z o.o.']
  },

  {
    id: 'ksh-750',
    article: 'Art. 254 § 1',
    articleTitle: 'Skutek wyroku uchylającego/nieważność',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawomocny wyrok uchylający uchwałę lub stwierdzający nieważność uchwały wspólników sp. z o.o. ma moc:',
    options: {
      a: 'Tylko między stronami',
      b: 'Obowiązującą w stosunkach między spółką a wszystkimi wspólnikami oraz między spółką a członkami organów spółki',
      c: 'Tylko wobec spółki',
      d: 'Tylko wobec wspólników którzy głosowali przeciw'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 254 § 1 k.s.h. prawomocny wyrok uchylający uchwałę ma moc obowiązującą w stosunkach między spółką a wszystkimi wspólnikami oraz między spółką a członkami organów spółki.',
    difficulty: 'hard',
    tags: ['wyrok', 'moc', 'erga omnes', 'sp. z o.o.']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART9_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART9.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART9.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART9.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART9.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    pulapki: KSH_EXAM_QUESTIONS_PART9.filter(q => q.section.includes('Pułapki')).length,
    kazusy: KSH_EXAM_QUESTIONS_PART9.filter(q => q.section.includes('Kazusy')).length,
    spzoo: KSH_EXAM_QUESTIONS_PART9.filter(q => q.section.includes('Spółka z o.o.')).length,
    sa: KSH_EXAM_QUESTIONS_PART9.filter(q => q.section.includes('Spółka akcyjna')).length,
  }
};

console.log('KSH Part 9 loaded:', PART9_STATS);
