// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// Wersja: 1.0 | Data: Styczeń 2026
// Źródło: Dz.U.2024.18 t.j. z dnia 2024.01.05
// ============================================================

export interface ExamQuestion {
  id: string;
  article: string;
  articleTitle: string;
  section: string;
  subsection: string;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export const KSH_EXAM_QUESTIONS: ExamQuestion[] = [

  // ============================================================
  // TYTUŁ I - PRZEPISY OGÓLNE
  // DZIAŁ I - Przepisy wspólne (Art. 1-21)
  // ============================================================

  {
    id: 'ksh-001',
    article: 'Art. 1 § 2',
    articleTitle: 'Zakres regulacji, rodzaje spółek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Które z poniższych spółek NIE jest spółką handlową w rozumieniu Kodeksu spółek handlowych?',
    options: {
      a: 'Spółka partnerska',
      b: 'Spółka cywilna',
      c: 'Prosta spółka akcyjna',
      d: 'Spółka komandytowo-akcyjna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 1 § 2 k.s.h. spółkami handlowymi są: spółka jawna, spółka partnerska, spółka komandytowa, spółka komandytowo-akcyjna, spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna i spółka akcyjna. Spółka cywilna jest regulowana przez Kodeks cywilny (art. 860-875 k.c.), nie jest spółką handlową.',
    difficulty: 'easy',
    tags: ['rodzaje spółek', 'spółka handlowa', 'definicje']
  },

  {
    id: 'ksh-002',
    article: 'Art. 1 § 2',
    articleTitle: 'Zakres regulacji, rodzaje spółek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Ile rodzajów spółek handlowych wymienia Kodeks spółek handlowych?',
    options: {
      a: '5',
      b: '6',
      c: '7',
      d: '8'
    },
    correct: 'c',
    explanation: 'Art. 1 § 2 k.s.h. wymienia 7 rodzajów spółek handlowych: spółka jawna, spółka partnerska, spółka komandytowa, spółka komandytowo-akcyjna, spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna i spółka akcyjna.',
    difficulty: 'easy',
    tags: ['rodzaje spółek', 'liczba spółek']
  },

  {
    id: 'ksh-003',
    article: 'Art. 2',
    articleTitle: 'Odpowiednie stosowanie przepisów kodeksu cywilnego',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'W sprawach nieuregulowanych w Kodeksie spółek handlowych:',
    options: {
      a: 'Nie stosuje się żadnych innych przepisów',
      b: 'Stosuje się przepisy Kodeksu cywilnego',
      c: 'Stosuje się przepisy Kodeksu postępowania cywilnego',
      d: 'Stosuje się przepisy prawa handlowego międzynarodowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 2 k.s.h. w sprawach określonych w art. 1 § 1 nieuregulowanych w ustawie stosuje się przepisy Kodeksu cywilnego. Jeżeli wymaga tego właściwość (natura) stosunku prawnego spółki handlowej, przepisy Kodeksu cywilnego stosuje się odpowiednio.',
    difficulty: 'easy',
    tags: ['stosowanie przepisów', 'kodeks cywilny', 'subsydiarność']
  },

  {
    id: 'ksh-004',
    article: 'Art. 4 § 1 pkt 1',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Które spółki są spółkami osobowymi w rozumieniu Kodeksu spółek handlowych?',
    options: {
      a: 'Spółka jawna, partnerska, komandytowa i z o.o.',
      b: 'Spółka jawna, partnerska, komandytowa i komandytowo-akcyjna',
      c: 'Spółka jawna, partnerska i komandytowa',
      d: 'Spółka jawna, cywilna, partnerska i komandytowa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 1 k.s.h. spółka osobowa to spółka jawna, spółka partnerska, spółka komandytowa i spółka komandytowo-akcyjna. Spółka cywilna nie jest spółką handlową, a sp. z o.o. jest spółką kapitałową.',
    difficulty: 'easy',
    tags: ['spółka osobowa', 'definicje', 'rodzaje spółek']
  },

  {
    id: 'ksh-005',
    article: 'Art. 4 § 1 pkt 2',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Które spółki są spółkami kapitałowymi w rozumieniu Kodeksu spółek handlowych?',
    options: {
      a: 'Spółka z o.o., prosta spółka akcyjna i spółka akcyjna',
      b: 'Spółka z o.o. i spółka akcyjna',
      c: 'Spółka z o.o., spółka akcyjna i spółka komandytowo-akcyjna',
      d: 'Spółka akcyjna i prosta spółka akcyjna'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 4 § 1 pkt 2 k.s.h. spółka kapitałowa to spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna i spółka akcyjna. Spółka komandytowo-akcyjna jest spółką osobową, mimo że posiada elementy kapitałowe.',
    difficulty: 'easy',
    tags: ['spółka kapitałowa', 'definicje', 'rodzaje spółek']
  },

  {
    id: 'ksh-006',
    article: 'Art. 4 § 1 pkt 3',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Spółka jednoosobowa w rozumieniu k.s.h. to:',
    options: {
      a: 'Każda spółka handlowa z jednym wspólnikiem',
      b: 'Spółka kapitałowa, której wszystkie udziały lub akcje należą do jednego wspólnika lub akcjonariusza',
      c: 'Spółka osobowa z jednym wspólnikiem',
      d: 'Spółka z o.o. z jednym członkiem zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 3 k.s.h. spółka jednoosobowa to spółka kapitałowa, której wszystkie udziały albo akcje należą do jednego wspólnika albo akcjonariusza. Spółki osobowe nie mogą być jednoosobowe (wymagają co najmniej 2 wspólników, z wyjątkiem przekształcenia).',
    difficulty: 'medium',
    tags: ['spółka jednoosobowa', 'definicje', 'spółka kapitałowa']
  },

  {
    id: 'ksh-007',
    article: 'Art. 4 § 1 pkt 4',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Spółka dominująca to spółka handlowa, która m.in.:',
    options: {
      a: 'Posiada co najmniej 10% głosów w innej spółce',
      b: 'Dysponuje bezpośrednio lub pośrednio większością głosów na zgromadzeniu wspólników innej spółki kapitałowej',
      c: 'Posiada jakikolwiek udział w innej spółce',
      d: 'Jest notowana na giełdzie papierów wartościowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 4 lit. a k.s.h. spółka dominująca to m.in. spółka handlowa, która dysponuje bezpośrednio lub pośrednio większością głosów na zgromadzeniu wspólników albo na walnym zgromadzeniu, także jako zastawnik albo użytkownik, bądź w zarządzie innej spółki kapitałowej (spółki zależnej).',
    difficulty: 'medium',
    tags: ['spółka dominująca', 'spółka zależna', 'definicje', 'holding']
  },

  {
    id: 'ksh-008',
    article: 'Art. 4 § 1 pkt 5',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Spółka powiązana to spółka kapitałowa, w której inna spółka handlowa dysponuje co najmniej:',
    options: {
      a: '5% głosów na zgromadzeniu wspólników',
      b: '10% głosów na zgromadzeniu wspólników',
      c: '20% głosów na zgromadzeniu wspólników',
      d: '50% głosów na zgromadzeniu wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 4 § 1 pkt 5 k.s.h. spółka powiązana to spółka kapitałowa, w której inna spółka handlowa albo spółdzielnia dysponuje bezpośrednio lub pośrednio co najmniej 20% głosów na zgromadzeniu wspólników albo na walnym zgromadzeniu.',
    difficulty: 'medium',
    tags: ['spółka powiązana', 'definicje', 'powiązania kapitałowe']
  },

  {
    id: 'ksh-009',
    article: 'Art. 4 § 1 pkt 10',
    articleTitle: 'Słowniczek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Bezwzględna większość głosów w rozumieniu k.s.h. oznacza:',
    options: {
      a: 'Więcej niż 50% wszystkich głosów',
      b: 'Więcej niż połowę głosów oddanych',
      c: '2/3 głosów oddanych',
      d: '3/4 głosów oddanych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 10 k.s.h. bezwzględna większość głosów oznacza więcej niż połowę głosów oddanych. Jest to istotne rozróżnienie - liczy się głosy oddane, nie wszystkie możliwe głosy.',
    difficulty: 'medium',
    tags: ['bezwzględna większość', 'głosowanie', 'definicje']
  },

  {
    id: 'ksh-010',
    article: 'Art. 5 § 3',
    articleTitle: 'Ogłaszanie dokumentów, organ publikacyjny',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'W jakim organie publikacyjnym publikowane są wymagane przez prawo ogłoszenia pochodzące od spółki?',
    options: {
      a: 'W Dzienniku Ustaw',
      b: 'W Monitorze Polskim',
      c: 'W Monitorze Sądowym i Gospodarczym',
      d: 'W prasie ogólnopolskiej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 5 § 3 k.s.h. wymagane przez prawo ogłoszenia pochodzące od spółki są publikowane w Monitorze Sądowym i Gospodarczym, chyba że ustawa stanowi inaczej. Umowa spółki albo statut może nałożyć obowiązek ogłoszenia również w inny sposób.',
    difficulty: 'easy',
    tags: ['ogłoszenia', 'Monitor Sądowy i Gospodarczy', 'publikacje']
  },

  {
    id: 'ksh-011',
    article: 'Art. 6 § 1',
    articleTitle: 'Obowiązki spółki dominującej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'W jakim terminie spółka dominująca ma obowiązek zawiadomić spółkę zależną o powstaniu stosunku dominacji?',
    options: {
      a: '7 dni od dnia powstania stosunku dominacji',
      b: '14 dni od dnia powstania stosunku dominacji',
      c: '2 tygodnie od dnia powstania stosunku dominacji',
      d: '30 dni od dnia powstania stosunku dominacji'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 6 § 1 k.s.h. spółka dominująca ma obowiązek zawiadomić spółkę kapitałową zależną o powstaniu stosunku dominacji w terminie dwóch tygodni od dnia powstania tego stosunku. Niedochowanie tego terminu skutkuje zawieszeniem wykonywania prawa głosu z akcji/udziałów reprezentujących więcej niż 33% kapitału zakładowego.',
    difficulty: 'medium',
    tags: ['spółka dominująca', 'termin', 'zawiadomienie']
  },

  {
    id: 'ksh-012',
    article: 'Art. 6 § 1',
    articleTitle: 'Obowiązki spółki dominującej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Jaka jest sankcja za niezawiadomienie spółki zależnej o powstaniu stosunku dominacji w terminie?',
    options: {
      a: 'Grzywna nałożona przez sąd rejestrowy',
      b: 'Zawieszenie wykonywania prawa głosu z akcji/udziałów reprezentujących więcej niż 33% kapitału',
      c: 'Nieważność stosunku dominacji',
      d: 'Odpowiedzialność odszkodowawcza członków zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 6 § 1 k.s.h. niezawiadomienie spółki zależnej w terminie 2 tygodni skutkuje zawieszeniem wykonywania prawa głosu z akcji albo udziałów spółki dominującej reprezentujących więcej niż 33% kapitału zakładowego spółki zależnej.',
    difficulty: 'hard',
    tags: ['spółka dominująca', 'sankcja', 'prawo głosu']
  },

  // ============================================================
  // DZIAŁ II - Spółki osobowe (Art. 8-10)
  // ============================================================

  {
    id: 'ksh-013',
    article: 'Art. 8 § 1',
    articleTitle: 'Zdolność prawna spółki osobowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Spółka osobowa może:',
    options: {
      a: 'Nabywać prawa we własnym imieniu, ale nie może zaciągać zobowiązań',
      b: 'Nabywać prawa, zaciągać zobowiązania, pozywać i być pozywana',
      c: 'Tylko pozywać i być pozywana',
      d: 'Nabywać tylko ruchomości we własnym imieniu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 8 § 1 k.s.h. spółka osobowa może we własnym imieniu nabywać prawa, w tym własność nieruchomości i inne prawa rzeczowe, zaciągać zobowiązania, pozywać i być pozywana. Spółka osobowa ma zdolność prawną i zdolność sądową.',
    difficulty: 'easy',
    tags: ['spółka osobowa', 'zdolność prawna', 'zdolność sądowa']
  },

  {
    id: 'ksh-014',
    article: 'Art. 9',
    articleTitle: 'Zgoda wspólników na zmianę umowy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Zmiana postanowień umowy spółki osobowej wymaga:',
    options: {
      a: 'Zgody większości wspólników',
      b: 'Zgody 2/3 wspólników',
      c: 'Zgody wszystkich wspólników, chyba że umowa stanowi inaczej',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 9 k.s.h. zmiana postanowień umowy spółki wymaga zgody wszystkich wspólników, chyba że umowa stanowi inaczej. Jest to zasada jednomyślności typowa dla spółek osobowych.',
    difficulty: 'easy',
    tags: ['zmiana umowy', 'jednomyślność', 'spółka osobowa']
  },

  {
    id: 'ksh-015',
    article: 'Art. 10 § 1',
    articleTitle: 'Przejście ogółu praw i obowiązków',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Ogół praw i obowiązków wspólnika spółki osobowej może być przeniesiony na inną osobę:',
    options: {
      a: 'Zawsze bez ograniczeń',
      b: 'Tylko gdy umowa spółki tak stanowi',
      c: 'Tylko za zgodą sądu',
      d: 'Nigdy nie może być przeniesiony'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 10 § 1 k.s.h. ogół praw i obowiązków wspólnika spółki osobowej może być przeniesiony na inną osobę tylko wówczas, gdy umowa spółki tak stanowi. Jest to zasada ograniczonej zbywalności członkostwa w spółce osobowej.',
    difficulty: 'medium',
    tags: ['przeniesienie praw', 'członkostwo', 'spółka osobowa']
  },

  {
    id: 'ksh-016',
    article: 'Art. 10 § 2',
    articleTitle: 'Przejście ogółu praw i obowiązków',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Przeniesienie ogółu praw i obowiązków wspólnika spółki osobowej wymaga:',
    options: {
      a: 'Pisemnej zgody wszystkich pozostałych wspólników, chyba że umowa stanowi inaczej',
      b: 'Zgody większości wspólników',
      c: 'Zgody sądu rejestrowego',
      d: 'Tylko formy aktu notarialnego'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 10 § 2 k.s.h. ogół praw i obowiązków wspólnika może być przeniesiony na inną osobę tylko po uzyskaniu pisemnej zgody wszystkich pozostałych wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['przeniesienie praw', 'zgoda wspólników', 'forma pisemna']
  },

  {
    id: 'ksh-017',
    article: 'Art. 10 § 3',
    articleTitle: 'Przejście ogółu praw i obowiązków',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'W przypadku przeniesienia ogółu praw i obowiązków wspólnika na inną osobę, za zobowiązania występującego wspólnika odpowiadają:',
    options: {
      a: 'Tylko wspólnik przystępujący do spółki',
      b: 'Tylko występujący wspólnik',
      c: 'Solidarnie występujący wspólnik oraz wspólnik przystępujący do spółki',
      d: 'Spółka w całości'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 10 § 3 k.s.h. w przypadku przeniesienia ogółu praw i obowiązków wspólnika na inną osobę, za zobowiązania występującego wspólnika związane z uczestnictwem w spółce osobowej i zobowiązania tej spółki odpowiadają solidarnie występujący wspólnik oraz wspólnik przystępujący do spółki.',
    difficulty: 'hard',
    tags: ['odpowiedzialność solidarna', 'przeniesienie praw', 'zobowiązania']
  },

  // ============================================================
  // DZIAŁ III - Spółki kapitałowe (Art. 11-21)
  // ============================================================

  {
    id: 'ksh-018',
    article: 'Art. 11 § 1',
    articleTitle: 'Spółki kapitałowe w organizacji',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Spółka kapitałowa w organizacji:',
    options: {
      a: 'Nie ma zdolności prawnej',
      b: 'Może we własnym imieniu nabywać prawa i zaciągać zobowiązania',
      c: 'Może działać tylko przez pełnomocnika',
      d: 'Nie może nabywać nieruchomości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 11 § 1 k.s.h. spółki kapitałowe w organizacji mogą we własnym imieniu nabywać prawa, w tym własność nieruchomości i inne prawa rzeczowe, zaciągać zobowiązania, pozywać i być pozywane.',
    difficulty: 'easy',
    tags: ['spółka w organizacji', 'zdolność prawna', 'spółka kapitałowa']
  },

  {
    id: 'ksh-019',
    article: 'Art. 12',
    articleTitle: 'Osobowość prawna spółki kapitałowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Spółka kapitałowa uzyskuje osobowość prawną z chwilą:',
    options: {
      a: 'Zawarcia umowy spółki',
      b: 'Wniesienia wkładów',
      c: 'Wpisu do rejestru',
      d: 'Powołania zarządu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 12 k.s.h. spółka z ograniczoną odpowiedzialnością w organizacji, prosta spółka akcyjna w organizacji albo spółka akcyjna w organizacji z chwilą wpisu do rejestru staje się odpowiednio spółką z o.o., PSA albo S.A. i uzyskuje osobowość prawną.',
    difficulty: 'easy',
    tags: ['osobowość prawna', 'wpis do rejestru', 'spółka kapitałowa']
  },

  {
    id: 'ksh-020',
    article: 'Art. 13 § 1',
    articleTitle: 'Odpowiedzialność za zobowiązania spółki w organizacji',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Za zobowiązania spółki kapitałowej w organizacji odpowiadają solidarnie:',
    options: {
      a: 'Tylko wspólnicy',
      b: 'Spółka i osoby, które działały w jej imieniu',
      c: 'Tylko zarząd',
      d: 'Tylko spółka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 13 § 1 k.s.h. za zobowiązania spółki kapitałowej w organizacji odpowiadają solidarnie spółka i osoby, które działały w jej imieniu.',
    difficulty: 'medium',
    tags: ['odpowiedzialność solidarna', 'spółka w organizacji', 'zobowiązania']
  },

  {
    id: 'ksh-021',
    article: 'Art. 14 § 1',
    articleTitle: 'Przedmiot wkładu i jego wady',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Przedmiotem wkładu niepieniężnego do spółki z o.o. lub spółki akcyjnej NIE może być:',
    options: {
      a: 'Nieruchomość',
      b: 'Prawo niezbywalne lub świadczenie pracy bądź usług',
      c: 'Wierzytelność',
      d: 'Przedsiębiorstwo'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 14 § 1 k.s.h. przedmiotem wkładu niepieniężnego do spółki z ograniczoną odpowiedzialnością, spółki akcyjnej albo przeznaczonego na kapitał akcyjny prostej spółki akcyjnej nie może być prawo niezbywalne lub świadczenie pracy bądź usług.',
    difficulty: 'easy',
    tags: ['wkład niepieniężny', 'aport', 'ograniczenia']
  },

  {
    id: 'ksh-022',
    article: 'Art. 14 § 4',
    articleTitle: 'Przedmiot wkładu i jego wady',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wspólnik spółki kapitałowej może potrącić swoją wierzytelność wobec spółki z wierzytelnością spółki z tytułu wpłaty na udziały/akcje:',
    options: {
      a: 'Zawsze bez ograniczeń',
      b: 'Tylko za zgodą zarządu',
      c: 'Nie może potrącić jednostronnie, ale dopuszczalne jest potrącenie umowne',
      d: 'Tylko za zgodą zgromadzenia wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 14 § 4 k.s.h. wspólnik i akcjonariusz nie może potrącać swoich wierzytelności wobec spółki kapitałowej z wierzytelnością spółki względem wspólnika z tytułu należnej wpłaty na poczet udziałów albo akcji. Nie wyłącza to potrącenia umownego.',
    difficulty: 'hard',
    tags: ['potrącenie', 'wkłady', 'zakaz potrącenia']
  },

  {
    id: 'ksh-023',
    article: 'Art. 15 § 1',
    articleTitle: 'Zgoda na zawarcie umowy z członkiem organu spółki',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zawarcie przez spółkę kapitałową umowy pożyczki z członkiem zarządu wymaga:',
    options: {
      a: 'Zgody rady nadzorczej',
      b: 'Zgody zgromadzenia wspólników albo walnego zgromadzenia',
      c: 'Formy aktu notarialnego',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 15 § 1 k.s.h. zawarcie przez spółkę kapitałową umowy kredytu, pożyczki, poręczenia lub innej podobnej umowy z członkiem zarządu, rady nadzorczej, komisji rewizyjnej, prokurentem, likwidatorem albo na rzecz którejkolwiek z tych osób, wymaga zgody zgromadzenia wspólników albo walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['umowa z członkiem organu', 'zgoda', 'pożyczka']
  },

  {
    id: 'ksh-024',
    article: 'Art. 16',
    articleTitle: 'Zakaz rozporządzania udziałem albo akcją przed wpisem do rejestru',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Rozporządzenie udziałem albo akcją dokonane przed wpisem spółki do rejestru jest:',
    options: {
      a: 'Ważne, ale bezskuteczne wobec spółki',
      b: 'Nieważne',
      c: 'Ważne pod warunkiem późniejszego wpisu spółki',
      d: 'Zawieszone do czasu wpisu spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 16 k.s.h. rozporządzenie udziałem albo akcją dokonane przed wpisem spółki kapitałowej do rejestru albo przed zarejestrowaniem podwyższenia kapitału zakładowego albo emisji nowych akcji bez wartości nominalnej jest nieważne.',
    difficulty: 'medium',
    tags: ['rozporządzenie udziałem', 'wpis do rejestru', 'nieważność']
  },

  {
    id: 'ksh-025',
    article: 'Art. 17 § 1',
    articleTitle: 'Czynność spółki bez wymaganej uchwały',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna dokonana przez spółkę bez wymaganej przez ustawę uchwały zgromadzenia wspólników jest:',
    options: {
      a: 'Ważna, ale wzruszalna',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Ważna, ale skutkuje odpowiedzialnością zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. jeżeli do dokonania czynności prawnej przez spółkę ustawa wymaga uchwały wspólników albo walnego zgromadzenia bądź rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest nieważna.',
    difficulty: 'medium',
    tags: ['uchwała', 'nieważność', 'czynność prawna']
  },

  {
    id: 'ksh-026',
    article: 'Art. 17 § 2',
    articleTitle: 'Czynność spółki bez wymaganej uchwały',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zgoda zgromadzenia wspólników na czynność prawną spółki może być wyrażona po złożeniu oświadczenia przez spółkę, nie później jednak niż w terminie:',
    options: {
      a: '7 dni od dnia złożenia oświadczenia',
      b: '14 dni od dnia złożenia oświadczenia',
      c: '1 miesiąca od dnia złożenia oświadczenia',
      d: '2 miesięcy od dnia złożenia oświadczenia'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 17 § 2 k.s.h. zgoda może być wyrażona przed złożeniem oświadczenia przez spółkę albo po jego złożeniu, nie później jednak niż w terminie dwóch miesięcy od dnia złożenia oświadczenia przez spółkę. Potwierdzenie wyrażone po złożeniu oświadczenia ma moc wsteczną.',
    difficulty: 'hard',
    tags: ['zgoda', 'termin', 'potwierdzenie']
  },

  {
    id: 'ksh-027',
    article: 'Art. 17 § 3',
    articleTitle: 'Czynność spółki bez wymaganej uchwały',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna dokonana bez zgody wymaganej wyłącznie przez umowę spółki (nie przez ustawę) jest:',
    options: {
      a: 'Nieważna',
      b: 'Ważna, ale nie wyklucza odpowiedzialności członków zarządu wobec spółki',
      c: 'Bezskuteczna wobec osób trzecich',
      d: 'Zawieszona do czasu uzyskania zgody'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 3 k.s.h. czynność prawna dokonana bez zgody właściwego organu spółki, wymaganej wyłącznie przez umowę spółki albo statut, jest ważna, jednakże nie wyklucza to odpowiedzialności członków zarządu wobec spółki z tytułu naruszenia umowy spółki albo statutu.',
    difficulty: 'hard',
    tags: ['zgoda umowna', 'ważność', 'odpowiedzialność zarządu']
  },

  {
    id: 'ksh-028',
    article: 'Art. 18 § 1',
    articleTitle: 'Wymogi ogólne co do członków organów',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Członkiem zarządu spółki kapitałowej może być:',
    options: {
      a: 'Tylko obywatel polski',
      b: 'Tylko osoba fizyczna mająca pełną zdolność do czynności prawnych',
      c: 'Osoba fizyczna lub prawna',
      d: 'Każda osoba pełnoletnia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 18 § 1 k.s.h. członkiem zarządu, rady nadzorczej, komisji rewizyjnej albo likwidatorem może być tylko osoba fizyczna mająca pełną zdolność do czynności prawnych.',
    difficulty: 'easy',
    tags: ['członek zarządu', 'zdolność do czynności prawnych', 'wymogi']
  },

  {
    id: 'ksh-029',
    article: 'Art. 18 § 2',
    articleTitle: 'Wymogi ogólne co do członków organów',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Osoba skazana prawomocnym wyrokiem za przestępstwo z art. 286 k.k. (oszustwo):',
    options: {
      a: 'Może być członkiem zarządu spółki kapitałowej',
      b: 'Nie może być członkiem zarządu, rady nadzorczej, prokurentem ani likwidatorem',
      c: 'Może być członkiem zarządu po upływie roku od wyroku',
      d: 'Może być członkiem zarządu za zgodą zgromadzenia wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 18 § 2 k.s.h. nie może być członkiem zarządu, rady nadzorczej, komisji rewizyjnej, likwidatorem albo prokurentem osoba, która została skazana prawomocnym wyrokiem za przestępstwa określone m.in. w rozdziałach XXXIII-XXXVII k.k., w tym oszustwo (art. 286 k.k. z rozdziału XXXV).',
    difficulty: 'medium',
    tags: ['zakaz pełnienia funkcji', 'karalność', 'przestępstwo']
  },

  {
    id: 'ksh-030',
    article: 'Art. 18 § 3',
    articleTitle: 'Wymogi ogólne co do członków organów',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zakaz pełnienia funkcji w spółce wynikający ze skazania ustaje z upływem:',
    options: {
      a: '3 lat od dnia uprawomocnienia się wyroku',
      b: '5 lat od dnia uprawomocnienia się wyroku',
      c: '10 lat od dnia uprawomocnienia się wyroku',
      d: 'Dopiero z chwilą zatarcia skazania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 18 § 3 k.s.h. zakaz ustaje z upływem piątego roku od dnia uprawomocnienia się wyroku skazującego, chyba że wcześniej nastąpiło zatarcie skazania.',
    difficulty: 'medium',
    tags: ['zakaz pełnienia funkcji', 'termin', 'zatarcie skazania']
  },

  {
    id: 'ksh-031',
    article: 'Art. 20',
    articleTitle: 'Zasada równouprawnienia wspólników i akcjonariuszy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zasada równego traktowania wspólników/akcjonariuszy spółki kapitałowej oznacza, że:',
    options: {
      a: 'Wszyscy wspólnicy mają zawsze równe prawa',
      b: 'Wspólnicy powinni być traktowani jednakowo w takich samych okolicznościach',
      c: 'Każdy wspólnik ma jeden głos',
      d: 'Nie można tworzyć udziałów uprzywilejowanych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 20 k.s.h. wspólnicy albo akcjonariusze spółki kapitałowej powinni być traktowani jednakowo w takich samych okolicznościach. Nie oznacza to zakazu uprzywilejowania, ale równe traktowanie w ramach tej samej kategorii.',
    difficulty: 'medium',
    tags: ['równouprawnienie', 'wspólnicy', 'akcjonariusze']
  },

  {
    id: 'ksh-032',
    article: 'Art. 21 § 1',
    articleTitle: 'Rozwiązanie spółki kapitałowej przez sąd rejestrowy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Sąd rejestrowy może orzec o rozwiązaniu spółki kapitałowej, gdy:',
    options: {
      a: 'Spółka nie osiąga zysków przez 3 lata',
      b: 'Nie zawarto umowy spółki lub przedmiot działalności jest sprzeczny z prawem',
      c: 'Wspólnicy są ze sobą skonfliktowani',
      d: 'Spółka nie składa sprawozdań finansowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21 § 1 k.s.h. sąd rejestrowy może orzec o rozwiązaniu spółki m.in. gdy: nie zawarto umowy spółki, przedmiot działalności jest sprzeczny z prawem, umowa nie zawiera wymaganych postanowień, osoby zawierające umowę nie miały zdolności do czynności prawnych.',
    difficulty: 'medium',
    tags: ['rozwiązanie spółki', 'sąd rejestrowy', 'przesłanki']
  },

  // ============================================================
  // TYTUŁ II - SPÓŁKA JAWNA (Art. 22-85)
  // ============================================================

  {
    id: 'ksh-033',
    article: 'Art. 22 § 1',
    articleTitle: 'Definicja spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka jawna jest spółką osobową, która:',
    options: {
      a: 'Prowadzi przedsiębiorstwo pod własną firmą, a wspólnicy odpowiadają bez ograniczeń',
      b: 'Prowadzi przedsiębiorstwo i wszyscy wspólnicy odpowiadają ograniczenie',
      c: 'Może być jednoosobowa',
      d: 'Ma osobowość prawną'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 22 § 1 k.s.h. spółką jawną jest spółka osobowa, która prowadzi przedsiębiorstwo pod własną firmą, a nie jest inną spółką handlową. Zgodnie z § 2 każdy wspólnik odpowiada za zobowiązania spółki bez ograniczenia całym swoim majątkiem solidarnie z pozostałymi wspólnikami oraz ze spółką.',
    difficulty: 'easy',
    tags: ['spółka jawna', 'definicja', 'odpowiedzialność']
  },

  {
    id: 'ksh-034',
    article: 'Art. 22 § 2',
    articleTitle: 'Odpowiedzialność za zobowiązania spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Wspólnik spółki jawnej odpowiada za zobowiązania spółki:',
    options: {
      a: 'Proporcjonalnie do wniesionego wkładu',
      b: 'Tylko do wysokości wniesionego wkładu',
      c: 'Bez ograniczenia całym swoim majątkiem solidarnie ze spółką i wspólnikami',
      d: 'Tylko jeśli spółka stała się niewypłacalna'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 22 § 2 k.s.h. każdy wspólnik odpowiada za zobowiązania spółki bez ograniczenia całym swoim majątkiem solidarnie z pozostałymi wspólnikami oraz ze spółką.',
    difficulty: 'easy',
    tags: ['odpowiedzialność wspólnika', 'solidarność', 'spółka jawna']
  },

  {
    id: 'ksh-035',
    article: 'Art. 23',
    articleTitle: 'Forma pisemna umowy',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Umowa spółki jawnej powinna być zawarta:',
    options: {
      a: 'W formie aktu notarialnego',
      b: 'W formie pisemnej pod rygorem nieważności',
      c: 'W dowolnej formie',
      d: 'W formie pisemnej z podpisami notarialnie poświadczonymi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 23 k.s.h. umowa spółki jawnej powinna być zawarta na piśmie pod rygorem nieważności. Jest to forma pisemna ad solemnitatem.',
    difficulty: 'easy',
    tags: ['forma umowy', 'spółka jawna', 'forma pisemna']
  },

  {
    id: 'ksh-036',
    article: 'Art. 25',
    articleTitle: 'Obowiązkowe elementy umowy spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Umowa spółki jawnej powinna zawierać:',
    options: {
      a: 'Tylko firmę spółki i wkłady wspólników',
      b: 'Firmę, siedzibę, wkłady wspólników i przedmiot działalności',
      c: 'Firmę, siedzibę, kapitał zakładowy i przedmiot działalności',
      d: 'Firmę, siedzibę, wkłady wspólników, przedmiot działalności i czas trwania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 25 k.s.h. umowa spółki jawnej powinna zawierać: 1) firmę i siedzibę spółki, 2) określenie wkładów wnoszonych przez każdego wspólnika i ich wartość, 3) przedmiot działalności spółki, 4) czas trwania spółki, jeżeli jest oznaczony.',
    difficulty: 'medium',
    tags: ['elementy umowy', 'spółka jawna', 'essentialia negotii']
  },

  {
    id: 'ksh-037',
    article: 'Art. 31 § 1',
    articleTitle: 'Zasada odpowiedzialności subsydiarnej wspólników',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Wierzyciel spółki jawnej może prowadzić egzekucję z majątku wspólnika:',
    options: {
      a: 'Od razu, przed egzekucją z majątku spółki',
      b: 'Dopiero gdy egzekucja z majątku spółki okaże się bezskuteczna',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko po ogłoszeniu upadłości spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 31 § 1 k.s.h. wierzyciel spółki może prowadzić egzekucję z majątku wspólnika w przypadku, gdy egzekucja z majątku spółki okaże się bezskuteczna. Jest to tzw. subsydiarna (posiłkowa) odpowiedzialność wspólników.',
    difficulty: 'medium',
    tags: ['odpowiedzialność subsydiarna', 'egzekucja', 'spółka jawna']
  },

  {
    id: 'ksh-038',
    article: 'Art. 31 § 2',
    articleTitle: 'Zasada odpowiedzialności subsydiarnej wspólników',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Zasada subsydiarnej odpowiedzialności wspólnika spółki jawnej (egzekucja dopiero po bezskutecznej egzekucji ze spółki):',
    options: {
      a: 'Nie wyłącza prawa do wytoczenia powództwa przeciwko wspólnikowi',
      b: 'Wyłącza prawo do wytoczenia powództwa przeciwko wspólnikowi przed egzekucją ze spółki',
      c: 'Wyłącza solidarność wspólników',
      d: 'Dotyczy tylko zobowiązań umownych'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 31 § 2 k.s.h. subsydiarna odpowiedzialność wspólnika nie wyłącza prawa wierzyciela do wytoczenia powództwa przeciwko wspólnikowi, zanim egzekucja z majątku spółki okaże się bezskuteczna. Można więc pozwać wspólnika "na zapas".',
    difficulty: 'hard',
    tags: ['odpowiedzialność subsydiarna', 'powództwo', 'egzekucja']
  },

  {
    id: 'ksh-039',
    article: 'Art. 32',
    articleTitle: 'Odpowiedzialność nowego wspólnika',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Osoba przystępująca do spółki jawnej odpowiada za zobowiązania spółki:',
    options: {
      a: 'Tylko za zobowiązania powstałe po jej przystąpieniu',
      b: 'Także za zobowiązania spółki powstałe przed jej przystąpieniem',
      c: 'Tylko do wysokości wniesionego wkładu',
      d: 'Nie odpowiada za żadne zobowiązania przez pierwszy rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 32 k.s.h. osoba przystępująca do spółki odpowiada za zobowiązania spółki powstałe przed dniem jej przystąpienia. Jest to istotne dla oceny ryzyka przystąpienia do istniejącej spółki.',
    difficulty: 'medium',
    tags: ['nowy wspólnik', 'odpowiedzialność', 'przystąpienie do spółki']
  },

  {
    id: 'ksh-040',
    article: 'Art. 39 § 1',
    articleTitle: 'Prowadzenie spraw spółki',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Każdy wspólnik spółki jawnej ma prawo i obowiązek prowadzenia spraw spółki:',
    options: {
      a: 'Tylko w zakresie czynności nieprzekraczających zakresu zwykłych czynności spółki',
      b: 'Bez ograniczeń, włącznie z czynnościami przekraczającymi zwykły zarząd',
      c: 'Tylko za wynagrodzeniem',
      d: 'Tylko na podstawie uchwały wspólników'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 39 § 1 k.s.h. każdy wspólnik ma prawo i obowiązek prowadzenia spraw spółki. Zgodnie z § 2 każdy wspólnik może bez uprzedniej uchwały wspólników prowadzić sprawy nieprzekraczające zakresu zwykłych czynności spółki.',
    difficulty: 'medium',
    tags: ['prowadzenie spraw', 'zwykłe czynności', 'spółka jawna']
  },

  {
    id: 'ksh-041',
    article: 'Art. 29 § 1',
    articleTitle: 'Reprezentacja spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Każdy wspólnik spółki jawnej ma prawo reprezentować spółkę:',
    options: {
      a: 'Tylko łącznie z innym wspólnikiem',
      b: 'Samodzielnie, chyba że umowa stanowi inaczej',
      c: 'Tylko na podstawie uchwały wspólników',
      d: 'Tylko za zgodą pozostałych wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 29 § 1 k.s.h. każdy wspólnik ma prawo reprezentować spółkę. Prawo wspólnika do reprezentowania spółki dotyczy wszystkich czynności sądowych i pozasądowych spółki. Umowa spółki może jednak wprowadzić reprezentację łączną.',
    difficulty: 'easy',
    tags: ['reprezentacja', 'spółka jawna', 'wspólnik']
  },

  {
    id: 'ksh-042',
    article: 'Art. 51 § 1',
    articleTitle: 'Uczestnictwo w zyskach i stratach',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'W braku odmiennych postanowień umowy spółki jawnej, wspólnik uczestniczy w zyskach i stratach:',
    options: {
      a: 'Proporcjonalnie do wniesionego wkładu',
      b: 'W częściach równych bez względu na rodzaj i wartość wkładu',
      c: 'Proporcjonalnie do czasu uczestnictwa w spółce',
      d: 'Według decyzji większości wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 51 § 1 k.s.h. każdy wspólnik ma prawo do równego udziału w zyskach i uczestniczy w stratach w tym samym stosunku bez względu na rodzaj i wartość wkładu. Umowa spółki może jednak określić inny udział.',
    difficulty: 'medium',
    tags: ['zyski i straty', 'udział', 'spółka jawna']
  },

  {
    id: 'ksh-043',
    article: 'Art. 56 § 1',
    articleTitle: 'Zakaz konkurencji w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Wspólnik spółki jawnej bez zgody pozostałych wspólników:',
    options: {
      a: 'Może prowadzić działalność konkurencyjną',
      b: 'Nie może zajmować się interesami konkurencyjnymi ani uczestniczyć w spółce konkurencyjnej jako wspólnik',
      c: 'Może uczestniczyć w spółce konkurencyjnej jako akcjonariusz S.A.',
      d: 'Może prowadzić działalność konkurencyjną po roku od przystąpienia do spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 56 § 1 k.s.h. wspólnik obowiązany jest powstrzymać się od wszelkiej działalności sprzecznej z interesami spółki. Nie może bez wyraźnej lub domniemanej zgody pozostałych wspólników zajmować się interesami konkurencyjnymi, w szczególności uczestniczyć w spółce konkurencyjnej jako wspólnik spółki cywilnej, jawnej, partner, komplementariusz lub członek organu.',
    difficulty: 'medium',
    tags: ['zakaz konkurencji', 'lojalność', 'spółka jawna']
  },

  {
    id: 'ksh-044',
    article: 'Art. 58',
    articleTitle: 'Przyczyny rozwiązania spółki',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Która z poniższych NIE jest przyczyną rozwiązania spółki jawnej wskazaną w art. 58 k.s.h.?',
    options: {
      a: 'Przyczyny przewidziane w umowie spółki',
      b: 'Jednomyślna uchwała wszystkich wspólników',
      c: 'Ogłoszenie upadłości spółki',
      d: 'Utrata zdolności do czynności prawnych przez jednego wspólnika'
    },
    correct: 'd',
    explanation: 'Art. 58 k.s.h. wymienia przyczyny rozwiązania: 1) przewidziane w umowie, 2) jednomyślna uchwała wszystkich wspólników, 3) ogłoszenie upadłości spółki, 4) śmierć wspólnika lub ogłoszenie jego upadłości, 5) wypowiedzenie umowy przez wspólnika lub wierzyciela, 6) prawomocne orzeczenie sądu. Utrata zdolności do czynności prawnych nie jest bezpośrednią przyczyną rozwiązania.',
    difficulty: 'hard',
    tags: ['rozwiązanie spółki', 'przyczyny', 'spółka jawna']
  },

  {
    id: 'ksh-045',
    article: 'Art. 61 § 1',
    articleTitle: 'Wypowiedzenie umowy spółki',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Jeżeli spółkę jawną zawarto na czas nieoznaczony, wspólnik może wypowiedzieć umowę:',
    options: {
      a: 'W każdym czasie bez zachowania terminu',
      b: 'Na sześć miesięcy przed końcem roku obrotowego',
      c: 'Na trzy miesiące naprzód',
      d: 'Tylko za zgodą pozostałych wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 61 § 1 k.s.h. jeżeli spółkę zawarto na czas nieoznaczony, wspólnik może wypowiedzieć umowę spółki na sześć miesięcy przed końcem roku obrotowego.',
    difficulty: 'medium',
    tags: ['wypowiedzenie', 'termin', 'spółka jawna']
  },

  // ============================================================
  // TYTUŁ III - SPÓŁKA PARTNERSKA (Art. 86-101)
  // ============================================================

  {
    id: 'ksh-046',
    article: 'Art. 86 § 1',
    articleTitle: 'Definicja spółki partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka partnerska jest spółką osobową utworzoną przez:',
    options: {
      a: 'Dowolne osoby fizyczne',
      b: 'Wspólników (partnerów) w celu wykonywania wolnego zawodu',
      c: 'Osoby prawne i fizyczne',
      d: 'Przedsiębiorców prowadzących działalność handlową'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 86 § 1 k.s.h. spółką partnerską jest spółka osobowa, utworzona przez wspólników (partnerów) w celu wykonywania wolnego zawodu w spółce prowadzącej przedsiębiorstwo pod własną firmą.',
    difficulty: 'easy',
    tags: ['spółka partnerska', 'definicja', 'wolny zawód']
  },

  {
    id: 'ksh-047',
    article: 'Art. 87 § 1',
    articleTitle: 'Partnerami mogą być osoby uprawnione do wykonywania wolnych zawodów',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Partnerami w spółce partnerskiej mogą być osoby uprawnione do wykonywania następujących zawodów OPRÓCZ:',
    options: {
      a: 'Adwokaci i radcowie prawni',
      b: 'Lekarze i dentyści',
      c: 'Księgowi i biegli rewidenci',
      d: 'Agenci ubezpieczeniowi'
    },
    correct: 'd',
    explanation: 'Art. 87 § 1 k.s.h. wymienia wolne zawody uprawniające do bycia partnerem, m.in.: adwokat, aptekarz, architekt, inżynier budownictwa, biegły rewident, broker ubezpieczeniowy, doradca podatkowy, lekarz, notariusz, pielęgniarka, radca prawny, rzecznik patentowy, tłumacz przysięgły. Agent ubezpieczeniowy nie jest wymieniony.',
    difficulty: 'hard',
    tags: ['spółka partnerska', 'wolny zawód', 'partnerzy']
  },

  {
    id: 'ksh-048',
    article: 'Art. 95 § 1',
    articleTitle: 'Odpowiedzialność partnera za zobowiązania',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Partner w spółce partnerskiej NIE odpowiada za zobowiązania spółki powstałe:',
    options: {
      a: 'W związku z prowadzeniem spółki',
      b: 'W związku z wykonywaniem przez pozostałych partnerów wolnego zawodu',
      c: 'W związku z działaniami pracowników podlegających mu kierownictwu',
      d: 'W związku z zawartymi umowami najmu lokalu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 95 § 1 k.s.h. partner nie ponosi odpowiedzialności za zobowiązania spółki powstałe w związku z wykonywaniem przez pozostałych partnerów wolnego zawodu w spółce, jak również za zobowiązania spółki będące następstwem działań lub zaniechań osób zatrudnionych przez spółkę na podstawie umowy o pracę lub innego stosunku prawnego, które podlegały kierownictwu innego partnera przy świadczeniu usług.',
    difficulty: 'hard',
    tags: ['odpowiedzialność partnera', 'spółka partnerska', 'ograniczenie']
  },

  // ============================================================
  // TYTUŁ IV - SPÓŁKA KOMANDYTOWA (Art. 102-124)
  // ============================================================

  {
    id: 'ksh-049',
    article: 'Art. 102',
    articleTitle: 'Definicja spółki komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'W spółce komandytowej za zobowiązania spółki odpowiada bez ograniczenia:',
    options: {
      a: 'Komandytariusz',
      b: 'Komplementariusz',
      c: 'Obaj wspólnicy w równym stopniu',
      d: 'Żaden ze wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 102 k.s.h. spółką komandytową jest spółka osobowa, w której wobec wierzycieli za zobowiązania spółki co najmniej jeden wspólnik odpowiada bez ograniczenia (komplementariusz), a odpowiedzialność co najmniej jednego wspólnika (komandytariusza) jest ograniczona.',
    difficulty: 'easy',
    tags: ['spółka komandytowa', 'komplementariusz', 'komandytariusz']
  },

  {
    id: 'ksh-050',
    article: 'Art. 111',
    articleTitle: 'Suma komandytowa',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Komandytariusz odpowiada za zobowiązania spółki komandytowej:',
    options: {
      a: 'Bez ograniczeń całym majątkiem',
      b: 'Do wysokości sumy komandytowej',
      c: 'Tylko do wysokości wniesionego wkładu',
      d: 'Nie odpowiada wcale'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 111 k.s.h. komandytariusz odpowiada za zobowiązania spółki wobec jej wierzycieli tylko do wysokości sumy komandytowej. Jest to kwota określona w umowie spółki, stanowiąca górną granicę odpowiedzialności komandytariusza.',
    difficulty: 'easy',
    tags: ['komandytariusz', 'suma komandytowa', 'odpowiedzialność']
  },

  {
    id: 'ksh-051',
    article: 'Art. 112 § 1',
    articleTitle: 'Zwolnienie od odpowiedzialności',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Komandytariusz jest wolny od odpowiedzialności w granicach:',
    options: {
      a: 'Całej sumy komandytowej po wniesieniu wkładu',
      b: 'Wartości wkładu wniesionego do spółki',
      c: 'Zawsze odpowiada do wysokości sumy komandytowej',
      d: '50% sumy komandytowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 112 § 1 k.s.h. komandytariusz jest wolny od odpowiedzialności w granicach wartości wkładu wniesionego do spółki. Jeśli wniósł wkład równy sumie komandytowej, nie odpowiada za zobowiązania spółki.',
    difficulty: 'medium',
    tags: ['komandytariusz', 'wkład', 'zwolnienie od odpowiedzialności']
  },

  {
    id: 'ksh-052',
    article: 'Art. 117',
    articleTitle: 'Prawo komandytariusza do reprezentacji',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Komandytariusz może reprezentować spółkę komandytową:',
    options: {
      a: 'Samodzielnie we wszystkich sprawach',
      b: 'Tylko jako pełnomocnik',
      c: 'Łącznie z komplementariuszem',
      d: 'Nie ma prawa reprezentowania spółki w żadnym przypadku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 117 k.s.h. komandytariusz może reprezentować spółkę jedynie jako pełnomocnik. Nie ma ustawowego prawa do reprezentacji spółki (w przeciwieństwie do komplementariusza).',
    difficulty: 'medium',
    tags: ['komandytariusz', 'reprezentacja', 'pełnomocnictwo']
  },

  {
    id: 'ksh-053',
    article: 'Art. 118 § 1',
    articleTitle: 'Skutki działania komandytariusza bez pełnomocnictwa',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Jeżeli komandytariusz dokona czynności prawnej w imieniu spółki bez ujawnienia swojego pełnomocnictwa:',
    options: {
      a: 'Czynność jest nieważna',
      b: 'Odpowiada za skutki tej czynności wobec osób trzecich bez ograniczenia',
      c: 'Odpowiada tylko do wysokości sumy komandytowej',
      d: 'Spółka może uchylić się od skutków tej czynności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 118 § 1 k.s.h. jeżeli komandytariusz dokona w imieniu spółki czynności prawnej, nie ujawniając swojego pełnomocnictwa, odpowiada za skutki tej czynności wobec osób trzecich bez ograniczenia. Jest to tzw. odpowiedzialność jak komplementariusz.',
    difficulty: 'hard',
    tags: ['komandytariusz', 'pełnomocnictwo', 'odpowiedzialność']
  },

  // ============================================================
  // TYTUŁ V - SPÓŁKA KOMANDYTOWO-AKCYJNA (Art. 125-150)
  // ============================================================

  {
    id: 'ksh-054',
    article: 'Art. 125',
    articleTitle: 'Definicja spółki komandytowo-akcyjnej',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Przepisy ogólne',
    question: 'Spółka komandytowo-akcyjna jest spółką:',
    options: {
      a: 'Kapitałową',
      b: 'Osobową, w której za zobowiązania odpowiada co najmniej jeden komplementariusz, a co najmniej jeden wspólnik jest akcjonariuszem',
      c: 'Hybrydową z osobowością prawną',
      d: 'Osobową, w której wszyscy wspólnicy są akcjonariuszami'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 125 k.s.h. spółką komandytowo-akcyjną jest spółka osobowa mająca na celu prowadzenie przedsiębiorstwa pod własną firmą, w której wobec wierzycieli za zobowiązania spółki co najmniej jeden wspólnik odpowiada bez ograniczenia (komplementariusz), a co najmniej jeden wspólnik jest akcjonariuszem.',
    difficulty: 'medium',
    tags: ['spółka komandytowo-akcyjna', 'definicja', 'komplementariusz', 'akcjonariusz']
  },

  {
    id: 'ksh-055',
    article: 'Art. 126 § 1',
    articleTitle: 'Minimalny kapitał zakładowy',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Przepisy ogólne',
    question: 'Minimalny kapitał zakładowy spółki komandytowo-akcyjnej wynosi:',
    options: {
      a: '5 000 zł',
      b: '50 000 zł',
      c: '100 000 zł',
      d: '500 000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 126 § 2 k.s.h. kapitał zakładowy spółki komandytowo-akcyjnej powinien wynosić co najmniej 50 000 złotych.',
    difficulty: 'medium',
    tags: ['kapitał zakładowy', 'spółka komandytowo-akcyjna', 'minimum']
  },

  // ============================================================
  // TYTUŁ III - SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ (Art. 151-300)
  // ============================================================

  {
    id: 'ksh-056',
    article: 'Art. 151 § 1',
    articleTitle: 'Istota spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka z ograniczoną odpowiedzialnością może być utworzona przez:',
    options: {
      a: 'Tylko osoby fizyczne',
      b: 'Tylko osoby prawne',
      c: 'Jedną albo więcej osób (z wyjątkiem jednoosobowej sp. z o.o.)',
      d: 'Minimum dwóch wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 151 § 1 k.s.h. spółka z ograniczoną odpowiedzialnością może być utworzona przez jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej. Nie może być jednak zawiązana wyłącznie przez inną jednoosobową spółkę z o.o.',
    difficulty: 'easy',
    tags: ['spółka z o.o.', 'utworzenie', 'wspólnicy']
  },

  {
    id: 'ksh-057',
    article: 'Art. 151 § 2',
    articleTitle: 'Ograniczenie tworzenia spółki jednoosobowej',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka z o.o. NIE może być zawiązana wyłącznie przez:',
    options: {
      a: 'Osobę fizyczną',
      b: 'Spółkę akcyjną',
      c: 'Inną jednoosobową spółkę z ograniczoną odpowiedzialnością',
      d: 'Spółkę jawną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 151 § 2 k.s.h. spółka z ograniczoną odpowiedzialnością nie może być zawiązana wyłącznie przez inną jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['spółka z o.o.', 'spółka jednoosobowa', 'ograniczenie']
  },

  {
    id: 'ksh-058',
    article: 'Art. 154 § 1',
    articleTitle: 'Kapitał zakładowy spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalny kapitał zakładowy spółki z ograniczoną odpowiedzialnością wynosi:',
    options: {
      a: '1 000 zł',
      b: '5 000 zł',
      c: '50 000 zł',
      d: '100 000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 154 § 1 k.s.h. kapitał zakładowy spółki z ograniczoną odpowiedzialnością powinien wynosić co najmniej 5 000 złotych.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'spółka z o.o.', 'minimum']
  },

  {
    id: 'ksh-059',
    article: 'Art. 154 § 2',
    articleTitle: 'Minimalna wartość udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalna wartość nominalna udziału w spółce z o.o. wynosi:',
    options: {
      a: '1 zł',
      b: '10 zł',
      c: '50 zł',
      d: '100 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 154 § 2 k.s.h. wartość nominalna udziału nie może być niższa niż 50 złotych.',
    difficulty: 'easy',
    tags: ['udział', 'wartość nominalna', 'spółka z o.o.']
  },

  {
    id: 'ksh-060',
    article: 'Art. 157 § 1',
    articleTitle: 'Forma umowy spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa spółki z ograniczoną odpowiedzialnością powinna być zawarta w formie:',
    options: {
      a: 'Pisemnej z podpisami notarialnie poświadczonymi',
      b: 'Aktu notarialnego',
      c: 'Pisemnej pod rygorem nieważności',
      d: 'Dowolnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157 § 2 k.s.h. umowa spółki z ograniczoną odpowiedzialnością powinna być zawarta w formie aktu notarialnego (z wyjątkiem zawarcia umowy przy wykorzystaniu wzorca umowy w systemie S24).',
    difficulty: 'easy',
    tags: ['forma umowy', 'akt notarialny', 'spółka z o.o.']
  },

  {
    id: 'ksh-061',
    article: 'Art. 158 § 1',
    articleTitle: 'Obowiązkowe elementy umowy spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa spółki z o.o. powinna określać:',
    options: {
      a: 'Tylko firmę i siedzibę spółki',
      b: 'Firmę, siedzibę, przedmiot działalności, kapitał zakładowy, udziały i czas trwania (jeśli oznaczony)',
      c: 'Firmę, siedzibę i skład zarządu',
      d: 'Firmę, kapitał zakładowy i zasady reprezentacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157 § 1 k.s.h. umowa spółki z o.o. powinna określać: firmę i siedzibę spółki, przedmiot działalności, wysokość kapitału zakładowego, czy wspólnik może mieć więcej niż jeden udział, liczbę i wartość nominalną udziałów objętych przez poszczególnych wspólników, czas trwania spółki (jeżeli jest oznaczony).',
    difficulty: 'medium',
    tags: ['elementy umowy', 'spółka z o.o.', 'essentialia negotii']
  },

  {
    id: 'ksh-062',
    article: 'Art. 163',
    articleTitle: 'Warunki powstania spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania spółki z o.o. wymagane jest m.in.:',
    options: {
      a: 'Tylko zawarcie umowy spółki',
      b: 'Zawarcie umowy, wniesienie wkładów, powołanie zarządu i wpis do rejestru',
      c: 'Zawarcie umowy i wpis do rejestru',
      d: 'Zawarcie umowy i powołanie rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 163 k.s.h. do powstania spółki z o.o. wymaga się: zawarcia umowy spółki, wniesienia przez wspólników wkładów na pokrycie całego kapitału zakładowego, powołania zarządu, ustanowienia rady nadzorczej lub komisji rewizyjnej (jeśli wymaga tego ustawa lub umowa), wpisu do rejestru.',
    difficulty: 'medium',
    tags: ['powstanie spółki', 'wymogi', 'spółka z o.o.']
  },

  {
    id: 'ksh-063',
    article: 'Art. 180 § 1',
    articleTitle: 'Forma zbycia udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zbycie udziału w spółce z o.o. wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dowolnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 180 § 1 k.s.h. zbycie udziału, jego części lub ułamkowej części udziału oraz jego zastawienie powinno być dokonane w formie pisemnej z podpisami notarialnie poświadczonymi.',
    difficulty: 'easy',
    tags: ['zbycie udziału', 'forma', 'spółka z o.o.']
  },

  {
    id: 'ksh-064',
    article: 'Art. 182 § 1',
    articleTitle: 'Ograniczenie zbywalności udziałów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zbycie udziału w spółce z o.o. może być uzależnione od zgody spółki:',
    options: {
      a: 'Nie, udziały są zawsze zbywalne bez ograniczeń',
      b: 'Tak, jeżeli umowa spółki tak stanowi',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko w pierwszym roku istnienia spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 182 § 1 k.s.h. zbycie udziału, jego części lub ułamkowej części udziału oraz zastawienie udziału umowa spółki może uzależnić od zgody spółki albo w inny sposób ograniczyć.',
    difficulty: 'medium',
    tags: ['zbycie udziału', 'ograniczenie', 'zgoda spółki']
  },

  {
    id: 'ksh-065',
    article: 'Art. 201 § 1',
    articleTitle: 'Zarząd spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zarząd spółki z o.o. prowadzi sprawy spółki i:',
    options: {
      a: 'Kontroluje działalność spółki',
      b: 'Reprezentuje spółkę',
      c: 'Zatwierdza sprawozdania finansowe',
      d: 'Powołuje i odwołuje członków rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 201 § 1 k.s.h. zarząd prowadzi sprawy spółki i reprezentuje spółkę. Są to dwie podstawowe funkcje zarządu.',
    difficulty: 'easy',
    tags: ['zarząd', 'reprezentacja', 'prowadzenie spraw']
  },

  {
    id: 'ksh-066',
    article: 'Art. 201 § 4',
    articleTitle: 'Skład zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zarząd spółki z o.o. składa się z:',
    options: {
      a: 'Minimum trzech członków',
      b: 'Jednego albo większej liczby członków',
      c: 'Minimum dwóch członków',
      d: 'Liczby członków określonej przez sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 201 § 2 k.s.h. zarząd składa się z jednego albo większej liczby członków. Może więc być zarząd jednoosobowy.',
    difficulty: 'easy',
    tags: ['zarząd', 'skład', 'spółka z o.o.']
  },

  {
    id: 'ksh-067',
    article: 'Art. 202 § 1',
    articleTitle: 'Powołanie członków zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli umowa spółki z o.o. nie stanowi inaczej, członek zarządu jest powoływany i odwoływany:',
    options: {
      a: 'Przez sąd rejestrowy',
      b: 'Przez radę nadzorczą',
      c: 'Uchwałą wspólników',
      d: 'Przez zarząd'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 201 § 4 k.s.h. członek zarządu jest powoływany i odwoływany uchwałą wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['zarząd', 'powołanie', 'odwołanie']
  },

  {
    id: 'ksh-068',
    article: 'Art. 207',
    articleTitle: 'Zasady reprezentacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli zarząd jest wieloosobowy, a umowa spółki nie stanowi inaczej, do składania oświadczeń w imieniu spółki wymagane jest:',
    options: {
      a: 'Działanie jednego członka zarządu',
      b: 'Współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem',
      c: 'Działanie wszystkich członków zarządu łącznie',
      d: 'Działanie prezesa zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 205 § 1 k.s.h. jeżeli zarząd jest wieloosobowy, sposób reprezentowania określa umowa spółki. Jeżeli umowa spółki nie zawiera żadnych postanowień w tym przedmiocie, do składania oświadczeń w imieniu spółki wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem.',
    difficulty: 'medium',
    tags: ['reprezentacja', 'zarząd wieloosobowy', 'spółka z o.o.']
  },

  {
    id: 'ksh-069',
    article: 'Art. 210 § 1',
    articleTitle: 'Reprezentacja spółki w umowach z członkiem zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W umowie między spółką z o.o. a członkiem zarządu spółkę reprezentuje:',
    options: {
      a: 'Inny członek zarządu',
      b: 'Rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Prokurent',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 1 k.s.h. w umowie między spółką a członkiem zarządu oraz w sporze z nim spółkę reprezentuje rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników.',
    difficulty: 'medium',
    tags: ['reprezentacja', 'umowa z członkiem zarządu', 'konflikt interesów']
  },

  {
    id: 'ksh-070',
    article: 'Art. 212 § 1',
    articleTitle: 'Rada nadzorcza w spółce z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Ustanowienie rady nadzorczej w spółce z o.o. jest obligatoryjne, gdy:',
    options: {
      a: 'Kapitał zakładowy przekracza 100 000 zł',
      b: 'Kapitał zakładowy przekracza 500 000 zł, a wspólników jest więcej niż dwudziestu pięciu',
      c: 'Spółka ma więcej niż 10 wspólników',
      d: 'Spółka zatrudnia więcej niż 50 pracowników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 213 § 2 k.s.h. w spółkach, w których kapitał zakładowy przewyższa kwotę 500 000 złotych, a wspólników jest więcej niż dwudziestu pięciu, powinna być ustanowiona rada nadzorcza lub komisja rewizyjna.',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'obligatoryjność', 'spółka z o.o.']
  },

  {
    id: 'ksh-071',
    article: 'Art. 228',
    articleTitle: 'Kompetencje zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników wymaga m.in.:',
    options: {
      a: 'Zawieranie wszystkich umów przez spółkę',
      b: 'Rozpatrzenie i zatwierdzenie sprawozdania zarządu i sprawozdania finansowego',
      c: 'Codzienne prowadzenie spraw spółki',
      d: 'Reprezentowanie spółki przed sądem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 228 pkt 1 k.s.h. uchwały zgromadzenia wspólników wymaga m.in. rozpatrzenie i zatwierdzenie sprawozdania zarządu z działalności spółki, sprawozdania finansowego za ubiegły rok obrotowy oraz udzielenie absolutorium członkom organów spółki.',
    difficulty: 'easy',
    tags: ['zgromadzenie wspólników', 'kompetencje', 'uchwały']
  },

  {
    id: 'ksh-072',
    article: 'Art. 230',
    articleTitle: 'Zgoda na rozporządzenie nieruchomością',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego wymaga:',
    options: {
      a: 'Zgody rady nadzorczej',
      b: 'Uchwały wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Zgody sądu rejestrowego',
      d: 'Formy aktu notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 230 k.s.h. rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['rozporządzenie majątkiem', 'zgoda wspólników', 'wartość świadczenia']
  },

  {
    id: 'ksh-073',
    article: 'Art. 245',
    articleTitle: 'Większość głosów przy podejmowaniu uchwał',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników spółki z o.o. zapadają co do zasady:',
    options: {
      a: 'Jednomyślnie',
      b: 'Bezwzględną większością głosów, jeżeli ustawa lub umowa nie stanowi inaczej',
      c: 'Zwykłą większością głosów',
      d: 'Większością 2/3 głosów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 245 k.s.h. uchwały zapadają bezwzględną większością głosów, jeżeli przepisy niniejszego działu lub umowa spółki nie stanowią inaczej.',
    difficulty: 'easy',
    tags: ['uchwały', 'większość głosów', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-074',
    article: 'Art. 246 § 1',
    articleTitle: 'Zmiana umowy spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała o zmianie umowy spółki z o.o. zapada większością:',
    options: {
      a: 'Bezwzględną większością głosów',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 246 § 1 k.s.h. uchwały dotyczące zmiany umowy spółki, rozwiązania spółki lub zbycia przedsiębiorstwa albo jego zorganizowanej części zapadają większością dwóch trzecich głosów.',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'większość kwalifikowana', 'spółka z o.o.']
  },

  {
    id: 'ksh-075',
    article: 'Art. 252 § 1',
    articleTitle: 'Powództwo o uchylenie uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wytoczenia powództwa o uchylenie uchwały zgromadzenia wspólników przysługuje:',
    options: {
      a: 'Tylko wspólnikom',
      b: 'Tylko zarządowi',
      c: 'Zarządowi, radzie nadzorczej, komisji rewizyjnej oraz wspólnikowi, który głosował przeciwko i żądał zaprotokołowania sprzeciwu',
      d: 'Każdemu, kto ma interes prawny'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 250 k.s.h. prawo do wytoczenia powództwa o uchylenie uchwały wspólników przysługuje: zarządowi, radzie nadzorczej, komisji rewizyjnej oraz poszczególnym ich członkom, wspólnikowi, który głosował przeciwko uchwale i po jej powzięciu zażądał zaprotokołowania sprzeciwu, wspólnikowi bezzasadnie niedopuszczonemu do udziału w zgromadzeniu, wspólnikowi nieobecnemu na zgromadzeniu (w określonych przypadkach).',
    difficulty: 'hard',
    tags: ['powództwo o uchylenie', 'legitymacja', 'uchwała']
  },

  {
    id: 'ksh-076',
    article: 'Art. 252 § 1',
    articleTitle: 'Termin na powództwo o uchylenie uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Powództwo o uchylenie uchwały wspólników spółki z o.o. należy wnieść w terminie:',
    options: {
      a: '7 dni od dnia otrzymania wiadomości o uchwale',
      b: 'Miesiąca od dnia otrzymania wiadomości o uchwale, nie później niż w terminie 6 miesięcy od dnia powzięcia uchwały',
      c: '3 miesięcy od dnia powzięcia uchwały',
      d: 'Roku od dnia powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 251 k.s.h. powództwo o uchylenie uchwały wspólników należy wnieść w terminie miesiąca od dnia otrzymania wiadomości o uchwale, nie później jednak niż w terminie sześciu miesięcy od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['powództwo o uchylenie', 'termin', 'uchwała']
  },

  {
    id: 'ksh-077',
    article: 'Art. 299 § 1',
    articleTitle: 'Odpowiedzialność członków zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Jeżeli egzekucja przeciwko spółce z o.o. okaże się bezskuteczna, członkowie zarządu odpowiadają:',
    options: {
      a: 'Tylko do wysokości kapitału zakładowego',
      b: 'Solidarnie za jej zobowiązania',
      c: 'Proporcjonalnie do udziałów w zarządzie',
      d: 'Nie odpowiadają osobiście'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 1 k.s.h. jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania.',
    difficulty: 'easy',
    tags: ['odpowiedzialność zarządu', 'bezskuteczna egzekucja', 'spółka z o.o.']
  },

  {
    id: 'ksh-078',
    article: 'Art. 299 § 2',
    articleTitle: 'Przesłanki egzoneracyjne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Członek zarządu może uwolnić się od odpowiedzialności z art. 299 k.s.h., jeżeli wykaże, że:',
    options: {
      a: 'Nie wiedział o zobowiązaniach spółki',
      b: 'We właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub w tym samym czasie wydano postanowienie o otwarciu postępowania restrukturyzacyjnego',
      c: 'Był członkiem zarządu krócej niż rok',
      d: 'Spółka miała ujemny kapitał własny'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może się uwolnić od odpowiedzialności, jeżeli wykaże, że we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub w tym samym czasie wydano postanowienie o otwarciu postępowania restrukturyzacyjnego albo o zatwierdzeniu układu w postępowaniu w przedmiocie zatwierdzenia układu, albo że niezgłoszenie wniosku o ogłoszenie upadłości nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku wierzyciel nie poniósł szkody.',
    difficulty: 'hard',
    tags: ['odpowiedzialność zarządu', 'przesłanki egzoneracyjne', 'upadłość']
  },

  // ============================================================
  // TYTUŁ IV - SPÓŁKA AKCYJNA (Art. 301-490)
  // ============================================================

  {
    id: 'ksh-079',
    article: 'Art. 301 § 1',
    articleTitle: 'Zawiązanie spółki akcyjnej',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka akcyjna może być zawiązana przez:',
    options: {
      a: 'Minimum trzech założycieli',
      b: 'Jedną albo więcej osób',
      c: 'Minimum dwóch założycieli',
      d: 'Tylko osoby prawne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 301 § 1 k.s.h. zawiązać spółkę akcyjną może jedna albo więcej osób. Spółka akcyjna nie może być jednak zawiązana wyłącznie przez jednoosobową spółkę z o.o.',
    difficulty: 'easy',
    tags: ['spółka akcyjna', 'zawiązanie', 'założyciele']
  },

  {
    id: 'ksh-080',
    article: 'Art. 308 § 1',
    articleTitle: 'Kapitał zakładowy S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalny kapitał zakładowy spółki akcyjnej wynosi:',
    options: {
      a: '50 000 zł',
      b: '100 000 zł',
      c: '500 000 zł',
      d: '1 000 000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 308 § 1 k.s.h. kapitał zakładowy spółki akcyjnej powinien wynosić co najmniej 100 000 złotych.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'spółka akcyjna', 'minimum']
  },

  {
    id: 'ksh-081',
    article: 'Art. 308 § 2',
    articleTitle: 'Minimalna wartość nominalna akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalna wartość nominalna akcji w spółce akcyjnej wynosi:',
    options: {
      a: '1 grosz',
      b: '1 złoty',
      c: '10 złotych',
      d: '50 złotych'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 308 § 2 k.s.h. wartość nominalna akcji nie może być niższa niż 1 grosz.',
    difficulty: 'easy',
    tags: ['akcja', 'wartość nominalna', 'spółka akcyjna']
  },

  {
    id: 'ksh-082',
    article: 'Art. 304 § 1',
    articleTitle: 'Forma statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Statut spółki akcyjnej powinien być sporządzony w formie:',
    options: {
      a: 'Pisemnej z podpisami notarialnie poświadczonymi',
      b: 'Aktu notarialnego',
      c: 'Pisemnej pod rygorem nieważności',
      d: 'Dokumentu urzędowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 301 § 2 k.s.h. statut spółki akcyjnej powinien być sporządzony w formie aktu notarialnego.',
    difficulty: 'easy',
    tags: ['statut', 'forma', 'spółka akcyjna', 'akt notarialny']
  },

  {
    id: 'ksh-083',
    article: 'Art. 368 § 1',
    articleTitle: 'Zarząd S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Zarząd spółki akcyjnej składa się z:',
    options: {
      a: 'Minimum trzech członków',
      b: 'Jednego albo większej liczby członków',
      c: 'Minimum dwóch członków',
      d: 'Liczby członków określonej przez KRS'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 368 § 2 k.s.h. zarząd składa się z jednego albo większej liczby członków. Liczbę członków zarządu określa statut lub rada nadzorcza.',
    difficulty: 'easy',
    tags: ['zarząd', 'skład', 'spółka akcyjna']
  },

  {
    id: 'ksh-084',
    article: 'Art. 368 § 4',
    articleTitle: 'Kadencja zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Maksymalna kadencja członka zarządu spółki akcyjnej wynosi:',
    options: {
      a: '3 lata',
      b: '5 lat',
      c: '6 lat',
      d: 'Nie ma ograniczenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 369 § 1 k.s.h. okres sprawowania funkcji przez członka zarządu nie może być dłuższy niż pięć lat (kadencja).',
    difficulty: 'medium',
    tags: ['kadencja', 'zarząd', 'spółka akcyjna']
  },

  {
    id: 'ksh-085',
    article: 'Art. 381',
    articleTitle: 'Obowiązek ustanowienia rady nadzorczej w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'W spółce akcyjnej rada nadzorcza:',
    options: {
      a: 'Jest fakultatywna',
      b: 'Jest obligatoryjna',
      c: 'Jest wymagana tylko w spółkach publicznych',
      d: 'Jest wymagana tylko gdy kapitał przekracza 500 000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 381 k.s.h. w spółce akcyjnej ustanawia się radę nadzorczą. Rada nadzorcza jest organem obligatoryjnym w każdej spółce akcyjnej.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'obligatoryjność', 'spółka akcyjna']
  },

  {
    id: 'ksh-086',
    article: 'Art. 385 § 1',
    articleTitle: 'Skład rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza spółki akcyjnej składa się z co najmniej:',
    options: {
      a: 'Dwóch członków',
      b: 'Trzech członków',
      c: 'Pięciu członków',
      d: 'Siedmiu członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 385 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków. W spółkach publicznych – co najmniej z pięciu członków.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'skład minimalny', 'spółka akcyjna']
  },

  {
    id: 'ksh-087',
    article: 'Art. 393',
    articleTitle: 'Kompetencje walnego zgromadzenia',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały walnego zgromadzenia wymaga m.in.:',
    options: {
      a: 'Zatwierdzanie wszystkich umów zawieranych przez spółkę',
      b: 'Rozpatrzenie i zatwierdzenie sprawozdania finansowego oraz udzielenie absolutorium',
      c: 'Bieżące prowadzenie spraw spółki',
      d: 'Powołanie prokurenta'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 393 pkt 1 k.s.h. uchwały walnego zgromadzenia wymaga m.in. rozpatrzenie i zatwierdzenie sprawozdania zarządu z działalności spółki oraz sprawozdania finansowego za ubiegły rok obrotowy oraz udzielenie absolutorium członkom organów spółki z wykonania przez nich obowiązków.',
    difficulty: 'easy',
    tags: ['walne zgromadzenie', 'kompetencje', 'uchwały']
  },

  {
    id: 'ksh-088',
    article: 'Art. 414',
    articleTitle: 'Większość głosów na WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały walnego zgromadzenia spółki akcyjnej zapadają co do zasady:',
    options: {
      a: 'Zwykłą większością głosów',
      b: 'Bezwzględną większością głosów',
      c: 'Większością 2/3 głosów',
      d: 'Jednomyślnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 414 k.s.h. uchwały zapadają bezwzględną większością głosów, jeżeli przepisy niniejszego działu lub statut nie stanowią inaczej.',
    difficulty: 'easy',
    tags: ['walne zgromadzenie', 'większość głosów', 'uchwały']
  },

  {
    id: 'ksh-089',
    article: 'Art. 415 § 1',
    articleTitle: 'Zmiana statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała o zmianie statutu spółki akcyjnej zapada większością:',
    options: {
      a: 'Bezwzględną większością głosów',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślnie'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 415 § 1 k.s.h. uchwała dotycząca zmiany statutu zapada większością trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['zmiana statutu', 'większość kwalifikowana', 'spółka akcyjna']
  },

  {
    id: 'ksh-090',
    article: 'Art. 422 § 1',
    articleTitle: 'Powództwo o uchylenie uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała walnego zgromadzenia sprzeczna ze statutem bądź dobrymi obyczajami i godząca w interes spółki lub mająca na celu pokrzywdzenie akcjonariusza może być zaskarżona w drodze:',
    options: {
      a: 'Powództwa o stwierdzenie nieważności',
      b: 'Powództwa o uchylenie uchwały',
      c: 'Skargi do sądu rejestrowego',
      d: 'Odwołania do rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 422 § 1 k.s.h. uchwała walnego zgromadzenia sprzeczna ze statutem bądź dobrymi obyczajami i godząca w interes spółki lub mająca na celu pokrzywdzenie akcjonariusza może być zaskarżona w drodze wytoczonego przeciwko spółce powództwa o uchylenie uchwały.',
    difficulty: 'medium',
    tags: ['powództwo o uchylenie', 'uchwała', 'walne zgromadzenie']
  },

  // ============================================================
  // PROSTA SPÓŁKA AKCYJNA (Art. 300¹-300¹³⁴)
  // ============================================================

  {
    id: 'ksh-091',
    article: 'Art. 300¹ § 1',
    articleTitle: 'Prosta spółka akcyjna - istota',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Prosta spółka akcyjna może być utworzona przez:',
    options: {
      a: 'Minimum dwóch założycieli',
      b: 'Jedną albo więcej osób w każdym celu prawnie dopuszczalnym',
      c: 'Tylko osoby fizyczne',
      d: 'Minimum trzech założycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹ § 1 k.s.h. prosta spółka akcyjna może być utworzona przez jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej.',
    difficulty: 'easy',
    tags: ['prosta spółka akcyjna', 'PSA', 'utworzenie']
  },

  {
    id: 'ksh-092',
    article: 'Art. 300³ § 1',
    articleTitle: 'Minimalny kapitał akcyjny PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Minimalny kapitał akcyjny prostej spółki akcyjnej wynosi:',
    options: {
      a: '1 zł',
      b: '100 zł',
      c: '1 000 zł',
      d: '5 000 zł'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 300³ § 1 k.s.h. kapitał akcyjny powinien wynosić co najmniej 1 złoty. Jest to najniższy wymóg kapitałowy spośród wszystkich spółek kapitałowych.',
    difficulty: 'easy',
    tags: ['kapitał akcyjny', 'PSA', 'minimum']
  },

  {
    id: 'ksh-093',
    article: 'Art. 300²',
    articleTitle: 'Akcje bez wartości nominalnej w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje w prostej spółce akcyjnej:',
    options: {
      a: 'Mają wartość nominalną minimum 1 grosz',
      b: 'Są beznominałowe i nie stanowią części kapitału akcyjnego',
      c: 'Mają wartość nominalną minimum 1 złoty',
      d: 'Są zbywalne tylko za zgodą spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300² k.s.h. akcje nie mają wartości nominalnej, nie stanowią części kapitału akcyjnego oraz są niepodzielne. Jest to fundamentalna różnica w stosunku do tradycyjnej spółki akcyjnej.',
    difficulty: 'medium',
    tags: ['akcje beznominałowe', 'PSA', 'kapitał akcyjny']
  },

  {
    id: 'ksh-094',
    article: 'Art. 300⁹ § 1',
    articleTitle: 'Wkłady w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wkładem niepieniężnym w prostej spółce akcyjnej może być:',
    options: {
      a: 'Tylko mienie zbywalne',
      b: 'Wszelki wkład mający wartość majątkową, w tym świadczenie pracy lub usług',
      c: 'Tylko nieruchomości i ruchomości',
      d: 'Tylko wkłady pieniężne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁹ § 1 k.s.h. przedmiotem wkładu niepieniężnego może być wszelki wkład mający wartość majątkową, w szczególności świadczenie pracy lub usług. Jest to istotna różnica w stosunku do sp. z o.o. i S.A., gdzie świadczenie pracy nie może być wkładem.',
    difficulty: 'medium',
    tags: ['wkład', 'PSA', 'świadczenie pracy']
  },

  // ============================================================
  // ŁĄCZENIE, PODZIAŁ I PRZEKSZTAŁCANIE SPÓŁEK
  // ============================================================

  {
    id: 'ksh-095',
    article: 'Art. 491 § 1',
    articleTitle: 'Łączenie spółek - sposoby',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Łączenie się spółek może być dokonane przez:',
    options: {
      a: 'Tylko przejęcie (inkorporację)',
      b: 'Tylko zawiązanie nowej spółki',
      c: 'Przejęcie (inkorporację) lub zawiązanie nowej spółki (fuzję)',
      d: 'Tylko za zgodą sądu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 492 § 1 k.s.h. łączenie się spółek może być dokonane: 1) przez przeniesienie całego majątku spółki (przejmowanej) na inną spółkę (przejmującą) za udziały lub akcje, które spółka przejmująca przyznaje wspólnikom spółki przejmowanej (łączenie się przez przejęcie), 2) przez zawiązanie spółki kapitałowej, na którą przechodzi majątek wszystkich łączących się spółek za udziały lub akcje nowej spółki (łączenie się przez zawiązanie nowej spółki).',
    difficulty: 'medium',
    tags: ['łączenie spółek', 'przejęcie', 'fuzja']
  },

  {
    id: 'ksh-096',
    article: 'Art. 494 § 1',
    articleTitle: 'Sukcesja uniwersalna',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Spółka przejmująca albo spółka nowo zawiązana wstępuje z dniem połączenia:',
    options: {
      a: 'Tylko w wybrane prawa spółki przejmowanej',
      b: 'We wszystkie prawa i obowiązki spółki przejmowanej (sukcesja uniwersalna)',
      c: 'Tylko w prawa, nie w obowiązki',
      d: 'W prawa po zatwierdzeniu przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 494 § 1 k.s.h. spółka przejmująca albo spółka nowo zawiązana wstępuje z dniem połączenia we wszystkie prawa i obowiązki spółki przejmowanej albo spółek łączących się przez zawiązanie nowej spółki. Jest to tzw. sukcesja uniwersalna.',
    difficulty: 'medium',
    tags: ['sukcesja uniwersalna', 'łączenie spółek', 'prawa i obowiązki']
  },

  {
    id: 'ksh-097',
    article: 'Art. 528 § 1',
    articleTitle: 'Podział spółki - sposoby',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Który ze sposobów NIE jest sposobem podziału spółki kapitałowej?',
    options: {
      a: 'Podział przez przejęcie',
      b: 'Podział przez zawiązanie nowych spółek',
      c: 'Podział przez wydzielenie',
      d: 'Podział przez likwidację'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 529 § 1 k.s.h. podział może być dokonany przez: 1) przejęcie, 2) zawiązanie nowych spółek, 3) przejęcie i zawiązanie nowej spółki, 4) wydzielenie. "Podział przez likwidację" nie istnieje jako forma podziału.',
    difficulty: 'hard',
    tags: ['podział spółki', 'sposoby podziału', 'wydzielenie']
  },

  {
    id: 'ksh-098',
    article: 'Art. 551 § 1',
    articleTitle: 'Przekształcenie spółki',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Spółka jawna może być przekształcona w:',
    options: {
      a: 'Tylko inną spółkę osobową',
      b: 'Tylko spółkę kapitałową',
      c: 'Inną spółkę handlową (osobową lub kapitałową)',
      d: 'Tylko spółkę akcyjną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 551 § 1 k.s.h. spółka jawna, spółka partnerska, spółka komandytowa, spółka komandytowo-akcyjna, spółka z ograniczoną odpowiedzialnością, prosta spółka akcyjna oraz spółka akcyjna (spółka przekształcana) może być przekształcona w inną spółkę handlową (spółkę przekształconą).',
    difficulty: 'easy',
    tags: ['przekształcenie', 'spółka jawna', 'spółka handlowa']
  },

  {
    id: 'ksh-099',
    article: 'Art. 553 § 1',
    articleTitle: 'Skutki przekształcenia',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Spółce przekształconej przysługują wszystkie prawa i obowiązki spółki przekształcanej:',
    options: {
      a: 'Od dnia wpisu przekształcenia do rejestru',
      b: 'Od dnia podjęcia uchwały o przekształceniu',
      c: 'Od dnia sporządzenia planu przekształcenia',
      d: 'Od dnia wykreślenia spółki przekształcanej'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 553 § 1 k.s.h. spółce przekształconej przysługują wszystkie prawa i obowiązki spółki przekształcanej. Przekształcenie następuje z dniem wpisu spółki przekształconej do rejestru (dzień przekształcenia).',
    difficulty: 'medium',
    tags: ['przekształcenie', 'dzień przekształcenia', 'sukcesja']
  },

  {
    id: 'ksh-100',
    article: 'Art. 556',
    articleTitle: 'Plan przekształcenia',
    section: 'Tytuł IV - Łączenie, podział i przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Plan przekształcenia wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z datą pewną',
      c: 'Pisemnej pod rygorem nieważności',
      d: 'Aktu notarialnego w przypadku przekształcenia w spółkę akcyjną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 556 pkt 1 k.s.h. do przekształcenia spółki wymaga się sporządzenia planu przekształcenia spółki wraz z załącznikami. Plan przekształcenia powinien być sporządzony w formie pisemnej pod rygorem nieważności.',
    difficulty: 'medium',
    tags: ['plan przekształcenia', 'forma', 'przekształcenie']
  }
];

// ============================================================
// EXPORT FUNKCJI POMOCNICZYCH
// ============================================================

export const getQuestionsBySection = (section: string): ExamQuestion[] => {
  return KSH_EXAM_QUESTIONS.filter(q => q.section === section);
};

export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): ExamQuestion[] => {
  return KSH_EXAM_QUESTIONS.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByTag = (tag: string): ExamQuestion[] => {
  return KSH_EXAM_QUESTIONS.filter(q => q.tags.includes(tag));
};

export const getRandomQuestions = (count: number): ExamQuestion[] => {
  const shuffled = [...KSH_EXAM_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getQuestionsByArticle = (articlePrefix: string): ExamQuestion[] => {
  return KSH_EXAM_QUESTIONS.filter(q => q.article.startsWith(articlePrefix));
};

// Statystyki bazy
export const DATABASE_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS.filter(q => q.difficulty === 'hard').length,
  },
  sections: [...new Set(KSH_EXAM_QUESTIONS.map(q => q.section))],
  tags: [...new Set(KSH_EXAM_QUESTIONS.flatMap(q => q.tags))],
};

console.log('KSH Exam Questions Database loaded:', DATABASE_STATS);
