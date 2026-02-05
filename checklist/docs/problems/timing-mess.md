# The Timing Mess: State Ownership Problem

**Date**: 2026-02-01  
**Status**: Problem defined, solution spec ready  
**Priority**: Critical - blocks all CRUD reliability

---

## The Real Problem

It's not timing. It's **who owns state**.

Right now, three things all try to be the source of truth:

| Actor | What it does | When it runs |
|-------|--------------|--------------|
| **UI** | Checkboxes, selects, tabs | User clicks, anytime |
| **Hydrate** | Loads old state from snapshot | Page load, draft load |
| **AA Pipeline** | Grabs snapshot, sends to storage | Auto-save timer, manual save |

**They don't talk. They shout at the same time.**

---

## What Goes Wrong

### Scenario 1: Load Draft → Save Too Early
```
User clicks "Load Draft"
  ↓
hydrate starts (async)
  ↓
User clicks "Save" (or auto-save fires)
  ↓
AA grabs STALE data (hydrate not done)
  ↓
Snapshot saved with wrong state
```

### Scenario 2: Tab Switch During Hydrate
```
Load draft (EOT, 5 bedrooms)
  ↓
hydrate starts rebuilding EOT rooms
  ↓
User clicks "Commercial" tab
  ↓
switchServiceTab fires, starts ANOTHER rebuild
  ↓
DOM ends up with commercial rooms
  ↓
hydrate tries to apply EOT checkbox IDs → fails silently
```

### Scenario 3: Incomplete Render
```
Page loads
  ↓
initGeneratedRoomsForTabs() starts (async)
  ↓
restoreSnapshotBestEffort() runs IMMEDIATELY
  ↓
Tries to check checkboxes that don't exist yet
  ↓
Progress shows 0/47 despite saved state
```

---

## Root Cause

**Nothing waits.**

```javascript
// Current init() - fire and forget
init: function() {
  this.initGeneratedRoomsForTabs();     // async, no await
  this.restoreSnapshotBestEffort();     // runs before rooms exist
  this.initQuoteStorage();               // runs before restore done
  this.loadProgress();                   // runs before everything
}
```

```javascript
// Current applySnapshot() - sync function calling async things
applySnapshot: function(snapshot) {
  this.switchServiceTab(snapshot.serviceType);  // triggers async rebuild
  this._rebuildRoomsForSnapshot(snapshot);       // sync rebuild (races)
  // apply checkboxes immediately (DOM may not be ready)
}
```

```javascript
// Current saveSnapshot() - grabs whatever state exists
saveSnapshot: function() {
  const snapshot = this.buildSnapshot();  // grabs current DOM state
  // doesn't check if hydration is in progress
  // might save incomplete/stale data
}
```

---

## The Solution: One Lane

```
LOAD → HYDRATE → REBUILD → RECALC → SYNC-READY
```

Every other path **must wait**.

### The Single Lane Contract

```javascript
/**
 * The ONE function that handles all state loading.
 * Nothing else touches state until this resolves.
 * 
 * @param {Object} snapshot - The state to restore
 * @returns {Promise} - Resolves when UI is fully ready
 */
hydrateAndRebuild: function(snapshot) {
  return new Promise((resolve, reject) => {
    // 1. Set flag - block all saves
    this._isHydrating = true;
    
    // 2. Switch tab (CSS only, no async rebuild)
    this._switchTabVisualOnly(snapshot.serviceType);
    
    // 3. Rebuild rooms SYNCHRONOUSLY with saved config
    this._rebuildRoomsSync(snapshot);
    
    // 4. Apply all state
    this._applyCheckboxStates(snapshot.progress);
    this._applyVariants(snapshot.variantSelections);
    this._applyClientFields(snapshot.client);
    this._applyCustomItems(snapshot.customItemsSnapshot);
    
    // 5. Recalculate everything
    this.cacheDOM();
    this.updateAllProgress();
    this.updateFloorSummary();
    
    // 6. Clear flag - saves allowed again
    this._isHydrating = false;
    
    resolve();
  });
}
```

### Save Becomes "Queue Save"

```javascript
saveSnapshot: function() {
  // Block saves during hydration
  if (this._isHydrating) {
    console.log('[saveSnapshot] Hydration in progress, queuing save');
    this._pendingSave = true;
    return;
  }
  
  // Do the actual save
  this._doSave();
  this._pendingSave = false;
}

// At end of hydrateAndRebuild:
if (this._pendingSave) {
  this._doSave();
  this._pendingSave = false;
}
```

### UI Blocked During Hydration

```javascript
// Disable interactions while hydrating
_setHydratingUI: function(isHydrating) {
  this._isHydrating = isHydrating;
  
  // Disable save buttons
  $('.btn-save, .btn-sync').prop('disabled', isHydrating);
  
  // Disable tab switching
  $('.tab').toggleClass('is-disabled', isHydrating);
  
  // Show loading indicator
  $('#hydration-spinner').toggle(isHydrating);
}
```

---

## Implementation Plan

### Phase 1: Add the flag
```javascript
// At top of Checklist object
_isHydrating: false,
_pendingSave: false,
```

### Phase 2: Guard saveSnapshot
```javascript
saveSnapshot: function() {
  if (this._isHydrating) {
    this._pendingSave = true;
    return;
  }
  // ... existing save logic
}
```

### Phase 3: Create hydrateAndRebuild
- Extract sync rebuild logic from `_rebuildRoomsForSnapshot`
- Extract state application from `applySnapshot`
- Wrap in Promise
- Set/clear `_isHydrating` flag

### Phase 4: Update callers
- `restoreSnapshotBestEffort()` → uses `hydrateAndRebuild()`
- `loadQuote()` → uses `hydrateAndRebuild()`
- `init()` → awaits `hydrateAndRebuild()` before enabling UI

### Phase 5: Fix init sequence
```javascript
init: async function() {
  // Sync setup
  this.cacheDOM();
  this.bindEvents();
  
  // Build rooms first
  await this.initGeneratedRoomsForTabs();
  
  // Then hydrate if snapshot exists
  const snapshot = this._getSnapshotToRestore();
  if (snapshot) {
    await this.hydrateAndRebuild(snapshot);
  }
  
  // Now safe to enable everything
  this.initQuoteStorage();
  this.updateAllProgress();
}
```

---

## What This Fixes

| Problem | Before | After |
|---------|--------|-------|
| Save during hydrate | Saves stale data | Queued until ready |
| Tab click during hydrate | Races, corrupts DOM | Blocked until ready |
| Checkbox apply before DOM | Silent failure | Waits for rebuild |
| Multiple async rebuilds | Race condition | Single sync lane |

---

## Key Principles

1. **One lane** - `hydrateAndRebuild()` is the only way to restore state
2. **No parallel fires** - everything else waits
3. **Flag guards** - `_isHydrating` blocks premature saves
4. **Sync rebuild** - no async races during hydration
5. **Promise completion** - callers know when it's safe to proceed

---

## Not Patching Symptoms

Previous attempts:
- ❌ Token increment (workaround for race)
- ❌ CSS-only tab switch (broke normal navigation)
- ❌ Double rebuild (wasteful, still races)

This solution:
- ✅ Single function owns hydration
- ✅ Clear start/end boundaries
- ✅ All other code respects the flag
- ✅ No races because no parallel execution

---

## Next Step

Implement `hydrateAndRebuild()` as specified above.
