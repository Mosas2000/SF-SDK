import { describe, it, expect } from 'vitest';
import {
  ContractResponseHandler,
  TransactionBuilder,
  ContractConverter,
  ErrorRecovery,
} from '../src/helpers';

describe('ContractResponseHandler', () => {
  describe('extractProposalCount', () => {
    it('should extract valid proposal count', () => {
      expect(ContractResponseHandler.extractProposalCount(5)).toBe(5);
      expect(ContractResponseHandler.extractProposalCount(0)).toBe(0);
    });

    it('should return 0 for null or invalid responses', () => {
      expect(ContractResponseHandler.extractProposalCount(null)).toBe(0);
      expect(ContractResponseHandler.extractProposalCount(-5)).toBe(0);
    });
  });

  describe('extractStakeAmount', () => {
    it('should extract numeric amount', () => {
      expect(ContractResponseHandler.extractStakeAmount({ amount: 1000 })).toBe(1000);
    });

    it('should extract wrapped value', () => {
      expect(ContractResponseHandler.extractStakeAmount({ amount: { value: 2000 } })).toBe(2000);
    });

    it('should return 0 for null or invalid', () => {
      expect(ContractResponseHandler.extractStakeAmount(null)).toBe(0);
      expect(ContractResponseHandler.extractStakeAmount({})).toBe(0);
      expect(ContractResponseHandler.extractStakeAmount({ amount: 'invalid' })).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(ContractResponseHandler.extractStakeAmount({ amount: -100 })).toBe(0);
    });
  });

  describe('extractMinStakeAmount', () => {
    it('should extract valid minimum stake', () => {
      expect(ContractResponseHandler.extractMinStakeAmount(5_000_000)).toBe(5_000_000);
    });

    it('should return default for null or invalid', () => {
      expect(ContractResponseHandler.extractMinStakeAmount(null)).toBe(10_000_000);
    });
  });

  describe('isValidProposalResponse', () => {
    it('should validate correct proposal structure', () => {
      const validProposal = {
        proposer: 'SP...',
        amount: 1000,
        title: 'Test',
        description: 'Test description',
        'votes-for': 100,
        'votes-against': 50,
        executed: false,
        'created-at': 12345,
      };
      expect(ContractResponseHandler.isValidProposalResponse(validProposal)).toBe(true);
    });

    it('should reject invalid structures', () => {
      expect(ContractResponseHandler.isValidProposalResponse(null)).toBe(false);
      expect(ContractResponseHandler.isValidProposalResponse({})).toBe(false);
      expect(ContractResponseHandler.isValidProposalResponse({ proposer: 'SP...' })).toBe(false);
    });
  });

  describe('isValidStakeResponse', () => {
    it('should validate correct stake structure', () => {
      expect(ContractResponseHandler.isValidStakeResponse({ amount: 1000 })).toBe(true);
    });

    it('should reject invalid structures', () => {
      expect(ContractResponseHandler.isValidStakeResponse(null)).toBe(false);
      expect(ContractResponseHandler.isValidStakeResponse({})).toBe(false);
    });
  });
});

describe('TransactionBuilder', () => {
  describe('buildStakeAmount', () => {
    it('should validate and floor positive amounts', () => {
      expect(TransactionBuilder.buildStakeAmount(1000.7)).toBe(1000);
      expect(TransactionBuilder.buildStakeAmount(500)).toBe(500);
    });

    it('should throw for invalid amounts', () => {
      expect(() => TransactionBuilder.buildStakeAmount(0)).toThrow('must be positive');
      expect(() => TransactionBuilder.buildStakeAmount(-100)).toThrow('must be positive');
      expect(() => TransactionBuilder.buildStakeAmount(Infinity)).toThrow('must be positive');
      expect(() => TransactionBuilder.buildStakeAmount(NaN)).toThrow('must be positive');
    });
  });

  describe('buildProposalAmount', () => {
    it('should validate and floor positive amounts', () => {
      expect(TransactionBuilder.buildProposalAmount(1000.9)).toBe(1000);
    });

    it('should throw for invalid amounts', () => {
      expect(() => TransactionBuilder.buildProposalAmount(0)).toThrow('must be positive');
      expect(() => TransactionBuilder.buildProposalAmount(-500)).toThrow('must be positive');
    });
  });

  describe('buildProposalTitle', () => {
    it('should accept valid titles', () => {
      expect(TransactionBuilder.buildProposalTitle('Valid Title')).toBe('Valid Title');
      expect(TransactionBuilder.buildProposalTitle('  Trimmed  ')).toBe('Trimmed');
    });

    it('should throw for invalid titles', () => {
      expect(() => TransactionBuilder.buildProposalTitle('ab')).toThrow('between 3 and 200');
      expect(() => TransactionBuilder.buildProposalTitle('x'.repeat(201))).toThrow('between 3 and 200');
      expect(() => TransactionBuilder.buildProposalTitle('  ')).toThrow('between 3 and 200');
    });
  });

  describe('buildProposalDescription', () => {
    it('should accept valid descriptions', () => {
      const desc = 'This is a valid description with enough text';
      expect(TransactionBuilder.buildProposalDescription(desc)).toBe(desc);
    });

    it('should throw for invalid descriptions', () => {
      expect(() => TransactionBuilder.buildProposalDescription('short')).toThrow('between 10 and 2000');
      expect(() => TransactionBuilder.buildProposalDescription('x'.repeat(2001))).toThrow('between 10 and 2000');
    });
  });

  describe('buildVoteWeight', () => {
    it('should validate and floor positive weights', () => {
      expect(TransactionBuilder.buildVoteWeight(100.5)).toBe(100);
    });

    it('should throw for invalid weights', () => {
      expect(() => TransactionBuilder.buildVoteWeight(0)).toThrow('must be positive');
      expect(() => TransactionBuilder.buildVoteWeight(-50)).toThrow('must be positive');
    });
  });
});

describe('ContractConverter', () => {
  describe('microSTXToSTX', () => {
    it('should convert microSTX to STX', () => {
      expect(ContractConverter.microSTXToSTX(1_000_000)).toBe(1);
      expect(ContractConverter.microSTXToSTX(5_500_000)).toBe(5.5);
      expect(ContractConverter.microSTXToSTX(0)).toBe(0);
    });
  });

  describe('STXToMicroSTX', () => {
    it('should convert STX to microSTX', () => {
      expect(ContractConverter.STXToMicroSTX(1)).toBe(1_000_000);
      expect(ContractConverter.STXToMicroSTX(5.5)).toBe(5_500_000);
      expect(ContractConverter.STXToMicroSTX(0)).toBe(0);
    });

    it('should floor decimal amounts', () => {
      expect(ContractConverter.STXToMicroSTX(1.5555555)).toBe(1_555_555);
    });
  });

  describe('formatProposalId', () => {
    it('should format proposal IDs', () => {
      expect(ContractConverter.formatProposalId(1)).toBe('#1');
      expect(ContractConverter.formatProposalId(42)).toBe('#42');
    });
  });

  describe('calculateVotingPower', () => {
    it('should calculate voting power percentage', () => {
      expect(ContractConverter.calculateVotingPower(50, 200)).toBe(25);
      expect(ContractConverter.calculateVotingPower(100, 100)).toBe(100);
    });

    it('should return 0 for zero total', () => {
      expect(ContractConverter.calculateVotingPower(50, 0)).toBe(0);
    });
  });

  describe('getProposalStatus', () => {
    it('should return executed if executed', () => {
      expect(ContractConverter.getProposalStatus(100, 50, true)).toBe('executed');
    });

    it('should return passing if votes for > votes against', () => {
      expect(ContractConverter.getProposalStatus(100, 50, false)).toBe('passing');
    });

    it('should return failing if votes for <= votes against', () => {
      expect(ContractConverter.getProposalStatus(50, 100, false)).toBe('failing');
      expect(ContractConverter.getProposalStatus(50, 50, false)).toBe('failing');
    });
  });
});

describe('ErrorRecovery', () => {
  describe('isRetryable', () => {
    it('should identify retryable errors', () => {
      expect(ErrorRecovery.isRetryable({ message: 'Connection timeout' })).toBe(true);
      expect(ErrorRecovery.isRetryable({ message: 'Service temporarily unavailable' })).toBe(true);
      expect(ErrorRecovery.isRetryable({ message: 'Please try again' })).toBe(true);
      expect(ErrorRecovery.isRetryable({ message: 'Network error occurred' })).toBe(true);
    });

    it('should reject non-retryable errors', () => {
      expect(ErrorRecovery.isRetryable({ message: 'Invalid input' })).toBe(false);
      expect(ErrorRecovery.isRetryable(null)).toBe(false);
      expect(ErrorRecovery.isRetryable('string error')).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should return increasing delays', () => {
      const delay1 = ErrorRecovery.getRetryDelay(1);
      const delay2 = ErrorRecovery.getRetryDelay(2);
      const delay3 = ErrorRecovery.getRetryDelay(3);

      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThan(4000);
      expect(delay2).toBeGreaterThanOrEqual(2000);
      expect(delay3).toBeGreaterThanOrEqual(4000);
    });

    it('should cap exponential growth', () => {
      const delay10 = ErrorRecovery.getRetryDelay(10);
      const delay11 = ErrorRecovery.getRetryDelay(11);

      // Should be capped at 2^5
      expect(delay10).toBeLessThan(40000);
      expect(delay11).toBeLessThan(40000);
    });
  });

  describe('isAuthError', () => {
    it('should identify authentication errors', () => {
      expect(ErrorRecovery.isAuthError({ message: 'Unauthorized access' })).toBe(true);
      expect(ErrorRecovery.isAuthError({ message: 'Forbidden resource' })).toBe(true);
      expect(ErrorRecovery.isAuthError({ message: 'Not authenticated' })).toBe(true);
      expect(ErrorRecovery.isAuthError({ message: 'Wallet not connected' })).toBe(true);
    });

    it('should reject non-auth errors', () => {
      expect(ErrorRecovery.isAuthError({ message: 'Invalid input' })).toBe(false);
      expect(ErrorRecovery.isAuthError(null)).toBe(false);
    });
  });
});
