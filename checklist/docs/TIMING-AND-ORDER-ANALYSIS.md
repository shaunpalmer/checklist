# Timing and Order Analysis: Room Generation Pipeline

**Date**: 2026-02-01  
**Status**: Analysis in progress  
**Problem**: Multiple async operations race, causing hydration failures

---

## 1. The Players

### Entry Points (What triggers room generation?)

| Trigger | Function | Timing | Uses Config From |
|---------|----------|--------|------------------|
| Page load | `init()` → `initGeneratedRoomsForTabs()` | Sync start, async finish | PROPERTY_CONFIG (current) |
| Tab click | `switchServiceTab()` → `setActiveChecklistGenerator()` | Sync start, async finish | PROPERTY_CONFIG (current) |
| Load draft | `loadQuote()` → `applySnapshot()` | Async (Promise chain) | snapshot.propertyConfig (saved) |
| Settings change | Settings UI → `factory.regenerate()` | Sync | PROPERTY_CONFIG (updated) |
| Page restore | `restoreSnapshotBestEffort()` → `applySnapshot()` | Sync | localStorage snapshot |

### The Async Pipeline

```
setActiveChecklistGenerator(serviceType)
    ↓
buildChecklistConfigFor(serviceType)     ← Sync: builds config object
    ↓
_renderGeneratedRoomsForService()        ← Returns Promise
    ↓
_waitFor(factoryLoaded)                  ← Async: waits for AysChecklistFormFactory
    ↓
_waitForGeneratedConfigWithRooms()       ← Async: waits for CHECKLIST_CONFIG
    ↓
generator.regenerate(config)             ← Sync: actually builds DOM
    ↓
initRoomProgressBars()                   ← Sync: progress UI
    ↓
updateFloorSummary()                     ← Sync: floor totals
```

### The Token Pattern

```javascript
// In _renderGeneratedRoomsForService():
this._pendingGeneratedRenderToken = (this._pendingGeneratedRenderToken || 0) + 1;
const token = this._pendingGeneratedRenderToken;

// Later, inside the Promise:
if (token !== this._pendingGeneratedRenderToken) return null;  // Stale, abort
```

This cancels stale renders when user switches tabs quickly.

---

## 2. Current Init Sequence

```javascript
init: function() {
  // ... setup ...
  this.initGeneratedRoomsForTabs();     // ← Starts async room generation
  // ... more setup ...
  this.restoreSnapshotBestEffort();     // ← Tries to apply snapshot BEFORE rooms exist
  this.initQuoteStorage();               // ← Sets up quote system
  // ...
  this.loadProgress();                   // ← Loads checkbox states
  this.updateAllProgress();              // ← Updates progress bars
}
```

**Problem**: `restoreSnapshotBestEffort()` runs BEFORE `initGeneratedRoomsForTabs()` completes!

---

## 3. Scenario Analysis

### Scenario A: Fresh Page Load (no saved state)

```
1. init() starts
2. initGeneratedRoomsForTabs() → starts async room build
3. restoreSnapshotBestEffort() → no snapshot, does nothing
4. loadProgress() → loads from localStorage (may have old data)
5. [ASYNC] Room build completes
6. DOM now has rooms, but checkbox states weren't applied
```

**Result**: Works if no saved state. Fails if localStorage has old checkbox IDs.

### Scenario B: Page Load with Snapshot Restore

```
1. init() starts
2. initGeneratedRoomsForTabs() → starts async room build (token=1)
3. restoreSnapshotBestEffort() → calls applySnapshot()
   3a. switchServiceTab() → starts ANOTHER async build (token=2)
   3b. _rebuildRoomsForSnapshot() → increments token (token=3), does sync build
   3c. Apply checkbox states → DOM exists, works!
4. [ASYNC token=1] First build completes → token mismatch, aborts ✓
5. [ASYNC token=2] Second build completes → token mismatch, aborts ✓
```

**Result**: Should work now with token increment fix.

### Scenario C: User Clicks Tab (normal navigation)

```
1. User clicks "Commercial" tab
2. switchServiceTab('commercial') called
   2a. Update CSS (show commercial container)
   2b. setActiveChecklistGenerator() → async build starts
3. [ASYNC] Build completes with CURRENT PROPERTY_CONFIG
4. DOM has commercial rooms
```

**Result**: Works correctly.

### Scenario D: Load Draft from Manage Quotes

```
1. User clicks "Load" on a draft
2. loadQuote(quoteId) called → returns Promise
3. QuoteStorage.get(quoteId) → fetches from IndexedDB
4. applySnapshot(quote.snapshot) called
   4a. switchServiceTab() → starts async build (token=N)
   4b. _rebuildRoomsForSnapshot() → token=N+1, sync build with SAVED config
   4c. Apply checkbox states
5. [ASYNC token=N] Build completes → token mismatch, aborts ✓
```

**Result**: Should work with token fix.

### Scenario E: Settings Change While Working

```
1. User is on EOT tab, has checked items
2. User goes to Settings, changes bedrooms from 3 to 5
3. Settings triggers PROPERTY_CONFIG update + factory.regenerate()
4. DOM is rebuilt with 5 bedrooms (correct)
5. Old checkbox states for rooms 1-3 are lost (no snapshot applied)
```

**Result**: Expected behavior - settings change rebuilds from scratch.

---

## 4. Identified Problems

### Problem 1: Init Order
`restoreSnapshotBestEffort()` runs before `initGeneratedRoomsForTabs()` completes.

**Current mitigation**: Token increment in `_rebuildRoomsForSnapshot()` cancels stale builds.

**Better fix**: Make `initGeneratedRoomsForTabs()` return a Promise, await it before restore.

### Problem 2: applySnapshot is Synchronous
`applySnapshot()` is sync but calls `switchServiceTab()` which starts async work.

**Current mitigation**: Sync rebuild in `_rebuildRoomsForSnapshot()` after tab switch.

**Alternative**: Make `applySnapshot()` async, await the tab switch completion.

### Problem 3: loadQuote Doesn't Wait
`loadQuote()` calls `applySnapshot()` but doesn't verify rooms were built.

**Current state**: Token fix should handle this.

**Verification needed**: Test that checkboxes actually get checked.

### Problem 4: Multiple Config Sources
- Fresh build uses `PROPERTY_CONFIG` (current settings)
- Hydration should use `snapshot.propertyConfig` (saved settings)

**Current fix**: `_rebuildRoomsForSnapshot()` uses snapshot config.

**Gap**: Old snapshots (schema 1) don't have `propertyConfig`.

---

## 5. The Correct Sequence

### For Page Load:

```
1. init() starts
2. cacheDOM(), bindEvents(), etc. (sync setup)
3. initGeneratedRoomsForTabs() → START async build, get Promise
4. AWAIT room build completion
5. THEN restoreSnapshotBestEffort() 
   - If snapshot exists, rebuild with saved config + apply state
   - If no snapshot, keep freshly built rooms
6. initQuoteStorage() → ensure quote ID exists
7. loadProgress() → (may be redundant if snapshot was applied)
8. updateAllProgress()
```

### For Load Draft:

```
1. loadQuote(quoteId) called
2. Save current state (if different quote)
3. Fetch quote from IndexedDB
4. switchServiceTab(snapshot.serviceType) → show correct tab
5. _rebuildRoomsForSnapshot(snapshot) → sync build with SAVED config
   - Increment token to cancel any pending async builds
6. cacheDOM() → refresh selectors
7. Apply checkbox states, variants, client fields
8. updateAllProgress()
```

### For Tab Click:

```
1. switchServiceTab(serviceType) called
2. Update CSS (show correct container)
3. setActiveChecklistGenerator() → async build with CURRENT config
4. [ASYNC] Build completes
5. cacheDOM(), updateAllProgress()
```

---

## 6. What's Fixed vs. What's Not

### ✅ Fixed by Token Increment
- Race between switchServiceTab async build and _rebuildRoomsForSnapshot sync build
- Multiple tab clicks causing stale renders

### ✅ Fixed by Schema 2 + propertyConfig
- Snapshots now include bedroom/bathroom counts
- Hydration rebuilds with saved config

### ⚠️ Partially Fixed
- Init order (token cancellation helps, but init should be sequenced properly)

### ❌ Not Fixed
- Old schema 1 snapshots missing propertyConfig (falls back to current config)
- No validation that checkbox count matches after rebuild

---

## 7. Recommended Changes

### Change 1: Sequence init() properly

```javascript
init: function() {
  // Sync setup
  this.cacheDOM();
  this.bindEvents();
  // ...
  
  // Async room generation - AWAIT THIS
  this.initGeneratedRoomsForTabs()
    .then(() => {
      // NOW safe to restore
      this.restoreSnapshotBestEffort();
      this.initQuoteStorage();
      this.loadProgress();
      this.updateAllProgress();
    });
}
```

**Blocker**: `initGeneratedRoomsForTabs()` currently doesn't return a Promise.

### Change 2: Make initGeneratedRoomsForTabs return Promise

```javascript
initGeneratedRoomsForTabs: function() {
  // ... setup ...
  
  // Return the async build Promise
  return this.setActiveChecklistGenerator(this.getActiveServiceType());
}
```

**Blocker**: `setActiveChecklistGenerator()` doesn't return the Promise from `_renderGeneratedRoomsForService()`.

### Change 3: Chain the Promises

```javascript
setActiveChecklistGenerator: function(serviceType) {
  // ...
  return this._renderGeneratedRoomsForService(serviceType, containerId, containerEl, config);
}
```

---

## 8. Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Token increment | Low | Already uses existing pattern |
| Schema 2 + propertyConfig | Low | Backward compatible |
| Async init sequence | Medium | Needs careful testing |
| Return Promises | Medium | May affect callers that don't expect Promise |

---

## 9. Test Plan

1. **Fresh page load** - rooms should build, no errors
2. **Page load with localStorage snapshot** - should restore state
3. **Tab switching** - should rebuild rooms for that service type
4. **Load draft from Manage Quotes** - should restore exact state
5. **Settings change** - should rebuild with new config
6. **Rapid tab clicking** - should only render final tab (token cancellation)
7. **Old snapshot (schema 1)** - should load with warning about missing propertyConfig

---

## 10. Next Steps

1. ✅ Token increment in `_rebuildRoomsForSnapshot()` - DONE
2. ✅ Schema 2 + propertyConfig in `buildSnapshot()` - DONE
3. ⏳ Test current fixes manually
4. ⏳ If still failing, implement Promise chaining in init sequence
5. ⏳ Add console logging to trace actual execution order
