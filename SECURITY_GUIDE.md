# Security Guide

**Security best practices for SFSec SDK**

This guide covers security considerations, validation patterns, and best practices when using the SFSec SDK.

## Table of Contents

- [Security Philosophy](#security-philosophy)
- [Input Validation](#input-validation)
- [Content Sanitization](#content-sanitization)
- [Smart Contract Security](#smart-contract-security)
- [Error Handling](#error-handling)
- [Security Checklist](#security-checklist)
- [Common Vulnerabilities](#common-vulnerabilities)

## Security Philosophy

The SFSec SDK is built with a **security-first approach**:

1. **Defense in Depth** - Multiple layers of security controls
2. **Fail Secure** - Default to safe behavior on errors
3. **Least Privilege** - Minimal permissions and access
4. **Input Validation** - Validate all user input
5. **Output Encoding** - Sanitize all output
6. **Security by Default** - Secure configurations out of the box

## Input Validation

### Stacks Address Validation

Always validate Stacks addresses before using them:

```typescript
import { InputValidator } from '@sfsec/security';

// ✅ GOOD: Validate before use
if (!InputValidator.isPrincipal(userAddress)) {
  throw new Error('Invalid Stacks address');
}
const address = userAddress;

// ❌ BAD: Using without validation
const address = userAddress; // Could be malicious
```

**Pattern:**
- Mainnet: `SP` prefix + 39 alphanumeric characters
- Testnet: `ST` prefix + 39 alphanumeric characters
- Total length: 41 characters

### Transaction ID Validation

Validate transaction IDs to prevent injection:

```typescript
import { InputValidator } from '@sfsec/security';

// ✅ GOOD: Validate transaction ID
if (!InputValidator.isValidTxId(txId)) {
  throw new Error('Invalid transaction ID');
}

// Transaction IDs are 64 hex characters with optional 0x prefix
```

### Amount Validation

Always validate numeric amounts:

```typescript
import { InputValidator } from '@sfsec/security';

// ✅ GOOD: Comprehensive validation
if (!InputValidator.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}

// Checks for:
// - Positive numbers
// - No NaN or Infinity
// - Reasonable limits
```

### Content Validation

Validate user-generated content:

```typescript
import { InputValidator } from '@sfsec/security';

// Title validation (3-100 characters)
if (!InputValidator.isValidTitle(title)) {
  throw new Error('Title must be 3-100 characters');
}

// Description validation (10-500 characters)
if (!InputValidator.isValidDescription(description)) {
  throw new Error('Description must be 10-500 characters');
}

// Comment validation (1-280 characters)
if (!InputValidator.isValidComment(comment)) {
  throw new Error('Comment must be 1-280 characters');
}
```

## Content Sanitization

### XSS Prevention

Always sanitize user input to prevent XSS attacks:

```typescript
import { sanitizeText, sanitizeUrl } from '@sfsec/security';

// ✅ GOOD: Sanitize before display or storage
const cleanTitle = sanitizeText(userInput);
const cleanUrl = sanitizeUrl(userProvidedUrl);

// ❌ BAD: Direct use of user input
element.innerHTML = userInput; // XSS vulnerability!
```

### Sanitization Features

The `sanitizeText` function provides:

1. **HTML Tag Removal** - Strips all HTML tags (including nested)
2. **Event Handler Removal** - Removes onclick, onerror, etc.
3. **Entity Decoding** - Prevents double-encoding attacks
4. **Control Character Removal** - Strips dangerous control characters
5. **Whitespace Normalization** - Collapses excessive whitespace

```typescript
import { sanitizeText } from '@sfsec/security';

// Handles nested attacks
const malicious = '<<script>alert("XSS")</script>';
const clean = sanitizeText(malicious); // Returns: 'alert("XSS")'

// Handles event handlers
const attack = '<img src=x onerror="alert(1)">';
const safe = sanitizeText(attack); // Strips all HTML and events
```

### URL Sanitization

Validate and sanitize URLs:

```typescript
import { sanitizeUrl } from '@sfsec/security';

// ✅ GOOD: Sanitize URLs
const safeUrl = sanitizeUrl(userProvidedUrl);

// Blocked protocols:
// - javascript:
// - data:
// - vbscript:
// - blob:
```

### Security Constants

Use built-in security limits:

```typescript
import { 
  MIN_STAKE_AMOUNT,
  TITLE_MAX,
  DESCRIPTION_MAX,
  COMMENT_MAX,
  BLOCKED_PROTOCOLS
} from '@sfsec/security';

// Enforce minimum stake
if (amount < MIN_STAKE_AMOUNT) {
  throw new Error(`Minimum stake is ${MIN_STAKE_AMOUNT} microSTX`);
}

// Check content limits
if (title.length > TITLE_MAX) {
  throw new Error(`Title exceeds ${TITLE_MAX} characters`);
}
```

## Smart Contract Security

### Transaction Validation

Validate transaction parameters before submission:

```typescript
import { TransactionBuilder } from '@sfsec/contracts';

// ✅ GOOD: Use transaction builders
const amount = TransactionBuilder.buildStakeAmount(userInput);
const title = TransactionBuilder.buildProposalTitle(userTitle);

// Throws errors for invalid input
// Automatically validates and sanitizes
```

### Response Validation

Validate contract responses:

```typescript
import { ContractResponseHandler } from '@sfsec/contracts';

// ✅ GOOD: Validate responses
const count = ContractResponseHandler.extractProposalCount(response);

if (ContractResponseHandler.isValidProposalResponse(data)) {
  // Type-safe access to proposal data
  console.log(data.title);
}

// ❌ BAD: Direct access without validation
const title = response.title; // Could be undefined or malicious
```

### Error Handling

Implement proper error handling for contract calls:

```typescript
import { ErrorRecovery } from '@sfsec/contracts';

try {
  await contractCall();
} catch (error) {
  if (ErrorRecovery.isRetryable(error)) {
    // Retry with exponential backoff
    const delay = ErrorRecovery.getRetryDelay(attemptNumber);
    await new Promise(resolve => setTimeout(resolve, delay));
    await contractCall(); // Retry
  } else if (ErrorRecovery.isAuthError(error)) {
    // Handle authentication separately
    console.error('Please connect your wallet');
  } else {
    // Fatal error
    throw error;
  }
}
```

### Transaction Polling

Use secure polling with timeouts:

```typescript
import { pollTxStatus } from '@sfsec/contracts';

// ✅ GOOD: Configure timeouts and limits
const result = await pollTxStatus(
  txId,
  fetchStatus,
  {
    maxAttempts: 60,        // Don't poll forever
    intervalMs: 10_000,      // Reasonable interval
    useExponentialBackoff: true  // Reduce server load
  }
);

// ❌ BAD: Infinite polling
while (true) {
  const status = await fetchStatus(txId); // Never stops!
  if (status === 'success') break;
}
```

## Error Handling

### Secure Error Messages

Don't leak sensitive information in errors:

```typescript
// ✅ GOOD: Generic error messages
throw new Error('Invalid input');
throw new Error('Transaction failed');

// ❌ BAD: Leaking information
throw new Error(`User ${userId} at ${ipAddress} failed auth`);
throw new Error(`Database query: ${sqlQuery} failed`);
```

### Error Recovery

Implement graceful degradation:

```typescript
import { InputValidator } from '@sfsec/security';

// ✅ GOOD: Fail securely
function processInput(input: string): string {
  try {
    if (!InputValidator.isValidTitle(input)) {
      return ''; // Safe default
    }
    return sanitizeText(input);
  } catch (error) {
    console.error('Sanitization failed:', error);
    return ''; // Fail secure
  }
}

// ❌ BAD: Fail insecurely
function processInput(input: string): string {
  return sanitizeText(input); // No validation, no error handling
}
```

## Security Checklist

### Before Deployment

- [ ] All user input validated
- [ ] All output sanitized
- [ ] No hardcoded secrets or API keys
- [ ] Error messages don't leak information
- [ ] Security audit completed (`npm audit`)
- [ ] Dependencies up to date
- [ ] HTTPS enforced for all connections
- [ ] Rate limiting implemented
- [ ] Authentication/authorization in place
- [ ] Logging configured (without sensitive data)

### Code Review Checklist

- [ ] Input validation for all user data
- [ ] Output encoding for all display data
- [ ] Proper error handling
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] Secure session management
- [ ] Proper access controls
- [ ] Cryptographic operations using standard libraries
- [ ] Security headers configured

### Testing Checklist

- [ ] Fuzzing tests for input validation
- [ ] XSS attack tests
- [ ] SQL injection tests (if applicable)
- [ ] Authentication bypass tests
- [ ] Authorization tests
- [ ] Rate limiting tests
- [ ] Error handling tests
- [ ] Boundary condition tests

## Common Vulnerabilities

### 1. Cross-Site Scripting (XSS)

**Attack:**
```typescript
// Attacker input
const malicious = '<script>alert(document.cookie)</script>';
element.innerHTML = malicious; // VULNERABLE!
```

**Defense:**
```typescript
import { sanitizeText } from '@sfsec/security';

const safe = sanitizeText(malicious);
element.textContent = safe; // Safe
```

### 2. Input Validation Bypass

**Attack:**
```typescript
// Attacker provides negative amount
const amount = -1000; // Bypass minimum stake
```

**Defense:**
```typescript
import { InputValidator } from '@sfsec/security';

if (!InputValidator.isValidAmount(amount)) {
  throw new Error('Invalid amount');
}
```

### 3. Transaction Replay

**Attack:**
- Resubmit valid transaction to drain funds

**Defense:**
```typescript
// Use nonces or timestamps
const nonce = Date.now();
const tx = {
  ...transactionData,
  nonce,
};
```

### 4. Reentrancy

**Attack:**
- Recursive calls to drain contract

**Defense:**
- Use checks-effects-interactions pattern
- Implement reentrancy guards in contracts
- Validate state before and after calls

### 5. Integer Overflow/Underflow

**Attack:**
```typescript
const maxInt = Number.MAX_SAFE_INTEGER;
const overflow = maxInt + 1; // Wraps around
```

**Defense:**
```typescript
if (amount > Number.MAX_SAFE_INTEGER) {
  throw new Error('Amount too large');
}

// Use BigInt for large numbers
const safe = BigInt(amount);
```

## Best Practices Summary

1. **Validate Everything**
   - All user input
   - All contract responses
   - All external data

2. **Sanitize Output**
   - Before display
   - Before storage
   - Before transmission

3. **Fail Securely**
   - Return safe defaults
   - Log errors securely
   - Don't expose internals

4. **Use Type Safety**
   - TypeScript strict mode
   - Type guards
   - Runtime validation

5. **Defense in Depth**
   - Multiple validation layers
   - Client and server validation
   - Contract-level checks

6. **Keep Dependencies Updated**
   - Regular `npm audit`
   - Snyk scanning
   - Automated updates

7. **Monitor and Log**
   - Security events
   - Failed validations
   - Unusual patterns
   - (Without logging sensitive data)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email: security@sfsec.example.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stacks Security Best Practices](https://docs.stacks.co/docs/clarity/security)
- [NPM Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/security.html)

---

**Remember: Security is everyone's responsibility. When in doubt, validate and sanitize!**
