---
name: Naming Enforcer
description: Names matter. Keep 'em tight.
triggers:
  - rename
  - generate
  - export
  - refactor
---

# LAWS

1. Variables/functions: `snake_case`
2. Classes/types: `PascalCase`
3. Constants: `SCREAM_CASE`
4. No `i`, `x`, `foo` — spell it. Unless it's `url` or `id`.
5. No numbers in names. No plurals in vars.
6. Rename only what I ask. Log old → new.
7. Lint on save.

# EXAMPLES

```
✅ Good                    ❌ Bad
──────────────────────────────────────
draft_id                   draftId, draftID, i
QuoteStorage (class)       quoteStorage (class)
get_active_draft()         getActiveDraft(), gad()
MAX_RETRIES (const)        maxRetries (const)
customer_name              customerName, cn, name1
```

# VIOLATIONS

If I try to:
- Use `i` or `x` → Ask: "Spell it out. What is this?"
- Use camelCase → Correct to snake_case
- Add numbers → "No numbers in names."
- Rename working code → "Why? This works."

# RENAMES

When renaming, always log:

```
OLD: getActiveDraft
NEW: get_active_draft
```

Never rename without showing the diff.

