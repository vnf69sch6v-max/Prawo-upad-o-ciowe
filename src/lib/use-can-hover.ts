'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(QUERY);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
}

/**
 * `true` dla myszy/touchpada, `false` dla dotyku (i w prerenderze — wtedy domyślnie tryb „stuknij").
 * Wykresy pokazują tooltip po najechaniu tylko tam, gdzie najechanie istnieje; na telefonie
 * zostaje stuknięcie. Wcześniej `trigger="click"` obowiązywał wszędzie, więc na komputerze
 * najechanie na wykres nie pokazywało żadnej wartości.
 */
export function useCanHover(): boolean {
    return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
