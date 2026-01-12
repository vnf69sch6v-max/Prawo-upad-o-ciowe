import { ExamQuestion } from '../ksh/ksh-exam-questions';
type Question = { id: string; text: string; answers: { id: string; text: string }[]; correctAnswer: string; explanation: string; articleReference: string; };

/**
 * PRAWO UPADŁOŚCIOWE - PYTANIA EGZAMINACYJNE CZĘŚĆ 3
 * Źródło: Dz.U.2025.614 t.j. - Ustawa z dnia 28 lutego 2003 r. Prawo upadłościowe
 * 
 * Zakres tematyczny Part 3 (pu-161 do pu-240):
 * - Przepisy ogólne postępowania po ogłoszeniu (Art. 214-235)
 * - Międzynarodowe postępowanie upadłościowe (Art. 378-417)
 * - Odrębne postępowania upadłościowe (Art. 426-491)
 * - Przepisy karne (Art. 522-523)
 * - Szczegółowe przepisy proceduralne i uzupełniające
 */

export const prawoUpadlosciowePart3Questions: Question[] = [
  // =====================================================
  // PRZEPISY OGÓLNE POSTĘPOWANIA PO OGŁOSZENIU (Art. 214-235)
  // =====================================================
  {
    id: "pu-161",
    text: "Sąd w postępowaniu upadłościowym orzeka:",
    answers: [
      { id: "a", text: "Zawsze na rozprawie" },
      { id: "b", text: "Na posiedzeniu niejawnym, jeżeli ustawa nie stanowi inaczej" },
      { id: "c", text: "Wyłącznie po przeprowadzeniu postępowania dowodowego" },
      { id: "d", text: "Na wniosek syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 214 stanowi, że sąd orzeka na posiedzeniu niejawnym, jeżeli ustawa nie stanowi inaczej. Jest to zasada ogólna postępowania upadłościowego.",
    articleReference: "Art. 214"
  },
  {
    id: "pu-162",
    text: "W razie ogłoszenia upadłości wszystkich wspólników spółki cywilnej sąd może:",
    answers: [
      { id: "a", text: "Umorzyć wszystkie postępowania" },
      { id: "b", text: "Połączyć do łącznego rozpoznania sprawy upadłościowe prowadzone wobec wspólników" },
      { id: "c", text: "Wyznaczyć jednego syndyka dla każdego wspólnika osobno" },
      { id: "d", text: "Przekazać sprawy do sądu okręgowego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 215 § 1 stanowi, że w razie ogłoszenia upadłości wszystkich wspólników spółki cywilnej sąd może połączyć do łącznego rozpoznania sprawy upadłościowe prowadzone wobec wspólników tej spółki.",
    articleReference: "Art. 215 § 1"
  },
  {
    id: "pu-163",
    text: "W postępowaniu upadłościowym pisma procesowe i dokumenty wnosi się:",
    answers: [
      { id: "a", text: "Wyłącznie w formie papierowej" },
      { id: "b", text: "Wyłącznie za pośrednictwem systemu teleinformatycznego obsługującego postępowanie sądowe" },
      { id: "c", text: "W dowolnej formie wybranej przez stronę" },
      { id: "d", text: "Przez syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 216a § 1 stanowi, że w postępowaniu upadłościowym pisma procesowe oraz dokumenty wnosi się wyłącznie za pośrednictwem systemu teleinformatycznego obsługującego postępowanie sądowe z wykorzystaniem udostępnianych formularzy.",
    articleReference: "Art. 216a § 1"
  },
  {
    id: "pu-164",
    text: "Pisma niewniesione za pośrednictwem systemu teleinformatycznego:",
    answers: [
      { id: "a", text: "Są traktowane jako złożone z uchybieniem terminu" },
      { id: "b", text: "Nie wywołują skutków prawnych, jakie ustawa wiąże z wniesieniem pisma" },
      { id: "c", text: "Są przyjmowane ale obciążone dodatkową opłatą" },
      { id: "d", text: "Muszą być ponownie przesłane przez syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 216a § 1 stanowi, że pisma oraz dokumenty niewniesione za pośrednictwem systemu teleinformatycznego nie wywołują skutków prawnych, jakie ustawa wiąże z wniesieniem pisma albo dokumentu do sądu.",
    articleReference: "Art. 216a § 1"
  },
  {
    id: "pu-165",
    text: "Sędzia-komisarz może prowadzić dowód z opinii biegłego sporządzonej w innym postępowaniu:",
    answers: [
      { id: "a", text: "Nigdy - zawsze wymagana jest nowa opinia" },
      { id: "b", text: "Tak, może odstąpić od przeprowadzenia nowego dowodu, jeżeli biegły sporządził opinię w innym postępowaniu" },
      { id: "c", text: "Tylko za zgodą stron" },
      { id: "d", text: "Tylko jeżeli opinia nie jest starsza niż 6 miesięcy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 259 § 1a stanowi, że sędzia-komisarz może odstąpić od przeprowadzenia dowodu z zeznań świadka lub opinii biegłego, jeżeli świadek złożył zeznania albo biegły sporządził opinię w innym postępowaniu.",
    articleReference: "Art. 259 § 1a"
  },
  {
    id: "pu-166",
    text: "Postanowienia sędziego-komisarza doręcza się:",
    answers: [
      { id: "a", text: "Wszystkim wierzycielom listem poleconym" },
      { id: "b", text: "Wyłącznie upadłemu i syndykowi" },
      { id: "c", text: "Przez obwieszczenie, chyba że ustawa stanowi inaczej" },
      { id: "d", text: "Przez kuriera sądowego" }
    ],
    correctAnswer: "c",
    explanation: "Art. 220 § 1 stanowi, że postanowienia sędziego-komisarza doręcza się przez obwieszczenie, chyba że ustawa stanowi inaczej. Jest to podstawowy sposób doręczeń w postępowaniu upadłościowym.",
    articleReference: "Art. 220 § 1"
  },
  {
    id: "pu-167",
    text: "Zażalenie na postanowienie sędziego-komisarza wnosi się w terminie:",
    answers: [
      { id: "a", text: "3 dni od doręczenia" },
      { id: "b", text: "Tygodnia od dnia doręczenia albo obwieszczenia" },
      { id: "c", text: "Dwóch tygodni od dnia obwieszczenia" },
      { id: "d", text: "Miesiąca od dnia postanowienia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 224 stanowi, że termin do wniesienia środka odwoławczego biegnie od dnia doręczenia albo obwieszczenia, a jeżeli doręczenie następuje równocześnie z obwieszczeniem - od dnia obwieszczenia. Standardowy termin na zażalenie to tydzień.",
    articleReference: "Art. 222 § 1, Art. 224"
  },
  {
    id: "pu-168",
    text: "Koszty postępowania upadłościowego obejmują:",
    answers: [
      { id: "a", text: "Tylko wynagrodzenie syndyka" },
      { id: "b", text: "Wydatki bezpośrednio związane z zabezpieczeniem, zarządem i likwidacją masy upadłości oraz wynagrodzenie syndyka" },
      { id: "c", text: "Tylko opłaty sądowe" },
      { id: "d", text: "Wyłącznie koszty ogłoszeń" }
    ],
    correctAnswer: "b",
    explanation: "Art. 230 stanowi, że do kosztów postępowania zalicza się wydatki bezpośrednio związane z zabezpieczeniem, zarządem i likwidacją masy upadłości, wynagrodzenie syndyka oraz inne koszty wymienione w ustawie.",
    articleReference: "Art. 230"
  },
  {
    id: "pu-169",
    text: "Koszty postępowania upadłościowego pokrywa się:",
    answers: [
      { id: "a", text: "Z majątku wierzycieli" },
      { id: "b", text: "Z masy upadłości" },
      { id: "c", text: "Ze środków Skarbu Państwa" },
      { id: "d", text: "Z funduszy gwarancyjnych" }
    ],
    correctAnswer: "b",
    explanation: "Art. 231 § 1 stanowi, że koszty postępowania upadłościowego pokrywa się z masy upadłości. Jest to jedna z podstawowych zasad postępowania.",
    articleReference: "Art. 231 § 1"
  },
  {
    id: "pu-170",
    text: "Wierzyciel zgłaszający wierzytelność po terminie uiszcza zryczałtowane koszty w wysokości:",
    answers: [
      { id: "a", text: "100 zł" },
      { id: "b", text: "Równowartości 15% przeciętnego miesięcznego wynagrodzenia" },
      { id: "c", text: "500 zł" },
      { id: "d", text: "1000 zł" }
    ],
    correctAnswer: "b",
    explanation: "Art. 235 § 1 stanowi, że wierzyciel, który zgłosił wierzytelność po upływie terminu, uiszcza zryczałtowane koszty postępowania upadłościowego wynikłe z tego zgłoszenia w wysokości stanowiącej równowartość 15% przeciętnego miesięcznego wynagrodzenia.",
    articleReference: "Art. 235 § 1"
  },
  {
    id: "pu-171",
    text: "Od postanowień sądu upadłościowego wydanych w wyniku rozpoznania zażalenia przysługuje:",
    answers: [
      { id: "a", text: "Apelacja do sądu okręgowego" },
      { id: "b", text: "Skarga kasacyjna, jeżeli ustawa tak stanowi" },
      { id: "c", text: "Zawsze skarga kasacyjna" },
      { id: "d", text: "Żaden środek odwoławczy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 223 stanowi, że skarga kasacyjna przysługuje na postanowienie sądu drugiej instancji wydane w wyniku rozpoznania zażalenia na postanowienie sędziego-komisarza, tylko jeżeli przepis szczególny tak stanowi.",
    articleReference: "Art. 223"
  },

  // =====================================================
  // MIĘDZYNARODOWE POSTĘPOWANIE UPADŁOŚCIOWE (Art. 378-417)
  // =====================================================
  {
    id: "pu-172",
    text: "Przepisy o międzynarodowym postępowaniu upadłościowym stosuje się, gdy:",
    answers: [
      { id: "a", text: "Dłużnik jest obywatelem innego państwa" },
      { id: "b", text: "Główny ośrodek podstawowej działalności dłużnika znajduje się za granicą lub dłużnik ma majątek w więcej niż jednym państwie" },
      { id: "c", text: "Wierzyciele są z zagranicy" },
      { id: "d", text: "Umowa była zawarta za granicą" }
    ],
    correctAnswer: "b",
    explanation: "Art. 378 stanowi, że przepisy o międzynarodowym postępowaniu upadłościowym stosuje się, gdy główny ośrodek podstawowej działalności dłużnika znajduje się za granicą lub gdy dłużnik ma majątek w więcej niż jednym państwie.",
    articleReference: "Art. 378"
  },
  {
    id: "pu-173",
    text: "Główny ośrodek podstawowej działalności (COMI) to miejsce:",
    answers: [
      { id: "a", text: "Siedziby statutowej dłużnika" },
      { id: "b", text: "Gdzie dłużnik regularnie zarządza swoją działalnością i które jest rozpoznawalne dla osób trzecich" },
      { id: "c", text: "Zamieszkania właściciela" },
      { id: "d", text: "Największego zakładu produkcyjnego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 379 pkt 13 definiuje główny ośrodek podstawowej działalności jako miejsce, w którym dłużnik regularnie zarządza swoją działalnością o charakterze ekonomicznym i które jest jako takie rozpoznawalne dla osób trzecich.",
    articleReference: "Art. 379 pkt 13"
  },
  {
    id: "pu-174",
    text: "Główne postępowanie upadłościowe może być wszczęte w Polsce, jeżeli:",
    answers: [
      { id: "a", text: "Dłużnik ma jakikolwiek majątek w Polsce" },
      { id: "b", text: "Główny ośrodek podstawowej działalności dłużnika znajduje się w Polsce" },
      { id: "c", text: "Wierzyciel złoży wniosek w Polsce" },
      { id: "d", text: "Dłużnik prowadzi w Polsce działalność gospodarczą" }
    ],
    correctAnswer: "b",
    explanation: "Art. 382 stanowi, że główne postępowanie upadłościowe może być wszczęte w Polsce, jeżeli główny ośrodek podstawowej działalności dłużnika znajduje się w Rzeczypospolitej Polskiej.",
    articleReference: "Art. 382"
  },
  {
    id: "pu-175",
    text: "Wtórne (uboczne) postępowanie upadłościowe może być wszczęte w Polsce, jeżeli:",
    answers: [
      { id: "a", text: "Główne postępowanie toczy się za granicą, a dłużnik posiada w Polsce oddział lub prowadzi działalność gospodarczą" },
      { id: "b", text: "Dłużnik ma obywatelstwo polskie" },
      { id: "c", text: "Wierzyciele mają siedzibę w Polsce" },
      { id: "d", text: "Umowa podlega prawu polskiemu" }
    ],
    correctAnswer: "a",
    explanation: "Art. 383 stanowi, że wtórne postępowanie upadłościowe może być wszczęte w Polsce, jeżeli główne postępowanie jest prowadzone w innym państwie, a dłużnik posiada w Rzeczypospolitej Polskiej oddział lub prowadzi działalność gospodarczą inną niż prowadzona przez oddział.",
    articleReference: "Art. 383"
  },
  {
    id: "pu-176",
    text: "Zarządca zagraniczny może wykonywać w Polsce uprawnienia, jeżeli:",
    answers: [
      { id: "a", text: "Ma polskie obywatelstwo" },
      { id: "b", text: "Przedstawi uwierzytelniony odpis orzeczenia o powołaniu lub zaświadczenie sądu państwa wszczęcia postępowania" },
      { id: "c", text: "Uzyska zgodę Ministra Sprawiedliwości" },
      { id: "d", text: "Zna język polski" }
    ],
    correctAnswer: "b",
    explanation: "Art. 392 stanowi, że zarządca zagraniczny może wykonywać w Polsce uprawnienia przysługujące mu zgodnie z prawem państwa wszczęcia postępowania, jeżeli przedstawi uwierzytelniony odpis orzeczenia o powołaniu lub zaświadczenie sądu państwa wszczęcia postępowania.",
    articleReference: "Art. 392"
  },
  {
    id: "pu-177",
    text: "Zagraniczne postępowanie upadłościowe jest uznawane w Polsce:",
    answers: [
      { id: "a", text: "Po przeprowadzeniu postępowania delibacyjnego" },
      { id: "b", text: "Z mocy prawa, bez potrzeby przeprowadzania odrębnego postępowania" },
      { id: "c", text: "Po zatwierdzeniu przez Sąd Najwyższy" },
      { id: "d", text: "Na wniosek Ministra Spraw Zagranicznych" }
    ],
    correctAnswer: "b",
    explanation: "Art. 391 § 1 stanowi, że wszczęcie głównego lub wtórnego zagranicznego postępowania upadłościowego jest uznawane w Rzeczypospolitej Polskiej z mocy prawa, bez potrzeby przeprowadzania odrębnego postępowania.",
    articleReference: "Art. 391 § 1"
  },
  {
    id: "pu-178",
    text: "Skutki zagranicznego postępowania upadłościowego w Polsce mogą być wyłączone, jeżeli:",
    answers: [
      { id: "a", text: "Wierzyciel polski złoży wniosek" },
      { id: "b", text: "Uznanie byłoby sprzeczne z podstawowymi zasadami porządku prawnego RP" },
      { id: "c", text: "Dłużnik nie ma majątku w Polsce" },
      { id: "d", text: "Postępowanie trwa dłużej niż rok" }
    ],
    correctAnswer: "b",
    explanation: "Art. 391 § 2 stanowi, że odmawia się w Rzeczypospolitej Polskiej uznania zagranicznego postępowania upadłościowego lub wykonania wydanych w nim orzeczeń, jeżeli uznanie lub wykonanie byłoby oczywiście sprzeczne z podstawowymi zasadami porządku prawnego RP.",
    articleReference: "Art. 391 § 2"
  },

  // =====================================================
  // ODRĘBNE POSTĘPOWANIA - BANKI (Art. 426-450a)
  // =====================================================
  {
    id: "pu-179",
    text: "Wniosek o ogłoszenie upadłości banku może złożyć:",
    answers: [
      { id: "a", text: "Każdy wierzyciel banku" },
      { id: "b", text: "Wyłącznie Komisja Nadzoru Finansowego lub Bankowy Fundusz Gwarancyjny" },
      { id: "c", text: "Zarząd banku lub rada nadzorcza" },
      { id: "d", text: "Narodowy Bank Polski" }
    ],
    correctAnswer: "b",
    explanation: "Art. 426 stanowi, że wniosek o ogłoszenie upadłości banku może złożyć wyłącznie Komisja Nadzoru Finansowego lub w przypadkach określonych w ustawie - Bankowy Fundusz Gwarancyjny.",
    articleReference: "Art. 426"
  },
  {
    id: "pu-180",
    text: "Ogłoszenie upadłości banku:",
    answers: [
      { id: "a", text: "Powoduje natychmiastowe rozwiązanie wszystkich umów bankowych" },
      { id: "b", text: "Nie ma wpływu na istnienie organów banku" },
      { id: "c", text: "Powoduje wygaśnięcie mandatów członków zarządu i rady nadzorczej banku" },
      { id: "d", text: "Wymaga zgody NBP" }
    ],
    correctAnswer: "c",
    explanation: "Art. 433 stanowi, że z dniem ogłoszenia upadłości banku wygasają mandaty członków zarządu, rady nadzorczej, komisji rewizyjnej oraz prokury. Organem reprezentującym bank staje się syndyk.",
    articleReference: "Art. 433"
  },
  {
    id: "pu-181",
    text: "W upadłości banku hipotecznego tworzy się:",
    answers: [
      { id: "a", text: "Tylko jedną masę upadłości" },
      { id: "b", text: "Osobną masę upadłości dla zabezpieczenia praw posiadaczy listów zastawnych" },
      { id: "c", text: "Trzy odrębne masy upadłości" },
      { id: "d", text: "Fundusz kompensacyjny" }
    ],
    correctAnswer: "b",
    explanation: "Art. 442 stanowi, że w przypadku ogłoszenia upadłości banku hipotecznego wyodrębnia się osobną masę upadłości, która służy zaspokojeniu roszczeń wierzycieli z tytułu listów zastawnych.",
    articleReference: "Art. 442"
  },
  {
    id: "pu-182",
    text: "W upadłości banku hipotecznego dla reprezentowania praw posiadaczy listów zastawnych sąd ustanawia:",
    answers: [
      { id: "a", text: "Syndyka masy szczególnej" },
      { id: "b", text: "Kuratora" },
      { id: "c", text: "Zarządcę przymusowego" },
      { id: "d", text: "Pełnomocnika procesowego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 443 stanowi, że sąd ustanawia kuratora dla reprezentowania praw posiadaczy listów zastawnych. Kurator reprezentuje interesy tej grupy wierzycieli w postępowaniu.",
    articleReference: "Art. 443"
  },

  // =====================================================
  // ODRĘBNE POSTĘPOWANIA - ZAKŁADY UBEZPIECZEŃ (Art. 471-481)
  // =====================================================
  {
    id: "pu-183",
    text: "Wniosek o ogłoszenie upadłości zakładu ubezpieczeń może złożyć:",
    answers: [
      { id: "a", text: "Każdy ubezpieczony" },
      { id: "b", text: "Wyłącznie organ nadzoru (KNF)" },
      { id: "c", text: "Ubezpieczyciel" },
      { id: "d", text: "Rzecznik Finansowy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 471 stanowi, że wniosek o ogłoszenie upadłości zakładu ubezpieczeń może złożyć wyłącznie organ nadzoru, czyli Komisja Nadzoru Finansowego.",
    articleReference: "Art. 471"
  },
  {
    id: "pu-184",
    text: "W upadłości zakładu ubezpieczeń dla reprezentowania praw ubezpieczonych ustanawia się:",
    answers: [
      { id: "a", text: "Syndyka" },
      { id: "b", text: "Kuratora" },
      { id: "c", text: "Nadzorcę sądowego" },
      { id: "d", text: "Radę ubezpieczonych" }
    ],
    correctAnswer: "b",
    explanation: "Art. 473 stanowi, że w postępowaniu upadłościowym wobec zakładu ubezpieczeń sąd ustanawia kuratora dla reprezentowania praw ubezpieczonych oraz innych osób uprawnionych z umów ubezpieczenia.",
    articleReference: "Art. 473"
  },
  {
    id: "pu-185",
    text: "W upadłości zakładu ubezpieczeń tworzy się:",
    answers: [
      { id: "a", text: "Tylko jedną masę upadłości" },
      { id: "b", text: "Osobną masę upadłości obejmującą aktywa stanowiące pokrycie rezerw techniczno-ubezpieczeniowych" },
      { id: "c", text: "Dwie masy upadłości - dla ubezpieczeń na życie i majątkowych" },
      { id: "d", text: "Fundusz kompensacyjny" }
    ],
    correctAnswer: "b",
    explanation: "Art. 477 stanowi, że w przypadku ogłoszenia upadłości zakładu ubezpieczeń wyodrębnia się osobną masę upadłości obejmującą aktywa stanowiące pokrycie rezerw techniczno-ubezpieczeniowych.",
    articleReference: "Art. 477"
  },

  // =====================================================
  // ODRĘBNE POSTĘPOWANIA - DEWELOPERZY (Art. 425a-425s)
  // =====================================================
  {
    id: "pu-186",
    text: "W przypadku upadłości dewelopera nabywcy lokali mieszkalnych:",
    answers: [
      { id: "a", text: "Tracą wszystkie prawa do lokali" },
      { id: "b", text: "Tworzą odrębną kategorię wierzycieli i mogą kontynuować inwestycję" },
      { id: "c", text: "Mają prawo do pełnego zwrotu wpłaconych środków w pierwszej kolejności" },
      { id: "d", text: "Muszą złożyć pozew cywilny" }
    ],
    correctAnswer: "b",
    explanation: "Art. 425c i następne regulują szczególną sytuację nabywców w upadłości dewelopera - mogą oni utworzyć zgromadzenie nabywców i podjąć decyzję o kontynuowaniu przedsięwzięcia deweloperskiego.",
    articleReference: "Art. 425c-425s"
  },
  {
    id: "pu-187",
    text: "W upadłości dewelopera sędzia-komisarz może postanowić o:",
    answers: [
      { id: "a", text: "Przymusowym wykupie lokali przez gminę" },
      { id: "b", text: "Dalszym prowadzeniu przedsięwzięcia deweloperskiego" },
      { id: "c", text: "Natychmiastowym wyburzeniu budynku" },
      { id: "d", text: "Przekazaniu inwestycji Skarbowi Państwa" }
    ],
    correctAnswer: "b",
    explanation: "Art. 425e stanowi, że sędzia-komisarz może postanowić o dalszym prowadzeniu przedsięwzięcia deweloperskiego, jeżeli rachunek ekonomiczny wskazuje na możliwość jego ukończenia.",
    articleReference: "Art. 425e"
  },
  {
    id: "pu-188",
    text: "Nabywcy lokali w upadłości dewelopera głosują nad propozycjami układowymi:",
    answers: [
      { id: "a", text: "Na zgromadzeniu wierzycieli razem z innymi wierzycielami" },
      { id: "b", text: "Na odrębnym zgromadzeniu nabywców" },
      { id: "c", text: "Korespondencyjnie" },
      { id: "d", text: "Przez pełnomocnika wyznaczonego przez sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 425q stanowi, że nabywcy głosują nad propozycjami układowymi na zgromadzeniu nabywców zwołanym przez sędziego-komisarza.",
    articleReference: "Art. 425q"
  },

  // =====================================================
  // ODRĘBNE POSTĘPOWANIA - EMITENCI OBLIGACJI (Art. 482-491)
  // =====================================================
  {
    id: "pu-189",
    text: "W upadłości emitenta obligacji dla reprezentowania praw obligatariuszy sąd ustanawia:",
    answers: [
      { id: "a", text: "Syndyka masy szczególnej" },
      { id: "b", text: "Kuratora" },
      { id: "c", text: "Administratora hipoteki" },
      { id: "d", text: "Zgromadzenie obligatariuszy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 484 stanowi, że sąd ustanawia kuratora do reprezentowania praw obligatariuszy. Kurator działa w interesie wszystkich posiadaczy obligacji.",
    articleReference: "Art. 484"
  },
  {
    id: "pu-190",
    text: "W przypadku emisji obligacji zabezpieczonych hipoteką, w upadłości emitenta tworzy się:",
    answers: [
      { id: "a", text: "Tylko jedną masę upadłości" },
      { id: "b", text: "Osobną masę upadłości obejmującą przedmiot zabezpieczenia" },
      { id: "c", text: "Trzy masy upadłości" },
      { id: "d", text: "Fundusz gwarancyjny" }
    ],
    correctAnswer: "b",
    explanation: "Art. 488 stanowi, że w przypadku gdy obligacje były zabezpieczone hipoteką lub zastawem, wyodrębnia się osobną masę upadłości obejmującą przedmiot zabezpieczenia.",
    articleReference: "Art. 488"
  },

  // =====================================================
  // PRZEPISY KARNE (Art. 522-523)
  // =====================================================
  {
    id: "pu-191",
    text: "Kto podaje we wniosku o ogłoszenie upadłości nieprawdziwe dane, podlega:",
    answers: [
      { id: "a", text: "Karze grzywny" },
      { id: "b", text: "Karze pozbawienia wolności do lat 5" },
      { id: "c", text: "Karze ograniczenia wolności albo pozbawienia wolności do lat 3" },
      { id: "d", text: "Tylko odpowiedzialności cywilnej" }
    ],
    correctAnswer: "c",
    explanation: "Art. 522 stanowi, że kto będąc dłużnikiem, podaje we wniosku o ogłoszenie upadłości nieprawdziwe dane lub zataja prawdziwe dane, podlega karze ograniczenia wolności albo pozbawienia wolności do lat 3.",
    articleReference: "Art. 522"
  },
  {
    id: "pu-192",
    text: "Kto nie wydaje syndykowi majątku wchodzącego do masy upadłości, podlega:",
    answers: [
      { id: "a", text: "Tylko grzywnie" },
      { id: "b", text: "Karze pozbawienia wolności od roku do lat 5" },
      { id: "c", text: "Karze pozbawienia wolności do lat 3" },
      { id: "d", text: "Karze nagany" }
    ],
    correctAnswer: "c",
    explanation: "Art. 523 stanowi, że kto będąc upadłym albo jego reprezentantem nie wydaje syndykowi całego majątku wchodzącego do masy upadłości, ksiąg rachunkowych lub innych dokumentów, podlega karze pozbawienia wolności do lat 3.",
    articleReference: "Art. 523"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY UZUPEŁNIAJĄCE - MASA UPADŁOŚCI
  // =====================================================
  {
    id: "pu-193",
    text: "Do masy upadłości wchodzi majątek:",
    answers: [
      { id: "a", text: "Tylko majątek z dnia ogłoszenia upadłości" },
      { id: "b", text: "Majątek należący do upadłego w dniu ogłoszenia upadłości oraz nabyty w toku postępowania" },
      { id: "c", text: "Wyłącznie nieruchomości upadłego" },
      { id: "d", text: "Majątek wspólników upadłego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 62 stanowi, że w skład masy upadłości wchodzi majątek należący do upadłego w dniu ogłoszenia upadłości oraz nabyty przez upadłego w toku postępowania upadłościowego.",
    articleReference: "Art. 62"
  },
  {
    id: "pu-194",
    text: "Z masy upadłości osoby fizycznej wyłącza się część dochodu odpowiadającą:",
    answers: [
      { id: "a", text: "100% kryterium dochodowego z pomocy społecznej" },
      { id: "b", text: "150% kryterium dochodowego (osoby samotne) lub iloczynowi 150% na każdego członka rodziny" },
      { id: "c", text: "Minimalnemu wynagrodzeniu" },
      { id: "d", text: "Średniemu wynagrodzeniu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 63 § 1a stanowi, że z masy upadłości wyłącza się część dochodu upadłego będącego osobą fizyczną, która łącznie z dochodami wyłączonymi odpowiada kwocie stanowiącej 150% kwoty kryterium dochodowego dla osoby samotnej lub iloczyn tej kwoty i liczby osób w rodzinie.",
    articleReference: "Art. 63 § 1a"
  },
  {
    id: "pu-195",
    text: "Jeżeli upadły jest współwłaścicielem rzeczy, do masy upadłości wchodzi:",
    answers: [
      { id: "a", text: "Cała rzecz" },
      { id: "b", text: "Udział upadłego we współwłasności" },
      { id: "c", text: "Nic - współwłasność wyklucza z masy" },
      { id: "d", text: "Połowa wartości rzeczy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 72 stanowi, że jeżeli upadły jest współwłaścicielem rzeczy lub prawa, do masy upadłości wchodzi udział upadłego we współwłasności. Na wniosek syndyka sąd może zarządzić sprzedaż całej rzeczy.",
    articleReference: "Art. 72"
  },
  {
    id: "pu-196",
    text: "Czynności prawne upadłego dotyczące mienia wchodzącego do masy upadłości, dokonane po ogłoszeniu upadłości, są:",
    answers: [
      { id: "a", text: "Ważne" },
      { id: "b", text: "Nieważne" },
      { id: "c", text: "Zawieszone do zakończenia postępowania" },
      { id: "d", text: "Skuteczne wobec syndyka po zatwierdzeniu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 77 § 1 stanowi, że czynności prawne upadłego dotyczące mienia wchodzącego do masy upadłości są nieważne. Przepis ten chroni masę upadłości przed uszczupleniem.",
    articleReference: "Art. 77 § 1"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - SKUTKI CO DO ZOBOWIĄZAŃ
  // =====================================================
  {
    id: "pu-197",
    text: "Postanowienia umowy zastrzegające na wypadek ogłoszenia upadłości zmianę lub rozwiązanie stosunku prawnego (klauzule ipso facto) są:",
    answers: [
      { id: "a", text: "Ważne i skuteczne" },
      { id: "b", text: "Nieważne" },
      { id: "c", text: "Skuteczne za zgodą syndyka" },
      { id: "d", text: "Skuteczne po zatwierdzeniu przez sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 83 stanowi, że nieważne są postanowienia umowy zastrzegające na wypadek ogłoszenia upadłości zmianę lub rozwiązanie stosunku prawnego, którego stroną jest upadły. Jest to tzw. zakaz klauzul ipso facto.",
    articleReference: "Art. 83"
  },
  {
    id: "pu-198",
    text: "Zobowiązania majątkowe niepieniężne z dniem ogłoszenia upadłości:",
    answers: [
      { id: "a", text: "Wygasają" },
      { id: "b", text: "Zmieniają się w zobowiązania pieniężne" },
      { id: "c", text: "Są zawieszane" },
      { id: "d", text: "Pozostają bez zmian" }
    ],
    correctAnswer: "b",
    explanation: "Art. 91 § 2 stanowi, że zobowiązania majątkowe niepieniężne zmieniają się z dniem ogłoszenia upadłości w zobowiązania pieniężne i z tym dniem stają się wymagalne, chociażby termin ich wykonania jeszcze nie nastąpił.",
    articleReference: "Art. 91 § 2"
  },
  {
    id: "pu-199",
    text: "Najem lub dzierżawa nieruchomości upadłego:",
    answers: [
      { id: "a", text: "Wygasa z dniem ogłoszenia upadłości" },
      { id: "b", text: "Może być wypowiedziany przez syndyka lub najemcę/dzierżawcę z zachowaniem 3-miesięcznego terminu" },
      { id: "c", text: "Trwa do końca umówionego okresu" },
      { id: "d", text: "Może być rozwiązany tylko przez sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 109 § 1 stanowi, że jeżeli przedmiotem najmu lub dzierżawy jest nieruchomość, w której prowadzone było przedsiębiorstwo upadłego, syndyk może wypowiedzieć umowę z zachowaniem trzymiesięcznego terminu. Analogiczne prawo przysługuje najemcy/dzierżawcy.",
    articleReference: "Art. 109 § 1"
  },
  {
    id: "pu-200",
    text: "Umowa zlecenia, której wykonanie zależy od osobistych przymiotów upadłego:",
    answers: [
      { id: "a", text: "Trwa nadal" },
      { id: "b", text: "Może być kontynuowana przez syndyka" },
      { id: "c", text: "Wygasa z dniem ogłoszenia upadłości" },
      { id: "d", text: "Wymaga zatwierdzenia przez sąd" }
    ],
    correctAnswer: "c",
    explanation: "Art. 102 § 2 stanowi, że umowa zlecenia, w której upadły jest przyjmującym zlecenie, a której wykonanie zależy od osobistych przymiotów upadłego, wygasa z dniem ogłoszenia upadłości.",
    articleReference: "Art. 102 § 2"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - UMOWY WZAJEMNE
  // =====================================================
  {
    id: "pu-201",
    text: "Jeżeli syndyk nie złoży oświadczenia w terminie 3 miesięcy od żądania drugiej strony umowy wzajemnej:",
    answers: [
      { id: "a", text: "Umowa jest kontynuowana" },
      { id: "b", text: "Uznaje się, że syndyk odstąpił od umowy" },
      { id: "c", text: "Sąd wydaje postanowienie" },
      { id: "d", text: "Umowa wygasa z mocy prawa" }
    ],
    correctAnswer: "b",
    explanation: "Art. 98 § 2 stanowi, że jeżeli syndyk nie złoży oświadczenia w terminie trzech miesięcy od dnia otrzymania żądania, uważa się, że odstąpił od umowy.",
    articleReference: "Art. 98 § 2"
  },
  {
    id: "pu-202",
    text: "Roszczenie drugiej strony o odszkodowanie z powodu niewykonania umowy przez syndyka:",
    answers: [
      { id: "a", text: "Jest wyłączone" },
      { id: "b", text: "Może być zgłoszone do masy upadłości" },
      { id: "c", text: "Wymaga osobnego powództwa" },
      { id: "d", text: "Jest zaspokajane poza postępowaniem" }
    ],
    correctAnswer: "b",
    explanation: "Art. 98 § 3 stanowi, że jeżeli syndyk odstąpił od umowy, druga strona nie ma prawa do świadczenia wzajemnego, lecz może dochodzić w postępowaniu upadłościowym należności z tytułu wykonania zobowiązania i naprawienia szkody.",
    articleReference: "Art. 98 § 3"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - POTRĄCENIE
  // =====================================================
  {
    id: "pu-203",
    text: "Potrącenie wierzytelności upadłego z wierzytelnością wierzyciela jest dopuszczalne, jeżeli obie wierzytelności istniały:",
    answers: [
      { id: "a", text: "W dniu złożenia wniosku o ogłoszenie upadłości" },
      { id: "b", text: "W dniu ogłoszenia upadłości, chociażby termin wymagalności jeszcze nie nastąpił" },
      { id: "c", text: "W dniu sporządzenia listy wierzytelności" },
      { id: "d", text: "W dniu wykonania planu podziału" }
    ],
    correctAnswer: "b",
    explanation: "Art. 93 § 1 stanowi, że potrącenie wierzytelności upadłego z wierzytelnością wierzyciela jest dopuszczalne, jeżeli obie wierzytelności istniały w dniu ogłoszenia upadłości, chociażby termin wymagalności jednej z nich jeszcze nie nastąpił.",
    articleReference: "Art. 93 § 1"
  },
  {
    id: "pu-204",
    text: "Potrącenie NIE jest dopuszczalne, jeżeli dłużnik upadłego nabył wierzytelność przez przelew lub indos:",
    answers: [
      { id: "a", text: "W ciągu roku przed ogłoszeniem upadłości" },
      { id: "b", text: "Po ogłoszeniu upadłości albo w ciągu roku przed ogłoszeniem, wiedząc o istnieniu podstawy do ogłoszenia upadłości" },
      { id: "c", text: "W ciągu 6 miesięcy przed ogłoszeniem upadłości" },
      { id: "d", text: "W dowolnym czasie przed ogłoszeniem upadłości" }
    ],
    correctAnswer: "b",
    explanation: "Art. 94 § 1 stanowi, że potrącenie nie jest dopuszczalne, jeżeli dłużnik upadłego nabył wierzytelność przez przelew lub indos po ogłoszeniu upadłości albo nabył ją w ciągu ostatniego roku przed dniem ogłoszenia upadłości, wiedząc o istnieniu podstawy do ogłoszenia upadłości.",
    articleReference: "Art. 94 § 1"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - BEZSKUTECZNOŚĆ CZYNNOŚCI
  // =====================================================
  {
    id: "pu-205",
    text: "Bezskuteczne z mocy prawa są czynności rozporządzające upadłego dokonane w ciągu roku przed dniem złożenia wniosku:",
    answers: [
      { id: "a", text: "Wszystkie odpłatne" },
      { id: "b", text: "Nieodpłatne lub odpłatne, ale rażąco niekorzystne dla upadłego" },
      { id: "c", text: "Tylko dotyczące nieruchomości" },
      { id: "d", text: "Tylko przekraczające 50 000 zł" }
    ],
    correctAnswer: "b",
    explanation: "Art. 127 § 1 stanowi, że bezskuteczne w stosunku do masy upadłości są czynności prawne dokonane przez upadłego w ciągu roku przed dniem złożenia wniosku o ogłoszenie upadłości, którymi rozporządził on swoim majątkiem, jeżeli dokonane zostały nieodpłatnie albo odpłatnie, ale wartość świadczenia przewyższa rażąco wartość świadczenia uzyskanego.",
    articleReference: "Art. 127 § 1"
  },
  {
    id: "pu-206",
    text: "Bezskuteczna w stosunku do masy jest zapłata długu niewymagalnego dokonana przez upadłego w ciągu:",
    answers: [
      { id: "a", text: "3 miesięcy przed złożeniem wniosku" },
      { id: "b", text: "6 miesięcy przed złożeniem wniosku" },
      { id: "c", text: "Roku przed złożeniem wniosku" },
      { id: "d", text: "2 lat przed złożeniem wniosku" }
    ],
    correctAnswer: "b",
    explanation: "Art. 127 § 3 stanowi, że bezskuteczna w stosunku do masy upadłości jest zapłata długu niewymagalnego dokonana przez upadłego w terminie sześciu miesięcy przed dniem złożenia wniosku o ogłoszenie upadłości.",
    articleReference: "Art. 127 § 3"
  },
  {
    id: "pu-207",
    text: "Czynności odpłatne z osobami bliskimi dokonane w ciągu 6 miesięcy przed złożeniem wniosku są bezskuteczne:",
    answers: [
      { id: "a", text: "Z mocy prawa" },
      { id: "b", text: "Na wniosek syndyka, chyba że druga strona wykaże, że nie doszło do pokrzywdzenia wierzycieli" },
      { id: "c", text: "Tylko jeśli przekraczają 100 000 zł" },
      { id: "d", text: "Nigdy nie są bezskuteczne" }
    ],
    correctAnswer: "b",
    explanation: "Art. 128 § 1 stanowi, że sędzia-komisarz na wniosek syndyka uznaje za bezskuteczną w stosunku do masy upadłości odpłatną czynność prawną dokonaną przez upadłego w terminie sześciu miesięcy przed dniem złożenia wniosku z małżonkiem, krewnym lub powinowatym, chyba że druga strona wykaże, że nie doszło do pokrzywdzenia wierzycieli.",
    articleReference: "Art. 128 § 1"
  },
  {
    id: "pu-208",
    text: "Powództwo o uznanie czynności za bezskuteczną może być wytoczone w terminie:",
    answers: [
      { id: "a", text: "Roku od dnia ogłoszenia upadłości" },
      { id: "b", text: "2 lat od dnia ogłoszenia upadłości" },
      { id: "c", text: "5 lat od dnia ogłoszenia upadłości" },
      { id: "d", text: "W każdym czasie do zakończenia postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 132 § 3 stanowi, że nie można żądać uznania czynności za bezskuteczną po upływie dwóch lat od dnia ogłoszenia upadłości, chyba że na podstawie przepisów Kodeksu cywilnego uprawnienie to wygasło wcześniej.",
    articleReference: "Art. 132 § 3"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - MAŁŻEŃSTWO
  // =====================================================
  {
    id: "pu-209",
    text: "Z dniem ogłoszenia upadłości jednego z małżonków powstaje:",
    answers: [
      { id: "a", text: "Wspólność majątkowa z syndykiem" },
      { id: "b", text: "Rozdzielność majątkowa z mocy prawa" },
      { id: "c", text: "Zarząd przymusowy nad majątkiem wspólnym" },
      { id: "d", text: "Zawieszenie wspólności do zakończenia postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 124 § 1 stanowi, że z dniem ogłoszenia upadłości jednego z małżonków powstaje między małżonkami rozdzielność majątkowa. Jest to skutek następujący z mocy prawa.",
    articleReference: "Art. 124 § 1"
  },
  {
    id: "pu-210",
    text: "Jeżeli małżonkowie pozostawali we wspólności majątkowej, majątek wspólny wchodzi do masy upadłości. Małżonek upadłego może:",
    answers: [
      { id: "a", text: "Sprzeciwić się włączeniu majątku wspólnego do masy" },
      { id: "b", text: "Dochodzić należności z tytułu udziału w majątku wspólnym zgłaszając wierzytelność" },
      { id: "c", text: "Żądać wyłączenia całego majątku wspólnego" },
      { id: "d", text: "Przejąć zarząd majątkiem wspólnym" }
    ],
    correctAnswer: "b",
    explanation: "Art. 124 § 3 stanowi, że małżonek upadłego może dochodzić w postępowaniu upadłościowym należności z tytułu udziału w majątku wspólnym, zgłaszając tę wierzytelność sędziemu-komisarzowi.",
    articleReference: "Art. 124 § 3"
  },
  {
    id: "pu-211",
    text: "Umowa majątkowa małżeńska ustanawiająca rozdzielność jest skuteczna wobec masy upadłości, jeżeli została zawarta:",
    answers: [
      { id: "a", text: "W ciągu roku przed złożeniem wniosku" },
      { id: "b", text: "Co najmniej 2 lata przed dniem złożenia wniosku o ogłoszenie upadłości" },
      { id: "c", text: "W formie aktu notarialnego" },
      { id: "d", text: "Za zgodą przyszłych wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Art. 126 § 1 stanowi, że ustanowienie rozdzielności majątkowej umową majątkową jest skuteczne w stosunku do masy upadłości tylko wtedy, gdy umowa zawarta została co najmniej dwa lata przed dniem złożenia wniosku o ogłoszenie upadłości.",
    articleReference: "Art. 126 § 1"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - KATEGORIE WIERZYTELNOŚCI
  // =====================================================
  {
    id: "pu-212",
    text: "Do kategorii pierwszej zaspokojenia należą:",
    answers: [
      { id: "a", text: "Wszystkie wierzytelności zabezpieczone hipoteką" },
      { id: "b", text: "Należności ze stosunku pracy, należności rolników, alimenty i renty odszkodowawcze" },
      { id: "c", text: "Podatki i składki ZUS" },
      { id: "d", text: "Wierzytelności banków" }
    ],
    correctAnswer: "b",
    explanation: "Art. 342 § 1 pkt 1 stanowi, że do kategorii pierwszej zalicza się należności ze stosunku pracy, należności rolników z tytułu umów o dostarczenie produktów rolnych, należności alimentacyjne oraz renty z tytułu odszkodowania.",
    articleReference: "Art. 342 § 1 pkt 1"
  },
  {
    id: "pu-213",
    text: "Do kategorii drugiej zaspokojenia należą:",
    answers: [
      { id: "a", text: "Należności ze stosunku pracy" },
      { id: "b", text: "Inne należności, jeżeli nie podlegają zaspokojeniu w innych kategoriach" },
      { id: "c", text: "Odsetki" },
      { id: "d", text: "Grzywny" }
    ],
    correctAnswer: "b",
    explanation: "Art. 342 § 1 pkt 2 stanowi, że do kategorii drugiej zalicza się inne należności, jeżeli nie podlegają zaspokojeniu w innych kategoriach, w szczególności podatki i inne daniny publiczne oraz składki na ubezpieczenie społeczne.",
    articleReference: "Art. 342 § 1 pkt 2"
  },
  {
    id: "pu-214",
    text: "Do kategorii trzeciej zaspokojenia należą:",
    answers: [
      { id: "a", text: "Wierzytelności z tytułu kredytów" },
      { id: "b", text: "Odsetki od należności z wyższych kategorii, grzywny sądowe i administracyjne, należności z darowizn" },
      { id: "c", text: "Należności alimentacyjne" },
      { id: "d", text: "Należności pracownicze" }
    ],
    correctAnswer: "b",
    explanation: "Art. 342 § 1 pkt 3 stanowi, że do kategorii trzeciej zalicza się odsetki od należności ujętych w wyższych kategoriach, grzywny sądowe i administracyjne oraz należności z tytułu darowizn i zapisów.",
    articleReference: "Art. 342 § 1 pkt 3"
  },
  {
    id: "pu-215",
    text: "Do kategorii czwartej zaspokojenia należą:",
    answers: [
      { id: "a", text: "Odsetki od kategorii trzeciej" },
      { id: "b", text: "Należności wspólników albo akcjonariuszy z tytułu pożyczki lub innej czynności o podobnych skutkach" },
      { id: "c", text: "Grzywny" },
      { id: "d", text: "Koszty postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 342 § 1 pkt 4 stanowi, że do kategorii czwartej zalicza się należności wspólników albo akcjonariuszy z tytułu pożyczki lub innej czynności prawnej o podobnych skutkach, w szczególności dostawy towarów z odroczonym terminem płatności.",
    articleReference: "Art. 342 § 1 pkt 4"
  },
  {
    id: "pu-216",
    text: "Wierzytelności z wyższej kategorii zaspokaja się:",
    answers: [
      { id: "a", text: "Proporcjonalnie z wierzytelnościami z niższych kategorii" },
      { id: "b", text: "W całości przed zaspokojeniem wierzytelności z kategorii niższej" },
      { id: "c", text: "Według daty powstania" },
      { id: "d", text: "Według uznania syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 344 stanowi, że wierzytelności zaliczone do wyższej kategorii zaspokaja się w całości przed zaspokojeniem wierzytelności kategorii niższej. Jeżeli suma nie wystarcza na zaspokojenie w całości, zaspokaja się je stosunkowo.",
    articleReference: "Art. 344"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - ZAKAZ PROWADZENIA DZIAŁALNOŚCI
  // =====================================================
  {
    id: "pu-217",
    text: "Sąd może orzec zakaz prowadzenia działalności gospodarczej wobec osoby, która:",
    answers: [
      { id: "a", text: "Ogłosiła upadłość" },
      { id: "b", text: "Nie złożyła wniosku o ogłoszenie upadłości w terminie albo istotnie przyczyniła się do niezłożenia wniosku" },
      { id: "c", text: "Prowadziła działalność przez mniej niż rok" },
      { id: "d", text: "Miała straty w ostatnim roku obrotowym" }
    ],
    correctAnswer: "b",
    explanation: "Art. 373 § 1 stanowi, że sąd może orzec pozbawienie prawa prowadzenia działalności gospodarczej wobec osoby, która ze swojej winy nie złożyła w ustawowym terminie wniosku o ogłoszenie upadłości lub istotnie przyczyniła się do niezłożenia wniosku.",
    articleReference: "Art. 373 § 1"
  },
  {
    id: "pu-218",
    text: "Zakaz prowadzenia działalności gospodarczej orzeka się na okres:",
    answers: [
      { id: "a", text: "Od 6 miesięcy do 5 lat" },
      { id: "b", text: "Od roku do lat 10" },
      { id: "c", text: "Od 2 do 15 lat" },
      { id: "d", text: "Bezterminowo" }
    ],
    correctAnswer: "b",
    explanation: "Art. 373 § 1 stanowi, że sąd może orzec pozbawienie prawa prowadzenia działalności gospodarczej na własny rachunek lub w ramach spółki cywilnej oraz pełnienia funkcji członka organów na okres od jednego roku do lat dziesięciu.",
    articleReference: "Art. 373 § 1"
  },
  {
    id: "pu-219",
    text: "Nie można orzec zakazu prowadzenia działalności gospodarczej po upływie:",
    answers: [
      { id: "a", text: "Roku od umorzenia lub zakończenia postępowania upadłościowego" },
      { id: "b", text: "3 lat od umorzenia lub zakończenia postępowania upadłościowego albo oddalenia wniosku o ogłoszenie upadłości" },
      { id: "c", text: "5 lat od ogłoszenia upadłości" },
      { id: "d", text: "10 lat od dnia niewypłacalności" }
    ],
    correctAnswer: "b",
    explanation: "Art. 377 stanowi, że nie orzeka się zakazu prowadzenia działalności gospodarczej, jeżeli postępowanie w tej sprawie nie zostało wszczęte w terminie trzech lat od dnia umorzenia lub zakończenia postępowania upadłościowego albo oddalenia wniosku o ogłoszenie upadłości.",
    articleReference: "Art. 377"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - SPADEK
  // =====================================================
  {
    id: "pu-220",
    text: "Spadek, który przypadł upadłemu w czasie postępowania upadłościowego:",
    answers: [
      { id: "a", text: "Nie wchodzi do masy upadłości" },
      { id: "b", text: "Wchodzi do masy upadłości i uważa się go za przyjęty z dobrodziejstwem inwentarza" },
      { id: "c", text: "Może być odrzucony przez upadłego" },
      { id: "d", text: "Wchodzi do masy tylko za zgodą spadkodawcy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 119 § 1 stanowi, że spadek, który przypadł upadłemu w czasie postępowania upadłościowego, wchodzi do masy upadłości. Art. 119 § 2 stanowi, że spadek uważa się za przyjęty z dobrodziejstwem inwentarza.",
    articleReference: "Art. 119 § 1, 2"
  },
  {
    id: "pu-221",
    text: "Upadły może odrzucić spadek tylko za zgodą:",
    answers: [
      { id: "a", text: "Syndyka" },
      { id: "b", text: "Sędziego-komisarza" },
      { id: "c", text: "Rady wierzycieli" },
      { id: "d", text: "Zgromadzenia wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Art. 121 stanowi, że do dokonania przez upadłego czynności przekraczających zakres zwykłego zarządu w sprawach dotyczących spadku przypadłego mu w toku postępowania, w tym do odrzucenia spadku, wymagana jest zgoda sędziego-komisarza.",
    articleReference: "Art. 121"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - PRZYGOTOWANA LIKWIDACJA (PRE-PACK)
  // =====================================================
  {
    id: "pu-222",
    text: "Wniosek o zatwierdzenie warunków sprzedaży przedsiębiorstwa dłużnika (pre-pack) może być złożony:",
    answers: [
      { id: "a", text: "Tylko przez dłużnika" },
      { id: "b", text: "Przez uczestnika postępowania o ogłoszenie upadłości" },
      { id: "c", text: "Tylko przez wierzyciela" },
      { id: "d", text: "Tylko przez syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 56a § 1 stanowi, że do wniosku o ogłoszenie upadłości może być dołączony wniosek o zatwierdzenie warunków sprzedaży przedsiębiorstwa dłużnika lub jego zorganizowanej części lub składników majątkowych. Wniosek może złożyć uczestnik postępowania.",
    articleReference: "Art. 56a § 1"
  },
  {
    id: "pu-223",
    text: "Do wniosku o zatwierdzenie warunków sprzedaży pre-pack dołącza się opis i oszacowanie sporządzone przez:",
    answers: [
      { id: "a", text: "Syndyka" },
      { id: "b", text: "Biegłego sądowego" },
      { id: "c", text: "Osobę wpisaną na listę biegłych sądowych" },
      { id: "d", text: "Dowolnego rzeczoznawcę" }
    ],
    correctAnswer: "c",
    explanation: "Art. 56a § 2 stanowi, że do wniosku dołącza się opis i oszacowanie składnika objętego wnioskiem sporządzone przez osobę wpisaną na listę biegłych sądowych.",
    articleReference: "Art. 56a § 2"
  },
  {
    id: "pu-224",
    text: "Wadium w przygotowanej likwidacji (pre-pack) wynosi:",
    answers: [
      { id: "a", text: "5% ceny" },
      { id: "b", text: "1/10 oferowanej ceny" },
      { id: "c", text: "20% ceny" },
      { id: "d", text: "Ustala je sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 56a § 2a stanowi, że wraz z wnioskiem nabywca składa wadium w wysokości jednej dziesiątej oferowanej ceny.",
    articleReference: "Art. 56a § 2a"
  },
  {
    id: "pu-225",
    text: "Umowę sprzedaży w trybie pre-pack syndyk zawiera w terminie:",
    answers: [
      { id: "a", text: "14 dni od prawomocności postanowienia" },
      { id: "b", text: "30 dni od dnia uprawomocnienia się postanowienia o zatwierdzeniu warunków" },
      { id: "c", text: "2 miesięcy od ogłoszenia upadłości" },
      { id: "d", text: "Wyznaczonym przez sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 56e § 1 stanowi, że syndyk zawiera umowę sprzedaży na warunkach określonych w postanowieniu o zatwierdzeniu warunków sprzedaży, w terminie trzydziestu dni od dnia uprawomocnienia się tego postanowienia.",
    articleReference: "Art. 56e § 1"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - SĘDZIA-KOMISARZ
  // =====================================================
  {
    id: "pu-226",
    text: "Sędzia-komisarz kieruje tokiem postępowania upadłościowego. Do jego zadań NIE należy:",
    answers: [
      { id: "a", text: "Sprawowanie nadzoru nad czynnościami syndyka" },
      { id: "b", text: "Wydawanie postanowień o ogłoszeniu upadłości" },
      { id: "c", text: "Oznaczanie czynności, których syndykowi nie wolno wykonywać bez jego zezwolenia" },
      { id: "d", text: "Rozpoznawanie skarg na czynności komornika w postępowaniu upadłościowym" }
    ],
    correctAnswer: "b",
    explanation: "Art. 152 wymienia zadania sędziego-komisarza. Postanowienie o ogłoszeniu upadłości wydaje sąd, a nie sędzia-komisarz. Sędzia-komisarz kieruje postępowaniem po ogłoszeniu upadłości.",
    articleReference: "Art. 152, Art. 51"
  },
  {
    id: "pu-227",
    text: "Sędzia-komisarz wyznaczany jest przez:",
    answers: [
      { id: "a", text: "Prezesa sądu" },
      { id: "b", text: "Sąd upadłościowy w postanowieniu o ogłoszeniu upadłości" },
      { id: "c", text: "Syndyka" },
      { id: "d", text: "Zgromadzenie wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Art. 51 § 1 pkt 6 stanowi, że postanowienie o ogłoszeniu upadłości zawiera m.in. wyznaczenie sędziego-komisarza oraz zastępcy sędziego-komisarza.",
    articleReference: "Art. 51 § 1 pkt 6"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - EGZEKUCJA
  // =====================================================
  {
    id: "pu-228",
    text: "Postępowanie egzekucyjne skierowane do majątku wchodzącego w skład masy upadłości po ogłoszeniu upadłości:",
    answers: [
      { id: "a", text: "Toczy się dalej równolegle" },
      { id: "b", text: "Ulega zawieszeniu z mocy prawa" },
      { id: "c", text: "Jest kontynuowane przez syndyka" },
      { id: "d", text: "Zostaje przekazane sądowi upadłościowemu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 146 § 1 stanowi, że postępowanie egzekucyjne skierowane do majątku wchodzącego w skład masy upadłości, wszczęte przed dniem ogłoszenia upadłości, ulega zawieszeniu z mocy prawa z dniem ogłoszenia upadłości.",
    articleReference: "Art. 146 § 1"
  },
  {
    id: "pu-229",
    text: "Po ogłoszeniu upadłości niedopuszczalne jest wszczęcie:",
    answers: [
      { id: "a", text: "Postępowania sądowego przeciwko upadłemu" },
      { id: "b", text: "Egzekucji i postępowania zabezpieczającego skierowanych do majątku masy" },
      { id: "c", text: "Postępowania administracyjnego" },
      { id: "d", text: "Postępowania rejestrowego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 146 § 3 stanowi, że po ogłoszeniu upadłości niedopuszczalne jest skierowanie egzekucji do majątku wchodzącego w skład masy upadłości oraz wykonanie postanowienia o zabezpieczeniu na tym majątku.",
    articleReference: "Art. 146 § 3"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - WŁAŚCIWOŚĆ SĄDU
  // =====================================================
  {
    id: "pu-230",
    text: "Właściwość sądu upadłościowego określa się według:",
    answers: [
      { id: "a", text: "Miejsca zamieszkania wierzyciela" },
      { id: "b", text: "Głównego ośrodka podstawowej działalności dłużnika" },
      { id: "c", text: "Miejsca położenia największego składnika majątku" },
      { id: "d", text: "Wyboru dłużnika" }
    ],
    correctAnswer: "b",
    explanation: "Art. 19 § 1 stanowi, że sprawy o ogłoszenie upadłości rozpoznaje sąd właściwy dla głównego ośrodka podstawowej działalności dłużnika.",
    articleReference: "Art. 19 § 1"
  },
  {
    id: "pu-231",
    text: "Dla osoby fizycznej nieprowadzącej działalności gospodarczej główny ośrodek podstawowej działalności znajduje się:",
    answers: [
      { id: "a", text: "W miejscu siedziby pracodawcy" },
      { id: "b", text: "W miejscu zwykłego pobytu tej osoby" },
      { id: "c", text: "W miejscu największych zobowiązań" },
      { id: "d", text: "W miejscu urodzenia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 19 § 1b stanowi, że dla osoby fizycznej nieprowadzącej działalności gospodarczej domniemywa się, że głównym ośrodkiem jej podstawowej działalności jest miejsce zwykłego pobytu tej osoby.",
    articleReference: "Art. 19 § 1b"
  },

  // =====================================================
  // SZCZEGÓŁOWE PRZEPISY - UPADŁOŚĆ PO ŚMIERCI
  // =====================================================
  {
    id: "pu-232",
    text: "Można ogłosić upadłość osoby fizycznej po jej śmierci w ciągu:",
    answers: [
      { id: "a", text: "3 miesięcy od dnia śmierci" },
      { id: "b", text: "6 miesięcy od dnia śmierci" },
      { id: "c", text: "Roku od dnia śmierci" },
      { id: "d", text: "2 lat od dnia śmierci" }
    ],
    correctAnswer: "c",
    explanation: "Art. 7 stanowi, że można ogłosić upadłość osoby fizycznej, która była przedsiębiorcą, także po jej śmierci, jeżeli wniosek o ogłoszenie upadłości został złożony w terminie roku od dnia jej śmierci.",
    articleReference: "Art. 7"
  },
  {
    id: "pu-233",
    text: "Można ogłosić upadłość osoby fizycznej, która zaprzestała prowadzenia działalności gospodarczej:",
    answers: [
      { id: "a", text: "W ciągu 6 miesięcy od dnia wykreślenia z rejestru" },
      { id: "b", text: "W ciągu roku od dnia wykreślenia z rejestru" },
      { id: "c", text: "W ciągu 2 lat od dnia wykreślenia" },
      { id: "d", text: "W każdym czasie" }
    ],
    correctAnswer: "b",
    explanation: "Art. 8 § 1 stanowi, że można ogłosić upadłość osoby fizycznej, która była przedsiębiorcą, także po zaprzestaniu prowadzenia przez nią działalności gospodarczej, jeżeli wniosek został złożony w terminie roku od dnia wykreślenia z właściwego rejestru.",
    articleReference: "Art. 8 § 1"
  },

  // =====================================================
  // POZOSTAŁE SZCZEGÓŁOWE PRZEPISY
  // =====================================================
  {
    id: "pu-234",
    text: "Krajowy Rejestr Zadłużonych jest:",
    answers: [
      { id: "a", text: "Rejestrem prowadzonym przez NBP" },
      { id: "b", text: "Rejestrem w rozumieniu ustawy Prawo upadłościowe, w którym dokonuje się obwieszczeń" },
      { id: "c", text: "Rejestrem prowadzonym przez KRS" },
      { id: "d", text: "Rejestrem europejskim" }
    ],
    correctAnswer: "b",
    explanation: "Art. 4a stanowi, że ilekroć w ustawie jest mowa o Rejestrze, należy przez to rozumieć Krajowy Rejestr Zadłużonych prowadzony na podstawie ustawy o Krajowym Rejestrze Zadłużonych.",
    articleReference: "Art. 4a"
  },
  {
    id: "pu-235",
    text: "Wniosek o ogłoszenie upadłości złożony przez wierzyciela w złej wierze podlega:",
    answers: [
      { id: "a", text: "Zwrotowi bez rozpoznania" },
      { id: "b", text: "Odrzuceniu, a wierzyciel może zostać obciążony kosztami i odszkodowaniem" },
      { id: "c", text: "Przekazaniu prokuratorowi" },
      { id: "d", text: "Zawieszeniu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 34 stanowi, że jeżeli wniosek o ogłoszenie upadłości został złożony przez wierzyciela w złej wierze, sąd odrzuca wniosek i może obciążyć wierzyciela kosztami postępowania oraz orzec o obowiązku naprawienia szkody.",
    articleReference: "Art. 34"
  },
  {
    id: "pu-236",
    text: "Tymczasowy nadzorca sądowy ustanawiany jest przez sąd po złożeniu wniosku o ogłoszenie upadłości w celu:",
    answers: [
      { id: "a", text: "Prowadzenia przedsiębiorstwa dłużnika" },
      { id: "b", text: "Zabezpieczenia majątku dłużnika" },
      { id: "c", text: "Sporządzenia listy wierzytelności" },
      { id: "d", text: "Reprezentowania dłużnika w sądzie" }
    ],
    correctAnswer: "b",
    explanation: "Art. 38 stanowi, że sąd może ustanowić tymczasowego nadzorcę sądowego w celu zabezpieczenia majątku dłużnika. Tymczasowy nadzorca kontroluje czynności dłużnika.",
    articleReference: "Art. 38"
  },
  {
    id: "pu-237",
    text: "Postanowienie o ogłoszeniu upadłości jest skuteczne i wykonalne:",
    answers: [
      { id: "a", text: "Po uprawomocnieniu się" },
      { id: "b", text: "Z dniem jego wydania" },
      { id: "c", text: "Po obwieszczeniu" },
      { id: "d", text: "Po doręczeniu upadłemu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 51 § 2 stanowi, że postanowienie o ogłoszeniu upadłości jest skuteczne i wykonalne z dniem jego wydania, chyba że przepis szczególny stanowi inaczej.",
    articleReference: "Art. 51 § 2"
  },
  {
    id: "pu-238",
    text: "Jeżeli w dniu ogłoszenia upadłości na rachunku bankowym upadłego były środki, które wpłynęły tytułem wynagrodzenia za pracę:",
    answers: [
      { id: "a", text: "Cała kwota wchodzi do masy" },
      { id: "b", text: "Środki te są wyłączone z masy upadłości w części niepodlegającej zajęciu" },
      { id: "c", text: "Bank zatrzymuje środki" },
      { id: "d", text: "Środki są zwracane pracodawcy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 63 § 1 stanowi, że nie wchodzi do masy upadłości wynagrodzenie za pracę upadłego w części niepodlegającej zajęciu. Dotyczy to także środków na rachunku bankowym pochodzących z wynagrodzenia.",
    articleReference: "Art. 63 § 1"
  },
  {
    id: "pu-239",
    text: "Firma upadłego przedsiębiorcy używana jest z dodatkiem:",
    answers: [
      { id: "a", text: "'w likwidacji'" },
      { id: "b", text: "'w upadłości'" },
      { id: "c", text: "'w restrukturyzacji'" },
      { id: "d", text: "'niewypłacalny'" }
    ],
    correctAnswer: "b",
    explanation: "Art. 60¹ stanowi, że po ogłoszeniu upadłości przedsiębiorca występuje w obrocie pod dotychczasową firmą z dodaniem oznaczenia 'w upadłości'.",
    articleReference: "Art. 60¹"
  },
  {
    id: "pu-240",
    text: "Odsetki od wierzytelności pieniężnej umieszcza się na liście w kwocie naliczonej:",
    answers: [
      { id: "a", text: "Do dnia ogłoszenia upadłości włącznie" },
      { id: "b", text: "Do dnia poprzedzającego dzień ogłoszenia upadłości włącznie" },
      { id: "c", text: "Do dnia sporządzenia listy wierzytelności" },
      { id: "d", text: "Do dnia wykonania planu podziału" }
    ],
    correctAnswer: "b",
    explanation: "Art. 247 § 2 stanowi, że odsetki od wierzytelności pieniężnej umieszcza się na liście wierzytelności w kwocie naliczonej do dnia poprzedzającego dzień ogłoszenia upadłości włącznie.",
    articleReference: "Art. 247 § 2"
  }
];

export default prawoUpadlosciowePart3Questions;
