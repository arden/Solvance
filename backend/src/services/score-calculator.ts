import {
  Holder,
  Bundle,
  BundleType,
  RiskLevel,
  ScoreBreakdown,
  RedFlag,
  WalletLabelType,
  TokenScanResult,
} from '@/types/index.js';

export class CoalScoreCalculator {
  /**
   * Calculate the complete Coal Score
   */
  calculate(result: {
    holders: Holder[];
    bundles: Bundle[];
    marketCap: number;
    tokenAge: number;
  }): TokenScanResult {
    const { holders, bundles, marketCap, tokenAge } = result;

    // Market cap check override
    if (marketCap < 15000) {
      return this.createExtremeRiskResult(result);
    }

    // Calculate individual scores
    const holdTimeScore = this.calculateHoldTimeScore(holders);
    const concentrationScore = this.calculateConcentrationScore(holders);
    const walletConnectionScore = this.calculateConnectionScore(holders, bundles);
    const redFlagBonus = this.calculateRedFlagBonus(holders, bundles);
    const sellBonus = this.calculateSellBonus(holders);
    const agePenalty = this.calculateAgePenalty(tokenAge);
    const maturityBonus = this.calculateMaturityBonus(tokenAge, marketCap);

    // Calculate base score (weighted)
    const baseScore =
      holdTimeScore * 0.35 +
      concentrationScore * 0.2 +
      walletConnectionScore * 0.45;

    // Calculate total score
    let coalScore = Math.round(
      baseScore + redFlagBonus + sellBonus + agePenalty + maturityBonus
    );

    // Ensure score is in 0-100 range
    coalScore = Math.max(0, Math.min(100, coalScore));

    // Generate red flags
    const redFlags = this.generateRedFlags(holders, bundles, tokenAge, marketCap);

    // Determine risk level
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
        maturityBonus,
      },
      holders,
      bundles,
      redFlags,
    };
  }

  /**
   * Calculate hold time score (weighted)
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
   * Calculate concentration score
   */
  private calculateConcentrationScore(holders: Holder[]): number {
    const top30Supply = holders
      .slice(0, 30)
      .reduce((sum, h) => sum + h.supplyPercentage, 0);
    // 50% supply = 100 points
    return Math.min(top30Supply * 2, 100);
  }

  /**
   * Calculate wallet connection score
   */
  private calculateConnectionScore(holders: Holder[], bundles: Bundle[]): number {
    let score = 0;

    // Same block buys
    const sameBlockBundles = bundles.filter(
      (b) => b.type === BundleType.SAME_BLOCK_BUY
    );
    score += sameBlockBundles.length * 20;

    // Same funder
    const sameFunderBundles = bundles.filter(
      (b) => b.type === BundleType.SAME_FUNDER
    );
    sameFunderBundles.forEach((bundle) => {
      score += bundle.walletAddresses.length >= 5 ? 25 : 15;
    });

    // Controlled supply
    const controlledSupplyBundles = bundles.filter(
      (b) => b.totalSupplyPercentage > 10
    );
    controlledSupplyBundles.forEach(() => {
      score += 20;
    });

    return Math.min(score, 100);
  }

  /**
   * Calculate red flag bonus
   */
  private calculateRedFlagBonus(holders: Holder[], bundles: Bundle[]): number {
    let bonus = 0;

    // Top 10 holders > 40%
    const top10Supply = holders
      .slice(0, 10)
      .reduce((sum, h) => sum + h.supplyPercentage, 0);
    if (top10Supply > 40) {
      bonus += Math.min(15, (top10Supply - 40) / 2);
    }

    // 2+ large holders (>5%) with < 2 day hold
    const largeHolders = holders.filter(
      (h) => h.supplyPercentage > 5 && h.holdDuration < 172800
    );
    if (largeHolders.length >= 2) {
      bonus += Math.min(12, largeHolders.length * 6);
    }

    return Math.min(bonus, 25);
  }

  /**
   * Calculate sell behavior bonus
   */
  private calculateSellBonus(holders: Holder[]): number {
    let bonus = 0;

    // Heavy sellers (50%+)
    const heavySellers = holders.filter((h) => h.soldPercentage >= 50);
    heavySellers.forEach((holder) => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 6 * weight;
    });

    // Moderate sellers (25-50%)
    const moderateSellers = holders.filter(
      (h) => h.soldPercentage >= 25 && h.soldPercentage < 50
    );
    moderateSellers.forEach((holder) => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 4 * weight;
    });

    // Total sold > 10%
    const totalSold = holders.reduce(
      (sum, h) => sum + h.totalSold / h.totalBought,
      0
    );
    if (totalSold > 0.1) {
      bonus += Math.min(15, totalSold * 50);
    }

    return Math.min(bonus, 25);
  }

  /**
   * Calculate age penalty
   */
  private calculateAgePenalty(tokenAge: number): number {
    if (tokenAge < 3600) return 25; // < 1 hour
    if (tokenAge < 7200) return 20; // 1-2 hours
    if (tokenAge < 14400) return 12; // 2-4 hours
    if (tokenAge < 28800) return 6; // 4-8 hours
    return 0; // > 8 hours
  }

  /**
   * Calculate maturity bonus
   */
  private calculateMaturityBonus(tokenAge: number, marketCap: number): number {
    if (tokenAge > 2592000) {
      // > 30 days
      if (marketCap > 1000000) return -15;
      if (marketCap > 500000) return -10;
      return -5;
    }
    return 0;
  }

  /**
   * Get position weight
   */
  private getPositionWeight(index: number): number {
    if (index < 10) return 3; // Top 10
    if (index < 20) return 2; // Mid 10
    return 1; // Bottom
  }

  /**
   * Get hold time score (0-100)
   */
  private getHoldTimeScore(duration: number): number {
    if (duration < 3600) return 100; // < 1 hour
    if (duration < 86400) return 80; // < 1 day
    if (duration < 604800) return 50; // < 1 week
    if (duration < 2592000) return 30; // < 30 days
    return 10; // > 30 days
  }

  /**
   * Get risk level
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 91) return RiskLevel.EXTREME;
    if (score >= 61) return RiskLevel.HIGH;
    if (score >= 38) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * Create extreme risk result (low market cap)
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
        maturityBonus: 0,
      },
      holders: data.holders,
      bundles: data.bundles,
      redFlags: [
        {
          type: 'LOW_MARKET_CAP',
          description: 'Market cap below $15k, extremely high risk',
          score: 90,
        },
      ],
    };
  }

  /**
   * Generate red flags
   */
  private generateRedFlags(
    holders: Holder[],
    bundles: Bundle[],
    tokenAge: number,
    marketCap: number
  ): RedFlag[] {
    const flags: RedFlag[] = [];

    // Top 10 holders > 40%
    const top10Supply = holders
      .slice(0, 10)
      .reduce((sum, h) => sum + h.supplyPercentage, 0);
    if (top10Supply > 40) {
      flags.push({
        type: 'CONCENTRATION',
        description: `Top 10 holders own >40% supply (+${Math.min(
          15,
          (top10Supply - 40) / 2
        ).toFixed(0)})`,
        score: Math.min(15, (top10Supply - 40) / 2),
      });
    }

    // Same block buys
    const sameBlockBundles = bundles.filter(
      (b) => b.type === BundleType.SAME_BLOCK_BUY
    );
    if (sameBlockBundles.length > 0) {
      flags.push({
        type: 'BUNDLE',
        description: `${sameBlockBundles.length} same-block buys (+${
          sameBlockBundles.length * 20
        })`,
        score: sameBlockBundles.length * 20,
      });
    }

    // Heavy sellers
    const heavySellers = holders.filter((h) => h.soldPercentage >= 50);
    if (heavySellers.length >= 2) {
      flags.push({
        type: 'SELL',
        description: `${heavySellers.length} heavy sellers (+${Math.min(
          12,
          heavySellers.length * 6
        )})`,
        score: Math.min(12, heavySellers.length * 6),
      });
    }

    // Age penalty
    if (tokenAge < 3600) {
      flags.push({
        type: 'AGE',
        description: 'Token created less than 1 hour ago (+25)',
        score: 25,
      });
    }

    // Low market cap
    if (marketCap < 15000) {
      flags.push({
        type: 'LOW_MARKET_CAP',
        description: 'Market cap below $15k, extremely high risk',
        score: 90,
      });
    }

    return flags;
  }
}

// Export singleton instance
export const coalScoreCalculator = new CoalScoreCalculator();

/**
 * Generate mock data for testing or fallback
 */
export function generateMockData(contractAddress: string): TokenScanResult {
  // Generate random holders
  const holders: Holder[] = [];
  const numHolders = 15 + Math.floor(Math.random() * 25);

  let remainingSupply = 100;
  for (let i = 0; i < numHolders; i++) {
    const isLast = i === numHolders - 1;
    const supply = isLast
      ? remainingSupply
      : Math.random() * (remainingSupply * 0.2);
    remainingSupply -= supply;

    const labels: WalletLabelType[] = [];
    if (Math.random() > 0.7) labels.push(WalletLabelType.FRESH);
    if (Math.random() > 0.8) labels.push(WalletLabelType.BOT);
    if (Math.random() > 0.85) labels.push(WalletLabelType.DORMANT);

    holders.push({
      walletAddress: `${Math.random()
        .toString(36)
        .slice(2, 8)}...${Math.random().toString(36).slice(2, 6)}`,
      balance: supply * 10000,
      supplyPercentage: supply,
      valueUsd: supply * 250,
      firstHoldTime: Date.now() - Math.random() * 86400000 * 7,
      holdDuration: Math.random() * 86400 * 7,
      totalBought: supply * 10000 * (1 + Math.random()),
      totalSold: supply * 10000 * Math.random() * 0.7,
      soldPercentage: Math.random() * 70,
      profitLoss: (Math.random() - 0.3) * 500,
      profitLossPercentage: (Math.random() - 0.3) * 100,
      labels,
      transactionCount: Math.floor(Math.random() * 200),
      lastActivityTime: Date.now() - Math.random() * 604800000,
      connectedWallets: Math.floor(Math.random() * 5),
    });
  }

  // Generate random bundles
  const bundles: Bundle[] = [];
  const numBundles = Math.floor(Math.random() * 4);

  for (let i = 0; i < numBundles; i++) {
    const type =
      Math.random() > 0.5
        ? BundleType.SAME_BLOCK_BUY
        : BundleType.SAME_FUNDER;
    const bundleHolders = holders.slice(0, 3 + Math.floor(Math.random() * 3));

    bundles.push({
      bundleId: `bundle-${i}`,
      type,
      walletAddresses: bundleHolders.map((h) => h.walletAddress),
      totalSupplyPercentage: bundleHolders.reduce(
        (sum, h) => sum + h.supplyPercentage,
        0
      ),
      detectionScore: 15 + Math.floor(Math.random() * 10),
      blockHeight:
        type === BundleType.SAME_BLOCK_BUY
          ? 24567890 + Math.floor(Math.random() * 100)
          : undefined,
      funderAddress:
        type === BundleType.SAME_FUNDER ? `fund${i}...addr` : undefined,
      detectionTime: Date.now(),
    });
  }

  const result = coalScoreCalculator.calculate({
    holders,
    bundles,
    marketCap: 15000 + Math.random() * 985000,
    tokenAge: 3600 + Math.random() * 86400 * 3,
  });

  result.contractAddress = contractAddress;
  return result;
}
