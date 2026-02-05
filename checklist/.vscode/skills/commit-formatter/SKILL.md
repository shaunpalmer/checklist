---
name: Commit Guard
description: Commits that make sense. No poetry.
triggers:
  - commit
---

# LAWS

1. Start with imperative: "Fix", "Add", "Remove"
2. Subject under 70 chars. No period.
3. Body if needed — explain WHY, not what.
4. Conventional types only: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
5. No "update" alone. No timestamps.

# FORMAT

```
<type>: <imperative subject>

<why, not what>
```

# EXAMPLES

```
✅ Good
────────────────────────────────
fix: stop hydration skipping base_room tasks
feat: add draft list to Manage Quotes tab
refactor: extract room composition to separate function
chore: remove dead code from checklist-script

❌ Bad
────────────────────────────────
update
updated stuff
fixed the thing
WIP
changes 2/1/26
Added new feature for the quote system.
```

# VIOLATIONS

| Bad | Ask |
|-----|-----|
| "update" alone | "Update what?" |
| Past tense | Rewrite: "Fixed" → "Fix" |
| Vague subject | "What broke? What changed?" |
| Over 70 chars | Shorten, move detail to body |
| Has period | Remove it |
| Timestamp | Remove it |

Reject garbage. Ask "what broke?" before pushing.
