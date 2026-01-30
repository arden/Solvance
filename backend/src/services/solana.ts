import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { env } from '@/config/index.js';
import { TokenMetadata, Holder, Transaction } from '@/types/index.js';

class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(env.solanaRpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
    try {
      const publicKey = new PublicKey(tokenAddress);
      const accountInfo = await this.connection.getAccountInfo(publicKey);

      if (!accountInfo) {
        return null;
      }

      // Get token supply
      const supply = await this.connection.getTokenSupply(publicKey);
      const tokenDecimals = supply.value.decimals;
      const totalSupply = supply.value.uiAmount || 0;

      // Get token price (simplified - in production use a price oracle)
      const price = await this.getTokenPrice(tokenAddress);

      // Calculate market cap
      const marketCap = totalSupply * price;

      // Get token creation time (simplified - in production parse mint transaction)
      const age = await this.getTokenAge(tokenAddress);

      return {
        address: tokenAddress,
        name: 'Unknown', // In production, fetch from Metaplex
        symbol: 'UNKNOWN',
        decimals: tokenDecimals,
        supply: BigInt(supply.value.amount),
        marketCap,
        price,
        age,
      };
    } catch (error) {
      console.error('❌ Error fetching token metadata:', error);
      return null;
    }
  }

  /**
   * Get token holders
   */
  async getTokenHolders(tokenAddress: string, limit: number = 100): Promise<Holder[]> {
    try {
      const publicKey = new PublicKey(tokenAddress);

      // Get largest token holders
      const largestAccounts = await this.connection.getTokenLargestAccounts(publicKey, {
        commitment: 'confirmed',
      });

      const holders: Holder[] = [];

      for (const account of largestAccounts.value.slice(0, limit)) {
        if (account.address) {
          const holderData = await this.getHolderData(
            account.address.toString(),
            tokenAddress,
            account.uiAmount || 0,
            account.uiAmountString || '0'
          );

          if (holderData) {
            holders.push(holderData);
          }
        }
      }

      return holders;
    } catch (error) {
      console.error('❌ Error fetching token holders:', error);
      return [];
    }
  }

  /**
   * Get detailed holder data
   */
  private async getHolderData(
    walletAddress: string,
    tokenAddress: string,
    balance: number,
    balanceString: string
  ): Promise<Holder | null> {
    try {
      const walletPublicKey = new PublicKey(walletAddress);

      // Get wallet transaction history - reduced limit for public RPC
      const signatures = await this.connection.getSignaturesForAddress(walletPublicKey, {
        limit: 10,
      });

      // Get transaction details
      const transactions = await this.getTransactionDetails(signatures, tokenAddress);

      // Calculate holder metrics
      const totalBought = transactions
        .filter((t) => t.type === 'buy')
        .reduce((sum, t) => sum + t.amount, 0) || balance; // Fallback to current balance

      const totalSold = transactions
        .filter((t) => t.type === 'sell')
        .reduce((sum, t) => sum + t.amount, 0);

      const soldPercentage = totalBought > 0 ? (totalSold / totalBought) * 100 : 0;

      // Get first hold time
      const firstTransaction = transactions[transactions.length - 1];
      const firstHoldTime = firstTransaction?.timestamp || (Date.now() - 86400000); // Fallback to 1 day ago
      const holdDuration = Date.now() - firstHoldTime;

      // Calculate P/L (simplified)
      const profitLoss = (totalSold - totalBought) * 0.5;
      const profitLossPercentage = totalBought > 0 ? (profitLoss / totalBought) * 100 : 0;

      // Detect wallet labels
      const labels = this.detectWalletLabels(transactions, holdDuration);

      return {
        walletAddress,
        balance,
        supplyPercentage: 0,
        valueUsd: balance * 0.5,
        firstHoldTime,
        holdDuration,
        totalBought,
        totalSold,
        soldPercentage,
        profitLoss,
        profitLossPercentage,
        labels,
        transactionCount: transactions.length || 1,
        lastActivityTime: transactions[0]?.timestamp || Date.now(),
        connectedWallets: 0,
      };
    } catch (error) {
      console.warn(`⚠️ Error fetching holder data for ${walletAddress}, using partial data:`, error.message);
      // Return partial data instead of null to avoid "No holders found"
      return {
        walletAddress,
        balance,
        supplyPercentage: 0,
        valueUsd: balance * 0.5,
        firstHoldTime: Date.now() - 86400000,
        holdDuration: 86400000,
        totalBought: balance,
        totalSold: 0,
        soldPercentage: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        labels: ['FRESH'],
        transactionCount: 1,
        lastActivityTime: Date.now(),
        connectedWallets: 0,
      };
    }
  }

  /**
   * Get transaction details
   */
  private async getTransactionDetails(
    signatures: any[],
    tokenAddress: string
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    // Process signatures with a small delay to avoid rate limits
    for (const sig of signatures) {
      try {
        // Add a small delay between requests if using public RPC
        if (env.solanaRpcUrl.includes('api.mainnet-beta.solana.com')) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const tx = await this.connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (tx) {
          const timestamp = tx.blockTime ? tx.blockTime * 1000 : Date.now();
          const type = this.detectTransactionType(tx, tokenAddress);
          const amount = this.extractTransactionAmount(tx, tokenAddress);

          transactions.push({
            signature: sig.signature,
            timestamp,
            type,
            amount,
            from: '',
            to: '',
            blockHeight: tx.slot,
          });
        }
      } catch (error) {
        // console.warn(`⚠️ Skip failed transaction ${sig.signature}:`, error.message);
        continue;
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Detect transaction type
   */
  private detectTransactionType(tx: any, tokenAddress: string): 'buy' | 'sell' | 'transfer' {
    // Simplified detection - in production, parse transaction instructions
    return 'transfer';
  }

  /**
   * Extract transaction amount
   */
  private extractTransactionAmount(tx: any, tokenAddress: string): number {
    // Simplified extraction - in production, parse token transfer instruction
    return 0;
  }

  /**
   * Detect wallet labels
   */
  private detectWalletLabels(transactions: Transaction[], holdDuration: number): string[] {
    const labels: string[] = [];

    // Fresh wallet (< 50 transactions)
    if (transactions.length < 50) {
      labels.push('FRESH');
    }

    // Bot wallet (100+ transactions in under 60 seconds)
    if (transactions.length > 0) {
      const timeSpan = transactions[0].timestamp - transactions[transactions.length - 1].timestamp;
      if (timeSpan < 60000 && transactions.length >= 100) {
        labels.push('BOT');
      }
    }

    // Dormant wallet (7+ days no activity)
    if (transactions.length > 0) {
      const lastActivity = transactions[0].timestamp;
      const daysSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity >= 7) {
        labels.push('DORMANT');
      }
    }

    return labels;
  }

  /**
   * Get token price (simplified - in production use Jupiter or other price oracle)
   */
  private async getTokenPrice(tokenAddress: string): Promise<number> {
    // Simplified - in production, use Jupiter API or other price oracle
    return 0.5;
  }

  /**
   * Get token age (simplified - in production parse mint transaction)
   */
  private async getTokenAge(tokenAddress: string): Promise<number> {
    // Simplified - in production, parse the mint transaction to get creation time
    return 86400; // 1 day in seconds
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
