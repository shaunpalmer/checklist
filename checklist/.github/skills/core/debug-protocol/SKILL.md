# Skill: core.debug.protocol

> **Purpose:** A repeatable debugging recipe that works across JS, TS, PHP.

---

## When to Use

Trigger this skill when:

- User reports a bug or unexpected behaviour
- Something "doesn't work" or "stopped working"
- State appears corrupted or out of sync
- UI shows wrong data or wrong state

---

## Process (Follow This Order)

```
1. REPRO STEPS
   → Can you reproduce the bug?
   → What exact sequence triggers it?

2. EXPECTED vs ACTUAL
   → What should happen?
   → What actually happens?

3. IDENTIFY SOURCE OF TRUTH
   → Where is this data supposed to come from?
   → Is it IndexedDB? localStorage? Memory? Server?

4. ADD LOGGING AT BOUNDARIES
   → Log inputs and outputs at key functions
   → Log state before and after transitions

5. VALIDATE EVENT FLOW
   → Are events firing?
   → In the right order?
   → With the right data?

6. VALIDATE DATA SHAPE
   → Is the data structure what you expect?
   → Are fields named correctly?
   → Are types correct?

7. PATCH
   → Fix at the source, not the symptom
   → One change at a time

8. RETEST
   → Does the fix work?
   → Did it break anything else?
```

---

## Logging Template

```javascript
console.log('[DEBUG] functionName:', {
  input: inputValue,
  state: currentState,
  timestamp: Date.now()
});

// After operation
console.log('[DEBUG] functionName result:', {
  output: result,
  newState: updatedState
});
```

---

## Hard Rules

### ✅ DO

- Reproduce before fixing
- Log at function boundaries
- Verify data shape matches expectations
- Fix at the source, not symptoms
- Remove debug logging after fix confirmed

### ❌ DON'T

- Guess at the cause
- Fix symptoms without understanding root cause
- Add multiple fixes at once
- Leave debug logging in production code

---

## Quick Checklist

- [ ] Can I reproduce it?
- [ ] Do I know expected vs actual?
- [ ] Have I identified the source of truth?
- [ ] Have I added logging at boundaries?
- [ ] Is the data shape correct?
- [ ] Did I patch at the source?
- [ ] Did I remove debug logging?

---

## Related Skills

- `core.repo.read-first` — Read before patching
- `core.patch-discipline` — One fix at a time
