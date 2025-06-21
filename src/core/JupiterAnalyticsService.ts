import { Connection, PublicKey } from '@solana/web3.js';

import {
  TradeHistory,
  PortfolioSnapshot,
  TokenBalance,
  JupiterError
} from '../types';

export class JupiterAnalyticsService {
  private connection: Connection;
  private tradeHistoryCache: Map<string, TradeHistory[]> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Get trade history for a wallet
   */
  async getTradeHistory(
    walletAddress: PublicKey,
    limit: number = 100
  ): Promise<TradeHistory[]> {
    try {
      // Check cache first
      const cacheKey = walletAddress.toString();
      if (this.tradeHistoryCache.has(cacheKey)) {
        return this.tradeHistoryCache.get(cacheKey)!.slice(0, limit);
      }

      // Get transaction history from Solana
      const signatures = await this.connection.getSignaturesForAddress(
        walletAddress,
        { limit }
      );

      const trades: TradeHistory[] = [];

      for (const sig of signatures) {
        try {
          const transaction = await this.connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (transaction && this.isJupiterSwap(transaction)) {
            const trade = await this.parseJupiterTransaction(transaction, sig.signature);
            if (trade) {
              trades.push(trade);
            }
          }
        } catch (error) {
          // Skip failed transactions
          console.warn(`Failed to parse transaction ${sig.signature}:`, error);
        }
      }

      // Cache the results
      this.tradeHistoryCache.set(cacheKey, trades);

      return trades.slice(0, limit);
    } catch (error) {
      throw new JupiterError(
        `Failed to get trade history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRADE_HISTORY_FAILED',
        error
      );
    }
  }

  /**
   * Get portfolio snapshot
   */
  async getPortfolioSnapshot(walletAddress: PublicKey): Promise<PortfolioSnapshot> {
    try {
      // Get current token balances
      const balances = await this.getCurrentBalances(walletAddress);
      
      // Calculate total value
      const totalValue = await this.calculatePortfolioValue(balances);
      
      // Calculate PnL
      const pnl24h = await this.calculatePnL(walletAddress, 24);
      const pnl7d = await this.calculatePnL(walletAddress, 7 * 24);
      const pnl30d = await this.calculatePnL(walletAddress, 30 * 24);

      return {
        timestamp: new Date(),
        totalValue,
        tokens: balances,
        pnl24h,
        pnl7d,
        pnl30d,
      };
    } catch (error) {
      throw new JupiterError(
        `Failed to get portfolio snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PORTFOLIO_SNAPSHOT_FAILED',
        error
      );
    }
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
    try {
      const results = {
        startDate,
        endDate,
        initialAmount,
        finalAmount: initialAmount,
        totalReturn: 0,
        trades: [] as TradeHistory[],
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        totalTrades: 0,
        profitableTrades: 0,
      };

      let currentDate = new Date(startDate);
      let currentPortfolio = initialAmount;
      let peakPortfolio = initialAmount;

      while (currentDate <= endDate) {
        // Get historical portfolio snapshot for this date
        const portfolioSnapshot = await this.getHistoricalPortfolioSnapshot(currentDate);
        
        // Execute strategy
        const strategyResult = await strategy(currentDate, portfolioSnapshot);
        
        if (strategyResult.action !== 'hold') {
          // Simulate trade execution
          const tradeResult = await this.simulateTrade(
            strategyResult.action,
            strategyResult.token!,
            strategyResult.amount!,
            currentDate
          );
          
          if (tradeResult) {
            results.trades.push(tradeResult);
            results.totalTrades++;
            
            // Update portfolio value
            const tradePnL = tradeResult.success ? 
              (parseFloat(tradeResult.outputAmount) - parseFloat(tradeResult.inputAmount)) : 0;
            
            currentPortfolio += tradePnL;
            
            if (tradePnL > 0) {
              results.profitableTrades++;
            }
            
            // Update peak and drawdown
            if (currentPortfolio > peakPortfolio) {
              peakPortfolio = currentPortfolio;
            }
            
            const drawdown = (peakPortfolio - currentPortfolio) / peakPortfolio;
            if (drawdown > results.maxDrawdown) {
              results.maxDrawdown = drawdown;
            }
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate final metrics
      results.finalAmount = currentPortfolio;
      results.totalReturn = (currentPortfolio - initialAmount) / initialAmount;
      results.winRate = results.totalTrades > 0 ? results.profitableTrades / results.totalTrades : 0;
      results.sharpeRatio = this.calculateSharpeRatio(results.trades);

      return results;
    } catch (error) {
      throw new JupiterError(
        `Backtest failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BACKTEST_FAILED',
        error
      );
    }
  }

  /**
   * Get trading statistics
   */
  async getTradingStats(walletAddress: PublicKey, days: number = 30): Promise<any> {
    try {
      const trades = await this.getTradeHistory(walletAddress, 1000);
      const recentTrades = trades.filter(trade => 
        trade.timestamp >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      );

      const stats = {
        totalTrades: recentTrades.length,
        profitableTrades: recentTrades.filter(t => t.success).length,
        totalVolume: recentTrades.reduce((sum, t) => sum + parseFloat(t.inputAmount), 0),
        averageTradeSize: 0,
        winRate: 0,
        averageProfit: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
      };

      if (recentTrades.length > 0) {
        stats.averageTradeSize = stats.totalVolume / stats.totalTrades;
        stats.winRate = stats.profitableTrades / stats.totalTrades;

        const profits = recentTrades
          .filter(t => t.success)
          .map(t => parseFloat(t.outputAmount) - parseFloat(t.inputAmount));
        
        const losses = recentTrades
          .filter(t => !t.success)
          .map(t => parseFloat(t.inputAmount) - parseFloat(t.outputAmount || '0'));

        if (profits.length > 0) {
          stats.averageProfit = profits.reduce((sum, p) => sum + p, 0) / profits.length;
          stats.largestWin = Math.max(...profits);
        }

        if (losses.length > 0) {
          stats.averageLoss = losses.reduce((sum, l) => sum + l, 0) / losses.length;
          stats.largestLoss = Math.max(...losses);
        }

        // Calculate consecutive wins/losses
        let currentStreak = 0;
        let maxWins = 0;
        let maxLosses = 0;

        for (const trade of recentTrades) {
          if (trade.success) {
            if (currentStreak > 0) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
            maxWins = Math.max(maxWins, currentStreak);
          } else {
            if (currentStreak < 0) {
              currentStreak--;
            } else {
              currentStreak = -1;
            }
            maxLosses = Math.max(maxLosses, Math.abs(currentStreak));
          }
        }

        stats.consecutiveWins = maxWins;
        stats.consecutiveLosses = maxLosses;
      }

      return stats;
    } catch (error) {
      throw new JupiterError(
        `Failed to get trading stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRADING_STATS_FAILED',
        error
      );
    }
  }

  /**
   * Check if transaction is a Jupiter swap
   */
  private isJupiterSwap(transaction: any): boolean {
    // Check if transaction involves Jupiter program
    const jupiterProgramId = 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB';
    
    return transaction.transaction.message.accountKeys.some(
      (key: any) => key.pubkey.toString() === jupiterProgramId
    );
  }

  /**
   * Parse Jupiter transaction into trade history
   */
  private async parseJupiterTransaction(transaction: any, signature: string): Promise<TradeHistory | null> {
    try {
      // This is a simplified parser - in practice, you'd need more complex logic
      // to extract exact input/output amounts and tokens from Jupiter transactions
      
      const timestamp = new Date(transaction.blockTime! * 1000);
      const success = transaction.meta?.err === null;
      
      // Extract basic info (this would need more sophisticated parsing)
      return {
        signature,
        timestamp,
        fromToken: 'Unknown',
        toToken: 'Unknown',
        inputAmount: '0',
        outputAmount: '0',
        priceImpact: 0,
        fees: transaction.meta?.fee || 0,
        route: [],
        success,
        error: success ? undefined : 'Transaction failed',
      };
    } catch (error) {
      console.warn(`Failed to parse Jupiter transaction:`, error);
      return null;
    }
  }

  /**
   * Get current token balances
   */
  private async getCurrentBalances(walletAddress: PublicKey): Promise<TokenBalance[]> {
    // This would be implemented with actual balance fetching
    // For now, return empty array
    return [];
  }

  /**
   * Calculate portfolio value
   */
  private async calculatePortfolioValue(balances: TokenBalance[]): Promise<number> {
    // This would be implemented with price fetching
    // For now, return 0
    return 0;
  }

  /**
   * Calculate PnL for a given time period
   */
  private async calculatePnL(walletAddress: PublicKey, hours: number): Promise<number> {
    // This would be implemented with historical data
    // For now, return 0
    return 0;
  }

  /**
   * Get historical portfolio snapshot
   */
  private async getHistoricalPortfolioSnapshot(date: Date): Promise<PortfolioSnapshot> {
    // This would be implemented with historical data
    // For now, return empty snapshot
    return {
      timestamp: date,
      totalValue: 0,
      tokens: [],
      pnl24h: 0,
      pnl7d: 0,
      pnl30d: 0,
    };
  }

  /**
   * Simulate trade execution
   */
  private async simulateTrade(
    action: 'buy' | 'sell',
    token: string,
    amount: number,
    date: Date
  ): Promise<TradeHistory | null> {
    // This would be implemented with historical price data
    // For now, return null
    return null;
  }

  /**
   * Calculate Sharpe ratio
   */
  private calculateSharpeRatio(trades: TradeHistory[]): number {
    if (trades.length === 0) return 0;

    const returns = trades.map(trade => {
      if (!trade.success) return -1;
      const input = parseFloat(trade.inputAmount);
      const output = parseFloat(trade.outputAmount);
      return (output - input) / input;
    });

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev === 0 ? 0 : meanReturn / stdDev;
  }

  /**
   * Clear trade history cache
   */
  clearCache(): void {
    this.tradeHistoryCache.clear();
  }
} 