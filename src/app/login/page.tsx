'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { LoginPanel } from '@/components/auth/LoginPanel';

export default function LoginPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-mk-bg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            style={{ backgroundImage: 'radial-gradient(60% 50% at 50% 0%, #EEF3FF 0%, transparent 70%)' }}>
            <div className="w-full max-w-[400px]">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mk-primary text-white shadow-md">
                        <BarChart3 size={26} strokeWidth={2.4} />
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-mk-text">Savori</h1>
                    <p className="mt-1 text-sm text-mk-muted">Zaloguj się do platformy</p>
                </div>

                <LoginPanel />

                <p className="mt-5 text-center text-xs leading-relaxed text-mk-faint">
                    Logując się, akceptujesz <Link href="/regulamin" className="underline underline-offset-2">regulamin</Link>.
                    Jak przetwarzamy dane: <Link href="/prywatnosc" className="underline underline-offset-2">prywatność</Link>. © 2026 Savori
                </p>
            </div>
        </div>
    );
}
