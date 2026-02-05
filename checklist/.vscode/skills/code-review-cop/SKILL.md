---
name: Code Review Cop
description: No ugly code slips past.
triggers:
  - refactor
  - generate
  - commit
---

# LAWS

1. One responsibility per function. No gods.
2. Ask "what does this do?" — if you hesitate, break it.
3. Prefer clarity over clever. No ternary hell.
4. Magic numbers → name them. Magic strings → constant.
5. Output only diffs. Say what changed.
6. If over 5 lines → maybe split it.

Always pretend someone else owns it.

# RED FLAGS

| Smell | Fix |
|-------|-----|
| Function does 3 things | Split into 3 functions |
| Nested ternaries | Use if/else |
| `if (status === 2)` | `if (status === STATUS_PENDING)` |
| 50-line function | Extract helpers |
| `data`, `stuff`, `thing` | Name what it actually is |
| Copy-pasted block | Extract to shared function |

# EXAMPLES

```javascript
// ❌ Ugly
const x = a ? (b ? c : d) : (e ? f : g);

// ✅ Clear
if (a) {
  return b ? c : d;
}
return e ? f : g;
```

```javascript
// ❌ Magic
if (retries > 3) { ... }

// ✅ Named
const MAX_RETRIES = 3;
if (retries > MAX_RETRIES) { ... }
```

# REVIEW CHECKLIST

- [ ] Can I explain this in one sentence?
- [ ] Would I understand this in 6 months?
- [ ] Are there magic values?
- [ ] Is anything repeated?
- [ ] Is any function doing too much?

# OUTPUT

Always show:
```
CHANGED: functionName
WHY: was doing X and Y, now only does X
DIFF: [minimal diff]
```
