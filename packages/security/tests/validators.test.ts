/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  isString,
  isNumber,
  isBoolean,
  isPrincipal,
  unwrapClarityValue,
  validateProposalCount,
  validateStxAmount,
  validateTitle,
  validateDescription,
  validateAmount,
  InputValidator,
} from '../src/validators';

describe('Type Guards', () => {
  describe('isString', () => {
    it('validates non-empty strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('a')).toBe(true);
    });

    it('rejects empty strings', () => {
      expect(isString('')).toBe(false);
    });

    it('rejects non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('validates non-negative numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(1.5)).toBe(true);
    });

    it('rejects negative numbers', () => {
      expect(isNumber(-1)).toBe(false);
      expect(isNumber(-0.5)).toBe(false);
    });

    it('rejects non-finite numbers', () => {
      expect(isNumber(Infinity)).toBe(false);
      expect(isNumber(NaN)).toBe(false);
    });

    it('rejects non-numbers', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('validates booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('rejects non-booleans', () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isPrincipal', () => {
    it('validates mainnet addresses', () => {
      expect(isPrincipal('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9')).toBe(true);
      expect(isPrincipal('SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T')).toBe(true);
    });

    it('validates testnet addresses', () => {
      expect(isPrincipal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
    });

    it('rejects invalid addresses', () => {
      expect(isPrincipal('invalid')).toBe(false);
      expect(isPrincipal('SP123')).toBe(false);
      expect(isPrincipal('0x1234567890123456789012345678901234567890')).toBe(false);
      expect(isPrincipal('')).toBe(false);
    });

    it('rejects non-strings', () => {
      expect(isPrincipal(123)).toBe(false);
      expect(isPrincipal(null)).toBe(false);
    });
  });
});

describe('unwrapClarityValue', () => {
  it('unwraps wrapped values', () => {
    expect(unwrapClarityValue({ value: 'hello' })).toBe('hello');
    expect(unwrapClarityValue({ value: 123 })).toBe(123);
    expect(unwrapClarityValue({ value: true })).toBe(true);
  });

  it('returns direct values unchanged', () => {
    expect(unwrapClarityValue('hello')).toBe('hello');
    expect(unwrapClarityValue(123)).toBe(123);
    expect(unwrapClarityValue(true)).toBe(true);
  });

  it('handles null and undefined', () => {
    expect(unwrapClarityValue(null)).toBe(null);
    expect(unwrapClarityValue(undefined)).toBe(null);
  });
});

describe('Validation Functions', () => {
  describe('validateProposalCount', () => {
    it('validates wrapped numbers', () => {
      expect(validateProposalCount({ value: 5 })).toBe(5);
      expect(validateProposalCount({ value: 0 })).toBe(0);
    });

    it('validates direct numbers', () => {
      expect(validateProposalCount(5)).toBe(5);
      expect(validateProposalCount(0)).toBe(0);
    });

    it('rejects invalid values', () => {
      expect(validateProposalCount('5')).toBe(null);
      expect(validateProposalCount(-1)).toBe(null);
      expect(validateProposalCount(null)).toBe(null);
    });
  });

  describe('validateStxAmount', () => {
    it('validates valid amounts', () => {
      expect(validateStxAmount(100)).toBe(100);
      expect(validateStxAmount(0)).toBe(0);
      expect(validateStxAmount(1000000)).toBe(1000000);
    });

    it('rejects amounts exceeding MAX_SAFE_INTEGER', () => {
      expect(validateStxAmount(Number.MAX_SAFE_INTEGER + 1)).toBe(null);
    });

    it('rejects invalid values', () => {
      expect(validateStxAmount('100')).toBe(null);
      expect(validateStxAmount(-1)).toBe(null);
      expect(validateStxAmount(NaN)).toBe(null);
    });
  });

  describe('validateTitle', () => {
    it('validates proper titles', () => {
      expect(validateTitle('Hello World')).toBe(null);
      expect(validateTitle('A'.repeat(50))).toBe(null);
    });

    it('trims whitespace', () => {
      expect(validateTitle('  Hello  ')).toBe(null);
    });

    it('rejects empty titles', () => {
      expect(validateTitle('')).toBe('Title is required');
      expect(validateTitle('   ')).toBe('Title is required');
    });

    it('enforces minimum length', () => {
      expect(validateTitle('Hi')).toContain('at least 5 characters');
    });

    it('enforces maximum length', () => {
      expect(validateTitle('A'.repeat(101))).toContain('at most 100 characters');
    });

    it('respects custom min/max', () => {
      expect(validateTitle('Hi', 2, 10)).toBe(null);
      expect(validateTitle('Hello World!', 2, 10)).toContain('at most 10 characters');
    });
  });

  describe('validateDescription', () => {
    it('validates proper descriptions', () => {
      expect(validateDescription('This is a valid description with enough words')).toBe(null);
    });

    it('rejects empty descriptions', () => {
      expect(validateDescription('')).toBe('Description is required');
    });

    it('enforces minimum length', () => {
      expect(validateDescription('Too short')).toContain('at least 20 characters');
    });

    it('enforces maximum length', () => {
      expect(validateDescription('A'.repeat(501))).toContain('at most 500 characters');
    });
  });

  describe('validateAmount', () => {
    it('validates string amounts', () => {
      expect(validateAmount('100')).toBe(null);
      expect(validateAmount('5.5')).toBe(null);
    });

    it('validates numeric amounts', () => {
      expect(validateAmount(100)).toBe(null);
      expect(validateAmount(5.5)).toBe(null);
    });

    it('enforces minimum', () => {
      expect(validateAmount('0.5')).toContain('at least 1');
      expect(validateAmount(0)).toContain('at least 1');
    });

    it('enforces maximum', () => {
      expect(validateAmount('10001')).toContain('at most 10,000');
      expect(validateAmount(20000)).toContain('at most 10,000');
    });

    it('rejects invalid numbers', () => {
      expect(validateAmount('not a number')).toContain('valid number');
    });

    it('respects custom min/max', () => {
      expect(validateAmount(50, 10, 100)).toBe(null);
      expect(validateAmount(5, 10, 100)).toContain('at least 10');
      expect(validateAmount(150, 10, 100)).toContain('at most 100');
    });
  });
});

describe('InputValidator Class', () => {
  describe('validateAddress', () => {
    it('validates correct addresses', () => {
      expect(InputValidator.validateAddress('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9')).toBe(true);
      expect(InputValidator.validateAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
    });

    it('rejects invalid addresses', () => {
      expect(InputValidator.validateAddress('invalid')).toBe(false);
      expect(InputValidator.validateAddress('')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('validates positive numbers', () => {
      expect(InputValidator.validateAmount(100)).toBe(true);
      expect(InputValidator.validateAmount('50.5')).toBe(true);
    });

    it('rejects zero and negative', () => {
      expect(InputValidator.validateAmount(0)).toBe(false);
      expect(InputValidator.validateAmount(-5)).toBe(false);
    });

    it('rejects invalid input', () => {
      expect(InputValidator.validateAmount('not a number')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes angle brackets', () => {
      expect(InputValidator.sanitizeInput('<script>alert("xss")</script>')).not.toContain('<');
      expect(InputValidator.sanitizeInput('<script>alert("xss")</script>')).not.toContain('>');
    });

    it('escapes HTML entities', () => {
      expect(InputValidator.sanitizeInput('Test & "quotes"')).toContain('&amp;');
      expect(InputValidator.sanitizeInput('Test & "quotes"')).toContain('&quot;');
    });

    it('trims whitespace', () => {
      expect(InputValidator.sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('validate', () => {
    it('validates addresses', () => {
      const result = InputValidator.validate('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9', {
        type: 'address',
      });
      expect(result.success).toBe(true);
    });

    it('validates numbers with range', () => {
      const result = InputValidator.validate(50, {
        type: 'number',
        min: 10,
        max: 100,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(50);
      }
    });

    it('rejects out-of-range numbers', () => {
      const result = InputValidator.validate(5, {
        type: 'number',
        min: 10,
        max: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('at least 10');
      }
    });

    it('validates strings with length constraints', () => {
      const result = InputValidator.validate('Hello', {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      });
      expect(result.success).toBe(true);
    });
  });
});
