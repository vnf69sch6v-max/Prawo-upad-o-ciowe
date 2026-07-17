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
