# @sfsec/metrics

NPM download metrics and analytics for SFSec SDK packages. Track download statistics, generate reports, and visualize package adoption with beautiful CLI dashboards and markdown reports.

## Features

-  **Download Statistics**: Fetch NPM download data for any package
-  **Time Ranges**: Support for last-day, last-week, last-month, last-year
-  **Batch Queries**: Fetch metrics for multiple packages simultaneously
-  **CLI Dashboard**: Beautiful terminal dashboard with color-coded metrics
-  **Report Generation**: Generate markdown reports with growth trends
-  **Detailed Analytics**: Daily breakdowns with statistics
-  **Type-Safe**: Full TypeScript support with strict types
-  **Zero Dependencies**: No external runtime dependencies

## Installation

```bash
npm install @sfsec/metrics
```

## Quick Start

### Fetch Download Statistics

```typescript
import { MetricsCollector } from '@sfsec/metrics';

// Create collector instance
const collector = new MetricsCollector();

// Fetch download stats for a package
const stats = await collector.getDownloads('@sfsec/core', 'last-week');
console.log(`Total downloads: ${stats.downloads}`);
console.log(`Period: ${stats.start} to ${stats.end}`);
```

### Generate CLI Dashboard

```typescript
import { MetricsCollector, generateDashboard } from '@sfsec/metrics';

const collector = new MetricsCollector();

// Fetch metrics for multiple packages
const metrics = await collector.getBatchMetrics([
  '@sfsec/core',
  '@sfsec/security',
  '@sfsec/contracts',
  '@sfsec/metrics',
]);

// Generate and display dashboard
const dashboard = generateDashboard(metrics, {
  title: 'SFSec SDK Downloads',
  useColors: true,
  showPercentages: true,
});

console.log(dashboard);
```

**Example Output:**
```
  
 SFSec SDK Downloads   
  

  Package                          Day         Week        Month       Year          Week/Month %
            
  @sfsec/core                     150         1,200       5,500       65,000        +1.8%
  @sfsec/security                 120         950         4,200       48,000        +2.5%
  @sfsec/contracts                100         800         3,800       42,000        -3.1%
  @sfsec/metrics                  80          600         2,500       28,000        +6.2%
            
  Total                           450         3,550       16,000      183,000       +0.8%

  Updated: Apr 7, 2026, 8:20 AM
```

### Generate Markdown Report

```typescript
import { MetricsCollector, generateReport } from '@sfsec/metrics';

const collector = new MetricsCollector();
const metrics = await collector.getBatchMetrics(['@sfsec/core']);

// Generate markdown report
const report = generateReport(metrics, {
  title: 'Monthly Download Report',
  includeTrends: true,
});

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('download-report.md', report);
```

### Generate Detailed Report with Daily Breakdown

```typescript
import { MetricsCollector, generateDetailedReport } from '@sfsec/metrics';

const collector = new MetricsCollector();

// Get detailed statistics with daily breakdown
const detailedStats = await collector.getDetailedDownloads('@sfsec/core', 'last-month');

// Generate detailed report
const report = generateDetailedReport([detailedStats], {
  title: 'Detailed Monthly Report',
});

console.log(report);
```

## API Reference

### MetricsCollector

The main class for fetching NPM download statistics.

#### `constructor(baseUrl?: string)`

Create a new metrics collector.

- `baseUrl` (optional): Custom NPM API base URL (default: `https://api.npmjs.org/downloads`)

```typescript
const collector = new MetricsCollector();
```

#### `getDownloads(packageName: string, range: TimeRange): Promise<DownloadStats>`

Fetch download statistics for a package over a time range.

**Parameters:**
- `packageName`: NPM package name (e.g., `'@sfsec/core'`)
- `range`: Time range (`'last-day'`, `'last-week'`, `'last-month'`, `'last-year'`)

**Returns:** Promise resolving to `DownloadStats`

```typescript
const stats = await collector.getDownloads('@sfsec/core', 'last-week');
console.log(stats.downloads); // Total downloads
console.log(stats.start);     // Start date (YYYY-MM-DD)
console.log(stats.end);       // End date (YYYY-MM-DD)
```

#### `getDetailedDownloads(packageName: string, range: TimeRange): Promise<DetailedStats>`

Fetch detailed statistics with daily breakdown.

**Parameters:**
- `packageName`: NPM package name
- `range`: Time range

**Returns:** Promise resolving to `DetailedStats` with daily downloads

```typescript
const stats = await collector.getDetailedDownloads('@sfsec/core', 'last-month');

stats.downloads_per_day?.forEach(day => {
  console.log(`${day.day}: ${day.downloads} downloads`);
});
```

#### `getPackageMetrics(packageName: string): Promise<PackageMetrics>`

Fetch comprehensive metrics across all time ranges.

**Parameters:**
- `packageName`: NPM package name

**Returns:** Promise resolving to `PackageMetrics` with all time ranges

```typescript
const metrics = await collector.getPackageMetrics('@sfsec/core');

console.log(`Last day: ${metrics.lastDay}`);
console.log(`Last week: ${metrics.lastWeek}`);
console.log(`Last month: ${metrics.lastMonth}`);
console.log(`Last year: ${metrics.lastYear}`);
```

#### `getBatchMetrics(packageNames: string[]): Promise<PackageMetrics[]>`

Fetch metrics for multiple packages simultaneously.

**Parameters:**
- `packageNames`: Array of package names

**Returns:** Promise resolving to array of `PackageMetrics`

```typescript
const metrics = await collector.getBatchMetrics([
  '@sfsec/core',
  '@sfsec/security',
  '@sfsec/contracts',
]);
```

### Dashboard Generation

#### `generateDashboard(metrics: PackageMetrics[], options?: DashboardOptions): string`

Generate a CLI dashboard with formatted tables and colors.

**Parameters:**
- `metrics`: Array of package metrics
- `options`: Dashboard configuration
  - `title`: Dashboard title (default: `'NPM Download Metrics'`)
  - `showPercentages`: Show growth percentages (default: `true`)
  - `useColors`: Use ANSI color codes (default: `true`)

**Returns:** Formatted dashboard string

```typescript
const dashboard = generateDashboard(metrics, {
  title: 'My Dashboard',
  useColors: true,
  showPercentages: true,
});
```

### Report Generation

#### `generateReport(metrics: PackageMetrics[], options?: ReportOptions): string`

Generate a markdown report with summary and trends.

**Parameters:**
- `metrics`: Array of package metrics
- `options`: Report configuration
  - `title`: Report title (default: `'NPM Download Metrics Report'`)
  - `includeTrends`: Include growth trends (default: `true`)

**Returns:** Markdown-formatted report

```typescript
const report = generateReport(metrics, {
  title: 'Monthly Report',
  includeTrends: true,
});
```

#### `generateDetailedReport(detailedStats: DetailedStats[], options?: ReportOptions): string`

Generate a detailed markdown report with daily breakdowns.

**Parameters:**
- `detailedStats`: Array of detailed statistics
- `options`: Report configuration
  - `title`: Report title (default: `'Detailed NPM Download Report'`)

**Returns:** Markdown-formatted detailed report

```typescript
const detailedStats = await collector.getDetailedDownloads('@sfsec/core', 'last-month');
const report = generateDetailedReport([detailedStats], {
  title: 'Detailed Analysis',
});
```

## Type Definitions

```typescript
export type TimeRange = 'last-day' | 'last-week' | 'last-month' | 'last-year';

export interface DownloadStats {
  package: string;
  downloads: number;
  start: string;      // YYYY-MM-DD
  end: string;        // YYYY-MM-DD
}

export interface DailyDownloads {
  downloads: number;
  day: string;        // YYYY-MM-DD
}

export interface DetailedStats extends DownloadStats {
  downloads_per_day?: DailyDownloads[];
}

export interface PackageMetrics {
  package: string;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
  fetchedAt: string;  // ISO 8601
}

export interface DashboardOptions {
  title?: string;
  showPercentages?: boolean;
  useColors?: boolean;
}

export interface ReportOptions {
  title?: string;
  includeDailyBreakdown?: boolean;
  includeTrends?: boolean;
}
```

## Examples

### Track Package Growth Over Time

```typescript
import { MetricsCollector } from '@sfsec/metrics';

const collector = new MetricsCollector();
const packageName = '@sfsec/core';

// Fetch current metrics
const current = await collector.getPackageMetrics(packageName);

// Save to database/file for historical tracking
await saveMetrics(current);

// Calculate growth from previous period
const growth = calculateGrowth(current, previous);
console.log(`Monthly growth: ${growth}%`);
```

### Monitor Multiple Package Suite

```typescript
import { MetricsCollector, generateDashboard } from '@sfsec/metrics';

const collector = new MetricsCollector();

const packages = [
  '@sfsec/core',
  '@sfsec/security',
  '@sfsec/contracts',
  '@sfsec/metrics',
];

// Fetch all metrics in parallel
const metrics = await collector.getBatchMetrics(packages);

// Display dashboard
console.log(generateDashboard(metrics, {
  title: 'SFSec Package Downloads',
}));
```

### Generate Weekly Report

```typescript
import { MetricsCollector, generateReport } from '@sfsec/metrics';
import { writeFileSync } from 'fs';

const collector = new MetricsCollector();

async function generateWeeklyReport() {
  const packages = ['@sfsec/core', '@sfsec/security'];
  const metrics = await collector.getBatchMetrics(packages);
  
  const report = generateReport(metrics, {
    title: `Weekly Report - ${new Date().toLocaleDateString()}`,
    includeTrends: true,
  });
  
  writeFileSync('weekly-report.md', report);
  console.log('Report saved to weekly-report.md');
}

generateWeeklyReport();
```

### Create Custom Analytics

```typescript
import { MetricsCollector } from '@sfsec/metrics';

const collector = new MetricsCollector();

async function analyzeDownloadPattern(packageName: string) {
  const detailed = await collector.getDetailedDownloads(packageName, 'last-month');
  
  if (!detailed.downloads_per_day) return;
  
  const dailyDownloads = detailed.downloads_per_day.map(d => d.downloads);
  const average = dailyDownloads.reduce((a, b) => a + b, 0) / dailyDownloads.length;
  const peak = Math.max(...dailyDownloads);
  const low = Math.min(...dailyDownloads);
  
  console.log(`Average: ${Math.round(average)} downloads/day`);
  console.log(`Peak: ${peak} downloads`);
  console.log(`Low: ${low} downloads`);
  console.log(`Variance: ${((peak - low) / average * 100).toFixed(1)}%`);
}

analyzeDownloadPattern('@sfsec/core');
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build package
npm run build
```

## Error Handling

The metrics collector handles various error scenarios:

```typescript
try {
  const stats = await collector.getDownloads('@sfsec/core', 'last-week');
  console.log(stats.downloads);
} catch (error) {
  if (error.message.includes('404')) {
    console.log('Package not found or no download data available');
  } else if (error.message.includes('Failed to fetch')) {
    console.log('Network error - please check your connection');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Dependencies

- **Runtime**: Zero dependencies
- **Dev Dependencies**: TypeScript, tsup, Vitest

## License

 SFSecMIT 

## Related Packages

- [@sfsec/core](../core) - Core SDK types and utilities
- [@sfsec/security](../security) - Security validation and sanitization
- [@sfsec/contracts](../contracts) - Smart contract interaction utilities
