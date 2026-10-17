import { Fraunces, Work_Sans, IBM_Plex_Mono } from 'next/font/google';

// Self-hosted at build time by next/font: the woff2 files are emitted under
// /_next/static/media and served from our own origin, so there are no runtime
// requests to Google and the CSP no longer needs fonts.googleapis.com /
// fonts.gstatic.com. Each font exposes a CSS variable consumed by
// tailwind.config.js and styles/global.css.

export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '900'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const fontVariables = `${fraunces.variable} ${workSans.variable} ${ibmPlexMono.variable}`;
