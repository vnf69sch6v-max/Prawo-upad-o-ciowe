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
