# @sfsec/core API Reference

Core Stacks blockchain client with API access, caching, and rate limiting.

## Installation

```bash
npm install @sfsec/core
```

## StacksClient

High-level client for Stacks blockchain interactions.

### Constructor

```typescript
import { StacksClient } from '@sfsec/core';

const client = new StacksClient({
  baseUrl: 'https://api.mainnet.hiro.so',
  timeout: 30000,
  enableCache: true,
  cacheTTL: 60000,
  maxConcurrentRequests: 10,
});
```

### Methods

#### `callReadOnly<T>(config): Promise<ContractReadResult<T>>`

Call a read-only contract function.

```typescript
const result = await client.callReadOnly({
  contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  contractName: 'my-contract',
  functionName: 'get-balance',
  functionArgs: [],
});

if (result.success) {
  console.log('Balance:', result.data);
}
```

#### `getTransaction(txId): Promise<ApiResponse<TransactionDetails>>`

Get transaction details by ID.

```typescript
const tx = await client.getTransaction('0xabc123...');
if (tx.success) {
  console.log('Status:', tx.data.tx_status);
}
```

#### `getTransactionStatus(txId): Promise<TransactionStatus>`

Get normalized transaction status.

```typescript
const status = await client.getTransactionStatus('0xabc123...');
// Returns: 'success' | 'pending' | 'failed' | 'abort_by_response' | 'abort_by_post_condition' | 'unknown'
```

#### `getBlockHeight(): Promise<ApiResponse<number>>`

Get current block height.

```typescript
const height = await client.getBlockHeight();
if (height.success) {
  console.log('Current block:', height.data);
}
```

#### `getAccountBalance(address): Promise<ApiResponse<AccountBalance>>`

Get account balance information.

```typescript
const balance = await client.getAccountBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
if (balance.success) {
  console.log('STX Balance:', balance.data.stx.balance);
}
```

#### `getSTXBalance(address): Promise<ApiResponse<bigint>>`

Get STX balance as bigint.

```typescript
const balance = await client.getSTXBalance('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
if (balance.success) {
  const stx = client.microSTXToSTX(balance.data);
  console.log(`${stx} STX`);
}
```

#### `waitForTransaction(txId, options): Promise<{status, attempts}>`

Wait for transaction to reach terminal state.

```typescript
const result = await client.waitForTransaction('0xabc123...', {
  intervalMs: 10000,
  maxAttempts: 60,
  onPoll: (attempts) => console.log(`Polling... attempt ${attempts}`),
});

console.log(`Transaction ${result.status} after ${result.attempts} attempts`);
```

### Utility Methods

#### `microSTXToSTX(microSTX): number`

Convert microSTX to STX.

```typescript
client.microSTXToSTX(1_000_000); // 1
```

#### `STXToMicroSTX(stx): bigint`

Convert STX to microSTX.

```typescript
client.STXToMicroSTX(10); // 10_000_000n
```

#### `clearCache(): void`

Clear the API response cache.

```typescript
client.clearCache();
```

#### `invalidateCache(pattern): void`

Invalidate specific cache entries.

```typescript
client.invalidateCache('tx:0xabc123');
```

## StacksApiClient

Lower-level API client (used internally by StacksClient).

```typescript
import { StacksApiClient } from '@sfsec/core';

const apiClient = new StacksApiClient({
  baseUrl: 'https://api.testnet.hiro.so',
  timeout: 30000,
  cacheTTL: 60000,
});
```

## Pre-configured Clients

```typescript
import { stacksMainnet, stacksTestnet } from '@sfsec/core';

// Use pre-configured mainnet client
const balance = await stacksMainnet.getSTXBalance(address);

// Use pre-configured testnet client
const txStatus = await stacksTestnet.getTransactionStatus(txId);
```

## Types

### ContractCallConfig

```typescript
interface ContractCallConfig {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
  sender?: string;
}
```

### ApiResponse<T>

```typescript
type ApiResponse<T> = 
  | { success: true; data: T; timestamp: number }
  | { success: false; error: { message: string }; timestamp: number };
```

### TransactionStatus

```typescript
type TransactionStatus = 
  | 'success' 
  | 'pending' 
  | 'failed' 
  | 'abort_by_response' 
  | 'abort_by_post_condition' 
  | 'unknown';
```

## Example: Complete Workflow

```typescript
import { StacksClient } from '@sfsec/core';
import { InputValidator } from '@sfsec/security';

const client = new StacksClient();

async function checkBalanceAndCall(address: string) {
  // Validate address
  if (!InputValidator.isPrincipal(address)) {
    throw new Error('Invalid address');
  }

  // Get balance
  const balanceResult = await client.getSTXBalance(address);
  if (!balanceResult.success) {
    throw new Error('Failed to fetch balance');
  }

  const stxBalance = client.microSTXToSTX(balanceResult.data);
  console.log(`Balance: ${stxBalance} STX`);

  // Call contract
  const contractResult = await client.callReadOnly({
    contractAddress: address,
    contractName: 'my-contract',
    functionName: 'get-value',
    functionArgs: [],
  });

  if (contractResult.success) {
    console.log('Contract value:', contractResult.data);
  }

  return { balance: stxBalance, contractData: contractResult.data };
}
```
