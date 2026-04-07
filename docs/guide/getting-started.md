# Getting Started

Welcome to SFSec SDK!

## Installation

```bash
npm install @sfsec/core @sfsec/security
```

## Quick Example

```typescript
import { StacksClient } from '@sfsec/core';
import { InputValidator, sanitizeText } from '@sfsec/security';

// Create client
const client = new StacksClient({
  baseUrl: 'https://api.mainnet.hiro.so',
});

// Validate address
if (!InputValidator.isPrincipal(address)) {
  throw new Error('Invalid address');
}

// Sanitize input
const clean = sanitizeText(userInput);

// Query blockchain
const balance = await client.getSTXBalance(address);
```

## Next Steps

- Explore the [API Reference](/api/overview)
- Check out [Examples](https://github.com/Mosas2000/SF-SDK/tree/main/examples)
