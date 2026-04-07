# @sfsec/metrics

NPM download metrics and analytics for SFSec SDK packages. Track download statistics, generate reports, and visualize package adoption.

## Features

- ✅ **Download Statistics**: Fetch NPM download data for any package
- ✅ **Time Ranges**: Support for last-day, last-week, last-month, last-year
- ✅ **Batch Queries**: Fetch metrics for multiple packages simultaneously
- ✅ **Report Generation**: Generate markdown reports with download statistics
- ✅ **Dashboard**: CLI dashboard for visualizing package metrics
- ✅ **Type-Safe**: Full TypeScript support

## Installation

```bash
npm install @sfsec/metrics
```

## Quick Start

```typescript
import { MetricsCollector } from '@sfsec/metrics';

// Create collector instance
const collector = new MetricsCollector();

// Fetch download stats for a package
const stats = await collector.getDownloads('@sfsec/core', 'last-week');

console.log(`Total downloads: ${stats.downloads}`);
console.log(`Period: ${stats.start} to ${stats.end}`);
```

## Documentation

Full API documentation coming soon.

## License

MIT © SFSec

## Related Packages

- [@sfsec/core](../core) - Core SDK types and utilities
- [@sfsec/security](../security) - Security validation and sanitization
- [@sfsec/contracts](../contracts) - Smart contract interaction utilities
