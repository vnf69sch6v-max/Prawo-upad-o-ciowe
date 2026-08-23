import type { NextConfig } from "next";

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
  serverExternalPackages: ['firebase-admin'],
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
      // Zakładka Prognozy została wycofana — stare linki kierujemy na Rynki.
      { source: '/prognozy', destination: '/rynki', permanent: false },
    ];
  },
};

export default nextConfig;
