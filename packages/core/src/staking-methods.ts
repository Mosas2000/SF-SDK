/**
 * Staking Contract Methods
 * 
 * Helper functions for staking-related smart contract functions.
 */

import { StacksClient } from './stacks-client';
import type { ApiResponse } from './types/contract';

/**
 * Stake data structure
 */
export interface Stake {
  address: string;
  amount: number;
  stakedAt: number;
  lastUpdated: number;
}

/**
 * Staking statistics
 */
export interface StakingStats {
  totalStaked: number;
  totalStakers: number;
  minStakeAmount: number;
  averageStake: number;
}

/**
 * Staker information
 */
export interface StakerInfo {
  address: string;
  stakeAmount: number;
  votingPower: number;
  percentageOfTotal: number;
  isActive: boolean;
}

/**
 * Staking contract methods
 */
export class StakingMethods {
  constructor(private client: StacksClient) {}

  /**
   * Get user's stake amount
   */
  async getStakeAmount(
    contractAddress: string,
    contractName: string,
    stakerAddress: string
  ): Promise<ApiResponse<number>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-stake',
      functionArgs: [`'${stakerAddress}`],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const amount = this.extractStakeAmount(result.data);
    
    return {
      success: true,
      data: amount,
      timestamp: Date.now(),
    };
  }

  /**
   * Get full stake information
   */
  async getStake(
    contractAddress: string,
    contractName: string,
    stakerAddress: string
  ): Promise<ApiResponse<Stake>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-stake',
      functionArgs: [`'${stakerAddress}`],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const stake = this.parseStake(stakerAddress, result.data);
    
    return {
      success: true,
      data: stake,
      timestamp: Date.now(),
    };
  }

  /**
   * Get minimum stake amount required
   */
  async getMinStakeAmount(
    contractAddress: string,
    contractName: string
  ): Promise<ApiResponse<number>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-min-stake-amount',
      functionArgs: [],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const amount = this.extractValue(result.data);
    
    return {
      success: true,
      data: Number(amount),
      timestamp: Date.now(),
    };
  }

  /**
   * Get total amount staked
   */
  async getTotalStaked(
    contractAddress: string,
    contractName: string
  ): Promise<ApiResponse<number>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-total-staked',
      functionArgs: [],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const amount = this.extractValue(result.data);
    
    return {
      success: true,
      data: Number(amount),
      timestamp: Date.now(),
    };
  }

  /**
   * Get staking statistics
   */
  async getStakingStats(
    contractAddress: string,
    contractName: string
  ): Promise<ApiResponse<StakingStats>> {
    const [totalResult, minResult] = await Promise.all([
      this.getTotalStaked(contractAddress, contractName),
      this.getMinStakeAmount(contractAddress, contractName),
    ]);

    if (!totalResult.success) {
      return {
        success: false,
        error: totalResult.error!,
        timestamp: Date.now(),
      };
    }

    const totalStaked = totalResult.data;
    const minStakeAmount = minResult.success ? minResult.data : 0;

    // Estimate total stakers (assuming average stake is 10x minimum)
    const estimatedAverage = minStakeAmount * 10;
    const totalStakers = estimatedAverage > 0 
      ? Math.floor(totalStaked / estimatedAverage) 
      : 0;

    return {
      success: true,
      data: {
        totalStaked,
        totalStakers,
        minStakeAmount,
        averageStake: totalStakers > 0 ? totalStaked / totalStakers : 0,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Get detailed staker information
   */
  async getStakerInfo(
    contractAddress: string,
    contractName: string,
    stakerAddress: string
  ): Promise<ApiResponse<StakerInfo>> {
    const [stakeResult, totalResult] = await Promise.all([
      this.getStakeAmount(contractAddress, contractName, stakerAddress),
      this.getTotalStaked(contractAddress, contractName),
    ]);

    if (!stakeResult.success) {
      return {
        success: false,
        error: stakeResult.error!,
        timestamp: Date.now(),
      };
    }

    const stakeAmount = stakeResult.data;
    const totalStaked = totalResult.success ? totalResult.data : stakeAmount;
    const percentageOfTotal = totalStaked > 0 ? (stakeAmount / totalStaked) * 100 : 0;

    return {
      success: true,
      data: {
        address: stakerAddress,
        stakeAmount,
        votingPower: stakeAmount,
        percentageOfTotal,
        isActive: stakeAmount > 0,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Stake STX (returns transaction parameters)
   */
  stakeSTX(amount: number): {
    functionName: string;
    functionArgs: string[];
  } {
    return {
      functionName: 'stake',
      functionArgs: [`u${amount}`],
    };
  }

  /**
   * Unstake STX (returns transaction parameters)
   */
  unstakeSTX(amount: number): {
    functionName: string;
    functionArgs: string[];
  } {
    return {
      functionName: 'unstake',
      functionArgs: [`u${amount}`],
    };
  }

  /**
   * Parse stake data
   */
  private parseStake(address: string, data: any): Stake {
    const amount = this.extractStakeAmount(data);
    
    return {
      address,
      amount,
      stakedAt: Number(this.extractValue(data['staked-at'] || data.stakedAt || 0)),
      lastUpdated: Number(this.extractValue(data['last-updated'] || data.lastUpdated || Date.now())),
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
 * Create staking methods instance
 */
export function createStakingMethods(client: StacksClient): StakingMethods {
  return new StakingMethods(client);
}
