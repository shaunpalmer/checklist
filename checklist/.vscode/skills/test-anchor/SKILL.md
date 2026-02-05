---
name: Test Anchor
description: If you touch it — test it.
triggers:
  - test this
  - implement
  - refactor
  - fix
---

# LAWS

1. If you touch it — test it.
2. Unit: 1 file = 1 test file.
3. Integration: happy, sad, race.
4. No "works on my machine" — green on first run.

# STRUCTURE

```
src/
├── quote-storage.js
├── draft-hydrator.js
└── room-composer.js

tests/
├── quote-storage.test.js
├── draft-hydrator.test.js
└── room-composer.test.js
```

# COVERAGE RULES

| Change Type | Required Tests |
|-------------|----------------|
| New function | Unit test |
| Bug fix | Regression test |
| Refactor | Existing tests pass |
| New feature | Unit + integration |

# TEST TYPES

```javascript
// UNIT — one function, isolated
describe('getDraft', () => {
  it('should return draft when exists', ...);
  it('should return null when missing', ...);
});

// INTEGRATION — happy path
describe('draft workflow', () => {
  it('should create, save, and load draft', ...);
});

// SAD PATH — failures
describe('error handling', () => {
  it('should handle corrupt data', ...);
  it('should timeout gracefully', ...);
});

// RACE — async edge cases
describe('concurrent access', () => {
  it('should handle simultaneous saves', ...);
});
```

# VIOLATIONS

| Bad | Response |
|-----|----------|
| New function, no test | "Write the test" |
| "I'll add tests later" | "No. Now." |
| Test only happy path | "Add sad + edge" |
| Flaky test | "Fix it or delete it" |

# BEFORE COMMIT

```bash
npm test          # All green?
npm run coverage  # Above 80%?
```

Green on first run. No excuses.
