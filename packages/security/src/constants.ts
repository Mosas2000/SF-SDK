/**
 * Security-related constants for the SFSec SDK
 *
 * Centralizing these values ensures consistency across validation
 * and sanitization operations
 */

/**
 * Allowed external API origins for fetch requests
 * These should match the connect-src directive in CSP headers
 */
export const ALLOWED_API_ORIGINS = [
  'https://api.hiro.so',
  'https://api.mainnet.hiro.so',
  'https://api.testnet.hiro.so',
  'https://stacks-node-api.mainnet.stacks.co',
  'https://stacks-node-api.testnet.stacks.co',
] as const;

/**
 * The Explorer base URL used for transaction and address links
 */
export const EXPLORER_BASE_URL = 'https://explorer.hiro.so';

/**
 * Maximum allowed lengths for user-generated content fields
 * These are enforced at both validation and sanitization layers
 */
export const CONTENT_LIMITS = {
  /** Maximum proposal title length */
  TITLE_MAX: 100,
  /** Maximum proposal description length */
  DESCRIPTION_MAX: 500,
  /** Maximum comment length */
  COMMENT_MAX: 1000,
  /** Maximum toast message title length */
  TOAST_TITLE_MAX: 200,
  /** Maximum toast description length */
  TOAST_DESCRIPTION_MAX: 500,
} as const;

/**
 * URL protocols that are considered safe for use in href attributes
 */
export const SAFE_PROTOCOLS = ['https:', 'http:'] as const;

/**
 * URL protocols that must be blocked to prevent code execution
 * through href attributes or window.location assignments
 */
export const BLOCKED_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'blob:',
] as const;

/**
 * Minimum stake amount in microSTX
 * Used for validation of staking operations
 */
export const MIN_STAKE_MICRO = 10_000_000; // 10 STX

/**
 * Minimum stake amount in STX (human-readable)
 */
export const MIN_STAKE_STX = 10;

/**
 * Maximum safe integer for amounts
 * JavaScript's Number.MAX_SAFE_INTEGER
 */
export const MAX_SAFE_AMOUNT = Number.MAX_SAFE_INTEGER;

/**
 * Default validation rules for proposal fields
 */
export const PROPOSAL_RULES = {
  title: {
    required: true,
    minLength: 5,
    maxLength: CONTENT_LIMITS.TITLE_MAX,
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: CONTENT_LIMITS.DESCRIPTION_MAX,
  },
  amount: {
    required: true,
    min: 1,
    max: 10_000,
  },
} as const;

/**
 * Regular expression pattern for validating Stacks addresses
 * Matches ST (testnet) or SP (mainnet) followed by 38 alphanumeric characters
 */
export const STACKS_ADDRESS_PATTERN = /^(ST|SP)[A-Z0-9]{38}$/;

/**
 * Regular expression pattern for validating transaction IDs
 * 64-character hex string, optionally prefixed with '0x'
 */
export const TX_ID_PATTERN = /^(0x)?[0-9a-f]{64}$/i;
