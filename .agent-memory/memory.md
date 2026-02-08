# Agent Memory — AYS Checklist PWA

## Current State (2026-02-09)

### Session Progress
- **Auth system**: PHP login (shaun.palmer0@gmail.com / checklist), CSRF, rate limiting — COMPLETE
- **Variant registry**: `getVariantOptions(key)` + `populateVariantDropdown()` in ITEM_DEFINITIONS.js — COMPLETE
- **Floor types**: 9 total (carpet, lino, tile, wood, laminate, concrete, polished, slate, other) — COMPLETE
- **Hard-guard**: `buildChecklistConfigFor` catch returns null, not stale config — COMPLETE
- **Reaper fixed**: `tools/reaper.ps1` — calls git.exe directly, no cmd.exe wrapper, no reserved $Args — COMPLETE
- **Skills consolidated**: 29 scattered files → single `.github/copilot-skills.md` — COMPLETE
- **Cache**: `checklist-shell-v10`
- **Latest commit**: `74f2481` on `codex/evaluate-ongoing-repo-sorting-process-nuxz06`

### Skills Architecture (IMPORTANT)
- **SINGLE FILE**: `.github/copilot-skills.md` — ALL skills live here, top to bottom
- **NO SPRAWL**: Do NOT create `.github/skills/` subfolders or separate SKILL.md files
- **7 sections**: Core Discipline, AYS Architecture, Drafts & Hydration, Room Composition, Code Quality, Testing, Tools & Workflow
- **Tools section**: Reaper (7.1), GitHub MCP (7.2), QMD Search (7.3)
- **Agent Skills extension**: User has VS Code extension `agentSkills` for marketplace browsing — but we keep our skills in one file
- **TODO**: Add bug scanning, performance, documentation skills to copilot-skills.md

### Naming Convention
- `camelCase` or `snake_case` — both OK, be consistent within a file
- **NO DASHES (kebab-case) EVER** in identifiers
- Classes: `PascalCase`, Constants: `SCREAM_CASE`

### Architecture
- **God Object**: `checklist-script.js` (~5,700 lines, ~120 methods)
- **Data Source**: `ITEM_DEFINITIONS.js` — canonical item definitions + variant registry
- **Room Classes**: Bedroom, Bathroom, Kitchen, etc. extend Room base
- **Quote Storage**: IndexedDB via `QuoteStorage.js`
- **Key Invariant**: One active `quoteId`, DB is spine, snapshot is overlay
- **Auth**: PHP sessions, bcrypt, CSRF, file-based users
- **Service Worker**: v10, excludes .php/auth/config/storage

### Key Files
| File | Purpose |
|------|---------|
| `checklist-script.js` | Main app logic (God Object) |
| `ITEM_DEFINITIONS.js` | Canonical item definitions + variant registry |
| `QuoteStorage.js` | IndexedDB wrapper for quotes |
| `AysChecklistFormFactory.js` | Form generation |
| `AysDisclosureRoomCard.js` | Room card UI component |
| `.github/copilot-skills.md` | ALL agent skills (single file) |
| `tools/reaper.ps1` | Git commit + push routine |

### GitHub Workflow
- **Reaper**: `powershell -File tools/reaper.ps1 -Message "desc" -Push`
- **Branch**: `codex/evaluate-ongoing-repo-sorting-process-nuxz06`
- MCP tools available for GitHub operations

### Upcoming Work
- **Floor scope testing**: "Apply to all rooms" feature
- **Add skills**: Bug scanning, performance (PWA/mobile), documentation
- **Beef up**: Code review (diff analysis) and security (proactive scanning) sections
