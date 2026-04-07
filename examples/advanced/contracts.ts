/**
 * Advanced Example: Contract Interactions and Transaction Polling
 * 
 * This example demonstrates contract helpers and transaction polling
 */

import {
  ContractResponseHandler,
  TransactionBuilder,
  ContractConverter,
  pollTxStatus,
} from '@sfsec/contracts';

// Example 1: Extract Contract Data Safely
function extractContractData(): void {
  console.log('\n=== Example 1: Safe Contract Data Extraction ===');
  
  // Simulate contract responses
  const proposalCountResponse = 5;
  const stakeResponse = { amount: 10_000_000 };
  
  const count = ContractResponseHandler.extractProposalCount(proposalCountResponse);
  const stake = ContractResponseHandler.extractStakeAmount(stakeResponse);
  
  console.log(`Proposal count: ${count}`);
  console.log(`Stake amount: ${stake} microSTX`);
}

extractContractData();

// Example 2: Build Safe Transaction Parameters
function buildTransactionParams(): void {
  console.log('\n=== Example 2: Transaction Parameter Building ===');
  
  try {
    const amount = TransactionBuilder.buildStakeAmount(1000.5);
    console.log(`Stake amount: ${amount} microSTX`);
    
    const title = TransactionBuilder.buildProposalTitle('  My Proposal  ');
    console.log(`Title: "${title}"`);
    
    const desc = TransactionBuilder.buildProposalDescription('This is a detailed description with enough characters to be valid');
    console.log(`Description: "${desc.substring(0, 50)}..."`);
  } catch (error) {
    console.error('Validation failed:', error.message);
  }
}

buildTransactionParams();

// Example 3: Convert Between STX and MicroSTX
function convertAmounts(): void {
  console.log('\n=== Example 3: STX Conversions ===');
  
  const stx = 10;
  const microSTX = ContractConverter.STXToMicroSTX(stx);
  console.log(`${stx} STX = ${microSTX} microSTX`);
  
  const backToSTX = ContractConverter.microSTXToSTX(microSTX);
  console.log(`${microSTX} microSTX = ${backToSTX} STX`);
}

convertAmounts();

// Example 4: Calculate Voting Power
function calculateVoting(): void {
  console.log('\n=== Example 4: Voting Calculations ===');
  
  const userVotes = 50;
  const totalVotes = 200;
  
  const power = ContractConverter.calculateVotingPower(userVotes, totalVotes);
  console.log(`Voting power: ${power}%`);
  
  const status = ContractConverter.getProposalStatus(120, 80, false);
  console.log(`Proposal status: ${status}`);
}

calculateVoting();

// Example 5: Poll Transaction Status
async function pollTransaction(): Promise<void> {
  console.log('\n=== Example 5: Transaction Polling ===');
  
  const txId = '0xabc123...';
  
  // Simulate status fetcher
  let pollCount = 0;
  const mockFetcher = async (id: string): Promise<string> => {
    pollCount++;
    console.log(`  Poll attempt ${pollCount} for ${id}`);
    
    if (pollCount === 1) return 'pending';
    if (pollCount === 2) return 'pending';
    return 'success';
  };
  
  const result = await pollTxStatus(
    txId,
    mockFetcher,
    {
      initialDelayMs: 100,
      intervalMs: 200,
      maxAttempts: 10,
    },
    {
      onPoll: (id, attempts) => console.log(`  → Polling ${id} (attempt ${attempts})`),
      onSuccess: (id) => console.log(`  ✓ Transaction ${id} succeeded!`),
      onFailure: (id, reason) => console.log(`  ✗ Transaction ${id} failed: ${reason}`),
    }
  );
  
  console.log(`Final status: ${result.status}`);
  console.log(`Total attempts: ${result.attempts}`);
}

// Run async example
(async () => {
  console.log('🚀 Running Advanced Contract Examples...\n');
  await pollTransaction();
})();
