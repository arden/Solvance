'use client';

import { useState } from 'react';
import { X, Shield, Zap, AlertTriangle, Users, Info, HelpCircle, CheckCircle2, TrendingDown, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

const faqData = {
  en: [
    {
      id: "what-is-coalscan",
      question: "What is Solvance",
      icon: <Shield className="h-5 w-5 text-orange-500" />,
      content: [
        {
          type: "text",
          text: "Solvance analyzes Solana memecoin holder patterns to assess dump risk. Paste a contract address and get a Coal Score (1-100)."
        },
        {
          type: "text",
          text: "The higher the score, the more likely the token is coal - meaning it likely sucks and you're likely to lose your money fast."
        },
        {
          type: "text",
          text: "Coal tokens are packed with red flags: concentrated holders, dump-ready supply structures, and suspicious wallet patterns."
        },
        {
          type: "text",
          text: "Most tokens are coal. A few have the structure to turn into diamonds. Solvance helps you tell the difference before you buy."
        }
      ]
    },
    {
      id: "how-calculated",
      question: "How is the Coal Score calculated?",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      content: [
        {
          type: "title",
          text: "Base Score (Weighted Metrics)"
        },
        {
          type: "text",
          text: "All metrics weight top holders more heavily: Top 10 (3x), Mid 10 (2x), Bottom 10 (1x)."
        },
        {
          type: "list",
          items: [
            { label: "Hold Time", value: "35%", sub: "Position-weighted average" },
            { label: "Concentration", value: "20%", sub: "Top 30 Supply" },
            { label: "Wallet Connections", value: "45%", sub: "Cluster detection" }
          ]
        },
        {
          type: "title",
          text: "Red Flags & Bonuses"
        },
        {
          type: "list",
          items: [
            { label: "Concentration Flags", value: "max +25", sub: "Top 10 owns >40% supply, etc." },
            { label: "Supply Sold", value: "max +25", sub: "Heavy sellers (>50% sold) increase risk" },
            { label: "Bundle Detection", value: "max +25", sub: "Same-block buyers or shared funders" },
            { label: "Token Age Penalty", value: "up to +25", sub: "Higher risk for tokens < 8 hours old" }
          ]
        }
      ]
    },
    {
      id: "risk-levels",
      question: "What do the risk levels mean?",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      content: [
        {
          type: "grid",
          items: [
            { range: "91-100", label: "EXTREME", color: "bg-red-500", icon: <XCircle className="h-4 w-4" />, desc: "Extreme dump risk. Multiple red flags detected." },
            { range: "61-90", label: "HIGH", color: "bg-orange-500", icon: <AlertTriangle className="h-4 w-4" />, desc: "Significant risk. Proceed with caution." },
            { range: "38-60", label: "MEDIUM", color: "bg-yellow-500", icon: <TrendingDown className="h-4 w-4" />, desc: "Some concerns but not alarming." },
            { range: "0-37", label: "LOW", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" />, desc: "Holder patterns look healthy." }
          ]
        }
      ]
    },
    {
      id: "wallet-labels",
      question: "What do the wallet labels mean?",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      content: [
        {
          type: "labels",
          items: [
            { label: "FRESH", color: "bg-blue-500/20 text-blue-400", desc: "Wallet has fewer than 50 transactions. Often created just for this token." },
            { label: "BOT", color: "bg-purple-500/20 text-purple-400", desc: "Wallet shows bot-like behavior (100+ transactions in under 60s)." },
            { label: "DORMANT", color: "bg-gray-500/20 text-gray-400", desc: "No activity in 7+ days. Could be diamond hands or abandoned." },
            { label: "NAMED", color: "bg-yellow-500/20 text-yellow-400", desc: "Known KOL (Key Opinion Leader) wallets we track." }
          ]
        }
      ]
    },
    {
      id: "kol-wallets",
      question: "Do KOL wallets affect the score?",
      icon: <Info className="h-5 w-5 text-cyan-500" />,
      content: [
        { type: "text", text: "No. KOL (Key Opinion Leader) wallet identification is purely informational." },
        { type: "text", text: "When you see a wallet highlighted in gold with a name and X link, it just means we recognize that wallet as belonging to a known trader/influencer." },
        { type: "text", text: "This has zero impact on the coal score calculation." }
      ]
    }
  ],
  zh: [
    {
      id: "what-is-coalscan",
      question: "什么是 Solvance",
      icon: <Shield className="h-5 w-5 text-orange-500" />,
      content: [
        {
          type: "text",
          text: "Solvance 分析 Solana Meme 代币的持仓模式，以评估抛售风险。粘贴合约地址即可获得 Coal Score（1-100）。"
        },
        {
          type: "text",
          text: "分数越高，代币越是“煤炭”——意味着它很可能很糟糕，你可能会迅速亏钱。"
        },
        {
          type: "text",
          text: "煤炭代币充满危险信号：持仓集中、准备抛售的供应结构、可疑的钱包模式。"
        },
        {
          type: "text",
          text: "大多数代币都是煤炭。少数具有转变为钻石的潜力。Solvance 帮助你在购买前分辨两者。"
        }
      ]
    },
    {
      id: "how-calculated",
      question: "Coal Score 如何计算？",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      content: [
        {
          type: "title",
          text: "基础分数（加权指标）"
        },
        {
          type: "text",
          text: "所有指标都更重视头部持仓者：前10名（3倍权重），中间10名（2倍权重），底部10名（1倍权重）。"
        },
        {
          type: "list",
          items: [
            { label: "持仓时间", value: "35%", sub: "位置加权平均值" },
            { label: "持仓集中度", value: "20%", sub: "前30名供应量占比" },
            { label: "钱包关联", value: "45%", sub: "集群检测" }
          ]
        },
        {
          type: "title",
          text: "危险信号与加分项"
        },
        {
          type: "list",
          items: [
            { label: "集中度警告", value: "最高 +25", sub: "前10名持仓超过40%等" },
            { label: "供应量售出", value: "最高 +25", sub: "重度卖出（>50%）会增加风险" },
            { label: "捆绑检测", value: "最高 +25", sub: "同区块买入或同一资金来源" },
            { label: "代币年龄惩罚", value: "最高 +25", sub: "创建不足8小时的代币风险更高" }
          ]
        }
      ]
    },
    {
      id: "risk-levels",
      question: "风险等级是什么意思？",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      content: [
        {
          type: "grid",
          items: [
            { range: "91-100", label: "极度危险", color: "bg-red-500", icon: <XCircle className="h-4 w-4" />, desc: "极高的抛售风险。检测到多个危险信号。" },
            { range: "61-90", label: "高风险", color: "bg-orange-500", icon: <AlertTriangle className="h-4 w-4" />, desc: "显著风险。请谨慎行事。" },
            { range: "38-60", label: "中等风险", color: "bg-yellow-500", icon: <TrendingDown className="h-4 w-4" />, desc: "有一些担忧，但暂不致命。" },
            { range: "0-37", label: "低风险", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" />, desc: "持仓模式看起来非常健康。" }
          ]
        }
      ]
    },
    {
      id: "wallet-labels",
      question: "钱包标签是什么意思？",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      content: [
        {
          type: "labels",
          items: [
            { label: "FRESH", color: "bg-blue-500/20 text-blue-400", desc: "新钱包（交易少于50笔）。通常仅为此代币创建。" },
            { label: "BOT", color: "bg-purple-500/20 text-purple-400", desc: "机器人行为（60秒内超过100笔交易）。" },
            { label: "DORMANT", color: "bg-gray-500/20 text-gray-400", desc: "休眠（7天以上无活动）。可能是长线持有者或已放弃。" },
            { label: "NAMED", color: "bg-yellow-500/20 text-yellow-400", desc: "我们追踪的已知 KOL 钱包。" }
          ]
        }
      ]
    },
    {
      id: "kol-wallets",
      question: "KOL 钱包会影响分数吗？",
      icon: <Info className="h-5 w-5 text-cyan-500" />,
      content: [
        { type: "text", text: "不会。KOL 识别仅供参考。" },
        { type: "text", text: "当你看到以金色高亮显示的钱包时，仅表示我们识别出该钱包属于已知的交易者或大 V。" },
        { type: "text", text: "这不会对 Coal Score 计算产生任何影响。" }
      ]
    }
  ]
};

export default function FAQModal({ isOpen, onClose, locale }: FAQModalProps) {
  if (!isOpen) return null;

  const faqs = locale === 'zh' ? faqData.zh : faqData.en;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <HelpCircle className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {locale === 'zh' ? '产品指南 & 常见问题' : 'Guide & FAQ'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-slate-800 rounded-xl bg-slate-900/30 px-2 transition-all data-[state=open]:bg-slate-900/50 data-[state=open]:border-slate-700"
              >
                <AccordionTrigger className="hover:no-underline py-4 px-3">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex-shrink-0">{faq.icon}</div>
                    <span className="text-base font-semibold text-slate-200">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-5 pt-2">
                  <div className="space-y-4">
                    {faq.content.map((item, idx) => {
                      if (item.type === 'text') {
                        return (
                          <p key={idx} className="text-sm text-slate-400 leading-relaxed">
                            {item.text}
                          </p>
                        );
                      }
                      if (item.type === 'title') {
                        return (
                          <h4 key={idx} className="text-sm font-bold text-slate-200 pt-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-500 rounded-full" />
                            {item.text}
                          </h4>
                        );
                      }
                      if (item.type === 'list') {
                        return (
                          <div key={idx} className="grid gap-2">
                            {item.items?.map((li, lidx) => (
                              <div key={lidx} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-slate-200">{li.label}</p>
                                  <p className="text-[10px] text-slate-500">{li.sub}</p>
                                </div>
                                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                                  {li.value}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      if (item.type === 'grid') {
                        return (
                          <div key={idx} className="grid grid-cols-1 gap-2">
                            {item.items?.map((g, gidx) => (
                              <div key={gidx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                                <div className={`h-10 w-10 rounded-lg ${g.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-black/20`}>
                                  {g.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-200">{g.label}</span>
                                    <span className="text-[10px] font-mono text-slate-500">{g.range}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 truncate">{g.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      if (item.type === 'labels') {
                        return (
                          <div key={idx} className="space-y-2">
                            {item.items?.map((lab, lidx) => (
                              <div key={lidx} className="flex gap-3 items-start">
                                <Badge className={`${lab.color} border-none font-bold py-0.5 px-2 text-[10px] flex-shrink-0 mt-0.5`}>
                                  {lab.label}
                                </Badge>
                                <p className="text-xs text-slate-400 leading-normal">{lab.desc}</p>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/20 text-center">
          <p className="text-[10px] text-slate-500">
            {locale === 'zh' ? '数据仅供参考，不构成投资建议。' : 'Data is for informational purposes only and is not investment advice.'}
          </p>
        </div>
      </div>
    </div>
  );
}
