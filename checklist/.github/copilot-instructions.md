# Copilot Instructions

You are working on the **AYS Checklist PWA** — an offline-first quoting tool for cleaning services.

## Before Any Change

1. **Read first.** Search the codebase before proposing code.
2. **Patch, don't create.** No new files unless I say "NEW FILE".
3. **One change at a time.** Verify before next change.

## Skills Reference

This project uses modular skills in `.vscode/skills/`. **Read the relevant SKILL.md before acting.**

| Trigger | Skill | File |
|---------|-------|------|
| load, hydrate, open | Draft Hydrator | `.vscode/skills/draft-hydrator/SKILL.md` |
| edit, generate, refactor | Arch Drift Guard | `.vscode/skills/arch-drift-guard/SKILL.md` |
| design, render, mode | Invariant Shield | `.vscode/skills/invariant-shield/SKILL.md` |
| rename, export | Naming Enforcer | `.vscode/skills/naming-cop/SKILL.md` |
| commit | Commit Guard | `.vscode/skills/commit-formatter/SKILL.md` |
| push, review, audit | Security Auditor | `.vscode/skills/security-auditor/SKILL.md` |
| refactor, extract | Refactor Safely | `.vscode/skills/refactor-safely/SKILL.md` |
| test, implement | Test Anchor | `.vscode/skills/test-anchor/SKILL.md` |
| generate, review | Code Review Cop | `.vscode/skills/code-review-cop/SKILL.md` |
| design, pattern | Pattern First | `.vscode/skills/solid-patterns/SKILL.md` |
| query, db, sql | Query Gate | `.vscode/skills/query-gate/SKILL.md` |
| import, require, npm | Dependency Hunter | `.vscode/skills/dependency-hunter/SKILL.md` |
| config, env, set | Config Whisperer | `.vscode/skills/config-whisperer/SKILL.md` |

## Core Laws (Always Active)

### No Drift
- NEVER create files with V2, New, Copy, Backup suffixes
- NEVER duplicate logic that exists elsewhere
- ALWAYS search before creating

### Hydration is Sacred
```
1. setJobType(mode)     ← MODE FIRST
2. rebuildRoomList()    ← base_room + addons
3. applyPayload()       ← rooms, client, notes
4. recalcTotals()
5. render()             ← UI LAST
```

### UI is a View
- State is the source of truth
- UI reflects state, never defines it
- Events → State → UI (in that order)

### Room Composition
- EVERY room = `base_room` + addons
- 3-item rooms = base_room was skipped. Fix it.
- Commercial uses `office`, not `bedroom`

## Project Structure

```
checklist/
├── checklist-modern.html      # Main app shell
├── js/
│   ├── checklist-script.js    # Main logic
│   ├── storage/
│   │   └── QuoteStorage.js    # IndexedDB drafts
│   └── components/            # UI components
├── css/
└── docs/                      # Architecture docs
```

## When In Doubt

1. Read the relevant skill file
2. Search for existing code
3. Ask: "Does this break invariants?"
4. Output diffs, not full files

## Local Tools

### QMD (Query Markup Documents)

You have access to a local CLI tool called `qmd` for searching markdown files.
This project has 80+ markdown docs across `docs/`, `.github/skills/`, and `.vscode/skills/`.

**When to use:** Whenever you need to search documentation, find architecture decisions,
check prior session notes, or answer questions about the project's history and design.

**Commands:**
```bash
# Search docs with a natural language query
qmd search "how does property type switching work"

# Search for specific topics
qmd search "hydration contract"
qmd search "offline sync rules"
```

**How it works:**
- Hybrid search: BM25 keyword matching + vector semantic search
- LLM re-ranking: local model ranks results by intent relevance
- Fully on-device: no data leaves the machine
- Pre-indexed: the docs folder is already indexed

**Prefer `qmd search` over `grep_search`** when:
- The query is conceptual (not an exact string match)
- You need to find information across many markdown files
- You want ranked results by relevance, not just keyword hits
