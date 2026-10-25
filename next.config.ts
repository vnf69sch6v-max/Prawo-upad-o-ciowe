import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { NextConfig } from "next";

/** Browser pdfjs worker — copied so /parser can extract large PDFs locally. */
function copyPdfWorkerToPublic() {
  const src = join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
  const dest = join(process.cwd(), "public/pdfjs/pdf.worker.min.mjs");
  if (!existsSync(src)) return;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}
copyPdfWorkerToPublic();

/**
 * Nagłówki bezpieczeństwa dla każdej odpowiedzi. CSP dopuszcza tylko to, czego strona naprawdę używa:
 * własne skrypty (Next wstrzykuje skrypty inline, a strony są prerenderowane — nonce jest
 * niemożliwy, stąd 'unsafe-inline'), Google Fonts, logowanie Firebase (e-mail/hasło: identitytoolkit,
 * securetoken), worker pdfjs z /pdfjs (parser) i obrazy z https. Dane zewnętrzne (GUS, NBP, Eurostat,
 * Yahoo) pobierają trasy API po stronie serwera, więc przeglądarka łączy się tylko z 'self'.
 * Nowe źródło po stronie przeglądarki (skrypt, iframe, fetch) wymaga wpisu tutaj.
 * W `next dev` CSP jest wyłączona (React dev używa eval, HMR — websocketów).
 */
/** authDomain bez schematu, ukośnika i spacji z wklejki w Vercelu — inaczej źródło w CSP byłoby nieważne. */
const AUTH_DOMAIN = (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // apis.google.com: biblioteka gapi, przez którą Firebase otwiera okno logowania Google (signInWithPopup).
  "script-src 'self' 'unsafe-inline' https://apis.google.com",
  // Czcionka Inter z next/font — z naszej domeny, więc bez fonts.googleapis.com / fonts.gstatic.com
  // (każda wizyta wysyłała Google adres IP odwiedzającego).
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  // Przeglądarka łączy się tylko z logowaniem Firebase (e-mail + hasło). Nie `*.googleapis.com`: pod tą
  // domeną każdy może mieć własny bucket (storage.googleapis.com), czyli kanał wycieku dla wstrzykniętego skryptu.
  // Bazy (Firestore, Realtime DB) przeglądarka nie używa — tylko serwer przez Admin SDK.
  "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  // Ukryty iframe obsługi logowania na authDomain projektu (np. aplikacja-prawnicy.firebaseapp.com).
  `frame-src 'self' ${AUTH_DOMAIN ? `https://${AUTH_DOMAIN}` : 'https://*.firebaseapp.com'}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS = [
  // 2 lata, także subdomeny. Bez `preload` — wpis na listę preload przeglądarek to osobna, praktycznie
  // nieodwracalna decyzja właściciela domeny (hstspreload.org).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // `same-origin-allow-popups`, nie `same-origin`: okno logowania Google (popup) musi móc oddać wynik stronie.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY }] : []),
];

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage
      },
    ],
  },
  // External packages that should not be bundled
  serverExternalPackages: ['firebase-admin', 'pdfjs-dist', 'exceljs'],
  // pdfjs fake-worker dynamically imports pdf.worker.mjs (webpackIgnore). NFT
  // does not follow that import, so Vercel /api/parser/parse 500s on PDFs
  // unless the worker is traced in explicitly. TXT uploads are unaffected.
  outputFileTracingIncludes: {
    '/api/parser/parse': [
      './node_modules/pdfjs-dist/legacy/build/pdf.mjs',
      './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  // Legacy (dark) routes → new light domains
  async redirects() {
    return [
      { source: '/macro', destination: '/gospodarka', permanent: false },
      { source: '/rates', destination: '/rynki', permanent: false },
      { source: '/labor', destination: '/praca', permanent: false },
      { source: '/fx', destination: '/rynki', permanent: false },
      { source: '/market', destination: '/rynki', permanent: false },
      { source: '/trade', destination: '/rynki', permanent: false },
      { source: '/nowcast', destination: '/rynki', permanent: false },
      { source: '/tools', destination: '/rynki', permanent: false },
    ];
  },
};

export default nextConfig;
