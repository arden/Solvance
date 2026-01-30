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
      <body className={`antialiased bg-slate-950 web3-grid min-h-screen relative`}>
        {/* Global Glow Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
