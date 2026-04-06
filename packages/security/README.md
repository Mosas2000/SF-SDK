# @sfsec/security

Security utilities for the SFSec SDK, providing comprehensive input validation and sanitization for Stacks blockchain applications.

## Features

- ✅ **Input Validation**: Validate addresses, amounts, and user inputs
- ✅ **Sanitization**: XSS prevention through aggressive HTML stripping
- ✅ **Security Constants**: CSP policies, content limits, and safe protocols
- ✅ **Type-Safe**: Full TypeScript support with strict types

## Installation

```bash
npm install @sfsec/security
```

## Quick Start

```typescript
import { InputValidator, sanitizeText } from '@sfsec/security';

// Validate Stacks address
const isValid = InputValidator.validateAddress('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9');

// Validate amount
const isValidAmount = InputValidator.validateAmount(100);

// Sanitize user input
const safe = sanitizeText('<script>alert("xss")</script>Hello');
// Returns: 'Hello'
```

## API Documentation

### InputValidator

#### `validateAddress(address: string): boolean`

Validates a Stacks blockchain address.

```typescript
InputValidator.validateAddress('SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'); // true
InputValidator.validateAddress('invalid'); // false
```

#### `validateAmount(amount: string | number): boolean`

Validates a numeric amount.

```typescript
InputValidator.validateAmount(100); // true
InputValidator.validateAmount(-5); // false
```

#### `sanitizeInput(input: string): string`

Sanitizes and escapes user input.

### Sanitization Functions

#### `sanitizeText(text: string): string`

Removes all HTML tags and dangerous content.

#### `sanitizeMultilineText(text: string): string`

Sanitizes multiline text while preserving line breaks.

#### `stripHtmlTags(text: string): string`

Removes all HTML markup.

## Security Best Practices

1. **Always validate input** before processing
2. **Sanitize before display** to prevent XSS
3. **Use security constants** for CSP and content limits
4. **Never trust user input** - defense in depth

## License

MIT © SFSec
