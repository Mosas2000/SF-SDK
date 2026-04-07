/**
 * @sfsec/metrics - NPM download metrics and analytics
 * 
 * Track download statistics, generate reports, and visualize package adoption.
 */

// Export types
export type {
  TimeRange,
  DownloadStats,
  DailyDownloads,
  DetailedStats,
  PackageMetrics,
} from './types';

// Export metrics collector
export { MetricsCollector } from './collector';

export const version = '0.1.0';
