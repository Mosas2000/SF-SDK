# @sfsec/core

Core SDK functionality for SFSec platform, providing comprehensive type definitions, configuration, and utilities for Stacks blockchain development.

## Features

- ✅ **Type Definitions**: Complete TypeScript types for contracts, proposals, voting, and staking
- ✅ **Contract Types**: Raw on-chain data structures and Clarity value wrappers
- ✅ **Domain Types**: Application-ready proposal, vote, and stake models
- ✅ **Error Handling**: Structured error types with type guards
- ✅ **Type-Safe**: Full TypeScript support with strict checking
- ✅ **Zero Dependencies**: Pure type definitions with minimal runtime code

## Installation

```bash
npm install @sfsec/core
```

## Quick Start

```typescript
import { 
  Proposal, 
  StakeInfo,
  VoteRecord,
  CONTRACT_ERROR_CODES,
  isErrorWithMessage 
} from '@sfsec/core';

// Use type-safe proposal data
const proposal: Proposal = {
  id: 1,
  proposer: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
  amount: 1000_000_000, // 1000 STX in microSTX
  title: 'Fund Development',
  description: 'Proposal to fund new features',
  votesFor: 500,
  votesAgainst: 100,
  executed: false,
  createdAt: 12345, // block height
};

// Type-safe stake information
const stake: StakeInfo = {
  address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
  amount: 10_000_000, // 10 STX minimum
};

// Handle contract errors
try {
  // contract call
} catch (error) {
  if (isErrorWithMessage(error)) {
    console.error('Contract error:', error.message);
  }
}
```

## API Documentation

### Contract Types

#### Clarity Value Wrappers

```typescript
import { ClarityValue, ClarityWrappedValue } from '@sfsec/core';

// Handle both wrapped and unwrapped values
type Amount = ClarityValue<number>; // number | { value: number }
```

#### Raw Contract Data

```typescript
import { RawProposal, RawStake, RawVote } from '@sfsec/core';

// Raw proposal from on-chain storage
const rawProposal: RawProposal = {
  proposer: { value: 'SP...' },
  amount: { value: 1000 },
  title: { value: 'Proposal' },
  description: { value: 'Description' },
  'votes-for': { value: 100 },
  'votes-against': { value: 50 },
  executed: { value: false },
  'created-at': { value: 12345 },
};
```

#### Error Handling

```typescript
import {
  CONTRACT_ERROR_CODES,
  isErrorWithMessage,
  getErrorMessage,
  isNetworkError,
  type ContractError,
  type NetworkError,
} from '@sfsec/core';

// Check error codes
console.log(CONTRACT_ERROR_CODES[100]); // 'ERR-NOT-AUTHORIZED'
console.log(CONTRACT_ERROR_CODES[102]); // 'ERR-INSUFFICIENT-STAKE'

// Type guards
if (isErrorWithMessage(error)) {
  console.error(error.message);
}

if (isNetworkError(error)) {
  console.error(`HTTP ${error.status}: ${error.statusText}`);
}

// Extract error messages safely
const message = getErrorMessage(error, 'Unknown error');
```

### Domain Types

#### Proposals

```typescript
import {
  Proposal,
  ProposalWithStats,
  CreateProposalInput,
  ProposalQueryOptions,
  type ProposalStatus,
  type ProposalSortBy,
} from '@sfsec/core';

// Create proposal
const input: CreateProposalInput = {
  title: 'Fund Development',
  description: 'Proposal description',
  amount: 1000_000_000,
};

// Query proposals
const options: ProposalQueryOptions = {
  status: 'active',
  sortBy: 'newest',
  page: 1,
  pageSize: 10,
};

// Proposal with calculated stats
const withStats: ProposalWithStats = {
  ...proposal,
  totalVotes: 600,
  forPercentage: 83.3,
  againstPercentage: 16.7,
  daysOld: 5,
  isActive: true,
};
```

#### Voting

```typescript
import {
  VoteInput,
  VoteRecord,
  UserVotingHistory,
  VotingStats,
} from '@sfsec/core';

// Submit a vote
const vote: VoteInput = {
  proposalId: 1,
  support: true,
  weight: 100,
};

// Vote record
const record: VoteRecord = {
  proposalId: 1,
  voter: 'SP...',
  support: true,
  weight: 100,
};

// User voting history
const history: UserVotingHistory = {
  address: 'SP...',
  totalVotes: 5,
  votes: [record],
};
```

#### Staking

```typescript
import {
  StakeInfo,
  StakeInput,
  MIN_STAKE_AMOUNT,
  MAX_STAKE_AMOUNT,
  isValidStakeAmount,
  calculateStakePercentage,
  isStakeInfo,
  isStakeStats,
} from '@sfsec/core';

// Minimum stake: 10 STX (10,000,000 microSTX)
console.log(MIN_STAKE_AMOUNT); // 10_000_000

// Validate stake amount
const amount = 50_000_000; // 50 STX
if (isValidStakeAmount(amount)) {
  // Proceed with staking
}

// Calculate stake percentage
const userStake = 100_000_000; // 100 STX
const totalStaked = 1_000_000_000; // 1000 STX
const percentage = calculateStakePercentage(userStake, totalStaked);
console.log(percentage); // 10

// Type guards
const stake: unknown = fetchFromContract();
if (isStakeInfo(stake)) {
  // TypeScript knows stake is StakeInfo
  console.log(stake.amount);
}
```

### API Response Types

```typescript
import {
  ApiResponse,
  ApiSuccess,
  ApiError,
  ProposalCountResponse,
  ProposalResponse,
  StakeResponse,
} from '@sfsec/core';

// Generic API response
type Response = ApiResponse<Proposal>;

// Success response
const success: ApiSuccess<number> = {
  success: true,
  data: 42,
  timestamp: Date.now(),
};

// Error response
const error: ApiError = {
  success: false,
  error: {
    message: 'Proposal not found',
    code: 101,
  },
  timestamp: Date.now(),
};
```

### Transaction Types

```typescript
import {
  TxCallbacks,
  TxFinishData,
  ContractCallOptions,
} from '@sfsec/core';

// Transaction callbacks
const callbacks: TxCallbacks = {
  onFinish: (txId: string) => {
    console.log('Transaction completed:', txId);
  },
  onCancel: () => {
    console.log('Transaction cancelled');
  },
};

// Contract call options
const options: ContractCallOptions = {
  functionName: 'stake',
  functionArgs: [amount],
  cb: callbacks,
};
```

## Type Safety Examples

### Working with Clarity Values

```typescript
import { unwrapClarityValue } from '@sfsec/security';
import { RawProposal } from '@sfsec/core';

const rawProposal: RawProposal = fetchFromContract();

// Safely unwrap values
const amount = unwrapClarityValue(rawProposal.amount); // number
const title = unwrapClarityValue(rawProposal.title); // string
```

### Error Handling Pattern

```typescript
import { getErrorMessage, CONTRACT_ERROR_CODES } from '@sfsec/core';

async function submitProposal(input: CreateProposalInput) {
  try {
    const result = await contractCall();
    return { success: true, data: result };
  } catch (error) {
    const message = getErrorMessage(error);
    return {
      success: false,
      error: message,
      code: CONTRACT_ERROR_CODES[101], // Optional: map to error code
    };
  }
}
```

### Query Pattern

```typescript
import { ProposalQueryOptions, Proposal } from '@sfsec/core';

async function getProposals(
  options: ProposalQueryOptions = {}
): Promise<Proposal[]> {
  const {
    status = 'all',
    sortBy = 'newest',
    page = 1,
    pageSize = 10,
  } = options;

  // Fetch and return proposals
  return fetchProposalsFromAPI({ status, sortBy, page, pageSize });
}
```

## Best Practices

1. **Use Type Guards**
   ```typescript
   if (isStakeInfo(data)) {
     // TypeScript knows data is StakeInfo
   }
   ```

2. **Handle Clarity Values**
   ```typescript
   import { unwrapClarityValue } from '@sfsec/security';
   const value = unwrapClarityValue(clarityValue);
   ```

3. **Structured Error Handling**
   ```typescript
   if (isNetworkError(error)) {
     // Handle network errors
   } else if (isErrorWithMessage(error)) {
     // Handle other errors
   }
   ```

4. **Validate Amounts**
   ```typescript
   if (isValidStakeAmount(amount)) {
     // Proceed with staking
   }
   ```

## Integration with @sfsec/security

The core package works seamlessly with the security package:

```typescript
import { validateTitle, sanitizeText } from '@sfsec/security';
import { CreateProposalInput } from '@sfsec/core';

function createProposal(title: string, description: string, amount: number) {
  // Validate with security package
  const titleResult = validateTitle(title);
  if (!titleResult.success) {
    throw new Error(titleResult.error);
  }

  // Sanitize user input
  const safeDes = sanitizeText(description);

  // Create typed input
  const input: CreateProposalInput = {
    title: titleResult.value,
    description: safeDescription,
    amount,
  };

  return input;
}
```

## TypeScript Configuration

For best results, use strict TypeScript settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true
  }
}
```

## Contributing

Issues and pull requests welcome! See the main [SFSec-SDK repository](https://github.com/Mosas2000/SF-SDK).

## License

MIT © SFSec
