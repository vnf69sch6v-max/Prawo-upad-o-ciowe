'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Krawędzie poziomego kontenera, za którymi jest jeszcze treść. Wartość idzie do `data-fade`. */
export type FadeEdges = 'none' | 'start' | 'end' | 'both';

/**
 * Afordancja „przewiń dalej” dla poziomych pasków (przełączniki, tabele, mapa ciepła).
 *
 * Na telefonie przewijany w bok rząd bez wskazówki wygląda na ucięty błędem, a pasek przewijania
 * jest ukryty. Hook mówi, po której stronie jest jeszcze treść; CSS (`.mk-fade-x[data-fade=…]`
 * w globals.css) wygasza tę krawędź. Gdy wszystko się mieści — `none`, bez maski.
 *
 * `mounted` — przekaż warunek renderu kontenera, jeśli pojawia się później (np. po danych);
 * efekt podepnie się dopiero, gdy element istnieje.
 *
 * Bez synchronicznego setState w efekcie: ResizeObserver woła callback od razu po `observe`,
 * więc pierwszy pomiar przychodzi sam (reguła react-hooks/set-state-in-effect).
 */
export function useScrollFade(ref: RefObject<HTMLElement | null>, mounted: unknown = true): FadeEdges {
    const [edges, setEdges] = useState<FadeEdges>('none');

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            const max = el.scrollWidth - el.clientWidth;
            const start = el.scrollLeft > 2;
            const end = max - el.scrollLeft > 2;
            setEdges(start && end ? 'both' : start ? 'start' : end ? 'end' : 'none');
        };
        el.addEventListener('scroll', update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        // Zmiana szerokości treści (np. dociągnięte etykiety) nie zmienia rozmiaru kontenera.
        for (const child of Array.from(el.children)) ro.observe(child);
        return () => {
            el.removeEventListener('scroll', update);
            ro.disconnect();
        };
    }, [ref, mounted]);

    return edges;
}
