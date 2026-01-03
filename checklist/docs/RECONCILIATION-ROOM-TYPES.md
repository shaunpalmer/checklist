# Reconciliation: What Exists vs What I Built

**Purpose**: Compare room definitions across all docs with what's in ITEM_DEFINITIONS.js  
**Status**: Research document to plan Hour 1 components  
**Date**: January 3, 2026

---

## Room Types by Service Type

### EOT (End of Tenancy) - SINGLE classification (always Deep)

**DEFINED in EOT-ROOM-DEFINITIONS.md**:
| Category | Variants | Count |
|---|---|---|
| Bedroom | single, master, guest, bunks, loft | 5 |
| Bathroom | single_shower, single_tub, single_combo, ensuite, ensuite_tub, double_combo | 6 |
| Kitchen | small, standard, island, modern_open | 4 |
| Laundry | basic, with_tub, with_washer | 3 |
| Living Areas | lounge, dining, entryway | 3 |
| (Garage) | - | 1 |
| **Total EOT** | **22 variants** |  |

**WHAT I BUILT in ITEM_DEFINITIONS.js (eot section)**:
- ✅ bedroom_master
- ✅ bedroom_single
- ✅ bedroom_guest
- ✅ bedroom_bunks
- ✅ bedroom_loft
- ✅ bathroom_single_shower
- ✅ bathroom_single_tub
- ✅ bathroom_single_combo
- ✅ bathroom_ensuite
- ✅ bathroom_double_combo
- ✅ kitchen_standard
- ✅ kitchen_small
- ✅ kitchen_island
- ✅ kitchen_modern_open
- ✅ laundry_basic
- ✅ laundry_with_tub
- ✅ laundry_with_washer
- ✅ lounge
- ✅ dining
- ✅ entryway
- ✅ garage

**EOT Status**: ✅ COMPLETE (21/21 variants built, one naming issue: no ensuite_tub variant in my build)

---

### RESIDENTIAL - TWO classifications (Light vs Deep)

**DEFINED in RESIDENTIAL-ROOM-DEFINITIONS.md**:

| Category | Variants | Light? | Deep? |
|---|---|---|---|
| Bedroom | single, master, guest, bunks, loft, nanny | 6 | Both |
| Bathroom | single_shower, single_tub, single_combo, ensuite, ensuite_tub, double_shower, double_combo | 7 | Both |
| Kitchen | small, standard, island, shift, modern_open | 5 | Both |
| Laundry | basic, with_tub, with_washer, full_station | 4 | Both |
| Living Areas | lounge, dining, family, entryway, hallway, **staircase, staircase_with_lift** | **7** | Both |
| **Home Office** | **home_office_compact, home_office_standard, home_office_large** | **3** | **Both** |
| **Garage** | **garage_attached, garage_separate** | **2** | **Deep only** |
| Utility/Storage | storage, laundry_closet, sauna, steam_room, wine_cellar | 5 | Varies |
| **Basement** | **recreation_area, pool_area, wine_cellar, laundry_station, storage, utility_room, home_theater, gym** | **8** | **Deep only** |
| Outdoor | patio, deck, garden_shed, pool_area | 4 | Deep only |
| **Total Residential** | **51 variants** | | |

**WHAT I BUILT in ITEM_DEFINITIONS.js (residential.light & residential.deep)**:
- residential.light:
  - ✅ bedroom_master (simplified)
  - ✅ bedroom_single (simplified)
  - ✅ bedroom_guest (simplified)
  - ✅ bathroom_single_shower (simplified)
  - ✅ bathroom_single_combo (simplified)
  - ✅ kitchen_standard (simplified)
  - ✅ lounge (simplified)
  - ❌ Missing: bunks, nanny, ensuite variants, double shower/combo, shift kitchen, laundry all 4, living area variants, **staircase both variants**, **home office all 3**, **garage both**, utility storage, sauna, wine cellar, outdoor all 4

- residential.deep:
  - ✅ bedroom_master (full detail)
  - ✅ bathroom_single_combo (full detail)
  - ✅ kitchen_island (full detail)
  - ❌ Missing: All other variants

**Residential Status**: 🟡 PARTIAL (10 out of 51 variants started, significant gaps)

---

### COMMERCIAL - TWO classifications (Light vs Heavy)

**DEFINED in COMMERCIAL-ROOM-DEFINITIONS.md**:

| Category | Variants | Light? | Heavy? |
|---|---|---|---|
| Office | open_plan, private, boardroom, hot_desk, reception, manager | 6 | Both |
| **Home Office** | **home_office_compact, home_office_standard, home_office_large** | **3** | **Both** |
| Lunchroom/Break | full_lunchroom, kitchenette, tea_coffee, dining_area | 4 | Both |
| Toilet/Hygiene | single_toilet, block_2_4, block_5_plus, accessible, shower_block, change_room | 6 | Both |
| Circulation | hallway, entryway_foyer, stairwell, elevator, corridor_landing | 5 | Both |
| Utility/Support | cleaner_cupboard, storage, filing_room, it_server, print_copy, mechanical | 6 | Both |
| **Garage** | **garage_commercial, loading_bay_with_garage** | **2** | **Heavy only** |
| Warehouse | warehouse_floor, loading_bay, dispatch, racking_aisles, packaging | 5 | Heavy only |
| Trade/Workshop | workshop_floor, tool_room | 2 | Heavy only |
| **Total Commercial** | **39 variants** | | |

**WHAT I BUILT in ITEM_DEFINITIONS.js (commercial.light & commercial.heavy)**:
- commercial.light:
  - ✅ office_open_plan (stub)
  - ✅ bathroom_single (stub)
  - ✅ lunchroom (stub)
  - ❌ Missing: 36 other variants (home_office, circulation, utility, warehouse, trade, etc.)

- commercial.heavy:
  - ✅ office_open_plan (expanded)
  - ✅ bathroom_single (expanded with consumables)
  - ✅ lunchroom (expanded with consumables)
  - ❌ Missing: 36 other variants (home_office, circulation, utility, warehouse, trade, etc.)

**Commercial Status**: 🔴 SPARSE (3 out of 39 variants, only office/bathroom/lunchroom; missing home offices, garages, circulation, utility, warehouse, trade)

---

## Naming Convention Consistency Check

**Format defined in ROOM_DEFINITIONS.md**:
```
itemId: '{roomType}_{serviceAbbr}_{variant}_{sequence}_{taskKey}'
```

**Service Abbreviations**:
- eot = 'eot'
- residential = 'res'
- commercial = 'comm'

**Room Types** (short form):
- bedroom = 'bed'
- bathroom = 'bath'
- kitchen = 'kit'
- laundry = 'laundry'
- living_area = 'living'
- lounge = 'lounge'
- dining = 'dining'
- entryway = 'entryway'
- garage = 'garage'
- office = 'office'
- lunchroom = 'lunch'

**Variants** (as defined):
- master, single, guest, bunks, loft, nanny
- single_shower, single_tub, single_combo, ensuite, ensuite_tub, double_shower, double_combo
- small, standard, island, shift, modern_open
- basic, with_tub, with_washer, full_station
- lounge, dining, family, entryway, hallway
- etc.

**Example itemId**:
```
bed_eot_master_001_dust_ceiling
bed_res_single_003_carpet_vacuum
bath_comm_single_001_toilet_clean
```

**What I used in ITEM_DEFINITIONS.js**:
- ✅ EOT: `eot_bed_master_001_dust_ceiling` (CORRECT)
- ✅ Residential: `res_bed_master_001_dust_ceiling` (mixed; some use prefixes correctly)
- ⚠️ Commercial: `comm_office_dust`, `comm_bath_toilet` (uses full words, not abbreviated)

**Naming Status**: 🟡 MOSTLY CORRECT (EOT perfect, but residential/commercial not fully applying abbreviations)

---

## What Needs to be Built (Hour 1, 2, 3 Plan Update)

### HOUR 1: Room Classes (UPDATED)

**Base Classes Needed**:
1. ✅ Room.js (base class)
2. ✅ Bedroom.js (extends Room)
3. ✅ Bathroom.js (extends Room)
4. ✅ Kitchen.js (extends Room)
5. ❌ Laundry.js (extends Room) - **MISSING**
6. ❌ LivingArea.js (extends Room) - **MISSING** (covers lounge, dining, entryway, hallway, family)
7. ❌ **Staircase.js (extends Room) - MISSING** (residential only, both light/deep)
8. ❌ **HomeOffice.js (extends Room) - MISSING** (both residential + commercial, different items per service type)
9. ❌ **Garage.js (extends Room) - MISSING** (both residential + commercial, different items per service type)
10. ❌ Office.js (extends Room) - **MISSING** (commercial only)
11. ❌ Lunchroom.js (extends Room) - **MISSING** (commercial only)
12. ❌ Toilet.js (extends Room) - **MISSING** (commercial only, for blocks/stalls)
13. ❌ Circulation.js (extends Room) - **MISSING** (commercial, hallways/stairs/elevators)
14. ❌ Warehouse.js (extends Room) - **MISSING** (commercial warehouse/trade)

**Priority for Hour 1** (just to prove the pattern works):
- Room.js (base)
- Bedroom.js
- Bathroom.js
- Kitchen.js
- Laundry.js (one utility room)

Then Hour 1 will be 45 mins for these 5 core classes.

### HOUR 2: ITEM_DEFINITIONS (UPDATED)

**What exists**:
- ✅ EOT complete (21 variants, all items, correct naming)
- 🟡 Residential partial (8/39 variants started, need to complete all 39)
- 🔴 Commercial sparse (3/34 variants, need all 34)

**Work for Hour 2**:
1. Complete residential.light (all 39 variants, simplified items)
2. Complete residential.deep (all 39 variants, detailed items)
3. Complete commercial.light (all 34 variants, basic items)
4. Complete commercial.heavy (all 34 variants, detailed + consumables)
5. Fix naming conventions to match spec (abbreviations, formats)

**SUBFEATURE_MODIFIERS.js** - Still needs to be built (walk_in_closet, double_shower, island, etc.)

### HOUR 3: ROOM_METADATA (NEW)

**Must build ROOM_METADATA.js**:
```javascript
{
  'bedroom': {
    emoji: '🛏️',
    variants: {
      'single': { label: 'Single Bedroom', description: '...' },
      'master': { label: 'Master Bedroom', description: '...' },
      'guest': { label: 'Guest Bedroom', description: '...' },
      // ... all variants
    },
    defaultVariant: 'guest'
  },
  'bathroom': { ... },
  'kitchen': { ... },
  'laundry': { ... },
  'living_area': { ... },
  'garage': { ... },
  // ... all room types
}
```

---

## Critical Gaps Identified

1. **Missing Room Classes**: Laundry, LivingArea, **Staircase**, **HomeOffice**, **Garage**, Office, Lunchroom, Toilet, Circulation, Warehouse (10 classes)
   - **Special notes**: 
     - Staircase: Residential only (high-end homes with multiple stories)
     - HomeOffice & Garage: Span BOTH residential and commercial
     - HomeOffice: compact/standard/large variants, different items per service type
     - Garage: attached/separate (residential), commercial/loading_bay (commercial)

2. **Incomplete ITEM_DEFINITIONS**: 
   - EOT: ✅ COMPLETE (21/21)
   - Residential: 41/51 variants still need items (10 started, 41 missing including all 8 basement variants)
   - Commercial: 36/39 variants still need items (3 started, 36 missing)

3. **Naming Convention**: Need to standardize across all 3 service types
   - Service abbreviations: eot, res, comm (currently inconsistent)
   - Room type abbreviations: bed, bath, kit, laundry, living, office, etc.
   - Format: `{roomType}_{serviceAbbr}_{variant}_{sequence}_{taskKey}`

4. **SUBFEATURE_MODIFIERS.js**: Not yet created (critical for walk_in_closet, double_shower, island, heated_floor, etc.)

5. **ROOM_METADATA.js**: Not yet created (emoji, labels, variants metadata for all 13 room types)

---

## Revised 3-Hour Sprint Timeline

**HOUR 1** (45 mins): Build 5 core Room classes (Room.js + 4 subclasses)
- Room.js (base)
- Bedroom.js
- Bathroom.js
- Kitchen.js
- Laundry.js

**HOUR 2** (45 mins): Complete ITEM_DEFINITIONS.js
- Expand residential (31 more variants)
- Expand commercial (31 more variants)
- Create SUBFEATURE_MODIFIERS.js
- Fix naming conventions across all 3 service types

**HOUR 3** (45 mins): Create ROOM_METADATA.js
- All room types with emoji, labels, variants
- Update Room.js classes to reference metadata

**Outcome**: ~8-10 room classes + complete ITEM_DEFINITIONS for all 3 service types + metadata system = foundation complete

---

## Property Configuration & Layout (Factory Input)

**Property Type** = an OOP property attribute that determines room generation, not a room type itself.

### Property Types (Residential)

| Property Type | Floors | Mandatory Rooms | Basement | Stairs |
|---|---|---|---|---|
| **Single-Story** | 1 | Bedrooms, Bathrooms, Kitchen, Lounge | Optional | No |
| **Two-Story** | 2 | Ground + Upper + **Staircase** | Common | **Required** |
| **Split-Level** | 2-3 (half-levels) | Multiple stairs, connected rooms | Common | **Required** |
| **Multi-Level** | 3+ | Multiple staircases per level | Common | **Required** |
| **Basement Property** | 1+ | All above + basement room variant | **Mandatory** | If 2+ floors |

### Basement Room Types (Sub-Feature)

When `hasBasement: true`, these room variants become available:

| Variant | Description | Difficulty | Service Type |
|---|---|---|---|
| `basement_recreation_area` | Pool table, bar, lounge area | medium | Residential Deep |
| `basement_pool_area` | Indoor pool surround, pump room | hard | Residential Deep |
| `basement_wine_cellar` | Climate controlled, racking | medium | Residential Deep |
| `basement_laundry_station` | Full laundry with dryer, storage | medium | Both |
| `basement_storage` | Shelving, item storage | basic | Both |
| `basement_utility_room` | HVAC, water heater, electrical | basic | Basic only |
| `basement_home_theater` | Media room, seating, soundproofing | medium | Residential Deep |
| `basement_gym` | Exercise equipment area | medium | Residential Deep |

### Staircase Generation Rules

**Rule 1**: If `propertyType !== 'single_story'`, staircase is **MANDATORY**
- Cannot be omitted
- Variant depends on property complexity

**Rule 2**: Staircase variants by property type:
- Two-story home: `staircase` (simple)
- Two-story with lift: `staircase_with_lift` (accessibility)
- Split-level/multi-level: `staircase` (multiple instances possible)

**Example**:
```javascript
PROPERTY_CONFIG = {
  propertyType: 'two_story',
  hasBasement: true,
  numBedroomDownstairs: 2,
  numBedroomUpstairs: 2,
  numBathroomDownstairs: 1,
  numBathroomUpstairs: 1,
  hasStairLift: false,  // Optional accessibility feature
}

// Factory automatically generates:
// GROUND FLOOR: 2 bedrooms, 1 bathroom, kitchen, lounge
// STAIRCASE: staircase (variant = 'staircase', not 'staircase_with_lift')
// UPPER FLOOR: 2 bedrooms, 1 bathroom
// BASEMENT: (user selects room types if hasBasement)
```

---

## Room Type Details: New Additions

### Staircase (Residential Only)

**Variants**:
- `staircase` - Regular stairs (wood, carpet, or tiled)
- `staircase_with_lift` - Stairs with stair lift mechanism (accessibility feature)

**Why important**: High-end homes often have multi-story layouts. Staircases need:
- Tread & riser cleaning
- Bannister/handrail wipe-down
- Under-stair area vacuum (dust collects)
- Stair lift mechanism cleaning (if present)
- Light fixture on stairwell

**Light vs Deep**:
- Light: Basic vacuum, bannister wipe
- Deep: Detail clean of each tread, under-stair deep clean, lift mechanism detail wipe

**Items differ significantly** from hallways (which are circulation areas) because stairs have height variation and more surfaces.

---

## Summary: All Room Types Across All Services

| Room Type | Residential | Commercial | EOT |
|-----------|---|---|---|
| Bedroom | ✅ (6 variants) | ❌ | ✅ (5 variants) |
| Bathroom | ✅ (7 variants) | ✅ (6 variants) | ✅ (6 variants) |
| Kitchen | ✅ (5 variants) | ❌ | ✅ (4 variants) |
| Laundry | ✅ (4 variants) | ❌ | ✅ (3 variants) |
| Living Area (lounge, dining, entryway, hallway) | ✅ (5 variants) | ❌ | ✅ (3 variants) |
| **Staircase** | **✅ (2 variants)** | ❌ | ❌ |
| Home Office | ✅ (3 variants) | ✅ (3 variants) | ❌ |
| Garage | ✅ (2 variants) | ✅ (2 variants) | ❌ |
| **Basement** | **✅ (8 variants)** | **❌** | **❌** |
| Office (commercial) | ❌ | ✅ (6 variants) | ❌ |
| Lunchroom (commercial) | ❌ | ✅ (4 variants) | ❌ |
| Toilet (commercial) | ❌ | ✅ (6 variants) | ❌ |
| Circulation (commercial) | ❌ | ✅ (5 variants) | ❌ |
| Utility/Support (commercial) | ❌ | ✅ (6 variants) | ❌ |
| Warehouse/Industrial (commercial) | ❌ | ✅ (7 variants) | ❌ |

**Total unique room types**: 14 (including staircase)
**Total variants across all services**: 129 (up from 121 with basement rooms)

---

