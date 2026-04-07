/**
 * Voting Contract Methods
 * 
 * Helper functions for voting-related smart contract functions.
 */

import { StacksClient } from './stacks-client';
import type { ApiResponse } from './types/contract';

/**
 * Vote data structure
 */
export interface Vote {
  proposalId: number;
  voter: string;
  support: boolean;
  weight: number;
  votedAt: number;
}

/**
 * Voting power calculation
 */
export interface VotingPower {
  address: string;
  stakeAmount: number;
  votingWeight: number;
  percentage: number;
}

/**
 * Voting statistics
 */
export interface VotingStatsResult {
  proposalId: number;
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  participationRate: number;
  approvalRate: number;
}

/**
 * Voting contract methods
 */
export class VotingMethods {
  constructor(private client: StacksClient) {}

  /**
   * Get user's vote on a proposal
   */
  async getUserVote(
    contractAddress: string,
    contractName: string,
    proposalId: number,
    voterAddress: string
  ): Promise<ApiResponse<Vote | null>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-vote',
      functionArgs: [`u${proposalId}`, `'${voterAddress}`],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    // If no vote found, return null
    if (!result.data || result.data === null) {
      return {
        success: true,
        data: null,
        timestamp: Date.now(),
      };
    }

    const vote = this.parseVote(proposalId, voterAddress, result.data);
    
    return {
      success: true,
      data: vote,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate voting power based on stake
   */
  async getVotingPower(
    contractAddress: string,
    contractName: string,
    voterAddress: string
  ): Promise<ApiResponse<VotingPower>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-stake',
      functionArgs: [`'${voterAddress}`],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const stakeAmount = this.extractStakeAmount(result.data);
    
    // Get total staked to calculate percentage
    const totalResult = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-total-staked',
      functionArgs: [],
    });

    const totalStaked = totalResult.success 
      ? this.extractValue(totalResult.data)
      : stakeAmount;

    const percentage = totalStaked > 0 ? (stakeAmount / totalStaked) * 100 : 0;

    return {
      success: true,
      data: {
        address: voterAddress,
        stakeAmount,
        votingWeight: stakeAmount,
        percentage,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Get voting statistics for a proposal
   */
  async getProposalVotingStats(
    contractAddress: string,
    contractName: string,
    proposalId: number
  ): Promise<ApiResponse<VotingStatsResult>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-proposal',
      functionArgs: [`u${proposalId}`],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const data = result.data;
    const votesFor = Number(this.extractValue(data['votes-for'] || data.votesFor));
    const votesAgainst = Number(this.extractValue(data['votes-against'] || data.votesAgainst));
    const totalVotes = votesFor + votesAgainst;

    const participationRate = totalVotes > 0 ? 100 : 0;
    const approvalRate = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;

    return {
      success: true,
      data: {
        proposalId,
        totalVotes,
        votesFor,
        votesAgainst,
        participationRate,
        approvalRate,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Cast vote (returns transaction parameters)
   */
  castVote(
    proposalId: number,
    support: boolean
  ): {
    functionName: string;
    functionArgs: string[];
  } {
    return {
      functionName: 'vote',
      functionArgs: [
        `u${proposalId}`,
        support ? 'true' : 'false',
      ],
    };
  }

  /**
   * Check if user has voted
   */
  async hasVoted(
    contractAddress: string,
    contractName: string,
    proposalId: number,
    voterAddress: string
  ): Promise<ApiResponse<boolean>> {
    const voteResult = await this.getUserVote(
      contractAddress,
      contractName,
      proposalId,
      voterAddress
    );

    if (!voteResult.success) {
      return {
        success: false,
        error: voteResult.error!,
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      data: voteResult.data !== null,
      timestamp: Date.now(),
    };
  }

  /**
   * Parse vote data
   */
  private parseVote(proposalId: number, voter: string, data: any): Vote {
    return {
      proposalId,
      voter,
      support: Boolean(this.extractValue(data.support)),
      weight: Number(this.extractValue(data.weight)),
      votedAt: Number(this.extractValue(data['voted-at'] || data.votedAt)),
    };
  }

  /**
   * Extract stake amount from response
   */
  private extractStakeAmount(data: any): number {
    if (typeof data === 'number') return data;
    if (typeof data === 'object' && data !== null) {
      const amount = data.amount || data.value;
      return Number(this.extractValue(amount));
    }
    return 0;
  }

  /**
   * Extract value from wrapped response
   */
  private extractValue(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'object' && 'value' in data) return data.value;
    return data;
  }
}

/**
 * Create voting methods instance
 */
export function createVotingMethods(client: StacksClient): VotingMethods {
  return new VotingMethods(client);
}
