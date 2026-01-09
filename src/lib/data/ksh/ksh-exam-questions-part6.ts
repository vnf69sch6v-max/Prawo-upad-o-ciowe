// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 6 - 150 pytań skupionych na SP. Z O.O. i S.A.
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART6: ExamQuestion[] = [

  // ============================================================
  // SP. Z O.O. - POWSTANIE SPÓŁKI (art. 151-175)
  // ============================================================

  {
    id: 'ksh-501',
    article: 'Art. 151 § 1',
    articleTitle: 'Definicja sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka z ograniczoną odpowiedzialnością może być utworzona przez:',
    options: {
      a: 'Co najmniej dwóch wspólników',
      b: 'Jedną albo więcej osób w każdym celu prawnie dopuszczalnym',
      c: 'Tylko osoby fizyczne',
      d: 'Tylko osoby prawne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 151 § 1 k.s.h. spółka z ograniczoną odpowiedzialnością może być utworzona przez jedną albo więcej osób w każdym celu prawnie dopuszczalnym, chyba że ustawa stanowi inaczej.',
    difficulty: 'easy',
    tags: ['definicja', 'utworzenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-502',
    article: 'Art. 151 § 2',
    articleTitle: 'Zakaz tworzenia przez jednoosobową sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka z o.o. NIE może być zawiązana wyłącznie przez:',
    options: {
      a: 'Osobę fizyczną',
      b: 'Spółkę akcyjną',
      c: 'Inną jednoosobową spółkę z o.o.',
      d: 'Spółkę jawną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 151 § 2 k.s.h. spółka z ograniczoną odpowiedzialnością nie może być zawiązana wyłącznie przez inną jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['zakaz', 'jednoosobowa', 'sp. z o.o.']
  },

  {
    id: 'ksh-503',
    article: 'Art. 151 § 4',
    articleTitle: 'Odpowiedzialność wspólników sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wspólnicy sp. z o.o. za zobowiązania spółki:',
    options: {
      a: 'Odpowiadają bez ograniczeń',
      b: 'Odpowiadają subsydiarnie',
      c: 'Nie odpowiadają',
      d: 'Odpowiadają do wysokości wniesionych wkładów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 151 § 4 k.s.h. wspólnicy nie odpowiadają za zobowiązania spółki.',
    difficulty: 'easy',
    tags: ['odpowiedzialność', 'wspólnicy', 'sp. z o.o.']
  },

  {
    id: 'ksh-504',
    article: 'Art. 154 § 1',
    articleTitle: 'Minimalna wysokość kapitału zakładowego',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał zakładowy sp. z o.o. powinien wynosić co najmniej:',
    options: {
      a: '1.000 zł',
      b: '5.000 zł',
      c: '10.000 zł',
      d: '50.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 154 § 1 k.s.h. kapitał zakładowy spółki powinien wynosić co najmniej 5.000 złotych.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'minimum', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-505',
    article: 'Art. 154 § 2',
    articleTitle: 'Minimalna wartość udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wartość nominalna udziału w sp. z o.o. nie może być niższa niż:',
    options: {
      a: '1 zł',
      b: '10 zł',
      c: '50 zł',
      d: '100 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 154 § 2 k.s.h. wartość nominalna udziału nie może być niższa niż 50 złotych.',
    difficulty: 'easy',
    tags: ['wartość nominalna', 'udział', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-506',
    article: 'Art. 157 § 2',
    articleTitle: 'Forma umowy sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa spółki z o.o. powinna być zawarta w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 157 § 2 k.s.h. umowa spółki z ograniczoną odpowiedzialnością powinna być zawarta w formie aktu notarialnego.',
    difficulty: 'easy',
    tags: ['forma umowy', 'akt notarialny', 'sp. z o.o.']
  },

  {
    id: 'ksh-507',
    article: 'Art. 161 § 1',
    articleTitle: 'Powstanie sp. z o.o. w organizacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka z o.o. w organizacji powstaje z chwilą:',
    options: {
      a: 'Wpisu do rejestru',
      b: 'Zawarcia umowy spółki',
      c: 'Wniesienia wkładów',
      d: 'Powołania zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 161 § 1 k.s.h. z chwilą zawarcia umowy spółki powstaje spółka z ograniczoną odpowiedzialnością w organizacji.',
    difficulty: 'easy',
    tags: ['spółka w organizacji', 'powstanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-508',
    article: 'Art. 164 § 1',
    articleTitle: 'Termin zgłoszenia sp. z o.o. do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wniosek o wpis sp. z o.o. do rejestru powinien być złożony nie później niż:',
    options: {
      a: 'W terminie 1 miesiąca od dnia zawarcia umowy spółki',
      b: 'W terminie 3 miesięcy od dnia zawarcia umowy spółki',
      c: 'W terminie 6 miesięcy od dnia zawarcia umowy spółki',
      d: 'W terminie 1 roku od dnia zawarcia umowy spółki'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 164 § 1 k.s.h. wniosek o wpis spółki do rejestru powinien być złożony nie później niż w terminie sześciu miesięcy od dnia zawarcia umowy spółki.',
    difficulty: 'medium',
    tags: ['termin zgłoszenia', '6 miesięcy', 'sp. z o.o.']
  },

  {
    id: 'ksh-509',
    article: 'Art. 174 § 3',
    articleTitle: 'Maksymalne uprzywilejowanie co do głosu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Na jeden uprzywilejowany udział w sp. z o.o. co do prawa głosu może przypadać maksymalnie:',
    options: {
      a: '2 głosy',
      b: '3 głosy',
      c: '5 głosów',
      d: '10 głosów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 174 § 3 k.s.h. uprzywilejowanie dotyczące prawa głosu nie może przyznawać uprawnionemu więcej niż trzy głosy na jeden udział.',
    difficulty: 'medium',
    tags: ['uprzywilejowanie', 'głosy', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-510',
    article: 'Art. 175 § 1',
    articleTitle: 'Odpowiedzialność za wadliwy aport',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wartość wkładów niepieniężnych została znacznie zawyżona, wspólnik wnoszący taki wkład oraz członkowie zarządu wiedząc o tym:',
    options: {
      a: 'Nie ponoszą odpowiedzialności',
      b: 'Odpowiadają solidarnie za wyrównanie spółce brakującej wartości',
      c: 'Odpowiada tylko wspólnik',
      d: 'Odpowiada tylko zarząd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 175 § 1 k.s.h. wspólnik wnoszący zawyżony wkład oraz członkowie zarządu, którzy wiedząc o tym zgłosili spółkę do rejestru, obowiązani są solidarnie wyrównać spółce brakującą wartość.',
    difficulty: 'hard',
    tags: ['zawyżenie aportu', 'odpowiedzialność solidarna', 'sp. z o.o.']
  },

  {
    id: 'ksh-511',
    article: 'Art. 180 § 1',
    articleTitle: 'Forma zbycia udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zbycie udziału w sp. z o.o. wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 180 § 1 k.s.h. zbycie udziału powinno być dokonane w formie pisemnej z podpisami notarialnie poświadczonymi.',
    difficulty: 'medium',
    tags: ['zbycie udziału', 'forma', 'sp. z o.o.']
  },

  {
    id: 'ksh-512',
    article: 'Art. 182 § 1',
    articleTitle: 'Ograniczenie zbywalności udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zbycie udziału w sp. z o.o. umowa spółki może:',
    options: {
      a: 'Zakazać całkowicie',
      b: 'Uzależnić od zgody spółki albo w inny sposób ograniczyć',
      c: 'Wyłącznie ułatwić',
      d: 'Nie może w żaden sposób regulować'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 182 § 1 k.s.h. zbycie udziału umowa spółki może uzależnić od zgody spółki albo w inny sposób ograniczyć.',
    difficulty: 'easy',
    tags: ['ograniczenie zbywalności', 'zgoda spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-513',
    article: 'Art. 191 § 1',
    articleTitle: 'Prawo do dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wspólnik sp. z o.o. ma prawo do udziału w zysku:',
    options: {
      a: 'Automatycznie z mocy ustawy',
      b: 'Przeznaczonym do podziału uchwałą zgromadzenia wspólników',
      c: 'Przydzielonym przez zarząd',
      d: 'Zatwierdzonym przez radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 191 § 1 k.s.h. wspólnik ma prawo do udziału w zysku wynikającym z rocznego sprawozdania finansowego i przeznaczonym do podziału uchwałą zgromadzenia wspólników.',
    difficulty: 'easy',
    tags: ['dywidenda', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-514',
    article: 'Art. 199 § 1',
    articleTitle: 'Przesłanki umorzenia udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Udział w sp. z o.o. może być umorzony:',
    options: {
      a: 'Zawsze bez ograniczeń',
      b: 'Jedynie po wpisie spółki do rejestru i tylko gdy umowa spółki tak stanowi',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko w przypadku likwidacji spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 199 § 1 k.s.h. udział może być umorzony jedynie po wpisie spółki do rejestru i tylko w przypadku, gdy umowa spółki tak stanowi.',
    difficulty: 'medium',
    tags: ['umorzenie udziału', 'przesłanki', 'sp. z o.o.']
  },

  {
    id: 'ksh-515',
    article: 'Art. 201 § 4',
    articleTitle: 'Powoływanie zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. jest powoływany i odwoływany:',
    options: {
      a: 'Przez radę nadzorczą',
      b: 'Uchwałą wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Przez sąd rejestrowy',
      d: 'Przez założycieli spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 201 § 4 k.s.h. członek zarządu jest powoływany i odwoływany uchwałą wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['powoływanie zarządu', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-516',
    article: 'Art. 205 § 1',
    articleTitle: 'Reprezentacja łączna sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli zarząd sp. z o.o. jest wieloosobowy, a umowa spółki nie zawiera postanowień o reprezentacji:',
    options: {
      a: 'Każdy członek zarządu reprezentuje spółkę samodzielnie',
      b: 'Wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem',
      c: 'Wymagane jest współdziałanie wszystkich członków zarządu',
      d: 'Spółkę reprezentuje tylko prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 205 § 1 k.s.h. jeżeli umowa spółki nie zawiera postanowień o reprezentacji, do składania oświadczeń wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem.',
    difficulty: 'easy',
    tags: ['reprezentacja łączna', 'zarząd wieloosobowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-517',
    article: 'Art. 210 § 1',
    articleTitle: 'Umowa między spółką a członkiem zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W umowie między sp. z o.o. a członkiem zarządu spółkę reprezentuje:',
    options: {
      a: 'Pozostali członkowie zarządu',
      b: 'Rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Prokurent',
      d: 'Sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 1 k.s.h. w umowie między spółką a członkiem zarządu spółkę reprezentuje rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników.',
    difficulty: 'medium',
    tags: ['umowa z zarządem', 'reprezentacja', 'sp. z o.o.']
  },

  {
    id: 'ksh-518',
    article: 'Art. 210 § 2',
    articleTitle: 'Czynność jedynego wspólnika będącego jedynym członkiem zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Czynność prawna między sp. z o.o. a jedynym wspólnikiem będącym jedynym członkiem zarządu wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z datą pewną',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 210 § 2 k.s.h. czynność prawna między spółką a jedynym wspólnikiem będącym jedynym członkiem zarządu wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['spółka jednoosobowa', 'forma aktu notarialnego', 'sp. z o.o.']
  },

  {
    id: 'ksh-519',
    article: 'Art. 211 § 1',
    articleTitle: 'Zakaz konkurencji członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. bez zgody spółki nie może zajmować się interesami konkurencyjnymi. Zgody udziela:',
    options: {
      a: 'Prezes zarządu',
      b: 'Organ uprawniony do powołania zarządu, chyba że umowa stanowi inaczej',
      c: 'Sąd rejestrowy',
      d: 'Komisja rewizyjna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 211 § 2 k.s.h. zgody udziela organ uprawniony do powołania zarządu, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zakaz konkurencji', 'zgoda', 'sp. z o.o.']
  },

  {
    id: 'ksh-520',
    article: 'Art. 213 § 2',
    articleTitle: 'Obligatoryjność rady nadzorczej w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sp. z o.o. rada nadzorcza lub komisja rewizyjna jest OBLIGATORYJNA, gdy:',
    options: {
      a: 'Kapitał zakładowy przekracza 100.000 zł',
      b: 'Kapitał zakładowy przewyższa 500.000 zł i wspólników jest więcej niż 25',
      c: 'Wspólników jest więcej niż 10',
      d: 'Spółka zatrudnia więcej niż 50 pracowników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 213 § 2 k.s.h. gdy kapitał zakładowy przewyższa 500.000 zł, a wspólników jest więcej niż 25, powinna być ustanowiona rada nadzorcza lub komisja rewizyjna.',
    difficulty: 'hard',
    tags: ['obligatoryjność', 'rada nadzorcza', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-521',
    article: 'Art. 215 § 1',
    articleTitle: 'Skład rady nadzorczej sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza sp. z o.o. składa się co najmniej z:',
    options: {
      a: '2 członków',
      b: '3 członków',
      c: '5 członków',
      d: '7 członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 215 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków.',
    difficulty: 'easy',
    tags: ['skład', 'rada nadzorcza', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-522',
    article: 'Art. 229',
    articleTitle: 'Nabycie nieruchomości w ciągu 2 lat od rejestracji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Nabycie nieruchomości przez sp. z o.o. przed upływem dwóch lat od rejestracji wymaga uchwały wspólników, jeżeli cena nabycia przewyższa:',
    options: {
      a: '1/10 kapitału zakładowego',
      b: '1/4 kapitału zakładowego, nie niższą jednak od 50.000 zł',
      c: 'Połowę kapitału zakładowego',
      d: 'Kapitał zakładowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 229 k.s.h. nabycie nieruchomości przed upływem dwóch lat od zarejestrowania spółki za cenę przewyższającą 1/4 kapitału zakładowego, nie niższą od 50.000 zł, wymaga uchwały wspólników.',
    difficulty: 'hard',
    tags: ['nabycie nieruchomości', '2 lata', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-523',
    article: 'Art. 230',
    articleTitle: 'Zobowiązanie ponad 2x kapitał zakładowy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zaciągnięcie zobowiązania o wartości dwukrotnie przewyższającej kapitał zakładowy sp. z o.o. wymaga:',
    options: {
      a: 'Zgody rady nadzorczej',
      b: 'Uchwały wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Formy aktu notarialnego',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 230 k.s.h. zaciągnięcie zobowiązania o wartości dwukrotnie przewyższającej kapitał zakładowy wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zobowiązanie', '2x kapitał', 'sp. z o.o.']
  },

  {
    id: 'ksh-524',
    article: 'Art. 231 § 1',
    articleTitle: 'Termin zwyczajnego zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zwyczajne zgromadzenie wspólników sp. z o.o. powinno odbyć się:',
    options: {
      a: 'W ciągu 3 miesięcy po upływie roku obrotowego',
      b: 'W ciągu 6 miesięcy po upływie każdego roku obrotowego',
      c: 'W ciągu 9 miesięcy po upływie roku obrotowego',
      d: 'W ciągu 12 miesięcy po upływie roku obrotowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 231 § 1 k.s.h. zwyczajne zgromadzenie wspólników powinno odbyć się w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne zgromadzenie', 'termin', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-525',
    article: 'Art. 236 § 1',
    articleTitle: 'Żądanie zwołania zgromadzenia przez wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnicy sp. z o.o. reprezentujący co najmniej jaką część kapitału mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników?',
    options: {
      a: '1/20 kapitału zakładowego',
      b: '1/10 kapitału zakładowego',
      c: '1/5 kapitału zakładowego',
      d: '1/4 kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 236 § 1 k.s.h. wspólnicy reprezentujący co najmniej 1/10 kapitału zakładowego mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników.',
    difficulty: 'medium',
    tags: ['żądanie zwołania', '1/10 kapitału', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-526',
    article: 'Art. 238 § 1',
    articleTitle: 'Termin zawiadomienia o zgromadzeniu wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. zwołuje się listami poleconymi wysłanymi co najmniej:',
    options: {
      a: '7 dni przed terminem zgromadzenia',
      b: 'Dwa tygodnie przed terminem zgromadzenia',
      c: 'Trzy tygodnie przed terminem zgromadzenia',
      d: 'Miesiąc przed terminem zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 238 § 1 k.s.h. zgromadzenie wspólników zwołuje się listami poleconymi wysłanymi co najmniej dwa tygodnie przed terminem zgromadzenia wspólników.',
    difficulty: 'easy',
    tags: ['termin zawiadomienia', '2 tygodnie', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-527',
    article: 'Art. 240',
    articleTitle: 'Zgromadzenie bez formalnego zwołania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały wspólników sp. z o.o. mogą być powzięte bez formalnego zwołania zgromadzenia, jeżeli:',
    options: {
      a: 'Obecna jest większość wspólników',
      b: 'Cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu',
      c: 'Zarząd wyrazi na to zgodę',
      d: 'Rada nadzorcza zatwierdzi takie zgromadzenie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 240 k.s.h. uchwały można powziąć bez formalnego zwołania, jeżeli cały kapitał jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu.',
    difficulty: 'medium',
    tags: ['zgromadzenie bez zwołania', 'cały kapitał', 'sp. z o.o.']
  },

  {
    id: 'ksh-528',
    article: 'Art. 246 § 1',
    articleTitle: 'Większość 2/3 dla zmiany umowy spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały dotyczące zmiany umowy sp. z o.o. zapadają większością:',
    options: {
      a: 'Bezwzględną większością głosów',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 246 § 1 k.s.h. uchwały dotyczące zmiany umowy spółki zapadają większością dwóch trzecich głosów.',
    difficulty: 'easy',
    tags: ['zmiana umowy', 'większość 2/3', 'sp. z o.o.']
  },

  {
    id: 'ksh-529',
    article: 'Art. 246 § 2',
    articleTitle: 'Większość 3/4 dla istotnej zmiany przedmiotu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała dotycząca istotnej zmiany przedmiotu działalności sp. z o.o. wymaga większości:',
    options: {
      a: 'Bezwzględnej',
      b: 'Dwóch trzecich głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 246 § 2 k.s.h. uchwała dotycząca istotnej zmiany przedmiotu działalności wymaga większości trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['zmiana przedmiotu', 'większość 3/4', 'sp. z o.o.']
  },

  {
    id: 'ksh-530',
    article: 'Art. 249 § 1',
    articleTitle: 'Powództwo o uchylenie uchwały - przesłanki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała wspólników sp. z o.o. sprzeczna z umową spółki bądź dobrymi obyczajami może być zaskarżona powództwem o:',
    options: {
      a: 'Stwierdzenie nieważności',
      b: 'Uchylenie uchwały',
      c: 'Ustalenie nieistnienia uchwały',
      d: 'Zmianę uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 249 § 1 k.s.h. uchwała sprzeczna z umową spółki bądź dobrymi obyczajami może być zaskarżona powództwem o uchylenie uchwały.',
    difficulty: 'medium',
    tags: ['uchylenie uchwały', 'powództwo', 'sp. z o.o.']
  },

  {
    id: 'ksh-531',
    article: 'Art. 251',
    articleTitle: 'Termin na powództwo o uchylenie uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Powództwo o uchylenie uchwały wspólników sp. z o.o. należy wnieść w terminie:',
    options: {
      a: '7 dni od otrzymania wiadomości o uchwale',
      b: 'Miesiąca od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia',
      c: '3 miesięcy od powzięcia uchwały',
      d: 'Roku od powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 251 k.s.h. powództwo należy wnieść w terminie miesiąca od otrzymania wiadomości o uchwale, nie później niż 6 miesięcy od powzięcia.',
    difficulty: 'hard',
    tags: ['termin', 'uchylenie uchwały', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-532',
    article: 'Art. 252 § 1',
    articleTitle: 'Powództwo o stwierdzenie nieważności uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała wspólników sp. z o.o. SPRZECZNA Z USTAWĄ może być zaskarżona powództwem o:',
    options: {
      a: 'Uchylenie uchwały',
      b: 'Stwierdzenie nieważności uchwały',
      c: 'Ustalenie nieistnienia uchwały',
      d: 'Zmianę uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 252 § 1 k.s.h. uchwała sprzeczna z ustawą może być zaskarżona powództwem o stwierdzenie nieważności uchwały.',
    difficulty: 'easy',
    tags: ['nieważność uchwały', 'sprzeczność z ustawą', 'sp. z o.o.']
  },

  {
    id: 'ksh-533',
    article: 'Art. 252 § 3',
    articleTitle: 'Termin na powództwo o nieważność uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wytoczenia powództwa o stwierdzenie nieważności uchwały wspólników sp. z o.o. wygasa z upływem:',
    options: {
      a: 'Miesiąca od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia',
      b: '6 miesięcy od otrzymania wiadomości, nie później niż 3 lat od powzięcia uchwały',
      c: 'Roku od powzięcia uchwały',
      d: 'Nie wygasa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 252 § 3 k.s.h. prawo wygasa z upływem 6 miesięcy od otrzymania wiadomości, nie później niż 3 lat od powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['termin', 'nieważność uchwały', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-534',
    article: 'Art. 264 § 1',
    articleTitle: 'Ochrona wierzycieli przy obniżeniu kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'O obniżeniu kapitału zakładowego sp. z o.o. zarząd ogłasza, wzywając wierzycieli do sprzeciwu w terminie:',
    options: {
      a: 'Miesiąca',
      b: 'Dwóch miesięcy',
      c: 'Trzech miesięcy',
      d: 'Sześciu miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 264 § 1 k.s.h. zarząd ogłasza o obniżeniu kapitału, wzywając wierzycieli do sprzeciwu w terminie trzech miesięcy.',
    difficulty: 'hard',
    tags: ['obniżenie kapitału', 'wierzyciele', 'termin']
  },

  {
    id: 'ksh-535',
    article: 'Art. 279',
    articleTitle: 'Wezwanie wierzycieli w likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorzy sp. z o.o. wzywają wierzycieli do zgłoszenia wierzytelności w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Dwóch miesięcy od dnia ogłoszenia',
      c: 'Trzech miesięcy od dnia ogłoszenia',
      d: 'Sześciu miesięcy od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 279 k.s.h. likwidatorzy wzywają wierzycieli do zgłoszenia wierzytelności w terminie trzech miesięcy od ogłoszenia.',
    difficulty: 'medium',
    tags: ['likwidacja', 'wierzyciele', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-536',
    article: 'Art. 286 § 1',
    articleTitle: 'Podział majątku w likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Podział majątku sp. z o.o. po zaspokojeniu wierzycieli nie może nastąpić przed upływem:',
    options: {
      a: 'Miesiąca od ogłoszenia',
      b: 'Trzech miesięcy od ogłoszenia',
      c: 'Sześciu miesięcy od ogłoszenia o otwarciu likwidacji',
      d: 'Roku od ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 286 § 1 k.s.h. podział majątku nie może nastąpić przed upływem sześciu miesięcy od ogłoszenia o otwarciu likwidacji.',
    difficulty: 'hard',
    tags: ['likwidacja', 'podział majątku', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-537',
    article: 'Art. 299 § 1',
    articleTitle: 'Odpowiedzialność członków zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Jeżeli egzekucja przeciwko sp. z o.o. okaże się bezskuteczna, członkowie zarządu odpowiadają:',
    options: {
      a: 'Subsydiarnie i proporcjonalnie',
      b: 'Solidarnie za zobowiązania spółki',
      c: 'Tylko do wysokości swoich wynagrodzeń',
      d: 'Nie odpowiadają'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 1 k.s.h. jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania.',
    difficulty: 'easy',
    tags: ['art. 299', 'odpowiedzialność zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-538',
    article: 'Art. 299 § 2',
    articleTitle: 'Przesłanki egzoneracyjne art. 299',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Członek zarządu może uwolnić się od odpowiedzialności z art. 299 k.s.h., jeżeli wykaże, że:',
    options: {
      a: 'Nie wiedział o długu',
      b: 'We właściwym czasie zgłoszono wniosek o upadłość, lub niezgłoszenie nastąpiło nie z jego winy, lub wierzyciel nie poniósł szkody',
      c: 'Działał w dobrej wierze',
      d: 'Dług powstał przed jego powołaniem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może się uwolnić, wykazując terminowe zgłoszenie upadłości, brak winy lub brak szkody wierzyciela.',
    difficulty: 'hard',
    tags: ['art. 299', 'przesłanki egzoneracyjne', 'sp. z o.o.']
  },

  // ============================================================
  // SPÓŁKA AKCYJNA - POWSTANIE (art. 301-327)
  // ============================================================

  {
    id: 'ksh-539',
    article: 'Art. 301 § 1',
    articleTitle: 'Zawiązanie S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zawiązać spółkę akcyjną może:',
    options: {
      a: 'Co najmniej 3 osoby',
      b: 'Co najmniej 5 osób',
      c: 'Jedna albo więcej osób',
      d: 'Tylko osoby prawne'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 301 § 1 k.s.h. zawiązać spółkę akcyjną może jedna albo więcej osób.',
    difficulty: 'easy',
    tags: ['zawiązanie', 'założyciele', 'S.A.']
  },

  {
    id: 'ksh-540',
    article: 'Art. 301 § 1',
    articleTitle: 'Zakaz zawiązania S.A. przez jednoosobową sp. z o.o.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka akcyjna NIE może być zawiązana wyłącznie przez:',
    options: {
      a: 'Osobę fizyczną',
      b: 'Jednoosobową spółkę z ograniczoną odpowiedzialnością',
      c: 'Spółkę jawną',
      d: 'Spółkę komandytową'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 301 § 1 k.s.h. spółka akcyjna nie może być zawiązana wyłącznie przez jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['zakaz zawiązania', 'jednoosobowa sp. z o.o.', 'S.A.']
  },

  {
    id: 'ksh-541',
    article: 'Art. 301 § 2',
    articleTitle: 'Forma statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Statut spółki akcyjnej powinien być sporządzony w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 301 § 2 k.s.h. statut spółki akcyjnej powinien być sporządzony w formie aktu notarialnego.',
    difficulty: 'easy',
    tags: ['statut', 'forma', 'S.A.']
  },

  {
    id: 'ksh-542',
    article: 'Art. 308 § 1',
    articleTitle: 'Minimalny kapitał zakładowy S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał zakładowy spółki akcyjnej powinien wynosić co najmniej:',
    options: {
      a: '50.000 zł',
      b: '100.000 zł',
      c: '500.000 zł',
      d: '1.000.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 308 § 1 k.s.h. kapitał zakładowy spółki akcyjnej powinien wynosić co najmniej 100.000 złotych.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'minimum', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-543',
    article: 'Art. 308 § 2',
    articleTitle: 'Minimalna wartość nominalna akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wartość nominalna akcji w S.A. nie może być niższa niż:',
    options: {
      a: '1 grosz',
      b: '10 groszy',
      c: '1 zł',
      d: '50 zł'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 308 § 2 k.s.h. wartość nominalna akcji nie może być niższa niż 1 grosz.',
    difficulty: 'medium',
    tags: ['wartość nominalna', 'akcja', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-544',
    article: 'Art. 309 § 3',
    articleTitle: 'Minimalna wpłata na akcje przed rejestracją',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje obejmowane za wkłady pieniężne powinny być opłacone przed zarejestrowaniem spółki co najmniej w:',
    options: {
      a: 'Całości',
      b: 'Połowie',
      c: 'Jednej czwartej wartości nominalnej',
      d: 'Jednej dziesiątej wartości nominalnej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. akcje obejmowane za wkłady pieniężne powinny być opłacone przed zarejestrowaniem spółki co najmniej w jednej czwartej ich wartości nominalnej.',
    difficulty: 'hard',
    tags: ['wpłata na akcje', '1/4', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-545',
    article: 'Art. 309 § 3',
    articleTitle: 'Termin wniesienia wkładów niepieniężnych w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje obejmowane za wkłady niepieniężne powinny być pokryte w całości:',
    options: {
      a: 'Przed zarejestrowaniem spółki',
      b: 'W ciągu 6 miesięcy od dnia rejestracji',
      c: 'Nie później niż przed upływem roku po zarejestrowaniu spółki',
      d: 'W ciągu 2 lat od dnia rejestracji'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. akcje obejmowane za wkłady niepieniężne powinny być pokryte w całości nie później niż przed upływem roku po zarejestrowaniu spółki.',
    difficulty: 'hard',
    tags: ['wkłady niepieniężne', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-546',
    article: 'Art. 328 § 1',
    articleTitle: 'Dematerializacja akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje spółki akcyjnej:',
    options: {
      a: 'Mają formę dokumentu papierowego',
      b: 'Nie mają formy dokumentu (dematerializacja)',
      c: 'Mogą mieć formę dokumentu lub być zdematerializowane',
      d: 'Są emitowane tylko w formie elektronicznej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 328 § 1 k.s.h. akcje nie mają formy dokumentu. Jest to tzw. dematerializacja akcji.',
    difficulty: 'easy',
    tags: ['dematerializacja', 'akcje', 'S.A.']
  },

  {
    id: 'ksh-547',
    article: 'Art. 352',
    articleTitle: 'Maksymalne uprzywilejowanie akcji co do głosu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Na każdą akcję uprzywilejowaną co do głosu w S.A. może przypadać maksymalnie:',
    options: {
      a: '2 głosy',
      b: '3 głosy',
      c: '5 głosów',
      d: '10 głosów'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 352 k.s.h. na każdą akcję uprzywilejowaną co do głosu może przypadać nie więcej niż dwa głosy.',
    difficulty: 'medium',
    tags: ['uprzywilejowanie', 'głosy', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-548',
    article: 'Art. 347 § 1',
    articleTitle: 'Prawo do dywidendy w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcjonariusze S.A. mają prawo do udziału w zysku:',
    options: {
      a: 'Automatycznie',
      b: 'Zbadanym przez biegłego rewidenta i przeznaczonym przez walne zgromadzenie do wypłaty',
      c: 'Zatwierdzonym przez zarząd',
      d: 'Zatwierdzonym przez radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 347 § 1 k.s.h. akcjonariusze mają prawo do udziału w zysku zbadanym przez biegłego rewidenta i przeznaczonym przez walne zgromadzenie do wypłaty.',
    difficulty: 'easy',
    tags: ['dywidenda', 'walne zgromadzenie', 'S.A.']
  },

  {
    id: 'ksh-549',
    article: 'Art. 368 § 4',
    articleTitle: 'Powoływanie zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członków zarządu S.A. powołuje i odwołuje:',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza, chyba że statut stanowi inaczej',
      c: 'Założyciele',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 368 § 4 k.s.h. członków zarządu powołuje i odwołuje rada nadzorcza, chyba że statut spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['powoływanie zarządu', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-550',
    article: 'Art. 369 § 1',
    articleTitle: 'Kadencja zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Kadencja członka zarządu S.A. nie może być dłuższa niż:',
    options: {
      a: '3 lata',
      b: '4 lata',
      c: '5 lat',
      d: 'Bez ograniczenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 369 § 1 k.s.h. okres sprawowania funkcji przez członka zarządu nie może być dłuższy niż pięć lat.',
    difficulty: 'medium',
    tags: ['kadencja', 'zarząd', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-551',
    article: 'Art. 371 § 1',
    articleTitle: 'Reprezentacja S.A. przez zarząd',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Jeżeli zarząd S.A. jest wieloosobowy, a statut nie określa sposobu reprezentacji:',
    options: {
      a: 'Każdy członek zarządu reprezentuje spółkę samodzielnie',
      b: 'Wymagane jest współdziałanie dwóch członków zarządu albo jednego z prokurentem',
      c: 'Wymagane jest współdziałanie wszystkich członków zarządu',
      d: 'Spółkę reprezentuje tylko prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 371 § 1 k.s.h. jeżeli statut nie określa sposobu reprezentacji, wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem.',
    difficulty: 'easy',
    tags: ['reprezentacja', 'zarząd wieloosobowy', 'S.A.']
  },

  {
    id: 'ksh-552',
    article: 'Art. 379 § 1',
    articleTitle: 'Umowa między S.A. a członkiem zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W umowie między S.A. a członkiem zarządu spółkę reprezentuje:',
    options: {
      a: 'Pozostali członkowie zarządu',
      b: 'Rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia',
      c: 'Prokurent',
      d: 'Komisja rewizyjna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 379 § 1 k.s.h. w umowie między spółką a członkiem zarządu spółkę reprezentuje rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['umowa z zarządem', 'reprezentacja', 'S.A.']
  },

  {
    id: 'ksh-553',
    article: 'Art. 381',
    articleTitle: 'Obligatoryjność rady nadzorczej w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W spółce akcyjnej rada nadzorcza jest organem:',
    options: {
      a: 'Fakultatywnym',
      b: 'Obligatoryjnym w każdej S.A.',
      c: 'Obligatoryjnym tylko w spółkach publicznych',
      d: 'Obligatoryjnym tylko gdy kapitał przekracza 500.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 381 k.s.h. w spółce akcyjnej ustanawia się radę nadzorczą. Jest to organ obligatoryjny w każdej S.A.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'obligatoryjność', 'S.A.']
  },

  {
    id: 'ksh-554',
    article: 'Art. 385 § 1',
    articleTitle: 'Skład rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. składa się co najmniej z:',
    options: {
      a: '2 członków',
      b: '3 członków (a w spółkach publicznych co najmniej 5)',
      c: '5 członków',
      d: '7 członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 385 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków, a w spółkach publicznych co najmniej z pięciu członków.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'skład', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-555',
    article: 'Art. 386 § 1',
    articleTitle: 'Kadencja rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Kadencja członka rady nadzorczej S.A. nie może być dłuższa niż:',
    options: {
      a: '3 lata',
      b: '4 lata',
      c: '5 lat',
      d: 'Bez ograniczenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 386 § 1 k.s.h. kadencja członka rady nadzorczej nie może być dłuższa niż pięć lat.',
    difficulty: 'medium',
    tags: ['kadencja', 'rada nadzorcza', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-556',
    article: 'Art. 389 § 3',
    articleTitle: 'Częstotliwość posiedzeń RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. powinna być zwoływana nie rzadziej niż:',
    options: {
      a: 'Raz w miesiącu',
      b: 'Raz na kwartał',
      c: 'Raz na pół roku',
      d: 'Raz w roku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 389 § 3 k.s.h. rada nadzorcza powinna być zwoływana nie rzadziej niż raz w każdym kwartale roku obrotowego.',
    difficulty: 'medium',
    tags: ['posiedzenia RN', 'częstotliwość', 'S.A.']
  },

  {
    id: 'ksh-557',
    article: 'Art. 395 § 1',
    articleTitle: 'Termin zwyczajnego WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Zwyczajne walne zgromadzenie S.A. powinno odbyć się:',
    options: {
      a: 'W ciągu 3 miesięcy po upływie roku obrotowego',
      b: 'W ciągu 6 miesięcy po upływie każdego roku obrotowego',
      c: 'W ciągu 9 miesięcy po upływie roku obrotowego',
      d: 'W ciągu roku po upływie roku obrotowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 395 § 1 k.s.h. zwyczajne walne zgromadzenie powinno odbyć się w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne WZ', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-558',
    article: 'Art. 400 § 1',
    articleTitle: 'Żądanie zwołania WZ przez akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusze S.A. reprezentujący co najmniej jaką część kapitału mogą żądać zwołania nadzwyczajnego WZ?',
    options: {
      a: '1/20 kapitału zakładowego',
      b: '1/10 kapitału zakładowego',
      c: '1/5 kapitału zakładowego',
      d: '1/4 kapitału zakładowego'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 400 § 1 k.s.h. akcjonariusze reprezentujący co najmniej 1/20 kapitału zakładowego mogą żądać zwołania nadzwyczajnego walnego zgromadzenia.',
    difficulty: 'hard',
    tags: ['żądanie zwołania', '1/20 kapitału', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-559',
    article: 'Art. 402 § 1',
    articleTitle: 'Termin ogłoszenia o WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie S.A. (niebędącej spółką publiczną) zwołuje się przez ogłoszenie co najmniej:',
    options: {
      a: 'Tydzień przed terminem zgromadzenia',
      b: '2 tygodnie przed terminem zgromadzenia',
      c: '3 tygodnie przed terminem zgromadzenia',
      d: 'Miesiąc przed terminem zgromadzenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 402 § 1 k.s.h. walne zgromadzenie zwołuje się przez ogłoszenie dokonane co najmniej na trzy tygodnie przed terminem walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['termin ogłoszenia', '3 tygodnie', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-560',
    article: 'Art. 415 § 1',
    articleTitle: 'Większość dla zmiany statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Zmiana statutu S.A. wymaga uchwały walnego zgromadzenia podjętej większością:',
    options: {
      a: 'Bezwzględną większością głosów',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: 'Jednomyślnie'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 415 § 1 k.s.h. uchwała dotycząca zmiany statutu wymaga większości trzech czwartych głosów.',
    difficulty: 'medium',
    tags: ['zmiana statutu', 'większość 3/4', 'S.A.']
  },

  {
    id: 'ksh-561',
    article: 'Art. 422 § 1',
    articleTitle: 'Powództwo o uchylenie uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała WZ S.A. sprzeczna ze statutem bądź dobrymi obyczajami może być zaskarżona powództwem o:',
    options: {
      a: 'Stwierdzenie nieważności',
      b: 'Uchylenie uchwały',
      c: 'Ustalenie nieistnienia',
      d: 'Zmianę uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 422 § 1 k.s.h. uchwała WZ sprzeczna ze statutem bądź dobrymi obyczajami może być zaskarżona powództwem o uchylenie uchwały.',
    difficulty: 'easy',
    tags: ['uchylenie uchwały', 'powództwo', 'S.A.']
  },

  {
    id: 'ksh-562',
    article: 'Art. 423 § 1',
    articleTitle: 'Termin na powództwo o uchylenie uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Powództwo o uchylenie uchwały WZ S.A. powinno być wniesione w terminie:',
    options: {
      a: '7 dni od otrzymania wiadomości',
      b: 'Miesiąca od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia',
      c: '3 miesięcy od powzięcia uchwały',
      d: 'Roku od powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 423 § 1 k.s.h. powództwo należy wnieść w terminie miesiąca od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia.',
    difficulty: 'hard',
    tags: ['termin', 'uchylenie uchwały', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-563',
    article: 'Art. 425 § 1',
    articleTitle: 'Powództwo o stwierdzenie nieważności uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała WZ S.A. SPRZECZNA Z USTAWĄ może być zaskarżona powództwem o:',
    options: {
      a: 'Uchylenie uchwały',
      b: 'Stwierdzenie nieważności uchwały',
      c: 'Ustalenie nieistnienia uchwały',
      d: 'Zmianę uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 425 § 1 k.s.h. uchwała WZ sprzeczna z ustawą może być zaskarżona powództwem o stwierdzenie nieważności uchwały.',
    difficulty: 'easy',
    tags: ['nieważność uchwały', 'sprzeczność z ustawą', 'S.A.']
  },

  // ============================================================
  // PORÓWNANIA SP. Z O.O. VS S.A.
  // ============================================================

  {
    id: 'ksh-564',
    article: 'Porównanie',
    articleTitle: 'Porównanie: minimalny kapitał',
    section: 'Porównanie spółek',
    subsection: 'Kapitał zakładowy',
    question: 'Minimalny kapitał zakładowy: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 5.000 zł, S.A.: 50.000 zł',
      b: 'Sp. z o.o.: 5.000 zł, S.A.: 100.000 zł',
      c: 'Sp. z o.o.: 50.000 zł, S.A.: 100.000 zł',
      d: 'Sp. z o.o.: 10.000 zł, S.A.: 500.000 zł'
    },
    correct: 'b',
    explanation: 'Minimalny kapitał zakładowy: sp. z o.o. - 5.000 zł (art. 154 § 1), S.A. - 100.000 zł (art. 308 § 1).',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'porównanie', 'sp. z o.o.', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-565',
    article: 'Porównanie',
    articleTitle: 'Porównanie: powoływanie zarządu',
    section: 'Porównanie spółek',
    subsection: 'Zarząd',
    question: 'Kto domyślnie powołuje zarząd: sp. z o.o. vs S.A.?',
    options: {
      a: 'W obu przypadkach - rada nadzorcza',
      b: 'W obu przypadkach - wspólnicy/akcjonariusze',
      c: 'Sp. z o.o.: wspólnicy, S.A.: rada nadzorcza',
      d: 'Sp. z o.o.: rada nadzorcza, S.A.: walne zgromadzenie'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. zarząd powołują wspólnicy (art. 201 § 4), a w S.A. - rada nadzorcza (art. 368 § 4), chyba że umowa/statut stanowi inaczej.',
    difficulty: 'medium',
    tags: ['powoływanie zarządu', 'porównanie', 'sp. z o.o.', 'S.A.']
  },

  {
    id: 'ksh-566',
    article: 'Porównanie',
    articleTitle: 'Porównanie: obligatoryjność RN',
    section: 'Porównanie spółek',
    subsection: 'Rada nadzorcza',
    question: 'Obligatoryjność rady nadzorczej: sp. z o.o. vs S.A.:',
    options: {
      a: 'Obligatoryjna w obu spółkach',
      b: 'Fakultatywna w obu spółkach',
      c: 'Sp. z o.o.: warunkowo obligatoryjna (kapitał > 500.000 zł i > 25 wspólników), S.A.: zawsze obligatoryjna',
      d: 'Sp. z o.o.: zawsze obligatoryjna, S.A.: fakultatywna'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. RN jest obligatoryjna tylko gdy kapitał > 500.000 zł i > 25 wspólników. W S.A. jest zawsze obligatoryjna.',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'obligatoryjność', 'porównanie']
  },

  {
    id: 'ksh-567',
    article: 'Porównanie',
    articleTitle: 'Porównanie: żądanie zwołania zgromadzenia',
    section: 'Porównanie spółek',
    subsection: 'Zgromadzenie',
    question: 'Próg kapitałowy do żądania zwołania zgromadzenia: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 1/20, S.A.: 1/10',
      b: 'Sp. z o.o.: 1/10, S.A.: 1/20',
      c: 'Sp. z o.o.: 1/10, S.A.: 1/10',
      d: 'Sp. z o.o.: 1/20, S.A.: 1/20'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. - 1/10 kapitału (art. 236 § 1), w S.A. - 1/20 kapitału (art. 400 § 1).',
    difficulty: 'hard',
    tags: ['żądanie zwołania', 'porównanie', 'sp. z o.o.', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-568',
    article: 'Porównanie',
    articleTitle: 'Porównanie: termin zawiadomienia o zgromadzeniu',
    section: 'Porównanie spółek',
    subsection: 'Zgromadzenie',
    question: 'Minimalny termin zawiadomienia o zgromadzeniu: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 1 tydzień, S.A.: 2 tygodnie',
      b: 'Sp. z o.o.: 2 tygodnie, S.A.: 3 tygodnie',
      c: 'Sp. z o.o.: 2 tygodnie, S.A.: 2 tygodnie',
      d: 'Sp. z o.o.: 3 tygodnie, S.A.: 3 tygodnie'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. - 2 tygodnie przed (art. 238 § 1), w S.A. - 3 tygodnie przed (art. 402 § 1).',
    difficulty: 'medium',
    tags: ['termin zawiadomienia', 'porównanie', 'sp. z o.o.', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-569',
    article: 'Porównanie',
    articleTitle: 'Porównanie: maksymalne uprzywilejowanie głosowe',
    section: 'Porównanie spółek',
    subsection: 'Uprzywilejowanie',
    question: 'Maksymalne uprzywilejowanie co do głosu: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 2 głosy, S.A.: 2 głosy',
      b: 'Sp. z o.o.: 3 głosy, S.A.: 2 głosy',
      c: 'Sp. z o.o.: 3 głosy, S.A.: 3 głosy',
      d: 'Sp. z o.o.: 2 głosy, S.A.: 3 głosy'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. - max 3 głosy na udział (art. 174 § 3), w S.A. - max 2 głosy na akcję (art. 352).',
    difficulty: 'hard',
    tags: ['uprzywilejowanie', 'głosy', 'porównanie', 'sp. z o.o.', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-570',
    article: 'Porównanie',
    articleTitle: 'Porównanie: zmiana umowy/statutu',
    section: 'Porównanie spółek',
    subsection: 'Zmiana umowy',
    question: 'Większość wymagana dla zmiany umowy sp. z o.o. vs statutu S.A.:',
    options: {
      a: 'Sp. z o.o.: 2/3 głosów, S.A.: 3/4 głosów',
      b: 'Sp. z o.o.: 3/4 głosów, S.A.: 2/3 głosów',
      c: 'Sp. z o.o.: 3/4 głosów, S.A.: 3/4 głosów',
      d: 'Sp. z o.o.: 2/3 głosów, S.A.: 2/3 głosów'
    },
    correct: 'a',
    explanation: 'W sp. z o.o. zmiana umowy wymaga 2/3 głosów (art. 246 § 1), w S.A. zmiana statutu - 3/4 głosów (art. 415 § 1).',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'zmiana statutu', 'porównanie', 'większość']
  },

  // ============================================================
  // DODATKOWE PYTANIA
  // ============================================================

  {
    id: 'ksh-571',
    article: 'Art. 233 § 1',
    articleTitle: 'Strata przewyższająca połowę kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli bilans sp. z o.o. sporządzony przez zarząd wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz połowę kapitału zakładowego, zarząd jest obowiązany:',
    options: {
      a: 'Zgłosić wniosek o upadłość',
      b: 'Niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki',
      c: 'Obniżyć kapitał zakładowy',
      d: 'Rozwiązać spółkę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 233 § 1 k.s.h. zarząd jest obowiązany niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki.',
    difficulty: 'hard',
    tags: ['strata', 'zgromadzenie wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-572',
    article: 'Art. 17 § 1',
    articleTitle: 'Czynność bez uchwały wymaganej przez ustawę',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna dokonana przez spółkę kapitałową bez wymaganej przez USTAWĘ uchwały wspólników/WZ jest:',
    options: {
      a: 'Ważna',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. czynność prawna dokonana bez wymaganej przez ustawę uchwały jest nieważna.',
    difficulty: 'hard',
    tags: ['nieważność', 'uchwała', 'ustawa']
  },

  {
    id: 'ksh-573',
    article: 'Art. 17 § 2',
    articleTitle: 'Czynność bez uchwały wymaganej przez umowę',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna dokonana przez spółkę kapitałową bez wymaganej przez UMOWĘ/STATUT uchwały wspólników/WZ jest:',
    options: {
      a: 'Ważna (ale członkowie zarządu mogą odpowiadać wobec spółki)',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 17 § 2 k.s.h. czynność prawna dokonana bez zgody wymaganej wyłącznie przez umowę/statut jest ważna, ale nie wyklucza to odpowiedzialności zarządu.',
    difficulty: 'hard',
    tags: ['ważność', 'uchwała', 'umowa spółki']
  },

  {
    id: 'ksh-574',
    article: 'Art. 293 § 3',
    articleTitle: 'Business judgment rule',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Odpowiedzialność',
    question: 'Członek zarządu sp. z o.o. NIE narusza obowiązku staranności, jeżeli postępując lojalnie wobec spółki:',
    options: {
      a: 'Osiągnął zysk dla spółki',
      b: 'Działał w granicach uzasadnionego ryzyka gospodarczego na podstawie stosownych informacji i analiz',
      c: 'Uzyskał zgodę wspólników',
      d: 'Konsultował się z prawnikiem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 3 k.s.h. (business judgment rule) członek zarządu nie narusza obowiązku staranności, jeżeli działał lojalnie i w granicach uzasadnionego ryzyka gospodarczego.',
    difficulty: 'hard',
    tags: ['business judgment rule', 'staranność', 'odpowiedzialność']
  },

  {
    id: 'ksh-575',
    article: 'Art. 266 § 1',
    articleTitle: 'Wyłączenie wspólnika przez sąd',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Sąd może orzec wyłączenie wspólnika sp. z o.o. na żądanie wszystkich pozostałych wspólników, jeżeli ich udziały stanowią:',
    options: {
      a: 'Co najmniej 1/4 kapitału zakładowego',
      b: 'Co najmniej połowę kapitału zakładowego',
      c: 'Co najmniej 2/3 kapitału zakładowego',
      d: 'Co najmniej 3/4 kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 266 § 1 k.s.h. sąd może orzec wyłączenie wspólnika na żądanie wszystkich pozostałych wspólników, jeżeli ich udziały stanowią więcej niż połowę kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['wyłączenie wspólnika', 'sąd', 'sp. z o.o.']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART6_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART6.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART6.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART6.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART6.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    spzoo: KSH_EXAM_QUESTIONS_PART6.filter(q => q.section.includes('Spółka z o.o.')).length,
    sa: KSH_EXAM_QUESTIONS_PART6.filter(q => q.section.includes('Spółka akcyjna')).length,
    comparison: KSH_EXAM_QUESTIONS_PART6.filter(q => q.section.includes('Porównanie')).length,
  }
};

// Funkcja do generowania quizu skupionego na sp. z o.o. i S.A.
export const generateCapitalCompaniesQuiz = (
  questionCount: number = 50,
  distribution: { spzoo: number; sa: number } = { spzoo: 60, sa: 40 }
): ExamQuestion[] => {
  const spzooQuestions = KSH_EXAM_QUESTIONS_PART6.filter(q =>
    q.section.includes('Spółka z o.o.') || q.tags.includes('sp. z o.o.')
  );
  
  const saQuestions = KSH_EXAM_QUESTIONS_PART6.filter(q =>
    q.section.includes('Spółka akcyjna') || q.tags.includes('S.A.')
  );

  const spzooCount = Math.round(questionCount * distribution.spzoo / 100);
  const saCount = questionCount - spzooCount;

  const selectedSpzoo = spzooQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, spzooCount);

  const selectedSa = saQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, saCount);

  return [...selectedSpzoo, ...selectedSa].sort(() => Math.random() - 0.5);
};

console.log('KSH Part 6 (Sp. z o.o. & S.A.) loaded:', PART6_STATS);
