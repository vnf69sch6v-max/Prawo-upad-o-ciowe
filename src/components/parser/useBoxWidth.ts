"use client";

import * as React from "react";

/**
 * Szerokość kontenera w pikselach CSS (ResizeObserver). Wykresy SVG parsera rysują się w tej
 * szerokości 1:1 zamiast skalować stały `viewBox` 860 px — na telefonie skalowanie zmniejszało
 * podpisy do ~5 px. `fallback` obowiązuje do pierwszego pomiaru.
 */
export function useBoxWidth<T extends HTMLElement>(fallback: number) {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ResizeObserver woła callback od razu po `observe` — pierwszy pomiar bez setState w efekcie.
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width: width || fallback, measured: width > 0 };
}
