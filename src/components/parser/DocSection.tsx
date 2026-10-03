import type { ReactNode } from "react";

/**
 * Sekcja dokumentu: tytuł oddzielony grubą linią, po prawej jednostka albo
 * okres. Bez karty — w układzie dokumentu to typografia buduje hierarchię,
 * nie ramki. `scroll-mt` odsuwa cel skoku spod przyklejonego nagłówka.
 */
export function DocSection({
  id,
  title,
  aside,
  children,
  className = "",
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-32 lg:scroll-mt-[var(--mk-sticky-top)] ${className}`}>
      {/* Telefon: długi dopisek („PLN · jednostki (jak w raporcie)") schodzi pod tytuł zamiast
          ściskać go do trzech linii i wypychać stronę w bok. */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-mk-text pb-2.5">
        <h2 className="min-w-0 text-[20px] font-bold leading-tight tracking-[-0.01em] text-mk-text">{title}</h2>
        {aside && (
          <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-mk-muted sm:shrink-0">
            {aside}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
