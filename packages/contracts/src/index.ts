/**
 * @sfsec/contracts - Smart contract interaction utilities
 * 
 * Provides type-safe methods for interacting with Stacks blockchain
 * smart contracts, including proposals, voting, and staking.
 */

// Export contract helpers
export {
  ContractResponseHandler,
  TransactionBuilder,
  ContractConverter,
  ErrorRecovery,
} from './helpers';

// Export transaction polling
export {
  pollTxStatus,
  pollTxStatusAsync,
  type PollConfig,
  type PollCallbacks,
  type PollResult,
  type TxStatus,
  type TxStatusFetcher,
} from './poll-tx';

export const version = '0.1.0';
