import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ProgressBar } from '@/components/progress-bar';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ThemeScript } from '@/components/theme-script';
import './base.css';
import './catalog.css';
import './globals.css';
import './skeleton.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--f-d',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--f-m',
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

export const metadata: Metadata = {
  title: 'KeyDir — Track Mechanical Keyboard Prices Across India',
  description:
    'Compare prices from multiple Indian vendors, view price history, and find the best deal on mechanical keyboards and desk peripherals.',
  keywords: [
    'mechanical keyboard',
    'price tracker',
    'India',
    'keyboard vendors',
    'keycaps',
    'switches',
  ],
  openGraph: {
    title: 'KeyDir — Track Mechanical Keyboard Prices Across India',
    description:
      'Compare prices from multiple Indian vendors, view price history, and find the best deal.',
    url: 'https://app.keydir.in',
    siteName: 'KeyDir',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeyDir — Track Mechanical Keyboard Prices Across India',
    description:
      'Compare prices from multiple Indian vendors, view price history, and find the best deal.',
  },
  metadataBase: new URL('https://app.keydir.in'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head />
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col font-[family-name:var(--f-d)]`}
      >
        <ThemeScript />
        <ThemeProvider>
          <ProgressBar />
          <ScrollReveal />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
