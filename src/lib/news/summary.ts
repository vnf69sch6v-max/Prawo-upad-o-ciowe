import 'server-only';

import type { DailyDigest, DigestSummary } from '@/lib/news/daily';
import { corroborationLabel } from '@/lib/news/daily';

/**
 * Warstwa 2 Daily Digestu — akapit „o czym dziś pisano".
 *
 * ─── Dlaczego to jest zbudowane właśnie tak ───
 * Model językowy potrafi napisać zgrabne trzy zdania, ale potrafi też podać liczbę, której nie
 * dostał — i ta liczba wygląda dokładnie tak samo jak prawdziwa. W serwisie, którego jedyną
 * obietnicą są prawdziwe dane, to jest ryzyko nie do przyjęcia.
 *
 * Dlatego NIE ufamy prośbie w prompcie. Konstrukcja ma trzy warstwy:
 *   1. WEJŚCIE — zamknięta lista: tytuły punktów + zweryfikowane wartości wskaźników. Nic więcej.
 *   2. GENERACJA — 3–4 zdania, twarde zakazy w prompcie systemowym.
 *   3. WALIDATOR — mechaniczna bramka: każda liczba w tekście musi pochodzić z wejścia.
 *      Cokolwiek nie przejdzie → zapisujemy szablon deterministyczny.
 *
 * Model NIE MA JAK przepuścić liczby, której nie dostał. To nie jest obietnica, to jest kod.
 *
 * ⚠ ZNANY LIMIT WALIDATORA: sprawdzamy WIELKOŚCI, nie KIERUNKI. Do zbioru dozwolonych trafiają
 * obie formy („−0,4" i „0,4"), bo inaczej poprawne zdanie „WIG20 spadł o 0,4%" byłoby odrzucane.
 * Skutek: odwrócenie kierunku („wzrósł" zamiast „spadł") NIE zostanie złapane mechanicznie —
 * broni przed tym tylko prompt. Gdyby to kiedyś zaczęło się zdarzać, trzeba dołożyć sprawdzenie
 * czasownika przy delcie, a nie rozluźniać whitelistę.
 *
 * ⚠ GENERACJA ŻYJE WYŁĄCZNIE W CRONIE. Nigdy w ścieżce żądania. Przy ~365 wywołaniach rocznie
 * to koszt rzędu 3 USD; przeniesione do endpointu odsłony przy 10 tys. wejść dziennie byłoby to
 * ~325 USD DZIENNIE. Różnica jest tysiąckrotna i nie widać jej w kodzie — widać ją na fakturze.
 * `/api/news/daily` ma tylko CZYTAĆ gotowy dokument.
 */

/**
 * Wariant BEZ ROZUMOWANIA — wybrany pomiarem, nie przeczuciem (porównanie na realnym wejściu):
 *
 *   grok-4.6            1245 wej. + 220 wyj. + 979 rozumowania | 17,3 s | ~$3,53/rok | walidator ✓
 *   grok-4.3             770 wej. + 116 wyj. + 875 rozumowania |  7,3 s | ~$1,26/rok | walidator ✗
 *   grok-4.20 non-reas.  762 wej. + 142 wyj. +   0 rozumowania |  2,4 s | ~$0,48/rok | walidator ✓
 *
 * ⚠ `reasoning_tokens` NIE są wliczone w `completion_tokens` — xAI dolicza je osobno (979 > 220).
 * Kto liczy koszt z samego `completion_tokens`, zaniży go trzykrotnie.
 *
 * Zadanie jest proste: 3 zdania z zamkniętego wejścia. Rozumowanie nic tu nie wnosiło poza
 * rachunkiem i 15 sekundami z 60-sekundowego budżetu crona. Jakość tekstu porównywalna.
 *
 * ⚠ xAI rozlicza żądanie powyżej 200 tys. tokenów wyższą stawką dla WSZYSTKICH tokenów, nie tylko
 * nadwyżki — stąd twarda asercja rozmiaru wejścia niżej.
 */
const MODEL = 'grok-4.20-0309-non-reasoning';
const ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 300;   // zmierzone wyjście: ~142 tok.; to sufit awaryjny, nie cel
/** Szacunek: polszczyzna ≈ 3 znaki/token. Wejście ma mieć ~1,5 tys. tokenów; 4 tys. to sufit awaryjny. */
const MAX_INPUT_TOKENS = 4_000;
const MIN_SENTENCES = 2;
const MAX_SENTENCES = 5;

export const SYSTEM_PROMPT = `Piszesz zwięzłe podsumowanie polskiej prasy ekonomicznej dla serwisu danych makro.
Dostajesz tytuły najważniejszych tematów dnia i zweryfikowane wartości wskaźników.

Napisz 3–4 zdania po polsku, rzeczowo, bez ozdobników.

ZAKAZY — złamanie któregokolwiek unieważnia całą odpowiedź:
1. Nie podawaj ŻADNEJ liczby, której nie ma w danych wejściowych. Nie licz, nie sumuj,
   nie podawaj liczebników słownie ("trzeci miesiąc z rzędu", "dwie redakcje").
2. Nie twierdź, że coś jest przyczyną czegoś innego. Z tytułów wynika następstwo w czasie,
   nie związek przyczynowy. "po decyzji RPP" — wolno. "przez decyzję RPP" — nie wolno.
3. Nie oceniaj skali ("gwałtowny", "rekordowy", "dramatyczny"), jeśli nie mówią tego dane.
4. Nie pisz, że coś zostało "potwierdzone". Wiele redakcji opisujących temat to syndykacja,
   nie weryfikacja. Wolno: "opisane niezależnie przez kilka redakcji".
5. Nie streszczaj treści artykułów — nie masz ich. Masz tytuły.

FORMA: jeden akapit ciągłego tekstu. Bez nagłówka, bez tytułu, bez markdown (gwiazdek, krat,
myślników listy), bez pustych linii, bez wypunktowania. Zacznij od pierwszego zdania treści.
Skup się na 2-3 najważniejszych tematach — nie wymieniaj wszystkich.

Pisz o tym, o czym pisano, nie o tym, co się wydarzyło.`;

// ─── Szablon deterministyczny ───────────────────────────────
// Powstaje NIEZALEŻNIE od modelu, bo jest wymaganym fallbackiem walidatora. Działa bez klucza
// i bez sieci — dzięki temu brak klucza, wyczerpane kredyty i awaria xAI dają ten sam, łagodny skutek.

export function buildTemplateSummary(digest: DailyDigest): string | null {
    const lead = digest.punkty[0];
    if (!lead) return null;

    const corr = corroborationLabel(lead.corroboration);
    const zdania: string[] = [`Najważniejsze dziś: „${lead.title}”${corr ? ` (${corr})` : ''}.`];

    if (digest.dane.length > 0) {
        const liczby = digest.dane
            .slice(0, 3)
            .map((d) => `${d.label} ${d.value}${d.delta ? ` (${d.delta})` : ''}`)
            .join(', ');
        zdania.push(`W liczbach: ${liczby}.`);
    }
    return zdania.join(' ');
}

// ─── Normalizacja i wyłuskiwanie liczb ──────────────────────

/**
 * Sprowadza zapis liczby do postaci porównywalnej: „3,0" = „3.0" = „3", „9 402" = „9402".
 * Bez tego walidator odrzucałby POPRAWNE teksty — a fałszywe odrzucenia są tu równie szkodliwe
 * jak przepuszczone halucynacje, bo spychają nas na szablon przy każdej generacji.
 */
function canonical(raw: string): string {
    const cleaned = raw.replace(/[\u2212\u2013\u2014]/g, '-').replace(/,/g, '.');
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? String(n) : cleaned;
}

/**
 * Skleja spacje rozdzielające tysiące (zwykłe, niełamliwe i wąskie), żeby „9 402" było jedną liczbą.
 *
 * ⚠ Grupa MUSI mieć dokładnie 3 cyfry i nie może po niej iść cyfra ani separator dziesiętny —
 * inaczej sklejamy sąsiadujące, niezwiązane liczby. Pierwsza wersja bez tego warunku zamieniała
 * „WIG20 3 766" na jedną liczbę 203766, a „3,0 3.0" na 3.03. Oba wyszły dopiero w teście.
 */
function joinThousands(text: string): string {
    let out = text;
    let prev: string;
    do {
        prev = out;
        out = out.replace(/(\d)[\s\u00A0\u202F](\d{3})(?![\d.,])/g, '$1$2');
    } while (out !== prev);
    return out;
}

export function extractNumbers(text: string): string[] {
    // Znaki minusa ujednolicamy PRZED dopasowaniem — regex łapie tylko ASCII `-`, więc bez tego
    // „−0,76" (U+2212, tak zapisuje minus nasz formatter) dawałoby 0.76 i gubiło znak.
    const joined = joinThousands(text.replace(/[\u2212\u2013\u2014]/g, '-'));
    const found = joined.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
    return found.map(canonical);
}

/**
 * Zbiór liczb, których modelowi WOLNO użyć.
 *
 * ⚠ Wywodzimy go WPROST Z TEKSTU WYSYŁANEGO DO MODELU (`buildModelInput`), a nie z osobnego
 * obchodzenia pól digestu. Pierwsza wersja robiła to drugie i natychmiast się rozjechała:
 * wejście zawierało „3 niezależne relacje", a whitelist nie — więc WŁASNY SZABLON nie przechodził
 * WŁASNEGO walidatora i każda generacja spadała na fallback. Jedno źródło prawdy usuwa całą tę
 * klasę błędów: cokolwiek model zobaczy, tego mu wolno użyć, i nic ponadto.
 *
 * Dla każdej liczby dodajemy wariant ze znakiem i bez — patrz „ZNANY LIMIT" w nagłówku pliku.
 */
export interface AllowedTokens {
    numbers: Set<string>;
    /** Liczebniki słowne obecne w WEJŚCIU — model może je zacytować, patrz `collectAllowed`. */
    words: Set<string>;
}

export function collectAllowedNumbers(digest: DailyDigest): Set<string> {
    return collectAllowed(digest).numbers;
}

export function collectAllowed(digest: DailyDigest): AllowedTokens {
    const numbers = new Set<string>();
    const addNums = (s: string) => {
        for (const n of extractNumbers(s)) {
            numbers.add(n);
            numbers.add(canonical(n.replace(/^-/, '')));   // wariant bez znaku
        }
    };

    const input = buildModelInput(digest);
    addNums(input);
    addNums(digest.date);      // „2026-08-23" → 2026, 8, 23

    // Ta sama zasada co dla cyfr: liczebnik obecny w wejściu wolno zacytować, bo NIE JEST
    // liczeniem przez model. Realny nagłówek „Trzy lata hossy uśpiły czujność" wywracał
    // walidator na własnym szablonie — wyszło dopiero na żywym feedzie Bankiera.
    const words = new Set(
        [...input.matchAll(WORD_NUMERALS_G)].map((m) => m[0].toLowerCase()),
    );
    return { numbers, words };
}

// ─── Walidator ──────────────────────────────────────────────

/**
 * Liczebniki słowne — druga bramka. Punkt 1 promptu zakazuje liczenia, ale regex od cyfr tego
 * nie złapie („trzeci miesiąc z rzędu" nie zawiera cyfry). Lista celowo obejmuje TYLKO wyrazy,
 * które twierdzą KONKRETNĄ ilość lub kolejność — nie każdą liczebnikową formę polszczyzny.
 *
 * ⚠ NIE dopisywać tu „kilka", „kilkanaście", „większość". Pierwsza wersja je miała i odrzucała
 * zdanie „opisane niezależnie przez kilka redakcji" — czyli sformułowanie, które prompt systemowy
 * w punkcie 4 WPROST DOPUSZCZA. Walidator sprzeczny z promptem spycha na szablon przy każdej
 * generacji i cała warstwa 2 przestaje mieć sens. Nieostre kwantyfikatory to hedge, nie liczba.
 */
const WORD_NUMERAL_SRC = 'dwa|dwie|dwóch|dwoma|trzy|trzech|trzema|cztery|czterech|pięć|pięciu|sześć|sześciu|siedem|siedmiu|osiem|ośmiu|dziewięć|dziesięć|pierwsz\\w*|drug\\w*|trzec\\w*|czwart\\w*|oba|obie|obu|połowa|połowę';
const WORD_NUMERALS_G = new RegExp(`\\b(${WORD_NUMERAL_SRC})\\b`, 'gi');

export interface ValidationResult {
    ok: boolean;
    reason?: string;
}

export function countSentences(text: string): number {
    return text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length;
}

export function validateSummary(text: string, allowed: AllowedTokens): ValidationResult {
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, reason: 'pusta odpowiedź' };

    const sentences = countSentences(trimmed);
    if (sentences < MIN_SENTENCES) return { ok: false, reason: `za krótko (${sentences} zd.)` };
    if (sentences > MAX_SENTENCES) return { ok: false, reason: `za długo (${sentences} zd.)` };

    // ─ Bramka główna: żadnej liczby spoza wejścia ─
    const found = extractNumbers(trimmed);
    const obce = found.filter((n) => !allowed.numbers.has(n));
    if (obce.length > 0) {
        return { ok: false, reason: `liczby spoza wejścia: ${[...new Set(obce)].join(', ')}` };
    }

    const obceSlowa = [...trimmed.matchAll(WORD_NUMERALS_G)]
        .map((m) => m[0])
        .filter((w) => !allowed.words.has(w.toLowerCase()));
    if (obceSlowa.length > 0) {
        return { ok: false, reason: `liczebnik słowny spoza wejścia: „${obceSlowa[0]}”` };
    }

    // UI renderuje `summary.text` jako CZYSTY TEKST — „**Podsumowanie**" pokazałoby gwiazdki
    // dosłownie. Wariant nierozumujący lubi dokleić nagłówek, więc bramka jest konieczna,
    // a nie tylko ostrożnościowa (zaobserwowane na pierwszym przebiegu).
    const markdown = trimmed.match(/\*\*|^#{1,6}\s|^[-*+]\s|\n\s*\n/m);
    if (markdown) {
        return { ok: false, reason: 'formatowanie markdown / wiele akapitów' };
    }

    if (/potwierdz/i.test(trimmed)) {
        return { ok: false, reason: 'sugeruje potwierdzenie (mierzymy syndykację, nie weryfikację)' };
    }
    return { ok: true };
}

// ─── Wejście modelu ─────────────────────────────────────────

export function buildModelInput(digest: DailyDigest): string {
    const tematy = digest.punkty
        .map((p, i) => {
            const corr = corroborationLabel(p.corroboration);
            return `${i + 1}. „${p.title}” — ${p.source}${corr ? `, ${corr}` : ''}`;
        })
        .join('\n');

    const wskazniki = digest.dane.length
        ? digest.dane
              .map((d) => `- ${d.label}: ${d.value}${d.delta ? ` (zmiana ${d.delta})` : ''}, odczyt ${d.readingDate}`)
              .join('\n')
        : '(brak nowych odczytów)';

    return `TEMATY DNIA (${digest.date}):\n${tematy}\n\nWSKAŹNIKI — wartości zweryfikowane u źródła:\n${wskazniki}`;
}

// ─── Dostawca ───────────────────────────────────────────────

/**
 * Jedyny fragment zależny od dostawcy. Cała reszta pliku — szablon, walidator, orkiestracja —
 * jest od niego niezależna, więc zmiana modelu czy providera to podmiana tej jednej funkcji.
 */
export interface GenerateResult {
    text: string;
    tokens?: { input: number; output: number; reasoning: number };
}

export type Generate = (system: string, user: string) => Promise<GenerateResult>;

/** xAI ma API zgodne z OpenAI; jedno wywołanie na dobę nie uzasadnia dokładania zależności SDK. */
export const generateXai: Generate = async (system, user) => {
    const key = process.env.XAI_API_KEY;
    if (!key) throw new Error('brak XAI_API_KEY');

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            max_tokens: MAX_OUTPUT_TOKENS,
            // Bez `reasoning_effort` — model jest z definicji nierozumujący (patrz komentarz przy MODEL).
            temperature: 0.3,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
        // Świadomie BEZ całego obiektu odpowiedzi — bywają w nim nagłówki żądania razem z kluczem.
        throw new Error(`xAI HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number; completion_tokens_details?: { reasoning_tokens?: number } };
    };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error('xAI: pusta odpowiedź');
    return {
        text,
        tokens: {
            input: json.usage?.prompt_tokens ?? 0,
            output: json.usage?.completion_tokens ?? 0,
            reasoning: json.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
        },
    };
};

// ─── Orkiestracja ───────────────────────────────────────────

/**
 * Składa akapit dnia. NIGDY nie rzuca — każda ścieżka błędu kończy się szablonem, bo digest
 * ma się opublikować nawet wtedy, gdy nie ma klucza, skończyły się kredyty albo xAI leży.
 */
export async function makeDigestSummary(
    digest: DailyDigest,
    generate: Generate = generateXai,
): Promise<DigestSummary | undefined> {
    const template = buildTemplateSummary(digest);
    if (!template) return undefined;          // pusty dzień — nie ma czego podsumowywać

    const fallback = (reason: string): DigestSummary => {
        console.error(`[digest summary] szablon zamiast modelu: ${reason}`);
        return { text: template, origin: 'szablon', rejectedReason: reason };
    };

    if (!process.env.XAI_API_KEY) return { text: template, origin: 'szablon' };

    const user = buildModelInput(digest);
    if (user.length / 3 > MAX_INPUT_TOKENS) {
        return fallback(`wejście za duże (${Math.round(user.length / 3)} tok.)`);
    }

    const allowed = collectAllowed(digest);
    const input = {
        titles: digest.punkty.map((p) => p.title),
        numbers: [...allowed.numbers],
    };

    let generated: GenerateResult;
    try {
        generated = await generate(SYSTEM_PROMPT, user);
    } catch (err) {
        return fallback(`błąd generacji: ${err instanceof Error ? err.message : String(err)}`);
    }
    const text = generated.text.trim();

    const verdict = validateSummary(text, allowed);
    if (!verdict.ok) {
        // Tokeny zapisujemy TAKŻE przy odrzuceniu — zapłaciliśmy za nie tak samo.
        return { ...fallback(`walidator: ${verdict.reason}`), input, tokens: generated.tokens };
    }
    return { text, origin: 'model', model: MODEL, input, tokens: generated.tokens };
}
