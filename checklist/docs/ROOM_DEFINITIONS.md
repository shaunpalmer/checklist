# Room Definitions: Mapping Service Types + Variants to Generated Items

**Document Date**: January 3, 2026  
**Purpose**: Define how rooms and items are generated from Settings + Property Config  
**Pattern**: Generated objects (not templates)  
**Status**: Architecture specification

---

## Core Principle: Objects > Templates

Instead of:
```html
<!-- Template in HTML - static, hardcoded -->
<details data-room="bedroom-1">
  <summary>Bedroom 1</summary>
  <label data-item-id="bed_001">Dust ceiling</label>
  <!-- More hardcoded items -->
</details>
```

We generate:
```javascript
// Generated object from Settings + RoomDefinitions
const room = {
  roomId: 'bedroom-1',
  title: 'Bedroom 1',
  items: [
    { itemId: 'bed_eot_001_dust_ceiling', label: 'Dust ceiling', hours: 0.5, ... },
    // ... MORE ITEMS GENERATED BASED ON SERVICE TYPE + VARIANT
  ]
};

// This becomes: new AysRoomSection(room) → render()
```

**Why?** Because what appears is determined by:
- Service type (EOT vs. Residential vs. Commercial)
- Room variant (Bedroom → Master/Guest/Ensuite, Bathroom → Ensuite/Family/Regular)
- Sub-features (Double shower? Separate toilet? Heated floor?)
- Property size (Number of each room type)

---

## Room Type Classification

### Level 1: Room Categories (Static)
```javascript
const ROOM_CATEGORIES = {
  BEDROOM: 'bedroom',
  BATHROOM: 'bathroom',
  KITCHEN: 'kitchen',
  LIVING_AREA: 'living_area',
  LAUNDRY: 'laundry',
  HALLWAY: 'hallway',
  GARAGE: 'garage'
};
```

### Level 2: Room Variants (Service-Type Dependent)

#### Bedroom Variants
```javascript
const BEDROOM_VARIANTS = {
  MASTER: 'master',           // Main sleeping room
  GUEST: 'guest',             // Secondary bedrooms
  ENSUITE: 'ensuite'          // Attached to master bathroom
};
```

When generating bedrooms:
- 1st bedroom is always MASTER (unless custom)
- 2nd+ bedrooms are GUEST
- If master has ensuite, that room generates as BEDROOM variant + ENSUITE special handling

#### Bathroom Variants
```javascript
const BATHROOM_VARIANTS = {
  ENSUITE: 'ensuite',         // Attached to master bedroom
  FAMILY: 'family_bathroom',  // Main family bathroom
  POWDER: 'powder_room',      // Small toilet room
  REGULAR: 'standard'         // Generic bathroom
};
```

#### Kitchen Variants
```javascript
const KITCHEN_VARIANTS = {
  KITCHEN: 'kitchen',         // Main kitchen
  KITCHENETTE: 'kitchenette' // Compact kitchen
};
```

### Level 3: Sub-Features (Modify Items Within a Variant)

```javascript
const ROOM_SUBFEATURES = {
  // Bathroom sub-features
  DOUBLE_SHOWER: 'double_shower',     // Two shower heads
  SEPARATE_TOILET: 'separate_toilet', // Toilet in different room
  HEATED_FLOOR: 'heated_floor',       // Floor heating system
  BIDET: 'bidet',                      // Bidet fixture
  JACUZZI: 'jacuzzi',                  // Spa tub
  
  // Kitchen sub-features
  ISLAND: 'island',                    // Island counter
  BREAKFAST_BAR: 'breakfast_bar',      // Bar seating
  RANGE_HOOD: 'range_hood',            // Ventilation
  APPLIANCES: 'stainless_appliances',  // Premium appliances
  
  // Bedroom sub-features
  WALK_IN_CLOSET: 'walk_in_closet',    // Large closet
  BALCONY: 'balcony',                  // Outside space
  CARPET_FLOORING: 'carpet',           // Carpet vs. hardwood
  
  // Garage sub-features
  EPOXY_FLOOR: 'epoxy_floor'           // Special flooring
};
```

---

## Item Generation: Service Type + Room Variant + Sub-Features

### Example 1: Master Bedroom (EOT)

**Input Settings:**
```javascript
{
  serviceType: 'end_of_tenancy',
  roomVariants: { bedroom_1: 'master' },
  roomSubFeatures: { bedroom_1: ['walk_in_closet', 'balcony'] }
}
```

**Generated Items:**
```javascript
[
  {
    itemId: 'bed_eot_master_001_dust_ceiling',
    label: 'Dust ceiling',
    category: 'high_surfaces',
    hours: 0.5,
    difficulty: 'low'
  },
  {
    itemId: 'bed_eot_master_002_clean_walls',
    label: 'Clean/wipe walls',
    category: 'surfaces',
    hours: 1.0,
    difficulty: 'low'
  },
  {
    itemId: 'bed_eot_master_003_clean_windows',
    label: 'Clean windows and sills',
    category: 'windows',
    hours: 0.75,
    difficulty: 'low'
  },
  {
    itemId: 'bed_eot_master_004_clean_closet',
    label: 'Wipe/vacuum walk-in closet',
    category: 'closets',
    hours: 0.5,
    difficulty: 'low'
  },
  {
    itemId: 'bed_eot_master_005_clean_balcony',
    label: 'Clean balcony (sweep, wash)',
    category: 'exterior',
    hours: 1.0,
    difficulty: 'medium'
  }
  // ... more items
]
```

**Logic:**
- Start with EOT master bedroom base items (01-03)
- Sub-feature `walk_in_closet` adds item 004
- Sub-feature `balcony` adds item 005
- Items are deterministic (always 001-005 for this combination)

---

### Example 2: Ensuite Bathroom (Residential)

**Input Settings:**
```javascript
{
  serviceType: 'residential',
  roomVariants: { bathroom_1: 'ensuite' },
  roomSubFeatures: { bathroom_1: ['double_shower', 'heated_floor'] }
}
```

**Generated Items:**
```javascript
[
  {
    itemId: 'bath_res_ensuite_001_dust_ceiling',
    label: 'Dust ceiling',
    hours: 0.5,
    difficulty: 'low'
  },
  {
    itemId: 'bath_res_ensuite_002_clean_tiles',
    label: 'Clean tiles and grout',
    hours: 1.5,
    difficulty: 'medium'
  },
  {
    itemId: 'bath_res_ensuite_003_clean_shower_enclosure',
    label: 'Clean double shower enclosure',
    hours: 1.5,  // Takes longer than single
    difficulty: 'medium'
  },
  {
    itemId: 'bath_res_ensuite_004_clean_shower_glass',
    label: 'Clean shower door glass',
    hours: 0.5,
    difficulty: 'low'
  },
  {
    itemId: 'bath_res_ensuite_005_clean_heated_floor',
    label: 'Clean heated floor (special care)',
    hours: 0.75,
    difficulty: 'medium'  // Needs care not to damage
  },
  {
    itemId: 'bath_res_ensuite_006_clean_fixtures',
    label: 'Clean and polish fixtures',
    hours: 0.5,
    difficulty: 'low'
  }
  // ... more items
]
```

**Logic:**
- Start with Residential ensuite base items (01-02)
- Sub-feature `double_shower` modifies item 003 (changes hours from 1.0 to 1.5) + adds item 004
- Sub-feature `heated_floor` adds item 005
- Remaining base items follow (006+)

---

## Item Definition Structure (Complete)

Each item object in the generated array:

```javascript
{
  // ID Components
  itemId: 'bed_eot_master_001_dust_ceiling',
  // Format: {roomType}_{serviceAbbr}_{variant}_{sequence}_{taskKey}
  
  // Display
  label: 'Dust ceiling',
  description: 'Use damp cloth to remove dust from ceiling surface',  // Optional detailed description
  
  // Categorization
  category: 'high_surfaces',  // Used for filtering/grouping
  
  // Time & Difficulty
  hours: 0.5,                // Decimal hours (0.25 = 15 min, 1.0 = 1 hour)
  difficulty: 'low',         // 'low', 'medium', 'high'
  
  // Metadata
  room: 'bedroom-1',          // Parent room ID
  serviceType: 'eot',         // Service type this item belongs to
  variant: 'master',          // Room variant that generated this
  subFeatures: [],            // Sub-features that caused this item
  
  // Optional: Pricing/Commercial
  charge: null,               // Custom charge if not hourly-based
  commercialFlag: false,      // Commercial service specific
  
  // State (filled at runtime)
  checked: false,
  notes: ''
}
```

---

## Item Categories (For Grouping/Filtering)

```javascript
const ITEM_CATEGORIES = {
  // Ceiling/High surfaces
  HIGH_SURFACES: 'high_surfaces',
  
  // Walls, paint, surfaces
  SURFACES: 'surfaces',
  
  // Windows, glass
  WINDOWS: 'windows',
  
  // Doors, handles, locks
  DOORS_LOCKS: 'doors_locks',
  
  // Floors, baseboards
  FLOORING: 'flooring',
  
  // Bathrooms
  TILES_GROUT: 'tiles_grout',
  FIXTURES: 'fixtures',
  
  // Kitchen
  KITCHEN_SURFACES: 'kitchen_surfaces',
  APPLIANCES: 'appliances',
  
  // Closets, storage
  CLOSETS: 'closets',
  
  // Exterior
  EXTERIOR: 'exterior',
  
  // Special/Custom
  SPECIAL_FEATURES: 'special_features'
};
```

---

## Room Generation Algorithm (Pseudocode)

```javascript
function generateRoom(config) {
  // config = {
  //   serviceType: 'eot',
  //   roomId: 'bedroom-1',
  //   roomType: 'bedroom',
  //   variant: 'master',
  //   number: 1,
  //   subFeatures: ['walk_in_closet', 'balcony']
  // }
  
  // Step 1: Get base items for this service + room type + variant
  const baseItems = ITEM_DEFINITIONS[config.serviceType][config.roomType][config.variant];
  
  // Step 2: Clone base items (don't modify original)
  const items = baseItems.map(item => ({ ...item }));
  
  // Step 3: For each sub-feature, modify or add items
  config.subFeatures.forEach(subfeature => {
    const modifications = SUBFEATURE_MODIFIERS[config.roomType][subfeature];
    
    modifications.forEach(mod => {
      if (mod.action === 'add') {
        // Add new item at specified position
        items.splice(mod.position, 0, mod.item);
      } else if (mod.action === 'modify') {
        // Modify existing item (e.g., increase hours)
        Object.assign(items[mod.itemIndex], mod.changes);
      }
    });
  });
  
  // Step 4: Update all item IDs to include room ID + variant info
  items.forEach((item, index) => {
    item.itemId = `${config.roomType}_${config.serviceType}_${config.variant}_${String(index + 1).padStart(3, '0')}_${item.taskKey}`;
    item.room = config.roomId;
    item.variant = config.variant;
    item.serviceType = config.serviceType;
  });
  
  // Step 5: Return as AysRoomSection config
  return {
    roomId: config.roomId,
    title: `${config.emoji} ${config.title}`,
    number: config.number,
    emoji: config.emoji,
    category: config.roomType,
    items: items
  };
}
```

---

## Hard-Coded Base Item Definitions (Example)

These are the **source of truth** for what items appear in each service type:

```javascript
const ITEM_DEFINITIONS = {
  'eot': {  // End of Tenancy
    'bedroom': {
      'master': [  // Master bedroom specific
        {
          taskKey: 'dust_ceiling',
          label: 'Dust ceiling',
          category: 'high_surfaces',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_walls',
          label: 'Clean/wipe walls',
          category: 'surfaces',
          hours: 1.0,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_windows',
          label: 'Clean windows and sills',
          category: 'windows',
          hours: 0.75,
          difficulty: 'low'
        },
        // ... more base items
      ],
      'guest': [  // Guest bedroom specific (smaller than master)
        {
          taskKey: 'dust_ceiling',
          label: 'Dust ceiling',
          category: 'high_surfaces',
          hours: 0.5,
          difficulty: 'low'
        },
        // ... fewer items than master
      ]
    },
    'bathroom': {
      'ensuite': [
        {
          taskKey: 'dust_ceiling',
          label: 'Dust ceiling',
          category: 'high_surfaces',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_tiles',
          label: 'Clean tiles and grout',
          category: 'tiles_grout',
          hours: 1.5,
          difficulty: 'medium'
        },
        // ...
      ],
      'family_bathroom': [
        // Larger, so more items
      ]
    }
  },
  'residential': {
    // Service type: residential has different base items and emphasis
    'bedroom': { /* ... */ },
    'bathroom': { /* ... */ }
  },
  'commercial': {
    // Service type: commercial focuses on high-touch, public areas
    'kitchen': { /* ... */ }
  }
};
```

---

## Sub-Feature Modifiers

Define how sub-features change the item list:

```javascript
const SUBFEATURE_MODIFIERS = {
  'bathroom': {
    'double_shower': [
      {
        action: 'modify',
        itemIndex: 2,  // The shower cleaning item
        changes: {
          label: 'Clean double shower enclosure',
          hours: 1.5,  // Increased from 1.0
          difficulty: 'medium'
        }
      },
      {
        action: 'add',
        position: 4,
        item: {
          taskKey: 'clean_shower_glass',
          label: 'Clean shower door glass',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        }
      }
    ],
    'heated_floor': [
      {
        action: 'add',
        position: 5,
        item: {
          taskKey: 'clean_heated_floor',
          label: 'Clean heated floor (special care)',
          category: 'flooring',
          hours: 0.75,
          difficulty: 'medium'
        }
      }
    ]
  },
  'bedroom': {
    'walk_in_closet': [
      {
        action: 'add',
        position: 4,
        item: {
          taskKey: 'clean_closet',
          label: 'Wipe/vacuum walk-in closet',
          category: 'closets',
          hours: 0.5,
          difficulty: 'low'
        }
      }
    ],
    'balcony': [
      {
        action: 'add',
        position: 5,
        item: {
          taskKey: 'clean_balcony',
          label: 'Clean balcony (sweep, wash)',
          category: 'exterior',
          hours: 1.0,
          difficulty: 'medium'
        }
      }
    ]
  }
};
```

---

## Room Definitions by Service Type (Summary)

| Service | Focus | Key Rooms | Typical Items |
|---------|-------|-----------|---------------|
| **EOT** | Move-out clean, all surfaces | All rooms | 80-120 items per property |
| **Residential** | Regular maintenance, special features | All rooms + storage | 100-150 items per property |
| **Commercial** | High-traffic areas, customer-facing | Lobby, kitchen, bathrooms | 40-80 items (selective) |

---

## Critical Rule: Deterministic ID Generation

**Every item must be regenerable with same ID:**

```javascript
// If settings are identical, items ALWAYS have same IDs
{
  serviceType: 'eot',
  bedrooms: 3,
  bathrooms: 2,
  roomVariants: { bathroom_1: 'ensuite' },
  roomSubFeatures: { bathroom_1: ['double_shower'] }
}

// Property 1: generates bed_eot_master_001_dust_ceiling
// Property 2: generates bed_eot_master_001_dust_ceiling (same settings → same ID)
// Property 3: generates bed_eot_master_001_dust_ceiling (same settings → same ID)

// This allows:
// 1. localStorage to track by itemId
// 2. State to persist across page reloads
// 3. Users to change property size without losing data
```

---

## Next Steps

1. **SETTINGS_TO_ITEMS.md** - Flow from Settings object through generation
2. **IMPLEMENTATION_PLAN.md** - Build the generator factory
3. **Code**: Implement generateRoom() function
4. **Code**: Build ITEM_DEFINITIONS and SUBFEATURE_MODIFIERS
5. **Code**: Wire up ChecklistPageGenerator to use room definitions
