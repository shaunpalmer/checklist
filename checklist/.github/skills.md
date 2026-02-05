# VS Code Agent Skills — AYS Checklist

## Core Skills (Portable)

### core.repo.read-first

**Purpose:** Stop freestyling — read the repo before proposing code.

**Hard Rules:**
- Always locate and read relevant files before recommending changes
- Never invent file paths, class names, selectors, hooks, or UI IDs
- Prefer minimal diffs — do not refactor unless requested

**Process:**
1. Identify entry points
2. Identify state ownership
3. Find the single source of truth
4. Confirm current behaviour with logs/guards
5. Patch, then re-check

---

### core.patch-discipline

**Purpose:** Prevent spaghetti patches.

**Hard Rules:**
- One small change at a time
- Add instrumentation before "big" changes
- Add guards (`if (!x) return;`) not assumptions
- Prefer deterministic state transitions

---

### core.debug.protocol

**Purpose:** Repeatable debugging recipe.

**Process:**
1. Repro steps
2. Expected vs actual
3. Identify source of truth
4. Add logging at boundaries
5. Validate event flow
6. Validate data shape
7. Patch
8. Retest

---

### core.ui-state.contracts

**Purpose:** Consistent UI mode switching.

**Hard Rules:**
- UI tabs do not *define* truth, they *reflect* truth
- Mode changes are events that must be persisted
- Hydration must update both internal state AND visible UI controls

---

## AYS Project Skills (Repo-Local)

### ays.quotes.persistence

**Target Behaviour:**
- Up to 5+ drafts/day without breaking
- Drafts persist across phone lock, app refresh, short offline periods
- Auto-cleanup: delete synced drafts after 14 days, unsynced stale drafts after 30 days

**Hard Rules:**
- Drafts MUST be loadable into the form (full hydration)
- "Current draft" must be explicit (single source of truth)
- Mode switch that changes structure must either create new draft OR migrate via defined conversion path

---

### ays.quotes.hydration

**Contract — A draft load MUST:**
1. Set `activeDraftId`
2. Set `quoteType` (end_of_tenancy | residential | commercial | custom)
3. Load base defaults (base-room items)
4. Generate room list according to quoteType
5. Apply per-room selections
6. Update UI: correct tab, dropdowns, labels, counters/progress

**Anti-Patterns:**
- "Patch UI labels only" (cosmetic fix)
- "Re-render without updating state" (desync)
- "Update state without updating UI controls" (desync)

---

### ays.room-generation

**Purpose:** Stop the "3 item rooms" bug.

**Rules:**
- Every room composes: base_room_items + room_specific_items
- Commercial must map correctly: `office_*` not `bedroom_*`
- Room generation is deterministic from: quoteType, propertyType, roomCounts, system defaults

---

## Persistence Policy

**Debounce:** 750–1500ms after user input

**Force save on:**
- beforeunload
- visibilitychange (hidden)
- pagehide

**Cleanup:**
- Synced drafts: delete after 14 days
- Unsynced stale drafts: delete after 30 days (configurable)
