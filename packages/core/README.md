# @sfsec/core

Core SDK functionality for SFSec platform, providing type definitions, configuration, and utilities for Stacks blockchain development.

## Features

- ✅ **Type Definitions**: Comprehensive types for contracts, proposals, voting, and staking
- ✅ **Network Configuration**: Network setup and contract deployment info
- ✅ **Error Handling**: Async error handling utilities
- ✅ **HTTP Client**: Retry logic and robust fetch utilities
- ✅ **Type-Safe**: Full TypeScript support with strict typing

## Installation

```bash
npm install @sfsec/core
```

## Quick Start

```typescript
import { ProposalStatus, getNetworkConfig } from '@sfsec/core';

// Use type definitions
const status: ProposalStatus = 'active';

// Get network configuration
const config = getNetworkConfig('mainnet');
console.log(config.network.url);
```

## License

MIT © SFSec
