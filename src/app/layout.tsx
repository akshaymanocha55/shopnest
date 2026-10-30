import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { LoginPromptHost } from '@/components/auth/LoginPromptHost';
import { BackToTop } from '@/components/layout/BackToTop';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { JsonLd } from '@/components/seo/JsonLd';
import { env } from '@/config/env';
import { APP } from '@/constants';
import { organizationJsonLd } from '@/lib/seo';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

// Self-hosted variable fonts: preloaded, no layout shift (size-adjusted fallback), no Google request.
const jakarta = localFont({
  src: '../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  variable: '--font-jakarta',
  weight: '200 800',
  display: 'swap',
});

const bricolage = localFont({
  src: '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  variable: '--font-bricolage',
  weight: '200 800',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${APP.name} | ${APP.tagline}`, template: `%s | ${APP.name}` },
  description: APP.description,
  applicationName: APP.name,
  keywords: ['online shopping India', 'fashion', 'jewellery', 'electronics', 'ShopNest'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: APP.name,
    locale: APP.locale,
    title: APP.name,
    description: APP.description,
    url: '/',
  },
  twitter: { card: 'summary_large_image', site: APP.twitter },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#1b1f3b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-ink-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <AppProviders>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <LoginPromptHost />
        </AppProviders>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
