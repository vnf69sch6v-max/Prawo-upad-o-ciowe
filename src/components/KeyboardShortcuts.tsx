'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SHORTCUTS: Record<string, string> = {
    F1: '/',
    F2: '/fx',
    F3: '/market',
    F4: '/macro',
    F5: '/rates',
    F6: '/trade',
};

export function KeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            // Don't intercept if user is typing in an input
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                return;
            }

            const route = SHORTCUTS[e.key];
            if (route) {
                e.preventDefault();
                router.push(route);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return null; // No UI — just keyboard listener
}
