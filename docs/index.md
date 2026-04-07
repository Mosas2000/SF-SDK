---
layout: home

hero:
  name: SFSec SDK
  text: Security-Focused Stacks Development
  tagline: Build secure applications on Stacks blockchain
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Mosas2000/SF-SDK

features:
    title: Security First  - icon: 
    details: Built-in input validation, sanitization, and XSS protection.
  
  - icon: 
    title: High Performance
    details: Efficient caching, rate limiting, and optimized API calls.
  
    title: Type Safe  - icon: 
    details: Full TypeScript support with strict type checking.
  
    title: Modular Design  - icon: 
    details: Four specialized packages that work together seamlessly.
  
    title: Well Tested  - icon: 
    details: 248+ passing tests across all packages.
  
    title: Great DX  - icon: 
    details: Clear documentation and intuitive APIs.
---

## Quick Start

```bash
npm install @sfsec/core @sfsec/security
```

```typescript
import { StacksClient } from '@sfsec/core';
import { InputValidator } from '@sfsec/security';

const client = new StacksClient();
const isValid = InputValidator.isPrincipal(address);
```
