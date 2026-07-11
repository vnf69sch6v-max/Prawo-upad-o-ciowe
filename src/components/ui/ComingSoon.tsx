import Link from 'next/link';
import { Hammer, ArrowRight, type LucideIcon } from 'lucide-react';

interface OldLink { href: string; label: string }

interface ComingSoonProps {
    title: string;
    subtitle?: string;
    description: string;
    phase?: string;
    links?: OldLink[];
    icon?: LucideIcon;
}

/** Placeholder for routes that land in later phases. Links to legacy pages so data stays reachable. */
export function ComingSoon({ title, subtitle, description, phase, links, icon: Icon = Hammer }: ComingSoonProps) {
    return (
        <div className="mk-fade-in">
            <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-mk-muted">{subtitle}</p>}
            <div className="mk-card mk-card-pad mt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mk-primary-soft text-mk-primary">
                        <Icon size={26} />
                    </span>
                    <h2 className="mk-section-title">Moduł w budowie</h2>
                    <p className="mt-2 max-w-md text-sm text-mk-muted">{description}</p>
                    {phase && <span className="mt-4 rounded-full bg-mk-surface-alt px-3 py-1 text-xs font-semibold text-mk-muted">{phase}</span>}
                    {links?.length ? (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {links.map((l) => (
                                <Link key={l.href} href={l.href} className="mk-btn">
                                    {l.label} <ArrowRight size={15} />
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
