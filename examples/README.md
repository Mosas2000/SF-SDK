# SFSec SDK Examples

This directory contains practical examples demonstrating how to use the SFSec SDK packages.

## Directory Structure

```
examples/
 basic/              # Basic usage examples
 validation.ts   # Input validation and sanitization   
 advanced/           # Advanced usage examples
 contracts.ts    # Contract interactions and polling   
 metrics.ts      # NPM metrics and analytics   
 security/           # Security-focused examples
 complete-workflow.ts  # Complete security workflow    
```

## Running Examples

### Prerequisites

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

### Run Examples

```bash
# Basic validation example
npx tsx examples/basic/validation.ts

# Advanced contract interactions
npx tsx examples/advanced/contracts.ts

# Advanced metrics tracking
npx tsx examples/advanced/metrics.ts

# Complete security workflow
npx tsx examples/security/complete-workflow.ts
```

## Examples Overview

### Basic Examples

#### `validation.ts`
Demonstrates fundamental security features:
- Stacks address validation
- Input sanitization (XSS prevention)
- Amount validation
- Content validation (title, description, comments)
- URL sanitization

### Advanced Examples

#### `contracts.ts`
Shows smart contract interaction patterns:
- Safe contract data extraction
- Transaction parameter building
- STX/microSTX conversions
- Voting power calculations
- Transaction polling with callbacks

#### `metrics.ts`
Demonstrates NPM analytics features:
- Fetching package download statistics
- Comprehensive metrics across time ranges
- Batch metrics for multiple packages
- CLI dashboard generation
- Markdown report generation

### Security Examples

#### `complete-workflow.ts`
Shows end-to-end security best practices:
- Complete proposal validation workflow
- Secure comment handling
- Safe URL processing
- Error recovery patterns
- Security checklists

## Additional Resources

- [Security Guide](../SECURITY_GUIDE.md)
- [Package Documentation](../packages/)
- [API Reference](../packages/*/README.md)
