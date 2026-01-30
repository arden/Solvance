'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Clock,
  Users,
  Wallet,
  RefreshCw,
  Download,
  Filter,
  Flame,
  Lock,
  Unlock,
  UserCheck,
  Link as LinkIcon,
  Activity,
  History,
  Trophy,
  Skull,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { scanToken, invalidateCache } from '@/lib/api';
import { useLocale } from 'next-intl';
import { Suspense } from 'react';
import CopyButton from '@/components/CopyButton';

function ResultContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const address = searchParams.get('address') || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    loadScanResult();
  }, [address]);

  const loadScanResult = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await scanToken(address);

      if (response.success && response.data) {
        setScanResult(response.data);
      } else {
        setApiError(response.error?.message || '无法加载扫描结果');
      }
    } catch (catchErr) {
      setApiError('无法连接到服务器');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setApiError(null);

    try {
      const response = await scanToken(address, true);

      if (response.success && response.data) {
        setScanResult(response.data);
      } else {
        setApiError(response.error?.message || '无法刷新扫描结果');
      }
    } catch (catchErr) {
      setApiError('无法连接到服务器');
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 91) {
      return {
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/10',
        text: 'text-white',
        border: 'border-red-500/30',
        label: locale === 'zh' ? '极度危险' : 'EXTREME',
        icon: <XCircle className="h-6 w-6" />,
      };
    }
    if (score >= 61) {
      return {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/10',
        text: 'text-white',
        border: 'border-orange-500/30',
        label: locale === 'zh' ? '高风险' : 'HIGH',
        icon: <AlertTriangle className="h-6 w-6" />,
      };
    }
    if (score >= 38) {
      return {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-500/10',
        text: 'text-white',
        border: 'border-yellow-500/30',
        label: locale === 'zh' ? '中等风险' : 'MEDIUM',
        icon: <TrendingDown className="h-6 w-6" />,
      };
    }
    return {
      bg: 'bg-green-500',
      bgLight: 'bg-green-500/10',
      text: 'text-white',
      border: 'border-green-500/30',
      label: locale === 'zh' ? '低风险' : 'LOW',
      icon: <CheckCircle2 className="h-6 w-6" />,
    };
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return locale === 'zh' ? `${days}天前` : `${days} days ago`;
    }
    if (hours > 0) {
      return locale === 'zh' ? `${hours}小时前` : `${hours} hours ago`;
    }
    if (minutes > 0) {
      return locale === 'zh' ? `${minutes}分钟前` : `${minutes} minutes ago`;
    }
    return locale === 'zh' ? '刚刚' : 'Just now';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return locale === 'zh' ? `${days}天` : `${days} days`;
    }
    if (hours > 0) {
      return locale === 'zh' ? `${hours}小时` : `${hours} hours`;
    }
    return locale === 'zh' ? `${Math.floor(seconds / 60)}分钟` : `${Math.floor(seconds / 60)} minutes`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            {locale === 'zh' ? '正在扫描...' : 'Scanning...'}
          </p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Card className="max-w-md border-slate-800 bg-slate-900/80">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {locale === 'zh' ? '扫描失败' : 'Scan Failed'}
            </h2>
            <p className="text-slate-400 mb-4">{apiError}</p>
            <Button onClick={loadScanResult} className="bg-orange-500 hover:bg-orange-600">
              {locale === 'zh' ? '重试' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scanResult) {
    return null;
  }

  const riskLevel = getRiskColor(scanResult.coalScore);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={locale === 'zh' ? '/zh' : '/en'}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Solvance</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
                title={locale === 'zh' ? '刷新' : 'Refresh'}
              >
                <RefreshCw
                  className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
                />
              </Button>
              <Link
                href={locale === 'zh' ? '/zh' : '/en'}
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-slate-800"
              >
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <Link href={locale === 'zh' ? '/zh' : '/en'}>
            <Button
              variant="ghost"
              className="mb-6 text-gray-200 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {locale === 'zh' ? '返回首页' : 'Back to Home'}
            </Button>
          </Link>

          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {locale === 'zh' ? '扫描结果' : 'Scan Results'}
            </h1>
            <Badge
              className={`${riskLevel.bg} ${riskLevel.text} text-sm px-3 py-1`}
            >
              {locale === 'zh' ? '扫描时间' : 'Scanned'}{' '}
              {formatTime(scanResult.scanTimestamp)}
            </Badge>
          </div>

          {/* Contract Address */}
          <Card className="mb-6 border-slate-800 bg-slate-900/80">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {locale === 'zh' ? '合约地址' : 'Contract Address'}
                  </span>
                  <CopyButton text={address} />
                </div>
                <code className="text-base text-orange-400 font-mono bg-slate-800/50 px-4 py-2 rounded-md break-all flex items-center justify-between">
                  {address}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Sub-nav */}
          <div className="sticky top-[73px] z-40 mb-8 py-2 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 -mx-4 px-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 min-w-max">
              {[
                { id: 'overview', label: locale === 'zh' ? '概览' : 'Overview' },
                { id: 'security', label: locale === 'zh' ? '安全审计' : 'Security Audit' },
                { id: 'dev-history', label: locale === 'zh' ? '开发者战绩' : 'Dev History' },
                { id: 'holders', label: locale === 'zh' ? '持仓分析' : 'Holders' },
                { id: 'bundles', label: locale === 'zh' ? '关联钱包' : 'Bundles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="text-sm font-medium text-slate-400 hover:text-orange-500 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Score */}
          <div id="overview">
            <Card
              className={`mb-8 border-2 ${riskLevel.border} ${riskLevel.bgLight} bg-slate-900/80 relative overflow-hidden group hover:glow-orange transition-all duration-500`}
            >
              {/* Decorative Glow */}
              <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 ${riskLevel.bg}`} />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl text-white">
                    {locale === 'zh' ? '风险评分' : 'Risk Score'}
                  </CardTitle>
                  <div className="relative">
                    <div className={`absolute inset-0 blur-lg opacity-50 ${riskLevel.bg}`} />
                    <Badge className={`${riskLevel.bg} ${riskLevel.text} text-2xl px-8 py-3 relative z-10 shadow-2xl`}>
                      {scanResult.coalScore}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${riskLevel.bg} shadow-lg shadow-orange-500/20 transform group-hover:scale-110 transition-transform duration-500`}>
                    {riskLevel.icon}
                  </div>
                  <div>
                    <p className={`text-4xl font-black tracking-tight ${riskLevel.text} text-shadow-glow`}>
                      {riskLevel.label}
                    </p>
                    <p className="text-lg text-gray-300 mt-1">
                      {locale === 'zh' ? '基于 AI 持仓与安全审计' : 'Based on AI holder & safety audit'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold text-gray-300 uppercase tracking-widest">
                    <span>
                      {locale === 'zh' ? '低风险' : 'Low Risk'}
                    </span>
                    <span>
                      {locale === 'zh' ? '高风险' : 'High Risk'}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-1">
                    <div 
                      className={`h-full rounded-full ${riskLevel.bg} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]`}
                      style={{ width: `${scanResult.coalScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Audit Title */}
          <div id="security" className="flex items-center gap-2 mb-6 mt-8">
            <Shield className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">
              {locale === 'zh' ? '安全审计' : 'Security Audit'}
            </h2>
          </div>

          {/* LP & Authority Safety */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scanResult.lpSafety.isBurned ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                    <Flame className={`h-5 w-5 ${scanResult.lpSafety.isBurned ? 'text-orange-500' : 'text-red-500'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '流动性池' : 'Liquidity Pool'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className={`text-xl font-bold ${scanResult.lpSafety.isBurned ? 'text-green-400' : 'text-red-400'}`}>
                    {scanResult.lpSafety.isBurned 
                      ? (locale === 'zh' ? '已销毁' : 'Burned') 
                      : (locale === 'zh' ? '未销毁' : 'Not Burned')}
                  </p>
                  {scanResult.lpSafety.isBurned && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      {scanResult.lpSafety.lpBurnPercentage.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scanResult.lpSafety.mintAuthorityDisabled ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {scanResult.lpSafety.mintAuthorityDisabled ? (
                      <Lock className="h-5 w-5 text-green-400" />
                    ) : (
                      <Unlock className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '铸造权限' : 'Mint Authority'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${scanResult.lpSafety.mintAuthorityDisabled ? 'text-green-400' : 'text-red-400'}`}>
                  {scanResult.lpSafety.mintAuthorityDisabled 
                    ? (locale === 'zh' ? '已丢弃' : 'Disabled') 
                    : (locale === 'zh' ? '已启用' : 'Enabled')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scanResult.lpSafety.freezeAuthorityDisabled ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {scanResult.lpSafety.freezeAuthorityDisabled ? (
                      <Lock className="h-5 w-5 text-green-400" />
                    ) : (
                      <Unlock className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '冻结权限' : 'Freeze Authority'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${scanResult.lpSafety.freezeAuthorityDisabled ? 'text-green-400' : 'text-red-400'}`}>
                  {scanResult.lpSafety.freezeAuthorityDisabled 
                    ? (locale === 'zh' ? '已丢弃' : 'Disabled') 
                    : (locale === 'zh' ? '已启用' : 'Enabled')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${!scanResult.lpSafety.topHoldersRisk ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <UserCheck className={`h-5 w-5 ${!scanResult.lpSafety.topHoldersRisk ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '大户风险' : 'Top Holders'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${!scanResult.lpSafety.topHoldersRisk ? 'text-green-400' : 'text-red-400'}`}>
                  {!scanResult.lpSafety.topHoldersRisk 
                    ? (locale === 'zh' ? '低风险' : 'Low Risk') 
                    : (locale === 'zh' ? '高风险' : 'High Risk')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${!scanResult.lpSafety.devLinkage ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <LinkIcon className={`h-5 w-5 ${!scanResult.lpSafety.devLinkage ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '开发者关联' : 'Dev Linkage'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${!scanResult.lpSafety.devLinkage ? 'text-green-400' : 'text-red-400'}`}>
                  {!scanResult.lpSafety.devLinkage 
                    ? (locale === 'zh' ? '无关联' : 'Clean') 
                    : (locale === 'zh' ? '有关联' : 'Linked')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scanResult.lpSafety.washTradingScore < 20 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <Activity className={`h-5 w-5 ${scanResult.lpSafety.washTradingScore < 20 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '刷量检测' : 'Wash Trading'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className={`text-xl font-bold ${scanResult.lpSafety.washTradingScore < 20 ? 'text-green-400' : 'text-red-400'}`}>
                    {scanResult.lpSafety.washTradingScore < 20 
                      ? (locale === 'zh' ? '正常' : 'Low') 
                      : (locale === 'zh' ? '高风险' : 'High')}
                  </p>
                  <Badge className={scanResult.lpSafety.washTradingScore < 20 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                    {scanResult.lpSafety.washTradingScore}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Developer History */}
          <div id="dev-history" className="flex items-center gap-2 mb-6 mt-8">
            <History className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">
              {locale === 'zh' ? '开发者历史战绩' : 'Developer History'}
            </h2>
          </div>

          <Card className="mb-8 border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Search className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '部署者地址' : 'Deployer'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-orange-400 font-mono bg-slate-800/50 px-3 py-1.5 rounded-md block truncate flex-1">
                    {scanResult.devReputation.deployerAddress}
                  </code>
                  <CopyButton text={scanResult.devReputation.deployerAddress} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Trophy className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '发布统计' : 'Launch Stats'}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">
                    {scanResult.devReputation.totalLaunched}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">
                    {locale === 'zh' ? '总项目' : 'Total Projects'}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-green-400">
                    {locale === 'zh' ? '成功' : 'Success'}: {scanResult.devReputation.successCount}
                  </span>
                  <span className="text-red-400">
                    {locale === 'zh' ? '失败/Rug' : 'Rug'}: {scanResult.devReputation.rugCount}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scanResult.devReputation.isSerialRugger ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    {scanResult.devReputation.isSerialRugger ? (
                      <Skull className="h-5 w-5 text-red-500" />
                    ) : (
                      <Trophy className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '开发者声誉' : 'Dev Reputation'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-bold ${scanResult.devReputation.isSerialRugger ? 'text-red-500' : 'text-green-400'}`}>
                    {scanResult.devReputation.isSerialRugger 
                      ? (locale === 'zh' ? '惯犯/高危' : 'Serial Rugger') 
                      : (locale === 'zh' ? '声誉良好' : 'Trusted Dev')}
                  </span>
                  <Badge className={`${scanResult.devReputation.reputationScore > 70 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {scanResult.devReputation.reputationScore}%
                  </Badge>
                </div>
                <Progress value={scanResult.devReputation.reputationScore} className="h-2 mt-4" />
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div id="holders" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '总持仓者' : 'Total Holders'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {scanResult.metadata.holderCount 
                    ? formatNumber(scanResult.metadata.holderCount) 
                    : formatNumber(scanResult.holders.length)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Wallet className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '市值' : 'Market Cap'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(scanResult.marketCap)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Clock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '代币年龄' : 'Token Age'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formatDuration(scanResult.tokenAge)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {locale === 'zh' ? '红旗标识' : 'Red Flags'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {scanResult.redFlags.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Score Breakdown */}
          <Card className="mb-8 border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                {locale === 'zh' ? '评分分解' : 'Score Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '持仓时间' : 'Hold Time'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {scanResult.scoreBreakdown.holdTimeScore}
                    </span>
                  </div>
                  <Progress
                    value={scanResult.scoreBreakdown.holdTimeScore}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '集中度' : 'Concentration'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {scanResult.scoreBreakdown.concentrationScore}
                    </span>
                  </div>
                  <Progress
                    value={scanResult.scoreBreakdown.concentrationScore}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '钱包关联' : 'Wallet Connection'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {scanResult.scoreBreakdown.walletConnectionScore}
                    </span>
                  </div>
                  <Progress
                    value={scanResult.scoreBreakdown.walletConnectionScore}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '基础分数' : 'Base Score'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {scanResult.scoreBreakdown.baseScore}
                    </span>
                  </div>
                  <Progress
                    value={scanResult.scoreBreakdown.baseScore}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '红旗加分' : 'Red Flag Bonus'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        scanResult.scoreBreakdown.redFlagBonus > 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {scanResult.scoreBreakdown.redFlagBonus > 0
                        ? `+${scanResult.scoreBreakdown.redFlagBonus}`
                        : scanResult.scoreBreakdown.redFlagBonus}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(scanResult.scoreBreakdown.redFlagBonus)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '卖出加分' : 'Sell Bonus'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        scanResult.scoreBreakdown.sellBonus > 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {scanResult.scoreBreakdown.sellBonus > 0
                        ? `+${scanResult.scoreBreakdown.sellBonus}`
                        : scanResult.scoreBreakdown.sellBonus}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(scanResult.scoreBreakdown.sellBonus)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '年龄惩罚' : 'Age Penalty'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        scanResult.scoreBreakdown.agePenalty > 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {scanResult.scoreBreakdown.agePenalty > 0
                        ? `+${scanResult.scoreBreakdown.agePenalty}`
                        : scanResult.scoreBreakdown.agePenalty}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(scanResult.scoreBreakdown.agePenalty)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '成熟度奖励' : 'Maturity Bonus'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        scanResult.scoreBreakdown.maturityBonus < 0
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {scanResult.scoreBreakdown.maturityBonus}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(scanResult.scoreBreakdown.maturityBonus)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      {locale === 'zh' ? '安全惩罚' : 'Security Penalty'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        scanResult.scoreBreakdown.lpPenalty > 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {scanResult.scoreBreakdown.lpPenalty > 0
                        ? `+${scanResult.scoreBreakdown.lpPenalty}`
                        : scanResult.scoreBreakdown.lpPenalty}
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(scanResult.scoreBreakdown.lpPenalty)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          <div className="mb-8">
            {scanResult.redFlags.length > 0 ? (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {locale === 'zh' ? '红旗标识' : 'Red Flags'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {scanResult.redFlags.map((flag: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">
                            {flag.type}
                          </p>
                          <p className="text-sm text-gray-300">{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-800 bg-slate-900/80 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {locale === 'zh' ? '未发现红旗警报' : 'No Red Flags Detected'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {locale === 'zh' ? '该合约暂未触发任何高危安全警报。' : 'No high-risk security alerts were triggered for this contract.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Holders List */}
          <Card className="mb-8 border-slate-800 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">
                  {locale === 'zh' ? '持仓者列表' : 'Holder List'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                    title={locale === 'zh' ? '筛选' : 'Filter'}
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                    title={locale === 'zh' ? '导出' : 'Export'}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '排名' : 'Rank'}
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '钱包地址' : 'Wallet Address'}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '持仓占比' : 'Supply %'}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '持仓时间' : 'Hold Time'}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '卖出比例' : 'Sold %'}
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '盈亏' : 'P/L'}
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">
                        {locale === 'zh' ? '标签' : 'Labels'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.holders.map((holder: any, idx: number) => (
                      <tr
                        key={holder.walletAddress}
                        className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4 text-sm text-gray-300">{idx + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-orange-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
                              {holder.walletAddress.slice(0, 8)}...
                              {holder.walletAddress.slice(-4)}
                            </code>
                            <CopyButton text={holder.walletAddress} className="h-6 w-6" />
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm font-bold text-white">
                            {holder.supplyPercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm text-gray-300">
                          {formatDuration(holder.holdDuration / 1000)}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`text-sm font-bold ${
                              holder.soldPercentage > 50
                                ? 'text-red-400'
                                : holder.soldPercentage > 25
                                ? 'text-orange-400'
                                : 'text-green-400'
                            }`}
                          >
                            {holder.soldPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`text-sm font-bold ${
                              holder.profitLoss > 0
                                ? 'text-green-400'
                                : holder.profitLoss < 0
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {holder.profitLoss > 0 ? '+' : ''}
                            {holder.profitLossPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {holder.labels.map((label: string) => (
                              <Badge
                                key={label}
                                className={`text-xs ${
                                  label === 'FRESH'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : label === 'BOT'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : label === 'DORMANT'
                                    ? 'bg-gray-500/20 text-gray-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-slate-800">
                {scanResult.holders.map((holder: any, idx: number) => (
                  <div key={holder.walletAddress} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        <code className="text-sm text-orange-400 font-mono">
                          {holder.walletAddress.slice(0, 6)}...{holder.walletAddress.slice(-4)}
                        </code>
                        <CopyButton text={holder.walletAddress} className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {holder.supplyPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">{locale === 'zh' ? '持仓时间' : 'Hold Time'}</p>
                        <p className="text-gray-300">{formatDuration(holder.holdDuration / 1000)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">{locale === 'zh' ? '卖出比例' : 'Sold %'}</p>
                        <p className={`${holder.soldPercentage > 50 ? 'text-red-400' : 'text-green-400'} font-bold`}>
                          {holder.soldPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">{locale === 'zh' ? '盈亏' : 'P/L'}</p>
                        <p className={`${holder.profitLoss > 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                          {holder.profitLoss > 0 ? '+' : ''}{holder.profitLossPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">{locale === 'zh' ? '标签' : 'Labels'}</p>
                        <div className="flex gap-1 flex-wrap">
                          {holder.labels.slice(0, 2).map((label: string) => (
                            <Badge key={label} className="text-[10px] px-1 py-0 h-4 bg-slate-800 text-slate-400">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bundles */}
          <div id="bundles">
            {scanResult.bundles.length > 0 ? (
              <Card className="mb-8 border-slate-800 bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {locale === 'zh' ? '关联钱包' : 'Connected Wallets'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {scanResult.bundles.map((bundle: any, idx: number) => (
                      <div
                        key={bundle.bundleId}
                        className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {bundle.type === 'SAME_BLOCK_BUY'
                                ? locale === 'zh'
                                  ? '同区块买入'
                                  : 'Same Block Buy'
                                : bundle.type === 'SAME_FUNDER'
                                ? locale === 'zh'
                                  ? '同一资金来源'
                                  : 'Same Funder'
                                : locale === 'zh'
                                  ? '协调卖出'
                                  : 'Coordinated Sell'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {locale === 'zh' ? 'Bundle ID' : 'Bundle ID'}:{' '}
                              {bundle.bundleId}
                            </p>
                          </div>
                          <Badge className="bg-orange-500 text-white">
                            +{bundle.detectionScore}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div>
                            <span className="text-gray-400">
                              {locale === 'zh' ? '关联钱包数' : 'Connected Wallets'}:{' '}
                            </span>
                            <span className="text-white font-medium">
                              {bundle.walletAddresses.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              {locale === 'zh' ? '总持仓占比' : 'Total Supply'}:{' '}
                            </span>
                            <span className="text-white font-medium">
                              {bundle.totalSupplyPercentage.toFixed(2)}%
                            </span>
                          </div>
                          {bundle.blockHeight && (
                            <div>
                              <span className="text-gray-400">
                                {locale === 'zh' ? '区块高度' : 'Block Height'}:{' '}
                              </span>
                              <span className="text-white font-medium">
                                {formatNumber(bundle.blockHeight)}
                              </span>
                            </div>
                          )}
                          {bundle.funderAddress && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {locale === 'zh' ? '资金来源' : 'Funder'}:{' '}
                              </span>
                              <code className="text-orange-400 font-mono">
                                {bundle.funderAddress.slice(0, 8)}...
                              </code>
                              <CopyButton text={bundle.funderAddress} className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8 border-slate-800 bg-slate-900/80 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {locale === 'zh' ? '未检测到老鼠仓' : 'No Bundles Detected'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {locale === 'zh' ? '未发现通过同一资金来源或同区块买入的关联钱包分组。' : 'No associated wallet groups via same funding or same-block buying were detected.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          © 2025 Solvance.{' '}
          {locale === 'zh'
            ? '为更安全的 DeFi 投资而构建。'
            : 'Built for safer DeFi investing.'}
        </div>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">正在加载...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
