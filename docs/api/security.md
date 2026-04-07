# @sfsec/security API Reference

Input validation and sanitization utilities for secure application development.

## Installation

```bash
npm install @sfsec/security
```

## InputValidator

Comprehensive validation utilities for user input.

### Methods

#### `isPrincipal(address: string): boolean`

Validates a Stacks blockchain address.

```typescript
import { InputValidator } from '@sfsec/security';

InputValidator.isPrincipal('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'); // true
InputValidator.isPrincipal('invalid-address'); // false
```

#### `isValidAmount(amount: number): boolean`

Validates that an amount is a positive number.

```typescript
InputValidator.isValidAmount(1000); // true
InputValidator.isValidAmount(-100); // false
InputValidator.isValidAmount(NaN); // false
```

#### `isValidTitle(title: string): boolean`

Validates proposal/content titles (3-100 characters).

```typescript
InputValidator.isValidTitle('Valid Title'); // true
InputValidator.isValidTitle('ab'); // false (too short)
```

#### `isValidDescription(description: string): boolean`

Validates descriptions (10-500 characters).

```typescript
InputValidator.isValidDescription('A valid description with enough characters'); // true
InputValidator.isValidDescription('Short'); // false
```

#### `isValidComment(comment: string): boolean`

Validates comments (1-280 characters).

```typescript
InputValidator.isValidComment('Great proposal!'); // true
InputValidator.isValidComment(''); // false
```

#### `isValidUrl(url: string): boolean`

Validates URLs with safe protocols only.

```typescript
InputValidator.isValidUrl('https://example.com'); // true
InputValidator.isValidUrl('javascript:alert(1)'); // false
```

#### `isValidTxId(txId: string): boolean`

Validates transaction IDs (64 hex chars, optional 0x prefix).

```typescript
InputValidator.isValidTxId('0xabc123...'); // true
InputValidator.isValidTxId('invalid'); // false
```

## Sanitization Functions

### `sanitizeText(input: string): string`

Removes HTML tags, event handlers, and control characters.

```typescript
import { sanitizeText } from '@sfsec/security';

sanitizeText('<script>alert(1)</script>Hello'); // 'Hello'
sanitizeText('<<script>script>alert(1)</script>'); // 'alert(1)'
```

### `sanitizeUrl(url: string): string`

Removes dangerous URL protocols.

```typescript
import { sanitizeUrl } from '@sfsec/security';

sanitizeUrl('https://example.com'); // 'https://example.com'
sanitizeUrl('javascript:alert(1)'); // ''
```

## Constants

### `SECURITY_CONSTANTS`

Security-related configuration values.

```typescript
import { SECURITY_CONSTANTS } from '@sfsec/security';

// Staking limits
SECURITY_CONSTANTS.MIN_STAKE_AMOUNT; // 10_000_000 microSTX

// Content length limits
SECURITY_CONSTANTS.TITLE_MAX; // 100
SECURITY_CONSTANTS.DESCRIPTION_MAX; // 500
SECURITY_CONSTANTS.COMMENT_MAX; // 280

// Validation patterns
SECURITY_CONSTANTS.ADDRESS_PATTERN; // /^(ST|SP)[A-Z0-9]{39}$/
SECURITY_CONSTANTS.TX_ID_PATTERN; // /^(0x)?[0-9a-f]{64}$/i

// Allowed origins
SECURITY_CONSTANTS.ALLOWED_STACKS_API_ORIGINS; // Array of safe API URLs
```

## Best Practices

1. **Always validate before sanitizing**: Check if input matches expected format first
2. **Sanitize user-generated content**: Clean all user input before storage or display
3. **Use type-safe validation**: Leverage TypeScript for compile-time safety
4. **Validate on both client and server**: Never trust client-side validation alone

## Example: Complete Validation Workflow

```typescript
import { InputValidator, sanitizeText } from '@sfsec/security';

function createProposal(data: {
  title: string;
  description: string;
  amount: number;
  proposer: string;
}) {
  // 1. Validate address
  if (!InputValidator.isPrincipal(data.proposer)) {
    throw new Error('Invalid proposer address');
  }

  // 2. Sanitize and validate title
  const cleanTitle = sanitizeText(data.title);
  if (!InputValidator.isValidTitle(cleanTitle)) {
    throw new Error('Invalid title');
  }

  // 3. Sanitize and validate description
  const cleanDescription = sanitizeText(data.description);
  if (!InputValidator.isValidDescription(cleanDescription)) {
    throw new Error('Invalid description');
  }

  // 4. Validate amount
  if (!InputValidator.isValidAmount(data.amount)) {
    throw new Error('Invalid amount');
  }

  // Safe to proceed
  return {
    title: cleanTitle,
    description: cleanDescription,
    amount: data.amount,
    proposer: data.proposer,
  };
}
```
