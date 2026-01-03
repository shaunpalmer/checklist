# Item Templates: Task Definitions for Dynamic Room Generation

**Document Date**: January 3, 2026  
**Purpose**: Canonical task/item templates that feed Room classes and Factory generation  
**Status**: Normalised from Ultimate Checklist + Residential additions  
**Format**: Human-readable + JSON-parseable (can be consumed by Factory.js)

---

## Design Principle: Inheritance Through Templates

All rooms inherit a **base template** ("All Rooms"), then add room-specific tasks.

**Why this structure?**
- Eliminates duplication (80% of tasks repeat)
- Enables dynamic room discovery (custom rooms reuse base logic)
- Keeps Factory simple (apply template, add overrides)
- Survives property size changes (state persists, template is re-applied)

---

## BASE TEMPLATE: "All Rooms"

These tasks apply to **every room type** unless explicitly excluded.

### Category: High-Level Dust & Cobwebs
- `dust_ceiling_cobwebs` — Carefully dust to remove all high-level dust and cobwebs (0.5 hrs)

### Category: Windows
- `clean_windows_internal` — Clean all internal windows, frames, and glass (1.0 hrs)

### Category: Doors & Storage
- `clean_doors_wardrobe_drawers` — Wash all doors, inside and outside of wardrobes, drawers, shelves (1.5 hrs)

### Category: Ledges & Trims
- `clean_ledges_sills` — Clean ledge areas: sills, skirting boards, radiators, door tops, mouldings (1.0 hrs)

### Category: Fixtures & Fittings
- `clean_fixtures_lights_vents` — Clean fixtures & fittings within reach: lights, vents, switches, sockets (0.5 hrs)

### Category: Reflective Surfaces
- `clean_glass_mirrors_tables` — Clean all glass surfaces, mirrors, and tables (0.75 hrs)

### Category: Floors
- `vacuum_floors_edges_corners` — Vacuum floors, pulling out items and using nozzle for edges/corners (1.5 hrs)
- `mop_hardwood_floors` — Mop wooden or hard floors where applicable (1.0 hrs)

---

## Room-Specific Templates

Each room **inherits all BASE TEMPLATE items**, then adds these room-specific tasks.

### 🛏️ BEDROOM

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Surfaces**
- `spot_clean_walls` — Spot clean walls, removing marks and stains (1.0 hrs)
- `wipe_skirting_marks` — Wipe visible marks off skirting boards (0.75 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + BEDROOM-EOT (3) = **12 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Surfaces & Furniture**
- `dust_furniture_surfaces` — Dust surfaces and furniture items (1.0 hrs)
- `spot_clean_walls` — Spot clean walls, removing marks and stains (0.75 hrs)

**Category: Bedding**
- `change_bed_linens` — Change bed linens (if applicable) (0.5 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + BEDROOM-RES (4) = **13 items**

---

### 🚿 BATHROOM

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Tiles & Surfaces**
- `clean_tiles_floor` — Clean all tiles to floor level, grout where needed (2.0 hrs)

**Category: Fixtures**
- `clean_bath` — Clean bath including fittings and drain (1.5 hrs)
- `clean_shower_drain_fittings` — Clean shower including drain, fittings, glass doors, shelving (2.0 hrs)
- `clean_toilet_basin` — Clean toilet, basin, and pedestals (1.0 hrs)

**Category: Detail Cleaning**
- `descale_fixtures` — Descale fixtures and surfaces as required (0.75 hrs)
- `clean_taps_rails_radiators` — Clean taps, rails, towel holders, radiators, shelves (0.75 hrs)

**Total items in room**: BASE (9) + BATHROOM-EOT (6) = **15 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Fixtures**
- `clean_bath` — Clean bath including fittings and drain (1.0 hrs)
- `clean_shower` — Clean shower and fixtures (1.0 hrs)
- `clean_toilet_basin` — Clean toilet and basin (0.75 hrs)

**Category: Detail Cleaning**
- `descale_fixtures` — Descale fixtures as required (0.5 hrs)

**Total items in room**: BASE (9) + BATHROOM-RES (4) = **13 items**

---

### 🍳 KITCHEN

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Cupboards & Storage**
- `clean_cupboards_inside_outside` — Clean inside and outside of all cupboards (1.5 hrs)

**Category: Benchtops & Surfaces**
- `clean_benchtops_tops_edges` — Clean benchtops (tops and edges) thoroughly (1.0 hrs)
- `clean_backsplash` — Clean backsplash area (0.75 hrs)
- `clean_surfaces_items` — Clean surfaces and individual kitchen items (1.0 hrs)

**Category: Appliances**
- `clean_sink_sanitise` — Thoroughly clean and sanitise sink (1.0 hrs)
- `clean_oven_trays_racks` — Clean oven including trays, racks, and rangehood filter (2.0 hrs)

**Category: Pantry**
- `clean_pantry` — Clean pantry (0.75 hrs)

**Total items in room**: BASE (9) + KITCHEN-EOT (7) = **16 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Cupboards & Benchtops**
- `clean_cupboards_inside_outside` — Clean inside and outside of cupboards (1.0 hrs)
- `clean_benchtops` — Clean benchtops and edges (0.75 hrs)

**Category: Appliances & Sink**
- `clean_sink` — Clean and sanitise sink (0.5 hrs)
- `clean_oven_rangehood` — Clean oven and rangehood filter (1.0 hrs)

**Total items in room**: BASE (9) + KITCHEN-RES (4) = **13 items**

---

### 🛋️ LIVING ROOM

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Surfaces**
- `spot_clean_walls` — Spot clean walls, removing marks and stains (1.0 hrs)
- `wipe_skirting_marks` — Wipe visible marks off skirting boards (0.75 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + LIVING-EOT (3) = **12 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Surfaces & Items**
- `dust_surfaces_furniture` — Dust surfaces and furniture items (1.0 hrs)
- `spot_clean_walls` — Spot clean walls (0.75 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + LIVING-RES (3) = **12 items**

---

### 🚪 HALLWAY / STAIRS / LANDING / PORCH

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Surfaces**
- `spot_clean_walls` — Spot clean walls on all levels (1.0 hrs)
- `wipe_skirting_marks` — Wipe visible marks off skirting boards (0.75 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + HALLWAY-EOT (3) = **12 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Surfaces**
- `spot_clean_walls` — Spot clean walls (0.75 hrs)

**Category: Fascia**
- `wipe_fascia_boards` — Wipe visible marks from fascia/facing boards (0.5 hrs)

**Total items in room**: BASE (9) + HALLWAY-RES (2) = **11 items**

---

### 🚽 WC / SEPARATE TOILET

#### Service Type: EOT (End of Tenancy)
Additional tasks (beyond base):

**Category: Fixtures**
- `clean_toilet_basin` — Clean toilet, basin, and pedestal thoroughly (1.0 hrs)

**Category: Mirror & Storage**
- `clean_mirror_basin_surround` — Clean hand basin, mirror, and surrounding area (0.5 hrs)

**Category: Cupboards**
- `vacuum_cupboards` — Vacuum inside cupboards (0.5 hrs)
- `vacuum_corners_skirting` — Vacuum corners and next to skirting edges (0.5 hrs)

**Total items in room**: BASE (9) + WC-EOT (4) = **13 items**

#### Service Type: Residential
Additional tasks (beyond base):

**Category: Fixtures**
- `clean_toilet_basin` — Clean toilet and basin (0.75 hrs)

**Category: Mirror**
- `clean_mirror` — Clean mirror and surround (0.25 hrs)

**Total items in room**: BASE (9) + WC-RES (2) = **11 items**

---

## Custom Room Support (Discovery Pattern)

When a user discovers a custom room (Library, Sauna, Pool Room, Nook, Coffee Stand), the system:

1. Creates a **generic custom room instance**
2. Applies the **BASE_TEMPLATE** (universal tasks)
3. Allows **manual task addition** (no template override)
4. Preserves **custom items** separately in the Factory

### Example: Library (Custom Discovery)

```
Service Type: EOT
Room Type: Custom (Library)
Items Provided By: BASE_TEMPLATE (inherited)
  - dust_ceiling_cobwebs ✓
  - clean_windows_internal ✓
  - clean_doors_wardrobe_drawers ✓
  - [... all 9 base items ...]
Items Added Manually (by user): 
  - Dust bookshelves (0.5 hrs) [CUSTOM]
  - Clean ladder (0.25 hrs) [CUSTOM]
Total: 9 (base) + 2 (custom) = 11 items
```

---

## Implementation Notes for Factory

### Data Structure (JSON format, for consumption by Factory)

Each room template will be stored as:

```json
{
  "roomType": "Bedroom",
  "serviceType": "EOT",
  "baseTemplate": "ALL_ROOMS",
  "items": [
    {
      "itemId": "bed_eot_001_dust_ceiling",
      "label": "Carefully dust to remove all high-level dust and cobwebs",
      "hours": 0.5,
      "category": "high_surfaces",
      "difficulty": "low",
      "source": "base_template"
    },
    {
      "itemId": "bed_eot_002_windows",
      "label": "Clean all internal windows, frames, and glass",
      "hours": 1.0,
      "category": "windows",
      "difficulty": "medium",
      "source": "base_template"
    },
    {
      "itemId": "bed_eot_room_001_spot_walls",
      "label": "Spot clean walls, removing marks and stains",
      "hours": 1.0,
      "category": "surfaces",
      "difficulty": "medium",
      "source": "bedroom_eot_template"
    }
  ]
}
```

### Deterministic ID Structure

`itemId = roomTypeAbbr + serviceTypeAbbr + sequenceNumber + taskKey`

Examples:
- `bed_eot_001_dust_ceiling` (Bedroom, EOT, 1st item, dust ceiling)
- `bath_res_004_clean_bath` (Bathroom, Residential, 4th item, clean bath)
- `kit_eot_007_clean_oven` (Kitchen, EOT, 7th item, clean oven)

This ensures IDs are stable across re-renders and property size changes.

---

## Questions for Shaun (Before Factory Implementation)

1. **Custom Room Granularity**: When a user discovers "Library with coffee stand and sink," should the system:
   - Offer predefined room templates (Library, Office)? 
   - Or always use BASE_TEMPLATE + manual additions?

2. **Hours Estimation**: Are the hours I estimated reasonable? Should they vary by property size (small 2-bed flat vs 7-bed mansion)?

3. **Difficulty Levels**: Is `difficulty: "low" | "medium" | "high"` useful for the form? (e.g., for filtering, or crew assignment?)

4. **Category Organization**: Should categories be:
   - Generic (high_surfaces, windows, doors, fixtures)?
   - Room-specific (kitchen_appliances, bathroom_fixtures)?

5. **Residential Variants**: The Ultimate Checklist was EOT-focused. Are my "Residential" variants reasonable, or do you need me to research that separately?

---

## Next Steps (When Approved)

Once you answer those questions, I'll:

1. Convert this to JSON structure for Factory consumption
2. Create `ROOM_DEFINITIONS.md` mapping roomType → template → Factory instantiation
3. Write Factory test cases (e.g., "Create 3-bedroom EOT property" → should have 12+9+15=36 items across bedrooms + bathrooms)
4. Create IMPLEMENTATION_PLAN.md that phases the Factory + template integration

---

**Status**: Ready for review and feedback before code phase.
