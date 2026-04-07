# @sfsec/contracts API Reference

Contract interaction helpers and transaction polling utilities.

## Installation

```bash
npm install @sfsec/contracts
```

## ContractResponseHandler

Safe extraction of data from contract responses.

### Methods

#### `extractProposalCount(response): number`

Extract proposal count from read-only response.

```typescript
import { ContractResponseHandler } from '@sfsec/contracts';

const count = ContractResponseHandler.extractProposalCount(response);
```

#### `extractStakeAmount(response): number`

Extract stake amount from contract response.

```typescript
const amount = ContractResponseHandler.extractStakeAmount(stakeResponse);
```

## TransactionBuilder

Build validated transaction parameters.

### Methods

#### `buildStakeAmount(stx: number): number`

Convert STX to microSTX with validation.

```typescript
import { TransactionBuilder } from '@sfsec/contracts';

const microSTX = TransactionBuilder.buildStakeAmount(10.5);
// Returns: 10_500_000
```

#### `buildProposalTitle(title: string): string`

Validate and trim proposal title.

```typescript
const validTitle = TransactionBuilder.buildProposalTitle('  My Title  ');
// Validates length and trims whitespace
```

#### `buildProposalDescription(desc: string): string`

Validate proposal description.

```typescript
const validDesc = TransactionBuilder.buildProposalDescription(description);
```

#### `buildComment(comment: string): string`

Validate comment text.

```typescript
const validComment = TransactionBuilder.buildComment(userComment);
```

## ContractConverter

Conversion and calculation utilities.

### Methods

#### `STXToMicroSTX(stx: number): number`

Convert STX to microSTX.

```typescript
import { ContractConverter } from '@sfsec/contracts';

ContractConverter.STXToMicroSTX(1); // 1_000_000
ContractConverter.STXToMicroSTX(10.5); // 10_500_000
```

#### `microSTXToSTX(microSTX: number): number`

Convert microSTX to STX.

```typescript
ContractConverter.microSTXToSTX(1_000_000); // 1
ContractConverter.microSTXToSTX(10_500_000); // 10.5
```

#### `calculateVotingPower(userVotes, totalVotes): number`

Calculate voting power percentage.

```typescript
const power = ContractConverter.calculateVotingPower(50, 200);
// Returns: 25 (percent)
```

#### `getProposalStatus(votesFor, votesAgainst, executed): ProposalStatus`

Determine proposal status.

```typescript
const status = ContractConverter.getProposalStatus(120, 80, false);
// Returns: 'approved' | 'rejected' | 'executed' | 'pending'
```

## Transaction Polling

### `pollTxStatus`

Poll transaction status with configurable intervals and callbacks.

```typescript
import { pollTxStatus } from '@sfsec/contracts';

const result = await pollTxStatus(
  txId,
  async (id) => {
    // Fetch status from API
    const response = await fetch(`https://api.hiro.so/extended/v1/tx/${id}`);
    const data = await response.json();
    return data.tx_status;
  },
  {
    initialDelayMs: 10000,
    intervalMs: 15000,
    maxAttempts: 60,
    useExponentialBackoff: true,
  },
  {
    onPoll: (id, attempts) => console.log(`Polling ${id} (attempt ${attempts})`),
    onSuccess: (id) => console.log(`Transaction ${id} succeeded`),
    onFailure: (id, reason) => console.error(`Transaction failed: ${reason}`),
    onTimeout: (id) => console.warn(`Transaction ${id} timed out`),
  }
);

console.log(`Final status: ${result.status}`);
```

### Config Options

```typescript
interface PollTxConfig {
  initialDelayMs?: number;  // Initial delay (default: 10000)
  intervalMs?: number;       // Poll interval (default: 15000)
  maxAttempts?: number;      // Max attempts (default: 60)
  useExponentialBackoff?: boolean;  // Enable backoff (default: false)
}
```

### Callbacks

```typescript
interface PollTxCallbacks {
  onPoll?: (txId: string, attempts: number) => void;
  onStatusChange?: (txId: string, oldStatus: string, newStatus: string) => void;
  onSuccess?: (txId: string) => void;
  onFailure?: (txId: string, reason: string) => void;
  onTimeout?: (txId: string) => void;
}
```

## ErrorRecovery

Error handling and retry utilities.

### Methods

#### `isRetryable(error): boolean`

Check if an error is retryable.

```typescript
import { ErrorRecovery } from '@sfsec/contracts';

if (ErrorRecovery.isRetryable(error)) {
  // Retry the operation
}
```

#### `getRetryDelay(attempt, baseDelay, maxDelay): number`

Calculate retry delay with exponential backoff.

```typescript
const delay = ErrorRecovery.getRetryDelay(
  3,      // attempt number
  1000,   // base delay (ms)
  60000   // max delay (ms)
);
```

## Example: Complete Contract Interaction

```typescript
import { 
  TransactionBuilder, 
  ContractConverter,
  pollTxStatus 
} from '@sfsec/contracts';
import { StacksClient } from '@sfsec/core';

async function createAndMonitorProposal(
  title: string,
  description: string,
  amountSTX: number
) {
  // Build validated parameters
  const validTitle = TransactionBuilder.buildProposalTitle(title);
  const validDesc = TransactionBuilder.buildProposalDescription(description);
  const amountMicroSTX = TransactionBuilder.buildStakeAmount(amountSTX);

  console.log(`Creating proposal: ${validTitle}`);
  console.log(`Amount: ${ContractConverter.microSTXToSTX(amountMicroSTX)} STX`);

  // ... submit transaction and get txId ...
  const txId = '0xabc123...';

  // Monitor transaction
  const client = new StacksClient();
  const result = await pollTxStatus(
    txId,
    async (id) => await client.getTransactionStatus(id),
    { intervalMs: 10000, maxAttempts: 30 },
    {
      onPoll: (_, attempts) => console.log(`Checking... (${attempts})`),
      onSuccess: () => console.log('Proposal created!'),
      onFailure: (_, reason) => console.error(`Failed: ${reason}`),
    }
  );

  return result;
}
```
