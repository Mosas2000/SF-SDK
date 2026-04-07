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

// Export dashboard generator
export { generateDashboard, type DashboardOptions } from './dashboard';

// Export report generators
export { generateReport, generateDetailedReport, type ReportOptions } from './reporter';

export const version = '0.1.0';
