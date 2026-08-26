'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Przewiń `el` w osi poziomej wewnątrz `container` (overflow-x).
 * Nie używamy element.scrollIntoView — to przewija też okno i „wywala”
 * widok na środek strony przy zmianie zakładki.
 */
export function scrollChildInline(container: HTMLElement, el: HTMLElement) {
    const c = container.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    if (e.left < c.left) container.scrollLeft -= c.left - e.left;
    else if (e.right > c.right) container.scrollLeft += e.right - c.right;
}

function resetWindowScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

/**
 * Po zmianie zakładki strony (nie przy pierwszym montażu) wróć na początek
 * widoku — nagłówek + hero + start treści, jak przy otwarciu zakładki od nowa.
 */
export function useTabScrollReset(tab: string) {
    const isFirst = useRef(true);
    useLayoutEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        resetWindowScroll();
        const id = requestAnimationFrame(() => {
            resetWindowScroll();
            requestAnimationFrame(resetWindowScroll);
        });
        return () => cancelAnimationFrame(id);
    }, [tab]);
}
