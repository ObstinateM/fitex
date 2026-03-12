import type { Metadata } from 'next';
import { Geist, Geist_Mono, Zain } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

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

export const metadata: Metadata = {
  title: 'Fitex - Make your CV fit the job',
  description: 'AI-powered LaTeX CV tailoring to match any job description',
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
