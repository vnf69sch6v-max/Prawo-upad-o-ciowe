import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parser raportów — Savori",
  description:
    "Regułowa ekstrakcja metryk finansowych z raportów kwartalnych i rocznych (10-Q, 10-K, GPW, NewConnect). Analiza w przeglądarce — plik nie opuszcza urządzenia; bez modeli językowych.",
};

export default function ParserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
