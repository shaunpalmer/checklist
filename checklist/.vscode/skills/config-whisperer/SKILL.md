---
name: Config Whisperer
description: One source of truth for all config. No hard codes.
triggers:
  - set
  - env
  - config
  - settings
---

# LAWS

1. One source: `config.js` or `.env`
2. No hard codes. Ever.
3. Validate on load. Fail fast.
4. Secrets only via `process.env` or vault.

# STRUCTURE

```
config/
├── config.js        # Runtime config, reads from .env
├── defaults.js      # Default values
└── validate.js      # Schema validation

.env                 # Local secrets (gitignored)
.env.example         # Template (committed)
```

# USAGE

```javascript
// ✅ Correct
import { config } from './config/config.js';
const apiUrl = config.API_URL;
const maxRetries = config.MAX_RETRIES;

// ❌ Forbidden
const apiUrl = "https://api.example.com";
const maxRetries = 3;
```

# VALIDATION

```javascript
// config.js
const config = {
  API_URL: process.env.API_URL,
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES, 10) || 3,
};

// Fail fast
if (!config.API_URL) {
  throw new Error('Missing required config: API_URL');
}

export { config };
```

# VIOLATIONS

| Bad | Response |
|-----|----------|
| `const url = "https://..."` | "Move to config" |
| `const limit = 100` | "Is this configurable? Move it." |
| Secret in code | "Use .env" |
| No validation | "Add fail-fast check" |

# .env.example

```bash
# API
API_URL=
API_KEY=

# Limits
MAX_RETRIES=3
TIMEOUT_MS=5000
```

No magic. No guessing. Fail fast.
