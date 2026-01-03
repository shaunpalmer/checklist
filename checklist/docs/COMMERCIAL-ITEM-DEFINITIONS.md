# Commercial Item Definitions

**Purpose**: Define exact items for each commercial room variant, including consumables and parameterized fixtures  
**Used By**: Hour 1-3 Sprint ITEM_DEFINITIONS.js (commercial service type)  
**Production Rate**: 400 (commercial base) | Medical: +higher difficulty  
**Status**: Specification (ready to code into ITEM_DEFINITIONS.js)

---

## CRITICAL: Rubbish Handling is a MAJOR Service Component

**Reality**: Rubbish bin management is not a minor task - it's one of the largest parts of commercial cleaning.

### Rubbish Bin Variants (Not Just Quantity)

Bins come in different sizes, and handling varies:

| Bin Type | Size | Transport | Hours per bin | Notes |
|----------|------|-----------|---------------|-------|
| Small tin | 10-15L | Carry by hand | 0.05 | Office desk tins, bathroom bins |
| Medium bin | 30-50L | Carry or roll | 0.1 | Standard office/kitchen bin |
| Large bin | 80-120L | Roll to dumpster | 0.15 | Heavy, needs transport distance |
| Metal bin | 20-40L | Carry (heavy) | 0.12 | Trade/workshop, grease |
| Dumpster station | varies | Not counted | varies | Where bins empty to (setup cost) |

### Rubbish Item Structure (Complex, Not Simple)

```javascript
// NOT just "count the bins" - also need SIZE variants
{
  itemId: 'site-rubbish_small_tins',
  label: 'Small rubbish tins emptied',
  category: 'bins',
  parameterized: true,
  parameter: 'number_of_small_tins',
  hours: 0.05,  // Per tin (less work)
  difficulty: 'basic'
},
{
  itemId: 'site-rubbish_medium_bins',
  label: 'Medium bins emptied & transported',
  category: 'bins',
  parameterized: true,
  parameter: 'number_of_medium_bins',
  hours: 0.1,  // Per bin (carry to dumpster)
  difficulty: 'basic'
},
{
  itemId: 'site-rubbish_large_bins',
  label: 'Large bins emptied & transported',
  category: 'bins',
  parameterized: true,
  parameter: 'number_of_large_bins',
  hours: 0.15,  // Per bin (heavy, longer distance)
  difficulty: 'basic'
},
{
  itemId: 'site-rubbish_transport_to_carpark',
  label: 'Rubbish transported to carpark/dumpster',
  category: 'bins',
  parameterized: false,  // Single item, not per-bin
  hours: 0.2,  // Setup/distance cost
  difficulty: 'basic',
  description: 'Travel to carpark, position bins/bags at dumpster'
}
```

**Why transport is separate**: Inspector knows how far the dumpster is. If it's 100m away, that's significant labor. If it's 20m, it's minimal. This is a FORM CHOICE during walk-through.

---

## OPTIONAL FORM CHOICES (Tap-Tap During Walk-Through)

These are NOT structural (Settings). These are **common form choices** inspectors toggle during the property walk-through:

### Form Choice 1: Desk Tidying
**Scenario**: Office has desks. Are they cluttered or clean?

```javascript
{
  itemId: 'office-tidy_desks_optional',
  label: 'Clear & tidy desks (organize papers/stationery)',
  category: 'organization',
  parameterized: false,
  hours: 0.3,  // Per office or per desk group
  difficulty: 'basic',
  optional: true,  // User checks/unchecks this
  description: 'Only if desks are cluttered with papers. Clean desks get light wipe, no organizing.',
  policy: 'If desk is already tidy, don\'t check. If it\'s a paper pile, check this option.'
}
```

**How it works on form**:
- Inspector walks into office
- "Are desks cluttered?" 
- If YES → Check "Clear & tidy desks" checkbox
- If NO → Leave unchecked (just wipe, don't organize)

This is NOT a Settings decision. It's a visual inspection decision.

### Form Choice 2: Vacuuming (Often a Budget Package)
**Reality**: "Vacuum & Rubbish" is the cheapest commercial cleaning package.

```javascript
{
  itemId: 'site-vacuum_optional',
  label: 'Vacuuming (budget package minimum)',
  category: 'floors',
  parameterized: false,
  hours: 0.5,  // Per floor section
  difficulty: 'basic',
  optional: true,
  description: 'Basic vacuum around furniture. Often paired with rubbish clearing for cheapest quotes.',
  package: 'VACUUM_AND_RUBBISH'  // Tagging for bundling
}
```

**Common dialog during walk-through**:
- Inspector: "Do you want just vacuuming and rubbish clearing? That's our most affordable option."
- Client: "Yeah, that's what we need right now."
- Inspector: ✓ Checks both "Vacuuming" and "Rubbish clearing"
- Quote shows: ~$200-300/visit (bare minimum)

---

### Form Choice 3: Laundry Service (If Available)
**Reality**: Some offices have small laundry rooms (towels, uniforms). Optional add-on.

```javascript
{
  itemId: 'laundry-service_optional',
  label: 'Laundry service (if facilities present)',
  category: 'laundry',
  parameterized: true,
  parameter: 'number_of_wash_cycles',  // How many loads?
  hours: 0.5,  // Per wash cycle
  difficulty: 'basic',
  optional: true,
  description: 'Wash, dry, fold gym/kitchen towels. Only if client has washer/dryer on-site.',
  location: 'Near shower block (gym/medical)',
  note: 'Inspector discovers this during walk - "Do you want us to handle towel laundry?"'
}
```

**When it appears on form**: Only if laundry room exists AND client wants this service.

---

### Form Choice 4: Window Cleaning (MAJOR PRODUCT - Standalone Service)

**Reality**: Window cleaning is one of your BIGGEST standalone services (you sell it constantly). Ground floor is 95% of your work.

**Pane Pricing Structure**:
- `large_pane`: **$5.00 per pane** (large storefronts, windows 1.5m+)
- `small_pane`: **$2.50 per pane** (small/odd-sized windows, bathrooms, skylights)
- `door_glass`: **$2.00 per pane** (entrance door, interior glass doors, both sides)

**Building Height Cost Structure** (Equipment Surcharges ONLY):

| Building Height | Staff | Equipment Surcharge | Extra Staff if > 6 hrs | Notes |
|---|---|---|---|---|
| **Ground Floor (1-storey)** | 1 person | **$0** | None | Pole against building. 95% of jobs. Fully priced. |
| **2-Storey** | 1-2 people | **+$100** | +$50/hr per extra person | Extended pole, extra setup time. Common. |
| **3+ Storey / Multi-storey** | — | — | — | **Contact for custom quote.** (Rare: 3-4 jobs/career) |

**PRICING FORMULA**:
```
Total Price = (Large × $5.00) + (Small × $2.50) + (Door × $2.00) + [Height Surcharge]

Ground Floor: No surcharge, one person
2-Storey: +$100 surcharge, check if estimate > 6 hours for extra staff cost
3+ Storey: Manual quote (equipment rental $1000+ base + $500/day + extra staff)
```

**Example Quotes**:
```
Ground Floor, 6 large + 4 small windows:
  = (6 × $5.00) + (4 × $2.50) + $0 = $40 total
  
2-Storey, 10 large + 6 small windows:
  = (10 × $5.00) + (6 × $2.50) + $100 surcharge = $85 total
  (If estimate > 6 hrs, add extra staff cost)
  
3+ Storey: "Contact for custom quote" — too variable
```

**Item Definition Examples**:
```javascript
// PANE PRICE ITEMS (unit-based pricing)
{
  itemId: 'site-window_large_pane',
  label: 'Large window pane',
  category: 'windows',
  parameterized: true,
  parameter: 'number_of_large_panes',
  pricePerUnit: 5.00,  // $5.00 per large pane
  optional: true,
  description: 'Large storefront/windows (1.5m+ wide). Inside + outside.'
},
{
  itemId: 'site-window_small_pane',
  label: 'Small window pane',
  category: 'windows',
  parameterized: true,
  parameter: 'number_of_small_panes',
  pricePerUnit: 2.50,  // $2.50 per small pane
  optional: true,
  description: 'Small/odd-sized windows (60cm × 30cm+). Bathrooms, skylights, narrow windows.'
},
{
  itemId: 'site-window_door_pane',
  label: 'Glass door or panel',
  category: 'windows',
  parameterized: true,
  parameter: 'number_of_door_panes',
  pricePerUnit: 2.00,  // $2.00 per door (both sides, frame, handle)
  optional: true,
  description: 'Entrance doors, interior glass doors. Both sides + frame + handle.'
},

// BUILDING HEIGHT SURCHARGES
{
  itemId: 'site-window_ground_floor',
  label: 'Ground floor (1-storey)',
  category: 'windows',
  parameterized: false,
  price: 0,  // No surcharge
  optional: true,
  description: 'Building is single storey. One staff member. No extra cost.',
  staffCount: 1
},
{
  itemId: 'site-window_two_storey',
  label: 'Two-storey building',
  category: 'windows',
  parameterized: false,
  price: 100,  // +$100 equipment surcharge
  optional: true,
  description: 'Building is 2-storey. Requires extended pole/ladder. Equipment surcharge $100.',
  staffCount: 1,
  staffCost: '$50/hr if job estimate > 6 hours'
},
{
  itemId: 'site-window_multi_storey',
  label: 'Multi-storey (3+ floors)',
  category: 'windows',
  parameterized: false,
  price: 'CUSTOM',  // Manual quote
  optional: true,
  description: 'Contact for custom quote. Equipment rental $1000+ base + $500/day + extra staff.',
  note: 'Rare (3-4 jobs/career). Requires email/phone quote.'
}
```

**Calculator Logic for Ground Floor + 2-Storey** (3+ is "Contact"):
```javascript
function calculateWindowPrice() {
  const largeWindows = parseInt(document.getElementById("largeWindows").value) || 0;
  const smallWindows = parseInt(document.getElementById("smallWindows").value) || 0;
  const doorPanes = parseInt(document.getElementById("doorPanes").value) || 0;
  const buildingHeight = document.getElementById("buildingHeight").value; // 'ground' or '2-storey' or '3plus'

  const largePrice = 5.00;
  const smallPrice = 2.50;
  const doorPrice = 2.00;

  let basePrice = (largeWindows * largePrice) + (smallWindows * smallPrice) + (doorPanes * doorPrice);
  let heightSurcharge = 0;
  let extraStaffNote = '';

  if (buildingHeight === '2-storey') {
    heightSurcharge = 100;
    // Rough estimate: 1 pane = ~0.1 hours, so estimate hours = total_panes × 0.1
    const estimatedHours = (largeWindows + smallWindows + doorPanes) * 0.1;
    if (estimatedHours > 6) {
      extraStaffNote = `(+ estimate $${Math.ceil((estimatedHours - 6) * 50)} extra staff if job > 6 hrs)`;
    }
  } else if (buildingHeight === '3plus') {
    return 'Contact for custom quote - multi-storey requires manual estimate';
  }

  const totalPrice = basePrice + heightSurcharge;
  return `$${totalPrice.toFixed(2)} ${extraStaffNote}`;
}
```

**Why This Pricing Works**:
- Ground floor (95% of jobs): Simple, one person, fully priced in
- 2-storey (occasional): +$100 covers extra setup/equipment, competitive
- 3+ storey (rare): Manual quotes only — too variable to automate
- Small panes catch niche opportunities (bathrooms, skylights)
- Large panes are high-value items for storefronts/commercials
  optional: true,
  description: 'Grime, sap, salt spray buildup. Extra scrubbing needed.',
  note: 'Inspector assesses: "Windows are really dirty/polluted?"'
}
```

**How it works on form**:
```
Inspector walks property:
  "Do you want window cleaning?"
  
If YES (FIRST QUESTION):
  "How many storeys is this building?"
    ☐ Single storey (ground level, ladder work)
    ☐ Two-storey (extension ladder + equipment)
    ☐ Multi-storey 3+ (major equipment: lifts, scaffolding)
  
Then count panes:
  "How many small panes?" [input]
  "How many medium panes?" [input]
  "How many large panes?" [input]
  "How many glass doors?" [input]
  
Then assess condition:
  ☐ Outside only (reduces hours)
  ☐ Heavy buildup/pollution (adds scrubbing time)
  
CRITICAL: Building height selected FIRST
  (This determines equipment cost + difficulty escalation)
  
Final quote calculates:
  (Small × 0.08) + (Medium × 0.1) + (Large × 0.15) + (Doors × 0.2)
  + [building height multiplier: 1.0x / 1.5x / 2.5-4.0x]
  + [modifiers]
  = Total window cleaning hours & difficulty
```

**Why window cleaning is a MAJOR PRODUCT**:
- You sell it constantly as standalone service
- "Just windows" quote for $150-200 is common entry point
- Two-storey buildings scale hours 1.5x
- Multi-storey buildings scale hours 2.5-4.0x AND require equipment rental ($500-1500/day)
- This is where MARGINS explode: equipment costs + difficulty pricing
- Small panes catch oddball sizes (bathrooms, narrow windows)
- Needs its own line item in the product, not buried in room definitions



---

## KEY RULES

### Rule 1: Rubbish Handling is Complex & Expensive
**Not just "count bins"** - need to account for:
- Bin SIZE (small tins vs. large bins = different hours)
- BIN TYPE (metal bins are heavier, take longer)
- DISTANCE to dumpster (transport cost varies by site)
- Multiple checks: "Do you want small desk tins cleared?" "Do you want large bins transported?"

### Rule 2: Window Cleaning is Standalone & Scalable
**Not just a room item** - separate service that:
- Scales with pane COUNT (parameterized, like rubbish)
- Scales with HEIGHT (ground = easy, 3rd floor = equipment)
- Scales with BUILDUP (clean windows = quick, dirty = extra time)
- Difficulty escalates with each modifier
- Bigger area = bigger equipment = bigger margins
- Often quoted solo: "Just windows and I'll send the bill"

### Rule 3: Common Commercial Packages
Document these for inspector to offer:

**Package A: VACUUM & RUBBISH** (Cheapest)
- ✓ Vacuuming (floors)
- ✓ Rubbish clearing (small + medium bins)
- ✓ Basic touchpoints
- Hours: ~0.7-1.0 per 1000 sq ft
- Quote: ~$200-300/visit

**Package B: FLOORS & WINDOWS** (Budget with Polish)
- ✓ Vacuum floors
- ✓ Window cleaning (small-medium panes)
- ✓ Rubbish clearing
- Hours: ~1.0-1.5 per 1000 sq ft
- Quote: ~$250-400/visit

**Package C: BASIC CLEANING** (Standard)
- ✓ Vacuuming
- ✓ Rubbish clearing (all sizes)
- ✓ Desks wiped
- ✓ Touchpoints sanitized
- Hours: ~1.5-2.0 per 1000 sq ft
- Quote: ~$400-600/visit

**Package D: COMPREHENSIVE** (Premium)
- ✓ All of Basic
- ✓ Desk tidying
- ✓ Window cleaning
- ✓ Kitchen/lunch room deep clean
- ✓ Bathroom detail
- Hours: ~2.5-3.5 per 1000 sq ft
- Quote: ~$700-1000/visit

### Rule 4: Optional Items Are Form Choices
These toggle on/off during walk-through:
- Desk tidying (cluttered desk?)
- Window cleaning (yes/no? how many panes? high? dirty?)
- Laundry service (washer/dryer present?)
- Floor stripping (monthly vs. daily?)
- High windows modifier (equipment needed?)

**They are NOT Settings.** They're discovered and decided during the property tour.

### Rule 5: Difficulty Modifiers Create Pricing Leverage
- HIGH WINDOWS (difficulty: basic → medium) = +1.5x hours + equipment
- HEAVY BUILDUP (difficulty: basic → medium) = +extra scrubbing time
- STICKY SURFACES (bars, late-night venues) = difficult + high hazard
- LARGE FLOOR AREAS (machine needed) = difficulty escalates

**This is why difficulty matters**: It's not just academic. It's the mechanism for pricing bigger jobs with bigger margins.

### Rule 6: Bathroom Consumables (Existing)
```javascript
// Mandatory for ALL commercial rooms:
{ itemId: 'room-rubbish_tins', label: 'Rubbish tins emptied', category: 'bins', 
  hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
{ itemId: 'room-floors', label: 'Floors cleaned', category: 'floors', 
  hours: 0.2, difficulty: 'basic' },
{ itemId: 'room-touchpoints', label: 'Touchpoints sanitized', category: 'sanitation', 
  hours: 0.1, difficulty: 'basic' }
```

### Rule 2: Parameterized Items (Like Rubbish Tins)
**Rubbish Tins** is a special item type:
```javascript
{
  itemId: 'room-rubbish_tins',
  label: 'Rubbish tins emptied',
  category: 'bins',
  parameterized: true,
  parameter: 'number_of_bins',
  parameterType: 'number',  // Can be 'dropdown' or 'textbox'
  parameterRange: [1, 80],  // Min 1, Max 80 bins (reasonable upper bound)
  hours: 0.1,  // Per bin
  difficulty: 'basic',
  description: 'How many rubbish bins does this room have?'
}
```

When rendered:
- Show checkbox: "Rubbish tins emptied"
- Show input field: "How many bins?" [textbox: 1-80] or [dropdown list]
- If 5 bins selected: 5 × 0.1 hours = 0.5 hours labor
- Cost: 5 × $base_rate_per_bin

### Rule 3: Bathroom Consumables (NEW)
**Bathrooms track consumables separately from cleaning items**:
```javascript
// In toilet block items:
{ itemId: 'bath-toilet_rolls', label: 'Toilet rolls refilled', category: 'consumables', 
  hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
{ itemId: 'bath-sanitary_bins', label: 'Sanitary bins emptied & lined', category: 'consumables', 
  hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
{ itemId: 'bath-soap_dispensers', label: 'Soap dispensers refilled', category: 'consumables', 
  hours: 0.05, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
{ itemId: 'bath-hand_dry', label: 'Hand dryer/towel refilled', category: 'consumables', 
  hours: 0.05, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
{ itemId: 'bath-sanitiser', label: 'Sanitiser dispensers refilled', category: 'consumables', 
  hours: 0.05, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' }
```

### Rule 4: Difficulty Scaling for Medical
- **Commercial standard**: 'basic' for most items
- **Medical facility**: Change bathroom difficulty to 'medium'
  - Different chemicals (hospital-grade sanitiser)
  - Cloth changes between stalls
  - Dwell time on surfaces
  - Glove usage
- **Production rate for medical**: Same 400, but medical items take longer (medium difficulty)

---

## 1️⃣ OFFICE AREA ITEMS

### open_plan (per 4-6 desks)
```javascript
'commercial': {
  'office': {
    'open_plan': [
      { itemId: 'office-rubbish_tins', label: 'Rubbish tins emptied', category: 'bins', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
      { itemId: 'office-desks_wipe', label: 'Desks wiped down', category: 'surfaces', hours: 0.3, difficulty: 'basic' },
      { itemId: 'office-screens', label: 'Monitors/screens cleaned', category: 'glass', hours: 0.2, difficulty: 'basic' },
      { itemId: 'office-keyboards', label: 'Keyboards & mice sanitized', category: 'sanitation', hours: 0.15, difficulty: 'basic' },
      { itemId: 'office-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
      { itemId: 'office-touchpoints', label: 'Door handles, light switches', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
    ]
  },
```

**Total**: 6 items, ~1.05 hours per section

### private_office
```javascript
    'private': [
      { itemId: 'office-rubbish_tins', label: 'Rubbish bin emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
      { itemId: 'office-desk_wipe', label: 'Desk wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
      { itemId: 'office-screen', label: 'Monitor/screen cleaned', category: 'glass', hours: 0.15, difficulty: 'basic' },
      { itemId: 'office-keyboard', label: 'Keyboard & mouse sanitized', category: 'sanitation', hours: 0.1, difficulty: 'basic' },
      { itemId: 'office-chair', label: 'Chair wiped', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
      { itemId: 'office-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' }
    ]
```

**Total**: 6 items, ~0.8 hours

### boardroom / meeting_room
```javascript
    'boardroom': [
      { itemId: 'boardroom-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
      { itemId: 'boardroom-table', label: 'Meeting table wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
      { itemId: 'boardroom-chairs', label: 'Chairs wiped', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
      { itemId: 'boardroom-whiteboard', label: 'Whiteboard erased & cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
      { itemId: 'boardroom-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
      { itemId: 'boardroom-touchpoints', label: 'Handles, switches, remotes', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
    ]
```

**Total**: 6 items, ~0.85 hours

### hot_desk_area
```javascript
    'hot_desk': [
      { itemId: 'hotdesk-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
      { itemId: 'hotdesk-desks_sanitize', label: 'Desks deep sanitized', category: 'sanitation', hours: 0.4, difficulty: 'basic' },
      { itemId: 'hotdesk-screens', label: 'Screens cleaned', category: 'glass', hours: 0.15, difficulty: 'basic' },
      { itemId: 'hotdesk-peripherals', label: 'All keyboards, mice, cables sanitized', category: 'sanitation', hours: 0.2, difficulty: 'basic' },
      { itemId: 'hotdesk-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
      { itemId: 'hotdesk-reset', label: 'Desk areas reset (no clutter)', category: 'organization', hours: 0.1, difficulty: 'basic' }
    ]
```

**Total**: 6 items, ~1.15 hours (higher sanitation for shared use)

### reception_area
```javascript
    'reception': [
      { itemId: 'reception-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
      { itemId: 'reception-desk', label: 'Reception desk wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
      { itemId: 'reception-touchpoints', label: 'Customer touchpoints (pen holder, forms, buttons)', category: 'sanitation', hours: 0.15, difficulty: 'basic' },
      { itemId: 'reception-seating', label: 'Waiting area seating wiped', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
      { itemId: 'reception-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
      { itemId: 'reception-window', label: 'Front window/glass wiped', category: 'glass', hours: 0.15, difficulty: 'basic' }
    ]
```

**Total**: 6 items, ~0.95 hours

### manager_office
```javascript
    'manager': [
      { itemId: 'manager-rubbish_tins', label: 'Rubbish bin emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
      { itemId: 'manager-desk', label: 'Desk wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
      { itemId: 'manager-chair', label: 'Chair wiped', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
      { itemId: 'manager-shelving', label: 'Shelving dusted (no disturbance to items)', category: 'dust', hours: 0.15, difficulty: 'basic' },
      { itemId: 'manager-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' },
      { itemId: 'manager-touchpoints', label: 'Handles, switches, light', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
    ]
```

**Total**: 6 items, ~0.8 hours

---

## 2️⃣ LUNCHROOM / BREAK ROOM ITEMS

### full_lunchroom
```javascript
    'lunchroom': {
      'full': [
        { itemId: 'lunch-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
        { itemId: 'lunch-benches', label: 'Benches wiped', category: 'surfaces', hours: 0.3, difficulty: 'basic' },
        { itemId: 'lunch-sink', label: 'Sink cleaned & sanitized', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
        { itemId: 'lunch-fridge_exterior', label: 'Fridge exterior wiped', category: 'appliances', hours: 0.15, difficulty: 'basic' },
        { itemId: 'lunch-microwave_exterior', label: 'Microwave exterior wiped', category: 'appliances', hours: 0.1, difficulty: 'basic' },
        { itemId: 'lunch-cooktop_exterior', label: 'Cooktop exterior wiped', category: 'appliances', hours: 0.15, difficulty: 'basic' },
        { itemId: 'lunch-table_chairs', label: 'Tables & chairs wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'lunch-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' }
      ]
    },
```

**Total**: 8 items, ~1.35 hours

### kitchenette
```javascript
      'kitchenette': [
        { itemId: 'kitch-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'kitch-benches', label: 'Benches wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'kitch-sink', label: 'Sink cleaned', category: 'fixtures', hours: 0.15, difficulty: 'basic' },
        { itemId: 'kitch-fridge', label: 'Fridge exterior wiped', category: 'appliances', hours: 0.1, difficulty: 'basic' },
        { itemId: 'kitch-appliances', label: 'Small appliances wiped', category: 'appliances', hours: 0.1, difficulty: 'basic' },
        { itemId: 'kitch-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.8 hours

### tea_coffee_station
```javascript
      'tea_station': [
        { itemId: 'tea-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'tea-benches', label: 'Benches wiped', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
        { itemId: 'tea-kettle', label: 'Kettle exterior wiped', category: 'appliances', hours: 0.05, difficulty: 'basic' },
        { itemId: 'tea-coffee_machine', label: 'Coffee machine exterior wiped', category: 'appliances', hours: 0.1, difficulty: 'basic' },
        { itemId: 'tea-sink', label: 'Sink cleaned', category: 'fixtures', hours: 0.1, difficulty: 'basic' },
        { itemId: 'tea-floors', label: 'Floors cleaned', category: 'floors', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.6 hours

### dining_area
```javascript
      'dining_only': [
        { itemId: 'dining-rubbish_tins', label: 'Rubbish bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'dining-tables', label: 'Tables wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'dining-chairs', label: 'Chairs wiped', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
        { itemId: 'dining-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' }
      ]
    }
```

**Total**: 4 items, ~0.6 hours

---

## 3️⃣ TOILET & HYGIENE AREAS

### single_toilet
```javascript
    'toilet_block': {
      'single': [
        { itemId: 'toilet-toilet_clean', label: 'Toilet bowl & tank sanitized', category: 'sanitation', hours: 0.2, difficulty: 'basic' },
        { itemId: 'toilet-sink', label: 'Sink cleaned & sanitized', category: 'sanitation', hours: 0.15, difficulty: 'basic' },
        { itemId: 'toilet-mirror', label: 'Mirror cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'toilet-rolls', label: 'Toilet rolls refilled', category: 'consumables', hours: 0.1, difficulty: 'basic' },
        { itemId: 'toilet-soap', label: 'Soap & hand dryer refilled', category: 'consumables', hours: 0.1, difficulty: 'basic' },
        { itemId: 'toilet-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.8 hours

### toilet_block_2_4 (2-4 cubicles)
```javascript
      'block_2_4': [
        { itemId: 'block2-toilets', label: 'Toilets sanitized', category: 'sanitation', hours: 0.3, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block2-sinks', label: 'Sinks cleaned', category: 'sanitation', hours: 0.2, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block2-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'block2-toilet_rolls', label: 'Toilet rolls refilled', category: 'consumables', hours: 0.15, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block2-soap', label: 'Soap dispensers refilled', category: 'consumables', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block2-hand_dry', label: 'Hand dryer/towel refilled', category: 'consumables', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block2-sanitary_bins', label: 'Sanitary bins emptied & lined', category: 'consumables', hours: 0.15, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block2-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' }
      ]
    },
```

**Total**: 8 items, ~1.3 hours (varies by stalls)

### toilet_block_5_plus (5+ cubicles)
```javascript
      'block_5_plus': [
        { itemId: 'block5-toilets', label: 'Toilets & urinals sanitized', category: 'sanitation', hours: 0.4, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block5-sinks', label: 'Sinks cleaned', category: 'sanitation', hours: 0.25, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block5-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.15, difficulty: 'basic' },
        { itemId: 'block5-toilet_rolls', label: 'Toilet rolls refilled', category: 'consumables', hours: 0.2, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block5-soap', label: 'Soap dispensers refilled', category: 'consumables', hours: 0.15, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block5-hand_dry', label: 'Hand dryer/towel refilled', category: 'consumables', hours: 0.15, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block5-sanitary_bins', label: 'Sanitary bins emptied & lined', category: 'consumables', hours: 0.2, difficulty: 'basic', parameterized: true, parameter: 'number_of_stalls' },
        { itemId: 'block5-sanitiser', label: 'Sanitiser dispensers refilled', category: 'consumables', hours: 0.1, difficulty: 'basic', parameterized: true, parameter: 'number_of_sinks' },
        { itemId: 'block5-grout_check', label: 'Grout lines checked (spot clean if needed)', category: 'detail', hours: 0.15, difficulty: 'basic' },
        { itemId: 'block5-floors', label: 'Floors cleaned', category: 'floors', hours: 0.3, difficulty: 'basic' }
      ]
    },
```

**Total**: 10 items, ~1.75 hours (varies significantly by stalls)

### accessible_toilet
```javascript
      'accessible': [
        { itemId: 'access-toilet', label: 'Toilet & grab rails sanitized', category: 'sanitation', hours: 0.25, difficulty: 'basic' },
        { itemId: 'access-sink', label: 'Sink cleaned', category: 'sanitation', hours: 0.15, difficulty: 'basic' },
        { itemId: 'access-mirror', label: 'Mirror cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'access-rolls', label: 'Toilet rolls refilled', category: 'consumables', hours: 0.1, difficulty: 'basic' },
        { itemId: 'access-soap', label: 'Soap & hand dryer refilled', category: 'consumables', hours: 0.1, difficulty: 'basic' },
        { itemId: 'access-space', label: 'Floor clear & accessible (no clutter)', category: 'organization', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.8 hours

### shower_block
```javascript
      'shower': [
        { itemId: 'shower-heads', label: 'Shower heads cleaned', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
        { itemId: 'shower-floors', label: 'Shower floors cleaned (non-slip check)', category: 'floors', hours: 0.25, difficulty: 'basic' },
        { itemId: 'shower-drains', label: 'Drains cleared', category: 'fixtures', hours: 0.1, difficulty: 'basic' },
        { itemId: 'shower-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'shower-bins', label: 'Bins emptied & lined', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'shower-hooks', label: 'Hooks & rails wiped', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.85 hours

### change_room
```javascript
      'change_room': [
        { itemId: 'change-lockers', label: 'Lockers wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'change-benches', label: 'Benches cleaned', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
        { itemId: 'change-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'change-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'change-bins', label: 'Bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'change-hooks', label: 'Hooks & rails wiped', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
      ]
    }
```

**Total**: 6 items, ~0.85 hours

---

## 4️⃣ CIRCULATION AREAS

### hallway
```javascript
    'circulation': {
      'hallway': [
        { itemId: 'hall-floors', label: 'Floors cleaned', category: 'floors', hours: 0.25, difficulty: 'basic' },
        { itemId: 'hall-skirting', label: 'Skirting/baseboards wiped', category: 'trim', hours: 0.2, difficulty: 'basic' },
        { itemId: 'hall-switches', label: 'Light switches & door handles wiped', category: 'touchpoints', hours: 0.15, difficulty: 'basic' },
        { itemId: 'hall-trash', label: 'Trash removed', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'hall-walls', label: 'Walls spot-checked', category: 'walls', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 5 items, ~0.8 hours

### entryway_foyer
```javascript
      'entryway': [
        { itemId: 'entry-floors', label: 'Floors cleaned (high-traffic areas)', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'entry-doors', label: 'Door handles & frames wiped', category: 'touchpoints', hours: 0.15, difficulty: 'basic' },
        { itemId: 'entry-glass', label: 'Glass wiped (if present)', category: 'glass', hours: 0.15, difficulty: 'basic' },
        { itemId: 'entry-mats', label: 'Entry mats shaken out', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
        { itemId: 'entry-trash', label: 'Trash removed', category: 'bins', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 5 items, ~0.8 hours

### stairwell
```javascript
      'stairwell': [
        { itemId: 'stair-steps', label: 'Steps & landings cleaned', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'stair-handrails', label: 'Handrails sanitized (high-touch)', category: 'touchpoints', hours: 0.2, difficulty: 'basic' },
        { itemId: 'stair-doors', label: 'Doors wiped', category: 'touchpoints', hours: 0.1, difficulty: 'basic' },
        { itemId: 'stair-lights', label: 'Light switches cleaned', category: 'touchpoints', hours: 0.1, difficulty: 'basic' },
        { itemId: 'stair-trash', label: 'Trash removed', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'stair-safety', label: 'Floor texture safe (non-slip check)', category: 'safety', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.9 hours

### elevator
```javascript
      'elevator': [
        { itemId: 'elev-floors', label: 'Floor cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'elev-buttons', label: 'Buttons sanitized', category: 'sanitation', hours: 0.15, difficulty: 'basic' },
        { itemId: 'elev-mirrors', label: 'Mirrors/panels cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
        { itemId: 'elev-doors', label: 'Door frames (interior & exterior)', category: 'touchpoints', hours: 0.15, difficulty: 'basic' },
        { itemId: 'elev-trash', label: 'Trash removed', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'elev-safety', label: 'Floor non-slip check', category: 'safety', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 6 items, ~0.8 hours

### corridor_landing
```javascript
      'corridor': [
        { itemId: 'corr-floors', label: 'Floors cleaned', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'corr-skirting', label: 'Skirting wiped', category: 'trim', hours: 0.2, difficulty: 'basic' },
        { itemId: 'corr-doors', label: 'Multiple doors wiped', category: 'touchpoints', hours: 0.2, difficulty: 'basic', parameterized: true, parameter: 'number_of_doors' },
        { itemId: 'corr-lights', label: 'Light switches cleaned', category: 'touchpoints', hours: 0.1, difficulty: 'basic' },
        { itemId: 'corr-handrails', label: 'Handrails wiped (if present)', category: 'touchpoints', hours: 0.15, difficulty: 'basic' },
        { itemId: 'corr-trash', label: 'Trash removed', category: 'bins', hours: 0.1, difficulty: 'basic' }
      ]
    }
```

**Total**: 6 items, ~1.05 hours (varies by doors)

---

## 5️⃣ UTILITY / SUPPORT AREAS

### cleaner_cupboard
```javascript
    'utility': {
      'cleaner_cupboard': [
        { itemId: 'clean-floors', label: 'Floors swept & mopped', category: 'floors', hours: 0.15, difficulty: 'basic' },
        { itemId: 'clean-shelves', label: 'Shelves organized (minimal disturbance)', category: 'organization', hours: 0.1, difficulty: 'basic' },
        { itemId: 'clean-trash', label: 'Trash removed', category: 'bins', hours: 0.05, difficulty: 'basic' },
        { itemId: 'clean-sink', label: 'Sink cleaned (if present)', category: 'fixtures', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.4 hours

### storage_room
```javascript
      'storage': [
        { itemId: 'storage-floors', label: 'Floors swept & spot mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'storage-shelves', label: 'Shelf fronts wiped (no disturbance)', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
        { itemId: 'storage-vents', label: 'Air vents checked', category: 'air', hours: 0.1, difficulty: 'basic' },
        { itemId: 'storage-items', label: 'Items not rearranged (verified)', category: 'organization', hours: 0, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.45 hours

### filing_room
```javascript
      'filing': [
        { itemId: 'filing-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' },
        { itemId: 'filing-vents', label: 'Air circulation checked', category: 'air', hours: 0.1, difficulty: 'basic' },
        { itemId: 'filing-shelf_fronts', label: 'Shelf fronts dusted', category: 'dust', hours: 0.15, difficulty: 'basic' },
        { itemId: 'filing-files', label: 'Files not accessed (verified)', category: 'organization', hours: 0, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.4 hours

### it_server_room
```javascript
      'it_server': [
        { itemId: 'it-floors', label: 'Floors cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' },
        { itemId: 'it-vents', label: 'Vent areas clear', category: 'air', hours: 0.1, difficulty: 'basic' },
        { itemId: 'it-cables', label: 'Cable paths clear & organized', category: 'organization', hours: 0.15, difficulty: 'basic' },
        { itemId: 'it-touch', label: 'No equipment touched (verified)', category: 'safety', hours: 0, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.4 hours

### print_copy_room
```javascript
      'print_copy': [
        { itemId: 'print-floors', label: 'Floors swept', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'print-around_equipment', label: 'Area around equipment (no touching)', category: 'surfaces', hours: 0.15, difficulty: 'basic' },
        { itemId: 'print-feed_area', label: 'Paper feed area clear', category: 'organization', hours: 0.1, difficulty: 'basic' },
        { itemId: 'print-trash', label: 'Paper/toner bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.55 hours

### mechanical_room
```javascript
      'mechanical': [
        { itemId: 'mech-floors', label: 'Floors swept', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'mech-vents', label: 'Vent paths clear', category: 'air', hours: 0.15, difficulty: 'basic' },
        { itemId: 'mech-around', label: 'Area around equipment (no touching)', category: 'organization', hours: 0.1, difficulty: 'basic' },
        { itemId: 'mech-visual', label: 'Visual check only (verified)', category: 'safety', hours: 0, difficulty: 'basic' }
      ]
    }
```

**Total**: 4 items, ~0.45 hours

---

## 6️⃣ WAREHOUSE / INDUSTRIAL AREAS

### warehouse_floor
```javascript
    'warehouse': {
      'warehouse_floor': [
        { itemId: 'ware-sweep', label: 'Sweep large area', category: 'floors', hours: 0.5, difficulty: 'basic' },
        { itemId: 'ware-safety', label: 'Safety lines checked', category: 'safety', hours: 0.15, difficulty: 'basic' },
        { itemId: 'ware-spot_mop', label: 'Spot mop (if stained)', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'ware-bins', label: 'Bins lined & positioned', category: 'bins', hours: 0.15, difficulty: 'basic', parameterized: true, parameter: 'number_of_bins' },
        { itemId: 'ware-hazard', label: 'Floor hazard check (no spills)', category: 'safety', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 5 items, ~1.1 hours

### loading_bay
```javascript
      'loading_bay': [
        { itemId: 'load-sweep', label: 'Sweep (outdoor & covered areas)', category: 'floors', hours: 0.4, difficulty: 'basic' },
        { itemId: 'load-door', label: 'Roll-up door wiped', category: 'touchpoints', hours: 0.2, difficulty: 'basic' },
        { itemId: 'load-ground', label: 'Ground level cleaned', category: 'floors', hours: 0.15, difficulty: 'basic' },
        { itemId: 'load-bins', label: 'Ground bins positioned', category: 'bins', hours: 0.15, difficulty: 'basic' },
        { itemId: 'load-safety', label: 'Safety markings checked', category: 'safety', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 5 items, ~1.0 hours

### dispatch_area
```javascript
      'dispatch': [
        { itemId: 'disp-surfaces', label: 'Work surfaces wiped', category: 'surfaces', hours: 0.25, difficulty: 'basic' },
        { itemId: 'disp-sweep', label: 'Floors swept', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'disp-trash', label: 'Trash & packaging removed', category: 'bins', hours: 0.15, difficulty: 'basic' },
        { itemId: 'disp-debris', label: 'Package debris cleared', category: 'organization', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.7 hours

### racking_aisles
```javascript
      'racking_aisles': [
        { itemId: 'rack-sweep', label: 'Sweep between racks', category: 'floors', hours: 0.35, difficulty: 'basic' },
        { itemId: 'rack-aisle_safety', label: 'Aisle safety checked', category: 'safety', hours: 0.1, difficulty: 'basic' },
        { itemId: 'rack-hazard', label: 'Floor hazard check (no spills)', category: 'safety', hours: 0.1, difficulty: 'basic' },
        { itemId: 'rack-high_dust', label: 'High-dust areas swept (high shelving)', category: 'dust', hours: 0.2, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.75 hours

### packaging_area
```javascript
      'packaging': [
        { itemId: 'pack-bench', label: 'Benches wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'pack-sweep', label: 'Floors swept', category: 'floors', hours: 0.25, difficulty: 'basic' },
        { itemId: 'pack-supplies', label: 'Packing supplies organized', category: 'organization', hours: 0.15, difficulty: 'basic' },
        { itemId: 'pack-trash', label: 'Trash & waste removed', category: 'bins', hours: 0.15, difficulty: 'basic' }
      ]
    }
```

**Total**: 4 items, ~0.75 hours

---

## 7️⃣ WORKSHOP / TRADE AREAS

### workshop_floor
```javascript
    'workshop': {
      'workshop_floor': [
        { itemId: 'work-sweep', label: 'Sweep (heavy debris)', category: 'floors', hours: 0.4, difficulty: 'basic' },
        { itemId: 'work-grease', label: 'Grease spots treated (if any)', category: 'stains', hours: 0.2, difficulty: 'basic' },
        { itemId: 'work-safety', label: 'Floor safety check', category: 'safety', hours: 0.15, difficulty: 'basic' },
        { itemId: 'work-drain', label: 'Drain clear (if present)', category: 'fixtures', hours: 0.1, difficulty: 'basic' },
        { itemId: 'work-bins', label: 'Bins emptied', category: 'bins', hours: 0.15, difficulty: 'basic' }
      ]
    },
```

**Total**: 5 items, ~1.0 hours

### tool_room
```javascript
      'tool_room': [
        { itemId: 'tool-shelf', label: 'Shelving tidied (no disturbance)', category: 'organization', hours: 0.15, difficulty: 'basic' },
        { itemId: 'tool-sweep', label: 'Floors swept', category: 'floors', hours: 0.15, difficulty: 'basic' },
        { itemId: 'tool-bins', label: 'Bins emptied', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'tool-dust', label: 'Minimal dust (no disturbance to items)', category: 'dust', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.5 hours

### parts_storage
```javascript
      'parts_storage': [
        { itemId: 'parts-shelf', label: 'Shelving (organized, no disturbance)', category: 'organization', hours: 0.15, difficulty: 'basic' },
        { itemId: 'parts-sweep', label: 'Floors swept', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'parts-bins', label: 'Bins organized', category: 'bins', hours: 0.1, difficulty: 'basic' },
        { itemId: 'parts-aisles', label: 'Aisle clearance verified', category: 'safety', hours: 0.1, difficulty: 'basic' }
      ]
    },
```

**Total**: 4 items, ~0.55 hours

### wash_down_area
```javascript
      'wash_down': [
        { itemId: 'wash-sweep', label: 'Sweep & remove heavy debris', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'wash-grease', label: 'Grease/dirt removal', category: 'stains', hours: 0.25, difficulty: 'basic' },
        { itemId: 'wash-drain', label: 'Drain clear', category: 'fixtures', hours: 0.15, difficulty: 'basic' },
        { itemId: 'wash-hose', label: 'Hose & equipment tidied', category: 'organization', hours: 0.15, difficulty: 'basic' }
      ]
    }
```

**Total**: 4 items, ~0.85 hours

---

## SUMMARY TABLE

| Room Type | Variant | Items | Hours | Difficulty | Notes |
|---|---|---|---|---|---|
| Office | open_plan | 6 | 1.05 | basic | Scales with section |
| Office | private | 6 | 0.8 | basic | Per office |
| Office | boardroom | 6 | 0.85 | basic | Conference/meeting |
| Office | hot_desk | 6 | 1.15 | basic | Higher sanitation |
| Office | reception | 6 | 0.95 | basic | Customer-facing |
| Office | manager | 6 | 0.8 | basic | Per office |
| Lunchroom | full | 8 | 1.35 | basic | Multiple appliances |
| Lunchroom | kitchenette | 6 | 0.8 | basic | Minimal |
| Lunchroom | tea_station | 6 | 0.6 | basic | Beverages only |
| Lunchroom | dining_only | 4 | 0.6 | basic | No prep |
| Toilet | single | 6 | 0.8 | basic | 1 stall |
| Toilet | block_2_4 | 8 | 1.3 | basic | 2-4 stalls, parameterized |
| Toilet | block_5_plus | 10 | 1.75 | basic | 5+ stalls, parameterized |
| Toilet | accessible | 6 | 0.8 | basic | ADA/DDA |
| Toilet | shower | 6 | 0.85 | basic | Fitness/trades |
| Toilet | change_room | 6 | 0.85 | basic | Lockers, benches |
| Circulation | hallway | 5 | 0.8 | basic | Standard corridor |
| Circulation | entryway | 5 | 0.8 | basic | High-traffic |
| Circulation | stairwell | 6 | 0.9 | basic | Multi-level |
| Circulation | elevator | 6 | 0.8 | basic | If present |
| Circulation | corridor | 6 | 1.05 | basic | Long runs |
| Utility | cleaner_cupboard | 4 | 0.4 | basic | Supplies |
| Utility | storage | 4 | 0.45 | basic | Minimal disturbance |
| Utility | filing | 4 | 0.4 | basic | Document storage |
| Utility | it_server | 4 | 0.4 | basic | No touching |
| Utility | print_copy | 4 | 0.55 | basic | Equipment area |
| Utility | mechanical | 4 | 0.45 | basic | Visual only |
| Warehouse | warehouse_floor | 5 | 1.1 | basic | Large area |
| Warehouse | loading_bay | 5 | 1.0 | basic | Outdoor + covered |
| Warehouse | dispatch | 4 | 0.7 | basic | Packing area |
| Warehouse | racking_aisles | 4 | 0.75 | basic | Tall storage |
| Warehouse | packaging | 4 | 0.75 | basic | Assembly |
| Workshop | workshop_floor | 5 | 1.0 | basic | Heavy debris |
| Workshop | tool_room | 4 | 0.5 | basic | Storage |
| Workshop | parts_storage | 4 | 0.55 | basic | Components |
| Workshop | wash_down | 4 | 0.85 | basic | Grease control |

---

## NEXT STEP: Hour 1-3 Sprint

Ready to code ITEM_DEFINITIONS.js with all 28 room variants + consumables tracking.

**Key Implementations**:
- ✅ Base items for all room types
- ✅ Consumables in bathrooms (toilet rolls, sanitary bins, soap, hand dryers, sanitiser)
- ✅ Parameterized "rubbish_tins" item (number of bins input)
- ✅ Medical difficulty escalation (change bathroom items to 'medium' difficulty for medical sites)
- ✅ Production rate: 400 items/hour (standard commercial)

