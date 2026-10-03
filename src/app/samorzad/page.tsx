import Link from 'next/link';
import { ArrowRight, Landmark } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SamorzadPage() {
    return (
        <div className="mk-fade-in space-y-6">
            <PageHeader title="Samorząd" />

            <div className="mk-card mk-card-editorial mk-card-pad max-w-xl">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mk-brand-soft text-mk-brand">
                        <Landmark size={20} />
                    </span>
                    <div>
                        <h2 className="mk-section-label">Dane o województwach są w Regionach</h2>
                        <p className="mt-2 text-sm leading-relaxed text-mk-text-soft">
                            Dane samorządowe (SMUP) nie są obecnie prezentowane w serwisie. PKB, ludność i rynek pracy
                            w podziale na województwa znajdziesz w zakładce Regiony.
                        </p>
                        <Link
                            href="/regiony"
                            className="mk-btn mk-btn-primary mt-4 inline-flex min-h-11 items-center gap-1.5 bg-mk-brand hover:bg-mk-brand-strong active:bg-mk-brand-strong"
                        >
                            Otwórz Regiony <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
