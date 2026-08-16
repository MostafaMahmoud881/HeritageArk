import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | HeritageArk',
    default: 'HeritageArk \u2014 Preserve. Explore. Revive.',
  },
  description:
    'Discover and explore the world\'s cultural heritage through immersive stories, artifacts, and traditions.',
  keywords: ['heritage', 'culture', 'artifacts', 'history', 'museum', 'exploration', 'HeritageArk'],
  authors: [{ name: 'HeritageArk' }],
  icons: {
    icon: '/brand-assets/favicon.svg',
    apple: '/brand-assets/heritageark-app-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    siteName: 'HeritageArk',
    title: 'HeritageArk \u2014 Preserve. Explore. Revive.',
    description:
      'Discover and explore the world\'s cultural heritage through immersive stories, artifacts, and traditions.',
    images: ['/brand-assets/heritageark-logo-light.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeritageArk',
    images: ['/brand-assets/heritageark-logo-light.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="ltr" lang="en">
      <head>
        <link rel="icon" href="/brand-assets/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand-assets/heritageark-app-icon.svg" />
        <script src="https://js.puter.com/v2/" async />
      </head>
      <body>{children}</body>
    </html>
  );
}