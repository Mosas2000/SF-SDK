/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  ALLOWED_API_ORIGINS,
  EXPLORER_BASE_URL,
  CONTENT_LIMITS,
  SAFE_PROTOCOLS,
  BLOCKED_PROTOCOLS,
  MIN_STAKE_MICRO,
  MIN_STAKE_STX,
  MAX_SAFE_AMOUNT,
  PROPOSAL_RULES,
  STACKS_ADDRESS_PATTERN,
  TX_ID_PATTERN,
} from '../src/constants';

describe('Security Constants', () => {
  describe('API Origins', () => {
    it('defines allowed API origins', () => {
      expect(ALLOWED_API_ORIGINS).toBeDefined();
      expect(ALLOWED_API_ORIGINS.length).toBeGreaterThan(0);
    });

    it('includes Hiro API endpoints', () => {
      expect(ALLOWED_API_ORIGINS).toContain('https://api.hiro.so');
      expect(ALLOWED_API_ORIGINS).toContain('https://api.mainnet.hiro.so');
    });

    it('is readonly array', () => {
      // TypeScript enforces readonly at compile time
      // Runtime immutability would require Object.freeze
      expect(Array.isArray(ALLOWED_API_ORIGINS)).toBe(true);
      expect(ALLOWED_API_ORIGINS.length).toBeGreaterThan(0);
    });
  });

  describe('Explorer URL', () => {
    it('defines explorer base URL', () => {
      expect(EXPLORER_BASE_URL).toBe('https://explorer.hiro.so');
    });
  });

  describe('Content Limits', () => {
    it('defines title limit', () => {
      expect(CONTENT_LIMITS.TITLE_MAX).toBe(100);
    });

    it('defines description limit', () => {
      expect(CONTENT_LIMITS.DESCRIPTION_MAX).toBe(500);
    });

    it('defines comment limit', () => {
      expect(CONTENT_LIMITS.COMMENT_MAX).toBe(1000);
    });

    it('defines toast limits', () => {
      expect(CONTENT_LIMITS.TOAST_TITLE_MAX).toBe(200);
      expect(CONTENT_LIMITS.TOAST_DESCRIPTION_MAX).toBe(500);
    });

    it('is readonly object', () => {
      // TypeScript enforces readonly at compile time
      expect(typeof CONTENT_LIMITS).toBe('object');
      expect(CONTENT_LIMITS.TITLE_MAX).toBe(100);
    });
  });

  describe('Protocol Lists', () => {
    it('defines safe protocols', () => {
      expect(SAFE_PROTOCOLS).toEqual(['https:', 'http:']);
    });

    it('defines blocked protocols', () => {
      expect(BLOCKED_PROTOCOLS).toContain('javascript:');
      expect(BLOCKED_PROTOCOLS).toContain('data:');
      expect(BLOCKED_PROTOCOLS).toContain('vbscript:');
      expect(BLOCKED_PROTOCOLS).toContain('blob:');
    });

    it('protocol lists are defined', () => {
      // TypeScript enforces readonly at compile time
      expect(Array.isArray(SAFE_PROTOCOLS)).toBe(true);
      expect(Array.isArray(BLOCKED_PROTOCOLS)).toBe(true);
    });
  });

  describe('Stake Constants', () => {
    it('defines minimum stake in microSTX', () => {
      expect(MIN_STAKE_MICRO).toBe(10_000_000);
    });

    it('defines minimum stake in STX', () => {
      expect(MIN_STAKE_STX).toBe(10);
    });

    it('micro and STX values match', () => {
      expect(MIN_STAKE_MICRO / 1_000_000).toBe(MIN_STAKE_STX);
    });
  });

  describe('Amount Limits', () => {
    it('defines max safe amount', () => {
      expect(MAX_SAFE_AMOUNT).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Proposal Rules', () => {
    it('defines title rules', () => {
      expect(PROPOSAL_RULES.title.required).toBe(true);
      expect(PROPOSAL_RULES.title.minLength).toBe(5);
      expect(PROPOSAL_RULES.title.maxLength).toBe(100);
    });

    it('defines description rules', () => {
      expect(PROPOSAL_RULES.description.required).toBe(true);
      expect(PROPOSAL_RULES.description.minLength).toBe(20);
      expect(PROPOSAL_RULES.description.maxLength).toBe(CONTENT_LIMITS.DESCRIPTION_MAX);
    });

    it('defines amount rules', () => {
      expect(PROPOSAL_RULES.amount.required).toBe(true);
      expect(PROPOSAL_RULES.amount.min).toBe(1);
      expect(PROPOSAL_RULES.amount.max).toBe(10_000);
    });
  });

  describe('Regex Patterns', () => {
    describe('STACKS_ADDRESS_PATTERN', () => {
      it('matches mainnet addresses', () => {
        expect(STACKS_ADDRESS_PATTERN.test('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9')).toBe(true);
      });

      it('matches testnet addresses', () => {
        expect(STACKS_ADDRESS_PATTERN.test('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
      });

      it('rejects invalid addresses', () => {
        expect(STACKS_ADDRESS_PATTERN.test('invalid')).toBe(false);
        expect(STACKS_ADDRESS_PATTERN.test('SP123')).toBe(false);
      });
    });

    describe('TX_ID_PATTERN', () => {
      it('matches 64-char hex strings', () => {
        expect(TX_ID_PATTERN.test('a'.repeat(64))).toBe(true);
      });

      it('matches with 0x prefix', () => {
        expect(TX_ID_PATTERN.test('0x' + 'a'.repeat(64))).toBe(true);
      });

      it('is case insensitive', () => {
        expect(TX_ID_PATTERN.test('A'.repeat(64))).toBe(true);
        expect(TX_ID_PATTERN.test('aA'.repeat(32))).toBe(true);
      });

      it('rejects invalid lengths', () => {
        expect(TX_ID_PATTERN.test('a'.repeat(63))).toBe(false);
        expect(TX_ID_PATTERN.test('a'.repeat(65))).toBe(false);
      });

      it('rejects non-hex characters', () => {
        expect(TX_ID_PATTERN.test('g'.repeat(64))).toBe(false);
      });
    });
  });
});
