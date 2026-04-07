/**
 * Stacks API Client
 * 
 * Provides a unified client for interacting with the Stacks blockchain API
 * with built-in caching, rate limiting, and error handling.
 */

import type {
  ApiResponse,
  ApiSuccess,
  TransactionStatus,
} from './types/contract';

/**
 * API client configuration
 */
export interface StacksApiConfig {
  /** Base URL for Stacks API (default: https://api.mainnet.hiro.so) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable response caching (default: true) */
  enableCache?: boolean;
  /** Cache TTL in milliseconds (default: 60000) */
  cacheTTL?: number;
  /** Maximum concurrent requests (default: 10) */
  maxConcurrentRequests?: number;
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  expiresAt: number;
}

/**
 * Rate limiter for API requests
 */
class RateLimiter {
  private active = 0;
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.active >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
    }
  }

  getActiveCount(): number {
    return this.active;
  }
}

/**
 * Cache manager for API responses
 */
class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      fetchedAt: now,
      expiresAt: now + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Transaction details from API
 */
export interface TransactionDetails {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  block_height?: number;
  block_hash?: string;
  burn_block_time?: number;
  canonical?: boolean;
  tx_result?: {
    hex: string;
    repr: string;
  };
}

/**
 * Block information
 */
export interface BlockInfo {
  height: number;
  hash: string;
  burn_block_time: number;
  burn_block_height: number;
}

/**
 * Account balance information
 */
export interface AccountBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    locked: string;
  };
}

/**
 * Stacks API Client with caching and rate limiting
 */
export class StacksApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly cache: CacheManager;
  private readonly rateLimiter: RateLimiter;
  private readonly enableCache: boolean;

  constructor(config: StacksApiConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://api.mainnet.hiro.so';
    this.timeout = config.timeout || 30000;
    this.enableCache = config.enableCache !== false;
    this.cache = new CacheManager(config.cacheTTL || 60000);
    this.rateLimiter = new RateLimiter(config.maxConcurrentRequests || 10);
  }

  /**
   * Fetch transaction details
   */
  async getTransaction(txId: string, forceRefresh = false): Promise<ApiResponse<TransactionDetails>> {
    const cacheKey = `tx:${txId}`;

    if (this.enableCache && !forceRefresh) {
      const cached = this.cache.get<TransactionDetails>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: Date.now() };
      }
    }

    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.fetch<TransactionDetails>(`/extended/v1/tx/${txId}`);
        
        if (response.success) {
          this.cache.set(cacheKey, response.data);
          return { success: true, data: response.data, timestamp: Date.now() };
        }
        
        return { success: false, error: response.error, timestamp: Date.now() };
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    const response = await this.getTransaction(txId, true);
    
    if (!response.success) {
      return 'unknown';
    }

    return this.normalizeTransactionStatus(response.data.tx_status);
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<ApiResponse<number>> {
    const cacheKey = 'block:height';

    if (this.enableCache) {
      const cached = this.cache.get<number>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: Date.now() };
      }
    }

    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.fetch<BlockInfo>('/extended/v1/block?limit=1');
        
        if (response.success) {
          const height = response.data.height;
          this.cache.set(cacheKey, height);
          return { success: true, data: height, timestamp: Date.now() };
        }
        
        return { success: false, error: response.error, timestamp: Date.now() };
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address: string, forceRefresh = false): Promise<ApiResponse<AccountBalance>> {
    const cacheKey = `balance:${address}`;

    if (this.enableCache && !forceRefresh) {
      const cached = this.cache.get<AccountBalance>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: Date.now() };
      }
    }

    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.fetch<AccountBalance>(`/extended/v1/address/${address}/balances`);
        
        if (response.success) {
          this.cache.set(cacheKey, response.data);
          return { success: true, data: response.data, timestamp: Date.now() };
        }
        
        return { success: false, error: response.error, timestamp: Date.now() };
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Call read-only contract function
   */
  async callReadOnlyFunction<T = any>(
    contractAddress: string,
    contractName: string,
    functionName: string,
    args: string[]
  ): Promise<ApiResponse<T>> {
    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.fetchPost<T>(
          `/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
          {
            sender: contractAddress,
            arguments: args,
          }
        );
        
        return response;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove specific cache entry
   */
  invalidateCache(pattern: string): void {
    this.cache.delete(pattern);
  }

  /**
   * Get rate limiter statistics
   */
  getRateLimiterStats(): { active: number; max: number } {
    return {
      active: this.rateLimiter.getActiveCount(),
      max: 10,
    };
  }

  /**
   * Internal fetch wrapper with timeout
   */
  private async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: response.statusText,
            status: response.status,
          },
          timestamp: Date.now(),
        };
      }

      const data = await response.json();
      return { success: true, data } as ApiSuccess<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Internal POST fetch wrapper
   */
  private async fetchPost<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: response.statusText,
            status: response.status,
          },
          timestamp: Date.now(),
        };
      }

      const data = await response.json();
      return { success: true, data } as ApiSuccess<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Normalize transaction status from API
   */
  private normalizeTransactionStatus(status: string): TransactionStatus {
    const normalized = status.toLowerCase();
    
    if (normalized.includes('success')) return 'success';
    if (normalized.includes('pending')) return 'pending';
    if (normalized.includes('failed')) return 'failed';
    if (normalized.includes('abort_by_response')) return 'abort_by_response';
    if (normalized.includes('abort_by_post_condition')) return 'abort_by_post_condition';
    
    return 'unknown';
  }

  /**
   * Handle errors and convert to ApiResponse
   */
  private handleError<T>(error: any): ApiResponse<T> {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown network error',
      },
      timestamp: Date.now(),
    };
  }
}

/**
 * Create a Stacks API client instance
 */
export function createStacksApiClient(config?: StacksApiConfig): StacksApiClient {
  return new StacksApiClient(config);
}
