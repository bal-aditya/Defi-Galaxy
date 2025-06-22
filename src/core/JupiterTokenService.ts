import { Connection, PublicKey } from '@solana/web3.js';
import axios, { AxiosInstance } from 'axios';

import {
  TokenMetadata,
  TokenBalance,
  JupiterError
} from '../types';

export class JupiterTokenService {
  private connection: Connection;
  private apiClient: AxiosInstance;
  private tokenCache: Map<string, TokenMetadata> = new Map();
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();

  constructor(connection: Connection, apiClient: AxiosInstance) {
    this.connection = connection;
    this.apiClient = apiClient;
  }

  /**
   * Get token metadata from Jupiter's token list
   */
  async getTokenMetadata(mint: string): Promise<TokenMetadata> {
    // Check cache first
    if (this.tokenCache.has(mint)) {
      return this.tokenCache.get(mint)!;
    }

    try {
      // Get from Jupiter's token list
      const response = await this.apiClient.get('/tokens');
      
      if (!response.data || !response.data.tokens) {
        throw new JupiterError('Invalid token list response', 'INVALID_TOKEN_RESPONSE');
      }

      const token = response.data.tokens.find((t: any) => t.address === mint);
      
      if (!token) {
        throw new JupiterError(`Token not found: ${mint}`, 'TOKEN_NOT_FOUND');
      }

      const metadata: TokenMetadata = {
        address: token.address,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token.tags || [],
        extensions: token.extensions || {},
      };

      // Cache the result
      this.tokenCache.set(mint, metadata);
      
      return metadata;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get token metadata: ${error.response?.data?.message || error.message}`,
          'TOKEN_METADATA_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
  }

  /**
   * Get all supported tokens
   */
  async getSupportedTokens(): Promise<TokenMetadata[]> {
    try {
      const response = await this.apiClient.get('/tokens');
      
      if (!response.data || !response.data.tokens) {
        throw new JupiterError('Invalid token list response', 'INVALID_TOKEN_RESPONSE');
      }

      return response.data.tokens.map((token: any) => ({
        address: token.address,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token.tags || [],
        extensions: token.extensions || {},
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get supported tokens: ${error.response?.data?.message || error.message}`,
          'SUPPORTED_TOKENS_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
  }

  /**
   * Get user's token balances with metadata
   */
  async getUserTokenBalances(walletAddress: PublicKey): Promise<TokenBalance[]> {
    try {
      const balances: TokenBalance[] = [];

      // Get SOL balance
      const solBalance = await this.connection.getBalance(walletAddress);
      if (solBalance > 0) {
        const solMetadata = await this.getTokenMetadata('So11111111111111111111111111111111111111112');
        balances.push({
          mint: 'So11111111111111111111111111111111111111112',
          amount: solBalance.toString(),
          decimals: 9,
          uiAmount: solBalance / 1e9,
          metadata: solMetadata,
        });
      }

      // Get SPL token balances
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(walletAddress, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      for (const account of tokenAccounts.value) {
        const accountInfo = account.account.data.parsed.info;
        const mint = accountInfo.mint;
        const amount = accountInfo.tokenAmount.uiAmount;
        const decimals = accountInfo.tokenAmount.decimals;

        if (amount > 0) {
          try {
            const metadata = await this.getTokenMetadata(mint);
            balances.push({
              mint,
              amount: accountInfo.tokenAmount.amount,
              decimals,
              uiAmount: amount,
              metadata,
            });
          } catch (error) {
            // Skip tokens that can't be found in Jupiter's list
            console.warn(`Skipping token ${mint}: ${error}`);
          }
        }
      }

      return balances;
    } catch (error) {
      throw new JupiterError(
        `Failed to get user token balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BALANCE_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Check if user has sufficient balance for a swap
   */
  async checkBalance(
    walletAddress: PublicKey,
    tokenMint: string,
    amount: number
  ): Promise<{ sufficient: boolean; available: number; required: number }> {
    try {
      // For SOL
      if (tokenMint === 'So11111111111111111111111111111111111111112') {
        const balance = await this.connection.getBalance(walletAddress);
        return {
          sufficient: balance >= amount,
          available: balance / 1e9,
          required: amount / 1e9,
        };
      }

      // For SPL tokens - TODO: Fix spl-token import
      // const tokenAccount = await getAssociatedTokenAddress(
      //   new PublicKey(tokenMint),
      //   walletAddress
      // );

      // try {
      //   const accountInfo = await getAccount(this.connection, tokenAccount);
      //   const available = Number(accountInfo.amount) / Math.pow(10, 6);
        
      //   return {
      //     sufficient: available >= amount,
      //     available,
      //     required: amount,
      //   };
      // } catch (error) {
      //   // Token account doesn't exist
      //   return {
      //     sufficient: false,
      //     available: 0,
      //     required: amount,
      //   };
      // }
      
      // Temporary fallback
      return {
        sufficient: false,
        available: 0,
        required: amount,
      };
    } catch (error) {
      throw new JupiterError(
        `Failed to check balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BALANCE_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Get current SOL price in USD
   */
  async getSolPrice(): Promise<number> {
    try {
      // Check cache first (5 minute cache)
      const cached = this.priceCache.get('SOL');
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.price;
      }

      // Get SOL price from Jupiter's price API
      const response = await this.apiClient.get('/price', {
        params: {
          ids: 'So11111111111111111111111111111111111111112',
        }
      });

      if (!response.data || !response.data.data) {
        throw new JupiterError('Invalid price response', 'INVALID_PRICE_RESPONSE');
      }

      const price = response.data.data['So11111111111111111111111111111111111111112']?.price || 0;

      // Cache the result
      this.priceCache.set('SOL', { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get SOL price: ${error.response?.data?.message || error.message}`,
          'SOL_PRICE_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
  }

  /**
   * Get token price by mint address
   */
  async getTokenPrice(mint: string): Promise<number> {
    try {
      // Check cache first (5 minute cache)
      const cached = this.priceCache.get(mint);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.price;
      }

      // Get token price from Jupiter's price API
      const response = await this.apiClient.get('/price', {
        params: {
          ids: mint,
        }
      });

      if (!response.data || !response.data.data) {
        throw new JupiterError('Invalid price response', 'INVALID_PRICE_RESPONSE');
      }

      const price = response.data.data[mint]?.price || 0;

      // Cache the result
      this.priceCache.set(mint, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new JupiterError(
          `Failed to get token price: ${error.response?.data?.message || error.message}`,
          'TOKEN_PRICE_FAILED',
          error.response?.data
        );
      }
      throw error;
    }
  }

  /**
   * Get portfolio value in USD
   */
  async getPortfolioValue(walletAddress: PublicKey): Promise<number> {
    try {
      const balances = await this.getUserTokenBalances(walletAddress);
      let totalValue = 0;

      for (const balance of balances) {
        try {
          const price = await this.getTokenPrice(balance.mint);
          totalValue += balance.uiAmount * price;
        } catch (error) {
          // Skip tokens that don't have price data
          console.warn(`No price data for token ${balance.mint}`);
        }
      }

      return totalValue;
    } catch (error) {
      throw new JupiterError(
        `Failed to get portfolio value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PORTFOLIO_VALUE_FAILED',
        error
      );
    }
  }

  /**
   * Search tokens by name or symbol
   */
  async searchTokens(query: string): Promise<TokenMetadata[]> {
    try {
      const tokens = await this.getSupportedTokens();
      const lowerQuery = query.toLowerCase();

      return tokens.filter(token => 
        token.name.toLowerCase().includes(lowerQuery) ||
        token.symbol.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      throw new JupiterError(
        `Failed to search tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TOKEN_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Get tokens by category/tags
   */
  async getTokensByCategory(category: string): Promise<TokenMetadata[]> {
    try {
      const tokens = await this.getSupportedTokens();
      
      return tokens.filter(token => 
        token.tags && token.tags.includes(category)
      );
    } catch (error) {
      throw new JupiterError(
        `Failed to get tokens by category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TOKEN_CATEGORY_FAILED',
        error
      );
    }
  }

  /**
   * Clear price cache
   */
  clearPriceCache(): void {
    this.priceCache.clear();
  }

  /**
   * Clear token cache
   */
  clearTokenCache(): void {
    this.tokenCache.clear();
  }
} 