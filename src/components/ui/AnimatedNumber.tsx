'use client';

// Count-up sformatowanej liczby (styl Stripe/Mercury) — parsuje polski string („3,1", „-0,3",
// „1 953,45", „5,0994"), animuje 0→wartość (lub przy zmianie danych: stara→nowa) i formatuje
// z powrotem tak samo (spacja=tysiące, przecinek=dziesiętne). Szanuje prefers-reduced-motion.
import { useEffect, useRef, useState } from 'react';

interface Parsed { num: number; decimals: number; grouping: boolean; forceSign: boolean }

function parsePL(s: string): Parsed | null {
    const t = s.trim();
    if (!/^[+-]?\d[\d ]*(,\d+)?$/.test(t)) return null;              // czyste liczby PL, opcjonalny +/−
    const neg = t.startsWith('-');
    const [intPart, fracPart] = t.replace(/^[+-]/, '').split(',');
    const num = (neg ? -1 : 1) * parseFloat(intPart.replace(/ /g, '') + (fracPart ? `.${fracPart}` : ''));
    if (!Number.isFinite(num)) return null;
    return { num, decimals: fracPart ? fracPart.length : 0, grouping: intPart.includes(' '), forceSign: t.startsWith('+') };
}

function fmtPL(n: number, decimals: number, grouping: boolean, forceSign: boolean): string {
    const neg = n < 0;
    const s = Math.abs(n).toFixed(decimals);
    const [i, f] = s.split('.');
    const ig = grouping ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : i;
    const sign = neg ? '-' : forceSign ? '+' : '';
    return `${sign}${ig}${f ? `,${f}` : ''}`;
}

export function AnimatedNumber({ value, duration = 650 }: { value: string; duration?: number }) {
    const parsed = parsePL(value);
    const target = parsed?.num ?? 0;
    const decimals = parsed?.decimals ?? 0;
    const grouping = parsed?.grouping ?? false;
    const forceSign = parsed?.forceSign ?? false;
    const ok = !!parsed;

    const [val, setVal] = useState(0);
    const fromRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!ok) return;
        const from = fromRef.current;
        if (from === target) return;
        const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const dur = reduced ? 0 : duration;
        let start: number | null = null;                             // start z pierwszej klatki rAF (bez performance.now)
        const step = (now: number) => {
            if (start === null) start = now;
            const t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);                     // easeOutCubic — pewne wyhamowanie
            setVal(from + (target - from) * eased);                  // w callbacku rAF, nie w ciele efektu
            if (t < 1) rafRef.current = requestAnimationFrame(step);
            else fromRef.current = target;
        };
        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, ok, duration]);

    if (!ok) return <>{value}</>;
    return <span className="tabular-nums">{fmtPL(val, decimals, grouping, forceSign)}</span>;
}
