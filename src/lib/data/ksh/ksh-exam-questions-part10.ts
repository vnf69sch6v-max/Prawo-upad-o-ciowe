// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 10 - 80 pytań: SP. Z O.O. i S.A. - Procedury i edge cases
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART10: ExamQuestion[] = [

  // ============================================================
  // SP. Z O.O. - PROCEDURY SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-761',
    article: 'Art. 157 § 1',
    articleTitle: 'Obligatoryjne elementy umowy sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Umowa sp. z o.o. powinna określać OBLIGATORYJNIE:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę i siedzibę spółki, przedmiot działalności, wysokość kapitału zakładowego, czy wspólnik może mieć więcej niż jeden udział, liczbę i wartość nominalną udziałów objętych przez poszczególnych wspólników, czas trwania spółki (jeśli oznaczony)',
      c: 'Tylko kapitał zakładowy',
      d: 'Tylko przedmiot działalności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157 § 1 k.s.h. umowa spółki z ograniczoną odpowiedzialnością powinna określać: firmę i siedzibę spółki, przedmiot działalności spółki, wysokość kapitału zakładowego, czy wspólnik może mieć więcej niż jeden udział, liczbę i wartość nominalną udziałów objętych przez poszczególnych wspólników, czas trwania spółki, jeżeli jest oznaczony.',
    difficulty: 'medium',
    tags: ['umowa spółki', 'elementy obligatoryjne', 'sp. z o.o.']
  },

  {
    id: 'ksh-762',
    article: 'Art. 158 § 1',
    articleTitle: 'Aporty - wymogi',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wkładem do sp. z o.o. ma być w całości albo w części wkład niepieniężny (aport), umowa spółki powinna szczegółowo określać:',
    options: {
      a: 'Tylko przedmiot wkładu',
      b: 'Przedmiot tego wkładu oraz osobę wspólnika wnoszącego aport, jak również liczbę i wartość nominalną objętych w zamian udziałów',
      c: 'Tylko wartość wkładu',
      d: 'Tylko osobę wnoszącą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 158 § 1 k.s.h. jeżeli wkładem do spółki ma być w całości albo w części wkład niepieniężny, umowa spółki powinna szczegółowo określać przedmiot tego wkładu oraz osobę wspólnika wnoszącego aport, jak również liczbę i wartość nominalną objętych w zamian udziałów.',
    difficulty: 'medium',
    tags: ['aport', 'wkład niepieniężny', 'sp. z o.o.']
  },

  {
    id: 'ksh-763',
    article: 'Art. 158 § 3',
    articleTitle: 'Termin wniesienia aportu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Przedmiot wkładu niepieniężnego (aport) do sp. z o.o. pozostaje do dyspozycji zarządu spółki:',
    options: {
      a: 'Przed rejestracją',
      b: 'Nie później niż w terminie roku od dnia wpisu spółki do rejestru, chyba że umowa spółki stanowi inaczej',
      c: 'W terminie 6 miesięcy od wpisu',
      d: 'W terminie 2 lat od wpisu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 158 § 3 k.s.h. przedmiot wkładu niepieniężnego powinien pozostać do dyspozycji zarządu spółki nie później niż w terminie roku od dnia wpisu spółki do rejestru, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['aport', 'termin wniesienia', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-764',
    article: 'Art. 159',
    articleTitle: 'Szczególne korzyści',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wspólnikowi sp. z o.o. mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone, oprócz wniesienia wkładów, inne obowiązki wobec spółki:',
    options: {
      a: 'Wystarczy uchwała wspólników',
      b: 'Należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki',
      c: 'Wystarczy zgoda zarządu',
      d: 'Nie jest to możliwe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 159 k.s.h. jeżeli wspólnikowi mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone, oprócz wniesienia wkładów na kapitał zakładowy, inne obowiązki wobec spółki, należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki.',
    difficulty: 'hard',
    tags: ['szczególne korzyści', 'bezskuteczność', 'sp. z o.o.']
  },

  {
    id: 'ksh-765',
    article: 'Art. 162',
    articleTitle: 'Reprezentacja spółki w organizacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Sp. z o.o. w organizacji jest reprezentowana przez:',
    options: {
      a: 'Tylko założycieli',
      b: 'Zarząd albo pełnomocnika powołanego jednomyślną uchwałą wspólników',
      c: 'Tylko przez sąd',
      d: 'Przez radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 161 § 2 k.s.h. spółka w organizacji jest reprezentowana przez zarząd albo pełnomocnika powołanego jednomyślną uchwałą wspólników.',
    difficulty: 'medium',
    tags: ['spółka w organizacji', 'reprezentacja', 'sp. z o.o.']
  },

  {
    id: 'ksh-766',
    article: 'Art. 163',
    articleTitle: 'Warunki powstania sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania sp. z o.o. wymaga się:',
    options: {
      a: 'Tylko zawarcia umowy spółki',
      b: 'Zawarcia umowy spółki, wniesienia przez wspólników wkładów na pokrycie całego kapitału zakładowego, powołania zarządu, ustanowienia rady nadzorczej lub komisji rewizyjnej (jeśli wymaga tego ustawa lub umowa), wpisu do rejestru',
      c: 'Tylko wpisu do rejestru',
      d: 'Tylko powołania zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 163 k.s.h. do powstania spółki z ograniczoną odpowiedzialnością wymaga się: zawarcia umowy spółki, wniesienia przez wspólników wkładów na pokrycie całego kapitału zakładowego, powołania zarządu, ustanowienia rady nadzorczej lub komisji rewizyjnej, jeżeli wymaga tego ustawa lub umowa spółki, wpisu do rejestru.',
    difficulty: 'medium',
    tags: ['powstanie spółki', 'warunki', 'sp. z o.o.']
  },

  {
    id: 'ksh-767',
    article: 'Art. 167 § 1',
    articleTitle: 'Zgłoszenie sp. z o.o. do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zgłoszenie sp. z o.o. do rejestru podpisują:',
    options: {
      a: 'Wszyscy wspólnicy',
      b: 'Wszyscy członkowie zarządu',
      c: 'Prezes zarządu',
      d: 'Pełnomocnik'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 164 § 2 k.s.h. wniosek o wpis spółki do rejestru podpisują wszyscy członkowie zarządu.',
    difficulty: 'easy',
    tags: ['zgłoszenie do rejestru', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-768',
    article: 'Art. 169',
    articleTitle: 'Skutek braku rejestracji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli zawiązania sp. z o.o. nie zgłoszono do sądu rejestrowego w terminie 6 miesięcy od dnia zawarcia umowy spółki albo postanowienie sądu odmawiające zarejestrowania stało się prawomocne, umowa spółki:',
    options: {
      a: 'Pozostaje w mocy',
      b: 'Ulega rozwiązaniu',
      c: 'Jest nieważna od początku',
      d: 'Wymaga aneksu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 169 k.s.h. jeżeli zawiązania spółki nie zgłoszono do sądu rejestrowego w terminie określonym w art. 164 § 1 albo jeżeli postanowienie sądu odmawiające zarejestrowania stało się prawomocne, umowa spółki ulega rozwiązaniu.',
    difficulty: 'medium',
    tags: ['brak rejestracji', 'rozwiązanie umowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-769',
    article: 'Art. 170',
    articleTitle: 'Odpowiedzialność za działanie przed wpisem',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Za zobowiązania sp. z o.o. w organizacji odpowiadają:',
    options: {
      a: 'Tylko spółka w organizacji',
      b: 'Solidarnie spółka w organizacji oraz osoby, które działały w jej imieniu',
      c: 'Tylko osoby działające w imieniu spółki',
      d: 'Wspólnicy proporcjonalnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 13 § 1 k.s.h. za zobowiązania spółki kapitałowej w organizacji odpowiadają solidarnie spółka oraz osoby, które działały w jej imieniu.',
    difficulty: 'medium',
    tags: ['spółka w organizacji', 'odpowiedzialność solidarna', 'sp. z o.o.']
  },

  {
    id: 'ksh-770',
    article: 'Art. 173 § 1',
    articleTitle: 'Jednoosobowa sp. z o.o. - forma oświadczeń',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W jednoosobowej sp. z o.o. oświadczenia woli jedynego wspólnika składane spółce wymagają formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej pod rygorem nieważności',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 173 § 1 k.s.h. w przypadku gdy wszystkie udziały spółki przysługują jedynemu wspólnikowi albo jedynemu wspólnikowi i spółce, oświadczenie woli takiego wspólnika składane spółce wymaga formy pisemnej pod rygorem nieważności, chyba że ustawa stanowi inaczej.',
    difficulty: 'hard',
    tags: ['jednoosobowa spółka', 'forma pisemna', 'sp. z o.o.']
  },

  {
    id: 'ksh-771',
    article: 'Art. 174 § 4',
    articleTitle: 'Uprzywilejowanie dywidendowe - limit',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Uprzywilejowanie udziału w sp. z o.o. w zakresie dywidendy może przyznawać uprawnionemu dywidendę przewyższającą nie więcej niż o połowę dywidendę przysługującą udziałom nieuprzywilejowanym, czyli:',
    options: {
      a: 'Maksymalnie 120% dywidendy zwykłej',
      b: 'Maksymalnie 150% dywidendy zwykłej',
      c: 'Maksymalnie 200% dywidendy zwykłej',
      d: 'Bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 174 § 4 k.s.h. uprzywilejowanie w zakresie dywidendy może przyznawać uprawnionemu dywidendę, która przewyższa nie więcej niż o połowę dywidendę przysługującą udziałom nieuprzywilejowanym (dywidenda uprzywilejowana), czyli maksymalnie 150%.',
    difficulty: 'hard',
    tags: ['uprzywilejowanie dywidendowe', 'limit', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-772',
    article: 'Art. 183 § 1',
    articleTitle: 'Skuteczność zbycia udziału wobec spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'O przejściu udziału w sp. z o.o., jego części lub ułamkowej części udziału na inną osobę zainteresowani powinni zawiadomić spółkę. Przejście jest skuteczne wobec spółki:',
    options: {
      a: 'Z chwilą zawarcia umowy',
      b: 'Z chwilą zawiadomienia spółki, przy przedstawieniu dowodu przejścia',
      c: 'Z chwilą wpisu do KRS',
      d: 'Z chwilą wpisu do księgi udziałów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 187 § 1 k.s.h. o przejściu udziału, jego części lub ułamkowej części zainteresowani zawiadamiają spółkę, przedstawiając dowód przejścia. Przejście udziału jest skuteczne wobec spółki od chwili, gdy spółka otrzyma od jednego z zainteresowanych zawiadomienie o tym wraz z dowodem dokonania czynności.',
    difficulty: 'hard',
    tags: ['zbycie udziału', 'skuteczność', 'zawiadomienie', 'sp. z o.o.']
  },

  {
    id: 'ksh-773',
    article: 'Art. 184 § 1',
    articleTitle: 'Współuprawnieni z udziału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Współuprawnieni z udziału w sp. z o.o. (np. spadkobiercy) wykonują swoje prawa w spółce:',
    options: {
      a: 'Każdy samodzielnie',
      b: 'Przez wspólnego przedstawiciela',
      c: 'Tylko najstarszy współuprawniony',
      d: 'Przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 184 § 1 k.s.h. współuprawnieni z udziału lub udziałów wykonują swoje prawa w spółce przez wspólnego przedstawiciela.',
    difficulty: 'medium',
    tags: ['współuprawnieni', 'wspólny przedstawiciel', 'sp. z o.o.']
  },

  {
    id: 'ksh-774',
    article: 'Art. 185 § 1',
    articleTitle: 'Umorzenie automatyczne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa sp. z o.o. może stanowić, że udział ulega umorzeniu w razie ziszczenia się określonego zdarzenia bez powzięcia uchwały zgromadzenia wspólników. Jest to:',
    options: {
      a: 'Umorzenie dobrowolne',
      b: 'Umorzenie przymusowe',
      c: 'Umorzenie automatyczne',
      d: 'Umorzenie warunkowe'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 199 § 4 k.s.h. umowa spółki może stanowić, że udział ulega umorzeniu w razie ziszczenia się określonego zdarzenia bez powzięcia uchwały zgromadzenia wspólników. Stosuje się wówczas przepisy o umorzeniu przymusowym. Jest to tzw. umorzenie automatyczne.',
    difficulty: 'medium',
    tags: ['umorzenie automatyczne', 'zdarzenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-775',
    article: 'Art. 199 § 6',
    articleTitle: 'Umorzenie - wynagrodzenie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wynagrodzenie za umorzony udział w sp. z o.o. w przypadku umorzenia przymusowego:',
    options: {
      a: 'Może być dowolnie niskie',
      b: 'Nie może być niższe od wartości przypadających na udział aktywów netto, wykazanych w sprawozdaniu finansowym za ostatni rok obrotowy, pomniejszonych o kwotę przeznaczoną do podziału między wspólników',
      c: 'Musi równać się wartości nominalnej udziału',
      d: 'Jest ustalane przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 199 § 2 k.s.h. wynagrodzenie za umorzone udziały w przypadku umorzenia przymusowego nie może być niższe od wartości przypadających na udział aktywów netto, wykazanych w sprawozdaniu finansowym za ostatni rok obrotowy, pomniejszonych o kwotę przeznaczoną do podziału między wspólników.',
    difficulty: 'hard',
    tags: ['umorzenie przymusowe', 'wynagrodzenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-776',
    article: 'Art. 200 § 1',
    articleTitle: 'Zakaz nabywania udziałów własnych',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Sp. z o.o. co do zasady nie może nabywać ani obejmować udziałów własnych. Zakaz ten nie dotyczy:',
    options: {
      a: 'Wszystkich przypadków',
      b: 'Nabycia w drodze egzekucji na zaspokojenie roszczeń spółki oraz nabycia w celu umorzenia udziałów',
      c: 'Tylko nabycia od pracowników',
      d: 'Tylko nabycia nieodpłatnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 200 § 1 k.s.h. spółka nie może obejmować lub nabywać własnych udziałów. Wyjątkiem jest nabycie w drodze egzekucji na zaspokojenie roszczeń spółki oraz nabycie w celu umorzenia udziałów.',
    difficulty: 'hard',
    tags: ['udziały własne', 'zakaz', 'wyjątki', 'sp. z o.o.']
  },

  // ============================================================
  // SP. Z O.O. - ORGANY - SZCZEGÓŁY
  // ============================================================

  {
    id: 'ksh-777',
    article: 'Art. 202 § 1',
    articleTitle: 'Wygaśnięcie mandatu członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli umowa sp. z o.o. nie stanowi inaczej, mandat członka zarządu wygasa:',
    options: {
      a: 'Z końcem roku kalendarzowego',
      b: 'Z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji członka zarządu',
      c: 'Po upływie 3 lat',
      d: 'Po upływie 5 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 1 k.s.h. jeżeli umowa spółki nie stanowi inaczej, mandat członka zarządu wygasa z dniem odbycia zgromadzenia wspólników zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy pełnienia funkcji członka zarządu.',
    difficulty: 'hard',
    tags: ['mandat', 'wygaśnięcie', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-778',
    article: 'Art. 203 § 1',
    articleTitle: 'Odwołanie członka zarządu - roszczenia',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Odwołanie członka zarządu sp. z o.o.:',
    options: {
      a: 'Pozbawia go wszystkich roszczeń',
      b: 'Nie pozbawia go roszczeń ze stosunku pracy lub innego stosunku prawnego dotyczącego pełnienia funkcji członka zarządu',
      c: 'Automatycznie rozwiązuje umowę o pracę',
      d: 'Wymaga wypłaty odprawy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 203 § 1 k.s.h. członek zarządu może być w każdym czasie odwołany uchwałą wspólników. Nie pozbawia go to roszczeń ze stosunku pracy lub innego stosunku prawnego dotyczącego pełnienia funkcji członka zarządu.',
    difficulty: 'medium',
    tags: ['odwołanie zarządu', 'roszczenia', 'sp. z o.o.']
  },

  {
    id: 'ksh-779',
    article: 'Art. 206 § 1',
    articleTitle: 'Dane obowiązkowe w pismach sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Pisma i zamówienia handlowe sp. z o.o. składane w formie papierowej i elektronicznej powinny zawierać:',
    options: {
      a: 'Tylko firmę spółki',
      b: 'Firmę spółki, jej siedzibę i adres, oznaczenie sądu rejestrowego i numer KRS, NIP, wysokość kapitału zakładowego',
      c: 'Tylko adres spółki',
      d: 'Tylko NIP'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 206 § 1 k.s.h. pisma i zamówienia handlowe składane przez spółkę powinny zawierać: firmę spółki, jej siedzibę i adres, oznaczenie sądu rejestrowego, w którym przechowywana jest dokumentacja spółki oraz numer pod którym spółka jest wpisana do rejestru, numer identyfikacji podatkowej (NIP), wysokość kapitału zakładowego.',
    difficulty: 'medium',
    tags: ['pisma', 'dane obowiązkowe', 'sp. z o.o.']
  },

  {
    id: 'ksh-780',
    article: 'Art. 207',
    articleTitle: 'Ograniczenie zarządu a osoby trzecie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Ograniczenia uprawnień członków zarządu sp. z o.o. wobec osób trzecich:',
    options: {
      a: 'Są skuteczne po wpisie do KRS',
      b: 'Nie mają skutku prawnego wobec osób trzecich',
      c: 'Są skuteczne po zawiadomieniu kontrahenta',
      d: 'Są skuteczne tylko wobec wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 204 § 2 k.s.h. prawa członka zarządu do reprezentowania spółki nie można ograniczyć ze skutkiem prawnym wobec osób trzecich.',
    difficulty: 'medium',
    tags: ['ograniczenie zarządu', 'osoby trzecie', 'sp. z o.o.']
  },

  {
    id: 'ksh-781',
    article: 'Art. 208 § 2',
    articleTitle: 'Sprzeciw członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Każdy członek zarządu sp. z o.o. może prowadzić sprawy nieprzekraczające zakresu zwykłych czynności. Jeżeli jednak przed załatwieniem sprawy choćby jeden z pozostałych członków zarządu sprzeciwi się:',
    options: {
      a: 'Sprawa upada',
      b: 'Wymagana jest uchwała zarządu',
      c: 'Decyduje prezes zarządu',
      d: 'Decyduje zgromadzenie wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 208 § 3 k.s.h. jeżeli przed załatwieniem sprawy choćby jeden z pozostałych członków zarządu sprzeciwi się jej przeprowadzeniu lub jeżeli sprawa przekracza zakres zwykłych czynności spółki, wymagana jest uprzednia uchwała zarządu.',
    difficulty: 'medium',
    tags: ['sprzeciw', 'uchwała zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-782',
    article: 'Art. 209',
    articleTitle: 'Sprzeczność interesów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku sprzeczności interesów sp. z o.o. z interesami członka zarządu, jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób, z którymi jest powiązany osobiście, członek zarządu powinien:',
    options: {
      a: 'Poinformować wspólników',
      b: 'Wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole',
      c: 'Złożyć rezygnację',
      d: 'Głosować przeciwko'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 209 k.s.h. w przypadku sprzeczności interesów spółki z interesami członka zarządu, jego współmałżonka, krewnych i powinowatych do drugiego stopnia oraz osób, z którymi jest powiązany osobiście, członek zarządu powinien wstrzymać się od udziału w rozstrzyganiu takich spraw i może żądać zaznaczenia tego w protokole.',
    difficulty: 'hard',
    tags: ['sprzeczność interesów', 'wstrzymanie się', 'sp. z o.o.']
  },

  {
    id: 'ksh-783',
    article: 'Art. 212 § 1',
    articleTitle: 'Prawo kontroli wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo kontroli w sp. z o.o. przysługuje wspólnikowi:',
    options: {
      a: 'Tylko większościowym',
      b: 'Każdemu, może przeglądać księgi i dokumenty oraz żądać wyjaśnień od zarządu',
      c: 'Tylko posiadającym co najmniej 10% udziałów',
      d: 'Tylko członkom rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 212 § 1 k.s.h. prawo kontroli służy każdemu wspólnikowi. W tym celu wspólnik lub wspólnik z upoważnioną przez siebie osobą może w każdym czasie przeglądać księgi i dokumenty spółki, sporządzać bilans dla swego użytku lub żądać wyjaśnień od zarządu.',
    difficulty: 'easy',
    tags: ['prawo kontroli', 'wspólnik', 'sp. z o.o.']
  },

  {
    id: 'ksh-784',
    article: 'Art. 212 § 2',
    articleTitle: 'Odmowa udostępnienia informacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zarząd sp. z o.o. może odmówić wspólnikowi wyjaśnień oraz udostępnienia do wglądu ksiąg i dokumentów, jeżeli:',
    options: {
      a: 'Nie ma ku temu podstaw',
      b: 'Istnieje uzasadniona obawa, że wspólnik wykorzysta je w celach sprzecznych z interesem spółki i przez to wyrządzi spółce znaczną szkodę',
      c: 'Wspólnik ma mniej niż 10% udziałów',
      d: 'Wspólnik nie jest członkiem rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 212 § 2 k.s.h. zarząd może odmówić wspólnikowi wyjaśnień oraz udostępnienia do wglądu ksiąg i dokumentów spółki, jeżeli istnieje uzasadniona obawa, że wspólnik wykorzysta je w celach sprzecznych z interesem spółki i przez to wyrządzi spółce znaczną szkodę.',
    difficulty: 'hard',
    tags: ['odmowa informacji', 'uzasadniona obawa', 'sp. z o.o.']
  },

  {
    id: 'ksh-785',
    article: 'Art. 213 § 1',
    articleTitle: 'Ustanowienie RN/KR',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Umowa sp. z o.o. może ustanowić radę nadzorczą lub komisję rewizyjną albo oba te organy. W przypadku ustanowienia obu organów:',
    options: {
      a: 'Komisja rewizyjna przejmuje uprawnienia RN',
      b: 'Umowa spółki może przekazać komisji rewizyjnej stały nadzór nad działalnością spółki, wyłączając to uprawnienie rady nadzorczej',
      c: 'RN traci wszystkie uprawnienia',
      d: 'Oba organy mają identyczne kompetencje'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 213 § 1 k.s.h. umowa spółki może ustanowić radę nadzorczą lub komisję rewizyjną albo oba te organy. W przypadku ustanowienia rady nadzorczej lub komisji rewizyjnej postanowienia niniejszego działu stosuje się odpowiednio do funkcjonowania tych organów.',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'komisja rewizyjna', 'sp. z o.o.']
  },

  {
    id: 'ksh-786',
    article: 'Art. 216 § 1',
    articleTitle: 'Kadencja RN w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek rady nadzorczej sp. z o.o. może być powołany:',
    options: {
      a: 'Tylko na rok',
      b: 'Na rok, a jeżeli umowa spółki nie stanowi inaczej mandat wygasa z dniem ZW zatwierdzającego sprawozdanie finansowe za pierwszy pełny rok obrotowy',
      c: 'Na 3 lata',
      d: 'Na 5 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 216 § 1 k.s.h. członek rady nadzorczej i komisji rewizyjnej jest powoływany i odwoływany uchwałą wspólników. Kadencję określa umowa spółki.',
    difficulty: 'medium',
    tags: ['kadencja', 'rada nadzorcza', 'sp. z o.o.']
  },

  {
    id: 'ksh-787',
    article: 'Art. 219 § 1',
    articleTitle: 'Uprawnienia rady nadzorczej',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza sp. z o.o. sprawuje stały nadzór nad działalnością spółki:',
    options: {
      a: 'Tylko w sprawach finansowych',
      b: 'We wszystkich dziedzinach działalności spółki',
      c: 'Tylko w sprawach personalnych',
      d: 'Tylko w sprawach strategicznych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 219 § 1 k.s.h. rada nadzorcza sprawuje stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'nadzór', 'sp. z o.o.']
  },

  {
    id: 'ksh-788',
    article: 'Art. 220',
    articleTitle: 'Umowa między spółką a RN',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W umowie między sp. z o.o. a członkiem rady nadzorczej spółkę reprezentuje:',
    options: {
      a: 'Zarząd',
      b: 'Pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Inni członkowie rady nadzorczej',
      d: 'Prokurent'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 220 k.s.h. w umowie między spółką a członkiem rady nadzorczej, jak również w sporze z nim, spółkę reprezentuje pełnomocnik powołany uchwałą zgromadzenia wspólników.',
    difficulty: 'hard',
    tags: ['umowa z RN', 'pełnomocnik', 'sp. z o.o.']
  },

  // ============================================================
  // S.A. - PROCEDURY SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-789',
    article: 'Art. 304 § 1',
    articleTitle: 'Obligatoryjne elementy statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Statut S.A. powinien określać OBLIGATORYJNIE m.in.:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę i siedzibę, przedmiot działalności, czas trwania (jeśli oznaczony), wysokość kapitału zakładowego, wartość nominalną akcji i ich liczbę, liczbę akcji poszczególnych rodzajów, nazwiska i imiona (firmy) założycieli, liczbę członków zarządu i rady nadzorczej',
      c: 'Tylko kapitał zakładowy',
      d: 'Tylko przedmiot działalności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 304 § 1 k.s.h. statut spółki akcyjnej powinien określać: firmę i siedzibę spółki, przedmiot działalności spółki, czas trwania spółki (jeżeli jest oznaczony), wysokość kapitału zakładowego oraz kwotę wpłaconą przed zarejestrowaniem na pokrycie kapitału zakładowego, wartość nominalną akcji i ich liczbę ze wskazaniem, czy akcje są imienne, czy na okaziciela, liczbę akcji poszczególnych rodzajów i związane z nimi uprawnienia, nazwiska i imiona albo firmy (nazwy) założycieli, liczbę członków zarządu i rady nadzorczej albo co najmniej minimalną lub maksymalną liczbę członków tych organów.',
    difficulty: 'hard',
    tags: ['statut', 'elementy obligatoryjne', 'S.A.']
  },

  {
    id: 'ksh-790',
    article: 'Art. 305 § 1',
    articleTitle: 'Statut - postanowienia dodatkowe',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Statut S.A. powinien również zawierać postanowienia dotyczące:',
    options: {
      a: 'Tylko organów spółki',
      b: 'Liczby i rodzajów tytułów uczestnictwa w zysku lub w podziale majątku spółki oraz związanych z nimi praw (jeśli mają być wprowadzone), wszelkich związanych z akcjami obowiązków świadczenia na rzecz spółki (jeśli mają być wprowadzone), sposobu pokrycia strat (jeśli inny niż ustawowy)',
      c: 'Tylko praw akcjonariuszy',
      d: 'Tylko obowiązków zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 304 § 2 k.s.h. statut powinien również zawierać, pod rygorem bezskuteczności wobec spółki, postanowienia dotyczące liczby i rodzajów tytułów uczestnictwa w zysku lub w podziale majątku spółki oraz związanych z nimi praw, jeżeli mają być wprowadzone.',
    difficulty: 'hard',
    tags: ['statut', 'postanowienia dodatkowe', 'S.A.']
  },

  {
    id: 'ksh-791',
    article: 'Art. 306',
    articleTitle: 'S.A. w organizacji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'S.A. w organizacji może we własnym imieniu nabywać prawa, w tym własność nieruchomości i inne prawa rzeczowe, zaciągać zobowiązania:',
    options: {
      a: 'Tylko za zgodą sądu',
      b: 'Tak, bez ograniczeń',
      c: 'Tylko za zgodą założycieli',
      d: 'Nie może zaciągać zobowiązań'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 306 k.s.h. spółka akcyjna w organizacji może we własnym imieniu nabywać prawa, w tym własność nieruchomości i inne prawa rzeczowe, zaciągać zobowiązania, pozywać i być pozywana.',
    difficulty: 'medium',
    tags: ['S.A. w organizacji', 'zdolność prawna', 'S.A.']
  },

  {
    id: 'ksh-792',
    article: 'Art. 309 § 1',
    articleTitle: 'Objęcie wszystkich akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje S.A. obejmowane przy zakładaniu spółki:',
    options: {
      a: 'Mogą być obejmowane stopniowo',
      b: 'Powinny być wszystkie objęte przed zarejestrowaniem spółki',
      c: 'Mogą być obejmowane w ciągu roku od rejestracji',
      d: 'Muszą być objęte tylko w 50%'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 309 § 1 k.s.h. akcje obejmowane w związku z zawiązywaniem spółki powinny być objęte przed zarejestrowaniem spółki.',
    difficulty: 'medium',
    tags: ['objęcie akcji', 'zawiązanie', 'S.A.']
  },

  {
    id: 'ksh-793',
    article: 'Art. 309 § 3',
    articleTitle: 'Agio w S.A. - wpłata',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli akcje S.A. są obejmowane po cenie wyższej od wartości nominalnej (z agio), nadwyżka powinna być uiszczona:',
    options: {
      a: 'W ciągu roku od rejestracji',
      b: 'Całkowicie przed zarejestrowaniem spółki',
      c: 'W ciągu 6 miesięcy od rejestracji',
      d: 'W terminie określonym przez zarząd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. jeżeli akcje są obejmowane po cenie wyższej od wartości nominalnej, nadwyżka powinna być uiszczona całkowicie przed zarejestrowaniem spółki.',
    difficulty: 'hard',
    tags: ['agio', 'wpłata', 'S.A.']
  },

  {
    id: 'ksh-794',
    article: 'Art. 310 § 1',
    articleTitle: 'Akt zawiązania S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zawiązanie S.A. następuje z chwilą:',
    options: {
      a: 'Sporządzenia statutu',
      b: 'Objęcia wszystkich akcji',
      c: 'Wpisu do rejestru',
      d: 'Powołania zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 310 § 1 k.s.h. zawiązanie spółki akcyjnej następuje z chwilą objęcia wszystkich akcji.',
    difficulty: 'easy',
    tags: ['zawiązanie', 'objęcie akcji', 'S.A.']
  },

  {
    id: 'ksh-795',
    article: 'Art. 312 § 1',
    articleTitle: 'Badanie aportów przez biegłego',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wkłady niepieniężne do S.A. powinny być zbadane przez:',
    options: {
      a: 'Zarząd',
      b: 'Biegłego rewidenta wybranego przez założycieli',
      c: 'Biegłego rewidenta wyznaczonego przez sąd rejestrowy',
      d: 'Radę nadzorczą'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 312 § 1 k.s.h. wartość wkładów niepieniężnych powinna być zbadana przez biegłego (biegłych) wybranego przez założycieli lub nabywców akcji i wyznaczonego przez sąd rejestrowy.',
    difficulty: 'medium',
    tags: ['aport', 'biegły rewident', 'sąd rejestrowy', 'S.A.']
  },

  {
    id: 'ksh-796',
    article: 'Art. 316',
    articleTitle: 'Zgłoszenie S.A. do rejestru',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zgłoszenie S.A. do rejestru powinno zawierać:',
    options: {
      a: 'Tylko dane zarządu',
      b: 'Firmę, siedzibę i adres spółki, przedmiot działalności, wysokość kapitału zakładowego, liczbę i wartość nominalną akcji, liczbę akcji uprzywilejowanych i rodzaj uprzywilejowania, dane członków zarządu i sposób reprezentowania',
      c: 'Tylko firmę i siedzibę',
      d: 'Tylko kapitał zakładowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 318 k.s.h. zgłoszenie spółki akcyjnej do sądu rejestrowego powinno zawierać: firmę, siedzibę i adres spółki, przedmiot działalności spółki, wysokość kapitału zakładowego, liczbę i wartość nominalną akcji, liczbę akcji uprzywilejowanych i rodzaj uprzywilejowania, dane członków zarządu oraz sposób reprezentowania spółki.',
    difficulty: 'medium',
    tags: ['zgłoszenie do rejestru', 'dane', 'S.A.']
  },

  {
    id: 'ksh-797',
    article: 'Art. 327',
    articleTitle: 'Jednoosobowa S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W S.A., w której jedyny akcjonariusz jest zarazem jedynym członkiem zarządu, czynność prawna między tym akcjonariuszem a spółką wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z datą pewną',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 303 § 2 w zw. z art. 210 § 2 k.s.h. w przypadku gdy jedyny akcjonariusz jest zarazem jedynym członkiem zarządu, czynność prawna między akcjonariuszem a reprezentowaną przez niego spółką wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['jednoosobowa S.A.', 'akt notarialny', 'S.A.']
  },

  // ============================================================
  // S.A. - ORGANY - SZCZEGÓŁY
  // ============================================================

  {
    id: 'ksh-798',
    article: 'Art. 369 § 4',
    articleTitle: 'Ponowne powołanie przed upływem kadencji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Ponowne powołanie tej samej osoby na członka zarządu S.A. może nastąpić:',
    options: {
      a: 'W każdym czasie',
      b: 'Nie wcześniej niż na rok przed upływem bieżącej kadencji członka zarządu',
      c: 'Tylko po upływie kadencji',
      d: 'Tylko za zgodą rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 369 § 4 k.s.h. ponowne powołanie tej samej osoby na członka zarządu może nastąpić nie wcześniej niż na rok przed upływem bieżącej kadencji członka zarządu.',
    difficulty: 'hard',
    tags: ['ponowne powołanie', 'kadencja', 'zarząd', 'S.A.']
  },

  {
    id: 'ksh-799',
    article: 'Art. 370 § 2',
    articleTitle: 'Odwołanie zarządu przez WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Jeżeli statut S.A. nie stanowi inaczej, walne zgromadzenie może odwołać lub zawiesić w czynnościach członka zarządu:',
    options: {
      a: 'Tylko z ważnych powodów',
      b: 'W każdym czasie, bez względu na to, przez kogo został powołany',
      c: 'Tylko za zgodą rady nadzorczej',
      d: 'Tylko członków przez siebie powołanych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 370 § 2 k.s.h. jeżeli statut nie stanowi inaczej, walne zgromadzenie może odwołać lub zawiesić w czynnościach członka zarządu.',
    difficulty: 'medium',
    tags: ['odwołanie zarządu', 'walne zgromadzenie', 'S.A.']
  },

  {
    id: 'ksh-800',
    article: 'Art. 372 § 1',
    articleTitle: 'Prowadzenie spraw S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Sprawy przekraczające zakres zwykłych czynności S.A. wymagają:',
    options: {
      a: 'Decyzji prezesa zarządu',
      b: 'Uchwały zarządu, jeżeli statut nie stanowi inaczej',
      c: 'Zgody rady nadzorczej',
      d: 'Uchwały walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 371 § 2 k.s.h. sprawy przekraczające zakres zwykłych czynności spółki wymagają uchwały zarządu, jeżeli statut nie stanowi inaczej.',
    difficulty: 'medium',
    tags: ['prowadzenie spraw', 'uchwała zarządu', 'S.A.']
  },

  {
    id: 'ksh-801',
    article: 'Art. 375',
    articleTitle: 'Sprzeczność interesów w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W przypadku sprzeczności interesów S.A. z interesami członka zarządu, członek zarządu powinien:',
    options: {
      a: 'Poinformować akcjonariuszy',
      b: 'Ujawnić sprzeczność interesów i wstrzymać się od udziału w rozstrzyganiu takich spraw',
      c: 'Złożyć rezygnację',
      d: 'Głosować przeciwko'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 377 § 1 k.s.h. w przypadku sprzeczności interesów spółki z interesami członka zarządu, członek zarządu powinien ujawnić tę sprzeczność i wstrzymać się od udziału w rozstrzyganiu takich spraw.',
    difficulty: 'medium',
    tags: ['sprzeczność interesów', 'wstrzymanie się', 'S.A.']
  },

  {
    id: 'ksh-802',
    article: 'Art. 382 § 3',
    articleTitle: 'Szczególne obowiązki RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Do szczególnych obowiązków rady nadzorczej S.A. należy:',
    options: {
      a: 'Prowadzenie spraw spółki',
      b: 'Ocena sprawozdań zarządu i sprawozdania finansowego, wniosku zarządu co do podziału zysku lub pokrycia straty, oraz składanie walnemu zgromadzeniu sprawozdania z tej oceny',
      c: 'Reprezentowanie spółki',
      d: 'Prowadzenie rachunkowości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 382 § 3 k.s.h. do szczególnych obowiązków rady nadzorczej należy ocena sprawozdań zarządu z działalności spółki oraz sprawozdania finansowego za ubiegły rok obrotowy, w zakresie ich zgodności z księgami i dokumentami, jak i ze stanem faktycznym, oraz wniosków zarządu dotyczących podziału zysku albo pokrycia straty, a także składanie walnemu zgromadzeniu corocznego pisemnego sprawozdania z wyników tej oceny.',
    difficulty: 'medium',
    tags: ['obowiązki RN', 'ocena sprawozdań', 'S.A.']
  },

  {
    id: 'ksh-803',
    article: 'Art. 383 § 1',
    articleTitle: 'Delegowanie członka RN do zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może delegować swoich członków do czasowego wykonywania czynności członków zarządu. Maksymalny okres delegowania wynosi:',
    options: {
      a: 'Miesiąc',
      b: 'Trzy miesiące',
      c: 'Sześć miesięcy',
      d: 'Rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 383 § 1 k.s.h. do kompetencji rady nadzorczej należy delegowanie członków rady nadzorczej do czasowego wykonywania czynności członków zarządu na okres nie dłuższy niż trzy miesiące.',
    difficulty: 'hard',
    tags: ['delegowanie RN', 'zarząd', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-804',
    article: 'Art. 387 § 1',
    articleTitle: 'Zakaz łączenia funkcji w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członkiem rady nadzorczej S.A. NIE może być:',
    options: {
      a: 'Akcjonariusz mniejszościowy',
      b: 'Członek zarządu, prokurent, likwidator, kierownik oddziału lub zakładu oraz zatrudniony w spółce główny księgowy, radca prawny lub adwokat',
      c: 'Osoba spoza grona akcjonariuszy',
      d: 'Osoba prawna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 387 § 1 k.s.h. członkiem rady nadzorczej nie może być członek zarządu, prokurent, likwidator, kierownik oddziału lub zakładu oraz zatrudniony w spółce główny księgowy, radca prawny lub adwokat.',
    difficulty: 'medium',
    tags: ['zakaz łączenia funkcji', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-805',
    article: 'Art. 389 § 1',
    articleTitle: 'Zwoływanie posiedzeń RN',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Przewodniczący rady nadzorczej S.A. jest obowiązany zwołać posiedzenie rady nadzorczej:',
    options: {
      a: 'Tylko z własnej inicjatywy',
      b: 'Na wniosek zarządu lub członka rady nadzorczej, złożony na piśmie z podaniem proponowanego porządku obrad',
      c: 'Tylko na wniosek walnego zgromadzenia',
      d: 'Tylko raz w roku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 389 § 1 k.s.h. przewodniczący rady nadzorczej jest obowiązany zwołać posiedzenie rady nadzorczej na pisemny wniosek zarządu lub członka rady nadzorczej.',
    difficulty: 'medium',
    tags: ['posiedzenie RN', 'zwoływanie', 'S.A.']
  },

  {
    id: 'ksh-806',
    article: 'Art. 390 § 1',
    articleTitle: 'Kworum RN S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. podejmuje uchwały, jeżeli na posiedzeniu jest obecna:',
    options: {
      a: 'Większość członków',
      b: 'Co najmniej połowa jej członków, a wszyscy jej członkowie zostali zaproszeni',
      c: 'Co najmniej 2/3 członków',
      d: 'Wszyscy członkowie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 390 § 1 k.s.h. rada nadzorcza podejmuje uchwały, jeżeli na posiedzeniu jest obecna co najmniej połowa jej członków, a wszyscy jej członkowie zostali zaproszeni.',
    difficulty: 'hard',
    tags: ['kworum', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-807',
    article: 'Art. 398',
    articleTitle: 'Nadzwyczajne WZ - kiedy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Nadzwyczajne walne zgromadzenie S.A. zwołuje się:',
    options: {
      a: 'Raz w roku',
      b: 'W przypadkach określonych w kodeksie lub statucie, oraz gdy organy lub osoby uprawnione do zwoływania uznają to za wskazane',
      c: 'Co kwartał',
      d: 'Tylko w przypadku likwidacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 398 k.s.h. nadzwyczajne walne zgromadzenie zwołuje się w przypadkach określonych w niniejszym dziale lub w statucie, a także gdy organy lub osoby uprawnione do zwoływania walnego zgromadzenia uznają to za wskazane.',
    difficulty: 'easy',
    tags: ['nadzwyczajne WZ', 'zwoływanie', 'S.A.']
  },

  {
    id: 'ksh-808',
    article: 'Art. 399 § 2',
    articleTitle: 'Zwoływanie WZ przez RN',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. może zwołać zwyczajne walne zgromadzenie:',
    options: {
      a: 'Zawsze',
      b: 'Jeżeli zarząd nie zwoła go w terminie określonym w ustawie lub statucie',
      c: 'Tylko za zgodą zarządu',
      d: 'Tylko na wniosek akcjonariuszy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 399 § 2 k.s.h. rada nadzorcza może zwołać zwyczajne walne zgromadzenie, jeżeli zarząd nie zwoła go w terminie określonym w art. 395 § 1 lub w statucie, oraz nadzwyczajne walne zgromadzenie, jeżeli zwołanie go uzna za wskazane.',
    difficulty: 'medium',
    tags: ['zwoływanie WZ', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-809',
    article: 'Art. 401 § 1',
    articleTitle: 'Umieszczenie spraw w porządku obrad',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusze S.A. reprezentujący co najmniej 1/20 kapitału zakładowego mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno być zgłoszone zarządowi:',
    options: {
      a: 'Na tydzień przed terminem WZ',
      b: 'Nie później niż na 21 dni przed wyznaczonym terminem zgromadzenia',
      c: 'Na 3 dni przed terminem WZ',
      d: 'W dniu WZ'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 401 § 1 k.s.h. akcjonariusz lub akcjonariusze reprezentujący co najmniej jedną dwudziestą kapitału zakładowego mogą żądać umieszczenia określonych spraw w porządku obrad najbliższego walnego zgromadzenia. Żądanie powinno zostać zgłoszone zarządowi nie później niż na 21 dni przed wyznaczonym terminem zgromadzenia.',
    difficulty: 'hard',
    tags: ['porządek obrad', 'termin', '1/20 kapitału', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-810',
    article: 'Art. 403',
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

  // ============================================================
  // ZESTAWIENIA I PORÓWNANIA
  // ============================================================

  {
    id: 'ksh-811',
    article: 'Zestawienie',
    articleTitle: 'Terminy rejestracji',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Terminy na zgłoszenie spółki do rejestru są identyczne dla sp. z o.o. i S.A.:',
    options: {
      a: 'Tak, obie 3 miesiące',
      b: 'Tak, obie 6 miesięcy',
      c: 'Nie, sp. z o.o. 6 miesięcy, S.A. 3 miesiące',
      d: 'Nie, sp. z o.o. 3 miesiące, S.A. 6 miesięcy'
    },
    correct: 'b',
    explanation: 'Zarówno sp. z o.o. (art. 164 § 1), jak i S.A. (art. 325 § 1) powinny być zgłoszone do rejestru w terminie 6 miesięcy od dnia zawarcia umowy spółki / zawiązania spółki.',
    difficulty: 'medium',
    tags: ['termin rejestracji', 'porównanie']
  },

  {
    id: 'ksh-812',
    article: 'Zestawienie',
    articleTitle: 'Formy dokumentów założycielskich',
    section: 'Zestawienia',
    subsection: 'Formy',
    question: 'Forma dokumentu założycielskiego sp. z o.o. i S.A.:',
    options: {
      a: 'Sp. z o.o.: pisemna, S.A.: akt notarialny',
      b: 'Obie: akt notarialny',
      c: 'Sp. z o.o.: akt notarialny, S.A.: pisemna',
      d: 'Obie: forma pisemna z podpisami poświadczonymi notarialnie'
    },
    correct: 'b',
    explanation: 'Zarówno umowa sp. z o.o. (art. 157 § 2), jak i statut S.A. (art. 301 § 2) wymagają formy aktu notarialnego.',
    difficulty: 'easy',
    tags: ['forma', 'akt notarialny', 'porównanie']
  },

  {
    id: 'ksh-813',
    article: 'Zestawienie',
    articleTitle: 'Wpłaty na kapitał przed rejestracją',
    section: 'Zestawienia',
    subsection: 'Kapitał',
    question: 'Minimalna wpłata na kapitał zakładowy przed rejestracją: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 100%, S.A.: 100%',
      b: 'Sp. z o.o.: 100%, S.A.: 25%',
      c: 'Sp. z o.o.: 50%, S.A.: 25%',
      d: 'Sp. z o.o.: 25%, S.A.: 25%'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. cały kapitał zakładowy musi być pokryty przed rejestracją (art. 163 pkt 2). W S.A. akcje pieniężne muszą być opłacone co najmniej w 1/4 przed rejestracją (art. 309 § 3).',
    difficulty: 'hard',
    tags: ['wpłata na kapitał', 'rejestracja', 'porównanie', 'liczby']
  },

  {
    id: 'ksh-814',
    article: 'Zestawienie',
    articleTitle: 'Badanie wkładów niepieniężnych',
    section: 'Zestawienia',
    subsection: 'Aporty',
    question: 'Obowiązek badania wkładów niepieniężnych przez biegłego rewidenta:',
    options: {
      a: 'Dotyczy obu spółek',
      b: 'Dotyczy tylko S.A.',
      c: 'Dotyczy tylko sp. z o.o.',
      d: 'Nie dotyczy żadnej spółki'
    },
    correct: 'b',
    explanation: 'W S.A. wartość wkładów niepieniężnych powinna być zbadana przez biegłego rewidenta wyznaczonego przez sąd (art. 312 § 1). W sp. z o.o. nie ma takiego obowiązku.',
    difficulty: 'medium',
    tags: ['aport', 'biegły rewident', 'porównanie']
  },

  {
    id: 'ksh-815',
    article: 'Zestawienie',
    articleTitle: 'Kto powołuje zarząd domyślnie',
    section: 'Zestawienia',
    subsection: 'Zarząd',
    question: 'Kto domyślnie powołuje zarząd: sp. z o.o. vs S.A.:',
    options: {
      a: 'Obie: walne zgromadzenie/zgromadzenie wspólników',
      b: 'Obie: rada nadzorcza',
      c: 'Sp. z o.o.: wspólnicy, S.A.: rada nadzorcza',
      d: 'Sp. z o.o.: rada nadzorcza, S.A.: walne zgromadzenie'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. członków zarządu powołują wspólnicy (art. 201 § 4), w S.A. - rada nadzorcza (art. 368 § 4), chyba że umowa/statut stanowi inaczej.',
    difficulty: 'medium',
    tags: ['powoływanie zarządu', 'porównanie']
  },

  {
    id: 'ksh-816',
    article: 'Zestawienie',
    articleTitle: 'Obligatoryjność rady nadzorczej',
    section: 'Zestawienia',
    subsection: 'Rada nadzorcza',
    question: 'Obligatoryjność rady nadzorczej w spółkach kapitałowych:',
    options: {
      a: 'Obligatoryjna w obu spółkach',
      b: 'Fakultatywna w obu spółkach',
      c: 'Sp. z o.o.: warunkowo (kapitał > 500.000 zł i > 25 wspólników), S.A.: zawsze',
      d: 'Sp. z o.o.: zawsze, S.A.: warunkowo'
    },
    correct: 'c',
    explanation: 'W S.A. rada nadzorcza jest zawsze obligatoryjna (art. 381). W sp. z o.o. jest obligatoryjna tylko gdy kapitał > 500.000 zł i > 25 wspólników (art. 213 § 2).',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'obligatoryjność', 'porównanie']
  },

  {
    id: 'ksh-817',
    article: 'Zestawienie',
    articleTitle: 'Kadencja organów',
    section: 'Zestawienia',
    subsection: 'Kadencja',
    question: 'Maksymalna kadencja członka zarządu: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: brak limitu ustawowego, S.A.: max 5 lat',
      b: 'Obie: max 5 lat',
      c: 'Obie: max 3 lata',
      d: 'Sp. z o.o.: max 3 lata, S.A.: max 5 lat'
    },
    correct: 'a',
    explanation: 'W S.A. kadencja członka zarządu nie może być dłuższa niż 5 lat (art. 369 § 1). W sp. z o.o. brak jest ustawowego ograniczenia kadencji - określa to umowa spółki.',
    difficulty: 'hard',
    tags: ['kadencja', 'zarząd', 'porównanie']
  },

  {
    id: 'ksh-818',
    article: 'Zestawienie',
    articleTitle: 'Zmiana dokumentu założycielskiego',
    section: 'Zestawienia',
    subsection: 'Większości',
    question: 'Większość wymagana do zmiany umowy sp. z o.o. vs statutu S.A.:',
    options: {
      a: 'Sp. z o.o.: 2/3, S.A.: 3/4',
      b: 'Obie: 2/3',
      c: 'Obie: 3/4',
      d: 'Sp. z o.o.: 3/4, S.A.: 2/3'
    },
    correct: 'a',
    explanation: 'Zmiana umowy sp. z o.o. wymaga większości 2/3 głosów (art. 246 § 1). Zmiana statutu S.A. wymaga większości 3/4 głosów (art. 415 § 1).',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'zmiana statutu', 'większość', 'porównanie']
  },

  {
    id: 'ksh-819',
    article: 'Zestawienie',
    articleTitle: 'Żądanie zwołania zgromadzenia',
    section: 'Zestawienia',
    subsection: 'Prawa wspólników/akcjonariuszy',
    question: 'Próg kapitałowy do żądania zwołania nadzwyczajnego zgromadzenia:',
    options: {
      a: 'Sp. z o.o.: 1/10, S.A.: 1/10',
      b: 'Sp. z o.o.: 1/10, S.A.: 1/20',
      c: 'Sp. z o.o.: 1/20, S.A.: 1/10',
      d: 'Obie: 1/20'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. wspólnicy reprezentujący 1/10 kapitału mogą żądać zwołania zgromadzenia (art. 236 § 1). W S.A. akcjonariusze reprezentujący 1/20 kapitału (art. 400 § 1).',
    difficulty: 'hard',
    tags: ['żądanie zwołania', 'porównanie', 'liczby']
  },

  {
    id: 'ksh-820',
    article: 'Zestawienie',
    articleTitle: 'Termin zawiadomienia o zgromadzeniu',
    section: 'Zestawienia',
    subsection: 'Terminy',
    question: 'Minimalny termin zawiadomienia o zgromadzeniu: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 1 tydzień, S.A.: 2 tygodnie',
      b: 'Sp. z o.o.: 2 tygodnie, S.A.: 3 tygodnie',
      c: 'Obie: 2 tygodnie',
      d: 'Obie: 3 tygodnie'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. zawiadomienie wysyła się co najmniej 2 tygodnie przed zgromadzeniem (art. 238 § 1). W S.A. ogłoszenie powinno być dokonane co najmniej 3 tygodnie przed WZ (art. 402 § 1).',
    difficulty: 'medium',
    tags: ['termin zawiadomienia', 'porównanie', 'liczby']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART10_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART10.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART10.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART10.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART10.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    spzoo: KSH_EXAM_QUESTIONS_PART10.filter(q => q.section.includes('Spółka z o.o.')).length,
    sa: KSH_EXAM_QUESTIONS_PART10.filter(q => q.section.includes('Spółka akcyjna')).length,
    zestawienia: KSH_EXAM_QUESTIONS_PART10.filter(q => q.section.includes('Zestawienia')).length,
  }
};

console.log('KSH Part 10 loaded:', PART10_STATS);
