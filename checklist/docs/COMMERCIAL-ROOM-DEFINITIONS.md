# Commercial Room Definitions & Composition Rules

**Purpose**: Define the canonical room types that compose commercial spaces, and how they're assembled  
**Used By**: ITEM_DEFINITIONS.js (commercial service type), CommercialRoomFactory, AysChecklistFormFactory  
**Status**: Specification (guide for building commercial checklist structure)

---

## Settings vs. Form Choices in Commercial Context

**Critical Principle**: The difference between what's STRUCTURAL (Settings) and what's ITEM-LEVEL (Form) determines the entire checklist experience.

### SETTINGS (Big Structural Decisions - Made Before Form Opens)

These decisions **cannot be changed on the form** because they determine the form structure:

| Setting | Impact | Example |
|---------|--------|---------|
| **Service Type** | Entire item set changes | Commercial vs. Residential vs. EOT |
| **Number of Offices** | Form generates that many office sections | "This site has 16 offices" → 16 office cards created |
| **Office Type** | Determines which items appear in EACH office | Is each office open_plan or private? (affects items) |
| **Toilet Block Count** | How many separate toilet sections | "2 toilet blocks" → Male + Female sections |
| **Toilet Block Type** | Determines items in each block | Is each block single_stall or block_5_plus? |
| **Lunchroom Type** | Determines what's in the break area | full_lunchroom (microwave, fridge) vs. tea_station |
| **Warehouse Present** | Includes/excludes entire warehouse sections | Is this a logistics site? (yes/no) |
| **Difficulty Level** | Multiplies all item hours across the quote | Easy (0.75x), Standard (1.0x), Hard (1.5x) |

**Why Settings must be locked in**: Changing these mid-form would restructure the entire quote—imagine starting with 8 offices, then discovering 16. The form would need to regenerate. That's not a small choice.

### FORM CHOICES (Small Item-Level Decisions - Made During Walk-Through)

These decisions **can be changed on the form** because they're about WHICH ITEMS apply:

| Form Choice | When? | Example |
|-------------|-------|---------|
| **Check/uncheck items** | During visit | "This office doesn't have a printer" → uncheck printer item |
| **Notes on specific items** | During visit | "Keyboard particularly sticky, needs 10 min extra" |
| **Notes on room section** | During visit | "Office 5 has water damage, needs extra care" |
| **Difficulty override** (if needed) | During visit | This bathroom is surprisingly easy (override easy setting) |
| **Custom service** | During discovery | "Found extra storage room, add custom service" |

**Why Form is flexible**: Checking/unchecking an item doesn't change the form structure—it just includes/excludes that task.

### The Office Count Example (Critical for Commercial)

**Scenario: Cleaning a 16-office building**

**SETTING TIME** (before inspector arrives):
```
Inspector notes in Settings:
  Service Type: Commercial
  Office Count: 16
  Office Type: All private offices
  Difficulty: Standard
```

**Factory generates**:
```
Office 1 (private) → 6 items
Office 2 (private) → 6 items
...
Office 16 (private) → 6 items

Total: 16 office cards, 96 items
```

**FORM TIME** (during walk-through):
```
Inspector sees 16 office cards on form:
  ✓ Office 1: Desk wipe, screen clean, ...
  ✓ Office 2: Desk wipe, screen clean, ...
  ...
  ✓ Office 16: Desk wipe, screen clean, ...

Inspector actions (these ARE form choices):
  ✗ Office 3 is empty this week → uncheck items
  ✗ Office 7 has sticky keyboard → note "extra 10 min"
  ✗ Found extra storage → add custom service
  
Inspector CANNOT:
  ✗ Change "16 offices" to "14 offices" (that's structural)
  ✗ Change office type from "private" to "open plan" (that's structural)
  ✗ Regenerate with new count (form is locked)
```

### Why This Prevents Chaos During Client Meetings

**Bad approach** (too many form choices):
```
Inspector opens form in front of client:
  "How many offices?"
  "Well, should this office have a printer item?"
  "Is this office open plan or private?"
  "Should we include the storage room?"
  "What about the meeting room?"
  
Client sees inspector making 20+ structural decisions on the fly.
Client loses confidence. Quote takes 2 hours.
```

**Good approach** (Settings locked in):
```
Inspector opened Settings before visiting:
  ✓ Confirmed 16 offices
  ✓ Confirmed all private
  ✓ Confirmed storage room
  ✓ Confirmed meeting room types
  
Inspector opens form in front of client:
  "I've got all 16 office cards here."
  "For office 3, I notice it's empty today → I'll uncheck items"
  "Office 7 needs extra care → I'm adding a note"
  
Client sees inspector making SMALL, SENSIBLE decisions.
Quote completed in 20 minutes. Client confident.
```

---

## Philosophy: Commercial Spaces Are Composed, Not Inferred

Unlike residential (assume bedrooms, bathrooms), commercial spaces **vary wildly**:
- Small office: Just reception + boardroom + toilet
- Gym: Reception + training floor + change rooms + shower block + toilet
- Medical clinic: Reception + waiting + multiple consultation rooms + staff kitchen + toilet
- Warehouse: Office area + warehouse floor + loading bay

**Rule**: Never assume rooms. Always ask or detect them.

---

## Core Commercial Room Types (90% Coverage)

These 6 room types appear in **most** commercial spaces. They're the building blocks.

### 1️⃣ OFFICE AREAS
*Where work happens*

**Structure**: PARAMETERIZED with office type variants

**SETTING**: How many offices (1-20+, user enters via counter input in Settings)  
**FORM**: Office type variant per office (open_plan, private, boardroom, etc. - chosen for all or mixed)

**Office Type Variants**:
- `open_plan_office` - Shared desks, shared air space
- `private_office` - Individual office (1-2 desks)
- `boardroom` / `meeting_room` - Conference table, shared use
- `hot_desk_area` - Rotating desk assignment
- `reception_area` - Customer-facing desk
- `manager_office` - Senior private office

**Common in**: All commercial sites  
**Typical count**: 1-20 per site (1-20 cards, determined by Settings numberOfOffices)

**Items per Office Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| open_plan (per 4-6 desks) | Desk wipe, screen clean, keyboard/mouse sanitize, trash empty, floor, cables undisturbed | 6 items |
| private_office | Desk wipe, screen clean, chair wipe, trash, floor, light switch | 6 items |
| boardroom | Table wipe, chairs, whiteboard erase, trash, floors, touchpoints | 6 items |
| hot_desk | Deep desk sanitize, screen wipe, all peripherals, trash, floor reset | 6 items |
| reception | Desk wipe, customer touch points (pen holder, forms), trash, floor, window | 5 items |
| manager_office | Desk wipe, chair, shelving (dust only), trash, floor, light | 6 items |

**Factory Rule**: 
- Settings controls: numberOfOffices (how many) + officeType (which variant for all)
- Form displays: [numberOfOffices] cards, each showing the configured type
- User can override per-office type if mixed (some open_plan, some private), but this changes form structure
- Recommend locking office type in Settings to keep form simple
- Example: 16 offices × private_office variant = 16 cards with 6 items each = 96 office items total

---

### 2️⃣ LUNCHROOM / BREAK ROOM
*Food preparation & consumption*

**Variants**:
- `full_lunchroom` - Microwave, fridge, sink, table, benches
- `kitchenette` - Smaller (fridge, sink, benches, no oven)
- `tea_coffee_station` - Just beverages (kettle, coffee, sink)
- `dining_area` - Tables/chairs only (no prep)

**Common in**: Almost all commercial (even small offices have a break area)  
**Typical count**: 1-3 per site (1-3 cards)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| full_lunchroom | Benches wipe, sink clean, fridge exterior, microwave exterior, cooktop exterior, table, trash, floor | 8 items |
| kitchenette | Benches wipe, sink clean, fridge exterior, small appliances, trash, floor | 6 items |
| tea_coffee_station | Benches wipe, kettle exterior, coffee machine exterior, sink, trash, floor | 5 items |
| dining_area | Tables wipe, chairs, trash, floors | 4 items |

**Factory Rule**: Typically 1 per site. User selects variant based on what's present.

---

### 3️⃣ TOILET & HYGIENE AREAS
*High-touch, sanitation-critical*

**Variants**:
- `single_toilet` - 1 cubicle, 1 sink
- `toilet_block_2_4` - 2-4 cubicles, multiple sinks
- `toilet_block_5_plus` - 5+ cubicles (common in larger buildings)
- `accessible_toilet` - ADA/DDA compliant (separate card if present)
- `shower_block` - Shower stalls (gyms, trades, warehouses)
- `change_room` - Lockers, benches, mirrors (gyms, sports)

**Common in**: **All commercial** (mandatory)  
**Typical count**: 1-4 per site (1-4 cards)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| single_toilet | Toilet clean & sanitize, sink clean & sanitize, mirror, soap/paper refill, floor, bins empty | 6 items |
| block_2_4 | Toilets clean & sanitize (×qty), sinks clean, mirrors, soap/paper dispensers, hand-dry refill, floors, bins | 8 items |
| block_5_plus | Toilets & urinals clean (×qty), sinks (×qty), mirrors, soap/paper/hand-dry refill, floors, bins, grout check | 9 items |
| accessible_toilet | Toilet & grab rails sanitize, sink, mirror, soap/paper, floor, space check (no clutter) | 6 items |
| shower_block | Shower heads clean, floor (non-slip), drains clear, mirrors, bins, hooks/rails wipe | 6 items |
| change_room | Lockers wipe, benches, mirrors, floor, bins, hooks | 5 items |

**Factory Rule**: Must allow multiple toilet blocks (e.g., "Male", "Female", "Unisex", "Staff"). Each gets its own card.

---

### 4️⃣ CIRCULATION AREAS
*Movement zones, high-touch surfaces*

**Variants**:
- `hallway` - Standard corridor
- `entryway_foyer` - Building entry
- `stairwell` - Stairs (interior or covered)
- `elevator` - Lift (if present)
- `corridor_landing` - Long runs, multiple exits

**Common in**: **Almost all commercial**  
**Typical count**: 1-4 per site (combined into 1-2 cards often)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| hallway | Floor clean, skirting/baseboards, light switches & doors touch-wipe, trash, wall spot-check | 5 items |
| entryway_foyer | Floors (heavy-traffic), door handles & frames, glass wipe (if present), mats (shake-out), trash | 5 items |
| stairwell | Steps & landings, handrails (high-touch), doors, light, trash, floor texture safe | 6 items |
| elevator | Floor, buttons (sanitize), mirrors, doors (interior & exterior), trash, floor safety | 6 items |
| corridor_landing | Floors, skirting, doors (multiple), light switches, handrails, trash | 5 items |

**Factory Rule**: Usually 1-2 circulation cards per site (users group them sensibly).

---

### 4.5️⃣ GARAGE (Cross-Service, Heavy Only)
*Commercial garages and loading areas*

**Variants**:
- `commercial_garage` - Covered vehicle storage (minimal items inside, floor sweep focus)
- `loading_bay_with_garage` - Combined garage + loading dock (vehicles + goods)

**Common in**: Logistics, delivery services, service centers  
**Typical count**: 0-2 per site (depends on operations)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| commercial_garage | Floor sweep (large area), oil stain check, door frame wipe, safety line check, trash bins | 5 items |
| loading_bay_with_garage | Floor sweep, oil/spill check, door/frame wipe, safety lines, ramp check if present, trash | 6 items |

**Factory Rule**: Heavy commercial only. Affects time multiplier due to floor size.

---

### 4.6️⃣ CARPARK / PARKING AREAS
*Vehicle parking - the reality of commercial real estate*

**Variants**:
- `open_carpark` - Outdoor parking lot (sweep & line check focus)
- `covered_carpark` - Covered but open-sides (less weather, still outdoor feel)
- `street_parking_only` - No assigned parking (noted but not cleaned by service)

**Common in**: Almost all commercial sites (if they have parking at all)  
**Typical count**: 0-1 per site (0 if street parking only)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| open_carpark | Sweep & debris removal (large area), line marking check, drain clearing, light fixtures check, safety check | 5 items |
| covered_carpark | Sweep, line markings, drain clear, lighting check, spill check (covered areas stay cleaner) | 5 items |
| street_parking_only | N/A - No service (noted in settings for context) | 0 items |

**Factory Rule**: Ask if assigned parking exists. If yes, which type (open/covered). If no, select "street parking only" (notes it but generates 0 items).

**Why this matters**: Some quotes need parking maintenance, some don't. Some have minimal parking responsibility.

---

### 6️⃣ UTILITY / SUPPORT AREAS
*Behind-the-scenes, minimal disturbance*

**Variants**:
- `cleaner_cupboard` - Supplies storage (minimal clean, floor only)
- `storage_room` - General storage (floor, no disturbance to items)
- `filing_room` - Document storage (floor, air circulation, minimal dust)
- `it_server_room` - Server/network equipment (visual/floor only, no touching)
- `print_copy_room` - Printers, copiers, paper stock (floor, paper dust sweep)
- `mechanical_room` - HVAC, electrical, water (floor, visual check only)

**Common in**: Medium-to-large commercial sites  
**Typical count**: 1-3 per site (1-3 cards)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| cleaner_cupboard | Floor sweep, shelving (no disturbance), trash, sink if present | 3 items |
| storage_room | Floor sweep/mop, shelving sight-line dust, air vents, no item rearrangement | 4 items |
| filing_room | Floor, air circulation check, shelf fronts (wipe), no file access | 3 items |
| it_server_room | Floor, vent areas, no equipment touch (visual only), cable paths clear | 3 items |
| print_copy_room | Floor, around equipment (no touching), paper feed area clear, trash bins | 4 items |
| mechanical_room | Floor, around equipment (no touch), vent paths clear, visual check only | 3 items |

**Factory Rule**: Allow user to add if present, but mark as "minimal disturbance" (affects pricing model).

---

## Industrial / Warehouse Commercial Spaces

*Very common in NZ & AU commercial real estate*

### 7️⃣ WAREHOUSE / INDUSTRIAL AREAS
*High-volume, floor-focused*

**Variants**:
- `warehouse_floor` - Main goods storage (sweep-focused, not detail)
- `loading_bay` - Goods in/out (heavy floor, outdoor section if uncovered)
- `dispatch_area` - Packing & labeling station
- `racking_aisles` - Tall storage corridors
- `packaging_area` - Assembly/packing tables

**Common in**: Warehouses, logistics, manufacturing  
**Typical count**: 1-4 per site (1-4 cards)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| warehouse_floor | Sweep (large area), safety line check, trash removal, spot mop (if stained), bin lineup | 5 items |
| loading_bay | Floor sweep (outdoor & covered), roll-up door wipe, ground level bins, safety markings check | 5 items |
| dispatch_area | Surfaces wipe, floor sweep, trash, package debris clear, labels/tape disposal | 4 items |
| racking_aisles | Sweep between racks, aisle safety check, floor hazard check (no spills), sweeping high-dust | 4 items |
| packaging_area | Bench wipe, floor sweep, packing supplies tidied, trash bins, tape/label station | 4 items |

**Factory Rule**: Warehouse floor is "lower detail" than offices (affects item types & pricing).

---

### 8️⃣ TRADE / WORKSHOP AREAS
*Grease, tools, heavy wear*

**Variants**:
- `workshop_floor` - Tools, equipment, bench work
- `tool_room` - Tool storage (minimal disturbance)
- `parts_storage` - Components, bins
- `trade_office` - Office space (same as office variant)
- `wash_down_area` - Equipment cleaning area (wet floor, drains)

**Common in**: Plumbing, electrical, manufacturing, garages  
**Typical count**: 1-5 per site (1-5 cards)

**Items per Variant**:

| Variant | Typical Items | Item Count |
|---------|---|---|
| workshop_floor | Sweep (heavy debris), grease spots (if any), floor safety, drain clear (if present), bins | 5 items |
| tool_room | Shelving tidy (no disturbance), floor sweep, bins, minimal dust | 3 items |
| parts_storage | Shelving (organized, no disturbance), floor sweep, bins, aisle clearance | 3 items |
| wash_down_area | Floor (grease/dirt removal), drain clear, hose/equipment tidy, non-slip check, bins | 4 items |

**Factory Rule**: Pricing model may differ (heavy-duty cleaning commands premium).

---

## Industry-Specific Commercial Composites

These are **combinations** of the above core types. Show users examples.

### 🏋️ GYM / FITNESS CENTRE

**Composed of**:
- Reception (reception_area variant)
- Training floor (open_plan with equipment focus)
- Group class room (boardroom variant, larger)
- Office (private_office variant)
- Change rooms (change_room variant, ×2 if gender-split)
- Shower block (shower_block variant)
- Toilet block (toilet_block variant, ×2 if gender-split)
- Lunchroom (kitchenette variant, often minimal)

**Example Card Count**: 9 cards

**Factory Rule**: Offer "Gym" template checkbox that auto-selects the above pattern.

---

### 🏥 MEDICAL / HEALTH CLINIC

**Composed of**:
- Reception (reception_area variant)
- Waiting room (dining_area variant, healthcare-focused)
- Consultation rooms (private_office variant, ×1-5 depending on size)
- Treatment room (if surgery: separate special rules)
- Staff office (manager_office variant)
- Staff kitchen (kitchenette variant, often minimal, higher hygiene)
- Toilet block (toilet_block variant, often ×2 for patient/staff)

**Example Card Count**: 8-12 cards

**Factory Rule**: Medical facilities have **higher sanitation rules** (affects item sets & pricing).

---

### 🛍️ RETAIL / SHOWROOM

**Composed of**:
- Shop floor (open_plan with display focus)
- Stockroom (storage_room variant, back-of-house)
- Office (private_office variant)
- Staff room (kitchenette + break area)
- Toilet block (single or small block)
- Entryway/display windows (customer-facing)

**Example Card Count**: 6-8 cards

**Factory Rule**: "Retail" template available.

---

### 🍽️ HOSPITALITY (LIGHT COMMERCIAL)

**Composed of**:
- Front-of-house (dining_area variant, large)
- Bar area (if present: special touch-point rules)
- Back office (small)
- Staff kitchen (full_lunchroom usually, commercial-grade)
- Toilet block (customer + staff, often ×2)
- Storage (filing_room / storage variant)

**Example Card Count**: 6-8 cards

**Factory Rule**: Kitchen often **quoted separately** or excluded (user can deselect).

---

## Optional Commercial Services (Form Choices, Not Settings)

**These are NOT structural decisions.** They're discovered during the property walk-through and toggled on/off as form choices:

### 1. RUBBISH HANDLING COMPLEXITY

**Reality**: Rubbish bin management is one of the LARGEST parts of commercial cleaning. It's not just "count the bins."

**Variants to Offer**:
- Small desk tins (5-10L) - carry by hand
- Medium bins (30-50L) - roll to dumpster
- Large bins (80-120L) - heavy, requires transport
- Transport distance to carpark/dumpster (significant time cost)

**How it works on form**:
```
Inspector walks office:
  "How many small rubbish tins?" [checkbox if present + quantity]
  "How many medium bins?" [checkbox if present + quantity]
  "How many large bins?" [checkbox if present + quantity]
  "How far to the dumpster?" [distance in meters for time estimate]
  
Inspector leaves:
  Rubbish handling is fully scoped (not an afterthought)
```

### 2. DESK TIDYING (If Cluttered)

**Reality**: Not all desks need organizing. Clean desks get wiped. Cluttered desks need tidying.

**How it works on form**:
```
Inspector looks at desks:
  Clean & organized? → Leave unchecked (just wipe)
  Piles of papers? → Check "Desk tidying/organizing" option
  
This is a VISUAL INSPECTION decision, not a Setting.
```

### 3. VACUUM & RUBBISH (Budget Package)

**Reality**: The cheapest commercial cleaning is just vacuuming + rubbish clearing.

**How it works on form**:
```
Inspector offers package options:
  "We can do basic vacuum and rubbish clearing (~$200)"
  Or
  "Full cleaning with desks and touchpoints (~$500)"
  
Client picks based on budget.
These toggle on/off as a package during the quote.
```

### 4. LAUNDRY SERVICE (If Facilities Present)

**Reality**: Some offices have washers/dryers for gym towels, uniforms, kitchen linens.

**How it works on form**:
```
Inspector finds laundry room near showers:
  "Do you want us to handle towel/uniform laundry?"
  
If YES:
  ✓ Add laundry service item (wash cycles per week)
  
If NO:
  Leave unchecked
  
This is OPTIONAL and only if facilities exist.
```

### 5. WINDOW CLEANING (Standalone Service - Major Product)

**Reality**: Window cleaning is a MAJOR standalone service (you sell it constantly). Not buried in room definitions. Difficulty & equipment costs escalate dramatically with building height.

**Pane Size Variants**:
- `small_pane` - Odd-sized windows (60cm × 30cm+, bathroom/storage windows)
- `medium_pane` - Standard office windows (~1m wide)
- `large_pane` - Large storefronts/windows (1.5m+ wide)
- `door_glass` - Glass doors, entrance panels

**Building Height Difficulty Escalation** (This is where big pricing & margins happen):

| Building Height | Equipment Required | Difficulty | Hours Cost | Examples |
|---|---|---|---|---|
| **Single Storey** | Ladder/step ladder | basic | 1.0x base | Small office, ground-level retail |
| **2-Storey** | Extension ladder + A-frame, harness | medium | 1.5x base + equipment rental |Two-storey office, small commercial |
| **3+ Storey / Multi-Storey** | Scissor lifts, bucket lifts, scaffolding, rope access | HIGH | 2.5-4.0x base + major equipment | High-rise, commercial towers, 3+ storey offices |

**Equipment Rental Reality**:
- Single storey: Just ladder work ($0 rental)
- 2-storey: Equipment rental $200-500/day
- 3+ storey: Equipment rental $500-1500+/day + safety protocols

**Pricing Examples**:
- Single storey, 6 medium panes: 0.6 hrs × $60/hr = $36 labor + $0 equipment = ~$150 quote
- 2-storey, 10 medium panes: (1.5 hrs × 1.5x) × $60/hr + $350 equipment = ~$500 quote
- 3-storey, 15 medium panes: (2.25 hrs × 3.0x) × $60/hr + $800 equipment = ~$1200+ quote

**How it works on form**:
```
Inspector walks property:
  "Do you want window cleaning?" (MAJOR PRODUCT)
  
FIRST QUESTION - Building Height (this drives pricing):
  ☐ Single storey (ground level, ladder work)
  ☐ Two-storey (extension ladder + equipment rental)
  ☐ Multi-storey 3+ floors (major equipment: lifts, scaffolding)
  
Then count panes (small, medium, large by storey if mixed):
  "How many small panes?" [input]
  "How many medium panes?" [input]
  "How many large panes?" [input]
  "How many glass doors?" [input]
  
Then assess condition:
  ☐ Outside only (reduces hours)
  ☐ Heavy buildup/pollution (adds scrubbing time)
  
Quote calculates:
  Base hours: (Small × 0.08) + (Medium × 0.1) + (Large × 0.15) + (Doors × 0.2)
  Height multiplier: 1.0x (single) / 1.5x (2-storey) / 3.0x+ (3+ storey)
  Equipment cost: $0 / $350 / $800+
  + [modifiers]
  = Total window cleaning quote
```

**Why this is a STANDALONE PRODUCT**:
- You sell window-cleaning-only quotes constantly
- "Just windows and I'll send the bill" is common
- Building height determines equipment cost + difficulty
- Single storey: Quick job, high margin percentage
- Multi-storey: Equipment rental HUGE, but total quote is big ($1000+)
- Small panes catch oddball sizes (bathrooms, narrow windows, skylights)
- Has its own detailed equation/plugin on your website (can integrate later)
- Must be its own line item, not buried in room definitions

---

### 6. FLOOR STRIPPING / WAX (If Needed)

**Reality**: Some offices need regular floor treatment (monthly/quarterly), not daily.

**How it works on form**:
```
Inspector assesses floors:
  Clean vinyl/concrete? → No special treatment needed
  Dull/yellowed tiles? → "Floor stripping & wax needed?"
  
If YES:
  Additional cost (special chemicals, labor)
  Frequency: Monthly? Quarterly?
```

---

## Why These Are Form Choices, Not Settings

**Settings** (locked before form):
- Service type (commercial vs. residential)
- Number of offices (16 offices)
- Difficulty level (standard)

**Form Choices** (discovered during walk):
- How many rubbish tins? (see them, count them, ask)
- Are desks cluttered? (visual assessment)
- Do you want laundry service? (ask if facilities exist)
- **Do you want window cleaning?** (ask + count panes + check height/access)
- Want vacuum-and-rubbish package? (offer options)
- Distance to dumpster? (measure/ask)
- Floor treatment needed? (assess condition)

---

## Commercial Room Assembly Rules (FOR FACTORY)

### Rule 1: Core Rooms Are Mandatory

```
Every commercial site has:
✅ At least 1 Office Area (any variant)
✅ At least 1 Toilet Block
✅ Likely 1 Lunchroom or Break Area
✅ Likely 1 Circulation Area
```

### Rule 2: Optional Rooms Are User-Selected

```
User chooses to add:
- Additional office(s)
- Additional toilet block(s)
- Utility areas (storage, IT room, etc.)
- Warehouse/Industrial areas (if applicable)
- Specialized areas (shower block, change room, etc.)
```

### Rule 3: Composites Are Templates

```
User can select a "Template":
- [ ] Gym
- [ ] Medical Clinic
- [ ] Retail
- [ ] Hospitality
- [ ] Warehouse + Office
- [ ] Custom Assembly
```

When user selects template, all rooms are pre-selected. User can adjust.

### Rule 4: Custom Discovery

```
If site doesn't fit a template, user can:
- Start with empty
- "Add another office" (variant selector)
- "Add another lunchroom" (variant selector)
- "Add warehouse area" (if needed)
- "Add custom space" (free-text room name)
```

---

## Commercial Item Template Base Rules

**Every commercial room gets these**:
- Floor (type varies: sweep vs mop vs detail vs spot)
- Trash/bins empty
- Touchpoints sanitized (handles, switches, etc.)
- Visual safety check

**Variations** depend on room type and industry.

---

## Next: ITEM_DEFINITIONS.js Structure for Commercial

When building ITEM_DEFINITIONS for commercial service type:

```javascript
const ITEM_DEFINITIONS = {
  'commercial': {
    'office': {
      'open_plan': [ 6 items ],
      'private': [ 6 items ],
      'boardroom': [ 6 items ],
      'hot_desk': [ 6 items ],
      'reception': [ 5 items ],
      'manager': [ 6 items ]
    },
    'lunchroom': {
      'full': [ 8 items ],
      'kitchenette': [ 6 items ],
      'tea_station': [ 5 items ],
      'dining_only': [ 4 items ]
    },
    'toilet_block': {
      'single': [ 6 items ],
      'block_2_4': [ 8 items ],
      'block_5_plus': [ 9 items ],
      'accessible': [ 6 items ],
      'shower': [ 6 items ],
      'change_room': [ 5 items ]
    },
    'circulation': {
      'hallway': [ 5 items ],
      'entryway': [ 5 items ],
      'stairwell': [ 6 items ],
      'elevator': [ 6 items ],
      'corridor': [ 5 items ]
    },
    'utility': {
      'cleaner_cupboard': [ 3 items ],
      'storage': [ 4 items ],
      'filing': [ 3 items ],
      'it_server': [ 3 items ],
      'print_copy': [ 4 items ],
      'mechanical': [ 3 items ]
    },
    'warehouse': {
      'warehouse_floor': [ 5 items ],
      'loading_bay': [ 5 items ],
      'dispatch': [ 4 items ],
      'racking_aisles': [ 4 items ],
      'packaging': [ 4 items ]
    },
    'workshop': {
      'workshop_floor': [ 5 items ],
      'tool_room': [ 3 items ],
      'parts_storage': [ 3 items ],
      'wash_down': [ 4 items ]
    }
  }
};
```

**Total Commercial Room Types**: 28 variants  
**Total Commercial Items**: ~150-170 (depending on distribution)

---

## Summary: Why This Works

✅ **Composable**: Rooms are built from core types, not assumed  
✅ **Scalable**: Add 1 office → add 20 offices (same template)  
✅ **Real-World**: Based on actual commercial space patterns  
✅ **Template-Ready**: Pre-built patterns (Gym, Medical, Retail) for speed  
✅ **Flexible**: Custom room support when needed  
✅ **Factory-Friendly**: Clean rules for CommercialRoomFactory to follow

This is why your Factory-first design wins.

