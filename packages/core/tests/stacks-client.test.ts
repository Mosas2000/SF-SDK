/**
 * Tests for Stacks Client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StacksClient, createStacksClient, stacksMainnet, stacksTestnet } from '../src/stacks-client';

// Mock fetch globally
global.fetch = vi.fn();

describe('StacksClient', () => {
  let client: StacksClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new StacksClient({
      baseUrl: 'https://api.testnet.hiro.so',
    });
  });

  describe('callReadOnly', () => {
    it('should call read-only contract function', async () => {
      const mockResult = {
        okay: true,
        result: '0x05',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await client.callReadOnly({
        contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        contractName: 'my-contract',
        functionName: 'get-value',
        functionArgs: [],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.okay).toBe(true);
      }
    });

    it('should handle contract call errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await client.callReadOnly({
        contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        contractName: 'my-contract',
        functionName: 'invalid',
        functionArgs: [],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getSTXBalance', () => {
    it('should get and parse STX balance', async () => {
      const mockBalance = {
        stx: {
          balance: '1000000000',
          total_sent: '0',
          total_received: '1000000000',
          locked: '0',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalance,
      });

      const result = await client.getSTXBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1000000000n);
      }
    });
  });

  describe('STX conversions', () => {
    it('should convert microSTX to STX', () => {
      expect(client.microSTXToSTX(1000000)).toBe(1);
      expect(client.microSTXToSTX(10000000)).toBe(10);
      expect(client.microSTXToSTX(500000)).toBe(0.5);
    });

    it('should convert STX to microSTX', () => {
      expect(client.STXToMicroSTX(1)).toBe(1000000n);
      expect(client.STXToMicroSTX(10)).toBe(10000000n);
      expect(client.STXToMicroSTX(0.5)).toBe(500000n);
    });
  });

  describe('waitForTransaction', () => {
    it('should wait for transaction to succeed', async () => {
      const mockTx = {
        tx_id: '0xabc123',
        tx_status: 'success',
        tx_type: 'contract_call',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTx,
      });

      const result = await client.waitForTransaction('0xabc123', {
        intervalMs: 100,
        maxAttempts: 5,
      });

      expect(result.status).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should timeout after max attempts', async () => {
      const mockTx = {
        tx_id: '0xabc123',
        tx_status: 'pending',
        tx_type: 'contract_call',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTx,
      });

      const result = await client.waitForTransaction('0xabc123', {
        intervalMs: 10,
        maxAttempts: 3,
      });

      expect(result.status).toBe('timeout');
      expect(result.attempts).toBe(3);
    });

    it('should call onPoll callback', async () => {
      const mockTx = {
        tx_id: '0xabc123',
        tx_status: 'success',
        tx_type: 'contract_call',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTx,
      });

      const onPoll = vi.fn();
      await client.waitForTransaction('0xabc123', {
        intervalMs: 10,
        onPoll,
      });

      expect(onPoll).toHaveBeenCalledWith(1);
    });
  });

  describe('factory functions', () => {
    it('should create client with factory', () => {
      const newClient = createStacksClient();
      expect(newClient).toBeInstanceOf(StacksClient);
    });

    it('should have mainnet client', () => {
      expect(stacksMainnet).toBeInstanceOf(StacksClient);
    });

    it('should have testnet client', () => {
      expect(stacksTestnet).toBeInstanceOf(StacksClient);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      expect(() => client.clearCache()).not.toThrow();
    });

    it('should invalidate cache entry', () => {
      expect(() => client.invalidateCache('tx:0xabc123')).not.toThrow();
    });
  });
});
