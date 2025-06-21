#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { JupiterClient } from '../core/JupiterClient';

const program = new Command();

program
  .name('jupiter-swap')
  .description('CLI for Jupiter DEX operations on Solana')
  .version('1.0.0');

// Global options
program
  .option('-r, --rpc-url <url>', 'Solana RPC URL', 'https://api.mainnet-beta.solana.com')
  .option('-w, --wallet <path>', 'Path to wallet keypair file')
  .option('-v, --verbose', 'Enable verbose output');

// Swap command
program
  .command('swap')
  .description('Execute a token swap')
  .requiredOption('-f, --from <token>', 'Input token mint address')
  .requiredOption('-t, --to <token>', 'Output token mint address')
  .requiredOption('-a, --amount <number>', 'Amount to swap')
  .option('-s, --slippage <number>', 'Slippage tolerance in basis points', '50')
  .option('--dry-run', 'Simulate the swap without executing')
  .action(async (options) => {
    const spinner = ora('Initializing...').start();
    
    try {
      // Initialize connection
      const connection = new Connection(options.rpcUrl);
      spinner.text = 'Connecting to Solana...';
      
      // Load wallet if provided
      let wallet: Keypair | undefined;
      if (options.wallet) {
        spinner.text = 'Loading wallet...';
        // In a real implementation, you'd load the keypair from file
        wallet = Keypair.generate(); // Placeholder
      }
      
      // Initialize Jupiter client
      const jupiter = new JupiterClient({
        connection,
        wallet,
        rpcUrl: options.rpcUrl,
      });
      
      spinner.text = 'Getting quote...';
      const quote = await jupiter.getQuote(
        options.from,
        options.to,
        parseFloat(options.amount),
        { slippageBps: parseInt(options.slippage) }
      );
      
      spinner.succeed('Quote received!');
      
      console.log(chalk.green('\n📊 Swap Quote:'));
      console.log(`Input: ${options.amount} ${options.from}`);
      console.log(`Output: ${quote.outAmount} ${options.to}`);
      console.log(`Price Impact: ${quote.priceImpactPct}%`);
      console.log(`Route: ${quote.routePlan.map(p => p.swapInfo.label).join(' → ')}`);
      
      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run mode - no transaction will be sent'));
        return;
      }
      
      if (!wallet) {
        console.log(chalk.red('\n❌ Wallet required for execution. Use --wallet option.'));
        return;
      }
      
      const confirmSpinner = ora('Confirming swap...').start();
      const result = await jupiter.executeSwap(
        options.from,
        options.to,
        parseFloat(options.amount),
        { slippageBps: parseInt(options.slippage) }
      );
      
      confirmSpinner.succeed('Swap executed successfully!');
      
      console.log(chalk.green('\n✅ Swap Result:'));
      console.log(`Transaction: ${result.signature}`);
      console.log(`Input: ${result.inputAmount}`);
      console.log(`Output: ${result.outputAmount}`);
      console.log(`Price Impact: ${result.priceImpact}%`);
      
    } catch (error) {
      spinner.fail('Operation failed');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Quote command
program
  .command('quote')
  .description('Get a swap quote without executing')
  .requiredOption('-f, --from <token>', 'Input token mint address')
  .requiredOption('-t, --to <token>', 'Output token mint address')
  .requiredOption('-a, --amount <number>', 'Amount to swap')
  .option('-s, --slippage <number>', 'Slippage tolerance in basis points', '50')
  .action(async (options) => {
    const spinner = ora('Getting quote...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      const quote = await jupiter.getQuote(
        options.from,
        options.to,
        parseFloat(options.amount),
        { slippageBps: parseInt(options.slippage) }
      );
      
      spinner.succeed('Quote received!');
      
      console.log(chalk.blue('\n📊 Swap Quote:'));
      console.log(`Input: ${options.amount} ${options.from}`);
      console.log(`Output: ${quote.outAmount} ${options.to}`);
      console.log(`Price Impact: ${quote.priceImpactPct}%`);
      console.log(`Route: ${quote.routePlan.map(p => p.swapInfo.label).join(' → ')}`);
      console.log(`Slippage: ${quote.slippageBps / 100}%`);
      
    } catch (error) {
      spinner.fail('Failed to get quote');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Routes command
program
  .command('routes')
  .description('Get multiple route options for comparison')
  .requiredOption('-f, --from <token>', 'Input token mint address')
  .requiredOption('-t, --to <token>', 'Output token mint address')
  .requiredOption('-a, --amount <number>', 'Amount to swap')
  .option('--max-hops <number>', 'Maximum number of hops')
  .option('--include-dexes <list>', 'Comma-separated list of DEXes to include')
  .option('--exclude-dexes <list>', 'Comma-separated list of DEXes to exclude')
  .action(async (options) => {
    const spinner = ora('Finding routes...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      const filter = {
        maxHops: options.maxHops ? parseInt(options.maxHops) : undefined,
        includeDexes: options.includeDexes ? options.includeDexes.split(',') : undefined,
        excludeDexes: options.excludeDexes ? options.excludeDexes.split(',') : undefined,
      };
      
      const routes = await jupiter.getRouteOptions(
        options.from,
        options.to,
        parseFloat(options.amount),
        filter
      );
      
      spinner.succeed(`Found ${routes.length} routes!`);
      
      console.log(chalk.blue('\n🛣️  Available Routes:'));
      
      routes.forEach((route, index) => {
        console.log(chalk.cyan(`\n${index + 1}. Route ${index + 1} (Score: ${route.score.toFixed(2)})`));
        console.log(`   DEX Path: ${route.dexPath.join(' → ')}`);
        console.log(`   Risk Level: ${route.riskLevel}`);
        console.log(`   Estimated Time: ${route.estimatedTime}s`);
        console.log(`   Output Amount: ${route.route.outAmount}`);
        console.log(`   Price Impact: ${route.route.priceImpactPct}%`);
      });
      
    } catch (error) {
      spinner.fail('Failed to find routes');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Schedule command
program
  .command('schedule')
  .description('Schedule a recurring swap')
  .requiredOption('-f, --from <token>', 'Input token mint address')
  .requiredOption('-t, --to <token>', 'Output token mint address')
  .requiredOption('-a, --amount <number>', 'Amount to swap')
  .requiredOption('-c, --cron <expression>', 'Cron expression for scheduling')
  .option('-s, --slippage <number>', 'Slippage tolerance in basis points', '50')
  .action(async (options) => {
    const spinner = ora('Scheduling swap...').start();
    
    try {
      const globalOpts = program.opts();
      if (!globalOpts.wallet) {
        throw new Error('Wallet required for scheduling. Use --wallet option.');
      }
      
      const connection = new Connection(globalOpts.rpcUrl);
      const wallet = Keypair.generate(); // Placeholder - load from file
      const jupiter = new JupiterClient({ connection, wallet });
      
      const scheduleId = await jupiter.scheduleRecurringSwap({
        schedule: options.cron,
        fromToken: options.from,
        toToken: options.to,
        amount: parseFloat(options.amount),
        wallet: wallet.publicKey,
        enabled: true,
        maxSlippageBps: parseInt(options.slippage),
      });
      
      spinner.succeed('Swap scheduled successfully!');
      
      console.log(chalk.green('\n✅ Scheduled Swap:'));
      console.log(`ID: ${scheduleId}`);
      console.log(`Schedule: ${options.cron}`);
      console.log(`From: ${options.from}`);
      console.log(`To: ${options.to}`);
      console.log(`Amount: ${options.amount}`);
      
    } catch (error) {
      spinner.fail('Failed to schedule swap');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List schedules command
program
  .command('schedules')
  .description('List all scheduled swaps')
  .action(async (options) => {
    const spinner = ora('Loading schedules...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      const schedules = await jupiter.getScheduledSwaps();
      
      spinner.succeed(`Found ${schedules.length} scheduled swaps`);
      
      if (schedules.length === 0) {
        console.log(chalk.yellow('\n📝 No scheduled swaps found'));
        return;
      }
      
      console.log(chalk.blue('\n📅 Scheduled Swaps:'));
      
      schedules.forEach((schedule, index) => {
        console.log(chalk.cyan(`\n${index + 1}. ${schedule.id}`));
        console.log(`   Schedule: ${schedule.schedule}`);
        console.log(`   From: ${schedule.fromToken}`);
        console.log(`   To: ${schedule.toToken}`);
        console.log(`   Amount: ${schedule.amount}`);
        console.log(`   Status: ${schedule.enabled ? 'Active' : 'Disabled'}`);
        console.log(`   Created: ${schedule.createdAt.toLocaleDateString()}`);
        if (schedule.lastExecuted) {
          console.log(`   Last Executed: ${schedule.lastExecuted.toLocaleDateString()}`);
        }
      });
      
    } catch (error) {
      spinner.fail('Failed to load schedules');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Cancel schedule command
program
  .command('cancel-schedule')
  .description('Cancel a scheduled swap')
  .requiredOption('-i, --id <id>', 'Schedule ID to cancel')
  .action(async (options) => {
    const spinner = ora('Cancelling schedule...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      await jupiter.cancelScheduledSwap(options.id);
      
      spinner.succeed('Schedule cancelled successfully!');
      console.log(chalk.green(`\n✅ Cancelled schedule: ${options.id}`));
      
    } catch (error) {
      spinner.fail('Failed to cancel schedule');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Balance command
program
  .command('balance')
  .description('Check token balances')
  .option('-w, --wallet <address>', 'Wallet address to check')
  .action(async (options) => {
    const spinner = ora('Loading balances...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      if (!options.wallet) {
        throw new Error('Wallet address required. Use --wallet option.');
      }
      
      const balances = await jupiter.getUserTokenBalances(new PublicKey(options.wallet));
      
      spinner.succeed(`Found ${balances.length} token balances`);
      
      if (balances.length === 0) {
        console.log(chalk.yellow('\n💰 No token balances found'));
        return;
      }
      
      console.log(chalk.blue('\n💰 Token Balances:'));
      
      balances.forEach((balance, index) => {
        console.log(chalk.cyan(`\n${index + 1}. ${balance.metadata.symbol} (${balance.metadata.name})`));
        console.log(`   Balance: ${balance.uiAmount.toFixed(6)}`);
        console.log(`   Mint: ${balance.mint}`);
        console.log(`   Decimals: ${balance.decimals}`);
      });
      
    } catch (error) {
      spinner.fail('Failed to load balances');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Health check command
program
  .command('health')
  .description('Check Jupiter and Solana connection health')
  .action(async (options) => {
    const spinner = ora('Checking health...').start();
    
    try {
      const globalOpts = program.opts();
      const connection = new Connection(globalOpts.rpcUrl);
      const jupiter = new JupiterClient({ connection });
      
      const health = await jupiter.healthCheck();
      
      spinner.succeed('Health check completed');
      
      console.log(chalk.blue('\n🏥 Health Status:'));
      console.log(`Jupiter API: ${health.jupiter ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`Solana RPC: ${health.solana ? '✅ Healthy' : '❌ Unhealthy'}`);
      
      if (health.jupiter && health.solana) {
        console.log(chalk.green('\n🎉 All systems operational!'));
      } else {
        console.log(chalk.red('\n⚠️  Some services are down'));
        process.exit(1);
      }
      
    } catch (error) {
      spinner.fail('Health check failed');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 