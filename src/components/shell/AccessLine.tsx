'use client';

import Link from 'next/link';
import { useAccess } from '@/lib/auth/use-auth';

/** Cennik — ten sam adres w menu, arkuszu i ustawieniach. */
export const RENEW_HREF = '/start#cennik';

type AccessLineModel = {
    text: string;
    /** Kolor etykiety: ostrzeżenie poniżej 48 h, negatyw po wygaśnięciu, inaczej stonowany. */
    tone: string;
    /** Aktywny albo wygasły — da się przedłużyć. Administrator nie. */
    renew: boolean;
};

/** Czysta mapa stanu → wiersz. `unknown` / `none` → `null` (SSR, hydratacja, demo, brak sesji). */
export function accessLineModel(access: {
    state: 'unknown' | 'none' | 'active' | 'expired' | 'admin';
    label: string | null;
    endsSoon: boolean;
}): AccessLineModel | null {
    const { state, label, endsSoon } = access;
    if (state === 'unknown' || state === 'none') return null;
    if (state === 'admin') {
        return label ? { text: label, tone: 'text-mk-muted', renew: false } : null;
    }
    const text = label ?? (state === 'expired' ? 'Dostęp wygasł' : null);
    if (!text) return null;
    const tone = state === 'expired' ? 'text-mk-negative' : endsSoon ? 'text-mk-warn' : 'text-mk-muted';
    return { text, tone, renew: true };
}

/** Wiersz pod e-mailem. Zegar wstaje po hydratacji, więc pierwsza klatka jest pusta. */
export function useAccessLine(): AccessLineModel | null {
    return accessLineModel(useAccess());
}

/**
 * Etykieta pod e-mailem. `link` dokłada krótkie „Przedłuż” (menu). Ustawienia mają
 * zamiast tego osobny przycisk — tu zostaje sam tekst.
 */
export function AccessLine({
    link = false,
    onNavigate,
    className = '',
}: {
    link?: boolean;
    onNavigate?: () => void;
    className?: string;
}) {
    const line = useAccessLine();
    if (!line) return null;
    return (
        <p className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 ${className}`}>
            <span className={`min-w-0 ${line.tone}`}>{line.text}</span>
            {link && line.renew && (
                <Link
                    href={RENEW_HREF}
                    onClick={onNavigate}
                    className="inline-flex min-h-6 shrink-0 items-center font-semibold text-mk-brand underline underline-offset-2 hover:text-mk-brand-strong touch:-my-2.5 touch:min-h-11"
                >
                    Przedłuż
                </Link>
            )}
        </p>
    );
}
