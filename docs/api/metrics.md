# @sfsec/metrics API Reference

NPM download metrics and analytics tools.

## Installation

```bash
npm install @sfsec/metrics
```

## MetricsCollector

Fetch NPM download statistics for packages.

### Constructor

```typescript
import { MetricsCollector } from '@sfsec/metrics';

const collector = new MetricsCollector();
```

### Methods

#### `getDownloads(packageName, range): Promise<DownloadStats>`

Get download statistics for a specific time range.

```typescript
const stats = await collector.getDownloads('@sfsec/core', 'last-week');

console.log(`Package: ${stats.package}`);
console.log(`Downloads: ${stats.downloads}`);
console.log(`Period: ${stats.start} to ${stats.end}`);
```

**Time Ranges:**
- `'last-day'` - Last 24 hours
- `'last-week'` - Last 7 days
- `'last-month'` - Last 30 days
- `'last-year'` - Last 365 days

#### `getDetailedDownloads(packageName, range): Promise<DetailedStats>`

Get download statistics with daily breakdown.

```typescript
const detailed = await collector.getDetailedDownloads('@sfsec/core', 'last-month');

detailed.downloads.forEach(day => {
  console.log(`${day.day}: ${day.downloads} downloads`);
});
```

#### `getPackageMetrics(packageName): Promise<PackageMetrics>`

Get comprehensive metrics across all time ranges.

```typescript
const metrics = await collector.getPackageMetrics('@sfsec/core');

console.log(`Package: ${metrics.package}`);
console.log(`Last day: ${metrics.lastDay}`);
console.log(`Last week: ${metrics.lastWeek}`);
console.log(`Last month: ${metrics.lastMonth}`);
console.log(`Last year: ${metrics.lastYear}`);
```

#### `getBatchMetrics(packageNames): Promise<PackageMetrics[]>`

Get metrics for multiple packages in parallel.

```typescript
const packages = [
  '@sfsec/core',
  '@sfsec/security',
  '@sfsec/contracts',
  '@sfsec/metrics',
];

const allMetrics = await collector.getBatchMetrics(packages);

allMetrics.forEach(m => {
  console.log(`${m.package}: ${m.lastWeek} downloads this week`);
});
```

## Dashboard Generation

### `generateDashboard(metrics, options)`

Generate a CLI dashboard with formatted tables.

```typescript
import { generateDashboard } from '@sfsec/metrics';

const metrics = await collector.getBatchMetrics(['@sfsec/core', '@sfsec/security']);

const dashboard = generateDashboard(metrics, {
  title: 'SFSec Package Downloads',
  useColors: true,
  showPercentages: true,
  sortBy: 'lastWeek',
  sortOrder: 'desc',
});

console.log(dashboard);
```

**Options:**
```typescript
interface DashboardOptions {
  title?: string;
  useColors?: boolean;
  showPercentages?: boolean;
  sortBy?: 'package' | 'lastDay' | 'lastWeek' | 'lastMonth' | 'lastYear';
  sortOrder?: 'asc' | 'desc';
}
```

## Report Generation

### `generateReport(metrics, options)`

Generate a markdown report.

```typescript
import { generateReport } from '@sfsec/metrics';

const report = generateReport(metrics, {
  title: 'Weekly Download Report',
  includeTrends: true,
  includeCharts: false,
});

console.log(report);
// Or save to file
await fs.writeFile('report.md', report);
```

### `generateDetailedReport(detailedStats, options)`

Generate a detailed report with daily breakdowns.

```typescript
import { generateDetailedReport } from '@sfsec/metrics';

const detailed = await collector.getDetailedDownloads('@sfsec/core', 'last-month');

const report = generateDetailedReport(detailed, {
  title: 'Monthly Detailed Report',
  includeDaily: true,
  includeTrends: true,
});
```

## Types

### DownloadStats

```typescript
interface DownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}
```

### DetailedStats

```typescript
interface DetailedStats {
  downloads: Array<{
    downloads: number;
    day: string;
  }>;
  start: string;
  end: string;
  package: string;
}
```

### PackageMetrics

```typescript
interface PackageMetrics {
  package: string;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
}
```

## Example: Complete Metrics Workflow

```typescript
import { 
  MetricsCollector,
  generateDashboard,
  generateReport
} from '@sfsec/metrics';
import * as fs from 'fs/promises';

async function generateMetricsReport() {
  const collector = new MetricsCollector();
  
  const packages = [
    '@sfsec/core',
    '@sfsec/security',
    '@sfsec/contracts',
    '@sfsec/metrics',
  ];

  // Fetch metrics
  console.log('Fetching metrics...');
  const metrics = await collector.getBatchMetrics(packages);

  // Display dashboard in CLI
  const dashboard = generateDashboard(metrics, {
    title: 'SFSec SDK Downloads',
    useColors: true,
    showPercentages: true,
    sortBy: 'lastWeek',
    sortOrder: 'desc',
  });
  
  console.log(dashboard);

  // Generate markdown report
  const report = generateReport(metrics, {
    title: 'Weekly Download Report',
    includeTrends: true,
  });

  // Save to file
  await fs.writeFile('metrics-report.md', report);
  console.log('Report saved to metrics-report.md');

  // Get detailed breakdown for top package
  const topPackage = metrics.sort((a, b) => b.lastWeek - a.lastWeek)[0];
  const detailed = await collector.getDetailedDownloads(topPackage.package, 'last-month');
  
  console.log(`\nDaily breakdown for ${topPackage.package}:`);
  detailed.downloads.slice(-7).forEach(day => {
    console.log(`  ${day.day}: ${day.downloads}`);
  });
}

generateMetricsReport();
```

## CLI Usage

The metrics package can also be used as a CLI tool:

```bash
# Install globally
npm install -g @sfsec/metrics

# Generate dashboard
sfsec-metrics dashboard @sfsec/core @sfsec/security

# Generate report
sfsec-metrics report @sfsec/core --output report.md

# Get specific range
sfsec-metrics stats @sfsec/core --range last-month
```
