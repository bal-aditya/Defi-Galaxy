import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

import {
  JupiterClientConfig,
  JupiterQuoteRequest,
  JupiterQuoteResponse,
  SwapOptions,
  SwapResult,
  TokenMetadata,
  TokenBalance,
  RouteFilter,
  RouteComparison,
  TradeHistory,
  PortfolioSnapshot,
  SimulationResult,
  RecurringSwapConfig,
  TriggerCondition,
  JupiterError,
  InsufficientBalanceError,
  SlippageExceededError
} from '../types';

import { JupiterSwapService } from './JupiterSwapService';
import { JupiterTokenService } from './JupiterTokenService';
import { JupiterSchedulerService } from './JupiterSchedulerService';
import { JupiterAnalyticsService } from './JupiterAnalyticsService';
import { JupiterSimulationService } from './JupiterSimulationService';

export class JupiterClient {
  private connection: Connection;
  private wallet?: Keypair | PublicKey;
  private apiClient: AxiosInstance;
  private swapService: JupiterSwapService;
  private tokenService: JupiterTokenService;
  private schedulerService: JupiterSchedulerService;
  private analyticsService: JupiterAnalyticsService;
  private simulationService: JupiterSimulationService;

  constructor(config: JupiterClientConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    
    this.apiClient = axios.create({
      baseURL: config.jupiterApiUrl || 'https://quote-api.jup.ag/v6',
      timeout: config.timeout || 30000,
    });

    // Initialize services
    this.swapService = new JupiterSwapService(this.connection, this.apiClient);
    this.tokenService = new JupiterTokenService(this.connection, this.apiClient);
    this.schedulerService = new JupiterSchedulerService(this.connection, this.swapService);
    this.analyticsService = new JupiterAnalyticsService(this.connection);
    this.simulationService = new JupiterSimulationService(this.connection);
  }

  // ===== CORE SWAP FUNCTIONALITY =====

  /**
   * Get the best quote for a token swap
   */
  async getQuote(
    fromToken: string,
    toToken: string,
    amount: number,
    options: SwapOptions = {}
  ): Promise<JupiterQuoteResponse> {
    return this.swapService.getQuote(fromToken, toToken, amount, options);
  }

  /**
   * Get multiple route options for comparison
   */
  async getRouteOptions(
    fromToken: string,
    toToken: string,
    amount: number,
    filter?: RouteFilter
  ): Promise<RouteComparison[]> {
    return this.swapService.getRouteOptions(fromToken, toToken, amount, filter);
  }

  /**
   * Execute a swap with automatic transaction handling
   */
  async executeSwap(
    fromToken: string,
    toToken: string,
    amount: number,
    options: SwapOptions = {}
  ): Promise<SwapResult> {
    if (!this.wallet) {
      throw new JupiterError('Wallet not configured', 'WALLET_REQUIRED');
    }

    return this.swapService.executeSwap(fromToken, toToken, amount, this.wallet, options);
  }

  /**
   * Create a swap transaction without executing it
   */
  async createSwapTransaction(
    fromToken: string,
    toToken: string,
    amount: number,
    options: SwapOptions = {}
  ): Promise<Transaction> {
    return this.swapService.createSwapTransaction(fromToken, toToken, amount, options);
  }

  // ===== TOKEN MANAGEMENT =====

  /**
   * Get token metadata
   */
  async getTokenMetadata(mint: string): Promise<TokenMetadata> {
    return this.tokenService.getTokenMetadata(mint);
  }

  /**
   * Get all supported tokens
   */
  async getSupportedTokens(): Promise<TokenMetadata[]> {
    return this.tokenService.getSupportedTokens();
  }

  /**
   * Get user's token balances
   */
  async getUserTokenBalances(walletAddress?: PublicKey): Promise<TokenBalance[]> {
    const address = walletAddress || (this.wallet instanceof PublicKey ? this.wallet : this.wallet?.publicKey);
    if (!address) {
      throw new JupiterError('Wallet address required', 'WALLET_REQUIRED');
    }
    return this.tokenService.getUserTokenBalances(address);
  }

  /**
   * Check if user has sufficient balance for a swap
   */
  async checkBalance(
    tokenMint: string,
    amount: number,
    walletAddress?: PublicKey
  ): Promise<{ sufficient: boolean; available: number; required: number }> {
    const address = walletAddress || (this.wallet instanceof PublicKey ? this.wallet : this.wallet?.publicKey);
    if (!address) {
      throw new JupiterError('Wallet address required', 'WALLET_REQUIRED');
    }
    return this.tokenService.checkBalance(address, tokenMint, amount);
  }

  // ===== SCHEDULING & AUTOMATION =====

  /**
   * Schedule a recurring swap
   */
  async scheduleRecurringSwap(config: Omit<RecurringSwapConfig, 'id' | 'createdAt'>): Promise<string> {
    return this.schedulerService.scheduleRecurringSwap(config);
  }

  /**
   * Get all scheduled swaps
   */
  async getScheduledSwaps(): Promise<RecurringSwapConfig[]> {
    return this.schedulerService.getScheduledSwaps();
  }

  /**
   * Cancel a scheduled swap
   */
  async cancelScheduledSwap(id: string): Promise<void> {
    return this.schedulerService.cancelScheduledSwap(id);
  }

  /**
   * Set up a trigger condition
   */
  async setTrigger(condition: Omit<TriggerCondition, 'id' | 'createdAt'>): Promise<string> {
    return this.schedulerService.setTrigger(condition);
  }

  /**
   * Get all active triggers
   */
  async getTriggers(): Promise<TriggerCondition[]> {
    return this.schedulerService.getTriggers();
  }

  /**
   * Remove a trigger
   */
  async removeTrigger(id: string): Promise<void> {
    return this.schedulerService.removeTrigger(id);
  }

  // ===== ANALYTICS & SIMULATION =====

  /**
   * Get trade history for a wallet
   */
  async getTradeHistory(
    walletAddress?: PublicKey,
    limit: number = 100
  ): Promise<TradeHistory[]> {
    const address = walletAddress || (this.wallet instanceof PublicKey ? this.wallet : this.wallet?.publicKey);
    if (!address) {
      throw new JupiterError('Wallet address required', 'WALLET_REQUIRED');
    }
    return this.analyticsService.getTradeHistory(address, limit);
  }

  /**
   * Get portfolio snapshot
   */
  async getPortfolioSnapshot(walletAddress?: PublicKey): Promise<PortfolioSnapshot> {
    const address = walletAddress || (this.wallet instanceof PublicKey ? this.wallet : this.wallet?.publicKey);
    if (!address) {
      throw new JupiterError('Wallet address required', 'WALLET_REQUIRED');
    }
    return this.analyticsService.getPortfolioSnapshot(address);
  }

  /**
   * Simulate a swap without executing it
   */
  async simulateSwap(
    fromToken: string,
    toToken: string,
    amount: number,
    options: SwapOptions = {}
  ): Promise<SimulationResult> {
    return this.simulationService.simulateSwap(fromToken, toToken, amount, options);
  }

  /**
   * Backtest a trading strategy
   */
  async backtestStrategy(
    strategy: (date: Date, portfolio: PortfolioSnapshot) => Promise<{ action: 'buy' | 'sell' | 'hold'; token?: string; amount?: number }>,
    startDate: Date,
    endDate: Date,
    initialAmount: number
  ): Promise<any> {
    return this.analyticsService.backtestStrategy(strategy, startDate, endDate, initialAmount);
  }

  // ===== UTILITY METHODS =====

  /**
   * Set or update wallet
   */
  setWallet(wallet: Keypair | PublicKey): void {
    this.wallet = wallet;
  }

  /**
   * Get current wallet
   */
  getWallet(): Keypair | PublicKey | undefined {
    return this.wallet;
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ jupiter: boolean; solana: boolean }> {
    try {
      await this.apiClient.get('/quote');
      await this.connection.getSlot();
      return { jupiter: true, solana: true };
    } catch (error) {
      return { jupiter: false, solana: false };
    }
  }

  /**
   * Get current SOL price
   */
  async getSolPrice(): Promise<number> {
    return this.tokenService.getSolPrice();
  }

  /**
   * Convert SOL to lamports
   */
  static solToLamports(sol: number): number {
    return Math.floor(sol * 1e9);
  }

  /**
   * Convert lamports to SOL
   */
  static lamportsToSol(lamports: number): number {
    return lamports / 1e9;
  }
} 