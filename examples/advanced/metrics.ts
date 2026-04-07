/**
 * Advanced Example: Package Metrics and Analytics
 * 
 * This example demonstrates NPM download tracking and reporting
 */

import {
  MetricsCollector,
  generateDashboard,
  generateReport,
} from '@sfsec/metrics';

// Example 1: Fetch Package Download Statistics
async function fetchPackageStats(): Promise<void> {
  console.log('\n=== Example 1: Fetch Download Statistics ===');
  
  const collector = new MetricsCollector();
  
  try {
    const stats = await collector.getDownloads('@sfsec/core', 'last-week');
    console.log(`Package: ${stats.package}`);
    console.log(`Downloads: ${stats.downloads}`);
    console.log(`Period: ${stats.start} to ${stats.end}`);
  } catch (error) {
    console.error('Failed to fetch stats:', error.message);
  }
}

// Example 2: Get Comprehensive Metrics
async function getComprehensiveMetrics(): Promise<void> {
  console.log('\n=== Example 2: Comprehensive Package Metrics ===');
  
  const collector = new MetricsCollector();
  
  try {
    const metrics = await collector.getPackageMetrics('@sfsec/core');
    console.log(`Package: ${metrics.package}`);
    console.log(`Last day: ${metrics.lastDay}`);
    console.log(`Last week: ${metrics.lastWeek}`);
    console.log(`Last month: ${metrics.lastMonth}`);
    console.log(`Last year: ${metrics.lastYear}`);
  } catch (error) {
    console.error('Failed to fetch metrics:', error.message);
  }
}

// Example 3: Batch Metrics for Multiple Packages
async function batchMetrics(): Promise<void> {
  console.log('\n=== Example 3: Batch Package Metrics ===');
  
  const collector = new MetricsCollector();
  const packages = [
    '@sfsec/core',
    '@sfsec/security',
    '@sfsec/contracts',
    '@sfsec/metrics',
  ];
  
  try {
    const metrics = await collector.getBatchMetrics(packages);
    
    metrics.forEach(m => {
      console.log(`\n${m.package}:`);
      console.log(`  Week: ${m.lastWeek}`);
      console.log(`  Month: ${m.lastMonth}`);
    });
  } catch (error) {
    console.error('Failed to fetch batch metrics:', error.message);
  }
}

// Example 4: Generate CLI Dashboard
async function createDashboard(): Promise<void> {
  console.log('\n=== Example 4: Generate CLI Dashboard ===');
  
  const collector = new MetricsCollector();
  
  try {
    const metrics = await collector.getBatchMetrics([
      '@sfsec/core',
      '@sfsec/security',
    ]);
    
    const dashboard = generateDashboard(metrics, {
      title: 'SFSec Package Downloads',
      useColors: false, // Disable colors for this example
      showPercentages: true,
    });
    
    console.log(dashboard);
  } catch (error) {
    console.error('Failed to generate dashboard:', error.message);
  }
}

// Example 5: Generate Markdown Report
async function createReport(): Promise<void> {
  console.log('\n=== Example 5: Generate Markdown Report ===');
  
  const collector = new MetricsCollector();
  
  try {
    const metrics = await collector.getBatchMetrics(['@sfsec/core']);
    
    const report = generateReport(metrics, {
      title: 'Weekly Download Report',
      includeTrends: true,
    });
    
    console.log(report.substring(0, 500) + '...\n[Truncated]');
  } catch (error) {
    console.error('Failed to generate report:', error.message);
  }
}

// Run examples
(async () => {
  console.log('🚀 Running Metrics Examples...\n');
  
  await fetchPackageStats();
  await getComprehensiveMetrics();
  await batchMetrics();
  await createDashboard();
  await createReport();
})();
