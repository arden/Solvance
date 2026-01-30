'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FAQModal from '@/components/FAQModal';

export default function EnPage() {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  const handleScan = () => {
    if (!contractAddress.trim()) return;
    router.push(`/en/result?address=${contractAddress}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/en" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Solvance</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Home</a>
              <button
                onClick={() => setIsFAQOpen(true)}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </button>
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">API</a>
              <Link href="/zh" className="text-sm text-slate-300 hover:text-white transition-colors">中文</Link>
            </nav>
            <div className="flex md:hidden gap-4">
              <button
                onClick={() => setIsFAQOpen(true)}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                FAQ
              </button>
              <Link href="/zh" className="text-sm text-slate-300 hover:text-white transition-colors">中文</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8">
            <Badge className="mb-4 bg-orange-500/10 text-orange-500 border-orange-500/20">
              Solana Meme Coin Analysis
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Analyze Token Dump Risk Before Investing
            </h1>
            <p className="text-lg text-slate-400 md:text-xl">
              Get instant risk scores (1-100) based on holder distribution, wallet clustering, and historical patterns
            </p>
          </div>

          {/* Scan Input */}
          <Card className="mx-auto max-w-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter Solana token address..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button
                  onClick={handleScan}
                  disabled={!contractAddress.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Scan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="mt-20">
            <button
              onClick={() => setIsFAQOpen(true)}
              className="mb-8 text-2xl font-bold text-white hover:text-orange-500 transition-colors"
            >
              How It Works
            </button>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Search className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">1. Enter Address</CardTitle>
                  <CardDescription className="text-slate-400">
                    Paste the token contract address you want to analyze
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">2. Get Analysis</CardTitle>
                  <CardDescription className="text-slate-400">
                    Our algorithm analyzes holder distribution and wallet connections
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Shield className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">3. View Risk Score</CardTitle>
                  <CardDescription className="text-slate-400">
                    Get a comprehensive risk report with actionable insights
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
          © 2025 Solvance. Built for safer DeFi investing.
        </div>
      </footer>

      {/* FAQ Modal */}
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} locale="en" />
    </div>
  );
}
