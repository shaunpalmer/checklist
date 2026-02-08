# Copilot Instructions

You are working on the **AYS Checklist PWA** — an offline-first quoting tool for cleaning services.

## Before Any Change

1. **Read first.** Search the codebase before proposing code.
2. **Patch, don't create.** No new files unless I say "NEW FILE".
3. **One change at a time.** Verify before next change.

## Skills Reference

**All skills live in one file:** `.github/copilot-skills.md` — read it top to bottom before acting.

Do NOT look for separate SKILL.md files — they were consolidated. One file, no sprawl.

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
This project has 80+ markdown docs in `docs/` and skills in `.github/copilot-skills.md`.

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
