# Commercial Settings & Production Rate Specifications

**Purpose**: Define commercial service classifications and production rate formulas  
**Used By**: Hour 1-3 Sprint (ITEM_DEFINITIONS.js variants), AysChecklistFormFactory (settings phase)  
**Status**: Specification (settings-level decisions before room generation)

---

## Production Rate: The Foundation

### Base Rate: 400 sq ft per hour

**Historical Data**: Measured ~20 years ago, remains accurate today (workers maintain same pace).

**Conversion to Metrics**:
- 400 sq ft ≈ **37 square meters** per hour
- 1 sq meter ≈ 0.01075 hours ≈ 38.7 seconds

**Formula**:
```
Total Labor Hours = (Property Square Footage ÷ 400) × Difficulty Multiplier
```

**Examples**:
- 2,000 sq ft office: 2000 ÷ 400 = 5 base hours
- 4,000 sq ft warehouse: 4000 ÷ 400 = 10 base hours
- 8,000 sq ft shopping mall: 8000 ÷ 400 = 20 base hours

---

## Commercial Classification: Settings-Level Decision

**Like domestic has EOT vs Residential**, commercial has **Light vs Heavy** classifications.

This is set during SETTINGS phase (before form generation), not during room selection.

---

## LIGHT COMMERCIAL

**Definition**: Office spaces, small warehouses, light trading businesses.  
**Characteristics**: Lower traffic density, standard sanitation, consistent difficulty.  
**Rooms**: Offices, small lunchroom, basic toilet block, warehouse/dispatch area.

### Light Commercial Room Universe

```
Typical Light Commercial Space (2,000-3,000 sq ft):
├─ Reception + Office Areas (1,000 sq ft)
│  ├─ Reception/waiting
│  ├─ 2-3 small offices
│  └─ Boardroom
├─ Lunchroom (200 sq ft)
│  └─ Kitchenette or small lunch area
├─ Toilet block (150 sq ft)
│  └─ Single or 2-stall block
├─ Circulation (400 sq ft)
│  ├─ Hallway
│  ├─ Entryway
│  └─ Corridors
└─ Utility + Storage (250 sq ft)
   ├─ Cleaner cupboard
   └─ Storage room
```

### Light Commercial Item Characteristics

- **Difficulty**: All 'basic' (no escalation)
- **Consumables**: Standard (toilet rolls, soap, hand dryer)
- **Parameterization**: Minimal (just number of bins, stalls)
- **Labor Multiplier**: 1.0x (standard 400 sq ft/hour)
- **Production Rate**: **400 sq ft per hour** (standard)

### Light Commercial Example: 2,500 sq ft Office

```
Rooms generated:
├─ Reception (1 card, 6 items)
├─ Office 1 (1 card, 6 items)
├─ Office 2 (1 card, 6 items)
├─ Boardroom (1 card, 6 items)
├─ Lunchroom/Kitchenette (1 card, 6 items)
├─ Toilet block 2-stall (1 card, 8 items)
├─ Hallway (1 card, 5 items)
├─ Entryway (1 card, 5 items)
├─ Cleaner cupboard (1 card, 4 items)
└─ Storage room (1 card, 4 items)

Total: 10 cards, ~57 items
Labor: 2,500 ÷ 400 = 6.25 base hours
Multiplier: 1.0x
Estimated Total: ~6.25 hours @ $rate_per_hour
```

---

## HEAVY COMMERCIAL

**Definition**: Shopping malls, multi-level office parks, large industrial complexes, high-traffic facilities.  
**Characteristics**: High traffic density, elevated sanitation, mixed difficulty levels, consumables management.  
**Rooms**: Multiple office sections, full kitchens, large toilet blocks, warehouse areas, specialized zones.

### Heavy Commercial Room Universe

```
Typical Heavy Commercial Space (8,000-15,000 sq ft):
├─ Reception + Lobby (1,500 sq ft)
│  ├─ Reception/concierge area
│  ├─ Waiting area
│  └─ Elevator lobby (×2 maybe)
├─ Office Areas (4,000 sq ft)
│  ├─ Open-plan (2,000 sq ft, ~20 desks)
│  ├─ Private offices (×6-8)
│  ├─ Boardroom (×2)
│  └─ Manager offices (×2)
├─ Lunchroom (400 sq ft)
│  └─ Full lunchroom (large)
├─ Toilet blocks (600 sq ft)
│  ├─ Male block (5+ stalls)
│  ├─ Female block (5+ stalls, sanitary bins)
│  └─ Accessible toilet
├─ Circulation (1,200 sq ft)
│  ├─ Main hallway
│  ├─ Stairwell
│  ├─ Elevators (×2)
│  └─ Corridors (multiple)
├─ Utility (800 sq ft)
│  ├─ IT/Server room
│  ├─ File storage
│  ├─ Print/copy room
│  ├─ Cleaner cupboard
│  └─ Mechanical room
└─ Optional Warehouse/Loading (Variable)
   └─ Loading bay, dispatch
```

### Heavy Commercial Item Characteristics

- **Difficulty**: Mixed (basic + medium/deep for high-touch areas)
  - Toilets: **medium** (higher sanitation protocol)
  - Reception/lobby: **medium** (customer-facing, high-traffic)
  - Offices: **basic** (standard)
  - Warehouse: **basic** (standard labor)
- **Consumables**: Elevated tracking
  - Multiple sanitary bins per bathroom
  - Sanitiser dispensers (hospital-grade for some facilities)
  - Frequent refills tracked
- **Parameterization**: Extensive
  - Number of bins (per section)
  - Number of stalls (per gender, accessibility)
  - Number of desks (open-plan scaling)
  - Number of doors (corridor parameterization)
- **Labor Multiplier**: 1.2x - 1.4x (difficulty escalation)
- **Production Rate**: **330-340 sq ft per hour** (slower due to complexity)

### Heavy Commercial Example: 10,000 sq ft Shopping Mall Entry

```
Rooms generated:
├─ Reception/Lobby (1 card, 6 items)
├─ Open-plan office (1 card, 6 items per section, ×2 sections)
├─ Private office (×6, 1 card each, 6 items)
├─ Boardroom (×2, 1 card each, 6 items)
├─ Manager office (×2, 1 card each, 6 items)
├─ Full Lunchroom (1 card, 8 items)
├─ Male toilet block 5-stall (1 card, 10 items, MEDIUM difficulty)
├─ Female toilet block 5-stall (1 card, 10 items, MEDIUM difficulty)
├─ Accessible toilet (1 card, 6 items)
├─ Main hallway (1 card, 5 items)
├─ Stairwell (1 card, 6 items)
├─ Elevators (×2, 1 card each, 6 items)
├─ Corridors (×3, 1 card each, 6 items)
├─ IT/Server room (1 card, 4 items)
├─ File storage (1 card, 4 items)
├─ Print/copy room (1 card, 4 items)
├─ Cleaner cupboard (1 card, 4 items)
└─ Mechanical room (1 card, 4 items)

Total: 27 cards, ~160+ items
Base Labor: 10,000 ÷ 400 = 25 hours
Difficulty Multiplier: 1.25x (some medium items)
Estimated Total: ~31 hours @ $rate_per_hour × 1.25x premium
```

---

## Commercial vs Domestic: Parallel Structure

**Pattern from Domestic Proven Here**:

### Domestic Settings
```
SERVICE TYPE set first:
├─ EOT (end of tenancy)
│  └─ Deep clean, empty property, high scrutiny
├─ Residential
│  └─ Routine, occupied home, lighter touch
└─ Commercial
   └─ [NEW] Light vs Heavy distinction
```

### Commercial Sub-Settings
```
COMMERCIAL SERVICE TYPE → Classification set in settings:
├─ Light Commercial
│  ├─ Production: 400 sq ft/hour (1.0x multiplier)
│  ├─ Difficulty: All basic
│  ├─ Rooms: Standard office, small warehouse
│  └─ Consumables: Basic (toilet rolls, soap)
└─ Heavy Commercial
   ├─ Production: 330-340 sq ft/hour (1.2-1.4x multiplier)
   ├─ Difficulty: Mixed (basic + medium for high-traffic)
   ├─ Rooms: Multiple sections, large blocks, specialized areas
   └─ Consumables: Elevated (sanitiser, refills, multiple stalls)
```

**Just like**:
```
DOMESTIC SERVICE TYPE → Variant set in settings:
├─ EOT
│  └─ Items: Deep clean focus, ceiling decobing
└─ Residential
   └─ Items: Routine focus, change linens option
```

---

## Settings Form: Commercial Classification

**When user selects "Commercial" service type**, ask:

```
Commercial Cleaning Type:
⚪ Light Commercial
   └─ Offices, small warehouses, small retail
   └─ Production: 400 sq ft/hour
   └─ Standard sanitation

⚪ Heavy Commercial
   └─ Shopping malls, large office parks, multi-level
   └─ Production: 330-340 sq ft/hour (escalated difficulty)
   └─ Elevated sanitation (hospital-grade in some areas)
```

**Then ask**:
```
Property size:
[______] Square feet (or convert to square meters)

Example: 5,000 sq ft office = 5000 ÷ 400 = 12.5 hours base
```

---

## Item Generation Rules by Classification

### LIGHT COMMERCIAL RULES

```javascript
// In AysChecklistFormFactory (commercial branch)
if (commercial_classification === 'light') {
  // Rule 1: All difficulty = 'basic'
  items.forEach(item => item.difficulty = 'basic');
  
  // Rule 2: No difficulty multiplier
  laborHoursMultiplier = 1.0;
  
  // Rule 3: Standard bathroom consumables (not elevated)
  // Toilet rolls, soap, hand dryer
  // NO sanitiser dispensers, NO extra bins
  
  // Rule 4: Minimal parameterization
  // Just: number_of_bins, number_of_stalls
  
  // Rule 5: Rooms are simpler variants
  // Small toilet blocks (single, 2-4 stalls)
  // Small lunchroom (kitchenette, tea station)
  // Few offices (1-3)
}
```

### HEAVY COMMERCIAL RULES

```javascript
if (commercial_classification === 'heavy') {
  // Rule 1: Difficulty escalation
  // Toilets = 'medium'
  // Reception/lobby = 'medium'
  // Offices = 'basic'
  // Warehouse = 'basic'
  
  // Rule 2: Difficulty multiplier
  laborHoursMultiplier = 1.25; // 1.2-1.4 range
  
  // Rule 3: Elevated bathroom consumables
  // Toilet rolls (per stall)
  // Sanitiser dispensers (per sink) [MEDIUM difficulty]
  // Sanitary bins (per stall, MEDIUM difficulty)
  // Hand dryer/towels (per sink)
  // Soap (per sink)
  
  // Rule 4: Extensive parameterization
  // number_of_bins (per section)
  // number_of_stalls (per gender)
  // number_of_desks (open-plan sections)
  // number_of_doors (corridor sections)
  
  // Rule 5: Rooms are complex variants
  // Large toilet blocks (5+ stalls, male/female/accessible)
  // Full lunchroom (with appliance details)
  // Many offices (6-20+)
  // Multiple circulation sections
  // Warehouse + dispatch areas
}
```

---

## Labor Calculation Formula

```
TOTAL LABOR HOURS = (Property Square Footage ÷ 400) × Difficulty Multiplier

Where:
- Property Square Footage: User input
- 400 sq ft/hour: Base production rate
- Difficulty Multiplier: 1.0x (Light) or 1.2-1.4x (Heavy)
```

**Example Calculations**:

### Light Commercial
```
5,000 sq ft office
= (5,000 ÷ 400) × 1.0
= 12.5 × 1.0
= 12.5 hours labor
```

### Heavy Commercial
```
10,000 sq ft shopping mall entry
= (10,000 ÷ 400) × 1.25
= 25 × 1.25
= 31.25 hours labor
```

---

## Settings Flow (Updated)

```
┌─ SERVICE TYPE ──────────────────┐
│  ⚪ EOT (domestic)              │
│  ⚪ Residential (domestic)       │
│  ⚪ Commercial ─────────────────┐
│                                │
│  COMMERCIAL CLASSIFICATION     │
│  ⚪ Light Commercial            │
│  ⚪ Heavy Commercial            │
│                                │
│  PROPERTY SIZE                 │
│  [_____] sq ft or sq meters    │
│                                │
│  ROOM SELECTION                │
│  (Generated based on           │
│   classification + size)       │
│                                │
│  FORM GENERATION               │
│  (Items generated with correct │
│   difficulty, consumables,     │
│   parameterization)            │
└────────────────────────────────┘
```

---

## Summary: Light vs Heavy

| Aspect | Light Commercial | Heavy Commercial |
|--------|---|---|
| **Rooms** | Small offices, basic warehouse | Multiple sections, multi-level, specialized |
| **Offices** | 1-3 private offices, maybe open-plan | 6-20+ offices, multiple open-plan sections |
| **Toilet Block** | Single or 2-4 stalls | 5+ stalls per gender, accessible, +shower/change |
| **Lunchroom** | Kitchenette or tea station | Full lunchroom with appliances |
| **Circulation** | Basic (hallway, entryway) | Complex (multiple stairwells, elevators, corridors) |
| **Warehouse** | Light warehouse or dispatch only | Multiple warehouse sections, loading bay |
| **Difficulty** | All 'basic' | Mixed (basic + medium) |
| **Consumables** | Standard (toilet rolls, soap) | Elevated (sanitiser, multiple bins, refill tracking) |
| **Production Rate** | 400 sq ft/hour (1.0x) | 330-340 sq ft/hour (1.2-1.4x) |
| **Parameterization** | Minimal | Extensive |
| **Example Size** | 2,000-3,000 sq ft | 8,000-15,000+ sq ft |
| **Typical Items** | ~50 items | ~160+ items |
| **Typical Hours** | 5-7 hours | 25-40 hours |

---

## Next: Hour 1-3 Sprint

Ready to code ITEM_DEFINITIONS.js with:
- ✅ Light commercial room variants (all basic difficulty)
- ✅ Heavy commercial room variants (mixed difficulty, elevated consumables)
- ✅ Both use same production rate formula (400 sq ft/hour base)
- ✅ Difficulty multiplier applied at AysChecklistFormFactory level (not item level)

