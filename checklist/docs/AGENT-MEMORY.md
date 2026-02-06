# Agent Memory (Rolling) — Object-Driven Checklist

**Last updated**: 2026-02-07

This file is the running "brain dump" for fast-paced development. It captures:
- What we've already changed (so we don't re-break it)
- What decisions are locked (so we don't drift)
- The active backlog (so we can move quickly without losing threads)

---

## Session Notes — 2026-02-07 (BOOT SEQUENCE FIX)

### ✅ COMPLETED: DB-First Boot Sequence

**Problem**: Boot order was wrong — snapshot applied BEFORE DB verified quoteId.

**Solution**: Reordered `init()` to chain DB-dependent calls after `initQuoteStorage()`.

| Before | After |
|--------|-------|
| `restoreSnapshotBestEffort()` | `initQuoteStorage().finally(() => {` |
| `initQuoteStorage()` | `  restoreSnapshotBestEffort()` |
| `initQuoteManager()` | `  initQuoteManager()` |
| | `  ...` |
| | `})` |

**Files Modified**:
- `checklist-script.js` — `init()` reordered, `initQuoteStorage()` returns Promise
- `docs/BOOT-SEQUENCE-FIX.md` — Plan document created

**Key Invariant Enforced**:
> At any time in runtime, there is exactly **one active `quoteId`**, and all snapshots reference that `quoteId`.

**Test**: Set `localStorage.setItem('ays_current_quote_id', '99999')`, reload, expect "clearing stale ID" log BEFORE any snapshot message.

---

## Session Notes — 2026-02-06 (DEEPER CODE QUALITY REVIEW)

### Key Discovery: The Architecture is GOOD

After deeper qmd search and file exploration, the **OOP architecture is well-designed**:

| Layer | Files | Quality |
|-------|-------|---------|
| Room Classes | `Room.js` + 20 subclasses | ✅ Clean inheritance |
| PropertyService | `PropertyService.js` + 3 subclasses | ✅ Pluggable pattern |
| Orchestrators | `AysRoomOrchestrator.js`, `PropertyServiceOrchestrator.js` | ✅ Good separation |
| Data Envelope | `AysQuoteEnvelope.js` | ✅ Clean serialization |
| Storage | `QuoteStorage.js` | ✅ Promise-based, well-documented |
| Sync | `event-worker.js` | ✅ Durable queue, fingerprint deduplication |
| Registry | `RoomRegistry.js`, `AysPropertyType.js` | ✅ Polymorphic type system |

### The Real Problem: `checklist-script.js` God Object

- **5,700 lines**, **~120 methods** in single `Checklist` object
- Violates Single Responsibility Principle
- Source of all DRY violations and timing issues
- See `docs/problems/timing-mess.md` for race condition details

### Recommended Decomposition

| New Module | Responsibility |
|------------|----------------|
| `ChecklistInit` | Initialization, DOM caching |
| `ChecklistState` | Snapshot, progress, persistence |
| `ChecklistQuote` | Quote generation, pricing |
| `ChecklistSync` | Event worker, sync status |
| `ChecklistCustomItems` | Custom item CRUD |
| `ChecklistUI` | UI interactions, animations |
| `ChecklistVoice` | Voice dictation |

### Updated `CODE-QUALITY-REVIEW.md`
- Added Section 0: God Object Problem (CRITICAL)
- Revised executive summary to acknowledge good OOP architecture
- Kept DRY and utility recommendations

---

## Session Notes — 2026-02-03 (CODE QUALITY REVIEW)

### ✅ COMPLETED This Session

#### 1. Code Quality Review — Horizontal Data Flow
- **Audited**: Form State → `buildSnapshot()` → `QuoteStorage` → `event-worker.js`
- **Documented 8 issues** in `docs/CODE-QUALITY-REVIEW.md`
- **Key findings**:
  - 20+ DRY violations (`.toString().trim()` pattern repeated everywhere)
  - Missing utility layer
  - Magic strings for selectors
  - Inconsistent error handling

#### 2. Created `AysStringUtils.js` Utility Module
- **Location**: `js/utils/AysStringUtils.js`
- **Functions**:
  - `toTrimmedString(value)` - Defensive string normalization
  - `getInputValue(selector)` - jQuery input extraction
  - `extractFirst(obj, ...keys)` - Flexible key fallback extraction
  - `isEmpty(value)` / `hasContent(value)` - Empty checks
  - `coalesce(...values)` - First non-empty value
  - `normalizePhone(phone)` / `normalizeEmail(email)`
- **Loaded first** in `checklist-modern.html`
- **Frozen object** - Immutable, attached to `window.AysStringUtils`

#### 3. Refactored `parseIncomingClientData()` to Use Utility
- **Before**: 12 repetitive inline `.toString().trim()` patterns
- **After**: Clean `S.extractFirst(obj, 'key1', 'key2', ...)` calls
- **Result**: ~40% fewer lines, more readable, DRY

### Files Created
- `js/utils/AysStringUtils.js` — New utility module
- `docs/CODE-QUALITY-REVIEW.md` — Detailed quality audit

### Files Modified
- `checklist-modern.html` — Added script tag for AysStringUtils.js
- `checklist-script.js` — Refactored `parseIncomingClientData()` normalize function

---

## 🎯 NEXT STEPS (Continuing Quality Refactor)

### P1 — Quick Wins Remaining
1. [ ] Replace remaining `.toString().trim()` patterns in `buildSnapshot()` with `AysStringUtils`
2. [ ] Add try/catch to `buildSnapshot()` for resilience
3. [ ] Create `AysFieldRegistry.js` for selector magic strings

### P2 — Medium Effort
4. [ ] Extract `buildSnapshot()` sub-functions (progress, client, variants, customItems)
5. [ ] Standardize optional chaining across codebase

---

## Session Notes — 2026-02-01 (COMPLETE)

### ✅ COMPLETED This Session

#### 1. Client Essentials Card (UI Overhaul)
- **Moved client fields to top of page** - Right after Crew/Date, before service tabs
- **Collapsible `<details>/<summary>` pattern** - Matches quote card styling
- **Sleek animated design**: Gradient header, CSS chevron, 200ms reveal animation
- **Preview text** shows "Name • Phone" when collapsed
- **Nested address card** - Address in sub-collapsible with chevron icon
- **All fields in single flex row** - Name, Phone, Email evenly distributed
- **Address fields in one row** - Street, Suburb, City, Postcode
- **Mobile responsive** - Stacks at 500px

#### 2. Crew/Date Bar Redesign
- **Compact dark header bar** - Glass-morphism inputs
- **Removed verbose labels** - "Crew" not "Cleaning Crew Name (optional)"

#### 3. Client Auto-Save Integration
- **300ms debounced** on input/change → `persistClientContext()`
- **Part of snapshot** - `buildSnapshot()` includes client object
- **Restored on load** - `applySnapshot()` calls `updateClientSummary()`

#### 4. Quote Section Client Summary
- **Removed duplicate field IDs** from Quote section
- **Read-only summary box** - Shows client details
- **"Edit Client Info" button** - Scrolls to top
- **`updateClientSummary()` called** on init, tab switch, restore, input

#### 5. Settings Header Cleanup
- Removed wasteful "System Settings" header - goes straight to tabs

### Files Modified
- `checklist-modern.html`: Client card (~lines 96-175), crew bar, Quote summary
- `checklist-style.css`: ~200 lines for card styling, animations
- `checklist-script.js`: `updateClientSummary()`, calls in init/switchServiceTab/applySnapshot

---

## 🚨 KNOWN PROBLEMS (Not Yet Fixed)

### P1: The Timing Mess (Critical) — `docs/problems/timing-mess.md`
**Status**: Problem defined, solution spec ready, **NOT implemented**

Three actors fight for state: UI, Hydrate, Auto-save. They don't wait.
- Load Draft → Auto-save fires before hydrate done → Stale data saved
- Tab switch during hydrate → Two rebuilds race → Corrupted DOM

**Solution**: Add `_isHydrating` flag, single `hydrateAndRebuild()` function

### P2: Incomplete CRUD (Load Partially Works)
- CREATE ✅, LIST ✅, DELETE ✅
- LOAD... **partial** ❌ - Room rebuild may not match, controls may not reset

### P3: Race Conditions in Room Rebuild
- Token cancellation helps but doesn't prevent all races
- Need single-lane rebuild (solution in timing-mess.md)

---

## ✅ Previously Completed (Verified)
- Room composition (Commercial→offices, Residential→bedrooms) ✅
- Snapshot schema v2 with propertyConfig ✅
- Token-based race cancellation ✅
- `saveProgress()` fresh selectors ✅
- Voice dictation mic buttons ✅
- Floor type defaults ✅
- PWA manifest/service worker ✅

## Deferred
- "Select All per section" - wait for hydration fix
- EOT kitchen definitions
- Room-type taxonomy doc
- **Full CRUD reliability - blocked by P1**

---

## Session Notes — 2026-01-30

### User request (capture in memory)
- Compare **local working tree** vs **origin/main** (GitHub repo) and keep differences in mind.
- Keep open questions around **room-type distinctions** across:
  - End-of-tenancy (empty residential) rooms
  - “AAA” residential rooms (occupied/standard residential)
  - Commercial rooms
- Clarify how room types are distinguished when they share common surfaces (walls, floors, ceilings, doors, windows).
- Quoting data is currently **too minimal**: EOT has core items but “extras” are property-wide; not enough data to quote a room reliably.
- More questions pending; user does **not** have all answers yet.

### Action items to revisit
- Define a **room-type taxonomy** (EOT-empty vs Residential-occupied vs Commercial) and the minimum data required to quote each.
- Determine which items are **room-scoped** vs **property-wide** for EOT vs residential vs commercial.
- Identify additional inputs needed for room-level quoting (fixtures, size, finish, usage intensity, etc.).

## Session Notes — 2026-01-31

### User clarification (pending action)
- The previously shared URL/string is **not accurate** because it included mixed slash characters (`/` and `\`). Need the corrected string before proceeding.

### Progress (2026-01-31)
- Implemented room-scoped floor type controls with checkbox + dropdown schema and defaults support.
- Added floor defaults panel in Settings and stored defaults in localStorage for per-tab config builds.
- Added per-room floor summary card that aggregates selected floor types.
- Added apply-to-all selector for floor type items to propagate selections across room types or all rooms.
- Added first-run endpoint setup overlay with /health test and IndexedDB + localStorage persistence.
- Added manifest + service worker + icons for installable PWA shell and offline cache.
- Sync status now shows syncing state automatically (no manual sync button).

## Non-Negotiables (Locked)

### Settings vs Form boundary
- **Settings = structural choices** (property type, room counts, service toggles, pricing/rates). Any settings change may require **full regeneration**.
- **Form = item-level choices** (checkboxes, notes, small variant choices). Form changes should **not** restructure the checklist.

### Instances over strings/DOM
- Runtime state should be captured as **instances / serialized state objects** (rooms, services, selections), not as ad-hoc strings, and not by scraping DOM for hours/prices.
- `CHECKLIST_CONFIG` is the **source for structure**; the UI is a **projection** of that structure.

### “Assembly line” generation
- **Definitions → Config → Factory → Cards**
  - Canonical catalog lives in `ITEM_DEFINITIONS`.
  - Settings-driven structure lives in `AysPropertyType.TYPES`.
  - `AysChecklistConfigBuilder` builds `CHECKLIST_CONFIG` from settings + definitions.
  - `AysChecklistFormFactory` renders cards and supports `regenerate()`.

### Object direction
- Prefer **Room / CommercialRoom subclasses** + **PropertyService subclasses**.
- Avoid new HTML string templates; prefer components building DOM (or at minimum data → component render).

---

## Current State (as of 2026-01-12)

### Completed changes (recent)
- Added commercial `Toilet` room class and loaded it before registry.
- Added `eot_residential` property type to the polymorphic registry.
- Added `ITEM_DEFINITIONS.eot` blocks:
  - `all_rooms` (property-wide once)
  - `entryway`, `basement`, `utility_special`, `home_office`, `outdoor` (priority lists)
- Updated config builder to:
  - Normalize definition items (`baseHours` → `hours`, `skillLevel` → `difficulty`)
  - Render EOT `all_rooms` once as a property-wide card
  - Build Toilet + EOT special rooms from definitions (not hardcoded)
- Fixed one HTML validation issue (duplicate `class` attribute).

### Registry sanity checks
- `AysRoomRegistry` already contains conditional registrations for the EOT special room names (`Entryway`, `Basement`, `UtilitySpecial`, `HomeOffice`, `Outdoor`) plus `Toilet`.
- Workspace version also exports `window.AysRoomRegistry` (important for global-script loading).

### Service toggles (already incorporated)
- `AysServiceToggleRenderer` already implements the promise-based dependency wait + property-type-filtered toggle rendering you pasted.
- It reads `PROPERTY_CONFIG.property_type` and uses `AysPropertyType.getAvailableServices(propertyType)` to decide which toggles appear.

### Confirmed architecture alignment
- `AysChecklistFormFactory` correctly handles:
  - single-room cards
  - multi-room groups (bedrooms/bathrooms) by creating separate cards per sub-room
  - full regeneration by clearing container and rebuilding

### Recap: why this direction is correct
- Settings decide structure; the factory builds sections/cards.
- Room/service prototypes provide the definitions/data; UI binds and renders.
- This matches the “assembly line” behavior already present in the factory and room/service patterns.

---

## Open Questions (Answer when you decide)
- Should EOT “special rooms” be **real Room subclasses** (e.g. `Entryway`) or remain **definition-driven cards** only?
- How should `eot_residential` be surfaced in the **Settings UI** (dropdown group, separate EOT mode toggle, etc.)?
- Do you want EOT kitchen items fully definitions-driven (likely yes) or keep legacy kitchen list for now?

---

## The Core Distinction (Expanded Notes)

### Settings: Big structural choices (LOCKED)
These change the scope/structure of the quote/checklist. They determine:
- Which rooms exist and how many
- Which room types/variants exist
- Counts of fixtures/features that create new sub-sections (e.g. multiple showers/ovens)
- Job scale/complexity

Rule: these **cannot** be changed “in-form” without regeneration, because they change the item graph.

Example: gym with 15 showers → Settings generates `shower_01…shower_15` sections/cards.

### Form: Small item-level choices (CHANGEABLE)
These are decisions within the settings-defined structure:
- Check/uncheck tasks
- Notes/observations
- Item-level difficulty overrides (for this visit)
- Add a custom item discovered during walk-through (if it doesn’t require new structural sections)

Rule: form changes should not restructure the checklist; they should update state.

### Gray zone policy (important)
When a user discovers something that *would* add a new section (e.g., “actually there are 2 ovens”):
- Preferred: treat as **Settings**, go back, update, regenerate.
- Allowed fallback (to preserve progress): add as **custom item/service** on the form, but accept structural inconsistency.

Practical workflow:
1) Discovery phase (before form): set Settings and lock structure.
2) Walk-through: capture extra work as custom items.
3) If property type/structure was wrong: go back to Settings and regenerate (restart or preserve via future snapshotting).

---

## Active TODO Checklist (Long Backlog)

### A) EOT coverage (definitions + structure)
- [ ] Add `ITEM_DEFINITIONS.eot.kitchen` from your Kitchen list.
- [ ] Ensure `Kitchen` card for `eot_residential` pulls from `eot.kitchen` (and does not duplicate `eot.all_rooms`).
- [ ] Decide whether to add definitions for `eot.bedroom`, `eot.bathroom`, `eot.living_area`, `eot.laundry` (or map them to existing residential definitions).
- [ ] Confirm EOT “All Rooms (Property-wide)” card order (top vs bottom) and keep it consistent.

### B) Property type selection + regeneration wiring
- [ ] Confirm Settings UI can actually select `eot_residential` (dropdown contains it).
- [ ] Verify `PROPERTY_CONFIG.propertyType` is set before calling `formFactory.regenerate()`.
- [ ] Add a small smoke-path: pick property type → regenerate → cards count changes.

### B2) Regeneration + state preservation (future)
- [ ] Decide what happens to in-form progress when Settings regenerate (wipe vs attempt migration).
- [ ] If migration is desired: define a stable keying strategy (`roomId`, `itemId`) to reapply checked states post-regenerate.

### C) Special rooms: class vs config decision
- [ ] If classes are required: create `Entryway.js`, `Basement.js`, `UtilitySpecial.js`, `HomeOffice.js`, `Outdoor.js` (likely extending `Room` or a small “DefinitionRoom” helper).
- [ ] If classes are NOT required: ensure no registry code path depends on those classes; keep generation purely config-driven.

### D) Definition schema hardening (reduce drift)
- [ ] Consolidate item normalization into one helper (rooms + services) so every item becomes:
  - `{ itemId, label, hours, difficulty, room, name, optional, category, ... }`
- [ ] Standardize hours field: pick one canonical field (`hours`) and keep `baseHours` only in raw definitions.
- [ ] Standardize difficulty field: canonical `difficulty`; allow `skillLevel` only in raw definitions.

### D2) State schema (instances)
- [ ] Define serialized state for a job/quote:
  - property settings snapshot
  - generated structure snapshot (rooms/services)
  - user form state (checked, notes, overrides)
- [ ] Ensure state persistence reads/writes this object (not DOM scraping).

### E) “String template drift” cleanup (targeted)
- [ ] Identify all remaining `innerHTML =` / string-built HTML used for:
  - service disclosure summaries
  - quote summaries
  - dynamic UI blocks
- [ ] Replace the highest-churn ones with component-style DOM building (keep UI identical).
- [ ] Keep `AysChecklistFormFactory` purely structural: it should not embed template strings beyond titles.

### E2) First refactor targets (candidate order)
- [ ] Property service disclosure/summary rendering (most string-heavy, user-visible drift).
- [ ] Quote summary breakdown rendering.
- [ ] Any “hours/price” derived from DOM attributes instead of item instances.

### F) Property-wide services (object-driven)
- [ ] Confirm each PropertyService subclass supports:
  - `getItems()` base definitions
  - parameter application (counts/multipliers)
  - stable `itemId` strategy (no collisions across services)
- [ ] For window cleaning: move dynamic “label formatting” out of definitions and into render-time formatting if possible.
- [ ] Ensure services are clearly separated from rooms in the config model (cards render the same way, but data types differ).

### G) Validation + debugging ergonomics
- [ ] Add one debug mode flag (global) to print:
  - selected property type
  - generated rooms summary
  - total items
- [ ] Add a single “schema validator” function to warn on missing `itemId/label/hours`.

### H) Documentation hygiene
- [ ] Update docs to reflect the newer object-driven architecture vs the older “data-attributes in HTML” phase.
- [ ] Keep this file updated every session (append “What changed” + “What’s next”).

---

## Working Protocol (for fast paste/diff sessions)

When you paste new work:
1. Identify if it’s **new file** vs **patch**.
2. Add the file / patch it without overwriting unrelated classes.
3. Ensure load order in `checklist-modern.html`.
4. Update registry/property type/config builder if needed.
5. Run a quick error scan and note results here.
