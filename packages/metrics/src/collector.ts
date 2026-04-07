/**
 * MetricsCollector - Fetch NPM download statistics from the NPM registry API
 */

import type {
  TimeRange,
  DownloadStats,
  DetailedStats,
  PackageMetrics,
  NPMApiResponse,
  NPMApiDetailedResponse,
} from './types';

/**
 * NPM Stats API base URL
 */
const NPM_API_BASE = 'https://api.npmjs.org/downloads';

/**
 * Collector for NPM package download statistics.
 * Uses the official NPM stats API to fetch download data.
 */
export class MetricsCollector {
  private baseUrl: string;

  constructor(baseUrl: string = NPM_API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch download statistics for a package over a time range.
   * 
   * @param packageName - NPM package name (e.g., '@sfsec/core')
   * @param range - Time range ('last-day', 'last-week', 'last-month', 'last-year')
   * @returns Download statistics
   * 
   * @example
   * ```typescript
   * const collector = new MetricsCollector();
   * const stats = await collector.getDownloads('@sfsec/core', 'last-week');
   * console.log(`Downloads: ${stats.downloads}`);
   * ```
   */
  async getDownloads(packageName: string, range: TimeRange): Promise<DownloadStats> {
    const url = `${this.baseUrl}/point/${range}/${encodeURIComponent(packageName)}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            package: packageName,
            downloads: 0,
            start: this.getStartDate(range),
            end: this.getEndDate(),
          };
        }
        throw new Error(`NPM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as NPMApiResponse;
      
      return {
        package: data.package,
        downloads: data.downloads,
        start: data.start,
        end: data.end,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(`Failed to fetch metrics: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetch detailed download statistics with daily breakdown.
   * 
   * @param packageName - NPM package name
   * @param range - Time range
   * @returns Detailed statistics with daily downloads
   * 
   * @example
   * ```typescript
   * const stats = await collector.getDetailedDownloads('@sfsec/core', 'last-month');
   * stats.downloads_per_day?.forEach(day => {
   *   console.log(`${day.day}: ${day.downloads}`);
   * });
   * ```
   */
  async getDetailedDownloads(packageName: string, range: TimeRange): Promise<DetailedStats> {
    const url = `${this.baseUrl}/range/${range}/${encodeURIComponent(packageName)}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            package: packageName,
            downloads: 0,
            start: this.getStartDate(range),
            end: this.getEndDate(),
            downloads_per_day: [],
          };
        }
        throw new Error(`NPM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as NPMApiDetailedResponse;
      
      // Handle both formats from NPM API
      const downloadsPerDay = Array.isArray(data.downloads) ? data.downloads : [];
      const totalDownloads = Array.isArray(data.downloads)
        ? data.downloads.reduce((sum, day) => sum + day.downloads, 0)
        : (typeof data.downloads === 'number' ? data.downloads : 0);
      
      return {
        package: data.package,
        downloads: totalDownloads,
        start: data.start,
        end: data.end,
        downloads_per_day: downloadsPerDay,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(`Failed to fetch detailed metrics: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetch comprehensive metrics for a package across all time ranges.
   * 
   * @param packageName - NPM package name
   * @returns Metrics for all time ranges
   * 
   * @example
   * ```typescript
   * const metrics = await collector.getPackageMetrics('@sfsec/core');
   * console.log(`Last week: ${metrics.lastWeek}`);
   * console.log(`Last month: ${metrics.lastMonth}`);
   * ```
   */
  async getPackageMetrics(packageName: string): Promise<PackageMetrics> {
    const [lastDay, lastWeek, lastMonth, lastYear] = await Promise.all([
      this.getDownloads(packageName, 'last-day'),
      this.getDownloads(packageName, 'last-week'),
      this.getDownloads(packageName, 'last-month'),
      this.getDownloads(packageName, 'last-year'),
    ]);

    return {
      package: packageName,
      lastDay: lastDay.downloads,
      lastWeek: lastWeek.downloads,
      lastMonth: lastMonth.downloads,
      lastYear: lastYear.downloads,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch metrics for multiple packages simultaneously.
   * 
   * @param packageNames - Array of package names
   * @returns Array of package metrics
   * 
   * @example
   * ```typescript
   * const metrics = await collector.getBatchMetrics([
   *   '@sfsec/core',
   *   '@sfsec/security',
   *   '@sfsec/contracts',
   * ]);
   * ```
   */
  async getBatchMetrics(packageNames: string[]): Promise<PackageMetrics[]> {
    return Promise.all(
      packageNames.map(pkg => this.getPackageMetrics(pkg))
    );
  }

  /**
   * Get start date for a time range.
   */
  private getStartDate(range: TimeRange): string {
    const now = new Date();
    const start = new Date(now);
    
    switch (range) {
      case 'last-day':
        start.setDate(now.getDate() - 1);
        break;
      case 'last-week':
        start.setDate(now.getDate() - 7);
        break;
      case 'last-month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'last-year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return this.formatDate(start);
  }

  /**
   * Get end date (today).
   */
  private getEndDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Format date as YYYY-MM-DD.
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
