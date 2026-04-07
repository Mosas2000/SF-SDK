/**
 * Security Example: Complete Security Workflow
 * 
 * This example demonstrates a complete security-focused workflow
 * for handling user input and smart contract interactions
 */

import { InputValidator, sanitizeText, sanitizeUrl } from '@sfsec/security';
import { TransactionBuilder, ErrorRecovery } from '@sfsec/contracts';

// Example 1: Validate and Sanitize Proposal Creation
interface ProposalInput {
  title: string;
  description: string;
  amount: number;
  proposerAddress: string;
}

function validateAndSanitizeProposal(input: ProposalInput): ProposalInput | null {
  console.log('\n=== Example 1: Secure Proposal Creation ===');
  console.log('Input received:', JSON.stringify(input, null, 2));
  
  try {
    // Step 1: Validate proposer address
    if (!InputValidator.isPrincipal(input.proposerAddress)) {
      throw new Error('Invalid proposer address');
    }
    console.log('✓ Address validated');
    
    // Step 2: Sanitize and validate title
    const sanitizedTitle = sanitizeText(input.title);
    const validTitle = TransactionBuilder.buildProposalTitle(sanitizedTitle);
    console.log(`✓ Title sanitized: "${validTitle}"`);
    
    // Step 3: Sanitize and validate description
    const sanitizedDesc = sanitizeText(input.description);
    const validDesc = TransactionBuilder.buildProposalDescription(sanitizedDesc);
    console.log(`✓ Description sanitized (${validDesc.length} chars)`);
    
    // Step 4: Validate amount
    const validAmount = TransactionBuilder.buildProposalAmount(input.amount);
    console.log(`✓ Amount validated: ${validAmount} microSTX`);
    
    return {
      title: validTitle,
      description: validDesc,
      amount: validAmount,
      proposerAddress: input.proposerAddress,
    };
  } catch (error) {
    console.error('✗ Validation failed:', error.message);
    return null;
  }
}

// Test with valid input
validateAndSanitizeProposal({
  title: 'Fund Development',
  description: 'This proposal aims to fund the development of new features for our platform.',
  amount: 1000_000_000,
  proposerAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
});

// Test with malicious input
validateAndSanitizeProposal({
  title: '<script>alert("XSS")</script>Malicious Title',
  description: '<<script>script>document.cookie</script>Bad description',
  amount: -1000,
  proposerAddress: 'invalid-address',
});

// Example 2: Secure Comment Handling
function validateComment(comment: string, authorAddress: string): void {
  console.log('\n=== Example 2: Secure Comment Handling ===');
  
  try {
    // Validate author
    if (!InputValidator.isPrincipal(authorAddress)) {
      throw new Error('Invalid author address');
    }
    
    // Sanitize and validate comment
    const sanitized = sanitizeText(comment);
    const valid = TransactionBuilder.buildComment(sanitized);
    
    console.log(`✓ Comment validated (${valid.length} chars): "${valid.substring(0, 50)}..."`);
  } catch (error) {
    console.error('✗ Comment validation failed:', error.message);
  }
}

validateComment('This is a legitimate comment about the proposal.', 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
validateComment('<img src=x onerror=alert(1)>', 'invalid');

// Example 3: Safe URL Processing
function processUserUrl(url: string): void {
  console.log('\n=== Example 3: Safe URL Processing ===');
  console.log(`Original: ${url}`);
  
  const sanitized = sanitizeUrl(url);
  console.log(`Sanitized: ${sanitized}`);
  
  if (sanitized === '') {
    console.log('⚠ Dangerous URL blocked!');
  } else {
    console.log('✓ URL is safe to use');
  }
}

processUserUrl('https://example.com/docs');
processUserUrl('javascript:void(document.cookie="stolen")');
processUserUrl('data:text/html,<script>alert(1)</script>');

console.log('\n🚀 Running Security Examples...\n');
