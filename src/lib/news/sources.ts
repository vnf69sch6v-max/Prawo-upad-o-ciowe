// Lista feedów RSS — WYŁĄCZNIE źródła zweryfikowane realnym żądaniem (curl) 2026-07-16.
// Zasada projektu: żadnych mocków i niesprawdzonych adresów. Każdy wpis poniżej zwrócił
// HTTP 200 + poprawny XML z niepustą listą <item> i świeżymi datami (tego samego dnia).
//
// ŹRÓDŁA ODRZUCONE (sprawdzone i NIE działają — nie przywracać bez ponownej weryfikacji):
//   • Parkiet      — /rss, /feed, /rss/wiadomosci.xml → HTTP 404 (brak publicznego RSS).
//   • Forsal       — /rss.xml, /rss, /atom.xml, /gospodarka.rss → HTTP 404.
//   • PAP Biznes   — biznes.pap.pl/rss.xml → 404; /pl/rss → HTTP 200, ale text/html bez <item>.
//   • Rzeczpospolita — rp.pl/rss/{1017..1021} → HTTP 200, ale KAŻDE id zwraca ten sam ogólny
//     feed redakcyjny (Polityka/Film/Akty prawne/Wojsko). Brak kanału ekonomicznego → dla
//     platformy makro/rynkowej byłby to czysty szum, więc świadomie pominięty.
//   • Bankier Gospodarka — /rss/gospodarka.xml → HTTP 200, ale 0 pozycji (kanał nie istnieje).
//   • Puls Biznesu /rss → zwraca stronę HTML, NIE XML. Działa dopiero /rss/najnowsze.xml.

export interface NewsSource {
    /** Stabilny identyfikator używany w filtrach UI i w kluczu cache. */
    id: string;
    /** Nazwa redakcji pokazywana użytkownikowi. */
    name: string;
    url: string;
    /** Sekcja tematyczna feedu — pomaga późniejszemu dopasowaniu newsów do wskaźników. */
    section: 'ogolne' | 'gielda' | 'waluty' | 'przemysl';
    /**
     * Feed podaje czas ścienny Europe/Warsaw, ale strefy albo NIE deklaruje, albo deklaruje BŁĘDNIE.
     * Wtedy zadeklarowaną strefę ignorujemy i liczymy offset Warszawy sami (patrz parse.ts).
     */
    warsawWallClock?: boolean;
    /** Limit pozycji z tego feedu — chroni miks przed zdominowaniem przez jedno źródło. */
    limit: number;
}

// UWAGA — Bankier deklaruje BŁĘDNĄ strefę czasową (zweryfikowane 2026-07-16, nie zmieniać bez dowodu):
//   • pubDate podpisuje stałym "+0100" przez cały rok, mimo że latem w Polsce obowiązuje CEST (+0200);
//   • <lastBuildDate> to "21:22:46 GMT" w momencie, gdy realny UTC wynosił 19:23 — czyli jest to
//     warszawski czas ścienny (21:23 CEST) etykietowany jako GMT.
// Dowód wprost: przy dosłownym "+0100" najnowszy artykuł wypadał ~5 min W PRZYSZŁOŚCI (niemożliwe),
// a przy interpretacji warszawskiej — 55 min temu. Honorowanie deklaracji przesuwałoby newsy Bankiera
// o +1h i sztucznie wypychało je na górę scalonej listy. Stąd warsawWallClock.
// Money.pl (+0200), Business Insider i Interia (GMT) deklarują strefę POPRAWNIE → bez flagi.
export const NEWS_SOURCES: NewsSource[] = [
    { id: 'bankier', name: 'Bankier.pl', url: 'https://www.bankier.pl/rss/wiadomosci.xml', section: 'ogolne', warsawWallClock: true, limit: 40 },
    { id: 'bankier-gielda', name: 'Bankier.pl — Giełda', url: 'https://www.bankier.pl/rss/gielda.xml', section: 'gielda', warsawWallClock: true, limit: 15 },
    { id: 'bankier-waluty', name: 'Bankier.pl — Waluty', url: 'https://www.bankier.pl/rss/waluty.xml', section: 'waluty', warsawWallClock: true, limit: 15 },
    { id: 'money', name: 'Money.pl', url: 'https://www.money.pl/rss/', section: 'ogolne', limit: 25 },
    { id: 'businessinsider', name: 'Business Insider Polska', url: 'https://businessinsider.com.pl/.feed', section: 'ogolne', limit: 25 },
    { id: 'interia', name: 'Interia Biznes', url: 'https://biznes.interia.pl/feed', section: 'ogolne', limit: 30 },
    // pb.pl: <pubDate>2026-07-16 20:53:12</pubDate> — brak strefy, format niestandardowy.
    { id: 'pb', name: 'Puls Biznesu', url: 'https://www.pb.pl/rss/najnowsze.xml', section: 'ogolne', warsawWallClock: true, limit: 30 },
    // wnp.pl: RFC822 bez offsetu ("Thu, 16 Jul 2026 21:04:00"); feed zwraca ~300 pozycji → mocny limit.
    { id: 'wnp', name: 'wnp.pl', url: 'https://www.wnp.pl/rss/serwis_rss.xml', section: 'przemysl', warsawWallClock: true, limit: 25 },
];
