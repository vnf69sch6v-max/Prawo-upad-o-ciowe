'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { useIsClient } from '@/lib/use-is-client';
import { PLANS, monthlyPrice, savingsPct } from '@/lib/access';

const scrollToLogin = () => document.getElementById('logowanie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Główne wezwanie: zalogowany → platforma, reszta → sekcja logowania. */
export function StartCta({ label, className }: { label: string; className: string }) {
    const { user, enabled, loading } = useAuth();
    if (enabled && !loading && user) {
        return <Link href="/" className={className}>Przejdź do platformy</Link>;
    }
    return <button type="button" onClick={scrollToLogin} className={className}>{label}</button>;
}

/** Komunikat po przekierowaniu z bramki (`?dostep=wygasl`) — dopiero po hydratacji (strona jest ISR). */
export function AccessNotice() {
    const isClient = useIsClient();
    if (!isClient || new URLSearchParams(window.location.search).get('dostep') !== 'wygasl') return null;
    return (
        <div role="status" className="mx-auto mb-8 max-w-2xl rounded-2xl border border-mk-primary/30 bg-mk-primary-soft px-5 py-4 text-center text-sm font-medium text-mk-primary-strong">
            Twój dostęp wygasł. Wybierz plan poniżej, żeby wrócić do platformy — dane czekają.
        </div>
    );
}

const PLAN_FEATURES = [
    'Wszystkie wskaźniki Polski i Japonii',
    'Przegląd dnia z wnioskiem w jednym zdaniu',
    'Rynki, kursy NBP, WIG20, newsy',
    'Parser sprawozdań finansowych',
    'Bez reklam i bez śledzenia',
    'Bez automatycznego odnawiania',
];

const pln = (n: number) => `${n.toFixed(2).replace('.', ',').replace(',00', '')} zł`;
const period = (m: number) => (m === 1 ? 'za miesiąc' : m < 5 ? `za ${m} miesiące` : `za ${m} miesięcy`);

export function PricingCards({ ctaLabel }: { ctaLabel: string }) {
    return (
        <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
            {PLANS.map((p) => {
                const featured = p.id === 'm3';
                const save = savingsPct(p);
                return (
                    <div key={p.id}
                        className={`relative flex flex-col rounded-3xl border bg-white p-6 sm:p-7 ${featured
                            ? 'border-mk-primary shadow-[0_20px_60px_-20px_rgba(220,38,38,0.45)] ring-1 ring-mk-primary md:-my-3 md:py-9'
                            : 'border-mk-border shadow-sm'}`}>
                        {p.badge && (
                            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${featured ? 'bg-mk-primary text-white' : 'bg-mk-text text-white'}`}>
                                {p.badge}
                            </span>
                        )}
                        <h3 className="text-lg font-bold text-mk-text">{p.name}</h3>
                        <div className="mt-4 flex items-baseline gap-1.5">
                            <span className="text-5xl font-extrabold tracking-tight text-mk-text">{p.pricePln}</span>
                            <span className="text-lg font-semibold text-mk-text">zł</span>
                            <span className="ml-1 text-sm text-mk-muted">{period(p.months)}</span>
                        </div>
                        <p className="mt-2 h-5 text-sm text-mk-muted">
                            {p.months > 1 ? <>{pln(monthlyPrice(p))} / mies. · <span className="font-semibold text-emerald-600">oszczędzasz {save}%</span></> : 'Sprawdź bez zobowiązań'}
                        </p>
                        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-mk-text-soft">
                            {PLAN_FEATURES.map((f) => (
                                <li key={f} className="flex gap-2.5"><Check size={18} className="mt-px shrink-0 text-mk-primary" aria-hidden />{f}</li>
                            ))}
                        </ul>
                        <StartCta label={ctaLabel}
                            className={`mk-btn mt-7 min-h-12 w-full text-base font-semibold ${featured ? 'mk-btn-primary' : ''}`} />
                    </div>
                );
            })}
        </div>
    );
}
