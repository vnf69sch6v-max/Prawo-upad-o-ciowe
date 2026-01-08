import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexCapital Pro - Premium Legal Education Platform",
  description: "Opanuj prawo polskie z zaawansowanym systemem nauki opartym na spaced repetition, AI i gamifikacji.",
  keywords: ["prawo", "nauka", "fiszki", "egzamin", "aplikacja", "radcowski", "adwokacki"],
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
