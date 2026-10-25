import type { Metadata } from 'next';
import { LegalPage, Section } from '@/components/legal/LegalPage';
import { OWNER, field } from '@/lib/legal';
import { trialDays } from '@/lib/access';

export const metadata: Metadata = {
    title: 'Prywatność i przetwarzanie danych — Savori',
    description: 'Jakie dane przetwarza Savori, po co, jak długo, komu je powierza i jakie masz prawa (RODO).',
};

// Treść opisuje to, co serwis naprawdę robi (stan kodu z 25.10.2026): logowanie Firebase, ciasteczko sesji,
// płatność jednorazowa przez Stripe, brak analityki i reklam, parser bez zapisu plików, szyfrowanie danych
// w bazie. Zmiana w przetwarzaniu danych = zmiana tego dokumentu w tym samym PR.
export default function PrivacyPage() {
    return (
        <LegalPage title="Prywatność i przetwarzanie danych" lead="Krótko: zbieramy tylko to, co potrzebne do konta i płatności. Bez reklam, bez śledzenia, bez sprzedawania danych.">
            <Section title="1. Administrator danych">
                <p>
                    Administratorem Twoich danych osobowych jest {field(OWNER.name)}, {field(OWNER.address)}
                    {OWNER.nip ? `, NIP ${OWNER.nip}` : ''} („Savori”, „my”). Kontakt we wszystkich sprawach danych:{' '}
                    <strong>{field(OWNER.email)}</strong>.
                </p>
            </Section>

            <Section title="2. Jakie dane, po co i na jakiej podstawie">
                <ul className="list-disc space-y-2 pl-5">
                    <li>
                        <strong>Konto</strong>: adres e-mail, imię i nazwisko oraz zdjęcie profilowe (przy logowaniu przez Google),
                        identyfikator konta, daty logowania; przy logowaniu e-mailem — hasło, które przechowujemy wyłącznie
                        w postaci skrótu (hash). Cel: założenie konta, logowanie, dostęp do platformy. Podstawa: wykonanie
                        umowy (art. 6 ust. 1 lit. b RODO).
                    </li>
                    <li>
                        <strong>Dostęp i płatności</strong>: wybrany plan, okres dostępu (w tym {trialDays()} dni próbnych),
                        identyfikator transakcji Stripe, kwota i adres e-mail, na który idzie pokwitowanie. Danych karty, BLIK-a
                        ani konta bankowego nie widzimy — obsługuje je Stripe. Cel: świadczenie płatnej usługi, rozliczenia
                        i księgowość. Podstawa: umowa (lit. b) oraz obowiązki podatkowe i rachunkowe (lit. c).
                    </li>
                    <li>
                        <strong>Wykorzystany okres próbny</strong>: zaszyfrowany skrót (HMAC) adresu e-mail z datą — tylko po to,
                        by okres próbny przysługiwał raz na adres, także po usunięciu i ponownym założeniu konta. Ze skrótu nie
                        da się odtworzyć adresu. Podstawa: prawnie uzasadniony interes w zapobieganiu nadużyciom (lit. f).
                    </li>
                    <li>
                        <strong>Ustawienia konta</strong>: lista obserwowanych wskaźników i spółek. Przechowujemy ją przy Twoim
                        koncie (zaszyfrowaną), żeby była ta sama na każdym urządzeniu; inne konta jej nie widzą. Cel: działanie
                        funkcji, którą włączasz gwiazdką. Podstawa: umowa (lit. b). Usuwamy ją razem z kontem.
                    </li>
                    <li>
                        <strong>Dane techniczne</strong>: adres IP, typ przeglądarki, czas żądania w logach serwera. Cel:
                        bezpieczeństwo, wykrywanie nadużyć i awarii. Podstawa: prawnie uzasadniony interes (lit. f).
                    </li>
                    <li>
                        <strong>Kontakt</strong>: treść wiadomości i adres, z którego piszesz (reklamacje, pytania, wnioski RODO).
                        Podstawa: umowa (lit. b) i prawnie uzasadniony interes w obsłudze spraw (lit. f).
                    </li>
                </ul>
            </Section>

            <Section title="3. Czego nie robimy">
                <ul className="list-disc space-y-2 pl-5">
                    <li>Nie używamy narzędzi analitycznych, pikseli reklamowych ani ciasteczek śledzących.</li>
                    <li>Nie sprzedajemy ani nie udostępniamy danych w celach marketingowych.</li>
                    <li>
                        Pliki wgrane do parsera sprawozdań przetwarzamy wyłącznie w pamięci w czasie analizy — nie zapisujemy ich
                        ani ich treści.
                    </li>
                    <li>Nie podejmujemy wobec Ciebie decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu.</li>
                </ul>
            </Section>

            <Section title="4. Ciasteczka i pamięć przeglądarki">
                <p>Używamy wyłącznie mechanizmów niezbędnych do działania serwisu, dlatego nie prosimy o zgodę:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li><code>__session</code> — ciasteczko sesji (httpOnly, szyfrowane połączenie), ważne do 5 dni; usuwamy je przy wylogowaniu.</li>
                    <li>Pamięć przeglądarki (IndexedDB) biblioteki logowania Firebase — utrzymuje zalogowanie.</li>
                    <li>
                        Kopia listy obserwowanych (localStorage) — po zalogowaniu lista jest zapisana przy koncie, a przeglądarka
                        trzyma tylko jej kopię do szybkiego wyświetlenia; bez logowania lista zostaje wyłącznie w przeglądarce.
                    </li>
                </ul>
            </Section>

            <Section title="5. Komu powierzamy dane">
                <ul className="list-disc space-y-2 pl-5">
                    <li><strong>Google</strong> (Firebase Authentication, Google Cloud) — konta i logowanie, baza danych.</li>
                    <li><strong>Vercel Inc.</strong> — hosting serwisu i logi serwera.</li>
                    <li>
                        <strong>Stripe Payments Europe, Ltd.</strong> (Irlandia) — obsługa płatności: adres e-mail, kwota, plan
                        i identyfikator transakcji. Dane karty, BLIK i konta bankowego trafiają wyłącznie do Stripe.
                    </li>
                    <li><strong>Biuro rachunkowe</strong> — jeśli prowadzi naszą księgowość, w zakresie dokumentów sprzedaży.</li>
                </ul>
                <p>
                    Google i Vercel mogą przetwarzać dane w USA. Przekazanie opiera się na decyzji Komisji Europejskiej
                    o odpowiednim stopniu ochrony (EU-US Data Privacy Framework) oraz standardowych klauzulach umownych.
                    Przy włączonym logowaniu na Safari i telefonach przeglądarka pobiera skrypt logowania z serwerów Google
                    (apis.google.com), co przekazuje Google Twój adres IP.
                </p>
            </Section>

            <Section title="6. Jak chronimy dane">
                <p>
                    Połączenie jest zawsze szyfrowane (HTTPS, HSTS). Baza danych jest zamknięta dla przeglądarek, a treść
                    zapisywanych w niej dokumentów jest dodatkowo szyfrowana przez aplikację algorytmem AES-256-GCM —
                    niezależnie od szyfrowania dysków u dostawcy. Gdy platforma wymaga logowania, podpis sesji jest sprawdzany
                    kryptograficznie przy każdym wejściu na stronę platformy.
                </p>
            </Section>

            <Section title="7. Jak długo">
                <ul className="list-disc space-y-2 pl-5">
                    <li>
                        Dane konta — do usunięcia konta na Twoją prośbę; potem do 30 dni w kopiach technicznych. Kont nieaktywnych
                        dziś nie usuwamy automatycznie — możesz poprosić o usunięcie w każdej chwili.
                    </li>
                    <li>Skrót e-maila po okresie próbnym — dopóki oferujemy okresy próbne, albo do skutecznego sprzeciwu.</li>
                    <li>Dokumenty sprzedaży i dane płatności — 5 lat od końca roku, w którym powstał obowiązek podatkowy.</li>
                    <li>Logi serwera — do 30 dni.</li>
                    <li>Korespondencja i reklamacje — do zakończenia sprawy i upływu terminów przedawnienia roszczeń.</li>
                </ul>
            </Section>

            <Section title="8. Twoje prawa">
                <p>
                    Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz
                    sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Napisz na{' '}
                    <strong>{field(OWNER.email)}</strong> — odpowiemy w ciągu miesiąca. Konto usuniesz też, pisząc z adresu
                    przypisanego do konta.
                </p>
                <p>
                    Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl).
                </p>
                <p>
                    Podanie danych jest dobrowolne, ale bez adresu e-mail nie założysz konta, a bez danych płatności nie
                    kupisz dostępu.
                </p>
            </Section>
        </LegalPage>
    );
}
