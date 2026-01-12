// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - PRAWO UPADŁOŚCIOWE
// CZĘŚĆ 3 - 80 pytań: Syndyk, organy, postępowanie międzynarodowe
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// Ustawa z dnia 28 lutego 2003 r. - Prawo upadłościowe
// Dz.U.2025.614 t.j.
// ============================================================

import { ExamQuestion } from '../ksh/ksh-exam-questions';

export const PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3: ExamQuestion[] = [

  // ============================================================
  // SYNDYK - POWOŁANIE I KWALIFIKACJE
  // ============================================================

  {
    id: 'pu-161',
    article: 'Art. 157 § 1',
    articleTitle: 'Kwalifikacje syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Funkcję syndyka może pełnić osoba fizyczna, która:',
    options: {
      a: 'Ma wyższe wykształcenie prawnicze lub ekonomiczne',
      b: 'Posiada pełną zdolność do czynności prawnych i licencję doradcy restrukturyzacyjnego oraz ma konto w systemie teleinformatycznym obsługującym postępowanie sądowe',
      c: 'Jest wpisana na listę adwokatów lub radców prawnych',
      d: 'Jest biegłym rewidentem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157 § 1 funkcję syndyka może pełnić osoba fizyczna, która posiada pełną zdolność do czynności prawnych i licencję doradcy restrukturyzacyjnego oraz ma konto doradcy restrukturyzacyjnego w systemie teleinformatycznym obsługującym postępowanie sądowe.',
    difficulty: 'easy',
    tags: ['syndyk', 'kwalifikacje', 'licencja']
  },

  {
    id: 'pu-162',
    article: 'Art. 157 § 2',
    articleTitle: 'Syndyk - spółka handlowa',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Funkcję syndyka może również pełnić:',
    options: {
      a: 'Tylko osoba fizyczna',
      b: 'Spółka handlowa, której wspólnicy ponoszący nieograniczoną odpowiedzialność albo członkowie zarządu posiadają licencję doradcy restrukturyzacyjnego',
      c: 'Każda spółka prawa handlowego',
      d: 'Fundacja lub stowarzyszenie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157 § 2 funkcję syndyka może również pełnić spółka handlowa, której wspólnicy ponoszący odpowiedzialność za zobowiązania spółki bez ograniczenia całym swoim majątkiem albo członkowie zarządu reprezentujący spółkę posiadają licencję doradcy restrukturyzacyjnego.',
    difficulty: 'medium',
    tags: ['syndyk', 'spółka handlowa']
  },

  {
    id: 'pu-163',
    article: 'Art. 157¹ § 3',
    articleTitle: 'Kwalifikowany doradca restrukturyzacyjny',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'W przypadku przedsiębiorcy, który zatrudniał średniorocznie 250 lub więcej pracowników, sąd wyznacza do pełnienia funkcji syndyka osobę posiadającą:',
    options: {
      a: 'Zwykłą licencję doradcy restrukturyzacyjnego',
      b: 'Licencję doradcy restrukturyzacyjnego z tytułem kwalifikowanego doradcy restrukturyzacyjnego',
      c: 'Uprawnienia biegłego rewidenta',
      d: 'Dyplom MBA'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157¹ § 3 w przypadku przedsiębiorcy, który w co najmniej jednym z dwóch ostatnich lat obrotowych zatrudniał średniorocznie 250 lub więcej pracowników, sąd wyznacza do pełnienia funkcji syndyka osobę posiadającą licencję doradcy restrukturyzacyjnego z tytułem kwalifikowanego doradcy restrukturyzacyjnego.',
    difficulty: 'hard',
    tags: ['syndyk', 'kwalifikowany doradca', '250 pracowników', 'liczby']
  },

  {
    id: 'pu-164',
    article: 'Art. 157a § 1 pkt 1-2',
    articleTitle: 'Wyłączenia od funkcji syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndykiem NIE może być osoba, która:',
    options: {
      a: 'Jest obywatelem innego państwa UE',
      b: 'Jest wierzycielem lub dłużnikiem upadłego albo była zatrudniona przez upadłego na podstawie stosunku pracy',
      c: 'Ukończyła 65 lat',
      d: 'Prowadzi jednocześnie inne postępowanie upadłościowe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157a § 1 syndykiem nie może być osoba, która jest wierzycielem lub dłużnikiem upadłego, małżonkiem, wstępnym, zstępnym, rodzeństwem, powinowatym upadłego lub jego wierzyciela, a także osoba, która jest lub była zatrudniona przez upadłego na podstawie stosunku pracy.',
    difficulty: 'medium',
    tags: ['syndyk', 'wyłączenia', 'konflikt interesów']
  },

  {
    id: 'pu-165',
    article: 'Art. 157a § 2',
    articleTitle: 'Zakaz nabywania przez syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk oraz jego małżonek, wstępny, zstępny, rodzeństwo:',
    options: {
      a: 'Mogą nabywać rzeczy z masy upadłości za zgodą sędziego-komisarza',
      b: 'Nie mogą nabyć rzeczy ani praw pochodzących ze sprzedaży dokonanej w postępowaniu upadłościowym, w którym syndyk pełni albo pełnił tę funkcję',
      c: 'Mogą nabywać tylko ruchomości',
      d: 'Mogą nabywać po upływie roku od zakończenia postępowania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157a § 2 syndyk oraz jego małżonek, wstępny, zstępny, rodzeństwo, osoba pozostająca z nim w stosunku przysposobienia, jak również osoba pozostająca z nim w faktycznym związku, nie mogą nabyć rzeczy ani praw pochodzących ze sprzedaży dokonanej w postępowaniu upadłościowym, w którym syndyk pełni albo pełnił tę funkcję.',
    difficulty: 'medium',
    tags: ['syndyk', 'zakaz nabywania']
  },

  // ============================================================
  // SYNDYK - STATUS I ODPOWIEDZIALNOŚĆ
  // ============================================================

  {
    id: 'pu-166',
    article: 'Art. 160 § 1-2',
    articleTitle: 'Działanie syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'W sprawach dotyczących masy upadłości syndyk dokonuje czynności:',
    options: {
      a: 'W imieniu i na rachunek upadłego',
      b: 'W imieniu własnym na rachunek upadłego i nie odpowiada za zobowiązania zaciągnięte w sprawach dotyczących masy upadłości',
      c: 'W imieniu sądu',
      d: 'W imieniu wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 160 § 1-2 w sprawach dotyczących masy upadłości syndyk dokonuje czynności w imieniu własnym na rachunek upadłego. Syndyk nie odpowiada za zobowiązania zaciągnięte w sprawach dotyczących masy upadłości.',
    difficulty: 'hard',
    tags: ['syndyk', 'działanie', 'odpowiedzialność']
  },

  {
    id: 'pu-167',
    article: 'Art. 160 § 3',
    articleTitle: 'Odpowiedzialność syndyka za szkodę',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk odpowiada:',
    options: {
      a: 'Za wszystkie zobowiązania masy upadłości',
      b: 'Za szkodę wyrządzoną na skutek nienależytego wykonywania obowiązków',
      c: 'Solidarnie z upadłym',
      d: 'Tylko za szkody wyrządzone umyślnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 160 § 3 syndyk odpowiada za szkodę wyrządzoną na skutek nienależytego wykonywania obowiązków.',
    difficulty: 'medium',
    tags: ['syndyk', 'odpowiedzialność', 'szkoda']
  },

  {
    id: 'pu-168',
    article: 'Art. 156 § 4',
    articleTitle: 'Ubezpieczenie OC syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk niezwłocznie, nie później niż wraz z podjęciem pierwszej czynności przed sądem lub sędzią-komisarzem, składa do akt postępowania:',
    options: {
      a: 'Zaświadczenie o niekaralności',
      b: 'Dokument potwierdzający zawarcie umowy ubezpieczenia odpowiedzialności cywilnej za szkody wyrządzone w związku z pełnieniem funkcji',
      c: 'Referencje od innych sądów',
      d: 'Sprawozdanie z dotychczasowej działalności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 156 § 4 syndyk niezwłocznie, nie później niż wraz z podjęciem pierwszej czynności przed sądem lub sędzią-komisarzem, składa do akt postępowania dokument potwierdzający zawarcie umowy ubezpieczenia odpowiedzialności cywilnej za szkody wyrządzone w związku z pełnieniem funkcji. Koszty ubezpieczenia nie stanowią kosztów postępowania upadłościowego.',
    difficulty: 'medium',
    tags: ['syndyk', 'ubezpieczenie OC']
  },

  {
    id: 'pu-169',
    article: 'Art. 173',
    articleTitle: 'Objęcie majątku przez syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Po wyznaczeniu, syndyk:',
    options: {
      a: 'Czeka na instrukcje sędziego-komisarza',
      b: 'Niezwłocznie obejmuje majątek upadłego, zarządza nim, zabezpiecza go i przystępuje do jego likwidacji',
      c: 'Sporządza tylko sprawozdanie',
      d: 'Zwołuje zgromadzenie wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 173 syndyk niezwłocznie obejmuje majątek upadłego, zarządza nim, zabezpiecza go przed zniszczeniem, uszkodzeniem lub zabraniem go przez osoby postronne oraz przystępuje do jego likwidacji.',
    difficulty: 'easy',
    tags: ['syndyk', 'objęcie majątku']
  },

  {
    id: 'pu-170',
    article: 'Art. 179',
    articleTitle: 'Należyta staranność syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk jest obowiązany podejmować działania:',
    options: {
      a: 'Zgodnie z poleceniami upadłego',
      b: 'Z należytą starannością, w sposób umożliwiający optymalne wykorzystanie majątku upadłego w celu zaspokojenia wierzycieli w jak najwyższym stopniu',
      c: 'Zgodnie z instrukcjami wierzycieli',
      d: 'Wyłącznie na polecenie sędziego-komisarza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 179 syndyk jest obowiązany podejmować działania z należytą starannością, w sposób umożliwiający optymalne wykorzystanie majątku upadłego w celu zaspokojenia wierzycieli w jak najwyższym stopniu, w szczególności przez minimalizację kosztów postępowania.',
    difficulty: 'easy',
    tags: ['syndyk', 'należyta staranność']
  },

  // ============================================================
  // SYNDYK - WYNAGRODZENIE
  // ============================================================

  {
    id: 'pu-171',
    article: 'Art. 162 § 1',
    articleTitle: 'Wynagrodzenie syndyka - granice',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Wynagrodzenie syndyka ustala się jako sumę pięciu części składowych, w granicach od:',
    options: {
      a: 'Jednokrotności do stukrotności podstawy wynagrodzenia',
      b: 'Dwukrotności do dwustusześćdziesięciokrotności podstawy wynagrodzenia',
      c: 'Trzykrotności do trzystu krotności podstawy wynagrodzenia',
      d: 'Pięciokrotności do pięciusetkrotności podstawy wynagrodzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 162 § 1 wynagrodzenie syndyka ustala się jako sumę pięciu części składowych, w granicach od dwukrotności do dwustusześćdziesięciokrotności podstawy wynagrodzenia.',
    difficulty: 'hard',
    tags: ['syndyk', 'wynagrodzenie', '2-260x', 'liczby']
  },

  {
    id: 'pu-172',
    article: 'Art. 162 § 3',
    articleTitle: 'Podstawa wynagrodzenia syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Przez podstawę wynagrodzenia syndyka należy rozumieć:',
    options: {
      a: 'Minimalne wynagrodzenie za pracę',
      b: 'Przeciętne miesięczne wynagrodzenie w sektorze przedsiębiorstw bez wypłat nagród z zysku w trzecim kwartale roku poprzedniego',
      c: 'Wartość masy upadłości',
      d: 'Sumę wierzytelności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 162 § 3 przez podstawę wynagrodzenia należy rozumieć przeciętne miesięczne wynagrodzenie w sektorze przedsiębiorstw bez wypłat nagród z zysku w trzecim kwartale roku poprzedniego, ogłoszone przez Prezesa GUS.',
    difficulty: 'hard',
    tags: ['syndyk', 'wynagrodzenie', 'podstawa']
  },

  {
    id: 'pu-173',
    article: 'Art. 164 § 1',
    articleTitle: 'Zaliczki na wynagrodzenie syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Po ustaleniu wynagrodzenia wstępnego syndyk pobiera z masy upadłości zaliczki w wysokości do:',
    options: {
      a: '50% wynagrodzenia wstępnego',
      b: '75% wynagrodzenia wstępnego w czterech ratach',
      c: '90% wynagrodzenia wstępnego',
      d: '100% wynagrodzenia wstępnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 164 § 1 po ustaleniu wynagrodzenia wstępnego syndyk pobiera z masy upadłości zaliczki w wysokości do 75% wynagrodzenia wstępnego w czterech ratach: 10% po uprawomocnieniu się postanowienia, 25% po złożeniu listy wierzytelności, 15% po złożeniu pierwszego planu podziału, 25% po przeprowadzeniu pełnej likwidacji.',
    difficulty: 'hard',
    tags: ['syndyk', 'zaliczki', '75%', 'liczby']
  },

  // ============================================================
  // SYNDYK - SPRAWOZDANIA I NADZÓR
  // ============================================================

  {
    id: 'pu-174',
    article: 'Art. 168 § 1',
    articleTitle: 'Sprawozdania syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk składa sędziemu-komisarzowi sprawozdania w terminach przez niego wyznaczonych:',
    options: {
      a: 'Przynajmniej co miesiąc',
      b: 'Przynajmniej co trzy miesiące',
      c: 'Przynajmniej co sześć miesięcy',
      d: 'Przynajmniej co rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 168 § 1 syndyk składa sędziemu-komisarzowi w terminach przez niego wyznaczonych, przynajmniej co trzy miesiące, sprawozdanie obejmujące raport ze zmian w stanie i składzie masy upadłości, raport ze zmian stanu wierzytelności, raport z wpływów i wydatków oraz opis czynności syndyka.',
    difficulty: 'medium',
    tags: ['syndyk', 'sprawozdania', '3 miesiące', 'liczby']
  },

  {
    id: 'pu-175',
    article: 'Art. 169a § 2',
    articleTitle: 'Grzywna dla syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'W przypadku istotnego uchybienia albo braku poprawy w wykonywaniu obowiązków mimo upomnienia, sędzia-komisarz nakłada na syndyka grzywnę w wysokości:',
    options: {
      a: 'Od 100 zł do 5.000 zł',
      b: 'Od 500 zł do 10.000 zł',
      c: 'Od 1.000 zł do 30.000 zł',
      d: 'Od 5.000 zł do 50.000 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 169a § 2 w przypadku istotnego uchybienia albo braku poprawy w wykonywaniu obowiązków mimo upomnienia, sędzia-komisarz nakłada na syndyka grzywnę w wysokości od 1.000 zł do 30.000 zł.',
    difficulty: 'hard',
    tags: ['syndyk', 'grzywna', '1.000-30.000 zł', 'liczby']
  },

  {
    id: 'pu-176',
    article: 'Art. 170 § 1',
    articleTitle: 'Odwołanie syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Sąd odwołuje syndyka w przypadku:',
    options: {
      a: 'Każdego uchybienia',
      b: 'Rażącego uchybienia lub braku poprawy w wykonywaniu obowiązków mimo nałożonej grzywny',
      c: 'Wniosku upadłego',
      d: 'Upływu roku od powołania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 170 § 1 w przypadku rażącego uchybienia lub braku poprawy w wykonywaniu swoich obowiązków mimo nałożonej grzywny lub w przypadku niewykonania określonych obowiązków mimo wezwania sąd odwołuje syndyka.',
    difficulty: 'medium',
    tags: ['syndyk', 'odwołanie']
  },

  // ============================================================
  // SĘDZIA-KOMISARZ
  // ============================================================

  {
    id: 'pu-177',
    article: 'Art. 151 § 1',
    articleTitle: 'Czynności sędziego-komisarza',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'Po ogłoszeniu upadłości czynności postępowania upadłościowego wykonuje:',
    options: {
      a: 'Sąd upadłościowy',
      b: 'Sędzia-komisarz, z wyjątkiem czynności, dla których właściwy jest sąd',
      c: 'Syndyk',
      d: 'Rada wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 151 § 1 po ogłoszeniu upadłości czynności postępowania upadłościowego wykonuje sędzia-komisarz, z wyjątkiem czynności, dla których właściwy jest sąd.',
    difficulty: 'easy',
    tags: ['sędzia-komisarz', 'czynności']
  },

  {
    id: 'pu-178',
    article: 'Art. 151 § 1a',
    articleTitle: 'Referendarz jako sędzia-komisarz',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'Funkcję sędziego-komisarza może pełnić:',
    options: {
      a: 'Tylko sędzia zawodowy',
      b: 'Również referendarz sądowy',
      c: 'Asesor sądowy',
      d: 'Ławnik'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 151 § 1a funkcję sędziego-komisarza może pełnić referendarz sądowy.',
    difficulty: 'medium',
    tags: ['sędzia-komisarz', 'referendarz']
  },

  {
    id: 'pu-179',
    article: 'Art. 152 § 1',
    articleTitle: 'Zadania sędziego-komisarza',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'Sędzia-komisarz:',
    options: {
      a: 'Tylko rozpoznaje skargi',
      b: 'Kieruje tokiem postępowania upadłościowego, sprawuje nadzór nad czynnościami syndyka, oznacza czynności wymagające jego zezwolenia oraz zwraca uwagę na uchybienia syndyka',
      c: 'Tylko zatwierdza plany podziału',
      d: 'Reprezentuje upadłego przed sądem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 152 § 1 sędzia-komisarz kieruje tokiem postępowania upadłościowego, sprawuje nadzór nad czynnościami syndyka, oznacza czynności, których wykonywanie przez syndyka jest niedopuszczalne bez jego zezwolenia lub bez zezwolenia rady wierzycieli, jak również zwraca uwagę na popełnione przez syndyka uchybienia.',
    difficulty: 'medium',
    tags: ['sędzia-komisarz', 'zadania', 'nadzór']
  },

  {
    id: 'pu-180',
    article: 'Art. 154',
    articleTitle: 'Prawa i obowiązki sędziego-komisarza',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'Sędzia-komisarz w zakresie swych czynności ma prawa i obowiązki:',
    options: {
      a: 'Syndyka',
      b: 'Sądu i przewodniczącego',
      c: 'Wierzyciela',
      d: 'Biegłego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 154 sędzia-komisarz w zakresie swych czynności ma prawa i obowiązki sądu i przewodniczącego.',
    difficulty: 'medium',
    tags: ['sędzia-komisarz', 'prawa', 'obowiązki']
  },

  {
    id: 'pu-181',
    article: 'Art. 150 § 2',
    articleTitle: 'Skład sądu przy wynagrodzeniu syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'W przedmiocie wynagrodzenia syndyka oraz rozpoznając zażalenie na postanowienie sędziego-komisarza sąd upadłościowy orzeka w składzie:',
    options: {
      a: 'Jednego sędziego zawodowego',
      b: 'Trzech sędziów zawodowych',
      c: 'Jednego sędziego i dwóch ławników',
      d: 'Pięciu sędziów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 150 § 2 w przedmiocie wynagrodzenia syndyka, a także rozpoznając zażalenie na postanowienie sędziego-komisarza sąd upadłościowy orzeka w składzie trzech sędziów zawodowych.',
    difficulty: 'hard',
    tags: ['sąd upadłościowy', 'skład', 'wynagrodzenie syndyka']
  },

  // ============================================================
  // ZGROMADZENIE WIERZYCIELI
  // ============================================================

  {
    id: 'pu-182',
    article: 'Art. 191',
    articleTitle: 'Zwołanie zgromadzenia wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Sędzia-komisarz zwołuje zgromadzenie wierzycieli m.in.:',
    options: {
      a: 'Na wniosek każdego wierzyciela',
      b: 'Na wniosek przynajmniej dwóch wierzycieli mających łącznie nie mniej niż trzecią część ogólnej sumy uznanych wierzytelności',
      c: 'Na wniosek upadłego',
      d: 'Co miesiąc obowiązkowo'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 191 pkt 2 sędzia-komisarz zwołuje zgromadzenie wierzycieli na wniosek przynajmniej dwóch wierzycieli mających łącznie nie mniej niż trzecią część ogólnej sumy uznanych wierzytelności.',
    difficulty: 'hard',
    tags: ['zgromadzenie wierzycieli', 'zwołanie', '1/3 wierzytelności', 'liczby']
  },

  {
    id: 'pu-183',
    article: 'Art. 192 § 2',
    articleTitle: 'Termin obwieszczenia o zgromadzeniu wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Obwieszczenia o zwołaniu zgromadzenia wierzycieli dokonuje się przynajmniej:',
    options: {
      a: 'Na tydzień przed terminem zgromadzenia',
      b: 'Na dwa tygodnie przed terminem zgromadzenia wierzycieli',
      c: 'Na miesiąc przed terminem zgromadzenia',
      d: 'Na trzy dni przed terminem zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 192 § 2 obwieszczenia o zwołaniu zgromadzenia wierzycieli dokonuje się przynajmniej na dwa tygodnie przed terminem zgromadzenia wierzycieli.',
    difficulty: 'medium',
    tags: ['zgromadzenie wierzycieli', 'obwieszczenie', '2 tygodnie', 'liczby']
  },

  {
    id: 'pu-184',
    article: 'Art. 199 § 1',
    articleTitle: 'Uchwały zgromadzenia wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Jeżeli ustawa nie stanowi inaczej, uchwały zgromadzenia wierzycieli zapadają:',
    options: {
      a: 'Jednomyślnie',
      b: 'Bez względu na liczbę obecnych, większością głosów wierzycieli mających przynajmniej piątą część ogólnej sumy wierzytelności',
      c: 'Bezwzględną większością głosów wszystkich wierzycieli',
      d: 'Większością 2/3 głosów obecnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 199 § 1 jeżeli ustawa nie stanowi inaczej, uchwały zgromadzenia wierzycieli zapadają bez względu na liczbę obecnych, większością głosów wierzycieli mających przynajmniej piątą część (1/5) ogólnej sumy wierzytelności przypadających wierzycielom uprawnionym do uczestniczenia w tym zgromadzeniu.',
    difficulty: 'hard',
    tags: ['zgromadzenie wierzycieli', 'uchwały', '1/5 wierzytelności', 'liczby']
  },

  {
    id: 'pu-185',
    article: 'Art. 199 § 2',
    articleTitle: 'Uchwały w sprawach o wyłączenie mienia',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'W sprawach o wyłączenie mienia z masy upadłości uchwały zgromadzenia wierzycieli zapadają większością głosów wierzycieli mających przynajmniej:',
    options: {
      a: '1/5 ogólnej sumy wierzytelności',
      b: '1/2 ogólnej sumy wierzytelności',
      c: '2/3 ogólnej sumy uznanych wierzytelności',
      d: '3/4 ogólnej sumy wierzytelności'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 199 § 2 w sprawach o wyłączenie mienia z masy upadłości uchwały zapadają większością głosów wierzycieli mających przynajmniej dwie trzecie ogólnej sumy uznanych wierzytelności.',
    difficulty: 'hard',
    tags: ['zgromadzenie wierzycieli', 'wyłączenie mienia', '2/3 wierzytelności', 'liczby']
  },

  {
    id: 'pu-186',
    article: 'Art. 200',
    articleTitle: 'Uchylenie uchwały zgromadzenia wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Sędzia-komisarz może uchylić uchwałę zgromadzenia wierzycieli, jeżeli:',
    options: {
      a: 'Nie zgadza się z jej treścią',
      b: 'Jest sprzeczna z prawem lub narusza dobre obyczaje albo rażąco narusza interes wierzyciela, który głosował przeciw uchwale',
      c: 'Upadły się sprzeciwia',
      d: 'Syndyk złoży wniosek'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 200 sędzia-komisarz może uchylić uchwałę zgromadzenia wierzycieli, jeżeli jest sprzeczna z prawem lub narusza dobre obyczaje albo rażąco narusza interes wierzyciela, który głosował przeciw uchwale.',
    difficulty: 'medium',
    tags: ['zgromadzenie wierzycieli', 'uchylenie uchwały']
  },

  // ============================================================
  // RADA WIERZYCIELI
  // ============================================================

  {
    id: 'pu-187',
    article: 'Art. 201 § 1-2',
    articleTitle: 'Ustanowienie rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Radę wierzycieli ustanawia sędzia-komisarz:',
    options: {
      a: 'Obligatoryjnie w każdym postępowaniu',
      b: 'Z urzędu, o ile uzna to za potrzebne, albo niezwłocznie na wniosek upadłego, co najmniej trzech wierzycieli lub wierzyciela mającego co najmniej 1/5 sumy wierzytelności',
      c: 'Tylko na wniosek syndyka',
      d: 'Tylko w postępowaniach trwających ponad rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 201 § 1-2 radę wierzycieli ustanawia oraz powołuje i odwołuje jej członków sędzia-komisarz z urzędu, o ile uzna to za potrzebne, albo niezwłocznie na wniosek upadłego, co najmniej trzech wierzycieli lub wierzyciela/wierzycieli mających łącznie co najmniej piątą część sumy wierzytelności.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'ustanowienie', '1/5 wierzytelności', 'liczby']
  },

  {
    id: 'pu-188',
    article: 'Art. 202 § 1',
    articleTitle: 'Skład rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Rada wierzycieli składa się z:',
    options: {
      a: 'Trzech członków',
      b: 'Pięciu członków oraz dwóch zastępców powoływanych spośród wierzycieli dłużnika',
      c: 'Siedmiu członków',
      d: 'Dziewięciu członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 202 § 1 rada wierzycieli składa się z pięciu członków oraz dwóch zastępców powoływanych spośród wierzycieli dłużnika będących uczestnikami postępowania. Rada może składać się z trzech członków, jeżeli liczba wierzycieli jest mniejsza niż siedem.',
    difficulty: 'medium',
    tags: ['rada wierzycieli', 'skład', '5 członków', 'liczby']
  },

  {
    id: 'pu-189',
    article: 'Art. 205 § 1',
    articleTitle: 'Zadania rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Rada wierzycieli:',
    options: {
      a: 'Tylko zatwierdza sprawozdania syndyka',
      b: 'Udziela pomocy syndykowi, kontroluje jego czynności, bada stan funduszów masy upadłości, udziela zezwolenia na określone czynności',
      c: 'Reprezentuje upadłego w sądzie',
      d: 'Prowadzi likwidację majątku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 205 § 1 rada wierzycieli udziela pomocy syndykowi, kontroluje jego czynności, bada stan funduszów masy upadłości, udziela zezwolenia na czynności, które mogą być dokonane tylko za zezwoleniem rady wierzycieli, oraz wyraża opinię w innych sprawach.',
    difficulty: 'medium',
    tags: ['rada wierzycieli', 'zadania', 'kontrola']
  },

  {
    id: 'pu-190',
    article: 'Art. 206 § 1',
    articleTitle: 'Czynności wymagające zgody rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Zezwolenia rady wierzycieli pod rygorem nieważności wymagają m.in. następujące czynności:',
    options: {
      a: 'Zgłaszanie wierzytelności',
      b: 'Dalsze prowadzenie przedsiębiorstwa dłużej niż 3 miesiące, sprzedaż z wolnej ręki, zaciąganie pożyczek lub kredytów, uznanie i zawarcie ugody co do roszczeń spornych',
      c: 'Sporządzenie listy wierzytelności',
      d: 'Złożenie wniosku o ogłoszenie upadłości'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 206 § 1 zezwolenia rady wierzycieli pod rygorem nieważności wymagają: dalsze prowadzenie przedsiębiorstwa przez syndyka dłużej niż 3 miesiące, odstąpienie od sprzedaży przedsiębiorstwa jako całości, sprzedaż z wolnej ręki, zaciąganie pożyczek lub kredytów oraz obciążenie majątku, uznanie, zrzeczenie się i zawarcie ugody co do roszczeń spornych oraz poddanie sporu sądowi polubownemu.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'zezwolenie', 'nieważność']
  },

  {
    id: 'pu-191',
    article: 'Art. 206 § 2',
    articleTitle: 'Czynności niezwłoczne bez zezwolenia rady',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Syndyk może wykonać czynność wymagającą zezwolenia rady wierzycieli bez jej zezwolenia, jeżeli czynność musi być dokonana niezwłocznie i dotyczy wartości nieprzewyższającej:',
    options: {
      a: '1.000 zł',
      b: '5.000 zł',
      c: '10.000 zł',
      d: '50.000 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 206 § 2 jeżeli czynność musi być dokonana niezwłocznie i dotyczy wartości nieprzewyższającej dziesięciu tysięcy złotych, syndyk może ją wykonać bez zezwolenia rady.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'wyjątek', '10.000 zł', 'liczby']
  },

  {
    id: 'pu-192',
    article: 'Art. 206 § 3',
    articleTitle: 'Sprzedaż ruchomości bez zezwolenia',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Zezwolenie rady wierzycieli na sprzedaż ruchomości NIE jest wymagane, jeżeli wartość oszacowania wszystkich ruchomości wchodzących w skład masy upadłości nie przekracza:',
    options: {
      a: '10.000 zł',
      b: '25.000 zł',
      c: '50.000 zł',
      d: '100.000 zł'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 206 § 3 zezwolenie rady wierzycieli na sprzedaż ruchomości nie jest wymagane, jeżeli wskazana w spisie inwentarza wartość oszacowania wszystkich ruchomości wchodzących w skład masy upadłości nie przekracza równowartości 50.000 zł.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'ruchomości', '50.000 zł', 'liczby']
  },

  {
    id: 'pu-193',
    article: 'Art. 207a § 1',
    articleTitle: 'Zmiana syndyka na wniosek rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Na skutek uchwały rady wierzycieli podjętej w pełnym składzie, za którą głosowało co najmniej czterech członków, sąd:',
    options: {
      a: 'Może zmienić syndyka',
      b: 'Zmienia syndyka i powołuje osobę wskazaną przez radę wierzycieli, chyba że byłoby to niezgodne z prawem lub rażąco naruszało interes wierzycieli',
      c: 'Umarza postępowanie',
      d: 'Zawiesza postępowanie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 207a § 1 na skutek uchwały rady wierzycieli podjętej w pełnym składzie, za którą głosowało co najmniej czterech członków, sąd zmienia syndyka i powołuje osobę wskazaną przez radę wierzycieli, chyba że byłoby to niezgodne z prawem, rażąco naruszałoby interes wierzycieli lub zachodzi uzasadnione przypuszczenie, że wskazana osoba nie będzie należycie pełniła obowiązków.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'zmiana syndyka', '4 głosy', 'liczby']
  },

  {
    id: 'pu-194',
    article: 'Art. 211 § 1',
    articleTitle: 'Wynagrodzenie członka rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Wynagrodzenie członka rady wierzycieli za udział w posiedzeniu nie może przekraczać:',
    options: {
      a: '1% przeciętnego wynagrodzenia za jeden dzień',
      b: '3% miesięcznego przeciętnego wynagrodzenia za jeden dzień posiedzenia',
      c: '5% przeciętnego wynagrodzenia za jeden dzień',
      d: '10% przeciętnego wynagrodzenia za jeden dzień'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 211 § 1 wynagrodzenie członka rady wierzycieli za udział w posiedzeniu nie może przekraczać 3% miesięcznego przeciętnego wynagrodzenia, o którym mowa w art. 162 ust. 2, za jeden dzień posiedzenia.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'wynagrodzenie', '3%', 'liczby']
  },

  {
    id: 'pu-195',
    article: 'Art. 213 § 1',
    articleTitle: 'Brak rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Jeżeli rada wierzycieli nie została ustanowiona, czynności zastrzeżone dla rady wierzycieli podejmuje:',
    options: {
      a: 'Syndyk',
      b: 'Sędzia-komisarz',
      c: 'Zgromadzenie wierzycieli',
      d: 'Upadły'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 213 § 1 jeżeli rada wierzycieli nie została ustanowiona, czynności zastrzeżone dla rady wierzycieli podejmuje sędzia-komisarz.',
    difficulty: 'easy',
    tags: ['rada wierzycieli', 'brak', 'sędzia-komisarz']
  },

  // ============================================================
  // POSTĘPOWANIA SĄDOWE I EGZEKUCJA
  // ============================================================

  {
    id: 'pu-196',
    article: 'Art. 144 § 1',
    articleTitle: 'Prowadzenie postępowań przez syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział V - Wpływ ogłoszenia upadłości na postępowania',
    question: 'Po ogłoszeniu upadłości postępowania sądowe, administracyjne lub sądowoadministracyjne dotyczące masy upadłości:',
    options: {
      a: 'Ulegają zawieszeniu',
      b: 'Mogą być wszczęte i prowadzone wyłącznie przez syndyka albo przeciwko niemu',
      c: 'Są kontynuowane przez upadłego',
      d: 'Ulegają umorzeniu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 144 § 1 po ogłoszeniu upadłości postępowania sądowe, administracyjne lub sądowoadministracyjne dotyczące masy upadłości mogą być wszczęte i prowadzone wyłącznie przez syndyka albo przeciwko niemu.',
    difficulty: 'medium',
    tags: ['postępowania sądowe', 'syndyk', 'legitymacja']
  },

  {
    id: 'pu-197',
    article: 'Art. 146 § 1',
    articleTitle: 'Zawieszenie postępowania egzekucyjnego',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział V - Wpływ ogłoszenia upadłości na postępowania',
    question: 'Postępowanie egzekucyjne skierowane do majątku wchodzącego w skład masy upadłości, wszczęte przed dniem ogłoszenia upadłości:',
    options: {
      a: 'Jest kontynuowane',
      b: 'Ulega zawieszeniu z mocy prawa z dniem ogłoszenia upadłości i umorzeniu z mocy prawa po uprawomocnieniu się postanowienia o ogłoszeniu upadłości',
      c: 'Wymaga zatwierdzenia przez sędziego-komisarza',
      d: 'Jest przejmowane przez syndyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 146 § 1 postępowanie egzekucyjne skierowane do majątku wchodzącego w skład masy upadłości, wszczęte przed dniem ogłoszenia upadłości, ulega zawieszeniu z mocy prawa z dniem ogłoszenia upadłości. Postępowanie to umarza się z mocy prawa po uprawomocnieniu się postanowienia o ogłoszeniu upadłości.',
    difficulty: 'medium',
    tags: ['egzekucja', 'zawieszenie', 'umorzenie']
  },

  {
    id: 'pu-198',
    article: 'Art. 146 § 3',
    articleTitle: 'Zakaz wszczęcia egzekucji',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział V - Wpływ ogłoszenia upadłości na postępowania',
    question: 'Po dniu ogłoszenia upadłości skierowanie egzekucji do majątku wchodzącego w skład masy upadłości jest:',
    options: {
      a: 'Dopuszczalne za zgodą syndyka',
      b: 'Niedopuszczalne, z wyjątkiem roszczeń alimentacyjnych i niektórych rent',
      c: 'Dopuszczalne za zgodą sędziego-komisarza',
      d: 'Dopuszczalne tylko przez ZUS'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 146 § 3 po dniu ogłoszenia upadłości niedopuszczalne jest skierowanie egzekucji do majątku wchodzącego w skład masy upadłości, z wyjątkiem zabezpieczenia roszczeń alimentacyjnych oraz roszczeń o rentę z tytułu odszkodowania za wywołanie choroby, niezdolności do pracy, kalectwa lub śmierci oraz o zamianę uprawnień objętych treścią prawa dożywocia na dożywotnią rentę.',
    difficulty: 'medium',
    tags: ['egzekucja', 'zakaz', 'wyjątki alimentacyjne']
  },

  // ============================================================
  // UPADŁY
  // ============================================================

  {
    id: 'pu-199',
    article: 'Art. 185 § 2',
    articleTitle: 'Zdolność prawna upadłego',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Ogłoszenie upadłości:',
    options: {
      a: 'Powoduje utratę zdolności prawnej upadłego',
      b: 'Nie ma wpływu na zdolność prawną oraz zdolność do czynności prawnych upadłego',
      c: 'Ogranicza zdolność do czynności prawnych',
      d: 'Powoduje ubezwłasnowolnienie częściowe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 185 § 2 ogłoszenie upadłości nie ma wpływu na zdolność prawną oraz zdolność do czynności prawnych upadłego.',
    difficulty: 'easy',
    tags: ['upadły', 'zdolność prawna']
  },

  {
    id: 'pu-200',
    article: 'Art. 186',
    articleTitle: 'Uprawnienia korporacyjne upadłego',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Po ogłoszeniu upadłości wszelkie uprawnienia upadłego związane z uczestnictwem w spółkach lub spółdzielniach wykonuje:',
    options: {
      a: 'Upadły osobiście',
      b: 'Syndyk',
      c: 'Sędzia-komisarz',
      d: 'Rada wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 186 po ogłoszeniu upadłości wszelkie uprawnienia upadłego związane z uczestnictwem w spółkach lub spółdzielniach wykonuje syndyk.',
    difficulty: 'medium',
    tags: ['upadły', 'uprawnienia korporacyjne', 'syndyk']
  },

  // ============================================================
  // MIĘDZYNARODOWE POSTĘPOWANIE UPADŁOŚCIOWE
  // ============================================================

  {
    id: 'pu-201',
    article: 'Art. 378',
    articleTitle: 'Jurysdykcja krajowa',
    section: 'Część trzecia - Przepisy międzynarodowe',
    subsection: 'Tytuł X - Międzynarodowe postępowanie upadłościowe',
    question: 'Przepisy tytułu X o międzynarodowym postępowaniu upadłościowym stosuje się, jeżeli:',
    options: {
      a: 'Dłużnik jest obywatelem polskim',
      b: 'W sprawie brak jest jurysdykcji wynikającej z bezpośrednio stosowanych przepisów prawa Unii Europejskiej',
      c: 'Wierzyciele są podmiotami zagranicznymi',
      d: 'Majątek dłużnika znajduje się za granicą'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 378 przepisy tytułu X stosuje się, jeżeli w sprawie brak jest jurysdykcji wynikającej z bezpośrednio stosowanych przepisów prawa Unii Europejskiej.',
    difficulty: 'hard',
    tags: ['postępowanie międzynarodowe', 'jurysdykcja', 'prawo UE']
  },

  {
    id: 'pu-202',
    article: 'Art. 380 § 1',
    articleTitle: 'Jurysdykcja wyłączna',
    section: 'Część trzecia - Przepisy międzynarodowe',
    subsection: 'Tytuł X - Międzynarodowe postępowanie upadłościowe',
    question: 'W sprawach upadłościowych z elementem zagranicznym jurysdykcja sądów polskich jest wyłączna, jeżeli:',
    options: {
      a: 'Dłużnik ma obywatelstwo polskie',
      b: 'Na terytorium Polski znajduje się główny ośrodek podstawowej działalności dłużnika (COMI)',
      c: 'Dłużnik ma jakikolwiek majątek w Polsce',
      d: 'Wierzyciel ma siedzibę w Polsce'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 380 § 1 w sprawach upadłościowych z elementem zagranicznym jurysdykcja sądów polskich jest wyłączna, jeżeli na terytorium Rzeczypospolitej Polskiej znajduje się główny ośrodek podstawowej działalności dłużnika (COMI - Centre of Main Interests).',
    difficulty: 'hard',
    tags: ['jurysdykcja wyłączna', 'COMI', 'element zagraniczny']
  },

  {
    id: 'pu-203',
    article: 'Art. 380 § 2',
    articleTitle: 'COMI - domniemanie',
    section: 'Część trzecia - Przepisy międzynarodowe',
    subsection: 'Tytuł X - Międzynarodowe postępowanie upadłościowe',
    question: 'Domniemywa się, że głównym ośrodkiem podstawowej działalności (COMI) dłużnika jest:',
    options: {
      a: 'Miejsce urodzenia',
      b: 'Miejsce siedziby, a w przypadku osoby fizycznej prowadzącej działalność - główne miejsce jej wykonywania, a w przypadku osoby fizycznej nieprowadzącej działalności - miejsce zwykłego pobytu',
      c: 'Miejsce największego majątku',
      d: 'Miejsce największej liczby wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 380 § 2 domniemywa się, że głównym ośrodkiem podstawowej działalności dłużnika jest miejsce siedziby, a w przypadku osoby fizycznej prowadzącej działalność gospodarczą lub zawodową – główne miejsce wykonywania tej działalności, a w przypadku osoby fizycznej nieprowadzącej takiej działalności – miejsce zwykłego pobytu.',
    difficulty: 'medium',
    tags: ['COMI', 'domniemanie', 'siedziba']
  },

  // ============================================================
  // PORÓWNANIA I ZESTAWIENIA
  // ============================================================

  {
    id: 'pu-204',
    article: 'Porównanie',
    articleTitle: 'Terminy dla syndyka',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'Które zestawienie terminów dla syndyka jest PRAWIDŁOWE?',
    options: {
      a: 'Spis inwentarza: 14 dni, sprawozdania: co miesiąc, likwidacja: 3 miesiące',
      b: 'Spis inwentarza z planem likwidacyjnym: 30 dni, sprawozdania: co 3 miesiące, likwidacja: 6 miesięcy',
      c: 'Spis inwentarza: 60 dni, sprawozdania: co 6 miesięcy, likwidacja: 12 miesięcy',
      d: 'Spis inwentarza: 7 dni, sprawozdania: co tydzień, likwidacja: 1 miesiąc'
    },
    correct: 'b',
    explanation: 'Prawidłowe terminy: spis inwentarza z planem likwidacyjnym - 30 dni od ogłoszenia upadłości (art. 306), sprawozdania syndyka - co 3 miesiące (art. 168 § 1), likwidacja - 6 miesięcy od ogłoszenia upadłości (art. 308 § 2).',
    difficulty: 'hard',
    tags: ['syndyk', 'terminy', 'zestawienie', 'liczby']
  },

  {
    id: 'pu-205',
    article: 'Porównanie',
    articleTitle: 'Progi procentowe w radzie wierzycieli',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'Które zestawienie progów procentowych dotyczących rady wierzycieli jest PRAWIDŁOWE?',
    options: {
      a: 'Ustanowienie rady: 1/10 wierzytelności, powołanie członka: 1/10, zmiana syndyka: 2/3',
      b: 'Ustanowienie rady: 1/5 wierzytelności, powołanie członka: 1/5, zmiana syndyka przez radę: uchwała 4 z 5 członków',
      c: 'Ustanowienie rady: 1/3 wierzytelności, powołanie członka: 1/3, zmiana syndyka: 3/4',
      d: 'Ustanowienie rady: 1/2 wierzytelności, powołanie członka: 1/2, zmiana syndyka: jednomyślnie'
    },
    correct: 'b',
    explanation: 'Prawidłowe progi: ustanowienie rady wierzycieli - 1/5 sumy wierzytelności (art. 201 § 2), powołanie członka rady - 1/5 sumy wierzytelności (art. 202a § 1), zmiana syndyka na wniosek rady - uchwała co najmniej 4 z 5 członków (art. 207a § 1).',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'progi', 'porównanie', 'liczby']
  },

  {
    id: 'pu-206',
    article: 'Porównanie',
    articleTitle: 'Zgromadzenie wierzycieli - progi głosowania',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'Które zestawienie progów głosowania na zgromadzeniu wierzycieli jest PRAWIDŁOWE?',
    options: {
      a: 'Uchwały zwykłe: 1/10 wierzytelności, wyłączenie mienia: 1/2 wierzytelności',
      b: 'Uchwały zwykłe: 1/5 wierzytelności, wyłączenie mienia: 2/3 wierzytelności',
      c: 'Uchwały zwykłe: 1/3 wierzytelności, wyłączenie mienia: 3/4 wierzytelności',
      d: 'Uchwały zwykłe: 1/2 wierzytelności, wyłączenie mienia: jednomyślnie'
    },
    correct: 'b',
    explanation: 'Prawidłowe progi: uchwały zwykłe - większość głosów wierzycieli mających co najmniej 1/5 ogólnej sumy wierzytelności (art. 199 § 1), sprawy o wyłączenie mienia - większość głosów wierzycieli mających co najmniej 2/3 ogólnej sumy uznanych wierzytelności (art. 199 § 2).',
    difficulty: 'hard',
    tags: ['zgromadzenie wierzycieli', 'progi', 'głosowanie', 'liczby']
  },

  {
    id: 'pu-207',
    article: 'Porównanie',
    articleTitle: 'Grzywny i kary',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'Które zestawienie grzywien jest PRAWIDŁOWE?',
    options: {
      a: 'Grzywna dla syndyka: 500-10.000 zł, kara dla dłużnika za nieprawdziwe dane: do 1 roku',
      b: 'Grzywna dla syndyka: 1.000-30.000 zł, kara dla dłużnika za nieprawdziwe dane: do 3 lat, kara za niewydanie majątku: do 5 lat',
      c: 'Grzywna dla syndyka: 5.000-50.000 zł, kara dla dłużnika za nieprawdziwe dane: do 5 lat',
      d: 'Grzywna dla syndyka: 100-5.000 zł, kara dla dłużnika za nieprawdziwe dane: do 6 miesięcy'
    },
    correct: 'b',
    explanation: 'Prawidłowe: grzywna dla syndyka - 1.000-30.000 zł (art. 169a § 2), kara za podanie nieprawdziwych informacji - do 3 lat pozbawienia wolności (art. 522), kara za niewydanie majątku - do 5 lat pozbawienia wolności (art. 523).',
    difficulty: 'hard',
    tags: ['grzywny', 'kary', 'porównanie', 'liczby']
  },

  // ============================================================
  // CZYNNOŚCI PROCESOWE I ZASKARŻANIE
  // ============================================================

  {
    id: 'pu-208',
    article: 'Art. 222 § 1',
    articleTitle: 'Zażalenie na postanowienie sędziego-komisarza',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział IV - Przepisy ogólne',
    question: 'Zażalenie na postanowienie sędziego-komisarza wnosi się w terminie:',
    options: {
      a: '3 dni',
      b: 'Tygodnia',
      c: '2 tygodni',
      d: 'Miesiąca'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 222 § 1 na postanowienie sędziego-komisarza przysługuje zażalenie do sądu upadłościowego, które wnosi się w terminie tygodnia.',
    difficulty: 'medium',
    tags: ['zażalenie', 'sędzia-komisarz', 'tydzień', 'liczby']
  },

  {
    id: 'pu-209',
    article: 'Art. 210 § 2-3',
    articleTitle: 'Zarzuty przeciwko uchwale rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Uczestnik postępowania może wnieść zarzuty przeciwko uchwale rady wierzycieli w terminie:',
    options: {
      a: '3 dni',
      b: 'Tygodnia',
      c: '2 tygodni',
      d: 'Miesiąca'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 2 w terminie tygodnia uczestnik postępowania oraz syndyk mogą wnieść zarzuty przeciwko uchwale rady wierzycieli. Sędzia-komisarz rozpoznaje zarzuty w terminie tygodnia od dnia ich przedłożenia (§ 3).',
    difficulty: 'hard',
    tags: ['zarzuty', 'rada wierzycieli', 'tydzień', 'liczby']
  },

  {
    id: 'pu-210',
    article: 'Art. 210 § 5',
    articleTitle: 'Wykonanie uchwały rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Wykonanie uchwały rady wierzycieli nie może nastąpić wcześniej niż po upływie:',
    options: {
      a: 'Tygodnia od dnia jej przekazania sędziemu-komisarzowi',
      b: 'Dwóch tygodni od dnia jej przekazania sędziemu-komisarzowi',
      c: 'Miesiąca od dnia jej przekazania sędziemu-komisarzowi',
      d: 'Niezwłocznie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 5 wykonanie uchwały rady wierzycieli nie może nastąpić wcześniej niż po upływie dwóch tygodni od dnia jej przekazania sędziemu-komisarzowi.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'uchwała', '2 tygodnie', 'liczby']
  },

  // ============================================================
  // DORĘCZENIA I SYSTEM TELEINFORMATYCZNY
  // ============================================================

  {
    id: 'pu-211',
    article: 'Art. 216a § 1',
    articleTitle: 'Pisma procesowe w postępowaniu upadłościowym',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział IV - Przepisy ogólne',
    question: 'W postępowaniu upadłościowym pisma procesowe oraz dokumenty wnosi się:',
    options: {
      a: 'Wyłącznie w formie papierowej',
      b: 'Wyłącznie za pośrednictwem systemu teleinformatycznego obsługującego postępowanie sądowe',
      c: 'W dowolnej formie',
      d: 'Wyłącznie pocztą elektroniczną'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 216a § 1 w postępowaniu upadłościowym pisma procesowe oraz dokumenty wnosi się wyłącznie za pośrednictwem systemu teleinformatycznego obsługującego postępowanie sądowe z wykorzystaniem udostępnianych w tym systemie formularzy.',
    difficulty: 'medium',
    tags: ['pisma procesowe', 'system teleinformatyczny', 'KRZ']
  },

  {
    id: 'pu-212',
    article: 'Art. 216aa § 1',
    articleTitle: 'Wyjątek od obowiązku składania pism elektronicznie',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział IV - Przepisy ogólne',
    question: 'Z pominięciem systemu teleinformatycznego mogą wnosić pisma wierzyciele, którym przysługują:',
    options: {
      a: 'Wierzytelności powyżej 100.000 zł',
      b: 'Należności ze stosunku pracy (z wyjątkami), należności alimentacyjne oraz renty z tytułu odszkodowania',
      c: 'Wierzytelności zabezpieczone hipoteką',
      d: 'Wierzytelności podatkowe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 216aa § 1 z pominięciem systemu teleinformatycznego mogą wnosić pisma wierzyciele, którym przysługują należności ze stosunku pracy (z wyjątkiem wynagrodzenia reprezentanta upadłego lub osoby wykonującej czynności związane z zarządem lub nadzorem), należności alimentacyjne oraz renty z tytułu odszkodowania.',
    difficulty: 'hard',
    tags: ['pisma procesowe', 'wyjątki', 'pracownicy', 'alimenty']
  },

  // ============================================================
  // ZAWIADOMIENIA I OBWIESZCZENIA
  // ============================================================

  {
    id: 'pu-213',
    article: 'Art. 176 § 1',
    articleTitle: 'Zawiadomienie o upadłości',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk niezwłocznie zawiadamia o upadłości:',
    options: {
      a: 'Tylko sąd',
      b: 'Wierzycieli znanych z ksiąg upadłego, komorników prowadzących egzekucje przeciwko upadłemu oraz małżonka upadłego',
      c: 'Tylko ZUS i urząd skarbowy',
      d: 'Wszystkich mieszkańców gminy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 176 § 1 syndyk niezwłocznie zawiadamia o upadłości tych wierzycieli, których adresy są znane na podstawie ksiąg upadłego, a także komorników prowadzących postępowania egzekucyjne przeciwko upadłemu oraz małżonka upadłego.',
    difficulty: 'medium',
    tags: ['zawiadomienie', 'syndyk', 'wierzyciele']
  },

  {
    id: 'pu-214',
    article: 'Art. 176 § 2',
    articleTitle: 'Zawiadomienie placówek pocztowych',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Po ogłoszeniu upadłości placówki pocztowe:',
    options: {
      a: 'Nie doręczają korespondencji do upadłego',
      b: 'Doręczają syndykowi adresowane do upadłego przesyłki pocztowe, a syndyk w terminie 7 dni zawiadamia upadłego o przesyłkach niedotyczących masy upadłości',
      c: 'Doręczają wszystko bezpośrednio do sądu',
      d: 'Zwracają korespondencję nadawcom'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 176 § 2 syndyk zawiadamia placówki pocztowe o ogłoszeniu upadłości. Placówki te doręczają syndykowi adresowane do upadłego przesyłki pocztowe. Syndyk w terminie siedmiu dni od dnia otrzymania przesyłki zawiadamia upadłego o otrzymaniu przesyłek, które nie dotyczą masy upadłości.',
    difficulty: 'hard',
    tags: ['poczta', 'syndyk', '7 dni', 'liczby']
  },

  // ============================================================
  // DALSZE PROWADZENIE PRZEDSIĘBIORSTWA
  // ============================================================

  {
    id: 'pu-215',
    article: 'Art. 206 § 1 pkt 1',
    articleTitle: 'Dalsze prowadzenie przedsiębiorstwa',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Dalsze prowadzenie przedsiębiorstwa przez syndyka dłużej niż trzy miesiące od dnia ogłoszenia upadłości wymaga:',
    options: {
      a: 'Zgody sądu',
      b: 'Zezwolenia rady wierzycieli pod rygorem nieważności',
      c: 'Zgody upadłego',
      d: 'Tylko zawiadomienia sędziego-komisarza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 206 § 1 pkt 1 zezwolenia rady wierzycieli pod rygorem nieważności wymaga dalsze prowadzenie przedsiębiorstwa przez syndyka, jeżeli ma trwać dłużej niż trzy miesiące od dnia ogłoszenia upadłości.',
    difficulty: 'hard',
    tags: ['prowadzenie przedsiębiorstwa', '3 miesiące', 'zezwolenie', 'liczby']
  },

  // ============================================================
  // OBOWIĄZKI SYNDYKA - SZCZEGÓŁY
  // ============================================================

  {
    id: 'pu-216',
    article: 'Art. 175',
    articleTitle: 'Ujawnienie upadłości w rejestrach',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk podejmuje niezbędne czynności celem ujawnienia postanowienia o ogłoszeniu upadłości:',
    options: {
      a: 'Tylko w KRS',
      b: 'W księdze wieczystej oraz w innych księgach i rejestrach, do których wpisany jest majątek upadłego',
      c: 'Tylko w CEIDG',
      d: 'Tylko w Rejestrze Dłużników Niewypłacalnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 175 syndyk podejmuje niezbędne czynności celem ujawnienia postanowienia o ogłoszeniu upadłości w księdze wieczystej oraz w innych księgach i rejestrach, do których wpisany jest majątek upadłego.',
    difficulty: 'easy',
    tags: ['syndyk', 'ujawnienie', 'rejestry']
  },

  {
    id: 'pu-217',
    article: 'Art. 177 § 1',
    articleTitle: 'Ochrona roszczeń pracowniczych',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk niezwłocznie wykonuje obowiązki przewidziane przepisami o ochronie roszczeń pracowniczych w razie niewypłacalności pracodawcy. Środki przekazane z FGŚP:',
    options: {
      a: 'Wchodzą do masy upadłości',
      b: 'Nie wchodzą do masy upadłości ani nie mogą służyć zaspokojeniu innych wierzycieli niż uprawnieni do ich odbioru',
      c: 'Podlegają podziałowi między wszystkich wierzycieli',
      d: 'Są zwracane do FGŚP po zakończeniu postępowania'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 177 § 2 przekazane z Funduszu Gwarantowanych Świadczeń Pracowniczych środki nie wchodzą do masy upadłości ani nie mogą służyć zaspokojeniu innych wierzycieli niż uprawnieni do ich odbioru.',
    difficulty: 'medium',
    tags: ['FGŚP', 'pracownicy', 'masa upadłości']
  },

  {
    id: 'pu-218',
    article: 'Art. 161 § 1',
    articleTitle: 'Pełnomocnictwa syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk może udzielać:',
    options: {
      a: 'Tylko pełnomocnictw procesowych',
      b: 'Pełnomocnictw do dokonywania czynności prawnych oraz pełnomocnictw procesowych w postępowaniach sądowych, administracyjnych, sądowoadministracyjnych i przed sądami polubownymi',
      c: 'Tylko pełnomocnictw ogólnych',
      d: 'Pełnomocnictw wyłącznie za zgodą sędziego-komisarza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 161 § 1 syndyk może udzielać pełnomocnictw do dokonywania czynności prawnych. Może też udzielać pełnomocnictw procesowych w postępowaniach sądowych, administracyjnych, sądowoadministracyjnych i przed sądami polubownymi.',
    difficulty: 'medium',
    tags: ['syndyk', 'pełnomocnictwa']
  },

  // ============================================================
  // ZASTĘPCA SYNDYKA
  // ============================================================

  {
    id: 'pu-219',
    article: 'Art. 159 § 1',
    articleTitle: 'Powołanie zastępcy syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Zastępcę syndyka powołuje:',
    options: {
      a: 'Sąd upadłościowy z urzędu',
      b: 'Na wniosek syndyka lub z urzędu sędzia-komisarz, jeżeli jest to potrzebne',
      c: 'Rada wierzycieli',
      d: 'Zgromadzenie wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 159 § 1 na wniosek syndyka lub z urzędu sędzia-komisarz może powołać zastępcę syndyka, jeżeli jest to potrzebne, zwłaszcza w przypadku wykonywania czynności w innym okręgu sądowym.',
    difficulty: 'medium',
    tags: ['zastępca syndyka', 'powołanie']
  },

  // ============================================================
  // KURATOR
  // ============================================================

  {
    id: 'pu-220',
    article: 'Art. 187 § 1',
    articleTitle: 'Kurator upadłego',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Jeżeli w składzie organów upadłego będącego osobą prawną zachodzą braki uniemożliwiające ich działanie:',
    options: {
      a: 'Postępowanie ulega zawieszeniu',
      b: 'Sędzia-komisarz ustanawia dla niego kuratora, który działa za upadłego w postępowaniu upadłościowym',
      c: 'Syndyk przejmuje obowiązki zarządu',
      d: 'Sąd wyznacza likwidatora'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 187 § 1 jeżeli w składzie organów upadłego będącego osobą prawną zachodzą braki uniemożliwiające ich działanie, sędzia-komisarz ustanawia dla niego kuratora, który działa za upadłego w postępowaniu upadłościowym.',
    difficulty: 'medium',
    tags: ['kurator', 'braki w organach']
  },

  // ============================================================
  // OSTATNIE PYTANIA - ZESTAWIENIA KOŃCOWE
  // ============================================================

  {
    id: 'pu-221',
    article: 'Zestawienie',
    articleTitle: 'Skład rady wierzycieli',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie dotyczące składu rady wierzycieli jest PRAWIDŁOWE?',
    options: {
      a: 'Standardowo: 3 członków + 1 zastępca, przy mniej niż 5 wierzycielach: 2 członków',
      b: 'Standardowo: 5 członków + 2 zastępców, przy mniej niż 7 wierzycielach: 3 członków',
      c: 'Standardowo: 7 członków + 3 zastępców, przy mniej niż 10 wierzycielach: 5 członków',
      d: 'Zawsze: 3 członków, bez zastępców'
    },
    correct: 'b',
    explanation: 'Prawidłowe: rada wierzycieli składa się standardowo z 5 członków oraz 2 zastępców (art. 202 § 1). Rada może składać się z 3 członków, jeżeli liczba wierzycieli dłużnika będących uczestnikami postępowania jest mniejsza niż 7.',
    difficulty: 'hard',
    tags: ['rada wierzycieli', 'skład', 'liczby']
  },

  {
    id: 'pu-222',
    article: 'Zestawienie',
    articleTitle: 'Wynagrodzenie syndyka - części składowe',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Wynagrodzenie syndyka ustala się jako sumę ilu części składowych?',
    options: {
      a: 'Trzech części składowych',
      b: 'Czterech części składowych',
      c: 'Pięciu części składowych',
      d: 'Sześciu części składowych'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 162 § 1 wynagrodzenie syndyka ustala się jako sumę pięciu części składowych: (1) część zależna od sumy wypłaconej wierzycielom, (2) część zależna od liczby pracowników, (3) część zależna od liczby wierzycieli, (4) część zależna od czasu trwania postępowania, (5) część ustalana przez sąd do 70 podstaw w zależności od stopnia trudności.',
    difficulty: 'hard',
    tags: ['wynagrodzenie syndyka', '5 części', 'liczby']
  },

  {
    id: 'pu-223',
    article: 'Zestawienie',
    articleTitle: 'Kluczowe progi wierzytelności',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie progów wierzytelności jest PRAWIDŁOWE?',
    options: {
      a: 'Ustanowienie rady wierzycieli: 1/5, zwołanie zgromadzenia: 1/5, uchwały zwykłe: 1/5',
      b: 'Ustanowienie rady wierzycieli: 1/5, zwołanie zgromadzenia: 1/3, uchwały zwykłe: 1/5',
      c: 'Ustanowienie rady wierzycieli: 1/3, zwołanie zgromadzenia: 1/2, uchwały zwykłe: 1/3',
      d: 'Ustanowienie rady wierzycieli: 1/4, zwołanie zgromadzenia: 1/4, uchwały zwykłe: 1/4'
    },
    correct: 'b',
    explanation: 'Prawidłowe progi: ustanowienie rady wierzycieli - 1/5 sumy wierzytelności (art. 201 § 2), zwołanie zgromadzenia wierzycieli - 1/3 sumy wierzytelności (art. 191 pkt 2), uchwały zwykłe zgromadzenia - 1/5 sumy wierzytelności (art. 199 § 1).',
    difficulty: 'hard',
    tags: ['progi wierzytelności', 'zestawienie', 'liczby']
  },

  {
    id: 'pu-224',
    article: 'Zestawienie',
    articleTitle: 'Zaliczki na wynagrodzenie syndyka',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie rat zaliczek na wynagrodzenie syndyka jest PRAWIDŁOWE?',
    options: {
      a: '25% po uprawomocnieniu, 25% po liście, 25% po planie podziału, 25% po likwidacji',
      b: '10% po uprawomocnieniu postanowienia o wynagrodzeniu wstępnym, 25% po złożeniu listy wierzytelności, 15% po pierwszym planie podziału, 25% po pełnej likwidacji',
      c: '20% po uprawomocnieniu, 20% po liście, 20% po planie podziału, 15% po likwidacji',
      d: '50% na początku, 50% na końcu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 164 § 1 syndyk pobiera zaliczki do 75% wynagrodzenia wstępnego w czterech ratach: 10% po uprawomocnieniu się postanowienia o wynagrodzeniu wstępnym, 25% po złożeniu listy wierzytelności, 15% po złożeniu pierwszego planu podziału, 25% po przeprowadzeniu pełnej likwidacji masy upadłości.',
    difficulty: 'hard',
    tags: ['zaliczki', 'syndyk', '10-25-15-25%', 'liczby']
  },

  {
    id: 'pu-225',
    article: 'Zestawienie',
    articleTitle: 'Terminy w postępowaniu upadłościowym',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie terminów jest PRAWIDŁOWE?',
    options: {
      a: 'Zażalenie na postanowienie sędziego-komisarza: 3 dni, zarzuty do uchwały rady: 3 dni',
      b: 'Zażalenie na postanowienie sędziego-komisarza: tydzień, zarzuty do uchwały rady: tydzień, obwieszczenie o zgromadzeniu: 2 tygodnie',
      c: 'Zażalenie na postanowienie sędziego-komisarza: 2 tygodnie, zarzuty do uchwały rady: 2 tygodnie',
      d: 'Zażalenie na postanowienie sędziego-komisarza: miesiąc, zarzuty do uchwały rady: miesiąc'
    },
    correct: 'b',
    explanation: 'Prawidłowe terminy: zażalenie na postanowienie sędziego-komisarza - tydzień (art. 222 § 1), zarzuty do uchwały rady wierzycieli - tydzień (art. 210 § 2), obwieszczenie o zgromadzeniu wierzycieli - co najmniej 2 tygodnie przed terminem (art. 192 § 2).',
    difficulty: 'hard',
    tags: ['terminy', 'zestawienie', 'tydzień', 'liczby']
  },

  {
    id: 'pu-226',
    article: 'Porównanie',
    articleTitle: 'Kwalifikowany doradca restrukturyzacyjny',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'W których przypadkach sąd MUSI wyznaczyć syndyka posiadającego tytuł kwalifikowanego doradcy restrukturyzacyjnego?',
    options: {
      a: 'W każdym postępowaniu',
      b: 'Przedsiębiorca zatrudniający 250+ pracowników, osiągający obrót 50+ mln euro, aktywa 43+ mln euro, lub spółka o istotnym znaczeniu dla gospodarki państwa',
      c: 'Tylko w upadłości banków',
      d: 'Tylko w upadłości konsumenckiej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 157¹ § 3 sąd wyznacza syndyka z tytułem kwalifikowanego doradcy restrukturyzacyjnego w przypadku: przedsiębiorcy zatrudniającego średniorocznie 250 lub więcej pracowników, osiągającego roczny obrót przekraczający 50 mln euro, aktywów przekraczających 43 mln euro, spółki o istotnym znaczeniu dla gospodarki państwa, przedsiębiorcy realizującego zadania na rzecz Sił Zbrojnych.',
    difficulty: 'hard',
    tags: ['kwalifikowany doradca', 'progi', '250 pracowników', 'liczby']
  },

  {
    id: 'pu-227',
    article: 'Art. 168 § 5',
    articleTitle: 'Zarzuty do sprawozdań syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Upadły i wierzyciele mogą wnosić zarzuty dotyczące wydatków poniesionych przez syndyka, wskazanych w sprawozdaniach, w terminie:',
    options: {
      a: '7 dni',
      b: '14 dni',
      c: '30 dni',
      d: '60 dni'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 168 § 5 w terminie 30 dni upadły i wierzyciele mogą wnosić zarzuty dotyczące wydatków poniesionych przez syndyka lub zastępcę syndyka, wskazanych w sprawozdaniach.',
    difficulty: 'hard',
    tags: ['sprawozdania', 'zarzuty', '30 dni', 'liczby']
  },

  {
    id: 'pu-228',
    article: 'Art. 168 § 5b',
    articleTitle: 'Odmowa uznania wydatków syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Sędzia-komisarz w wyniku rozpoznania zarzutów lub z urzędu odmawia uznania wydatku syndyka w terminie:',
    options: {
      a: 'Tygodnia od dnia złożenia sprawozdania',
      b: 'Dwóch tygodni od dnia złożenia sprawozdania',
      c: 'Dwóch miesięcy od dnia złożenia sprawozdania',
      d: 'Trzech miesięcy od dnia złożenia sprawozdania'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 168 § 5b sędzia-komisarz w wyniku rozpoznania zarzutów lub z urzędu w terminie dwóch miesięcy od dnia złożenia sprawozdania odmawia uznania w całości lub części określonego wydatku oraz orzeka o zwrocie do masy upadłości kwoty poniesionej z tytułu wydatku, którego uznania odmówiono.',
    difficulty: 'hard',
    tags: ['sprawozdania', 'odmowa', '2 miesiące', 'liczby']
  },

  {
    id: 'pu-229',
    article: 'Art. 147a § 2',
    articleTitle: 'Odstąpienie od zapisu na sąd polubowny',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział V - Wpływ ogłoszenia upadłości na postępowania',
    question: 'Na żądanie drugiej strony syndyk oświadcza, czy odstępuje od zapisu na sąd polubowny, w terminie:',
    options: {
      a: '7 dni',
      b: '14 dni',
      c: '30 dni',
      d: '60 dni'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 147a § 2 na żądanie drugiej strony złożone w formie pisemnej syndyk w terminie trzydziestu dni oświadczy na piśmie, czy odstępuje od zapisu na sąd polubowny. Niezłożenie w tym terminie oświadczenia przez syndyka uważa się za odstąpienie od zapisu.',
    difficulty: 'hard',
    tags: ['sąd polubowny', 'odstąpienie', '30 dni', 'liczby']
  },

  {
    id: 'pu-230',
    article: 'Porównanie',
    articleTitle: 'Odpowiedzialność syndyka i członka rady',
    section: 'Podsumowanie',
    subsection: 'Porównania',
    question: 'Które stwierdzenie o odpowiedzialności syndyka i członka rady wierzycieli jest PRAWIDŁOWE?',
    options: {
      a: 'Syndyk i członek rady odpowiadają tylko za działania umyślne',
      b: 'Syndyk odpowiada za szkodę wyrządzoną na skutek nienależytego wykonywania obowiązków, członek rady odpowiada za szkodę wynikłą z nienależytego pełnienia obowiązków',
      c: 'Syndyk nie odpowiada za szkody, odpowiedzialność ponosi tylko upadły',
      d: 'Członek rady nigdy nie odpowiada za szkody'
    },
    correct: 'b',
    explanation: 'Syndyk odpowiada za szkodę wyrządzoną na skutek nienależytego wykonywania obowiązków (art. 160 § 3). Członek rady wierzycieli odpowiada za szkodę wynikłą z nienależytego pełnienia obowiązków (art. 212 § 1).',
    difficulty: 'medium',
    tags: ['odpowiedzialność', 'syndyk', 'rada wierzycieli']
  },

  // ============================================================
  // FINALNE PYTANIA
  // ============================================================

  {
    id: 'pu-231',
    article: 'Art. 162 § 2 pkt 5',
    articleTitle: 'Uznaniowa część wynagrodzenia syndyka',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Część wynagrodzenia syndyka ustalana przez sąd w zależności od stopnia trudności postępowania i jego efektywności może wynieść do:',
    options: {
      a: '30 podstaw wynagrodzenia',
      b: '50 podstaw wynagrodzenia',
      c: '70 podstaw wynagrodzenia',
      d: '100 podstaw wynagrodzenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 162 § 2 pkt 5 część wynagrodzenia syndyka ustalana przez sąd do siedemdziesięciu podstaw wynagrodzenia w zależności od stopnia trudności prowadzonego postępowania i jego efektywności, w szczególności od skomplikowania sytuacji prawnej i faktycznej masy upadłości.',
    difficulty: 'hard',
    tags: ['wynagrodzenie syndyka', '70 podstaw', 'liczby']
  },

  {
    id: 'pu-232',
    article: 'Art. 165 § 1',
    articleTitle: 'Termin wniosku o wynagrodzenie ostateczne',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Syndyk składa wniosek o ustalenie wynagrodzenia ostatecznego w terminie:',
    options: {
      a: '3 dni od dnia złożenia ostatecznego planu podziału',
      b: 'Tygodnia od dnia złożenia ostatecznego planu podziału albo doręczenia mu postanowienia o odwołaniu lub zmianie syndyka albo umorzeniu postępowania',
      c: '2 tygodni od dnia złożenia ostatecznego planu podziału',
      d: 'Miesiąca od dnia złożenia ostatecznego planu podziału'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 165 § 1 sąd wydaje postanowienie w przedmiocie wynagrodzenia ostatecznego na wniosek syndyka złożony w terminie tygodnia od dnia złożenia ostatecznego planu podziału albo doręczenia mu postanowienia o odwołaniu lub zmianie syndyka albo umorzeniu postępowania.',
    difficulty: 'hard',
    tags: ['wynagrodzenie syndyka', 'termin', 'tydzień', 'liczby']
  },

  {
    id: 'pu-233',
    article: 'Art. 176 § 2',
    articleTitle: 'Doręczenie przesyłki pocztowej upadłemu',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział II - Syndyk i zastępca syndyka',
    question: 'Doręczenie przesyłki pocztowej dla upadłego uważa się za dokonane z upływem:',
    options: {
      a: '7 dni od dnia doręczenia przesyłki syndykowi',
      b: '14 dni od dnia doręczenia przesyłki syndykowi',
      c: '30 dni od dnia doręczenia przesyłki pocztowej syndykowi',
      d: '60 dni od dnia doręczenia przesyłki syndykowi'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 176 § 2 doręczenie przesyłki pocztowej dla upadłego uważa się za dokonane z upływem trzydziestu dni od dnia doręczenia przesyłki pocztowej syndykowi.',
    difficulty: 'hard',
    tags: ['poczta', 'doręczenie', '30 dni', 'liczby']
  },

  {
    id: 'pu-234',
    article: 'Art. 210 § 4',
    articleTitle: 'Uchylenie uchwały rady wierzycieli z urzędu',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Sędzia-komisarz z urzędu może uchylić uchwałę rady wierzycieli w terminie:',
    options: {
      a: 'Tygodnia od dnia przekazania mu uchwały',
      b: 'Dwóch tygodni od dnia przekazania mu uchwały rady wierzycieli',
      c: 'Miesiąca od dnia przekazania mu uchwały',
      d: 'Dwóch miesięcy od dnia przekazania mu uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 4 sędzia-komisarz w wyniku rozpoznania zarzutów lub z urzędu w terminie dwóch tygodni od dnia przekazania mu uchwały rady wierzycieli może uchylić tę uchwałę, jeżeli jest ona sprzeczna z prawem lub narusza interes wierzycieli.',
    difficulty: 'hard',
    tags: ['uchwała rady', 'uchylenie', '2 tygodnie', 'liczby']
  },

  {
    id: 'pu-235',
    article: 'Art. 207 § 1b',
    articleTitle: 'Termin podjęcia uchwały przez radę wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Uchwały rady wierzycieli podejmuje się w terminie:',
    options: {
      a: 'Tygodnia od dnia złożenia wniosku do rady',
      b: 'Dwóch tygodni od dnia złożenia wniosku do rady',
      c: 'Miesiąca od dnia złożenia wniosku do rady',
      d: 'Bez ograniczenia czasowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 207 § 1b uchwały rady wierzycieli podejmuje się większością głosów, jeżeli ustawa nie stanowi inaczej, w terminie dwóch tygodni od dnia złożenia wniosku do rady.',
    difficulty: 'hard',
    tags: ['uchwała rady', 'termin', '2 tygodnie', 'liczby']
  },

  {
    id: 'pu-236',
    article: 'Art. 149 § 1',
    articleTitle: 'Właściwość sądu upadłościowego',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział I - Sąd i sędzia-komisarz',
    question: 'Po ogłoszeniu upadłości postępowanie upadłościowe toczy się:',
    options: {
      a: 'W sądzie właściwym dla siedziby największego wierzyciela',
      b: 'W sądzie upadłościowym, który ogłosił upadłość',
      c: 'W Sądzie Najwyższym',
      d: 'W sądzie właściwym dla siedziby syndyka'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 149 § 1 po ogłoszeniu upadłości postępowanie upadłościowe toczy się w sądzie upadłościowym, który ogłosił upadłość.',
    difficulty: 'easy',
    tags: ['właściwość sądu', 'postępowanie']
  },

  {
    id: 'pu-237',
    article: 'Art. 193 § 1',
    articleTitle: 'Przewodniczenie zgromadzeniu wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Zgromadzeniu wierzycieli przewodniczy:',
    options: {
      a: 'Syndyk',
      b: 'Sędzia-komisarz',
      c: 'Przewodniczący rady wierzycieli',
      d: 'Upadły'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 193 § 1 zgromadzeniu wierzycieli przewodniczy sędzia-komisarz.',
    difficulty: 'easy',
    tags: ['zgromadzenie wierzycieli', 'przewodniczący']
  },

  {
    id: 'pu-238',
    article: 'Art. 197 § 1',
    articleTitle: 'Wyłączenie prawa głosu wierzyciela',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Wierzyciel NIE ma prawa głosu na podstawie wierzytelności, którą nabył w drodze przelewu lub indosu:',
    options: {
      a: 'Przed ogłoszeniem upadłości',
      b: 'Po ogłoszeniu upadłości, chyba że przejście wierzytelności nastąpiło wskutek spłacenia przez niego długu, za który odpowiadał osobiście',
      c: 'W każdym przypadku',
      d: 'Tylko gdy nabył od podmiotu powiązanego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 197 § 1 wierzyciel nie ma prawa głosu na podstawie wierzytelności, którą nabył w drodze przelewu lub indosu po ogłoszeniu upadłości, chyba że przejście wierzytelności nastąpiło wskutek spłacenia przez niego długu, za który odpowiadał osobiście albo określonymi przedmiotami majątkowymi, ze stosunku prawnego powstałego przed ogłoszeniem upadłości.',
    difficulty: 'hard',
    tags: ['głosowanie', 'przelew wierzytelności', 'wyłączenie']
  },

  {
    id: 'pu-239',
    article: 'Art. 208 § 1',
    articleTitle: 'Pierwsze posiedzenie rady wierzycieli',
    section: 'Część druga - Postępowanie po ogłoszeniu upadłości',
    subsection: 'Dział III - Uczestnicy postępowania',
    question: 'Pierwsze posiedzenie rady wierzycieli zwołuje:',
    options: {
      a: 'Sędzia-komisarz',
      b: 'Syndyk niezwłocznie po powołaniu rady wierzycieli',
      c: 'Przewodniczący rady',
      d: 'Sąd upadłościowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 208 § 1 pierwsze posiedzenie rady zwołuje syndyk niezwłocznie po powołaniu rady wierzycieli. Rada wierzycieli na pierwszym posiedzeniu przyjmuje regulamin oraz wybiera przewodniczącego rady.',
    difficulty: 'medium',
    tags: ['rada wierzycieli', 'pierwsze posiedzenie', 'syndyk']
  },

  {
    id: 'pu-240',
    article: 'Podsumowanie',
    articleTitle: 'Kluczowe liczby - finalne zestawienie',
    section: 'Podsumowanie',
    subsection: 'Liczby do zapamiętania',
    question: 'Które zestawienie WSZYSTKICH podanych liczb jest PRAWIDŁOWE?',
    options: {
      a: 'Skład rady: 3+1, sprawozdania syndyka: co miesiąc, zaliczki: 50% łącznie',
      b: 'Skład rady: 5+2, sprawozdania syndyka: co 3 miesiące, zaliczki: do 75% w 4 ratach (10+25+15+25%), grzywna dla syndyka: 1.000-30.000 zł',
      c: 'Skład rady: 7+3, sprawozdania syndyka: co 6 miesięcy, zaliczki: 90% łącznie',
      d: 'Skład rady: 4+2, sprawozdania syndyka: co 2 miesiące, zaliczki: 80% łącznie'
    },
    correct: 'b',
    explanation: 'Prawidłowe zestawienie: rada wierzycieli 5 członków + 2 zastępców (art. 202 § 1), sprawozdania syndyka co 3 miesiące (art. 168 § 1), zaliczki na wynagrodzenie do 75% w 4 ratach: 10+25+15+25% (art. 164 § 1), grzywna dla syndyka 1.000-30.000 zł (art. 169a § 2).',
    difficulty: 'hard',
    tags: ['podsumowanie', 'wszystkie liczby']
  }

];

// ============================================================
// EKSPORT I STATYSTYKI
// ============================================================

export const PRAWO_UPADLOSCIOWE_PART3_STATS = {
  totalQuestions: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.length,
  byDifficulty: {
    easy: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.difficulty === 'easy').length,
    medium: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.difficulty === 'medium').length,
    hard: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.difficulty === 'hard').length,
  },
  bySection: {
    syndykKwalifikacje: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('kwalifikacje') || q.tags.includes('licencja')).length,
    syndykOdpowiedzialnosc: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('odpowiedzialność')).length,
    syndykWynagrodzenie: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('wynagrodzenie syndyka') || q.tags.includes('zaliczki')).length,
    sedziaKomisarz: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('sędzia-komisarz')).length,
    zgromadzenieWierzycieli: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('zgromadzenie wierzycieli')).length,
    radaWierzycieli: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('rada wierzycieli')).length,
    miedzynarodowe: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('COMI') || q.tags.includes('jurysdykcja')).length,
    porownania: PRAWO_UPADLOSCIOWE_EXAM_QUESTIONS_PART3.filter(q => q.tags.includes('porównanie') || q.tags.includes('zestawienie')).length,
  },
  keyNumbers: {
    // Syndyk - kwalifikacje
    kwalifikowanyDoradca: 'wymagany przy 250+ pracownikach, 50 mln euro obrotu, 43 mln euro aktywów',
    
    // Syndyk - wynagrodzenie
    wynagrodzenieGranice: '2x do 260x podstawy wynagrodzenia',
    czesciSkladowe: '5 części',
    uznaniowaCzesc: 'do 70 podstaw',
    zaliczkiLacznie: 'do 75%',
    zaliczkiRaty: '10% + 25% + 15% + 25%',
    
    // Syndyk - nadzór i sankcje
    sprawozdania: 'co 3 miesiące',
    grzywna: '1.000 - 30.000 zł',
    
    // Rada wierzycieli
    skladRady: '5 członków + 2 zastępców',
    skladRadyMala: '3 członków przy < 7 wierzycielach',
    progUstanowieniaRady: '1/5 sumy wierzytelności',
    progPowolaniaCzlonka: '1/5 sumy wierzytelności',
    zmianaSyndyka: 'uchwała 4 z 5 członków',
    wynagrodzenieCzlonka: 'do 3% przeciętnego wynagrodzenia/dzień',
    czynnosciNiezwloczne: 'do 10.000 zł bez zezwolenia',
    ruchomosciBezZezwolenia: 'do 50.000 zł wartości',
    
    // Zgromadzenie wierzycieli
    progZwolania: '1/3 sumy wierzytelności (2+ wierzycieli)',
    obwieszczenie: 'min. 2 tygodnie przed terminem',
    uchwalyZwykle: '1/5 sumy wierzytelności',
    wylaczenieMienia: '2/3 sumy wierzytelności',
    
    // Terminy syndyka
    spisInwentarza: '30 dni',
    likwidacja: '6 miesięcy',
    terminWniosekWynagrodzenie: 'tydzień',
    
    // Terminy procesowe
    zazalenieNaSK: 'tydzień',
    zarzutyDoUchwalyRady: 'tydzień',
    wykonanieUchwalyRady: '2 tygodnie od przekazania SK',
    uchylenieUchwalyZUrzedu: '2 tygodnie',
    zarzutyDoSprawozdania: '30 dni',
    odmowaUznania: '2 miesiące',
    odstapienieOdZapisu: '30 dni',
    doreczenePoczty: '30 dni od doręczenia syndykowi',
    
    // Prowadzenie przedsiębiorstwa
    prowadzenieBezZgody: '3 miesiące',
  }
};

console.log('Prawo upadłościowe Part 3 loaded:', PRAWO_UPADLOSCIOWE_PART3_STATS);
