import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ShellFrame } from "@/components/shell/ShellFrame";

export const metadata: Metadata = {
  title: "Savori — dane makro, rynkowe i newsy z Polski",
  description:
    "Platforma danych o polskiej gospodarce — inflacja, PKB, rynek pracy, stopy procentowe, giełda, spółki, regiony i newsy finansowe aktualizowane na bieżąco.",
  keywords: ["polska", "makroekonomia", "dashboard", "GUS", "NBP", "inflacja", "PKB", "CPI", "koszyk inflacyjny", "giełda", "WIG20", "spółki", "regiony", "newsy finansowe"],
  applicationName: "Savori",
  // Instalacja na ekranie głównym (manifest: src/app/manifest.ts, ikony: src/app/icon.svg,
  // apple-icon.png, public/icons/*). Pasek statusu „default" = ciemny tekst na białym tle —
  // pasuje do białego nagłówka; „black-translucent" dałby biały tekst na białym nagłówku.
  appleWebApp: { capable: true, title: "Savori", statusBarStyle: "default" },
  // Next 16 emituje już tylko `mobile-web-app-capable`; iOS < 16.4 (bez obsługi `display` z manifestu)
  // otwiera aplikację z ekranu głównego jako pełny ekran wyłącznie z tym starszym tagiem.
  other: { "apple-mobile-web-app-capable": "yes" },
  // Serwis jest pełen liczb i dat („4 084", „02.10.2026") — iOS nie może ich zamieniać
  // w linki do dzwonienia / kalendarza.
  formatDetection: { telephone: false, date: false, address: false },
};

// Inter z next/font: pobierany przy buildzie i serwowany z savori.space (latin-ext = polskie znaki). Dawniej
// <link> do fonts.googleapis.com wysyłał Google adres IP każdego odwiedzającego.
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` + env(safe-area-inset-*) w powłoce (nagłówek, dolny pasek, treść) — strona sięga pod
  // notch / wskaźnik home, a elementy interaktywne są od nich odsunięte.
  viewportFit: "cover",
  // Kolor paska przeglądarki / statusu = biały nagłówek (`--color-mk-surface`). Serwis ma tylko
  // jasny motyw, więc jeden kolor dla obu `prefers-color-scheme` (ciemny pasek nad białym
  // nagłówkiem wyglądałby na błąd).
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <Providers>
          <ShellFrame>{children}</ShellFrame>
        </Providers>
      </body>
    </html>
  );
}
