# Agent Memory — AYS Checklist PWA

## Current State (2026-02-09)

### Session Progress
- **Auth system**: PHP login (shaun.palmer0@gmail.com / checklist), CSRF, rate limiting — COMPLETE
- **Variant registry**: `getVariantOptions(key)` + `populateVariantDropdown()` in ITEM_DEFINITIONS.js — COMPLETE
- **Floor types**: 9 total (carpet, lino, tile, wood, laminate, concrete, polished, slate, other) — COMPLETE
- **Hard-guard**: `buildChecklistConfigFor` catch returns null, not stale config — COMPLETE
- **Reaper fixed**: `tools/reaper.ps1` — calls git.exe directly, no cmd.exe wrapper, no reserved $Args — COMPLETE
- **Skills consolidated**: 29 scattered files → single `.github/copilot-skills.md` (17 sections) — COMPLETE
- **QuoteStorage.init() fix**: Was missing `return _initPromise` — first call returned undefined — FIXED
- **Container ID mismatch fix**: `_rebuildRoomsForSnapshot` used `generated-rooms-{type}` but DOM has `rooms-container-{type}` — FIXED
- **Security: HTML → PHP rename**: checklist-modern.html → .php, rubbish-booking.html → .php, auth guards added — FIXED
- **Cache**: `checklist-shell-v12`
- **Latest commit**: `b91c684` on `codex/evaluate-ongoing-repo-sorting-process-nuxz06`

### DevTools Testing Results (2026-02-09)
All buttons tested via Chrome DevTools MCP:
- **PASS**: All 4 service tabs, Quotes tab, Settings tab (7 sub-tabs), Select All, Complete All, disclosure toggles, preset dropdown, Edit Client Info, Calculate Quote, Email, SMS, Send Later, Copy Link, Rubbish toggle, service type dropdown switch
- **EXPECTED BEHAVIOR**: Print (print dialog), Reset All (confirm dialog)
- **FIXED**: 2 console errors that fired on every page load (now zero errors)
- **Known**: Legacy fallback block visible with dev text "remove when Kitchen is generated"

### Skills Architecture (IMPORTANT)
- **SINGLE FILE**: `.github/copilot-skills.md` — ALL skills live here, 17 sections
- **NO SPRAWL**: Do NOT create `.github/skills/` subfolders or separate SKILL.md files
- **Sections**: Core Discipline, AYS Architecture, Drafts & Hydration, Room Composition, Code Quality (design patterns, layered arch, SOLID), Testing, Bug Scanning, Performance, Documentation, Tools & Workflow, Code Excellence, Answer Quality, Playwright, Chrome DevTools, Error Recovery, Migration Safety, Debugging Strategy

### Naming Convention
- `camelCase` or `snake_case` — both OK, be consistent within a file
- **NO DASHES (kebab-case) EVER** in identifiers
- Classes: `PascalCase`, Constants: `SCREAM_CASE`

### Architecture
- **God Object**: `checklist-script.js` (~5,900 lines, ~120 methods)
- **Data Source**: `ITEM_DEFINITIONS.js` — canonical item definitions + variant registry
- **Room Classes**: Bedroom, Bathroom, Kitchen, etc. extend Room base
- **Quote Storage**: IndexedDB via `QuoteStorage.js`
- **Key Invariant**: One active `quoteId`, DB is spine, snapshot is overlay
- **Auth**: PHP sessions, bcrypt, CSRF, file-based users
- **Service Worker**: v11, excludes .php/auth/config/storage
- **Container IDs**: `rooms-container` (EOT), `rooms-container-residential`, `rooms-container-commercial`

### Key Files
| File | Purpose |
|------|---------|
| `checklist-script.js` | Main app logic (God Object) |
| `ITEM_DEFINITIONS.js` | Canonical item definitions + variant registry |
| `QuoteStorage.js` | IndexedDB wrapper for quotes |
| `AysChecklistFormFactory.js` | Form generation (in js/generators/) |
| `AysDisclosureRoomCard.js` | Room card UI component |
| `.github/copilot-skills.md` | ALL agent skills (single file, 17 sections) |
| `tools/reaper.ps1` | Git commit + push routine |

### GitHub Workflow
- **Reaper**: `powershell -File tools/reaper.ps1 -Message "desc" -Push`
- **Branch**: `codex/evaluate-ongoing-repo-sorting-process-nuxz06`
- MCP tools available for GitHub operations

### Upcoming Work
- **Floor scope testing**: "Apply to all rooms" feature
- **Legacy fallback block**: Still visible to users with "remove when Kitchen is generated" text — should be hidden
