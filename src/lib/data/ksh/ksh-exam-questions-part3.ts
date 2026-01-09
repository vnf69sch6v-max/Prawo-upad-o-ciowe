// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 3 - Dodatkowe 100 pytań (zaawansowane)
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART3: ExamQuestion[] = [

  // ============================================================
  // TERMINY I PROCEDURY - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-201',
    article: 'Art. 169',
    articleTitle: 'Rozwiązanie spółki w organizacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli zawiązania spółki z o.o. nie zgłoszono do sądu rejestrowego w terminie sześciu miesięcy od dnia zawarcia umowy spółki albo jeżeli postanowienie sądu odmawiające zarejestrowania stało się prawomocne, umowa spółki:',
    options: {
      a: 'Pozostaje w mocy',
      b: 'Ulega rozwiązaniu',
      c: 'Wymaga ponownego zawarcia',
      d: 'Podlega konwalidacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 169 k.s.h. jeżeli zawiązania spółki nie zgłoszono do sądu rejestrowego w terminie sześciu miesięcy od dnia zawarcia umowy spółki albo jeżeli postanowienie sądu odmawiające zarejestrowania stało się prawomocne, umowa spółki ulega rozwiązaniu.',
    difficulty: 'medium',
    tags: ['termin', 'rozwiązanie', 'spółka w organizacji']
  },

  {
    id: 'ksh-202',
    article: 'Art. 172',
    articleTitle: 'Odpowiedzialność za zobowiązania spółki w organizacji po wpisie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Z chwilą wpisu do rejestru spółka z o.o. odpowiada za zobowiązania spółki w organizacji. Osoby, które działały w imieniu spółki po jej wpisie do rejestru:',
    options: {
      a: 'Nadal odpowiadają solidarnie ze spółką',
      b: 'Zostają zwolnione z odpowiedzialności wobec osób trzecich',
      c: 'Odpowiadają tylko wobec spółki',
      d: 'Odpowiadają przez kolejne 3 lata'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 13 § 1 w zw. z art. 12 k.s.h. z chwilą wpisu do rejestru spółka staje się podmiotem praw i obowiązków spółki w organizacji. Osoby, które działały w imieniu spółki w organizacji, zostają zwolnione z odpowiedzialności wobec osób trzecich za zobowiązania spółki.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'spółka w organizacji', 'wpis do rejestru']
  },

  {
    id: 'ksh-203',
    article: 'Art. 173 § 1',
    articleTitle: 'Oświadczenie jedynego wspólnika sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Oświadczenie woli jedynego wspólnika jednoosobowej sp. z o.o. składane spółce wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej pod rygorem nieważności',
      c: 'Aktu notarialnego',
      d: 'Dowolnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 173 § 1 k.s.h. w przypadku gdy wszystkie udziały spółki przysługują jedynemu wspólnikowi albo jedynemu wspólnikowi i spółce, oświadczenie woli takiego wspólnika składane spółce wymaga formy pisemnej pod rygorem nieważności, chyba że ustawa stanowi inaczej.',
    difficulty: 'medium',
    tags: ['spółka jednoosobowa', 'forma pisemna', 'oświadczenie woli']
  },

  {
    id: 'ksh-204',
    article: 'Art. 182 § 3',
    articleTitle: 'Zgoda na zbycie udziału - termin',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Jeżeli zbycie udziału jest uzależnione od zgody spółki, a zgody odmówiono, sąd rejestrowy może pozwolić na zbycie, jeżeli istnieją ważne powody. Termin na wystąpienie do sądu wynosi:',
    options: {
      a: '7 dni od dnia odmowy',
      b: '14 dni od dnia odmowy',
      c: 'Miesiąc od dnia zawiadomienia o odmowie',
      d: '3 miesiące od dnia odmowy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 182 § 3 k.s.h. jeżeli zarząd odmówi zgody na zbycie, wspólnik może w terminie miesiąca od dnia zawiadomienia o odmowie wystąpić do sądu rejestrowego o wyrażenie zgody na zbycie, jeżeli istnieją ważne powody.',
    difficulty: 'hard',
    tags: ['zbycie udziału', 'zgoda spółki', 'termin', 'sąd rejestrowy']
  },

  {
    id: 'ksh-205',
    article: 'Art. 186 § 1',
    articleTitle: 'Świadectwo udziałowe',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'W sp. z o.o. zarząd jest obowiązany wydać wspólnikowi na jego żądanie:',
    options: {
      a: 'Akcje imienne',
      b: 'Świadectwo udziałowe, które jest dokumentem na okaziciela',
      c: 'Imienne świadectwo udziałowe',
      d: 'Obligacje'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 186 § 1 k.s.h. na żądanie wspólnika zarząd jest obowiązany wydać mu imienne świadectwo udziałowe. Jest to dokument imienny potwierdzający posiadanie udziałów.',
    difficulty: 'medium',
    tags: ['świadectwo udziałowe', 'dokument', 'sp. z o.o.']
  },

  {
    id: 'ksh-206',
    article: 'Art. 189 § 1',
    articleTitle: 'Skuteczność zbycia wobec spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zbycie udziału staje się skuteczne wobec spółki z o.o. z chwilą:',
    options: {
      a: 'Zawarcia umowy zbycia',
      b: 'Zawiadomienia spółki o przejściu udziału',
      c: 'Wpisu do KRS',
      d: 'Uzyskania zgody zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 187 § 1 k.s.h. o przejściu udziału, jego części lub ułamkowej części udziału na inną osobę oraz o ustanowieniu zastawu lub użytkowania udziału zainteresowani zawiadamiają spółkę, przedstawiając dowód przejścia lub ustanowienia prawa. Przejście udziału jest skuteczne wobec spółki od chwili, gdy spółka otrzyma od jednego z zainteresowanych zawiadomienie.',
    difficulty: 'medium',
    tags: ['zbycie udziału', 'skuteczność', 'zawiadomienie']
  },

  {
    id: 'ksh-207',
    article: 'Art. 193',
    articleTitle: 'Dzień dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Uprawnionymi do dywidendy za dany rok obrotowy w sp. z o.o. są wspólnicy, którym udziały przysługiwały:',
    options: {
      a: 'W dniu 1 stycznia roku obrotowego',
      b: 'W dniu podjęcia uchwały o podziale zysku',
      c: 'W dniu dywidendy określonym uchwałą zgromadzenia wspólników',
      d: 'W ostatnim dniu roku obrotowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 193 § 1 k.s.h. uprawnionymi do dywidendy za dany rok obrotowy są wspólnicy, którym udziały przysługiwały w dniu powzięcia uchwały o podziale zysku. Umowa spółki może upoważniać zgromadzenie wspólników do określenia dnia, według którego ustala się listę wspólników uprawnionych do dywidendy (dzień dywidendy).',
    difficulty: 'medium',
    tags: ['dywidenda', 'dzień dywidendy', 'uprawnieni']
  },

  {
    id: 'ksh-208',
    article: 'Art. 193 § 3',
    articleTitle: 'Termin wypłaty dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Dywidendę w sp. z o.o. wypłaca się w dniu określonym w uchwale wspólników. Jeżeli uchwała nie określa dnia wypłaty, dywidenda jest wypłacana:',
    options: {
      a: 'W terminie 7 dni od dnia dywidendy',
      b: 'W terminie 14 dni od dnia dywidendy',
      c: 'Niezwłocznie po dniu dywidendy',
      d: 'W terminie miesiąca od dnia dywidendy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 193 § 4 k.s.h. dywidendę wypłaca się w dniu określonym w uchwale wspólników lub w uchwale zarządu. Jeżeli uchwała wspólników nie określa dnia wypłaty dywidendy, jej wypłata powinna nastąpić niezwłocznie po dniu dywidendy.',
    difficulty: 'hard',
    tags: ['dywidenda', 'termin wypłaty', 'sp. z o.o.']
  },

  {
    id: 'ksh-209',
    article: 'Art. 196',
    articleTitle: 'Oprocentowanie dopłat',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Dopłaty w sp. z o.o., jeżeli umowa spółki nie stanowi inaczej:',
    options: {
      a: 'Podlegają oprocentowaniu jak wkład oszczędnościowy',
      b: 'Nie są oprocentowane',
      c: 'Podlegają oprocentowaniu według stopy referencyjnej NBP',
      d: 'Podlegają oprocentowaniu ustawowemu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 178 § 2 k.s.h. jeżeli umowa spółki nie stanowi inaczej, do dopłat nie stosuje się przepisów o oprocentowaniu. Dopłaty nie są więc co do zasady oprocentowane.',
    difficulty: 'medium',
    tags: ['dopłaty', 'oprocentowanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-210',
    article: 'Art. 199 § 2',
    articleTitle: 'Umorzenie automatyczne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umorzenie udziału może nastąpić bez powzięcia uchwały zgromadzenia wspólników w przypadku:',
    options: {
      a: 'Każdego umorzenia dobrowolnego',
      b: 'Każdego umorzenia przymusowego',
      c: 'Gdy umowa spółki stanowi, że udział ulega umorzeniu w razie ziszczenia się określonego zdarzenia',
      d: 'Nigdy - zawsze wymagana jest uchwała'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 199 § 4 k.s.h. umowa spółki może stanowić, że udział ulega umorzeniu w razie ziszczenia się określonego zdarzenia bez powzięcia uchwały zgromadzenia wspólników. Jest to tzw. umorzenie automatyczne.',
    difficulty: 'hard',
    tags: ['umorzenie automatyczne', 'udziały', 'sp. z o.o.']
  },

  {
    id: 'ksh-211',
    article: 'Art. 202 § 1',
    articleTitle: 'Wygaśnięcie mandatu członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli umowa spółki z o.o. nie stanowi inaczej, mandat członka zarządu wygasa:',
    options: {
      a: 'Z upływem roku od powołania',
      b: 'Z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji',
      c: 'Z upływem kadencji określonej w umowie',
      d: 'Dopiero z chwilą odwołania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 1 k.s.h. jeżeli umowa spółki nie stanowi inaczej, mandat członka zarządu wygasa z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji członka zarządu.',
    difficulty: 'hard',
    tags: ['mandat', 'wygaśnięcie', 'członek zarządu']
  },

  {
    id: 'ksh-212',
    article: 'Art. 202 § 4',
    articleTitle: 'Kadencja członka zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku powołania członka zarządu sp. z o.o. na okres dłuższy niż rok, jego mandat wygasa:',
    options: {
      a: 'Z upływem kadencji',
      b: 'Z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za ostatni pełny rok obrotowy pełnienia funkcji',
      c: 'Z dniem odbycia pierwszego zgromadzenia po powołaniu',
      d: 'Po 5 latach bez względu na postanowienia umowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 2 k.s.h. w przypadku powołania członka zarządu na okres dłuższy niż rok, mandat członka zarządu wygasa z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za ostatni pełny rok obrotowy pełnienia funkcji członka zarządu, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['kadencja', 'mandat', 'członek zarządu']
  },

  {
    id: 'ksh-213',
    article: 'Art. 206 § 1',
    articleTitle: 'Dane na pismach spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Pisma i zamówienia handlowe sp. z o.o. składane w formie papierowej i elektronicznej powinny zawierać m.in.:',
    options: {
      a: 'Tylko firmę spółki',
      b: 'Firmę spółki, siedzibę i adres, NIP, oznaczenie sądu rejestrowego i numer KRS, wysokość kapitału zakładowego',
      c: 'Tylko NIP i REGON',
      d: 'Tylko nazwiska członków zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 206 § 1 k.s.h. pisma i zamówienia handlowe składane przez spółkę w formie papierowej i elektronicznej, a także informacje na stronach internetowych spółki, powinny zawierać: firmę spółki, jej siedzibę i adres, oznaczenie sądu rejestrowego i numer KRS, NIP, wysokość kapitału zakładowego oraz informację, czy kapitał został wpłacony.',
    difficulty: 'medium',
    tags: ['pisma spółki', 'dane obowiązkowe', 'sp. z o.o.']
  },

  {
    id: 'ksh-214',
    article: 'Art. 209',
    articleTitle: 'Sprzeczność interesów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku sprzeczności interesów spółki z o.o. z interesami członka zarządu, jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób, z którymi jest powiązany osobiście, członek zarządu powinien:',
    options: {
      a: 'Kontynuować udział w sprawie',
      b: 'Wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole',
      c: 'Zrezygnować z funkcji',
      d: 'Poinformować sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 209 k.s.h. w przypadku sprzeczności interesów spółki z interesami członka zarządu, jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób, z którymi jest powiązany osobiście, członek zarządu powinien wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole.',
    difficulty: 'medium',
    tags: ['sprzeczność interesów', 'konflikt interesów', 'członek zarządu']
  },

  {
    id: 'ksh-215',
    article: 'Art. 218 § 2',
    articleTitle: 'Prawo indywidualnej kontroli wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik sp. z o.o. ma prawo kontroli. Może w tym celu:',
    options: {
      a: 'Tylko przeglądać sprawozdania finansowe',
      b: 'Przeglądać księgi i dokumenty spółki, sporządzać bilans dla własnego użytku lub żądać wyjaśnień od zarządu',
      c: 'Tylko żądać wyjaśnień od rady nadzorczej',
      d: 'Wyłącznie uczestniczyć w zgromadzeniach wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 212 § 1 k.s.h. prawo kontroli służy każdemu wspólnikowi. W tym celu wspólnik lub wspólnik z upoważnioną przez siebie osobą może w każdym czasie przeglądać księgi i dokumenty spółki, sporządzać bilans dla swego użytku lub żądać wyjaśnień od zarządu.',
    difficulty: 'easy',
    tags: ['prawo kontroli', 'wspólnik', 'sp. z o.o.']
  },

  {
    id: 'ksh-216',
    article: 'Art. 220',
    articleTitle: 'Umowy z radą nadzorczą',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W umowie między sp. z o.o. a członkiem rady nadzorczej, spółkę reprezentuje:',
    options: {
      a: 'Zarząd',
      b: 'Pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Pozostali członkowie rady nadzorczej',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 1 w zw. z art. 220 k.s.h. w umowie między spółką a członkiem rady nadzorczej, jak również w sporze z nim, spółkę reprezentuje pełnomocnik powołany uchwałą zgromadzenia wspólników.',
    difficulty: 'hard',
    tags: ['umowa z członkiem RN', 'reprezentacja', 'pełnomocnik']
  },

  {
    id: 'ksh-217',
    article: 'Art. 222 § 1',
    articleTitle: 'Posiedzenia rady nadzorczej',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza sp. z o.o. podejmuje uchwały, jeżeli na posiedzeniu jest obecna:',
    options: {
      a: 'Większość jej członków',
      b: 'Co najmniej połowa jej członków, a wszyscy członkowie zostali zaproszeni',
      c: 'Co najmniej 1/3 członków',
      d: 'Pełny skład rady'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 222 § 1 k.s.h. rada nadzorcza podejmuje uchwały, jeżeli na posiedzeniu jest obecna co najmniej połowa jej członków, a wszyscy członkowie zostali zaproszeni. Umowa spółki może przewidywać surowsze wymagania.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'kworum', 'uchwały']
  },

  {
    id: 'ksh-218',
    article: 'Art. 232',
    articleTitle: 'Nadzwyczajne zgromadzenie wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Nadzwyczajne zgromadzenie wspólników sp. z o.o. zwołuje się w przypadkach określonych w k.s.h. lub umowie spółki, a także:',
    options: {
      a: 'Tylko raz w roku',
      b: 'Gdy organy lub osoby uprawnione do zwoływania zgromadzeń uznają to za wskazane',
      c: 'Tylko na żądanie wszystkich wspólników',
      d: 'Tylko gdy spółka ponosi stratę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 232 k.s.h. nadzwyczajne zgromadzenie wspólników zwołuje się w przypadkach określonych w niniejszym dziale lub umowie spółki, a także gdy organy lub osoby uprawnione do zwoływania zgromadzeń uznają to za wskazane.',
    difficulty: 'easy',
    tags: ['nadzwyczajne zgromadzenie', 'zwoływanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-219',
    article: 'Art. 233',
    articleTitle: 'Żądanie zwołania zgromadzenia przez wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik lub wspólnicy reprezentujący co najmniej 1/10 kapitału zakładowego sp. z o.o. mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników. Jeżeli zgromadzenie nie zostanie zwołane w terminie:',
    options: {
      a: '7 dni od dnia żądania',
      b: 'Dwóch tygodni od dnia żądania, sąd rejestrowy może upoważnić do zwołania zgromadzenia',
      c: 'Miesiąca od dnia żądania',
      d: 'Trzech miesięcy od dnia żądania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 236 § 1 k.s.h. wspólnik lub wspólnicy reprezentujący co najmniej 1/10 kapitału zakładowego mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników, jak również umieszczenia określonych spraw w porządku obrad najbliższego zgromadzenia. Jeżeli zgromadzenie nie zostanie zwołane w terminie dwóch tygodni od dnia przedstawienia żądania zarządowi, sąd rejestrowy może upoważnić do zwołania.',
    difficulty: 'hard',
    tags: ['żądanie zwołania', 'termin', 'wspólnik mniejszościowy']
  },

  {
    id: 'ksh-220',
    article: 'Art. 239 § 1',
    articleTitle: 'Porządek obrad',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sprawach nieobjętych porządkiem obrad zgromadzenie wspólników sp. z o.o.:',
    options: {
      a: 'Może podejmować uchwały bez ograniczeń',
      b: 'Nie może podejmować uchwał, chyba że cały kapitał zakładowy jest reprezentowany i nikt nie zgłosił sprzeciwu',
      c: 'Może podejmować uchwały za zgodą zarządu',
      d: 'Nigdy nie może podejmować uchwał'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 239 § 1 k.s.h. w sprawach nieobjętych porządkiem obrad nie można powziąć uchwały, chyba że cały kapitał zakładowy jest reprezentowany na zgromadzeniu, a nikt z obecnych nie zgłosił sprzeciwu dotyczącego powzięcia uchwały.',
    difficulty: 'medium',
    tags: ['porządek obrad', 'uchwały', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-221',
    article: 'Art. 243 § 3',
    articleTitle: 'Pełnomocnik na zgromadzeniu wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Pełnomocnikiem na zgromadzeniu wspólników sp. z o.o. NIE może być:',
    options: {
      a: 'Inny wspólnik',
      b: 'Członek zarządu i pracownik spółki',
      c: 'Radca prawny wspólnika',
      d: 'Małżonek wspólnika'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 243 § 3 k.s.h. członek zarządu i pracownik spółki nie mogą być pełnomocnikami na zgromadzeniu wspólników.',
    difficulty: 'easy',
    tags: ['pełnomocnik', 'zgromadzenie wspólników', 'zakaz']
  },

  {
    id: 'ksh-222',
    article: 'Art. 248 § 1',
    articleTitle: 'Protokół zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników sp. z o.o. powinny być:',
    options: {
      a: 'Wpisane do protokołu w formie dowolnej',
      b: 'Wpisane do protokołu sporządzonego przez notariusza',
      c: 'Umieszczone w księdze protokołów',
      d: 'Zgłoszone do sądu rejestrowego w ciągu 7 dni'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 248 § 1 k.s.h. uchwały zgromadzenia wspólników powinny być wpisane do księgi protokołów i podpisane przez obecnych lub co najmniej przez przewodniczącego i osobę sporządzającą protokół. Uchwały wymagające aktu notarialnego (np. zmiana umowy spółki) są protokołowane przez notariusza.',
    difficulty: 'easy',
    tags: ['protokół', 'księga protokołów', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-223',
    article: 'Art. 254 § 1',
    articleTitle: 'Zabezpieczenie powództwa',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sporze o uchylenie lub stwierdzenie nieważności uchwały wspólników sp. z o.o., sąd może na wniosek powoda:',
    options: {
      a: 'Tylko zawiesić postępowanie',
      b: 'Wydać postanowienie o wstrzymaniu wykonania zaskarżonej uchwały',
      c: 'Uchylić uchwałę natychmiast',
      d: 'Powołać kuratora dla spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 249 § 2 k.s.h. sąd może wstrzymać postępowanie rejestrowe po przeprowadzeniu posiedzenia jawnego. Zgodnie z przepisami o zabezpieczeniu, sąd może wydać postanowienie o wstrzymaniu wykonania uchwały.',
    difficulty: 'hard',
    tags: ['zabezpieczenie', 'powództwo', 'wstrzymanie wykonania']
  },

  {
    id: 'ksh-224',
    article: 'Art. 255 § 1',
    articleTitle: 'Zmiana umowy spółki - wymagania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Zmiana umowy spółki z o.o. wymaga:',
    options: {
      a: 'Tylko uchwały wspólników',
      b: 'Uchwały wspólników i wpisu do rejestru',
      c: 'Tylko wpisu do rejestru',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 255 § 1 k.s.h. zmiana umowy spółki wymaga uchwały wspólników i wpisu do rejestru. Uchwała musi być umieszczona w protokole sporządzonym przez notariusza.',
    difficulty: 'easy',
    tags: ['zmiana umowy', 'uchwała', 'wpis do rejestru']
  },

  {
    id: 'ksh-225',
    article: 'Art. 256 § 1',
    articleTitle: 'Zmiana przedmiotu działalności',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Uchwała o istotnej zmianie przedmiotu działalności sp. z o.o. wymaga:',
    options: {
      a: 'Zwykłej większości głosów',
      b: 'Bezwzględnej większości głosów',
      c: 'Większości trzech czwartych głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 246 § 1 w zw. z § 2 k.s.h. uchwały dotyczące zmiany umowy spółki zwiększającej świadczenia wspólników lub uszczuplającej prawa udziałowe bądź prawa przyznane osobiście poszczególnym wspólnikom, wymagają zgody wszystkich wspólników, których dotyczą. Uchwała dotycząca istotnej zmiany przedmiotu działalności spółki wymaga większości dwóch trzecich głosów, chyba że umowa stanowi surowsze wymagania.',
    difficulty: 'hard',
    tags: ['zmiana przedmiotu działalności', 'większość', 'sp. z o.o.']
  },

  // ============================================================
  // SPÓŁKA AKCYJNA - SZCZEGÓŁOWE PROCEDURY
  // ============================================================

  {
    id: 'ksh-226',
    article: 'Art. 303 § 1',
    articleTitle: 'Zawiązanie S.A. - moment',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka akcyjna zostaje zawiązana z chwilą:',
    options: {
      a: 'Podpisania statutu przez założycieli',
      b: 'Objęcia wszystkich akcji',
      c: 'Wniesienia wszystkich wkładów',
      d: 'Wpisu do rejestru'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 310 § 1 k.s.h. zawiązanie spółki akcyjnej następuje z chwilą objęcia wszystkich akcji.',
    difficulty: 'medium',
    tags: ['zawiązanie S.A.', 'objęcie akcji', 'moment']
  },

  {
    id: 'ksh-227',
    article: 'Art. 309 § 3',
    articleTitle: 'Termin wniesienia wkładów pieniężnych w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje obejmowane za wkłady pieniężne w S.A. powinny być opłacone przed zarejestrowaniem spółki co najmniej w:',
    options: {
      a: 'Całości',
      b: 'Jednej drugiej ich wartości nominalnej',
      c: 'Jednej czwartej ich wartości nominalnej',
      d: 'Nie ma takiego wymogu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. akcje obejmowane za wkłady pieniężne powinny być opłacone przed zarejestrowaniem spółki co najmniej w jednej czwartej ich wartości nominalnej.',
    difficulty: 'medium',
    tags: ['wkłady pieniężne', 'termin', 'S.A.']
  },

  {
    id: 'ksh-228',
    article: 'Art. 310 § 2',
    articleTitle: 'Akt zawiązania S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akt zawiązania spółki akcyjnej powinien zawierać m.in.:',
    options: {
      a: 'Tylko zgodę na zawiązanie spółki',
      b: 'Zgodę na zawiązanie spółki i brzmienie statutu, objęcie akcji, powołanie zarządu i rady nadzorczej',
      c: 'Tylko brzmienie statutu',
      d: 'Tylko listę akcjonariuszy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 313 § 1 k.s.h. akt zawiązania spółki powinien zawierać: zgodę na zawiązanie spółki akcyjnej i brzmienie statutu, objęcie akcji przez założycieli, a także powołanie pierwszych członków zarządu i pierwszych członków rady nadzorczej.',
    difficulty: 'medium',
    tags: ['akt zawiązania', 'statut', 'S.A.']
  },

  {
    id: 'ksh-229',
    article: 'Art. 316 § 1',
    articleTitle: 'Zgłoszenie S.A. do rejestru - termin',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zarząd zgłasza zawiązanie spółki akcyjnej do sądu rejestrowego w terminie:',
    options: {
      a: 'Trzech miesięcy od dnia zawiązania spółki',
      b: 'Sześciu miesięcy od dnia zawiązania spółki',
      c: 'Roku od dnia zawiązania spółki',
      d: 'Nie ma określonego terminu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 325 § 1 k.s.h. zarząd zgłasza zawiązanie spółki do sądu rejestrowego właściwego ze względu na siedzibę spółki w celu wpisania spółki do rejestru. Wniosek powinien być złożony nie później niż w terminie sześciu miesięcy od dnia zawiązania spółki.',
    difficulty: 'medium',
    tags: ['zgłoszenie do rejestru', 'termin', 'S.A.']
  },

  {
    id: 'ksh-230',
    article: 'Art. 329 § 1',
    articleTitle: 'Świadectwo tymczasowe',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Przed pełną wpłatą na akcje S.A. spółka wydaje:',
    options: {
      a: 'Akcje zwykłe',
      b: 'Świadectwa tymczasowe na okaziciela',
      c: 'Imienne świadectwa tymczasowe',
      d: 'Obligacje'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 335 § 1 k.s.h. przed pełnym opłaceniem akcji na dowód częściowej wpłaty spółka wydaje imienne świadectwa tymczasowe. Świadectwa tymczasowe podlegają zamianie na akcje po pełnej wpłacie.',
    difficulty: 'medium',
    tags: ['świadectwo tymczasowe', 'wpłata na akcje', 'S.A.']
  },

  {
    id: 'ksh-231',
    article: 'Art. 336 § 1',
    articleTitle: 'Rejestr akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje spółki niebędącej spółką publiczną podlegają zarejestrowaniu w:',
    options: {
      a: 'Krajowym Depozycie Papierów Wartościowych',
      b: 'Rejestrze akcjonariuszy prowadzonym przez podmiot uprawniony',
      c: 'Księdze akcyjnej prowadzonej przez zarząd',
      d: 'Sądzie rejestrowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 328¹ § 1 k.s.h. akcje spółki niebędącej spółką publiczną podlegają zarejestrowaniu w rejestrze akcjonariuszy. Rejestr akcjonariuszy jest prowadzony w postaci elektronicznej przez podmiot, który jest uprawniony do prowadzenia rachunków papierów wartościowych.',
    difficulty: 'medium',
    tags: ['rejestr akcjonariuszy', 'dematerializacja', 'S.A.']
  },

  {
    id: 'ksh-232',
    article: 'Art. 340 § 1',
    articleTitle: 'Prawo poboru akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcjonariusze S.A. mają prawo pierwszeństwa objęcia nowych akcji w stosunku do liczby posiadanych akcji (prawo poboru). Prawo to może być wyłączone:',
    options: {
      a: 'Uchwałą zarządu',
      b: 'Uchwałą walnego zgromadzenia, gdy wymaga tego interes spółki',
      c: 'Uchwałą rady nadzorczej',
      d: 'Nie może być wyłączone'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 433 § 2 k.s.h. prawo poboru może być wyłączone w całości lub w części w interesie spółki mocą uchwały walnego zgromadzenia podjętej większością co najmniej czterech piątych głosów.',
    difficulty: 'medium',
    tags: ['prawo poboru', 'wyłączenie', 'S.A.']
  },

  {
    id: 'ksh-233',
    article: 'Art. 342 § 1',
    articleTitle: 'Roszczenie o wyrównanie dywidendy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcjonariusze, którym nie wypłacono dywidendy uprzywilejowanej w pełnej wysokości, mają roszczenie o wyrównanie z zysku w:',
    options: {
      a: 'Następnym roku obrotowym',
      b: 'Ciągu dwóch kolejnych lat obrotowych',
      c: 'Ciągu trzech kolejnych lat obrotowych',
      d: 'Bez ograniczenia czasowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 353 § 4 k.s.h. statut może przyznać akcjom uprzywilejowanym co do dywidendy prawo do wyrównania z zysku w następnych latach, jednak nie później niż w ciągu kolejnych trzech lat obrotowych. W przypadku likwidacji prawo pierwszeństwa wymaga wyraźnego przyznania w statucie.',
    difficulty: 'hard',
    tags: ['dywidenda uprzywilejowana', 'wyrównanie', 'termin']
  },

  {
    id: 'ksh-234',
    article: 'Art. 348 § 2',
    articleTitle: 'Akcje własne - termin zbycia',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje własne nabyte przez S.A. w przypadkach dozwolonych przez ustawę powinny być zbyte w terminie:',
    options: {
      a: 'Sześciu miesięcy od dnia nabycia',
      b: 'Roku od dnia nabycia',
      c: 'Dwóch lat od dnia nabycia',
      d: 'Bez ograniczenia czasowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 363 § 4 k.s.h. akcje własne powinny być zbyte, jeżeli nie zostały nabyte w celu umorzenia, w ciągu roku od dnia nabycia. W przypadku niespełnienia tego wymogu zarząd dokona niezwłocznie ich umorzenia.',
    difficulty: 'hard',
    tags: ['akcje własne', 'termin zbycia', 'S.A.']
  },

  {
    id: 'ksh-235',
    article: 'Art. 369 § 4',
    articleTitle: 'Ponowne powołanie członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Ponowne powołanie tej samej osoby na członka zarządu S.A. jest możliwe:',
    options: {
      a: 'Najwcześniej po upływie roku od wygaśnięcia mandatu',
      b: 'Najwcześniej na rok przed upływem bieżącej kadencji',
      c: 'W dowolnym czasie bez ograniczeń',
      d: 'Tylko za zgodą walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 369 § 1 zd. 3 k.s.h. ponowne powołanie tej samej osoby jest możliwe na kadencje nie dłuższe niż pięć lat każda. Ponowne powołanie nie może nastąpić wcześniej niż na rok przed upływem bieżącej kadencji.',
    difficulty: 'hard',
    tags: ['ponowne powołanie', 'zarząd', 'kadencja', 'S.A.']
  },

  {
    id: 'ksh-236',
    article: 'Art. 371 § 1',
    articleTitle: 'Reprezentacja S.A. - zasada',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Jeżeli zarząd S.A. jest wieloosobowy i statut nie stanowi inaczej, do składania oświadczeń w imieniu spółki wymagane jest:',
    options: {
      a: 'Działanie jednego członka zarządu',
      b: 'Współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem',
      c: 'Działanie wszystkich członków zarządu',
      d: 'Działanie prezesa zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 373 § 1 k.s.h. jeżeli zarząd jest wieloosobowy, sposób reprezentowania spółki określa statut. Jeżeli statut nie zawiera żadnych postanowień w tym przedmiocie, do składania oświadczeń w imieniu spółki wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem.',
    difficulty: 'easy',
    tags: ['reprezentacja', 'zarząd', 'S.A.']
  },

  {
    id: 'ksh-237',
    article: 'Art. 374 § 1',
    articleTitle: 'Regulamin zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Regulamin zarządu S.A. określa organizację i sposób wykonywania czynności przez zarząd. Regulamin może uchwalić:',
    options: {
      a: 'Tylko walne zgromadzenie',
      b: 'Zarząd, chyba że statut stanowi inaczej',
      c: 'Tylko rada nadzorcza',
      d: 'Tylko założyciele'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 371 § 6 k.s.h. regulamin zarządu może uchwalić zarząd, chyba że statut wymaga, aby regulamin uchwalił organ określony w statucie.',
    difficulty: 'medium',
    tags: ['regulamin zarządu', 'uchwalenie', 'S.A.']
  },

  {
    id: 'ksh-238',
    article: 'Art. 377',
    articleTitle: 'Zawieszenie członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może zawieszać w czynnościach z ważnych powodów:',
    options: {
      a: 'Tylko prezesa zarządu',
      b: 'Poszczególnych lub wszystkich członków zarządu',
      c: 'Tylko członków zarządu powołanych przez radę nadzorczą',
      d: 'Nie ma takiego uprawnienia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 383 § 1 k.s.h. do kompetencji rady nadzorczej należy m.in. zawieszanie, z ważnych powodów, w czynnościach poszczególnych lub wszystkich członków zarządu oraz delegowanie członków rady nadzorczej do czasowego wykonywania czynności członków zarządu.',
    difficulty: 'medium',
    tags: ['zawieszenie zarządu', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-239',
    article: 'Art. 384 § 1',
    articleTitle: 'Wynagrodzenie członków rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członkom rady nadzorczej S.A. przysługuje wynagrodzenie określone:',
    options: {
      a: 'Wyłącznie w statucie',
      b: 'W statucie lub uchwałą walnego zgromadzenia',
      c: 'Przez zarząd',
      d: 'Przez sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 392 § 1 k.s.h. członkom rady nadzorczej może zostać przyznane wynagrodzenie. Wynagrodzenie określa statut lub uchwała walnego zgromadzenia.',
    difficulty: 'easy',
    tags: ['wynagrodzenie', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-240',
    article: 'Art. 388 § 1',
    articleTitle: 'Posiedzenia rady nadzorczej S.A. - częstotliwość',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. powinna być zwoływana w miarę potrzeb, nie rzadziej jednak niż:',
    options: {
      a: 'Raz w miesiącu',
      b: 'Raz na kwartał',
      c: 'Raz w każdym kwartale roku obrotowego',
      d: 'Raz w roku obrotowym'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 389 § 1 k.s.h. rada nadzorcza powinna być zwoływana w miarę potrzeb, nie rzadziej jednak niż raz w każdym kwartale roku obrotowego.',
    difficulty: 'easy',
    tags: ['posiedzenia rady', 'częstotliwość', 'S.A.']
  },

  {
    id: 'ksh-241',
    article: 'Art. 390 § 1',
    articleTitle: 'Kworum rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. podejmuje uchwały, jeżeli na posiedzeniu jest obecna:',
    options: {
      a: 'Większość członków',
      b: 'Co najmniej połowa jej członków, a wszyscy członkowie zostali zaproszeni',
      c: 'Co najmniej 1/3 członków',
      d: 'Pełny skład rady'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 388 § 1 k.s.h. rada nadzorcza podejmuje uchwały, jeżeli na posiedzeniu jest obecna co najmniej połowa jej członków, a wszyscy członkowie zostali zaproszeni.',
    difficulty: 'easy',
    tags: ['kworum', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-242',
    article: 'Art. 394 § 1',
    articleTitle: 'Zwyczajne walne zgromadzenie - przedmiot',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Przedmiotem obrad zwyczajnego walnego zgromadzenia S.A. powinno być m.in. podjęcie uchwały o podziale zysku albo pokryciu straty oraz:',
    options: {
      a: 'Wybór prezesa zarządu',
      b: 'Udzielenie członkom organów spółki absolutorium z wykonania przez nich obowiązków',
      c: 'Zmiana statutu',
      d: 'Podwyższenie kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 395 § 2 k.s.h. przedmiotem obrad zwyczajnego walnego zgromadzenia powinno być: rozpatrzenie i zatwierdzenie sprawozdania zarządu i sprawozdania finansowego, powzięcie uchwały o podziale zysku albo pokryciu straty, udzielenie członkom organów spółki absolutorium z wykonania przez nich obowiązków.',
    difficulty: 'easy',
    tags: ['zwyczajne walne zgromadzenie', 'absolutorium', 'przedmiot']
  },

  {
    id: 'ksh-243',
    article: 'Art. 398',
    articleTitle: 'Nadzwyczajne walne zgromadzenie - zwoływanie',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Nadzwyczajne walne zgromadzenie S.A. zwołuje:',
    options: {
      a: 'Tylko zarząd',
      b: 'Zarząd lub rada nadzorcza w określonych przypadkach',
      c: 'Tylko rada nadzorcza',
      d: 'Tylko akcjonariusze'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 399 § 2 i 3 k.s.h. walne zgromadzenie zwołuje zarząd. Rada nadzorcza może zwołać zwyczajne walne zgromadzenie, jeżeli zarząd nie zwołał go w terminie, oraz nadzwyczajne walne zgromadzenie, jeżeli zwołanie go uzna za wskazane.',
    difficulty: 'easy',
    tags: ['nadzwyczajne walne zgromadzenie', 'zwoływanie', 'S.A.']
  },

  {
    id: 'ksh-244',
    article: 'Art. 401 § 1',
    articleTitle: 'Umieszczenie spraw w porządku obrad WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz lub akcjonariusze reprezentujący co najmniej 1/20 kapitału zakładowego S.A. mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno zostać zgłoszone zarządowi nie później niż:',
    options: {
      a: '7 dni przed wyznaczonym terminem zgromadzenia',
      b: '14 dni przed wyznaczonym terminem zgromadzenia',
      c: '21 dni przed wyznaczonym terminem zgromadzenia',
      d: 'Miesiąc przed wyznaczonym terminem zgromadzenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 401 § 1 k.s.h. akcjonariusz lub akcjonariusze reprezentujący co najmniej 1/20 kapitału zakładowego mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno zostać zgłoszone zarządowi nie później niż na dwadzieścia jeden dni przed wyznaczonym terminem zgromadzenia.',
    difficulty: 'hard',
    tags: ['porządek obrad', 'termin', 'prawa akcjonariuszy']
  },

  {
    id: 'ksh-245',
    article: 'Art. 402 § 1',
    articleTitle: 'Ogłoszenie o WZ - termin',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie S.A. niebędącej spółką publiczną zwołuje się przez ogłoszenie dokonane co najmniej:',
    options: {
      a: 'Tydzień przed terminem zgromadzenia',
      b: 'Dwa tygodnie przed terminem zgromadzenia',
      c: 'Trzy tygodnie przed terminem zgromadzenia',
      d: 'Miesiąc przed terminem zgromadzenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 402 § 1 k.s.h. walne zgromadzenie zwołuje się przez ogłoszenie, które powinno być dokonane co najmniej na trzy tygodnie przed terminem walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['ogłoszenie WZ', 'termin', 'S.A.']
  },

  {
    id: 'ksh-246',
    article: 'Art. 407 § 1',
    articleTitle: 'Lista akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Lista akcjonariuszy uprawnionych do uczestnictwa w walnym zgromadzeniu S.A. powinna być wyłożona w lokalu zarządu przez:',
    options: {
      a: 'Tydzień przed walnym zgromadzeniem',
      b: 'Trzy dni robocze przed walnym zgromadzeniem',
      c: 'W dniu walnego zgromadzenia',
      d: 'Dwa tygodnie przed walnym zgromadzeniem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 407 § 1 k.s.h. lista akcjonariuszy uprawnionych do uczestnictwa w walnym zgromadzeniu, podpisana przez zarząd, powinna być wyłożona w lokalu zarządu przez trzy dni powszednie przed odbyciem walnego zgromadzenia.',
    difficulty: 'hard',
    tags: ['lista akcjonariuszy', 'termin', 'walne zgromadzenie']
  },

  {
    id: 'ksh-247',
    article: 'Art. 412 § 1',
    articleTitle: 'Prawo głosu na WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz S.A. może uczestniczyć w walnym zgromadzeniu oraz wykonywać prawo głosu:',
    options: {
      a: 'Tylko osobiście',
      b: 'Osobiście lub przez pełnomocnika',
      c: 'Tylko przez notariusza',
      d: 'Tylko przez członka zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 412 § 1 k.s.h. akcjonariusz może uczestniczyć w walnym zgromadzeniu oraz wykonywać prawo głosu osobiście lub przez pełnomocnika.',
    difficulty: 'easy',
    tags: ['prawo głosu', 'pełnomocnik', 'walne zgromadzenie']
  },

  {
    id: 'ksh-248',
    article: 'Art. 413 § 1',
    articleTitle: 'Pełnomocnictwo na WZ - forma',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Pełnomocnictwo do uczestniczenia w walnym zgromadzeniu S.A. i wykonywania prawa głosu wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej lub elektronicznej',
      c: 'Aktu notarialnego',
      d: 'Pisemnej z podpisem notarialnie poświadczonym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4121 § 1 k.s.h. pełnomocnictwo do uczestniczenia w walnym zgromadzeniu spółki publicznej i wykonywania prawa głosu wymaga udzielenia na piśmie lub w postaci elektronicznej. Dla spółek niepublicznych przepisy są analogiczne.',
    difficulty: 'easy',
    tags: ['pełnomocnictwo', 'forma', 'walne zgromadzenie']
  },

  {
    id: 'ksh-249',
    article: 'Art. 418',
    articleTitle: 'Przymusowy wykup akcji - większość',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie S.A. może powziąć uchwałę o przymusowym wykupie akcji akcjonariuszy reprezentujących mniej niż 5% kapitału zakładowego (squeeze out), jeżeli uchwałę popierają akcjonariusze reprezentujący:',
    options: {
      a: 'Co najmniej 75% kapitału zakładowego',
      b: 'Co najmniej 90% kapitału zakładowego',
      c: 'Co najmniej 95% kapitału zakładowego',
      d: 'Wszyscy akcjonariusze (100%)'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 418 § 1 k.s.h. walne zgromadzenie może powziąć uchwałę o przymusowym wykupie akcji akcjonariuszy reprezentujących nie więcej niż 5% kapitału zakładowego (akcjonariusze mniejszościowi) przez nie więcej niż pięciu akcjonariuszy, posiadających łącznie nie mniej niż 95% kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['przymusowy wykup', 'squeeze out', 'większość']
  },

  {
    id: 'ksh-250',
    article: 'Art. 423 § 1',
    articleTitle: 'Termin na powództwo o uchylenie uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Powództwo o uchylenie uchwały walnego zgromadzenia S.A. należy wnieść w terminie:',
    options: {
      a: '7 dni od dnia otrzymania wiadomości o uchwale',
      b: 'Miesiąca od dnia otrzymania wiadomości o uchwale, nie później niż w terminie 6 miesięcy od dnia powzięcia uchwały',
      c: '3 miesięcy od dnia powzięcia uchwały',
      d: 'Roku od dnia powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 424 § 1 k.s.h. powództwo o uchylenie uchwały walnego zgromadzenia należy wnieść w terminie miesiąca od dnia otrzymania wiadomości o uchwale, nie później jednak niż w terminie sześciu miesięcy od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['powództwo o uchylenie', 'termin', 'S.A.']
  },

  // ============================================================
  // FORMY CZYNNOŚCI PRAWNYCH W K.S.H.
  // ============================================================

  {
    id: 'ksh-251',
    article: 'Art. 106',
    articleTitle: 'Forma umowy spółki komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Umowa spółki komandytowej powinna być zawarta w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dowolnej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 106 k.s.h. umowa spółki komandytowej powinna być zawarta w formie aktu notarialnego. Jest to surowszy wymóg niż dla spółki jawnej (forma pisemna).',
    difficulty: 'easy',
    tags: ['forma umowy', 'akt notarialny', 'spółka komandytowa']
  },

  {
    id: 'ksh-252',
    article: 'Art. 131',
    articleTitle: 'Forma statutu spółki komandytowo-akcyjnej',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Przepisy ogólne',
    question: 'Statut spółki komandytowo-akcyjnej powinien być sporządzony w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentu urzędowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 131 k.s.h. statut spółki komandytowo-akcyjnej powinien być sporządzony w formie aktu notarialnego. Osoby podpisujące statut są założycielami spółki.',
    difficulty: 'easy',
    tags: ['forma statutu', 'akt notarialny', 'S.K.A.']
  },

  {
    id: 'ksh-253',
    article: 'Art. 181',
    articleTitle: 'Forma zastawu na udziale',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zastawienie udziału w sp. z o.o. powinno być dokonane w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dowolnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 180 § 1 k.s.h. zbycie udziału, jego części lub ułamkowej części udziału oraz jego zastawienie powinno być dokonane w formie pisemnej z podpisami notarialnie poświadczonymi.',
    difficulty: 'medium',
    tags: ['zastaw', 'forma', 'udział']
  },

  {
    id: 'ksh-254',
    article: 'Art. 255 § 3',
    articleTitle: 'Forma uchwały o zmianie umowy spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Uchwała o zmianie umowy spółki z o.o. powinna być umieszczona w protokole:',
    options: {
      a: 'Sporządzonym przez przewodniczącego zgromadzenia',
      b: 'Sporządzonym przez notariusza',
      c: 'Sporządzonym przez sekretarza spółki',
      d: 'W dowolnej formie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 255 § 3 k.s.h. uchwała o zmianie umowy spółki powinna być umieszczona w protokole sporządzonym przez notariusza.',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'protokół notarialny', 'sp. z o.o.']
  },

  // ============================================================
  // WIĘKSZOŚCI GŁOSÓW - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-255',
    article: 'Art. 246 § 3',
    articleTitle: 'Zgoda na uszczuplenie praw wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Uchwała o zmianie umowy sp. z o.o. uszczuplającej prawa udziałowe wspólnika wymaga:',
    options: {
      a: 'Zwykłej większości głosów',
      b: 'Większości 2/3 głosów',
      c: 'Większości 3/4 głosów',
      d: 'Zgody wszystkich wspólników, których dotyczy'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 246 § 3 k.s.h. uchwała dotycząca zmiany umowy spółki, zwiększająca świadczenia wspólników lub uszczuplająca prawa udziałowe bądź prawa przyznane osobiście poszczególnym wspólnikom, wymaga zgody wszystkich wspólników, których dotyczy.',
    difficulty: 'hard',
    tags: ['zmiana umowy', 'zgoda wspólników', 'uszczuplenie praw']
  },

  {
    id: 'ksh-256',
    article: 'Art. 416 § 2',
    articleTitle: 'Zmniejszenie kapitału S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała o obniżeniu kapitału zakładowego S.A. wymaga większości:',
    options: {
      a: 'Bezwzględnej większości głosów',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Uchwała o obniżeniu kapitału zakładowego wymaga zmiany statutu, więc zgodnie z art. 415 § 1 k.s.h. wymaga większości trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'większość', 'S.A.']
  },

  {
    id: 'ksh-257',
    article: 'Art. 433 § 2',
    articleTitle: 'Wyłączenie prawa poboru - większość',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Uchwała o wyłączeniu prawa poboru akcji w S.A. wymaga większości:',
    options: {
      a: 'Bezwzględnej większości głosów',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Czterech piątych głosów'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 433 § 2 k.s.h. pozbawienie akcjonariuszy prawa poboru akcji może nastąpić w przypadku, gdy zostało to zapowiedziane w porządku obrad walnego zgromadzenia. Uchwała wymaga większości co najmniej czterech piątych głosów.',
    difficulty: 'hard',
    tags: ['prawo poboru', 'wyłączenie', 'większość']
  },

  {
    id: 'ksh-258',
    article: 'Art. 506 § 4',
    articleTitle: 'Łączenie spółek - wymogi kworum',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Uchwała o połączeniu spółek kapitałowych zapada większością trzech czwartych głosów, reprezentujących co najmniej:',
    options: {
      a: 'Jedną czwartą kapitału zakładowego',
      b: 'Połowę kapitału zakładowego',
      c: 'Trzy czwarte kapitału zakładowego',
      d: 'Cały kapitał zakładowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 506 § 1 k.s.h. łączenie się spółek wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia każdej z łączących się spółek, powziętej większością trzech czwartych głosów, reprezentujących co najmniej połowę kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['łączenie spółek', 'kworum', 'większość']
  },

  // ============================================================
  // PROSTA SPÓŁKA AKCYJNA - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-259',
    article: 'Art. 300⁵ § 1',
    articleTitle: 'Forma umowy PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa prostej spółki akcyjnej powinna być zawarta w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentu elektronicznego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300⁵ § 1 k.s.h. umowa prostej spółki akcyjnej powinna być zawarta w formie aktu notarialnego (lub przy wykorzystaniu wzorca umowy w systemie S24).',
    difficulty: 'easy',
    tags: ['forma umowy', 'akt notarialny', 'PSA']
  },

  {
    id: 'ksh-260',
    article: 'Art. 300⁷',
    articleTitle: 'Elementy umowy PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa prostej spółki akcyjnej powinna określać m.in.:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę, siedzibę, przedmiot działalności, liczbę, serię i numery akcji, organy spółki',
      c: 'Tylko kapitał akcyjny',
      d: 'Tylko liczbę akcji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁷ k.s.h. umowa PSA powinna określać: firmę i siedzibę spółki, przedmiot działalności, liczbę, serię i numery akcji, związane z nimi uprawnienia, oznaczenie akcjonariuszy, cenę emisyjną akcji, organy spółki, liczbę członków zarządu/rady dyrektorów, czas trwania spółki (jeśli oznaczony).',
    difficulty: 'medium',
    tags: ['elementy umowy', 'PSA', 'essentialia negotii']
  },

  {
    id: 'ksh-261',
    article: 'Art. 300¹¹ § 1',
    articleTitle: 'PSA w organizacji',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Z chwilą zawarcia umowy prostej spółki akcyjnej powstaje:',
    options: {
      a: 'PSA z osobowością prawną',
      b: 'Prosta spółka akcyjna w organizacji',
      c: 'Spółka cywilna założycieli',
      d: 'Konsorcjum założycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹¹ § 1 k.s.h. z chwilą zawarcia umowy spółki powstaje prosta spółka akcyjna w organizacji.',
    difficulty: 'easy',
    tags: ['PSA w organizacji', 'powstanie', 'PSA']
  },

  {
    id: 'ksh-262',
    article: 'Art. 300²⁰ § 1',
    articleTitle: 'Wpis do rejestru akcjonariuszy PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa akcjonariuszy',
    question: 'Akcje PSA podlegają zarejestrowaniu w:',
    options: {
      a: 'Księdze akcyjnej prowadzonej przez zarząd',
      b: 'Rejestrze akcjonariuszy prowadzonym przez notariusza lub podmiot uprawniony do prowadzenia rachunków papierów wartościowych',
      c: 'Krajowym Depozycie Papierów Wartościowych',
      d: 'Sądzie rejestrowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300²⁰ § 1 k.s.h. akcje PSA podlegają zarejestrowaniu w rejestrze akcjonariuszy. Rejestr akcjonariuszy prowadzi notariusz lub podmiot, który jest uprawniony do prowadzenia rachunków papierów wartościowych.',
    difficulty: 'medium',
    tags: ['rejestr akcjonariuszy', 'PSA', 'dematerializacja']
  },

  {
    id: 'ksh-263',
    article: 'Art. 300²⁵ § 1',
    articleTitle: 'Zbycie akcji PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa akcjonariuszy',
    question: 'Zbycie lub obciążenie akcji PSA wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej',
      c: 'Dokumentowej pod rygorem nieważności',
      d: 'Aktu notarialnego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300²⁵ § 1 k.s.h. zbycie lub obciążenie akcji powinno być dokonane w formie dokumentowej pod rygorem nieważności. Forma dokumentowa to forma lżejsza niż pisemna.',
    difficulty: 'medium',
    tags: ['zbycie akcji', 'forma dokumentowa', 'PSA']
  },

  {
    id: 'ksh-264',
    article: 'Art. 300⁵⁴ § 1',
    articleTitle: 'Skład rady dyrektorów PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada dyrektorów w PSA składa się z:',
    options: {
      a: 'Co najmniej trzech dyrektorów',
      b: 'Jednego albo większej liczby dyrektorów',
      c: 'Co najmniej pięciu dyrektorów',
      d: 'Liczby dyrektorów określonej przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵⁴ § 1 k.s.h. rada dyrektorów składa się z jednego albo większej liczby dyrektorów.',
    difficulty: 'easy',
    tags: ['rada dyrektorów', 'skład', 'PSA']
  },

  {
    id: 'ksh-265',
    article: 'Art. 300⁵⁵',
    articleTitle: 'Dyrektorzy wykonawczy i niewykonawczy',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W PSA z radą dyrektorów umowa spółki może rozróżniać:',
    options: {
      a: 'Dyrektorów wykonawczych i niewykonawczych',
      b: 'Prezesa i wiceprezesów',
      c: 'Dyrektorów generalnych i operacyjnych',
      d: 'Nie można rozróżniać dyrektorów'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 300⁵⁵ k.s.h. umowa spółki może przewidywać, że w skład rady dyrektorów wchodzą dyrektorzy wykonawczy i dyrektorzy niewykonawczy. Dyrektor niewykonawczy sprawuje stały nadzór nad prowadzeniem spraw spółki.',
    difficulty: 'medium',
    tags: ['dyrektorzy', 'wykonawczy', 'niewykonawczy', 'PSA']
  },

  {
    id: 'ksh-266',
    article: 'Art. 300⁷¹ § 1',
    articleTitle: 'Walne zgromadzenie PSA - zwoływanie',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie PSA powinno być zwołane przez zawiadomienie akcjonariuszy co najmniej:',
    options: {
      a: 'Tydzień przed terminem',
      b: 'Dwa tygodnie przed terminem',
      c: 'Trzy tygodnie przed terminem',
      d: 'Miesiąc przed terminem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁷¹ § 1 k.s.h. walne zgromadzenie zwołuje się przez zawiadomienie akcjonariuszy o terminie walnego zgromadzenia co najmniej na dwa tygodnie przed terminem zgromadzenia.',
    difficulty: 'medium',
    tags: ['walne zgromadzenie', 'termin zawiadomienia', 'PSA']
  },

  // ============================================================
  // ODPOWIEDZIALNOŚĆ - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-267',
    article: 'Art. 291',
    articleTitle: 'Odpowiedzialność za nieprawdziwe dane',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Kto składając oświadczenie o wniesieniu wkładów do sp. z o.o., podał fałszywe dane, odpowiada:',
    options: {
      a: 'Tylko dyscyplinarnie',
      b: 'Wobec wierzycieli spółki solidarnie ze spółką przez 3 lata od zarejestrowania spółki',
      c: 'Tylko wobec spółki',
      d: 'Tylko karnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 291 k.s.h. jeżeli członkowie zarządu umyślnie lub przez niedbalstwo podali fałszywe dane w oświadczeniu o wniesieniu wkładów, odpowiadają wobec wierzycieli spółki solidarnie ze spółką przez trzy lata od dnia zarejestrowania spółki lub zarejestrowania podwyższenia kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'fałszywe dane', 'sp. z o.o.']
  },

  {
    id: 'ksh-268',
    article: 'Art. 292',
    articleTitle: 'Odpowiedzialność za wadliwą wycenę aportu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Kto przy tworzeniu sp. z o.o. wbrew przepisom prawa z winy swojej wyrządził spółce szkodę, odpowiada wobec spółki za szkodę. Roszczenie przedawnia się z upływem:',
    options: {
      a: 'Roku od dnia powstania szkody',
      b: 'Trzech lat od dnia zarejestrowania spółki',
      c: 'Pięciu lat od dnia powstania szkody',
      d: 'Dziesięciu lat od dnia wyrządzenia szkody'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 292 k.s.h. kto biorąc udział w tworzeniu spółki, wbrew przepisom prawa z winy swojej wyrządził spółce szkodę, obowiązany jest do jej naprawienia. Roszczenie o naprawienie szkody przedawnia się z upływem trzech lat od dnia zarejestrowania spółki.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'przedawnienie', 'tworzenie spółki']
  },

  {
    id: 'ksh-269',
    article: 'Art. 293 § 1',
    articleTitle: 'Odpowiedzialność członka zarządu wobec spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Członek zarządu sp. z o.o., który przy wykonywaniu swoich obowiązków wyrządził spółce szkodę, odpowiada wobec spółki za szkodę wyrządzoną:',
    options: {
      a: 'Tylko umyślnie',
      b: 'Działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy spółki, chyba że nie ponosi winy',
      c: 'Tylko rażącym niedbalstwem',
      d: 'Na zasadzie ryzyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 1 k.s.h. członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator odpowiada wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy spółki, chyba że nie ponosi winy.',
    difficulty: 'medium',
    tags: ['odpowiedzialność członka zarządu', 'szkoda', 'sp. z o.o.']
  },

  {
    id: 'ksh-270',
    article: 'Art. 295 § 1',
    articleTitle: 'Actio pro socio',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Jeżeli spółka z o.o. nie wytoczy powództwa o naprawienie wyrządzonej jej szkody w terminie roku od dnia ujawnienia czynu wyrządzającego szkodę, każdy wspólnik:',
    options: {
      a: 'Traci prawo do dochodzenia roszczeń',
      b: 'Może wnieść pozew o naprawienie szkody wyrządzonej spółce',
      c: 'Może żądać rozwiązania spółki',
      d: 'Może wystąpić tylko do prokuratury'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 295 § 1 k.s.h. jeżeli spółka nie wytoczy powództwa o naprawienie wyrządzonej jej szkody w terminie roku od dnia ujawnienia czynu wyrządzającego szkodę, każdy wspólnik lub osoba określona w umowie może wnieść pozew o naprawienie szkody wyrządzonej spółce (actio pro socio).',
    difficulty: 'hard',
    tags: ['actio pro socio', 'powództwo', 'wspólnik']
  },

  {
    id: 'ksh-271',
    article: 'Art. 483 § 1',
    articleTitle: 'Odpowiedzialność członka zarządu S.A. wobec spółki',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja spółki',
    question: 'Członek zarządu S.A. odpowiada wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub statutem, chyba że:',
    options: {
      a: 'Został powołany przez radę nadzorczą',
      b: 'Nie ponosi winy',
      c: 'Działał za zgodą walnego zgromadzenia',
      d: 'Szkoda jest mniejsza niż 100 000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 483 § 1 k.s.h. członek zarządu, rady nadzorczej oraz likwidator odpowiada wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami statutu spółki, chyba że nie ponosi winy.',
    difficulty: 'easy',
    tags: ['odpowiedzialność', 'członek zarządu', 'S.A.']
  },

  {
    id: 'ksh-272',
    article: 'Art. 484',
    articleTitle: 'Solidarność odpowiedzialności',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja spółki',
    question: 'Jeżeli szkodę w S.A. wyrządziło kilku członków zarządu wspólnie, ich odpowiedzialność jest:',
    options: {
      a: 'Podzielna proporcjonalnie',
      b: 'Solidarna',
      c: 'Subsidiarna',
      d: 'Ograniczona do ich wynagrodzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 485 k.s.h. jeżeli szkodę wyrządziło kilka osób wspólnie, odpowiadają za szkodę solidarnie.',
    difficulty: 'easy',
    tags: ['odpowiedzialność solidarna', 'zarząd', 'S.A.']
  },

  // ============================================================
  // LIKWIDACJA - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-273',
    article: 'Art. 279',
    articleTitle: 'Otwarcie likwidacji sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Otwarcie likwidacji sp. z o.o. następuje z dniem:',
    options: {
      a: 'Powołania likwidatorów',
      b: 'Uprawomocnienia się orzeczenia o rozwiązaniu spółki, powzięcia uchwały o rozwiązaniu lub zaistnienia innej przyczyny rozwiązania',
      c: 'Wpisu likwidacji do rejestru',
      d: 'Ogłoszenia o likwidacji w MSiG'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 274 § 1 k.s.h. otwarcie likwidacji następuje z dniem uprawomocnienia się orzeczenia o rozwiązaniu spółki przez sąd, powzięcia przez wspólników uchwały o rozwiązaniu spółki lub zaistnienia innej przyczyny jej rozwiązania.',
    difficulty: 'medium',
    tags: ['otwarcie likwidacji', 'dzień', 'sp. z o.o.']
  },

  {
    id: 'ksh-274',
    article: 'Art. 280',
    articleTitle: 'Zgłoszenie likwidacji do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Do sądu rejestrowego należy zgłosić otwarcie likwidacji sp. z o.o. i dane likwidatorów w terminie:',
    options: {
      a: '7 dni od dnia otwarcia likwidacji',
      b: '14 dni od dnia otwarcia likwidacji',
      c: 'Miesiąca od dnia otwarcia likwidacji',
      d: 'Nie ma określonego terminu'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 277 § 1 k.s.h. do sądu rejestrowego należy zgłosić: otwarcie likwidacji, nazwiska i imiona likwidatorów oraz ich adresy, sposób reprezentowania spółki przez likwidatorów i wszelkie zmiany w tym zakresie. Zgłoszenie powinno nastąpić w terminie 7 dni.',
    difficulty: 'hard',
    tags: ['zgłoszenie likwidacji', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-275',
    article: 'Art. 283',
    articleTitle: 'Ogłoszenie o likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorzy sp. z o.o. powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie:',
    options: {
      a: 'Jednego miesiąca od daty ogłoszenia',
      b: 'Trzech miesięcy od daty ogłoszenia',
      c: 'Sześciu miesięcy od daty ogłoszenia',
      d: 'Roku od daty ogłoszenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 279 k.s.h. likwidatorzy powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie trzech miesięcy od dnia tego ogłoszenia.',
    difficulty: 'medium',
    tags: ['ogłoszenie o likwidacji', 'wierzyciele', 'termin']
  },

  {
    id: 'ksh-276',
    article: 'Art. 288 § 1',
    articleTitle: 'Bilans likwidacyjny',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Po zatwierdzeniu przez zgromadzenie wspólników sprawozdania finansowego na dzień poprzedzający podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli (sprawozdanie likwidacyjne) i po zakończeniu likwidacji, likwidatorzy:',
    options: {
      a: 'Kończą działalność bez dodatkowych czynności',
      b: 'Ogłaszają je w siedzibie spółki i składają sądowi rejestrowemu z jednoczesnym zgłoszeniem wniosku o wykreślenie spółki z rejestru',
      c: 'Przekazują je wspólnikom',
      d: 'Składają tylko do urzędu skarbowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 288 § 1 k.s.h. po zatwierdzeniu przez zgromadzenie wspólników sprawozdania likwidacyjnego i po zakończeniu likwidacji, likwidatorzy powinni ogłosić w siedzibie spółki to sprawozdanie i złożyć je sądowi rejestrowemu, z jednoczesnym zgłoszeniem wniosku o wykreślenie spółki z rejestru.',
    difficulty: 'medium',
    tags: ['sprawozdanie likwidacyjne', 'wykreślenie z rejestru', 'likwidacja']
  },

  // ============================================================
  // SPÓŁKA KOMANDYTOWO-AKCYJNA - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-277',
    article: 'Art. 132 § 1',
    articleTitle: 'Elementy statutu S.K.A.',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Przepisy ogólne',
    question: 'Statut spółki komandytowo-akcyjnej powinien zawierać m.in.:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę, siedzibę, przedmiot działalności, czas trwania (jeśli oznaczony), oznaczenie wkładów komplementariuszy, wysokość kapitału zakładowego, wartość nominalną akcji i ich liczbę',
      c: 'Tylko kapitał zakładowy',
      d: 'Tylko listę komplementariuszy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 130 k.s.h. statut S.K.A. powinien zawierać: firmę i siedzibę spółki, przedmiot działalności, czas trwania spółki (jeśli oznaczony), oznaczenie wkładów wnoszonych przez każdego komplementariusza oraz ich wartość, wysokość kapitału zakładowego, sposób jego zebrania, wartość nominalną akcji i ich liczbę ze wskazaniem, czy są imienne czy na okaziciela, liczbę akcji poszczególnych rodzajów i związane z nimi uprawnienia, nazwiska/firmy komplementariuszy oraz ich siedziby/adresy, organizację walnego zgromadzenia i rady nadzorczej (jeśli statut ją przewiduje).',
    difficulty: 'hard',
    tags: ['statut S.K.A.', 'elementy', 'spółka komandytowo-akcyjna']
  },

  {
    id: 'ksh-278',
    article: 'Art. 137 § 1',
    articleTitle: 'Prowadzenie spraw S.K.A.',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Prowadzenie spraw i reprezentacja',
    question: 'W spółce komandytowo-akcyjnej prawo prowadzenia spraw spółki przysługuje:',
    options: {
      a: 'Akcjonariuszom',
      b: 'Komplementariuszom',
      c: 'Radzie nadzorczej',
      d: 'Zarządowi'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 137 § 1 k.s.h. każdy komplementariusz ma prawo i obowiązek prowadzenia spraw spółki. Statut może przewidywać, że prowadzenie spraw spółki powierza się jednemu albo kilku komplementariuszom.',
    difficulty: 'medium',
    tags: ['prowadzenie spraw', 'komplementariusz', 'S.K.A.']
  },

  {
    id: 'ksh-279',
    article: 'Art. 141 § 1',
    articleTitle: 'Rada nadzorcza w S.K.A.',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Organy spółki',
    question: 'W spółce komandytowo-akcyjnej ustanowienie rady nadzorczej jest obowiązkowe, jeżeli liczba akcjonariuszy przekracza:',
    options: {
      a: '10',
      b: '15',
      c: '25',
      d: '50'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 142 § 1 k.s.h. w spółce komandytowo-akcyjnej można ustanowić radę nadzorczą. Jeżeli liczba akcjonariuszy przekracza dwadzieścia pięć osób, ustanowienie rady nadzorczej jest obowiązkowe.',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'obligatoryjność', 'S.K.A.']
  },

  {
    id: 'ksh-280',
    article: 'Art. 143 § 1',
    articleTitle: 'Członkowie rady nadzorczej S.K.A.',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Organy spółki',
    question: 'Członkiem rady nadzorczej spółki komandytowo-akcyjnej:',
    options: {
      a: 'Może być komplementariusz',
      b: 'Nie może być komplementariusz ani jego pracownik',
      c: 'Może być tylko akcjonariusz',
      d: 'Musi być biegły rewident'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 143 § 1 k.s.h. członkiem rady nadzorczej nie może być komplementariusz ani jego pracownik.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'zakaz', 'komplementariusz', 'S.K.A.']
  },

  // ============================================================
  // PRZEPISY INTERTEMPORALNE I KOŃCOWE
  // ============================================================

  {
    id: 'ksh-281',
    article: 'Art. 612',
    articleTitle: 'Stosowanie przepisów nowej ustawy',
    section: 'Tytuł VI - Przepisy przejściowe i końcowe',
    subsection: 'Dział II - Przepisy przejściowe',
    question: 'Do stosunków prawnych w zakresie spółek handlowych istniejących w dniu wejścia w życie k.s.h. stosuje się:',
    options: {
      a: 'Wyłącznie przepisy dotychczasowe',
      b: 'Przepisy k.s.h., chyba że przepisy przejściowe stanowią inaczej',
      c: 'Przepisy wybrane przez wspólników',
      d: 'Przepisy określone przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 612 k.s.h. do stosunków prawnych w zakresie spółek handlowych istniejących w dniu wejścia w życie ustawy stosuje się jej przepisy, chyba że przepisy poniższe stanowią inaczej.',
    difficulty: 'medium',
    tags: ['przepisy przejściowe', 'stosowanie', 'intertemporalne']
  },

  {
    id: 'ksh-282',
    article: 'Art. 628',
    articleTitle: 'Wątpliwości intertemporalne',
    section: 'Tytuł VI - Przepisy przejściowe i końcowe',
    subsection: 'Dział II - Przepisy przejściowe',
    question: 'W razie wątpliwości, czy mają być stosowane przepisy dotychczasowe, czy przepisy k.s.h., należy stosować:',
    options: {
      a: 'Przepisy dotychczasowe',
      b: 'Przepisy korzystniejsze dla wspólników',
      c: 'Przepisy k.s.h.',
      d: 'Przepisy określone przez sąd'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 628 k.s.h. w razie wątpliwości, czy mają być stosowane przepisy dotychczasowe, czy przepisy ustawy, należy stosować przepisy ustawy (k.s.h.).',
    difficulty: 'medium',
    tags: ['wątpliwości', 'intertemporalne', 'stosowanie przepisów']
  },

  // ============================================================
  // DODATKOWE PYTANIA EGZAMINACYJNE
  // ============================================================

  {
    id: 'ksh-283',
    article: 'Art. 4 § 1 pkt 5¹',
    articleTitle: 'Grupa spółek - definicja',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Grupa spółek w rozumieniu k.s.h. to:',
    options: {
      a: 'Każde powiązanie między spółkami',
      b: 'Spółka dominująca i spółki zależne będące spółkami kapitałowymi, kierujące się wspólną strategią w celu realizacji wspólnego interesu',
      c: 'Spółki powiązane kapitałowo w 10%',
      d: 'Każdy holding'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 5¹ k.s.h. grupa spółek to spółka dominująca i spółka albo spółki zależne, będące spółkami kapitałowymi, kierujące się zgodnie z uchwałą o uczestnictwie w grupie spółek wspólną strategią w celu realizacji wspólnego interesu (interes grupy spółek).',
    difficulty: 'medium',
    tags: ['grupa spółek', 'definicja', 'holding']
  },

  {
    id: 'ksh-284',
    article: 'Art. 30 § 1',
    articleTitle: 'Pozbawienie prawa reprezentacji w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Prawo wspólnika spółki jawnej do reprezentowania spółki może być mu odebrane:',
    options: {
      a: 'Tylko przez sąd z ważnych powodów',
      b: 'Uchwałą pozostałych wspólników',
      c: 'Prawomocnym orzeczeniem sądu wydanym na wniosek pozostałych wspólników, z ważnych powodów',
      d: 'Przez zmianę umowy spółki zwykłą większością głosów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 30 § 1 k.s.h. prawo wspólnika do reprezentowania spółki może być odebrane tylko z ważnych powodów, na mocy prawomocnego orzeczenia sądu, na wniosek pozostałych wspólników.',
    difficulty: 'medium',
    tags: ['reprezentacja', 'odebranie prawa', 'spółka jawna']
  },

  {
    id: 'ksh-285',
    article: 'Art. 43',
    articleTitle: 'Czynności przekraczające zwykły zarząd w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'W sprawach przekraczających zakres zwykłych czynności spółki jawnej wymagana jest:',
    options: {
      a: 'Zgoda większości wspólników',
      b: 'Zgoda wszystkich wspólników mających prawo prowadzenia spraw spółki',
      c: 'Zgoda sądu',
      d: 'Decyzja wspólnika zarządzającego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 43 k.s.h. w sprawach przekraczających zakres zwykłych czynności spółki wymagana jest zgoda wszystkich wspólników, w tym także wspólników wyłączonych od prowadzenia spraw spółki.',
    difficulty: 'medium',
    tags: ['czynności przekraczające zwykły zarząd', 'zgoda', 'spółka jawna']
  },

  {
    id: 'ksh-286',
    article: 'Art. 63 § 1',
    articleTitle: 'Rozwiązanie spółki jawnej przez sąd',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Każdy wspólnik spółki jawnej może z ważnych powodów żądać rozwiązania spółki przez sąd. Prawo to może być:',
    options: {
      a: 'Wyłączone postanowieniami umowy spółki',
      b: 'Ograniczone postanowieniami umowy spółki',
      c: 'Wyłączone ani ograniczone postanowieniami umowy spółki nie może być',
      d: 'Przeniesione na osobę trzecią'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 63 § 2 k.s.h. prawo to nie może być wyłączone ani ograniczone postanowieniami umowy spółki. Jest to bezwzględnie obowiązujące uprawnienie każdego wspólnika.',
    difficulty: 'hard',
    tags: ['rozwiązanie przez sąd', 'ius cogens', 'spółka jawna']
  },

  {
    id: 'ksh-287',
    article: 'Art. 65 § 1',
    articleTitle: 'Wypłata udziału po wystąpieniu wspólnika',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'W przypadku wystąpienia wspólnika ze spółki jawnej wartość udziału kapitałowego wypłaca się występującemu wspólnikowi:',
    options: {
      a: 'Natychmiast',
      b: 'W ciągu 7 dni',
      c: 'W pieniądzu',
      d: 'W naturze, według wyboru spółki'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 65 § 1 k.s.h. w przypadku wystąpienia wspólnika ze spółki wartość udziału kapitałowego wspólnika albo jego spadkobiercy oznacza się na podstawie osobnego bilansu, uwzględniającego wartość zbywczą majątku spółki. Jako wartość udziału kapitałowego wspólnika wypłaca się mu w pieniądzu odpowiednią część zbywczej wartości majątku.',
    difficulty: 'medium',
    tags: ['wystąpienie wspólnika', 'wypłata udziału', 'spółka jawna']
  },

  {
    id: 'ksh-288',
    article: 'Art. 109 § 1',
    articleTitle: 'Umowne zwiększenie odpowiedzialności komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Postanowienia umowy spółki komandytowej zwiększające odpowiedzialność komandytariusza ponad sumę komandytową:',
    options: {
      a: 'Są ważne i skuteczne wobec osób trzecich',
      b: 'Nie mają skutku prawnego wobec osób trzecich',
      c: 'Są nieważne',
      d: 'Wymagają zgody sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 109 k.s.h. postanowienia umowy niekorzystne dla wierzycieli spółki, w szczególności zwiększające odpowiedzialność komandytariusza, nie mają skutku prawnego wobec osób trzecich.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'komandytariusz', 'skutek wobec osób trzecich']
  },

  {
    id: 'ksh-289',
    article: 'Art. 119',
    articleTitle: 'Udział komandytariusza w zyskach',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Komandytariusz uczestniczy w zysku spółki komandytowej:',
    options: {
      a: 'Proporcjonalnie do wkładu rzeczywiście wniesionego',
      b: 'Proporcjonalnie do sumy komandytowej',
      c: 'W równych częściach z komplementariuszami',
      d: 'Tylko gdy suma komandytowa została wpłacona'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 123 § 1 k.s.h. komandytariusz uczestniczy w zysku spółki proporcjonalnie do jego wkładu rzeczywiście wniesionego do spółki, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['udział w zyskach', 'komandytariusz', 'spółka komandytowa']
  },

  {
    id: 'ksh-290',
    article: 'Art. 166 § 1',
    articleTitle: 'Elementy zgłoszenia sp. z o.o. do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zgłoszenie spółki z o.o. do sądu rejestrowego powinno zawierać m.in.:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę, siedzibę, adres, przedmiot działalności, wysokość kapitału zakładowego, dane o wkładach, dane członków zarządu i sposób reprezentacji',
      c: 'Tylko dane członków zarządu',
      d: 'Tylko wysokość kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 166 § 1 k.s.h. zgłoszenie spółki do sądu rejestrowego powinno zawierać: firmę, siedzibę i adres spółki, przedmiot działalności spółki, wysokość kapitału zakładowego, określenie czy wspólnik może mieć więcej niż jeden udział, nazwiska, imiona i adresy członków zarządu oraz sposób reprezentowania spółki, nazwiska i imiona członków rady nadzorczej lub komisji rewizyjnej (jeśli ustawa lub umowa spółki wymaga ich powołania), dane o wkładach niepieniężnych, czas trwania spółki (jeśli oznaczony).',
    difficulty: 'medium',
    tags: ['zgłoszenie do rejestru', 'elementy', 'sp. z o.o.']
  },

  // ============================================================
  // PYTANIA PRZEKROJOWE - PORÓWNAWCZE
  // ============================================================

  {
    id: 'ksh-291',
    article: 'Różne artykuły',
    articleTitle: 'Porównanie minimalnych kapitałów',
    section: 'Porównanie spółek',
    subsection: 'Kapitał zakładowy',
    question: 'Uporządkuj spółki kapitałowe według minimalnego kapitału zakładowego/akcyjnego (od najniższego):',
    options: {
      a: 'PSA (1 zł), sp. z o.o. (5.000 zł), S.K.A. (50.000 zł), S.A. (100.000 zł)',
      b: 'Sp. z o.o. (5.000 zł), PSA (1 zł), S.A. (100.000 zł), S.K.A. (50.000 zł)',
      c: 'PSA (1 zł), S.K.A. (50.000 zł), sp. z o.o. (5.000 zł), S.A. (100.000 zł)',
      d: 'Sp. z o.o. (5.000 zł), S.K.A. (50.000 zł), S.A. (100.000 zł), PSA (1 zł)'
    },
    correct: 'a',
    explanation: 'Minimalne kapitały wynoszą: PSA - 1 zł (art. 300³ § 1), sp. z o.o. - 5.000 zł (art. 154 § 1), S.K.A. - 50.000 zł (art. 126 § 2), S.A. - 100.000 zł (art. 308 § 1).',
    difficulty: 'medium',
    tags: ['kapitał zakładowy', 'porównanie', 'spółki kapitałowe']
  },

  {
    id: 'ksh-292',
    article: 'Różne artykuły',
    articleTitle: 'Porównanie form umów/statutów',
    section: 'Porównanie spółek',
    subsection: 'Forma umowy',
    question: 'Która spółka handlowa wymaga dla swojej umowy/statutu formy aktu notarialnego?',
    options: {
      a: 'Tylko spółka jawna',
      b: 'Sp. z o.o., S.A., S.K.A., spółka komandytowa (nie spółka jawna i partnerska)',
      c: 'Wszystkie spółki handlowe',
      d: 'Żadna spółka handlowa'
    },
    correct: 'b',
    explanation: 'Akt notarialny wymagany jest dla: umowy sp. z o.o. (art. 157 § 2), statutu S.A. (art. 301 § 2), statutu S.K.A. (art. 131), umowy spółki komandytowej (art. 106), umowy PSA (art. 300⁵ § 1). Spółka jawna (art. 23) i partnerska (art. 92) wymagają tylko formy pisemnej.',
    difficulty: 'hard',
    tags: ['forma umowy', 'akt notarialny', 'porównanie']
  },

  {
    id: 'ksh-293',
    article: 'Różne artykuły',
    articleTitle: 'Porównanie odpowiedzialności wspólników',
    section: 'Porównanie spółek',
    subsection: 'Odpowiedzialność',
    question: 'W której spółce osobowej odpowiedzialność wspólnika może być ograniczona do określonej kwoty?',
    options: {
      a: 'W spółce jawnej',
      b: 'W spółce partnerskiej',
      c: 'W spółce komandytowej (komandytariusz - do sumy komandytowej)',
      d: 'W żadnej spółce osobowej'
    },
    correct: 'c',
    explanation: 'W spółce komandytowej odpowiedzialność komandytariusza jest ograniczona do wysokości sumy komandytowej (art. 111 k.s.h.). Komplementariusz odpowiada bez ograniczeń. W spółce jawnej wszyscy wspólnicy odpowiadają bez ograniczeń.',
    difficulty: 'easy',
    tags: ['odpowiedzialność', 'suma komandytowa', 'porównanie']
  },

  {
    id: 'ksh-294',
    article: 'Różne artykuły',
    articleTitle: 'Termin zwołania zgromadzenia wspólników/WZ',
    section: 'Porównanie spółek',
    subsection: 'Terminy',
    question: 'Zgromadzenie wspólników sp. z o.o. zwołuje się co najmniej 2 tygodnie przed terminem, a walne zgromadzenie S.A.:',
    options: {
      a: 'Co najmniej 1 tydzień przed terminem',
      b: 'Co najmniej 2 tygodnie przed terminem',
      c: 'Co najmniej 3 tygodnie przed terminem',
      d: 'Co najmniej 4 tygodnie przed terminem'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 238 § 1 k.s.h. zgromadzenie wspólników sp. z o.o. zwołuje się co najmniej dwa tygodnie przed terminem. Zgodnie z art. 402 § 1 k.s.h. walne zgromadzenie S.A. zwołuje się co najmniej trzy tygodnie przed terminem.',
    difficulty: 'medium',
    tags: ['termin zawiadomienia', 'porównanie', 'zgromadzenie']
  },

  {
    id: 'ksh-295',
    article: 'Różne artykuły',
    articleTitle: 'Rada nadzorcza - obligatoryjność',
    section: 'Porównanie spółek',
    subsection: 'Organy',
    question: 'W której spółce kapitałowej rada nadzorcza jest zawsze obligatoryjna?',
    options: {
      a: 'W sp. z o.o.',
      b: 'W S.A.',
      c: 'W PSA',
      d: 'We wszystkich spółkach kapitałowych'
    },
    correct: 'b',
    explanation: 'Rada nadzorcza jest obligatoryjna w każdej S.A. (art. 381 k.s.h.). W sp. z o.o. jest obligatoryjna tylko gdy kapitał > 500.000 zł i > 25 wspólników (art. 213 § 2). W PSA można wybrać model z radą nadzorczą lub radą dyrektorów.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'obligatoryjność', 'porównanie']
  },

  {
    id: 'ksh-296',
    article: 'Art. 4 § 1 pkt 9',
    articleTitle: 'Definicja głosów',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Przez "głosy" w rozumieniu k.s.h. należy rozumieć:',
    options: {
      a: 'Tylko głosy "za"',
      b: 'Głosy "za", "przeciw" lub "wstrzymujące się" oddane podczas głosowania zgodnie z ustawą, umową albo statutem',
      c: 'Wszystkie możliwe głosy',
      d: 'Tylko głosy ważne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 9 k.s.h. głosy to głosy "za", "przeciw" lub "wstrzymujące się" oddane podczas głosowania w sposób zgodny z ustawą, umową albo statutem spółki.',
    difficulty: 'medium',
    tags: ['głosy', 'definicja', 'głosowanie']
  },

  {
    id: 'ksh-297',
    article: 'Art. 3',
    articleTitle: 'Definicja umowy spółki handlowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Przez umowę spółki handlowej wspólnicy albo akcjonariusze zobowiązują się:',
    options: {
      a: 'Tylko do wniesienia wkładów',
      b: 'Dążyć do osiągnięcia wspólnego celu przez wniesienie wkładów oraz współdziałanie w inny sposób (jeśli umowa/statut tak stanowi)',
      c: 'Tylko do współdziałania',
      d: 'Do prowadzenia działalności gospodarczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 3 k.s.h. przez umowę spółki handlowej wspólnicy albo akcjonariusze zobowiązują się dążyć do osiągnięcia wspólnego celu przez wniesienie wkładów oraz, jeżeli umowa albo statut spółki tak stanowi, przez współdziałanie w inny określony sposób.',
    difficulty: 'easy',
    tags: ['umowa spółki', 'definicja', 'cel']
  },

  {
    id: 'ksh-298',
    article: 'Art. 19',
    articleTitle: 'Podpis wszystkich członków zarządu',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Złożenie podpisów przez wszystkich członków zarządu pod dokumentem wystawionym przez spółkę kapitałową jest wymagane:',
    options: {
      a: 'Zawsze',
      b: 'Tylko w przypadku, gdy ustawa tak stanowi',
      c: 'Na żądanie kontrahenta',
      d: 'Nigdy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 19 k.s.h. złożenie podpisów przez wszystkich członków zarządu pod dokumentem wystawionym przez spółkę jest wymagane tylko w przypadku, gdy ustawa tak stanowi.',
    difficulty: 'medium',
    tags: ['podpisy zarządu', 'dokumenty', 'wymogi']
  },

  {
    id: 'ksh-299',
    article: 'Art. 13 § 2',
    articleTitle: 'Odpowiedzialność wspólnika spółki w organizacji',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wspólnik spółki kapitałowej w organizacji odpowiada za zobowiązania spółki solidarnie z osobami działającymi w imieniu spółki:',
    options: {
      a: 'Bez ograniczeń',
      b: 'Do wartości niewniesionego wkładu na pokrycie objętych udziałów lub akcji',
      c: 'Do wysokości kapitału zakładowego',
      d: 'Nie odpowiada za zobowiązania spółki w organizacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 13 § 2 k.s.h. wspólnik albo akcjonariusz spółki kapitałowej w organizacji odpowiada solidarnie z podmiotami działającymi w imieniu spółki za jej zobowiązania do wartości niewniesionego wkładu na pokrycie objętych udziałów lub akcji.',
    difficulty: 'hard',
    tags: ['odpowiedzialność wspólnika', 'spółka w organizacji', 'wkład']
  },

  {
    id: 'ksh-300',
    article: 'Art. 633',
    articleTitle: 'Wejście w życie k.s.h.',
    section: 'Tytuł VI - Przepisy przejściowe i końcowe',
    subsection: 'Dział III - Przepisy końcowe',
    question: 'Kodeks spółek handlowych wszedł w życie z dniem:',
    options: {
      a: '1 stycznia 2000 r.',
      b: '1 stycznia 2001 r.',
      c: '1 lipca 2001 r.',
      d: '1 stycznia 2002 r.'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 633 k.s.h. ustawa (Kodeks spółek handlowych) weszła w życie z dniem 1 stycznia 2001 r.',
    difficulty: 'easy',
    tags: ['wejście w życie', 'data', 'k.s.h.']
  }
];

// ============================================================
// POŁĄCZONA BAZA WSZYSTKICH PYTAŃ
// ============================================================

import { KSH_EXAM_QUESTIONS } from './ksh-exam-questions';
import { KSH_EXAM_QUESTIONS_PART2 } from './ksh-exam-questions-part2';

export const ALL_KSH_QUESTIONS_COMPLETE = [
  ...KSH_EXAM_QUESTIONS,
  ...KSH_EXAM_QUESTIONS_PART2,
  ...KSH_EXAM_QUESTIONS_PART3
];

export const COMPLETE_DATABASE_STATS = {
  totalQuestions: ALL_KSH_QUESTIONS_COMPLETE.length,
  byDifficulty: {
    easy: ALL_KSH_QUESTIONS_COMPLETE.filter(q => q.difficulty === 'easy').length,
    medium: ALL_KSH_QUESTIONS_COMPLETE.filter(q => q.difficulty === 'medium').length,
    hard: ALL_KSH_QUESTIONS_COMPLETE.filter(q => q.difficulty === 'hard').length,
  },
  sections: [...new Set(ALL_KSH_QUESTIONS_COMPLETE.map(q => q.section))],
  uniqueTags: [...new Set(ALL_KSH_QUESTIONS_COMPLETE.flatMap(q => q.tags))].length,
  articlesCovered: [...new Set(ALL_KSH_QUESTIONS_COMPLETE.map(q => q.article))].length,
};

// Funkcja do generowania egzaminu próbnego
export const generateMockExam = (
  questionCount: number = 100,
  difficultyDistribution?: { easy: number; medium: number; hard: number }
): ExamQuestion[] => {
  const distribution = difficultyDistribution || { easy: 30, medium: 50, hard: 20 };
  
  const easyQuestions = ALL_KSH_QUESTIONS_COMPLETE
    .filter(q => q.difficulty === 'easy')
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(questionCount * distribution.easy / 100));
  
  const mediumQuestions = ALL_KSH_QUESTIONS_COMPLETE
    .filter(q => q.difficulty === 'medium')
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(questionCount * distribution.medium / 100));
  
  const hardQuestions = ALL_KSH_QUESTIONS_COMPLETE
    .filter(q => q.difficulty === 'hard')
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(questionCount * distribution.hard / 100));
  
  return [...easyQuestions, ...mediumQuestions, ...hardQuestions]
    .sort(() => Math.random() - 0.5);
};

console.log('Complete KSH Questions Database loaded:', COMPLETE_DATABASE_STATS);
