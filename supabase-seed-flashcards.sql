-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA - PRAWDZIWE FISZKI PRAWNE
-- Wklej po głównym SQL schema
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. TALIE
-- ═══════════════════════════════════════════════════════════════

INSERT INTO flashcard_decks (name, slug, description, icon, color, legal_area, is_active) VALUES
(
  'Prawo Handlowe (KSH)',
  'prawo-handlowe-ksh',
  'Kodeks spółek handlowych - wszystkie typy spółek, odpowiedzialność, organy',
  '🏛️',
  '#3B82F6',
  'commercial',
  TRUE
),
(
  'Kodeks Cywilny - Część Ogólna',
  'kodeks-cywilny-czesc-ogolna',
  'Osoby fizyczne i prawne, czynności prawne, przedawnienie',
  '⚖️',
  '#10B981',
  'civil',
  TRUE
),
(
  'Kodeks Cywilny - Zobowiązania',
  'kodeks-cywilny-zobowiazania',
  'Umowy, odpowiedzialność kontraktowa i deliktowa',
  '📜',
  '#F59E0B',
  'civil',
  TRUE
),
(
  'Prawo Karne - Część Ogólna',
  'prawo-karne-czesc-ogolna',
  'Zasady odpowiedzialności karnej, formy popełnienia przestępstwa',
  '⚔️',
  '#EF4444',
  'criminal',
  TRUE
),
(
  'Prawo Administracyjne',
  'prawo-administracyjne',
  'KPA, postępowanie administracyjne, sądownictwo administracyjne',
  '🏢',
  '#8B5CF6',
  'administrative',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. FISZKI - PRAWO HANDLOWE (KSH)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO flashcards (deck_id, question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags) 
SELECT 
  (SELECT id FROM flashcard_decks WHERE slug = 'prawo-handlowe-ksh'),
  question,
  answer_short,
  answer_full,
  legal_basis,
  difficulty,
  difficulty_score,
  tags
FROM (VALUES
  (
    'Które z poniższych spółek NIE jest spółką handlową w rozumieniu Kodeksu spółek handlowych?',
    'Spółka cywilna',
    '📌 ZAPAMIĘTAJ:

Spółki handlowe (Art. 1 § 2 KSH):
• spółka jawna
• spółka partnerska
• spółka komandytowa
• spółka komandytowo-akcyjna
• spółka z ograniczoną odpowiedzialnością
• prosta spółka akcyjna
• spółka akcyjna

⚠️ Spółka cywilna jest regulowana przez Kodeks cywilny (art. 860-875 KC), NIE przez KSH.

💡 Pułapka egzaminacyjna: Często pytają "która spółka nie jest wpisywana do KRS" - odpowiedź: spółka cywilna (wspólnicy są wpisywani do CEIDG jako przedsiębiorcy).',
    'Art. 1 § 2 KSH',
    'easy',
    3,
    ARRAY['spółki', 'podstawy', 'egzamin']
  ),
  (
    'Jaki jest minimalny kapitał zakładowy spółki z ograniczoną odpowiedzialnością?',
    '5.000 zł',
    '📌 ZAPAMIĘTAJ:

Minimalne kapitały zakładowe:
• sp. z o.o. → 5.000 zł (Art. 154 § 1 KSH)
• S.A. → 100.000 zł (Art. 308 § 1 KSH)
• PSA → 1 zł (Art. 300³ § 1 KSH)
• S.K.A. → 50.000 zł (Art. 126 § 2 KSH)

⚠️ Minimalna wartość nominalna udziału w sp. z o.o. to 50 zł (Art. 154 § 2 KSH).',
    'Art. 154 § 1 KSH',
    'easy',
    2,
    ARRAY['sp. z o.o.', 'kapitał', 'egzamin']
  ),
  (
    'Kiedy członkowie zarządu sp. z o.o. odpowiadają za zobowiązania spółki?',
    'Gdy egzekucja przeciwko spółce okaże się bezskuteczna',
    '📌 ZAPAMIĘTAJ:

Art. 299 § 1 KSH - przesłanki odpowiedzialności:
1. Istnienie zobowiązania spółki
2. Bezskuteczność egzekucji przeciwko spółce

Charakter odpowiedzialności:
• SUBSYDIARNA (najpierw spółka, potem zarząd)
• SOLIDARNA (między członkami zarządu)
• OSOBISTA (całym majątkiem)

⚠️ Przesłanki egzoneracyjne (Art. 299 § 2 KSH):
• we właściwym czasie zgłoszono wniosek o upadłość
• niezgłoszenie nie nastąpiło z winy członka zarządu
• wierzyciel nie poniósł szkody

💡 Nie myl z art. 293 KSH (odpowiedzialność wobec SPÓŁKI za szkodę)!',
    'Art. 299 KSH',
    'medium',
    6,
    ARRAY['odpowiedzialność', 'zarząd', 'sp. z o.o.', 'egzamin']
  ),
  (
    'Kto reprezentuje spółkę z o.o. w umowie między spółką a członkiem zarządu?',
    'Rada nadzorcza lub pełnomocnik powołany uchwałą zgromadzenia wspólników',
    '📌 ZAPAMIĘTAJ:

Art. 210 § 1 KSH:
W umowie między spółką a członkiem zarządu spółkę reprezentuje:
1. Rada nadzorcza, LUB
2. Pełnomocnik powołany uchwałą zgromadzenia wspólników

⚠️ SANKCJA: Umowa zawarta z naruszeniem art. 210 jest NIEWAŻNA!

💡 Dotyczy to KAŻDEJ umowy - nie tylko umowy o pracę, ale też np. pożyczki, najmu, sprzedaży.

🔗 Analogiczny przepis dla S.A.: Art. 379 KSH',
    'Art. 210 KSH',
    'medium',
    5,
    ARRAY['reprezentacja', 'zarząd', 'sp. z o.o.', 'egzamin']
  ),
  (
    'Ile głosów przysługuje wspólnikowi sp. z o.o. na zgromadzeniu wspólników?',
    'Jeden głos na każdy udział, chyba że umowa spółki stanowi inaczej',
    '📌 ZAPAMIĘTAJ:

Art. 242 KSH - zasada: 1 udział = 1 głos

ALE umowa spółki może przewidywać:
• udziały UPRZYWILEJOWANE co do głosu (max 3 głosy na udział)
• udziały NIEME (bez prawa głosu, ale z preferencją dywidendową)

⚠️ Uprzywilejowanie co do głosu NIE dotyczy:
• Uchwał o zmianie umowy spółki
• Uchwał wymagających 2/3 lub 3/4 głosów',
    'Art. 242 KSH',
    'medium',
    5,
    ARRAY['głosowanie', 'udziały', 'sp. z o.o.']
  ),
  (
    'Jakie są przesłanki odpowiedzialności członka zarządu za szkodę wyrządzoną spółce (art. 293 KSH)?',
    'Działanie/zaniechanie sprzeczne z prawem lub umową spółki + wina',
    '📌 ZAPAMIĘTAJ:

Art. 293 § 1 KSH - przesłanki:
1. Działanie lub zaniechanie członka zarządu
2. Sprzeczność z prawem LUB umową spółki
3. Szkoda spółki
4. Związek przyczynowy
5. Wina (domniemana!)

⚠️ Członek zarządu może się uwolnić wykazując BRAK WINY.

💡 Różnica od art. 299 KSH:
• Art. 293 → odpowiedzialność wobec SPÓŁKI
• Art. 299 → odpowiedzialność wobec WIERZYCIELI

🔗 Analogiczny przepis dla S.A.: Art. 483 KSH',
    'Art. 293 KSH',
    'hard',
    7,
    ARRAY['odpowiedzialność', 'zarząd', 'szkoda', 'egzamin']
  ),
  (
    'W jakiej formie musi być zawarta umowa spółki z o.o.?',
    'Akt notarialny',
    '📌 ZAPAMIĘTAJ:

Formy umów spółek:
• Spółka jawna → forma PISEMNA (Art. 23 KSH)
• Spółka partnerska → forma PISEMNA (Art. 92 KSH)
• Spółka komandytowa → forma PISEMNA (Art. 106 KSH) [ZMIANA 2019!]
• Spółka z o.o. → AKT NOTARIALNY (Art. 157 § 2 KSH)
• Prosta spółka akcyjna → AKT NOTARIALNY (Art. 300⁵ KSH)
• Spółka akcyjna → AKT NOTARIALNY (Art. 301 § 2 KSH)

⚠️ Wyjątek: Sp. z o.o. może być też założona przez S24 (system online) - wtedy forma elektroniczna.',
    'Art. 157 § 2 KSH',
    'easy',
    3,
    ARRAY['forma', 'umowa spółki', 'sp. z o.o.']
  ),
  (
    'Czym różni się komplementariusz od komandytariusza?',
    'Komplementariusz odpowiada bez ograniczenia, komandytariusz do wysokości sumy komandytowej',
    '📌 ZAPAMIĘTAJ:

KOMPLEMENTARIUSZ:
• Odpowiada za zobowiązania spółki BEZ OGRANICZENIA
• Prowadzi sprawy i reprezentuje spółkę
• Jak wspólnik spółki jawnej

KOMANDYTARIUSZ:
• Odpowiada tylko DO WYSOKOŚCI SUMY KOMANDYTOWEJ
• Nie prowadzi spraw (chyba że pełnomocnictwo/prokura)
• Wnosi wkład ≥ suma komandytowa

⚠️ Jeśli komandytariusz działa w imieniu spółki bez ujawnienia pełnomocnictwa - odpowiada jak komplementariusz!

💡 Suma komandytowa to GÓRNA GRANICA odpowiedzialności, wkład to ile faktycznie wniósł.',
    'Art. 102, 104, 111 KSH',
    'medium',
    5,
    ARRAY['spółka komandytowa', 'odpowiedzialność', 'egzamin']
  ),
  (
    'Kiedy uchwała zgromadzenia wspólników sp. z o.o. wymaga większości 2/3 głosów?',
    'Zmiana umowy spółki, rozwiązanie spółki, zbycie przedsiębiorstwa',
    '📌 ZAPAMIĘTAJ:

Większość 2/3 głosów (Art. 246 § 1 KSH):
• Zmiana umowy spółki
• Rozwiązanie spółki
• Zbycie przedsiębiorstwa lub jego zorganizowanej części

Większość 3/4 głosów (Art. 246 § 3 KSH):
• Istotna zmiana przedmiotu działalności

⚠️ Te większości liczone są od GŁOSÓW OBECNYCH, nie wszystkich.

💡 Umowa spółki może przewidywać SUROWSZE wymogi (np. jednomyślność), ale nie łagodniejsze.',
    'Art. 246 KSH',
    'medium',
    6,
    ARRAY['uchwały', 'większość głosów', 'sp. z o.o.', 'egzamin']
  ),
  (
    'Czy wspólnik sp. z o.o. może być wyłączony ze spółki?',
    'Tak, przez sąd na żądanie pozostałych wspólników z ważnych przyczyn',
    '📌 ZAPAMIĘTAJ:

Art. 266 KSH - wyłączenie wspólnika:
1. Na żądanie wspólników mających > 50% kapitału
2. Z WAŻNYCH PRZYCZYN dotyczących danego wspólnika
3. Orzeka SĄD
4. Udziały przejmują pozostali wspólnicy lub osoby trzecie

Ważne przyczyny (przykłady):
• Działanie na szkodę spółki
• Niewykonywanie obowiązków
• Prowadzenie działalności konkurencyjnej
• Utrata zaufania

⚠️ Wspólnik może też sam wystąpić o rozwiązanie spółki przez sąd (Art. 271 KSH).',
    'Art. 266-269 KSH',
    'hard',
    7,
    ARRAY['wspólnik', 'wyłączenie', 'sp. z o.o.']
  )
) AS t(question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags);

-- ═══════════════════════════════════════════════════════════════
-- 3. FISZKI - KODEKS CYWILNY - CZĘŚĆ OGÓLNA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO flashcards (deck_id, question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags) 
SELECT 
  (SELECT id FROM flashcard_decks WHERE slug = 'kodeks-cywilny-czesc-ogolna'),
  question,
  answer_short,
  answer_full,
  legal_basis,
  difficulty,
  difficulty_score,
  tags
FROM (VALUES
  (
    'W jakim wieku nabywa się pełną zdolność do czynności prawnych?',
    '18 lat (pełnoletność)',
    '📌 ZAPAMIĘTAJ:

Zdolność do czynności prawnych:
• BRAK (0-13 lat) - czynności NIEWAŻNE (wyjątek: drobne sprawy życia codziennego)
• OGRANICZONA (13-18 lat) - potrzebna zgoda przedstawiciela ustawowego
• PEŁNA (18+ lat) - pełna samodzielność

⚠️ Wyjątki od pełnoletności:
• Kobieta może zawrzeć małżeństwo od 16 lat za zgodą sądu
• Małżeństwo małoletniego daje mu pełnoletność

💡 Ubezwłasnowolnienie:
• Całkowite → brak zdolności
• Częściowe → ograniczona zdolność',
    'Art. 10-14 KC',
    'easy',
    2,
    ARRAY['zdolność', 'osoby fizyczne', 'podstawy']
  ),
  (
    'Jaki jest ogólny termin przedawnienia roszczeń majątkowych?',
    '6 lat, a dla roszczeń okresowych i związanych z działalnością gospodarczą - 3 lata',
    '📌 ZAPAMIĘTAJ:

Art. 118 KC - terminy przedawnienia:
• Ogólny: 6 LAT
• Roszczenia okresowe (np. czynsz): 3 LATA
• Roszczenia z działalności gospodarczej: 3 LATA

⚠️ NOWELIZACJA 2018 - ważne zmiany:
• Skrócenie z 10 do 6 lat
• Przedawnienie kończy się z KOŃCEM ROKU kalendarzowego

💡 Terminy szczególne:
• Roszczenia z umowy sprzedaży (B2C): 2 lata
• Roszczenia z czynów niedozwolonych: 3 lata od dowiedzenia się
• Roszczenia stwierdzone prawomocnym wyrokiem: 6 lat',
    'Art. 118 KC',
    'easy',
    3,
    ARRAY['przedawnienie', 'terminy', 'egzamin']
  ),
  (
    'Czym jest oświadczenie woli złożone pod wpływem błędu?',
    'Oświadczenie wadliwe, które można uchylić się od jego skutków',
    '📌 ZAPAMIĘTAJ:

Art. 84 KC - błąd jako wada oświadczenia woli:

Przesłanki uchylenia się:
1. Błąd ISTOTNY (normalnie rozsądna osoba nie złożyłaby oświadczenia)
2. Dotyczy TREŚCI czynności prawnej
3. Przy umowach: druga strona wywołała błąd, wiedziała o nim lub mogła łatwo zauważyć

Skutek: Oświadczenie jest WAŻNE, ale można się uchylić (termin: 1 rok od wykrycia błędu)

⚠️ Rodzaje wad oświadczeń woli:
• Brak świadomości/swobody (Art. 82) → NIEWAŻNOŚĆ
• Pozorność (Art. 83) → NIEWAŻNOŚĆ
• Błąd (Art. 84) → wzruszalność
• Podstęp (Art. 86) → wzruszalność  
• Groźba (Art. 87) → wzruszalność',
    'Art. 84-88 KC',
    'medium',
    5,
    ARRAY['wady oświadczeń woli', 'błąd', 'egzamin']
  ),
  (
    'Jaka jest różnica między osobą fizyczną a osobą prawną?',
    'Osoba fizyczna to człowiek, osoba prawna to twór sztuczny powołany przez prawo',
    '📌 ZAPAMIĘTAJ:

OSOBA FIZYCZNA (Art. 8 KC):
• Każdy człowiek od urodzenia do śmierci
• Zdolność prawna od urodzenia
• Zdolność do czynności prawnych zależy od wieku

OSOBA PRAWNA (Art. 33 KC):
• Twór sztuczny - Skarb Państwa, jednostki samorządu, inne jednostki wskazane przez prawo
• Powstaje z chwilą wpisu do rejestru
• Działa przez organy
• Ponosi odpowiedzialność za działania organów

⚠️ UŁOMNE OSOBY PRAWNE (Art. 33¹ KC):
• Nie mają osobowości prawnej, ale mogą nabywać prawa
• Np. spółka jawna, partnerska, komandytowa, wspólnota mieszkaniowa',
    'Art. 8, 33, 33¹ KC',
    'easy',
    3,
    ARRAY['osoby', 'podstawy']
  ),
  (
    'Kiedy czynność prawna jest nieważna z mocy prawa?',
    'Gdy jest sprzeczna z ustawą, zasadami współżycia społecznego lub ma na celu obejście ustawy',
    '📌 ZAPAMIĘTAJ:

Art. 58 KC - nieważność bezwzględna:
§ 1. Sprzeczność z USTAWĄ
§ 2. Sprzeczność z ZASADAMI WSPÓŁŻYCIA SPOŁECZNEGO
§ 1. Ma na celu OBEJŚCIE ustawy

Skutki:
• Nieważność z mocy prawa (ex lege)
• Od początku (ex tunc)
• Może powołać się KAŻDY
• Sąd uwzględnia z urzędu

⚠️ § 3 - częściowa nieważność:
Jeśli nieważna jest tylko CZĘŚĆ czynności, reszta pozostaje w mocy (chyba że bez tej części czynność nie zostałaby dokonana).',
    'Art. 58 KC',
    'medium',
    5,
    ARRAY['nieważność', 'czynności prawne', 'egzamin']
  ),
  (
    'Co to jest prokura i kto może ją ustanowić?',
    'Szczególne pełnomocnictwo handlowe udzielane przez przedsiębiorcę wpisanego do rejestru',
    '📌 ZAPAMIĘTAJ:

Art. 109¹ KC - prokura:
• UDZIELANA: tylko przez przedsiębiorcę wpisanego do CEIDG lub KRS
• PROKURENT: tylko OSOBA FIZYCZNA mająca pełną zdolność do czynności prawnych
• FORMA: pisemna pod rygorem nieważności
• WPIS: obowiązkowy wpis do rejestru

Zakres prokury:
• Wszystkie czynności sądowe i pozasądowe związane z prowadzeniem przedsiębiorstwa
• OGRANICZENIA: zbycie/obciążenie przedsiębiorstwa lub nieruchomości wymaga SZCZEGÓLNEGO pełnomocnictwa

Rodzaje:
• Samoistna (prokurent działa sam)
• Łączna (kilku prokurentów razem)
• Oddziałowa (ograniczona do oddziału)',
    'Art. 109¹-109⁸ KC',
    'medium',
    6,
    ARRAY['prokura', 'pełnomocnictwo', 'przedsiębiorca']
  )
) AS t(question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags);

-- ═══════════════════════════════════════════════════════════════
-- 4. FISZKI - KODEKS CYWILNY - ZOBOWIĄZANIA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO flashcards (deck_id, question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags) 
SELECT 
  (SELECT id FROM flashcard_decks WHERE slug = 'kodeks-cywilny-zobowiazania'),
  question,
  answer_short,
  answer_full,
  legal_basis,
  difficulty,
  difficulty_score,
  tags
FROM (VALUES
  (
    'Jakie są przesłanki odpowiedzialności deliktowej (z czynu niedozwolonego)?',
    'Czyn bezprawny, wina, szkoda, związek przyczynowy',
    '📌 ZAPAMIĘTAJ:

Art. 415 KC - przesłanki odpowiedzialności:
1. CZYN - działanie lub zaniechanie
2. BEZPRAWNOŚĆ - sprzeczność z prawem lub zasadami współżycia społecznego
3. WINA - umyślna lub nieumyślna (niedbalstwo)
4. SZKODA - majątkowa lub niemajątkowa
5. ZWIĄZEK PRZYCZYNOWY - między czynem a szkodą (Art. 361 KC - normalne następstwa)

⚠️ Odpowiedzialność na zasadzie WINY (trzeba udowodnić winę sprawcy)

💡 Odpowiedzialność bez winy (na zasadzie ryzyka):
• Art. 433 KC - rzeczy spadające z budynku
• Art. 435 KC - ruch przedsiębiorstwa
• Art. 436 KC - ruch pojazdu',
    'Art. 415 KC',
    'medium',
    5,
    ARRAY['odpowiedzialność deliktowa', 'czyn niedozwolony', 'egzamin']
  ),
  (
    'Jaki jest termin na zgłoszenie wady rzeczy sprzedanej (rękojmia)?',
    '2 lata dla rzeczy ruchomych, 5 lat dla nieruchomości',
    '📌 ZAPAMIĘTAJ:

Art. 568 KC - terminy rękojmi:
• Rzeczy ruchome: 2 LATA od wydania
• Nieruchomości: 5 LAT od wydania
• Rzeczy używane (B2C): można skrócić do 1 roku

Uprawnienia kupującego (Art. 560):
1. Żądanie naprawy
2. Żądanie wymiany
3. Obniżenie ceny
4. Odstąpienie od umowy (jeśli wada istotna)

⚠️ B2B: można wyłączyć/ograniczyć rękojmię umownie
⚠️ B2C: nie można wyłączyć/ograniczyć

💡 Różnica rękojmia vs gwarancja:
• Rękojmia - z ustawy, odpowiada sprzedawca
• Gwarancja - umowna, odpowiada gwarant (producent)',
    'Art. 568 KC',
    'medium',
    5,
    ARRAY['rękojmia', 'sprzedaż', 'terminy', 'egzamin']
  ),
  (
    'Co to jest bezpodstawne wzbogacenie?',
    'Uzyskanie korzyści majątkowej kosztem innej osoby bez podstawy prawnej',
    '📌 ZAPAMIĘTAJ:

Art. 405 KC - przesłanki:
1. WZBOGACENIE jednej osoby
2. ZUBOŻENIE drugiej osoby  
3. ZWIĄZEK między wzbogaceniem a zubożeniem
4. Brak PODSTAWY PRAWNEJ (tytułu prawnego)

Roszczenie: zwrot korzyści w naturze, a gdy niemożliwe - zwrot wartości

⚠️ Szczególny przypadek - ŚWIADCZENIE NIENALEŻNE (Art. 410):
• Cel świadczenia nie został osiągnięty
• Odpadła podstawa prawna
• Czynność zobowiązująca nieważna

💡 Nie można żądać zwrotu jeśli:
• Świadczenie czyni zadość zasadom współżycia społecznego
• Wiedział że nie był zobowiązany (wyjątek: działał pod przymusem)',
    'Art. 405-414 KC',
    'hard',
    7,
    ARRAY['bezpodstawne wzbogacenie', 'zobowiązania']
  ),
  (
    'Czym różni się solidarność dłużników od solidarności wierzycieli?',
    'Solidarność dłużników: każdy odpowiada za całość; solidarność wierzycieli: każdy może żądać całości',
    '📌 ZAPAMIĘTAJ:

SOLIDARNOŚĆ DŁUŻNIKÓW (Art. 366):
• Wierzyciel może żądać całości lub części od KAŻDEGO dłużnika
• Spełnienie przez jednego zwalnia pozostałych
• Dłużnik który zapłacił ma REGRES do pozostałych

SOLIDARNOŚĆ WIERZYCIELI (Art. 367):
• Dłużnik może spełnić świadczenie do rąk KAŻDEGO wierzyciela
• Spełnienie jednemu zwalnia wobec wszystkich
• Wierzyciel który otrzymał dzieli się z pozostałymi

⚠️ Solidarność musi wynikać z:
• Ustawy, lub
• Czynności prawnej

💡 Domniemanie: zobowiązanie z działalności gospodarczej jest solidarne (Art. 370).',
    'Art. 366-378 KC',
    'medium',
    6,
    ARRAY['solidarność', 'zobowiązania', 'egzamin']
  ),
  (
    'Kiedy można odstąpić od umowy wzajemnej z powodu zwłoki?',
    'Po wyznaczeniu dodatkowego terminu i jego bezskutecznym upływie',
    '📌 ZAPAMIĘTAJ:

Art. 491 KC - odstąpienie od umowy wzajemnej:

Procedura:
1. Druga strona w ZWŁOCE (nie wykonuje, mimo że może)
2. Wyznaczenie DODATKOWEGO TERMINU (odpowiedniego)
3. Bezskuteczny upływ terminu
4. Złożenie oświadczenia o odstąpieniu

⚠️ Bez dodatkowego terminu gdy:
• Strony tak ustaliły
• Wykonanie w terminie było ISTOTNE (np. suknia ślubna na konkretną datę)

💡 Skutki odstąpienia:
• Umowa "odpada" ze skutkiem wstecznym (ex tunc)
• Zwrot świadczeń + odszkodowanie za zwłokę

Różnica ZWŁOKA vs OPÓŹNIENIE:
• Zwłoka - zawinione niewykonanie (Art. 476)
• Opóźnienie - każde niewykonanie w terminie',
    'Art. 491-494 KC',
    'hard',
    7,
    ARRAY['odstąpienie', 'umowy wzajemne', 'zwłoka', 'egzamin']
  )
) AS t(question, answer_short, answer_full, legal_basis, difficulty, difficulty_score, tags);

-- ═══════════════════════════════════════════════════════════════
-- 5. AKTUALIZUJ LICZNIKI
-- ═══════════════════════════════════════════════════════════════

UPDATE flashcard_decks d
SET total_cards = (
  SELECT COUNT(*) 
  FROM flashcards f 
  WHERE f.deck_id = d.id AND f.is_active = TRUE
);

-- ═══════════════════════════════════════════════════════════════
-- ✅ SEED DATA ZAŁADOWANE!
-- ═══════════════════════════════════════════════════════════════

-- Sprawdź ile fiszek
SELECT 
  d.name,
  d.total_cards,
  d.icon
FROM flashcard_decks d
WHERE d.is_active = TRUE
ORDER BY d.name;
