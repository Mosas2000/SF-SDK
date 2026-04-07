/**
 * Proposal Contract Methods
 */

import { StacksClient } from './stacks-client';
import type { ApiResponse } from './types/contract';

export interface ProposalData {
  id: number;
  proposer: string;
  amount: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  createdAt: number;
}

export interface ProposalListData {
  proposals: ProposalData[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProposalOptions {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'executed';
  sortBy?: 'createdAt' | 'votesFor' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export class ProposalMethods {
  constructor(private client: StacksClient) {}

  async getProposalCount(
    contractAddress: string,
    contractName: string
  ): Promise<ApiResponse<number>> {
    const result = await this.client.callReadOnly<any>({
      contractAddress,
      contractName,
      functionName: 'get-proposal-count',
      functionArgs: [],
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error!,
        timestamp: Date.now(),
      };
    }

    const count = typeof result.data === 'object' && 'value' in result.data
      ? result.data.value
      : result.data;

    return {
      success: true,
      data: Number(count),
      timestamp: Date.now(),
    };
  }

  async getProposal(
    contractAddress: string,
    contractName: string,
    proposalId: number
  ): Promise<ApiResponse<ProposalData>> {
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

    const proposal = this.parseProposal(proposalId, result.data);
    
    return {
      success: true,
      data: proposal,
      timestamp: Date.now(),
    };
  }

  async getProposals(
    contractAddress: string,
    contractName: string,
    options: ProposalOptions = {}
  ): Promise<ApiResponse<ProposalListData>> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;

    const countResult = await this.getProposalCount(contractAddress, contractName);
    if (!countResult.success) {
      return {
        success: false,
        error: countResult.error!,
        timestamp: Date.now(),
      };
    }

    const totalCount = countResult.data;
    const startId = (page - 1) * pageSize;
    const endId = Math.min(startId + pageSize, totalCount);

    const proposalPromises = [];
    for (let id = startId; id < endId; id++) {
      proposalPromises.push(this.getProposal(contractAddress, contractName, id));
    }

    const results = await Promise.all(proposalPromises);
    
    const proposals = results
      .filter(r => r.success)
      .map(r => r.data as ProposalData);

    let filtered = proposals;
    if (options.status) {
      filtered = this.filterByStatus(filtered, options.status);
    }

    if (options.sortBy) {
      filtered = this.sortProposals(filtered, options.sortBy, options.sortOrder);
    }

    return {
      success: true,
      data: {
        proposals: filtered,
        totalCount,
        page,
        pageSize,
        hasMore: endId < totalCount,
      },
      timestamp: Date.now(),
    };
  }

  createProposal(
    title: string,
    description: string,
    amount: number
  ): {
    functionName: string;
    functionArgs: string[];
  } {
    return {
      functionName: 'create-proposal',
      functionArgs: [
        `"${title}"`,
        `"${description}"`,
        `u${amount}`,
      ],
    };
  }

  private parseProposal(id: number, data: any): ProposalData {
    const getValue = (obj: any, key: string): any => {
      const value = obj[key] || obj[key.replace(/-/g, '')];
      return typeof value === 'object' && 'value' in value ? value.value : value;
    };

    return {
      id,
      proposer: getValue(data, 'proposer'),
      amount: Number(getValue(data, 'amount')),
      title: getValue(data, 'title'),
      description: getValue(data, 'description'),
      votesFor: Number(getValue(data, 'votes-for') || getValue(data, 'votesFor')),
      votesAgainst: Number(getValue(data, 'votes-against') || getValue(data, 'votesAgainst')),
      executed: Boolean(getValue(data, 'executed')),
      createdAt: Number(getValue(data, 'created-at') || getValue(data, 'createdAt')),
    };
  }

  private filterByStatus(proposals: ProposalData[], status: string): ProposalData[] {
    return proposals.filter(p => {
      if (status === 'executed') return p.executed;
      if (status === 'approved') return p.votesFor > p.votesAgainst && !p.executed;
      if (status === 'rejected') return p.votesAgainst >= p.votesFor && !p.executed;
      if (status === 'pending') return !p.executed;
      return true;
    });
  }

  private sortProposals(
    proposals: ProposalData[],
    sortBy: string,
    order: 'asc' | 'desc' = 'desc'
  ): ProposalData[] {
    return [...proposals].sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortBy === 'createdAt') {
        aVal = a.createdAt;
        bVal = b.createdAt;
      } else if (sortBy === 'votesFor') {
        aVal = a.votesFor;
        bVal = b.votesFor;
      } else if (sortBy === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      } else {
        return 0;
      }

      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
}

export function createProposalMethods(client: StacksClient): ProposalMethods {
  return new ProposalMethods(client);
}
