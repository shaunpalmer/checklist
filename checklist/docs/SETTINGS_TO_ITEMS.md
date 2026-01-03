# Settings to Items: The Data Flow Pipeline

**Document Date**: January 3, 2026  
**Purpose**: Map how Settings choices flow into generated room objects and rendered form  
**Pattern**: Settings → Factory → Rooms → Form  
**Status**: Architecture specification

---

## The Pipeline: Settings → Items → Form

```
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS OBJECT (User Input + Admin Config)                     │
│ {                                                               │
│   serviceType: 'eot' | 'residential' | 'commercial'           │
│   propertyConfig: { bedrooms, bathrooms, kitchens, ... }       │
│   roomVariants: { bathroom_1: 'ensuite', ... }                 │
│   roomSubFeatures: { bathroom_1: ['double_shower'] }           │
│   squareFootage, floorCount, etc.                              │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FACTORY PROCESSING (ChecklistPageGenerator)                      │
│ 1. Read serviceType → determine available room definitions      │
│ 2. Read propertyConfig → determine room count/types             │
│ 3. Read roomVariants → determine which variant per room         │
│ 4. Read roomSubFeatures → what features are in each room        │
│ 5. For each room: call generateRoom() → get items array         │
│ 6. Wrap items in AysRoomSection object                          │
│ 7. Return array of AysRoomSection instances                     │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ GENERATED ROOM OBJECTS (AysRoomSection instances)               │
│ [                                                               │
│   {                                                             │
│     roomId: 'bedroom-1',                                        │
│     title: '🛏️ Master Bedroom',                                │
│     category: 'bedroom',                                        │
│     items: [                                                    │
│       { itemId: 'bed_eot_master_001_...', ... },              │
│       { itemId: 'bed_eot_master_002_...', ... }               │
│     ]                                                           │
│   },                                                            │
│   { ... bathroom-1 ... },                                       │
│   { ... kitchen-1 ... }                                         │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ RENDERED FORM (in DOM)                                          │
│ <details data-room="bedroom-1">                                 │
│   <summary>🛏️ Master Bedroom 0/5</summary>                      │
│   <label data-item-id="bed_eot_master_001_...">                │
│     <input type="checkbox">                                     │
│     <span>Dust ceiling</span>                                   │
│   </label>                                                      │
│   ... more items for this room ...                             │
│ </details>                                                      │
│ <details data-room="bathroom-1">                               │
│   ... bathroom items ...                                        │
│ </details>                                                      │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USER INTERACTION (Real-time State Updates)                      │
│ - Checks/unchecks items                                        │
│ - Progress bars update                                          │
│ - Total hours, total price update in real-time                 │
│ - Notes added to rooms                                          │
│ - Custom services added during discovery                        │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ EXPORT (serialize() on each room)                               │
│ [                                                               │
│   {                                                             │
│     roomId: 'bedroom-1',                                        │
│     items: [ { itemId, label, hours, checked } ],             │
│     state: { checkedCount, totalCount, notes, ... }           │
│   },                                                            │
│   { ... }                                                       │
│ ]                                                               │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ENVELOPE (Complete snapshot for quote/submission)              │
│ {                                                               │
│   metadata: { serviceType, propertySize, ... },               │
│   rooms: [ ... ],                                               │
│   totals: { checkedCount, totalCount, hours, price },          │
│   timestamp: ISO string                                         │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Parse Settings Object

**Input (from HTML form or localStorage):**

```javascript
const settings = {
  // Service selection (tab clicked)
  serviceType: 'end_of_tenancy',  // or 'residential', 'commercial'
  
  // Property configuration (size selector)
  propertyConfig: {
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    livingAreas: 1,
    garages: 0,
    laundry: 'washer_dryer',  // 'none', 'washer_dryer', 'separate'
    squareFootage: 2500
  },
  
  // Room variants (user or auto-determined)
  roomVariants: {
    bedroom_1: 'master',           // 1st bedroom is always master
    bedroom_2: 'guest',            // Others are guest
    bedroom_3: 'guest',
    bathroom_1: 'ensuite',         // Ensuite bathroom
    bathroom_2: 'family_bathroom', // Main family bathroom
    kitchen_1: 'kitchen'           // Standard kitchen
  },
  
  // Sub-features (user selections or auto-detected)
  roomSubFeatures: {
    bedroom_1: ['walk_in_closet', 'balcony'],
    bathroom_1: ['double_shower', 'heated_floor'],
    bathroom_2: ['bidet'],
    kitchen_1: ['island', 'range_hood']
  },
  
  // Optional: Any overrides
  estimatedHours: null,
  specialRequests: [],
  commercialRates: null
};
```

**Key insight**: Each room is identified by `type_number` (bedroom_1, bathroom_2). This enables consistent mapping.

---

## Step 2: Factory Initialization

**The ChecklistPageGenerator reads Settings:**

```javascript
class ChecklistPageGenerator {
  constructor(settings) {
    this.settings = settings;
    this.serviceType = settings.serviceType;
    this.propertyConfig = settings.propertyConfig;
    this.roomVariants = settings.roomVariants;
    this.roomSubFeatures = settings.roomSubFeatures;
  }
  
  generate() {
    // Will populate this with rooms
    const rooms = [];
    
    // Step 2a: Determine available room types for this service
    const roomTypes = this.getAvailableRoomTypes();
    
    // Step 2b: For each room type, create room instances
    roomTypes.forEach(roomType => {
      const roomCount = this.propertyConfig[`${roomType}s`];
      
      for (let i = 1; i <= roomCount; i++) {
        const roomKey = `${roomType}_${i}`;
        const roomConfig = this.buildRoomConfig(roomType, i, roomKey);
        const room = this.generateRoom(roomConfig);
        rooms.push(room);
      }
    });
    
    return rooms;
  }
}
```

---

## Step 3: Room Configuration Building

**For each room, assemble its config:**

```javascript
buildRoomConfig(roomType, number, roomKey) {
  // roomType = 'bedroom'
  // number = 1
  // roomKey = 'bedroom_1'
  
  // Lookup: what variant is this room?
  const variant = this.roomVariants[roomKey] || this.getDefaultVariant(roomType, number);
  // Result: 'master' for bedroom_1, 'guest' for bedroom_2
  
  // Lookup: what sub-features does this room have?
  const subFeatures = this.roomSubFeatures[roomKey] || [];
  // Result: ['walk_in_closet', 'balcony']
  
  // Lookup: what metadata for display?
  const metadata = this.getRoomMetadata(roomType, number, variant);
  // Result: { emoji: '🛏️', title: 'Master Bedroom', ... }
  
  return {
    serviceType: this.serviceType,  // 'eot'
    roomId: roomKey,                // 'bedroom_1'
    roomType: roomType,             // 'bedroom'
    variant: variant,               // 'master'
    number: number,                 // 1
    emoji: metadata.emoji,          // '🛏️'
    title: metadata.title,          // 'Master Bedroom'
    subFeatures: subFeatures        // ['walk_in_closet', 'balcony']
  };
}
```

---

## Step 4: Item Generation

**For each room config, generate the items array:**

```javascript
generateRoom(roomConfig) {
  // roomConfig = {
  //   serviceType: 'eot',
  //   roomId: 'bedroom_1',
  //   roomType: 'bedroom',
  //   variant: 'master',
  //   number: 1,
  //   subFeatures: ['walk_in_closet', 'balcony']
  // }
  
  // Step 4a: Get base items from ITEM_DEFINITIONS
  const baseItems = this.getBaseItems(
    roomConfig.serviceType,
    roomConfig.roomType,
    roomConfig.variant
  );
  // Result: array of ~10 base items for 'eot' + 'bedroom' + 'master'
  
  // Step 4b: Apply sub-feature modifications
  let items = this.applySubFeatureModifications(
    baseItems,
    roomConfig.roomType,
    roomConfig.subFeatures
  );
  // Result: base items + modified hours + added items for sub-features
  
  // Step 4c: Normalize item IDs
  items = items.map((item, index) => ({
    ...item,
    itemId: `${roomConfig.roomType}_${this.serviceType}_${roomConfig.variant}_${String(index + 1).padStart(3, '0')}_${item.taskKey}`,
    room: roomConfig.roomId,
    serviceType: this.serviceType,
    variant: roomConfig.variant
  }));
  
  // Step 4d: Wrap in AysRoomSection
  const room = new AysRoomSection({
    roomId: roomConfig.roomId,
    title: `${roomConfig.emoji} ${roomConfig.title}`,
    number: roomConfig.number,
    emoji: roomConfig.emoji,
    category: roomConfig.roomType,
    items: items
  });
  
  return room;
}
```

---

## Step 5: Base Items Lookup

**How does the factory know which items belong to a service + room + variant?**

```javascript
getBaseItems(serviceType, roomType, variant) {
  // Lookup in global ITEM_DEFINITIONS
  // Format: ITEM_DEFINITIONS[serviceType][roomType][variant]
  
  const items = ITEM_DEFINITIONS[serviceType]?.[roomType]?.[variant];
  
  if (!items) {
    throw new Error(`No items defined for ${serviceType}/${roomType}/${variant}`);
  }
  
  // Return COPY (don't modify original)
  return JSON.parse(JSON.stringify(items));
}
```

**ITEM_DEFINITIONS is the source of truth:**

```javascript
const ITEM_DEFINITIONS = {
  'eot': {
    'bedroom': {
      'master': [
        { taskKey: 'dust_ceiling', label: 'Dust ceiling', hours: 0.5, ... },
        { taskKey: 'clean_walls', label: 'Clean/wipe walls', hours: 1.0, ... },
        // ...
      ],
      'guest': [
        // Fewer items than master
      ]
    },
    'bathroom': {
      'ensuite': [ ... ],
      'family_bathroom': [ ... ]
    }
  },
  'residential': {
    // Different items, more focus on maintenance
  },
  'commercial': {
    // Selective items, focus on customer-facing areas
  }
};
```

---

## Step 6: Sub-Feature Modifications

**How do sub-features change the item list?**

```javascript
applySubFeatureModifications(baseItems, roomType, subFeatures) {
  let items = [...baseItems];  // Copy array
  
  subFeatures.forEach(subFeature => {
    // Lookup modifications for this room type + sub-feature
    const mods = SUBFEATURE_MODIFIERS[roomType]?.[subFeature];
    
    if (!mods) {
      console.warn(`No modifiers found for ${roomType}/${subFeature}`);
      return;
    }
    
    // Apply each modification
    mods.forEach(mod => {
      if (mod.action === 'add') {
        // Insert new item at position
        items.splice(mod.position, 0, mod.item);
      } else if (mod.action === 'modify') {
        // Update existing item's properties
        Object.assign(items[mod.itemIndex], mod.changes);
      }
    });
  });
  
  return items;
}
```

**Example modification:**

```javascript
const SUBFEATURE_MODIFIERS = {
  'bathroom': {
    'double_shower': [
      {
        action: 'modify',
        itemIndex: 2,  // The shower item (0-indexed)
        changes: {
          label: 'Clean double shower enclosure',
          hours: 1.5    // Increased from 1.0
        }
      },
      {
        action: 'add',
        position: 4,   // After shower item
        item: {
          taskKey: 'clean_shower_glass',
          label: 'Clean shower door glass',
          hours: 0.5
        }
      }
    ]
  }
};
```

---

## Step 7: Real Data Flow Example

**User selects:**
- Service: End of Tenancy
- Property: 3 bed, 2 bath
- Bathroom 1 variant: Ensuite
- Bathroom 1 features: Double shower, Heated floor

**Settings object becomes:**

```javascript
{
  serviceType: 'eot',
  propertyConfig: { bedrooms: 3, bathrooms: 2 },
  roomVariants: {
    bedroom_1: 'master',
    bedroom_2: 'guest',
    bedroom_3: 'guest',
    bathroom_1: 'ensuite',
    bathroom_2: 'family_bathroom'
  },
  roomSubFeatures: {
    bathroom_1: ['double_shower', 'heated_floor']
  }
}
```

**Factory generates:**

1. **Bedroom 1** (Master):
   - baseItems (from ITEM_DEFINITIONS['eot']['bedroom']['master'])
   - Renders: 8 items (bed_eot_master_001 through 008)

2. **Bedroom 2** (Guest):
   - baseItems (from ITEM_DEFINITIONS['eot']['bedroom']['guest'])
   - Renders: 5 items (bed_eot_guest_001 through 005)

3. **Bedroom 3** (Guest):
   - Same as Bedroom 2
   - Renders: 5 items (bed_eot_guest_001 through 005)

4. **Bathroom 1** (Ensuite + double_shower + heated_floor):
   - baseItems (from ITEM_DEFINITIONS['eot']['bathroom']['ensuite'])
   - Apply 'double_shower' modification (modify item 2, add item after shower)
   - Apply 'heated_floor' modification (add new item)
   - Renders: 8 items total (base 6 + modifications add 2)

5. **Bathroom 2** (Family):
   - baseItems (from ITEM_DEFINITIONS['eot']['bathroom']['family_bathroom'])
   - No sub-features
   - Renders: 10 items

**Total: 5 rooms, ~45 items, all deterministically generated**

---

## Step 8: Exporting Generated Rooms

**When user clicks "Generate Quote," factory exports:**

```javascript
const envelope = {
  metadata: {
    serviceType: 'eot',
    propertySize: '3 bed, 2 bath',
    createdAt: new Date().toISOString()
  },
  
  rooms: [
    {
      roomId: 'bedroom-1',
      category: 'bedroom',
      title: 'Master Bedroom',
      variant: 'master',
      items: [
        {
          itemId: 'bed_eot_master_001_dust_ceiling',
          label: 'Dust ceiling',
          hours: 0.5,
          checked: true,
          category: 'high_surfaces'
        },
        // ... more items
      ],
      state: {
        checkedCount: 7,
        totalCount: 8,
        notes: 'Carpet in good condition'
      }
    },
    // ... more rooms
  ],
  
  totals: {
    checkedCount: 35,
    totalCount: 45,
    totalHours: 32.5,
    estimatedPrice: 1625.00  // @ $50/hour
  }
};
```

**This envelope is sent to:**
- Web Worker (for quote generation)
- IndexedDB (for persistence)
- Server (for quote history/submission)

---

## Critical Points: Settings → Items

1. **Settings is a snapshot** - Describes the property configuration at a moment
2. **Settings determines everything** - Service type, room count, variants, sub-features all come from Settings
3. **Generation is deterministic** - Same Settings always produces same items with same IDs
4. **Items are not hardcoded in HTML** - They're generated by the factory at form load time
5. **Variants cascade down** - Master bed always exists if bedrooms > 0; ensuite bathroom always exists if requested

---

## Default Room Assignment Logic

```javascript
getDefaultVariant(roomType, number) {
  // What variant should this room be if not explicitly set in roomVariants?
  
  if (roomType === 'bedroom') {
    return number === 1 ? 'master' : 'guest';
  }
  
  if (roomType === 'bathroom') {
    // Default depends on property size and previous assignments
    // If no 'ensuite' assigned yet and property > 2 bed: first bathroom is ensuite
    return this.propertyConfig.bedrooms > 2 && !this.hasEnsuite() 
      ? 'ensuite' 
      : 'family_bathroom';
  }
  
  if (roomType === 'kitchen') {
    return 'kitchen';  // Only one type typically
  }
  
  return 'standard';  // Fallback
}
```

---

## Next Document: IMPLEMENTATION_PLAN.md

This document describes:
1. What needs to be built (functions, constants, structures)
2. In what order (dependencies first)
3. How to test each piece
4. How to integrate with existing components
