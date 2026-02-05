---
name: Refactor Safely
description: Extract step-by-step. Preserve behavior.
triggers:
  - refactor
  - extract
  - split
  - reorganize
---

# LAWS

1. One extraction at a time
2. Preserve behavior — tests must pass before/after
3. Show before/after diff
4. Ask before big changes
5. Never refactor while fixing bugs

# PROCESS

```
1. IDENTIFY what to extract
       ↓
2. WRITE test for current behavior (if missing)
       ↓
3. EXTRACT to new function/module
       ↓
4. VERIFY tests still pass
       ↓
5. SHOW diff: before → after
       ↓
6. COMMIT separately from feature work
```

# SAFE EXTRACTIONS

| Safe | Dangerous |
|------|-----------|
| Extract function | Rewrite from scratch |
| Rename variable | Change data structure |
| Move to new file | Merge unrelated code |
| Split large function | Change public API |

# OUTPUT FORMAT

Always show:

```
BEFORE:
function bigFunction() {
  // 50 lines
}

AFTER:
function bigFunction() {
  doPartA();
  doPartB();
}

function doPartA() { ... }
function doPartB() { ... }
```

# VIOLATIONS

- Refactoring + bug fix in same commit → Split them
- No tests before refactor → Write test first
- "While I'm here..." → Stop. Separate PR.
