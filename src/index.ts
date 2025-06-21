// Main exports
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