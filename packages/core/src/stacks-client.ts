/**
 * Stacks Client - Main SDK Client
 * 
 * High-level client for interacting with Stacks smart contracts
 * and blockchain. Builds on top of StacksApiClient.
 */

import { StacksApiClient, StacksApiConfig } from './stacks-api';
import type { ApiResponse, ContractErrorCode } from './types/contract';

/**
 * Contract call configuration
 */
export interface ContractCallConfig {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
  sender?: string;
}

/**
 * Transaction broadcast result
 */
export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}

/**
 * Contract read result with typed data
 */
export interface ContractReadResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: ContractErrorCode;
  };
}

/**
 * Main Stacks Client for blockchain interactions
 */
export class StacksClient {
  private readonly apiClient: StacksApiClient;

  constructor(config?: StacksApiConfig) {
    this.apiClient = new StacksApiClient(config);
  }

  /**
   * Call a read-only contract function
   */
  async callReadOnly<T = any>(config: ContractCallConfig): Promise<ContractReadResult<T>> {
    const response = await this.apiClient.callReadOnlyFunction<T>(
      config.contractAddress,
      config.contractName,
      config.functionName,
      config.functionArgs
    );

    if (!response.success) {
      return {
        success: false,
        error: {
          message: response.error.message,
        },
      };
    }

    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Get transaction status and details
   */
  async getTransaction(txId: string) {
    return this.apiClient.getTransaction(txId);
  }

  /**
   * Get transaction status (normalized)
   */
  async getTransactionStatus(txId: string) {
    return this.apiClient.getTransactionStatus(txId);
  }

  /**
   * Get current block height
   */
  async getBlockHeight() {
    return this.apiClient.getBlockHeight();
  }

  /**
   * Get account STX balance
   */
  async getAccountBalance(address: string) {
    return this.apiClient.getAccountBalance(address);
  }

  /**
   * Parse STX balance from account balance response
   */
  async getSTXBalance(address: string): Promise<ApiResponse<bigint>> {
    const response = await this.apiClient.getAccountBalance(address);
    
    if (!response.success) {
      return response as ApiResponse<bigint>;
    }

    const balance = BigInt(response.data.stx.balance);
    return {
      success: true,
      data: balance,
      timestamp: response.timestamp,
    };
  }

  /**
   * Convert microSTX to STX
   */
  microSTXToSTX(microSTX: number | bigint): number {
    return Number(microSTX) / 1_000_000;
  }

  /**
   * Convert STX to microSTX
   */
  STXToMicroSTX(stx: number): bigint {
    return BigInt(Math.floor(stx * 1_000_000));
  }

  /**
   * Clear API cache
   */
  clearCache(): void {
    this.apiClient.clearCache();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateCache(pattern: string): void {
    this.apiClient.invalidateCache(pattern);
  }

  /**
   * Get rate limiter statistics
   */
  getRateLimiterStats() {
    return this.apiClient.getRateLimiterStats();
  }

  /**
   * Wait for transaction to complete
   * 
   * Polls transaction status until it reaches a terminal state
   */
  async waitForTransaction(
    txId: string,
    options: {
      intervalMs?: number;
      maxAttempts?: number;
      onPoll?: (attempts: number) => void;
    } = {}
  ): Promise<{ status: string; attempts: number }> {
    const intervalMs = options.intervalMs || 10000;
    const maxAttempts = options.maxAttempts || 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      
      if (options.onPoll) {
        options.onPoll(attempts);
      }

      const status = await this.getTransactionStatus(txId);
      
      // Terminal states
      if (status === 'success' || status === 'failed' || 
          status === 'abort_by_response' || status === 'abort_by_post_condition') {
        return { status, attempts };
      }

      // Wait before next poll
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    return { status: 'timeout', attempts };
  }
}

/**
 * Create a Stacks client instance
 */
export function createStacksClient(config?: StacksApiConfig): StacksClient {
  return new StacksClient(config);
}

/**
 * Default Stacks client for mainnet
 */
export const stacksMainnet = createStacksClient({
  baseUrl: 'https://api.mainnet.hiro.so',
});

/**
 * Default Stacks client for testnet
 */
export const stacksTestnet = createStacksClient({
  baseUrl: 'https://api.testnet.hiro.so',
});
