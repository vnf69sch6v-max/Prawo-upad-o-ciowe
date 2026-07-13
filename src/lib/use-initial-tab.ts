'use client';

import { useEffect } from 'react';

/**
 * Czyta `?tab=` z URL raz przy montażu i ustawia pod-zakładkę, jeśli wartość jest poprawna.
 * Umożliwia deep-linki (np. z palety poleceń ⌘K) do konkretnego widoku — bez łamania
 * statycznego prerenderu (strona renderuje domyślną zakładkę, po hydratacji przełącza na tę z URL).
 */
export function useInitialTab<T extends string>(valid: readonly T[], apply: (t: T) => void) {
    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get('tab');
        if (t && (valid as readonly string[]).includes(t)) apply(t as T);
        // mount-only: czytamy URL raz; kolejne zmiany zakładki idą przez UI
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
