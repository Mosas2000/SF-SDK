/**
 * Input validation utilities for Stacks blockchain data
 */

import type { ClarityValue, ValidationResult } from './types';

/**
 * Validates that a value is a valid string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validates that a value is a valid non-negative number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && isFinite(value);
}

/**
 * Validates that a value is a valid boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Validates that a value is a valid Stacks principal address
 * Format: ST or SP followed by 38 alphanumeric characters
 */
export function isPrincipal(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^(ST|SP)[A-Z0-9]{38}$/.test(value);
}

/**
 * Extracts the unwrapped value from a Clarity value that may be wrapped
 * in { value: T } or returned directly as T
 */
export function unwrapClarityValue<T>(
  value: T | ClarityValue<T> | null | undefined
): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as ClarityValue<T>).value;
  }
  return value as T;
}

/**
 * Validates that a value is a valid proposal count response
 */
export function validateProposalCount(raw: unknown): number | null {
  const count = unwrapClarityValue(raw);
  if (!isNumber(count)) return null;
  return count;
}

/**
 * Validates that a value is a valid STX amount
 */
export function validateStxAmount(value: unknown): number | null {
  if (!isNumber(value)) return null;
  if (value > Number.MAX_SAFE_INTEGER) return null;
  return value;
}

/**
 * Validates a title string
 * @param value - The title to validate
 * @param minLength - Minimum length (default: 5)
 * @param maxLength - Maximum length (default: 100)
 * @returns Error message or null if valid
 */
export function validateTitle(
  value: string,
  minLength = 5,
  maxLength = 100
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Title is required';

  if (trimmed.length < minLength) {
    return `Title must be at least ${minLength} characters`;
  }
  if (trimmed.length > maxLength) {
    return `Title must be at most ${maxLength} characters`;
  }
  return null;
}

/**
 * Validates a description string
 * @param value - The description to validate
 * @param minLength - Minimum length (default: 20)
 * @param maxLength - Maximum length (default: 500)
 * @returns Error message or null if valid
 */
export function validateDescription(
  value: string,
  minLength = 20,
  maxLength = 500
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Description is required';

  if (trimmed.length < minLength) {
    return `Description must be at least ${minLength} characters`;
  }
  if (trimmed.length > maxLength) {
    return `Description must be at most ${maxLength} characters`;
  }
  return null;
}

/**
 * Validates an amount string or number
 * @param value - The amount to validate
 * @param min - Minimum value (default: 1)
 * @param max - Maximum value (default: 10,000)
 * @returns Error message or null if valid
 */
export function validateAmount(
  value: string | number,
  min = 1,
  max = 10_000
): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return 'Amount must be a valid number';
  if (num < min) {
    return `Amount must be at least ${min}`;
  }
  if (num > max) {
    return `Amount must be at most ${max.toLocaleString()}`;
  }
  return null;
}

/**
 * Input validator class with common validation methods
 */
export class InputValidator {
  /**
   * Validates a Stacks blockchain address
   * @param address - The address to validate
   * @returns true if valid, false otherwise
   */
  static validateAddress(address: string): boolean {
    return isPrincipal(address);
  }

  /**
   * Validates a numeric amount
   * @param amount - The amount to validate (string or number)
   * @returns true if valid, false otherwise
   */
  static validateAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNumber(num) && num > 0;
  }

  /**
   * Sanitizes and escapes user input
   * @param input - The input to sanitize
   * @returns Sanitized string
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validates with detailed result
   * @param value - Value to validate
   * @param rules - Validation rules
   * @returns ValidationResult with success/error
   */
  static validate(
    value: string | number,
    rules: {
      type: 'string' | 'number' | 'address';
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    }
  ): ValidationResult {
    if (rules.type === 'address') {
      const isValid = this.validateAddress(String(value));
      return isValid
        ? { success: true, value: String(value) }
        : { success: false, error: 'Invalid Stacks address format' };
    }

    if (rules.type === 'number') {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNumber(num)) {
        return { success: false, error: 'Must be a valid number' };
      }
      if (rules.min !== undefined && num < rules.min) {
        return { success: false, error: `Must be at least ${rules.min}` };
      }
      if (rules.max !== undefined && num > rules.max) {
        return { success: false, error: `Must be at most ${rules.max}` };
      }
      return { success: true, value: num };
    }

    // String validation
    const str = String(value).trim();
    if (rules.minLength && str.length < rules.minLength) {
      return {
        success: false,
        error: `Must be at least ${rules.minLength} characters`,
      };
    }
    if (rules.maxLength && str.length > rules.maxLength) {
      return {
        success: false,
        error: `Must be at most ${rules.maxLength} characters`,
      };
    }
    return { success: true, value: str };
  }
}
