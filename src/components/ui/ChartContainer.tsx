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

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react';

// useLayoutEffect ostrzega przy renderze serwerowym — na serwerze i tak nie ma czego mierzyć.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ChartContainerProps {
    /** Zgodność z API Rechartsa. Obsługujemy tylko '100%' — jedyny wariant używany w projekcie. */
    width?: string | number;
    height: number;
    children: ReactElement<{ width?: number; height?: number }>;
    className?: string;
}

export function ResponsiveContainer({ height, children, className }: ChartContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useIsomorphicLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Pomiar natychmiastowy — nie czekamy na pierwsze wywołanie obserwatora.
        const measure = () => {
            const w = el.clientWidth;
            // Zmiany subpikselowe potrafią zapętlić ResizeObserver → aktualizujemy tylko przy realnej różnicy.
            setWidth((prev) => (Math.abs(prev - w) >= 1 ? w : prev));
        };
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const child = Children.only(children);

    return (
        <div ref={ref} className={className} style={{ width: '100%', height }}>
            {width > 0 && isValidElement(child) ? cloneElement(child, { width, height }) : null}
        </div>
    );
}
