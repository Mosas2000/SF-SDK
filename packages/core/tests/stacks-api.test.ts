/**
 * Tests for Stacks API Client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StacksApiClient, createStacksApiClient } from '../src/stacks-api';

// Mock fetch globally
global.fetch = vi.fn();

describe('StacksApiClient', () => {
  let client: StacksApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new StacksApiClient({
      baseUrl: 'https://api.testnet.hiro.so',
      timeout: 5000,
      cacheTTL: 1000,
    });
  });

  describe('getTransaction', () => {
    it('should fetch transaction details', async () => {
      const mockTxData = {
        tx_id: '0xabc123',
        tx_status: 'success',
        tx_type: 'contract_call',
        block_height: 12345,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTxData,
      });

      const result = await client.getTransaction('0xabc123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tx_id).toBe('0xabc123');
        expect(result.data.tx_status).toBe('success');
      }
    });

    it('should cache transaction results', async () => {
      const mockTxData = {
        tx_id: '0xabc123',
        tx_status: 'success',
        tx_type: 'contract_call',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTxData,
      });

      await client.getTransaction('0xabc123');
      const result = await client.getTransaction('0xabc123');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await client.getTransaction('0xinvalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Not Found');
      }
    });
  });

  describe('getTransactionStatus', () => {
    it('should normalize success status', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tx_id: '0xabc123',
          tx_status: 'success',
          tx_type: 'contract_call',
        }),
      });

      const status = await client.getTransactionStatus('0xabc123');
      expect(status).toBe('success');
    });

    it('should normalize pending status', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tx_id: '0xabc123',
          tx_status: 'pending',
          tx_type: 'contract_call',
        }),
      });

      const status = await client.getTransactionStatus('0xabc123');
      expect(status).toBe('pending');
    });
  });

  describe('factory function', () => {
    it('should create client with factory', () => {
      const newClient = createStacksApiClient({
        baseUrl: 'https://api.mainnet.hiro.so',
      });

      expect(newClient).toBeInstanceOf(StacksApiClient);
    });
  });
});
