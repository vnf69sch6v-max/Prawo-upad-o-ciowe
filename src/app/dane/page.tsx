import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

const SECTIONS = [
    { label: 'Ceny', href: '/ceny', note: 'Inflacja CPI, PPI, nieruchomości, budownictwo, rolnictwo' },
    { label: 'Gospodarka', href: '/gospodarka', note: 'PKB, aktywność, koniunktura, finanse publiczne' },
    { label: 'Rynek pracy', href: '/praca', note: 'Bezrobocie, zatrudnienie, płace, BAEL' },
];

export default function DanePage() {
    return (
        <div className="mk-fade-in space-y-6">
            <PageHeader
                eyebrow={<PageEyebrow section="Dane makro" />}
                title="Dane makro"
                subtitle="Wskaźniki makroekonomiczne podzielone na dedykowane sekcje tematyczne"
            />

            <div className="mk-card mk-card-editorial mk-card-pad">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mk-brand-soft text-mk-brand">
                        <BarChart3 size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="mk-section-label">Wybierz sekcję</h2>
                        <p className="mt-2 text-sm leading-relaxed text-mk-text-soft">
                            Dawna zakładka „Dane makro" została podzielona na Ceny, Gospodarkę i Rynek pracy — każda z własnymi wskaźnikami i wykresami.
                        </p>
                        <ul className="mt-4 divide-y divide-mk-border border-t border-mk-border">
                            {SECTIONS.map((s) => (
                                <li key={s.href}>
                                    <Link
                                        href={s.href}
                                        className="group flex items-center justify-between gap-3 py-3 transition-colors first:pt-4"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-mk-text transition-colors group-hover:text-mk-brand">{s.label}</div>
                                            <div className="text-xs text-mk-muted">{s.note}</div>
                                        </div>
                                        <ArrowRight size={16} className="shrink-0 text-mk-faint transition-colors group-hover:text-mk-brand" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
