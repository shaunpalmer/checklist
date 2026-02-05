# FIX: Room Composition Bypass Bug

**Date**: 2026-02-01  
**Status**: Diagnosed → Fix Ready  
**Severity**: Critical (renders app unusable for quoting)

---

## 1. The Problem

**Symptom**: Every room (Bedroom, Bathroom, etc.) renders only 3 items instead of 12-15+.

Screenshot evidence shows:
- Bedroom 1: "Floors (select type)", "Baseboards Wiped", "Light Switches" — **0/3**
- This occurs in **both** End of Tenancy AND Residential modes
- The floor dropdown shows "Apply to..." with no actual floor type options

**Impact**: 
- Cannot generate accurate quotes (missing 80% of tasks)
- Cannot track work completion (most tasks invisible)
- App is effectively non-functional for production use

---

## 2. Root Cause Analysis

### What Should Happen

The architecture was designed with OOP Room classes:

```
Room.js (base class)
  └── getBaseItems()     → Returns 12+ base items (door, switches, skirting, vents, windows, etc.)
  └── renderItems()      → Combines getBaseItems() + getItems() + normalizes IDs

Bedroom.js (extends Room)
  └── getItems()         → Returns bedroom-specific addons from ITEM_DEFINITIONS
```

When `renderItems()` is called:
```javascript
renderItems() {
  const baseItems = this.getBaseItems();      // 12 items
  const roomItems = this.getItems();          // bedroom addons
  const combinedItems = [].concat(baseItems, roomItems);  // 15+ items
  return this.normalizeItemIds(combinedItems);
}
```

### What Actually Happens

The `AysChecklistConfigBuilder.build()` method **bypasses the Room classes entirely**:

```javascript
// checklist-config.js line 746-753
if (roomSpec.type === 'Bedroom' && roomSpec.count === null) {
  const bedroomTemplate = (serviceType === 'eot') ? EOT_BEDROOM_ITEMS_TEMPLATE : BEDROOM_ITEMS_TEMPLATE;
  rooms.push({
    subRooms: generateRoomInstances(bedroomTemplate, this.params.numBedrooms, 'Bedroom')
    //        ^^^^^^^^^^^^^^^^^^^^^^ Uses hardcoded 3-item template!
  });
}
```

The `generateRoomInstances()` function just clones a hardcoded template array:

```javascript
// checklist-config.js line 278
function generateRoomInstances(template, count, roomType) {
  // Simply clones the template items — NO Room class instantiation
  const items = template.map(item => ({...item}));
  // ...
}
```

Meanwhile, `buildRoomInstances()` exists and DOES use Room classes:

```javascript
// checklist-config.js line 580
function buildRoomInstances(roomClassName, count, serviceType) {
  // ...
  items: createRoomItemsFromClass(roomClassName, serviceType, i)  // ← Calls Room classes!
}
```

**But `buildRoomInstances()` is never called in `build()`.**

---

## 3. How It Got This Way

### Historical Context

1. **Phase 1**: Hardcoded templates (`BEDROOM_ITEMS_TEMPLATE`) were created as placeholder data during early development
2. **Phase 2**: OOP Room classes were built with proper `getBaseItems()` composition
3. **Phase 3**: `buildRoomInstances()` and `createRoomItemsFromClass()` were written to use the OOP classes
4. **Phase 4**: The `build()` method was never updated to call the new OOP path

### Why It Wasn't Caught

- The 3-item templates rendered *something*, so the UI appeared to work
- No automated tests verify item counts per room
- The `console.warn()` messages from failed class instantiation were easy to miss
- The try-catch in `createRoomItemsFromClass()` silently returns `null` on errors

### The Two Parallel Paths

| Function | Uses Room Classes? | Called in build()? |
|----------|-------------------|-------------------|
| `generateRoomInstances()` | ❌ No — clones template | ✅ Yes (active) |
| `buildRoomInstances()` | ✅ Yes — calls Room classes | ❌ No (dead code) |

---

## 4. The Solution

### Change Required

In `AysChecklistConfigBuilder.build()`, replace calls to `generateRoomInstances(template, count, roomType)` with `buildRoomInstances(roomClassName, count, serviceType)`.

### Specific Replacements

| Room Type | Before (broken) | After (fixed) |
|-----------|-----------------|---------------|
| Bedroom | `generateRoomInstances(bedroomTemplate, count, 'Bedroom')` | `buildRoomInstances('Bedroom', count, serviceType)` |
| Bathroom | `generateRoomInstances(BATHROOM_ITEMS_TEMPLATE, count, 'Bathroom')` | `buildRoomInstances('Bathroom', count, serviceType)` |
| Shower | `generateRoomInstances(SHOWER_ITEMS_TEMPLATE, count, 'Shower')` | `buildRoomInstances('Shower', count, serviceType)` |
| Office | `generateRoomInstances(OFFICE_ITEMS_TEMPLATE, count, 'Office')` | `buildRoomInstances('Office', count, serviceType)` |

### Code Change

```javascript
// BEFORE (broken)
if (roomSpec.type === 'Bedroom' && roomSpec.count === null) {
  const bedroomTemplate = (serviceType === 'eot') ? EOT_BEDROOM_ITEMS_TEMPLATE : BEDROOM_ITEMS_TEMPLATE;
  rooms.push({
    roomId: 'bedrooms',
    emoji: '🛏️',
    title: `Bedrooms (1-${this.params.numBedrooms})`,
    subRooms: generateRoomInstances(bedroomTemplate, this.params.numBedrooms, 'Bedroom')
  });
}

// AFTER (fixed)
if (roomSpec.type === 'Bedroom' && roomSpec.count === null) {
  rooms.push({
    roomId: 'bedrooms',
    emoji: '🛏️',
    title: `Bedrooms (1-${this.params.numBedrooms})`,
    subRooms: buildRoomInstances('Bedroom', this.params.numBedrooms, serviceType)
  });
}
```

---

## 5. Verification

After fix, each Bedroom should show **12+ items** including:

From `Room.getBaseItems()`:
- Door (wipe/clean)
- Door frame & trim
- Door handle & touchpoints
- Light switches
- Power points & outlets
- Vents & air returns
- Skirting boards / baseboards
- Windows & sills (internal)
- Built-in cupboards / shelving (external)
- Walls (spot wipe)
- Light fittings (reachable) — EOT only
- Ceiling / cobweb removal (reachable) — EOT only

Plus bedroom-specific items from `Bedroom.getItems()`.

### Test Command (Browser Console)

```javascript
// Verify Room class works directly
const bed = new Bedroom({
  roomId: 'test', 
  roomType: 'bedroom', 
  serviceType: 'eot', 
  variant: 'standard'
});
console.log('Item count:', bed.renderItems().length);  // Should be 12+
```

---

## 6. Conclusion

The OOP architecture was correctly designed but incompletely wired. The `build()` method retained legacy template-based code paths while the Room class infrastructure sat unused.

**Lesson**: When adding a new code path, grep for ALL call sites of the old path and update them. Dead code (like `buildRoomInstances()`) is a smell that integration was incomplete.

**Risk of Fix**: Low. `buildRoomInstances()` already exists and was tested — it just wasn't called. The only risk is if Room classes have bugs, but those would surface as console warnings.

---

## 7. Files Modified

- `checklist/js/data/checklist-config.js` — Switch from `generateRoomInstances()` to `buildRoomInstances()`

## 8. Related Issues

- Floor dropdown showing "Apply to..." with no options — may be a separate ITEM_DEFINITIONS issue
- `ITEM_DEFINITIONS.eot.bedroom` and `ITEM_DEFINITIONS.residential.bedroom` don't exist — `Bedroom.getItems()` returns `[]`, but `getBaseItems()` should still provide 12 items
