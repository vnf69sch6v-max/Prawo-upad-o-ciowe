// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - CERTYFIKAT DORADCY W ALTERNATYWNYM SYSTEMIE OBROTU
// Baza pytań egzaminacyjnych na Certyfikat Doradcy ASO - NewConnect i Catalyst
// Wersja: 2.0 | Data: 2026-01-23
// Podstawa prawna: Regulamin ASO w brzmieniu obowiązującym od 5 stycznia 2026 r. z późn. zm.
// Liczba pytań: 250
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

export const ASO_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'aso-001',
    article: '§ 17 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Od kiedy spółka podlega obowiązkom informacyjnym w alternatywnym systemie obrotu?',
    options: {
      a: 'Od dnia złożenia wniosku o wprowadzenie instrumentów finansowych do obrotu',
      b: 'Od dnia podjęcia uchwały o wprowadzeniu instrumentów finansowych do obrotu',
      c: 'Od dnia pierwszego notowania instrumentów finansowych w alternatywnym systemie obrotu',
      d: 'Od dnia zawarcia umowy z Autoryzowanym Doradcą'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Od dnia pierwszego notowania instrumentów finansowych w alternatywnym systemie obrotu. Źródło: § 17 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-002',
    article: '§ 18 ust. 5 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie Autoryzowany Doradca i emitent powinni poinformować o zmianie umowy z AD?',
    options: {
      a: 'W terminie 7 dni',
      b: 'W terminie 14 dni',
      c: 'Niezwłocznie',
      d: 'W terminie 30 dni'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie. Źródło: § 18 ust. 5 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-003',
    article: '§ 5a ust. 6 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy można ponownie złożyć wniosek o wprowadzenie tych samych instrumentów finansowych w przypadku odrzucenia wniosku?',
    options: {
      a: 'Po upływie 3 miesięcy',
      b: 'Po upływie 6 miesięcy',
      c: 'Po upływie 12 miesięcy',
      d: 'W dowolnym momencie'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Po upływie 6 miesięcy. Źródło: § 5a ust. 6 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-004',
    article: '§ 5 ust. 7 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy można ponownie złożyć wniosek o wprowadzenie tych samych instrumentów finansowych w przypadku odmowy wprowadzenia?',
    options: {
      a: 'Po upływie 3 miesięcy',
      b: 'Po upływie 6 miesięcy',
      c: 'Po upływie 12 miesięcy',
      d: 'Po upływie 24 miesięcy'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Po upływie 12 miesięcy. Źródło: § 5 ust. 7 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-005',
    article: '§ 12 ust. 1 pkt 1) i 1a) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Czy Organizator Alternatywnego Systemu może wykluczyć instrumenty finansowe z obrotu na wniosek emitenta?',
    options: {
      a: 'Nie, wykluczenie może nastąpić tylko z inicjatywy Organizatora',
      b: 'Tak, ale tylko w przypadku akcji w związku z ich dopuszczeniem do obrotu na rynku regulowanym',
      c: 'Tak, w każdym przypadku bez żadnych ograniczeń',
      d: 'Tak, w przypadku akcji w związku z dopuszczeniem na rynek regulowany, a w przypadku pozostałych instrumentów z możliwością uzależnienia od spełnienia dodatkowych warunków'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Tak, w przypadku akcji w związku z dopuszczeniem na rynek regulowany, a w przypadku pozostałych instrumentów z możliwością uzależnienia od spełnienia dodatkowych warunków. Źródło: § 12 ust. 1 pkt 1) i 1a) Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-006',
    article: '§ 17c ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jakie środki może zastosować Organizator ASO wobec emitenta, który nie przestrzega zasad lub przepisów obowiązujących w alternatywnym systemie obrotu?',
    options: {
      a: 'Tylko upomnienie',
      b: 'Upomnienie lub karę pieniężną do 50.000 zł',
      c: 'Upomnienie, karę pieniężną do 100.000 zł lub zawieszenie obrotu',
      d: 'Tylko zawieszenie obrotu instrumentami finansowymi'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Upomnienie lub karę pieniężną do 50.000 zł. Źródło: § 17c ust. 1 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-007',
    article: '§ 17 ust. 4 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jeżeli emitent dłużnych instrumentów finansowych jest notowany jednocześnie w ASO i na rynku regulowanym, według których zasad raportuje?',
    options: {
      a: 'Według zasad obowiązujących w ASO',
      b: 'Według zasad obowiązujących na rynku regulowanym',
      c: 'Według surowszych z obowiązujących zasad',
      d: 'Może wybrać dowolne zasady'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Według zasad obowiązujących na rynku regulowanym. Źródło: § 17 ust. 4 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-008',
    article: '§ 3a i § 3b Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy NIE trzeba sporządzać dokumentu informacyjnego przy wprowadzaniu instrumentów do ASO?',
    options: {
      a: 'Gdy instrumenty emitenta są przedmiotem obrotu na krajowym rynku regulowanym',
      b: 'Gdy instrumenty były przedmiotem obrotu na krajowym RR i wniosek złożono najpóźniej następnego dnia po wykluczeniu',
      c: 'Gdy akcje stanowią mniej niż 20% wszystkich tego samego rodzaju akcji wprowadzonych do ASO',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 3a i § 3b Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-009',
    article: '§ 9 ust. 4a i 5 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy Organizator ASO może zwolnić emitenta z obowiązku współpracy z Animatorem Rynku?',
    options: {
      a: 'Gdy łączna wartość nominalna dłużnych instrumentów wynosi co najmniej 5.000.000 zł',
      b: 'Gdy łączna wartość nominalna dłużnych instrumentów wynosi co najmniej 10.000.000 zł',
      c: 'Gdy instrumenty są notowane na rynku regulowanym',
      d: 'Odpowiedzi B i C są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Odpowiedzi B i C są prawidłowe. Źródło: § 9 ust. 4a i 5 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-010',
    article: '§ 18 ust. 4a Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy Organizator ASO może zwolnić emitenta z obowiązku zawarcia umowy z Autoryzowanym Doradcą?',
    options: {
      a: 'Gdy emitent jest wpisany na listę Autoryzowanych Doradców',
      b: 'Gdy instrumenty emitenta są notowane na rynku regulowanym',
      c: 'Gdy od zaprzestania obrotu na rynku regulowanym upłynął okres nie dłuższy niż 3 miesiące',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 18 ust. 4a Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-011',
    article: 'Harmonogram sesji w dniu debiutu',
    articleTitle: 'Harmonogram sesji',
    section: 'Organizacja obrotu',
    subsection: 'Harmonogram sesji',
    question: 'O której godzinie ma miejsce faza otwarcia w dniu debiutu na NewConnect?',
    options: {
      a: '8:30',
      b: '9:00',
      c: '11:00',
      d: '15:00'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 11:00. Źródło: Harmonogram sesji w dniu debiutu',
    difficulty: 'easy',
    tags: ["harmonogram", "sesja giełdowa", "notowania"]
  },

  {
    id: 'aso-012',
    article: '§ 18 ust. 3 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Na jaki minimalny okres emitent musi podpisać umowę z Autoryzowanym Doradcą?',
    options: {
      a: '1 rok',
      b: '2 lata',
      c: '3 lata',
      d: '5 lat'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 3 lata. Źródło: § 18 ust. 3 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-013',
    article: 'Art. 3 pkt 2 Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Jaka jest definicja alternatywnego systemu obrotu według Ustawy o obrocie?',
    options: {
      a: 'Rynek regulowany prowadzony przez GPW',
      b: 'Wielostronny system kojarzący oferty kupna i sprzedaży instrumentów finansowych prowadzony poza rynkiem regulowanym',
      c: 'System obrotu instrumentami pochodnymi',
      d: 'Platforma crowdfundingowa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Wielostronny system kojarzący oferty kupna i sprzedaży instrumentów finansowych prowadzony poza rynkiem regulowanym. Źródło: Art. 3 pkt 2 Ustawy o obrocie',
    difficulty: 'easy',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-014',
    article: '§ 5 ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie Organizator ASO powinien podjąć uchwałę o wprowadzeniu lub odmowie wprowadzenia instrumentów finansowych?',
    options: {
      a: '5 dni roboczych',
      b: '10 dni roboczych',
      c: '14 dni roboczych',
      d: '30 dni roboczych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 10 dni roboczych. Źródło: § 5 ust. 1 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-015',
    article: '§ 15b ust. 3 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie należy opublikować dokument z analizy sytuacji finansowej emitenta nałożonej przez Organizatora ASO?',
    options: {
      a: '20 dni roboczych',
      b: '30 dni roboczych',
      c: '40 dni roboczych',
      d: '60 dni roboczych'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 40 dni roboczych. Źródło: § 15b ust. 3 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-016',
    article: '§ 18 ust. 16 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy można złożyć ponowny wniosek o wpis na listę Autoryzowanych Doradców po skreśleniu?',
    options: {
      a: 'Po upływie 3 miesięcy',
      b: 'Po upływie 6 miesięcy',
      c: 'Po upływie 12 miesięcy',
      d: 'Po upływie 24 miesięcy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Po upływie 6 miesięcy. Źródło: § 18 ust. 16 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-017',
    article: '§ 12 ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy Organizator ASO może wykluczyć instrumenty finansowe z obrotu?',
    options: {
      a: 'Na wniosek emitenta',
      b: 'Jeżeli wymaga tego bezpieczeństwo obrotu lub interes uczestników',
      c: 'Jeżeli emitent uporczywie narusza przepisy obowiązujące w ASO',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 12 ust. 1 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-018',
    article: '§ 11 ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy Organizator ASO może zawiesić obrót instrumentami finansowymi?',
    options: {
      a: 'Na wniosek emitenta',
      b: 'Jeżeli wymaga tego bezpieczeństwo obrotu lub interes uczestników',
      c: 'Jeżeli emitent narusza przepisy obowiązujące w ASO',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 11 ust. 1 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-019',
    article: 'Uchwała Nr 646/2016 Zarządu GPW',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jakie są segmenty rynku NewConnect?',
    options: {
      a: 'Focus i Base',
      b: 'Focus, Base i Alert',
      c: 'Premium, Standard i Alert',
      d: 'Main i Alternative'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Focus, Base i Alert. Źródło: Uchwała Nr 646/2016 Zarządu GPW',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-020',
    article: 'Uchwała Nr 646/2016 Zarządu GPW',
    articleTitle: 'Segmenty NewConnect',
    section: 'Organizacja obrotu',
    subsection: 'Segmenty rynku',
    question: 'Ile warunków musi spełnić spółka, aby zakwalifikować się do segmentu NC Focus?',
    options: {
      a: 'Co najmniej 3 z 7',
      b: 'Co najmniej 4 z 7',
      c: 'Co najmniej 5 z 7',
      d: 'Wszystkie 7'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Co najmniej 5 z 7. Źródło: Uchwała Nr 646/2016 Zarządu GPW',
    difficulty: 'easy',
    tags: ["segmenty", "NC Focus", "NC Base"]
  },

  {
    id: 'aso-021',
    article: '§ 11 ust. 2 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Jakie sprawozdanie finansowe należy zamieścić w dokumencie informacyjnym, gdy emitent sporządza sprawozdania skonsolidowane?',
    options: {
      a: 'Tylko jednostkowe sprawozdanie finansowe',
      b: 'Tylko skonsolidowane sprawozdanie finansowe',
      c: 'Oba sprawozdania finansowe',
      d: 'Dowolne z powyższych według wyboru emitenta'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tylko skonsolidowane sprawozdanie finansowe. Źródło: § 11 ust. 2 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-022',
    article: '§ 11 ust. 3 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'O ile miesięcy dzień bilansowy sprawozdania finansowego w dokumencie informacyjnym może poprzedzać datę złożenia wniosku o wprowadzenie?',
    options: {
      a: '6 miesięcy',
      b: '9 miesięcy',
      c: '12 miesięcy',
      d: '15 miesięcy'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: 15 miesięcy. Źródło: § 11 ust. 3 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-023',
    article: '§ 5 ust. 2 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Czy GPW odpowiada za zgodność dokumentu informacyjnego ze stanem faktycznym lub przepisami prawa?',
    options: {
      a: 'Tak, GPW weryfikuje i zatwierdza dokument informacyjny',
      b: 'Nie, treść dokumentu informacyjnego nie była zatwierdzana przez GPW pod tym względem',
      c: 'Tak, ale tylko w zakresie danych finansowych',
      d: 'Tak, ale tylko w zakresie zgodności z przepisami prawa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, treść dokumentu informacyjnego nie była zatwierdzana przez GPW pod tym względem. Źródło: § 5 ust. 2 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-024',
    article: 'Załącznik Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Na jaki dzień sporządza się dokument informacyjny?',
    options: {
      a: 'Na dzień podjęcia uchwały o emisji',
      b: 'Na dzień zakończenia oferty',
      c: 'Na dzień złożenia wniosku o wprowadzenie instrumentów do ASO',
      d: 'Na ostatni dzień roku obrotowego'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Na dzień złożenia wniosku o wprowadzenie instrumentów do ASO. Źródło: Załącznik Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-025',
    article: '§ 26 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Kiedy można sporządzić uproszczony dokument informacyjny dla dłużnych instrumentów finansowych?',
    options: {
      a: 'Gdy emitent jest jednostką samorządu terytorialnego',
      b: 'Gdy emitent jest bankiem państwowym',
      c: 'Gdy instrumenty są emitowane przez podmioty wymienione w art. 1 ust. 2 lit. b)-e) Rozporządzenia 2017/1129',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 26 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-026',
    article: '§ 13 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Kiedy można sporządzić uproszczony dokument informacyjny dla akcji?',
    options: {
      a: 'Gdy akcje emitenta są przedmiotem obrotu na krajowym rynku regulowanym',
      b: 'Gdy akcje emitenta są przedmiotem obrotu na zagranicznym rynku regulowanym',
      c: 'Gdy akcje emitenta są przedmiotem obrotu w innym ASO',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 13 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-027',
    article: '§ 6 ust. 14.1 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie należy opublikować raport z datami publikacji raportów okresowych?',
    options: {
      a: 'Do końca pierwszego tygodnia roku obrotowego',
      b: 'Do końca pierwszego miesiąca roku obrotowego',
      c: 'Do końca pierwszego kwartału roku obrotowego',
      d: 'Co najmniej na 2 dni przed pierwszym raportem okresowym'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Do końca pierwszego miesiąca roku obrotowego. Źródło: § 6 ust. 14.1 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-028',
    article: '§ 6 ust. 11 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie należy opublikować raport roczny?',
    options: {
      a: 'Nie później niż 3 miesiące od dnia bilansowego',
      b: 'Nie później niż 4 miesiące od dnia bilansowego',
      c: 'Nie później niż 5 miesięcy od dnia bilansowego',
      d: 'Nie później niż 6 miesięcy od dnia bilansowego'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Nie później niż 5 miesięcy od dnia bilansowego. Źródło: § 6 ust. 11 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-029',
    article: '§ 3 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'O czym emitent musi raportować w raporcie bieżącym?',
    options: {
      a: 'O rejestracji zmiany statutu lub odmowie rejestracji',
      b: 'O powołaniu, odwołaniu lub rezygnacji osoby zarządzającej lub nadzorującej',
      c: 'O zawarciu umowy z Autoryzowanym Doradcą',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 3 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-030',
    article: '§ 5 ust. 6.1 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Co musi zawierać raport roczny?',
    options: {
      a: 'Pismo zarządu, wybrane dane finansowe, sprawozdanie finansowe zbadane przez firmę audytorską',
      b: 'Sprawozdanie z działalności, oświadczenia zarządu, sprawozdanie z badania',
      c: 'Informacje o stosowaniu zasad ładu korporacyjnego',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 5 ust. 6.1 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-031',
    article: '§ 6 ust. 7 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie należy opublikować uchwały podjęte przez WZA?',
    options: {
      a: 'Niezwłocznie, nie później niż w ciągu 12 godzin',
      b: 'Niezwłocznie, nie później niż w ciągu 24 godzin',
      c: 'W terminie 2 dni roboczych',
      d: 'W terminie 7 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie, nie później niż w ciągu 24 godzin. Źródło: § 6 ust. 7 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-032',
    article: '§ 5 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Jaki rodzaj raportów okresowych przekazuje emitent będący jednostką dominującą?',
    options: {
      a: 'Tylko raporty jednostkowe',
      b: 'Tylko raporty skonsolidowane',
      c: 'Raporty jednostkowe i skonsolidowane',
      d: 'Raporty jednostkowe lub skonsolidowane według wyboru'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Raporty jednostkowe i skonsolidowane. Źródło: § 5 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-033',
    article: '§ 6 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie od zakończenia subskrypcji akcji emitent musi o tym zaraportować?',
    options: {
      a: 'W terminie 7 dni',
      b: 'W terminie 2 tygodni, nie później niż w dniu złożenia wniosku o wprowadzenie',
      c: 'W terminie 30 dni',
      d: 'Niezwłocznie'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W terminie 2 tygodni, nie później niż w dniu złożenia wniosku o wprowadzenie. Źródło: § 6 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-034',
    article: '§ 6 ust. 13 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Jeżeli termin opublikowania raportu okresowego przypada na dzień wolny od pracy, to kiedy trzeba go opublikować?',
    options: {
      a: 'W ostatnim dniu roboczym przed tym dniem',
      b: 'Pierwszego dnia roboczego następującego po tym dniu',
      c: 'W tym samym dniu, niezależnie od tego czy jest wolny',
      d: 'W ciągu 3 dni roboczych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Pierwszego dnia roboczego następującego po tym dniu. Źródło: § 6 ust. 13 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-035',
    article: '§ 5 ust. 4.1 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Co musi zawierać raport kwartalny?',
    options: {
      a: 'Kwartalne skrócone sprawozdanie finansowe',
      b: 'Informacje o zasadach przyjętych przy sporządzaniu raportu',
      c: 'Komentarz emitenta na temat okoliczności wpływających na działalność i wyniki',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 5 ust. 4.1 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-036',
    article: '§ 6 ust. 9 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie należy przekazać raport kwartalny?',
    options: {
      a: 'Nie później niż 30 dni od zakończenia kwartału',
      b: 'Nie później niż 45 dni od zakończenia kwartału',
      c: 'Nie później niż 60 dni od zakończenia kwartału',
      d: 'Nie później niż 90 dni od zakończenia kwartału'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie później niż 45 dni od zakończenia kwartału. Źródło: § 6 ust. 9 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-037',
    article: 'Zasady przekazywania informacji bieżących i okresowych w ASO',
    articleTitle: 'Zasady EBI',
    section: 'Systemy informatyczne',
    subsection: 'System EBI',
    question: 'Przez jaki okres należy przechowywać przekazane raporty?',
    options: {
      a: '3 lata',
      b: '5 lat',
      c: '7 lat',
      d: '10 lat'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 5 lat. Źródło: Zasady przekazywania informacji bieżących i okresowych w ASO',
    difficulty: 'easy',
    tags: ["EBI", "raporty", "system informatyczny"]
  },

  {
    id: 'aso-038',
    article: 'pkt 21 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Kiedy sporządza się raport z oferty prywatnej?',
    options: {
      a: 'Gdy wnioskiem o wprowadzenie objęte są akcje będące przedmiotem oferty publicznej',
      b: 'Gdy wnioskiem o wprowadzenie objęte są akcje będące przedmiotem oferty niepublicznej w ostatnich 12 miesiącach',
      c: 'Zawsze przy wprowadzaniu akcji do ASO',
      d: 'Tylko na żądanie Organizatora ASO'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy wnioskiem o wprowadzenie objęte są akcje będące przedmiotem oferty niepublicznej w ostatnich 12 miesiącach. Źródło: pkt 21 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-039',
    article: 'pkt 33 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Jakie środki może zastosować Organizator ASO wobec Autoryzowanego Doradcy?',
    options: {
      a: 'Upomnienie',
      b: 'Kara pieniężna do 50.000 zł',
      c: 'Zawieszenie prawa do działania lub skreślenie z listy',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: pkt 33 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-040',
    article: 'pkt 13-17 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Co powinien zrobić Autoryzowany Doradca, aby przygotować emitenta do funkcjonowania w ASO?',
    options: {
      a: 'Podjąć działania mające na celu przygotowanie emitenta i jego władz',
      b: 'Wyznaczyć osobę odpowiedzialną za opiekę nad emitentem',
      c: 'Wskazać emitentowi na zasadność opracowania odpowiednich regulacji i procedur',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: pkt 13-17 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-041',
    article: 'pkt 4 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Jaki rodzaj podmiotu może być Autoryzowanym Doradcą?',
    options: {
      a: 'Tylko firma inwestycyjna',
      b: 'Firma inwestycyjna lub inna spółka prawa handlowego świadcząca usługi związane z rynkiem kapitałowym',
      c: 'Dowolna osoba prawna',
      d: 'Tylko dom maklerski'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Firma inwestycyjna lub inna spółka prawa handlowego świadcząca usługi związane z rynkiem kapitałowym. Źródło: pkt 4 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-042',
    article: 'pkt 11a Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Jak Autoryzowany Doradca będący emitentem musi zorganizować swoją działalność?',
    options: {
      a: 'Musi zrezygnować z funkcji AD',
      b: 'Musi dokonać organizacyjnego wyodrębnienia działalności AD od pozostałej działalności',
      c: 'Nie ma żadnych szczególnych wymagań',
      d: 'Musi powierzyć funkcję AD innemu podmiotowi'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Musi dokonać organizacyjnego wyodrębnienia działalności AD od pozostałej działalności. Źródło: pkt 11a Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'easy',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-043',
    article: '§ 18 ust. 2 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jakie są regulaminowe obowiązki Autoryzowanego Doradcy?',
    options: {
      a: 'Badanie czy dokument informacyjny sporządzono zgodnie z wymogami',
      b: 'Współdziałanie z emitentem w zakresie obowiązków informacyjnych',
      c: 'Bieżące doradzanie emitentowi w zakresie funkcjonowania w ASO',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 18 ust. 2 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-044',
    article: '§ 18 ust. 9 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Co Organizator ASO bierze pod uwagę przy rozpatrywaniu wniosku o wpis na listę AD?',
    options: {
      a: 'Tylko doświadczenie wnioskodawcy',
      b: 'Bezpieczeństwo obrotu i zapewnienie prawidłowego wykonywania obowiązków AD',
      c: 'Tylko strukturę własnościową wnioskodawcy',
      d: 'Tylko wysokość kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Bezpieczeństwo obrotu i zapewnienie prawidłowego wykonywania obowiązków AD. Źródło: § 18 ust. 9 Regulaminu ASO',
    difficulty: 'easy',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-045',
    article: 'Art. 306 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co jest wymagane do powstania spółki akcyjnej według KSH?',
    options: {
      a: 'Zawiązanie spółki i podpisanie statutu przez założycieli',
      b: 'Wniesienie wkładów na pokrycie kapitału zakładowego',
      c: 'Ustanowienie zarządu i rady nadzorczej oraz wpis do rejestru',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 306 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-046',
    article: 'Art. 415 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka większość głosów jest wymagana do podjęcia uchwały o zmianie statutu spółki akcyjnej?',
    options: {
      a: 'Zwykła większość głosów',
      b: 'Bezwzględna większość głosów',
      c: 'Większość 2/3 głosów',
      d: 'Większość 3/4 głosów'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Większość 3/4 głosów. Źródło: Art. 415 § 1 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-047',
    article: 'Art. 334 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy zamiana akcji imiennych na akcje na okaziciela jest możliwa?',
    options: {
      a: 'Nie, jest to zabronione',
      b: 'Tak, na żądanie akcjonariusza, jeżeli ustawa lub statut nie stanowi inaczej',
      c: 'Tak, ale tylko za zgodą WZA',
      d: 'Tak, ale tylko dla akcji uprzywilejowanych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tak, na żądanie akcjonariusza, jeżeli ustawa lub statut nie stanowi inaczej. Źródło: Art. 334 § 2 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-048',
    article: 'Art. 352 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Ile głosów maksymalnie można przyznać jednej akcji uprzywilejowanej?',
    options: {
      a: '1 głos',
      b: '2 głosy',
      c: '3 głosy',
      d: '5 głosów'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 2 głosy. Źródło: Art. 352 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-049',
    article: 'Art. 348 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto ustala dzień dywidendy w spółce publicznej?',
    options: {
      a: 'Zarząd',
      b: 'Rada nadzorcza',
      c: 'Zwyczajne walne zgromadzenie',
      d: 'Krajowy Depozyt Papierów Wartościowych'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Zwyczajne walne zgromadzenie. Źródło: Art. 348 § 3 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-050',
    article: 'Art. 406(1) § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto ma prawo uczestniczenia w walnym zgromadzeniu spółki publicznej?',
    options: {
      a: 'Akcjonariusze wpisani do rejestru akcjonariuszy na tydzień przed WZA',
      b: 'Akcjonariusze będący akcjonariuszami na 16 dni przed datą WZA',
      c: 'Tylko akcjonariusze posiadający co najmniej 5% akcji',
      d: 'Wszyscy akcjonariusze bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Akcjonariusze będący akcjonariuszami na 16 dni przed datą WZA. Źródło: Art. 406(1) § 1 KSH',
    difficulty: 'easy',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-051',
    article: 'Art. 385 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Ilu członków musi liczyć rada nadzorcza w spółce publicznej?',
    options: {
      a: 'Co najmniej 3 członków',
      b: 'Co najmniej 5 członków',
      c: 'Co najmniej 7 członków',
      d: 'Dokładnie 5 członków'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Co najmniej 5 członków. Źródło: Art. 385 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-052',
    article: 'Art. 402(1) § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Na ile dni przed terminem WZA spółka publiczna musi dokonać ogłoszenia o zwołaniu WZA?',
    options: {
      a: '14 dni',
      b: '21 dni',
      c: '26 dni',
      d: '30 dni'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 26 dni. Źródło: Art. 402(1) § 2 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-053',
    article: 'Art. 375(1) KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy walne zgromadzenie może wydawać zarządowi wiążące polecenia dotyczące prowadzenia spraw spółki?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Tak, ale tylko w sprawach określonych w statucie',
      c: 'Nie, WZA i RN nie mogą wydawać takich poleceń',
      d: 'Tak, ale tylko za zgodą rady nadzorczej'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Nie, WZA i RN nie mogą wydawać takich poleceń. Źródło: Art. 375(1) KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-054',
    article: 'Art. 397 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kiedy zarząd spółki akcyjnej musi zwołać WZA w sprawie dalszego istnienia spółki?',
    options: {
      a: 'Gdy strata przewyższa 1/2 kapitału zakładowego',
      b: 'Gdy strata przewyższa sumę kapitałów zapasowego i rezerwowych oraz 1/3 kapitału zakładowego',
      c: 'Gdy strata przewyższa cały kapitał zakładowy',
      d: 'Gdy spółka przez 2 lata nie wypłaca dywidendy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy strata przewyższa sumę kapitałów zapasowego i rezerwowych oraz 1/3 kapitału zakładowego. Źródło: Art. 397 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-055',
    article: 'Art. 308 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Ile wynosi minimalny kapitał zakładowy spółki akcyjnej?',
    options: {
      a: '50.000 zł',
      b: '100.000 zł',
      c: '500.000 zł',
      d: '1.000.000 zł'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 100.000 zł. Źródło: Art. 308 § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-056',
    article: 'Art. 309 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy akcje mogą być obejmowane poniżej wartości nominalnej?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Tak, ale tylko przy kolejnych emisjach',
      c: 'Nie, akcje nie mogą być obejmowane poniżej wartości nominalnej',
      d: 'Tak, za zgodą WZA'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Nie, akcje nie mogą być obejmowane poniżej wartości nominalnej. Źródło: Art. 309 § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-057',
    article: 'Art. 421 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto sporządza protokół z walnego zgromadzenia spółki akcyjnej?',
    options: {
      a: 'Sekretarz WZA',
      b: 'Przewodniczący WZA',
      c: 'Notariusz',
      d: 'Zarząd spółki'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Notariusz. Źródło: Art. 421 § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-058',
    article: 'Art. 349 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto zatwierdza wypłatę zaliczki na poczet dywidendy w spółce akcyjnej?',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Zarząd samodzielnie',
      c: 'Zarząd za zgodą rady nadzorczej',
      d: 'Rada nadzorcza samodzielnie'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Zarząd za zgodą rady nadzorczej. Źródło: Art. 349 § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-059',
    article: 'Art. 20 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy akcjonariusze spółki kapitałowej powinni być traktowani jednakowo?',
    options: {
      a: 'Nie, można różnicować ich prawa bez ograniczeń',
      b: 'Tak, powinni być traktowani jednakowo w takich samych okolicznościach',
      c: 'Tak, ale tylko akcjonariusze mniejszościowi',
      d: 'Nie ma takiego wymogu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tak, powinni być traktowani jednakowo w takich samych okolicznościach. Źródło: Art. 20 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-060',
    article: 'Art. 431 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kiedy następuje zwykłe podwyższenie kapitału zakładowego?',
    options: {
      a: 'Po całkowitym wpłaceniu dotychczasowego kapitału zakładowego',
      b: 'Po wpłaceniu co najmniej 9/10 dotychczasowego kapitału zakładowego',
      c: 'W dowolnym momencie',
      d: 'Po wpłaceniu co najmniej 1/2 dotychczasowego kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Po wpłaceniu co najmniej 9/10 dotychczasowego kapitału zakładowego. Źródło: Art. 431 § 3 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-061',
    article: 'Art. 20 ust. 1 Prawa upadłościowego',
    articleTitle: 'Prawo upadłościowe',
    section: 'Ustawy',
    subsection: 'Prawo upadłościowe',
    question: 'Kto może złożyć wniosek o ogłoszenie upadłości?',
    options: {
      a: 'Tylko dłużnik',
      b: 'Tylko wierzyciele',
      c: 'Dłużnik lub każdy z jego wierzycieli osobistych',
      d: 'Tylko sąd z urzędu'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Dłużnik lub każdy z jego wierzycieli osobistych. Źródło: Art. 20 ust. 1 Prawa upadłościowego',
    difficulty: 'medium',
    tags: ["upadłość", "niewypłacalność"]
  },

  {
    id: 'aso-062',
    article: 'Art. 6 Prawa upadłościowego',
    articleTitle: 'Prawo upadłościowe',
    section: 'Ustawy',
    subsection: 'Prawo upadłościowe',
    question: 'Wobec kogo NIE można ogłosić upadłości?',
    options: {
      a: 'Spółek akcyjnych',
      b: 'Skarbu Państwa i jednostek samorządu terytorialnego',
      c: 'Spółek z ograniczoną odpowiedzialnością',
      d: 'Spółek komandytowo-akcyjnych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Skarbu Państwa i jednostek samorządu terytorialnego. Źródło: Art. 6 Prawa upadłościowego',
    difficulty: 'medium',
    tags: ["upadłość", "niewypłacalność"]
  },

  {
    id: 'aso-063',
    article: 'Art. 2 Prawa restrukturyzacyjnego',
    articleTitle: 'Prawo restrukturyzacyjne',
    section: 'Ustawy',
    subsection: 'Prawo restrukturyzacyjne',
    question: 'Jakie są rodzaje postępowań restrukturyzacyjnych?',
    options: {
      a: 'Postępowanie o zatwierdzenie układu i przyspieszone postępowanie układowe',
      b: 'Postępowanie układowe i postępowanie sanacyjne',
      c: 'Wszystkie wymienione w odpowiedziach A i B',
      d: 'Tylko postępowanie sanacyjne'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Wszystkie wymienione w odpowiedziach A i B. Źródło: Art. 2 Prawa restrukturyzacyjnego',
    difficulty: 'medium',
    tags: ["restrukturyzacja", "układ"]
  },

  {
    id: 'aso-064',
    article: 'Art. 6 ust. 1 Prawa restrukturyzacyjnego',
    articleTitle: 'Prawo restrukturyzacyjne',
    section: 'Ustawy',
    subsection: 'Prawo restrukturyzacyjne',
    question: 'Wobec kogo można prowadzić postępowanie restrukturyzacyjne?',
    options: {
      a: 'Tylko wobec dłużnika niewypłacalnego',
      b: 'Wobec dłużnika niewypłacalnego lub zagrożonego niewypłacalnością',
      c: 'Tylko wobec dłużnika zagrożonego niewypłacalnością',
      d: 'Wobec każdego przedsiębiorcy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Wobec dłużnika niewypłacalnego lub zagrożonego niewypłacalnością. Źródło: Art. 6 ust. 1 Prawa restrukturyzacyjnego',
    difficulty: 'medium',
    tags: ["restrukturyzacja", "układ"]
  },

  {
    id: 'aso-065',
    article: '§ 9 ust. 2 Zasad przekazywania informacji',
    articleTitle: 'Zasady EBI',
    section: 'Systemy informatyczne',
    subsection: 'System EBI',
    question: 'Kiedy należy złożyć wniosek o dostęp do systemu EBI?',
    options: {
      a: 'W dniu pierwszego notowania',
      b: 'Najpóźniej w dniu roboczym poprzedzającym dzień, od którego emitent zobowiązany jest przekazywać informacje',
      c: 'W terminie 7 dni od wprowadzenia instrumentów do obrotu',
      d: 'W dowolnym momencie'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Najpóźniej w dniu roboczym poprzedzającym dzień, od którego emitent zobowiązany jest przekazywać informacje. Źródło: § 9 ust. 2 Zasad przekazywania informacji',
    difficulty: 'medium',
    tags: ["EBI", "raporty", "system informatyczny"]
  },

  {
    id: 'aso-066',
    article: 'Opis korzystania z EBI, pkt VII',
    articleTitle: 'Zasady EBI',
    section: 'Systemy informatyczne',
    subsection: 'System EBI',
    question: 'Co musi zawierać raport korygujący?',
    options: {
      a: 'Tylko poprawioną treść',
      b: 'Odniesienie do raportu korygowanego, wyjaśnienie przyczyn korekty oraz treść przed i po korekcie',
      c: 'Tylko numer korygowanego raportu',
      d: 'Tylko datę korekty'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Odniesienie do raportu korygowanego, wyjaśnienie przyczyn korekty oraz treść przed i po korekcie. Źródło: Opis korzystania z EBI, pkt VII',
    difficulty: 'medium',
    tags: ["EBI", "raporty", "system informatyczny"]
  },

  {
    id: 'aso-067',
    article: 'Opis korzystania z EBI, pkt V',
    articleTitle: 'Zasady EBI',
    section: 'Systemy informatyczne',
    subsection: 'System EBI',
    question: 'Jaki jest maksymalny rozmiar załącznika do raportu w systemie EBI?',
    options: {
      a: '5 MB',
      b: '10 MB',
      c: '16 MB',
      d: '25 MB'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 16 MB. Źródło: Opis korzystania z EBI, pkt V',
    difficulty: 'medium',
    tags: ["EBI", "raporty", "system informatyczny"]
  },

  {
    id: 'aso-068',
    article: '§ 4 ust. 2 Zasad przekazywania informacji',
    articleTitle: 'Zasady EBI',
    section: 'Systemy informatyczne',
    subsection: 'System EBI',
    question: 'Ilu operatorów EBI może mieć jeden emitent?',
    options: {
      a: 'Maksymalnie 1',
      b: 'Maksymalnie 2',
      c: 'Maksymalnie 3',
      d: 'Bez ograniczeń'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Maksymalnie 3. Źródło: § 4 ust. 2 Zasad przekazywania informacji',
    difficulty: 'medium',
    tags: ["EBI", "raporty", "system informatyczny"]
  },

  {
    id: 'aso-069',
    article: 'Art. 76 ust. 1 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Czy emitent może nabywać własne obligacje?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Tak, ale jedynie w celu ich umorzenia',
      c: 'Nie, jest to zabronione',
      d: 'Tak, ale tylko za zgodą obligatariuszy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tak, ale jedynie w celu ich umorzenia. Źródło: Art. 76 ust. 1 Ustawy o obligacjach',
    difficulty: 'medium',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-070',
    article: 'Art. 51 ust. 1 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Na ile dni przed zgromadzeniem obligatariuszy należy dokonać ogłoszenia o jego zwołaniu?',
    options: {
      a: '14 dni',
      b: '21 dni',
      c: '26 dni',
      d: '30 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 21 dni. Źródło: Art. 51 ust. 1 Ustawy o obligacjach',
    difficulty: 'medium',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-071',
    article: 'Art. 12 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Czy do oprocentowania obligacji stosuje się przepisy o odsetkach maksymalnych?',
    options: {
      a: 'Tak, zawsze',
      b: 'Nie, nie stosuje się',
      c: 'Tak, ale tylko do obligacji korporacyjnych',
      d: 'Tak, ale tylko do obligacji komunalnych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, nie stosuje się. Źródło: Art. 12 Ustawy o obligacjach',
    difficulty: 'medium',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-072',
    article: 'Art. 62 ust. 1 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Kiedy zgromadzenie obligatariuszy jest ważne?',
    options: {
      a: 'Gdy jest reprezentowana co najmniej 1/4 wartości nominalnej obligacji',
      b: 'Gdy jest reprezentowana co najmniej 1/2 wartości nominalnej obligacji',
      c: 'Gdy jest reprezentowana co najmniej 2/3 wartości nominalnej obligacji',
      d: 'Bez względu na liczbę reprezentowanych obligacji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy jest reprezentowana co najmniej 1/2 wartości nominalnej obligacji. Źródło: Art. 62 ust. 1 Ustawy o obligacjach',
    difficulty: 'medium',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-073',
    article: 'Art. 14 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'W jakim terminie przedawniają się roszczenia wynikające z obligacji?',
    options: {
      a: '3 lata',
      b: '6 lat',
      c: '10 lat',
      d: 'Nie przedawniają się'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 10 lat. Źródło: Art. 14 Ustawy o obligacjach',
    difficulty: 'medium',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-074',
    article: 'Art. 4 pkt 20 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Co to jest spółka publiczna według Ustawy o ofercie?',
    options: {
      a: 'Spółka, której akcje są dopuszczone do obrotu na rynku regulowanym',
      b: 'Spółka, której co najmniej jedna akcja jest dopuszczona do obrotu na rynku regulowanym lub wprowadzona do ASO na terytorium RP',
      c: 'Spółka notowana na GPW',
      d: 'Spółka z udziałem Skarbu Państwa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Spółka, której co najmniej jedna akcja jest dopuszczona do obrotu na rynku regulowanym lub wprowadzona do ASO na terytorium RP. Źródło: Art. 4 pkt 20 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-075',
    article: 'Art. 69 ust. 1 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Przy przekroczeniu jakich progów głosów należy zawiadomić KNF i spółkę?',
    options: {
      a: '5%, 10%, 20%, 50%',
      b: '5%, 10%, 15%, 20%, 25%, 33%, 33⅓%, 50%, 75%, 90%',
      c: '10%, 25%, 50%, 75%',
      d: '5%, 25%, 50%, 75%'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 5%, 10%, 15%, 20%, 25%, 33%, 33⅓%, 50%, 75%, 90%. Źródło: Art. 69 ust. 1 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-076',
    article: 'Art. 69 ust. 1 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'W jakim terminie należy zawiadomić KNF o przekroczeniu progu głosów w spółce publicznej?',
    options: {
      a: 'Niezwłocznie, nie później niż w ciągu 2 dni roboczych',
      b: 'Niezwłocznie, nie później niż w ciągu 4 dni roboczych',
      c: 'W terminie 7 dni',
      d: 'W terminie 14 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie, nie później niż w ciągu 4 dni roboczych. Źródło: Art. 69 ust. 1 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-077',
    article: 'Dobre praktyki AD na NewConnect',
    articleTitle: 'Dobre praktyki AD',
    section: 'Dobre praktyki',
    subsection: 'Dobre praktyki Autoryzowanych Doradców',
    question: 'Co Autoryzowany Doradca powinien zamieszczać na swojej stronie internetowej?',
    options: {
      a: 'Tylko dane kontaktowe',
      b: 'Informacje o zakresie usług oraz doświadczeniu ze wskazaniem podmiotów, dla których pełni funkcję AD',
      c: 'Tylko listę emitentów',
      d: 'Tylko regulamin świadczenia usług'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Informacje o zakresie usług oraz doświadczeniu ze wskazaniem podmiotów, dla których pełni funkcję AD. Źródło: Dobre praktyki AD na NewConnect',
    difficulty: 'medium',
    tags: ["dobre praktyki", "AD", "standardy"]
  },

  {
    id: 'aso-078',
    article: 'Dobre praktyki AD, pkt 3',
    articleTitle: 'Dobre praktyki AD',
    section: 'Dobre praktyki',
    subsection: 'Dobre praktyki Autoryzowanych Doradców',
    question: 'Co AD powinien zrobić przed wprowadzeniem instrumentów do ASO?',
    options: {
      a: 'Tylko sporządzić dokument informacyjny',
      b: 'Przeprowadzić rzetelną analizę emitenta i rynku (badanie due diligence)',
      c: 'Tylko podpisać umowę z emitentem',
      d: 'Tylko złożyć wniosek do GPW'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Przeprowadzić rzetelną analizę emitenta i rynku (badanie due diligence). Źródło: Dobre praktyki AD, pkt 3',
    difficulty: 'medium',
    tags: ["dobre praktyki", "AD", "standardy"]
  },

  {
    id: 'aso-079',
    article: 'Art. 402(3) § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co spółka publiczna zamieszcza na stronie internetowej przed WZA?',
    options: {
      a: 'Ogłoszenie o zwołaniu WZA i informację o liczbie akcji i głosów',
      b: 'Dokumentację dla WZA i projekty uchwał',
      c: 'Formularze do głosowania przez pełnomocnika',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 402(3) § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-080',
    article: 'Art. 19 ust. 11 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Czym jest okres zamknięty według rozporządzenia MAR?',
    options: {
      a: 'Okres 14 dni przed publikacją raportu okresowego',
      b: 'Okres 30 dni kalendarzowych przed ogłoszeniem raportu finansowego',
      c: 'Okres 7 dni przed WZA',
      d: 'Okres między zakończeniem roku obrotowego a publikacją raportu rocznego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Okres 30 dni kalendarzowych przed ogłoszeniem raportu finansowego. Źródło: Art. 19 ust. 11 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-081',
    article: 'Art. 14 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Kto NIE może wykorzystywać informacji poufnych?',
    options: {
      a: 'Tylko osoby zarządzające',
      b: 'Tylko osoby nadzorujące',
      c: 'Każda osoba',
      d: 'Tylko pracownicy emitenta'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Każda osoba. Źródło: Art. 14 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-082',
    article: 'Art. 3 ust. 1 pkt 26 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Kto jest osobą blisko związaną według rozporządzenia MAR?',
    options: {
      a: 'Tylko małżonek',
      b: 'Małżonek, dziecko na utrzymaniu, członek rodziny we wspólnym gospodarstwie domowym przez rok',
      c: 'Tylko dzieci',
      d: 'Tylko rodzice'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Małżonek, dziecko na utrzymaniu, członek rodziny we wspólnym gospodarstwie domowym przez rok. Źródło: Art. 3 ust. 1 pkt 26 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-083',
    article: 'Art. 7 ust. 1 Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Kiedy powstają prawa ze zdematerializowanych papierów wartościowych?',
    options: {
      a: 'Z chwilą podjęcia uchwały o emisji',
      b: 'Z chwilą zapisania ich po raz pierwszy na rachunku papierów wartościowych',
      c: 'Z chwilą rejestracji emisji w KRS',
      d: 'Z chwilą opłacenia akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Z chwilą zapisania ich po raz pierwszy na rachunku papierów wartościowych. Źródło: Art. 7 ust. 1 Ustawy o obrocie',
    difficulty: 'medium',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-084',
    article: 'Art. 3 pkt 1 Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co jest papierem wartościowym według Ustawy o obrocie?',
    options: {
      a: 'Akcje, obligacje, listy zastawne',
      b: 'Certyfikaty inwestycyjne i warranty subskrypcyjne',
      c: 'Prawa poboru i prawa do akcji',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 3 pkt 1 Ustawy o obrocie',
    difficulty: 'medium',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-085',
    article: 'Art. 45 ust. 1a Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Kiedy emitent na NewConnect może sporządzać sprawozdania finansowe według MSR?',
    options: {
      a: 'Zawsze, bez ograniczeń',
      b: 'Gdy jest emitentem papierów wartościowych dopuszczonych do obrotu na rynku regulowanym lub zamierza się o to ubiegać',
      c: 'Nigdy, musi stosować polskie zasady rachunkowości',
      d: 'Tylko za zgodą KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy jest emitentem papierów wartościowych dopuszczonych do obrotu na rynku regulowanym lub zamierza się o to ubiegać. Źródło: Art. 45 ust. 1a Ustawy o rachunkowości',
    difficulty: 'medium',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-086',
    article: 'Art. 66 ust. 4 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Kto wybiera firmę audytorską do badania sprawozdania finansowego?',
    options: {
      a: 'Zarząd',
      b: 'Rada nadzorcza',
      c: 'Organ zatwierdzający sprawozdanie finansowe (zazwyczaj WZA)',
      d: 'Biegły rewident'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Organ zatwierdzający sprawozdanie finansowe (zazwyczaj WZA). Źródło: Art. 66 ust. 4 Ustawy o rachunkowości',
    difficulty: 'medium',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-087',
    article: 'Art. 4a Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Kto odpowiada za poprawność sprawozdania finansowego?',
    options: {
      a: 'Tylko zarząd',
      b: 'Tylko rada nadzorcza',
      c: 'Kierownik jednostki oraz członkowie rady nadzorczej solidarnie',
      d: 'Tylko firma audytorska'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Kierownik jednostki oraz członkowie rady nadzorczej solidarnie. Źródło: Art. 4a Ustawy o rachunkowości',
    difficulty: 'medium',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-088',
    article: 'Rozdział III Zasad działania Catalyst',
    articleTitle: 'Catalyst',
    section: 'Rynki obligacji',
    subsection: 'Catalyst - rynek obligacji',
    question: 'Na jakich rynkach GPW i BondSpot mogą być jednocześnie notowane obligacje na Catalyst?',
    options: {
      a: 'Tylko na rynku regulowanym GPW i rynku regulowanym BondSpot',
      b: 'Tylko w ASO GPW i ASO BondSpot',
      c: 'Na rynku regulowanym jednego organizatora i w ASO drugiego',
      d: 'Wszystkie powyższe kombinacje są możliwe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe kombinacje są możliwe. Źródło: Rozdział III Zasad działania Catalyst',
    difficulty: 'medium',
    tags: ["Catalyst", "obligacje", "rynek obligacji"]
  },

  {
    id: 'aso-089',
    article: 'Rozdział IX pkt 35 Zasad działania Catalyst',
    articleTitle: 'Catalyst',
    section: 'Rynki obligacji',
    subsection: 'Catalyst - rynek obligacji',
    question: 'Jakie są warunki uzyskania autoryzacji przy Catalyst?',
    options: {
      a: 'Emitent musi mieć siedzibę w Polsce',
      b: 'W stosunku do emitenta nie może toczyć się postępowanie upadłościowe lub likwidacyjne',
      c: 'Emitent musi mieć umowę z AD',
      d: 'Wartość emisji musi przekraczać 10 mln zł'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W stosunku do emitenta nie może toczyć się postępowanie upadłościowe lub likwidacyjne. Źródło: Rozdział IX pkt 35 Zasad działania Catalyst',
    difficulty: 'medium',
    tags: ["Catalyst", "obligacje", "rynek obligacji"]
  },

  {
    id: 'aso-090',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest wskaźnik Dividend Yield (stopa dywidendy)?',
    options: {
      a: 'Zysk netto / Kapitał własny',
      b: 'Dywidenda na akcję / Cena rynkowa akcji',
      c: 'Cena akcji / Zysk na akcję',
      d: 'Wartość księgowa / Cena akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dywidenda na akcję / Cena rynkowa akcji. Źródło: Analiza finansowa',
    difficulty: 'medium',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-091',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Które z poniższych są wskaźnikami rynkowymi?',
    options: {
      a: 'ROE i ROA',
      b: 'P/E, P/BV, P/S',
      c: 'Wskaźnik płynności bieżącej',
      d: 'Marża zysku netto'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: P/E, P/BV, P/S. Źródło: Analiza finansowa',
    difficulty: 'medium',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-092',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik C/WK (P/BV)?',
    options: {
      a: 'Zysk netto / Liczba akcji',
      b: 'Cena akcji / (Aktywa - Zobowiązania) / Liczba akcji',
      c: 'Cena akcji / Zysk na akcję',
      d: 'Kapitał własny / Cena akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Cena akcji / (Aktywa - Zobowiązania) / Liczba akcji. Źródło: Analiza finansowa',
    difficulty: 'medium',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-093',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Które z poniższych są wskaźnikami rentowności?',
    options: {
      a: 'P/E i P/BV',
      b: 'ROE i ROA',
      c: 'Wskaźnik płynności bieżącej i szybkiej',
      d: 'EV/EBITDA'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: ROE i ROA. Źródło: Analiza finansowa',
    difficulty: 'medium',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-094',
    article: '§ 3 ust. 1 pkt 5) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaka jest minimalna wartość nominalna akcji spółki ubiegającej się o wprowadzenie do ASO?',
    options: {
      a: '0,01 zł (1 grosz)',
      b: '0,10 zł (10 groszy)',
      c: '1,00 zł',
      d: 'Brak minimalnej wartości'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 0,10 zł (10 groszy). Źródło: § 3 ust. 1 pkt 5) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-095',
    article: '§ 3 ust. 1 pkt 6) lit. b) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaki jest minimalny kapitał własny emitenta ubiegającego się po raz pierwszy o wprowadzenie akcji do ASO?',
    options: {
      a: '500.000 zł',
      b: '1.000.000 zł',
      c: '2.000.000 zł',
      d: '5.000.000 zł'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 2.000.000 zł. Źródło: § 3 ust. 1 pkt 6) lit. b) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-096',
    article: '§ 3 ust. 1 pkt 6) lit. a) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaki procent akcji objętych wnioskiem musi znajdować się w posiadaniu co najmniej 25 akcjonariuszy przy pierwszym wprowadzeniu?',
    options: {
      a: '10%',
      b: '15%',
      c: '20%',
      d: '25%'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 15%. Źródło: § 3 ust. 1 pkt 6) lit. a) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-097',
    article: '§ 3 ust. 1 pkt 8) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaka jest minimalna łączna wartość nominalna dłużnych instrumentów finansowych przy wprowadzeniu do ASO?',
    options: {
      a: '1.000.000 zł',
      b: '2.500.000 zł',
      c: '5.000.000 zł',
      d: '10.000.000 zł'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 5.000.000 zł. Źródło: § 3 ust. 1 pkt 8) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-098',
    article: '§ 3 ust. 1d Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Przez jaki okres akcje założycieli nie mogą być wprowadzone do obrotu po debiucie?',
    options: {
      a: '6 miesięcy',
      b: '12 miesięcy',
      c: '18 miesięcy',
      d: '24 miesiące'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 12 miesięcy. Źródło: § 3 ust. 1d Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-099',
    article: '§ 5 ust. 1b Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaki jest skrócony termin na podjęcie uchwały o wprowadzeniu, gdy co najmniej 5% akcji należy do inwestorów instytucjonalnych?',
    options: {
      a: '3 dni robocze',
      b: '5 dni roboczych',
      c: '7 dni roboczych',
      d: '10 dni roboczych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 5 dni roboczych. Źródło: § 5 ust. 1b Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-100',
    article: '§ 5 ust. 4 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie emitent może złożyć wniosek o ponowne rozpoznanie sprawy po decyzji o odmowie wprowadzenia?',
    options: {
      a: '5 dni roboczych',
      b: '10 dni roboczych',
      c: '14 dni roboczych',
      d: '30 dni roboczych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 10 dni roboczych. Źródło: § 5 ust. 4 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-101',
    article: '§ 5 ust. 4 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie Organizator ASO musi rozpatrzyć wniosek o ponowne rozpoznanie sprawy?',
    options: {
      a: '14 dni roboczych',
      b: '21 dni roboczych',
      c: '30 dni roboczych',
      d: '60 dni roboczych'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 30 dni roboczych. Źródło: § 5 ust. 4 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-102',
    article: '§ 15d Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim terminie należy złożyć wniosek o wprowadzenie akcji nowej emisji, jeśli emitent jest już notowany?',
    options: {
      a: '6 miesięcy od podwyższenia kapitału',
      b: '12 miesięcy od podwyższenia kapitału',
      c: '18 miesięcy od podwyższenia kapitału',
      d: 'Brak terminu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 12 miesięcy od podwyższenia kapitału. Źródło: § 15d Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-103',
    article: '§ 5 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Emitent będący jednostką dominującą może nie sporządzać skonsolidowanego raportu wyłącznie gdy:',
    options: {
      a: 'Gdy jednostki zależne są nieistotne',
      b: 'Zgodnie z art. 56 ust. 3 ustawy o rachunkowości',
      c: 'Gdy sam tego nie chce',
      d: 'Gdy KNF wyrazi zgodę'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zgodnie z art. 56 ust. 3 ustawy o rachunkowości. Źródło: § 5 ust. 2 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-104',
    article: '§ 6 ust. 10a Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Czy emitent może nie przekazywać raportu kwartalnego za ostatni kwartał roku obrotowego?',
    options: {
      a: 'Nie, raport jest zawsze obowiązkowy',
      b: 'Tak, pod warunkiem przekazania raportu rocznego w terminie 80 dni od zakończenia roku',
      c: 'Tak, bez żadnych warunków',
      d: 'Tak, za zgodą Organizatora ASO'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tak, pod warunkiem przekazania raportu rocznego w terminie 80 dni od zakończenia roku. Źródło: § 6 ust. 10a Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-105',
    article: '§ 6 ust. 3 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Na ile dni przed WZA należy przekazać raport bieżący o zwołaniu WZA?',
    options: {
      a: '14 dni',
      b: '21 dni',
      c: '26 dni',
      d: '30 dni'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 26 dni. Źródło: § 6 ust. 3 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-106',
    article: '§ 6 ust. 6 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Na ile dni przed WZA należy przekazać raport z nowymi punktami porządku obrad na żądanie akcjonariusza?',
    options: {
      a: '14 dni',
      b: '18 dni',
      c: '21 dni',
      d: '26 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 18 dni. Źródło: § 6 ust. 6 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-107',
    article: '§ 6 ust. 2a Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie od powołania osoby zarządzającej lub nadzorującej należy przekazać szczegółowe informacje o tej osobie?',
    options: {
      a: 'Niezwłocznie',
      b: 'W terminie 24 godzin',
      c: 'W terminie 3 dni roboczych',
      d: 'W terminie 7 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W terminie 24 godzin. Źródło: § 6 ust. 2a Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-108',
    article: 'Art. 2 lit. e Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Co to jest inwestor kwalifikowany?',
    options: {
      a: 'Każdy inwestor posiadający rachunek maklerski',
      b: 'Osoby lub podmioty wymienione w załączniku II do dyrektywy MiFID II (instytucje finansowe, duże przedsiębiorstwa)',
      c: 'Inwestor posiadający co najmniej 100.000 zł oszczędności',
      d: 'Tylko fundusze inwestycyjne'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Osoby lub podmioty wymienione w załączniku II do dyrektywy MiFID II (instytucje finansowe, duże przedsiębiorstwa). Źródło: Art. 2 lit. e Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-109',
    article: '§ 12b ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim przypadku emitent może zostać wykluczony z ASO za brak publikacji raportów rocznych?',
    options: {
      a: 'Za brak jednego raportu rocznego',
      b: 'Za brak raportów rocznych za co najmniej 2 ostatnie lata obrotowe',
      c: 'Za brak raportów rocznych za co najmniej 3 ostatnie lata obrotowe',
      d: 'Nie może zostać wykluczony za brak raportów'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Za brak raportów rocznych za co najmniej 2 ostatnie lata obrotowe. Źródło: § 12b ust. 1 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-110',
    article: '§ 12b ust. 1 lit. a)-c) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Co jest uznawane za nieopublikowanie raportu rocznego?',
    options: {
      a: 'Opublikowanie raportu bez sprawozdania z badania firmy audytorskiej',
      b: 'Opublikowanie raportu ze sprawozdaniem finansowym, do którego wydano opinię negatywną',
      c: 'Opublikowanie raportu ze sprawozdaniem finansowym, do którego odmówiono wydania opinii',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: § 12b ust. 1 lit. a)-c) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-111',
    article: '§ 9 ust. 4 i 4a Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakim przypadku nie stosuje się obowiązku posiadania Animatora Rynku dla dłużnych instrumentów?',
    options: {
      a: 'Gdy wartość nominalna wynosi co najmniej 5.000.000 zł',
      b: 'Gdy wartość nominalna wynosi co najmniej 10.000.000 zł',
      c: 'Gdy instrumenty były wcześniej na rynku regulowanym',
      d: 'Odpowiedzi B i C są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Odpowiedzi B i C są prawidłowe. Źródło: § 9 ust. 4 i 4a Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-112',
    article: '§ 2 ust. 1 pkt 27) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Co obejmuje definicja dłużnych instrumentów finansowych w Regulaminie ASO?',
    options: {
      a: 'Tylko obligacje',
      b: 'Obligacje, listy zastawne, bankowe papiery wartościowe o charakterze dłużnym',
      c: 'Obligacje, listy zastawne, bankowe papiery wartościowe dłużne oraz inne zbywalne papiery inkorporujące prawa z długu',
      d: 'Tylko obligacje korporacyjne'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Obligacje, listy zastawne, bankowe papiery wartościowe dłużne oraz inne zbywalne papiery inkorporujące prawa z długu. Źródło: § 2 ust. 1 pkt 27) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-113',
    article: '§ 2 ust. 1 pkt 27a) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Czym są obligacje kapitałowe?',
    options: {
      a: 'Obligacje zamienne na akcje',
      b: 'Obligacje, o których mowa w art. 27a ustawy o obligacjach',
      c: 'Obligacje emitowane przez JST',
      d: 'Obligacje zerokuponowe'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Obligacje, o których mowa w art. 27a ustawy o obligacjach. Źródło: § 2 ust. 1 pkt 27a) Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-114',
    article: '§ 6a Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Co emitent musi posiadać przed wprowadzeniem instrumentów do ASO?',
    options: {
      a: 'Numer NIP',
      b: 'Kod LEI',
      c: 'Numer REGON',
      d: 'Numer KRS'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Kod LEI. Źródło: § 6a Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-115',
    article: '§ 6b ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakiej formie można składać wnioski do Organizatora ASO?',
    options: {
      a: 'Tylko w formie papierowej',
      b: 'Tylko elektronicznie',
      c: 'W formie papierowej lub elektronicznie (PDF z kwalifikowanym podpisem elektronicznym lub podpisem zaufanym)',
      d: 'Tylko przez system EBI'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: W formie papierowej lub elektronicznie (PDF z kwalifikowanym podpisem elektronicznym lub podpisem zaufanym). Źródło: § 6b ust. 1 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-116',
    article: '§ 6b ust. 3 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Na jaki adres e-mail należy przesyłać wnioski elektroniczne do Organizatora ASO?',
    options: {
      a: 'Tylko gpw@gpw.pl',
      b: 'Tylko emitenci@gpw.pl',
      c: 'gpw@gpw.pl lub emitenci@gpw.pl',
      d: 'aso@gpw.pl'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: gpw@gpw.pl lub emitenci@gpw.pl. Źródło: § 6b ust. 3 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-117',
    article: '§ 10 ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Kto może być stroną transakcji w alternatywnym systemie obrotu?',
    options: {
      a: 'Każdy inwestor',
      b: 'Wyłącznie Członek Rynku oraz Krajowy Depozyt na określonych zasadach',
      c: 'Tylko firmy inwestycyjne',
      d: 'Tylko inwestorzy kwalifikowani'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Wyłącznie Członek Rynku oraz Krajowy Depozyt na określonych zasadach. Źródło: § 10 ust. 1 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-118',
    article: '§ 9 ust. 1 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'W jakich systemach notowań mogą być notowane instrumenty w ASO?',
    options: {
      a: 'Tylko w systemie notowań ciągłych',
      b: 'Tylko w systemie kursu jednolitego',
      c: 'W systemie notowań ciągłych lub kursu jednolitego (z dwukrotnym lub jednokrotnym określaniem kursu)',
      d: 'Tylko w systemie aukcyjnym'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: W systemie notowań ciągłych lub kursu jednolitego (z dwukrotnym lub jednokrotnym określaniem kursu). Źródło: § 9 ust. 1 Regulaminu ASO',
    difficulty: 'medium',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-119',
    article: 'pkt 4a Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Ile osób posiadających Certyfikat Doradcy musi zatrudniać Autoryzowany Doradca?',
    options: {
      a: 'Co najmniej 1 osobę',
      b: 'Co najmniej 2 osoby',
      c: 'Co najmniej 3 osoby',
      d: 'Co najmniej 5 osób'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Co najmniej 2 osoby. Źródło: pkt 4a Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-120',
    article: 'pkt 30 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Przez ile lat AD musi przechowywać dokumentację świadczącą o prowadzonym doradztwie?',
    options: {
      a: '1 rok',
      b: '3 lata',
      c: '5 lat',
      d: '10 lat'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 3 lata. Źródło: pkt 30 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'medium',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-121',
    article: 'Art. 7 ust. 1 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Co to jest informacja poufna według rozporządzenia MAR?',
    options: {
      a: 'Każda informacja dotycząca emitenta',
      b: 'Informacja określona w sposób precyzyjny, niepodana do publicznej wiadomości, dotycząca emitenta, która w przypadku podania do wiadomości miałaby istotny wpływ na cenę',
      c: 'Informacja o planowanych transakcjach zarządu',
      d: 'Informacja o wynikach finansowych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Informacja określona w sposób precyzyjny, niepodana do publicznej wiadomości, dotycząca emitenta, która w przypadku podania do wiadomości miałaby istotny wpływ na cenę. Źródło: Art. 7 ust. 1 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-122',
    article: 'Art. 17 ust. 1 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'W jakim terminie emitent musi podać informację poufną do publicznej wiadomości?',
    options: {
      a: 'W terminie 24 godzin',
      b: 'Niezwłocznie',
      c: 'W terminie 48 godzin',
      d: 'W terminie 7 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie. Źródło: Art. 17 ust. 1 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-123',
    article: 'Art. 17 ust. 4 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Kiedy emitent może opóźnić podanie informacji poufnej do wiadomości publicznej?',
    options: {
      a: 'Zawsze, gdy uzna to za stosowne',
      b: 'Gdy niezwłoczne ujawnienie mogłoby naruszyć prawnie uzasadnione interesy emitenta, opóźnienie nie wprowadzi w błąd opinii publicznej, a emitent jest w stanie zapewnić poufność',
      c: 'Tylko za zgodą KNF',
      d: 'Nigdy, informacja musi być podana niezwłocznie'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy niezwłoczne ujawnienie mogłoby naruszyć prawnie uzasadnione interesy emitenta, opóźnienie nie wprowadzi w błąd opinii publicznej, a emitent jest w stanie zapewnić poufność. Źródło: Art. 17 ust. 4 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-124',
    article: 'Art. 19 ust. 8 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Jaki jest próg wartości transakcji osób pełniących obowiązki zarządcze, powyżej którego należy powiadomić emitenta i KNF?',
    options: {
      a: '5.000 EUR',
      b: '10.000 EUR',
      c: '20.000 EUR',
      d: '50.000 EUR'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 20.000 EUR. Źródło: Art. 19 ust. 8 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-125',
    article: 'Art. 19 ust. 1 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'W jakim terminie osoba pełniąca obowiązki zarządcze musi powiadomić o transakcji na instrumentach emitenta?',
    options: {
      a: 'Niezwłocznie, nie później niż w ciągu 24 godzin',
      b: 'Niezwłocznie, nie później niż w ciągu 3 dni roboczych',
      c: 'W terminie 7 dni',
      d: 'W terminie 14 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie, nie później niż w ciągu 3 dni roboczych. Źródło: Art. 19 ust. 1 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-126',
    article: 'Art. 12 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Co to jest manipulacja na rynku według rozporządzenia MAR?',
    options: {
      a: 'Tylko sztuczne zawyżanie cen',
      b: 'Zawieranie transakcji lub składanie zleceń dających fałszywe sygnały, rozpowszechnianie informacji wprowadzających w błąd, lub inne działania manipulacyjne',
      c: 'Tylko insider trading',
      d: 'Tylko short selling'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zawieranie transakcji lub składanie zleceń dających fałszywe sygnały, rozpowszechnianie informacji wprowadzających w błąd, lub inne działania manipulacyjne. Źródło: Art. 12 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-127',
    article: 'Art. 18 ust. 1 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Kto prowadzi listę osób mających dostęp do informacji poufnych?',
    options: {
      a: 'KNF',
      b: 'Emitent lub osoba działająca w jego imieniu',
      c: 'GPW',
      d: 'KDPW'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Emitent lub osoba działająca w jego imieniu. Źródło: Art. 18 ust. 1 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-128',
    article: 'Art. 18 ust. 5 Rozporządzenia MAR',
    articleTitle: 'Rozporządzenie MAR',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie MAR',
    question: 'Przez jaki okres należy przechowywać listę insiderów?',
    options: {
      a: '3 lata od sporządzenia lub aktualizacji',
      b: '5 lat od sporządzenia lub aktualizacji',
      c: '7 lat od sporządzenia lub aktualizacji',
      d: '10 lat od sporządzenia lub aktualizacji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 5 lat od sporządzenia lub aktualizacji. Źródło: Art. 18 ust. 5 Rozporządzenia MAR',
    difficulty: 'medium',
    tags: ["MAR", "informacje poufne", "insider trading"]
  },

  {
    id: 'aso-129',
    article: 'Ustawa o nadzorze nad rynkiem kapitałowym',
    articleTitle: 'Nadzór nad rynkiem',
    section: 'Nadzór nad rynkiem',
    subsection: 'Przepisy ogólne',
    question: 'Jaki organ sprawuje nadzór nad rynkiem kapitałowym w Polsce?',
    options: {
      a: 'Narodowy Bank Polski',
      b: 'Komisja Nadzoru Finansowego',
      c: 'Ministerstwo Finansów',
      d: 'Giełda Papierów Wartościowych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Komisja Nadzoru Finansowego. Źródło: Ustawa o nadzorze nad rynkiem kapitałowym',
    difficulty: 'medium',
    tags: ["nadzór nad rynkiem"]
  },

  {
    id: 'aso-130',
    article: 'Art. 72 i nast. Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Co to jest wezwanie do zapisywania się na sprzedaż akcji?',
    options: {
      a: 'Oferta publiczna nowych akcji',
      b: 'Publiczne ogłoszenie zamiaru nabycia akcji spółki publicznej po określonej cenie',
      c: 'Przymusowy wykup akcji',
      d: 'Oferta zamiany akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Publiczne ogłoszenie zamiaru nabycia akcji spółki publicznej po określonej cenie. Źródło: Art. 72 i nast. Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-131',
    article: 'Art. 73 ust. 1 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Przy przekroczeniu jakiego progu głosów powstaje obowiązek ogłoszenia wezwania na wszystkie akcje?',
    options: {
      a: '33%',
      b: '50%',
      c: '66%',
      d: '75%'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 50%. Źródło: Art. 73 ust. 1 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-132',
    article: 'Art. 73 ust. 2 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Przy przekroczeniu jakiego progu głosów powstaje obowiązek ogłoszenia wezwania na akcje uprawniające do 66% głosów?',
    options: {
      a: '25%',
      b: '33%',
      c: '50%',
      d: '66%'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 33%. Źródło: Art. 73 ust. 2 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-133',
    article: 'Art. 77 ust. 1 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Jaki podmiot pośredniczy w wezwaniu do zapisywania się na sprzedaż akcji?',
    options: {
      a: 'Każdy bank',
      b: 'Podmiot prowadzący działalność maklerską na terytorium RP',
      c: 'GPW',
      d: 'KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Podmiot prowadzący działalność maklerską na terytorium RP. Źródło: Art. 77 ust. 1 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-134',
    article: 'Art. 82 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Czym jest przymusowy wykup akcji (squeeze-out)?',
    options: {
      a: 'Obowiązek nabycia akcji przez mniejszościowego akcjonariusza',
      b: 'Prawo akcjonariusza posiadającego co najmniej 95% głosów do żądania sprzedaży akcji przez pozostałych akcjonariuszy',
      c: 'Wezwanie dobrowolne',
      d: 'Przymusowe umorzenie akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Prawo akcjonariusza posiadającego co najmniej 95% głosów do żądania sprzedaży akcji przez pozostałych akcjonariuszy. Źródło: Art. 82 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-135',
    article: 'Art. 83 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Czym jest przymusowy odkup akcji (sell-out)?',
    options: {
      a: 'Prawo większościowego akcjonariusza do wykupu',
      b: 'Prawo akcjonariusza mniejszościowego do żądania odkupu jego akcji przez akcjonariusza posiadającego co najmniej 95% głosów',
      c: 'Wezwanie obowiązkowe',
      d: 'Dobrowolny odkup akcji własnych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Prawo akcjonariusza mniejszościowego do żądania odkupu jego akcji przez akcjonariusza posiadającego co najmniej 95% głosów. Źródło: Art. 83 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-136',
    article: 'Art. 76 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Ile wynosi minimalny czas trwania wezwania do zapisywania się na sprzedaż akcji?',
    options: {
      a: '14 dni',
      b: '21 dni',
      c: '30 dni',
      d: '60 dni'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 30 dni. Źródło: Art. 76 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-137',
    article: 'Art. 77 ust. 5 Ustawy o ofercie',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Gdzie ogłasza się wezwanie do zapisywania się na sprzedaż akcji?',
    options: {
      a: 'Tylko w Monitorze Sądowym i Gospodarczym',
      b: 'W co najmniej jednej gazecie o zasięgu ogólnopolskim oraz na stronie internetowej podmiotu prowadzącego rynek regulowany',
      c: 'Tylko na stronie KNF',
      d: 'Tylko w siedzibie spółki'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W co najmniej jednej gazecie o zasięgu ogólnopolskim oraz na stronie internetowej podmiotu prowadzącego rynek regulowany. Źródło: Art. 77 ust. 5 Ustawy o ofercie',
    difficulty: 'medium',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-138',
    article: 'Art. 6 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Co to jest prospekt emisyjny?',
    options: {
      a: 'Dokument informacyjny dla ASO',
      b: 'Dokument zawierający informacje o emitencie i papierach wartościowych, sporządzany w związku z ofertą publiczną lub dopuszczeniem do obrotu na rynku regulowanym',
      c: 'Sprawozdanie finansowe',
      d: 'Raport bieżący'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dokument zawierający informacje o emitencie i papierach wartościowych, sporządzany w związku z ofertą publiczną lub dopuszczeniem do obrotu na rynku regulowanym. Źródło: Art. 6 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-139',
    article: 'Art. 20 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Kto zatwierdza prospekt emisyjny w Polsce?',
    options: {
      a: 'GPW',
      b: 'KNF',
      c: 'Ministerstwo Finansów',
      d: 'NBP'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: KNF. Źródło: Art. 20 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-140',
    article: 'Art. 20 ust. 2 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Ile dni ma KNF na zatwierdzenie prospektu?',
    options: {
      a: '7 dni roboczych',
      b: '10 dni roboczych',
      c: '14 dni roboczych',
      d: '20 dni roboczych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 10 dni roboczych. Źródło: Art. 20 ust. 2 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-141',
    article: 'Art. 12 ust. 1 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Przez jaki okres prospekt jest ważny?',
    options: {
      a: '6 miesięcy',
      b: '12 miesięcy',
      c: '18 miesięcy',
      d: '24 miesiące'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 12 miesięcy. Źródło: Art. 12 ust. 1 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-142',
    article: 'Art. 2 lit. d Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Co to jest oferta publiczna papierów wartościowych?',
    options: {
      a: 'Każda oferta sprzedaży akcji',
      b: 'Komunikat skierowany do co najmniej 150 osób lub do nieoznaczonego adresata, zawierający informacje o papierach i warunkach ich nabycia',
      c: 'Oferta skierowana wyłącznie do inwestorów kwalifikowanych',
      d: 'Oferta na rynku regulowanym'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Komunikat skierowany do co najmniej 150 osób lub do nieoznaczonego adresata, zawierający informacje o papierach i warunkach ich nabycia. Źródło: Art. 2 lit. d Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-143',
    article: 'Art. 1 ust. 4 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Kiedy NIE jest wymagany prospekt przy ofercie publicznej?',
    options: {
      a: 'Gdy oferta skierowana jest wyłącznie do inwestorów kwalifikowanych',
      b: 'Gdy łączna wartość ofert nie przekracza 2.500.000 EUR w ciągu 12 miesięcy',
      c: 'Gdy oferta skierowana jest do mniej niż 150 osób fizycznych lub prawnych innych niż inwestorzy kwalifikowani',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 1 ust. 4 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-144',
    article: 'Art. 1 ust. 4 lit. c Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Jaka jest minimalna wartość nominalna obligacji oferowanych bez prospektu?',
    options: {
      a: '10.000 EUR',
      b: '50.000 EUR',
      c: '100.000 EUR',
      d: '150.000 EUR'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 100.000 EUR. Źródło: Art. 1 ust. 4 lit. c Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-145',
    article: 'Art. 24 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Co to jest paszport prospektu?',
    options: {
      a: 'Dokument podróżny emitenta',
      b: 'Możliwość wykorzystania prospektu zatwierdzonego w jednym państwie UE do oferty lub dopuszczenia w innym państwie UE',
      c: 'Zezwolenie KNF na działalność',
      d: 'Certyfikat jakości'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Możliwość wykorzystania prospektu zatwierdzonego w jednym państwie UE do oferty lub dopuszczenia w innym państwie UE. Źródło: Art. 24 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-146',
    article: 'Art. 23 Rozporządzenia 2017/1129',
    articleTitle: 'Rozporządzenie 2017/1129',
    section: 'Regulacje unijne',
    subsection: 'Rozporządzenie Prospektowe',
    question: 'Co to jest suplement do prospektu?',
    options: {
      a: 'Nowy prospekt',
      b: 'Dokument zawierający nowe istotne informacje, które pojawiły się po zatwierdzeniu prospektu a przed zakończeniem oferty',
      c: 'Sprawozdanie finansowe',
      d: 'Raport bieżący'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dokument zawierający nowe istotne informacje, które pojawiły się po zatwierdzeniu prospektu a przed zakończeniem oferty. Źródło: Art. 23 Rozporządzenia 2017/1129',
    difficulty: 'medium',
    tags: ["prospekt", "inwestor kwalifikowany"]
  },

  {
    id: 'aso-147',
    article: 'Art. 362 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy emitent może nabywać własne akcje?',
    options: {
      a: 'Nie, jest to całkowicie zabronione',
      b: 'Tak, ale tylko w przypadkach określonych w KSH',
      c: 'Tak, bez ograniczeń',
      d: 'Tylko za zgodą KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Tak, ale tylko w przypadkach określonych w KSH. Źródło: Art. 362 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-148',
    article: 'Art. 362 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaki jest limit nabywania przez spółkę własnych akcji?',
    options: {
      a: '5% kapitału zakładowego',
      b: '10% kapitału zakładowego',
      c: '20% kapitału zakładowego',
      d: 'Brak limitu'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 20% kapitału zakładowego. Źródło: Art. 362 § 2 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-149',
    article: 'Art. 396 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Na jaki kapitał przekazuje się agio (nadwyżkę ceny emisyjnej ponad wartość nominalną)?',
    options: {
      a: 'Kapitał zakładowy',
      b: 'Kapitał zapasowy',
      c: 'Kapitał rezerwowy',
      d: 'Fundusz dywidendowy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Kapitał zapasowy. Źródło: Art. 396 § 2 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-150',
    article: 'Art. 396 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaki procent zysku spółka akcyjna musi odprowadzać na kapitał zapasowy?',
    options: {
      a: '4% rocznie aż do osiągnięcia 1/4 kapitału zakładowego',
      b: '8% rocznie aż do osiągnięcia 1/3 kapitału zakładowego',
      c: '10% rocznie aż do osiągnięcia połowy kapitału zakładowego',
      d: 'Brak takiego obowiązku'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 8% rocznie aż do osiągnięcia 1/3 kapitału zakładowego. Źródło: Art. 396 § 1 KSH',
    difficulty: 'medium',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-151',
    article: 'Art. 386 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jak długa może być kadencja członka rady nadzorczej?',
    options: {
      a: 'Maksymalnie 3 lata',
      b: 'Maksymalnie 5 lat',
      c: 'Maksymalnie 7 lat',
      d: 'Bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Maksymalnie 5 lat. Źródło: Art. 386 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-152',
    article: 'Art. 369 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jak długa może być kadencja członka zarządu spółki akcyjnej?',
    options: {
      a: 'Maksymalnie 3 lata',
      b: 'Maksymalnie 5 lat',
      c: 'Maksymalnie 7 lat',
      d: 'Bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Maksymalnie 5 lat. Źródło: Art. 369 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-153',
    article: 'Art. 368 § 4 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto powołuje członków zarządu spółki akcyjnej, jeżeli statut nie stanowi inaczej?',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza',
      c: 'Założyciele',
      d: 'Sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Rada nadzorcza. Źródło: Art. 368 § 4 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-154',
    article: 'Art. 385 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto powołuje członków rady nadzorczej spółki akcyjnej?',
    options: {
      a: 'Zarząd',
      b: 'Walne zgromadzenie',
      c: 'Sąd rejestrowy',
      d: 'Prezes zarządu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Walne zgromadzenie. Źródło: Art. 385 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-155',
    article: 'Art. 433 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest prawo poboru?',
    options: {
      a: 'Prawo do dywidendy',
      b: 'Prawo pierwszeństwa do objęcia nowych akcji w stosunku do liczby posiadanych akcji',
      c: 'Prawo do udziału w WZA',
      d: 'Prawo do żądania informacji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Prawo pierwszeństwa do objęcia nowych akcji w stosunku do liczby posiadanych akcji. Źródło: Art. 433 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-156',
    article: 'Art. 433 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka większość jest wymagana do wyłączenia prawa poboru?',
    options: {
      a: 'Zwykła większość głosów',
      b: 'Bezwzględna większość głosów',
      c: 'Większość 4/5 głosów',
      d: 'Jednomyślność'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Większość 4/5 głosów. Źródło: Art. 433 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-157',
    article: 'Art. 3 pkt 29 Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co to są prawa do akcji (PDA)?',
    options: {
      a: 'Akcje zwykłe',
      b: 'Papier wartościowy inkorporujący prawo do otrzymania akcji nowej emisji, powstający z chwilą przydziału akcji',
      c: 'Warranty subskrypcyjne',
      d: 'Prawa poboru'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Papier wartościowy inkorporujący prawo do otrzymania akcji nowej emisji, powstający z chwilą przydziału akcji. Źródło: Art. 3 pkt 29 Ustawy o obrocie',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-158',
    article: 'Art. 431 § 4 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'W jakim terminie należy zarejestrować podwyższenie kapitału zakładowego w przypadku subskrypcji prywatnej?',
    options: {
      a: '3 miesiące od przydziału akcji',
      b: '6 miesięcy od dnia WZA',
      c: '12 miesięcy od przydziału akcji',
      d: 'Brak terminu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 6 miesięcy od dnia WZA. Źródło: Art. 431 § 4 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-159',
    article: 'Art. 444 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest podwyższenie kapitału w ramach kapitału docelowego?',
    options: {
      a: 'Podwyższenie ze środków własnych spółki',
      b: 'Upoważnienie zarządu przez statut do podwyższania kapitału zakładowego przez okres nie dłuższy niż 3 lata',
      c: 'Podwyższenie warunkowe',
      d: 'Emisja obligacji zamiennych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Upoważnienie zarządu przez statut do podwyższania kapitału zakładowego przez okres nie dłuższy niż 3 lata. Źródło: Art. 444 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-160',
    article: 'Art. 444 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaki jest maksymalny limit kapitału docelowego?',
    options: {
      a: '1/2 kapitału zakładowego z dnia udzielenia upoważnienia',
      b: '3/4 kapitału zakładowego z dnia udzielenia upoważnienia',
      c: 'Równy kapitałowi zakładowemu z dnia udzielenia upoważnienia',
      d: 'Brak limitu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 3/4 kapitału zakładowego z dnia udzielenia upoważnienia. Źródło: Art. 444 § 3 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-161',
    article: 'Art. 448 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest warunkowe podwyższenie kapitału zakładowego?',
    options: {
      a: 'Podwyższenie zależne od decyzji zarządu',
      b: 'Podwyższenie w celu przyznania praw do objęcia akcji posiadaczom obligacji zamiennych lub z prawem pierwszeństwa, warrantów lub osób uprawnionych do udziału w zyskach',
      c: 'Podwyższenie ze środków własnych',
      d: 'Podwyższenie w ramach kapitału docelowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Podwyższenie w celu przyznania praw do objęcia akcji posiadaczom obligacji zamiennych lub z prawem pierwszeństwa, warrantów lub osób uprawnionych do udziału w zyskach. Źródło: Art. 448 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-162',
    article: 'Art. 448 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaki jest maksymalny limit warunkowego podwyższenia kapitału?',
    options: {
      a: '1/3 kapitału zakładowego',
      b: '1/2 kapitału zakładowego',
      c: 'Dwukrotność kapitału zakładowego',
      d: 'Brak limitu'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Dwukrotność kapitału zakładowego. Źródło: Art. 448 § 3 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-163',
    article: 'Art. 19 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Co to są obligacje zamienne na akcje?',
    options: {
      a: 'Obligacje z opcją call',
      b: 'Obligacje uprawniające do zamiany na akcje emitenta',
      c: 'Obligacje zerokuponowe',
      d: 'Obligacje indeksowane'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Obligacje uprawniające do zamiany na akcje emitenta. Źródło: Art. 19 Ustawy o obligacjach',
    difficulty: 'hard',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-164',
    article: 'Art. 20 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Co to są obligacje z prawem pierwszeństwa?',
    options: {
      a: 'Obligacje dające prawo do wcześniejszego wykupu',
      b: 'Obligacje uprawniające do objęcia akcji z pierwszeństwem przed akcjonariuszami',
      c: 'Obligacje gwarantowane przez Skarb Państwa',
      d: 'Obligacje partycypacyjne'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Obligacje uprawniające do objęcia akcji z pierwszeństwem przed akcjonariuszami. Źródło: Art. 20 Ustawy o obligacjach',
    difficulty: 'hard',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-165',
    article: 'Art. 18 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Co to są obligacje partycypacyjne?',
    options: {
      a: 'Obligacje z prawem głosu',
      b: 'Obligacje uprawniające do udziału w zysku emitenta',
      c: 'Obligacje zamienne',
      d: 'Obligacje z prawem pierwszeństwa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Obligacje uprawniające do udziału w zysku emitenta. Źródło: Art. 18 Ustawy o obligacjach',
    difficulty: 'hard',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-166',
    article: 'Art. 2 Ustawy o obligacjach',
    articleTitle: 'Ustawa o obligacjach',
    section: 'Ustawy',
    subsection: 'Ustawa o obligacjach',
    question: 'Kto może emitować obligacje?',
    options: {
      a: 'Tylko spółki akcyjne',
      b: 'Podmioty wymienione w ustawie o obligacjach, w tym osoby prawne, spółki komandytowo-akcyjne, spółki celowe',
      c: 'Tylko jednostki samorządu terytorialnego',
      d: 'Tylko Skarb Państwa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Podmioty wymienione w ustawie o obligacjach, w tym osoby prawne, spółki komandytowo-akcyjne, spółki celowe. Źródło: Art. 2 Ustawy o obligacjach',
    difficulty: 'hard',
    tags: ["obligacje", "zgromadzenie obligatariuszy"]
  },

  {
    id: 'aso-167',
    article: 'Art. 11 ust. 1 Prawa upadłościowego',
    articleTitle: 'Prawo upadłościowe',
    section: 'Ustawy',
    subsection: 'Prawo upadłościowe',
    question: 'Kiedy dłużnik jest niewypłacalny według prawa upadłościowego?',
    options: {
      a: 'Gdy ma jakiekolwiek zobowiązania przeterminowane',
      b: 'Gdy utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych (domniemanie po 3 miesiącach opóźnienia)',
      c: 'Gdy ma ujemny kapitał własny',
      d: 'Gdy ma straty przez 2 lata z rzędu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy utracił zdolność do wykonywania swoich wymagalnych zobowiązań pieniężnych (domniemanie po 3 miesiącach opóźnienia). Źródło: Art. 11 ust. 1 Prawa upadłościowego',
    difficulty: 'hard',
    tags: ["upadłość", "niewypłacalność"]
  },

  {
    id: 'aso-168',
    article: 'Art. 21 ust. 1 Prawa upadłościowego',
    articleTitle: 'Prawo upadłościowe',
    section: 'Ustawy',
    subsection: 'Prawo upadłościowe',
    question: 'W jakim terminie należy złożyć wniosek o ogłoszenie upadłości?',
    options: {
      a: 'Niezwłocznie, nie później niż 14 dni',
      b: 'Niezwłocznie, nie później niż 30 dni od dnia powstania niewypłacalności',
      c: 'W terminie 60 dni',
      d: 'W terminie 90 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie, nie później niż 30 dni od dnia powstania niewypłacalności. Źródło: Art. 21 ust. 1 Prawa upadłościowego',
    difficulty: 'hard',
    tags: ["upadłość", "niewypłacalność"]
  },

  {
    id: 'aso-169',
    article: 'Art. 21 ust. 3 Prawa upadłościowego',
    articleTitle: 'Prawo upadłościowe',
    section: 'Ustawy',
    subsection: 'Prawo upadłościowe',
    question: 'Kto odpowiada za niezłożenie wniosku o upadłość w terminie?',
    options: {
      a: 'Tylko spółka',
      b: 'Członkowie zarządu solidarnie ze spółką za szkodę wyrządzoną wskutek niezłożenia wniosku',
      c: 'Tylko akcjonariusze',
      d: 'Tylko rada nadzorcza'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Członkowie zarządu solidarnie ze spółką za szkodę wyrządzoną wskutek niezłożenia wniosku. Źródło: Art. 21 ust. 3 Prawa upadłościowego',
    difficulty: 'hard',
    tags: ["upadłość", "niewypłacalność"]
  },

  {
    id: 'aso-170',
    article: 'Art. 3 ust. 1 pkt 10 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Co to jest dzień bilansowy?',
    options: {
      a: 'Dzień sporządzenia bilansu',
      b: 'Dzień, na który jednostka sporządza sprawozdanie finansowe',
      c: 'Ostatni dzień roku kalendarzowego',
      d: 'Dzień zatwierdzenia sprawozdania'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dzień, na który jednostka sporządza sprawozdanie finansowe. Źródło: Art. 3 ust. 1 pkt 10 Ustawy o rachunkowości',
    difficulty: 'hard',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-171',
    article: 'Art. 3 ust. 1 pkt 9 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Ile wynosi rok obrotowy?',
    options: {
      a: 'Zawsze rok kalendarzowy',
      b: 'Rok kalendarzowy lub inny okres trwający 12 kolejnych pełnych miesięcy kalendarzowych',
      c: 'Dowolny okres wybrany przez jednostkę',
      d: 'Maksymalnie 18 miesięcy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Rok kalendarzowy lub inny okres trwający 12 kolejnych pełnych miesięcy kalendarzowych. Źródło: Art. 3 ust. 1 pkt 9 Ustawy o rachunkowości',
    difficulty: 'hard',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-172',
    article: 'Art. 45 ust. 2 i 3 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'Co zawiera pełne sprawozdanie finansowe jednostki podlegającej badaniu?',
    options: {
      a: 'Tylko bilans',
      b: 'Bilans, rachunek zysków i strat',
      c: 'Bilans, rachunek zysków i strat, informację dodatkową, zestawienie zmian w kapitale własnym, rachunek przepływów pieniężnych',
      d: 'Tylko bilans i rachunek zysków i strat'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Bilans, rachunek zysków i strat, informację dodatkową, zestawienie zmian w kapitale własnym, rachunek przepływów pieniężnych. Źródło: Art. 45 ust. 2 i 3 Ustawy o rachunkowości',
    difficulty: 'hard',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-173',
    article: 'Art. 52 ust. 1 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'W jakim terminie należy sporządzić roczne sprawozdanie finansowe?',
    options: {
      a: 'W ciągu 30 dni od dnia bilansowego',
      b: 'W ciągu 3 miesięcy od dnia bilansowego',
      c: 'W ciągu 6 miesięcy od dnia bilansowego',
      d: 'W ciągu 12 miesięcy od dnia bilansowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W ciągu 3 miesięcy od dnia bilansowego. Źródło: Art. 52 ust. 1 Ustawy o rachunkowości',
    difficulty: 'hard',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-174',
    article: 'Art. 53 ust. 1 Ustawy o rachunkowości',
    articleTitle: 'Ustawa o rachunkowości',
    section: 'Ustawy',
    subsection: 'Ustawa o rachunkowości',
    question: 'W jakim terminie należy zatwierdzić roczne sprawozdanie finansowe?',
    options: {
      a: 'W ciągu 3 miesięcy od dnia bilansowego',
      b: 'W ciągu 6 miesięcy od dnia bilansowego',
      c: 'W ciągu 9 miesięcy od dnia bilansowego',
      d: 'W ciągu 12 miesięcy od dnia bilansowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: W ciągu 6 miesięcy od dnia bilansowego. Źródło: Art. 53 ust. 1 Ustawy o rachunkowości',
    difficulty: 'hard',
    tags: ["rachunkowość", "sprawozdania finansowe", "MSR"]
  },

  {
    id: 'aso-175',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest EBITDA?',
    options: {
      a: 'Zysk przed opodatkowaniem',
      b: 'Zysk operacyjny przed odsetkami, opodatkowaniem i amortyzacją',
      c: 'Zysk netto',
      d: 'Przychody ze sprzedaży'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zysk operacyjny przed odsetkami, opodatkowaniem i amortyzacją. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-176',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik ROE (Return on Equity)?',
    options: {
      a: 'Zysk netto / Aktywa ogółem',
      b: 'Zysk netto / Kapitał własny',
      c: 'Zysk operacyjny / Kapitał własny',
      d: 'Przychody / Kapitał własny'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zysk netto / Kapitał własny. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-177',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik ROA (Return on Assets)?',
    options: {
      a: 'Zysk netto / Aktywa ogółem',
      b: 'Zysk netto / Kapitał własny',
      c: 'Zysk operacyjny / Aktywa trwałe',
      d: 'Przychody / Aktywa ogółem'
    },
    correct: 'a',
    explanation: 'Prawidłowa odpowiedź: Zysk netto / Aktywa ogółem. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-178',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik płynności bieżącej (Current Ratio)?',
    options: {
      a: 'Aktywa obrotowe / Zobowiązania krótkoterminowe',
      b: 'Aktywa płynne / Zobowiązania krótkoterminowe',
      c: 'Gotówka / Zobowiązania krótkoterminowe',
      d: 'Kapitał własny / Zobowiązania ogółem'
    },
    correct: 'a',
    explanation: 'Prawidłowa odpowiedź: Aktywa obrotowe / Zobowiązania krótkoterminowe. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-179',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik zadłużenia ogółem?',
    options: {
      a: 'Kapitał własny / Aktywa ogółem',
      b: 'Zobowiązania ogółem / Aktywa ogółem',
      c: 'Zobowiązania długoterminowe / Kapitał własny',
      d: 'Zobowiązania krótkoterminowe / Aktywa obrotowe'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zobowiązania ogółem / Aktywa ogółem. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-180',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest wskaźnik C/Z (P/E)?',
    options: {
      a: 'Cena akcji / Wartość księgowa na akcję',
      b: 'Cena akcji / Zysk na jedną akcję',
      c: 'Cena akcji / Przychód na akcję',
      d: 'Cena akcji / Dywidenda na akcję'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Cena akcji / Zysk na jedną akcję. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-181',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest wskaźnik EV/EBITDA?',
    options: {
      a: 'Kapitalizacja rynkowa / EBITDA',
      b: '(Kapitalizacja rynkowa + Dług netto) / EBITDA',
      c: 'Zysk netto / EBITDA',
      d: 'Przychody / EBITDA'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: (Kapitalizacja rynkowa + Dług netto) / EBITDA. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-182',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest dług netto?',
    options: {
      a: 'Wszystkie zobowiązania spółki',
      b: 'Zobowiązania finansowe pomniejszone o środki pieniężne i ich ekwiwalenty',
      c: 'Zobowiązania długoterminowe',
      d: 'Zobowiązania wobec banków'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zobowiązania finansowe pomniejszone o środki pieniężne i ich ekwiwalenty. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-183',
    article: 'Art. 341 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest Księga Akcyjna i kto ją prowadzi?',
    options: {
      a: 'Rejestr akcjonariuszy prowadzony przez spółkę',
      b: 'Rejestr akcji imiennych i świadectw tymczasowych prowadzony przez zarząd',
      c: 'Rejestr prowadzony przez KDPW',
      d: 'Rejestr prowadzony przez GPW'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Rejestr akcji imiennych i świadectw tymczasowych prowadzony przez zarząd. Źródło: Art. 341 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-184',
    article: 'Ustawa o obrocie instrumentami finansowymi',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co to jest KDPW?',
    options: {
      a: 'Komisja Nadzoru Papierów Wartościowych',
      b: 'Krajowy Depozyt Papierów Wartościowych - centralny depozyt instrumentów finansowych',
      c: 'Krajowa Dyrekcja Papierów Wartościowych',
      d: 'Kasa Depozytowa Papierów Wartościowych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Krajowy Depozyt Papierów Wartościowych - centralny depozyt instrumentów finansowych. Źródło: Ustawa o obrocie instrumentami finansowymi',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-185',
    article: 'Art. 5 Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co to jest dematerializacja papierów wartościowych?',
    options: {
      a: 'Zniszczenie dokumentów akcji',
      b: 'Pozbawienie papierów wartościowych formy dokumentu i zarejestrowanie w depozycie papierów wartościowych',
      c: 'Zamiana akcji na obligacje',
      d: 'Umorzenie papierów wartościowych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Pozbawienie papierów wartościowych formy dokumentu i zarejestrowanie w depozycie papierów wartościowych. Źródło: Art. 5 Ustawy o obrocie',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-186',
    article: 'Ustawa o obrocie instrumentami finansowymi',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Kto prowadzi ewidencję transakcji na rynku regulowanym i w ASO?',
    options: {
      a: 'Emitent',
      b: 'KDPW',
      c: 'KNF',
      d: 'GPW'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: KDPW. Źródło: Ustawa o obrocie instrumentami finansowymi',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-187',
    article: 'Art. 130 Ustawy o biegłych rewidentach',
    articleTitle: 'Ustawa o biegłych rewidentach',
    section: 'Ustawa o biegłych rewidentach',
    subsection: 'Przepisy ogólne',
    question: 'Jakie są uprawnienia komitetu audytu w spółce publicznej?',
    options: {
      a: 'Tylko wybór audytora',
      b: 'Monitorowanie sprawozdawczości finansowej, skuteczności systemów kontroli wewnętrznej, audytu wewnętrznego i zarządzania ryzykiem, niezależności firmy audytorskiej',
      c: 'Zarządzanie spółką',
      d: 'Zatwierdzanie sprawozdań finansowych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Monitorowanie sprawozdawczości finansowej, skuteczności systemów kontroli wewnętrznej, audytu wewnętrznego i zarządzania ryzykiem, niezależności firmy audytorskiej. Źródło: Art. 130 Ustawy o biegłych rewidentach',
    difficulty: 'hard',
    tags: ["ustawa o biegłych rewidentach"]
  },

  {
    id: 'aso-188',
    article: 'Art. 128 Ustawy o biegłych rewidentach',
    articleTitle: 'Ustawa o biegłych rewidentach',
    section: 'Ustawa o biegłych rewidentach',
    subsection: 'Przepisy ogólne',
    question: 'Kiedy spółka publiczna musi mieć komitet audytu?',
    options: {
      a: 'Zawsze',
      b: 'Gdy jest jednostką zainteresowania publicznego',
      c: 'Gdy ma ponad 500 pracowników',
      d: 'Gdy jej kapitał przekracza 100 mln zł'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy jest jednostką zainteresowania publicznego. Źródło: Art. 128 Ustawy o biegłych rewidentach',
    difficulty: 'hard',
    tags: ["ustawa o biegłych rewidentach"]
  },

  {
    id: 'aso-189',
    article: 'Art. 129 ust. 1 Ustawy o biegłych rewidentach',
    articleTitle: 'Ustawa o biegłych rewidentach',
    section: 'Ustawa o biegłych rewidentach',
    subsection: 'Przepisy ogólne',
    question: 'Jaka część członków komitetu audytu musi być niezależna?',
    options: {
      a: 'Co najmniej jeden członek',
      b: 'Co najmniej większość składu, w tym przewodniczący',
      c: 'Wszyscy członkowie',
      d: 'Nie ma takiego wymogu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Co najmniej większość składu, w tym przewodniczący. Źródło: Art. 129 ust. 1 Ustawy o biegłych rewidentach',
    difficulty: 'hard',
    tags: ["ustawa o biegłych rewidentach"]
  },

  {
    id: 'aso-190',
    article: '§ 3 ust. 2 pkt 14) Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Co emitent musi opublikować w przypadku istotnych różnic między danymi szacunkowymi a ostatecznymi wynikami?',
    options: {
      a: 'Nic nie musi publikować',
      b: 'Raport bieżący z informacją o różnicach',
      c: 'Tylko korektę prognozy',
      d: 'Informację o różnicach przekraczających 25%'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Raport bieżący z informacją o różnicach. Źródło: § 3 ust. 2 pkt 14) Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-191',
    article: 'Uchwała Nr 646/2016 Zarządu GPW',
    articleTitle: 'Segmenty NewConnect',
    section: 'Organizacja obrotu',
    subsection: 'Segmenty rynku',
    question: 'Kiedy instrumenty notowane na NewConnect mogą zostać przeniesione do segmentu NC Alert?',
    options: {
      a: 'Na wniosek emitenta',
      b: 'W przypadku niespełniania kryteriów segmentu NC Base',
      c: 'Gdy emitent nie wykonuje obowiązków informacyjnych lub zachodzą wątpliwości co do jego działalności',
      d: 'Po 3 miesiącach notowań'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Gdy emitent nie wykonuje obowiązków informacyjnych lub zachodzą wątpliwości co do jego działalności. Źródło: Uchwała Nr 646/2016 Zarządu GPW',
    difficulty: 'hard',
    tags: ["segmenty", "NC Focus", "NC Base"]
  },

  {
    id: 'aso-192',
    article: 'Uchwała Nr 646/2016 Zarządu GPW',
    articleTitle: 'Segmenty NewConnect',
    section: 'Organizacja obrotu',
    subsection: 'Segmenty rynku',
    question: 'Co się dzieje z instrumentami po przeniesieniu do segmentu NC Alert?',
    options: {
      a: 'Instrumenty są wykluczane z obrotu',
      b: 'Zmienia się system notowań na kurs jednolity z dwukrotnym określaniem kursu',
      c: 'Nic się nie zmienia',
      d: 'Zawieszany jest obrót na 30 dni'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zmienia się system notowań na kurs jednolity z dwukrotnym określaniem kursu. Źródło: Uchwała Nr 646/2016 Zarządu GPW',
    difficulty: 'hard',
    tags: ["segmenty", "NC Focus", "NC Base"]
  },

  {
    id: 'aso-193',
    article: '§ 3 ust. 1 pkt 6) lit. a) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaka jest minimalna liczba akcjonariuszy przy wprowadzeniu akcji do ASO po raz pierwszy?',
    options: {
      a: '15 akcjonariuszy',
      b: '25 akcjonariuszy',
      c: '50 akcjonariuszy',
      d: '100 akcjonariuszy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 25 akcjonariuszy. Źródło: § 3 ust. 1 pkt 6) lit. a) Regulaminu ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-194',
    article: '§ 3 ust. 1 pkt 6) lit. c) Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Ile procent kapitału zakładowego musi obejmować wniosek o wprowadzenie akcji po raz pierwszy?',
    options: {
      a: '5%',
      b: '10%',
      c: '15%',
      d: '25%'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 15%. Źródło: § 3 ust. 1 pkt 6) lit. c) Regulaminu ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-195',
    article: 'pkt 31 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Do kiedy Autoryzowany Doradca musi złożyć roczne sprawozdanie z działalności?',
    options: {
      a: 'Do 31 stycznia każdego roku',
      b: 'Do 15 stycznia każdego roku',
      c: 'Do 31 marca każdego roku',
      d: 'Do 30 kwietnia każdego roku'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Do 15 stycznia każdego roku. Źródło: pkt 31 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-196',
    article: 'pkt 34a Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Kiedy dochodzi do zawieszenia uprawnień Autoryzowanego Doradcy?',
    options: {
      a: 'Na wniosek emitenta',
      b: 'Gdy AD zatrudnia mniej niż 2 osoby z Certyfikatem przez okres dłuższy niż 1 miesiąc',
      c: 'Gdy AD zatrudnia mniej niż 5 osób',
      d: 'Nigdy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy AD zatrudnia mniej niż 2 osoby z Certyfikatem przez okres dłuższy niż 1 miesiąc. Źródło: pkt 34a Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-197',
    article: 'pkt 29a Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Co Autoryzowany Doradca musi zrobić w przypadku naruszenia przez emitenta przepisów obowiązujących w ASO?',
    options: {
      a: 'Nic',
      b: 'Natychmiast rozwiązać umowę',
      c: 'Niezwłocznie zawiadomić Organizatora ASO',
      d: 'Zapłacić karę za emitenta'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Niezwłocznie zawiadomić Organizatora ASO. Źródło: pkt 29a Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-198',
    article: 'pkt 33 Załącznika Nr 5 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 5',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 5 - Autoryzowany Doradca',
    question: 'Jaka jest maksymalna kara pieniężna dla Autoryzowanego Doradcy?',
    options: {
      a: '10.000 zł',
      b: '25.000 zł',
      c: '50.000 zł',
      d: '100.000 zł'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 50.000 zł. Źródło: pkt 33 Załącznika Nr 5 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["autoryzowany doradca", "AD", "obowiązki AD"]
  },

  {
    id: 'aso-199',
    article: '§ 4a Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'W jakim przypadku emitent musi aktualizować dokument informacyjny?',
    options: {
      a: 'Co roku',
      b: 'Gdy wystąpią istotne zmiany w sytuacji emitenta lub pojawiły się istotne nowe informacje przed wprowadzeniem',
      c: 'Nigdy, dokument informacyjny jest ostateczny',
      d: 'Tylko na żądanie KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy wystąpią istotne zmiany w sytuacji emitenta lub pojawiły się istotne nowe informacje przed wprowadzeniem. Źródło: § 4a Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-200',
    article: '§ 11 ust. 3 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaki jest maksymalny termin zawieszenia obrotu instrumentami finansowymi w ASO?',
    options: {
      a: '1 miesiąc',
      b: '3 miesiące',
      c: '6 miesięcy',
      d: '12 miesięcy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 3 miesiące. Źródło: § 11 ust. 3 Regulaminu ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-201',
    article: 'Art. 453 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest warranty subskrypcyjny?',
    options: {
      a: 'Obligacja zamienna',
      b: 'Papier wartościowy uprawniający posiadacza do zapisu lub objęcia akcji z wyłączeniem prawa poboru',
      c: 'Prawo poboru',
      d: 'Prawo do akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Papier wartościowy uprawniający posiadacza do zapisu lub objęcia akcji z wyłączeniem prawa poboru. Źródło: Art. 453 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-202',
    article: 'Art. 453 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kto może emitować warranty subskrypcyjne?',
    options: {
      a: 'Tylko spółki notowane na GPW',
      b: 'Spółka akcyjna w celu warunkowego podwyższenia kapitału lub w ramach kapitału docelowego',
      c: 'Każda spółka kapitałowa',
      d: 'Tylko fundusze inwestycyjne'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Spółka akcyjna w celu warunkowego podwyższenia kapitału lub w ramach kapitału docelowego. Źródło: Art. 453 § 3 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-203',
    article: 'Art. 442 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co to jest podwyższenie kapitału ze środków własnych spółki?',
    options: {
      a: 'Podwyższenie przez emisję nowych akcji za gotówkę',
      b: 'Podwyższenie przez przekształcenie kapitałów rezerwowych utworzonych z zysku na kapitał zakładowy (akcje gratisowe)',
      c: 'Podwyższenie warunkowe',
      d: 'Kapitał docelowy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Podwyższenie przez przekształcenie kapitałów rezerwowych utworzonych z zysku na kapitał zakładowy (akcje gratisowe). Źródło: Art. 442 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-204',
    article: 'Art. 506 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka większość jest wymagana do podjęcia uchwały o połączeniu spółek?',
    options: {
      a: 'Zwykła większość głosów',
      b: 'Bezwzględna większość głosów',
      c: 'Większość 2/3 głosów',
      d: 'Większość 3/4 głosów'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Większość 3/4 głosów. Źródło: Art. 506 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-205',
    article: 'Art. 541 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka większość jest wymagana do podjęcia uchwały o podziale spółki?',
    options: {
      a: 'Zwykła większość głosów',
      b: 'Bezwzględna większość głosów',
      c: 'Większość 2/3 głosów',
      d: 'Większość 3/4 głosów'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Większość 3/4 głosów. Źródło: Art. 541 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-206',
    article: 'Art. 562 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka większość jest wymagana do podjęcia uchwały o przekształceniu spółki?',
    options: {
      a: 'Zwykła większość głosów',
      b: 'Bezwzględna większość głosów',
      c: 'Większość 2/3 głosów',
      d: 'Większość 3/4 głosów'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Większość 2/3 głosów. Źródło: Art. 562 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-207',
    article: 'Art. 313 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co zawiera akt zawiązania spółki akcyjnej?',
    options: {
      a: 'Tylko statut',
      b: 'Statut, oświadczenia o objęciu akcji przez wszystkich założycieli',
      c: 'Tylko umowę spółki',
      d: 'Tylko listę założycieli'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Statut, oświadczenia o objęciu akcji przez wszystkich założycieli. Źródło: Art. 313 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-208',
    article: 'Art. 304 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Co musi określać statut spółki akcyjnej?',
    options: {
      a: 'Firmę i siedzibę spółki',
      b: 'Przedmiot działalności, wysokość kapitału zakładowego',
      c: 'Wartość nominalną akcji i ich liczbę',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 304 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-209',
    article: 'Art. 308 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka jest minimalna wartość nominalna jednej akcji?',
    options: {
      a: '1 grosz (0,01 zł)',
      b: '10 groszy (0,10 zł)',
      c: '1 złoty',
      d: '10 złotych'
    },
    correct: 'a',
    explanation: 'Prawidłowa odpowiedź: 1 grosz (0,01 zł). Źródło: Art. 308 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-210',
    article: 'Art. 302 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy spółka może wydawać akcje o różnej wartości nominalnej?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, wszystkie akcje w danej spółce muszą mieć równą wartość nominalną',
      c: 'Tak, ale tylko akcje uprzywilejowane',
      d: 'Tak, za zgodą KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, wszystkie akcje w danej spółce muszą mieć równą wartość nominalną. Źródło: Art. 302 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-211',
    article: 'Art. 351-354 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jakie są rodzaje akcji pod względem uprzywilejowania?',
    options: {
      a: 'Tylko akcje zwykłe',
      b: 'Akcje zwykłe i uprzywilejowane',
      c: 'Akcje imienne i na okaziciela',
      d: 'Akcje aportowe i gotówkowe'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Akcje zwykłe i uprzywilejowane. Źródło: Art. 351-354 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-212',
    article: 'Art. 351 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jakiego rodzaju uprzywilejowanie mogą mieć akcje?',
    options: {
      a: 'Co do głosu',
      b: 'Co do dywidendy',
      c: 'Co do udziału w podziale majątku w przypadku likwidacji',
      d: 'Wszystkie powyższe odpowiedzi są prawidłowe'
    },
    correct: 'd',
    explanation: 'Prawidłowa odpowiedź: Wszystkie powyższe odpowiedzi są prawidłowe. Źródło: Art. 351 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-213',
    article: 'Art. 353 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaka jest maksymalna wysokość uprzywilejowania dywidendowego?',
    options: {
      a: 'Dywidenda nie wyższa niż o połowę od dywidendy zwykłej',
      b: 'Dywidenda nie wyższa niż o 100% od dywidendy zwykłej',
      c: 'Brak limitu',
      d: 'Dywidenda nie wyższa niż dwukrotność dywidendy zwykłej'
    },
    correct: 'a',
    explanation: 'Prawidłowa odpowiedź: Dywidenda nie wyższa niż o połowę od dywidendy zwykłej. Źródło: Art. 353 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-214',
    article: 'Art. 351 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy akcje uprzywilejowane co do głosu mogą być przedmiotem obrotu na rynku regulowanym?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, akcje takie nie mogą być dopuszczone do obrotu na rynku regulowanym',
      c: 'Tak, za zgodą KNF',
      d: 'Tak, ale tylko na NewConnect'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, akcje takie nie mogą być dopuszczone do obrotu na rynku regulowanym. Źródło: Art. 351 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-215',
    article: 'Art. 351 § 3 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Kiedy wygasa uprzywilejowanie akcji co do głosu?',
    options: {
      a: 'W momencie ich zbycia',
      b: 'Z chwilą zamiany na akcje na okaziciela lub zbycia wbrew statutowemu ograniczeniu',
      c: 'Po 5 latach',
      d: 'Nigdy nie wygasa'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Z chwilą zamiany na akcje na okaziciela lub zbycia wbrew statutowemu ograniczeniu. Źródło: Art. 351 § 3 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-216',
    article: 'Art. 359 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy akcje mogą być umorzone?',
    options: {
      a: 'Nie',
      b: 'Tak, tylko za zgodą akcjonariusza (umorzenie dobrowolne)',
      c: 'Tak, dobrowolnie lub przymusowo na podstawie statutu',
      d: 'Tak, ale tylko akcje własne spółki'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: Tak, dobrowolnie lub przymusowo na podstawie statutu. Źródło: Art. 359 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-217',
    article: 'Art. 360 § 2 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy umorzenie akcji wymaga obniżenia kapitału zakładowego?',
    options: {
      a: 'Zawsze',
      b: 'Nie, jeżeli następuje z czystego zysku (umorzenie automatyczne)',
      c: 'Nigdy',
      d: 'Tylko przy umorzeniu przymusowym'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, jeżeli następuje z czystego zysku (umorzenie automatyczne). Źródło: Art. 360 § 2 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-218',
    article: 'KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'W jakich przypadkach może dojść do wyłączenia akcjonariusza ze spółki akcyjnej?',
    options: {
      a: 'W każdym przypadku większością głosów WZA',
      b: 'Nie ma takiej możliwości w spółce akcyjnej',
      c: 'Tylko za zgodą KNF',
      d: 'Tylko w przypadku squeeze-out'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie ma takiej możliwości w spółce akcyjnej. Źródło: KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-219',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest zysk na jedną akcję (EPS)?',
    options: {
      a: 'Cena akcji / Liczba akcji',
      b: 'Zysk netto / Średnia ważona liczba akcji zwykłych w okresie',
      c: 'Przychody / Liczba akcji',
      d: 'Dywidenda / Liczba akcji'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zysk netto / Średnia ważona liczba akcji zwykłych w okresie. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-220',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest wskaźnik DPS (Dividend Per Share)?',
    options: {
      a: 'Zysk na akcję',
      b: 'Dywidenda przypadająca na jedną akcję',
      c: 'Cena do zysku',
      d: 'Wartość księgowa na akcję'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dywidenda przypadająca na jedną akcję. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-221',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Jak obliczyć wskaźnik wypłaty dywidendy (payout ratio)?',
    options: {
      a: 'Dywidenda / Cena akcji',
      b: 'Dywidenda / Zysk netto',
      c: 'Zysk netto / Dywidenda',
      d: 'Dywidenda / Kapitał własny'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dywidenda / Zysk netto. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-222',
    article: 'Analiza finansowa',
    articleTitle: 'Wskaźniki finansowe',
    section: 'Analiza finansowa',
    subsection: 'Wskaźniki finansowe',
    question: 'Co to jest wskaźnik płynności szybkiej (Quick Ratio)?',
    options: {
      a: 'Aktywa obrotowe / Zobowiązania krótkoterminowe',
      b: '(Aktywa obrotowe - Zapasy) / Zobowiązania krótkoterminowe',
      c: 'Gotówka / Zobowiązania krótkoterminowe',
      d: 'Należności / Zobowiązania'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: (Aktywa obrotowe - Zapasy) / Zobowiązania krótkoterminowe. Źródło: Analiza finansowa',
    difficulty: 'hard',
    tags: ["wskaźniki", "analiza finansowa", "P/E", "ROE"]
  },

  {
    id: 'aso-223',
    article: 'Art. 348 § 4 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Jaki jest termin przedawnienia roszczeń z tytułu dywidendy?',
    options: {
      a: '3 lata',
      b: '5 lat',
      c: '10 lat',
      d: 'Nie przedawniają się'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 5 lat. Źródło: Art. 348 § 4 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-224',
    article: 'Art. 387 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy członek zarządu może być jednocześnie członkiem rady nadzorczej tej samej spółki?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, mandaty te są niepołączalne',
      c: 'Tak, za zgodą WZA',
      d: 'Tak, ale tylko prezes zarządu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, mandaty te są niepołączalne. Źródło: Art. 387 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-225',
    article: 'Art. 387 § 1 KSH',
    articleTitle: 'KSH',
    section: 'Ustawy',
    subsection: 'Kodeks spółek handlowych',
    question: 'Czy prokurent może być jednocześnie członkiem rady nadzorczej tej samej spółki?',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, mandaty te są niepołączalne',
      c: 'Tak, za zgodą zarządu',
      d: 'Tak, ale tylko w spółkach publicznych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Nie, mandaty te są niepołączalne. Źródło: Art. 387 § 1 KSH',
    difficulty: 'hard',
    tags: ["KSH", "spółka akcyjna", "WZA"]
  },

  {
    id: 'aso-226',
    article: '§ 3 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Co emitent musi raportować w raporcie bieżącym o zawarciu znaczącej umowy?',
    options: {
      a: 'Tylko wartość umowy',
      b: 'Datę, strony, przedmiot, istotne warunki, wartość',
      c: 'Tylko strony umowy',
      d: 'Tylko przedmiot umowy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Datę, strony, przedmiot, istotne warunki, wartość. Źródło: § 3 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-227',
    article: '§ 3 ust. 2 pkt 2) Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Kiedy umowa jest znacząca dla emitenta w ASO?',
    options: {
      a: 'Gdy jej wartość przekracza 50.000 zł',
      b: 'Gdy jej wartość jest istotna w skali działalności emitenta',
      c: 'Zawsze, niezależnie od wartości',
      d: 'Tylko umowy powyżej 1 mln zł'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Gdy jej wartość jest istotna w skali działalności emitenta. Źródło: § 3 ust. 2 pkt 2) Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-228',
    article: '§ 9 Załącznika Nr 1 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 1',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 1 - Dokument informacyjny',
    question: 'Co emitent musi zamieścić w dokumencie informacyjnym o osobach zarządzających?',
    options: {
      a: 'Tylko imię i nazwisko',
      b: 'Imię i nazwisko, funkcję, opis kwalifikacji i doświadczenia zawodowego',
      c: 'Tylko stanowisko',
      d: 'Tylko wynagrodzenie'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Imię i nazwisko, funkcję, opis kwalifikacji i doświadczenia zawodowego. Źródło: § 9 Załącznika Nr 1 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["dokument informacyjny", "wprowadzenie do obrotu"]
  },

  {
    id: 'aso-229',
    article: 'Regulamin obrotu ASO',
    articleTitle: 'Regulamin obrotu',
    section: 'Regulamin obrotu',
    subsection: 'Przepisy ogólne',
    question: 'Co to jest notowanie pakietowe na NewConnect?',
    options: {
      a: 'Obrót akcjami w pakietach po 100 sztuk',
      b: 'System obrotu przeznaczony dla dużych transakcji zawieranych poza arkuszem zleceń',
      c: 'Notowanie w systemie ciągłym',
      d: 'Notowanie na rynku kasowym'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: System obrotu przeznaczony dla dużych transakcji zawieranych poza arkuszem zleceń. Źródło: Regulamin obrotu ASO',
    difficulty: 'hard',
    tags: ["regulamin obrotu"]
  },

  {
    id: 'aso-230',
    article: 'Art. 7a Ustawy o obrocie',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Kto to jest Agent Emisji?',
    options: {
      a: 'Emitent',
      b: 'Firma inwestycyjna lub bank pośredniczący w rejestracji papierów wartościowych w KDPW',
      c: 'GPW',
      d: 'KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Firma inwestycyjna lub bank pośredniczący w rejestracji papierów wartościowych w KDPW. Źródło: Art. 7a Ustawy o obrocie',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-231',
    article: 'Ustawa o obrocie instrumentami finansowymi',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co to jest kod ISIN?',
    options: {
      a: 'Numer identyfikacyjny emitenta',
      b: 'Międzynarodowy numer identyfikacyjny papierów wartościowych',
      c: 'Numer rachunku inwestora',
      d: 'Numer konta depozytowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Międzynarodowy numer identyfikacyjny papierów wartościowych. Źródło: Ustawa o obrocie instrumentami finansowymi',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-232',
    article: '§ 6a Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Co to jest kod LEI?',
    options: {
      a: 'Numer identyfikacyjny papierów wartościowych',
      b: 'Globalny identyfikator podmiotu prawnego (Legal Entity Identifier)',
      c: 'Numer rachunku emitenta',
      d: 'Kod giełdowy'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Globalny identyfikator podmiotu prawnego (Legal Entity Identifier). Źródło: § 6a Regulaminu ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-233',
    article: 'Regulamin ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jaki jest termin ważności kodu LEI?',
    options: {
      a: '6 miesięcy',
      b: '12 miesięcy (wymaga corocznego odnowienia)',
      c: '24 miesiące',
      d: 'Bezterminowo'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 12 miesięcy (wymaga corocznego odnowienia). Źródło: Regulamin ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-234',
    article: '§ 6a ust. 3 Regulaminu ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Jakie są konsekwencje nieposiadania ważnego kodu LEI przez emitenta?',
    options: {
      a: 'Brak konsekwencji',
      b: 'Możliwość zawieszenia obrotu instrumentami emitenta',
      c: 'Automatyczne wykluczenie z obrotu',
      d: 'Tylko kara pieniężna'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Możliwość zawieszenia obrotu instrumentami emitenta. Źródło: § 6a ust. 3 Regulaminu ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-235',
    article: 'Tabela opłat ASO',
    articleTitle: 'Regulamin ASO',
    section: 'Regulamin ASO',
    subsection: 'Przepisy ogólne',
    question: 'Ile wynosi opłata za wprowadzenie instrumentów do ASO (akcji) na NewConnect?',
    options: {
      a: 'Stała opłata 3.000 zł',
      b: 'Opłata zależna od wartości emisji',
      c: 'Brak opłaty',
      d: 'Opłata 10.000 zł'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Opłata zależna od wartości emisji. Źródło: Tabela opłat ASO',
    difficulty: 'hard',
    tags: ["regulamin ASO", "NewConnect", "Catalyst"]
  },

  {
    id: 'aso-236',
    article: 'Dobre Praktyki Spółek Notowanych na NewConnect',
    articleTitle: 'Dobre praktyki',
    section: 'Dobre praktyki',
    subsection: 'Przepisy ogólne',
    question: 'Co to są Dobre Praktyki Spółek Notowanych na NewConnect?',
    options: {
      a: 'Obowiązkowe przepisy prawa',
      b: 'Zbiór rekomendacji dotyczących ładu korporacyjnego stosowany na zasadzie "stosuj lub wyjaśnij"',
      c: 'Regulamin ASO',
      d: 'Wytyczne KNF'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Zbiór rekomendacji dotyczących ładu korporacyjnego stosowany na zasadzie "stosuj lub wyjaśnij". Źródło: Dobre Praktyki Spółek Notowanych na NewConnect',
    difficulty: 'hard',
    tags: ["dobre praktyki"]
  },

  {
    id: 'aso-237',
    article: 'Dobre Praktyki Spółek Notowanych na NewConnect',
    articleTitle: 'Dobre praktyki',
    section: 'Dobre praktyki',
    subsection: 'Przepisy ogólne',
    question: 'Czy emitent na NewConnect musi stosować Dobre Praktyki?',
    options: {
      a: 'Tak, bezwzględnie',
      b: 'Stosuje zasadę "stosuj lub wyjaśnij" - może nie stosować, ale musi wyjaśnić dlaczego',
      c: 'Nie, są całkowicie dobrowolne',
      d: 'Tylko spółki w segmencie NC Focus'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Stosuje zasadę "stosuj lub wyjaśnij" - może nie stosować, ale musi wyjaśnić dlaczego. Źródło: Dobre Praktyki Spółek Notowanych na NewConnect',
    difficulty: 'hard',
    tags: ["dobre praktyki"]
  },

  {
    id: 'aso-238',
    article: 'Dobre Praktyki Spółek Notowanych na NewConnect',
    articleTitle: 'Dobre praktyki',
    section: 'Dobre praktyki',
    subsection: 'Przepisy ogólne',
    question: 'Co emitent powinien zamieścić na swojej stronie internetowej według Dobrych Praktyk?',
    options: {
      a: 'Tylko dane kontaktowe',
      b: 'Podstawowe dokumenty korporacyjne, informacje dla inwestorów, aktualności',
      c: 'Tylko sprawozdania finansowe',
      d: 'Tylko raporty bieżące'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Podstawowe dokumenty korporacyjne, informacje dla inwestorów, aktualności. Źródło: Dobre Praktyki Spółek Notowanych na NewConnect',
    difficulty: 'hard',
    tags: ["dobre praktyki"]
  },

  {
    id: 'aso-239',
    article: '§ 5 ust. 4a Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'Co to jest raport półroczny w ASO?',
    options: {
      a: 'Raport obowiązkowy dla wszystkich emitentów',
      b: 'Raport nieobowiązkowy - emitenci mogą przekazywać raport za I półrocze zamiast raportu kwartalnego za II kwartał',
      c: 'Raport wymagany tylko dla emitentów obligacji',
      d: 'Raport wymagany tylko dla segmentu NC Focus'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Raport nieobowiązkowy - emitenci mogą przekazywać raport za I półrocze zamiast raportu kwartalnego za II kwartał. Źródło: § 5 ust. 4a Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-240',
    article: '§ 6 ust. 10 Załącznika Nr 3 do Regulaminu ASO',
    articleTitle: 'Załącznik Nr 3',
    section: 'Regulamin ASO',
    subsection: 'Załącznik Nr 3 - Obowiązki informacyjne',
    question: 'W jakim terminie należy przekazać raport półroczny?',
    options: {
      a: '30 dni od zakończenia półrocza',
      b: '45 dni od zakończenia półrocza',
      c: '60 dni od zakończenia półrocza',
      d: '3 miesiące od zakończenia półrocza'
    },
    correct: 'c',
    explanation: 'Prawidłowa odpowiedź: 60 dni od zakończenia półrocza. Źródło: § 6 ust. 10 Załącznika Nr 3 do Regulaminu ASO',
    difficulty: 'hard',
    tags: ["obowiązki informacyjne", "raporty", "EBI"]
  },

  {
    id: 'aso-241',
    article: 'Rozporządzenie o krótkiej sprzedaży',
    articleTitle: 'Ustawa o obrocie',
    section: 'Ustawy',
    subsection: 'Ustawa o obrocie instrumentami finansowymi',
    question: 'Co to jest short selling (krótka sprzedaż)?',
    options: {
      a: 'Sprzedaż akcji po niskiej cenie',
      b: 'Sprzedaż pożyczonych papierów wartościowych z zamiarem odkupu po niższej cenie',
      c: 'Szybka sprzedaż akcji',
      d: 'Sprzedaż akcji własnych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Sprzedaż pożyczonych papierów wartościowych z zamiarem odkupu po niższej cenie. Źródło: Rozporządzenie o krótkiej sprzedaży',
    difficulty: 'hard',
    tags: ["ustawa o obrocie", "instrumenty finansowe"]
  },

  {
    id: 'aso-242',
    article: 'Rozporządzenie (UE) Nr 236/2012',
    articleTitle: 'Rozporządzenie o krótkiej sprzedaży',
    section: 'Rozporządzenie o krótkiej sprzedaży',
    subsection: 'Przepisy ogólne',
    question: 'Czym jest pozycja krótka netto?',
    options: {
      a: 'Pozycja długa pomniejszona o pozycję krótką',
      b: 'Pozycja krótka pomniejszona o pozycję długą',
      c: 'Suma wszystkich pozycji',
      d: 'Pozycja w instrumentach pochodnych'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Pozycja krótka pomniejszona o pozycję długą. Źródło: Rozporządzenie (UE) Nr 236/2012',
    difficulty: 'hard',
    tags: ["rozporządzenie o krótkiej sprzedaży"]
  },

  {
    id: 'aso-243',
    article: 'Art. 5 Rozporządzenia (UE) Nr 236/2012',
    articleTitle: 'Rozporządzenie o krótkiej sprzedaży',
    section: 'Rozporządzenie o krótkiej sprzedaży',
    subsection: 'Przepisy ogólne',
    question: 'Przy jakim progu pozycji krótkiej netto powstaje obowiązek notyfikacji organowi nadzoru?',
    options: {
      a: '0,1% wyemitowanego kapitału zakładowego',
      b: '0,2% wyemitowanego kapitału zakładowego',
      c: '0,5% wyemitowanego kapitału zakładowego',
      d: '1% wyemitowanego kapitału zakładowego'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: 0,2% wyemitowanego kapitału zakładowego. Źródło: Art. 5 Rozporządzenia (UE) Nr 236/2012',
    difficulty: 'hard',
    tags: ["rozporządzenie o krótkiej sprzedaży"]
  },

  {
    id: 'aso-244',
    article: 'Rozporządzenie EMIR',
    articleTitle: 'Regulacje rynku',
    section: 'Regulacje rynku',
    subsection: 'Przepisy ogólne',
    question: 'Co to jest rozporządzenie EMIR?',
    options: {
      a: 'Rozporządzenie o emisji papierów wartościowych',
      b: 'Rozporządzenie o infrastrukturze rynku instrumentów pochodnych OTC, kontrahentach centralnych i repozytoriach transakcji',
      c: 'Rozporządzenie o ochronie danych osobowych',
      d: 'Rozporządzenie o ofercie publicznej'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Rozporządzenie o infrastrukturze rynku instrumentów pochodnych OTC, kontrahentach centralnych i repozytoriach transakcji. Źródło: Rozporządzenie EMIR',
    difficulty: 'hard',
    tags: ["regulacje rynku"]
  },

  {
    id: 'aso-245',
    article: 'Dyrektywa 2014/65/UE',
    articleTitle: 'Regulacje rynku',
    section: 'Regulacje rynku',
    subsection: 'Przepisy ogólne',
    question: 'Co to jest dyrektywa MiFID II?',
    options: {
      a: 'Dyrektywa o ochronie konsumentów',
      b: 'Dyrektywa w sprawie rynków instrumentów finansowych',
      c: 'Dyrektywa o ofercie publicznej',
      d: 'Dyrektywa o nadużyciach na rynku'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Dyrektywa w sprawie rynków instrumentów finansowych. Źródło: Dyrektywa 2014/65/UE',
    difficulty: 'hard',
    tags: ["regulacje rynku"]
  },

  {
    id: 'aso-246',
    article: 'Rozporządzenie SFDR',
    articleTitle: 'Regulacje rynku',
    section: 'Regulacje rynku',
    subsection: 'Przepisy ogólne',
    question: 'Co reguluje rozporządzenie SFDR?',
    options: {
      a: 'Krótką sprzedaż',
      b: 'Ujawnianie informacji związanych ze zrównoważonym rozwojem w sektorze usług finansowych',
      c: 'Oferowanie papierów wartościowych',
      d: 'Nadużycia na rynku'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Ujawnianie informacji związanych ze zrównoważonym rozwojem w sektorze usług finansowych. Źródło: Rozporządzenie SFDR',
    difficulty: 'hard',
    tags: ["regulacje rynku"]
  },

  {
    id: 'aso-247',
    article: 'Taksonomia UE, SFDR',
    articleTitle: 'Regulacje rynku',
    section: 'Regulacje rynku',
    subsection: 'Przepisy ogólne',
    question: 'Co emitent musi ujawnić w zakresie ESG?',
    options: {
      a: 'Nic, raportowanie ESG jest dobrowolne',
      b: 'Informacje o kwestiach środowiskowych, społecznych i ładu korporacyjnego zgodnie z wymogami taksonomii UE i SFDR',
      c: 'Tylko informacje o emisji CO2',
      d: 'Tylko informacje o zatrudnieniu'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Informacje o kwestiach środowiskowych, społecznych i ładu korporacyjnego zgodnie z wymogami taksonomii UE i SFDR. Źródło: Taksonomia UE, SFDR',
    difficulty: 'hard',
    tags: ["regulacje rynku"]
  },

  {
    id: 'aso-248',
    article: 'Ustawa o ofercie publicznej',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Jakie są rodzaje oferty publicznej papierów wartościowych?',
    options: {
      a: 'Tylko pierwsza oferta publiczna (IPO)',
      b: 'Pierwsza oferta publiczna (IPO), wtórna oferta publiczna (SPO), oferta sprzedaży',
      c: 'Tylko oferta prywatna',
      d: 'Tylko subskrypcja zamknięta'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Pierwsza oferta publiczna (IPO), wtórna oferta publiczna (SPO), oferta sprzedaży. Źródło: Ustawa o ofercie publicznej',
    difficulty: 'hard',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-249',
    article: 'Ustawa o ofercie publicznej',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Co to jest IPO (Initial Public Offering)?',
    options: {
      a: 'Wtórna oferta publiczna',
      b: 'Pierwsza oferta publiczna - pierwsza oferta akcji spółki skierowana do szerokiego grona inwestorów',
      c: 'Oferta prywatna',
      d: 'Wykup lewarowany'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Pierwsza oferta publiczna - pierwsza oferta akcji spółki skierowana do szerokiego grona inwestorów. Źródło: Ustawa o ofercie publicznej',
    difficulty: 'hard',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  },

  {
    id: 'aso-250',
    article: 'Ustawa o ofercie publicznej',
    articleTitle: 'Ustawa o ofercie',
    section: 'Ustawy',
    subsection: 'Ustawa o ofercie publicznej',
    question: 'Co to jest SPO (Secondary Public Offering)?',
    options: {
      a: 'Pierwsza oferta publiczna',
      b: 'Wtórna oferta publiczna - kolejna oferta akcji spółki już notowanej publicznie',
      c: 'Oferta zamknięta',
      d: 'Przymusowy wykup'
    },
    correct: 'b',
    explanation: 'Prawidłowa odpowiedź: Wtórna oferta publiczna - kolejna oferta akcji spółki już notowanej publicznie. Źródło: Ustawa o ofercie publicznej',
    difficulty: 'hard',
    tags: ["ustawa o ofercie", "oferta publiczna", "progi głosów"]
  }
];

// Funkcje pomocnicze
export function getQuestionsBySection(section: string): ExamQuestion[] {
  return ASO_EXAM_QUESTIONS.filter(q => q.section === section);
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): ExamQuestion[] {
  return ASO_EXAM_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByTag(tag: string): ExamQuestion[] {
  return ASO_EXAM_QUESTIONS.filter(q => q.tags.includes(tag));
}

export function getRandomQuestions(count: number): ExamQuestion[] {
  const shuffled = [...ASO_EXAM_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getQuestionsByArticle(articlePrefix: string): ExamQuestion[] {
  return ASO_EXAM_QUESTIONS.filter(q => q.article.startsWith(articlePrefix));
}

// Statystyki bazy
export const DATABASE_STATS = {
  totalQuestions: ASO_EXAM_QUESTIONS.length,
  byDifficulty: {
    easy: ASO_EXAM_QUESTIONS.filter(q => q.difficulty === 'easy').length,
    medium: ASO_EXAM_QUESTIONS.filter(q => q.difficulty === 'medium').length,
    hard: ASO_EXAM_QUESTIONS.filter(q => q.difficulty === 'hard').length,
  },
  sections: Array.from(new Set(ASO_EXAM_QUESTIONS.map(q => q.section))),
  tags: Array.from(new Set(ASO_EXAM_QUESTIONS.flatMap(q => q.tags))),
};

console.log('ASO Exam Questions Database loaded:', DATABASE_STATS);
