# Object-Oriented Architecture: Room-Centric Design Pattern

> **CANONICAL FLOW**: Objects → Form → Factory → Envelope → Web Worker

**Document Date**: January 3, 2026  
**Purpose**: Document the OOP design pattern that enables the Factory → Envelope pattern for dynamic, extensible checklist generation  
**Audience**: Development team, future maintainers  
**Status**: Architecture Design (ready for implementation)

---

## Table of Contents
1. [Core Principle: The Animal→Dog Pattern Applied to Rooms](#core-principle-the-animaldo-pattern-applied-to-rooms)
2. [Why OOP Structure Matters](#why-oop-structure-matters)
3. [Object Hierarchy: Room as Root](#object-hierarchy-room-as-root)
4. [Component Composition](#component-composition)
5. [Factory Pattern: Room Generation](#factory-pattern-room-generation)
6. [Why This Prevents Problems](#why-this-prevents-problems)
7. [Edge Cases: The Real-World Test](#edge-cases-the-real-world-test)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Core Principle: The Animal→Dog Pattern Applied to Rooms

In classical OOP, we use inheritance and polymorphism:

```
Animal (base class)
  ├─ bark() → generic method
  ├─ Dog (subclass)
  │   └─ bark() → "woof woof" (override)
  └─ Cat (subclass)
      └─ bark() → "meow" (different implementation)
```

**Same principle applied to rooms:**

```
Room (base class)
  ├─ features: { ceiling, walls, windows, skirting, floor, ... }
  ├─ getItems() → generic method returning items array
  ├─ Bedroom (specialized room type)
  │   ├─ features: { bed, wardrobes, carpet/floor type, ... }
  │   └─ getItems(serviceType) → service-specific items
  │       ├─ EOT Bedroom → [dust ceiling, vacuum carpet, wipe skirting, ...]
  │       └─ Residential Bedroom → [tidy surfaces, change linens, ...]
  └─ Bathroom (different specialized room)
      ├─ features: { shower, toilet, tiles, mirrors, ... }
      └─ getItems(serviceType) → bathroom-specific items
```

**Key insight**: The room **type determines what items exist**. This is not a filter on a universal item list—it's the **fundamental definition** of that room.

---

## Why OOP Structure Matters

### 1. **Encapsulation: Each Room Knows Itself**
- A `Bedroom` object knows:
  - What features it has (bed frame, wardrobe, carpet)
  - What items to display for EOT vs Residential
  - How to render itself (collapsible card + items)
  - What state to persist (checked items by itemId)

**Contrast**: Without OOP, you have a global `ITEMS` list with dozens of conditional checks:
```javascript
// BAD: Procedural, unstructured
if (serviceType === 'EOT' && roomType === 'Bedroom') {
  show items A, B, C
} else if (serviceType === 'Residential' && roomType === 'Bedroom') {
  show items X, Y, Z
} else if ...
  // 50 more conditions
```

### 2. **Extensibility: New Rooms Don't Break Existing Code**
- Add a `GranneyFlat` room type?
- Just extend the `Room` class with its own features and `getItems()` method
- Factory creates it same way as Bedroom/Bathroom
- **No changes to existing room logic**

**Contrast**: Without OOP, you add another 10 conditional checks to the global list.

### 3. **Testability: Each Room is Isolated**
- Test `Bedroom.getItems('EOT')` in isolation
- Test `Bathroom.getItems('Residential')` in isolation
- Test rendering, state persistence, item collection per room type
- **No complex integration required to test one room**

### 4. **Maintainability: Clear Responsibility**
- Bedroom knows bedroom items
- Bathroom knows bathroom items
- Kitchen knows kitchen items
- Form doesn't need to know what items belong where—**ask the room**

---

## Object Hierarchy: Room as Root

### Base Room Class
```javascript
class Room {
  constructor(roomType, serviceType, config = {}) {
    this.roomType = roomType;        // 'Bedroom', 'Bathroom', 'Kitchen', etc.
    this.serviceType = serviceType;  // 'EOT', 'Residential', 'Commercial'
    this.roomNumber = config.roomNumber || 1;
    this.features = this.defineFeatures(roomType);
    this.items = this.getItems(serviceType);
    this.card = null;  // Will be AysDisclosureCard instance
  }

  defineFeatures(roomType) {
    // Subclass overrides this per room type
    return {};
  }

  getItems(serviceType) {
    // Return items array for this room + service type
    // Subclass overrides this
    return [];
  }

  renderCard() {
    // Create AysDisclosureCard with room name + items
    // Returns DOM element
  }

  exportState() {
    // Get all checked items from card
    // Return [{ itemId, hours, category, ... }, ...]
  }

  restoreState(checkedItemIds) {
    // Re-check items by ID after property size change
  }
}
```

### Specialized Room Types

**Bedroom** (extends Room)
```javascript
class Bedroom extends Room {
  defineFeatures(roomType) {
    return {
      ceiling: true,
      walls: true,
      windows: true,
      skirting: true,
      floor: true,
      wardrobe: true,
      bedFrame: true,  // EOT: no, Residential: yes
    };
  }

  getItems(serviceType) {
    if (serviceType === 'EOT') {
      return [
        { itemId: 'bed_001', label: 'Dust ceiling corners', hours: 0.5, category: 'high surfaces' },
        { itemId: 'bed_002', label: 'Spot clean walls', hours: 1.0, category: 'surfaces' },
        { itemId: 'bed_003', label: 'Clean window glass & frames', hours: 1.5, category: 'windows' },
        { itemId: 'bed_004', label: 'Wipe skirting boards', hours: 1.0, category: 'baseboards' },
        { itemId: 'bed_005', label: 'Vacuum carpet thoroughly', hours: 1.5, category: 'floor' },
      ];
    } else if (serviceType === 'Residential') {
      return [
        { itemId: 'bed_r_001', label: 'Dust surfaces & furniture', hours: 1.0, category: 'surfaces' },
        { itemId: 'bed_r_002', label: 'Change bed linens', hours: 0.5, category: 'bedding' },
        { itemId: 'bed_r_003', label: 'Vacuum & mop floor', hours: 1.5, category: 'floor' },
        { itemId: 'bed_r_004', label: 'Wipe window sills', hours: 0.75, category: 'windows' },
      ];
    }
  }
}
```

**Bathroom** (extends Room)
```javascript
class Bathroom extends Room {
  defineFeatures(roomType) {
    return {
      ceiling: true,
      walls: true,
      tiles: true,
      toilet: true,
      shower: true,
      mirror: true,
      floor: true,
    };
  }

  getItems(serviceType) {
    if (serviceType === 'EOT') {
      return [
        { itemId: 'bath_001', label: 'Clean toilet inside & outside', hours: 1.0, category: 'toilet' },
        { itemId: 'bath_002', label: 'Scrub shower/tub walls & floor', hours: 2.0, category: 'shower' },
        { itemId: 'bath_003', label: 'Clean mirror & light fixtures', hours: 0.5, category: 'fixtures' },
        { itemId: 'bath_004', label: 'Mop floor thoroughly', hours: 1.0, category: 'floor' },
      ];
    } else if (serviceType === 'Residential') {
      return [
        { itemId: 'bath_r_001', label: 'Clean & disinfect toilet', hours: 0.5, category: 'toilet' },
        { itemId: 'bath_r_002', label: 'Clean shower/tub', hours: 1.0, category: 'shower' },
        { itemId: 'bath_r_003', label: 'Wipe down surfaces', hours: 0.5, category: 'surfaces' },
      ];
    }
  }
}
```

**Key Design Pattern**: Each room type owns its features and items. **No global conditional logic.**

---

## Component Composition

Each `Room` object is **composite**—it contains sub-components:

```
Room
├─ features (metadata)
├─ items (array)
│  ├─ Item { itemId, label, hours, category }
│  ├─ Item { itemId, label, hours, category }
│  └─ Item { itemId, label, hours, category }
└─ card (AysDisclosureCard instance)
   ├─ title (e.g., "Bedroom 1")
   ├─ isExpanded (boolean)
   └─ itemElements (array of AysListItemCheckbox instances)
      ├─ checkbox 1 (Dust ceiling)
      ├─ checkbox 2 (Spot walls)
      └─ checkbox 3 (Wipe skirting)
```

### Component Roles

| Component | Role | Responsibility |
|-----------|------|-----------------|
| **Room** | Root object | Own room type, features, items; coordinate rendering |
| **AysDisclosureCard** | Container | Collapsible card; manage expand/collapse state; render all items |
| **AysListItemCheckbox** | Leaf | Single checkbox; persist state by itemId; emit change events |

### Why This Hierarchy Works

1. **Single Responsibility**: Each component has one job
2. **Composition Over Inheritance**: Room *has* Card which *has* Items (not deep inheritance chains)
3. **State Locality**: Each checkbox owns its checked state; Card owns expanded state; Room owns item list
4. **No Global State**: Everything is local to the room object

---

## Factory Pattern: Room Generation

The **Factory** creates room objects based on `PROPERTY_CONFIG`:

This is not arbitrary complexity. The Factory exists because **SOLID principles demanded it.**

When you ask "quote must fit the property," you force these questions:
- Which rooms exist? (1 bed, 3 beds, 7 beds?)
- What type are they? (master bedroom ≠ guest room ≠ ensuite)
- What items apply? (EOT bedroom ≠ Residential bedroom)
- What's the extension path? (Add granny flat without rewriting existing code?)

**There is no way to answer these without a Factory** that:
1. Reads configuration (property size + features)
2. Instantiates the correct Room objects (polymorphically)
3. Each Room knows its own items (encapsulation)
4. New room types don't break existing ones (Open/Closed principle)

This is why the Factory pattern isn't optional—it's the **structural consequence of SOLID principles applied to dynamic form generation.**

```javascript
class ChecklistPageGenerator {
  constructor(propertyConfig, serviceType) {
    this.propertyConfig = propertyConfig;  // { numBedrooms: 3, numBathrooms: 2 }
    this.serviceType = serviceType;        // 'EOT', 'Residential', etc.
  }

  generateRoomObjects() {
    const rooms = [];

    // Create N bedrooms
    for (let i = 1; i <= this.propertyConfig.numBedrooms; i++) {
      rooms.push(new Bedroom(
        'Bedroom',
        this.serviceType,
        { roomNumber: i }
      ));
    }

    // Create N bathrooms
    for (let i = 1; i <= this.propertyConfig.numBathrooms; i++) {
      rooms.push(new Bathroom(
        'Bathroom',
        this.serviceType,
        { roomNumber: i }
      ));
    }

    // Add common rooms (Kitchen, Living Room, etc.)
    rooms.push(new Kitchen('Kitchen', this.serviceType));
    rooms.push(new LivingRoom('Living Room', this.serviceType));

    // If granny flat detected: add it
    if (this.propertyConfig.hasGranneyFlat) {
      rooms.push(new GranneyFlat('Granny Flat', this.serviceType));
    }

    return rooms;  // Array of room objects
  }

  renderForm() {
    const rooms = this.generateRoomObjects();
    const formContainer = document.getElementById('checklist-form');
    
    rooms.forEach(room => {
      room.card = room.renderCard();  // Create AysDisclosureCard
      formContainer.appendChild(room.card.element);
    });

    this.rooms = rooms;  // Store for later export
  }
}
```

**Factory Benefit**: Change property size (3 bedrooms → 5 bedrooms)?
- Just update `PROPERTY_CONFIG.numBedrooms = 5`
- Call `generator.renderForm()` again
- Factory creates exactly 5 Bedroom objects with correct items
- **No manual room creation or conditional logic**

---

## Why This Prevents Problems

### Problem 1: Unstructured Data = Messy Conditions
**Without OOP:**
```javascript
// Global item list with nested conditions
const ALL_ITEMS = [
  { id: 'item1', label: 'Make beds', rooms: ['Bedroom'], services: ['Residential'] },
  { id: 'item2', label: 'Dust ceiling', rooms: ['Bedroom', 'Kitchen'], services: ['EOT', 'Residential'] },
  // ... 200 more items
];

// To render Bedroom 1 for EOT, you query this massive list:
const itemsToShow = ALL_ITEMS.filter(item => 
  item.rooms.includes('Bedroom') && 
  item.services.includes('EOT')
);
// But what if you add a Custom Item? Does it go in ALL_ITEMS? When? How do you update the filter?
```

**With OOP:**
```javascript
const bedroom = new Bedroom('Bedroom', 'EOT');
const items = bedroom.getItems('EOT');
// Done. Bedroom knows its items. No filtering logic needed.
// Custom items? Add method: bedroom.addCustomItem(customItemObj)
// Bedroom handles its own items list.
```

### Problem 2: Changes Ripple Across Code
**Without OOP:**
- Add a new room type? Update the global item list + update the filter logic + test all 5 service combinations
- Add a new feature to Bedroom? Update the item list + update the filter + update rendering logic

**With OOP:**
- Add a new room type? Create a new class that extends Room. Done.
- Add a new feature to Bedroom? Update the `defineFeatures()` method. Done.
- Changes are **local to the room class**, not scattered across the codebase

### Problem 3: Unexpected Room Types Break Code
**Without OOP:**
```javascript
// Someone adds extra bathroom or granny flat
// But the global item filter doesn't know about granny flats
// Result: Granny flat renders with NO items, or wrong items, or crashes
```

**With OOP:**
```javascript
// Add GranneyFlat class
class GranneyFlat extends Room {
  getItems(serviceType) {
    // Return granny flat specific items
  }
}

// In factory:
if (propertyConfig.hasGranneyFlat) {
  rooms.push(new GranneyFlat(...));
}
// Granny flat renders correctly, with correct items, same as any other room
```

---

## Edge Cases: The Real-World Test

### Edge Case 1: Extra Bathroom
**Real Scenario**: Property has 2 bedrooms + 3 bathrooms (unusual but happens)

```javascript
PROPERTY_CONFIG = {
  numBedrooms: 2,
  numBathrooms: 3,  // Extra bathroom
};

// Factory creates exactly 3 Bathroom objects
// Each Bathroom knows its items (EOT or Residential)
// Form renders with 2 bedrooms + 3 bathrooms
// Quote calculates pricing for 5 rooms total
// ✅ No special case handling needed
```

### Edge Case 2: Granny Flat
**Real Scenario**: Property has main house + granny flat (smaller second unit)

```javascript
PROPERTY_CONFIG = {
  numBedrooms: 3,
  numBathrooms: 2,
  hasGranneyFlat: true,
  grannyFlatBedrooms: 1,
  grannyFlatBathrooms: 1,
};

// Factory creates:
// - 3 Bedroom objects (main house)
// - 2 Bathroom objects (main house)
// - 1 Bedroom object (granny flat)
// - 1 Bathroom object (granny flat)
// ✅ Total 7 rooms, all with correct items for service type
```

### Edge Case 3: Service Type Change
**Real Scenario**: User changes service type from EOT to Residential

```javascript
// User clicks "Residential" radio button
PROPERTY_CONFIG.serviceType = 'Residential';

// Re-render:
generator = new ChecklistPageGenerator(PROPERTY_CONFIG, 'Residential');
generator.renderForm();

// Each room now returns different items via getItems('Residential')
// State persists by itemId (checked items are preserved)
// ✅ Form adapts, items change, state persists
```

### Edge Case 4: Property Size Change
**Real Scenario**: User selects 3 bedrooms, then changes to 5 bedrooms

```javascript
// Initial: 3 bedrooms
rooms = [Bed1, Bed2, Bed3, Bath1, Bath2];

// User clicks "5 bedrooms" button
PROPERTY_CONFIG.numBedrooms = 5;
generator.renderForm();

// New rooms generated:
rooms = [Bed1, Bed2, Bed3, Bed4, Bed5, Bath1, Bath2];  // New Bed4 & Bed5

// State restore:
// - Bed1, Bed2, Bed3: restore checked items from localStorage
// - Bed4, Bed5: start unchecked (new rooms)
// ✅ User doesn't lose their work, new rooms start fresh
```

---

## Implementation Roadmap

### Phase 1: Define Room Classes (Data Structure)
1. Create `ROOM_DEFINITIONS.md` (or `Room.js`)
   - Abstract `Room` base class
   - `Bedroom` class with EOT/Residential getItems()
   - `Bathroom` class with EOT/Residential getItems()
   - `Kitchen` class
   - `LivingRoom` class
   - Other common room types

2. Define `PROPERTY_CONFIG` schema
   - numBedrooms, numBathrooms
   - hasGranneyFlat, grannyFlatBedrooms, grannyFlatBathrooms
   - Other expandable properties

3. Test in isolation (unit tests)
   - `new Bedroom('Bedroom', 'EOT').getItems('EOT')` returns correct array
   - Service type change works correctly
   - Features are documented

### Phase 2: Factory Implementation
1. Implement `ChecklistPageGenerator`
   - Takes `PROPERTY_CONFIG` + `serviceType`
   - Generates room objects based on config
   - Renders form with AysDisclosureCard for each room

2. Wire property size selector buttons
   - Update `PROPERTY_CONFIG.numBedrooms`
   - Call `generator.renderForm()` to re-generate rooms
   - Export current state, restore by itemId

3. Test dynamic room generation
   - 1 bedroom → 7 bedrooms works
   - Granny flat toggle works
   - State persists across changes

### Phase 3: Envelope Integration
1. Implement `collectQuoteLineItems()`
   - Iterate through all room objects
   - Get checked items from each room
   - Return consolidated array with correct itemIds, hours, service type

2. Build envelope with complete room hierarchy
   - Envelope captures all rooms + all items (not selected individually, but as complete snapshot)
   - Includes property config for audit trail

3. Test end-to-end
   - Change property size
   - Check/uncheck items
   - Submit quote
   - Verify envelope contains all correct rooms + items

### Phase 4: Event Queueing & Web Worker
1. Envelope → event-worker.js
   - Serialize envelope to IndexedDB
   - Mark as pending

2. Worker processes envelope
   - Validate all required fields
   - Calculate final pricing
   - Queue for email delivery

3. Test offline scenario
   - Add items + submit quote (offline)
   - Page reloads
   - Quote is still in queue
   - When online, worker continues processing

---

## Summary: Why This Architecture Works

| Principle | Benefit | Example |
|-----------|---------|---------|
| **OOP Inheritance** | Each room type knows itself | Bedroom ≠ Bathroom (different items) |
| **Encapsulation** | Logic is local, not scattered | Bedroom owns its items, not global filter |
| **Composition** | Hierarchical structure prevents chaos | Room > Card > Item (clear layers) |
| **Factory Pattern** | Handle any property size | 1 bed → 7 bed, no code changes |
| **Polymorphism** | New room types don't break code | Add GranneyFlat class, everything works |
| **State Locality** | No global state mess | Each room manages its own items |
| **Extensibility** | Handle unexpected edge cases | Extra bathroom, granny flat, future rooms |

**Result**: A system that can handle real-world complexity without becoming a ball of mud.

---

## References

- **PHASE-2.1-QUICK-REFERENCE.md**: Current phase status & UI component specs
- **checklist-modern.html**: Current HTML form structure (2409 lines)
- **checklist-script.js**: Current JavaScript implementation (3258 lines)
- Related: Room class files (to be created in Phase 1)
