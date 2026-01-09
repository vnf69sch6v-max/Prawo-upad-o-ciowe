// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 5 - Dodatkowe 100 pytań (pułapki egzaminacyjne, kazusy)
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART5: ExamQuestion[] = [

  // ============================================================
  // PUŁAPKI EGZAMINACYJNE - LICZBY I TERMINY
  // ============================================================

  {
    id: 'ksh-401',
    article: 'Art. 154 § 1',
    articleTitle: 'Minimalny kapitał sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał zakładowy spółki z o.o. powinien wynosić co najmniej:',
    options: {
      a: '1 zł',
      b: '5.000 zł',
      c: '50.000 zł',
      d: '100.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 154 § 1 k.s.h. kapitał zakładowy spółki z o.o. powinien wynosić co najmniej 5.000 złotych. To jedna z najczęściej sprawdzanych liczb na egzaminie.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'minimum', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-402',
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
    id: 'ksh-403',
    article: 'Art. 308 § 1',
    articleTitle: 'Minimalny kapitał S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał zakładowy spółki akcyjnej powinien wynosić co najmniej:',
    options: {
      a: '5.000 zł',
      b: '50.000 zł',
      c: '100.000 zł',
      d: '500.000 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 308 § 1 k.s.h. kapitał zakładowy spółki akcyjnej powinien wynosić co najmniej 100.000 złotych.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'minimum', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-404',
    article: 'Art. 308 § 2',
    articleTitle: 'Minimalna wartość akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wartość nominalna akcji w S.A. nie może być niższa niż:',
    options: {
      a: '1 grosz',
      b: '10 groszy',
      c: '50 groszy',
      d: '1 złoty'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 308 § 2 k.s.h. wartość nominalna akcji nie może być niższa niż 1 grosz.',
    difficulty: 'medium',
    tags: ['wartość nominalna', 'akcja', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-405',
    article: 'Art. 126 § 2',
    articleTitle: 'Minimalny kapitał S.K.A.',
    section: 'Tytuł V - Spółka komandytowo-akcyjna',
    subsection: 'Przepisy ogólne',
    question: 'Kapitał zakładowy spółki komandytowo-akcyjnej powinien wynosić co najmniej:',
    options: {
      a: '5.000 zł',
      b: '25.000 zł',
      c: '50.000 zł',
      d: '100.000 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 126 § 2 k.s.h. kapitał zakładowy spółki komandytowo-akcyjnej powinien wynosić co najmniej 50.000 złotych.',
    difficulty: 'medium',
    tags: ['kapitał zakładowy', 'minimum', 'S.K.A.', 'liczby']
  },

  {
    id: 'ksh-406',
    article: 'Art. 300³ § 1',
    articleTitle: 'Minimalny kapitał PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Kapitał akcyjny prostej spółki akcyjnej powinien wynosić co najmniej:',
    options: {
      a: '1 zł',
      b: '50 zł',
      c: '100 zł',
      d: '1.000 zł'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 300³ § 1 k.s.h. kapitał akcyjny prostej spółki akcyjnej powinien wynosić co najmniej 1 złoty. Jest to najniższy wymóg kapitałowy spośród wszystkich spółek kapitałowych.',
    difficulty: 'easy',
    tags: ['kapitał akcyjny', 'minimum', 'PSA', 'liczby']
  },

  {
    id: 'ksh-407',
    article: 'Art. 213 § 2',
    articleTitle: 'Obowiązkowa rada nadzorcza w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sp. z o.o. ustanowienie rady nadzorczej lub komisji rewizyjnej jest OBOWIĄZKOWE, gdy kapitał zakładowy przewyższa kwotę 500.000 zł, a wspólników jest więcej niż:',
    options: {
      a: '10',
      b: '15',
      c: '25',
      d: '50'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 213 § 2 k.s.h. w przypadku gdy kapitał zakładowy przewyższa kwotę 500.000 złotych, a wspólników jest więcej niż dwudziestu pięciu, powinna być ustanowiona rada nadzorcza lub komisja rewizyjna.',
    difficulty: 'hard',
    tags: ['rada nadzorcza', 'obligatoryjność', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-408',
    article: 'Art. 215 § 1',
    articleTitle: 'Minimalny skład rady nadzorczej sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza w sp. z o.o. składa się co najmniej z:',
    options: {
      a: '2 członków',
      b: '3 członków',
      c: '4 członków',
      d: '5 członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 215 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków powoływanych i odwoływanych uchwałą wspólników.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'skład', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-409',
    article: 'Art. 385 § 1',
    articleTitle: 'Minimalny skład rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza w S.A. składa się co najmniej z:',
    options: {
      a: '3 członków',
      b: '4 członków',
      c: '5 członków',
      d: '7 członków'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 385 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków, a w spółkach publicznych - co najmniej z pięciu członków.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'skład', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-410',
    article: 'Art. 385 § 1',
    articleTitle: 'Minimalny skład rady nadzorczej S.A. publicznej',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza w spółce akcyjnej PUBLICZNEJ składa się co najmniej z:',
    options: {
      a: '3 członków',
      b: '4 członków',
      c: '5 członków',
      d: '7 członków'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 385 § 1 k.s.h. rada nadzorcza w spółkach publicznych składa się co najmniej z pięciu członków.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'skład', 'spółka publiczna', 'liczby']
  },

  {
    id: 'ksh-411',
    article: 'Art. 386 § 1',
    articleTitle: 'Maksymalna kadencja rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Kadencja członka rady nadzorczej S.A. nie może być dłuższa niż:',
    options: {
      a: '3 lata',
      b: '4 lata',
      c: '5 lat',
      d: '6 lat'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 386 § 1 k.s.h. kadencja członka rady nadzorczej nie może być dłuższa niż pięć lat.',
    difficulty: 'medium',
    tags: ['kadencja', 'rada nadzorcza', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-412',
    article: 'Art. 369 § 1',
    articleTitle: 'Maksymalna kadencja zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Okres sprawowania funkcji przez członka zarządu S.A. nie może być dłuższy niż:',
    options: {
      a: '3 lata',
      b: '4 lata',
      c: '5 lat',
      d: 'Nie ma ograniczenia ustawowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 369 § 1 k.s.h. okres sprawowania funkcji przez członka zarządu nie może być dłuższy niż pięć lat (kadencja). Ponowne powołania tej samej osoby na członka zarządu są dopuszczalne na kadencje nie dłuższe niż pięć lat każda.',
    difficulty: 'medium',
    tags: ['kadencja', 'zarząd', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-413',
    article: 'Art. 174 § 3',
    articleTitle: 'Maksymalne uprzywilejowanie udziału co do głosu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Na udział uprzywilejowany w sp. z o.o. co do prawa głosu może przypadać maksymalnie:',
    options: {
      a: '2 głosy',
      b: '3 głosy',
      c: '5 głosów',
      d: '10 głosów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 174 § 3 k.s.h. na udział uprzywilejowany co do prawa głosu mogą przypadać nie więcej niż trzy głosy na jeden udział.',
    difficulty: 'hard',
    tags: ['uprzywilejowanie', 'głosy', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-414',
    article: 'Art. 351 § 1',
    articleTitle: 'Maksymalne uprzywilejowanie akcji co do głosu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Na akcję uprzywilejowaną w S.A. co do głosu mogą przypadać maksymalnie:',
    options: {
      a: '2 głosy',
      b: '3 głosy',
      c: '5 głosów',
      d: '10 głosów'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 351 § 1 k.s.h. statut może przyznać jednemu akcjonariuszowi indywidualnie oznaczone uprawnienia (akcje uprzywilejowane co do głosu). Zgodnie z art. 352 k.s.h. na każdą akcję uprzywilejowaną co do głosu może przypadać nie więcej niż dwa głosy.',
    difficulty: 'hard',
    tags: ['uprzywilejowanie', 'głosy', 'S.A.', 'liczby']
  },

  {
    id: 'ksh-415',
    article: 'Art. 236 § 1',
    articleTitle: 'Żądanie zwołania zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik lub wspólnicy sp. z o.o. reprezentujący co najmniej jaką część kapitału zakładowego mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników?',
    options: {
      a: '1/20',
      b: '1/10',
      c: '1/5',
      d: '1/4'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 236 § 1 k.s.h. wspólnik lub wspólnicy reprezentujący co najmniej jedną dziesiątą kapitału zakładowego mogą żądać zwołania nadzwyczajnego zgromadzenia wspólników.',
    difficulty: 'medium',
    tags: ['żądanie zwołania', 'kapitał', 'sp. z o.o.', 'liczby']
  },

  {
    id: 'ksh-416',
    article: 'Art. 400 § 1',
    articleTitle: 'Żądanie zwołania WZ przez akcjonariuszy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz lub akcjonariusze S.A. reprezentujący co najmniej jaką część kapitału zakładowego mogą żądać zwołania nadzwyczajnego walnego zgromadzenia?',
    options: {
      a: '1/20',
      b: '1/10',
      c: '1/5',
      d: '1/4'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 400 § 1 k.s.h. akcjonariusz lub akcjonariusze reprezentujący co najmniej jedną dwudziestą kapitału zakładowego mogą żądać zwołania nadzwyczajnego walnego zgromadzenia.',
    difficulty: 'hard',
    tags: ['żądanie zwołania', 'kapitał', 'S.A.', 'liczby']
  },

  // ============================================================
  // TERMINY - SZCZEGÓŁOWE PORÓWNANIA
  // ============================================================

  {
    id: 'ksh-417',
    article: 'Art. 238 § 1',
    articleTitle: 'Termin zawiadomienia o zgromadzeniu wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. zwołuje się za pomocą listów poleconych lub przesyłek nadanych pocztą kurierską, wysłanych co najmniej:',
    options: {
      a: 'Tydzień przed terminem zgromadzenia',
      b: 'Dwa tygodnie przed terminem zgromadzenia',
      c: 'Trzy tygodnie przed terminem zgromadzenia',
      d: 'Miesiąc przed terminem zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 238 § 1 k.s.h. zgromadzenie wspólników zwołuje się za pomocą listów poleconych lub przesyłek nadanych pocztą kurierską, wysłanych co najmniej dwa tygodnie przed terminem zgromadzenia wspólników.',
    difficulty: 'easy',
    tags: ['termin zawiadomienia', 'sp. z o.o.', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-418',
    article: 'Art. 402 § 1',
    articleTitle: 'Termin ogłoszenia o WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Walne zgromadzenie S.A. (niebędącej spółką publiczną) zwołuje się przez ogłoszenie dokonane co najmniej:',
    options: {
      a: 'Tydzień przed terminem zgromadzenia',
      b: 'Dwa tygodnie przed terminem zgromadzenia',
      c: 'Trzy tygodnie przed terminem zgromadzenia',
      d: 'Miesiąc przed terminem zgromadzenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 402 § 1 k.s.h. walne zgromadzenie zwołuje się przez ogłoszenie, które powinno być dokonane co najmniej na trzy tygodnie przed terminem walnego zgromadzenia.',
    difficulty: 'medium',
    tags: ['termin ogłoszenia', 'S.A.', 'walne zgromadzenie']
  },

  {
    id: 'ksh-419',
    article: 'Art. 231 § 1',
    articleTitle: 'Termin zwyczajnego zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zwyczajne zgromadzenie wspólników sp. z o.o. powinno odbyć się:',
    options: {
      a: 'W ciągu trzech miesięcy po zakończeniu roku obrotowego',
      b: 'W ciągu sześciu miesięcy po zakończeniu roku obrotowego',
      c: 'W ciągu dziewięciu miesięcy po zakończeniu roku obrotowego',
      d: 'W ciągu roku po zakończeniu roku obrotowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 231 § 1 k.s.h. zwyczajne zgromadzenie wspólników powinno odbyć się w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne zgromadzenie', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-420',
    article: 'Art. 395 § 1',
    articleTitle: 'Termin zwyczajnego WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Zwyczajne walne zgromadzenie S.A. powinno odbyć się:',
    options: {
      a: 'W ciągu trzech miesięcy po zakończeniu roku obrotowego',
      b: 'W ciągu sześciu miesięcy po zakończeniu roku obrotowego',
      c: 'W ciągu dziewięciu miesięcy po zakończeniu roku obrotowego',
      d: 'W ciągu roku po zakończeniu roku obrotowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 395 § 1 k.s.h. zwyczajne walne zgromadzenie powinno odbyć się w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne WZ', 'termin', 'S.A.']
  },

  {
    id: 'ksh-421',
    article: 'Art. 252 § 1',
    articleTitle: 'Termin na powództwo o nieważność uchwały sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wytoczenia powództwa o stwierdzenie nieważności uchwały wspólników sp. z o.o. wygasa z upływem:',
    options: {
      a: 'Miesiąca od dnia powzięcia uchwały',
      b: 'Trzech miesięcy od dnia powzięcia uchwały',
      c: 'Sześciu miesięcy od dnia powzięcia uchwały',
      d: 'Nie wygasa (uchwała bezwzględnie nieważna)'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 252 § 3 k.s.h. prawo do wytoczenia powództwa o stwierdzenie nieważności uchwały wspólników wygasa z upływem sześciu miesięcy od dnia otrzymania wiadomości o uchwale, jednakże nie później niż z upływem trzech lat od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['nieważność uchwały', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-422',
    article: 'Art. 251',
    articleTitle: 'Termin na powództwo o uchylenie uchwały sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Powództwo o uchylenie uchwały wspólników sp. z o.o. należy wnieść w terminie:',
    options: {
      a: '14 dni od dnia otrzymania wiadomości o uchwale, nie później niż w terminie miesiąca od dnia powzięcia',
      b: 'Miesiąca od dnia otrzymania wiadomości o uchwale, nie później niż w terminie sześciu miesięcy od dnia powzięcia',
      c: 'Trzech miesięcy od dnia powzięcia uchwały',
      d: 'Sześciu miesięcy od dnia powzięcia uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 251 k.s.h. powództwo o uchylenie uchwały wspólników należy wnieść w terminie miesiąca od dnia otrzymania wiadomości o uchwale, nie później jednak niż w terminie sześciu miesięcy od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['uchylenie uchwały', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-423',
    article: 'Art. 279',
    articleTitle: 'Termin na zgłoszenie wierzytelności w likwidacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorzy sp. z o.o. wzywają wierzycieli do zgłoszenia ich wierzytelności w terminie:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Dwóch miesięcy od dnia ogłoszenia',
      c: 'Trzech miesięcy od dnia ogłoszenia',
      d: 'Sześciu miesięcy od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 279 k.s.h. likwidatorzy powinni ogłosić o rozwiązaniu spółki i otwarciu likwidacji, wzywając wierzycieli do zgłoszenia ich wierzytelności w terminie trzech miesięcy od dnia tego ogłoszenia.',
    difficulty: 'medium',
    tags: ['likwidacja', 'wierzyciele', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-424',
    article: 'Art. 286 § 1',
    articleTitle: 'Termin na podział majątku w likwidacji sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli sp. z o.o. nie może nastąpić przed upływem:',
    options: {
      a: 'Miesiąca od dnia ogłoszenia',
      b: 'Trzech miesięcy od dnia ogłoszenia',
      c: 'Sześciu miesięcy od dnia ogłoszenia o otwarciu likwidacji',
      d: 'Roku od dnia ogłoszenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 286 § 1 k.s.h. podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli nie może nastąpić przed upływem sześciu miesięcy od daty ogłoszenia o otwarciu likwidacji i wezwaniu wierzycieli.',
    difficulty: 'hard',
    tags: ['likwidacja', 'podział majątku', 'termin', 'sp. z o.o.']
  },

  // ============================================================
  // KAZUSY EGZAMINACYJNE - SCENARIUSZE
  // ============================================================

  {
    id: 'ksh-425',
    article: 'Art. 17 § 1 i § 2',
    articleTitle: 'Kazus: czynność bez wymaganej uchwały',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zarząd sp. z o.o. zawarł umowę sprzedaży nieruchomości spółki bez wymaganej przez USTAWĘ uchwały wspólników. Umowa ta jest:',
    options: {
      a: 'Ważna',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. jeżeli do dokonania czynności prawnej przez spółkę USTAWA wymaga uchwały wspólników albo walnego zgromadzenia bądź rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest nieważna.',
    difficulty: 'hard',
    tags: ['kazus', 'nieważność', 'uchwała', 'ustawa']
  },

  {
    id: 'ksh-426',
    article: 'Art. 17 § 1 i § 2',
    articleTitle: 'Kazus: czynność bez uchwały wymaganej przez umowę',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zarząd sp. z o.o. zawarł umowę sprzedaży samochodu spółki bez wymaganej przez UMOWĘ SPÓŁKI uchwały wspólników. Umowa ta jest:',
    options: {
      a: 'Ważna (ale członkowie zarządu mogą odpowiadać wobec spółki)',
      b: 'Nieważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 17 § 2 k.s.h. czynność prawna dokonana bez zgody właściwego organu spółki, wymaganej wyłącznie przez UMOWĘ spółki albo statut, jest WAŻNA, jednak nie wyklucza to odpowiedzialności członków zarządu wobec spółki.',
    difficulty: 'hard',
    tags: ['kazus', 'ważność', 'uchwała', 'umowa spółki']
  },

  {
    id: 'ksh-427',
    article: 'Art. 210 § 2',
    articleTitle: 'Kazus: umowa jedynego wspólnika ze spółką',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jan Kowalski jest jedynym wspólnikiem i jedynym członkiem zarządu sp. z o.o. "ABC". Chce zawrzeć umowę najmu lokalu ze spółką. W jakiej formie musi być zawarta ta umowa?',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z datą pewną',
      c: 'Aktu notarialnego',
      d: 'Pisemnej z podpisami notarialnie poświadczonymi'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 210 § 2 k.s.h. w przypadku gdy wspólnik jest zarazem jedynym członkiem zarządu, czynność prawna między tym wspólnikiem a reprezentowaną przez niego spółką wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['kazus', 'spółka jednoosobowa', 'forma aktu notarialnego']
  },

  {
    id: 'ksh-428',
    article: 'Art. 299 § 1',
    articleTitle: 'Kazus: odpowiedzialność członka zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Spółka z o.o. nie zapłaciła faktury dostawcy. Egzekucja przeciwko spółce okazała się bezskuteczna. Wierzyciel chce pozwać członka zarządu. Członek zarządu może uwolnić się od odpowiedzialności, jeżeli wykaże, że:',
    options: {
      a: 'Nie wiedział o długu',
      b: 'Nie był w zarządzie w dniu powstania zobowiązania',
      c: 'We właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub niezgłoszenie wniosku nastąpiło nie z jego winy, lub wierzyciel nie poniósł szkody',
      d: 'Działał w dobrej wierze'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może się uwolnić od odpowiedzialności, jeżeli wykaże, że: we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub wszczęto postępowanie restrukturyzacyjne, albo że niezgłoszenie wniosku nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku wierzyciel nie poniósł szkody.',
    difficulty: 'hard',
    tags: ['kazus', 'art. 299', 'odpowiedzialność zarządu']
  },

  {
    id: 'ksh-429',
    article: 'Art. 182 § 1',
    articleTitle: 'Kazus: zbycie udziału bez wymaganej zgody',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa sp. z o.o. wymaga zgody zarządu na zbycie udziału. Wspólnik zbył udział bez tej zgody. Jakie są skutki prawne?',
    options: {
      a: 'Umowa zbycia jest bezwzględnie nieważna',
      b: 'Umowa zbycia jest bezskuteczna wobec spółki',
      c: 'Umowa zbycia jest ważna, ale wspólnik odpowiada wobec spółki',
      d: 'Umowa zbycia wymaga potwierdzenia przez sąd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 182 § 1 k.s.h. zbycie udziału, jego części lub ułamkowej części udziału oraz zastawienie udziału umowa spółki może uzależnić od zgody spółki albo w inny sposób ograniczyć. Zbycie bez wymaganej zgody jest bezskuteczne wobec spółki.',
    difficulty: 'hard',
    tags: ['kazus', 'zbycie udziału', 'zgoda spółki']
  },

  {
    id: 'ksh-430',
    article: 'Art. 240',
    articleTitle: 'Kazus: zgromadzenie bez formalnego zwołania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wszyscy wspólnicy sp. z o.o. spotkali się przypadkowo na konferencji. Czy mogą podjąć wiążące uchwały bez formalnego zwołania zgromadzenia?',
    options: {
      a: 'Nie, zawsze wymagane jest formalne zwołanie',
      b: 'Tak, jeżeli cały kapitał jest reprezentowany i nikt z obecnych nie zgłosił sprzeciwu co do odbycia zgromadzenia lub wniesienia sprawy do porządku obrad',
      c: 'Tak, jeżeli jest obecna większość wspólników',
      d: 'Tak, ale tylko za zgodą zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 240 k.s.h. uchwały można powziąć pomimo braku formalnego zwołania zgromadzenia wspólników, jeżeli cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu dotyczącego odbycia zgromadzenia lub wniesienia poszczególnych spraw do porządku obrad.',
    difficulty: 'medium',
    tags: ['kazus', 'zgromadzenie bez zwołania', 'sp. z o.o.']
  },

  {
    id: 'ksh-431',
    article: 'Art. 112 § 1',
    articleTitle: 'Kazus: odpowiedzialność komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Komandytariusz wniósł do spółki komandytowej wkład w wysokości 50.000 zł. Suma komandytowa wynosi 30.000 zł. Wobec wierzycieli spółki komandytariusz:',
    options: {
      a: 'Odpowiada do wysokości 50.000 zł',
      b: 'Odpowiada do wysokości 30.000 zł',
      c: 'Nie odpowiada osobiście',
      d: 'Odpowiada do wysokości 20.000 zł (różnica)'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 112 § 1 k.s.h. komandytariusz jest wolny od odpowiedzialności w granicach wartości wkładu wniesionego do spółki. Skoro wniósł wkład (50.000 zł) wyższy niż suma komandytowa (30.000 zł), jest całkowicie wolny od osobistej odpowiedzialności wobec wierzycieli.',
    difficulty: 'hard',
    tags: ['kazus', 'komandytariusz', 'suma komandytowa', 'wkład']
  },

  {
    id: 'ksh-432',
    article: 'Art. 104 § 4',
    articleTitle: 'Kazus: nazwisko komandytariusza w firmie',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'W firmie spółki komandytowej umieszczono nazwisko komandytariusza. Jaki jest skutek prawny?',
    options: {
      a: 'Firma jest nieważna',
      b: 'Komandytariusz odpowiada wobec osób trzecich tak jak komplementariusz',
      c: 'Komandytariusz traci status komandytariusza',
      d: 'Brak skutków prawnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 104 § 4 k.s.h. jeżeli nazwisko komandytariusza zostanie zamieszczone w firmie spółki, komandytariusz ten odpowiada wobec osób trzecich tak jak komplementariusz (tj. bez ograniczenia).',
    difficulty: 'hard',
    tags: ['kazus', 'firma', 'komandytariusz', 'odpowiedzialność']
  },

  {
    id: 'ksh-433',
    article: 'Art. 211',
    articleTitle: 'Kazus: zakaz konkurencji członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. chce zostać wspólnikiem w konkurencyjnej spółce z o.o. Zgodnie z k.s.h.:',
    options: {
      a: 'Jest to bezwzględnie zakazane',
      b: 'Wymaga zgody organu uprawnionego do powołania zarządu, chyba że umowa stanowi inaczej',
      c: 'Wymaga tylko pisemnego powiadomienia rady nadzorczej',
      d: 'Jest dozwolone bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 211 § 1 k.s.h. członek zarządu nie może bez zgody spółki zajmować się interesami konkurencyjnymi ani też uczestniczyć w spółce konkurencyjnej jako wspólnik spółki cywilnej, spółki osobowej lub jako członek organu spółki kapitałowej bądź uczestniczyć w innej konkurencyjnej osobie prawnej jako członek organu. Zgody udziela organ uprawniony do powołania zarządu, chyba że umowa stanowi inaczej.',
    difficulty: 'medium',
    tags: ['kazus', 'zakaz konkurencji', 'członek zarządu']
  },

  {
    id: 'ksh-434',
    article: 'Art. 266 § 1',
    articleTitle: 'Kazus: wyłączenie wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wspólnicy sp. z o.o. chcą wyłączyć jednego wspólnika z ważnych przyczyn dotyczących tego wspólnika. Jakie są wymogi formalne?',
    options: {
      a: 'Uchwała wspólników większością 3/4 głosów',
      b: 'Powództwo wspólników reprezentujących więcej niż połowę kapitału zakładowego, skierowane przeciwko wspólnikowi, o wyłączenie przez sąd',
      c: 'Decyzja zarządu',
      d: 'Wniosek do sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 266 § 1 k.s.h. z ważnych przyczyn dotyczących danego wspólnika sąd może orzec jego wyłączenie ze spółki na żądanie wszystkich pozostałych wspólników, jeżeli udziały wspólników żądających wyłączenia stanowią więcej niż połowę kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['kazus', 'wyłączenie wspólnika', 'sąd']
  },

  // ============================================================
  // PORÓWNANIA MIĘDZY SPÓŁKAMI - PUŁAPKI
  // ============================================================

  {
    id: 'ksh-435',
    article: 'Różne',
    articleTitle: 'Porównanie: źródło wynagrodzenia zarządu',
    section: 'Porównanie spółek',
    subsection: 'Zarząd',
    question: 'Kto ustala wynagrodzenie członków zarządu w sp. z o.o., jeżeli umowa spółki nie stanowi inaczej?',
    options: {
      a: 'Rada nadzorcza',
      b: 'Zgromadzenie wspólników',
      c: 'Prezes zarządu dla pozostałych członków',
      d: 'Komisja rewizyjna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 203¹ § 1 k.s.h. uchwała wspólników może ustalać zasady wynagradzania członków zarządu. Jeżeli umowa spółki nie stanowi inaczej, wynagrodzenie członków zarządu zatrudnionych na podstawie umowy o pracę lub innej umowy określa organ uprawniony do ich powołania, czyli co do zasady zgromadzenie wspólników.',
    difficulty: 'hard',
    tags: ['wynagrodzenie zarządu', 'sp. z o.o.', 'porównanie']
  },

  {
    id: 'ksh-436',
    article: 'Art. 201 § 4',
    articleTitle: 'Powoływanie zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członków zarządu sp. z o.o. powołuje:',
    options: {
      a: 'Rada nadzorcza',
      b: 'Zgromadzenie wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Założyciele',
      d: 'Sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 201 § 4 k.s.h. członek zarządu jest powoływany i odwoływany uchwałą wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['powoływanie zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-437',
    article: 'Art. 368 § 4',
    articleTitle: 'Powoływanie zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członków zarządu S.A. powołuje:',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza, chyba że statut stanowi inaczej',
      c: 'Założyciele',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 368 § 4 k.s.h. członków zarządu powołuje i odwołuje rada nadzorcza, chyba że statut spółki stanowi inaczej. To istotna różnica w stosunku do sp. z o.o., gdzie domyślnie powołuje zgromadzenie wspólników.',
    difficulty: 'medium',
    tags: ['powoływanie zarządu', 'S.A.', 'porównanie']
  },

  {
    id: 'ksh-438',
    article: 'Różne',
    articleTitle: 'Porównanie: reprezentacja przez pełnomocnika',
    section: 'Porównanie spółek',
    subsection: 'Pełnomocnik',
    question: 'Członek zarządu lub pracownik spółki NIE może być pełnomocnikiem wspólnika/akcjonariusza na zgromadzeniu w:',
    options: {
      a: 'Tylko w sp. z o.o.',
      b: 'Tylko w S.A.',
      c: 'Zarówno w sp. z o.o., jak i w S.A.',
      d: 'W żadnej spółce kapitałowej takiego zakazu nie ma'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 243 § 3 k.s.h. (sp. z o.o.) i art. 412 § 3 k.s.h. (S.A.) członek zarządu i pracownik spółki nie mogą być pełnomocnikami na zgromadzeniu wspólników/walnym zgromadzeniu.',
    difficulty: 'medium',
    tags: ['pełnomocnik', 'zakaz', 'porównanie']
  },

  {
    id: 'ksh-439',
    article: 'Różne',
    articleTitle: 'Porównanie: głosowanie tajne',
    section: 'Porównanie spółek',
    subsection: 'Głosowanie',
    question: 'Głosowanie tajne jest OBLIGATORYJNE przy wyborach i w sprawach osobowych:',
    options: {
      a: 'Tylko w sp. z o.o.',
      b: 'Tylko w S.A.',
      c: 'Zarówno w sp. z o.o., jak i w S.A.',
      d: 'W żadnej spółce kapitałowej nie jest obligatoryjne'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 247 § 2 k.s.h. (sp. z o.o.) i art. 420 § 2 k.s.h. (S.A.) tajne głosowanie zarządza się przy wyborach oraz nad wnioskami o odwołanie członków organów spółki lub likwidatorów, o pociągnięcie ich do odpowiedzialności, jak również w sprawach osobowych.',
    difficulty: 'easy',
    tags: ['głosowanie tajne', 'obligatoryjne', 'porównanie']
  },

  {
    id: 'ksh-440',
    article: 'Różne',
    articleTitle: 'Porównanie: odpowiedzialność za zobowiązania spółki',
    section: 'Porównanie spółek',
    subsection: 'Odpowiedzialność',
    question: 'W której spółce wspólnicy NIGDY nie odpowiadają osobiście za zobowiązania spółki (po wpisie do rejestru)?',
    options: {
      a: 'Spółka jawna',
      b: 'Spółka komandytowa (komandytariusz)',
      c: 'Spółka z o.o. (wspólnicy)',
      d: 'Żadna z powyższych - wszędzie istnieje jakaś odpowiedzialność'
    },
    correct: 'c',
    explanation: 'W sp. z o.o. wspólnicy nie odpowiadają za zobowiązania spółki (art. 151 § 4 k.s.h.). W spółce jawnej wspólnicy odpowiadają bez ograniczeń. W spółce komandytowej komandytariusz odpowiada do sumy komandytowej (chyba że wniósł wyższy wkład).',
    difficulty: 'medium',
    tags: ['odpowiedzialność', 'wspólnicy', 'porównanie']
  },

  // ============================================================
  // SPÓŁKA OSOBOWA VS KAPITAŁOWA - RÓŻNICE KLUCZOWE
  // ============================================================

  {
    id: 'ksh-441',
    article: 'Art. 8 § 1 i Art. 12',
    articleTitle: 'Osobowość prawna spółek',
    section: 'Porównanie spółek',
    subsection: 'Osobowość prawna',
    question: 'Którym spółkom handlowym przysługuje osobowość prawna?',
    options: {
      a: 'Tylko spółkom kapitałowym',
      b: 'Wszystkim spółkom handlowym',
      c: 'Tylko spółce akcyjnej',
      d: 'Spółkom kapitałowym i spółce komandytowo-akcyjnej'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 12 k.s.h. osobowość prawną spółka kapitałowa uzyskuje z chwilą wpisu do rejestru. Spółki osobowe nie mają osobowości prawnej, ale mają zdolność prawną (art. 8 § 1 k.s.h.).',
    difficulty: 'easy',
    tags: ['osobowość prawna', 'spółka kapitałowa', 'spółka osobowa']
  },

  {
    id: 'ksh-442',
    article: 'Art. 8 § 1',
    articleTitle: 'Zdolność prawna spółek osobowych',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Spółka osobowa może we własnym imieniu nabywać prawa, w tym własność nieruchomości. Oznacza to, że spółka osobowa ma:',
    options: {
      a: 'Osobowość prawną',
      b: 'Zdolność prawną (ale nie osobowość prawną)',
      c: 'Zdolność do czynności prawnych, ale nie zdolność prawną',
      d: 'Ani zdolności prawnej, ani osobowości prawnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 8 § 1 k.s.h. spółka osobowa może we własnym imieniu nabywać prawa, zaciągać zobowiązania, pozywać i być pozywana. Ma więc zdolność prawną, ale nie ma osobowości prawnej (tę mają tylko spółki kapitałowe).',
    difficulty: 'medium',
    tags: ['zdolność prawna', 'osobowość prawna', 'spółka osobowa']
  },

  {
    id: 'ksh-443',
    article: 'Art. 22 § 2',
    articleTitle: 'Odpowiedzialność w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Wspólnik spółki jawnej odpowiada za zobowiązania spółki:',
    options: {
      a: 'Tylko majątkiem spółki',
      b: 'Całym swoim majątkiem, bez ograniczeń, solidarnie z pozostałymi wspólnikami i ze spółką',
      c: 'Do wysokości wniesionego wkładu',
      d: 'Tylko subsydiarnie, po bezskutecznej egzekucji z majątku spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 22 § 2 k.s.h. każdy wspólnik odpowiada za zobowiązania spółki bez ograniczenia całym swoim majątkiem solidarnie z pozostałymi wspólnikami oraz ze spółką. Odpowiedzialność jest jednak subsydiarna (art. 31 § 1).',
    difficulty: 'medium',
    tags: ['odpowiedzialność', 'bez ograniczeń', 'spółka jawna']
  },

  {
    id: 'ksh-444',
    article: 'Art. 31 § 1',
    articleTitle: 'Subsydiarność odpowiedzialności wspólnika',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Wierzyciel spółki jawnej może prowadzić egzekucję z majątku wspólnika:',
    options: {
      a: 'Natychmiast, bez egzekucji z majątku spółki',
      b: 'Dopiero gdy egzekucja z majątku spółki okaże się bezskuteczna (subsydiarność)',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko w przypadku upadłości spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 31 § 1 k.s.h. wierzyciel spółki może prowadzić egzekucję z majątku wspólnika w przypadku, gdy egzekucja z majątku spółki okaże się bezskuteczna (subsydiarność odpowiedzialności).',
    difficulty: 'medium',
    tags: ['subsydiarność', 'egzekucja', 'wspólnik']
  },

  // ============================================================
  // DODATKOWE PYTANIA SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-445',
    article: 'Art. 159',
    articleTitle: 'Szczególne korzyści w umowie sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli umowa sp. z o.o. przewiduje dla wspólników szczególne korzyści, postanowienie takie wymaga:',
    options: {
      a: 'Zgody większości wspólników',
      b: 'Zgody wszystkich wspólników (jednomyślność)',
      c: 'Zgody rady nadzorczej',
      d: 'Zatwierdzenia przez sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 159 k.s.h. jeżeli wspólnikowi mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone, oprócz wniesienia wkładów na pokrycie udziałów, inne obowiązki wobec spółki, należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki. Takie postanowienia wymagają zgody wszystkich wspólników.',
    difficulty: 'hard',
    tags: ['szczególne korzyści', 'jednomyślność', 'sp. z o.o.']
  },

  {
    id: 'ksh-446',
    article: 'Art. 195 § 1',
    articleTitle: 'Zaliczka na poczet dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Spółka z o.o. może wypłacić wspólnikom zaliczkę na poczet przewidywanej dywidendy, jeżeli:',
    options: {
      a: 'Wszyscy wspólnicy wyrażą na to zgodę',
      b: 'Umowa spółki upoważnia zarząd do wypłaty zaliczki i spółka posiada środki wystarczające na wypłatę',
      c: 'Zatwierdzi to rada nadzorcza',
      d: 'Wyrazi zgodę sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 194 k.s.h. umowa spółki może upoważniać zarząd do wypłaty wspólnikom zaliczki na poczet przewidywanej dywidendy za rok obrotowy, jeżeli spółka posiada środki wystarczające na wypłatę.',
    difficulty: 'medium',
    tags: ['zaliczka na dywidendę', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-447',
    article: 'Art. 229',
    articleTitle: 'Nabycie nieruchomości przez sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Nabycie nieruchomości przez sp. z o.o. przed upływem dwóch lat od dnia zarejestrowania spółki wymaga uchwały wspólników, jeżeli cena nabycia przewyższa:',
    options: {
      a: '1/4 kapitału zakładowego',
      b: 'Połowę kapitału zakładowego',
      c: 'Kapitał zakładowy',
      d: 'Dwukrotność kapitału zakładowego'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 229 k.s.h. nabycie przez spółkę przed upływem dwóch lat od dnia zarejestrowania nieruchomości za cenę przewyższającą jedną czwartą kapitału zakładowego, nie niższą jednak od 50.000 złotych, wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['nabycie nieruchomości', '2 lata', 'sp. z o.o.']
  },

  {
    id: 'ksh-448',
    article: 'Art. 197',
    articleTitle: 'Świadczenia powtarzające się',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa sp. z o.o. może zobowiązać wspólnika do powtarzających się świadczeń niepieniężnych. Wynagrodzenie za takie świadczenia:',
    options: {
      a: 'Musi odpowiadać cenom rynkowym, niezależnie od bilansu',
      b: 'Jest wypłacane także w przypadku gdy bilans nie wykazuje czystego zysku',
      c: 'Nie jest wypłacane gdy spółka wykazuje stratę',
      d: 'Wymaga każdorazowej uchwały zgromadzenia wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 176 § 2 k.s.h. wynagrodzenie wspólnika za takie świadczenia na rzecz spółki jest wypłacane przez spółkę także w przypadku, gdy sprawozdanie finansowe nie wykazuje zysku. Wynagrodzenie nie może przewyższać cen lub stawek przyjętych w obrocie.',
    difficulty: 'hard',
    tags: ['świadczenia powtarzające się', 'wynagrodzenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-449',
    article: 'Art. 199 § 1',
    articleTitle: 'Przesłanki umorzenia udziałów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umorzenie udziału w sp. z o.o. jest możliwe:',
    options: {
      a: 'Zawsze, bez względu na postanowienia umowy spółki',
      b: 'Tylko jeżeli umowa spółki tak stanowi',
      c: 'Tylko za zgodą sądu rejestrowego',
      d: 'Tylko w drodze obniżenia kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 199 § 1 k.s.h. udział może być umorzony jedynie po wpisie spółki do rejestru i tylko w przypadku, gdy umowa spółki tak stanowi.',
    difficulty: 'medium',
    tags: ['umorzenie udziałów', 'umowa spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-450',
    article: 'Art. 200 § 1',
    articleTitle: 'Zakaz nabywania udziałów własnych',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Sp. z o.o. może nabywać własne udziały:',
    options: {
      a: 'Bez ograniczeń',
      b: 'Tylko w celu umorzenia lub w innych przypadkach przewidzianych w ustawie',
      c: 'Tylko za zgodą zgromadzenia wspólników',
      d: 'Nigdy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 200 § 1 k.s.h. spółka nie może obejmować, nabywać ani przyjmować w zastaw własnych udziałów. Zakaz ten nie dotyczy nabycia w drodze egzekucji na zaspokojenie roszczeń spółki, nabycia w celu umorzenia oraz innych przypadków przewidzianych w ustawie.',
    difficulty: 'medium',
    tags: ['udziały własne', 'zakaz', 'sp. z o.o.']
  },

  // ============================================================
  // S.A. - SZCZEGÓŁOWE PRZEPISY
  // ============================================================

  {
    id: 'ksh-451',
    article: 'Art. 301 § 1',
    articleTitle: 'Zawiązanie S.A. - wymóg formy',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zawiązać spółkę akcyjną może jedna albo więcej osób. Statut spółki akcyjnej powinien być sporządzony w formie:',
    options: {
      a: 'Pisemnej',
      b: 'Pisemnej z podpisami notarialnie poświadczonymi',
      c: 'Aktu notarialnego',
      d: 'Dokumentu urzędowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 301 § 2 k.s.h. statut spółki akcyjnej powinien być sporządzony w formie aktu notarialnego. Osoby podpisujące statut są założycielami spółki.',
    difficulty: 'easy',
    tags: ['statut S.A.', 'forma', 'akt notarialny']
  },

  {
    id: 'ksh-452',
    article: 'Art. 301 § 1',
    articleTitle: 'Zakaz zawiązania S.A. przez jednoosobową sp. z o.o.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka akcyjna NIE może być zawiązana wyłącznie przez:',
    options: {
      a: 'Jedną osobę fizyczną',
      b: 'Jednoosobową spółkę z ograniczoną odpowiedzialnością',
      c: 'Spółkę jawną',
      d: 'Fundację'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 301 § 1 zd. 2 k.s.h. spółka akcyjna nie może być zawiązana wyłącznie przez jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['zawiązanie S.A.', 'zakaz', 'jednoosobowa sp. z o.o.']
  },

  {
    id: 'ksh-453',
    article: 'Art. 309 § 3',
    articleTitle: 'Minimalna wpłata na akcje przed rejestracją',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje obejmowane za wkłady pieniężne powinny być opłacone przed zarejestrowaniem spółki co najmniej w:',
    options: {
      a: 'Całości',
      b: 'Jednej drugiej wartości nominalnej',
      c: 'Jednej czwartej wartości nominalnej',
      d: 'Jednej dziesiątej wartości nominalnej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. akcje obejmowane za wkłady pieniężne powinny być opłacone przed zarejestrowaniem spółki co najmniej w jednej czwartej ich wartości nominalnej.',
    difficulty: 'hard',
    tags: ['wpłata na akcje', 'przed rejestracją', 'S.A.']
  },

  {
    id: 'ksh-454',
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
    tags: ['wkłady niepieniężne', 'termin', 'S.A.']
  },

  {
    id: 'ksh-455',
    article: 'Art. 328 § 1',
    articleTitle: 'Dematerializacja akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje spółki niepublicznej:',
    options: {
      a: 'Są dokumentami papierowymi',
      b: 'Nie mają formy dokumentu (dematerializacja) i podlegają rejestracji w rejestrze akcjonariuszy',
      c: 'Mogą być tylko na okaziciela',
      d: 'Wymagają poświadczenia notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 328¹ § 1 k.s.h. akcje nie mają formy dokumentu. Akcje spółki niebędącej spółką publiczną podlegają zarejestrowaniu w rejestrze akcjonariuszy.',
    difficulty: 'medium',
    tags: ['dematerializacja', 'rejestr akcjonariuszy', 'S.A.']
  },

  {
    id: 'ksh-456',
    article: 'Art. 340 § 1',
    articleTitle: 'Prawo do dywidendy w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcjonariusze S.A. mają prawo do udziału w zysku wykazanym w sprawozdaniu finansowym, zbadanym przez biegłego rewidenta:',
    options: {
      a: 'Automatycznie, z mocy ustawy',
      b: 'Po podzieleniu go przez walne zgromadzenie do podziału między akcjonariuszy',
      c: 'Po zatwierdzeniu przez radę nadzorczą',
      d: 'Po złożeniu wniosku przez akcjonariusza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 347 § 1 k.s.h. akcjonariusze mają prawo do udziału w zysku wykazanym w sprawozdaniu finansowym, zbadanym przez biegłego rewidenta, który został przeznaczony przez walne zgromadzenie do wypłaty akcjonariuszom.',
    difficulty: 'easy',
    tags: ['prawo do dywidendy', 'walne zgromadzenie', 'S.A.']
  },

  {
    id: 'ksh-457',
    article: 'Art. 359 § 1',
    articleTitle: 'Umorzenie akcji w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje S.A. mogą być umorzone:',
    options: {
      a: 'Zawsze, bez ograniczeń',
      b: 'Tylko w przypadku gdy statut tak stanowi',
      c: 'Tylko za zgodą wszystkich akcjonariuszy',
      d: 'Tylko za zgodą KNF'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 359 § 1 k.s.h. akcje mogą być umorzone w przypadku, gdy statut tak stanowi. Statut powinien określać przesłanki i tryb umorzenia akcji.',
    difficulty: 'medium',
    tags: ['umorzenie akcji', 'statut', 'S.A.']
  },

  {
    id: 'ksh-458',
    article: 'Art. 375¹',
    articleTitle: 'Zakaz konkurencji członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członek zarządu S.A. nie może bez zgody spółki zajmować się interesami konkurencyjnymi. Zgody udziela:',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza, chyba że statut stanowi inaczej',
      c: 'Prezes zarządu',
      d: 'Komisja rewizyjna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 380 § 1 k.s.h. członek zarządu nie może bez zgody spółki zajmować się interesami konkurencyjnymi ani też uczestniczyć w spółce konkurencyjnej. Zgody udziela organ uprawniony do powołania zarządu spółki, czyli co do zasady rada nadzorcza, chyba że statut stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zakaz konkurencji', 'zgoda', 'S.A.']
  },

  {
    id: 'ksh-459',
    article: 'Art. 381',
    articleTitle: 'Obligatoryjność rady nadzorczej w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza w spółce akcyjnej jest organem:',
    options: {
      a: 'Fakultatywnym',
      b: 'Obligatoryjnym w każdej S.A.',
      c: 'Obligatoryjnym tylko w spółkach publicznych',
      d: 'Obligatoryjnym tylko gdy kapitał przekracza 500.000 zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 381 k.s.h. w spółce akcyjnej ustanawia się radę nadzorczą. Rada nadzorcza sprawuje stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności. Jest to organ obligatoryjny w każdej S.A.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'obligatoryjność', 'S.A.']
  },

  {
    id: 'ksh-460',
    article: 'Art. 389',
    articleTitle: 'Częstotliwość posiedzeń rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. powinna być zwoływana w miarę potrzeb, nie rzadziej jednak niż:',
    options: {
      a: 'Raz w miesiącu',
      b: 'Raz na dwa miesiące',
      c: 'Raz w każdym kwartale roku obrotowego',
      d: 'Raz na pół roku'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 389 § 3 k.s.h. rada nadzorcza powinna być zwoływana w miarę potrzeb, nie rzadziej jednak niż raz w każdym kwartale roku obrotowego.',
    difficulty: 'medium',
    tags: ['posiedzenia rady', 'częstotliwość', 'S.A.']
  },

  // ============================================================
  // GRUPA SPÓŁEK - SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-461',
    article: 'Art. 21¹ § 1',
    articleTitle: 'Uczestnictwo w grupie spółek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Spółka zależna może uczestniczyć w grupie spółek na podstawie:',
    options: {
      a: 'Decyzji zarządu',
      b: 'Uchwały zgromadzenia wspólników/walnego zgromadzenia większością 3/4 głosów',
      c: 'Umowy ze spółką dominującą',
      d: 'Wpisu do rejestru'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21¹ § 2 k.s.h. uczestnictwo w grupie spółek wymaga podjęcia uchwały przez zgromadzenie wspólników albo walne zgromadzenie spółki zależnej większością trzech czwartych głosów.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'uchwała', 'większość 3/4']
  },

  {
    id: 'ksh-462',
    article: 'Art. 21² § 1',
    articleTitle: 'Wiążące polecenie - forma',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wiążące polecenie spółki dominującej do spółki zależnej wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej lub elektronicznej pod rygorem nieważności',
      c: 'Aktu notarialnego',
      d: 'Dokumentowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21² § 3 k.s.h. wiążące polecenie wymaga formy pisemnej lub elektronicznej pod rygorem nieważności.',
    difficulty: 'hard',
    tags: ['wiążące polecenie', 'forma', 'grupa spółek']
  },

  {
    id: 'ksh-463',
    article: 'Art. 21⁴ § 1',
    articleTitle: 'Odmowa wykonania wiążącego polecenia',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Spółka zależna uczestnicząca w grupie spółek może odmówić wykonania wiążącego polecenia, jeżeli:',
    options: {
      a: 'Polecenie jest niekorzystne dla spółki zależnej',
      b: 'Polecenie jest sprzeczne z prawem lub jego wykonanie doprowadzi do niewypłacalności spółki zależnej',
      c: 'Zarząd spółki zależnej nie zgadza się z poleceniem',
      d: 'Wspólnicy mniejszościowi zgłoszą sprzeciw'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21⁴ § 1 k.s.h. spółka zależna może odmówić wykonania wiążącego polecenia, jeżeli jego wykonanie doprowadziłoby do niewypłacalności albo do zagrożenia niewypłacalnością tej spółki.',
    difficulty: 'hard',
    tags: ['odmowa polecenia', 'niewypłacalność', 'grupa spółek']
  },

  // ============================================================
  // PSA - DODATKOWE SZCZEGÓŁY
  // ============================================================

  {
    id: 'ksh-464',
    article: 'Art. 300⁵³ § 1',
    articleTitle: 'Model monistyczny w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W prostej spółce akcyjnej ustanawia się:',
    options: {
      a: 'Tylko zarząd i radę nadzorczą',
      b: 'Tylko zarząd',
      c: 'Zarząd albo radę dyrektorów (do wyboru)',
      d: 'Radę dyrektorów i komisję rewizyjną'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300⁵¹ k.s.h. w spółce ustanawia się zarząd albo radę dyrektorów. Można również ustanowić radę nadzorczą. Jest to więc możliwość wyboru między modelem dualistycznym (zarząd + RN) a monistycznym (rada dyrektorów).',
    difficulty: 'medium',
    tags: ['PSA', 'model monistyczny', 'rada dyrektorów']
  },

  {
    id: 'ksh-465',
    article: 'Art. 300⁷⁹ § 1',
    articleTitle: 'Wypłata dywidendy w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Kwota przeznaczona do podziału między akcjonariuszy PSA nie może przekraczać sumy zysku za ostatni rok obrotowy, niepodzielonych zysków z lat ubiegłych i kwot kapitałów rezerwowych utworzonych z zysku. Suma ta podlega pomniejszeniu o:',
    options: {
      a: 'Tylko niepokryte straty',
      b: 'Niepokryte straty i kwoty z kapitałów utworzonych z zysku',
      c: 'Niepokryte straty, kwoty z kapitałów utworzonych z zysku, które nie mogą być przeznaczone do podziału oraz kwotę obowiązkowych odpisów na kapitał akcyjny',
      d: 'Nic - cała kwota może być wypłacona'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300¹⁵ k.s.h. kwota przeznaczona do podziału nie może przekraczać sumy zysku pomniejszonej o niepokryte straty, kwoty przekazane na kapitały rezerwowe, które nie mogą być przeznaczone do podziału oraz o kwotę wymaganą dla obowiązkowych odpisów z zysku na kapitał akcyjny.',
    difficulty: 'hard',
    tags: ['PSA', 'dywidenda', 'ograniczenia']
  },

  {
    id: 'ksh-466',
    article: 'Art. 300¹²² § 1',
    articleTitle: 'Rozwiązanie PSA bez likwidacji',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja spółki',
    question: 'Prosta spółka akcyjna może być rozwiązana bez przeprowadzenia likwidacji:',
    options: {
      a: 'Zawsze, decyzją walnego zgromadzenia',
      b: 'Gdy jeden z akcjonariuszy przejmuje majątek spółki z obowiązkiem zaspokojenia wierzycieli i pozostałych akcjonariuszy',
      c: 'Tylko w przypadku upadłości',
      d: 'Tylko za zgodą sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹²⁰ k.s.h. walne zgromadzenie może podjąć uchwałę o rozwiązaniu spółki bez przeprowadzenia likwidacji przez przejęcie całego majątku spółki przez oznaczonego akcjonariusza (akcjonariusza przejmującego) z obowiązkiem zaspokojenia wierzycieli i pozostałych akcjonariuszy.',
    difficulty: 'hard',
    tags: ['PSA', 'rozwiązanie bez likwidacji', 'akcjonariusz przejmujący']
  },

  // ============================================================
  // PRZEKSZTAŁCENIA - DODATKOWE
  // ============================================================

  {
    id: 'ksh-467',
    article: 'Art. 563 pkt 2',
    articleTitle: 'Plan przekształcenia',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Plan przekształcenia spółki powinien zawierać co najmniej:',
    options: {
      a: 'Tylko wskazanie typu spółki przekształconej',
      b: 'Ustalenie wartości bilansowej majątku spółki przekształcanej, określenie wartości udziałów/akcji wspólników',
      c: 'Tylko sprawozdanie finansowe',
      d: 'Tylko listę wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 558 § 1 k.s.h. plan przekształcenia powinien zawierać co najmniej: ustalenie wartości bilansowej majątku spółki przekształcanej na określony dzień w miesiącu poprzedzającym przedłożenie wspólnikom planu przekształcenia oraz określenie wartości udziałów albo akcji wspólników.',
    difficulty: 'medium',
    tags: ['plan przekształcenia', 'elementy', 'przekształcenie']
  },

  {
    id: 'ksh-468',
    article: 'Art. 560 § 1',
    articleTitle: 'Badanie planu przekształcenia',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Plan przekształcenia w spółkę kapitałową:',
    options: {
      a: 'Nie wymaga badania',
      b: 'Wymaga badania przez biegłego rewidenta w zakresie poprawności i rzetelności',
      c: 'Wymaga tylko zatwierdzenia przez wspólników',
      d: 'Wymaga zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 559 § 1 k.s.h. plan przekształcenia należy poddać badaniu przez biegłego rewidenta w zakresie poprawności i rzetelności oraz w celu ustalenia, czy wycena składników majątku jest rzetelna.',
    difficulty: 'medium',
    tags: ['badanie planu', 'biegły rewident', 'przekształcenie']
  },

  {
    id: 'ksh-469',
    article: 'Art. 552',
    articleTitle: 'Dzień przekształcenia',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Spółka przekształcana staje się spółką przekształconą z chwilą:',
    options: {
      a: 'Podjęcia uchwały o przekształceniu',
      b: 'Podpisania umowy/statutu spółki przekształconej',
      c: 'Wpisu spółki przekształconej do rejestru (dzień przekształcenia)',
      d: 'Wykreślenia spółki przekształcanej z rejestru'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 552 k.s.h. spółka przekształcana staje się spółką przekształconą z chwilą wpisu spółki przekształconej do rejestru (dzień przekształcenia). Jednocześnie sąd rejestrowy z urzędu wykreśla spółkę przekształcaną.',
    difficulty: 'medium',
    tags: ['dzień przekształcenia', 'wpis do rejestru', 'przekształcenie']
  },

  {
    id: 'ksh-470',
    article: 'Art. 553 § 3',
    articleTitle: 'Wspólnicy spółki przekształconej',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Wspólnicy spółki przekształcanej uczestniczący w przekształceniu stają się z dniem przekształcenia:',
    options: {
      a: 'Wierzycielami spółki przekształconej',
      b: 'Wspólnikami spółki przekształconej',
      c: 'Likwidatorami',
      d: 'Członkami organów spółki przekształconej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 553 § 3 k.s.h. wspólnicy spółki przekształcanej uczestniczący w przekształceniu stają się z dniem przekształcenia wspólnikami spółki przekształconej.',
    difficulty: 'easy',
    tags: ['wspólnicy', 'przekształcenie', 'kontynuacja']
  },

  // ============================================================
  // ŁĄCZENIE I PODZIAŁ - DODATKOWE
  // ============================================================

  {
    id: 'ksh-471',
    article: 'Art. 491 § 1',
    articleTitle: 'Sposoby łączenia spółek',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Spółki kapitałowe mogą się łączyć poprzez:',
    options: {
      a: 'Tylko przejęcie',
      b: 'Tylko zawiązanie nowej spółki',
      c: 'Przejęcie (inkorporacja) albo zawiązanie nowej spółki (fuzja)',
      d: 'Tylko podział'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 492 § 1 k.s.h. połączenie może być dokonane przez przeniesienie całego majątku spółki (przejmowanej) na inną spółkę (przejmującą) za udziały lub akcje (łączenie przez przejęcie) albo przez zawiązanie spółki kapitałowej, na którą przechodzi majątek wszystkich łączących się spółek (łączenie przez zawiązanie nowej spółki).',
    difficulty: 'easy',
    tags: ['łączenie spółek', 'przejęcie', 'fuzja']
  },

  {
    id: 'ksh-472',
    article: 'Art. 498',
    articleTitle: 'Łączenie spółek osobowych',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Spółka osobowa może być spółką przejmującą w procesie łączenia?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, spółka osobowa nie może być spółką przejmującą albo nowo zawiązaną',
      c: 'Tak, ale tylko spółka komandytowo-akcyjna',
      d: 'Tak, za zgodą sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 491 § 1 k.s.h. spółki kapitałowe mogą się łączyć między sobą oraz ze spółkami osobowymi. Spółka osobowa nie może być jednak spółką przejmującą albo spółką nowo zawiązaną.',
    difficulty: 'hard',
    tags: ['łączenie spółek', 'spółka osobowa', 'zakaz']
  },

  {
    id: 'ksh-473',
    article: 'Art. 528 § 1',
    articleTitle: 'Podział spółek - zakres podmiotowy',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Podziałowi mogą podlegać:',
    options: {
      a: 'Wszystkie spółki handlowe',
      b: 'Tylko spółki kapitałowe',
      c: 'Tylko spółki osobowe',
      d: 'Tylko spółki akcyjne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 528 § 1 k.s.h. spółkę kapitałową można podzielić na dwie albo więcej spółek kapitałowych. Podziałowi nie mogą podlegać spółki osobowe.',
    difficulty: 'medium',
    tags: ['podział spółek', 'spółki kapitałowe', 'zakres']
  },

  {
    id: 'ksh-474',
    article: 'Art. 530 § 1',
    articleTitle: 'Zakaz podziału spółki',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Nie można dokonać podziału spółki akcyjnej, jeżeli:',
    options: {
      a: 'Ma mniej niż 5 akcjonariuszy',
      b: 'Kapitał zakładowy nie został pokryty w całości',
      c: 'Nie ma rady nadzorczej',
      d: 'Nie zatrudnia pracowników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 529 § 3 k.s.h. nie można dokonać podziału spółki akcyjnej, jeżeli kapitał zakładowy nie został pokryty w całości.',
    difficulty: 'hard',
    tags: ['podział spółek', 'zakaz', 'niepokryty kapitał']
  },

  // ============================================================
  // PRZEPISY KARNE - UZUPEŁNIENIE
  // ============================================================

  {
    id: 'ksh-475',
    article: 'Art. 587 § 1',
    articleTitle: 'Ogłoszenie nieprawdziwych danych',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto przy wykonywaniu obowiązków wynikających z przepisów k.s.h. ogłasza dane nieprawdziwe albo przedstawia je organom spółki, władzom państwowym lub osobie powołanej do rewizji, podlega karze:',
    options: {
      a: 'Grzywny',
      b: 'Grzywny, ograniczenia wolności albo pozbawienia wolności do lat 2',
      c: 'Pozbawienia wolności do roku',
      d: 'Tylko dyscyplinarnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 587 § 1 k.s.h. kto przy wykonywaniu obowiązków wynikających z przepisów prawa, ogłasza dane nieprawdziwe albo przedstawia je organom spółki, władzom państwowym lub osobie powołanej do rewizji - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat 2.',
    difficulty: 'medium',
    tags: ['przepisy karne', 'nieprawdziwe dane', 'sankcja']
  },

  {
    id: 'ksh-476',
    article: 'Art. 594 § 1',
    articleTitle: 'Niewykonanie obowiązków przez zarząd',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, będąc członkiem zarządu spółki kapitałowej, nie zgłasza wniosku o upadłość spółki handlowej pomimo powstania warunków uzasadniających upadłość, podlega karze:',
    options: {
      a: 'Grzywny do 10.000 zł',
      b: 'Grzywny, ograniczenia wolności albo pozbawienia wolności do roku',
      c: 'Pozbawienia wolności do lat 3',
      d: 'Tylko odpowiedzialności cywilnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 586 k.s.h. kto, będąc członkiem zarządu spółki albo likwidatorem, nie zgłasza wniosku o upadłość spółki handlowej pomimo powstania warunków uzasadniających upadłość spółki - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do roku.',
    difficulty: 'hard',
    tags: ['przepisy karne', 'niezgłoszenie upadłości', 'sankcja']
  },

  // ============================================================
  // PYTANIA KOMPLEKSOWE - SYNTEZA
  // ============================================================

  {
    id: 'ksh-477',
    article: 'Różne',
    articleTitle: 'Porównanie form umów spółek',
    section: 'Porównanie spółek',
    subsection: 'Forma umowy',
    question: 'Która z poniższych spółek wymaga dla swojej umowy formy pisemnej (NIE aktu notarialnego)?',
    options: {
      a: 'Spółka z o.o.',
      b: 'Spółka komandytowa',
      c: 'Spółka jawna',
      d: 'Spółka akcyjna'
    },
    correct: 'c',
    explanation: 'Spółka jawna wymaga formy pisemnej pod rygorem nieważności (art. 23 § 1 k.s.h.). Spółka komandytowa (art. 106), sp. z o.o. (art. 157 § 2) i S.A. (art. 301 § 2) wymagają formy aktu notarialnego.',
    difficulty: 'medium',
    tags: ['forma umowy', 'pisemna', 'porównanie']
  },

  {
    id: 'ksh-478',
    article: 'Różne',
    articleTitle: 'Porównanie odpowiedzialności za zobowiązania',
    section: 'Porównanie spółek',
    subsection: 'Odpowiedzialność',
    question: 'W której spółce co najmniej jeden wspólnik odpowiada za zobowiązania spółki bez ograniczeń, a odpowiedzialność innego wspólnika jest ograniczona?',
    options: {
      a: 'Spółka jawna',
      b: 'Spółka partnerska',
      c: 'Spółka komandytowa',
      d: 'Spółka z o.o.'
    },
    correct: 'c',
    explanation: 'W spółce komandytowej komplementariusz odpowiada bez ograniczeń, a komandytariusz odpowiada tylko do wysokości sumy komandytowej (art. 102 k.s.h.).',
    difficulty: 'easy',
    tags: ['odpowiedzialność', 'komandytowa', 'porównanie']
  },

  {
    id: 'ksh-479',
    article: 'Różne',
    articleTitle: 'Organy w spółkach - porównanie',
    section: 'Porównanie spółek',
    subsection: 'Organy',
    question: 'W której spółce NIGDY nie ma zarządu ani rady nadzorczej?',
    options: {
      a: 'Spółka z o.o.',
      b: 'Spółka akcyjna',
      c: 'Spółka jawna',
      d: 'Prosta spółka akcyjna'
    },
    correct: 'c',
    explanation: 'Spółka jawna jest spółką osobową i nie posiada organów w sensie prawnym. Prowadzenie spraw i reprezentacja należą do wspólników. Sp. z o.o. i S.A. mają zarząd. PSA ma zarząd lub radę dyrektorów.',
    difficulty: 'easy',
    tags: ['organy', 'spółka jawna', 'porównanie']
  },

  {
    id: 'ksh-480',
    article: 'Różne',
    articleTitle: 'Minimalne kapitały - uporządkowanie',
    section: 'Porównanie spółek',
    subsection: 'Kapitał zakładowy',
    question: 'Uporządkuj spółki od najniższego do najwyższego minimalnego kapitału zakładowego/akcyjnego: PSA, sp. z o.o., S.K.A., S.A.',
    options: {
      a: 'PSA (1 zł) < sp. z o.o. (5.000 zł) < S.K.A. (50.000 zł) < S.A. (100.000 zł)',
      b: 'Sp. z o.o. < PSA < S.K.A. < S.A.',
      c: 'PSA < S.K.A. < sp. z o.o. < S.A.',
      d: 'S.K.A. < sp. z o.o. < PSA < S.A.'
    },
    correct: 'a',
    explanation: 'Minimalne kapitały: PSA - 1 zł, sp. z o.o. - 5.000 zł, S.K.A. - 50.000 zł, S.A. - 100.000 zł.',
    difficulty: 'easy',
    tags: ['kapitał zakładowy', 'porównanie', 'minimalne kwoty']
  },

  // ============================================================
  // DODATKOWE PYTANIA SZCZEGÓŁOWE
  // ============================================================

  {
    id: 'ksh-481',
    article: 'Art. 161 § 1',
    articleTitle: 'Spółka z o.o. w organizacji',
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
    id: 'ksh-482',
    article: 'Art. 163 pkt 2',
    articleTitle: 'Wniesienie wkładów przed rejestracją sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania sp. z o.o. (wpisu do rejestru) wymaga się m.in.:',
    options: {
      a: 'Wniesienia co najmniej połowy wkładów',
      b: 'Wniesienia przez każdego wspólnika całego wkładu na pokrycie objętego udziału',
      c: 'Wniesienia wkładów w ciągu roku od rejestracji',
      d: 'Złożenia oświadczenia o wkładach'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 163 pkt 2 k.s.h. do powstania spółki z ograniczoną odpowiedzialnością wymaga się wniesienia przez wspólników wkładów na pokrycie całego kapitału zakładowego.',
    difficulty: 'medium',
    tags: ['wkłady', 'przed rejestracją', 'sp. z o.o.']
  },

  {
    id: 'ksh-483',
    article: 'Art. 192',
    articleTitle: 'Uprawnieni do dywidendy w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wspólnik sp. z o.o. ma prawo do udziału w zysku wynikającym z rocznego sprawozdania finansowego:',
    options: {
      a: 'Automatycznie z mocy ustawy',
      b: 'Tylko gdy umowa spółki to przewiduje',
      c: 'Przeznaczonym do podziału uchwałą zgromadzenia wspólników',
      d: 'Tylko za zgodą zarządu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 191 § 1 k.s.h. wspólnik ma prawo do udziału w zysku wynikającym z rocznego sprawozdania finansowego i przeznaczonym do podziału uchwałą zgromadzenia wspólników.',
    difficulty: 'easy',
    tags: ['prawo do dywidendy', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-484',
    article: 'Art. 203 § 1',
    articleTitle: 'Odwołanie członka zarządu sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. może być w każdym czasie odwołany uchwałą wspólników. Czy umowa spółki może pozbawić wspólników tego prawa?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, nie ogranicza to prawa odwołania członka zarządu z ważnych powodów',
      c: 'Tak, ale tylko za zgodą sądu',
      d: 'Nie, prawo to jest bezwzględne i nie może być ograniczone w żaden sposób'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 203 § 2 k.s.h. umowa spółki może zawierać inne postanowienia, w szczególności ograniczać prawo odwołania członka zarządu do ważnych powodów. Ale nie można całkowicie pozbawić wspólników prawa odwołania z ważnych powodów.',
    difficulty: 'hard',
    tags: ['odwołanie zarządu', 'ważne powody', 'sp. z o.o.']
  },

  {
    id: 'ksh-485',
    article: 'Art. 208 § 2',
    articleTitle: 'Sprzeciw członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Każdy członek zarządu sp. z o.o. może prowadzić sprawy spółki. Jeżeli przed załatwieniem sprawy choćby jeden z pozostałych członków zarządu sprzeciwi się jej przeprowadzeniu:',
    options: {
      a: 'Sprawa może być załatwiona przez sprzeciwiającego się członka',
      b: 'Wymagana jest uchwała zarządu',
      c: 'Wymagana jest zgoda rady nadzorczej',
      d: 'Sprawa jest automatycznie odroczona'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 208 § 4 k.s.h. jeżeli przed załatwieniem sprawy przez zarząd, choćby jeden z członków zarządu sprzeciwi się jej przeprowadzeniu lub jeżeli sprawa przekracza zakres zwykłych czynności spółki, wymagana jest uprzednia uchwała zarządu.',
    difficulty: 'medium',
    tags: ['sprzeciw', 'uchwała zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-486',
    article: 'Art. 212 § 1',
    articleTitle: 'Wyłączenie prawa kontroli wspólnika',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo indywidualnej kontroli przysługujące wspólnikowi sp. z o.o. może być:',
    options: {
      a: 'Wyłączone umową spółki',
      b: 'Wyłączone lub ograniczone uchwałą wspólników',
      c: 'Wyłączone lub ograniczone w przypadku, gdy w spółce ustanowiono radę nadzorczą lub komisję rewizyjną',
      d: 'Nie może być w żaden sposób wyłączone ani ograniczone'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 213 § 3 k.s.h. w przypadku ustanowienia rady nadzorczej lub komisji rewizyjnej umowa spółki może wyłączyć albo ograniczyć indywidualną kontrolę wspólników.',
    difficulty: 'hard',
    tags: ['prawo kontroli', 'wyłączenie', 'sp. z o.o.']
  },

  {
    id: 'ksh-487',
    article: 'Art. 230',
    articleTitle: 'Zobowiązanie przekraczające 2x kapitał zakładowy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego sp. z o.o. wymaga:',
    options: {
      a: 'Zgody rady nadzorczej',
      b: 'Uchwały wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Formy aktu notarialnego',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 230 k.s.h. rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zobowiązanie', '2x kapitał', 'sp. z o.o.']
  },

  {
    id: 'ksh-488',
    article: 'Art. 244',
    articleTitle: 'Wyłączenie wspólnika od głosowania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik sp. z o.o. nie może ani osobiście, ani przez pełnomocnika głosować w sprawie:',
    options: {
      a: 'Zmiany umowy spółki',
      b: 'Jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium',
      c: 'Podwyższenia kapitału zakładowego',
      d: 'Wypłaty dywidendy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 244 k.s.h. wspólnik nie może ani osobiście, ani przez pełnomocnika, ani jako pełnomocnik innej osoby głosować przy powzięciu uchwał dotyczących jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium, zwolnienia z zobowiązania wobec spółki oraz sporu między nim a spółką.',
    difficulty: 'hard',
    tags: ['wyłączenie od głosowania', 'absolutorium', 'sp. z o.o.']
  },

  {
    id: 'ksh-489',
    article: 'Art. 250',
    articleTitle: 'Legitymacja do zaskarżenia uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wytoczenia powództwa o uchylenie uchwały wspólników sp. z o.o. przysługuje wspólnikowi, który:',
    options: {
      a: 'Był obecny na zgromadzeniu',
      b: 'Głosował przeciwko uchwale, a po jej powzięciu zażądał zaprotokołowania sprzeciwu',
      c: 'Wstrzymał się od głosu',
      d: 'Posiada więcej niż 10% udziałów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 250 pkt 2 k.s.h. prawo do wytoczenia powództwa o uchylenie uchwały przysługuje wspólnikowi, który głosował przeciwko uchwale, a po jej powzięciu zażądał zaprotokołowania sprzeciwu.',
    difficulty: 'hard',
    tags: ['legitymacja', 'zaskarżenie uchwały', 'sp. z o.o.']
  },

  {
    id: 'ksh-490',
    article: 'Art. 258 § 1',
    articleTitle: 'Prawo pierwszeństwa przy podwyższeniu kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'W przypadku podwyższenia kapitału zakładowego sp. z o.o. dotychczasowym wspólnikom przysługuje prawo pierwszeństwa do objęcia nowych udziałów. Prawo to:',
    options: {
      a: 'Jest bezwzględne i nie może być wyłączone',
      b: 'Może być wyłączone w umowie spółki lub uchwale wspólników o podwyższeniu kapitału zakładowego',
      c: 'Przysługuje tylko wspólnikom większościowym',
      d: 'Wymaga zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 258 § 1 k.s.h. jeżeli umowa spółki lub uchwała o podwyższeniu kapitału zakładowego nie stanowi inaczej, dotychczasowi wspólnicy mają prawo pierwszeństwa do objęcia nowych udziałów w podwyższonym kapitale zakładowym.',
    difficulty: 'medium',
    tags: ['prawo pierwszeństwa', 'podwyższenie kapitału', 'sp. z o.o.']
  },

  // ============================================================
  // PYTANIA KOŃCOWE - SYNTEZA I KOMPLEKSOWOŚĆ
  // ============================================================

  {
    id: 'ksh-491',
    article: 'Art. 264 § 1',
    articleTitle: 'Ochrona wierzycieli przy obniżeniu kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'O obniżeniu kapitału zakładowego sp. z o.o. zarząd niezwłocznie ogłasza, wzywając wierzycieli spółki do wniesienia sprzeciwu w terminie:',
    options: {
      a: 'Miesiąca',
      b: 'Dwóch miesięcy',
      c: 'Trzech miesięcy',
      d: 'Sześciu miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 264 § 1 k.s.h. o uchwaleniu obniżenia kapitału zakładowego zarząd niezwłocznie ogłasza, wzywając wierzycieli spółki do wniesienia sprzeciwu w terminie trzech miesięcy, licząc od dnia ogłoszenia.',
    difficulty: 'hard',
    tags: ['obniżenie kapitału', 'wierzyciele', 'termin']
  },

  {
    id: 'ksh-492',
    article: 'Art. 275 § 1',
    articleTitle: 'Likwidatorzy sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorami sp. z o.o. są:',
    options: {
      a: 'Osoby wyznaczone przez sąd',
      b: 'Członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej',
      c: 'Tylko wspólnicy',
      d: 'Biegli rewidenci'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 276 § 1 k.s.h. likwidatorami są członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej.',
    difficulty: 'easy',
    tags: ['likwidatorzy', 'sp. z o.o.', 'likwidacja']
  },

  {
    id: 'ksh-493',
    article: 'Art. 293 § 2',
    articleTitle: 'Business judgment rule',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator sp. z o.o. NIE narusza obowiązku dołożenia staranności wynikającej z zawodowego charakteru swojej działalności, jeżeli postępując w sposób lojalny wobec spółki:',
    options: {
      a: 'Osiągnął zysk dla spółki',
      b: 'Działał w granicach uzasadnionego ryzyka gospodarczego, w tym na podstawie informacji, analiz i opinii, które w danych okolicznościach powinny być uwzględnione',
      c: 'Uzyskał zgodę wspólników',
      d: 'Konsultował się z prawnikiem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 293 § 3 k.s.h. (business judgment rule) członek zarządu, rady nadzorczej, komisji rewizyjnej oraz likwidator nie narusza obowiązku dołożenia staranności, jeżeli postępując w sposób lojalny wobec spółki, działał w granicach uzasadnionego ryzyka gospodarczego.',
    difficulty: 'hard',
    tags: ['business judgment rule', 'staranność', 'odpowiedzialność']
  },

  {
    id: 'ksh-494',
    article: 'Różne',
    articleTitle: 'Forma oświadczeń w spółkach',
    section: 'Porównanie spółek',
    subsection: 'Forma czynności',
    question: 'Która czynność wymaga formy aktu notarialnego?',
    options: {
      a: 'Zbycie udziału w sp. z o.o.',
      b: 'Umowa między spółką a jedynym wspólnikiem będącym jedynym członkiem zarządu (art. 210 § 2)',
      c: 'Udzielenie pełnomocnictwa na zgromadzenie wspólników',
      d: 'Ustanowienie prokury'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 2 k.s.h. czynność prawna między spółką a jedynym wspólnikiem będącym jedynym członkiem zarządu wymaga formy aktu notarialnego. Zbycie udziału wymaga formy pisemnej z podpisami notarialnie poświadczonymi.',
    difficulty: 'hard',
    tags: ['forma aktu notarialnego', 'czynności prawne', 'porównanie']
  },

  {
    id: 'ksh-495',
    article: 'Różne',
    articleTitle: 'Terminy na wytoczenie powództwa - porównanie',
    section: 'Porównanie spółek',
    subsection: 'Terminy',
    question: 'Termin na wytoczenie powództwa o UCHYLENIE uchwały wspólników sp. z o.o. wynosi:',
    options: {
      a: 'Miesiąc od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia',
      b: '6 miesięcy od otrzymania wiadomości, nie później niż 3 lata od powzięcia',
      c: '3 miesiące od powzięcia',
      d: 'Rok od powzięcia'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 251 k.s.h. powództwo o uchylenie uchwały należy wnieść w terminie miesiąca od dnia otrzymania wiadomości o uchwale, nie później jednak niż w terminie sześciu miesięcy od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['termin', 'uchylenie uchwały', 'sp. z o.o.']
  },

  {
    id: 'ksh-496',
    article: 'Różne',
    articleTitle: 'Terminy na wytoczenie powództwa - nieważność',
    section: 'Porównanie spółek',
    subsection: 'Terminy',
    question: 'Termin na wytoczenie powództwa o STWIERDZENIE NIEWAŻNOŚCI uchwały wspólników sp. z o.o. wynosi:',
    options: {
      a: 'Miesiąc od otrzymania wiadomości, nie później niż 6 miesięcy od powzięcia',
      b: '6 miesięcy od otrzymania wiadomości, nie później niż 3 lata od powzięcia',
      c: '3 miesiące od powzięcia',
      d: 'Bez terminu (uchwała bezwzględnie nieważna)'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 252 § 3 k.s.h. prawo do wytoczenia powództwa o stwierdzenie nieważności uchwały wygasa z upływem sześciu miesięcy od dnia otrzymania wiadomości o uchwale, jednakże nie później niż z upływem trzech lat od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['termin', 'nieważność uchwały', 'sp. z o.o.']
  },

  {
    id: 'ksh-497',
    article: 'Art. 594 § 1 pkt 2',
    articleTitle: 'Grzywna za niewykonanie obowiązków',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, będąc członkiem zarządu sp. z o.o., wbrew obowiązkowi dopuszcza do tego, że pisma i zamówienia handlowe nie zawierają wymaganych danych, podlega karze:',
    options: {
      a: 'Grzywny do 5.000 zł',
      b: 'Grzywny do 10.000 zł',
      c: 'Grzywny do 20.000 zł',
      d: 'Pozbawienia wolności do roku'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 595 § 1 k.s.h. kto, będąc członkiem zarządu spółki kapitałowej, wbrew obowiązkowi dopuszcza do tego, że pisma i zamówienia handlowe nie zawierają danych określonych w art. 206 § 1 lub art. 374 § 1, podlega grzywnie do 5.000 złotych.',
    difficulty: 'hard',
    tags: ['grzywna', 'pisma handlowe', 'przepisy karne']
  },

  {
    id: 'ksh-498',
    article: 'Różne',
    articleTitle: 'Pytanie kompleksowe - skutki wpisu do rejestru',
    section: 'Porównanie spółek',
    subsection: 'Wpis do rejestru',
    question: 'Wpis do rejestru ma charakter KONSTYTUTYWNY dla:',
    options: {
      a: 'Tylko powstania spółki kapitałowej',
      b: 'Powstania wszystkich spółek handlowych, zmiany umowy/statutu spółki kapitałowej i przekształcenia',
      c: 'Tylko zmiany umowy spółki',
      d: 'Tylko przekształcenia'
    },
    correct: 'b',
    explanation: 'Wpis ma charakter konstytutywny dla: powstania wszystkich spółek handlowych (art. 12, 25¹), zmiany umowy/statutu spółki kapitałowej (art. 255 § 1, 430 § 1), przekształcenia (art. 552), łączenia (art. 493 § 1), podziału (art. 530 § 1).',
    difficulty: 'hard',
    tags: ['wpis konstytutywny', 'rejestr', 'skutki prawne']
  },

  {
    id: 'ksh-499',
    article: 'Różne',
    articleTitle: 'Pytanie kompleksowe - obowiązkowe organy',
    section: 'Porównanie spółek',
    subsection: 'Organy',
    question: 'W której spółce kapitałowej rada nadzorcza jest ZAWSZE obligatoryjna (bez wyjątków)?',
    options: {
      a: 'W sp. z o.o.',
      b: 'W S.A.',
      c: 'W PSA',
      d: 'W żadnej - wszędzie są wyjątki'
    },
    correct: 'b',
    explanation: 'Tylko w S.A. rada nadzorcza jest zawsze obligatoryjna (art. 381 k.s.h.). W sp. z o.o. jest obligatoryjna tylko gdy kapitał > 500.000 zł i > 25 wspólników. W PSA można wybrać radę dyrektorów zamiast zarządu i RN.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'obligatoryjność', 'porównanie']
  },

  {
    id: 'ksh-500',
    article: 'Różne',
    articleTitle: 'Pytanie kompleksowe końcowe',
    section: 'Porównanie spółek',
    subsection: 'Podsumowanie',
    question: 'Która spółka handlowa łączy cechy spółki osobowej (komplementariusz odpowiadający bez ograniczeń) i kapitałowej (akcjonariusze, kapitał zakładowy, możliwość emisji akcji)?',
    options: {
      a: 'Spółka komandytowa',
      b: 'Spółka komandytowo-akcyjna',
      c: 'Spółka partnerska',
      d: 'Prosta spółka akcyjna'
    },
    correct: 'b',
    explanation: 'Spółka komandytowo-akcyjna łączy cechy spółki osobowej (komplementariusz odpowiada bez ograniczeń, prowadzi sprawy i reprezentuje spółkę) oraz spółki kapitałowej (akcjonariusze, kapitał zakładowy min. 50.000 zł, możliwość emisji akcji). Jest to hybrydowa forma prawna.',
    difficulty: 'medium',
    tags: ['S.K.A.', 'hybrydowa', 'cechy osobowe i kapitałowe']
  }
];

// ============================================================
// PEŁNA BAZA 500 PYTAŃ
// ============================================================

import { KSH_EXAM_QUESTIONS } from './ksh-exam-questions';
import { KSH_EXAM_QUESTIONS_PART2 } from './ksh-exam-questions-part2';
import { KSH_EXAM_QUESTIONS_PART3 } from './ksh-exam-questions-part3';
import { KSH_EXAM_QUESTIONS_PART4 } from './ksh-exam-questions-part4';

export const ULTIMATE_KSH_DATABASE = [
  ...KSH_EXAM_QUESTIONS,
  ...KSH_EXAM_QUESTIONS_PART2,
  ...KSH_EXAM_QUESTIONS_PART3,
  ...KSH_EXAM_QUESTIONS_PART4,
  ...KSH_EXAM_QUESTIONS_PART5
];

export const ULTIMATE_DATABASE_STATS = {
  totalQuestions: ULTIMATE_KSH_DATABASE.length,
  byDifficulty: {
    easy: ULTIMATE_KSH_DATABASE.filter(q => q.difficulty === 'easy').length,
    medium: ULTIMATE_KSH_DATABASE.filter(q => q.difficulty === 'medium').length,
    hard: ULTIMATE_KSH_DATABASE.filter(q => q.difficulty === 'hard').length,
  },
  sections: [...new Set(ULTIMATE_KSH_DATABASE.map(q => q.section))],
  uniqueTags: [...new Set(ULTIMATE_KSH_DATABASE.flatMap(q => q.tags))].length,
  articlesCovered: [...new Set(ULTIMATE_KSH_DATABASE.map(q => q.article))].length,
};

// Generator egzaminu podobnego do prawdziwego egzaminu aplikacyjnego
export const generateBarExamSimulator = (questionCount: number = 100) => {
  // Rozkład tematyczny zbliżony do egzaminów wstępnych
  const distribution = {
    'Przepisy ogólne': 10,
    'Spółki osobowe': 15,
    'Spółka z o.o.': 35,
    'Spółka akcyjna': 25,
    'PSA': 5,
    'Łączenie/podział/przekształcanie': 5,
    'Przepisy karne': 5,
  };

  const result: ExamQuestion[] = [];

  // Przepisy ogólne
  const ogolne = ULTIMATE_KSH_DATABASE.filter(q => 
    q.section.includes('Przepisy ogólne') || q.tags.includes('przepisy ogólne')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.10));
  result.push(...ogolne);

  // Spółki osobowe
  const osobowe = ULTIMATE_KSH_DATABASE.filter(q =>
    q.section.includes('jawna') || q.section.includes('partnerska') || 
    q.section.includes('komandytowa') || q.section.includes('komandytowo-akcyjna')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.15));
  result.push(...osobowe);

  // Sp. z o.o.
  const spoznoo = ULTIMATE_KSH_DATABASE.filter(q =>
    q.section.includes('Spółka z o.o.') || q.tags.includes('sp. z o.o.')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.35));
  result.push(...spoznoo);

  // S.A.
  const sa = ULTIMATE_KSH_DATABASE.filter(q =>
    q.section.includes('Spółka akcyjna') && !q.section.includes('Prosta')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.25));
  result.push(...sa);

  // PSA
  const psa = ULTIMATE_KSH_DATABASE.filter(q =>
    q.section.includes('Prosta spółka akcyjna') || q.tags.includes('PSA')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.05));
  result.push(...psa);

  // Łączenie/podział/przekształcanie
  const transformacje = ULTIMATE_KSH_DATABASE.filter(q =>
    q.section.includes('Łączenie') || q.section.includes('Podział') || 
    q.section.includes('Przekształcanie') || q.tags.includes('przekształcenie')
  ).sort(() => Math.random() - 0.5).slice(0, Math.round(questionCount * 0.05));
  result.push(...transformacje);

  // Uzupełnienie do żądanej liczby
  const remaining = questionCount - result.length;
  if (remaining > 0) {
    const usedIds = new Set(result.map(q => q.id));
    const additional = ULTIMATE_KSH_DATABASE
      .filter(q => !usedIds.has(q.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining);
    result.push(...additional);
  }

  return result.sort(() => Math.random() - 0.5).slice(0, questionCount);
};

// Funkcja do nauki z kartami (spaced repetition ready)
export const getFlashcards = (tag?: string) => {
  const questions = tag 
    ? ULTIMATE_KSH_DATABASE.filter(q => q.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
    : ULTIMATE_KSH_DATABASE;
  
  return questions.map(q => ({
    id: q.id,
    front: q.question,
    back: `Odpowiedź: ${q.correct.toUpperCase()}\n\n${q.options[q.correct as keyof typeof q.options]}\n\n${q.explanation}`,
    article: q.article,
    difficulty: q.difficulty,
    tags: q.tags
  }));
};

console.log('Ultimate KSH Questions Database loaded:', ULTIMATE_DATABASE_STATS);
