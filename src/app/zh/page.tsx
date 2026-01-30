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

export default function ZhPage() {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  const handleScan = () => {
    if (!contractAddress.trim()) return;
    router.push(`/zh/result?address=${contractAddress}`);
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
            <Link href="/zh" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Solvance</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">首页</a>
              <button
                onClick={() => setIsFAQOpen(true)}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                如何使用
              </button>
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">API</a>
              <Link href="/en" className="text-sm text-slate-300 hover:text-white transition-colors">English</Link>
            </nav>
            <div className="flex md:hidden gap-4">
              <button
                onClick={() => setIsFAQOpen(true)}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                常见问题
              </button>
              <Link href="/en" className="text-sm text-slate-300 hover:text-white transition-colors">English</Link>
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
              Solana Meme 代币分析
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-6xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              在投资前分析代币抛售风险
            </h1>
            <p className="text-lg text-slate-400 md:text-xl">
              基于持仓分布、钱包集群和历史模式，获取即时风险评分（1-100）
            </p>
          </div>

          {/* Scan Input */}
          <Card className="mx-auto max-w-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="输入 Solana 代币地址..."
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
                  扫描
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
              如何使用
            </button>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Search className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">1. 输入地址</CardTitle>
                  <CardDescription className="text-slate-400">
                    粘贴您想要分析的代币合约地址
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">2. 获取分析</CardTitle>
                  <CardDescription className="text-slate-400">
                    我们的算法分析持仓分布和钱包关联
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                    <Shield className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">3. 查看风险评分</CardTitle>
                  <CardDescription className="text-slate-400">
                    获取包含可操作见解的综合风险报告
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
          © 2025 Solvance. 为更安全的 DeFi 投资而构建。
        </div>
      </footer>

      {/* FAQ Modal */}
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} locale="zh" />
    </div>
  );
}
