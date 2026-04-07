/**
 * NPM download statistics types and interfaces
 */

export type TimeRange = 'last-day' | 'last-week' | 'last-month' | 'last-year';

export interface DownloadStats {
  /** Package name */
  package: string;
  /** Total downloads in period */
  downloads: number;
  /** Start date of period (YYYY-MM-DD) */
  start: string;
  /** End date of period (YYYY-MM-DD) */
  end: string;
}

export interface DailyDownloads {
  /** Downloads for the day */
  downloads: number;
  /** Date (YYYY-MM-DD) */
  day: string;
}

export interface DetailedStats extends DownloadStats {
  /** Daily breakdown of downloads */
  downloads_per_day?: DailyDownloads[];
}

export interface PackageMetrics {
  /** Package name */
  package: string;
  /** Downloads in last day */
  lastDay: number;
  /** Downloads in last week */
  lastWeek: number;
  /** Downloads in last month */
  lastMonth: number;
  /** Downloads in last year */
  lastYear: number;
  /** When metrics were fetched */
  fetchedAt: string;
}

export interface NPMApiResponse {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface NPMApiDetailedResponse {
  downloads: DailyDownloads[] | number;
  start: string;
  end: string;
  package: string;
}
