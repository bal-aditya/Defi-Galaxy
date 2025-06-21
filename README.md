# jupiter-easy-swap

A comprehensive TypeScript/Node.js SDK and CLI for seamless Solana DeFi trading, automation, and analytics using Jupiter APIs.

## Features
- 🔄 **Token Swaps**: Execute swaps with best route selection and slippage protection.
- 🛣️ **Route Analysis**: Compare multiple routes, filter by DEX, optimize for speed/cost.
- 🔁 **Recurring Swaps**: Schedule DCA strategies with cron expressions.
- ⚡ **Trigger Automation**: Execute swaps based on price, balance, or custom conditions.
- 📊 **Portfolio Analytics**: Track trade history, portfolio performance, and risk metrics.
- 🧪 **Transaction Simulation**: Simulate swaps before execution to estimate fees and success.
- 🛠️ **CLI Interface**: Command-line tools for bots, scripts, and automation.
- 🔧 **TypeScript Support**: Full type safety and IntelliSense support.

## Installation
```bash
npm install jupiter-easy-swap
```

## Quick Start

### Basic Usage (TypeScript)
```ts
import { JupiterClient } from '@jupiter-xyz/easy-swap';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.generate(); // Replace with your wallet

const jupiter = new JupiterClient({ connection, wallet });

// Get a quote for swapping 1 SOL to USDC
const quote = await jupiter.getQuote(
  'So11111111111111111111111111111111111111112',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  1e9
);
console.log('Best route:', quote.routePlan.map(p => p.swapInfo.label));

// Execute a swap
const result = await jupiter.executeSwap(
  'So11111111111111111111111111111111111111112',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  1e9
);
console.log('Swap signature:', result.signature);
```

### Advanced Features

#### Route Comparison
```ts
const routes = await jupiter.getRouteOptions('SOL', 'USDC', 1e9, {
  maxHops: 3,
  excludeDexes: ['Raydium'],
  preferSpeed: true,
});

console.log('Available routes:', routes.map(r => ({
  label: r.label,
  priceImpact: r.priceImpact,
  fee: r.fee,
})));
```

#### Recurring Swaps (DCA)
```ts
await jupiter.scheduleRecurringSwap({
  schedule: '0 9 * * 1', // Every Monday at 9am
  fromToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  toToken: 'So11111111111111111111111111111111111111112', // SOL
  amount: 10e6, // 10 USDC
  wallet: wallet.publicKey,
  enabled: true,
  slippage: 0.5, // 0.5%
});
```

#### Price Triggers
```ts
await jupiter.setTrigger({
  condition: {
    type: 'price',
    token: 'So11111111111111111111111111111111111111112', // SOL
    operator: 'below',
    value: 50, // $50
  },
  action: {
    type: 'swap',
    fromToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    toToken: 'So11111111111111111111111111111111111111112', // SOL
    amount: 100e6, // 100 USDC
  },
  enabled: true,
});
```

#### Portfolio Analytics.
```ts
const portfolio = await jupiter.getPortfolioSnapshot(wallet.publicKey);
console.log('Portfolio value:', portfolio.totalValue);
console.log('Holdings:', portfolio.holdings);

const history = await jupiter.getTradeHistory(wallet.publicKey, {
  limit: 50,
  offset: 0,
});
console.log('Recent trades:', history.trades);
```

## CLI Usage

### Installation
```bash
npm install -g jupiter-easy-swap
```

### Basic Commands
```bash
# Get a quote
jupiter-swap quote --from SOL --to USDC --amount 1 --rpc-url https://api.mainnet-beta.solana.com

# Execute a swap.
jupiter-swap swap --from SOL --to USDC --amount 1 --wallet ./keypair.json --rpc-url https://api.mainnet-beta.solana.com

# Get route options.
jupiter-swap routes --from SOL --to USDC --amount 1 --rpc-url https://api.mainnet-beta.solana.com

# Schedule recurring swap.
jupiter-swap schedule --from USDC --to SOL --amount 10 --cron "0 9 * * 1" --wallet ./keypair.json --rpc-url https://api.mainnet-beta.solana.com

# Check Jupiter health.
jupiter-swap health --rpc-url https://api.mainnet-beta.solana.com
```

### CLI Options
- `--rpc-url`: Solana RPC endpoint (required).
- `--wallet`: Path to wallet keypair file (required for transactions).
- `--slippage`: Slippage tolerance in percentage (default: 0.5).
- `--max-hops`: Maximum number of hops for routes (default: 3).
- `--prefer-speed`: Prefer faster routes over cheaper ones.

## API Reference

### Core Classes
- `JupiterClient`: Main client for all Jupiter operations.
- `JupiterSwapService`: Handles swap execution and routing.
- `JupiterTokenService`: Token metadata and balance management.
- `JupiterSchedulerService`: Recurring swap scheduling.
- `JupiterAnalyticsService`: Portfolio and trade analytics.
- `JupiterSimulationService`: Transaction simulation and risk assessment.

### Key Methods
- `getQuote()`: Get best swap quote.
- `getRouteOptions()`: Get multiple route options.
- `executeSwap()`: Execute a swap transaction.
- `scheduleRecurringSwap()`: Schedule recurring swaps.
- `setTrigger()`: Set up automated triggers.
- `getPortfolioSnapshot()`: Get portfolio overview.
- `getTradeHistory()`: Get trading history.
- `simulateSwap()`: Simulate swap before execution.

## Configuration

### JupiterClientConfig
```ts
interface JupiterClientConfig {
  connection: Connection;
  wallet: Keypair;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
  jupiterApiUrl?: string;
  defaultSlippage?: number;
  maxRetries?: number;
}
```

## Error Handling
The SDK provides comprehensive error handling with specific error types:
- `JupiterError`: General Jupiter API errors.
- `InsufficientBalanceError`: When wallet has insufficient balance.
- `SlippageExceededError`: When slippage tolerance is exceeded.

## Examples
See the `examples/` directory for complete usage examples:
- `usage.ts`: Basic usage examples.
- CLI usage patterns.
- Error handling examples.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add tests.
5. Submit a pull request.

## License
MIT