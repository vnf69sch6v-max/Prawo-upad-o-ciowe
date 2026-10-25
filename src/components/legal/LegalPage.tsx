import Link from 'next/link';
import type { ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { LEGAL_VERSION_DATE } from '@/lib/legal';

/** Wspólny układ dokumentów prawnych: bez powłoki aplikacji, czytelna typografia, linki między dokumentami. */
export function LegalPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-mk-bg px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
            <div className="mx-auto max-w-[760px]">
                <Link href="/start" className="mb-8 inline-flex min-h-11 items-center gap-2 font-extrabold tracking-tight text-mk-text">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mk-primary text-white">
                        <BarChart3 size={18} strokeWidth={2.4} aria-hidden />
                    </span>
                    Savori
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight text-mk-text sm:text-4xl">{title}</h1>
                <p className="mt-3 text-base text-mk-muted">{lead}</p>
                <p className="mt-2 text-sm text-mk-faint">Obowiązuje od {LEGAL_VERSION_DATE}.</p>
                <article className="legal mt-8 space-y-8 text-[15px] leading-7 text-mk-text-soft">{children}</article>
                <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-mk-border pt-6 text-sm">
                    <Link href="/start" className="min-h-11 py-2.5 text-mk-muted hover:text-mk-text">Strona główna</Link>
                    <Link href="/regulamin" className="min-h-11 py-2.5 text-mk-muted hover:text-mk-text">Regulamin</Link>
                    <Link href="/prywatnosc" className="min-h-11 py-2.5 text-mk-muted hover:text-mk-text">Prywatność i dane</Link>
                </nav>
            </div>
        </div>
    );
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="scroll-mt-6">
            <h2 className="mb-3 text-xl font-bold tracking-tight text-mk-text">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
