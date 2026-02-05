# Data Flow Analysis: Post-Render Issues

**Date**: 2026-02-01  
**Status**: Diagnosis in Progress  
**Context**: Room composition fix applied — rooms now render 12+ items. This document traces what happens AFTER render.

---

## 1. The Data Flow Chain

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. BUILD                                                             │
│  AysChecklistConfigBuilder.build()                                    │
│    → buildRoomInstances() → Room.renderItems()                        │
│    → Returns config with 12+ items per room                           │
│    ✅ FIXED                                                           │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│  2. RENDER                                                            │
│  AysChecklistFormFactory.generate(config)                             │
│    → Creates AysDisclosureRoomCard per room                           │
│    → DOM checkboxes created with IDs from item.itemId                 │
│    ✅ WORKING (items visible in UI)                                   │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│  3. CAPTURE (buildSnapshot)                                           │
│  Checklist.buildSnapshot()                                            │
│    → Iterates: $('.checklist-item input[type="checkbox"]')            │
│    → Stores: progress[id] = checked                                   │
│    ⚠️ DEPENDS ON: DOM IDs matching what was rendered                  │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│  4. STORE (QuoteStorage)                                              │
│  QuoteStorage.save() / updateSnapshot()                               │
│    → Writes snapshot to IndexedDB (ays_quotes.drafts)                 │
│    ⚠️ SHOULD WORK: Just stores whatever buildSnapshot() returns       │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│  5. LOAD (loadQuote)                                                  │
│  Checklist.loadQuote(quoteId)                                         │
│    → QuoteStorage.get(quoteId)                                        │
│    → Checklist.applySnapshot(quote.snapshot)                          │
│    ⚠️ PROBLEM AREA: See below                                         │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│  6. HYDRATE (applySnapshot)                                           │
│  Checklist.applySnapshot(snapshot)                                    │
│    → switchServiceTab(snapshot.serviceType)  ← Does NOT rebuild rooms │
│    → Loops: for (id in snapshot.progress)                             │
│    → Sets: $('#' + id).prop('checked', true)                          │
│    ❌ PROBLEM: DOM may not have those IDs if rooms weren't rebuilt    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Identified Problems

### Problem A: Hydration Without Room Rebuild

**Location**: `applySnapshot()` in checklist-script.js lines 2567-2668

**Issue**: 
```javascript
applySnapshot: function(snapshot) {
  // Switch tab first so DOM cache aligns
  if (snapshot.serviceType) {
    this.switchServiceTab(snapshot.serviceType);  // ← Only switches visibility!
  }
  // ...
  for (const id in snapshot.progress) {
    const $checkbox = $('#' + id);
    if ($checkbox.length) {  // ← Silently skips if checkbox doesn't exist
      $checkbox.prop('checked', !!snapshot.progress[id]);
    }
  }
}
```

**Why This Breaks**:
1. `switchServiceTab()` only toggles CSS visibility — it does NOT regenerate rooms
2. If the saved snapshot has itemIds like `room_bedroom_001_base-door`, but the DOM was rendered with different IDs (or wasn't rendered at all), the checkbox lookup fails silently
3. No room rebuild means: **old DOM structure vs new snapshot = mismatched IDs**

---

### Problem B: Item ID Format Inconsistency

The Room classes now generate IDs via `normalizeItemIds()`:
```javascript
// Room.js line 320
normalizeItemIds(items) {
  return items.map((item, index) => ({
    ...item,
    itemId: `room_${this.roomType}_${String(this.number).padStart(3, '0')}_${item.itemId || `item_${index}`}`,
    // Example: room_bedroom_001_base-door
  }));
}
```

But the OLD templates used:
```javascript
// BEDROOM_ITEMS_TEMPLATE
itemId: 'bed{N}-floors'  // → became 'bed1-floors'
```

**Impact**: Any snapshots saved with OLD IDs won't match NEW IDs. Hydration will fail silently.

---

### Problem C: switchServiceTab() Doesn't Regenerate

**Location**: `switchServiceTab()` in checklist-script.js lines 4175-4220

```javascript
switchServiceTab: function(serviceType) {
  // Update tab UI
  $('.tab').removeClass('is-tab-selected');
  $('.tab[data-service="' + serviceType + '"]').addClass('is-tab-selected');
  
  // Hide all service content tabs
  $('.service-tab-content').removeClass('is-active');
  
  // Show selected service content tab
  $('#service-' + serviceType).addClass('is-active');
  
  // ...
  try {
    this.setActiveChecklistGenerator(serviceType);  // ← Wrapped in try-catch, may fail silently
  } catch (_) {
    // ignore
  }
}
```

**Missing**: No call to `factory.regenerate()` or `buildRoomInstances()`. The rooms are assumed to already exist in the DOM.

---

### Problem D: Quote Manager "Load" Button

**Location**: `loadQuote()` in checklist-script.js lines 2767-2800

The flow is:
1. `QuoteStorage.get(quoteId)` — gets the draft from IndexedDB
2. `applySnapshot(quote.snapshot)` — tries to restore UI state
3. `setCurrentQuoteId(quote.id)` — tracks which draft is active

**What's Missing**:
- No mode check (is the snapshot EOT vs Residential vs Commercial?)
- No room rebuild before hydration
- No validation that item IDs match current DOM

---

## 3. The Correct Hydration Sequence

As documented in `Manage Quotes.md`:

```
1. Set mode (serviceType)           ← switchServiceTab()
2. REBUILD rooms for that mode      ← ❌ MISSING
3. Apply payload (checkbox states)  ← applySnapshot()
4. Recalculate totals               ← updateAllProgress()
5. Render                           ← already done by rebuild
```

**The missing step 2 is the critical gap.**

---

## 4. Fix Options

### Option 1: Regenerate Rooms in applySnapshot()

```javascript
applySnapshot: function(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;

  // 1. Switch tab
  if (snapshot.serviceType) {
    this.switchServiceTab(snapshot.serviceType);
  }

  // 2. REBUILD ROOMS (NEW)
  if (snapshot.serviceType && typeof AysChecklistFormFactory !== 'undefined') {
    const factory = this._generatorsByService[snapshot.serviceType];
    if (factory) {
      // Regenerate with current property config
      const config = getCurrentConfig(snapshot.serviceType);
      factory.regenerate(config);
    }
  }

  // 3. Now apply checkbox states (IDs will match)
  if (snapshot.progress && typeof snapshot.progress === 'object') {
    for (const id in snapshot.progress) {
      const $checkbox = $('#' + id);
      if ($checkbox.length) {
        $checkbox.prop('checked', !!snapshot.progress[id]);
      } else {
        console.warn('[applySnapshot] Checkbox not found:', id);
      }
    }
  }
  // ... rest of hydration
}
```

### Option 2: Store Property Config in Snapshot

Currently snapshot stores:
```javascript
{
  serviceType: 'end-of-tenancy',
  progress: { 'bed1-floors': true, ... },
  // ...
}
```

Should also store:
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

Then `applySnapshot()` can rebuild the EXACT room structure before applying progress.

---

## 5. Migration Concern: Old Snapshots

Existing drafts in IndexedDB have OLD item IDs (e.g., `bed1-floors`).  
New renders produce NEW item IDs (e.g., `room_bedroom_001_base-floors`).

**Options**:
1. **Migration script**: On load, detect old IDs and remap to new format
2. **Backward compatibility**: Accept both ID formats in `applySnapshot()`
3. **Wipe and start fresh**: Clear drafts store (loses data)

---

## 6. Next Steps

1. [ ] Fix `applySnapshot()` to rebuild rooms before applying progress
2. [ ] Add `propertyConfig` to snapshot schema
3. [ ] Add console warnings when checkpoint ID lookup fails
4. [ ] Consider migration path for old snapshots
5. [ ] Test full round-trip: create quote → save → close → reopen → verify state

---

## 7. Related Files

- `checklist-script.js` — `buildSnapshot()`, `applySnapshot()`, `loadQuote()`, `switchServiceTab()`
- `checklist-config.js` — `AysChecklistConfigBuilder`, `buildRoomInstances()`
- `QuoteStorage.js` — IndexedDB CRUD
- `AysChecklistFormFactory.js` — `generate()`, `regenerate()`
- `Room.js` — `renderItems()`, `normalizeItemIds()`
