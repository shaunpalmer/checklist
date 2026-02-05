---
name: Dependency Hunter
description: No rogue imports. Every dep is deliberate.
triggers:
  - import
  - use lib
  - inject
  - require
  - npm
---

# LAWS

1. No importing third-party unless listed in `deps.md` first.
2. If you need new lib: say "new dep lodash-es" → I add to list, say "npm add", then we use.
3. No global requires. No `eval("require")`.
4. All deps version-pinned.

# WORKFLOW

```
Need a new dependency?
        │
        ▼
1. Add to deps.md with justification
        │
        ▼
2. Run: npm add <package>@<version> --save-exact
        │
        ▼
3. Import in code
        │
        ▼
Done. Tracked. Pinned.
```

# deps.md FORMAT

```markdown
# Dependencies

| Package | Version | Why |
|---------|---------|-----|
| idb | 7.1.1 | IndexedDB wrapper for drafts |
| uuid | 9.0.0 | Generate draft IDs |
```

# VIOLATIONS

| Bad | Response |
|-----|----------|
| `import _ from 'lodash'` (not in deps.md) | "Add to deps.md first" |
| `require('surprise-package')` | "Not listed. Justify it." |
| `"lodash": "^4.0.0"` | "Pin it: 4.17.21" |
| `eval("require('x')")` | "No. Never." |

# VERSION PINNING

```json
// ❌ Bad
"lodash": "^4.17.0"
"uuid": "~9.0.0"

// ✅ Good
"lodash": "4.17.21"
"uuid": "9.0.0"
```

No surprises. No drift.
