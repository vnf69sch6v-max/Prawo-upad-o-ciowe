'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Pułapka fokusu dla dialogów (⌘K, drawer): Tab krąży w kontenerze,
 * Escape wywołuje `onEscape`, a po zamknięciu wraca focus do elementu, który
 * otworzył warstwę.
 */
export function useFocusTrap(
    active: boolean,
    containerRef: RefObject<HTMLElement | null>,
    onEscape?: () => void,
) {
    const escapeRef = useRef(onEscape);
    escapeRef.current = onEscape;

    useEffect(() => {
        if (!active) return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const focusables = () => {
            const root = containerRef.current;
            if (!root) return [] as HTMLElement[];
            return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
            );
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                escapeRef.current?.();
                return;
            }
            if (e.key !== 'Tab') return;
            const items = focusables();
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;
            const root = containerRef.current;
            if (e.shiftKey) {
                if (current === first || !root?.contains(current)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (current === last || !root?.contains(current)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            previous?.focus?.();
        };
    }, [active, containerRef]);
}
