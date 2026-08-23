// Wspólne kolory wykresów. Recharts przyjmuje kolory propsami (nie klasami), więc nie da się tu
// użyć tokenów --color-mk-* z CSS — stąd ten moduł jako jedno miejsce prawdy.
//
// Dlaczego nie #94A3B8 (slate-400), które było tu wcześniej: to kontrast 2.31:1 na białym tle,
// przy wymaganych 4.5:1 dla tekstu (WCAG AA) i 3:1 dla elementów UI. Na dashboardzie danych
// oznaczało to, że widać kształt krzywej, ale nie da się odczytać poziomu ani daty.
// AXIS_INK = slate-500 = 4.76:1 — ta sama wartość co token --color-mk-faint.

/** Tekst osi, etykiety linii odniesienia — musi spełniać AA (4.5:1). */
export const AXIS_INK = '#64748B';

/** Siatka pozioma — element czysto dekoracyjny, celowo ledwo widoczny. */
export const GRID = '#EDF0F5';

/** Linia osi. */
export const AXIS_LINE = '#E7EAF0';

/** Kursor/celownik przy najechaniu — element pomocniczy, nie niesie treści. */
export const CURSOR = '#CBD2DD';

/** Minimalny krój osi — poniżej 11px etykiety miesięcy zlewają się i spadają poniżej AA. */
export const TICK_FONT = 11;

/** Tailwind `sm` — poniżej tej szerokości wykresu legenda idzie pod plot, nie obok. */
export const CHART_SM = 640;

/**
 * Wysokość plotu na wąskim ekranie.
 *
 * Pomiar 375×812 (2026-08-23): shell `px-4` (32) + karta `p-16` (32) → plot **309 px**.
 * `height={300}` na 309 px to stosunek 0.97:1 (kwadrat) — nachylenia szeregów czasowych
 * wyglądają niemal pionowo. Cleveland: „bank to 45°” ≈ 16:9 → 309 × 9/16 ≈ 174.
 * Zacisk 168–desktop, żeby małe wykresy (200) nie rosły, a 300 spadało do ~174.
 */
export function mobilePlotHeight(width: number, desktopHeight: number): number {
    if (width <= 0 || width >= CHART_SM) return desktopHeight;
    const h16x9 = Math.round(width * 9 / 16);
    return Math.min(desktopHeight, Math.max(168, h16x9));
}

/**
 * Co n-ty tick osi X, z pomiaru szerokości.
 * Etykieta miesiąca „07.25” w 11px Inter ≈ 40–42 px; oś Y zabiera ~52 px.
 * `interval` Rechartsa: 0 = wszystkie, N = co (N+1)-ty. Bez rotacji 90°.
 */
export function xTickStep(width: number, n: number, labelPx = 42): number {
    const plot = Math.max(64, width - 52);
    const maxTicks = Math.max(2, Math.floor(plot / labelPx));
    if (n <= maxTicks) return 0;
    return Math.ceil(n / maxTicks) - 1;
}
