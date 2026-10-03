"use client";

import * as React from "react";
import { scrollChildInline } from "@/lib/tab-scroll";
import { useHideOnScroll } from "@/lib/use-hide-on-scroll";
import { useScrollFade } from "@/lib/use-scroll-fade";

export interface TocSection {
  id: string;
  label: string;
}

/** Wysokość mobilnego nagłówka aplikacji (jeden rząd, `h-14`) — pasek spisu treści staje pod nim. */
const MOBILE_HEADER = "calc(3.5rem + env(safe-area-inset-top, 0px))";
const MOBILE_HEADER_PX = 56;
/** Wysokość paska spisu treści na telefonie (chip 44 px + 2×6 px). */
const BAR_PX = 56;

/**
 * Offset pod przyklejonym nagłówkiem od `lg` — `--mk-sticky-top` z globals.css (120 px w lg–xl, gdzie
 * nagłówek ma dwa rzędy, 80 px od xl). `fallback`, gdy zmiennej nie ma.
 */
function stickyTop(fallback: number): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mk-sticky-top"));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * Sekcja aktywna = ta, której góra wjechała pod nagłówek i jeszcze nie wyjechała górą.
 * `topOffset === null` → offset z `--mk-sticky-top` (wariant desktopowy).
 */
function useActiveSection(sections: TocSection[], topOffset: number | null, fallback = 84) {
  const [active, setActive] = React.useState<string | null>(sections[0]?.id ?? null);

  React.useEffect(() => {
    if (sections.length === 0) return;
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // Asymetryczny margines: aktywna jest sekcja w górnych ~30% ekranu.
    const top = topOffset ?? stickyTop(fallback);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: `-${top}px 0px -70% 0px`, threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, topOffset, fallback]);

  return [active, setActive] as const;
}

/**
 * Spis treści raportu. Sekcje bez danych w ogóle tu nie trafiają (raporty różnią się
 * zawartością), więc lista jest obietnicą, nie menu.
 *
 * - `rail` (desktop): pionowa lista przyklejona do lewej krawędzi, z pozycją aktywną
 *   wędrującą za czytelnikiem.
 * - `bar` (telefon/tablet, < lg): jeden przyklejony rząd chipów 44 px pod nagłówkiem — zajmuje
 *   56 px zamiast pół ekranu, przewija się w bok, aktywny chip zostaje w kadrze. Gdy nagłówek
 *   aplikacji chowa się przy czytaniu, pasek wjeżdża na samą górę.
 */
export function DocumentToc({
  sections,
  /** Offset awaryjny dla scroll-spy i skoków, gdy brak `--mk-sticky-top`. */
  headerOffset = 84,
  variant = "rail",
}: {
  sections: TocSection[];
  headerOffset?: number;
  variant?: "rail" | "bar";
}) {
  if (variant === "bar") return <TocBar sections={sections} />;
  return <TocRail sections={sections} headerOffset={headerOffset} />;
}

function TocRail({ sections, headerOffset }: { sections: TocSection[]; headerOffset: number }) {
  const [active, setActive] = useActiveSection(sections, null, headerOffset);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyTop(headerOffset);
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

function TocBar({ sections }: { sections: TocSection[] }) {
  const headerHidden = useHideOnScroll();
  const [active, setActive] = useActiveSection(sections, MOBILE_HEADER_PX + BAR_PX);
  const scroller = React.useRef<HTMLDivElement>(null);
  const fade = useScrollFade(scroller);

  React.useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>('[aria-current="true"]');
    if (box && el) scrollChildInline(box, el);
  }, [active]);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elTop = el.getBoundingClientRect().top + window.scrollY;
    // W dół nagłówek się chowa (zostaje sam pasek), w górę wraca — offset zależy od kierunku.
    const down = elTop > window.scrollY;
    const offset = BAR_PX + (down ? 0 : MOBILE_HEADER_PX) + 8;
    window.scrollTo({ top: elTop - offset, behavior: reduce ? "auto" : "smooth" });
    setActive(id);
  };

  return (
    <nav
      aria-label="Spis treści raportu"
      className="sticky z-30 -mx-4 mb-3 border-b border-rp-hairline bg-rp-surface/95 px-4 backdrop-blur transition-[top] duration-200 ease-out motion-reduce:transition-none md:-mx-6 md:px-6 lg:hidden"
      style={{ top: headerHidden ? "env(safe-area-inset-top, 0px)" : MOBILE_HEADER }}
    >
      <div
        ref={scroller}
        data-fade={fade}
        className="mk-fade-x -mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => jump(e, s.id)}
              aria-current={on ? "true" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm transition-colors [-webkit-tap-highlight-color:transparent] ${
                on
                  ? "bg-mk-primary-soft font-semibold text-mk-primary"
                  : "font-medium text-mk-muted active:bg-mk-surface-alt"
              }`}
            >
              {s.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
