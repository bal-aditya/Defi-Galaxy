import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';

// Jupiter API Types
export interface JupiterQuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
  feeBps?: number;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  outAmountWithSlippage: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    feeBps: number;
    feeAccounts: Record<string, string>;
  };
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot: number;
  timeTaken: number;
}

export interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number;
}

export interface SwapInfo {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

// Enhanced Types for Our Module
export interface TokenMetadata {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
    website?: string;
    twitter?: string;
  };
}

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  metadata: TokenMetadata;
}

export interface SwapOptions {
  slippageBps?: number;
  feeBps?: number;
  maxAccounts?: number;
  computeUnitPriceMicroLamports?: number;
  prioritizationFeeLamports?: number;
  asLegacyTransaction?: boolean;
  useSharedAccounts?: boolean;
  useTokenLedger?: boolean;
  destinationTokenAccount?: string;
  dynamicComputeUnitLimit?: boolean;
  skipUserAccountsRpcCalls?: boolean;
  useJupiterAccounts?: boolean;
  minContextSlot?: number;
  maxContextSlot?: number;
}

export interface SwapResult {
  signature: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  route: JupiterQuoteResponse;
  transaction: Transaction;
}

// Scheduler Types
export interface RecurringSwapConfig {
  id: string;
  schedule: string; // cron expression
  fromToken: string;
  toToken: string;
  amount: number;
  wallet: PublicKey;
  enabled: boolean;
  maxSlippageBps?: number;
  createdAt: Date;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export interface TriggerCondition {
  id: string;
  type: 'price' | 'balance' | 'time' | 'custom';
  token?: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  action: 'swap' | 'sell' | 'buy' | 'notify';
  actionParams: any;
  enabled: boolean;
  createdAt: Date;
}

// Route Customization Types
export interface RouteFilter {
  includeDexes?: string[];
  excludeDexes?: string[];
  maxHops?: number;
  minLiquidity?: number;
  preferSpeed?: boolean;
  preferCheapest?: boolean;
  maxSlippageBps?: number;
}

export interface RouteComparison {
  route: JupiterQuoteResponse;
  score: number;
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  dexPath: string[];
}

// Analytics Types
export interface TradeHistory {
  signature: string;
  timestamp: Date;
  fromToken: string;
  toToken: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  fees: number;
  route: string[];
  success: boolean;
  error?: string;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  totalValue: number;
  tokens: TokenBalance[];
  pnl24h: number;
  pnl7d: number;
  pnl30d: number;
}

// Simulation Types
export interface SimulationResult {
  success: boolean;
  logs?: string[];
  unitsConsumed?: number;
  returnData?: string;
  accounts?: any[];
  error?: string;
}

export interface BacktestResult {
  startDate: Date;
  endDate: Date;
  initialAmount: number;
  finalAmount: number;
  totalReturn: number;
  trades: TradeHistory[];
  maxDrawdown: number;
  sharpeRatio: number;
}

// Client Configuration
export interface JupiterClientConfig {
  connection: Connection;
  wallet?: Keypair | PublicKey;
  jupiterApiUrl?: string;
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  timeout?: number;
  retries?: number;
}

// CLI Types
export interface CliOptions {
  from: string;
  to: string;
  amount: number;
  slippage?: number;
  wallet?: string;
  rpcUrl?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

// Error Types
export class JupiterError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'JupiterError';
  }
}

export class InsufficientBalanceError extends JupiterError {
  constructor(token: string, required: string, available: string) {
    super(
      `Insufficient ${token} balance. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_BALANCE',
      { token, required, available }
    );
    this.name = 'InsufficientBalanceError';
  }
}

export class SlippageExceededError extends JupiterError {
  constructor(expected: string, actual: string, slippage: number) {
    super(
      `Slippage exceeded. Expected: ${expected}, Actual: ${actual}, Max Slippage: ${slippage}%`,
      'SLIPPAGE_EXCEEDED',
      { expected, actual, slippage }
    );
    this.name = 'SlippageExceededError';
  }
} 