'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * `true`, gdy użytkownik przewija w dół (poniżej `minY`), `false` przy przewijaniu w górę i przy
 * samej górze strony. Nagłówek na telefonie ma dwa rzędy (~108 px, 13% ekranu 812 px) — chowanie go
 * w trakcie czytania i przywracanie ruchem w górę to wzorzec znany z aplikacji i przeglądarek.
 *
 * Stan zmienia się tylko po przekroczeniu `threshold` (bez migotania przy drobnych ruchach), a pomiar
 * jest w `requestAnimationFrame` (jedna aktualizacja na klatkę). `setHidden` z tą samą wartością
 * nie renderuje ponownie.
 */
export function useHideOnScroll({ threshold = 8, minY = 120 }: { threshold?: number; minY?: number } = {}): boolean {
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        lastY.current = window.scrollY;
        let frame = 0;
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const y = window.scrollY;
                const dy = y - lastY.current;
                if (y < minY) {
                    setHidden(false);
                    lastY.current = y;
                } else if (Math.abs(dy) > threshold) {
                    setHidden(dy > 0);
                    lastY.current = y;
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [threshold, minY]);

    return hidden;
}
