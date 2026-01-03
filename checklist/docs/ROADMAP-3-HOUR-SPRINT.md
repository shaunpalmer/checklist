# 3-Hour Implementation Sprint: Foundation Tier (Critical Path Start)

**Date**: January 3, 2026  
**Sprint Duration**: 3 hours (1 AI pass)  
**Goal**: Lay foundation for factory pattern by creating base classes and centralizing item definitions  
**Success Criteria**: Base Room class + 2 concrete room subclasses + centralized ITEM_TEMPLATES structure (EOT service type complete)  

---

## Why 3 Hours? Why This Order?

From the master plan: **Tier 1 (Foundation) is 14 hours and blocks everything else.**

An AI pass is ~3 hours. Breaking it down:
- **Hour 1**: Create Room class hierarchy (base + subclasses)
- **Hour 2**: Extract and centralize EOT item definitions into AYSITEM_DEFINITIONS.js
- **Hour 3**: Create ROOM_METADATA.js with room types, variants, labels

After this sprint, you'll have:
- ✅ Concrete room objects that can be instantiated
- ✅ Item definitions centralized (not scattered in HTML)
- ✅ Metadata system in place for room labels/emojis
- ✅ Factory can start using these in sprint 2

**This unblocks**: Factory rewrite (Tier 2), component integration (Tier 3)

---

## HOUR 1: Room Class Hierarchy (45 mins of work)

### What to Build

Create file: `checklist/js/classes/Room.js` (base class)

```javascript
/**
 * Base Room class
 * All room types (Bedroom, Bathroom, Kitchen, etc.) extend this
 */
class Room {
  constructor(config) {
    // config = {
    //   roomId: 'bedroom-1',
    //   roomType: 'bedroom',           // 'bedroom', 'bathroom', 'kitchen', etc.
    //   variant: 'master',              // 'master', 'guest', 'ensuite', etc.
    //   serviceType: 'eot',             // 'eot', 'residential', 'commercial'
    //   number: 1,                      // which bedroom/bathroom (1-indexed)
    //   subFeatures: [],                // ['double_shower', 'walk_in_closet']
    //   metadata: {}                    // display metadata (emoji, title, etc.)
    // }
    
    this.roomId = config.roomId;
    this.roomType = config.roomType;
    this.variant = config.variant;
    this.serviceType = config.serviceType;
    this.number = config.number;
    this.subFeatures = config.subFeatures || [];
    this.metadata = config.metadata || {};
    
    // Item list (populated by subclass or getItems())
    this.items = [];
    
    // State (checked, notes, etc.)
    this.itemState = new Map();
  }
  
  /**
   * ABSTRACT: Subclasses override this
   * Returns array of items for this room + service type + variant + sub-features
   */
  getItems() {
    throw new Error(`getItems() not implemented for ${this.constructor.name}`);
  }
  
  /**
   * Apply sub-feature modifications to base items
   * e.g., "double_shower" adds items, modifies hours
   */
  applySubFeatureModifications(baseItems) {
    let items = [...baseItems];
    
    this.subFeatures.forEach(feature => {
      const mods = SUBFEATURE_MODIFIERS[this.roomType]?.[feature];
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
  
  /**
   * Generate deterministic item IDs
   * Format: {roomType}_{serviceAbbr}_{variant}_{sequence}_{taskKey}
   */
  normalizeItemIds(items) {
    const serviceAbbr = {
      'eot': 'eot',
      'residential': 'res',
      'commercial': 'com'
    }[this.serviceType] || 'unk';
    
    return items.map((item, index) => ({
      ...item,
      itemId: `${this.roomType}_${serviceAbbr}_${this.variant}_${String(index + 1).padStart(3, '0')}_${item.taskKey}`,
      room: this.roomId,
      serviceType: this.serviceType,
      variant: this.variant
    }));
  }
  
  /**
   * PUBLIC: Get fully populated items for this room
   * Called by Factory after instantiation
   */
  renderItems() {
    const baseItems = this.getItems();
    const modifiedItems = this.applySubFeatureModifications(baseItems);
    this.items = this.normalizeItemIds(modifiedItems);
    return this.items;
  }
  
  /**
   * Serialize room state for export/quote
   */
  serialize() {
    return {
      roomId: this.roomId,
      roomType: this.roomType,
      variant: this.variant,
      title: this.metadata.title,
      items: this.items.map(item => ({
        itemId: item.itemId,
        label: item.label,
        hours: item.hours,
        checked: this.itemState.get(item.itemId)?.checked || false,
        notes: this.itemState.get(item.itemId)?.notes || ''
      }))
    };
  }
}

export default Room;
```

### Create Subclasses (3 files: 15 mins each)

**File 1: `checklist/js/classes/Bedroom.js`**

```javascript
import Room from './Room.js';

class Bedroom extends Room {
  constructor(config) {
    super(config);
  }
  
  getItems() {
    // Lookup items for this service type + variant
    // e.g., ITEM_DEFINITIONS['eot']['bedroom']['master']
    const items = ITEM_DEFINITIONS[this.serviceType]?.['bedroom']?.[this.variant];
    
    if (!items) {
      console.warn(`No items defined for ${this.serviceType}/bedroom/${this.variant}`);
      return [];
    }
    
    // Return a copy (don't modify original)
    return JSON.parse(JSON.stringify(items));
  }
}

export default Bedroom;
```

**File 2: `checklist/js/classes/Bathroom.js`**

```javascript
import Room from './Room.js';

class Bathroom extends Room {
  constructor(config) {
    super(config);
  }
  
  getItems() {
    const items = ITEM_DEFINITIONS[this.serviceType]?.['bathroom']?.[this.variant];
    
    if (!items) {
      console.warn(`No items defined for ${this.serviceType}/bathroom/${this.variant}`);
      return [];
    }
    
    return JSON.parse(JSON.stringify(items));
  }
}

export default Bathroom;
```

**File 3: `checklist/js/classes/Kitchen.js`**

```javascript
import Room from './Room.js';

class Kitchen extends Room {
  constructor(config) {
    super(config);
  }
  
  getItems() {
    const items = ITEM_DEFINITIONS[this.serviceType]?.['kitchen']?.[this.variant];
    
    if (!items) {
      console.warn(`No items defined for ${this.serviceType}/kitchen/${this.variant}`);
      return [];
    }
    
    return JSON.parse(JSON.stringify(items));
  }
}

export default Kitchen;
```

### Success Criteria (Hour 1)

- [ ] Room.js created and syntactically correct
- [ ] Bedroom.js, Bathroom.js, Kitchen.js created
- [ ] Each class can be instantiated with a config object
- [ ] renderItems() method exists and calls getItems() → applySubFeatureModifications() → normalizeItemIds()
- [ ] serialize() method returns expected structure
- [ ] No errors when importing (even if ITEM_DEFINITIONS doesn't exist yet)

---

## HOUR 2: Centralize EOT Item Definitions (45 mins of work)

### What to Build

Create file: `checklist/js/data/ITEM_DEFINITIONS.js`

This file contains **all** item definitions organized hierarchically by serviceType → roomType → variant.

**Start with EOT service type (complete):**

```javascript
/**
 * ITEM_DEFINITIONS: Canonical item definitions by serviceType → roomType → variant
 * 
 * Structure:
 *   ITEM_DEFINITIONS[serviceType][roomType][variant] = [ items ]
 * 
 * Example:
 *   ITEM_DEFINITIONS['eot']['bedroom']['master'] = [ { taskKey, label, hours, ... }, ... ]
 */

const ITEM_DEFINITIONS = {
  'eot': {
    // ===== BEDROOM =====
    'bedroom': {
      'master': [
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
        {
          taskKey: 'clean_doors',
          label: 'Clean all doors and handles',
          category: 'doors_locks',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_wardrobe',
          label: 'Clean wardrobe (inside and outside)',
          category: 'closets',
          hours: 1.0,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_light_switches',
          label: 'Clean light switches and outlets',
          category: 'fixtures',
          hours: 0.25,
          difficulty: 'low'
        },
        {
          taskKey: 'vacuum_room',
          label: 'Vacuum entire room',
          category: 'flooring',
          hours: 0.75,
          difficulty: 'low'
        },
        {
          taskKey: 'mop_floor',
          label: 'Mop/clean hard flooring',
          category: 'flooring',
          hours: 0.75,
          difficulty: 'low'
        }
      ],
      'guest': [
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
          hours: 0.75,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_windows',
          label: 'Clean windows and sills',
          category: 'windows',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_doors',
          label: 'Clean all doors and handles',
          category: 'doors_locks',
          hours: 0.25,
          difficulty: 'low'
        },
        {
          taskKey: 'vacuum_room',
          label: 'Vacuum entire room',
          category: 'flooring',
          hours: 0.5,
          difficulty: 'low'
        }
      ]
    },
    
    // ===== BATHROOM =====
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
        {
          taskKey: 'clean_shower',
          label: 'Clean shower enclosure',
          category: 'fixtures',
          hours: 1.0,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_toilet',
          label: 'Clean and descale toilet',
          category: 'fixtures',
          hours: 0.75,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_basin',
          label: 'Clean basin and mirror',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_fixtures',
          label: 'Clean taps and rails',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'mop_floor',
          label: 'Mop bathroom floor',
          category: 'flooring',
          hours: 0.5,
          difficulty: 'low'
        }
      ],
      'family_bathroom': [
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
          hours: 2.0,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_shower_bath',
          label: 'Clean shower and bath',
          category: 'fixtures',
          hours: 1.5,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_toilet',
          label: 'Clean and descale toilet',
          category: 'fixtures',
          hours: 0.75,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_basins',
          label: 'Clean basins and mirrors',
          category: 'fixtures',
          hours: 0.75,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_fixtures',
          label: 'Clean taps and rails',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'mop_floor',
          label: 'Mop bathroom floor',
          category: 'flooring',
          hours: 0.5,
          difficulty: 'low'
        }
      ]
    },
    
    // ===== KITCHEN =====
    'kitchen': {
      'kitchen': [
        {
          taskKey: 'dust_ceiling',
          label: 'Dust ceiling',
          category: 'high_surfaces',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_cupboards',
          label: 'Clean inside and outside cupboards',
          category: 'kitchen_surfaces',
          hours: 2.0,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_benchtops',
          label: 'Clean benchtops',
          category: 'kitchen_surfaces',
          hours: 1.0,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_oven',
          label: 'Clean oven (exterior)',
          category: 'appliances',
          hours: 0.75,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_stovetop',
          label: 'Clean stovetop and range hood',
          category: 'appliances',
          hours: 1.0,
          difficulty: 'medium'
        },
        {
          taskKey: 'clean_sink',
          label: 'Clean and sanitize sink',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'clean_windows',
          label: 'Clean windows',
          category: 'windows',
          hours: 0.5,
          difficulty: 'low'
        },
        {
          taskKey: 'mop_floor',
          label: 'Mop kitchen floor',
          category: 'flooring',
          hours: 0.75,
          difficulty: 'low'
        }
      ]
    }
  },
  
  // Placeholder for other service types (to be filled in later sprints)
  'residential': {},
  'commercial': {}
};

export default ITEM_DEFINITIONS;
```

### Also Create: Sub-Feature Modifiers

Create file: `checklist/js/data/SUBFEATURE_MODIFIERS.js`

```javascript
/**
 * SUBFEATURE_MODIFIERS: How sub-features modify item lists
 * 
 * Structure:
 *   SUBFEATURE_MODIFIERS[roomType][subFeatureName] = [ modifications ]
 * 
 * Modification types:
 *   - action: 'add' → insert new item at position
 *   - action: 'modify' → change properties of existing item
 */

const SUBFEATURE_MODIFIERS = {
  'bedroom': {
    'walk_in_closet': [
      {
        action: 'add',
        position: 5,  // After wardrobe items
        item: {
          taskKey: 'clean_walk_in_closet',
          label: 'Clean walk-in closet (shelves, rods)',
          category: 'closets',
          hours: 0.75,
          difficulty: 'low'
        }
      }
    ],
    'balcony': [
      {
        action: 'add',
        position: 8,  // Near end
        item: {
          taskKey: 'clean_balcony',
          label: 'Clean balcony (sweep, wash railing)',
          category: 'exterior',
          hours: 1.0,
          difficulty: 'medium'
        }
      }
    ]
  },
  
  'bathroom': {
    'double_shower': [
      {
        action: 'modify',
        itemIndex: 2,  // The shower item
        changes: {
          label: 'Clean double shower enclosure',
          hours: 1.5  // Increased from 1.0
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
        position: 6,
        item: {
          taskKey: 'clean_heated_floor',
          label: 'Clean heated floor (special care)',
          category: 'flooring',
          hours: 0.75,
          difficulty: 'medium'
        }
      }
    ],
    'bidet': [
      {
        action: 'add',
        position: 5,
        item: {
          taskKey: 'clean_bidet',
          label: 'Clean and sanitize bidet',
          category: 'fixtures',
          hours: 0.5,
          difficulty: 'low'
        }
      }
    ]
  },
  
  'kitchen': {
    'island': [
      {
        action: 'add',
        position: 4,
        item: {
          taskKey: 'clean_island',
          label: 'Clean kitchen island (benchtop and sides)',
          category: 'kitchen_surfaces',
          hours: 0.75,
          difficulty: 'low'
        }
      }
    ],
    'range_hood': [
      {
        action: 'add',
        position: 5,
        item: {
          taskKey: 'clean_range_hood',
          label: 'Clean range hood filter',
          category: 'appliances',
          hours: 0.5,
          difficulty: 'medium'
        }
      }
    ]
  }
};

export default SUBFEATURE_MODIFIERS;
```

### Success Criteria (Hour 2)

- [ ] ITEM_DEFINITIONS.js created with EOT service type complete
  - [ ] bedroom/master with 8 items
  - [ ] bedroom/guest with 5 items
  - [ ] bathroom/ensuite with 7 items
  - [ ] bathroom/family_bathroom with 7 items
  - [ ] kitchen/kitchen with 8 items
- [ ] SUBFEATURE_MODIFIERS.js created with bedroom, bathroom, kitchen features
- [ ] Structure matches the Room.applySubFeatureModifications() logic
- [ ] All items have required fields (taskKey, label, hours, difficulty, category)
- [ ] Syntax is valid JavaScript (can be imported)

---

## HOUR 3: Create Room Metadata Config (45 mins of work)

### What to Build

Create file: `checklist/js/data/ROOM_METADATA.js`

This file defines room types, variants, emojis, and display labels—everything needed to render room headers without hardcoding strings.

```javascript
/**
 * ROOM_METADATA: Display metadata for all room types and variants
 * 
 * Used by Factory and UI to know:
 * - What emoji represents a bedroom/bathroom/kitchen
 * - What label to display
 * - What variants are available for each room type
 * - Default variant for each room type
 */

const ROOM_METADATA = {
  'bedroom': {
    emoji: '🛏️',
    label: 'Bedroom',
    variants: {
      'master': {
        label: 'Master Bedroom',
        description: 'Primary sleeping room (larger)'
      },
      'guest': {
        label: 'Guest Bedroom',
        description: 'Secondary bedrooms'
      },
      'ensuite': {
        label: 'Bedroom (Ensuite)',
        description: 'Bedroom with attached bathroom'
      }
    },
    defaultVariant: 'guest'  // First bedroom is master, others are guest
  },
  
  'bathroom': {
    emoji: '🚿',
    label: 'Bathroom',
    variants: {
      'ensuite': {
        label: 'Ensuite Bathroom',
        description: 'Attached to bedroom'
      },
      'family_bathroom': {
        label: 'Family Bathroom',
        description: 'Main bathroom'
      },
      'single_toilet': {
        label: 'Toilet',
        description: 'Small toilet room'
      }
    },
    defaultVariant: 'family_bathroom'
  },
  
  'kitchen': {
    emoji: '🍳',
    label: 'Kitchen',
    variants: {
      'kitchen': {
        label: 'Kitchen',
        description: 'Main kitchen'
      },
      'kitchenette': {
        label: 'Kitchenette',
        description: 'Small compact kitchen'
      }
    },
    defaultVariant: 'kitchen'
  },
  
  'living_room': {
    emoji: '🛋️',
    label: 'Living Room',
    variants: {
      'lounge': {
        label: 'Living Room',
        description: 'Main living area'
      }
    },
    defaultVariant: 'lounge'
  },
  
  'hallway': {
    emoji: '🚪',
    label: 'Hallway',
    variants: {
      'hallway': {
        label: 'Hallway/Landing',
        description: 'Corridors and landings'
      }
    },
    defaultVariant: 'hallway'
  },
  
  'laundry': {
    emoji: '🧺',
    label: 'Laundry',
    variants: {
      'laundry_room': {
        label: 'Laundry Room',
        description: 'Laundry area'
      }
    },
    defaultVariant: 'laundry_room'
  }
};

export default ROOM_METADATA;
```

### Also Update: Room Classes

Now that metadata exists, update Room.js to use it:

```javascript
// In Room constructor:
this.emoji = ROOM_METADATA[this.roomType]?.emoji || '📦';
this.label = ROOM_METADATA[this.roomType]?.variants?.[this.variant]?.label || `Room ${this.number}`;
this.description = ROOM_METADATA[this.roomType]?.variants?.[this.variant]?.description || '';
```

### Success Criteria (Hour 3)

- [ ] ROOM_METADATA.js created with all major room types
- [ ] Each room type has emoji, label, variants object
- [ ] Each variant has label and description
- [ ] Default variant specified for each room type
- [ ] Room.js updated to use metadata (emoji, label, description)
- [ ] Room classes can now access `this.emoji`, `this.label`, `this.description`
- [ ] Can instantiate: `new Bedroom({ ..., variant: 'master' })` and get correct emoji/label

---

## Sprint Completion Checklist

**By end of hour 3, you should have:**

- ✅ Room.js (base class, 100+ lines)
- ✅ Bedroom.js, Bathroom.js, Kitchen.js (subclasses, 15 lines each)
- ✅ ITEM_DEFINITIONS.js (EOT complete, ~300 lines)
- ✅ SUBFEATURE_MODIFIERS.js (~120 lines)
- ✅ ROOM_METADATA.js (~80 lines)

**Total new code: ~700 lines of implementation, 100% of Tier 1 foundation (one service type)**

**What this enables:**

```javascript
// This now works:
const bedroom = new Bedroom({
  roomId: 'bedroom-1',
  roomType: 'bedroom',
  variant: 'master',
  serviceType: 'eot',
  number: 1,
  subFeatures: ['walk_in_closet'],
  metadata: { emoji: '🛏️', title: 'Master Bedroom' }
});

bedroom.renderItems();
// Returns array of ~9 items (8 base + 1 walk_in_closet)
// Each with deterministic IDs: bed_eot_master_001_dust_ceiling, etc.

bedroom.serialize();
// Returns structured quote line-item format
```

---

## Why Stop at 3 Hours?

After 3 hours, you have:
- **Proof the pattern works** (instantiate a room, it generates correct items)
- **Foundation in place** (no more guessing about structure)
- **Clear stopping point** (changes in Hour 4 are "Factory uses these classes" not "what should a room class look like")

Hour 4-6 sprint (next pass) will be:
- Rewrite ChecklistPageGenerator to use these Room classes
- Test Factory can create 3-7 bedrooms, 1-4 bathrooms
- Wire up Envelope to collect serialized output

Hour 7-9 sprint (third pass) will be:
- Component integration (AysRoomSection renders room.items)
- Form state sync
- localStorage persistence

---

## Files to Create (Quick Reference)

```
checklist/js/classes/
  ├── Room.js (base class)
  ├── Bedroom.js
  ├── Bathroom.js
  └── Kitchen.js

checklist/js/data/
  ├── ITEM_DEFINITIONS.js (EOT complete, stubs for other service types)
  ├── SUBFEATURE_MODIFIERS.js
  └── ROOM_METADATA.js
```

---

## Notes for Implementation

1. **Don't worry about perfect**: This is the foundation. It doesn't have to be perfect, just complete enough to test.

2. **Import order matters**: 
   - ITEM_DEFINITIONS and SUBFEATURE_MODIFIERS must be available before Room classes are instantiated
   - Consider global scope or module imports

3. **Testing each hour**:
   - Hour 1: Can instantiate Bedroom, Bathroom, Kitchen without errors
   - Hour 2: ITEM_DEFINITIONS lookup works (`ITEM_DEFINITIONS['eot']['bedroom']['master']`)
   - Hour 3: Room instances have `.emoji`, `.label`, `.description` properties

4. **Success isn't perfection**: Success is having a working foundation that next sprint can build on. You won't have all service types, all room variants, all sub-features. That's OK. EOT + 3 room types is enough to prove the pattern.

5. **Next 3-hour sprint builds on this**: ChecklistPageGenerator will become a simple loop that instantiates these classes, calls `renderItems()`, wraps in AysRoomSection, done.

---

## Remember

You're not building the final product. You're building the **scaffold** that lets the final product be built cleanly. This foundation unblocks everything else.

After these 3 hours, the next AI pass will find well-structured code to build on instead of hardcoded HTML with copy-paste rooms.

Go.
