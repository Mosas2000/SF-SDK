/**
 * Basic Example: Input Validation and Sanitization
 * 
 * This example demonstrates basic security features of @sfsec/security
 */

import { InputValidator, sanitizeText, sanitizeUrl } from '@sfsec/security';

// Example 1: Validate Stacks Address
function validateUserAddress(address: string): void {
  console.log('\n=== Example 1: Address Validation ===');
  
  if (InputValidator.isPrincipal(address)) {
    console.log(`✓ Valid address: ${address}`);
  } else {
    console.log(`✗ Invalid address: ${address}`);
  }
}

// Test with valid and invalid addresses
validateUserAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'); // Valid
validateUserAddress('invalid-address'); // Invalid

// Example 2: Sanitize User Input
function sanitizeUserInput(input: string): string {
  console.log('\n=== Example 2: Input Sanitization ===');
  console.log('Original:', input);
  
  const sanitized = sanitizeText(input);
  console.log('Sanitized:', sanitized);
  
  return sanitized;
}

// Test with malicious input
sanitizeUserInput('<script>alert("XSS")</script>Hello');
sanitizeUserInput('<<script>script>alert(1)</script>');

// Example 3: Validate Amounts
function validateAmount(amount: number): void {
  console.log('\n=== Example 3: Amount Validation ===');
  
  if (InputValidator.isValidAmount(amount)) {
    console.log(`✓ Valid amount: ${amount}`);
  } else {
    console.log(`✗ Invalid amount: ${amount}`);
  }
}

validateAmount(1000); // Valid
validateAmount(-100); // Invalid
validateAmount(NaN); // Invalid

// Example 4: Validate Content
function validateContent(title: string, description: string): void {
  console.log('\n=== Example 4: Content Validation ===');
  
  const titleValid = InputValidator.isValidTitle(title);
  const descValid = InputValidator.isValidDescription(description);
  
  console.log(`Title (${title.length} chars): ${titleValid ? '✓' : '✗'}`);
  console.log(`Description (${description.length} chars): ${descValid ? '✓' : '✗'}`);
}

validateContent('Valid Title', 'This is a valid description with enough characters');
validateContent('ab', 'short'); // Too short

// Example 5: Sanitize URLs
function sanitizeUserUrl(url: string): void {
  console.log('\n=== Example 5: URL Sanitization ===');
  console.log('Original:', url);
  
  const sanitized = sanitizeUrl(url);
  console.log('Sanitized:', sanitized);
}

sanitizeUserUrl('https://example.com');
sanitizeUserUrl('javascript:alert(1)'); // Dangerous protocol

// Run all examples
console.log('🚀 Running Basic Security Examples...\n');
