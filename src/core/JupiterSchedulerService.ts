import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as cron from 'node-cron';
import { EventEmitter } from 'events';

import {
  RecurringSwapConfig,
  TriggerCondition,
  JupiterError
} from '../types';

import { JupiterSwapService } from './JupiterSwapService';

export class JupiterSchedulerService extends EventEmitter {
  private connection: Connection;
  private swapService: JupiterSwapService;
  private scheduledSwaps: Map<string, { config: RecurringSwapConfig; task: cron.ScheduledTask }> = new Map();
  private triggers: Map<string, { condition: TriggerCondition; interval: NodeJS.Timeout }> = new Map();
  private isRunning: boolean = false;

  constructor(connection: Connection, swapService: JupiterSwapService) {
    super();
    this.connection = connection;
    this.swapService = swapService;
  }

  /**
   * Schedule a recurring swap
   */
  async scheduleRecurringSwap(config: Omit<RecurringSwapConfig, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateId();
    const fullConfig: RecurringSwapConfig = {
      ...config,
      id,
      createdAt: new Date(),
    };

    // Validate cron expression
    if (!cron.validate(config.schedule)) {
      throw new JupiterError(`Invalid cron expression: ${config.schedule}`, 'INVALID_CRON');
    }

    // Create cron task
    const task = cron.schedule(config.schedule, async () => {
      await this.executeScheduledSwap(fullConfig);
    }, {
      scheduled: config.enabled,
    });

    // Store the scheduled swap
    this.scheduledSwaps.set(id, { config: fullConfig, task });

    this.emit('swapScheduled', fullConfig);

    return id;
  }

  /**
   * Get all scheduled swaps
   */
  getScheduledSwaps(): RecurringSwapConfig[] {
    return Array.from(this.scheduledSwaps.values()).map(item => item.config);
  }

  /**
   * Cancel a scheduled swap
   */
  async cancelScheduledSwap(id: string): Promise<void> {
    const scheduled = this.scheduledSwaps.get(id);
    if (!scheduled) {
      throw new JupiterError(`Scheduled swap not found: ${id}`, 'SCHEDULED_SWAP_NOT_FOUND');
    }

    // Stop the cron task
    scheduled.task.stop();
    
    // Remove from map
    this.scheduledSwaps.delete(id);

    this.emit('swapCancelled', id);
  }

  /**
   * Enable/disable a scheduled swap
   */
  async toggleScheduledSwap(id: string, enabled: boolean): Promise<void> {
    const scheduled = this.scheduledSwaps.get(id);
    if (!scheduled) {
      throw new JupiterError(`Scheduled swap not found: ${id}`, 'SCHEDULED_SWAP_NOT_FOUND');
    }

    scheduled.config.enabled = enabled;
    
    if (enabled) {
      scheduled.task.start();
    } else {
      scheduled.task.stop();
    }

    this.emit('swapToggled', { id, enabled });
  }

  /**
   * Set up a trigger condition
   */
  async setTrigger(condition: Omit<TriggerCondition, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateId();
    const fullCondition: TriggerCondition = {
      ...condition,
      id,
      createdAt: new Date(),
    };

    // Start monitoring the condition
    const interval = setInterval(async () => {
      await this.checkTriggerCondition(fullCondition);
    }, 30000); // Check every 30 seconds

    // Store the trigger
    this.triggers.set(id, { condition: fullCondition, interval });

    this.emit('triggerSet', fullCondition);

    return id;
  }

  /**
   * Get all active triggers
   */
  getTriggers(): TriggerCondition[] {
    return Array.from(this.triggers.values()).map(item => item.condition);
  }

  /**
   * Remove a trigger
   */
  async removeTrigger(id: string): Promise<void> {
    const trigger = this.triggers.get(id);
    if (!trigger) {
      throw new JupiterError(`Trigger not found: ${id}`, 'TRIGGER_NOT_FOUND');
    }

    // Clear the interval
    clearInterval(trigger.interval);
    
    // Remove from map
    this.triggers.delete(id);

    this.emit('triggerRemoved', id);
  }

  /**
   * Enable/disable a trigger
   */
  async toggleTrigger(id: string, enabled: boolean): Promise<void> {
    const trigger = this.triggers.get(id);
    if (!trigger) {
      throw new JupiterError(`Trigger not found: ${id}`, 'TRIGGER_NOT_FOUND');
    }

    trigger.condition.enabled = enabled;

    if (enabled) {
      // Restart monitoring
      clearInterval(trigger.interval);
      trigger.interval = setInterval(async () => {
        await this.checkTriggerCondition(trigger.condition);
      }, 30000);
    } else {
      // Stop monitoring
      clearInterval(trigger.interval);
    }

    this.emit('triggerToggled', { id, enabled });
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start all enabled scheduled swaps
    for (const [id, scheduled] of this.scheduledSwaps) {
      if (scheduled.config.enabled) {
        scheduled.task.start();
      }
    }

    // Start all enabled triggers
    for (const [id, trigger] of this.triggers) {
      if (trigger.condition.enabled) {
        clearInterval(trigger.interval);
        trigger.interval = setInterval(async () => {
          await this.checkTriggerCondition(trigger.condition);
        }, 30000);
      }
    }

    this.emit('schedulerStarted');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop all scheduled swaps
    for (const scheduled of this.scheduledSwaps.values()) {
      scheduled.task.stop();
    }

    // Stop all triggers
    for (const trigger of this.triggers.values()) {
      clearInterval(trigger.interval);
    }

    this.emit('schedulerStopped');
  }

  /**
   * Execute a scheduled swap
   */
  private async executeScheduledSwap(config: RecurringSwapConfig): Promise<void> {
    try {
      this.emit('swapExecuting', config);

      // Execute the swap
      const result = await this.swapService.executeSwap(
        config.fromToken,
        config.toToken,
        config.amount,
        config.wallet,
        { slippageBps: config.maxSlippageBps }
      );

      // Update last executed time
      config.lastExecuted = new Date();

      this.emit('swapExecuted', { config, result });
    } catch (error) {
      this.emit('swapFailed', { config, error });
      
      // Log error but don't throw to prevent cron from stopping
      console.error(`Scheduled swap failed for ${config.id}:`, error);
    }
  }

  /**
   * Check a trigger condition
   */
  private async checkTriggerCondition(condition: TriggerCondition): Promise<void> {
    try {
      let shouldTrigger = false;

      switch (condition.type) {
        case 'price':
          shouldTrigger = await this.checkPriceCondition(condition);
          break;
        case 'balance':
          shouldTrigger = await this.checkBalanceCondition(condition);
          break;
        case 'time':
          shouldTrigger = this.checkTimeCondition(condition);
          break;
        case 'custom':
          shouldTrigger = await this.checkCustomCondition(condition);
          break;
      }

      if (shouldTrigger) {
        await this.executeTriggerAction(condition);
      }
    } catch (error) {
      this.emit('triggerCheckFailed', { condition, error });
      console.error(`Trigger check failed for ${condition.id}:`, error);
    }
  }

  /**
   * Check price-based trigger condition
   */
  private async checkPriceCondition(condition: TriggerCondition): Promise<boolean> {
    if (!condition.token) {
      throw new JupiterError('Token required for price condition', 'TOKEN_REQUIRED');
    }

    // Get current price (this would need to be implemented with price API)
    const currentPrice = await this.getTokenPrice(condition.token);
    
    return this.compareValues(currentPrice, condition.operator, condition.value);
  }

  /**
   * Check balance-based trigger condition
   */
  private async checkBalanceCondition(condition: TriggerCondition): Promise<boolean> {
    if (!condition.token) {
      throw new JupiterError('Token required for balance condition', 'TOKEN_REQUIRED');
    }

    // Get current balance (this would need wallet context)
    const currentBalance = await this.getTokenBalance(condition.token);
    
    return this.compareValues(currentBalance, condition.operator, condition.value);
  }

  /**
   * Check time-based trigger condition
   */
  private checkTimeCondition(condition: TriggerCondition): boolean {
    const now = new Date();
    const targetTime = new Date(condition.value);
    
    return this.compareValues(now.getTime(), condition.operator, targetTime.getTime());
  }

  /**
   * Check custom trigger condition
   */
  private async checkCustomCondition(condition: TriggerCondition): Promise<boolean> {
    // This would be implemented by the user
    // For now, return false
    return false;
  }

  /**
   * Execute trigger action
   */
  private async executeTriggerAction(condition: TriggerCondition): Promise<void> {
    try {
      this.emit('triggerExecuting', condition);

      switch (condition.action) {
        case 'swap':
          await this.executeTriggerSwap(condition);
          break;
        case 'sell':
          await this.executeTriggerSell(condition);
          break;
        case 'buy':
          await this.executeTriggerBuy(condition);
          break;
        case 'notify':
          await this.executeTriggerNotify(condition);
          break;
      }

      this.emit('triggerExecuted', condition);
    } catch (error) {
      this.emit('triggerFailed', { condition, error });
      console.error(`Trigger action failed for ${condition.id}:`, error);
    }
  }

  /**
   * Execute trigger swap action
   */
  private async executeTriggerSwap(condition: TriggerCondition): Promise<void> {
    const { fromToken, toToken, amount } = condition.actionParams;
    
    // This would need wallet context
    // await this.swapService.executeSwap(fromToken, toToken, amount, wallet);
  }

  /**
   * Execute trigger sell action
   */
  private async executeTriggerSell(condition: TriggerCondition): Promise<void> {
    // Implementation for sell action
  }

  /**
   * Execute trigger buy action
   */
  private async executeTriggerBuy(condition: TriggerCondition): Promise<void> {
    // Implementation for buy action
  }

  /**
   * Execute trigger notify action
   */
  private async executeTriggerNotify(condition: TriggerCondition): Promise<void> {
    // Implementation for notification
    console.log(`Trigger notification: ${condition.actionParams.message}`);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(a: number, operator: string, b: number): boolean {
    switch (operator) {
      case 'gt': return a > b;
      case 'lt': return a < b;
      case 'eq': return a === b;
      case 'gte': return a >= b;
      case 'lte': return a <= b;
      default: return false;
    }
  }

  /**
   * Get token price (placeholder)
   */
  private async getTokenPrice(token: string): Promise<number> {
    // This would be implemented with actual price API
    return 0;
  }

  /**
   * Get token balance (placeholder)
   */
  private async getTokenBalance(token: string): Promise<number> {
    // This would be implemented with wallet context
    return 0;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `jupiter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; scheduledSwaps: number; triggers: number } {
    return {
      isRunning: this.isRunning,
      scheduledSwaps: this.scheduledSwaps.size,
      triggers: this.triggers.size,
    };
  }
} 