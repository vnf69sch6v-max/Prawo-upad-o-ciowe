import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Poland Economic Dashboard",
  description: "Dane makroekonomiczne Polski w stylu Bloomberg Terminal — kursy walut, GPW, inflacja, stopy procentowe",
  keywords: ["polska", "ekonomia", "dashboard", "NBP", "GPW", "WIG20", "inflacja", "kursy walut"],
};

export const viewport: Viewport = {
  themeColor: "#0A0E17",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden">
        <Providers>
          <KeyboardShortcuts />
          <Sidebar />
          <div className="md:ml-16 lg:ml-52 min-h-screen pb-16 md:pb-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
