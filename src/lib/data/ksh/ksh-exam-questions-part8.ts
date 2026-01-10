// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 8 - 80 pytań: SP. Z O.O. i S.A. - Kazusy i szczegóły
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART8: ExamQuestion[] = [

  // ============================================================
  // KAZUSY EGZAMINACYJNE - SP. Z O.O.
  // ============================================================

  {
    id: 'ksh-646',
    article: 'Art. 17 § 1 i § 2',
    articleTitle: 'Kazus: Czynność bez uchwały',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Zarząd sp. z o.o. zawarł umowę sprzedaży nieruchomości bez wymaganej przez USTAWĘ uchwały wspólników. Umowa jest:',
    options: {
      a: 'Ważna, ale zarząd odpowiada wobec spółki',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona do czasu potwierdzenia',
      d: 'Wzruszalna w terminie roku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. jeżeli do dokonania czynności prawnej przez spółkę ustawa wymaga uchwały wspólników albo walnego zgromadzenia bądź rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest nieważna.',
    difficulty: 'hard',
    tags: ['kazus', 'nieważność', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-647',
    article: 'Art. 17 § 1 i § 2',
    articleTitle: 'Kazus: Czynność bez uchwały z umowy',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Zarząd sp. z o.o. zawarł umowę bez wymaganej przez UMOWĘ SPÓŁKI (nie ustawę) uchwały wspólników. Umowa jest:',
    options: {
      a: 'Nieważna',
      b: 'Ważna, ale członkowie zarządu mogą odpowiadać wobec spółki za szkodę',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 2 k.s.h. czynność prawna dokonana bez zgody wymaganej wyłącznie przez umowę spółki lub statut jest ważna, jednakże nie wyklucza to odpowiedzialności członków zarządu wobec spółki z tytułu naruszenia umowy spółki.',
    difficulty: 'hard',
    tags: ['kazus', 'ważność', 'umowa spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-648',
    article: 'Art. 210 § 2',
    articleTitle: 'Kazus: Jedyny wspólnik-prezes',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Jan Kowalski jest jedynym wspólnikiem i jedynym członkiem zarządu sp. z o.o. Chce zawrzeć ze spółką umowę pożyczki. Umowa wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z datą pewną',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 210 § 2 k.s.h. w przypadku gdy wspólnik jest zarazem jedynym członkiem zarządu, czynność prawna między tym wspólnikiem a reprezentowaną przez niego spółką wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['kazus', 'akt notarialny', 'jednoosobowa spółka', 'sp. z o.o.']
  },

  {
    id: 'ksh-649',
    article: 'Art. 182',
    articleTitle: 'Kazus: Zbycie udziału bez zgody',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Umowa sp. z o.o. wymaga zgody spółki na zbycie udziału. Wspólnik zbył udział bez tej zgody. Zbycie jest:',
    options: {
      a: 'Nieważne',
      b: 'Ważne między stronami, ale bezskuteczne wobec spółki',
      c: 'Ważne i skuteczne',
      d: 'Wzruszalne'
    },
    correct: 'b',
    explanation: 'Zgodnie z orzecznictwem i doktryną zbycie udziału bez wymaganej zgody spółki jest ważne między stronami umowy, ale bezskuteczne wobec spółki do czasu wyrażenia zgody.',
    difficulty: 'hard',
    tags: ['kazus', 'zbycie udziału', 'zgoda spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-650',
    article: 'Art. 240',
    articleTitle: 'Kazus: Zgromadzenie bez zwołania',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Na nieformalnym spotkaniu w sp. z o.o. obecni są wspólnicy reprezentujący 100% kapitału. Jeden z nich zgłasza sprzeciw co do odbycia zgromadzenia. Czy można podjąć uchwały?',
    options: {
      a: 'Tak, bo jest 100% kapitału',
      b: 'Nie, bo jeden wspólnik zgłosił sprzeciw',
      c: 'Tak, ale tylko większością 3/4',
      d: 'Tak, ale tylko w sprawach zwykłego zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 240 k.s.h. uchwały można powziąć bez formalnego zwołania, jeżeli cały kapitał jest reprezentowany, a NIKT z obecnych nie zgłosił sprzeciwu. Sprzeciw jednego wspólnika blokuje możliwość podjęcia uchwał.',
    difficulty: 'hard',
    tags: ['kazus', 'zgromadzenie bez zwołania', 'sprzeciw', 'sp. z o.o.']
  },

  {
    id: 'ksh-651',
    article: 'Art. 299',
    articleTitle: 'Kazus: Odpowiedzialność zarządu',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Wierzyciel uzyskał tytuł wykonawczy przeciwko sp. z o.o. Egzekucja okazała się bezskuteczna. Członek zarządu wykazał, że we właściwym czasie złożył wniosek o ogłoszenie upadłości. Czy odpowiada za dług spółki?',
    options: {
      a: 'Tak, bo jest członkiem zarządu',
      b: 'Nie, bo wykazał przesłankę egzoneracyjną z art. 299 § 2',
      c: 'Tak, ale tylko w połowie',
      d: 'Nie, bo wierzyciel musi pozwać spółkę ponownie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może się uwolnić od odpowiedzialności, jeżeli wykaże, że we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości.',
    difficulty: 'hard',
    tags: ['kazus', 'art. 299', 'przesłanki egzoneracyjne', 'sp. z o.o.']
  },

  {
    id: 'ksh-652',
    article: 'Art. 250',
    articleTitle: 'Kazus: Legitymacja do zaskarżenia uchwały',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Wspólnik sp. z o.o. głosował ZA uchwałą, ale teraz chce ją zaskarżyć. Czy ma legitymację?',
    options: {
      a: 'Tak, każdy wspólnik może zaskarżyć',
      b: 'Nie, bo głosował za uchwałą i nie zażądał zaprotokołowania sprzeciwu',
      c: 'Tak, ale tylko w ciągu 7 dni',
      d: 'Tak, jeśli uchwała jest sprzeczna z ustawą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 250 pkt 2 k.s.h. wspólnik ma legitymację do zaskarżenia uchwały, jeśli głosował przeciwko uchwale i po jej powzięciu zażądał zaprotokołowania sprzeciwu. Wspólnik który głosował za nie ma legitymacji.',
    difficulty: 'hard',
    tags: ['kazus', 'legitymacja', 'zaskarżenie uchwały', 'sp. z o.o.']
  },

  {
    id: 'ksh-653',
    article: 'Art. 229',
    articleTitle: 'Kazus: Nabycie nieruchomości',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Sp. z o.o. z kapitałem 100.000 zł, zarejestrowana rok temu, chce kupić nieruchomość za 30.000 zł. Czy potrzebna jest uchwała wspólników?',
    options: {
      a: 'Tak, zawsze przy nabyciu nieruchomości',
      b: 'Tak, bo 30.000 zł > 1/4 kapitału (25.000 zł) i spółka istnieje krócej niż 2 lata',
      c: 'Nie, bo 30.000 zł < 50.000 zł',
      d: 'Nie, bo minął rok od rejestracji'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 229 k.s.h. uchwała jest wymagana gdy cena przewyższa 1/4 kapitału (tu: 25.000 zł), ale NIE NIŻSZĄ niż 50.000 zł. Ponieważ 30.000 zł < 50.000 zł, uchwała nie jest wymagana.',
    difficulty: 'hard',
    tags: ['kazus', 'nabycie nieruchomości', 'art. 229', 'sp. z o.o.']
  },

  {
    id: 'ksh-654',
    article: 'Art. 230',
    articleTitle: 'Kazus: Zobowiązanie ponad 2x kapitał',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Sp. z o.o. z kapitałem 50.000 zł chce zaciągnąć kredyt na 120.000 zł. Czy potrzebna jest uchwała wspólników?',
    options: {
      a: 'Nie, zarząd może samodzielnie',
      b: 'Tak, bo 120.000 zł > 2 × 50.000 zł (100.000 zł)',
      c: 'Tak, ale tylko jeśli umowa spółki tak stanowi',
      d: 'Nie, bo to zwykła działalność'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 230 k.s.h. zaciągnięcie zobowiązania o wartości dwukrotnie przewyższającej kapitał zakładowy wymaga uchwały wspólników. 120.000 zł > 100.000 zł (2 × 50.000 zł), więc uchwała jest wymagana.',
    difficulty: 'medium',
    tags: ['kazus', 'art. 230', 'zobowiązanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-655',
    article: 'Art. 244',
    articleTitle: 'Kazus: Głosowanie nad absolutorium',
    section: 'Kazusy egzaminacyjne',
    subsection: 'Sp. z o.o.',
    question: 'Wspólnik sp. z o.o. jest jednocześnie członkiem zarządu. Czy może głosować nad uchwałą w sprawie udzielenia mu absolutorium?',
    options: {
      a: 'Tak, jako wspólnik ma prawo głosu',
      b: 'Nie, jest wyłączony od głosowania',
      c: 'Tak, ale tylko jeśli ma więcej niż 50% udziałów',
      d: 'Tak, ale jego głos nie liczy się do większości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 244 k.s.h. wspólnik nie może głosować przy uchwałach dotyczących jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium.',
    difficulty: 'medium',
    tags: ['kazus', 'wyłączenie od głosowania', 'absolutorium', 'sp. z o.o.']
  },

  // ============================================================
  // KAZUSY EGZAMINACYJNE - S.A.
  // ============================================================

  {
    id: 'ksh-656',
    article: 'Art. 368 § 4',
    articleTitle: 'Kazus: Powołanie zarządu S.A.',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'Statut S.A. nie zawiera szczególnych postanowień o powoływaniu zarządu. Kto powołuje członków zarządu?',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza',
      c: 'Założyciele',
      d: 'Akcjonariusze większościowi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 368 § 4 k.s.h. członków zarządu powołuje i odwołuje rada nadzorcza, chyba że statut spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['kazus', 'powoływanie zarządu', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-657',
    article: 'Art. 379 § 1',
    articleTitle: 'Kazus: Umowa z członkiem zarządu S.A.',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'S.A. chce zawrzeć umowę o pracę z członkiem zarządu. Kto reprezentuje spółkę przy zawarciu tej umowy?',
    options: {
      a: 'Pozostali członkowie zarządu',
      b: 'Rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia',
      c: 'Prokurent',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 379 § 1 k.s.h. w umowie między spółką a członkiem zarządu spółkę reprezentuje rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['kazus', 'umowa z zarządem', 'reprezentacja', 'S.A.']
  },

  {
    id: 'ksh-658',
    article: 'Art. 433 § 2',
    articleTitle: 'Kazus: Wyłączenie prawa poboru',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'S.A. chce podwyższyć kapitał z wyłączeniem prawa poboru akcjonariuszy. Jaką większością musi być podjęta uchwała?',
    options: {
      a: 'Bezwzględną większością głosów',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: '4/5 głosów'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 433 § 2 k.s.h. pozbawienie akcjonariuszy prawa poboru wymaga uchwały walnego zgromadzenia podjętej większością co najmniej czterech piątych głosów.',
    difficulty: 'hard',
    tags: ['kazus', 'prawo poboru', 'większość 4/5', 'S.A.']
  },

  {
    id: 'ksh-659',
    article: 'Art. 377',
    articleTitle: 'Kazus: Zawieszenie członka zarządu',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'Rada nadzorcza S.A. chce zawiesić członka zarządu. Czy ma takie uprawnienie?',
    options: {
      a: 'Nie, może to zrobić tylko walne zgromadzenie',
      b: 'Tak, może zawiesić z ważnych powodów poszczególnych lub wszystkich członków zarządu',
      c: 'Nie, może tylko odwołać, nie zawiesić',
      d: 'Tak, ale tylko prezesa zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 377 k.s.h. rada nadzorcza może zawiesić, z ważnych powodów, w czynnościach poszczególnych lub wszystkich członków zarządu.',
    difficulty: 'medium',
    tags: ['kazus', 'zawieszenie zarządu', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-660',
    article: 'Art. 422 i 425',
    articleTitle: 'Kazus: Zaskarżenie uchwały WZ',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'Uchwała walnego zgromadzenia S.A. jest sprzeczna z USTAWĄ. Jakim powództwem można ją zaskarżyć?',
    options: {
      a: 'Powództwem o uchylenie uchwały',
      b: 'Powództwem o stwierdzenie nieważności uchwały',
      c: 'Powództwem o ustalenie nieistnienia uchwały',
      d: 'Nie można zaskarżyć uchwały WZ'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 425 § 1 k.s.h. uchwała walnego zgromadzenia sprzeczna z ustawą może być zaskarżona powództwem o stwierdzenie nieważności uchwały.',
    difficulty: 'easy',
    tags: ['kazus', 'nieważność uchwały', 'sprzeczność z ustawą', 'S.A.']
  },

  {
    id: 'ksh-661',
    article: 'Art. 444',
    articleTitle: 'Kazus: Kapitał docelowy',
    section: 'Kazusy egzaminacyjne',
    subsection: 'S.A.',
    question: 'Statut S.A. o kapitale 1.000.000 zł upoważnia zarząd do podwyższenia kapitału w ramach kapitału docelowego. Jaka jest maksymalna kwota tego podwyższenia?',
    options: {
      a: '500.000 zł (1/2 kapitału)',
      b: '750.000 zł (3/4 kapitału)',
      c: '1.000.000 zł (równowartość kapitału)',
      d: '2.000.000 zł (2x kapitał)'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 444 § 3 k.s.h. kapitał docelowy nie może przekraczać 3/4 kapitału zakładowego z dnia udzielenia upoważnienia. 3/4 × 1.000.000 zł = 750.000 zł.',
    difficulty: 'hard',
    tags: ['kazus', 'kapitał docelowy', 'limit', 'S.A.']
  },

  // ============================================================
  // SP. Z O.O. - SZCZEGÓŁOWE PRZEPISY
  // ============================================================

  {
    id: 'ksh-662',
    article: 'Art. 152',
    articleTitle: 'Podział kapitału zakładowego',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał zakładowy sp. z o.o. dzieli się na:',
    options: {
      a: 'Akcje',
      b: 'Udziały o równej albo nierównej wartości nominalnej',
      c: 'Obligacje',
      d: 'Certyfikaty inwestycyjne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 152 k.s.h. kapitał zakładowy spółki dzieli się na udziały o równej albo nierównej wartości nominalnej.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'udziały', 'sp. z o.o.']
  },

  {
    id: 'ksh-663',
    article: 'Art. 153',
    articleTitle: 'Udziały równe vs nierówne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wspólnik sp. z o.o. może mieć więcej niż jeden udział, to:',
    options: {
      a: 'Udziały mogą być nierównej wartości',
      b: 'Wszystkie udziały w kapitale zakładowym powinny być równe i niepodzielne',
      c: 'Udziały mogą być podzielne',
      d: 'Każdy udział musi mieć inną wartość'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 153 k.s.h. jeżeli wspólnik może mieć więcej niż jeden udział, wówczas wszystkie udziały w kapitale zakładowym powinny być równe i są niepodzielne.',
    difficulty: 'medium',
    tags: ['udziały równe', 'niepodzielność', 'sp. z o.o.']
  },

  {
    id: 'ksh-664',
    article: 'Art. 154 § 3',
    articleTitle: 'Agio (nadwyżka ponad wartość nominalną)',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli udział w sp. z o.o. jest obejmowany po cenie wyższej od wartości nominalnej, nadwyżka (agio):',
    options: {
      a: 'Jest zwracana wspólnikowi',
      b: 'Przelewana jest do kapitału zapasowego',
      c: 'Stanowi zysk do podziału',
      d: 'Jest przeznaczana na dywidendę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 154 § 3 k.s.h. jeżeli udział jest obejmowany po cenie wyższej od wartości nominalnej, nadwyżkę przelewa się do kapitału zapasowego.',
    difficulty: 'medium',
    tags: ['agio', 'kapitał zapasowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-665',
    article: 'Art. 157¹ § 2',
    articleTitle: 'Wkłady w spółce S24',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W sp. z o.o. założonej przez internet (S24) na pokrycie kapitału zakładowego można wnieść:',
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
    id: 'ksh-666',
    article: 'Art. 176 § 2',
    articleTitle: 'Wynagrodzenie za świadczenia niepieniężne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wynagrodzenie za świadczenia niepieniężne wspólnika sp. z o.o., do których jest zobowiązany na podstawie umowy spółki:',
    options: {
      a: 'Może być wypłacone tylko z zysku',
      b: 'Może być wypłacane tylko jeżeli spółka wykazuje zysk',
      c: 'Może być wypłacane także wówczas, gdy sprawozdanie finansowe nie wykazuje zysku',
      d: 'Nie może być wypłacane'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 176 § 2 k.s.h. wynagrodzenie wspólnika za takie świadczenia na rzecz spółki może być wypłacane także wówczas, gdy sprawozdanie finansowe nie wykazuje zysku.',
    difficulty: 'hard',
    tags: ['świadczenia niepieniężne', 'wynagrodzenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-667',
    article: 'Art. 177 § 2',
    articleTitle: 'Wysokość dopłat',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wysokość i terminy dopłat w sp. z o.o. oznaczane są:',
    options: {
      a: 'W umowie spółki bezwzględnie',
      b: 'W miarę potrzeby uchwałą wspólników',
      c: 'Przez zarząd',
      d: 'Przez radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 177 § 2 k.s.h. wysokość i terminy dopłat oznaczane są w miarę potrzeby uchwałą wspólników.',
    difficulty: 'medium',
    tags: ['dopłaty', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-668',
    article: 'Art. 178 § 1',
    articleTitle: 'Odsetki od dopłat',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Jeżeli wspólnik sp. z o.o. nie uiści dopłaty w określonym terminie:',
    options: {
      a: 'Traci prawo głosu',
      b: 'Obowiązany jest do zapłaty odsetek ustawowych za opóźnienie',
      c: 'Jego udział ulega umorzeniu',
      d: 'Zostaje wyłączony ze spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 178 § 1 k.s.h. jeżeli wspólnik nie uiści dopłaty w określonym terminie, obowiązany jest do zapłaty odsetek ustawowych za opóźnienie; spółka może również żądać naprawienia szkody wynikłej ze zwłoki.',
    difficulty: 'medium',
    tags: ['dopłaty', 'odsetki', 'sp. z o.o.']
  },

  {
    id: 'ksh-669',
    article: 'Art. 179 § 1',
    articleTitle: 'Zwrot dopłat',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Dopłaty wniesione do sp. z o.o. mogą być zwracane wspólnikom, jeżeli:',
    options: {
      a: 'Wspólnicy zażądają',
      b: 'Nie są wymagane na pokrycie straty wykazanej w sprawozdaniu finansowym',
      c: 'Zarząd tak postanowi',
      d: 'Upłynie rok od ich wniesienia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 179 § 1 k.s.h. dopłaty mogą być zwracane wspólnikom, jeżeli nie są wymagane na pokrycie straty wykazanej w sprawozdaniu finansowym.',
    difficulty: 'hard',
    tags: ['zwrot dopłat', 'strata', 'sp. z o.o.']
  },

  {
    id: 'ksh-670',
    article: 'Art. 188 § 1',
    articleTitle: 'Księga udziałów - zawartość',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Do księgi udziałów sp. z o.o. należy wpisywać:',
    options: {
      a: 'Tylko imię i nazwisko wspólnika',
      b: 'Nazwisko i imię albo firmę (nazwę) i siedzibę każdego wspólnika, adres, liczbę i wartość nominalną jego udziałów oraz ustanowienie zastawu lub użytkowania',
      c: 'Tylko liczbę udziałów',
      d: 'Tylko wartość udziałów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 188 § 1 k.s.h. zarząd jest obowiązany prowadzić księgę udziałów, do której należy wpisywać nazwisko i imię albo firmę (nazwę) i siedzibę każdego wspólnika, adres, liczbę i wartość nominalną jego udziałów oraz ustanowienie zastawu lub użytkowania i wykonywanie prawa głosu przez zastawnika lub użytkownika.',
    difficulty: 'medium',
    tags: ['księga udziałów', 'zawartość', 'sp. z o.o.']
  },

  {
    id: 'ksh-671',
    article: 'Art. 189 § 1',
    articleTitle: 'Lista wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zarząd sp. z o.o. jest obowiązany złożyć sądowi rejestrowemu aktualną listę wspólników:',
    options: {
      a: 'Raz w roku',
      b: 'Przy każdej zmianie w składzie wspólników',
      c: 'Co kwartał',
      d: 'Tylko przy zakładaniu spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 188 § 3 k.s.h. po każdym wpisaniu zmiany zarząd składa sądowi rejestrowemu podpisaną przez wszystkich członków zarządu nową listę wspólników.',
    difficulty: 'medium',
    tags: ['lista wspólników', 'sąd rejestrowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-672',
    article: 'Art. 192',
    articleTitle: 'Kwota przeznaczona do podziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Kwota przeznaczona do podziału między wspólników sp. z o.o. (dywidenda) nie może przekraczać:',
    options: {
      a: 'Zysku netto',
      b: 'Zysku za ostatni rok obrotowy, powiększonego o niepodzielone zyski z lat ubiegłych oraz o kwoty przeniesione z utworzonych z zysku kapitałów zapasowego i rezerwowych, które mogą być przeznaczone do podziału, pomniejszonego o niepokryte straty, udziały własne oraz o kwoty, które powinny być przekazane na kapitały',
      c: 'Kapitału zakładowego',
      d: 'Sumy wniesionych wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 192 k.s.h. kwota przeznaczona do podziału między wspólników nie może przekraczać zysku za ostatni rok obrotowy, powiększonego o niepodzielone zyski z lat ubiegłych oraz o kwoty przeniesione z utworzonych z zysku kapitałów zapasowego i rezerwowych, pomniejszonego o niepokryte straty, udziały własne oraz o kwoty, które zgodnie z ustawą lub umową spółki powinny być przekazane z zysku za ostatni rok obrotowy na kapitały.',
    difficulty: 'hard',
    tags: ['dywidenda', 'kwota do podziału', 'sp. z o.o.']
  },

  {
    id: 'ksh-673',
    article: 'Art. 193 § 2',
    articleTitle: 'Dzień dywidendy - termin',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Dzień dywidendy w sp. z o.o. wyznacza się w ciągu:',
    options: {
      a: 'Miesiąca od dnia powzięcia uchwały',
      b: 'Dwóch miesięcy od dnia powzięcia uchwały',
      c: 'Trzech miesięcy od dnia powzięcia uchwały',
      d: 'Sześciu miesięcy od dnia powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 193 § 2 k.s.h. dzień dywidendy wyznacza się w ciągu dwóch miesięcy od dnia powzięcia uchwały o podziale zysku.',
    difficulty: 'hard',
    tags: ['dzień dywidendy', 'termin', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-674',
    article: 'Art. 195 § 1',
    articleTitle: 'Zaliczka na dywidendę - warunki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Spółka z o.o. może wypłacić zaliczkę na poczet przewidywanej dywidendy, jeżeli:',
    options: {
      a: 'Zarząd tak postanowi',
      b: 'Umowa spółki upoważnia zarząd do wypłaty zaliczki i spółka posiada środki wystarczające na wypłatę',
      c: 'Wspólnicy zażądają',
      d: 'Minął rok obrotowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 194 k.s.h. umowa spółki może upoważniać zarząd do wypłaty wspólnikom zaliczki na poczet przewidywanej dywidendy za rok obrotowy, jeżeli spółka posiada środki wystarczające na wypłatę.',
    difficulty: 'medium',
    tags: ['zaliczka na dywidendę', 'warunki', 'sp. z o.o.']
  },

  {
    id: 'ksh-675',
    article: 'Art. 199 § 2',
    articleTitle: 'Umorzenie przymusowe - warunki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umorzenie przymusowe udziału w sp. z o.o. (bez zgody wspólnika) jest dopuszczalne, jeżeli:',
    options: {
      a: 'Zarząd tak postanowi',
      b: 'Przesłanki i tryb umorzenia określa umowa spółki',
      c: 'Wspólnicy jednomyślnie wyrażą zgodę',
      d: 'Sąd tak orzeknie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 199 § 2 k.s.h. umorzenie przymusowe może nastąpić bez zgody wspólnika, którego udziały są umarzane, jeżeli przesłanki i tryb przymusowego umorzenia określa umowa spółki.',
    difficulty: 'hard',
    tags: ['umorzenie przymusowe', 'umowa spółki', 'sp. z o.o.']
  },

  // ============================================================
  // S.A. - SZCZEGÓŁOWE PRZEPISY
  // ============================================================

  {
    id: 'ksh-676',
    article: 'Art. 334 § 1',
    articleTitle: 'Rodzaje akcji w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje w S.A. mogą być:',
    options: {
      a: 'Tylko imienne',
      b: 'Tylko na okaziciela',
      c: 'Imienne lub na okaziciela',
      d: 'Tylko zdematerializowane'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 334 § 1 k.s.h. akcje mogą być imienne lub na okaziciela.',
    difficulty: 'easy',
    tags: ['rodzaje akcji', 'imienne', 'na okaziciela', 'S.A.']
  },

  {
    id: 'ksh-677',
    article: 'Art. 336 § 1',
    articleTitle: 'Zamiana akcji imiennych na okaziciela',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Zamiana akcji imiennych na akcje na okaziciela albo odwrotnie:',
    options: {
      a: 'Jest zawsze dopuszczalna',
      b: 'Może być dokonana na żądanie akcjonariusza, jeżeli ustawa lub statut nie stanowi inaczej',
      c: 'Wymaga zgody sądu',
      d: 'Jest niedopuszczalna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 334 § 2 k.s.h. zamiana akcji imiennych na akcje na okaziciela albo odwrotnie może być dokonana na żądanie akcjonariusza, jeżeli ustawa lub statut nie stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zamiana akcji', 'imienne', 'na okaziciela', 'S.A.']
  },

  {
    id: 'ksh-678',
    article: 'Art. 340 § 1',
    articleTitle: 'Ograniczenie rozporządzenia akcjami imiennymi',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Statut S.A. może ograniczyć rozporządzenie akcjami:',
    options: {
      a: 'Wszystkimi rodzajami akcji',
      b: 'Tylko akcjami imiennymi',
      c: 'Tylko akcjami na okaziciela',
      d: 'Nie może ograniczać rozporządzenia akcjami'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 337 § 2 k.s.h. statut może ograniczyć rozporządzenie akcjami imiennymi, uzależniając je od zgody spółki albo w inny sposób.',
    difficulty: 'medium',
    tags: ['ograniczenie zbycia', 'akcje imienne', 'S.A.']
  },

  {
    id: 'ksh-679',
    article: 'Art. 348 § 1',
    articleTitle: 'Uprawnieni do dywidendy S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Uprawnionymi do dywidendy za dany rok obrotowy w S.A. są akcjonariusze, którym przysługiwały akcje:',
    options: {
      a: 'W ostatnim dniu roku obrotowego',
      b: 'W dniu powzięcia uchwały o podziale zysku (chyba że uchwała określi inny dzień - dzień dywidendy)',
      c: 'W dniu wypłaty dywidendy',
      d: 'Przez cały rok obrotowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 348 § 2 k.s.h. uprawnionymi do dywidendy za dany rok obrotowy są akcjonariusze, którym przysługiwały akcje w dniu powzięcia uchwały o podziale zysku. Statut może upoważnić walne zgromadzenie do określenia dnia dywidendy.',
    difficulty: 'hard',
    tags: ['dywidenda', 'dzień dywidendy', 'S.A.']
  },

  {
    id: 'ksh-680',
    article: 'Art. 348 § 3',
    articleTitle: 'Dzień dywidendy S.A. - termin',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Dzień dywidendy w S.A. wyznacza się w okresie:',
    options: {
      a: 'Miesiąca od dnia powzięcia uchwały',
      b: 'Dwóch miesięcy od dnia powzięcia uchwały, ale nie później niż przed upływem roku od tego dnia',
      c: 'Trzech miesięcy od dnia powzięcia uchwały',
      d: 'Sześciu miesięcy od dnia powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 348 § 3 k.s.h. dzień dywidendy może być wyznaczony na dzień przypadający nie później niż w terminie dwóch miesięcy od dnia powzięcia uchwały o podziale zysku.',
    difficulty: 'hard',
    tags: ['dzień dywidendy', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-681',
    article: 'Art. 349 § 1',
    articleTitle: 'Termin wypłaty dywidendy S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Dywidendę w S.A. wypłaca się w dniu określonym w uchwale walnego zgromadzenia, a jeżeli uchwała dnia nie określa:',
    options: {
      a: 'W terminie miesiąca od dnia dywidendy',
      b: 'W terminie dwóch miesięcy od dnia dywidendy',
      c: 'W dniu określonym przez zarząd w terminie trzech miesięcy od dnia dywidendy',
      d: 'Niezwłocznie'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 349 § 1 k.s.h. dywidendę wypłaca się w dniu określonym w uchwale walnego zgromadzenia. Jeżeli uchwała nie określa dnia wypłaty dywidendy, dywidenda jest wypłacana w dniu określonym przez zarząd w terminie trzech miesięcy od dnia dywidendy.',
    difficulty: 'hard',
    tags: ['dywidenda', 'termin wypłaty', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-682',
    article: 'Art. 353 § 1',
    articleTitle: 'Akcje nieme',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Statut S.A. może przyznać uprzywilejowanie w zakresie dywidendy bez prawa głosu (akcje nieme). Uprzywilejowanie to:',
    options: {
      a: 'Nie może przekraczać 50% dywidendy zwykłej',
      b: 'Nie jest ograniczone co do wysokości',
      c: 'Może przekraczać dywidendę zwykłą maksymalnie o połowę',
      d: 'Nie może przekraczać dwukrotności dywidendy zwykłej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 353 § 1 k.s.h. statut może przyznać uprzywilejowanie w zakresie dywidendy, które nie podlega ograniczeniu określonemu w art. 353 § 1 (tj. ograniczeniu do 150% dywidendy zwykłej). Akcje takie nie dają prawa głosu (akcje nieme).',
    difficulty: 'hard',
    tags: ['akcje nieme', 'uprzywilejowanie', 'dywidenda', 'S.A.']
  },

  {
    id: 'ksh-683',
    article: 'Art. 355 § 1',
    articleTitle: 'Świadectwa tymczasowe',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Do czasu pełnego pokrycia akcji S.A. wydawane są:',
    options: {
      a: 'Akcje warunkowe',
      b: 'Świadectwa tymczasowe',
      c: 'Certyfikaty',
      d: 'Obligacje'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 355 § 1 k.s.h. do czasu pełnego pokrycia akcji wydawane są świadectwa tymczasowe, które na podstawie statutu mogą być świadectwami imiennymi lub na okaziciela.',
    difficulty: 'medium',
    tags: ['świadectwa tymczasowe', 'pokrycie akcji', 'S.A.']
  },

  {
    id: 'ksh-684',
    article: 'Art. 366 § 1',
    articleTitle: 'Świadczenia dodatkowe akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Statut S.A. może zobowiązać akcjonariuszy do świadczeń na rzecz spółki niepołączonych z wpłatami na akcje. Takie zobowiązanie może dotyczyć tylko akcji:',
    options: {
      a: 'Wszystkich akcji',
      b: 'Imiennych',
      c: 'Na okaziciela',
      d: 'Uprzywilejowanych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 356 § 1 k.s.h. statut może zobowiązać akcjonariuszy do świadczeń na rzecz spółki niepołączonych z wpłatami na akcje. Takie zobowiązanie może dotyczyć tylko akcji imiennych.',
    difficulty: 'hard',
    tags: ['świadczenia dodatkowe', 'akcje imienne', 'S.A.']
  },

  {
    id: 'ksh-685',
    article: 'Art. 374 § 1',
    articleTitle: 'Uchwały zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwały zarządu S.A. zapadają:',
    options: {
      a: 'Jednomyślnie',
      b: 'Bezwzględną większością głosów, chyba że statut stanowi inaczej',
      c: 'Większością 2/3 głosów',
      d: 'Większością 3/4 głosów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 371 § 2 k.s.h. uchwały zarządu zapadają bezwzględną większością głosów, chyba że statut stanowi inaczej.',
    difficulty: 'medium',
    tags: ['uchwały zarządu', 'większość', 'S.A.']
  },

  {
    id: 'ksh-686',
    article: 'Art. 376',
    articleTitle: 'Delegowanie członka RN do zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może delegować swoich członków do czasowego wykonywania czynności członków zarządu, którzy zostali odwołani, złożyli rezygnację albo z innych przyczyn nie mogą sprawować swoich czynności. Maksymalny okres delegowania wynosi:',
    options: {
      a: 'Miesiąc',
      b: 'Trzy miesiące',
      c: 'Sześć miesięcy',
      d: 'Rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 383 § 1 k.s.h. rada nadzorcza może delegować swoich członków do czasowego wykonywania czynności członków zarządu na okres nie dłuższy niż trzy miesiące.',
    difficulty: 'hard',
    tags: ['delegowanie', 'rada nadzorcza', 'zarząd', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-687',
    article: 'Art. 388 § 1',
    articleTitle: 'Wynagrodzenie członków RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członkom rady nadzorczej S.A. może zostać przyznane wynagrodzenie. O wynagrodzeniu decyduje:',
    options: {
      a: 'Zarząd',
      b: 'Statut lub uchwała walnego zgromadzenia',
      c: 'Sama rada nadzorcza',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 392 § 1 k.s.h. członkom rady nadzorczej może zostać przyznane wynagrodzenie. Wynagrodzenie określa statut lub uchwała walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['wynagrodzenie', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-688',
    article: 'Art. 391 § 1',
    articleTitle: 'Uchwały RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwały rady nadzorczej S.A. zapadają:',
    options: {
      a: 'Jednomyślnie',
      b: 'Bezwzględną większością głosów, chyba że statut stanowi inaczej',
      c: 'Większością 2/3 głosów',
      d: 'Większością 3/4 głosów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 391 § 1 k.s.h. uchwały rady nadzorczej zapadają bezwzględną większością głosów, chyba że statut stanowi inaczej.',
    difficulty: 'medium',
    tags: ['uchwały RN', 'większość', 'S.A.']
  },

  {
    id: 'ksh-689',
    article: 'Art. 394 § 1',
    articleTitle: 'Miejsce WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie S.A. odbywa się:',
    options: {
      a: 'W dowolnym miejscu',
      b: 'W siedzibie spółki, chyba że statut wskazuje inne miejsce na terytorium RP',
      c: 'W siedzibie sądu rejestrowego',
      d: 'W miejscu wskazanym przez zarząd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 403 k.s.h. walne zgromadzenie odbywa się w siedzibie spółki, jeżeli statut nie wskazuje innego miejsca na terytorium Rzeczypospolitej Polskiej.',
    difficulty: 'medium',
    tags: ['walne zgromadzenie', 'miejsce', 'S.A.']
  },

  {
    id: 'ksh-690',
    article: 'Art. 406 § 1',
    articleTitle: 'Lista akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Lista akcjonariuszy uprawnionych do uczestnictwa w walnym zgromadzeniu S.A. powinna być wyłożona w lokalu zarządu:',
    options: {
      a: 'Przez dzień przed walnym zgromadzeniem',
      b: 'Przez trzy dni powszednie przed odbyciem walnego zgromadzenia',
      c: 'Przez tydzień przed walnym zgromadzeniem',
      d: 'W dniu walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 407 § 1 k.s.h. lista akcjonariuszy uprawnionych do uczestnictwa w walnym zgromadzeniu, podpisana przez zarząd, powinna być wyłożona w lokalu zarządu przez trzy dni powszednie przed odbyciem walnego zgromadzenia.',
    difficulty: 'hard',
    tags: ['lista akcjonariuszy', 'walne zgromadzenie', 'termin', 'S.A.']
  },

  // ============================================================
  // WIĘKSZOŚCI GŁOSÓW - ZESTAWIENIE
  // ============================================================

  {
    id: 'ksh-691',
    article: 'Zestawienie',
    articleTitle: 'Większości w sp. z o.o.',
    section: 'Zestawienia',
    subsection: 'Większości głosów',
    question: 'W sp. z o.o. uchwały o zmianie umowy spółki, rozwiązaniu spółki lub zbyciu przedsiębiorstwa zapadają większością:',
    options: {
      a: 'Bezwzględną',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 246 § 1 k.s.h. uchwały dotyczące zmiany umowy spółki, rozwiązania spółki lub zbycia przedsiębiorstwa albo jego zorganizowanej części zapadają większością dwóch trzecich głosów.',
    difficulty: 'easy',
    tags: ['większość 2/3', 'zmiana umowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-692',
    article: 'Zestawienie',
    articleTitle: 'Większości w S.A.',
    section: 'Zestawienia',
    subsection: 'Większości głosów',
    question: 'W S.A. uchwały o zmianie statutu, emisji obligacji zamiennych, rozwiązaniu spółki zapadają większością:',
    options: {
      a: 'Bezwzględną',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślnie'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 415 § 1 k.s.h. uchwała dotycząca zmiany statutu zapada większością trzech czwartych głosów. Podobnie dla rozwiązania spółki (art. 414) i emisji obligacji zamiennych.',
    difficulty: 'easy',
    tags: ['większość 3/4', 'zmiana statutu', 'S.A.']
  },

  {
    id: 'ksh-693',
    article: 'Art. 246 § 2',
    articleTitle: 'Istotna zmiana przedmiotu - sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała dotycząca istotnej zmiany przedmiotu działalności sp. z o.o. wymaga większości:',
    options: {
      a: 'Bezwzględnej',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 246 § 2 k.s.h. uchwała dotycząca istotnej zmiany przedmiotu działalności spółki wymaga większości trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['zmiana przedmiotu', 'większość 3/4', 'sp. z o.o.']
  },

  {
    id: 'ksh-694',
    article: 'Art. 416 § 1',
    articleTitle: 'Istotna zmiana przedmiotu - S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Uchwała dotycząca istotnej zmiany przedmiotu działalności S.A. wymaga większości:',
    options: {
      a: 'Bezwzględnej',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 416 § 1 k.s.h. do powzięcia uchwały o istotnej zmianie przedmiotu działalności spółki wymagana jest uchwała podjęta większością trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['zmiana przedmiotu', 'większość 3/4', 'S.A.']
  },

  {
    id: 'ksh-695',
    article: 'Art. 246 § 3',
    articleTitle: 'Zgoda wszystkich w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sp. z o.o. zgody WSZYSTKICH wspólników, których dotyczy, wymaga uchwała:',
    options: {
      a: 'O rozwiązaniu spółki',
      b: 'Zwiększająca świadczenia wspólników lub uszczuplająca ich prawa udziałowe bądź prawa przyznane osobiście',
      c: 'O zmianie firmy',
      d: 'O podwyższeniu kapitału'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 246 § 3 k.s.h. uchwała zwiększająca świadczenia wspólników lub uszczuplająca prawa udziałowe bądź prawa przyznane osobiście poszczególnym wspólnikom wymaga zgody wszystkich wspólników, których dotyczy.',
    difficulty: 'hard',
    tags: ['zgoda wszystkich', 'uszczuplenie praw', 'sp. z o.o.']
  },

  // ============================================================
  // TERMINY - ZESTAWIENIE KOŃCOWE
  // ============================================================

  {
    id: 'ksh-696',
    article: 'Zestawienie terminów',
    articleTitle: 'Terminy zaskarżania uchwał',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Terminy na powództwo o UCHYLENIE uchwały: sp. z o.o. vs S.A.:',
    options: {
      a: 'Obie: miesiąc od wiadomości, max 6 miesięcy od powzięcia',
      b: 'Sp. z o.o.: miesiąc/6 mies., S.A.: 2 miesiące/rok',
      c: 'Obie: 6 miesięcy od wiadomości, max 3 lata od powzięcia',
      d: 'Sp. z o.o.: tydzień/miesiąc, S.A.: miesiąc/6 mies.'
    },
    correct: 'a',
    explanation: 'Zarówno w sp. z o.o. (art. 251), jak i w S.A. (art. 423 § 1) powództwo o uchylenie uchwały należy wnieść w terminie miesiąca od otrzymania wiadomości o uchwale, nie później jednak niż w terminie 6 miesięcy od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['uchylenie uchwały', 'terminy', 'porównanie']
  },

  {
    id: 'ksh-697',
    article: 'Zestawienie terminów',
    articleTitle: 'Terminy na powództwo o nieważność',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Terminy na powództwo o STWIERDZENIE NIEWAŻNOŚCI uchwały: sp. z o.o. vs S.A.:',
    options: {
      a: 'Obie: miesiąc od wiadomości, max 6 miesięcy od powzięcia',
      b: 'Obie: 6 miesięcy od wiadomości, max 3 lata od powzięcia',
      c: 'Sp. z o.o.: 6 mies./3 lata, S.A.: 3 mies./rok',
      d: 'Sp. z o.o.: 3 mies./rok, S.A.: 6 mies./3 lata'
    },
    correct: 'b',
    explanation: 'Zarówno w sp. z o.o. (art. 252 § 3), jak i w S.A. (art. 425 § 2 i 3) prawo do wytoczenia powództwa o stwierdzenie nieważności wygasa z upływem 6 miesięcy od dnia otrzymania wiadomości o uchwale, nie później niż z upływem 3 lat od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['nieważność uchwały', 'terminy', 'porównanie']
  },

  {
    id: 'ksh-698',
    article: 'Zestawienie',
    articleTitle: 'Zwyczajne zgromadzenie - termin',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Zwyczajne zgromadzenie/walne zgromadzenie powinno odbyć się w terminie:',
    options: {
      a: 'Sp. z o.o.: 3 mies., S.A.: 6 mies. po roku obrotowym',
      b: 'Sp. z o.o.: 6 mies., S.A.: 6 mies. po roku obrotowym',
      c: 'Sp. z o.o.: 6 mies., S.A.: 3 mies. po roku obrotowym',
      d: 'Sp. z o.o.: 9 mies., S.A.: 9 mies. po roku obrotowym'
    },
    correct: 'b',
    explanation: 'Zarówno zwyczajne zgromadzenie wspólników sp. z o.o. (art. 231 § 1), jak i zwyczajne walne zgromadzenie S.A. (art. 395 § 1) powinno odbyć się w terminie 6 miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne zgromadzenie', 'termin', 'porównanie']
  },

  {
    id: 'ksh-699',
    article: 'Zestawienie',
    articleTitle: 'Termin zgłoszenia do rejestru',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Termin na zgłoszenie spółki do rejestru: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 3 mies., S.A.: 6 mies. od zawarcia umowy/zawiązania',
      b: 'Sp. z o.o.: 6 mies., S.A.: 6 mies. od zawarcia umowy/zawiązania',
      c: 'Sp. z o.o.: 6 mies., S.A.: 3 mies. od zawarcia umowy/zawiązania',
      d: 'Sp. z o.o.: miesiąc, S.A.: 3 mies. od zawarcia umowy/zawiązania'
    },
    correct: 'b',
    explanation: 'Zarówno sp. z o.o. (art. 164 § 1), jak i S.A. (art. 325 § 1) powinny być zgłoszone do rejestru w terminie 6 miesięcy od dnia zawarcia umowy spółki / zawiązania spółki.',
    difficulty: 'medium',
    tags: ['zgłoszenie do rejestru', 'termin', 'porównanie']
  },

  {
    id: 'ksh-700',
    article: 'Zestawienie końcowe',
    articleTitle: 'Podsumowanie kluczowych różnic',
    section: 'Zestawienia',
    subsection: 'Porównanie końcowe',
    question: 'Która z poniższych cech różni sp. z o.o. od S.A.?',
    options: {
      a: 'Forma dokumentu założycielskiego (obie: akt notarialny)',
      b: 'Obligatoryjność rady nadzorczej (S.A.: zawsze, sp. z o.o.: warunkowo)',
      c: 'Możliwość jednoosobowego utworzenia (obie: tak)',
      d: 'Termin zwyczajnego zgromadzenia (obie: 6 mies.)'
    },
    correct: 'b',
    explanation: 'Kluczowa różnica: w S.A. rada nadzorcza jest zawsze obligatoryjna (art. 381), w sp. z o.o. jest obligatoryjna tylko gdy kapitał > 500.000 zł i wspólników > 25 (art. 213 § 2).',
    difficulty: 'medium',
    tags: ['porównanie', 'rada nadzorcza', 'obligatoryjność']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART8_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART8.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART8.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART8.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART8.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    kazusy: KSH_EXAM_QUESTIONS_PART8.filter(q => q.section.includes('Kazusy')).length,
    spzoo: KSH_EXAM_QUESTIONS_PART8.filter(q => q.section.includes('Spółka z o.o.')).length,
    sa: KSH_EXAM_QUESTIONS_PART8.filter(q => q.section.includes('Spółka akcyjna')).length,
    zestawienia: KSH_EXAM_QUESTIONS_PART8.filter(q => q.section.includes('Zestawienia')).length,
  }
};

console.log('KSH Part 8 loaded:', PART8_STATS);
