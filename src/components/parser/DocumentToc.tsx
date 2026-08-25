"use client";

import * as React from "react";

export interface TocSection {
  id: string;
  label: string;
}

/**
 * Spis treści raportu — przyklejony do lewej krawędzi, z pozycją aktywną
 * wędrującą za czytelnikiem. Sekcje bez danych w ogóle tu nie trafiają
 * (raporty różnią się zawartością), więc lista jest obietnicą, nie menu.
 */
export function DocumentToc({
  sections,
  /** Wysokość przyklejonego nagłówka aplikacji — offset dla scroll-spy i skoków. */
  headerOffset = 84,
}: {
  sections: TocSection[];
  headerOffset?: number;
}) {
  const [active, setActive] = React.useState<string | null>(sections[0]?.id ?? null);

  React.useEffect(() => {
    if (sections.length === 0) return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // Sekcja staje się aktywna, gdy jej góra wjedzie pod nagłówek i zanim
    // wyjedzie górą — stąd asymetryczny margines.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: `-${headerOffset}px 0px -70% 0px`, threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, headerOffset]);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    setActive(id);
  };

  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === active));

  return (
    <nav aria-label="Spis treści raportu">
      <p className="mb-3 pl-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-mk-muted">
        W tym raporcie
      </p>

      <div className="relative">
        {/* Wskaźnik aktywnej sekcji — jedzie skokiem o wysokość pozycji. */}
        <span
          aria-hidden
          className="absolute left-0 top-0 w-[3px] rounded-sm bg-mk-primary transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ height: 44, transform: `translateY(${activeIndex * 46}px)` }}
        />

        <ul className="flex list-none flex-col gap-0.5 p-0">
          {sections.map((s) => {
            const on = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => jump(e, s.id)}
                  aria-current={on ? "true" : undefined}
                  className={`flex min-h-[44px] items-center rounded-[10px] px-3.5 py-[11px] text-[15px] transition-colors ${
                    on
                      ? "bg-mk-primary-soft font-semibold text-mk-primary"
                      : "font-medium text-mk-muted hover:bg-mk-surface-alt hover:text-mk-text"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
