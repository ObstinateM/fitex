import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Zain } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const zain = Zain({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const SITE_URL = 'https://fitex.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fitex — Tailor your CV to any job in 15 seconds',
    template: '%s | Fitex',
  },
  description:
    'Stop getting ghosted. Fitex rewrites your CV to match any job description, optimizes for ATS keywords with a 94% match rate, and delivers a ready-to-send PDF in 15 seconds.',
  keywords: [
    'CV tailoring',
    'ATS optimization',
    'resume builder',
    'job application',
    'CV keywords',
    'ATS-friendly CV',
    'tailored resume',
    'CV generator',
    'job search tool',
    'applicant tracking system',
  ],
  authors: [{ name: 'Fitex' }],
  creator: 'Fitex',
  publisher: 'Fitex',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Fitex',
    title: 'Fitex — Tailor your CV to any job in 15 seconds',
    description:
      'Stop getting ghosted. Fitex rewrites your CV to match any job description, optimizes for ATS keywords, and delivers a ready-to-send PDF in 15 seconds.',
    images: [
      {
        url: '/fitex.png',
        width: 1200,
        height: 630,
        alt: 'Fitex — AI-powered CV tailoring tool that matches your resume to any job description',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitex — Tailor your CV to any job in 15 seconds',
    description:
      'Stop getting ghosted. Fitex rewrites your CV to match any job description, optimizes for ATS keywords, and delivers a ready-to-send PDF in 15 seconds.',
    images: ['/fitex.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${zain.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
