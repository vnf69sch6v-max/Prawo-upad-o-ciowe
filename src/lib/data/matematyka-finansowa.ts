// ═══════════════════════════════════════════════════════════════════════════
// MATEMATYKA FINANSOWA - Pytania do egzaminu maklerskiego
// Sekcja: Matematyka, Statystyka, Rachunek
// ═══════════════════════════════════════════════════════════════════════════

import { ExamQuestion } from './ksh';

export const ALL_MATEMATYKA_FINANSOWA_QUESTIONS: ExamQuestion[] = [
    {
        id: 'MAT-0001',
        article: 'Wartość pieniądza w czasie',
        articleTitle: 'Wartość przyszła (FV)',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Wartość przyszła (FV) kapitału oznacza:',
        options: {
            a: 'Kwotę, jaką otrzymamy w przyszłości z dzisiejszej inwestycji uwzględniając oprocentowanie',
            b: 'Kwotę, którą musimy dziś zainwestować, aby uzyskać określoną wartość w przyszłości',
            c: 'Różnicę między wartością nominalną a wartością bieżącą',
            d: 'Stopę procentową skorygowaną o inflację'
        },
        correct: 'a',
        explanation: 'Wartość przyszła (Future Value) to wartość, do której urośnie dziś zainwestowany kapitał po uwzględnieniu odsetek w określonym czasie.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz', 'MAT.2.kapitalizacja']
    },
    {
        id: 'MAT-0002',
        article: 'FV = PV × (1 + r)^n',
        articleTitle: 'Obliczanie wartości przyszłej',
        section: 'Matematyka Finansowa',
        subsection: 'Kapitalizacja',
        question: 'Inwestor lokuje 10 000 zł na 2 lata przy stopie 5% w skali roku z kapitalizacją roczną. Ile wyniesie wartość przyszła tej inwestycji?',
        options: {
            a: '10 500 zł',
            b: '11 000 zł',
            c: '10 250 zł',
            d: '11 025 zł'
        },
        correct: 'd',
        explanation: 'FV = 10 000 × (1,05)² = 10 000 × 1,1025 = 11 025 zł. Kapitalizacja roczna oznacza, że odsetki naliczane są raz w roku i doliczane do kapitału.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz', 'MAT.2.kapitalizacja']
    },
    {
        id: 'MAT-0003',
        article: 'PV = FV / (1 + r)^n',
        articleTitle: 'Wartość bieżąca (PV)',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Wartość bieżąca (PV) to:',
        options: {
            a: 'Suma wszystkich przyszłych przepływów pieniężnych',
            b: 'Dzisiejsza wartość przyszłej kwoty po uwzględnieniu dyskonta',
            c: 'Nominalna wartość papieru wartościowego',
            d: 'Wartość rynkowa aktywów pomniejszona o zobowiązania'
        },
        correct: 'b',
        explanation: 'Wartość bieżąca (Present Value) to wartość dzisiejsza przyszłej kwoty po zdyskontowaniu.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0004',
        article: 'Kapitalizacja kwartalna',
        articleTitle: 'Częstotliwość kapitalizacji',
        section: 'Matematyka Finansowa',
        subsection: 'Kapitalizacja',
        question: 'Klient lokuje 8 000 zł na lokacie oprocentowanej na 6% rocznie z kapitalizacją kwartalną. Jaka będzie wartość lokaty po roku?',
        options: {
            a: '8 480 zł',
            b: '8 490 zł',
            c: '8 243 zł',
            d: '8 500 zł'
        },
        correct: 'b',
        explanation: 'Kapitalizacja kwartalna: stopa kwartalna = 6%/4 = 1,5%. FV = 8 000 × (1,015)⁴ = 8 000 × 1,06136 ≈ 8 491 zł.',
        difficulty: 'medium',
        tags: ['MAT.2.kapitalizacja']
    },
    {
        id: 'MAT-0005',
        article: 'Stopy procentowe',
        articleTitle: 'Stopa nominalna vs efektywna',
        section: 'Matematyka Finansowa',
        subsection: 'Stopy procentowe',
        question: 'Stopa procentowa nominalna to:',
        options: {
            a: 'Stopa podawana w umowie bez uwzględnienia częstotliwości kapitalizacji',
            b: 'Stopa efektywna pomniejszona o stopę inflacji',
            c: 'Rzeczywista stopa zwrotu po uwzględnieniu wszystkich kosztów',
            d: 'Stopa procentowa skorygowana o ryzyko kredytowe'
        },
        correct: 'a',
        explanation: 'Stopa nominalna to stopa zapisana w umowie (np. 12% rocznie), która nie uwzględnia wpływu częstotliwości kapitalizacji.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz', 'MAT.2.stopy']
    },
    {
        id: 'MAT-0006',
        article: 'Stopa efektywna = (1 + r/m)^m - 1',
        articleTitle: 'Obliczanie stopy efektywnej',
        section: 'Matematyka Finansowa',
        subsection: 'Stopy procentowe',
        question: 'Bank podaje oprocentowanie kredytu jako 12% nominalnie przy kapitalizacji miesięcznej. Jaka jest efektywna stopa roczna?',
        options: {
            a: '12,00%',
            b: '12,36%',
            c: '12,68%',
            d: '13,00%'
        },
        correct: 'c',
        explanation: 'Stopa miesięczna = 12%/12 = 1%. Efektywna roczna: (1,01)¹² − 1 = 1,1268 − 1 = 12,68%.',
        difficulty: 'medium',
        tags: ['MAT.2.stopy']
    },
    {
        id: 'MAT-0007',
        article: 'Dyskontowanie',
        articleTitle: 'Proces dyskontowania',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Proces obliczania wartości bieżącej nazywamy:',
        options: {
            a: 'Kapitalizacją',
            b: 'Dyskontowaniem',
            c: 'Amortyzacją',
            d: 'Akumulacją'
        },
        correct: 'b',
        explanation: 'Dyskontowanie to proces przeliczania przyszłych wartości na wartość dzisiejszą.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0008',
        article: 'Renty',
        articleTitle: 'Renta z góry i z dołu',
        section: 'Matematyka Finansowa',
        subsection: 'Renty i płatności',
        question: 'Renta z góry (annuity due) to szereg płatności, w którym:',
        options: {
            a: 'Płatności następują na początku każdego okresu',
            b: 'Płatności następują na końcu każdego okresu',
            c: 'Płatności rosną o stałą stopę',
            d: 'Płatności są nieregularne'
        },
        correct: 'a',
        explanation: 'Renta z góry (annuity due) charakteryzuje się tym, że płatności dokonywane są na początku okresu.',
        difficulty: 'easy',
        tags: ['MAT.3.renty']
    },
    {
        id: 'MAT-0009',
        article: 'FV renty',
        articleTitle: 'Wartość przyszła renty',
        section: 'Matematyka Finansowa',
        subsection: 'Renty i płatności',
        question: 'Klient wpłaca na koniec każdego roku 2 000 zł przez 3 lata przy stopie 4% rocznie. Jaka będzie wartość przyszła tej renty (z dołu)?',
        options: {
            a: '6 000 zł',
            b: '6 243 zł',
            c: '6 490 zł',
            d: '6 120 zł'
        },
        correct: 'b',
        explanation: 'FV renty z dołu = 2 000 × [(1,04³ − 1) / 0,04] = 2 000 × 3,1216 ≈ 6 243 zł.',
        difficulty: 'medium',
        tags: ['MAT.3.renty']
    },
    {
        id: 'MAT-0010',
        article: 'Kredyty - annuitet',
        articleTitle: 'Rata annuitetowa',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'Annuitet to:',
        options: {
            a: 'Stała rata kredytu zawierająca kapitał i odsetki',
            b: 'Tylko część odsetkowa raty kredytu',
            c: 'Suma wszystkich odsetek zapłaconych w okresie kredytowania',
            d: 'Harmonogram spłat kredytu'
        },
        correct: 'a',
        explanation: 'Annuitet to stała rata spłaty kredytu, która zawiera zarówno część kapitałową, jak i część odsetkową.',
        difficulty: 'easy',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0011',
        article: 'Wzór annuitetowy',
        articleTitle: 'Obliczanie raty annuitetowej',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'Kredyt 12 000 zł na 3 lata, oprocentowanie 10% rocznie, spłata annuitetowa roczna. Jaka będzie wysokość rocznej raty?',
        options: {
            a: '4 000 zł',
            b: '5 200 zł',
            c: '4 823 zł',
            d: '3 600 zł'
        },
        correct: 'c',
        explanation: 'Rata = 12 000 / [(1 − (1,1)⁻³) / 0,1] = 12 000 / 2,4869 ≈ 4 823 zł.',
        difficulty: 'medium',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0012',
        article: 'Struktura annuitetu',
        articleTitle: 'Zmiana struktury raty',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'W kredycie annuitetowym wraz z upływem czasu:',
        options: {
            a: 'Część kapitałowa raty rośnie, a odsetkowa maleje',
            b: 'Część kapitałowa raty maleje, a odsetkowa rośnie',
            c: 'Obie części pozostają stałe',
            d: 'Wysokość raty rośnie'
        },
        correct: 'a',
        explanation: 'W annuitecie całkowita rata jest stała, lecz odsetki maleją, a część kapitałowa rośnie.',
        difficulty: 'medium',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0013',
        article: 'Raty kapitałowe',
        articleTitle: 'Spłata równymi ratami kapitałowymi',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'Spłata kredytu równymi ratami kapitałowymi oznacza, że:',
        options: {
            a: 'W każdym okresie spłacamy tę samą część kapitału, a odsetki maleją',
            b: 'Całkowita rata (kapitał + odsetki) jest stała',
            c: 'Odsetki rosną w każdym okresie',
            d: 'Spłacamy cały kapitał na koniec okresu'
        },
        correct: 'a',
        explanation: 'Przy równych ratach kapitałowych część kapitałowa jest stała, ale odsetki maleją.',
        difficulty: 'easy',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0014',
        article: 'Decyzje inwestycyjne',
        articleTitle: 'Porównanie wartości bieżących',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Inwestor ma możliwość otrzymania 5 000 zł dziś lub 5 500 zł za rok. Przy stopie dyskontowej 8% rocznie, którą opcję powinien wybrać?',
        options: {
            a: '5 000 zł dziś, bo jest pewne',
            b: '5 500 zł za rok, bo PV wynosi 5 093 zł',
            c: 'Obie opcje są równoważne',
            d: '5 500 zł za rok, bo jest większa kwota'
        },
        correct: 'b',
        explanation: 'PV przyszłej kwoty = 5 500 / 1,08 ≈ 5 093 zł. To więcej niż 5 000 zł dziś.',
        difficulty: 'medium',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0015',
        article: 'Równoważne stopy procentowe',
        articleTitle: 'Konwersja stóp procentowych',
        section: 'Matematyka Finansowa',
        subsection: 'Stopy procentowe',
        question: 'Bank podaje stopę nominalną 9% przy kapitalizacji kwartalnej. Jaka stopa nominalna przy kapitalizacji miesięcznej dałaby tę samą stopę efektywną?',
        options: {
            a: '9,00%',
            b: '8,91%',
            c: '8,82%',
            d: '9,12%'
        },
        correct: 'b',
        explanation: 'Efektywna przy kwartalnej: (1 + 0,09/4)⁴ − 1 ≈ 9,31%. Dla miesięcznej: r ≈ 8,91%.',
        difficulty: 'hard',
        tags: ['MAT.2.stopy']
    },
    {
        id: 'MAT-0016',
        article: 'PV = FV / (1 + r)^n',
        articleTitle: 'Dyskontowanie kwoty',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Ile dziś warte jest 1 000 zł otrzymane za 2 lata przy stopie dyskontowej 5% rocznie?',
        options: {
            a: '950 zł',
            b: '907 zł',
            c: '1 050 zł',
            d: '900 zł'
        },
        correct: 'b',
        explanation: 'PV = 1 000 / (1,05)² = 1 000 / 1,1025 ≈ 907 zł.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0017',
        article: 'Statystyka - miary tendencji centralnej',
        articleTitle: 'Średnia arytmetyczna',
        section: 'Statystyka',
        subsection: 'Miary tendencji centralnej',
        question: 'Średnia arytmetyczna to:',
        options: {
            a: 'Suma wszystkich wartości podzielona przez ich liczbę',
            b: 'Wartość środkowa w uporządkowanym szeregu',
            c: 'Najczęściej występująca wartość',
            d: 'Pierwiastek z sumy kwadratów odchyleń'
        },
        correct: 'a',
        explanation: 'Średnia arytmetyczna obliczana jest przez zsumowanie wszystkich wartości i podzielenie przez ich liczbę.',
        difficulty: 'easy',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0018',
        article: 'Średnia stóp zwrotu',
        articleTitle: 'Obliczanie średniej stopy zwrotu',
        section: 'Statystyka',
        subsection: 'Miary tendencji centralnej',
        question: 'Stopy zwrotu akcji w kolejnych latach: 10%, -5%, 15%, 20%. Jaka jest średnia arytmetyczna stopa zwrotu?',
        options: {
            a: '10%',
            b: '12,5%',
            c: '15%',
            d: '8%'
        },
        correct: 'a',
        explanation: 'Średnia = (10 − 5 + 15 + 20) / 4 = 40 / 4 = 10%.',
        difficulty: 'medium',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0019',
        article: 'Wariancja',
        articleTitle: 'Miara rozproszenia',
        section: 'Statystyka',
        subsection: 'Miary rozproszenia',
        question: 'Wariancja mierzy:',
        options: {
            a: 'Przeciętne odchylenie wartości od średniej',
            b: 'Średnią kwadratów odchyleń od średniej',
            c: 'Maksymalne odchylenie w próbie',
            d: 'Sumę wszystkich odchyleń od średniej'
        },
        correct: 'b',
        explanation: 'Wariancja to średnia arytmetyczna kwadratów odchyleń poszczególnych wartości od średniej.',
        difficulty: 'easy',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0020',
        article: 'Odchylenie standardowe',
        articleTitle: 'Pierwiastek z wariancji',
        section: 'Statystyka',
        subsection: 'Miary rozproszenia',
        question: 'Odchylenie standardowe to:',
        options: {
            a: 'Pierwiastek kwadratowy z wariancji',
            b: 'Kwadrat wariancji',
            c: 'Suma kwadratów odchyleń',
            d: 'Wartość bezwzględna średniej'
        },
        correct: 'a',
        explanation: 'Odchylenie standardowe jest pierwiastkiem kwadratowym z wariancji.',
        difficulty: 'medium',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0021',
        article: 'Obliczanie wariancji',
        articleTitle: 'Wariancja stóp zwrotu',
        section: 'Statystyka',
        subsection: 'Miary rozproszenia',
        question: 'Akcja miała stopy zwrotu: 12%, 8%, 16%, 4%. Średnia = 10%. Jaka jest wariancja?',
        options: {
            a: '20',
            b: '25',
            c: '16',
            d: '30'
        },
        correct: 'a',
        explanation: 'Odchylenia: 2, −2, 6, −6. Kwadraty: 4, 4, 36, 36. Suma = 80. Wariancja = 80/4 = 20.',
        difficulty: 'medium',
        tags: ['MAT.3.statystyka', 'MAT.3.portfel']
    },
    {
        id: 'MAT-0022',
        article: 'Kowariancja',
        articleTitle: 'Współzmienność aktywów',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'Kowariancja między dwoma aktywami mierzy:',
        options: {
            a: 'Siłę i kierunek ich wspólnej zmienności',
            b: 'Tylko kierunek zmian, bez siły',
            c: 'Średnią stopę zwrotu obu aktywów',
            d: 'Ryzyko całkowite portfela'
        },
        correct: 'a',
        explanation: 'Kowariancja pokazuje, jak dwa aktywa zmieniają się względem siebie.',
        difficulty: 'medium',
        tags: ['MAT.3.statystyka', 'MAT.3.portfel']
    },
    {
        id: 'MAT-0023',
        article: 'Korelacja',
        articleTitle: 'Współczynnik korelacji',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'Współczynnik korelacji między aktywami przyjmuje wartości:',
        options: {
            a: 'Od −1 do +1',
            b: 'Od 0 do +1',
            c: 'Od 0 do nieskończoności',
            d: 'Tylko wartości dodatnie'
        },
        correct: 'a',
        explanation: 'Korelacja to znormalizowana kowariancja i zawsze mieści się w przedziale [−1, +1].',
        difficulty: 'medium',
        tags: ['MAT.3.portfel']
    },
    {
        id: 'MAT-0024',
        article: 'Ryzyko portfela',
        articleTitle: 'Odchylenie standardowe portfela',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'Portfel składa się z dwóch aktywów o równych wagach. Oba mają odchylenie standardowe 20%, a korelacja między nimi wynosi 0,5. Jakie będzie odchylenie standardowe portfela?',
        options: {
            a: '20%',
            b: '17,3%',
            c: '14,1%',
            d: '10%'
        },
        correct: 'b',
        explanation: 'σₚ = √[0,5²×20² + 0,5²×20² + 2×0,5×0,5×20×20×0,5] = √300 ≈ 17,3%.',
        difficulty: 'hard',
        tags: ['MAT.3.portfel']
    },
    {
        id: 'MAT-0025',
        article: 'Dywersyfikacja',
        articleTitle: 'Efekt dywersyfikacji',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'Efekt dywersyfikacji w portfelu jest największy, gdy aktywa mają korelację:',
        options: {
            a: 'Bliską −1',
            b: 'Równą 0',
            c: 'Bliską +1',
            d: 'Zmienną w czasie'
        },
        correct: 'a',
        explanation: 'Dywersyfikacja redukuje ryzyko najbardziej przy korelacji ujemnej (bliskiej −1).',
        difficulty: 'medium',
        tags: ['MAT.3.portfel']
    },
    {
        id: 'MAT-0026',
        article: 'Dyskontowanie z kapitalizacją',
        articleTitle: 'PV z kapitalizacją półroczną',
        section: 'Matematyka Finansowa',
        subsection: 'Kapitalizacja',
        question: 'Inwestor chce uzyskać 20 000 zł za 5 lat. Ile musi dziś zainwestować przy stopie 6% rocznie z kapitalizacją półroczną?',
        options: {
            a: '14 920 zł',
            b: '14 850 zł',
            c: '15 000 zł',
            d: '14 560 zł'
        },
        correct: 'b',
        explanation: 'Kapitalizacja półroczna: stopa = 3%, n = 10. PV = 20 000 / (1,03)¹⁰ ≈ 14 877 zł.',
        difficulty: 'hard',
        tags: ['MAT.2.kapitalizacja']
    },
    {
        id: 'MAT-0027',
        article: 'Rata renty',
        articleTitle: 'Obliczanie raty oszczędnościowej',
        section: 'Matematyka Finansowa',
        subsection: 'Renty i płatności',
        question: 'Ile trzeba wpłacać na koniec każdego roku przez 4 lata, aby uzyskać 10 000 zł przy stopie 5% rocznie?',
        options: {
            a: '2 500 zł',
            b: '2 320 zł',
            c: '2 200 zł',
            d: '2 650 zł'
        },
        correct: 'b',
        explanation: 'Współczynnik renty: [(1,05⁴ − 1)/0,05] ≈ 4,31. Rata = 10 000 / 4,31 ≈ 2 320 zł.',
        difficulty: 'medium',
        tags: ['MAT.3.renty']
    },
    {
        id: 'MAT-0028',
        article: 'Suma odsetek kredytu',
        articleTitle: 'Łączne odsetki przy ratach kapitałowych',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'Kredyt 50 000 zł na 5 lat, 8% rocznie, raty równe kapitałowo. Jaka będzie łączna suma odsetek?',
        options: {
            a: '12 000 zł',
            b: '10 000 zł',
            c: '15 000 zł',
            d: '8 000 zł'
        },
        correct: 'a',
        explanation: 'Rata kapitałowa = 10 000 zł. Odsetki: 4000+3200+2400+1600+800 = 12 000 zł.',
        difficulty: 'hard',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0029',
        article: 'Czynniki FV',
        articleTitle: 'Co wpływa na wartość przyszłą',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Który czynnik NIE wpływa bezpośrednio na wartość przyszłą kapitału?',
        options: {
            a: 'Stopa procentowa',
            b: 'Czas trwania inwestycji',
            c: 'Kapitał początkowy',
            d: 'Inflacja'
        },
        correct: 'd',
        explanation: 'FV zależy od kapitału, stopy i czasu. Inflacja wpływa na realną wartość, nie na nominalną FV.',
        difficulty: 'easy',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0030',
        article: 'Mediana',
        articleTitle: 'Wartość środkowa',
        section: 'Statystyka',
        subsection: 'Miary tendencji centralnej',
        question: 'Mediana w zbiorze danych to:',
        options: {
            a: 'Wartość środkowa w uporządkowanym szeregu',
            b: 'Najczęściej występująca wartość',
            c: 'Średnia arytmetyczna',
            d: 'Maksymalna wartość w zbiorze'
        },
        correct: 'a',
        explanation: 'Mediana dzieli uporządkowany zbiór na dwie równe części.',
        difficulty: 'easy',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0031',
        article: 'Kapitalizacja ciągła',
        articleTitle: 'Ciągłe naliczanie odsetek',
        section: 'Matematyka Finansowa',
        subsection: 'Stopy procentowe',
        question: 'Kapitalizacja ciągła oznacza, że:',
        options: {
            a: 'Odsetki naliczane są w nieskończenie krótkich odstępach czasu',
            b: 'Kapitalizacja następuje raz dziennie',
            c: 'Kapitalizacja następuje raz w miesiącu',
            d: 'Nie ma kapitalizacji, tylko odsetki proste'
        },
        correct: 'a',
        explanation: 'Kapitalizacja ciągła to matematyczny limit, gdy częstotliwość kapitalizacji dąży do nieskończoności.',
        difficulty: 'easy',
        tags: ['MAT.2.stopy']
    },
    {
        id: 'MAT-0032',
        article: 'Ryzyko systematyczne i specyficzne',
        articleTitle: 'Rodzaje ryzyka',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'Ryzyko systematyczne to:',
        options: {
            a: 'Ryzyko związane z całym rynkiem, niemożliwe do wyeliminowania przez dywersyfikację',
            b: 'Ryzyko specyficzne dla pojedynczej spółki',
            c: 'Ryzyko, które można w pełni wyeliminować przez dywersyfikację',
            d: 'Ryzyko związane wyłącznie z sektorem gospodarki'
        },
        correct: 'a',
        explanation: 'Ryzyko systematyczne (rynkowe) dotyka wszystkie aktywa i nie można go zdywersyfikować.',
        difficulty: 'easy',
        tags: ['MAT.3.portfel']
    },
    {
        id: 'MAT-0033',
        article: 'Struktura pierwszej raty',
        articleTitle: 'Odsetki w pierwszej racie annuitetu',
        section: 'Matematyka Finansowa',
        subsection: 'Kredyty',
        question: 'W pierwszej racie kredytu annuitetowego część odsetkowa stanowi:',
        options: {
            a: 'Największą część raty w całym okresie kredytowania',
            b: 'Najmniejszą część raty w całym okresie kredytowania',
            c: 'Połowę wysokości raty',
            d: 'Jest równa części kapitałowej'
        },
        correct: 'a',
        explanation: 'W pierwszej racie annuitetu odsetki liczone są od najwyższego salda kredytu.',
        difficulty: 'medium',
        tags: ['MAT.3.kredyty']
    },
    {
        id: 'MAT-0034',
        article: 'Porównanie ofert inwestycyjnych',
        articleTitle: 'Analiza wartości bieżącej',
        section: 'Matematyka Finansowa',
        subsection: 'Wartość pieniądza w czasie',
        question: 'Inwestor porównuje dwie oferty: A) 8 000 zł za 2 lata; B) 9 000 zł za 3 lata. Przy stopie dyskontowej 6%, która jest korzystniejsza?',
        options: {
            a: 'Oferta A, PV ≈ 7 120 zł',
            b: 'Oferta B, PV ≈ 7 558 zł',
            c: 'Obie równoważne',
            d: 'Nie można ocenić bez danych o inflacji'
        },
        correct: 'b',
        explanation: 'PV(A) = 8 000/(1,06)² ≈ 7 120 zł. PV(B) = 9 000/(1,06)³ ≈ 7 558 zł. Oferta B jest lepsza.',
        difficulty: 'medium',
        tags: ['MAT.1.czas_pieniadz']
    },
    {
        id: 'MAT-0035',
        article: 'Obliczanie mediany',
        articleTitle: 'Znajdowanie mediany',
        section: 'Statystyka',
        subsection: 'Miary tendencji centralnej',
        question: 'Zbiór: 5, 10, 15, 20, 25. Jaka jest mediana?',
        options: {
            a: '10',
            b: '15',
            c: '20',
            d: '12,5'
        },
        correct: 'b',
        explanation: 'W uporządkowanym zbiorze 5 elementów mediana to wartość środkowa (trzecia): 15.',
        difficulty: 'medium',
        tags: ['MAT.3.statystyka']
    },
    {
        id: 'MAT-0036',
        article: 'Teoria portfela',
        articleTitle: 'Ryzyko portfela wieloaktywowego',
        section: 'Statystyka',
        subsection: 'Teoria portfela',
        question: 'W portfelu z wieloma aktywami ryzyko całkowite:',
        options: {
            a: 'Jest sumą wariancji poszczególnych aktywów ważonych ich udziałami',
            b: 'Jest zawsze niższe niż średnia ważona ryzyk poszczególnych aktywów przy korelacji <1',
            c: 'Jest równe najwyższemu ryzyku spośród aktywów w portfelu',
            d: 'Nie zależy od kowariancji między aktywami'
        },
        correct: 'b',
        explanation: 'Przy korelacji <1 efekt dywersyfikacji powoduje, że ryzyko portfela jest niższe niż średnia ważona ryzyk.',
        difficulty: 'hard',
        tags: ['MAT.3.portfel']
    }
];
