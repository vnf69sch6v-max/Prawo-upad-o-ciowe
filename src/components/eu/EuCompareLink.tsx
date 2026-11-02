import Link from 'next/link';
import { ArrowRight, Globe2 } from 'lucide-react';

/** Jedna linia na /ceny: wejście do porównania inflacji HICP z UE (`/ceny/na-tle-ue`). */
export function EuCompareLink() {
    return (
        <Link
            href="/ceny/na-tle-ue"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mk-primary hover:text-mk-primary-strong"
        >
            <Globe2 size={16} aria-hidden /> Polska na tle UE <ArrowRight size={15} aria-hidden />
        </Link>
    );
}
