import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import axios, { AxiosInstance } from 'axios';

import {
  JupiterQuoteRequest,
  JupiterQuoteResponse,
  SwapOptions,
  SwapResult,
  RouteFilter,
  RouteComparison,
  JupiterError,
  InsufficientBalanceError,
  SlippageExceededError
} from '../types';

export class JupiterSwapService {
  private connection: Connection;
  private apiClient: AxiosInstance;

  constructor(connection: Connection, apiClient: AxiosInstance) {
    this.connection = connection;
    this.apiClient = apiClient;
  }

  /**
   * Get the best quote for a token swap
   */
  async getQuote(
    fromToken: string,
    toToken: string,
    amount: number,
    options: SwapOptions = {}
  ): Promise<JupiterQuoteResponse> {
    try {
      const request: JupiterQuoteRequest = {
        inputMint: fromToken,
        outputMint: toToken,
        amount: amount.toString(),
        slippageBps: options.slippageBps || 50, // 0.5% default
        feeBps: options.feeBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: options.asLegacyTransaction || false,
      };

      const response = await this.apiClient.get('/quote', { params: request });
      
      if (!response.data) {
        throw new JupiterError('Invalid quote response', 'INVALID_RESPONSE');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get quote: ${error.response?.data?.message || error.message}`,
          'QUOTE_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
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
    try {
      // Get all possible routes
      const response = await this.apiClient.get('/quote', {
        params: {
          inputMint: fromToken,
          outputMint: toToken,
          amount: amount.toString(),
          slippageBps: filter?.maxSlippageBps || 100,
          onlyDirectRoutes: false,
        }
      });

      if (!response.data) {
        throw new JupiterError('Invalid route response', 'INVALID_RESPONSE');
      }

      // Jupiter returns a single route, not an array
      const route = response.data;
      const comparisons: RouteComparison[] = [];

      // Apply filters
      if (filter) {
        if (filter.includeDexes && !this.matchesDexFilter(route, filter.includeDexes)) {
          return [];
        }
        if (filter.excludeDexes && this.matchesDexFilter(route, filter.excludeDexes)) {
          return [];
        }
        if (filter.maxHops && route.routePlan.length > filter.maxHops) {
          return [];
        }
      }

      const comparison: RouteComparison = {
        route,
        score: this.calculateRouteScore(route, filter),
        estimatedTime: this.estimateRouteTime(route),
        riskLevel: this.assessRouteRisk(route),
        dexPath: this.extractDexPath(route),
      };

      comparisons.push(comparison);

      // Sort by score (higher is better)
      return comparisons.sort((a, b) => b.score - a.score);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get route options: ${error.response?.data?.message || error.message}`,
          'ROUTE_OPTIONS_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
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
    try {
      // Get quote first
      const quote = await this.getQuote(fromToken, toToken, amount, options);

      // Get swap transaction
      const swapRequest = {
        quoteResponse: quote,
        userPublicKey: options.destinationTokenAccount || '', // Will be set by wallet
        wrapUnwrapSOL: true,
        computeUnitPriceMicroLamports: options.computeUnitPriceMicroLamports,
        prioritizationFeeLamports: options.prioritizationFeeLamports,
        asLegacyTransaction: options.asLegacyTransaction || false,
        useSharedAccounts: options.useSharedAccounts || true,
        useTokenLedger: options.useTokenLedger || true,
        destinationTokenAccount: options.destinationTokenAccount,
        dynamicComputeUnitLimit: options.dynamicComputeUnitLimit || true,
        skipUserAccountsRpcCalls: options.skipUserAccountsRpcCalls || false,
        useJupiterAccounts: options.useJupiterAccounts || true,
        minContextSlot: options.minContextSlot,
        maxContextSlot: options.maxContextSlot,
      };

      const response = await this.apiClient.post('/swap', swapRequest);

      if (!response.data || !response.data.swapTransaction) {
        throw new JupiterError('Invalid swap transaction response', 'INVALID_SWAP_RESPONSE');
      }

      // Deserialize the transaction
      const transactionBuffer = Buffer.from(response.data.swapTransaction, 'base64');
      const transaction = Transaction.from(transactionBuffer);

      return transaction;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to create swap transaction: ${error.response?.data?.message || error.message}`,
          'SWAP_TRANSACTION_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
  }

  /**
   * Execute a swap with automatic transaction handling
   */
  async executeSwap(
    fromToken: string,
    toToken: string,
    amount: number,
    wallet: Keypair | PublicKey,
    options: SwapOptions = {}
  ): Promise<SwapResult> {
    try {
      // Check balance first
      const balanceCheck = await this.checkBalance(wallet, fromToken, amount);
      if (!balanceCheck.sufficient) {
        throw new InsufficientBalanceError(
          fromToken,
          amount.toString(),
          balanceCheck.available.toString()
        );
      }

      // Get quote
      const quote = await this.getQuote(fromToken, toToken, amount, options);

      // Create transaction
      const transaction = await this.createSwapTransaction(fromToken, toToken, amount, {
        ...options,
        destinationTokenAccount: await this.getDestinationTokenAccount(wallet, toToken),
      });

      // Sign and send transaction
      const signature = await this.signAndSendTransaction(transaction, wallet);

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new JupiterError(
          `Transaction failed: ${confirmation.value.err}`,
          'TRANSACTION_FAILED',
          confirmation.value
        );
      }

      // Calculate price impact
      const priceImpact = parseFloat(quote.priceImpactPct);

      return {
        signature,
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        priceImpact,
        route: quote,
        transaction,
      };
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        throw error;
      }
      throw new JupiterError(
        `Swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SWAP_EXECUTION_FAILED',
        error
      );
    }
  }

  /**
   * Check if wallet has sufficient balance
   */
  private async checkBalance(
    wallet: Keypair | PublicKey,
    tokenMint: string,
    amount: number
  ): Promise<{ sufficient: boolean; available: number }> {
    const walletAddress = wallet instanceof Keypair ? wallet.publicKey : wallet;
    
    // For SOL
    if (tokenMint === 'So11111111111111111111111111111111111111112') {
      const balance = await this.connection.getBalance(walletAddress);
      return {
        sufficient: balance >= amount,
        available: balance,
      };
    }

    // For SPL tokens
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenMint),
        walletAddress
      );
      
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      
      if (!accountInfo.value) {
        return { sufficient: false, available: 0 };
      }

      return {
        sufficient: accountInfo.value.uiAmount! >= amount,
        available: accountInfo.value.uiAmount!,
      };
    } catch (error) {
      // Token account doesn't exist
      return { sufficient: false, available: 0 };
    }
  }

  /**
   * Get destination token account for the swap
   */
  private async getDestinationTokenAccount(
    wallet: Keypair | PublicKey,
    tokenMint: string
  ): Promise<string> {
    const walletAddress = wallet instanceof Keypair ? wallet.publicKey : wallet;
    
    if (tokenMint === 'So11111111111111111111111111111111111111112') {
      return walletAddress.toString();
    }

    const tokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      walletAddress
    );
    
    return tokenAccount.toString();
  }

  /**
   * Sign and send transaction
   */
  private async signAndSendTransaction(
    transaction: Transaction,
    wallet: Keypair | PublicKey
  ): Promise<string> {
    if (wallet instanceof Keypair) {
      // Direct signing with Keypair
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.sign(wallet);
      
      return await this.connection.sendRawTransaction(transaction.serialize());
    } else {
      // For PublicKey, we need to get the transaction signed by the wallet
      // This would typically be handled by a wallet adapter in a frontend
      throw new JupiterError(
        'Direct transaction signing requires a Keypair. Use wallet adapter for PublicKey wallets.',
        'WALLET_SIGNING_REQUIRED'
      );
    }
  }

  /**
   * Calculate route score based on preferences
   */
  private calculateRouteScore(route: JupiterQuoteResponse, filter?: RouteFilter): number {
    let score = 0;

    // Base score from output amount (higher is better)
    score += parseFloat(route.outAmount) / 1e6; // Normalize

    // Penalty for price impact
    const priceImpact = Math.abs(parseFloat(route.priceImpactPct));
    score -= priceImpact * 100;

    // Bonus for fewer hops (faster)
    if (filter?.preferSpeed) {
      score += (10 - route.routePlan.length) * 10;
    }

    // Bonus for cheaper routes
    if (filter?.preferCheapest) {
      score += 1000; // Base bonus for cheapest preference
    }

    return score;
  }

  /**
   * Estimate route execution time
   */
  private estimateRouteTime(route: JupiterQuoteResponse): number {
    // Base time + time per hop
    return 2 + route.routePlan.length * 0.5;
  }

  /**
   * Assess route risk level
   */
  private assessRouteRisk(route: JupiterQuoteResponse): 'low' | 'medium' | 'high' {
    const priceImpact = Math.abs(parseFloat(route.priceImpactPct));
    const hopCount = route.routePlan.length;

    if (priceImpact < 0.5 && hopCount <= 2) return 'low';
    if (priceImpact < 2 && hopCount <= 3) return 'medium';
    return 'high';
  }

  /**
   * Extract DEX path from route
   */
  private extractDexPath(route: JupiterQuoteResponse): string[] {
    return route.routePlan.map(plan => plan.swapInfo.label);
  }

  /**
   * Check if route matches DEX filter
   */
  private matchesDexFilter(route: JupiterQuoteResponse, dexes: string[]): boolean {
    const routeDexes = this.extractDexPath(route);
    return routeDexes.some(dex => dexes.includes(dex));
  }
} 