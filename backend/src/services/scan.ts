import { solanaService } from './solana.js';
import { redisService } from './redis.js';
import { coalScoreCalculator, generateMockData } from './score-calculator.js';
import { bundleDetector } from './bundle-detector.js';
import { TokenScanResult, Holder } from '@/types/index.js';

export class ScanService {
  /**
   * Scan a token contract address
   */
  async scanToken(contractAddress: string, forceRefresh: boolean = false): Promise<TokenScanResult> {
    // Validate address
    if (!this.isValidAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    // Check cache
    const cacheKey = `scan:${contractAddress}`;
    if (!forceRefresh) {
      const cached = await redisService.get<TokenScanResult>(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit for ${contractAddress}`);
        return cached;
      }
    }

    console.log(`🔍 Scanning token: ${contractAddress}`);

    try {
      // Get token metadata
      const metadata = await solanaService.getTokenMetadata(contractAddress);
      
      if (!metadata) {
        throw new Error(`Failed to fetch token metadata for ${contractAddress}`);
      }

      // Get LP and Authority safety
      const lpSafety = await solanaService.getLPSafety(contractAddress);

      // Get developer reputation
      const devReputation = await solanaService.getDevReputation(contractAddress);

      // Get token holders - increase limit for more realistic list
      const holders = await solanaService.getTokenHolders(contractAddress, 50);

      if (holders.length === 0) {
        throw new Error(`No holders found for ${contractAddress}`);
      }

      // Calculate supply percentages
      const totalSupply = metadata.supply;
      holders.forEach((holder) => {
        holder.supplyPercentage = (holder.balance / Number(totalSupply)) * 100;
      });

      // Detect bundles
      const bundles = bundleDetector.detectBundles(holders);

      // Calculate connected wallets for each holder
      holders.forEach((holder) => {
        holder.connectedWallets = this.countConnectedWallets(holder.walletAddress, bundles);
      });

      // Calculate score
      const result = coalScoreCalculator.calculate({
        holders,
        bundles,
        marketCap: metadata.marketCap,
        tokenAge: metadata.age,
        lpSafety,
        devReputation,
        metadata,
      });

      // Set contract address
      result.contractAddress = contractAddress;

      // Cache result
      await redisService.set(cacheKey, result, 120); // 2 minutes TTL

      console.log(`✅ Scan completed for ${contractAddress}: Score ${result.coalScore}`);

      return result;
    } catch (error) {
      console.error(`❌ Scan failed for ${contractAddress}:`, error);
      throw error;
    }
  }

  /**
   * Validate Solana address
   */
  private isValidAddress(address: string): boolean {
    try {
      // Basic validation - Solana addresses are base58 encoded, 32-44 characters
      if (!address || typeof address !== 'string') {
        return false;
      }

      if (address.length < 32 || address.length > 44) {
        return false;
      }

      // Check for valid base58 characters
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
      return base58Regex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Count connected wallets for a holder
   */
  private countConnectedWallets(walletAddress: string, bundles: any[]): number {
    let count = 0;

    bundles.forEach((bundle) => {
      if (bundle.walletAddresses.includes(walletAddress)) {
        count += bundle.walletAddresses.length - 1;
      }
    });

    return count;
  }

  /**
   * Get scan status
   */
  async getScanStatus(contractAddress: string): Promise<{
    cached: boolean;
    timestamp?: number;
  }> {
    const cacheKey = `scan:${contractAddress}`;
    const cached = await redisService.get<TokenScanResult>(cacheKey);

    if (cached) {
      return {
        cached: true,
        timestamp: cached.scanTimestamp,
      };
    }

    return {
      cached: false,
    };
  }

  /**
   * Invalidate cache for a token
   */
  async invalidateCache(contractAddress: string): Promise<boolean> {
    const cacheKey = `scan:${contractAddress}`;
    return await redisService.del(cacheKey);
  }
}

// Export singleton instance
export const scanService = new ScanService();
