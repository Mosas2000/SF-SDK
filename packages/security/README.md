# @sfsec/security

Security utilities for the SFSec SDK, providing comprehensive input validation and sanitization for Stacks blockchain applications.

## Features

- ✅ **Input Validation**: Type guards and validators for addresses, amounts, and Clarity values
- ✅ **Sanitization**: XSS prevention through aggressive HTML stripping and entity removal
- ✅ **Security Constants**: CSP policies, content limits, protocol allowlists, and regex patterns
- ✅ **Type-Safe**: Full TypeScript support with strict type checking
- ✅ **Framework-Agnostic**: Works with any JavaScript/TypeScript project

## Installation

```bash
npm install @sfsec/security
```

## Quick Start

```typescript
import { 
  InputValidator, 
  sanitizeText, 
  sanitizeUrl,
  isPrincipal,
  SECURITY_CONSTANTS 
} from '@sfsec/security';

// Validate Stacks addresses
const isValid = InputValidator.validateAddress('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9');
console.log(isValid); // true

// Type guard for principals
if (isPrincipal(userInput)) {
  // TypeScript knows userInput is a valid address string
  processAddress(userInput);
}

// Sanitize user input to prevent XSS
const safe = sanitizeText('<script>alert("xss")</script>Hello World');
console.log(safe); // 'Hello World'

// Sanitize URLs
const safeUrl = sanitizeUrl('javascript:alert(1)');
console.log(safeUrl); // '' (blocked dangerous protocol)

// Use security constants
console.log(SECURITY_CONSTANTS.CONTENT_LIMITS.TITLE_MAX); // 100
```

## API Documentation

### Type Guards

#### `isString(value: unknown): value is string`

Type guard for string validation.

```typescript
if (isString(input)) {
  // TypeScript knows input is a string
  const upper = input.toUpperCase();
}
```

#### `isNumber(value: unknown): value is number`

Type guard for number validation (excludes NaN and Infinity).

```typescript
if (isNumber(amount)) {
  // Safe to perform arithmetic
  const total = amount * 2;
}
```

#### `isBoolean(value: unknown): value is boolean`

Type guard for boolean validation.

#### `isPrincipal(value: unknown): value is string`

Validates Stacks blockchain addresses (mainnet SP* or testnet ST* addresses).

```typescript
isPrincipal('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'); // true
isPrincipal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'); // true
isPrincipal('invalid'); // false
```

### Clarity Value Utilities

#### `unwrapClarityValue<T>(value: T | ClarityValue<T> | null | undefined): T | null`

Extracts values from Clarity responses that may be wrapped in `{ value: T }`.

```typescript
const wrappedValue = { value: 100 };
const unwrapped = unwrapClarityValue(wrappedValue); // 100

const directValue = 100;
const result = unwrapClarityValue(directValue); // 100
```

### Validation Functions

#### `validateTitle(title: string): ValidationResult`

Validates proposal titles against length constraints.

```typescript
const result = validateTitle('My Proposal');
if (result.success) {
  console.log('Valid title');
} else {
  console.error(result.error);
}
```

#### `validateDescription(description: string): ValidationResult`

Validates descriptions with min/max length rules.

#### `validateAmount(amount: number): ValidationResult`

Validates numeric amounts with range checking.

```typescript
const result = validateAmount(100);
// Returns: { success: true, value: 100 }

const invalid = validateAmount(-5);
// Returns: { success: false, error: 'Amount must be positive' }
```

### InputValidator Class

Static utility class for input validation.

#### `InputValidator.validateAddress(address: string): boolean`

Validates Stacks addresses using regex pattern matching.

```typescript
InputValidator.validateAddress('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'); // true
InputValidator.validateAddress('invalid'); // false
```

#### `InputValidator.validateAmount(amount: string | number): boolean`

Validates numeric amounts are positive numbers.

```typescript
InputValidator.validateAmount(100); // true
InputValidator.validateAmount('50'); // true
InputValidator.validateAmount(-5); // false
```

#### `InputValidator.sanitizeInput(input: string): string`

Sanitizes input by escaping HTML entities.

```typescript
const safe = InputValidator.sanitizeInput('<div>Hello</div>');
// Returns: 'Hello' (tags removed, entities escaped)
```

#### `InputValidator.validate(value: unknown, rule: ValidationRule): ValidationResult`

Generic validator with custom rules.

```typescript
const result = InputValidator.validate('SP2PABAF...', {
  type: 'address',
  required: true
});

const numberResult = InputValidator.validate(50, {
  type: 'number',
  min: 0,
  max: 100
});
```

### Sanitization Functions

#### `sanitizeText(text: string): string`

Comprehensive sanitization pipeline:
1. Strips HTML tags (recursively for nested tags)
2. Removes HTML entities
3. Removes event handlers
4. Removes control characters
5. Trims whitespace

```typescript
const clean = sanitizeText('<<script>alert(1)</script>Hello');
// Returns: 'Hello'

const withEntities = sanitizeText('&lt;script&gt;test');
// Returns: 'test'
```

#### `sanitizeMultilineText(text: string, maxLines?: number): string`

Sanitizes multiline text while preserving line breaks.

```typescript
const clean = sanitizeMultilineText('Line 1\nLine 2\n<script>bad</script>');
// Returns: 'Line 1\nLine 2'

const limited = sanitizeMultilineText('Line 1\nLine 2\nLine 3', 2);
// Returns: 'Line 1\nLine 2' (truncated to 2 lines)
```

#### `sanitizeUrl(url: string): string`

Validates URLs against blocked protocols and returns safe URLs only.

```typescript
sanitizeUrl('https://example.com'); // 'https://example.com'
sanitizeUrl('javascript:alert(1)'); // '' (blocked)
sanitizeUrl('data:text/html,<script>'); // '' (blocked)
sanitizeUrl('/relative/path'); // '/relative/path' (allowed)
```

#### `stripHtmlTags(text: string): string`

Recursively removes all HTML markup.

```typescript
stripHtmlTags('<p>Hello <b>World</b></p>'); // 'Hello World'
stripHtmlTags('<<script>alert(1)</script>'); // 'alert(1)'
```

#### `stripHtmlEntities(text: string): string`

Removes HTML entity references.

```typescript
stripHtmlEntities('&lt;test&gt;'); // 'test'
stripHtmlEntities('&#60;script&#62;'); // 'script'
```

#### `stripEventHandlers(text: string): string`

Removes JavaScript event handler attributes.

```typescript
stripEventHandlers('text onclick=alert(1)'); // 'text'
stripEventHandlers('onload=x onerror=y'); // ''
```

#### `stripControlChars(text: string): string`

Removes non-printable control characters while preserving tab, newline, and carriage return.

#### `truncateText(text: string, maxLength: number): string`

Truncates text with ellipsis if needed.

```typescript
truncateText('This is a long text', 10); // 'This is...'
```

### Security Constants

#### `SECURITY_CONSTANTS`

```typescript
import { SECURITY_CONSTANTS } from '@sfsec/security';

// API origins for CORS
SECURITY_CONSTANTS.ALLOWED_API_ORIGINS; // Hiro API endpoints

// Content limits
SECURITY_CONSTANTS.CONTENT_LIMITS.TITLE_MAX; // 100
SECURITY_CONSTANTS.CONTENT_LIMITS.DESCRIPTION_MAX; // 500
SECURITY_CONSTANTS.CONTENT_LIMITS.COMMENT_MAX; // 280

// Protocol lists
SECURITY_CONSTANTS.SAFE_PROTOCOLS; // ['http:', 'https:', 'mailto:']
SECURITY_CONSTANTS.BLOCKED_PROTOCOLS; // ['javascript:', 'data:', 'vbscript:', 'blob:']

// Stake constants
SECURITY_CONSTANTS.MIN_STAKE_AMOUNT; // 10 STX (10,000,000 microSTX)
SECURITY_CONSTANTS.MIN_STAKE_DISPLAY; // '10'

// Amount limits
SECURITY_CONSTANTS.PROPOSAL_AMOUNT_LIMITS.MIN; // 1 STX
SECURITY_CONSTANTS.PROPOSAL_AMOUNT_LIMITS.MAX; // 1,000,000 STX

// Proposal rules
SECURITY_CONSTANTS.PROPOSAL_RULES.title; // { required: true, minLength: 5, maxLength: 100 }
SECURITY_CONSTANTS.PROPOSAL_RULES.description; // { required: true, minLength: 10, maxLength: 500 }
SECURITY_CONSTANTS.PROPOSAL_RULES.amount; // { required: true, min: 1, max: 1000000 }

// Regex patterns
SECURITY_CONSTANTS.STACKS_ADDRESS_PATTERN; // /^(ST|SP)[A-Z0-9]{39}$/
SECURITY_CONSTANTS.TX_ID_PATTERN; // /^(0x)?[0-9a-f]{64}$/i
```

## Security Best Practices

### 1. Always Validate Input

```typescript
import { InputValidator } from '@sfsec/security';

function processAddress(address: string) {
  if (!InputValidator.validateAddress(address)) {
    throw new Error('Invalid Stacks address');
  }
  // Safe to process
}
```

### 2. Sanitize Before Display

```typescript
import { sanitizeText } from '@sfsec/security';

// User-generated content from blockchain
const userProposal = fetchFromChain();
const safeTitle = sanitizeText(userProposal.title);
const safeDescription = sanitizeMultilineText(userProposal.description);
```

### 3. Use Type Guards

```typescript
import { isPrincipal, isNumber } from '@sfsec/security';

function handleInput(value: unknown) {
  if (isPrincipal(value)) {
    // TypeScript knows value is a valid address string
    return processAddress(value);
  }
  
  if (isNumber(value)) {
    // TypeScript knows value is a number
    return processAmount(value);
  }
}
```

### 4. Validate URLs

```typescript
import { sanitizeUrl } from '@sfsec/security';

const userUrl = getUserInput();
const safeUrl = sanitizeUrl(userUrl);

if (safeUrl) {
  window.location.href = safeUrl;
} else {
  console.error('Blocked dangerous URL');
}
```

### 5. Enforce Content Limits

```typescript
import { SECURITY_CONSTANTS, truncateText } from '@sfsec/security';

const { TITLE_MAX } = SECURITY_CONSTANTS.CONTENT_LIMITS;
const title = truncateText(userInput, TITLE_MAX);
```

## Why This Package?

- **Defense in Depth**: Multiple layers of validation and sanitization
- **Blockchain-Specific**: Tailored for Stacks address formats and Clarity values
- **Zero Dependencies**: No external dependencies for maximum security
- **Battle-Tested**: Extracted from production SprintFund codebase
- **Type-Safe**: Full TypeScript support with strict checking

## Contributing

Issues and pull requests welcome! See the main [SFSec-SDK repository](https://github.com/Mosas2000/SF-SDK).

## License

MIT © SFSec
