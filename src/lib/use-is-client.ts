'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * `false` w prerenderze i podczas hydratacji, `true` po niej (oraz od razu przy nawigacji po stronie
 * klienta). Strony są prerenderowane przy BUILDZIE — wszystko, co zależy od „teraz" (daty
 * nadchodzących publikacji, „dziś"), musi poczekać na `true`, inaczej HTML z dnia builda nie zgadza
 * się z renderem klienta (React #418) i do hydratacji użytkownik widzi daty sprzed tygodni.
 *
 * `useSyncExternalStore` zamiast `useState` + `useEffect(() => setMounted(true))` — ta sama
 * semantyka bez kaskadowego renderu (reguła react-hooks/set-state-in-effect).
 */
export function useIsClient(): boolean {
    return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
