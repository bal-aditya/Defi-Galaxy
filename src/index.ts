// Main exports
//This file serves as the main entry point for the Defi-Galaxy package. 
// It organizes and re-exports the core classes, types, errors, and utility functions from various internal modules, making them accessible to users of the package.

export { JupiterClient } from './core/JupiterClient';
export { JupiterSwapService } from './core/JupiterSwapService';
export { JupiterTokenService } from './core/JupiterTokenService';
export { JupiterSchedulerService } from './core/JupiterSchedulerService';
export { JupiterAnalyticsService } from './core/JupiterAnalyticsService';
export { JupiterSimulationService } from './core/JupiterSimulationService';

// Type exports
export type {
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
  CliOptions,
} from './types';

// Error exports
export {
  JupiterError,
  InsufficientBalanceError,
  SlippageExceededError,
} from './types';

// Utility functions
export { JupiterClient as default } from './core/JupiterClient'; 