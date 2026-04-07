import { describe, it, expect } from 'vitest';
import { generateDashboard } from '../src/dashboard';
import type { PackageMetrics } from '../src/types';

describe('generateDashboard', () => {
  const mockMetrics: PackageMetrics[] = [
    {
      package: '@sfsec/core',
      lastDay: 100,
      lastWeek: 750,
      lastMonth: 3200,
      lastYear: 38000,
      fetchedAt: '2026-04-07T08:00:00.000Z',
    },
    {
      package: '@sfsec/security',
      lastDay: 80,
      lastWeek: 600,
      lastMonth: 2500,
      lastYear: 30000,
      fetchedAt: '2026-04-07T08:00:00.000Z',
    },
  ];

  it('should generate a basic dashboard', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    expect(dashboard).toContain('NPM Download Metrics');
    expect(dashboard).toContain('@sfsec/core');
    expect(dashboard).toContain('@sfsec/security');
    expect(dashboard).toContain('Total');
  });

  it('should include custom title', () => {
    const dashboard = generateDashboard(mockMetrics, {
      title: 'Custom Title',
      useColors: false,
    });

    expect(dashboard).toContain('Custom Title');
    expect(dashboard).not.toContain('NPM Download Metrics');
  });

  it('should format numbers with commas', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    expect(dashboard).toContain('3,200');
    expect(dashboard).toContain('38,000');
    expect(dashboard).toContain('30,000');
  });

  it('should calculate totals correctly', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    expect(dashboard).toContain('180'); // 100 + 80
    expect(dashboard).toContain('1,350'); // 750 + 600
    expect(dashboard).toContain('5,700'); // 3200 + 2500
    expect(dashboard).toContain('68,000'); // 38000 + 30000
  });

  it('should include percentages when enabled', () => {
    const dashboard = generateDashboard(mockMetrics, {
      showPercentages: true,
      useColors: false,
    });

    expect(dashboard).toContain('%');
  });

  it('should hide percentages when disabled', () => {
    const dashboard = generateDashboard(mockMetrics, {
      showPercentages: false,
      useColors: false,
    });

    expect(dashboard).not.toContain('%');
  });

  it('should handle empty metrics array', () => {
    const dashboard = generateDashboard([], { useColors: false });

    expect(dashboard).toContain('No metrics available');
  });

  it('should include timestamp in footer', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    expect(dashboard).toContain('Updated:');
  });

  it('should use ANSI color codes when enabled', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: true });

    // Should contain ANSI escape codes
    expect(dashboard).toMatch(/\x1b\[\d+m/);
  });

  it('should not use ANSI color codes when disabled', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    // Should not contain ANSI escape codes
    expect(dashboard).not.toMatch(/\x1b\[\d+m/);
  });

  it('should handle single package', () => {
    const singleMetric = [mockMetrics[0]];
    const dashboard = generateDashboard(singleMetric, { useColors: false });

    expect(dashboard).toContain('@sfsec/core');
    expect(dashboard).not.toContain('@sfsec/security');
    expect(dashboard).toContain('Total');
  });

  it('should align columns properly', () => {
    const dashboard = generateDashboard(mockMetrics, { useColors: false });

    // Dashboard should have consistent column alignment
    const lines = dashboard.split('\n');
    const dataLines = lines.filter(line => line.includes('@sfsec'));

    // All data lines should have similar structure
    expect(dataLines.length).toBe(2);
    dataLines.forEach(line => {
      expect(line.trim().length).toBeGreaterThan(50);
    });
  });
});
