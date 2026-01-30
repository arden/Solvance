import {
  Holder,
  Bundle,
  BundleType,
  RiskLevel,
  ScoreBreakdown,
  RedFlag,
  WalletLabelType,
  TokenScanResult,
  LPSafety,
  DevReputation,
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
    lpSafety: LPSafety;
    devReputation: DevReputation;
    metadata?: any;
  }): TokenScanResult {
    const { holders, bundles, marketCap, tokenAge, lpSafety, devReputation, metadata } = result;

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

    // DYNAMIC WEIGHTS BASED ON TOKEN AGE
    let weights = {
      holdTime: 0.35,
      concentration: 0.2,
      connection: 0.45,
      safetyMultiplier: 1.0,
      devHistoryWeight: 0.15, // New weight for dev history
    };

    if (tokenAge < 3600) {
      // Newborn (< 1 hour): Focus on Bundles and Safety
      weights = {
        holdTime: 0.1,
        concentration: 0.2,
        connection: 0.7,
        safetyMultiplier: 1.5,
        devHistoryWeight: 0.25, // History is more important for new tokens
      };
    } else if (tokenAge < 86400) {
      // Early (1-24 hours): Balance between Bundles and Concentration
      weights = {
        holdTime: 0.25,
        concentration: 0.35,
        connection: 0.4,
        safetyMultiplier: 1.2,
        devHistoryWeight: 0.15,
      };
    } else {
      // Mature (> 24 hours): Focus on Hold Time and Concentration
      weights = {
        holdTime: 0.5,
        concentration: 0.3,
        connection: 0.2,
        safetyMultiplier: 1.0,
        devHistoryWeight: 0.1,
      };
    }

    // Calculate LP safety impact with dynamic multiplier
    let lpPenalty = 0;
    if (!lpSafety.isBurned) lpPenalty += 20;
    if (!lpSafety.mintAuthorityDisabled) lpPenalty += 15;
    if (!lpSafety.freezeAuthorityDisabled) lpPenalty += 10;
    if (lpSafety.devLinkage) lpPenalty += 15;
    if (lpSafety.washTradingScore > 20) lpPenalty += lpSafety.washTradingScore / 2;

    // DEV REPUTATION PENALTY
    let devPenalty = 0;
    if (devReputation.isSerialRugger) {
      devPenalty += 50; // Huge penalty for serial ruggers
    } else if (devReputation.reputationScore < 40) {
      devPenalty += 25;
    } else if (devReputation.reputationScore > 80 && devReputation.totalLaunched > 3) {
      devPenalty -= 10; // Bonus for proven developers
    }

    lpPenalty *= weights.safetyMultiplier;

    // Calculate base score (weighted dynamically)
    const baseScore =
      holdTimeScore * weights.holdTime +
      concentrationScore * weights.concentration +
      walletConnectionScore * weights.connection;

    // Calculate total score
    let coalScore = Math.round(
      baseScore + redFlagBonus + sellBonus + agePenalty + maturityBonus + lpPenalty + devPenalty
    );

    // Ensure score is in 0-100 range
    coalScore = Math.max(0, Math.min(100, coalScore));

    // Generate red flags
    const redFlags = this.generateRedFlags(holders, bundles, tokenAge, marketCap, lpSafety, devReputation);

    // Determine risk level
    const riskLevel = this.getRiskLevel(coalScore);

    // Update top holders risk and dev linkage
    const top10Supply = holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPercentage, 0);
    lpSafety.topHoldersRisk = top10Supply > 40;
    lpSafety.devLinkage = holders.some(h => h.labels.includes(WalletLabelType.NAMED));

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
        lpPenalty,
      },
      holders,
      bundles,
      redFlags,
      lpSafety,
      devReputation,
      metadata,
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

    if (totalWeight === 0) return 0;
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
        lpPenalty: 0,
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
      lpSafety: data.lpSafety || {
        isBurned: false,
        mintAuthorityDisabled: false,
        freezeAuthorityDisabled: false,
        lpBurnPercentage: 0,
        topHoldersRisk: true,
        devLinkage: true,
        washTradingScore: 50,
      },
      devReputation: data.devReputation || {
        deployerAddress: 'Unknown',
        totalLaunched: 0,
        rugCount: 0,
        successCount: 0,
        reputationScore: 0,
        isSerialRugger: true,
      },
      metadata: data.metadata,
    };
  }

  /**
   * Generate red flags
   */
  private generateRedFlags(
    holders: Holder[],
    bundles: Bundle[],
    tokenAge: number,
    marketCap: number,
    lpSafety: LPSafety,
    devReputation: DevReputation
  ): RedFlag[] {
    const flags: RedFlag[] = [];

    // Dev History Check
    if (devReputation.isSerialRugger) {
      flags.push({
        type: 'SERIAL_RUGGER',
        description: `Developer has a history of multiple rugs (${devReputation.rugCount}/${devReputation.totalLaunched})! (+50)`,
        score: 50,
      });
    } else if (devReputation.reputationScore < 40 && devReputation.totalLaunched > 1) {
      flags.push({
        type: 'BAD_DEV_HISTORY',
        description: `Developer has poor track record. Reputation: ${devReputation.reputationScore}% (+25)`,
        score: 25,
      });
    }

    // LP Check
    if (!lpSafety.isBurned) {
      flags.push({
        type: 'LP_NOT_BURNED',
        description: 'Liquidity pool tokens are not burned! High rug risk (+20)',
        score: 20,
      });
    }

    // Authority Check
    if (!lpSafety.mintAuthorityDisabled) {
      flags.push({
        type: 'MINT_ENABLED',
        description: 'Mint authority is still enabled! Developer can print more tokens (+15)',
        score: 15,
      });
    }

    if (!lpSafety.freezeAuthorityDisabled) {
      flags.push({
        type: 'FREEZE_ENABLED',
        description: 'Freeze authority is enabled! Developer can blacklist wallets (+10)',
        score: 10,
      });
    }

    if (lpSafety.devLinkage) {
      flags.push({
        type: 'DEV_LINKAGE',
        description: 'Top holders have direct links to the developer wallet! (+15)',
        score: 15,
      });
    }

    if (lpSafety.washTradingScore > 20) {
      flags.push({
        type: 'WASH_TRADING',
        description: `High wash trading activity detected! Score: ${lpSafety.washTradingScore.toFixed(0)}`,
        score: lpSafety.washTradingScore / 2,
      });
    }

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

  const lpSafety: LPSafety = {
    isBurned: Math.random() > 0.3,
    mintAuthorityDisabled: Math.random() > 0.2,
    freezeAuthorityDisabled: Math.random() > 0.1,
    lpBurnPercentage: Math.random() > 0.3 ? 95 + Math.random() * 5 : 0,
    topHoldersRisk: false,
    devLinkage: Math.random() > 0.7,
    washTradingScore: Math.floor(Math.random() * 40),
  };

  const devReputation: DevReputation = {
    deployerAddress: 'Dev' + Math.random().toString(36).slice(2, 8) + '...',
    totalLaunched: Math.floor(Math.random() * 10),
    rugCount: Math.floor(Math.random() * 5),
    successCount: 0,
    reputationScore: 0,
    isSerialRugger: false,
  };
  devReputation.successCount = devReputation.totalLaunched - devReputation.rugCount;
  devReputation.reputationScore = devReputation.totalLaunched > 0 
    ? Math.round((devReputation.successCount / devReputation.totalLaunched) * 100)
    : 100;
  devReputation.isSerialRugger = devReputation.rugCount >= 3;

  const result = coalScoreCalculator.calculate({
    holders,
    bundles,
    marketCap: 15000 + Math.random() * 985000,
    tokenAge: 3600 + Math.random() * 86400 * 3,
    lpSafety,
    devReputation,
  });

  result.contractAddress = contractAddress;
  return result;
}
