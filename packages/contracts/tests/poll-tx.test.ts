import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pollTxStatus, pollTxStatusAsync, type TxStatusFetcher } from '../src/poll-tx';

describe('pollTxStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve when transaction succeeds', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('success');
    const onSuccess = vi.fn();

    const promise = pollTxStatus(
      '0xabc',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100 },
      { onSuccess }
    );

    // Advance past initial delay
    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;

    expect(result).toEqual({
      status: 'success',
      attempts: 1,
      timedOut: false,
    });
    expect(onSuccess).toHaveBeenCalledWith('0xabc', 1);
  });

  it('should resolve when transaction fails', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('failed');
    const onFailure = vi.fn();

    const promise = pollTxStatus(
      '0xdef',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100 },
      { onFailure }
    );

    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result.status).toBe('failed');
    expect(result.timedOut).toBe(false);
    expect(onFailure).toHaveBeenCalledWith('0xdef', 'Transaction failed', 1);
  });

  it('should handle abort_by_response status', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('abort_by_response');
    const onFailure = vi.fn();

    const promise = pollTxStatus(
      '0xghi',
      fetcher,
      { initialDelayMs: 100 },
      { onFailure }
    );

    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result.status).toBe('abort_by_response');
    expect(onFailure).toHaveBeenCalledWith('0xghi', 'Transaction aborted by contract response', 1);
  });

  it('should handle abort_by_post_condition status', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('abort_by_post_condition');

    const promise = pollTxStatus('0xjkl', fetcher, { initialDelayMs: 100 });

    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result.status).toBe('abort_by_post_condition');
    expect(result.timedOut).toBe(false);
  });

  it('should poll multiple times for pending status', async () => {
    const fetcher: TxStatusFetcher = vi.fn()
      .mockResolvedValueOnce('pending')
      .mockResolvedValueOnce('pending')
      .mockResolvedValue('success');

    const onPoll = vi.fn();

    const promise = pollTxStatus(
      '0xmno',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100 },
      { onPoll }
    );

    // Initial delay
    await vi.advanceTimersByTimeAsync(100);
    // First poll (pending) + interval
    await vi.advanceTimersByTimeAsync(100);
    // Second poll (pending) + interval
    await vi.advanceTimersByTimeAsync(100);
    // Third poll (success)

    const result = await promise;

    expect(result.status).toBe('success');
    expect(result.attempts).toBe(3);
    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  it('should timeout after max attempts', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('pending');
    const onTimeout = vi.fn();

    const promise = pollTxStatus(
      '0xpqr',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100, maxAttempts: 3 },
      { onTimeout }
    );

    // Initial delay
    await vi.advanceTimersByTimeAsync(100);
    // Poll 1
    await vi.advanceTimersByTimeAsync(100);
    // Poll 2
    await vi.advanceTimersByTimeAsync(100);
    // Poll 3 (last attempt)

    const result = await promise;

    expect(result.timedOut).toBe(true);
    expect(result.attempts).toBe(3);
    expect(result.error).toBe('Polling timed out after maximum attempts');
    expect(onTimeout).toHaveBeenCalledWith('0xpqr', 'pending');
  });

  it('should handle network errors and continue polling', async () => {
    const fetcher: TxStatusFetcher = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValue('success');

    const promise = pollTxStatus(
      '0xstu',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100 }
    );

    // Initial delay
    await vi.advanceTimersByTimeAsync(100);
    // Poll 1 (error) + interval
    await vi.advanceTimersByTimeAsync(100);
    // Poll 2 (error) + interval
    await vi.advanceTimersByTimeAsync(100);
    // Poll 3 (success)

    const result = await promise;

    expect(result.status).toBe('success');
    expect(result.attempts).toBe(3);
  });

  it('should call onStatusChange when status changes', async () => {
    const fetcher: TxStatusFetcher = vi.fn()
      .mockResolvedValueOnce('pending')
      .mockResolvedValue('success');

    const onStatusChange = vi.fn();

    const promise = pollTxStatus(
      '0xvwx',
      fetcher,
      { initialDelayMs: 100, intervalMs: 100 },
      { onStatusChange }
    );

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    await promise;

    expect(onStatusChange).toHaveBeenCalledWith('pending', 1);
    expect(onStatusChange).toHaveBeenCalledWith('success', 2);
  });

  it('should use exponential backoff when enabled', async () => {
    const fetcher: TxStatusFetcher = vi.fn()
      .mockResolvedValueOnce('pending')
      .mockResolvedValueOnce('pending')
      .mockResolvedValue('success');

    const promise = pollTxStatus(
      '0xyz',
      fetcher,
      { 
        initialDelayMs: 100, 
        intervalMs: 1000, 
        useExponentialBackoff: true 
      }
    );

    // Initial delay
    await vi.advanceTimersByTimeAsync(100);
    
    // First poll (pending) - backoff delay should be ~1000-2000ms
    await vi.advanceTimersByTimeAsync(2500);
    
    // Second poll (pending) - backoff delay should be ~2000-3000ms  
    await vi.advanceTimersByTimeAsync(3500);

    const result = await promise;

    expect(result.status).toBe('success');
    expect(result.attempts).toBe(3);
  });

  it('should normalize status strings', async () => {
    const fetcher: TxStatusFetcher = vi.fn()
      .mockResolvedValueOnce('SUCCESS')
      .mockResolvedValue('success');

    const onStatusChange = vi.fn();

    const promise = pollTxStatus(
      '0xabc',
      fetcher,
      { initialDelayMs: 100 },
      { onStatusChange }
    );

    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;

    expect(result.status).toBe('success');
    // Should not call onStatusChange if normalized status is the same
    expect(onStatusChange).toHaveBeenCalledTimes(1);
  });
});

describe('pollTxStatusAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should run polling in background without awaiting', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockResolvedValue('success');
    const onSuccess = vi.fn();

    // This should not throw and should return void immediately
    pollTxStatusAsync(
      '0xbg',
      fetcher,
      { initialDelayMs: 100 },
      { onSuccess }
    );

    expect(fetcher).not.toHaveBeenCalled();

    // Advance time to complete the polling
    await vi.advanceTimersByTimeAsync(100);
    
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should handle errors silently', async () => {
    const fetcher: TxStatusFetcher = vi.fn().mockRejectedValue(new Error('Fatal error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    pollTxStatusAsync('0xbg2', fetcher, { initialDelayMs: 100, maxAttempts: 1 });

    // Advance time through initial delay and one poll attempt
    await vi.advanceTimersByTimeAsync(200);
    
    // Give microtasks time to settle
    await vi.runAllTimersAsync();

    // Should log error during polling (from console.warn)
    expect(fetcher).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
