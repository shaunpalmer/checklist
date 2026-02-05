# Skill: core.patch-discipline

> **Purpose:** Prevent spaghetti patches — add one small change at a time with proper guards.

---

## When to Use

Trigger this skill when:

- Implementing a fix or feature
- Making any code modification
- Debugging complex issues

---

## Hard Rules

### ✅ DO

1. **One change at a time**
   - Make a single logical change
   - Test/verify before next change
   - Commit or checkpoint frequently

2. **Add instrumentation first**
   - Before "big" changes, add logging
   - Verify assumptions with console output
   - Remove debug logging after fix confirmed

3. **Add guards, not assumptions**
   ```javascript
   // ❌ Bad: assumes x exists
   x.doSomething();
   
   // ✅ Good: guards against undefined
   if (!x) return;
   x.doSomething();
   ```

4. **Prefer deterministic state transitions**
   - State changes should be explicit
   - Avoid implicit side effects
   - Make state flow traceable

### ❌ DON'T

- Fix multiple unrelated issues in one edit
- Refactor while bug-fixing
- Remove "unnecessary" code while patching
- Change formatting/style alongside logic changes

---

## Quick Checklist

- [ ] Is this ONE logical change?
- [ ] Did I add guards for edge cases?
- [ ] Can I verify this change independently?
- [ ] Am I NOT refactoring at the same time?
- [ ] Did I preserve surrounding code style?

---

## Related Skills

- `core.repo.read-first` — Read before writing
- `core.debug.protocol` — Systematic debugging
