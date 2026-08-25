import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parser raportów — Savori",
  description:
    "Regułowa ekstrakcja metryk finansowych z raportów okresowych (10-Q, 10-K, NewConnect). Parsowanie po stronie serwera, bez modeli językowych w runtime.",
};

export default function ParserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
