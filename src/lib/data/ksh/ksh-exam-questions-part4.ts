// ============================================================
// BAZA PYTAŃ EGZAMINACYJNYCH - KODEKS SPÓŁEK HANDLOWYCH
// CZĘŚĆ 4 - Dodatkowe 100 pytań (przypadki szczególne, wyjątki)
// Format: Egzaminy wstępne na aplikację radcowską/adwokacką
// ============================================================

import { ExamQuestion } from './ksh-exam-questions';

export const KSH_EXAM_QUESTIONS_PART4: ExamQuestion[] = [

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - SPÓŁKA JAWNA
  // ============================================================

  {
    id: 'ksh-301',
    article: 'Art. 25 § 1',
    articleTitle: 'Elementy umowy spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Umowa spółki jawnej powinna zawierać m.in.:',
    options: {
      a: 'Tylko firmę i siedzibę',
      b: 'Firmę i siedzibę spółki, określenie wkładów wnoszonych przez każdego wspólnika i ich wartość, przedmiot działalności spółki, czas trwania spółki (jeżeli jest oznaczony)',
      c: 'Tylko przedmiot działalności',
      d: 'Tylko określenie wkładów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 25 k.s.h. umowa spółki jawnej powinna zawierać: firmę i siedzibę spółki, określenie wkładów wnoszonych przez każdego wspólnika i ich wartość, przedmiot działalności spółki, czas trwania spółki, jeżeli jest oznaczony.',
    difficulty: 'easy',
    tags: ['umowa spółki jawnej', 'elementy', 'essentialia negotii']
  },

  {
    id: 'ksh-302',
    article: 'Art. 26 § 1',
    articleTitle: 'Zgłoszenie spółki jawnej do rejestru',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółka jawna powstaje z chwilą:',
    options: {
      a: 'Zawarcia umowy spółki',
      b: 'Wniesienia wkładów',
      c: 'Wpisu do rejestru',
      d: 'Rozpoczęcia działalności gospodarczej'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 25¹ § 1 k.s.h. spółka jawna powstaje z chwilą wpisu do rejestru. Jest to wpis konstytutywny.',
    difficulty: 'easy',
    tags: ['powstanie spółki jawnej', 'wpis do rejestru', 'konstytutywność']
  },

  {
    id: 'ksh-303',
    article: 'Art. 28',
    articleTitle: 'Zmiana umowy spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Zmiana postanowień umowy spółki jawnej wymaga:',
    options: {
      a: 'Zgody większości wspólników',
      b: 'Zgody wszystkich wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Zgody sądu rejestrowego',
      d: 'Formy aktu notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 9 k.s.h. zmiana postanowień umowy spółki wymaga zgody wszystkich wspólników, chyba że umowa stanowi inaczej. Przepis ten stosuje się do spółki jawnej.',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'zgoda wspólników', 'spółka jawna']
  },

  {
    id: 'ksh-304',
    article: 'Art. 32',
    articleTitle: 'Odpowiedzialność wspólnika przystępującego',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Osoba przystępująca do spółki jawnej odpowiada za zobowiązania spółki powstałe przed dniem jej przystąpienia:',
    options: {
      a: 'Nie odpowiada',
      b: 'Odpowiada bez ograniczeń, tak jak pozostali wspólnicy',
      c: 'Odpowiada tylko do wysokości wkładu',
      d: 'Odpowiada tylko za zobowiązania, o których wiedziała'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 32 k.s.h. osoba przystępująca do spółki odpowiada za zobowiązania spółki powstałe przed dniem jej przystąpienia.',
    difficulty: 'medium',
    tags: ['przystąpienie do spółki', 'odpowiedzialność', 'spółka jawna']
  },

  {
    id: 'ksh-305',
    article: 'Art. 33',
    articleTitle: 'Klauzula nieodpowiedzialności',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Umowa wspólnika spółki jawnej z wierzycielem o wyłączenie lub ograniczenie odpowiedzialności tego wspólnika za zobowiązania spółki jest:',
    options: {
      a: 'Ważna i skuteczna',
      b: 'Ważna, ale nieskuteczna wobec innych wierzycieli',
      c: 'Nieważna',
      d: 'Skuteczna tylko za zgodą pozostałych wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 34 k.s.h. postanowienia umowne niezgodne z przepisami niniejszego rozdziału są nieważne. Zatem umowa o wyłączenie odpowiedzialności wspólnika jest nieważna.',
    difficulty: 'hard',
    tags: ['klauzula nieodpowiedzialności', 'nieważność', 'spółka jawna']
  },

  {
    id: 'ksh-306',
    article: 'Art. 35 § 1',
    articleTitle: 'Przedawnienie roszczeń przeciwko wspólnikowi',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Roszczenia wierzycieli spółki jawnej przeciwko wspólnikowi przedawniają się:',
    options: {
      a: 'Z upływem roku od dnia wymagalności',
      b: 'Z upływem trzech lat od dnia zatwierdzenia sprawozdania finansowego za rok, w którym wspólnik wystąpił',
      c: 'Z upływem pięciu lat od dnia wymagalności roszczenia wobec spółki',
      d: 'Nie przedawniają się'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 35 § 1 k.s.h. roszczenia przeciwko wspólnikowi przedawniają się z upływem trzech lat od dnia zatwierdzenia sprawozdania finansowego za rok obrotowy, w którym wspólnik wystąpił ze spółki lub w którym spółka została rozwiązana. Jeżeli roszczenie stało się wymagalne po tym dniu – z upływem trzech lat od dnia wymagalności.',
    difficulty: 'hard',
    tags: ['przedawnienie', 'roszczenia wierzycieli', 'spółka jawna']
  },

  {
    id: 'ksh-307',
    article: 'Art. 37 § 1',
    articleTitle: 'Prawo prowadzenia spraw spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Każdy wspólnik spółki jawnej ma prawo i obowiązek prowadzenia spraw spółki. Prawo to:',
    options: {
      a: 'Nie może być wyłączone w umowie spółki',
      b: 'Może być wyłączone w umowie spółki',
      c: 'Może być wyłączone tylko przez sąd',
      d: 'Może być wyłączone tylko za zgodą wszystkich wspólników daną na piśmie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 37 § 1 k.s.h. każdy wspólnik ma prawo i obowiązek prowadzenia spraw spółki. Przepis art. 38 § 1 pozwala jednak na umowne wyłączenie wspólnika od prowadzenia spraw spółki.',
    difficulty: 'easy',
    tags: ['prowadzenie spraw', 'wyłączenie', 'spółka jawna']
  },

  {
    id: 'ksh-308',
    article: 'Art. 39 § 1',
    articleTitle: 'Sprzeciw wspólnika spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Jeżeli wspólnik spółki jawnej uprawniony do prowadzenia spraw zgłosi sprzeciw wobec czynności innego wspólnika przed jej dokonaniem:',
    options: {
      a: 'Czynność może być dokonana',
      b: 'Wymagana jest uchwała wszystkich wspólników mających prawo prowadzenia spraw spółki',
      c: 'Spór rozstrzyga sąd',
      d: 'Czynność jest nieważna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 39 § 2 k.s.h. w przypadku sprzeciwu o podjęciu czynności rozstrzyga uchwała wspólników. Do podjęcia uchwały potrzebna jest zgoda większości wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['sprzeciw', 'uchwała wspólników', 'spółka jawna']
  },

  {
    id: 'ksh-309',
    article: 'Art. 42',
    articleTitle: 'Czynności nagłe w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Wspólnik spółki jawnej pozbawiony prawa prowadzenia spraw może dokonać czynności nagłej:',
    options: {
      a: 'Nigdy',
      b: 'Tylko za zgodą wszystkich pozostałych wspólników',
      c: 'Jeżeli zaniechanie tej czynności mogłoby wyrządzić spółce poważną szkodę',
      d: 'Tylko w obecności innego wspólnika'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 44 k.s.h. wspólnik mający prawo prowadzenia spraw spółki może bez uchwały wspólników wykonać czynność nagłą, której zaniechanie mogłoby wyrządzić spółce poważną szkodę.',
    difficulty: 'medium',
    tags: ['czynność nagła', 'prowadzenie spraw', 'spółka jawna']
  },

  {
    id: 'ksh-310',
    article: 'Art. 46',
    articleTitle: 'Nieodpłatność prowadzenia spraw',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Za prowadzenie spraw spółki jawnej wspólnik:',
    options: {
      a: 'Zawsze otrzymuje wynagrodzenie',
      b: 'Nie otrzymuje wynagrodzenia, chyba że umowa spółki stanowi inaczej',
      c: 'Otrzymuje wynagrodzenie określone przez sąd',
      d: 'Otrzymuje wynagrodzenie proporcjonalne do wkładu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 46 k.s.h. za prowadzenie spraw spółki wspólnik nie otrzymuje wynagrodzenia. Umowa spółki może jednak przewidywać wynagrodzenie.',
    difficulty: 'easy',
    tags: ['wynagrodzenie', 'prowadzenie spraw', 'spółka jawna']
  },

  {
    id: 'ksh-311',
    article: 'Art. 51 § 1',
    articleTitle: 'Udział w zyskach i stratach spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Jeżeli umowa spółki jawnej nie stanowi inaczej, każdy wspólnik ma prawo do równego udziału w zyskach i uczestniczy w stratach:',
    options: {
      a: 'Proporcjonalnie do wkładu',
      b: 'W tym samym stosunku bez względu na rodzaj i wartość wkładu',
      c: 'Proporcjonalnie do czasu pracy włożonej w spółkę',
      d: 'Według uznania pozostałych wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 51 § 1 k.s.h. każdy wspólnik ma prawo do równego udziału w zyskach i uczestniczy w stratach w tym samym stosunku bez względu na rodzaj i wartość wkładu.',
    difficulty: 'medium',
    tags: ['udział w zyskach', 'udział w stratach', 'spółka jawna']
  },

  {
    id: 'ksh-312',
    article: 'Art. 51 § 3',
    articleTitle: 'Wyłączenie wspólnika od udziału w stratach',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Umowa spółki jawnej może zwolnić wspólnika od udziału w stratach:',
    options: {
      a: 'Tak, bez ograniczeń',
      b: 'Nie, jest to niedopuszczalne',
      c: 'Tak, ale wymaga to zgody sądu',
      d: 'Tak, ale tylko wspólnika wkładającego tylko pracę'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 51 § 3 k.s.h. umowa spółki może zwolnić wspólnika od udziału w stratach. Nie można natomiast wyłączyć wspólnika od udziału w zyskach.',
    difficulty: 'hard',
    tags: ['udział w stratach', 'zwolnienie', 'spółka jawna']
  },

  {
    id: 'ksh-313',
    article: 'Art. 52 § 1',
    articleTitle: 'Wypłata zysku w spółce jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Wspólnik spółki jawnej może żądać podziału i wypłaty całości zysku:',
    options: {
      a: 'W każdym czasie',
      b: 'Z końcem każdego roku obrotowego',
      c: 'Tylko przy likwidacji spółki',
      d: 'Tylko za zgodą wszystkich wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 52 § 1 k.s.h. wspólnik może żądać podziału i wypłaty całości zysku z końcem każdego roku obrotowego. Jeżeli wskutek poniesionej przez spółkę straty udział kapitałowy wspólnika został uszczuplony, zysk przeznacza się w pierwszej kolejności na uzupełnienie udziału kapitałowego.',
    difficulty: 'medium',
    tags: ['wypłata zysku', 'rok obrotowy', 'spółka jawna']
  },

  {
    id: 'ksh-314',
    article: 'Art. 53',
    articleTitle: 'Odsetki od udziału kapitałowego',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Wspólnik spółki jawnej ma prawo żądać corocznie wypłacenia odsetek od swojego udziału kapitałowego w wysokości:',
    options: {
      a: '5% bez względu na wynik finansowy',
      b: '5% nawet gdy spółka poniosła stratę, chyba że umowa stanowi inaczej',
      c: 'Określonej przez NBP',
      d: 'Określonej w umowie spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 53 k.s.h. wspólnik ma prawo żądać corocznie wypłacenia odsetek w wysokości 5% od swojego udziału kapitałowego, nawet gdy spółka poniosła stratę.',
    difficulty: 'hard',
    tags: ['odsetki', 'udział kapitałowy', 'spółka jawna']
  },

  {
    id: 'ksh-315',
    article: 'Art. 54 § 1',
    articleTitle: 'Zmniejszenie udziału kapitałowego',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Zmniejszenie udziału kapitałowego wspólnika spółki jawnej wymaga:',
    options: {
      a: 'Zgody sądu',
      b: 'Zgody wszystkich pozostałych wspólników',
      c: 'Zgody większości wspólników',
      d: 'Tylko pisemnego oświadczenia wspólnika'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 54 § 1 k.s.h. zmniejszenie udziału kapitałowego wymaga zgody pozostałych wspólników.',
    difficulty: 'medium',
    tags: ['udział kapitałowy', 'zmniejszenie', 'spółka jawna']
  },

  {
    id: 'ksh-316',
    article: 'Art. 55 § 1',
    articleTitle: 'Pobranie przez wspólnika kwoty ponad udział',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Wspólnik spółki jawnej, który bez zgody pozostałych wspólników pobrał ze spółki pieniądze na własne potrzeby ponad przypadającą na niego część zysku:',
    options: {
      a: 'Nie ponosi żadnych konsekwencji',
      b: 'Musi zwrócić pobraną kwotę bez odsetek',
      c: 'Obowiązany jest zapłacić odsetki ustawowe od pobranej kwoty',
      d: 'Podlega wykluczeniu ze spółki'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 55 k.s.h. wspólnik, który pobrał ze spółki pieniądze na własne potrzeby bez zgody pozostałych wspólników lub niezgodnie z przepisami niniejszego tytułu, obowiązany jest zapłacić spółce odsetki.',
    difficulty: 'medium',
    tags: ['pobranie pieniędzy', 'odsetki', 'spółka jawna']
  },

  {
    id: 'ksh-317',
    article: 'Art. 57 § 1',
    articleTitle: 'Śmierć wspólnika spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'W razie śmierci wspólnika spółki jawnej, jego spadkobiercy:',
    options: {
      a: 'Automatycznie wstępują w miejsce zmarłego wspólnika',
      b: 'Mogą żądać przekształcenia spółki',
      c: 'Mogą wstąpić w miejsce zmarłego wspólnika tylko jeżeli umowa spółki tak stanowi',
      d: 'Zawsze otrzymują tylko wartość udziału kapitałowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 60 k.s.h. jeżeli umowa spółki stanowi, że prawa, jakie miał zmarły wspólnik, służą wszystkim spadkobiercom wspólnie, stosuje się odpowiednio przepisy o współwłasności. Umowa spółki może przewidywać wstąpienie spadkobierców do spółki.',
    difficulty: 'hard',
    tags: ['śmierć wspólnika', 'spadkobiercy', 'spółka jawna']
  },

  {
    id: 'ksh-318',
    article: 'Art. 58 pkt 5',
    articleTitle: 'Wypowiedzenie umowy spółki jawnej przez wspólnika',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Wypowiedzenie umowy spółki jawnej przez wspólnika jest przyczyną:',
    options: {
      a: 'Wykluczenia wspólnika ze spółki',
      b: 'Rozwiązania spółki, chyba że umowa spółki stanowi inaczej lub pozostali wspólnicy tak postanowią',
      c: 'Natychmiastowego rozwiązania spółki',
      d: 'Zawieszenia działalności spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 58 pkt 5 k.s.h. wypowiedzenie umowy spółki przez wspólnika jest przyczyną rozwiązania spółki. Jednak zgodnie z art. 64 § 1 pomimo zaistnienia przyczyn rozwiązania, spółka trwa nadal między pozostałymi wspólnikami, jeżeli umowa spółki tak stanowi lub pozostali wspólnicy tak postanowią.',
    difficulty: 'medium',
    tags: ['wypowiedzenie', 'rozwiązanie spółki', 'spółka jawna']
  },

  {
    id: 'ksh-319',
    article: 'Art. 61 § 1',
    articleTitle: 'Termin wypowiedzenia umowy spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Jeżeli spółkę jawną zawarto na czas nieoznaczony, wspólnik może wypowiedzieć umowę spółki na:',
    options: {
      a: 'Koniec miesiąca kalendarzowego',
      b: 'Sześć miesięcy przed końcem roku obrotowego',
      c: 'Trzy miesiące przed końcem roku obrotowego',
      d: 'W każdym czasie ze skutkiem natychmiastowym'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 61 § 1 k.s.h. jeżeli spółkę zawarto na czas nieoznaczony, wspólnik może wypowiedzieć umowę spółki na sześć miesięcy przed końcem roku obrotowego.',
    difficulty: 'medium',
    tags: ['termin wypowiedzenia', 'rok obrotowy', 'spółka jawna']
  },

  {
    id: 'ksh-320',
    article: 'Art. 62 § 2',
    articleTitle: 'Wypowiedzenie bez zachowania terminu',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział IV - Rozwiązanie spółki',
    question: 'Wypowiedzenie umowy spółki jawnej bez zachowania terminów wypowiedzenia jest możliwe:',
    options: {
      a: 'Zawsze',
      b: 'Nigdy',
      c: 'Z ważnych powodów',
      d: 'Tylko za zgodą wszystkich wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 62 § 2 k.s.h. z ważnych powodów wspólnik może wypowiedzieć umowę spółki bez zachowania terminów wypowiedzenia, chociażby spółka była zawarta na czas oznaczony.',
    difficulty: 'medium',
    tags: ['wypowiedzenie', 'ważne powody', 'spółka jawna']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - SPÓŁKA PARTNERSKA
  // ============================================================

  {
    id: 'ksh-321',
    article: 'Art. 86 § 1',
    articleTitle: 'Definicja spółki partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółką partnerską jest spółka osobowa, utworzona przez wspólników (partnerów) w celu wykonywania:',
    options: {
      a: 'Dowolnej działalności gospodarczej',
      b: 'Wolnego zawodu w spółce prowadzącej przedsiębiorstwo pod własną firmą',
      c: 'Działalności handlowej',
      d: 'Działalności produkcyjnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 86 § 1 k.s.h. spółką partnerską jest spółka osobowa, utworzona przez wspólników (partnerów) w celu wykonywania wolnego zawodu w spółce prowadzącej przedsiębiorstwo pod własną firmą.',
    difficulty: 'easy',
    tags: ['definicja', 'wolny zawód', 'spółka partnerska']
  },

  {
    id: 'ksh-322',
    article: 'Art. 87 § 1',
    articleTitle: 'Wolne zawody w spółce partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Partnerami w spółce partnerskiej mogą być osoby uprawnione do wykonywania następujących zawodów:',
    options: {
      a: 'Tylko adwokaci i radcowie prawni',
      b: 'Adwokaci, radcowie prawni, lekarze, architekci, biegli rewidenci, doradcy podatkowi i inne zawody wymienione w ustawie',
      c: 'Tylko lekarze',
      d: 'Dowolne zawody'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 88 k.s.h. partnerami w spółce partnerskiej mogą być osoby uprawnione do wykonywania następujących zawodów: adwokata, aptekarza, architekta, inżyniera budownictwa, biegłego rewidenta, brokera ubezpieczeniowego, doradcy podatkowego, maklera papierów wartościowych, doradcy inwestycyjnego, księgowego, lekarza, lekarza dentysty, lekarza weterynarii, notariusza, pielęgniarki, położnej, radcy prawnego, rzecznika patentowego, rzeczoznawcy majątkowego i tłumacza przysięgłego.',
    difficulty: 'medium',
    tags: ['wolne zawody', 'partnerzy', 'spółka partnerska']
  },

  {
    id: 'ksh-323',
    article: 'Art. 95 § 1',
    articleTitle: 'Odpowiedzialność partnera',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Partner w spółce partnerskiej nie ponosi odpowiedzialności za zobowiązania spółki powstałe w związku z wykonywaniem przez pozostałych partnerów wolnego zawodu:',
    options: {
      a: 'Nigdy',
      b: 'Chyba że umowa spółki stanowi inaczej',
      c: 'Za wszystkie zobowiązania',
      d: 'Tylko za zobowiązania umowne'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 95 § 1 k.s.h. partner nie ponosi odpowiedzialności za zobowiązania spółki powstałe w związku z wykonywaniem przez pozostałych partnerów wolnego zawodu w spółce, jak również za zobowiązania spółki będące następstwem działań lub zaniechań osób zatrudnionych przez spółkę na podstawie umowy o pracę lub innego stosunku prawnego, które podlegały kierownictwu innego partnera przy świadczeniu usług związanych z przedmiotem działalności spółki.',
    difficulty: 'hard',
    tags: ['odpowiedzialność partnera', 'ograniczenie', 'spółka partnerska']
  },

  {
    id: 'ksh-324',
    article: 'Art. 95 § 2',
    articleTitle: 'Rozszerzenie odpowiedzialności w spółce partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Umowa spółki partnerskiej może przewidywać, że jeden albo większa liczba partnerów godzą się na ponoszenie odpowiedzialności:',
    options: {
      a: 'Tak jak wspólnik spółki jawnej (bez ograniczeń)',
      b: 'Tylko do wysokości wkładu',
      c: 'Solidarnie z pozostałymi partnerami',
      d: 'Umowa nie może rozszerzać odpowiedzialności'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 95 § 2 k.s.h. umowa spółki może przewidywać, że jeden albo większa liczba partnerów godzą się na ponoszenie odpowiedzialności tak jak wspólnik spółki jawnej.',
    difficulty: 'hard',
    tags: ['rozszerzenie odpowiedzialności', 'umowa', 'spółka partnerska']
  },

  {
    id: 'ksh-325',
    article: 'Art. 97 § 1',
    articleTitle: 'Zarząd w spółce partnerskiej',
    section: 'Tytuł III - Spółka partnerska',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Umowa spółki partnerskiej może przewidywać, że prowadzenie spraw i reprezentowanie spółki powierza się:',
    options: {
      a: 'Tylko wszystkim partnerom łącznie',
      b: 'Zarządowi, który składa się z partnerów lub osób trzecich',
      c: 'Tylko osobom trzecim',
      d: 'Tylko zewnętrznemu doradcy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 97 § 1 k.s.h. umowa spółki może przewidywać, że prowadzenie spraw i reprezentowanie spółki powierza się zarządowi. Do zarządu powołanego w spółce partnerskiej stosuje się odpowiednio przepisy o zarządzie spółki z o.o.',
    difficulty: 'medium',
    tags: ['zarząd', 'prowadzenie spraw', 'spółka partnerska']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - SPÓŁKA KOMANDYTOWA
  // ============================================================

  {
    id: 'ksh-326',
    article: 'Art. 102',
    articleTitle: 'Definicja spółki komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Spółką komandytową jest spółka osobowa mająca na celu prowadzenie przedsiębiorstwa pod własną firmą, w której:',
    options: {
      a: 'Wszyscy wspólnicy odpowiadają bez ograniczeń',
      b: 'Wobec wierzycieli za zobowiązania spółki co najmniej jeden wspólnik odpowiada bez ograniczenia (komplementariusz), a odpowiedzialność co najmniej jednego wspólnika jest ograniczona (komandytariusz)',
      c: 'Żaden wspólnik nie odpowiada',
      d: 'Wszyscy wspólnicy odpowiadają do sumy komandytowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 102 k.s.h. spółką komandytową jest spółka osobowa mająca na celu prowadzenie przedsiębiorstwa pod własną firmą, w której wobec wierzycieli za zobowiązania spółki co najmniej jeden wspólnik odpowiada bez ograniczenia (komplementariusz), a odpowiedzialność co najmniej jednego wspólnika (komandytariusz) jest ograniczona.',
    difficulty: 'easy',
    tags: ['definicja', 'komplementariusz', 'komandytariusz']
  },

  {
    id: 'ksh-327',
    article: 'Art. 107 § 1',
    articleTitle: 'Suma komandytowa a wkład komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Suma komandytowa to:',
    options: {
      a: 'To samo co wkład komandytariusza',
      b: 'Kwota do której komandytariusz odpowiada wobec wierzycieli spółki',
      c: 'Suma wkładów wszystkich wspólników',
      d: 'Kapitał zakładowy spółki komandytowej'
    },
    correct: 'b',
    explanation: 'Suma komandytowa to oznaczona kwotowo granica odpowiedzialności komandytariusza wobec wierzycieli spółki. Wkład komandytariusza to wartość majątkowa, którą komandytariusz wnosi do spółki. Są to dwie różne wartości - suma komandytowa może być wyższa, niższa lub równa wkładowi.',
    difficulty: 'medium',
    tags: ['suma komandytowa', 'wkład', 'komandytariusz']
  },

  {
    id: 'ksh-328',
    article: 'Art. 108 § 1',
    articleTitle: 'Zapis sumy komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział I - Przepisy ogólne',
    question: 'Sumę komandytową oraz przedmiot wkładu komandytariusza określa:',
    options: {
      a: 'Sąd rejestrowy',
      b: 'Umowa spółki',
      c: 'Komplementariusze',
      d: 'Wierzyciele spółki'
    },
    correct: 'b',
    explanation: 'Suma komandytowa oraz przedmiot wkładu komandytariusza określone są w umowie spółki. Zarówno suma komandytowa, jak i wysokość wkładu wniesionego do spółki przez każdego komandytariusza są ujawniane w rejestrze.',
    difficulty: 'easy',
    tags: ['suma komandytowa', 'umowa spółki', 'wkład']
  },

  {
    id: 'ksh-329',
    article: 'Art. 111 § 1',
    articleTitle: 'Zwolnienie z odpowiedzialności komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Komandytariusz jest wolny od odpowiedzialności w granicach wartości wkładu wniesionego do spółki. Oznacza to, że:',
    options: {
      a: 'Jeśli wkład = suma komandytowa, komandytariusz nie odpowiada wobec wierzycieli',
      b: 'Jeśli wkład > suma komandytowa, komandytariusz odpowiada za różnicę',
      c: 'Komandytariusz nigdy nie odpowiada',
      d: 'Komandytariusz zawsze odpowiada do sumy komandytowej'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 112 § 1 k.s.h. komandytariusz jest wolny od odpowiedzialności w granicach wartości wkładu wniesionego do spółki. Jeśli komandytariusz wniósł wkład w wysokości równej lub wyższej od sumy komandytowej, nie odpowiada osobiście wobec wierzycieli.',
    difficulty: 'hard',
    tags: ['zwolnienie z odpowiedzialności', 'wkład', 'suma komandytowa']
  },

  {
    id: 'ksh-330',
    article: 'Art. 112 § 2',
    articleTitle: 'Zwrot wkładu komandytariuszowi',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'W przypadku zwrotu wkładu komandytariuszowi w całości lub w części:',
    options: {
      a: 'Odpowiedzialność komandytariusza nie zmienia się',
      b: 'Odpowiedzialność komandytariusza zostaje przywrócona do wysokości sumy komandytowej',
      c: 'Komandytariusz przestaje być wspólnikiem',
      d: 'Wymagana jest zgoda wierzycieli'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 112 § 2 k.s.h. w przypadku zwrotu wkładu w całości albo w części odpowiedzialność zostaje przywrócona w wysokości równej wartości dokonanego zwrotu.',
    difficulty: 'hard',
    tags: ['zwrot wkładu', 'odpowiedzialność', 'komandytariusz']
  },

  {
    id: 'ksh-331',
    article: 'Art. 113',
    articleTitle: 'Co uważa się za zwrot wkładu',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Za zwrot wkładu komandytariuszowi uważa się również:',
    options: {
      a: 'Tylko wypłatę pieniężną',
      b: 'Wypłatę z zysku ponad przypadający na niego udział w zysku',
      c: 'Tylko obniżenie sumy komandytowej',
      d: 'Tylko wypłatę dywidendy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 112 § 3 k.s.h. za zwrot wkładu uważa się również: wypłatę z tytułu zysku ponad udział przypadający na komandytariusza, świadczenie dokonane na rzecz komandytariusza z majątku spółki oraz inne świadczenia.',
    difficulty: 'hard',
    tags: ['zwrot wkładu', 'wypłata z zysku', 'komandytariusz']
  },

  {
    id: 'ksh-332',
    article: 'Art. 116',
    articleTitle: 'Reprezentacja spółki komandytowej',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Komandytariusz może reprezentować spółkę komandytową:',
    options: {
      a: 'Bez ograniczeń',
      b: 'Tylko jako pełnomocnik',
      c: 'Nigdy',
      d: 'Tylko w sprawach nieprzekraczających zwykłego zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 118 § 1 k.s.h. komandytariusz może reprezentować spółkę jedynie jako pełnomocnik.',
    difficulty: 'easy',
    tags: ['reprezentacja', 'pełnomocnik', 'komandytariusz']
  },

  {
    id: 'ksh-333',
    article: 'Art. 117',
    articleTitle: 'Skutek działania komandytariusza bez umocowania',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Jeżeli komandytariusz dokona w imieniu spółki czynności prawnej nie ujawniając swojego pełnomocnictwa, odpowiada za skutki tej czynności wobec osób trzecich:',
    options: {
      a: 'Tylko do sumy komandytowej',
      b: 'Bez ograniczenia',
      c: 'Nie odpowiada',
      d: 'Solidarnie z komplementariuszem do sumy komandytowej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 118 § 2 k.s.h. jeżeli komandytariusz dokona w imieniu spółki czynności prawnej nie ujawniając swojego pełnomocnictwa, odpowiada za skutki tej czynności wobec osób trzecich bez ograniczenia. Dotyczy to także reprezentowania spółki bez umocowania lub z przekroczeniem jego zakresu.',
    difficulty: 'hard',
    tags: ['działanie bez umocowania', 'odpowiedzialność', 'komandytariusz']
  },

  {
    id: 'ksh-334',
    article: 'Art. 118 § 1',
    articleTitle: 'Prowadzenie spraw przez komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Komandytariusz nie ma prawa ani obowiązku prowadzenia spraw spółki komandytowej, chyba że:',
    options: {
      a: 'Żąda tego komplementariusz',
      b: 'Umowa spółki stanowi inaczej',
      c: 'Przekracza to zwykły zarząd',
      d: 'Spółka ponosi stratę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 121 § 1 k.s.h. komandytariusz nie ma prawa ani obowiązku prowadzenia spraw spółki, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['prowadzenie spraw', 'komandytariusz', 'umowa spółki']
  },

  {
    id: 'ksh-335',
    article: 'Art. 120',
    articleTitle: 'Prawo kontroli komandytariusza',
    section: 'Tytuł IV - Spółka komandytowa',
    subsection: 'Dział III - Stosunki wewnętrzne',
    question: 'Komandytariusz ma prawo:',
    options: {
      a: 'Tylko do udziału w zysku',
      b: 'Żądać odpisu sprawozdania finansowego oraz przeglądać księgi i dokumenty celem sprawdzenia jego rzetelności',
      c: 'Prowadzić sprawy spółki bez ograniczeń',
      d: 'Reprezentować spółkę samodzielnie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 120 k.s.h. komandytariusz ma prawo żądać odpisu sprawozdania finansowego za rok obrotowy oraz przeglądać księgi i dokumenty celem sprawdzenia jego rzetelności.',
    difficulty: 'easy',
    tags: ['prawo kontroli', 'komandytariusz', 'sprawozdanie finansowe']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - WKŁADY
  // ============================================================

  {
    id: 'ksh-336',
    article: 'Art. 14 § 1',
    articleTitle: 'Wkłady do spółki kapitałowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Przedmiotem wkładu niepieniężnego do spółki kapitałowej NIE może być:',
    options: {
      a: 'Nieruchomość',
      b: 'Prawo niezbywalne lub świadczenie pracy bądź usług',
      c: 'Przedsiębiorstwo',
      d: 'Wierzytelność'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 14 § 1 k.s.h. przedmiotem wkładu do spółki kapitałowej nie może być prawo niezbywalne lub świadczenie pracy bądź usług.',
    difficulty: 'medium',
    tags: ['wkład niepieniężny', 'zakaz', 'spółka kapitałowa']
  },

  {
    id: 'ksh-337',
    article: 'Art. 14 § 4',
    articleTitle: 'Zakaz potrącenia wkładu',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wspólnik lub akcjonariusz spółki kapitałowej NIE może:',
    options: {
      a: 'Wnieść wkładu pieniężnego',
      b: 'Potrącać swoich wierzytelności wobec spółki z wierzytelnością spółki względem wspólnika z tytułu należnej wpłaty na poczet udziałów/akcji',
      c: 'Wnieść wkładu rzeczowego',
      d: 'Objąć udziałów/akcji za cenę wyższą od nominalnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 14 § 4 k.s.h. wspólnik i akcjonariusz nie może potrącać swoich wierzytelności wobec spółki kapitałowej z wierzytelnością spółki względem wspólnika z tytułu należnej wpłaty na poczet udziałów albo akcji. Nie dotyczy to przypadku, gdy spółka odkupuje własne udziały lub akcje.',
    difficulty: 'hard',
    tags: ['zakaz potrącenia', 'wkład', 'spółka kapitałowa']
  },

  {
    id: 'ksh-338',
    article: 'Art. 158 § 1',
    articleTitle: 'Wkład niepieniężny w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wkładem do sp. z o.o. ma być w całości lub w części wkład niepieniężny (aport), umowa spółki powinna szczegółowo określać:',
    options: {
      a: 'Tylko wartość aportu',
      b: 'Przedmiot wkładu, osobę wspólnika wnoszącego aport oraz liczbę i wartość nominalną objętych w zamian udziałów',
      c: 'Tylko osobę wspólnika',
      d: 'Tylko liczbę udziałów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 158 § 1 k.s.h. jeżeli wkładem do spółki w całości lub w części ma być wkład niepieniężny (aport), umowa spółki powinna szczegółowo określać przedmiot tego wkładu oraz osobę wspólnika wnoszącego aport, jak również liczbę i wartość nominalną objętych w zamian udziałów.',
    difficulty: 'medium',
    tags: ['aport', 'umowa spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-339',
    article: 'Art. 175 § 1',
    articleTitle: 'Odpowiedzialność za wadliwy aport',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jeżeli wartość wkładów niepieniężnych została znacznie zawyżona w stosunku do ich wartości zbywczej w dniu zawarcia umowy spółki, wspólnik, który wniósł taki wkład:',
    options: {
      a: 'Nie ponosi odpowiedzialności',
      b: 'Jest obowiązany wyrównać spółce brakującą wartość wraz z członkami zarządu, którzy wiedząc o tym zgłosili spółkę do rejestru',
      c: 'Traci prawo głosu',
      d: 'Zostaje automatycznie wyłączony ze spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 175 § 1 k.s.h. jeżeli wartość wkładów niepieniężnych została znacznie zawyżona w stosunku do ich wartości zbywczej w dniu zawarcia umowy spółki, wspólnik, który wniósł taki wkład, oraz członkowie zarządu, którzy wiedząc o tym zgłosili spółkę do rejestru, obowiązani są solidarnie wyrównać spółce brakującą wartość.',
    difficulty: 'hard',
    tags: ['zawyżenie wartości aportu', 'odpowiedzialność', 'sp. z o.o.']
  },

  {
    id: 'ksh-340',
    article: 'Art. 300³ § 2',
    articleTitle: 'Wkład pracy w PSA',
    section: 'Tytuł IV - Prosta spółka akcyjna',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W prostej spółce akcyjnej wkładem niepieniężnym może być:',
    options: {
      a: 'Tylko nieruchomość',
      b: 'Wszelki wkład mający wartość majątkową, w tym świadczenie pracy lub usług',
      c: 'Tylko ruchomości',
      d: 'Tylko prawa majątkowe'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 300² § 2 k.s.h. wkładem niepieniężnym na pokrycie akcji w PSA może być wszelki wkład mający wartość majątkową, w szczególności świadczenie pracy lub usług. Jest to istotna różnica w stosunku do sp. z o.o. i S.A., gdzie praca i usługi nie mogą być wkładem.',
    difficulty: 'medium',
    tags: ['wkład pracy', 'PSA', 'aport']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - REPREZENTACJA I PROKURA
  // ============================================================

  {
    id: 'ksh-341',
    article: 'Art. 29 § 3',
    articleTitle: 'Sposób reprezentacji spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział II - Stosunek do osób trzecich',
    question: 'Każdy wspólnik spółki jawnej może reprezentować spółkę samodzielnie, chyba że:',
    options: {
      a: 'Spółka ma więcej niż dwóch wspólników',
      b: 'Umowa spółki stanowi inaczej',
      c: 'Wspólnik nie wniósł wkładu',
      d: 'Spółka działa dłużej niż rok'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 29 § 1 i 2 k.s.h. każdy wspólnik ma prawo reprezentować spółkę. Prawo to obejmuje wszystkie czynności sądowe i pozasądowe. Umowa spółki może jednak przewidywać, że wspólnik jest uprawniony do reprezentowania spółki łącznie z innym wspólnikiem lub prokurentem.',
    difficulty: 'easy',
    tags: ['reprezentacja', 'wspólnik', 'spółka jawna']
  },

  {
    id: 'ksh-342',
    article: 'Art. 205 § 1',
    articleTitle: 'Reprezentacja łączna w sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Jeżeli zarząd sp. z o.o. jest wieloosobowy, a umowa spółki nie określa sposobu reprezentacji, do składania oświadczeń w imieniu spółki wymagane jest:',
    options: {
      a: 'Działanie jednego członka zarządu',
      b: 'Współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem',
      c: 'Działanie prezesa zarządu',
      d: 'Współdziałanie wszystkich członków zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 205 § 1 k.s.h. jeżeli zarząd jest wieloosobowy, sposób reprezentowania określa umowa spółki. Jeżeli umowa nie zawiera żadnych postanowień w tym przedmiocie, do składania oświadczeń w imieniu spółki wymagane jest współdziałanie dwóch członków zarządu albo jednego członka zarządu łącznie z prokurentem.',
    difficulty: 'easy',
    tags: ['reprezentacja łączna', 'zarząd', 'sp. z o.o.']
  },

  {
    id: 'ksh-343',
    article: 'Art. 210 § 1',
    articleTitle: 'Umowa spółki z członkiem zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W umowie między sp. z o.o. a członkiem zarządu oraz w sporze z nim spółkę reprezentuje:',
    options: {
      a: 'Pozostali członkowie zarządu',
      b: 'Rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników',
      c: 'Prokurent',
      d: 'Sąd rejestrowy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 1 k.s.h. w umowie między spółką a członkiem zarządu oraz w sporze z nim spółkę reprezentuje rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników.',
    difficulty: 'medium',
    tags: ['umowa z członkiem zarządu', 'reprezentacja', 'sp. z o.o.']
  },

  {
    id: 'ksh-344',
    article: 'Art. 210 § 2',
    articleTitle: 'Umowa z jedynym wspólnikiem będącym członkiem zarządu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku gdy wspólnik sp. z o.o. jest zarazem jedynym członkiem zarządu, czynność prawna między tym wspólnikiem a reprezentowaną przez niego spółką wymaga formy:',
    options: {
      a: 'Pisemnej',
      b: 'Aktu notarialnego',
      c: 'Pisemnej z podpisami notarialnie poświadczonymi',
      d: 'Nie wymaga żadnej szczególnej formy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 210 § 2 k.s.h. w przypadku gdy wspólnik jest zarazem jedynym członkiem zarządu, przepis § 1 (reprezentacja przez RN lub pełnomocnika) nie ma zastosowania. Czynność prawna między tym wspólnikiem a reprezentowaną przez niego spółką wymaga formy aktu notarialnego.',
    difficulty: 'hard',
    tags: ['jednoosobowa spółka', 'forma aktu notarialnego', 'konflikt interesów']
  },

  {
    id: 'ksh-345',
    article: 'Art. 379 § 1',
    articleTitle: 'Umowa S.A. z członkiem zarządu',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'W umowie między S.A. a członkiem zarządu spółkę reprezentuje:',
    options: {
      a: 'Prezes zarządu',
      b: 'Rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia',
      c: 'Walne zgromadzenie',
      d: 'Prokura samoistna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 379 § 1 k.s.h. w umowie między spółką a członkiem zarządu, jak również w sporze z nim, spółkę reprezentuje rada nadzorcza albo pełnomocnik powołany uchwałą walnego zgromadzenia.',
    difficulty: 'easy',
    tags: ['umowa z członkiem zarządu', 'reprezentacja', 'S.A.']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - UCHWAŁY
  // ============================================================

  {
    id: 'ksh-346',
    article: 'Art. 17 § 2',
    articleTitle: 'Uchwała wymagana przez umowę/statut',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Czynność prawna spółki kapitałowej dokonana bez wymaganej przez umowę/statut uchwały właściwego organu jest:',
    options: {
      a: 'Nieważna',
      b: 'Ważna',
      c: 'Bezskuteczna zawieszona',
      d: 'Wzruszalna'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 17 § 2 k.s.h. czynność prawna dokonana bez zgody właściwego organu spółki, wymaganej wyłącznie przez umowę spółki albo statut, jest ważna, jednak nie wyklucza to odpowiedzialności członków zarządu wobec spółki z tytułu naruszenia umowy spółki albo statutu.',
    difficulty: 'hard',
    tags: ['czynność bez uchwały', 'ważność', 'odpowiedzialność']
  },

  {
    id: 'ksh-347',
    article: 'Art. 227 § 2',
    articleTitle: 'Uchwały bez zgromadzenia wspólników',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały wspólników sp. z o.o. mogą być powzięte bez odbycia zgromadzenia, jeżeli:',
    options: {
      a: 'Zgodzi się na to zarząd',
      b: 'Wszyscy wspólnicy wyrażą na piśmie zgodę na postanowienie, które ma być powzięte, albo na głosowanie pisemne',
      c: 'Zgodzi się na to rada nadzorcza',
      d: 'Jest to przewidziane w umowie spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 227 § 2 k.s.h. bez odbycia zgromadzenia wspólników mogą być powzięte uchwały, jeżeli wszyscy wspólnicy wyrażą na piśmie zgodę na postanowienie, które ma być powzięte, albo na głosowanie pisemne.',
    difficulty: 'medium',
    tags: ['uchwały pisemne', 'bez zgromadzenia', 'sp. z o.o.']
  },

  {
    id: 'ksh-348',
    article: 'Art. 245',
    articleTitle: 'Większość bezwzględna',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały zgromadzenia wspólników sp. z o.o. zapadają bezwzględną większością głosów, jeżeli przepisy k.s.h. lub umowa spółki nie stanowią inaczej. Bezwzględna większość oznacza:',
    options: {
      a: 'Ponad połowę głosów oddanych',
      b: 'Ponad połowę wszystkich głosów w spółce',
      c: 'Więcej głosów "za" niż "przeciw"',
      d: 'Co najmniej 2/3 głosów'
    },
    correct: 'a',
    explanation: 'Zgodnie z art. 4 § 1 pkt 10 k.s.h. bezwzględna większość głosów oznacza więcej niż połowę głosów oddanych. Art. 245 k.s.h. stanowi, że uchwały zapadają bezwzględną większością głosów, jeżeli przepisy niniejszego działu lub umowa spółki nie stanowią inaczej.',
    difficulty: 'medium',
    tags: ['bezwzględna większość', 'głosowanie', 'sp. z o.o.']
  },

  {
    id: 'ksh-349',
    article: 'Art. 246 § 1',
    articleTitle: 'Większość dla zmiany umowy sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały dotyczące zmiany umowy sp. z o.o. zapadają większością:',
    options: {
      a: 'Zwykłą większością głosów',
      b: 'Bezwzględną większością głosów',
      c: 'Dwóch trzecich głosów',
      d: 'Trzech czwartych głosów'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 246 § 1 k.s.h. uchwały dotyczące zmiany umowy spółki, rozwiązania spółki lub zbycia przedsiębiorstwa albo jego zorganizowanej części zapadają większością dwóch trzecich głosów.',
    difficulty: 'easy',
    tags: ['zmiana umowy', 'większość 2/3', 'sp. z o.o.']
  },

  {
    id: 'ksh-350',
    article: 'Art. 249 § 1',
    articleTitle: 'Zaskarżenie uchwały - przesłanki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwała wspólników sp. z o.o. sprzeczna z umową spółki bądź dobrymi obyczajami i godząca w interesy spółki lub mająca na celu pokrzywdzenie wspólnika może być zaskarżona w drodze powództwa o:',
    options: {
      a: 'Stwierdzenie nieważności uchwały',
      b: 'Uchylenie uchwały',
      c: 'Ustalenie nieistnienia uchwały',
      d: 'Zmianę uchwały'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 249 § 1 k.s.h. uchwała wspólników sprzeczna z umową spółki bądź dobrymi obyczajami i godząca w interesy spółki lub mająca na celu pokrzywdzenie wspólnika może być zaskarżona w drodze wytoczonego przeciwko spółce powództwa o uchylenie uchwały.',
    difficulty: 'medium',
    tags: ['zaskarżenie uchwały', 'uchylenie', 'sp. z o.o.']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - ROZWIĄZANIE I LIKWIDACJA
  // ============================================================

  {
    id: 'ksh-351',
    article: 'Art. 67 § 1',
    articleTitle: 'Likwidatorzy spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział V - Likwidacja',
    question: 'Likwidatorami spółki jawnej są:',
    options: {
      a: 'Osoby wyznaczone przez sąd',
      b: 'Wszyscy wspólnicy, chyba że umowa spółki lub uchwała wspólników stanowi inaczej',
      c: 'Tylko wspólnicy, którzy wnieśli największe wkłady',
      d: 'Biegli rewidenci'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 70 § 1 k.s.h. likwidatorami są wszyscy wspólnicy. Wspólnicy mogą powołać na likwidatorów tylko niektórych spośród siebie, jak również osoby spoza swego grona. Uchwała wymaga jednomyślności, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['likwidatorzy', 'spółka jawna', 'likwidacja']
  },

  {
    id: 'ksh-352',
    article: 'Art. 82',
    articleTitle: 'Podział majątku spółki jawnej',
    section: 'Tytuł II - Spółka jawna',
    subsection: 'Dział V - Likwidacja',
    question: 'Z majątku spółki jawnej pozostałego po spłaceniu zobowiązań i zwróceniu wkładów wspólnicy otrzymują kwoty:',
    options: {
      a: 'Proporcjonalne do wniesionych wkładów',
      b: 'Odpowiadające stosunkowi ich udziałom w zysku',
      c: 'W częściach równych',
      d: 'Według uznania likwidatorów'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 82 § 2 k.s.h. pozostałą część majątku dzieli się między wspólników odpowiadające stosunkowi, w jakim uczestniczą oni w zysku.',
    difficulty: 'medium',
    tags: ['podział majątku', 'likwidacja', 'spółka jawna']
  },

  {
    id: 'ksh-353',
    article: 'Art. 272',
    articleTitle: 'Rozwiązanie sp. z o.o. przez sąd na wniosek organu',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Sąd może rozwiązać sp. z o.o. na żądanie oznaczonego w odrębnej ustawie organu państwowego, jeżeli:',
    options: {
      a: 'Spółka nie osiąga zysków',
      b: 'Działalność spółki naruszająca prawo zagraża interesowi publicznemu',
      c: 'Spółka nie płaci podatków',
      d: 'Wspólnicy są skonfliktowani'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 271 pkt 3 k.s.h. sąd może wyrokiem orzec rozwiązanie spółki na żądanie oznaczonego w odrębnej ustawie organu państwowego, jeżeli działalność spółki naruszająca prawo zagraża interesowi publicznemu.',
    difficulty: 'hard',
    tags: ['rozwiązanie przez sąd', 'interes publiczny', 'sp. z o.o.']
  },

  {
    id: 'ksh-354',
    article: 'Art. 289 § 1',
    articleTitle: 'Wykreślenie sp. z o.o. z rejestru',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Rozwiązanie spółki z o.o. następuje z chwilą:',
    options: {
      a: 'Podjęcia uchwały o rozwiązaniu',
      b: 'Zakończenia likwidacji',
      c: 'Wykreślenia spółki z rejestru',
      d: 'Podziału majątku między wspólników'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 272 k.s.h. rozwiązanie spółki następuje po przeprowadzeniu likwidacji, z chwilą wykreślenia spółki z rejestru.',
    difficulty: 'easy',
    tags: ['rozwiązanie spółki', 'wykreślenie z rejestru', 'sp. z o.o.']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - PRZEKSZTAŁCENIA
  // ============================================================

  {
    id: 'ksh-355',
    article: 'Art. 551 § 1',
    articleTitle: 'Zasada kontynuacji przy przekształceniu',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Spółka przekształcana staje się spółką przekształconą z chwilą:',
    options: {
      a: 'Podjęcia uchwały o przekształceniu',
      b: 'Sporządzenia planu przekształcenia',
      c: 'Wpisu spółki przekształconej do rejestru (dzień przekształcenia)',
      d: 'Zatwierdzenia sprawozdania finansowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 552 k.s.h. spółka przekształcana staje się spółką przekształconą z chwilą wpisu spółki przekształconej do rejestru (dzień przekształcenia). Jednocześnie sąd rejestrowy z urzędu wykreśla spółkę przekształcaną.',
    difficulty: 'medium',
    tags: ['dzień przekształcenia', 'wpis do rejestru', 'przekształcenie']
  },

  {
    id: 'ksh-356',
    article: 'Art. 553 § 1',
    articleTitle: 'Skutki przekształcenia',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Spółce przekształconej przysługują wszystkie prawa i obowiązki spółki przekształcanej. Jest to tzw.:',
    options: {
      a: 'Sukcesja singularna',
      b: 'Sukcesja uniwersalna (kontynuacja)',
      c: 'Cesja praw',
      d: 'Przejęcie długu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 553 § 1 k.s.h. spółce przekształconej przysługują wszystkie prawa i obowiązki spółki przekształcanej. Spółka przekształcona pozostaje podmiotem w szczególności zezwoleń, koncesji oraz ulg, które zostały przyznane spółce przed jej przekształceniem, chyba że ustawa lub decyzja o udzieleniu zezwolenia, koncesji albo ulgi stanowi inaczej.',
    difficulty: 'easy',
    tags: ['sukcesja uniwersalna', 'kontynuacja', 'przekształcenie']
  },

  {
    id: 'ksh-357',
    article: 'Art. 574',
    articleTitle: 'Odpowiedzialność przy przekształceniu w spółkę osobową',
    section: 'Tytuł IV - Przekształcanie spółek',
    subsection: 'Dział III - Przekształcanie spółek',
    question: 'Przy przekształceniu spółki kapitałowej w spółkę osobową wspólnicy spółki przekształconej odpowiadają za zobowiązania spółki przekształcanej powstałe przed dniem przekształcenia:',
    options: {
      a: 'Bez ograniczeń',
      b: 'Na zasadach właściwych dla spółki przekształconej, przez okres trzech lat od dnia przekształcenia',
      c: 'Tylko do wysokości wniesionych wkładów',
      d: 'Nie odpowiadają'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 574 k.s.h. wspólnicy spółki przekształconej odpowiadają za zobowiązania spółki przekształcanej powstałe przed dniem przekształcenia na zasadach właściwych dla spółki przekształconej, przez okres trzech lat, licząc od dnia przekształcenia.',
    difficulty: 'hard',
    tags: ['odpowiedzialność', 'przekształcenie', 'okres 3 lat']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - ŁĄCZENIE I PODZIAŁ
  // ============================================================

  {
    id: 'ksh-358',
    article: 'Art. 492 § 1',
    articleTitle: 'Sukcesja uniwersalna przy łączeniu',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Z dniem połączenia spółka przejmująca wstępuje we wszystkie prawa i obowiązki spółki przejmowanej. Jest to:',
    options: {
      a: 'Cesja praw',
      b: 'Przejęcie długu',
      c: 'Sukcesja uniwersalna',
      d: 'Nabycie przedsiębiorstwa'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 494 § 1 k.s.h. spółka przejmująca albo spółka nowo zawiązana wstępuje z dniem połączenia we wszystkie prawa i obowiązki spółki przejmowanej albo spółek łączących się przez zawiązanie nowej spółki. Jest to tzw. sukcesja uniwersalna.',
    difficulty: 'easy',
    tags: ['sukcesja uniwersalna', 'łączenie spółek', 'prawa i obowiązki']
  },

  {
    id: 'ksh-359',
    article: 'Art. 495 § 1',
    articleTitle: 'Odpowiedzialność za zobowiązania przy połączeniu',
    section: 'Tytuł IV - Łączenie spółek',
    subsection: 'Dział I - Łączenie spółek',
    question: 'Wierzyciel łączącej się spółki, który zgłosił swój sprzeciw przeciwko połączeniu, może żądać:',
    options: {
      a: 'Unieważnienia połączenia',
      b: 'Zabezpieczenia swoich roszczeń, jeżeli wykaże, że połączenie zagraża ich zaspokojeniu',
      c: 'Natychmiastowej spłaty zobowiązania',
      d: 'Odszkodowania od wspólników'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 496 § 1 k.s.h. wierzyciel łączącej się spółki, który zgłosił swoje roszczenie w okresie między dniem ogłoszenia planu połączenia a dniem połączenia i uprawdopodobnił, że jego zaspokojenie jest zagrożone przez połączenie, może żądać, aby spółka przejmująca albo spółka nowo zawiązana udzieliła mu stosownego zabezpieczenia.',
    difficulty: 'hard',
    tags: ['ochrona wierzycieli', 'zabezpieczenie', 'łączenie spółek']
  },

  {
    id: 'ksh-360',
    article: 'Art. 531 § 1',
    articleTitle: 'Sukcesja przy podziale',
    section: 'Tytuł IV - Podział spółek',
    subsection: 'Dział II - Podział spółek',
    question: 'Spółki przejmujące lub spółki nowo zawiązane powstałe w związku z podziałem wstępują z dniem podziału bądź z dniem wydzielenia w prawa i obowiązki spółki dzielonej określone w planie podziału. Jest to:',
    options: {
      a: 'Sukcesja singularna',
      b: 'Sukcesja uniwersalna częściowa',
      c: 'Cesja praw',
      d: 'Przejęcie długu'
    },
    correct: 'b',
    explanation: 'Przy podziale mamy do czynienia z tzw. sukcesją uniwersalną częściową - spółki przejmujące/nowo zawiązane wstępują w określone w planie podziału prawa i obowiązki, ale nie we wszystkie (jak przy łączeniu).',
    difficulty: 'hard',
    tags: ['sukcesja częściowa', 'podział spółek', 'plan podziału']
  },

  // ============================================================
  // SZCZEGÓLNE PRZYPADKI - SPÓŁKI JEDNOOSOBOWE
  // ============================================================

  {
    id: 'ksh-361',
    article: 'Art. 4 § 1 pkt 3',
    articleTitle: 'Definicja spółki jednoosobowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Spółka jednoosobowa to spółka kapitałowa, w której:',
    options: {
      a: 'Jest tylko jeden członek zarządu',
      b: 'Wszystkie udziały/akcje należą do jednego wspólnika/akcjonariusza',
      c: 'Jest tylko jeden rodzaj udziałów/akcji',
      d: 'Kapitał zakładowy wynosi minimalną kwotę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 3 k.s.h. spółka jednoosobowa to spółka kapitałowa, której wszystkie udziały albo akcje należą do jednego wspólnika albo akcjonariusza.',
    difficulty: 'easy',
    tags: ['spółka jednoosobowa', 'definicja', 'wszystkie udziały']
  },

  {
    id: 'ksh-362',
    article: 'Art. 156',
    articleTitle: 'Zakaz tworzenia spółki jednoosobowej przez sp. z o.o.',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'Jednoosobowa spółka z o.o. nie może być założona przez:',
    options: {
      a: 'Osobę fizyczną',
      b: 'Inną jednoosobową spółkę z o.o.',
      c: 'Spółkę akcyjną',
      d: 'Fundację'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 151 § 2 k.s.h. spółka z ograniczoną odpowiedzialnością nie może być zawiązana wyłącznie przez inną jednoosobową spółkę z ograniczoną odpowiedzialnością.',
    difficulty: 'medium',
    tags: ['spółka jednoosobowa', 'zakaz', 'sp. z o.o.']
  },

  {
    id: 'ksh-363',
    article: 'Art. 173 § 2',
    articleTitle: 'Wpis w rejestrze o jedynym wspólniku',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział I - Powstanie spółki',
    question: 'W przypadku jednoosobowej sp. z o.o., do zgłoszeń i wpisów do rejestru stosuje się przepisy o jedynym wspólniku. O nabyciu lub utracie przez spółkę cech jednoosobowej należy:',
    options: {
      a: 'Poinformować sąd rejestrowy w ciągu 14 dni',
      b: 'Wpisać do rejestru nazwisko i imię albo firmę i siedzibę jedynego wspólnika oraz wzmiankę, że jest on jedynym wspólnikiem',
      c: 'Powiadomić urząd skarbowy',
      d: 'Sporządzić protokół notarialny'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 166 § 2 k.s.h. zgłoszenie do sądu rejestrowego jednoosobowej spółki powinno również zawierać nazwisko i imię albo firmę (nazwę) i siedzibę oraz adres jedynego wspólnika, a także wzmiankę, że jest on jedynym wspólnikiem spółki.',
    difficulty: 'medium',
    tags: ['spółka jednoosobowa', 'wpis do rejestru', 'sp. z o.o.']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - ODPOWIEDZIALNOŚĆ KARNA
  // ============================================================

  {
    id: 'ksh-364',
    article: 'Art. 585',
    articleTitle: 'Działanie na szkodę spółki',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, biorąc udział w tworzeniu spółki handlowej lub będąc członkiem jej zarządu, rady nadzorczej lub komisji rewizyjnej albo likwidatorem, działa na jej szkodę:',
    options: {
      a: 'Podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do lat 5',
      b: 'Nie podlega odpowiedzialności karnej (przepis uchylony)',
      c: 'Podlega tylko odpowiedzialności cywilnej',
      d: 'Podlega karze grzywny do 50.000 zł'
    },
    correct: 'b',
    explanation: 'Art. 585 k.s.h. został uchylony ustawą z dnia 9 czerwca 2011 r. (Dz.U. Nr 161, poz. 967). Działanie na szkodę spółki może być jednak karane na podstawie innych przepisów, np. art. 296 Kodeksu karnego (nadużycie zaufania).',
    difficulty: 'hard',
    tags: ['przepisy karne', 'uchylenie', 'działanie na szkodę']
  },

  {
    id: 'ksh-365',
    article: 'Art. 588',
    articleTitle: 'Nabycie udziałów/akcji własnych wbrew przepisom',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto, będąc członkiem zarządu spółki kapitałowej, dopuszcza do nabycia przez spółkę własnych udziałów lub akcji albo do brania ich w zastaw wbrew przepisom prawa:',
    options: {
      a: 'Nie ponosi odpowiedzialności karnej',
      b: 'Podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do 6 miesięcy',
      c: 'Podlega tylko odpowiedzialności cywilnej',
      d: 'Podlega karze pozbawienia wolności do lat 3'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 588 k.s.h. kto, będąc członkiem zarządu spółki kapitałowej, dopuszcza do nabycia przez spółkę własnych udziałów lub akcji albo do brania ich w zastaw wbrew przepisom prawa - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do 6 miesięcy.',
    difficulty: 'medium',
    tags: ['przepisy karne', 'udziały własne', 'odpowiedzialność karna']
  },

  {
    id: 'ksh-366',
    article: 'Art. 590',
    articleTitle: 'Udział w głosowaniu na podstawie fałszywych dokumentów',
    section: 'Tytuł VI - Przepisy karne',
    subsection: 'Przepisy karne',
    question: 'Kto przy głosowaniu na zgromadzeniu wspólników lub walnym zgromadzeniu akcjonariuszy posługuje się sfałszowanym lub cudzym dokumentem potwierdzającym prawo do udziału w głosowaniu:',
    options: {
      a: 'Podlega tylko odpowiedzialności cywilnej',
      b: 'Podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do roku',
      c: 'Podlega karze grzywny do 10.000 zł',
      d: 'Nie ponosi odpowiedzialności karnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 590 k.s.h. kto przy wykonywaniu prawa głosu z akcji lub udziałów w spółce albo na posiedzeniu wspólników spółki osobowej posługuje się fałszywym zaświadczeniem o złożeniu dokumentu akcji uprawniającej do głosowania, cudzym dokumentem lub posługuje się sfałszowanym dokumentem - podlega grzywnie, karze ograniczenia wolności albo pozbawienia wolności do roku.',
    difficulty: 'medium',
    tags: ['przepisy karne', 'fałszywy dokument', 'głosowanie']
  },

  // ============================================================
  // PRZYPADKI SZCZEGÓLNE - SPÓŁKA PUBLICZNA
  // ============================================================

  {
    id: 'ksh-367',
    article: 'Art. 4 § 1 pkt 6',
    articleTitle: 'Definicja spółki publicznej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Spółką publiczną jest:',
    options: {
      a: 'Każda spółka akcyjna',
      b: 'Spółka, której co najmniej jedna akcja jest dopuszczona do obrotu na rynku regulowanym lub wprowadzona do ASO na terytorium RP',
      c: 'Spółka, której właścicielem jest Skarb Państwa',
      d: 'Spółka notowana na GPW z kapitałem powyżej 1 mln zł'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 4 § 1 pkt 6 k.s.h. spółka publiczna to spółka w rozumieniu przepisów o ofercie publicznej i warunkach wprowadzania instrumentów finansowych do zorganizowanego systemu obrotu oraz o spółkach publicznych.',
    difficulty: 'medium',
    tags: ['spółka publiczna', 'definicja', 'rynek regulowany']
  },

  {
    id: 'ksh-368',
    article: 'Art. 402¹ § 1',
    articleTitle: 'Rejestracja udziału w WZ spółki publicznej',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Prawo uczestniczenia w walnym zgromadzeniu spółki publicznej mają osoby będące akcjonariuszami spółki:',
    options: {
      a: 'W dniu walnego zgromadzenia',
      b: 'Na szesnaście dni przed datą walnego zgromadzenia (dzień rejestracji uczestnictwa)',
      c: 'Na miesiąc przed datą walnego zgromadzenia',
      d: 'W dniu ogłoszenia o walnym zgromadzeniu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 406¹ § 1 k.s.h. prawo uczestniczenia w walnym zgromadzeniu spółki publicznej mają tylko osoby będące akcjonariuszami spółki na szesnaście dni przed datą walnego zgromadzenia (dzień rejestracji uczestnictwa w walnym zgromadzeniu).',
    difficulty: 'hard',
    tags: ['spółka publiczna', 'dzień rejestracji', 'walne zgromadzenie']
  },

  // ============================================================
  // PRAKTYCZNE SCENARIUSZE EGZAMINACYJNE
  // ============================================================

  {
    id: 'ksh-369',
    article: 'Art. 230',
    articleTitle: 'Rozporządzenie prawem lub zaciągnięcie zobowiązania',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego sp. z o.o. wymaga:',
    options: {
      a: 'Zgody rady nadzorczej',
      b: 'Uchwały wspólników, chyba że umowa spółki stanowi inaczej',
      c: 'Zgody sądu rejestrowego',
      d: 'Formy aktu notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 230 k.s.h. rozporządzenie prawem lub zaciągnięcie zobowiązania do świadczenia o wartości dwukrotnie przewyższającej wysokość kapitału zakładowego wymaga uchwały wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'medium',
    tags: ['rozporządzenie prawem', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-370',
    article: 'Art. 228 pkt 4',
    articleTitle: 'Nabycie i zbycie nieruchomości',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Uchwały wspólników sp. z o.o. wymaga nabycie i zbycie nieruchomości, użytkowania wieczystego lub udziału w nieruchomości, chyba że:',
    options: {
      a: 'Wartość transakcji nie przekracza 50.000 zł',
      b: 'Umowa spółki stanowi inaczej',
      c: 'Zgodzi się na to zarząd',
      d: 'Nieruchomość jest obciążona hipoteką'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 228 pkt 4 k.s.h. uchwały wspólników wymaga nabycie i zbycie nieruchomości, użytkowania wieczystego lub udziału w nieruchomości, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'easy',
    tags: ['nabycie nieruchomości', 'uchwała wspólników', 'sp. z o.o.']
  },

  {
    id: 'ksh-371',
    article: 'Art. 15 § 1',
    articleTitle: 'Zawarcie umowy z członkiem zarządu',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Zawarcie przez spółkę kapitałową umowy kredytu, pożyczki, poręczenia lub innej podobnej umowy z członkiem zarządu, rady nadzorczej, komisji rewizyjnej, prokurentem, likwidatorem albo na rzecz którejkolwiek z tych osób wymaga:',
    options: {
      a: 'Tylko pisemnej umowy',
      b: 'Zgody zgromadzenia wspólników albo walnego zgromadzenia',
      c: 'Zgody rady nadzorczej',
      d: 'Formy aktu notarialnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 15 § 1 k.s.h. zawarcie przez spółkę kapitałową umowy kredytu, pożyczki, poręczenia lub innej podobnej umowy z członkiem zarządu, rady nadzorczej, komisji rewizyjnej, prokurentem, likwidatorem albo na rzecz którejkolwiek z tych osób, wymaga zgody zgromadzenia wspólników albo walnego zgromadzenia, chyba że ustawa stanowi inaczej.',
    difficulty: 'medium',
    tags: ['umowa z członkiem organu', 'zgoda zgromadzenia', 'sp. kapitałowa']
  },

  {
    id: 'ksh-372',
    article: 'Art. 16',
    articleTitle: 'Skutek czynności bez wymaganej zgody',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Jeżeli do dokonania czynności prawnej przez spółkę kapitałową ustawa wymaga uchwały wspólników/walnego zgromadzenia albo rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest:',
    options: {
      a: 'Ważna, ale nieskuteczna',
      b: 'Bezwzględnie nieważna',
      c: 'Nieważna',
      d: 'Wzruszalna'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 17 § 1 k.s.h. jeżeli do dokonania czynności prawnej przez spółkę ustawa wymaga uchwały wspólników albo walnego zgromadzenia bądź rady nadzorczej, czynność prawna dokonana bez wymaganej uchwały jest nieważna.',
    difficulty: 'medium',
    tags: ['czynność bez uchwały', 'nieważność', 'spółka kapitałowa']
  },

  // ============================================================
  // DODATKOWE PYTANIA PRAKTYCZNE
  // ============================================================

  {
    id: 'ksh-373',
    article: 'Art. 20',
    articleTitle: 'Równe traktowanie wspólników/akcjonariuszy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Wspólnicy/akcjonariusze spółki kapitałowej powinni być traktowani:',
    options: {
      a: 'Proporcjonalnie do wysokości wkładów',
      b: 'Jednakowo w takich samych okolicznościach',
      c: 'Według stażu w spółce',
      d: 'Według uznania zarządu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 20 k.s.h. wspólnicy albo akcjonariusze spółki kapitałowej powinni być traktowani jednakowo w takich samych okolicznościach.',
    difficulty: 'easy',
    tags: ['równe traktowanie', 'wspólnicy', 'spółka kapitałowa']
  },

  {
    id: 'ksh-374',
    article: 'Art. 252 § 4',
    articleTitle: 'Skutek wyroku uchylającego uchwałę',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Prawomocny wyrok uchylający uchwałę wspólników sp. z o.o. ma moc obowiązującą:',
    options: {
      a: 'Tylko między stronami procesu',
      b: 'W stosunkach między spółką a wszystkimi wspólnikami oraz między spółką a członkami organów spółki',
      c: 'Tylko wobec powoda',
      d: 'Tylko wobec spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 254 § 1 k.s.h. prawomocny wyrok uchylający uchwałę ma moc obowiązującą w stosunkach między spółką a wszystkimi wspólnikami oraz w stosunkach między spółką a członkami organów spółki.',
    difficulty: 'hard',
    tags: ['wyrok uchylający', 'moc obowiązująca', 'erga omnes']
  },

  {
    id: 'ksh-375',
    article: 'Art. 268 § 1',
    articleTitle: 'Wpis do KRS o zmianie umowy spółki',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Zmiana umowy spółki z o.o. wymaga wpisu do rejestru. Wpis ten ma charakter:',
    options: {
      a: 'Deklaratoryjny',
      b: 'Konstytutywny',
      c: 'Informacyjny',
      d: 'Porządkowy'
    },
    correct: 'b',
    explanation: 'Zmiana umowy spółki z o.o. wymaga wpisu do rejestru i staje się skuteczna dopiero z chwilą wpisu. Wpis ma więc charakter konstytutywny.',
    difficulty: 'medium',
    tags: ['zmiana umowy', 'wpis konstytutywny', 'sp. z o.o.']
  },

  {
    id: 'ksh-376',
    article: 'Art. 258 § 2',
    articleTitle: 'Termin na wykonanie prawa pierwszeństwa',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział III - Zmiana umowy spółki',
    question: 'Prawo pierwszeństwa objęcia nowych udziałów przy podwyższeniu kapitału zakładowego sp. z o.o. należy wykonać w terminie:',
    options: {
      a: '7 dni od dnia wezwania',
      b: 'Miesiąca od dnia wezwania do wykonania prawa pierwszeństwa',
      c: '3 miesięcy od dnia wezwania',
      d: 'Bez ograniczenia terminem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 258 § 2 k.s.h. prawo pierwszeństwa należy wykonać w terminie miesiąca od dnia wezwania do jego wykonania. Wezwania te zarząd przesyła wspólnikom jednocześnie.',
    difficulty: 'hard',
    tags: ['prawo pierwszeństwa', 'termin', 'podwyższenie kapitału']
  },

  {
    id: 'ksh-377',
    article: 'Art. 299 § 2',
    articleTitle: 'Przesłanki egzoneracyjne art. 299',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Członek zarządu sp. z o.o. może uwolnić się od odpowiedzialności z art. 299, jeżeli wykaże, że:',
    options: {
      a: 'Nie wiedział o zobowiązaniach spółki',
      b: 'We właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub wszczęto postępowanie restrukturyzacyjne, albo że niezgłoszenie wniosku nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku wierzyciel nie poniósł szkody',
      c: 'Działał w dobrej wierze',
      d: 'Spółka nie miała majątku'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 299 § 2 k.s.h. członek zarządu może uwolnić się od odpowiedzialności, jeżeli wykaże, że we właściwym czasie zgłoszono wniosek o ogłoszenie upadłości lub w tym samym czasie wydano postanowienie o otwarciu postępowania restrukturyzacyjnego albo o zatwierdzeniu układu, albo że niezgłoszenie wniosku o ogłoszenie upadłości nastąpiło nie z jego winy, albo że pomimo niezgłoszenia wniosku wierzyciel nie poniósł szkody.',
    difficulty: 'hard',
    tags: ['art. 299', 'przesłanki egzoneracyjne', 'odpowiedzialność zarządu']
  },

  {
    id: 'ksh-378',
    article: 'Art. 299 § 4',
    articleTitle: 'Przedawnienie roszczeń z art. 299',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział IV - Rozwiązanie i likwidacja spółki',
    question: 'Roszczenia wierzycieli sp. z o.o. wobec członków zarządu na podstawie art. 299 k.s.h. przedawniają się:',
    options: {
      a: 'Z upływem roku od dnia, w którym egzekucja przeciwko spółce okazała się bezskuteczna',
      b: 'Z upływem trzech lat od dnia, w którym wierzyciel dowiedział się o szkodzie i osobie odpowiedzialnej, nie później niż dziesięć lat od dnia wyrządzenia szkody',
      c: 'Z upływem pięciu lat od dnia wymagalności roszczenia',
      d: 'Nie przedawniają się'
    },
    correct: 'b',
    explanation: 'Roszczenie z art. 299 k.s.h. ma charakter deliktowy (odszkodowawczy), stąd stosuje się ogólne terminy przedawnienia roszczeń deliktowych - 3 lata od dnia, w którym poszkodowany dowiedział się o szkodzie i osobie zobowiązanej do jej naprawienia, nie dłużej niż 10 lat od dnia, w którym nastąpiło zdarzenie wywołujące szkodę.',
    difficulty: 'hard',
    tags: ['art. 299', 'przedawnienie', 'odpowiedzialność zarządu']
  },

  {
    id: 'ksh-379',
    article: 'Art. 422 § 1',
    articleTitle: 'Zaskarżenie uchwały WZ S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Uchwała walnego zgromadzenia S.A. sprzeczna ze statutem bądź dobrymi obyczajami i godząca w interes spółki lub mająca na celu pokrzywdzenie akcjonariusza może być zaskarżona w drodze powództwa o:',
    options: {
      a: 'Stwierdzenie nieważności',
      b: 'Uchylenie',
      c: 'Ustalenie nieistnienia',
      d: 'Zmianę'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 422 § 1 k.s.h. uchwała walnego zgromadzenia sprzeczna ze statutem bądź dobrymi obyczajami i godząca w interes spółki lub mająca na celu pokrzywdzenie akcjonariusza może być zaskarżona w drodze wytoczonego przeciwko spółce powództwa o uchylenie uchwały.',
    difficulty: 'easy',
    tags: ['zaskarżenie uchwały', 'uchylenie', 'S.A.']
  },

  {
    id: 'ksh-380',
    article: 'Art. 425 § 1',
    articleTitle: 'Powództwo o stwierdzenie nieważności uchwały WZ',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział III - Organy spółki',
    question: 'Powództwo o stwierdzenie nieważności uchwały walnego zgromadzenia S.A. sprzecznej z ustawą przysługuje:',
    options: {
      a: 'Każdemu',
      b: 'Osobom lub organom spółki wymienionym w art. 422 § 2 (zarząd, rada nadzorcza, akcjonariusz, który głosował przeciw i żądał zaprotokołowania sprzeciwu)',
      c: 'Tylko akcjonariuszom większościowym',
      d: 'Tylko sądowi rejestrowemu'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 425 § 1 k.s.h. osobom lub organom spółki, wymienionym w art. 422 § 2, przysługuje prawo do wytoczenia przeciwko spółce powództwa o stwierdzenie nieważności uchwały walnego zgromadzenia sprzecznej z ustawą.',
    difficulty: 'medium',
    tags: ['nieważność uchwały', 'legitymacja', 'S.A.']
  },

  // ============================================================
  // OSTATNIE PYTANIA - KOMPLEKSOWE
  // ============================================================

  {
    id: 'ksh-381',
    article: 'Art. 2',
    articleTitle: 'Stosowanie przepisów Kodeksu cywilnego',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'W sprawach nieuregulowanych w k.s.h. do spółek handlowych stosuje się odpowiednio przepisy:',
    options: {
      a: 'Tylko przepisy o spółce cywilnej',
      b: 'Kodeksu cywilnego, a jeżeli wymaga tego właściwość (natura) stosunku prawnego spółki handlowej - przepisy te odpowiednio',
      c: 'Kodeksu postępowania cywilnego',
      d: 'Prawa upadłościowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 2 k.s.h. w sprawach określonych w art. 1 § 1 (spółki handlowe) nieuregulowanych w ustawie stosuje się przepisy Kodeksu cywilnego. Jeżeli wymaga tego właściwość (natura) stosunku prawnego spółki handlowej, przepisy Kodeksu cywilnego stosuje się odpowiednio.',
    difficulty: 'easy',
    tags: ['stosowanie KC', 'subsydiarność', 'przepisy ogólne']
  },

  {
    id: 'ksh-382',
    article: 'Art. 5 § 1',
    articleTitle: 'Dokumenty spółki',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Dokumenty związane z utworzeniem spółki i zmianami w spółce oraz inne dokumenty, których sporządzenie wymaga ustawa, należy przechowywać przez cały czas trwania spółki, a po jej wykreśleniu z rejestru:',
    options: {
      a: 'Można je zniszczyć',
      b: 'Oddać wspólnikom/akcjonariuszom',
      c: 'Przekazać na przechowanie do archiwum osobie wskazanej w uchwale lub przez sąd',
      d: 'Przesłać do sądu rejestrowego'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 5 § 2 k.s.h. księgi i dokumenty po wykreśleniu spółki z rejestru oddaje się na przechowanie wspólnikowi lub osobie trzeciej wskazanej w uchwale wspólników/akcjonariuszy. W przypadku braku takiego wskazania, osobę tę wyznacza sąd rejestrowy.',
    difficulty: 'medium',
    tags: ['dokumenty spółki', 'przechowywanie', 'archiwizacja']
  },

  {
    id: 'ksh-383',
    article: 'Art. 6 § 1',
    articleTitle: 'Odpowiedzialność wspólników za szkodę',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Jeżeli wspólnik spółki handlowej wyrządził szkodę spółce działaniem sprzecznym z prawem lub umową/statutem spółki, odpowiada za tę szkodę:',
    options: {
      a: 'Na zasadzie ryzyka',
      b: 'Wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy/statutu, chyba że nie ponosi winy',
      c: 'Tylko gdy działał umyślnie',
      d: 'Tylko gdy jest większościowym wspólnikiem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 6 § 1 k.s.h. wspólnicy spółek osobowych odpowiadają wobec spółki za szkodę wyrządzoną działaniem lub zaniechaniem sprzecznym z prawem lub postanowieniami umowy spółki, chyba że nie ponoszą winy.',
    difficulty: 'medium',
    tags: ['odpowiedzialność wspólników', 'szkoda', 'wina']
  },

  {
    id: 'ksh-384',
    article: 'Art. 7',
    articleTitle: 'Odesłanie do przepisów o S.A.',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział I - Przepisy wspólne',
    question: 'Do spółki z ograniczoną odpowiedzialnością, w sprawach nieuregulowanych w jej rozdziale, stosuje się odpowiednio przepisy o:',
    options: {
      a: 'Spółce jawnej',
      b: 'Spółce akcyjnej',
      c: 'Spółce cywilnej',
      d: 'Prostej spółce akcyjnej'
    },
    correct: 'b',
    explanation: 'Zgodnie z przepisami k.s.h. w sprawach nieuregulowanych w przepisach o sp. z o.o. stosuje się odpowiednio przepisy o spółce akcyjnej.',
    difficulty: 'medium',
    tags: ['odesłanie', 'stosowanie przepisów', 'sp. z o.o.']
  },

  {
    id: 'ksh-385',
    article: 'Różne artykuły',
    articleTitle: 'Porównanie terminów rejestracji',
    section: 'Porównanie spółek',
    subsection: 'Terminy',
    question: 'Termin zgłoszenia zawiązania spółki kapitałowej do sądu rejestrowego wynosi:',
    options: {
      a: '3 miesiące od zawarcia umowy/zawiązania',
      b: '6 miesięcy od zawarcia umowy/zawiązania',
      c: '1 rok od zawarcia umowy/zawiązania',
      d: 'Bez ograniczenia terminem'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 164 § 1 (sp. z o.o.) i art. 325 § 1 (S.A.) k.s.h. wniosek o wpis spółki do rejestru powinien być złożony nie później niż w terminie sześciu miesięcy od dnia zawarcia umowy spółki/zawiązania spółki.',
    difficulty: 'easy',
    tags: ['termin rejestracji', 'wpis do KRS', 'spółka kapitałowa']
  },

  {
    id: 'ksh-386',
    article: 'Różne artykuły',
    articleTitle: 'Formy dla spółek osobowych',
    section: 'Porównanie spółek',
    subsection: 'Forma umowy',
    question: 'Forma pisemna (nie akt notarialny) wymagana jest dla umowy:',
    options: {
      a: 'Spółki z o.o.',
      b: 'Spółki komandytowej',
      c: 'Spółki jawnej i partnerskiej',
      d: 'Spółki akcyjnej'
    },
    correct: 'c',
    explanation: 'Umowa spółki jawnej (art. 23 § 1) i umowa spółki partnerskiej (art. 92 § 1) wymagają formy pisemnej pod rygorem nieważności. Umowy/statuty pozostałych spółek wymagają formy aktu notarialnego.',
    difficulty: 'medium',
    tags: ['forma umowy', 'pisemna', 'spółki osobowe']
  },

  {
    id: 'ksh-387',
    article: 'Art. 10 § 1',
    articleTitle: 'Przeniesienie ogółu praw i obowiązków wspólnika',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Ogół praw i obowiązków wspólnika spółki osobowej może być przeniesiony na inną osobę:',
    options: {
      a: 'Zawsze bez ograniczeń',
      b: 'Tylko gdy umowa spółki tak stanowi, po uzyskaniu zgody wszystkich pozostałych wspólników (chyba że umowa przewiduje inaczej)',
      c: 'Nigdy',
      d: 'Tylko za zgodą sądu rejestrowego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 10 § 1 i 2 k.s.h. ogół praw i obowiązków wspólnika spółki osobowej może być przeniesiony na inną osobę tylko wówczas, gdy umowa spółki tak stanowi. Wymaga to pisemnej zgody wszystkich pozostałych wspólników, chyba że umowa spółki stanowi inaczej.',
    difficulty: 'hard',
    tags: ['przeniesienie członkostwa', 'zgoda wspólników', 'spółka osobowa']
  },

  {
    id: 'ksh-388',
    article: 'Art. 10 § 3',
    articleTitle: 'Odpowiedzialność zbywcy i nabywcy',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'W przypadku przeniesienia ogółu praw i obowiązków wspólnika spółki osobowej, za zobowiązania występującego wspólnika:',
    options: {
      a: 'Odpowiada tylko nabywca',
      b: 'Odpowiada tylko zbywca',
      c: 'Odpowiada zarówno zbywca (występujący), jak i nabywca (wstępujący) solidarnie',
      d: 'Nikt nie odpowiada'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 10 § 3 k.s.h. w przypadku przeniesienia ogółu praw i obowiązków wspólnika na inną osobę, za zobowiązania występującego wspólnika związane z uczestnictwem w spółce osobowej i za zobowiązania spółki odpowiadają solidarnie występujący wspólnik oraz wspólnik przystępujący do spółki.',
    difficulty: 'hard',
    tags: ['odpowiedzialność solidarna', 'zbywca', 'nabywca']
  },

  {
    id: 'ksh-389',
    article: 'Art. 8 § 2',
    articleTitle: 'Zdolność sądowa spółki osobowej',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Spółka osobowa może we własnym imieniu:',
    options: {
      a: 'Tylko zawierać umowy',
      b: 'Nabywać prawa i zaciągać zobowiązania, pozywać i być pozywana',
      c: 'Tylko nabywać prawa',
      d: 'Tylko być pozywana'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 8 § 1 k.s.h. spółka osobowa może we własnym imieniu nabywać prawa, w tym własność nieruchomości i inne prawa rzeczowe, zaciągać zobowiązania, pozywać i być pozywana.',
    difficulty: 'easy',
    tags: ['zdolność prawna', 'zdolność sądowa', 'spółka osobowa']
  },

  {
    id: 'ksh-390',
    article: 'Art. 11 § 1',
    articleTitle: 'Śmierć wspólnika a przeniesienie członkostwa',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział II - Spółki osobowe',
    question: 'Umowa spółki osobowej może przewidywać, że w razie śmierci wspólnika jego spadkobiercy wstąpią do spółki na miejsce zmarłego wspólnika. W takim przypadku spadkobiercy odpowiadają za zobowiązania zmarłego wspólnika:',
    options: {
      a: 'Nie odpowiadają',
      b: 'Solidarnie ze spółką',
      c: 'Tylko do wartości spadku',
      d: 'Według przepisów Kodeksu cywilnego o odpowiedzialności spadkobierców za długi spadkowe'
    },
    correct: 'd',
    explanation: 'Zgodnie z art. 60 § 2 k.s.h. spadkobiercy wspólnika odpowiadają według przepisów prawa spadkowego za zobowiązania zmarłego wspólnika związane z uczestnictwem w spółce.',
    difficulty: 'hard',
    tags: ['śmierć wspólnika', 'spadkobiercy', 'odpowiedzialność']
  },

  {
    id: 'ksh-391',
    article: 'Art. 21 § 1',
    articleTitle: 'Sąd rejestrowy a wady umowy spółki',
    section: 'Tytuł I - Przepisy ogólne',
    subsection: 'Dział III - Spółki kapitałowe',
    question: 'Sąd rejestrowy może odmówić wpisu spółki do rejestru, jeżeli umowa lub statut spółki nie odpowiadają:',
    options: {
      a: 'Tylko wymogom formalnym',
      b: 'Przepisom prawa, w szczególności jeżeli zawierają postanowienia sprzeczne z prawem',
      c: 'Interesom wspólników',
      d: 'Dobrym obyczajom'
    },
    correct: 'b',
    explanation: 'Sąd rejestrowy bada, czy umowa/statut spółki są zgodne z przepisami prawa i może odmówić wpisu, jeśli zawierają postanowienia sprzeczne z prawem.',
    difficulty: 'medium',
    tags: ['sąd rejestrowy', 'odmowa wpisu', 'wady umowy']
  },

  {
    id: 'ksh-392',
    article: 'Art. 233',
    articleTitle: 'Obniżenie kapitału zakładowego - przyczyna',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'W przypadku gdy bilans sporządzony przez zarząd sp. z o.o. wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz połowę kapitału zakładowego, zarząd jest obowiązany:',
    options: {
      a: 'Natychmiast złożyć wniosek o upadłość',
      b: 'Niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki',
      c: 'Obniżyć kapitał zakładowy',
      d: 'Dokonać odpisu amortyzacyjnego'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 233 § 1 k.s.h. jeżeli bilans sporządzony przez zarząd wykaże stratę przewyższającą sumę kapitałów zapasowego i rezerwowych oraz połowę kapitału zakładowego, zarząd jest obowiązany niezwłocznie zwołać zgromadzenie wspólników w celu powzięcia uchwały dotyczącej dalszego istnienia spółki.',
    difficulty: 'hard',
    tags: ['strata', 'dalsze istnienie spółki', 'sp. z o.o.']
  },

  {
    id: 'ksh-393',
    article: 'Art. 241',
    articleTitle: 'Zdolność zgromadzenia wspólników do podejmowania uchwał',
    section: 'Tytuł III - Spółka z o.o.',
    subsection: 'Dział II - Organy spółki',
    question: 'Zgromadzenie wspólników sp. z o.o. jest ważne:',
    options: {
      a: 'Tylko gdy obecna jest większość wspólników',
      b: 'Tylko gdy reprezentowana jest połowa kapitału zakładowego',
      c: 'Bez względu na liczbę reprezentowanych udziałów, o ile przepis szczególny nie stanowi inaczej',
      d: 'Tylko gdy obecny jest zarząd'
    },
    correct: 'c',
    explanation: 'W k.s.h. nie ma ogólnego wymogu kworum dla zgromadzenia wspólników sp. z o.o. Zgromadzenie jest ważne bez względu na liczbę reprezentowanych udziałów, o ile przepis szczególny (np. art. 246 § 1 dla niektórych uchwał) nie stanowi inaczej.',
    difficulty: 'medium',
    tags: ['zdolność zgromadzenia', 'kworum', 'sp. z o.o.']
  },

  {
    id: 'ksh-394',
    article: 'Art. 415 § 3',
    articleTitle: 'Kworum dla zmiany statutu S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Statut S.A. może ustanowić surowsze warunki podjęcia uchwały o zmianie statutu:',
    options: {
      a: 'Nie, wymogi są bezwzględnie obowiązujące',
      b: 'Tak, statut może wymagać większej większości głosów lub kworum',
      c: 'Tak, ale tylko za zgodą sądu',
      d: 'Nie może ustanawiać surowszych warunków, ale może złagodzić'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 415 § 3 k.s.h. statut może ustanowić surowsze warunki powzięcia uchwał w sprawach określonych w § 1 i 2, wymagając większej większości głosów lub wyższego kworum.',
    difficulty: 'hard',
    tags: ['zmiana statutu', 'surowsze warunki', 'S.A.']
  },

  {
    id: 'ksh-395',
    article: 'Art. 443 § 1',
    articleTitle: 'Podwyższenie kapitału zakładowego ze środków spółki',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Walne zgromadzenie S.A. może podwyższyć kapitał zakładowy, przeznaczając na to środki z kapitału zapasowego lub kapitałów rezerwowych utworzonych z zysku. Akcje nowej emisji przysługują:',
    options: {
      a: 'Tylko dotychczasowym akcjonariuszom',
      b: 'Akcjonariuszom w stosunku do ich dotychczasowych udziałów w kapitale zakładowym',
      c: 'Nowym inwestorom',
      d: 'Pracownikom spółki'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 443 § 1 k.s.h. walne zgromadzenie może podwyższyć kapitał zakładowy, przeznaczając na ten cel środki z kapitałów rezerwowych lub zapasowego. Zgodnie z § 2 nowe akcje przysługują akcjonariuszom w stosunku do ich dotychczasowych udziałów.',
    difficulty: 'medium',
    tags: ['podwyższenie kapitału', 'środki spółki', 'S.A.']
  },

  {
    id: 'ksh-396',
    article: 'Art. 444 § 1',
    articleTitle: 'Warunkowe podwyższenie kapitału zakładowego',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Warunkowe podwyższenie kapitału zakładowego S.A. może być dokonane w celu:',
    options: {
      a: 'Dowolnym, określonym przez walne zgromadzenie',
      b: 'Przyznania praw do objęcia akcji przez obligatariuszy obligacji zamiennych lub z prawem pierwszeństwa, pracowników, członków zarządu lub rady nadzorczej w zamian za wkłady niepieniężne stanowiące wierzytelności',
      c: 'Obniżenia kapitału zapasowego',
      d: 'Wypłaty dywidendy'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 448 § 2 k.s.h. warunkowe podwyższenie kapitału zakładowego może być dokonane wyłącznie w celu: przyznania praw do objęcia akcji przez obligatariuszy obligacji zamiennych lub obligacji z prawem pierwszeństwa, przyznania praw do objęcia akcji przez pracowników, członków zarządu lub rady nadzorczej, przyznania praw do objęcia akcji osobom uprawnionym z warrantów subskrypcyjnych.',
    difficulty: 'hard',
    tags: ['warunkowe podwyższenie', 'cel', 'S.A.']
  },

  {
    id: 'ksh-397',
    article: 'Art. 457 § 1',
    articleTitle: 'Obniżenie kapitału zakładowego S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Kapitał zakładowy S.A. obniża się przez:',
    options: {
      a: 'Tylko umorzenie akcji',
      b: 'Zmniejszenie wartości nominalnej akcji, połączenie akcji lub umorzenie części akcji',
      c: 'Tylko zmniejszenie wartości nominalnej',
      d: 'Tylko połączenie akcji'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 455 § 1 k.s.h. kapitał zakładowy obniża się przez zmniejszenie wartości nominalnej akcji, połączenie akcji lub przez umorzenie części akcji.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'sposoby', 'S.A.']
  },

  {
    id: 'ksh-398',
    article: 'Art. 458 § 1',
    articleTitle: 'Ogłoszenie o obniżeniu kapitału S.A.',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'O uchwaleniu obniżenia kapitału zakładowego S.A. zarząd niezwłocznie ogłasza, wzywając wierzycieli do zgłoszenia roszczeń w terminie:',
    options: {
      a: 'Jednego miesiąca',
      b: 'Dwóch miesięcy',
      c: 'Trzech miesięcy',
      d: 'Sześciu miesięcy'
    },
    correct: 'c',
    explanation: 'Zgodnie z art. 456 § 1 k.s.h. o uchwaleniu obniżenia kapitału zakładowego zarząd niezwłocznie ogłasza, wzywając wierzycieli do zgłoszenia roszczeń wobec spółki w terminie trzech miesięcy od dnia ogłoszenia.',
    difficulty: 'medium',
    tags: ['obniżenie kapitału', 'wezwanie wierzycieli', 'termin']
  },

  {
    id: 'ksh-399',
    article: 'Art. 459 § 1',
    articleTitle: 'Wpis obniżenia kapitału do rejestru',
    section: 'Tytuł IV - Spółka akcyjna',
    subsection: 'Dział IV - Zmiana statutu',
    question: 'Obniżenie kapitału zakładowego S.A. zarząd zgłasza do sądu rejestrowego. Zgłoszenie może nastąpić nie wcześniej niż po upływie terminu do zgłoszenia roszczeń przez wierzycieli oraz:',
    options: {
      a: 'Bez dodatkowych warunków',
      b: 'Po zaspokojeniu lub zabezpieczeniu wierzycieli, którzy zgłosili swoje roszczenia i nie zgodzili się na obniżenie',
      c: 'Po uzyskaniu zgody sądu',
      d: 'Po zatwierdzeniu przez walne zgromadzenie'
    },
    correct: 'b',
    explanation: 'Zgodnie z art. 456 § 2 k.s.h. obniżenie kapitału zakładowego zarząd zgłasza do sądu rejestrowego nie wcześniej niż po upływie terminu do zgłoszenia roszczeń przez wierzycieli oraz po zaspokojeniu lub zabezpieczeniu wierzycieli, którzy w tym terminie zgłosili swoje roszczenia i nie zgodzili się na obniżenie.',
    difficulty: 'hard',
    tags: ['obniżenie kapitału', 'zaspokojenie wierzycieli', 'S.A.']
  },

  {
    id: 'ksh-400',
    article: 'Różne',
    articleTitle: 'Kompleksowe pytanie końcowe',
    section: 'Porównanie spółek',
    subsection: 'Podsumowanie',
    question: 'W której spółce handlowej WSZYSTKIE następujące cechy są obecne: osobowość prawna od momentu wpisu do rejestru, kapitał zakładowy minimum 100.000 zł, obligatoryjna rada nadzorcza, możliwość emisji obligacji zamiennych?',
    options: {
      a: 'Spółka z ograniczoną odpowiedzialnością',
      b: 'Prosta spółka akcyjna',
      c: 'Spółka akcyjna',
      d: 'Spółka komandytowo-akcyjna'
    },
    correct: 'c',
    explanation: 'Spółka akcyjna charakteryzuje się: osobowością prawną od wpisu do rejestru (art. 12), minimalnym kapitałem 100.000 zł (art. 308 § 1), obligatoryjną radą nadzorczą (art. 381), możliwością emisji obligacji zamiennych (przepisy o obligacjach). Sp. z o.o. ma niższy minimalny kapitał (5.000 zł) i RN nie jest zawsze obligatoryjna. PSA ma kapitał minimalny 1 zł i może mieć radę dyrektorów zamiast RN. S.K.A. nie ma rady nadzorczej obligatoryjnej zawsze.',
    difficulty: 'hard',
    tags: ['porównanie', 'cechy spółek', 'podsumowanie']
  }
];

// ============================================================
// KOMPLETNA BAZA WSZYSTKICH PYTAŃ
// ============================================================

import { KSH_EXAM_QUESTIONS } from './ksh-exam-questions';
import { KSH_EXAM_QUESTIONS_PART2 } from './ksh-exam-questions-part2';
import { KSH_EXAM_QUESTIONS_PART3 } from './ksh-exam-questions-part3';

export const FULL_KSH_DATABASE = [
  ...KSH_EXAM_QUESTIONS,
  ...KSH_EXAM_QUESTIONS_PART2,
  ...KSH_EXAM_QUESTIONS_PART3,
  ...KSH_EXAM_QUESTIONS_PART4
];

export const FULL_DATABASE_STATS = {
  totalQuestions: FULL_KSH_DATABASE.length,
  byDifficulty: {
    easy: FULL_KSH_DATABASE.filter(q => q.difficulty === 'easy').length,
    medium: FULL_KSH_DATABASE.filter(q => q.difficulty === 'medium').length,
    hard: FULL_KSH_DATABASE.filter(q => q.difficulty === 'hard').length,
  },
  sections: [...new Set(FULL_KSH_DATABASE.map(q => q.section))],
  uniqueTags: [...new Set(FULL_KSH_DATABASE.flatMap(q => q.tags))].length,
  articlesCovered: [...new Set(FULL_KSH_DATABASE.map(q => q.article))].length,
};

// Zaawansowane funkcje pomocnicze

// Generowanie egzaminu z wagami tematycznymi
export const generateWeightedExam = (
  questionCount: number = 100,
  sectionWeights?: Record<string, number>
): ExamQuestion[] => {
  const defaultWeights: Record<string, number> = {
    'Tytuł I - Przepisy ogólne': 15,
    'Tytuł II - Spółka jawna': 10,
    'Tytuł III - Spółka partnerska': 5,
    'Tytuł IV - Spółka komandytowa': 10,
    'Tytuł V - Spółka komandytowo-akcyjna': 5,
    'Tytuł III - Spółka z o.o.': 30,
    'Tytuł IV - Spółka akcyjna': 20,
    'Tytuł IV - Prosta spółka akcyjna': 5,
  };

  const weights = sectionWeights || defaultWeights;
  const result: ExamQuestion[] = [];

  Object.entries(weights).forEach(([section, weight]) => {
    const sectionQuestions = FULL_KSH_DATABASE.filter(q => 
      q.section.includes(section) || section.includes(q.section)
    );
    const count = Math.round(questionCount * weight / 100);
    const selected = sectionQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    result.push(...selected);
  });

  return result.sort(() => Math.random() - 0.5).slice(0, questionCount);
};

// Generowanie quizu tematycznego
export const generateTopicQuiz = (
  tag: string,
  questionCount: number = 20
): ExamQuestion[] => {
  return FULL_KSH_DATABASE
    .filter(q => q.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount);
};

// Statystyki pokrycia tematycznego
export const getCoverageStats = () => {
  const tagStats = new Map<string, number>();
  FULL_KSH_DATABASE.forEach(q => {
    q.tags.forEach(tag => {
      tagStats.set(tag, (tagStats.get(tag) || 0) + 1);
    });
  });
  
  return {
    byTag: Object.fromEntries(tagStats),
    topTags: [...tagStats.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20),
  };
};

console.log('Full KSH Questions Database loaded:', FULL_DATABASE_STATS);
console.log('Coverage stats:', getCoverageStats().topTags.slice(0, 10));
