// 类型定义

export enum WalletLabelType {
  FRESH = 'FRESH',
  BOT = 'BOT',
  DORMANT = 'DORMANT',
  NAMED = 'NAMED'
}

export enum BundleType {
  SAME_BLOCK_BUY = 'SAME_BLOCK_BUY',
  SAME_FUNDER = 'SAME_FUNDER',
  COORDINATED_SELL = 'COORDINATED_SELL'
}

export enum RiskLevel {
  EXTREME = 'EXTREME',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Holder {
  walletAddress: string;
  balance: number;
  supplyPercentage: number;
  valueUsd: number;
  firstHoldTime: number;
  holdDuration: number;
  totalBought: number;
  totalSold: number;
  soldPercentage: number;
  profitLoss: number;
  profitLossPercentage: number;
  labels: WalletLabelType[];
  transactionCount: number;
  lastActivityTime: number;
  connectedWallets: number;
}

export interface Bundle {
  bundleId: string;
  type: BundleType;
  walletAddresses: string[];
  totalSupplyPercentage: number;
  detectionScore: number;
  blockHeight?: number;
  funderAddress?: string;
  detectionTime: number;
}

export interface ScoreBreakdown {
  holdTimeScore: number;
  concentrationScore: number;
  walletConnectionScore: number;
  baseScore: number;
  redFlagBonus: number;
  sellBonus: number;
  agePenalty: number;
  maturityBonus: number;
}

export interface RedFlag {
  type: string;
  description: string;
  score: number;
}

export interface TokenScanResult {
  contractAddress: string;
  scanTimestamp: number;
  coalScore: number;
  riskLevel: RiskLevel;
  marketCap: number;
  tokenAge: number;
  scoreBreakdown: ScoreBreakdown;
  holders: Holder[];
  bundles: Bundle[];
  redFlags: RedFlag[];
}

// 评分计算器

export class CoalScoreCalculator {
  /**
   * 计算完整的 Coal Score
   */
  calculate(result: {
    holders: Holder[];
    bundles: Bundle[];
    marketCap: number;
    tokenAge: number;
  }): TokenScanResult {
    const { holders, bundles, marketCap, tokenAge } = result;

    // 市值检查覆盖
    if (marketCap < 15000) {
      return this.createExtremeRiskResult(result);
    }

    // 计算各项分数
    const holdTimeScore = this.calculateHoldTimeScore(holders);
    const concentrationScore = this.calculateConcentrationScore(holders);
    const walletConnectionScore = this.calculateConnectionScore(holders, bundles);
    const redFlagBonus = this.calculateRedFlagBonus(holders, bundles);
    const sellBonus = this.calculateSellBonus(holders);
    const agePenalty = this.calculateAgePenalty(tokenAge);
    const maturityBonus = this.calculateMaturityBonus(tokenAge, marketCap);

    // 计算基础分数（加权）
    const baseScore = 
      holdTimeScore * 0.35 + 
      concentrationScore * 0.20 + 
      walletConnectionScore * 0.45;

    // 计算总分
    let coalScore = Math.round(baseScore + redFlagBonus + sellBonus + agePenalty + maturityBonus);

    // 确保分数在 0-100 范围内
    coalScore = Math.max(0, Math.min(100, coalScore));

    // 生成红旗标识
    const redFlags = this.generateRedFlags(holders, bundles, tokenAge, marketCap);

    // 确定风险等级
    const riskLevel = this.getRiskLevel(coalScore);

    return {
      contractAddress: '',
      scanTimestamp: Date.now(),
      coalScore,
      riskLevel,
      marketCap,
      tokenAge,
      scoreBreakdown: {
        holdTimeScore: Math.round(holdTimeScore),
        concentrationScore: Math.round(concentrationScore),
        walletConnectionScore: Math.round(walletConnectionScore),
        baseScore: Math.round(baseScore),
        redFlagBonus,
        sellBonus,
        agePenalty,
        maturityBonus
      },
      holders,
      bundles,
      redFlags
    };
  }

  /**
   * 计算持仓时间分数（加权）
   */
  private calculateHoldTimeScore(holders: Holder[]): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    holders.forEach((holder, index) => {
      const weight = this.getPositionWeight(index);
      const score = this.getHoldTimeScore(holder.holdDuration);
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });

    return totalWeightedScore / totalWeight;
  }

  /**
   * 计算集中度分数
   */
  private calculateConcentrationScore(holders: Holder[]): number {
    const top30Supply = holders.slice(0, 30).reduce((sum, h) => sum + h.supplyPercentage, 0);
    // 50% 供应量 = 100 分
    return Math.min(top30Supply * 2, 100);
  }

  /**
   * 计算钱包关联分数
   */
  private calculateConnectionScore(holders: Holder[], bundles: Bundle[]): number {
    let score = 0;

    // 同区块买入
    const sameBlockBundles = bundles.filter(b => b.type === BundleType.SAME_BLOCK_BUY);
    score += sameBlockBundles.length * 20;

    // 同一资金来源
    const sameFunderBundles = bundles.filter(b => b.type === BundleType.SAME_FUNDER);
    sameFunderBundles.forEach(bundle => {
      score += bundle.walletAddresses.length >= 5 ? 25 : 15;
    });

    // 控制供应量
    const controlledSupplyBundles = bundles.filter(b => b.totalSupplyPercentage > 10);
    controlledSupplyBundles.forEach(() => {
      score += 20;
    });

    return Math.min(score, 100);
  }

  /**
   * 计算红旗加分
   */
  private calculateRedFlagBonus(holders: Holder[], bundles: Bundle[]): number {
    let bonus = 0;

    // Top 10 持仓 > 40%
    const top10Supply = holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPercentage, 0);
    if (top10Supply > 40) {
      bonus += Math.min(15, (top10Supply - 40) / 2);
    }

    // 2+ 大持仓者（>5%）且持仓 < 2天
    const largeHolders = holders.filter(h => h.supplyPercentage > 5 && h.holdDuration < 172800);
    if (largeHolders.length >= 2) {
      bonus += Math.min(12, largeHolders.length * 6);
    }

    return Math.min(bonus, 25);
  }

  /**
   * 计算卖出行为加分
   */
  private calculateSellBonus(holders: Holder[]): number {
    let bonus = 0;

    // 重度卖出者（50%+）
    const heavySellers = holders.filter(h => h.soldPercentage >= 50);
    heavySellers.forEach(holder => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 6 * weight;
    });

    // 中度卖出者（25-50%）
    const moderateSellers = holders.filter(h => h.soldPercentage >= 25 && h.soldPercentage < 50);
    moderateSellers.forEach(holder => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 4 * weight;
    });

    // 总卖出量 > 10%
    const totalSold = holders.reduce((sum, h) => sum + (h.totalSold / h.totalBought), 0);
    if (totalSold > 0.1) {
      bonus += Math.min(15, totalSold * 50);
    }

    return Math.min(bonus, 25);
  }

  /**
   * 计算年龄惩罚
   */
  private calculateAgePenalty(tokenAge: number): number {
    if (tokenAge < 3600) return 25;      // < 1小时
    if (tokenAge < 7200) return 20;      // 1-2小时
    if (tokenAge < 14400) return 12;     // 2-4小时
    if (tokenAge < 28800) return 6;      // 4-8小时
    return 0;                            // > 8小时
  }

  /**
   * 计算成熟度奖励
   */
  private calculateMaturityBonus(tokenAge: number, marketCap: number): number {
    if (tokenAge > 2592000) { // > 30天
      if (marketCap > 1000000) return -15;
      if (marketCap > 500000) return -10;
      return -5;
    }
    return 0;
  }

  /**
   * 获取位置权重
   */
  private getPositionWeight(index: number): number {
    if (index < 10) return 3;   // Top 10
    if (index < 20) return 2;   // Mid 10
    return 1;                   // Bottom
  }

  /**
   * 获取持仓时间分数（0-100）
   */
  private getHoldTimeScore(duration: number): number {
    if (duration < 3600) return 100;       // < 1小时
    if (duration < 86400) return 80;       // < 1天
    if (duration < 604800) return 50;      // < 1周
    if (duration < 2592000) return 30;     // < 30天
    return 10;                             // > 30天
  }

  /**
   * 获取风险等级
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 91) return RiskLevel.EXTREME;
    if (score >= 61) return RiskLevel.HIGH;
    if (score >= 38) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * 创建极端风险结果（低市值）
   */
  private createExtremeRiskResult(data: any): TokenScanResult {
    return {
      contractAddress: '',
      scanTimestamp: Date.now(),
      coalScore: 90,
      riskLevel: RiskLevel.EXTREME,
      marketCap: data.marketCap,
      tokenAge: data.tokenAge,
      scoreBreakdown: {
        holdTimeScore: 0,
        concentrationScore: 0,
        walletConnectionScore: 0,
        baseScore: 0,
        redFlagBonus: 0,
        sellBonus: 0,
        agePenalty: 0,
        maturityBonus: 0
      },
      holders: data.holders,
      bundles: data.bundles,
      redFlags: [
        { type: 'LOW_MARKET_CAP', description: '市值低于 $15k，风险极高', score: 90 }
      ]
    };
  }

  /**
   * 生成红旗标识
   */
  private generateRedFlags(
    holders: Holder[],
    bundles: Bundle[],
    tokenAge: number,
    marketCap: number
  ): RedFlag[] {
    const flags: RedFlag[] = [];

    // Top 10 持仓 > 40%
    const top10Supply = holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPercentage, 0);
    if (top10Supply > 40) {
      flags.push({
        type: 'CONCENTRATION',
        description: `Top 10 持仓 >40% 供应量 (+${Math.min(15, (top10Supply - 40) / 2).toFixed(0)})`,
        score: Math.min(15, (top10Supply - 40) / 2)
      });
    }

    // 同区块买入
    const sameBlockBundles = bundles.filter(b => b.type === BundleType.SAME_BLOCK_BUY);
    if (sameBlockBundles.length > 0) {
      flags.push({
        type: 'BUNDLE',
        description: `${sameBlockBundles.length}个同区块买入 (+${sameBlockBundles.length * 20})`,
        score: sameBlockBundles.length * 20
      });
    }

    // 重度卖出者
    const heavySellers = holders.filter(h => h.soldPercentage >= 50);
    if (heavySellers.length >= 2) {
      flags.push({
        type: 'SELL',
        description: `${heavySellers.length}个重度卖出者 (+${Math.min(12, heavySellers.length * 6)})`,
        score: Math.min(12, heavySellers.length * 6)
      });
    }

    // 年龄惩罚
    if (tokenAge < 3600) {
      flags.push({
        type: 'AGE',
        description: '代币创建不到1小时 (+25)',
        score: 25
      });
    }

    // 低市值
    if (marketCap < 15000) {
      flags.push({
        type: 'LOW_MARKET_CAP',
        description: '市值低于 $15k，风险极高',
        score: 90
      });
    }

    return flags;
  }
}

// 导出单例
export const coalScoreCalculator = new CoalScoreCalculator();

// 模拟数据生成器

export function generateMockData(contractAddress: string): TokenScanResult {
  // 生成随机持仓者
  const holders: Holder[] = [];
  const numHolders = 5 + Math.floor(Math.random() * 15);

  let remainingSupply = 100;
  for (let i = 0; i < numHolders; i++) {
    const isLast = i === numHolders - 1;
    const supply = isLast ? remainingSupply : Math.random() * (remainingSupply * 0.3);
    remainingSupply -= supply;

    const labels: WalletLabelType[] = [];
    if (Math.random() > 0.7) labels.push(WalletLabelType.FRESH);
    if (Math.random() > 0.8) labels.push(WalletLabelType.BOT);
    if (Math.random() > 0.85) labels.push(WalletLabelType.DORMANT);

    holders.push({
      walletAddress: `${Math.random().toString(36).slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`,
      balance: supply * 10000,
      supplyPercentage: supply,
      valueUsd: supply * 250,
      firstHoldTime: Date.now() - Math.random() * 86400000,
      holdDuration: Math.random() * 86400,
      totalBought: supply * 10000 * (1 + Math.random()),
      totalSold: supply * 10000 * Math.random() * 0.7,
      soldPercentage: Math.random() * 70,
      profitLoss: (Math.random() - 0.3) * 500,
      profitLossPercentage: (Math.random() - 0.3) * 100,
      labels,
      transactionCount: Math.floor(Math.random() * 200),
      lastActivityTime: Date.now() - Math.random() * 604800000,
      connectedWallets: Math.floor(Math.random() * 5)
    });
  }

  // 生成随机 Bundle
  const bundles: Bundle[] = [];
  const numBundles = Math.floor(Math.random() * 4);
  
  for (let i = 0; i < numBundles; i++) {
    const type = Math.random() > 0.5 ? BundleType.SAME_BLOCK_BUY : BundleType.SAME_FUNDER;
    const bundleHolders = holders.slice(0, 3 + Math.floor(Math.random() * 3));
    
    bundles.push({
      bundleId: `bundle-${i}`,
      type,
      walletAddresses: bundleHolders.map(h => h.walletAddress),
      totalSupplyPercentage: bundleHolders.reduce((sum, h) => sum + h.supplyPercentage, 0),
      detectionScore: 15 + Math.floor(Math.random() * 10),
      blockHeight: type === BundleType.SAME_BLOCK_BUY ? 24567890 + Math.floor(Math.random() * 100) : undefined,
      funderAddress: type === BundleType.SAME_FUNDER ? `fund${i}...addr` : undefined,
      detectionTime: Date.now()
    });
  }

  return coalScoreCalculator.calculate({
    holders,
    bundles,
    marketCap: 10000 + Math.random() * 990000,
    tokenAge: 1800 + Math.random() * 86400
  });
}
