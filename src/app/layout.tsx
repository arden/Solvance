import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Solvance | Solana Token Risk Analysis',
    template: '%s | Solvance',
  },
  description:
    'Solvance is a professional Solana token risk analysis platform. Get instant risk scores based on holder distribution, wallet clustering, and historical patterns.',
  keywords: [
    'Solvance',
    'Solana',
    'Token Analysis',
    'Risk Score',
    'Meme Coin',
    'DeFi',
    'Holder Analysis',
    'Wallet Clustering',
  ],
  authors: [{ name: 'Solvance Team' }],
  generator: 'Solvance',
  openGraph: {
    title: 'Solvance | Your Solana Risk Guard',
    description:
      'Analyze token dump risk before investing with Solvance. Get instant Coal Score and detailed risk reports.',
    url: 'https://solvance.io',
    siteName: 'Solvance',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
