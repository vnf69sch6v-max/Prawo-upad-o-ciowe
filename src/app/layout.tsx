import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ShellFrame } from "@/components/shell/ShellFrame";

export const metadata: Metadata = {
  title: "Makro Data Platform — dane makroekonomiczne Polski",
  description:
    "Nowoczesna platforma danych makroekonomicznych dla Polski — inflacja, PKB, rynek pracy, stopy procentowe, rynki i prognozy aktualizowane na bieżąco.",
  keywords: ["polska", "makroekonomia", "dashboard", "GUS", "NBP", "inflacja", "PKB", "prognozy", "CPI", "koszyk inflacyjny"],
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
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
