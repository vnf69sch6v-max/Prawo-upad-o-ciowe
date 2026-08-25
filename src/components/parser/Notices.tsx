"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

/**
 * Lekki system powiadomień parsera. Savori nie ma globalnych toastów, więc
 * zamiast dokładać zależność (`sonner`) trzymamy własny, kilkudziesięciolinijkowy
 * stos komunikatów w stylu jasnego motywu.
 */

type Kind = "success" | "error";
interface Notice {
  id: number;
  kind: Kind;
  text: string;
}

interface NoticeCtx {
  notify: (kind: Kind, text: string) => void;
}

const Ctx = React.createContext<NoticeCtx | null>(null);

const TTL_MS = 6000;

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Notice[]>([]);
  const seq = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = React.useCallback(
    (kind: Kind, text: string) => {
      const id = ++seq.current;
      setItems((prev) => [...prev.slice(-3), { id, kind, text }]);
      window.setTimeout(() => dismiss(id), TTL_MS);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5"
        role="status"
        aria-live="polite"
      >
        {items.map((n) => (
          <div
            key={n.id}
            className="mk-card mk-fade-in pointer-events-auto flex max-w-sm items-start gap-2 px-3 py-2 text-[13px]"
          >
            {n.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mk-positive" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mk-warn" aria-hidden />
            )}
            <span className="min-w-0 flex-1 text-mk-text">{n.text}</span>
            <button
              type="button"
              onClick={() => dismiss(n.id)}
              className="shrink-0 text-mk-faint transition-colors hover:text-mk-text"
              aria-label="Zamknij powiadomienie"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useNotify(): NoticeCtx["notify"] {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useNotify musi być użyty wewnątrz NoticeProvider");
  return ctx.notify;
}
