# SFSec SDK

**Security-focused SDK for building decentralized governance applications on Stacks blockchain**

[![Test](https://github.com/Mosas2000/SF-SDK/actions/workflows/test.yml/badge.svg)](https://github.com/Mosas2000/SF-SDK/actions/workflows/test.yml)
[![Security Audit](https://github.com/Mosas2000/SF-SDK/actions/workflows/security.yml/badge.svg)](https://github.com/Mosas2000/SF-SDK/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## Overview

SFSec SDK is a modular, type-safe toolkit for building secure blockchain applications on Stacks. Extracted from the SprintFund platform, it provides battle-tested utilities for security, smart contract interactions, and analytics.

### Key Features

- - - -  **Well-Tested**: 248+ tests with comprehensive coverage
- - - 
## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@sfsec/core](./packages/core) | `0.1.0` | Core types and utilities for Stacks blockchain |
| [@sfsec/security](./packages/security) | `0.1.0` | Input validation, sanitization, and security utilities |
| [@sfsec/contracts](./packages/contracts) | `0.1.0` | Smart contract interaction and transaction polling |
| [@sfsec/metrics](./packages/metrics) | `0.1.0` | NPM download metrics and analytics |

## Quick Start

### Installation

```bash
# Install individual packages
npm install @sfsec/core @sfsec/security @sfsec/contracts

# Or install specific packages as needed
npm install @sfsec/security  # For validation and sanitization
npm install @sfsec/metrics    # For NPM analytics
```

### Basic Usage

#### Input Validation & Sanitization

```typescript
import { InputValidator, sanitizeText } from '@sfsec/security';

// Validate Stacks addresses
if (InputValidator.isPrincipal(userAddress)) {
  console.log('Valid Stacks address');
}

// Sanitize user input
const clean = sanitizeText(userInput);  // Strips HTML, XSS attempts
```

#### Smart Contract Interactions

```typescript
import { pollTxStatus, ContractConverter } from '@sfsec/contracts';

// Poll transaction status
const result = await pollTxStatus(
  txId,
  async (id) => fetchTxStatus(id),
  { maxAttempts: 60, useExponentialBackoff: true },
  {
    onSuccess: () => console.log('Transaction confirmed!'),
    onFailure: (_, reason) => console.error('Failed:', reason),
  }
);

// Convert STX amounts
const microSTX = ContractConverter.STXToMicroSTX(10);  // 10_000_000
```

#### Package Metrics

```typescript
import { MetricsCollector, generateDashboard } from '@sfsec/metrics';

const collector = new MetricsCollector();

// Get download statistics
const stats = await collector.getPackageMetrics('@sfsec/core');
console.log(`Weekly downloads: ${stats.lastWeek}`);

// Generate CLI dashboard
const metrics = await collector.getBatchMetrics([
  '@sfsec/core',
  '@sfsec/security',
  '@sfsec/contracts',
]);
console.log(generateDashboard(metrics, { title: 'Package Downloads' }));
```

## Documentation

### Package Documentation

- **[@sfsec/core](./packages/core)** - Core types for proposals, voting, and staking
- **[@sfsec/security](./packages/security)** - Validation patterns and sanitization
- **[@sfsec/contracts](./packages/contracts)** - Contract helpers and polling
- **[@sfsec/metrics](./packages/metrics)** - Analytics and reporting

### API Reference

Each package includes comprehensive API documentation:

```bash
# View package documentation
cat packages/security/README.md
cat packages/contracts/README.md
cat packages/metrics/README.md
```

## Development

### Prerequisites

- Node.js 18+ (tested on 18.x, 20.x, 22.x)
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Mosas2000/SF-SDK.git
cd SF-SDK

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Monorepo Structure

This project uses Lerna for monorepo management:

```
SFSec-SDK/
 packages/
 core/          # Core types and utilities   
 security/      # Security utilities   
 contracts/     # Contract interactions   
 metrics/       # NPM analytics   
 .github/
 workflows/     # CI/CD pipelines   
 docs/              # Documentation (coming soon)
```

### Scripts

```bash
npm run build         # Build all packages
npm test              # Run all tests
npm run lint          # Lint all packages
npm run publish       # Publish packages (requires auth)
npm run security:audit # Run security audits
```

## Security

Security is our top priority. This SDK includes:

### Built-in Security Features

-  **Input Validation**: Comprehensive validators for addresses, amounts, and content
-  **XSS Prevention**: Aggressive HTML stripping and sanitization
-  **Type Safety**: Strict TypeScript with type guards
-  **Content Limits**: Enforced limits on titles, descriptions, and comments
-  **Protocol Filtering**: Blocked dangerous protocols (javascript:, data:, vbscript:)

### Security Auditing

```bash
# Run npm audit
npm audit --workspaces

# Check for vulnerabilities
npm run security:audit
```

### Reporting Security Issues

Please report security vulnerabilities to: security@sfsec.example.com

See [SECURITY.md](./SECURITY.md) for our security policy and responsible disclosure process.

## Testing

### Test Coverage

- **248 total tests** across all packages
- **2,010 lines** of test code
- **Comprehensive coverage** of edge cases and error scenarios

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/security && npm test

# Run tests in watch mode
npm run test:watch
```

### Test Breakdown

| Package | Tests | Coverage |
|---------|-------|----------|
| @sfsec/security | 130 | Validation, sanitization, constants |
| @sfsec/core | 20 | Type guards, validators |
| @sfsec/contracts | 49 | Helpers, polling, error recovery |
| @sfsec/metrics | 49 | Collector, dashboard, reports |

## Publishing

Packages are published to NPM with automated releases:

### Publishing Workflow

1. Update package versions with Lerna
2. Create git tag (e.g., `v0.1.0`)
3. Push tag to GitHub
4. GitHub Actions automatically publishes to NPM

```bash
# Version and publish (interactive)
npm run publish

# Or manually
git tag v0.1.0
git push origin v0.1.0
```

See [PUBLISHING.md](./PUBLISHING.md) for detailed publishing instructions.

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
test(scope): add tests
chore(scope): maintenance task
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Roadmap

### Completed 

- [x] Security package with validation and sanitization
- [x] Core types and utilities
- [x] Contract interaction helpers
- [x] Transaction polling with exponential backoff
- [x] NPM metrics and analytics
- [x] Comprehensive test suite
- [x] CI/CD pipelines

### In Progress 
- [ ] Documentation site with VitePress
- [ ] API reference documentation
- [ ] Usage examples

### Planned 
- [ ] React hooks for common operations
- [ ] CLI tools for developers
- [ ] Additional Stacks chain utilities
- [ ] Performance benchmarks

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Extracted from [SprintFund](https://sprintfund.example.com) platform
- Built for the [Stacks](https://www.stacks.co/) blockchain ecosystem
- Inspired by security-first development practices

## Links

- **GitHub**: https://github.com/Mosas2000/SF-SDK
- **Documentation**: Coming soon
- **NPM Organization**: https://www.npmjs.com/org/sfsec
- **Issues**: https://github.com/Mosas2000/SF-SDK/issues
- **Discussions**: https://github.com/Mosas2000/SF-SDK/discussions

---

**Built  by SFSec** | **Powered by Stacks Blockchain**with 
