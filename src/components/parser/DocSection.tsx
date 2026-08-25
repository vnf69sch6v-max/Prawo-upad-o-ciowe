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
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <header className="flex items-baseline justify-between gap-4 border-b-2 border-mk-text pb-2.5">
        <h2 className="text-[20px] font-bold leading-tight tracking-[-0.01em] text-mk-text">{title}</h2>
        {aside && (
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-mk-muted">
            {aside}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
