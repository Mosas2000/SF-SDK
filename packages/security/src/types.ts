/**
 * Type definitions for security validation and sanitization
 */

/**
 * Clarity value wrapper - represents values returned from Stacks contracts
 */
export interface ClarityValue<T> {
  value: T;
}

/**
 * Validation result with either success or error
 */
export type ValidationResult = {
  success: true;
  value: string | number;
} | {
  success: false;
  error: string;
};

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Security constants for CSP and content limits
 */
export interface SecurityConstants {
  ALLOWED_API_ORIGINS: readonly string[];
  CONTENT_LIMITS: {
    readonly TITLE_MAX: number;
    readonly DESCRIPTION_MAX: number;
    readonly TOAST_TITLE_MAX: number;
    readonly TOAST_DESCRIPTION_MAX: number;
  };
  SAFE_PROTOCOLS: readonly string[];
  BLOCKED_PROTOCOLS: readonly string[];
}

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  stripHtml?: boolean;
  stripEntities?: boolean;
  stripEventHandlers?: boolean;
  stripControlChars?: boolean;
  maxLength?: number;
}

/**
 * Input validator interface
 */
export interface IInputValidator {
  validateAddress(address: string): boolean;
  validateAmount(amount: string | number): boolean;
  sanitizeInput(input: string): string;
}
