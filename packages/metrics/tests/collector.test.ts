import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsCollector } from '../src/collector';

// Mock fetch globally
global.fetch = vi.fn();

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
    vi.clearAllMocks();
  });

  describe('getDownloads', () => {
    it('should fetch download statistics successfully', async () => {
      const mockResponse = {
        downloads: 12345,
        start: '2026-03-31',
        end: '2026-04-07',
        package: '@sfsec/core',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const stats = await collector.getDownloads('@sfsec/core', 'last-week');

      expect(stats).toEqual({
        package: '@sfsec/core',
        downloads: 12345,
        start: '2026-03-31',
        end: '2026-04-07',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.npmjs.org/downloads/point/last-week/%40sfsec%2Fcore'
      );
    });

    it('should handle 404 responses by returning zero downloads', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const stats = await collector.getDownloads('@sfsec/new-package', 'last-day');

      expect(stats.package).toBe('@sfsec/new-package');
      expect(stats.downloads).toBe(0);
      expect(stats.start).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(stats.end).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should throw error for non-404 API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        collector.getDownloads('@sfsec/core', 'last-week')
      ).rejects.toThrow('NPM API error: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('fetch failed: Network error')
      );

      await expect(
        collector.getDownloads('@sfsec/core', 'last-week')
      ).rejects.toThrow('Failed to fetch metrics');
    });

    it('should encode package names with special characters', async () => {
      const mockResponse = {
        downloads: 100,
        start: '2026-04-01',
        end: '2026-04-07',
        package: '@sfsec/core',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await collector.getDownloads('@sfsec/core', 'last-day');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('%40sfsec%2Fcore')
      );
    });
  });

  describe('getDetailedDownloads', () => {
    it('should fetch detailed statistics with daily breakdown', async () => {
      const mockResponse = {
        downloads: [
          { downloads: 100, day: '2026-04-01' },
          { downloads: 150, day: '2026-04-02' },
          { downloads: 120, day: '2026-04-03' },
        ],
        start: '2026-04-01',
        end: '2026-04-03',
        package: '@sfsec/core',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const stats = await collector.getDetailedDownloads('@sfsec/core', 'last-week');

      expect(stats.package).toBe('@sfsec/core');
      expect(stats.downloads).toBe(370); // 100 + 150 + 120
      expect(stats.downloads_per_day).toHaveLength(3);
      expect(stats.downloads_per_day?.[0]).toEqual({
        downloads: 100,
        day: '2026-04-01',
      });
    });

    it('should handle numeric downloads format', async () => {
      const mockResponse = {
        downloads: 500,
        start: '2026-04-01',
        end: '2026-04-01',
        package: '@sfsec/core',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const stats = await collector.getDetailedDownloads('@sfsec/core', 'last-day');

      expect(stats.downloads).toBe(500);
      expect(stats.downloads_per_day).toEqual([]);
    });

    it('should handle 404 responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const stats = await collector.getDetailedDownloads('@sfsec/new-package', 'last-week');

      expect(stats.downloads).toBe(0);
      expect(stats.downloads_per_day).toEqual([]);
    });

    it('should use range endpoint', async () => {
      const mockResponse = {
        downloads: [],
        start: '2026-03-01',
        end: '2026-03-31',
        package: '@sfsec/core',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await collector.getDetailedDownloads('@sfsec/core', 'last-month');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.npmjs.org/downloads/range/last-month/%40sfsec%2Fcore'
      );
    });
  });

  describe('getPackageMetrics', () => {
    it('should fetch metrics for all time ranges', async () => {
      const mockResponses = [
        { downloads: 10, start: '2026-04-06', end: '2026-04-07', package: '@sfsec/core' },
        { downloads: 100, start: '2026-03-31', end: '2026-04-07', package: '@sfsec/core' },
        { downloads: 500, start: '2026-03-07', end: '2026-04-07', package: '@sfsec/core' },
        { downloads: 5000, start: '2025-04-07', end: '2026-04-07', package: '@sfsec/core' },
      ];

      mockResponses.forEach(response => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });
      });

      const metrics = await collector.getPackageMetrics('@sfsec/core');

      expect(metrics.package).toBe('@sfsec/core');
      expect(metrics.lastDay).toBe(10);
      expect(metrics.lastWeek).toBe(100);
      expect(metrics.lastMonth).toBe(500);
      expect(metrics.lastYear).toBe(5000);
      expect(metrics.fetchedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should make parallel requests', async () => {
      const mockResponse = {
        downloads: 100,
        start: '2026-04-01',
        end: '2026-04-07',
        package: '@sfsec/core',
      };

      // Mock 4 responses (one for each time range)
      for (let i = 0; i < 4; i++) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });
      }

      await collector.getPackageMetrics('@sfsec/core');

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('getBatchMetrics', () => {
    it('should fetch metrics for multiple packages', async () => {
      const packages = ['@sfsec/core', '@sfsec/security', '@sfsec/contracts'];
      
      // Mock 4 responses per package (12 total)
      for (let i = 0; i < 12; i++) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            downloads: 100,
            start: '2026-04-01',
            end: '2026-04-07',
            package: packages[Math.floor(i / 4)],
          }),
        });
      }

      const metrics = await collector.getBatchMetrics(packages);

      expect(metrics).toHaveLength(3);
      expect(metrics[0].package).toBe('@sfsec/core');
      expect(metrics[1].package).toBe('@sfsec/security');
      expect(metrics[2].package).toBe('@sfsec/contracts');
      expect(global.fetch).toHaveBeenCalledTimes(12); // 4 calls per package
    });

    it('should handle empty package list', async () => {
      const metrics = await collector.getBatchMetrics([]);

      expect(metrics).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('custom base URL', () => {
    it('should use custom base URL', async () => {
      const customCollector = new MetricsCollector('https://custom-api.example.com');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          downloads: 100,
          start: '2026-04-01',
          end: '2026-04-07',
          package: '@sfsec/core',
        }),
      });

      await customCollector.getDownloads('@sfsec/core', 'last-week');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom-api.example.com/point/last-week/%40sfsec%2Fcore'
      );
    });
  });
});
