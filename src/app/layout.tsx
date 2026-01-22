import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Savori Legal - Platforma do nauki prawa",
  description: "Opanuj egzaminy prawnicze i zdaj egzamin za pierwszym razem. 959+ pytań egzaminacyjnych, AI asystent, inteligentne fiszki.",
  keywords: ["prawo", "KSH", "prawo upadłościowe", "egzamin radcowski", "egzamin adwokacki", "nauka prawa", "fiszki prawnicze"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Savori Legal",
  },
  openGraph: {
    title: "Savori Legal",
    description: "Platforma do nauki prawa handlowego",
    type: "website",
    locale: "pl_PL",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a365d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        {/* Inter for body text, Playfair Display for serif headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

