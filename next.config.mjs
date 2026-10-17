/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// Permissive-but-useful CSP tuned for the app's real dependencies:
//   - OpenStreetMap raster tiles + Nominatim geocoding
//   - Google Maps JavaScript API (script + gstatic + googleusercontent)
// Fonts are self-hosted via next/font, so no external font origins are needed.
// Next.js also injects inline hydration scripts, so 'unsafe-inline' is
// required. 'unsafe-eval' is only needed by the dev server (HMR).
// Leaflet / Google Maps spin up blob: workers, hence worker-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com https://maps.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://nominatim.openstreetmap.org https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
  'frame-src https://www.google.com https://maps.google.com https://*.google.com',
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The service worker must never be served stale, otherwise a deploy
        // can be masked indefinitely by a cached copy of this file.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
