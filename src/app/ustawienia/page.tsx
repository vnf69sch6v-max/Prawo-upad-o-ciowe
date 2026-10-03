'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageHeader } from '@/components/ui/PageHeader';

const DATA_SOURCES = ['GUS BDL', 'NBP', 'Eurostat', 'Yahoo Finance', 'EIA', 'SMUP', 'SDP'];

export default function UstawieniaPage() {
    const { user, enabled, signOut } = useAuth();
    const router = useRouter();

    const onSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="mk-fade-in max-w-2xl space-y-6">
            <PageHeader title="Ustawienia" />

            <SectionCard title="Konto" titleVariant="label" editorial>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mk-brand-soft text-sm font-semibold text-mk-brand">
                            {user?.initials ?? 'MD'}
                        </span>
                        <div className="min-w-0">
                            <div className="truncate text-[15px] font-semibold text-mk-text sm:text-sm">{user?.displayName ?? 'Użytkownik'}</div>
                            <div className="truncate text-sm text-mk-muted sm:text-xs">{user?.email}</div>
                        </div>
                    </div>
                    <button type="button" onClick={onSignOut} className="mk-btn min-h-12 w-full active:bg-mk-surface-alt sm:min-h-11 sm:w-auto lg:min-h-0">
                        <LogOut size={15} /> {enabled ? 'Wyloguj' : 'Ekran logowania'}
                    </button>
                </div>
                {!enabled && (
                    <p className="mt-3 rounded-lg bg-mk-warn-soft px-3 py-2 text-sm text-mk-warn sm:text-xs">
                        Tryb demo — logowanie aktywuje się po dodaniu konfiguracji Firebase i ustawieniu flagi <code>NEXT_PUBLIC_AUTH_ENABLED=true</code>.
                    </p>
                )}
            </SectionCard>

            <SectionCard title="Motyw" titleVariant="label" editorial>
                {/* Stan, nie przełącznik — ciemny motyw jeszcze nie istnieje. Na telefonie dwa równe pola. */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center" role="group" aria-label="Motyw">
                    <span className="mk-btn mk-btn-primary min-h-12 cursor-default bg-mk-brand hover:bg-mk-brand sm:min-h-0" aria-current="true"><Sun size={15} aria-hidden /> Jasny</span>
                    <span className="mk-btn min-h-12 cursor-not-allowed opacity-60 sm:min-h-0" aria-disabled="true"><Moon size={15} aria-hidden /> Ciemny <span className="font-normal">(wkrótce)</span></span>
                </div>
            </SectionCard>

            <SectionCard title="Źródła danych" titleVariant="label" editorial>
                <div className="flex flex-wrap gap-2">
                    {DATA_SOURCES.map((s) => (
                        <span key={s} className="mk-tag-brand">{s}</span>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
