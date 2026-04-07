/**
 * Dashboard generator for visualizing package download metrics
 */

import type { PackageMetrics } from './types';

export interface DashboardOptions {
  /** Title for the dashboard */
  title?: string;
  /** Show daily change percentages */
  showPercentages?: boolean;
  /** Use color output (ANSI codes) */
  useColors?: boolean;
}

/**
 * Generate a CLI dashboard displaying package metrics.
 * 
 * @param metrics - Array of package metrics
 * @param options - Dashboard configuration options
 * @returns Formatted dashboard string
 * 
 * @example
 * ```typescript
 * const metrics = await collector.getBatchMetrics(['@sfsec/core', '@sfsec/security']);
 * const dashboard = generateDashboard(metrics, { title: 'SFSec SDK Downloads' });
 * console.log(dashboard);
 * ```
 */
export function generateDashboard(
  metrics: PackageMetrics[],
  options: DashboardOptions = {}
): string {
  const {
    title = 'NPM Download Metrics',
    showPercentages = true,
    useColors = true,
  } = options;

  const lines: string[] = [];
  
  // Header
  lines.push('');
  lines.push(formatHeader(title, useColors));
  lines.push('');

  if (metrics.length === 0) {
    lines.push('  No metrics available');
    lines.push('');
    return lines.join('\n');
  }

  // Table header
  const headers = ['Package', 'Day', 'Week', 'Month', 'Year'];
  if (showPercentages) {
    headers.push('Week/Month %');
  }
  
  lines.push(formatTableHeader(headers, useColors));
  lines.push(formatDivider(headers.length));

  // Table rows
  metrics.forEach(metric => {
    const row = formatMetricRow(metric, showPercentages, useColors);
    lines.push(row);
  });

  lines.push(formatDivider(headers.length));

  // Summary
  const total = calculateTotals(metrics);
  lines.push(formatTotalRow(total, showPercentages, useColors));
  lines.push('');

  // Footer
  const fetchTime = metrics[0]?.fetchedAt || new Date().toISOString();
  lines.push(formatFooter(fetchTime, useColors));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format header with title.
 */
function formatHeader(title: string, useColors: boolean): string {
  const decorated = useColors ? `\x1b[1m\x1b[36m${title}\x1b[0m` : title;
  const line = '─'.repeat(title.length + 4);
  return `  ${line}\n  │ ${decorated} │\n  ${line}`;
}

/**
 * Format table header row.
 */
function formatTableHeader(headers: string[], useColors: boolean): string {
  const formatted = headers.map((h, i) => {
    const width = getColumnWidth(i);
    const padded = h.padEnd(width);
    return useColors ? `\x1b[1m${padded}\x1b[0m` : padded;
  });
  
  return `  ${formatted.join('  ')}`;
}

/**
 * Format table divider.
 */
function formatDivider(columnCount: number): string {
  const widths = Array.from({ length: columnCount }, (_, i) => getColumnWidth(i));
  const segments = widths.map(w => '─'.repeat(w));
  return `  ${segments.join('  ')}`;
}

/**
 * Format metric row for a package.
 */
function formatMetricRow(
  metric: PackageMetrics,
  showPercentages: boolean,
  useColors: boolean
): string {
  const cols = [
    formatPackageName(metric.package, useColors),
    formatNumber(metric.lastDay).padStart(getColumnWidth(1)),
    formatNumber(metric.lastWeek).padStart(getColumnWidth(2)),
    formatNumber(metric.lastMonth).padStart(getColumnWidth(3)),
    formatNumber(metric.lastYear).padStart(getColumnWidth(4)),
  ];

  if (showPercentages) {
    const percentage = calculatePercentage(metric.lastWeek, metric.lastMonth);
    cols.push(formatPercentage(percentage, useColors).padStart(getColumnWidth(5)));
  }

  return `  ${cols.join('  ')}`;
}

/**
 * Format total row.
 */
function formatTotalRow(
  total: PackageMetrics,
  showPercentages: boolean,
  useColors: boolean
): string {
  const totalLabel = useColors ? '\x1b[1mTotal\x1b[0m' : 'Total';
  const cols = [
    totalLabel.padEnd(getColumnWidth(0) + (useColors ? 8 : 0)),
    formatNumber(total.lastDay, useColors).padStart(getColumnWidth(1)),
    formatNumber(total.lastWeek, useColors).padStart(getColumnWidth(2)),
    formatNumber(total.lastMonth, useColors).padStart(getColumnWidth(3)),
    formatNumber(total.lastYear, useColors).padStart(getColumnWidth(4)),
  ];

  if (showPercentages) {
    const percentage = calculatePercentage(total.lastWeek, total.lastMonth);
    cols.push(formatPercentage(percentage, useColors).padStart(getColumnWidth(5)));
  }

  return `  ${cols.join('  ')}`;
}

/**
 * Format package name with highlighting.
 */
function formatPackageName(name: string, useColors: boolean): string {
  const formatted = name.padEnd(getColumnWidth(0));
  return useColors ? `\x1b[34m${formatted}\x1b[0m` : formatted;
}

/**
 * Format number with thousands separator.
 */
function formatNumber(num: number, bold = false): string {
  const formatted = num.toLocaleString('en-US');
  return bold ? `\x1b[1m${formatted}\x1b[0m` : formatted;
}

/**
 * Format percentage with color coding.
 */
function formatPercentage(percentage: number, useColors: boolean): string {
  const sign = percentage >= 0 ? '+' : '';
  const formatted = `${sign}${percentage.toFixed(1)}%`;
  
  if (!useColors) return formatted;
  
  if (percentage > 20) return `\x1b[32m${formatted}\x1b[0m`; // Green
  if (percentage < -20) return `\x1b[31m${formatted}\x1b[0m`; // Red
  return `\x1b[33m${formatted}\x1b[0m`; // Yellow
}

/**
 * Calculate percentage change from week to month.
 */
function calculatePercentage(week: number, month: number): number {
  if (month === 0) return 0;
  // Normalize to weekly rate
  const weeklyFromMonth = month / 4.33; // Average weeks per month
  return ((week - weeklyFromMonth) / weeklyFromMonth) * 100;
}

/**
 * Calculate totals across all packages.
 */
function calculateTotals(metrics: PackageMetrics[]): PackageMetrics {
  return metrics.reduce(
    (acc, curr) => ({
      package: 'Total',
      lastDay: acc.lastDay + curr.lastDay,
      lastWeek: acc.lastWeek + curr.lastWeek,
      lastMonth: acc.lastMonth + curr.lastMonth,
      lastYear: acc.lastYear + curr.lastYear,
      fetchedAt: acc.fetchedAt,
    }),
    {
      package: 'Total',
      lastDay: 0,
      lastWeek: 0,
      lastMonth: 0,
      lastYear: 0,
      fetchedAt: new Date().toISOString(),
    }
  );
}

/**
 * Format footer with timestamp.
 */
function formatFooter(timestamp: string, useColors: boolean): string {
  const date = new Date(timestamp);
  const formatted = date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  
  const text = `  Updated: ${formatted}`;
  return useColors ? `\x1b[90m${text}\x1b[0m` : text;
}

/**
 * Get column width for alignment.
 */
function getColumnWidth(index: number): number {
  const widths = [30, 10, 10, 10, 12, 15];
  return widths[index] || 10;
}
