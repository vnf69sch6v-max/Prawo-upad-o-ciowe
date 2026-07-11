'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { SectionCard } from '@/components/ui/SectionCard';

const DATA_SOURCES = ['GUS BDL', 'NBP', 'Eurostat', 'Stooq', 'EIA', 'SMUP', 'SDP'];

export default function UstawieniaPage() {
    const { user, enabled, signOut } = useAuth();
    const router = useRouter();

    const onSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="mk-fade-in max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Ustawienia</h1>
                <p className="mt-1 text-sm text-mk-muted">Konto, motyw i źródła danych</p>
            </div>

            <SectionCard title="Konto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mk-primary-soft text-sm font-semibold text-mk-primary">
                            {user?.initials ?? 'MD'}
                        </span>
                        <div>
                            <div className="text-sm font-semibold text-mk-text">{user?.displayName ?? 'Użytkownik'}</div>
                            <div className="text-xs text-mk-muted">{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={onSignOut} className="mk-btn">
                        <LogOut size={15} /> {enabled ? 'Wyloguj' : 'Ekran logowania'}
                    </button>
                </div>
                {!enabled && (
                    <p className="mt-3 rounded-lg bg-mk-warn-soft px-3 py-2 text-xs text-mk-warn">
                        Tryb demo — logowanie aktywuje się po dodaniu konfiguracji Firebase i ustawieniu flagi <code>NEXT_PUBLIC_AUTH_ENABLED=true</code>.
                    </p>
                )}
            </SectionCard>

            <SectionCard title="Motyw">
                <div className="flex items-center gap-2">
                    <span className="mk-btn mk-btn-primary cursor-default"><Sun size={15} /> Jasny</span>
                    <span className="mk-btn cursor-not-allowed opacity-60"><Moon size={15} /> Ciemny (wkrótce)</span>
                </div>
            </SectionCard>

            <SectionCard title="Źródła danych">
                <div className="flex flex-wrap gap-2">
                    {DATA_SOURCES.map((s) => (
                        <span key={s} className="rounded-full border border-mk-border bg-mk-surface-alt px-3 py-1 text-xs font-medium text-mk-text-soft">{s}</span>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
