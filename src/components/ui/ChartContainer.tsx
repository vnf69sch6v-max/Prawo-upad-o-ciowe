'use client';

// Zamiennik `ResponsiveContainer` z Rechartsa (drop-in: te same propsy `width="100%"` + `height`).
//
// ─── Po co własna implementacja ───
// Recharts 3.7 + React 19 gubi pomiar szerokości: jego wewnętrzny ResizeObserver bywa przegrywa
// wyścig przy montowaniu i stan zostaje na zerze. Objaw zdiagnozowany w DOM (2026-07-16, mobile 375px):
//
//   <div class="recharts-responsive-container" style="width:100%">   ← realnie 309px, OK
//     <div style="width: 0px; overflow-x: visible;">                 ← Recharts zeruje szerokość
//       <div class="recharts-wrapper" style="width: 309px">          ← zgniecione do 0
//
// Efekt: karta wykresu renderuje się z tytułem i przełącznikami, ale w miejscu wykresu jest biała
// pustka. Nie widać tego jako błędu w konsoli — trzeba było zmierzyć `.recharts-surface`.
// Najdotkliwsze na wąskich ekranach, gdzie układ ustala się w innej kolejności niż na desktopie.
//
// Tu mierzymy sami: `useLayoutEffect` (pomiar po DOM, przed malowaniem) + własny ResizeObserver na
// zmiany. Wykres dostaje szerokość w PIKSELACH, więc nie zależy już od wewnętrznego stanu Rechartsa.
// Dzieci renderujemy dopiero, gdy znamy szerokość — inaczej Recharts zapisałby sobie 0 i tam został.
//
// 2026-08-23 (375×812): `.recharts-surface` plotu = 309 px (OK). Powierzchnie 8×8 to ikony legendy
// Rechartsa (`iconSize={8}`), nie zapadnięty wykres. Próg MIN_READY odrzuca pomiar < 32 px
// (wyścig flex/grid), a rAF ponawia, zanim oddamy 0 Rechartsowi.

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
import { CHART_SM } from '@/lib/chart-theme';

/** Minimalna wysokość plotu na wąskim kontenerze (standard mobilny: 200–260 px). */
export const MOBILE_CHART_MIN = 200;

/**
 * Wysokość plotu przy szerokości `width` (pomiar kontenera, nie okna).
 *
 * Poprzednio (`mobilePlotHeight`, 16:9, min 168) plot 326 px dostawał 183 px — przy kilku seriach
 * linie zlewały się w pasek, a tap trafiał „w tłum” punktów. Teraz ~0,68 szerokości, min 200 px:
 * telefon 320 → 200, 390 → 222, 430 → 249 (mieści się w 200–260). Nigdy ponad wysokość desktopową,
 * więc wąskie kolumny na desktopie (np. 600 px → 300) wyglądają jak dotąd; małe wykresy
 * (< 200, np. sparkline) zostają jak są.
 */
export function mobileChartHeight(width: number, desktopHeight: number): number {
    if (width <= 0 || width >= CHART_SM || desktopHeight < MOBILE_CHART_MIN) return desktopHeight;
    return Math.min(desktopHeight, Math.max(MOBILE_CHART_MIN, Math.round(width * 0.68)));
}

// useLayoutEffect ostrzega przy renderze serwerowym — na serwerze i tak nie ma czego mierzyć.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Poniżej tego traktujemy pomiar jako „jeszcze nie gotowy” (0-width bug / flex race). */
const MIN_READY = 32;
const RAF_TRIES = 16;

export function usePlotWidth(minReady = MIN_READY): { ref: RefObject<HTMLDivElement | null>; width: number } {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useIsomorphicLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => {
            const w = el.getBoundingClientRect().width || el.clientWidth;
            if (w < minReady) return;
            setWidth((prev) => (Math.abs(prev - w) >= 1 ? w : prev));
        };
        measure();

        let tries = 0;
        let raf = 0;
        const retry = () => {
            measure();
            if (tries++ < RAF_TRIES && (ref.current?.getBoundingClientRect().width || 0) < minReady) {
                raf = requestAnimationFrame(retry);
            }
        };
        raf = requestAnimationFrame(retry);

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [minReady]);

    return { ref, width };
}

interface ChartContainerProps {
    /** Zgodność z API Rechartsa. Obsługujemy tylko '100%' — jedyny wariant używany w projekcie. */
    width?: string | number;
    height: number;
    children: ReactElement<{ width?: number; height?: number }>;
    className?: string;
}

export function ResponsiveContainer({ height, children, className }: ChartContainerProps) {
    const { ref, width } = usePlotWidth();
    const plotH = mobileChartHeight(width, height);

    const child = Children.only(children);

    return (
        <div ref={ref} className={className} style={{ width: '100%', height: plotH, minWidth: 0, maxWidth: '100%' }}>
            {width >= MIN_READY && isValidElement(child) ? cloneElement(child, { width, height: plotH }) : null}
        </div>
    );
}
