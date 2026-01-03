# Component Architecture & Rendering Flow: AysRoomSection as Orchestrator

**Document Date**: January 3, 2026  
**Purpose**: Document the actual component hierarchy and how Settings flows into rendered items  
**Based On**: Reading AysDisclosureCard.js, AysListItemCheckbox.js, AysRoomSection.js, checklist-modern.html  
**Status**: Context Documentation (discovery of existing patterns)

---

## The Component Hierarchy (Current State)

```
AysRoomSection (Composite - the orchestrator)
├─ Metadata
│  ├─ id: "bedroom-1"
│  ├─ title: "Master Bedroom"
│  ├─ number: 1
│  ├─ emoji: "🛏️"
│  └─ category: "bedroom"
│
├─ AysDisclosureCard (Container component)
│  ├─ roomId: "bedroom-1"
│  ├─ title: "🛏️ Master Bedroom"
│  ├─ progress tracking:
│  │  ├─ checkedCount (real-time)
│  │  ├─ totalCount (fixed until items added/removed)
│  │  └─ progressPercent (0-100%)
│  │
│  └─ items array: [AysListItemCheckbox, AysListItemCheckbox, ...]
│
├─ Array of AysListItemCheckbox instances
│  ├─ itemId: "bed_001_dust_ceiling"
│  ├─ label: "Dust ceiling..."
│  ├─ metadata:
│  │  ├─ room: "bedroom-1"
│  │  ├─ category: "high_surfaces"
│  │  ├─ hours: 0.5
│  │  └─ difficulty: "low"
│  │
│  └─ [checked, notes, events]
│
└─ State tracking
   ├─ isOpen: boolean
   ├─ checkedCount: number
   ├─ notes: string (user observations)
   ├─ customServices: [] (discovered items)
   └─ timestamp: ISO string
```

**Key insight**: AysRoomSection is NOT just a wrapper. It's the **orchestrator** that:
- Owns the card instance
- Manages the items array
- Tracks state (notes, custom services, checked count)
- Exports for serialization
- Restores from localStorage

---

## How HTML Items Are Currently Rendered (Pattern Discovery)

### In checklist-modern.html (Hardcoded Pattern)

```html
<details data-room="bedroom-1">
  <summary>
    <span class="room-title">🛏️ Bedroom 1</span>
    <span class="room-progressbar">
      <span class="room-progressbar-fill" style="width: 0%"></span>
    </span>
    <span class="progress-badge">0/5</span>
  </summary>
  
  <div class="room-details">
    <div class="checklist-items">
      
      <label class="checklist-item" data-item-id="bed_001_dust_ceiling" 
             data-room="bedroom-1" data-category="high_surfaces" 
             data-hours="0.5" data-difficulty="low">
        <input type="checkbox" id="bed_001_dust_ceiling" 
               name="bedroom-1">
        <span class="checkbox-custom"></span>
        <span class="item-label">Dust ceiling...</span>
      </label>
      
      <!-- More items... -->
      
    </div>
  </div>
</details>
```

### Mapped to AysDisclosureCard Rendering

The component equivalent produces identical HTML structure:

```javascript
const card = new AysDisclosureCard({
  roomId: 'bedroom-1',
  title: 'Bedroom 1',
  emoji: '🛏️',
  checkedCount: 0,
  totalCount: 5,
  items: [
    { itemId: 'bed_001_dust_ceiling', label: 'Dust ceiling...', ... },
    // more items
  ]
});

// card.render() produces the same <details> structure as HTML
document.appendChild(card.render());
```

**Critical observation**: The HTML in checklist-modern.html is the **working prototype**. The component system (AysDisclosureCard + AysListItemCheckbox) is designed to **replicate this exact rendering pattern programmatically**.

---

## Data Attributes: The Metadata Carrier

Every `<label class="checklist-item">` carries metadata in data attributes:

```html
<label data-item-id="bed_001_dust_ceiling"      <!-- Deterministic ID -->
       data-room="bedroom-1"                     <!-- Which room owns this -->
       data-category="high_surfaces"             <!-- Item category -->
       data-hours="0.5"                          <!-- Time estimate -->
       data-difficulty="low">                    <!-- Complexity -->
```

This metadata is:
1. **Deterministic** (same ID always generates same way)
2. **Accessible to JavaScript** (querySelectorAll for collection)
3. **Queryable** (filter items by category, difficulty, hours)
4. **Serializable** (export to JSON with full context)

### Why Metadata Matters for Architecture

When building the Envelope, we don't just collect "checked items." We collect:
```javascript
{
  itemId: "bed_001_dust_ceiling",
  label: "Dust ceiling...",
  room: "bedroom-1",
  category: "high_surfaces",
  hours: 0.5,
  difficulty: "low",
  checked: true
}
```

This is why AysListItemCheckbox has `getMetadata()` and AysRoomSection has `getCheckedItems()` — they're building the envelope payload at item collection time.

---

## Settings → Items → Form Flow

### Current Flow (Hardcoded HTML)

```
User selects service type (EOT, Residential)
  ↓
checklist-modern.html shows ALL items for that service
  ↓
User enables property size selector (1-7 bedrooms)
  ↓
JavaScript shows/hides room sections via display:none
  ↓
User checks/unchecks items
  ↓
localStorage saves state by itemId
  ↓
On page reload, restoreState() rehydrates checkboxes
```

### Proposed Flow (Component-Based)

```
Settings Object (created once):
{
  serviceType: "EOT",
  propertyConfig: { bedrooms: 3, bathrooms: 2 },
  roomVariants: { bathroom_1: "ensuite", bathroom_2: "family" },
  roomSubFeatures: { bathroom_1: ["double_shower"], ... }
}
  ↓
Factory reads Settings
  ↓
Factory instantiates Room objects:
- Bedroom 1 (master, EOT items)
- Bedroom 2 (guest, EOT items)
- Bedroom 3 (guest, EOT items)
- Bathroom 1 (ensuite, EOT items for ensuite variant)
- Bathroom 2 (family_bathroom, EOT items for family variant)
  ↓
Each Room creates items array based on variant
  ↓
Each Room wraps items in AysRoomSection
  ↓
Each AysRoomSection renders via AysDisclosureCard
  ↓
Form displays all rooms with correct items
  ↓
User checks items → AysListItemCheckbox dispatches event
  ↓
AysRoomSection tracks state → AysDisclosureCard updates progress
  ↓
User hits "Quote" → AysRoomSection.serialize() exports to Envelope
  ↓
Web Worker receives Envelope with complete snapshot
```

---

## State Lifecycle (The Key to Persistence)

### State Lives in Multiple Places

1. **DOM (Real-time)**
   - Checkbox checked attribute
   - Progress bar width
   - Notes textarea content

2. **Memory (Component)**
   - AysRoomSection.state object
   - Cached checkedCount

3. **Storage (Durable)**
   - localStorage: `{ itemId: true/false }`
   - IndexedDB: Complete envelope (after submit)

### Why This Matters

When property size changes (3 bedrooms → 5 bedrooms):

```javascript
// Before re-render
const existingState = {};
existingRooms.forEach(room => {
  Object.assign(existingState, room.exportItemState());
});
// Result: { bed_001: true, bed_002: false, bath_001: true, ... }

// Factory generates new rooms (5 bedrooms)
const newRooms = factory.generateRooms();

// Restore checked items by ID
newRooms.forEach(room => {
  room.restoreState(existingState);
});

// Bedroom 1, 2, 3: retain checked items
// Bedroom 4, 5: appear unchecked (new rooms)
```

**Critical**: State is keyed by `itemId` (deterministic), NOT by room position. This prevents data loss.

---

## AysRoomSection: The Missing Documentation

### Constructor

```javascript
const room = new AysRoomSection({
  roomId: 'bedroom-1',          // Unique ID
  title: 'Master Bedroom',       // Display title
  number: 1,                      // Room number (for multi-room types)
  emoji: '🛏️',                   // Visual indicator
  category: 'bedroom',            // Room type classification
  items: [                        // Array of item configs
    {
      itemId: 'bed_001',
      label: 'Dust ceiling',
      room: 'bedroom-1',
      category: 'high_surfaces',
      hours: 0.5,
      difficulty: 'low'
    },
    // ... more items
  ]
});
```

### Key Methods

#### render()
```javascript
const htmlElement = room.render();
// Returns: <details> element (via AysDisclosureCard)
// Side effect: creates internal card instance, stores checkbox references
document.querySelector('#rooms-container').appendChild(htmlElement);
```

#### getCheckedItems()
```javascript
const checked = room.getCheckedItems();
// Returns array:
[
  {
    itemId: 'bed_001_dust_ceiling',
    label: 'Dust ceiling...',
    checked: true,
    hours: 0.5,
    category: 'high_surfaces'
  },
  // ... only checked items
]
```

**Used when**: Building the Envelope, calculating quote, showing progress.

#### serialize()
```javascript
const roomJson = room.serialize();
// Returns:
{
  roomId: 'bedroom-1',
  category: 'bedroom',
  title: 'Master Bedroom',
  number: 1,
  emoji: '🛏️',
  items: [ // Only checked items
    { itemId, label, checked, hours, category },
  ],
  state: {
    checkedCount: 3,
    totalCount: 5,
    notes: 'Carpet in good condition',
    customServices: [],
    timestamp: '2026-01-03T14:30:00Z'
  }
}
```

**Used when**: Exporting to JSON, sending to Web Worker, storing in IndexedDB.

#### exportItemState()
```javascript
const state = room.exportItemState();
// Returns: { 'bed_001_dust_ceiling': true, 'bed_002_windows': true }
// Only includes checked items
// Used for: localStorage persistence, temp export before re-render
```

#### restoreState(savedState)
```javascript
const savedState = {
  'bed_001_dust_ceiling': true,
  'bed_002_windows': true,
  'bed_003_doors': false
};
room.restoreState(savedState);
// Side effect: checks/unchecks checkboxes by ID
// Called after: property size change, page reload, discovery additions
```

#### getTotalHours()
```javascript
const hours = room.getTotalHours();
// Sums: all checked items' hours
// Returns: 3.5 (if 3 items checked with 0.5 + 1.0 + 2.0 hours)
// Used for: pricing calculation, staff time estimation
```

#### setNotes(notes)
```javascript
room.setNotes('Carpet is new, no heavy cleaning needed');
// Stored in: room.state.notes
// Exported in: serialize()
// Used for: supervisor observations, quality notes
```

#### addCustomService(service)
```javascript
room.addCustomService({
  serviceId: 'custom_001',
  label: 'Polish hardwood floor',
  charge: 50.00
});
// Stored in: room.state.customServices
// Exported in: serialize()
// Pattern: User discovers item during walk, adds it here
```

---

## How Settings Determines Items (The Missing Link)

### Current Gap

In the HTML, items are hardcoded. But when using the component system:

```javascript
// Settings say "Bathroom 1 is Ensuite with double shower"
const settings = {
  serviceType: 'EOT',
  roomVariants: { bathroom_1: 'ensuite' },
  roomSubFeatures: { bathroom_1: ['double_shower'] }
};

// Factory must read this and create items
const bathroom1Items = generateItemsForBathroom({
  serviceType: 'EOT',
  variant: 'ensuite',          // This determines base items
  subFeatures: ['double_shower'] // These add/modify items
});

// Example output:
[
  { itemId: 'bath_eot_ensuite_001', label: 'Dust ceiling', hours: 1.0 },
  { itemId: 'bath_eot_ensuite_002', label: 'Clean tiles', hours: 1.5 },
  { itemId: 'bath_eot_ensuite_003', label: 'Clean double shower enclosure', hours: 0.75 },
  { itemId: 'bath_eot_ensuite_004', label: 'Clean shower door glass', hours: 0.5 },
  // ... double_shower adds 2 extra items
]

// Then create room:
const room = new AysRoomSection({
  roomId: 'bathroom-1',
  title: 'Bathroom 1',
  emoji: '🚿',
  category: 'bathroom',
  items: bathroom1Items  // Items generated from Settings variant + subFeatures
});
```

**This is the critical piece**: Items are not static. They're **generated from Settings choices** at Factory time.

---

## Event Flow (How User Actions Cascade)

```
User clicks checkbox
  ↓
AysListItemCheckbox.bind() listens for 'change' event
  ↓
Checkbox fires 'change' → item dispatches 'item-changed' event
  ↓
Event bubbles up to AysDisclosureCard
  ↓
AysDisclosureCard.handleItemChecked() recounts:
  - Queries all checkboxes: checkedCount = new total
  ↓
AysDisclosureCard.updateProgress() updates:
  - Progress bar width
  - Progress badge (3/5)
  - Dispatches 'progress-updated' event
  ↓
Parent (Factory or form controller) listens to 'progress-updated'
  ↓
Parent updates global quote total:
  - Recalculates total hours
  - Recalculates total price
  - Updates quote display (real-time)
```

This is why data attributes matter: they make recalculation instant and accurate.

---

## The HTML Prototype as Evidence

The 2400-line checklist-modern.html is NOT a failure to optimize. It's:

1. **Working reference** - proves the structure works
2. **Pattern library** - shows how items should render
3. **Migration path** - components can be dropped in to replace hardcoded HTML
4. **Discovery tool** - lets us identify what needs to be generated vs. static

### What's Hardcoded (Can't Change)
- Service type tabs
- Meta information section (crew, date)
- Action buttons (print, download, etc.)

### What Needs Generation (From Settings)
- Room sections (how many bedrooms)
- Item lists (which items based on variant + subFeatures)
- Progress tracking

### What's Static Structure (Stays the Same)
- `<details>` disclosure pattern
- Item label structure
- Data attributes on every item
- Progress badge + bar placement

---

## Critical Architectural Rule: Deterministic IDs

Every item MUST have an ID that can be regenerated the same way:

```
itemId = roomTypeAbbr + serviceTypeAbbr + sequenceNumber + taskKey

Examples:
- bed_eot_001_dust_ceiling
  (Bedroom, EOT, 1st item, dust ceiling)
  
- bath_res_ensuite_003_clean_shower
  (Bathroom, Residential, Ensuite variant, 3rd item, clean shower)
  
- kitchen_eot_005_clean_oven
  (Kitchen, EOT, 5th item, clean oven)
```

Why deterministic?
- Same property config → same itemIds
- User can change property size → itemIds don't change
- localStorage can restore by itemId
- Envelope references items by itemId

---

## The Missing Piece: How Factory Generates Items from Settings

This is what needs to be documented next:

```
Settings Object
  ↓ (Factory reads)
  ↓
Determine available room types (based on serviceType)
  ↓
For each room in propertyConfig:
  Get variant (from roomVariants)
  Get subFeatures (from roomSubFeatures)
  ↓
Look up item template for:
  serviceType + roomType + variant + subFeatures
  ↓
Generate items array (deterministic IDs)
  ↓
Create AysRoomSection with items
  ↓
Return array of AysRoomSection objects
  ↓
Form controller renders each room
```

This flow is the bridge between **settings hierarchy** and **item rendering**.

---

## Next Documentation Steps

1. **ROOM_DEFINITIONS.md** - Map room types + variants to item generators
2. **SETTINGS_TO_ITEMS.md** - Document the Factory's item generation logic
3. **FACTORY_IMPLEMENTATION.md** - Pseudocode for ChecklistPageGenerator
4. **PLANNING.md** - Phased implementation with dependencies

All based on the understanding captured here.
