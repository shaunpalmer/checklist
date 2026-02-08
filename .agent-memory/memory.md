# Agent Memory — AYS Checklist PWA

## Current State (2026-02-07)

### ✅ Boot Sequence Fix — COMPLETE
- `initQuoteStorage()` returns Promise
- `init()` chains DB-dependent calls in `.finally()`
- Pattern: DB verify → Snapshot overlay → Manager UI
- Commits: `6f764c8` (code), `bbcfcb7` (docs)

### Architecture
- **God Object**: `checklist-script.js` (~5,700 lines, ~120 methods)
- **Data Source**: `ITEM_DEFINITIONS.js` — canonical item definitions
- **Room Classes**: Bedroom, Bathroom, Kitchen, etc. extend Room base
- **Quote Storage**: IndexedDB via `QuoteStorage.js`
- **Key Invariant**: One active `quoteId`, DB is spine, snapshot is overlay

### Key Files
| File | Purpose |
|------|---------|
| `checklist-script.js` | Main app logic (God Object) |
| `ITEM_DEFINITIONS.js` | Canonical item definitions by service type |
| `QuoteStorage.js` | IndexedDB wrapper for quotes |
| `AysQuoteEnvelope.js` | Quote data envelope for sync |
| `AysChecklistFormFactory.js` | Form generation |
| `AysDisclosureRoomCard.js` | Room card UI component |

### Skills & Conventions
- **Location**: `.github/skills.md`
- Read repo before proposing changes
- One small change at a time
- Add guards, not assumptions
- UI reflects truth, doesn't define it

### GitHub Workflow
- **Reaper script**: `tools/reaper.ps1` — stages, commits, pushes
- **Branch**: `codex/evaluate-ongoing-repo-sorting-process-nuxz06`
- MCP tools available for GitHub operations

### Next Up (Safe Incremental Migrations)
**Full plan**: [SAFE-INCREMENTAL-MIGRATIONS.md](../checklist/docs/SAFE-INCREMENTAL-MIGRATIONS.md)

1. **Phase 1**: Schema versioning at boundaries (Envelope, DB, Worker queue)
2. **Phase 2**: `ensureQuoteIdentity()` canonical function  
3. **Phase 3**: Decompose God Object into modules:
   - ChecklistVoice → ChecklistCustomItems → ChecklistSettings → ChecklistSync → ChecklistQuote → ChecklistState → ChecklistUI

### Docs Reference
- `LOADING-ORDER.md` — Boot sequence
- `BOOT-SEQUENCE-FIX.md` — DB-first pattern
- `ARCHITECTURE.md` — System overview
- `skills.md` — Coding conventions
