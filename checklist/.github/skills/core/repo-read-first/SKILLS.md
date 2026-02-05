# Skill: core.repo.read-first

> **Purpose:** Stop the model "freestyling" and force it to **read the repo before proposing code**.

---

## When to Use

Trigger this skill when:

- User asks to "fix", "change", "update", or "add" something
- User references a bug, feature, or behaviour
- User mentions file names, functions, or UI elements
- Any code modification request

---

## Inputs (Required Context)

Before proposing ANY code change, the model MUST:

1. **Locate** the relevant source files
2. **Read** enough context to understand current behaviour
3. **Identify** the single source of truth for the affected state
4. **Confirm** existing patterns (naming, structure, style)

---

## Hard Rules

### ❌ NEVER

- Invent file paths that don't exist
- Guess class names, selectors, hooks, or IDs
- Assume function signatures without reading them
- Propose "from scratch" rewrites when a patch suffices
- Refactor unrelated code while fixing a bug

### ✅ ALWAYS

- Use `grep_search` or `semantic_search` to find relevant files first
- Read the actual file content before proposing edits
- Prefer minimal diffs over sweeping changes
- Preserve existing code style and patterns
- Verify DOM IDs and selectors exist before referencing them

---

## Process

```
1. IDENTIFY entry points
   → Where does user interaction start?
   → What files handle this feature?

2. IDENTIFY state ownership
   → Who owns this data?
   → Where is it stored? (localStorage, IndexedDB, memory)

3. FIND the single source of truth
   → Don't create competing sources
   → Patch at the source, not the symptom

4. CONFIRM current behaviour
   → Read the actual code
   → Add logging if needed to verify flow

5. PATCH minimally
   → One change at a time
   → Preserve existing structure

6. RE-CHECK
   → Verify the fix doesn't break related code
   → Check for similar patterns that need the same fix
```

---

## Outputs

After reading and before proposing code, state:

1. **Files involved:** (list the files you read)
2. **Current behaviour:** (what the code does now)
3. **Root cause:** (why the bug/gap exists)
4. **Proposed fix:** (minimal patch description)

---

## Anti-Patterns

| Bad | Why | Do Instead |
|-----|-----|------------|
| "I'll create a new file called X.js" | File may already exist | Search first |
| "Add this CSS class .foo" | Class may exist with different rules | Check stylesheet first |
| "Call the function saveData()" | Function signature may differ | Read the actual function |
| "The element #my-button..." | ID may not exist | Verify in HTML first |
| Rewriting 200 lines to fix 1 bug | Introduces risk | Patch the specific issue |

---

## Quick Checklist

Before proposing code changes:

- [ ] Did I search for relevant files?
- [ ] Did I read the actual code (not just assume)?
- [ ] Do the file paths I reference actually exist?
- [ ] Do the function/class/ID names I reference match the code?
- [ ] Is this the minimal change needed?
- [ ] Am I patching at the source of truth?

---

## Related Skills

- `core.patch-discipline` — One change at a time
- `core.debug.protocol` — Systematic debugging
