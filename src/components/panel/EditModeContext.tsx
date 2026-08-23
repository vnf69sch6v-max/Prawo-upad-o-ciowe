'use client';

import { createContext, useContext } from 'react';

/** Czy Przegląd jest w trybie jiggle (jak ekran początkowy iPhone). */
export const EditModeContext = createContext(false);
export function useEditMode() {
    return useContext(EditModeContext);
}
