/**
 * Transaction polling utilities for monitoring on-chain transaction status.
 * Provides configurable polling with exponential backoff and timeout handling.
 */

export interface PollConfig {
  /** Initial polling interval in milliseconds (default: 10000) */
  intervalMs?: number;
  /** Maximum number of polling attempts (default: 60) */
  maxAttempts?: number;
  /** Initial delay before starting polling in milliseconds (default: 10000) */
  initialDelayMs?: number;
  /** Whether to use exponential backoff (default: false) */
  useExponentialBackoff?: boolean;
}

export type TxStatus = 
  | 'success' 
  | 'pending' 
  | 'failed' 
  | 'abort_by_response' 
  | 'abort_by_post_condition'
  | 'unknown';

export interface PollResult {
  /** Final transaction status */
  status: TxStatus;
  /** Number of attempts made */
  attempts: number;
  /** Whether polling was stopped due to max attempts */
  timedOut: boolean;
  /** Error message if polling failed */
  error?: string;
}

export interface PollCallbacks {
  /** Called when transaction status changes */
  onStatusChange?: (status: TxStatus, attempts: number) => void;
  /** Called when transaction succeeds */
  onSuccess?: (txId: string, attempts: number) => void;
  /** Called when transaction fails */
  onFailure?: (txId: string, reason: string, attempts: number) => void;
  /** Called when polling times out */
  onTimeout?: (txId: string, lastStatus: TxStatus) => void;
  /** Called on each poll attempt */
  onPoll?: (txId: string, attempts: number) => void;
}

/**
 * Function to fetch transaction status from the blockchain.
 * Should return the status string from the Stacks API.
 */
export type TxStatusFetcher = (txId: string) => Promise<string>;

/**
 * Poll transaction status until it reaches a terminal state.
 * 
 * @param txId - Transaction ID to poll
 * @param fetcher - Function to fetch transaction status
 * @param config - Polling configuration
 * @param callbacks - Optional callbacks for status changes
 * @returns Promise that resolves with final poll result
 * 
 * @example
 * ```typescript
 * const result = await pollTxStatus(
 *   '0xabc...',
 *   async (txId) => {
 *     const response = await fetch(`https://api.hiro.so/extended/v1/tx/${txId}`);
 *     const data = await response.json();
 *     return data.tx_status;
 *   },
 *   { maxAttempts: 30 },
 *   {
 *     onSuccess: (txId) => console.log('Transaction confirmed:', txId),
 *     onFailure: (txId, reason) => console.error('Transaction failed:', reason),
 *   }
 * );
 * ```
 */
export async function pollTxStatus(
  txId: string,
  fetcher: TxStatusFetcher,
  config: PollConfig = {},
  callbacks: PollCallbacks = {}
): Promise<PollResult> {
  const {
    intervalMs = 10_000,
    maxAttempts = 60,
    initialDelayMs = 10_000,
    useExponentialBackoff = false,
  } = config;

  let attempts = 0;
  let lastStatus: TxStatus | null = null;

  // Wait for initial delay before first poll
  await new Promise((resolve) => setTimeout(resolve, initialDelayMs));

  while (attempts < maxAttempts) {
    attempts += 1;
    callbacks.onPoll?.(txId, attempts);

    try {
      const statusString = await fetcher(txId);
      const status = normalizeStatus(statusString);

      if (status !== lastStatus) {
        lastStatus = status;
        callbacks.onStatusChange?.(status, attempts);
      }

      // Check for terminal states
      if (status === 'success') {
        callbacks.onSuccess?.(txId, attempts);
        return { status, attempts, timedOut: false };
      }

      if (isFailureStatus(status)) {
        const reason = getFailureReason(status);
        callbacks.onFailure?.(txId, reason, attempts);
        return { status, attempts, timedOut: false };
      }
    } catch (error) {
      // Network errors are ignored; continue polling
      console.warn(`Poll attempt ${attempts} failed for tx ${txId}:`, error);
    }

    // Wait before next poll
    if (attempts < maxAttempts) {
      const delay = useExponentialBackoff 
        ? getExponentialDelay(attempts, intervalMs)
        : intervalMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Max attempts reached
  callbacks.onTimeout?.(txId, lastStatus || 'unknown');

  return {
    status: lastStatus || 'unknown',
    attempts,
    timedOut: true,
    error: 'Polling timed out after maximum attempts',
  };
}

/**
 * Fire-and-forget version of pollTxStatus that runs in background.
 * Useful when you don't need to await the result.
 * 
 * @param txId - Transaction ID to poll
 * @param fetcher - Function to fetch transaction status
 * @param config - Polling configuration
 * @param callbacks - Optional callbacks for status changes
 */
export function pollTxStatusAsync(
  txId: string,
  fetcher: TxStatusFetcher,
  config?: PollConfig,
  callbacks?: PollCallbacks
): void {
  pollTxStatus(txId, fetcher, config, callbacks).catch((error) => {
    console.error('Background polling error:', error);
  });
}

/**
 * Normalize status string from API to standard TxStatus type.
 */
function normalizeStatus(status: string): TxStatus {
  const normalized = status.toLowerCase().trim();
  
  if (normalized === 'success') return 'success';
  if (normalized === 'pending') return 'pending';
  if (normalized === 'failed') return 'failed';
  if (normalized.includes('abort_by_response')) return 'abort_by_response';
  if (normalized.includes('abort_by_post_condition')) return 'abort_by_post_condition';
  if (normalized.includes('abort')) return 'abort_by_response';
  
  return 'unknown';
}

/**
 * Check if status represents a failure.
 */
function isFailureStatus(status: TxStatus): boolean {
  return status === 'failed' || 
         status === 'abort_by_response' || 
         status === 'abort_by_post_condition';
}

/**
 * Get human-readable failure reason.
 */
function getFailureReason(status: TxStatus): string {
  switch (status) {
    case 'failed':
      return 'Transaction failed';
    case 'abort_by_response':
      return 'Transaction aborted by contract response';
    case 'abort_by_post_condition':
      return 'Transaction aborted by post-condition';
    default:
      return 'Unknown failure';
  }
}

/**
 * Calculate exponential backoff delay.
 */
function getExponentialDelay(attempt: number, baseDelay: number): number {
  const exponential = Math.pow(2, Math.min(attempt - 1, 5));
  const jitter = Math.random() * 1000;
  return Math.min(baseDelay * exponential + jitter, 60_000); // Cap at 60s
}
