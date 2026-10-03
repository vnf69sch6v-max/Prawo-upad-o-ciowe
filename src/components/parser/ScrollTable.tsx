"use client";

import * as React from "react";
import { useScrollFade } from "@/lib/use-scroll-fade";
import { cn } from "@/lib/utils/cn";

/**
 * Opakowanie tabel parsera szerszych niż ekran telefonu: przewijają się we własnym kontenerze
 * (nigdy cała strona), pierwsza kolumna jest przyklejona (`sticky left-0` na komórkach), a prawa
 * krawędź jest wygaszona, dopóki za nią są kolejne okresy. Lewej krawędzi nie wygaszamy — tam
 * stoi przyklejona kolumna z nazwą pozycji, maska zjadłaby jej początek.
 */
export function ScrollTable({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fade = useScrollFade(ref);
  const end = fade === "end" || fade === "both";
  return (
    <div
      ref={ref}
      data-fade={end ? "end" : "none"}
      className={cn("mk-table-wrap mk-fade-x overscroll-x-contain", className)}
    >
      {children}
    </div>
  );
}
