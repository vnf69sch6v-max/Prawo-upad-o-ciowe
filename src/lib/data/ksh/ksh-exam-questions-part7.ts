// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 7 - 100 pytań: SP. Z O.O. i S.A. - Pogłębione
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART7: ExamQuestion[] = [

  // ============================================================
  // SP. Z O.O. - PODWYŻSZENIE KAPITAŁU ZAKŁADOWEGO
  // ============================================================

  {
    id: 'ksh-576',
    article: 'Art. 257 § 1',
    articleTitle: 'Sposoby podwyższenia kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. może nastąpić przez:',
    options: {
      a: 'Tylko utworzenie nowych udziałów',
      b: 'Tylko podwyższenie wartości nominalnej udziałów istniejących',
      c: 'Utworzenie nowych udziałów lub podwyższenie wartości nominalnej udziałów istniejących',
      d: 'Tylko emisję obligacji zamiennych'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 257 § 2 k.s.h. podwyższenie kapitału zakładowego następuje przez podwyższenie wartości nominalnej udziałów istniejących lub ustanowienie nowych.',
    difficulty: 'easy',
    tags: ['podwyższenie kapitału', 'udziały', 'sp. z o.o.']
  },

  {
    id: 'ksh-577',
    article: 'Art. 257 § 1',
    articleTitle: 'Forma podwyższenia kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. wymaga:',
    options: {
      a: 'Tylko uchwały wspólników',
      b: 'Zmiany umowy spółki',
      c: 'Zgody sądu rejestrowego',
      d: 'Zgody wszystkich wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 257 § 1 k.s.h. podwyższenie kapitału zakładowego wymaga zmiany umowy spółki.',
    difficulty: 'easy',
    tags: ['podwyższenie kapitału', 'zmiana umowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-578',
    article: 'Art. 257 § 3',
    articleTitle: 'Podwyższenie bez zmiany umowy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. może nastąpić BEZ zmiany umowy spółki, jeżeli:',
    options: {
      a: 'Wyrazi na to zgodę zarząd',
      b: 'Dotychczasowe postanowienia umowy przewidują maksymalną wysokość i termin podwyższenia',
      c: 'Wspólnicy jednomyślnie wyrażą zgodę',
      d: 'Nie jest to możliwe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 257 § 3 k.s.h. podwyższenie kapitału zakładowego może nastąpić bez zmiany umowy spółki, jeżeli umowa stanowi o maksymalnej wysokości podwyższenia kapitału zakładowego i terminie podwyższenia.',
    difficulty: 'hard',
    tags: ['podwyższenie kapitału', 'bez zmiany umowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-579',
    article: 'Art. 258 § 1',
    articleTitle: 'Prawo pierwszeństwa',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Dotychczasowi wspólnicy sp. z o.o. mają prawo pierwszeństwa do objęcia nowych udziałów:',
    options: {
      a: 'Zawsze bezwarunkowo',
      b: 'W stosunku do swoich dotychczasowych udziałów, chyba że umowa lub uchwała stanowi inaczej',
      c: 'Tylko jeśli mają więcej niż 10% udziałów',
      d: 'Tylko za zgodą zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 258 § 1 k.s.h. jeżeli umowa spółki lub uchwała o podwyższeniu kapitału nie stanowi inaczej, dotychczasowi wspólnicy mają prawo pierwszeństwa do objęcia nowych udziałów w podwyższonym kapitale zakładowym w stosunku do swoich dotychczasowych udziałów.',
    difficulty: 'medium',
    tags: ['prawo pierwszeństwa', 'podwyższenie kapitału', 'sp. z o.o.']
  },

  {
    id: 'ksh-580',
    article: 'Art. 259',
    articleTitle: 'Oświadczenie o objęciu udziałów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Oświadczenie dotychczasowego wspólnika o objęciu nowego udziału przy podwyższeniu kapitału sp. z o.o. wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej',
      c: 'Aktu notarialnego',
      d: 'Pisemnej z podpisem notarialnie poświadczonym'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 259 k.s.h. oświadczenie dotychczasowego wspólnika o objęciu nowego udziału bądź udziałów lub o objęciu podwyższenia wartości istniejącego udziału bądź udziałów wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['oświadczenie', 'forma', 'akt notarialny', 'sp. z o.o.']
  },

  {
    id: 'ksh-581',
    article: 'Art. 260 § 1',
    articleTitle: 'Podwyższenie ze środków spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. ze środków spółki (kapitału zapasowego lub rezerwowego) może nastąpić:',
    options: {
      a: 'Bez żadnych ograniczeń',
      b: 'Tylko ze środków, które mogą być przeznaczone do podziału między wspólników',
      c: 'Tylko z kapitału zapasowego',
      d: 'Tylko za zgodą sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 260 § 1 k.s.h. uchwałą wspólników o zmianie umowy spółki można podwyższyć kapitał zakładowy, przeznaczając na ten cel środki z kapitału zapasowego lub kapitałów (funduszy) rezerwowych utworzonych z zysku spółki (podwyższenie kapitału zakładowego ze środków spółki).',
    difficulty: 'hard',
    tags: ['podwyższenie ze środków spółki', 'kapitał zapasowy', 'sp. z o.o.']
  },

  // ============================================================
  // SP. Z O.O. - OBNIŻENIE KAPITAŁU ZAKŁADOWEGO
  // ============================================================

  {
    id: 'ksh-582',
    article: 'Art. 263 § 1',
    articleTitle: 'Uchwała o obniżeniu kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Uchwała o obniżeniu kapitału zakładowego sp. z o.o. powinna określać:',
    options: {
      a: 'Tylko wysokość, o jaką kapitał ma być obniżony',
      b: 'Wysokość, o jaką kapitał zakładowy ma być obniżony, oraz sposób obniżenia',
      c: 'Tylko sposób obniżenia',
      d: 'Tylko cel obniżenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 263 § 1 k.s.h. uchwała o obniżeniu kapitału zakładowego powinna określać wysokość, o jaką kapitał zakładowy ma być obniżony, oraz sposób jego obniżenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-583',
    article: 'Art. 264 § 1',
    articleTitle: 'Wezwanie wierzycieli',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'O uchwalonym obniżeniu kapitału zakładowego sp. z o.o. zarząd niezwłocznie ogłasza, wzywając wierzycieli spółki do wniesienia sprzeciwu w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Dwóch miesięcy od dnia ogłoszenia',
      c: 'Trzech miesięcy od dnia ogłoszenia',
      d: 'Sześciu miesięcy od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 264 § 1 k.s.h. o uchwalonym obniżeniu kapitału zakładowego zarząd niezwłocznie ogłasza, wzywając wierzycieli spółki do wniesienia sprzeciwu w terminie trzech miesięcy.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'wierzyciele', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-584',
    article: 'Art. 264 § 2',
    articleTitle: 'Skutek sprzeciwu wierzyciela',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Wierzyciele sp. z o.o., którzy w terminie wnieśli sprzeciw wobec obniżenia kapitału:',
    options: {
      a: 'Blokują obniżenie kapitału',
      b: 'Powinni być przez spółkę zaspokojeni lub zabezpieczeni',
      c: 'Mają prawo do odszkodowania',
      d: 'Mogą żądać rozwiązania spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 264 § 2 k.s.h. wierzyciele, którzy w tym terminie zgłosili sprzeciw, powinni być przez spółkę zaspokojeni lub zabezpieczeni.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'sprzeciw wierzyciela', 'sp. z o.o.']
  },

  {
    id: 'ksh-585',
    article: 'Art. 265 § 1',
    articleTitle: 'Obniżenie bez procedury ochronnej',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Procedury ochrony wierzycieli przy obniżeniu kapitału sp. z o.o. NIE stosuje się, gdy:',
    options: {
      a: 'Obniżenie następuje w celu pokrycia strat',
      b: 'Obniżenie następuje w celu wypłaty dywidendy',
      c: 'Wspólnicy wyrażą zgodę',
      d: 'Zawsze się stosuje'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 265 k.s.h. przepisów o ochronie wierzycieli nie stosuje się, jeżeli obniżenie kapitału zakładowego ma na celu wyrównanie poniesionych strat lub przeniesienie określonych kwot do kapitału rezerwowego.',
    difficulty: 'hard',
    tags: ['obniżenie kapitału', 'pokrycie strat', 'sp. z o.o.']
  },

  // ============================================================
  // SP. Z O.O. - ROZWIĄZANIE I LIKWIDACJA
  // ============================================================

  {
    id: 'ksh-586',
    article: 'Art. 270',
    articleTitle: 'Przyczyny rozwiązania sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Rozwiązanie sp. z o.o. powoduje m.in.:',
    options: {
      a: 'Tylko uchwała wspólników',
      b: 'Przyczyny przewidziane w umowie spółki, uchwała wspólników o rozwiązaniu (2/3 głosów), ogłoszenie upadłości, inne przyczyny przewidziane prawem',
      c: 'Tylko ogłoszenie upadłości',
      d: 'Tylko wyrok sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 270 k.s.h. rozwiązanie spółki powodują: przyczyny przewidziane w umowie spółki, uchwała wspólników o rozwiązaniu spółki albo o przeniesieniu siedziby spółki za granicę (stwierdzona protokołem sporządzonym przez notariusza), ogłoszenie upadłości spółki, inne przyczyny przewidziane prawem.',
    difficulty: 'medium',
    tags: ['rozwiązanie spółki', 'przyczyny', 'sp. z o.o.']
  },

  {
    id: 'ksh-587',
    article: 'Art. 271',
    articleTitle: 'Rozwiązanie przez sąd',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Sąd może wyrokiem orzec rozwiązanie sp. z o.o. na żądanie wspólnika lub członka organu, jeżeli:',
    options: {
      a: 'Spółka nie wypłaca dywidendy',
      b: 'Osiągnięcie celu spółki stało się niemożliwe albo zaszły inne ważne przyczyny wywołane stosunkami spółki',
      c: 'Zarząd działa nieprawidłowo',
      d: 'Spółka ma straty'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 271 pkt 1 k.s.h. sąd może wyrokiem orzec rozwiązanie spółki na żądanie wspólnika lub członka organu spółki, jeżeli osiągnięcie celu spółki stało się niemożliwe albo jeżeli zaszły inne ważne przyczyny wywołane stosunkami spółki.',
    difficulty: 'hard',
    tags: ['rozwiązanie przez sąd', 'ważne przyczyny', 'sp. z o.o.']
  },

  {
    id: 'ksh-588',
    article: 'Art. 274 § 1',
    articleTitle: 'Otwarcie likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Otwarcie likwidacji sp. z o.o. następuje z dniem:',
    options: {
      a: 'Powołania likwidatorów',
      b: 'Uprawomocnienia się orzeczenia o rozwiązaniu spółki przez sąd, powzięcia przez wspólników uchwały o rozwiązaniu spółki lub zaistnienia innej przyczyny jej rozwiązania',
      c: 'Wpisu do rejestru',
      d: 'Ogłoszenia w Monitorze Sądowym i Gospodarczym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 274 § 1 k.s.h. otwarcie likwidacji następuje z dniem uprawomocnienia się orzeczenia o rozwiązaniu spółki przez sąd, powzięcia przez wspólników uchwały o rozwiązaniu spółki lub zaistnienia innej przyczyny jej rozwiązania.',
    difficulty: 'medium',
    tags: ['otwarcie likwidacji', 'dzień', 'sp. z o.o.']
  },

  {
    id: 'ksh-589',
    article: 'Art. 276 § 1',
    articleTitle: 'Likwidatorzy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Likwidatorami sp. z o.o. są:',
    options: {
      a: 'Członkowie rady nadzorczej',
      b: 'Członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej',
      c: 'Biegli rewidenci',
      d: 'Sędzia komisarz'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 276 § 1 k.s.h. likwidatorami są członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej.',
    difficulty: 'easy',
    tags: ['likwidatorzy', 'członkowie zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-590',
    article: 'Art. 279',
    articleTitle: 'Wezwanie wierzycieli w likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Likwidatorzy sp. z o.o. powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Dwóch miesięcy od dnia ogłoszenia',
      c: 'Trzech miesięcy od dnia ogłoszenia',
      d: 'Sześciu miesięcy od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 279 k.s.h. likwidatorzy powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie trzech miesięcy od dnia tego ogłoszenia.',
    difficulty: 'medium',
    tags: ['likwidacja', 'wezwanie wierzycieli', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-591',
    article: 'Art. 282 § 1',
    articleTitle: 'Czynności likwidacyjne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Likwidatorzy sp. z o.o. powinni:',
    options: {
      a: 'Tylko spłacić długi',
      b: 'Zakończyć interesy bieżące spółki, ściągnąć wierzytelności, wypełnić zobowiązania i upłynnić majątek spółki',
      c: 'Tylko upłynnić majątek',
      d: 'Tylko ściągnąć wierzytelności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 282 § 1 k.s.h. likwidatorzy powinni zakończyć interesy bieżące spółki, ściągnąć wierzytelności, wypełnić zobowiązania i upłynnić majątek spółki (czynności likwidacyjne).',
    difficulty: 'easy',
    tags: ['czynności likwidacyjne', 'likwidatorzy', 'sp. z o.o.']
  },

  {
    id: 'ksh-592',
    article: 'Art. 286 § 1',
    articleTitle: 'Podział majątku',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli sp. z o.o. nie może nastąpić przed upływem:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Trzech miesięcy od dnia ogłoszenia',
      c: 'Sześciu miesięcy od dnia ogłoszenia o otwarciu likwidacji i wezwaniu wierzycieli',
      d: 'Roku od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 286 § 1 k.s.h. podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli nie może nastąpić przed upływem sześciu miesięcy od daty ogłoszenia o otwarciu likwidacji i wezwaniu wierzycieli.',
    difficulty: 'hard',
    tags: ['podział majątku', 'termin', 'likwidacja', 'sp. z o.o.']
  },

  {
    id: 'ksh-593',
    article: 'Art. 288 § 1',
    articleTitle: 'Wykreślenie z rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja',
    question: 'Po zakończeniu likwidacji sp. z o.o. likwidatorzy powinni:',
    options: {
      a: 'Zawiadomić wspólników',
      b: 'Ogłosić w siedzibie spółki o zakończeniu likwidacji i złożyć wniosek o wykreślenie spółki z rejestru',
      c: 'Tylko złożyć wniosek do sądu',
      d: 'Złożyć sprawozdanie do urzędu skarbowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 288 § 1 k.s.h. po zatwierdzeniu przez zgromadzenie wspólników sprawozdania finansowego na dzień poprzedzający podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli (sprawozdanie likwidacyjne) i po zakończeniu likwidacji, likwidatorzy powinni ogłosić w siedzibie spółki to sprawozdanie i złożyć je sądowi rejestrowemu, z jednoczesnym zgłoszeniem wniosku o wykreślenie spółki z rejestru.',
    difficulty: 'medium',
    tags: ['wykreślenie z rejestru', 'likwidacja', 'sp. z o.o.']
  },

  // ============================================================
  // SP. Z O.O. - ODPOWIEDZIALNOŚĆ
  // ============================================================

  {
    id: 'ksh-594',
    article: 'Art. 291',
    articleTitle: 'Odpowiedzialność wobec spółki za zawiązanie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Kto przy tworzeniu sp. z o.o. wbrew przepisom prawa z winy swojej wyrządził spółce szkodę:',
    options: {
      a: 'Nie ponosi odpowiedzialności',
      b: 'Obowiązany jest do jej naprawienia',
      c: 'Odpowiada tylko karnie',
      d: 'Odpowiada tylko administracyjnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 291 k.s.h. kto przy tworzeniu spółki wbrew przepisom prawa z winy swojej wyrządził spółce szkodę, obowiązany jest do jej naprawienia.',
    difficulty: 'easy',
    tags: ['odpowiedzialność', 'zawiązanie spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-595',
    article: 'Art. 292',
    articleTitle: 'Odpowiedzialność wobec spółki za nieprawdziwe dane',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Kto przy wykonywaniu obowiązków wynikających z tworzenia sp. z o.o. zamieścił w dokumentach fałszywe dane:',
    options: {
      a: 'Odpowiada tylko wobec wspólników',
      b: 'Odpowiada wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem',
      c: 'Nie ponosi odpowiedzialności cywilnej',
      d: 'Odpowiada tylko karnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 292 k.s.h. kto przy wykonywaniu obowiązków wynikających z tworzenia spółki zamieścił w dokumentach fałszywe dane lub przedstawił fałszywe oświadczenia, odpowiada wobec spółki za wyrządzoną tym szkodę.',
    difficulty: 'medium',
    tags: ['odpowiedzialność', 'fałszywe dane', 'sp. z o.o.']
  },

  {
    id: 'ksh-596',
    article: 'Art. 293 § 1',
    articleTitle: 'Odpowiedzialność członków organów wobec spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator sp. z o.o. odpowiada wobec spółki za szkodę wyrządzoną:',
    options: {
      a: 'Każdym działaniem',
      b: 'Działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy spółki, chyba że nie ponosi winy',
      c: 'Tylko umyślnym działaniem',
      d: 'Tylko w przypadku rażącego niedbalstwa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 1 k.s.h. członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator odpowiada wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy spółki, chyba że nie ponosi winy.',
    difficulty: 'medium',
    tags: ['odpowiedzialność', 'członkowie organów', 'sp. z o.o.']
  },

  {
    id: 'ksh-597',
    article: 'Art. 293 § 2',
    articleTitle: 'Miernik staranności',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator sp. z o.o. powinien przy wykonywaniu swoich obowiązków dołożyć staranności:',
    options: {
      a: 'Ogólnie wymaganej',
      b: 'Wynikającej z zawodowego charakteru swojej działalności oraz dochować lojalności wobec spółki',
      c: 'Należytej',
      d: 'Przeciętnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 2 k.s.h. członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator powinien przy wykonywaniu swoich obowiązków dołożyć staranności wynikającej z zawodowego charakteru swojej działalności oraz dochować lojalności wobec spółki.',
    difficulty: 'medium',
    tags: ['staranność', 'lojalność', 'odpowiedzialność', 'sp. z o.o.']
  },

  {
    id: 'ksh-598',
    article: 'Art. 293 § 3',
    articleTitle: 'Business judgment rule',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Członek zarządu sp. z o.o. NIE narusza obowiązku dołożenia staranności, jeżeli postępując lojalnie wobec spółki:',
    options: {
      a: 'Uzyskał zgodę wspólników',
      b: 'Działał w granicach uzasadnionego ryzyka gospodarczego, w tym na podstawie informacji, analiz i opinii, które powinny być w danych okolicznościach uwzględnione przy dokonywaniu starannej oceny',
      c: 'Konsultował decyzję z prawnikiem',
      d: 'Działał zgodnie z poprzednią praktyką'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 3 k.s.h. (business judgment rule) członek organu nie narusza obowiązku staranności, jeżeli postępując lojalnie wobec spółki, działa w granicach uzasadnionego ryzyka gospodarczego, w tym na podstawie informacji, analiz i opinii.',
    difficulty: 'hard',
    tags: ['business judgment rule', 'uzasadnione ryzyko', 'sp. z o.o.']
  },

  {
    id: 'ksh-599',
    article: 'Art. 295 § 1',
    articleTitle: 'Powództwo o odszkodowanie',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Jeżeli spółka z o.o. nie wytoczy powództwa o odszkodowanie przeciwko członkowi organu w terminie roku od dnia ujawnienia czynu wyrządzającego szkodę, powództwo może wytoczyć:',
    options: {
      a: 'Każdy wspólnik',
      b: 'Każdy wspólnik lub osoba, której służy inny tytuł uczestnictwa w zyskach lub w podziale majątku',
      c: 'Tylko wspólnik większościowy',
      d: 'Tylko rada nadzorcza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 295 § 1 k.s.h. jeżeli spółka nie wytoczy powództwa o naprawienie wyrządzonej jej szkody w terminie roku od dnia ujawnienia czynu wyrządzającego szkodę, każdy wspólnik lub osoba, której służy inny tytuł uczestnictwa w zyskach lub w podziale majątku, może wnieść pozew o naprawienie szkody wyrządzonej spółce (actio pro socio).',
    difficulty: 'hard',
    tags: ['actio pro socio', 'powództwo', 'odszkodowanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-600',
    article: 'Art. 299 § 1',
    articleTitle: 'Odpowiedzialność członków zarządu za zobowiązania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Jeżeli egzekucja przeciwko sp. z o.o. okaże się bezskuteczna, członkowie zarządu odpowiadają za jej zobowiązania:',
    options: {
      a: 'Proporcjonalnie',
      b: 'Solidarnie',
      c: 'Subsydiarnie',
      d: 'Nie odpowiadają'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 1 k.s.h. jeżeli egzekucja przeciwko spółce okaże się bezskuteczna, członkowie zarządu odpowiadają solidarnie za jej zobowiązania.',
    difficulty: 'easy',
    tags: ['art. 299', 'odpowiedzialność solidarna', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-601',
    article: 'Art. 299 § 2',
    articleTitle: 'Przesłanki egzoneracyjne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Odpowiedzialność cywilnoprawna',
    question: 'Członek zarządu sp. z o.o. może się uwolnić od odpowiedzialności z art. 299 k.s.h., jeżeli wykaże, że:',
    options: {
      a: 'Nie wiedział o długu',
      b: 'We właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub wszczęto postępowanie restrukturyzacyjne, albo niezgłoszenie wniosku o ogłoszenie upadłości nastąpiło nie z jego winy, albo pomimo niezgłoszenia wniosku wierzyciel nie poniósł szkody',
      c: 'Działał w dobrej wierze',
      d: 'Zobowiązanie powstało przed jego powołaniem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może się uwolnić od odpowiedzialności, jeżeli wykaże, że we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub w tym czasie wydano postanowienie o otwarciu postępowania restrukturyzacyjnego albo o zatwierdzeniu układu w postępowaniu w przedmiocie zatwierdzenia układu, albo że niezgłoszenie wniosku o ogłoszenie upadłości nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku o ogłoszenie upadłości oraz niewydania postanowienia o otwarciu postępowania restrukturyzacyjnego albo niezatwierdzenia układu w postępowaniu w przedmiocie zatwierdzenia układu wierzyciel nie poniósł szkody.',
    difficulty: 'hard',
    tags: ['art. 299', 'przesłanki egzoneracyjne', 'sp. z o.o.']
  },

  // ============================================================
  // S.A. - PODWYŻSZENIE KAPITAŁU ZAKŁADOWEGO
  // ============================================================

  {
    id: 'ksh-602',
    article: 'Art. 430 § 1',
    articleTitle: 'Sposoby podwyższenia kapitału S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Podwyższenie kapitału zakładowego S.A. wymaga:',
    options: {
      a: 'Tylko uchwały zarządu',
      b: 'Zmiany statutu',
      c: 'Zgody rady nadzorczej',
      d: 'Zgody sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 430 § 1 k.s.h. podwyższenie kapitału zakładowego wymaga zmiany statutu.',
    difficulty: 'easy',
    tags: ['podwyższenie kapitału', 'zmiana statutu', 'S.A.']
  },

  {
    id: 'ksh-603',
    article: 'Art. 431 § 1',
    articleTitle: 'Podwyższenie przez emisję nowych akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Podwyższenie kapitału zakładowego S.A. może nastąpić przez:',
    options: {
      a: 'Tylko emisję nowych akcji',
      b: 'Tylko podwyższenie wartości nominalnej akcji',
      c: 'Emisję nowych akcji lub podwyższenie wartości nominalnej dotychczasowych akcji',
      d: 'Tylko emisję obligacji'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 431 § 1 k.s.h. podwyższenie kapitału zakładowego może być dokonane przez emisję nowych akcji lub przez podwyższenie wartości nominalnej dotychczasowych akcji.',
    difficulty: 'easy',
    tags: ['podwyższenie kapitału', 'emisja akcji', 'S.A.']
  },

  {
    id: 'ksh-604',
    article: 'Art. 432 § 1',
    articleTitle: 'Prawo poboru akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Akcjonariusze S.A. mają prawo pierwszeństwa objęcia nowych akcji (prawo poboru):',
    options: {
      a: 'Zawsze bezwarunkowo',
      b: 'W stosunku do liczby posiadanych akcji, chyba że uchwała stanowi inaczej',
      c: 'Tylko jeśli mają więcej niż 5% akcji',
      d: 'Tylko za zgodą rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 433 § 1 k.s.h. akcjonariusze mają prawo pierwszeństwa objęcia nowych akcji w stosunku do liczby posiadanych akcji (prawo poboru). Prawo poboru może być wyłączone lub ograniczone w interesie spółki.',
    difficulty: 'medium',
    tags: ['prawo poboru', 'podwyższenie kapitału', 'S.A.']
  },

  {
    id: 'ksh-605',
    article: 'Art. 433 § 2',
    articleTitle: 'Wyłączenie prawa poboru',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Pozbawienie akcjonariuszy S.A. prawa poboru akcji wymaga:',
    options: {
      a: 'Tylko uchwały zarządu',
      b: 'Uchwały walnego zgromadzenia podjętej większością co najmniej 4/5 głosów',
      c: 'Zgody wszystkich akcjonariuszy',
      d: 'Zgody sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 433 § 2 k.s.h. pozbawienie akcjonariuszy prawa poboru akcji może nastąpić w przypadku, gdy zostało to zapowiedziane w porządku obrad walnego zgromadzenia. Uchwała walnego zgromadzenia wymaga większości co najmniej czterech piątych głosów.',
    difficulty: 'hard',
    tags: ['wyłączenie prawa poboru', 'większość 4/5', 'S.A.']
  },

  {
    id: 'ksh-606',
    article: 'Art. 444 § 1',
    articleTitle: 'Kapitał docelowy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Statut S.A. może upoważnić zarząd do podwyższenia kapitału zakładowego w ramach kapitału docelowego. Kapitał docelowy nie może przekraczać:',
    options: {
      a: '1/2 kapitału zakładowego',
      b: '3/4 kapitału zakładowego z dnia udzielenia upoważnienia',
      c: 'Wysokości kapitału zakładowego',
      d: '2-krotności kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 444 § 3 k.s.h. kapitał docelowy nie może przekraczać trzech czwartych kapitału zakładowego na dzień udzielenia upoważnienia.',
    difficulty: 'hard',
    tags: ['kapitał docelowy', 'zarząd', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-607',
    article: 'Art. 444 § 1',
    articleTitle: 'Termin kapitału docelowego',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Upoważnienie zarządu S.A. do podwyższenia kapitału w ramach kapitału docelowego może być udzielone na okres nie dłuższy niż:',
    options: {
      a: '1 rok',
      b: '3 lata',
      c: '5 lat',
      d: '10 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 444 § 1 k.s.h. statut może upoważnić zarząd na okres nie dłuższy niż trzy lata do podwyższenia kapitału zakładowego na zasadach określonych w niniejszym rozdziale (kapitał docelowy).',
    difficulty: 'medium',
    tags: ['kapitał docelowy', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-608',
    article: 'Art. 442 § 1',
    articleTitle: 'Warunkowe podwyższenie kapitału',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Walne zgromadzenie S.A. może uchwalić warunkowe podwyższenie kapitału zakładowego m.in. w celu:',
    options: {
      a: 'Wypłaty dywidendy',
      b: 'Przyznania praw do objęcia akcji przez obligatariuszy obligacji zamiennych lub z prawem pierwszeństwa, lub przez pracowników, którym przyznano opcje',
      c: 'Pokrycia strat',
      d: 'Zwiększenia rezerw'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 442 § 1 k.s.h. walne zgromadzenie może uchwalić podwyższenie kapitału zakładowego z zastrzeżeniem, że osoby, którym przyznano prawo do objęcia akcji, wykonają je na warunkach określonych w uchwale (warunkowe podwyższenie kapitału zakładowego), w szczególności w celu przyznania praw do objęcia akcji przez obligatariuszy obligacji zamiennych lub z prawem pierwszeństwa albo pracowników, członków zarządu lub rady nadzorczej w zamian za wkłady niepieniężne, stanowiące wierzytelności przysługujące im z tytułu nabytych uprawnień do udziału w zysku spółki lub spółki zależnej.',
    difficulty: 'hard',
    tags: ['warunkowe podwyższenie', 'obligacje zamienne', 'S.A.']
  },

  {
    id: 'ksh-609',
    article: 'Art. 442 § 2',
    articleTitle: 'Limit warunkowego podwyższenia',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Wartość nominalna warunkowego podwyższenia kapitału zakładowego S.A. nie może przekraczać:',
    options: {
      a: 'Połowy kapitału zakładowego',
      b: 'Dwukrotności kapitału zakładowego z dnia podejmowania uchwały',
      c: 'Kapitału zakładowego',
      d: '3/4 kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 442 § 2 k.s.h. wartość nominalna warunkowego podwyższenia kapitału zakładowego nie może przekraczać dwukrotności kapitału zakładowego z dnia podejmowania uchwały.',
    difficulty: 'hard',
    tags: ['warunkowe podwyższenie', 'limit', 'S.A.', 'liczby']
  },

  // ============================================================
  // S.A. - OBNIŻENIE KAPITAŁU ZAKŁADOWEGO
  // ============================================================

  {
    id: 'ksh-610',
    article: 'Art. 455 § 1',
    articleTitle: 'Uchwała o obniżeniu kapitału S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Uchwała o obniżeniu kapitału zakładowego S.A. powinna określać:',
    options: {
      a: 'Tylko cel obniżenia',
      b: 'Cel obniżenia, kwotę, o którą kapitał zakładowy ma być obniżony, oraz sposób obniżenia',
      c: 'Tylko kwotę obniżenia',
      d: 'Tylko sposób obniżenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 455 § 1 k.s.h. uchwała o obniżeniu kapitału zakładowego powinna określać cel obniżenia, kwotę, o którą kapitał zakładowy ma być obniżony, jak również sposób obniżenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'uchwała', 'S.A.']
  },

  {
    id: 'ksh-611',
    article: 'Art. 456 § 1',
    articleTitle: 'Wezwanie wierzycieli S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'O uchwalonym obniżeniu kapitału zakładowego S.A. zarząd niezwłocznie ogłasza, wzywając wierzycieli do zgłoszenia roszczeń w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Dwóch miesięcy od dnia ogłoszenia',
      c: 'Trzech miesięcy od dnia ogłoszenia',
      d: 'Sześciu miesięcy od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 456 § 1 k.s.h. o uchwalonym obniżeniu kapitału zakładowego zarząd niezwłocznie ogłasza, wzywając wierzycieli do zgłoszenia roszczeń wobec spółki w terminie trzech miesięcy od dnia ogłoszenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'wierzyciele', 'termin', 'S.A.']
  },

  // ============================================================
  // S.A. - AKCJE WŁASNE
  // ============================================================

  {
    id: 'ksh-612',
    article: 'Art. 362 § 1',
    articleTitle: 'Zakaz nabywania akcji własnych',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'S.A. co do zasady nie może nabywać wyemitowanych przez siebie akcji (akcje własne). Zakaz ten NIE dotyczy:',
    options: {
      a: 'Wszystkich przypadków',
      b: 'Nabycia w celu zapobieżenia bezpośrednio zagrażającej spółce poważnej szkodzie, nabycia w celu zaoferowania akcji pracownikom, nabycia w drodze sukcesji uniwersalnej, nabycia w celu umorzenia',
      c: 'Tylko nabycia w celu umorzenia',
      d: 'Tylko nabycia od pracowników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 362 § 1 k.s.h. spółka nie może nabywać wyemitowanych przez nią akcji (akcje własne). Zakaz ten nie dotyczy m.in.: nabycia w celu zapobieżenia bezpośrednio zagrażającej spółce poważnej szkodzie, nabycia akcji w celu zaoferowania ich do nabycia pracownikom lub osobom związanym ze spółką, nabycia w drodze sukcesji uniwersalnej, nabycia w celu ich umorzenia.',
    difficulty: 'hard',
    tags: ['akcje własne', 'zakaz', 'wyjątki', 'S.A.']
  },

  {
    id: 'ksh-613',
    article: 'Art. 363 § 3',
    articleTitle: 'Limit akcji własnych',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Łączna wartość nominalna nabytych akcji własnych S.A. nie może przekroczyć:',
    options: {
      a: '10% kapitału zakładowego',
      b: '20% kapitału zakładowego',
      c: '25% kapitału zakładowego',
      d: '50% kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 362 § 2 pkt 3 k.s.h. łączna wartość nominalna nabytych akcji nie przekracza 20% kapitału zakładowego spółki, uwzględniając w tym również wartość nominalną pozostałych akcji własnych, które nie zostały przez spółkę zbyte.',
    difficulty: 'hard',
    tags: ['akcje własne', 'limit', 'S.A.', 'liczby']
  },

  // ============================================================
  // S.A. - UMORZENIE AKCJI
  // ============================================================

  {
    id: 'ksh-614',
    article: 'Art. 359 § 1',
    articleTitle: 'Umorzenie akcji - przesłanki',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje S.A. mogą być umorzone:',
    options: {
      a: 'Zawsze bez ograniczeń',
      b: 'W przypadku gdy statut tak stanowi',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko w przypadku likwidacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 359 § 1 k.s.h. akcje mogą być umorzone w przypadku, gdy statut tak stanowi. Akcja może być umorzona za zgodą akcjonariusza w drodze jej nabycia przez spółkę (umorzenie dobrowolne) albo bez zgody akcjonariusza (umorzenie przymusowe).',
    difficulty: 'easy',
    tags: ['umorzenie akcji', 'statut', 'S.A.']
  },

  {
    id: 'ksh-615',
    article: 'Art. 359 § 2',
    articleTitle: 'Rodzaje umorzenia akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Umorzenie akcji S.A. może być:',
    options: {
      a: 'Tylko dobrowolne',
      b: 'Dobrowolne (za zgodą akcjonariusza) lub przymusowe (bez zgody akcjonariusza)',
      c: 'Tylko przymusowe',
      d: 'Tylko automatyczne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 359 § 1 k.s.h. akcja może być umorzona za zgodą akcjonariusza w drodze jej nabycia przez spółkę (umorzenie dobrowolne) albo bez zgody akcjonariusza (umorzenie przymusowe).',
    difficulty: 'easy',
    tags: ['umorzenie dobrowolne', 'umorzenie przymusowe', 'S.A.']
  },

  {
    id: 'ksh-616',
    article: 'Art. 360 § 1',
    articleTitle: 'Umorzenie z czystego zysku',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Umorzenie akcji S.A. z czystego zysku:',
    options: {
      a: 'Wymaga obniżenia kapitału zakładowego',
      b: 'Nie wymaga obniżenia kapitału zakładowego',
      c: 'Jest niedopuszczalne',
      d: 'Wymaga zgody sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 360 § 2 k.s.h. umorzenie akcji wymaga uchwały walnego zgromadzenia i obniżenia kapitału zakładowego, chyba że następuje z czystego zysku. Umorzenie z czystego zysku nie wymaga obniżenia kapitału zakładowego.',
    difficulty: 'medium',
    tags: ['umorzenie z zysku', 'kapitał zakładowy', 'S.A.']
  },

  // ============================================================
  // S.A. - ROZWIĄZANIE I LIKWIDACJA
  // ============================================================

  {
    id: 'ksh-617',
    article: 'Art. 459',
    articleTitle: 'Przyczyny rozwiązania S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Rozwiązanie S.A. powoduje m.in.:',
    options: {
      a: 'Tylko uchwała walnego zgromadzenia',
      b: 'Przyczyny przewidziane w statucie, uchwała walnego zgromadzenia o rozwiązaniu (większość 3/4), ogłoszenie upadłości, inne przyczyny przewidziane prawem',
      c: 'Tylko ogłoszenie upadłości',
      d: 'Tylko wyrok sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 459 k.s.h. rozwiązanie spółki powodują: przyczyny przewidziane w statucie, uchwała walnego zgromadzenia o rozwiązaniu spółki (większość 3/4 głosów), ogłoszenie upadłości spółki, inne przyczyny przewidziane prawem.',
    difficulty: 'medium',
    tags: ['rozwiązanie spółki', 'przyczyny', 'S.A.']
  },

  {
    id: 'ksh-618',
    article: 'Art. 463 § 1',
    articleTitle: 'Likwidatorzy S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Likwidatorami S.A. są:',
    options: {
      a: 'Członkowie rady nadzorczej',
      b: 'Członkowie zarządu, chyba że statut lub uchwała walnego zgromadzenia stanowi inaczej',
      c: 'Biegli rewidenci',
      d: 'Sędzia komisarz'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 463 § 1 k.s.h. likwidatorami są członkowie zarządu, chyba że statut lub uchwała walnego zgromadzenia stanowi inaczej.',
    difficulty: 'easy',
    tags: ['likwidatorzy', 'członkowie zarządu', 'S.A.']
  },

  {
    id: 'ksh-619',
    article: 'Art. 465 § 1',
    articleTitle: 'Wezwanie wierzycieli w likwidacji S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Likwidatorzy S.A. powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia wierzytelności w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Trzech miesięcy od dnia ogłoszenia',
      c: 'Sześciu miesięcy od dnia ogłoszenia',
      d: 'Roku od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 465 § 1 k.s.h. likwidatorzy powinni ogłosić dwukrotnie o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie sześciu miesięcy od dnia ostatniego ogłoszenia.',
    difficulty: 'hard',
    tags: ['likwidacja', 'wezwanie wierzycieli', 'termin', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-620',
    article: 'Art. 474 § 1',
    articleTitle: 'Podział majątku S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Podział między akcjonariuszy majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli S.A. nie może nastąpić przed upływem:',
    options: {
      a: 'Trzech miesięcy od dnia ogłoszenia',
      b: 'Sześciu miesięcy od dnia ogłoszenia',
      c: 'Roku od dnia ostatniego ogłoszenia o otwarciu likwidacji',
      d: 'Dwóch lat od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 474 § 1 k.s.h. podział między akcjonariuszy majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli nie może nastąpić przed upływem roku od dnia ostatniego ogłoszenia o otwarciu likwidacji i wezwaniu wierzycieli.',
    difficulty: 'hard',
    tags: ['podział majątku', 'termin', 'likwidacja', 'S.A.', 'liczby']
  },

  // ============================================================
  // PORÓWNANIA SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-621',
    article: 'Porównanie',
    articleTitle: 'Termin wezwania wierzycieli w likwidacji',
    section: 'Porównanie spółek',
    subsection: 'Likwidacja',
    question: 'Termin na zgłoszenie wierzytelności w likwidacji: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 3 miesiące, S.A.: 3 miesiące',
      b: 'Sp. z o.o.: 3 miesiące, S.A.: 6 miesięcy',
      c: 'Sp. z o.o.: 6 miesięcy, S.A.: 6 miesięcy',
      d: 'Sp. z o.o.: 6 miesięcy, S.A.: 12 miesięcy'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. wierzyciele mają 3 miesiące na zgłoszenie wierzytelności (art. 279), w S.A. - 6 miesięcy (art. 465 § 1).',
    difficulty: 'hard',
    tags: ['likwidacja', 'wierzyciele', 'porównanie', 'terminy']
  },

  {
    id: 'ksh-622',
    article: 'Porównanie',
    articleTitle: 'Termin podziału majątku w likwidacji',
    section: 'Porównanie spółek',
    subsection: 'Likwidacja',
    question: 'Termin przed upływem którego nie można podzielić majątku w likwidacji: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 3 miesiące, S.A.: 6 miesięcy',
      b: 'Sp. z o.o.: 6 miesięcy, S.A.: 6 miesięcy',
      c: 'Sp. z o.o.: 6 miesięcy, S.A.: 1 rok',
      d: 'Sp. z o.o.: 1 rok, S.A.: 1 rok'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. podział majątku nie może nastąpić przed upływem 6 miesięcy (art. 286 § 1), w S.A. - przed upływem 1 roku (art. 474 § 1).',
    difficulty: 'hard',
    tags: ['likwidacja', 'podział majątku', 'porównanie', 'terminy']
  },

  {
    id: 'ksh-623',
    article: 'Porównanie',
    articleTitle: 'Maksymalne uprzywilejowanie - zestawienie',
    section: 'Porównanie spółek',
    subsection: 'Uprzywilejowanie',
    question: 'Porównanie maksymalnego uprzywilejowania co do głosu: udział w sp. z o.o. vs akcja w S.A.:',
    options: {
      a: 'Udział: max 2 głosy, Akcja: max 2 głosy',
      b: 'Udział: max 3 głosy, Akcja: max 2 głosy',
      c: 'Udział: max 3 głosy, Akcja: max 3 głosy',
      d: 'Udział: max 5 głosów, Akcja: max 2 głosy'
    },
    correct: 'b',
    explanation: 'W sp. z o.o. maksymalnie 3 głosy na udział (art. 174 § 3), w S.A. maksymalnie 2 głosy na akcję (art. 352).',
    difficulty: 'medium',
    tags: ['uprzywilejowanie', 'głosy', 'porównanie']
  },

  {
    id: 'ksh-624',
    article: 'Porównanie',
    articleTitle: 'Forma dokumentu założycielskiego',
    section: 'Porównanie spółek',
    subsection: 'Powstanie',
    question: 'Forma umowy sp. z o.o. vs forma statutu S.A.:',
    options: {
      a: 'Obie wymagają formy pisemnej',
      b: 'Obie wymagają formy aktu notarialnego',
      c: 'Sp. z o.o.: forma pisemna, S.A.: akt notarialny',
      d: 'Sp. z o.o.: akt notarialny, S.A.: forma pisemna'
    },
    correct: 'b',
    explanation: 'Zarówno umowa sp. z o.o. (art. 157 § 2), jak i statut S.A. (art. 301 § 2) wymagają formy aktu notarialnego.',
    difficulty: 'easy',
    tags: ['forma', 'akt notarialny', 'porównanie']
  },

  {
    id: 'ksh-625',
    article: 'Porównanie',
    articleTitle: 'Termin wezwania wierzycieli przy obniżeniu kapitału',
    section: 'Porównanie spółek',
    subsection: 'Obniżenie kapitału',
    question: 'Termin dla wierzycieli na sprzeciw przy obniżeniu kapitału: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 1 miesiąc, S.A.: 3 miesiące',
      b: 'Sp. z o.o.: 3 miesiące, S.A.: 3 miesiące',
      c: 'Sp. z o.o.: 3 miesiące, S.A.: 6 miesięcy',
      d: 'Sp. z o.o.: 6 miesięcy, S.A.: 6 miesięcy'
    },
    correct: 'b',
    explanation: 'Zarówno w sp. z o.o. (art. 264 § 1), jak i w S.A. (art. 456 § 1) wierzyciele mają 3 miesiące na zgłoszenie sprzeciwu/roszczeń przy obniżeniu kapitału.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'wierzyciele', 'porównanie', 'terminy']
  },

  // ============================================================
  // DODATKOWE SZCZEGÓŁOWE PYTANIA
  // ============================================================

  {
    id: 'ksh-626',
    article: 'Art. 244',
    articleTitle: 'Wyłączenie od głosowania - szczegóły',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik sp. z o.o. jest wyłączony od głosowania przy uchwałach dotyczących:',
    options: {
      a: 'Tylko absolutorium dla niego',
      b: 'Jego odpowiedzialności wobec spółki, w tym udzielenia mu absolutorium, zwolnienia z zobowiązania wobec spółki oraz sporu między nim a spółką',
      c: 'Tylko sporu między nim a spółką',
      d: 'Wszystkich uchwał personalnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 244 k.s.h. wspólnik nie może głosować przy uchwałach dotyczących jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium, zwolnienia z zobowiązania wobec spółki oraz sporu między nim a spółką.',
    difficulty: 'hard',
    tags: ['wyłączenie od głosowania', 'absolutorium', 'sp. z o.o.']
  },

  {
    id: 'ksh-627',
    article: 'Art. 412 § 1',
    articleTitle: 'Wyłączenie od głosowania akcjonariusza S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz S.A. nie może wykonywać prawa głosu z akcji własnych, ani głosować:',
    options: {
      a: 'Tylko przy wyborach',
      b: 'Przy powzięciu uchwał dotyczących jego odpowiedzialności wobec spółki',
      c: 'Przy wszystkich uchwałach finansowych',
      d: 'Nigdy nie jest wyłączony'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 413 § 1 k.s.h. akcjonariusz nie może ani osobiście, ani przez pełnomocnika głosować przy powzięciu uchwał dotyczących jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium.',
    difficulty: 'medium',
    tags: ['wyłączenie od głosowania', 'akcjonariusz', 'S.A.']
  },

  {
    id: 'ksh-628',
    article: 'Art. 214 § 1',
    articleTitle: 'Zakaz łączenia funkcji w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członkiem rady nadzorczej lub komisji rewizyjnej sp. z o.o. NIE może być:',
    options: {
      a: 'Wspólnik mniejszościowy',
      b: 'Członek zarządu, prokurent, likwidator, kierownik oddziału lub zakładu oraz zatrudniony w spółce główny księgowy, radca prawny lub adwokat',
      c: 'Osoba spoza grona wspólników',
      d: 'Osoba fizyczna powyżej 70 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 214 § 1 k.s.h. członkiem rady nadzorczej lub komisji rewizyjnej nie może być członek zarządu, prokurent, likwidator, kierownik oddziału lub zakładu oraz zatrudniony w spółce główny księgowy, radca prawny lub adwokat.',
    difficulty: 'medium',
    tags: ['zakaz łączenia funkcji', 'rada nadzorcza', 'sp. z o.o.']
  },

  {
    id: 'ksh-629',
    article: 'Art. 233 § 1',
    articleTitle: 'Strata przekraczająca kapitały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli bilans sp. z o.o. wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz połowę kapitału zakładowego, zarząd jest obowiązany:',
    options: {
      a: 'Złożyć wniosek o upadłość',
      b: 'Niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki',
      c: 'Obniżyć kapitał zakładowy',
      d: 'Poinformować sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 233 § 1 k.s.h. jeżeli bilans sporządzony przez zarząd wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz połowę kapitału zakładowego, zarząd jest obowiązany niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki.',
    difficulty: 'hard',
    tags: ['strata', 'zgromadzenie wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-630',
    article: 'Art. 397',
    articleTitle: 'Strata przekraczająca kapitały S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Jeżeli bilans S.A. sporządzony przez zarząd wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz jedną trzecią kapitału zakładowego, zarząd jest obowiązany:',
    options: {
      a: 'Złożyć wniosek o upadłość',
      b: 'Niezwłocznie zwołać walne zgromadzenie celem powzięcia uchwały dotyczącej dalszego istnienia spółki',
      c: 'Obniżyć kapitał zakładowy',
      d: 'Poinformować radę nadzorczą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 397 k.s.h. jeżeli bilans sporządzony przez zarząd wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz jedną trzecią kapitału zakładowego, zarząd jest obowiązany niezwłocznie zwołać walne zgromadzenie celem powzięcia uchwały dotyczącej dalszego istnienia spółki.',
    difficulty: 'hard',
    tags: ['strata', 'walne zgromadzenie', 'S.A.']
  },

  {
    id: 'ksh-631',
    article: 'Porównanie',
    articleTitle: 'Próg straty wymagający reakcji',
    section: 'Porównanie spółek',
    subsection: 'Strata',
    question: 'Próg straty wymagający zwołania zgromadzenia: sp. z o.o. vs S.A.:',
    options: {
      a: 'Sp. z o.o.: 1/3 kapitału, S.A.: 1/3 kapitału',
      b: 'Sp. z o.o.: 1/2 kapitału, S.A.: 1/2 kapitału',
      c: 'Sp. z o.o.: 1/2 kapitału, S.A.: 1/3 kapitału',
      d: 'Sp. z o.o.: 1/3 kapitału, S.A.: 1/2 kapitału'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. zarząd zwołuje zgromadzenie gdy strata przekracza połowę kapitału (art. 233 § 1), w S.A. gdy przekracza jedną trzecią kapitału (art. 397).',
    difficulty: 'hard',
    tags: ['strata', 'porównanie', 'próg']
  },

  {
    id: 'ksh-632',
    article: 'Art. 219 § 2',
    articleTitle: 'Zakaz poleceń RN dla zarządu w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza sp. z o.o.:',
    options: {
      a: 'Może wydawać zarządowi wiążące polecenia',
      b: 'Nie ma prawa wydawać zarządowi wiążących poleceń dotyczących prowadzenia spraw spółki',
      c: 'Może wydawać polecenia tylko w sprawach finansowych',
      d: 'Może wydawać polecenia za zgodą wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 219 § 2 k.s.h. rada nadzorcza nie ma prawa wydawać zarządowi wiążących poleceń dotyczących prowadzenia spraw spółki.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'zakaz poleceń', 'sp. z o.o.']
  },

  {
    id: 'ksh-633',
    article: 'Art. 384¹',
    articleTitle: 'Zakaz poleceń RN dla zarządu w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A.:',
    options: {
      a: 'Może wydawać zarządowi wiążące polecenia',
      b: 'Nie może wydawać zarządowi wiążących poleceń dotyczących prowadzenia spraw spółki',
      c: 'Może wydawać polecenia tylko w sprawach kadrowych',
      d: 'Może wydawać polecenia za zgodą walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 3841 k.s.h. rada nadzorcza nie może wydawać zarządowi wiążących poleceń dotyczących prowadzenia spraw spółki.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'zakaz poleceń', 'S.A.']
  },

  {
    id: 'ksh-634',
    article: 'Art. 203 § 1',
    articleTitle: 'Odwołanie członka zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. może być odwołany:',
    options: {
      a: 'Tylko z ważnych powodów',
      b: 'W każdym czasie uchwałą wspólników',
      c: 'Tylko za jego zgodą',
      d: 'Tylko przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 203 § 1 k.s.h. członek zarządu może być w każdym czasie odwołany uchwałą wspólników. Nie pozbawia go to roszczeń ze stosunku pracy lub innego stosunku prawnego dotyczącego pełnienia funkcji członka zarządu.',
    difficulty: 'easy',
    tags: ['odwołanie zarządu', 'w każdym czasie', 'sp. z o.o.']
  },

  {
    id: 'ksh-635',
    article: 'Art. 370 § 1',
    articleTitle: 'Odwołanie członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członek zarządu S.A. może być odwołany:',
    options: {
      a: 'Tylko z ważnych powodów',
      b: 'W każdym czasie',
      c: 'Tylko na koniec kadencji',
      d: 'Tylko przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 370 § 1 k.s.h. członek zarządu może być w każdym czasie odwołany. Nie pozbawia go to roszczeń ze stosunku pracy lub innego stosunku prawnego dotyczącego pełnienia funkcji członka zarządu.',
    difficulty: 'easy',
    tags: ['odwołanie zarządu', 'w każdym czasie', 'S.A.']
  },

  // ============================================================
  // PYTANIA O LICZBY - PUŁAPKI EGZAMINACYJNE
  // ============================================================

  {
    id: 'ksh-636',
    article: 'Art. 154 § 1 i Art. 308 § 1',
    articleTitle: 'Minimalne kapitały - zestawienie',
    section: 'Porównanie spółek',
    subsection: 'Kapitał zakładowy',
    question: 'Minimalne kapitały zakładowe spółek kapitałowych (PSA, sp. z o.o., S.A.):',
    options: {
      a: 'PSA: 1 zł, sp. z o.o.: 5.000 zł, S.A.: 100.000 zł',
      b: 'PSA: 1 zł, sp. z o.o.: 10.000 zł, S.A.: 100.000 zł',
      c: 'PSA: 100 zł, sp. z o.o.: 5.000 zł, S.A.: 50.000 zł',
      d: 'PSA: 1.000 zł, sp. z o.o.: 5.000 zł, S.A.: 100.000 zł'
    },
    correct: 'a',
    explanation: 'PSA: minimum 1 zł (art. 300³ § 1), sp. z o.o.: minimum 5.000 zł (art. 154 § 1), S.A.: minimum 100.000 zł (art. 308 § 1).',
    difficulty: 'medium',
    tags: ['kapitał zakładowy', 'minimalne', 'porównanie', 'liczby']
  },

  {
    id: 'ksh-637',
    article: 'Art. 154 § 2 i Art. 308 § 2',
    articleTitle: 'Minimalna wartość udziału/akcji',
    section: 'Porównanie spółek',
    subsection: 'Wartość nominalna',
    question: 'Minimalna wartość nominalna: udział w sp. z o.o. vs akcja w S.A.:',
    options: {
      a: 'Udział: 1 zł, Akcja: 1 grosz',
      b: 'Udział: 50 zł, Akcja: 1 grosz',
      c: 'Udział: 50 zł, Akcja: 1 zł',
      d: 'Udział: 100 zł, Akcja: 10 groszy'
    },
    correct: 'b',
    explanation: 'Minimalna wartość udziału w sp. z o.o. to 50 zł (art. 154 § 2), minimalna wartość akcji w S.A. to 1 grosz (art. 308 § 2).',
    difficulty: 'medium',
    tags: ['wartość nominalna', 'porównanie', 'liczby']
  },

  {
    id: 'ksh-638',
    article: 'Art. 213 § 2 i Art. 385 § 1',
    articleTitle: 'Skład rady nadzorczej',
    section: 'Porównanie spółek',
    subsection: 'Rada nadzorcza',
    question: 'Minimalny skład rady nadzorczej: sp. z o.o. vs S.A. (niepubliczna) vs S.A. (publiczna):',
    options: {
      a: 'Sp. z o.o.: 3, S.A.: 3, S.A. publiczna: 5',
      b: 'Sp. z o.o.: 3, S.A.: 5, S.A. publiczna: 7',
      c: 'Sp. z o.o.: 5, S.A.: 5, S.A. publiczna: 7',
      d: 'Sp. z o.o.: 3, S.A.: 3, S.A. publiczna: 3'
    },
    correct: 'a',
    explanation: 'W sp. z o.o. RN składa się z min. 3 członków (art. 215 § 1), w S.A. z min. 3 członków, a w S.A. publicznej z min. 5 członków (art. 385 § 1).',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'skład', 'porównanie', 'liczby']
  },

  {
    id: 'ksh-639',
    article: 'Art. 369 § 1 i Art. 386 § 1',
    articleTitle: 'Maksymalna kadencja organów S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Maksymalna kadencja członka zarządu i członka rady nadzorczej S.A.:',
    options: {
      a: 'Zarząd: 3 lata, RN: 3 lata',
      b: 'Zarząd: 5 lat, RN: 5 lat',
      c: 'Zarząd: 4 lata, RN: 4 lata',
      d: 'Zarząd: 5 lat, RN: 3 lata'
    },
    correct: 'b',
    explanation: 'Zarówno kadencja członka zarządu (art. 369 § 1), jak i kadencja członka rady nadzorczej (art. 386 § 1) S.A. nie może być dłuższa niż 5 lat.',
    difficulty: 'medium',
    tags: ['kadencja', 'zarząd', 'rada nadzorcza', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-640',
    article: 'Art. 444 § 1 i § 3',
    articleTitle: 'Kapitał docelowy - limity',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Kapitał docelowy S.A.: maksymalny okres upoważnienia i maksymalna wysokość:',
    options: {
      a: 'Okres: 3 lata, wysokość: 3/4 kapitału zakładowego',
      b: 'Okres: 5 lat, wysokość: 1/2 kapitału zakładowego',
      c: 'Okres: 3 lata, wysokość: 1/2 kapitału zakładowego',
      d: 'Okres: 5 lat, wysokość: 3/4 kapitału zakładowego'
    },
    correct: 'a',
    explanation: 'Kapitał docelowy: upoważnienie na max 3 lata (art. 444 § 1), wysokość max 3/4 kapitału zakładowego z dnia udzielenia upoważnienia (art. 444 § 3).',
    difficulty: 'hard',
    tags: ['kapitał docelowy', 'limity', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-641',
    article: 'Art. 442 § 2',
    articleTitle: 'Warunkowe podwyższenie - limit',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Maksymalna wartość nominalna warunkowego podwyższenia kapitału zakładowego S.A.:',
    options: {
      a: 'Równa kapitałowi zakładowemu',
      b: 'Dwukrotność kapitału zakładowego z dnia podejmowania uchwały',
      c: '3/4 kapitału zakładowego',
      d: '1/2 kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 442 § 2 k.s.h. wartość nominalna warunkowego podwyższenia kapitału zakładowego nie może przekraczać dwukrotności kapitału zakładowego z dnia podejmowania uchwały.',
    difficulty: 'hard',
    tags: ['warunkowe podwyższenie', 'limit', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-642',
    article: 'Art. 362 § 2',
    articleTitle: 'Limit akcji własnych',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Maksymalna łączna wartość nominalna nabytych akcji własnych S.A.:',
    options: {
      a: '10% kapitału zakładowego',
      b: '20% kapitału zakładowego',
      c: '25% kapitału zakładowego',
      d: '30% kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 362 § 2 pkt 3 k.s.h. łączna wartość nominalna nabytych akcji własnych nie może przekraczać 20% kapitału zakładowego spółki.',
    difficulty: 'hard',
    tags: ['akcje własne', 'limit', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-643',
    article: 'Art. 418 § 1',
    articleTitle: 'Squeeze out - warunki',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Przymusowy wykup akcji (squeeze out) w S.A. - wymagana większość akcjonariuszy wykupujących:',
    options: {
      a: 'Co najmniej 90% kapitału zakładowego przez max 3 akcjonariuszy',
      b: 'Co najmniej 95% kapitału zakładowego przez max 5 akcjonariuszy',
      c: 'Co najmniej 90% kapitału zakładowego przez max 5 akcjonariuszy',
      d: 'Co najmniej 95% kapitału zakładowego przez max 3 akcjonariuszy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 418 § 1 k.s.h. squeeze out wymaga, aby nie więcej niż 5 akcjonariuszy posiadało łącznie nie mniej niż 95% kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['squeeze out', 'przymusowy wykup', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-644',
    article: 'Art. 433 § 2',
    articleTitle: 'Wyłączenie prawa poboru - większość',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Pozbawienie akcjonariuszy S.A. prawa poboru wymaga uchwały podjętej większością:',
    options: {
      a: 'Bezwzględną',
      b: '2/3 głosów',
      c: '3/4 głosów',
      d: '4/5 głosów'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 433 § 2 k.s.h. uchwała walnego zgromadzenia o pozbawieniu akcjonariuszy prawa poboru wymaga większości co najmniej czterech piątych głosów.',
    difficulty: 'hard',
    tags: ['prawo poboru', 'wyłączenie', 'większość', 'S.A.']
  },

  {
    id: 'ksh-645',
    article: 'Art. 246 § 1 i Art. 415',
    articleTitle: 'Zmiana umowy/statutu - większości',
    section: 'Porównanie spółek',
    subsection: 'Zmiana dokumentu założycielskiego',
    question: 'Większość wymagana do zmiany umowy sp. z o.o. vs zmiany statutu S.A.:',
    options: {
      a: 'Sp. z o.o.: 2/3 głosów, S.A.: 2/3 głosów',
      b: 'Sp. z o.o.: 2/3 głosów, S.A.: 3/4 głosów',
      c: 'Sp. z o.o.: 3/4 głosów, S.A.: 3/4 głosów',
      d: 'Sp. z o.o.: bezwzględna, S.A.: 2/3 głosów'
    },
    correct: 'b',
    explanation: 'Zmiana umowy sp. z o.o. wymaga większości 2/3 głosów (art. 246 § 1), zmiana statutu S.A. wymaga większości 3/4 głosów (art. 415 § 1).',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'zmiana statutu', 'większość', 'porównanie']
  }
];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PART7_STATS = {
  totalQuestions: KSH_EXAM_QUESTIONS_PART7.length,
  byDifficulty: {
    easy: KSH_EXAM_QUESTIONS_PART7.filter(q => q.difficulty === 'easy').length,
    medium: KSH_EXAM_QUESTIONS_PART7.filter(q => q.difficulty === 'medium').length,
    hard: KSH_EXAM_QUESTIONS_PART7.filter(q => q.difficulty === 'hard').length,
  },
  byTopic: {
    spzoo_podwyzszenie: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('podwyższenie kapitału') && q.tags.includes('sp. z o.o.')).length,
    spzoo_obnizenie: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('obniżenie kapitału') && q.tags.includes('sp. z o.o.')).length,
    spzoo_likwidacja: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('likwidacja') && q.section.includes('Spółka z o.o.')).length,
    spzoo_odpowiedzialnosc: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('odpowiedzialność') || q.tags.includes('art. 299')).length,
    sa_kapital: KSH_EXAM_QUESTIONS_PART7.filter(q => (q.tags.includes('podwyższenie kapitału') || q.tags.includes('obniżenie kapitału') || q.tags.includes('kapitał docelowy')) && q.tags.includes('S.A.')).length,
    sa_akcje: KSH_EXAM_QUESTIONS_PART7.filter(q => (q.tags.includes('akcje własne') || q.tags.includes('umorzenie akcji') || q.tags.includes('prawo poboru'))).length,
    porownania: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('porównanie')).length,
    liczby: KSH_EXAM_QUESTIONS_PART7.filter(q => q.tags.includes('liczby')).length,
  }
};

console.log('KSH Part 7 loaded:', PART7_STATS);
