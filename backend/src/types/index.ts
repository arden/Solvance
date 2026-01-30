// Wallet Label Types
export enum WalletLabelType {
  FRESH = 'FRESH',
  BOT = 'BOT',
  DORMANT = 'DORMANT',
  NAMED = 'NAMED'
}

// Bundle Types
export enum BundleType {
  SAME_BLOCK_BUY = 'SAME_BLOCK_BUY',
  SAME_FUNDER = 'SAME_FUNDER',
  COORDINATED_SELL = 'COORDINATED_SELL'
}

// Risk Levels
export enum RiskLevel {
  EXTREME = 'EXTREME',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Holder Interface
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

// Bundle Interface
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

// Score Breakdown
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

// Red Flag
export interface RedFlag {
  type: string;
  description: string;
  score: number;
}

// Token Scan Result
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Scan Request
export interface ScanRequest {
  contractAddress: string;
  forceRefresh?: boolean;
}

// Token Metadata
export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: bigint;
  marketCap: number;
  price: number;
  age: number;
}

// Transaction Data
export interface Transaction {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  from: string;
  to: string;
  blockHeight: number;
}
