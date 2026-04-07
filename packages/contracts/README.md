# @sfsec/contracts

Smart contract interaction utilities for the SFSec SDK, providing type-safe methods for interacting with Stacks blockchain smart contracts.

## Features

-  **Contract Interactions**: Type-safe methods for proposals, voting, and staking
-  **Transaction Building**: Helper utilities for building and signing transactions
-  **Response Handling**: Automatic parsing and validation of contract responses
-  **Error Handling**: Structured error handling with detailed messages
-  **Type-Safe**: Full TypeScript support with strict types

## Installation

```bash
npm install @sfsec/contracts
```

## Quick Start

```typescript
import { ProposalContract } from '@sfsec/contracts';

// Initialize contract client
const proposalContract = new ProposalContract({
  contractAddress: 'SP...',
  contractName: 'proposal-contract',
});

// Create a proposal
const result = await proposalContract.createProposal({
  title: 'Fund Development',
  description: 'Proposal to fund new features',
  amount: 1000_000_000,
});

console.log('Transaction ID:', result.txId);
```

## Documentation

Full API documentation coming soon.

## License

 SFSecMIT 
