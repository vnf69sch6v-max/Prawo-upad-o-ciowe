'use client';

// Wzorce układu stron makro na telefonie (Ceny, Gospodarka, Rynek pracy, Regiony, Prognozy).
// Wszystko działa poniżej `lg` (1024 px — tam, gdzie nagłówek chowa się przy przewijaniu,
// a dolną krawędź zajmuje pasek zakładek). Od `lg` komponenty znikają albo przepuszczają treść
// bez zmian, więc desktop wygląda jak wcześniej. Przełączanie wyłącznie klasami CSS (bez
// matchMedia w renderze) — strony są prerenderowane i nie mogą różnić się od hydratacji.

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { scrollChildInline } from '@/lib/tab-scroll';

/** Pełna szerokość rzędu pod nagłówkiem: wychodzimy poza padding `<main>` (px-4 / md:px-6). */
const STICKY_ROW =
    'sticky top-0 z-30 -mx-4 border-b border-mk-border bg-mk-bg/95 px-4 backdrop-blur-sm md:-mx-6 md:px-6 lg:hidden';

const PILL =
    'inline-flex min-h-11 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-100 [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-primary';
const PILL_ON = 'bg-mk-primary-soft text-mk-primary ring-1 ring-inset ring-mk-primary/25';
const PILL_OFF = 'text-mk-muted hover:bg-mk-surface-alt hover:text-mk-text active:bg-mk-border';

/** Przewijany poziomo rząd z wygaszoną krawędzią, gdy po prawej jest jeszcze coś do zobaczenia. */
function ScrollRow({
    children,
    activeKey,
    role,
    ariaLabel,
    className = '',
}: {
    children: ReactNode;
    activeKey: string | null;
    role?: 'tablist';
    ariaLabel: string;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [fade, setFade] = useState({ left: false, right: false });

    const update = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const left = el.scrollLeft > 4;
        const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
        setFade((f) => (f.left === left && f.right === right ? f : { left, right }));
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        el.addEventListener('scroll', update, { passive: true });
        return () => {
            ro.disconnect();
            el.removeEventListener('scroll', update);
        };
    }, [update]);

    // Aktywny element zawsze w kadrze — przewijamy tylko rząd, nie okno (scrollIntoView szarpie stroną).
    useEffect(() => {
        const el = ref.current;
        const active = el?.querySelector<HTMLElement>('[data-active="true"]');
        if (el && active) scrollChildInline(el, active);
    }, [activeKey]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={ref}
                role={role}
                aria-label={ariaLabel}
                className="flex gap-2 overflow-x-auto overscroll-x-contain py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-mk-bg to-transparent transition-opacity ${fade.left ? 'opacity-100' : 'opacity-0'}`}
            />
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-mk-bg to-transparent transition-opacity ${fade.right ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}

/**
 * Zakładki strony na telefonie: przyklejony (`sticky top-0` — nagłówek chowa się przy przewijaniu
 * w dół) przewijany rząd pigułek ≥44 px. Na desktopie (`lg`) zostaje dotychczasowy `Segmented`
 * w nagłówku strony; ten rząd jest wtedy ukryty. `sticky={false}` — ten sam rząd jako zwykły
 * przełącznik widoku w treści (np. PKB / Ludność na /regiony).
 */
export function MobileTabs<T extends string>({
    value,
    onChange,
    options,
    ariaLabel,
    sticky = true,
    className = '',
}: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
    ariaLabel: string;
    sticky?: boolean;
    className?: string;
}) {
    const move = (dir: 1 | -1) => {
        const i = options.findIndex((o) => o.value === value);
        const next = options[Math.min(options.length - 1, Math.max(0, i + dir))];
        if (next) onChange(next.value);
    };
    return (
        <div
            className={`${sticky ? STICKY_ROW : 'lg:hidden'} ${className}`}
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
            }}
        >
            <ScrollRow activeKey={value} role="tablist" ariaLabel={ariaLabel}>
                {options.map((o) => {
                    const on = o.value === value;
                    return (
                        <button
                            key={o.value}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            tabIndex={on ? 0 : -1}
                            data-active={on}
                            onClick={() => onChange(o.value)}
                            className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}
                        >
                            {o.label}
                        </button>
                    );
                })}
            </ScrollRow>
        </div>
    );
}

/**
 * Spis treści długiej strony na telefonie: przyklejony rząd kotwic z podświetleniem sekcji, która
 * jest właśnie na ekranie. Cele muszą mieć `id` i `scroll-mt-16` (rząd ma ~57 px).
 */
export function MobileAnchorNav({ items, ariaLabel }: { items: { id: string; label: string }[]; ariaLabel: string }) {
    const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
    // Po stuknięciu kotwicy trzymamy jej podświetlenie, aż skończy się płynne przewijanie.
    const lockUntil = useRef(0);

    useEffect(() => {
        let frame = 0;
        const measure = () => {
            frame = 0;
            if (performance.now() < lockUntil.current) return;
            // Aktywna = ostatnia sekcja, której górna krawędź minęła rząd kotwic (+ zapas).
            let current: string | null = items[0]?.id ?? null;
            for (const i of items) {
                const el = document.getElementById(i.id);
                if (!el || !el.offsetParent) continue;
                if (el.getBoundingClientRect().top <= 120) current = i.id;
            }
            setActive((a) => (a === current ? a : current));
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [items]);

    const go = (e: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        lockUntil.current = e.timeStamp + (reduce ? 100 : 900); // timeStamp i performance.now() mają ten sam zegar
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
        setActive(id);
    };

    return (
        <nav className={STICKY_ROW} aria-label={ariaLabel}>
            <ScrollRow activeKey={active} ariaLabel={ariaLabel}>
                {items.map((i) => {
                    const on = i.id === active;
                    return (
                        <a
                            key={i.id}
                            href={`#${i.id}`}
                            data-active={on}
                            aria-current={on ? 'location' : undefined}
                            onClick={(e) => go(e, i.id)}
                            className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}
                        >
                            {i.label}
                        </a>
                    );
                })}
            </ScrollRow>
        </nav>
    );
}

const MORE_BTN =
    'flex min-h-12 w-full py-2 items-center justify-center gap-2 rounded-[14px] border border-mk-border bg-mk-surface px-4 text-sm font-semibold text-mk-text transition-colors duration-100 [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt active:bg-mk-border lg:hidden';

/**
 * Sekcje drugorzędne: na telefonie zwinięte za przyciskiem „Pokaż więcej", od `lg` zawsze widoczne
 * (przycisk znika). Treść jest zamontowana od początku — wykresy mierzą szerokość po rozwinięciu
 * (ResizeObserver), więc nie ma „pustej karty".
 */
export function MobileMore({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <div className="space-y-4 lg:space-y-5">
            <button type="button" className={MORE_BTN} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
                <span className="min-w-0 text-center">
                    <span className="block">{open ? 'Zwiń' : label}</span>
                    {hint && !open && <span className="block truncate text-xs font-medium text-mk-muted">{hint}</span>}
                </span>
                <ChevronDown size={16} aria-hidden className={`shrink-0 text-mk-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <div id={id} className={`space-y-4 lg:space-y-5 ${open ? '' : 'max-lg:hidden'}`}>
                {children}
            </div>
        </div>
    );
}

/**
 * Długa lista (ranking 16 województw, kontrybucje 13 działów): na telefonie pierwsze 5 pozycji
 * (`<li>`) i przycisk „Pokaż wszystkie", od `lg` pełna lista.
 */
export function MobileListClamp({ total, children, noun = 'pozycje' }: { total: number; children: ReactNode; noun?: string }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    const clamp = total > 5;
    return (
        <div>
            <div id={id} className={clamp && !open ? 'max-lg:[&_li:nth-child(n+6)]:hidden' : ''}>{children}</div>
            {clamp && (
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={id}
                    onClick={() => setOpen((o) => !o)}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-mk-primary transition-colors duration-100 [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt active:bg-mk-surface-alt lg:hidden"
                >
                    {open ? 'Pokaż mniej' : `Pokaż wszystkie ${noun} (${total})`}
                    <ChevronDown size={15} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            )}
        </div>
    );
}

/** Ten sam blok tylko na telefonie (`lg:hidden`) — np. newsy przeniesione na koniec strony. */
export function MobileOnly({ children, id, className = '' }: { children: ReactNode; id?: string; className?: string }) {
    return <div id={id} className={`scroll-mt-16 lg:hidden ${className}`}>{children}</div>;
}
