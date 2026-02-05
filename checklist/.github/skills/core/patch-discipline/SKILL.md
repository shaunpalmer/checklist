# Skill: core.patch-discipline

> **Purpose:** Enforce architectural consistency — patch existing, never duplicate.

---

## Triggers

Activate this skill when user says:

- "extend", "add feature", "new endpoint"
- "refactor", "implement", "fix"
- "add", "create", "build"

---

## Core Rules (Non-Negotiable)

### 1. NEVER Create Duplicates

```
❌ FORBIDDEN:
- Creating files with V2, New, Copy, Backup suffixes
- Creating "alternative" implementations
- Duplicating logic that exists elsewhere
- Creating parallel structures

✅ REQUIRED:
- Update the canonical file
- Extend existing modules
- Refactor in place
```

### 2. SEARCH FIRST, Always

Before ANY change:

1. Search the codebase for existing patterns
2. Read relevant files
3. Match existing styles, naming, folder structure
4. Find the canonical location for this logic

```
If you're about to create something → STOP
Ask: "Does this already exist? Where should it live?"
```

### 3. PATCH, Don't Replace

```javascript
// ❌ Bad: "I'll create a new utility file"
// ✅ Good: "I'll add this to the existing utils.js"

// ❌ Bad: "Here's a new component for that"
// ✅ Good: "I'll extend the existing component"

// ❌ Bad: Full file replacement
// ✅ Good: Minimal diff to existing file
```

### 4. One Change at a Time

- Make a single logical change
- Verify before next change
- Don't bundle unrelated fixes

### 5. Add Guards, Not Assumptions

```javascript
// ❌ Bad: assumes x exists
x.doSomething();

// ✅ Good: guards against undefined
if (!x) return;
x.doSomething();
```

---

## NEVER DO

| Action | Why It's Forbidden |
|--------|-------------------|
| Create `fileV2.js` | Update `file.js` instead |
| Create `newUtils.js` | Extend existing utils |
| Duplicate a function | Refactor original to be reusable |
| Create parallel folder structure | Use existing structure |
| Output full new files | Output diffs/patches |
| Refactor while fixing a bug | Separate concerns |

---

## ALWAYS DO

| Action | Why It's Required |
|--------|------------------|
| Search before creating | Prevents duplicates |
| Read existing code first | Matches patterns |
| Patch in place | Maintains consistency |
| Ask if unsure | "Should I patch or create new?" |
| Preserve existing style | Prevents drift |

---

## Decision Flow

```
User request arrives
       │
       ▼
┌─────────────────────────┐
│ SEARCH: Does this exist?│
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
    YES            NO
     │             │
     ▼             ▼
┌─────────┐  ┌──────────────────────┐
│ PATCH   │  │ Ask: "Create new?"   │
│ existing│  │ or find nearest file │
└─────────┘  └──────────────────────┘
```

---

## Quick Checklist

- [ ] Did I search for existing code first?
- [ ] Am I patching, not creating new?
- [ ] Is this ONE logical change?
- [ ] Did I add guards for edge cases?
- [ ] Am I NOT creating a duplicate?
- [ ] Did I preserve existing code style?

---

## Related Skills

- `core.repo.read-first` — Read before writing
- `core.debug.protocol` — Systematic debugging
