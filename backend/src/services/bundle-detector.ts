import { Holder, Bundle, BundleType } from '@/types/index.js';

export class BundleDetector {
  /**
   * Detect wallet bundles (connected wallets)
   */
  detectBundles(holders: Holder[]): Bundle[] {
    const bundles: Bundle[] = [];

    // Detect same block buys
    const sameBlockBundles = this.detectSameBlockBundles(holders);
    bundles.push(...sameBlockBundles);

    // Detect same funder bundles
    const sameFunderBundles = this.detectSameFunderBundles(holders);
    bundles.push(...sameFunderBundles);

    // Detect coordinated sells
    const coordinatedSells = this.detectCoordinatedSells(holders);
    bundles.push(...coordinatedSells);

    return bundles;
  }

  /**
   * Detect wallets that bought in the same block
   */
  private detectSameBlockBundles(holders: Holder[]): Bundle[] {
    const bundles: Bundle[] = [];

    // Group holders by block height (simplified - in production use actual block data)
    const blockGroups = new Map<number, Holder[]>();

    holders.forEach((holder) => {
      // Simplified: use first hold time to estimate block
      const blockHeight = Math.floor(holder.firstHoldTime / 1000); // Simplified

      if (!blockGroups.has(blockHeight)) {
        blockGroups.set(blockHeight, []);
      }
      blockGroups.get(blockHeight)!.push(holder);
    });

    // Create bundles for groups with 3+ wallets
    blockGroups.forEach((group, blockHeight) => {
      if (group.length >= 3) {
        const totalSupply = group.reduce((sum, h) => sum + h.supplyPercentage, 0);

        bundles.push({
          bundleId: `same-block-${blockHeight}`,
          type: BundleType.SAME_BLOCK_BUY,
          walletAddresses: group.map((h) => h.walletAddress),
          totalSupplyPercentage: totalSupply,
          detectionScore: 15 + Math.floor(Math.random() * 10),
          blockHeight,
          detectionTime: Date.now(),
        });
      }
    });

    return bundles;
  }

  /**
   * Detect wallets funded by the same address
   */
  private detectSameFunderBundles(holders: Holder[]): Bundle[] {
    const bundles: Bundle[] = [];

    // Group holders by funder (simplified - in production use actual funding data)
    const funderGroups = new Map<string, Holder[]>();

    holders.forEach((holder) => {
      // Simplified: use wallet address pattern to estimate funder
      const funderAddress = this.estimateFunder(holder.walletAddress);

      if (!funderGroups.has(funderAddress)) {
        funderGroups.set(funderAddress, []);
      }
      funderGroups.get(funderAddress)!.push(holder);
    });

    // Create bundles for groups with 3+ wallets
    funderGroups.forEach((group, funderAddress) => {
      if (group.length >= 3) {
        const totalSupply = group.reduce((sum, h) => sum + h.supplyPercentage, 0);

        bundles.push({
          bundleId: `same-funder-${funderAddress.slice(0, 8)}`,
          type: BundleType.SAME_FUNDER,
          walletAddresses: group.map((h) => h.walletAddress),
          totalSupplyPercentage: totalSupply,
          detectionScore: group.length >= 5 ? 25 : 15,
          funderAddress,
          detectionTime: Date.now(),
        });
      }
    });

    return bundles;
  }

  /**
   * Detect coordinated selling patterns
   */
  private detectCoordinatedSells(holders: Holder[]): Bundle[] {
    const bundles: Bundle[] = [];

    // Find holders with high sell percentage (>50%)
    const heavySellers = holders.filter((h) => h.soldPercentage >= 50);

    // Group by time window (simplified)
    const timeGroups = new Map<number, Holder[]>();

    heavySellers.forEach((holder) => {
      // Simplified: use last activity time to estimate time window
      const timeWindow = Math.floor(holder.lastActivityTime / 60000); // 1 minute windows

      if (!timeGroups.has(timeWindow)) {
        timeGroups.set(timeWindow, []);
      }
      timeGroups.get(timeWindow)!.push(holder);
    });

    // Create bundles for groups with 2+ wallets selling in same window
    timeGroups.forEach((group, timeWindow) => {
      if (group.length >= 2) {
        const totalSupply = group.reduce((sum, h) => sum + h.supplyPercentage, 0);

        bundles.push({
          bundleId: `coordinated-sell-${timeWindow}`,
          type: BundleType.COORDINATED_SELL,
          walletAddresses: group.map((h) => h.walletAddress),
          totalSupplyPercentage: totalSupply,
          detectionScore: 20,
          detectionTime: Date.now(),
        });
      }
    });

    return bundles;
  }

  /**
   * Estimate funder address (simplified)
   */
  private estimateFunder(walletAddress: string): string {
    // Simplified: use first 8 characters as funder identifier
    // In production, use actual funding transaction data
    return walletAddress.slice(0, 8);
  }
}

// Export singleton instance
export const bundleDetector = new BundleDetector();
