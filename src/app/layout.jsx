import './globals.css';
import '@/styles/themes.css';
import '@/styles/global.css';
import Providers from './providers.jsx';
import { fontVariables } from './fonts.js';
import { SITE } from '@/site.config.js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/192', sizes: '192x192', type: 'image/png' },
      { url: '/icons/512', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-180',
  },
  keywords: [
    'OSINT',
    'open source intelligence',
    'OSINT tools',
    'threat intelligence',
    'SOCMINT',
    'GEOINT',
    'OSINT field guide',
    'investigation mapping tool',
  ],
  authors: [{ name: SITE.author, url: SITE.social[0]?.href }],
  creator: SITE.author,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: `@${SITE.author}`,
  },
};

export const viewport = {
  themeColor: '#0a0b0e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the stored theme before first paint to avoid a flash when
            the user picked light. Falls back to the dark default above. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('osint-tool:theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE.name,
              description: SITE.description,
              author: {
                '@type': 'Person',
                name: SITE.author,
                sameAs: (SITE.social ?? []).map((s) => s.href),
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
