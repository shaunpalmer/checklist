# Implementation Plan: Building the Generated Room System

**Document Date**: January 3, 2026  
**Purpose**: Phased plan to implement Settings → Rooms → Form pipeline  
**Status**: Actionable roadmap  
**Owner**: Development team

---

## Overview: What We're Building

**Current State (HTML):**
- Hardcoded rooms and items in checklist-modern.html
- 2400 lines of static markup
- Static property size selector (hide/show rooms)

**Target State (Generated):**
- Factory reads Settings object
- Factory generates AysRoomSection objects
- Each room contains correct items for service type + variant + sub-features
- Form displays generated rooms (same HTML output)
- State management persists correctly across changes

**Benefit:**
- Add new service types without editing HTML
- Add new room variants without duplication
- Enable dynamic property configuration
- Reduce code maintenance (items in one place)

---

## Phase 1: Foundation (Week 1)

### 1.1: Extract Room Metadata
**Goal:** Identify all rooms, variants, emojis, titles from existing HTML  
**Deliverable:** ROOM_METADATA.js constant  
**Time:** 2 hours

```javascript
// checklist/js/data/ROOM_METADATA.js
const ROOM_METADATA = {
  bedroom: {
    master: {
      emoji: '🛏️',
      title: 'Master Bedroom',
      pluralTitle: 'Master Bedrooms'
    },
    guest: {
      emoji: '🛏️',
      title: 'Bedroom',
      pluralTitle: 'Bedrooms'
    },
    ensuite: {
      emoji: '🛏️',
      title: 'Bedroom (with Ensuite)',
      pluralTitle: 'Bedrooms (with Ensuite)'
    }
  },
  bathroom: {
    ensuite: {
      emoji: '🚿',
      title: 'Ensuite',
      pluralTitle: 'Ensuites'
    },
    family_bathroom: {
      emoji: '🚿',
      title: 'Bathroom',
      pluralTitle: 'Bathrooms'
    },
    powder_room: {
      emoji: '🚽',
      title: 'Powder Room',
      pluralTitle: 'Powder Rooms'
    }
  },
  // ... etc
};
```

**Task Steps:**
1. Read checklist-modern.html
2. Extract `<summary>` text and emoji for each `<details>`
3. Create ROOM_METADATA object
4. Verify: All rooms represented? All variants covered?

---

### 1.2: Extract Item Templates
**Goal:** Identify all items for each service type, room type, variant  
**Deliverable:** ITEM_DEFINITIONS.js constant (partial)  
**Time:** 4-6 hours (may require consolidation of similar items)

```javascript
// checklist/js/data/ITEM_DEFINITIONS.js
const ITEM_DEFINITIONS = {
  'eot': {
    'bedroom': {
      'master': [
        {
          taskKey: 'dust_ceiling',
          label: 'Dust ceiling',
          category: 'high_surfaces',
          hours: 0.5,
          difficulty: 'low'
        },
        // ... extract from checklist-modern.html
      ],
      'guest': [ /* ... */ ]
    },
    // ... all other rooms
  },
  // 'residential': { ... },
  // 'commercial': { ... }
};
```

**Task Steps:**
1. For each service type tab in checklist-modern.html:
   a. Extract all items from each room
   b. Identify common vs. variant-specific items
   c. Standardize labels/descriptions
   d. Assign hours (if not in HTML, estimate or mark TBD)
   e. Assign difficulty levels
2. Consolidate duplicate items (same task, different labels)
3. Verify counts: How many items per room type?

**Critical decision:** If items are scattered across multiple service types, start with EOT (most complete) and migrate others incrementally.

---

### 1.3: Extract Sub-Feature Modifiers
**Goal:** Identify how sub-features change items  
**Deliverable:** SUBFEATURE_MODIFIERS.js constant  
**Time:** 2 hours

```javascript
// checklist/js/data/SUBFEATURE_MODIFIERS.js
const SUBFEATURE_MODIFIERS = {
  'bathroom': {
    'double_shower': [
      {
        action: 'modify',
        itemIndex: 2,
        changes: {
          label: 'Clean double shower enclosure',
          hours: 1.5
        }
      },
      {
        action: 'add',
        position: 4,
        item: {
          taskKey: 'clean_shower_glass',
          label: 'Clean shower door glass',
          hours: 0.5
        }
      }
    ]
  }
  // ... etc
};
```

**Task Steps:**
1. Identify which items appear only for certain features
2. Identify which items change (hours, label) based on features
3. Map feature → modifications
4. For now: Only include features mentioned in existing HTML

---

## Phase 2: Factory Implementation (Week 2)

### 2.1: Build ChecklistPageGenerator Class
**Goal:** Create factory that reads Settings and generates rooms  
**Deliverable:** ChecklistPageGenerator.js  
**Time:** 4 hours

```javascript
// checklist/js/factory/ChecklistPageGenerator.js
class ChecklistPageGenerator {
  constructor(settings) {
    this.settings = settings;
    this.serviceType = settings.serviceType;
    this.propertyConfig = settings.propertyConfig;
    this.roomVariants = settings.roomVariants || {};
    this.roomSubFeatures = settings.roomSubFeatures || {};
  }
  
  generate() {
    const rooms = [];
    const roomTypes = this.getAvailableRoomTypes();
    
    roomTypes.forEach(roomType => {
      const count = this.propertyConfig[`${roomType}s`];
      for (let i = 1; i <= count; i++) {
        const roomKey = `${roomType}_${i}`;
        const roomConfig = this.buildRoomConfig(roomType, i, roomKey);
        const room = this.generateRoom(roomConfig);
        rooms.push(room);
      }
    });
    
    return rooms;
  }
  
  buildRoomConfig(roomType, number, roomKey) {
    const variant = this.roomVariants[roomKey] || this.getDefaultVariant(roomType, number);
    const subFeatures = this.roomSubFeatures[roomKey] || [];
    const metadata = this.getRoomMetadata(roomType, variant);
    
    return {
      serviceType: this.serviceType,
      roomId: roomKey,
      roomType: roomType,
      variant: variant,
      number: number,
      emoji: metadata.emoji,
      title: metadata.title,
      subFeatures: subFeatures
    };
  }
  
  generateRoom(roomConfig) {
    // See next section
  }
  
  // Helper methods (see below)
}
```

**Task Steps:**
1. Create class skeleton
2. Implement `generate()` method
3. Implement `buildRoomConfig()` method
4. Add helper methods (see 2.2)
5. Test with mock Settings object

---

### 2.2: Build Helper Methods
**Goal:** Implement lookups for room metadata, base items, default variants  
**Deliverable:** Added to ChecklistPageGenerator.js  
**Time:** 3 hours

```javascript
// Add to ChecklistPageGenerator class:

getAvailableRoomTypes() {
  // Return room types available for this service type
  const serviceDefinitions = ITEM_DEFINITIONS[this.serviceType];
  return Object.keys(serviceDefinitions);
}

getDefaultVariant(roomType, number) {
  if (roomType === 'bedroom') {
    return number === 1 ? 'master' : 'guest';
  }
  if (roomType === 'bathroom') {
    // Logic: first bathroom is ensuite if property > 2 bed
    const hasEnsuite = Object.values(this.roomVariants).includes('ensuite');
    return number === 1 && this.propertyConfig.bedrooms > 2 && !hasEnsuite
      ? 'ensuite'
      : 'family_bathroom';
  }
  return 'standard';
}

getRoomMetadata(roomType, variant) {
  return ROOM_METADATA[roomType]?.[variant] || {
    emoji: '❓',
    title: `${roomType.charAt(0).toUpperCase()}${roomType.slice(1)}`
  };
}

getBaseItems(serviceType, roomType, variant) {
  const items = ITEM_DEFINITIONS[serviceType]?.[roomType]?.[variant];
  if (!items) {
    throw new Error(`No items for ${serviceType}/${roomType}/${variant}`);
  }
  return JSON.parse(JSON.stringify(items));  // Deep copy
}

applySubFeatureModifications(baseItems, roomType, subFeatures) {
  let items = [...baseItems];
  
  subFeatures.forEach(subFeature => {
    const mods = SUBFEATURE_MODIFIERS[roomType]?.[subFeature];
    if (!mods) return;
    
    mods.forEach(mod => {
      if (mod.action === 'add') {
        items.splice(mod.position, 0, mod.item);
      } else if (mod.action === 'modify') {
        Object.assign(items[mod.itemIndex], mod.changes);
      }
    });
  });
  
  return items;
}
```

**Task Steps:**
1. Implement each helper
2. Write unit tests for edge cases
3. Test with various property configs

---

### 2.3: Implement generateRoom Method
**Goal:** Core method that builds AysRoomSection for each room  
**Deliverable:** generateRoom() complete  
**Time:** 3 hours

```javascript
// Add to ChecklistPageGenerator class:

generateRoom(roomConfig) {
  // Get base items
  const baseItems = this.getBaseItems(
    roomConfig.serviceType,
    roomConfig.roomType,
    roomConfig.variant
  );
  
  // Apply sub-feature modifications
  let items = this.applySubFeatureModifications(
    baseItems,
    roomConfig.roomType,
    roomConfig.subFeatures
  );
  
  // Normalize item IDs
  items = items.map((item, index) => ({
    ...item,
    itemId: `${roomConfig.roomType}_${roomConfig.serviceType}_${roomConfig.variant}_${String(index + 1).padStart(3, '0')}_${item.taskKey}`,
    room: roomConfig.roomId,
    serviceType: roomConfig.serviceType,
    variant: roomConfig.variant
  }));
  
  // Create AysRoomSection
  return new AysRoomSection({
    roomId: roomConfig.roomId,
    title: `${roomConfig.emoji} ${roomConfig.title}`,
    number: roomConfig.number,
    emoji: roomConfig.emoji,
    category: roomConfig.roomType,
    items: items
  });
}
```

**Task Steps:**
1. Implement method
2. Test with single room
3. Test with multiple rooms + variants + sub-features
4. Verify itemId generation is deterministic

---

## Phase 3: Integration (Week 2-3)

### 3.1: Wire Factory to HTML Form
**Goal:** Connect property size selector to factory  
**Deliverable:** Updated checklist-modern.html or new render function  
**Time:** 2 hours

```javascript
// checklist/js/init-checklist.js
document.addEventListener('DOMContentLoaded', () => {
  // Get settings from form (service type tab, property size selector)
  const settings = {
    serviceType: getSelectedServiceType(),  // From active tab
    propertyConfig: {
      bedrooms: getPropertySize(),  // From size selector
      bathrooms: getPropertyBathrooms(),  // Calculated or selected
      kitchens: 1,
      livingAreas: 1
    },
    roomVariants: {},
    roomSubFeatures: {}
  };
  
  // Generate rooms
  const factory = new ChecklistPageGenerator(settings);
  const rooms = factory.generate();
  
  // Render rooms
  const container = document.querySelector('#rooms-container');
  container.innerHTML = '';  // Clear hardcoded HTML
  
  rooms.forEach(room => {
    const element = room.render();
    container.appendChild(element);
  });
  
  // Attach state management (localStorage, etc.)
  rooms.forEach(room => {
    room.loadState();  // Restore from localStorage if available
  });
});

// Event listener: property size changes
document.querySelector('#property-size-selector').addEventListener('change', (e) => {
  // Regenerate settings with new size
  const newSettings = { /* ... */ };
  
  // Save current state before regenerating
  const currentState = rooms.map(r => r.exportItemState());
  
  // Regenerate factory
  const newFactory = new ChecklistPageGenerator(newSettings);
  const newRooms = newFactory.generate();
  
  // Restore state to new rooms (by itemId)
  const flatState = Object.assign({}, ...currentState);
  newRooms.forEach(room => room.restoreState(flatState));
  
  // Re-render
  // ... same render logic as above
});
```

**Task Steps:**
1. Identify where property size selector is
2. Create getPropertySize(), getPropertyBathrooms() functions
3. Tie to service type tabs (already exist)
4. Test: Size change preserves checked items? ✓
5. Test: Service type change regenerates items? ✓

---

### 3.2: Update State Persistence
**Goal:** Ensure localStorage works with generated items  
**Deliverable:** Updated AysRoomSection.loadState() and exportItemState()  
**Time:** 2 hours

```javascript
// Update AysRoomSection class:

loadState() {
  const stored = localStorage.getItem(`room_state_${this.roomId}`);
  if (!stored) return;
  
  const state = JSON.parse(stored);
  this.restoreState(state.itemStates);
  this.setNotes(state.notes);
}

saveState() {
  const state = {
    itemStates: this.exportItemState(),
    notes: this.notes,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(`room_state_${this.roomId}`, JSON.stringify(state));
}

// Call saveState() when items change
// (this.card.addEventListener('item-changed', () => this.saveState()))
```

**Task Steps:**
1. Test localStorage after property size change
2. Verify items retain checked state by itemId
3. Test page reload: do checked items persist? ✓

---

### 3.3: Update Quote Export
**Goal:** Ensure quote generation still works with generated items  
**Deliverable:** Updated quote export function  
**Time:** 1 hour

```javascript
// checklist/js/quote-export.js
function buildEnvelope(rooms) {
  return {
    metadata: {
      serviceType: getSelectedServiceType(),
      propertySize: `${getRoomCount('bedroom')} bed, ${getRoomCount('bathroom')} bath`,
      createdAt: new Date().toISOString()
    },
    rooms: rooms.map(room => room.serialize()),
    totals: {
      checkedCount: rooms.reduce((sum, r) => sum + r.getCheckedCount(), 0),
      totalCount: rooms.reduce((sum, r) => sum + r.getTotalCount(), 0),
      totalHours: rooms.reduce((sum, r) => sum + r.getTotalHours(), 0),
      estimatedPrice: calculatePrice(rooms)  // Existing function
    }
  };
}
```

**Task Steps:**
1. Verify quote calculations still work
2. Test export with generated items
3. Send to Web Worker and verify JSON validity

---

## Phase 4: Testing & Cleanup (Week 3)

### 4.1: Unit Tests
**Goal:** Ensure factory produces correct items  
**Deliverable:** test/ChecklistPageGenerator.test.js  
**Time:** 4 hours

```javascript
// Test cases:
test('3-bed property generates 3 bedrooms', () => {
  const settings = { bedrooms: 3 };
  const factory = new ChecklistPageGenerator(settings);
  const rooms = factory.generate();
  const bedrooms = rooms.filter(r => r.category === 'bedroom');
  expect(bedrooms).toHaveLength(3);
});

test('Ensuite variant has different items than family bathroom', () => {
  const factory1 = new ChecklistPageGenerator({ 
    roomVariants: { bathroom_1: 'ensuite' }
  });
  const ensuite = factory1.generateRoom({ /* ensuite config */ });
  
  const factory2 = new ChecklistPageGenerator({ 
    roomVariants: { bathroom_1: 'family_bathroom' }
  });
  const family = factory2.generateRoom({ /* family config */ });
  
  expect(ensuite.items.length).not.toEqual(family.items.length);
});

test('Sub-feature modifies item hours', () => {
  const rooms = factory.generate();
  const shower = rooms.find(r => r.roomId === 'bathroom_1');
  const showerItem = shower.items.find(i => i.taskKey.includes('shower'));
  
  // With double_shower sub-feature, hours should be higher
  expect(showerItem.hours).toBeGreaterThan(1.0);
});

test('ItemIds are deterministic', () => {
  const factory1 = new ChecklistPageGenerator(settings);
  const rooms1 = factory1.generate();
  
  const factory2 = new ChecklistPageGenerator(settings);
  const rooms2 = factory2.generate();
  
  rooms1.forEach((r, i) => {
    r.items.forEach((item, j) => {
      expect(item.itemId).toEqual(rooms2[i].items[j].itemId);
    });
  });
});
```

**Task Steps:**
1. Write 10-15 test cases covering:
   - Room count generation
   - Variant differences
   - Sub-feature additions/modifications
   - ItemId determinism
   - State persistence
2. Run tests, fix failures
3. Achieve 90%+ coverage

---

### 4.2: Integration Testing
**Goal:** End-to-end testing in browser  
**Deliverable:** Manual test checklist  
**Time:** 3 hours

**Test scenarios:**
1. Load page with EOT service type → 5 bedrooms → verify 5 bedroom sections appear
2. Change property size to 3 bedrooms → verify rooms 4-5 disappear, checked items persist
3. Check items in bedroom 1 → change service type → new items appear, old state lost (expected)
4. Add sub-feature (e.g., double shower) → verify new item appears
5. Page reload → verify checked items restored from localStorage
6. Generate quote → verify all checked items in export, hours sum correct

---

### 4.3: Remove Hardcoded HTML
**Goal:** Delete or archive checklist-modern.html when factory is complete  
**Deliverable:** Backup archive, clean HTML  
**Time:** 1 hour

**Steps:**
1. Verify factory generates all existing items
2. Verify all features work (quote, state, variants)
3. Archive checklist-modern.html → checklist-modern.html.backup
4. Replace with minimal HTML (just container divs)
5. Verify no regression

---

## Phase 5: Expansion (Future)

### 5.1: Add New Service Types
Once factory is stable, adding new service types is easy:
1. Define items in ITEM_DEFINITIONS['new_service_type']
2. Add room metadata if needed
3. Update service type selector in HTML
4. Done!

### 5.2: Add New Sub-Features
1. Define modifiers in SUBFEATURE_MODIFIERS
2. Add selector in HTML if needed
3. Done!

### 5.3: Add Commercial Service
1. Extract commercial items from existing HTML
2. Define in ITEM_DEFINITIONS['commercial']
3. Add commercial tab to HTML
4. Test quote calculation (different rates?)

---

## Timeline Summary

| Phase | Duration | Output |
|-------|----------|--------|
| 1: Foundation | 8 hours | Data constants (metadata, items, modifiers) |
| 2: Factory | 10 hours | ChecklistPageGenerator + helper methods |
| 3: Integration | 5 hours | Wired to HTML, state persistence, quotes |
| 4: Testing | 7 hours | Unit + integration tests, cleanup |
| **Total** | **~30 hours** | **Fully functional generated room system** |

---

## Risk Mitigation

1. **Risk:** Hardcoded items are incomplete or inaccurate
   **Mitigation:** Diff extracted items against existing checklist, fix before proceeding

2. **Risk:** State persistence breaks with new itemIds
   **Mitigation:** Deterministic ID generation, thorough localStorage testing

3. **Risk:** Quote calculation fails with generated items
   **Mitigation:** Compare old vs. new export format, verify Web Worker accepts JSON

4. **Risk:** Performance issues with 100+ items
   **Mitigation:** Lazy-load rooms, virtualize long lists if needed

---

## Success Criteria

✓ Factory generates all existing items  
✓ Itemids are deterministic (same settings → same IDs)  
✓ Property size changes preserve checked state  
✓ Service type changes regenerate correct items  
✓ Sub-features modify items correctly  
✓ Quote export includes all checked items  
✓ localStorage persistence works  
✓ All existing features (print, download, etc.) still work  
✓ Zero hardcoded room/item definitions in HTML  
✓ New room types can be added without touching HTML

---

## Next Steps

1. **Start Phase 1.1:** Extract room metadata from checklist-modern.html
2. **Create:** checklist/js/data/ROOM_METADATA.js
3. **Track progress** in this document

