# @sfsec/contracts

Smart contract interaction utilities for the SFSec SDK, providing type-safe methods for interacting with Stacks blockchain smart contracts.

## Features

-  **Contract Response Handling**: Safe extraction and validation of contract data
-  **Transaction Building**: Type-safe transaction construction with validation
-  **Data Conversion**: Utilities for STX/microSTX conversion and formatting
-  **Transaction Polling**: Configurable polling with exponential backoff
-  **Error Recovery**: Intelligent retry logic and error classification
-  **Type-Safe**: Full TypeScript support with strict types
-  **Framework-Agnostic**: No React or Next.js dependencies

## Installation

```bash
npm install @sfsec/contracts
```

## Quick Start

### Transaction Polling

```typescript
import { pollTxStatus } from '@sfsec/contracts';

// Poll transaction status with callbacks
const result = await pollTxStatus(
  '0xabc123...',
  async (txId) => {
    const response = await fetch(`https://api.hiro.so/extended/v1/tx/${txId}`);
    const data = await response.json();
    return data.tx_status;
  },
  {
    intervalMs: 10_000,
    maxAttempts: 60,
    useExponentialBackoff: true,
  },
  {
    onSuccess: (txId) => console.log('Transaction confirmed!', txId),
    onFailure: (txId, reason) => console.error('Transaction failed:', reason),
    onTimeout: (txId) => console.warn('Polling timed out'),
  }
);

console.log('Final status:', result.status);
console.log('Attempts:', result.attempts);
```

### Contract Response Handling

```typescript
import { ContractResponseHandler } from '@sfsec/contracts';

// Extract proposal count safely
const count = ContractResponseHandler.extractProposalCount(response);

// Validate proposal structure
if (ContractResponseHandler.isValidProposalResponse(data)) {
  // data is typed as ProposalResponse
  console.log('Valid proposal:', data.title);
}

// Extract stake amount with null safety
const stakeAmount = ContractResponseHandler.extractStakeAmount(stakeData);
```

### Transaction Building

```typescript
import { TransactionBuilder } from '@sfsec/contracts';

// Validate and build transaction parameters
const stakeAmount = TransactionBuilder.buildStakeAmount(1000);
const title = TransactionBuilder.buildProposalTitle('  My Proposal  ');
const description = TransactionBuilder.buildProposalDescription('A detailed description...');

// All values are validated and sanitized
```

### STX Conversions

```typescript
import { ContractConverter } from '@sfsec/contracts';

// Convert between STX and microSTX
const stx = ContractConverter.microSTXToSTX(1_000_000); // 1
const microSTX = ContractConverter.STXToMicroSTX(5.5); // 5_500_000

// Format proposal IDs
const formatted = ContractConverter.formatProposalId(42); // "#42"

// Calculate voting power
const power = ContractConverter.calculateVotingPower(50, 200); // 25%

// Get proposal status
const status = ContractConverter.getProposalStatus(100, 50, false); // "passing"
```

### Error Recovery

```typescript
import { ErrorRecovery } from '@sfsec/contracts';

try {
  await contractCall();
} catch (error) {
  if (ErrorRecovery.isRetryable(error)) {
    const delay = ErrorRecovery.getRetryDelay(attemptNumber);
    await new Promise(resolve => setTimeout(resolve, delay));
    // Retry the operation
  } else if (ErrorRecovery.isAuthError(error)) {
    // Handle authentication error
    console.error('Please connect your wallet');
  } else {
    // Non-retryable error
    throw error;
  }
}
```

## API Reference

### Transaction Polling

#### `pollTxStatus(txId, fetcher, config?, callbacks?): Promise<PollResult>`

Poll transaction status until terminal state is reached.

**Parameters:**
- `txId` (string): Transaction ID to poll
- `fetcher` (TxStatusFetcher): Function to fetch transaction status
- `config` (PollConfig, optional): Polling configuration
  - `intervalMs`: Polling interval in milliseconds (default: 10000)
  - `maxAttempts`: Maximum number of attempts (default: 60)
  - `initialDelayMs`: Initial delay before first poll (default: 10000)
  - `useExponentialBackoff`: Use exponential backoff (default: false)
- `callbacks` (PollCallbacks, optional): Status callbacks
  - `onSuccess`: Called when transaction succeeds
  - `onFailure`: Called when transaction fails
  - `onTimeout`: Called when polling times out
  - `onStatusChange`: Called when status changes
  - `onPoll`: Called on each poll attempt

**Returns:** `Promise<PollResult>`
- `status`: Final transaction status
- `attempts`: Number of polling attempts made
- `timedOut`: Whether polling timed out
- `error`: Error message if applicable

#### `pollTxStatusAsync(txId, fetcher, config?, callbacks?): void`

Fire-and-forget version that runs polling in background without blocking.

### ContractResponseHandler

#### `extractProposalCount(response): number`
Extract proposal count from contract response, returns 0 if invalid.

#### `extractStakeAmount(response): number`
Extract stake amount from contract response, returns 0 if invalid.

#### `extractMinStakeAmount(response): number`
Extract minimum stake amount, returns default (10 STX) if invalid.

#### `isValidProposalResponse(response): response is ProposalResponse`
Type guard to check if response has valid proposal structure.

#### `isValidStakeResponse(response): response is StakeResponse`
Type guard to check if response has valid stake structure.

### TransactionBuilder

#### `buildStakeAmount(amount): number`
Validate and floor stake amount. Throws if 0, NaN, Infinity).invalid (

#### `buildProposalAmount(amount): number`
Validate and floor proposal amount. Throws if invalid.

#### `buildProposalTitle(title): string`
Validate and trim title. Throws if not 3-200 characters.

#### `buildProposalDescription(description): string`
Validate and trim description. Throws if not 10-2000 characters.

#### `buildVoteWeight(weight): number`
Validate and floor vote weight. Throws if invalid.

### ContractConverter

#### `microSTXToSTX(microSTX): number`
Convert microSTX to STX (divide by 1,000,000).

#### `STXToMicroSTX(stx): number`
Convert STX to microSTX (multiply by 1,000,000 and floor).

#### `formatProposalId(id): string`
Format proposal ID with # prefix (e.g., "#42").

#### `calculateVotingPower(userVotes, totalVotes): number`
Calculate voting power as percentage (0-100).

#### `getProposalStatus(votesFor, votesAgainst, executed): 'passing' | 'failing' | 'executed'`
Determine proposal status based on votes and execution state.

### ErrorRecovery

#### `isRetryable(error): boolean`
Check if error is retryable (network errors, timeouts, etc.).

#### `getRetryDelay(attemptNumber): number`
Calculate exponential backoff delay with jitter (capped at 2^5).

#### `isAuthError(error): boolean`
Check if error is authentication-related.

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build package
npm run build
```

## Dependencies

- `@sfsec/core` - Core types and utilities
- `@sfsec/security` - Security utilities

## License

 SFSecMIT 

## Related Packages

- [@sfsec/core](../core) - Core SDK types and utilities
- [@sfsec/security](../security) - Security validation and sanitization
- [@sfsec/metrics](../metrics) - NPM download metrics
