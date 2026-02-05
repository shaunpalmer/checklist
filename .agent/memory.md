# AYS Checklist PWA - Agent Memory

## Last Updated: 2026-02-02

## 🔥 MAJOR FIX: IndexedDB Auto-Increment IDs

**PROBLEM FOUND:** Random ID generation was a point of failure
- `QuoteStorage.generateId()` created random strings like `q_lz5abc_xyz123`
- `generateQuote()` created separate random `Q-ABC123DEF`
- Result: 5 calculations = 5 different IDs for same work!

**FIX IMPLEMENTED:**
1. Bumped `DB_VERSION` from 1 to 2 (forces schema recreation)
2. Changed object store to use `autoIncrement: true`
3. Removed `generateId()` function - IndexedDB generates IDs
4. `save()` uses `store.add()` for new records, captures auto-generated ID
5. `generateQuote()` now uses `Q-{draftId}` instead of random

**Single Source of Truth:** IndexedDB auto-increment is the master ID.

## ✅ FIXED: localStorage/IndexedDB Linkage

**What was broken:**
1. `snapshotFallback` stored as RAW JSON - no draftId wrapper
2. `loadQuote()` didn't update localStorage after load
3. `restoreSnapshotBestEffort()` didn't check ID match

**Fixes applied:**
1. `saveSnapshot()` wraps with `{draftId, snapshot}`
2. `loadQuote()` updates localStorage after apply
3. `restoreSnapshotBestEffort()` verifies ID match (with String coercion for number vs string)

## ✅ FIXED: Missing Snapshot Fields

**Found and fixed:**
- `quoteServiceType` - was not captured in buildSnapshot()
- `bookingDate` - was not captured in buildSnapshot()

Both now saved and restored properly.

## Session Progress

### Completed Tasks (2026-02-01)

1. **Room Composition Fix** ✅
   - Problem: Rooms rendered 3 items instead of 12+
   - Root cause: `AysChecklistConfigBuilder.build()` used `generateRoomInstances()` (hardcoded templates) instead of `buildRoomInstances()` (OOP Room classes)
   - Fix: Replaced 5 calls in `checklist-config.js` lines 746-790
   - Doc: `FIX-ROOM-COMPOSITION-BYPASS.md`

2. **Hydration Rebuild Fix** ✅ (Token-based approach)
   - Problem: Loading saved drafts didn't restore checkbox states (silent failure)
   - Root cause: `applySnapshot()` applied states without rebuilding room DOM first
   - Fix: 
     - Added `_rebuildRoomsForSnapshot()` with token increment to cancel async races
     - Added `propertyConfig` to snapshot (schema v2)
     - Sync rebuild uses saved config, cancels pending async builds
   - Doc: `FIX-HYDRATION-REBUILD-SPEC.md`, `TIMING-AND-ORDER-ANALYSIS.md`

### Key Architecture Finding

**The async pipeline problem:**
```
init()
  → initGeneratedRoomsForTabs()     // Starts async build (fire-and-forget)
  → restoreSnapshotBestEffort()     // Runs BEFORE build completes!
```

**Why token fix works:**
- `_rebuildRoomsForSnapshot()` increments `_pendingGeneratedRenderToken`
- This cancels any pending async builds from `switchServiceTab()`
- Sync rebuild happens immediately with correct config
- Stale async builds check token, see mismatch, abort

### Deeper Fix Needed (Future)

The Promise chain should be proper:
```javascript
initGeneratedRoomsForTabs()  // Should return Promise
  .then(() => restoreSnapshotBestEffort())
  .then(() => initQuoteStorage())
```

Currently `setActiveChecklistGenerator()` doesn't return the Promise from `_renderGeneratedRoomsForService()`.

## Pending Items

- [ ] Manual test: load draft from Manage Quotes
- [ ] Manual test: tab switching after loading draft
- [ ] Consider making init sequence properly async (bigger change)
- [ ] Handle schema 1 snapshots gracefully (logs warning, uses current config)
