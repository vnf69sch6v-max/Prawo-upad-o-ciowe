// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 2 - Dodatkowe 100 pytań
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART2: ExamQuestion[] = [

  // ============================================================
  // SPÓŁKA Z O.O. - POGŁĘBIONE PYTANIA
  // ============================================================

  {
    id: 'ksh-101',
    article: 'Art. 159',
    articleTitle: 'Umowa spółki z o.o. - jednomyślność wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Czy w umowie spółki z o.o. można przyznać poszczególnym wspólnikom szczególne korzyści?',
    options: {
      a: 'Nie, jest to zabronione',
      b: 'Tak, pod warunkiem jednomyślnej zgody wszystkich wspólników',
      c: 'Tak, za zgodą większości wspólników',
      d: 'Tak, ale tylko wspólnikom założycielom'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 159 k.s.h. jeżeli wspólnikowi mają być przyznane szczególne korzyści lub jeżeli na wspólników mają być nałożone, oprócz wniesienia wkładów na pokrycie udziałów, inne obowiązki wobec spółki, należy to pod rygorem bezskuteczności wobec spółki dokładnie określić w umowie spółki. Takie postanowienia wymagają zgody wszystkich wspólników.',
    difficulty: 'medium',
    tags: ['szczególne korzyści', 'umowa spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-102',
    article: 'Art. 161 § 1',
    articleTitle: 'Spółka z o.o. w organizacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Z chwilą zawarcia umowy spółki z o.o. powstaje:',
    options: {
      a: 'Spółka z o.o. z pełną osobowością prawną',
      b: 'Spółka z o.o. w organizacji',
      c: 'Spółka cywilna wspólników',
      d: 'Podmiot bez zdolności prawnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 161 § 1 k.s.h. z chwilą zawarcia umowy spółki z ograniczoną odpowiedzialnością powstaje spółka z ograniczoną odpowiedzialnością w organizacji.',
    difficulty: 'easy',
    tags: ['spółka w organizacji', 'powstanie spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-103',
    article: 'Art. 164 § 1',
    articleTitle: 'Zgłoszenie spółki do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Zarząd zgłasza zawiązanie spółki z o.o. do sądu rejestrowego w terminie:',
    options: {
      a: '7 dni od dnia zawarcia umowy spółki',
      b: '14 dni od dnia zawarcia umowy spółki',
      c: '6 miesięcy od dnia zawarcia umowy spółki',
      d: '1 miesiąca od dnia zawarcia umowy spółki'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 164 § 1 k.s.h. zarząd zgłasza zawiązanie spółki do sądu rejestrowego właściwego ze względu na siedzibę spółki w celu wpisania spółki do rejestru. Wniosek o wpis spółki do rejestru powinien być złożony nie później niż w terminie sześciu miesięcy od dnia zawarcia umowy spółki.',
    difficulty: 'medium',
    tags: ['rejestracja', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-104',
    article: 'Art. 167 § 1',
    articleTitle: 'Elementy zgłoszenia spółki do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do zgłoszenia spółki z o.o. do rejestru należy dołączyć m.in.:',
    options: {
      a: 'Tylko umowę spółki',
      b: 'Umowę spółki, oświadczenie o wniesieniu wkładów, listę wspólników',
      c: 'Tylko oświadczenie o wniesieniu wkładów',
      d: 'Umowę spółki i sprawozdanie finansowe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 167 § 1 k.s.h. do zgłoszenia spółki należy dołączyć: umowę spółki, oświadczenie wszystkich członków zarządu, że wkłady zostały wniesione w całości przez wszystkich wspólników, listę wspólników z podaniem ich danych i liczby udziałów, oraz inne dokumenty.',
    difficulty: 'medium',
    tags: ['zgłoszenie do rejestru', 'dokumenty', 'sp. z o.o.']
  },

  {
    id: 'ksh-105',
    article: 'Art. 169',
    articleTitle: 'Skutki wpisu do rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Wpis spółki z o.o. do rejestru ma charakter:',
    options: {
      a: 'Deklaratoryjny',
      b: 'Konstytutywny',
      c: 'Informacyjny',
      d: 'Porządkowy'
    },
    correct: 'b',
    explanation: 'Wpis spółki z o.o. do rejestru ma charakter konstytutywny - spółka uzyskuje osobowość prawną dopiero z chwilą wpisu do rejestru (art. 12 k.s.h.). Przed wpisem istnieje jako spółka w organizacji.',
    difficulty: 'medium',
    tags: ['wpis do rejestru', 'charakter konstytutywny', 'sp. z o.o.']
  },

  {
    id: 'ksh-106',
    article: 'Art. 174 § 1',
    articleTitle: 'Prawa wspólnika sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Jeżeli umowa spółki z o.o. nie stanowi inaczej, wspólnik ma prawo do:',
    options: {
      a: 'Równego udziału w zysku niezależnie od liczby posiadanych udziałów',
      b: 'Udziału w zysku proporcjonalnie do posiadanych udziałów',
      c: 'Udziału w zysku według uznania zarządu',
      d: 'Udziału w zysku proporcjonalnie do wniesionych wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 191 § 1 k.s.h. wspólnik ma prawo do udziału w zysku wynikającym z rocznego sprawozdania finansowego, przeznaczonym do podziału uchwałą zgromadzenia wspólników. Zysk dzieli się w stosunku do udziałów, chyba że umowa stanowi inaczej.',
    difficulty: 'easy',
    tags: ['prawo do zysku', 'dywidenda', 'sp. z o.o.']
  },

  {
    id: 'ksh-107',
    article: 'Art. 176 § 1',
    articleTitle: 'Udziały uprzywilejowane',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa spółki z o.o. może przewidywać udziały o szczególnych uprawnieniach (uprzywilejowane). Uprzywilejowanie może dotyczyć:',
    options: {
      a: 'Tylko prawa głosu',
      b: 'Tylko dywidendy',
      c: 'Prawa głosu, dywidendy lub sposobu uczestniczenia w podziale majątku',
      d: 'Tylko prawa pierwszeństwa nabycia udziałów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 174 § 2 k.s.h. uprzywilejowanie może dotyczyć w szczególności prawa głosu, prawa do dywidendy lub sposobu uczestniczenia w podziale majątku w przypadku likwidacji spółki.',
    difficulty: 'medium',
    tags: ['udziały uprzywilejowane', 'uprawnienia', 'sp. z o.o.']
  },

  {
    id: 'ksh-108',
    article: 'Art. 174 § 3',
    articleTitle: 'Maksymalne uprzywilejowanie co do głosu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Uprzywilejowanie udziału co do prawa głosu w sp. z o.o. może dotyczyć maksymalnie:',
    options: {
      a: 'Dwóch głosów na jeden udział',
      b: 'Trzech głosów na jeden udział',
      c: 'Pięciu głosów na jeden udział',
      d: 'Dziesięciu głosów na jeden udział'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 174 § 3 k.s.h. uprzywilejowanie dotyczące prawa głosu nie może przyznawać uprawnionemu więcej niż trzy głosy na jeden udział.',
    difficulty: 'hard',
    tags: ['uprzywilejowanie głosu', 'maksimum', 'sp. z o.o.']
  },

  {
    id: 'ksh-109',
    article: 'Art. 175 § 1',
    articleTitle: 'Obowiązek dopłat',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa spółki z o.o. może zobowiązywać wspólników do dopłat:',
    options: {
      a: 'Bez żadnych ograniczeń',
      b: 'W granicach liczbowo oznaczonej wysokości w stosunku do udziału',
      c: 'Tylko jednorazowo przy powstaniu spółki',
      d: 'Tylko w przypadku upadłości spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 177 § 1 k.s.h. umowa spółki może zobowiązywać wspólników do dopłat w granicach liczbowo oznaczonej wysokości w stosunku do udziału. Dopłaty powinny być nakładane i uiszczane przez wspólników równomiernie w stosunku do ich udziałów.',
    difficulty: 'medium',
    tags: ['dopłaty', 'obowiązek wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-110',
    article: 'Art. 179 § 1',
    articleTitle: 'Umorzenie udziałów',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Udział w sp. z o.o. może być umorzony:',
    options: {
      a: 'Tylko za zgodą wspólnika',
      b: 'Tylko bez zgody wspólnika',
      c: 'Za zgodą wspólnika lub bez jego zgody, jeżeli umowa spółki tak stanowi',
      d: 'Tylko przez sąd rejestrowy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 199 § 1 k.s.h. udział może być umorzony za zgodą wspólnika w drodze nabycia udziału przez spółkę (umorzenie dobrowolne) albo bez zgody wspólnika (umorzenie przymusowe). Umorzenie przymusowe wymaga odpowiednich postanowień umowy spółki.',
    difficulty: 'medium',
    tags: ['umorzenie udziałów', 'dobrowolne', 'przymusowe']
  },

  {
    id: 'ksh-111',
    article: 'Art. 188 § 1',
    articleTitle: 'Lista wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Zarząd sp. z o.o. jest obowiązany prowadzić:',
    options: {
      a: 'Tylko księgę udziałów',
      b: 'Księgę udziałów i listę wspólników',
      c: 'Tylko rejestr akcjonariuszy',
      d: 'Księgę protokołów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 188 § 1 k.s.h. zarząd jest obowiązany prowadzić księgę udziałów, do której należy wpisywać nazwisko i imię albo firmę (nazwę) i siedzibę każdego wspólnika, adres, liczbę i wartość nominalną jego udziałów oraz inne dane. Zgodnie z art. 188 § 3 po każdym wpisie do księgi udziałów, listę wspólników należy złożyć sądowi rejestrowemu.',
    difficulty: 'medium',
    tags: ['księga udziałów', 'lista wspólników', 'zarząd']
  },

  {
    id: 'ksh-112',
    article: 'Art. 191 § 1',
    articleTitle: 'Dywidenda',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wspólnik sp. z o.o. ma prawo do udziału w zysku:',
    options: {
      a: 'Wynikającym z bieżącej działalności spółki',
      b: 'Wynikającym z rocznego sprawozdania finansowego i przeznaczonym do podziału uchwałą zgromadzenia wspólników',
      c: 'Według decyzji zarządu',
      d: 'W każdym czasie na żądanie wspólnika'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 191 § 1 k.s.h. wspólnik ma prawo do udziału w zysku wynikającym z rocznego sprawozdania finansowego i przeznaczonym do podziału uchwałą zgromadzenia wspólników.',
    difficulty: 'easy',
    tags: ['dywidenda', 'zysk', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-113',
    article: 'Art. 192',
    articleTitle: 'Ograniczenia wypłaty dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Kwota przeznaczona do podziału między wspólników sp. z o.o. nie może przekraczać:',
    options: {
      a: 'Zysku za ostatni rok obrotowy',
      b: 'Zysku za ostatni rok obrotowy powiększonego o niepodzielone zyski z lat ubiegłych i kwoty przeniesione z kapitałów, pomniejszonego o niepokryte straty i kwoty obowiązkowych odpisów',
      c: 'Kapitału zakładowego',
      d: 'Sumy wniesionych wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 192 k.s.h. kwota przeznaczona do podziału nie może przekraczać zysku za ostatni rok obrotowy, powiększonego o niepodzielone zyski z lat ubiegłych oraz o kwoty przeniesione z utworzonych z zysku kapitałów zapasowego i rezerwowych, które mogą być przeznaczone do podziału. Kwotę tę należy pomniejszyć o niepokryte straty, udziały własne oraz o kwoty, które zgodnie z ustawą lub umową spółki powinny być przekazane z zysku za ostatni rok obrotowy na kapitały zapasowy lub rezerwowe.',
    difficulty: 'hard',
    tags: ['dywidenda', 'ograniczenia', 'zysk']
  },

  {
    id: 'ksh-114',
    article: 'Art. 195 § 1',
    articleTitle: 'Zaliczka na poczet dywidendy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wypłata zaliczki na poczet przewidywanej dywidendy w sp. z o.o.:',
    options: {
      a: 'Jest zabroniona',
      b: 'Wymaga upoważnienia w umowie spółki i spełnienia określonych warunków',
      c: 'Jest zawsze dozwolona',
      d: 'Wymaga zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 194 k.s.h. umowa spółki może upoważniać zarząd do wypłaty wspólnikom zaliczki na poczet przewidywanej dywidendy za rok obrotowy, jeżeli spółka posiada środki wystarczające na wypłatę. Spółka może wypłacić zaliczkę, jeśli zatwierdzone sprawozdanie za poprzedni rok wykazywało zysk.',
    difficulty: 'hard',
    tags: ['zaliczka na dywidendę', 'zarząd', 'warunki']
  },

  {
    id: 'ksh-115',
    article: 'Art. 198 § 1',
    articleTitle: 'Zwrot bezprawnie pobranych świadczeń',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Wspólnik, który wbrew przepisom prawa lub postanowieniom umowy spółki otrzymał wypłatę:',
    options: {
      a: 'Nie musi jej zwracać',
      b: 'Obowiązany jest do jej zwrotu',
      c: 'Może ją zatrzymać za zgodą zarządu',
      d: 'Musi zwrócić tylko odsetki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 198 § 1 k.s.h. wspólnik, który wbrew przepisom prawa lub postanowieniom umowy spółki otrzymał wypłatę (otrzymujący), obowiązany jest do jej zwrotu. Członkowie organów spółki, którzy ponoszą odpowiedzialność za taką wypłatę, odpowiadają za jej zwrot spółce solidarnie z otrzymującym.',
    difficulty: 'medium',
    tags: ['zwrot wypłaty', 'bezprawne świadczenie', 'odpowiedzialność']
  },

  {
    id: 'ksh-116',
    article: 'Art. 200 § 1',
    articleTitle: 'Zakaz nabywania udziałów własnych',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Spółka z o.o. co do zasady:',
    options: {
      a: 'Może swobodnie nabywać własne udziały',
      b: 'Nie może nabywać ani obejmować własnych udziałów',
      c: 'Może nabywać własne udziały za zgodą zarządu',
      d: 'Może nabywać własne udziały tylko od wspólników założycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 200 § 1 k.s.h. spółka nie może obejmować lub nabywać ani przyjmować w zastaw własnych udziałów. Zakaz ten dotyczy również obejmowania lub nabywania udziałów przez spółkę albo spółdzielnię zależną. Wyjątek stanowi nabycie w drodze egzekucji na zaspokojenie roszczeń spółki lub nabycie w celu umorzenia udziałów.',
    difficulty: 'medium',
    tags: ['udziały własne', 'zakaz nabywania', 'sp. z o.o.']
  },

  {
    id: 'ksh-117',
    article: 'Art. 203 § 1',
    articleTitle: 'Odwołanie członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. może być w każdym czasie odwołany:',
    options: {
      a: 'Tylko przez sąd',
      b: 'Uchwałą wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Tylko przez radę nadzorczą',
      d: 'Tylko z ważnych powodów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 203 § 1 k.s.h. członek zarządu może być w każdym czasie odwołany uchwałą wspólników. Nie pozbawia go to roszczeń ze stosunku pracy lub innego stosunku prawnego dotyczącego pełnienia funkcji członka zarządu. Umowa spółki może zawierać inne postanowienia, np. przyznać uprawnienie do odwoływania radzie nadzorczej.',
    difficulty: 'easy',
    tags: ['odwołanie zarządu', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-118',
    article: 'Art. 204 § 1',
    articleTitle: 'Prawo członka zarządu do prowadzenia spraw',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo członka zarządu sp. z o.o. do prowadzenia spraw spółki i jej reprezentowania:',
    options: {
      a: 'Dotyczy tylko czynności nieprzekraczających zwykłego zarządu',
      b: 'Dotyczy wszystkich czynności sądowych i pozasądowych spółki',
      c: 'Dotyczy tylko czynności określonych w umowie spółki',
      d: 'Wymaga każdorazowej uchwały wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 204 § 1 k.s.h. prawo członka zarządu do prowadzenia spraw spółki i jej reprezentowania dotyczy wszystkich czynności sądowych i pozasądowych spółki.',
    difficulty: 'easy',
    tags: ['prowadzenie spraw', 'reprezentacja', 'zakres']
  },

  {
    id: 'ksh-119',
    article: 'Art. 204 § 2',
    articleTitle: 'Ograniczenie prawa reprezentacji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawa członka zarządu sp. z o.o. do reprezentowania spółki:',
    options: {
      a: 'Nie można ograniczyć ze skutkiem wobec osób trzecich',
      b: 'Można ograniczyć tylko wobec osób trzecich',
      c: 'Można ograniczyć ze skutkiem wobec osób trzecich',
      d: 'Można ograniczyć tylko za zgodą sądu'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 204 § 2 k.s.h. prawa członka zarządu do reprezentowania spółki nie można ograniczyć ze skutkiem wobec osób trzecich. Ograniczenia wewnętrzne (np. w regulaminie zarządu) wiążą tylko członka zarządu, ale nie osoby trzecie.',
    difficulty: 'medium',
    tags: ['ograniczenie reprezentacji', 'skutek wobec osób trzecich', 'zarząd']
  },

  {
    id: 'ksh-120',
    article: 'Art. 208 § 2',
    articleTitle: 'Sprzeciw wobec prowadzenia sprawy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Każdy członek zarządu sp. z o.o. może prowadzić bez uprzedniej uchwały zarządu sprawy:',
    options: {
      a: 'Wszystkie bez wyjątku',
      b: 'Nieprzekraczające zakresu zwykłych czynności spółki',
      c: 'Tylko za zgodą rady nadzorczej',
      d: 'Tylko za zgodą zgromadzenia wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 208 § 2 k.s.h. każdy członek zarządu może prowadzić bez uprzedniej uchwały zarządu sprawy nieprzekraczające zakresu zwykłych czynności spółki. Jeżeli jednak przed załatwieniem sprawy choćby jeden z członków zarządu zgłosi sprzeciw, wymagana jest uchwała zarządu.',
    difficulty: 'medium',
    tags: ['prowadzenie spraw', 'zwykłe czynności', 'sprzeciw']
  },

  {
    id: 'ksh-121',
    article: 'Art. 211 § 1',
    articleTitle: 'Zakaz konkurencji członka zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek zarządu sp. z o.o. nie może bez zgody spółki:',
    options: {
      a: 'Posiadać akcji w spółce akcyjnej',
      b: 'Zajmować się interesami konkurencyjnymi ani uczestniczyć w spółce konkurencyjnej',
      c: 'Prowadzić działalności charytatywnej',
      d: 'Być członkiem zarządu w spółce niekonkurencyjnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 211 § 1 k.s.h. członek zarządu nie może bez zgody spółki zajmować się interesami konkurencyjnymi ani też uczestniczyć w spółce konkurencyjnej jako wspólnik spółki cywilnej, spółki osobowej lub jako członek organu spółki kapitałowej bądź uczestniczyć w innej konkurencyjnej osobie prawnej jako członek organu. Zakaz ten obejmuje także udział w konkurencyjnej spółce kapitałowej w przypadku posiadania przez członka zarządu co najmniej 10% udziałów lub akcji.',
    difficulty: 'medium',
    tags: ['zakaz konkurencji', 'członek zarządu', 'sp. z o.o.']
  },

  {
    id: 'ksh-122',
    article: 'Art. 214 § 1',
    articleTitle: 'Skład rady nadzorczej sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza w sp. z o.o. składa się z co najmniej:',
    options: {
      a: 'Jednego członka',
      b: 'Dwóch członków',
      c: 'Trzech członków',
      d: 'Pięciu członków'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 215 § 1 k.s.h. rada nadzorcza składa się z co najmniej trzech członków powoływanych i odwoływanych uchwałą wspólników.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'skład', 'sp. z o.o.']
  },

  {
    id: 'ksh-123',
    article: 'Art. 219 § 1',
    articleTitle: 'Prawo kontroli rady nadzorczej',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rada nadzorcza sp. z o.o. sprawuje:',
    options: {
      a: 'Bieżący zarząd spółką',
      b: 'Stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności',
      c: 'Tylko kontrolę sprawozdań finansowych',
      d: 'Reprezentację spółki wobec osób trzecich'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 219 § 1 k.s.h. rada nadzorcza sprawuje stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności. Nie ma ona prawa wydawania zarządowi wiążących poleceń dotyczących prowadzenia spraw spółki.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'nadzór', 'kompetencje']
  },

  {
    id: 'ksh-124',
    article: 'Art. 219 § 4',
    articleTitle: 'Zakaz łączenia funkcji',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Członek rady nadzorczej sp. z o.o.:',
    options: {
      a: 'Może być jednocześnie członkiem zarządu',
      b: 'Nie może być jednocześnie członkiem zarządu, prokurentem, likwidatorem, kierownikiem oddziału ani głównym księgowym',
      c: 'Może być jednocześnie prokurentem',
      d: 'Może łączyć wszystkie funkcje za zgodą zgromadzenia wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 214 § 1 k.s.h. członek zarządu, prokurent, likwidator, kierownik oddziału lub zakładu oraz zatrudniony w spółce główny księgowy, radca prawny lub adwokat nie może być jednocześnie członkiem rady nadzorczej lub komisji rewizyjnej.',
    difficulty: 'medium',
    tags: ['zakaz łączenia funkcji', 'rada nadzorcza', 'incompatibilitas']
  },

  {
    id: 'ksh-125',
    article: 'Art. 223',
    articleTitle: 'Komisja rewizyjna',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Komisja rewizyjna w sp. z o.o.:',
    options: {
      a: 'Jest zawsze obligatoryjna',
      b: 'Może być powołana zamiast rady nadzorczej lub obok niej',
      c: 'Musi być powołana obok rady nadzorczej',
      d: 'Nie może być powołana w sp. z o.o.'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 213 § 1 k.s.h. umowa spółki może ustanowić radę nadzorczą lub komisję rewizyjną albo oba te organy. W przypadkach określonych w ustawie (kapitał > 500.000 zł i > 25 wspólników) ustanowienie rady nadzorczej lub komisji rewizyjnej jest obowiązkowe.',
    difficulty: 'medium',
    tags: ['komisja rewizyjna', 'organ fakultatywny', 'sp. z o.o.']
  },

  {
    id: 'ksh-126',
    article: 'Art. 227 § 1',
    articleTitle: 'Zgromadzenie wspólników - kompetencje',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały wspólników sp. z o.o. są podejmowane:',
    options: {
      a: 'Tylko na zgromadzeniu wspólników',
      b: 'Na zgromadzeniu wspólników lub w trybie pisemnym (poza zgromadzeniem)',
      c: 'Tylko w formie aktu notarialnego',
      d: 'Wyłącznie w obecności notariusza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 227 § 2 k.s.h. bez odbycia zgromadzenia wspólników mogą być powzięte uchwały, jeżeli wszyscy wspólnicy wyrażą na piśmie zgodę na postanowienie, które ma być powzięte, albo na głosowanie pisemne.',
    difficulty: 'medium',
    tags: ['uchwały', 'zgromadzenie wspólników', 'głosowanie pisemne']
  },

  {
    id: 'ksh-127',
    article: 'Art. 231 § 1',
    articleTitle: 'Zwyczajne zgromadzenie wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zwyczajne zgromadzenie wspólników sp. z o.o. powinno odbyć się:',
    options: {
      a: 'W ciągu trzech miesięcy po upływie każdego roku obrotowego',
      b: 'W ciągu sześciu miesięcy po upływie każdego roku obrotowego',
      c: 'Do końca roku kalendarzowego',
      d: 'W dowolnym terminie określonym przez zarząd'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 231 § 1 k.s.h. zwyczajne zgromadzenie wspólników powinno odbyć się w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne zgromadzenie', 'termin', 'sp. z o.o.']
  },

  {
    id: 'ksh-128',
    article: 'Art. 231 § 2',
    articleTitle: 'Przedmiot zwyczajnego zgromadzenia',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Przedmiotem obrad zwyczajnego zgromadzenia wspólników sp. z o.o. powinno być m.in.:',
    options: {
      a: 'Tylko podjęcie uchwały o dalszym istnieniu spółki',
      b: 'Rozpatrzenie i zatwierdzenie sprawozdania zarządu i finansowego, podział zysku/pokrycie straty, absolutorium',
      c: 'Tylko wybór zarządu',
      d: 'Tylko zmiana umowy spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 231 § 2 k.s.h. przedmiotem obrad zwyczajnego zgromadzenia wspólników powinno być: 1) rozpatrzenie i zatwierdzenie sprawozdania zarządu z działalności spółki oraz sprawozdania finansowego za ubiegły rok obrotowy, 2) powzięcie uchwały o podziale zysku albo pokryciu straty, 3) udzielenie członkom organów spółki absolutorium z wykonania przez nich obowiązków.',
    difficulty: 'easy',
    tags: ['zwyczajne zgromadzenie', 'przedmiot obrad', 'absolutorium']
  },

  {
    id: 'ksh-129',
    article: 'Art. 235 § 1',
    articleTitle: 'Zwoływanie zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. zwołuje:',
    options: {
      a: 'Tylko rada nadzorcza',
      b: 'Zarząd',
      c: 'Sąd rejestrowy',
      d: 'Wspólnik większościowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 235 § 1 k.s.h. zgromadzenie wspólników zwołuje zarząd. Rada nadzorcza oraz komisja rewizyjna mają prawo zwołania zwyczajnego zgromadzenia, jeżeli zarząd nie zwoła go w terminie, oraz nadzwyczajnego zgromadzenia, jeżeli uznają to za wskazane.',
    difficulty: 'easy',
    tags: ['zwoływanie zgromadzenia', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-130',
    article: 'Art. 238 § 1',
    articleTitle: 'Zawiadomienie o zgromadzeniu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. powinno być zwołane co najmniej:',
    options: {
      a: 'Tydzień przed terminem zgromadzenia',
      b: 'Dwa tygodnie przed terminem zgromadzenia',
      c: 'Miesiąc przed terminem zgromadzenia',
      d: 'Trzy dni przed terminem zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 238 § 1 k.s.h. zgromadzenie wspólników zwołuje się za pomocą listów poleconych lub przesyłek nadanych pocztą kurierską, wysłanych co najmniej dwa tygodnie przed terminem zgromadzenia wspólników. Zamiast listu poleconego lub przesyłki nadanej pocztą kurierską, zawiadomienie może być wysłane wspólnikowi na adres do doręczeń elektronicznych albo pocztą elektroniczną.',
    difficulty: 'easy',
    tags: ['zawiadomienie', 'termin', 'zgromadzenie wspólników']
  },

  {
    id: 'ksh-131',
    article: 'Art. 240',
    articleTitle: 'Zgromadzenie bez formalnego zwołania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników sp. z o.o. mogą być powzięte bez formalnego zwołania, jeżeli:',
    options: {
      a: 'Cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu',
      b: 'Obecna jest większość wspólników',
      c: 'Obecny jest zarząd',
      d: 'Jest to zgromadzenie zwyczajne'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 240 k.s.h. uchwały można powziąć pomimo braku formalnego zwołania zgromadzenia wspólników, jeżeli cały kapitał zakładowy jest reprezentowany, a nikt z obecnych nie zgłosił sprzeciwu dotyczącego odbycia zgromadzenia lub wniesienia poszczególnych spraw do porządku obrad.',
    difficulty: 'medium',
    tags: ['zgromadzenie bez zwołania', 'reprezentacja kapitału', 'sprzeciw']
  },

  {
    id: 'ksh-132',
    article: 'Art. 241',
    articleTitle: 'Miejsce zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. odbywa się:',
    options: {
      a: 'Tylko w siedzibie spółki',
      b: 'W siedzibie spółki, chyba że umowa spółki wskazuje inne miejsce na terytorium RP lub wszyscy wspólnicy wyrażą zgodę na inne miejsce',
      c: 'W dowolnym miejscu na świecie',
      d: 'Tylko w sądzie rejestrowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 234 k.s.h. zgromadzenie wspólników odbywa się w siedzibie spółki, jeżeli umowa spółki nie wskazuje innego miejsca na terytorium Rzeczypospolitej Polskiej. Zgromadzenie może odbyć się również w innym miejscu, jeżeli wszyscy wspólnicy wyrażą na to zgodę na piśmie.',
    difficulty: 'medium',
    tags: ['miejsce zgromadzenia', 'siedziba spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-133',
    article: 'Art. 243 § 1',
    articleTitle: 'Prawo głosu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Na każdy udział w sp. z o.o. o równej wartości nominalnej przypada:',
    options: {
      a: 'Jeden głos, chyba że umowa spółki stanowi inaczej',
      b: 'Zawsze jeden głos',
      c: 'Liczba głosów proporcjonalna do wniesionych wkładów',
      d: 'Liczba głosów ustalana przez zarząd'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 242 k.s.h. na każdy udział o równej wartości nominalnej przypada jeden głos, chyba że umowa spółki stanowi inaczej. Umowa może przewidywać uprzywilejowanie co do głosu (max 3 głosy na udział).',
    difficulty: 'easy',
    tags: ['prawo głosu', 'udział', 'sp. z o.o.']
  },

  {
    id: 'ksh-134',
    article: 'Art. 244',
    articleTitle: 'Wyłączenie od głosowania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Wspólnik sp. z o.o. nie może ani osobiście, ani przez pełnomocnika głosować przy powzięciu uchwał dotyczących:',
    options: {
      a: 'Zmiany umowy spółki',
      b: 'Jego odpowiedzialności wobec spółki, w tym udzielenia mu absolutorium lub zwolnienia z zobowiązania',
      c: 'Podwyższenia kapitału zakładowego',
      d: 'Podziału zysku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 244 k.s.h. wspólnik nie może ani osobiście, ani przez pełnomocnika, ani jako pełnomocnik innej osoby głosować przy powzięciu uchwał dotyczących jego odpowiedzialności wobec spółki z jakiegokolwiek tytułu, w tym udzielenia absolutorium, zwolnienia z zobowiązania wobec spółki oraz sporu między nim a spółką.',
    difficulty: 'medium',
    tags: ['wyłączenie od głosowania', 'konflikt interesów', 'absolutorium']
  },

  {
    id: 'ksh-135',
    article: 'Art. 247 § 2',
    articleTitle: 'Głosowanie tajne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Tajne głosowanie na zgromadzeniu wspólników sp. z o.o. zarządza się:',
    options: {
      a: 'Na każde żądanie wspólnika',
      b: 'Przy wyborach oraz nad wnioskami o odwołanie członków organów lub likwidatorów, o pociągnięcie ich do odpowiedzialności, jak również w sprawach osobowych',
      c: 'Tylko przy zmianie umowy spółki',
      d: 'Tylko w sprawach finansowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 247 § 2 k.s.h. tajne głosowanie zarządza się przy wyborach oraz nad wnioskami o odwołanie członków organów spółki lub likwidatorów, o pociągnięcie ich do odpowiedzialności, jak również w sprawach osobowych. Poza tym należy zarządzić tajne głosowanie na żądanie choćby jednego ze wspólników obecnych lub reprezentowanych na zgromadzeniu.',
    difficulty: 'medium',
    tags: ['głosowanie tajne', 'sprawy osobowe', 'wybory']
  },

  {
    id: 'ksh-136',
    article: 'Art. 249 § 1',
    articleTitle: 'Uchwała sprzeczna z ustawą',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała wspólników sp. z o.o. sprzeczna z ustawą jest:',
    options: {
      a: 'Ważna, ale zaskarżalna',
      b: 'Nieważna',
      c: 'Bezskuteczna',
      d: 'Zawieszona do czasu konwalidacji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 252 § 1 k.s.h. osobom lub organom spółki wymienionym w art. 250 przysługuje prawo do wytoczenia przeciwko spółce powództwa o stwierdzenie nieważności uchwały wspólników sprzecznej z ustawą. Uchwała sprzeczna z ustawą jest nieważna z mocy prawa.',
    difficulty: 'medium',
    tags: ['nieważność uchwały', 'sprzeczność z ustawą', 'sp. z o.o.']
  },

  {
    id: 'ksh-137',
    article: 'Art. 253 § 1',
    articleTitle: 'Termin na stwierdzenie nieważności uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wniesienia powództwa o stwierdzenie nieważności uchwały wygasa:',
    options: {
      a: 'Po upływie miesiąca od dnia powzięcia uchwały',
      b: 'Po upływie sześciu miesięcy od dnia otrzymania wiadomości o uchwale, nie później niż z upływem trzech lat od dnia powzięcia uchwały',
      c: 'Po upływie roku od dnia powzięcia uchwały',
      d: 'Nigdy nie wygasa'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 252 § 3 k.s.h. prawo do wniesienia powództwa wygasa z upływem sześciu miesięcy od dnia otrzymania wiadomości o uchwale, jednakże nie później niż z upływem trzech lat od dnia powzięcia uchwały.',
    difficulty: 'hard',
    tags: ['termin', 'stwierdzenie nieważności', 'uchwała']
  },

  // ============================================================
  // PODWYŻSZENIE I OBNIŻENIE KAPITAŁU ZAKŁADOWEGO
  // ============================================================

  {
    id: 'ksh-138',
    article: 'Art. 257 § 1',
    articleTitle: 'Podwyższenie kapitału zakładowego',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. może być dokonane przez:',
    options: {
      a: 'Tylko utworzenie nowych udziałów',
      b: 'Utworzenie nowych udziałów lub podwyższenie wartości nominalnej istniejących udziałów',
      c: 'Tylko podwyższenie wartości nominalnej udziałów',
      d: 'Tylko konwersję wierzytelności'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 257 § 2 k.s.h. podwyższenie kapitału zakładowego może nastąpić przez podwyższenie wartości nominalnej udziałów istniejących lub ustanowienie nowych.',
    difficulty: 'easy',
    tags: ['podwyższenie kapitału', 'nowe udziały', 'sp. z o.o.']
  },

  {
    id: 'ksh-139',
    article: 'Art. 258 § 1',
    articleTitle: 'Prawo pierwszeństwa',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Prawo pierwszeństwa do objęcia nowych udziałów w sp. z o.o. przy podwyższeniu kapitału:',
    options: {
      a: 'Zawsze przysługuje dotychczasowym wspólnikom',
      b: 'Przysługuje dotychczasowym wspólnikom w stosunku do udziałów, chyba że umowa lub uchwała stanowi inaczej',
      c: 'Nigdy nie przysługuje dotychczasowym wspólnikom',
      d: 'Przysługuje tylko wspólnikom większościowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 258 § 1 k.s.h. jeżeli umowa spółki lub uchwała o podwyższeniu kapitału nie stanowi inaczej, dotychczasowi wspólnicy mają prawo pierwszeństwa do objęcia nowych udziałów w podwyższonym kapitale zakładowym w stosunku do swoich dotychczasowych udziałów.',
    difficulty: 'medium',
    tags: ['prawo pierwszeństwa', 'podwyższenie kapitału', 'sp. z o.o.']
  },

  {
    id: 'ksh-140',
    article: 'Art. 260 § 1',
    articleTitle: 'Podwyższenie kapitału bez zmiany umowy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Podwyższenie kapitału zakładowego sp. z o.o. bez zmiany umowy spółki może nastąpić:',
    options: {
      a: 'Zawsze',
      b: 'Jeżeli umowa spółki tak stanowi, na mocy dotychczasowych postanowień umowy określających maksymalną wysokość i termin',
      c: 'Za zgodą sądu rejestrowego',
      d: 'Na mocy uchwały zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 257 § 3 k.s.h. podwyższenie kapitału zakładowego może nastąpić bez zmiany umowy spółki, jeżeli umowa spółki tak stanowi. Umowa musi określać maksymalną wysokość podwyższenia kapitału oraz termin podwyższenia.',
    difficulty: 'hard',
    tags: ['podwyższenie kapitału', 'bez zmiany umowy', 'sp. z o.o.']
  },

  {
    id: 'ksh-141',
    article: 'Art. 263 § 1',
    articleTitle: 'Obniżenie kapitału zakładowego',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Uchwała o obniżeniu kapitału zakładowego sp. z o.o. powinna określać:',
    options: {
      a: 'Tylko kwotę obniżenia',
      b: 'Wysokość, o jaką kapitał zakładowy ma być obniżony oraz sposób obniżenia',
      c: 'Tylko cel obniżenia',
      d: 'Tylko listę wspólników objętych obniżeniem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 263 § 1 k.s.h. uchwała o obniżeniu kapitału zakładowego powinna określać wysokość, o jaką kapitał zakładowy ma być obniżony, oraz sposób jego obniżenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'uchwała', 'sp. z o.o.']
  },

  {
    id: 'ksh-142',
    article: 'Art. 264 § 1',
    articleTitle: 'Ochrona wierzycieli przy obniżeniu kapitału',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'O uchwaleniu obniżenia kapitału zakładowego sp. z o.o. zarząd:',
    options: {
      a: 'Nie musi informować wierzycieli',
      b: 'Niezwłocznie ogłasza, wzywając wierzycieli do zgłoszenia roszczeń w terminie trzech miesięcy',
      c: 'Informuje tylko sąd rejestrowy',
      d: 'Informuje tylko wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 264 § 1 k.s.h. o uchwaleniu obniżenia kapitału zakładowego zarząd niezwłocznie ogłasza, wzywając wierzycieli spółki do zgłoszenia roszczeń wobec spółki w terminie trzech miesięcy od dnia ogłoszenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'ochrona wierzycieli', 'ogłoszenie']
  },

  // ============================================================
  // ROZWIĄZANIE I LIKWIDACJA SPÓŁKI Z O.O.
  // ============================================================

  {
    id: 'ksh-143',
    article: 'Art. 270',
    articleTitle: 'Przyczyny rozwiązania sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Która z poniższych NIE jest przyczyną rozwiązania sp. z o.o.?',
    options: {
      a: 'Przyczyny przewidziane w umowie spółki',
      b: 'Uchwała wspólników o rozwiązaniu spółki',
      c: 'Ogłoszenie upadłości spółki',
      d: 'Utrata przez wspólnika zdolności do czynności prawnych'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 270 k.s.h. rozwiązanie spółki powodują: 1) przyczyny przewidziane w umowie spółki, 2) uchwała wspólników o rozwiązaniu spółki, 3) ogłoszenie upadłości spółki, 4) inne przyczyny przewidziane prawem. Utrata zdolności do czynności prawnych przez wspólnika nie jest przyczyną rozwiązania.',
    difficulty: 'medium',
    tags: ['rozwiązanie spółki', 'przyczyny', 'sp. z o.o.']
  },

  {
    id: 'ksh-144',
    article: 'Art. 271',
    articleTitle: 'Rozwiązanie spółki przez sąd',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Sąd może wyrokiem orzec rozwiązanie sp. z o.o. na żądanie wspólnika lub członka organu, jeżeli:',
    options: {
      a: 'Spółka nie osiąga zysków',
      b: 'Osiągnięcie celu spółki stało się niemożliwe albo zaszły inne ważne przyczyny wywołane stosunkami spółki',
      c: 'Jeden wspólnik chce wystąpić',
      d: 'Spółka istnieje dłużej niż 10 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 271 pkt 1 k.s.h. sąd może wyrokiem orzec rozwiązanie spółki na żądanie wspólnika lub członka organu spółki, jeżeli osiągnięcie celu spółki stało się niemożliwe albo jeżeli zaszły inne ważne przyczyny wywołane stosunkami spółki.',
    difficulty: 'medium',
    tags: ['rozwiązanie przez sąd', 'ważne przyczyny', 'sp. z o.o.']
  },

  {
    id: 'ksh-145',
    article: 'Art. 274 § 1',
    articleTitle: 'Likwidatorzy',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorami sp. z o.o. są:',
    options: {
      a: 'Zawsze osoby wyznaczone przez sąd',
      b: 'Członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej',
      c: 'Zawsze wspólnicy',
      d: 'Zawsze rada nadzorcza'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 276 § 1 k.s.h. likwidatorami są członkowie zarządu, chyba że umowa spółki lub uchwała wspólników stanowi inaczej. Sąd może również wyznaczyć likwidatorów w określonych przypadkach.',
    difficulty: 'easy',
    tags: ['likwidatorzy', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-146',
    article: 'Art. 282 § 1',
    articleTitle: 'Czynności likwidacyjne',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Likwidatorzy sp. z o.o. powinni:',
    options: {
      a: 'Kontynuować działalność spółki bez ograniczeń',
      b: 'Zakończyć interesy bieżące spółki, ściągnąć wierzytelności, wypełnić zobowiązania i upłynnić majątek spółki',
      c: 'Tylko spłacić wierzycieli',
      d: 'Tylko podzielić majątek między wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 282 § 1 k.s.h. likwidatorzy powinni zakończyć interesy bieżące spółki, ściągnąć wierzytelności, wypełnić zobowiązania i upłynnić majątek spółki (czynności likwidacyjne). Nowe interesy mogą wszczynać tylko wówczas, gdy jest to potrzebne do ukończenia spraw w toku.',
    difficulty: 'easy',
    tags: ['czynności likwidacyjne', 'likwidatorzy', 'sp. z o.o.']
  },

  {
    id: 'ksh-147',
    article: 'Art. 286 § 1',
    articleTitle: 'Podział majątku',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli sp. z o.o. nie może nastąpić przed upływem:',
    options: {
      a: '1 miesiąca od dnia ogłoszenia o otwarciu likwidacji',
      b: '3 miesięcy od dnia ogłoszenia o otwarciu likwidacji',
      c: '6 miesięcy od dnia ogłoszenia o otwarciu likwidacji',
      d: '1 roku od dnia ogłoszenia o otwarciu likwidacji'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 286 § 1 k.s.h. podział między wspólników majątku pozostałego po zaspokojeniu lub zabezpieczeniu wierzycieli nie może nastąpić przed upływem sześciu miesięcy od daty ogłoszenia o otwarciu likwidacji i wezwaniu wierzycieli.',
    difficulty: 'hard',
    tags: ['podział majątku', 'termin', 'likwidacja']
  },

  // ============================================================
  // SPÓŁKA AKCYJNA - SZCZEGÓŁOWE PYTANIA
  // ============================================================

  {
    id: 'ksh-148',
    article: 'Art. 302',
    articleTitle: 'Ograniczenie zawiązania S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Spółka akcyjna nie może być zawiązana wyłącznie przez:',
    options: {
      a: 'Osobę fizyczną',
      b: 'Inną spółkę akcyjną',
      c: 'Jednoosobową spółkę z ograniczoną odpowiedzialnością',
      d: 'Fundację'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 301 § 1 zd. 2 k.s.h. spółka akcyjna nie może być zawiązana wyłącznie przez jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['zawiązanie S.A.', 'ograniczenie', 'spółka jednoosobowa']
  },

  {
    id: 'ksh-149',
    article: 'Art. 306',
    articleTitle: 'Warunki zawiązania S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Do powstania spółki akcyjnej wymaga się m.in.:',
    options: {
      a: 'Tylko podpisania statutu',
      b: 'Zawiązania spółki (podpisanie statutu, objęcie akcji), wniesienia wkładów, ustanowienia zarządu i rady nadzorczej, wpisu do rejestru',
      c: 'Tylko wpisu do rejestru',
      d: 'Tylko wniesienia wkładów pieniężnych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 306 k.s.h. do powstania spółki akcyjnej wymaga się: zawiązania spółki, w tym podpisania statutu przez założycieli, wniesienia przez akcjonariuszy wkładów na pokrycie całego kapitału zakładowego, ustanowienia zarządu i rady nadzorczej, wpisu do rejestru.',
    difficulty: 'medium',
    tags: ['powstanie S.A.', 'wymogi', 'spółka akcyjna']
  },

  {
    id: 'ksh-150',
    article: 'Art. 309 § 1',
    articleTitle: 'Pokrycie kapitału zakładowego',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Akcje obejmowane za wkłady niepieniężne w S.A. powinny być pokryte w całości:',
    options: {
      a: 'W ciągu roku od rejestracji spółki',
      b: 'Nie później niż przed upływem roku po zarejestrowaniu spółki',
      c: 'Przed rejestracją spółki',
      d: 'W ciągu trzech lat od rejestracji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 309 § 3 k.s.h. akcje obejmowane za wkłady niepieniężne powinny być pokryte w całości nie później niż przed upływem roku po zarejestrowaniu spółki.',
    difficulty: 'hard',
    tags: ['wkłady niepieniężne', 'termin', 'S.A.']
  },

  {
    id: 'ksh-151',
    article: 'Art. 311',
    articleTitle: 'Sprawozdanie założycieli',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Założyciele S.A. sporządzają pisemne sprawozdanie, które powinno być zbadane przez:',
    options: {
      a: 'Radę nadzorczą',
      b: 'Biegłego rewidenta',
      c: 'Sąd rejestrowy',
      d: 'Komisję Nadzoru Finansowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 312 § 1 k.s.h. sprawozdanie założycieli należy poddać badaniu przez biegłego rewidenta wyznaczonego przez sąd rejestrowy. Badanie dotyczy prawdziwości i rzetelności sprawozdania.',
    difficulty: 'medium',
    tags: ['sprawozdanie założycieli', 'biegły rewident', 'S.A.']
  },

  {
    id: 'ksh-152',
    article: 'Art. 328 § 1',
    articleTitle: 'Rodzaje akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje w S.A. mogą być:',
    options: {
      a: 'Tylko imienne',
      b: 'Tylko na okaziciela',
      c: 'Imienne lub na okaziciela',
      d: 'Tylko zdematerializowane'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 334 § 1 k.s.h. akcje mogą być imienne lub na okaziciela. Zamiana akcji imiennych na akcje na okaziciela albo odwrotnie może być dokonana na żądanie akcjonariusza, chyba że statut stanowi inaczej.',
    difficulty: 'easy',
    tags: ['rodzaje akcji', 'imienne', 'na okaziciela']
  },

  {
    id: 'ksh-153',
    article: 'Art. 351 § 1',
    articleTitle: 'Uprzywilejowanie akcji co do głosu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Statut S.A. może przyznać akcjom uprzywilejowanie co do głosu, maksymalnie:',
    options: {
      a: 'Trzy głosy na jedną akcję',
      b: 'Dwa głosy na jedną akcję',
      c: 'Pięć głosów na jedną akcję',
      d: 'Bez ograniczeń'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 352 k.s.h. statut może przyznać indywidualnie oznaczonemu akcjonariuszowi osobiste uprawnienia. W szczególności może to dotyczyć prawa powoływania lub odwoływania członków zarządu, rady nadzorczej lub prawa do otrzymywania określonych świadczeń od spółki. Zgodnie z art. 351 § 1 jedna akcja uprzywilejowana co do głosu może przyznać nie więcej niż dwa głosy.',
    difficulty: 'medium',
    tags: ['uprzywilejowanie akcji', 'prawo głosu', 'S.A.']
  },

  {
    id: 'ksh-154',
    article: 'Art. 359 § 1',
    articleTitle: 'Umorzenie akcji',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Akcje w S.A. mogą być umarzane:',
    options: {
      a: 'Tylko gdy statut tak stanowi',
      b: 'Zawsze na żądanie akcjonariusza',
      c: 'Tylko za zgodą rady nadzorczej',
      d: 'Tylko przez sąd rejestrowy'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 359 § 1 k.s.h. akcje mogą być umorzone w przypadku, gdy statut tak stanowi. Akcja może być umorzona albo za zgodą akcjonariusza w drodze jej nabycia przez spółkę (umorzenie dobrowolne), albo bez zgody akcjonariusza (umorzenie przymusowe).',
    difficulty: 'medium',
    tags: ['umorzenie akcji', 'statut', 'S.A.']
  },

  {
    id: 'ksh-155',
    article: 'Art. 363 § 1',
    articleTitle: 'Zakaz nabywania własnych akcji przez S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział II - Prawa i obowiązki akcjonariuszy',
    question: 'Spółka akcyjna co do zasady:',
    options: {
      a: 'Może swobodnie nabywać własne akcje',
      b: 'Nie może nabywać wyemitowanych przez nią akcji (akcje własne)',
      c: 'Może nabywać akcje własne za zgodą walnego zgromadzenia',
      d: 'Może nabywać akcje własne tylko od pracowników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 362 § 1 k.s.h. spółka nie może nabywać wyemitowanych przez nią akcji (akcje własne). Zakaz ten nie dotyczy określonych wyjątków, m.in. nabycia akcji w celu zapobieżenia poważnej szkodzie, nabycia akcji przeznaczonych dla pracowników.',
    difficulty: 'medium',
    tags: ['akcje własne', 'zakaz nabywania', 'S.A.']
  },

  {
    id: 'ksh-156',
    article: 'Art. 370 § 1',
    articleTitle: 'Powoływanie zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członków zarządu S.A. powołuje i odwołuje:',
    options: {
      a: 'Walne zgromadzenie',
      b: 'Rada nadzorcza, chyba że statut stanowi inaczej',
      c: 'Komisja rewizyjna',
      d: 'Założyciele'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 368 § 4 k.s.h. członków zarządu powołuje i odwołuje rada nadzorcza, chyba że statut spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['zarząd', 'powoływanie', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-157',
    article: 'Art. 375¹',
    articleTitle: 'Zakaz konkurencji członka zarządu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Członek zarządu S.A. nie może bez zgody spółki:',
    options: {
      a: 'Być akcjonariuszem innej spółki',
      b: 'Zajmować się interesami konkurencyjnymi ani uczestniczyć w spółce konkurencyjnej',
      c: 'Być członkiem stowarzyszenia',
      d: 'Prowadzić działalności charytatywnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 380 § 1 k.s.h. członek zarządu nie może bez zgody spółki zajmować się interesami konkurencyjnymi ani też uczestniczyć w spółce konkurencyjnej jako wspólnik spółki cywilnej, spółki osobowej lub jako członek organu spółki kapitałowej bądź uczestniczyć w innej konkurencyjnej osobie prawnej jako członek organu.',
    difficulty: 'medium',
    tags: ['zakaz konkurencji', 'zarząd', 'S.A.']
  },

  {
    id: 'ksh-158',
    article: 'Art. 382 § 1',
    articleTitle: 'Kompetencje rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Rada nadzorcza S.A. sprawuje:',
    options: {
      a: 'Bieżące zarządzanie spółką',
      b: 'Stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności',
      c: 'Reprezentację spółki',
      d: 'Prowadzenie ksiąg rachunkowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 382 § 1 k.s.h. rada nadzorcza sprawuje stały nadzór nad działalnością spółki we wszystkich dziedzinach jej działalności.',
    difficulty: 'easy',
    tags: ['rada nadzorcza', 'nadzór', 'S.A.']
  },

  {
    id: 'ksh-159',
    article: 'Art. 383 § 1',
    articleTitle: 'Szczególne kompetencje rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Do szczególnych obowiązków rady nadzorczej S.A. należy:',
    options: {
      a: 'Prowadzenie spraw spółki',
      b: 'Ocena sprawozdań zarządu i finansowych oraz wniosków zarządu dotyczących podziału zysku',
      c: 'Reprezentacja spółki w umowach z pracownikami',
      d: 'Zwoływanie walnych zgromadzeń'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 382 § 3 k.s.h. do szczególnych obowiązków rady nadzorczej należy ocena sprawozdań w zakresie ich zgodności z księgami, dokumentami oraz ze stanem faktycznym, ocena wniosków zarządu dotyczących podziału zysku albo pokrycia straty, a także składanie walnemu zgromadzeniu corocznego pisemnego sprawozdania z wyników tej oceny.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'obowiązki', 'S.A.']
  },

  {
    id: 'ksh-160',
    article: 'Art. 385 § 2',
    articleTitle: 'Skład rady nadzorczej w spółce publicznej',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W spółce publicznej rada nadzorcza składa się z co najmniej:',
    options: {
      a: 'Trzech członków',
      b: 'Pięciu członków',
      c: 'Siedmiu członków',
      d: 'Dziesięciu członków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 385 § 1 k.s.h. rada nadzorcza składa się co najmniej z trzech członków, a w spółkach publicznych co najmniej z pięciu członków.',
    difficulty: 'medium',
    tags: ['rada nadzorcza', 'spółka publiczna', 'skład']
  },

  {
    id: 'ksh-161',
    article: 'Art. 386 § 1',
    articleTitle: 'Kadencja rady nadzorczej S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Kadencja członka rady nadzorczej S.A. nie może przekraczać:',
    options: {
      a: 'Trzech lat',
      b: 'Czterech lat',
      c: 'Pięciu lat',
      d: 'Sześciu lat'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 386 § 1 k.s.h. kadencja członka rady nadzorczej nie może być dłuższa niż pięć lat.',
    difficulty: 'medium',
    tags: ['kadencja', 'rada nadzorcza', 'S.A.']
  },

  {
    id: 'ksh-162',
    article: 'Art. 395 § 1',
    articleTitle: 'Zwyczajne walne zgromadzenie',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Zwyczajne walne zgromadzenie S.A. powinno się odbyć:',
    options: {
      a: 'W ciągu trzech miesięcy po upływie każdego roku obrotowego',
      b: 'W ciągu sześciu miesięcy po upływie każdego roku obrotowego',
      c: 'Do końca roku kalendarzowego',
      d: 'W dowolnym terminie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 395 § 1 k.s.h. zwyczajne walne zgromadzenie powinno się odbyć w terminie sześciu miesięcy po upływie każdego roku obrotowego.',
    difficulty: 'easy',
    tags: ['zwyczajne walne zgromadzenie', 'termin', 'S.A.']
  },

  {
    id: 'ksh-163',
    article: 'Art. 400 § 1',
    articleTitle: 'Żądanie zwołania walnego zgromadzenia',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Akcjonariusz lub akcjonariusze reprezentujący co najmniej 1/20 kapitału zakładowego S.A. mogą żądać:',
    options: {
      a: 'Natychmiastowego rozwiązania spółki',
      b: 'Zwołania nadzwyczajnego walnego zgromadzenia i umieszczenia określonych spraw w porządku obrad',
      c: 'Odwołania zarządu',
      d: 'Zmiany statutu bez zgody walnego zgromadzenia'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 400 § 1 k.s.h. akcjonariusz lub akcjonariusze reprezentujący co najmniej jedną dwudziestą kapitału zakładowego mogą żądać zwołania nadzwyczajnego walnego zgromadzenia i umieszczenia określonych spraw w porządku obrad tego zgromadzenia.',
    difficulty: 'medium',
    tags: ['żądanie zwołania', 'akcjonariusze mniejszościowi', 'S.A.']
  },

  {
    id: 'ksh-164',
    article: 'Art. 416 § 1',
    articleTitle: 'Istotna zmiana przedmiotu działalności',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała o istotnej zmianie przedmiotu działalności S.A. wymaga:',
    options: {
      a: 'Zwykłej większości głosów',
      b: 'Większości dwóch trzecich głosów oddanych w obecności akcjonariuszy reprezentujących połowę kapitału',
      c: 'Jednomyślności',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 416 § 1 k.s.h. uchwała dotycząca istotnej zmiany przedmiotu działalności spółki wymaga większości dwóch trzecich głosów. Uchwała powinna być powzięta w drodze jawnego i imiennego głosowania oraz ogłoszona.',
    difficulty: 'hard',
    tags: ['zmiana przedmiotu działalności', 'większość kwalifikowana', 'S.A.']
  },

  {
    id: 'ksh-165',
    article: 'Art. 417 § 1',
    articleTitle: 'Podwyższenie kapitału zakładowego S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała o podwyższeniu kapitału zakładowego S.A. wymaga większości:',
    options: {
      a: 'Zwykłej większości głosów',
      b: 'Bezwzględnej większości głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślności'
    },
    correct: 'c',
    explanation: 'Podwyższenie kapitału zakładowego wymaga zmiany statutu, więc uchwała musi być podjęta większością trzech czwartych głosów zgodnie z art. 415 § 1 k.s.h.',
    difficulty: 'medium',
    tags: ['podwyższenie kapitału', 'większość kwalifikowana', 'S.A.']
  },

  // ============================================================
  // PRZEPISY KARNE (Art. 585-595)
  // ============================================================

  {
    id: 'ksh-166',
    article: 'Art. 586',
    articleTitle: 'Niezgłoszenie upadłości',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, będąc członkiem zarządu spółki albo likwidatorem, nie zgłasza wniosku o upadłość spółki handlowej pomimo powstania warunków uzasadniających upadłość:',
    options: {
      a: 'Nie ponosi odpowiedzialności karnej',
      b: 'Podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do roku',
      c: 'Podlega tylko odpowiedzialności cywilnej',
      d: 'Podlega karze pozbawienia wolności do lat 5'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 586 k.s.h. kto, będąc członkiem zarządu spółki albo likwidatorem, nie zgłasza wniosku o upadłość spółki handlowej pomimo powstania warunków uzasadniających według przepisów upadłość spółki - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do roku.',
    difficulty: 'medium',
    tags: ['przepisy karne', 'upadłość', 'odpowiedzialność karna']
  },

  {
    id: 'ksh-167',
    article: 'Art. 587 § 1',
    articleTitle: 'Ogłoszenie nieprawdziwych danych',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto przy wykonywaniu obowiązków wynikających z ustawy ogłasza dane nieprawdziwe albo przedstawia je organom spółki lub biegłemu rewidentowi:',
    options: {
      a: 'Podlega tylko odpowiedzialności dyscyplinarnej',
      b: 'Podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat 2',
      c: 'Podlega tylko karze grzywny',
      d: 'Nie ponosi odpowiedzialności karnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 587 § 1 k.s.h. kto przy wykonywaniu obowiązków wynikających z ustawy ogłasza dane nieprawdziwe albo przedstawia je organom spółki, władzom państwowym lub osobie powołanej do rewizji - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat 2.',
    difficulty: 'medium',
    tags: ['przepisy karne', 'nieprawdziwe dane', 'odpowiedzialność karna']
  },

  {
    id: 'ksh-168',
    article: 'Art. 594 § 1',
    articleTitle: 'Delikty członków zarządu',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, będąc członkiem zarządu spółki handlowej, wbrew obowiązkowi dopuszcza do tego, że zarząd nie składa sądowi rejestrowemu wymaganych dokumentów:',
    options: {
      a: 'Nie ponosi odpowiedzialności',
      b: 'Podlega grzywnie do 20 000 złotych',
      c: 'Podlega karze pozbawienia wolności do roku',
      d: 'Podlega tylko odpowiedzialności cywilnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 594 § 1 k.s.h. kto, będąc członkiem zarządu spółki handlowej, wbrew obowiązkowi dopuszcza do tego, że zarząd nie składa sądowi rejestrowemu wymaganych dokumentów - podlega grzywnie do 20 000 złotych.',
    difficulty: 'hard',
    tags: ['przepisy karne', 'grzywna', 'obowiązki zarządu']
  },

  // ============================================================
  // GRUPA SPÓŁEK
  // ============================================================

  {
    id: 'ksh-169',
    article: 'Art. 21¹ § 2',
    articleTitle: 'Uchwała o uczestnictwie w grupie spółek',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział IV - Grupa spółek',
    question: 'Uchwała zgromadzenia wspólników/walnego zgromadzenia spółki zależnej o uczestnictwie w grupie spółek zapada większością:',
    options: {
      a: 'Zwykłą większością głosów',
      b: 'Bezwzględną większością głosów',
      c: 'Trzech czwartych głosów',
      d: 'Jednomyślnie'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 21¹ § 2 k.s.h. zgromadzenie wspólników albo walne zgromadzenie spółki zależnej podejmuje większością trzech czwartych głosów uchwałę o uczestnictwie w grupie spółek ze wskazaniem spółki dominującej.',
    difficulty: 'hard',
    tags: ['grupa spółek', 'uchwała', 'większość kwalifikowana']
  },

  {
    id: 'ksh-170',
    article: 'Art. 21² § 1',
    articleTitle: 'Wiążące polecenie',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział IV - Grupa spółek',
    question: 'Spółka dominująca może wydać spółce zależnej wiążące polecenie:',
    options: {
      a: 'Bez żadnych ograniczeń',
      b: 'Jeżeli jest to uzasadnione interesem grupy spółek',
      c: 'Tylko za zgodą sądu',
      d: 'Tylko w sprawach finansowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21² § 1 k.s.h. spółka dominująca może wydać spółce zależnej uczestniczącej w grupie spółek wiążące polecenie dotyczące prowadzenia spraw spółki (wiążące polecenie), jeżeli jest to uzasadnione interesem grupy spółek oraz przepisy szczególne nie stanowią inaczej.',
    difficulty: 'medium',
    tags: ['wiążące polecenie', 'grupa spółek', 'interes grupy']
  },

  {
    id: 'ksh-171',
    article: 'Art. 21² § 2',
    articleTitle: 'Forma wiążącego polecenia',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział IV - Grupa spółek',
    question: 'Wiążące polecenie spółki dominującej wymaga formy:',
    options: {
      a: 'Ustnej',
      b: 'Pisemnej lub elektronicznej pod rygorem nieważności',
      c: 'Aktu notarialnego',
      d: 'Dowolnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21² § 2 k.s.h. spółka dominująca wydaje wiążące polecenie w formie pisemnej lub elektronicznej pod rygorem nieważności.',
    difficulty: 'medium',
    tags: ['wiążące polecenie', 'forma', 'grupa spółek']
  },

  {
    id: 'ksh-172',
    article: 'Art. 21⁴ § 1',
    articleTitle: 'Odmowa wykonania wiążącego polecenia',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział IV - Grupa spółek',
    question: 'Spółka zależna może odmówić wykonania wiążącego polecenia, jeżeli:',
    options: {
      a: 'Zarząd spółki zależnej nie zgadza się z poleceniem',
      b: 'Wykonanie polecenia doprowadziłoby do niewypłacalności spółki zależnej',
      c: 'Wspólnicy mniejszościowi zgłoszą sprzeciw',
      d: 'Polecenie dotyczy spraw finansowych'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21⁴ § 1 k.s.h. spółka zależna odmawia wykonania wiążącego polecenia, jeżeli jego wykonanie doprowadziłoby do niewypłacalności albo do zagrożenia niewypłacalnością tej spółki.',
    difficulty: 'hard',
    tags: ['odmowa wykonania', 'wiążące polecenie', 'niewypłacalność']
  },

  {
    id: 'ksh-173',
    article: 'Art. 21¹² § 1',
    articleTitle: 'Odpowiedzialność spółki dominującej za szkodę',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział IV - Grupa spółek',
    question: 'Spółka dominująca odpowiada wobec spółki zależnej za szkodę wyrządzoną wykonaniem wiążącego polecenia:',
    options: {
      a: 'Tylko gdy działała umyślnie',
      b: 'Która nie została naprawiona w terminie wskazanym w poleceniu',
      c: 'Bez żadnych ograniczeń',
      d: 'Tylko za zgodą sądu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 21¹² § 1 k.s.h. spółka dominująca odpowiada wobec spółki zależnej uczestniczącej w grupie spółek za szkodę, która została wyrządzona wykonaniem wiążącego polecenia i która nie została naprawiona w terminie wskazanym w wiążącym poleceniu, chyba że nie ponosi winy.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'szkoda', 'grupa spółek']
  },

  // ============================================================
  // PROSTA SPÓŁKA AKCYJNA - DODATKOWE
  // ============================================================

  {
    id: 'ksh-174',
    article: 'Art. 300⁵³ § 1',
    articleTitle: 'Rada dyrektorów w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W prostej spółce akcyjnej można ustanowić zamiast zarządu i rady nadzorczej:',
    options: {
      a: 'Tylko zarząd',
      b: 'Radę dyrektorów',
      c: 'Komitet wykonawczy',
      d: 'Komisję rewizyjną'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300⁵³ § 1 k.s.h. w prostej spółce akcyjnej ustanawia się zarząd albo radę dyrektorów. Jest to model monistyczny, alternatywny do tradycyjnego modelu dualistycznego (zarząd + rada nadzorcza).',
    difficulty: 'medium',
    tags: ['PSA', 'rada dyrektorów', 'model monistyczny']
  },

  {
    id: 'ksh-175',
    article: 'Art. 300⁷⁶ § 1',
    articleTitle: 'Dywidenda w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział II - Prawa akcjonariuszy',
    question: 'Kwota przeznaczona do podziału między akcjonariuszy PSA nie może przekraczać sumy:',
    options: {
      a: 'Zysku za ostatni rok obrotowy',
      b: 'Kapitału akcyjnego',
      c: 'Zysku i niepodzielonych zysków z lat ubiegłych pomniejszonych o niepokryte straty i odpisy',
      d: 'Sumy wkładów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 300⁷⁶ § 1 k.s.h. kwota przeznaczona do podziału między akcjonariuszy nie może przekraczać sumy zysku za ostatni rok obrotowy, niepodzielonych zysków z lat ubiegłych, utworzonych z zysku kapitałów rezerwowych, które mogą być przeznaczone na wypłatę dywidendy, oraz kwoty z kapitału akcyjnego, które są do tego przeznaczone, pomniejszonej o niepokryte straty, akcje własne oraz kwoty, które zgodnie z ustawą lub umową spółki powinny być przeznaczone z zysku za ostatni rok obrotowy na kapitały rezerwowe, które nie mogą być przeznaczone na wypłatę dywidendy.',
    difficulty: 'hard',
    tags: ['PSA', 'dywidenda', 'ograniczenia']
  },

  {
    id: 'ksh-176',
    article: 'Art. 300¹²² § 1',
    articleTitle: 'Rozwiązanie PSA bez likwidacji',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział V - Rozwiązanie i likwidacja',
    question: 'Prosta spółka akcyjna może zostać rozwiązana bez przeprowadzenia likwidacji przez:',
    options: {
      a: 'Uchwałę zarządu',
      b: 'Przejęcie całego majątku spółki przez oznaczonego akcjonariusza (akcjonariusza przejmującego)',
      c: 'Decyzję sądu rejestrowego',
      d: 'Upływ czasu określonego w umowie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300¹²² § 1 k.s.h. walne zgromadzenie może podjąć uchwałę o rozwiązaniu spółki bez przeprowadzania likwidacji przez przejęcie całego majątku spółki przez oznaczonego akcjonariusza (akcjonariusza przejmującego) z obowiązkiem zaspokojenia wierzycieli i pozostałych akcjonariuszy.',
    difficulty: 'hard',
    tags: ['PSA', 'rozwiązanie bez likwidacji', 'akcjonariusz przejmujący']
  },

  // ============================================================
  // ŁĄCZENIE SPÓŁEK - DODATKOWE
  // ============================================================

  {
    id: 'ksh-177',
    article: 'Art. 498 § 1',
    articleTitle: 'Łączenie spółek osobowych',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Spółki osobowe mogą się łączyć między sobą oraz ze spółkami kapitałowymi. Spółka osobowa nie może być jednak:',
    options: {
      a: 'Spółką przejmującą ani nowo zawiązaną',
      b: 'Spółką przejmowaną',
      c: 'Uczestnikiem łączenia w ogóle',
      d: 'Spółką, której majątek jest dzielony'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 491 § 2 k.s.h. spółka osobowa nie może być spółką przejmującą albo spółką nowo zawiązaną. Może być jedynie spółką przejmowaną.',
    difficulty: 'hard',
    tags: ['łączenie spółek', 'spółka osobowa', 'ograniczenia']
  },

  {
    id: 'ksh-178',
    article: 'Art. 499 § 1',
    articleTitle: 'Plan połączenia',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Plan połączenia spółek wymaga:',
    options: {
      a: 'Formy ustnej',
      b: 'Formy pisemnej',
      c: 'Formy aktu notarialnego',
      d: 'Dowolnej formy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 499 § 1 k.s.h. zarządy łączących się spółek sporządzają pisemny plan połączenia.',
    difficulty: 'easy',
    tags: ['plan połączenia', 'forma pisemna', 'łączenie spółek']
  },

  {
    id: 'ksh-179',
    article: 'Art. 506 § 1',
    articleTitle: 'Uchwała o połączeniu',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Łączenie się spółek wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia każdej z łączących się spółek, powziętej większością:',
    options: {
      a: 'Zwykłą większością głosów',
      b: 'Bezwzględną większością głosów',
      c: 'Trzech czwartych głosów',
      d: 'Dwóch trzecich głosów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 506 § 1 k.s.h. łączenie się spółek wymaga uchwały zgromadzenia wspólników lub walnego zgromadzenia każdej z łączących się spółek, powziętej większością trzech czwartych głosów, reprezentujących co najmniej połowę kapitału zakładowego, chyba że umowa lub statut spółki przewidują surowsze warunki.',
    difficulty: 'medium',
    tags: ['uchwała o połączeniu', 'większość kwalifikowana', 'łączenie spółek']
  },

  {
    id: 'ksh-180',
    article: 'Art. 493 § 1',
    articleTitle: 'Dzień połączenia',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Połączenie spółek następuje z dniem:',
    options: {
      a: 'Podjęcia uchwały o połączeniu',
      b: 'Sporządzenia planu połączenia',
      c: 'Wpisania połączenia do rejestru właściwego według siedziby spółki przejmującej lub nowo zawiązanej',
      d: 'Ogłoszenia planu połączenia'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 493 § 1 k.s.h. połączenie następuje z dniem wpisania połączenia do rejestru właściwego według siedziby spółki przejmującej albo spółki nowo zawiązanej (dzień połączenia). Wpis ten wywołuje skutek wykreślenia spółki przejmowanej albo spółek łączących się przez zawiązanie nowej spółki.',
    difficulty: 'medium',
    tags: ['dzień połączenia', 'wpis do rejestru', 'łączenie spółek']
  },

  // ============================================================
  // PODZIAŁ SPÓŁEK - DODATKOWE
  // ============================================================

  {
    id: 'ksh-181',
    article: 'Art. 528 § 1',
    articleTitle: 'Spółki podlegające podziałowi',
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
    explanation: 'Zgodnie z art. 528 § 1 k.s.h. spółkę kapitałową można podzielić na dwie albo więcej spółek kapitałowych. Spółki osobowe nie podlegają podziałowi w trybie k.s.h.',
    difficulty: 'easy',
    tags: ['podział spółek', 'spółka kapitałowa', 'ograniczenia']
  },

  {
    id: 'ksh-182',
    article: 'Art. 529 § 1 pkt 4',
    articleTitle: 'Podział przez wydzielenie',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Podział przez wydzielenie polega na:',
    options: {
      a: 'Przejęciu całego majątku spółki dzielonej',
      b: 'Przeniesieniu części majątku spółki dzielonej na istniejącą lub nowo zawiązaną spółkę',
      c: 'Likwidacji spółki dzielonej',
      d: 'Zawiązaniu tylko jednej nowej spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 529 § 1 pkt 4 k.s.h. podział przez wydzielenie polega na przeniesieniu części majątku spółki dzielonej na istniejącą spółkę lub na spółkę nowo zawiązaną. Spółka dzielona nie przestaje istnieć.',
    difficulty: 'medium',
    tags: ['podział przez wydzielenie', 'przeniesienie majątku', 'podział spółek']
  },

  {
    id: 'ksh-183',
    article: 'Art. 530 § 1',
    articleTitle: 'Zakaz podziału spółki',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Nie jest dopuszczalny podział spółki akcyjnej, jeżeli:',
    options: {
      a: 'Kapitał zakładowy przekracza 1 000 000 zł',
      b: 'Kapitał zakładowy nie został pokryty w całości',
      c: 'Spółka ma więcej niż 100 akcjonariuszy',
      d: 'Spółka istnieje dłużej niż 10 lat'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 530 § 1 k.s.h. nie jest dopuszczalny podział spółki akcyjnej, jeżeli kapitał zakładowy nie został pokryty w całości.',
    difficulty: 'hard',
    tags: ['zakaz podziału', 'kapitał zakładowy', 'S.A.']
  },

  // ============================================================
  // PRZEKSZTAŁCENIE - DODATKOWE
  // ============================================================

  {
    id: 'ksh-184',
    article: 'Art. 552',
    articleTitle: 'Zakaz przekształcenia',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Przekształcenie NIE jest dopuszczalne dla spółki:',
    options: {
      a: 'W likwidacji, która rozpoczęła podział majątku',
      b: 'Z kapitałem zakładowym powyżej 100 000 zł',
      c: 'Posiadającej więcej niż 10 wspólników',
      d: 'Istniejącej krócej niż rok'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 551 § 4 k.s.h. spółka w likwidacji może być przekształcona, jeżeli nie rozpoczęto podziału majątku. Rozpoczęcie podziału majątku wyklucza możliwość przekształcenia.',
    difficulty: 'hard',
    tags: ['zakaz przekształcenia', 'likwidacja', 'podział majątku']
  },

  {
    id: 'ksh-185',
    article: 'Art. 558 § 1',
    articleTitle: 'Badanie planu przekształcenia przez biegłego',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Plan przekształcenia spółki należy poddać badaniu przez biegłego:',
    options: {
      a: 'Zawsze',
      b: 'Tylko w przypadku przekształcenia w spółkę akcyjną',
      c: 'W przypadku przekształcenia spółki osobowej, chyba że wszyscy wspólnicy wyrazili zgodę na odstąpienie od badania',
      d: 'Nigdy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 559 § 1 i 2 k.s.h. plan przekształcenia w przypadku przekształcenia spółki osobowej należy poddać badaniu przez biegłego w zakresie poprawności i rzetelności, chyba że wszyscy wspólnicy prowadzący sprawy spółki złożą oświadczenie rezygnacji z badania.',
    difficulty: 'hard',
    tags: ['plan przekształcenia', 'biegły', 'badanie']
  },

  // ============================================================
  // FIRMA SPÓŁEK (Art. 24, 89, 104, 127, 160, 305)
  // ============================================================

  {
    id: 'ksh-186',
    article: 'Art. 24 § 1',
    articleTitle: 'Firma spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Firma spółki jawnej powinna zawierać:',
    options: {
      a: 'Nazwisko tylko jednego wspólnika',
      b: 'Nazwiska lub firmy (nazwy) wszystkich wspólników albo jednego/kilku z dodatkiem "i wspólnicy" lub "spółka jawna"',
      c: 'Tylko oznaczenie "spółka jawna"',
      d: 'Przedmiot działalności spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 24 § 1 k.s.h. firma spółki jawnej powinna zawierać nazwiska lub firmy (nazwy) wszystkich wspólników albo nazwisko albo firmę (nazwę) jednego albo kilku wspólników oraz dodatkowe oznaczenie "spółka jawna". Dopuszczalne jest używanie skrótu "sp.j."',
    difficulty: 'easy',
    tags: ['firma', 'spółka jawna', 'oznaczenie']
  },

  {
    id: 'ksh-187',
    article: 'Art. 90',
    articleTitle: 'Firma spółki partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Firma spółki partnerskiej powinna zawierać:',
    options: {
      a: 'Tylko oznaczenie "spółka partnerska"',
      b: 'Nazwisko co najmniej jednego partnera, dodatkowe oznaczenie "i partner", "i partnerzy" albo "spółka partnerska" oraz określenie wolnego zawodu',
      c: 'Nazwiska wszystkich partnerów',
      d: 'Tylko określenie wolnego zawodu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 90 § 1 k.s.h. firma spółki partnerskiej powinna zawierać nazwisko co najmniej jednego partnera, dodatkowe oznaczenie "i partner" bądź "i partnerzy" albo "spółka partnerska" oraz określenie wolnego zawodu wykonywanego w spółce.',
    difficulty: 'medium',
    tags: ['firma', 'spółka partnerska', 'wolny zawód']
  },

  {
    id: 'ksh-188',
    article: 'Art. 104 § 1',
    articleTitle: 'Firma spółki komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Firma spółki komandytowej powinna zawierać nazwisko/firmę:',
    options: {
      a: 'Tylko komandytariuszy',
      b: 'Co najmniej jednego komplementariusza i oznaczenie "spółka komandytowa"',
      c: 'Wszystkich wspólników',
      d: 'Tylko jednego wybranego wspólnika'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 104 § 1 k.s.h. firma spółki komandytowej powinna zawierać nazwisko jednego lub kilku komplementariuszy oraz dodatkowe oznaczenie "spółka komandytowa". Dopuszczalne jest używanie skrótu "sp.k."',
    difficulty: 'easy',
    tags: ['firma', 'spółka komandytowa', 'komplementariusz']
  },

  {
    id: 'ksh-189',
    article: 'Art. 104 § 4',
    articleTitle: 'Skutek zamieszczenia nazwiska komandytariusza w firmie',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Jeżeli nazwisko lub firma (nazwa) komandytariusza zostanie zamieszczone w firmie spółki komandytowej:',
    options: {
      a: 'Nie ma to żadnych konsekwencji',
      b: 'Komandytariusz odpowiada wobec osób trzecich jak komplementariusz',
      c: 'Spółka musi zmienić formę prawną',
      d: 'Komandytariusz musi wystąpić ze spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 104 § 4 k.s.h. nazwisko albo firma (nazwa) komandytariusza nie może być zamieszczone w firmie spółki. W przypadku zamieszczenia nazwiska lub firmy (nazwy) komandytariusza w firmie spółki, komandytariusz ten odpowiada wobec osób trzecich tak jak komplementariusz.',
    difficulty: 'medium',
    tags: ['firma', 'komandytariusz', 'odpowiedzialność']
  },

  {
    id: 'ksh-190',
    article: 'Art. 160 § 1',
    articleTitle: 'Firma spółki z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Firma spółki z ograniczoną odpowiedzialnością może być obrana dowolnie, z tym że:',
    options: {
      a: 'Musi zawierać nazwiska wspólników',
      b: 'Powinna zawierać dodatkowe oznaczenie "spółka z ograniczoną odpowiedzialnością"',
      c: 'Musi zawierać przedmiot działalności',
      d: 'Musi zawierać siedzibę spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 160 § 1 k.s.h. firma spółki może być obrana dowolnie, powinna jednak zawierać dodatkowe oznaczenie "spółka z ograniczoną odpowiedzialnością". Dopuszczalne jest używanie skrótu "spółka z o.o." lub "sp. z o.o."',
    difficulty: 'easy',
    tags: ['firma', 'spółka z o.o.', 'oznaczenie']
  },

  // ============================================================
  // PROKURA W SPÓŁKACH
  // ============================================================

  {
    id: 'ksh-191',
    article: 'Art. 41 § 1',
    articleTitle: 'Ustanowienie prokurenta w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Ustanowienie prokurenta w spółce jawnej wymaga:',
    options: {
      a: 'Jednomyślnej uchwały wspólników',
      b: 'Zgody wszystkich wspólników mających prawo prowadzenia spraw spółki',
      c: 'Zgody większości wspólników',
      d: 'Zgody sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 41 § 1 k.s.h. ustanowienie prokury wymaga zgody wszystkich wspólników mających prawo prowadzenia spraw spółki.',
    difficulty: 'medium',
    tags: ['prokura', 'spółka jawna', 'zgoda wspólników']
  },

  {
    id: 'ksh-192',
    article: 'Art. 41 § 2',
    articleTitle: 'Odwołanie prokury w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Odwołać prokurę w spółce jawnej może:',
    options: {
      a: 'Tylko wszyscy wspólnicy łącznie',
      b: 'Każdy wspólnik mający prawo prowadzenia spraw spółki',
      c: 'Tylko sąd rejestrowy',
      d: 'Tylko zgromadzenie wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 41 § 2 k.s.h. odwołać prokurę może każdy wspólnik mający prawo prowadzenia spraw spółki. W przeciwieństwie do ustanowienia prokury (które wymaga zgody wszystkich), do odwołania wystarczy działanie jednego wspólnika.',
    difficulty: 'medium',
    tags: ['prokura', 'odwołanie', 'spółka jawna']
  },

  {
    id: 'ksh-193',
    article: 'Art. 208 § 6',
    articleTitle: 'Prokura w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W sp. z o.o. prokurę ustanawia i odwołuje:',
    options: {
      a: 'Zgromadzenie wspólników',
      b: 'Rada nadzorcza',
      c: 'Zarząd',
      d: 'Prezes zarządu jednoosobowo'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 208 § 6 k.s.h. powołanie prokurenta wymaga zgody wszystkich członków zarządu. Odwołać prokurę może każdy członek zarządu.',
    difficulty: 'easy',
    tags: ['prokura', 'zarząd', 'sp. z o.o.']
  },

  // ============================================================
  // POZOSTAŁE WAŻNE PRZEPISY
  // ============================================================

  {
    id: 'ksh-194',
    article: 'Art. 229',
    articleTitle: 'Nabycie nieruchomości przez sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Nabycie dla sp. z o.o. nieruchomości albo udziału w nieruchomości przed upływem dwóch lat od dnia zarejestrowania spółki wymaga:',
    options: {
      a: 'Zgody sądu rejestrowego',
      b: 'Uchwały wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Zgody rady nadzorczej',
      d: 'Formy aktu notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 229 k.s.h. umowa o nabycie dla spółki nieruchomości albo udziału w nieruchomości lub środków trwałych za cenę przewyższającą jedną czwartą kapitału zakładowego, nie niższą jednak od 50.000 złotych, zawarta przed upływem dwóch lat od dnia zarejestrowania spółki, wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['nabycie nieruchomości', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-195',
    article: 'Art. 293 § 1',
    articleTitle: 'Wyłączenie wspólnika ze sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Z ważnych przyczyn dotyczących danego wspólnika sp. z o.o., sąd może orzec jego wyłączenie ze spółki na żądanie:',
    options: {
      a: 'Zarządu',
      b: 'Wszystkich pozostałych wspólników, jeżeli udziały wspólników żądających wyłączenia stanowią więcej niż połowę kapitału zakładowego',
      c: 'Każdego pojedynczego wspólnika',
      d: 'Rady nadzorczej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 266 § 1 k.s.h. z ważnych przyczyn dotyczących danego wspólnika sąd może orzec jego wyłączenie ze spółki na żądanie wszystkich pozostałych wspólników, jeżeli udziały wspólników żądających wyłączenia stanowią więcej niż połowę kapitału zakładowego.',
    difficulty: 'hard',
    tags: ['wyłączenie wspólnika', 'sąd', 'sp. z o.o.']
  },

  {
    id: 'ksh-196',
    article: 'Art. 174 § 4',
    articleTitle: 'Udziały niemające prawa głosu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Prawa i obowiązki wspólników',
    question: 'Umowa spółki z o.o. może przyznać wspólnikom udziały, które nie mają prawa głosu (tzw. udziały nieme):',
    options: {
      a: 'Tak, bez żadnych ograniczeń',
      b: 'Tak, ale muszą one być uprzywilejowane co do dywidendy',
      c: 'Nie, każdy udział musi dawać prawo głosu',
      d: 'Tylko za zgodą sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 174 § 4 k.s.h. umowa spółki może przyznać wspólnikom udziały, które nie mają prawa głosu. Udział niemy musi być jednak uprzywilejowany co do dywidendy - jest to rekompensata za brak prawa głosu.',
    difficulty: 'hard',
    tags: ['udziały nieme', 'uprzywilejowanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-197',
    article: 'Art. 250',
    articleTitle: 'Legitymacja do zaskarżenia uchwały',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawo do wytoczenia powództwa o uchylenie uchwały wspólników sp. z o.o. przysługuje wspólnikowi, który:',
    options: {
      a: 'Głosował za uchwałą',
      b: 'Głosował przeciwko uchwale i po jej powzięciu zażądał zaprotokołowania sprzeciwu',
      c: 'Wstrzymał się od głosu',
      d: 'Nie brał udziału w głosowaniu bez żadnych warunków'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 250 pkt 2 k.s.h. prawo do wytoczenia powództwa o uchylenie uchwały wspólników przysługuje wspólnikowi, który głosował przeciwko uchwale, a po jej powzięciu zażądał zaprotokołowania sprzeciwu.',
    difficulty: 'medium',
    tags: ['zaskarżenie uchwały', 'legitymacja', 'sprzeciw']
  },

  {
    id: 'ksh-198',
    article: 'Art. 420 § 1',
    articleTitle: 'Zaskarżenie uchwały WZ w S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała walnego zgromadzenia S.A. sprzeczna z ustawą jest:',
    options: {
      a: 'Ważna',
      b: 'Nieważna',
      c: 'Wzruszalna na żądanie każdego',
      d: 'Bezskuteczna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 425 § 1 k.s.h. osobom lub organom spółki wymienionym w art. 422 § 2 przysługuje prawo do wytoczenia przeciwko spółce powództwa o stwierdzenie nieważności uchwały walnego zgromadzenia sprzecznej z ustawą. Uchwała sprzeczna z ustawą jest nieważna z mocy prawa.',
    difficulty: 'easy',
    tags: ['nieważność uchwały', 'sprzeczność z ustawą', 'S.A.']
  },

  {
    id: 'ksh-199',
    article: 'Art. 17 § 1',
    articleTitle: 'Skutki braku wymaganej uchwały',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna spółki kapitałowej dokonana bez wymaganej przez ustawę uchwały właściwego organu jest:',
    options: {
      a: 'Ważna, ale nieskuteczna wobec spółki',
      b: 'Bezwzględnie nieważna',
      c: 'Ważna pod warunkiem zawieszającym',
      d: 'Względnie nieważna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. jeżeli do dokonania czynności prawnej przez spółkę ustawa wymaga uchwały wspólników albo walnego zgromadzenia bądź rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest nieważna.',
    difficulty: 'medium',
    tags: ['nieważność', 'brak uchwały', 'czynność prawna']
  },

  {
    id: 'ksh-200',
    article: 'Art. 12',
    articleTitle: 'Moment uzyskania osobowości prawnej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Spółka kapitałowa uzyskuje osobowość prawną:',
    options: {
      a: 'Z chwilą zawarcia umowy spółki',
      b: 'Z chwilą wniesienia wkładów',
      c: 'Z chwilą wpisu do rejestru',
      d: 'Z chwilą powołania zarządu'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 12 k.s.h. spółka z ograniczoną odpowiedzialnością w organizacji, prosta spółka akcyjna w organizacji albo spółka akcyjna w organizacji z chwilą wpisu do rejestru staje się odpowiednio spółką z o.o., PSA albo S.A. i uzyskuje osobowość prawną.',
    difficulty: 'easy',
    tags: ['osobowość prawna', 'wpis do rejestru', 'spółka kapitałowa']
  }
];

// ============================================================
// POŁĄCZONA BAZA PYTAŃ
// ============================================================

import { KSH_EXAM_QUESTIONS } from './ksh-exam-questions';

export const ALL_KSH_QUESTIONS = [...KSH_EXAM_QUESTIONS, ...KSH_EXAM_QUESTIONS_PART2];

export const COMBINED_DATABASE_STATS = {
  totalQuestions: ALL_KSH_QUESTIONS.length,
  byDifficulty: {
    easy: ALL_KSH_QUESTIONS.filter(q => q.difficulty === 'easy').length,
    medium: ALL_KSH_QUESTIONS.filter(q => q.difficulty === 'medium').length,
    hard: ALL_KSH_QUESTIONS.filter(q => q.difficulty === 'hard').length,
  },
  sections: [...new Set(ALL_KSH_QUESTIONS.map(q => q.section))],
  tags: [...new Set(ALL_KSH_QUESTIONS.flatMap(q => q.tags))],
};

console.log('Combined KSH Questions Database:', COMBINED_DATABASE_STATS);
