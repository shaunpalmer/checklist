# FIX: Hydration Must Rebuild Rooms Before Applying State

**Date**: 2026-02-01  
**Status**: ✅ IMPLEMENTED  
**Severity**: Critical (breaks quote recovery, makes drafts useless)  
**Predecessor**: FIX-ROOM-COMPOSITION-BYPASS.md (completed)

---

## 1. Problem Statement

### Symptom
When loading a saved draft via "Manage Quotes → Load", the form appears but **checkbox states do not restore**. The user sees a blank form despite having saved progress.

### User Impact
- Hours of work checking items → saved → lost on reload
- Cannot resume quotes across sessions
- Cannot review past quotes accurately
- Trust in the app is destroyed ("it doesn't save my work")

### Technical Manifestation
```javascript
// In browser console after loading a draft:
// User expects: 47 checkboxes checked (from saved progress)
// Actual: 0 checkboxes checked

// The snapshot exists and is correct:
console.log(quote.snapshot.progress);
// → { "room_bedroom_001_base-door": true, "room_bedroom_001_base-switches": true, ... }

// But the DOM doesn't have those elements:
document.getElementById('room_bedroom_001_base-door');
// → null (element doesn't exist!)
```

---

## 2. Root Cause Analysis

### The Hydration Sequence is Incomplete

**Current `applySnapshot()` does:**
```
1. switchServiceTab(snapshot.serviceType)  ← Only toggles CSS visibility
2. Loop through snapshot.progress          ← Tries to find checkboxes
3. Set checkbox.checked = true             ← Fails silently if not found
```

**What it SHOULD do:**
```
1. switchServiceTab(snapshot.serviceType)  ← Set mode
2. REBUILD ROOMS for that mode             ← ❌ MISSING
3. Loop through snapshot.progress          ← Now IDs will exist
4. Set checkbox.checked = true             ← Success
5. Recalculate totals                      ← Update UI
```

### Why `switchServiceTab()` Doesn't Rebuild

Looking at the code:
```javascript
// checklist-script.js lines 4175-4220
switchServiceTab: function(serviceType) {
  // Update tab UI (CSS classes)
  $('.tab').removeClass('is-tab-selected');
  $('.tab[data-service="' + serviceType + '"]').addClass('is-tab-selected');

  // Hide/show content divs (CSS visibility)
  $('.service-tab-content').removeClass('is-active');
  $('#service-' + serviceType).addClass('is-active');

  // Try to set active generator (wrapped in try-catch, may fail silently)
  try {
    this.setActiveChecklistGenerator(serviceType);
  } catch (_) {
    // ignore  ← Silent failure!
  }

  // Re-cache DOM + update progress
  this.cacheDOM();
  this.updateAllProgress();
}
```

**Key insight**: `switchServiceTab()` assumes rooms ALREADY EXIST in the DOM. It just shows/hides them. It does NOT create them.

### When Rooms Are Created

Rooms are only created:
1. **On page load** — `DOMContentLoaded` triggers initial build
2. **On property type change** — Settings UI calls `factory.regenerate()`

They are NOT created:
- When switching tabs
- When loading a draft
- When `applySnapshot()` runs

### The Silent Failure Pattern

```javascript
// applySnapshot() lines 2578-2585
if (snapshot.progress && typeof snapshot.progress === 'object') {
  for (const id in snapshot.progress) {
    const $checkbox = $('#' + id);
    if ($checkbox.length) {  // ← If not found, just skip. No warning.
      $checkbox.prop('checked', !!snapshot.progress[id]);
    }
    // Missing: else { console.warn('Checkbox not found:', id); }
  }
}
```

**Result**: 47 checkboxes in the snapshot, 0 found in DOM, 0 warnings logged. User sees nothing restored.

---

## 3. Logical Conclusions

### Conclusion 1: Hydration MUST include room rebuild

The DOM is not static. Different service types (EOT vs Residential vs Commercial) have different room structures. A snapshot from "Commercial Office" cannot be applied to a DOM built for "Residential 3-bed".

**Therefore**: Before applying checkbox states, the DOM must be rebuilt to match the snapshot's service type and property configuration.

### Conclusion 2: Snapshot must include property configuration

Currently, snapshot stores:
```javascript
{
  serviceType: 'end-of-tenancy',
  progress: { ... },
  // Missing: What property config was this built from?
}
```

Without property config, we can't rebuild the exact room structure. A 3-bedroom EOT has different rooms than a 5-bedroom EOT.

**Therefore**: Snapshot schema must include `propertyConfig`:
```javascript
{
  serviceType: 'end-of-tenancy',
  propertyConfig: {
    propertyType: 'residential',
    numBedrooms: 3,
    numBathrooms: 2
  },
  progress: { ... },
}
```

### Conclusion 3: Silent failures must become visible

The current code hides problems. When a checkbox ID isn't found, nothing is logged. This makes debugging impossible.

**Therefore**: Add `console.warn()` when expected checkboxes are missing.

### Conclusion 4: Rebuild should be idempotent

Calling rebuild multiple times should not corrupt state. It should:
1. Clear existing DOM
2. Generate fresh rooms
3. Return clean slate for hydration

The existing `factory.regenerate()` already does this.

---

## 4. The Fix

### 4.1 Modify `applySnapshot()` to rebuild rooms

**Before:**
```javascript
applySnapshot: function(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;

  // Switch tab first so DOM cache aligns
  if (snapshot.serviceType) {
    this.switchServiceTab(snapshot.serviceType);
  }

  // Apply checkbox states (may fail silently)
  if (snapshot.progress && typeof snapshot.progress === 'object') {
    for (const id in snapshot.progress) {
      const $checkbox = $('#' + id);
      if ($checkbox.length) {
        $checkbox.prop('checked', !!snapshot.progress[id]);
      }
    }
  }
  // ...
}
```

**After:**
```javascript
applySnapshot: function(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;

  // 1. Switch to correct service tab
  if (snapshot.serviceType) {
    this.switchServiceTab(snapshot.serviceType);
  }

  // 2. REBUILD ROOMS to match snapshot's property config
  //    This ensures DOM has the correct checkboxes before we try to set them
  if (snapshot.propertyConfig || snapshot.serviceType) {
    this._rebuildRoomsForSnapshot(snapshot);
  }

  // 3. Apply checkbox states (now IDs should exist)
  let restoredCount = 0;
  let missingCount = 0;
  if (snapshot.progress && typeof snapshot.progress === 'object') {
    for (const id in snapshot.progress) {
      const $checkbox = $('#' + id);
      if ($checkbox.length) {
        $checkbox.prop('checked', !!snapshot.progress[id]);
        if (snapshot.progress[id]) restoredCount++;
      } else {
        missingCount++;
        console.warn('[applySnapshot] Checkbox not found:', id);
      }
    }
  }
  
  if (missingCount > 0) {
    console.warn(`[applySnapshot] ${missingCount} checkboxes not found, ${restoredCount} restored`);
  }

  // ... rest of hydration (variants, client fields, etc.)
}
```

### 4.2 Add `_rebuildRoomsForSnapshot()` helper

```javascript
/**
 * Rebuild room DOM to match a snapshot's property configuration.
 * Called during hydration to ensure checkboxes exist before we try to check them.
 * @private
 */
_rebuildRoomsForSnapshot: function(snapshot) {
  const serviceType = snapshot.serviceType || this.getActiveServiceType();
  const factory = this._generatorsByService[serviceType];
  
  if (!factory) {
    console.warn('[_rebuildRoomsForSnapshot] No factory for service type:', serviceType);
    return;
  }

  // Get property config from snapshot, or use current settings
  const propertyConfig = snapshot.propertyConfig || this._getCurrentPropertyConfig();
  
  // Build new config using the builder
  try {
    const config = this._buildConfigForHydration(serviceType, propertyConfig);
    factory.regenerate(config);
    console.log('[_rebuildRoomsForSnapshot] Rebuilt rooms for:', serviceType, propertyConfig);
  } catch (err) {
    console.error('[_rebuildRoomsForSnapshot] Failed to rebuild:', err);
  }
},

/**
 * Get current property configuration from Settings/localStorage.
 * @private
 */
_getCurrentPropertyConfig: function() {
  // Read from localStorage or Settings UI
  const stored = localStorage.getItem('checklist_property_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  
  // Fallback to defaults
  return {
    propertyType: 'residential',
    numBedrooms: 3,
    numBathrooms: 2
  };
},

/**
 * Build a CHECKLIST_CONFIG for hydration purposes.
 * @private
 */
_buildConfigForHydration: function(serviceType, propertyConfig) {
  // Use the config builder with the snapshot's property config
  const builder = AysChecklistConfigBuilder.forPropertyType(propertyConfig.propertyType || 'residential');
  
  if (propertyConfig.numBedrooms) builder.withBedroomCount(propertyConfig.numBedrooms);
  if (propertyConfig.numBathrooms) builder.withBathroomCount(propertyConfig.numBathrooms);
  if (propertyConfig.numOffices) builder.withOfficeCount(propertyConfig.numOffices);
  if (propertyConfig.numShowers) builder.withShowerCount(propertyConfig.numShowers);
  
  return builder.build();
}
```

### 4.3 Modify `buildSnapshot()` to include property config

**Before:**
```javascript
buildSnapshot: function() {
  // ...
  return {
    schema: 1,
    updated_at: new Date().toISOString(),
    serviceType: this.getActiveServiceType(),
    crew: this.$crewInput.val(),
    date: this.$dateInput.val(),
    client,
    progress,
    variantSelections,
    customItemsSnapshot: this.getCustomItemsSnapshot()
  };
}
```

**After:**
```javascript
buildSnapshot: function() {
  // ...
  return {
    schema: 2,  // Increment schema version
    updated_at: new Date().toISOString(),
    serviceType: this.getActiveServiceType(),
    propertyConfig: this._getCurrentPropertyConfig(),  // NEW
    crew: this.$crewInput.val(),
    date: this.$dateInput.val(),
    client,
    progress,
    variantSelections,
    customItemsSnapshot: this.getCustomItemsSnapshot()
  };
}
```

---

## 5. Migration: Old Snapshots (Schema 1)

Existing drafts have `schema: 1` (or no schema field). They lack `propertyConfig`.

**Handling:**
```javascript
_rebuildRoomsForSnapshot: function(snapshot) {
  // For old snapshots without propertyConfig, use current settings
  const propertyConfig = snapshot.propertyConfig || this._getCurrentPropertyConfig();
  // ...
}
```

**Risk**: If user saved a 5-bedroom quote but current settings show 3 bedrooms, rooms 4-5 won't be rebuilt. Their checkbox states will be lost.

**Mitigation**: Log a warning if snapshot has more checkboxes than DOM after rebuild.

---

## 6. Test Cases

### Test 1: Fresh quote round-trip
1. Create new quote (3 bed, 2 bath EOT)
2. Check 10 items across different rooms
3. Save (auto-save or explicit)
4. Refresh page
5. Load the draft from Manage Quotes
6. **Expected**: 10 items should be checked
7. **Verify**: `console.log` shows "10 restored, 0 missing"

### Test 2: Cross-session recovery
1. Create quote, check items, close browser
2. Reopen browser, go to checklist
3. Load draft
4. **Expected**: State fully restored

### Test 3: Service type switch
1. Create EOT quote, check items
2. Switch to Residential tab
3. Switch back to EOT tab
4. **Expected**: Checked items still checked (or warning logged if DOM was lost)

### Test 4: Old snapshot migration
1. Load a draft saved before this fix (schema 1)
2. **Expected**: Falls back to current property config, logs warning if mismatches

---

## 7. Conclusion

The hydration failure is caused by a **missing step**: room DOM must be rebuilt before checkbox states can be applied. The fix requires:

1. **Add room rebuild to `applySnapshot()`** — ensures DOM matches snapshot
2. **Include `propertyConfig` in snapshot** — enables exact reconstruction
3. **Add console warnings** — makes failures visible for debugging
4. **Handle old snapshots gracefully** — fall back to current config

This fix completes the CRUD cycle:
- **C**reate: `startNewQuote()` ✅
- **R**ead: `loadQuote()` → `applySnapshot()` ← **THIS FIX**
- **U**pdate: `buildSnapshot()` → `saveSnapshot()` ✅
- **D**elete: `deleteQuote()` ✅

Without this fix, the "R" in CRUD is broken, making the entire draft system useless.

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `checklist-script.js` | `applySnapshot()`, `buildSnapshot()`, add `_rebuildRoomsForSnapshot()`, `_getCurrentPropertyConfig()`, `_buildConfigForHydration()` |

## 9. Implementation Order

1. Add `_getCurrentPropertyConfig()` helper
2. Add `_buildConfigForHydration()` helper  
3. Add `_rebuildRoomsForSnapshot()` method
4. Modify `applySnapshot()` to call rebuild + add warnings
5. Modify `buildSnapshot()` to include `propertyConfig`
6. Test with fresh quote
7. Test with old snapshot

---

**Ready to implement.** Proceed?

---

## 10. Implementation Summary (2026-02-01)

### Changes Made to `checklist-script.js`:

**1. `buildSnapshot()` (line ~2510)**
- Schema version bumped from `1` to `2`
- Added `propertyConfig: this._getCurrentPropertyConfig()` to capture bedroom/bathroom counts

**2. `applySnapshot()` (line ~2567) - COMPLETE REWRITE**
The hydration sequence now follows the correct order:
```
1. Switch tab (CSS only)           ← Set mode visually, NO async rebuild
2. _rebuildRoomsForSnapshot()      ← Rebuild DOM with correct rooms  
3. cacheDOM()                      ← Re-cache jQuery selectors
4. Loop through progress           ← Apply checkbox states (IDs now exist)
5. Apply variants, custom items    ← Restore other state
6. Apply client fields             ← Restore client info
7. scheduleSaveProgress()          ← Queue auto-save
8. updateAllProgress()             ← Recalculate totals
```

Key fix: Tab switching now ONLY updates CSS visibility - it does NOT call `setActiveChecklistGenerator()` which would trigger an async rebuild that races with our sync rebuild.

**3. New helper methods added (lines ~2705-2827):**
- `_rebuildRoomsForSnapshot(snapshot)` - Rebuilds room DOM using factory.regenerate()
- `_getCurrentPropertyConfig()` - Reads from PROPERTY_CONFIG global
- `_buildConfigForHydration(serviceType, propertyConfig)` - Constructs config for builder

**4. `_rebuildRoomsForSnapshot()` now calls:**
- `initRoomProgressBars()` - Initialize progress bar UI
- `updateAllProgress()` - Recalculate checked counts
- `updateFloorSummary()` - Update floor totals

### Console Output Examples:

**Successful hydration:**
```
[_rebuildRoomsForSnapshot] Rebuilt 12 rooms for: end-of-tenancy
[applySnapshot] Successfully restored 47 checkbox states
```

**Partial hydration (old snapshot):**
```
[_rebuildRoomsForSnapshot] Rebuilt 8 rooms for: end-of-tenancy
[applySnapshot] Checkbox not found: bed1-floors
[applySnapshot] Checkbox not found: bed1-walls
[applySnapshot] 5 checkboxes not found, 42 restored
```
