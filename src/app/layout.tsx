import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ShellFrame } from "@/components/shell/ShellFrame";

export const metadata: Metadata = {
  title: "Savori — dane makro, rynkowe i newsy z Polski",
  description:
    "Platforma danych o polskiej gospodarce — inflacja, PKB, rynek pracy, stopy procentowe, giełda, spółki, regiony i newsy finansowe aktualizowane na bieżąco.",
  keywords: ["polska", "makroekonomia", "dashboard", "GUS", "NBP", "inflacja", "PKB", "CPI", "koszyk inflacyjny", "giełda", "WIG20", "spółki", "regiony", "newsy finansowe"],
  openGraph: {
    title: "Savori — dane makro, rynkowe i newsy z Polski",
    description:
      "Platforma danych o polskiej gospodarce — inflacja, PKB, rynek pracy, stopy procentowe, giełda, spółki, regiony i newsy finansowe aktualizowane na bieżąco.",
    locale: "pl_PL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F8FA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <ShellFrame>{children}</ShellFrame>
        </Providers>
      </body>
    </html>
  );
}
