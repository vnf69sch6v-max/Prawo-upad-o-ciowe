import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section } from '@/components/legal/LegalPage';
import { OWNER, field } from '@/lib/legal';
import { PLANS, trialDays } from '@/lib/access';

export const metadata: Metadata = {
    title: 'Regulamin — Savori',
    description: 'Zasady korzystania z platformy Savori: konto, plany płatne, odstąpienie od umowy, reklamacje.',
};

const months = (n: number) => (n === 1 ? '1 miesiąc' : n < 5 ? `${n} miesiące` : `${n} miesięcy`);

export default function TermsPage() {
    return (
        <LegalPage title="Regulamin" lead="Zasady świadczenia usługi Savori drogą elektroniczną — konto, plany, płatności, reklamacje.">
            <Section title="1. Usługodawca i kontakt">
                <p>
                    Usługę świadczy {field(OWNER.name)}, {field(OWNER.address)}{OWNER.nip ? `, NIP ${OWNER.nip}` : ''}
                    („Usługodawca”). Kontakt: <strong>{field(OWNER.email)}</strong>.
                </p>
            </Section>

            <Section title="2. Czym jest Savori">
                <p>
                    Savori to platforma internetowa z danymi i analizami o gospodarce Polski i Japonii: inflacja, rynek pracy,
                    produkcja, rynki finansowe, kursy walut, wiadomości i narzędzia, w tym parser sprawozdań finansowych.
                    Dane pochodzą z publicznych źródeł (m.in. GUS, NBP, Eurostat, Statistics Bureau of Japan) i są
                    oznaczone źródłem.
                </p>
                <p>
                    <strong>Treści mają charakter informacyjny i nie są rekomendacją inwestycyjną ani doradztwem</strong>{' '}
                    w rozumieniu przepisów o obrocie instrumentami finansowymi. Decyzje podejmujesz samodzielnie.
                </p>
            </Section>

            <Section title="3. Wymagania techniczne">
                <p>
                    Urządzenie z dostępem do internetu i aktualną przeglądarką (Chrome, Safari, Firefox, Edge) z włączoną obsługą
                    JavaScript i ciasteczek niezbędnych do logowania. Zakazane jest dostarczanie treści o charakterze bezprawnym
                    oraz próby zakłócania działania serwisu.
                </p>
            </Section>

            <Section title="4. Konto">
                <p>
                    Konto zakładasz, logując się przez Google albo adresem e-mail i hasłem. Umowa o prowadzenie konta jest
                    bezpłatna i zawarta na czas nieokreślony; możesz ją rozwiązać w każdej chwili, prosząc o usunięcie konta.
                    Po pierwszym logowaniu otrzymujesz {trialDays()} dni bezpłatnego dostępu do wszystkich funkcji.
                </p>
            </Section>

            <Section id="plany" title="5. Plany i płatności">
                <p>Po okresie próbnym dostęp do platformy wymaga wykupienia planu. Ceny są cenami brutto w złotych:</p>
                <ul className="list-disc space-y-1 pl-5">
                    {PLANS.map((p) => (
                        <li key={p.id}>{p.name}: <strong>{p.pricePln} zł</strong> za {months(p.months)} dostępu</li>
                    ))}
                </ul>
                <p>
                    Każdy plan to <strong>jednorazowa płatność bez automatycznego odnawiania</strong> — nic nie pobierzemy bez
                    Twojej decyzji. Dostęp zaczyna się po potwierdzeniu płatności przez operatora i trwa przez opłacony okres;
                    kolejny zakup przedłuża go od dnia jego zakończenia. Płatności obsługuje zewnętrzny operator płatności
                    (np. BLIK, karta, szybki przelew).
                </p>
            </Section>

            <Section title="6. Odstąpienie od umowy">
                <p>
                    Konsument (oraz przedsiębiorca na prawach konsumenta) może odstąpić od umowy zawartej na odległość w ciągu
                    14 dni bez podania przyczyny, pisząc na <strong>{field(OWNER.email)}</strong>. Zwrot nastąpi w ciągu 14 dni
                    tą samą metodą płatności.
                </p>
                <p>
                    Jeśli przy zakupie wyraźnie zażądasz rozpoczęcia świadczenia usługi przed upływem tego terminu i przyjmiesz
                    do wiadomości utratę prawa odstąpienia, prawo to wygasa z chwilą udostępnienia Ci treści cyfrowych
                    (art. 38 ust. 1 pkt 13 ustawy o prawach konsumenta) — potwierdzenie otrzymasz e-mailem.
                </p>
            </Section>

            <Section title="7. Reklamacje">
                <p>
                    Reklamacje dotyczące działania serwisu lub płatności zgłoś na <strong>{field(OWNER.email)}</strong>,
                    opisując problem. Odpowiemy w ciągu 14 dni. Konsument może skorzystać z pozasądowych sposobów rozwiązywania
                    sporów, m.in. pomocy miejskiego lub powiatowego rzecznika konsumentów lub Wojewódzkiego Inspektoratu
                    Inspekcji Handlowej.
                </p>
            </Section>

            <Section title="8. Odpowiedzialność i dostępność">
                <p>
                    Dokładamy starań, by dane były aktualne i zgodne ze źródłem, a serwis dostępny bez przerw; publiczne źródła
                    danych mogą jednak opóźniać publikacje lub być chwilowo niedostępne. Prace techniczne ogłaszamy z
                    wyprzedzeniem, gdy to możliwe. Odpowiedzialność wobec konsumentów określają przepisy powszechnie obowiązujące.
                </p>
            </Section>

            <Section title="9. Dane osobowe">
                <p>
                    Zasady przetwarzania danych opisuje <Link href="/prywatnosc" className="font-semibold text-mk-primary underline-offset-2 hover:underline">polityka prywatności</Link>.
                </p>
            </Section>

            <Section title="10. Zmiany i postanowienia końcowe">
                <p>
                    Regulamin możemy zmienić z ważnych przyczyn (zmiana prawa, funkcji, operatora płatności), informując o tym
                    z 14-dniowym wyprzedzeniem; zmiany nie dotyczą już opłaconych okresów. W sprawach nieuregulowanych stosuje
                    się prawo polskie, a konsument zachowuje ochronę przepisów kraju swojego zamieszkania.
                </p>
            </Section>
        </LegalPage>
    );
}
