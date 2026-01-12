import { ExamQuestion } from '../ksh/ksh-exam-questions';
type Question = { id: string; text: string; answers: { id: string; text: string }[]; correctAnswer: string; explanation: string; articleReference: string; };

/**
 * PRAWO UPADŁOŚCIOWE - PYTANIA EGZAMINACYJNE CZĘŚĆ 2
 * Źródło: Dz.U.2025.614 t.j. - Ustawa z dnia 28 lutego 2003 r. Prawo upadłościowe
 * 
 * Zakres tematyczny Part 2 (pu-081 do pu-160):
 * - Syndyk i zastępca syndyka (Art. 156-180)
 * - Zgromadzenie wierzycieli (Art. 191-200)
 * - Rada wierzycieli (Art. 201-212)
 * - Lista wierzytelności (Art. 236-265)
 * - Likwidacja masy upadłości (Art. 306-341)
 * - Plan podziału (Art. 347-360)
 * - Zakończenie i umorzenie postępowania (Art. 361-372)
 * - Upadłość konsumencka (Art. 491¹-491³⁸)
 */

export const prawoUpadlosciowePart2Questions: Question[] = [
  // =====================================================
  // SYNDYK I ZASTĘPCA SYNDYKA (Art. 156-180)
  // =====================================================
  {
    id: "pu-081",
    text: "Kto może pełnić funkcję syndyka?",
    answers: [
      { id: "a", text: "Wyłącznie adwokat lub radca prawny" },
      { id: "b", text: "Osoba fizyczna posiadająca licencję doradcy restrukturyzacyjnego lub spółka handlowa, której wspólnicy/członkowie zarządu posiadają taką licencję" },
      { id: "c", text: "Każdy wierzyciel upadłego" },
      { id: "d", text: "Wyłącznie biegły rewident z uprawnieniami" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 157 § 1 i 2, funkcję syndyka może pełnić osoba fizyczna posiadająca pełną zdolność do czynności prawnych i licencję doradcy restrukturyzacyjnego, a także spółka handlowa spełniająca określone warunki.",
    articleReference: "Art. 157 § 1, 2"
  },
  {
    id: "pu-082",
    text: "Syndyk dokonuje czynności w sprawach dotyczących masy upadłości:",
    answers: [
      { id: "a", text: "W imieniu upadłego i na jego rachunek" },
      { id: "b", text: "W imieniu własnym na rachunek upadłego" },
      { id: "c", text: "W imieniu sądu i na rachunek Skarbu Państwa" },
      { id: "d", text: "W imieniu wierzycieli i na ich rachunek" }
    ],
    correctAnswer: "b",
    explanation: "Art. 160 § 1 stanowi, że w sprawach dotyczących masy upadłości syndyk dokonuje czynności w imieniu własnym na rachunek upadłego.",
    articleReference: "Art. 160 § 1"
  },
  {
    id: "pu-083",
    text: "Czy syndyk odpowiada za zobowiązania zaciągnięte w sprawach dotyczących masy upadłości?",
    answers: [
      { id: "a", text: "Tak, odpowiada solidarnie z upadłym" },
      { id: "b", text: "Tak, odpowiada subsydiarnie" },
      { id: "c", text: "Nie odpowiada za te zobowiązania" },
      { id: "d", text: "Odpowiada tylko do wysokości swojego wynagrodzenia" }
    ],
    correctAnswer: "c",
    explanation: "Zgodnie z art. 160 § 2, syndyk nie odpowiada za zobowiązania zaciągnięte w sprawach dotyczących masy upadłości. Odpowiada natomiast za szkodę wyrządzoną na skutek nienależytego wykonywania obowiązków (art. 160 § 3).",
    articleReference: "Art. 160 § 2"
  },
  {
    id: "pu-084",
    text: "W jakim terminie syndyk składa sędziemu-komisarzowi spis inwentarza wraz z planem likwidacyjnym?",
    answers: [
      { id: "a", text: "14 dni od dnia ogłoszenia upadłości" },
      { id: "b", text: "30 dni od dnia ogłoszenia upadłości" },
      { id: "c", text: "2 miesiące od dnia ogłoszenia upadłości" },
      { id: "d", text: "3 miesiące od dnia ogłoszenia upadłości" }
    ],
    correctAnswer: "b",
    explanation: "Art. 306 stanowi, że syndyk składa sędziemu-komisarzowi spis inwentarza wraz z planem likwidacyjnym w terminie 30 dni od dnia ogłoszenia upadłości.",
    articleReference: "Art. 306"
  },
  {
    id: "pu-085",
    text: "Syndykiem NIE może być osoba, która:",
    answers: [
      { id: "a", text: "Jest zameldowana w tym samym mieście co upadły" },
      { id: "b", text: "Jest wierzycielem lub dłużnikiem upadłego albo jego małżonkiem" },
      { id: "c", text: "Ukończyła studia ekonomiczne" },
      { id: "d", text: "Prowadziła wcześniej działalność gospodarczą" }
    ],
    correctAnswer: "b",
    explanation: "Art. 157a § 1 pkt 1 wyklucza jako syndyka osobę, która jest wierzycielem lub dłużnikiem upadłego, jego małżonkiem, wstępnym, zstępnym, rodzeństwem lub pozostaje z nim w stosunku powinowactwa.",
    articleReference: "Art. 157a § 1 pkt 1"
  },
  {
    id: "pu-086",
    text: "Jak często syndyk składa sprawozdania sędziemu-komisarzowi?",
    answers: [
      { id: "a", text: "Co miesiąc" },
      { id: "b", text: "Co 3 miesiące" },
      { id: "c", text: "Co 6 miesięcy" },
      { id: "d", text: "Raz w roku" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 168 § 1, syndyk składa sędziemu-komisarzowi sprawozdania w terminach przez niego wyznaczonych, przynajmniej co trzy miesiące.",
    articleReference: "Art. 168 § 1"
  },
  {
    id: "pu-087",
    text: "Sędzia-komisarz może nałożyć na syndyka grzywnę w wysokości:",
    answers: [
      { id: "a", text: "Od 100 zł do 5 000 zł" },
      { id: "b", text: "Od 500 zł do 15 000 zł" },
      { id: "c", text: "Od 1 000 zł do 30 000 zł" },
      { id: "d", text: "Od 5 000 zł do 100 000 zł" }
    ],
    correctAnswer: "c",
    explanation: "Art. 169a § 2 stanowi, że w przypadku istotnego uchybienia lub braku poprawy mimo upomnienia, sędzia-komisarz nakłada na syndyka grzywnę w wysokości od 1 000 zł do 30 000 zł.",
    articleReference: "Art. 169a § 2"
  },
  {
    id: "pu-088",
    text: "W przypadku dużego przedsiębiorcy (≥250 pracowników lub obrót >50 mln EUR), syndykiem musi być:",
    answers: [
      { id: "a", text: "Osoba posiadająca tytuł biegłego rewidenta" },
      { id: "b", text: "Osoba posiadająca tytuł kwalifikowanego doradcy restrukturyzacyjnego" },
      { id: "c", text: "Dwóch syndyków łącznie" },
      { id: "d", text: "Wyłącznie spółka handlowa" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 157¹ § 3, w przypadku dużych przedsiębiorców sąd wyznacza do pełnienia funkcji syndyka osobę posiadającą licencję doradcy restrukturyzacyjnego z tytułem kwalifikowanego doradcy restrukturyzacyjnego.",
    articleReference: "Art. 157¹ § 3"
  },
  {
    id: "pu-089",
    text: "Wynagrodzenie syndyka ustala się w granicach:",
    answers: [
      { id: "a", text: "Od jednokrotności do stukrotności podstawy wynagrodzenia" },
      { id: "b", text: "Od dwukrotności do dwustusześćdziesięciokrotności podstawy wynagrodzenia" },
      { id: "c", text: "Od trzykrotności do pięćsetkrotności podstawy wynagrodzenia" },
      { id: "d", text: "Dowolnie według uznania sądu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 162 § 1 stanowi, że wynagrodzenie syndyka ustala się jako sumę pięciu części składowych, w granicach od dwukrotności do dwustusześćdziesięciokrotności podstawy wynagrodzenia.",
    articleReference: "Art. 162 § 1"
  },
  {
    id: "pu-090",
    text: "Syndyk pobiera zaliczki na wynagrodzenie do wysokości:",
    answers: [
      { id: "a", text: "50% wynagrodzenia wstępnego" },
      { id: "b", text: "75% wynagrodzenia wstępnego" },
      { id: "c", text: "90% wynagrodzenia wstępnego" },
      { id: "d", text: "100% wynagrodzenia wstępnego" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 164 § 1, po ustaleniu wynagrodzenia wstępnego syndyk pobiera z masy upadłości zaliczki w wysokości do 75% wynagrodzenia wstępnego w czterech ratach.",
    articleReference: "Art. 164 § 1"
  },
  {
    id: "pu-091",
    text: "Syndyk niezwłocznie po objęciu funkcji obejmuje majątek upadłego. Jeżeli napotyka przeszkody ze strony upadłego:",
    answers: [
      { id: "a", text: "Postępowanie upadłościowe zostaje umorzone" },
      { id: "b", text: "Wprowadzenia syndyka dokonuje komornik sądowy" },
      { id: "c", text: "Sąd nakłada na upadłego karę pozbawienia wolności" },
      { id: "d", text: "Syndyk musi uzyskać zgodę wszystkich wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Art. 174 § 1 stanowi, że jeżeli syndyk napotyka przeszkody przy obejmowaniu majątku upadłego, wprowadzenia syndyka w posiadanie majątku upadłego dokonuje komornik sądowy.",
    articleReference: "Art. 174 § 1"
  },

  // =====================================================
  // ZGROMADZENIE WIERZYCIELI (Art. 191-200)
  // =====================================================
  {
    id: "pu-092",
    text: "Sędzia-komisarz zwołuje zgromadzenie wierzycieli na wniosek:",
    answers: [
      { id: "a", text: "Każdego wierzyciela, bez względu na wysokość wierzytelności" },
      { id: "b", text: "Przynajmniej dwóch wierzycieli mających łącznie nie mniej niż 1/3 ogólnej sumy uznanych wierzytelności" },
      { id: "c", text: "Przynajmniej trzech wierzycieli mających łącznie nie mniej niż 1/2 ogólnej sumy uznanych wierzytelności" },
      { id: "d", text: "Wyłącznie syndyka lub upadłego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 191 pkt 2 stanowi, że sędzia-komisarz zwołuje zgromadzenie wierzycieli na wniosek przynajmniej dwóch wierzycieli mających łącznie nie mniej niż trzecią część ogólnej sumy uznanych wierzytelności.",
    articleReference: "Art. 191 pkt 2"
  },
  {
    id: "pu-093",
    text: "Na ile przed terminem zgromadzenia wierzycieli należy dokonać obwieszczenia o jego zwołaniu?",
    answers: [
      { id: "a", text: "Przynajmniej tydzień przed terminem" },
      { id: "b", text: "Przynajmniej dwa tygodnie przed terminem" },
      { id: "c", text: "Przynajmniej miesiąc przed terminem" },
      { id: "d", text: "Przynajmniej 3 dni przed terminem" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 192 § 2, obwieszczenia o zgromadzeniu wierzycieli dokonuje się przynajmniej na dwa tygodnie przed terminem zgromadzenia.",
    articleReference: "Art. 192 § 2"
  },
  {
    id: "pu-094",
    text: "Uchwały zgromadzenia wierzycieli zapadają (jeżeli ustawa nie stanowi inaczej):",
    answers: [
      { id: "a", text: "Większością głosów wierzycieli mających przynajmniej 1/5 ogólnej sumy wierzytelności" },
      { id: "b", text: "Jednomyślnie przez wszystkich obecnych wierzycieli" },
      { id: "c", text: "Zwykłą większością głosów wierzycieli obecnych" },
      { id: "d", text: "Większością 3/4 głosów wierzycieli" }
    ],
    correctAnswer: "a",
    explanation: "Art. 199 § 1 stanowi, że uchwały zgromadzenia wierzycieli zapadają bez względu na liczbę obecnych, większością głosów wierzycieli mających przynajmniej piątą część ogólnej sumy wierzytelności.",
    articleReference: "Art. 199 § 1"
  },
  {
    id: "pu-095",
    text: "W sprawach o wyłączenie mienia z masy upadłości uchwały zgromadzenia wierzycieli wymagają:",
    answers: [
      { id: "a", text: "Większości 1/5 ogólnej sumy wierzytelności" },
      { id: "b", text: "Większości 1/2 ogólnej sumy wierzytelności" },
      { id: "c", text: "Większości 2/3 ogólnej sumy uznanych wierzytelności" },
      { id: "d", text: "Jednomyślności" }
    ],
    correctAnswer: "c",
    explanation: "Zgodnie z art. 199 § 2, w sprawach o wyłączenie mienia z masy upadłości uchwały zapadają większością głosów wierzycieli mających przynajmniej dwie trzecie ogólnej sumy uznanych wierzytelności.",
    articleReference: "Art. 199 § 2"
  },
  {
    id: "pu-096",
    text: "Wierzyciel NIE ma prawa głosu na zgromadzeniu na podstawie wierzytelności nabytej po ogłoszeniu upadłości:",
    answers: [
      { id: "a", text: "W żadnym przypadku" },
      { id: "b", text: "Chyba że przejście wierzytelności nastąpiło wskutek spłacenia przez niego długu, za który odpowiadał osobiście" },
      { id: "c", text: "Chyba że nabycie nastąpiło od syndyka" },
      { id: "d", text: "Chyba że nabycie zostało zatwierdzone przez sędziego-komisarza" }
    ],
    correctAnswer: "b",
    explanation: "Art. 197 § 1 stanowi, że wierzyciel nie ma prawa głosu na podstawie wierzytelności nabytej w drodze przelewu lub indosu po ogłoszeniu upadłości, chyba że przejście wierzytelności nastąpiło wskutek spłacenia przez niego długu, za który odpowiadał osobiście.",
    articleReference: "Art. 197 § 1"
  },
  {
    id: "pu-097",
    text: "Sędzia-komisarz może uchylić uchwałę zgromadzenia wierzycieli, jeżeli:",
    answers: [
      { id: "a", text: "Jest sprzeczna z prawem lub narusza dobre obyczaje albo rażąco narusza interes wierzyciela, który głosował przeciw" },
      { id: "b", text: "Nie zgadza się z jej treścią" },
      { id: "c", text: "Syndyk złoży wniosek o jej uchylenie" },
      { id: "d", text: "Upadły nie wyrazi na nią zgody" }
    ],
    correctAnswer: "a",
    explanation: "Art. 200 stanowi, że sędzia-komisarz może uchylić uchwałę zgromadzenia wierzycieli, jeżeli jest sprzeczna z prawem lub narusza dobre obyczaje albo rażąco narusza interes wierzyciela, który głosował przeciw uchwale.",
    articleReference: "Art. 200"
  },

  // =====================================================
  // RADA WIERZYCIELI (Art. 201-212)
  // =====================================================
  {
    id: "pu-098",
    text: "Rada wierzycieli składa się z:",
    answers: [
      { id: "a", text: "3 członków i 1 zastępcy" },
      { id: "b", text: "5 członków i 2 zastępców (lub 3 członków gdy mniej niż 7 wierzycieli)" },
      { id: "c", text: "7 członków i 3 zastępców" },
      { id: "d", text: "Dowolnej liczby członków" }
    ],
    correctAnswer: "b",
    explanation: "Art. 202 § 1 stanowi, że rada wierzycieli składa się z pięciu członków oraz dwóch zastępców. Rada może składać się z trzech członków, jeżeli liczba wierzycieli będących uczestnikami postępowania jest mniejsza niż siedem.",
    articleReference: "Art. 202 § 1"
  },
  {
    id: "pu-099",
    text: "Sędzia-komisarz ustanawia radę wierzycieli niezwłocznie, nie później niż w terminie tygodnia, na wniosek:",
    answers: [
      { id: "a", text: "Tylko syndyka" },
      { id: "b", text: "Tylko upadłego" },
      { id: "c", text: "Upadłego, co najmniej trzech wierzycieli lub wierzyciela/wierzycieli mających łącznie co najmniej 1/5 sumy wierzytelności" },
      { id: "d", text: "Prokuratora lub organów administracji" }
    ],
    correctAnswer: "c",
    explanation: "Zgodnie z art. 201 § 2, sędzia-komisarz niezwłocznie ustanawia radę wierzycieli na wniosek upadłego, co najmniej trzech wierzycieli lub wierzyciela/wierzycieli mających łącznie co najmniej piątą część sumy wierzytelności.",
    articleReference: "Art. 201 § 2"
  },
  {
    id: "pu-100",
    text: "Zezwolenia rady wierzycieli pod rygorem nieważności wymaga:",
    answers: [
      { id: "a", text: "Każda czynność syndyka" },
      { id: "b", text: "Dalsze prowadzenie przedsiębiorstwa dłużej niż 3 miesiące od ogłoszenia upadłości" },
      { id: "c", text: "Wypłata wynagrodzeń pracownikom" },
      { id: "d", text: "Zaspokojenie kosztów postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 206 § 1 pkt 1 stanowi, że zezwolenia rady wierzycieli pod rygorem nieważności wymaga dalsze prowadzenie przedsiębiorstwa przez syndyka, jeżeli ma trwać dłużej niż trzy miesiące od dnia ogłoszenia upadłości.",
    articleReference: "Art. 206 § 1 pkt 1"
  },
  {
    id: "pu-101",
    text: "Zgoda rady wierzycieli jest wymagana dla sprzedaży z wolnej ręki ruchomości, CHYBA ŻE:",
    answers: [
      { id: "a", text: "Czynność musi być dokonana niezwłocznie i dotyczy wartości nieprzewyższającej 10 000 zł" },
      { id: "b", text: "Czynność dotyczy wartości nieprzewyższającej 100 000 zł" },
      { id: "c", text: "Syndyk otrzyma zgodę sędziego-komisarza" },
      { id: "d", text: "Wartość oszacowania wszystkich ruchomości nie przekracza 50 000 zł" }
    ],
    correctAnswer: "d",
    explanation: "Zgodnie z art. 206 § 3, zezwolenie rady wierzycieli na sprzedaż ruchomości nie jest wymagane, jeżeli wskazana w spisie inwentarza wartość oszacowania wszystkich ruchomości nie przekracza równowartości 50 000 zł.",
    articleReference: "Art. 206 § 3"
  },
  {
    id: "pu-102",
    text: "Na skutek uchwały rady wierzycieli sąd zmienia syndyka, jeżeli za uchwałą głosowało:",
    answers: [
      { id: "a", text: "Co najmniej 3 członków w pełnym składzie" },
      { id: "b", text: "Co najmniej 4 członków w pełnym składzie" },
      { id: "c", text: "Wszyscy członkowie jednomyślnie" },
      { id: "d", text: "Większość członków" }
    ],
    correctAnswer: "b",
    explanation: "Art. 207a § 1 stanowi, że na skutek uchwały rady wierzycieli podjętej w pełnym składzie, za którą głosowało co najmniej czterech członków, sąd zmienia syndyka i powołuje osobę wskazaną przez radę.",
    articleReference: "Art. 207a § 1"
  },
  {
    id: "pu-103",
    text: "Jeżeli rada wierzycieli składa się z trzech członków, uchwała o zmianie syndyka:",
    answers: [
      { id: "a", text: "Wymaga większości głosów" },
      { id: "b", text: "Podejmuje się jednomyślnie" },
      { id: "c", text: "Wymaga głosowania co najmniej 2 członków" },
      { id: "d", text: "Nie może być podjęta" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 207a § 2, jeżeli rada wierzycieli składa się z trzech członków, uchwałę o zmianie syndyka podejmuje się jednomyślnie.",
    articleReference: "Art. 207a § 2"
  },
  {
    id: "pu-104",
    text: "Jeżeli rada wierzycieli nie została ustanowiona:",
    answers: [
      { id: "a", text: "Czynności zastrzeżone dla rady podejmuje zgromadzenie wierzycieli" },
      { id: "b", text: "Czynności zastrzeżone dla rady podejmuje sędzia-komisarz" },
      { id: "c", text: "Czynności zastrzeżone dla rady podejmuje syndyk samodzielnie" },
      { id: "d", text: "Postępowanie nie może być prowadzone" }
    ],
    correctAnswer: "b",
    explanation: "Art. 213 § 1 stanowi, że jeżeli rada wierzycieli nie została ustanowiona, czynności zastrzeżone dla rady wierzycieli podejmuje sędzia-komisarz.",
    articleReference: "Art. 213 § 1"
  },
  {
    id: "pu-105",
    text: "Członek rady wierzycieli:",
    answers: [
      { id: "a", text: "Nie ponosi żadnej odpowiedzialności za swoje działania" },
      { id: "b", text: "Odpowiada za szkodę wynikłą z nienależytego pełnienia obowiązków" },
      { id: "c", text: "Odpowiada solidarnie z syndykiem za zobowiązania masy" },
      { id: "d", text: "Odpowiada karnie za każdą błędną decyzję" }
    ],
    correctAnswer: "b",
    explanation: "Art. 212 § 1 stanowi, że członek rady wierzycieli odpowiada za szkodę wynikłą z nienależytego pełnienia obowiązków.",
    articleReference: "Art. 212 § 1"
  },

  // =====================================================
  // LISTA WIERZYTELNOŚCI (Art. 236-265)
  // =====================================================
  {
    id: "pu-106",
    text: "Wierzyciel osobisty upadłego powinien zgłosić swoją wierzytelność syndykowi w terminie:",
    answers: [
      { id: "a", text: "14 dni od dnia obwieszczenia postanowienia o ogłoszeniu upadłości" },
      { id: "b", text: "30 dni od dnia obwieszczenia postanowienia o ogłoszeniu upadłości" },
      { id: "c", text: "2 miesięcy od dnia ogłoszenia upadłości" },
      { id: "d", text: "W terminie określonym w postanowieniu o ogłoszeniu upadłości" }
    ],
    correctAnswer: "d",
    explanation: "Zgodnie z art. 236 § 1, wierzyciel osobisty upadłego powinien w terminie oznaczonym w postanowieniu o ogłoszeniu upadłości zgłosić syndykowi swoją wierzytelność. Standardowy termin to 30 dni (art. 51 § 1 pkt 4).",
    articleReference: "Art. 236 § 1, Art. 51 § 1 pkt 4"
  },
  {
    id: "pu-107",
    text: "Które wierzytelności NIE wymagają zgłoszenia i są umieszczane na liście z urzędu?",
    answers: [
      { id: "a", text: "Wierzytelności zabezpieczone hipoteką" },
      { id: "b", text: "Należności ze stosunku pracy" },
      { id: "c", text: "Wierzytelności podatkowe" },
      { id: "d", text: "Wierzytelności z tytułu umów handlowych" }
    ],
    correctAnswer: "b",
    explanation: "Art. 237 stanowi, że nie wymagają zgłoszenia należności ze stosunku pracy - należności z tego tytułu umieszcza się na liście wierzytelności z urzędu.",
    articleReference: "Art. 237"
  },
  {
    id: "pu-108",
    text: "Zgłoszenie wierzytelności:",
    answers: [
      { id: "a", text: "Zawiesza bieg terminu przedawnienia" },
      { id: "b", text: "Przerywa bieg terminu przedawnienia" },
      { id: "c", text: "Nie wpływa na bieg terminu przedawnienia" },
      { id: "d", text: "Powoduje wygaśnięcie roszczenia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 239a stanowi, że zgłoszenie wierzytelności przerywa bieg terminu przedawnienia. Po przerwaniu bieg przedawnienia biegnie na nowo od dnia następującego po dniu uprawomocnienia się postanowienia o zakończeniu albo umorzeniu postępowania.",
    articleReference: "Art. 239a"
  },
  {
    id: "pu-109",
    text: "W jakim terminie syndyk sporządza listę wierzytelności po upływie terminu do zgłoszenia?",
    answers: [
      { id: "a", text: "Niezwłocznie, nie później niż w terminie 1 miesiąca" },
      { id: "b", text: "Niezwłocznie, nie później niż w terminie 2 miesięcy" },
      { id: "c", text: "W terminie 3 miesięcy" },
      { id: "d", text: "W terminie wyznaczonym przez sędziego-komisarza" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 244, po upływie terminu do zgłoszenia wierzytelności i sprawdzeniu zgłoszonych wierzytelności syndyk niezwłocznie sporządza listę wierzytelności, nie później niż w terminie dwóch miesięcy od upływu okresu przewidzianego do zgłaszania wierzytelności.",
    articleReference: "Art. 244"
  },
  {
    id: "pu-110",
    text: "Wierzyciel może złożyć sprzeciw co do uznania/odmowy uznania wierzytelności w terminie:",
    answers: [
      { id: "a", text: "7 dni od dnia obwieszczenia o złożeniu listy wierzytelności" },
      { id: "b", text: "2 tygodni od dnia obwieszczenia o złożeniu listy wierzytelności" },
      { id: "c", text: "1 miesiąca od dnia obwieszczenia" },
      { id: "d", text: "W każdym czasie do zakończenia postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 256 § 1 stanowi, że w terminie dwóch tygodni od dnia obwieszczenia o dacie złożenia listy wierzytelności wierzyciel może złożyć do sędziego-komisarza sprzeciw.",
    articleReference: "Art. 256 § 1"
  },
  {
    id: "pu-111",
    text: "Sprzeciw może być oparty na twierdzeniach i zarzutach:",
    answers: [
      { id: "a", text: "Dowolnych, także nowych" },
      { id: "b", text: "Wyłącznie wskazanych w zgłoszeniu wierzytelności, z pewnymi wyjątkami" },
      { id: "c", text: "Tylko potwierdzonych dokumentami urzędowymi" },
      { id: "d", text: "Wyłącznie dotyczących wysokości wierzytelności" }
    ],
    correctAnswer: "b",
    explanation: "Art. 258 § 1 stanowi, że sprzeciw może być oparty wyłącznie na twierdzeniach i zarzutach wskazanych w zgłoszeniu wierzytelności. Inne mogą być zgłoszone tylko gdy wierzyciel wykaże, że wcześniejsze zgłoszenie było niemożliwe lub potrzeba ich wskazania wynikła później.",
    articleReference: "Art. 258 § 1"
  },
  {
    id: "pu-112",
    text: "Sędzia-komisarz rozpoznaje sprzeciw w terminie:",
    answers: [
      { id: "a", text: "7 dni od jego wniesienia" },
      { id: "b", text: "14 dni od jego wniesienia" },
      { id: "c", text: "2 miesięcy od jego wniesienia" },
      { id: "d", text: "Bez określonego terminu" }
    ],
    correctAnswer: "c",
    explanation: "Zgodnie z art. 259 § 1, sędzia-komisarz, zastępca sędziego-komisarza albo wyznaczony sędzia rozpoznaje sprzeciw na posiedzeniu niejawnym w terminie dwóch miesięcy od jego wniesienia.",
    articleReference: "Art. 259 § 1"
  },
  {
    id: "pu-113",
    text: "Wierzytelność w walucie obcej umieszcza się na liście:",
    answers: [
      { id: "a", text: "W walucie obcej bez przeliczania" },
      { id: "b", text: "Po przeliczeniu na złote według kursu NBP z dnia ogłoszenia upadłości" },
      { id: "c", text: "Po przeliczeniu na złote według kursu NBP z dnia zgłoszenia wierzytelności" },
      { id: "d", text: "Po przeliczeniu według kursu wybranego przez wierzyciela" }
    ],
    correctAnswer: "b",
    explanation: "Art. 251 stanowi, że wierzytelność w walucie obcej bez względu na termin jej wymagalności umieszcza się na liście po przeliczeniu na walutę polską według średniego kursu walut obcych w NBP z dnia ogłoszenia upadłości.",
    articleReference: "Art. 251"
  },

  // =====================================================
  // LIKWIDACJA MASY UPADŁOŚCI (Art. 306-341)
  // =====================================================
  {
    id: "pu-114",
    text: "Syndyk jest obowiązany do podejmowania działań umożliwiających zakończenie likwidacji w ciągu:",
    answers: [
      { id: "a", text: "3 miesięcy od dnia ogłoszenia upadłości" },
      { id: "b", text: "6 miesięcy od dnia ogłoszenia upadłości" },
      { id: "c", text: "12 miesięcy od dnia ogłoszenia upadłości" },
      { id: "d", text: "Terminu wyznaczonego przez sędziego-komisarza" }
    ],
    correctAnswer: "b",
    explanation: "Art. 308 § 2 stanowi, że syndyk jest obowiązany do podejmowania działań umożliwiających zakończenie likwidacji w ciągu sześciu miesięcy od dnia ogłoszenia upadłości.",
    articleReference: "Art. 308 § 2"
  },
  {
    id: "pu-115",
    text: "Przedsiębiorstwo upadłego powinno być sprzedane:",
    answers: [
      { id: "a", text: "Zawsze w częściach" },
      { id: "b", text: "Jako całość, chyba że nie jest to możliwe" },
      { id: "c", text: "Wyłącznie w drodze przetargu publicznego" },
      { id: "d", text: "Tylko do likwidacji przez umorzenie" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 316 § 1, przedsiębiorstwo upadłego powinno być sprzedane jako całość, chyba że nie jest to możliwe.",
    articleReference: "Art. 316 § 1"
  },
  {
    id: "pu-116",
    text: "Sprzedaż dokonana w postępowaniu upadłościowym ma skutki:",
    answers: [
      { id: "a", text: "Sprzedaży cywilnoprawnej" },
      { id: "b", text: "Sprzedaży egzekucyjnej" },
      { id: "c", text: "Darowizny z obciążeniami" },
      { id: "d", text: "Cesji wierzytelności" }
    ],
    correctAnswer: "b",
    explanation: "Art. 313 § 1 stanowi, że sprzedaż dokonana w postępowaniu upadłościowym ma skutki sprzedaży egzekucyjnej. Nabywca składników masy upadłości nie odpowiada za zobowiązania podatkowe upadłego.",
    articleReference: "Art. 313 § 1"
  },
  {
    id: "pu-117",
    text: "Na nabywcę przedsiębiorstwa upadłego przechodzą:",
    answers: [
      { id: "a", text: "Wszystkie zobowiązania upadłego" },
      { id: "b", text: "Wszelkie koncesje, zezwolenia, licencje i ulgi" },
      { id: "c", text: "Wszystkie obciążenia hipoteczne" },
      { id: "d", text: "Odpowiedzialność za długi podatkowe" }
    ],
    correctAnswer: "b",
    explanation: "Art. 317 § 1 stanowi, że na nabywcę przedsiębiorstwa upadłego przechodzą wszelkie koncesje, zezwolenia, licencje i ulgi, które zostały udzielone upadłemu, chyba że odrębne ustawy stanowią inaczej.",
    articleReference: "Art. 317 § 1"
  },
  {
    id: "pu-118",
    text: "O przetargu lub aukcji dotyczącej przedsiębiorstwa należy obwieścić co najmniej na:",
    answers: [
      { id: "a", text: "Tydzień przed terminem" },
      { id: "b", text: "Dwa tygodnie przed terminem" },
      { id: "c", text: "Miesiąc przed terminem" },
      { id: "d", text: "Trzy miesiące przed terminem" }
    ],
    correctAnswer: "b",
    explanation: "Art. 320 § 1 pkt 2 stanowi, że o przetargu lub aukcji należy zawiadomić przez obwieszczenie co najmniej na dwa tygodnie przed terminem posiedzenia wyznaczonego w celu ich przeprowadzenia.",
    articleReference: "Art. 320 § 1 pkt 2"
  },
  {
    id: "pu-119",
    text: "W przypadku sprzedaży przedsiębiorstwa spółki publicznej termin obwieszczenia o przetargu/aukcji wynosi:",
    answers: [
      { id: "a", text: "Dwa tygodnie" },
      { id: "b", text: "Cztery tygodnie" },
      { id: "c", text: "Sześć tygodni" },
      { id: "d", text: "Osiem tygodni" }
    ],
    correctAnswer: "c",
    explanation: "Zgodnie z art. 320 § 1 pkt 2, jeżeli przetarg albo aukcja dotyczy przedsiębiorstwa spółki publicznej, obwieszczenia dokonuje się co najmniej na sześć tygodni przed terminem.",
    articleReference: "Art. 320 § 1 pkt 2"
  },
  {
    id: "pu-120",
    text: "Syndyk zawiera umowę sprzedaży w terminie nie dłuższym niż:",
    answers: [
      { id: "a", text: "Miesiąc od zatwierdzenia wyboru oferenta" },
      { id: "b", text: "Dwa miesiące od zatwierdzenia wyboru oferenta" },
      { id: "c", text: "Cztery miesiące od zatwierdzenia wyboru oferenta" },
      { id: "d", text: "Sześć miesięcy od zatwierdzenia wyboru oferenta" }
    ],
    correctAnswer: "c",
    explanation: "Art. 321 § 1 stanowi, że syndyk zawiera umowę sprzedaży w terminie określonym przez sędziego-komisarza, nie dłuższym niż cztery miesiące od dnia zatwierdzenia wyboru oferenta.",
    articleReference: "Art. 321 § 1"
  },
  {
    id: "pu-121",
    text: "Sprzedaż nieruchomości powoduje wygaśnięcie:",
    answers: [
      { id: "a", text: "Tylko hipotek" },
      { id: "b", text: "Praw oraz praw i roszczeń osobistych ujawnionych przez wpis do księgi wieczystej lub zgłoszonych syndykowi w terminie" },
      { id: "c", text: "Wyłącznie służebności" },
      { id: "d", text: "Wszystkich praw bez wyjątku" }
    ],
    correctAnswer: "b",
    explanation: "Art. 313 § 2 stanowi, że sprzedaż nieruchomości powoduje wygaśnięcie praw oraz praw i roszczeń osobistych ujawnionych przez wpis do księgi wieczystej albo nieujawnionych w ten sposób, lecz zgłoszonych syndykowi w określonym terminie.",
    articleReference: "Art. 313 § 2"
  },
  {
    id: "pu-122",
    text: "Które prawa pozostają w mocy po sprzedaży nieruchomości bez potrącania ich wartości z ceny?",
    answers: [
      { id: "a", text: "Wszystkie hipoteki" },
      { id: "b", text: "Służebność drogi koniecznej, służebność przesyłu, służebność przy przekroczeniu granicy" },
      { id: "c", text: "Tylko prawa osobiste" },
      { id: "d", text: "Żadne prawa nie pozostają w mocy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 313 § 3 stanowi, że pozostają w mocy bez potrącania ich wartości z ceny nabycia służebność drogi koniecznej, służebność przesyłu oraz służebność ustanowiona w związku z przekroczeniem granicy przy wznoszeniu budowli.",
    articleReference: "Art. 313 § 3"
  },
  {
    id: "pu-123",
    text: "Zastawnik zastawu rejestrowego może zaspokoić się przez przejęcie przedmiotu zastawu, jeżeli:",
    answers: [
      { id: "a", text: "Sędzia-komisarz wyrazi zgodę" },
      { id: "b", text: "Umowa o ustanowienie zastawu przewiduje taki sposób zaspokojenia" },
      { id: "c", text: "Syndyk wyrazi zgodę" },
      { id: "d", text: "Rada wierzycieli podejmie stosowną uchwałę" }
    ],
    correctAnswer: "b",
    explanation: "Art. 327 § 1 stanowi, że zastawnik zastawu rejestrowego może zaspokoić się z przedmiotu zastawu przez jego przejęcie albo zbycie w trybie określonym w art. 24 ustawy o zastawie rejestrowym, jeżeli umowa o ustanowienie zastawu przewiduje taki sposób zaspokojenia zastawnika.",
    articleReference: "Art. 327 § 1"
  },

  // =====================================================
  // PLAN PODZIAŁU (Art. 347-360)
  // =====================================================
  {
    id: "pu-124",
    text: "Plan podziału funduszów masy upadłości sporządza:",
    answers: [
      { id: "a", text: "Sędzia-komisarz" },
      { id: "b", text: "Syndyk" },
      { id: "c", text: "Rada wierzycieli" },
      { id: "d", text: "Zgromadzenie wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 347, plan podziału funduszów masy upadłości sporządza syndyk i przedkłada go sędziemu-komisarzowi.",
    articleReference: "Art. 347"
  },
  {
    id: "pu-125",
    text: "W jakim terminie wierzyciele mogą wnieść zarzuty przeciwko planowi podziału?",
    answers: [
      { id: "a", text: "7 dni od dnia obwieszczenia" },
      { id: "b", text: "2 tygodnie od dnia obwieszczenia" },
      { id: "c", text: "1 miesiąc od dnia obwieszczenia" },
      { id: "d", text: "3 miesiące od dnia obwieszczenia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 349 § 2 stanowi, że w terminie dwóch tygodni od dnia obwieszczenia o planie podziału można wnieść zarzuty przeciwko planowi podziału.",
    articleReference: "Art. 349 § 2"
  },
  {
    id: "pu-126",
    text: "Po wykonaniu ostatecznego planu podziału:",
    answers: [
      { id: "a", text: "Sąd wydaje postanowienie o umorzeniu postępowania" },
      { id: "b", text: "Sąd wydaje postanowienie o zakończeniu postępowania" },
      { id: "c", text: "Syndyk składa sprawozdanie końcowe" },
      { id: "d", text: "Upadły odzyskuje zarząd majątkiem automatycznie" }
    ],
    correctAnswer: "b",
    explanation: "Zgodnie z art. 368 pkt 1, po wykonaniu ostatecznego planu podziału sąd stwierdza zakończenie postępowania upadłościowego.",
    articleReference: "Art. 368 pkt 1"
  },

  // =====================================================
  // ZAKOŃCZENIE I UMORZENIE POSTĘPOWANIA (Art. 361-372)
  // =====================================================
  {
    id: "pu-127",
    text: "Sąd umarza postępowanie upadłościowe, jeżeli:",
    answers: [
      { id: "a", text: "Syndyk złoży wniosek o umorzenie" },
      { id: "b", text: "Majątek pozostały po wyłączeniu z masy nie wystarcza na zaspokojenie kosztów postępowania lub gdy wierzyciele nie złożyli zaliczki" },
      { id: "c", text: "Upadły o to wniesie" },
      { id: "d", text: "Upłyną 2 lata od ogłoszenia upadłości" }
    ],
    correctAnswer: "b",
    explanation: "Art. 361 § 1 pkt 1 stanowi, że sąd umarza postępowanie upadłościowe, jeżeli majątek pozostały po wyłączeniu z niego przedmiotów majątkowych obciążonych hipoteką, zastawem, zastawem rejestrowym, zastawem skarbowym lub hipoteką morską nie wystarcza na zaspokojenie kosztów postępowania.",
    articleReference: "Art. 361 § 1 pkt 1"
  },
  {
    id: "pu-128",
    text: "Umorzenie postępowania upadłościowego powoduje:",
    answers: [
      { id: "a", text: "Umorzenie zobowiązań upadłego" },
      { id: "b", text: "Że upadły odzyskuje prawo zarządzania swoim majątkiem" },
      { id: "c", text: "Trwały zakaz prowadzenia działalności gospodarczej" },
      { id: "d", text: "Wygaśnięcie wierzytelności" }
    ],
    correctAnswer: "b",
    explanation: "Art. 364 § 1 stanowi, że z dniem uprawomocnienia się postanowienia o umorzeniu postępowania upadłościowego upadły odzyskuje prawo zarządzania swoim majątkiem.",
    articleReference: "Art. 364 § 1"
  },
  {
    id: "pu-129",
    text: "Sąd stwierdza zakończenie postępowania upadłościowego:",
    answers: [
      { id: "a", text: "Po upływie roku od ogłoszenia upadłości" },
      { id: "b", text: "Po wykonaniu ostatecznego planu podziału albo po zatwierdzeniu układu" },
      { id: "c", text: "Na wniosek upadłego" },
      { id: "d", text: "Po zapłacie wszystkich wierzytelności w 100%" }
    ],
    correctAnswer: "b",
    explanation: "Art. 368 stanowi, że sąd stwierdza zakończenie postępowania upadłościowego po wykonaniu ostatecznego planu podziału (pkt 1) albo gdy postanowienie o zatwierdzeniu układu stało się prawomocne (pkt 2).",
    articleReference: "Art. 368"
  },

  // =====================================================
  // UPADŁOŚĆ KONSUMENCKA (Art. 491¹-491³⁸)
  // =====================================================
  {
    id: "pu-130",
    text: "Przepisy o upadłości konsumenckiej (Tytuł V) stosuje się wobec:",
    answers: [
      { id: "a", text: "Wszystkich osób fizycznych" },
      { id: "b", text: "Osób fizycznych nieprowadzących działalności gospodarczej" },
      { id: "c", text: "Tylko osób z zadłużeniem powyżej 100 000 zł" },
      { id: "d", text: "Wyłącznie emerytów i rencistów" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹ § 1 stanowi, że przepisy tytułu V stosuje się wobec osób fizycznych, których upadłości nie można ogłosić zgodnie z przepisami działu II tytułu I części pierwszej (czyli konsumentów nieprowadzących działalności gospodarczej).",
    articleReference: "Art. 491¹ § 1"
  },
  {
    id: "pu-131",
    text: "Sprawy o ogłoszenie upadłości konsumenckiej rozpoznaje sąd w składzie:",
    answers: [
      { id: "a", text: "Trzech sędziów zawodowych" },
      { id: "b", text: "Jednego sędziego zawodowego" },
      { id: "c", text: "Jednego sędziego i dwóch ławników" },
      { id: "d", text: "Referendarza sądowego" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491³ stanowi, że sprawy o ogłoszenie upadłości objęte przepisami tytułu V rozpoznaje sąd upadłościowy w składzie jednego sędziego zawodowego.",
    articleReference: "Art. 491³"
  },
  {
    id: "pu-132",
    text: "Postępowanie upadłościowe konsumenckie prowadzi się także, gdy dłużnik:",
    answers: [
      { id: "a", text: "Ma więcej niż 10 wierzycieli" },
      { id: "b", text: "Ma tylko jednego wierzyciela" },
      { id: "c", text: "Ma majątek o wartości powyżej 50 000 zł" },
      { id: "d", text: "Jest zatrudniony na umowę o pracę" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491² § 2 stanowi, że postępowanie upadłościowe w sprawach objętych przepisami tytułu V prowadzi się także wtedy, gdy dłużnik ma tylko jednego wierzyciela.",
    articleReference: "Art. 491² § 2"
  },
  {
    id: "pu-133",
    text: "W przypadku gdy majątek dłużnika-konsumenta nie wystarcza na pokrycie kosztów postępowania:",
    answers: [
      { id: "a", text: "Postępowanie nie może być wszczęte" },
      { id: "b", text: "Koszty pokrywa tymczasowo Skarb Państwa" },
      { id: "c", text: "Koszty muszą pokryć wierzyciele" },
      { id: "d", text: "Syndyk pracuje bez wynagrodzenia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491⁷ § 1 stanowi, że w przypadku, gdy majątek niewypłacalnego dłużnika nie wystarcza na pokrycie kosztów postępowania albo w masie upadłości brak jest płynnych funduszów na ich pokrycie, koszty te pokrywa tymczasowo Skarb Państwa.",
    articleReference: "Art. 491⁷ § 1"
  },
  {
    id: "pu-134",
    text: "Wynagrodzenie syndyka w upadłości konsumenckiej ustala się w wysokości:",
    answers: [
      { id: "a", text: "Od 1/10 do 1/2 przeciętnego miesięcznego wynagrodzenia" },
      { id: "b", text: "Od 1/4 do dwukrotności przeciętnego miesięcznego wynagrodzenia" },
      { id: "c", text: "Od jednokrotności do dziesięciokrotności przeciętnego wynagrodzenia" },
      { id: "d", text: "Według swobodnego uznania sądu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491⁹ § 2 stanowi, że wynagrodzenie syndyka ustala się w wysokości od jednej czwartej przeciętnego miesięcznego wynagrodzenia w sektorze przedsiębiorstw do jego dwukrotności.",
    articleReference: "Art. 491⁹ § 2"
  },
  {
    id: "pu-135",
    text: "W szczególnie uzasadnionych przypadkach wynagrodzenie syndyka w upadłości konsumenckiej może wynosić do:",
    answers: [
      { id: "a", text: "Dwukrotności przeciętnego wynagrodzenia" },
      { id: "b", text: "Czterokrotności przeciętnego wynagrodzenia" },
      { id: "c", text: "Dziesięciokrotności przeciętnego wynagrodzenia" },
      { id: "d", text: "Stukrotności przeciętnego wynagrodzenia" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491⁹ § 3 stanowi, że w szczególnie uzasadnionych przypadkach sąd może ustalić wynagrodzenie syndyka w wysokości do czterokrotności przeciętnego miesięcznego wynagrodzenia.",
    articleReference: "Art. 491⁹ § 3"
  },
  {
    id: "pu-136",
    text: "Sąd umarza postępowanie upadłościowe konsumenckie na wniosek upadłego:",
    answers: [
      { id: "a", text: "Tylko za zgodą wszystkich wierzycieli" },
      { id: "b", text: "Bez ograniczeń, zawsze gdy upadły o to wnioskuje" },
      { id: "c", text: "Tylko w pierwszym miesiącu postępowania" },
      { id: "d", text: "Tylko za zgodą syndyka" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁰ § 1 stanowi, że sąd umarza postępowanie na wniosek upadłego. Jest to prawo bezwarunkowe dla upadłego-konsumenta.",
    articleReference: "Art. 491¹⁰ § 1"
  },
  {
    id: "pu-137",
    text: "Sąd umarza postępowanie, jeżeli upadły nie wskaże lub nie wyda syndykowi całego majątku, chyba że:",
    answers: [
      { id: "a", text: "Upadły zapłaci karę" },
      { id: "b", text: "Uchybienie nie jest istotne lub przeprowadzenie postępowania jest uzasadnione względami słuszności lub humanitarnymi" },
      { id: "c", text: "Syndyk wyrazi zgodę na kontynuowanie postępowania" },
      { id: "d", text: "Wierzyciele nie zgłoszą sprzeciwu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁰ § 2 stanowi, że sąd umarza postępowanie, jeżeli upadły nie wskaże lub nie wyda syndykowi całego majątku, chyba że uchybienie nie jest istotne lub przeprowadzenie postępowania jest uzasadnione względami słuszności lub względami humanitarnymi.",
    articleReference: "Art. 491¹⁰ § 2"
  },
  {
    id: "pu-138",
    text: "Plan spłaty wierzycieli w upadłości konsumenckiej ustalany jest na okres nie dłuższy niż:",
    answers: [
      { id: "a", text: "12 miesięcy" },
      { id: "b", text: "24 miesiące" },
      { id: "c", text: "36 miesięcy" },
      { id: "d", text: "60 miesięcy" }
    ],
    correctAnswer: "c",
    explanation: "Art. 491¹⁵ § 1 pkt 4 stanowi, że plan spłaty określa okres spłaty nie dłuższy niż trzydzieści sześć miesięcy (3 lata). Przy umyślności lub rażącym niedbalstwie okres może być dłuższy.",
    articleReference: "Art. 491¹⁵ § 1 pkt 4"
  },
  {
    id: "pu-139",
    text: "Jeżeli upadły doprowadził do niewypłacalności umyślnie lub wskutek rażącego niedbalstwa, plan spłaty ustalany jest na okres:",
    answers: [
      { id: "a", text: "Nie krótszy niż 12 i nie dłuższy niż 36 miesięcy" },
      { id: "b", text: "Nie krótszy niż 36 i nie dłuższy niż 84 miesiące (3-7 lat)" },
      { id: "c", text: "Dokładnie 60 miesięcy" },
      { id: "d", text: "Nie krótszy niż 60 i nie dłuższy niż 120 miesięcy" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁵ § 1a stanowi, że w przypadku ustalenia, że upadły doprowadził do swojej niewypłacalności lub istotnie zwiększył jej stopień umyślnie lub wskutek rażącego niedbalstwa, plan spłaty wierzycieli nie może być ustalony na okres krótszy niż 36 miesięcy ani dłuższy niż 84 miesiące.",
    articleReference: "Art. 491¹⁵ § 1a"
  },
  {
    id: "pu-140",
    text: "Jeżeli upadły spłaci co najmniej 70% zobowiązań, plan spłaty nie może być ustalony na okres dłuższy niż:",
    answers: [
      { id: "a", text: "6 miesięcy" },
      { id: "b", text: "1 rok" },
      { id: "c", text: "2 lata" },
      { id: "d", text: "3 lata" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁵ § 1b stanowi, że w przypadku gdy w drodze wykonania planu spłaty dłużnik spłaci co najmniej 70% zobowiązań, plan spłaty wierzycieli nie może zostać ustalony na okres dłuższy niż rok.",
    articleReference: "Art. 491¹⁵ § 1b"
  },
  {
    id: "pu-141",
    text: "Jeżeli upadły spłaci co najmniej 50% zobowiązań, plan spłaty nie może być ustalony na okres dłuższy niż:",
    answers: [
      { id: "a", text: "1 rok" },
      { id: "b", text: "2 lata" },
      { id: "c", text: "3 lata" },
      { id: "d", text: "4 lata" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁵ § 1c stanowi, że w przypadku gdy w drodze wykonania planu spłaty dłużnik spłaci co najmniej 50% zobowiązań, plan spłaty wierzycieli nie może zostać ustalony na okres dłuższy niż dwa lata.",
    articleReference: "Art. 491¹⁵ § 1c"
  },
  {
    id: "pu-142",
    text: "Sąd umarza zobowiązania upadłego bez ustalenia planu spłaty, jeśli:",
    answers: [
      { id: "a", text: "Upadły o to wniesie" },
      { id: "b", text: "Osobista sytuacja upadłego w oczywisty sposób wskazuje, że jest trwale niezdolny do dokonywania jakichkolwiek spłat" },
      { id: "c", text: "Wierzyciele wyrażą zgodę" },
      { id: "d", text: "Zobowiązania nie przekraczają 50 000 zł" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁶ § 1 stanowi, że sąd umarza zobowiązania upadłego bez ustalenia planu spłaty wierzycieli, jeśli osobista sytuacja upadłego w oczywisty sposób wskazuje, że jest on trwale niezdolny do dokonywania jakichkolwiek spłat w ramach planu spłaty wierzycieli.",
    articleReference: "Art. 491¹⁶ § 1"
  },
  {
    id: "pu-143",
    text: "Warunkowe umorzenie zobowiązań bez planu spłaty następuje, gdy niezdolność do spłat:",
    answers: [
      { id: "a", text: "Jest trwała" },
      { id: "b", text: "Nie ma charakteru trwałego" },
      { id: "c", text: "Wynika z winy upadłego" },
      { id: "d", text: "Dotyczy tylko zobowiązań alimentacyjnych" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁶ § 2a stanowi, że jeżeli niezdolność do dokonywania jakichkolwiek spłat wynikająca z osobistej sytuacji upadłego nie ma charakteru trwałego, sąd umarza zobowiązania upadłego warunkowo.",
    articleReference: "Art. 491¹⁶ § 2a"
  },
  {
    id: "pu-144",
    text: "Okres warunkowego umorzenia zobowiązań bez planu spłaty wynosi:",
    answers: [
      { id: "a", text: "3 lata" },
      { id: "b", text: "5 lat" },
      { id: "c", text: "7 lat" },
      { id: "d", text: "10 lat" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁶ § 2a stanowi, że warunkowe umorzenie następuje pod warunkiem, że w terminie pięciu lat od dnia uprawomocnienia się postanowienia nie zostanie złożony wniosek o ustalenie planu spłaty.",
    articleReference: "Art. 491¹⁶ § 2a"
  },
  {
    id: "pu-145",
    text: "W okresie warunkowego umorzenia zobowiązań upadły NIE może:",
    answers: [
      { id: "a", text: "Podejmować pracy zarobkowej" },
      { id: "b", text: "Dokonywać czynności prawnych dotyczących jego majątku, które mogłyby pogorszyć jego sytuację majątkową" },
      { id: "c", text: "Zawierać związku małżeńskiego" },
      { id: "d", text: "Zmieniać miejsca zamieszkania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁶ § 2c stanowi, że w okresie pięciu lat od dnia uprawomocnienia się postanowienia o warunkowym umorzeniu zobowiązań upadły nie może dokonywać czynności prawnych dotyczących jego majątku, które mogłyby pogorszyć jego sytuację majątkową.",
    articleReference: "Art. 491¹⁶ § 2c"
  },
  {
    id: "pu-146",
    text: "W okresie wykonywania planu spłaty upadły składa sądowi sprawozdanie z wykonania planu:",
    answers: [
      { id: "a", text: "Co miesiąc" },
      { id: "b", text: "Co kwartał" },
      { id: "c", text: "Corocznie, do końca kwietnia" },
      { id: "d", text: "Tylko na żądanie sądu" }
    ],
    correctAnswer: "c",
    explanation: "Art. 491¹⁸ § 3 stanowi, że upadły jest obowiązany składać sądowi corocznie, do końca kwietnia, sprawozdanie z wykonania planu spłaty wierzycieli za poprzedni rok kalendarzowy.",
    articleReference: "Art. 491¹⁸ § 3"
  },
  {
    id: "pu-147",
    text: "Sędzia-komisarz może przedłużyć okres planu spłaty na dalszy okres nieprzekraczający:",
    answers: [
      { id: "a", text: "6 miesięcy" },
      { id: "b", text: "12 miesięcy" },
      { id: "c", text: "18 miesięcy" },
      { id: "d", text: "24 miesiące" }
    ],
    correctAnswer: "c",
    explanation: "Art. 491¹⁹ § 1 stanowi, że sąd może przedłużyć termin spłaty wierzytelności na dalszy okres nieprzekraczający osiemnastu miesięcy.",
    articleReference: "Art. 491¹⁹ § 1"
  },
  {
    id: "pu-148",
    text: "Które zobowiązania NIE podlegają umorzeniu po wykonaniu planu spłaty?",
    answers: [
      { id: "a", text: "Zobowiązania z tytułu kredytów bankowych" },
      { id: "b", text: "Zobowiązania alimentacyjne, renty odszkodowawcze, kary grzywny i obowiązki naprawienia szkody orzeczone przez sąd" },
      { id: "c", text: "Zobowiązania z tytułu umów leasingu" },
      { id: "d", text: "Zobowiązania wobec organów administracji" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491²¹ § 2 wymienia zobowiązania niepodlegające umorzeniu: alimentacyjne, renty odszkodowawcze, kary grzywny, obowiązek naprawienia szkody i zadośćuczynienia orzeczone przez sąd, nawiązki, oraz zobowiązania z przestępstw lub wykroczeń.",
    articleReference: "Art. 491²¹ § 2"
  },
  {
    id: "pu-149",
    text: "Sąd odmawia ustalenia planu spłaty, jeżeli upadły doprowadził do niewypłacalności celowo, chyba że:",
    answers: [
      { id: "a", text: "Syndyk wyrazi zgodę" },
      { id: "b", text: "Wierzyciele wyrażą zgodę" },
      { id: "c", text: "Ustalenie planu jest uzasadnione względami słuszności lub humanitarnymi" },
      { id: "d", text: "Od celowego działania upłynęło 10 lat" }
    ],
    correctAnswer: "c",
    explanation: "Art. 491¹⁴ᵃ § 1 pkt 1 stanowi, że sąd odmawia ustalenia planu spłaty, jeżeli upadły doprowadził do swojej niewypłacalności w sposób celowy, chyba że ustalenie planu spłaty jest uzasadnione względami słuszności lub względami humanitarnymi.",
    articleReference: "Art. 491¹⁴ᵃ § 1 pkt 1"
  },
  {
    id: "pu-150",
    text: "Sąd odmawia ustalenia planu spłaty także, jeżeli w ciągu ostatnich ilu lat przed wnioskiem upadłemu już umorzono zobowiązania?",
    answers: [
      { id: "a", text: "5 lat" },
      { id: "b", text: "10 lat" },
      { id: "c", text: "15 lat" },
      { id: "d", text: "20 lat" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁴ᵃ § 1 pkt 2 stanowi, że sąd odmawia ustalenia planu spłaty, jeżeli w okresie dziesięciu lat przed dniem zgłoszenia wniosku o ogłoszenie upadłości w stosunku do upadłego prowadzono postępowanie upadłościowe, w którym umorzono całość lub część jego zobowiązań.",
    articleReference: "Art. 491¹⁴ᵃ § 1 pkt 2"
  },
  {
    id: "pu-151",
    text: "Na czynności syndyka w upadłości konsumenckiej przysługuje skarga do:",
    answers: [
      { id: "a", text: "Sędziego-komisarza" },
      { id: "b", text: "Sądu upadłościowego" },
      { id: "c", text: "Rady wierzycieli" },
      { id: "d", text: "Ministra Sprawiedliwości" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹²ᵃ § 1 stanowi, że na czynności syndyka przysługuje skarga do sądu upadłościowego. Dotyczy to także zaniechania przez syndyka dokonania czynności.",
    articleReference: "Art. 491¹²ᵃ § 1"
  },
  {
    id: "pu-152",
    text: "Skargę na czynności syndyka w upadłości konsumenckiej wnosi się w terminie:",
    answers: [
      { id: "a", text: "3 dni od dnia czynności" },
      { id: "b", text: "7 dni od dnia dokonania czynności (gdy strona była obecna lub zawiadomiona)" },
      { id: "c", text: "14 dni od dnia czynności" },
      { id: "d", text: "30 dni od dnia czynności" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹²ᵃ § 4 stanowi, że skargę wnosi się w terminie siedmiu dni od dnia dokonania czynności, gdy strona była przy czynności obecna lub była o jej terminie zawiadomiona.",
    articleReference: "Art. 491¹²ᵃ § 4"
  },
  {
    id: "pu-153",
    text: "Wyboru sposobu likwidacji masy upadłości w upadłości konsumenckiej dokonuje:",
    answers: [
      { id: "a", text: "Sędzia-komisarz" },
      { id: "b", text: "Syndyk samodzielnie" },
      { id: "c", text: "Rada wierzycieli" },
      { id: "d", text: "Zgromadzenie wierzycieli" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹¹ᵃ § 1 stanowi, że wyboru sposobu likwidacji masy upadłości dokonuje samodzielnie syndyk w sposób, który umożliwia zaspokojenie wierzycieli w jak największym stopniu, z uwzględnieniem kosztów likwidacji.",
    articleReference: "Art. 491¹¹ᵃ § 1"
  },
  {
    id: "pu-154",
    text: "W przypadku braku zgłoszeń wierzytelności i braku wierzytelności podlegających umieszczeniu z urzędu na liście:",
    answers: [
      { id: "a", text: "Postępowanie zostaje umorzone" },
      { id: "b", text: "Sąd wydaje postanowienie o umorzeniu zobowiązań upadłego bez planu spłaty" },
      { id: "c", text: "Postępowanie trwa do wyczerpania masy" },
      { id: "d", text: "Syndyk sporządza plan spłaty z zerowymi kwotami" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹⁴ § 5 stanowi, że w przypadku braku zgłoszeń wierzytelności i braku wierzytelności podlegających umieszczeniu z urzędu, sąd po upływie terminu do zgłoszenia wydaje postanowienie o umorzeniu zobowiązań upadłego bez ustalenia planu spłaty.",
    articleReference: "Art. 491¹⁴ § 5"
  },

  // =====================================================
  // DODATKOWE PYTANIA - SZCZEGÓŁY PROCEDURALNE
  // =====================================================
  {
    id: "pu-155",
    text: "Sąd może prowadzić postępowanie upadłościowe konsumenta według przepisów ogólnych (część I), jeżeli:",
    answers: [
      { id: "a", text: "Dłużnik o to wniesie" },
      { id: "b", text: "Jest to uzasadnione znacznym rozmiarem majątku, znaczną liczbą wierzycieli lub zwiększonym stopniem skomplikowania" },
      { id: "c", text: "Syndyk złoży stosowny wniosek" },
      { id: "d", text: "Wszyscy wierzyciele wyrażą zgodę" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491¹ § 2 stanowi, że sąd może postanowić o prowadzeniu postępowania według przepisów części pierwszej, jeżeli jest to uzasadnione znacznym rozmiarem majątku dłużnika, znaczną liczbą wierzycieli lub innymi uzasadnionymi przewidywaniami co do zwiększonego stopnia skomplikowania postępowania.",
    articleReference: "Art. 491¹ § 2"
  },
  {
    id: "pu-156",
    text: "Fundusze masy upadłości obejmują:",
    answers: [
      { id: "a", text: "Tylko środki pieniężne znalezione u upadłego w dniu ogłoszenia upadłości" },
      { id: "b", text: "Sumy uzyskane z likwidacji masy upadłości oraz dochód z prowadzenia/wydzierżawienia przedsiębiorstwa i odsetki" },
      { id: "c", text: "Wyłącznie wpływy ze sprzedaży nieruchomości" },
      { id: "d", text: "Środki wpłacone przez wierzycieli na koszty postępowania" }
    ],
    correctAnswer: "b",
    explanation: "Art. 335 stanowi, że fundusze masy upadłości obejmują sumy uzyskane z likwidacji masy upadłości oraz dochód uzyskany z prowadzenia lub wydzierżawienia przedsiębiorstwa upadłego, a także odsetki od tych sum zdeponowanych w banku.",
    articleReference: "Art. 335"
  },
  {
    id: "pu-157",
    text: "Uchwały rady wierzycieli podejmuje się większością głosów w terminie:",
    answers: [
      { id: "a", text: "Tygodnia od dnia złożenia wniosku do rady" },
      { id: "b", text: "Dwóch tygodni od dnia złożenia wniosku do rady" },
      { id: "c", text: "Miesiąca od dnia złożenia wniosku do rady" },
      { id: "d", text: "Bez określonego terminu" }
    ],
    correctAnswer: "b",
    explanation: "Art. 207 § 1b stanowi, że uchwały rady wierzycieli podejmuje się większością głosów w terminie dwóch tygodni od dnia złożenia wniosku do rady.",
    articleReference: "Art. 207 § 1b"
  },
  {
    id: "pu-158",
    text: "Wynagrodzenie członka rady wierzycieli za udział w posiedzeniu nie może przekraczać:",
    answers: [
      { id: "a", text: "1% przeciętnego wynagrodzenia za jeden dzień" },
      { id: "b", text: "3% przeciętnego wynagrodzenia za jeden dzień" },
      { id: "c", text: "5% przeciętnego wynagrodzenia za jeden dzień" },
      { id: "d", text: "10% przeciętnego wynagrodzenia za jeden dzień" }
    ],
    correctAnswer: "b",
    explanation: "Art. 211 § 1 stanowi, że za udział w posiedzeniu sędzia-komisarz może przyznać członkowi rady stosowne wynagrodzenie, które nie może przekraczać 3% miesięcznego przeciętnego wynagrodzenia za jeden dzień posiedzenia.",
    articleReference: "Art. 211 § 1"
  },
  {
    id: "pu-159",
    text: "Po zakończeniu pełnienia funkcji syndyk składa sędziemu-komisarzowi:",
    answers: [
      { id: "a", text: "Raport finansowy" },
      { id: "b", text: "Sprawozdanie ostateczne" },
      { id: "c", text: "Bilans końcowy" },
      { id: "d", text: "Oświadczenie majątkowe" }
    ],
    correctAnswer: "b",
    explanation: "Art. 168 § 4 stanowi, że po zakończeniu pełnienia funkcji syndyk i jego zastępcy składają sędziemu-komisarzowi sprawozdanie ostateczne obejmujące raport ze zmian w stanie masy, raport ze zmian stanu wierzytelności, raport z wpływów i wydatków oraz opis czynności.",
    articleReference: "Art. 168 § 4"
  },
  {
    id: "pu-160",
    text: "W przypadku postępowania konsumenckiego wszczętego na wniosek wierzyciela, koszty postępowania pokrywa Skarb Państwa:",
    answers: [
      { id: "a", text: "Zawsze" },
      { id: "b", text: "Tylko jeżeli dłużnik nie sprzeciwia się umorzeniu postępowania" },
      { id: "c", text: "Nigdy - koszty pokrywa wierzyciel" },
      { id: "d", text: "Tylko po zatwierdzeniu przez sąd" }
    ],
    correctAnswer: "b",
    explanation: "Art. 491⁷ § 5 stanowi, że w przypadku postępowania wszczętego wyłącznie na wniosek wierzyciela przepisów o tymczasowym pokryciu kosztów przez Skarb Państwa nie stosuje się, jeżeli dłużnik nie sprzeciwia się umorzeniu postępowania. Czyli Skarb Państwa pokrywa koszty gdy dłużnik chce kontynuacji.",
    articleReference: "Art. 491⁷ § 5"
  }
];

export default prawoUpadlosciowePart2Questions;
